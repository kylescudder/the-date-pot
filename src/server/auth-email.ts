import { createHash } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { APIError } from 'better-auth/api'
import type { Orm } from './db'
import { authEmailLimit } from './db/auth-schema'

// Persistent, atomic per-recipient cooldown/hour limits and per-app delivery
// budget. Reserve before Better Auth rotates the OTP, preserving the previous
// code when an impatient resend is refused. Do not hold a DB slot during SMTP.
export async function reserveEmailDelivery(
  database: Orm,
  email: string,
  dailyLimit: number
) {
  const recipient = createHash('sha256')
    .update(email.trim().toLowerCase())
    .digest('hex')
  const now = new Date()
  const limits = [
    { key: 'global:day', seconds: 86400, max: dailyLimit },
    { key: `recipient:${recipient}:hour`, seconds: 3600, max: 5 },
    { key: `recipient:${recipient}:minute`, seconds: 60, max: 1 }
  ]
  await database.transaction(async (transaction) => {
    for (const limit of limits) {
      const expired = sql`${authEmailLimit.windowStartedAt} <= ${new Date(now.getTime() - limit.seconds * 1000).toISOString()}`
      const [reserved] = await transaction
        .insert(authEmailLimit)
        .values({ key: limit.key, count: 1, windowStartedAt: now })
        .onConflictDoUpdate({
          target: authEmailLimit.key,
          set: {
            count: sql`CASE WHEN ${expired} THEN 1 ELSE ${authEmailLimit.count} + 1 END`,
            windowStartedAt: sql`CASE WHEN ${expired} THEN ${now.toISOString()}::timestamptz ELSE ${authEmailLimit.windowStartedAt} END`
          },
          setWhere: sql`${expired} OR ${authEmailLimit.count} < ${limit.max}`
        })
        .returning({ count: authEmailLimit.count })
      if (!reserved)
        throw new APIError('TOO_MANY_REQUESTS', {
          message: 'Please wait before requesting another sign-in email.'
        })
    }
  })
}

type MailConfig = { apiKey: string; from: string }

async function deliver(
  config: MailConfig,
  email: string,
  message: { subject: string; text: string; html: string }
) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      signal: AbortSignal.timeout(8000),
      headers: { 'api-key': config.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: { email: config.from, name: 'The Date Pot' },
        to: [{ email }],
        subject: message.subject,
        textContent: message.text,
        htmlContent: message.html,
        tags: ['the-date-pot-auth']
      })
    })
    if (!response.ok) throw new Error('Provider rejected sign-in email')
  } catch {
    // Never log provider responses, API keys, OTPs, links or message content.
    throw new APIError('SERVICE_UNAVAILABLE', {
      message: 'The sign-in email could not be sent. Please try again later.'
    })
  }
}

// Branded, table-based layout: email clients ignore most modern CSS, and many
// (Gmail included) do not render SVG, so the logo is a PNG served by the app.
// The Date Pot's app icon purple on its dark launch background.
const brand = {
  name: 'The Date Pot',
  accent: '#877eff',
  accentDark: '#5b52d6',
  tint: '#f1f0ff',
  tintBorder: '#d9d6ff',
  ink: '#1e1e2e',
  muted: '#6b7280',
  background: '#121417',
  gradient: 'linear-gradient(160deg,#121417 0%,#1e1e2e 60%,#2a2550 100%)',
  footer: '#a6adc8',
  footerLink: '#cba6f7'
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function layout({
  origin,
  preheader,
  heading,
  body
}: {
  origin: string
  preheader: string
  heading: string
  body: string
}) {
  const site = new URL(origin)
  const font =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${brand.background}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${brand.background}" style="background:${brand.background};background-image:${brand.gradient}">
<tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px">
<tr><td align="center" style="padding:0 8px 24px">
<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="padding-right:12px;vertical-align:middle"><img src="${origin}/email-logo.png" width="40" height="40" alt="" style="display:block;border:0;border-radius:10px"></td>
<td style="vertical-align:middle;font-family:${font};font-size:22px;font-weight:700;color:#ffffff">${brand.name}</td>
</tr></table>
</td></tr>
<tr><td align="center" bgcolor="#ffffff" style="background:#ffffff;border-top:4px solid ${brand.accent};border-radius:16px;padding:32px 28px;text-align:center;font-family:${font};color:${brand.ink}">
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;font-weight:700;color:${brand.ink}">${escapeHtml(heading)}</h1>
${body}
</td></tr>
<tr><td align="center" style="padding:24px 8px 0;text-align:center;font-family:${font};font-size:12px;line-height:1.6;color:${brand.footer}">
You’re receiving this because someone asked to sign in to ${brand.name} with this address.<br>
<a href="${origin}" style="color:${brand.footerLink};text-decoration:underline">${site.host}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

const paragraph = (text: string, color: string = brand.ink) =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${color}">${text}</p>`

export function renderCodeEmail(origin: string, otp: string) {
  // Only validated generated six-digit codes are interpolated into the template.
  if (!/^\d{6}$/.test(otp)) throw new Error('Invalid sign-in code format')
  return {
    subject: `${otp} is your Date Pot sign-in code`,
    text: `Your ${brand.name} sign-in code is ${otp}.\n\nIt expires in 10 minutes and can be used once. If you did not request this code, ignore this email.\n\n${origin}`,
    html: layout({
      origin,
      preheader: `Your sign-in code is ${otp}. It expires in 10 minutes.`,
      heading: 'Your sign-in code',
      body:
        paragraph('Enter this code to open your date pot.') +
        `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px"><tr><td align="center" bgcolor="${brand.tint}" style="background:${brand.tint};border:1px solid ${brand.tintBorder};border-radius:12px;padding:20px 2px 20px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:10px;color:${brand.accentDark}">${otp}</td></tr></table>` +
        paragraph('It expires in 10 minutes and can be used once.') +
        paragraph(
          'If you didn’t request this code, you can ignore this email.',
          brand.muted
        )
    })
  }
}

export async function sendLoginEmail(
  config: MailConfig,
  origin: string,
  email: string,
  otp: string
) {
  await deliver(config, email, renderCodeEmail(origin, otp))
}

export type LinkEmailKind = 'magic-link' | 'reset-password' | 'verify-email'

const linkCopy: Record<
  LinkEmailKind,
  {
    subject: string
    heading: string
    intro: string
    action: string
    expiry: string
  }
> = {
  'magic-link': {
    subject: 'Your Date Pot sign-in link',
    heading: 'Sign in to The Date Pot',
    intro: 'Tap the button below to sign in and open your date pot.',
    action: 'Sign in',
    expiry: 'This link expires in 10 minutes and can be used once.'
  },
  'reset-password': {
    subject: 'Set your Date Pot password',
    heading: 'Set your password',
    intro: 'Tap the button below to choose a new password for The Date Pot.',
    action: 'Set password',
    expiry: 'This link expires in 30 minutes and can be used once.'
  },
  'verify-email': {
    subject: 'Confirm your Date Pot email',
    heading: 'Confirm your email',
    intro:
      'Tap the button below to confirm this address and finish creating your Date Pot account.',
    action: 'Confirm email',
    expiry: 'This link expires in 1 hour and can be used once.'
  }
}

export function renderLinkEmail(
  origin: string,
  kind: LinkEmailKind,
  url: string
) {
  // Links are generated by Better Auth; refuse anything not on this origin so a
  // misconfiguration can never mail out a link to another site.
  const parsed = new URL(url)
  if (parsed.origin !== origin)
    throw new Error('Unexpected sign-in link origin')
  const href = escapeHtml(parsed.href)
  const copy = linkCopy[kind]
  return {
    subject: copy.subject,
    text: `${copy.intro}\n\n${parsed.href}\n\n${copy.expiry} If you did not request this, ignore this email.`,
    html: layout({
      origin,
      preheader: `${copy.intro} ${copy.expiry}`,
      heading: copy.heading,
      body:
        paragraph(copy.intro) +
        `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:8px auto 24px"><tr><td bgcolor="${brand.accentDark}" style="background:${brand.accentDark};border-radius:10px"><a href="${href}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px">${copy.action}</a></td></tr></table>` +
        paragraph(copy.expiry) +
        paragraph(
          `Button not working? Copy this link into your browser:<br><a href="${href}" style="color:${brand.accentDark};word-break:break-all">${href}</a>`,
          brand.muted
        ) +
        paragraph(
          'If you didn’t request this, you can ignore this email.',
          brand.muted
        )
    })
  }
}

export async function sendLinkEmail(
  config: MailConfig,
  origin: string,
  email: string,
  kind: LinkEmailKind,
  url: string
) {
  await deliver(config, email, renderLinkEmail(origin, kind, url))
}

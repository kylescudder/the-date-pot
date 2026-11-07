// After any sign-in method, return to the pot list (the signed-in home). A
// same-site `?redirectTo=` on the auth route (e.g. from /beers) takes priority.
export const appHome = '/'

const hasUnsafeCharacters = (value: string) =>
  [...value].some((character) => {
    const code = character.charCodeAt(0)
    return code < 0x20 || code === 0x7f || character === '\\'
  })

// Better Auth UI reads `?redirectTo=` from the URL as-is. Only follow
// same-site paths so a crafted link cannot send someone off-site after sign-in.
// Resolve against a placeholder origin instead of prefix-checking the string:
// URL parsing strips tabs/newlines, so `/\t/evil.example` is not a safe path.
const placeholder = 'https://thedatepot.invalid'
export function safeAppPath(to: string) {
  if (!to.startsWith('/') || hasUnsafeCharacters(to)) return appHome
  if (!URL.canParse(to, placeholder)) return appHome
  const url = new URL(to, placeholder)
  // `/.//evil.example/` keeps the origin but normalises to the path
  // `//evil.example/`, which a browser reads as another host.
  return url.origin === placeholder && !url.pathname.startsWith('//')
    ? url.pathname + url.search + url.hash
    : appHome
}

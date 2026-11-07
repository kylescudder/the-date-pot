const nameField = (name: string, label: string) => ({
  name,
  type: 'string' as const,
  label,
  defaultValue: '',
  validateDebounceMs: 0,
  validate: (value: unknown) => {
    if (typeof value === 'string' && value.length > 100)
      throw new Error('Use up to 100 characters.')
  }
})

// Optional first/last names alongside the display name other members see, and
// the account's verified email (read-only: email changes are disabled).
export const profileFields = [
  nameField('givenName', 'First name'),
  nameField('familyName', 'Last name'),
  {
    name: 'email',
    type: 'string' as const,
    label: 'Verified email',
    readOnly: true,
    copyable: true
  }
]

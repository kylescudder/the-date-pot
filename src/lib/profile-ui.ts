import { prepareAvatar, uploadAvatar, deleteAvatar } from './profile'

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

// The photo is cropped and shrunk in the browser, then validated and
// re-encoded again on the server, which owns the stored image URL.
export const profileAvatar = {
  enabled: true,
  size: 512,
  extension: 'jpg' as const,
  resize: async (file: File) =>
    new File([await prepareAvatar(file)], 'avatar.jpg', { type: 'image/jpeg' }),
  upload: uploadAvatar,
  delete: deleteAvatar
}

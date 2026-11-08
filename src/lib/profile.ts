const avatarEndpoint = '/api/profile/avatar'

async function avatarRequest(init: RequestInit) {
  const response = await fetch(avatarEndpoint, {
    credentials: 'same-origin',
    ...init
  })
  const body = (await response.json().catch(() => ({}))) as {
    image?: string | null
    error?: string
  }
  if (!response.ok)
    throw new Error(body.error ?? 'Unable to update your profile photo.')
  return body.image ?? null
}

// Returns the server-owned URL of the stored photo.
export async function uploadAvatar(file: File) {
  const image = await avatarRequest({
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: file
  })
  if (!image) throw new Error('The photo could not be uploaded.')
  return image
}

export async function deleteAvatar() {
  await avatarRequest({ method: 'DELETE' })
}

// Center-crops to a 512 px square JPEG in the browser, so phone photos upload
// well under the server's 2 MB limit.
export async function prepareAvatar(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('Choose a JPEG, PNG or WebP photo.')
  if (file.size > 10 * 1024 * 1024)
    throw new Error('Choose a photo smaller than 10 MB.')
  const image = await createImageBitmap(file)
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 512
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Your browser could not prepare this photo.')
    const side = Math.min(image.width, image.height)
    context.drawImage(
      image,
      (image.width - side) / 2,
      (image.height - side) / 2,
      side,
      side,
      0,
      0,
      512,
      512
    )
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error('This photo could not be prepared.')),
        'image/jpeg',
        0.85
      )
    )
  } finally {
    image.close()
  }
}

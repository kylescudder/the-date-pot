import { afterEach, expect, spyOn, test } from 'bun:test'
import { deleteAvatar, prepareAvatar, uploadAvatar } from '../src/lib/profile'
import { profileAvatar } from '../src/lib/profile-ui'

let fetchSpy: ReturnType<typeof spyOn<typeof globalThis, 'fetch'>> | undefined
afterEach(() => fetchSpy?.mockRestore())

function respond(body: unknown, status = 200) {
  const calls: { url: string; init?: RequestInit }[] = []
  fetchSpy = spyOn(globalThis, 'fetch').mockImplementation((async (
    input: Parameters<typeof fetch>[0],
    init?: RequestInit
  ) => {
    calls.push({ url: String(input), init })
    return Response.json(body, { status })
  }) as typeof fetch)
  return calls
}

test('the profile UI uploads a JPEG to the photo endpoint and returns its URL', async () => {
  expect(profileAvatar.enabled).toBe(true)
  expect(profileAvatar.upload).toBe(uploadAvatar)
  expect(profileAvatar.delete).toBe(deleteAvatar)
  const calls = respond({ image: '/api/profile/avatar?v=next' })
  const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'avatar.jpg', {
    type: 'image/jpeg'
  })
  expect(await uploadAvatar(file)).toBe('/api/profile/avatar?v=next')
  expect(calls).toHaveLength(1)
  expect(calls[0]!.url).toBe('/api/profile/avatar')
  expect(calls[0]!.init?.method).toBe('PUT')
  expect(calls[0]!.init?.credentials).toBe('same-origin')
  expect(
    (calls[0]!.init?.headers as Record<string, string>)['Content-Type']
  ).toBe('image/jpeg')
  expect(calls[0]!.init?.body).toBe(file)
})

test('photo upload and removal surface server errors', async () => {
  const file = new File(['x'], 'avatar.jpg', { type: 'image/jpeg' })
  respond({ error: 'This upload is too large.' }, 413)
  await expect(uploadAvatar(file)).rejects.toThrow('This upload is too large.')
  fetchSpy!.mockRestore()
  respond({ image: null })
  await expect(uploadAvatar(file)).rejects.toThrow('could not be uploaded')
  fetchSpy!.mockRestore()
  const calls = respond({ image: null })
  await deleteAvatar()
  expect(calls[0]!.init?.method).toBe('DELETE')
  fetchSpy!.mockRestore()
  respond({ error: 'Please sign in to manage your profile.' }, 401)
  await expect(deleteAvatar()).rejects.toThrow('Please sign in')
})

test('the browser refuses non-image and oversized files before uploading', async () => {
  await expect(
    prepareAvatar(new File(['<svg/>'], 'x.svg', { type: 'image/svg+xml' }))
  ).rejects.toThrow('JPEG, PNG or WebP')
  await expect(
    prepareAvatar(
      new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.jpg', {
        type: 'image/jpeg'
      })
    )
  ).rejects.toThrow('smaller than 10 MB')
})

import { createIsomorphicFn, createStart } from '@tanstack/react-start'

export const startInstance = createStart(
  createIsomorphicFn()
    .server(async () => {
      const { requestOptions } = await import('./server/request-options')
      return requestOptions()
    })
    .client(() => ({}))
)

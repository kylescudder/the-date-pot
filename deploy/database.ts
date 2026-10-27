import postgres from 'postgres'

// Runtime role budget: app 4 + health 1 + deployment 1, out of 8 connections.
// Deployment checks are sequential and must not import the app's four-slot pool.
export function createDeploymentDatabase(url: string) {
  return postgres(url, { max: 1, connect_timeout: 10, onnotice: () => {} })
}

export {}
const response = await fetch('http://127.0.0.1:3000/healthz', {
  signal: AbortSignal.timeout(4000)
})
if (!response.ok || !(await response.json()).ok) process.exit(1)

// Browser-side error reporting; the server logs its own failures.
export const log = {
  error: (message: string) => console.error(message)
}

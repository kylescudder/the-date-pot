import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: { port: 3000 },
  resolve: {
    alias: [
      { find: '@', replacement: new URL('./src', import.meta.url).pathname },
      // Clerk's React SDK needs the React 18+ built-in instead of the shim.
      // See https://github.com/TanStack/router/issues/5738
      { find: 'use-sync-external-store/shim/index.js', replacement: 'react' }
    ]
  },
  plugins: [tailwindcss(), tanstackStart(), react()]
})

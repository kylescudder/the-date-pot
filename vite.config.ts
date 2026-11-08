import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: { port: 3000 },
  resolve: {
    alias: [
      { find: '@', replacement: new URL('./src', import.meta.url).pathname },
      // Use React's built-in useSyncExternalStore instead of the CommonJS shim.
      // See https://github.com/TanStack/router/issues/5738
      { find: 'use-sync-external-store/shim/index.js', replacement: 'react' }
    ]
  },
  plugins: [tailwindcss(), tanstackStart(), react()]
})

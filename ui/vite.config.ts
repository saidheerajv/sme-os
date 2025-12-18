import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from 'flowbite-react/plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-table']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})


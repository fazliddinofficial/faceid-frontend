import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'c4e0-84-54-73-251.ngrok-free.app'
    ],
    proxy: {
      '/api': {
        target: 'http://192.168.0.193:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // /api ni olib tashlaydi
      }
    }
  },
  optimizeDeps: {
    exclude: ['face-api.js']
  },
  build: {
    sourcemap: false
  }
})
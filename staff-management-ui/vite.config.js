import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // This creates a virtual bridge to bypass CORS
      '/api': {
        target: 'https://core-manage.onrender.com',
        changeOrigin: true,
        secure: false, // Useful if the target has certificate issues
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
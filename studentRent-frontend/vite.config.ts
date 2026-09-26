import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/__studentrent_api__': {
        target: 'https://studentrent.infinityfree.io',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/__studentrent_api__/, ''),
      },
    },
  },
})

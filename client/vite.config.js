import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Ép Vite không được quét sang server
    fs: { strict: true }
  }
})
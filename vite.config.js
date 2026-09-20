import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative paths, so the same build runs from the website root, from inside the phone app
  // (capacitor://) and from a file:// window in the desktop app.
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})

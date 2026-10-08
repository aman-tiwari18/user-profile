import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Source lives in site/; the build lands in the repo root, which GitHub Pages serves from main.
  root: 'site',
  base: './',
  build: {
    outDir: '..',
    emptyOutDir: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          motion: ['gsap', 'lenis', 'framer-motion'],
        },
      },
    },
  },
})

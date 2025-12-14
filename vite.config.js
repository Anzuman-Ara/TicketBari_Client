import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'react-router-dom'],
          payment: ['@stripe/react-stripe-js', '@stripe/stripe-js'],
        },
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'firebase/auth': 'firebase/auth',
      'firebase/app': 'firebase/app',
      'firebase/firestore': 'firebase/firestore',
      'firebase/storage': 'firebase/storage',
    },
  },
})
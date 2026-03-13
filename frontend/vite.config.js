import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
// Forced restart: 2026-03-04T19:50:00
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          maps: ['leaflet', 'react-leaflet', '@react-google-maps/api'],
          pdf: ['jspdf', 'jspdf-autotable', 'html2canvas'],
          excel: ['xlsx'],
          icons: ['lucide-react'],
        },
      },
    },
  },
})

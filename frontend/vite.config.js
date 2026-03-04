import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
// Forced restart: 2026-03-04T19:50:00
export default defineConfig({
  plugins: [react()],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [react(), visualizer({ open: true, gzipSize: true, brotliSize: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) return 'vendor'
          if (id.includes('node_modules/recharts')) return 'charts'
          if (id.includes('node_modules/jspdf')) return 'pdf'
          if (id.includes('node_modules/react-toastify')) return 'notifications'
        },
      },
    },
  },
})

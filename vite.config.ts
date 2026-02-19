import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Increased to handle the 12MB Bible text without constant warnings
    chunkSizeWarningLimit: 20000, 
    rollupOptions: {
      output: {
        // FUNCTIONAL APPROACH: Most reliable for resolving internal data folders
        manualChunks(id) {
          if (id.includes('src/data/')) {
            return 'bible-data';
          }
          // Optional: Separate node_modules to keep your app logic even smaller
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    watch: {
      usePolling: true,
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
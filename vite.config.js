import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['ansi_up', 'ansi-to-span', 'dayjs', 'events', 'jiff', 'strip-ansi'],
          'vue':  ['vue', 'vue-html-secure', 'vue-router'],
          'naive-ui': ['naive-ui'],
          'icons': ['@vicons/material']
        }
      }
    }
  }
})

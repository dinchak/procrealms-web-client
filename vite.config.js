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
        manualChunks (id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('/node_modules/vue/') || id.includes('/node_modules/@vue/') || id.includes('/node_modules/vue-router/') || id.includes('/node_modules/vue-html-secure/')) {
            return 'vue'
          }

          if (id.includes('/node_modules/@vicons/material/')) {
            return 'icons'
          }

          if (
            id.includes('/node_modules/naive-ui/') ||
            id.includes('/node_modules/vueuc/') ||
            id.includes('/node_modules/vooks/') ||
            id.includes('/node_modules/evtd/') ||
            id.includes('/node_modules/seemly/') ||
            id.includes('/node_modules/css-render/') ||
            id.includes('/node_modules/@css-render/')
          ) {
            const naiveUiMatch = id.match(/node_modules\/naive-ui\/(?:es|lib)\/([^/]+)/)
            if (naiveUiMatch && naiveUiMatch[1]) {
              const moduleName = naiveUiMatch[1]
              if (moduleName.includes('.')) {
                return 'naive-ui-core'
              }

              const code = moduleName.charCodeAt(0)
              return `naive-ui-bucket-${code % 4}`
            }
            return 'naive-ui-core'
          }

          if (
            id.includes('/node_modules/ansi_up/') ||
            id.includes('/node_modules/ansi-to-span/') ||
            id.includes('/node_modules/dayjs/') ||
            id.includes('/node_modules/events/') ||
            id.includes('/node_modules/jiff/') ||
            id.includes('/node_modules/strip-ansi/')
          ) {
            return 'vendor'
          }

          return 'vendor-misc'
        }
      }
    }
  }
})

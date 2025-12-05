import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    port: 5174
  },
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  }
})

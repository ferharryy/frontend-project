// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'
import path from 'path' // <-- IMPORTANTE: necessário para path.resolve

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // <-- Alias '@' apontando para a pasta 'src'
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
})

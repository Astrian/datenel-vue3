import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import libCss from 'vite-plugin-libcss'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), libCss()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
      name: 'Datenel for Vue3',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  server: {
    open: true,
    port: 1926
  },
  root: mode === 'development' ? 'playground' : '.'
}))

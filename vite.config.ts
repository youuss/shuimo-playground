// @ts-ignore
import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'

import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers'
import WindiCSS from 'vite-plugin-windicss'
import Icons from 'unplugin-icons/vite'
import IconResolver from 'unplugin-icons/resolver'

const prefix = 'monaco-editor/esm/vs'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {},
    },
  },
  plugins: [
    vue(),
    Components({
      dts: true,
      resolvers: [
        HeadlessUiResolver(),
        IconResolver({
          prefix: '',
        }),
      ],
    }),
    WindiCSS({
      scan: {
        include: ['src/**/*.{vue,html,jsx,tsx}', 'index.html'],
      },
    }),
    Icons(),
  ],
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'src')}/`,
      '@vue/compiler-sfc': '@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js',
    },
  },
})

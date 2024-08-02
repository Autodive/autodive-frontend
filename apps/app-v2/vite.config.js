import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';
import packageJson from './package.json';
import Layouts from 'vite-plugin-vue-layouts';
import AutoImport from "unplugin-auto-import/vite"
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import topLevelAwait from 'vite-plugin-top-level-await';

import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), 'DEV_');
  const { DEV_PROXY_TARGET, DEV_PROXY_EXTR } = env;

  return {
    envPrefix: 'VUE_APP_',
    base: './',
    plugins: [
      vue(),
      Pages({
        exclude: ["**/components/*.vue"],
      }),
      Layouts({
        layoutsDirs: 'src/layouts',
        defaultLayout: 'default',
      }),
      Components({
        resolvers: [
          ElementPlusResolver({
            importStyle: "sass",
          }),
        ],
      }),
      topLevelAwait(),
      createHtmlPlugin({
        inject: {
          data: {
            BASE_URL: "",
            VUE_APP_TITLE: "半自动标注工具",
            VUE_APP_AUTHOR: "chuzhixin 1204505056@qq.com"
          },
        }
      })
    ],
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.vue', '.json'],
      alias: [
        { find: /^@\//, replacement: path.resolve(__dirname, './src') + '/' },
      ],
    },
    optimizeDeps: {
      include: Object.keys(packageJson.dependencies).filter(key => !key.startsWith('autodive-'))
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/variables.scss" as *; @use "@/styles/element/index.scss";`,
        }
      }
    },
    server: {
      open: true,
      proxy: {
        '/app': {
          target: DEV_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/app/, "")
        },
        '/extr': {
          target: DEV_PROXY_EXTR || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/upload': {
          target: DEV_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      }
    }
  }
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/admin/',
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api', 'slash-div']
      }
    }
  },
  server: {
    port: parseInt(process.env.PORT) || 5173,
    // 对于 Vite 6：
    allowedHosts: true,

    // HMR 配置：本地开发使用默认配置，云环境/内网穿透时通过环境变量指定端口
    // 例如：VITE_HMR_CLIENT_PORT=8888 npm run dev
    hmr: process.env.VITE_HMR_CLIENT_PORT ? {
      clientPort: parseInt(process.env.VITE_HMR_CLIENT_PORT)
    } : true, // 本地开发使用 Vite 默认配置（自动连接 5173）

    proxy: {
      '/api': {
        target: process.env.VITE_API_BACKEND || 'http://localhost:8888',
        changeOrigin: true
      },
      '/images': {
        target: process.env.VITE_API_BACKEND || 'http://localhost:8888',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'echarts': ['echarts']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})

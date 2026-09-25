import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { writeSeoFiles } from './scripts/seo-build.mjs'

function versionPlugin() {
  return {
    name: 'version-plugin',
    buildStart() {
      const versionData = {
        version: new Date().toISOString(),
        buildTime: Date.now(),
      };
      writeFileSync(
        resolve(__dirname, 'public', 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
    }
  }
}

// Writes per-route static HTML shells (meta tags for crawlers that do not run JS),
// the /lat mirror shells and sitemap.xml into dist/ — see scripts/seo-build.mjs.
function seoShellsPlugin() {
  let outDir = 'dist'
  return {
    name: 'seo-static-shells',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      await writeSeoFiles({ distDir: outDir, publicDir: resolve(__dirname, 'public') })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), versionPlugin(), seoShellsPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    // Code splitting za bolje performanse
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          ui: ['lucide-react'],
        }
      }
    },
    // Optimizacija velicine chunk-ova
    chunkSizeWarningLimit: 1000,
    // Minifikacija
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// For GitHub Pages project sites, the app is served from
// https://<user>.github.io/<repo>/ so the base path must match the repo name.
// Override at build time with:  VITE_BASE=/your-repo-name/ npm run build
const base = process.env.VITE_BASE || '/Fitcheck/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Fit Check',
        short_name: 'Fit Check',
        description: 'Build outfits from your digital wardrobe.',
        theme_color: '#111111',
        background_color: '#faf9f7',
        display: 'standalone',
        orientation: 'portrait',
        scope: base,
        start_url: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,ico,webmanifest}'],
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: false
      }
    })
  ]
})

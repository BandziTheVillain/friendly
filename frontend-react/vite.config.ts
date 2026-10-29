import { defineConfig, loadEnv, type Plugin } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackRouter } from '@tanstack/router-plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Public, indexable pages. Everything under the _protected layout is noindex.
const PUBLIC_ROUTES = ['/', '/auth/signup', '/auth/sign-in']

// Fills __SITE_URL__ in index.html and emits robots.txt + sitemap.xml at build time.
function seo(siteUrl: string): Plugin {
  return {
    name: 'friendly-seo',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: [
          'User-agent: *',
          'Allow: /',
          'Disallow: /home',
          'Disallow: /discover',
          'Disallow: /connect/',
          'Disallow: /friend-requests',
          'Disallow: /suggested-friends',
          'Disallow: /posts/',
          'Disallow: /profile/',
          'Disallow: /auth/forgot-password',
          '',
          `Sitemap: ${siteUrl}/sitemap.xml`,
          '',
        ].join('\n'),
      })
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...PUBLIC_ROUTES.map((path) => `  <url><loc>${siteUrl}${path}</loc></url>`),
          '</urlset>',
          '',
        ].join('\n'),
      })
    },
  }
}

const config = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const siteUrl = (env.VITE_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

  return {
    resolve: { tsconfigPaths: true },
    plugins: [
      devtools(),
      tailwindcss(),
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      viteReact(),
      seo(siteUrl),
    ],
  }
})

export default config

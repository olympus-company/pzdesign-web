import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';
const negocio = JSON.parse(readFileSync(new URL('./src/data/negocio.json', import.meta.url)));
const redirecciones = JSON.parse(readFileSync(new URL('./src/data/redirecciones.json', import.meta.url)));
export default defineConfig({
  site: negocio.web,
  trailingSlash: 'always',
  output: 'static',
  experimental: { redirectPage: true },
  redirects: Object.fromEntries(Object.entries(redirecciones).map(([from, destination]) => [from, { destination, status: 301 }])),
  integrations: [sitemap({ filter: (page) => !Object.hasOwn(redirecciones, new URL(page).pathname) && !['/404/', '/404.html', '/3xx/'].includes(new URL(page).pathname) })],
});

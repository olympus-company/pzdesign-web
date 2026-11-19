import { lanzado } from '../lib/lanzamiento';
import { absoluto } from '../lib/negocio';
export const GET = () => new Response(`User-agent: *\n${lanzado ? 'Allow: /' : 'Disallow: /'}\n${lanzado ? `Sitemap: ${absoluto('/sitemap-index.xml')}\n` : ''}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

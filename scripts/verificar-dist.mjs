import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const read = (p) => fs.readFileSync(p, 'utf8');
const json = (p) => JSON.parse(read(p));
const decode = (s) => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const text = (s) => decode(s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
const attr = (tag, name) => decode(tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? '');
const fileFor = (ruta) => ruta === '/404/' ? '404.html' : ruta.replace(/^\//, '') + 'index.html';
export function verificarDist(lanzado = false) {
  const negocio = json('src/data/negocio.json');
  const catalogo = json('src/data/catalogo.json');
  const publicados = catalogo.filter(p => !p.pendiente);
  const proyectos = json('src/data/proyectos.json');
  const servicios = json('src/data/servicios.json');
  const redirects = json('src/data/redirecciones.json');
  const imagenes = json('src/data/imagenes.json');
  const rutas = ['/', ...servicios.map(s => `/${s.slug}/`), '/proyectos/', '/mobiliario-de-oficina/', '/como-trabajamos/', '/paola-zaid/', '/contacto/', '/privacidad/', '/404/', ...publicados.map(p => `/mobiliario-de-oficina/${p.slug}/`), ...proyectos.map(p => `/proyectos/${p.slug}/`)];
  const archivos = fs.readdirSync('dist', { recursive: true }).filter(p => p.endsWith('.html')).sort();
  const errors = { rutas: [], seo: [], estatico: [], indexacion: [], redirecciones: [], contenido: [], nap: [], extras: [] };
  const check = (grupo, condition, detail) => { if (!condition) errors[grupo].push(detail); };
  const stats = {html:archivos.length,paginas:rutas.length,modelos:publicados.length,proyectos:proyectos.length,redirecciones:Object.keys(redirects).length,titulos:[],descripciones:[],respuestas:[],imagenes:0};
  for (const ruta of rutas) check('rutas', fs.existsSync(path.join('dist', fileFor(ruta))), ruta);
  for (const p of catalogo.filter(p=>p.pendiente)) check('rutas', !fs.existsSync(`dist/mobiliario-de-oficina/${p.slug}/index.html`), `Pendiente publicado: ${p.slug}`);
  for (const file of archivos) {
    const h = read(path.join('dist', file));
    const title = text(h.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
    const metas = [...h.matchAll(/<meta\s[^>]*>/g)].map(m=>m[0]);
    const description = attr(metas.find(m=>attr(m,'name')==='description') ?? '', 'content');
    const canonical = attr([...h.matchAll(/<link\s[^>]*>/g)].map(m=>m[0]).find(m=>attr(m,'rel')==='canonical')??'', 'href');
    check('seo', (h.match(/<h1(?:\s|>)/g)??[]).length === 1, `${file}: H1`);
    check('seo', title.length > 0 && title.length <= 60, `${file}: título ${title.length}`);
    check('seo', description.length >= 120 && description.length <= 160, `${file}: descripción ${description.length}`);
    check('seo', canonical.startsWith(`${negocio.web}/`) && canonical.endsWith('/'), `${file}: canonical`);
    check('seo', /<html\s+lang="es-CL"/.test(h), `${file}: idioma`);
    stats.titulos.push(title.length);stats.descripciones.push(description.length);
    const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    check('seo', ld.length === 1, `${file}: número de JSON-LD`);
    let graph = [];
    for (const [,source] of ld) {
      try { const data=JSON.parse(source);graph=data['@graph'];check('seo', data['@context']==='https://schema.org' && Array.isArray(graph),`${file}: @graph`); }
      catch { check('seo',false,`${file}: JSON-LD inválido`); }
    }
    for (const type of ['LocalBusiness','Organization','WebSite','BreadcrumbList']) check('seo', graph.some(g=>[g['@type']].flat().includes(type)),`${file}: ${type}`);
    const main = h.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1]??'';
    const answer = text(main.match(/<p class="intro answer-first">([\s\S]*?)<\/p>/)?.[1]??'');
    const words = answer.split(/\s+/).length;stats.respuestas.push(words);
    check('estatico',text(main).length > 160 && words >= 40 && words <= 60,`${file}: texto estático / respuesta de ${words} palabras`);
    check('estatico',/<\/h1>\s*<p class="intro answer-first">/.test(main),`${file}: respuesta inmediatamente bajo H1`);
    for(const [,level,heading] of h.matchAll(/<(h[12])[^>]*>([\s\S]*?)<\/\1>/g)) check('extras',!text(heading).endsWith('.'),`${file}: punto final en ${level}`);
    const noindex = metas.some(m=>attr(m,'name')==='robots'&&attr(m,'content').split(/[, ]+/).includes('noindex'));
    check('indexacion',noindex===!lanzado,`${file}: noindex=${noindex}`);
    check('contenido',!/(?:^|[^\p{L}])(hogares?|jard[ií]n(?:es)?|terrazas?|casas?)(?![\p{L}])/iu.test(text(h)),`${file}: vocabulario fuera de alcance`);
    check('extras',!/(?:\$\s*\d|CLP\s*\d)/.test(text(main)),`${file}: precio publicado`);
    for(const [tag] of h.matchAll(/<img\s[^>]*>/g)) {
      const src=attr(tag,'src');const info=imagenes[src];stats.imagenes++;
      check('extras',fs.existsSync(`dist${src}`),`${file}: imagen faltante ${src}`);
      check('extras',!!info&&Number(attr(tag,'width'))===info.width&&Number(attr(tag,'height'))===info.height,`${file}: dimensiones ${src}`);
      check('extras',attr(tag,'loading')==='lazy' && attr(tag,'alt').length>12,`${file}: lazy/alt ${src}`);
    }
    for(const [tag] of h.matchAll(/<(?:a|link|script)\s[^>]*>/g)){
      const url=attr(tag,'href')||attr(tag,'src');if(!url.startsWith('/')||url.startsWith('//'))continue;
      const target=url.split(/[?#]/)[0];
      check('extras', fs.existsSync(path.join('dist',target.endsWith('/')?target+'index.html':target)),`${file}: enlace/activo roto ${url}`);
    }
    const prod=publicados.find(p=>file===fileFor(`/mobiliario-de-oficina/${p.slug}/`));
    if(prod){const data=graph.find(g=>g['@type']==='Product');check('extras',data?.name===prod.modelo&&!Object.hasOwn(data??{},'offers'),`${file}: Product sin offers`);check('estatico',prod.descripcionTecnica.every(line=>text(main).includes(line)),`${file}: ficha técnica en HTML`);const quotes=[...h.matchAll(/<a\s[^>]*>/g)].map(m=>attr(m[0],'href')).filter(u=>u.startsWith('https://wa.me/'));check('extras',quotes.some(u=>{const msg=new URL(u).searchParams.get('text');return msg?.includes(prod.modelo)&&msg.includes('Cantidad: 1');}),`${file}: cotización prellenada`);}
    const project=proyectos.find(p=>file===fileFor(`/proyectos/${p.slug}/`));if(project)check('estatico',text(main).includes(project.queSeHizo),`${file}: alcance del proyecto estático`);
    if(servicios.some(s=>file===fileFor(`/${s.slug}/`)))check('extras',graph.some(g=>g['@type']==='Service'),`${file}: Service`);
  }
  const robots=read('dist/robots.txt');
  check('indexacion',lanzado?/^Allow: \/$/m.test(robots)&&!/^Disallow: \/$/m.test(robots):/^Disallow: \/$/m.test(robots), 'robots.txt');
  for (const [from,to] of Object.entries(redirects)) {
    const file=path.join('dist',fileFor(from));if(!fs.existsSync(file)){errors.redirecciones.push(`Falta ${from}`);continue;}
    const h=read(file);check('redirecciones',h.includes(`content="0;url=${negocio.web}${to}"`)||h.includes(`content="0;url=${to}"`),`${from}: refresh a ${to}`);
    check('redirecciones',h.includes(`rel="canonical" href="${negocio.web}${to}"`),`${from}: canonical a destino`);
  }
  // 21 rutas conocidas + 27 artículos del post-sitemap (el /blog/ ya estaba entre las 21).
  check('redirecciones',Object.keys(redirects).length>=48,`Solo ${Object.keys(redirects).length}/48 URL antiguas redirigidas`);
  const sources=fs.readdirSync('src',{recursive:true}).filter(f=>/\.(astro|ts|js|json|css)$/.test(f));
  for(const f of sources){if(f==='data/negocio.json')continue;const s=read(path.join('src',f));for(const value of [negocio.telefono,negocio.telefono.replace(/\D/g,''),negocio.correo,negocio.direccion.calle])check('nap',!s.includes(value),`${f}: NAP duplicado`);}
  const sitemap=read('dist/sitemap-0.xml');
  for(const ruta of rutas.filter(r=>r!=='/404/'))check('extras',sitemap.includes(`<loc>${negocio.web}${ruta}</loc>`),`Sitemap falta ${ruta}`);
  for(const ruta of [...Object.keys(redirects),'/404/'])check('extras',!sitemap.includes(`<loc>${negocio.web}${ruta}</loc>`),`Sitemap contiene ${ruta}`);
  for(const key of ['titulos','descripciones','respuestas'])stats[key]={min:Math.min(...stats[key]),max:Math.max(...stats[key])};
  return {lanzado,stats,errors,rutas};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const report=verificarDist(process.env.PUBLIC_LANZADO==='true');console.log(JSON.stringify(report,null,2));
  process.exitCode=Object.values(report.errors).some(e=>e.length)?1:0;
}

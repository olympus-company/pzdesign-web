# pzdesign-web

Web de **PZ Design** (Paola Zaid Design SpA): habilitación y remodelación de oficinas, arquitectura interior, proyectos especiales y catálogo de mobiliario de oficina.

## Cómo funciona
- **GitHub (este repo) es la fuente de verdad.** Todo cambio entra por rama + PR.
- **Replit (cuenta de Bernardo Salvi) aloja y publica.** En la Shell del proyecto: `git pull --no-rebase --no-edit origin main` → Republish. Publica Olympus.
- Sitio **estático** (Astro): todo el texto queda en el HTML, sin depender de JavaScript (requisito SEO/GEO/AEO).
- Dominio final: pzdesign.cl (hoy WordPress en SiteGround). Al migrar: redirecciones 301 de las ~50 URL antiguas y sin tocar el correo (MX en SiteGround).

## Comandos
- `npm install`
- `npm run dev` (puerto 4321)
- `npm run build` → `dist/`

## Contexto del negocio
En el cuaderno de Olympus: `olympus-shared/clients/pz-design/` (ficha, respuestas de Paola, book, fichas de sillas, propuesta).

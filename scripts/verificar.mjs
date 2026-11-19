import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { verificarDist } from './verificar-dist.mjs';
const estados=[];const builds=[];
fs.mkdirSync('docs/evidencia',{recursive:true});
// Last build deliberately leaves dist in prelaunch mode.
for(const lanzado of [true,false]){
  const run=spawnSync('npm',['run','build'],{encoding:'utf8',env:{...process.env,PUBLIC_LANZADO:String(lanzado)}});
  const log=(run.stdout??'')+(run.stderr??'');fs.writeFileSync(`docs/evidencia/build-${lanzado}.log`,log);
  const build={lanzado,exitCode:run.status,advertencias:/\[(?:WARN|ERROR|warn|error)\]/.test(log)};builds.push(build);
  if(run.status!==0){console.error(log);process.exit(1);}
  estados.push(verificarDist(lanzado));
}
const errors=(name)=>estados.flatMap(e=>e.errors[name]);
const criterion=(id,pass,evidencia)=>({id,estado:pass?'PASS':'FAIL',evidencia});
const pre=estados.find(e=>!e.lanzado);
const responsive=fs.existsSync('docs/evidencia/responsive.json')?JSON.parse(fs.readFileSync('docs/evidencia/responsive.json','utf8')):null;
const criterios=[
 criterion(1,builds.every(b=>b.exitCode===0&&!b.advertencias),builds),
 criterion(2,!errors('rutas').length,{paginas:pre.stats.paginas,modelos:pre.stats.modelos,proyectos:pre.stats.proyectos,errores:errors('rutas')}),
 criterion(3,!errors('seo').length,{html:pre.stats.html,titulos:pre.stats.titulos,descripciones:pre.stats.descripciones,errores:errors('seo')}),
 criterion(4,!errors('estatico').length,{html:pre.stats.html,respuestas:pre.stats.respuestas,errores:errors('estatico')}),
 criterion(5,!errors('indexacion').length,{estados:estados.map(e=>({PUBLIC_LANZADO:e.lanzado,html:e.stats.html,errores:e.errors.indexacion}))}),
 criterion(6,!errors('redirecciones').length,{redirecciones:pre.stats.redirecciones,errores:[...new Set(errors('redirecciones'))]}),
 criterion(7,!errors('contenido').length,{html:pre.stats.html,errores:errors('contenido')}),
 criterion(8,!errors('nap').length,{fuente:'src/data/negocio.json',errores:errors('nap')}),
 criterion(9,Boolean(responsive?.pass),responsive??{pendiente:'Sin medición del navegador: sandbox bloquea servidor local y Chromium; navegador bloquea file://'})
];
const resultado={criterios,extras:{estado:errors('extras').length?'FAIL':'PASS',errores:errors('extras')},rutas:pre.rutas};
fs.writeFileSync('docs/evidencia/aceptacion.json',JSON.stringify(resultado,null,2)+'\n');
for(const c of criterios)console.log(`${c.id}. ${c.estado} ${JSON.stringify(c.evidencia)}`);
console.log(`Extras: ${resultado.extras.estado} (sitemap, enlaces, imágenes, H1/H2, Product, Service, cotizaciones)`);
if(resultado.extras.errores.length)console.log(resultado.extras.errores);
process.exitCode=criterios.some(c=>c.estado==='FAIL')||resultado.extras.estado==='FAIL'?1:0;

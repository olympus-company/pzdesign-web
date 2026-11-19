// 21st.dev · Expand on hover (larsen66, id 7276). Adaptado: paneles de servicios que se abren al pasar el mouse o con el teclado;
// en celular se apilan abiertos.
import { useState } from 'react';

export interface Panel { href: string; titulo: string; texto: string; src: string; alt: string; width: number; height: number }

export function PanelesExpandibles({ paneles }: { paneles: Panel[] }) {
  const [activo, setActivo] = useState(0);
  return (
    <div className="pe">
      {paneles.map((p, i) => (
        <a key={p.href} href={p.href} className={`pe-panel ${activo === i ? 'pe-activo' : ''}`} onMouseEnter={() => setActivo(i)} onFocus={() => setActivo(i)}>
          <img src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" />
          <span className="pe-velo" aria-hidden="true" />
          <span className="pe-texto">
            <span className="pe-titulo">{p.titulo}</span>
            <span className="pe-detalle">{p.texto}</span>
            <span className="pe-ir">Ver servicio <span className="flecha" aria-hidden="true">↗</span></span>
          </span>
        </a>
      ))}
    </div>
  );
}

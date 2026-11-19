// 21st.dev · Scroll Horizontal Gallery (motiondotdev, id 24623). Adaptado: la galería avanza de lado mientras se baja;
// en celular o con movimiento reducido queda como carrusel que se desliza con el dedo.
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

export interface ItemGaleria { href: string; src: string; alt: string; width: number; height: number; cliente: string; nombre: string; tipo: string; m2?: number | null }

export function GaleriaHorizontal({ items }: { items: ItemGaleria[] }) {
  const target = useRef<HTMLDivElement>(null);
  const pista = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion();
  const [distancia, setDistancia] = useState(0);
  const [activo, setActivo] = useState(false);
  const { scrollYProgress } = useScroll({ target, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distancia]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 861px)');
    const medir = () => {
      const on = mq.matches && !quieto;
      setActivo(on);
      setDistancia(on && pista.current ? Math.max(0, pista.current.scrollWidth - window.innerWidth) : 0);
    };
    medir();
    // Las cotas de m² se dibujan cuando cada foto entra en pantalla.
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('dibuja'); io.unobserve(e.target); } }), { threshold: 0.6 });
    pista.current?.querySelectorAll('.gh-foto').forEach((el) => io.observe(el));
    window.addEventListener('resize', medir);
    mq.addEventListener('change', medir);
    return () => { io.disconnect(); window.removeEventListener('resize', medir); mq.removeEventListener('change', medir); };
  }, [quieto]);

  return (
    <div ref={target} className={`gh ${activo ? 'gh-activa' : ''}`} style={activo ? { height: `calc(100vh + ${distancia}px)` } : undefined}>
      <div className="gh-pegado">
        <motion.div ref={pista} className="gh-pista" style={activo ? { x } : undefined}>
          {items.map((it) => (
            <a key={it.href} href={it.href} className="gh-item">
              <div className="marco gh-foto">
                <img src={it.src} alt={it.alt} width={it.width} height={it.height} loading="lazy" decoding="async" className="project-image" />
                {it.m2 ? <div className="cota" aria-hidden="true"><svg viewBox="0 0 100 16" preserveAspectRatio="none"><line className="tope" x1="0" y1="2" x2="0" y2="14" /><line className="eje" pathLength={1} x1="0" y1="8" x2="100" y2="8" /><line className="tope" x1="100" y1="2" x2="100" y2="14" /></svg><span>{it.m2} m²</span></div> : null}
              </div>
              <span className="gh-texto">
                <span className="gh-tipo">{it.tipo}</span>
                <h3>{it.cliente}</h3>
                <span className="gh-nombre">{it.nombre}</span>
              </span>
              <span className="ir-redondo" aria-hidden="true">↗</span>
            </a>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

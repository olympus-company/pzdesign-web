// 21st.dev · Reading Text Reveal (waleedkibhen, id 9386). Adaptado: recibe el texto; sin JavaScript se ve completo.
import { useEffect, useRef, useState } from 'react';

export function TextoRevela({ texto, className = '' }: { texto: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const palabras = texto.split(' ');
  const [visibles, setVisibles] = useState(palabras.length);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, objetivo = 0, actual = 0;
    const suave = () => {
      actual += (objetivo - actual) * 0.12;
      setVisibles(Math.round(actual * palabras.length));
      if (Math.abs(objetivo - actual) > 0.002) raf = requestAnimationFrame(suave);
    };
    const medir = () => {
      const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect(), ojo = window.innerHeight * 0.7;
      objetivo = Math.max(0, Math.min(1, (ojo - r.top) / (r.height + window.innerHeight * 0.25)));
      cancelAnimationFrame(raf); raf = requestAnimationFrame(suave);
    };
    medir();
    window.addEventListener('scroll', medir, { passive: true });
    return () => { window.removeEventListener('scroll', medir); cancelAnimationFrame(raf); };
  }, [palabras.length]);

  return (
    <p ref={ref} className={`texto-revela ${className}`}>
      {palabras.map((p, i) => <span key={i} className={i < visibles ? 'tr-si' : 'tr-no'}>{p} </span>)}
    </p>
  );
}

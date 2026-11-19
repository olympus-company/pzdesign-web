// 21st.dev · Zoom Parallax (efferd, id 5967). Adaptado: imágenes con tamaño real y texto alternativo, sin Tailwind.
import { useScroll, useTransform, motion, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

export interface ImagenZoom { src: string; alt: string; width: number; height: number }

const POS = ['', 'zp-1', 'zp-2', 'zp-3', 'zp-4', 'zp-5', 'zp-6'];

export function ZoomParallax({ images }: { images: ImagenZoom[] }) {
  const container = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: container, offset: ['start start', 'end end'] });
  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);
  const scales = [scale4, scale5, scale6, scale5, scale6, scale8, scale9];

  return (
    <div ref={container} className="zp">
      <div className="zp-pegado">
        {images.slice(0, 7).map((img, index) => (
          <motion.div key={img.src} style={quieto ? undefined : { scale: scales[index % scales.length] }} className={`zp-capa ${POS[index]}`}>
            <div className="zp-foto">
              <img src={img.src} alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import catalogo from '../data/catalogo.json';
export type Producto = (typeof catalogo)[number];
// Publicado = confirmado por Paola (pendiente) y no oculto a pedido de ella (visible).
export const publicados: Producto[] = catalogo.filter(p => !p.pendiente && p.visible !== false);
export const porSlug = (slug: string) => catalogo.find(p => p.slug === slug);
export const modalidadTexto = (p: Producto) => {
  const m = p.modalidad ?? [];
  if (!m.includes('arriendo')) return null;
  return m.includes('venta') ? 'Venta o arriendo' : 'Arriendo';
};
export const garantiaTexto = (p: Producto) => (p.garantia ? `Garantía de ${p.garantia} ${p.garantia === 1 ? 'año' : 'años'}` : null);

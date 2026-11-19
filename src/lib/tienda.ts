// Maqueta de tienda (18-nov): se enciende solo con PUBLIC_TIENDA=true. Apagada, el sitio queda como la fase 1 (cotizar sin precios).
import precios from '../data/precios-ejemplo.json';
export const tienda = import.meta.env.PUBLIC_TIENDA === 'true';
export const precio = (slug: string) => (precios as Record<string, number | string>)[slug] as number | undefined;
export const clp = (n: number) => `$${n.toLocaleString('es-CL')}`;
/** Desde esta cantidad sugerimos la cotización por volumen para empresas. */
export const VOLUMEN = 10;

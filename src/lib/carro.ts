// Carro de la maqueta: vive en el navegador (localStorage). La tienda real lo llevará a un servidor con base de datos.
export interface Linea { slug: string; modelo: string; precio: number; imagen: string; cantidad: number }
const CLAVE = 'pz-carro';
export const leer = (): Linea[] => { try { return JSON.parse(localStorage.getItem(CLAVE) ?? '[]'); } catch { return []; } };
export const guardar = (l: Linea[]) => { try { localStorage.setItem(CLAVE, JSON.stringify(l)); } catch { /* sin almacenamiento: la maqueta sigue */ } document.dispatchEvent(new CustomEvent('carro')); };
export const agregar = (x: Omit<Linea, 'cantidad'>, cantidad = 1) => { const l = leer(); const i = l.findIndex((y) => y.slug === x.slug); if (i >= 0) l[i].cantidad += cantidad; else l.push({ ...x, cantidad }); guardar(l); };
export const unidades = () => leer().reduce((a, x) => a + x.cantidad, 0);
export const total = () => leer().reduce((a, x) => a + x.precio * x.cantidad, 0);
export const clp = (n: number) => `$${n.toLocaleString('es-CL')}`;

import negocio from '../data/negocio.json';
export { negocio };
export const telefonoE164 = `+${negocio.telefono.replace(/\D/g, '')}`;
export const direccion = `${negocio.direccion.calle}, ${negocio.direccion.comuna}, ${negocio.direccion.ciudad}`;
export const whatsapp = (mensaje = 'Hola, quiero conversar sobre un proyecto para mi empresa.') =>
  `https://wa.me/${telefonoE164.slice(1)}?text=${encodeURIComponent(mensaje)}`;
export const cotizar = (modelo: string, cantidad = 1) => whatsapp(`Hola, quiero cotizar el modelo ${modelo}. Cantidad: ${cantidad}. ¿Me ayudas con disponibilidad y entrega?`);
export const absoluto = (ruta: string) => new URL(ruta, negocio.web).href;

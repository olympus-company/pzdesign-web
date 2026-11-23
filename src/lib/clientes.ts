// Logos de clientes del book (página 21) pasados a un solo color. Los clientes sin logo limpio se muestran como texto.
import logos from '../data/clientes-logos.json';
import {negocio} from './negocio';
export type LogoCliente = {slug: string; ratio: number};
export const logoDe = (nombre: string): LogoCliente | undefined => (logos as Record<string, LogoCliente>)[nombre];
/** Alto óptico en px: los logos altos o cuadrados se muestran más grandes que los muy anchos para que pesen parecido. */
export const altoLogo = (ratio: number) => (ratio < 1.4 ? 46 : ratio < 2.2 ? 40 : ratio < 4 ? 32 : ratio < 6 ? 26 : 20);
export const cinta = negocio.clientes.map((nombre) => ({nombre, logo: logoDe(nombre)}));
/** Logo de cliente para cada proyecto del book (La Folie no tiene logo en el book). */
export const logoProyecto: Record<string, string> = {'kupfer-1': 'Küpfer', 'kupfer-2': 'Küpfer', 'pesco-casino': 'Pesco', 'pesco-edificio-comercial': 'Pesco', 'chile-food-oficinas': 'Chile Food', panini: 'Panini', 'monsanto-viluco': 'Monsanto'};

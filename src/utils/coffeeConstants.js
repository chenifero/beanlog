// Constantes de café de especialidad
// Se usan en filtros y en el modal de nueva cata

export const ORIGENES = [
  'Colombia', 'Brasil', 'Costa Rica', 'Guatemala', 'Panamá',
  'Honduras', 'Perú', 'Etiopía', 'Kenia', 'Ruanda',
  'Burundi', 'Indonesia', 'Papúa Nueva Guinea', 'India'
]

export const PROCESOS = [
  'Lavado (Washed)',
  'Natural (Seco)',
  'Honey (Miel o Semi-Lavado)',
  'Fermentación Anaeróbica',
  'Maceración Carbónica',
  'Fermentación Láctica',
  'Choque Térmico'
]

export const TUESTES = [
  'Tueste Claro',
  'Tueste Medio',
  'Tueste Medio-Oscuro'
]

// Normaliza texto para búsquedas sin acentos
export function normalizeText(text) {
  return text
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    || ''
}
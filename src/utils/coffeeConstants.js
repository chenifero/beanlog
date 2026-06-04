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
    .replace(/[̀-ͯ]/g, '')
    || ''
}

// Mapea el valor libre del OCR al canonical de PROCESOS
export function normalizeProceso(raw) {
  if (!raw || raw === 'null') return ''
  const s = normalizeText(raw)
  if (s.includes('lavado') || s.includes('washed') || s.includes('wet')) return 'Lavado (Washed)'
  if (s.includes('natural') || s.includes('seco') || s.includes('dry')) return 'Natural (Seco)'
  if (s.includes('honey') || s.includes('miel') || s.includes('semi')) return 'Honey (Miel o Semi-Lavado)'
  if (s.includes('anaerob')) return 'Fermentación Anaeróbica'
  if (s.includes('carbon')) return 'Maceración Carbónica'
  if (s.includes('lacti')) return 'Fermentación Láctica'
  if (s.includes('choque') || s.includes('thermal') || s.includes('termico')) return 'Choque Térmico'
  return ''
}

// Mapea el valor libre del OCR al canonical de TUESTES
export function normalizeTueste(raw) {
  if (!raw || raw === 'null') return ''
  const s = normalizeText(raw)
  if (s.includes('claro') || s.includes('light')) return 'Tueste Claro'
  if (
    s.includes('medio-oscuro') || s.includes('medio oscuro') ||
    s.includes('medium-dark') || s.includes('medium dark') ||
    s.includes('oscuro') || s.includes('dark')
  ) return 'Tueste Medio-Oscuro'
  if (s.includes('medio') || s.includes('medium')) return 'Tueste Medio'
  return ''
}

// Mapea el valor libre del OCR al canonical de ORIGENES
export function normalizeOrigen(raw) {
  if (!raw || raw === 'null') return ''
  const s = normalizeText(raw)
  const aliases = {
    ethiopia: 'Etiopía', etiopia: 'Etiopía',
    kenya: 'Kenia', kenia: 'Kenia',
    rwanda: 'Ruanda', ruanda: 'Ruanda',
    panama: 'Panamá',
    peru: 'Perú',
    colombia: 'Colombia',
    brasil: 'Brasil', brazil: 'Brasil',
    'costa rica': 'Costa Rica',
    guatemala: 'Guatemala',
    honduras: 'Honduras',
    indonesia: 'Indonesia',
    india: 'India',
    papua: 'Papúa Nueva Guinea',
    burundi: 'Burundi',
  }
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (s.includes(alias)) return canonical
  }
  for (const origen of ORIGENES) {
    if (s.includes(normalizeText(origen))) return origen
  }
  return ''
}

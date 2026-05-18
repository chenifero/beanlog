// Modal de nueva cata — el flujo estrella de BeanLog
// -Subir foto de etiqueta → OCR
// -Validar y editar datos del café
// -Radar chart sensorial
// -Guardar

import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ocrService } from '@/services/ocrService'
import { tastingService } from '@/services/tastingService'
import { coffeeSearchService } from '@/services/coffeeSearchService'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer
} from 'recharts'
import { FaCamera } from "react-icons/fa";
import { FaEarthAfrica } from "react-icons/fa6";
import { FaGear } from "react-icons/fa6";
import { FaFire } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import './TastingModal.css'

const RADAR_ATTRIBUTES = [
  { key: 'acidez', label: 'Acidez' },
  { key: 'cuerpo', label: 'Cuerpo' },
  { key: 'dulzor', label: 'Dulzor' },
  { key: 'amargor', label: 'Amargor' },
  { key: 'aroma', label: 'Aroma' },
  { key: 'frutado', label: 'Frutado' },
]

const DEFAULT_RADAR = {
  acidez: 5, cuerpo: 5, dulzor: 5,
  amargor: 5, aroma: 5, frutado: 5
}

const STEPS = ['foto', 'datos', 'radar', 'resumen']

export default function TastingModal({ onClose, onTastingCreated }) {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [step, setStep] = useState('foto')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Foto
  const [labelFile, setLabelFile] = useState(null)
  const [labelPreview, setLabelPreview] = useState(null)

  // Datos del café — prellenados por OCR
  const [cafeData, setCafeData] = useState({
    nombre: '', origen: '', finca: '',
    proceso: '', tueste: '', variedad: '',
  })

  // Datos de la cata
  const [puntuacion, setPuntuacion] = useState(7)
  const [notas, setNotas] = useState('')
  const [radarData, setRadarData] = useState(DEFAULT_RADAR)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])

  // Búsqueda de compra
  const [searchResult, setSearchResult] = useState(null)
  const [searching, setSearching] = useState(false)

  // Selecciona la foto y genera preview
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLabelFile(file)
    setLabelPreview(URL.createObjectURL(file))
    setError('')
  }

  // Envía la foto al OCR y pasa al paso de datos
  const handleScanLabel = async () => {
    if (!labelFile) {
      setError('Selecciona una foto de la etiqueta')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await ocrService.scanLabel(labelFile) // Rellena los campos con los datos extraídos por la IA
      console.log('OCR result:', result)
      setCafeData({
      nombre: result.nombre !== 'null' ? result.nombre || '' : '',
      origen: result.origen !== 'null' ? result.origen || '' : '',
      finca: result.finca !== 'null' ? result.finca || '' : '',
      proceso: result.proceso !== 'null' ? result.proceso || '' : '',
      tueste: result.tueste !== 'null' ? result.tueste || '' : '',
      variedad: result.variedad !== 'null' ? result.variedad || '' : '',
      })
      setStep('datos')
    } catch (err) {
      console.error('Error OCR:', err)
      setError('Error al escanear la etiqueta. Puedes rellenar los datos manualmente.')
      setStep('datos')
    } finally {
      setLoading(false)
    }
  }

  // Busca información de compra del café
  const handleSearchCoffee = async () => {
    if (!cafeData.nombre) return
    setSearching(true)
    try {
      const result = await coffeeSearchService.searchCoffee(
        `${cafeData.nombre} ${cafeData.origen || ''}`
      )
      setSearchResult(result)
    } catch (err) {
      console.error('Error buscando café:', err)
    } finally {
      setSearching(false)
    }
  }

  // Actualiza un valor del radar
  const handleRadarChange = (key, value) => {
    setRadarData(prev => ({ ...prev, [key]: Number(value) }))
  }

  // Guarda la cata completa
  const handleSave = async () => {
    if (!cafeData.nombre) {
      setError('El nombre del café es obligatorio')
      return
    }
    setLoading(true)
    setError('')
    try {
      const tasting = await tastingService.createTasting(
        user.id,
        cafeData,
        { puntuacion, notas, radarData, fecha }
      )
      onTastingCreated?.(tasting)
      onClose()
    } catch (err) {
      setError('Error al guardar la cata')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Datos para el radar chart de Recharts
  const radarChartData = RADAR_ATTRIBUTES.map(attr => ({
    attribute: attr.label,
    value: radarData[attr.key],
  }))

  const stepIndex = STEPS.indexOf(step)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="tasting-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="tasting-modal-header">
          <div className="tasting-steps">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`tasting-step ${i <= stepIndex ? 'active' : ''}`}
              />
            ))}
          </div>
          <h3 className="tasting-modal-title">
            {step === 'foto' && 'Escanear etiqueta'}
            {step === 'datos' && 'Datos del café'}
            {step === 'radar' && 'Perfil sensorial'}
            {step === 'resumen' && 'Resumen'}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="tasting-modal-body">

          {/* ── PASO 1: FOTO ── */}
          {step === 'foto' && (
            <div className="tasting-step-content">
              <p className="tasting-step-desc">
                Haz una foto a la etiqueta del café y la IA extraerá los datos automáticamente.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {/* Zona de subida de foto */}
              {!labelPreview ? (
                <div
                  className="tasting-upload-zone"
                  onClick={() => fileInputRef.current.click()}
                >
                  <span className="tasting-upload-icon"><FaCamera /></span>
                  <p>Toca para hacer una foto</p>
                  <p className="tasting-upload-sub">o selecciona de tu galería</p>
                </div>
              ) : (
                <div className="tasting-label-preview">
                  <img src={labelPreview} alt="etiqueta" />
                  <button
                    className="tasting-change-photo"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Cambiar foto
                  </button>
                </div>
              )}

              {error && <p className="tasting-error">{error}</p>}

              <div className="tasting-modal-footer">
                <button className="tasting-btn-secondary" onClick={() => setStep('datos')}>
                  Rellenar manualmente
                </button>
                <button
                  className="tasting-btn-primary"
                  onClick={handleScanLabel}
                  disabled={!labelFile || loading}
                >
                  {loading ? 'Escaneando...' : 'Escanear IA ✨'}
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 2: DATOS ── */}
          {step === 'datos' && (
            <div className="tasting-step-content">
              <p className="tasting-step-desc">
                Revisa y completa los datos extraídos por la IA.
              </p>

              <div className="tasting-fields">
                <div className="tasting-field">
                  <label>Nombre del café *</label>
                  <input
                    type="text"
                    value={cafeData.nombre}
                    onChange={e => setCafeData(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Ej: Yirgacheffe Natural"
                  />
                </div>
                <div className="tasting-field">
                  <label>Origen</label>
                  <input
                    type="text"
                    value={cafeData.origen}
                    onChange={e => setCafeData(p => ({ ...p, origen: e.target.value }))}
                    placeholder="Ej: Etiopía"
                  />
                </div>
                <div className="tasting-fields-row">
                  <div className="tasting-field">
                    <label>Proceso</label>
                    <input
                      type="text"
                      value={cafeData.proceso}
                      onChange={e => setCafeData(p => ({ ...p, proceso: e.target.value }))}
                      placeholder="Ej: Natural"
                    />
                  </div>
                  <div className="tasting-field">
                    <label>Tueste</label>
                    <input
                      type="text"
                      value={cafeData.tueste}
                      onChange={e => setCafeData(p => ({ ...p, tueste: e.target.value }))}
                      placeholder="Ej: Claro"
                    />
                  </div>
                </div>
                <div className="tasting-field">
                  <label>Finca</label>
                  <input
                    type="text"
                    value={cafeData.finca}
                    onChange={e => setCafeData(p => ({ ...p, finca: e.target.value }))}
                    placeholder="Ej: Konga"
                  />
                </div>

                {/* Búsqueda de compra */}
                <div className="tasting-search-section">
                  <button
                    className="tasting-btn-search"
                    onClick={handleSearchCoffee}
                    disabled={!cafeData.nombre || searching}
                  >
                   {searching ? 'Buscando...' : <><FaSearch /> Buscar dónde comprar</>}
                  </button>

                  {searchResult?.found && (
                    <div className="tasting-search-result">
                      {searchResult.bestImage && (
                        <img src={searchResult.bestImage} alt="producto" className="tasting-search-img" />
                      )}
                      <div className="tasting-search-info">
                        <p className="tasting-search-price">{searchResult.bestPrice}</p>
                        <p className="tasting-search-source">{searchResult.source}</p>
                        {searchResult.bestLink && (
                          <a href={searchResult.bestLink} target="_blank" rel="noreferrer" className="tasting-search-link">
                            Ver producto →
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="tasting-error">{error}</p>}

              <div className="tasting-modal-footer">
                <button className="tasting-btn-secondary" onClick={() => setStep('foto')}>
                  ← Atrás
                </button>
                <button
                  className="tasting-btn-primary"
                  onClick={() => setStep('radar')}
                  disabled={!cafeData.nombre}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 3: RADAR ── */}
          {step === 'radar' && (
            <div className="tasting-step-content">
              <p className="tasting-step-desc">
                Define el perfil sensorial moviendo los sliders.
              </p>

              {/* Radar chart en tiempo real */}
              <div className="tasting-radar-chart">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarChartData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="attribute"
                      tick={{ fill: 'var(--text-dim)', fontSize: 11 }}
                    />
                    <Radar
                      dataKey="value"
                      stroke="var(--amber)"
                      fill="var(--amber)"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Sliders para cada atributo */}
              <div className="tasting-sliders">
                {RADAR_ATTRIBUTES.map(attr => (
                  <div key={attr.key} className="tasting-slider-row">
                    <span className="tasting-slider-label">{attr.label}</span>
                    <input
                      type="range"
                      min={1} max={10}
                      value={radarData[attr.key]}
                      onChange={e => handleRadarChange(attr.key, e.target.value)}
                      className="tasting-slider"
                    />
                    <span className="tasting-slider-value">{radarData[attr.key]}</span>
                  </div>
                ))}
              </div>

              <div className="tasting-modal-footer">
                <button className="tasting-btn-secondary" onClick={() => setStep('datos')}>
                  ← Atrás
                </button>
                <button className="tasting-btn-primary" onClick={() => setStep('resumen')}>
                  Siguiente →
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 4: RESUMEN ── */}
          {step === 'resumen' && (
            <div className="tasting-step-content">
              <div className="tasting-summary">

                <div className="tasting-summary-cafe">
                  <h4>{cafeData.nombre}</h4>
                  {cafeData.origen && <p><FaEarthAfrica /> {cafeData.origen}</p>}
                  {cafeData.proceso && <p><FaGear /> {cafeData.proceso}</p>}
                  {cafeData.tueste && <p><FaFire /> {cafeData.tueste}</p>}
                </div>

                {/* Puntuación */}
                <div className="tasting-field">
                  <label>Puntuación</label>
                  <div className="tasting-score-row">
                    <input
                      type="range"
                      min={1} max={10} step={0.5}
                      value={puntuacion}
                      onChange={e => setPuntuacion(Number(e.target.value))}
                      className="tasting-slider"
                    />
                    <span className="tasting-score-value">{puntuacion}/10</span>
                  </div>
                </div>

                {/* Notas */}
                <div className="tasting-field">
                  <label>Notas de cata</label>
                  <textarea
                    value={notas}
                    onChange={e => setNotas(e.target.value)}
                    placeholder="¿Qué sabores y aromas percibes?"
                    rows={3}
                    className="tasting-textarea"
                  />
                </div>

                {/* Fecha */}
                <div className="tasting-field">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={fecha}
                    onChange={e => setFecha(e.target.value)}
                    className="tasting-date"
                  />
                </div>

              </div>

              {error && <p className="tasting-error">{error}</p>}

              <div className="tasting-modal-footer">
                <button className="tasting-btn-secondary" onClick={() => setStep('radar')}>
                  ← Atrás
                </button>
                <button
                  className="tasting-btn-primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : '✅ Guardar cata'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
// Página de Mis Cafés — listado de catas del usuario
// Incluye el flujo completo de nueva cata con OCR

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { tastingService } from '@/services/tastingService'
import TastingModal from '@/components/tasting/TastingModal'
import TastingCard from '@/components/tasting/TastingCard'
import './MisCafesPage.css'
import { FaCoffee } from 'react-icons/fa'

export default function MisCafesPage() {
  const { user } = useAuth()
  const [tastings, setTastings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadTastings()
  }, [])

  const loadTastings = async () => {
    try {
      const data = await tastingService.getUserTastings(user.id)
      setTastings(data)
    } catch (err) {
      console.error('Error cargando catas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTastingCreated = async () => {
    await loadTastings()
  }

  const handleTastingDeleted = (tastingId) => {
    setTastings(prev => prev.filter(t => t.id !== tastingId))
  }

  return (
    <div className="mis-cafes-page">

      <div className="mis-cafes-header">
        <h1 className="mis-cafes-title">Mis Cafés</h1>
        <button className="mis-cafes-new-btn" onClick={() => setShowModal(true)}>
          + Nueva cata
        </button>
      </div>

      {loading && (
        <div className="mis-cafes-loading">Cargando catas...</div>
      )}

      {!loading && tastings.length === 0 && (
        <div className="mis-cafes-empty">
          <p><FaCoffee /></p>
          <p>Aún no tienes catas registradas.</p>
          <button className="tasting-btn-primary" onClick={() => setShowModal(true)}>
            Registrar mi primer café
          </button>
        </div>
      )}

      <div className="mis-cafes-grid">
        {tastings.map(tasting => (
          <TastingCard
            key={tasting.id}
            tasting={tasting}
            onDelete={handleTastingDeleted}
          />
        ))}
      </div>

      {/* Botón flotante móvil */}
      <button className="mis-cafes-fab" onClick={() => setShowModal(true)}>+</button>

      {showModal && (
        <TastingModal
          onClose={() => setShowModal(false)}
          onTastingCreated={handleTastingCreated}
        />
      )}

    </div>
  )
}
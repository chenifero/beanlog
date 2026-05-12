// Modal para crear una nueva publicación
// Permite añadir texto, fotos y ubicación

import { useState, useRef, useEffect } from 'react'
import { postService } from '@/services/postService'
import { useAuth } from '@/context/AuthContext'
import { FaLocationDot } from "react-icons/fa6";
import { FaCamera } from "react-icons/fa";
import './CreatePostModal.css'

export default function CreatePostModal({ onClose, onPostCreated }) {
  const { user, profile } = useAuth()
  const [content, setContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estado de ubicación
  const [location, setLocation] = useState('')
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const fileInputRef = useRef(null)

  // Busca sugerencias en Photon con debounce — igual que en SettingsPage
  useEffect(() => {
    if (location.length < 2) {
      setLocationSuggestions([])
      setShowSuggestions(false)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(location)}&limit=5`
        )
        const data = await res.json()
        const suggestions = (data.features || []).map(f => {
          const p = f.properties
          const parts = [p.name, p.city !== p.name ? p.city : null, p.country].filter(Boolean)
          return parts.join(', ')
        })
        setLocationSuggestions(suggestions)
        setShowSuggestions(suggestions.length > 0)
      } catch (err) {
        console.error('[Photon] Error:', err)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [location])



  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + selectedFiles.length > 5) {
      setError('Máximo 5 fotos por publicación')
      return
    }
    setSelectedFiles(prev => [...prev, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPreviews(prev => [...prev, ...newPreviews])
    setError('')
  }

  const handleRemovePhoto = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) {
      setError('Escribe algo o añade una foto')
      return
    }
    setLoading(true)
    setError('')
    try {
      let imageUrls = []
      if (selectedFiles.length > 0) {
        imageUrls = await postService.uploadImages(user.id, selectedFiles)
      }
      const post = await postService.createPost(user.id, {
        type: 'general',
        content: content.trim() || null,
        imageUrls,
        // Añade la ubicación al contenido si existe
        location: location || null,
      })
      onPostCreated?.(post)
      onClose()
    } catch (err) {
      setError('Error al publicar. Inténtalo de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h3 className="modal-title">Nueva publicación</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-author-row">
            <div className="modal-avatar">
                {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" />
                : user?.email?.charAt(0).toUpperCase()
                }
            </div>
            {/* modal-author-info pone nombre y ubicación en columna */}
            <div className="modal-author-info">
                <span className="modal-username">{profile?.username || 'Usuario'}</span>
                {location && (
                <div className="modal-location-chip">
                    <FaLocationDot /> {location}
                    <button
                    className="modal-location-remove"
                    onClick={() => { setLocation(''); setShowLocationInput(false) }}
                    >✕</button>
                </div>
                )}
            </div>
        </div>

          <textarea
            className="modal-textarea"
            placeholder="¿Qué café estás tomando? ¿Visitaste alguna cafetería?"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            autoFocus
          />

          {/* Input de ubicación manual — aparece al pulsar el botón 📍 */}
          {showLocationInput && (
            <div className="modal-location-input-wrapper">
              <input
                type="text"
                placeholder="Escribe una ubicación..."
                value={location}
                autoComplete="off"
                onChange={e => setLocation(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="modal-location-input"
                autoFocus
              />
              {/* Sugerencias de Photon */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <ul className="modal-location-suggestions">
                  {locationSuggestions.map((label, i) => (
                    <li
                      key={i}
                      className="modal-location-suggestion-item"
                      onMouseDown={() => {
                        setLocation(label)
                        setShowSuggestions(false)
                        setLocationSuggestions([])
                      }}
                    >
                      <FaLocationDot /> {label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {previews.length > 0 && (
            <div className="modal-previews">
              {previews.map((src, i) => (
                <div key={i} className="modal-preview-item">
                  <img src={src} alt={`preview ${i + 1}`} />
                  <button className="modal-preview-remove" onClick={() => handleRemovePhoto(i)}>✕</button>
                </div>
              ))}
              {previews.length < 5 && (
                <button className="modal-preview-add" onClick={() => fileInputRef.current.click()}>+</button>
              )}
            </div>
          )}

          {error && <p className="modal-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <div className="modal-footer-left">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFilesChange}
            />
            <button
              className="modal-action-btn"
              onClick={() => fileInputRef.current.click()}
              title="Añadir fotos"
              disabled={previews.length >= 5}
            >
              <FaCamera /> Foto
            </button>
            {/* Botón de ubicación — al pulsar muestra el input o usa GPS */}
            <button
              className={`modal-action-btn ${location ? 'active' : ''}`}
              onClick={() => {
                if (showLocationInput) {
                  setShowLocationInput(false)
                  setLocation('')
                } else {
                  setShowLocationInput(true)
                }
              }}
              title="Añadir ubicación"
            >
              <FaLocationDot /> Ubicación
            </button>
            
          </div>

          <div className="modal-footer-right">
            <button className="modal-btn-cancel" onClick={onClose}>Cancelar</button>
            <button
              className="modal-btn-publish"
              onClick={handleSubmit}
              disabled={loading || (!content.trim() && selectedFiles.length === 0)}
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
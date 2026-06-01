import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { profileService } from '@/services/profileService'
import { useToast } from '@/context/ToastContext'
import './ProfileSetupModal.css'

export default function ProfileSetupModal({ onComplete }) {
  const { user } = useAuth()
  const toast = useToast()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername]       = useState('')
  const [errors, setErrors]           = useState({})
  const [loading, setLoading]         = useState(false)

  const validate = () => {
    const errs = {}
    if (!displayName.trim() || displayName.trim().length < 2) {
      errs.displayName = 'El nombre debe tener al menos 2 caracteres.'
    } else if (displayName.trim().length > 50) {
      errs.displayName = 'Máximo 50 caracteres.'
    }

    const cleanUser = username.trim().toLowerCase()
    if (!cleanUser || cleanUser.length < 3) {
      errs.username = 'El @usuario debe tener al menos 3 caracteres.'
    } else if (cleanUser.length > 20) {
      errs.username = 'Máximo 20 caracteres.'
    } else if (!/^[a-z0-9_]+$/.test(cleanUser)) {
      errs.username = 'Solo letras minúsculas, números y guión bajo.'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setErrors({})

    const cleanUser = username.trim().toLowerCase()

    try {
      const taken = await profileService.checkUsernameAvailable(cleanUser, user.id)
      if (!taken) {
        setErrors({ username: 'Ese @usuario ya está en uso. Prueba con otro.' })
        setLoading(false)
        return
      }

      await profileService.updateProfile(user.id, {
        display_name: displayName.trim(),
        username: cleanUser,
      })

      await onComplete()
    } catch (err) {
      toast.error('Error guardando el perfil. Inténtalo de nuevo.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUsernameChange = (e) => {
    const val = e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase().slice(0, 20)
    setUsername(val)
    if (errors.username) setErrors(prev => ({ ...prev, username: null }))
  }

  return (
    <div className="psetup-overlay">
      <div className="psetup-container">
        <div className="psetup-header">
          <img
            src="/logos/logo_header_slogan.png"
            alt="BeanLog"
            className="psetup-logo"
          />
          <h2 className="psetup-title">¡Bienvenido a BeanLog!</h2>
          <p className="psetup-subtitle">
            Antes de empezar, elige cómo quieres que te vean los demás.
          </p>
        </div>

        <form className="psetup-form" onSubmit={handleSubmit} noValidate>
          <div className="psetup-field">
            <label className="psetup-label" htmlFor="displayName">
              Tu nombre
            </label>
            <input
              id="displayName"
              type="text"
              className={`psetup-input ${errors.displayName ? 'psetup-input--error' : ''}`}
              placeholder="Ej: Alejandro García"
              value={displayName}
              onChange={e => {
                setDisplayName(e.target.value)
                if (errors.displayName) setErrors(prev => ({ ...prev, displayName: null }))
              }}
              maxLength={50}
              autoComplete="name"
              autoFocus
            />
            {errors.displayName && (
              <span className="psetup-error">{errors.displayName}</span>
            )}
          </div>

          <div className="psetup-field">
            <label className="psetup-label" htmlFor="username">
              Tu @usuario
            </label>
            <div className="psetup-username-wrap">
              <span className="psetup-at">@</span>
              <input
                id="username"
                type="text"
                className={`psetup-input psetup-input--at ${errors.username ? 'psetup-input--error' : ''}`}
                placeholder="alejandro_beans"
                value={username}
                onChange={handleUsernameChange}
                maxLength={20}
                autoComplete="username"
              />
            </div>
            <span className="psetup-hint">
              Solo letras minúsculas, números y guión bajo. Podrás cambiarlo desde Ajustes.
            </span>
            {errors.username && (
              <span className="psetup-error">{errors.username}</span>
            )}
          </div>

          <button
            type="submit"
            className="psetup-btn"
            disabled={loading}
          >
            {loading ? 'Guardando…' : 'Entrar a BeanLog'}
          </button>
        </form>
      </div>
    </div>
  )
}

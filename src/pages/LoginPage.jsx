import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '@/services/authService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import { FcGoogle } from 'react-icons/fc'
import './AuthPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.signIn(email, password)
      navigate('/')
    } catch (err) {
      setError('Error al iniciar sesión, email o contraseña incorrectos :(')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoadingGoogle(true)
    try {
      await authService.signInWithGoogle()
    } catch (err) {
      setError('Error al iniciar sesión con Google')
      setLoadingGoogle(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Inicia sesión en</h1>
        <img src="logos/logo_header_slogan.png" alt="BeanLog Logo" className="auth-logo" />

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            type="email"
            label="Email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <Button type="submit" variant="primary" size="md" disabled={loading} className="auth-submit">
            {loading ? <Spinner size="sm" /> : 'Inicia sesión'}
          </Button>
        </form>

        <div className="auth-divider"><span>o</span></div>

        <button className="auth-google-btn" onClick={handleGoogle} disabled={loadingGoogle}>
          {loadingGoogle ? <Spinner size="sm" /> : <><FcGoogle size={20} /> Continuar con Google</>}
        </button>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  )
}
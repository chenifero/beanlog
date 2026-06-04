import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { profileService } from '@/services/profileService'
import { FaCheck, FaCoffee, FaUsers, FaCamera } from 'react-icons/fa'
import { FaEarthAfrica } from 'react-icons/fa6'
import './OnboardingModal.css'

const STEPS = [
  {
    id: 'complete-profile',
    title: 'Completa tu perfil',
    desc: 'Añade foto, nombre visible y bio',
    icon: <FaCamera />,
  },
  {
    id: 'add-tasting',
    title: 'Registra tu primera cata',
    desc: 'Escanea una etiqueta de café y cata',
    icon: <FaCoffee />,
  },
  {
    id: 'explore-cafes',
    title: 'Explora cafés',
    desc: 'Descubre cafés y tostadores de especialidad',
    icon: <FaEarthAfrica />,
  },
  {
    id: 'follow-users',
    title: 'Sigue a otros usuarios',
    desc: 'Conecta con amigos que también aman el café',
    icon: <FaUsers />,
  },
]

export default function OnboardingModal({ onComplete }) {
  const { user, profile, refreshProfile } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [loading, setLoading] = useState(false)

  const handleStepClick = (stepId) => {
    setCompletedSteps(new Set([...completedSteps, stepId]))
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      await profileService.completeOnboarding(user.id)
      await refreshProfile(user.id)
      onComplete?.()
    } catch (err) {
      console.error('Error completando onboarding:', err)
    } finally {
      setLoading(false)
    }
  }

  const allCompleted = completedSteps.size === STEPS.length

  return (
    <div className='onboarding-overlay'>
      <div className='onboarding-modal'>
        <button
          className='onboarding-skip'
          onClick={handleSkip}
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Saltar por ahora'}
        </button>

        <div className='onboarding-content'>
          <h1 className='onboarding-title'>Bienvenido a BeanLog</h1>
          <p className='onboarding-subtitle'>Sip. Rate. Share.</p>

          <div className='onboarding-progress'>
            <div className='progress-bar'>
              <div
                className='progress-fill'
                style={{
                  width: `${(completedSteps.size / STEPS.length) * 100}%`,
                }}
              />
            </div>
            <p className='progress-text'>
              {completedSteps.size} de {STEPS.length} pasos
            </p>
          </div>

          <div className='onboarding-steps'>
            {STEPS.map((step, idx) => {
              const isCompleted = completedSteps.has(step.id)
              return (
                <div
                  key={step.id}
                  className={`onboarding-step ${isCompleted ? 'completed' : ''}`}
                  onClick={() => handleStepClick(step.id)}
                >
                  <div className='step-icon-wrapper'>
                    {isCompleted ? <FaCheck /> : step.icon}
                  </div>
                  <div className='step-content'>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                  {isCompleted && <div className='step-badge'>✓</div>}
                </div>
              )
            })}
          </div>

          {allCompleted && (
            <button
              className='onboarding-finish'
              onClick={handleSkip}
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Finalizar onboarding'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

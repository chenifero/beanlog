import { useEffect } from 'react'
import { driver } from 'driver.js'

const STORAGE_KEY = 'beanlog_onboarding_v1'

const DESKTOP_STEPS = [
  {
    popover: {
      title: 'Bienvenido a BeanLog ☕',
      description:
        '<em>Sip. Rate. Share.</em> Tu diario personal de café de especialidad. Te hacemos una visita rápida por la app.',
    },
  },
  {
    element: '#nav-home',
    popover: {
      title: 'Home',
      description:
        'El feed social: descubre catas y visitas de las personas que sigues en tiempo real.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#nav-cafes',
    popover: {
      title: 'Mis Cafés',
      description:
        'Registra tus catas con el radar sensorial. Escanea la etiqueta con la cámara y la IA rellena los datos por ti.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#nav-map',
    popover: {
      title: 'Mapa',
      description:
        'Explora y guarda cafeterías de especialidad cerca de ti. Comparte tus visitas con la comunidad.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#nav-notifications',
    popover: {
      title: 'Avisos',
      description:
        'Aquí aparecen los likes, comentarios y nuevas publicaciones de las personas que sigues.',
      side: 'right',
      align: 'start',
    },
  },
  {
    element: '#nav-settings',
    popover: {
      title: 'Ajustes',
      description:
        'Personaliza tu perfil, foto de avatar, preferencias de método y más.',
      side: 'right',
      align: 'start',
    },
  },
]

const MOBILE_STEPS = [
  {
    popover: {
      title: 'Bienvenido a BeanLog ☕',
      description:
        '<em>Sip. Rate. Share.</em> Tu diario personal de café de especialidad. Te hacemos una visita rápida por la app.',
    },
  },
  {
    element: '#nav-home',
    popover: {
      title: 'Home',
      description: 'El feed: descubre catas y visitas de las personas que sigues.',
      side: 'top',
      align: 'start',
    },
  },
  {
    element: '#nav-cafes',
    popover: {
      title: 'Mis Cafés',
      description:
        'Registra tus catas con el radar sensorial y escanea etiquetas con la cámara.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#nav-map',
    popover: {
      title: 'Mapa',
      description: 'Explora y guarda cafeterías de especialidad cerca de ti.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#nav-notifications',
    popover: {
      title: 'Avisos',
      description: 'Likes, comentarios y nuevas publicaciones de quien sigues.',
      side: 'top',
      align: 'center',
    },
  },
  {
    element: '#nav-profile',
    popover: {
      title: 'Perfil',
      description: 'Tu perfil público, tus catas y la gente que te sigue.',
      side: 'top',
      align: 'end',
    },
  },
]

export default function OnboardingTour({ onDone }) {
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS

    const markDone = () => {
      localStorage.setItem(STORAGE_KEY, 'done')
      onDone()
    }

    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        progressText: '{{current}} / {{total}}',
        nextBtnText: 'Siguiente →',
        prevBtnText: '← Atrás',
        doneBtnText: '¡Listo!',
        allowClose: true,
        steps,
        onDestroyStarted: () => {
          driverObj.destroy()
          markDone()
        },
      })

      driverObj.drive()
    }, 400)

    return () => clearTimeout(timer)
  }, [onDone])

  return null
}

export { STORAGE_KEY as ONBOARDING_STORAGE_KEY }

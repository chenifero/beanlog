import { useState } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/context/AuthContext'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import ProfileSetupModal from '@/components/onboarding/ProfileSetupModal'
import OnboardingTour, { ONBOARDING_STORAGE_KEY } from '@/components/onboarding/OnboardingTour'
import './AppShell.css'

export default function AppShell({ children }) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { isCollapsed } = useSidebar()
  const { user, profile, refreshProfile } = useAuth()

  const [tourDone, setTourDone] = useState(
    () => localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'done'
  )

  const showTour   = profile !== null && !tourDone
  const needsSetup = profile !== null && tourDone && !profile?.display_name

  const handleSetupComplete = async () => {
    await refreshProfile(user.id)
  }

  return (
    <div className={`app-shell ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {isDesktop && <Sidebar />}
      <main className="app-main">
        {children}
      </main>
      {!isDesktop && <BottomNav />}

      {needsSetup && (
        <ProfileSetupModal onComplete={handleSetupComplete} />
      )}
      {showTour && (
        <OnboardingTour onDone={() => setTourDone(true)} />
      )}
    </div>
  )
}

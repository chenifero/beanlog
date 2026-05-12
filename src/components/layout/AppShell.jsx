//aquí tenemos la navbar, que es dinámica, dependiendo del tamaño de la pantalla, se muestra una u otra. En desktop se muestra la sidebar y en móvil se muestra la bottom nav. El main es el contenedor de las páginas, que se renderizan dentro del app shell. El app shell es el layout principal de la aplicación, que se encarga de mostrar la navbar y el main.

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useSidebar } from '@/context/SidebarContext'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import './AppShell.css'

export default function AppShell({ children }) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { isCollapsed } = useSidebar()
  

  return (
    <div className={`app-shell ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {isDesktop && <Sidebar />}
      <main className="app-main">
        {children}
      </main>
      {!isDesktop && <BottomNav />}
    </div>
  )
}

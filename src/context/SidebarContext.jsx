//archivo que contiene el contexto de la sidebar para que se colapse y se habra cuando pasemos el ratón por encima
import { createContext, useContext, useState } from 'react'

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggle = () => setIsCollapsed(prev => !prev)

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
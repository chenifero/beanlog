import { createContext, useContext, useCallback, useState } from 'react'

const ToastContext = createContext()

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = toastId++
    const toast = { id, message, type }

    setToasts(prev => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((message, duration) =>
    addToast(message, 'success', duration), [addToast])

  const error = useCallback((message, duration) =>
    addToast(message, 'error', duration), [addToast])

  const info = useCallback((message, duration) =>
    addToast(message, 'info', duration), [addToast])

  const warning = useCallback((message, duration) =>
    addToast(message, 'warning', duration), [addToast])

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

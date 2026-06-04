//punto de entrada se renderiza el componente App

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'driver.js/dist/driver.css'
import '@/styles/reset.css'
import '@/styles/global.css'
import '@/styles/typography.css'
import '@/styles/animations.css'
import 'react-medium-image-zoom/dist/styles.css';


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

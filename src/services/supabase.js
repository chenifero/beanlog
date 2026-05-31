import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Crash visibly instead of a blank page — helps diagnose missing env vars in production
  document.body.innerHTML = `
    <div style="font-family:sans-serif;padding:2rem;color:#c62828;background:#fff3f3;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      <h2>⚠️ Configuración incompleta</h2>
      <p>Faltan las variables de entorno de Supabase.<br/>
      Define <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en tu entorno de despliegue.</p>
    </div>`
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

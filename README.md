<div align="center">

# ☕ BeanLog — Registro Inteligente de Catas

**Una PWA de café de especialidad desarrollada como TFG del ciclo DAM.**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Version](https://img.shields.io/badge/Versión-1.0-purple?style=for-the-badge)
![Status](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge)

*Sip. Rate. Share.*

</div>

---

## 🫘 ¿Qué es BeanLog?

**BeanLog** es una aplicación web progresiva (PWA) multiplataforma para amantes del café de especialidad. Permite registrar catas con OCR inteligente, visualizar el perfil sensorial del café mediante un radar chart, explorar cafeterías en un mapa interactivo y compartir experiencias con una comunidad.

---

## ✨ Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| 📷 **OCR Inteligente** | Foto a la etiqueta del café → los datos se extraen automáticamente con IA |
| 🕸️ **Radar Chart Sensorial** | Visualiza acidez, cuerpo, dulzor, amargor, aroma y frutado de cada cata |
| 🗺️ **Mapa de Cafeterías** | Guarda y explora cafeterías de especialidad en un mapa interactivo |
| 📱 **Red Social** | Publica tus catas y visitas, sigue a otros usuarios, reacciona en tiempo real |
| 🔐 **Autenticación** | Registro e inicio de sesión con Supabase Auth |

---

## 📷 Flujo OCR

1. El usuario fotografía la etiqueta del café desde móvil
2. La imagen se envía a una Edge Function de Supabase
3. La función llama a Google Cloud Vision o OpenAI Vision
4. Extrae: nombre, origen, finca, proceso, tueste
5. Si el café existe en el repositorio global → se precarga
6. El usuario revisa, edita y guarda la cata

> El formulario manual siempre está disponible como alternativa.

---

## 🧱 Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **React.js** | Framework frontend (PWA) |
| **Supabase** | Base de datos, Auth, Storage y Edge Functions |
| **PostgreSQL + JSONB** | Almacenamiento del perfil sensorial (`radar_data`) |
| **Recharts** | Radar chart del perfil sensorial |
| **Mapbox GL JS** | Mapa interactivo de cafeterías |
| **GSAP** | Animaciones de entrada y transiciones clave |
| **Vite** | Bundler y servidor de desarrollo |
| **Google Cloud Vision / OpenAI Vision** | Motor OCR para extracción de etiquetas |

---

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── layout/      → AppShell, Sidebar, BottomNav
│   ├── social/      → PostCard, CreatePostModal
│   └── ui/          → Button, Card, Input, Avatar, Badge, Spinner
├── context/         → AuthContext, SidebarContext, ToastContext
├── hooks/           → useMediaQuery
├── pages/           → HomePage, ProfilePages, SettingsPage, LoginPage...
├── services/        → supabase.js, authService, postService, ocrService...
└── styles/          → global.css, typography.css, animations.css, reset.css
```

---

## 🗄️ Esquema de Base de Datos

```sql
profiles       → usuarios de la app
cafes_master   → repositorio global de cafés
tastings       → catas personales (con radar_data JSONB)
coffee_shops   → cafeterías con coordenadas
posts          → publicaciones polimórficas (cata | visita)
follows        → sistema de seguidores
likes          → likes en tiempo real (Supabase Realtime)
comments       → comentarios en posts
```

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/beanlog.git
cd beanlog

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# → Rellena las claves en .env.local

# 4. Arrancar en desarrollo
npm run dev
```

---

## ⚙️ Variables de Entorno

Copia `.env.example` como `.env.local` y rellena los valores:

| Variable | Descripción |
|---|---|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase |
| `VITE_GOOGLE_CLOUD_API_KEY` | API Key de Google Cloud Vision (opcional) |
| `VITE_MAPBOX_TOKEN` | Token de Mapbox GL JS |
| `VITE_SERPAPI_KEY` | SerpAPI para búsqueda de tiendas (feature opcional) |
| `VITE_GROQ_KEY` | Groq AI para rotación de proveedores (feature opcional) |

---

## 📱 Navegación

**Web (≥ 768px)** — Sidebar fija de 220px con: Home · Mis Cafés · Mapa · Estadísticas · Ajustes

**Móvil (< 768px)** — Bottom navigation bar con 5 tabs: ☕ Home · 🫘 Cafés · 🗺️ Mapa · 📊 Stats · 👤 Perfil

---

<div align="center">

**Proyecto TFG DAM — en desarrollo activo 🚀**

</div>

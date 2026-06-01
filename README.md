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
| 📷 **OCR Inteligente** | Foto a la etiqueta del café → los datos se extraen automáticamente con IA (Groq Vision) |
| 🕸️ **Radar Chart Sensorial** | Visualiza acidez, cuerpo, dulzor, amargor, aroma y frutado de cada cata |
| 🗺️ **Mapa de Cafeterías** | Guarda y explora cafeterías en un mapa interactivo con marcadores de colores según estado |
| 📱 **Red Social** | Publica tus catas y visitas, sigue a otros usuarios, comenta y reacciona |
| 🔔 **Notificaciones** | Recibe avisos de likes, comentarios, nuevos seguidores y publicaciones |
| 🔖 **Publicaciones Guardadas** | Guarda posts para consultarlos después |
| 💬 **Menciones** | Menciona a otros usuarios con `@username` en comentarios y posts |
| ☕ **Estado de Cafeterías** | Marca cafeterías como "Quiero ir" o "Visitada" con reflejo en el mapa |
| 🔐 **Autenticación** | Registro, inicio de sesión y recuperación de contraseña con Supabase Auth |
| 💰 **Precio y link de compra** | Registra precio con selector de divisa y añade un enlace de compra a tus catas |

---

## 📷 Flujo OCR

1. El usuario fotografía la etiqueta del café desde móvil
2. La imagen se envía a una Edge Function de Supabase
3. La función llama a Groq Vision (`meta-llama/llama-4-scout-17b-16e-instruct`)
4. Extrae: marca, nombre, origen, finca, proceso, tueste, variedad, sca, notas, altitud
5. El usuario revisa, edita y guarda la cata

> El formulario manual siempre está disponible como alternativa.

---

## 🧱 Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **React.js** | Framework frontend (PWA) |
| **Supabase** | Base de datos, Auth, Storage y Edge Functions |
| **PostgreSQL + JSONB** | Almacenamiento del perfil sensorial (`radar_data`) |
| **Recharts** | Radar chart del perfil sensorial |
| **Leaflet + react-leaflet** | Mapa interactivo de cafeterías |
| **Vite** | Bundler y servidor de desarrollo |
| **Groq Vision** | Motor OCR para extracción de etiquetas |
| **Photon (Komoot)** | Geocodificación gratuita sin API key |
| **react-day-picker** | Selector de fecha tematizado |
| **SerpAPI + Groq** | Búsqueda de precios de compra (feature opcional) |

---

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── layout/      → AppShell, Sidebar, BottomNav
│   ├── social/      → PostCard, CreatePostModal, MentionInput, MentionText
│   ├── tasting/     → TastingModal, TastingCard
│   └── ui/          → Button, Card, Input, Avatar, Badge, Spinner
├── context/         → AuthContext (+ unreadCount), SidebarContext, ToastContext
├── hooks/           → useMediaQuery, useMentionSuggestions
├── pages/           → HomePage, ProfilePages, SettingsPage, LoginPage,
│                       UserProfilePage, NotificationsPage, PostDetailPage,
│                       ResetPasswordPage
├── services/        → supabase.js, authService, postService, ocrService,
│                       coffeeShopService, coffeeShopStatusService,
│                       savedPostsService, notificationService,
│                       profileService, tastingService, coffeeSearchService
└── styles/          → global.css, typography.css, animations.css, reset.css
```

---

## 🗄️ Esquema de Base de Datos

```sql
profiles            → usuarios de la app (+ display_name, experience_level)
cafes_master        → repositorio global de cafés (+ marca, sca)
tastings            → catas personales con radar_data JSONB (+ precio, link_compra)
coffee_shops        → cafeterías con coordenadas (+ ciudad, pais, notas, foto_urls[])
posts               → publicaciones polimórficas (cata | visita | general)
follows             → sistema de seguidores
likes               → likes en posts
comments            → comentarios en posts
notifications       → notificaciones (like | comment | follow | new_post)
saved_posts         → posts guardados por usuario
user_coffee_shop_status → estado por usuario en cada cafetería (want_to_go | visited)
```

---

## 🗺️ Mapa de Cafeterías

- Mapa Leaflet con tile CartoDB Voyager
- Marcadores SVG con color según estado del usuario:
  - 🟣 Por defecto (`#c349ee`)
  - 🟡 Quiero ir (`#F5A623`)
  - 🟢 Visitada (`#52C97A`)
- Carrusel de fotos (hasta 5) en el panel de detalle
- Leyenda interactiva para filtrar marcadores por tipo
- Al guardar una cafetería se publica automáticamente un post de visita

---

## 🔔 Notificaciones

Sistema completo con badge en sidebar y bottom navigation:

- **like** — alguien da like a tu post
- **comment** — alguien comenta tu post
- **follow** — alguien te sigue
- **new_post** — alguien a quien sigues publica

El contador global se gestiona desde `AuthContext` y se resetea al entrar en la página de notificaciones.

---

## 💬 Menciones

- Escribe `@` en cualquier input de texto para ver sugerencias de usuarios
- Prioriza usuarios a los que sigues, con fallback a búsqueda global
- Los `@username` se renderizan como texto clicable que navega al perfil

---

## 📱 Navegación

**Web (≥ 768px)** — Sidebar colapsable (220px / 60px):
Home · Mis Cafés · Mapa · Notificaciones · Ajustes

**Móvil (< 768px)** — Bottom navigation bar:
☕ Home · 🫘 Cafés · 🗺️ Mapa · 🔔 Notificaciones · 👤 Perfil

> En móvil, el perfil tiene botón de engranaje para ir a Ajustes.

---

## 🚀 Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/chenifero/beanlog.git
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

> `SERPAPI_KEY` y `GROQ_KEY` se configuran únicamente como secrets en las Edge Functions de Supabase, nunca en el frontend.

---

## 📋 Backlog

- [ ] Buscador de compra con rotación de proveedores AI (Groq → Together → OpenRouter)
- [ ] Comparador de catas — superponer múltiples radares con Recharts
- [ ] Exportar cata como tarjeta `.jpg` en formato 9:16 para Instagram Stories

---

<div align="center">

**Proyecto TFG DAM — en desarrollo activo 🚀**

</div>

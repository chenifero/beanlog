BeanLog/
├── 📄 index.html              # HTML base, punto de entrada
├── 📄 vite.config.js          # Configuración de Vite
├── 📄 package.json            # Dependencias del proyecto
├── 📄 .env.local              # Variables de entorno (Supabase keys)
├── 📄 .gitignore              # Archivos ignorados por Git
│
├── 📁 public/                 # Archivos estáticos públicos
│   ├── 📄 manifest.webmanifest  # Config PWA (nombre, iconos, colores)
│   ├── 📄 robots.txt            # Reglas para buscadores
│   └── 📁 icons/              # Iconos de la PWA
│
├── 📁 logos/                  # Variantes del logo de BeanLog
│
├── 📁 src/                    # 👈 Todo el código vive aquí
│
├── 📁 supabase/               # Configuración de Supabase
│   ├── 📁 migrations/         # SQLs de creación de tablas (ejecutar en orden)
│   └── 📁 functions/          # Edge Functions (OCR, AI, etc.)
│
└── 📁 skills/                 # Guías de buenas prácticas para Claude Code
```

---


src/
│
├── 📄 main.jsx                # Arranca la app → monta App.jsx en el HTML
├── 📄 App.jsx                 # Define las rutas (qué página mostrar según la URL)
│
├── 📁 pages/                  # Pantallas completas
│   ├── 📄 LoginPage.jsx       # /login
│   ├── 📄 RegisterPage.jsx    # /register
│   └── 📄 HomePage.jsx        # /home → pantalla principal
│
├── 📁 components/             # Piezas reutilizables de UI
│   ├── 📁 layout/             # Estructura visual de la app
│   │   ├── 📄 AppShell.jsx    # Contenedor principal (une Sidebar/BottomNav + página)
│   │   ├── 📄 Sidebar.jsx     # Navegación lateral → solo en WEB
│   │   └── 📄 BottomNav.jsx   # Navegación inferior → solo en MÓVIL
│   │
│   ├── 📁 ui/                 # Componentes básicos reutilizables
│   │   ├── 📄 Button.jsx      # Botón con variantes (primary, secondary...)
│   │   ├── 📄 Card.jsx        # Tarjeta contenedora
│   │   ├── 📄 Input.jsx       # Campo de texto
│   │   ├── 📄 Avatar.jsx      # Foto de perfil del usuario
│   │   ├── 📄 Badge.jsx       # Etiqueta pequeña (ej: tipo de proceso)
│   │   └── 📄 Spinner.jsx     # Indicador de carga
│   │
│   ├── 📁 tasting/            # 🫘 Componentes de catas
│   │   └── (por crear)        # RadarChart, TastingCard, TastingForm...
│   │
│   ├── 📁 social/             # 👥 Componentes de red social
│   │   └── (por crear)        # PostCard, LikeButton, CommentList...
│   │
│   ├── 📁 map/                # 🗺️ Componentes del mapa
│   │   └── (por crear)        # CoffeeShopMap, MapMarker...
│   │
│   └── 📁 onboarding/         # 🎓 Tutorial para nuevos usuarios
│       └── (por crear)        # OnboardingFlow, OnboardingStep...
│
├── 📁 services/               # Comunicación con Supabase
│   ├── 📄 supabase.js         # Inicializa el cliente de Supabase
│   └── 📄 authService.js      # login(), register(), logout()
│   └── (por crear)            # tastingService.js, postService.js...
│
├── 📁 context/                # Estado global compartido
│   ├── 📄 AuthContext.jsx     # Usuario logueado accesible desde cualquier componente
│   └── 📄 ToastContext.jsx    # Sistema de notificaciones globales
│
├── 📁 hooks/                  # Lógica reutilizable
│   └── 📄 useMediaQuery.js    # Detecta si es móvil o escritorio
│
├── 📁 styles/                 # Estilos globales
│   ├── 📄 global.css          # Variables CSS (paleta de colores, etc.)
│   ├── 📄 reset.css           # Normaliza estilos entre navegadores
│   ├── 📄 typography.css      # Fuentes: Playfair Display + DM Sans
│   └── 📄 animations.css      # Animaciones GSAP y CSS
│
├── 📁 assets/                 # Imágenes, iconos, recursos estáticos
│
└── 📁 utils/                  # Funciones de utilidad genéricas
    └── (por crear)            # formatDate(), formatScore()...

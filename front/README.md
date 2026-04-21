# Frontend Activo

Aplicación React con TypeScript

## Funcionalidades

- Login con contraseña
- ABM de alumnos con foto (crop circular), color, documento, fecha de nacimiento, objetivo
- ABM de ejercicios con tags/categorías
- Merge de ejercicios duplicados
- ABM de rutinas compuestas por días, sets (circuitos o series) y ejercicios con repeticiones/peso
- Asignación de rutinas a alumnos
- Dashboard de entrenamiento en tiempo real con hasta 6 alumnos simultáneos, optimizado para TV de 55"
- Sincronización entre dispositivos vía WebSocket (cambios se reflejan en todas las pantallas)
- Registro y visualización de historial de entrenamientos con filtros por alumno, rutina y fecha
- Snapshot del detalle de cada entrenamiento completado
- Exportación de listados e historial a Excel (.xls)
- Configuración del sistema (nombre, logo, unidades, reloj)
- Página de diagnóstico del sistema
- Celebración animada al completar un entrenamiento

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Producción

```bash
npm run build
```

## Dependencias

### Producción
- **react** / **react-dom**: Librería de UI, renderizado de componentes
- **react-router-dom**: Enrutamiento SPA (navegación entre páginas sin recargar)
- **react-easy-crop**: Componente de recorte de imágenes con zoom y drag (usado para fotos de alumnos con crop circular)
- **xlsx**: Generación de archivos Excel (.xls) para exportar listados de alumnos e historial

### Desarrollo
- **vite**: Bundler y dev server (build rápido con HMR)
- **@vitejs/plugin-react**: Plugin de Vite para soporte de React (JSX, Fast Refresh)
- **typescript**: Tipado estático
- **@types/react** / **@types/react-dom** / **@types/node**: Tipos TypeScript para React y Node
- **tailwindcss**: Framework CSS utility-first para estilos
- **@tailwindcss/postcss** / **postcss** / **autoprefixer**: Pipeline de procesamiento CSS (Tailwind corre como plugin de PostCSS, autoprefixer agrega prefijos de vendor)
- **eslint**: Linter de código
- **@eslint/js** / **typescript-eslint**: Reglas de ESLint para JS y TypeScript
- **eslint-plugin-react-hooks**: Reglas para uso correcto de hooks de React
- **eslint-plugin-react-refresh**: Reglas para compatibilidad con Fast Refresh de Vite
- **globals**: Definiciones de variables globales para ESLint

### Opcionales
- **lightningcss-linux-arm64-musl**: Compilador CSS nativo para ARM64 (necesario para que Vite/Tailwind funcione en la Raspberry Pi durante el build en Docker)

## Estructura
```
front/src/
├── main.tsx              # Punto de entrada, monta App en el DOM
├── App.tsx               # Router principal, rutas protegidas, providers
├── index.css             # Estilos globales y configuración Tailwind
├── config/
│   └── api.ts                # URL base de la API
├── pages/
│   ├── Login.tsx             # Autenticación con contraseña
│   ├── Home.tsx              # Menú principal con accesos directos
│   ├── Training.tsx          # Dashboard de entrenamiento (hasta 6 alumnos)
│   ├── Trainee.tsx           # ABM de alumnos (lista y cards)
│   ├── Routines.tsx          # ABM de rutinas (lista y cards)
│   ├── Exercises.tsx         # ABM de ejercicios con paginación infinita
│   ├── ExerciseTags.tsx      # ABM de tags/agrupadores
│   ├── History.tsx           # Historial de entrenamientos con filtros y selección múltiple
│   ├── Settings.tsx          # Configuración del sistema y cambio de contraseña
│   └── Diagnostic.tsx        # Vista cruda de datos de la DB (desarrollo)
├── components/
│   ├── Navbar.tsx            # Menú lateral drawer con reloj opcional
│   ├── ProtectedRoute.tsx    # Wrapper que redirige a login si no hay JWT
│   ├── Modal.tsx             # Modal genérico reutilizable
│   ├── ConfirmDialog.tsx     # Diálogo de confirmación con loading
│   ├── PageHeader.tsx        # Título de página
│   ├── ViewToggle.tsx        # Toggle lista/cards
│   ├── ActionButton.tsx      # Botón de acción con variantes (edit/delete/neutral) y tooltip
│   ├── MultiSelectFilter.tsx # Filtro dropdown multi-selección
│   ├── TrainingTrainee.tsx   # Card de alumno en el dashboard de entrenamiento
│   ├── RoutineDayViewer.tsx  # Visualizador de rutina con auto-escala y navegación entre días
│   ├── TrainingDay.tsx       # Día de entrenamiento
│   ├── CompletionCelebration.tsx # Animación de festejo al completar entrenamiento
│   ├── TraineeModal.tsx      # Modal crear/editar alumno con foto y rutina
│   ├── TraineeAvatar.tsx     # Avatar circular con foto o inicial
│   ├── TraineePickerModal.tsx # Selector de alumno para agregar al dashboard
│   ├── ImageCropper.tsx      # Recorte circular de fotos con zoom
│   ├── RoutineModal.tsx      # Modal editor completo de rutina (días/sets/ejercicios)
│   ├── DaySet.tsx            # Editor de un set dentro de una rutina
│   ├── ExerciseModal.tsx     # Modal crear/editar ejercicio con tags
│   ├── ExercisePickerModal.tsx # Selector de ejercicio con filtros por tag
│   ├── MergeExercisesModal.tsx # Modal de unificación de ejercicios
│   └── HistorySnapshotModal.tsx # Modal con snapshot de ejercicios de un registro histórico
├── services/
│   ├── api.ts                # Funciones base HTTP (fetchJson, postJson, putJson, del) con auth
│   ├── authService.ts        # Login, logout, manejo de token
│   ├── traineeService.ts     # API de alumnos y fotos
│   ├── traineeRoutineService.ts # API de asignación alumno-rutina
│   ├── routineService.ts     # API de rutinas
│   ├── exerciseService.ts    # API de ejercicios y merge
│   ├── tagService.ts         # API de tags
│   ├── historyService.ts     # API de historial y snapshots
│   ├── activeTrainingService.ts # API de entrenamientos activos
│   └── settingsService.ts    # API de configuración y logo
├── hooks/
│   ├── useSettings.tsx       # Context provider + hook para configuración global del sistema
│   ├── usePageTitle.ts       # Hook para setear el título del documento
│   └── useTrainingSocket.ts  # Hook WebSocket para sincronización en tiempo real
├── store/
│   ├── crossTabStore.ts      # Store persistente cross-tab (localStorage)
│   └── useCrossTabStore.ts   # Hook para acceder al store cross-tab
├── types/
│   ├── api.ts                # Tipos de respuestas de la API
│   └── routine.ts            # Tipos y defaults de formularios de rutina
├── utils/
│   ├── cropImage.ts          # Recorte de imagen con canvas
│   ├── format.ts             # Formateo de fechas
│   └── string.ts             # Normalización de strings (búsqueda)
└── data/
    └── celebration-phrases.txt # Frases aleatorias para la animación de festejo
```

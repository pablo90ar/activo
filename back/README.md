# Backend Activo

Servidor Node.js con TypeScript

## Funcionalidades

- API REST para ABM de alumnos, ejercicios, tags, rutinas (días, sets, ejercicios por set)
- Asignación de rutinas a alumnos
- Gestión de entrenamiento activo (inicio, cambio de día, finalización)
- Registro de historial de entrenamientos completados con snapshot de la rutina al momento de completar
- Duplicación y edición de registros de historial
- Upload y procesamiento de fotos de alumnos (compresión automática con sharp)
- Upload de logo del sistema
- Configuración general (nombre del sistema, unidades, reloj, título de entrenamiento)
- Autenticación con JWT y contraseña hasheada con bcrypt
- Sincronización en tiempo real entre dispositivos vía WebSocket (cambios en entrenamiento, fotos, rutinas)
- Base de datos SQLite embebida


## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
npm run dev -- --host
```

## Producción

```bash
npm start
```

## Dependencias

### Producción
- **express**: Framework HTTP para definir rutas y middleware de la API REST
- **better-sqlite3**: Driver SQLite sincrónico (base de datos embebida, sin servidor externo)
- **ws**: Servidor WebSocket para sincronización en tiempo real entre dispositivos (cambios en entrenamiento, rutinas, fotos)
- **sharp**: Procesamiento de imágenes (compresión y resize de fotos de alumnos a 400x400 si superan 300KB)
- **multer**: Middleware para manejo de uploads multipart/form-data (fotos de alumnos y logo)
- **bcryptjs**: Hashing de contraseñas (almacenamiento seguro)
- **jsonwebtoken**: Generación y verificación de JWT para autenticación
- **cors**: Middleware para habilitar Cross-Origin Resource Sharing (permite que el frontend acceda al backend desde otro puerto/origen)

### Desarrollo
- **tsx**: Ejecutor de TypeScript directo (sin paso de compilación, usa esbuild internamente)
- **nodemon**: Reinicio automático del servidor al detectar cambios en archivos (para desarrollo)
- **typescript**: Compilador TypeScript
- **@types/bcryptjs** / **@types/better-sqlite3** / **@types/cors** / **@types/express** / **@types/jsonwebtoken** / **@types/multer** / **@types/node** / **@types/sharp** / **@types/ws**: Tipos TypeScript para cada dependencia

## Rutas de la API

Todas las rutas están bajo el prefijo `/api`.

### /api/healthcheck
- `GET /` — Health check del servidor

### /api/auth
- `POST /login` — Autenticación con contraseña, devuelve JWT
- `PUT /password` — Cambio de contraseña (requiere contraseña actual)

### /api/trainees
- `GET /` — Lista todos los alumnos
- `GET /:id` — Obtiene un alumno por ID
- `POST /` — Crea un alumno
- `PUT /:id` — Actualiza un alumno
- `DELETE /:id` — Elimina un alumno
- `GET /:id/routine/full` — Obtiene la rutina completa del alumno (días → sets → ejercicios con descripción y tags)
- `POST /:id/photo` — Sube foto del alumno (comprime a 400x400 JPEG si >300KB)
- `GET /:id/photo` — Obtiene la foto del alumno
- `DELETE /:id/photo` — Elimina la foto del alumno

### /api/routines
- `GET /` — Lista rutinas con conteo de alumnos y días (filtrable por is_template)
- `GET /:id` — Obtiene una rutina por ID
- `GET /:id/full` — Obtiene rutina completa (días → sets → ejercicios)
- `GET /:id/trainees` — Lista alumnos asignados a una rutina
- `POST /` — Crea una rutina con sus días, sets y ejercicios
- `PUT /:id` — Actualiza una rutina (upsert de días/sets/ejercicios)
- `POST /:id/duplicate` — Duplica una rutina completa
- `DELETE /:id` — Elimina una rutina

### /api/exercises
- `GET /` — Lista ejercicios paginados con conteo de rutinas y tags (filtrable por búsqueda, tags, vacíos)
- `GET /:id` — Obtiene un ejercicio con sus tag_ids
- `GET /:id/routines` — Lista rutinas que usan un ejercicio
- `POST /` — Crea un ejercicio con tags opcionales
- `PUT /:id` — Actualiza un ejercicio y sus tags
- `DELETE /:id` — Elimina un ejercicio (falla si está en uso en rutinas)
- `POST /merge` — Unifica ejercicios: reasigna referencias de ejercicios origen al destino en exercises_set

### /api/tags
- `GET /` — Lista tags con conteo de ejercicios
- `GET /:id` — Obtiene un tag por ID
- `POST /` — Crea un tag
- `PUT /:id` — Actualiza nombre de un tag
- `DELETE /:id` — Elimina un tag
- `GET /:id/exercises` — Lista ejercicios asociados a un tag

### /api/exercise-tags
- `GET /` — Lista todas las relaciones ejercicio-tag

### /api/trainee-routines
- `GET /` — Lista todas las asignaciones alumno-rutina
- `GET /:id` — Obtiene asignaciones de un alumno
- `POST /` — Asigna una rutina a un alumno (reemplaza la anterior)
- `DELETE /` — Desasigna la rutina de un alumno

### /api/training-days
- `GET /` — Lista días de entrenamiento (filtrable por routine_id)
- `GET /:id` — Obtiene un día por ID

### /api/day-sets
- `GET /` — Lista sets (filtrable por training_day_id)
- `GET /:id` — Obtiene un set por ID

### /api/exercises-sets
- `GET /` — Lista ejercicios de sets (filtrable por day_set_id)
- `GET /:id` — Obtiene un ejercicio de set por ID

### /api/history
- `GET /` — Lista historial de entrenamientos (filtrable por alumno, rutina, día, rango de fechas)
- `GET /:id` — Obtiene un registro de historial
- `GET /:id/snapshot` — Obtiene el snapshot de ejercicios de un registro (datos estáticos agrupados por set)
- `POST /` — Registra un entrenamiento completado con snapshot de ejercicios del día
- `PATCH /:id` — Actualiza la fecha de un registro
- `POST /:id/duplicate` — Duplica un registro (con su snapshot)
- `DELETE /` — Elimina registros por array de IDs

### /api/active-training
- `GET /` — Lista entrenamientos activos (alumnos entrenando ahora)
- `POST /` — Inicia un entrenamiento (agrega alumno al dashboard)
- `PUT /:trainee_id` — Actualiza el día activo de un alumno
- `DELETE /:trainee_id` — Detiene el entrenamiento de un alumno

### /api/settings
- `GET /` — Obtiene configuración del sistema
- `PUT /` — Actualiza configuración (nombre, reloj, unidades, título)
- `GET /logo` — Obtiene el logo del sistema
- `POST /logo` — Sube un nuevo logo (.png)


## Estructura
```
back/
├── index.ts              # Punto de entrada
├── src/
|   ├── db.ts             # Conexión SQLite + migraciones
|   ├── ws.ts             # WebSocket server + broadcast
|   ├── authMiddleware.ts # Middleware JWT
|   └── routes/
|       ├── index.ts          # Router principal, monta todas las rutas
|       ├── auth.ts           # Login y cambio de contraseña
|       ├── trainees.ts       # CRUD alumnos + fotos
|       ├── routines.ts       # CRUD rutinas + duplicación
|       ├── routineHelpers.ts # Lógica compartida de save/upsert de días/sets/ejercicios
|       ├── exercises.ts      # CRUD ejercicios + merge
|       ├── tags.ts           # CRUD tags
|       ├── exercise-tags.ts  # Relaciones ejercicio-tag
|       ├── trainee-routines.ts  # Asignación alumno-rutina
|       ├── training-days.ts     # Lectura de días de entrenamiento
|       ├── day-sets.ts          # Lectura de sets
|       ├── exercises-sets.ts    # Lectura de ejercicios en sets
|       ├── history.ts           # Historial + snapshots
|       ├── active-training.ts   # Entrenamientos en curso
|       └── settings.ts          # Configuración del sistema + logo
```

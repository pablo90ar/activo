# ACTIVO

Gestor de rutinas de entrenamiento.

Monorepo con frontend web y backend API para la gestión de rutinas en un gimnasio.

## Objetivo

El proyecto satisface la necesidad de gestionar y exhibir rutinas de entrenamiento para los clientes de un gimnasio con una capacidad máxima de 6 asistentes por turno. Las rutinas se visualizan en un televisor y se administran desde una PC y/o el smartphone del entrenador de manera local e inalámbrica. Este sistema reemplaza la gestión manual de múltiples planillas de Excel (antes escritas en papel).

## Funcionalidades

- ABM de alumnos con foto, color identificatorio, documento, fecha de nacimiento, objetivo
- ABM de ejercicios con tags/categorías y merge de duplicados
- ABM de rutinas compuestas por días, sets (series o circuitos) y ejercicios con repeticiones/peso
- Asignación de rutinas a alumnos
- Dashboard de entrenamiento en tiempo real con hasta 6 alumnos simultáneos
- Sincronización entre dispositivos vía WebSocket
- Registro de historial de entrenamientos con snapshot de ejercicios realizados
- Exportación de listados e historial a Excel (.xls)
- Autenticación con JWT
- Configuración del sistema (nombre, logo, unidades, reloj)
- Optimizado para pantallas grandes (55 pulgadas) y dispositivos móviles

## Características

- Frontend y backend desplegados en el mismo hardware conectado a la red local
- Servidor: Raspberry Pi 3B+ con OS Lite 64 bits sin UI (arquitectura armv8)
- Opera dentro de la red local domiciliaria
- No tiene servicios expuestos a internet
- Acceso remoto vía Tailscale (VPN) + SSH
- Se accede desde una PC y se adapta a la pantalla de un televisor

## Stack

### Backend ([ver README](back/README.md))
- Node.js con TypeScript
- Express.js (API REST)
- SQLite con better-sqlite3
- WebSocket para sincronización en tiempo real
- Sharp para procesamiento de imágenes

### Frontend ([ver README](front/README.md))
- React con TypeScript
- Tailwind CSS
- Vite

### Paleta de colores
- `#9AA595` (sage)
- `#6C766B` (olive)
- `#ECEBE2` (cream)
- `#5B7E6A` (acción positiva)
- `#FF0000` (acción de borrado)

## Despliegue

1. Push de cambios al repositorio
2. GitHub Actions hace build del frontend y del backend
3. GitHub Actions genera imagen con docker build
4. GitHub Actions pushea imagen a Docker Hub
5. Raspberry ejecuta docker compose con servicio de actualización periódica
6. Cuando existe una nueva versión, baja la nueva imagen de Docker Hub
7. Re-ejecuta docker compose para levantar servicios actualizados

## Acceso remoto

Obtener IP del servidor:
```bash
tailscale ip -4
```

Conectar por SSH:
```bash
ssh <usuario>@<ip_tailscale>
```

## Tools

Scripts de configuración y administración de la Raspberry Pi en la carpeta `tools/`:

### Setup inicial (ejecutar en orden)
- `0_config_basic.sh` — Instrucciones de configuración básica (WiFi, usuario, hostname, git)
- `1_config_hostname.sh` — Instala avahi-daemon para acceso por hostname.local en lugar de IP local
- `2_disable_power_management.sh` — Desactiva power save de WiFi y USB autosuspend de la raspberry
- `3_install_locales.sh` — Configura locales (en_GB + es_AR), zona horaria Argentina
- `4_install_docker.sh` — Instala Docker y Docker Compose
- `5_install_sqlite.sh` — Instala SQLite3 CLI
- `6_setup_wifi_watchdog.sh` — Instala watchdog que monitorea WiFi y Tailscale cada 5 minutos
- `7_db_init.sh` — Crea la base de datos SQLite con el esquema completo
- `8_docker_update_images.sh` — Baja las últimas imágenes de Docker Hub y reinicia servicios
- `9_docker_create_service.sh` — Crea servicio systemd para auto-inicio de docker compose

### Operación
- `start.sh` — Levanta los servicios con docker compose
- `stop.sh` — Detiene los servicios
- `docker_build_local.sh` — Build local de imágenes para ARM y push a Docker Hub

### Base de datos
- `db_seed.sh` — Carga datos de ejemplo (alumnos, ejercicios, rutinas, historial)
- `db_clean.sh` — Elimina todos los datos de la base (con confirmación)

### Mantenimiento
- `clear_network_watchdog_logs.sh` — Limpia el log del watchdog de red

# ACTIVO
Administración y visualización de rutinas de entrenamiento.

Funcionalidades:
- ABM de alumnos, ejercicios, rutinas
- Registro de días entrenados
- Dashboard con hasta 6 rutinas de alumnos

Características:
- Se ejecuta en una raspberry pi con OS lite de 32 bits y sin UI
- Se opera dentro de la red local domiciliaria. 
- No expuesto a internet salvo por un acceso para administración remota
- Se accede desde una PC y se comparte pantalla a un televisor

# Backend
Servidor de node.js con npm

# Frontend
React WEB buildeado por bun.js

# Despliegue
- Pushear cambios a Repo de Gitlab público 
- Hacer un build del frontend
- Generar imágen con docker build
- Pushear imagen a dockerhub
- Conectar raspberry por ssh
- Bajar nueva imagen de dockerhub
- Reejecutar docker compose
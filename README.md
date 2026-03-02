# ACTIVO
Gestor de rutinas de entrenamiento.

### Objetivo

El proyecto se realiza para satisfacer la necesidad de gestionar y exhibir las rutinas de entrenamiento para los clientes de un gimnasio pequeño con una capacidad máxima de 6 asistentes por turno. Las rutinas deben visualizarse en un televisor, y administrarse desde una PC y/o el smartphone de un entrenador de manera local e inalámbrica. Este sistema mejora la metodología usada anteriormente, que consistía en la gestión manual de múltiples planillas de Excel (antes escritas en papel) lo cual no es lo más adecuado.

Funcionalidades:
- ABM de alumnos, ejercicios, rutinas
- Registro de días entrenados
- Dashboard con hasta 6 rutinas de alumnos
- Optimizado para visualizarlo en pantallas grandes (55 pulgadas)

Características:
- Se ejecuta en una raspberry pi con OS lite de 32 bits y sin UI
- Se opera dentro de la red local domiciliaria. 
- No expuesto a internet salvo por un acceso ssh para administración remota
- Se accede desde una PC y se extiende pantalla a un televisor

# Backend
Servidor de Node.js (npm)
Base de datos SQLite
Rutas con Express.js

# Frontend
Servidor React WEB (npm)
Estilos con Tailwind

# Despliegue
- Pushear cambios a Repo de Gitlab público 
- Hacer un build del frontend
- Generar imágen con docker build
- Pushear imagen a dockerhub
- Conectar raspberry por ssh
- Bajar nueva imagen de dockerhub
- Reejecutar docker compose
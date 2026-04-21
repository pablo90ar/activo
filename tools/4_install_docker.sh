#!/bin/bash

# Actualizar sistema
sudo apt update

#  Agregar repo oficial e instalar
curl -fsSL https://get.docker.com | sh

# Añadir usuario actual al grupo de docker
sudo usermod -aG docker $USER
newgrp docker

# Reiniciar sesión para aplicar cambios
docker version
docker compose version

# Ejecutar prueba
docker run hello-world

# Si se pierde conexión con la rasberry reiniciar
sudo reboot
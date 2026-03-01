# PASO 2 — Agregar repo oficial pero apuntando a bookworm
sudo apt update
sudo apt install ca-certificates curl gnupg -y

sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/raspbian/gpg | \
sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=armhf signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/raspbian bookworm stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

dpkg --print-architecture

# PASO 3 — Instalar Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# PASO 4 — Activar y probar
sudo systemctl enable docker
sudo systemctl start docker
sudo docker run hello-world

# PASO 5 — Añadir usuario actual al grupo de docker
sudo usermod -aG docker $USER

# PASO 6 — Reiniciar sesión para aplicar cambios
docker version
docker compose version

# PASO 7 - Si se pierde conexión con la rasberry reiniciar
sudo systemctl stop docker
sudo reboot
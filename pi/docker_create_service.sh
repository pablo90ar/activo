# PASO 1 - Crear servicio
sudo nano /etc/systemd/system/activo.service

# PASO 2 - Editar archivo
[Unit]
Description=Activo Docker Compose Stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
WorkingDirectory=/home/admin/activo
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
RemainAfterExit=true
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target

# PASO 3 - Verificar ruta docker
which docker

# PASO 4 - Activar servicio
sudo systemctl daemon-reload
sudo systemctl enable activo.service
sudo systemctl start activo.service
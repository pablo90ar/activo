#!/bin/bash
# Configuracion para que el hostname quede en xxxx.local

sudo apt install avahi-daemon
sudo systemctl enable avahi-daemon
sudo systemctl start avahi-daemon

# Setear hostname
# sudo hostnamectl set-hostname activo

sudo reboot
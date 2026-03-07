#!/bin/bash

# Script para deshabilitar el power management en Raspberry Pi
# Esto evita que la interfaz WiFi entre en modo de ahorro de energía

# Verificar si se está ejecutando como root
if [ "$EUID" -ne 0 ]; then
    echo "Este script debe ejecutarse como root (sudo)"
    exit 1
fi

# Deshabilitar power management para WiFi
echo "Deshabilitando power management para WiFi..."
iwconfig wlan0 power off 2>/dev/null

# Hacer el cambio permanente agregando configuración al archivo rc.local
if ! grep -q "iwconfig wlan0 power off" /etc/rc.local; then
    # Crear backup del archivo rc.local
    cp /etc/rc.local /etc/rc.local.backup
    
    # Insertar comando antes de "exit 0"
    sed -i '/^exit 0/i iwconfig wlan0 power off' /etc/rc.local
    echo "Configuración agregada a /etc/rc.local para persistencia"
fi

# Verificar el estado actual
echo "Estado actual del power management:"
iwconfig wlan0 | grep "Power Management"

echo "Power management deshabilitado exitosamente"
echo "El cambio será permanente después del reinicio"
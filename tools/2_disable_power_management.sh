#!/bin/bash

set -e

echo "🔧 Desactivando power management en Raspberry Pi..."

# -----------------------------
# 📶 WIFI POWER SAVE OFF
# -----------------------------

DHCPCD_CONF="/etc/dhcpcd.conf"

if grep -q "wireless_power_save off" "$DHCPCD_CONF"; then
    echo "✔ WiFi power save ya estaba desactivado en dhcpcd.conf"
else
    echo "➡ Desactivando WiFi power save en dhcpcd.conf..."
    cat <<EOF | sudo tee -a "$DHCPCD_CONF" > /dev/null

interface wlan0
    wireless_power_save off
EOF
fi

# Aplicar inmediatamente
echo "➡ Aplicando cambio inmediato de WiFi..."
sudo iw dev wlan0 set power_save off || true

# -----------------------------
# 🔌 USB AUTOSUSPEND OFF
# -----------------------------

CMDLINE="/boot/firmware/cmdline.txt"

if grep -q "usbcore.autosuspend=-1" "$CMDLINE"; then
    echo "✔ USB autosuspend ya estaba desactivado en cmdline.txt"
else
    echo "➡ Desactivando USB autosuspend en cmdline.txt..."
    sudo sed -i '1 s/$/ usbcore.autosuspend=-1/' "$CMDLINE"
fi

# Aplicar inmediatamente
echo "➡ Aplicando cambio inmediato de USB autosuspend..."
echo -1 | sudo tee /sys/module/usbcore/parameters/autosuspend > /dev/null || true

# -----------------------------
# ✅ VERIFICACIÓN
# -----------------------------

echo ""
echo "🔍 Estado actual:"

echo -n "WiFi power save: "
iw dev wlan0 get power_save 2>/dev/null || echo "No disponible"

echo -n "USB autosuspend: "
cat /sys/module/usbcore/parameters/autosuspend 2>/dev/null || echo "No disponible"

echo ""
echo "✅ Listo. Reiniciá para asegurar persistencia total:"
echo "   sudo reboot"
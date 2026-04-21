#!/bin/bash

set -e

SCRIPT_PATH="/usr/local/bin/wifi_watchdog.sh"
LOG_FILE="/var/log/wifi_watchdog.log"
CRON_JOB="*/5 * * * * $SCRIPT_PATH"
LOGROTATE_FILE="/etc/logrotate.d/wifi_watchdog"

echo "🔧 Instalando WiFi Watchdog..."

# -----------------------------
# 📄 Crear script watchdog
# -----------------------------
echo "➡ Creando script en $SCRIPT_PATH..."

sudo tee "$SCRIPT_PATH" > /dev/null << 'EOF'
#!/bin/bash

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

IFACE="wlan0"
LOG="/var/log/wifi_watchdog.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG"
}

WIFI_STATE=$(wpa_cli -i "$IFACE" status 2>/dev/null | grep wpa_state | cut -d= -f2)
IP_ADDR=$(ip -4 addr show "$IFACE" | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
TS_IP=$(tailscale ip -4 2>/dev/null)

if [ -n "$TS_IP" ]; then
    ping -c 2 -W 2 "$TS_IP" > /dev/null 2>&1
    PING_OK=$?
else
    PING_OK=1
fi

if [ -z "$WIFI_STATE" ]; then
    log "ERROR: No se pudo obtener estado de WiFi"
elif [ "$WIFI_STATE" != "COMPLETED" ]; then
    log "WiFi NO conectado (estado: $WIFI_STATE)"
elif [ -z "$IP_ADDR" ]; then
    log "WiFi conectado pero SIN IP"
elif [ -z "$TS_IP" ]; then
    log "WiFi OK (IP: $IP_ADDR) pero Tailscale sin IP"
elif [ $PING_OK -ne 0 ]; then
    log "WiFi OK (IP: $IP_ADDR) pero Tailscale sin conectividad (TS: $TS_IP)"
else
    log "OK - WiFi (IP: $IP_ADDR) Tailscale (IP: $TS_IP)"
fi
EOF

# Permisos
sudo chmod +x "$SCRIPT_PATH"

# -----------------------------
# 📂 Crear archivo de log persistente
# -----------------------------
echo "➡ Creando archivo de log en $LOG_FILE..."
sudo touch "$LOG_FILE"
sudo chmod 644 "$LOG_FILE"

# -----------------------------
# ⏱️ Configurar cron
# -----------------------------
echo "➡ Configurando cron cada 5 minutos..."

# Evitar duplicados
REAL_USER="${SUDO_USER:-$USER}"
sudo crontab -l 2>/dev/null | grep -v "$SCRIPT_PATH" | sudo crontab -
sudo bash -c "(crontab -l 2>/dev/null; echo \"$CRON_JOB\") | crontab -"

# -----------------------------
# 🔄 Configurar logrotate (opcional pero recomendado)
# -----------------------------
echo "➡ Configurando logrotate..."

sudo tee "$LOGROTATE_FILE" > /dev/null << EOF
$LOG_FILE {
    weekly
    rotate 4
    compress
    missingok
    notifempty
}
EOF

# -----------------------------
# ✅ Verificación
# -----------------------------
echo ""
echo "✅ Instalación completa"
echo ""

echo "📌 Script:"
echo "   $SCRIPT_PATH"

echo "📌 Log:"
echo "   $LOG_FILE"

echo "📌 Cron (root):"
sudo crontab -l | grep wifi_watchdog

echo ""
echo "👉 Para ver logs en vivo:"
echo "   tail -f $LOG_FILE"
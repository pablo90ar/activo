#!/bin/bash

set -e

echo "🌍 Configurando locales (en_GB.UTF-8 + es_AR.UTF-8)..."

# -----------------------------
# 📦 Instalar paquete locales si falta
# -----------------------------
if ! dpkg -l | grep -q "^ii  locales "; then
    echo "➡ Instalando paquete locales..."
    sudo apt update
    sudo apt install -y locales
fi

# -----------------------------
# 📝 Habilitar locales en locale.gen
# -----------------------------
LOCALE_GEN="/etc/locale.gen"

echo "➡ Habilitando locales en $LOCALE_GEN..."

sudo sed -i 's/^# *en_GB.UTF-8 UTF-8/en_GB.UTF-8 UTF-8/' "$LOCALE_GEN"
sudo sed -i 's/^# *es_AR.UTF-8 UTF-8/es_AR.UTF-8 UTF-8/' "$LOCALE_GEN"

# Si no existen, agregarlas
grep -q "^en_GB.UTF-8 UTF-8" "$LOCALE_GEN" || echo "en_GB.UTF-8 UTF-8" | sudo tee -a "$LOCALE_GEN"
grep -q "^es_AR.UTF-8 UTF-8" "$LOCALE_GEN" || echo "es_AR.UTF-8 UTF-8" | sudo tee -a "$LOCALE_GEN"

# -----------------------------
# 🔄 Generar locales
# -----------------------------
echo "➡ Generando locales..."
sudo locale-gen

# -----------------------------
# ⚙️ Configurar locale por defecto
# -----------------------------
echo "➡ Configurando locale por defecto (en_GB.UTF-8)..."
sudo update-locale LANG=en_GB.UTF-8 LC_ALL=en_GB.UTF-8

# -----------------------------
# 🧹 Limpiar variables inconsistentes en sesión actual
# -----------------------------
echo "➡ Limpiando variables de entorno actuales..."

unset LC_ALL || true
unset LC_CTYPE || true
unset LC_NUMERIC || true
unset LC_TIME || true
unset LC_MESSAGES || true
unset LC_MONETARY || true
unset LC_ADDRESS || true
unset LC_IDENTIFICATION || true
unset LC_MEASUREMENT || true
unset LC_PAPER || true
unset LC_TELEPHONE || true
unset LC_NAME || true

# -----------------------------
# 🕐 Configurar zona horaria
# -----------------------------
echo "➡ Configurando zona horaria America/Argentina/Buenos_Aires..."
sudo timedatectl set-timezone America/Argentina/Buenos_Aires

# -----------------------------
# 🔍 Verificación
# -----------------------------
echo ""
echo "✅ Locales generadas:"
locale -a | grep -E "en_GB|es_AR" || true

echo ""
echo "📌 Configuración actual:"
cat /etc/default/locale || true

echo ""
echo "👉 Recomendado: reiniciar o ejecutar:"
echo "   source /etc/default/locale"
echo "   o"
echo "   sudo reboot"
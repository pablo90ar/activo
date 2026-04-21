#!/bin/bash

# Script para limpiar todos los datos de la base de datos SQLite
# Uso: ./db_clean.sh [ruta_a_db]

DB_PATH="${1:-../back/data/activo.db}"

if [ ! -f "$DB_PATH" ]; then
    echo "Base de datos no encontrada en: $DB_PATH"
    exit 1
fi

echo "Limpiando base de datos: $DB_PATH"
echo "ADVERTENCIA: Se eliminarán TODOS los datos!"
read -p "¿Estás seguro? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operación cancelada"
    exit 0
fi

sqlite3 "$DB_PATH" <<EOF
PRAGMA foreign_keys = OFF;

DELETE FROM exercise_register;
DELETE FROM history;
DELETE FROM active_training;
DELETE FROM exercises_set;
DELETE FROM day_set;
DELETE FROM training_day;
DELETE FROM trainee_routine;
DELETE FROM exercise_tag;
DELETE FROM exercise_tool;
DELETE FROM tag;
DELETE FROM tool;
DELETE FROM generic_exercise;
DELETE FROM routine;
DELETE FROM trainee;

PRAGMA foreign_keys = ON;

VACUUM;
EOF

echo "Base de datos limpiada correctamente!"
echo "Reiniciar el contenedor del backend: docker restart activo-backend"

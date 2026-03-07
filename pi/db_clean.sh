#!/bin/bash

# Script to clean all data from SQLite database
# Usage: ./clean_db.sh [path_to_db]
# Run from Raspberry Pi host, not inside container

DB_PATH="${1:-../data/activo.db}"

if [ ! -f "$DB_PATH" ]; then
    echo "Database not found at: $DB_PATH"
    exit 1
fi

echo "Cleaning database: $DB_PATH"
echo "WARNING: This will delete ALL data!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled"
    exit 0
fi

sqlite3 "$DB_PATH" <<EOF
-- Disable foreign keys temporarily
PRAGMA foreign_keys = OFF;

-- Delete all data from tables (order matters due to dependencies)
DELETE FROM exercise_register;
DELETE FROM trainee_exercise_register;
DELETE FROM completed_training_day;
DELETE FROM exercises_set;
DELETE FROM day_set;
DELETE FROM training_day;
DELETE FROM trainee_routine;
DELETE FROM exercise_tool;
DELETE FROM exercise_group;
DELETE FROM tool;
DELETE FROM muscle_group;
DELETE FROM generic_exercise;
DELETE FROM routine;
DELETE FROM trainee;

-- Re-enable foreign keys
PRAGMA foreign_keys = ON;

-- Vacuum to reclaim space
VACUUM;
EOF

echo "Database cleaned successfully!"
echo "Restart backend container to apply changes: docker restart activo-backend"

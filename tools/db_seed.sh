#!/bin/bash

# Script para cargar datos de ejemplo en la base de datos SQLite
# Uso: ./db_seed.sh [ruta_a_db]

DB_PATH="${1:-../back/data/activo.db}"

if [ ! -f "$DB_PATH" ]; then
    echo "Base de datos no encontrada en: $DB_PATH"
    exit 1
fi

echo "Cargando datos de ejemplo en: $DB_PATH"

sqlite3 "$DB_PATH" <<EOF
PRAGMA foreign_keys = ON;

-- Alumnos
INSERT INTO trainee (trainee_id, name, document, birth_date, gender, goal, color, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Juan Pérez', '12345678', '1990-05-15', 1, 'Ganar masa muscular', '#4A90D9', datetime('now'), datetime('now')),
('22222222-2222-2222-2222-222222222222', 'María García', '87654321', '1995-08-20', 0, 'Perder peso', '#D94A6B', datetime('now'), datetime('now')),
('33333333-3333-3333-3333-333333333333', 'Carlos López', '11223344', '1988-03-10', 1, 'Mantenimiento', '#D9A34A', datetime('now'), datetime('now'));

-- Tags
INSERT INTO tag (group_id, name, image_id) VALUES
('a1111111-1111-1111-1111-111111111111', 'Pecho', NULL),
('a2222222-2222-2222-2222-222222222222', 'Espalda', NULL),
('a3333333-3333-3333-3333-333333333333', 'Piernas', NULL),
('a4444444-4444-4444-4444-444444444444', 'Hombros', NULL),
('a5555555-5555-5555-5555-555555555555', 'Brazos', NULL),
('a6666666-6666-6666-6666-666666666666', 'Core', NULL);

-- Ejercicios
INSERT INTO generic_exercise (exercise_id, name, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'Press de banca', 'Ejercicio de pecho con barra'),
('c2222222-2222-2222-2222-222222222222', 'Sentadilla', 'Ejercicio de piernas con barra'),
('c3333333-3333-3333-3333-333333333333', 'Peso muerto', 'Ejercicio de espalda y piernas'),
('c4444444-4444-4444-4444-444444444444', 'Press militar', 'Ejercicio de hombros con barra'),
('c5555555-5555-5555-5555-555555555555', 'Dominadas', 'Ejercicio de espalda con peso corporal'),
('c6666666-6666-6666-6666-666666666666', 'Curl de bíceps', 'Ejercicio de brazos con mancuernas'),
('c7777777-7777-7777-7777-777777777777', 'Plancha', 'Ejercicio de core con peso corporal'),
('c8888888-8888-8888-8888-888888888888', 'Remo con barra', 'Ejercicio de espalda con barra'),
('c9999999-9999-9999-9999-999999999999', 'Fondos en paralelas', 'Ejercicio de pecho y tríceps'),
('c1010101-1010-1010-1010-101010101010', 'Estocadas', 'Ejercicio de piernas con mancuernas');

-- Relaciones ejercicio-tag
INSERT INTO exercise_tag (exercise_id, group_id) VALUES
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
('c2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333'),
('c3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222'),
('c3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333'),
('c4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444'),
('c5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222'),
('c6666666-6666-6666-6666-666666666666', 'a5555555-5555-5555-5555-555555555555'),
('c7777777-7777-7777-7777-777777777777', 'a6666666-6666-6666-6666-666666666666'),
('c8888888-8888-8888-8888-888888888888', 'a2222222-2222-2222-2222-222222222222'),
('c9999999-9999-9999-9999-999999999999', 'a1111111-1111-1111-1111-111111111111'),
('c9999999-9999-9999-9999-999999999999', 'a5555555-5555-5555-5555-555555555555'),
('c1010101-1010-1010-1010-101010101010', 'a3333333-3333-3333-3333-333333333333');

-- Rutinas
INSERT INTO routine (routine_id, name, description, creation_date, edition_date, is_template, created_at, updated_at) VALUES
('d1111111-1111-1111-1111-111111111111', 'Rutina Fullbody', 'Rutina de cuerpo completo 3 veces por semana', date('now'), date('now'), 0, datetime('now'), datetime('now')),
('d2222222-2222-2222-2222-222222222222', 'Rutina Push/Pull', 'Rutina dividida en empuje y tirón', date('now'), date('now'), 1, datetime('now'), datetime('now'));

-- Asignación alumno-rutina
INSERT INTO trainee_routine (routine_trainee_id, trainee_id, routine_id) VALUES
('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111'),
('e2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111'),
('e3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222');

-- Días de entrenamiento - Rutina Fullbody
INSERT INTO training_day (training_day_id, routine_id, name, list_order) VALUES
('f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Día A', 1),
('f2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'Día B', 2);

-- Días de entrenamiento - Rutina Push/Pull
INSERT INTO training_day (training_day_id, routine_id, name, list_order) VALUES
('f3333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'Push', 1),
('f4444444-4444-4444-4444-444444444444', 'd2222222-2222-2222-2222-222222222222', 'Pull', 2);

-- Sets del Día A
INSERT INTO day_set (day_set_id, training_day_id, list_order, iterations, is_warmup, is_circuit, work_time, rest_time) VALUES
('g1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 1, 3, 0, 0, 0, 0),
('g2222222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 2, 4, 0, 1, 30, 15);

-- Ejercicios en sets
INSERT INTO exercises_set (exercise_set_id, day_set_id, exercise_id, list_order, weight, repetitions, work_time, rest_time, other_text) VALUES
('h1111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 1, 60.0, 10, 0, 0, ''),
('h2222222-2222-2222-2222-222222222222', 'g1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 2, 80.0, 12, 0, 0, ''),
('h3333333-3333-3333-3333-333333333333', 'g2222222-2222-2222-2222-222222222222', 'c5555555-5555-5555-5555-555555555555', 1, 0.0, 0, 0, 0, ''),
('h4444444-4444-4444-4444-444444444444', 'g2222222-2222-2222-2222-222222222222', 'c7777777-7777-7777-7777-777777777777', 2, 0.0, 0, 0, 0, '60 seg');

-- Historial
INSERT INTO history (history_id, trainee_id, routine_id, training_day_id, completed_date, day_order, total_days) VALUES
('i1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', datetime('now', '-7 days'), 1, 2),
('i2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222', datetime('now', '-5 days'), 2, 2),
('i3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', datetime('now', '-6 days'), 1, 2),
('i4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'd2222222-2222-2222-2222-222222222222', 'f3333333-3333-3333-3333-333333333333', datetime('now', '-4 days'), 1, 2);

-- Snapshots de ejercicios del historial
INSERT INTO exercise_register (exercise_register_id, history_id, set_order, iterations, is_circuit, work_time, rest_time, exercise_order, exercise_name, repetitions, weight, other_text) VALUES
('k1111111-1111-1111-1111-111111111111', 'i1111111-1111-1111-1111-111111111111', 1, 3, 0, 0, 0, 1, 'Press de banca', 10, 60.0, ''),
('k2222222-2222-2222-2222-222222222222', 'i1111111-1111-1111-1111-111111111111', 1, 3, 0, 0, 0, 2, 'Sentadilla', 12, 80.0, ''),
('k3333333-3333-3333-3333-333333333333', 'i1111111-1111-1111-1111-111111111111', 2, 4, 1, 30, 15, 1, 'Dominadas', 0, 0.0, ''),
('k4444444-4444-4444-4444-444444444444', 'i1111111-1111-1111-1111-111111111111', 2, 4, 1, 30, 15, 2, 'Plancha', 0, 0.0, '60 seg');

EOF

echo "Datos de ejemplo cargados correctamente!"
echo ""
echo "Datos creados:"
echo "- 3 alumnos"
echo "- 6 tags"
echo "- 10 ejercicios"
echo "- 2 rutinas (1 plantilla, 1 activa)"
echo "- 4 días de entrenamiento"
echo "- 4 registros de historial (1 con snapshot completo)"

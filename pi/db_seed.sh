#!/bin/bash

# Script to seed SQLite database with sample data
# Usage: ./seed_db.sh [path_to_db]
# Run from Raspberry Pi host, not inside container

DB_PATH="${1:-../data/activo.db}"

if [ ! -f "$DB_PATH" ]; then
    echo "Database not found at: $DB_PATH"
    exit 1
fi

echo "Seeding database: $DB_PATH"

sqlite3 "$DB_PATH" <<EOF
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Insert Trainees
INSERT INTO trainee (trainee_id, name, document, birth_date, gender, goal, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Juan Pérez', '12345678', '1990-05-15', 1, 'Ganar masa muscular', datetime('now'), datetime('now')),
('22222222-2222-2222-2222-222222222222', 'María García', '87654321', '1995-08-20', 0, 'Perder peso', datetime('now'), datetime('now')),
('33333333-3333-3333-3333-333333333333', 'Carlos López', '11223344', '1988-03-10', 1, 'Mantenimiento', datetime('now'), datetime('now'));

-- Insert Muscle Groups
INSERT INTO muscle_group (group_id, name, image_id) VALUES
('a1111111-1111-1111-1111-111111111111', 'Pecho', NULL),
('a2222222-2222-2222-2222-222222222222', 'Espalda', NULL),
('a3333333-3333-3333-3333-333333333333', 'Piernas', NULL),
('a4444444-4444-4444-4444-444444444444', 'Hombros', NULL),
('a5555555-5555-5555-5555-555555555555', 'Brazos', NULL),
('a6666666-6666-6666-6666-666666666666', 'Core', NULL);

-- Insert Tools
INSERT INTO tool (tool_id, name, image) VALUES
('b1111111-1111-1111-1111-111111111111', 'Barra', NULL),
('b2222222-2222-2222-2222-222222222222', 'Mancuernas', NULL),
('b3333333-3333-3333-3333-333333333333', 'Máquina', NULL),
('b4444444-4444-4444-4444-444444444444', 'Peso corporal', NULL),
('b5555555-5555-5555-5555-555555555555', 'Banda elástica', NULL);

-- Insert Generic Exercises
INSERT INTO generic_exercise (exercise_id, name, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'Press de banca', 'Ejercicio de pecho con barra'),
('c2222222-2222-2222-2222-222222222222', 'Sentadilla', 'Ejercicio de piernas con barra'),
('c3333333-3333-3333-3333-333333333333', 'Peso muerto', 'Ejercicio de espalda y piernas'),
('c4444444-4444-4444-4444-444444444444', 'Press militar', 'Ejercicio de hombros con barra'),
('c5555555-5555-5555-5555-555555555555', 'Dominadas', 'Ejercicio de espalda con peso corporal'),
('c6666666-6666-6666-6666-666666666666', 'Curl de bíceps', 'Ejercicio de brazos con mancuernas'),
('c7777777-7777-7777-7777-777777777777', 'Plancha', 'Ejercicio de core con peso corporal');

-- Link Exercises to Muscle Groups
INSERT INTO exercise_group (exercise_id, group_id) VALUES
('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
('c2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333'),
('c3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222'),
('c3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333'),
('c4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444'),
('c5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222'),
('c6666666-6666-6666-6666-666666666666', 'a5555555-5555-5555-5555-555555555555'),
('c7777777-7777-7777-7777-777777777777', 'a6666666-6666-6666-6666-666666666666');

-- Link Exercises to Tools
INSERT INTO exercise_tool (exercise_id, tool_id) VALUES
('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111'),
('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111'),
('c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111'),
('c4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111'),
('c5555555-5555-5555-5555-555555555555', 'b4444444-4444-4444-4444-444444444444'),
('c6666666-6666-6666-6666-666666666666', 'b2222222-2222-2222-2222-222222222222'),
('c7777777-7777-7777-7777-777777777777', 'b4444444-4444-4444-4444-444444444444');

-- Insert Routines
INSERT INTO routine (routine_id, name, description, creation_date, edition_date, is_template, created_at, updated_at) VALUES
('d1111111-1111-1111-1111-111111111111', 'Rutina Fullbody', 'Rutina de cuerpo completo 3 veces por semana', date('now'), date('now'), 0, datetime('now'), datetime('now')),
('d2222222-2222-2222-2222-222222222222', 'Rutina Push/Pull', 'Rutina dividida en empuje y tirón', date('now'), date('now'), 1, datetime('now'), datetime('now'));

-- Assign Routines to Trainees
INSERT INTO trainee_routine (routine_trainee_id, trainee_id, routine_id) VALUES
('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111'),
('e2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111');

-- Insert Training Days for Fullbody Routine
INSERT INTO training_day (training_day_id, routine_id, name, list_order) VALUES
('f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Día A', 1),
('f2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'Día B', 2);

-- Insert Sets for Day A
INSERT INTO day_set (day_set_id, training_day_id, list_order, iterations, is_warmup) VALUES
('g1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 1, 3, 0),
('g2222222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 2, 4, 0);

-- Insert Exercises for Sets
INSERT INTO exercises_set (exercise_set_id, day_set_id, exercise_id, list_order, weight, repetitions, work_time, rest_time, each_side, comment) VALUES
('h1111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 1, 60.0, 10, 0, 90, 0, 'Press de banca'),
('h2222222-2222-2222-2222-222222222222', 'g1111111-1111-1111-1111-111111111111', 'c2222222-2222-2222-2222-222222222222', 2, 80.0, 12, 0, 90, 0, 'Sentadilla'),
('h3333333-3333-3333-3333-333333333333', 'g2222222-2222-2222-2222-222222222222', 'c5555555-5555-5555-5555-555555555555', 1, 0.0, 8, 0, 120, 0, 'Dominadas'),
('h4444444-4444-4444-4444-444444444444', 'g2222222-2222-2222-2222-222222222222', 'c7777777-7777-7777-7777-777777777777', 2, 0.0, 0, 60, 60, 0, 'Plancha 60 segundos');

-- Insert Completed Training Days
INSERT INTO completed_training_day (completed_training_day_id, trainee_id, routine_id, training_day_id, completed_date) VALUES
('i1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', datetime('now', '-7 days')),
('i2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222', datetime('now', '-5 days')),
('i3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', datetime('now', '-3 days'));

-- Insert Training Register (historical snapshot data)
INSERT INTO trainee_exercise_register (trainee_register_id, trainee_id, trainee_name, training_date) VALUES
('j1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Juan Pérez', date('now', '-7 days'));

INSERT INTO exercise_register (exercise_register_id, trainee_register_id, routine_id, day_id, routine_name, day_name, generic_exercise, repetitions, weight, comment) VALUES
('k1111111-1111-1111-1111-111111111111', 'j1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'Rutina Fullbody', 'Día A', 'Press de banca', 10, 60.0, 'Buen desempeño'),
('k2222222-2222-2222-2222-222222222222', 'j1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'Rutina Fullbody', 'Día A', 'Sentadilla', 12, 80.0, NULL);

EOF

echo "Database seeded successfully!"
echo ""
echo "Sample data created:"
echo "- 3 trainees"
echo "- 6 muscle groups"
echo "- 5 tools"
echo "- 7 exercises"
echo "- 2 routines (1 template, 1 active)"
echo "- 2 training days"
echo "- Training history for Juan Pérez"

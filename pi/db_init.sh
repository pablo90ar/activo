#!/bin/bash

# Script to initialize SQLite database with schema
# Usage: ./db_init.sh [path_to_db]

DB_PATH="${1:-./data/activo.db}"

mkdir -p "$(dirname "$DB_PATH")"

if [ -f "$DB_PATH" ]; then
    echo "Database already exists at: $DB_PATH"
    read -p "Do you want to recreate it? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Operation cancelled"
        exit 0
    fi
    rm "$DB_PATH"
fi

echo "Creating database: $DB_PATH"

sqlite3 "$DB_PATH" <<EOF
PRAGMA foreign_keys = ON;

CREATE TABLE trainee (
    trainee_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    document TEXT,
    birth_date TEXT,
    gender INTEGER,
    goal TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE routine (
    routine_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    creation_date TEXT,
    edition_date TEXT,
    is_template INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE trainee_routine (
    routine_trainee_id TEXT PRIMARY KEY,
    trainee_id TEXT NOT NULL,
    routine_id TEXT NOT NULL,
    FOREIGN KEY (trainee_id) REFERENCES trainee(trainee_id) ON DELETE CASCADE,
    FOREIGN KEY (routine_id) REFERENCES routine(routine_id) ON DELETE CASCADE
);

CREATE TABLE training_day (
    training_day_id TEXT PRIMARY KEY,
    routine_id TEXT NOT NULL,
    name TEXT,
    list_order INTEGER NOT NULL,
    FOREIGN KEY (routine_id) REFERENCES routine(routine_id) ON DELETE CASCADE
);

CREATE TABLE completed_training_day (
    completed_training_day_id TEXT PRIMARY KEY,
    trainee_id TEXT NOT NULL,
    routine_id TEXT NOT NULL,
    training_day_id TEXT NOT NULL,
    completed_date TEXT NOT NULL,
    FOREIGN KEY (trainee_id) REFERENCES trainee(trainee_id) ON DELETE CASCADE,
    FOREIGN KEY (routine_id) REFERENCES routine(routine_id) ON DELETE CASCADE,
    FOREIGN KEY (training_day_id) REFERENCES training_day(training_day_id) ON DELETE CASCADE
);

CREATE TABLE day_set (
    day_set_id TEXT PRIMARY KEY,
    training_day_id TEXT NOT NULL,
    list_order INTEGER NOT NULL,
    iterations INTEGER NOT NULL CHECK (iterations > 0),
    is_warmup INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (training_day_id) REFERENCES training_day(training_day_id) ON DELETE CASCADE
);

CREATE TABLE generic_exercise (
    exercise_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE exercises_set (
    exercise_set_id TEXT PRIMARY KEY,
    day_set_id TEXT NOT NULL,
    exercise_id TEXT NOT NULL,
    list_order INTEGER NOT NULL,
    weight REAL NOT NULL CHECK (weight >= 0),
    repetitions INTEGER NOT NULL CHECK (repetitions >= 0),
    work_time INTEGER NOT NULL CHECK (work_time >= 0),
    rest_time INTEGER NOT NULL CHECK (rest_time >= 0),
    each_side INTEGER NOT NULL DEFAULT 0,
    comment TEXT,
    FOREIGN KEY (day_set_id) REFERENCES day_set(day_set_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES generic_exercise(exercise_id) ON DELETE CASCADE
);

CREATE TABLE muscle_group (
    group_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image_id TEXT
);

CREATE TABLE exercise_group (
    exercise_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    PRIMARY KEY (exercise_id, group_id),
    FOREIGN KEY (exercise_id) REFERENCES generic_exercise(exercise_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES muscle_group(group_id) ON DELETE CASCADE
);

CREATE TABLE tool (
    tool_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT
);

CREATE TABLE exercise_tool (
    exercise_id TEXT NOT NULL,
    tool_id TEXT NOT NULL,
    PRIMARY KEY (exercise_id, tool_id),
    FOREIGN KEY (exercise_id) REFERENCES generic_exercise(exercise_id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id) ON DELETE CASCADE
);

CREATE TABLE trainee_exercise_register (
    trainee_register_id TEXT PRIMARY KEY,
    trainee_id TEXT NOT NULL,
    trainee_name TEXT NOT NULL,
    training_date TEXT NOT NULL
);

CREATE TABLE exercise_register (
    exercise_register_id TEXT PRIMARY KEY,
    trainee_register_id TEXT NOT NULL,
    routine_id TEXT NOT NULL,
    day_id TEXT NOT NULL,
    routine_name TEXT NOT NULL,
    day_name TEXT NOT NULL,
    generic_exercise TEXT NOT NULL,
    repetitions INTEGER NOT NULL,
    weight REAL NOT NULL,
    comment TEXT,
    FOREIGN KEY (trainee_register_id) REFERENCES trainee_exercise_register(trainee_register_id) ON DELETE CASCADE
);

CREATE INDEX idx_trainee_routine_trainee ON trainee_routine(trainee_id);
CREATE INDEX idx_trainee_routine_routine ON trainee_routine(routine_id);
CREATE INDEX idx_training_day_routine ON training_day(routine_id, list_order);
CREATE INDEX idx_set_training_day ON day_set(training_day_id, list_order);
CREATE INDEX idx_exercises_set ON exercises_set(day_set_id, list_order);
CREATE INDEX idx_completed_training_day_trainee ON completed_training_day(trainee_id, completed_date);
CREATE INDEX idx_exercise_register_trainee ON trainee_exercise_register(trainee_id, training_date);
EOF

echo "Database initialized successfully!"
echo ""
echo "Next steps:"
echo "  ./pi/db_seed.sh - Populate with sample data"

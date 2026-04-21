import { db } from '../db';
import { randomUUID } from 'crypto';

export function saveDays(routineId: string, days: Array<any>) {
  for (let di = 0; di < days.length; di++) {
    const day = days[di];
    const dayId = randomUUID();
    db.prepare('INSERT INTO training_day (training_day_id, routine_id, name, list_order) VALUES (?, ?, ?, ?)')
      .run(dayId, routineId, day.name || null, di);
    for (let si = 0; si < (day.sets || []).length; si++) {
      const s = day.sets[si];
      const setId = randomUUID();
      db.prepare('INSERT INTO day_set (day_set_id, training_day_id, list_order, iterations, is_warmup, is_circuit, work_time, rest_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(setId, dayId, si, s.iterations || 1, s.is_warmup ? 1 : 0, s.is_circuit ? 1 : 0, s.work_time || 0, s.rest_time || 0);
      for (let ei = 0; ei < (s.exercises || []).length; ei++) {
        const ex = s.exercises[ei];
        db.prepare(`INSERT INTO exercises_set (exercise_set_id, day_set_id, exercise_id, list_order, weight, repetitions, work_time, rest_time, other_text)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .run(randomUUID(), setId, ex.exercise_id, ei, ex.weight || 0, ex.repetitions || 0, ex.work_time || 0, ex.rest_time || 0, ex.other_text || '');
      }
    }
  }
}

export function upsertDays(routineId: string, days: Array<any>) {
  const existingDayIds = (db.prepare('SELECT training_day_id FROM training_day WHERE routine_id = ?').all(routineId) as Array<any>).map((r) => r.training_day_id);
  const incomingDayIds: Array<string> = [];

  for (let di = 0; di < days.length; di++) {
    const day = days[di];
    const dayId = day.training_day_id && existingDayIds.includes(day.training_day_id) ? day.training_day_id : randomUUID();
    incomingDayIds.push(dayId);

    if (existingDayIds.includes(dayId)) {
      db.prepare('UPDATE training_day SET name = ?, list_order = ? WHERE training_day_id = ?')
        .run(day.name || null, di, dayId);
    } else {
      db.prepare('INSERT INTO training_day (training_day_id, routine_id, name, list_order) VALUES (?, ?, ?, ?)')
        .run(dayId, routineId, day.name || null, di);
    }

    upsertSets(dayId, day.sets || []);
  }

  for (const id of existingDayIds) {
    if (!incomingDayIds.includes(id)) db.prepare('DELETE FROM training_day WHERE training_day_id = ?').run(id);
  }
}

function upsertSets(dayId: string, sets: Array<any>) {
  const existingSetIds = (db.prepare('SELECT day_set_id FROM day_set WHERE training_day_id = ?').all(dayId) as Array<any>).map((r) => r.day_set_id);
  const incomingSetIds: Array<string> = [];

  for (let si = 0; si < sets.length; si++) {
    const s = sets[si];
    const setId = s.day_set_id && existingSetIds.includes(s.day_set_id) ? s.day_set_id : randomUUID();
    incomingSetIds.push(setId);

    if (existingSetIds.includes(setId)) {
      db.prepare('UPDATE day_set SET list_order = ?, iterations = ?, is_warmup = ?, is_circuit = ?, work_time = ?, rest_time = ? WHERE day_set_id = ?')
        .run(si, s.iterations || 1, s.is_warmup ? 1 : 0, s.is_circuit ? 1 : 0, s.work_time || 0, s.rest_time || 0, setId);
    } else {
      db.prepare('INSERT INTO day_set (day_set_id, training_day_id, list_order, iterations, is_warmup, is_circuit, work_time, rest_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
        .run(setId, dayId, si, s.iterations || 1, s.is_warmup ? 1 : 0, s.is_circuit ? 1 : 0, s.work_time || 0, s.rest_time || 0);
    }

    upsertExercises(setId, s.exercises || []);
  }

  for (const id of existingSetIds) {
    if (!incomingSetIds.includes(id)) db.prepare('DELETE FROM day_set WHERE day_set_id = ?').run(id);
  }
}

function upsertExercises(setId: string, exercises: Array<any>) {
  const existingExIds = (db.prepare('SELECT exercise_set_id FROM exercises_set WHERE day_set_id = ?').all(setId) as Array<any>).map((r) => r.exercise_set_id);
  const incomingExIds: Array<string> = [];

  for (let ei = 0; ei < exercises.length; ei++) {
    const ex = exercises[ei];
    const exId = ex.exercise_set_id && existingExIds.includes(ex.exercise_set_id) ? ex.exercise_set_id : randomUUID();
    incomingExIds.push(exId);

    if (existingExIds.includes(exId)) {
      db.prepare(`UPDATE exercises_set SET exercise_id = ?, list_order = ?, weight = ?, repetitions = ?, work_time = ?, rest_time = ?, other_text = ? WHERE exercise_set_id = ?`)
        .run(ex.exercise_id, ei, ex.weight || 0, ex.repetitions || 0, ex.work_time || 0, ex.rest_time || 0, ex.other_text || '', exId);
    } else {
      db.prepare(`INSERT INTO exercises_set (exercise_set_id, day_set_id, exercise_id, list_order, weight, repetitions, work_time, rest_time, other_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(exId, setId, ex.exercise_id, ei, ex.weight || 0, ex.repetitions || 0, ex.work_time || 0, ex.rest_time || 0, ex.other_text || '');
    }
  }

  for (const id of existingExIds) {
    if (!incomingExIds.includes(id)) db.prepare('DELETE FROM exercises_set WHERE exercise_set_id = ?').run(id);
  }
}

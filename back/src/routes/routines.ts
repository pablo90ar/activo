import { Router } from 'express';
import { db } from '../db';
import { randomUUID } from 'crypto';
import { broadcast } from '../ws';
import { saveDays, upsertDays } from './routineHelpers';

const router = Router();

router.get('/', (req, res) => {
  let query = `
    SELECT r.*, COUNT(DISTINCT tr.trainee_id) AS trainee_count,
      (SELECT COUNT(*) FROM training_day td WHERE td.routine_id = r.routine_id) AS day_count
    FROM routine r
    LEFT JOIN trainee_routine tr ON tr.routine_id = r.routine_id
  `;
  const params: Array<any> = [];
  const conditions: Array<string> = [];
  
  if (req.query.is_template !== undefined) {
    conditions.push('r.is_template = ?');
    params.push(req.query.is_template === 'true' ? 1 : 0);
  }
  
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' GROUP BY r.routine_id';
  
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM routine WHERE routine_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.get('/:id/trainees', (req, res) => {
  const rows = db.prepare(`
    SELECT t.trainee_id, t.name, t.color
    FROM trainee t
    JOIN trainee_routine tr ON tr.trainee_id = t.trainee_id
    WHERE tr.routine_id = ?
  `).all(req.params.id);
  res.json(rows);
});

router.post('/:id/duplicate', (req, res) => {
  const src = db.prepare('SELECT * FROM routine WHERE routine_id = ?').get(req.params.id) as any;
  if (!src) return res.status(404).json({ error: 'Not found' });

  const now = new Date().toISOString();
  const newRoutineId = randomUUID();

  const dup = db.transaction(() => {
    db.prepare(`INSERT INTO routine (routine_id, name, description, creation_date, edition_date, is_template, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(newRoutineId, `${src.name} (copia)`, src.description, now, now, 0, now, now);

    const days = db.prepare('SELECT * FROM training_day WHERE routine_id = ?').all(src.routine_id) as any[];
    for (const day of days) {
      const newDayId = randomUUID();
      db.prepare('INSERT INTO training_day (training_day_id, routine_id, name, list_order) VALUES (?, ?, ?, ?)')
        .run(newDayId, newRoutineId, day.name, day.list_order);

      const sets = db.prepare('SELECT * FROM day_set WHERE training_day_id = ?').all(day.training_day_id) as any[];
      for (const s of sets) {
        const newSetId = randomUUID();
        db.prepare('INSERT INTO day_set (day_set_id, training_day_id, list_order, iterations, is_warmup, is_circuit, work_time, rest_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
          .run(newSetId, newDayId, s.list_order, s.iterations, s.is_warmup || 0, s.is_circuit || 0, s.work_time || 0, s.rest_time || 0);

        const exs = db.prepare('SELECT * FROM exercises_set WHERE day_set_id = ?').all(s.day_set_id) as any[];
        for (const ex of exs) {
          db.prepare(`INSERT INTO exercises_set (exercise_set_id, day_set_id, exercise_id, list_order, weight, repetitions, work_time, rest_time, other_text)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(randomUUID(), newSetId, ex.exercise_id, ex.list_order, ex.weight, ex.repetitions, ex.work_time, ex.rest_time, ex.other_text || '');
        }
      }
    }
  });

  dup();
  res.status(201).json({ routine_id: newRoutineId });
});

router.get('/:id/full', (req, res) => {
  const routine = db.prepare(`
    SELECT r.*, COUNT(tr.trainee_id) AS trainee_count
    FROM routine r
    LEFT JOIN trainee_routine tr ON tr.routine_id = r.routine_id
    WHERE r.routine_id = ?
    GROUP BY r.routine_id
  `).get(req.params.id) as any;
  if (!routine) return res.status(404).json({ error: 'Not found' });

  const days = db.prepare('SELECT * FROM training_day WHERE routine_id = ? ORDER BY list_order').all(routine.routine_id) as any[];
  for (const day of days) {
    const sets = db.prepare('SELECT * FROM day_set WHERE training_day_id = ? ORDER BY list_order').all(day.training_day_id) as any[];
    for (const s of sets) {
      s.exercises = db.prepare(`
        SELECT es.*, ge.name AS exercise_name
        FROM exercises_set es
        JOIN generic_exercise ge ON ge.exercise_id = es.exercise_id
        WHERE es.day_set_id = ? ORDER BY es.list_order
      `).all(s.day_set_id);
    }
    day.sets = sets;
  }
  routine.days = days;
  res.json(routine);
});

router.post('/', (req, res) => {
  const { name, description, is_template, days } = req.body;
  const now = new Date().toISOString();
  const routine_id = randomUUID();

  const insert = db.transaction(() => {
    db.prepare(`INSERT INTO routine (routine_id, name, description, creation_date, edition_date, is_template, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(routine_id, name, description || null, now, now, is_template ? 1 : 0, now, now);
    saveDays(routine_id, days || []);
  });
  insert();
  res.status(201).json({ routine_id });
});

router.put('/:id', (req, res) => {
  const { name, description, is_template, days } = req.body;
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM routine WHERE routine_id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const update = db.transaction(() => {
    db.prepare('UPDATE routine SET name = ?, description = ?, is_template = ?, edition_date = ?, updated_at = ? WHERE routine_id = ?')
      .run(name, description || null, is_template ? 1 : 0, now, now, req.params.id);
    upsertDays(req.params.id, days || []);
  });
  update();
  broadcast('routine:updated', { routine_id: req.params.id }, req.body.origin_id);
  res.json({ routine_id: req.params.id });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM routine WHERE routine_id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;

import { Router } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../db';
import { broadcast } from '../ws';

const router = Router();

router.get('/', (req, res) => {
  let query = `
    SELECT
      ctd.history_id,
      ctd.completed_date,
      t.trainee_id,
      t.name AS trainee_name,
      r.routine_id,
      r.name AS routine_name,
      td.training_day_id,
      td.name AS day_name,
      ctd.day_order,
      ctd.total_days
    FROM history ctd
    JOIN trainee t ON t.trainee_id = ctd.trainee_id
    JOIN routine r ON r.routine_id = ctd.routine_id
    JOIN training_day td ON td.training_day_id = ctd.training_day_id
    WHERE 1=1
  `;
  const params: Array<any> = [];

  if (req.query.trainee_id) {
    query += ' AND ctd.trainee_id = ?';
    params.push(req.query.trainee_id);
  }
  if (req.query.routine_id) {
    query += ' AND ctd.routine_id = ?';
    params.push(req.query.routine_id);
  }
  if (req.query.training_day_id) {
    query += ' AND ctd.training_day_id = ?';
    params.push(req.query.training_day_id);
  }
  if (req.query.from) {
    query += ' AND ctd.completed_date >= ?';
    params.push(req.query.from);
  }
  if (req.query.to) {
    query += ' AND ctd.completed_date <= ?';
    params.push(req.query.to);
  }

  query += ' ORDER BY ctd.completed_date DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { trainee_id, routine_id, training_day_id } = req.body;
  if (!trainee_id || !routine_id || !training_day_id) {
    return res.status(400).json({ error: 'trainee_id, routine_id and training_day_id are required' });
  }
  const history_id = randomUUID();
  const completed_date = new Date().toISOString();
  const td = db.prepare(`
    SELECT (SELECT COUNT(*) FROM training_day td2 WHERE td2.routine_id = ? AND td2.list_order < td.list_order) + 1 AS day_order
    FROM training_day td WHERE td.training_day_id = ?
  `).get(routine_id, training_day_id) as any;
  const total = db.prepare('SELECT COUNT(*) as c FROM training_day WHERE routine_id = ?').get(routine_id) as any;
  const day_order = td?.day_order ?? 0;
  const total_days = total?.c ?? 0;
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO history (history_id, trainee_id, routine_id, training_day_id, completed_date, day_order, total_days) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(history_id, trainee_id, routine_id, training_day_id, completed_date, day_order, total_days);

    const sets = db.prepare('SELECT * FROM day_set WHERE training_day_id = ? ORDER BY list_order').all(training_day_id) as any[];
    const ins = db.prepare(`INSERT INTO exercise_register (exercise_register_id, history_id, set_order, iterations, is_circuit, work_time, rest_time, exercise_order, exercise_name, repetitions, weight, other_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const s of sets) {
      const exs = db.prepare(`SELECT es.*, ge.name AS exercise_name FROM exercises_set es JOIN generic_exercise ge ON ge.exercise_id = es.exercise_id WHERE es.day_set_id = ? ORDER BY es.list_order`).all(s.day_set_id) as any[];
      for (const ex of exs) {
        ins.run(randomUUID(), history_id, s.list_order, s.iterations, s.is_circuit, s.work_time, s.rest_time, ex.list_order, ex.exercise_name, ex.repetitions, ex.weight, ex.other_text || '');
      }
    }
  });
  tx();

  broadcast('training:completed', { trainee_id, routine_id, training_day_id }, req.body.origin_id);
  res.status(201).json({ history_id, trainee_id, routine_id, training_day_id, completed_date, day_order, total_days });
});

router.delete('/', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids array is required' });
  }
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`DELETE FROM history WHERE history_id IN (${placeholders})`).run(...ids);
  res.json({ deleted: result.changes });
});

router.patch('/:id', (req, res) => {
  const { completed_date } = req.body;
  if (!completed_date) return res.status(400).json({ error: 'completed_date is required' });
  const result = db.prepare('UPDATE history SET completed_date = ? WHERE history_id = ?').run(completed_date, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ history_id: req.params.id, completed_date });
});

router.post('/:id/duplicate', (req, res) => {
  const original = db.prepare('SELECT * FROM history WHERE history_id = ?').get(req.params.id) as any;
  if (!original) return res.status(404).json({ error: 'Not found' });
  const history_id = randomUUID();
  const completed_date = req.body.completed_date || original.completed_date;
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO history (history_id, trainee_id, routine_id, training_day_id, completed_date, day_order, total_days) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(history_id, original.trainee_id, original.routine_id, original.training_day_id, completed_date, original.day_order, original.total_days);
    const regs = db.prepare('SELECT * FROM exercise_register WHERE history_id = ? ORDER BY set_order, exercise_order').all(req.params.id) as any[];
    const ins = db.prepare('INSERT INTO exercise_register (exercise_register_id, history_id, set_order, iterations, is_circuit, work_time, rest_time, exercise_order, exercise_name, repetitions, weight, other_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const r of regs) ins.run(randomUUID(), history_id, r.set_order, r.iterations, r.is_circuit, r.work_time, r.rest_time, r.exercise_order, r.exercise_name, r.repetitions, r.weight, r.other_text || '');
  });
  tx();
  res.status(201).json({ history_id, completed_date });
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM history WHERE history_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.get('/:id/snapshot', (req, res) => {
  const rows = db.prepare('SELECT * FROM exercise_register WHERE history_id = ? ORDER BY set_order, exercise_order').all(req.params.id) as any[];
  const sets: any[] = [];
  let current: any = null;
  for (const r of rows) {
    if (!current || current.set_order !== r.set_order) {
      current = { set_order: r.set_order, iterations: r.iterations, is_circuit: r.is_circuit, work_time: r.work_time, rest_time: r.rest_time, exercises: [] };
      sets.push(current);
    }
    current.exercises.push({ exercise_name: r.exercise_name, repetitions: r.repetitions, weight: r.weight, other_text: r.other_text });
  }
  res.json(sets);
});

export default router;

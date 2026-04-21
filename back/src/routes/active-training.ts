import { Router } from 'express';
import { db } from '../db';
import { broadcast } from '../ws';

const router = Router();

router.get('/', (_req, res) => {
  const rows = db.prepare(`
    SELECT at.trainee_id, at.training_day_id, at.started_at,
           t.name, t.color,
           td.routine_id
    FROM active_training at
    JOIN trainee t ON t.trainee_id = at.trainee_id
    JOIN training_day td ON td.training_day_id = at.training_day_id
    ORDER BY at.started_at
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { trainee_id, training_day_id, origin_id } = req.body;
  if (!trainee_id || !training_day_id) {
    return res.status(400).json({ error: 'trainee_id and training_day_id are required' });
  }
  const started_at = new Date().toISOString();
  db.prepare('INSERT OR REPLACE INTO active_training (trainee_id, training_day_id, started_at) VALUES (?, ?, ?)')
    .run(trainee_id, training_day_id, started_at);
  broadcast('training:start', { trainee_id }, origin_id);
  res.status(201).json({ trainee_id, training_day_id, started_at });
});

router.put('/:trainee_id', (req, res) => {
  const { training_day_id, origin_id } = req.body;
  if (!training_day_id) return res.status(400).json({ error: 'training_day_id is required' });
  db.prepare('UPDATE active_training SET training_day_id = ? WHERE trainee_id = ?')
    .run(training_day_id, req.params.trainee_id);
  broadcast('training:dayChange', { trainee_id: req.params.trainee_id, training_day_id }, origin_id);
  res.json({ trainee_id: req.params.trainee_id, training_day_id });
});

router.delete('/:trainee_id', (req, res) => {
  const origin_id = req.query.origin_id as string | undefined;
  db.prepare('DELETE FROM active_training WHERE trainee_id = ?').run(req.params.trainee_id);
  broadcast('training:stop', { trainee_id: req.params.trainee_id }, origin_id);
  res.status(204).end();
});

export default router;

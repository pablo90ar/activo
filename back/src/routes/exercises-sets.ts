import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  let query = 'SELECT * FROM exercises_set WHERE 1=1';
  const params: Array<any> = [];
  
  if (req.query.day_set_id) {
    query += ' AND day_set_id = ?';
    params.push(req.query.day_set_id);
  }
  if (req.query.exercise_id) {
    query += ' AND exercise_id = ?';
    params.push(req.query.exercise_id);
  }
  
  query += ' ORDER BY list_order';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM exercises_set WHERE exercise_set_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;
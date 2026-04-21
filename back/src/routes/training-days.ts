import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  let query = 'SELECT * FROM training_day WHERE 1=1';
  const params: Array<any> = [];
  
  if (req.query.routine_id) {
    query += ' AND routine_id = ?';
    params.push(req.query.routine_id);
  }
  
  query += ' ORDER BY list_order';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM training_day WHERE training_day_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;
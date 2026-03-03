import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  let query = 'SELECT * FROM day_set WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.training_day_id) {
    query += ' AND training_day_id = ?';
    params.push(req.query.training_day_id);
  }
  
  query += ' ORDER BY list_order';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM day_set WHERE day_set_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;
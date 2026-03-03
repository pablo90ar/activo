import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  let query = 'SELECT * FROM trainee_routine WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.trainee_id) {
    query += ' AND trainee_id = ?';
    params.push(req.query.trainee_id);
  }
  if (req.query.routine_id) {
    query += ' AND routine_id = ?';
    params.push(req.query.routine_id);
  }
  
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM trainee_routine WHERE routine_trainee_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;
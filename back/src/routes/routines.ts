import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  let query = 'SELECT * FROM routine WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.is_template !== undefined) {
    query += ' AND is_template = ?';
    params.push(req.query.is_template === 'true' ? 1 : 0);
  }
  
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM routine WHERE routine_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;
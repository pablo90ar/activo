import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM muscle_group').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM muscle_group WHERE group_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;
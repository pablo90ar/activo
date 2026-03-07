import { Router } from 'express';
import { db } from '../db';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM trainee').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM trainee WHERE trainee_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { name, document, birth_date, gender, goal } = req.body;
  const trainee_id = randomUUID();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO trainee (trainee_id, name, document, birth_date, gender, goal, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(trainee_id, name, document, birth_date, gender ? 1 : 0, goal, now, now);
  
  const created = db.prepare('SELECT * FROM trainee WHERE trainee_id = ?').get(trainee_id);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { name, document, birth_date, gender, goal } = req.body;
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE trainee 
    SET name = ?, document = ?, birth_date = ?, gender = ?, goal = ?, updated_at = ?
    WHERE trainee_id = ?
  `).run(name, document, birth_date, gender ? 1 : 0, goal, now, req.params.id);
  
  const updated = db.prepare('SELECT * FROM trainee WHERE trainee_id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM trainee WHERE trainee_id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
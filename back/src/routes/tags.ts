import { Router } from 'express';
import { db } from '../db';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT t.*, COUNT(et.exercise_id) AS exercise_count
    FROM tag t
    LEFT JOIN exercise_tag et ON et.group_id = t.group_id
    GROUP BY t.group_id
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM tag WHERE group_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  const group_id = randomUUID();
  db.prepare('INSERT INTO tag (group_id, name) VALUES (?, ?)').run(group_id, name.trim());
  res.status(201).json(db.prepare('SELECT * FROM tag WHERE group_id = ?').get(group_id));
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  db.prepare('UPDATE tag SET name = ? WHERE group_id = ?').run(name.trim(), req.params.id);
  const updated = db.prepare('SELECT * FROM tag WHERE group_id = ?').get(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) AS c FROM exercise_tag WHERE group_id = ?').get(req.params.id) as any;
  if (count?.c > 0) return res.status(409).json({ error: 'Tag is used in exercises' });
  db.prepare('DELETE FROM tag WHERE group_id = ?').run(req.params.id);
  res.status(204).send();
});

router.get('/:id/exercises', (req, res) => {
  const rows = db.prepare(`
    SELECT e.exercise_id, e.name
    FROM generic_exercise e
    JOIN exercise_tag et ON et.exercise_id = e.exercise_id
    WHERE et.group_id = ?
    ORDER BY e.name
  `).all(req.params.id);
  res.json(rows);
});

export default router;

import { Router } from 'express';
import { db } from '../db';
import { randomUUID } from 'crypto';
import { broadcast } from '../ws';

const router = Router();

router.get('/', (req, res) => {
  let query = 'SELECT * FROM trainee_routine WHERE 1=1';
  const params: Array<any> = [];
  
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

router.post('/', (req, res) => {
  const { trainee_id, routine_id } = req.body;
  // Eliminar asignación existente
  db.prepare('DELETE FROM trainee_routine WHERE trainee_id = ?').run(trainee_id);
  const routine_trainee_id = randomUUID();
  db.prepare('INSERT INTO trainee_routine (routine_trainee_id, trainee_id, routine_id) VALUES (?, ?, ?)').run(routine_trainee_id, trainee_id, routine_id);
  const created = db.prepare('SELECT * FROM trainee_routine WHERE routine_trainee_id = ?').get(routine_trainee_id);
  broadcast('trainee:routineChanged', { trainee_id, routine_id }, req.body.origin_id);
  res.status(201).json(created);
});

router.delete('/', (req, res) => {
  const { trainee_id } = req.query;
  if (!trainee_id) return res.status(400).json({ error: 'trainee_id required' });
  db.prepare('DELETE FROM trainee_routine WHERE trainee_id = ?').run(trainee_id);
  res.status(204).send();
});

export default router;
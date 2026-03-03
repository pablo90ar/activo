import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  let query = 'SELECT * FROM exercise_group WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.exercise_id) {
    query += ' AND exercise_id = ?';
    params.push(req.query.exercise_id);
  }
  if (req.query.group_id) {
    query += ' AND group_id = ?';
    params.push(req.query.group_id);
  }
  
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

export default router;
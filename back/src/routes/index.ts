import { Router } from 'express';
import { db } from '../db';

const router = Router();

// Trainees
router.get('/trainees', (req, res) => {
  const rows = db.prepare('SELECT * FROM trainee').all();
  res.json(rows);
});

router.get('/trainee/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM trainee WHERE trainee_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Routines
router.get('/routines', (req, res) => {
  let query = 'SELECT * FROM routine WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.is_template !== undefined) {
    query += ' AND is_template = ?';
    params.push(req.query.is_template === 'true' ? 1 : 0);
  }
  
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/routine/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM routine WHERE routine_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Trainee Routines
router.get('/trainee-routines', (req, res) => {
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

router.get('/trainee-routine/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM trainee_routine WHERE routine_trainee_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Training Days
router.get('/training-days', (req, res) => {
  let query = 'SELECT * FROM training_day WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.routine_id) {
    query += ' AND routine_id = ?';
    params.push(req.query.routine_id);
  }
  
  query += ' ORDER BY list_order';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/training-day/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM training_day WHERE training_day_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Day Sets
router.get('/day-sets', (req, res) => {
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

router.get('/day-set/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM day_set WHERE day_set_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Exercises Sets
router.get('/exercises-sets', (req, res) => {
  let query = 'SELECT * FROM exercises_set WHERE 1=1';
  const params: any[] = [];
  
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

router.get('/exercises-set/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM exercises_set WHERE exercise_set_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Generic Exercises
router.get('/exercises', (req, res) => {
  const rows = db.prepare('SELECT * FROM generic_exercise').all();
  res.json(rows);
});

router.get('/exercise/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM generic_exercise WHERE exercise_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Muscle Groups
router.get('/muscle-groups', (req, res) => {
  const rows = db.prepare('SELECT * FROM muscle_group').all();
  res.json(rows);
});

router.get('/muscle-group/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM muscle_group WHERE group_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Exercise Groups
router.get('/exercise-groups', (req, res) => {
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

// Tools
router.get('/tools', (req, res) => {
  const rows = db.prepare('SELECT * FROM tool').all();
  res.json(rows);
});

router.get('/tool/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM tool WHERE tool_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// Exercise Tools
router.get('/exercise-tools', (req, res) => {
  let query = 'SELECT * FROM exercise_tool WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.exercise_id) {
    query += ' AND exercise_id = ?';
    params.push(req.query.exercise_id);
  }
  if (req.query.tool_id) {
    query += ' AND tool_id = ?';
    params.push(req.query.tool_id);
  }
  
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// Completed Training Days
router.get('/completed-training-days', (req, res) => {
  let query = 'SELECT * FROM completed_training_day WHERE 1=1';
  const params: any[] = [];
  
  if (req.query.trainee_id) {
    query += ' AND trainee_id = ?';
    params.push(req.query.trainee_id);
  }
  if (req.query.routine_id) {
    query += ' AND routine_id = ?';
    params.push(req.query.routine_id);
  }
  if (req.query.training_day_id) {
    query += ' AND training_day_id = ?';
    params.push(req.query.training_day_id);
  }
  
  query += ' ORDER BY completed_date DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/completed-training-day/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM completed_training_day WHERE completed_training_day_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

export default router;

import { Router } from 'express';
import { db } from '../db';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', (req, res) => {
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '100')) || 100, 1), 500);
  const offset = Math.max(parseInt(String(req.query.offset ?? '0')) || 0, 0);
  const search = String(req.query.search ?? '').trim();
  const groups = String(req.query.groups ?? '').trim();
  const filterEmpty = req.query.filterEmpty === '1';

  let where = '';
  const params: Array<any> = [];

  if (search) {
    where += ' HAVING LOWER(ge.name) LIKE ?';
    params.push(`%${search.toLowerCase()}%`);
  }

  if (filterEmpty) {
    where += (where.includes('HAVING') ? ' AND' : ' HAVING') + ' tag_ids IS NULL';
  } else if (groups) {
    const groupList = groups.split(',');
    const placeholders = groupList.map(() => '?').join(',');
    where += (where.includes('HAVING') ? ' AND' : ' HAVING') + ` EXISTS (SELECT 1 FROM exercise_tag et WHERE et.exercise_id = ge.exercise_id AND et.group_id IN (${placeholders}))`;
    params.push(...groupList);
  }

  const baseQuery = `
    SELECT ge.*, COUNT(DISTINCT td.routine_id) AS routine_count,
      GROUP_CONCAT(DISTINCT mg.name) AS tags,
      GROUP_CONCAT(DISTINCT mg.group_id) AS tag_ids
    FROM generic_exercise ge
    LEFT JOIN exercises_set es ON es.exercise_id = ge.exercise_id
    LEFT JOIN day_set ds ON ds.day_set_id = es.day_set_id
    LEFT JOIN training_day td ON td.training_day_id = ds.training_day_id
    LEFT JOIN exercise_tag eg ON eg.exercise_id = ge.exercise_id
    LEFT JOIN tag mg ON mg.group_id = eg.group_id
    GROUP BY ge.exercise_id
    ${where}`;

  const countRow = db.prepare(`SELECT COUNT(*) AS total FROM (${baseQuery})`).get(...params) as any;
  const rows = db.prepare(`${baseQuery} ORDER BY ge.name LIMIT ? OFFSET ?`).all(...params, limit, offset);

  res.json({ items: rows, total: countRow.total });
});

router.post('/merge', (req, res) => {
  const { sourceIds, targetId } = req.body;
  if (!Array.isArray(sourceIds) || !sourceIds.length || !targetId) return res.status(400).json({ error: 'sourceIds and targetId required' });
  if (sourceIds.includes(targetId)) return res.status(400).json({ error: 'targetId must not be in sourceIds' });
  const tx = db.transaction(() => {
    const update = db.prepare('UPDATE exercises_set SET exercise_id = ? WHERE exercise_id = ?');
    for (const id of sourceIds) {
      update.run(targetId, id);
    }
  });
  tx();
  res.json({ ok: true });
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT ge.*, GROUP_CONCAT(eg.group_id) AS tag_ids
    FROM generic_exercise ge
    LEFT JOIN exercise_tag eg ON eg.exercise_id = ge.exercise_id
    WHERE ge.exercise_id = ?
    GROUP BY ge.exercise_id
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.get('/:id/routines', (req, res) => {
  const rows = db.prepare(`
    SELECT DISTINCT r.routine_id, r.name
    FROM routine r
    JOIN training_day td ON td.routine_id = r.routine_id
    JOIN day_set ds ON ds.training_day_id = td.training_day_id
    JOIN exercises_set es ON es.day_set_id = ds.day_set_id
    WHERE es.exercise_id = ?
  `).all(req.params.id);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { name, description, tag_ids } = req.body;
  const exercise_id = randomUUID();
  const tx = db.transaction(() => {
    db.prepare('INSERT INTO generic_exercise (exercise_id, name, description) VALUES (?, ?, ?)').run(exercise_id, name, description || null);
    if (Array.isArray(tag_ids)) {
      const ins = db.prepare('INSERT INTO exercise_tag (exercise_id, group_id) VALUES (?, ?)');
      for (const gid of tag_ids) ins.run(exercise_id, gid);
    }
  });
  tx();
  const created = db.prepare('SELECT * FROM generic_exercise WHERE exercise_id = ?').get(exercise_id);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { name, description, tag_ids } = req.body;
  const tx = db.transaction(() => {
    db.prepare('UPDATE generic_exercise SET name = ?, description = ? WHERE exercise_id = ?').run(name, description || null, req.params.id);
    if (Array.isArray(tag_ids)) {
      db.prepare('DELETE FROM exercise_tag WHERE exercise_id = ?').run(req.params.id);
      const ins = db.prepare('INSERT INTO exercise_tag (exercise_id, group_id) VALUES (?, ?)');
      for (const gid of tag_ids) ins.run(req.params.id, gid);
    }
  });
  tx();
  const updated = db.prepare('SELECT * FROM generic_exercise WHERE exercise_id = ?').get(req.params.id);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const count = db.prepare(`
    SELECT COUNT(DISTINCT td.routine_id) AS c
    FROM exercises_set es
    JOIN day_set ds ON ds.day_set_id = es.day_set_id
    JOIN training_day td ON td.training_day_id = ds.training_day_id
    WHERE es.exercise_id = ?
  `).get(req.params.id) as any;
  if (count?.c > 0) return res.status(409).json({ error: 'Exercise is used in routines' });
  db.prepare('DELETE FROM generic_exercise WHERE exercise_id = ?').run(req.params.id);
  res.status(204).send();
});

export default router;
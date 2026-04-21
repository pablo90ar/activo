import { Router } from 'express';
import { db } from '../db';
import { randomUUID } from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { broadcast } from '../ws';

const PHOTOS_DIR = path.join(process.cwd(), 'photos');
fs.mkdirSync(PHOTOS_DIR, { recursive: true });

const MAX_PHOTO_KB = 300;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});

const router = Router();

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT t.*, r.name AS routine_name, tr.routine_id
    FROM trainee t
    LEFT JOIN trainee_routine tr ON tr.trainee_id = t.trainee_id
    LEFT JOIN routine r ON r.routine_id = tr.routine_id
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM trainee WHERE trainee_id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { name, document, birth_date, gender, goal, color } = req.body;
  const trainee_id = randomUUID();
  const now = new Date().toISOString();
  
  db.prepare(`
    INSERT INTO trainee (trainee_id, name, document, birth_date, gender, goal, color, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(trainee_id, name, document, birth_date, gender ? 1 : 0, goal, color || '#9AA595', now, now);
  
  const created = db.prepare('SELECT * FROM trainee WHERE trainee_id = ?').get(trainee_id);
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const { name, document, birth_date, gender, goal, color } = req.body;
  const now = new Date().toISOString();
  
  db.prepare(`
    UPDATE trainee 
    SET name = ?, document = ?, birth_date = ?, gender = ?, goal = ?, color = ?, updated_at = ?
    WHERE trainee_id = ?
  `).run(name, document, birth_date, gender ? 1 : 0, goal, color || '#9AA595', now, req.params.id);
  
  const updated = db.prepare('SELECT * FROM trainee WHERE trainee_id = ?').get(req.params.id);
  broadcast('trainee:updated', { trainee_id: req.params.id }, req.body.origin_id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM trainee WHERE trainee_id = ?').run(req.params.id);
  const ids = new Set((db.prepare('SELECT trainee_id FROM trainee').all() as any[]).map(r => r.trainee_id));
  for (const f of fs.readdirSync(PHOTOS_DIR)) {
    const full = path.join(PHOTOS_DIR, f);
    if (!fs.statSync(full).isFile()) continue;
    if (!ids.has(path.parse(f).name)) fs.unlinkSync(full);
  }
  res.status(204).send();
});

router.get('/:id/routine/full', (req, res) => {
  const tr = db.prepare(`
    SELECT tr.routine_id FROM trainee_routine tr WHERE tr.trainee_id = ? LIMIT 1
  `).get(req.params.id) as any;
  if (!tr) return res.json(null);

  const routine = db.prepare('SELECT * FROM routine WHERE routine_id = ?').get(tr.routine_id) as any;
  if (!routine) return res.json(null);

  const days = db.prepare('SELECT * FROM training_day WHERE routine_id = ? ORDER BY list_order').all(routine.routine_id) as any[];
  for (const day of days) {
    const sets = db.prepare('SELECT * FROM day_set WHERE training_day_id = ? ORDER BY list_order').all(day.training_day_id) as any[];
    for (const s of sets) {
      s.exercises = db.prepare(`
        SELECT es.*, ge.name AS exercise_name, ge.description AS exercise_description,
               GROUP_CONCAT(t.name) AS exercise_tags
        FROM exercises_set es
        JOIN generic_exercise ge ON ge.exercise_id = es.exercise_id
        LEFT JOIN exercise_tag et ON et.exercise_id = ge.exercise_id
        LEFT JOIN tag t ON t.group_id = et.group_id
        WHERE es.day_set_id = ? GROUP BY es.exercise_set_id ORDER BY es.list_order
      `).all(s.day_set_id);
    }
    day.sets = sets;
  }
  routine.days = days;
  res.json(routine);
});

router.post('/:id/photo', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  let buffer = req.file.buffer;
  if (buffer.length > MAX_PHOTO_KB * 1024) {
    buffer = await sharp(buffer).resize(400, 400, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
  } else {
    buffer = await sharp(buffer).jpeg().toBuffer();
  }
  fs.writeFileSync(path.join(PHOTOS_DIR, `${req.params.id}.jpg`), buffer);
  broadcast('trainee:photo', { trainee_id: req.params.id });
  res.json({ ok: true });
});

router.get('/:id/photo', (req, res) => {
  const file = path.join(PHOTOS_DIR, `${req.params.id}.jpg`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  res.sendFile(file);
});

router.delete('/:id/photo', (req, res) => {
  const file = path.join(PHOTOS_DIR, `${req.params.id}.jpg`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
  res.status(204).send();
});

export default router;
import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';
import multer from 'multer';
import sharp from 'sharp';

const router = Router();
const CONFIG_DIR = join(process.cwd(), 'config');
const CONFIG_FILE = join(CONFIG_DIR, 'settings.json');
const LOGO_DIR = join(process.cwd(), 'photos', 'system');
const LOGO_FILE = join(LOGO_DIR, 'logo.png');
const MAX_LOGO_KB = 512;

const DEFAULTS: Record<string, unknown> = { systemName: 'Activo', showClock: true, repsUnit: 'rp', weightUnit: 'kg', trainingTitle: 'Entrenamiento', forceUppercase: false };

// Escritura atómica: escribe en un archivo temporal y luego hace rename (operación
// atómica del filesystem). Así un corte de energía nunca deja settings.json truncado.
function writeConfigAtomic(config: Record<string, unknown>) {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  const tmp = `${CONFIG_FILE}.tmp`;
  writeFileSync(tmp, JSON.stringify(config, null, 2));
  renameSync(tmp, CONFIG_FILE);
}

function ensureConfig(): Record<string, unknown> {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  if (!existsSync(CONFIG_FILE)) {
    writeConfigAtomic(DEFAULTS);
    return { ...DEFAULTS };
  }
  try {
    return { ...DEFAULTS, ...JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) };
  } catch {
    // Archivo corrupto (p. ej. corte de energía con un backend viejo sin escritura
    // atómica): se recupera reescribiendo los defaults en lugar de romper la API.
    writeConfigAtomic(DEFAULTS);
    return { ...DEFAULTS };
  }
}

router.get('/', (_req, res) => {
  res.json(ensureConfig());
});

router.put('/', (req, res) => {
  // Merge sobre la config existente para no perder campos que el cliente no envíe.
  const merged = { ...ensureConfig(), ...req.body };
  writeConfigAtomic(merged);
  res.json(merged);
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype === 'image/png'),
});

router.get('/logo', (_req, res) => {
  if (!existsSync(LOGO_FILE)) return res.status(404).json({ error: 'No logo' });
  res.sendFile(LOGO_FILE);
});

router.post('/logo', upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PNG file required' });
  mkdirSync(LOGO_DIR, { recursive: true });
  let buffer = req.file.buffer;
  if (buffer.length > MAX_LOGO_KB * 1024) {
    buffer = await sharp(buffer).resize(512, 512, { fit: 'inside' }).png({ quality: 80 }).toBuffer();
  }
  writeFileSync(LOGO_FILE, buffer);
  res.json({ ok: true });
});

export default router;

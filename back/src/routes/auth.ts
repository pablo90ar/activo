import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();
const CONFIG_DIR = join(process.cwd(), 'config');
const AUTH_FILE = join(CONFIG_DIR, 'auth.json');
const JWT_SECRET = process.env.JWT_SECRET || 'activo-jwt-secret-key';
const TOKEN_EXPIRY = '1y';

interface AuthData { passwordHash: string; adminPasswordHash: string }

function ensureAuth(): AuthData {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  const defaults: AuthData = {
    passwordHash: bcrypt.hashSync('admin', 10),
    adminPasswordHash: bcrypt.hashSync('admin', 10),
  };
  if (!existsSync(AUTH_FILE)) {
    writeFileSync(AUTH_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  }
  const stored = JSON.parse(readFileSync(AUTH_FILE, 'utf-8'));
  if (!stored.adminPasswordHash) {
    stored.adminPasswordHash = defaults.adminPasswordHash;
    writeFileSync(AUTH_FILE, JSON.stringify(stored, null, 2));
  }
  return stored;
}

router.post('/login', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  const auth = ensureAuth();
  const valid = bcrypt.compareSync(password, auth.passwordHash) || bcrypt.compareSync(password, auth.adminPasswordHash);
  if (!valid) {
    await new Promise((r) => setTimeout(r, 5000));
    return res.status(401).json({ error: 'Invalid password' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  res.json({ token });
});

router.put('/password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password too short' });
  const auth = ensureAuth();
  if (!bcrypt.compareSync(currentPassword, auth.passwordHash)) {
    return res.status(401).json({ error: 'Invalid current password' });
  }
  auth.passwordHash = bcrypt.hashSync(newPassword, 10);
  writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2));
  res.json({ ok: true });
});

export default router;
export { JWT_SECRET };

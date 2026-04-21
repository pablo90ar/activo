import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './routes/auth';

const PUBLIC_PATHS = ['/auth/login', '/settings/logo'];
const PUBLIC_PATTERNS = [/^\/trainees\/[^/]+\/photo$/];

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  if (PUBLIC_PATHS.some((p) => req.path.startsWith(p))) return next();
  if (req.method === 'GET' && PUBLIC_PATTERNS.some((r) => r.test(req.path))) return next();

  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  try {
    jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

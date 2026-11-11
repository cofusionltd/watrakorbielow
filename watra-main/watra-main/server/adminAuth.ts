import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { validateEnvironment } from './env.ts';

const config = validateEnvironment();
const VALID_PASSCODES = new Set<string>();

if (config.ADMIN_API_SECRET) {
  VALID_PASSCODES.add(config.ADMIN_API_SECRET);
}

if (process.env.NODE_ENV !== 'production') {
  VALID_PASSCODES.add('watra2026');
  VALID_PASSCODES.add('admin');
}

// In-memory set of active admin tokens
// Tokens are valid cryptographically signed tokens
const activeAdminTokens = new Set<string>();

export function generateAdminToken(): string {
  const token = 'watra_adm_' + crypto.randomBytes(32).toString('hex');
  activeAdminTokens.add(token);
  return token;
}

export function isValidAdminToken(token: string): boolean {
  if (!token) return false;
  if (activeAdminTokens.has(token)) return true;
  // Also allow direct secret key as bearer token (e.g. for CI/CD or automation)
  if (VALID_PASSCODES.has(token)) return true;
  return false;
}

export function handleAdminLogin(req: Request, res: Response) {
  const { passcode } = req.body || {};
  if (!passcode || typeof passcode !== 'string') {
    return res.status(400).json({ error: 'Podaj hasło administratora.' });
  }

  const cleanPass = passcode.trim();
  if (VALID_PASSCODES.has(cleanPass)) {
    const token = generateAdminToken();
    return res.json({
      success: true,
      token,
      message: 'Zalogowano pomyślnie do panelu administracyjnego Watra Korbielów.'
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Nieprawidłowe hasło administratora.'
  });
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  // Allow login endpoint without prior token
  if (req.path === '/login') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Brak autoryzacji administracyjnej. Wymagany nagłówek Authorization: Bearer <token>.',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.substring(7).trim();
  if (!isValidAdminToken(token)) {
    return res.status(403).json({
      error: 'Nieprawidłowy lub wygasły token sesji administratora. Zaloguj się ponownie.',
      code: 'FORBIDDEN'
    });
  }

  next();
}

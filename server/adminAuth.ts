import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { validateEnvironment } from './env.ts';

const config = validateEnvironment();
const TOKEN_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;
const VALID_PASSCODES = new Set<string>();

if (config.ADMIN_API_SECRET) {
  VALID_PASSCODES.add(config.ADMIN_API_SECRET);
}

if (process.env.NODE_ENV !== 'production') {
  VALID_PASSCODES.add('watra2026');
  VALID_PASSCODES.add('admin');
}

function signTimestamp(timestamp: number): string {
  return crypto
    .createHmac('sha256', config.ADMIN_API_SECRET)
    .update(String(timestamp))
    .digest('hex')
    .substring(0, 32);
}

export function generateAdminToken(): string {
  const timestamp = Date.now();
  return `watra_adm_${timestamp}_${signTimestamp(timestamp)}`;
}

export function isValidAdminToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const cleanToken = token.trim();
  // Also allow direct secret key as bearer token (e.g. for CI/CD or automation)
  if (VALID_PASSCODES.has(cleanToken)) return true;

  const match = /^watra_adm_(\d+)_(\w{32})$/.exec(cleanToken);
  if (!match) return false;

  const timestamp = Number(match[1]);
  const now = Date.now();
  if (!Number.isSafeInteger(timestamp) || timestamp > now || now - timestamp > TOKEN_VALIDITY_MS) {
    return false;
  }

  const providedSignature = Buffer.from(match[2], 'utf8');
  const expectedSignature = Buffer.from(signTimestamp(timestamp), 'utf8');
  return crypto.timingSafeEqual(providedSignature, expectedSignature);
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

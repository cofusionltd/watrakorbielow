import { Request, Response, NextFunction } from 'express';

// Sensitive keys to sanitize in metadata
const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'authorization',
  'cookie',
  'secret',
  'admin_password',
  'apikey',
  'api_key',
  'gemini_api_key'
]);

/**
 * Recursively redacts PII and sensitive data from metadata objects
 */
export function sanitizeMeta(obj: any, depth = 0): any {
  if (depth > 5 || obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Redact email addresses: test@domain.com -> t***@domain.com
    let sanitized = obj.replace(/([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/g, (match, user, domain, ext) => {
      const masked = user.length > 2 ? `${user[0]}***${user.slice(-1)}` : '***';
      return `${masked}@${domain}.${ext}`;
    });
    // Redact phone numbers with at least 9 digits
    sanitized = sanitized.replace(/(\+?\d{2,3}[\s-]?)?(\d{3}[\s-]?\d{3}[\s-]?\d{3,4})/g, '[REDACTED_PHONE]');
    return sanitized;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeMeta(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        sanitizedObj[key] = '[REDACTED]';
      } else {
        sanitizedObj[key] = sanitizeMeta(value, depth + 1);
      }
    }
    return sanitizedObj;
  }

  return obj;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class StructuredLogger {
  private formatLog(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const cleanMeta = meta ? sanitizeMeta(meta) : undefined;
    
    // In production or when JSON format is desired
    if (process.env.NODE_ENV === 'production') {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...(cleanMeta ? { meta: cleanMeta } : {})
      });
    }

    // In dev: readable prefix with metadata
    const metaStr = cleanMeta ? ` ${JSON.stringify(cleanMeta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  info(message: string, meta?: any) {
    console.log(this.formatLog('info', message, meta));
  }

  warn(message: string, meta?: any) {
    console.warn(this.formatLog('warn', message, meta));
  }

  error(message: string, error?: any, meta?: any) {
    const errDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;

    console.error(this.formatLog('error', message, {
      ...(errDetails ? { error: errDetails } : {}),
      ...(meta || {})
    }));
  }

  debug(message: string, meta?: any) {
    if (process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('debug', message, meta));
    }
  }
}

export const logger = new StructuredLogger();

/**
 * Express middleware for request logging with duration and status code
 */
export function requestLoggingMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip static assets, vite dev requests, and vite internal requests to prevent log noise
  if (
    req.path.startsWith('/@') || 
    req.path.startsWith('/src') || 
    req.path.startsWith('/node_modules') ||
    req.path.endsWith('.css') ||
    req.path.endsWith('.js') ||
    req.path.endsWith('.svg') ||
    req.path.endsWith('.png') ||
    req.path.endsWith('.jpg') ||
    req.path.endsWith('.ico')
  ) {
    return next();
  }

  const start = Date.now();
  const { method } = req;
  const loggedUrl = req.path;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Filter out chat polling 200s if desired or log them cleanly
    const isChatPoll = loggedUrl.includes('/api/chat/session/') || loggedUrl.includes('/api/admin/chats');
    if (isChatPoll && statusCode === 200 && duration < 50) {
      return;
    }

    if (statusCode >= 500) {
      logger.error(`HTTP ${method} ${loggedUrl} ${statusCode} - ${duration}ms`, undefined, {
        method,
        url: loggedUrl,
        statusCode,
        duration
      });
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${method} ${loggedUrl} ${statusCode} - ${duration}ms`, {
        method,
        url: loggedUrl,
        statusCode,
        duration
      });
    } else {
      logger.info(`HTTP ${method} ${loggedUrl} ${statusCode} - ${duration}ms`, {
        method,
        url: loggedUrl,
        statusCode,
        duration
      });
    }
  });

  next();
}

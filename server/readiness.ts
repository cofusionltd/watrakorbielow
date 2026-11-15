import type { Request, Response } from 'express';
import { logger } from './logger.ts';

export function createReadinessHandler(checkDatabase: () => Promise<unknown>) {
  return async (_req: Request, res: Response) => {
    try {
      await checkDatabase();
      res.json({ status: 'ready', databaseConnected: true });
    } catch (error) {
      logger.error('Application readiness check failed', { error });
      res.status(503).json({ status: 'not_ready', databaseConnected: false });
    }
  };
}

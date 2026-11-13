import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    const sqlHost = process.env.SQL_HOST?.trim();
    const sqlUser = process.env.SQL_USER?.trim();
    const sqlPassword = process.env.SQL_PASSWORD?.trim();
    const sqlDbName = process.env.SQL_DB_NAME?.trim();
    const sqlPortValue = process.env.SQL_PORT?.trim();
    const sqlPort = sqlPortValue ? Number(sqlPortValue) : 5432;
    const hasSqlCredentials = !!(sqlHost && sqlUser && sqlPassword && sqlDbName);

    if (!databaseUrl && !hasSqlCredentials) {
      throw new Error('Missing PostgreSQL configuration. Set DATABASE_URL or SQL_HOST/SQL_USER/SQL_PASSWORD/SQL_DB_NAME before starting the app.');
    }
    if (!databaseUrl && (!Number.isInteger(sqlPort) || sqlPort < 1 || sqlPort > 65535)) {
      throw new Error('SQL_PORT must be a valid TCP port between 1 and 65535.');
    }

    global._postgresPool = new Pool({
      connectionString: databaseUrl || undefined,
      host: databaseUrl ? undefined : sqlHost || undefined,
      port: databaseUrl ? undefined : sqlPort,
      user: databaseUrl ? undefined : sqlUser || undefined,
      password: databaseUrl ? undefined : sqlPassword || undefined,
      database: databaseUrl ? undefined : sqlDbName || undefined,
      max: 10,
      connectionTimeoutMillis: 15000,
      ssl: databaseUrl ? { rejectUnauthorized: false } : undefined,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });

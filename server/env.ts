export interface EnvConfig {
  PORT: number;
  GEMINI_API_KEY?: string;
  ADMIN_API_SECRET: string;
  SQL_HOST?: string;
  SQL_USER?: string;
  SQL_PASSWORD?: string;
  SQL_DB_NAME?: string;
  SQL_ADMIN_USER?: string;
  SQL_ADMIN_PASSWORD?: string;
  DATABASE_URL?: string;
  NODE_ENV: string;
}

export function validateEnvironment(): EnvConfig {
  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
  const adminSecret = process.env.ADMIN_API_SECRET?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const sqlHost = process.env.SQL_HOST?.trim();
  const sqlUser = process.env.SQL_USER?.trim();
  const sqlPassword = process.env.SQL_PASSWORD?.trim();
  const sqlDbName = process.env.SQL_DB_NAME?.trim();
  const sqlAdminUser = process.env.SQL_ADMIN_USER?.trim();
  const sqlAdminPassword = process.env.SQL_ADMIN_PASSWORD?.trim();
  const hasDatabaseConfig = !!databaseUrl || !!(sqlHost && sqlUser && sqlPassword && sqlDbName);

  if (nodeEnv === 'production' && !adminSecret) {
    throw new Error('ADMIN_API_SECRET must be configured before starting the app in production mode.');
  }

  if (!hasDatabaseConfig) {
    throw new Error('PostgreSQL configuration is required. Set DATABASE_URL or SQL_HOST/SQL_USER/SQL_PASSWORD/SQL_DB_NAME.');
  }
  if (!databaseUrl && (!sqlAdminUser || !sqlAdminPassword)) {
    throw new Error('SQL_ADMIN_USER and SQL_ADMIN_PASSWORD are required to apply PostgreSQL migrations at startup.');
  }

  return {
    PORT: Number(process.env.PORT) || 3000,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    ADMIN_API_SECRET: adminSecret || (nodeEnv === 'production' ? '' : 'dev-admin-secret'),
    SQL_HOST: sqlHost,
    SQL_USER: sqlUser,
    SQL_PASSWORD: sqlPassword,
    SQL_DB_NAME: sqlDbName,
    SQL_ADMIN_USER: sqlAdminUser,
    SQL_ADMIN_PASSWORD: sqlAdminPassword,
    DATABASE_URL: databaseUrl,
    NODE_ENV: nodeEnv,
  };
}

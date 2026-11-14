import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import * as schema from '../src/db/schema.ts';
import { db } from '../src/db/index.ts';
import { Ipv4Socket } from '../src/db/ipv4Socket.ts';
import {
  dbCreatePromotion,
  dbGetAiKnowledge,
  dbGetMediaAssets,
  dbGetPromotions,
  dbSaveMediaAsset,
  dbUpsertAiKnowledge
} from '../src/db/repository.ts';
import { initializeCmsContent } from './cms.ts';
import { initializeDiscountCodes } from './discounts.ts';
import { initializeRooms } from './rooms.ts';
import { initializeSiteSettings } from './siteSettings.ts';

interface DatabaseSeeds {
  campaigns: Array<{
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    discountPercentage: number;
    promoCode: string;
    startDate: string;
    endDate: string;
    category: string;
    imageUrl: string;
    active: boolean;
    publishedAt: string;
    description: string;
    perks: string[];
  }>;
  knowledge: Array<{
    id: string;
    title: string;
    category: string;
    content: string;
    fileName?: string;
    active: boolean;
  }>;
}

const imageContentTypes: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
};

async function applyMigrations(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const applicationRole = process.env.SQL_USER?.trim();
  const migrationPool = new Pool({
    connectionString: databaseUrl || undefined,
    host: databaseUrl ? undefined : process.env.SQL_HOST?.trim(),
    port: databaseUrl ? undefined : Number(process.env.SQL_PORT) || 5432,
    user: databaseUrl ? undefined : process.env.SQL_ADMIN_USER?.trim(),
    password: databaseUrl ? undefined : process.env.SQL_ADMIN_PASSWORD?.trim(),
    database: databaseUrl ? undefined : process.env.SQL_DB_NAME?.trim(),
    ssl: databaseUrl ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 15000,
    stream: () => new Ipv4Socket(),
  });
  const migrationDb = drizzle(migrationPool, { schema });

  try {
    await migrate(migrationDb, { migrationsFolder: path.join(process.cwd(), 'drizzle') });

    if (applicationRole && applicationRole !== process.env.SQL_ADMIN_USER?.trim()) {
      const role = `"${applicationRole.replace(/"/g, '""')}"`;
      await migrationPool.query(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${role}`);
      await migrationPool.query(`GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${role}`);
      await migrationPool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO ${role}`);
      await migrationPool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO ${role}`);
    }
  } finally {
    await migrationPool.end();
  }
}

async function importBundledImages(): Promise<void> {
  const imageDirectory = path.join(process.cwd(), 'public', 'images');
  if (!fs.existsSync(imageDirectory)) {
    throw new Error(`Bundled image directory is missing: ${imageDirectory}`);
  }

  const storedAssets = new Set((await dbGetMediaAssets()).map(asset => asset.name));
  for (const entry of fs.readdirSync(imageDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || storedAssets.has(entry.name)) continue;
    const extension = path.extname(entry.name).slice(1).toLowerCase();
    const contentType = imageContentTypes[extension];
    if (!contentType) continue;

    const data = fs.readFileSync(path.join(imageDirectory, entry.name));
    await dbSaveMediaAsset({
      name: entry.name,
      originalName: entry.name,
      contentType,
      data,
      size: data.length,
      uploaded: false,
    });
  }
}

async function seedCampaigns(campaigns: DatabaseSeeds['campaigns']): Promise<void> {
  if ((await dbGetPromotions()).length > 0) return;
  for (const campaign of campaigns) {
    await dbCreatePromotion({
      id: campaign.id,
      title: campaign.title,
      badge: campaign.badge,
      description: campaign.description,
      discountPercent: campaign.discountPercentage,
      promoCode: campaign.promoCode,
      active: campaign.active,
      channels: JSON.stringify(['website']),
      startsAt: campaign.startDate,
      endsAt: campaign.endDate,
      metadata: {
        subtitle: campaign.subtitle,
        category: campaign.category,
        imageUrl: campaign.imageUrl,
        perks: campaign.perks,
        publishedAt: campaign.publishedAt,
      },
    });
  }
}

async function seedKnowledge(knowledge: DatabaseSeeds['knowledge']): Promise<void> {
  if ((await dbGetAiKnowledge()).length > 0) return;
  for (const document of knowledge) {
    await dbUpsertAiKnowledge(document);
  }
}

export async function initializeDatabase(seeds: DatabaseSeeds): Promise<void> {
  await db.execute(sql`SELECT 1`);
  await applyMigrations();
  await initializeRooms();
  await initializeCmsContent();
  await initializeSiteSettings();
  await initializeDiscountCodes();
  await seedCampaigns(seeds.campaigns);
  await seedKnowledge(seeds.knowledge);
  await importBundledImages();
}

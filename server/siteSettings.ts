import fs from 'fs';
import path from 'path';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '../src/siteSettings';
import { dbGetSiteSettings, dbSaveSiteSettings } from '../src/db/repository.ts';

const legacySettingsFile = process.env.SITE_SETTINGS_PATH
  ? path.resolve(process.env.SITE_SETTINGS_PATH)
  : path.join(process.cwd(), 'server', 'site_settings.json');

export class SiteSettingsValidationError extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const mergeSettings = (value: unknown): SiteSettings => {
  if (!isRecord(value)) {
    throw new Error('Site settings must contain an object.');
  }

  const settings = {
    pages: { ...DEFAULT_SITE_SETTINGS.pages },
    features: { ...DEFAULT_SITE_SETTINGS.features },
    components: { ...DEFAULT_SITE_SETTINGS.components },
  };

  for (const section of ['pages', 'features', 'components'] as const) {
    const sectionValue = value[section];
    if (sectionValue === undefined) continue;
    if (!isRecord(sectionValue)) {
      throw new Error(`Site settings "${section}" must be an object.`);
    }

    const allowedKeys = Object.keys(settings[section]);
    for (const [key, enabled] of Object.entries(sectionValue)) {
      if (!allowedKeys.includes(key) || typeof enabled !== 'boolean') {
        throw new SiteSettingsValidationError(`Invalid site setting: ${section}.${key}`);
      }
      Object.assign(settings[section], { [key]: enabled });
    }
  }

  for (const key of Object.keys(value)) {
    if (key !== 'pages' && key !== 'features' && key !== 'components') {
      throw new SiteSettingsValidationError(`Invalid site settings section: ${key}`);
    }
  }

  return settings;
};

export async function initializeSiteSettings(): Promise<void> {
  if (await dbGetSiteSettings()) return;

  const initialSettings = fs.existsSync(legacySettingsFile)
    ? mergeSettings(JSON.parse(fs.readFileSync(legacySettingsFile, 'utf8')))
    : DEFAULT_SITE_SETTINGS;
  await dbSaveSiteSettings(initialSettings);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const stored = await dbGetSiteSettings();
  if (!stored) throw new Error('Site settings have not been initialized in the database.');
  return mergeSettings(stored);
}

export async function updateSiteSettings(updates: unknown): Promise<SiteSettings> {
  if (!isRecord(updates)) {
    throw new SiteSettingsValidationError('Site settings update must be an object.');
  }
  for (const section of ['pages', 'features', 'components'] as const) {
    if (updates[section] !== undefined && !isRecord(updates[section])) {
      throw new SiteSettingsValidationError(`Site settings "${section}" must be an object.`);
    }
  }

  const currentSettings = await getSiteSettings();
  const merged = mergeSettings({
    pages: { ...currentSettings.pages, ...(isRecord(updates.pages) ? updates.pages : {}) },
    features: { ...currentSettings.features, ...(isRecord(updates.features) ? updates.features : {}) },
    components: { ...currentSettings.components, ...(isRecord(updates.components) ? updates.components : {}) },
    ...Object.fromEntries(
      Object.entries(updates).filter(([key]) => !['pages', 'features', 'components'].includes(key))
    ),
  });

  await dbSaveSiteSettings(merged);
  return merged;
}

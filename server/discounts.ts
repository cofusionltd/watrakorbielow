import fs from 'fs';
import path from 'path';
import { DiscountCode, DiscountValidationResult } from '../src/types';
import {
  dbCreateDiscountCode,
  dbDeleteDiscountCode,
  dbGetDiscountCodes,
  dbRedeemDiscountCode,
  dbResetDiscountCodeCounter,
  dbUpdateDiscountCode
} from '../src/db/repository.ts';

const legacyDiscountsFile = path.join(process.cwd(), 'server', 'discounts_data.json');

const defaultDiscountCodes: DiscountCode[] = [
  {
    id: 'disc-zima2026',
    code: 'ZIMA2026',
    title: 'Zimowy Szus pod Pilskiem',
    description: 'Promocja First Minute na ferie zimowe i narty u stóp Pilska.',
    discountPercentage: 15,
    active: true,
    terminationType: 'both',
    startDate: '2026-09-01',
    endDate: '2027-03-31',
    usageLimit: 50,
    usedCount: 14,
    availableInChat: true,
    chatTriggerNote: 'Dla gości pytających o ferie, zimowe pobyty i narty.',
    createdAt: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'disc-beskid20',
    code: 'BESKID20',
    title: 'Ekskluzywny Rabat Concierge AI',
    description: 'Specjalny kod zniżkowy przekazywany bezpośrednio przez Concierge AI w czacie.',
    discountPercentage: 20,
    active: true,
    terminationType: 'usage_limit',
    startDate: '2026-09-01',
    endDate: '2027-12-31',
    usageLimit: 30,
    usedCount: 9,
    availableInChat: true,
    chatTriggerNote: 'Główny rabat do zaoferowania gościom w czacie, gdy pytają o promocję lub tańszą rezerwację.',
    createdAt: '2026-09-05T12:00:00.000Z'
  },
  {
    id: 'disc-romantic',
    code: 'ROMANTIC',
    title: 'Weekend dla Dwojga z Jacuzzi',
    description: 'Zniżka na pobyty romantyczne z kąpielą w gorącym jacuzzi pod gwiazdami.',
    discountPercentage: 10,
    active: true,
    terminationType: 'time',
    startDate: '2026-09-15',
    endDate: '2026-12-31',
    usageLimit: 50,
    usedCount: 18,
    availableInChat: true,
    chatTriggerNote: 'Dla par pytających o romantyczny weekend, wellness i jacuzzi.',
    createdAt: '2026-09-08T15:00:00.000Z'
  },
  {
    id: 'disc-zdrowie',
    code: 'WELLNESS',
    title: 'Pakiety Górski Relaks & Spa',
    description: 'Rabat na pakiety wypoczynkowe z nielimitowanym jacuzzi i sauną fińską.',
    discountPercentage: 12,
    active: true,
    terminationType: 'time',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    usageLimit: 40,
    usedCount: 11,
    availableInChat: false,
    chatTriggerNote: 'Dla zapytań o strefę wellness, jacuzzi i saunę.',
    createdAt: '2026-08-25T09:00:00.000Z'
  },
  {
    id: 'disc-gosc10',
    code: 'GOSC10',
    title: 'Gwarancja Rezerwacji Bezpośredniej',
    description: 'Stały kod rabatowy -10% na dowolny pobyt zarezerwowany bezpośrednio.',
    discountPercentage: 10,
    active: true,
    terminationType: 'none',
    usageLimit: null,
    usedCount: 42,
    availableInChat: true,
    chatTriggerNote: 'Uniwersalny bezterminowy kod rabatowy dla każdego gościa.',
    createdAt: '2026-08-01T08:00:00.000Z'
  }
];

const toDiscountCode = (row: Awaited<ReturnType<typeof dbGetDiscountCodes>>[number]): DiscountCode => ({
  ...row,
  terminationType: row.terminationType as DiscountCode['terminationType'],
  startDate: row.startDate || undefined,
  endDate: row.endDate || undefined,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export async function initializeDiscountCodes(): Promise<void> {
  if ((await dbGetDiscountCodes()).length > 0) return;

  const legacyCodes = fs.existsSync(legacyDiscountsFile)
    ? JSON.parse(fs.readFileSync(legacyDiscountsFile, 'utf8')) as DiscountCode[]
    : defaultDiscountCodes;
  for (const code of legacyCodes) {
    await dbCreateDiscountCode({
      ...code,
      description: code.description || '',
      startDate: code.startDate || null,
      endDate: code.endDate || null,
      usageLimit: code.usageLimit ?? null,
      chatTriggerNote: code.chatTriggerNote || '',
      minBookingNights: code.minBookingNights || null,
      createdAt: code.createdAt ? new Date(code.createdAt) : new Date(),
      updatedAt: code.updatedAt ? new Date(code.updatedAt) : new Date(),
    });
  }
}

class DiscountsManager {
  public async getAll(): Promise<DiscountCode[]> {
    return (await dbGetDiscountCodes()).map(toDiscountCode);
  }

  public async getById(id: string): Promise<DiscountCode | undefined> {
    return (await this.getAll()).find(code => code.id === id);
  }

  public async getByCode(code: string): Promise<DiscountCode | undefined> {
    if (!code) return undefined;
    const normalized = code.trim().toUpperCase();
    return (await this.getAll()).find(item => item.code.toUpperCase() === normalized);
  }

  public isCodeCurrentlyValid(code: DiscountCode): { valid: boolean; reason?: string } {
    if (!code.active) return { valid: false, reason: 'Kod rabatowy jest obecnie wyłączony.' };

    const today = new Date().toISOString().split('T')[0];
    if ((code.terminationType === 'time' || code.terminationType === 'both') && code.startDate && today < code.startDate) {
      return { valid: false, reason: `Kod zacznie obowiązywać od ${code.startDate}.` };
    }
    if ((code.terminationType === 'time' || code.terminationType === 'both') && code.endDate && today > code.endDate) {
      return { valid: false, reason: `Ważność kodu rabatowego upłynęła ${code.endDate}.` };
    }
    if ((code.terminationType === 'usage_limit' || code.terminationType === 'both')
      && code.usageLimit != null && code.usedCount >= code.usageLimit) {
      return { valid: false, reason: `Limit sprzedaży dla tego kodu (${code.usageLimit} rezerwacji) został wyczerpany.` };
    }
    return { valid: true };
  }

  public async validateCode(rawCode: string): Promise<DiscountValidationResult> {
    if (!rawCode || typeof rawCode !== 'string') return { valid: false, message: 'Wprowadź kod rabatowy.' };
    const normalized = rawCode.trim().toUpperCase();
    const found = await this.getByCode(normalized);
    if (!found) return { valid: false, message: `Kod "${normalized}" nie istnieje lub został usunięty.` };

    const validity = this.isCodeCurrentlyValid(found);
    if (!validity.valid) {
      return { valid: false, code: found.code, title: found.title, message: validity.reason || 'Kod rabatowy nie jest aktywny.' };
    }

    const remainingUses = found.usageLimit != null
      && (found.terminationType === 'usage_limit' || found.terminationType === 'both')
      ? Math.max(0, found.usageLimit - found.usedCount)
      : null;
    return {
      valid: true,
      code: found.code,
      title: found.title,
      discountPercentage: found.discountPercentage,
      message: `Kod aktywny! Naliczono -${found.discountPercentage}% rabatu (${found.title}).`,
      remainingUses,
      terminationType: found.terminationType,
      endDate: found.endDate
    };
  }

  public async redeemCode(rawCode: string): Promise<{ success: boolean; discountPercentage?: number; message: string }> {
    const found = await this.getByCode(rawCode);
    if (!found) return { success: false, message: 'Kod nie istnieje.' };
    const validity = this.isCodeCurrentlyValid(found);
    if (!validity.valid) return { success: false, message: validity.reason || 'Kod nie jest ważny.' };

    const updated = await dbRedeemDiscountCode(found.id);
    if (!updated) throw new Error('Nie udało się zarejestrować wykorzystania kodu rabatowego.');
    return {
      success: true,
      discountPercentage: updated.discountPercentage,
      message: `Kod ${updated.code} został pomyślnie zrealizowany.`
    };
  }

  public async getChatDiscounts(): Promise<DiscountCode[]> {
    return (await this.getAll()).filter(code => code.availableInChat && this.isCodeCurrentlyValid(code).valid);
  }

  public async create(data: Partial<DiscountCode>): Promise<{ success: boolean; code?: DiscountCode; error?: string }> {
    if (!data.code?.trim()) return { success: false, error: 'Kod rabatowy jest wymagany.' };
    const code = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (code.length < 3) return { success: false, error: 'Kod rabatowy musi mieć co najmniej 3 znaki.' };
    if ((await this.getByCode(code))) return { success: false, error: `Kod o nazwie "${code}" już istnieje w systemie.` };

    const now = new Date();
    const newCode: DiscountCode = {
      id: `disc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code,
      title: data.title?.trim() || `Promocja ${code}`,
      description: data.description?.trim() || '',
      discountPercentage: Math.max(1, Math.min(90, Number(data.discountPercentage) || 10)),
      active: data.active !== undefined ? Boolean(data.active) : true,
      terminationType: data.terminationType || 'time',
      startDate: data.startDate || now.toISOString().split('T')[0],
      endDate: data.endDate || '2027-12-31',
      usageLimit: data.usageLimit === undefined || data.usageLimit === null || String(data.usageLimit).trim() === ''
        ? null
        : Number(data.usageLimit),
      usedCount: 0,
      availableInChat: data.availableInChat !== undefined ? Boolean(data.availableInChat) : true,
      chatTriggerNote: data.chatTriggerNote || '',
      minBookingNights: data.minBookingNights ? Number(data.minBookingNights) : undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    await dbCreateDiscountCode({
      ...newCode,
      startDate: newCode.startDate || null,
      endDate: newCode.endDate || null,
      usageLimit: newCode.usageLimit ?? null,
      minBookingNights: newCode.minBookingNights ?? null,
      createdAt: now,
      updatedAt: now,
    });
    return { success: true, code: newCode };
  }

  public async update(id: string, data: Partial<DiscountCode>): Promise<{ success: boolean; code?: DiscountCode; error?: string }> {
    const current = await this.getById(id);
    if (!current) return { success: false, error: 'Kod rabatowy nie został znaleziony.' };
    const normalizedCode = data.code?.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (normalizedCode && normalizedCode !== current.code.toUpperCase() && await this.getByCode(normalizedCode)) {
      return { success: false, error: `Kod "${normalizedCode}" już istnieje.` };
    }

    const updated: DiscountCode = {
      ...current,
      ...data,
      code: normalizedCode || current.code,
      title: data.title?.trim() ?? current.title,
      description: data.description?.trim() ?? current.description,
      discountPercentage: data.discountPercentage !== undefined
        ? Math.max(1, Math.min(90, Number(data.discountPercentage)))
        : current.discountPercentage,
      usageLimit: data.usageLimit === undefined ? current.usageLimit : data.usageLimit === null ? null : Number(data.usageLimit),
      usedCount: data.usedCount !== undefined ? Math.max(0, Number(data.usedCount)) : current.usedCount,
      minBookingNights: data.minBookingNights !== undefined ? (data.minBookingNights ? Number(data.minBookingNights) : undefined) : current.minBookingNights,
      updatedAt: new Date().toISOString(),
    };
    const row = await dbUpdateDiscountCode(id, {
      code: updated.code,
      title: updated.title,
      description: updated.description || '',
      discountPercentage: updated.discountPercentage,
      active: updated.active,
      terminationType: updated.terminationType,
      startDate: updated.startDate || null,
      endDate: updated.endDate || null,
      usageLimit: updated.usageLimit ?? null,
      usedCount: updated.usedCount,
      availableInChat: updated.availableInChat,
      chatTriggerNote: updated.chatTriggerNote || '',
      minBookingNights: updated.minBookingNights ?? null,
    });
    return row ? { success: true, code: toDiscountCode(row) } : { success: false, error: 'Kod rabatowy nie został znaleziony.' };
  }

  public async delete(id: string): Promise<{ success: boolean; error?: string }> {
    return await dbDeleteDiscountCode(id)
      ? { success: true }
      : { success: false, error: 'Kod rabatowy nie istnieje.' };
  }

  public async resetCounter(id: string): Promise<{ success: boolean; code?: DiscountCode; error?: string }> {
    const row = await dbResetDiscountCodeCounter(id);
    return row
      ? { success: true, code: toDiscountCode(row) }
      : { success: false, error: 'Kod nie istnieje.' };
  }
}

export const discountsManager = new DiscountsManager();

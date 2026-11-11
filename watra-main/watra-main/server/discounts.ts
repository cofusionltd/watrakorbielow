import fs from 'fs';
import path from 'path';
import { DiscountCode, DiscountValidationResult } from '../src/types';

const DISCOUNTS_STORAGE_FILE = path.join(process.cwd(), 'server', 'discounts_data.json');

const defaultDiscountCodes: DiscountCode[] = [
  {
    id: "disc-zima2026",
    code: "ZIMA2026",
    title: "Zimowy Szus pod Pilskiem",
    description: "Promocja First Minute na ferie zimowe i narty u stóp Pilska.",
    discountPercentage: 15,
    active: true,
    terminationType: "both",
    startDate: "2026-09-01",
    endDate: "2027-03-31",
    usageLimit: 50,
    usedCount: 14,
    availableInChat: true,
    chatTriggerNote: "Dla gości pytających o ferie, zimowe pobyty i narty.",
    createdAt: "2026-09-01T10:00:00.000Z"
  },
  {
    id: "disc-beskid20",
    code: "BESKID20",
    title: "Ekskluzywny Rabat Concierge AI",
    description: "Specjalny kod zniżkowy przekazywany bezpośrednio przez Concierge AI w czacie.",
    discountPercentage: 20,
    active: true,
    terminationType: "usage_limit",
    startDate: "2026-09-01",
    endDate: "2027-12-31",
    usageLimit: 30,
    usedCount: 9,
    availableInChat: true,
    chatTriggerNote: "Główny rabat do zaoferowania gościom w czacie, gdy pytają o promocję lub tańszą rezerwację.",
    createdAt: "2026-09-05T12:00:00.000Z"
  },
  {
    id: "disc-romantic",
    code: "ROMANTIC",
    title: "Weekend dla Dwojga z Jacuzzi",
    description: "Zniżka na pobyty romantyczne z kąpielą w gorącym jacuzzi pod gwiazdami.",
    discountPercentage: 10,
    active: true,
    terminationType: "time",
    startDate: "2026-09-15",
    endDate: "2026-12-31",
    usageLimit: 50,
    usedCount: 18,
    availableInChat: true,
    chatTriggerNote: "Dla par pytających o romantyczny weekend, wellness i jacuzzi.",
    createdAt: "2026-09-08T15:00:00.000Z"
  },
  {
    id: "disc-zdrowie",
    code: "WELLNESS",
    title: "Pakiety Górski Relaks & Spa",
    description: "Rabat na pakiety wypoczynkowe z nielimitowanym jacuzzi i sauną fińską.",
    discountPercentage: 12,
    active: true,
    terminationType: "time",
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    usageLimit: 40,
    usedCount: 11,
    availableInChat: false,
    chatTriggerNote: "Dla zapytań o strefę wellness, jacuzzi i saunę.",
    createdAt: "2026-08-25T09:00:00.000Z"
  },
  {
    id: "disc-gosc10",
    code: "GOSC10",
    title: "Gwarancja Rezerwacji Bezpośredniej",
    description: "Stały kod rabatowy -10% na dowolny pobyt zarezerwowany bezpośrednio.",
    discountPercentage: 10,
    active: true,
    terminationType: "none",
    usageLimit: null,
    usedCount: 42,
    availableInChat: true,
    chatTriggerNote: "Uniwersalny bezterminowy kod rabatowy dla każdego gościa.",
    createdAt: "2026-08-01T08:00:00.000Z"
  }
];

class DiscountsManager {
  private codes: DiscountCode[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      if (fs.existsSync(DISCOUNTS_STORAGE_FILE)) {
        const raw = fs.readFileSync(DISCOUNTS_STORAGE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.codes = parsed;
          return;
        }
      }
    } catch (err) {
      console.warn('[DiscountsManager] Failed to load from file storage, using defaults:', err);
    }

    this.codes = [...defaultDiscountCodes];
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      const dir = path.dirname(DISCOUNTS_STORAGE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DISCOUNTS_STORAGE_FILE, JSON.stringify(this.codes, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DiscountsManager] Error writing to discounts_data.json:', err);
    }
  }

  public getAll(): DiscountCode[] {
    return [...this.codes];
  }

  public getById(id: string): DiscountCode | undefined {
    return this.codes.find(c => c.id === id);
  }

  public getByCode(code: string): DiscountCode | undefined {
    if (!code) return undefined;
    const normalized = code.trim().toUpperCase();
    return this.codes.find(c => c.code.toUpperCase() === normalized);
  }

  public isCodeCurrentlyValid(codeObj: DiscountCode): { valid: boolean; reason?: string } {
    if (!codeObj.active) {
      return { valid: false, reason: 'Kod rabatowy jest obecnie wyłączony.' };
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Check time period
    if (codeObj.terminationType === 'time' || codeObj.terminationType === 'both') {
      if (codeObj.startDate && todayStr < codeObj.startDate) {
        return { valid: false, reason: `Kod zacznie obowiązywać od ${codeObj.startDate}.` };
      }
      if (codeObj.endDate && todayStr > codeObj.endDate) {
        return { valid: false, reason: `Ważność kodu rabatowego upłynęła ${codeObj.endDate}.` };
      }
    }

    // Check usage limit (number of codes sold/booked)
    if (codeObj.terminationType === 'usage_limit' || codeObj.terminationType === 'both') {
      if (codeObj.usageLimit != null && codeObj.usedCount >= codeObj.usageLimit) {
        return { valid: false, reason: `Limit sprzedaży dla tego kodu (${codeObj.usageLimit} rezerwacji) został wyczerpany.` };
      }
    }

    return { valid: true };
  }

  public validateCode(rawCode: string): DiscountValidationResult {
    if (!rawCode || typeof rawCode !== 'string') {
      return { valid: false, message: 'Wprowadź kod rabatowy.' };
    }

    const normalized = rawCode.trim().toUpperCase();
    const found = this.codes.find(c => c.code.toUpperCase() === normalized);

    if (!found) {
      return { valid: false, message: `Kod "${normalized}" nie istnieje lub został usunięty.` };
    }

    const validity = this.isCodeCurrentlyValid(found);
    if (!validity.valid) {
      return {
        valid: false,
        code: found.code,
        title: found.title,
        message: validity.reason || 'Kod rabatowy nie jest aktywny.'
      };
    }

    const remainingUses = (found.usageLimit != null && (found.terminationType === 'usage_limit' || found.terminationType === 'both'))
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

  public redeemCode(rawCode: string): { success: boolean; discountPercentage?: number; message: string } {
    const normalized = (rawCode || '').trim().toUpperCase();
    const found = this.codes.find(c => c.code.toUpperCase() === normalized);

    if (!found) {
      return { success: false, message: 'Kod nie istnieje.' };
    }

    const validity = this.isCodeCurrentlyValid(found);
    if (!validity.valid) {
      return { success: false, message: validity.reason || 'Kod nie jest ważny.' };
    }

    // Increment usage counter
    found.usedCount = (found.usedCount || 0) + 1;
    found.updatedAt = new Date().toISOString();
    this.saveToStorage();

    return {
      success: true,
      discountPercentage: found.discountPercentage,
      message: `Kod ${found.code} został pomyślnie zrealizowany.`
    };
  }

  public getChatDiscounts(): DiscountCode[] {
    return this.codes.filter(c => {
      if (!c.availableInChat) return false;
      const validity = this.isCodeCurrentlyValid(c);
      return validity.valid;
    });
  }

  public create(data: Partial<DiscountCode>): { success: boolean; code?: DiscountCode; error?: string } {
    if (!data.code || !data.code.trim()) {
      return { success: false, error: 'Kod rabatowy jest wymagany.' };
    }

    const normalizedCode = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (normalizedCode.length < 3) {
      return { success: false, error: 'Kod rabatowy musi mieć co najmniej 3 znaki.' };
    }

    // Check if code already exists
    if (this.codes.some(c => c.code.toUpperCase() === normalizedCode)) {
      return { success: false, error: `Kod o nazwie "${normalizedCode}" już istnieje w systemie.` };
    }

    const newCode: DiscountCode = {
      id: `disc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: normalizedCode,
      title: data.title?.trim() || `Promocja ${normalizedCode}`,
      description: data.description?.trim() || '',
      discountPercentage: Math.max(1, Math.min(90, Number(data.discountPercentage) || 10)),
      active: data.active !== undefined ? Boolean(data.active) : true,
      terminationType: data.terminationType || 'time',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || '2027-12-31',
      usageLimit: data.usageLimit !== undefined && data.usageLimit !== null && (data.usageLimit as any) !== '' ? Number(data.usageLimit) : null,
      usedCount: 0,
      availableInChat: data.availableInChat !== undefined ? Boolean(data.availableInChat) : true,
      chatTriggerNote: data.chatTriggerNote || '',
      minBookingNights: data.minBookingNights ? Number(data.minBookingNights) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.codes.unshift(newCode);
    this.saveToStorage();
    return { success: true, code: newCode };
  }

  public update(id: string, data: Partial<DiscountCode>): { success: boolean; code?: DiscountCode; error?: string } {
    const index = this.codes.findIndex(c => c.id === id);
    if (index === -1) {
      return { success: false, error: 'Kod rabatowy nie został znaleziony.' };
    }

    const existing = this.codes[index];

    // If changing code name, check uniqueness
    if (data.code && data.code.trim().toUpperCase() !== existing.code.toUpperCase()) {
      const normalizedCode = data.code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
      if (this.codes.some(c => c.id !== id && c.code.toUpperCase() === normalizedCode)) {
        return { success: false, error: `Kod "${normalizedCode}" już istnieje.` };
      }
      existing.code = normalizedCode;
    }

    if (data.title !== undefined) existing.title = data.title.trim();
    if (data.description !== undefined) existing.description = data.description.trim();
    if (data.discountPercentage !== undefined) existing.discountPercentage = Math.max(1, Math.min(90, Number(data.discountPercentage)));
    if (data.active !== undefined) existing.active = Boolean(data.active);
    if (data.terminationType !== undefined) existing.terminationType = data.terminationType;
    if (data.startDate !== undefined) existing.startDate = data.startDate;
    if (data.endDate !== undefined) existing.endDate = data.endDate;
    if (data.usageLimit !== undefined) {
      existing.usageLimit = (data.usageLimit === null || data.usageLimit === '' as any) ? null : Number(data.usageLimit);
    }
    if (data.usedCount !== undefined) existing.usedCount = Math.max(0, Number(data.usedCount));
    if (data.availableInChat !== undefined) existing.availableInChat = Boolean(data.availableInChat);
    if (data.chatTriggerNote !== undefined) existing.chatTriggerNote = data.chatTriggerNote;
    if (data.minBookingNights !== undefined) existing.minBookingNights = data.minBookingNights ? Number(data.minBookingNights) : undefined;

    existing.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return { success: true, code: existing };
  }

  public delete(id: string): { success: boolean; error?: string } {
    const initialLen = this.codes.length;
    this.codes = this.codes.filter(c => c.id !== id);
    if (this.codes.length === initialLen) {
      return { success: false, error: 'Kod rabatowy nie istnieje.' };
    }
    this.saveToStorage();
    return { success: true };
  }

  public resetCounter(id: string): { success: boolean; code?: DiscountCode; error?: string } {
    const codeObj = this.codes.find(c => c.id === id);
    if (!codeObj) {
      return { success: false, error: 'Kod nie istnieje.' };
    }
    codeObj.usedCount = 0;
    codeObj.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return { success: true, code: codeObj };
  }
}

export const discountsManager = new DiscountsManager();

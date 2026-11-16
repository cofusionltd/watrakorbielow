import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import {
  dbGetGuestProfiles,
  dbUpsertGuestProfile,
  dbGetGuestMessages,
  dbCreateGuestMessage,
  dbSetGuestMessageArchived,
  dbDeleteGuestMessage,
  dbCreateContactInquiry,
  dbDeleteContactInquiry,
  dbGetContactInquiries,
  dbUpdateContactInquiryRead
} from '../src/db/repository.ts';

export interface GuestProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  badges: string[];
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'vip';
  notes?: string;
  totalVisits: number;
  totalSpend: number;
  lastVisit?: string;
}

export interface GuestMessageData {
  id: string;
  guestEmail: string;
  sender: 'admin' | 'guest';
  senderName: string;
  message: string;
  type: 'chat' | 'promo' | 'notification' | 'inquiry';
  promoDiscount?: number;
  promoCode?: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

function mapDbRowToGuest(row: any): GuestProfileData {
  const badges = typeof row.badges === 'string' ? JSON.parse(row.badges) : row.badges;
  if (!Array.isArray(badges)) {
    throw new Error(`Guest profile ${row.id} has invalid badge data`);
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    badges,
    loyaltyTier: row.loyaltyTier || row.loyalty_tier || 'bronze',
    notes: row.notes || undefined,
    totalVisits: Number(row.totalVisits ?? row.total_visits ?? 1),
    totalSpend: Number(row.totalSpend ?? row.total_spend ?? 0),
    lastVisit: row.lastVisit ?? row.last_visit ?? undefined,
  };
}

function mapDbRowToMessage(row: any): GuestMessageData {
  return {
    id: row.id,
    guestEmail: row.guestEmail ?? row.guest_email,
    sender: row.sender,
    senderName: row.senderName ?? row.sender_name,
    message: row.message,
    type: row.type || 'chat',
    promoDiscount: row.promoDiscount ?? row.promo_discount ?? undefined,
    promoCode: row.promoCode ?? row.promo_code ?? undefined,
    isRead: Boolean(row.isRead ?? row.is_read),
    isArchived: Boolean(row.isArchived ?? row.is_archived),
    createdAt: new Date(row.createdAt ?? row.created_at).toISOString(),
  };
}

export async function handleSubmitContactInquiry(req: Request, res: Response) {
  const { name, email, phone, dates, message } = req.body ?? {};

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof phone !== 'string' ||
    typeof message !== 'string' ||
    (dates !== undefined && typeof dates !== 'string')
  ) {
    return res.status(400).json({ error: 'Uzupełnij poprawnie wymagane dane formularza.' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();
  const cleanDates = typeof dates === 'string' ? dates.trim() : '';
  const cleanMessage = message.trim();

  if (
    cleanName.length < 2 ||
    cleanName.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
    cleanEmail.length > 254 ||
    cleanPhone.length < 5 ||
    cleanPhone.length > 40 ||
    cleanDates.length > 200 ||
    cleanMessage.length < 1 ||
    cleanMessage.length > 4000
  ) {
    return res.status(400).json({ error: 'Sprawdź dane formularza i spróbuj ponownie.' });
  }

  const inquiryMessage = [
    `Telefon: ${cleanPhone}`,
    cleanDates ? `Planowany termin: ${cleanDates}` : '',
    '',
    cleanMessage,
  ].filter(Boolean).join('\n');

  try {
    await dbCreateContactInquiry({
      id: `contact-${randomUUID()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      message: inquiryMessage,
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Contact inquiry could not be saved:', error);
    return res.status(503).json({
      error: 'Nie udało się teraz zapisać zapytania. Spróbuj ponownie później lub skontaktuj się telefonicznie.',
    });
  }
}

export async function handleGetContactInquiries(_req: Request, res: Response) {
  try {
    const rows = await dbGetContactInquiries();
    return res.json(rows.map(mapDbRowToMessage));
  } catch (error) {
    console.error('Could not load contact inquiries:', error);
    return res.status(503).json({ error: 'Could not load contact inquiries.' });
  }
}

export async function handleUpdateContactInquiryRead(req: Request, res: Response) {
  const { isRead } = req.body ?? {};
  if (typeof isRead !== 'boolean') {
    return res.status(400).json({ error: 'isRead must be a boolean.' });
  }

  try {
    const row = await dbUpdateContactInquiryRead(req.params.id, isRead);
    if (!row) return res.status(404).json({ error: 'Contact inquiry not found.' });
    return res.json({ success: true, inquiry: mapDbRowToMessage(row) });
  } catch (error) {
    console.error('Could not update contact inquiry read status:', error);
    return res.status(503).json({ error: 'Could not update contact inquiry.' });
  }
}

export async function handleDeleteContactInquiry(req: Request, res: Response) {
  try {
    const deleted = await dbDeleteContactInquiry(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Contact inquiry not found.' });
    return res.json({ success: true });
  } catch (error) {
    console.error('Could not delete contact inquiry:', error);
    return res.status(503).json({ error: 'Could not delete contact inquiry.' });
  }
}

export async function handleGetGuests(_req: Request, res: Response) {
  try {
    const rows = await dbGetGuestProfiles();
    return res.json(rows.map(mapDbRowToGuest));
  } catch (error) {
    console.error('Could not load guest profiles:', error);
    return res.status(503).json({ error: 'Nie udało się pobrać profili gości.' });
  }
}

export async function handleUpsertGuest(req: Request, res: Response) {
  const { name, email, phone, badges = [], loyaltyTier = 'bronze', notes, totalVisits = 1, totalSpend = 0, lastVisit } = req.body ?? {};
  if (typeof name !== 'string' || typeof email !== 'string' || !name.trim() || !email.trim()) {
    return res.status(400).json({ error: 'Imię i adres e-mail są wymagane.' });
  }
  if (!Array.isArray(badges) || !['bronze', 'silver', 'gold', 'vip'].includes(loyaltyTier)) {
    return res.status(400).json({ error: 'Nieprawidłowe odznaki lub poziom lojalności.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  try {
    const existing = (await dbGetGuestProfiles()).find(row =>
      row.email.toLowerCase() === cleanEmail
    );
    const saved = await dbUpsertGuestProfile({
      id: existing?.id || `guest-${randomUUID()}`,
      name: name.trim(),
      email: cleanEmail,
      phone: typeof phone === 'string' ? phone.trim() : undefined,
      badges: JSON.stringify(badges),
      loyaltyTier,
      notes: typeof notes === 'string' ? notes.trim() : undefined,
      totalVisits: Number(totalVisits),
      totalSpend: Number(totalSpend),
      lastVisit: typeof lastVisit === 'string' ? lastVisit : undefined,
    });
    return res.status(200).json({ success: true, guest: mapDbRowToGuest(saved) });
  } catch (error) {
    console.error('Could not save guest profile:', error);
    return res.status(503).json({ error: 'Nie udało się zapisać profilu gościa.' });
  }
}

export async function handleUpdateGuestBadges(req: Request, res: Response) {
  const id = decodeURIComponent(req.params.id);
  const { badges, loyaltyTier } = req.body ?? {};

  try {
    const row = (await dbGetGuestProfiles()).find(guest =>
      guest.id === id || guest.email.toLowerCase() === id.toLowerCase()
    );
    if (!row) {
      return res.status(404).json({ error: 'Gość nie został odnaleziony.' });
    }

    const guest = mapDbRowToGuest(row);
    const updatedBadges = badges === undefined ? guest.badges : badges;
    const updatedTier = loyaltyTier ?? guest.loyaltyTier;
    if (!Array.isArray(updatedBadges) || !['bronze', 'silver', 'gold', 'vip'].includes(updatedTier)) {
      return res.status(400).json({ error: 'Nieprawidłowe odznaki lub poziom lojalności.' });
    }

    const saved = await dbUpsertGuestProfile({
      id: guest.id,
      name: guest.name,
      email: guest.email,
      phone: guest.phone,
      badges: JSON.stringify(updatedBadges),
      loyaltyTier: updatedTier,
      notes: guest.notes,
      totalVisits: guest.totalVisits,
      totalSpend: guest.totalSpend,
      lastVisit: guest.lastVisit,
    });
    return res.json({ success: true, guest: mapDbRowToGuest(saved) });
  } catch (error) {
    console.error('Could not update guest badges:', error);
    return res.status(503).json({ error: 'Nie udało się zaktualizować odznak gościa.' });
  }
}

export async function handleGetGuestMessages(req: Request, res: Response) {
  const guestEmail = decodeURIComponent(req.params.email).trim().toLowerCase();
  try {
    const rows = await dbGetGuestMessages(guestEmail);
    return res.json(rows.map(mapDbRowToMessage));
  } catch (error) {
    console.error('Could not load guest messages:', error);
    return res.status(503).json({ error: 'Nie udało się pobrać wiadomości dla gościa.' });
  }
}

export async function handleSetGuestMessageArchived(req: Request, res: Response) {
  const guestEmail = decodeURIComponent(req.params.email).trim().toLowerCase();
  const { isArchived } = req.body ?? {};
  if (typeof isArchived !== 'boolean') {
    return res.status(400).json({ error: 'isArchived must be a boolean.' });
  }

  try {
    const row = await dbSetGuestMessageArchived(req.params.id, guestEmail, isArchived);
    if (!row) return res.status(404).json({ error: 'Wiadomość nie istnieje.' });
    return res.json({ success: true, message: mapDbRowToMessage(row) });
  } catch (error) {
    console.error('Could not update guest message archive status:', error);
    return res.status(503).json({ error: 'Nie udało się zaktualizować archiwum wiadomości.' });
  }
}

export async function handleDeleteGuestMessage(req: Request, res: Response) {
  const guestEmail = decodeURIComponent(req.params.email).trim().toLowerCase();

  try {
    const deleted = await dbDeleteGuestMessage(req.params.id, guestEmail);
    if (!deleted) return res.status(404).json({ error: 'Wiadomość nie istnieje.' });
    return res.json({ success: true });
  } catch (error) {
    console.error('Could not delete guest message:', error);
    return res.status(503).json({ error: 'Nie udało się usunąć wiadomości.' });
  }
}

export async function handleSendGuestMessage(req: Request, res: Response) {
  const guestEmail = decodeURIComponent(req.params.email).trim().toLowerCase();
  const { message, type = 'chat', promoDiscount, promoCode, senderName = 'Recepcja Watra Korbielów' } = req.body ?? {};

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Treść wiadomości nie może być pusta.' });
  }

  try {
    const saved = await dbCreateGuestMessage({
      id: `msg-${randomUUID()}`,
      guestEmail,
      sender: 'admin',
      senderName,
      message: message.trim(),
      type,
      promoDiscount: promoDiscount ? Number(promoDiscount) : undefined,
      promoCode: promoCode ? String(promoCode).trim().toUpperCase() : undefined,
    });
    return res.status(201).json({ success: true, message: mapDbRowToMessage(saved) });
  } catch (error) {
    console.error('Could not save guest message:', error);
    return res.status(503).json({ error: 'Nie udało się zapisać wiadomości dla gościa.' });
  }
}

export async function handleGetMyGuestMessages(req: Request, res: Response) {
  const email = String(req.query.email ?? '').trim().toLowerCase();
  if (!email) {
    return res.json([]);
  }

  try {
    const rows = await dbGetGuestMessages(email);
    return res.json(rows.map(mapDbRowToMessage));
  } catch (error) {
    console.error('Could not load guest messages:', error);
    return res.status(503).json({ error: 'Nie udało się pobrać wiadomości.' });
  }
}

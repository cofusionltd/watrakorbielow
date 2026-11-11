import { Request, Response } from 'express';
import {
  dbGetGuestProfiles,
  dbUpsertGuestProfile,
  dbGetGuestMessages,
  dbCreateGuestMessage
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
  totalSpend?: number;
  lastVisit?: string;
}

export interface GuestMessageData {
  id: string;
  guestEmail: string;
  sender: 'admin' | 'guest';
  senderName: string;
  message: string;
  type: 'chat' | 'promo' | 'notification';
  promoDiscount?: number;
  promoCode?: string;
  isRead: boolean;
  createdAt: string;
}

// Initial fallback guests
let memoryGuests: GuestProfileData[] = [
  {
    id: 'guest-1',
    name: 'Piotr Wiśniewski',
    email: 'p.wisniewski@example.com',
    phone: '+48 602 111 222',
    badges: ['VIP 👑', 'Stały Bywalec 🏔️', 'Klub Narciarza ⛷️'],
    loyaltyTier: 'vip',
    notes: 'Preferuje pokój z widokiem na las na 2. piętrze. Regularny gość zimowy.',
    totalVisits: 5,
    totalSpend: 2850,
    lastVisit: '2026-02-14'
  },
  {
    id: 'guest-2',
    name: 'Marek & Joanna Dąbrowscy',
    email: 'm.dabrowski@example.com',
    phone: '+48 501 334 556',
    badges: ['Rodzina 👨‍👩‍👧‍👦', 'Klub Narciarza ⛷️'],
    loyaltyTier: 'gold',
    notes: 'Przyjeżdżają z dwójką dzieci na ferie zimowe. Zawsze pytają o sanki i instruktora.',
    totalVisits: 3,
    totalSpend: 3420,
    lastVisit: '2026-01-20'
  },
  {
    id: 'guest-3',
    name: 'Stanisław Kowalczyk',
    email: 's.kowalczyk@wp.pl',
    phone: '+48 600 778 990',
    badges: ['Relaks & Wellness 🌿', 'Złoty Gość ⭐'],
    loyaltyTier: 'gold',
    notes: 'Gość pakietów relaksacyjnych i wellness. Dieta bezglutenowa.',
    totalVisits: 4,
    totalSpend: 4200,
    lastVisit: '2025-10-12'
  },
  {
    id: 'guest-4',
    name: 'Anna & Krzysztof Majewscy',
    email: 'anna.majewska@example.com',
    phone: '+48 692 888 123',
    badges: ['Jacuzzi Lover ♨️', 'Stały Bywalec 🏔️'],
    loyaltyTier: 'silver',
    notes: 'Często rezerwują prywatne seanse jacuzzi pod gwiazdami.',
    totalVisits: 2,
    totalSpend: 1680,
    lastVisit: '2026-03-01'
  }
];

let memoryMessages: GuestMessageData[] = [
  {
    id: 'msg-1',
    guestEmail: 'p.wisniewski@example.com',
    sender: 'admin',
    senderName: 'Recepcja Watra',
    message: 'Panie Piotrze, przygotowaliśmy dla Pana ulubiony pokój z widokiem na las na 2. piętrze. Do zobaczenia w Korbielowie!',
    type: 'chat',
    isRead: true,
    createdAt: '2026-09-08T10:30:00Z'
  },
  {
    id: 'msg-2',
    guestEmail: 'p.wisniewski@example.com',
    sender: 'admin',
    senderName: 'Dyrektor Resortu Watra',
    message: 'Dziękujemy za 5. pobyt w naszym resorcie! Jako stały gość VIP otrzymuje Pan kod rabatowy 20% na rezerwację zimową.',
    type: 'promo',
    promoDiscount: 20,
    promoCode: 'VIP-PILSKO20',
    isRead: false,
    createdAt: '2026-09-10T14:15:00Z'
  }
];

// Helper to map DB row to guest profile
function mapDbRowToGuest(row: any): GuestProfileData {
  let badges: string[] = [];
  try {
    badges = typeof row.badges === 'string' ? JSON.parse(row.badges) : row.badges || [];
  } catch (_) {
    badges = [];
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    badges,
    loyaltyTier: (row.loyaltyTier || row.loyalty_tier || 'bronze') as any,
    notes: row.notes || undefined,
    totalVisits: Number(row.totalVisits || row.total_visits || 1),
  };
}

// GET /api/admin/guests - List all guest profiles
export async function handleGetGuests(_req: Request, res: Response) {
  try {
    const rows = await dbGetGuestProfiles();
    if (rows && rows.length > 0) {
      const mapped = rows.map(mapDbRowToGuest);
      // Merge with memory stats
      memoryGuests = mapped.map(g => {
        const existing = memoryGuests.find(m => m.email.toLowerCase() === g.email.toLowerCase());
        return {
          ...g,
          totalSpend: existing ? existing.totalSpend : 1200 * g.totalVisits,
          lastVisit: existing ? existing.lastVisit : '2026-01-15'
        };
      });
      return res.json(memoryGuests);
    }
  } catch (err) {
    console.warn("DB getGuestProfiles fallback:", err);
  }
  return res.json(memoryGuests);
}

// POST /api/admin/guests - Create or update guest profile
export async function handleUpsertGuest(req: Request, res: Response) {
  try {
    const { name, email, phone, badges = [], loyaltyTier = 'bronze', notes, totalVisits = 1 } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Imię i adres e-mail są wymagane." });
    }

    const emailTrimmed = email.trim().toLowerCase();
    const existingIndex = memoryGuests.findIndex(g => g.email.toLowerCase() === emailTrimmed);
    const id = existingIndex !== -1 ? memoryGuests[existingIndex].id : `guest-${Date.now()}`;

    const badgesArray = Array.isArray(badges) ? badges : [badges];
    const badgesJson = JSON.stringify(badgesArray);

    try {
      await dbUpsertGuestProfile({
        id,
        name: name.trim(),
        email: emailTrimmed,
        phone: phone ? phone.trim() : undefined,
        badges: badgesJson,
        loyaltyTier,
        notes: notes ? notes.trim() : undefined,
        totalVisits: Number(totalVisits)
      });
    } catch (dbErr) {
      console.warn("Failed saving guest profile to DB, keeping in memory:", dbErr);
    }

    const guestObj: GuestProfileData = {
      id,
      name: name.trim(),
      email: emailTrimmed,
      phone: phone ? phone.trim() : undefined,
      badges: badgesArray,
      loyaltyTier,
      notes: notes ? notes.trim() : undefined,
      totalVisits: Number(totalVisits),
      totalSpend: existingIndex !== -1 ? memoryGuests[existingIndex].totalSpend : 0,
      lastVisit: existingIndex !== -1 ? memoryGuests[existingIndex].lastVisit : new Date().toISOString().split('T')[0]
    };

    if (existingIndex !== -1) {
      memoryGuests[existingIndex] = guestObj;
    } else {
      memoryGuests.unshift(guestObj);
    }

    return res.status(200).json({ success: true, guest: guestObj });
  } catch (err: any) {
    console.error("Upsert guest error:", err);
    return res.status(500).json({ error: err.message || "Błąd podczas zapisu profilu gościa." });
  }
}

// PUT /api/admin/guests/:id/badges - Update badges for a guest
export async function handleUpdateGuestBadges(req: Request, res: Response) {
  const { id } = req.params;
  const { badges, loyaltyTier } = req.body;

  try {
    const guest = memoryGuests.find(g => g.id === id || g.email.toLowerCase() === id.toLowerCase());
    if (!guest) {
      return res.status(404).json({ error: "Gość nie został odnaleziony." });
    }

    const updatedBadges = Array.isArray(badges) ? badges : guest.badges;
    const updatedTier = loyaltyTier || guest.loyaltyTier;

    guest.badges = updatedBadges;
    guest.loyaltyTier = updatedTier;

    try {
      await dbUpsertGuestProfile({
        id: guest.id,
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        badges: JSON.stringify(updatedBadges),
        loyaltyTier: updatedTier,
        notes: guest.notes,
        totalVisits: guest.totalVisits
      });
    } catch (dbErr) {
      console.warn("DB badge update fallback:", dbErr);
    }

    return res.json({ success: true, guest });
  } catch (err: any) {
    console.error("Update guest badges error:", err);
    return res.status(500).json({ error: err.message || "Błąd aktualizacji odznak gościa." });
  }
}

// GET /api/admin/guests/:email/messages - Get messages for a guest
export async function handleGetGuestMessages(req: Request, res: Response) {
  const { email } = req.params;
  const guestEmail = decodeURIComponent(email).toLowerCase();

  try {
    const rows = await dbGetGuestMessages(guestEmail);
    if (rows && rows.length > 0) {
      const mapped: GuestMessageData[] = rows.map(r => ({
        id: r.id,
        guestEmail: r.guestEmail,
        sender: r.sender as any,
        senderName: r.senderName,
        message: r.message,
        type: (r.type as any) || 'chat',
        promoDiscount: r.promoDiscount || undefined,
        promoCode: r.promoCode || undefined,
        isRead: Boolean(r.isRead),
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
      }));
      return res.json(mapped);
    }
  } catch (err) {
    console.warn("DB getGuestMessages fallback:", err);
  }

  const filtered = memoryMessages.filter(m => m.guestEmail.toLowerCase() === guestEmail);
  return res.json(filtered);
}

// POST /api/admin/guests/:email/messages - Send notification / promotion / chat message to guest
export async function handleSendGuestMessage(req: Request, res: Response) {
  const { email } = req.params;
  const guestEmail = decodeURIComponent(email).toLowerCase();
  const { message, type = 'chat', promoDiscount, promoCode, senderName = 'Recepcja Watra Korbielów' } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Treść wiadomości nie może być pusta." });
  }

  const newMsg: GuestMessageData = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    guestEmail,
    sender: 'admin',
    senderName,
    message: message.trim(),
    type,
    promoDiscount: promoDiscount ? Number(promoDiscount) : undefined,
    promoCode: promoCode ? promoCode.trim().toUpperCase() : undefined,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  try {
    await dbCreateGuestMessage({
      id: newMsg.id,
      guestEmail,
      sender: 'admin',
      senderName,
      message: newMsg.message,
      type: newMsg.type,
      promoDiscount: newMsg.promoDiscount,
      promoCode: newMsg.promoCode
    });
  } catch (dbErr) {
    console.warn("Failed saving guest message to DB, keeping in memory:", dbErr);
  }

  memoryMessages.push(newMsg);
  return res.status(201).json({ success: true, message: newMsg });
}

// GET /api/guest/messages?email=... - Guest-facing endpoint to read their notifications & promotions
export async function handleGetMyGuestMessages(req: Request, res: Response) {
  const email = (req.query.email as string || '').trim().toLowerCase();
  if (!email) {
    return res.json([]);
  }

  try {
    const rows = await dbGetGuestMessages(email);
    if (rows && rows.length > 0) {
      const mapped: GuestMessageData[] = rows.map(r => ({
        id: r.id,
        guestEmail: r.guestEmail,
        sender: r.sender as any,
        senderName: r.senderName,
        message: r.message,
        type: (r.type as any) || 'chat',
        promoDiscount: r.promoDiscount || undefined,
        promoCode: r.promoCode || undefined,
        isRead: Boolean(r.isRead),
        createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString()
      }));
      return res.json(mapped);
    }
  } catch (err) {
    console.warn("DB getGuestMessages guest fallback:", err);
  }

  const filtered = memoryMessages.filter(m => m.guestEmail.toLowerCase() === email);
  return res.json(filtered);
}

import { db } from './index.ts';
import {
  promotions,
  reservations,
  aiKnowledge,
  visitorSessions,
  rooms,
  guestProfiles,
  guestMessages,
  chatSessions
} from './schema.ts';
import { eq, desc, asc } from 'drizzle-orm';

// --- ROOMS (Central Source of Truth) ---
export async function dbGetRooms() {
  try {
    return await db.select().from(rooms).orderBy(asc(rooms.orderIndex), asc(rooms.id));
  } catch (error) {
    console.error('dbGetRooms query error:', error);
    throw new Error('Nie udało się pobrać listy pokoi z bazy danych', { cause: error });
  }
}

export async function dbGetRoomById(id: string) {
  try {
    const res = await db.select().from(rooms).where(eq(rooms.id, id));
    return res[0] || null;
  } catch (error) {
    console.error('dbGetRoomById error:', error);
    throw new Error(`Nie udało się pobrać pokoju ${id}`, { cause: error });
  }
}

export async function dbCreateRoom(data: {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  capacity: number;
  size: string;
  bedConfig: string;
  images: string;
  tags: string;
  description: string;
  active?: boolean;
  orderIndex?: number;
}) {
  try {
    const res = await db.insert(rooms).values({
      id: data.id,
      name: data.name,
      category: data.category,
      basePrice: data.basePrice,
      capacity: data.capacity,
      size: data.size,
      bedConfig: data.bedConfig,
      images: data.images,
      tags: data.tags,
      description: data.description,
      active: data.active !== undefined ? data.active : true,
      orderIndex: data.orderIndex || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return res[0];
  } catch (error) {
    console.error('dbCreateRoom error:', error);
    throw new Error('Błąd tworzenia pokoju w bazie danych', { cause: error });
  }
}

export async function dbUpdateRoom(id: string, updates: Partial<{
  name: string;
  category: string;
  basePrice: number;
  capacity: number;
  size: string;
  bedConfig: string;
  images: string;
  tags: string;
  description: string;
  active: boolean;
  orderIndex: number;
}>) {
  try {
    const res = await db.update(rooms).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(rooms.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error('dbUpdateRoom error:', error);
    throw new Error('Błąd aktualizacji pokoju w bazie danych', { cause: error });
  }
}

export async function dbDeleteRoom(id: string) {
  try {
    await db.delete(rooms).where(eq(rooms.id, id));
    return true;
  } catch (error) {
    console.error('dbDeleteRoom error:', error);
    throw new Error('Błąd usuwania pokoju z bazy danych', { cause: error });
  }
}

// --- GUEST PROFILES & BADGES ---
export async function dbGetGuestProfiles() {
  try {
    return await db.select().from(guestProfiles).orderBy(desc(guestProfiles.updatedAt));
  } catch (error) {
    console.error('dbGetGuestProfiles query error:', error);
    throw new Error('Nie udało się pobrać profili gości', { cause: error });
  }
}

export async function dbUpsertGuestProfile(data: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  badges: string;
  loyaltyTier?: string;
  notes?: string;
  totalVisits?: number;
}) {
  try {
    const res = await db.insert(guestProfiles).values({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      badges: data.badges,
      loyaltyTier: data.loyaltyTier || 'bronze',
      notes: data.notes || null,
      totalVisits: data.totalVisits || 1,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: guestProfiles.id,
      set: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        badges: data.badges,
        loyaltyTier: data.loyaltyTier || 'bronze',
        notes: data.notes || null,
        totalVisits: data.totalVisits !== undefined ? data.totalVisits : 1,
        updatedAt: new Date(),
      }
    }).returning();
    return res[0];
  } catch (error) {
    console.error('dbUpsertGuestProfile error:', error);
    throw new Error('Błąd zapisu profilu gościa', { cause: error });
  }
}

// --- GUEST MESSAGES & PROMOTIONS ---
export async function dbGetGuestMessages(guestEmail?: string) {
  try {
    if (guestEmail) {
      return await db.select().from(guestMessages).where(eq(guestMessages.guestEmail, guestEmail)).orderBy(asc(guestMessages.createdAt));
    }
    return await db.select().from(guestMessages).orderBy(desc(guestMessages.createdAt));
  } catch (error) {
    console.error('dbGetGuestMessages error:', error);
    throw new Error('Nie udało się pobrać wiadomości dla gości', { cause: error });
  }
}

export async function dbCreateGuestMessage(data: {
  id: string;
  guestEmail: string;
  sender: 'admin' | 'guest';
  senderName: string;
  message: string;
  type?: 'chat' | 'promo' | 'notification';
  promoDiscount?: number;
  promoCode?: string;
}) {
  try {
    const res = await db.insert(guestMessages).values({
      id: data.id,
      guestEmail: data.guestEmail,
      sender: data.sender,
      senderName: data.senderName,
      message: data.message,
      type: data.type || 'chat',
      promoDiscount: data.promoDiscount || null,
      promoCode: data.promoCode || null,
      isRead: false,
      createdAt: new Date(),
    }).returning();
    return res[0];
  } catch (error) {
    console.error('dbCreateGuestMessage error:', error);
    throw new Error('Błąd zapisu wiadomości dla gościa', { cause: error });
  }
}

// --- REAL-TIME CHAT SESSIONS & ADMIN TAKEOVER ---
export async function dbGetChatSessions() {
  try {
    return await db.select().from(chatSessions).orderBy(desc(chatSessions.lastMessageAt));
  } catch (error) {
    console.error('dbGetChatSessions error:', error);
    throw new Error('Nie udało się pobrać sesji czatu AI', { cause: error });
  }
}

export async function dbGetChatSession(sessionId: string) {
  try {
    const res = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId));
    return res[0] || null;
  } catch (error) {
    console.error('dbGetChatSession error:', error);
    throw new Error(`Błąd pobierania sesji czatu ${sessionId}`, { cause: error });
  }
}

export async function dbUpsertChatSession(data: {
  sessionId: string;
  guestName?: string;
  guestEmail?: string;
  language?: string;
  isAiPaused?: boolean;
  adminTakeover?: boolean;
  lastMessage?: string;
  messagesJson?: string;
}) {
  try {
    const res = await db.insert(chatSessions).values({
      sessionId: data.sessionId,
      guestName: data.guestName || 'Gość Watra',
      guestEmail: data.guestEmail || null,
      language: data.language || 'pl',
      isAiPaused: data.isAiPaused || false,
      adminTakeover: data.adminTakeover || false,
      lastMessage: data.lastMessage || '',
      lastMessageAt: new Date(),
      messagesJson: data.messagesJson || '[]',
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: chatSessions.sessionId,
      set: {
        guestName: data.guestName !== undefined ? data.guestName : 'Gość Watra',
        guestEmail: data.guestEmail !== undefined ? data.guestEmail : null,
        language: data.language !== undefined ? data.language : 'pl',
        isAiPaused: data.isAiPaused !== undefined ? data.isAiPaused : false,
        adminTakeover: data.adminTakeover !== undefined ? data.adminTakeover : false,
        lastMessage: data.lastMessage !== undefined ? data.lastMessage : '',
        lastMessageAt: new Date(),
        messagesJson: data.messagesJson !== undefined ? data.messagesJson : '[]',
        updatedAt: new Date(),
      }
    }).returning();
    return res[0];
  } catch (error) {
    console.error('dbUpsertChatSession error:', error);
    throw new Error('Błąd zapisu sesji czatu', { cause: error });
  }
}

// --- PROMOTIONS ---
export async function dbGetPromotions() {
  try {
    return await db.select().from(promotions).orderBy(desc(promotions.createdAt));
  } catch (error) {
    console.error('dbGetPromotions query error:', error);
    throw new Error('Nie udało się pobrać promocji z bazy danych', { cause: error });
  }
}

export async function dbCreatePromotion(data: {
  id: string;
  title: string;
  badge: string;
  description: string;
  discountPercent: number;
  promoCode: string;
  active: boolean;
  channels: string;
  startsAt: string;
  endsAt: string;
  clicksCount?: number;
  bookingsCount?: number;
  revenueGenerated?: number;
}) {
  try {
    const res = await db.insert(promotions).values({
      id: data.id,
      title: data.title,
      badge: data.badge,
      description: data.description,
      discountPercent: data.discountPercent,
      promoCode: data.promoCode,
      active: data.active,
      channels: data.channels,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      clicksCount: data.clicksCount || 0,
      bookingsCount: data.bookingsCount || 0,
      revenueGenerated: data.revenueGenerated || 0,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('dbCreatePromotion error:', error);
    throw new Error('Błąd zapisu promocji w bazie danych', { cause: error });
  }
}

export async function dbUpdatePromotion(id: string, updates: Partial<{
  title: string;
  badge: string;
  description: string;
  discountPercent: number;
  promoCode: string;
  active: boolean;
  channels: string;
  startsAt: string;
  endsAt: string;
  clicksCount: number;
  bookingsCount: number;
  revenueGenerated: number;
}>) {
  try {
    const res = await db.update(promotions).set(updates).where(eq(promotions.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error('dbUpdatePromotion error:', error);
    throw new Error('Błąd aktualizacji promocji w bazie danych', { cause: error });
  }
}

export async function dbDeletePromotion(id: string) {
  try {
    await db.delete(promotions).where(eq(promotions.id, id));
    return true;
  } catch (error) {
    console.error('dbDeletePromotion error:', error);
    throw new Error('Błąd usuwania promocji z bazy danych', { cause: error });
  }
}

// --- RESERVATIONS ---
export async function dbGetReservations() {
  try {
    return await db.select().from(reservations).orderBy(desc(reservations.createdAt));
  } catch (error) {
    console.error('dbGetReservations query error:', error);
    throw new Error('Nie udało się pobrać rezerwacji z bazy danych', { cause: error });
  }
}

export async function dbCreateReservation(data: {
  id: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalPrice: number;
  status?: string;
  source?: string;
  specialRequests?: string;
  dietaryRestrictions?: string;
  transportNeeded?: boolean;
  pfronCertificate?: boolean;
  discountApplied?: number;
  promoCode?: string;
  includeBreakfast?: boolean;
  includeDinner?: boolean;
}) {
  try {
    const res = await db.insert(reservations).values({
      id: data.id,
      userId: data.userId || null,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      roomId: data.roomId,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      adults: data.adults,
      children: data.children,
      totalPrice: data.totalPrice,
      status: data.status || 'confirmed',
      source: data.source || 'direct',
      specialRequests: data.specialRequests || null,
      dietaryRestrictions: data.dietaryRestrictions || null,
      transportNeeded: !!data.transportNeeded,
      pfronCertificate: !!data.pfronCertificate,
      discountApplied: data.discountApplied || 0,
      promoCode: data.promoCode || null,
      includeBreakfast: !!data.includeBreakfast,
      includeDinner: !!data.includeDinner,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('dbCreateReservation error:', error);
    throw new Error('Błąd zapisu rezerwacji w bazie danych', { cause: error });
  }
}

export async function dbUpdateReservationStatus(id: string, status: string) {
  try {
    const res = await db.update(reservations).set({ status }).where(eq(reservations.id, id)).returning();
    return res[0];
  } catch (error) {
    console.error('dbUpdateReservationStatus error:', error);
    throw new Error('Błąd zmiany statusu rezerwacji w bazie danych', { cause: error });
  }
}

// --- AI KNOWLEDGE ---
export async function dbGetAiKnowledge() {
  try {
    return await db.select().from(aiKnowledge).orderBy(desc(aiKnowledge.updatedAt));
  } catch (error) {
    console.error('dbGetAiKnowledge query error:', error);
    throw new Error('Nie udało się pobrać bazy wiedzy AI', { cause: error });
  }
}

export async function dbUpsertAiKnowledge(data: {
  id: string;
  title: string;
  category: string;
  content: string;
}) {
  try {
    const res = await db.insert(aiKnowledge).values({
      id: data.id,
      title: data.title,
      category: data.category,
      content: data.content,
    }).onConflictDoUpdate({
      target: aiKnowledge.id,
      set: {
        title: data.title,
        category: data.category,
        content: data.content,
        updatedAt: new Date(),
      }
    }).returning();
    return res[0];
  } catch (error) {
    console.error('dbUpsertAiKnowledge error:', error);
    throw new Error('Błąd zapisu wiedzy AI w bazie danych', { cause: error });
  }
}

export async function dbDeleteAiKnowledge(id: string) {
  try {
    await db.delete(aiKnowledge).where(eq(aiKnowledge.id, id));
    return true;
  } catch (error) {
    console.error('dbDeleteAiKnowledge error:', error);
    throw new Error('Błąd usuwania dokumentu wiedzy z bazy danych', { cause: error });
  }
}

// --- VISITOR SESSIONS ---
export async function dbGetVisitorSessions() {
  try {
    return await db.select().from(visitorSessions).orderBy(desc(visitorSessions.lastSeen));
  } catch (error) {
    console.error('dbGetVisitorSessions error:', error);
    throw new Error('Nie udało się pobrać sesji gości', { cause: error });
  }
}

export async function dbUpsertVisitorSession(data: {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  flag: string;
  currentPage: string;
  pageTitle: string;
  pageViewsJson: string;
  timeOnCurrentPage: number;
  totalTimeSeconds: number;
  device: string;
  browser: string;
  firstSeen: string;
  lastSeen: string;
}) {
  try {
    const res = await db.insert(visitorSessions).values(data).onConflictDoUpdate({
      target: visitorSessions.id,
      set: {
        currentPage: data.currentPage,
        pageTitle: data.pageTitle,
        pageViewsJson: data.pageViewsJson,
        timeOnCurrentPage: data.timeOnCurrentPage,
        totalTimeSeconds: data.totalTimeSeconds,
        device: data.device,
        browser: data.browser,
        lastSeen: data.lastSeen,
      }
    }).returning();
    return res[0];
  } catch (error) {
    console.error('dbUpsertVisitorSession error:', error);
    throw new Error('Błąd zapisu sesji telemetrycznej w bazie danych', { cause: error });
  }
}

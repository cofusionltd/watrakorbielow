import { db } from './index.ts';
import {
  promotions,
  reservations,
  aiKnowledge,
  visitorSessions,
  rooms,
  guestProfiles,
  guestMessages,
  chatSessions,
  discountCodes,
  cmsContent,
  siteSettings,
  mediaAssets,
  mailboxIntegrations,
  mailboxOauthStates
} from './schema.ts';
import { and, eq, desc, asc, ilike, lt, gt, ne, sql, or, like } from 'drizzle-orm';

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
    const [deleted] = await db.delete(rooms).where(eq(rooms.id, id)).returning({ id: rooms.id });
    return Boolean(deleted);
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
  totalSpend?: number;
  lastVisit?: string;
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
      totalSpend: data.totalSpend ?? 0,
      lastVisit: data.lastVisit || null,
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
        totalSpend: data.totalSpend !== undefined ? data.totalSpend : 0,
        lastVisit: data.lastVisit || null,
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

const contactInquiryCondition = or(
  eq(guestMessages.type, 'inquiry'),
  like(guestMessages.message, 'Telefon:%'),
)!;

export async function dbGetContactInquiries() {
  try {
    return await db.select().from(guestMessages)
      .where(and(eq(guestMessages.sender, 'guest'), contactInquiryCondition))
      .orderBy(desc(guestMessages.createdAt))
      .limit(500);
  } catch (error) {
    console.error('dbGetContactInquiries error:', error);
    throw new Error('Could not load contact inquiries', { cause: error });
  }
}

export async function dbGetContactInquiry(id: string) {
  try {
    const [inquiry] = await db.select().from(guestMessages)
      .where(and(
        eq(guestMessages.id, id),
        eq(guestMessages.sender, 'guest'),
        contactInquiryCondition
      ))
      .limit(1);
    return inquiry || null;
  } catch (error) {
    console.error('dbGetContactInquiry error:', error);
    throw new Error('Could not load contact inquiry', { cause: error });
  }
}

export async function dbUpdateContactInquiryRead(id: string, isRead: boolean) {
  try {
    const [updated] = await db.update(guestMessages)
      .set({ isRead })
      .where(and(
        eq(guestMessages.id, id),
        eq(guestMessages.sender, 'guest'),
        contactInquiryCondition
      ))
      .returning();
    return updated || null;
  } catch (error) {
    console.error('dbUpdateContactInquiryRead error:', error);
    throw new Error('Could not update contact inquiry read status', { cause: error });
  }
}

export async function dbDeleteContactInquiry(id: string) {
  try {
    const [deleted] = await db.delete(guestMessages)
      .where(and(
        eq(guestMessages.id, id),
        eq(guestMessages.sender, 'guest'),
        contactInquiryCondition
      ))
      .returning({ id: guestMessages.id });
    return Boolean(deleted);
  } catch (error) {
    console.error('dbDeleteContactInquiry error:', error);
    throw new Error('Could not delete contact inquiry', { cause: error });
  }
}

export async function dbGetMailboxIntegration(provider: string) {
  try {
    const [integration] = await db.select().from(mailboxIntegrations)
      .where(eq(mailboxIntegrations.provider, provider))
      .limit(1);
    return integration || null;
  } catch (error) {
    console.error('dbGetMailboxIntegration error:', error);
    throw new Error('Could not load mailbox connection', { cause: error });
  }
}

export async function dbGetMailboxIntegrations() {
  try {
    return await db.select().from(mailboxIntegrations);
  } catch (error) {
    console.error('dbGetMailboxIntegrations error:', error);
    throw new Error('Could not load mailbox connections', { cause: error });
  }
}

export async function dbSaveMailboxIntegration(data: {
  provider: string;
  accountEmail: string;
  encryptedRefreshToken: string;
}) {
  try {
    const [integration] = await db.insert(mailboxIntegrations).values({
      ...data,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: mailboxIntegrations.provider,
      set: {
        accountEmail: data.accountEmail,
        encryptedRefreshToken: data.encryptedRefreshToken,
        updatedAt: new Date(),
      },
    }).returning();
    return integration;
  } catch (error) {
    console.error('dbSaveMailboxIntegration error:', error);
    throw new Error('Could not save mailbox connection', { cause: error });
  }
}

export async function dbDeleteMailboxIntegration(provider: string) {
  try {
    const [deleted] = await db.delete(mailboxIntegrations)
      .where(eq(mailboxIntegrations.provider, provider))
      .returning({ provider: mailboxIntegrations.provider });
    return Boolean(deleted);
  } catch (error) {
    console.error('dbDeleteMailboxIntegration error:', error);
    throw new Error('Could not disconnect mailbox', { cause: error });
  }
}

export async function dbCreateMailboxOauthState(data: {
  stateHash: string;
  provider: string;
  expiresAt: Date;
}) {
  try {
    await db.delete(mailboxOauthStates).where(lt(mailboxOauthStates.expiresAt, new Date()));
    await db.insert(mailboxOauthStates).values(data);
  } catch (error) {
    console.error('dbCreateMailboxOauthState error:', error);
    throw new Error('Could not start mailbox authorization', { cause: error });
  }
}

export async function dbConsumeMailboxOauthState(stateHash: string, provider: string) {
  try {
    const [state] = await db.delete(mailboxOauthStates)
      .where(and(
        eq(mailboxOauthStates.stateHash, stateHash),
        eq(mailboxOauthStates.provider, provider),
        gt(mailboxOauthStates.expiresAt, new Date())
      ))
      .returning({ stateHash: mailboxOauthStates.stateHash });
    return Boolean(state);
  } catch (error) {
    console.error('dbConsumeMailboxOauthState error:', error);
    throw new Error('Could not validate mailbox authorization state', { cause: error });
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

export async function dbCreateContactInquiry(data: {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}) {
  try {
    return await db.transaction(async (tx) => {
      const existingGuest = await tx
        .select({ id: guestProfiles.id })
        .from(guestProfiles)
        .where(ilike(guestProfiles.email, data.email))
        .limit(1);

      if (existingGuest.length === 0) {
        await tx.insert(guestProfiles).values({
          id: data.email,
          name: data.name,
          email: data.email,
          phone: data.phone,
          badges: '[]',
          loyaltyTier: 'bronze',
          totalVisits: 0,
          updatedAt: new Date(),
        });
      }

      const [inquiry] = await tx.insert(guestMessages).values({
        id: data.id,
        guestEmail: data.email,
        sender: 'guest',
        senderName: data.name,
        message: data.message,
        type: 'inquiry',
        isRead: false,
        createdAt: new Date(),
      }).returning();

      return inquiry;
    });
  } catch (error) {
    console.error('dbCreateContactInquiry error:', error);
    throw new Error('Błąd zapisu zapytania kontaktowego', { cause: error });
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
  metadata?: Record<string, unknown>;
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
      metadata: data.metadata || {},
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
  metadata: Record<string, unknown>;
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
    const [deleted] = await db.delete(promotions).where(eq(promotions.id, id)).returning({ id: promotions.id });
    return Boolean(deleted);
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
  paymentMethod?: string;
  addons?: string[];
  bookingComRef?: string;
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
      paymentMethod: data.paymentMethod || 'transfer',
      addons: data.addons || [],
      bookingComRef: data.bookingComRef || null,
    }).returning();
    return res[0];
  } catch (error) {
    console.error('dbCreateReservation error:', error);
    throw new Error('Błąd zapisu rezerwacji w bazie danych', { cause: error });
  }
}

export async function dbFindReservationConflict(roomId: string, checkIn: string, checkOut: string) {
  try {
    const [conflict] = await db.select().from(reservations).where(and(
      eq(reservations.roomId, roomId),
      ne(reservations.status, 'cancelled'),
      lt(reservations.checkIn, checkOut),
      gt(reservations.checkOut, checkIn)
    )).limit(1);
    return conflict || null;
  } catch (error) {
    console.error('dbFindReservationConflict error:', error);
    throw new Error('Nie udało się sprawdzić dostępności w bazie danych', { cause: error });
  }
}

export async function dbCreateReservationIfAvailable(data: Parameters<typeof dbCreateReservation>[0]) {
  try {
    return await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${data.roomId}))`);
      const [conflict] = await tx.select().from(reservations).where(and(
        eq(reservations.roomId, data.roomId),
        ne(reservations.status, 'cancelled'),
        lt(reservations.checkIn, data.checkOut),
        gt(reservations.checkOut, data.checkIn)
      )).limit(1);
      if (conflict) return { reservation: null, conflict };

      const [reservation] = await tx.insert(reservations).values({
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
        status: data.status || 'pending',
        source: data.source || 'direct',
        specialRequests: data.specialRequests || null,
        dietaryRestrictions: data.dietaryRestrictions || null,
        transportNeeded: !!data.transportNeeded,
        pfronCertificate: !!data.pfronCertificate,
        discountApplied: data.discountApplied || 0,
        promoCode: data.promoCode || null,
        includeBreakfast: !!data.includeBreakfast,
        includeDinner: !!data.includeDinner,
        paymentMethod: data.paymentMethod || 'transfer',
        addons: data.addons || [],
        bookingComRef: data.bookingComRef || null,
      }).returning();
      return { reservation, conflict: null };
    });
  } catch (error) {
    console.error('dbCreateReservationIfAvailable error:', error);
    throw new Error('Błąd zapisu rezerwacji w bazie danych', { cause: error });
  }
}

export async function dbUpdateReservationStatus(id: string, status: string) {
  try {
    const res = await db.update(reservations).set({ status }).where(eq(reservations.id, id)).returning();
    return res[0] || null;
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
  fileName?: string;
  active?: boolean;
}) {
  try {
    const res = await db.insert(aiKnowledge).values({
      id: data.id,
      title: data.title,
      category: data.category,
      content: data.content,
      fileName: data.fileName || null,
      active: data.active ?? true,
    }).onConflictDoUpdate({
      target: aiKnowledge.id,
      set: {
        title: data.title,
        category: data.category,
        content: data.content,
        fileName: data.fileName || null,
        active: data.active ?? true,
        updatedAt: new Date(),
      }
    }).returning();
    return res[0];
  } catch (error) {
    console.error('dbUpsertAiKnowledge error:', error);
    throw new Error('Błąd zapisu wiedzy AI w bazie danych', { cause: error });
  }
}

export async function dbUpdateAiKnowledge(id: string, updates: Partial<{
  title: string;
  category: string;
  content: string;
  fileName: string | null;
  active: boolean;
}>) {
  try {
    const [row] = await db.update(aiKnowledge)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiKnowledge.id, id))
      .returning();
    return row || null;
  } catch (error) {
    console.error('dbUpdateAiKnowledge error:', error);
    throw new Error('Błąd aktualizacji dokumentu wiedzy w bazie danych', { cause: error });
  }
}

export async function dbDeleteAiKnowledge(id: string) {
  try {
    const [deleted] = await db.delete(aiKnowledge).where(eq(aiKnowledge.id, id)).returning({ id: aiKnowledge.id });
    return Boolean(deleted);
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

export async function dbGetVisitorSession(id: string) {
  try {
    const [row] = await db.select().from(visitorSessions).where(eq(visitorSessions.id, id)).limit(1);
    return row || null;
  } catch (error) {
    console.error('dbGetVisitorSession error:', error);
    throw new Error('Nie udało się pobrać sesji gościa z bazy danych', { cause: error });
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

// --- CMS, SITE SETTINGS, DISCOUNTS & MEDIA ---
export async function dbGetCmsContent() {
  try {
    const [row] = await db.select().from(cmsContent).where(eq(cmsContent.id, 'site')).limit(1);
    return row?.content || null;
  } catch (error) {
    console.error('dbGetCmsContent error:', error);
    throw new Error('Nie udało się pobrać treści CMS z bazy danych', { cause: error });
  }
}

export async function dbSaveCmsContent(content: unknown) {
  try {
    const [row] = await db.insert(cmsContent).values({ id: 'site', content, updatedAt: new Date() })
      .onConflictDoUpdate({ target: cmsContent.id, set: { content, updatedAt: new Date() } })
      .returning();
    return row.content;
  } catch (error) {
    console.error('dbSaveCmsContent error:', error);
    throw new Error('Nie udało się zapisać treści CMS w bazie danych', { cause: error });
  }
}

export async function dbGetSiteSettings() {
  try {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.id, 'site')).limit(1);
    return row?.settings || null;
  } catch (error) {
    console.error('dbGetSiteSettings error:', error);
    throw new Error('Nie udało się pobrać ustawień strony z bazy danych', { cause: error });
  }
}

export async function dbSaveSiteSettings(settings: unknown) {
  try {
    const [row] = await db.insert(siteSettings).values({ id: 'site', settings, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettings.id, set: { settings, updatedAt: new Date() } })
      .returning();
    return row.settings;
  } catch (error) {
    console.error('dbSaveSiteSettings error:', error);
    throw new Error('Nie udało się zapisać ustawień strony w bazie danych', { cause: error });
  }
}

export async function dbGetDiscountCodes() {
  try {
    return await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
  } catch (error) {
    console.error('dbGetDiscountCodes error:', error);
    throw new Error('Nie udało się pobrać kodów rabatowych z bazy danych', { cause: error });
  }
}

export async function dbGetDiscountCodeById(id: string) {
  try {
    const [row] = await db.select().from(discountCodes).where(eq(discountCodes.id, id)).limit(1);
    return row || null;
  } catch (error) {
    console.error('dbGetDiscountCodeById error:', error);
    throw new Error('Nie udało się pobrać kodu rabatowego z bazy danych', { cause: error });
  }
}

export async function dbCreateDiscountCode(data: typeof discountCodes.$inferInsert) {
  try {
    const [row] = await db.insert(discountCodes).values(data).returning();
    return row;
  } catch (error) {
    console.error('dbCreateDiscountCode error:', error);
    throw new Error('Nie udało się zapisać kodu rabatowego w bazie danych', { cause: error });
  }
}

export async function dbUpdateDiscountCode(id: string, updates: Partial<typeof discountCodes.$inferInsert>) {
  try {
    const [row] = await db.update(discountCodes).set({ ...updates, updatedAt: new Date() })
      .where(eq(discountCodes.id, id)).returning();
    return row || null;
  } catch (error) {
    console.error('dbUpdateDiscountCode error:', error);
    throw new Error('Nie udało się zaktualizować kodu rabatowego w bazie danych', { cause: error });
  }
}

export async function dbDeleteDiscountCode(id: string) {
  try {
    const [row] = await db.delete(discountCodes).where(eq(discountCodes.id, id)).returning();
    return Boolean(row);
  } catch (error) {
    console.error('dbDeleteDiscountCode error:', error);
    throw new Error('Nie udało się usunąć kodu rabatowego z bazy danych', { cause: error });
  }
}

export async function dbResetDiscountCodeCounter(id: string) {
  return dbUpdateDiscountCode(id, { usedCount: 0 });
}

export async function dbRedeemDiscountCode(id: string) {
  try {
    const [row] = await db.update(discountCodes)
      .set({ usedCount: sql`${discountCodes.usedCount} + 1`, updatedAt: new Date() })
      .where(eq(discountCodes.id, id)).returning();
    return row || null;
  } catch (error) {
    console.error('dbRedeemDiscountCode error:', error);
    throw new Error('Nie udało się zarejestrować użycia kodu rabatowego', { cause: error });
  }
}

export async function dbGetMediaAssets() {
  try {
    return await db.select({
      name: mediaAssets.name,
      originalName: mediaAssets.originalName,
      contentType: mediaAssets.contentType,
      size: mediaAssets.size,
      uploaded: mediaAssets.uploaded,
      createdAt: mediaAssets.createdAt,
    }).from(mediaAssets).orderBy(asc(mediaAssets.name));
  } catch (error) {
    console.error('dbGetMediaAssets error:', error);
    throw new Error('Nie udało się pobrać biblioteki obrazów z bazy danych', { cause: error });
  }
}

export async function dbGetMediaAsset(name: string) {
  try {
    const [row] = await db.select().from(mediaAssets).where(eq(mediaAssets.name, name)).limit(1);
    return row || null;
  } catch (error) {
    console.error('dbGetMediaAsset error:', error);
    throw new Error('Nie udało się pobrać obrazu z bazy danych', { cause: error });
  }
}

export async function dbSaveMediaAsset(data: typeof mediaAssets.$inferInsert) {
  try {
    const [row] = await db.insert(mediaAssets).values(data)
      .onConflictDoNothing({ target: mediaAssets.name }).returning();
    return row || null;
  } catch (error) {
    console.error('dbSaveMediaAsset error:', error);
    throw new Error('Nie udało się zapisać obrazu w bazie danych', { cause: error });
  }
}

export async function dbDeleteMediaAsset(name: string) {
  try {
    const [row] = await db.delete(mediaAssets).where(eq(mediaAssets.name, name)).returning({ name: mediaAssets.name });
    return Boolean(row);
  } catch (error) {
    console.error('dbDeleteMediaAsset error:', error);
    throw new Error('Nie udało się usunąć obrazu z bazy danych', { cause: error });
  }
}

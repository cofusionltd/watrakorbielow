import { boolean, customType, integer, jsonb, pgTable, serial, text, timestamp, index } from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
});

// Users table (synced with Firebase Auth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('user'), // 'user' | 'admin'
  createdAt: timestamp('created_at').defaultNow(),
});

// Central Rooms table (Single Source of Truth for Rooms and Prices)
export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull().default('double'), // 'double' | 'family' | 'suite'
  basePrice: integer('base_price').notNull(),
  capacity: integer('capacity').notNull().default(2),
  size: text('size').notNull().default('20 m²'),
  bedConfig: text('bed_config').notNull().default('1 łoże małżeńskie'),
  images: text('images').notNull().default('[]'), // JSON array of string URLs
  tags: text('tags').notNull().default('[]'), // JSON array of string tags
  description: text('description').notNull(),
  active: boolean('active').notNull().default(true),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Reservations table
export const reservations = pgTable('reservations', {
  id: text('id').primaryKey(),
  userId: text('user_id'), // optional Firebase UID or guest
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  guestPhone: text('guest_phone').notNull(),
  roomId: text('room_id').notNull(),
  checkIn: text('check_in').notNull(),
  checkOut: text('check_out').notNull(),
  adults: integer('adults').notNull().default(2),
  children: integer('children').notNull().default(0),
  totalPrice: integer('total_price').notNull(),
  status: text('status').notNull().default('confirmed'), // 'confirmed' | 'cancelled' | 'pending'
  source: text('source').notNull().default('direct'), // 'direct' | 'booking.com' | 'phone'
  specialRequests: text('special_requests'),
  dietaryRestrictions: text('dietary_restrictions'),
  transportNeeded: boolean('transport_needed').notNull().default(false),
  pfronCertificate: boolean('pfron_certificate').notNull().default(false),
  discountApplied: integer('discount_applied').notNull().default(0),
  promoCode: text('promo_code'),
  includeBreakfast: boolean('include_breakfast').notNull().default(false),
  includeDinner: boolean('include_dinner').notNull().default(false),
  paymentMethod: text('payment_method').notNull().default('transfer'),
  addons: jsonb('addons').notNull().default([]),
  bookingComRef: text('booking_com_ref'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  availabilityIdx: index('idx_reservations_availability').on(table.roomId, table.checkIn, table.checkOut, table.status),
  guestEmailIdx: index('idx_reservations_guest_email').on(table.guestEmail),
}));

// Frequent Guest Profiles & Badges
export const guestProfiles = pgTable('guest_profiles', {
  id: text('id').primaryKey(), // Email or unique guest ID
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  badges: text('badges').notNull().default('[]'), // JSON array of string badges (e.g. ["VIP 👑", "Stały Bywalec 🏔️"])
  loyaltyTier: text('loyalty_tier').notNull().default('bronze'), // 'bronze' | 'silver' | 'gold' | 'vip'
  notes: text('notes'),
  totalVisits: integer('total_visits').notNull().default(1),
  totalSpend: integer('total_spend').notNull().default(0),
  lastVisit: text('last_visit'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Internal Guest Messages & Notifications
export const guestMessages = pgTable('guest_messages', {
  id: text('id').primaryKey(),
  guestEmail: text('guest_email').notNull(),
  sender: text('sender').notNull().default('admin'), // 'admin' | 'guest'
  senderName: text('sender_name').notNull().default('Recepcja Watra'),
  message: text('message').notNull(),
  type: text('type').notNull().default('chat'), // 'chat' | 'promo' | 'notification'
  promoDiscount: integer('promo_discount'),
  promoCode: text('promo_code'),
  isRead: boolean('is_read').notNull().default(false),
  isArchived: boolean('is_archived').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  emailIdx: index('idx_guest_messages_email').on(table.guestEmail),
}));

export const mailboxIntegrations = pgTable('mailbox_integrations', {
  provider: text('provider').primaryKey(),
  accountEmail: text('account_email').notNull(),
  encryptedRefreshToken: text('encrypted_refresh_token').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const mailboxOauthStates = pgTable('mailbox_oauth_states', {
  stateHash: text('state_hash').primaryKey(),
  provider: text('provider').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Real-Time AI Concierge Chat Sessions & Admin Takeover
export const chatSessions = pgTable('chat_sessions', {
  sessionId: text('session_id').primaryKey(),
  guestName: text('guest_name').notNull().default('Gość Watra'),
  guestEmail: text('guest_email'),
  language: text('language').notNull().default('pl'),
  isAiPaused: boolean('is_ai_paused').notNull().default(false), // Admin paused AI
  adminTakeover: boolean('admin_takeover').notNull().default(false), // Admin is chatting live
  lastMessage: text('last_message'),
  lastMessageAt: timestamp('last_message_at').defaultNow(),
  messagesJson: text('messages_json').notNull().default('[]'), // JSON array of messages
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Promotional campaigns table
export const promotions = pgTable('promotions', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  badge: text('badge').notNull(),
  description: text('description').notNull(),
  discountPercent: integer('discount_percent').notNull(),
  promoCode: text('promo_code').notNull(),
  active: boolean('active').notNull().default(true),
  channels: text('channels').notNull().default('["website"]'), // JSON stringified array
  startsAt: text('starts_at').notNull(),
  endsAt: text('ends_at').notNull(),
  clicksCount: integer('clicks_count').notNull().default(0),
  bookingsCount: integer('bookings_count').notNull().default(0),
  revenueGenerated: integer('revenue_generated').notNull().default(0),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at').defaultNow(),
});

export const discountCodes = pgTable('discount_codes', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  discountPercentage: integer('discount_percentage').notNull(),
  active: boolean('active').notNull().default(true),
  terminationType: text('termination_type').notNull().default('time'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').notNull().default(0),
  availableInChat: boolean('available_in_chat').notNull().default(true),
  chatTriggerNote: text('chat_trigger_note').notNull().default(''),
  minBookingNights: integer('min_booking_nights'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const cmsContent = pgTable('cms_content', {
  id: text('id').primaryKey(),
  content: jsonb('content').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const siteSettings = pgTable('site_settings', {
  id: text('id').primaryKey(),
  settings: jsonb('settings').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const mediaAssets = pgTable('media_assets', {
  name: text('name').primaryKey(),
  originalName: text('original_name').notNull(),
  contentType: text('content_type').notNull(),
  data: bytea('data').notNull(),
  size: integer('size').notNull(),
  uploaded: boolean('uploaded').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// AI Knowledge Base Documents
export const aiKnowledge = pgTable('ai_knowledge', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  fileName: text('file_name'),
  active: boolean('active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Live Visitor Analytics Sessions
export const visitorSessions = pgTable('visitor_sessions', {
  id: text('id').primaryKey(),
  ip: text('ip').notNull(),
  country: text('country').notNull(),
  countryCode: text('country_code').notNull(),
  city: text('city').notNull(),
  flag: text('flag').notNull(),
  currentPage: text('current_page').notNull(),
  pageTitle: text('page_title').notNull(),
  pageViewsJson: text('page_views_json').notNull().default('{}'),
  timeOnCurrentPage: integer('time_on_current_page').notNull().default(0),
  totalTimeSeconds: integer('total_time_seconds').notNull().default(0),
  device: text('device').notNull().default('desktop'),
  browser: text('browser').notNull().default('Chrome'),
  firstSeen: text('first_seen').notNull(),
  lastSeen: text('last_seen').notNull(),
});

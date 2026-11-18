export type Language = 'pl' | 'en' | 'sk' | 'de';

export type PageView = 
  | 'home'
  | 'about'
  | 'rooms'
  | 'seasons'
  | 'wellness'
  | 'restaurant'
  | 'packages'
  | 'contact'
  | 'admin';

export interface Room {
  id: string;
  name: string;
  category: 'double' | 'family' | 'suite';
  basePrice: number;
  capacity: number;
  size: string;
  bedConfig: string;
  images: string[];
  tags: string[];
  description: string;
  active?: boolean;
  orderIndex?: number;
}

export interface GuestProfile {
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

export interface GuestMessage {
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

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'model' | 'admin';
  content: string;
  translationPl?: string;
  translationGuest?: string;
  timestamp: string;
}

export interface LiveChatSession {
  sessionId: string;
  guestName: string;
  guestEmail?: string;
  language: 'pl' | 'en' | 'de' | 'sk';
  isAiPaused: boolean;
  adminTakeover: boolean;
  lastMessage: string;
  lastMessageAt: string;
  messages: ChatMessageItem[];
}

export interface AmenityItem {
  id: string;
  iconName: string;
  title: string;
  subtitle: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  origin: string;
  date: string;
  rating: number;
  title: string;
  comment: string;
  badge: string;
}

export interface PackageOffer {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  features: string[];
  image: string;
  badge?: string;
}

export interface PromotionalCampaign {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  discountPercentage: number;
  price: string;
  promoCode: string;
  startDate: string;
  endDate: string;
  category: 'winter' | 'summer' | 'wellness' | 'all';
  imageUrl: string;
  active: boolean;
  publishedAt: string;
  description: string;
  perks: string[];
}

export type DiscountTerminationType = 'time' | 'usage_limit' | 'both' | 'none';

export interface DiscountCode {
  id: string;
  code: string;               // e.g. "ZIMA2026", "BESKID20"
  title: string;              // e.g. "Specjalny Rabat Zimowy"
  description?: string;       // Terms / info
  discountPercentage: number; // e.g. 15 for 15%
  active: boolean;            // whether code is enabled
  terminationType: DiscountTerminationType;
  startDate?: string;         // YYYY-MM-DD
  endDate?: string;           // YYYY-MM-DD
  usageLimit?: number | null; // max number of times code can be redeemed
  usedCount: number;          // number of times code has been redeemed
  availableInChat: boolean;   // if true, Concierge AI is authorized to give this code to guests
  chatTriggerNote?: string;   // context/hint for AI assistant
  minBookingNights?: number;  // optional min nights
  createdAt: string;
  updatedAt?: string;
}

export interface DiscountValidationResult {
  valid: boolean;
  code?: string;
  discountPercentage?: number;
  title?: string;
  message: string;
  remainingUses?: number | null;
  terminationType?: DiscountTerminationType;
  endDate?: string;
}

export interface BookingSearchQuery {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomType: string;
  promoCode?: string;
}

export interface DailyForecastDay {
  date: string;
  dayName: string;
  weatherCode: number;
  conditions: string;
  tempMax: string;
  tempMin: string;
  precipProbability: number;
  windSpeed: string;
  summitTempEst: string;
}

export interface WeatherData {
  location: string;
  updatedAt: string;
  baseValleyTemp: string;
  summitTemp: string;
  conditions: string;
  weatherCode: number;
  wind: string;
  humidity?: string;
  trailConditions: string;
  dailyForecast: DailyForecastDay[];
  skiLiftsStatus: {
    pilskoMain: string;
    cypisekBeginner: string;
    andiamoBeginner: string;
  };
}

export interface TripStep {
  instruction: string;
  distance: string;
  duration: string;
}

export interface TripDetails {
  originName: string;
  originFullName?: string;
  originCoords: [number, number]; // [lat, lon]
  destinationName: string;
  destinationCoords: [number, number]; // [lat, lon]
  distanceKm: number;
  durationMinutes: number;
  durationText: string;
  geometry: [number, number][]; // array of [lat, lon]
  steps: TripStep[];
  isApproximate?: boolean;
  approximateNote?: string;
  verifiedAddress?: string;
}

export interface AddressSuggestion {
  label: string;
  secondaryText: string;
  fullAddress: string;
  lat: number;
  lon: number;
  type?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  translation?: string;
}

export interface AiKnowledgeDoc {
  id: string;
  title: string;
  category: 'hotel' | 'slopes' | 'restaurant' | 'spa' | 'area' | 'other';
  content: string;
  fileName?: string;
  fileSize?: string;
  createdAt: string;
  active: boolean;
}

export interface ReservationRecord {
  id: string;
  createdAt: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalAmount: number;
  paymentMethod: string;
  specialRequests?: string;
  addons?: string[];
  includeBreakfast?: boolean;
  includeDinner?: boolean;
  status: 'Oczekuje na zaliczkę' | 'Potwierdzona' | 'Anulowana';
  source: 'website' | 'booking_com';
  bookingComRef?: string;
}

export interface AvailabilityCheckResult {
  available: boolean;
  conflict?: {
    source: 'website' | 'booking_com';
    checkIn: string;
    checkOut: string;
    description: string;
  } | null;
  message: string;
  syncedWithBookingCom: boolean;
}

export interface BlockedDateRange {
  checkIn: string;
  checkOut: string;
  source: 'website' | 'booking_com';
  guestName?: string;
  id?: string;
}

export interface BookingComSyncStatus {
  lastSync: string;
  status: 'active' | 'syncing' | 'error';
  autoSyncIntervalMinutes: number;
  totalBlockedRanges: number;
  syncedRooms: {
    roomId: string;
    roomName: string;
    icalExportUrl: string;
    icalImportUrl?: string;
    activeBookingsCount: number;
    blockedDates: BlockedDateRange[];
  }[];
}

export interface PageVisitStats {
  page: string;
  title: string;
  views: number;
  totalTimeSpentSeconds: number;
  avgTimeSpentSeconds: number;
}

export interface VisitorLocationStats {
  country: string;
  countryCode: string;
  city: string;
  count: number;
  percentage: number;
  flag: string;
}

export interface VisitorSessionRecord {
  id: string;
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  flag: string;
  currentPage: string;
  timeOnCurrentPage: number;
  totalTimeSeconds: number;
  device: string;
  browser: string;
  lastSeen: string;
  firstSeen: string;
  isOnline: boolean;
}

export interface RealtimeAnalyticsData {
  activeVisitorsNow: number;
  totalPageViews: number;
  avgSessionDurationSeconds: number;
  topPages: PageVisitStats[];
  topLocations: VisitorLocationStats[];
  recentVisitors: VisitorSessionRecord[];
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'zupy' | 'glowne' | 'przekaski' | 'regionalne' | 'desery' | 'napoje';
  price: number;
  description: string;
  badge?: string;
  isRegional?: boolean;
}

export interface DistanceItem {
  name: string;
  dist: string;
}

export interface FeatureHighlight {
  title: string;
  desc: string;
  iconName?: string;
}

export interface TreatmentItem {
  id: string;
  name: string;
  desc: string;
  duration: string;
  price?: string;
}

export interface SiteCmsContent {
  translationOverrides: Partial<Record<Language, Record<string, string>>>;
  imageOverrides: Record<string, string>;
  resort: {
    name: string;
    tagline: string;
    description: string;
    address: string;
    postalCity: string;
    region: string;
    phone: string;
    phoneFormatted: string;
    email: string;
    bookingEmail: string;
    receptionHours: string;
    checkInTime: string;
    checkOutTime: string;
    bankAccount: string;
    directDiscountPercent: number;
    announcementBanner: string;
    showAnnouncement: boolean;
  };
  hero: {
    eyebrow: string;
    title: string;
    highlightWord: string;
    subtitle: string;
    badgeText: string;
    posterImage: string;
    videoUrl: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
  };
  about: {
    badge: string;
    title: string;
    lead: string;
    storyParagraph1: string;
    storyParagraph2: string;
    storyParagraph3: string;
    distances: DistanceItem[];
    images: string[];
    features: FeatureHighlight[];
  };
  restaurant: {
    badge: string;
    title: string;
    subtitle: string;
    openingHours: string;
    breakfastHours: string;
    dinnerHours: string;
    fireplaceShelterInfo: string;
    heroImage: string;
    galleryImages: string[];
    menuItems: MenuItem[];
  };
  wellness: {
    badge: string;
    title: string;
    subtitle: string;
    jacuzziTitle: string;
    jacuzziDescription: string;
    jacuzziTemp: string;
    jacuzziHours: string;
    saunaTitle: string;
    saunaDescription: string;
    saunaTemp: string;
    vipReservationNote: string;
    pricingNote: string;
    heroImage: string;
    galleryImages: string[];
  };
  rehabilitation: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    pfronInfo: string;
    treatments: TreatmentItem[];
    heroImage: string;
  };
  contact: {
    directionsInfo: string;
    parkingInfo: string;
    gpsCoordinates: string;
    publicTransportInfo: string;
  };
  footer: {
    aboutSnippet: string;
    copyrightText: string;
  };
}

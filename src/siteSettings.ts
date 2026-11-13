import { PageView } from './types';

export type PublicPageKey = Exclude<PageView, 'admin'>;

export interface SiteSettings {
  pages: Record<PublicPageKey, boolean>;
  features: {
    reservations: boolean;
    promotions: boolean;
  };
  components: {
    header: boolean;
    announcementBar: boolean;
    homeHero: boolean;
    seasonalToggle: boolean;
    weatherTicker: boolean;
    bookingSearchBar: boolean;
    availabilityCalendar: boolean;
    promotionBanner: boolean;
    amenitiesStrip: boolean;
    homeAbout: boolean;
    featuredRooms: boolean;
    homeWellness: boolean;
    homeRestaurant: boolean;
    socialProof: boolean;
    aiConcierge: boolean;
    mobileActionBar: boolean;
    footer: boolean;
  };
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  pages: {
    home: true,
    about: true,
    rooms: true,
    seasons: true,
    wellness: true,
    restaurant: true,
    packages: true,
    contact: true,
  },
  features: {
    reservations: true,
    promotions: true,
  },
  components: {
    header: true,
    announcementBar: true,
    homeHero: true,
    seasonalToggle: true,
    weatherTicker: true,
    bookingSearchBar: true,
    availabilityCalendar: true,
    promotionBanner: true,
    amenitiesStrip: true,
    homeAbout: true,
    featuredRooms: true,
    homeWellness: true,
    homeRestaurant: true,
    socialProof: true,
    aiConcierge: true,
    mobileActionBar: true,
    footer: true,
  },
};

export const SITE_PAGE_LABELS: Record<PublicPageKey, string> = {
  home: 'Strona główna',
  about: 'O nas',
  rooms: 'Pokoje i cennik',
  seasons: 'Zima i lato',
  wellness: 'Wellness',
  restaurant: 'Restauracja',
  packages: 'Pakiety',
  contact: 'Kontakt',
};

export const SITE_FEATURE_LABELS: Record<keyof SiteSettings['features'], string> = {
  reservations: 'Rezerwacje i przyciski rezerwacji',
  promotions: 'Promocje i kody promocyjne',
};

export const SITE_COMPONENT_LABELS: Record<keyof SiteSettings['components'], string> = {
  header: 'Nagłówek i nawigacja',
  announcementBar: 'Pasek informacyjny',
  homeHero: 'Sekcja główna (Hero)',
  seasonalToggle: 'Przełącznik widoku zima/lato',
  weatherTicker: 'Pogoda i prognoza górska',
  bookingSearchBar: 'Pasek wyszukiwania rezerwacji',
  availabilityCalendar: 'Kalendarz dostępności',
  promotionBanner: 'Baner promocji i przyciski udostępniania',
  amenitiesStrip: 'Pasek udogodnień',
  homeAbout: 'Sekcja „O nas” na stronie głównej',
  featuredRooms: 'Polecane pokoje na stronie głównej',
  homeWellness: 'Sekcja wellness na stronie głównej',
  homeRestaurant: 'Sekcja restauracji na stronie głównej',
  socialProof: 'Opinie i oceny gości',
  aiConcierge: 'AI Concierge',
  mobileActionBar: 'Dolny pasek akcji na telefonach',
  footer: 'Stopka',
};

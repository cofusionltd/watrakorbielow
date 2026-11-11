import { Room, ReviewItem, PackageOffer } from '../types';

export const RESORT_ROOMS: Room[] = [
  {
    id: "room-2-standard",
    name: "Pokój 2-osobowy Standard",
    category: "double",
    basePrice: 160,
    capacity: 2,
    size: "18 m²",
    bedConfig: "1 łóżko małżeńskie lub 2 pojedyncze",
    images: [
      "/images/image-22.jpg",
      "/images/image-23.jpg",
      "/images/image-26.jpg",
      "/images/18.jpg"
    ],
    tags: ["Śniadanie w cenie", "Prywatna łazienka", "TV LED", "Wi-Fi", "Widok na las"],
    description: "Przytulny, klasyczny pokój wykończony w ciepłym drewnie. Idealny na pobyty we dwoje lub wyjazdy narciarskie ze znajomymi."
  },
  {
    id: "room-2-comfort",
    name: "Pokój 2-osobowy Comfort z Balkonem",
    category: "double",
    basePrice: 195,
    capacity: 2,
    size: "22 m²",
    bedConfig: "1 łoże małżeńskie King-Size",
    images: [
      "/images/image-23.jpg",
      "/images/image-25.jpg",
      "/images/10.jpg",
      "/images/image-22.jpg"
    ],
    tags: ["Śniadanie w cenie", "Balkon z widokiem", "Prywatna łazienka", "Zestaw kawowy", "TV 43\""],
    description: "Przestronny pokój z prywatnym balkonem wychodzącym na zalesione zbocza Pilska. Wyposażony w wygodne łoże małżeńskie i strefę wypoczynkową."
  },
  {
    id: "room-family-3-4",
    name: "Pokój Rodzinny 3-4 osobowy (Studio)",
    category: "family",
    basePrice: 280,
    capacity: 4,
    size: "32 m²",
    bedConfig: "1 łóżko podwójne + 2 łóżka pojedyncze",
    images: [
      "/images/image-24.jpg",
      "/images/24_small.jpg",
      "/images/14.jpg",
      "/images/image-22.jpg"
    ],
    tags: ["Śniadanie w cenie", "Dla rodzin z dziećmi", "Prywatna łazienka", "Lodówka", "Stolik jadalniany"],
    description: "Idealny wybór dla rodzin. Osobne strefy do spania, dużo miejsca na bagaż i sprzęt narciarski oraz stół rodzinny do wspólnego spędzania czasu."
  },
  {
    id: "room-suite-deluxe",
    name: "Apartament Górski z Tarasem & Salonem",
    category: "suite",
    basePrice: 390,
    capacity: 5,
    size: "46 m²",
    bedConfig: "Główna sypialnia z łożem małżeńskim + rozkładana sofa w salonie",
    images: [
      "/images/image-25.jpg",
      "/images/image-24.jpg",
      "/images/25.jpg",
      "/images/image-23.jpg"
    ],
    tags: ["Śniadanie w cenie", "Prywatny taras", "Salon wypoczynkowy", "Szlafroki SPA", "Ekspres do kawy"],
    description: "Najbardziej luksusowy apartament w obiekcie. Składa się z oddzielnej sypialni, eleganckiego salonu z kącikiem kawowym oraz tarasu z widokiem na panoramę gór."
  }
];

export const RESORT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Michał i Anna z dziećmi",
    origin: "Kraków, Polska",
    date: "Luty 2026",
    rating: 5,
    title: "Najlepszy wyjazd narciarski w Beskidy!",
    comment: "Lokalizacja rewelacyjna – z dziećmi w butach narciarskich dosłownie 2 minuty do wyciągu Cypisek! Pokoje czyste i ciepłe, a po nartach zewnętrzne jacuzzi pod gwiazdami to absolutny hit. Jedzenie w restauracji domowe, porcje ogromne!",
    badge: "Zweryfikowany pobyt rodzinny"
  },
  {
    id: "rev-2",
    author: "Tomasz G.",
    origin: "Katowice, Polska",
    date: "Styczeń 2026",
    rating: 5,
    title: "Rewelacyjny stosunek jakości do ceny",
    comment: "Byliśmy paczką 8 osób na skiturach na Pilsko. Bardzo pomocna obsługa, ogrzewana narciarnia, pyszna kwaśnica i swojskie śniadania. Rezerwacja przez stronę z 10% rabatem poszła bez problemu.",
    badge: "Grupa narciarska"
  },
  {
    id: "rev-3",
    author: "Katarzyna & Piotr",
    origin: "Warszawa, Polska",
    date: "Wrzesień 2025",
    rating: 5,
    title: "Cisza, spokój i wspaniała natura",
    comment: "Przyjechaliśmy na weekend zresetować się od miasta. Szlaki zaczynają się tuż za hotelem, widok na góry z balkonu zachwycający. Jacuzzi na zewnątrz po 20 km trekkingu to zbawienie. Na pewno wrócimy zimą!",
    badge: "Pobyt we dwoje"
  },
  {
    id: "rev-4",
    author: "Stanislav K.",
    origin: "Žilina, Slovensko",
    date: "Júl 2025",
    rating: 5,
    title: "Skvelý pobyt blízko hraníc",
    comment: "Krásne prostredie len pár kilometrov od Oravy. Výborné jedlo, čisté izby a veľmi milý personál. Pre rodiny s deťmi ideálne miesto v lete aj v zime.",
    badge: "Overená recenzia"
  }
];

export const PACKAGE_OFFERS: PackageOffer[] = [
  {
    id: "pkg-winter-ski",
    title: "Białe Szaleństwo w Korbielowie",
    subtitle: "7-dniowy pakiet feryjny dla narciarzy i rodzin",
    price: "od 1 190 zł / os.",
    duration: "7 dni (6 nocy)",
    badge: "Zima 2026",
    image: "/images/banner-1.jpg",
    features: [
      "Noclegi w komfortowych pokojach z widokiem na las",
      "Śniadania w formie obfitego bufetu szwedzkiego",
      "Dwudaniowe obiadokolacje z regionalnym deserem",
      "Codzienny dostęp do zewnętrznego jacuzzi i sauny",
      "100 m do wyciągów narciarskich Cypisek & Andiamo",
      "Ogrzewana szafka na narty i buty narciarskie"
    ]
  },
  {
    id: "pkg-wellness-relax",
    title: "Górski Relaks & Wellness",
    subtitle: "Kompleksowa regeneracja sił w beskidzkiej naturze z jacuzzi i sauną",
    price: "od 680 zł / os.",
    duration: "5 dni (4 noce)",
    badge: "Odnowa & Relaks",
    image: "/images/image-63.jpg",
    features: [
      "Nielimitowany dostęp do zewnętrznego jacuzzi i sauny fińskiej",
      "Codzienne bogate śniadania w formie bufetu",
      "Tradycyjne obiadokolacje w restauracji regionalnej",
      "Dostęp do sali rekreacyjnej ze stołem bilardowym i tenisem stołowym",
      "Zniżka na wypożyczalnię sprzętu sportowego",
      "Bezpłatny parking i szybkie Wi-Fi"
    ]
  },
  {
    id: "pkg-romantic-couple",
    title: "Romantyczny Weekend we Dwoje",
    subtitle: "Relaks w jacuzzi pod gwiazdami & kolacja przy świecach",
    price: "od 590 zł / para",
    duration: "3 dni (2 noce)",
    badge: "Bestseller",
    image: "/images/jacuzi.jpg",
    features: [
      "Pobyt w Pokoju Comfort z balkonem widokowym",
      "Butelka regionalnego wina i słodki poczęstunek w pokoju",
      "Prywatny wieczorny seans w jacuzzi zewnętrznym pod gwiazdami",
      "Romantyczna 3-daniowa kolacja z lampką wina",
      "Bogate śniadania przynoszone do pokoju na życzenie",
      "Przedłużona doba hotelowa w niedzielę do 14:00"
    ]
  },
  {
    id: "pkg-summer-active",
    title: "Aktywne Lato & Trekking na Pilsko",
    subtitle: "Górskie wędrówki, rowery i biesiady przy ognisku",
    price: "od 890 zł / os.",
    duration: "5 dni (4 noce)",
    badge: "Lato 2026",
    image: "/images/about.jpg",
    features: [
      "Pobyt ze śniadaniami i obiadokolacjami w restauracji",
      "Pakiety lunchowe na szlak (suchy prowiant)",
      "Mapy szlaków turystycznych i wypożyczenie kijków trekkingowych",
      "Wieczorna biesiada w wiacie grillowej z regionalną kapelą",
      "Dostęp do jacuzzi zewnętrznego i strefy leżaków w ogrodzie",
      "Bezpłatny monitorowany parking i myjka rowerowa"
    ]
  }
];

export const RESORT_STATS = [
  { value: "100 m", label: "Do wyciągów narciarskich", desc: "Cypisek i Andiamo tuż obok" },
  { value: "120", label: "Miejsc noclegowych", desc: "Pokoje, studia i apartamenty" },
  { value: "1557 m", label: "Szczyt Pilsko", desc: "Drugi najwyższy szczyt Beskidów" },
  { value: "4.6 ★", label: "Ocena Gości w Google", desc: "Ponad 420 zweryfikowanych opinii" }
];

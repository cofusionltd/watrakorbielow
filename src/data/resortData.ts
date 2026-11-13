import { Language, Room, ReviewItem, PackageOffer } from '../types';

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

const ROOM_TRANSLATIONS: Record<string, Record<string, Partial<Room>>> = {
  "room-2-standard": {
    en: {
      name: "Standard Double Room",
      bedConfig: "1 double bed or 2 single beds",
      tags: ["Breakfast included", "Private bathroom", "LED TV", "Free Wi-Fi", "Forest view"],
      description: "Cozy, classic room finished in warm wood. Ideal for couples or ski trips with friends."
    },
    sk: {
      name: "Štandardná 2-lôžková izba",
      bedConfig: "1 manželská posteľ alebo 2 oddelené lôžka",
      tags: ["Raňajky v cene", "Súkromná kúpeľňa", "LED TV", "Wi-Fi zdarma", "Výhľad na les"],
      description: "Útulná, klasická izba zariadená v teplom dreve. Ideálna na pobyty vo dvojici alebo lyžiarske výlety s priateľmi."
    },
    de: {
      name: "Standard Doppelzimmer",
      bedConfig: "1 Doppelbett oder 2 Einzelbetten",
      tags: ["Frühstück inklusive", "Eigenes Bad", "LED-TV", "Kostenloses WLAN", "Waldblick"],
      description: "Gemütliches, klassisches Zimmer mit warmen Holzelementen. Ideal für Paare oder Skiausflüge mit Freunden."
    }
  },
  "room-2-comfort": {
    en: {
      name: "Comfort Double Room with Balcony",
      bedConfig: "1 King-Size double bed",
      tags: ["Breakfast included", "Scenic balcony", "Private bathroom", "Coffee & tea maker", "43\" TV"],
      description: "Spacious room with a private balcony overlooking the wooded slopes of Mount Pilsko. Equipped with a comfortable King-size bed and seating area."
    },
    sk: {
      name: "Komfortná 2-lôžková izba s balkónom",
      bedConfig: "1 manželská posteľ King-Size",
      tags: ["Raňajky v cene", "Balkón s výhľadom", "Súkromná kúpeľňa", "Kávový set", "43\" TV"],
      description: "Priestranná izba so súkromným balkónom s výhľadom na zalesnené svahy Pilska. Vybavená pohodlnou manželskou posteľou a posedením."
    },
    de: {
      name: "Komfort-Doppelzimmer mit Balkon",
      bedConfig: "1 King-Size Doppelbett",
      tags: ["Frühstück inklusive", "Balkon mit Aussicht", "Eigenes Bad", "Kaffee- & Teeset", "43\" TV"],
      description: "Geräumiges Zimmer mit privatem Balkon und Blick auf die bewaldeten Hänge des Pilsko. Ausgestattet mit komfortablem King-Size-Bett und Sitzecke."
    }
  },
  "room-family-3-4": {
    en: {
      name: "Family Studio 3-4 Persons",
      bedConfig: "1 double bed + 2 single beds",
      tags: ["Breakfast included", "Family-friendly", "Private bathroom", "Refrigerator", "Dining table"],
      description: "Ideal choice for families. Separate sleeping zones, ample luggage and ski equipment space, and a dining table to spend quality time together."
    },
    sk: {
      name: "Rodinné štúdio pre 3-4 osoby",
      bedConfig: "1 manželská posteľ + 2 samostatné lôžka",
      tags: ["Raňajky v cene", "Pre rodiny s deťmi", "Súkromná kúpeľňa", "Chladnička", "Jedálenský stôl"],
      description: "Ideálna voľba pre rodiny. Samostatné zóny na spanie, dostatok miesta na batožinu a lyžiarsku výstroj a rodinný stôl na spoločné chvíle."
    },
    de: {
      name: "Familienstudio für 3-4 Personen",
      bedConfig: "1 Doppelbett + 2 Einzelbetten",
      tags: ["Frühstück inklusive", "Ideal für Familien", "Eigenes Bad", "Kühlschrank", "Esstisch"],
      description: "Ideale Wahl für Familien. Getrennte Schlafbereiche, viel Platz für Gepäck und Skiausrüstung sowie ein Esstisch für gemeinsame Stunden."
    }
  },
  "room-suite-deluxe": {
    en: {
      name: "Mountain Suite with Terrace & Living Room",
      bedConfig: "Master bedroom with double bed + sofa bed in living room",
      tags: ["Breakfast included", "Private terrace", "Living room", "SPA bathrobes", "Espresso machine"],
      description: "The most luxurious suite in the resort. Consists of a separate bedroom, elegant living room with coffee nook, and panoramic mountain-view terrace."
    },
    sk: {
      name: "Horský apartmán s terasou a obývacou izbou",
      bedConfig: "Hlavná spálňa s manželskou posteľou + rozkladacia pohovka v obývačke",
      tags: ["Raňajky v cene", "Súkromná terasa", "Obývacia izba", "SPA župany", "Kávovar"],
      description: "Najluxusnejší apartmán v rezorte. Pozostáva zo samostatnej spálne, elegantnej obývačky s kávovým kútikom a terasy s panoramatickým výhľadom na hory."
    },
    de: {
      name: "Bergsuite mit Terrasse & Wohnzimmer",
      bedConfig: "Hauptschlafzimmer mit Doppelbett + Schlafsofa im Wohnzimmer",
      tags: ["Frühstück inklusive", "Private Terrasse", "Wohnzimmer", "SPA-Bademäntel", "Espressomaschine"],
      description: "Die luxuriöseste Suite des Resorts. Besteht aus separatem Schlafzimmer, elegantem Wohnbereich mit Kaffeeecke und Terrasse mit Bergblick."
    }
  }
};

export function getLocalizedRooms(lang: string, roomList: Room[] = RESORT_ROOMS): Room[] {
  if (lang === "pl") return roomList;

  return roomList.map((room) => {
    const translation = ROOM_TRANSLATIONS[room.id]?.[lang];
    if (!translation) return room;

    return {
      ...room,
      name: translation.name || room.name,
      bedConfig: translation.bedConfig || room.bedConfig,
      tags: translation.tags || room.tags,
      description: translation.description || room.description
    };
  });
}

const PACKAGE_TRANSLATIONS: Record<string, Record<string, Partial<PackageOffer>>> = {
  "pkg-winter-ski": {
    en: {
      title: "Winter Ski Adventure in Korbielów",
      subtitle: "7-day holiday package for skiers & families",
      price: "from 1 190 PLN / pers.",
      duration: "7 days (6 nights)",
      badge: "Winter 2026",
      features: [
        "Accommodation in comfortable rooms with forest view",
        "Rich buffet breakfasts every morning",
        "Two-course regional dinners with mountain dessert",
        "Daily access to outdoor jacuzzi and Finnish sauna",
        "100 m to Cypisek & Andiamo ski lifts",
        "Heated ski locker with boot dryers"
      ]
    },
    sk: {
      title: "Biele Šialenstvo v Korbielove",
      subtitle: "7-dňový prázdninový balíček pre lyžiarov a rodiny",
      price: "od 1 190 PLN / os.",
      duration: "7 dní (6 nocí)",
      badge: "Zima 2026",
      features: [
        "Ubytovanie v komfortných izbách s výhľadom na les",
        "Bohaté raňajky formou švédskych stolov",
        "Dvojchodové večere s regionálnym dezertom",
        "Každodenný vstup do vonkajšej vírivky a sauny",
        "100 m k lyžiarskym vlekom Cypisek & Andiamo",
        "Vyhrievaná lyžiareň so sušičmi na lyžiarky"
      ]
    },
    de: {
      title: "Winter-Skispaß in Korbielów",
      subtitle: "7-tägiges Urlaubspaket für Skifahrer & Familien",
      price: "ab 1 190 PLN / Pers.",
      duration: "7 Tage (6 Nächte)",
      badge: "Winter 2026",
      features: [
        "Unterkunft in komfortablen Zimmern mit Waldblick",
        "Reichhaltiges Frühstücksbuffet am Morgen",
        "Zweifaches Regional-Abendessen mit Bergbauern-Dessert",
        "Täglicher Zugang zum Außenwhirlpool und finnischer Sauna",
        "100 m zu den Skiliften Cypisek & Andiamo",
        "Beheizter Skiraum mit Schuhtrocknern"
      ]
    }
  },
  "pkg-wellness-relax": {
    en: {
      title: "Mountain Wellness & Relaxation",
      subtitle: "Complete rejuvenation in Beskid nature with outdoor jacuzzi & sauna",
      price: "from 680 PLN / pers.",
      duration: "5 days (4 nights)",
      badge: "Spa & Wellness",
      features: [
        "Unlimited access to outdoor hot tub and Finnish sauna",
        "Daily rich buffet breakfasts",
        "Traditional dinners in the regional restaurant",
        "Access to games room with billiard and table tennis",
        "Discount on sports equipment rental",
        "Free parking and high-speed Wi-Fi"
      ]
    },
    sk: {
      title: "Horský Relax & Wellness",
      subtitle: "Komplexná regenerácia síl v beskydskej prírode s vírivkou a saunou",
      price: "od 680 PLN / os.",
      duration: "5 dní (4 noci)",
      badge: "Oddych & Regenerácia",
      features: [
        "Neobmedzený vstup do vonkajšej vírivky a fínskej sauny",
        "Každodenné bohaté bufetové raňajky",
        "Tradičné večere v štýlovej kolibe",
        "Vstup do herne s biliardom a stolným tenisom",
        "Zľava na požičovňu športového vybavenia",
        "Bezplatné parkovanie a rýchla Wi-Fi"
      ]
    },
    de: {
      title: "Berg-Wellness & Entspannung",
      subtitle: "Ganzheitliche Erholung in der Beskiden-Natur mit Whirlpool & Sauna",
      price: "ab 680 PLN / Pers.",
      duration: "5 Tage (4 Nächte)",
      badge: "Erholung & Wellness",
      features: [
        "Unbegrenzter Zugang zum Außenwhirlpool und finnischer Sauna",
        "Tägliches reichhaltiges Frühstücksbuffet",
        "Traditionelles Abendessen im Regionalrestaurant",
        "Zugang zum Freizeitraum mit Billardtisch und Tischtennis",
        "Rabatt auf Sportgeräteverleih",
        "Kostenloser Parkplatz und schnelles WLAN"
      ]
    }
  },
  "pkg-romantic-couple": {
    en: {
      title: "Romantic Weekend for Two",
      subtitle: "Starlit outdoor jacuzzi & candlelit dinner",
      price: "from 590 PLN / couple",
      duration: "3 days (2 nights)",
      badge: "Bestseller",
      features: [
        "Stay in Comfort Room with panoramic balcony",
        "Bottle of regional wine and sweet welcome treat in room",
        "Private evening session in outdoor jacuzzi under stars",
        "Romantic 3-course dinner with a glass of wine",
        "Breakfast delivered to room upon request",
        "Extended Sunday checkout until 14:00"
      ]
    },
    sk: {
      title: "Romantický Víkend vo Dvojici",
      subtitle: "Relax vo vírivke pod hviezdami & večera pri sviečkach",
      price: "od 590 PLN / pár",
      duration: "3 dni (2 noci)",
      badge: "Bestseller",
      features: [
        "Pobyt v izbe Comfort s vyhliadkovým balkónom",
        "Fľaša regionálneho vína a sladké prekvapenie na izbe",
        "Súkromný večerný kúpeľ vo vonkajšej vírivke pod hviezdami",
        "Romantická 3-chodová večera s pohárom vína",
        "Bohaté raňajky prinesené na izbu na želanie",
        "Predĺžený odchod v nedeľu až do 14:00"
      ]
    },
    de: {
      title: "Romantisches Wochenende zu zweit",
      subtitle: "Entspannung im Whirlpool unter Sternen & Candle-Light-Dinner",
      price: "ab 590 PLN / Paar",
      duration: "3 Tage (2 Nächte)",
      badge: "Bestseller",
      features: [
        "Aufenthalt im Comfort-Zimmer mit Aussichtsbalkon",
        "Flasche Regionalwein und süße Überraschung im Zimmer",
        "Private Abendsession im Außen-Whirlpool unter den Sternen",
        "Romantisches 3-Gänge-Dinner mit einem Glas Wein",
        "Frühstück ans Bett auf Wunsch serviert",
        "Verlängerter Check-out am Sonntag bis 14:00 Uhr"
      ]
    }
  },
  "pkg-summer-active": {
    en: {
      title: "Active Summer & Trekking to Pilsko",
      subtitle: "Mountain hiking, gravel biking & campfire feasts",
      price: "from 890 PLN / pers.",
      duration: "5 days (4 nights)",
      badge: "Summer 2026",
      features: [
        "Stay with breakfast and half-board dinner in restaurant",
        "Packed trail lunches (lunchboxes for the summit)",
        "Hiking trail maps and trekking poles rental",
        "Evening barbecue feast in wooden shelter with folk band",
        "Access to outdoor jacuzzi and sun loungers in garden",
        "Free monitored parking and bike wash station"
      ]
    },
    sk: {
      title: "Aktívne Leto & Trekking na Pilsko",
      subtitle: "Horská turistika, bicykle a posedenia pri ohni",
      price: "od 890 PLN / os.",
      duration: "5 dní (4 noci)",
      badge: "Leto 2026",
      features: [
        "Pobyt s raňajkami a večerami v reštaurácii",
        "Balíčky s občerstvením na túru (suchý proviant)",
        "Mapy turistických trás a zapožičanie trekingových palíc",
        "Večerná biesiada v grile s regionálnou kapelou",
        "Vstup do vonkajšej vírivky a ležadiel v záhrade",
        "Bezplatné monitorované parkovisko a umývačka bicyklov"
      ]
    },
    de: {
      title: "Aktiver Sommer & Pilsko-Trekking",
      subtitle: "Bergwanderungen, Radtouren & Grillabende am Lagerfeuer",
      price: "ab 890 PLN / Pers.",
      duration: "5 Tage (4 Nächte)",
      badge: "Sommer 2026",
      features: [
        "Aufenthalt inklusive Frühstück und Abendessen im Restaurant",
        "Lunchpakete für Bergwanderungen",
        "Wanderkarten und Verleih von Trekkingstöcken",
        "Abendlicher Hüttenabend im Grillpavillon mit Volksmusik",
        "Nutzung des Außen-Whirlpools und Liegebereichs im Garten",
        "Kostenloser überwachter Parkplatz und Fahrradwaschstation"
      ]
    }
  }
};

export function getLocalizedPackages(lang: Language, packageList: PackageOffer[] = PACKAGE_OFFERS): PackageOffer[] {
  if (lang === "pl") return packageList;

  return packageList.map((pkg) => {
    const translation = PACKAGE_TRANSLATIONS[pkg.id]?.[lang];
    if (!translation) return pkg;

    return {
      ...pkg,
      title: translation.title || pkg.title,
      subtitle: translation.subtitle || pkg.subtitle,
      price: translation.price || pkg.price,
      duration: translation.duration || pkg.duration,
      badge: translation.badge || pkg.badge,
      features: translation.features || pkg.features
    };
  });
}

import { Language } from './types';

export interface PageTranslations {
  common: {
    home: string;
    perNight: string;
    perNightBreakfast: string;
    bookNow: string;
    close: string;
    loading: string;
    copied: string;
    copy: string;
    photosCount: (count: number) => string;
    upToPersons: (capacity: number) => string;
    allRooms: string;
    directDiscountBadge: string;
    whyBookDirectTitle: string;
    whyBookDirectDesc: string;
    checkDates: string;
    selectThisRoom: string;
    seeGallery: string;
    openInGoogleMaps: string;
    navigateUs: string;
    picturesqueDesc: string;
    live: string;
    bookStayDiscount: string;
    adultsLabel: string;
    adultsAge: string;
    childrenLabel: string;
    childrenAge: string;
    apply: string;
    calendarPreview: string;
    freeCancelNote: string;
  };
  packagesPage: {
    tag: string;
    title: string;
    subtitle: string;
    liveCampaignsTitle: string;
    validityPrefix: string;
    promoCodeLabel: string;
    bookWithDiscount: string;
    standardPackagesTitle: string;
    priceFrom: string;
    selectPackage: string;
  };
  contactPage: {
    tag: string;
    title: string;
    subtitle: string;
    phoneTitle: string;
    phoneHours: string;
    phoneSubtitle: string;
    emailTitle: string;
    emailDesc: string;
    emailSubtitle: string;
    locationTitle: string;
    locationRegion: string;
    locationSubtitle: string;
    address: string;
    formTitle: string;
    formSubtitle: string;
    formSuccessTitle: string;
    formSuccessDesc: string;
    formSendAnother: string;
    submitError: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    datesLabel: string;
    datesPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sending: string;
    submitBtn: string;
    depositTitle: string;
    depositSubtitle: string;
    recipientLabel: string;
    recipientValue: string;
    bankLabel: string;
    bankValue: string;
    accountNumberLabel: string;
    transferTitleLabel: string;
    transferTitleValue: string;
    directionsTitle: string;
    fromKatowiceLabel: string;
    fromKatowiceText: string;
    fromKrakowLabel: string;
    fromKrakowText: string;
    fromSlovakiaLabel: string;
    fromSlovakiaText: string;
  };
  tripPlanner: {
    tag: string;
    viewLabel: string;
    roadmap: string;
    satellite: string;
    title: string;
    subtitle: string;
    placeholder: string;
    clear: string;
    useGps: string;
    gpsLocating: string;
    calculating: string;
    calculateBtn: string;
    calculateRoute: string;
    matchedAddresses: string;
    selectOrEnter: string;
    houseNumber: string;
    propertyNumber: string;
    popularPoints: string;
    samplePoints: string;
    statusRoute: string;
    statusDefault: string;
    routeToHeader: string;
    routeLabel: string;
    byCar: string;
    navGoogleMaps: string;
    openGoogleMaps: string;
    distanceUnit: string;
    resetMap: string;
    hideSteps: string;
    showSteps: (count: number) => string;
    geoNotSupported: string;
    geoPermissionDenied: string;
    geoUnavailable: string;
    geoTimeout: string;
    geoGenericError: string;
    inputEmptyError: string;
    calculateError: string;
    myLocation: string;
    mapTitle: string;
    resortName: string;
    nearbyLandmarks: string;
  };
  socialShare: {
    sharePrompt: string;
    whatsapp: string;
    facebook: string;
    twitter: string;
    copyLink: string;
    copied: string;
    shareBtn: string;
    shareText: (title: string, discount: number, code: string) => string;
  };
  roomsPage: {
    tag: string;
    title: string;
    subtitle: string;
    description: string;
    bestPriceGuarantee: string;
    priceGuarantee: string;
    filterAll: (count: number) => string;
    allCategories: (count: number) => string;
    filterDouble: string;
    doubleRooms: string;
    filterFamily: string;
    familyStudios: string;
    filterSuite: string;
    apartments: string;
    zoomPhoto: string;
    catDouble: string;
    doubleCategory: string;
    catFamily: string;
    familyCategory: string;
    catSuite: string;
    suiteCategory: string;
    maxGuests: (count: number) => string;
    bedConfigLabel: string;
    bedLayout: string;
    bookingComPrice: string;
    bookingPrice: (amount: number) => string;
    saveDirect: (amount: number) => string;
    perNightWithBreakfast: string;
    bookThisRoom: string;
    bookRoomBtn: string;
  };
  aboutPage: {
    tag: string;
    title: string;
    lead: string;
    storyTitle: string;
    storyP1: string;
    storyP2: string;
    experienceYears: string;
    experienceLabel: string;
    elevationValue: string;
    elevationLabel: string;
    distancesTitle: string;
    distancesSubtitle: string;
    galleryTitle: string;
    gallerySubtitle: string;
    bookStayBtn: string;
    distances: Array<{ name: string; dist: string }>;
  };
  seasonsPage: {
    tag: string;
    title: string;
    subtitle: string;
    winterTabBtn: string;
    summerTabBtn: string;
    winterBadge: string;
    winterHeading: string;
    winterLead: string;
    winterPoints: string[];
    bookWinterBtn: string;
    slopeSpec1Val: string;
    slopeSpec1Label: string;
    slopeSpec1Desc: string;
    slopeSpec2Val: string;
    slopeSpec2Label: string;
    slopeSpec2Desc: string;
    slopeSpec3Val: string;
    slopeSpec3Label: string;
    slopeSpec3Desc: string;
    summerBadge: string;
    summerHeading: string;
    summerLead: string;
    summerPoints: string[];
    bookSummerBtn: string;
  };
  wellnessPage: {
    tag: string;
    title: string;
    lead: string;
    jacuzziBadge: string;
    jacuzziHeading: string;
    jacuzziLead: string;
    jacuzziPoints: string[];
    bookJacuzziBtn: string;
    saunaBadge: string;
    saunaHeading: string;
    saunaLead: string;
    saunaPoints: string[];
    activities: Array<{ title: string; description: string }>;
    hoursTitle: string;
    hoursDesc: string;
    safetyTitle: string;
    safetyDesc: string;
    vipTitle: string;
    vipDesc: string;
  };
  restaurantPage: {
    tag: string;
    title: string;
    subtitle: string;
    storyHeading: string;
    storyP1: string;
    storyP2: string;
    breakfastTitle: string;
    breakfastHours: string;
    carteTitle: string;
    carteHours: string;
    specialsTitle: string;
    specialsSubtitle: string;
    heritageBadge: string;
    menuTitle: string;
    menuSubtitle: string;
    grillHeading: string;
    grillLead: string;
    grillPoints: string[];
    eventInquiryBtn: string;
  };
  wellnessDiningExtra: {
    wellnessTag: string;
    recreationTitle: string;
    recreationDesc: string;
    saunaItem: string;
    jacuzziItem: string;
    billiardItem: string;
    pingPongItem: string;
    diningTag: string;
    grillBanquetsTitle: string;
    kwasnica: string;
    placki: string;
    oscypek: string;
    pstrag: string;
    bookDiningBtn: string;
  };
  heroExtra: {
    videoBtn: string;
    forecastTitle: string;
    forecastLive: string;
    pilskoPeak: string;
    watraValley: string;
    tempFeels: string;
    wind: string;
    humidity: string;
    skiCondition: string;
    hikeCondition: string;
    videoModalTitle: string;
    videoModalSubtitle: string;
    videoModalPerks: string;
    bookPromoBtn: string;
    allCampaigns: (count: number) => string;
    promoCodeLabel: string;
    videoLoading: string;
  };
  footerExtra: {
    brandDescriptor: string;
    aboutSnippet: string;
    directGuarantee: string;
    depositNote: string;
    pagesTitle: string;
    homeLink: string;
    aboutLink: string;
    roomsLink: string;
    seasonsLink: string;
    wellnessLink: string;
    restaurantLink: string;
    packagesLink: string;
    contactLink: string;
    adminLink: string;
    bookOnlineBtn: string;
    rightsReserved: string;
  };
  seasonalExtra: {
    winterSeasonTag: string;
    snowGuarantee: string;
    pilskoMicroclimate: string;
    pilskoMicroclimateDesc: string;
    slopeDistance: string;
    summerSeasonTag: string;
    mountainTrails: string;
    trekkingEnduro: string;
    trekkingEnduroDesc: string;
    gardenGrill: string;
  };
  bookingModalExtra: {
    bookingComSyncSuccess: string;
    checkInFrom: string;
    checkOutUntil: string;
    occupiedDates: (checkIn: string, checkOut: string) => string;
    priceGuaranteeBadge: string;
    childrenAgeLabel: string;
    selectRoomLabel: string;
    perPersonPerNight: string;
    promoActive: (discount: number) => string;
    promoAppliedSuccess: (title: string, discount: number) => string;
    standardPriceForNights: (nights: number) => string;
    includesBreakfast: string;
    noBreakfast: string;
    plusDinner: string;
    freeParkingIncluded: string;
    officialDirectTitle: string;
    syncActiveBadge: string;
    channelManagerInfo: string;
    cheaperThanOta: string;
    freeMonitoredParking: string;
    personSingle: string;
    personsPlural: string;
    childrenNone: string;
    childrenPlural: string;
    nightSingle: string;
    nightsPlural: string;
  };
}

export const pagesTranslations: Record<Language, PageTranslations> = {
  pl: {
    common: {
      home: "Główna",
      perNight: "/ noc",
      perNightBreakfast: "/ noc ze śniadaniem",
      bookNow: "Rezerwuj Online",
      close: "Zamknij",
      loading: "Ładowanie...",
      copied: "Skopiowano!",
      copy: "Kopiuj",
      photosCount: (c) => `${c} zdjęcia`,
      upToPersons: (c) => `Do ${c} osób`,
      allRooms: "Wszystkie",
      directDiscountBadge: "Gwarancja Najniższej Ceny: -10% przy rezerwacji bezpośredniej + darmowy parking",
      whyBookDirectTitle: "Dlaczego warto rezerwować bezpośrednio u nas?",
      whyBookDirectDesc: "Gwarancja najniższej ceny (10% taniej niż na portalach), darmowy parking oraz powitalna beskidzka nalewka.",
      checkDates: "Sprawdź terminy",
      selectThisRoom: "Wybierz ten pokój",
      seeGallery: "Zobacz galerię",
      openInGoogleMaps: "Otwórz w Google Maps",
      navigateUs: "Nawiguj do nas",
      picturesqueDesc: "Malowniczo położony w zaciszu świerkowych lasów",
      live: "Na żywo",
      bookStayDiscount: "Zarezerwuj pobyt (-10%)",
      adultsLabel: "Dorośli",
      adultsAge: "Wiek 13+",
      childrenLabel: "Dzieci",
      childrenAge: "Wiek 0-12 lat",
      apply: "Zastosuj",
      calendarPreview: "Podgląd kalendarza terminów",
      freeCancelNote: "Bezpłatne odwołanie do 7 dni przed przyjazdem"
    },
    packagesPage: {
      tag: "Oferty Specjalne & Kody Rabatowe",
      title: "Pakiety Pobytowe & Promocje",
      subtitle: "Wybierz gotowy pakiet z wyżywieniem, seansami w jacuzzi i atrakcjami górskimi lub skorzystaj z aktywnych kodów rabatowych.",
      liveCampaignsTitle: "Aktualne Kampanie Promocyjne",
      validityPrefix: "Ważność:",
      promoCodeLabel: "Kod promocyjny:",
      bookWithDiscount: "Rezerwuj z tym rabatem",
      standardPackagesTitle: "Stałe Pakiety Pobytowe",
      priceFrom: "Cena pakietu od",
      selectPackage: "Wybierz Pakiet"
    },
    contactPage: {
      tag: "Kontakt • Dojazd • Rezerwacje",
      title: "Skontaktuj się z Watra Korbielów",
      subtitle: "Jesteśmy do Twojej dyspozycji każdego dnia. Zadzwoń do nas, napisz wiadomość lub odwiedź nas w sercu Beskidu Żywieckiego u stóp Pilska.",
      phoneTitle: "Telefon & Recepcja",
      phoneHours: "Codziennie w godzinach 7:00 – 22:00",
      phoneSubtitle: "Codziennie w godzinach 7:00 – 22:00",
      emailTitle: "Adres E-mail",
      emailDesc: "Odpowiadamy najszybciej jak to możliwe",
      emailSubtitle: "Odpowiadamy najszybciej jak to możliwe",
      locationTitle: "Lokalizacja Obiektu",
      locationRegion: "Beskid Żywiecki • Polska",
      locationSubtitle: "Beskid Żywiecki • Polska",
      address: "ul. Graniczna 17, 34-335 Korbielów",
      formTitle: "Wyślij Zapytanie do Recepcji",
      formSubtitle: "Wypełnij formularz – skontaktujemy się z Tobą w sprawie dostępności pokoi, imprez okolicznościowych lub pobytów grupowych.",
      formSuccessTitle: "Zapytanie zostało przyjęte",
      formSuccessDesc: "Dziękujemy za kontakt. Zapytanie zapisano i jest dostępne dla recepcji w panelu gości.",
      formSendAnother: "Wyślij kolejne zapytanie",
      submitError: "Nie udało się wysłać zapytania. Spróbuj ponownie później lub skontaktuj się z nami telefonicznie.",
      nameLabel: "Imię i Nazwisko *",
      namePlaceholder: "np. Jan Kowalski",
      phoneLabel: "Numer Telefonu *",
      phonePlaceholder: "+48 600 000 000",
      emailLabel: "Adres E-mail *",
      emailPlaceholder: "twoj@email.pl",
      datesLabel: "Planowany Termin (opcjonalnie)",
      datesPlaceholder: "np. 15-20 lutego (4 osoby)",
      messageLabel: "Treść Wiadomości / Pytanie *",
      messagePlaceholder: "Wpisz treść pytania, preferencje dotyczące pokoi, diety...",
      sending: "Wysyłanie...",
      submitBtn: "Wyślij Zapytanie do Watry",
      depositTitle: "Dane do Wpłaty Zadadatku",
      depositSubtitle: "Po potwierdzeniu rezerwacji przez recepcję prosimy o wpłatę zadatku na poniższy rachunek bankowy:",
      recipientLabel: "Odbiorca",
      recipientValue: "Watra Korbielów – Ośrodek Wypoczynkowy",
      bankLabel: "Bank",
      bankValue: "Bank Pekao SA",
      accountNumberLabel: "Numer Konta (PLN)",
      transferTitleLabel: "Tytuł przelewu",
      transferTitleValue: "Zadatek za pobyt, Imię i Nazwisko, termin od .. do ..",
      directionsTitle: "Wskazówki Dojazdu",
      fromKatowiceLabel: "Z Katowic / Śląska:",
      fromKatowiceText: "Trasą S1 do Żywca, następnie drogą wojewódzką DW945 przez Jeleśnię prosto do Korbielowa (ok. 90 km, 1h 20m).",
      fromKrakowLabel: "Z Krakowa:",
      fromKrakowText: "Drogą DK52 przez Wadowice i Suchą Beskidzką lub trasą S7 do Lubnia i przez Rabkę i Zawoję.",
      fromSlovakiaLabel: "Ze Słowacji:",
      fromSlovakiaText: "Przejście graniczne Oravská Polhora / Korbielów znajduje się zaledwie 3 km od naszego ośrodka."
    },
    tripPlanner: {
      tag: "Google Maps • Precyzyjny Planer Dojazdu",
      viewLabel: "Widok:",
      roadmap: "Mapa Drogowa",
      satellite: "Satelita",
      title: "Lokalizacja Watra Korbielów & Planer Trasy",
      subtitle: "Sprawdź dokładną lokalizację na Google Maps lub wpisz punkt startowy (miasto, wieś, ulica), aby wyznaczyć trasę, czas dojazdu i wskazówki manewrów.",
      placeholder: "Wpisz dowolny adres, miejscowość lub wieś (np. Katowice, Kraków, Soblówka 50, Podleśna 24...)",
      clear: "Wyczyść",
      useGps: "Użyj mojej lokalizacji GPS",
      gpsLocating: "Ustalam lokalizację GPS...",
      calculating: "Wyznaczanie trasy...",
      calculateBtn: "Wyznacz Trasę",
      calculateRoute: "Wyznacz Trasę",
      matchedAddresses: "Dopasowane adresy i miejscowości",
      selectOrEnter: "Wybierz lub naciśnij Enter",
      houseNumber: "numer posesji",
      propertyNumber: "numer posesji",
      popularPoints: "Przykładowe punkty:",
      samplePoints: "Przykładowe punkty:",
      statusRoute: "Trasa:",
      statusDefault: "Watra Korbielów",
      routeToHeader: "Wyznaczona trasa dojazdu:",
      routeLabel: "Wyznaczona trasa dojazdu:",
      byCar: "samochodem",
      navGoogleMaps: "Nawiguj w Google Maps",
      openGoogleMaps: "Otwórz w Google Maps",
      distanceUnit: "km",
      resetMap: "Resetuj mapę",
      hideSteps: "Ukryj szczegółowy plan manewrów",
      showSteps: (count) => `Pokaż kluczowe wskazówki dojazdu (${count} kroków)`,
      geoNotSupported: "Twoja przeglądarka nie obsługuje geolokalizacji.",
      geoPermissionDenied: "Dostęp do lokalizacji został odrzucony. Wpisz miasto ręcznie.",
      geoUnavailable: "Nie udało się ustalić Twojej pozycji. Wpisz miasto ręcznie.",
      geoTimeout: "Upłynął limit czasu pobierania lokalizacji.",
      geoGenericError: "Błąd pobierania pozycji GPS.",
      inputEmptyError: "Wpisz miasto lub adres startowy (np. Katowice, Kraków, Żywiec, Soblówka).",
      calculateError: "Nie udało się obliczyć trasy. Sprawdź poprawność wpisanego adresu.",
      myLocation: "Moja lokalizacja",
      mapTitle: "Mapa Google Maps — Watra Korbielów",
      resortName: "Ośrodek Watra Korbielów",
      nearbyLandmarks: "100 m do wyciągu Cypisek • Pilsko: 1557 m n.p.m."
    },
    socialShare: {
      sharePrompt: "Podziel się tą promocją ze znajomymi:",
      whatsapp: "WhatsApp",
      facebook: "Facebook",
      twitter: "Post",
      copyLink: "Kopiuj link",
      copied: "Skopiowano!",
      shareBtn: "Udostępnij",
      shareText: (title, discount, code) =>
        `🏔️ Sprawdź promocję w Watra Korbielów: "${title}"! Zyskaj -${discount}% zniżki z kodem: ${code}.`
    },
    roomsPage: {
      tag: "Noclegi • Beskidzki Klimat",
      title: "Pokoje & Apartamenty w Korbielowie",
      subtitle: "Przestronne, jasne wnętrza z widokiem na lasy świerkowe i szczyt Pilska. W cenie każdego pobytu oferujemy obfite śniadanie w formie bufetu.",
      description: "Wszystkie pokoje posiadają prywatną łazienkę z prysznicem, telewizor, dostęp do szybkiego Wi-Fi oraz zestaw ręczników. W cenę każdego noclegu wliczone jest pyszne śniadanie w formie bufetu szwedzkiego.",
      bestPriceGuarantee: "Gwarancja Najniższej Ceny: -10% przy rezerwacji bezpośredniej + darmowy parking",
      priceGuarantee: "Gwarancja Najniższej Ceny: -10% przy rezerwacji bezpośredniej + darmowy parking",
      filterAll: (c) => `Wszystkie (${c})`,
      allCategories: (c) => `Wszystkie (${c})`,
      filterDouble: "Pokoje 2-osobowe",
      doubleRooms: "Pokoje 2-osobowe",
      filterFamily: "Studia Rodzinne (3-4 os.)",
      familyStudios: "Studia Rodzinne (3-4 os.)",
      filterSuite: "Apartamenty z Tarasem",
      apartments: "Apartamenty z Tarasem",
      zoomPhoto: "Powiększ zdjęcie",
      catDouble: "Pokój 2-osobowy",
      doubleCategory: "Pokój 2-osobowy",
      catFamily: "Studio Rodzinne",
      familyCategory: "Studio Rodzinne",
      catSuite: "Apartament",
      suiteCategory: "Apartament",
      maxGuests: (c) => `Maks. ${c} gości`,
      bedConfigLabel: "Układ łóżek:",
      bedLayout: "Układ łóżek:",
      bookingComPrice: "Booking.com:",
      bookingPrice: (amount) => `Booking.com: ${amount} zł`,
      saveDirect: (amount) => `Oszczędzasz ${amount} zł/doba przy rezerwacji bezpośredniej`,
      perNightWithBreakfast: "/ noc ze śniadaniem",
      bookThisRoom: "Rezerwuj ten pokój",
      bookRoomBtn: "Rezerwuj ten pokój"
    },
    aboutPage: {
      tag: "O nas • Historia & Położenie",
      title: "Watra Korbielów – Gościnność w Sercu Beskidów",
      lead: "Watra to tradycyjne góralskie ognisko, wokół którego od pokoleń gromadzą się ludzie, by dzielić się opowieściami, ciepłem i strawą. Właśnie z tego ducha narodził się nasz resort w Korbielowie – miejsce, w którym każdy gość czuje się jak u serdecznych przyjaciół.",
      storyTitle: "Tradycja, Górska Przyroda i Komfort",
      storyP1: "Resort Watra położony jest w Korbielowie, w malowniczej dolinie rzeki Glinna, tuż u stóp Pilska (1557 m n.p.m.) – drugiego co do wysokości szczytu w Beskidzie Żywieckim. Od ponad 20 lat z pasją prowadzimy obiekt noclegowy, restaurację oraz strefę relaksu z całorocznym jacuzzi i sauną fińską.",
      storyP2: "Zimą nasi goście doceniają bezpośrednią bliskość wyciągów narciarskich – do wyciągu Cypisek i Andiamo dzieli nas zaledwie 100 metrów, co pozwala na bezpieczną naukę jazdy na nartach dla dzieci bez konieczności dojeżdżania samochodem. Latem Watra zamienia się w oazę spokoju, gdzie szum górskiego potoku i zapach świerkowego lasu tworzą wymarzone warunki do regeneracji.",
      experienceYears: "20+ lat",
      experienceLabel: "doświadczenia w obsłudze ośrodka",
      elevationValue: "1557 m",
      elevationLabel: "wysokość szczytu Pilska nad nami",
      distancesTitle: "Położenie & Odległości od Kluczowych Miejsc",
      distancesSubtitle: "Dzięki dogodnej lokalizacji przy ul. Granicznej nasi goście mają błyskawiczny dostęp do infrastruktury narciarskiej, turystycznej i granicy ze Słowacją.",
      galleryTitle: "Galeria Obiektu & Okolicy",
      gallerySubtitle: "Autentyczne fotografie naszego ośrodka, restauracji i ogrodu",
      bookStayBtn: "Rezerwuj Pobyt",
      distances: [
        { name: 'Wyciąg orczykowy "Cypisek" (dla początkujących i dzieci)', dist: '100 m' },
        { name: 'Wyciąg talerzykowy "Andiamo" & szkółka narciarska', dist: '120 m' },
        { name: 'Dolna stacja wyciągów krzesełkowych na Pilsko (Polana Kamienna)', dist: '900 m' },
        { name: 'Szlak turystyczny na Halę Miziową (1330 m n.p.m.)', dist: 'Przy obiekcie' },
        { name: 'Szczyt Pilska (1557 m n.p.m.)', dist: '2h 15m pieszo' },
        { name: 'Przejście graniczne ze Słowacją (Korbielów / Oravská Polhora)', dist: '3 km' },
        { name: 'Orawski Zamek (Słowacja)', dist: '45 km' },
        { name: 'Żywiec (Muzeum Browaru, Park Zamkowy)', dist: '25 km' }
      ]
    },
    seasonsPage: {
      tag: "Cztery Pory Roku w Beskidach",
      title: "Zima na Stoku & Lato na Szlakach",
      subtitle: "Korbielów to jeden z najpiękniejszych zakątków polskich gór. Zimą to mekka narciarska z mikroklimatem gwarantującym śnieg aż do wiosny, a latem – oaza dziewiczej przyrody i bezkresnych panoram ze szczytu Pilska.",
      winterTabBtn: "Zima w Watrze (Narty & Pilsko)",
      summerTabBtn: "Lato w Watrze (Szlaki & Rowery)",
      winterBadge: "100m do wyciągów • Cypisek & Andiamo",
      winterHeading: "Narty Tuż za Progiem Ośrodka",
      winterLead: "Dla rodzin z dziećmi i osób stawiających pierwsze kroki na nartach lokalizacja Watry to prawdziwy skarb. Wyciąg orczykowy „Cypisek” (100 m) oraz talerzykowy „Andiamo” (120 m) ze sztucznym naśnieżaniem i oświetleniem pozwalają na naukę jazdy bez stania w korkach.",
      winterPoints: [
        "Ogrzewana przechowalnia sprzętu narciarskiego z suszarkami do butów",
        "Rabat 20% w zaprzyjaźnionej wypożyczalni nart i snowboardów",
        "Możliwość rezerwacji certyfikowanych instruktorów PZN na miejscu",
        "Zaledwie 900 m do głównej stacji krzesełkowej Ośrodka Pilsko-Jontek"
      ],
      bookWinterBtn: "Rezerwuj pobyt narciarski (-10%)",
      slopeSpec1Val: "20 km",
      slopeSpec1Label: "Tras Narciarskich",
      slopeSpec1Desc: "Trasy o zróżnicowanym stopniu trudności: od łagodnych dla dzieci po czarną trasę FIS ze szczytu.",
      slopeSpec2Val: "1557 m n.p.m.",
      slopeSpec2Label: "Najwyższy Punkt Narciarski",
      slopeSpec2Desc: "Pilsko to drugi najwyższy szczyt w Beskidach z doskonałymi warunkami śniegowymi do końca kwietnia.",
      slopeSpec3Val: "10 Wyciągów",
      slopeSpec3Label: "Infrastruktura Pilska",
      slopeSpec3Desc: "Koleje krzesełkowe i wyciągi orczykowe obsługujące Halę Szczawiny, Halę Miziową i Kopiec.",
      summerBadge: "Szlaki Turystyczne • Czyste Górskie Powietrze",
      summerHeading: "Piesze Wędrówki, Rower i Spokój",
      summerLead: "Latem Korbielów urzeka ciszą, zapachem ziół i szumem potoków. Bezpośrednio z Watry można wyruszyć na szlak prowadzący na Halę Miziową (1330 m) i dalej na sam szczyt Pilska, skąd roztacza się zjawiskowy widok na całe Tatry i Beskidy.",
      summerPoints: [
        "Trasy piesze: Pilsko (1557 m), Hala Rysianka, Hala Lipowska, Babia Góra",
        "Trasy rowerowe MTB i singletracki w Korbielowie i na Orawie",
        "Duży zielony ogród ośrodka z leżakami, grillem i placem zabaw",
        "Zewnętrzne jacuzzi w ogrodzie czynne również latem"
      ],
      bookSummerBtn: "Rezerwuj letni urlop (-10%)"
    },
    wellnessPage: {
      tag: "Strefa SPA & Odnowy Biologicznej",
      title: "Zewnętrzne Jacuzzi & Sauna Fińska",
      lead: "Kąpiel w gorącej wodzie na świeżym górskim powietrzu pod rozgwieżdżonym beskidzkim niebem to jedno z najbardziej niezwykłych doświadczeń, jakie czekają na gości Watry.",
      jacuzziBadge: "Czynne Cały Rok • Zima i Lato",
      jacuzziHeading: "Zewnętrzne Jacuzzi w Otoczeniu Lasu",
      jacuzziLead: "Nasza balia z hydromasażem pomieści komfortowo do 6 osób. Woda jest podgrzewana do idealnej temperatury 38°C, co w zimowe wieczory, przy padającym wokół śniegu, gwarantuje absolutnie niezapomniany relaks dla ciała i zmysłów.",
      jacuzziPoints: [
        "Temperatura kąpieli: 38°C przez cały rok",
        "Zaawansowane dysze masujące kark, plecy i stopy",
        "Możliwość rezerwacji prywatnego seansu na wyłączność z butelką wina",
        "Nastrojowe oświetlenie ledowe i widok na las świerkowy"
      ],
      bookJacuzziBtn: "Rezerwuj pobyt z jacuzzi",
      saunaBadge: "Aktywność • Regeneracja • Dobre samopoczucie",
      saunaHeading: "Fitness i dobre samopoczucie",
      saunaLead: "Sala fitness z bieżnią i rowerkiem pozwala zadbać o kondycję, a strefa relaksu pomaga odzyskać siły po górskich aktywnościach.",
      saunaPoints: [
        "Aromaterapia olejkami, prysznice schładzające i wygodne leżaki",
        "Ręczniki oraz prześcieradła saunowe w cenie"
      ],
      activities: [
        { title: "Grota Solna", description: "Naturalna sól tworzy nadmorski mikroklimat sprzyjający oddychaniu i relaksowi na leżakach." },
        { title: "Tradycyjna Sucha Sauna Fińska", description: "Sosnowa sauna 85–95°C wspiera krążenie i regenerację; aromaterapia, prysznice, leżaki i tekstylia w cenie." },
        { title: "Sala Fitness", description: "Bieżnia i rowerek pozwalają trenować niezależnie od pogody." },
        { title: "Balia Relaksacyjna", description: "Ciepła kąpiel w drewnianej balii rozluźnia mięśnie po górskich wędrówkach." },
        { title: "Balia / Strefa Schładzania", description: "Zimna kąpiel po saunie pobudza krążenie i dodaje energii." },
        { title: "Kącik Wypoczynkowy", description: "Wiklinowe fotele i górska fototapeta tworzą miejsce na wyciszenie i odpoczynek." }
      ],
      hoursTitle: "Godziny Otwarcia",
      hoursDesc: "Strefa wellness czynna codziennie w godzinach 16:00 – 22:00. Na życzenie możliwe wcześniejsze uruchomienie.",
      safetyTitle: "Zdrowie & Bezpieczeństwo",
      safetyDesc: "Woda w jacuzzi jest nieustannie filtrowana i badana. Obiekt spełnia najwyższe normy sanitarne.",
      vipTitle: "Wieczory na Wyłączność",
      vipDesc: "Dla par oferujemy romantyczne pakiety z prywatną rezerwacją po godzinie 21:00 z muzyką i świecami."
    },
    restaurantPage: {
      tag: "Restauracja • Karczma • Wiata Grillowa",
      title: "Autentyczne Smaki Beskidu Żywieckiego",
      subtitle: "W naszej kuchni łączymy bogate tradycje góralskie z najwyższą jakością lokalnych produktów. Zapraszamy zarówno gości ośrodka, jak i turystów wędrujących ze szlaków Pilska.",
      storyHeading: "Tradycyjna Gościnność i Domowa Kuchnia",
      storyP1: "Wnętrze naszej restauracji urządzone jest w ciepłym, tradycyjnym stylu – regionalna gościnność i serdeczna atmosfera tworzą domowy klimat. Codziennie rano serwujemy obfity bufet śniadaniowy z regionalnymi wędlinami, świeżym pieczywem i gorącymi daniami.",
      storyP2: "Popołudniami i wieczorami zapraszamy na dania a la carte oraz regionalne napitki: beskidzkie nalewki ziołowe, grzane wino z korzeniami i lokalne piwa.",
      breakfastTitle: "Śniadania Bufetowe",
      breakfastHours: "8:00 – 10:00 (w cenie noclegu)",
      carteTitle: "Restauracja a la carte",
      carteHours: "12:00 – 21:00 codziennie",
      specialsTitle: "Tradycyjne Specjały z Naszej Spiżarni",
      specialsSubtitle: "Świeże regionalne produkty od lokalnych dostawców i pieczołowicie przygotowane dania",
      heritageBadge: "Regionalne Dziedzictwo Kulinarne",
      menuTitle: "Karta Dań Restauracji Watra",
      menuSubtitle: "Wszystkie dania przygotowujemy ze świeżych składników na bieżąco",
      grillHeading: "Wiata Grillowa & Przyjęcia Biesiadne",
      grillLead: "Organizujemy biesiady góralskie przy żywym ogniu z kapelą beskidzką, pieczeniem kiełbasek i prosiaka.",
      grillPoints: [
        "Zadaszona chata grillowa dla 60 osób",
        "Muzyka na żywo i gawędy beskidzkie",
        "Pieczenie prosiaka, barana lub kociołki biesiadne",
        "Idealne na wyjazdy firmowe i rodzinne zjazdy"
      ],
      eventInquiryBtn: "Zapytaj o organizację imprezy"
    },
    wellnessDiningExtra: {
      wellnessTag: "Strefa Relaksu & Zdrowia",
      recreationTitle: "Odnowa & Rekreacja w Resorcie",
      recreationDesc: "Po aktywnym dniu na stoku narciarskim lub beskidzkich szlakach zrelaksuj się w ogrodowym jacuzzi i tradycyjnej saunie fińskiej. Do dyspozycji gości pozostaje również sala z bilardem i tenisem stołowym.",
      saunaItem: "Tradycyjna sucha sauna fińska",
      jacuzziItem: "Zewnętrzne jacuzzi z ciepłą wodą",
      billiardItem: "Stół bilardowy i sala klubowa",
      pingPongItem: "Tenis stołowy (ping-pong)",
      diningTag: "Smaki Beskidzkiej Kuchni",
      grillBanquetsTitle: "Wiata Grillowa & Przyjęcia Okolicznościowe",
      kwasnica: "🍲 Kwaśnica na żeberku",
      placki: "🥞 Placki po zbójnicku",
      oscypek: "🧀 Oscypek z żurawiną",
      pstrag: "🐟 Pstrąg z potoku",
      bookDiningBtn: "Zarezerwuj pobyt z wyżywieniem"
    },
    heroExtra: {
      videoBtn: "Odkryj resort",
      forecastTitle: "Prognoza 7-dniowa • Pilsko & Korbielów",
      forecastLive: "Aktualizowane na żywo • Open-Meteo API",
      pilskoPeak: "Szczyt Pilsko (1557 m)",
      watraValley: "Dolina Watra (~650 m)",
      tempFeels: "Temp. odczuwalna:",
      wind: "Wiatr:",
      humidity: "Wilgotność:",
      skiCondition: "Kondycja narciarska:",
      hikeCondition: "Kondycja turystyczna:",
      videoModalTitle: "Watra Korbielów • Odkryj nasz resort",
      videoModalSubtitle: "Beskid Żywiecki • Stok Pilsko 1557 m n.p.m.",
      videoModalPerks: "Pokoje • Stoki narciarskie • Restauracja • Jacuzzi pod gwiazdami",
      bookPromoBtn: "Rezerwuj ze zniżką",
      allCampaigns: (c) => `Wszystkie (${c})`,
      promoCodeLabel: "Kod rabatowy:",
      videoLoading: "Ładowanie wideo resortu..."
    },
    footerExtra: {
      brandDescriptor: "Ośrodek • Restauracja",
      aboutSnippet: "Watra Korbielów to całoroczny resort górski położony w Beskidzie Żywieckim u stóp Pilska (1557 m n.p.m.). Oferujemy 100 m do wyciągów narciarskich, gorące jacuzzi pod gwiazdami, tradycyjną karczmę beskidzką i komfortowe noclegi z 10% rabatem bezpośrednim.",
      directGuarantee: "Gwarancja rezerwacji bezpośredniej: -10% i darmowy parking",
      depositNote: "W tytule prosimy wpisać nazwisko oraz termin rezerwacji.",
      pagesTitle: "Strony & Sekcje",
      homeLink: "Strona Główna",
      aboutLink: "O nas & Położenie",
      roomsLink: "Pokoje & Cennik",
      seasonsLink: "Zima & Lato w Beskidach",
      wellnessLink: "Jacuzzi & Sauna",
      restaurantLink: "Restauracja & Grill",
      packagesLink: "Pakiety & Promocje",
      contactLink: "Kontakt & Dojazd",
      adminLink: "Panel Administratora",
      bookOnlineBtn: "Rezerwuj online",
      rightsReserved: "Wszelkie prawa zastrzeżone."
    },
    seasonalExtra: {
      winterSeasonTag: "Sezon zimowy w Korbielowie (Grudzień – Kwiecień)",
      snowGuarantee: "Gwarancja Śniegu",
      pilskoMicroclimate: "Mikroklimat Pilska",
      pilskoMicroclimateDesc: "Dzięki wysokości 1557 m n.p.m. i specyficznemu mikroklimatowi, śnieg na Pilsku utrzymuje się często aż do maja.",
      slopeDistance: "100 m od drzwi do wyciągu",
      summerSeasonTag: "Sezon letni w Beskidach (Maj – Październik)",
      mountainTrails: "Górskie Szlaki",
      trekkingEnduro: "Trekking & Enduro",
      trekkingEnduroDesc: "Szlaki w stronę Hali Miziowej, Rysianki i Babiej Góry zaczynają się bezpośrednio przy ośrodku. Wspaniałe panoramy Tatr i Beskidów.",
      gardenGrill: "Ogród wypoczynkowy & Wiata grillowa"
    },
    bookingModalExtra: {
      bookingComSyncSuccess: "Synchronizacja z Booking.com: Termin został natychmiast zablokowany, chroniąc przed podwójną rezerwacją.",
      checkInFrom: "(od 15:00)",
      checkOutUntil: "(do 11:00)",
      occupiedDates: (inD, outD) => `Zajęty termin: ${inD} do ${outD}.`,
      priceGuaranteeBadge: "Gwarancja Ceny",
      childrenAgeLabel: "Dzieci (0-12 lat)",
      selectRoomLabel: "Wybierz Pokój",
      perPersonPerNight: "zł/os./doba",
      promoActive: (d) => `AKTYWNY (-${d}%)`,
      promoAppliedSuccess: (title, d) => `Naliczono -${d}% rabatu! (${title})`,
      standardPriceForNights: (n) => `Cena standardowa (${n} ${n === 1 ? 'noc' : 'noce'}):`,
      includesBreakfast: "zawiera śniadanie",
      noBreakfast: "bez śniadania",
      plusDinner: " + obiadokolację",
      freeParkingIncluded: " & darmowy parking",
      officialDirectTitle: "Oficjalna Rezerwacja Bezpośrednia Watra",
      syncActiveBadge: "Sync z Booking.com: Aktywny",
      channelManagerInfo: "Wszystkie rezerwacje realizowane są bezpośrednio na naszej stronie. Zintegrowany moduł Channel Managera natychmiast blokuje terminy na portalu Booking.com, wykluczając ryzyko podwójnej rezerwacji (overbooking).",
      cheaperThanOta: "10% taniej niż na portalach OTA",
      freeMonitoredParking: "Darmowy monitorowany parking",
      personSingle: "osoba",
      personsPlural: "osoby",
      childrenNone: "brak",
      childrenPlural: "dzieci",
      nightSingle: "noc",
      nightsPlural: "noce"
    }
  },
  en: {
    common: {
      home: "Home",
      perNight: "/ night",
      perNightBreakfast: "/ night with breakfast",
      bookNow: "Book Online",
      close: "Close",
      loading: "Loading...",
      copied: "Copied!",
      copy: "Copy",
      photosCount: (c) => `${c} photos`,
      upToPersons: (c) => `Up to ${c} guests`,
      allRooms: "All",
      directDiscountBadge: "Best Price Guarantee: -10% direct booking discount + free parking",
      whyBookDirectTitle: "Why book directly with us?",
      whyBookDirectDesc: "Guaranteed lowest rates (10% cheaper than portals), free parking, and a complimentary welcome mountain herbal liqueur.",
      checkDates: "Check Dates",
      selectThisRoom: "Select this room",
      seeGallery: "View Gallery",
      openInGoogleMaps: "Open in Google Maps",
      navigateUs: "Navigate to us",
      picturesqueDesc: "Picturesquely set amidst tranquil spruce forests",
      live: "Live",
      bookStayDiscount: "Book stay (-10%)",
      adultsLabel: "Adults",
      adultsAge: "Age 13+",
      childrenLabel: "Children",
      childrenAge: "Age 0-12",
      apply: "Apply",
      calendarPreview: "View dates calendar",
      freeCancelNote: "Free cancellation up to 7 days before arrival"
    },
    packagesPage: {
      tag: "Special Offers & Promo Codes",
      title: "Holiday Packages & Deals",
      subtitle: "Choose an all-inclusive stay with half board, jacuzzi sessions, and mountain activities, or use our active promo codes.",
      liveCampaignsTitle: "Active Promotional Campaigns",
      validityPrefix: "Validity:",
      promoCodeLabel: "Promo code:",
      bookWithDiscount: "Book with this discount",
      standardPackagesTitle: "Curated Stay Packages",
      priceFrom: "Package price from",
      selectPackage: "Select Package"
    },
    contactPage: {
      tag: "Contact • Location • Inquiries",
      title: "Contact Watra Korbielów",
      subtitle: "We are at your disposal every day. Call us, send an email, or visit us in the heart of the Beskid Mountains at the foot of Mount Pilsko.",
      phoneTitle: "Phone & Reception",
      phoneHours: "Every day 7:00 AM – 10:00 PM",
      phoneSubtitle: "Every day 7:00 AM – 10:00 PM",
      emailTitle: "Email Address",
      emailDesc: "We reply as promptly as possible",
      emailSubtitle: "We reply as promptly as possible",
      locationTitle: "Resort Location",
      locationRegion: "Żywiec Beskids • Poland",
      locationSubtitle: "Żywiec Beskids • Poland",
      address: "17 Graniczna Street, 34-335 Korbielów",
      formTitle: "Send an Inquiry to Reception",
      formSubtitle: "Fill out the form – we will get back to you regarding room availability, group stays, or family celebrations.",
      formSuccessTitle: "Inquiry received",
      formSuccessDesc: "Thank you for contacting us. Your inquiry has been saved and is available to reception in guest management.",
      formSendAnother: "Send another inquiry",
      submitError: "We couldn't submit your inquiry. Please try again later or contact us by phone.",
      nameLabel: "Full Name *",
      namePlaceholder: "e.g. John Smith",
      phoneLabel: "Phone Number *",
      phonePlaceholder: "+48 600 000 000",
      emailLabel: "Email Address *",
      emailPlaceholder: "you@example.com",
      datesLabel: "Planned Dates (optional)",
      datesPlaceholder: "e.g. Feb 15-20 (4 guests)",
      messageLabel: "Message / Question *",
      messagePlaceholder: "Write your inquiry, room preferences, dietary requirements...",
      sending: "Sending...",
      submitBtn: "Send Inquiry to Watra",
      depositTitle: "Deposit Payment Details",
      depositSubtitle: "Upon booking confirmation by reception, please transfer the deposit to the following bank account:",
      recipientLabel: "Beneficiary",
      recipientValue: "Watra Korbielów – Holiday Resort",
      bankLabel: "Bank",
      bankValue: "Bank Pekao SA",
      accountNumberLabel: "Account Number (PLN)",
      transferTitleLabel: "Transfer Description",
      transferTitleValue: "Booking deposit, Full Name, dates from .. to ..",
      directionsTitle: "Driving Directions",
      fromKatowiceLabel: "From Katowice / Silesia:",
      fromKatowiceText: "Take expressway S1 to Żywiec, then road DW945 through Jeleśnia straight to Korbielów (approx. 90 km, 1h 20m).",
      fromKrakowLabel: "From Kraków:",
      fromKrakowText: "Follow national road DK52 via Wadowice and Sucha Beskidzka, or S7 to Lubień and via Rabka and Zawoja.",
      fromSlovakiaLabel: "From Slovakia:",
      fromSlovakiaText: "The border crossing Oravská Polhora / Korbielów is located just 3 km from our resort."
    },
    tripPlanner: {
      tag: "Google Maps • Turn-by-Turn Route Planner",
      viewLabel: "View:",
      roadmap: "Road Map",
      satellite: "Satellite",
      title: "Location & Route Planner to Watra Korbielów",
      subtitle: "Check our location on Google Maps or enter your departure location (city, village, or street) to get exact driving time, distance, and directions.",
      placeholder: "Enter any address, town, or village (e.g. Katowice, Kraków, Žilina, Namestovo...)",
      clear: "Clear",
      useGps: "Use my GPS location",
      gpsLocating: "Locating GPS...",
      calculating: "Calculating route...",
      calculateBtn: "Calculate Route",
      calculateRoute: "Calculate Route",
      matchedAddresses: "Matching addresses and towns",
      selectOrEnter: "Select or press Enter",
      houseNumber: "building no.",
      propertyNumber: "building no.",
      popularPoints: "Popular starting points:",
      samplePoints: "Popular starting points:",
      statusRoute: "Route:",
      statusDefault: "Watra Korbielów",
      routeToHeader: "Calculated driving route:",
      routeLabel: "Calculated driving route:",
      byCar: "by car",
      navGoogleMaps: "Navigate in Google Maps",
      openGoogleMaps: "Open in Google Maps",
      distanceUnit: "km",
      resetMap: "Reset map",
      hideSteps: "Hide turn-by-turn directions",
      showSteps: (count) => `Show turn-by-turn directions (${count} steps)`,
      geoNotSupported: "Geolocation is not supported by your browser.",
      geoPermissionDenied: "Location access denied. Please type your city manually.",
      geoUnavailable: "Could not determine your location. Please type manually.",
      geoTimeout: "Location request timed out.",
      geoGenericError: "Error retrieving GPS coordinates.",
      inputEmptyError: "Please enter a starting city or address.",
      calculateError: "Could not calculate route. Please verify the entered address.",
      myLocation: "My Location",
      mapTitle: "Google Maps — Watra Korbielów",
      resortName: "Watra Korbielów Resort",
      nearbyLandmarks: "100 m to Cypisek ski lift • Pilsko: 1,557 m above sea level"
    },
    socialShare: {
      sharePrompt: "Share this offer with friends:",
      whatsapp: "WhatsApp",
      facebook: "Facebook",
      twitter: "Post",
      copyLink: "Copy Link",
      copied: "Copied!",
      shareBtn: "Share",
      shareText: (title, discount, code) =>
        `🏔️ Check out this deal at Watra Korbielów: "${title}"! Get -${discount}% off with promo code: ${code}.`
    },
    roomsPage: {
      tag: "Accommodation • Beskid Comfort",
      title: "Rooms & Suites in Korbielów",
      subtitle: "Bright, peaceful rooms with views of lush spruce forests and mountain peaks. Rich breakfast buffet included with every stay.",
      description: "All rooms feature private en-suite bathrooms with showers, TV, fast Wi-Fi, and fresh towels. A rich buffet breakfast is included in every booking.",
      bestPriceGuarantee: "Best Price Guarantee: -10% direct discount + free parking",
      priceGuarantee: "Best Price Guarantee: -10% direct discount + free parking",
      filterAll: (c) => `All Rooms (${c})`,
      allCategories: (c) => `All Rooms (${c})`,
      filterDouble: "Double Rooms",
      doubleRooms: "Double Rooms",
      filterFamily: "Family Studios (3-4p)",
      familyStudios: "Family Studios (3-4p)",
      filterSuite: "Suites with Terrace",
      apartments: "Suites with Terrace",
      zoomPhoto: "Enlarge photo",
      catDouble: "Double Room",
      doubleCategory: "Double Room",
      catFamily: "Family Studio",
      familyCategory: "Family Studio",
      catSuite: "Suite",
      suiteCategory: "Suite",
      maxGuests: (c) => `Max. ${c} guests`,
      bedConfigLabel: "Bed configuration:",
      bedLayout: "Bed configuration:",
      bookingComPrice: "Booking.com:",
      bookingPrice: (amount) => `Booking.com: ${amount} PLN`,
      saveDirect: (amount) => `Save ${amount} PLN/night by booking directly`,
      perNightWithBreakfast: "/ night with breakfast",
      bookThisRoom: "Book This Room",
      bookRoomBtn: "Book This Room"
    },
    aboutPage: {
      tag: "About Us • History & Location",
      title: "Watra Korbielów – Mountain Hospitality",
      lead: "A 'Watra' is a traditional mountain bonfire where people gather for warmth, food, and stories. That very spirit inspired our resort in Korbielów – a place where every guest feels among welcoming friends.",
      storyTitle: "Tradition, Mountain Nature, and Modern Comfort",
      storyP1: "Resort Watra is situated in the picturesque valley of Korbielów, right at the foot of Mount Pilsko (1557 m a.s.l.) – the second-highest peak in the Beskid Żywiecki. For over 20 years, we have warmly welcomed guests with cozy accommodation, regional dining, and our outdoor jacuzzi and Finnish sauna.",
      storyP2: "In winter, guests cherish being just 100 meters from ski lifts Cypisek & Andiamo, ideal for effortless ski lessons. In summer, Watra turns into a peaceful mountain haven with pine-scented air and babbling streams.",
      experienceYears: "20+ years",
      experienceLabel: "of hospitality experience",
      elevationValue: "1557 m",
      elevationLabel: "Mount Pilsko elevation above us",
      distancesTitle: "Location & Proximity to Attractions",
      distancesSubtitle: "Located conveniently on ul. Graniczna, our guests enjoy immediate access to ski slopes, trails, and the Slovak border.",
      galleryTitle: "Resort & Surroundings Gallery",
      gallerySubtitle: "Authentic photographs of our resort, restaurant, and gardens",
      bookStayBtn: "Book Your Stay",
      distances: [
        { name: 'Ski lift "Cypisek" (for children and beginners)', dist: '100 m' },
        { name: 'Ski lift "Andiamo" & licensed ski school', dist: '120 m' },
        { name: 'Main Pilsko chairlift station (Polana Kamienna)', dist: '900 m' },
        { name: 'Hiking trail to Hala Miziowa (1330 m)', dist: 'At resort' },
        { name: 'Mount Pilsko Summit (1557 m)', dist: '2h 15m hike' },
        { name: 'Slovakia border crossing (Oravská Polhora)', dist: '3 km' },
        { name: 'Orava Castle (Slovakia)', dist: '45 km' },
        { name: 'Żywiec (Brewery Museum, Castle Park)', dist: '25 km' }
      ]
    },
    seasonsPage: {
      tag: "Four Seasons in the Beskids",
      title: "Winter Slopes & Summer Trails",
      subtitle: "Korbielów is one of the most picturesque corners of the Polish mountains. In winter, it is a snow haven with snow lasting until spring; in summer, an oasis of pristine nature and endless panoramas.",
      winterTabBtn: "Winter at Watra (Ski & Pilsko)",
      summerTabBtn: "Summer at Watra (Trails & Biking)",
      winterBadge: "100m to ski lifts • Cypisek & Andiamo",
      winterHeading: "Skiing Right at Your Doorstep",
      winterLead: "For families with children and beginner skiers, Watra's location is unbeatable. The 'Cypisek' T-bar lift (100 m) and 'Andiamo' button lift (120 m) offer illuminated, snow-made slopes for relaxed skiing.",
      winterPoints: [
        "Heated ski equipment storage with boot dryers",
        "20% partner discount on ski and snowboard rentals",
        "Licensed ski instructors available on site",
        "Only 900 m to the main Pilsko chairlift station"
      ],
      bookWinterBtn: "Book Ski Stay (-10%)",
      slopeSpec1Val: "20 km",
      slopeSpec1Label: "Ski Slopes",
      slopeSpec1Desc: "Diverse trails ranging from gentle beginner pistes to the FIS black run from the summit.",
      slopeSpec2Val: "1557 m a.s.l.",
      slopeSpec2Label: "Highest Ski Point",
      slopeSpec2Desc: "Pilsko is the 2nd highest peak in the Beskids with excellent snow cover into late spring.",
      slopeSpec3Val: "10 Ski Lifts",
      slopeSpec3Label: "Pilsko Infrastructure",
      slopeSpec3Desc: "Chairlifts and T-bars serving Hala Szczawiny, Hala Miziowa, and Kopiec.",
      summerBadge: "Scenic Trails • Crisp Mountain Air",
      summerHeading: "Hiking, Mountain Biking & Serenity",
      summerLead: "In summer, enjoy pure tranquil nature. Head directly from Watra to Hala Miziowa (1330 m) and up to Mount Pilsko for breathtaking vistas across the Tatras and Beskids.",
      summerPoints: [
        "Hiking trails: Pilsko (1557 m), Hala Rysianka, Hala Lipowska, Babia Góra",
        "MTB and single-track biking trails in Korbielów and Orava",
        "Spacious resort garden with sun loungers, grill hut, and playground",
        "Outdoor hot jacuzzi open all summer long"
      ],
      bookSummerBtn: "Book Summer Holiday (-10%)"
    },
    wellnessPage: {
      tag: "SPA & Wellness Zone",
      title: "Outdoor Jacuzzi & Finnish Sauna",
      lead: "Soaking in steaming water under the starry mountain sky is one of the most magical experiences waiting for guests at Watra.",
      jacuzziBadge: "Open All Year • Winter & Summer",
      jacuzziHeading: "Forest-View Outdoor Hot Tub",
      jacuzziLead: "Our spacious hydromassage hot tub comfortably accommodates up to 6 guests. Heated to a soothing 38°C, it offers unparalleled sensory relaxation during snowy winter evenings and mild summer nights.",
      jacuzziPoints: [
        "Water temperature: 38°C year-round",
        "Targeted hydromassage jets for neck, back, and feet",
        "Private evening bookings available with champagne or wine",
        "Ambient LED lighting with peaceful pine forest views"
      ],
      bookJacuzziBtn: "Book stay with jacuzzi",
      saunaBadge: "Activity • Recovery • Wellbeing",
      saunaHeading: "Fitness & Wellbeing",
      saunaLead: "A treadmill and exercise bike support your fitness, while the relaxation area helps you recharge after mountain activities.",
      saunaPoints: [
        "Oil aromatherapy, cooling showers and comfortable loungers",
        "Sauna towels and sheets included"
      ],
      activities: [
        { title: "Salt Cave", description: "Natural salt creates a seaside-like microclimate for easier breathing and restful lounging." },
        { title: "Traditional Finnish Sauna", description: "Pine sauna at 85–95°C supports circulation and recovery; aromatherapy, showers, loungers and linens included." },
        { title: "Fitness Room", description: "A treadmill and exercise bike make it easy to stay active in any weather." },
        { title: "Relaxation Tub", description: "A warm wooden tub helps ease tired muscles after mountain hikes." },
        { title: "Cold Plunge", description: "A refreshing cold bath after sauna stimulates circulation and restores energy." },
        { title: "Relaxation Corner", description: "Wicker chairs and a mountain mural make a cozy spot to unwind." }
      ],
      hoursTitle: "Opening Hours",
      hoursDesc: "Wellness zone is open daily from 4:00 PM to 10:00 PM. Earlier activation available upon request.",
      safetyTitle: "Health & Hygiene",
      safetyDesc: "Water in the jacuzzi is continuously filtered and tested to the highest sanitary standards.",
      vipTitle: "Private Evening Sessions",
      vipDesc: "Exclusive evening bookings available for couples after 9:00 PM with ambient candlelight and relaxing music."
    },
    restaurantPage: {
      tag: "Restaurant • Tavern • Grill Hut",
      title: "Authentic Flavors of Beskid Żywiecki",
      subtitle: "We combine cherished highland culinary traditions with fresh local produce. Welcoming resort guests and hikers descending from Pilsko.",
      storyHeading: "Traditional Hospitality & Home Cooking",
      storyP1: "Our restaurant features warm wooden decor, heartwarming hospitality, and genuine mountain flavors. Every morning begins with an abundant breakfast buffet featuring local cured meats, artisan breads, and warm dishes.",
      storyP2: "In the afternoons and evenings, enjoy our à la carte specialties and regional drinks: herbal liqueurs, spiced mulled wine, and craft mountain beers.",
      breakfastTitle: "Buffet Breakfast",
      breakfastHours: "8:00 AM – 10:00 AM (included in room rate)",
      carteTitle: "À la carte Dining",
      carteHours: "12:00 PM – 9:00 PM daily",
      specialsTitle: "Traditional Pantry Specialties",
      specialsSubtitle: "Fresh local ingredients and slow-cooked regional recipes",
      heritageBadge: "Regional Culinary Heritage",
      menuTitle: "Watra Restaurant Menu",
      menuSubtitle: "All dishes freshly prepared upon order",
      grillHeading: "Grill Hut & Highland Feasts",
      grillLead: "We host authentic highland barbecues over open fires with live folk music, roasting meats, and mountain folklore.",
      grillPoints: [
        "Covered wooden grill shelter seating up to 60 guests",
        "Live traditional folk band and storytelling",
        "Whole pig roasting, lamb, or traditional cauldron goulash",
        "Ideal for corporate retreats and family reunions"
      ],
      eventInquiryBtn: "Inquire about an event"
    },
    wellnessDiningExtra: {
      wellnessTag: "Relaxation & Health Zone",
      recreationTitle: "Renewal & Recreation at the Resort",
      recreationDesc: "After an active day on the ski slopes or mountain trails, unwind in our garden jacuzzi and authentic Finnish sauna. Guests also enjoy full access to our game room with a billiard table and table tennis.",
      saunaItem: "Traditional dry Finnish sauna",
      jacuzziItem: "Outdoor heated hydromassage jacuzzi",
      billiardItem: "Billiard table and club lounge",
      pingPongItem: "Table tennis (ping-pong)",
      diningTag: "Flavors of Beskid Cuisine",
      grillBanquetsTitle: "Barbecue Shelter & Group Banquets",
      kwasnica: "🍲 High-mountain sauerkraut soup",
      placki: "🥞 Highland potato pancakes",
      oscypek: "🧀 Oscypek cheese with cranberry",
      pstrag: "🐟 Fresh mountain stream trout",
      bookDiningBtn: "Book stay with dining"
    },
    heroExtra: {
      videoBtn: "Explore Resort",
      forecastTitle: "7-Day Mountain Forecast • Pilsko & Korbielów",
      forecastLive: "Live data from Open-Meteo API",
      pilskoPeak: "Pilsko Summit (1557 m)",
      watraValley: "Watra Valley (~650 m)",
      tempFeels: "Feels like:",
      wind: "Wind:",
      humidity: "Humidity:",
      skiCondition: "Ski conditions:",
      hikeCondition: "Hiking conditions:",
      videoModalTitle: "Watra Korbielów • Explore Our Resort",
      videoModalSubtitle: "Beskid Żywiecki • Mount Pilsko 1557 m a.s.l.",
      videoModalPerks: "Rooms • Ski Slopes • Restaurant • Stargazing Jacuzzi",
      bookPromoBtn: "Book with discount",
      allCampaigns: (c) => `All (${c})`,
      promoCodeLabel: "Promo code:",
      videoLoading: "Loading resort video..."
    },
    footerExtra: {
      brandDescriptor: "Resort • Restaurant",
      aboutSnippet: "Watra Korbielów is a year-round mountain resort in the Żywiec Beskids, at the foot of Mount Pilsko (1,557 m). Enjoy ski lifts just 100 m away, a hot tub under the stars, traditional highlander cuisine, and comfortable accommodation with a 10% direct-booking discount.",
      directGuarantee: "Direct booking guarantee: -10% discount & free parking",
      depositNote: "Please include your surname and stay dates in the bank transfer reference.",
      pagesTitle: "Pages & Sections",
      homeLink: "Home",
      aboutLink: "About & Location",
      roomsLink: "Rooms & Rates",
      seasonsLink: "Winter & Summer",
      wellnessLink: "Jacuzzi & Sauna",
      restaurantLink: "Restaurant & Grill",
      packagesLink: "Packages & Deals",
      contactLink: "Contact & Directions",
      adminLink: "Admin CMS Panel",
      bookOnlineBtn: "Book Online",
      rightsReserved: "All rights reserved."
    },
    seasonalExtra: {
      winterSeasonTag: "Winter season in Korbielów (December – April)",
      snowGuarantee: "Snow Guarantee",
      pilskoMicroclimate: "Pilsko Microclimate",
      pilskoMicroclimateDesc: "Thanks to the elevation of 1,557 m a.s.l. and unique microclimate, snow on Mount Pilsko often lasts well into May.",
      slopeDistance: "100 m from door to ski lift",
      summerSeasonTag: "Summer season in the Beskids (May – October)",
      mountainTrails: "Mountain Trails",
      trekkingEnduro: "Trekking & Enduro",
      trekkingEnduroDesc: "Trails to Hala Miziowa, Rysianka, and Babia Góra start right next to our resort. Spectacular panoramic views of the Tatras and Beskids.",
      gardenGrill: "Garden relaxation & BBQ pavilion"
    },
    bookingModalExtra: {
      bookingComSyncSuccess: "Sync with Booking.com: The dates have been immediately blocked to prevent double-booking.",
      checkInFrom: "(from 15:00)",
      checkOutUntil: "(until 11:00)",
      occupiedDates: (inD, outD) => `Occupied dates: ${inD} to ${outD}.`,
      priceGuaranteeBadge: "Price Guarantee",
      childrenAgeLabel: "Children (0-12 yrs)",
      selectRoomLabel: "Select Room",
      perPersonPerNight: "PLN/guest/night",
      promoActive: (d) => `ACTIVE (-${d}%)`,
      promoAppliedSuccess: (title, d) => `Applied -${d}% discount! (${title})`,
      standardPriceForNights: (n) => `Standard rate (${n} ${n === 1 ? 'night' : 'nights'}):`,
      includesBreakfast: "includes breakfast",
      noBreakfast: "room only",
      plusDinner: " + half-board dinner",
      freeParkingIncluded: " & free parking",
      officialDirectTitle: "Official Watra Direct Booking",
      syncActiveBadge: "Sync with Booking.com: Active",
      channelManagerInfo: "All reservations are processed directly on our secure site. Our Channel Manager instantly blocks dates on Booking.com, eliminating any risk of overbooking.",
      cheaperThanOta: "10% cheaper than OTA portals",
      freeMonitoredParking: "Free monitored parking",
      personSingle: "guest",
      personsPlural: "guests",
      childrenNone: "none",
      childrenPlural: "children",
      nightSingle: "night",
      nightsPlural: "nights"
    }
  },
  sk: {
    common: {
      home: "Domov",
      perNight: "/ noc",
      perNightBreakfast: "/ noc s raňajkami",
      bookNow: "Rezervovať online",
      close: "Zavrieť",
      loading: "Načítava sa...",
      copied: "Skopírované!",
      copy: "Kopírovať",
      photosCount: (c) => `${c} fotografií`,
      upToPersons: (c) => `Do ${c} osôb`,
      allRooms: "Všetky",
      directDiscountBadge: "Garancia najnižšej ceny: -10% pri priamej rezervácii + bezplatné parkovanie",
      whyBookDirectTitle: "Prečo rezervovať priamo u nás?",
      whyBookDirectDesc: "Záruka najlepšej ceny (o 10% lacnejšie ako cez portály), parkovanie zdarma a uvítacia beskydská pálenka.",
      checkDates: "Overiť termíny",
      selectThisRoom: "Vybrať túto izbu",
      seeGallery: "Zobraziť galériu",
      openInGoogleMaps: "Otvoriť v Google Maps",
      navigateUs: "Navigovať k nám",
      picturesqueDesc: "Malebne položený v tichu smrekových lesov",
      live: "Naživo",
      bookStayDiscount: "Rezervovať pobyt (-10%)",
      adultsLabel: "Dospelí",
      adultsAge: "Vek 13+",
      childrenLabel: "Deti",
      childrenAge: "Vek 0-12 rokov",
      apply: "Použiť",
      calendarPreview: "Náhľad kalendára termínov",
      freeCancelNote: "Bezplatné storno do 7 dní pred príchodom"
    },
    packagesPage: {
      tag: "Špeciálne ponuky & Zľavové kódy",
      title: "Pobytové balíčky & Zľavy",
      subtitle: "Vyberte si hotový balíček s polpenziou, vírivkou a horskými aktivitami alebo využite aktívne zľavové kódy.",
      liveCampaignsTitle: "Aktuálne zľavové akcie",
      validityPrefix: "Platnosť:",
      promoCodeLabel: "Zľavový kód:",
      bookWithDiscount: "Rezervovať s touto zľavou",
      standardPackagesTitle: "Stále pobytové balíčky",
      priceFrom: "Cena balíčka od",
      selectPackage: "Vybrať balíček"
    },
    contactPage: {
      tag: "Kontakt • Príchod • Rezervácie",
      title: "Kontaktujte Watra Korbielów",
      subtitle: "Sme vám k dispozícii každý deň. Zavolajte nám, napíšte správu alebo nás navštívte v srdci Beskýd na úpätí Pilska.",
      phoneTitle: "Telefón & Recepcia",
      phoneHours: "Denne od 7:00 do 22:00",
      phoneSubtitle: "Denne od 7:00 do 22:00",
      emailTitle: "E-mailová adresa",
      emailDesc: "Odpovedáme čo najrýchlejšie",
      emailSubtitle: "Odpovedáme čo najrýchlejšie",
      locationTitle: "Lokalita strediska",
      locationRegion: "Žywiecke Beskydy • Poľsko",
      locationSubtitle: "Žywiecke Beskydy • Poľsko",
      address: "Graniczna 17, 34-335 Korbielów",
      formTitle: "Odoslať dopyt na recepciu",
      formSubtitle: "Vyplňte formulár – ozveme sa vám ohľadom dostupnosti izieb, rodinných osláv alebo skupinových pobytov.",
      formSuccessTitle: "Dopyt bol prijatý",
      formSuccessDesc: "Ďakujeme za kontakt. Váš dopyt bol uložený a recepcia ho nájde v správe hostí.",
      formSendAnother: "Odoslať ďalší dopyt",
      submitError: "Dopyt sa nepodarilo odoslať. Skúste to neskôr alebo nás kontaktujte telefonicky.",
      nameLabel: "Meno a priezvisko *",
      namePlaceholder: "napr. Ján Novák",
      phoneLabel: "Telefónne číslo *",
      phonePlaceholder: "+48 600 000 000",
      emailLabel: "E-mailová adresa *",
      emailPlaceholder: "vas@email.sk",
      datesLabel: "Plánovaný termín (voliteľné)",
      datesPlaceholder: "napr. 15.–20. februára (4 osoby)",
      messageLabel: "Správa / Otázka *",
      messagePlaceholder: "Napíšte vaše požiadavky, preferencie izieb, stravovania...",
      sending: "Odosiela sa...",
      submitBtn: "Odoslať dopyt do Watry",
      depositTitle: "Údaje k platbe zálohy",
      depositSubtitle: "Po potvrdení rezervácie recepciou uhraďte zálohu na nasledujúci bankový účet:",
      recipientLabel: "Príjemca",
      recipientValue: "Watra Korbielów – Rekreačné stredisko",
      bankLabel: "Banka",
      bankValue: "Bank Pekao SA",
      accountNumberLabel: "Číslo účtu (PLN)",
      transferTitleLabel: "Správa pre prijímateľa",
      transferTitleValue: "Záloha za pobyt, Meno a priezvisko, termín od .. do ..",
      directionsTitle: "Tipy na cestu autom",
      fromKatowiceLabel: "Z Katovíc / Sliezska:",
      fromKatowiceText: "Cez rýchlostnú cestu S1 do Żywca, potom po DW945 cez Jeleśniu priamo do Korbielowa (cca 90 km, 1h 20m).",
      fromKrakowLabel: "Z Krakova:",
      fromKrakowText: "Po DK52 cez Wadowice a Suchú Beskidzku, alebo po S7 do Lubnia a cez Rabku a Zawoju.",
      fromSlovakiaLabel: "Zo Slovenska (Orava):",
      fromSlovakiaText: "Hraničný priechod Oravská Polhora / Korbielów je vzdialený len 3 km od nášho areálu."
    },
    tripPlanner: {
      tag: "Google Maps • Presný plánovač trasy",
      viewLabel: "Zobrazenie:",
      roadmap: "Cestná mapa",
      satellite: "Satelit",
      title: "Poloha Watra Korbielów & Plánovač cesty",
      subtitle: "Skontrolujte našu polohu na Google Maps alebo zadajte východiskový bod (mesto, obec, ulica) a zistite presnú trasu a čas príchodu.",
      placeholder: "Zadajte mesto alebo obec (napr. Žilina, Námestovo, Dolný Kubín, Tvrdošín...)",
      clear: "Vymazať",
      useGps: "Použiť moju GPS polohu",
      gpsLocating: "Lokalizujem GPS...",
      calculating: "Výpočet trasy...",
      calculateBtn: "Vypočítať trasu",
      calculateRoute: "Vypočítať trasu",
      matchedAddresses: "Nájdené adresy a mestá",
      selectOrEnter: "Vyberte alebo stlačte Enter",
      houseNumber: "číslo domu",
      propertyNumber: "číslo domu",
      popularPoints: "Príklady východiskových bodov:",
      samplePoints: "Príklady východiskových bodov:",
      statusRoute: "Trasa:",
      statusDefault: "Watra Korbielów",
      routeToHeader: "Vypočítaná trasa jazdy:",
      routeLabel: "Vypočítaná trasa jazdy:",
      byCar: "autom",
      navGoogleMaps: "Navigovať v Google Maps",
      openGoogleMaps: "Otvoriť v Google Maps",
      distanceUnit: "km",
      resetMap: "Resetovať mapu",
      hideSteps: "Skryť podrobné navigačné pokyny",
      showSteps: (count) => `Zobraziť navigačné pokyny (${count} krokov)`,
      geoNotSupported: "Váš prehliadač nepodporuje geolokáciu.",
      geoPermissionDenied: "Prístup k polohe bol zamietnutý. Zadajte mesto manuálne.",
      geoUnavailable: "Nepodarilo sa určiť polohu. Zadajte mesto manuálne.",
      geoTimeout: "Časový limit na zistenie polohy vypršal.",
      geoGenericError: "Chyba pri získavaní GPS polohy.",
      inputEmptyError: "Zadajte východiskové mesto alebo adresu.",
      calculateError: "Nepodarilo sa vypočítať trasu. Skontrolujte zadanú adresu.",
      myLocation: "Moja poloha",
      mapTitle: "Google Maps — Watra Korbielów",
      resortName: "Rezort Watra Korbielów",
      nearbyLandmarks: "100 m k vleku Cypisek • Pilsko: 1 557 m n. m."
    },
    socialShare: {
      sharePrompt: "Zdieľajte túto zľavu s priateľmi:",
      whatsapp: "WhatsApp",
      facebook: "Facebook",
      twitter: "Post",
      copyLink: "Kopírovať odkaz",
      copied: "Skopírované!",
      shareBtn: "Zdieľať",
      shareText: (title, discount, code) =>
        `🏔️ Pozri si zľavu vo Watra Korbielów: "${title}"! Získaj zľavu -${discount}% s kódom: ${code}.`
    },
    roomsPage: {
      tag: "Ubytovanie • Beskydský pokoj",
      title: "Izby & Apartmány v Korbielowe",
      subtitle: "Svetlé, príjemné izby s výhľadom na smrekové lesy a hory. Bohaté raňajky v cene každého pobytu.",
      description: "Všetky izby majú vlastnú kúpeľňu so sprchovacím kútom, TV, rýchle Wi-Fi a uteráky. V cene každého pobytu sú zahrnuté bohaté bufetové raňajky.",
      bestPriceGuarantee: "Garancia najnižšej ceny: -10% pri priamej rezervácii + bezplatné parkovanie",
      priceGuarantee: "Garancia najnižšej ceny: -10% pri priamej rezervácii + bezplatné parkovanie",
      filterAll: (c) => `Všetky (${c})`,
      allCategories: (c) => `Všetky (${c})`,
      filterDouble: "2-lôžkové izby",
      doubleRooms: "2-lôžkové izby",
      filterFamily: "Rodinné štúdiá (3-4 os.)",
      familyStudios: "Rodinné štúdiá (3-4 os.)",
      filterSuite: "Apartmány s terasou",
      apartments: "Apartmány s terasou",
      zoomPhoto: "Zväčšiť fotografiu",
      catDouble: "2-lôžková izba",
      doubleCategory: "2-lôžková izba",
      catFamily: "Rodinné štúdio",
      familyCategory: "Rodinné štúdio",
      catSuite: "Apartmán",
      suiteCategory: "Apartmán",
      maxGuests: (c) => `Max. ${c} hostí`,
      bedConfigLabel: "Usporiadanie postelí:",
      bedLayout: "Usporiadanie postelí:",
      bookingComPrice: "Booking.com:",
      bookingPrice: (amount) => `Booking.com: ${amount} PLN`,
      saveDirect: (amount) => `Ušetríte ${amount} PLN/noc pri priamej rezervácii`,
      perNightWithBreakfast: "/ noc s raňajkami",
      bookThisRoom: "Rezervovať túto izbu",
      bookRoomBtn: "Rezervovať túto izbu"
    },
    aboutPage: {
      tag: "O nás • História & Poloha",
      title: "Watra Korbielów – Pohostinnosť v srdci hôr",
      lead: "Watra je tradičná horská vatra, okolo ktorej sa po generácie schádzali ľudia, aby sa podelili o príbehy, teplo a jedlo. Z tohto ducha vzniklo stredisko Watra – miesto, kde sa budete cítiť ako u blízkych priateľov.",
      storyTitle: "Tradícia, horská príroda a pohodlie",
      storyP1: "Stredisko Watra sa nachádza v obci Korbielów v malebnom údolí na úpätí vrchu Pilsko (1557 m n.m.) – druhého najvyššieho vrcholu v Żywieckych Beskydách. Už viac ako 20 rokov poskytujeme ubytovanie, reštauračné služby a relax vo vonkajšej vírivke a fínskej saune.",
      storyP2: "V zime hostia oceňujú bezprostrednú blízkosť vlekov Cypisek a Andiamo (iba 100 metrov), čo je ideálne pre bezpečné lyžovanie detí. V lete je Watra oázou pokoja s čistým vzduchom a vôňou lesa.",
      experienceYears: "20+ rokov",
      experienceLabel: "skúseností v obsluhe areálu",
      elevationValue: "1557 m",
      elevationLabel: "vrchol Pilska nad nami",
      distancesTitle: "Poloha & Vzdialenosti od kľúčových miest",
      distancesSubtitle: "Vďaka výhodnej polohe pri ul. Graniczna majú naši hostia rýchly prístup k zjazdovkám, chodníkom a slovenskej hranici.",
      galleryTitle: "Galéria strediska & okolia",
      gallerySubtitle: "Skutočné fotografie nášho areálu, reštaurácie a záhrady",
      bookStayBtn: "Rezervovať pobyt",
      distances: [
        { name: 'Vlek "Cypisek" (pre začiatočníkov a deti)', dist: '100 m' },
        { name: 'Vlek "Andiamo" & lyžiarska škola', dist: '120 m' },
        { name: 'Dolná stanica lanovky na Pilsko (Polana Kamienna)', dist: '900 m' },
        { name: 'Turistický chodník na Halu Miziowu (1330 m)', dist: 'Pri objekte' },
        { name: 'Vrchol Pilska (1557 m n.m.)', dist: '2h 15m pešo' },
        { name: 'Hraničný priechod so Slovenskom (Oravská Polhora)', dist: '3 km' },
        { name: 'Oravský hrad (Slovensko)', dist: '45 km' },
        { name: 'Żywiec (Múzeum pivovaru, Zámocký park)', dist: '25 km' }
      ]
    },
    seasonsPage: {
      tag: "Štyri ročné obdobia v Beskydách",
      title: "Zima na svahu & Leto na chodníkoch",
      subtitle: "Korbielów je jedným z najkrajších horských kútov. V zime mekka lyžiarov s bohatým snehom až do jari, v lete oáza panenskej prírody a úchvatných výhľadov z Pilska.",
      winterTabBtn: "Zima vo Watra (Lyže & Pilsko)",
      summerTabBtn: "Leto vo Watra (Túry & Bicykle)",
      winterBadge: "100 m k vlekom • Cypisek & Andiamo",
      winterHeading: "Lyžovanie hneď pred dverami",
      winterLead: "Pre rodiny s deťmi a začínajúcich lyžiarov je poloha Watry darom. Vleky Cypisek (100 m) a Andiamo (120 m) s umelým zasnežovaním a osvetlením umožňujú výborné lyžovanie bez kolón.",
      winterPoints: [
        "Vyhrievaná lyžiareň so sušičmi lyžiarok",
        "20% zľava v partnerskej požičovni lyží a snowboardov",
        "Možnosť rezervácie certifikovaných inštruktorov na mieste",
        "Len 900 m k hlavnej sedačkovej lanovke Pilsko-Jontek"
      ],
      bookWinterBtn: "Rezervovať lyžiarsky pobyt (-10%)",
      slopeSpec1Val: "20 km",
      slopeSpec1Label: "Lyžiarskych tratí",
      slopeSpec1Desc: "Rôznorodé trate od miernych pre deti až po čiernu zjazdovku FIS z vrcholu.",
      slopeSpec2Val: "1557 m n.m.",
      slopeSpec2Label: "Najvyšší lyžiarsky bod",
      slopeSpec2Desc: "Pilsko je druhý najvyšší vrch Beskýd s výbornými snehovými podmienkami do neskorej jari.",
      slopeSpec3Val: "10 Vlekov",
      slopeSpec3Label: "Infraštruktúra Pilska",
      slopeSpec3Desc: "Sedačkové lanovky a vleky obsluhujúce Halu Szczawiny a Halu Miziowu.",
      summerBadge: "Turistické chodníky • Čistý horský vzduch",
      summerHeading: "Pešie túry, bicykle a pokoj",
      summerLead: "V lete Korbielów očarí vôňou bylín a zurčaním potokov. Priamo od Watry vyrazte na Halu Miziowu (1330 m) a na vrchol Pilska s výhľadom na Tatry a Oravu.",
      summerPoints: [
        "Turistické trasy: Pilsko (1557 m), Hala Rysianka, Babia hora",
        "Cyklotrasy MTB a singletracky v Korbielowe a na Orave",
        "Veľká zelená záhrada s ležadlami, grilom a ihriskom",
        "Vonkajšia vírivka v záhrade v prevádzke aj v lete"
      ],
      bookSummerBtn: "Rezervovať letnú dovolenku (-10%)"
    },
    wellnessPage: {
      tag: "SPA & Regeneračná zóna",
      title: "Vonkajšia vírivka & Fínska sauna",
      lead: "Kúpeľ v horúcej vode na čerstvom horskom vzduchu pod hviezdami je jedným z najkrajších zážitkov vo Watra Korbielów.",
      jacuzziBadge: "Celoročná prevádzka • Zima a Leto",
      jacuzziHeading: "Vonkajšia vírivka v lesnom prostredí",
      jacuzziLead: "Naša hydromasážna vírivka pojme až 6 osôb. Voda je vyhrievaná na 38°C, čo v zime pri padajúcom snehu prináša dokonalé uvoľnenie pre telo aj myseľ.",
      jacuzziPoints: [
        "Teplota vody: 38°C počas celého roka",
        "Pokročilé masážne trysky na šiju, chrbát a nohy",
        "Možnosť súkromnej rezervácie s fľašou vína",
        "Atmosférické LED osvetlenie s výhľadom na les"
      ],
      bookJacuzziBtn: "Rezervovať pobyt s vírivkou",
      saunaBadge: "Pohyb • Regenerácia • Pohoda",
      saunaHeading: "Fitness a pohoda",
      saunaLead: "Bežecký pás a rotoped podporia kondíciu, oddychová zóna zas načerpá energiu po horských aktivitách.",
      saunaPoints: [
        "Aromaterapia, ochladzovacia sprcha a pohodlné ležadlá",
        "Saunové plachty a uteráky v cene"
      ],
      activities: [
        { title: "Soľná jaskyňa", description: "Prírodná soľ vytvára prímorskú mikroklímu vhodnú na dýchanie aj odpočinok." },
        { title: "Tradičná fínska sauna", description: "Sosnová sauna 85–95°C podporuje regeneráciu; aromaterapia, sprcha, ležadlá a textílie v cene." },
        { title: "Fitness miestnosť", description: "Bežecký pás a rotoped umožňujú cvičiť za každého počasia." },
        { title: "Relaxačná kaďa", description: "Teplý kúpeľ v drevenej kadi uvoľní svaly po horskej túre." },
        { title: "Ochladzovacia kaďa", description: "Studený kúpeľ po saune povzbudí krvný obeh a dodá energiu." },
        { title: "Oddychový kútik", description: "Prútené kreslá a horská fototapeta pozývajú na pokojný odpočinok." }
      ],
      hoursTitle: "Otváracie hodiny",
      hoursDesc: "Wellness zóna je otvorená denne od 16:00 do 22:00. Na požiadanie je možné skoršie zapnutie.",
      safetyTitle: "Zdravie & Hygiena",
      safetyDesc: "Voda vo vírivke je nepretržite filtrovaná a kontrolovaná podľa najvyšších noriem.",
      vipTitle: "Súkromné večerné vstupy",
      vipDesc: "Pre páry ponúkame romantické balíčky s privátnou rezerváciou po 21:00 pri sviečkach a hudbe."
    },
    restaurantPage: {
      tag: "Reštaurácia • Koliba • Grilovací altánok",
      title: "Autentické chute Żywieckych Beskýd",
      subtitle: "V našej kuchyni spájame goralské tradície s najvyššou kvalitou lokálnych surovín. Vítame ubytovaných hostí aj turistov z túr.",
      storyHeading: "Tradičná pohostinnosť a domáca kuchyňa",
      storyP1: "Interiér reštaurácie je zariadený v teplom tradičnom štýle – regionálna pohostinnosť a príjemná atmosféra vytvárajú domáci pocit. Každé ráno podávame bohaté bufetové raňajky s domácimi údeninami a teplými jedlami.",
      storyP2: "Poobede a večer vás pozývame na jedlá à la carte a regionálne nápoje: bylinné likéry, varené víno a miestne pivo.",
      breakfastTitle: "Bufetové raňajky",
      breakfastHours: "8:00 – 10:00 (v cene ubytovania)",
      carteTitle: "Reštaurácia à la carte",
      carteHours: "12:00 – 21:00 denne",
      specialsTitle: "Tradičné špeciality z našej komory",
      specialsSubtitle: "Čerstvé lokálne produkty a poctivo pripravené jedlá",
      heritageBadge: "Regionálne kulinárske dedičstvo",
      menuTitle: "Jedálny lístok reštaurácie Watra",
      menuSubtitle: "Všetky jedlá pripravujeme čerstvé na objednávku",
      grillHeading: "Grilovací prístrešok & Goralské posedenia",
      grillLead: "Organizujeme posedenia pri ohni so živou goralskou hudbou, pečením klobás a prasiatka.",
      grillPoints: [
        "Zastrešený grilovací prístrešok pre 60 osôb",
        "Živá hudba a goralské príbehy",
        "Pečenie prasiatka alebo kotlíkový guláš",
        "Ideálne pre firemné a rodinné stretnutia"
      ],
      eventInquiryBtn: "Opýtať sa na organizáciu akcie"
    },
    wellnessDiningExtra: {
      wellnessTag: "Zóna oddychu & zdravia",
      recreationTitle: "Regenerácia & Rekreácia v rezorte",
      recreationDesc: "Po aktívnom dni na svahu alebo beskydských chodníkoch načerpajte sily v záhradnej vírivke a fínskej saune. Hostia majú k dispozícii aj herňu s biliardom a stolným tenisom.",
      saunaItem: "Tradičná suchá fínska sauna",
      jacuzziItem: "Vonkajšia vyhrievaná vírivka",
      billiardItem: "Biliardový stôl a klubovňa",
      pingPongItem: "Stolný tenis (ping-pong)",
      diningTag: "Chute beskydskej kuchyne",
      grillBanquetsTitle: "Grilovací prístrešok & Oslavy",
      kwasnica: "🍲 Kapustnica na rebierkach",
      placki: "������ Zbojnícke placky",
      oscypek: "🧀 Oštiepok s brusnicami",
      pstrag: "🐟 Pstruh z horského potoka",
      bookDiningBtn: "Rezervovať pobyt so stravou"
    },
    heroExtra: {
      videoBtn: "Objaviť stredisko",
      forecastTitle: "7-dňová predpoveď • Pilsko & Korbielów",
      forecastLive: "Aktualizované naživo • Open-Meteo API",
      pilskoPeak: "Vrchol Pilsko (1557 m)",
      watraValley: "Dolina Watra (~650 m)",
      tempFeels: "Pocitová teplota:",
      wind: "Vietor:",
      humidity: "Vlhkosť:",
      skiCondition: "Lyžiarske podmienky:",
      hikeCondition: "Turistické podmienky:",
      videoModalTitle: "Watra Korbielów • Objavte naše stredisko",
      videoModalSubtitle: "Beskid Żywiecki • Zjazdovka Pilsko 1557 m n.m.",
      videoModalPerks: "Izby • Zjazdovky • Reštaurácia • Vírivka pod hviezdami",
      bookPromoBtn: "Rezervovať so zľavou",
      allCampaigns: (c) => `Všetky (${c})`,
      promoCodeLabel: "Zľavový kód:",
      videoLoading: "Načítavanie videa..."
    },
    footerExtra: {
      brandDescriptor: "Rezort • Reštaurácia",
      aboutSnippet: "Watra Korbielów je celoročný horský rezort v Žywieckych Beskydách, na úpätí vrchu Pilsko (1 557 m). Ponúka lyžiarske vleky vzdialené 100 m, vírivku pod hviezdami, tradičnú goralskú kuchyňu a pohodlné ubytovanie s 10 % zľavou pri priamej rezervácii.",
      directGuarantee: "Záruka priamej rezervácie: zľava 10% a parkovanie zdarma",
      depositNote: "Do správy pre prijímateľa uveďte priezvisko a termín pobytu.",
      pagesTitle: "Stránky & Sekcie",
      homeLink: "Hlavná stránka",
      aboutLink: "O nás & Poloha",
      roomsLink: "Izby & Cenník",
      seasonsLink: "Zima & Leto v Beskydách",
      wellnessLink: "Vírivka & Sauna",
      restaurantLink: "Reštaurácia & Gril",
      packagesLink: "Balíčky & Zľavy",
      contactLink: "Kontakt & Príchod",
      adminLink: "Administrácia CMS",
      bookOnlineBtn: "Rezervovať online",
      rightsReserved: "Všetky práva vyhradené."
    },
    seasonalExtra: {
      winterSeasonTag: "Zimná sezóna v Korbielove (December – Apríl)",
      snowGuarantee: "Garancia Snehu",
      pilskoMicroclimate: "Mikroklíma Pilska",
      pilskoMicroclimateDesc: "Vďaka nadmorskej výške 1557 m n.m. a špecifickej mikroklíme sa sneh na Pilsku drží často až do mája.",
      slopeDistance: "100 m od dverí k vleku",
      summerSeasonTag: "Letná sezóna v Beskydách (Máj – Október)",
      mountainTrails: "Horské Chodníky",
      trekkingEnduro: "Trekking & Enduro",
      trekkingEnduroDesc: "Trasy smerom na Halu Miziowu, Rysianku a Babiu horu začínajú priamo pri stredisku. Nádherné panorámy Tatier a Beskýd.",
      gardenGrill: "Oddychová záhrada & Grilovací prístrešok"
    },
    bookingModalExtra: {
      bookingComSyncSuccess: "Synchronizácia s Booking.com: Termín bol okamžite zablokovaný, čím sa predchádza duplicitnej rezervácii.",
      checkInFrom: "(od 15:00)",
      checkOutUntil: "(do 11:00)",
      occupiedDates: (inD, outD) => `Obsadený termín: ${inD} do ${outD}.`,
      priceGuaranteeBadge: "Garancia Ceny",
      childrenAgeLabel: "Deti (0-12 rokov)",
      selectRoomLabel: "Vybrať Izbu",
      perPersonPerNight: "PLN/os./noc",
      promoActive: (d) => `AKTÍVNY (-${d}%)`,
      promoAppliedSuccess: (title, d) => `Uplatnená zľava -${d}%! (${title})`,
      standardPriceForNights: (n) => `Štandardná cena (${n} ${n === 1 ? 'noc' : 'noci'}):`,
      includesBreakfast: "vrátane raňajok",
      noBreakfast: "bez raňajok",
      plusDinner: " + večera",
      freeParkingIncluded: " & parkovanie zdarma",
      officialDirectTitle: "Oficiálna Priama Rezervácia Watra",
      syncActiveBadge: "Sync s Booking.com: Aktívny",
      channelManagerInfo: "Všetky rezervácie prebiehajú priamo cez náš web. Integrovaný Channel Manager okamžite blokuje termíny na Booking.com a zabraňuje overbookingu.",
      cheaperThanOta: "O 10% lacnejšie ako na portáloch",
      freeMonitoredParking: "Bezplatné monitorované parkovisko",
      personSingle: "osoba",
      personsPlural: "osoby",
      childrenNone: "žiadne",
      childrenPlural: "deti",
      nightSingle: "noc",
      nightsPlural: "noci"
    }
  },
  de: {
    common: {
      home: "Startseite",
      perNight: "/ Nacht",
      perNightBreakfast: "/ Nacht mit Frühstück",
      bookNow: "Online buchen",
      close: "Schließen",
      loading: "Laden...",
      copied: "Kopiert!",
      copy: "Kopieren",
      photosCount: (c) => `${c} Fotos`,
      upToPersons: (c) => `Bis zu ${c} Personen`,
      allRooms: "Alle",
      directDiscountBadge: "Bestpreisgarantie: -10% Direktbuchungsrabatt + kostenfreies Parken",
      whyBookDirectTitle: "Warum direkt bei uns buchen?",
      whyBookDirectDesc: "Garantierter Bestpreis (10% günstiger als auf Portalen), kostenloser Parkplatz und ein Willkommens-Kräuterlikör aus den Bergen.",
      checkDates: "Termine prüfen",
      selectThisRoom: "Dieses Zimmer wählen",
      seeGallery: "Galerie ansehen",
      openInGoogleMaps: "In Google Maps öffnen",
      navigateUs: "Zu uns navigieren",
      picturesqueDesc: "Malerisch gelegen in der Ruhe der Fichtenwälder",
      live: "Live",
      bookStayDiscount: "Aufenthalt buchen (-10%)",
      adultsLabel: "Erwachsene",
      adultsAge: "Ab 13 Jahren",
      childrenLabel: "Kinder",
      childrenAge: "Alter 0-12 Jahre",
      apply: "Anwenden",
      calendarPreview: "Terminkalender anzeigen",
      freeCancelNote: "Kostenfreie Stornierung bis 7 Tage vor Anreise"
    },
    packagesPage: {
      tag: "Sonderangebote & Rabattcodes",
      title: "Urlaubspakete & Aktionen",
      subtitle: "Wählen Sie ein Rundum-Sorglos-Paket mit Halbpension, Whirlpool und Bergaktivitäten oder nutzen Sie aktive Gutscheincodes.",
      liveCampaignsTitle: "Aktuelle Rabattaktionen",
      validityPrefix: "Gültigkeit:",
      promoCodeLabel: "Gutscheincode:",
      bookWithDiscount: "Mit Rabatt buchen",
      standardPackagesTitle: "Beliebte Aufenthaltspakete",
      priceFrom: "Paketpreis ab",
      selectPackage: "Paket wählen"
    },
    contactPage: {
      tag: "Kontakt • Anfahrt • Reservierung",
      title: "Kontaktieren Sie Watra Korbielów",
      subtitle: "Wir sind täglich für Sie da. Rufen Sie uns an, schreiben Sie eine E-Mail oder besuchen Sie uns am Fuße des Pilsko in den Beskiden.",
      phoneTitle: "Telefon & Rezeption",
      phoneHours: "Täglich 7:00 – 22:00 Uhr",
      phoneSubtitle: "Täglich 7:00 – 22:00 Uhr",
      emailTitle: "E-Mail-Adresse",
      emailDesc: "Wir antworten schnellstmöglich",
      emailSubtitle: "Wir antworten schnellstmöglich",
      locationTitle: "Standort des Resorts",
      locationRegion: "Saybuscher Beskiden • Polen",
      locationSubtitle: "Saybuscher Beskiden • Polen",
      address: "Graniczna-Straße 17, 34-335 Korbielów",
      formTitle: "Anfrage an die Rezeption senden",
      formSubtitle: "Füllen Sie das Formular aus – wir melden uns umgehend bezüglich Zimmerverfügbarkeit, Familienfeiern oder Gruppenaufenthalten.",
      formSuccessTitle: "Anfrage eingegangen",
      formSuccessDesc: "Vielen Dank für Ihre Nachricht. Ihre Anfrage wurde gespeichert und ist für die Rezeption in der Gästeverwaltung verfügbar.",
      formSendAnother: "Weitere Anfrage senden",
      submitError: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns telefonisch.",
      nameLabel: "Vor- und Nachname *",
      namePlaceholder: "z.B. Max Mustermann",
      phoneLabel: "Telefonnummer *",
      phonePlaceholder: "+48 600 000 000",
      emailLabel: "E-Mail-Adresse *",
      emailPlaceholder: "sie@beispiel.de",
      datesLabel: "Geplanter Reisezeitraum (optional)",
      datesPlaceholder: "z.B. 15.–20. Februar (4 Personen)",
      messageLabel: "Nachricht / Frage *",
      messagePlaceholder: "Ihre Wünsche, Zimmerpräferenzen, Ernährungsbedürfnisse...",
      sending: "Wird gesendet...",
      submitBtn: "Anfrage an Watra senden",
      depositTitle: "Bankverbindung für Anzahlung",
      depositSubtitle: "Nach Buchungsbestätigung durch die Rezeption überweisen Sie bitte die Anzahlung auf folgendes Bankkonto:",
      recipientLabel: "Empfänger",
      recipientValue: "Watra Korbielów – Ferienresort",
      bankLabel: "Bank",
      bankValue: "Bank Pekao SA",
      accountNumberLabel: "Kontonummer (PLN)",
      transferTitleLabel: "Verwendungszweck",
      transferTitleValue: "Anzahlung Aufenthalt, Name, Zeitraum von .. bis ..",
      directionsTitle: "Anfahrtshinweise",
      fromKatowiceLabel: "Aus Richtung Kattowitz / Schlesien:",
      fromKatowiceText: "Über die Schnellstraße S1 nach Żywiec, dann auf der DW945 über Jeleśnia direkt nach Korbielów (ca. 90 km, 1h 20m).",
      fromKrakowLabel: "Aus Richtung Krakau:",
      fromKrakowText: "Über die DK52 via Wadowice und Sucha Beskidzka, oder S7 bis Lubień und via Rabka und Zawoja.",
      fromSlovakiaLabel: "Aus der Slowakei (Orava):",
      fromSlovakiaText: "Der Grenzübergang Oravská Polhora / Korbielów liegt nur 3 km von unserem Resort entfernt."
    },
    tripPlanner: {
      tag: "Google Maps • Exakter Routenplaner",
      viewLabel: "Ansicht:",
      roadmap: "Straßenkarte",
      satellite: "Satellit",
      title: "Standort Watra Korbielów & Routenplaner",
      subtitle: "Überprüfen Sie unseren Standort auf Google Maps oder geben Sie Ihren Startort (Stadt, Ort, Straße) ein, um Route, Fahrzeit und Wegbeschreibung zu berechnen.",
      placeholder: "Startadresse, Ort oder Stadt eingeben (z.B. Kattowitz, Krakau, Bielsko-Biała, Wien...)",
      clear: "Löschen",
      useGps: "Meinen GPS-Standort verwenden",
      gpsLocating: "GPS wird ermittelt...",
      calculating: "Route wird berechnet...",
      calculateBtn: "Route berechnen",
      calculateRoute: "Route berechnen",
      matchedAddresses: "Passende Adressen und Orte",
      selectOrEnter: "Auswählen oder Enter drücken",
      houseNumber: "Hausnummer",
      propertyNumber: "Hausnummer",
      popularPoints: "Beispiel-Startpunkte:",
      samplePoints: "Beispiel-Startpunkte:",
      statusRoute: "Route:",
      statusDefault: "Watra Korbielów",
      routeToHeader: "Berechnete Fahrtroute:",
      routeLabel: "Berechnete Fahrtroute:",
      byCar: "mit dem Auto",
      navGoogleMaps: "In Google Maps navigieren",
      openGoogleMaps: "In Google Maps öffnen",
      distanceUnit: "km",
      resetMap: "Karte zurücksetzen",
      hideSteps: "Wegbeschreibung ausblenden",
      showSteps: (count) => `Detaillierte Wegbeschreibung anzeigen (${count} Schritte)`,
      geoNotSupported: "Ihr Browser unterstützt keine Geolokalisierung.",
      geoPermissionDenied: "Standortzugriff verweigert. Bitte Ort manuell eingeben.",
      geoUnavailable: "Standort konnte nicht ermittelt werden.",
      geoTimeout: "Zeitüberschreitung bei der Standortabfrage.",
      geoGenericError: "Fehler beim Abrufen der GPS-Koordinaten.",
      inputEmptyError: "Bitte geben Sie einen Startort oder eine Adresse ein.",
      calculateError: "Route konnte nicht berechnet werden. Bitte Eingabe prüfen.",
      myLocation: "Mein Standort",
      mapTitle: "Google Maps — Watra Korbielów",
      resortName: "Watra Korbielów Resort",
      nearbyLandmarks: "100 m zum Skilift Cypisek • Pilsko: 1.557 m ü. d. M."
    },
    socialShare: {
      sharePrompt: "Diesen Rabatt mit Freunden teilen:",
      whatsapp: "WhatsApp",
      facebook: "Facebook",
      twitter: "Post",
      copyLink: "Link kopieren",
      copied: "Kopiert!",
      shareBtn: "Teilen",
      shareText: (title, discount, code) =>
        `🏔️ Schau dir dieses Angebot im Watra Korbielów an: "${title}"! Erhalte -${discount}% Rabatt mit dem Code: ${code}.`
    },
    roomsPage: {
      tag: "Unterkunft • Beskidenflair",
      title: "Zimmer & Apartments in Korbielów",
      subtitle: "Helle, ruhige Zimmer mit Blick auf Tannenwälder und Berggipfel. Reichhaltiges Frühstücksbuffet inklusive.",
      description: "Alle Zimmer verfügen über ein eigenes Bad mit Dusche, TV, schnelles WLAN und Handtücher. Ein reichhaltiges Frühstücksbuffet ist in jedem Aufenthalt inbegriffen.",
      bestPriceGuarantee: "Bestpreisgarantie: -10% bei Direktbuchung + kostenfreies Parken",
      priceGuarantee: "Bestpreisgarantie: -10% bei Direktbuchung + kostenfreies Parken",
      filterAll: (c) => `Alle Zimmer (${c})`,
      allCategories: (c) => `Alle Zimmer (${c})`,
      filterDouble: "Doppelzimmer",
      doubleRooms: "Doppelzimmer",
      filterFamily: "Familienstudios (3-4 Pers.)",
      familyStudios: "Familienstudios (3-4 Pers.)",
      filterSuite: "Apartments mit Terrasse",
      apartments: "Apartments mit Terrasse",
      zoomPhoto: "Foto vergrößern",
      catDouble: "Doppelzimmer",
      doubleCategory: "Doppelzimmer",
      catFamily: "Familienstudio",
      familyCategory: "Familienstudio",
      catSuite: "Apartment",
      suiteCategory: "Apartment",
      maxGuests: (c) => `Max. ${c} Gäste`,
      bedConfigLabel: "Bettenaufteilung:",
      bedLayout: "Bettenaufteilung:",
      bookingComPrice: "Booking.com:",
      bookingPrice: (amount) => `Booking.com: ${amount} PLN`,
      saveDirect: (amount) => `Sie sparen ${amount} PLN/Nacht bei Direktbuchung`,
      perNightWithBreakfast: "/ Nacht mit Frühstück",
      bookThisRoom: "Dieses Zimmer buchen",
      bookRoomBtn: "Dieses Zimmer buchen"
    },
    aboutPage: {
      tag: "Über uns • Geschichte & Lage",
      title: "Watra Korbielów – Gastfreundschaft im Herzen der Berge",
      lead: "Eine 'Watra' ist ein traditionelles Bergfeuer, um das sich Generationen versammelten, um Wärme, Geschichten und Mahlzeiten zu teilen. Aus diesem Geist entstand unser Resort in Korbielów – ein Ort, an dem sich jeder Gast wie bei guten Freunden fühlt.",
      storyTitle: "Tradition, Berglandschaft und Wohnkomfort",
      storyP1: "Das Resort Watra liegt in Korbielów im malerischen Tal des Glinna-Flusses, direkt am Fuße des Pilsko (1557 m ü.d.M.) – dem zweithöchsten Gipfel der Żywiecer Beskiden. Seit über 20 Jahren führen wir unser Haus mit Leidenschaft, Restaurantbetrieb und Wellnessbereich mit Außen-Whirlpool und finnischer Sauna.",
      storyP2: "Im Winter schätzen unsere Gäste die Nähe zu den Skiliften Cypisek und Andiamo (nur 100 m entfernt). Im Sommer verwandelt sich Watra in eine Oase der Ruhe mit würziger Bergluft und plätschernden Gebirgsbächen.",
      experienceYears: "20+ Jahre",
      experienceLabel: "Erfahrung in der Gastfreundschaft",
      elevationValue: "1557 m",
      elevationLabel: "Gipfelhöhe des Pilsko über uns",
      distancesTitle: "Lage & Entfernungen zu wichtigen Punkten",
      distancesSubtitle: "Durch die verkehrsgünstige Lage an der ul. Graniczna erreichen Sie Skilifte, Wanderwege und die slowakische Grenze in wenigen Minuten.",
      galleryTitle: "Galerie des Resorts & der Region",
      gallerySubtitle: "Authentische Aufnahmen unseres Resorts, Restaurants und Gartens",
      bookStayBtn: "Aufenthalt buchen",
      distances: [
        { name: 'Schlepplift "Cypisek" (für Anfänger und Kinder)', dist: '100 m' },
        { name: 'Tellerlift "Andiamo" & lizenzierte Skischule', dist: '120 m' },
        { name: 'Talstation der Pilsko-Sesselbahnen (Polana Kamienna)', dist: '900 m' },
        { name: 'Wanderweg zur Hala Miziowa (1330 m)', dist: 'Direkt am Haus' },
        { name: 'Gipfel des Pilsko (1557 m ü.d.M.)', dist: '2h 15m zu Fuß' },
        { name: 'Grenzübergang zur Slowakei (Oravská Polhora)', dist: '3 km' },
        { name: 'Burg Orava (Slowakei)', dist: '45 km' },
        { name: 'Żywiec (Brauereimuseum, Schlosspark)', dist: '25 km' }
      ]
    },
    seasonsPage: {
      tag: "Vier Jahreszeiten in den Beskiden",
      title: "Winter auf der Piste & Sommer auf Wanderwegen",
      subtitle: "Korbielów ist einer der schönsten Gebirgsorte Polens. Im Winter ein schneesicheres Skiparadies mit Schneegarantie bis ins Frühjahr, im Sommer eine Oase unberührter Natur mit Panoramablicken vom Pilsko.",
      winterTabBtn: "Winter in Watra (Ski & Pilsko)",
      summerTabBtn: "Sommer in Watra (Wandern & Bike)",
      winterBadge: "100 m zu den Skiliften • Cypisek & Andiamo",
      winterHeading: "Skifahren direkt vor der Haustür",
      winterLead: "Für Familien mit Kindern und Skianfänger ist die Lage von Watra ein echter Schatz. Der Schlepplift „Cypisek“ (100 m) und der Tellerlift „Andiamo“ (120 m) mit Flutlicht und Beschneiung bieten stressfreien Skispaß ohne Stau.",
      winterPoints: [
        "Beheizter Skiraum mit Skischuhtrocknern",
        "20% Rabatt beim Partnerskiverleih für Ski & Snowboards",
        "Qualifizierte Skilehrer direkt vor Ort buchbar",
        "Nur 900 m zur Hauptsesselbahn des Skigebiets Pilsko-Jontek"
      ],
      bookWinterBtn: "Skiurlaub buchen (-10%)",
      slopeSpec1Val: "20 km",
      slopeSpec1Label: "Skipisten",
      slopeSpec1Desc: "Abwechslungsreiche Pisten: von sanften Hängen für Kinder bis zur schwarzen FIS-Gipfelabfahrt.",
      slopeSpec2Val: "1557 m ü.d.M.",
      slopeSpec2Label: "Höchster Skipunkt",
      slopeSpec2Desc: "Der Pilsko ist der zweithöchste Gipfel der Beskiden mit Schneesicherheit bis Ende April.",
      slopeSpec3Val: "10 Skilifte",
      slopeSpec3Label: "Pilsko-Infrastruktur",
      slopeSpec3Desc: "Sesselbahnen und Schlepplifte zur Hala Szczawiny, Hala Miziowa und Kopiec.",
      summerBadge: "Wanderwege • Frische Bergluft",
      summerHeading: "Wandern, Mountainbiken & Ruhe",
      summerLead: "Im Sommer besticht Korbielów durch himmlische Stille und reine Natur. Wandern Sie direkt von Watra zur Hala Miziowa (1330 m) und weiter zum Gipfel des Pilsko mit Aussicht auf die Hohe Tatra.",
      summerPoints: [
        "Wanderrouten: Pilsko (1557 m), Hala Rysianka, Hala Lipowska, Babia Góra",
        "MTB-Trails und Singletracks in Korbielów und auf der Orava",
        "Großer Resortgarten mit Sonnenliegen, Grillhütte und Spielplatz",
        "Beheizter Außen-Whirlpool im Garten auch im Sommer in Betrieb"
      ],
      bookSummerBtn: "Sommerurlaub buchen (-10%)"
    },
    wellnessPage: {
      tag: "SPA & Erholungsbereich",
      title: "Außen-Whirlpool & Finnische Sauna",
      lead: "Ein Bad im heißen Wasser an der frischen Gebirgsluft unter dem funkelnden Beskidenhimmel ist ein unvergessliches Highlight für jeden Gast.",
      jacuzziBadge: "Ganzjährig geöffnet • Winter & Sommer",
      jacuzziHeading: "Außen-Whirlpool mit Waldblick",
      jacuzziLead: "Unser Hydromassage-Whirlpool bietet bequem Platz für bis zu 6 Personen. Das Wasser ist ganzjährig auf 38°C erwärmt – an verschneiten Winterabenden ein unvergleichlicher Genuss.",
      jacuzziPoints: [
        "Wassertemperatur: 38°C das ganze Jahr über",
        "Massagedüsen für Nacken, Rücken und Füße",
        "Private Abendreservierungen mit Wein buchbar",
        "Stimmungsvolle LED-Beleuchtung mit Blick auf den Fichtenwald"
      ],
      bookJacuzziBtn: "Aufenthalt mit Whirlpool buchen",
      saunaBadge: "Aktivität • Erholung • Wohlbefinden",
      saunaHeading: "Fitness & Wohlbefinden",
      saunaLead: "Laufband und Fahrradtrainer fördern die Fitness; im Ruhebereich tanken Sie nach Bergaktivitäten neue Kraft.",
      saunaPoints: [
        "Aromatherapie, Erlebnisduschen und bequeme Ruheliegen",
        "Saunatücher und -laken inklusive"
      ],
      activities: [
        { title: "Salzgrotte", description: "Natürliches Salz schafft ein meeresähnliches Mikroklima zum Durchatmen und Entspannen." },
        { title: "Traditionelle Finnische Sauna", description: "Kiefersauna bei 85–95°C fördert die Erholung; Aromatherapie, Duschen, Liegen und Textilien inklusive." },
        { title: "Fitnessraum", description: "Laufband und Fahrradtrainer ermöglichen Training bei jedem Wetter." },
        { title: "Entspannungsbadezuber", description: "Ein warmes Bad im Holzzuber lockert die Muskeln nach Bergwanderungen." },
        { title: "Kaltwasserbecken", description: "Das kalte Tauchbad nach der Sauna belebt den Kreislauf und gibt Energie." },
        { title: "Ruhebereich", description: "Korbsessel und Bergmotiv schaffen einen gemütlichen Ort zum Abschalten." }
      ],
      hoursTitle: "Öffnungszeiten",
      hoursDesc: "Der Wellnessbereich ist täglich von 16:00 bis 22:00 Uhr geöffnet. Frühere Aktivierung auf Anfrage möglich.",
      safetyTitle: "Gesundheit & Hygiene",
      safetyDesc: "Das Wasser im Whirlpool wird kontinuierlich gefiltert und nach strengsten Standards überwacht.",
      vipTitle: "Exklusive Abendstunden",
      vipDesc: "Für Paare bieten wir romantische Privatstunden nach 21:00 Uhr mit Kerzenschein und Musik an."
    },
    restaurantPage: {
      tag: "Restaurant • Wirtshaus • Grillhütte",
      title: "Authentische Aromen der Beskiden",
      subtitle: "Wir verbinden echte Goralen-Traditionen mit hochwertigen Zutaten regionaler Erzeuger. Herzlich willkommen für Hausgäste und Wanderer vom Pilsko.",
      storyHeading: "Gelebte Gastfreundschaft und Hausmannskost",
      storyP1: "Der Gastraum ist im warmen, traditionellen Holzstil eingerichtet. Jeden Morgen servieren wir ein reichhaltiges Frühstücksbuffet mit regionalen Wurstwaren, frischem Brot und warmen Speisen.",
      storyP2: "Nachmittags und abends verwöhnen wir Sie mit À-la-carte-Gerichten sowie Bergkräuterlikören, Glühwein und Bieren aus der Region.",
      breakfastTitle: "Frühstücksbuffet",
      breakfastHours: "8:00 – 10:00 Uhr (im Übernachtungspreis enthalten)",
      carteTitle: "À-la-carte-Restaurant",
      carteHours: "Täglich 12:00 – 21:00 Uhr",
      specialsTitle: "Traditionelle Spezialitäten aus unserer Speisekammer",
      specialsSubtitle: "Frische regionale Produkte von vertrauten Erzeugern sorgfältig zubereitet",
      heritageBadge: "Regionales kulinarisches Erbe",
      menuTitle: "Speisekarte des Restaurants Watra",
      menuSubtitle: "Alle Gerichte werden frisch für Sie zubereitet",
      grillHeading: "Grillhütte & Zünftige Hüttenabende",
      grillLead: "Wir veranstalten gesellige Abende am offenen Holzfeuer mit originaler Goralenkapelle und Grillspezialitäten.",
      grillPoints: [
        "Überdachte Grillhütte für bis zu 60 Personen",
        "Live-Folkloremusik und heitere Berggeschichten",
        "Spanferkel- oder Lammbraten sowie Kesselgulasch",
        "Ideal für Firmenausflüge und Familienfeiern"
      ],
      eventInquiryBtn: "Veranstaltung anfragen"
    },
    wellnessDiningExtra: {
      wellnessTag: "Erholungs- & Gesundheitszone",
      recreationTitle: "Regeneration & Erholung im Resort",
      recreationDesc: "Nach einem aktiven Tag auf der Skipiste oder den Bergpfaden entspannen Sie in unserem Garten-Whirlpool und der finnischen Sauna. Zudem steht Ihnen ein Spielzimmer mit Billard und Tischtennis zur Verfügung.",
      saunaItem: "Traditionelle finnische Trockensauna",
      jacuzziItem: "Beheizter Outdoor-Whirlpool",
      billiardItem: "Billardtisch und Clubraum",
      pingPongItem: "Tischtennis (Pingpong)",
      diningTag: "Geschmack der Beskiden-Küche",
      grillBanquetsTitle: "Grillhütte & Festlichkeiten",
      kwasnica: "🍲 Sauerkrautsuppe mit Rippchen",
      placki: "🥞 Räuber-Kartoffelpuffer",
      oscypek: "🧀 Oscypek-Käse mit Preiselbeeren",
      pstrag: "🐟 Forelle aus dem Gebirgsbach",
      bookDiningBtn: "Aufenthalt mit Verpflegung buchen"
    },
    heroExtra: {
      videoBtn: "Resort entdecken",
      forecastTitle: "7-Tage-Bergwetter • Pilsko & Korbielów",
      forecastLive: "Live aktualisiert • Open-Meteo API",
      pilskoPeak: "Pilsko Gipfel (1557 m)",
      watraValley: "Watra Tal (~650 m)",
      tempFeels: "Gefühlt:",
      wind: "Wind:",
      humidity: "Feuchtigkeit:",
      skiCondition: "Skibedingungen:",
      hikeCondition: "Wanderbedingungen:",
      videoModalTitle: "Watra Korbielów • Unser Resort entdecken",
      videoModalSubtitle: "Beskid Żywiecki • Skipiste Pilsko 1557 m ü.d.M.",
      videoModalPerks: "Zimmer • Skipisten • Restaurant • Whirlpool unter Sternen",
      bookPromoBtn: "Mit Rabatt buchen",
      allCampaigns: (c) => `Alle (${c})`,
      promoCodeLabel: "Gutscheincode:",
      videoLoading: "Video wird geladen..."
    },
    footerExtra: {
      brandDescriptor: "Resort • Restaurant",
      aboutSnippet: "Watra Korbielów ist ein ganzjährig geöffnetes Bergresort in den Saybuscher Beskiden am Fuße des Pilsko (1.557 m). Freuen Sie sich auf Skilifte in nur 100 m Entfernung, einen Whirlpool unter dem Sternenhimmel, traditionelle Hochlandküche und komfortable Unterkünfte mit 10 % Rabatt bei Direktbuchung.",
      directGuarantee: "Direktbucher-Vorteil: 10% Rabatt und kostenloser Parkplatz",
      depositNote: "Bitte geben Sie Ihren Namen und den Reisezeitraum im Überweisungsbetreff an.",
      pagesTitle: "Seiten & Bereiche",
      homeLink: "Startseite",
      aboutLink: "Über uns & Lage",
      roomsLink: "Zimmer & Preise",
      seasonsLink: "Winter & Sommer in den Beskiden",
      wellnessLink: "Whirlpool & Sauna",
      restaurantLink: "Restaurant & Grill",
      packagesLink: "Pakete & Angebote",
      contactLink: "Kontakt & Anfahrt",
      adminLink: "CMS-Verwaltung",
      bookOnlineBtn: "Online buchen",
      rightsReserved: "Alle Rechte vorbehalten."
    },
    seasonalExtra: {
      winterSeasonTag: "Wintersaison in Korbielów (Dezember – April)",
      snowGuarantee: "Schneegarantie",
      pilskoMicroclimate: "Pilsko-Mikroklima",
      pilskoMicroclimateDesc: "Dank der Höhenlage von 1557 m ü.d.M. und des speziellen Mikroklimas bleibt der Schnee auf dem Pilsko oft bis in den Mai erhalten.",
      slopeDistance: "100 m von der Tür zum Skilift",
      summerSeasonTag: "Sommersaison in den Beskiden (Mai – Oktober)",
      mountainTrails: "Bergwanderwege",
      trekkingEnduro: "Trekking & Enduro",
      trekkingEnduroDesc: "Wanderwege in Richtung Hala Miziowa, Rysianka und Babia Góra beginnen direkt am Resort. Großartige Ausblicke auf die Tatra und Beskiden.",
      gardenGrill: "Erholungsgarten & Grillpavillon"
    },
    bookingModalExtra: {
      bookingComSyncSuccess: "Synchronisation mit Booking.com: Der Zeitraum wurde sofort blockiert, um Doppelbuchungen auszuschließen.",
      checkInFrom: "(ab 15:00)",
      checkOutUntil: "(bis 11:00)",
      occupiedDates: (inD, outD) => `Belegter Zeitraum: ${inD} bis ${outD}.`,
      priceGuaranteeBadge: "Bestpreisgarantie",
      childrenAgeLabel: "Kinder (0-12 Jahre)",
      selectRoomLabel: "Zimmer Wählen",
      perPersonPerNight: "PLN/Pers./Nacht",
      promoActive: (d) => `AKTIV (-${d}%)`,
      promoAppliedSuccess: (title, d) => `-${d}% Rabatt angewendet! (${title})`,
      standardPriceForNights: (n) => `Standardpreis (${n} ${n === 1 ? 'Nacht' : 'Nächte'}):`,
      includesBreakfast: "inklusive Frühstück",
      noBreakfast: "ohne Frühstück",
      plusDinner: " + Halbpension-Abendessen",
      freeParkingIncluded: " & kostenloser Parkplatz",
      officialDirectTitle: "Offizielle Watra Direktbuchung",
      syncActiveBadge: "Sync mit Booking.com: Aktiv",
      channelManagerInfo: "Alle Buchungen werden direkt auf unserer Website verarbeitet. Unser integrierter Channel Manager sperrt die Termine sofort auf Booking.com, sodass keine Überbuchungen entstehen können.",
      cheaperThanOta: "10% günstiger als auf OTA-Portalen",
      freeMonitoredParking: "Kostenloser überwachter Parkplatz",
      personSingle: "Person",
      personsPlural: "Personen",
      childrenNone: "keine",
      childrenPlural: "Kinder",
      nightSingle: "Nacht",
      nightsPlural: "Nächte"
    }
  }
};

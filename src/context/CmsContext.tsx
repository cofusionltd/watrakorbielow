import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteCmsContent } from '../types';
import { adminFetch } from '../lib/adminApi';

// Fallback initial state in case network takes time
const initialCmsState: SiteCmsContent = {
  resort: {
    name: "Watra Korbielów",
    tagline: "Ośrodek • Restauracja • SPA",
    description: "Całoroczny resort górski w Beskidzie Żywieckim u stóp Pilska (1557 m n.p.m.). Położony zaledwie 100 m od wyciągów narciarskich Cypisek i Andiamo oraz 3 km od granicy ze Słowacją.",
    address: "ul. Graniczna 17",
    postalCity: "34-335 Korbielów",
    region: "Beskid Żywiecki, woj. śląskie",
    phone: "+48 511 660 511",
    phoneFormatted: "+48 511 660 511",
    email: "biuro@watrakorbielow.pl",
    bookingEmail: "biuro@watrakorbielow.pl",
    receptionHours: "Codziennie 7:00 – 22:00",
    checkInTime: "15:00",
    checkOutTime: "11:00",
    bankAccount: "PL 88 1050 1445 1000 0023 5566 7788 (ING Bank Śląski)",
    directDiscountPercent: 10,
    announcementBanner: "❄️ 100 m do wyciągów Cypisek & Andiamo • 900 m do stacji Pilsko • Gwarancja -10% przy rezerwacji bezpośredniej!",
    showAnnouncement: true,
  },
  hero: {
    eyebrow: "Beskid Żywiecki • Korbielów • Pilsko 1557 m",
    title: "Odpocznij u Stóp Pilska w Resorcie",
    highlightWord: "Watra Korbielów",
    subtitle: "Prawdziwa beskidzka gościnność 100 m od stoków narciarskich, gorące jacuzzi pod gwiazdami, tradycyjna kuchnia i komfortowe pokoje z widokiem na góry.",
    badgeText: "-10% Taniej niż na portalach",
    posterImage: "/images/image-13.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    ctaPrimaryText: "Rezerwuj Pobyt (-10%)",
    ctaSecondaryText: "Zobacz Stoki & Wyciągi",
  },
  about: {
    badge: "O Nas • Tradycja & Pasja",
    title: "Górska Przystań u Stóp Pilska (1557 m n.p.m.)",
    lead: "Watra Korbielów to wyjątkowe miejsce łączące tradycyjną beskidzką gościnność ze współczesnym komfortem i pasją do gór.",
    storyParagraph1: "Nazwa 'Watra' pochodzi z tradycji pasterskiej i oznacza wieczne ognisko, które ogrzewało pasterzy i zbójników na halach Beskidu Żywieckiego. Od ponad 20 lat z sercem tworzymy przystań, w której każdy gość odnajduje spokój, regenerację i autentyczną góralską serdeczność.",
    storyParagraph2: "Zimą jesteśmy wymarzonym punktem startowym dla narciarzy – łagodne stoki Cypisek i Andiamo znajdują się zaledwie 100 metrów od drzwi ośrodka, a kolej linowa na Pilsko to kilkuminutowy spacer. Latem szlaki turystyczne na Halę Miziową i Rysiankę zaczynają się tuż za naszym płotem.",
    storyParagraph3: "W naszym ogrodzie czeka całoroczne jacuzzi z gorącą wodą 38°C pod rozgwieżdżonym niebem, sucha sauna fińska oraz zadaszona wiata grillowa z paleniskiem na regionalne biesiady.",
    distances: [
      { name: "Wyciąg orczykowy 'Cypisek' (dla dzieci i początkujących)", dist: "100 m" },
      { name: "Wyciąg talerzykowy 'Andiamo' & szkółka narciarska PZN", dist: "120 m" },
      { name: "Dolna stacja wyciągów na Pilsko (Polana Kamienna / Jontek)", dist: "900 m" },
      { name: "Szlak turystyczny na Halę Miziową (1330 m n.p.m.)", dist: "Bezpośrednio przy bramie" },
      { name: "Szczyt Pilska (1557 m n.p.m.)", dist: "2h 15 min szlakiem" },
      { name: "Przejście graniczne ze Słowacją (Korbielów / Oravská Polhora)", dist: "3 km" },
      { name: "Orawski Zamek (Oravský Podzámok, Słowacja)", dist: "45 km" },
      { name: "Wodospad w Sopotni Wielkiej (najwyższy w Beskidach)", dist: "12 km" }
    ],
    images: [
      "/images/image-13.jpg",
      "/images/jacuzi.jpg",
      "/images/image-30.jpg",
      "/images/image-23.jpg",
      "/images/image-46.jpg",
      "/images/image-32.jpg"
    ],
    features: [
      { title: "100 m od stoków", desc: "Wyciągi Cypisek i Andiamo tuż obok ośrodka, ogrzewana narciarnia z suszarkami.", iconName: "Mountain" },
      { title: "Gorące Jacuzzi 38°C", desc: "Zewnętrzna balia z hydromasażem pod gwiazdami czynna przez cały rok.", iconName: "Waves" },
      { title: "Karczma Regionalna", desc: "Kwaśnica na żeberku, placki po zbójnicku i świeży pstrąg potokowy.", iconName: "Flame" },
      { title: "Gwarancja Ceny -10%", desc: "Zawsze najniższa cena i darmowy parking przy rezerwacji bezpośredniej.", iconName: "Award" }
    ]
  },
  restaurant: {
    badge: "Karczma Regionalna • Kuchnia Beskidzka",
    title: "Autentyczne Smaki Beskidu Żywieckiego",
    subtitle: "Tradycyjne receptury, świeże lokalne produkty od beskidzkich gospodarzy oraz ciepła, gościnna atmosfera w przytulnym wnętrzu.",
    openingHours: "12:00 – 22:00 codziennie",
    breakfastHours: "8:00 – 10:30 (obfity bufet szwedzki)",
    dinnerHours: "16:00 – 19:00 (obiadokolacje serwowane)",
    fireplaceShelterInfo: "W ogrodzie znajduje się zadaszona, ogrzewana wiata grillowa z otwartym paleniskiem, idealna na wieczorne ogniska, pieczenie kiełbasek i biesiady z kapelą góralską.",
    heroImage: "/images/image-70.jpg",
    galleryImages: [
      "/images/pork.jpg",
      "/images/sausage.jpg",
      "/images/image-70.jpg",
      "/images/grill.jpg"
    ],
    menuItems: [
      {
        id: "m-1",
        name: "Tradycyjna Kwaśnica na Wędzonym Żeberku",
        category: "zupy",
        price: 28,
        description: "Gęsta, aromatyczna zupa gotowana na kiszonej kapuście z wędzonymi żeberkami i ziemniakami z patelni.",
        badge: "Specjalność Karczmy",
        isRegional: true
      },
      {
        id: "m-2",
        name: "Żurek Beskidzki z Prawdziwkami",
        category: "zupy",
        price: 26,
        description: "Na naturalnym zakwasie żytnim, z leśnymi borowikami, białą kiełbasą i jajkiem wiejskim.",
        badge: "Regionalny",
        isRegional: true
      },
      {
        id: "m-3",
        name: "Rosół z Wiejskiej Kury z Domowym Makaronem",
        category: "zupy",
        price: 20,
        description: "Klasyczny, esencjonalny rosół z marchewką, natką pietruszki i ręcznie krojanym makaronem.",
        badge: "Dla dzieci"
      },
      {
        id: "m-4",
        name: "Chrupiący Placek po Zbójnicku",
        category: "glowne",
        price: 48,
        description: "Duży placek ziemniaczany przekładany pikantnym gulaszem z dziczyzny i wołowiny, zwieńczony kwaśną śmietaną.",
        badge: "Bestseller Watry",
        isRegional: true
      },
      {
        id: "m-5",
        name: "Świeży Pstrąg Potokowy na Maśle Ziołowym",
        category: "glowne",
        price: 49,
        description: "Pstrąg z lokalnego potoku smażony na złoto z czosnkiem niedźwiedzim, frytkami i bukietem surówek.",
        badge: "Ze świeżego połowu",
        isRegional: true
      },
      {
        id: "m-6",
        name: "Golonka Wieprzowa Duszona w Ciemnym Piwie",
        category: "glowne",
        price: 54,
        description: "Krucha golonka z chrupiącą skórką podawana z zasmażaną kapustą, ostrym chrzanem i musztardą.",
        badge: "Danie Góralskie",
        isRegional: true
      },
      {
        id: "m-7",
        name: "Pierogi z Bryndzą i Ziemniakami (8 szt.)",
        category: "glowne",
        price: 34,
        description: "Ręcznie lepione na miejscu z cienkiego ciasta, polane złocistymi skwarkami z boczku i cebulki.",
        badge: "Ręcznie Lepione",
        isRegional: true
      },
      {
        id: "m-8",
        name: "Grillowany Oscypek z Żurawiną Leśną",
        category: "przekaski",
        price: 22,
        description: "Oryginalny wędzony ser owczy z bacówki podawany na gorąco z konfiturą z leśnej żurawiny.",
        badge: "Prosto z Bacówki",
        isRegional: true
      },
      {
        id: "m-9",
        name: "Deska Swojskich Wędlin i Pasztetów",
        category: "przekaski",
        price: 42,
        description: "Wędzonki z naszej przydomowej wędzarni, kiełbasa swojska, pasztet z żurawiną i domowy smalec z ogórkiem kiszonym.",
        badge: "Do podziału"
      },
      {
        id: "m-10",
        name: "Szarlotka Beskidzka z Lodami Waniliowymi",
        category: "desery",
        price: 22,
        description: "Ciepłe ciasto z prażonymi jabłkami z cynamonem, gałką lodów rzemieślniczych i sosem malinowym.",
        badge: "Domowy Wypiek"
      },
      {
        id: "m-11",
        name: "Grzaniec Galicyjski z Pomarańczą i Goździkami",
        category: "napoje",
        price: 19,
        description: "Gorące wino korzenne z plasterkiem świeżej pomarańczy, cynamonem i miodem leśnym.",
        badge: "Na rozgrzewkę"
      },
      {
        id: "m-12",
        name: "Herbata Góralska z Prądem",
        category: "napoje",
        price: 18,
        description: "Mocna czarna herbata z regionalną nalewką ziołową, miodem lipowym i cytryną.",
        badge: "Tradycyjna"
      }
    ]
  },
  wellness: {
    badge: "Strefa Relaksu & Odnowy Biologicznej",
    title: "Całoroczne Jacuzzi Zewnętrzne & Sauna Fińska",
    subtitle: "Zanurz się w gorącej wodzie z widokiem na ośnieżone stoki Pilska lub zregeneruj mięśnie po górskich wędrówkach.",
    jacuzziTitle: "Drewniana Balia Zewnętrzna z Hydromasażem (38°C)",
    jacuzziDescription: "Nasze zewnętrzne jacuzzi zostało wykonane z naturalnego drewna modrzewiowego. Zapewnia kąpiele pod gwiazdami w wodzie o temperaturze 38°C, nawet przy temperaturach -15°C i padającym śniegu. Zaawansowane dysze masują zmęczone mięśnie po nartach.",
    jacuzziTemp: "38°C",
    jacuzziHours: "16:00 – 22:00 codziennie",
    saunaTitle: "Tradycyjna Sucha Sauna Fińska",
    saunaDescription: "Sosnowa sauna fińska rozgrzewająca ciało do temperatury 85-95°C. Oczyszcza organizm z toksyn, poprawia krążenie i przyspiesza regenerację po wysiłku fizycznym na beskidzkich szlakach.",
    saunaTemp: "85°C - 95°C",
    vipReservationNote: "Możliwość rezerwacji strefy jacuzzi na wyłączność na 60 minut z powitalną butelką schłodzonego wina musującego i paterą świeżych owoców.",
    pricingNote: "Wstęp do strefy wellness jest bezpłatny w wybranych pakietach lub dostępny za opłatą 40 zł/os. za seans.",
    heroImage: "/images/jacuzi.jpg",
    galleryImages: [
      "/images/jacuzi.jpg",
      "/images/image-46.jpg",
      "/images/image-47.jpg",
      "/images/image-13.jpg"
    ]
  },
  rehabilitation: {
    badge: "Turnusy Zdrowotne & PFRON",
    title: "Rehabilitacja & Odnowa w Mikroklimacie Korbielowa",
    subtitle: "Specjalistyczne turnusy rehabilitacyjne z dofinansowaniem PFRON, masaże lecznicze i kinezyterapia.",
    description: "Nasz ośrodek posiada wpis do rejestru ośrodków przyjmujących osoby niepełnosprawne na turnusy rehabilitacyjne. Oferujemy kompleksowe programy usprawniające pod okiem wykwalifikowanych fizjoterapeutów, łącząc zabiegi z unikalnym mikroklimatem lasów świerkowych.",
    pfronInfo: "Realizujemy dofinansowania z PFRON, PCPR oraz MOPS dla osób ze schorzeniami narządu ruchu, neurologicznymi oraz układu krążenia.",
    treatments: [
      { id: "t-1", name: "Masaż Klasyczny Leczniczy Kręgosłupa", desc: "Głęboki masaż redukujący napięcia mięśniowe, bóle przeciążeniowe i poprawiający ruchomość.", duration: "30 min", price: "90 zł" },
      { id: "t-2", name: "Masaż Relaksacyjny z Ciepłymi Olejkami", desc: "Odprężający masaż całego ciała z aromaterapią sosnową i lawendową.", duration: "50 min", price: "140 zł" },
      { id: "t-3", name: "Laseroterapia Punktowa", desc: "Zabieg biostymulacyjny przyspieszający regenerację tkanek i działający przeciwbólowo.", duration: "15 min", price: "35 zł" },
      { id: "t-4", name: "Drenaż Limfatyczny BOA", desc: "Mechaniczny masaż uciskowy wspomagający odpływ chłonki i redukujący obrzęki nóg.", duration: "30 min", price: "60 zł" },
      { id: "t-5", name: "Kinezyterapia Indywidualna", desc: "Ćwiczenia z fizjoterapeutą dostosowane do indywidualnych potrzeb pacjenta.", duration: "45 min", price: "110 zł" }
    ],
    heroImage: "/images/image-47.jpg"
  },
  contact: {
    directionsInfo: "Dojazd drogą wojewódzką nr 945 z Żywca w kierunku granicy ze Słowacją. Ośrodek znajduje się po prawej stronie, 100 m przed wyciągiem Cypisek.",
    parkingInfo: "Bezpłatny, duży, monitorowany parking zamykany szlabanem dostępny bezpośrednio pod budynkiem.",
    gpsCoordinates: "49.5658° N, 19.3491° E",
    publicTransportInfo: "Bezpośrednie autobusy z dworca PKP Żywiec do przystanku Korbielów Kamienna (5 minut spacerem do Watry)."
  },
  footer: {
    aboutSnippet: "Watra Korbielów to całoroczny resort górski położony w Beskidzie Żywieckim u stóp Pilska (1557 m n.p.m.). Oferujemy 100 m do wyciągów narciarskich, gorące jacuzzi pod gwiazdami, tradycyjną karczmę beskidzką i komfortowe noclegi z 10% rabatem bezpośrednim.",
    copyrightText: "© 2026 Watra Korbielów. Wszelkie prawa zastrzeżone. Ośrodek • Restauracja • SPA."
  }
};

interface CmsContextType {
  content: SiteCmsContent;
  loading: boolean;
  refreshContent: () => Promise<void>;
  updateCmsContent: (updates: Partial<SiteCmsContent>) => Promise<{ success: boolean; message?: string }>;
  resetToDefaults: () => Promise<boolean>;
}

const CmsContext = createContext<CmsContextType>({
  content: initialCmsState,
  loading: false,
  refreshContent: async () => {},
  updateCmsContent: async () => ({ success: false }),
  resetToDefaults: async () => false,
});

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteCmsContent>(initialCmsState);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/cms/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (err) {
      console.warn("Could not fetch CMS content, using defaults:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const updateCmsContent = async (updates: Partial<SiteCmsContent>) => {
    try {
      const res = await adminFetch('/api/admin/cms/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          setContent(data.content);
        }
        return { success: true, message: data.message || "Zaktualizowano pomyślnie" };
      }
      const err = await res.json();
      return { success: false, message: err.error || "Błąd zapisu" };
    } catch (err: any) {
      return { success: false, message: err.message || "Błąd sieci" };
    }
  };

  const resetToDefaults = async () => {
    try {
      const res = await adminFetch('/api/admin/cms/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          setContent(data.content);
        }
        return true;
      }
      return false;
    } catch (_) {
      return false;
    }
  };

  return (
    <CmsContext.Provider
      value={{
        content,
        loading,
        refreshContent: fetchContent,
        updateCmsContent,
        resetToDefaults,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => useContext(CmsContext);

import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { UtensilsCrossed, Flame, Sparkles, Clock, Users, Wine, Calendar, Check, Tag } from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface RestaurantPageProps {
  lang: Language;
  onOpenBooking: () => void;
}

export const RestaurantPage: React.FC<RestaurantPageProps> = ({ lang, onOpenBooking }) => {
  const t = translations[lang];
  const { content } = useCms();
  const restCms = content.restaurant;

  // Group CMS menu items by category dynamically
  const categoriesMap = new Map<string, typeof restCms.menuItems>();
  (restCms.menuItems || []).forEach((item) => {
    const cat = item.category || (lang === 'pl' ? 'Specjały' : lang === 'en' ? 'Specialties' : lang === 'sk' ? 'Špeciality' : 'Spezialitäten');
    if (!categoriesMap.has(cat)) categoriesMap.set(cat, []);
    categoriesMap.get(cat)!.push(item);
  });

  const categories = Array.from(categoriesMap.entries()).map(([category, items]) => ({
    category,
    items
  }));

  const showcaseItems = [
    {
      title: lang === 'pl' ? 'Pieczeń ze śliwką' : lang === 'en' ? 'Roast pork with prunes' : lang === 'sk' ? 'Pečené bravčové so slivkami' : 'Schweinebraten mit Pflaumen',
      desc: lang === 'pl' ? 'Soczysty schab faszerowany wędzonymi śliwkami w świeżych ziołach, podawany na zimno jako przystawka lub dodatek do bufetu.' : lang === 'en' ? 'Juicy pork loin stuffed with smoked prunes and fresh herbs, served cold as an appetizer or buffet specialty.' : lang === 'sk' ? 'Šťavnaté bravčové karé plnené údenými slivkami v čerstvých bylinkách, podávané za studena ako predjedlo alebo súčasť bufetu.' : 'Saftiger Schweinerücken gefüllt mit geräucherten Pflaumen und frischen Kräutern, kalt serviert als Vorspeise oder Buffet-Beilage.',
      img: '/images/pork.jpg',
      alt: lang === 'pl' ? 'Tradycyjna pieczeń ze śliwką' : lang === 'en' ? 'Traditional roast pork with prunes' : lang === 'sk' ? 'Tradičné pečené bravčové so slivkami' : 'Traditioneller Schweinebraten mit Pflaumen'
    },
    {
      title: lang === 'pl' ? 'Swojskie wędliny & kabanosy' : lang === 'en' ? 'Artisanal cold cuts & smoked sausages' : lang === 'sk' ? 'Domáce údeniny a klobásy' : 'Hausgemachte Wurstwaren & Kabanos',
      desc: lang === 'pl' ? 'Prawdziwe wędliny wędzone w dymie drzew liściastych, kiełbasy i pasztety tworzone według starych beskidzkich receptur.' : lang === 'en' ? 'Authentic cold cuts smoked over hardwood, sausages, and pâtés crafted according to traditional mountain recipes.' : lang === 'sk' ? 'Pravé údeniny údené v dyme z listnatých stromov, klobásy a paštéty vyrábané podľa starých beskydských receptúr.' : 'Echte, über Hartholz geräucherte Wurstwaren, Würste und Pasteten nach alten Beskiden-Rezepten.',
      img: '/images/sausage.jpg',
      alt: lang === 'pl' ? 'Regionalne wędliny i swojskie wyroby' : lang === 'en' ? 'Regional cold cuts and homemade specialties' : lang === 'sk' ? 'Regionálne údeniny a domáce výrobky' : 'Regionale Wurstwaren und hausgemachte Spezialitäten'
    },
    {
      title: lang === 'pl' ? 'Tradycyjna jadalnia' : lang === 'en' ? 'Traditional dining hall' : lang === 'sk' ? 'Tradičná jedáleň' : 'Traditioneller Speisesaal',
      desc: lang === 'pl' ? 'Przestronna, jasna sala z białymi obrusami i widokiem na ogród, w której codziennie serwujemy śniadania i obiadokolacje.' : lang === 'en' ? 'Spacious, bright room with linen tablecloths and garden views, where daily buffet breakfasts and dinners are served.' : lang === 'sk' ? 'Priestranná, svetlá sála s bielymi obrusmi a výhľadom do záhrady, kde denne podávame raňajky a večere.' : 'Geräumiger, heller Saal mit weißen Tischdecken und Gartenblick, in dem täglich Frühstück und Abendessen serviert werden.',
      img: '/images/image-70.jpg',
      alt: lang === 'pl' ? 'Tradycyjna jadalnia z eleganckimi nakryciami' : lang === 'en' ? 'Traditional dining hall with elegant settings' : lang === 'sk' ? 'Tradičná jedáleň s elegantným prestieraním' : 'Traditioneller Speisesaal mit eleganter Tischordnung'
    }
  ];

  return (
    <div className="py-12 sm:py-16 bg-[#F9F8F6] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-800 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-full">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />
            <span>{t.restaurantPage.tag}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E3A2B]">
            {lang === 'pl' ? (restCms.title || t.restaurantPage.title) : t.restaurantPage.title}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">
            {lang === 'pl' ? (restCms.subtitle || t.restaurantPage.subtitle) : t.restaurantPage.subtitle}
          </p>
        </div>

        {/* Story and Ambiance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E3A2B]">
              {t.restaurantPage.storyHeading}
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {t.restaurantPage.storyP1}
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {t.restaurantPage.storyP2}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border border-neutral-200 p-3.5 rounded-xl bg-[#F9F8F6]">
                <Clock className="w-4 h-4 text-[#D4A373] mb-1" />
                <div className="text-xs font-bold text-[#1E3A2B]">{t.restaurantPage.breakfastTitle}</div>
                <div className="text-[11px] text-neutral-500">{t.restaurantPage.breakfastHours}</div>
              </div>
              <div className="border border-neutral-200 p-3.5 rounded-xl bg-[#F9F8F6]">
                <UtensilsCrossed className="w-4 h-4 text-[#D4A373] mb-1" />
                <div className="text-xs font-bold text-[#1E3A2B]">{t.restaurantPage.carteTitle}</div>
                <div className="text-[11px] text-neutral-500">{t.restaurantPage.carteHours}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-md h-44">
              <img src="/images/pork.jpg" alt="Pieczeń ze śliwką i beskidzkie wyroby" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md h-44">
              <img src="/images/sausage.jpg" alt="Regionalne wędliny i swojskie specjały" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="col-span-2 rounded-2xl overflow-hidden shadow-md h-52">
              <img src="/images/image-70.jpg" alt="Tradycyjna jadalnia Watra Korbielów" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>

        {/* Authentic Culinary Showcase */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1E3A2B]">
                {t.restaurantPage.specialsTitle}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                {t.restaurantPage.specialsSubtitle}
              </p>
            </div>
            <span className="text-xs font-bold text-[#1E3A2B] bg-[#1E3A2B]/10 px-3 py-1.5 rounded-full w-fit">
              {t.restaurantPage.heritageBadge}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {showcaseItems.map((item, idx) => (
              <div key={idx} className="group rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300">
                <div className="h-56 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4 bg-white space-y-1">
                  <div className="font-bold text-sm text-[#1E3A2B]">{item.title}</div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Menu */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E3A2B]">
              {t.restaurantPage.menuTitle}
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              {t.restaurantPage.menuSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((section, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-neutral-200 shadow-sm space-y-5"
              >
                <h3 className="font-serif text-lg font-bold text-[#1E3A2B] pb-3 border-b border-neutral-100 flex items-center justify-between">
                  <span>{section.category}</span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200/60">
                    {lang === 'pl' ? `${section.items.length} pozycji` : lang === 'en' ? `${section.items.length} dishes` : lang === 'sk' ? `${section.items.length} jedál` : `${section.items.length} Speisen`}
                  </span>
                </h3>
                <div className="space-y-4">
                  {section.items.map((dish, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-baseline font-bold text-xs text-neutral-900">
                        <div className="flex items-center space-x-1.5 flex-wrap">
                          <span>{dish.name}</span>
                          {dish.badge && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                              {dish.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[#1E3A2B] font-serif text-sm shrink-0 ml-2 font-bold">{dish.price}</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-snug">{dish.description || (dish as any).desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wiata Grillowa & Banquets */}
        <div className="bg-[#1E3A2B] text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-[#2A4F3B] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#D4A373] uppercase tracking-wider">
              <Flame className="w-4 h-4 text-[#D4A373]" />
              <span>{t.restaurantPage.grillHeading}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F8F6]">
              {t.restaurantPage.grillHeading}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              {t.restaurantPage.grillLead}
            </p>
            <div className="space-y-2 text-xs text-white/90">
              {(t.restaurantPage.grillPoints || []).map((point, pIdx) => (
                <div key={pIdx} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-[#D4A373]" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 text-center space-y-4">
            <h3 className="font-serif text-lg font-bold text-white">
              {lang === 'pl' ? 'Zaplanuj Imprezę w Korbielowie' : lang === 'en' ? 'Plan Your Event in Korbielów' : lang === 'sk' ? 'Naplánujte si akciu v Korbielove' : 'Planen Sie Ihr Event in Korbielów'}
            </h3>
            <p className="text-xs text-white/70">
              {lang === 'pl' ? 'Skontaktuj się z nami, aby ustalić menu, termin i oprawę Twojego wydarzenia.' : lang === 'en' ? 'Contact us to customize the menu, date, and arrangements for your event.' : lang === 'sk' ? 'Kontaktujte nás pre dohodnutie menu, termínu a organizácie Vášho podujatia.' : 'Kontaktieren Sie uns, um Menü, Termin und Rahmen Ihrer Veranstaltung abzustimmen.'}
            </p>
            <div className="text-sm font-mono font-bold text-[#D4A373]">
              tel. {content.resort.phone || '+48 511 660 511'}
            </div>
            <a
              href={`mailto:${content.resort.email || 'biuro@watrakorbielow.pl'}`}
              className="inline-block bg-[#D4A373] hover:bg-[#c89260] text-[#14281E] px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
            >
              {t.restaurantPage.eventInquiryBtn}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

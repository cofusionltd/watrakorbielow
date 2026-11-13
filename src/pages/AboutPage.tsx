import { CmsManagedImage } from '../components/CmsManagedImage';
import React from 'react';
import { Language } from '../types';
import { MapPin, Mountain, Trees, Compass, CheckCircle2, Award, Calendar, Phone } from 'lucide-react';
import {useCms, useCmsTranslations} from '../context/CmsContext';

interface AboutPageProps {
  lang: Language;
  onOpenBooking: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ lang, onOpenBooking }) => {
  const t = useCmsTranslations(lang);
  const { content, siteSettings } = useCms();
  const aboutCms = content.about;

  const distances = (lang === 'pl' && aboutCms.distances && aboutCms.distances.length > 0)
    ? aboutCms.distances
    : (t.aboutPage.distances || [
        { name: 'Wyciąg orczykowy "Cypisek" (dla początkujących i dzieci)', dist: '100 m' },
        { name: 'Wyciąg talerzykowy "Andiamo" & szkółka narciarska', dist: '120 m' },
        { name: 'Dolna stacja wyciągów krzesełkowych na Pilsko (Polana Kamienna)', dist: '900 m' },
        { name: 'Szlak turystyczny na Halę Miziową (1330 m n.p.m.)', dist: 'Przy obiekcie' },
        { name: 'Szczyt Pilska (1557 m n.p.m.)', dist: '2h 15m pieszo' },
        { name: 'Przejście graniczne ze Słowacją (Korbielów / Oravská Polhora)', dist: '3 km' },
        { name: 'Orawski Zamek (Słowacja)', dist: '45 km' },
        { name: 'Żywiec (Muzeum Browaru, Park Zamkowy)', dist: '25 km' }
      ]);

  const galleryImages = [
    { url: '/images/1920x970.jpg', caption: lang === 'pl' ? 'Widok na Pilsko zimą z terenu obiektu' : lang === 'en' ? 'View of Pilsko in winter from the resort' : lang === 'sk' ? 'Pohľad na Pilsko v zime z areálu rezortu' : 'Blick auf Pilsko im Winter vom Resortgelände' },
    { url: '/images/grill.jpg', caption: lang === 'pl' ? 'Drewniana wiata grillowa w ogrodzie' : lang === 'en' ? 'Wooden barbecue shelter in the garden' : lang === 'sk' ? 'Drevený grilovací prístrešok v záhrade' : 'Hölzerne Grillhütte im Garten' },
    { url: '/images/beskid-rest.jpg', caption: lang === 'pl' ? 'Tradycyjna jadalnia' : lang === 'en' ? 'Traditional dining room' : lang === 'sk' ? 'Tradičná jedáleň' : 'Traditioneller Speisesaal' },
    { url: '/images/image-23.jpg', caption: lang === 'pl' ? 'Przytulne wnętrza pokoi' : lang === 'en' ? 'Cozy room interiors' : lang === 'sk' ? 'Útulné interiéry izieb' : 'Gemütliche Zimmer' },
    { url: '/images/image-63.jpg', caption: lang === 'pl' ? 'Sauna fińska dla gości' : lang === 'en' ? 'Finnish sauna for guests' : lang === 'sk' ? 'Fínska sauna pre hostí' : 'Finnische Sauna für Gäste' },
    { url: '/images/jacuzi.jpg', caption: lang === 'pl' ? 'Strefa relaksu w ogrodzie z jacuzzi' : lang === 'en' ? 'Garden relaxation area with jacuzzi' : lang === 'sk' ? 'Záhradná relaxačná zóna s vírivkou' : 'Garten-Entspannungszone mit Whirlpool' }
  ];

  return (
    <div className="py-12 sm:py-16 bg-[#F9F8F6] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Breadcrumb & Title */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#1E3A2B] uppercase tracking-widest bg-[#1E3A2B]/10 px-3 py-1 rounded-full">
            <Mountain className="w-3.5 h-3.5 text-[#1E3A2B]" />
            <span>{t.aboutPage.tag}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E3A2B] leading-tight">
            {lang === 'pl' ? (aboutCms.title || t.aboutPage.title) : t.aboutPage.title}
          </h1>
          <p className="text-base text-neutral-700 leading-relaxed">
            {lang === 'pl' ? (aboutCms.lead || t.aboutPage.lead) : t.aboutPage.lead}
          </p>
        </div>

        {/* Narrative Block with Big Featured Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center bg-white p-8 sm:p-12 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="lg:col-span-6 space-y-5">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1E3A2B]">
              {t.aboutPage.storyTitle}
            </h2>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {lang === 'pl' ? (aboutCms.storyParagraph1 || t.aboutPage.storyP1) : t.aboutPage.storyP1}
            </p>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {lang === 'pl' ? (aboutCms.storyParagraph2 || t.aboutPage.storyP2) : t.aboutPage.storyP2}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div className="border border-neutral-200 p-4 rounded-xl bg-[#F9F8F6]">
                <div className="font-serif text-2xl font-bold text-[#1E3A2B]">{t.aboutPage.experienceYears}</div>
                <div className="text-xs text-neutral-500">{t.aboutPage.experienceLabel}</div>
              </div>
              <div className="border border-neutral-200 p-4 rounded-xl bg-[#F9F8F6]">
                <div className="font-serif text-2xl font-bold text-[#1E3A2B]">{t.aboutPage.elevationValue}</div>
                <div className="text-xs text-neutral-500">{t.aboutPage.elevationLabel}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-xl border-4 border-white h-[420px]">
            <CmsManagedImage
              src={(aboutCms as any).featuredImage || (aboutCms.images && aboutCms.images[0]) || '/images/image-13.jpg'}
              alt="Watra Korbielów w zimowej scenerii"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Distance Guide & Proximity Table */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-[#D4A373]" />
            <h2 className="font-serif text-2xl font-bold text-[#1E3A2B]">
              {t.aboutPage.distancesTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-600">
            {t.aboutPage.distancesSubtitle}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {distances.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-neutral-200 bg-[#F9F8F6] flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-[#C86D51] shrink-0" />
                  <span className="text-xs text-neutral-800 font-medium">{item.name}</span>
                </div>
                <span className="text-xs font-bold text-[#1E3A2B] bg-white px-2.5 py-1 rounded-md border border-neutral-200 shrink-0 ml-2">
                  {item.dist}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1E3A2B]">
                {t.aboutPage.galleryTitle}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {t.aboutPage.gallerySubtitle}
              </p>
            </div>
            {siteSettings.features.reservations && <button
              onClick={onOpenBooking}
              className="bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {t.aboutPage.bookStayBtn}
            </button>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className="group rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div className="h-56 overflow-hidden">
                  <CmsManagedImage
                    src={img.url}
                    alt={img.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5 text-xs text-neutral-700 font-medium bg-white">
                  {img.caption}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

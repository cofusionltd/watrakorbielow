import { CmsManagedImage } from '../components/CmsManagedImage';
import React, { useState, useEffect } from 'react';
import { Language, PackageOffer, PromotionalCampaign } from '../types';
import { getLocalizedPackages } from '../data/resortData';
import { Gift, Tag, Sparkles, Check, Calendar, ArrowRight, Clock, Percent } from 'lucide-react';
import { SocialShareBar } from '../components/SocialShareBar';
import {useCms, useCmsTranslations} from '../context/CmsContext';

interface PackagesPageProps {
  lang: Language;
  onSelectPackage: (pkg: PackageOffer) => void;
  onOpenBooking: () => void;
}

export const PackagesPage: React.FC<PackagesPageProps> = ({
  lang,
  onSelectPackage,
  onOpenBooking
}) => {
  const t = useCmsTranslations(lang);
  const { siteSettings } = useCms();
  const localizedPackages = getLocalizedPackages(lang);
  const [liveCampaigns, setLiveCampaigns] = useState<PromotionalCampaign[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!siteSettings.features.promotions) {
      setLiveCampaigns([]);
      return;
    }
    fetch('/api/campaigns')
    .then(res => {
      if (!res.ok) throw new Error(`Campaign request failed (${res.status})`);
      return res.json();
    })
    .then(data => {
      if (Array.isArray(data)) setLiveCampaigns(data);
    })
    .catch(err => console.error('Error fetching live campaigns:', err));
  }, [siteSettings.features.promotions]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="py-12 sm:py-16 bg-[#F9F8F6] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#1E3A2B] uppercase tracking-widest bg-[#1E3A2B]/10 px-3 py-1 rounded-full">
            <Gift className="w-3.5 h-3.5 text-[#1E3A2B]" />
            <span>{t.packagesPage.tag}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E3A2B]">
            {t.packagesPage.title}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">
            {t.packagesPage.subtitle}
          </p>
        </div>

        {/* SECTION 1: LIVE PROMOTIONAL CAMPAIGNS (FROM ADMIN PANEL) */}
        {siteSettings.features.promotions && liveCampaigns.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3">
              <Sparkles className="w-5 h-5 text-[#D4A373]" />
              <h2 className="font-serif text-2xl font-bold text-[#1E3A2B]">
                {t.packagesPage.liveCampaignsTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="relative aspect-[4/3] overflow-hidden rounded-3xl border-2 border-[#D4A373]/50 shadow-md transition-all duration-300 hover:shadow-xl"
                >
                  <CmsManagedImage
                    src={camp.imageUrl}
                    alt={camp.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/20 to-white/10" />
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-bold text-black shadow">
                      <Percent className="w-3.5 h-3.5" />
                      -{camp.discountPercentage}%
                    </span>
                    {siteSettings.components.promotionBanner && (
                      <SocialShareBar campaign={camp} variant="compact" lang={lang} />
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <div className="rounded-2xl bg-white/85 p-4 shadow-lg backdrop-blur-sm">
                      <h3 className="font-serif text-xl font-bold leading-snug text-black">
                        {camp.title}
                      </h3>
                      {camp.price && (
                        <p className="mt-1 text-base font-semibold text-black">{camp.price}</p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        {camp.promoCode && (
                          <button
                            onClick={() => handleCopyCode(camp.promoCode)}
                            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[10px] font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
                          >
                            {copiedCode === camp.promoCode ? t.common.copied : `${t.packagesPage.promoCodeLabel}: ${camp.promoCode}`}
                          </button>
                        )}
                        {siteSettings.features.reservations && (
                          <button
                            onClick={onOpenBooking}
                            className="flex-1 rounded-xl bg-[#1E3A2B] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-colors hover:bg-[#2A4F3B]"
                          >
                            {t.packagesPage.bookWithDiscount}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: CURATED RESORT PACKAGES */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-b border-neutral-200 pb-3">
            <Gift className="w-5 h-5 text-[#D4A373]" />
            <h2 className="font-serif text-2xl font-bold text-[#1E3A2B]">
              {t.packagesPage.standardPackagesTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {localizedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-52 overflow-hidden">
                    <CmsManagedImage
                      src={pkg.image}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {pkg.badge && (
                      <div className="absolute top-4 left-4 bg-[#1E3A2B] text-[#D4A373] text-[10px] font-bold px-3 py-1 rounded-md shadow">
                        {pkg.badge}
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs text-[#1E3A2B] font-bold text-xs px-3 py-1 rounded-md shadow-xs">
                      {pkg.duration}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#1E3A2B]">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1">
                        {pkg.subtitle}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs text-neutral-700">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between border-t border-neutral-100 bg-[#F9F8F6]">
                  <div>
                    <span className="text-[10px] text-neutral-400 block">{t.packagesPage.priceFrom}</span>
                    <span className="font-serif text-xl font-bold text-[#1E3A2B]">
                      {pkg.price}
                    </span>
                  </div>
                  {siteSettings.features.reservations && <button
                    onClick={() => {
                      onSelectPackage(pkg);
                      onOpenBooking();
                    }}
                    className="bg-[#1E3A2B] hover:bg-[#2A4F3B] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {t.packagesPage.selectPackage}
                  </button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

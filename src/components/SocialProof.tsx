import React from 'react';
import { Star, MessageSquareQuote, ShieldCheck, CheckCircle, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';
import { RESORT_REVIEWS } from '../data/resortData';

interface SocialProofProps {
  lang: Language;
}

export const SocialProof: React.FC<SocialProofProps> = ({ lang }) => {
  const t = translations[lang];

  return (
    <section id="opinie" className="py-20 bg-[#F9F8F6] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ratings Header Strip */}
        <div className="bg-[#1E3A2B] text-white rounded-3xl p-8 sm:p-10 mb-14 shadow-xl border border-[#2A4F3B] flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#D4A373] uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
              <span>{t.reviews.tag}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F9F8F6]">
              {t.reviews.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-1">
              {t.reviews.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 shrink-0">
            {/* Google Rating Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-44">
              <div className="flex items-center justify-center space-x-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <div className="font-serif text-3xl font-bold text-white">{t.reviews.googleScore} / 5</div>
              <div className="text-[11px] text-white/70 mt-0.5">{t.reviews.googleScoreLabel}</div>
            </div>

            {/* Booking.com Rating Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-44">
              <div className="inline-block bg-[#003580] text-white text-[10px] font-bold px-2 py-0.5 rounded mb-1">
                Booking.com
              </div>
              <div className="font-serif text-3xl font-bold text-[#D4A373]">{t.reviews.bookingScore}</div>
              <div className="text-[11px] text-white/70 mt-0.5">{t.reviews.bookingScoreLabel}</div>
            </div>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {RESORT_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 border border-neutral-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-0.5 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-600 font-medium">{rev.date}</span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#1E3A2B] mb-2 leading-snug">
                  "{rev.title}"
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-neutral-900">{rev.author}</div>
                  <div className="text-[11px] text-neutral-600">{rev.origin}</div>
                </div>
                <div className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  {rev.badge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

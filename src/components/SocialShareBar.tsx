import { useCmsTranslations } from '../context/CmsContext';
import React, { useState } from 'react';
import { Share2, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { PromotionalCampaign, Language } from '../types';

interface SocialShareBarProps {
  campaign: PromotionalCampaign;
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
  lang?: Language;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({
  campaign,
  variant = 'compact',
  className = '',
  lang = 'pl'
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const t = useCmsTranslations(lang);

  const shareTitle = `Watra Korbielów – ${campaign.title} (-${campaign.discountPercentage}%)`;
  const shareText = t.socialShare.shareText(campaign.title, campaign.discountPercentage, campaign.promoCode);
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}#promo-${campaign.promoCode}` : 'https://watrakorbielow.pl';

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fullShare = `${shareText} ${shareUrl}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleFacebookShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=500');
  };

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (_) {}
    }
    // Fallback toggle
    setIsOpen(!isOpen);
  };

  if (variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center space-x-1.5">
          <Share2 className="w-3.5 h-3.5 text-[#1E3A2B]" />
          <span>{t.socialShare.sharePrompt}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs transition-colors cursor-pointer border border-[#25D366]/30"
            title={t.socialShare.whatsapp}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{t.socialShare.whatsapp}</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-bold text-xs transition-colors cursor-pointer border border-[#1877F2]/30"
            title={t.socialShare.facebook}
          >
            <span className="font-serif font-black text-xs">f</span>
            <span>{t.socialShare.facebook}</span>
          </button>

          {/* X / Twitter */}
          <button
            onClick={handleTwitterShare}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-neutral-900/10 hover:bg-neutral-900/20 text-neutral-800 font-bold text-xs transition-colors cursor-pointer border border-neutral-300"
            title={t.socialShare.twitter}
          >
            <span className="font-bold text-[11px]">𝕏</span>
            <span>{t.socialShare.twitter}</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 font-bold text-xs transition-colors cursor-pointer border border-neutral-300 shadow-2xs"
            title={t.socialShare.copyLink}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">{t.socialShare.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-500" />
                <span>{t.socialShare.copyLink}</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="flex items-center space-x-1.5">
        {/* Direct WhatsApp Quick Button */}
        <button
          onClick={handleWhatsAppShare}
          className="p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#128C7E] transition-all cursor-pointer border border-[#25D366]/30"
          title={t.socialShare.whatsapp}
        >
          <MessageCircle className="w-4 h-4" />
        </button>

        {/* Direct Facebook Quick Button */}
        <button
          onClick={handleFacebookShare}
          className="p-2 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/25 text-[#1877F2] transition-all cursor-pointer border border-[#1877F2]/30 w-8 h-8 flex items-center justify-center font-bold text-xs"
          title={t.socialShare.facebook}
        >
          f
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopyLink}
          className="px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-white text-neutral-700 text-xs font-semibold flex items-center space-x-1 border border-neutral-200 shadow-2xs transition-colors cursor-pointer"
          title={t.socialShare.copyLink}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-bold text-[11px]">{t.socialShare.copied}</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-neutral-500" />
              <span className="text-[11px]">{t.socialShare.shareBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

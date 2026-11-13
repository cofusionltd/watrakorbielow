import { useCmsTranslations } from '../context/CmsContext';
import React, { useState } from 'react';
import { Language } from '../types';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Car, Navigation, CreditCard, ShieldCheck } from 'lucide-react';
import { GoogleMapsTripPlanner } from '../components/GoogleMapsTripPlanner';

interface ContactPageProps {
  lang: Language;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang }) => {
  const t = useCmsTranslations(lang);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDates, setFormDates] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/contact/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          phone: formPhone,
          dates: formDates,
          message: formMessage,
        }),
      });
      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(t.contactPage.submitError);
      }

      setIsSubmitted(true);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormDates('');
      setFormMessage('');
    } catch (error) {
      console.error('Contact inquiry submission failed:', error);
      setSubmitError(error instanceof Error ? error.message : t.contactPage.submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-[#F9F8F6] text-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#1E3A2B] uppercase tracking-widest bg-[#1E3A2B]/10 px-3 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-[#1E3A2B]" />
            <span>{t.contactPage.tag}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1E3A2B]">
            {t.contactPage.title}
          </h1>
          <p className="text-sm sm:text-base text-neutral-600">
            {t.contactPage.subtitle}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1E3A2B] text-[#D4A373] flex items-center justify-center font-bold">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1E3A2B]">{t.contactPage.phoneTitle}</h3>
            <p className="text-xs text-neutral-500">{t.contactPage.phoneHours}</p>
            <div className="pt-2">
              <a href="tel:+48511660511" className="font-mono text-base font-bold text-[#1E3A2B] hover:text-[#C86D51]">
                +48 511 660 511
              </a>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1E3A2B] text-[#D4A373] flex items-center justify-center font-bold">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1E3A2B]">{t.contactPage.emailTitle}</h3>
            <p className="text-xs text-neutral-500">{t.contactPage.emailSubtitle}</p>
            <div className="pt-2">
              <a href="mailto:biuro@watrakorbielow.pl" className="font-medium text-sm text-[#1E3A2B] hover:text-[#C86D51] underline">
                biuro@watrakorbielow.pl
              </a>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1E3A2B] text-[#D4A373] flex items-center justify-center font-bold">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#1E3A2B]">{t.contactPage.locationTitle}</h3>
            <p className="text-xs text-neutral-500">{t.contactPage.locationRegion}</p>
            <div className="pt-2 text-xs font-semibold text-neutral-800">
              {t.contactPage.address}
            </div>
          </div>
        </div>

        {/* Interactive Google Maps & Trip Planner */}
        <section id="map-and-directions-section">
          <GoogleMapsTripPlanner lang={lang} />
        </section>

        {/* Contact Form & Bank Details Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#1E3A2B]">
                {t.contactPage.formTitle}
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                {t.contactPage.formSubtitle}
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-3 animate-in fade-in duration-300">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-emerald-900">
                  {t.contactPage.formSuccessTitle}
                </h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  {t.contactPage.formSuccessDesc}
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmitError('');
                  }}
                  className="mt-3 bg-[#1E3A2B] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {t.contactPage.formSendAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                      {t.contactPage.nameLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.contactPage.namePlaceholder}
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                      {t.contactPage.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder={t.contactPage.phonePlaceholder}
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                      {t.contactPage.emailLabel}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder={t.contactPage.emailPlaceholder}
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                      {t.contactPage.datesLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.contactPage.datesPlaceholder}
                      value={formDates}
                      onChange={(e) => setFormDates(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E3A2B] uppercase mb-1">
                    {t.contactPage.messageLabel}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={t.contactPage.messagePlaceholder}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full bg-[#F9F8F6] border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-800 resize-none"
                  />
                </div>

                {submitError && (
                  <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1E3A2B] hover:bg-[#2A4F3B] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t.contactPage.sending : t.contactPage.submitBtn}</span>
                </button>
              </form>
            )}
          </div>

          {/* Bank & Payment Info Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-[#D4A373]" />
                <h3 className="font-serif text-lg font-bold text-[#1E3A2B]">
                  {t.contactPage.depositTitle}
                </h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {t.contactPage.depositSubtitle}
              </p>

              <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-neutral-200 space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase font-bold">{t.contactPage.recipientLabel}</span>
                  <span className="font-semibold text-neutral-800">{t.contactPage.recipientValue}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase font-bold">{t.contactPage.bankLabel}</span>
                  <span className="font-semibold text-neutral-800">{t.contactPage.bankValue}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase font-bold">{t.contactPage.accountNumberLabel}</span>
                  <span className="font-mono font-bold text-sm text-[#1E3A2B] tracking-wide select-all">
                    61 1240 4533 1111 0011 3171 8707
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase font-bold">{t.contactPage.transferTitleLabel}</span>
                  <span className="text-neutral-700 italic">
                    {t.contactPage.transferTitleValue}
                  </span>
                </div>
              </div>
            </div>

            {/* Road Directions Box */}
            <div className="bg-[#1E3A2B] text-white p-6 sm:p-8 rounded-3xl shadow-md border border-[#2A4F3B] space-y-4">
              <div className="flex items-center space-x-2">
                <Car className="w-5 h-5 text-[#D4A373]" />
                <h3 className="font-serif text-lg font-bold text-[#F9F8F6]">
                  {t.contactPage.directionsTitle}
                </h3>
              </div>
              <div className="space-y-2.5 text-xs text-white/80">
                <p>
                  <strong>{t.contactPage.fromKatowiceLabel}</strong> {t.contactPage.fromKatowiceText}
                </p>
                <p>
                  <strong>{t.contactPage.fromKrakowLabel}</strong> {t.contactPage.fromKrakowText}
                </p>
                <p>
                  <strong>{t.contactPage.fromSlovakiaLabel}</strong> {t.contactPage.fromSlovakiaText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

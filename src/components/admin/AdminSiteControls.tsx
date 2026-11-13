import React, { useState } from 'react';
import { AlertCircle, CheckCircle, LoaderCircle, Settings2 } from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { adminText } from '../../adminTranslations';
import {
  SITE_COMPONENT_LABELS,
  SITE_FEATURE_LABELS,
  SITE_PAGE_LABELS,
  SiteSettings,
} from '../../siteSettings';
import { Language } from '../../types';

interface AdminSiteControlsProps {
  lang: Language;
}

export const AdminSiteControls: React.FC<AdminSiteControlsProps> = ({ lang }) => {
  const { siteSettings, updateSiteSettings } = useCms();
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ success: boolean; message: string } | null>(null);

  const saveToggle = async (
    section: keyof SiteSettings,
    key: string,
    enabled: boolean
  ) => {
    setSavingKey(`${section}.${key}`);
    setNotice(null);
    const result = await updateSiteSettings({
      [section]: { [key]: enabled },
    } as Partial<SiteSettings>);
    setNotice({ success: result.success, message: result.message || '' });
    setSavingKey(null);
  };

  const renderToggle = (
    section: keyof SiteSettings,
    key: string,
    label: string,
    enabled: boolean
  ) => {
    const controlKey = `${section}.${key}`;
    const isSaving = savingKey === controlKey;
    return (
      <div
        key={controlKey}
        className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-white px-4 py-3"
      >
        <span className="text-sm font-medium text-neutral-800">{adminText(lang, label)}</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={adminText(lang, label)}
          disabled={savingKey !== null}
          onClick={() => void saveToggle(section, key, !enabled)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:cursor-wait disabled:opacity-60 ${
            enabled ? 'bg-emerald-700' : 'bg-neutral-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
          {isSaving && <LoaderCircle className="absolute -right-6 h-4 w-4 animate-spin text-neutral-500" />}
        </button>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#D4A373]/40 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E3A2B] text-[#D4A373]">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1E3A2B]">
              {adminText(lang, 'Widoczność stron i funkcji')}
            </h2>
            <p className="mt-1 text-xs text-neutral-600">
              {adminText(lang, 'Zmiany zapisują się automatycznie i są publikowane na stronie.')}
            </p>
          </div>
        </div>
      </div>

      {notice && (
        <div className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${
          notice.success
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {notice.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{adminText(lang, notice.message)}</span>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#1E3A2B]">
              {adminText(lang, 'Strony')}
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              {adminText(lang, 'Wyłączona strona znika z nawigacji i nie otworzy się pod bezpośrednim adresem.')}
            </p>
          </div>
          {(Object.keys(SITE_PAGE_LABELS) as Array<keyof SiteSettings['pages']>).map((key) =>
            renderToggle('pages', key, SITE_PAGE_LABELS[key], siteSettings.pages[key])
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#1E3A2B]">
                {adminText(lang, 'Rezerwacje i promocje')}
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                {adminText(lang, 'Wyłączenie rezerwacji blokuje także wysłanie rezerwacji przez API. Wyłączenie promocji ukrywa kampanie i wyłącza kody promocyjne.')}
              </p>
            </div>
            {(Object.keys(SITE_FEATURE_LABELS) as Array<keyof SiteSettings['features']>).map((key) =>
              renderToggle('features', key, SITE_FEATURE_LABELS[key], siteSettings.features[key])
            )}
          </div>

          <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#1E3A2B]">
                {adminText(lang, 'Komponenty strony')}
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                {adminText(lang, 'Steruj widocznością głównych sekcji, elementów strony głównej i funkcji widocznych na załączonych podglądach.')}
              </p>
            </div>
            {(Object.keys(SITE_COMPONENT_LABELS) as Array<keyof SiteSettings['components']>).map((key) =>
              renderToggle('components', key, SITE_COMPONENT_LABELS[key], siteSettings.components[key])
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

import { extensionAPI } from '../shared/browser.ts';
import { setLanguage, type Language } from '../shared/locale.ts';
import { useLanguage } from '../shared/useLanguage.ts';

export function LanguagePicker() {
  const language = useLanguage();
  function choose(next: Language) {
    setLanguage(next);
    try { localStorage.setItem('mongbo.language', next); } catch { /* Language still works for this visit. */ }
    const api = extensionAPI(); if (api) void api.storage.local.set({ language: next }).catch(() => {});
  }
  return <div className="language-picker" role="group" aria-label="Language / ภาษา">
    <button type="button" lang="en" aria-label="English" aria-pressed={language === 'en'} onClick={() => choose('en')}>EN</button>
    <button type="button" lang="th" aria-label="ไทย" aria-pressed={language === 'th'} onClick={() => choose('th')}>TH</button>
  </div>;
}

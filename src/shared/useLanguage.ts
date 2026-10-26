import { useEffect, useSyncExternalStore } from 'react';
import { applyDocumentLanguage, getLanguage, parseLanguage, setLanguage, subscribeLanguage } from './locale.ts';

export function useLanguage() {
  const language = useSyncExternalStore(subscribeLanguage, getLanguage);
  useEffect(() => { applyDocumentLanguage(); }, [language]);
  useEffect(() => {
    const synced = (e: StorageEvent) => { if (e.key === 'mongbo.language' || e.key === null) setLanguage(parseLanguage(e.newValue)); };
    window.addEventListener('storage', synced); return () => window.removeEventListener('storage', synced);
  }, []);
  return language;
}

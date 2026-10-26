import { EN } from './en.ts';

export const LANGUAGES = ['th', 'en'] as const;
export type Language = typeof LANGUAGES[number];
export function parseLanguage(value: unknown): Language { return value === 'en' ? 'en' : 'th'; }
export function savedLanguage(): Language { try { return parseLanguage(localStorage.getItem('mongbo.language')); } catch { return 'th'; } }

export function translate(source: string, language: Language, ...values: (string | number)[]): string {
  const key = source.trim(), text = language === 'en' ? EN[key] ?? key : key;
  const translated = text.replace(/\{(\d+)\}/g, (token, index: string) => values[Number(index)] === undefined ? token : String(values[Number(index)]));
  return source.slice(0, source.length - source.trimStart().length) + translated + source.slice(source.trimEnd().length);
}
let language: Language = 'th';
const listeners = new Set<() => void>();
export function getLanguage(): Language { return language; }
export function subscribeLanguage(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function setLanguage(value: Language) {
  const next = parseLanguage(value); if (next === language) return;
  language = next; listeners.forEach(listener => listener());
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('mongbo-languagechange'));
}
export function tr(source: string, ...values: (string | number)[]): string { return translate(source, language, ...values); }
export function applyDocumentLanguage() {
  document.documentElement.lang = language;
  document.title = tr('MongBo — เพื่อนตัวเล็กของคุณ');
}

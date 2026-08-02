import { TRANSLATIONS, translate as coreTranslate } from '../simulation/code-quality';

export type Language = 'en' | 'es' | 'fr' | 'de';

export const LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
];

const EXTRA_TRANSLATIONS: Array<{ key: string; en: string; es: string; fr: string; de: string }> = [
  { key: 'nav.scouting', en: 'Scouting', es: 'Ojeo', fr: 'Recrutement', de: 'Scouting' },
  { key: 'nav.club', en: 'Club', es: 'Club', fr: 'Club', de: 'Verein' },
  { key: 'nav.media', en: 'Media', es: 'Medios', fr: 'Médias', de: 'Medien' },
  { key: 'nav.compete', en: 'Compete', es: 'Competir', fr: 'Compétition', de: 'Wettbewerb' },
  { key: 'nav.profile', en: 'Profile', es: 'Perfil', fr: 'Profil', de: 'Profil' },
  { key: 'nav.system', en: 'System', es: 'Sistema', fr: 'Système', de: 'System' },
  { key: 'staff.hire', en: 'Hire', es: 'Contratar', fr: 'Engager', de: 'Einstellen' },
  { key: 'staff.release', en: 'Release', es: 'Despedir', fr: 'Licencier', de: 'Entlassen' },
  { key: 'transfer.sign', en: 'Sign', es: 'Fichar', fr: 'Signer', de: 'Verpflichten' },
  { key: 'transfer.loan', en: 'Loan', es: 'Cesión', fr: 'Prêt', de: 'Leihe' },
  { key: 'match.quickMatch', en: 'Quick Match', es: 'Partido rápido', fr: 'Match rapide', de: 'Schnellspiel' },
  { key: 'common.cancel', en: 'Cancel', es: 'Cancelar', fr: 'Annuler', de: 'Abbrechen' },
  { key: 'common.confirm', en: 'Confirm', es: 'Confirmar', fr: 'Confirmer', de: 'Bestätigen' },
  { key: 'common.save', en: 'Save', es: 'Guardar', fr: 'Sauvegarder', de: 'Speichern' },
  { key: 'common.close', en: 'Close', es: 'Cerrar', fr: 'Fermer', de: 'Schließen' },
];

let currentLang: Language = 'en';

export function setLanguage(lang: Language): void {
  currentLang = lang;
  try { localStorage.setItem('indie-fm-lang', lang); } catch { /* ignore */ }
}

export function getLanguage(): Language {
  try {
    const stored = localStorage.getItem('indie-fm-lang') as Language | null;
    if (stored && ['en', 'es', 'fr', 'de'].includes(stored)) return stored;
  } catch { /* ignore */ }
  return currentLang;
}

export function t(key: string): string {
  const extra = EXTRA_TRANSLATIONS.find((tr) => tr.key === key);
  if (extra) return extra[currentLang] ?? extra.en;
  return coreTranslate(key, currentLang);
}

export function getAllTranslationKeys(): string[] {
  return [...TRANSLATIONS.map((tr) => tr.key), ...EXTRA_TRANSLATIONS.map((tr) => tr.key)];
}

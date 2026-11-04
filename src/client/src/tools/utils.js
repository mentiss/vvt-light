// utils.js - Fonctions utilitaires génériques
// Les fonctions de jeu Vikings vivent dans systems/vikings/config/ (rules.js, utils.js).

import { PLATFORM_SCOPE, readStored, storageKey, writeStored } from './browserStorage.js';

// Gestion du thème

// Jour / nuit posé sur <html> : tout ce qui est rendu dans la page en hérite,
// y compris hors de la fiche (modales). Seul [data-theme] porte le mode : pas de classe .dark.
// Appelé par la page qui porte la préférence : HomePage (global) ou SystemLayout (slug).
export const applyTheme = (isDark) => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
};

// Thème de la plateforme ('global' : accueil et pages outils) ou d'un slug :
// vtt:platform:theme / vtt:<slug>:theme (spec_browser_storage.md §6)
const themeKey = (slug) => storageKey(slug === 'global' ? PLATFORM_SCOPE : slug, 'theme');
const THEME_DEFAULTS = { dark: false };

export const saveTheme = (isDark, slug = 'global') => {
    writeStored(themeKey(slug), { dark: !!isDark });
};

export const loadTheme = (slug = 'global') => readStored(themeKey(slug), { defaults: THEME_DEFAULTS }).dark === true;

// Date renvoyée par le serveur : SQLite stocke CURRENT_TIMESTAMP en UTC sans
// fuseau (« 2026-10-18 09:30:00 »), que le navigateur lirait comme une heure locale.
export const parseServerDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const iso = String(value).trim().replace(' ', 'T');
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(iso);
    const date = new Date(hasZone ? iso : `${iso}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
};

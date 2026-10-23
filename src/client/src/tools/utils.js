// utils.js - Fonctions utilitaires génériques
// Les fonctions de jeu Vikings vivent dans systems/vikings/config/ (rules.js, utils.js).

// Gestion du thème

// Jour / nuit posé sur <html> : tout ce qui est rendu dans la page en hérite,
// y compris hors de la fiche (modales). La classe .dark reste pour les thèmes qui l'écoutent encore.
// Appelé par la page qui porte la préférence : HomePage (global) ou SystemLayout (slug).
export const applyTheme = (isDark) => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
};

export const saveTheme = (isDark, slug = 'global') => {
    localStorage.setItem(`vtt_theme_${slug}`, isDark ? 'dark' : 'light');
};

export const loadTheme = (slug = 'global') => {
    console.log('[loadTheme]', slug);
    // Migration clé legacy 'pureVikingsTheme' → nouveau format
    if (slug === 'vikings' && !localStorage.getItem(`vtt_theme_vikings`)) {
        const legacy = localStorage.getItem('pureVikingsTheme');
        if (legacy) return legacy === 'dark';
    }
    return localStorage.getItem(`vtt_theme_${slug}`) === 'dark';
};

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

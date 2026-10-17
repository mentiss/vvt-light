// utils.js - Fonctions utilitaires génériques
// Les fonctions de jeu Vikings vivent dans systems/vikings/config/ (rules.js, utils.js).

// Gestion du thème
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

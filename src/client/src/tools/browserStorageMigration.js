// src/client/src/tools/browserStorageMigration.js
// ─────────────────────────────────────────────────────────────────────────────
// Reprise des anciennes clés du navigateur (documentations/spec_browser_storage.md §5),
// une fois, au démarrage de l'application (main.jsx), avant l'affichage : sans elle,
// joueurs et MJ perdraient thème, dés, barre de session et table active.
//
// - Chaque ancien format est reconnu par la forme de sa clé (pas par la liste des
//   slugs actifs), converti, écrit sous la nouvelle clé, puis effacé.
// - Une nouvelle clé déjà présente n'est jamais remplacée.
// - Une ancienne valeur abîmée est effacée sans erreur.
// - Sans rien à reprendre, ne fait rien : peut tourner à chaque démarrage.
// ─────────────────────────────────────────────────────────────────────────────

import { PLATFORM_SCOPE, defaultStorage, storageKey } from './browserStorage.js';

const SESSION_BAR_MODES = ['panel', 'rail', 'hidden'];

const theme = (raw) => ({ dark: raw === 'dark' });

const diceConfig = (raw) => {
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
};

// Anciennes valeurs « 1 » (réduit) et « 0 » (ouvert)
const sessionBar = (raw) => {
    if (raw === '1') return { mode: 'hidden' };
    if (raw === '0') return { mode: 'panel' };
    return SESSION_BAR_MODES.includes(raw) ? { mode: raw } : undefined;
};

const activeSession = (raw) => {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? { activeSessionId: id } : undefined;
};

/**
 * Anciennes clés reconnues : [motif, (correspondance) => nouvelle clé | null, conversion].
 * Une nouvelle clé nulle (ou une conversion qui ne donne rien) : l'ancienne est seulement effacée.
 */
const RULES = [
    [/^vtt_theme_global$/,          () => storageKey(PLATFORM_SCOPE, 'theme'), theme],
    [/^vtt_theme_(.+)$/,            (m) => storageKey(m[1], 'theme'), theme],
    [/^(.+)_vtt-dice_config$/,      (m) => storageKey(m[1], 'dice'), diceConfig],
    [/^(.+)_player_session_bar$/,   (m) => storageKey(m[1], 'session-bar'), sessionBar],
    [/^activeSessionId_(.+)$/,      (m) => storageKey(m[1], 'gm'), activeSession],
    // Clé morte (écrite, jamais lue) et reste d'un bug de TableManagementModal
    [/^currentCharacterId_.+$/,     () => null, () => undefined],
    [/^activeSessionId$/,           () => null, () => undefined],
];

/**
 * @param {Storage} [storage]
 * @returns {string[]} anciennes clés traitées
 */
export function migrateLegacyStorage(storage = defaultStorage()) {
    if (!storage) return [];
    const handled = [];
    try {
        const keys = [];
        for (let i = 0; i < storage.length; i++) keys.push(storage.key(i));

        const put = (key, data) => {
            if (storage.getItem(key) === null) storage.setItem(key, JSON.stringify({ v: 1, data }));
        };

        for (const key of keys) {
            for (const [pattern, target, convert] of RULES) {
                const match = pattern.exec(key);
                if (!match) continue;
                const newKey = target(match);
                const data = newKey ? convert(storage.getItem(key)) : undefined;
                if (newKey && data !== undefined) put(newKey, data);
                storage.removeItem(key);
                handled.push(key);
                break;
            }
        }

        // Ancien thème Vikings : seulement si rien de plus récent n'existe (vtt_theme_vikings repris ci-dessus)
        const legacyVikings = storage.getItem('pureVikingsTheme');
        if (legacyVikings !== null) {
            put(storageKey('vikings', 'theme'), theme(legacyVikings));
            storage.removeItem('pureVikingsTheme');
            handled.push('pureVikingsTheme');
        }
    } catch (error) {
        console.warn('[browserStorage] Legacy migration interrupted:', error);
    }
    return handled;
}

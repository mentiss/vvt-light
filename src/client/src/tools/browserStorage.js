// src/client/src/tools/browserStorage.js
// ─────────────────────────────────────────────────────────────────────────────
// Stockage navigateur de la plateforme (documentations/spec_browser_storage.md) :
// le seul point d'accès à ce que l'application garde dans ce navigateur
// (localStorage) — réglages, état d'interface, état de travail du MJ.
// Les composants ne touchent jamais localStorage directement : usePersistedState
// (hooks/usePersistedState.js) dans React, ces fonctions ailleurs.
//
// - Clés : vtt:<portée>:<fonction> ; portées 'platform', '<slug>', '<slug>:<table>'.
// - Format enregistré : { "v": version, "data": valeur }.
// - Jamais d'erreur levée : stockage indisponible (navigation privée, plein) ou
//   valeur abîmée → valeur par défaut, le réglage vaut pour la page seulement.
// Le stockage est passé en paramètre (tests) ; window.localStorage par défaut.
// ─────────────────────────────────────────────────────────────────────────────

const PREFIX = 'vtt:';

/** Portée de la plateforme (tout le navigateur). Aucun slug ne peut s'appeler ainsi. */
export const PLATFORM_SCOPE = 'platform';

/** Clé d'une fonction dans une portée : vtt:<portée>:<fonction>. */
export const storageKey = (scope, name) => `${PREFIX}${scope}:${name}`;

/** Portée d'une table d'un jeu : <slug>:<identifiant de la table>. */
export const tableScope = (slug, sessionId) => `${slug}:${sessionId}`;

export const defaultStorage = () => {
    try { return window.localStorage; } catch { return null; }
};

// ─── Abonnés de la page (les autres onglets passent par l'événement « storage ») ──

const listeners = new Map();   // clé → Set<fonction>

/** Prévenu à chaque écriture ou effacement de la clé dans cette page. Renvoie le désabonnement. */
export function subscribeStored(key, listener) {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(listener);
    return () => {
        const set = listeners.get(key);
        set?.delete(listener);
        if (set?.size === 0) listeners.delete(key);
    };
}

const notify = (key) => listeners.get(key)?.forEach(listener => listener());

// ─── Lecture ────────────────────────────────────────────────────────────────

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

/** Texte enregistré sous la clé, ou null (absente, stockage indisponible). */
export function readRaw(key, storage = defaultStorage()) {
    try { return storage?.getItem(key) ?? null; } catch { return null; }
}

/**
 * Valeur d'un texte enregistré, ou `defaults`.
 *
 * @param {string|null} raw
 * @param {object} [options]
 * @param {*}        [options.defaults] valeur par défaut ; pour un objet, complète les champs manquants
 * @param {number}   [options.version]  version attendue (1 par défaut)
 * @param {Function} [options.migrate]  (data, ancienneVersion) => data : conversion d'une autre version
 * @param {Function} [options.validate] (data) => boolean : refuse une valeur abîmée
 */
export function parseStored(raw, { defaults = null, version = 1, migrate, validate } = {}) {
    if (raw === null || raw === undefined) return defaults;
    let doc;
    try { doc = JSON.parse(raw); } catch { return defaults; }
    if (!isPlainObject(doc) || !('data' in doc)) return defaults;

    let data = doc.data;
    const from = doc.v ?? 1;
    if (from !== version) {
        if (!migrate) return defaults;
        try { data = migrate(data, from); } catch { return defaults; }
    }
    if (validate && !validate(data)) return defaults;
    if (isPlainObject(defaults) && isPlainObject(data)) return { ...defaults, ...data };
    return data ?? defaults;
}

/** Valeur enregistrée sous la clé, ou `defaults` (options : voir parseStored). */
export function readStored(key, options = {}, storage = defaultStorage()) {
    return parseStored(readRaw(key, storage), options);
}

// ─── Écriture ───────────────────────────────────────────────────────────────

/** Enregistre la valeur ; false si le stockage est indisponible. */
export function writeStored(key, value, { version = 1 } = {}, storage = defaultStorage()) {
    try {
        storage.setItem(key, JSON.stringify({ v: version, data: value }));
        notify(key);
        return true;
    } catch {
        return false;
    }
}

export function removeStored(key, storage = defaultStorage()) {
    try { storage?.removeItem(key); } catch { /* stockage indisponible */ }
    notify(key);
}

/** Clés de la plateforme présentes dans ce navigateur. */
export function listStoredKeys(storage = defaultStorage()) {
    try {
        const keys = [];
        for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key?.startsWith(PREFIX)) keys.push(key);
        }
        return keys;
    } catch {
        return [];
    }
}

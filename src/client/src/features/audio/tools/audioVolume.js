// src/client/src/features/audio/tools/audioVolume.js
// ─────────────────────────────────────────────────────────────────────────────
// Volumes du joueur (documentations/spec_audio.md §10.8, S-13, S-16) : un volume
// général et un par type de piste, réglés par le joueur et jamais envoyés par le
// MJ. Gardés dans le navigateur pour toute la plateforme (vtt:platform:audio, par
// AudioLayer et usePersistedState). Fonctions pures, testées sous Vitest.
// ─────────────────────────────────────────────────────────────────────────────

// Type de chaque piste fixe (§11.3)
export const SLOT_TYPES = { music: 'music', ambience1: 'ambience', ambience2: 'ambience', effect: 'effect' };

// Pré-réglages de la plateforme, en %
export const DEFAULT_VOLUMES = { master: 100, music: 50, ambience: 10, effect: 50, muted: false };

const LEVELS = ['master', 'music', 'ambience', 'effect'];

const clamp = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : fallback;
};

/** Normalise des réglages partiels ou abîmés : chaque niveau entre 0 et 100, sinon le pré-réglage. */
export function normalizeVolumes(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const volumes = { muted: source.muted === true };
    for (const level of LEVELS) volumes[level] = clamp(source[level], DEFAULT_VOLUMES[level]);
    return volumes;
}

/**
 * Volume d'une piste pour le lecteur YouTube (0 à 100) :
 * gain de la vidéo × volume du type × volume général, 0 si coupé.
 *
 * @param {string} slot     clé de piste (music, ambience1…)
 * @param {number} gain     gain de la vidéo, réglé par le MJ (0 à 100)
 * @param {object} volumes  réglages du joueur
 */
export function slotVolume(slot, gain, volumes) {
    const v = normalizeVolumes(volumes);
    if (v.muted) return 0;
    const type = SLOT_TYPES[slot];
    if (!type) return 0;
    return Math.round(clamp(gain, 100) * v[type] * v.master / 10000);
}

// src/client/src/features/board/tools/boardFilters.js
// ─────────────────────────────────────────────────────────────────────────────
// Filtres d'image du tableau (documentations/spec_tableau.md §13.2, Q-49), pur.
// Un filtre enregistré : { preset, brightness, contrast, saturation }, 1 = neutre,
// bornés à [0, 2] comme côté serveur. Le préréglage règle les trois curseurs et
// peut ajouter sa teinte (sépia, nuit bleutée), que les curseurs ne touchent pas.
// ─────────────────────────────────────────────────────────────────────────────

export const FILTER_MIN = 0;
export const FILTER_MAX = 2;

/** Préréglages : libellé, valeurs des curseurs, teinte propre */
export const FILTER_PRESETS = [
    { id: 'normal', label: 'Normal', brightness: 1,    contrast: 1,    saturation: 1,   tint: '' },
    { id: 'night',  label: 'Nuit',   brightness: 0.55, contrast: 1.15, saturation: 0.6, tint: 'sepia(0.25) hue-rotate(180deg)' },
    { id: 'dark',   label: 'Sombre', brightness: 0.6,  contrast: 1.05, saturation: 0.9, tint: '' },
    { id: 'sepia',  label: 'Sépia',  brightness: 1,    contrast: 1,    saturation: 0.9, tint: 'sepia(0.8)' },
    { id: 'faded',  label: 'Délavé', brightness: 1.1,  contrast: 0.75, saturation: 0.5, tint: '' },
];

/** Les trois curseurs : clé, libellé */
export const FILTER_SLIDERS = [
    { key: 'brightness', label: 'Luminosité' },
    { key: 'contrast',   label: 'Contraste' },
    { key: 'saturation', label: 'Saturation' },
];

const presetOf = (id) => FILTER_PRESETS.find(p => p.id === id) ?? FILTER_PRESETS[0];
const clampValue = (value) => Math.min(FILTER_MAX, Math.max(FILTER_MIN, Math.round(Number(value) * 100) / 100));

/** Filtre d'un préréglage, curseurs compris */
export function presetFilter(id) {
    const { brightness, contrast, saturation } = presetOf(id);
    return { preset: presetOf(id).id, brightness, contrast, saturation };
}

/** Filtre avec un curseur changé (borné), le préréglage (et sa teinte) gardé */
export const withSlider = (filter, key, value) => ({ ...(filter ?? presetFilter('normal')), [key]: clampValue(value) });

/** Filtre neutre (Normal sans retouche) : rien à enregistrer */
export const isNeutral = (filter) => !filter
    || (filter.preset === 'normal' && filter.brightness === 1 && filter.contrast === 1 && filter.saturation === 1);

/** Valeur CSS `filter` d'une image ; undefined si neutre */
export function filterCss(filter) {
    if (isNeutral(filter)) return undefined;
    const { tint } = presetOf(filter.preset);
    return `brightness(${filter.brightness}) contrast(${filter.contrast}) saturate(${filter.saturation})${tint ? ` ${tint}` : ''}`;
}

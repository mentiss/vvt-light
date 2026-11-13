// src/client/src/features/genmap/tools/presetFile.js
// ─────────────────────────────────────────────────────────────────────────────
// Presets personnels et fichiers JSON du générateur de plans (spec_genmap.md §41, M6, P-1, P-2).
// Fonctions pures : copie d'un preset, export d'un preset ou d'une recette (preset + réglages +
// graine + époque), lecture et contrôle d'un fichier importé.
// ─────────────────────────────────────────────────────────────────────────────

export const PRESET_FORMAT = 'vtt-genmap-preset';
export const RECIPE_FORMAT = 'vtt-genmap-recipe';

// Identifiant libre parmi ceux déjà pris : « perso-1 », « perso-2 »…
export const freeId = (taken) => {
    let n = 1;
    while (taken.includes(`perso-${n}`)) n++;
    return `perso-${n}`;
};

// Copie modifiable d'un preset (un preset fourni ne se modifie pas, on le copie, P-1)
export const copyPreset = (preset, taken, label = `${preset.label} (copie)`) => ({
    ...structuredClone(preset), id: freeId(taken), label, personal: true,
});

// Nouveau preset : un petit programme qui se génère tel quel (une entrée seule serait refusée,
// bâtiment trop grand pour son programme) ; l'utilisateur compose la suite
export const emptyPreset = (taken) => ({
    id: freeId(taken), label: 'Nouveau preset', personal: true,
    params: { width: 10, length: 8, floors: 0, basement: false, density: 'dense' },
    context: { era: null, traits: { accepted: [], default: [] }, rank: null },
    rooms: [
        { type: 'entrance', quantity: 1 }, { type: 'living', quantity: 1 },
        { type: 'kitchen', quantity: 1 }, { type: 'bedroom', quantity: 1, floor: 'ground' },
    ],
    optionalRooms: [],
    stairs: [],
});

/** Texte JSON d'un preset, à télécharger. */
export const exportPreset = (preset) => JSON.stringify({ format: PRESET_FORMAT, version: 1, preset }, null, 2);

/** Texte JSON d'une recette : refaire exactement le même plan ailleurs (P-2). */
export const exportRecipe = ({ preset, params, seed, era = null, traits = null, keep = [] }) => JSON.stringify({
    format: RECIPE_FORMAT, version: 1, preset, params, seed, era, traits, keep,
}, null, 2);

// Contrôle d'un preset lu dans un fichier : ce que le moteur exige, types connus
const checkPreset = (preset, roomTypes) => {
    if (!preset || typeof preset !== 'object') throw new Error('Le fichier ne contient pas de preset.');
    if (typeof preset.label !== 'string' || !preset.label.trim()) throw new Error('Le preset n\'a pas de nom.');
    if (!preset.params || !Number.isFinite(preset.params.width) || !Number.isFinite(preset.params.length)) throw new Error('Le preset n\'a pas de dimensions.');
    if (!Array.isArray(preset.rooms) || !preset.rooms.length) throw new Error('Le preset n\'a aucune pièce.');
    const known = new Set(roomTypes.map(t => t.id));
    const families = new Set(roomTypes.map(t => t.family).filter(Boolean));
    for (const entry of [...preset.rooms, ...(preset.optionalRooms ?? [])]) {
        if (entry.family ? !families.has(entry.family) : !known.has(entry.type)) {
            throw new Error(`Type de pièce inconnu : ${entry.type ?? entry.family}.`);
        }
    }
    if (preset.stairs && !Array.isArray(preset.stairs)) throw new Error('Les escaliers du preset sont mal formés.');
    return preset;
};

/**
 * Lit un fichier JSON du générateur.
 * @returns {{ kind: 'preset', preset } | { kind: 'recipe', preset, params, seed, era, keep }}
 * @throws {Error} message lisible si le fichier ne convient pas
 */
export const readGenmapFile = (text, roomTypes) => {
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('Le fichier n\'est pas un JSON valide.'); }
    if (data?.format === PRESET_FORMAT) return { kind: 'preset', preset: checkPreset(data.preset, roomTypes) };
    if (data?.format === RECIPE_FORMAT) {
        if (!Number.isFinite(data.seed)) throw new Error('La recette n\'a pas de graine.');
        return { kind: 'recipe', preset: checkPreset(data.preset, roomTypes), params: data.params ?? {}, seed: data.seed, era: data.era ?? null, traits: data.traits ?? null, keep: data.keep ?? [] };
    }
    throw new Error('Ce fichier n\'est ni un preset ni une recette du générateur de plans.');
};

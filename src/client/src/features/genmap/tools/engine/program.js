// src/client/src/features/genmap/tools/engine/program.js
// Moteur du générateur de plans (spec_genmap.md), découpé par étape (§36.10, M2).
// Programme : preset résolu, quantités, niveaux.

import library from '../../data/library.json';

const eraIndex = (id) => library.eras.findIndex(e => e.id === id);
const rankIndex = (id) => library.ranks.findIndex(r => r.id === id);
const within = (range, index, value) => !range || value == null
    || ((range.from == null || index(range.from) <= index(value)) && (range.to == null || index(value) <= index(range.to)));

// Contexte du preset (§36.7a) : plage d'époque et époque de référence, traits acceptés et actifs
// par défaut, rang du bâtiment. `null` partout pour un preset qui n'en déclare pas.
export const presetContext = (preset) => ({
    era: preset.context?.era ?? null,
    traits: preset.context?.traits ?? { accepted: [], default: [] },
    rank: preset.context?.rank ?? null,
});

// Un type a-t-il un sens dans ce contexte (§36.6b) : époque dans sa plage, traits exigés actifs,
// rang dans sa plage
export const fitsContext = (type, { era = null, traits = [], rank = null }) => within(type.era, eraIndex, era)
    && (type.traits ?? []).every(t => traits.includes(t))
    && within(type.rank, rankIndex, rank);

// Preset (types référencés par id) → programme (types complets) et paramètres. Le programme
// porte aussi le réservoir de pièces de complément et le schéma de circulation (§18), en option.
// Contexte (§36.8) : `context` = { era, traits } choisis dans la page (par défaut ceux du preset) ;
// les critères guident, l'utilisateur décide :
// - pièce de complément et annexe du réservoir hors contexte : écartées (le générateur ne pioche
//   jamais hors contexte de lui-même) ;
// - pièce obligatoire hors contexte : retirée et signalée (`removed`), sauf si l'utilisateur la
//   garde (`keep`, ids de types) : elle reste, marquée `anachronic` ;
// - entrée `{ "family": "bath" }` : variantes de la famille qui ont un sens dans le contexte, la
//   graine choisit (`variants`) ; aucune variante = pièce absente, sans échec.
export const resolvePreset = (preset, roomTypes, context = null, keep = []) => {
    const defaults = presetContext(preset);
    const ctx = {
        era: context?.era ?? defaults.era?.default ?? null,
        traits: context?.traits ?? defaults.traits.default ?? [],
        rank: defaults.rank,
    };
    const removed = [];
    // Une entrée de preset peut surcharger des propriétés du type, ex. son étage (§20, E2-8)
    const resolve = ({ type, family, ...overrides }, mandatory) => {
        if (family) {
            // Une entrée sans hôte (`per`) ne tire pas de pièce adjointe (salle d'eau attenante)
            const variants = roomTypes.filter(t => t.family === family && fitsContext(t, ctx) && (overrides.per || t.role !== 'annex'))
                .map(t => ({ ...t, ...overrides }));
            return variants.length ? { ...variants[0], variants } : null;
        }
        const resolved = { ...roomTypes.find(t => t.id === type), ...overrides };
        if (fitsContext(resolved, ctx)) return resolved;
        if (!mandatory) return null;
        if (keep.includes(type)) return { ...resolved, anachronic: true };
        if (!removed.some(r => r.id === type)) removed.push({ id: type, label: resolved.label });
        return null;
    };
    return {
        params: { ...preset.params },
        context: { ...defaults, current: ctx },
        removed,
        program: {
            rooms: preset.rooms.map(e => resolve(e, true)).filter(Boolean),
            optionalRooms: (preset.optionalRooms ?? []).map(e => resolve(e, false)).filter(Boolean),
            // Dispositions d'escaliers (§38.5) : la graine en tire une ; chacune liste ses cages
            stairs: (preset.stairs ?? []).map(d => ({ cages: d.cages.map(cage => ({ ...cage })) })),
            layout: preset.layout ?? null,
            layoutByLevel: preset.layoutByLevel ?? null,
            // Types possibles pour les petits restes isolés (§29, §31) : annexes (accès obligatoire
            // à une pièce, circulation interdite : dressing, salle d'eau attenante, cellier…), et le
            // débarras par défaut
            closetType: roomTypes.find(t => t.id === 'closet') ?? null,
            // Pièce posée dans un grand reste quand rien d'autre ne va (§37, GR-1)
            storeType: roomTypes.find(t => t.id === 'storeroom') ?? null,
            spaceAnnexTypes: roomTypes.filter(t => t.id !== 'closet' && t.role === 'annex' && t.circulationAccess === 'forbidden' && fitsContext(t, ctx)),
        },
    };
};

export const quantityRange = (entry) => (Array.isArray(entry.quantity) ? entry.quantity : [entry.quantity ?? 1, entry.quantity ?? 1]);

export const levelsOf = (params) => [
    ...(params.basement ? [-1] : []),
    0,
    ...Array.from({ length: params.floors }, (_, i) => i + 1),
];

// Étage d'une pièce ou d'une extrémité de lien : imposé, ou tiré par la graine (§2.2)
export const resolveLevel = (floor, params, rnd) => {
    const levels = levelsOf(params);
    const uppers = levels.filter(l => l > 0);
    if (floor === 'ground') return 0;
    if (floor === 'basement') return params.basement ? -1 : null;
    if (floor === 'upper') return uppers.length ? rnd.pick(uppers) : null;
    if (floor === 'top') return Math.max(...levels);   // dernier étage (§34, CO-9)
    if (floor === 'any' || floor == null) return rnd.pick(levels);
    const level = Number(floor);
    return levels.includes(level) ? level : null;
};

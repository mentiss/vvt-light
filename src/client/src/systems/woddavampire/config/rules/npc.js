// src/client/src/systems/woddavampire/config/rules/npc.js
// ─────────────────────────────────────────────────────────────────────────────
// PNJ du Conteur (spec_pnj.md §10.3) : règles pures, testées.
// Partie système d'une fiche : { nature, attributes, abilities, disciplines, willpower, blood,
//   health, attacks, damage, healthPoints, initiative, rage, gnosis, essence, charms, traits } ;
// nuée : damage (dés de dégâts par tour), healthPoints (santé), initiative ;
// nature : character (mortel, goule, vampire), ghost (Passion au lieu du sang), animal, swarm, spirit.
// État à la table : { bashing, lethal, aggravated } (personnage, animal), { damage } (nuée),
//   { essence } (esprit), plus { blood, willpower } dépensables.
// Santé : niveaux de la fiche (un animal a les siens, livre p.396-399), sinon les 7 du livre (§9.1).
// ─────────────────────────────────────────────────────────────────────────────

import { BASE_LEVELS } from './sheetRules.js';

export const NATURES = { character: 'Personnage', ghost: 'Fantôme', animal: 'Animal', swarm: 'Nuée', spirit: 'Esprit' };
// Blocs de la fiche selon la nature
export const hasTraits = (sd) => ['character', 'ghost', 'animal'].includes(sd?.nature ?? 'character');

// Attributs à 1 au départ, le minimum d'un personnage
const ATTRIBUTE_KEYS = ['strength', 'dexterity', 'stamina', 'charisma', 'manipulation', 'appearance', 'perception', 'intelligence', 'wits'];

export const npcDefaults = () => ({
    nature: 'character', attributes: Object.fromEntries(ATTRIBUTE_KEYS.map(k => [k, 1])), abilities: [], disciplines: [], willpower: 3, blood: 0,
    health: null, attacks: [], damage: null, healthPoints: null, initiative: null, rage: null, gnosis: null, essence: null, charms: [], traits: [],
});

/** Niveaux de santé d'un PNJ : les siens, ou les 7 du livre */
export const npcHealthLevels = (sd) => (Array.isArray(sd?.health) && sd.health.length ? sd.health : BASE_LEVELS);

/**
 * Niveaux de santé saisis en texte, comme dans le livre : « OK, −1, −1, −2, −5, Neutralisé ».
 * OK = sans malus ; un nombre = son malus ; un autre mot (Neutralisé, Mort) = hors de combat. Vide : null (les 7 du livre).
 */
export const parseHealth = (text) => {
    const parts = String(text ?? '').split(',').map(s => s.trim()).filter(Boolean);
    if (!parts.length) return null;
    return parts.map(label => {
        if (/^ok$/i.test(label)) return { label: 'OK', penalty: 0 };
        const n = label.replace('−', '-');
        if (/^-?\d+$/.test(n)) return { label, penalty: Number(n) };
        return { label, penalty: null };
    });
};
export const formatHealth = (levels) => (Array.isArray(levels) ? levels.map(l => l.label).join(', ') : '');

/** Marques de santé : aggravé, puis létal, puis contondant (comme la fiche d'un personnage) */
export const npcHealthMarks = (sd, state) => {
    const n = npcHealthLevels(sd).length;
    const agg = Math.min(n, state?.aggravated ?? 0);
    const leth = Math.min(n - agg, state?.lethal ?? 0);
    const bash = Math.min(n - agg - leth, state?.bashing ?? 0);
    return [...Array(agg).fill('aggravated'), ...Array(leth).fill('lethal'), ...Array(bash).fill('bashing'), ...Array(n - agg - leth - bash).fill('')];
};

const NEXT_MARK = { '': 'bashing', bashing: 'lethal', lethal: 'aggravated', aggravated: '' };

/** Clic sur la case i : vide → contondant → létal → aggravé → vide */
export const cycleNpcHealth = (sd, state, index) => {
    const marks = npcHealthMarks(sd, state);
    marks[index] = NEXT_MARK[marks[index]];
    return {
        bashing: marks.filter(m => m === 'bashing').length,
        lethal: marks.filter(m => m === 'lethal').length,
        aggravated: marks.filter(m => m === 'aggravated').length,
    };
};

/** Malus du pire niveau atteint ; incapacitated : un niveau sans malus chiffré (Neutralisé) */
export const npcWound = (sd, state) => {
    const levels = npcHealthLevels(sd);
    const filled = npcHealthMarks(sd, state).filter(Boolean).length;
    if (filled === 0) return { penalty: 0, incapacitated: false, worstIndex: -1 };
    const level = levels[filled - 1];
    return { penalty: level.penalty ?? 0, incapacitated: level.penalty === null, worstIndex: filled - 1 };
};

/** Réserve d'un jet composé : Attribut + Capacité, malus de blessure retranché (jamais négative) */
export const npcPool = (sd, state, { attribute = null, ability = null } = {}) => {
    const attr = attribute ? Number(sd?.attributes?.[attribute] ?? 0) : 0;
    const abil = ability ? Number((sd?.abilities ?? []).find(a => a.key === ability)?.rating ?? 0) : 0;
    return Math.max(0, attr + abil + npcWound(sd, state).penalty);
};

/** Hors de combat : Neutralisé (personnage, animal), santé de la nuée épuisée, Essence d'un esprit à 0 */
export const isOut = (sd, state) => {
    const nature = sd?.nature ?? 'character';
    if (nature === 'swarm') return Number(state?.damage ?? 0) >= Number(sd?.healthPoints ?? Infinity);
    if (nature === 'spirit') return state?.essence != null && Number(state.essence) <= 0;
    return npcWound(sd, state).incapacitated || npcHealthMarks(sd, state).every(Boolean);
};

/** État de départ à la table */
export const initialNpcState = (sd) => {
    const nature = sd?.nature ?? 'character';
    if (nature === 'swarm') return { damage: 0 };
    if (nature === 'spirit') return { essence: sd?.essence ?? 0 };
    return { bashing: 0, lethal: 0, aggravated: 0, blood: sd?.blood ?? 0, willpower: sd?.willpower ?? 0 };
};

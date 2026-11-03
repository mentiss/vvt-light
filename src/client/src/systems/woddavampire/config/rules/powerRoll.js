// src/client/src/systems/woddavampire/config/rules/powerRoll.js
// ─────────────────────────────────────────────────────────────────────────────
// Lecture des colonnes « Jet » et « Coût » des annexes de pouvoirs (spec
// §II.5, §II.11 B-1). Fonctions pures : utilisées par le script de génération
// des catalogues (scripts/woddavampire/generate-powers.mjs) et testées.
//
// Un jet structuré : { traits: [{ kind, key }], choices: [[{ kind, key }]], difficulty, diffNote }
//   kind : attribute | ability | virtue | road | willpower | discipline
//   choices : un trait à choisir parmi plusieurs (« Empathie ou Médecine »)
//   difficulty : nombre, ou null si elle n'est pas fixe (saisie au lancer, diffNote dit laquelle)
// Ce qui ne suit pas le format simple « A + B, diff N » reste en texte (null).
// ─────────────────────────────────────────────────────────────────────────────

import { ATTRIBUTE_GROUPS, ABILITY_GROUPS, BODY_CRAFTS } from '../traits.js';
import { DISCIPLINES } from '../disciplines.js';

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, "'").trim();

// Abréviations des annexes (Per, Man, Ast…) et noms complets
const ATTRIBUTE_ABBR = {
    for: 'strength', dex: 'dexterity', vig: 'stamina', cha: 'charisma', man: 'manipulation', app: 'appearance',
    per: 'perception', int: 'intelligence', ast: 'wits',
};
const ATTRIBUTES = Object.fromEntries(ATTRIBUTE_GROUPS.flatMap(g => g.attributes).map(([k, l]) => [norm(l), k]));
const ABILITIES = Object.fromEntries([...ABILITY_GROUPS.flatMap(g => g.abilities), BODY_CRAFTS].map(([k, l]) => [norm(l), k]));
const DISCIPLINE_NAMES = Object.fromEntries(Object.entries(DISCIPLINES).map(([k, d]) => [norm(d.label), k]));
const VIRTUES = {
    'maitrise/instinct': 'virtueControl', 'instinct/maitrise': 'virtueControl', maitrise: 'virtueControl', instinct: 'virtueControl',
    'conscience/conviction': 'virtueMoral', 'conviction/conscience': 'virtueMoral', conviction: 'virtueMoral',
    courage: 'virtueCourage',
};

/**
 * Un nom de trait → { kind, key } ou null.
 * « Conscience » est la Capacité (Awareness) après un Attribut, la Vertu seule.
 */
export const parseTrait = (raw, afterAttribute = false) => {
    const t = norm(raw);
    if (ATTRIBUTE_ABBR[t]) return { kind: 'attribute', key: ATTRIBUTE_ABBR[t] };
    if (ATTRIBUTES[t]) return { kind: 'attribute', key: ATTRIBUTES[t] };
    if (t === 'conscience') return afterAttribute ? { kind: 'ability', key: 'awareness' } : { kind: 'virtue', key: 'virtueMoral' };
    if (ABILITIES[t]) return { kind: 'ability', key: ABILITIES[t] };
    if (VIRTUES[t]) return { kind: 'virtue', key: VIRTUES[t] };
    if (t === 'volonte') return { kind: 'willpower', key: 'willpower' };
    if (t === 'route' || t.startsWith('route de')) return { kind: 'road', key: 'road' };
    if (DISCIPLINE_NAMES[t]) return { kind: 'discipline', key: DISCIPLINE_NAMES[t] };
    return null;
};

/**
 * Colonne « Jet » → jet structuré, ou null si le texte ne suit pas le format simple.
 * Formats reconnus : « A + B, diff N », « A, diff N », « A + B ou C, diff N »,
 * suivis éventuellement d'une précision (« diff 6 (modifiée par…) », « ; … »).
 */
export const parseRollText = (text) => {
    if (!text || /^[–-](\s|$)/.test(text.trim())) return null;   // « – » ou « – (3 tours) » : pas de jet
    // « A + B, diff N … » ; « A + B, diff = X de la cible » (à fixer au lancer) ; « A + B (précision) » sans difficulté
    const fixed = text.match(/^([^,;:]+?),\s*diff\s*(\d+)\s*(.*)$/i);
    const asked = !fixed && text.match(/^([^,;:]+?),\s*diff\s*=\s*(.+)$/i);
    const bare = !fixed && !asked && text.match(/^([^,;:(]+?)\s*(\((.*)\))?$/);
    const m = fixed ?? asked ?? bare;
    if (!m) return null;
    const poolPart = m[1];
    const diff = fixed ? Number(fixed[2]) : null;
    const rest = fixed ? fixed[3] : asked ? `= ${asked[2]}` : (bare[3] ?? '');
    if (/\bcontre\b/i.test(poolPart)) return null;   // jets opposés : à la table
    const traits = [];
    const choices = [];
    const parts = poolPart.split('+').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
        const afterAttribute = traits.some(t => t.kind === 'attribute');
        if (/\sou\s/i.test(part)) {
            const options = part.split(/\sou\s/i).map(o => parseTrait(o, afterAttribute));
            if (options.some(o => !o)) return null;
            choices.push(options);
        } else {
            const trait = parseTrait(part, afterAttribute);
            if (!trait) return null;
            traits.push(trait);
        }
    }
    const diffNote = rest.replace(/^[\s;,]+/, '').replace(/^\((.*)\)$/, '$1').trim() || null;
    return { traits, choices, difficulty: diff, diffNote };
};

/** Colonne « Coût » → { blood, willpower } (nombres) ; le texte d'origine reste affiché */
export const parseCost = (text) => {
    const t = (text ?? '').trim();
    if (!t || /^[–-]/.test(t)) return { blood: 0, willpower: 0 };
    const base = t.replace(/\([^)]*\)/g, '');   // « 1 S (+1 V par tour en plus) » : seul le coût de base compte
    const blood = base.match(/(\d+)\s*S\b/);
    const willpower = base.match(/(\d+)\s*V\b/);
    return { blood: blood ? Number(blood[1]) : 0, willpower: willpower ? Number(willpower[1]) : 0 };
};

/** Coût simple (« 1 S », « 2 V », « 1 S + 1 V ») : proposé à la dépense coché ; sinon décoché, texte affiché */
export const isSimpleCost = (text) => /^\s*\d+\s*[SV](\s*\+\s*\d+\s*[SV])?\s*$/.test(text ?? '');

/** Clé stable d'un pouvoir, depuis son nom VO (« Predator's Communion » → predators_communion) */
export const powerKey = (label) => {
    const vo = label.match(/\(([^)]+)\)\s*$/)?.[1] ?? label;
    return norm(vo).replace(/'/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
};

// src/client/src/systems/vikings/config/rules.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles Pure Saga sous forme de fonctions pures (testées dans
// src/client/tests/systems/vikings/rules.test.js).
// Référence : documentations/spec_vikings.md (§1 à §5 et décisions D-, Q-).
// ─────────────────────────────────────────────────────────────────────────────

import { CARACNAMES, COMPETENCES } from './competences.js';

// ── Dés : explosion (caractéristique) et seuil (compétence) ──────────────────

/** Faces qui font exploser un dé selon le niveau de caractéristique (1 à 5). */
export const getExplosionThreshold = (level) => {
    if (level <= 2) return [10];
    if (level <= 4) return [9, 10];
    return [8, 9, 10];
};

/** Seuil de succès selon le niveau de compétence (0 à 5). Niveau 3 = 5+ (D-1). */
export const getSuccessThreshold = (level) => {
    if (level === 0 || level === 1) return 7;
    if (level === 2) return 6;
    if (level === 3 || level === 4) return 5;
    return 4;
};

/** Meilleure des deux caractéristiques liées à la compétence (fixe l'explosion). */
export const getBestCharacteristic = (character, skill) => {
    const comp = COMPETENCES.find(c => c.name === skill.name);
    if (!comp) return { name: 'force', level: 2 };

    const val1 = character[comp.caracs[0]] || 2;
    const val2 = character[comp.caracs[1]] || 2;

    return val1 >= val2
        ? { name: comp.caracs[0], level: val1 }
        : { name: comp.caracs[1], level: val2 };
};

/**
 * Découpe les faces d'un groupe en vagues d'explosion.
 * rpg-dice-roller insère chaque dé explosé JUSTE APRÈS le dé qui l'a produit
 * ([9!, 2, 6, …] : le 2 est l'explosion du 9, le 6 le 2e dé de base) : la vague
 * d'un dé est donc sa profondeur dans la chaîne d'explosion.
 * @returns {{ dice: number[] }[]} vague 0 = dés de base
 */
export const splitDiceWaves = (values, explosionThresholds) => {
    const waves = [];
    let depth = 0;
    for (const value of values) {
        (waves[depth] ??= { dice: [] }).dice.push(value);
        depth = explosionThresholds.includes(value) ? depth + 1 : 0;
    }
    return waves.length ? waves : [{ dice: [] }];
};

/** Triple 10 naturel : les 3 dés de base sont des 10 (Q-5). Impossible à moins de 3 dés. */
export const isTripleTen = (values, explosionThresholds, pool) => {
    if (pool < 3) return false;
    const base = splitDiceWaves(values, explosionThresholds)[0].dice;
    return base.length >= 3 && base.slice(0, 3).every(v => v === 10);
};

// ── Santé et fatigue (§2) ────────────────────────────────────────────────────

/** Dés retirés du pool : 1 token = aucun, puis −1 dé par token ; 5 = KO. */
export const getBlessureMalus = (tokens) => {
    if (tokens === 0 || tokens === 1) return 0;
    if (tokens === 5) return 4;
    return tokens - 1;
};

/**
 * Succès requis en plus selon la fatigue (D-2) : paliers 2/4/6/8, un nombre
 * intermédiaire reste au palier inférieur. À 10 tokens : KO (voir isFatigueKO).
 */
export const getFatigueMalus = (tokens) => {
    if (!tokens || tokens < 2) return 0;
    if (tokens >= 10) return 5;
    return Math.floor(tokens / 2);
};

export const isFatigueKO = (tokens) => (tokens ?? 0) >= 10;

// ── Évolution (§5) ───────────────────────────────────────────────────────────

/** Coûts en SAGA des améliorations (vault « 07 » ; runes à 1, D-7). */
export const XP_COSTS = {
    carac:    2,
    skill:    1,
    newSkill: 3,
    trait:    4,
    rune:     1,
    newRune:  1,
};

// ── Conditions des traits (D-12) ─────────────────────────────────────────────
// Format d'un trait : requirements (carac min), maxCarac (carac max),
// requiresSkill (compétence min, meilleure spécialisation), requiresSaga
// (SAGA totale min), requiresAny (au moins une alternative satisfaite).

const _skillLevel = (character, skillName) =>
    Math.max(0, ...(character.skills ?? []).filter(s => s.name === skillName).map(s => s.level ?? 0));

/** Première condition non remplie d'un bloc de conditions, ou null. */
const _firstMissing = (character, cond) => {
    for (const [carac, min] of Object.entries(cond.requirements ?? {})) {
        if ((character[carac] ?? 0) < min) return `${CARACNAMES[carac]} ${min}+`;
    }
    for (const [carac, max] of Object.entries(cond.maxCarac ?? {})) {
        if ((character[carac] ?? 0) > max) return `${CARACNAMES[carac]} ${max} max`;
    }
    for (const [skill, min] of Object.entries(cond.requiresSkill ?? {})) {
        if (_skillLevel(character, skill) < min) return `${skill} ${min}+`;
    }
    if (cond.requiresSaga && (character.sagaTotale ?? 0) < cond.requiresSaga) {
        return `SAGA totale ${cond.requiresSaga}+`;
    }
    return null;
};

/** Libellé d'un bloc de conditions, ex. « Force 2+, Loi 2+ ». */
const _describe = (cond) => [
    ...Object.entries(cond.requirements ?? {}).map(([c, v]) => `${CARACNAMES[c]} ${v}+`),
    ...Object.entries(cond.maxCarac ?? {}).map(([c, v]) => `${CARACNAMES[c]} ${v} max`),
    ...Object.entries(cond.requiresSkill ?? {}).map(([s, v]) => `${s} ${v}+`),
    ...(cond.requiresSaga ? [`SAGA totale ${cond.requiresSaga}+`] : []),
].join(', ');

/**
 * Le personnage remplit-il les conditions du trait ? (hors incompatibilités et limite de nombre)
 * @returns {{ can: boolean, reason?: string }}
 */
export const checkTraitConditions = (character, trait) => {
    const missing = _firstMissing(character, trait);
    if (missing) return { can: false, reason: `Nécessite ${missing}` };

    if (trait.requiresAny?.length && !trait.requiresAny.some(alt => !_firstMissing(character, alt))) {
        return { can: false, reason: `Nécessite ${trait.requiresAny.map(_describe).join(' ou ')}` };
    }
    return { can: true };
};

/** Texte des conditions d'un trait pour l'affichage (« » si aucune). */
export const formatTraitConditions = (trait) => {
    const parts = [_describe(trait)];
    if (trait.requiresAny?.length) parts.push(trait.requiresAny.map(_describe).join(' ou '));
    return parts.filter(Boolean).join(', ');
};

/**
 * Le trait peut-il être coché ? Un trait déjà possédé reste cochable (pour le
 * décocher). Sinon : limite de nombre, incompatibilités, conditions.
 */
export const canSelectTrait = (character, trait, maxTraits = 4) => {
    if (character.traits.some(t => t.name === trait.name)) return true;
    if (character.traits.length >= maxTraits) return false;
    if ((trait.incompatible ?? []).some(name => character.traits.some(t => t.name === name))) return false;
    return checkTraitConditions(character, trait).can;
};

// src/client/src/systems/vikings/config/rules.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles Pure Saga sous forme de fonctions pures (testées dans
// src/client/tests/systems/vikings/rules.test.js).
// Référence : documentations/spec_vikings.md (§1 à §5 et décisions D-, Q-).
// ─────────────────────────────────────────────────────────────────────────────

import { CARACNAMES, COMPETENCES } from './competences.js';
import { TRAITS } from './traits.js';

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

export const BLESSURE_MAX = 5;
export const FATIGUE_MAX  = 10;

const FATIGUE_STATES = [
    [10, 'Inconscient'], [8, 'Exténué'], [6, 'Épuisé'], [4, 'Fatigué'], [2, 'En nage'], [1, 'Essoufflé'],
];

/** Libellé du palier de fatigue (§2.2), « » à 0. */
export const getFatigueState = (tokens) =>
    FATIGUE_STATES.find(([min]) => (tokens ?? 0) >= min)?.[1] ?? '';

// ── SAGA ─────────────────────────────────────────────────────────────────────

export const SAGA_MAX = 5;

/**
 * Gain de SAGA (triple 10, attribution MJ, trait « SAGA +N ») : réserve
 * plafonnée à 5, SAGA totale augmentée du gain réellement reçu (D-10, L3-1).
 */
export const gainSaga = (character, n) => {
    const actuelle = character.sagaActuelle ?? 0;
    const sagaActuelle = Math.min(SAGA_MAX, actuelle + Math.max(0, n));
    return { sagaActuelle, sagaTotale: (character.sagaTotale ?? 0) + (sagaActuelle - actuelle) };
};

/** Somme des « SAGA +N » des traits nommés (appliquée à la prise du trait, D-9). */
export const getTraitSagaBonus = (traitNames) =>
    traitNames.reduce((sum, name) => sum + (TRAITS.find(t => t.name === name)?.effects?.sagaBonus ?? 0), 0);

// ── Effets d'un jet sur la fiche ─────────────────────────────────────────────

/**
 * Applique les dépenses et restitutions d'un jet (SAGA plafonnée à 0–5,
 * points de compétence à 0–niveau). Un `skillPointsSpent` négatif rembourse.
 * Le point récupéré après un jet héroïque réussi n'est pas un gain (D-10) ;
 * le triple 10 en est un (+1 SAGA, D-15).
 * @param {object} outcome { sagaSpent, sagaRestored, skill, skillPointsSpent, tripleTen }
 */
export const applyRollOutcome = (character, { sagaSpent = 0, sagaRestored = 0, skill = null, skillPointsSpent = 0, tripleTen = false } = {}) => {
    let next = { ...character };
    if (sagaSpent || sagaRestored) {
        next.sagaActuelle = Math.max(0, Math.min(SAGA_MAX, (character.sagaActuelle ?? 0) - sagaSpent + sagaRestored));
    }
    if (skill && skillPointsSpent) {
        next.skills = (character.skills ?? []).map(s =>
            (s.name === skill.name && s.specialization === skill.specialization)
                ? { ...s, currentPoints: Math.max(0, Math.min(s.level, (s.currentPoints ?? 0) - skillPointsSpent)) }
                : s
        );
    }
    if (tripleTen) next = { ...next, ...gainSaga(next, 1) };
    return next;
};

// ── Valeurs de combat (§3.3, §8.2 ; lot 3b, L3-6) ────────────────────────────
// Dérivées des traits et de l'équipement, plus un ajustement saisi en mode
// édition (armureMod / actionsMod / seuilMod) pour les effets conditionnels.

const _traitEffect = (character, key) => (character.traits ?? [])
    .reduce((sum, t) => sum + (TRAITS.find(d => d.name === t.name)?.effects?.[key] ?? 0), 0);

/** Bouclier : armure équipée « fusible », comptée à part (pas de colonne dédiée). */
export const isShield = (item) => item.category === 'armor' && /^bouclier/i.test(item.name ?? '');

export const getCombatValues = (character) => {
    const equipped = (character.items ?? []).filter(i => i.location === 'equipped' && i.category === 'armor');
    const shields  = equipped.filter(isShield);
    const armureNaturelle = _traitEffect(character, 'armure');
    const armureEquipee   = equipped.filter(i => !isShield(i)).reduce((sum, i) => sum + (i.armorValue || 0), 0);
    return {
        actions:         Math.max(0, 1 + _traitEffect(character, 'actions') + (character.actionsMod ?? 0)),
        seuil:           Math.max(0, 1 + _traitEffect(character, 'seuil') + (character.seuilMod ?? 0)),
        armureNaturelle,
        armureEquipee,
        armureTotale:    Math.max(0, armureNaturelle + armureEquipee + (character.armureMod ?? 0)),
        boucliers:       shields,
        armureBoucliers: shields.reduce((sum, i) => sum + (i.armorValue || 0), 0),
    };
};

/**
 * Personnage avec ses colonnes de combat recalculées, avant toute écriture.
 * `armure` inclut les boucliers, comme avant la refonte, pour le système de combat.
 */
export const withDerivedValues = (character) => {
    const v = getCombatValues(character);
    return { ...character, actionsDisponibles: v.actions, seuilCombat: v.seuil, armure: v.armureTotale + v.armureBoucliers };
};

/**
 * Posture de combat passive (§8.2, C-1, C-2) : une ligne par compétence de
 * combat au contact ; bonus = niveau ÷ 2 arrondi à l'inférieur, max 3 ;
 * traits non comptés.
 */
export const getPassivePostures = (character) => {
    const seuil = getCombatValues(character).seuil;
    return (character.skills ?? [])
        .filter(s => s.name === 'Combat CàC (armé)' || s.name === 'Combat CàC (non armé)')
        .map(s => {
            const bonus = Math.min(3, Math.floor((s.level ?? 0) / 2));
            const label = s.name === 'Combat CàC (non armé)'
                ? 'Esquive'
                : `Parade${s.specialization ? ` (${s.specialization})` : ''}`;
            return { skill: s, label, bonus, seuilDefense: seuil + bonus };
        });
};

// ── Runes (§3.6, §8.1) ───────────────────────────────────────────────────────

/** Livre de sort (somme des points de runes des traits), niveaux répartis, reste. */
export const getRunePoints = (character) => {
    const total = _traitEffect(character, 'runePoints');
    const spent = (character.runes ?? []).reduce((sum, r) => sum + (r.level ?? 0), 0);
    return { total, spent, available: total - spent };
};

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

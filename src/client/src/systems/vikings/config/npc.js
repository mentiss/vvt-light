// src/client/src/systems/vikings/config/npc.js
// ─────────────────────────────────────────────────────────────────────────────
// PNJ de Vikings (spec_pnj.md §10.2) : règles pures, testées.
// Partie système d'une fiche : { caracs, armure, seuil, actions, blessureMax, malus, skills, weapons, traits } ;
// état à la table : { blessure, malus }.
// Jet (spec_vikings.md §1.1) : toujours 3d10, moins le malus de Blessure (1 dé au moins) ;
//   - caractéristique : seuil 7+, explosion de la caractéristique ;
//   - compétence : seuil de la compétence, explosion de la meilleure de ses deux caractéristiques.
// Blessure (retour MJ du 2026-11-10) : chaque PNJ a son maximum de tokens (5 pour un humain, 8 pour
// un ours…) ; le malus suit le barème humain (§2.1) par règle de trois, KO au maximum.
// Malus (à la place de la Fatigue, retour MJ) : succès retirés du résultat, 0 au minimum.
// ─────────────────────────────────────────────────────────────────────────────

import { CARACNAMES, COMPETENCES } from './competences.js';
import { getExplosionThreshold, getSuccessThreshold, getBlessureMalus, BLESSURE_MAX } from './rules.js';

export const CARAC_KEYS = Object.keys(CARACNAMES);
const BASE_POOL = 3;

export const npcDefaults = () => ({
    caracs: Object.fromEntries(CARAC_KEYS.map(k => [k, 2])), armure: 0, seuil: 1, actions: 1,
    blessureMax: BLESSURE_MAX, malus: 0, skills: [], weapons: [], traits: [],
});

export const initialNpcState = (sd) => ({ blessure: 0, malus: Number(sd?.malus ?? 0) });

export const blessureMax = (sd) => Math.max(1, Number(sd?.blessureMax ?? BLESSURE_MAX));

/** Tokens ramenés sur le barème humain (0 à 5) : règle de trois, 5 seulement au maximum */
export const humanTokens = (sd, tokens) => {
    const t = Number(tokens ?? 0);
    const max = blessureMax(sd);
    if (t >= max) return BLESSURE_MAX;
    return Math.min(BLESSURE_MAX - 1, Math.floor((t * BLESSURE_MAX) / max));
};

/** Dés retirés par la Blessure d'un PNJ */
export const blessureMalus = (sd, tokens) => getBlessureMalus(humanTokens(sd, tokens));

const caracLevel = (sd, key) => Number(sd?.caracs?.[key] ?? 2);
const pool = (sd, state) => Math.max(1, BASE_POOL - blessureMalus(sd, state?.blessure));
// Malus de la table ; en bibliothèque (pas d'état), le malus de base de la fiche
const malus = (sd, state) => Math.max(0, Number(state ? state.malus ?? 0 : sd?.malus ?? 0));
// Plus petite face qui explose (8, 9 ou 10)
const explosionMin = (level) => Math.min(...getExplosionThreshold(level));

/** Jet de caractéristique d'un PNJ : réserve, seuil, explosion, malus de succès pour la fenêtre MJ */
export const caracRoll = (sd, key, state) => ({
    pool: pool(sd, state), threshold: 7, explosion: explosionMin(caracLevel(sd, key)), malus: malus(sd, state), label: CARACNAMES[key] ?? key,
});

/**
 * Jet de compétence d'un PNJ : explosion de la meilleure des deux caractéristiques liées
 * (une compétence hors de la liste du jeu prend la meilleure caractéristique du PNJ).
 */
export const skillRoll = (sd, skill, state) => {
    const caracs = COMPETENCES.find(c => c.name === skill.name)?.caracs ?? CARAC_KEYS;
    const best = Math.max(...caracs.map(k => caracLevel(sd, k)));
    const label = skill.specialization ? `${skill.name} (${skill.specialization})` : skill.name;
    return { pool: pool(sd, state), threshold: getSuccessThreshold(Number(skill.level ?? 0)), explosion: explosionMin(best), malus: malus(sd, state), label };
};

/** Succès retenus : malus retiré, jamais négatif */
export const netSuccesses = (successes, malusValue) => Math.max(0, Number(successes ?? 0) - Math.max(0, Number(malusValue ?? 0)));

/** Hors de combat : Blessure au maximum du PNJ (KO) */
export const isOut = (sd, state) => Number(state?.blessure ?? 0) >= blessureMax(sd);

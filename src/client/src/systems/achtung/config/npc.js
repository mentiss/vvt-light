// src/client/src/systems/achtung/config/npc.js
// ─────────────────────────────────────────────────────────────────────────────
// PNJ d'Achtung! Cthulhu (spec_pnj.md §10.4, Gamemaster Guide p.150-152) : règles pures, testées.
// Partie système d'une fiche : { rank, quality, truths, attributes, skills [{ key, rank, focuses }],
//   stress, injuries, armour, courage, attacks, abilities, threatSpends } ;
// état à la table : { stress, injuries } ; groupe de Troupes : { count, alive } en plus.
// ─────────────────────────────────────────────────────────────────────────────

import { ATTRIBUTES, SKILLS } from './base.js';
import { countSuccesses, SALVO_LABELS } from './mechanics.js';

export const NPC_RANKS = { incidental: 'Figurant', trooper: 'Troupe', lieutenant: 'Lieutenant', nemesis: 'Némésis' };

// Figurant (p.150) : une qualité donne attribut, compétence et cible ; il a toujours le focus voulu
export const NPC_QUALITIES = {
    poor:        { label: 'Faible',       attribute: 7,  skill: 0, target: 7 },
    basic:       { label: 'Ordinaire',    attribute: 8,  skill: 1, target: 9 },
    proficient:  { label: 'Compétent',    attribute: 9,  skill: 2, target: 11 },
    talented:    { label: 'Doué',         attribute: 10, skill: 3, target: 13 },
    exceptional: { label: 'Exceptionnel', attribute: 11, skill: 4, target: 15 },
};

// Barème du livre (p.151-152) : totaux indicatifs d'attributs et de compétences, blessures avant d'être vaincu
export const RANK_RULES = {
    trooper:    { attributes: 48, skills: 12, injuries: 1, reactions: 'Aucune réaction' },
    lieutenant: { attributes: 51, skills: 17, injuries: 2, reactions: 'Une réaction par round' },
    nemesis:    { attributes: 54, skills: 20, injuries: 3, reactions: 'Réactions à volonté, 2 Menace chacune' },
};

export const GROUP_MAX = 5;   // Troupes identiques agissant comme une seule (p.150)

export const npcDefaults = () => ({
    rank: 'trooper', quality: 'basic', truths: [],
    attributes: Object.fromEntries(ATTRIBUTES.map(a => [a.key, 8])), skills: [],
    stress: null, injuries: null, armour: 0, courage: 0, attacks: [], abilities: [], threatSpends: [],
});

const skillOf = (sd, key) => (sd?.skills ?? []).find(s => s.key === key) ?? null;

/** Stress maximum du barème : Force + Résilience ou Volonté + Résilience (le plus haut), moitié pour une Troupe */
export const rankStress = (sd) => {
    const res = Number(skillOf(sd, 'resilience')?.rank ?? 0);
    const best = Math.max(Number(sd?.attributes?.brawn ?? 0), Number(sd?.attributes?.will ?? 0)) + res;
    return sd?.rank === 'trooper' ? Math.ceil(best / 2) : best;
};

/** Stress maximum : celui de la fiche, sinon le barème */
export const stressMax = (sd) => (sd?.stress != null ? Number(sd.stress) : rankStress(sd));

/** Blessures avant d'être vaincu : celles de la fiche, sinon le rang */
export const injuriesMax = (sd) => Number(sd?.injuries ?? RANK_RULES[sd?.rank]?.injuries ?? 1);

export const isGroupRank = (sd) => sd?.rank === 'trooper';

/** Requête de test : cible = attribut + compétence, rang de la compétence pour le focus (Figurant : sa qualité) */
export const npcTest = (sd, attribute, skill) => {
    if (sd?.rank === 'incidental') {
        const q = NPC_QUALITIES[sd.quality] ?? NPC_QUALITIES.basic;
        return { target: q.target, skill: q.skill, focus: true };
    }
    const s = skillOf(sd, skill);
    return {
        target: Number(sd?.attributes?.[attribute] ?? 0) + Number(s?.rank ?? 0),
        skill: Number(s?.rank ?? 0),
        focus: (s?.focuses ?? []).length > 0,
    };
};

/** Dés d'assistance d'un groupe : 1d20 par membre restant en plus du chef (le chef lance 2d20) */
export const assistDice = (state) => Math.max(0, Number(state?.alive ?? 1) - 1);

/**
 * Succès d'un jet assisté (p.150, spec_achtung_cthulhu.md §4.4) : les `lead` premiers dés sont ceux du chef,
 * les suivants ceux des assistants ; leurs succès ne comptent que si le chef en obtient au moins un.
 * Complications de tous les dés.
 */
export const countAssisted = (results, lead, target, skillRank = 0, focus = false) => {
    const leader = countSuccesses(results.slice(0, lead), target, skillRank, focus);
    const helpers = countSuccesses(results.slice(lead), target, skillRank, focus);
    return {
        successes: leader.successes + (leader.successes > 0 ? helpers.successes : 0),
        complications: leader.complications + helpers.complications,
    };
};

/** Une Troupe ajoutée en nombre forme un groupe (une carte, membres restants) ; seule, une fiche simple */
export const initialNpcState = (sd, { quantity = 1 } = {}) => {
    const base = { stress: 0, injuries: 0 };
    const count = Math.max(1, Math.min(GROUP_MAX, quantity));
    if (!isGroupRank(sd) || count < 2) return base;
    return { ...base, count, alive: count };
};

/** Vaincu : blessures du rang atteintes ; un groupe, quand il ne reste aucun membre */
export const isOut = (sd, state) => {
    if (state?.alive != null) return Number(state.alive) <= 0;
    return Number(state?.injuries ?? 0) >= injuriesMax(sd);
};

const SALVO_KEY = Object.fromEntries(Object.entries(SALVO_LABELS).map(([k, l]) => [l.toLowerCase(), k]));
const salvoKeyOf = (text) => SALVO_KEY[String(text ?? '').trim().split(/\s+/)[0]?.toLowerCase()] ?? null;

/** Attribut d'une attaque (spec_achtung_cthulhu.md §3.9) : Force au contact, Coordination à distance,
 *  Volonté pour une attaque mentale (sans portée, focus « mental ») */
export const attackAttribute = (attack) => {
    if (attack?.range === 'contact') return 'brawn';
    if (!attack?.range && /mental/i.test(attack?.focus ?? '')) return 'will';
    return 'coordination';
};

/**
 * Requête d'attaque d'un PNJ : test attribut + Combat (focus si l'arme en a un et que le PNJ a un focus
 * en Combat), puis dégâts en dés de Challenge ; salve et effets innés (Vicieux) ; groupe de Troupes :
 * +1 dégât par membre au-delà du premier (p.150).
 */
export const npcAttack = (sd, attack, state) => {
    const attribute = attackAttribute(attack);
    const test = npcTest(sd, attribute, 'fighting');
    const qualities = String(attack?.qualities ?? '');
    return {
        attribute, ...test,
        dice: 2, difficulty: 1, assist: state?.alive != null ? assistDice(state) : 0,
        damage: {
            dice: Number.parseInt(attack?.damage, 10) || 0,
            salvo: salvoKeyOf(attack?.salvo),
            innate: /vicieux/i.test(qualities) ? [{ key: 'vicious' }] : [],
            groupBonus: state?.alive != null ? Math.max(0, Number(state.alive) - 1) : 0,
        },
    };
};

export const skillLabel = (key) => SKILLS.find(s => s.key === key)?.label ?? key;
export const attributeLabel = (key) => ATTRIBUTES.find(a => a.key === key)?.label ?? key;

// src/client/src/systems/maledictum/config/rules/character.js
// ─────────────────────────────────────────────────────────────────────────────
// Dérivés d'un personnage (fonctions pures, testées) : calculés une seule fois
// ici, jamais dans les composants. Livre de base p.50, 88-92, 122-123, 214.
//
//   Caractéristique = départ + Avances (+1 chacune) ; bonus = dizaine.
//   Compétence = caractéristique + 5 par Avance ; spécialisation = compétence + 5 par Avance.
//   Blessures max = BF + 2 × BE + BFM ; Blessures critiques max = BE ;
//   Initiative = BPer + BAg ; Encombrement max = BF + BE (Porteur : 2 × BF + BE) ;
//   seuil de Corruption = BFM + BE ; Seuil Warp = BFM (Psyker sanctionné : 2 × BFM) ;
//   augmétiques max = BE (La chair est faible : 2 × BE).
// ─────────────────────────────────────────────────────────────────────────────

import { SKILLS } from '../skills.js';
import { SETUP } from '../setup.js';

export const CHAR_KEYS = ['ws', 'bs', 'str', 'tgh', 'ag', 'int', 'per', 'wil', 'fel'];
export const CHAR_SHORT = { ws: 'CC', bs: 'CT', str: 'F', tgh: 'E', ag: 'Ag', int: 'Int', per: 'Per', wil: 'FM', fel: 'Soc' };
export const CHAR_CAP = 60;   // plafond humain des caractéristiques (livre p.90)

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
export const bonusOf = (value) => Math.floor(num(value) / 10);

export const SKILL_BY_KEY = Object.fromEntries(SKILLS.map(s => [s.key, s]));

export const hasTalent = (c, key) => (c?.talents ?? []).some(t => t.key === key);
export const talentCount = (c, key) => (c?.talents ?? []).filter(t => t.key === key).reduce((n, t) => n + Math.max(1, num(t.count) || 1), 0);

export const charValue = (c, key) => num(c?.charsBase?.[key]) + num(c?.charsAdv?.[key]);
export const charBonus = (c, key) => bonusOf(charValue(c, key));

export const skillAdvances = (c, key) => num(c?.skills?.[key]);
export const skillValue = (c, key) => {
    const skill = SKILL_BY_KEY[key];
    return skill ? charValue(c, skill.char) + 5 * skillAdvances(c, key) : 0;
};
export const specValue = (c, spec) => skillValue(c, spec.skill) + 5 * num(spec.adv);

/** Spécialisations du personnage, groupées par compétence */
export const specsBySkill = (c) => (c?.specs ?? []).reduce((acc, s) => {
    (acc[s.skill] ??= []).push(s);
    return acc;
}, {});

export const derived = (c) => {
    const b = (k) => charBonus(c, k);
    const bonuses = c?.bonuses ?? {};
    return {
        woundsMax: b('str') + 2 * b('tgh') + b('wil') + num(bonuses.maxWounds),
        criticalsMax: b('tgh'),
        initiative: b('per') + b('ag') + num(bonuses.initiative),
        encumbranceMax: (hasTalent(c, 'porter') ? 2 * b('str') : b('str')) + b('tgh') + num(bonuses.encumbrance),
        corruptionThreshold: b('wil') + b('tgh'),
        warpThreshold: hasTalent(c, 'sanctioned_psyker') ? 2 * b('wil') : b('wil'),
        augmeticsMax: hasTalent(c, 'flesh_is_weak') ? 2 * b('tgh') : b('tgh'),
        speed: bonuses.speed ?? 'normal',
        psyker: hasTalent(c, 'psyker'),
    };
};

// ── Inventaire ───────────────────────────────────────────────────────────────

export const LOCATIONS = ['head', 'left_arm', 'right_arm', 'body', 'left_leg', 'right_leg'];
const LOCATION_GROUPS = { arms: ['left_arm', 'right_arm'], legs: ['left_leg', 'right_leg'], all: LOCATIONS };
export const expandLocations = (list) => [...new Set((list ?? []).flatMap(l => LOCATION_GROUPS[l] ?? [l]))];

const hasTrait = (item, key) => (item?.data?.traits ?? []).some(t => (t?.key ?? t) === key);

/**
 * Armure par localisation : la meilleure pièce non Discrète, plus toutes les
 * pièces Discrètes (livre p.124, trait Subtle) ; armures portées seulement.
 */
export const armourByLocation = (items) => {
    const out = Object.fromEntries(LOCATIONS.map(l => [l, 0]));
    const best = Object.fromEntries(LOCATIONS.map(l => [l, 0]));
    for (const it of items ?? []) {
        if (it.kind !== 'armour' || !it.equipped) continue;
        const value = num(it.data?.armour);
        for (const loc of expandLocations(it.data?.locations)) {
            if (!(loc in out)) continue;
            if (hasTrait(it, 'subtle')) out[loc] += value;
            else best[loc] = Math.max(best[loc], value);
        }
    }
    for (const l of LOCATIONS) out[l] += best[l];
    return out;
};

/** Règle maison Endurance à l'armure (spec §14.1) : BE − 2, jamais moins de 0, sur chaque localisation ; 0 si le setup la coupe */
export const toughnessArmourBonus = (c, setup = SETUP) => (setup.houseRules?.toughnessArmour ? Math.max(0, charBonus(c, 'tgh') - 2) : 0);

/** Encombrement porté : armures et vêtements portés comptent 1 de moins (livre p.122) */
export const encumbrance = (items) => (items ?? []).reduce((sum, it) => {
    const enc = num(it.data?.enc);
    const worn = it.equipped && (it.kind === 'armour' || it.data?.category === 'clothing');
    return sum + Math.max(0, worn ? enc - 1 : enc) * Math.max(1, num(it.quantity) || 1);
}, 0);

/** Dégâts de base d'une arme : valeur fixe, plus BF pour les armes de mêlée qui l'indiquent */
export const weaponDamage = (c, item) => num(item?.data?.damage) + (item?.data?.damageBonus === 'sb' ? charBonus(c, 'str') : 0);

/** Compétence (ou spécialisation) d'une arme : 'ranged.pistol' → valeur et libellé */
export const weaponSkillValue = (c, item) => {
    const [skill, spec] = String(item?.data?.spec ?? '').split('.');
    const own = (c?.specs ?? []).find(s => s.skill === skill && s.key === spec);
    return own ? specValue(c, own) : skillValue(c, skill);
};

// ── Identité ─────────────────────────────────────────────────────────────────

export const displayName = (c) => [c?.prenom, c?.nom].filter(Boolean).join(' ').trim() || 'Acolyte sans nom';

export const xpAvailable = (c) => num(c?.xpTotal) - num(c?.xpSpent);

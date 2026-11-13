// src/client/src/systems/maledictum/config/rules/actions.js
// ─────────────────────────────────────────────────────────────────────────────
// Actions de jeu de la fiche (fonctions pures, testées) : chacune reçoit le
// personnage et renvoie l'envoi partiel à enregistrer (PATCH). Hors mode Édition :
// elles s'enregistrent tout de suite (jauges, États, inventaire, XP…).
// ─────────────────────────────────────────────────────────────────────────────

import { derived, charValue, skillAdvances, CHAR_CAP } from './character.js';
import { charAdvanceCost, skillAdvanceCost, TALENT_COST, powerCost, SKILL_MAX_ADVANCES } from './xp.js';
import { woundsAfterArmour } from './dice.js';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const uid = () => `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// ── Santé ────────────────────────────────────────────────────────────────────

export const setWounds = (c, value) => ({ wounds: clamp(Math.trunc(value), 0, derived(c).woundsMax) });

/**
 * Dégâts subis (livre p.214) : − Armure de la localisation ; les Blessures ne
 * dépassent pas le maximum ; au-delà, l'excès part dans le jet de gravité de la
 * Blessure critique (1d10 + excès) ; un Critique en inflige une même sous le maximum.
 * armour : armure des pièces ; toughness : bonus de la règle maison (toughnessArmourBonus), non doublé.
 * @returns {{ patch, wounds, excess, critical }}  critical : true s'il faut tirer une Blessure critique
 */
export const takeDamage = (c, { damage, armour = 0, toughness = 0, ineffective = false, criticalHit = false }) => {
    const dealt = woundsAfterArmour(Number(damage) || 0, armour, { ineffective, toughness });
    const max = derived(c).woundsMax;
    const current = Number(c.wounds) || 0;
    const total = current + dealt;
    const excess = Math.max(0, total - max);
    const atMax = current >= max;
    return {
        patch: { wounds: Math.min(max, total) },
        wounds: dealt, excess: atMax ? dealt : excess,
        critical: dealt > 0 && (criticalHit || atMax || total > max),
    };
};

export const addCritical = (c, { location, entry }) => ({
    criticals: [...(c.criticals ?? []), {
        id: uid(), location, key: entry?.key ?? null, label: entry?.label ?? 'Blessure critique', effect: entry?.effect ?? '',
        injury: entry?.injury ?? null, treatment: entry?.treatment?.text ?? null, treated: entry?.treatment?.text === null && entry?.treatment?.difficulty === null,
        dead: !!entry?.dead,
    }],
});
export const toggleCriticalTreated = (c, id) => ({ criticals: (c.criticals ?? []).map(k => (k.id === id ? { ...k, treated: !k.treated } : k)) });
export const removeCritical = (c, id) => ({ criticals: (c.criticals ?? []).filter(k => k.id !== id) });

/** Mourant : Blessures critiques non soignées au-delà de BE (livre p.215) */
export const isDying = (c) => (c.criticals ?? []).filter(k => !k.treated).length > derived(c).criticalsMax;

/**
 * États (spec §15) : pose ou change le niveau d'un État ('minor' | 'major'), null le retire.
 * Un État à un seul niveau est rangé en 'minor'.
 */
export const setCondition = (c, key, level) => {
    const conditions = { ...(c.conditions ?? {}) };
    if (level === 'minor' || level === 'major') conditions[key] = level; else delete conditions[key];
    return { conditions };
};

// ── Destin, Corruption, Warp ─────────────────────────────────────────────────

export const spendFate = (c) => (Number(c.fate) > 0 ? { fate: Number(c.fate) - 1 } : null);
/** Brûler du Destin : la réserve maximale baisse d'autant (livre p.220) */
export const burnFate = (c) => (Number(c.fateMax) > 0 ? { fateMax: Number(c.fateMax) - 1, fate: Math.min(Number(c.fate), Number(c.fateMax) - 1) } : null);
/** Début de séance : Destin rechargé */
export const refillFate = (c) => ({ fate: Number(c.fateMax) || 0 });

export const setCorruption = (c, value) => ({ corruption: Math.max(0, Math.trunc(value)) });
export const setWarpCharge = (c, value) => ({ warpCharge: Math.max(0, Math.trunc(value)) });
export const addListEntry = (c, field, text) => (String(text ?? '').trim() ? { [field]: [...(c[field] ?? []), String(text).trim()] } : null);
export const removeListEntry = (c, field, index) => ({ [field]: (c[field] ?? []).filter((_, i) => i !== index) });

// ── Influence et contacts ────────────────────────────────────────────────────

export const INFLUENCE_MIN = -5;
export const INFLUENCE_MAX = 5;
export const setInfluence = (c, faction, value) => {
    const influence = { ...(c.influence ?? {}) };
    const v = clamp(Math.trunc(value), INFLUENCE_MIN, INFLUENCE_MAX);
    if (v === 0) delete influence[faction]; else influence[faction] = v;
    return { influence };
};
export const addContact = (c, contact) => ({ contacts: [...(c.contacts ?? []), { id: uid(), name: '', faction: '', value: 0, notes: '', ...contact }] });
export const updateContact = (c, id, patch) => ({ contacts: (c.contacts ?? []).map(k => (k.id === id ? { ...k, ...patch, value: clamp(Number(patch.value ?? k.value) || 0, INFLUENCE_MIN, INFLUENCE_MAX) } : k)) });
export const removeContact = (c, id) => ({ contacts: (c.contacts ?? []).filter(k => k.id !== id) });

// ── Inventaire ───────────────────────────────────────────────────────────────

export const addItems = (c, rows) => ({ items: [...(c.items ?? []), ...rows] });
export const removeItem = (c, id) => ({ items: (c.items ?? []).filter(it => it.id !== id) });
export const toggleEquipped = (c, id) => ({ items: (c.items ?? []).map(it => (it.id === id ? { ...it, equipped: !it.equipped } : it)) });
export const setQuantity = (c, id, quantity) => ({ items: (c.items ?? []).map(it => (it.id === id ? { ...it, quantity: Math.max(0, Math.trunc(quantity)) } : it)) });

// ── Expérience ───────────────────────────────────────────────────────────────

const spend = (c, cost) => ({ xpSpent: (Number(c.xpSpent) || 0) + cost });
const canSpend = (c, cost) => cost !== null && (Number(c.xpTotal) || 0) - (Number(c.xpSpent) || 0) >= cost;

/** Achats possibles et leur coût : null = impossible (plafond, XP insuffisante) */
export const charAdvanceOffer = (c, key) => {
    const next = charValue(c, key) + 1;
    const cost = next > CHAR_CAP ? null : charAdvanceCost(next);
    return { cost, ok: canSpend(c, cost) };
};
export const advanceChar = (c, key) => {
    const { cost, ok } = charAdvanceOffer(c, key);
    if (!ok) return null;
    return { charsAdv: { ...(c.charsAdv ?? {}), [key]: (Number(c.charsAdv?.[key]) || 0) + 1 }, ...spend(c, cost) };
};

export const skillAdvanceOffer = (c, key) => {
    const cost = skillAdvanceCost(skillAdvances(c, key) + 1);
    return { cost, ok: canSpend(c, cost) };
};
export const advanceSkill = (c, key) => {
    const { cost, ok } = skillAdvanceOffer(c, key);
    if (!ok) return null;
    return { skills: { ...(c.skills ?? {}), [key]: skillAdvances(c, key) + 1 }, ...spend(c, cost) };
};

/** Spécialisation : nouvelle (1re Avance) ou existante ; la clé + le libellé (Savoir (Planète : …)) l'identifient */
export const specAdvanceOffer = (c, spec) => {
    const own = (c.specs ?? []).find(s => s.skill === spec.skill && s.key === spec.key && (s.label ?? '') === (spec.label ?? ''));
    const next = (own?.adv ?? 0) + 1;
    const cost = next > SKILL_MAX_ADVANCES ? null : skillAdvanceCost(next);
    return { cost, ok: canSpend(c, cost), own };
};
export const advanceSpec = (c, spec) => {
    const { cost, ok, own } = specAdvanceOffer(c, spec);
    if (!ok) return null;
    const specs = own
        ? (c.specs ?? []).map(s => (s === own ? { ...s, adv: s.adv + 1 } : s))
        : [...(c.specs ?? []), { skill: spec.skill, key: spec.key, label: spec.label, adv: 1 }];
    return { specs, ...spend(c, cost) };
};

export const addTalent = (c, key, choice = null, { free = false } = {}) => {
    if (!free && !canSpend(c, TALENT_COST)) return null;
    const list = c.talents ?? [];
    const same = list.find(t => t.key === key && (t.choice ?? null) === (choice ?? null));
    const talents = same
        ? list.map(t => (t === same ? { ...t, count: (t.count ?? 1) + 1 } : t))
        : [...list, { key, count: 1, choice }];
    return { talents, ...(free ? {} : spend(c, TALENT_COST)) };
};
export const removeTalent = (c, index) => ({ talents: (c.talents ?? []).filter((_, i) => i !== index) });

export const addPower = (c, power, { free = false } = {}) => {
    if ((c.powers ?? []).includes(power.key)) return null;
    const cost = powerCost(power);
    if (!free && !canSpend(c, cost)) return null;
    return { powers: [...(c.powers ?? []), power.key], ...(free ? {} : spend(c, cost)) };
};

export const gainXp = (c, amount) => ({ xpTotal: Math.max(0, (Number(c.xpTotal) || 0) + Math.trunc(amount)) });

// src/client/src/systems/nimble/config/rules/actions.js
// ─────────────────────────────────────────────────────────────────────────────
// Actions de jeu d'une fiche (Core Rules 3.3 p.9, 13-17 ; spec_nimble.md §2,
// D-7, D-8) — pur. Chaque action renvoie le **patch** à enregistrer (champs
// modifiés seulement ; colonnes JSON renvoyées entières).
// ─────────────────────────────────────────────────────────────────────────────

import { MAX_ACTIONS } from '../basics.js';
import { maxHp, maxWounds, defenseOf, resourcesOf, featuresOf, featureUses, formulaVars } from './character.js';

const num = (v) => Number(v ?? 0);

// ── Dégâts, soins, Blessures ────────────────────────────────────────────────

/**
 * Subir des dégâts.
 *  - Se défendre : réduit de la Défense (sauf critique), coûte 1 action en combat ;
 *  - les PV temporaires absorbent d'abord ;
 *  - tomber à 0 PV : 1 Blessure et mourant (fin de la concentration) ;
 *  - déjà mourant : 2 Blessures, 3 sur un critique.
 * @returns {{ patch: object, taken: number, absorbed: number, woundsGained: number, reduced: number }}
 */
export const takeDamage = (c, { amount, defend = false, crit = false }) => {
    const raw = Math.max(0, Math.trunc(num(amount)));
    const reduced = defend && !crit ? Math.min(raw, Math.max(0, defenseOf(c))) : 0;
    let left = raw - reduced;
    const patch = {};
    if (defend && c.inCombat) patch.actions = Math.max(0, num(c.actions) - 1);

    if (c.dying) {
        const gained = left > 0 ? (crit ? 3 : 2) : 0;
        if (gained) patch.wounds = Math.min(maxWounds(c), num(c.wounds) + gained);
        return { patch, taken: 0, absorbed: 0, woundsGained: gained, reduced };
    }
    const absorbed = Math.min(num(c.tempHp), left);
    if (absorbed) { patch.tempHp = num(c.tempHp) - absorbed; left -= absorbed; }
    let gained = 0;
    if (left > 0) {
        const hp = num(c.hpCurrent) - left;
        if (hp <= 0) {
            patch.hpCurrent = 0;
            patch.dying = true;
            gained = 1;
            patch.wounds = Math.min(maxWounds(c), num(c.wounds) + 1);
            patch.conditions = (c.conditions ?? []).filter(k => k !== 'concentrating');
        } else {
            patch.hpCurrent = hp;
        }
    }
    return { patch, taken: left, absorbed, woundsGained: gained, reduced };
};

/** Soigner : jusqu'au maximum ; des PV rendus mettent fin à l'état mourant */
export const heal = (c, amount) => {
    const value = Math.max(0, Math.trunc(num(amount)));
    if (!value) return {};
    return { hpCurrent: Math.min(maxHp(c), num(c.hpCurrent) + value), ...(c.dying ? { dying: false } : {}) };
};

/** PV temporaires : ils ne se cumulent pas (on garde la valeur choisie) */
export const setTempHp = (value) => ({ tempHp: Math.max(0, Math.trunc(num(value))) });

/** Clic sur la n-ième case de Blessure (1 = première) : coche jusqu'à elle, ou décoche si c'était la dernière */
export const clickWound = (c, n) => ({ wounds: num(c.wounds) === n ? n - 1 : n });

// ── Combat : actions et attaques du tour ───────────────────────────────────

/** Initiative : entrée en combat avec les actions obtenues */
export const startCombat = (actions) => ({ inCombat: true, actions, turnAttacks: 0 });

/** Dépenser des actions (en combat seulement) ; une attaque compte pour les attaques précipitées */
export const spendActions = (c, count = 1, { attack = false } = {}) => {
    if (!c.inCombat) return {};
    return { actions: Math.max(0, num(c.actions) - Math.max(0, num(count))), ...(attack ? { turnAttacks: num(c.turnAttacks) + 1 } : {}) };
};

/** Fin du tour : les 3 actions reviennent, le compte des attaques repart de zéro */
export const endTurn = () => ({ actions: MAX_ACTIONS, turnAttacks: 0 });

/** Clic sur la n-ième case d'action : règle le nombre d'actions restantes */
export const clickAction = (c, n) => ({ actions: num(c.actions) === n ? n - 1 : n });

/** Désavantage proposé pour une attaque précipitée (attaques déjà faites ce tour-ci) */
export const rushedEdge = (c) => (c.inCombat ? -num(c.turnAttacks) : 0);

// ── Ressources et usages ────────────────────────────────────────────────────

/** Ressource de classe : règle la quantité restante (jauge) ou comptée (compteur) */
export const setResource = (c, key, value) => {
    const r = resourcesOf(c).find(x => x.key === key);
    if (!r) return {};
    const v = Math.max(0, Math.trunc(num(value)));
    const stored = r.max === null ? v : Math.max(0, r.max - Math.min(r.max, v));
    return { resources: { ...(c.resources ?? {}), [key]: stored } };
};

/** Dépenser du mana (dépense plafonnée au restant) */
export const spendMana = (c, amount) => {
    const r = resourcesOf(c).find(x => x.key === 'mana');
    if (!r || !amount) return {};
    return setResource(c, 'mana', r.value - Math.min(r.value, num(amount)));
};

/** Usages d'une capacité : clic sur la n-ième case */
export const clickUse = (c, id, n) => {
    const used = num(c.uses?.[id]);
    return { uses: { ...(c.uses ?? {}), [id]: used === n ? n - 1 : n } };
};

/** Remet à zéro les usages des capacités dont la période figure dans `periods` */
const resetUses = (c, periods) => {
    const vars = formulaVars(c);
    const uses = { ...(c.uses ?? {}) };
    for (const entry of featuresOf(c)) {
        const u = featureUses(c, entry, vars);
        if (u && periods.includes(u.per)) delete uses[entry.id];
    }
    return uses;
};

/** Remet à zéro les ressources dont la période figure dans `periods` */
const resetResources = (c, periods) => {
    const res = { ...(c.resources ?? {}) };
    for (const r of resourcesOf(c)) if (periods.includes(r.reset)) delete res[r.key];
    return res;
};

/** États : ajoute ou retire */
export const toggleCondition = (c, key) => {
    const list = c.conditions ?? [];
    return { conditions: list.includes(key) ? list.filter(k => k !== key) : [...list, key] };
};

// ── Fin de rencontre et repos ───────────────────────────────────────────────

/** Fin de rencontre : hors combat, usages et ressources « par rencontre » rendus */
export const endEncounter = (c) => ({
    inCombat: false, actions: MAX_ACTIONS, turnAttacks: 0,
    uses: resetUses(c, ['encounter']), resources: resetResources(c, ['encounter']),
});

/**
 * Reprendre son souffle / Monter le camp : `healed` PV (déjà calculés par le jet),
 * `spent` dés de vie dépensés.
 */
export const fieldRest = (c, { healed, spent }) => ({
    ...heal(c, healed),
    hitDiceSpent: num(c.hitDiceSpent) + Math.max(0, num(spent)),
});

/**
 * Repos sûr : tous les PV, dés de vie, mana et ressources, usages rendus ;
 * 1 Blessure guérie ; PV temporaires perdus ; fin du combat.
 */
export const safeRest = (c) => ({
    hpCurrent: maxHp(c), tempHp: 0, dying: false, hitDiceSpent: 0,
    wounds: Math.max(0, num(c.wounds) - 1),
    resources: {}, uses: resetUses(c, ['encounter', 'safeRest', 'day']),
    inCombat: false, actions: MAX_ACTIONS, turnAttacks: 0,
});

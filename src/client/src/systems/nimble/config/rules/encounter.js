// src/client/src/systems/nimble/config/rules/encounter.js
// ─────────────────────────────────────────────────────────────────────────────
// Rencontre côté MJ (GM's Guide 3.0 p.6-7 ; spec_nimble.md §6.4) — pur.
// Monstres de la rencontre : PV, armure (moyenne −10, lourde −20 par attaque,
// ignorée par un critique), sbires (tout dégât en tue un), légendaires.
// ─────────────────────────────────────────────────────────────────────────────

export const ARMOR_REDUCTION = { medium: 10, heavy: 20 };
export const ARMOR_LABELS = { medium: 'Armure moyenne', heavy: 'Armure lourde' };

let seq = 0;

/**
 * Monstre ajouté à la rencontre, depuis le bestiaire ou libre.
 * @param {object} m       entrée du bestiaire (format_catalogues.md §7)
 * @param {number} [count]  nombre de sbires (sbires seulement)
 * @param {number} [heroes] nombre de héros : multiplie les PV « par héros » (légendaires)
 */
export const monsterHp = (m, heroes = 1) => (m.minion ? 0 : Number(m.hp ?? 0) * (m.hpPerHero ? Math.max(1, heroes) : 1));

export const monsterInstance = (m, count = 1, heroes = 1) => ({
    id: `m-${Date.now()}-${seq++}`, key: m.key ?? null, name: m.name, vo: m.vo ?? '', level: m.level ?? '',
    size: m.size ?? null, minion: !!m.minion, legendary: !!m.legendary, armor: m.armor ?? null,
    hpMax: monsterHp(m, heroes), hp: monsterHp(m, heroes),
    count: m.minion ? Math.max(1, count) : 1, alive: m.minion ? Math.max(1, count) : 1,
    attacks: m.attacks ?? [], abilities: m.abilities ?? [], sections: m.sections ?? [], speed: m.speed ?? null, saves: m.saves ?? null,
    notes: m.notes ?? '',
});

/** Dégâts après armure (un critique l'ignore) */
export const afterArmor = (amount, armor, crit = false) => Math.max(0, Number(amount) - (crit ? 0 : ARMOR_REDUCTION[armor] ?? 0));

/**
 * Inflige des dégâts : sbire → un de moins (si les dégâts passent l'armure),
 * sinon PV (jamais sous 0).
 */
export const damageMonster = (inst, amount, { crit = false } = {}) => {
    const dealt = afterArmor(amount, inst.armor, crit);
    if (inst.minion) return dealt > 0 ? { ...inst, alive: Math.max(0, inst.alive - 1) } : inst;
    return { ...inst, hp: Math.max(0, inst.hp - dealt) };
};

/** Soigne un monstre (PV max au plus) ou ramène un sbire */
export const healMonster = (inst, amount) => (inst.minion
    ? { ...inst, alive: Math.min(inst.count, inst.alive + 1) }
    : { ...inst, hp: Math.min(inst.hpMax, inst.hp + Math.max(0, Number(amount))) });

export const isDown = (inst) => (inst.minion ? inst.alive <= 0 : inst.hp <= 0);

// src/client/src/systems/nimble/config/rules/encounter.js
// ─────────────────────────────────────────────────────────────────────────────
// Rencontre côté MJ (GM's Guide 3.0 p.6-7 ; spec_nimble.md §6.4) — pur.
// Monstres de la rencontre : PV, armure (moyenne −10, lourde −20 par attaque,
// ignorée par un critique), sbires (tout dégât en tue un), légendaires.
// ─────────────────────────────────────────────────────────────────────────────

export const ARMOR_REDUCTION = { medium: 10, heavy: 20 };
export const ARMOR_LABELS = { medium: 'Armure moyenne', heavy: 'Armure lourde' };

/**
 * PV d'un monstre selon le nombre de héros (légendaires : PV « par héros ») ; sbire : 0.
 * @param {object} m       profil du monstre (format_catalogues.md §7, partie système d'un PNJ)
 * @param {number} [heroes] nombre de héros de la table
 */
export const monsterHp = (m, heroes = 1) => (m.minion ? 0 : Number(m.hp ?? 0) * (m.hpPerHero ? Math.max(1, heroes) : 1));

/**
 * État d'un monstre ajouté à la table (spec_pnj.md §8, L3-2, L3-3) : PV calculés pour la
 * table, sbires en un seul groupe de `quantity`.
 */
export const monsterState = (m, { quantity = 1, heroes = 1 } = {}) => {
    const count = m.minion ? Math.max(1, quantity) : 1;
    const hp = monsterHp(m, heroes);
    return { hpMax: hp, hp, count, alive: count };
};

/**
 * Monstre tel que la carte le lit : profil + état à la table (ou plein, en bibliothèque).
 * @param {object} m      profil du monstre
 * @param {object|null} state
 * @param {string} name   nom affiché
 */
export const monsterView = (m, state, name) => ({
    name, level: m.level ?? '', size: m.size ?? null, minion: !!m.minion, legendary: !!m.legendary, armor: m.armor ?? null,
    attacks: m.attacks ?? [], abilities: m.abilities ?? [], sections: m.sections ?? [], speed: m.speed ?? null, saves: m.saves ?? null,
    ...(state ?? monsterState(m)),
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

/** Valeur d'un niveau de monstre (« 1/3 », « 2 »…), pour trier ; un texte non chiffré passe en dernier */
export const levelValue = (level) => {
    const [a, b] = String(level ?? '').split('/').map(Number);
    if (!Number.isFinite(a)) return Infinity;
    return b ? a / b : a;
};

export const isDown = (inst) => (inst.minion ? inst.alive <= 0 : inst.hp <= 0);

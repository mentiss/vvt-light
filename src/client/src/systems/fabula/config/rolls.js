// src/client/src/systems/fabula/config/rolls.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles pures du jet de Fabula (spec_fabula.md §3.3, §6.2) :
//   - quelles compétences du personnage touchent ce jet, et lesquelles
//     s'activent d'elles-mêmes (rollEffect de classes.js) ;
//   - les modificateurs qui en découlent (bonus au test, dégâts, critique sur
//     tout double) ;
//   - la résolution d'un test à deux dés (VH, critique, fumble, réussite, dégâts) ;
//   - les dégâts d'un sort, lus dans sa description (« [VH + 15] dégâts de foudre ») ;
//   - le remplacement d'un dé par le Nombre porte-bonheur.
// Utilisé par la fenêtre de jet et par afterRoll (config.jsx).
// ─────────────────────────────────────────────────────────────────────────────

import { CLASSES } from './classes.js';
import { isInCrisis, skillRank } from './utils.js';

/**
 * Contexte d'un jet, pour décider des compétences :
 *   { mode: 'test' | 'attaque', spell: { offensif } | null,
 *     weapon: { categorie, portee } | null, attrs: [a1, a2] }
 * Le personnage donne le reste (Crise, arme arcanique équipée, rangs).
 */
const matches = (cond, char, ctx) => {
    if (!cond) return false;
    if (cond.weaponAttack && !(ctx.mode === 'attaque' && ctx.weapon && !ctx.spell)) return false;
    if (cond.offensiveSpell && !ctx.spell?.offensif) return false;
    if (cond.damage && ctx.mode !== 'attaque') return false;
    if (cond.test && ctx.mode !== 'test') return false;
    if (cond.weapon && !equippedWeapon(char)) return false;
    if (cond.attrs) {
        const [a, b] = ctx.attrs ?? [];
        const [x, y] = cond.attrs;
        if (!((a === x && b === y) || (a === y && b === x))) return false;
    }
    if (cond.weaponCategories && !cond.weaponCategories.includes(ctx.weapon?.categorie)) return false;
    if (cond.portee && ctx.weapon?.portee !== cond.portee) return false;
    if (cond.arcaneWeapon && !hasArcaneWeapon(char)) return false;
    if (cond.crisis && !isInCrisis(char)) return false;
    return true;
};

/** Arme arcanique équipée (Artillerie magique). */
export const hasArcaneWeapon = (char) =>
    (char?.equipment ?? []).some(e => e.emplacementEquipe && e.categorie === 'arcanique');

/** Première arme équipée avec un profil de précision (Sorcelame). */
export const equippedWeapon = (char) =>
    (char?.equipment ?? []).find(e => e.emplacementEquipe && e.precisionAttr1 && e.precisionAttr2) ?? null;

/**
 * Compétences du personnage qui touchent ce jet, dans l'ordre des classes.
 * Chaque entrée : { key, nom, rank, effect, value, auto, note }
 *   value : bonus ou dégâts déjà multipliés par le rang ; auto : pré-activée.
 */
export function applicableRollSkills(char, ctx) {
    const out = [];
    for (const c of char?.classes ?? []) {
        for (const comp of CLASSES[c.classKey]?.competences ?? []) {
            const fx = comp.rollEffect;
            if (!fx) continue;
            const rank = skillRank(char, c.classKey, comp.key);
            if (rank <= 0 || !matches(fx.show, char, ctx)) continue;
            out.push({
                key: comp.key, nom: comp.nom, rank, effect: fx.type,
                value: (fx.perRank ?? 0) * rank,
                attrs: fx.attrs ?? null,
                auto: !!fx.auto && matches(fx.auto, char, ctx),
                note: fx.note ?? null,
            });
        }
    }
    return out;
}

/** Modificateurs des compétences cochées : { bonus, damage, critAnyDouble, names } */
export function rollModifiers(skills) {
    return (skills ?? []).reduce((m, s) => ({
        bonus:  m.bonus  + (s.effect === 'bonus' || s.effect === 'shortcut' ? s.value : 0),
        damage: m.damage + (s.effect === 'damage' ? s.value : 0),
        critAnyDouble: m.critAnyDouble || s.effect === 'critAnyDouble',
        names: s.effect === 'lucky' || s.effect === 'weaponFormula' ? m.names : [...m.names, s.nom],
    }), { bonus: 0, damage: 0, critAnyDouble: false, names: [] });
}

/**
 * Résolution d'un test à deux dés (règle de la spec fonctionnelle) :
 *   VH = le plus haut des deux dés ; total = dés + modificateur + bonus ;
 *   critique = double ≥ 6, ou tout double avec Frénésie (critAnyDouble) ;
 *   fumble = double 1 (jamais critique, même avec Frénésie) ;
 *   réussite contre le ND s'il est connu ; dégâts = VH + bonus de l'arme ou du sort.
 */
export function resolveFabulaTest({ die1, die2, modifier = 0, bonus = 0, nd = null, critAnyDouble = false, degatsBonus = null }) {
    const vh = Math.max(die1, die2);
    const total = die1 + die2 + modifier + bonus;
    const criticalFailure = die1 === 1 && die2 === 1;
    const criticalSuccess = !criticalFailure && die1 === die2 && (die1 >= 6 || critAnyDouble);
    let success = null;
    if (criticalSuccess) success = true;
    else if (criticalFailure) success = false;
    else if (nd != null) success = total >= nd;
    return {
        vh, total, criticalSuccess, criticalFailure, success,
        degats: degatsBonus != null ? vh + degatsBonus : null,
    };
}

// Types de dégâts du texte des sorts → clés de TYPES_DEGATS
const DMG_TYPES = { physiques: 'physique', physique: 'physique', feu: 'feu', glace: 'glace', foudre: 'foudre', air: 'air', terre: 'terre', lumiere: 'lumiere', tenebres: 'tenebres', poison: 'poison' };
const stripAccents = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Dégâts d'un sort lus dans sa description : { degatsBonus, degatsType } ou null. */
export function parseSpellDamage(description) {
    const m = (description ?? '').match(/\[VH \+ (\d+)\] dégâts (?:de |d')([A-Za-zÀ-ÿ]+)/);
    if (!m) return null;
    const type = DMG_TYPES[stripAccents(m[2]).toLowerCase()];
    return type ? { degatsBonus: Number(m[1]), degatsType: type } : null;
}

/**
 * Nombre porte-bonheur : le dé `index` (0 ou 1) prend la valeur du nombre, et
 * la valeur remplacée devient le nouveau nombre. Renvoie { dice: [d1, d2], next }.
 */
export function applyLuckyNumber([die1, die2], index, lucky) {
    const dice = [die1, die2];
    const next = dice[index];
    dice[index] = lucky;
    return { dice, next };
}

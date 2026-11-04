// src/client/src/systems/nimble/config/rules/levelUp.js
// ─────────────────────────────────────────────────────────────────────────────
// Montée de niveau (Core Rules 3.3 p.21 ; spec_nimble.md §6.2, D-9) — pur.
// Chaque niveau : PV (dé de vie avec avantage, ou gain fixe), +1 dé de vie max
// (dérivé du niveau), +1 point de compétence (et déplacement facultatif d'un
// point), capacités du niveau et leurs choix (sous-classe, listes,
// caractéristiques, faveur épique).
// ─────────────────────────────────────────────────────────────────────────────

import { STATS, FLAT_HP, SKILLS } from '../basics.js';
import { classOf, subclassOf, hitDieSides, maxSpellTier, statValue, skillValue, optionPool } from './character.js';

/** Plafond habituel d'une caractéristique de héros */
export const STAT_CAP = 5;

/**
 * Ce que le prochain niveau apporte.
 * @returns {{ level, sides, flat, features: [{ source, feature }], picks: [{ pool, count, label, items }],
 *             statIncreases: [{ from, count, stats }], needsSubclass, epicBoon, tierBefore, tierAfter }}
 */
export const levelUpPlan = (c, subclassKey = c?.subclassKey) => {
    const level = Number(c?.level ?? 1) + 1;
    const cls = classOf(c);
    const sub = cls?.subclasses?.find(s => s.key === subclassKey) ?? subclassOf(c);
    const own = (cls?.levels?.[level] ?? []).map(f => ({ source: 'class', feature: f }));
    const subFeatures = (sub?.levels?.[level] ?? []).map(f => ({ source: 'subclass', feature: f }));
    const features = [...own, ...subFeatures];
    const sides = hitDieSides(c);
    const picks = features.filter(({ feature }) => feature.choice?.pool).map(({ feature }) => {
        const pool = optionPool({ ...c, subclassKey: sub?.key ?? null }, feature.choice.pool);
        return { pool: feature.choice.pool, count: Number(feature.choice.count ?? 1), label: pool?.label ?? feature.name, items: pool?.items ?? [] };
    });
    const keys = cls?.keyStats ?? [];
    const statIncreases = features.filter(({ feature }) => feature.statIncrease).map(({ feature }) => {
        const from = feature.statIncrease.from;
        const stats = from === 'key' ? keys : from === 'secondary' ? STATS.map(s => s.key).filter(k => !keys.includes(k)) : STATS.map(s => s.key);
        return { from, count: Number(feature.statIncrease.count ?? 1), stats };
    });
    return {
        level, sides, flat: FLAT_HP[sides] ?? Math.ceil(sides / 2),
        features, picks, statIncreases,
        needsSubclass: own.some(({ feature }) => feature.subclass) && !c?.subclassKey,
        epicBoon: own.some(({ feature }) => feature.epicBoon),
        tierBefore: maxSpellTier(c),
        tierAfter: maxSpellTier({ ...c, level }),
    };
};

/** Une augmentation de caractéristique est-elle possible (plafond +5) ? */
export const canRaise = (c, stat, already = 0) => statValue(c, stat) + already < STAT_CAP;

/** Compétences d'où l'on peut retirer un point (le livre : pas en négatif) */
export const movableSkills = (c) => SKILLS.filter(s => Number(c?.skillPoints?.[s.key] ?? 0) > 0 && skillValue(c, s.key) > 0).map(s => s.key);

/**
 * Patch de la montée de niveau.
 * @param {object} c
 * @param {object} p
 * @param {number}   p.hpGain       PV gagnés (jet avec avantage ou gain fixe)
 * @param {string}   [p.skill]      compétence qui gagne le point
 * @param {string}   [p.moveFrom]   compétence d'où l'on déplace un point (facultatif)
 * @param {string}   [p.moveTo]
 * @param {string[]} [p.stats]      caractéristiques augmentées (+1 chacune)
 * @param {string}   [p.subclassKey]
 * @param {{ pool, key }[]} [p.picks]  choix dans les listes, faveur épique (pool 'epicBoon'), écoles ('school')
 */
export const applyLevelUp = (c, { hpGain = 0, skill = null, moveFrom = null, moveTo = null, stats = [], subclassKey = null, picks = [] }) => {
    const level = Number(c.level ?? 1) + 1;
    const skillPoints = { ...(c.skillPoints ?? {}) };
    if (skill) skillPoints[skill] = Number(skillPoints[skill] ?? 0) + 1;
    if (moveFrom && moveTo && moveFrom !== moveTo && Number(skillPoints[moveFrom] ?? 0) > 0) {
        skillPoints[moveFrom] -= 1;
        skillPoints[moveTo] = Number(skillPoints[moveTo] ?? 0) + 1;
    }
    const patch = {
        level,
        hpMax: Number(c.hpMax ?? 0) + Math.max(0, hpGain),
        hpCurrent: Number(c.hpCurrent ?? 0) + Math.max(0, hpGain),
        skillPoints,
        choices: [...(c.choices ?? []), ...picks.filter(p => p.key).map(p => ({ pool: p.pool, key: p.key, level }))],
    };
    for (const s of stats) {
        const field = STATS.find(x => x.key === s)?.field;
        if (field) patch[field] = Number(patch[field] ?? c[field] ?? 0) + 1;
    }
    if (subclassKey) patch.subclassKey = subclassKey;
    return patch;
};

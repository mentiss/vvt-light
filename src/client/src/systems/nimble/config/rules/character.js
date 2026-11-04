// src/client/src/systems/nimble/config/rules/character.js
// ─────────────────────────────────────────────────────────────────────────────
// Dérivés d'un personnage Nimble (spec_nimble.md §1.2, §4) — pur. Calculés une
// seule fois ici, jamais dans les composants : caractéristiques et formules,
// compétences, Défense, Initiative, Vitesse, Blessures et dés de vie max,
// emplacements, ressources de classe, capacités (avec leurs usages), sorts
// connus, attaques des armes.
// ─────────────────────────────────────────────────────────────────────────────

import {
    STATS, SKILLS, DIE_STEPS, BASE_SPEED, BASE_WOUNDS, BASE_SLOTS,
} from '../basics.js';
import {
    CLASSES, ANCESTRY_BY_KEY, BACKGROUND_BY_KEY, BOON_BY_KEY, ALL_SPELLS, SCHOOL_BY_KEY,
} from '../catalog.js';
import { evalFormula, parseDice } from './formula.js';

// ── Identité ────────────────────────────────────────────────────────────────

/** Nom affiché : « prénom nom » (l'un ou l'autre peut manquer) */
export const displayName = (c) => [c?.prenom, c?.nom].map(s => s?.trim()).filter(Boolean).join(' ');

export const classOf = (c) => CLASSES[c?.classKey] ?? null;
export const subclassOf = (c) => classOf(c)?.subclasses?.find(s => s.key === c?.subclassKey) ?? null;
export const ancestryOf = (c) => ANCESTRY_BY_KEY[c?.ancestryKey] ?? null;
export const backgroundOf = (c) => BACKGROUND_BY_KEY[c?.backgroundKey] ?? null;

/** « Elfe · Chasseur 3 » */
export const originLine = (c) => [ancestryOf(c)?.name, [classOf(c)?.name, c?.level].filter(Boolean).join(' ')].filter(Boolean).join(' · ');

// ── Caractéristiques et formules ────────────────────────────────────────────

export const statValue = (c, key) => Number(c?.[STATS.find(s => s.key === key)?.field] ?? 0);

/** Variables des formules de catalogue : STR DEX INT WIL KEY LVL */
export const formulaVars = (c) => {
    const vars = { STR: statValue(c, 'str'), DEX: statValue(c, 'dex'), INT: statValue(c, 'int'), WIL: statValue(c, 'wil'), LVL: Number(c?.level ?? 1) };
    const keys = classOf(c)?.keyStats ?? [];
    vars.KEY = keys.length ? Math.max(...keys.map(k => vars[k.toUpperCase()] ?? 0)) : Math.max(vars.STR, vars.DEX, vars.INT, vars.WIL);
    return vars;
};

/** Une valeur par palier (`{ 1: x, 5: y }`) au niveau donné, sinon `fallback` */
export const byLevel = (table, level, fallback) => {
    if (!table) return fallback;
    const steps = Object.keys(table).map(Number).filter(l => l <= level).sort((a, b) => a - b);
    return steps.length ? table[steps[steps.length - 1]] : fallback;
};

// ── Effets chiffrés (ascendance, historique, faveurs, ajustements) ─────────

const choicesOf = (c) => (Array.isArray(c?.choices) ? c.choices : []);
const boonsOf = (c) => choicesOf(c).filter(ch => ch.pool === 'boon' || ch.pool === 'epicBoon').map(ch => BOON_BY_KEY[ch.key]).filter(Boolean);

/** Somme des effets automatisables (format_catalogues.md §4) */
export const effectsOf = (c) => {
    const sources = [ancestryOf(c)?.effects, backgroundOf(c)?.effects, ...boonsOf(c).map(b => b.effects)].filter(Boolean);
    const out = { skills: {}, speed: 0, maxWounds: 0, maxHitDice: 0, defense: 0, initiative: 0, hitDieStep: 0, initiativeAdvantage: false, maxHp: 0, maxMana: 0 };
    for (const e of sources) {
        for (const [k, v] of Object.entries(e.skills ?? {})) out.skills[k] = (out.skills[k] ?? 0) + Number(v);
        for (const k of ['speed', 'maxWounds', 'maxHitDice', 'defense', 'initiative', 'hitDieStep', 'maxHp', 'maxMana']) out[k] += Number(e[k] ?? 0);
        if (e.initiativeAdvantage) out.initiativeAdvantage = true;
    }
    return out;
};

const bonus = (c, key) => Number(c?.bonuses?.[key] ?? 0);

// ── Compétences et sauvegardes ─────────────────────────────────────────────

/** Valeur d'une compétence : caractéristique + points placés + effets */
export const skillValue = (c, key, effects = effectsOf(c)) => {
    const skill = SKILLS.find(s => s.key === key);
    if (!skill) return 0;
    return statValue(c, skill.stat) + Number(c?.skillPoints?.[key] ?? 0) + (effects.skills.all ?? 0) + (effects.skills[key] ?? 0);
};

/** Sauvegarde : 1 (▲ avantagée), -1 (▼ désavantagée) ou 0 */
export const saveEdge = (c, key) => Math.sign(Number(c?.saves?.[key] ?? 0));

/** Sauvegardes de départ : celles de la classe, corrigées par l'ascendance (Céleste, Démonide) */
export const initialSaves = (classKey, ancestryKey, neutralChoice = null) => {
    const cls = CLASSES[classKey];
    const saves = { str: 0, dex: 0, int: 0, wil: 0 };
    if (cls?.saves?.adv) saves[cls.saves.adv] = 1;
    if (cls?.saves?.dis) saves[cls.saves.dis] = -1;
    const rule = ANCESTRY_BY_KEY[ancestryKey]?.effects?.saves;
    if (rule === 'disToNeutral' && cls?.saves?.dis) saves[cls.saves.dis] = 0;
    if (rule === 'neutralToAdv' && neutralChoice && saves[neutralChoice] === 0) saves[neutralChoice] = 1;
    return saves;
};

// ── Valeurs de la bande ─────────────────────────────────────────────────────

/** Taille du dé de vie : celle de la classe, augmentée d'un cran par effet, ou fixée en Édition */
export const hitDieSides = (c, effects = effectsOf(c)) => {
    const forced = bonus(c, 'hitDie');
    if (forced) return forced;
    const base = classOf(c)?.hitDie ?? 8;
    const i = DIE_STEPS.indexOf(base);
    return i < 0 ? base : DIE_STEPS[Math.min(DIE_STEPS.length - 1, i + effects.hitDieStep)];
};
export const maxHitDice = (c, effects = effectsOf(c)) => Math.max(0, Number(c?.level ?? 1) + effects.maxHitDice + bonus(c, 'maxHitDice'));
export const hitDiceLeft = (c, effects) => Math.max(0, maxHitDice(c, effects) - Number(c?.hitDiceSpent ?? 0));
export const maxWounds = (c, effects = effectsOf(c)) => Math.max(1, BASE_WOUNDS + effects.maxWounds + bonus(c, 'maxWounds'));
export const speedOf = (c, effects = effectsOf(c)) => BASE_SPEED + effects.speed + bonus(c, 'speed');
export const initiativeOf = (c, effects = effectsOf(c)) => statValue(c, 'dex') + effects.initiative + bonus(c, 'initiative');
export const maxSlots = (c) => BASE_SLOTS + statValue(c, 'str') + bonus(c, 'slots');
export const usedSlots = (c) => (c?.items ?? []).reduce((s, it) => s + Number(it.slots ?? 0), 0);

/** PV max : tirés aux montées de niveau (colonne), plus les ajustements */
export const maxHp = (c, effects = effectsOf(c)) => Math.max(1, Number(c?.hpMax ?? 0) + effects.maxHp + bonus(c, 'hp'));
export const isBloodied = (c) => Number(c?.hpCurrent ?? 0) <= maxHp(c) / 2;

/**
 * Défense : armure portée (base + DEX, plafonnée si besoin), sinon DEX ;
 * plus les boucliers portés, les effets et l'ajustement d'Édition.
 */
export const defenseOf = (c, effects = effectsOf(c)) => {
    const dex = statValue(c, 'dex');
    const worn = (c?.items ?? []).filter(it => it.equipped);
    const armor = worn.find(it => it.kind === 'armor');
    let value = dex;
    if (armor) {
        const d = armor.data ?? {};
        const dexPart = d.addDex === false ? 0 : (d.dexMax !== null && d.dexMax !== undefined ? Math.min(dex, Number(d.dexMax)) : dex);
        value = Number(d.defense ?? 0) + dexPart;
    }
    const shields = worn.filter(it => it.kind === 'shield').reduce((s, it) => s + Number(it.data?.defense ?? 0), 0);
    return value + shields + effects.defense + bonus(c, 'defense');
};

// ── Ressources de classe ────────────────────────────────────────────────────

/**
 * Ressources de la classe et de la sous-classe au niveau du personnage :
 * [{ key, label, max (null = compteur), value (restant ou compté), die, reset }]
 * La colonne `resources` garde, par clé, la quantité dépensée (jauge à plafond)
 * ou comptée (compteur sans plafond).
 */
export const resourcesOf = (c) => {
    const level = Number(c?.level ?? 1);
    const vars = formulaVars(c);
    const effects = effectsOf(c);
    const list = [...(classOf(c)?.resources ?? []), ...(subclassOf(c)?.resources ?? [])];
    return list.filter(r => (r.fromLevel ?? 1) <= level).map(r => {
        const formula = byLevel(r.maxByLevel, level, r.max);
        let max = formula === null || formula === undefined ? null : Math.max(0, evalFormula(formula, vars));
        if (max !== null && r.key === 'mana') max += effects.maxMana;
        const stored = Number(c?.resources?.[r.key] ?? 0);
        return {
            key: r.key, label: r.label, reset: r.reset ?? 'safeRest', max,
            value: max === null ? stored : Math.max(0, max - stored),
            die: byLevel(r.dieByLevel, level, r.die ?? null),
        };
    });
};

// ── Capacités ───────────────────────────────────────────────────────────────

const optionPools = (c) => ({ ...(classOf(c)?.options ?? {}), ...(subclassOf(c)?.options ?? {}) });

/** La liste d'options `pool` (classe ou sous-classe) */
export const optionPool = (c, pool) => optionPools(c)[pool] ?? null;

/**
 * Toutes les capacités du personnage, groupées par origine :
 * [{ id, source, level?, feature }] — id stable pour les usages (`uses`).
 */
export const featuresOf = (c) => {
    const level = Number(c?.level ?? 1);
    const cls = classOf(c);
    const sub = subclassOf(c);
    const out = [];
    const ancestry = ancestryOf(c);
    if (ancestry?.trait) out.push({ id: `ancestry:${ancestry.key}`, source: 'ancestry', feature: { ...ancestry.trait, key: ancestry.key, uses: ancestry.uses } });
    const background = backgroundOf(c);
    if (background) out.push({ id: `background:${background.key}`, source: 'background', feature: background });
    for (let l = 1; l <= level; l++) {
        for (const f of cls?.levels?.[l] ?? []) out.push({ id: `class:${f.key}`, source: 'class', level: l, feature: f });
        for (const f of sub?.levels?.[l] ?? []) out.push({ id: `subclass:${f.key}`, source: 'subclass', level: l, feature: f });
    }
    const pools = optionPools(c);
    for (const ch of choicesOf(c)) {
        if (ch.pool === 'boon' || ch.pool === 'epicBoon') {
            const b = BOON_BY_KEY[ch.key];
            if (b) out.push({ id: `boon:${b.key}`, source: 'boon', level: ch.level, feature: b });
            continue;
        }
        const item = pools[ch.pool]?.items?.find(i => i.key === ch.key);
        if (item) out.push({ id: `option:${ch.pool}:${item.key}`, source: 'option', pool: ch.pool, level: ch.level, feature: item });
    }
    return out;
};

/** Usages d'une capacité : { max, used, per } ou null si elle n'en a pas */
export const featureUses = (c, entry, vars = formulaVars(c)) => {
    const u = entry.feature?.uses;
    if (!u?.count) return null;
    const max = Math.max(0, evalFormula(u.count, vars, 1));
    return { max, used: Math.min(max, Number(c?.uses?.[entry.id] ?? 0)), per: u.per ?? 'safeRest' };
};

/** Choix encore à faire jusqu'au niveau actuel : [{ pool, missing, label }] */
export const pendingChoices = (c) => {
    const level = Number(c?.level ?? 1);
    const need = {};
    const add = (f) => { if (f.choice?.pool) need[f.choice.pool] = (need[f.choice.pool] ?? 0) + Number(f.choice.count ?? 1); };
    for (let l = 1; l <= level; l++) {
        (classOf(c)?.levels?.[l] ?? []).forEach(add);
        (subclassOf(c)?.levels?.[l] ?? []).forEach(add);
    }
    return Object.entries(need).map(([pool, count]) => ({
        pool, label: optionPool(c, pool)?.label ?? pool,
        missing: Math.max(0, count - choicesOf(c).filter(ch => ch.pool === pool).length),
    })).filter(p => p.missing > 0);
};

/** Le personnage doit-il choisir sa sous-classe ? */
export const needsSubclass = (c) => {
    const level = Number(c?.level ?? 1);
    if (c?.subclassKey) return false;
    for (let l = 1; l <= level; l++) if ((classOf(c)?.levels?.[l] ?? []).some(f => f.subclass)) return true;
    return false;
};

// ── Sorts ───────────────────────────────────────────────────────────────────

/** Rang de sort maximal débloqué (0 : tours de magie seuls, null : pas de sorts) */
export const maxSpellTier = (c) => {
    const sc = classOf(c)?.spellcasting;
    if (!sc) return null;
    return Number(byLevel(sc.tiers, Number(c?.level ?? 1), 0));
};

/** Écoles connues : celles de la classe, plus celles apprises (choix `school`) */
export const knownSchools = (c) => {
    const base = classOf(c)?.spellcasting?.schools ?? [];
    const learned = choicesOf(c).filter(ch => ch.pool === 'school').map(ch => ch.key);
    return [...new Set([...base, ...learned])].filter(k => SCHOOL_BY_KEY[k]);
};

/**
 * Sorts lançables : écoles connues jusqu'au rang débloqué, sorts propres à la
 * classe et à la sous-classe (jusqu'au rang débloqué), sorts appris un par un
 * (choix `spell` : utilitaires, historique…).
 */
export const knownSpells = (c) => {
    const tier = maxSpellTier(c);
    const schools = knownSchools(c);
    const own = [...(classOf(c)?.spells ?? []), ...(subclassOf(c)?.spells ?? [])];
    const learned = choicesOf(c).filter(ch => ch.pool === 'spell').map(ch => ch.key);
    const list = ALL_SPELLS.filter(s => (
        learned.includes(s.key)
        || (tier !== null && schools.includes(s.school) && !s.utility && s.tier <= tier)
        || (own.some(o => o.key === s.key) && s.tier <= Math.max(tier ?? 0, 0))
    ));
    return list;
};

/** Bonus de haut niveau d'un tour de magie (« +5 dégâts tous les 5 niveaux ») */
export const cantripBonus = (spell, level) => {
    const h = spell?.highLevels;
    if (!h?.every || typeof h.bonus !== 'number') return 0;
    return Math.floor(Number(level) / h.every) * h.bonus;
};

// ── Armes et maîtrise ───────────────────────────────────────────────────────

/**
 * Maîtrise d'une arme par la règle de la classe (format_catalogues.md §2) ;
 * `item.proficient` (Édition) l'emporte s'il est renseigné.
 */
export const isProficient = (c, item) => {
    if (item?.proficient === true || item?.proficient === false) return item.proficient;
    const rule = classOf(c)?.weapons?.rule;
    if (!rule) return true;
    if (rule.all) return true;
    // Mains nues : seulement les classes qui les maîtrisent (sinon, pas de critique)
    if (item?.itemKey === 'unarmed') return !!rule.unarmed;
    const d = item?.data ?? {};
    if (rule.tags?.some(t => (d.tags ?? []).includes(t))) return true;
    const statOk = !rule.stats || rule.stats.some(s => String(d.stat ?? '').split('/').includes(s));
    const rangeOk = !rule.range || rule.range === d.range;
    return !!(rule.stats || rule.range) && statOk && rangeOk;
};

/** Caractéristique de dégâts d'une arme (« str/dex » : la meilleure) */
export const weaponStat = (c, item) => {
    const options = String(item?.data?.stat ?? 'str').split('/');
    return options.reduce((best, s) => (statValue(c, s) > statValue(c, best) ? s : best), options[0]);
};

/** Attaques prêtes à lancer : armes portées, puis mains nues */
export const attacksOf = (c) => {
    const weapons = (c?.items ?? []).filter(it => it.kind === 'weapon' && it.equipped);
    const list = weapons.map(it => {
        const stat = weaponStat(c, it);
        const props = it.data?.props ?? [];
        return {
            id: `item:${it.id}`, item: it, name: it.name, dice: it.data?.damage ?? '1d4', stat, mod: statValue(c, stat),
            vicious: props.some(p => p.key === 'vicious'), proficient: isProficient(c, it),
            range: props.find(p => p.key === 'range')?.value ?? null, props,
        };
    });
    list.push({ id: 'unarmed', item: null, name: 'Mains nues', dice: '1d4', stat: 'str', mod: statValue(c, 'str'), vicious: false,
        proficient: isProficient(c, { itemKey: 'unarmed', data: { stat: 'str', range: 'melee' } }), range: null, props: [] });
    return list;
};

/** Dés résolus d'une formule de catalogue pour ce personnage */
export const diceFor = (c, dice) => parseDice(dice, formulaVars(c));

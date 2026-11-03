// src/client/src/systems/woddavampire/config/rules/sheetRules.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles de calcul de la fiche (spec_woddavampire.md §3, §7, §8, §9, §13.2).
// Fonctions pures, sans React ; testées dans tests/systems/woddavampire/.
// ─────────────────────────────────────────────────────────────────────────────

import { ABILITY_CATEGORY, ABILITY_LABELS, ATTRIBUTE_LABELS } from '../traits.js';
import { DISCIPLINES } from '../disciplines.js';
import { VIRTUE_LABELS, roadVirtues } from '../roads.js';
import { CLAN_WEAKNESS_STATES, IMPOSED_STATE_ORDER } from '../conditions.js';
import { clampDifficulty } from './dicePool.js';
import { WEAPONS, DAMAGE_TYPE_SHORT } from '../equipment.js';
import { generationStats, clanDisciplines } from './character.js';
import { isSimpleCost, parseTrait } from './powerRoll.js';

// ── Santé (§9.1, §9.2) ───────────────────────────────────────────────────────

const BASE_LEVELS = [
    { label: 'Contusionné', penalty: 0 },
    { label: 'Blessé', penalty: -1 },
    { label: 'Touché', penalty: -1 },
    { label: 'Blessé gravement', penalty: -2 },
    { label: 'Mutilé', penalty: -2 },
    { label: 'Infirme', penalty: -5 },
    { label: 'Neutralisé', penalty: null },   // aucune action normale
];

const hasMerit = (c, key) => (c.meritsFlaws ?? []).some(m => m.entryKey === key);

/** Niveaux de santé du personnage (Robuste : +1 niveau Contusionné, §9.1) */
export const healthLevels = (c) => (hasMerit(c, 'sturdy') ? [BASE_LEVELS[0], ...BASE_LEVELS] : BASE_LEVELS);

/** Marques rangées automatiquement : aggravé en haut, puis létal, puis contondant */
export const healthMarks = (c) => {
    const n = healthLevels(c).length;
    const agg = Math.min(n, c.damageAggravated ?? 0);
    const leth = Math.min(n - agg, c.damageLethal ?? 0);
    const bash = Math.min(n - agg - leth, c.damageBashing ?? 0);
    return [...Array(agg).fill('aggravated'), ...Array(leth).fill('lethal'), ...Array(bash).fill('bashing'), ...Array(n - agg - leth - bash).fill('')];
};

const NEXT_MARK = { '': 'bashing', bashing: 'lethal', lethal: 'aggravated', aggravated: '' };

/** Clic sur la case i : vide → / → X → ✱ → vide, puis nouveaux compteurs (rangement automatique) */
export const cycleHealthBox = (c, index) => {
    const marks = healthMarks(c);
    marks[index] = NEXT_MARK[marks[index]];
    return {
        damageBashing:    marks.filter(m => m === 'bashing').length,
        damageLethal:     marks.filter(m => m === 'lethal').length,
        damageAggravated: marks.filter(m => m === 'aggravated').length,
    };
};

/** Malus du niveau le plus grave atteint (§9.1) ; incapacitated : Neutralisé ou pire */
export const woundPenalty = (c) => {
    const levels = healthLevels(c);
    const filled = healthMarks(c).filter(Boolean).length;
    if (filled === 0) return { penalty: 0, incapacitated: false, worstIndex: -1 };
    const level = levels[filled - 1];
    return { penalty: level.penalty ?? 0, incapacitated: level.penalty === null, worstIndex: filled - 1 };
};

/** Résumé de santé (fiche du Conteur) : « Touché (-1) », « Indemne » ; hurt : un malus s'applique */
export const woundSummary = (c) => {
    const wound = woundPenalty(c);
    if (wound.worstIndex < 0) return { text: 'Indemne', hurt: false };
    const label = healthLevels(c)[wound.worstIndex].label;
    return { text: wound.penalty ? `${label} (${wound.penalty})` : label, hurt: !!wound.penalty };
};

// ── Réserve d'un jet (§3.2, §3.3, §13.2) ─────────────────────────────────────

export const disciplineRating = (c, key) => (c.disciplines ?? []).find(d => d.disciplineKey === key)?.rating ?? 0;
export const abilityRating = (c, key) => (c.abilities ?? []).find(a => a.abilityKey === key)?.rating ?? 0;

/** Valeur d'un trait quelconque d'une réserve (pouvoirs : Volonté, Vertu, Route, Discipline…) */
export const traitValue = (c, t) => {
    switch (t.kind) {
    case 'attribute':  return c[t.key] ?? 0;
    case 'ability':    return abilityRating(c, t.key);
    case 'virtue':     return c[t.key] ?? 0;
    case 'willpower':  return c.willpowerPermanent ?? 0;
    case 'road':       return c.roadRating ?? 0;
    case 'discipline': return disciplineRating(c, t.key);
    default:           return 0;
    }
};

/** Libellé d'un trait (les Vertus prennent le nom imposé par la Route) */
export const traitLabel = (c, t) => {
    if (t.kind === 'attribute') return ATTRIBUTE_LABELS[t.key];
    if (t.kind === 'ability') return ABILITY_LABELS[t.key];
    if (t.kind === 'virtue') {
        const [moral, control] = roadVirtues(c.roadKey, c.roadPathKey);
        return VIRTUE_LABELS[{ virtueMoral: moral, virtueControl: control, virtueCourage: 'courage' }[t.key]];
    }
    if (t.kind === 'willpower') return 'Volonté';
    if (t.kind === 'road') return 'Route';
    return DISCIPLINES[t.key]?.label ?? t.key;
};

/** Discipline physique dont le bonus permanent s'ajoute à un Attribut (Célérité → Dextérité…) */
export const physicalBonusFor = (attrKey) => Object.entries(DISCIPLINES).find(([, d]) => d.physical === attrKey)?.[0] ?? null;

const DIFFICULTY_LABELS = { 2: 'Enfantine', 3: 'Triviale', 4: 'Facile', 5: 'Simple', 6: 'Standard', 7: 'Exigeante', 8: 'Difficile', 9: 'Très difficile', 10: 'Quasi impossible' };
export const difficultyLabel = (d) => DIFFICULTY_LABELS[clampDifficulty(d)];

/**
 * Compose la réserve d'un jet.
 * @param {object} c          personnage
 * @param {object} o          { attrKey, abilityKey, virtue, virtueLabel, diceMod, diceModLabel, difficulty,
 *                              diffMod, diffModLabel, reflex, physicalBonus, specialty, willpower,
 *                              extras: [{ kind, key }] (traits en plus : Volonté, Vertu, Route, Discipline),
 *                              rawAttributes (Koldunisme : sans bonus de Discipline), activatePhysical }
 * @returns {{ lines: {label:string, value:number}[], dice:number, difficulty:number, diffLines:{label,value}[],
 *             blocked: string|null, specialtyAllowed: boolean, autoSuccesses: number, activatable: string|null }}
 */
export const buildPool = (c, o) => {
    const lines = [];
    const diffLines = [];
    let blocked = null;

    if (o.attrKey) lines.push({ label: ATTRIBUTE_LABELS[o.attrKey], value: c[o.attrKey] ?? 0 });
    for (const t of o.extras ?? []) lines.push({ label: traitLabel(c, t), value: traitValue(c, t) });

    // Jet de Vertu (§4.5, §11.1) : jamais au-delà de la Route ; Maîtrise/Instinct aussi plafonnée
    // par la réserve de sang actuelle. Les Vertus sont des jets réflexes (pas de malus de blessure).
    let reflex = !!o.reflex;
    if (o.virtue) {
        reflex = true;
        const caps = [c.roadRating ?? 0];
        if (o.virtue === 'virtueControl') caps.push(c.bloodCurrent ?? 0);
        const value = Math.min(c[o.virtue] ?? 0, ...caps);
        lines.push({ label: o.virtueLabel || 'Vertu', value });
    }

    // Capacité à 0 (§3.3) : Talent sans pénalité, Compétence +1 diff, Connaissance impossible
    let abilityValue = 0;
    if (o.abilityKey) {
        abilityValue = abilityRating(c, o.abilityKey);
        if (abilityValue > 0) lines.push({ label: ABILITY_LABELS[o.abilityKey], value: abilityValue });
        else if (ABILITY_CATEGORY[o.abilityKey] === 'skill') diffLines.push({ label: `${ABILITY_LABELS[o.abilityKey]} à 0`, value: 1 });
        else if (ABILITY_CATEGORY[o.abilityKey] === 'knowledge') blocked = `${ABILITY_LABELS[o.abilityKey]} à 0 : jet impossible (sauf savoir commun, au jugement du Conteur)`;
    }

    // Bonus permanent de la Discipline physique (Célérité, Force d'âme, Puissance), décochable ;
    // Puissance et Force d'âme activées (1 sang, §13.2, B-6) : leurs dés deviennent des succès automatiques
    const phys = o.attrKey && !o.rawAttributes ? physicalBonusFor(o.attrKey) : null;
    const physRating = phys ? disciplineRating(c, phys) : 0;
    const activatable = physRating > 0 && phys !== 'celerity' ? phys : null;
    let physAuto = 0;
    if (physRating > 0 && o.physicalBonus !== false) {
        if (activatable && o.activatePhysical) physAuto = physRating;
        else lines.push({ label: DISCIPLINES[phys].label, value: physRating });
    }

    // Armure : pénalité aux actions basées sur la Dextérité (§10.4)
    const armorPenalty = equippedArmor(c)?.penalty ?? 0;
    if (o.attrKey === 'dexterity' && armorPenalty && !o.noArmorPenalty) lines.push({ label: 'Armure', value: -armorPenalty });

    // Malus de blessure (sauf jet réflexe)
    const wound = woundPenalty(c);
    if (!reflex && wound.penalty) lines.push({ label: 'Blessures', value: wound.penalty });
    if (!reflex && wound.incapacitated) blocked = blocked ?? 'Neutralisé : aucune action normale';

    if (o.diceMod) lines.push({ label: o.diceModLabel || 'Modificateur', value: o.diceMod });
    if (o.diffMod) diffLines.push({ label: o.diffModLabel || 'Modificateur', value: o.diffMod });

    // Faiblesse du clan appliquée à toutes les réserves (§17, C-6)
    const before = Math.max(0, lines.reduce((s, l) => s + l.value, 0));
    const weakened = applyClanWeakness(c, before);
    if (weakened.label) lines.push({ label: weakened.label, value: weakened.dice - before });

    const dice = Math.max(0, lines.reduce((s, l) => s + l.value, 0));
    const difficulty = clampDifficulty((o.difficulty ?? 6) + diffLines.reduce((s, l) => s + l.value, 0));
    // Spécialité (§3.2) : trait à 4 ou plus ET une spécialité saisie pour la Capacité (les Attributs n'en stockent pas)
    const specialties = o.abilityKey ? ((c.abilities ?? []).find(a => a.abilityKey === o.abilityKey)?.specialties ?? []).filter(s => s?.trim()) : [];
    const traitForSpecialty = o.abilityKey ? (specialties.length ? abilityValue : 0) : (o.attrKey ? (c[o.attrKey] ?? 0) : 0);

    return {
        lines, dice, difficulty, diffLines, blocked,
        specialtyAllowed: traitForSpecialty >= 4,
        specialties,
        autoSuccesses: (o.willpower ? 1 : 0) + physAuto,
        activatable,
    };
};

// ── États et faiblesse du clan (§17) ─────────────────────────────────────────

export const hasState = (c, key) => (c.states ?? []).includes(key);

/** État imposé par le Conteur (Frénésie, Rötschreck, Torpeur), un seul à la fois ; null sinon */
export const imposedState = (c) => IMPOSED_STATE_ORDER.find(k => hasState(c, k)) ?? null;

/** Faiblesse appliquée du clan, ou null (Tzimisce, Lhiannan, Gargouilles ; Anda : rappel) */
export const clanWeaknessState = (c) => CLAN_WEAKNESS_STATES[c.clanKey] ?? null;

/**
 * Réserve après la faiblesse du clan : { dice, label } (label null si rien ne change).
 * Tzimisce : ÷ 2 par jour sans terre (cumulatif, min 1) ; Lhiannan : −1 dé par semaine,
 * sans descendre sous la Vigueur ; Gargouilles « seule au monde » : ÷ 2.
 */
export const applyClanWeakness = (c, dice) => {
    const w = clanWeaknessState(c);
    const n = c.weaknessCounter ?? 0;
    if (!w || dice <= 0) return { dice, label: null };
    let next = dice;
    if (w.kind === 'halvePerCount' && n > 0) next = Math.max(1, Math.floor(dice / 2 ** n));
    if (w.kind === 'minusPerCount' && n > 0) next = Math.max(Math.min(dice, c.stamina ?? 0), dice - n);
    if (w.kind === 'halve' && hasState(c, 'weakness')) next = Math.max(1, Math.floor(dice / 2));
    return next === dice ? { dice, label: null } : { dice: next, label: `Faiblesse (${w.label})` };
};

// ── Combat (§10) ─────────────────────────────────────────────────────────────

export const equippedArmor = (c) => (c.equipment ?? []).find(e => e.kind === 'armor' && e.equipped) ?? null;
export const equippedShield = (c) => (c.equipment ?? []).find(e => e.kind === 'shield' && e.equipped) ?? null;

/** Valeur d'initiative (§10.1) : Dextérité + Astuce + Célérité */
export const initiativeValue = (c) => (c.dexterity ?? 0) + (c.wits ?? 0) + disciplineRating(c, 'celerity');

/** Base du jet d'initiative : valeur − malus de blessure − pénalité d'armure (on y ajoute 1d10) */
export const initiativeBase = (c) => initiativeValue(c) + woundPenalty(c).penalty - (equippedArmor(c)?.penalty ?? 0);

/** Lit « For + 2 L » / « 3 L » (texte d'une arme libre) → { strength, bonus, type } */
export const parseDamage = (text) => {
    const m = String(text ?? '').match(/^\s*(For\s*\+\s*)?(\d+)\s*([CLA])/i);
    if (!m) return null;
    return { strength: !!m[1], bonus: Number(m[2]), type: { C: 'bashing', L: 'lethal', A: 'aggravated' }[m[3].toUpperCase()] };
};

/** Dégâts lisibles : « For + 2 L » ou « 3 C » */
export const damageText = (d) => (d ? `${d.strength ? 'For + ' : ''}${d.bonus} ${DAMAGE_TYPE_SHORT[d.type]}` : '');

const WEAPON_BY_KEY = Object.fromEntries(WEAPONS.map(w => [w.key, w]));

/** Arme de la fiche (ligne d'équipement) → arme exploitable par les jets (catalogue en repli) */
export const toWeapon = (e) => {
    const cat = WEAPON_BY_KEY[e.itemKey];
    return {
        name: e.name || cat?.label || 'Arme',
        ability: cat?.ability ?? (e.rangeM ? 'archery' : 'melee'),
        damage: parseDamage(e.damage) ?? cat?.damage ?? null,
        diffMod: (e.difficulty ?? 6) - 6,
        minStrength: cat?.minStrength ?? 0,
        range: e.rangeM ?? cat?.range ?? null,
        notes: e.notes || cat?.notes || '',
    };
};

/** Objet du catalogue (arme, armure, bouclier) → ligne d'équipement ; une seule armure et un seul bouclier portés */
export const toEquipmentRow = (i, equipment) => {
    if (i.kind === 'weapon') return { kind: 'weapon', itemKey: i.key, name: i.label, damage: damageText(i.damage), difficulty: 6 + (i.diffMod ?? 0), rangeM: i.range ?? null, equipped: true, notes: i.notes ?? '' };
    if (i.kind === 'armor') return { kind: 'armor', itemKey: i.key, name: i.label, rating: i.rating, penalty: i.penalty, equipped: !equipment.some(x => x.kind === 'armor' && x.equipped) };
    return { kind: 'shield', itemKey: i.key, name: i.label, difficulty: i.parryDifficulty, penalty: i.attackerPenalty, equipped: !equipment.some(x => x.kind === 'shield' && x.equipped), notes: i.notes ?? '' };
};

/** Réglages de la fenêtre de jet pour attaquer avec une arme (§10.2) */
export const attackSetup = (c, weapon) => {
    const missing = Math.max(0, (weapon.minStrength ?? 0) - (c.strength ?? 0));
    return {
        label: `Attaque — ${weapon.name ?? weapon.label}`, attrKey: 'dexterity', abilityKey: weapon.ability ?? 'melee',
        difficulty: 6 + (weapon.diffMod ?? weapon.difficultyMod ?? 0) + missing,
        diffNote: missing ? `+${missing} diff : Force minimale ${weapon.minStrength}` : null,
    };
};

/** Réglages pour les dégâts d'une arme (§10.4) : For + bonus (ou valeur fixe), diff 6 */
export const damageSetup = (weapon) => {
    const d = weapon.damage ?? {};
    return {
        label: `Dégâts ${({ bashing: 'contondants', lethal: 'létaux', aggravated: 'aggravés' })[d.type] ?? ''} — ${weapon.name ?? weapon.label}`,
        attrKey: d.strength ? 'strength' : null, diceMod: d.bonus ?? 0, diceModLabel: weapon.name ?? weapon.label,
        difficulty: 6, reflex: true, note: 'Ajouter les succès nets de l’attaque (modificateur de dés) ; chaque succès = 1 niveau de santé.',
    };
};

/** Défenses (§10.3) : Blocage, Esquive, Parade (diff du bouclier ou de l'arme de parade) */
export const defenseSetup = (c, kind) => {
    const shield = equippedShield(c);
    if (kind === 'block') return { label: 'Blocage', attrKey: 'dexterity', abilityKey: 'brawl', note: 'Contondant seulement, sauf Force d’âme ou armure adaptée.' };
    if (kind === 'dodge') return { label: 'Esquive', attrKey: 'dexterity', abilityKey: 'athletics', note: '+2 diff contre les flèches (sauf Célérité active).' };
    return { label: 'Parade', attrKey: 'dexterity', abilityKey: 'melee', difficulty: shield?.difficulty ?? 6,
        note: 'Contre une attaque à mains nues, l’excédent de succès devient une attaque contre l’agresseur.' };
};

/**
 * Absorption (§10.4, jet réflexe, diff 6) selon le type : contondant et létal = Vigueur
 * (+ Force d'âme, ajoutée par le bonus permanent) + armure ; aggravé = Force d'âme + armure ;
 * feu et soleil = Force d'âme seule (l'armure ne compte pas).
 */
export const soakSetup = (c, type) => {
    const armor = equippedArmor(c)?.rating ?? 0;
    const base = { reflex: true, difficulty: 6, noArmorPenalty: true };
    if (type === 'bashing' || type === 'lethal') {
        return { ...base, label: `Absorption (${type === 'bashing' ? 'contondant' : 'létal'})`, attrKey: 'stamina', diceMod: armor, diceModLabel: armor ? 'Armure' : '' };
    }
    const extras = disciplineRating(c, 'fortitude') ? [{ kind: 'discipline', key: 'fortitude' }] : [];
    if (type === 'aggravated') return { ...base, label: 'Absorption (aggravé)', extras, diceMod: armor, diceModLabel: armor ? 'Armure' : '' };
    return { ...base, label: 'Absorption (feu, soleil)', extras, note: 'Le feu et le soleil ignorent l’armure.' };
};

// ── Expérience (§6) ──────────────────────────────────────────────────────────

// Caïtifs : aucune Discipline de clan, toutes coûtent le tarif hors clan (MJ, 2026-11-02, P-5)
const isClanDiscipline = (c, key) => clanDisciplines(c.clanKey, c.casteKey, c.originClanKey).includes(key);

/**
 * Coût en XP d'un achat (§6.1, modulations §6.2). purchase :
 *   { kind: 'attribute'|'ability'|'discipline'|'virtue'|'road'|'willpower'|'background'|'path'|'newPath'|'ritual',
 *     key, current, level, mentorRoad, momentOfTruth, abyss }
 */
export const xpCost = (c, p) => {
    const cur = p.current ?? 0;
    switch (p.kind) {
    case 'attribute':  return cur * 4;
    case 'ability':    return cur === 0 ? 3 : cur * 2;
    case 'discipline': return cur === 0 ? 10 : cur * (isClanDiscipline(c, p.key) ? 5 : 7);
    case 'virtue':     return cur * 2 * (c.clanKey === 'true_brujah' && p.key === 'virtueMoral' ? 2 : 1);
    case 'willpower':  return cur;
    case 'background': return cur === 0 ? 10 : cur * 2;   // nouvel Historique : 10, comme une nouvelle Discipline (MJ, P-6)
    case 'path':       return cur * 4;
    case 'newPath':    return 7;
    case 'ritual':     return (p.level ?? 1) * (p.abyss ? 3 : 2);
    case 'road': {
        let cost = cur * 2 * (c.clanKey === 'true_brujah' ? 2 : 1);
        // Mentor : −1 par point d'écart, sans descendre sous la moitié ; Moment de vérité : ÷ 2, min 1
        if (p.mentorRoad > cur) cost = Math.max(Math.ceil(cost / 2), cost - (p.mentorRoad - cur));
        if (p.momentOfTruth) cost = Math.max(1, Math.floor(cost / 2));
        return cost;
    }
    default: return 0;
    }
};

const upsertRow = (list, keyField, key, patch, fresh) => {
    const found = (list ?? []).some(e => e[keyField] === key);
    return found ? list.map(e => (e[keyField] === key ? { ...e, ...patch } : e)) : [...(list ?? []), { [keyField]: key, ...fresh, ...patch }];
};

/**
 * Applique un achat d'XP (C-9) : le trait monte de 1, le coût s'ajoute au dépensé.
 * Une Discipline à voies (Thaumaturgie, Nécromancie) fait aussi monter sa voie principale (§14.1).
 * @returns {object} patch du personnage
 */
export const purchasePatch = (c, p) => {
    const patch = { xpSpent: (c.xpSpent ?? 0) + xpCost(c, p) };
    const next = (p.current ?? 0) + 1;
    switch (p.kind) {
    case 'attribute':
    case 'virtue':     return { ...patch, [p.key]: next };
    case 'road':       return { ...patch, roadRating: next };
    case 'willpower':  return { ...patch, willpowerPermanent: next, willpowerCurrent: (c.willpowerCurrent ?? 0) + 1 };
    case 'ability':    return { ...patch, abilities: upsertRow(c.abilities, 'abilityKey', p.key, { rating: next }, { specialties: [], domains: [] }) };
    case 'background': return { ...patch, backgrounds: upsertRow(c.backgrounds, 'backgroundKey', p.key, { rating: next }, { details: '' }) };
    case 'discipline': {
        const out = { ...patch, disciplines: upsertRow(c.disciplines, 'disciplineKey', p.key, { rating: next }, { powers: [] }) };
        const primary = (c.bloodPaths ?? []).find(b => b.disciplineKey === p.key && b.isPrimary);
        if (DISCIPLINES[p.key]?.bloodMagic === 'paths' && primary && primary.rating < next) {
            out.bloodPaths = c.bloodPaths.map(b => (b === primary ? { ...b, rating: next } : b));
        }
        return out;
    }
    case 'path':       return { ...patch, bloodPaths: (c.bloodPaths ?? []).map(b => (b.disciplineKey === p.discipline && b.pathKey === p.key ? { ...b, rating: next } : b)) };
    case 'newPath':    return { ...patch, bloodPaths: [...(c.bloodPaths ?? []), { disciplineKey: p.discipline, pathKey: p.key, rating: 1, isPrimary: false }] };
    case 'ritual':     return { ...patch, rituals: [...(c.rituals ?? []), { disciplineKey: p.discipline, ritualKey: p.key, level: p.level }] };
    default:           return patch;
    }
};

/** XP disponible (peut être négative : la dépense ne bloque pas, §6.3) */
export const xpAvailable = (c) => (c.xpTotal ?? 0) - (c.xpSpent ?? 0);

// ── Jets de pouvoirs (§13, §14, II.11) ───────────────────────────────────────

/** Coût proposé à la dépense : coché d'office seulement s'il est simple (« 1 S », « 1 V ») */
export const costOffer = (costText, cost = {}) => ({
    blood: cost.blood ?? 0, willpower: cost.willpower ?? 0, text: costText ?? null,
    spendByDefault: isSimpleCost(costText) && ((cost.blood ?? 0) + (cost.willpower ?? 0) > 0),
});

/**
 * Réglages initiaux de la fenêtre de jet pour un pouvoir. src :
 *   { label, roll (jet structuré ou null), rollText, costText, cost }   pouvoir du catalogue
 *   + generic : { traits, difficulty, rawAttributes }                  jet générique (voie, kraina, rituel)
 * Le premier Attribut et la première Capacité vont dans les sélecteurs, les autres traits en « extras ».
 */
export const powerRollSetup = (src) => {
    const roll = src.roll ?? src.generic ?? null;
    const setup = {
        label: src.label, discipline: true, cost: costOffer(src.costText, src.cost),
        attrKey: null, abilityKey: null, extras: [], difficulty: 6, diffNote: null, askDifficulty: false,
        note: roll ? null : (src.rollText ?? null), rawAttributes: !!roll?.rawAttributes,
    };
    if (!roll) return setup;
    for (const t of roll.traits ?? []) {
        if (t.kind === 'attribute' && !setup.attrKey) setup.attrKey = t.key;
        else if (t.kind === 'ability' && !setup.abilityKey) setup.abilityKey = t.key;
        else setup.extras.push(t);
    }
    // Choix (« Empathie ou Médecine ») : la première option est pré-sélectionnée, les autres rappelées
    for (const options of roll.choices ?? []) {
        const [first] = options;
        if (first.kind === 'ability' && !setup.abilityKey) setup.abilityKey = first.key;
        else if (first.kind === 'attribute' && !setup.attrKey) setup.attrKey = first.key;
        else setup.extras.push(first);
        setup.note = [setup.note, `Au choix : ${options.map(o => ABILITY_LABELS[o.key] ?? ATTRIBUTE_LABELS[o.key] ?? o.key).join(' ou ')}`].filter(Boolean).join(' · ');
    }
    setup.difficulty = roll.difficulty ?? 6;
    setup.askDifficulty = roll.difficulty == null;
    setup.diffNote = roll.diffNote ?? (setup.askDifficulty ? 'à fixer par le Conteur' : null);
    return setup;
};

/** Jet générique d'un pouvoir de voie de Thaumaturgie (et sorcelleries) : 1 S + Volonté, diff niveau + 3 */
export const thaumaturgyPathRoll = (level) => ({ traits: [{ kind: 'willpower', key: 'willpower' }], difficulty: Math.min(10, level + 3) });

/** Jet générique d'un rituel (Thaumaturgie, Nécromancie) : Int + Occultisme, diff niveau + 3 (max 9) */
export const ritualRoll = (level) => ({ traits: [{ kind: 'attribute', key: 'intelligence' }, { kind: 'ability', key: 'occult' }], difficulty: Math.min(9, level + 3) });

/** Jet de kraina (Koldunisme, Ogham) : Attribut brut + Occultisme, diff niveau + 4, −2 pour la kraina principale */
export const krainaRoll = (level, attributeText, isPrimary) => {
    const attr = parseTrait(String(attributeText ?? '').split(/[\s(/,]/)[0]);
    return {
        traits: [...(attr?.kind === 'attribute' ? [attr] : []), { kind: 'ability', key: 'occult' }],
        difficulty: clampDifficulty(level + 4 - (isPrimary ? 2 : 0)), rawAttributes: true,
    };
};

// ── Sang, Volonté, soif (§7, §8, §7.4) ───────────────────────────────────────

export const bloodMaxFor = (c) => generationStats(c.generation ?? 12).bloodMax ?? 10;

/** Libellé d'un coût : texte du catalogue, sinon « 1 S + 1 V » */
export const costLabel = (costText, cost) => costText ?? [cost?.blood && `${cost.blood} S`, cost?.willpower && `${cost.willpower} V`].filter(Boolean).join(' + ');

/** Dépense d'un coût (pouvoir, Volonté d'un jet) : sang et Volonté temporaire, sans passer sous 0 */
export const spendCost = (c, { blood = 0, willpower = 0 } = {}) => ({
    bloodCurrent: Math.max(0, (c.bloodCurrent ?? 0) - blood),
    willpowerCurrent: Math.max(0, (c.willpowerCurrent ?? 0) - willpower),
});

/** Réveil : −1 sang, +1 Volonté (sans dépasser la permanente) */
export const wakeUp = (c) => ({
    bloodCurrent: Math.max(0, (c.bloodCurrent ?? 0) - 1),
    willpowerCurrent: Math.min(c.willpowerPermanent ?? 0, (c.willpowerCurrent ?? 0) + 1),
});

/** Soin par le sang (§7.2) : 1 sang soigne 1 niveau létal (sinon contondant) ; null si rien à soigner */
export const healWithBlood = (c) => {
    if ((c.bloodCurrent ?? 0) < 1) return null;
    if ((c.damageLethal ?? 0) > 0) return { bloodCurrent: c.bloodCurrent - 1, damageLethal: c.damageLethal - 1 };
    if ((c.damageBashing ?? 0) > 0) return { bloodCurrent: c.bloodCurrent - 1, damageBashing: c.damageBashing - 1 };
    return null;
};

/** Soin d'un niveau aggravé : 5 sang (et une journée de repos, à la table) ; null si impossible */
export const healAggravated = (c) => ((c.bloodCurrent ?? 0) >= 5 && (c.damageAggravated ?? 0) > 0
    ? { bloodCurrent: c.bloodCurrent - 5, damageAggravated: c.damageAggravated - 1 } : null);

/** Fin d'histoire : Volonté remise à la permanente */
export const endOfStory = (c) => ({ willpowerCurrent: c.willpowerPermanent ?? 0 });

/** Effet de soif : intensité 0 (rassasié) à 1 (vide), faim sous 7 − Maîtrise/Instinct */
export const thirst = (c) => {
    const max = bloodMaxFor(c);
    const blood = c.bloodCurrent ?? 0;
    return { intensity: max ? Math.max(0, Math.min(1, 1 - blood / max)) : 0, hungry: blood < 7 - (c.virtueControl ?? 0) };
};

/** Clic sur une case d'une réserve : remplir jusqu'à elle ou vider à partir d'elle */
export const pickBox = (current, index1) => (index1 > current ? index1 : index1 - 1);

// ── Taches qui suivent les blessures ─────────────────────────────────────────

// Générateur pseudo-aléatoire déterministe (mulberry32) : mêmes places à chaque affichage
const seeded = (seed) => () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Nombre de taches : une par clic sur une case (contondant 1, létal 2, aggravé 3) */
export const stainCount = (c) => {
    const weight = { bashing: 1, lethal: 2, aggravated: 3 };
    return healthMarks(c).reduce((s, m) => s + (weight[m] ?? 0), 0);
};

/** Places fixes des taches d'un personnage (les premières restent en place quand on en ajoute) */
export const stainSpots = (characterId, count) => {
    const rand = seeded(Number(characterId) || 1);
    const kinds = [[1, 1], [3, 0.85], [4, 0.75], [5, 0.9], [6, 0.8]];
    return Array.from({ length: count }, (_, i) => {
        const [kind, k] = kinds[i % kinds.length];
        return { kind, x: 4 + rand() * 86, y: 6 + rand() * 84, size: Math.round((50 + rand() * 34) * k), rot: Math.floor(rand() * 360) };
    });
};

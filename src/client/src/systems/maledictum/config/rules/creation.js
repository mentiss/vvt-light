// src/client/src/systems/maledictum/config/rules/creation.js
// ─────────────────────────────────────────────────────────────────────────────
// Assistant de création (livre de base ch. III, Inquisition Player's Guide ch. III ;
// spec_maledictum.md §11.3). Fonctions pures, testées : état de l'assistant,
// tirages et leur XP, cumul des bonus (origine, faction ou Fonction, rôle),
// « À faire » par onglet, fiche envoyée au serveur.
//
//   Réglages du setup (config/setup.js, spec §13.1) : base des caractéristiques,
//   achat de points, livres disponibles, tirages au hasard, XP de création.
//   Livre : 2d10 + 20 dans l'ordre (+50 XP), réarrangées (+25 XP), relancées (0 XP) ;
//     ou 90 points sur une base de 20 (4 à 18 chacune).
//   Origine tirée : +25 XP ; faction tirée : +75 XP (table du PG p.46, Ordos compris ;
//     sans le PG, table du livre p.55 selon l'origine, Inquisition à la place des Ordos) ;
//   rôle laissé au Patron : +50 XP (PG p.55, décision D-1). Réglage { fixed: n } : n XP pour tous.
//   La Fonction (Duty) remplace les Avantages de la faction (D-2).
//   Création : 2 Avances au plus par compétence, 1 par spécialisation ; les
//   prérequis des talents sont ignorés (livre p.48).
// ─────────────────────────────────────────────────────────────────────────────

import { ORIGINS, INQUISITION_ORIGINS } from '../origins.js';
import { FACTIONS, FACTION_TABLE, INQUISITION_FACTION_TABLE } from '../factions.js';
import { ROLES } from '../roles.js';
import { POWERS } from '../powers.js';
import { CHAR_KEYS } from './character.js';
import { CREATION_SKILL_MAX, CREATION_SPEC_MAX } from './xp.js';
import { itemsFromLabels } from './items.js';
import { SETUP, available, hasBook } from '../setup.js';

export const ALL_ORIGINS = [...ORIGINS, ...INQUISITION_ORIGINS];
export const ORIGIN_BY_KEY = Object.fromEntries(ALL_ORIGINS.map(o => [o.key, o]));
export const FACTION_BY_KEY = Object.fromEntries(FACTIONS.map(f => [f.key, f]));
export const ROLE_BY_KEY = Object.fromEntries(ROLES.map(r => [r.key, r]));

export const XP_RANDOM = { charsInOrder: 50, charsRearranged: 25, origin: 25, faction: 75, role: 50 };
/** Caractéristiques du setup : base (tirage et achat), achat de points */
export const charRules = (setup = SETUP) => ({ base: setup.chars.base, ...setup.chars.points });
export const FATE_START = 3;

export const INITIAL_CREATION = {
    charMethod: 'roll',        // 'roll' | 'points'
    rolled: null,              // 9 valeurs dans l'ordre (2d10 + 20)
    order: null,               // réarrangement : order[i] = indice du tirage pour CHAR_KEYS[i] ; null = dans l'ordre
    rerolled: false,           // relancé : plus d'XP de tirage
    points: Object.fromEntries(CHAR_KEYS.map(k => [k, 10])),
    originSet: 'core',         // 'core' | 'inquisition'
    originKey: null, originChoice: null, originSkill: null, originRandom: false,
    factionKey: null, factionRandom: false,
    useDuty: true, dutyKey: null,
    benefitChoice: null, benefitAdvances: {}, benefitTalent: null, benefitEquipment: {},
    roleKey: null, roleRandom: false,
    roleTalents: [], roleSkills: {}, roleSpecs: [], roleEquipment: {},
    powers: [],                // pouvoirs choisis si Psyker (un mineur, un de discipline)
    prenom: '', nom: '', playerName: '', age: '', taille: '', sexe: '',
    handedness: 'right', appearance: '', goalShort: '', goalLong: '', connections: '', divination: '', notes: '',
};

const sum = (o) => Object.values(o ?? {}).reduce((s, v) => s + (Number(v) || 0), 0);
const addTo = (acc, key, n) => { acc[key] = (acc[key] ?? 0) + n; return acc; };

// ── Tables d100 ──────────────────────────────────────────────────────────────

/** Entrée d'une table [clé, min, max] pour une valeur de d100 */
export const pickRange = (rows, value) => rows.find(([, min, max]) => value >= min && value <= max)?.[0] ?? null;

export const originForRoll = (set, value) => {
    const list = set === 'inquisition' ? INQUISITION_ORIGINS : ORIGINS;
    return list.find(o => value >= o.roll[0] && value <= o.roll[1])?.key ?? null;
};

const ORDOS = ['ordo_hereticus', 'ordo_malleus', 'ordo_xenos'];

/**
 * Faction tirée : avec le Player's Guide, sa table (p.46, Ordos compris) ; sans lui, la table du
 * livre de base (p.55, colonne de l'origine), où les Ordos redeviennent l'Inquisition.
 */
export const factionForRoll = (value, originKey = null, setup = SETUP) => {
    if (hasBook('ipg', setup)) return pickRange(INQUISITION_FACTION_TABLE, value);
    const rows = FACTION_TABLE[originKey];
    if (!rows) return null;
    return pickRange(rows.map(([key, min, max]) => [ORDOS.includes(key) ? 'inquisition' : key, min, max]), value);
};

/** Le tirage de faction demande-t-il d'abord une origine du livre de base ? */
export const factionRollNeedsOrigin = (setup = SETUP) => !hasBook('ipg', setup);

// ── Caractéristiques ─────────────────────────────────────────────────────────

export const pointsSpent = (points) => sum(points);

/** Caractéristiques de départ avant les bonus (tirage ou points) */
export const startingChars = (ws, setup = SETUP) => {
    if (ws.charMethod === 'points') return Object.fromEntries(CHAR_KEYS.map(k => [k, setup.chars.base + (Number(ws.points?.[k]) || 0)]));
    if (!ws.rolled) return null;
    return Object.fromEntries(CHAR_KEYS.map((k, i) => [k, ws.rolled[ws.order ? ws.order[i] : i]]));
};

/** Bonus de caractéristiques de l'origine et de la faction (ou Fonction) */
export const charBonuses = (ws) => {
    const out = {};
    const origin = ORIGIN_BY_KEY[ws.originKey];
    if (origin) {
        for (const [k, v] of Object.entries(origin.fixed ?? {})) addTo(out, k, v);
        if (ws.originChoice && origin.choice?.includes(ws.originChoice)) addTo(out, ws.originChoice, 5);
    }
    const faction = FACTION_BY_KEY[ws.factionKey];
    const duty = ws.useDuty ? faction?.duties?.find(d => d.key === ws.dutyKey) : null;
    if (duty) for (const [k, v] of Object.entries(duty.chars ?? {})) addTo(out, k, v);
    else if (faction && !ws.useDuty) {
        for (const [k, v] of Object.entries(faction.benefits?.fixed ?? {})) addTo(out, k, v);
        if (ws.benefitChoice && faction.benefits?.choice?.includes(ws.benefitChoice)) addTo(out, ws.benefitChoice, 5);
    }
    return out;
};

export const finalChars = (ws) => {
    const start = startingChars(ws);
    if (!start) return null;
    const bonus = charBonuses(ws);
    return Object.fromEntries(CHAR_KEYS.map(k => [k, start[k] + (bonus[k] ?? 0)]));
};

// ── Compétences, spécialisations, talents ────────────────────────────────────

/** Avances « compétence » ou « compétence.spécialisation » venues de la faction (Fonction ou Avantages) */
export const factionAdvances = (ws) => {
    const faction = FACTION_BY_KEY[ws.factionKey];
    if (!faction) return {};
    if (ws.useDuty) return { ...(faction.duties?.find(d => d.key === ws.dutyKey)?.advances ?? {}) };
    return { ...(ws.benefitAdvances ?? {}) };
};

/** Avances de compétence et de spécialisation cumulées (origine, faction, rôle) */
export const creationAdvances = (ws) => {
    const skills = {};
    const specs = {};
    const put = (key, n) => {
        if (key.includes('.')) addTo(specs, key, n);
        else addTo(skills, key, n);
    };
    const origin = ORIGIN_BY_KEY[ws.originKey];
    if (origin?.choiceSkills?.length && ws.originSkill) put(ws.originSkill, 1);
    for (const [k, v] of Object.entries(origin?.specs ?? {})) put(k, v);
    for (const [k, v] of Object.entries(factionAdvances(ws))) put(k, v);
    for (const [k, v] of Object.entries(ws.roleSkills ?? {})) put(k, v);
    for (const k of ws.roleSpecs ?? []) put(k, 1);
    return { skills, specs };
};

/** Talents obtenus (origine, faction ou Fonction, rôle), sans doublon */
export const creationTalents = (ws) => {
    const keys = [];
    const origin = ORIGIN_BY_KEY[ws.originKey];
    keys.push(...(origin?.talents ?? []));
    const faction = FACTION_BY_KEY[ws.factionKey];
    if (faction) {
        if (ws.useDuty) keys.push(...(faction.duties?.find(d => d.key === ws.dutyKey)?.talents ?? []));
        else {
            keys.push(...(faction.benefits?.talents ?? []));
            if (ws.benefitTalent) keys.push(ws.benefitTalent);
        }
    }
    keys.push(...(ws.roleTalents ?? []));
    const role = ROLE_BY_KEY[ws.roleKey];
    if (role?.key === 'mystic' && !keys.includes('psyker')) keys.push('psyker');   // le Mystique gagne Psyker (p.76)
    return [...new Set(keys)];
};

export const isPsyker = (ws) => creationTalents(ws).includes('psyker');

/** Pouvoirs : Châtiment (connu de tous les psykers), un mineur, un d'une discipline */
export const powerChoices = (setup = SETUP) => ({
    minor: available(POWERS, setup).filter(p => p.discipline === 'minor' && p.key !== 'smite'),
    discipline: available(POWERS, setup).filter(p => p.discipline !== 'minor'),
});

// ── Équipement et Solars ─────────────────────────────────────────────────────

/** Libellés d'équipement obtenus (fixe + choix faits) */
export const equipmentLabels = (ws) => {
    const out = [];
    const origin = ORIGIN_BY_KEY[ws.originKey];
    out.push(...(origin?.equipment ?? []));
    const faction = FACTION_BY_KEY[ws.factionKey];
    if (faction) {
        if (ws.useDuty) {
            const duty = faction.duties?.find(d => d.key === ws.dutyKey);
            out.push(...(duty?.equipment ?? []));
        } else {
            out.push(...(faction.benefits?.equipment ?? []));
            out.push(...Object.values(ws.benefitEquipment ?? {}).flat().filter(Boolean));
        }
    }
    const role = ROLE_BY_KEY[ws.roleKey];
    if (role) {
        out.push(...(role.equipment ?? []));
        out.push(...Object.values(ws.roleEquipment ?? {}).flat().filter(Boolean));
    }
    return out;
};

/** Solars de départ (Fonction ou Avantages) ; « 5d10 » se tire à la création (moyenne si non tiré) */
export const startingSolars = (ws, rolledSolars = null) => {
    const faction = FACTION_BY_KEY[ws.factionKey];
    if (!faction) return 0;
    const value = ws.useDuty ? faction.duties?.find(d => d.key === ws.dutyKey)?.solars : faction.benefits?.solars;
    if (typeof value === 'number') return value;
    const m = /^(\d+)d(\d+)$/.exec(String(value ?? ''));
    if (m) return rolledSolars ?? Math.round(Number(m[1]) * (Number(m[2]) + 1) / 2);
    return 0;
};

/** Influence de départ (faction ; Tabula Rasa : aucune) */
export const startingInfluence = (ws) => {
    const origin = ORIGIN_BY_KEY[ws.originKey];
    if (origin?.noInfluence) return {};
    const faction = FACTION_BY_KEY[ws.factionKey];
    if (!faction) return {};
    const src = ws.useDuty ? faction.duties?.find(d => d.key === ws.dutyKey)?.influence : faction.benefits?.influence;
    return { ...(src ?? {}) };
};

// ── XP de création ───────────────────────────────────────────────────────────

export const creationXp = (ws, setup = SETUP) => {
    const rule = setup.creation.xp;
    if (rule && typeof rule === 'object' && Number.isFinite(rule.fixed)) return rule.fixed;   // XP fixe du MJ
    let xp = 0;
    if (ws.charMethod === 'roll' && ws.rolled && !ws.rerolled) xp += ws.order ? XP_RANDOM.charsRearranged : XP_RANDOM.charsInOrder;
    if (ws.originRandom) xp += XP_RANDOM.origin;
    if (ws.factionRandom) xp += XP_RANDOM.faction;
    if (ws.roleRandom) xp += XP_RANDOM.role;
    return xp;
};

// ── À faire, par onglet ──────────────────────────────────────────────────────

export const creationTodo = (ws, setup = SETUP) => {
    const todo = { chars: [], origin: [], faction: [], role: [], equipment: [], identity: [] };
    const { total, min, max } = setup.chars.points;
    if (ws.charMethod === 'roll' && !ws.rolled) todo.chars.push('lancer les dés');
    if (ws.charMethod === 'points') {
        const spent = pointsSpent(ws.points);
        if (spent !== total) todo.chars.push(`répartir ${total} points (${spent} placés)`);
        if (CHAR_KEYS.some(k => ws.points[k] < min || ws.points[k] > max)) todo.chars.push(`entre ${min} et ${max} par caractéristique`);
    }

    const origin = ORIGIN_BY_KEY[ws.originKey];
    if (!origin) todo.origin.push('choisir une origine');
    else {
        if (origin.choice?.length && !ws.originChoice) todo.origin.push('choisir la caractéristique à +5');
        if (origin.choiceSkills?.length && !ws.originSkill) todo.origin.push('choisir la compétence');
    }

    const faction = FACTION_BY_KEY[ws.factionKey];
    if (!faction) todo.faction.push('choisir une faction');
    else if (ws.useDuty) {
        if (!faction.duties?.some(d => d.key === ws.dutyKey)) todo.faction.push('choisir une Fonction');
    } else {
        const b = faction.benefits ?? {};
        if (b.choice?.length && !ws.benefitChoice) todo.faction.push('choisir la caractéristique à +5');
        const spent = sum(ws.benefitAdvances);
        if (spent !== (b.advances ?? 5)) todo.faction.push(`répartir ${b.advances ?? 5} Avances (${spent} placées)`);
        if (b.talentChoice?.length && !ws.benefitTalent) todo.faction.push('choisir le talent');
        (b.equipmentChoices ?? []).forEach((opts, i) => { if (Array.isArray(opts) && !ws.benefitEquipment?.[i]) todo.faction.push('choisir un objet'); });
    }

    const role = ROLE_BY_KEY[ws.roleKey];
    if (!role) { todo.role.push('choisir un rôle'); todo.equipment.push('choisir d\'abord un rôle'); }
    else {
        if ((ws.roleTalents ?? []).length !== role.talents.pick) todo.role.push(`choisir ${role.talents.pick} talents`);
        const skills = sum(ws.roleSkills);
        if (skills !== role.skillAdvances.pick) todo.role.push(`répartir ${role.skillAdvances.pick} Avances de compétence (${skills})`);
        if ((ws.roleSpecs ?? []).length !== role.specAdvances.pick) todo.role.push(`choisir ${role.specAdvances.pick} spécialisations`);
        (role.equipmentChoices ?? []).forEach((opts, i) => {
            const want = Array.isArray(opts) ? 1 : opts.pick;
            const got = [].concat(ws.roleEquipment?.[i] ?? []).filter(Boolean).length;
            if (got !== want) todo.equipment.push(want > 1 ? `choisir ${want} objets du rôle` : 'choisir un objet du rôle');
        });
    }
    // Plafonds de création
    const { skills, specs } = creationAdvances(ws);
    if (Object.values(skills).some(n => n > CREATION_SKILL_MAX)) todo.role.push(`${CREATION_SKILL_MAX} Avances au plus par compétence`);
    if (Object.entries(specs).some(([k, n]) => n > CREATION_SPEC_MAX && !(factionAdvances(ws)[k] > CREATION_SPEC_MAX))) todo.role.push(`${CREATION_SPEC_MAX} Avance au plus par spécialisation`);
    if (isPsyker(ws) && (ws.powers ?? []).length < 2) todo.role.push('choisir un pouvoir mineur et un pouvoir de discipline');

    if (!ws.prenom?.trim()) todo.identity.push('prénom');
    if (!ws.playerName?.trim()) todo.identity.push('nom du joueur');
    return todo;
};

export const isCreationComplete = (ws) => Object.values(creationTodo(ws)).every(list => list.length === 0);

// ── Fiche envoyée au serveur ─────────────────────────────────────────────────

const specLabel = (skills, skillKey, specKey) => skills.find(s => s.key === skillKey)?.specs?.find(s => s.key === specKey)?.label ?? specKey;

/**
 * @param {object} ws       état de l'assistant
 * @param {object} skillsCatalog  SKILLS (libellés des spécialisations)
 * @param {number|null} rolledSolars
 */
export const buildCharacterPayload = (ws, skillsCatalog, rolledSolars = null) => {
    const { skills, specs } = creationAdvances(ws);
    const talents = creationTalents(ws);
    const origin = ORIGIN_BY_KEY[ws.originKey];
    return {
        playerName: ws.playerName.trim(),
        prenom: ws.prenom.trim(), nom: ws.nom.trim(),
        sexe: ws.sexe || null, age: Number(ws.age) || null, taille: Number(ws.taille) || null,
        originKey: ws.originKey, factionKey: ws.factionKey, dutyKey: ws.useDuty ? ws.dutyKey : null, roleKey: ws.roleKey,
        charsBase: finalChars(ws), charsAdv: {},
        skills,
        specs: Object.entries(specs).map(([key, adv]) => {
            const [skill, spec] = key.split('.');
            return { skill, key: spec, label: specLabel(skillsCatalog, skill, spec) + (origin?.specNote && origin.specs?.[key] ? ` (${origin.specNote})` : ''), adv };
        }),
        talents: talents.map(key => ({ key, count: 1 })),
        powers: isPsyker(ws) ? ['smite', ...(ws.powers ?? [])] : [],
        fate: FATE_START + (talents.includes('fated') ? 1 : 0),
        fateMax: FATE_START + (talents.includes('fated') ? 1 : 0),
        wounds: 0, corruption: 0, warpCharge: 0,
        influence: startingInfluence(ws),
        solars: startingSolars(ws, rolledSolars),
        xpTotal: creationXp(ws), xpSpent: 0,
        goals: { short: ws.goalShort.trim(), long: ws.goalLong.trim() },
        details: { handedness: ws.handedness, appearance: ws.appearance.trim(), connections: ws.connections.trim(), divination: ws.divination.trim() },
        notes: ws.notes.trim(),
        items: itemsFromLabels(equipmentLabels(ws)),
    };
};

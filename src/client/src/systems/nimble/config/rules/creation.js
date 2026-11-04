// src/client/src/systems/nimble/config/rules/creation.js
// ─────────────────────────────────────────────────────────────────────────────
// Assistant de création (Core Rules 3.3 p.19-21 ; spec_nimble.md §6.3) — pur.
// État de travail (ws), « À faire » par onglet, prérequis d'historique,
// caractéristiques par tableau, et corps de création (POST /characters).
// ─────────────────────────────────────────────────────────────────────────────

import { STATS, SKILLS, STAT_ARRAYS, STARTING_GOLD } from '../basics.js';
import { CLASSES, ANCESTRY_BY_KEY, BACKGROUND_BY_KEY } from '../catalog.js';
import { initialSaves } from './character.js';
import { startingItems } from './items.js';

export const INITIAL_CREATION = {
    classKey: null, ancestryKey: null, backgroundKey: null, saveChoice: null,
    arrayKey: null, assign: { str: null, dex: null, int: null, wil: null },   // index de la valeur du tableau
    heroicSkills: 0, skillPoints: {},
    equipmentMode: 'class', purchases: [],
    prenom: '', nom: '', playerName: '', avatar: null, taille: '', poids: '', age: '',
    motivation: '', languages: [], notes: '',
};

/** Valeurs de caractéristiques choisies : { str, dex, int, wil } (null si non affectée) */
export const statsOf = (ws) => {
    const values = STAT_ARRAYS.find(a => a.key === ws.arrayKey)?.values ?? [];
    return Object.fromEntries(STATS.map(s => [s.key, ws.assign?.[s.key] === null || ws.assign?.[s.key] === undefined ? null : values[ws.assign[s.key]] ?? null]));
};

/** Index de la valeur du tableau encore libres */
export const freeSlots = (ws) => {
    const values = STAT_ARRAYS.find(a => a.key === ws.arrayKey)?.values ?? [];
    const taken = Object.values(ws.assign ?? {}).filter(v => v !== null && v !== undefined);
    return values.map((_, i) => i).filter(i => !taken.includes(i));
};

/**
 * Affectation conseillée : les plus hautes valeurs dans les caractéristiques clés
 * de la classe (dans l'ordre de la classe), le reste dans l'ordre de la fiche.
 */
export const suggestedAssign = (classKey, arrayKey) => {
    const values = STAT_ARRAYS.find(a => a.key === arrayKey)?.values ?? [];
    const keys = CLASSES[classKey]?.keyStats ?? [];
    const order = [...keys, ...STATS.map(s => s.key).filter(k => !keys.includes(k))];
    const byValue = values.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v || a.i - b.i);
    return Object.fromEntries(order.map((k, n) => [k, byValue[n]?.i ?? null]));
};

/** Historique permis avec ces caractéristiques (prérequis « 0 ou moins à la création ») */
export const backgroundAllowed = (background, stats) => {
    const req = background?.req;
    if (!req?.stat) return true;
    const v = stats[req.stat];
    return v !== null && v !== undefined && v <= Number(req.max ?? 0);
};

/** Points de compétence libres : 0 sauf règle des compétences héroïques (1 à 4) */
export const skillPointsLeft = (ws) => Number(ws.heroicSkills ?? 0) - Object.values(ws.skillPoints ?? {}).reduce((s, v) => s + Number(v), 0);

/** Nombre de langues en plus du Commun : 1 par point d'INT */
export const extraLanguages = (ws) => Math.max(0, statsOf(ws).int ?? 0);

/** Langue d'ascendance si l'INT n'est pas négative */
export const ancestryLanguage = (ws) => {
    const lang = ANCESTRY_BY_KEY[ws.ancestryKey]?.language;
    return lang && (statsOf(ws).int ?? 0) >= 0 ? lang : null;
};

/** Ce qu'il reste à faire, par onglet */
export const creationTodo = (ws) => {
    const stats = statsOf(ws);
    const ancestry = ANCESTRY_BY_KEY[ws.ancestryKey];
    const background = BACKGROUND_BY_KEY[ws.backgroundKey];
    const todo = { class: [], ancestry: [], background: [], stats: [], equipment: [], identity: [] };
    if (!CLASSES[ws.classKey]) todo.class.push('choisir une classe');
    if (!ancestry) todo.ancestry.push('choisir une ascendance');
    if (ancestry?.effects?.saves === 'neutralToAdv' && !ws.saveChoice) todo.ancestry.push('choisir la sauvegarde avantagée');
    if (!background) todo.background.push('choisir un historique');
    else if (Object.values(stats).every(v => v !== null) && !backgroundAllowed(background, stats)) todo.background.push('prérequis de l\'historique non rempli');
    if (!ws.arrayKey) todo.stats.push('choisir un tableau');
    else if (Object.values(stats).some(v => v === null)) todo.stats.push('affecter les quatre valeurs');
    if (skillPointsLeft(ws) > 0) todo.stats.push(`placer ${skillPointsLeft(ws)} point(s) de compétence`);
    if (ws.equipmentMode === 'gold' && purchaseTotal(ws) > STARTING_GOLD) todo.equipment.push('dépense supérieure à 25 po');
    if (!ws.prenom?.trim()) todo.identity.push('prénom');
    if (!ws.playerName?.trim()) todo.identity.push('nom du joueur');
    if (ws.languages.length > extraLanguages(ws)) todo.identity.push('trop de langues');
    return todo;
};

export const isCreationComplete = (ws) => Object.values(creationTodo(ws)).every(list => list.length === 0);

/** Coût d'un achat en po (« 1 000 po », « 5 pa ») */
export const costInGold = (cost) => {
    const m = /([\d\s ]+(?:[.,]\d+)?)\s*(po|pa)/i.exec(String(cost ?? ''));
    if (!m) return 0;
    const n = Number(m[1].replace(/[\s ]/g, '').replace(',', '.'));
    return m[2].toLowerCase() === 'pa' ? n / 10 : n;
};
export const purchaseTotal = (ws) => (ws.purchases ?? []).reduce((s, p) => s + costInGold(p.cost) * (p.quantity ?? 1), 0);

/** Corps de création : personnage de niveau 1 complet */
export const buildCharacterPayload = (ws) => {
    const cls = CLASSES[ws.classKey];
    const stats = statsOf(ws);
    const gear = ws.equipmentMode === 'class' ? (cls?.startingGear ?? []) : (ws.purchases ?? []).map(p => ({ key: p.key, qty: p.quantity ?? 1 }));
    const gold = ws.equipmentMode === 'class' ? 0 : Math.floor(STARTING_GOLD - purchaseTotal(ws));
    const silver = ws.equipmentMode === 'class' ? 0 : Math.round((STARTING_GOLD - purchaseTotal(ws) - gold) * 10);
    const lang = ancestryLanguage(ws);
    const skillPoints = Object.fromEntries(SKILLS.map(s => [s.key, Number(ws.skillPoints?.[s.key] ?? 0)]).filter(([, v]) => v));
    return {
        playerName: ws.playerName.trim(), prenom: ws.prenom.trim(), nom: ws.nom.trim(), avatar: ws.avatar ?? null,
        taille: ws.taille === '' ? null : Number(ws.taille) || null, poids: ws.poids === '' ? null : Number(ws.poids) || null,
        age: ws.age === '' ? null : Number(ws.age) || null,
        classKey: ws.classKey, ancestryKey: ws.ancestryKey, backgroundKey: ws.backgroundKey, level: 1,
        statStr: stats.str ?? 0, statDex: stats.dex ?? 0, statInt: stats.int ?? 0, statWil: stats.wil ?? 0,
        saves: initialSaves(ws.classKey, ws.ancestryKey, ws.saveChoice),
        skillPoints,
        hpMax: cls?.startingHp ?? 10, hpCurrent: cls?.startingHp ?? 10,
        motivation: ws.motivation.trim(), notes: ws.notes ?? '',
        languages: [...new Set(['common', ...(lang ? [lang] : []), ...ws.languages])],
        gold, silver,
        items: startingItems(gear).map(it => ({ ...it, id: undefined })),   // création : pas d'id temporaire
    };
};

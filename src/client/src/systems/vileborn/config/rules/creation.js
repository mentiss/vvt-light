// src/client/src/systems/vileborn/config/rules/creation.js
// ─────────────────────────────────────────────────────────────────────────────
// Règles de création (spec_vileborn.md §3.2, déduites des 7 prétirés) — pur.
//   - approches : une des deux répartitions des prétirés, dés placés un par un ;
//   - 2 mots de Personnalité, 2 de Formation ;
//   - un sombre héritage (pulsion et 2 dons viennent avec), une origine ;
//   - une ressource, aspiration facultative, devoir prérempli ; prénom, nom et joueur.
// ws (état de l'assistant) :
//   { heritageKey, originKey, originName, originEffect, distribution (index),
//     dice: { <approchKey>: taille }, personality: ['', ''], training: ['', ''],
//     resourceName, resourceEffect, aspiration, duty, prenom, nom, motto, playerName, avatar }
// ─────────────────────────────────────────────────────────────────────────────

import { APPROACHES, DEFAULT_DUTY } from '../approaches.js';
import { HERITAGES } from '../heritages.js';
import { ORIGINS } from '../origins.js';

export const DISTRIBUTIONS = [
    [10, 8, 8, 6, 6, 6],
    [8, 8, 8, 8, 6, 6],
];
export const WORDS_AT_CREATION = 2;

export const INITIAL_CREATION = {
    heritageKey: null,
    originKey: null, originName: '', originEffect: '',
    distribution: null, dice: {},
    personality: ['', ''], training: ['', ''],
    resourceName: '', resourceEffect: '',
    aspiration: '', duty: DEFAULT_DUTY,
    prenom: '', nom: '', motto: '', playerName: '', avatar: null,
};

/** Dés de la répartition choisie qui ne sont pas encore placés */
export const remainingDice = (ws) => {
    const left = [...(DISTRIBUTIONS[ws.distribution] ?? [])];
    for (const size of Object.values(ws.dice ?? {})) {
        const i = left.indexOf(size);
        if (i >= 0) left.splice(i, 1);
    }
    return left;
};

/** Tailles proposables pour une approche : celles qui restent, plus la sienne */
export const diceChoices = (ws, approachKey) => {
    const own = ws.dice?.[approachKey];
    return [...new Set([...remainingDice(ws), ...(own ? [own] : [])])].sort((a, b) => b - a);
};

/** Place (ou retire, si c'est déjà la sienne) une taille de dé sur une approche */
export const assignDie = (ws, approachKey, size) => {
    const dice = { ...ws.dice };
    if (dice[approachKey] === size) delete dice[approachKey];
    else if (diceChoices(ws, approachKey).includes(size)) dice[approachKey] = size;
    return { ...ws, dice };
};

/** Changer de répartition remet les dés à placer */
export const chooseDistribution = (ws, index) => (ws.distribution === index ? ws : { ...ws, distribution: index, dice: {} });

/** Choisir une origine du catalogue (ou null pour la saisie libre) */
export const chooseOrigin = (ws, key) => {
    if (!key) return { ...ws, originKey: null };
    const o = ORIGINS[key];
    return { ...ws, originKey: key, originName: o.name, originEffect: o.effect };
};

const filled = (list) => list.filter(w => w?.trim()).length;

/**
 * Ce qui reste à faire, par onglet : { <onglet>: string[] }.
 * Un onglet sans entrée est terminé.
 */
export const creationTodo = (ws) => {
    const todo = { heritage: [], origin: [], approaches: [], words: [], resource: [], identity: [] };
    if (!ws.heritageKey) todo.heritage.push('choisir un sombre héritage');
    if (!ws.originName?.trim()) todo.origin.push('choisir une origine');
    if (ws.distribution === null || ws.distribution === undefined) todo.approaches.push('choisir une répartition');
    else {
        const left = remainingDice(ws);
        if (left.length) todo.approaches.push(`placer ${left.map(d => `d${d}`).join(', ')}`);
    }
    const p = filled(ws.personality ?? []);
    const t = filled(ws.training ?? []);
    if (p < WORDS_AT_CREATION) todo.words.push(`${WORDS_AT_CREATION - p} mot${WORDS_AT_CREATION - p > 1 ? 's' : ''} de personnalité`);
    if (t < WORDS_AT_CREATION) todo.words.push(`${WORDS_AT_CREATION - t} mot${WORDS_AT_CREATION - t > 1 ? 's' : ''} de formation`);
    if (!ws.resourceName?.trim()) todo.resource.push('choisir une ressource');
    if (!ws.prenom?.trim()) todo.identity.push('le prénom du Paria');
    if (!ws.nom?.trim()) todo.identity.push('le nom du Paria');
    if (!ws.playerName?.trim()) todo.identity.push('votre nom de joueur');
    return todo;
};

export const isCreationComplete = (ws) => Object.values(creationTodo(ws)).every(list => list.length === 0);

/** Corps du POST /characters */
export const buildCharacterPayload = (ws) => {
    const heritage = HERITAGES[ws.heritageKey];
    const words = (kind, list) => list.map(w => w.trim()).filter(Boolean)
        .map((label, position) => ({ kind, position, label }));
    const payload = {
        playerName: ws.playerName.trim(),
        prenom: ws.prenom.trim(),
        nom: ws.nom.trim(),
        motto: ws.motto.trim(),
        avatar: ws.avatar ?? null,
        originKey: ws.originKey ?? null,
        originName: ws.originName.trim(),
        originEffect: ws.originEffect.trim(),
        aspiration: ws.aspiration.trim(),
        duty: ws.duty.trim() || DEFAULT_DUTY,
        heritageKey: ws.heritageKey,
        heritageName: heritage?.name ?? '',
        heritageExamples: heritage?.examples ?? '',
        urge: heritage?.urge ?? '',
        words: [...words('personality', ws.personality), ...words('training', ws.training)],
        gifts: (heritage?.gifts ?? []).map(g => ({ giftKey: g.key, name: g.name, effect: g.effect, drawback: g.drawback, checked: false })),
        resources: ws.resourceName.trim() ? [{ name: ws.resourceName.trim(), effect: ws.resourceEffect.trim() }] : [],
        bonds: [],
    };
    for (const a of APPROACHES) payload[a.field] = ws.dice[a.key] ?? 6;
    return payload;
};

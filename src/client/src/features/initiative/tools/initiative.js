// src/client/src/features/initiative/tools/initiative.js
// ─────────────────────────────────────────────────────────────────────────────
// Initiative d'une table : fonctions pures (documentations/spec_initiative.md §9.5).
// Le navigateur du MJ calcule ici chaque transition, puis envoie l'état complet au
// serveur (Q-33). Chaque fonction renvoie un nouvel état, jamais l'état reçu modifié.
//
// Vocabulaire (§7.5) : « round » = tour (passage complet), une « action » = le moment
// où un participant agit. Modes (§9.2) : 'order' (liste triée, Suivant) et 'sides'
// (camps ; alternate : alternance une action à la fois, sinon camp après camp).
// Un participant en réserve (§9.11) ne compte pas ; un PNJ hors de combat non plus,
// et sort de la bande au tour suivant ; un PJ hors de combat (`down`) reste dans l'ordre.
// ─────────────────────────────────────────────────────────────────────────────

export const SIDES = ['players', 'gm'];
export const WOUNDS = ['light', 'moderate', 'severe', 'out'];

const copy = (state) => structuredClone(state);
const other = (side) => (side === 'players' ? 'gm' : 'players');
const find = (state, key) => state.participants.find(p => p.key === key) ?? null;

/** État de départ : aucun participant, tour 1. */
export function createInitiative({ mode = 'order', alternate = true, opening = 'players', enemyOrder = false } = {}) {
    return {
        mode, alternate, round: 1, activeKey: null, opening, hand: opening,
        kept: { players: false, gm: false }, enemyOrder, lastSide: null, participants: [],
    };
}

/** Participant complet à partir de l'essentiel (valeurs par défaut pour le reste). */
export function makeParticipant({ key, kind, refId = null, side, name, publicName = '', initiative = null,
    actions = 1, hidden = false, reserve = false, wound = null }) {
    return {
        key, kind, refId, side: side ?? (kind === 'character' ? 'players' : 'gm'), name, publicName,
        initiative, actions, acted: 0, delayed: false, hidden, reserve, down: false,
        wound, woundForced: false, outRound: wound === 'out' ? 1 : null,
    };
}

/** PNJ ou entrée libre hors de combat : ne compte plus. */
export const isOutNpc = (p) => p.kind !== 'character' && p.wound === 'out';

/** Le participant peut encore agir ce tour. */
export const canAct = (p) => !p.reserve && p.acted < p.actions && !isOutNpc(p);

const hasRemaining = (state, side) => state.participants.some(p => p.side === side && canAct(p));

/** Premier qui peut agir dans l'ordre de la liste (mode trié), sans les retardés. */
function firstInOrder(state) {
    return state.participants.find(p => canAct(p) && !p.delayed)?.key ?? null;
}

/** Mode camps : qui agit d'office dans le camp qui a la main (seul candidat, ou initiative ennemie). */
function autoPick(state) {
    const candidates = state.participants.filter(p => p.side === state.hand && canAct(p));
    if (candidates.length === 1) return candidates[0].key;
    if (state.enemyOrder && state.hand === 'gm' && candidates.length) {
        return [...candidates].sort((a, b) => (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity))[0].key;
    }
    return null;
}

/** Participant actif d'office, selon le mode. */
function pickActive(state) {
    return state.mode === 'order' ? firstInOrder(state) : autoPick(state);
}

/**
 * Après un retrait, une mise en réserve ou un réglage : l'actif qui ne peut plus agir
 * perd la main ; en mode camps, un camp sans plus personne cède la main à l'autre
 * (sinon la bande resterait bloquée sur un camp vide). Modifie `s` (déjà copié).
 */
function settle(s) {
    const active = s.activeKey ? find(s, s.activeKey) : null;
    if (s.activeKey && (!active || !canAct(active))) s.activeKey = null;   // retiré ou hors de jeu
    if (s.mode === 'sides' && !hasRemaining(s, s.hand) && hasRemaining(s, other(s.hand))) s.hand = other(s.hand);
    if (!s.activeKey) s.activeKey = pickActive(s);
    return s;
}

/** Tri décroissant par initiative, stable (égalités : ordre actuel ; sans valeur : à la fin). */
export function sortByInitiative(state) {
    const s = copy(state);
    s.participants = s.participants
        .map((p, i) => [p, i])
        .sort(([a, i], [b, j]) => ((b.initiative ?? -Infinity) - (a.initiative ?? -Infinity)) || i - j)
        .map(([p]) => p);
    return s;
}

/** Commence (ou recommence) : participant actif d'office. */
export function start(state) {
    const s = state.mode === 'order' ? sortByInitiative(state) : copy(state);
    s.hand = openingHand(s);
    s.activeKey = pickActive(s);
    return s;
}

/** Ajoute des participants ; en mode trié, la bande se range. */
export function addParticipants(state, list) {
    const s = copy(state);
    const keys = new Set(s.participants.map(p => p.key));
    s.participants.push(...list.filter(p => !keys.has(p.key)));
    const sorted = s.mode === 'order' ? sortByInitiative(s) : s;
    if (!sorted.activeKey) sorted.activeKey = pickActive(sorted);
    return sorted;
}

/** Retire un participant ; s'il agissait, le suivant prend la main sans compter d'action. */
export function removeParticipant(state, key) {
    const s = copy(state);
    s.participants = s.participants.filter(p => p.key !== key);
    if (s.activeKey === key) s.activeKey = null;
    return settle(s);
}

/**
 * Change les réglages d'un participant. Une valeur d'initiative range la bande (mode
 * trié, Q-6). Une blessure « hors de combat » note son tour (sortie au tour suivant).
 */
export function updateParticipant(state, key, patch) {
    let s = copy(state);
    const p = find(s, key);
    if (!p) return state;
    Object.assign(p, patch);
    if ('wound' in patch) p.outRound = patch.wound === 'out' ? s.round : null;
    if ('initiative' in patch && s.mode === 'order') s = sortByInitiative(s);
    return settle(s);
}

/**
 * Déplace un participant (glisser-déposer, §9.11) : avant ou après `targetKey`, ou à la
 * fin d'un groupe (`side`, ou `reserve: true`). Il prend le camp et la réserve de sa
 * destination ; un PJ ne va pas en réserve ; sortir de la réserve le fait entrer.
 */
export function moveParticipant(state, key, { targetKey = null, after = false, side = null, reserve = false } = {}) {
    const moving = find(state, key);
    if (!moving || key === targetKey) return state;
    const target = targetKey ? find(state, targetKey) : null;
    const toReserve = target ? target.reserve : reserve;
    if (toReserve && moving.kind === 'character') return state;

    const s = copy(state);
    const m = find(s, key);
    s.participants = s.participants.filter(p => p.key !== key);
    if (target) {
        if (!toReserve) m.side = target.side;
        const i = s.participants.findIndex(p => p.key === targetKey);
        s.participants.splice(after ? i + 1 : i, 0, m);
    } else {
        if (!toReserve && side) m.side = side;
        s.participants.push(m);
    }
    if (toReserve) {
        m.reserve = true;
        return settle(s);
    }
    if (m.reserve) return placeEntered(s, key);
    return settle(s);
}

/** Un participant sort de la réserve, à la place où il est : visible, compte dès maintenant. */
function placeEntered(s, key) {
    const p = find(s, key);
    p.reserve = false;
    p.hidden = false;
    p.acted = 0;
    // Mode trié : sa place est déjà passée dans ce tour → il agira au tour suivant
    if (s.mode === 'order' && s.activeKey) {
        const active = s.participants.findIndex(q => q.key === s.activeKey);
        if (s.participants.indexOf(p) < active) p.acted = p.actions;
    }
    return settle(s);
}

/** Faire entrer un participant en réserve (menu ⋯) ; mode trié : rangé par sa valeur. */
export function enter(state, key) {
    const p = find(state, key);
    if (!p?.reserve) return state;
    let s = copy(state);
    find(s, key).reserve = false;           // rangé parmi ceux qui comptent…
    if (s.mode === 'order' && p.initiative !== null) s = sortByInitiative(s);
    find(s, key).reserve = true;            // …puis entré à cette place
    return placeEntered(s, key);
}

/** Mettre en réserve (menu ⋯) : sort du compte sans quitter la bande. Pas un PJ. */
export function toReserve(state, key) {
    const p = find(state, key);
    if (!p || p.kind === 'character') return state;
    return moveParticipant(state, key, { reserve: true });
}

/** Le MJ désigne qui agit (mode camps : dans le camp qui a la main). */
export function designate(state, key) {
    const p = find(state, key);
    if (!p || !canAct(p)) return state;
    if (state.mode === 'sides' && p.side !== state.hand) return state;
    const s = copy(state);
    s.activeKey = key;
    find(s, key).delayed = false;
    return s;
}

/** Tour suivant : actions remises à zéro, PNJ hors de combat depuis le tour précédent retirés. */
export function newRound(state) {
    const s = copy(state);
    s.round += 1;
    s.participants = s.participants.filter(p => !(isOutNpc(p) && p.outRound !== null && p.outRound < s.round));
    for (const p of s.participants) { p.acted = 0; p.delayed = false; }
    s.kept = { players: false, gm: false };
    s.lastSide = null;
    s.hand = openingHand(s);
    s.activeKey = pickActive(s);
    return s;
}

/** Camp qui ouvre un tour : celui d'ouverture, sauf s'il n'a plus personne pour agir (Q-21). */
function openingHand(s) {
    return s.mode === 'sides' && !hasRemaining(s, s.opening) && hasRemaining(s, other(s.opening)) ? other(s.opening) : s.opening;
}

/**
 * Suivant : l'action de l'actif est comptée, puis
 * - mode trié : prochain dans l'ordre, puis les retardés, puis tour suivant ;
 * - mode camps : main à l'autre camp s'il lui reste quelqu'un (alternance), sinon au
 *   même ; sans alternance, le camp garde la main tant qu'il lui reste quelqu'un.
 */
export function next(state) {
    const s = copy(state);
    const active = s.activeKey ? find(s, s.activeKey) : null;
    if (active) active.acted += 1;

    if (s.mode === 'order') {
        let key = firstInOrder(s);
        if (!key) {
            const waiting = s.participants.find(p => p.delayed && canAct(p));
            if (waiting) { waiting.delayed = false; key = waiting.key; }
        }
        if (!key) return newRound(s);
        s.activeKey = key;
        return s;
    }

    const side = active ? active.side : s.hand;
    if (active) s.lastSide = side;
    if (!hasRemaining(s, 'players') && !hasRemaining(s, 'gm')) return newRound(s);
    if (s.alternate) s.hand = hasRemaining(s, other(side)) ? other(side) : side;
    else s.hand = hasRemaining(s, side) ? side : other(side);
    s.activeKey = autoPick(s);
    return s;
}

/**
 * Camp du personnage qui agit, s'il peut garder la main en terminant son action, ou null.
 * Le choix se fait à la fin de l'action (§12.5) : « Suivant » passe la main, « Garder la main »
 * la laisse au camp. Conditions : mode camps en alternance, pas encore gardée ce tour par ce camp
 * (règle de table, Q-37), un **autre** personnage du camp peut encore agir (Q-38), et l'autre camp
 * aussi (sinon le camp enchaîne de toute façon, rien à payer).
 */
export function keepableSide(state) {
    if (state.mode !== 'sides' || !state.alternate || !state.activeKey) return null;
    const active = find(state, state.activeKey);
    if (!active || state.kept[active.side]) return null;
    const ally = state.participants.some(p => p.side === active.side && p.key !== active.key && canAct(p));
    return ally && hasRemaining(state, other(active.side)) ? active.side : null;
}

/** Fin de l'action en gardant la main : l'action est comptée, la main reste au camp (le débit de la ressource est fait par le slug). */
export function keepHand(state) {
    const side = keepableSide(state);
    if (!side) return state;
    const s = copy(state);
    find(s, s.activeKey).acted += 1;
    s.lastSide = side;
    s.kept[side] = true;
    s.hand = side;
    s.activeKey = autoPick(s);
    return s;
}

/** Action retardée (mode trié, Q-16) : l'actif attend, le suivant prend la main sans action comptée. */
export function delay(state) {
    if (state.mode !== 'order' || !state.activeKey) return state;
    const s = copy(state);
    const active = find(s, s.activeKey);
    active.delayed = true;
    const key = firstInOrder(s);
    if (!key) { active.delayed = false; return state; }
    s.activeKey = key;
    return s;
}

/**
 * Un PNJ de la table a changé dans le navigateur du MJ (useNpcs, §12) :
 * - modifié : son nom (vu du MJ) suit ; sa blessure suit le calcul du slug, sauf si le MJ l'a forcée ;
 * - retiré de la table, ou table vidée : il sort de la bande.
 * Renvoie l'état reçu (même objet) quand rien ne change.
 * @param {object} state
 * @param {{ npc?: object, removedId?: number, cleared?: boolean }} change
 * @param {Function} [woundOf] (instance) → niveau ; `npcWound` du slug
 */
export function applyNpcChange(state, { npc, removedId, cleared } = {}, woundOf) {
    if (!state) return state;
    if (cleared) {
        if (!state.participants.some(p => p.kind === 'npc')) return state;
        const s = copy(state);
        s.participants = s.participants.filter(p => p.kind !== 'npc');
        return settle(s);
    }
    if (removedId != null) {
        const key = `n${removedId}`;
        return find(state, key) ? removeParticipant(state, key) : state;
    }
    if (!npc) return state;
    const p = find(state, `n${npc.id}`);
    if (!p) return state;
    const patch = {};
    if (npc.name && npc.name !== p.name) patch.name = npc.name;
    if (!p.woundForced && woundOf) {
        const wound = woundOf(npc) ?? null;
        if (wound !== p.wound) patch.wound = wound;
    }
    return Object.keys(patch).length ? updateParticipant(state, p.key, patch) : state;
}

/**
 * Niveau de blessure depuis la part de santé restante (0 à 1) ; seuils réglables par le slug.
 * 1 : indemne (null) ; au-dessus de `light` : légère ; de `moderate` : modérée ; > 0 : grave ; 0 : hors de combat.
 */
export function woundFromRatio(ratio, { light = 0.5, moderate = 0.25 } = {}) {
    if (!Number.isFinite(ratio)) return null;
    if (ratio >= 1) return null;
    if (ratio <= 0) return 'out';
    if (ratio > light) return 'light';
    if (ratio > moderate) return 'moderate';
    return 'severe';
}

/**
 * Ce que voit un joueur : ni participants cachés ni réserve ; pour un PNJ ou une entrée
 * libre, ni nom (sauf nom affiché aux joueurs) ni initiative. Filtrage côté client,
 * choix assumé du projet (code-rules/back.md).
 */
export function visibleTo(state, role) {
    if (!state || role === 'gm') return state;
    return {
        ...state,
        participants: state.participants
            .filter(p => !p.hidden && !p.reserve)
            .map(p => (p.kind === 'character' ? { ...p, initiative: null } : { ...p, name: p.publicName, initiative: null })),
    };
}

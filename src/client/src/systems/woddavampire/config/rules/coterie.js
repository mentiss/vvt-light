// src/client/src/systems/woddavampire/config/rules/coterie.js
// ─────────────────────────────────────────────────────────────────────────────
// Coterie (spec_woddavampire.md §20, §II.17.3 ; livre p. 181) : lecture de la
// fiche du groupe et aperçus des fenêtres Verser / Retirer. Le serveur
// (CoterieController.js) reste l'arbitre : ces fonctions ne servent qu'à
// l'affichage. Fonctions pures, testées.
//
// Coterie (GET /coterie/:sessionId) : { anchorKey, backgrounds: [{ backgroundKey,
//   storyPoints, details, contributions: [{ characterId, points }], total }],
//   table: [{ characterId, name, playerName, avatar }], … }
// ─────────────────────────────────────────────────────────────────────────────

import { BACKGROUNDS } from '../traits.js';

/** Historiques mis en commun (livre p. 181, plus Mentor : décision maison de l'annexe divers) */
export const POOLABLE_BACKGROUNDS = ['allies', 'contacts', 'domain', 'herd', 'influence', 'mentor', 'resources', 'retainers'];
export const POOL_MAX = 10;

export const backgroundLabel = (key) => BACKGROUNDS[key] ?? key;

const poolOf = (coterie, key) => coterie?.backgrounds?.find(b => b.backgroundKey === key) ?? null;
const totalOf = (coterie, key) => poolOf(coterie, key)?.total ?? 0;

/** Plafond d'un pool : 10 pour l'ancre, sinon la valeur de l'ancre (10 au plus) */
export const poolCap = (coterie, key) => (key === coterie.anchorKey ? POOL_MAX : Math.min(POOL_MAX, totalOf(coterie, coterie.anchorKey)));

/** Pool au-dessus de l'ancre (l'ancre a baissé) : il échappe au contrôle de la coterie (livre) */
export const isOverAnchor = (coterie, pool) => pool.backgroundKey !== coterie.anchorKey && pool.total > totalOf(coterie, coterie.anchorKey);

/** Pools affichés : l'ancre, et ceux qui ont des points */
export const shownPools = (coterie) => (coterie?.backgrounds ?? []).filter(p => p.backgroundKey === coterie.anchorKey || p.total > 0);

/** Mise d'un personnage dans un pool (0 s'il n'a rien versé) */
export const stakeOf = (coterie, characterId, key) => poolOf(coterie, key)?.contributions.find(c => c.characterId === characterId)?.points ?? 0;

/** À la table de la coterie (peut éditer les textes et l'emblème, verser pour la rejoindre) */
export const isAtTable = (coterie, characterId) => (coterie?.table ?? []).some(t => t.characterId === characterId);

/** Membre : a au moins une mise */
export const isMember = (coterie, characterId) => (coterie?.backgrounds ?? []).some(p => p.contributions.some(c => c.characterId === characterId));

/** Mises d'un membre en une ligne : « Domaine 2, Ressources 3 » */
export const memberStakes = (coterie, characterId) => (coterie?.backgrounds ?? [])
    .map(p => [p.backgroundKey, p.contributions.find(c => c.characterId === characterId)?.points ?? 0])
    .filter(([, n]) => n > 0)
    .map(([key, n]) => `${backgroundLabel(key)} ${n}`)
    .join(', ');

/**
 * Historiques qu'un personnage peut verser : poolables, avec ses points et la place
 * restante sous le plafond. max = points versables d'un coup (0 = rien à verser).
 */
export const contributionOptions = (coterie, character) => POOLABLE_BACKGROUNDS.map(key => {
    const rating = (character?.backgrounds ?? []).find(b => b.backgroundKey === key)?.rating ?? 0;
    const room = Math.max(0, poolCap(coterie, key) - totalOf(coterie, key));
    return { key, rating, room, max: Math.min(rating, room) };
});

/** Retirer sa mise : toute la mise, un point de moins rendu à la fiche */
export const withdrawRefund = (points) => Math.max(0, points - 1);

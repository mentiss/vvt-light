// src/client/src/systems/fabula/config/npc.js
// ─────────────────────────────────────────────────────────────────────────────
// PNJ de Fabula Ultima (spec_pnj.md §10.5, §10.7 ; specifications_fonctionnelles_fabula_ultima.md
// §4.2, §6 ; livre p.295) : règles pures, testées.
// Partie système d'une fiche (valeurs telles qu'imprimées, F-4) : { level, species, rank, champion,
//   villain, traits, attributes { dex, int, pui, vol } (tailles de dé), hp, crisis, mp, init, def, mdef,
//   affinities { type: VU|RE|IM|AB }, attacks, spells, abilities } ;
// état à la table : { hp, mp, statuses, ultima }.
//   - rang (F-2, livre) : Soldat 1 tour, Élite 2 tours, Champion (N) N tours, N choisi par le MJ (F-3) ;
//   - Crise à la moitié des PV (seuil imprimé), vaincu à 0 PV ;
//   - Méchant (F-5) : Points Ultima, 5 (mineur), 10 (majeur), 15 (suprême) ;
//   - états : chacun baisse d'un cran le dé de l'attribut lié (effectiveAttrDie, comme un PJ).
// ─────────────────────────────────────────────────────────────────────────────

import { effectiveAttrDie } from './utils.js';

export const SPECIES = ['Bête', 'Construct', 'Démon', 'Élémentaire', 'Humanoïde', 'Monstre', 'Mort-vivant', 'Plante'];
export const RANKS = { soldat: 'Soldat', elite: 'Élite', champion: 'Champion' };
export const VILLAINS = { mineur: { label: 'Méchant mineur', ultima: 5 }, majeur: { label: 'Méchant majeur', ultima: 10 }, supreme: { label: 'Méchant suprême', ultima: 15 } };
export const STATUSES = { ralenti: 'Ralenti', etourdi: 'Étourdi', affaibli: 'Affaibli', traumatise: 'Traumatisé', empoisonne: 'Empoisonné', enrage: 'Enragé' };
export const AFFINITIES = { VU: 'Vulnérable', RE: 'Résistant', IM: 'Immunisé', AB: 'Absorbe' };
export const ATTR_KEYS = ['dex', 'int', 'pui', 'vol'];

export const npcDefaults = () => ({
    level: 5, species: 'Monstre', rank: 'soldat', champion: null, villain: null, traits: [],
    attributes: { dex: 8, int: 8, pui: 8, vol: 8 }, hp: 30, crisis: 15, mp: 20, init: 8, def: 8, mdef: 8,
    affinities: {}, attacks: [], spells: [], abilities: [],
});

/** Tours par manche selon le rang (livre p.295) */
export const turnsPerRound = (sd) => (sd?.rank === 'elite' ? 2 : sd?.rank === 'champion' ? Math.max(1, Number(sd.champion ?? 2)) : 1);

export const rankLabel = (sd) => (sd?.rank === 'champion' ? `Champion (${sd.champion ?? '?'})` : RANKS[sd?.rank] ?? '');

/** Seuil de Crise : celui de la fiche, sinon la moitié des PV */
export const crisisOf = (sd) => Number(sd?.crisis ?? Math.floor(Number(sd?.hp ?? 0) / 2));

/** Dé effectif d'un attribut d'un PNJ : dé de la fiche, baissé d'un cran par état lié */
export const npcDie = (sd, state, attr) => effectiveAttrDie(
    { [`${attr}De`]: Number(sd?.attributes?.[attr] ?? 8), alterationsEtat: state?.statuses ?? [] }, attr,
);

export const ultimaMax = (sd) => VILLAINS[sd?.villain]?.ultima ?? 0;

export const initialNpcState = (sd) => ({
    hp: Number(sd?.hp ?? 0), mp: Number(sd?.mp ?? 0), statuses: [], ...(sd?.villain ? { ultima: ultimaMax(sd) } : {}),
});

export const inCrisis = (sd, state) => state != null && Number(state.hp ?? 0) > 0 && Number(state.hp) <= crisisOf(sd);

/** Vaincu à 0 PV (un Méchant peut encore fuir en dépensant un Point Ultima : à la table) */
export const isOut = (state) => state != null && Number(state.hp ?? 0) <= 0;

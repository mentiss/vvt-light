// src/client/src/systems/zoneblanche/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Barrel file — réexporte toute la configuration depuis ./config/*.
// Pattern identique à Achtung! Cthulhu / Fabula Ultima : évite d'importer
// plusieurs fichiers séparément dans Creation.jsx/Sheet.jsx/GMApp.jsx.
// Les hooks dés restent ici car ils dépendent de React (RollError) et du
// diceEngine — tout le reste est de la donnée pure dans config/.
// ⚠️  Module ES — uniquement importé par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '../../tools/diceEngine.js';
import ZoneBlancheHistoryEntry from './components/layout/ZoneBlancheHistoryEntry.jsx';

export { PRINCIPES, COMPETENCES, ARCHETYPES, getArchetype } from './config/base.js';
export { FOCUS_CATALOG } from './config/focus.js';
export { MAXIMES_POOLS, MAXIMES_QUOTAS, getMaximesForArchetype } from './config/maximes.js';
export { VERITES_CATALOG } from './config/verites.js';
export { TALENTS_CATALOG } from './config/talents.js';
export { EQUIPMENT_CATALOG, EQUIPMENT_CATEGORY_ORDER, BUDGET_PRESETS } from './config/equipment.js';

// ══════════════════════════════════════════════════════════════════════════════
// BLOC DÉS — contrat diceEngine v2 (vérifié contre tools/diceEngine.js)
//
//   roll(notation, ctx, hooks) est ASYNC et retourne directement le résultat
//   d'afterRoll — jamais un objet dés brut.
//   buildNotation n'est PAS un hook moteur : le composant l'appelle avant roll().
//
// ctx.systemData attendu :
//   pool            — nombre de d20 réellement lancés (hors dés garantis)
//   garantis        — nombre de dés forcés à 1 via Prime Time (non lancés)
//   rang            — Principe + Compétence
//   rangCompetence  — rang de la seule Compétence (seuil de critique si focus)
//   hasFocus        — booléen
//   difficulte      — 0 à 5
//   audimatDepense  — coût payé en Audimat
//   stressGenere    — Stress généré par l'achat de dés
//   primeTimeDepense— Prime Time consommé (dés garantis + relances)
// ══════════════════════════════════════════════════════════════════════════════

export const MAX_DES_ACHETES  = 3;   // 2 dés de base + 3 achetés = 5 max
export const POOL_BASE        = 2;
export const DIFFICULTE_MIN   = 0;
export const DIFFICULTE_MAX   = 5;
export const AUDIMAT_MAX      = 6;

/**
 * Barème d'achat de d20, progressif ET indépendant par jauge :
 * le 1er dé acheté sur une jauge coûte 1, le 2e 2, le 3e 3 — le compteur
 * ne se partage pas entre Audimat et Stress (panachage possible).
 * @param {number} n — nombre de dés déjà achetés SUR CETTE JAUGE
 * @returns {number} coût du dé suivant
 */
export function coutProchainDe(n) {
    return Math.min(n + 1, 3);
}

/** Coût cumulé de n dés achetés sur une même jauge. */
export function coutCumule(n) {
    let total = 0;
    for (let i = 0; i < n; i++) total += coutProchainDe(i);
    return total;
}

/**
 * Interprétation d'un tirage Zone Blanche — logique unique, partagée par le
 * jet initial ET par la relance (qui recalcule l'ensemble du jet à partir des
 * valeurs mises à jour). Éviter toute duplication ici : c'est le seul endroit
 * où se décide ce qu'est un succès.
 *
 * @param {number[]} results — faces des d20, dés garantis inclus
 * @param {object}   params  — { rang, rangCompetence, hasFocus, difficulte,
 *                              garantis, audimatDepense, stressGenere,
 *                              primeTimeDepense, relances, label }
 * @returns {object} result complet (persisté tel quel par le moteur)
 */
export function interpreterJet(results, params = {}) {
    const {
        rang = 0, rangCompetence = 0, hasFocus = false, difficulte = 1,
        garantis = 0, audimatDepense = 0, stressGenere = 0,
        primeTimeDepense = 0, relances = 0, label = '',
    } = params;

    let successes = 0;
    let complications = 0;

    const details = results.map((v, index) => {
        let value = 0, critique = false, complication = false;

        if (v === 20) {
            complication = true;
            complications += 1;
        } else if (v === 1 || (hasFocus && v <= rangCompetence)) {
            value = 2; critique = true;
        } else if (v <= rang) {
            value = 1;
        }

        successes += value;
        return { roll: v, successes: value, critique, complication, garanti: index < garantis };
    });

    return {
        results,
        details,
        successes,          // lu par le moteur pour la persistance
        complications,
        difficulte,
        success: successes >= difficulte,
        marge:   Math.max(0, successes - difficulte),
        rang,
        rangCompetence,
        hasFocus: !!hasFocus,
        audimatDepense,
        stressGenere,
        primeTimeDepense,
        relances,
        label,
    };
}

export const diceHooks = {
    // ── 1. buildNotation — appelé par le composant AVANT roll() ─────────────
    buildNotation: (ctx) => {
        const { pool } = ctx.systemData;
        if (!pool || pool < 1) throw new RollError('NO_DICE', 'Aucun dé à lancer');
        return `${pool}d20`;
    },

    // ── 2. beforeRoll — validation ─────────────────────────────────────────
    beforeRoll: (ctx) => {
        const { pool, garantis = 0 } = ctx.systemData;
        const total = pool + garantis;
        if (total < POOL_BASE || total > POOL_BASE + MAX_DES_ACHETES) {
            throw new RollError('INVALID_DICE', `Nombre de dés invalide : ${total}`);
        }
        return ctx;
    },

    // ── 3. afterRoll — interprétation ──────────────────────────────────────
    // Les dés garantis par Prime Time ne sont pas lancés : ils valent 1 et
    // sont placés en tête du tirage.
    afterRoll: (raw, ctx) => {
        const { garantis = 0 } = ctx.systemData;
        const results = [...Array(garantis).fill(1), ...raw.groups[0].values];
        return interpreterJet(results, { ...ctx.systemData, label: ctx.label });
    },

    // ── 4. buildAnimationSequence ──────────────────────────────────────────
    // Les dés garantis par Prime Time ne sont pas animés (ils ne sont pas
    // lancés). Structure imposée par DiceAnimationOverlay : chaque groupe
    // porte des `waves`, et chaque vague un tableau `dice` — pas `values`.
    buildAnimationSequence: (raw, ctx, result) => ({
        mode: 'single',
        groups: [{
            id:       'zoneblanche-roll',
            diceType: 'd20',
            color:    result.success ? 'success' : 'danger',
            label:    ctx.label || '',
            waves:    [{ dice: raw.groups[0].values }],
        }],
    }),

    // ── 5. renderHistoryEntry ──────────────────────────────────────────────
    renderHistoryEntry: (entry) => <ZoneBlancheHistoryEntry entry={entry} />,
};

// ── Hooks d'ASSISTANCE — jet simplifié 1d20 ─────────────────────────────────
// Pool fixe 1d20 (+ éventuels garantis Prime Time). Difficulté forcée à 0
// (pas de verdict, tout succès compte). Pas d'achat de d20.
// Le Focus s'applique normalement pour les critiques.

export const assistanceHooks = {
    buildNotation: (ctx) => {
        const { pool = 1 } = ctx.systemData;
        if (pool < 0 || pool > 1) throw new RollError('INVALID_DICE', `Assistance : pool doit être 0 ou 1, reçu ${pool}`);
        if (pool === 0) return '0d20'; // tous garantis
        return '1d20';
    },

    beforeRoll: (ctx) => ctx,

    afterRoll: (raw, ctx) => {
        const { garantis = 0 } = ctx.systemData;
        const results = [...Array(garantis).fill(1), ...raw.groups[0].values];
        // Forcer difficulté 0 : pas de verdict réussite/échec
        return interpreterJet(results, { ...ctx.systemData, difficulte: 0, label: ctx.label });
    },

    buildAnimationSequence: (raw, ctx, result) => ({
        mode: 'single',
        groups: [{
            id:       'zoneblanche-assistance',
            diceType: 'd20',
            color:    'default',
            label:    ctx.label || 'Assistance',
            waves:    [{ dice: raw.groups[0].values }],
        }],
    }),

    renderHistoryEntry: (entry) => <ZoneBlancheHistoryEntry entry={entry} />,
};

/**
 * Hooks de RELANCE d'un dé unique.
 *
 * Le moteur reste seul responsable de la persistance : on ne poste jamais
 * l'historique à la main. Pour que l'entrée enregistrée ait du sens, afterRoll
 * ne renvoie donc pas la face isolée mais le jet COMPLET recalculé — le d20
 * relancé étant substitué à sa position dans le tirage précédent.
 *
 * ctx.systemData attendu, en plus des paramètres d'interprétation :
 *   valeursPrecedentes — faces du jet avant relance
 *   indexRelance       — position du dé remplacé
 */
export const rerollHooks = {
    // Pas de validation de pool : une relance ne porte que sur un seul dé.
    beforeRoll: (ctx) => ctx,

    afterRoll: (raw, ctx) => {
        const { valeursPrecedentes = [], indexRelance = 0 } = ctx.systemData;
        const nouvelleValeur = raw.groups[0].values[0];
        const results = valeursPrecedentes.map((v, i) => (i === indexRelance ? nouvelleValeur : v));
        return interpreterJet(results, { ...ctx.systemData, label: ctx.label });
    },

    buildAnimationSequence: (raw, ctx) => ({
        mode: 'single',
        groups: [{
            id:       'zoneblanche-reroll',
            diceType: 'd20',
            color:    'default',
            label:    ctx.label || 'Relance',
            waves:    [{ dice: raw.groups[0].values }],
        }],
    }),

    renderHistoryEntry: (entry) => <ZoneBlancheHistoryEntry entry={entry} />,
};

// ── Combat (stub — aucun système de combat dédié, tout est narratif) ────────

export const combat = {};

// ── diceConfigDefault (requis par convention plateforme) ─────────────────────
// Structure imbriquée sous `custom` — vérifiée contre useDiceConfig.js.
// material: valeurs valides = glass|metal|wood|plastic|none (cf. MATERIAL_OPTIONS).
// texture laissée vide (comportement par défaut le plus sûr, comme la
// majorité des slugs existants) — à raffiner en Phase visuelle si besoin.

export const diceConfigDefault = {
    mode:   'custom',
    custom: {
        foreground: '#e8ffe0',  // vert phosphore clair — chiffres lisibles
        background: '#0d1a0f',  // vert-noir profond — corps du dé
        outline:    '#39ff6a',  // vert phosphore vif — contour
        edge:       '#1f4a2b',  // vert sombre — arêtes
        texture:    '',
        material:   'glass',
    },
    lightColor:       '#39ff6a',
    strength:         5,
    gravity:          500,
    sounds:           true,
    animationEnabled: true,
};

export default {
    slug:  'zoneblanche',
    label: 'Zone Blanche',

    // Le composant choisit explicitement le jeu de hooks :
    //   roll(notation, ctx, zoneblancheConfig.dice)       → jet complet
    //   roll(notation, ctx, zoneblancheConfig.reroll)     → relance d'un dé
    //   roll(notation, ctx, zoneblancheConfig.assistance) → jet d'assistance 1d20
    dice:       diceHooks,
    reroll:     rerollHooks,
    assistance: assistanceHooks,
    combat,
    diceConfigDefault,
};
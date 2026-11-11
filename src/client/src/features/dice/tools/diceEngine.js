// src/client/src/features/dice/tools/diceEngine.js
// ─────────────────────────────────────────────────────────────────────────────
// Orchestrateur générique du moteur de dés.
// Agnostique à tout système de jeu — la logique métier est dans les hooks
// déclarés par chaque système dans src/client/src/systems/:slug/config.jsx
//
// Flux d'un roll :
//   1. hooks.beforeRoll(ctx)                          → validation + enrichissement
//   2. _executeGroups(notation)                       → raw (groupes + allDice + flags)
//   3. hooks.afterRoll(raw, ctx)                      → result (interprétation slug)
//   4. hooks.buildAnimationSequence(raw, ctx, result) → AnimationSequence | null
//   5. diceAnimBridge.play(seq)                       → [await] animation
//   6. recordHistoryEntry (features/dice/tools/diceHistory.js)      → persist (si persistHistory !== false),
//                                                       ctx.rollType et ctx.label obligatoires
//   7. return result
//
// Principes :
//   - Pas de defaults métier (pas de d10, threshold 7, explosion 10).
//   - buildNotation N'EST PAS un hook moteur — c'est une fonction du slug,
//     appelée par le composant AVANT de passer la notation à roll().
//   - rollWithInsurance et rollSagaBonus sont supprimés — remplacés par
//     la notation tableau (N groupes).
// ─────────────────────────────────────────────────────────────────────────────

import { DiceRoll } from '@dice-roller/rpg-dice-roller';
import { diceAnimBridge } from './diceAnimBridge.js';
import {DICE_FALLBACK_CONFIG, diceStorageKey, getDiceScope} from "../hooks/useDiceConfig.js";
import { readStored } from '@/app/tools/browserStorage.js';
import { buildRawResult, recordHistoryEntry } from './diceHistory.js';

// ─── Erreur métier ────────────────────────────────────────────────────────────

export class RollError extends Error {
    constructor(code, message) {
        super(message);
        this.name  = 'RollError';
        this.code  = code;
    }
}

// ─── Hooks par défaut (no-op) ─────────────────────────────────────────────────

const DEFAULT_HOOKS = {
    /** Passe ctx tel quel — validation optionnelle par le slug */
    beforeRoll: (ctx) => ctx,

    /**
     * Retourne raw sans interprétation.
     * Un slug à succès devra surcharger pour compter ses succès.
     * Un slug D&D utilisera raw.groups[0].total.
     */
    afterRoll: (raw, _ctx) => ({
        allDice: raw.allDice,
        groups:  raw.groups,
        flags:   raw.flags,
    }),

    /**
     * Séquence d'animation par défaut : un groupe par entrée dans raw.groups.
     * diceType inféré depuis la notation du groupe.
     */
    buildAnimationSequence: (raw, ctx, _result) => ({
        mode: 'single',
        groups: raw.groups.map((g, i) => ({
            id:       `group-${i}`,
            diceType: _inferDiceType(g.notation),
            color:    'default',
            label:    ctx.label || g.notation,
            waves:    [{ dice: g.values }],
        })),
    }),

    /** null → rendu générique dans l'historique et les notifications (DiceHistoryList, ToastNotifications) */
    renderHistoryEntry: (_entry) => null,
};

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Lance un ou plusieurs groupes de dés, anime et persiste.
 *
 * @param {string | string[]} notation  - Notation(s) rpg-dice-roller.
 *                                        string = 1 groupe, string[] = N groupes.
 * @param {object}            ctx       - Contexte complet du jet (voir spec).
 * @param {object}            [hooks]   - Hooks slug (beforeRoll, afterRoll, ...).
 * @returns {Promise<object>}             result produit par afterRoll.
 */
export async function roll(notation, ctx, hooks = {}) {
    const h = { ...DEFAULT_HOOKS, ...hooks };
    const slug = getDiceScope(); // slug de l'adresse, sinon configuration de la plateforme
    const animationEnabled = readStored(diceStorageKey(slug))?.animationEnabled ?? DICE_FALLBACK_CONFIG.animationEnabled;

    // 1. Validation + enrichissement
    const enrichedCtx = h.beforeRoll(ctx);

    // 2. Exécution des dés (synchrone)
    const raw = _executeGroups(notation);

    // 3. Interprétation slug
    const result = h.afterRoll(raw, enrichedCtx);

    // 4. Animation
    const animSeq = h.buildAnimationSequence(raw, enrichedCtx, result);

    if (animSeq && animationEnabled !== false) {
        await diceAnimBridge.play(animSeq);
    }

    // 5. Persist historique (défaut : true)
    if (enrichedCtx.persistHistory !== false) {
        await _persistRoll(notation, enrichedCtx, raw, result);
    }

    return result;
}

// ─── Exécution interne ────────────────────────────────────────────────────────

/**
 * Exécute la (les) notation(s) et retourne le raw.
 * @param {string | string[]} notation
 * @returns {object} raw
 */
function _executeGroups(notation) {
    const notations = Array.isArray(notation) ? notation : [notation];

    const groups = notations.map((n) => {
        const diceRoll  = new DiceRoll(n);
        const rollGroup = diceRoll.rolls[0];
        const rollItems = rollGroup?.rolls ?? [];

        // Extraire uniquement les faces de dés (pas les modificateurs arithmétiques)
        const diceItems = rollItems.filter(_isDiceResult);
        const values    = diceItems.map(r => r.value);
        const total     = diceRoll.total;            // total lib (dés + modificateurs arith.)

        return { notation: n, values, total, rollItems: diceItems };
    });

    // allDice = concat de toutes les faces de dés de tous les groupes
    const allDice = groups.flatMap(g => g.values);

    // Flags globaux, lus sur les dés réellement tirés (rollItems de chaque groupe)
    const flags = {
        exploded: groups.flatMap(g => g.rollItems).filter(_isExploded).map(r => r.value),
    };

    return { groups, allDice, flags };
}

// ─── Persist ──────────────────────────────────────────────────────────────────

// ctx.rollType et ctx.label sont donnés par le slug ; la notation (telle que passée
// à la bibliothèque) et le brut sont écrits par le moteur seul. Non bloquant.
async function _persistRoll(notation, ctx, raw, result) {
    if (!ctx.apiBase || !ctx.fetchFn) return;

    await recordHistoryEntry(ctx.fetchFn, ctx.apiBase, {
        sessionId:     ctx.sessionId,
        characterId:   ctx.characterId,
        characterName: ctx.characterName,
        rollType:      ctx.rollType,
        label:         ctx.label,
        notation,
        raw:           buildRawResult(raw.groups),
        result,
    });
}

// ─── Helpers privés ───────────────────────────────────────────────────────────

/**
 * Un RollResult est un "dé réel" si ce n'est pas un modificateur arithmétique.
 * rpg-dice-roller représente les modificateurs arithmétiques comme des objets
 * sans propriété `value` définie comme face de dé.
 * On filtre en vérifiant que value est un entier et qu'il n'est pas issu d'un
 * terme arithmétique pur (NumberGenerator).
 */
function _isDiceResult(item) {
    if (!item) return false;
    // Les modificateurs arithmétiques n'ont pas de tableau modifiers
    // et leur constructor.name est souvent 'NumberGenerator' ou similaire.
    // La façon la plus fiable : un vrai dé a toujours une propriété modifiers (Set ou Array).
    return item.modifiers !== undefined && typeof item.value === 'number';
}

/**
 * Détermine si un RollResult est une explosion (dé généré par explosion).
 */
function _isExploded(item) {
    if (!item?.modifiers) return false;
    if (item.modifiers instanceof Set) return item.modifiers.has('explode');
    if (Array.isArray(item.modifiers)) return item.modifiers.includes('explode');
    return false;
}

/**
 * Infère le type de dé depuis une notation rpg-dice-roller.
 * Cherche le premier dN ou dF dans la chaîne.
 *
 * "3d10!>=9>=7"  → "d10"
 * "2d20"         → "d20"
 * "1d20+5"       → "d20"
 * "4dF"          → "dF"
 */
function _inferDiceType(notation) {
    const match = notation?.match(/d(\d+|F)/i);
    return match ? `d${match[1]}` : 'd6';
}
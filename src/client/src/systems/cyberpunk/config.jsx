// src/client/src/systems/cyberpunk/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Configuration frontend du slug Cyberpunk (The Sprawl — adaptation 2d10).
//
// Contrat diceEngine v2 :
//   - buildNotation(ctx) → string   (appelé par le composant, pas le moteur)
//   - beforeRoll(ctx)    → ctx enrichi
//   - afterRoll(raw, ctx)→ result
//   - buildAnimationSequence(raw, ctx, result) → AnimationSequence
//   - renderHistoryEntry(entry) → JSX | null
//
// Système de résolution 2d10 + modificateur :
//   15+    → succès plein
//   10-14  → succès partiel
//   9-     → échec
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import DiceEntryHistory from "./components/layout/DiceEntryHistory.jsx";

import { STAT_LABELS as STAT_LABEL } from './config/character.js';

// Données (config/) et règles pures (config/rules/), réexportées ici
export * from './config/catalog.js';
export * from './config/cyberware.js';
export * from './config/items.js';
export * from './config/playbooks.js';
export * from './config/reference.js';
export * from './config/tags.js';
export * from './config/character.js';
// Console de manœuvres personnalisable (spec_cyberpunk.md §4)
export * from './config/rules/moveConsole.js';
// Bande du résultat 9- / 10-14 / 15+ (spec_cyberpunk.md §5)
export * from './config/rules/rollBand.js';
// Création (spec_cyberpunk.md §9)
export * from './config/rules/creationRules.js';

// ── Constantes ────────────────────────────────────────────────────────────────

const SEUIL_SUCCES  = 15;
const SEUIL_PARTIEL = 10;

// Couleur par stat pour l'animation
const STAT_COLOR = {
    cran:   'magenta',
    pro:    'cyan',
    chair:  'orange',
    esprit: 'purple',
    style:  'amber',
    synth:  'green',
    cred:   'gold',
    null:   'default',
};

export const OUTCOME_LABEL = {
    success: 'Succès plein',
    partial: 'Succès partiel',
    failure: 'Échec',
};

export const OUTCOME_CLASS = {
    success: 'cp-outcome-success',
    partial: 'cp-outcome-partial',
    failure: 'cp-outcome-failure',
};

/**
 * Interprète le total 2d10 + modificateur selon les seuils The Sprawl.
 * @param {number} total
 * @returns {'success' | 'partial' | 'failure'}
 */
function getOutcome(total) {
    if (total >= SEUIL_SUCCES)  return 'success';
    if (total >= SEUIL_PARTIEL) return 'partial';
    return 'failure';
}

// ── Bloc dice — contrat diceEngine v2 ────────────────────────────────────────

const dice = {

    /**
     * Construit la notation rpg-dice-roller.
     * Appelé par le composant (MoveModal ou clic sur stat) AVANT roll().
     *
     * ctx.systemData doit contenir :
     *   - modifier  {number}  : valeur de stat + lien + saisie manuelle
     *   - useSynth  {boolean} : substitution Synth active
     *
     * @param {object} ctx
     * @returns {string} notation rpg-dice-roller
     */
    buildNotation(ctx) {
        const mod = ctx.systemData?.modifier ?? 0;
        if (mod === 0) return '2d10';
        if (mod > 0)   return `2d10+${mod}`;
        return `2d10${mod}`; // mod négatif → "2d10-2" par ex.
    },

    /**
     * Validation et enrichissement avant le roll.
     * Ici : rien à valider, on passe le ctx tel quel.
     */
    beforeRoll(ctx) {
        return ctx;
    },

    /**
     * Interprétation du raw après le roll.
     * raw.groups[0].values = [dé1, dé2]
     * raw.groups[0].total  = total lib (dés + modificateurs arithmétiques)
     *
     * @param {object} raw
     * @param {object} ctx
     * @returns {object} result
     */
    afterRoll(raw, ctx) {
        const group    = raw.groups[0];
        const diceVals = group.values;          // [dé1, dé2] — faces brutes
        const total    = group.total;           // total avec modificateur
        const modifier = ctx.systemData?.modifier ?? 0;
        const outcome  = getOutcome(total);
        const stat     = ctx.systemData?.stat   ?? null;
        const useSynth = ctx.systemData?.useSynth ?? false;

        return {
            // Données brutes
            diceVals,
            modifier,
            total,
            // Interprétation
            outcome,
            outcomeLabel: OUTCOME_LABEL[outcome],
            // Contexte du jet
            stat:        useSynth ? 'synth' : stat,
            moveName:    ctx.systemData?.moveName ?? null,
            // Transmis à persist
            flags:       raw.flags,
        };
    },

    /**
     * Construit la séquence d'animation pour diceAnimBridge.
     * 2 dés d10, couleur selon la stat.
     *
     * @param {object} raw
     * @param {object} ctx
     * @param {object} result
     * @returns {object} AnimationSequence
     */
    buildAnimationSequence(raw, ctx, result) {
        const stat   = result.stat ?? 'null';
        const color  = STAT_COLOR[stat] ?? 'default';
        const label  = result.moveName
            ? `${result.moveName}${stat ? ` (${STAT_LABEL[stat] ?? stat})` : ''}`
            : (STAT_LABEL[stat] ?? 'Jet libre');

        return {
            mode: 'single',
            groups: [{
                id:       'main',
                diceType: 'd10',
                color,
                label,
                waves: [{ dice: raw.groups[0].values }],
            }],
        };
    },

    /**
     * Rendu custom d'une entrée dans l'historique.
     * Affiche : move/stat + total + outcome pill + dés.
     *
     * @param {object} entry - entrée dice_history désérialisée
     * @returns {JSX.Element | null}
     */
    renderHistoryEntry: (entry) => <DiceEntryHistory roll={entry} />,
    renderAllRollTypes: true,   // le slug rend aussi le jet libre (onglet, panneau, notifications)
};

// ── Export config principal ───────────────────────────────────────────────────

const cyberpunkConfig = {
    slug:  'cyberpunk',
    label: 'Cyberpunk',
    dice,
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#00e5ff',
            background: '#050508',
            outline:    '#ff2d78',
            edge:       '#001a20',
            texture:    '',
            material:   'metal',
        },
        lightColor:       '#00e5ff',
        strength:         6,
        gravity:          400,
        sounds:           false,
        animationEnabled: true,
    },
};

export default cyberpunkConfig;
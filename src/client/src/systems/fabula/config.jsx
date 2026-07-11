// src/client/src/systems/fabula/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Barrel file — réexporte toute la configuration depuis ./config/*.
// Évite d'importer 15 fichiers différents dans Creation.jsx/Sheet.jsx/GMApp.jsx
// (pattern identique à Achtung! Cthulhu).
// Les hooks dés restent ici car ils dépendent de React (RollError) et du
// diceEngine — tout le reste est de la donnée pure dans config/.
// ⚠️  Module ES — uniquement importé par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '../../tools/diceEngine.js';
import FabulaHistoryEntry from './components/layout/FabulaHistoryEntry.jsx';

export { CLASSES, CLASS_ORDER } from './config/classes.js';
export { SPELL_LISTS }          from './config/spells.js';
export { ARCANA_LISTS }         from './config/arcana.js';
export {
    computeDerivedStats, getAttributeAfflictions, effectiveAttrDie, classAtoutBonuses,
    equipItem, unequipItem, switchHand, isEquipped, isInHands,
    formatPrecision, formatDegats, formatDefense, formatDefenseMagique,
} from './config/utils.js';
export { EQUIPMENT_CATALOG, CATALOG_ORDER, CATEGORIES_ARMES, TYPES_DEGATS, ATTR_LABELS, catalogToItem } from './config/equipment.js';

// ══════════════════════════════════════════════════════════════════════════════
// BLOC DÉS — contrat diceEngine v2
// ══════════════════════════════════════════════════════════════════════════════
// Deux usages distincts, différenciés par ctx.systemData.type :
//   'test'     → Test d'Attribut classique (2 dés de tailles potentiellement
//                différentes, ex. d8+d10 — VH, critique, échec critique)
//   'economie' → Jet d'économies de départ (2d6 × 10 zenits, Étape 6 du wizard)

const dice = {

    buildNotation: (ctx) => {
        const { type } = ctx.systemData ?? {};

        if (type === 'economie') {
            return '2d6';
        }

        const { dieSize1, dieSize2 } = ctx.systemData ?? {};
        if (![6, 8, 10, 12].includes(dieSize1) || ![6, 8, 10, 12].includes(dieSize2)) {
            throw new RollError('INVALID_DICE', `Taille de dé invalide : d${dieSize1} / d${dieSize2}`);
        }
        // ⚠️ Deux groupes distincts, PAS une string combinée "1d8+1d10" : une
        // string = 1 seul groupe (raw.groups[0]), alors qu'afterRoll lit
        // raw.groups[0] ET raw.groups[1]. C'était le bug racine du jet cassé.
        return [`1d${dieSize1}`, `1d${dieSize2}`];
    },

    beforeRoll: (ctx) => ctx,

    // ⚠️ À vérifier une fois testable : pour "1d8+1d10", on suppose que
    // raw.groups[0]/[1] correspondent dans l'ordre aux deux dés déclarés.
    afterRoll: (raw, ctx) => {
        const { type, dieSize1, dieSize2, modifier = 0, nd = null, degatsBonus, degatsType } = ctx.systemData ?? {};

        if (type === 'economie') {
            const values = raw.groups[0].values;
            const total  = (values[0] + values[1]) * 10;
            return {
                type: 'economie',
                values,
                total,
                label: ctx.label ?? 'Économies de départ',
                successes: 1,
            };
        }

        // 'test' (test d'attribut classique) et 'attaque' (bouton Attaquer sur
        // arme équipée) partagent EXACTEMENT le même jet de précision — Fabula
        // Ultima n'a pas de jet de dégâts séparé, les dégâts sont [VH + bonus de
        // l'arme] calculés immédiatement après le test. Seule 'attaque' porte
        // en plus degatsBonus/degatsType (fournis par FabulaDiceModal depuis
        // weaponContext) et calcule la ligne Dégâts.
        const die1 = raw.groups[0].values[0];
        const die2 = raw.groups[1].values[0];
        const vh   = Math.max(die1, die2);
        const total = die1 + die2 + modifier;

        const criticalSuccess = die1 === die2 && die1 >= 6;
        const criticalFailure = die1 === 1 && die2 === 1;

        let success = null;
        if (criticalSuccess) success = true;
        else if (criticalFailure) success = false;
        else if (nd != null) success = total >= nd;

        const base = {
            type: type === 'attaque' ? 'attaque' : 'test',
            die1, die2, dieSize1, dieSize2,
            vh,
            modifier,
            total,
            nd,
            criticalSuccess,
            criticalFailure,
            success,
            label: ctx.label ?? (type === 'attaque' ? 'Attaque' : 'Test d\'Attribut'),
            successes: success === true ? 1 : 0,
        };

        if (type === 'attaque') {
            base.degatsBonus = degatsBonus ?? 0;
            base.degatsType  = degatsType ?? 'physique';
            base.degats      = vh + (degatsBonus ?? 0);
        }

        return base;
    },

    buildAnimationSequence: (raw, ctx, result) => {
        if (result.type === 'economie') {
            return {
                mode: 'single',
                groups: [{
                    id:       'economie',
                    diceType: 'd6',
                    color:    'default',
                    label:    result.label,
                    waves:    [{ dice: result.values }],
                }],
            };
        }

        // Fusionnés en UNE seule vague (diceType composite "1d8+1d10") pour que
        // les deux dés tombent ensemble visuellement — même si le calcul (raw.groups)
        // reste en 2 groupes séparés pour pouvoir lire chaque valeur indépendamment.
        // Pattern identique à FreeDiceModal.jsx (composants/modals) pour "1d100+1d10".
        return {
            mode: 'single',
            groups: [{
                id:       'test',
                diceType: `1d${result.dieSize1}+1d${result.dieSize2}`,
                color:    'default',
                label:    result.label,
                waves:    [{ dice: [result.die1, result.die2] }],
            }],
        };
    },

    renderHistoryEntry: (entry) => <FabulaHistoryEntry roll={entry} />,
};

// ══════════════════════════════════════════════════════════════════════════════
// BLOC COMBAT — stub minimal (pas d'automatisation prévue en V1)
// ══════════════════════════════════════════════════════════════════════════════

const combat = {
    renderHealthDisplay: () => null,
    actions:              [],
    attack:               null,
};

const fabulaConfig = {
    slug:  'fabula',
    label: 'Fabula Ultima',
    dice,
    combat,

    // Style par défaut des dés (lu par useDiceConfig) — aligné sur la palette
    // du thème jour fournie par le MJ (theme.css) : corps vert feuille
    // (--color-primary), contour orange cuivré (--color-accent, la couleur
    // des Points Fabula), chiffres lisibles sur fond clair, tranche dans le
    // ton bordure sombre du thème.
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#EAF0F4', // clair — chiffres lisibles (proche --color-bg)
            background: '#3E7232', // vert feuille (--color-primary)
            outline:    '#D37928', // orange cuivré (--color-accent)
            edge:       '#2B4A42', // bordure sombre du thème (--color-border)
            texture:    '',
            material:   'plastic',
        },
        lightColor:       '#D37928',
        strength:         5,
        gravity:          500,
        sounds:           true,
        animationEnabled: true,
    },
};

export default fabulaConfig;
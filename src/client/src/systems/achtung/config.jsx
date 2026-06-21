// src/client/src/systems/achtung/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Barrel file — réexporte toute la configuration depuis ./config/*.
// Conserve la compatibilité des imports existants (`from '../config.jsx'`).
// Les hooks dés (JSX + RollError) restent ici car ils dépendent de React
// et du diceEngine — tout le reste est désormais de la donnée pure dans config/.
// ⚠️  Module ES — uniquement importé par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '../../tools/diceEngine.js';
import AchtungHistoryEntry from './components/AchtungHistoryEntry.jsx';

export { KEYWORD_LABELS, getKeywordLabel } from './config/keywords.js';

export {
    ATTRIBUTES, SKILLS, SKILL_LABEL, ATTR_LABEL,
    ARCHETYPES, BACKGROUNDS, CHARACTERISTICS,
} from './config/base.js';

export { TALENTS } from './config/talents.js';

export { NATIONALITIES } from './config/nationalities.js';

export { ARCHETYPE_DATA } from './config/archetypes.js';

export { BACKGROUND_DATA } from './config/backgrounds.js';

export { CHARACTERISTIC_DATA } from './config/characteristics.js';

export {
    SPELLS, SPELLCASTER_PRACTICES,
    getCastAttribute, getStartingSpellCount, getAccessibleTraditions,
    getPowerRating, getBonusPowerDice,
} from './config/spells.js';
// NOTE: getSpellcasterType() n'existe plus (ancien modèle où la pratique était
// déduite du talent précis pris). Nouveau modèle : la pratique est choisie
// librement par le joueur (cf. SPELLCASTER_PRACTICES). Creation.jsx doit être
// mis à jour pour ne plus appeler getSpellcasterType — chantier en cours.

export {
    WEAPON_RANGES, WEAPON_SIZES, RANGE_LABELS,
    SALVO_EFFECTS, SALVO_HAS_VALUE, SALVO_LABELS,
    WEAPON_QUALITIES, QUALITY_LABELS, UNARMED_WEAPON,
    getBonusDamage, getResistance,
    computeStress, computeArmour, computeCourage, getBonusLanguages,
    EXTRA_DIE_COST, countSuccesses, countChallengeDice,
} from './config/mechanics.js';

// Import local (en plus du re-export ci-dessus) pour usage interne dans les hooks dés
import { countSuccesses, countChallengeDice } from './config/mechanics.js';

// ══════════════════════════════════════════════════════════════════════════════
// HOOKS DÉS — dépendent de React (JSX) et du diceEngine, restent dans ce barrel
// ══════════════════════════════════════════════════════════════════════════════

const skillDiceHooks = {
    buildNotation: (ctx) => {
        const { nbDes } = ctx.systemData;
        if (!nbDes || nbDes < 1) throw new RollError('NO_DICE', 'Aucun dé à lancer');
        return `${nbDes}d20`;
    },

    beforeRoll: (ctx) => {
        const { nbDes } = ctx.systemData;
        if (nbDes < 1 || nbDes > 5)
            throw new RollError('INVALID_DICE', `Nombre de dés invalide : ${nbDes}`);
        return ctx;
    },

    afterRoll: (raw, ctx) => {
        const {
            target, skillRank, hasFocus,
            difficulty = 1,
            momentumSpent = 0, threatGenerated = 0,
            isAssist = false,
            forcedOnesCount = 0,
        } = ctx.systemData;

        const rolled  = raw.groups[0].values;
        const results = [...Array(forcedOnesCount).fill(1), ...rolled];

        const { successes, complications } = countSuccesses(results, target, skillRank, hasFocus);
        const success  = successes >= difficulty;
        const momentum = Math.max(0, successes - difficulty);

        return {
            results,
            forcedCount:     forcedOnesCount,
            target,
            skillRank,
            hasFocus:        !!hasFocus,
            successes,
            complications,
            difficulty,
            success,
            momentum,
            momentumSpent,
            threatGenerated,
            isAssist:        !!isAssist,
            label:           ctx.label,
        };
    },

    buildAnimationSequence: (raw, ctx) => ({
        mode: 'single',
        groups: raw.groups.map((g, i) => ({
            id:       `skill-${i}`,
            diceType: 'd20',
            color:    'default',
            label:    ctx.label || `${g.values.length}d20`,
            waves:    [{ dice: g.values }],
        })),
    }),

    renderHistoryEntry: (entry) => <AchtungHistoryEntry roll={entry} />,
};

// ── Hooks dés — dommages (dés de Challenge d6) ────────────────────────────────
// Passé à roll() par AchtungDiceModal pour les jets de dommages.
// Entité distincte car le type de dé, la notation et l'interprétation diffèrent.

const challengeDiceHooks = {
    buildNotation: (ctx) => {
        const { nbDice } = ctx.systemData;
        if (!nbDice || nbDice < 1) throw new RollError('NO_DICE', 'Aucun dé de Challenge à lancer');
        return `${nbDice}d6`;
    },

    beforeRoll: (ctx) => {
        if (ctx.systemData.nbDice < 1 || ctx.systemData.nbDice > 10)
            throw new RollError('INVALID_DICE', `Nombre de dés invalide : ${ctx.systemData.nbDice}`);
        return ctx;
    },

    afterRoll: (raw, ctx) => {
        const { activeSalvo = null } = ctx.systemData;
        const results = raw.groups[0].values;
        const { stress, effects } = countChallengeDice(results, activeSalvo);
        return { results, stress, effects, activeSalvo, label: ctx.label, successes: stress };
    },

    buildAnimationSequence: (raw, ctx) => ({
        mode: 'single',
        groups: raw.groups.map((g, i) => ({
            id:       `damage-${i}`,
            diceType: 'd6',
            color:    'default',
            label:    ctx.label || `${g.values.length}d6`,
            waves:    [{ dice: g.values }],
        })),
    }),

    renderHistoryEntry: (entry) => <AchtungHistoryEntry roll={entry} />,
};

// ── Config principale ─────────────────────────────────────────────────────────

const achtungConfig = {
    slug:  'achtung',
    label: 'Achtung! Cthulhu',

    // Hooks dés de compétence — passés à roll() pour les jets 2D20
    dice: skillDiceHooks,

    // Hooks dés de dommages — passés à roll() pour les jets de Challenge dice
    // Le composant choisit explicitement quel bloc utiliser :
    //   roll(notation, ctx, achtungConfig.dice)          → jet de compétence
    //   roll(notation, ctx, achtungConfig.challengeDice) → jet de dommages
    challengeDice: challengeDiceHooks,

    // Style par défaut des dés (lu par useDiceConfig)
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#e5dcc0',   // papier jauni — faces
            background: '#3d3d28',   // vert kaki sombre — corps
            outline:    '#6b7c45',   // kaki — contour
            edge:       '#2f2f1e',   // bord très sombre
            texture:    '',
            material:   'metal',
        },
        lightColor:       '#b5a96a',  // sable
        strength:         6,
        gravity:          400,
        sounds:           false,
        animationEnabled: true,
    },
};

export default achtungConfig;
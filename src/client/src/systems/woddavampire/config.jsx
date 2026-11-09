// src/client/src/systems/woddavampire/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Configuration front du slug Vampire : l'Âge des Ténèbres.
// Réexporte les catalogues (config/*) et porte les hooks de dés (contrat
// diceEngine v2). Spec : spec_woddavampire.md partie II.
// ⚠️ Module ES — importé uniquement par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '../../tools/diceEngine.js';
import VdaHistoryEntry from './components/layout/VdaHistoryEntry.jsx';
import { resolvePool, clampDifficulty } from './config/rules/dicePool.js';
import { CHRONICLE } from './config/chronicle.js';

export { CHRONICLE, CREATION_BUDGET, BONUS_COSTS } from './config/chronicle.js';
export { CLANS, CLAN_ORDER, ORIGIN_CLAN_CHOICES } from './config/clans.js';
export { ROADS, ROAD_ORDER, VIRTUE_LABELS, roadVirtues } from './config/roads.js';
export { DISCIPLINES, DISCIPLINE_ORDER } from './config/disciplines.js';
export { PATHS, KRAINA, RITUALS, NEVER_PRIMARY, availableRituals } from './config/bloodMagic.js';
export { MERITS_FLAWS, MERIT_FLAW_ORDER, MERIT_CATEGORY_LABELS, costOptions } from './config/meritsFlaws.js';
export {
    ATTRIBUTE_GROUPS, ATTRIBUTE_LABELS, ABILITY_GROUPS, ABILITY_LABELS, ABILITY_CATEGORY, ABILITY_DOMAINS,
    BODY_CRAFTS, BACKGROUNDS, ARCHETYPES,
} from './config/traits.js';
export * from './config/descriptions.js';
export {
    UNARMED, WEAPONS, ARMORS, SHIELDS, DAMAGE_TYPE_LABELS, DAMAGE_TYPE_SHORT, SOAK_TYPES, EQUIPMENT_CATALOG, EQUIPMENT_FILTERS,
} from './config/equipment.js';
export { IMPOSED_STATES, IMPOSED_STATE_ORDER, CLAN_WEAKNESS_STATES, DERANGEMENTS, DERANGEMENT_RULE, BLOOD_BOND_LEVELS } from './config/conditions.js';
export { DISCIPLINE_POWERS } from './config/powers/disciplines.js';
export { PATH_POWERS, KRAINA_POWERS, RITUAL_INFO } from './config/powers/bloodMagic.js';
export { resolvePool, clampDifficulty, successDegree } from './config/rules/dicePool.js';

// ══════════════════════════════════════════════════════════════════════════════
// BLOC DÉS — contrat diceEngine v2
// ══════════════════════════════════════════════════════════════════════════════
// ctx.systemData.type :
//   'starting_blood' → 1d10 de la réserve de départ (assistant de création)
//   'initiative'     → 1d10 + base (Dex + Astuce + Célérité − blessures − armure), §10.1
//   'pool'           → réserve de d10 contre une difficulté (lot 2 : fiche)
//                      { dice, difficulty, specialty, autoSuccesses, cannotBotch }

export const ROLL_TYPES = { pool: 'vda_pool', startingBlood: 'vda_starting_blood', initiative: 'vda_initiative' };

const dice = {

    buildNotation: (ctx) => {
        const { type, dice: count } = ctx.systemData ?? {};
        if (type === 'starting_blood' || type === 'initiative') return '1d10';
        const n = Math.trunc(Number(count) || 0);
        // Tous les dés partent en une seule vague (§II.3) ; une réserve vide ne lance rien
        if (n < 1) throw new RollError('EMPTY_POOL', 'Réserve vide : aucun dé à lancer.');
        return `${n}d10`;
    },

    beforeRoll: (ctx) => {
        if (ctx.systemData?.type !== 'pool') return ctx;
        return { ...ctx, systemData: { ...ctx.systemData, difficulty: clampDifficulty(ctx.systemData.difficulty) } };
    },

    afterRoll: (raw, ctx) => {
        const sd = ctx.systemData ?? {};
        const values = raw.groups[0]?.values ?? [];

        if (sd.type === 'initiative') {
            const base = sd.base ?? 0;
            return { type: 'initiative', die: values[0], base, value: values[0] + base, values, label: ctx.label ?? 'Initiative', successes: 0 };
        }
        if (sd.type === 'starting_blood') {
            return { type: 'starting_blood', value: values[0], values, label: ctx.label ?? 'Réserve de sang de départ', successes: 0 };
        }

        const result = resolvePool(values, sd.difficulty, {
            specialty: !!sd.specialty, autoSuccesses: sd.autoSuccesses ?? 0, cannotBotch: !!sd.cannotBotch,
            onesCancel: CHRONICLE.onesCancelSuccesses,
        });
        return { type: 'pool', values, specialty: !!sd.specialty, label: ctx.label ?? 'Jet', ...result };
    },

    buildAnimationSequence: (raw, ctx, result) => ({
        mode: 'single',
        groups: [{
            id:       result.type,
            diceType: 'd10',
            color:    'default',
            label:    result.label,
            waves:    [{ dice: result.values }],
        }],
    }),

    renderHistoryEntry: (entry) => <VdaHistoryEntry roll={entry} />,
    renderAllRollTypes: true,   // le slug rend aussi le jet libre (onglet, panneau, notifications)
};

const woddavampireConfig = {
    slug:  'woddavampire',
    label: "Vampire : l'Âge des Ténèbres",
    dice,

    // Dés 3D : sang sombre, chiffres vélin, filet or (planche validée)
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#E6D7BC',   // vélin à la chandelle — chiffres
            background: '#6E0A12',   // sang sombre
            outline:    '#C9A24A',   // or à la feuille
            edge:       '#2A0204',   // sang séché
            texture:    '',
            material:   'glass',
        },
        lightColor:       '#B3141F',
        strength:         5,
        gravity:          500,
        sounds:           true,
        animationEnabled: true,
    },
};

export default woddavampireConfig;

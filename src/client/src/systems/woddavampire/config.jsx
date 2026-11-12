// src/client/src/systems/woddavampire/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Configuration front du slug Vampire : l'Âge des Ténèbres.
// Réexporte les catalogues (config/*) et porte les hooks de dés (contrat
// diceEngine v2). Spec : spec_woddavampire.md partie II.
// ⚠️ Module ES — importé uniquement par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '@/features/dice/tools/diceEngine.js';
import VdaHistoryEntry from './components/layout/VdaHistoryEntry.jsx';
import { resolvePool, clampDifficulty } from './config/rules/dicePool.js';
import { CHRONICLE } from './config/chronicle.js';
import { NATURES, npcDefaults, initialNpcState, isOut, npcHealthMarks } from './config/rules/npc.js';
import { initiativeValue } from './config/rules/sheetRules.js';
import { woundFromRatio } from '@/features/initiative/tools/initiative.js';
import VdaNpcSheet from './components/npc/VdaNpcSheet.jsx';
import VdaNpcForm from './components/npc/VdaNpcForm.jsx';
import VdaNpcRollWindow from './components/npc/VdaNpcRollWindow.jsx';
import { vdaNpcPick } from './components/npc/vdaNpcPick.js';

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

    // PNJ du Conteur (spec_pnj.md §10.3) : onglet PNJ de l'interface MJ, partie système components/npc/
    npc: {
        librarySide:  'left',
        tagGroups:    [{ label: 'Nature', tags: Object.values(NATURES), of: sd => NATURES[sd.nature ?? 'character'] }],   // posée par la fiche (§11)
        hiddenTags:   Object.values(NATURES),   // déjà dite par le résumé de chaque ligne
        defaults:     npcDefaults,
        summary:      (npc) => {
            const sd = npc.systemData ?? {};
            const nature = sd.nature ?? 'character';
            if (nature === 'swarm') return `Nuée · ${sd.damage ?? 0} dés · santé ${sd.healthPoints ?? 0}`;
            if (nature === 'spirit') return `Esprit · Essence ${sd.essence ?? 0}`;
            return [NATURES[nature], `Volonté ${sd.willpower ?? 0}`].join(' · ');
        },
        initialState: (npc) => initialNpcState(npc.systemData),
        isDown:       (instance) => isOut(instance.sheet?.systemData, instance.state),
        Form:         VdaNpcForm,
        Sheet:        VdaNpcSheet,
        pick:         vdaNpcPick,
        RollWindow:   VdaNpcRollWindow,
    },

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

    // Initiative de la plateforme (spec_initiative.md §9.8, §12, Q-16) : ordre trié ; valeur
    // = Dextérité + Astuce + Célérité, le MJ y ajoute le d10 annoncé ; action retardée.
    // PNJ : Dex + Astuce (nuée : sa valeur d'initiative) ; blessure par les niveaux de santé,
    // la santé d'une nuée ou l'Essence d'un esprit.
    initiative: {
        mode: 'order',
        delay: true,
        characterInitiative: (character) => initiativeValue(character),
        npcInitiative: ({ sheet }) => {
            const sd = sheet?.systemData ?? {};
            if ((sd.nature ?? 'character') === 'swarm') return typeof sd.initiative === 'number' ? sd.initiative : null;
            const a = sd.attributes ?? {};
            return typeof a.dexterity === 'number' || typeof a.wits === 'number' ? (a.dexterity ?? 0) + (a.wits ?? 0) : null;
        },
        npcWound: ({ sheet, state }) => {
            const sd = sheet?.systemData ?? {};
            if (isOut(sd, state)) return 'out';
            const nature = sd.nature ?? 'character';
            if (nature === 'swarm') return woundFromRatio(1 - Number(state?.damage ?? 0) / Math.max(1, Number(sd.healthPoints ?? 1)));
            if (nature === 'spirit') return Number(sd.essence) > 0 ? woundFromRatio(Number(state?.essence ?? sd.essence) / Number(sd.essence)) : null;
            const marks = npcHealthMarks(sd, state);
            return woundFromRatio(1 - marks.filter(Boolean).length / marks.length);
        },
    },
};

export default woddavampireConfig;

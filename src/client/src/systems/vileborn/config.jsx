// src/client/src/systems/vileborn/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Configuration front du slug Vileborn.
// Réexporte les catalogues (config/*) et porte les hooks de dés (contrat
// diceEngine v2). Spec : spec_vileborn.md partie II (§II.4).
// ⚠️ Module ES — importé uniquement par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '../../tools/diceEngine.js';
import VilHistoryEntry from './components/layout/VilHistoryEntry.jsx';
import { resolveTest, poolSize } from './config/rules/test.js';

export { APPROACHES, STATES, WOUNDS, DEFAULT_DUTY, WORD_SLOTS } from './config/approaches.js';
export { HERITAGES, HERITAGE_ORDER } from './config/heritages.js';
export { ORIGINS, ORIGIN_ORDER } from './config/origins.js';
export { RESOURCES } from './config/resources.js';
export { PERSONALITY_SUGGESTIONS, TRAINING_SUGGESTIONS } from './config/suggestions.js';
export * from './config/descriptions.js';
export { DIFFICULTIES, DEFAULT_DIFFICULTY, DARK_INTENSITIES, VERDICT_LABELS, resolveTest, statePenalty, poolSize, darkThreshold } from './config/rules/test.js';

// ══════════════════════════════════════════════════════════════════════════════
// BLOC DÉS — contrat diceEngine v2
// ══════════════════════════════════════════════════════════════════════════════
// ctx.systemData.type :
//   'test'  → { die, personality, training, explore, ticks, modifier, difficulty, approach }
//             réserve de dés de l'approche (+ d12 d'obscurité si explore)
//   'dark'  → { threshold } : dé d'obscurité du MJ (d12)
//   'gift'  → { giftName, on, effect } : d6 de la contrepartie d'un don
//   'event' → { text } : ligne d'événement (Rêverie, Pulsion), sans dé (lot 2, Q32)

export const ROLL_TYPES = { test: 'vileborn_test', dark: 'vileborn_dark', gift: 'vileborn_gift', event: 'vileborn_event' };

const dice = {

    buildNotation: (ctx) => {
        const sd = ctx.systemData ?? {};
        if (sd.type === 'dark') return '1d12';
        if (sd.type === 'gift') return '1d6';
        const size = Number(sd.die);
        if (![6, 8, 10, 12].includes(size)) throw new RollError('NO_DIE', 'Approche sans dé.');
        const pool = `${poolSize(sd)}d${size}`;
        return sd.explore ? [pool, '1d12'] : pool;
    },

    beforeRoll: (ctx) => ctx,

    afterRoll: (raw, ctx) => {
        const sd = ctx.systemData ?? {};
        const label = ctx.label ?? '';
        if (sd.type === 'dark') {
            const value = raw.groups[0]?.values?.[0];
            const threshold = sd.threshold ?? null;
            return { type: 'dark', label, value, threshold, complication: threshold !== null && value >= threshold, successes: 0 };
        }
        if (sd.type === 'gift') {
            const value = raw.groups[0]?.values?.[0];
            return { type: 'gift', label, giftName: sd.giftName, value, triggered: (sd.on ?? [1]).includes(value), effect: sd.effect ?? null, successes: 0 };
        }
        const values = raw.groups[0]?.values ?? [];
        const dark = sd.explore ? raw.groups[1]?.values?.[0] ?? null : null;
        const result = resolveTest(values, dark, { difficulty: sd.difficulty, modifier: sd.modifier ?? 0, ticks: sd.ticks ?? 0 });
        return {
            type: 'test', label, approach: sd.approach, die: sd.die, values,
            personality: !!sd.personality, training: !!sd.training, ticks: sd.ticks ?? 0,
            ...result, successes: result.verdict === 'success' ? 1 : 0,
        };
    },

    // Un seul lancer : la réserve et le d12 dans la même vague (une seule palette, Q31)
    buildAnimationSequence: (raw, ctx, result) => {
        const values = result.type === 'test' ? [...result.values, ...(result.dark ? [result.dark] : [])] : [result.value];
        const diceType = result.type === 'test'
            ? `${result.values.length}d${result.die}${result.dark ? '+1d12' : ''}`
            : result.type === 'dark' ? '1d12' : '1d6';
        return { mode: 'single', groups: [{ id: result.type, diceType, color: 'default', label: result.label, waves: [{ dice: values }] }] };
    },

    renderHistoryEntry: (entry) => <VilHistoryEntry roll={entry} />,
    renderAllRollTypes: true,   // le slug rend aussi le jet libre (onglet, panneau, notifications)
};

const vilebornConfig = {
    slug:  'vileborn',
    label: 'Vileborn',
    dice,

    // Dés 3D : rouge sang, chiffres papier, filet encre (planche validée)
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#F8F7F4',   // papier — chiffres
            background: '#8B1A1A',   // rouge sang
            outline:    '#1C1A1B',   // encre
            edge:       '#4A0D0D',   // sang séché
            texture:    '',
            material:   'glass',
        },
        lightColor:       '#CF4A43',
        strength:         5,
        gravity:          500,
        sounds:           true,
        animationEnabled: true,
    },
};

export default vilebornConfig;

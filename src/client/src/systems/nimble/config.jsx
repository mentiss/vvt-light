// src/client/src/systems/nimble/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Configuration front du slug Nimble : hooks de dés (contrat diceEngine v2).
// Règles de résolution : config/rules/dice.js (pur, testé).
// Spec : spec_nimble.md §5.
// ⚠️ Module ES — importé uniquement par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '@/features/dice/tools/diceEngine.js';
import NbHistoryEntry from './components/layout/NbHistoryEntry.jsx';
import NbNpcSheet from './components/npc/NbNpcSheet.jsx';
import NbNpcForm from './components/npc/NbNpcForm.jsx';
import { FAMILIES, MONSTERS } from './config/bestiary.js';
import { ARMOR_LABELS, isDown, levelValue, monsterState, monsterView } from './config/rules/encounter.js';
import { woundFromRatio } from '@/features/initiative/tools/initiative.js';
import {
    VICIOUS_POOL, clampEdge, dicePoolSize, pickDice, resolveMinions, resolveAttack, resolveD20, initiativeActions, resolveHitDice, sumDice,
} from './config/rules/dice.js';

// ══════════════════════════════════════════════════════════════════════════════
// BLOC DÉS — contrat diceEngine v2
// ══════════════════════════════════════════════════════════════════════════════
// ctx.systemData.type :
//   'attack'     → { count, sides, edge, vicious, canCrit, canMiss, opening, bonus, special, source, damageType, note }
//                  notation : [dés + avantage, chaîne de critique '1dS!', réserve Féroce]
//   'check'      → { edge, bonus, dc, skill } : test de compétence (d20)
//   'save'       → { edge, bonus, dc, stat }  : sauvegarde (d20)
//   'initiative' → { edge, bonus }            : initiative (d20 → actions)
//   'hitdice'    → { count, sides, perDie, max } : repos de terrain
//   'plain'      → { count, sides, bonus, note } : somme simple (soins de capacité, potion)
//   'levelhp'    → { sides } : PV d'une montée de niveau (dé de vie avec avantage : 2 dés, le meilleur)
//   'minions'    → { count, sides, bonus } : attaque groupée de sbires (un dé chacun, 1 = raté, pas de critique)

export const ROLL_TYPES = {
    attack: 'nimble_attack', check: 'nimble_check', save: 'nimble_save', initiative: 'nimble_initiative',
    hitdice: 'nimble_hitdice', plain: 'nimble_plain', levelhp: 'nimble_levelhp', minions: 'nimble_minions',
};

const D20_TYPES = ['check', 'save', 'initiative'];

const dice = {

    buildNotation: (ctx) => {
        const sd = ctx.systemData ?? {};
        if (D20_TYPES.includes(sd.type)) return `${dicePoolSize(1, sd.edge)}d20`;
        const sides = Number(sd.sides);
        if (sd.type === 'levelhp' && sides) return `2d${sides}`;
        const count = Number(sd.count);
        if (!sides || count <= 0) throw new RollError('NO_DICE', 'Aucun dé à lancer.');
        if (sd.type === 'hitdice' || sd.type === 'plain' || sd.type === 'minions') return `${count}d${sides}`;
        if (sd.special) return `2d${sides}`;
        const base = `${dicePoolSize(count, sd.edge)}d${sides}`;
        return sd.canCrit === false ? base : [base, `1d${sides}!`, `${VICIOUS_POOL}d${sides}`];
    },

    beforeRoll: (ctx) => ctx,

    afterRoll: (raw, ctx) => {
        const sd = ctx.systemData ?? {};
        const label = ctx.label ?? '';
        const values = raw.groups[0]?.values ?? [];

        if (D20_TYPES.includes(sd.type)) {
            const edge = clampEdge(sd.edge);
            const r = resolveD20(values, edge, Number(sd.bonus ?? 0), sd.dc ?? null);
            const result = { type: sd.type, label, values, edge, bonus: Number(sd.bonus ?? 0), dc: sd.dc ?? null, ...r,
                successes: r.success ? 1 : 0, note: sd.note ?? null };
            if (sd.type === 'initiative') result.actions = initiativeActions(r.total, r.natural);
            return result;
        }
        if (sd.type === 'hitdice') {
            const r = resolveHitDice(values, Number(sd.sides), Number(sd.perDie ?? 0), !!sd.max);
            return { type: 'hitdice', label, values, sides: Number(sd.sides), perDie: Number(sd.perDie ?? 0), max: !!sd.max, ...r, successes: 0 };
        }
        if (sd.type === 'minions') {
            const r = resolveMinions(values, Number(sd.bonus ?? 0));
            return { type: 'minions', label, values, sides: Number(sd.sides), bonus: Number(sd.bonus ?? 0), ...r, successes: r.hits };
        }
        if (sd.type === 'levelhp') {
            const { kept } = pickDice(values, 1);
            return { type: 'levelhp', label, values, sides: Number(sd.sides), keptIndex: kept[0], total: values[kept[0]] ?? 0, successes: 0 };
        }
        if (sd.type === 'plain') {
            return { type: 'plain', label, values, sides: Number(sd.sides), bonus: Number(sd.bonus ?? 0),
                total: sumDice(values, Number(sd.bonus ?? 0)), note: sd.note ?? null, successes: 0 };
        }
        const sides = Number(sd.sides);
        const r = resolveAttack({
            base: values, sides, edge: clampEdge(sd.edge), chain: raw.groups[1]?.values ?? [], viciousPool: raw.groups[2]?.values ?? [],
            vicious: !!sd.vicious, canCrit: sd.canCrit !== false && !sd.special, canMiss: sd.canMiss !== false && !sd.special,
            opening: !!sd.opening, bonus: Number(sd.bonus ?? 0), special: !!sd.special,
        });
        return {
            type: 'attack', label, source: sd.source ?? null, sides, base: values, edge: clampEdge(sd.edge),
            specialDie: sd.special ?? null, damageType: sd.damageType ?? null, note: sd.note ?? null,
            canCrit: sd.canCrit !== false, ...r, successes: r.miss ? 0 : 1,
        };
    },

    // Une vague par lancer : les dés de base, puis chaque maillon de la chaîne de
    // critique avec son dé Féroce ; seuls les dés utilisés sont animés.
    buildAnimationSequence: (raw, ctx, result) => {
        if (D20_TYPES.includes(result.type)) {
            return { mode: 'single', groups: [{ id: result.type, diceType: 'd20', color: 'default', label: result.label, waves: [{ dice: result.values }] }] };
        }
        const sides = result.sides;
        const waves = [{ dice: result.type === 'attack' ? result.base : result.values }];
        if (result.type === 'attack') {
            result.chain.forEach((v, i) => waves.push({ dice: [v, ...(result.vicious[i] !== undefined ? [result.vicious[i]] : [])] }));
        }
        return { mode: 'single', groups: [{ id: result.type, diceType: `d${sides}`, color: 'default', label: result.label, waves }] };
    },

    renderHistoryEntry: (entry) => <NbHistoryEntry roll={entry} />,
    renderAllRollTypes: true,   // le slug rend aussi le jet libre (onglet, panneau, notifications)
};

// Niveaux des monstres du bestiaire, dans l'ordre (les fractions avant 1), pour le filtre
const LEVEL_TAGS = [...new Set(MONSTERS.filter(m => !m.minion).map(m => m.level))]
    .sort((a, b) => levelValue(a) - levelValue(b)).map(l => `Niv. ${l}`);

const nimbleConfig = {
    slug:  'nimble',
    label: 'Nimble',
    dice,

    // Rencontre : onglet PNJ de la plateforme (spec_pnj.md §8), monstres du bestiaire versés en base
    npc: {
        librarySide:  'left',
        tagGroups: [
            // Type et Niveau posés par la fiche (§11) ; un sbire n'a pas d'étiquette de niveau
            { label: 'Type',    tags: ['Sbire', 'Légendaire'], of: m => [m.minion ? 'Sbire' : null, m.legendary ? 'Légendaire' : null] },
            { label: 'Famille', tags: FAMILIES.map(f => f.name) },
            { label: 'Niveau',  tags: LEVEL_TAGS, of: m => (m.minion || !m.level ? null : `Niv. ${m.level}`), owns: t => t.startsWith('Niv. ') },
        ],
        hiddenTags:   ['Sbire', ...LEVEL_TAGS],   // déjà dits par le résumé de chaque ligne
        defaults:     () => ({ level: '1', size: 'medium', minion: false, legendary: false, hp: 10, hpPerHero: false, armor: null,
                               speed: null, saves: null, attacks: [], abilities: [], sections: [] }),
        summary:      (npc) => {
            const m = npc.systemData ?? {};
            return [m.minion ? 'Sbires' : `Niv. ${m.level}`, !m.minion && `${m.hp} PV${m.hpPerHero ? ' par héros' : ''}`, ARMOR_LABELS[m.armor]]
                .filter(Boolean).join(' · ');
        },
        isGroup:      (npc) => !!npc.systemData?.minion,
        initialState: (npc, { quantity, context } = {}) => monsterState(npc.systemData ?? {}, { quantity, heroes: context?.heroes ?? 1 }),
        isDown:       (instance) => isDown(monsterView(instance.sheet?.systemData ?? {}, instance.state, instance.name)),
        Form:         NbNpcForm,
        Sheet:        NbNpcSheet,
    },

    // Dés 3D : rouge héraldique, chiffres vélin, filet d'encre, tranche or (planche)
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#F8F2E6',   // vélin — chiffres
            background: '#9E2A22',   // rouge héraldique
            outline:    '#2B2826',   // encre
            edge:       '#B5832A',   // or
            texture:    '',
            material:   'glass',
        },
        lightColor:       '#E8C77A',
        strength:         5,
        gravity:          500,
        sounds:           true,
        animationEnabled: true,
    },

    // Initiative de la plateforme (spec_initiative.md §9.8, Q-32) : les héros jouent dans
    // l'ordre qui leur va, puis les monstres (camp après camp, sans alternance).
    initiative: {
        label: 'Combat',
        mode: 'sides',
        alternate: false,
        sides: { players: 'Héros', gm: 'Monstres' },
        // PV, ou membres encore debout pour un groupe de sbires
        npcWound: ({ state }) => {
            if (!state) return null;
            if (Number(state.hpMax) > 0) return woundFromRatio(Number(state.hp) / Number(state.hpMax));
            return Number(state.count) > 0 ? woundFromRatio(Number(state.alive) / Number(state.count)) : null;
        },
        // PV d'un monstre de la bibliothèque : par héros de la table (Q-44)
        npcContext: (characters) => ({ heroes: Math.max(1, characters.length) }),
    },
};

export default nimbleConfig;

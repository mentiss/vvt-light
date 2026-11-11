// src/client/src/systems/maledictum/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Configuration front du slug Imperium Maledictum : hooks de dés (contrat
// diceEngine v2). Règles de résolution : config/rules/dice.js
// (pur, testé). Spec : spec_maledictum.md §10.
// ⚠️ Module ES — importé uniquement par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '../../tools/diceEngine.js';
import MlHistoryEntry from './components/layout/MlHistoryEntry.jsx';
import { resolveTest, resolveAttack, resolvePower, applySlBonus, slBand, charsFromDice } from './config/rules/dice.js';
import { CHAR_KEYS, derived } from './config/rules/character.js';
import { woundFromRatio } from '../../tools/initiative.js';
import { lookupTable } from './config/rules/tables.js';
import { SETUP, available } from './config/setup.js';
import { BESTIARY } from './config/bestiary.js';
import { PATRON_FACTIONS } from './config/patron.js';
import { ROLE_LABELS, initialNpcState, isOut } from './config/rules/npc.js';
import MlNpcSheet from './components/npc/MlNpcSheet.jsx';
import MlNpcForm from './components/npc/MlNpcForm.jsx';

// ══════════════════════════════════════════════════════════════════════════════
// BLOC DÉS — contrat diceEngine v2
// ══════════════════════════════════════════════════════════════════════════════
// ctx.systemData.type :
//   'test'    → { target, edge, slBonus, difficulty, base, note }       d100 contre un seuil
//   'attack'  → { target, edge, slBonus, damage, opposedSl, opposedSkill, ranged, weapon, note }
//   'power'   → { target, edge, slBonus, warpRating, wilB, push, power, note }   d100 (+1d10 si Forcer)
//   'chargen' → {}                                                        2d10 + 20 × 9 (18 d10)
//   'd10'     → { bonus, tableKey, location }                            Maladresse, gravité de Blessure critique…
//   'table'   → { tableKey, bonus }                                            d100 sur une table (Mutations, Malignités, Phénomènes…)
// Tout résultat porte theme (thème de l'auteur) : l'historique le rend dans ce thème.

export const ROLL_TYPES = {
    test: 'maledictum_test', attack: 'maledictum_attack', power: 'maledictum_power',
    chargen: 'maledictum_chargen', d10: 'maledictum_d10', table: 'maledictum_table',
};

const D100_TYPES = ['test', 'attack', 'power', 'table'];

const dice = {

    buildNotation: (ctx) => {
        const sd = ctx.systemData ?? {};
        if (sd.type === 'chargen') return '18d10';
        if (sd.type === 'd10') return '1d10';
        if (sd.type === 'power' && sd.push) return ['1d100', '1d10'];
        if (D100_TYPES.includes(sd.type)) return '1d100';
        throw new RollError('NO_DICE', 'Type de jet inconnu.');
    },

    beforeRoll: (ctx) => ctx,

    afterRoll: (raw, ctx) => {
        const sd = ctx.systemData ?? {};
        const base = { type: sd.type, label: ctx.label ?? '', theme: sd.theme ?? null, note: sd.note ?? null };
        const values = raw.groups[0]?.values ?? [];

        if (sd.type === 'chargen') {
            return { ...base, values, chars: charsFromDice(values, CHAR_KEYS, SETUP.chars.base), successes: 0 };
        }
        if (sd.type === 'd10') {
            const value = values[0] ?? 0;
            const total = value + Number(sd.bonus ?? 0);
            return { ...base, values, bonus: Number(sd.bonus ?? 0), total, tableKey: sd.tableKey ?? null, location: sd.location ?? null,
                entry: sd.tableKey ? lookupTable(sd.tableKey, total, sd.location) : null, successes: 0 };
        }
        if (sd.type === 'table') {
            const value = values[0] ?? 0;
            const total = value + Number(sd.bonus ?? 0);
            return { ...base, values, bonus: Number(sd.bonus ?? 0), total, tableKey: sd.tableKey, entry: lookupTable(sd.tableKey, total), successes: 0 };
        }

        const roll = values[0];
        const common = { ...base, values, edge: Number(sd.edge ?? 0), difficulty: sd.difficulty ?? 0, baseValue: sd.base ?? null };
        if (sd.type === 'attack') {
            const r = resolveAttack({
                roll, target: sd.target, edge: sd.edge, damage: sd.damage, opposedSl: sd.opposedSl, opposedSkill: sd.opposedSkill, slBonus: sd.slBonus,
            });
            return { ...common, ...r, band: slBand(r.sl, r.success), ranged: !!sd.ranged, weapon: sd.weapon ?? null, successes: r.hit ? 1 : 0 };
        }
        if (sd.type === 'power') {
            const r = resolvePower({
                roll, target: sd.target, edge: sd.edge, warpRating: sd.warpRating, wilB: sd.wilB, push: !!sd.push,
                pushDie: raw.groups[1]?.values?.[0] ?? 0, slBonus: sd.slBonus,
            });
            return { ...common, ...r, band: slBand(r.sl, r.success), power: sd.power ?? null, successes: r.success ? 1 : 0 };
        }
        const r = applySlBonus(resolveTest(roll, sd.target, sd.edge), sd.slBonus);
        return { ...common, ...r, band: slBand(r.sl, r.success), successes: r.success ? 1 : 0 };
    },

    // d100 : un dé des dizaines et un d10 des unités (modèle Delta Green) ;
    // Forcer : le d10 de Charge Warp en second groupe ; création : 18 d10.
    buildAnimationSequence: (raw, ctx, result) => {
        if (result.type === 'chargen' || result.type === 'd10') {
            return { mode: 'single', groups: [{ id: result.type, diceType: 'd10', color: 'default', label: result.label, waves: [{ dice: result.values }] }] };
        }
        const v = result.values[0];
        const groups = [{ id: 'd100', diceType: '1d100+1d10', color: 'default', label: result.label, waves: [{ dice: [Math.floor(v / 10) * 10, v % 10] }] }];
        if (result.type === 'power' && result.push) {
            groups.push({ id: 'push', diceType: 'd10', color: 'default', label: 'Forcer', waves: [{ dice: [result.pushDie] }] });
        }
        return { mode: 'single', groups };
    },

    renderHistoryEntry: (entry) => <MlHistoryEntry roll={entry} />,
    renderAllRollTypes: true,   // le slug rend aussi le jet libre (onglet, panneau, notifications)
};

// Factions du bestiaire, dans l'ordre du livre, pour le filtre des PNJ (étiquettes versées par 10112026_npcs_maledictum.sql)
const FACTION_LABELS = Object.fromEntries(PATRON_FACTIONS.map(f => [f.key, f.label]));
const NPC_FACTIONS = [...new Set(available(BESTIARY).map(b => FACTION_LABELS[b.faction] ?? b.faction).filter(Boolean))];

const maledictumConfig = {
    slug:  'maledictum',
    label: 'Imperium Maledictum : Inquisition',
    dice,

    // PNJ (spec_pnj.md §8) : onglet Rencontre de l'interface MJ, partie système components/npc/
    npc: {
        librarySide:  'left',
        tagGroups: [
            { label: 'Rôle',    tags: Object.values(ROLE_LABELS) },
            { label: 'Faction', tags: NPC_FACTIONS },
        ],
        hiddenTags:   Object.values(ROLE_LABELS),   // déjà dit par le résumé de chaque ligne
        defaults:     () => ({ role: 'troop', chars: {}, armour: 0, wounds: 10, initiative: null, speed: 'normal', resolve: null, warpThreshold: null,
                               skills: {}, traits: [], attacks: [], powers: [], possessions: null }),
        summary:      (npc) => {
            const p = npc.systemData ?? {};
            return [ROLE_LABELS[p.role], `${p.wounds ?? 0} Blessures`, `Armure ${p.armour ?? 0}`].filter(Boolean).join(' · ');
        },
        initialState: () => initialNpcState(),
        isDown:       (instance) => isOut(instance.sheet?.systemData, instance.state),
        Form:         MlNpcForm,
        Sheet:        MlNpcSheet,
    },

    // Dés 3D : cire rouge et or terni (thème de l'Ordo Hereticus, planche validée)
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#F2E9D5',   // vélin — chiffres
            background: '#8C1A16',   // cire rouge
            outline:    '#1F1810',   // encre
            edge:       '#8A6A2B',   // or terni
            texture:    '',
            material:   'metal',
        },
        lightColor:       '#E8C77A',
        strength:         5,
        gravity:          500,
        sounds:           true,
        animationEnabled: true,
    },

    // Initiative de la plateforme (spec_initiative.md §9.8, §12) : ordre trié par l'initiative
    // statique (BPer + BAg + bonus, spec_maledictum : « le bloc combat de la plateforme ordonne ») ;
    // blessure d'un PNJ : Blessures encaissées, une Blessure critique la rend grave.
    initiative: {
        mode: 'order',
        characterInitiative: (character) => derived(character).initiative,
        npcInitiative: ({ sheet }) => (typeof sheet?.systemData?.initiative === 'number' ? sheet.systemData.initiative : null),
        npcWound: ({ sheet, state }) => {
            const sd = sheet?.systemData;
            if (isOut(sd, state)) return 'out';
            if (Number(state?.crits ?? 0) > 0) return 'severe';
            // Toutes les Blessures sans critique : encore debout (seul isOut met hors de combat)
            const max = Number(sd?.wounds ?? 0);
            const wound = max > 0 ? woundFromRatio(1 - Number(state?.wounds ?? 0) / max) : null;
            return wound === 'out' ? 'severe' : wound;
        },
    },
};

export default maledictumConfig;

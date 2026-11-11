// src/client/src/systems/dune/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Configuration CLIENT du système Dune: Adventures in the Imperium.
// Point d'entrée unique : métadonnées, hooks dés 2D20, dés 3D, PNJ.
// Module ES, importé uniquement par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import DuneHistoryEntry from "./components/layout/DuneHistoryEntry.jsx";
import {RollError} from "../../tools/diceEngine.js";
import { BASE_DICE, MAX_DICE, resolveRoll } from './config/rules/roll.js';
import { bestSkill, defaultNpcData, initialNpcState, rankLabel } from './config/rules/npc.js';
import { traitLabel } from './config/traits.js';
import DuneIcon from './components/ui/DuneIcon.jsx';
import { woundFromRatio } from '../../tools/initiative.js';
import { changeSessionResource } from '../../tools/sessionResources.js';
import DuneNpcSheet from './components/npc/DuneNpcSheet.jsx';
import DuneNpcForm from './components/npc/DuneNpcForm.jsx';
import DuneNpcRollWindow from './components/npc/DuneNpcRollWindow.jsx';
import { duneNpcPick } from './components/npc/duneNpcPick.js';

// ── Config système ─────────────────────────────────────────────────────────

const duneConfig = {
    slug:  'dune',
    label: 'Dune: Adventures in the Imperium',

    // PNJ : partie système de l'onglet PNJ de la plateforme (spec_pnj.md §6.4, §7)
    npc: {
        librarySide:  'left',
        // Étiquettes mises en tête du filtre de la bibliothèque (celles des fiches des livres)
        tagGroups: [
            { label: 'Rang',    tags: ['Mineur', 'Notable', 'Majeur'] },
            { label: 'Faction', tags: ['Atréides', 'Harkonnen', 'Corrino', 'Fremen', 'Bene Gesserit', 'Guilde spatiale', 'Bene Tleilax',
                                       'CHOM', 'Imperium', 'Contrebandiers', "Maison d'Amaranth", 'Maison Wayku'] },
            { label: 'Livre',   tags: ['Archétype', 'Harvesters of Dune', 'Agents of Dune'] },
        ],
        // Le rang est déjà dans le résumé de chaque ligne : filtrable, pas répété en étiquette
        hiddenTags: ['Mineur', 'Notable', 'Majeur'],
        defaults:     () => defaultNpcData(),
        summary:      (npc) => {
            const best = bestSkill(npc.systemData);
            return [rankLabel(npc.systemData?.rank), best && `${traitLabel(best.key)} ${best.rang}`].filter(Boolean).join(' · ');
        },
        initialState: () => initialNpcState(),
        isDown:       (instance) => !!instance.state?.defeated,
        Form:         DuneNpcForm,
        Sheet:        DuneNpcSheet,
        pick:         duneNpcPick,
        RollWindow:   DuneNpcRollWindow,
    },

    // Dés 3D : épice, chiffres sable, filet du pont (planche documentations/dune/planche_dune.html)
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#EAD8B6',   // sable lunaire : chiffres
            background: '#B4501A',   // épice
            outline:    '#1E140B',   // pont de vaisseau
            edge:       '#6E2E0E',   // épice brûlée
            texture:    '',
            material:   'glass',
        },
        lightColor:       '#E8792B',
        strength:         5,
        gravity:          500,
        sounds:           true,
        animationEnabled: true,
    },

    // Zone d'actions : icône de l'historique au trait du slug
    actionIcons: {
        history: <DuneIcon name="hourglass" />,
    },

    // ─── Hooks dés 2D20 ───────────────────────────────────────────────────
    dice: {

        // ── buildNotation ─────────────────────────────────────────────────────────
        // Appelé par le hook useDuneRoll AVANT roll().
        // Le dé de la Détermination n'est pas lancé : il est posé sur 1 (Q-1).
        buildNotation: (ctx) => {
            const { nbDes, useDetermination } = ctx.systemData;
            const rolled = nbDes - (useDetermination ? 1 : 0);
            if (!rolled || rolled < 1) throw new RollError('NO_DICE', 'Aucun dé à lancer');
            return `${rolled}d20`;
        },

        // ── beforeRoll ────────────────────────────────────────────────────────────
        // Validation cohérence dépenses.
        beforeRoll: (ctx) => {
            const { nbDes, impulsionsDepensees = 0, menaceGeneree = 0 } = ctx.systemData;

            if (nbDes < BASE_DICE || nbDes > MAX_DICE)
                throw new RollError('INVALID_DICE', `Nombre de dés invalide : ${nbDes} (min ${BASE_DICE}, max ${MAX_DICE})`);
            if (impulsionsDepensees + menaceGeneree !== nbDes - BASE_DICE)
                throw new RollError('RESOURCE_MISMATCH', 'Incohérence entre dés achetés et ressources dépensées');

            return ctx;
        },

        // ── afterRoll ─────────────────────────────────────────────────────────────
        // Résolution par config/rules/roll.js. Les anciens champs (results, succes,
        // reussite…) restent pour l'historique des jets d'avant la refonte ;
        // dice détaille chaque dé (forced = dé de la Détermination).
        afterRoll: (raw, ctx) => {
            const {
                rang, hasSpec, competenceRang,
                difficulte, useDetermination = false,
                impulsionsDepensees = 0, menaceGeneree = 0, selectedSpecialization = false,
            } = ctx.systemData;

            const specialisationThreshold = hasSpec && selectedSpecialization ? competenceRang : 0;
            const r = resolveRoll({
                values:     raw.groups[0].values,
                forcedOnes: useDetermination ? 1 : 0,
                threshold:  rang,
                specialisationThreshold,
                difficulty: difficulte,
            });

            return {
                results:             r.dice.map(d => d.value),
                dice:                r.dice,
                rang,
                specialisationThreshold,
                hasSpec:             !!hasSpec,
                selectedSpecialization,
                succes:              r.successes,
                complications:       r.complications,
                difficulte,
                reussite:            r.success,
                excedent:            r.excess,
                useDetermination:    !!useDetermination,
                impulsionsDepensees,
                menaceGeneree,
                label: ctx.label,
                // successes pour le moteur générique (persist)
                successes:           r.successes,
            };
        },

        // ── buildAnimationSequence ────────────────────────────────────────────────
        // Reçoit (raw, ctx, result) — 3e param ajouté.
        buildAnimationSequence: (raw, ctx) => ({
            mode: 'single',
            groups: raw.groups.map((g, i) => ({
                id:       `group-${i}`,
                diceType: 'd20',
                color:    'default',
                label:    ctx.label || `${g.values.length}d20`,
                waves:    [{ dice: g.values }], // toujours une seule vague, pas d'explosion en 2d20
            })),
        }),

        // ── renderHistoryEntry ────────────────────────────────────────────────────
        // Délègue au composant Dune-spécifique.
        renderHistoryEntry: (entry) => <DuneHistoryEntry roll={entry} />,
        renderAllRollTypes: true,   // le slug rend aussi le jet libre (onglet, panneau, notifications)
    },

    // Initiative de la plateforme (spec_initiative.md §9.8, §11) : conflit en alternance entre
    // camps ; garder la main une fois par tour et par camp, la main passant à un autre
    // personnage du camp (règle de table, Q-37, Q-38). Côté PJ : 2 Impulsion ou +2 Menace (Q-39) ;
    // côté adversaires : 2 Menace dépensés. Débit par la route des ressources de session (Q-43).
    initiative: {
        label: 'Conflit',
        mode: 'sides',
        keepInitiative: {
            players: [
                { label: '2 Impulsion', run: (ctx) => changeSessionResource(ctx, 'impulsions', -2, 'Impulsion') },
                { label: '+2 Menace',   run: (ctx) => changeSessionResource(ctx, 'menace', 2, 'Menace') },
            ],
            gm: { label: '2 Menace', run: (ctx) => changeSessionResource(ctx, 'menace', -2, 'Menace') },
        },
        // Défaite : vaincu, ou part du seuil de défaite (quand le MJ l'a fixé)
        npcWound: ({ state }) => {
            if (state?.defeated) return 'out';
            // Seuil atteint sans être vaincu (résistance possible) : encore debout, au plus grave
            const max = Number(state?.defeatMax ?? 0);
            const wound = max > 0 ? woundFromRatio(1 - Number(state?.defeat ?? 0) / max) : null;
            return wound === 'out' ? 'severe' : wound;
        },
    },
};

export default duneConfig;
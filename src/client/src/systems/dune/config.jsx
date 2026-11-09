// src/client/src/systems/dune/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Configuration CLIENT du système Dune: Adventures in the Imperium.
// Point d'entrée unique : métadonnées, hooks dés 2D20, dés 3D.
// Module ES, importé uniquement par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import DuneHistoryEntry from "./components/layout/DuneHistoryEntry.jsx";
import {RollError} from "../../tools/diceEngine.js";
import { BASE_DICE, MAX_DICE, resolveRoll } from './config/rules/roll.js';
import DuneIcon from './components/ui/DuneIcon.jsx';

// ── Config système ─────────────────────────────────────────────────────────

const duneConfig = {
    slug:  'dune',
    label: 'Dune: Adventures in the Imperium',

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
};

export default duneConfig;
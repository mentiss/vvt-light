// src/client/src/systems/fabula/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Barrel file — réexporte toute la configuration depuis ./config/*.
// Évite d'importer 15 fichiers différents dans Creation.jsx/Sheet.jsx/GMApp.jsx
// (pattern identique à Achtung! Cthulhu).
// Les hooks dés restent ici car ils dépendent de React (RollError) et du
// diceEngine — tout le reste est de la donnée pure dans config/.
// ⚠️  Module ES — uniquement importé par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '@/features/dice/tools/diceEngine.js';
import FabulaHistoryEntry from './components/layout/FabulaHistoryEntry.jsx';
import FuIcon from './components/ui/FuIcon.jsx';
import { resolveFabulaTest } from './config/rolls.js';
import { RANKS, SPECIES, npcDefaults, initialNpcState, isOut, rankLabel, turnsPerRound } from './config/npc.js';
import { woundFromRatio } from '@/features/initiative/tools/initiative.js';
import FuNpcSheet from './components/npc/FuNpcSheet.jsx';
import FuNpcForm from './components/npc/FuNpcForm.jsx';

export { CLASSES, CLASS_ORDER } from './config/classes.js';
export { SPELL_LISTS }          from './config/spells.js';
export { ARCANA_LISTS }         from './config/arcana.js';
export {
    applicableRollSkills, rollModifiers, resolveFabulaTest, parseSpellDamage, applyLuckyNumber, equippedWeapon,
} from './config/rolls.js';
export {
    computeDerivedStats, getAttributeAfflictions, effectiveAttrDie, classAtoutBonuses,
    attrAdjustable, adjustAttrBoost, skillRank, isInCrisis, arcanumFusionCost, nextArcanumState,
    equipItem, unequipItem, switchHand, isEquipped, isInHands,
    formatPrecision, formatDegats, formatDefense, formatDefenseMagique,
} from './config/utils.js';
export { EQUIPMENT_CATALOG, CATALOG_ORDER, CATEGORIES_ARMES, TYPES_DEGATS, ATTR_LABELS, catalogToItem } from './config/equipment.js';
export {
    PROJECT_POWERS, PROJECT_AREAS, PROJECT_USAGES, PROJECT_AMOUNTS, PROJECT_AMOUNT_LABELS,
    computeProject, projectAmount,
} from './config/projects.js';

// ══════════════════════════════════════════════════════════════════════════════
// BLOC DÉS — contrat diceEngine v2
// ══════════════════════════════════════════════════════════════════════════════
// Deux usages distincts, différenciés par ctx.systemData.type :
//   'test'     → Test d'Attribut classique (2 dés de tailles potentiellement
//                différentes, ex. d8+d10 — VH, critique, échec critique)
//   'economie' → Jet d'économies de départ (2d6 × 10 zenits, Étape 6 du wizard)

const dice = {

    // Dés 2D (spec_fabula.md §4) et gemmes par taille (§4.1) : d6 pierre, d8 émeraude,
    // d10 saphir, d12 topaze. Les réglages du joueur gardent le reste (texture…).
    renderer: '2d',
    byType: {
        d6:  { background: '#5E6E96', outline: '#2A3352', edge: '#D9E2F5', foreground: '#FFFFFF', material: 'glass' },
        d8:  { background: '#1F8E5C', outline: '#0B3B26', edge: '#9FF5C6', foreground: '#FFFFFF', material: 'glass' },
        d10: { background: '#2266C9', outline: '#0B2552', edge: '#A8E6FF', foreground: '#FFFFFF', material: 'glass' },
        d12: { background: '#C08A1E', outline: '#4A3006', edge: '#FFF0B8', foreground: '#FFFFFF', material: 'metal' },
    },

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
        // Compétences cochées dans la fenêtre de jet (spec_fabula.md §3.3) :
        // bonus au test, critique sur tout double (Frénésie), noms pour l'historique.
        // Les dégâts ajoutés (Adrénaline) sont déjà dans degatsBonus.
        const { bonus = 0, critAnyDouble = false, skills = [] } = ctx.systemData ?? {};
        const die1 = raw.groups[0].values[0];
        const die2 = raw.groups[1].values[0];
        const r = resolveFabulaTest({
            die1, die2, modifier, bonus, nd, critAnyDouble,
            degatsBonus: type === 'attaque' ? (degatsBonus ?? 0) : null,
        });

        const base = {
            type: type === 'attaque' ? 'attaque' : 'test',
            die1, die2, dieSize1, dieSize2,
            vh:              r.vh,
            modifier,
            bonus,
            total:           r.total,
            nd,
            criticalSuccess: r.criticalSuccess,
            criticalFailure: r.criticalFailure,
            critAnyDouble,
            success:         r.success,
            skills,
            label: ctx.label ?? (type === 'attaque' ? 'Attaque' : 'Test d\'Attribut'),
            successes: r.success === true ? 1 : 0,
        };

        if (type === 'attaque') {
            base.degatsBonus = degatsBonus ?? 0;
            base.degatsType  = degatsType ?? 'physique';
            base.degats      = r.degats;
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
    renderAllRollTypes: true,   // le slug rend aussi le jet libre (onglet, panneau, notifications)
};

const fabulaConfig = {
    slug:  'fabula',
    label: 'Fabula Ultima',
    dice,

    // PNJ (spec_pnj.md §10.5, §10.7) : onglet PNJ de l'interface MJ, partie système components/npc/
    npc: {
        librarySide:  'left',
        tagGroups:    [{ label: 'Rang', tags: [...Object.values(RANKS), 'Méchant'] }, { label: 'Espèce', tags: SPECIES }],
        hiddenTags:   [...Object.values(RANKS), ...SPECIES],   // déjà dits par le résumé de chaque ligne
        defaults:     npcDefaults,
        summary:      (npc) => {
            const sd = npc.systemData ?? {};
            return [`Niv. ${sd.level ?? '—'}`, sd.species, rankLabel(sd), `${sd.hp ?? 0} PV`].filter(Boolean).join(' · ');
        },
        initialState: (npc) => initialNpcState(npc.systemData),
        isDown:       (instance) => isOut(instance.state),
        Form:         FuNpcForm,
        Sheet:        FuNpcSheet,
    },

    // Zone d'actions : icônes au trait du slug (FuIcon)
    actionIcons: {
        history: <FuIcon name="scroll" />,
        music:   <FuIcon name="music" />,
        board:   <FuIcon name="map" />,
    },

    // Style par défaut des dés (lu par useDiceConfig) — aux couleurs des
    // fenêtres du thème (theme.css) : corps bleu nuit, contour or du curseur,
    // chiffres blancs, tranche ombre des fenêtres. Les gemmes par taille
    // viendront avec les dés 2D (spec_fabula.md §4.1).
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#FFFFFF', // chiffres blancs (--fu-win-text)
            background: '#2E3F98', // bleu des fenêtres (--fu-win-top)
            outline:    '#F2D27A', // or du curseur (--color-primary)
            edge:       '#070B2A', // ombre des fenêtres (--fu-win-shadow)
            texture:    '',
            material:   'plastic',
        },
        lightColor:       '#F2D27A',
        strength:         5,
        gravity:          500,
        sounds:           true,
        animationEnabled: true,
    },

    // Initiative de la plateforme (spec_initiative.md §7.7, §9.8) : conflit en alternance
    // stricte entre camps, sans « garder la main » ; le camp qui ouvre chaque round vient du
    // test d'initiative de groupe (choisi au lancement) ; Élite et Champion ont plusieurs tours.
    initiative: {
        label: 'Conflit',
        mode: 'sides',
        opening: 'choose',
        sides: { players: 'Héros', gm: 'Adversaires' },
        enemyOrder: true,   // règle optionnelle « initiative ennemie » (livre p. 63)
        npcInitiative: (instance) => (instance.sheet?.systemData?.init ?? null),
        npcActions: (instance) => turnsPerRound(instance.sheet?.systemData),
        npcWound: (instance) => {
            const max = Number(instance.sheet?.systemData?.hp ?? 0);
            return max > 0 ? woundFromRatio(Number(instance.state?.hp ?? max) / max) : null;
        },
    },
};

export default fabulaConfig;
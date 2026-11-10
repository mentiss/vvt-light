// src/client/src/systems/vikings/config.js
// ─────────────────────────────────────────────────────────────────────────────
// Configuration CLIENT du système Pure Vikings.
// Ce fichier est le point d'entrée unique pour tout ce qui est spécifique
// au système côté client : métadonnées, hooks de dés, (futurs) hooks de combat...
//
// ⚠️  Aucun lien avec src/server/systems/vikings/config.js (Node.js/CommonJS).
//     Ce fichier est un module ES, importé uniquement par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import {
    getExplosionThreshold,
    getBlessureMalus,
    getFatigueMalus,
    isFatigueKO,
    getSuccessThreshold,
    getBestCharacteristic,
    splitDiceWaves,
    isTripleTen,
    SAGA_MAX,
} from './config/rules.js';
import getTraitBonuses from './config/traitBonuses.js';
import { CARACNAMES }  from './config/competences.js';
import { RollError }   from '../../tools/diceEngine.js';

// Données et règles du slug (systems/vikings/config/), réexportées pour l'extérieur
export { CARACNAMES, COMPETENCES } from './config/competences.js';
export { TRAITS }                  from './config/traits.js';
export { RUNES, toRunes }          from './config/runes.js';
export { ITEMS }                   from './config/equipment.js';
export * from './config/rules.js';
export * from './config/creation.js';
export * from './config/utils.js';
import VikingsHistoryEntry from './components/layout/VikingsHistoryEntry.jsx';
import VkNpcSheet from './components/npc/VkNpcSheet.jsx';
import VkNpcForm from './components/npc/VkNpcForm.jsx';
import { npcDefaults, initialNpcState, isOut } from './config/npc.js';

// ─── Métadonnées système ──────────────────────────────────────────────────────

const vikingsConfig = {
    slug:  'vikings',
    label: 'Pure Vikings',

    // ─── Hooks dés ────────────────────────────────────────────────────────────
    dice: {
        // ── 1. buildNotation ─────────────────────────────────────────────────────
        // Appelé par DiceModal AVANT roll() pour construire la notation.
        // Retourne une string (1 groupe) ou un tableau (N groupes).
        //
        // Vikings :
        //   Normal    → "3d10!>=9>=7"           (1 groupe)
        //   SAGA H/E  → ["3d10!>=9>=7", "3d10!>=10>=7"]  (2 groupes, tout en 1 appel)
        //   Assurance → ["3d10!>=9>=7", "3d10!>=9>=7"]    (2 jets identiques)
        buildNotation: (ctx) => {
            const { pool, caracLevel, threshold, declaredMode } = ctx.systemData;
            const explodeMin = getExplosionThreshold(caracLevel)[0]; // niveau 3 → 9, etc.
            const mainGroup  = `${pool}d10!>=${explodeMin}>=${threshold}`;

            if (declaredMode === 'heroic' || declaredMode === 'epic') {
                // Groupe SAGA : 3d10, explosion fixe sur 10, seuil fixe 7
                return [mainGroup, '3d10!>=10>=7'];
            }
            if (declaredMode === 'insurance') {
                // Deux jets identiques — afterRoll garde le meilleur
                return [mainGroup, mainGroup];
            }
            return mainGroup;
        },

        // ── 2. beforeRoll ────────────────────────────────────────────────────────
        // Validation + enrichissement du ctx systemData.
        // Ne retourne RIEN de lié aux dés — ne calcule que les paramètres réutilisés
        // par buildNotation (déjà appelé avant) et afterRoll.
        beforeRoll: (ctx) => {
            const {
                tokensBlessure,
                sagaActuelle,
                declaredMode,
                rollType,
                selectedCarac,
                selectedSkill,
                isBerserk,
                autoSuccesses,
                activeConditionalBonuses,
                traitAutoBonus,
                tokensFatigue,
            } = ctx.systemData;

            // Garde : KO/Mourant
            if (tokensBlessure === 5)
                throw new RollError('KO_DYING', 'Impossible : KO / Mourant !');

            // Garde : inconscient de fatigue (10 tokens, D-2)
            if (isFatigueKO(tokensFatigue))
                throw new RollError('KO_FATIGUE', 'Impossible : inconscient (épuisement) !');

            // Garde : Saga insuffisante
            if ((declaredMode === 'insurance' || declaredMode === 'heroic' || declaredMode === 'epic')
                && sagaActuelle < 1)
                throw new RollError('NO_SAGA', 'Pas assez de points de Saga');

            // Calcul des paramètres
            const threshold      = rollType === 'skill' && selectedSkill
                ? getSuccessThreshold(selectedSkill.level)
                : 7;

            const caracUsedLevel = rollType === 'carac'
                ? (ctx.character?.[selectedCarac] || 2)
                : (selectedSkill ? getBestCharacteristic(ctx.character, selectedSkill).level : 2);

            const caracUsedName  = rollType === 'carac' ? selectedCarac
                : (selectedSkill ? getBestCharacteristic(ctx.character, selectedSkill).name : null);

            const blessureMalus  = isBerserk ? 0 : getBlessureMalus(tokensBlessure);
            const pool           = Math.max(1, 3 - blessureMalus);

            const rollTargetName = rollType === 'skill' ? selectedSkill?.name : null;
            const traitBonuses   = getTraitBonuses(ctx.character, caracUsedName, rollTargetName);
            const activeCondBonus = (activeConditionalBonuses || []).reduce((sum, b) => sum + b.bonus, 0);
            const totalTraitBonus = isBerserk
                ? (traitAutoBonus ?? traitBonuses.auto) + activeCondBonus + 2
                : (traitAutoBonus ?? traitBonuses.auto) + activeCondBonus;

            const fatigueMalus   = ctx.character?.traits?.some(t => t.name === 'Infatigable')
                ? 0
                : getFatigueMalus(tokensFatigue ?? 0);

            return {
                ...ctx,
                systemData: {
                    ...ctx.systemData,
                    pool,
                    threshold,
                    caracLevel: caracUsedLevel,
                    blessureMalus,
                    totalTraitBonus,
                    fatigueMalus,
                    autoSuccesses: autoSuccesses || 0,
                    // explosionThresholds gardé pour afterRoll
                    explosionThresholds: getExplosionThreshold(caracUsedLevel),
                },
            };
        },

        // ── 3. afterRoll ─────────────────────────────────────────────────────────
        // Interprète le raw (nouveau format : raw.groups[i].values).
        //
        // raw.groups[0] = jet principal
        // raw.groups[1] = jet SAGA bonus OU assurance (si notation tableau)
        afterRoll: (raw, ctx) => {
            const {
                pool,
                threshold,
                explosionThresholds,
                blessureMalus,
                totalTraitBonus,
                fatigueMalus,
                autoSuccesses,
                declaredMode,
                rollType,
                selectedSkill,
                selectedCarac,
                aimBonus,
                sagaActuelle,
            } = ctx.systemData;

            // Visée : +1 succès auto par action de visée, sans coût (C-5)
            const aim = aimBonus || 0;
            // Triple 10 : +1 SAGA si la réserve, après le jet, n'est pas déjà à 5 (D-15, L3-1)
            const tripleTenMeta = (values, spent, gained) => {
                const tripleTen = isTripleTen(values, explosionThresholds || [10], pool);
                const sagaAfter = (sagaActuelle ?? 0) - spent + gained;
                return { tripleTen, sagaGained: tripleTen && sagaAfter < SAGA_MAX ? 1 : 0, aimBonus: aim };
            };

            // Valeurs du jet principal (faces de dés uniquement, explosions incluses)
            const mainValues    = raw.groups[0].values;
            const exploded      = mainValues.filter(v => (explosionThresholds || [10]).some(t => v >= t));

            // Succès bruts du jet principal
            const rawMainSuccesses = mainValues.filter(v => v >= threshold).length;

            // ── Mode assurance ────────────────────────────────────────────────────
            if (declaredMode === 'insurance') {
                const values2    = raw.groups[1].values;
                const successes2 = values2.filter(v => v >= threshold).length;
                const keptGroup  = rawMainSuccesses >= successes2 ? 0 : 1;
                const keptValues = keptGroup === 0 ? mainValues : values2;
                const keptRaw    = keptGroup === 0 ? rawMainSuccesses : successes2;

                const totalSuccesses = Math.max(
                    0,
                    keptRaw + (autoSuccesses || 0) + (totalTraitBonus || 0) + aim - (fatigueMalus || 0)
                );

                const rollTarget = _buildRollTarget(rollType, selectedSkill, selectedCarac);

                return {
                    allDice:   raw.allDice,
                    successes: totalSuccesses,
                    total:     null,
                    flags:     { exploded, botched: false, critical: false },
                    detail: {
                        baseSuccesses:    keptRaw,
                        autoSuccesses:    autoSuccesses || 0,
                        traitBonus:       totalTraitBonus || 0,
                        fatigueMalus:     fatigueMalus || 0,
                        blessureMalus,
                        pool, threshold,
                        explosionThresholds: explosionThresholds || [10],
                        rollTarget, rollType,
                        caracUsed: rollType === 'carac' ? selectedCarac : null,
                        skillUsed: rollType === 'skill' ? selectedSkill : null,
                    },
                    meta: {
                        autoSuccesses:  autoSuccesses || 0,
                        resourceSpent:  1,
                        resourceGained: 0,
                        ...tripleTenMeta(keptValues, 1, 0),
                        keptGroup,
                        secondaryValues: keptGroup === 0 ? values2 : mainValues,
                        // SAGA fields
                        sagaFailed: false, sagaSuccess: null, bonusSuccesses: null,
                    },
                };
            }

            // ── Mode SAGA Héroïque / Épique ───────────────────────────────────────
            if (declaredMode === 'heroic' || declaredMode === 'epic') {
                const finalTarget   = declaredMode === 'heroic' ? 4 : 5;
                const sagaValues    = raw.groups[1].values;
                const sagaRaw       = sagaValues.filter(v => v >= 7).length;

                // Condition d'activation SAGA : 3+ succès, tout compris (dés, succès auto,
                // bonus de traits) ; la fatigue relève aussi cette barre (D-5, Q-4)
                const entrySuccesses = rawMainSuccesses + (autoSuccesses || 0) + (totalTraitBonus || 0) + aim - (fatigueMalus || 0);
                const sagaFailed    = entrySuccesses < 3;

                const bonusSuccesses = sagaFailed ? 0 : sagaRaw;
                const totalSuccesses = Math.max(
                    0,
                    rawMainSuccesses + bonusSuccesses
                    + (autoSuccesses || 0) + (totalTraitBonus || 0) + aim - (fatigueMalus || 0)
                );

                const sagaSuccess   = !sagaFailed && sagaRaw >= 1 && totalSuccesses >= finalTarget;
                const rollTarget    = _buildRollTarget(rollType, selectedSkill, selectedCarac);

                return {
                    allDice:   raw.allDice,
                    successes: totalSuccesses,
                    total:     null,
                    flags:     { exploded, botched: false, critical: false },
                    detail: {
                        baseSuccesses:    rawMainSuccesses,
                        autoSuccesses:    autoSuccesses || 0,
                        traitBonus:       totalTraitBonus || 0,
                        fatigueMalus:     fatigueMalus || 0,
                        blessureMalus,
                        pool, threshold,
                        explosionThresholds: explosionThresholds || [10],
                        rollTarget, rollType,
                        caracUsed: rollType === 'carac' ? selectedCarac : null,
                        skillUsed: rollType === 'skill' ? selectedSkill : null,
                    },
                    meta: {
                        autoSuccesses:  autoSuccesses || 0,
                        resourceSpent:  1,
                        resourceGained: sagaSuccess ? 1 : 0,
                        ...tripleTenMeta(mainValues, 1, sagaSuccess ? 1 : 0),
                        sagaFailed,
                        sagaSuccess,
                        bonusSuccesses,
                        sagaValues,
                        finalTarget,
                        failReason: sagaFailed
                            ? `Condition non remplie (${entrySuccesses}/3 succès)`
                            : !sagaRaw
                                ? 'Aucun succès sur le jet SAGA'
                                : totalSuccesses < finalTarget
                                    ? `Total insuffisant (${totalSuccesses}/${finalTarget})`
                                    : null,
                        // unused for insurance
                        keptGroup: null, secondaryValues: null,
                    },
                };
            }

            // ── Jet normal ────────────────────────────────────────────────────────
            const totalSuccesses = Math.max(
                0,
                rawMainSuccesses + (autoSuccesses || 0) + (totalTraitBonus || 0) + aim - (fatigueMalus || 0)
            );
            const rollTarget = _buildRollTarget(rollType, selectedSkill, selectedCarac);

            return {
                allDice:   raw.allDice,
                successes: totalSuccesses,
                total:     null,
                flags:     { exploded, botched: false, critical: false },
                detail: {
                    baseSuccesses:    rawMainSuccesses,
                    autoSuccesses:    autoSuccesses || 0,
                    traitBonus:       totalTraitBonus || 0,
                    fatigueMalus:     fatigueMalus || 0,
                    blessureMalus,
                    pool, threshold,
                    explosionThresholds: explosionThresholds || [10],
                    rollTarget, rollType,
                    caracUsed: rollType === 'carac' ? selectedCarac : null,
                    skillUsed: rollType === 'skill' ? selectedSkill : null,
                },
                meta: {
                    autoSuccesses:  autoSuccesses || 0,
                    resourceSpent:  0,
                    resourceGained: 0,
                    ...tripleTenMeta(mainValues, 0, 0),
                    sagaFailed: false, sagaSuccess: null, bonusSuccesses: null,
                    keptGroup: null, secondaryValues: null,
                },
            };
        },

        // ── 4. buildAnimationSequence ─────────────────────────────────────────────
        // Construit la structure AnimationSequence pour DiceAnimationOverlay.
        // Reçoit (raw, ctx, result) — 3e paramètre utilisé pour conditionner la SAGA.
        buildAnimationSequence: (raw, ctx, result) => {
            const { declaredMode, pool, explosionThresholds } = ctx.systemData;

            // Vagues d'explosion : rpg-dice-roller insère chaque dé explosé juste après
            // son dé d'origine, d'où splitDiceWaves (et non « les `pool` premiers dés »).
            const buildWaves = (values, _wavePool, thresholds) => splitDiceWaves(values, thresholds);

            if (declaredMode === 'insurance') {
                const keptGroup = result.meta?.keptGroup ?? 0;
                return {
                    mode: 'single',
                    groups: [
                        {
                            id:       'jet-1',
                            diceType: 'd10',
                            color:    'default',
                            label:    'Jet 1',
                            waves:    buildWaves(raw.groups[0].values, pool, explosionThresholds),
                        },
                        {
                            id:       'jet-2',
                            diceType: 'd10',
                            color:    'default',
                            label:    'Jet 2',
                            waves:    buildWaves(raw.groups[1].values, pool, explosionThresholds),
                        },
                    ],
                };
            }

            const groups = [{
                id:       'main',
                diceType: 'd10',
                color:    'default',
                label:    ctx.label || 'Jet',
                waves:    buildWaves(raw.groups[0].values, pool, explosionThresholds),
            }];

            if ((declaredMode === 'heroic' || declaredMode === 'epic') && !result.meta?.sagaFailed) {
                // Jet SAGA : toujours 3 dés, explosion fixe sur 10
                groups.push({
                    id:       'saga',
                    diceType: 'd10',
                    color:    'saga',
                    label:    `Jet ${declaredMode === 'epic' ? 'Épique' : 'Héroïque'} — SAGA`,
                    waves:    buildWaves(raw.groups[1].values, 3, [10]),
                });
            }

            return { mode: 'single', groups };
        },

        // ── 5. renderHistoryEntry ─────────────────────────────────────────────────
        // Rendu Vikings dans DiceHistoryPage (jets libres : rendu générique).
        renderHistoryEntry: (entry) => <VikingsHistoryEntry entry={entry} />,
        renderAllRollTypes: true,   // le slug rend aussi le jet libre (onglet, panneau, notifications)
    },

    // ─── PNJ (spec_pnj.md §10.2) : onglet PNJ de l'interface MJ, partie système components/npc/ ──
    npc: {
        librarySide:  'left',
        defaults:     npcDefaults,
        summary:      (npc) => {
            const sd = npc.systemData ?? {};
            const actions = sd.actions ?? 1;
            return `Armure ${sd.armure ?? 0} · Seuil ${sd.seuil ?? 1} · ${actions} action${actions > 1 ? 's' : ''}`;
        },
        initialState: (npc) => initialNpcState(npc.systemData),
        isDown:       (instance) => isOut(instance.sheet?.systemData, instance.state),
        Form:         VkNpcForm,
        Sheet:        VkNpcSheet,
    },
};

// ─── Helpers privés ───────────────────────────────────────────────────────────

function _buildLabel(ctx) {
    const { rollType, selectedCarac, selectedSkill } = ctx.systemData || {};
    if (rollType === 'skill' && selectedSkill) {
        const spec = selectedSkill.specialization ? ` (${selectedSkill.specialization})` : '';
        return `${selectedSkill.name}${spec}`;
    }
    if (rollType === 'carac' && selectedCarac) {
        return CARACNAMES[selectedCarac] || selectedCarac;
    }
    return 'Jet';
}

function _buildRollTarget(rollType, selectedSkill, selectedCarac) {
    if (rollType === 'skill') {
        return selectedSkill?.specialization
            ? `${selectedSkill.name} (${selectedSkill.specialization})`
            : (selectedSkill?.name ?? '');
    }
    return CARACNAMES[selectedCarac] || selectedCarac || '';
}

export default vikingsConfig;
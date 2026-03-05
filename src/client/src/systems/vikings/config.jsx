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
    getSuccessThreshold,
    getBestCharacteristic,
    countSuccesses,
} from '../../tools/utils.js';
import getTraitBonuses from '../../tools/traitBonuses.js';
import { CARACNAMES }  from '../../tools/data.js';
import { RollError }   from '../../tools/diceEngine.js';
import TokensDisplay   from './components/TokensDisplay.jsx';
import PostureModal    from './components/modals/PostureModal.jsx';
import DiceModal       from './components/modals/DiceModal.jsx';

// ─── Métadonnées système ──────────────────────────────────────────────────────

const vikingsConfig = {
    slug:  'vikings',
    label: 'Pure Vikings',

    // ─── Hooks dés ────────────────────────────────────────────────────────────
    // Injectés dans diceEngine.roll() / rollWithInsurance() / rollSagaBonus()
    dice: {

        // ── 1. buildNotation ─────────────────────────────────────────────────
        // Construit la notation rpg-dice-roller depuis le contexte.
        // Vikings : toujours 3d10, explosion selon niveau carac, seuil selon compétence.
        buildNotation: (ctx) => {
            const { pool, caracLevel, threshold } = ctx.systemData;
            const explodeMin = getExplosionThreshold(caracLevel)[0]; // ex: niveau 3 → 9
            // Ex: "3d10!>=9>=7" → 3 dés, explosion sur 9+, succès sur 7+
            return `${pool}d10!>=${explodeMin}>=${threshold}`;
        },

        // ── 2. beforeRoll ────────────────────────────────────────────────────
        // Validation et enrichissement du contexte AVANT le roll.
        // - Bloque si KO
        // - Bloque si Saga insuffisante pour le mode déclaré
        // - Applique le malus de blessure sur le pool
        // - Calcule les paramètres de dés depuis les données personnage
        beforeRoll: (ctx) => {
            const {
                caracLevel,
                skillLevel,
                tokensBlessure,
                tokensFatigue,
                isBerserk,
                sagaActuelle,
                declaredMode,
                rollType,
                selectedCarac,
                selectedSkill,
                autoSuccesses,
                activeConditionalBonuses,
                traitAutoBonus,
            } = ctx.systemData;

            // Garde : KO/Mourant
            if (tokensBlessure === 5)
                throw new RollError('KO_DYING', 'Impossible : KO / Mourant !');

            // Garde : Saga insuffisante pour les modes qui la consomment avant
            if ((declaredMode === 'insurance' || declaredMode === 'heroic' || declaredMode === 'epic')
                && sagaActuelle < 1)
                throw new RollError('NO_SAGA', 'Pas assez de points de Saga');

            // Calcul seuil de succès
            const threshold = rollType === 'skill' && selectedSkill
                ? getSuccessThreshold(selectedSkill.level)
                : 7; // seuil de base carac = 7

            // Calcul niveau d'explosion (depuis carac utilisée)
            const caracUsedLevel = rollType === 'carac'
                ? (ctx.character?.[selectedCarac] || 2)
                : (selectedSkill ? getBestCharacteristic(ctx.character, selectedSkill).level : 2);

            // Malus blessure (ignoré en mode berserk)
            const blessureMalus = isBerserk ? 0 : getBlessureMalus(tokensBlessure);
            const pool = Math.max(1, 3 - blessureMalus); // pool Viking toujours basé sur 3

            // Bonus traits auto + conditionnels
            const caracUsedName = rollType === 'carac' ? selectedCarac
                : (selectedSkill ? getBestCharacteristic(ctx.character, selectedSkill).name : null);
            const rollTarget = rollType === 'skill' ? selectedSkill?.name : null;
            const traitBonuses = getTraitBonuses(ctx.character, caracUsedName, rollTarget);
            const activeCondBonus = (activeConditionalBonuses || []).reduce((sum, b) => sum + b.bonus, 0);
            const totalTraitBonus = isBerserk
                ? (traitAutoBonus ?? traitBonuses.auto) + activeCondBonus + 2  // Berserk ajoute +2
                : (traitAutoBonus ?? traitBonuses.auto) + activeCondBonus;

            return {
                ...ctx,
                systemData: {
                    ...ctx.systemData,
                    // Paramètres calculés, utilisés par afterRoll et buildAnimationSequence
                    pool,
                    threshold,
                    caracLevel:     caracUsedLevel,
                    blessureMalus,
                    totalTraitBonus,
                    // Seuils d'explosion sous forme de tableau pour l'afterRoll
                    explosionThresholds: getExplosionThreshold(caracUsedLevel),
                    // Infatigable = pas de malus fatigue
                    fatigueMalus: ctx.character?.traits?.some(t => t.name === 'Infatigable')
                        ? 0
                        : getFatigueMalus(tokensFatigue),
                    autoSuccesses: autoSuccesses || 0,
                },
            };
        },

        // ── 3. afterRoll ─────────────────────────────────────────────────────
        // Interprète le résultat brut de rpg-dice-roller.
        // Ajoute succès auto, soustrait malus fatigue, marque les explosions.
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
            } = ctx.systemData;

            const baseSuccesses  = raw.successes ?? 0;
            const totalSuccesses = Math.max(
                0,
                baseSuccesses + (autoSuccesses || 0) + (totalTraitBonus || 0) - (fatigueMalus || 0)
            );

            // Libellé de la cible (pour historique)
            const rollTarget = rollType === 'skill'
                ? (selectedSkill?.specialization
                    ? `${selectedSkill.name} (${selectedSkill.specialization})`
                    : selectedSkill?.name)
                : CARACNAMES[selectedCarac] || selectedCarac;

            // Flags d'explosion (valeurs dans le seuil d'explosion)
            const exploded = raw.allDice.filter(v => (explosionThresholds || [10]).includes(v));

            return {
                // Données brutes
                notation:  ctx._notation || '',
                allDice:   raw.allDice,

                // Résultat interprété
                successes: totalSuccesses,
                total:     null, // système à succès, pas à somme

                // État ternaire — pas utilisé en Vikings mais structurellement présent
                outcome: null,

                // Flags
                flags: {
                    exploded,
                    botched:  false,
                    critical: false,
                },

                // Détail pour l'affichage UI
                detail: {
                    baseSuccesses,
                    autoSuccesses:   autoSuccesses || 0,
                    traitBonus:      totalTraitBonus || 0,
                    fatigueMalus:    fatigueMalus || 0,
                    blessureMalus,
                    pool,
                    threshold,
                    explosionThresholds: explosionThresholds || [10],
                    rollTarget,
                    rollType,
                    caracUsed:   rollType === 'carac' ? selectedCarac : null,
                    skillUsed:   rollType === 'skill' ? selectedSkill : null,
                },

                // Méta ressource (Saga)
                meta: {
                    autoSuccesses:  autoSuccesses || 0,
                    resourceSpent:  declaredMode === 'insurance' ? 1 : 0,
                    resourceGained: 0,
                    secondRoll:     null, // rempli par rollWithInsurance
                    keptRoll:       null,
                    // Champs bonus Saga (remplis par rollSagaBonus)
                    bonusRoll:      null,
                    bonusSuccesses: null,
                    sagaSuccess:    null,
                    failReason:     null,
                },
            };
        },

        // ── 4. buildAnimationSequence ─────────────────────────────────────────
        // Construit la structure AnimationSequence pour DiceAnimationOverlay.
        // Les vagues sont déjà calculées par diceEngine._buildWaves().
        buildAnimationSequence: (raw, ctx) => {
            const label = _buildLabel(ctx);
            return {
                mode: 'single',
                groups: [{
                    id:       'main',
                    diceType: 'd10',
                    color:    'default',
                    label,
                    waves:    raw.waves,
                }],
                insuranceData: null,
            };
        },
    },

    // ─── BLOC COMBAT ─────────────────────────────────────────────────────────────
    combat: {

        // ── Affichage santé ────────────────────────────────────────────────────
        renderHealthDisplay: (combatant) => <TokensDisplay combatant={combatant} />,

        // ── Actions slug ───────────────────────────────────────────────────────
        actions: [
            {
                id:    'posture-defensive',
                label: '🛡️ Posture Défensive',
                condition: (character, combatant) =>
                    combatant.actionsRemaining > 0 &&
                    !combatant.activeStates?.some(s => s.id === 'posture-defensive'),
                onAction: (ctx) => ctx.openModal('posture-defensive'),
                Modal:    PostureModal,
            },
            {
                id:    'berserk',
                label: '🔥 Berserk',
                condition: (character, combatant) =>
                    character.traits?.some(t => t.name === 'Berserk') &&
                    combatant.actionsRemaining > 0 &&
                    !combatant.activeStates?.some(s => s.id === 'berserk'),
                onAction: async (ctx) => {
                    try {
                        await ctx.fetchWithAuth(
                            `${ctx.apiBase}/combat/combatant/${ctx.combatant.id}`,
                            {
                                method: 'PUT',
                                body:   JSON.stringify({
                                    updates: {
                                        activeStates:     [...ctx.combatant.activeStates, { id: 'berserk', name: 'Berserk', data: { duration: 3 } }],
                                        actionsMax:       ctx.combatant.actionsMax + 2,
                                        actionsRemaining: ctx.combatant.actionsRemaining + 2,
                                    },
                                }),
                            }
                        );
                    } catch (err) {
                        console.error('[vikings] Berserk activation error:', err);
                    }
                },
            },
        ],

        // ── Flow d'attaque ─────────────────────────────────────────────────────
        attack: {
            condition: () => true,

            getWeapons: (character) => {
                const weapons = (character?.items || [])
                    .filter(i => i.location === 'equipped' && i.category === 'weapon')
                    .map(i => ({ id: i.id, nom: i.name, degats: parseInt(i.damage || 2) }));
                return weapons.length > 0 ? weapons : [{ id: 'fists', nom: 'Mains nues', degats: 1 }];
            },

            renderRollStep: (props) => (
                <DiceModal
                    character={props.character}
                    isBerserk={props.activeStates?.some(s => s.id === 'berserk')}
                    onClose={props.onClose}
                    onUpdate={() => {}}
                    sessionId={props.sessionId ?? null}
                    context={{
                        type: 'combat-attack',
                        onRollComplete: props.onRollComplete,          // onRollDone
                        proceedButton: props.rollResult ? {            // bouton visible après roll
                            label: '⚔️ Choisir la cible',
                            onClick: props.onProceed,
                        } : null,
                    }}
                />
            ),

            // Fallback multi-format : successes peut s'appeler différemment selon le contexte
            calculateDamage: (target, weapon, rollResult) => {
                const successes  = rollResult?.successes ?? rollResult?.totalSuccesses ?? rollResult?.baseSuccesses ?? 0;
                const baseSeuil  = target.healthData?.seuil  ?? target.seuil  ?? 1;
                const baseArmure = target.healthData?.armure ?? target.armure ?? 0;

                // Posture défensive
                const postureState  = target.activeStates?.find(s => s.id === 'posture-defensive');
                const postureBonus  = postureState?.data?.value ?? 0;

                // Berserk défensif (+1 seuil, +2 armure)
                const isBerserk         = target.activeStates?.some(s => s.id === 'berserk') ?? false;
                const berserkSeuilBonus = isBerserk ? 1 : 0;
                const berserkArmureBonus = isBerserk ? 2 : 0;

                const effectiveSeuil  = baseSeuil  + postureBonus  + berserkSeuilBonus;
                const effectiveArmure = baseArmure + berserkArmureBonus;

                const mr = Math.max(0, successes - effectiveSeuil);
                return Math.max(0, (weapon?.degats || 0) + mr - effectiveArmure);
            },

            renderTargetInfo: (combatant) => {
                const baseSeuil  = combatant.healthData?.seuil  ?? combatant.seuil  ?? '?';
                const baseArmure = combatant.healthData?.armure ?? combatant.armure ?? 0;

                const postureState   = combatant.activeStates?.find(s => s.id === 'posture-defensive');
                const postureBonus   = postureState?.data?.value ?? 0;
                const isBerserk      = combatant.activeStates?.some(s => s.id === 'berserk') ?? false;
                const berserkSeuilBonus  = isBerserk ? 1 : 0;
                const berserkArmureBonus = isBerserk ? 2 : 0;

                const effectiveSeuil  = Number(baseSeuil)  + postureBonus  + berserkSeuilBonus;
                const effectiveArmure = baseArmure + berserkArmureBonus;

                const bonuses = [];
                if (postureBonus > 0) bonuses.push(`🛡️+${postureBonus}`);
                if (isBerserk)        bonuses.push(`🔥Berserk`);
                const bonusStr = bonuses.length > 0 ? ` (${bonuses.join(', ')})` : '';

                return `Seuil ${effectiveSeuil}${bonusStr} | Armure ${effectiveArmure}`;
            },

            defenseOpportunity: null,

            getNPCRollContext: (npc, attack) => {
                // Pool de base = 3 dés, réduit par les blessures du NPC
                const malus     = getBlessureMalus(npc.healthData?.tokensBlessure ?? 0);
                const basePool  = 3;
                const pool      = Math.max(1, basePool + malus); // malus est négatif

                return {
                    characterId:   npc.id,
                    characterName: npc.name,
                    sessionId:     null,
                    systemSlug:    'vikings',
                    label:         attack.name ?? 'Attaque NPC',
                    systemData: {
                        // Pas de compétence ni de carac — valeurs directes depuis l'attaque
                        pool,
                        caracLevel:  null,
                        threshold:   attack.succes    ?? 6,
                        explosionThresholds: [attack.explosion ?? 10],
                        autoSuccesses: 0,
                        activeConditionalBonuses: [],
                        traitAutoBonus: 0,
                    },
                };
            },
        },

        renderNPCForm: (formData, onChange) => {
            const { attaques = [] } = formData;

            const addAttaque = () => onChange('attaques', [
                ...attaques,
                { name: 'Nouvelle attaque', succes: 6, explosion: 10, degats: 2 },
            ]);

            const removeAttaque = (i) => onChange('attaques', attaques.filter((_, idx) => idx !== i));

            const updateAttaque = (i, field, raw) => {
                const next = [...attaques];
                next[i] = { ...next[i], [field]: field === 'name' ? raw : parseInt(raw) || 0 };
                onChange('attaques', next);
            };

            return (
                <>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        <div>
                            <label className="block text-xs font-semibold text-viking-brown dark:text-viking-parchment mb-1">PV Max</label>
                            <input type="number" min="1" max="20"
                                   value={formData.blessureMax ?? 5}
                                   onChange={e => onChange('blessureMax', parseInt(e.target.value) || 1)}
                                   className="w-full px-2 py-1 border rounded text-sm text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-viking-brown dark:text-viking-parchment mb-1">Armure</label>
                            <input type="number" min="0" max="10"
                                   value={formData.armure ?? 0}
                                   onChange={e => onChange('armure', parseInt(e.target.value) || 0)}
                                   className="w-full px-2 py-1 border rounded text-sm text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-viking-brown dark:text-viking-parchment mb-1">Seuil</label>
                            <input type="number" min="1" max="10"
                                   value={formData.seuil ?? 1}
                                   onChange={e => onChange('seuil', parseInt(e.target.value) || 1)}
                                   className="w-full px-2 py-1 border rounded text-sm text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
                            />
                        </div>
                    </div>

                    <div className="mb-2">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-viking-brown dark:text-viking-parchment">Attaques</label>
                            <button type="button" onClick={addAttaque}
                                    className="px-2 py-1 bg-viking-bronze text-viking-brown rounded text-xs font-semibold hover:bg-viking-leather"
                            >+ Attaque</button>
                        </div>
                        {attaques.map((att, i) => (
                            <div key={i} className="p-2 border border-viking-bronze/40 rounded mb-2 bg-viking-parchment/50 dark:bg-gray-900/30">
                                <div className="flex gap-1 mb-1">
                                    <input type="text"
                                           value={att.name}
                                           onChange={e => updateAttaque(i, 'name', e.target.value)}
                                           placeholder="Nom attaque"
                                           className="flex-1 px-2 py-1 border rounded text-xs text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
                                    />
                                    {attaques.length > 1 && (
                                        <button type="button" onClick={() => removeAttaque(i)}
                                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                        >✕</button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                    <div>
                                        <label className="block text-xs text-viking-leather dark:text-viking-bronze mb-0.5">Succès</label>
                                        <input type="number" min="1" max="10"
                                               value={att.succes}
                                               onChange={e => updateAttaque(i, 'succes', e.target.value)}
                                               className="w-full px-1 py-1 border rounded text-xs text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-viking-leather dark:text-viking-bronze mb-0.5">Explosion</label>
                                        <input type="number" min="2" max="10"
                                               value={att.explosion}
                                               onChange={e => updateAttaque(i, 'explosion', e.target.value)}
                                               className="w-full px-1 py-1 border rounded text-xs text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-viking-leather dark:text-viking-bronze mb-0.5">Dégâts</label>
                                        <input type="number" min="0" max="20"
                                               value={att.degats}
                                               onChange={e => updateAttaque(i, 'degats', e.target.value)}
                                               className="w-full px-1 py-1 border rounded text-xs text-viking-brown dark:text-viking-parchment dark:bg-gray-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        {attaques.length === 0 && (
                            <div className="text-xs text-viking-leather dark:text-viking-bronze italic p-2 text-center">
                                Aucune attaque — cliquez sur "+ Attaque"
                            </div>
                        )}
                    </div>
                </>
            );
        },

        // ── Sérialise formData → combat_stats pour POST/PUT BDD ───────────────────────
        buildNPCCombatStats: (formData) => ({
            blessureMax: parseInt(formData.blessureMax) || 5,
            armure:      parseInt(formData.armure)      || 0,
            seuil:       parseInt(formData.seuil)       || 1,
            actionsMax:  parseInt(formData.actionsMax)  || 1,
            attaques:    formData.attaques ?? [{ name: 'Attaque', succes: 6, explosion: 10, degats: 2 }],
        }),

        // ── Désérialise combat_stats → formData (mode edit) ───────────────────────────
        parseNPCCombatStats: (combat_stats) => ({
            blessureMax: combat_stats?.blessureMax ?? 5,
            armure:      combat_stats?.armure      ?? 0,
            seuil:       combat_stats?.seuil       ?? 1,
            actionsMax:  combat_stats?.actionsMax  ?? 1,
            attaques:    combat_stats?.attaques    ?? [{ name: 'Attaque', succes: 6, explosion: 10, degats: 2 }],
        }),

        // ── Instancie le healthData runtime depuis combat_stats ───────────────────────
        buildNPCHealthData: (combat_stats) => ({
            tokensBlessure: 0,
            blessureMax:    combat_stats?.blessureMax ?? 5,
            armure:         combat_stats?.armure      ?? 0,
            seuil:          combat_stats?.seuil       ?? 1,
        }),

        // ── Callbacks lifecycle ────────────────────────────────────────────────
        onBeforeDamage: (ctx) => ctx.damage,

        onDamage: async (ctx) => {
            if (ctx.target.type !== 'player' || !ctx.target.characterId) return;
            try {
                const res      = await ctx.fetchWithAuth(`${ctx.apiBase}/characters/${ctx.target.characterId}`);
                const fullChar = await res.json();
                await ctx.fetchWithAuth(
                    `${ctx.apiBase}/characters/${ctx.target.characterId}`,
                    {
                        method: 'PUT',
                        body:   JSON.stringify({
                            ...fullChar,
                            tokensBlessure: ctx.newHealthData?.tokensBlessure ?? fullChar.tokensBlessure,
                        }),
                    }
                );
            } catch (err) {
                console.error('[vikings onDamage] Error persisting damage:', err);
            }
        },

        onDeath:          null,
        onStateChange:    null,
        onAfterStateChange: null,


        onStateNewRound: null,
        // Nettoyage à chaque nouveau tour (appelé côté client GM, puis POST /sync-states)
        // - Posture défensive expirée
        // - Berserk : durée décrémentée, contrecoup si expiré (fatigue +4, actions -2)
        onTurnStart: (currentCombatant, allCombatants) => {
            const c = currentCombatant;
            let activeStates = [...(c.activeStates ?? [])];
            let updates = {};

            // Retirer la posture défensive
            activeStates = activeStates.filter(s => s.id !== 'posture-defensive');

            // Décrémenter Berserk
            activeStates = activeStates.map(s =>
                s.id === 'berserk'
                    ? { ...s, data: { ...s.data, duration: (s.data?.duration ?? 1) - 1 } }
                    : s
            );

            // Expiration Berserk
            const expiredBerserk = activeStates.find(s => s.id === 'berserk' && (s.data?.duration ?? 1) <= 0);
            if (expiredBerserk) {
                activeStates = activeStates.filter(s => s.id !== 'berserk');
                updates = {
                    actionsMax:       Math.max(1, (c.actionsMax ?? 1) - 2),
                    actionsRemaining: Math.max(0, (c.actionsRemaining ?? 0) - 2),
                    healthData: {
                        ...c.healthData,
                        tokensFatigue: Math.min(9, (c.healthData?.tokensFatigue ?? 0) + 4),
                    },
                };
            }

            const hasChanges =
                activeStates.length !== (c.activeStates?.length ?? 0) ||
                Object.keys(updates).length > 0;

            if (!hasChanges) return allCombatants;

            return allCombatants.map(cc =>
                cc.id === c.id
                    ? { ...cc, activeStates, ...updates }
                    : cc
            );
        },
        canBurnAction: ({ combatant }) => combatant.actionsRemaining > 0,
        onBurnAction:  null,
    },
    // ─── Futurs blocs ─────────────────────────────────────

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

export default vikingsConfig;
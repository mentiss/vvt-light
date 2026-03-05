// src/client/src/components/gm/npc/NPCAttackModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal d'attaque NPC — entièrement générique via combatConfig.
//
// Machine à états : select → roll → rolled → target
//   select  — si npc.attaques.length > 1, sinon skip vers roll
//   roll    — bouton "Lancer" + checkbox broadcast
//   rolled  — résultat + bouton "Choisir la cible"
//   target  — TargetSelectionModal générique
//
// Jet de dés :
//   const ctx    = combatConfig.attack.getNPCRollContext(npc, selectedAttack)
//   const result = roll(ctx, combatConfig.dice)
//
// Props :
//   npc                — combattant NPC depuis combatState
//   combatState        — état combat complet
//   combatConfig       — config slug (attack.getNPCRollContext, attack.calculateDamage,
//                        attack.renderTargetInfo, dice)
//   onClose
//   onAttackSubmitted(attackData)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback } from 'react';
import { roll }                 from '../../../tools/diceEngine.js';
import DiceAnimationOverlay     from '../../shared/DiceAnimationOverlay.jsx';
import TargetSelectionModal     from '../../combat/TargetSelectionModal.jsx';
import { readDiceConfig }       from '../../modals/DiceConfigModal.jsx';
import { useFetch }             from '../../../hooks/useFetch.js';
import { useSystem }            from '../../../hooks/useSystem.js';

const NPCAttackModal = ({ npc, combatState, combatConfig, onClose, onAttackSubmitted }) => {
    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();

    // ── Attaque sélectionnée ──────────────────────────────────────────────────
    const attaques         = npc.attaques ?? [];
    const hasMultipleAttacks = attaques.length > 1;

    const [selectedAttack, setSelectedAttack] = useState(
        hasMultipleAttacks ? null : (attaques[0] ?? null)
    );

    // ── Machine à états ───────────────────────────────────────────────────────
    // select → roll → rolled → target
    const [step, setStep] = useState(hasMultipleAttacks ? 'select' : 'roll');

    // ── Dés ───────────────────────────────────────────────────────────────────
    const [rolling,       setRolling]       = useState(false);
    const [animationData, setAnimationData] = useState(null);
    const [rollResult,    setRollResult]    = useState(null);
    const [broadcast,     setBroadcast]     = useState(false);

    const pendingResultRef = useRef(null);

    // ─── Envoi historique optionnel ──────────────────────────────────────────

    const sendToHistory = useCallback(async (result, notation) => {
        try {
            await fetchWithAuth(`${apiBase}/dice/roll`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    character_id:   null,
                    character_name: npc.name,
                    session_id:     combatState?.sessionId ?? null,
                    notation,
                    roll_result: result,
                }),
            });
        } catch (err) {
            console.error('[NPCAttackModal] sendToHistory error:', err);
        }
    }, [fetchWithAuth, apiBase, npc.name, combatState?.sessionId]);

    // ─── Fin d'animation ────────────────────────────────────────────────────

    const handleAnimationComplete = useCallback(() => {
        const pending = pendingResultRef.current;
        if (!pending) return;
        pendingResultRef.current = null;

        setRollResult(pending.result);
        setAnimationData(null);
        setRolling(false);
        setStep('rolled');

        if (broadcast) {
            sendToHistory(pending.result, pending.notation);
        }
    }, [broadcast, sendToHistory]);

    const handleAnimationSkip = useCallback(() => {
        handleAnimationComplete();
    }, [handleAnimationComplete]);

    // ─── Lancer le dé ────────────────────────────────────────────────────────

    const handleRoll = () => {
        if (!selectedAttack || !combatConfig?.attack?.getNPCRollContext) return;

        setRolling(true);
        setRollResult(null);

        try {
            const ctx    = combatConfig.attack.getNPCRollContext(npc, selectedAttack);
            const engine = roll(ctx, combatConfig.dice);

            const { animationEnabled } = readDiceConfig();

            if (animationEnabled !== false && engine.animationSequence) {
                pendingResultRef.current = {
                    result:   engine.result,
                    notation: engine.notation,
                };
                setAnimationData({ animationSequence: engine.animationSequence });
            } else {
                setRollResult(engine.result);
                setRolling(false);
                setStep('rolled');
                if (broadcast) sendToHistory(engine.result, engine.notation);
            }
        } catch (err) {
            console.error('[NPCAttackModal] roll error:', err);
            setRolling(false);
        }
    };

    // ─── Sélection cible ─────────────────────────────────────────────────────

    const handleTargetConfirm = (target, finalDamage) => {
        onAttackSubmitted({
            attackerId:   npc.id,
            attackerName: npc.name,
            targetId:     target.id,
            targetName:   target.name,
            weapon:       {
                nom:    selectedAttack?.name  ?? 'Attaque',
                degats: selectedAttack?.degats ?? 0,
            },
            damage:     finalDamage,
            rollResult,
        });
        onClose();
    };

    // ─── Cibles disponibles (tous sauf le NPC attaquant) ─────────────────────

    const availableTargets = (combatState?.combatants ?? []).filter(
        c => c.id !== npc.id
    );

    // ─── Succès pour affichage ────────────────────────────────────────────────

    const successes = rollResult?.totalSuccesses
        ?? rollResult?.baseSuccesses
        ?? rollResult?.successes
        ?? 0;

    // ─────────────────────────────────────────────────────────────────────────
    // Rendu
    // ─────────────────────────────────────────────────────────────────────────

    // Overlay animation (prioritaire)
    if (animationData) {
        return (
            <DiceAnimationOverlay
                animationSequence={animationData.animationSequence}
                onComplete={handleAnimationComplete}
                onSkip={handleAnimationSkip}
            />
        );
    }

    // Modal cible
    if (step === 'target' && rollResult) {
        return (
            <TargetSelectionModal
                combatState={combatState}
                attacker={npc}
                selectedWeapon={{ nom: selectedAttack?.name ?? 'Attaque', degats: selectedAttack?.degats ?? 0 }}
                onWeaponChange={() => {}}
                calculateDamage={combatConfig?.attack?.calculateDamage}
                renderTargetInfo={combatConfig?.attack?.renderTargetInfo}
                rollResult={rollResult}
                allowDamageEdit={true}
                onConfirm={handleTargetConfirm}
                onClose={onClose}
            />
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-viking-brown rounded-lg shadow-2xl max-w-md w-full border-4 border-viking-bronze p-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-viking-brown dark:text-viking-parchment">
                        ⚔️ {npc.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-2xl text-viking-leather dark:text-viking-bronze hover:text-viking-danger"
                    >✕</button>
                </div>

                {/* ── STEP : select ─────────────────────────────────────── */}
                {step === 'select' && (
                    <>
                        <p className="text-sm text-viking-leather dark:text-viking-bronze mb-3">
                            Choisir l'attaque :
                        </p>
                        <div className="space-y-2 mb-4">
                            {attaques.map((attack, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setSelectedAttack(attack);
                                        setStep('roll');
                                    }}
                                    className="w-full p-3 rounded border-2 border-viking-bronze/50 text-left hover:border-viking-bronze hover:bg-viking-parchment/30 dark:hover:bg-gray-800/30 transition-colors"
                                >
                                    <div className="font-semibold text-viking-brown dark:text-viking-parchment text-sm">
                                        {attack.name}
                                    </div>
                                    <div className="text-xs text-viking-leather dark:text-viking-bronze mt-0.5">
                                        Seuil {attack.succes} · Expl. {attack.explosion} · {attack.degats} dég.
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-700 text-viking-brown dark:text-viking-parchment rounded font-semibold"
                        >Annuler</button>
                    </>
                )}

                {/* ── STEP : roll ───────────────────────────────────────── */}
                {step === 'roll' && selectedAttack && (
                    <>
                        <div className="mb-4 p-3 bg-viking-parchment/50 dark:bg-gray-800/50 rounded border border-viking-bronze/40">
                            <div className="font-semibold text-viking-brown dark:text-viking-parchment text-sm mb-1">
                                {selectedAttack.name}
                            </div>
                            <div className="text-xs text-viking-leather dark:text-viking-bronze">
                                Seuil {selectedAttack.succes} · Explosion {selectedAttack.explosion} · {selectedAttack.degats} dégâts
                            </div>
                        </div>

                        {/* Checkbox broadcast */}
                        <label className="flex items-center gap-2 mb-4 cursor-pointer text-sm text-viking-brown dark:text-viking-parchment">
                            <input
                                type="checkbox"
                                checked={broadcast}
                                onChange={e => setBroadcast(e.target.checked)}
                                className="rounded"
                            />
                            Diffuser dans l'historique
                        </label>

                        <div className="flex gap-2">
                            {hasMultipleAttacks && (
                                <button
                                    onClick={() => setStep('select')}
                                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-viking-brown dark:text-viking-parchment rounded font-semibold hover:bg-gray-400"
                                >← Retour</button>
                            )}
                            <button
                                onClick={handleRoll}
                                disabled={rolling}
                                className="flex-1 px-4 py-2 bg-viking-bronze text-viking-brown rounded font-semibold hover:bg-viking-leather disabled:opacity-60"
                            >
                                {rolling ? 'Jet en cours…' : '🎲 Lancer'}
                            </button>
                        </div>
                    </>
                )}

                {/* ── STEP : rolled ─────────────────────────────────────── */}
                {step === 'rolled' && rollResult && (
                    <>
                        <div className="mb-4 p-4 bg-viking-parchment/50 dark:bg-gray-800/50 rounded border-2 border-viking-bronze text-center">
                            <div className="text-3xl font-bold text-viking-brown dark:text-viking-parchment mb-1">
                                {successes}
                            </div>
                            <div className="text-sm text-viking-leather dark:text-viking-bronze">
                                succès
                            </div>
                            {rollResult.allDice?.length > 0 && (
                                <div className="flex justify-center gap-1 mt-2 flex-wrap">
                                    {rollResult.allDice.map((d, i) => (
                                        <span
                                            key={i}
                                            className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold border-2 ${
                                                d >= (selectedAttack?.explosion ?? 10)
                                                    ? 'border-yellow-400 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                                    : d >= (selectedAttack?.succes ?? 6)
                                                        ? 'border-green-400 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                        : 'border-gray-400 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}
                                        >{d}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => { setRollResult(null); setStep('roll'); }}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-viking-brown dark:text-viking-parchment rounded font-semibold hover:bg-gray-400"
                            >Relancer</button>
                            <button
                                onClick={() => setStep('target')}
                                className="flex-1 px-4 py-2 bg-viking-bronze text-viking-brown rounded font-semibold hover:bg-viking-leather"
                            >Choisir la cible →</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NPCAttackModal;
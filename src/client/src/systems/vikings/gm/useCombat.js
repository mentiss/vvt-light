// src/client/src/systems/vikings/gm/useCombat.js
// ─────────────────────────────────────────────────────────────────────────────
// État et handlers du combat MJ, déplacés TELS QUELS depuis l'ancien
// gm/GMView.jsx (lot 3a de la refonte : le système de combat est hors
// périmètre, aucun changement de comportement).
// Renvoie exactement les props attendues par gm/tabs/TabCombat.jsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useSocket } from '../../../context/SocketContext.jsx';
import { toSystemUrl, useFetch } from '../../../hooks/useFetch.js';
import { useSystem } from '../../../hooks/useSystem.js';
import vikingsConfig from '../config.jsx';

export function useCombat(onlineCharacters) {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();
    const socket        = useSocket();

    // --- State combat ---
    const [combatState, setCombatState] = useState({
        active: false,
        round: 0,
        currentTurnIndex: -1,
        combatants: []
    });

    // --- State modals combat ---
    const [showNPCModal, setShowNPCModal] = useState(false);
    const [attackingNPC, setAttackingNPC] = useState(null);
    const [showEndCombatConfirm, setShowEndCombatConfirm] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // =========================================
    // EFFECTS
    // =========================================

    // Charger état initial
    useEffect(() => {
        loadCombatState();
    }, []);

    // WebSocket listeners
    useEffect(() => {
        if (!socket) return;

        const handleCombatUpdate = (state) => setCombatState(state);

        socket.on('combat-update', handleCombatUpdate);

        return () => {
            socket.off('combat-update', handleCombatUpdate);
        };
    }, [socket]);

    // =========================================
    // LOADERS
    // =========================================

    const loadCombatState = async () => {
        try {
            const res = await fetch(toSystemUrl('/api/combat'));
            const data = await res.json();
            setCombatState(data);
        } catch (error) {
            console.error('Error loading combat state:', error);
        }
    };

    // =========================================
    // HANDLERS COMBAT
    // =========================================

    const startCombat = async () => {
        try {
            const res = await fetchWithAuth('/api/combat/start', { method: 'POST' });
            const data = await res.json();
            setCombatState(data);
        } catch (error) {
            console.error('Error starting combat:', error);
        }
    };

    const endCombat = async () => {
        try {
            const res = await fetchWithAuth('/api/combat/end', { method: 'POST' });
            const data = await res.json();
            setCombatState(data);
            setShowEndCombatConfirm(false);
        } catch (error) {
            console.error('Error ending combat:', error);
        }
    };

    const nextTurn = async () => {
        try {
            const res  = await fetchWithAuth('/api/combat/next-turn', { method: 'POST' });
            const data = await res.json();

            const currentCombatant = data.combatants[data.currentTurnIndex];

            let updatedCombatants = data.combatants;
            if (vikingsConfig.combat?.onTurnStart && currentCombatant) {
                updatedCombatants = vikingsConfig.combat.onTurnStart(
                    currentCombatant,
                    updatedCombatants
                );
            }

            const hasChanges = JSON.stringify(updatedCombatants) !== JSON.stringify(data.combatants);
            if (hasChanges) {
                await fetchWithAuth(`${apiBase}/combat/sync-states`, {
                    method: 'POST',
                    body:   JSON.stringify({ combatants: updatedCombatants }),
                });
            } else {
                setCombatState(data);
            }
        } catch (error) {
            console.error('Error next turn:', error);
        }
    };

    const addCombatant = async (combatantData) => {
        try {
            const res = await fetchWithAuth('/api/combat/combatant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ combatant: combatantData })
            });
            const data = await res.json();
            setCombatState(data);
        } catch (error) {
            console.error('Error adding combatant:', error);
        }
    };

    const updateCombatant = async (id, updates) => {
        try {
            const combatant = combatState.combatants.find(c => c.id === id);

            // Sync healthData → DB pour les joueurs (ajustements directs GM)
            if (combatant?.type === 'player' && combatant.characterId && updates.healthData) {
                const hd = { ...combatant.healthData, ...updates.healthData };
                if ('tokensBlessure' in updates.healthData || 'tokensFatigue' in updates.healthData) {
                    try {
                        const charRes  = await fetchWithAuth(`${apiBase}/characters/${combatant.characterId}`);
                        const fullChar = await charRes.json();
                        await fetchWithAuth(`${apiBase}/characters/${combatant.characterId}`, {
                            method: 'PUT',
                            body:   JSON.stringify({
                                ...fullChar,
                                tokensBlessure: hd.tokensBlessure ?? fullChar.tokensBlessure,
                                tokensFatigue:  hd.tokensFatigue  ?? fullChar.tokensFatigue,
                            }),
                        });
                    } catch (dbErr) {
                        console.error('[useCombat] Error syncing health to DB:', dbErr);
                    }
                }
            }

            await fetchWithAuth(`/api/combat/combatant/${id}`, {
                method: 'PUT',
                body:   JSON.stringify({ updates }),
            });
        } catch (error) {
            console.error('Error updating combatant:', error);
        }
    };

    const removeCombatant = async (id) => {
        try {
            const res = await fetchWithAuth(`/api/combat/combatant/${id}`, { method: 'DELETE' });
            const data = await res.json();
            setCombatState(data);
        } catch (error) {
            console.error('Error removing combatant:', error);
        }
    };

    const addPlayerToCombat = async (onlineChar) => {
        try {
            const res      = await fetchWithAuth(`/api/characters/${onlineChar.characterId}`);
            const fullChar = await res.json();

            const d1 = Math.floor(Math.random() * 10) + 1;
            const d2 = Math.floor(Math.random() * 10) + 1;
            const initiative     = d1 + d2 + (fullChar.agilite || 2);
            const initiativeRoll = `${d1} + ${d2} + ${fullChar.agilite || 2} = ${initiative}`;

            const playerCombatant = {
                type:        'player',
                characterId: fullChar.id,
                name:        onlineChar.name,
                actionsMax:  fullChar.actionsDisponibles || 1,
                initiative,
                initiativeRoll,
                // Structure générique healthData (opaque)
                healthData: {
                    tokensBlessure: fullChar.tokensBlessure || 0,
                    blessureMax:    5,
                    tokensFatigue:  fullChar.tokensFatigue  || 0,
                    armure:         fullChar.armure          || 0,
                    seuil:          fullChar.seuilCombat     || 1,
                },
                // Compatibilité descendante CombatantCard
                blessure:    fullChar.tokensBlessure || 0,
                blessureMax: 5,
                fatigue:     fullChar.tokensFatigue  || 0,
                armure:      fullChar.armure          || 0,
                seuil:       fullChar.seuilCombat     || 1,
            };

            await addCombatant(playerCombatant);
        } catch (error) {
            console.error('Error adding player to combat:', error);
        }
    };

    const reorderCombatants = async (newOrder) => {
        try {
            const res = await fetchWithAuth('/api/combat/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ combatants: newOrder })
            });
            const data = await res.json();
            setCombatState(data);
        } catch (error) {
            console.error('Error reordering:', error);
        }
    };

    const handleValidateAttack = async (attackId, modifiedAttack) => {
        try {
            const attack   = modifiedAttack ?? combatState.pendingAttacks.find(a => a.id === attackId);
            if (!attack) return;

            const attacker = combatState.combatants.find(c => c.id === attack.attackerId);
            const target   = combatState.combatants.find(c => c.id === attack.targetId);

            // 1. onBeforeDamage — peut modifier le montant final
            const finalDamage = vikingsConfig.combat?.onBeforeDamage?.({
                attacker, target,
                damage:     attack.damage,
                weapon:     attack.weapon,
                rollResult: attack.rollResult,
            }) ?? attack.damage;

            // 2. Construire le nouveau healthData de la cible
            const newHealthData = target ? {
                ...target.healthData,
                tokensBlessure: Math.min(
                    target.healthData?.blessureMax ?? 5,
                    (target.healthData?.tokensBlessure ?? 0) + finalDamage
                ),
            } : null;

            // 3. onDamage slug → persistance BDD
            if (vikingsConfig.combat?.onDamage) {
                await vikingsConfig.combat.onDamage({
                    attacker, target,
                    damage: finalDamage, weapon: attack.weapon,
                    rollResult: attack.rollResult, newHealthData,
                    fetchWithAuth, apiBase,
                });
            }

            // 4. Valider côté serveur
            await fetchWithAuth('/api/combat/validate-attack', {
                method: 'POST',
                body:   JSON.stringify({ attackId, targetId: target?.id, newHealthData }),
            });
        } catch (error) {
            console.error('Error validating attack:', error);
        }
    };

    const handleRejectAttack = async (attackId) => {
        try {
            await fetchWithAuth('/api/combat/reject-attack', {
                method: 'POST',
                body:   JSON.stringify({ attackId }),
            });
        } catch (error) {
            console.error('Error rejecting attack:', error);
        }
    };

    const handleNPCAttack = (npc) => setAttackingNPC(npc);

    const handleNPCAttackSubmitted = async (attackData) => {
        try {
            await fetchWithAuth('/api/combat/submit-attack', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attack: attackData })
            });

            const npc = combatState.combatants.find(c => c.id === attackData.attackerId);
            if (npc && npc.actionsRemaining > 0) {
                await updateCombatant(npc.id, {
                    actionsRemaining: npc.actionsRemaining - 1
                });
            }

            setAttackingNPC(null);
        } catch (error) {
            console.error('Error submitting NPC attack:', error);
        }
    };

    // =========================================
    // HANDLERS DRAG
    // =========================================

    const handleDragStart = (index) => setDraggedIndex(index);

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newCombatants = [...combatState.combatants];
        const draggedItem = newCombatants[draggedIndex];
        newCombatants.splice(draggedIndex, 1);
        newCombatants.splice(index, 0, draggedItem);

        setCombatState({ ...combatState, combatants: newCombatants });
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null) {
            reorderCombatants(combatState.combatants);
        }
        setDraggedIndex(null);
    };

    // Props de TabCombat, à l'identique de l'ancien GMView
    return {
        combatState,
        onlineCharacters,
        pendingAttacks:          combatState.pendingAttacks ?? [],
        combatConfig:            vikingsConfig.combat,
        onStartCombat:           startCombat,
        onNextTurn:              nextTurn,
        onEndCombat:             endCombat,
        onAddCombatant:          addCombatant,
        onUpdateCombatant:       updateCombatant,
        onRemoveCombatant:       removeCombatant,
        onAddPlayerToCombat:     addPlayerToCombat,
        onValidateAttack:        handleValidateAttack,
        onRejectAttack:          handleRejectAttack,
        onNPCAttack:             handleNPCAttack,
        attackingNPC,
        onNPCAttackSubmitted:    handleNPCAttackSubmitted,
        onCloseNPCAttack:        () => setAttackingNPC(null),
        onDragStart:             handleDragStart,
        onDragOver:              handleDragOver,
        onDragEnd:               handleDragEnd,
        showNPCModal,
        onShowNPCModal:          () => setShowNPCModal(true),
        onCloseNPCModal:         () => setShowNPCModal(false),
        showEndCombatConfirm,
        onShowEndCombatConfirm:  () => setShowEndCombatConfirm(true),
        onCloseEndCombatConfirm: () => setShowEndCombatConfirm(false),
    };
}

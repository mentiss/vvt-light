// src/client/src/systems/vikings/components/modals/PostureModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale posture défensive (action du système de combat, diceEngine async).
// Posture active : jet sur une compétence de combat au contact ; posture
// passive : sans jet. Logique inchangée ; habillage : planche du lot 4.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { getBestCharacteristic, getSuccessThreshold } from '../../config/rules.js';
import { formatSkillName } from '../../config/utils.js';
import { roll, RollError } from '../../../../tools/diceEngine.js';
import vikingsConfig       from '../../config.jsx';
import { useFetch }        from '../../../../hooks/useFetch.js';
import { useSystem }       from '../../../../hooks/useSystem.js';
import VkModal from '../ui/VkModal.jsx';
import VkIcon  from '../ui/VkIcon.jsx';

const PostureModal = ({
                          character,
                          combatant,
                          isBerserk = false,
                          onClose,
                          onActivatePosture, // (mode, successes) => void
                          sessionId = null,
                      }) => {
    const [rollResult, setRollResult] = useState(null);
    const [rolling,    setRolling]    = useState(false);
    const [error,      setError]      = useState(null);

    // Compétences défensives disponibles
    const defensiveSkills = (character.skills || []).filter(s =>
        ['Combat CàC (armé)', 'Combat CàC (non armé)'].includes(s.name) && s.level > 0
    );
    const [selectedSkill, setSelectedSkill] = useState(defensiveSkills[0] ?? null);

    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();

    const handleRollActif = useCallback(async () => {
        if (rolling || !selectedSkill) return;
        setRolling(true);
        setError(null);

        try {
            const caracLevel = getBestCharacteristic(character, selectedSkill).level;

            const ctx = {
                apiBase,
                fetchFn:       fetchWithAuth,
                characterId:   character.id,
                characterName: `${character.prenom}${character.surnom ? ` "${character.surnom}"` : ''}`,
                sessionId,
                rollType:      'vikings_posture',
                label:         'Posture Défensive Active',
                character,
                systemData: {
                    rollType:       'skill',
                    selectedCarac:  null,
                    selectedSkill,
                    autoSuccesses:  0,
                    activeConditionalBonuses: [],
                    traitAutoBonus: 0,
                    caracLevel,
                    threshold:      getSuccessThreshold(selectedSkill.level),
                    skillLevel:     selectedSkill.level,
                    tokensBlessure: combatant.healthData?.tokensBlessure ?? 0,
                    tokensFatigue:  combatant.healthData?.tokensFatigue  ?? 0,
                    isBerserk,
                    sagaActuelle:   character.sagaActuelle ?? 0,
                    declaredMode:   null,
                },
            };

            const notation = vikingsConfig.dice.buildNotation(ctx);
            // await : animation + persist inclus dans roll()
            const result   = await roll(notation, ctx, vikingsConfig.dice);
            setRollResult(result);

        } catch (err) {
            setError(err instanceof RollError ? err.message : 'Erreur lors du jet.');
            console.error('[PostureModal]', err);
        } finally {
            setRolling(false);
        }
    }, [rolling, selectedSkill, character, combatant, isBerserk, sessionId, apiBase, fetchWithAuth]);

    // ── Résultat ──────────────────────────────────────────────────────────────
    if (rollResult) {
        const successes = rollResult.successes ?? 0;
        const threshold = rollResult.detail?.threshold ?? 7;
        const expl      = rollResult.detail?.explosionThresholds ?? [10];
        return (
            <VkModal title="Posture défensive active" icon="shield" onClose={onClose} size="max-w-sm">
                <div className="text-center mb-4">
                    <div className="vk-title text-2xl mb-2">{successes} succès</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {(rollResult.allDice ?? []).map((v, i) => (
                            <span key={i} className={`vk-die ${expl.includes(v) ? 'is-explode' : v >= threshold ? 'is-success' : ''}`}>{v}</span>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button type="button" className="vk-btn flex-1" onClick={onClose}>Annuler</button>
                    <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={() => onActivatePosture('actif', successes)}>
                        <VkIcon name="check" />Activer ({successes})
                    </button>
                </div>
            </VkModal>
        );
    }

    // ── Formulaire ────────────────────────────────────────────────────────────
    return (
        <VkModal title="Posture défensive" icon="shield" onClose={onClose} size="max-w-sm">
            {error && <div className="vk-callout vk-callout-danger mb-3 text-sm">{error}</div>}

            {defensiveSkills.length > 1 && (
                <div className="mb-4">
                    <div className="vk-field-label">Compétence</div>
                    <div className="space-y-1">
                        {defensiveSkills.map(skill => (
                            <button key={`${skill.name}-${skill.specialization || ''}`} type="button" onClick={() => setSelectedSkill(skill)}
                                    className={`vk-pill w-full justify-between ${selectedSkill === skill ? 'is-selected' : ''}`}>
                                <span>{formatSkillName(skill)}</span><span className="vk-num">seuil {getSuccessThreshold(skill.level)}+</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!selectedSkill && <p className="text-sm text-muted italic mb-4">Aucune compétence de combat au contact.</p>}

            <div className="flex gap-2">
                <button type="button" className="vk-btn flex-1" onClick={() => onActivatePosture('passive', 0)}>Posture passive</button>
                <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={handleRollActif} disabled={rolling || !selectedSkill}>
                    <VkIcon name="die" />{rolling ? 'Jet…' : 'Lancer'}
                </button>
            </div>
        </VkModal>
    );
};

export default PostureModal;

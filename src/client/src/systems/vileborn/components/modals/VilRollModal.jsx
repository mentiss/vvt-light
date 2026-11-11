// src/client/src/systems/vileborn/components/modals/VilRollModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre de jet d'une approche (spec_vileborn.md §II.4) : difficulté en tête,
// Personnalité et Formation (grisées par honte et peur, avec la raison),
// « Explorer mon sombre héritage » (coche la case suivante, d12 dans le même
// jet, seuil affiché), lien (son niveau s'ajoute) et un modificateur libre.
// Le résultat s'affiche dans la fenêtre, au même rendu que l'historique.
//
// Props : character, approachKey, sessionId, onPatch, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { APPROACHES, ROLL_TYPES } from '../../config.jsx';
import { DIFFICULTIES, DEFAULT_DIFFICULTY, blockedByStates, buildTestContext, darkThreshold, poolSize, statePenalty, ordinal } from '../../config/rules/test.js';
import { displayName, exploreTicks } from '../../config/rules/character.js';
import { useVilRoll } from '../../hooks/useVilRoll.js';
import { VilPill, VilToggle } from '../ui/VilUi.jsx';
import VilHistoryEntry from '../layout/VilHistoryEntry.jsx';

const words = (c, kind) => (c.words ?? []).filter(w => w.kind === kind).map(w => w.label).join(', ');

const VilRollModal = ({ character: c, approachKey, sessionId, onPatch, onClose }) => {
    const approach = APPROACHES.find(a => a.key === approachKey);
    const die = c[approach.field] ?? 6;
    const blocked = blockedByStates(c);
    const { launch, rolling, error, entry } = useVilRoll();

    const [difficulty, setDifficulty] = useState(DEFAULT_DIFFICULTY);
    const [personality, setPersonality] = useState(false);
    const [training, setTraining] = useState(false);
    const [explore, setExplore] = useState(false);
    const [bondId, setBondId] = useState(null);
    const [modifier, setModifier] = useState(0);

    const bonds = c.bonds ?? [];
    const bondLevel = bonds.find(b => b.id === bondId)?.level ?? 0;
    const nextTicks = exploreTicks(c);
    const penalty = statePenalty(c, approachKey);
    const dice = poolSize({ personality: personality && !blocked.personality, training: training && !blocked.training });

    const roll = async () => {
        // Explorer : la case suivante se coche avant le jet (aucune au-delà de la 3ᵉ)
        if (explore && nextTicks !== (c.heritageTicks ?? 0)) onPatch({ heritageTicks: nextTicks });
        await launch({
            characterId: c.id, characterName: displayName(c), sessionId: sessionId ?? null,
            label: approach.label, rollType: ROLL_TYPES.test,
            systemData: { ...buildTestContext(c, { approach: approachKey, die, difficulty, personality, training, explore, modifier, bondLevel }, nextTicks) },
        });
        setExplore(false);
    };

    return (
        <Modal onClose={onClose} title={approach.label} subtitle={`d${die} · ${displayName(c)}`} size="md"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling} onClick={roll}>
                       {entry ? 'Relancer' : 'Lancer'} {dice}d{die}{explore ? ' + d12' : ''}
                   </button>
               </>}>
            <div className="vil-fields">
                <div className="vil-field-row">
                    <b>Difficulté</b>
                    <span className="vil-pills">
                        {DIFFICULTIES.map(d => (
                            <VilPill key={d.value} on={difficulty === d.value} onClick={() => setDifficulty(d.value)}>{d.label} {d.value}</VilPill>
                        ))}
                    </span>
                </div>
                <VilToggle on={personality && !blocked.personality} onChange={setPersonality} disabled={!!blocked.personality}
                           hint={blocked.personality ?? `+1 d${die}${words(c, 'personality') ? ` · ${words(c, 'personality')}` : ''}`}>
                    Personnalité s'applique
                </VilToggle>
                <VilToggle on={training && !blocked.training} onChange={setTraining} disabled={!!blocked.training}
                           hint={blocked.training ?? `+1 d${die}${words(c, 'training') ? ` · ${words(c, 'training')}` : ''}`}>
                    Formation s'applique
                </VilToggle>
                <VilToggle on={explore} onChange={setExplore}
                           hint={`${(c.heritageTicks ?? 0) < 3 ? `Coche la ${ordinal(nextTicks)} case` : 'Trois cases cochées'} · d12 · complication sur ${darkThreshold(nextTicks)}+`}>
                    Explorer mon sombre héritage
                </VilToggle>
                {bonds.length > 0 && (
                    <div className="vil-field-row">
                        <b>Lien</b>
                        <span className="vil-pills">
                            <VilPill on={bondId === null} onClick={() => setBondId(null)}>Aucun</VilPill>
                            {bonds.map(b => (
                                <VilPill key={b.id} on={bondId === b.id} onClick={() => setBondId(b.id)}>
                                    {b.name} {b.level > 0 ? '+1' : b.level < 0 ? '−1' : '0'}
                                </VilPill>
                            ))}
                        </span>
                    </div>
                )}
                <div className="vil-field-row">
                    <b>Modificateur</b>
                    <span className="vil-stepper">
                        <button type="button" onClick={() => setModifier(m => Math.max(-3, m - 1))} disabled={modifier <= -3} aria-label="Retirer">−</button>
                        <span>{modifier > 0 ? `+${modifier}` : modifier}</span>
                        <button type="button" onClick={() => setModifier(m => Math.min(3, m + 1))} disabled={modifier >= 3} aria-label="Ajouter">+</button>
                    </span>
                </div>
                {penalty < 0 && <p className="vil-effect">États : {penalty} déjà compté pour {approach.label}.</p>}
                {error && <div className="vil-todo vil-red">{error}</div>}
                {entry && <div className="vtt-history-entry"><VilHistoryEntry roll={entry} /></div>}
            </div>
        </Modal>
    );
};

export default VilRollModal;

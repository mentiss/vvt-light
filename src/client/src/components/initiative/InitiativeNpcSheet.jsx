// src/client/src/components/initiative/InitiativeNpcSheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche d'un PNJ de la table ouverte depuis la bande d'initiative (MJ, menu ⋯ « Voir la
// fiche », spec_initiative.md §12) : la partie système du slug (NpcSystem, bloc `npc`)
// avec son état à la table, modifiable (PV, blessures…), et ses jets (fenêtre du slug).
// Une modification passe par useNpcs : l'onglet PNJ et la blessure de la bande suivent.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import NpcSystem from '../npc/NpcSystem.jsx';
import NpcAvatar from '../npc/NpcAvatar.jsx';
import { useNpcs, NPC_ROLLS_OPTIONS } from '../../hooks/useNpcs.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { useSystem } from '../../hooks/useSystem.js';
import { tableScope } from '../../tools/browserStorage.js';

/**
 * @param {object}   props
 * @param {number}   props.sessionId
 * @param {number}   props.instanceId  id de la ligne session_npcs
 * @param {object}   props.config      bloc `npc` du config.jsx du slug
 * @param {Function} props.onClose
 */
const InitiativeNpcSheet = ({ sessionId, instanceId, config, onClose }) => {
    const { slug } = useSystem();
    const n = useNpcs(sessionId);
    const [rollPrefs] = usePersistedState(tableScope(slug, sessionId), 'npc-rolls', NPC_ROLLS_OPTIONS);
    const [rollRequest, setRollRequest] = useState(null);
    const instance = n.table.find(i => i.id === instanceId) ?? null;
    const RollWindow = config.RollWindow;

    return (
        <>
            <Modal onClose={onClose} size="lg" title={instance?.name ?? 'PNJ'} subtitle={instance?.sheet?.role ?? undefined}
                   icon={instance ? <NpcAvatar npc={instance.sheet ?? {}} /> : undefined} className="vtt-initiative-npc-sheet">
                {n.error && <p className="vtt-callout vtt-callout-danger">{n.error}</p>}
                {!instance ? (
                    <p className="vtt-npc-empty">{n.loading ? 'Chargement…' : 'Ce PNJ n\'est plus à la table.'}</p>
                ) : (
                    <NpcSystem npc={instance.sheet ?? {}} instance={instance} name={instance.name} config={config}
                               hiddenRolls={rollPrefs.hidden} sessionId={sessionId}
                               onStateChange={patch => n.patchTableNpc(instance.id, { state: { ...instance.state, ...patch } })}
                               onRoll={setRollRequest} />
                )}
            </Modal>
            {rollRequest && RollWindow && (
                <RollWindow request={rollRequest} hiddenRolls={rollPrefs.hidden} sessionId={sessionId} onClose={() => setRollRequest(null)} />
            )}
        </>
    );
};

export default InitiativeNpcSheet;

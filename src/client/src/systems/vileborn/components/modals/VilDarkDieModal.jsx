// src/client/src/systems/vileborn/components/modals/VilDarkDieModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dé d'obscurité du MJ (spec_vileborn.md §1.2, Q13) : un d12, avec un seuil de
// complication (faible 9+, moyenne 6+, puissante 3+, ou sans seuil quand la
// fiche du nuisible dit quoi faire), Public (historisé, diffusé) ou Caché (seul
// le MJ voit le résultat).
// Props : sessionId, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import { ROLL_TYPES } from '../../config.jsx';
import { DARK_INTENSITIES } from '../../config/rules/test.js';
import { useVilRoll } from '../../hooks/useVilRoll.js';
import { VilPill } from '../ui/VilUi.jsx';
import VilHistoryEntry from '../layout/VilHistoryEntry.jsx';

const VilDarkDieModal = ({ sessionId, onClose }) => {
    const { launch, rolling, error, entry } = useVilRoll();
    const [threshold, setThreshold] = useState(6);
    const [hidden, setHidden] = useState(false);

    const roll = () => launch({
        characterName: 'Obscurité', sessionId: sessionId ?? null, label: "Dé d'obscurité", rollType: ROLL_TYPES.dark,
        persistHistory: !hidden,   // caché : ni historisé ni diffusé
        systemData: { type: 'dark', threshold },
    });

    return (
        <Modal onClose={onClose} title="Dé d'obscurité" size="sm"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling} onClick={roll}>{entry ? 'Relancer' : 'Lancer'} le d12</button>
               </>}>
            <div className="vil-fields">
                <div>
                    <span className="vtt-field-label">Obscurité</span>
                    <div className="vil-pills">
                        {DARK_INTENSITIES.map(i => (
                            <VilPill key={i.key} on={threshold === i.threshold} onClick={() => setThreshold(i.threshold)}>{i.label} {i.threshold}+</VilPill>
                        ))}
                        <VilPill on={threshold === null} onClick={() => setThreshold(null)}>Sans seuil</VilPill>
                    </div>
                </div>
                <div>
                    <span className="vtt-field-label">Visibilité</span>
                    <div className="vil-pills">
                        <VilPill on={!hidden} onClick={() => setHidden(false)}>Public</VilPill>
                        <VilPill on={hidden} onClick={() => setHidden(true)}>Caché</VilPill>
                    </div>
                </div>
                {error && <div className="vil-todo vil-red">{error}</div>}
                {entry && <div className="vtt-history-entry"><VilHistoryEntry roll={entry} /></div>}
            </div>
        </Modal>
    );
};

export default VilDarkDieModal;

// src/client/src/systems/vileborn/components/modals/VilDarkDieModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dé d'obscurité du MJ (spec_vileborn.md §1.2, Q13) : un d12, avec un seuil de
// complication (faible 9+, moyenne 6+, puissante 3+, ou sans seuil quand la
// fiche du nuisible dit quoi faire), Public (historisé, diffusé) ou Caché (seul
// le MJ voit le résultat).
// Depuis un défi (spec_vileborn_defis.md §II.4) : seuil prérempli par la fiche,
// table du d12 affichée, ligne atteinte surlignée. Cette ligne reste chez le MJ :
// l'historique et la notification ne montrent que le d12 et le seuil.
// Props : sessionId, onClose, challenge? (fiche du défi)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { ROLL_TYPES } from '../../config.jsx';
import { DARK_INTENSITIES } from '../../config/rules/test.js';
import { darkRow } from '../../config/rules/challenge.js';
import { useVilRoll } from '../../hooks/useVilRoll.js';
import { VilPill, VilLabel } from '../ui/VilUi.jsx';
import VilHistoryEntry from '../layout/VilHistoryEntry.jsx';

const VilDarkDieModal = ({ sessionId, onClose, challenge = null }) => {
    const { launch, rolling, error, entry } = useVilRoll();
    const [threshold, setThreshold] = useState(challenge ? (challenge.dark?.threshold ?? null) : 6);
    const [hidden, setHidden] = useState(false);
    const value = entry?.roll_result?.value ?? null;
    const hit = challenge && value !== null ? darkRow(challenge, value) : null;

    const roll = () => launch({
        characterName: 'Obscurité', sessionId: sessionId ?? null,
        label: challenge ? `Dé d'obscurité · ${challenge.name}` : "Dé d'obscurité", rollType: ROLL_TYPES.dark,
        persistHistory: !hidden,   // caché : ni historisé ni diffusé
        systemData: { type: 'dark', threshold },
    });

    return (
        <Modal onClose={onClose} title={challenge ? `Dé d'obscurité · ${challenge.name}` : "Dé d'obscurité"} size={challenge ? 'md' : 'sm'}
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
                {challenge?.dark?.rows?.length > 0 && (
                    <div>
                        <VilLabel>Table du défi</VilLabel>
                        <div className="vil-ch-rows">
                            {challenge.dark.rows.map(r => (
                                <div key={`${r.min}-${r.text}`} className={`vil-ch-row${hit === r ? ' is-hit' : ''}`}>
                                    <span className="vil-ch-num">{r.min}+</span><span>{r.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {error && <div className="vil-todo vil-red">{error}</div>}
                {entry && <div className="vtt-history-entry"><VilHistoryEntry roll={entry} /></div>}
            </div>
        </Modal>
    );
};

export default VilDarkDieModal;

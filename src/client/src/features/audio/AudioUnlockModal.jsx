// src/client/src/features/audio/AudioUnlockModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// « Activer le son » (documentations/spec_audio.md Q-26) : les navigateurs ne
// jouent pas de son avant un clic dans la page. Affichée à l'arrivée sur une
// table dont la musique est activée, même sans morceau en cours.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import Modal from '@/ui/modal/Modal.jsx';

const AudioUnlockModal = ({ onUnlock, onLater }) => (
    <Modal
        title="Activer le son"
        subtitle="Musique et ambiances de la table"
        size="sm"
        onClose={onLater}
        className="vtt-audio-unlock"
        footer={(
            <>
                <button type="button" className="vtt-btn" onClick={onLater}>Plus tard</button>
                <button type="button" className="vtt-btn vtt-btn-primary" onClick={onUnlock}>Activer le son</button>
            </>
        )}
    >
        <p>Le MJ diffuse de la musique sur cette table. Votre navigateur attend un clic avant de jouer le moindre son.</p>
        <p className="text-sm text-muted mt-2">Vous pourrez l'activer plus tard depuis le lecteur, en bas à droite, et y régler vos volumes.</p>
    </Modal>
);

export default AudioUnlockModal;

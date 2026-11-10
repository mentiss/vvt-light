// src/client/src/systems/woddavampire/components/npc/VdaNpcRollWindow.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre de jet d'un PNJ (bloc npc.RollWindow, spec_pnj.md §6.8, §10.3) : la fenêtre
// du Conteur préremplie par la requête (vdaNpcPick.resolve ou une attaque de la fiche).
// Props (TabNpcs) : request { name, label, dice, difficulty, specialty, cannotBotch? }, hiddenRolls, sessionId, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import VdaGmDiceModal from '../modals/VdaGmDiceModal.jsx';

const VdaNpcRollWindow = ({ request, hiddenRolls, sessionId, onClose }) => (
    <VdaGmDiceModal sessionId={sessionId} onClose={onClose} name={request.name} label={request.label}
                    initial={request} hidden={hiddenRolls} />
);

export default VdaNpcRollWindow;

// src/client/src/systems/achtung/components/npc/AcNpcRollWindow.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre de jet d'un PNJ (bloc npc.RollWindow, spec_pnj.md §6.8, §10.4) : la fenêtre de jet MJ
// préremplie par la requête (acNpcPick.resolve).
// Props (TabNpcs) : request { name, label, target, skill, focus, difficulty, dice }, hiddenRolls, sessionId, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import GMDiceModal from '../../gm/modals/GMDiceModal.jsx';

const AcNpcRollWindow = ({ request, hiddenRolls, sessionId, onClose }) => (
    <GMDiceModal sessionId={sessionId} onClose={onClose} name={request.name} label={request.label}
                 initial={request} secret={hiddenRolls} />
);

export default AcNpcRollWindow;

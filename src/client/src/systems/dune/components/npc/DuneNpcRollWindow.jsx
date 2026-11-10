// src/client/src/systems/dune/components/npc/DuneNpcRollWindow.jsx
// Fenêtre de jet d'un PNJ de Dune (contrat `RollWindow` de l'onglet PNJ, spec_pnj.md §6.4) :
// « Jet du meneur » préremplie par la sélection ou un jet préparé (seuil, libellé,
// spécialisation possible), visibilité reprise du réglage « Jets des PNJ » de l'onglet.

import React from 'react';
import DuneGMRollModal from '../modals/DuneGMRollModal.jsx';

const DuneNpcRollWindow = ({ request, hiddenRolls, sessionId, onClose }) => (
    <DuneGMRollModal onClose={onClose} sessionId={sessionId} initialRang={request.rang} initialLabel={request.label}
                     npc={{ specialisation: request.specialisation, hidden: hiddenRolls }} />
);

export default DuneNpcRollWindow;

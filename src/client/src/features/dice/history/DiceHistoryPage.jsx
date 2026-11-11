// src/client/src/features/dice/history/DiceHistoryPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Historique des jets : la liste commune (DiceHistoryList), centrée.
// Le slug choisit d'en faire un onglet ; le rendu d'un jet est lu dans son
// config.jsx (dice.renderHistoryEntry, dice.renderAllRollTypes), une seule
// déclaration pour l'onglet, le panneau et les notifications
// (documentations/spec_ui_actions.md §6.4).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import DiceHistoryList from './DiceHistoryList.jsx';

/**
 * @param {object} props
 * @param {number|null} [props.sessionId] table : jets de cette table seulement
 */
const DiceHistoryPage = ({ sessionId = null }) => (
    <div className="max-w-2xl mx-auto">
        <DiceHistoryList sessionId={sessionId} />
    </div>
);

export default DiceHistoryPage;

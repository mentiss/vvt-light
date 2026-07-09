// src/client/src/systems/fabula/components/layout/FabulaHistoryEntry.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu riche des entrées d'historique — utilisé par renderHistoryEntry (config.jsx)
// ET par renderDiceToast (ToastNotifications, prop compact=true).
//
// Ne gère QUE roll_type === 'fabula_test' / 'fabula_economie' (ceux émis par
// FabulaDiceModal). Tout le reste (notamment les jets FreeDiceModal, roll_type
// générique) retourne null → l'appelant retombe sur son rendu générique.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

const parseResult = (entry) => {
    const raw = entry?.roll_result;
    if (!raw) return null;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
};

const FabulaHistoryEntry = ({ roll, compact = false }) => {
    const entry  = roll?.roll ?? roll;
    const result = parseResult(entry);
    const rollType = entry?.roll_type ?? '';

    if (!result || !['fabula_test', 'fabula_economie'].includes(rollType)) {
        return null; // rendu générique (couvre notamment les jets FreeDiceModal)
    }

    const label = result.label || entry?.notation || 'Jet';

    if (result.type === 'economie') {
        return (
            <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                <span className="fu-font-title text-accent">💰</span>
                <span className="flex-1">{label}</span>
                <span className="font-bold">{result.values?.join(' + ')} × 10 = {result.total} z</span>
            </div>
        );
    }

    // type === 'test'
    let badge = null;
    if (result.criticalSuccess) badge = { text: '★ Critique', cls: 'bg-success text-white' };
    else if (result.criticalFailure) badge = { text: '✕ Échec critique', cls: 'bg-danger text-white' };
    else if (result.success === true) badge = { text: 'Réussite', cls: 'bg-success/20 text-success' };
    else if (result.success === false) badge = { text: 'Échec', cls: 'bg-danger/20 text-danger' };

    return (
        <div className={`flex flex-col gap-1 ${compact ? 'text-xs' : 'text-sm'}`}>
            <div className="flex items-center gap-2">
                <span className="fu-font-title text-primary">🎲</span>
                <span className="flex-1 font-semibold">{label}</span>
                {badge && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${badge.cls}`}>
                        {badge.text}
                    </span>
                )}
            </div>
            <div className="text-muted flex items-center gap-2 flex-wrap">
                <span className="fu-die-badge bg-default border border-default text-[10px]">d{result.dieSize1}={result.die1}</span>
                <span>+</span>
                <span className="fu-die-badge bg-default border border-default text-[10px]">d{result.dieSize2}={result.die2}</span>
                {result.modifier ? <span>+ {result.modifier}</span> : null}
                <span>= <strong className="text-default">{result.total}</strong></span>
                <span className="italic">(VH {result.vh})</span>
                {result.nd != null && <span>vs ND {result.nd}</span>}
            </div>
        </div>
    );
};

export default FabulaHistoryEntry;
// src/client/src/systems/fabula/components/layout/FabulaHistoryEntry.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu riche des entrées d'historique — utilisé par renderHistoryEntry (config.jsx)
// ET par renderDiceToast (ToastNotifications) : même affichage dans les deux.
//
// Gère roll_type === 'fabula_test' / 'fabula_economie' (FabulaDiceModal) et le
// jet libre 'free_roll' (FreeDiceModal, appelants en renderAllRollTypes). Tout le
// reste retourne null → l'appelant retombe sur son rendu générique.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { parseFreeRoll } from '../../../../tools/freeRoll.js';

// Jet libre : libellé et total, dés par type
const FreeRollEntry = ({ free }) => (
    <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center gap-2">
            <span className="fu-font-title text-primary">🎲</span>
            <span className="flex-1 font-semibold">{free.label}</span>
            <span>= <strong className="text-default">{free.total}</strong></span>
        </div>
        <div className="text-muted flex items-center gap-2 flex-wrap">
            {free.groups.map((g, i) => (
                <span key={i} className="fu-die-badge bg-default border border-default text-[10px]">
                    {g.notation} = {g.values.join(' + ')}
                </span>
            ))}
            {free.modifier ? <span>{free.modifier > 0 ? '+' : '−'} {Math.abs(free.modifier)}</span> : null}
        </div>
    </div>
);

const parseResult = (entry) => {
    const raw = entry?.roll_result;
    if (!raw) return null;
    if (typeof raw === 'string') {
        try { return JSON.parse(raw); } catch { return null; }
    }
    return raw;
};

const FabulaHistoryEntry = ({ roll }) => {
    const entry  = roll?.roll ?? roll;
    const result = parseResult(entry);
    const rollType = entry?.roll_type ?? '';

    const free = parseFreeRoll(entry);
    if (free) return <FreeRollEntry free={free} />;

    if (!result || !['fabula_test', 'fabula_economie'].includes(rollType)) {
        return null; // rendu générique
    }

    const label = result.label || entry?.notation || 'Jet';

    if (result.type === 'economie') {
        return (
            <div className="flex items-center gap-2 text-sm">
                <span className="fu-font-title text-accent">💰</span>
                <span className="flex-1">{label}</span>
                <span className="font-bold">{result.values?.join(' + ')} × 10 = {result.total} z</span>
            </div>
        );
    }

    // type === 'test' ou 'attaque' — même jet de précision, l'attaque ajoute
    // juste une ligne Dégâts en dessous (VH + bonus arme, déjà calculé par
    // afterRoll). Fabula Ultima n'a pas de jet de dégâts séparé.
    const isAttaque = result.type === 'attaque';
    let badge = null;
    if (result.criticalSuccess) badge = { text: '★ Critique', cls: 'bg-success text-white' };
    else if (result.criticalFailure) badge = { text: '✕ Échec critique', cls: 'bg-danger text-white' };
    else if (result.success === true) badge = { text: 'Réussite', cls: 'bg-success/20 text-success' };
    else if (result.success === false) badge = { text: 'Échec', cls: 'bg-danger/20 text-danger' };

    return (
        <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2">
                <span className="fu-font-title text-primary">{isAttaque ? '⚔' : '🎲'}</span>
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
            {isAttaque && (
                <div className="flex items-center gap-1.5">
                    <span className="text-accent font-semibold">Dégâts : {result.degats}</span>
                    <span className="text-muted text-[10px]">({result.degatsType}, VH {result.vh} + {result.degatsBonus})</span>
                </div>
            )}
        </div>
    );
};

export default FabulaHistoryEntry;
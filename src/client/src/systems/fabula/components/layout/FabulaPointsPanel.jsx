// src/client/src/systems/fabula/components/layout/FabulaPointsPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Points Fabula — compacté (retour MJ) :
//   • Plus AUCUN plafond (la limite officielle de 6 de la spec §4.1 est
//     écartée par règle de table — supprimée aussi côté controller).
//     Compteur −/+ maison plutôt que Stepper : pas de max à afficher.
//   • Le rappel des règles est replié par défaut (<details>) — la section
//     retrouve une hauteur minimale, la colonne peut rétrécir (cf. FicheGrid).
// Le compteur fonctionne toujours hors mode édition, comme les autres
// ressources (persistance immédiate via onQuickUpdate).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

const FabulaPointsPanel = ({ character, onQuickUpdate }) => {
    const pf = character.pointsFabula ?? 0;
    const adjust = (delta) => onQuickUpdate({ pointsFabula: Math.max(0, pf + delta) });

    return (
        <div className="bg-surface border border-default rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h3 className="fu-font-title text-primary text-sm">Points Fabula</h3>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => adjust(-1)} disabled={pf <= 0}
                            className="w-6 h-6 rounded border border-default bg-default text-sm leading-none disabled:opacity-30 cursor-pointer">
                        −
                    </button>
                    <span className="fu-badge-fabula rounded-full px-2.5 py-0.5 text-sm font-bold min-w-[2rem] text-center">
                        {pf}
                    </span>
                    <button type="button" onClick={() => adjust(1)}
                            className="w-6 h-6 rounded border border-default bg-default text-sm leading-none cursor-pointer">
                        +
                    </button>
                </div>
            </div>

            <details className="text-xs text-muted">
                <summary className="cursor-pointer select-none">Rappel des règles</summary>
                <div className="flex flex-col gap-1 mt-1">
                    <p>+1 PF : jet en Fumble sur un Check.</p>
                    <p>+1 PF : un Méchant fait son entrée en scène.</p>
                    <p>+2 PF : réduit à 0 PV et vous vous rendez.</p>
                    <p>+1 PF (optionnel) : invoquer un trait/lien pour échouer.</p>
                    <div className="border-t border-default my-1" />
                    <p>−1 PF : altérer l'histoire.</p>
                    <p>−1 PF : invoquer un trait/lien pour relancer ou améliorer un Check.</p>
                </div>
            </details>
        </div>
    );
};

export default FabulaPointsPanel;
// src/client/src/systems/zoneblanche/components/layout/PrimeTimePanel.jsx
// Compteur Prime Time (fortune personnelle).
// Pas de plafond dur — jamais négatif. Action de jeu : toujours active,
// même hors mode édition (elle passe par patchImmediate).
//
// Props :
//   value    — valeur courante
//   onChange — (nouvelleValeur) → patchImmediate côté parent

import React from 'react';

const PrimeTimePanel = ({ value = 0, onChange }) => {
    const adjust = (delta) => onChange?.(Math.max(0, (value ?? 0) + delta));

    return (
        <section>
            <div className="zb-eyebrow mb-3">Prime Time</div>
            <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={() => adjust(-1)}
                        className="zb-btn-ghost w-10 h-10 rounded-sm font-bold text-lg"
                        disabled={(value ?? 0) <= 0}>−</button>

                <div className="zb-primetime-value zb-mono">{value ?? 0}</div>

                <button type="button" onClick={() => adjust(1)}
                        className="zb-btn-ghost w-10 h-10 rounded-sm font-bold text-lg">+</button>
            </div>
            <p className="text-xs text-muted mt-2">
                Relancer un d20 après le jet, ou garantir un 1 avant de lancer.
            </p>
        </section>
    );
};

export default PrimeTimePanel;
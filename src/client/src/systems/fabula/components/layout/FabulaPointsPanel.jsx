// src/client/src/systems/fabula/components/layout/FabulaPointsPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Points Fabula — section dédiée avec rappel des règles, fidèle à l'encart
// "FABULA POINTS" de la fiche officielle. Le compteur (steppers) fonctionne
// toujours hors mode édition, comme les autres ressources.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import Stepper from './Stepper.jsx';

const FabulaPointsPanel = ({ character, onQuickUpdate }) => {
    return (
        <div className="bg-surface border border-default rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h3 className="fu-font-title text-primary text-sm">Points Fabula</h3>
                <Stepper size="sm" value={character.pointsFabula} min={0} max={6}
                         onChange={(v) => onQuickUpdate({ pointsFabula: v })} />
            </div>

            <div className="text-xs text-muted flex flex-col gap-1">
                <p>+1 PF : jet en Fumble sur un Check.</p>
                <p>+1 PF : un Méchant fait son entrée en scène.</p>
                <p>+2 PF : réduit à 0 PV et vous vous rendez.</p>
                <p>+1 PF (optionnel) : invoquer un trait/lien pour échouer.</p>
                <div className="border-t border-default my-1" />
                <p>−1 PF : altérer l'histoire.</p>
                <p>−1 PF : invoquer un trait/lien pour relancer ou améliorer un Check.</p>
            </div>
        </div>
    );
};

export default FabulaPointsPanel;
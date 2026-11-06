// src/client/src/systems/fabula/components/ui/FuWorld.jsx
// Monde derrière les fenêtres (planche §1) : plaine du matin le jour, ciel étoilé
// et aurore la nuit, pétales ou cristaux qui montent. Purement décoratif, fixe,
// sous le contenu ; l'animation est coupée par theme.css si le système demande
// moins de mouvement. Monté à la racine de la fiche, de l'interface MJ et de la création.

import React from 'react';

// Positions et rythmes tirés une fois au chargement du module (jamais pendant un rendu)
const MOTES = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    petal: i % 2 === 1,
    style: {
        left: `${Math.random() * 100}vw`,
        animationDuration: `${14 + Math.random() * 16}s`,
        animationDelay: `${-Math.random() * 30}s`,
        '--fu-mote-scale': (0.6 + Math.random() * 0.8).toFixed(2),
    },
}));

const FuWorld = () => (
    <div className="fu-world" aria-hidden="true">
        <div className="fu-starfield" />
        <div className="fu-aurora" />
        {MOTES.map(m => <i key={m.id} className={`fu-mote${m.petal ? ' is-petal' : ''}`} style={m.style} />)}
    </div>
);

export default FuWorld;

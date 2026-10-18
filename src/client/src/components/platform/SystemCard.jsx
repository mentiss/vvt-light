// src/client/src/components/platform/SystemCard.jsx
// Carte de sélection d'un slug sur l'accueil : zone de marque (lien vers le slug)
// et bande générique en bas (adresse, lien MJ), qui ne recouvre jamais la marque.
// Liens en navigation complète : chaque slug démarre avec sa connexion et son thème.

import React from 'react';
import SystemBrand from './SystemBrand.jsx';

const SystemCard = ({ slug, label }) => (
    <div className="vtt-system-card">
        <a className="vtt-system-card-main" href={`/${slug}/`} aria-label={label}>
            <SystemBrand variant="card" slug={slug} label={label} />
        </a>
        <div className="vtt-system-card-foot">
            <code>/{slug}</code>
            <a className="vtt-system-card-gm" href={`/${slug}/gm`} title={`Interface MJ — ${label}`}>MJ</a>
        </div>
    </div>
);

export default SystemCard;

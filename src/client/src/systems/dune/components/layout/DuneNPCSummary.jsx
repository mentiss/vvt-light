// src/client/src/systems/dune/components/layout/DuneNPCSummary.jsx
// Résumé compact d'un PNJ Dune (carte de la bibliothèque de PNJ) :
// rangs des principes puis des compétences, abrégés ; spécialisation soulignée en épice.

import React from 'react';
import { traitLabel } from '../../config/traits.js';

const short = (key) => traitLabel(key).slice(0, 3);

const DuneNPCSummary = ({ npc }) => {
    const competences = npc.system_data?.competences ?? [];
    const principes   = npc.system_data?.principes ?? [];

    if (competences.length === 0 && principes.length === 0) return <span className="text-muted">Aucune compétence ou principe</span>;

    return (
        <span className="flex gap-2 flex-wrap dn-npc-summary">
            {principes.map(p => (
                <span key={p.key} title={p.maxime || traitLabel(p.key)}>
                    <span className="text-muted">{short(p.key)}</span> <b>{p.rang}</b>
                </span>
            ))}
            <span className="text-muted">|</span>
            {competences.map(c => (
                <span key={c.key} title={c.specialisation || traitLabel(c.key)}>
                    <span className="text-muted">{short(c.key)}</span> <b className={c.specialisation ? 'text-primary' : ''}>{c.rang}</b>
                </span>
            ))}
        </span>
    );
};

export default DuneNPCSummary;

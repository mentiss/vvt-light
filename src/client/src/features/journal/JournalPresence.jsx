// features/journal/JournalPresence.jsx
// Personnes présentes dans une entrée partagée (écriture à plusieurs, spec_journal.md §12) :
// une pastille à l'initiale et à la couleur de chacun, puis « X écrit… ». Rien si personne.
import React from 'react';

const JournalPresence = ({ peers }) => {
    if (!peers?.length) return null;
    const names = peers.map(p => p.name).join(', ');
    return (
        <span className="vtt-journal-presence" title={names}>
            {peers.map((p, i) => (
                // relecture: F-KEY — la présence n'a pas d'identifiant stable ; la liste est recalculée entière
                <span key={`${p.name}-${i}`} className="vtt-journal-avatar" style={{ '--vtt-journal-person': p.color }}>
                    {(p.name || '?').charAt(0).toUpperCase()}
                </span>
            ))}
            <span className="vtt-journal-writing">{peers.length > 1 ? `${names} écrivent…` : `${names} écrit…`}</span>
        </span>
    );
};

export default JournalPresence;

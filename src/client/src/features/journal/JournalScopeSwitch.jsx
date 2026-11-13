// features/journal/JournalScopeSwitch.jsx
// Bascule Privé / Partagé (spec_journal.md R-13, R-20), avec le compteur de chaque côté
// (non lus du MJ, nouveautés de la table). Classes vtt-segmented / vtt-segment de la plateforme.
import React from 'react';

const SCOPES = [{ key: 'private', label: 'Privé' }, { key: 'table', label: 'Partagé' }];

const JournalScopeSwitch = ({ scope, counts, onChange, tableTitle }) => (
    <div className="vtt-segmented vtt-journal-scope" role="tablist">
        {SCOPES.map(s => (
            <button key={s.key} type="button" role="tab" aria-selected={scope === s.key}
                    className={`vtt-segment${scope === s.key ? ' is-active' : ''}`} onClick={() => onChange(s.key)}
                    title={s.key === 'table' ? (tableTitle ?? 'Journal de la table') : 'Mon journal'}>
                <span className="vtt-journal-scope-label">{s.label}</span>
                {counts[s.key] > 0 && <span className="vtt-journal-count">{counts[s.key]}</span>}
            </button>
        ))}
    </div>
);

export default JournalScopeSwitch;

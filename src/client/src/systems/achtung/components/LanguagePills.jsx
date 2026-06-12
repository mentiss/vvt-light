// src/client/src/systems/achtung/components/LanguagePills.jsx
// Pills de langues — ajout texte libre, suppression.

import React, { useState } from 'react';

const LanguagePills = ({ languages = [], editMode, onChange }) => {
    const [input, setInput] = useState('');

    const add = () => {
        const val = input.trim();
        if (!val || languages.includes(val)) return;
        onChange?.([...languages, val]);
        setInput('');
    };

    const remove = (lang) => onChange?.(languages.filter(l => l !== lang));

    return (
        <div>
            <div className="ac-section-header">Languages</div>
            <div className="flex flex-wrap gap-1.5 mt-1">
                {languages.map(lang => (
                    <span key={lang} className="ac-pill">
                        {lang}
                        {editMode && (
                            <button className="ac-pill-remove" onClick={() => remove(lang)}>✕</button>
                        )}
                    </span>
                ))}
                {languages.length === 0 && !editMode && (
                    <span className="ac-text-muted">—</span>
                )}
                {editMode && (
                    <div className="flex gap-1 items-center">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && add()}
                            placeholder="Add language…"
                            className="ac-input"
                            style={{ width: 130, fontSize: '0.78rem' }}
                        />
                        <button onClick={add} className="ac-btn ac-btn-secondary" style={{ padding: '0.2rem 0.5rem' }}>+</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LanguagePills;
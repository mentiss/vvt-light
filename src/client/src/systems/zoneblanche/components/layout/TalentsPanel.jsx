// src/client/src/systems/zoneblanche/components/layout/TalentsPanel.jsx
// Talents du personnage — liste de référence pure.
// Aucune mécanique de fréquence n'est trackée par l'app (géré à table) :
// la fréquence figure dans le texte de la règle, rien de plus.
//
// Le catalogue est celui de l'archétype du personnage — on connaît toujours
// son archétype, donc pas de résolution globale par clé.
//
// Props :
//   char, editMode, set

import React from 'react';
import { TALENTS_CATALOG } from '../../config.jsx';

const TalentsPanel = ({ char, editMode, set }) => {
    const pool     = TALENTS_CATALOG[char?.archetype] ?? [];
    const selected = char?.talents ?? [];

    const toggle = (key) => {
        set('talents', selected.includes(key)
            ? selected.filter(k => k !== key)
            : [...selected, key]);
    };

    const owned = pool.filter(t => selected.includes(t.key));

    return (
        <section>
            <div className="flex items-center justify-between mb-3">
                <div className="zb-eyebrow">Talents</div>
                {editMode && <span className="zb-eyebrow">{selected.length} choisi{selected.length > 1 ? 's' : ''}</span>}
            </div>

            {/* Lecture : uniquement les talents possédés */}
            {!editMode && (
                <div className="space-y-3">
                    {owned.length === 0 && <p className="text-sm text-muted">Aucun talent.</p>}
                    {owned.map(t => (
                        <div key={t.key} className="zb-brief-card p-3 rounded-r-sm">
                            <div className="font-semibold text-default text-sm">{t.nom}</div>
                            <p className="text-xs text-muted mt-1 leading-relaxed">{t.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Édition : tout le pool de l'archétype, cliquable */}
            {editMode && (
                <div className="space-y-2">
                    {pool.length === 0 && (
                        <p className="text-sm text-muted">Aucun archétype défini — talents indisponibles.</p>
                    )}
                    {pool.map(t => (
                        <button key={t.key} type="button" onClick={() => toggle(t.key)}
                                className={`zb-card w-full p-3 rounded-r-sm ${selected.includes(t.key) ? 'is-selected' : ''}`}>
                            <div className="font-semibold text-sm">{t.nom}</div>
                            <p className="text-xs mt-1 leading-relaxed opacity-90">{t.description}</p>
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
};

export default TalentsPanel;
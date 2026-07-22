// src/client/src/systems/zoneblanche/components/layout/CompetencesCard.jsx
// Carte Compétences : rang + Focus affichés sous le rang (pills).
// Même position que la spécialisation dans SkillRow (Dune), mais en tags
// multiples : 2 sur la compétence majeure, 1 sur la mineure (à la création —
// rien n'est verrouillé ensuite, le MJ arbitre).
//
// Le clic sur le rang lance un jet — action de jeu, toujours active.
//
// Props :
//   char, editMode, set, onRoll(competenceKey)

import React, { useState } from 'react';
import { COMPETENCES, FOCUS_CATALOG } from '../../config.jsx';

const CompetenceRow = ({
                           competence, rang, focusList, editMode,
                           onRankChange, onAddFocus, onRemoveFocus, onRoll,
                       }) => {
    const [showCatalog, setShowCatalog] = useState(false);
    const [customFocus, setCustomFocus] = useState('');
    const options = FOCUS_CATALOG[competence.key] ?? [];

    const handleAddCustom = () => {
        const value = customFocus.trim();
        if (!value) return;
        onAddFocus(value);
        setCustomFocus('');
    };

    return (
        <div className="zb-stat-row">
            <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-default">{competence.label}</div>

                <div className="flex items-center gap-2 shrink-0">
                    {editMode && (
                        <button type="button" onClick={() => onRankChange(rang - 1)}
                                className="zb-btn-ghost w-8 h-8 rounded-sm font-bold" disabled={rang <= 0}>−</button>
                    )}

                    <button type="button" onClick={() => onRoll?.(competence.key)}
                            className="zb-rank" title={`Lancer un jet avec ${competence.label}`}>
                        {rang}
                    </button>

                    {editMode && (
                        <button type="button" onClick={() => onRankChange(rang + 1)}
                                className="zb-btn-ghost w-8 h-8 rounded-sm font-bold" disabled={rang >= 12}>+</button>
                    )}
                </div>
            </div>

            {/* Focus — sous le rang */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {focusList.length === 0 && !editMode && (
                    <span className="text-sm text-muted italic">Aucun focus.</span>
                )}

                {focusList.map(f => (
                    <span key={f.id ?? f.texte} className="zb-chip px-2.5 py-1 rounded-sm text-xs flex items-center gap-1.5">
                        {f.texte}
                        {editMode && (
                            <button type="button" onClick={() => onRemoveFocus(f)} title="Retirer">✕</button>
                        )}
                    </span>
                ))}

                {editMode && (
                    <button type="button" onClick={() => setShowCatalog(v => !v)}
                            className="zb-btn-ghost px-2.5 py-1 rounded-sm text-xs">
                        {showCatalog ? '− Fermer' : '+ Focus'}
                    </button>
                )}
            </div>

            {/* Catalogue de focus — édition seulement */}
            {editMode && showCatalog && (
                <div className="mt-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                        {options
                            .filter(o => !focusList.some(f => f.texte === o.nom))
                            .map(o => (
                                <button key={o.nom} type="button" onClick={() => onAddFocus(o.nom)}
                                        className="zb-pill px-3 py-2 rounded-sm text-xs" title={o.description}>
                                    <span className="font-semibold">{o.nom}</span>
                                </button>
                            ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            value={customFocus}
                            onChange={e => setCustomFocus(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom(); } }}
                            className="zb-input flex-1 px-3 py-2 rounded-sm text-xs"
                            placeholder="Focus sur mesure…"
                        />
                        <button type="button" onClick={handleAddCustom} className="zb-btn-ghost px-3 rounded-sm text-xs">
                            Ajouter
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CompetencesCard = ({ char, editMode, set, onRoll }) => {
    const competences = char?.competences ?? [];
    const focus       = char?.focus ?? [];
    const byKey       = Object.fromEntries(competences.map(c => [c.key, c]));

    const updateRang = (key, rang) => {
        set('competences', COMPETENCES.map(def => {
            const current = byKey[def.key] ?? { key: def.key, rang: 3 };
            return def.key === key
                ? { ...current, rang: Math.max(0, Math.min(12, rang)) }
                : current;
        }));
    };

    const addFocus = (competenceKey, texte) => {
        if (focus.some(f => f.competenceKey === competenceKey && f.texte === texte)) return;
        set('focus', [...focus, { competenceKey, texte }]);
    };

    const removeFocus = (target) => {
        set('focus', focus.filter(f => !(f.competenceKey === target.competenceKey && f.texte === target.texte)));
    };

    return (
        <section>
            <div className="zb-eyebrow mb-3">Compétences</div>
            <div className="space-y-3">
                {COMPETENCES.map(def => (
                    <CompetenceRow
                        key={def.key}
                        competence={def}
                        rang={byKey[def.key]?.rang ?? 3}
                        focusList={focus.filter(f => f.competenceKey === def.key)}
                        editMode={editMode}
                        onRankChange={val => updateRang(def.key, val)}
                        onAddFocus={texte => addFocus(def.key, texte)}
                        onRemoveFocus={f => removeFocus({ ...f, competenceKey: def.key })}
                        onRoll={onRoll}
                    />
                ))}
            </div>
        </section>
    );
};

export default CompetencesCard;
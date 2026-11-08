// src/client/src/systems/deltagreen/components/sheet/sections/InjuriesSection.jsx
import React from 'react';

const InjuriesSection = ({ char, editMode, set, onPatchImmediate }) => (
    <div>
        <p className="dg-section-label text-base mb-3 border-b border-default pb-1">
            15. BLESSURES ET MALADIES
        </p>

        {editMode ? (
            <textarea
                className="dg-field-input w-full px-2 py-1 text-sm min-h-[6rem] resize-y"
                value={char.injuries ?? ''}
                onChange={e => set('injuries', e.target.value)}
                placeholder="Blessures et maladies en cours…"
            />
        ) : (
            <div className="text-sm font-mono whitespace-pre-wrap min-h-[4rem] bg-surface p-2 border border-default/30">
                {char.injuries || <span className="text-muted italic">Aucune blessure.</span>}
            </div>
        )}

        {/* Checkbox premiers secours — patch immédiat */}
        <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
                type="checkbox"
                className="dg-checkbox"
                checked={!!char.firstAidApplied}
                onChange={e => onPatchImmediate({ firstAidApplied: e.target.checked })}
            />
            <span className="text-xs font-mono">
                Jet de Premiers secours appliqué depuis la dernière blessure ?{' '}
                {char.firstAidApplied && (
                    <span className="italic text-muted">
                        Oui : seuls la Médecine, la Chirurgie ou un repos prolongé aideront à se rétablir.
                    </span>
                )}
            </span>
        </label>
    </div>
);

export { InjuriesSection };

// ─────────────────────────────────────────────────────────────────────────────

// src/client/src/systems/deltagreen/components/sheet/sections/NotesSection.jsx
const NotesSection = ({ char, editMode, set }) => (
    <div className="">
        <div>
            <p className="dg-section-label text-base mb-2 border-b border-default pb-1">
                18. DÉTAILS PERSONNELS ET NOTES
            </p>
            {editMode ? (
                <textarea
                    className="dg-field-input w-full px-2 py-1 text-sm min-h-[8rem] resize-y"
                    value={char.personalNotes ?? ''}
                    onChange={e => set('personalNotes', e.target.value)}
                    placeholder="Détails personnels, notes libres…"
                />
            ) : (
                <div className="text-sm font-mono whitespace-pre-wrap min-h-[4rem] bg-surface p-2 border border-default/30">
                    {char.personalNotes || <span className="text-muted italic">—</span>}
                </div>
            )}
        </div>
        <hr className="dg-divider" />
        <div>
            <p className="dg-section-label text-base mb-2 border-b border-default pb-1">
                19. DÉVELOPPEMENTS AFFECTANT LE FOYER ET LA FAMILLE
            </p>
            {editMode ? (
                <textarea
                    className="dg-field-input w-full px-2 py-1 text-sm min-h-[8rem] resize-y"
                    value={char.familyDevelopments ?? ''}
                    onChange={e => set('familyDevelopments', e.target.value)}
                    placeholder="Développements familiaux…"
                />
            ) : (
                <div className="text-sm font-mono whitespace-pre-wrap min-h-[4rem] bg-surface p-2 border border-default/30">
                    {char.familyDevelopments || <span className="text-muted italic">—</span>}
                </div>
            )}
        </div>
    </div>
);

export { NotesSection };

// ─────────────────────────────────────────────────────────────────────────────

// src/client/src/systems/deltagreen/components/sheet/sections/SpecialTrainingSection.jsx
const SpecialTrainingSection = ({ char, editMode, set, onRoll }) => {
    const entries = char.specialTraining ?? [];

    const update = (index, field, value) => {
        const next = entries.map((e, i) => i === index ? { ...e, [field]: value } : e);
        set('specialTraining', next);
    };

    const add = () => set('specialTraining', [...entries, { intitule: '', carac_ou_competence: '' }]);
    const remove = (index) => set('specialTraining', entries.filter((_, i) => i !== index));

    const handleRoll = (entry) => {
        // Cherche le score dans les compétences ou caractéristiques du perso
        const CARAC_KEYS = { str: 1, con: 1, dex: 1, int: 1, pow: 1, cha: 1 };
        const key = entry.carac_ou_competence?.toLowerCase().replace(/\s+/g, '_');
        let score = 0;
        if (CARAC_KEYS[key]) {
            score = (char[key] ?? 10) * 5;
        } else {
            const skill = (char.skills ?? []).find(s => s.skillKey === key || s.specialty?.toLowerCase() === key);
            score = skill?.score ?? 0;
        }
        onRoll({ diceType: 'd100', targetScore: score, rollLabel: entry.intitule || entry.carac_ou_competence });
    };

    return (
        <div>
            <p className="dg-section-label text-base mb-3 border-b border-default pb-1">
                20. ENTRAÎNEMENT SPÉCIAL
            </p>

            <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-x-3 mb-1">
                <span/>
                <span className="dg-section-label">Intitulé</span>
                <span className="dg-section-label">Carac. ou compétence</span>
                <span/>
            </div>

            {entries.map((entry, i) => (
                <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-x-3 items-center border-b border-default/20 py-1">
                    <span className="text-xs text-muted font-mono">{i + 1}.</span>
                    {editMode ? (
                        <>
                            <input className="dg-field-input px-2 py-0.5 text-xs"
                                   value={entry.intitule ?? ''} placeholder="Intitulé"
                                   onChange={e => update(i, 'intitule', e.target.value)} />
                            <input className="dg-field-input px-2 py-0.5 text-xs"
                                   value={entry.carac_ou_competence ?? ''} placeholder="Ex: int, armes_feu"
                                   onChange={e => update(i, 'carac_ou_competence', e.target.value)} />
                            <button onClick={() => remove(i)} className="text-danger text-xs">✕</button>
                        </>
                    ) : (
                        <>
                            <span className="text-xs font-mono">{entry.intitule || '—'}</span>
                            <span className="text-xs font-mono text-muted">{entry.carac_ou_competence || '—'}</span>
                            {onRoll !== null && (
                                <button
                                    onClick={() => handleRoll(entry)}
                                    className="text-xs font-mono border border-default/40 px-1.5 py-0.5 hover:border-accent hover:text-accent">
                                    ⊕
                                </button>
                            )}
                        </>
                    )}
                </div>
            ))}

            {entries.length === 0 && !editMode && (
                <p className="text-sm text-muted font-mono italic">Aucun entraînement spécial.</p>
            )}

            {editMode && (
                <button onClick={add}
                        className="mt-2 text-xs font-mono border border-default px-3 py-1 hover:border-accent hover:text-accent transition-colors">
                    + Ajouter
                </button>
            )}
        </div>
    );
};

export { SpecialTrainingSection };

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports par défaut (pour les imports nommés dans Sheet.jsx)
export default InjuriesSection;
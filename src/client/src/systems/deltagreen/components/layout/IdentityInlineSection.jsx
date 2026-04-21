// src/client/src/systems/deltagreen/components/layout/IdentityInlineSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bandeau d'identité compact — affiché au-dessus de la grille principale.
// Layout :
//   [ AVATAR (2 lignes) ] [ Dénomination/Alias | Profession & rang ]
//                         [ Genre · Âge        | Employeur · Nationalité · Études ]
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

// ── Sous-composants niveau module ─────────────────────────────────────────────

const InlineField = ({ label, editMode, value, children }) => (
    <div className="min-w-0">
        <span className="dg-section-label text-[9px] block leading-tight">{label}</span>
        {editMode
            ? children
            : <span className="text-xs font-mono dg-form-line block truncate min-h-[1.2rem]">
                {value || '\u00A0'}
              </span>
        }
    </div>
);

// ── Composant ─────────────────────────────────────────────────────────────────

const IdentityInlineSection = ({ char, editMode, set, onAvatarClick }) => (
    <div
        className="grid gap-x-4 gap-y-1.5 items-center pb-3"
        style={{ gridTemplateColumns: 'auto 1fr 1fr', gridTemplateRows: 'auto auto' }}
    >
        {/* Avatar — couvre 2 lignes */}
        <div
            className="row-span-2 shrink-0 w-16 h-16 border border-default cursor-pointer overflow-hidden bg-surface-alt"
            onClick={onAvatarClick}
            title="Changer l'avatar"
        >
            {char.avatar
                ? <img src={char.avatar} alt="Avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-muted text-2xl">☰</div>
            }
        </div>

        {/* ── Ligne 1 ─────────────────────────────────────────────────────── */}

        {/* Dénomination / Alias */}
        <InlineField
            label="1. Dénomination / Alias"
            editMode={editMode}
            value={`${char.nom ?? ''} ${char.prenom ?? ''}${char.alias ? ` / ${char.alias}` : ''}`.trim()}
        >
            <div className="flex gap-1">
                <input
                    className="dg-field-input px-1.5 py-0.5 text-xs flex-1 min-w-0"
                    placeholder="Nom"
                    value={char.nom ?? ''}
                    onChange={e => set('nom', e.target.value)}
                />
                <input
                    className="dg-field-input px-1.5 py-0.5 text-xs flex-1 min-w-0"
                    placeholder="Prénom"
                    value={char.prenom ?? ''}
                    onChange={e => set('prenom', e.target.value)}
                />
                <input
                    className="dg-field-input px-1.5 py-0.5 text-xs w-24 min-w-0"
                    placeholder="Alias"
                    value={char.alias ?? ''}
                    onChange={e => set('alias', e.target.value)}
                />
            </div>
        </InlineField>

        {/* Profession & rang */}
        <InlineField
            label="2. Profession & rang"
            editMode={editMode}
            value={char.profession}
        >
            <input
                className="dg-field-input px-1.5 py-0.5 text-xs w-full"
                value={char.profession ?? ''}
                onChange={e => set('profession', e.target.value)}
            />
        </InlineField>

        {/* ── Ligne 2 ─────────────────────────────────────────────────────── */}

        {/* Genre · Âge */}
        <div className="flex gap-3 min-w-0">
            <InlineField
                label="5. Genre"
                editMode={editMode}
                value={char.sexe}
            >
                <input
                    className="dg-field-input px-1.5 py-0.5 text-xs w-20"
                    value={char.sexe ?? ''}
                    onChange={e => set('sexe', e.target.value)}
                />
            </InlineField>

            <InlineField
                label="6. Âge / DoB"
                editMode={editMode}
                value={[char.age, char.birthDate].filter(Boolean).join(' — ')}
            >
                <div className="flex gap-1">
                    <input
                        type="number"
                        className="dg-field-input px-1.5 py-0.5 text-xs w-14"
                        placeholder="Âge"
                        value={char.age ?? ''}
                        onChange={e => set('age', Number(e.target.value) || null)}
                    />
                    <input
                        className="dg-field-input px-1.5 py-0.5 text-xs w-28"
                        placeholder="Date de naissance"
                        value={char.birthDate ?? ''}
                        onChange={e => set('birthDate', e.target.value)}
                    />
                </div>
            </InlineField>
        </div>

        {/* Employeur · Nationalité · Études */}
        <div className="grid grid-cols-3 gap-x-3 min-w-0">
            <InlineField
                label="3. Employeur"
                editMode={editMode}
                value={char.employer}
            >
                <input
                    className="dg-field-input px-1.5 py-0.5 text-xs w-full"
                    value={char.employer ?? ''}
                    onChange={e => set('employer', e.target.value)}
                />
            </InlineField>

            <InlineField
                label="4. Nationalité"
                editMode={editMode}
                value={char.nationality}
            >
                <input
                    className="dg-field-input px-1.5 py-0.5 text-xs w-full"
                    value={char.nationality ?? ''}
                    onChange={e => set('nationality', e.target.value)}
                />
            </InlineField>

            <InlineField
                label="7. Études"
                editMode={editMode}
                value={char.education}
            >
                <input
                    className="dg-field-input px-1.5 py-0.5 text-xs w-full"
                    value={char.education ?? ''}
                    onChange={e => set('education', e.target.value)}
                />
            </InlineField>
        </div>
    </div>
);

export default IdentityInlineSection;
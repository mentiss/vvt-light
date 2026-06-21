// src/client/src/systems/achtung/components/IdentitySection.jsx
// Section identité complète — réutilisable dans Sheet et GMView.

import React from 'react';
import ExpandableText from '../../../components/ui/ExpandableText.jsx';
import { ARCHETYPES, BACKGROUNDS, CHARACTERISTICS } from '../config.jsx';

const resolveLabel = (list, key) => list.find(i => i.key === key)?.label ?? key ?? '—';

const Field = ({ label, children }) => (
    <div>
        <div className="ac-label">{label}</div>
        <div className="mt-0.5">{children}</div>
    </div>
);

const IdentitySection = ({ char, editMode, set, onAvatarClick }) => (
    <div>
        <div className="ac-section-header">Identité</div>
        <div className="flex gap-3 mt-2">

            {/* Avatar */}
            <div
                className="shrink-0 rounded overflow-hidden"
                style={{
                    width:      80, height: 96,
                    border:     '2px solid var(--ac-primary)',
                    background: 'var(--ac-surface-alt)',
                    cursor:     editMode ? 'pointer' : 'default',
                }}
                onClick={() => editMode && onAvatarClick?.()}
            >
                {char.avatar
                    ? <img src={char.avatar} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl" style={{ color: 'var(--ac-muted)' }}>👤</div>}
            </div>

            {/* Champs */}
            <div className="flex-1 flex flex-col gap-2">

                {/* Ligne 1 : prénom, nom, joueur */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { field: 'prenom',     label: 'Prénom' },
                        { field: 'nom',        label: 'Nom' },
                        { field: 'playerName', label: 'Joueur' },
                    ].map(({ field, label }) => (
                        <Field key={field} label={label}>
                            {editMode
                                ? <input value={char[field] ?? ''} onChange={e => set(field, e.target.value)} className="ac-input" placeholder={`${label}…`} />
                                : <div className="ac-value" style={{ fontFamily: 'var(--ac-font-title)', fontSize: '0.88rem' }}>{char[field] || '—'}</div>}
                        </Field>
                    ))}
                </div>

                {/* Ligne 3 : archétype, background, caractéristique */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { field: 'archetype',      label: 'Archétype',       list: ARCHETYPES },
                        { field: 'background',     label: 'Background',      list: BACKGROUNDS },
                        { field: 'characteristic', label: 'Caractéristique', list: CHARACTERISTICS },
                    ].map(({ field, label, list }) => (
                        <Field key={field} label={label}>
                            {editMode ? (
                                <select
                                    value={char[field] ?? ''}
                                    onChange={e => set(field, e.target.value)}
                                    className="ac-input"
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    <option value=''>— Choisir —</option>
                                    {list.map(item => (
                                        <option key={item.key} value={item.key}>{item.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <div style={{ fontSize: '0.78rem', color: 'var(--ac-secondary)', fontFamily: 'var(--ac-font-heading)', fontWeight: 600 }}>
                                    {resolveLabel(list, char[field])}
                                </div>
                            )}
                        </Field>
                    ))}
                </div>
            </div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
            {[
                { field: 'nationality', label: 'Nationalité' },
                { field: 'rank',        label: 'Grade' },
                { field: 'sexe',        label: 'Sexe' },
                { field: 'age',         label: 'Âge',    type: 'number' },
                { field: 'taille',      label: 'Taille', type: 'number' },
            ].map(({ field, label, type }) => (
                <Field key={field} label={label}>
                    {editMode
                        ? <input value={char[field] ?? ''} onChange={e => set(field, e.target.value)} className="ac-input" placeholder={`${label}…`} type={type ?? 'text'} />
                        : <div className="ac-value" style={{ fontFamily: 'var(--ac-font-title)', fontSize: '0.88rem' }}>{char[field] || '—'}</div>}
                </Field>
            ))}
        </div>

        {/* Biographie */}
        {(editMode || char.biography) && (
            <div className="mt-3">
                <div className="ac-label mb-0.5">Biographie</div>
                {editMode
                    ? <textarea value={char.biography ?? ''} onChange={e => set('biography', e.target.value)}
                                className="ac-input w-full" rows={3}
                                style={{ resize: 'vertical', fontFamily: 'var(--ac-font-title)', fontSize: '0.82rem' }}
                                placeholder="Quelques lignes sur votre agent…" />
                    : <ExpandableText
                        text={char.biography}
                        maxLength={160}
                        style={{ fontSize: '0.82rem', color: 'var(--ac-text-muted)', fontFamily: 'var(--ac-font-title)', lineHeight: 1.6 }}
                    />}
            </div>
        )}
    </div>
);

export default IdentitySection;
// src/client/src/systems/fabula/components/layout/TraitsPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Identité complète du personnage — avatar + colonnes plateforme (base.sql)
// + traits narratifs Fabula Ultima. L'avatar vit ici (pas dans le header —
// le header ne porte que le titre du jeu, cf. décision de layout).
// Le champ "Groupe" a été retiré (doublon avec la notion de session/table).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

const TraitsPanel = ({ character, editMode, onFieldChange, onAvatarClick }) => {
    const textField = (field, label, placeholder = '') => (
        <div className="flex flex-col gap-0.5">
            <label className="text-xs text-muted">{label}</label>
            {editMode ? (
                <input value={character[field] ?? ''} placeholder={placeholder}
                       onChange={e => onFieldChange(field, e.target.value)}
                       className="bg-default border border-default rounded px-2 py-1 text-sm" />
            ) : (
                <p className="text-sm">{character[field] || '—'}</p>
            )}
        </div>
    );

    const numberField = (field, label) => (
        <div className="flex flex-col gap-0.5">
            <label className="text-xs text-muted">{label}</label>
            {editMode ? (
                <input type="number" value={character[field] ?? ''}
                       onChange={e => onFieldChange(field, e.target.value === '' ? null : parseInt(e.target.value))}
                       className="bg-default border border-default rounded px-2 py-1 text-sm" />
            ) : (
                <p className="text-sm">{character[field] ?? '—'}</p>
            )}
        </div>
    );

    return (
        <div className="bg-surface border border-default rounded-lg p-3 flex flex-col gap-3">
            <h3 className="fu-font-title text-primary text-sm">Identité</h3>

            {/* Portrait + nom/joueur */}
            <div className="flex items-center gap-3">
                <button type="button" onClick={() => editMode && onAvatarClick?.()}
                        className={`w-14 h-14 shrink-0 rounded-full overflow-hidden border border-default bg-surface-alt flex items-center justify-center ${editMode ? 'cursor-pointer hover:ring-2 hover:ring-primary' : ''}`}
                        title={editMode ? "Changer l'avatar" : ''}>
                    {character.avatar
                        ? <img src={character.avatar} alt="avatar" className="w-full h-full object-cover" />
                        : <span className="text-xl">🗡️</span>}
                </button>
                <div className="flex-1 min-w-0">
                    {editMode ? (
                        <input value={character.nom ?? ''} onChange={e => onFieldChange('nom', e.target.value)}
                               placeholder="Nom du personnage"
                               className="bg-default border border-default rounded px-2 py-1 text-sm font-semibold w-full mb-1" />
                    ) : (
                        <p className="text-sm font-semibold truncate">{character.nom || 'Sans nom'}</p>
                    )}
                    {editMode ? (
                        <input value={character.playerName ?? ''} onChange={e => onFieldChange('playerName', e.target.value)}
                               placeholder="Nom du joueur"
                               className="bg-default border border-default rounded px-2 py-1 text-xs w-full" />
                    ) : (
                        <p className="text-xs text-muted truncate">{character.playerName || '—'}</p>
                    )}
                </div>
            </div>

            {/* Colonnes plateforme (base.sql) */}
            <div className="grid grid-cols-3 gap-2">
                {textField('prenom', 'Prénom')}
                {textField('sexe', 'Sexe')}
                {numberField('age', 'Âge')}
                {numberField('taille', 'Taille (cm)')}
                {numberField('poids', 'Poids (kg)')}
            </div>

            <div className="border-t border-default pt-3 flex flex-col gap-2">
                <h4 className="fu-font-title text-primary text-xs">Concept Évocateur</h4>
                {textField('identite', 'Identité', 'ex : Ancien chevalier en quête de rédemption')}
                {textField('origine', 'Origine', 'ex : Le Royaume Céleste de Baron')}
                {textField('theme', 'Thème', 'ex : Ambition, Justice, Espoir')}
            </div>
        </div>
    );
};

export default TraitsPanel;
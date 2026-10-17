// src/client/src/systems/vikings/components/layout/IdentitySection.jsx
// Identité du personnage et valeurs de combat (lecture / édition).

import React from 'react';
import { formatFullName } from '../../config/utils.js';

const inputClass = 'w-full px-2 py-1 border border-default rounded text-xs bg-default text-default';

const Field = ({ label, children }) => (
    <label className="block">
        <span className="block text-[10px] uppercase tracking-wide text-muted mb-0.5">{label}</span>
        {children}
    </label>
);

const Avatar = ({ avatar, size, onClick }) => (
    <div onClick={onClick}
         className={`relative group shrink-0 ${onClick ? 'cursor-pointer' : ''}`}
         title={onClick ? (avatar ? "Modifier l'avatar" : 'Ajouter un avatar') : undefined}>
        {avatar ? (
            <img src={avatar} alt="Avatar" className={`${size} rounded-full border-4 border-primary object-cover`} />
        ) : (
            <div className={`${size} rounded-full border-4 border-dashed border-default bg-surface-alt flex items-center justify-center`}>
                <span className="text-2xl">{onClick ? '📸' : '⚔️'}</span>
            </div>
        )}
    </div>
);

const CombatValue = ({ label, value }) => (
    <div className="text-center p-1.5 bg-default rounded">
        <div className="text-xs text-muted">{label}</div>
        <div className="font-bold text-sm text-default">{value}</div>
    </div>
);

const IdentitySection = ({ char, editMode, set, onAvatarClick }) => {
    const num = (field, fallback) => (e) => set(field, parseInt(e.target.value) || fallback);

    return (
        <div className="bg-surface rounded-lg p-3 border-2 border-default">
            <h3 className="text-sm font-bold text-default mb-2">Informations</h3>

            {editMode ? (
                <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-4">
                        <Avatar avatar={char.avatar} size="w-20 h-20" onClick={onAvatarClick} />
                        <div className="flex-1 space-y-2">
                            <Field label="Prénom *">
                                <input value={char.prenom ?? ''} onChange={e => set('prenom', e.target.value)} className={inputClass} />
                            </Field>
                            <Field label="Surnom">
                                <input value={char.surnom ?? ''} onChange={e => set('surnom', e.target.value)} className={inputClass} placeholder="Le Brave" />
                            </Field>
                        </div>
                    </div>
                    <Field label="Nom du parent (« fils / fille de »)">
                        <input value={char.nom ?? ''} onChange={e => set('nom', e.target.value)} className={inputClass} placeholder="Ragnar" />
                    </Field>
                    <div className="grid grid-cols-3 gap-1.5">
                        <Field label="Âge"><input type="number" value={char.age ?? ''} onChange={num('age', 25)} className={inputClass} /></Field>
                        <Field label="Taille (cm)"><input type="number" value={char.taille ?? ''} onChange={num('taille', undefined)} className={inputClass} /></Field>
                        <Field label="Poids (kg)"><input type="number" value={char.poids ?? ''} onChange={num('poids', undefined)} className={inputClass} /></Field>
                    </div>
                    <Field label="Activité">
                        <input value={char.activite ?? ''} onChange={e => set('activite', e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Joueur">
                        <input value={char.playerName ?? ''} onChange={e => set('playerName', e.target.value)} className={inputClass} />
                    </Field>
                </div>
            ) : (
                <div className="flex items-start gap-3">
                    <Avatar avatar={char.avatar} size="w-16 h-16" />
                    <div className="text-xs text-default space-y-0.5">
                        <div className="font-bold text-sm">{formatFullName(char)}</div>
                        <div>{char.playerName}</div>
                        <div>{char.sexe === 'homme' ? 'Homme' : 'Femme'}, {char.age} ans</div>
                        {char.activite && <div className="italic">{char.activite}</div>}
                        {char.taille && <div>{char.taille}cm{char.poids ? ` — ${char.poids}kg` : ''}</div>}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-3 gap-1.5 mt-2 pt-2 border-t border-default">
                <CombatValue label="Armure"  value={char.armure} />
                <CombatValue label="Actions" value={char.actionsDisponibles} />
                <CombatValue label="Seuil"   value={char.seuilCombat} />
            </div>
        </div>
    );
};

export default IdentitySection;

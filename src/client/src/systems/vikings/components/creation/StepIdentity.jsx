// src/client/src/systems/vikings/components/creation/StepIdentity.jsx
// Étape 5 : identité (spec_vikings.md §3.1, §4.1, D-17). On nomme son personnage à la fin ;
// prénom et nom du parent obligatoires (pour créer, plus pour passer à l'étape suivante,
// Q-L6-1) ; « fils de / fille de » déduit du sexe. Le nom se grave dans le ruban de la pierre.

import React from 'react';

const Field = ({ label, className = '', children }) => (
    <label className={className}><span className="vk-field-label">{label}</span>{children}</label>
);

const StepIdentity = ({ character, set }) => (
    <>
        <p className="vk-cr-lead">On nomme son personnage à la fin. Le nom se grave dans le ruban de la pierre à mesure que vous l'écrivez.</p>
        <div className="vk-cr-identity">
            <Field label="Prénom *" className="is-2"><input className="vk-input" value={character.prenom} onChange={e => set('prenom', e.target.value)} placeholder="Ragnhild" /></Field>
            <Field label="Surnom" className="is-2"><input className="vk-input" value={character.surnom} onChange={e => set('surnom', e.target.value)} placeholder="la Rousse" /></Field>
            <div className="is-2">
                <span className="vk-field-label">Sexe *</span>
                <div className="flex gap-1.5">
                    {[['homme', 'Homme'], ['femme', 'Femme']].map(([id, label]) => (
                        <button key={id} type="button" className={`vk-pill ${character.sexe === id ? 'is-selected' : ''}`} onClick={() => set('sexe', id)}>{label}</button>
                    ))}
                </div>
            </div>
            <Field label={`${character.sexe === 'homme' ? 'Fils' : 'Fille'} de * (nom du parent)`} className="is-3">
                <input className="vk-input" value={character.nom} onChange={e => set('nom', e.target.value)} placeholder="Thorvald" />
            </Field>
            <Field label="Âge"><input type="number" className="vk-input vk-num" value={character.age} onChange={e => set('age', parseInt(e.target.value) || 25)} /></Field>
            <Field label="Activité, métier" className="is-2"><input className="vk-input" value={character.activite} onChange={e => set('activite', e.target.value)} placeholder="forgeronne" /></Field>
            <Field label="Nom du joueur" className="is-3"><input className="vk-input" value={character.playerName} onChange={e => set('playerName', e.target.value)} /></Field>
        </div>
    </>
);

export default StepIdentity;

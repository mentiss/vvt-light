// src/client/src/systems/cyberpunk/components/creation/StepIdentity.jsx
// Étape 2 : identité (prénom et nom séparés), joueur, apparence.
import React from 'react';
import { Card } from '../layout/Card.jsx';
import { StepHead } from './CreationParts.jsx';
import { stepRemaining } from '../../config.jsx';

const FIELDS = [
    { key: 'playerName', label: 'Joueur',     placeholder: 'Ton prénom ou pseudo', required: true },
    { key: 'sexe',       label: 'Sexe',       placeholder: 'Libre' },
    { key: 'prenom',     label: 'Prénom',     placeholder: 'Ex. Kai', required: true },
    { key: 'nom',        label: 'Nom',        placeholder: 'Ex. Nakamura' },
];

const StepIdentity = ({ identity, onChange }) => (
    <>
        <StepHead num={2} title="Identité" remaining={stepRemaining(2, { identity })} unit={['champ obligatoire', 'champs obligatoires']}
                  sub="Qui tu es dans la rue. Le prénom suffit, le nom peut attendre." />
        <Card title="Opérateur">
            <div className="cp-cr-form">
                {FIELDS.map(f => (
                    <label key={f.key}>
                        <span className="cp-field-label">{f.label}{f.required && <span className="cp-cr-req">*</span>}</span>
                        <input className="cp-input" value={identity[f.key]} placeholder={f.placeholder}
                               onChange={e => onChange(f.key, e.target.value)} />
                    </label>
                ))}
                <label className="is-full">
                    <span className="cp-field-label">Apparence</span>
                    <textarea className="cp-input" rows={3} value={identity.apparence}
                              placeholder="Description physique, style vestimentaire, traits marquants…"
                              onChange={e => onChange('apparence', e.target.value)} />
                </label>
            </div>
        </Card>
    </>
);

export default StepIdentity;

// src/client/src/systems/cyberpunk/components/creation/StepFinal.jsx
// Étape 9 : dark secret (facultatif), création ; puis le code d'accès à noter.
import React from 'react';
import CopyAccessButton from '../../../../components/ui/CopyAccessButton.jsx';
import { findPlaybook } from '../../config.jsx';
import { Card } from '../layout/Card.jsx';
import { StepHead } from './CreationParts.jsx';

export const CreatedScreen = ({ created, onOpen }) => (
    <Card title="Opérateur enregistré">
        <div className="cp-cr-done">
            <div className="cp-cr-doss-name"><small>{findPlaybook(created.playbook)?.label ?? created.playbook}</small>{created.prenom} {created.nom}</div>
            <p className="cp-cr-stage-sub">Note ton code d'accès : c'est le seul moyen de te reconnecter.</p>
            <span className="cp-field-label">Code d'accès</span>
            <span className="cp-cr-code">{created.accessCode}</span>
            <CopyAccessButton character={created} codeOnly className="cp-btn is-sm" />
            <button type="button" className="cp-btn is-primary" onClick={() => onOpen(created)}>Accéder à la fiche</button>
        </div>
    </Card>
);

const StepFinal = ({ darkSecret, onDarkSecret, error, missing = [], onGo }) => (
    <>
        <StepHead num={9} title="Finalisation" remaining={missing.length} unit={['étape à finir', 'étapes à finir']}
                  sub="Relis ton dossier à droite, ajoute un dark secret si tu veux, puis crée l'opérateur." />
        {missing.length > 0 && (
            <Card title="À finir avant la création">
                <div className="cp-cr-list">
                    {missing.map(s => (
                        <button key={s.id} type="button" onClick={() => onGo(s.id)}>
                            {String(s.id).padStart(2, '0')} · {s.label} — {s.remaining} choix
                        </button>
                    ))}
                </div>
            </Card>
        )}
        <Card title="Dark secret (facultatif)">
            <p className="cp-cr-rule">Un élément lourd de ton passé : il ne change pas en cours de campagne, il se révèle.</p>
            <textarea className="cp-input" rows={4} value={darkSecret} onChange={e => onDarkSecret(e.target.value)}
                      placeholder="Ex. ancien agent d'une megacorp retourné, identité volée, responsable involontaire d'une catastrophe…" />
        </Card>
        {error && <p className="cp-cr-warn text-danger">{error}</p>}
    </>
);

export default StepFinal;

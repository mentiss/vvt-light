// src/client/src/systems/cyberpunk/components/creation/StepArchetype.jsx
// Étape 1 : archétype (playbook). Changer d'archétype après coup réinitialise ce
// qui en dépend (manœuvres, chrome, matos) : confirmation demandée (spec §9.1).
import React from 'react';
import { PLAYBOOKS, playbookStatProfile } from '../../config.jsx';
import { useSystem } from '@/app/hooks/useSystem.js';
import { usePlaybookMoves } from '../../hooks/usePlaybookMoves.js';
import { Card } from '../layout/Card.jsx';
import { StepHead, PickCard, StatProfile } from './CreationParts.jsx';

const ALL = PLAYBOOKS.map(p => p.id);

const StepArchetype = ({ playbook, onSelect, pending, onConfirm, onCancel }) => {
    const { apiBase } = useSystem();
    const { moves, loaded } = usePlaybookMoves(apiBase, ALL);
    return (
    <>
        <StepHead num={1} title="Archétype" remaining={playbook ? 0 : 1}
                  sub="Ton rôle dans l'équipe : il fixe tes manœuvres de playbook, ton chrome d'archétype et ton kit." />
        {pending && (
            <div className="cp-cr-warn">
                <span>Passer <b>{pending}</b> réinitialise tes manœuvres, ton chrome et ton matos.</span>
                <button type="button" className="cp-btn is-sm" onClick={onCancel}>Garder {playbook}</button>
                <button type="button" className="cp-btn is-sm is-primary" onClick={onConfirm}>Passer {pending}</button>
            </div>
        )}
        <Card title="Playbooks">
            <div className="cp-cr-cards">
                {PLAYBOOKS.map(pb => (
                    <PickCard key={pb.id} on={playbook === pb.id} onClick={() => onSelect(pb.id)}
                              name={pb.label} desc={pb.description}>
                        <div className="cp-cr-inline"><span className="cp-cr-rule">Manœuvres :</span><StatProfile profile={playbookStatProfile(moves, pb.id)} loaded={loaded} /></div>
                    </PickCard>
                ))}
            </div>
        </Card>
    </>
    );
};

export default StepArchetype;

// src/client/src/systems/woddavampire/components/creation/PriorityHeader.jsx
// En-tête d'une colonne à priorités (Attributs, Capacités) : choix de la priorité
// et compteur de la colonne juste dessous. nudge : on a cliqué un point sans
// priorité, le rappel s'allume.
import React from 'react';
import { VdaChip } from '../ui/VdaUi.jsx';

const PriorityHeader = ({ priorities, value, remaining, nudge, onPick }) => (
    <div className={`vda-priority-head${nudge ? ' is-nudged' : ''}`}>
        <div className="vda-priority">
            {priorities.map(p => <VdaChip key={p} on={value === p} onClick={() => onPick(p)}>{p}</VdaChip>)}
        </div>
        <div className="vda-priority-state">
            {!value ? 'Choisissez d’abord une priorité'
                : remaining > 0 ? <>Reste <b>{remaining}</b> à répartir</>
                    : remaining < 0 ? <>Dépassement de <b>{-remaining}</b></> : '✓ Réparti'}
        </div>
    </div>
);

export default PriorityHeader;

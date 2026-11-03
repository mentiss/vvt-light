// src/client/src/systems/woddavampire/components/creation/TraitRow.jsx
// Ligne de trait de l'assistant : nom, points (gratuits / priorités / bonus).
// help : sujet de la colonne d'aide (CreationHelp), affiché au survol du nom.
import React from 'react';
import { VdaDots } from '../ui/VdaUi.jsx';
import { useHelp, helpProps } from './CreationHelp.jsx';

const TraitRow = ({ label, note, free = 0, base = 0, bonus = 0, max = 5, locked = max, onPick, help, children }) => {
    const show = useHelp();
    const name = <>{label}{note ? <small> ({note})</small> : null}</>;
    return (
        <div className="vda-trait" {...(help ? helpProps(show, help) : {})}>
            {help
                ? <button type="button" className="vda-trait-name vda-trait-help" onClick={() => show(help)}>{name}</button>
                : <span className="vda-trait-name">{name}</span>}
            {children}
            <VdaDots max={max} free={free} base={base} bonus={bonus} locked={locked} onPick={onPick} label={label} />
        </div>
    );
};

export default TraitRow;

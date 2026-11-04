// src/client/src/systems/dune/components/ui/DuneDie.jsx
// Un d20 hexagonal : fenêtre de jet, historique, notifications (même rendu).
// die : { value, forced, successes, complication } (config/rules/roll.js).

import React from 'react';

const dieState = (die) => {
    if (die.forced)       return { cls: 'is-forced', label: 'Forcé' };
    if (die.complication) return { cls: 'is-cpl',    label: 'Complication' };
    if (die.successes === 2) return { cls: 'is-s2',   label: '2 succès' };
    if (die.successes === 1) return { cls: 'is-s1',   label: '1 succès' };
    return { cls: '', label: '' };
};

/**
 * @param {object}  props.die
 * @param {boolean} [props.small=false]     version compacte (historique)
 * @param {boolean} [props.withLabel=false] légende sous le dé
 */
const DuneDie = ({ die, small = false, withLabel = false }) => {
    const { cls, label } = dieState(die);
    return (
        <div className={`dn-die ${cls}${small ? ' is-sm' : ''}`} title={label || undefined}>
            <div className="dn-die-face">{die.value}</div>
            {withLabel && label && <small>{label}</small>}
        </div>
    );
};

export default DuneDie;

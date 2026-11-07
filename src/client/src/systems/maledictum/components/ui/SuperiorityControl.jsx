// src/client/src/systems/maledictum/components/ui/SuperiorityControl.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Supériorité du groupe côté MJ (spec_maledictum.md §13.2) : règle utilisée ou
// non à cette table, et valeur 0-10 (enregistrée tout de suite, vue des joueurs).
// Posée dans l'onglet Patron et en tête de l'onglet Session.
// Props : patronState (usePatron), compact (sans le texte d'aide)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Stepper, Toggle } from './MlUi.jsx';

const SUPERIORITY_MAX = 10;   // borne du serveur (PatronController)

const SuperiorityControl = ({ patronState, compact = false }) => {
    const { patron, save, setSuperiority } = patronState;
    if (!patron) return null;
    const on = patron.superiorityEnabled !== false;
    return (
        <div className="im-superiority">
            <Toggle on={on} onChange={v => save({ superiorityEnabled: v })}>Supériorité du groupe utilisée</Toggle>
            {on && <Stepper value={patron.superiority} onChange={setSuperiority} min={0} max={SUPERIORITY_MAX} label={patron.superiority} text="Supériorité" />}
            {on && !compact && <p className="im-note">Visible de tous les joueurs : +DR sur un test par tour. Avant le combat, +3 au plus (Connaître l'ennemi, le terrain, les joueurs).</p>}
        </div>
    );
};

export default SuperiorityControl;

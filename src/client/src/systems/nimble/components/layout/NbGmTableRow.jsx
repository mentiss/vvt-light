// src/client/src/systems/nimble/components/layout/NbGmTableRow.jsx
// Ligne d'un héros dans la colonne de la table (interface MJ) : portrait et
// présence, prénom et nom, classe et niveau, PV et Blessures.
// Props : c, online, selected, onSelect.

import React from 'react';
import { displayName, originLine, maxHp } from '../../config/rules/character.js';

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const NbGmTableRow = ({ c, online, selected, onSelect }) => (
    <button type="button" className={`nb-gm-pc${selected ? ' is-selected' : ''}`} onClick={onSelect}>
        <span className={`nb-gm-pc-av${online ? ' is-online' : ''}`}>
            {c.avatar ? <img src={c.avatar} alt="" /> : initials(displayName(c))}
        </span>
        <span className="min-w-0">
            <span className="nb-gm-pc-name">{displayName(c)}</span>
            <small>{originLine(c)}{c.playerName ? ` · ${c.playerName}` : ''}</small>
            <span className="nb-gm-pc-hp">♥ {c.hpCurrent ?? 0}/{maxHp(c)}{Number(c.wounds) ? ` · ${c.wounds} Blessure${c.wounds > 1 ? 's' : ''}` : ''}{c.dying ? ' · mourant' : ''}</span>
        </span>
    </button>
);

export default NbGmTableRow;

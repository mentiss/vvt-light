// src/client/src/systems/vileborn/components/layout/VilGmTableRow.jsx
// Ligne d'un Paria dans la colonne de la table (interface MJ) : portrait et
// présence, prénom et nom, héritage. Props : c, online, selected, onSelect.

import React from 'react';
import { displayName } from '../../config/rules/character.js';

const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

const VilGmTableRow = ({ c, online, selected, onSelect }) => (
    <button type="button" className={`vil-gm-pc${selected ? ' is-selected' : ''}`} onClick={onSelect}>
        <span className={`vil-gm-pc-av${online ? ' is-online' : ''}`}>
            {c.avatar ? <img src={c.avatar} alt="" /> : initials(displayName(c))}
        </span>
        <span className="min-w-0">
            <span className="vil-name">{displayName(c)}</span>
            <small>{c.heritageName}{c.playerName ? ` · ${c.playerName}` : ''}</small>
        </span>
    </button>
);

export default VilGmTableRow;

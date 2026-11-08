// src/client/src/systems/vileborn/components/challenge/VilTrackMini.jsx
// Piste d'un défi en miniature (listes de défis) : cases cochées en rouge,
// cases à déclencheur cerclées de rouge. Props : sheet, progress
import React from 'react';
import { triggerAt } from '../../config/rules/challenge.js';

const VilTrackMini = ({ sheet, progress = 0 }) => (
    <span className="vil-ch-mini" aria-label={`${progress} sur ${sheet.track}`}>
        {Array.from({ length: sheet.track }, (_, i) => (
            <i key={i} className={`${i < progress ? 'is-on' : ''}${triggerAt(sheet, i + 1) ? ' is-trig' : ''}`} />
        ))}
    </span>
);

export default VilTrackMini;

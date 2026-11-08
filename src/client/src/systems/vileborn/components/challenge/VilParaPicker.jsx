// src/client/src/systems/vileborn/components/challenge/VilParaPicker.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Choix du Paria qui subit une complication de défi (spec_vileborn_defis.md
// §II.4) : petite fenêtre posée sous l'effet cliqué, Parias de la table avec
// leurs états et blessures. Un état déjà coché devient une blessure (signalé).
// Ferme au clic dehors et sur Échap.
//
// Props : anchor (élément cliqué), effect (clé d'état ou 'wound'),
//         characters (fiches de la table, dans l'ordre), onPick(character), onClose()
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import { STATES, WOUNDS } from '../../config/approaches.js';
import { effectLabel } from '../../config/challenges.js';
import { displayName } from '../../config/rules/character.js';
import { VilLabel } from '../ui/VilUi.jsx';

const WIDTH = 300;

const VilParaPicker = ({ anchor, effect, characters, onPick, onClose }) => {
    const ref = useRef(null);
    const rect = anchor.getBoundingClientRect();
    const style = {
        top: Math.min(rect.bottom + 6, window.innerHeight - 240),
        left: Math.max(8, Math.min(rect.right - WIDTH, window.innerWidth - WIDTH - 8)),
        width: WIDTH,
    };
    const stateField = STATES.find(s => s.key === effect)?.field;

    useEffect(() => {
        const outside = (e) => { if (!ref.current?.contains(e.target) && !anchor.contains(e.target)) onClose(); };
        const escape = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('mousedown', outside);
        document.addEventListener('keydown', escape);
        return () => {
            document.removeEventListener('mousedown', outside);
            document.removeEventListener('keydown', escape);
        };
    }, [anchor, onClose]);

    return (
        <div ref={ref} className="vil-ch-pop vil-paper" style={style} role="dialog" aria-label={`${effectLabel(effect)} : à quel Paria ?`}>
            <VilLabel>{effectLabel(effect)} — à quel Paria ?</VilLabel>
            {characters.length === 0 && <p className="vil-note">Aucun Paria à cette table.</p>}
            {characters.map(c => {
                const states = STATES.filter(s => c[s.field]).map(s => s.label);
                const wounds = WOUNDS.filter(w => c[w.field]).length;
                return (
                    <button key={c.id} type="button" className="vil-ch-pop-pc" onClick={() => onPick(c)}>
                        <span>
                            {displayName(c) || 'Sans nom'}
                            <small>{states.join(', ') || 'aucun état'} · {c.outOfPlay ? 'hors jeu' : `${wounds} blessure${wounds > 1 ? 's' : ''}`}</small>
                        </span>
                        {stateField && c[stateField] && <small className="vil-red">déjà coché → blessure</small>}
                    </button>
                );
            })}
        </div>
    );
};

export default VilParaPicker;

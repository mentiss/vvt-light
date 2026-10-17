// src/client/src/systems/vikings/components/ui/VkQuantity.jsx
// Quantité : saisie au clavier (ex. 400 onces d'argent) entourée de −/+.
// Valeur entière ≥ min ; un champ vidé reprend min à la sortie du champ.

import React, { useState, useEffect } from 'react';
import VkIcon from './VkIcon.jsx';

const VkQuantity = ({ value, onChange, min = 1 }) => {
    const [text, setText] = useState(String(value));
    useEffect(() => { setText(String(value)); }, [value]);

    const commit = (raw) => {
        const n = parseInt(raw, 10);
        onChange(Number.isFinite(n) ? Math.max(min, n) : min);
    };

    return (
        <div className="vk-stepper">
            <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}><VkIcon name="minus" /></button>
            <input type="number" inputMode="numeric" min={min} value={text} aria-label="Quantité"
                   onChange={e => { setText(e.target.value); if (e.target.value !== '') commit(e.target.value); }}
                   onBlur={e => commit(e.target.value)} />
            <button type="button" onClick={() => onChange(value + 1)}><VkIcon name="plus" /></button>
        </div>
    );
};

export default VkQuantity;

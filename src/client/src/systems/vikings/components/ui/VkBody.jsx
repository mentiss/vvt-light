// src/client/src/systems/vikings/components/ui/VkBody.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Le corps parle (spec_vikings_pierre_peinte.md §3, page joueur seulement) : les
// blessures rougissent les bords de l'écran (battement de cœur à partir de Critique),
// la fatigue trouble la vision en périphérie au rythme du souffle, le KO décolore
// tout. Calques fixes, sans effet sur les clics. Pierre peinte seulement ; animations
// coupées (C-9) : teintes figées, sans battement ni souffle (thème).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { useVkLook } from '../../hooks/useVkLook.js';
import { BLESSURE_MAX, getFatigueMalus, isFatigueKO } from '../../config/rules.js';

export const HURT_LEVELS = [0, 0, .35, .6, .85, 1];   // par token de blessure (0 à 5)

const VkBody = ({ blessures = 0, fatigue = 0 }) => {
    const [look] = useVkLook();
    if (look.skin !== 'pierre') return null;
    const hurt  = HURT_LEVELS[Math.min(BLESSURE_MAX, blessures)] ?? 0;
    const tired = isFatigueKO(fatigue) ? 1 : getFatigueMalus(fatigue) / 4;
    const ko    = blessures >= BLESSURE_MAX || isFatigueKO(fatigue);
    if (!hurt && !tired && !ko) return null;
    return (
        <div className={`vk-body ${blessures >= 3 ? 'is-critical' : ''}`} aria-hidden="true"
             style={{ '--vk-hurt': hurt, '--vk-tired': tired }}>
            {tired > 0 && <div className="vk-body-tired" />}
            {hurt > 0 && <div className="vk-body-hurt" />}
            {ko && <div className="vk-body-ko" />}
        </div>
    );
};

export default VkBody;

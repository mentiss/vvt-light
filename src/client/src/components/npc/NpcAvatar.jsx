// src/client/src/components/npc/NpcAvatar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Avatar d'un PNJ (spec_pnj.md §6.5) : image recadrée, sinon icône colorée de la
// bibliothèque du tableau, sinon initiales. Habillage : .vtt-npc-avatar (is-lg).
//
// <NpcAvatar npc={{ prenom, nom, avatar, icon }} size="sm|lg" />
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { iconUrl } from '../../hooks/useBoardIcons.js';

/** Initiales d'un PNJ : deux lettres au plus, tirées du prénom et du nom. */
export const npcInitials = (npc) => [npc?.prenom, npc?.nom].filter(Boolean).join(' ')
    .split(/\s+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();

/** Nom affiché d'une fiche : prénom et nom. */
export const npcName = (npc) => [npc?.prenom, npc?.nom].filter(Boolean).join(' ');

const NpcAvatar = ({ npc, size = 'sm' }) => {
    const icon = !npc?.avatar && npc?.icon ? npc.icon : null;
    return (
        <span className={`vtt-npc-avatar${size === 'lg' ? ' is-lg' : ''}`} style={icon ? { color: icon.color } : undefined} aria-hidden="true">
            {npc?.avatar ? <img src={npc.avatar} alt="" />
                : icon ? <span className="vtt-npc-icon" style={{ WebkitMaskImage: `url(${iconUrl(icon.icon)})`, maskImage: `url(${iconUrl(icon.icon)})` }} />
                : npcInitials(npc)}
        </span>
    );
};

export default NpcAvatar;

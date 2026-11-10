// src/client/src/components/npc/NpcAvatarPicker.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Choix de l'avatar d'un PNJ (spec_pnj.md §6.5, P-20) : image (AvatarUploader,
// recadrage), icône de la bibliothèque du tableau (IconPicker, couleur), ou
// initiales. Un seul des deux est gardé : choisir une icône retire l'image.
//
// <NpcAvatarPicker npc={draft} onChange={({ avatar, icon }) => …} />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import AvatarUploader from '../AvatarUploader.jsx';
import IconPicker from '../board/IconPicker.jsx';
import NpcAvatar from './NpcAvatar.jsx';

const NpcAvatarPicker = ({ npc, onChange }) => {
    const [open, setOpen] = useState(null);   // 'image' | 'icon' | null
    const mode = npc.avatar ? 'image' : npc.icon ? 'icon' : 'initials';

    return (
        <div className="vtt-npc-avatar-picker">
            <NpcAvatar npc={npc} size="lg" />
            <div className="vtt-npc-avatar-choice">
                <span className="vtt-field-label">Avatar</span>
                <div className="vtt-segmented">
                    <button type="button" className={`vtt-segment ${mode === 'image' ? 'is-active' : ''}`} onClick={() => setOpen('image')}>Image</button>
                    <button type="button" className={`vtt-segment ${mode === 'icon' ? 'is-active' : ''}`} onClick={() => setOpen('icon')}>Icône</button>
                    <button type="button" className={`vtt-segment ${mode === 'initials' ? 'is-active' : ''}`} onClick={() => onChange({ avatar: null, icon: null })}>Initiales</button>
                </div>
            </div>
            {open === 'image' && (
                <AvatarUploader currentAvatar={npc.avatar} onClose={() => setOpen(null)}
                                onAvatarChange={(avatar) => onChange({ avatar, icon: avatar ? null : npc.icon })} />
            )}
            {open === 'icon' && (
                <IconPicker title="Icône du PNJ" onClose={() => setOpen(null)}
                            onPick={(icon) => { onChange({ avatar: null, icon }); setOpen(null); }} />
            )}
        </div>
    );
};

export default NpcAvatarPicker;

// src/client/src/features/audio/panel/SlotChip.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Pastille de la piste d'une playlist (documentations/spec_audio.md §11.15).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import { RowMenu, MenuLabel } from './RowMenu.jsx';
import { SLOTS, SLOT_LABEL } from '../tools/audioSlots.js';

/**
 * Pastille de la piste d'une playlist (§11.15) : ses titres jouent sur cette piste
 * quand on clique sur ▶. Un clic ouvre le choix de la piste.
 */
export const SlotChip = ({ playlist, onWrite }) => {
    const [anchor, setAnchor] = useState(null);
    const close = useCallback(() => setAnchor(null), []);
    const slot = playlist.defaultSlot ?? 'music';
    return (
        <>
            <button type="button" className={`vtt-audio-slot-chip is-${slot.replace(/\d+$/, '')}`} aria-haspopup="menu" aria-expanded={!!anchor}
                    title={`Les titres de « ${playlist.name} » jouent en ${SLOT_LABEL[slot]} : changer`}
                    aria-label={`Piste de la playlist « ${playlist.name} » : ${SLOT_LABEL[slot]}. Changer`}
                    onClick={e => setAnchor(anchor ? null : e.currentTarget)}>
                {SLOT_LABEL[slot]} <span aria-hidden="true">▾</span>
            </button>
            {anchor && (
                <RowMenu anchor={anchor} onClose={close}>
                    <MenuLabel>Jouer les titres en</MenuLabel>
                    {SLOTS.map(s => (
                        <li key={s.id} role="none">
                            <button type="button" role="menuitemradio" className="vtt-menu-item" aria-checked={slot === s.id}
                                    onClick={() => { close(); if (s.id !== slot) onWrite('PUT', `/playlists/${playlist.id}`, { defaultSlot: s.id }); }}>
                                {s.label}
                            </button>
                        </li>
                    ))}
                </RowMenu>
            )}
        </>
    );
};

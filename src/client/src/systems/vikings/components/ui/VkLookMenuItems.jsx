// src/client/src/systems/vikings/components/ui/VkLookMenuItems.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Entrées du menu (joueur, MJ) pour l'habillage (spec_vikings_pierre_peinte.md §2) :
// passer de la pierre peinte au bois et or, et choisir la nuit de la pierre peinte.
// Modèle : CpAnimationsMenuItem (cyberpunk).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { HamburgerMenuItem } from '../../../../components/ui/HamburgerMenu.jsx';
import { useVkLook } from '../../hooks/useVkLook.js';
import VkIcon from './VkIcon.jsx';

const VkLookMenuItems = () => {
    const [look, setLook] = useVkLook();
    const pierre = look.skin === 'pierre';
    return (
        <>
            <HamburgerMenuItem
                icon={<VkIcon name={pierre ? 'longhouse' : 'shield'} />}
                onClick={() => setLook(prev => ({ ...prev, skin: pierre ? 'bois' : 'pierre' }))}
            >
                {pierre ? 'Passer au bois et or' : 'Passer à la pierre peinte'}
            </HamburgerMenuItem>
            {pierre && (
                <HamburgerMenuItem
                    icon={<VkIcon name="moon" />}
                    onClick={() => setLook(prev => ({ ...prev, night: prev.night === 'aurore' ? 'foyer' : 'aurore' }))}
                >
                    {look.night === 'aurore' ? 'Nuit au coin du feu' : 'Nuit sous l’aurore'}
                </HamburgerMenuItem>
            )}
            {/* Les deux habillages : le ruban-serpent vit aussi en bois et or */}
            {(
                <HamburgerMenuItem
                    icon={<VkIcon name="horn" />}
                    onClick={() => setLook(prev => ({ ...prev, anim: prev.anim === false }))}
                >
                    {look.anim !== false ? 'Couper les animations' : 'Rétablir les animations'}
                </HamburgerMenuItem>
            )}
            <HamburgerMenuItem
                icon={<VkIcon name="eye" />}
                onClick={() => setLook(prev => ({ ...prev, odds: prev.odds === false }))}
            >
                {look.odds !== false ? 'Masquer les chances' : 'Afficher les chances'}
            </HamburgerMenuItem>
        </>
    );
};

export default VkLookMenuItems;

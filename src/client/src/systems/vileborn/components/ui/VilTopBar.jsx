// src/client/src/systems/vileborn/components/ui/VilTopBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bande fixe du haut (fiche joueur, interface MJ) : header (marque, thème, menu
// générique) et sous-header (onglets, actions de page en icônes à droite).
// Chaque page fournit son sous-titre, ses éléments de menu, ses onglets et ses actions.
// Le header porte le titre du jeu, jamais le nom du personnage.
//
// Props : subtitle, menu (éléments de HamburgerMenu), tabs, active, onSelect,
//         actions, darkMode, onToggleDarkMode, ref (mesure de la hauteur)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import ThemeToggle from '../../../../components/ui/ThemeToggle.jsx';
import { HamburgerMenu } from '../../../../components/ui/HamburgerMenu.jsx';
import Brand from '../../Brand.jsx';
import { VilTabs } from './VilUi.jsx';

const VilTopBar = ({ subtitle, menu, tabs, active, onSelect, actions, darkMode, onToggleDarkMode, ref }) => (
    <div className="vil-sticky-top" ref={ref}>
        <header className="vil-topbar">
            <Brand variant="title" />
            {subtitle && <span className="vil-topbar-sub">{subtitle}</span>}
            <span className="vil-topbar-tools">
                <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
                <HamburgerMenu button="☰">{menu}</HamburgerMenu>
            </span>
        </header>
        <div className="vil-subbar">
            <VilTabs tabs={tabs} active={active} onSelect={onSelect} />
            <div className="vil-actions">{actions}</div>
        </div>
    </div>
);

export default VilTopBar;

// src/client/src/systems/nimble/components/ui/NbTopBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bande fixe du haut (fiche joueur, interface MJ, assistant) : header (marque,
// sous-titre, thème, menu générique) et sous-header d'encre (onglets, actions
// de page à droite). Le header porte le titre du jeu, jamais le nom du personnage.
//
// Props : subtitle, menu (éléments de HamburgerMenu, facultatif), tabs, active,
//         onSelect, actions, darkMode, onToggleDarkMode, ref (mesure de la hauteur)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import ThemeToggle from '../../../../components/ui/ThemeToggle.jsx';
import { HamburgerMenu } from '../../../../components/ui/HamburgerMenu.jsx';
import Brand from '../../Brand.jsx';
import { NbTabs } from './NbUi.jsx';

const NbTopBar = ({ subtitle, menu, tabs, active, onSelect, actions, darkMode, onToggleDarkMode, ref }) => (
    <div className="nb-sticky-top" ref={ref}>
        <header className="nb-topbar">
            <Brand variant="title" />
            {subtitle && <span className="nb-topbar-sub">{subtitle}</span>}
            <span className="nb-topbar-tools">
                <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
                {menu && <HamburgerMenu button="☰">{menu}</HamburgerMenu>}
            </span>
        </header>
        {(tabs?.length > 0 || actions) && (
            <div className="nb-subbar">
                {tabs?.length > 0 && <NbTabs tabs={tabs} active={active} onSelect={onSelect} />}
                <div className="nb-actions">{actions}</div>
            </div>
        )}
    </div>
);

export default NbTopBar;

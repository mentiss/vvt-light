// src/client/src/systems/woddavampire/components/ui/VdaTopBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bande fixe du haut (fiche joueur, interface du Conteur) : header (titre, thème,
// menu générique) et sous-header (onglets à flèches, actions de page à droite).
// Chaque page fournit son titre, ses éléments de menu, ses onglets et ses actions.
//
// Props : title, menu (éléments de HamburgerMenu), tabs, active, onSelect,
//         actions, darkMode, onToggleDarkMode, ref (mesure de la hauteur)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import ThemeToggle from '../../../../components/ui/ThemeToggle.jsx';
import { HamburgerMenu } from '../../../../components/ui/HamburgerMenu.jsx';
import { VdaTabsNav } from './VdaUi.jsx';

const VdaTopBar = ({ title, menu, tabs, active, onSelect, actions, darkMode, onToggleDarkMode, ref }) => (
    <div className="vda-sticky-top" ref={ref}>
        <header className="vda-header">
            <div className="vda-header-title">{title}</div>
            <div className="flex items-center gap-2">
                <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
                {/* Menu générique (spec_ui_menu.md), habillé dans theme.css, croix pattée partout (§II.10) */}
                <HamburgerMenu button="☰">{menu}</HamburgerMenu>
            </div>
        </header>
        <div className="vda-subheader flex items-end gap-3">
            <div className="flex-1 min-w-0"><VdaTabsNav tabs={tabs} active={active} onSelect={onSelect} /></div>
            <div className="vda-subheader-actions flex items-center gap-2">{actions}</div>
        </div>
    </div>
);

export default VdaTopBar;

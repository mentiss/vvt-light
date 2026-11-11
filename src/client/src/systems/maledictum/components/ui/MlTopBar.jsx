// src/client/src/systems/maledictum/components/ui/MlTopBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Bande fixe du haut (fiche joueur, interface MJ, assistant) : header (marque à
// l'Aquila, flèches de la ruche, sous-titre, thème, menu générique) et
// sous-header (onglets, actions de page à droite). Le header porte le titre du
// jeu, jamais le nom du personnage.
//
// Props : subtitle, menu (éléments de HamburgerMenu, facultatif), tabs, active,
//         onSelect, actions, darkMode, onToggleDarkMode, ref (mesure de la hauteur)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import ThemeToggle from '@/app/components/ThemeToggle.jsx';
import { HamburgerMenu } from '@/ui/menu/HamburgerMenu.jsx';
import Brand from '../../Brand.jsx';
import { MlTabs, Orn } from './MlUi.jsx';

const MlTopBar = ({ subtitle, menu, tabs, active, onSelect, actions, darkMode, onToggleDarkMode, ref }) => (
    <div className="im-sticky-top" ref={ref}>
        <header className="im-band">
            <span className="im-band-spires"><Orn name="spires" /></span>
            <span className="im-band-title"><Brand variant="title" /></span>
            {subtitle && <span className="im-band-sub">{subtitle}</span>}
            <span className="im-band-tools">
                <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
                {menu && <HamburgerMenu button="☰">{menu}</HamburgerMenu>}
            </span>
        </header>
        {(tabs?.length > 0 || actions) && (
            <div className="im-subbar">
                {tabs?.length > 0 && <MlTabs tabs={tabs} active={active} onSelect={onSelect} />}
                <div className="im-actions">{actions}</div>
            </div>
        )}
    </div>
);

export default MlTopBar;

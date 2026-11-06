// src/client/src/systems/fabula/components/ui/FuBand.jsx
// Bande du haut des pages du slug (planche §3) : logo « Fabula Ultima » et son
// surtitre japonais, sous-titre facultatif (« Meneur de jeu »), puis les actions :
// jet libre (si onDice), bascule jour / nuit, et ce que la page passe en enfants
// (le menu hamburger). Jamais le nom du personnage.
//
// Contrat : { subtitle?, darkMode, onToggleDarkMode, onDice?, children }

import React from 'react';
import FuIcon from './FuIcon.jsx';

const FuBand = ({ subtitle, darkMode, onToggleDarkMode, onDice, children }) => (
    <header className="fu-band">
        <div>
            <span className="fu-logo" data-text="Fabula Ultima">Fabula Ultima</span>
            <span className="fu-logo-kana" aria-hidden="true">ファブラ・ウルティマ</span>
        </div>
        {subtitle && <span className="fu-band-sub">{subtitle}</span>}
        <div className="fu-band-actions">
            {onDice && (
                <button type="button" onClick={onDice} className="fu-icon-btn" title="Jet de dés" aria-label="Jet de dés">
                    <FuIcon name="dice" />
                </button>
            )}
            <button type="button" onClick={onToggleDarkMode} className="fu-icon-btn"
                    title={darkMode ? 'Passer au jour' : 'Passer à la nuit'} aria-label={darkMode ? 'Passer au jour' : 'Passer à la nuit'}>
                <FuIcon name={darkMode ? 'sun' : 'moon'} />
            </button>
            {children}
        </div>
    </header>
);

export default FuBand;

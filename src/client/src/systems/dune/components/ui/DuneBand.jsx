// src/client/src/systems/dune/components/ui/DuneBand.jsx
// Bande fixe du slug, commune à la fiche joueur et à l'interface MJ (spec_dune.md §6,
// planche §3 et §7) : header (marque DUNE, rosace de vitrail, arcs, poussière d'épice)
// et sous-header (onglets, actions en icônes, ressources du MJ).
// Collée en haut, sous les fenêtres flottantes ; sa hauteur est mesurée et remontée
// (barre de session, sommaire de l'aide de jeu).

import React, { useEffect, useRef } from 'react';

// Grains de poussière : positions fixes (pseudo-aléatoires, stables d'un rendu à l'autre)
const DUST = Array.from({ length: 26 }, (_, i) => ({
    left:     `${(i * 37.3) % 100}%`,
    top:      `${20 + ((i * 53.7) % 75)}%`,
    delay:    `${-((i * 3.1) % 14)}s`,
    duration: `${10 + ((i * 7.9) % 10)}s`,
}));

/**
 * @param {object}   props
 * @param {string}   [props.eyebrow]        petit libellé à gauche (TABLE, MENEUR)
 * @param {string}   [props.caption]        texte sous le libellé (nom de la table)
 * @param {Array<{ id, label, badge? }>} props.tabs
 * @param {string}   props.activeTab
 * @param {Function} props.onTabChange      (id) => void
 * @param {React.ReactNode} [props.actions] boutons du sous-header (à droite des onglets)
 * @param {React.ReactNode} [props.right]   boutons du header (thème, menu)
 * @param {Function} [props.onHeightChange] (px) => void
 */
const DuneBand = ({ eyebrow, caption, tabs, activeTab, onTabChange, actions, right, onHeightChange }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current || !onHeightChange) return;
        const observer = new ResizeObserver(([entry]) => onHeightChange(Math.round(entry.borderBoxSize?.[0]?.blockSize ?? entry.target.offsetHeight)));
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [onHeightChange]);

    return (
        <div ref={ref} className="dn-band is-sticky">
            <div className="dn-band-head">
                <div className="dn-dust" aria-hidden="true">
                    {DUST.map((g, i) => (
                        <i key={i} style={{ left: g.left, top: g.top, animationDelay: g.delay, animationDuration: g.duration }} />
                    ))}
                </div>
                <svg className="dn-band-arc" viewBox="0 0 1200 66" preserveAspectRatio="none" aria-hidden="true">
                    <g fill="none" stroke="currentColor" strokeWidth=".8">
                        <path d="M0 58 Q600 -30 1200 58" />
                        <path d="M200 66 Q600 14 1000 66" strokeDasharray="2 6" />
                    </g>
                </svg>
                {(eyebrow || caption) && (
                    <div className="dn-band-left">{eyebrow}{caption && <b>{caption}</b>}</div>
                )}
                <div className="dn-brand">DUNE</div>
                <div className="dn-brand-sub">AVENTURES DANS L'IMPERIUM</div>
                {right && <div className="dn-band-right">{right}</div>}
            </div>
            <nav className="dn-sub">
                {tabs.map(tab => (
                    <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)}
                            className={`dn-tab${activeTab === tab.id ? ' is-active' : ''}`}>
                        {tab.label}
                        {tab.badge > 0 && <span className="dn-badge">{tab.badge}</span>}
                    </button>
                ))}
                {actions && <div className="dn-sub-actions">{actions}</div>}
            </nav>
        </div>
    );
};

export default DuneBand;

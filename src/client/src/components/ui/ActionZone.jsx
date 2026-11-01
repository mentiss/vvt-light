// src/client/src/components/ui/ActionZone.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Zone d'actions de la plateforme, en bas à droite (documentations/spec_ui_actions.md §6.2).
//
// - ActionZoneProvider : posé par PlayerPage / GMPage autour de la page du slug,
//   comme ModalHostProvider ; rend la zone et partage ses emplacements par contexte.
// - ZoneAction : rendu par portail dans la zone (comme HostedModal), où qu'il soit
//   monté : la brique de la plateforme qui le rend (musique, historique…) y pose son
//   bouton, et le retire en se démontant. Réservé aux briques de la plateforme (v1).
//
// Deux affichages, au choix de chacun (mémorisé par slug : vtt:<slug>:actions) :
// boutons en ligne, ou mini-menu (un bouton qui déplie la liste vers le haut) ;
// mini-menu imposé sur petit écran. Un seul composant de bouton, deux rendus :
// .vtt-action-btn (habillé par le theme.css du slug) ou .vtt-menu-item (habillage
// du menu du slug). L'icône de base d'une action peut être remplacée par le slug
// dans son config.jsx : actionIcons: { <id>: <icône> }.
//
// La zone publie la hauteur de sa rangée dans --vtt-actions-offset (sur <html>) :
// les notifications se placent au-dessus.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { getSystemFromPath } from '../../hooks/useSystem.js';
import useSlugConfig from '../../hooks/useSlugConfig.js';
import { useSmallScreen } from './FloatingPanel.jsx';

const ActionZoneContext = createContext(null);
const PREFS_DEFAULTS = { collapsed: false };

const Glyph = ({ d }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={d} />
    </svg>
);
const MORE = 'M5 12h.01M12 12h.01M19 12h.01';
const COLLAPSE = 'M9 6l6 6-6 6';

export const ActionZoneProvider = ({ children }) => {
    const slugConfig = useSlugConfig();
    const small = useSmallScreen();
    const [prefs, setPrefs] = usePersistedState(getSystemFromPath(), 'actions', { defaults: PREFS_DEFAULTS });
    const mini = small || prefs.collapsed;

    const [listOpen, setListOpen] = useState(false);
    const [buttonsHost, setButtonsHost] = useState(null);
    const [panelsHost, setPanelsHost] = useState(null);
    const zoneRef = useRef(null);
    const barRef = useRef(null);

    const closeList = useCallback(() => setListOpen(false), []);
    const setCollapsed = (collapsed) => { setListOpen(false); setPrefs(prev => ({ ...prev, collapsed })); };

    // Hauteur de la rangée (pas des volets) pour les notifications ; 0 si la zone est vide
    useEffect(() => {
        const bar = barRef.current;
        if (!bar) return undefined;
        const root = document.documentElement;
        const update = () => {
            const rect = bar.getBoundingClientRect();
            root.style.setProperty('--vtt-actions-offset', rect.height ? `${Math.max(0, window.innerHeight - rect.top)}px` : '0px');
        };
        const observer = new ResizeObserver(update);
        observer.observe(bar);
        window.addEventListener('resize', update);
        update();
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', update);
            root.style.removeProperty('--vtt-actions-offset');
        };
    }, [mini]);

    // Mini-menu ouvert : un clic ailleurs ou Échap le referme
    useEffect(() => {
        if (!listOpen) return undefined;
        const onPointer = (e) => { if (!zoneRef.current?.contains(e.target)) setListOpen(false); };
        const onKey = (e) => { if (e.key === 'Escape') setListOpen(false); };
        document.addEventListener('pointerdown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('pointerdown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [listOpen]);

    const value = useMemo(() => ({ buttonsHost, panelsHost, mini, closeList, icons: slugConfig?.actionIcons ?? null }),
        [buttonsHost, panelsHost, mini, closeList, slugConfig]);

    return (
        <ActionZoneContext.Provider value={value}>
            {children}
            <div ref={zoneRef} className={`vtt-actions${mini ? ' is-mini' : ''}${listOpen ? ' is-open' : ''}`}>
                <div className="vtt-actions-panels" ref={setPanelsHost} />
                {mini ? (
                    <>
                        <div className="vtt-menu vtt-actions-list" hidden={!listOpen}>
                            <div className="vtt-actions-buttons" ref={setButtonsHost} />
                            {!small && (
                                <>
                                    <div className="vtt-menu-separator" />
                                    <button type="button" className="vtt-menu-item" onClick={() => setCollapsed(false)}>Afficher les boutons</button>
                                </>
                            )}
                        </div>
                        <div className="vtt-actions-bar" ref={barRef}>
                            <button type="button" className="vtt-action-btn vtt-actions-toggle" onClick={() => setListOpen(v => !v)}
                                    title="Actions" aria-label="Actions" aria-expanded={listOpen}>
                                <Glyph d={MORE} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="vtt-actions-bar" ref={barRef}>
                        <div className="vtt-actions-buttons" ref={setButtonsHost} />
                        <button type="button" className="vtt-actions-collapse" onClick={() => setCollapsed(true)}
                                title="Replier en menu" aria-label="Replier les actions en menu">
                            <Glyph d={COLLAPSE} />
                        </button>
                    </div>
                )}
            </div>
        </ActionZoneContext.Provider>
    );
};

/**
 * Action de la zone, rendue par portail (rien sans ActionZoneProvider).
 * @param {object}   props
 * @param {string}   props.id            identifiant (clé de surcharge de l'icône : actionIcons.<id>)
 * @param {React.ReactNode} props.icon   icône de base de la plateforme
 * @param {string}   props.label         libellé (infobulle en boutons, texte en mini-menu)
 * @param {number}   [props.order=0]     place dans la zone, fixée par la plateforme
 * @param {boolean}  [props.active]      sa fenêtre ou son volet est ouvert
 * @param {boolean}  [props.highlighted] quelque chose tourne (ex. musique en lecture)
 * @param {Function} props.onSelect
 * @param {React.ReactNode} [props.children] volet, affiché au-dessus de la zone quand `active`
 */
export const ZoneAction = ({ id, icon, label, order = 0, active = false, highlighted = false, onSelect, children }) => {
    const zone = useContext(ActionZoneContext);
    if (!zone) return null;

    const shownIcon = zone.icons?.[id] ?? icon;
    const states = `${active ? ' is-active' : ''}${highlighted ? ' is-highlighted' : ''}`;
    const button = zone.mini ? (
        <button type="button" className={`vtt-menu-item vtt-action-item${states}`} style={{ order }}
                aria-pressed={active} onClick={() => { zone.closeList(); onSelect?.(); }}>
            <span className="vtt-menu-icon">{shownIcon}</span>{label}
        </button>
    ) : (
        <button type="button" className={`vtt-action-btn${states}`} style={{ order }}
                title={label} aria-label={label} aria-pressed={active} onClick={onSelect}>
            {shownIcon}
        </button>
    );

    return (
        <>
            {zone.buttonsHost && createPortal(button, zone.buttonsHost)}
            {active && children && zone.panelsHost && createPortal(children, zone.panelsHost)}
        </>
    );
};

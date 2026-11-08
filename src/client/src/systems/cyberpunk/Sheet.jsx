// src/client/src/systems/cyberpunk/Sheet.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fiche joueur Cyberpunk — The Sprawl (adaptation 2d10)
//
// Layout :
//   Header  — marque, code d'accès, Édition, XP, menu
//   Onglets — Fiche | Journal | Historique | Référence (la table en cours à droite)
//   Fiche   — SheetBody, commun avec la vue MJ (spec_cyberpunk.md §4) ; état et
//             écritures dans useSheetEditor. Ici : jets (MoveModal) et dépense d'XP.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';

// Composants génériques
import ThemeToggle         from '../../components/ui/ThemeToggle.jsx';
import ToastNotifications  from '../../components/layout/ToastNotifications.jsx';
import SessionPlayersBar   from '../../components/layout/SessionPlayersBar.jsx';
import JournalTab          from '../../components/tabs/JournalTab.jsx';
import DiceHistoryPage     from '../../components/layout/DiceHistoryPage.jsx';
import { HamburgerMenu, HamburgerMenuSeparator } from '../../components/ui/HamburgerMenu.jsx';
import {
    HamburgerMenuItemCreateCharacter, HamburgerMenuItemSwitchCharacter, HamburgerMenuItemAccessCode,
    HamburgerMenuItemFreeDice, HamburgerMenuItemDiceConfig, HamburgerMenuItemGMInterface, HamburgerMenuItemLogout,
} from '../../components/ui/HamburgerMenuItems.jsx';

// Composants Cyberpunk
import MoveModal           from './components/modals/MoveModal.jsx';

import { useSystem }  from '../../hooks/useSystem.js';
import { useFetch }   from '../../hooks/useFetch.js';
import { useSession } from '../../context/SessionContext.jsx';
import { useTableWeather } from './hooks/useTableWeather.js';
import {XPPanel} from "./components/modals/XPPanel.jsx";
import {XPButton} from "./components/layout/ResourceStrip.jsx";
import {SheetBody} from "./components/layout/SheetBody.jsx";
import { useSheetEditor } from './hooks/useSheetEditor.js';
import BoltFarm from "./components/ui/BoltFarm.jsx";
import ReferenceTab from "./components/ReferenceTab.jsx";
import CpWorld, { CpAnimationsMenuItem } from "./components/ui/CpWorld.jsx";
import CpIcon from "./components/ui/CpIcon.jsx";

// ── Onglets ───────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'fiche',      label: 'Fiche',      icon: 'sheet'     },
    { id: 'journal',    label: 'Journal',    icon: 'journal'   },
    { id: 'historique', label: 'Historique', icon: 'history'   },
    { id: 'reference',  label: 'Référence',  icon: 'reference' },
];


const AccessKeyBadge = ({ code }) => {
    const [isClicking, setIsClicking] = React.useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 200);
    };

    return (
        <div
            onClick={copyToClipboard}
            className={`
                group cursor-pointer flex items-center gap-2 px-2 py-1 rounded border
                font-['CyberConsole'] transition-all duration-300
                bg-surface/10 border-primary/30 
                hover:bg-primary/10 hover:border-primary/100 hover:glow-primary-sm
                active:scale-95
                ${isClicking ? 'animate-glitch-quick border-accent/100 glow-accent-md' : ''}
            `}
        >
            <span className="text-[9px] uppercase text-primary/40 group-hover:text-accent/100 transition-colors">
                Access Key
            </span>
            <span className="text-xs font-bold tracking-widest text-primary/10 blur-[2px] group-hover:blur-0 group-hover:text-primary/100 group-hover:glow-primary-3xs transition-all duration-500">
                {code}
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/100 glow-primary-xs animate-pulse group-hover:bg-secondary group-hover:glow-secondary-xs" />
        </div>
    );
};

// ── Sheet ─────────────────────────────────────────────────────────────────────
// onLogout (PlayerPage) n'est plus utilisé : la déconnexion du menu ramène à l'accueil
const Sheet = ({
                   character,
                   onCharacterUpdate,
                   darkMode,
                   onToggleDarkMode,
                   journalUnread,
                   onJournalRead,
               }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();
    const { activeGMSession, activeSessionName } = useSession();

    // ── État UI ───────────────────────────────────────────────────────────────
    const [activeTab,      setActiveTab]      = useState(() => {
        const h = window.location.hash.replace('#', '');
        return TABS.some(t => t.id === h) ? h : 'fiche';
    });
    const [showXPPanel,    setShowXPPanel]    = useState(false);

    // État et écritures de la fiche, partagés avec la vue MJ (spec_cyberpunk.md §4)
    const editor = useSheetEditor(character, onCharacterUpdate);
    const { editMode, setEditMode, char } = editor;

    // Météo choisie par le MJ pour la table (spec_cyberpunk.md §3.1)
    const { weather: tableWeather } = useTableWeather(activeGMSession);

    // Hauteur de l'en-tête et des onglets, mesurée (la barre de session se place dessous)
    const tabsRef = useRef(null);
    const [topHeight, setTopHeight] = useState(125);
    useEffect(() => {
        const el = tabsRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return undefined;
        const measure = () => setTopHeight(Math.round(el.getBoundingClientRect().bottom));
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        ro.observe(document.body);   // l'observation donne aussi la première mesure
        return () => ro.disconnect();
    }, []);

    // Bibliothèque des manœuvres, fenêtre de jet
    const [allMoves,       setAllMoves]       = useState([]);
    const [movesLoading,   setMovesLoading]   = useState(false);
    const [moveModal,      setMoveModal]      = useState(null); // { mode, move?, statKey? }

    // ── Chargement des moves ──────────────────────────────────────────────────
    useEffect(() => {
        if (!apiBase) return;
        setMovesLoading(true);
        fetchWithAuth(`${apiBase}/moves`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setAllMoves(Array.isArray(data) ? data : []))
            .catch(() => setAllMoves([]))
            .finally(() => setMovesLoading(false));
    }, [apiBase]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const changeTab = (tab) => {
        setActiveTab(tab);
        window.location.hash = tab;
        if (tab === 'journal') onJournalRead?.();
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="cp-root flex flex-col h-screen">
            {/* Ville et météo derrière l'interface (spec_cyberpunk.md §3.1) : celle de la table */}
            <CpWorld weather={tableWeather} />
            <ToastNotifications
                sessionId={activeGMSession}
            />

            {/* ── Header ───────────────────────────────────────────────── */}
            <header className="cp-bar flex items-center justify-between px-2 py-1 sticky top-0 z-30">
                <div className="text-center ml-3 gap-0 min-w-0 group relative flex flex-col items-center">

                    <div  className="relative cp-brand-glitch cp-brand-pulse">
                        <BoltFarm />

                        <div className="text-[38px] cp-font-title text-accent tracking-widest cp-brand-stroke relative z-10">
                            CyberPunk
                        </div>
                    </div>

                    <div className="relative mt-0.5 mb-0.5 cp-divider w-full opacity-70"></div>
                    <p className="relative text-xs cp-font-ui uppercase tracking-widest text-muted">
                        The Sprawl — édition Ré²
                    </p>
                </div>

                {/* Actions droite */}
                <div className="flex items-center gap-2">
                    <AccessKeyBadge code={character.accessCode} />

                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

                    {editMode ? (
                        <>
                            <button onClick={editor.cancel} className="cp-btn is-ghost">
                                Annuler
                            </button>
                            <button onClick={editor.save} className="cp-btn is-primary">
                                Sauvegarder
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setEditMode(true)} className="cp-btn">
                            <CpIcon name="edit" /> Édition
                        </button>
                    )}

                    {/* XP : barre jusqu'au prochain avancement, 5 avancements de base (spec §4) */}
                    <XPButton
                        xp={char?.xp ?? 0}
                        baseAdvancements={char?.baseAdvancements ?? 0}
                        onOpen={() => setShowXPPanel(true)}
                        onChange={(v) => editor.patchResource('xp', v)}
                    />

                    {/* Hamburger générique (spec_ui_menu.md), habillé dans theme.css, icônes dessinées du slug */}
                    <HamburgerMenu>
                        <HamburgerMenuItemCreateCharacter icon={<CpIcon name="newChar" />} />
                        <HamburgerMenuItemSwitchCharacter icon={<CpIcon name="switch" />} currentCharId={character?.id} />
                        <HamburgerMenuSeparator />
                        <HamburgerMenuItemAccessCode icon={<CpIcon name="key" />} character={character} onSuccess={onCharacterUpdate} />
                        <HamburgerMenuSeparator />
                        <HamburgerMenuItemFreeDice
                            icon={<CpIcon name="d10" />}
                            characterId={character.id}
                            characterName={character.prenom || character.nom || 'Anonyme'}
                            sessionId={activeGMSession}
                        />
                        <HamburgerMenuItemDiceConfig icon={<CpIcon name="gear" />} />
                        <CpAnimationsMenuItem />
                        <HamburgerMenuSeparator />
                        <HamburgerMenuItemGMInterface icon={<CpIcon name="mask" />} />
                        <HamburgerMenuSeparator />
                        <HamburgerMenuItemLogout icon={<CpIcon name="logout" />} />
                    </HamburgerMenu>

                </div>


            </header>

            {/* ── Onglets : à leur largeur, la table en cours à droite (spec §3.2) ── */}
            <nav className="cp-tabs" ref={tabsRef}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => changeTab(tab.id)}
                        className={`cp-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                    >
                        <CpIcon name={tab.icon} size="sm" />
                        {tab.label}
                        {tab.id === 'journal' && journalUnread > 0 && (
                            <span className="cp-tab-badge">{journalUnread}</span>
                        )}
                    </button>
                ))}
                {activeSessionName && (
                    <div className="cp-tabs-aside">
                        <span className="cp-tabs-session">Table : <b>{activeSessionName}</b></span>
                    </div>
                )}
            </nav>

            {/* ── Contenu ───────────────────────────────────────────────── */}
            <main className="flex flex-1 min-h-0">
                <SessionPlayersBar
                    character={character}
                    sessionId={activeGMSession}
                    sessionName={activeSessionName}
                    headerHeight={topHeight}
                    noWidthWhenCollapsed={true}
                />
                <div className="flex-1 min-w-0 overflow-hidden">
                    {/* ── FICHE (spec_cyberpunk.md §4) : corps commun avec la vue MJ ── */}
                    {activeTab === 'fiche' && (
                        <SheetBody
                            editor={editor}
                            allMoves={allMoves}
                            movesLoading={movesLoading}
                            variant="player"
                            onRollStat={(statKey) => setMoveModal({ mode: 'stat', statKey })}
                            onRollMove={(move) => setMoveModal({ mode: 'move', move })}
                        />
                    )}

                    {/* ── JOURNAL ────────────────────────────────────────────── */}
                    {activeTab === 'journal' && (
                        <div className="h-full overflow-y-auto cp-scroll p-4">
                            <JournalTab
                                characterId={character.id}
                                onRead={onJournalRead}
                            />
                        </div>
                    )}

                    {/* ── HISTORIQUE ─────────────────────────────────────────── */}
                    {activeTab === 'historique' && (
                        <div className="h-full overflow-y-auto cp-scroll p-4">
                            <DiceHistoryPage
                                sessionId={activeGMSession}
                            />
                        </div>
                    )}

                    {activeTab === 'reference' && (
                        <ReferenceTab />
                    )}
                </div>

            </main>

            {/* ── Modales ───────────────────────────────────────────────── */}
            {moveModal && (
                <MoveModal
                    mode={moveModal.mode}
                    move={moveModal.move}
                    statKey={moveModal.statKey}
                    character={character}
                    sessionId={activeGMSession}
                    onClose={() => setMoveModal(null)}
                />
            )}
            {showXPPanel && (
                <XPPanel
                    character={character}
                    onUpdate={(updated) => {
                        onCharacterUpdate(updated);
                        setShowXPPanel(false);
                    }}
                    onClose={() => setShowXPPanel(false)}
                />
            )}
        </div>
    );
};

export default Sheet;
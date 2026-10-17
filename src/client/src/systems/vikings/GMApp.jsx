// src/client/src/systems/vikings/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface MJ Vikings — architecture fusionnée (plus d'indirection GMView) :
// bandeau, onglets et modales globales vivent ici.
// Spec : documentations/spec_vikings_lot3_client.md §5.1, habillage lot 4.
//
// Contrat props (GMPage) :
//   activeSession, onSessionChange, onlineCharacters, characterUpdates,
//   darkMode, onToggleDarkMode
//
// Le combat (hors périmètre de la refonte) est fourni tel quel par useCombat.
// theme.css est chargé par GMPage (import.meta.glob), pas importé ici.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';

import ToastNotifications   from '../../components/layout/ToastNotifications.jsx';
import DiceHistoryPage      from '../../components/layout/DiceHistoryPage.jsx';
import DiceConfigModal      from '../../components/modals/DiceConfigModal.jsx';
import FreeDiceModal        from '../../components/modals/FreeDiceModal.jsx';
import TableManagementModal from '../../components/gm/modals/TableManagementModal.jsx';
import TabJournal           from '../../components/gm/tabs/TabJournal.jsx';
import { useAuth }          from '../../context/AuthContext.jsx';

import TabSession          from './gm/tabs/TabSession.jsx';
import TabCombat           from './gm/tabs/TabCombat.jsx';
import GMDiceModal         from './gm/modals/GMDiceModal.jsx';
import { useCombat }       from './gm/useCombat.js';
import VikingsHistoryEntry from './components/layout/VikingsHistoryEntry.jsx';
import VkIcon              from './components/ui/VkIcon.jsx';
import vikingsConfig       from './config.jsx';

const TABS = [
    { id: 'session',    label: 'Session' },
    { id: 'combat',     label: 'Combat' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
];

const MenuItem = ({ icon, onClick, danger = false, children }) => (
    <button type="button" onClick={onClick} className={`vk-menu-item ${danger ? 'is-danger' : ''}`}>
        <VkIcon name={icon} />{children}
    </button>
);

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    const { logout } = useAuth();
    const combat     = useCombat(onlineCharacters);
    const sessionId  = activeSession?.id ?? null;

    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.substring(1);
        return TABS.some(t => t.id === hash) ? hash : 'session';
    });
    useEffect(() => { window.location.hash = activeTab; }, [activeTab]);

    const [showMenu,       setShowMenu]       = useState(false);
    const [showTableMgmt,  setShowTableMgmt]  = useState(false);
    const [showDiceConfig, setShowDiceConfig] = useState(false);
    const [showFreeDice,   setShowFreeDice]   = useState(false);
    const [showGMDice,     setShowGMDice]     = useState(false);

    const goHome = () => {
        window.history.pushState({}, '', '/');
        window.location.reload();
    };
    const handleLogout = async () => {
        await logout();
        goHome();
    };
    const openMenuEntry = (open) => () => { setShowMenu(false); open(); };

    return (
        <div className="vk-root min-h-screen" data-theme={darkMode ? 'dark' : 'light'}>

            {/* ── BANDEAU + ONGLETS (collants) ── */}
            <div className="sticky top-0 z-40">
                <header className="vk-header px-4 py-3 flex justify-between items-center gap-3">
                    <div className="min-w-0">
                        <div className="vk-title text-2xl flex items-center gap-2"><VkIcon name="helm" />Interface MJ</div>
                        <div className="vk-eyebrow truncate">{activeSession ? `Table : ${activeSession.name}` : 'Aucune table active'}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => setShowGMDice(true)} className="vk-btn vk-btn-primary vk-btn-sm" title="Jet MJ (pool de d10)">
                            <VkIcon name="die" />Jet MJ
                        </button>
                        <button type="button" onClick={onToggleDarkMode} className="vk-btn vk-btn-icon"
                                title={darkMode ? 'Mode jour (bois)' : 'Mode nuit (fer)'}>
                            <VkIcon name={darkMode ? 'sun' : 'moon'} />
                        </button>
                        <div className="relative">
                            <button type="button" onClick={() => setShowMenu(v => !v)} className="vk-btn vk-btn-icon" title="Menu">
                                <VkIcon name="menu" />
                            </button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                    <div className="vk-menu absolute right-0 mt-2 z-50">
                                        <MenuItem icon="people" onClick={openMenuEntry(() => setShowTableMgmt(true))}>Gestion des tables</MenuItem>
                                        <MenuItem icon="dice"   onClick={openMenuEntry(() => setShowFreeDice(true))}>Jet de dés libre</MenuItem>
                                        <MenuItem icon="horn"   onClick={openMenuEntry(() => setShowDiceConfig(true))}>Config animations dés</MenuItem>
                                        <div className="vk-menu-sep" />
                                        <MenuItem icon="longhouse" onClick={openMenuEntry(goHome)}>Retour à l'accueil</MenuItem>
                                        <MenuItem icon="door" onClick={openMenuEntry(handleLogout)} danger>Déconnexion</MenuItem>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="px-4 bg-surface">
                    <nav className="vk-tabs">
                        {TABS.map(tab => (
                            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                                    className={`vk-tab ${activeTab === tab.id ? 'is-active' : ''}`}>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* ── CONTENU (toute la largeur) ── */}
            <main className="p-4 md:p-6">
                {activeTab === 'session' && (
                    <TabSession activeSession={activeSession} onlineCharacters={onlineCharacters} characterUpdates={characterUpdates} />
                )}
                {activeTab === 'combat' && <TabCombat {...combat} />}
                {activeTab === 'journal' && (
                    <div className="max-w-4xl mx-auto">
                        {/* TabJournal force characterId={-1} en interne */}
                        <TabJournal />
                    </div>
                )}
                {activeTab === 'historique' && (
                    <div className="max-w-4xl mx-auto">
                        <DiceHistoryPage sessionId={sessionId} renderHistoryEntry={vikingsConfig.dice.renderHistoryEntry} />
                    </div>
                )}
            </main>

            {/* ── Modales globales ── */}
            {showTableMgmt && (
                <TableManagementModal
                    isOpen
                    onClose={() => setShowTableMgmt(false)}
                    activeSessionId={sessionId}
                    onSelectTable={(session) => onSessionChange(session ?? null)}
                />
            )}
            {showGMDice && <GMDiceModal onClose={() => setShowGMDice(false)} darkMode={darkMode} sessionId={sessionId} />}
            {showFreeDice && <FreeDiceModal sessionId={sessionId} isGM onClose={() => setShowFreeDice(false)} />}
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}

            {/* Notifications en dernier : devant les modales (même z-index) */}
            <ToastNotifications
                sessionId={sessionId}
                renderDiceToast={(toast) => <VikingsHistoryEntry entry={toast} compact />}
                renderAllRollTypes
            />
        </div>
    );
};

export default GMApp;

import { useState } from 'react';
import { useAuth }   from '../../../context/AuthContext.jsx';
import { useSystem } from '../../../hooks/useSystem.js';

import ThemeToggle          from '../../../components/ui/ThemeToggle.jsx';
import ToastNotifications   from '../../../components/layout/ToastNotifications.jsx';
import DiceHistoryPage      from '../../../components/layout/DiceHistoryPage.jsx';
import TableManagementModal from '../../../components/gm/modals/TableManagementModal.jsx';
import FreeDiceModal        from '../../../components/modals/FreeDiceModal.jsx';
import TabJournal           from '../../../components/gm/tabs/TabJournal.jsx';

import GearBackground   from '../components/ui/GearBackground.jsx';
import NoctisLogo       from '../components/ui/NoctisLogo.jsx';
import TabSession       from './tabs/TabSession.jsx';
import TabReserveGroupe from './tabs/TabReserveGroupe.jsx';
import noctisConfig     from '../config.jsx';

/* ── Onglets ─────────────────────────────────────────────────────────────── */
const GM_TABS = [
    { id: 'session',    label: '◆ Session'    },
    { id: 'groupe',     label: '✦ Compagnie'  },
    { id: 'journal',    label: '⧉ Journal'    },
    { id: 'historique', label: '⬡ Historique' },
];

/* ══════════════════════════════════════════════════════════════════════════ */
const GMView = ({ activeSession, onSessionChange, onlineCharacters, darkMode, onToggleDarkMode }) => {
    const { logout }  = useAuth();
    const { apiBase } = useSystem();

    const [activeTab,      setActiveTab]      = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return GM_TABS.some(t => t.id === hash) ? hash : 'session';
    });
    const [showTableModal, setShowTableModal] = useState(false);
    const [showFreeDice,   setShowFreeDice]   = useState(false);
    const [showMenu,       setShowMenu]       = useState(false);

    const changeTab = (id) => {
        setActiveTab(id);
        window.location.hash = id;
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = `/${apiBase.replace('/api/', '')}/gm`;
    };

    return (
        <div className="ns-page min-h-screen flex flex-col" data-theme={darkMode ? 'dark' : ''}>

            <GearBackground />

            {/* ── Header + Tabbar dans un seul bloc sticky ─────────────────
                Regroupés pour éviter le gap lié au décalage de hauteur entre
                les deux éléments sticky indépendants.                          */}
            <div className="ns-header-group">

                <header className="ns-header px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <NoctisLogo />
                        <div className="ns-header-sep" />
                        {activeSession
                            ? <span className="ns-session-badge">● {activeSession.name}</span>
                            : <span className="ns-no-session-label">Aucune session</span>
                        }
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowFreeDice(true)} className="ns-btn-ghost">
                            ⬡ Dés
                        </button>
                        <button onClick={() => setShowTableModal(true)} className="ns-btn-ghost">
                            ⚙ Table
                        </button>
                        <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

                        <div className="relative">
                            <button onClick={() => setShowMenu(v => !v)} className="ns-btn-ghost">
                                ☰
                            </button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                    <div className="ns-card ns-header-menu">
                                        <button onClick={handleLogout} className="ns-header-menu-item">
                                            Déconnexion
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <nav className="ns-tabbar" style={{ position: 'static' }}>
                    {GM_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => changeTab(tab.id)}
                            className={`ns-tab ${activeTab === tab.id ? 'active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* ── Contenu ──────────────────────────────────────────────── */}
            <main className="flex-1 overflow-auto" style={{ zIndex: 1, position: 'relative' }}>

                {activeTab === 'session' && (
                    <TabSession
                        activeSession={activeSession}
                        onlineCharacters={onlineCharacters}
                    />
                )}

                {activeTab === 'groupe' && (
                    <div className="max-w-2xl mx-auto p-4">
                        <TabReserveGroupe />
                    </div>
                )}

                {activeTab === 'journal' && (
                    <div className="max-w-4xl mx-auto p-4">
                        <TabJournal characterId={-1} />
                    </div>
                )}

                {activeTab === 'historique' && (
                    <div className="max-w-4xl mx-auto p-4">
                        <DiceHistoryPage
                            sessionId={activeSession?.id ?? null}
                            renderHistoryEntry={noctisConfig.dice.renderHistoryEntry}
                        />
                    </div>
                )}
            </main>

            <ToastNotifications sessionId={activeSession?.id} />

            {showFreeDice && (
                <FreeDiceModal
                    sessionId={activeSession?.id ?? null}
                    isGM={true}
                    onClose={() => setShowFreeDice(false)}
                />
            )}

            {showTableModal && (
                <TableManagementModal
                    isOpen={true}
                    activeSessionId={activeSession?.id ?? null}
                    onSelectTable={(session) => { onSessionChange?.(session); setShowTableModal(false); }}
                    onClose={() => setShowTableModal(false)}
                />
            )}
        </div>
    );
};

export default GMView;
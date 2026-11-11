import { useState } from 'react';
import { HamburgerMenu } from '@/ui/menu/HamburgerMenu.jsx';
import { HamburgerMenuItemLogout } from '@/features/table/HamburgerMenuItems.jsx';

import ThemeToggle          from '@/app/components/ThemeToggle.jsx';
import ToastNotifications   from '@/features/table/ToastNotifications.jsx';
import DiceHistoryPage      from '@/features/dice/history/DiceHistoryPage.jsx';
import TableManagementButton from '@/features/table/TableManagementButton.jsx';
import FreeDiceModal        from '@/features/dice/modals/FreeDiceModal.jsx';
import TabJournal           from '@/features/journal/TabJournal.jsx';

import GearBackground   from '../components/ui/GearBackground.jsx';
import NoctisLogo       from '../components/ui/NoctisLogo.jsx';
import TabSession       from './tabs/TabSession.jsx';
import TabReserveGroupe from './tabs/TabReserveGroupe.jsx';

/* ── Onglets ─────────────────────────────────────────────────────────────── */
const GM_TABS = [
    { id: 'session',    label: '◆ Session'    },
    { id: 'groupe',     label: '✦ Compagnie'  },
    { id: 'journal',    label: '⧉ Journal'    },
    { id: 'historique', label: '⬡ Historique' },
];

/* ══════════════════════════════════════════════════════════════════════════ */
const GMView = ({ activeSession, onSessionChange, onlineCharacters, darkMode, onToggleDarkMode }) => {

    const [activeTab,      setActiveTab]      = useState(() => {
        const hash = window.location.hash.replace('#', '');
        return GM_TABS.some(t => t.id === hash) ? hash : 'session';
    });
    const [showFreeDice,   setShowFreeDice]   = useState(false);

    const changeTab = (id) => {
        setActiveTab(id);
        window.location.hash = id;
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
                        {/* Gestion des tables : brique de la plateforme (spec_ui_menu.md §12) */}
                        <TableManagementButton activeSessionId={activeSession?.id ?? null}
                                               onSelectTable={(session) => onSessionChange?.(session)}
                                               label="⚙ Table" icon={null} className="ns-btn-ghost" />
                        <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

                        {/* Menu hamburger générique (spec_ui_menu.md) : mécanique seule, sans habillage
                            (refonte du slug à venir) */}
                        <HamburgerMenu button="☰" buttonClassName="ns-btn-ghost">
                            <HamburgerMenuItemLogout icon={null} />
                        </HamburgerMenu>
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
                        onSessionChange={onSessionChange}
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
        </div>
    );
};

export default GMView;
// src/client/src/systems/fabula/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Point d'entrée GM — contrat imposé par GMPage.jsx.
//
// Note d'architecture : contrairement au pattern GMApp→GMView utilisé sur les
// autres slugs (une indirection qui ne fait que relayer les props sans
// aucune logique propre), on fusionne tout ici directement. Pas de raison de
// garder un fichier intermédiaire qui n'apporte rien — à reprendre comme
// nouveau standard sur les prochains slugs.
//
// Header (titre + actions) + onglets Session/Journal/Historique. Modales
// globales (Table, Config dés, Jet libre) vivent ici, pas dans TabSession.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import './theme.css';

import ThemeToggle        from '../../components/ui/ThemeToggle.jsx';
import ToastNotifications from '../../components/layout/ToastNotifications.jsx';
import DiceHistoryPage    from '../../components/layout/DiceHistoryPage.jsx';
import DiceConfigModal    from '../../components/modals/DiceConfigModal.jsx';
import FreeDiceModal      from '../../components/modals/FreeDiceModal.jsx';
import TableManagementModal from '../../components/gm/modals/TableManagementModal.jsx';
import TabJournal          from '../../components/gm/tabs/TabJournal.jsx';

import TabSession          from './gm/tabs/TabSession.jsx';
import FabulaHistoryEntry  from './components/layout/FabulaHistoryEntry.jsx';
import fabulaConfig        from './config.jsx';

const TABS = [
    { id: 'session',    label: '🎭 Session' },
    { id: 'journal',    label: '📓 Journal' },
    { id: 'historique', label: '📜 Historique' },
];

const GMApp = ({ activeSession, onSessionChange, onlineCharacters, characterUpdates, darkMode, onToggleDarkMode }) => {
    const [activeTab, setActiveTab]       = useState('session');
    const [showMenu, setShowMenu]         = useState(false);
    const [showTableMgmt, setShowTableMgmt] = useState(false);
    const [showFreeDice, setShowFreeDice] = useState(false);
    const [showDiceConfig, setShowDiceConfig] = useState(false);

    return (
        <div className="min-h-screen bg-default text-default fu-font-body" data-theme={darkMode ? 'dark' : 'light'}>

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <header className="flex items-center justify-between px-4 py-2 border-b border-default bg-surface">
                <div className="flex items-center gap-2">
                    <h1 className="fu-font-logo text-2xl text-primary">Fabula Ultima</h1>
                    <span className="text-xs text-muted">— Meneur de Jeu</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowFreeDice(true)} className="px-3 py-1.5 rounded bg-primary text-white text-sm">
                        🎲
                    </button>
                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
                    <div className="relative">
                        <button onClick={() => setShowMenu(v => !v)}
                                className="w-9 h-9 rounded flex items-center justify-center border border-default bg-default">
                            ☰
                        </button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="absolute right-0 mt-1 w-56 bg-surface border border-default rounded-lg shadow-lg z-50 py-1">
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-surface-alt"
                                            onClick={() => { setShowMenu(false); setShowTableMgmt(true); }}>
                                        ⚙ Gestion des tables
                                    </button>
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-surface-alt"
                                            onClick={() => { setShowMenu(false); setShowDiceConfig(true); }}>
                                        🎛️ Config animations dés
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── ONGLETS ─────────────────────────────────────────────────── */}
            <nav className="flex gap-1 px-4 border-b border-default bg-surface-alt">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-2 text-sm border-b-2 ${
                                activeTab === tab.id ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted'
                            }`}>
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* ── CONTENU ─────────────────────────────────────────────────── */}
            <main className="flex-1">
                {activeTab === 'session' && (
                    <TabSession activeSession={activeSession} onlineCharacters={onlineCharacters} characterUpdates={characterUpdates} />
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
                            renderHistoryEntry={fabulaConfig.dice.renderHistoryEntry}
                        />
                    </div>
                )}
            </main>

            {/* ── TOASTS ──────────────────────────────────────────────────── */}
            <ToastNotifications
                sessionId={activeSession?.id ?? null}
                renderDiceToast={(toast) => <FabulaHistoryEntry roll={toast} compact />}
            />

            {/* ── MODALES GLOBALES ────────────────────────────────────────── */}
            {showTableMgmt && (
                <TableManagementModal
                    isOpen
                    onClose={() => setShowTableMgmt(false)}
                    activeSessionId={activeSession?.id ?? null}
                    onSelectTable={(session) => { onSessionChange?.(session); setShowTableMgmt(false); }}
                />
            )}
            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}
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

export default GMApp;
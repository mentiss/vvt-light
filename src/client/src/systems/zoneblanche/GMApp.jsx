// src/client/src/systems/zoneblanche/GMApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Interface MJ Zone Blanche — architecture fusionnée (pas de GMApp → GMView) :
// bandeau, onglets, jauges de session et modales globales vivent ici.
// Seul TabSession reste dans gm/tabs/.
//
// Contrat props (GMPage) :
//   activeSession, onSessionChange, onlineCharacters, characterUpdates,
//   darkMode, onToggleDarkMode
//
// theme.css n'est pas importé : GMPage le charge déjà via import.meta.glob.
//
// Les jauges de session (Audimat / Stress) sont tenues ICI et descendues en
// props vers TabSession, pour éviter d'y déclarer un listener socket.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';

import { useSystem } from '../../hooks/useSystem.js';
import { useSocket } from '../../context/SocketContext.jsx';
import { useFetch }  from '../../hooks/useFetch.js';

import ThemeToggle          from '../../components/ui/ThemeToggle.jsx';
import ToastNotifications   from '../../components/layout/ToastNotifications.jsx';
import TabJournal           from '../../components/gm/tabs/TabJournal.jsx';
import DiceHistoryPage      from '../../components/layout/DiceHistoryPage.jsx';
import DiceConfigModal      from '../../components/modals/DiceConfigModal.jsx';
import FreeDiceModal        from '../../components/modals/FreeDiceModal.jsx';
import TableManagementModal from '../../components/gm/modals/TableManagementModal.jsx';

import TabSession                from './gm/tabs/TabSession.jsx';
import { BUDGET_PRESETS }        from './config.jsx';
import ZoneBlancheGMDiceModal    from './components/modals/ZoneBlancheGMDiceModal.jsx';
import ZoneBlancheHistoryEntry from './components/layout/ZoneBlancheHistoryEntry.jsx';

const TABS = [
    { id: 'session',    label: 'Session' },
    { id: 'journal',    label: 'Journal' },
    { id: 'historique', label: 'Historique' },
];

const AUDIMAT_MAX = 6;

// ── Timecode live ────────────────────────────────────────────────────────────

function useTimecode() {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, []);
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// ── Budget matériel — ressource de session au même titre que les jauges ─────
// Le pool matériel lui-même reste sur les fiches (les joueurs y piochent),
// mais l'enveloppe budgétaire est fixée ici, par le MJ, à chaque enquête.

const BudgetGauge = ({ budget, total, onSet, disabled }) => {
    const [saisie, setSaisie] = useState('');

    const appliquer = () => {
        const valeur = Number(saisie);
        if (!Number.isInteger(valeur) || valeur < 0) return;
        onSet(valeur);
        setSaisie('');
    };

    const depasse = budget > 0 && total > budget;

    return (
        <div className="zb-gauge">
            <div className="zb-eyebrow">Budget matériel</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`zb-counter zb-mono px-3 py-1 rounded-sm text-sm ${depasse ? '' : 'is-complete'}`}
                      title={depasse ? 'Budget dépassé — la table tranche' : 'Dans le budget'}>
                    {total} / {budget}
                </span>

                {BUDGET_PRESETS.map(p => (
                    <button key={p.key} type="button" onClick={() => onSet(p.value)} disabled={disabled}
                            className={`zb-pill px-2.5 py-1.5 rounded-sm text-xs ${budget === p.value ? 'is-selected' : ''}`}
                            title={p.label}>
                        {p.value}
                    </button>
                ))}

                <input type="number" min="0" value={saisie} disabled={disabled}
                       onChange={e => setSaisie(e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); appliquer(); } }}
                       className="zb-input zb-mono w-20 px-2 py-1.5 rounded-sm text-xs"
                       placeholder="Libre" />
                <button type="button" onClick={appliquer} disabled={disabled || saisie === ''}
                        className="zb-btn-ghost px-2.5 py-1.5 rounded-sm text-xs">
                    Fixer
                </button>
            </div>
        </div>
    );
};

// ── Régie — jauges de session, côté MJ ───────────────────────────────────────
// Audimat : plafonné à 6 · Stress : sans maximum, MJ seul à pouvoir l'ajuster.

const GMGauges = ({ resources, onAdjust, disabled }) => (
    <>
        <div className="zb-gauge">
            <div className="zb-eyebrow">Audimat</div>
            <div className="flex items-center gap-2 mt-1">
                <button type="button" onClick={() => onAdjust('audimat', -1)}
                        disabled={disabled || (resources.audimat ?? 0) <= 0}
                        className="zb-btn-ghost w-8 h-8 rounded-sm font-bold">−</button>
                <div className="zb-gauge-strip">
                    {Array.from({ length: AUDIMAT_MAX }, (_, i) => (
                        <div key={i} className={`zb-gauge-seg ${i < (resources.audimat ?? 0) ? 'is-filled' : ''}`} />
                    ))}
                </div>
                <span className="zb-mono text-lg text-default w-6 text-center">{resources.audimat ?? 0}</span>
                <button type="button" onClick={() => onAdjust('audimat', 1)}
                        disabled={disabled || (resources.audimat ?? 0) >= AUDIMAT_MAX}
                        className="zb-btn-ghost w-8 h-8 rounded-sm font-bold">+</button>
            </div>
        </div>

        <div className="zb-gauge">
            <div className="zb-eyebrow">Stress</div>
            <div className="flex items-center gap-2 mt-1">
                <button type="button" onClick={() => onAdjust('stress', -1)}
                        disabled={disabled || (resources.stress ?? 0) <= 0}
                        className="zb-btn-ghost w-8 h-8 rounded-sm font-bold">−</button>
                <span className="zb-stress-value zb-mono w-10 text-center">{resources.stress ?? 0}</span>
                <button type="button" onClick={() => onAdjust('stress', 1)}
                        disabled={disabled}
                        className="zb-btn-ghost w-8 h-8 rounded-sm font-bold">+</button>
            </div>
        </div>
    </>
);

// ── Composant principal ──────────────────────────────────────────────────────

const GMApp = ({
                   activeSession,
                   onSessionChange,
                   onlineCharacters,
                   characterUpdates,
                   darkMode,
                   onToggleDarkMode,
               }) => {
    const { apiBase }   = useSystem();
    const socket        = useSocket();
    const fetchWithAuth = useFetch();
    const timecode      = useTimecode();

    const [activeTab, setActiveTab] = useState('session');

    const [showMenu,       setShowMenu]       = useState(false);
    const [showTableMgmt,  setShowTableMgmt]  = useState(false);
    const [showDiceConfig, setShowDiceConfig] = useState(false);
    const [showFreeDice,   setShowFreeDice]   = useState(false);
    const [showGMDice,     setShowGMDice]     = useState(false);

    const [resources, setResources] = useState({ audimat: 0, stress: 6 });
    const [equipment, setEquipment] = useState({ budget: 0, total: 0 });

    const sessionId = activeSession?.id ?? null;

    // ── Chargement des ressources ─────────────────────────────────────────
    useEffect(() => {
        if (!sessionId) { setResources({ audimat: 0, stress: 6 }); return; }
        fetchWithAuth(`${apiBase}/session-resources/${sessionId}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (data) setResources(data); })
            .catch(() => {});
    }, [sessionId, apiBase]);

    // ── Budget matériel : chargement ──────────────────────────────────────
    useEffect(() => {
        if (!sessionId) { setEquipment({ budget: 0, total: 0 }); return; }
        fetchWithAuth(`${apiBase}/session-equipment/${sessionId}`)
            .then(r => (r.ok ? r.json() : null))
            .then(data => { if (data) setEquipment({ budget: data.budget, total: data.total }); })
            .catch(() => {});
    }, [sessionId, apiBase]);

    // ── Réception temps réel ──────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const onResources = (data) => {
            if (!data || (sessionId && data.sessionId !== sessionId)) return;
            setResources(prev => ({ ...prev, ...data }));
        };
        // Le total évolue à chaque achat des joueurs : on suit le même flux.
        const onEquipment = (data) => {
            if (!data || data.sessionId !== sessionId) return;
            setEquipment({ budget: data.budget, total: data.total });
        };

        socket.on('session-resources-update', onResources);
        socket.on('zoneblanche:equipment-update', onEquipment);
        return () => {
            socket.off('session-resources-update', onResources);
            socket.off('zoneblanche:equipment-update', onEquipment);
        };
    }, [socket, sessionId]);

    // ── Ajustement (route REST — elle rediffuse à la room) ────────────────
    const adjustResource = useCallback(async (field, delta) => {
        if (!sessionId) return;
        try {
            const r = await fetchWithAuth(`${apiBase}/session-resources/${sessionId}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ field, delta }),
            });
            if (r.ok) setResources(await r.json());
        } catch (e) {
            console.error('[zoneblanche/GM] adjustResource:', e);
        }
    }, [sessionId, apiBase]);

    const setBudget = useCallback(async (budget) => {
        if (!sessionId) return;
        try {
            const r = await fetchWithAuth(`${apiBase}/session-equipment/${sessionId}/budget`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ budget }),
            });
            if (r.ok) {
                const data = await r.json();
                setEquipment({ budget: data.budget, total: data.total });
            }
        } catch (e) {
            console.error('[zoneblanche/GM] setBudget:', e);
        }
    }, [sessionId, apiBase]);

    return (
        <div className="zb-root zb-grain relative min-h-screen bg-default text-default"
             data-theme={darkMode ? 'dark' : 'light'}>

            <ToastNotifications
                sessionId={sessionId}
                renderDiceToast={(toast) => <ZoneBlancheHistoryEntry entry={toast} compact />}
                renderAllRollTypes
            />

            {/* ── Bandeau de régie ─────────────────────────────────────────── */}
            <header className="zb-broadcast-bar px-4 py-3 flex items-center justify-between gap-3 sticky top-0 z-30">
                <div className="flex items-center gap-4 min-w-0">
                    <span className="zb-channel-bug shrink-0">Régie</span>
                    <div className="min-w-0">
                        <div className="zb-title text-xl leading-none truncate">Zone Blanche</div>
                        <div className="zb-eyebrow mt-1 truncate">
                            {activeSession?.name ?? 'Aucune table active'}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden md:flex items-center gap-2 zb-timecode text-sm">
                        <span className="zb-rec-dot" />
                        REC {timecode}
                    </span>
                    <button type="button" onClick={() => setShowGMDice(true)}
                            className="zb-btn-accent zb-display px-4 py-2 rounded-sm text-sm"
                            title="Lancer un jet pour un PNJ ou une entité">
                        Jet MJ
                    </button>

                    <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />

                    <div className="relative">
                        <button type="button" onClick={() => setShowMenu(v => !v)}
                                className="zb-btn-ghost px-3 py-2 rounded-sm" title="Menu">☰</button>
                        {showMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                <div className="zb-menu">
                                    <button className="zb-menu-item" onClick={() => { setShowMenu(false); setShowTableMgmt(true); }}>Gestion des tables</button>
                                    <button className="zb-menu-item" onClick={() => { setShowMenu(false); setShowFreeDice(true); }}>Jet de dés libre</button>
                                    <button className="zb-menu-item" onClick={() => { setShowMenu(false); setShowDiceConfig(true); }}>Config animations dés</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Onglets ──────────────────────────────────────────────────── */}
            <nav className="zb-subheader px-4 flex items-center gap-1">
                {TABS.map(tab => (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                            className={`zb-tab ${activeTab === tab.id ? 'is-active' : ''}`}>
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* ── Contenu ──────────────────────────────────────────────────── */}
            <main className="p-4">
                {activeTab === 'session' && (
                    <>
                        <div className="zb-gauges">
                            <GMGauges resources={resources} onAdjust={adjustResource} disabled={!sessionId} />
                            <BudgetGauge budget={equipment.budget} total={equipment.total}
                                         onSet={setBudget} disabled={!sessionId} />
                        </div>
                        <TabSession
                            activeSession={activeSession}
                            onlineCharacters={onlineCharacters}
                            characterUpdates={characterUpdates}
                            resources={resources}
                            onResourcesChange={setResources}
                        />
                    </>
                )}

                {activeTab === 'journal' && (
                    <div className="max-w-4xl mx-auto">
                        {/* TabJournal force characterId={-1} en interne — aucune prop à passer */}
                        <TabJournal />
                    </div>
                )}

                {activeTab === 'historique' && (
                    <div className="max-w-4xl mx-auto">
                        <DiceHistoryPage
                            sessionId={sessionId}
                            renderHistoryEntry={(entry) => <ZoneBlancheHistoryEntry entry={entry} />}
                            renderAllRollTypes
                        />
                    </div>
                )}
            </main>

            {/* ── Modales globales ─────────────────────────────────────────── */}
            {/* Accès rapide au jet MJ, disponible sur tous les onglets */}
            <button type="button" onClick={() => setShowGMDice(true)}
                    className="zb-fab zb-display" title="Jet du MJ">
                Jet MJ
            </button>

            {showTableMgmt && (
                <TableManagementModal
                    isOpen
                    onClose={() => setShowTableMgmt(false)}
                    activeSessionId={sessionId}
                    onSelectTable={(session) => { onSessionChange?.(session); setShowTableMgmt(false); }}
                />
            )}

            {showGMDice && (
                <ZoneBlancheGMDiceModal
                    sessionId={sessionId}
                    resources={resources}
                    onResourcesChange={setResources}
                    onClose={() => setShowGMDice(false)}
                />
            )}

            {showDiceConfig && <DiceConfigModal onClose={() => setShowDiceConfig(false)} />}

            {showFreeDice && (
                <FreeDiceModal
                    sessionId={sessionId}
                    isGM
                    onClose={() => setShowFreeDice(false)}
                />
            )}
        </div>
    );
};

export default GMApp;
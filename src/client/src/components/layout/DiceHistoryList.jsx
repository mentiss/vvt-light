// src/client/src/components/layout/DiceHistoryList.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Liste de l'historique des jets, commune à l'onglet (DiceHistoryPage) et au
// panneau (DiceHistoryPanel) — documentations/spec_ui_actions.md §6.4.
//
// - Chargement des 200 derniers jets (de la table si sessionId), temps réel par
//   socket (dice-roll), actualisation, suppression d'un jet, remise à zéro.
// - Rendu d'un jet : celui du slug, déclaré une fois dans son config.jsx
//   (dice.renderHistoryEntry, dice.renderAllRollTypes) ; les types de la plateforme
//   (jet libre) ont le rendu générique sauf si le slug les prend (renderAllRollTypes).
// - Date hybride (tools/rollDate.js), date complète en infobulle, rafraîchie chaque minute.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { useFetch }   from '../../hooks/useFetch.js';
import { useSystem }  from '../../hooks/useSystem.js';
import useSlugConfig  from '../../hooks/useSlugConfig.js';
import { useSocket }  from '../../context/SocketContext.jsx';
import ConfirmModal   from '../modals/ConfirmModal.jsx';
import { HostedModal } from '../ui/ModalHost.jsx';
import { formatRollDate, fullRollDate } from '../../tools/rollDate.js';
import { PLATFORM_ROLL_TYPES } from '../../tools/diceHistory.js';
import GenericRollEntry from './GenericRollEntry.jsx';

/** Heure courante, rafraîchie chaque minute (dates relatives). */
function useNow(intervalMs = 60000) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
}

/**
 * @param {object} props
 * @param {number|null} [props.sessionId] table : jets de cette table seulement
 */
const DiceHistoryList = ({ sessionId = null }) => {
    const [rolls,            setRolls]            = useState([]);
    const [loading,          setLoading]          = useState(false);
    const [deleteTarget,     setDeleteTarget]     = useState(null);
    const [confirmResetAll,  setConfirmResetAll]  = useState(false);

    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();
    const socket        = useSocket();
    const slugDice      = useSlugConfig()?.dice;
    const now           = useNow();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const url = sessionId
                ? `${apiBase}/dice/history?limit=200&sessionId=${sessionId}`
                : `${apiBase}/dice/history?limit=200`;
            const res  = await fetchWithAuth(url);
            const data = await res.json();
            setRolls(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('[DiceHistoryList] Erreur chargement:', e);
        } finally {
            setLoading(false);
        }
    }, [apiBase, sessionId]);

    useEffect(() => { load(); }, [load]);

    // Temps réel : chaque jet de la table arrive en tête
    useEffect(() => {
        if (!socket) return undefined;
        const onRoll = (rollData) => {
            if (sessionId && String(rollData.session_id) !== String(sessionId)) return;
            setRolls(prev => (prev.some(r => r.id === rollData.id) ? prev : [rollData, ...prev]));
        };
        socket.on('dice-roll', onRoll);
        return () => socket.off('dice-roll', onRoll);
    }, [socket, sessionId]);

    const deleteRoll = async (id) => {
        try {
            await fetchWithAuth(`${apiBase}/dice/history/${id}`, { method: 'DELETE' });
            setRolls(prev => prev.filter(r => r.id !== id));
        } catch (e) {
            console.error('[DiceHistoryList] Erreur suppression:', e);
        } finally {
            setDeleteTarget(null);
        }
    };

    const resetAll = async () => {
        try {
            const url = sessionId
                ? `${apiBase}/dice/history/session/${sessionId}`
                : `${apiBase}/dice/history`;
            await fetchWithAuth(url, { method: 'DELETE' });
            setRolls([]);
        } catch (e) {
            console.error('[DiceHistoryList] Erreur reset:', e);
        } finally {
            setConfirmResetAll(false);
        }
    };

    const renderEntry = (roll) => {
        const isPlatformType = PLATFORM_ROLL_TYPES.includes(roll.roll_type);
        if (slugDice?.renderHistoryEntry && (!isPlatformType || slugDice.renderAllRollTypes)) {
            const slugRender = slugDice.renderHistoryEntry(roll);
            if (slugRender) return slugRender;
        }
        return <GenericRollEntry roll={roll} />;
    };

    // Config du slug pas encore chargée : on attend, pour ne pas afficher le rendu générique un instant
    if (loading || !slugDice) {
        return (
            <div className="text-center py-16" style={{ color: 'var(--color-text-muted, #666)' }}>
                <div className="text-2xl animate-pulse mb-2">⏳</div>
                <p className="text-sm">Chargement de l'historique…</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Barre d'actions */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted, #666)' }}>
                    {rolls.length} jet{rolls.length > 1 ? 's' : ''} enregistré{rolls.length > 1 ? 's' : ''}
                </span>
                <div className="flex gap-2">
                    <button onClick={load} className="text-xs px-2 py-1 rounded"
                            style={{ background: 'var(--color-surface-alt, #f5f5f5)', color: 'var(--color-text-muted, #666)' }}>
                        ↺ Actualiser
                    </button>
                    {rolls.length > 0 && (
                        <button onClick={() => setConfirmResetAll(true)} className="text-xs px-2 py-1 rounded"
                                style={{ background: 'var(--color-surface-alt, #f5f5f5)', color: 'var(--color-danger, #c0392b)' }}>
                            🗑 Tout effacer
                        </button>
                    )}
                </div>
            </div>

            {rolls.length === 0 ? (
                <div className="text-center py-16" style={{ color: 'var(--color-text-muted, #666)' }}>
                    <div className="text-3xl mb-3">🎲</div>
                    <p className="text-sm">Aucun jet enregistré.</p>
                </div>
            ) : (
                rolls.map(roll => (
                    <div key={roll.id} className="vtt-history-card group">
                        {/* Méta */}
                        <div className="vtt-history-card-meta px-3 py-1.5 flex items-center justify-between text-[10px]">
                            <span>{roll.character_name ?? 'Anonyme'}</span>
                            <div className="flex items-center gap-2">
                                <span title={fullRollDate(roll.created_at)}>{formatRollDate(roll.created_at, now)}</span>
                                <button
                                    onClick={() => setDeleteTarget(roll.id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] px-1.5 py-0.5 rounded"
                                    style={{ color: 'var(--color-danger, #c0392b)', background: 'var(--color-surface, #fff)' }}
                                    title="Supprimer ce jet"
                                >✕</button>
                            </div>
                        </div>
                        {/* Rendu slug ou générique (marge portée par la carte) */}
                        <div className="vtt-history-entry">
                            {renderEntry(roll)}
                        </div>
                    </div>
                ))
            )}

            {/* Modales de confirmation, hébergées : dans le panneau (FloatingPanel), elles seraient rognées */}
            {deleteTarget && (
                <HostedModal>
                    <ConfirmModal
                        message="Supprimer ce jet de l'historique ?"
                        onConfirm={() => deleteRoll(deleteTarget)}
                        onCancel={() => setDeleteTarget(null)}
                    />
                </HostedModal>
            )}
            {confirmResetAll && (
                <HostedModal>
                    <ConfirmModal
                        message={sessionId ? "Effacer tout l'historique de cette session ?" : "Effacer tout l'historique ?"}
                        onConfirm={resetAll}
                        onCancel={() => setConfirmResetAll(false)}
                    />
                </HostedModal>
            )}
        </div>
    );
};

export default DiceHistoryList;

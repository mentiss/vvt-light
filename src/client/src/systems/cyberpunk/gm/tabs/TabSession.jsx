// src/client/src/systems/cyberpunk/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Session MJ — Cyberpunk / The Sprawl (spec_cyberpunk.md §6)
//
// Layout :
//   Gauche  — agents de la table en vignettes de flux (en ligne, jetons, tags),
//             musique et tableau de la table
//   Droite  — fiche du personnage choisi : GMCharacterView, la même fiche que le
//             joueur (SheetBody) en variante MJ
//
// Temps réel : character-full-update et character-update → fiche locale à jour.
// Enregistrement : PUT de la fiche entière (le serveur diffuse aux tables).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import useSystem from "@/app/hooks/useSystem.js";
import { useFetch } from "@/app/hooks/useFetch.js";
import { useSocket } from "@/app/context/SocketContext.jsx";
import GMSendModal from "@/features/table/modals/GMSendModal.jsx";
import AudioSessionToggle from '@/features/audio/AudioSessionToggle.jsx';
import BoardSessionToggle from '@/features/board/BoardSessionToggle.jsx';
import TableManagementButton from '@/features/table/TableManagementButton.jsx';
import CpIcon from "../../components/ui/CpIcon.jsx";
import GMCharacterView from '../GMCharacterView.jsx';

const fullName = (c) => [c?.prenom, c?.nom].filter(Boolean).join(' ') || 'Anonyme';

// Vignette de flux d'un agent
const AgentFeed = ({ c, isOnline, isActive, onSelect }) => (
    <button type="button" onClick={onSelect}
            className={`cp-feed ${isActive ? 'is-selected' : ''} ${isOnline ? 'is-online' : 'is-offline'}`}>
        <span className="cp-feed-cam">
            <span className="cp-feed-rec" title={isOnline ? 'En ligne' : 'Hors ligne'} />
            {c?.avatar
                ? <img src={c.avatar} alt="" />
                : <svg viewBox="0 0 54 62" aria-hidden="true"><circle cx="27" cy="24" r="11" /><path d="M6 62c2-14 10-20 21-20s19 6 21 20" /></svg>}
        </span>
        <span className="cp-feed-info">
            <span className="cp-feed-name">{c ? fullName(c) : '…'}</span>
            <span className="cp-feed-pb">{c?.playbook || '—'}{isOnline ? '' : ' · hors ligne'}</span>
            {c && (
                <span className="cp-feed-res">
                    <span style={{ '--rc': 'var(--cp-cred)' }} title="Cred">₵{c.cred ?? 0}</span>
                    <span style={{ '--rc': 'var(--cp-info)' }} title="[info]">i{c.infoTokens ?? 0}</span>
                    <span style={{ '--rc': 'var(--cp-matos)' }} title="[matos]">m{c.matosTokens ?? 0}</span>
                    <span style={{ '--rc': 'var(--cp-retenue)' }} title="Retenue">r{c.retenue ?? 0}</span>
                </span>
            )}
            {(c?.tags ?? []).length > 0 && (
                <span className="cp-feed-tags">
                    {c.tags.slice(0, 2).map((t, i) => <span key={t.id ?? i} className={`cp-tag is-${t.tag_variant ?? 'neutral'}`}>{t.tag_text}</span>)}
                </span>
            )}
        </span>
    </button>
);

const TabSession = ({ activeSession, onlineCharacters, onSessionChange }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();
    const socket        = useSocket();

    const [characters,   setCharacters]   = useState({});   // id → fiche complète
    const [selectedId,   setSelectedId]   = useState(null);
    const [loading,      setLoading]      = useState(false);
    const [allMoves,     setAllMoves]     = useState([]);
    const [showSendNote, setShowSendNote] = useState(false);

    const onlineIds = new Set((onlineCharacters ?? []).map(c => c.characterId));

    // ── Fiches des personnages de la table ────────────────────────────────────
    // fetchWithAuth hors des dépendances : référence instable (src/client/CLAUDE.md)
    useEffect(() => {
        if (!activeSession?.characters?.length) {
            setCharacters({});
            setSelectedId(null);
            return;
        }
        setLoading(true);
        const load = async () => {
            const loaded = {};
            await Promise.all((activeSession.characters ?? []).map(async c => {
                try {
                    const r = await fetchWithAuth(`${apiBase}/characters/${c.id}`);
                    if (r.ok) loaded[c.id] = await r.json();
                } catch (e) { console.error(`[TabSession/cyberpunk] ${c.id}:`, e); }
            }));
            setCharacters(loaded);
            const firstId = activeSession.characters[0]?.id ?? null;
            setSelectedId(prev => (prev && loaded[prev]) ? prev : firstId);
            setLoading(false);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSession?.id, activeSession?.characters?.length]);

    // ── Bibliothèque des manœuvres ────────────────────────────────────────────
    useEffect(() => {
        if (!apiBase) return;
        fetchWithAuth(`${apiBase}/moves`)
            .then(r => (r.ok ? r.json() : []))
            .then(data => setAllMoves(Array.isArray(data) ? data : []))
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiBase]);

    // ── Temps réel ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return undefined;
        const onFull = ({ characterId, character }) => {
            setCharacters(prev => (prev[characterId] ? { ...prev, [characterId]: character } : prev));
        };
        const onPartial = ({ characterId, updates }) => {
            setCharacters(prev => (prev[characterId] ? { ...prev, [characterId]: { ...prev[characterId], ...updates } } : prev));
        };
        socket.on('character-full-update', onFull);
        socket.on('character-update', onPartial);
        return () => {
            socket.off('character-full-update', onFull);
            socket.off('character-update', onPartial);
        };
    }, [socket]);

    // ── Enregistrement : optimiste, puis la fiche renvoyée par le serveur ─────
    const saveChar = useCallback(async (next) => {
        if (!next?.id) return;
        const previous = characters[next.id];
        setCharacters(prev => ({ ...prev, [next.id]: next }));
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${next.id}`, { method: 'PUT', body: JSON.stringify(next) });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const updated = await r.json();
            setCharacters(prev => ({ ...prev, [updated.id]: updated }));
        } catch (e) {
            if (previous) setCharacters(prev => ({ ...prev, [next.id]: previous }));
            console.error('[TabSession/cyberpunk] saveChar:', e);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [characters, apiBase]);

    // ── Envoi d'un objet (route du slug) ──────────────────────────────────────
    const sendItem = async (charId, form) => {
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${charId}/send-item`, {
                method: 'POST',
                body:   JSON.stringify({ ...form, sessionId: activeSession?.id }),
            });
            if (!r.ok) return false;
            const updated = await fetchWithAuth(`${apiBase}/characters/${charId}`);
            if (updated.ok) {
                const data = await updated.json();
                setCharacters(prev => ({ ...prev, [charId]: data }));
            }
            return true;
        } catch {
            return false;
        }
    };

    const sessionCharacters = (activeSession?.characters ?? []).map(sc => ({
        id:     sc.id,
        name:   characters[sc.id] ? fullName(characters[sc.id]) : (sc.name ?? sc.id),
        avatar: sc.avatar,
    }));

    // ── États vides ───────────────────────────────────────────────────────────
    if (!activeSession) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
                <CpIcon name="tables" className="w-12 h-12" />
                <p className="text-sm">Aucune table sélectionnée.</p>
                {/* Appel à choisir une table (spec_ui_menu.md §12) */}
                <TableManagementButton activeSessionId={null} onSelectTable={(session) => onSessionChange?.(session)}
                                       icon={<CpIcon name="tables" />} />
            </div>
        );
    }
    if (loading && Object.keys(characters).length === 0) {
        return <p className="cp-empty text-center py-16">Chargement des fiches…</p>;
    }
    if (!activeSession.characters?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
                <CpIcon name="users" className="w-12 h-12" />
                <p className="text-sm">Aucun personnage à cette table.</p>
            </div>
        );
    }

    const char = characters[selectedId] ?? null;

    return (
        <div className="flex h-full min-h-0">
            {/* ── Agents de la table : vignettes de flux ── */}
            <div className="cp-feeds-col cp-scroll">
                <h3 className="cp-panel-title">Agents</h3>
                {/* Musique et tableau de la table (briques plateforme : audio, tableau) */}
                <AudioSessionToggle sessionId={activeSession.id} className="cp-btn is-sm w-full" />
                <BoardSessionToggle sessionId={activeSession.id} className="cp-btn is-sm w-full" />
                {(activeSession.characters ?? []).map(sc => (
                    <AgentFeed key={sc.id} c={characters[sc.id]} isOnline={onlineIds.has(sc.id)}
                               isActive={selectedId === sc.id} onSelect={() => setSelectedId(sc.id)} />
                ))}
            </div>

            {/* ── Fiche du personnage choisi : la même que celle du joueur ── */}
            {char ? (
                <GMCharacterView
                    key={char.id}
                    character={char}
                    onSave={saveChar}
                    allMoves={allMoves}
                    isOnline={onlineIds.has(char.id)}
                    onSendItem={(form) => sendItem(char.id, form)}
                    onSendNote={() => setShowSendNote(true)}
                />
            ) : (
                <div className="flex-1 flex items-center justify-center"><p className="cp-empty">Choisis un agent.</p></div>
            )}

            {showSendNote && (
                <GMSendModal
                    onClose={() => setShowSendNote(false)}
                    sessionId={activeSession?.id ?? null}
                    sessionCharacters={sessionCharacters}
                    preSelectedCharId={selectedId}
                />
            )}
        </div>
    );
};

export default TabSession;

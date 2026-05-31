/**
 * tabs/TabSession.jsx — Onglet Session GM Noctis Solis
 *
 * - Sidebar : liste personnages avec statut online, éclats mini, badge fracturé
 * - Barre d'actions : au-dessus de la fiche (Note, Copier, Fracturé, Éditer)
 * - Fiche GM : réutilise les composants joueurs existants
 * - Patch : HTTP uniquement, jamais de socket.emit
 * - Socket : réception uniquement (character-update, character-full-update)
 */

import { useState, useEffect, useCallback } from 'react';
import { useSocket }   from '../../../../context/SocketContext.jsx';
import { useFetch }    from '../../../../hooks/useFetch.js';
import { useSystem }   from '../../../../hooks/useSystem.js';
import GMSendModal     from '../../../../components/gm/modals/GMSendModal.jsx';

import {
    DOMAINES, computeMalusBlessure,
} from '../../config.jsx';

import IdentityCard from "../../components/layout/IdentityCard.jsx";
import DomainCard from "../../components/layout/DomainCard.jsx";
import SpecialtiesCard from "../../components/layout/SpecialtiesCard.jsx";
import InventoryCard from "../../components/layout/InventoryCard.jsx";
import EclatsCard from "../../components/layout/EclatsCard.jsx";
import HealthCard from "../../components/layout/HealthCard.jsx";
import ReserveCard from "../../components/layout/ReserveCard.jsx";
import GroupReserveCard from '../../components/layout/GroupReserveCard.jsx';

/* ══════════════════════════════════════════════════════════════════════════ */
const TabSession = ({ activeSession, onlineCharacters }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();
    const socket        = useSocket();

    const [characters,    setCharacters]    = useState({});
    const [selectedId,    setSelectedId]    = useState(null);
    const [loading,       setLoading]       = useState(false);
    const [editMode,      setEditMode]      = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [copied,        setCopied]        = useState(false);

    const onlineIds = new Set((onlineCharacters ?? []).map(c => c.characterId));

    /* ── Chargement ─────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!activeSession?.characters?.length) {
            setCharacters({});
            setSelectedId(null);
            return;
        }
        setLoading(true);
        const load = async () => {
            const loaded = {};
            await Promise.all(activeSession.characters.map(async c => {
                try {
                    const r = await fetchWithAuth(`${apiBase}/characters/${c.id}`);
                    if (r.ok) loaded[c.id] = await r.json();
                } catch (e) {
                    console.error(`[TabSession/noctis] load ${c.id}:`, e);
                }
            }));
            setCharacters(loaded);
            if (!selectedId || !loaded[selectedId]) {
                setSelectedId(activeSession.characters[0]?.id ?? null);
            }
            setLoading(false);
        };
        load();
    }, [activeSession?.id, activeSession?.characters?.length, apiBase]);

    /* ── Socket — réception uniquement ──────────────────────────────────── */
    useEffect(() => {
        if (!socket) return;
        const onPartial = ({ characterId, updates }) => {
            if (!characterId || characterId === -1) return;
            setCharacters(prev => prev[characterId]
                ? { ...prev, [characterId]: { ...prev[characterId], ...updates } }
                : prev);
        };
        const onFull = ({ characterId, character }) => {
            if (!characterId || characterId === -1) return;
            setCharacters(prev => prev[characterId]
                ? { ...prev, [characterId]: character }
                : prev);
        };
        socket.on('character-update',      onPartial);
        socket.on('character-full-update', onFull);
        return () => {
            socket.off('character-update',      onPartial);
            socket.off('character-full-update', onFull);
        };
    }, [socket]);

    /* ── Patch immédiat (éclats, santé, réserves, fracturé, XP) ─────────── */
    const patch = useCallback(async (charId, fields) => {
        try {
            const res = await fetchWithAuth(`${apiBase}/characters/${charId}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(fields),
            });
            if (res.ok) {
                const updated = await res.json();
                setCharacters(prev => ({ ...prev, [charId]: { ...prev[charId], ...updated } }));
            }
        } catch (e) {
            console.error('[TabSession/noctis] patch:', e);
        }
    }, [apiBase]);

    /* ── Set local (mode édition) ────────────────────────────────────────── */
    const set = useCallback((key, value) => {
        if (!selectedId) return;
        setCharacters(prev => ({
            ...prev,
            [selectedId]: { ...prev[selectedId], [key]: value },
        }));
    }, [selectedId]);

    /* ── Sauvegarde fin d'édition (PUT) ─────────────────────────────────── */
    const saveEdit = useCallback(async () => {
        if (!selectedId || !characters[selectedId]) return;
        try {
            const res = await fetchWithAuth(`${apiBase}/characters/${selectedId}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(characters[selectedId]),
            });
            if (res.ok) {
                const updated = await res.json();
                setCharacters(prev => ({ ...prev, [selectedId]: updated }));
            }
        } catch (e) {
            console.error('[TabSession/noctis] saveEdit:', e);
        }
    }, [selectedId, characters, apiBase]);

    const toggleEditMode = async () => {
        if (editMode) await saveEdit();
        setEditMode(v => !v);
    };

    /* ── Copier lien Discord ─────────────────────────────────────────────── */
    const handleCopy = () => {
        if (!char) return;
        const system = apiBase.replace('/api/', '');
        const text = [
            '━━━━━━━━━━━━━━━━━━━━',
            '  ◆ DOSSIER SELVARINE',
            '━━━━━━━━━━━━━━━━━━━━',
            `  Personnage : ${[char.prenom, char.nom].filter(Boolean).join(' ')}`,
            `  🔗 Lien    : ${window.location.origin}/${system}/${char.access_url}`,
            `  🔐 Code    : \`${char.access_code}\``,
            '━━━━━━━━━━━━━━━━━━━━',
        ].join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    /* ── sessionCharacters pour GMSendModal ─────────────────────────────── */
    const sessionCharacters = (activeSession?.characters ?? []).map(sc => ({
        id:   sc.id,
        name: characters[sc.id]
            ? [characters[sc.id].prenom, characters[sc.id].nom].filter(Boolean).join(' ')
            : (sc.char_display_name ?? `#${sc.id}`),
    }));

    const char  = selectedId ? characters[selectedId] : null;
    const malus = char ? computeMalusBlessure(char) : 0;

    /* ── État vide ───────────────────────────────────────────────────────── */
    if (!activeSession) {
        return (
            <p className="ns-gm-empty">
                Aucune session active — gérez votre table via ⚙ Table.
            </p>
        );
    }

    /* ══════════════════════════════════════════════════════════════════════ */
    return (
        <div className="flex h-full min-h-0">

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <aside className="ns-gm-sidebar">
                <div className="ns-gm-sidebar-header">
                    <p className="ns-section-label">Personnages</p>
                </div>

                {loading && (
                    <p className="ns-gm-empty" style={{ height: '4rem', fontSize: '0.7rem' }}>
                        Chargement…
                    </p>
                )}

                {!loading && (activeSession.characters ?? []).map(c => {
                    const full     = characters[c.id];
                    const online   = onlineIds.has(c.id);
                    const selected = selectedId === c.id;

                    return (
                        <button
                            key={c.id}
                            onClick={() => { setSelectedId(c.id); setEditMode(false); }}
                            className={`ns-char-btn ${selected ? 'active' : ''}`}
                        >
                            <div className={`ns-online-dot ${online ? 'online' : ''}`} />

                            <div className="flex-1 min-w-0">
                                <p className="ns-char-name">
                                    {full?.prenom ?? '…'} {full?.nom ?? ''}
                                </p>
                                <p className="ns-char-player">
                                    {full?.player_name ?? ''}
                                </p>
                            </div>

                            {/* Éclats mini */}
                            {(full?.eclats_current ?? 0) > 0 && (
                                <span className="ns-char-eclats-mini">
                                    {'✦'.repeat(Math.min(full.eclats_current, 3))}
                                    {full.eclats_current > 3 && `+${full.eclats_current - 3}`}
                                </span>
                            )}

                            {/* Badge Fracturé */}
                            {!!full?.is_fracture && (
                                <span className="ns-fracture-badge-mini">FRAC</span>
                            )}
                        </button>
                    );
                })}
            </aside>

            {/* ── Colonne fiche ────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto min-w-0">
                {!char ? (
                    <p className="ns-gm-empty">Sélectionnez un personnage.</p>
                ) : (
                    <>
                        {/* ── Barre d'actions ──────────────────────────── */}
                        <div className="ns-gm-actions-bar">
                            <span className="ns-gm-char-title">
                                {char.prenom} {char.nom}
                            </span>

                            {malus < 0 && (
                                <span className="ns-gm-malus">Malus {malus}D</span>
                            )}

                            <div className="flex-1" />

                            <button
                                onClick={() => setShowSendModal(true)}
                                className="ns-btn-ghost"
                            >
                                ✉ Note
                            </button>

                            <button
                                onClick={handleCopy}
                                className={copied ? 'ns-btn-primary' : 'ns-btn-ghost'}
                            >
                                {copied ? '✓ Copié' : '⎘ Copier'}
                            </button>

                            <button
                                onClick={() => patch(char.id, { is_fracture: char.is_fracture ? 0 : 1 })}
                                className={!!char.is_fracture ? 'ns-btn-fracture' : 'ns-btn-ghost'}
                            >
                                {!!char.is_fracture ? '⬡ Fracturé' : '○ Fracturé'}
                            </button>

                            <button
                                onClick={toggleEditMode}
                                className={editMode ? 'ns-btn-primary' : 'ns-btn-ghost'}
                            >
                                {editMode ? '✓ Terminer' : '✎ Éditer'}
                            </button>
                        </div>

                        {/* ── Fiche GM — 2 colonnes (même layout que Sheet.jsx) ── */}
                        <div className="ns-sheet-layout">

                            <div className="ns-sheet-main">
                                <IdentityCard
                                    character={char}
                                    editMode={editMode}
                                    onChange={set}
                                    onPatch={(fields) => patch(char.id, fields)}
                                />

                                <div className="ns-domains-grid">
                                    {Object.keys(DOMAINES).map(dom => (
                                        <DomainCard
                                            key={dom}
                                            domaine={dom}
                                            character={char}
                                            editMode={editMode}
                                            onChange={set}
                                            onRoll={null}
                                        />
                                    ))}
                                </div>

                                <SpecialtiesCard
                                    character={char}
                                    editMode={editMode}
                                    onChange={(specialties) => set('specialties', specialties)}
                                    onRoll={null}
                                />

                                <InventoryCard
                                    character={char}
                                    editMode={editMode}
                                    onChange={(items) => set('items', items)}
                                />
                            </div>

                            {/* Sidebar ressources */}
                            <aside className="ns-sheet-sidebar">

                                <EclatsCard
                                    character={char}
                                    onPatch={(fields) => patch(char.id, fields)}
                                    editMode={true}
                                />

                                <HealthCard
                                    character={char}
                                    onPatch={(fields) => patch(char.id, fields)}
                                />

                                <ReserveCard
                                    type="effort"
                                    character={char}
                                    onPatch={(fields) => patch(char.id, fields)}
                                />

                                <ReserveCard
                                    type="sangfroid"
                                    character={char}
                                    onPatch={(fields) => patch(char.id, fields)}
                                />

                                <GroupReserveCard character={char} />

                                {/* ── XP ──────────────────────────────── */}
                                <div className="ns-card ns-paper space-y-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="ns-domain-header text-primary"
                                            style={{ borderBottom: 'none', paddingBottom: 0 }}>
                                            Expérience
                                        </h3>
                                        <div className="flex-1 h-px bg-primary opacity-20" />
                                    </div>
                                    <hr className="ns-divider" />

                                    {/* XP Total */}
                                    <div className="flex items-center justify-between">
                                        <span className="ns-stat-label">Total</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => patch(char.id, { xp_total: Math.max(0, (char.xp_total ?? 0) - 1) })}
                                                disabled={(char.xp_total ?? 0) === 0}
                                                className="ns-btn-ghost disabled:opacity-30"
                                            >−</button>
                                            <span className="ns-xp-value text-primary">
                                                {char.xp_total ?? 0}
                                            </span>
                                            <button
                                                onClick={() => patch(char.id, { xp_total: (char.xp_total ?? 0) + 1 })}
                                                className="ns-btn-ghost"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* XP Dépensé */}
                                    <div className="flex items-center justify-between">
                                        <span className="ns-stat-label">Dépensé</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => patch(char.id, { xp_spent: Math.max(0, (char.xp_spent ?? 0) - 1) })}
                                                disabled={(char.xp_spent ?? 0) === 0}
                                                className="ns-btn-ghost disabled:opacity-30"
                                            >−</button>
                                            <span className="ns-xp-value text-muted">
                                                {char.xp_spent ?? 0}
                                            </span>
                                            <button
                                                onClick={() => patch(char.id, { xp_spent: (char.xp_spent ?? 0) + 1 })}
                                                className="ns-btn-ghost"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* XP disponible */}
                                    {(char.xp_total ?? 0) - (char.xp_spent ?? 0) > 0 && (
                                        <p className="ns-xp-available">
                                            {(char.xp_total ?? 0) - (char.xp_spent ?? 0)} disponible(s)
                                        </p>
                                    )}
                                </div>

                            </aside>
                        </div>
                    </>
                )}
            </div>

            {/* ── Modal envoi note ─────────────────────────────────────── */}
            {showSendModal && (
                <GMSendModal
                    sessionId={activeSession?.id}
                    characters={sessionCharacters}
                    preSelectedCharacterId={selectedId}
                    onClose={() => setShowSendModal(false)}
                />
            )}
        </div>
    );
};

export default TabSession;
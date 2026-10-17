// src/client/src/systems/vikings/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Session (MJ) — contrat MJ standard (spec_vikings_lot3_client.md §5.2) :
//   1. Liste des personnages de la table : avatar, nom, joueur, présence, état
//   2. Fiche complète via le MÊME SheetLayout que la fiche joueur, + inventaire
//   3. Mode édition (buffer, enregistrement), actions de jeu toujours actives
//   4. Note au journal, envoi d'objet, copie du lien et du code, avatar
//   5. Jet de dés pour le personnage (même DiceModal que le joueur)
//
// ⚠️ Aucun listener socket ici : le temps réel arrive par characterUpdates
// (useGMSession dans GMPage).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useFetch }  from '../../../../hooks/useFetch.js';
import { useSystem } from '../../../../hooks/useSystem.js';
import GMSendModal    from '../../../../components/gm/modals/GMSendModal.jsx';
import AvatarUploader from '../../../../components/AvatarUploader.jsx';

import SheetLayout     from '../../components/layout/SheetLayout.jsx';
import InventoryTab    from '../../components/tabs/InventoryTab.jsx';
import DiceModal       from '../../components/modals/DiceModal.jsx';
import EditModals      from '../../components/modals/EditModals.jsx';
import GMSendItemModal from '../modals/GMSendItemModal.jsx';
import { BLESSURE_MAX, FATIGUE_MAX } from '../../config/rules.js';
import { formatFullName, pickEditableFields } from '../../config/utils.js';

const resolve = (updater, prev) => (typeof updater === 'function' ? updater(prev) : updater);

// ── Vignette d'un personnage dans la liste ───────────────────────────────────

const CharacterTile = ({ sessionChar, full, selected, online, onSelect }) => (
    <button type="button" onClick={onSelect}
            className={`w-full text-left px-3 py-2 border-b border-default flex items-center gap-2 ${
                selected ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-surface-alt'
            }`}>
        <div className="relative shrink-0">
            {full?.avatar ? (
                <img src={full.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-default" />
            ) : (
                <div className="w-9 h-9 rounded-full bg-surface-alt border border-default flex items-center justify-center text-sm font-bold">
                    {(full?.prenom ?? sessionChar.name)?.[0]?.toUpperCase() || '?'}
                </div>
            )}
            <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${online ? 'bg-success' : 'bg-surface-alt'}`} />
        </div>
        <div className="min-w-0 flex-1">
            <div className={`text-sm truncate ${selected ? 'font-semibold text-primary' : 'text-default'}`}>
                {full ? formatFullName(full) : sessionChar.name}
            </div>
            <div className="text-[10px] text-muted truncate">{full?.playerName}</div>
            {full && (
                <div className="flex gap-1 mt-0.5">
                    <span className="text-[10px] px-1 rounded bg-danger/20 text-default">❤️ {full.tokensBlessure ?? 0}/{BLESSURE_MAX}</span>
                    <span className="text-[10px] px-1 rounded bg-secondary/20 text-default">💤 {full.tokensFatigue ?? 0}/{FATIGUE_MAX}</span>
                    <span className="text-[10px] px-1 rounded bg-primary/20 text-default">ᛟ {full.sagaActuelle ?? 0}</span>
                </div>
            )}
        </div>
    </button>
);

const Empty = ({ icon, title, children }) => (
    <div className="bg-surface rounded-lg border-2 border-default p-8 text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-default mb-2">{title}</h3>
        <p className="text-muted">{children}</p>
    </div>
);

// ── Onglet ───────────────────────────────────────────────────────────────────

const TabSession = ({ activeSession, onlineCharacters = [], characterUpdates }) => {
    const { slug, apiBase } = useSystem();
    const fetchWithAuth = useFetch();

    const [characters, setCharacters] = useState({});   // { [id]: personnage complet }
    const [selectedId, setSelectedId] = useState(null);
    const [loading,    setLoading]    = useState(false);
    const [view,       setView]       = useState('fiche'); // 'fiche' | 'inventaire'

    const [editMode,     setEditMode]     = useState(false);
    const [editableChar, setEditableChar] = useState(null);

    const [showSendModal,     setShowSendModal]     = useState(false);
    const [showSendItemModal, setShowSendItemModal] = useState(false);
    const [showAvatar,        setShowAvatar]        = useState(false);
    const [showEditModal,     setShowEditModal]     = useState(null);
    const [diceContext,       setDiceContext]       = useState(null);
    const [copied,            setCopied]            = useState(false);

    // Dernier état connu, lu par update() : deux mises à jour successives
    // (dépense puis restitution d'un jet) s'enchaînent sans se perdre.
    const charactersRef = useRef(characters);
    useEffect(() => { charactersRef.current = characters; }, [characters]);

    const sessionId = activeSession?.id ?? null;

    // ── Chargement des fiches de la table ─────────────────────────────────
    useEffect(() => {
        const list = activeSession?.characters ?? [];
        if (!list.length) { setCharacters({}); setSelectedId(null); return; }

        let cancelled = false;
        setLoading(true);
        Promise.all(list.map(c =>
            fetchWithAuth(`${apiBase}/characters/${c.id}`)
                .then(r => (r.ok ? r.json() : null))
                .catch(() => null)
        )).then(results => {
            if (cancelled) return;
            const map = {};
            for (const c of results) if (c?.id) map[c.id] = c;
            setCharacters(map);
            setSelectedId(prev => (prev && map[prev] ? prev : (list[0]?.id ?? null)));
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [sessionId, activeSession?.characters?.length, apiBase]);

    // ── Temps réel — via characterUpdates (jamais de socket ici) ──────────
    useEffect(() => {
        if (!characterUpdates) return;
        setCharacters(prev => {
            let changed = false;
            const next = { ...prev };
            for (const [idStr, upd] of Object.entries(characterUpdates)) {
                const id = Number(idStr);
                if (!prev[id]) continue;   // pas dans cette table
                next[id] = upd.type === 'full' ? upd.data : { ...prev[id], ...upd.data };
                changed = true;
            }
            return changed ? next : prev;
        });
    }, [characterUpdates]);

    // Sortie du mode édition au changement de personnage
    useEffect(() => { setEditMode(false); }, [selectedId]);

    const char = selectedId ? (editMode ? editableChar : characters[selectedId]) : null;

    // ── Action de jeu immédiate : appliquée au dernier état, PUT complet ──
    const update = useCallback(async (updater) => {
        const id   = selectedId;
        const prev = charactersRef.current[id];
        if (!prev) return;
        const next = resolve(updater, prev);
        charactersRef.current = { ...charactersRef.current, [id]: next };
        setCharacters(p => ({ ...p, [id]: next }));
        if (editMode) setEditableChar(b => (b ? resolve(updater, b) : b));
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${id}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(next),
            });
            if (r.ok) {
                const saved = await r.json();
                setCharacters(p => ({ ...p, [id]: saved }));
            }
        } catch (e) {
            console.error('[TabSession/vikings] update:', e);
        }
    }, [selectedId, editMode, apiBase]);

    // ── Édition (buffer local, comme Sheet.jsx) ───────────────────────────
    const set = useCallback((field, value) => {
        setEditableChar(prev => (prev ? { ...prev, [field]: value } : prev));
    }, []);

    const startEdit  = () => { setEditableChar({ ...characters[selectedId] }); setEditMode(true); };
    const cancelEdit = () => setEditMode(false);
    const saveEdit   = () => {
        const edited = pickEditableFields(editableChar);
        setEditMode(false);
        update(prev => ({ ...prev, ...edited }));
    };

    // ── Copier le lien et le code d'accès ─────────────────────────────────
    const handleCopyCode = () => {
        const c = characters[selectedId];
        if (!c) return;
        const text = [
            `Pure Vikings — ${formatFullName(c)}`,
            `Lien : ${window.location.origin}/${slug}/${c.accessUrl}`,
            `Code : ${c.accessCode}`,
        ].join('\n');
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // ── Envois au journal (routes génériques) ─────────────────────────────
    const handleGMSend = async (sendData) => {
        const response = await fetchWithAuth('/api/journal/gm-send', {
            method: 'POST',
            body: JSON.stringify({
                ...sendData,
                sessionId,
                metadata: sendData.imageData ? { imageUrl: sendData.imageData } : null,
            }),
        });
        if (!response.ok) throw new Error('Send failed');
    };

    const handleGMSendItem = async (sendData) => {
        const response = await fetchWithAuth('/api/journal/gm-send-item', {
            method: 'POST',
            body: JSON.stringify({ ...sendData, sessionId }),
        });
        if (!response.ok) throw new Error('Send item failed');
    };

    const onlineIds = useMemo(
        () => new Set(onlineCharacters.map(c => c.characterId)),
        [onlineCharacters],
    );

    // ── États vides ───────────────────────────────────────────────────────
    if (!activeSession) {
        return <Empty icon="📋" title="Aucune table sélectionnée">Ouvrez le menu ☰ et gérez vos tables pour sélectionner une session active.</Empty>;
    }
    if (!activeSession.characters?.length) {
        return <Empty icon="👥" title="Aucun personnage dans cette table">Assignez des personnages à la table « {activeSession.name} » via la gestion des tables.</Empty>;
    }

    const sessionCharacters = activeSession.characters;

    return (
        <div className="flex flex-col md:flex-row gap-4">

            {/* ── Liste des personnages ─────────────────────────────────────── */}
            <aside className="md:w-64 shrink-0 bg-surface border-2 border-default rounded-lg overflow-hidden self-start w-full">
                <div className="px-3 py-2 border-b border-default">
                    <p className="text-[10px] uppercase tracking-wide text-muted">Personnages</p>
                    <p className="text-xs font-semibold text-primary">{activeSession.name}</p>
                </div>
                {loading && <p className="p-3 text-xs text-muted italic">Chargement des fiches…</p>}
                {!loading && sessionCharacters.map(sc => (
                    <CharacterTile key={sc.id} sessionChar={sc} full={characters[sc.id]}
                                   selected={selectedId === sc.id} online={onlineIds.has(sc.id)}
                                   onSelect={() => setSelectedId(sc.id)} />
                ))}
                <div className="p-2 flex gap-2">
                    <button onClick={() => setShowSendModal(true)} className="flex-1 px-2 py-1.5 bg-success text-white rounded text-xs font-semibold">📨 Note</button>
                    <button onClick={() => setShowSendItemModal(true)} className="flex-1 px-2 py-1.5 bg-primary text-default rounded text-xs font-semibold">🎁 Objet</button>
                </div>
            </aside>

            {/* ── Fiche ─────────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
                {!char ? (
                    <Empty icon="🗡️" title="Aucun personnage sélectionné">Sélectionnez un personnage dans la liste.</Empty>
                ) : (
                    <>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                            <div className="flex gap-1">
                                {[['fiche', '📋 Fiche'], ['inventaire', '🎒 Inventaire']].map(([id, label]) => (
                                    <button key={id} onClick={() => setView(id)}
                                            className={`px-3 py-1.5 rounded text-xs font-semibold ${view === id ? 'bg-primary text-default' : 'bg-surface-alt text-default'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1" />
                            <button onClick={handleCopyCode} className="px-2 py-1.5 rounded border border-default text-xs text-default">
                                {copied ? '✓ Copié' : '⎘ Copier lien + code'}
                            </button>
                            {view === 'fiche' && (editMode ? (
                                <>
                                    <button onClick={cancelEdit} className="px-2 py-1.5 rounded border border-default text-xs text-default">Annuler</button>
                                    <button onClick={saveEdit} className="px-2 py-1.5 rounded bg-success text-white text-xs">✓ Enregistrer</button>
                                </>
                            ) : (
                                <button onClick={startEdit} className="px-2 py-1.5 rounded bg-secondary text-white text-xs">⚙️ Éditer</button>
                            ))}
                        </div>

                        {view === 'fiche' ? (
                            <SheetLayout
                                char={char}
                                editMode={editMode}
                                set={set}
                                update={update}
                                onRoll={setDiceContext}
                                onAvatarClick={() => setShowAvatar(true)}
                                onOpenEditModal={setShowEditModal}
                            />
                        ) : (
                            <InventoryTab character={characters[selectedId]} onUpdate={update} />
                        )}
                    </>
                )}
            </div>

            {/* ── Modales ───────────────────────────────────────────────────── */}
            {showSendModal && (
                <GMSendModal
                    onClose={() => setShowSendModal(false)}
                    onSend={handleGMSend}
                    sessionCharacters={sessionCharacters}
                    preSelectedCharId={selectedId}
                />
            )}
            {showSendItemModal && (
                <GMSendItemModal
                    onClose={() => setShowSendItemModal(false)}
                    onSend={handleGMSendItem}
                    sessionCharacters={sessionCharacters}
                    preSelectedCharId={selectedId}
                />
            )}
            {showAvatar && char && (
                <AvatarUploader
                    currentAvatar={char.avatar}
                    onAvatarChange={(avatar) => update(prev => ({ ...prev, avatar }))}
                    onClose={() => setShowAvatar(false)}
                />
            )}
            {showEditModal && editableChar && (
                <EditModals type={showEditModal} character={editableChar}
                            onClose={() => setShowEditModal(null)}
                            onUpdate={(newChar) => { setEditableChar(newChar); setShowEditModal(null); }} />
            )}
            {diceContext && characters[selectedId] && (
                <DiceModal character={characters[selectedId]} isBerserk={false} context={diceContext}
                           onClose={() => setDiceContext(null)} onUpdate={update} sessionId={sessionId} />
            )}
        </div>
    );
};

export default TabSession;

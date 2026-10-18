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
import DiceModal       from '../../components/modals/DiceModal.jsx';
import EditModals      from '../../components/modals/EditModals.jsx';
import GMSendItemModal from '../modals/GMSendItemModal.jsx';
import TableActionsModal from '../modals/TableActionsModal.jsx';
import VkPanel         from '../../components/ui/VkPanel.jsx';
import VkIcon          from '../../components/ui/VkIcon.jsx';
import { BLESSURE_MAX, FATIGUE_MAX, withDerivedValues } from '../../config/rules.js';
import { formatFullName, pickEditableFields } from '../../config/utils.js';

const resolve = (updater, prev) => (typeof updater === 'function' ? updater(prev) : updater);

// ── Vignette d'un personnage dans la liste ───────────────────────────────────

const CharacterTile = ({ sessionChar, full, selected, online, onSelect }) => (
    <button type="button" onClick={onSelect} className={`vk-tile ${selected ? 'is-selected' : ''}`}>
        <span className="relative shrink-0">
            <span className="vk-avatar w-9 h-9 overflow-hidden">
                {full?.avatar
                    ? <img src={full.avatar} alt="" className="w-full h-full object-cover" />
                    : ((full?.prenom ?? sessionChar.name)?.[0]?.toUpperCase() || '?')}
            </span>
            <span className={`vk-presence absolute -bottom-0.5 -right-0.5 ${online ? 'is-online' : ''}`} />
        </span>
        <span className="flex-1 min-w-0">
            <span className="block font-bold truncate">{full ? formatFullName(full) : sessionChar.name}</span>
            {full?.playerName && <span className="block text-xs text-muted truncate">{full.playerName}</span>}
            {full && (
                <span className="flex gap-1 mt-0.5 flex-wrap">
                    <span className={`vk-tag ${full.tokensBlessure > 1 ? 'vk-tag-warn' : 'vk-tag-muted'}`}><VkIcon name="blood" />{full.tokensBlessure ?? 0}/{BLESSURE_MAX}</span>
                    <span className={`vk-tag ${full.tokensFatigue > 1 ? 'vk-tag-warn' : 'vk-tag-muted'}`}><VkIcon name="moon" />{full.tokensFatigue ?? 0}/{FATIGUE_MAX}</span>
                    <span className="vk-tag vk-tag-gold"><span className="vk-rune">ᛟ</span>{full.sagaActuelle ?? 0}</span>
                </span>
            )}
        </span>
    </button>
);

const Empty = ({ icon, title, children }) => (
    <VkPanel className="text-center">
        <VkIcon name={icon} className="vk-icon-lg text-primary mb-2" />
        <div className="vk-label text-xl text-primary mb-2">{title}</div>
        <p className="text-muted">{children}</p>
    </VkPanel>
);

// ── Onglet ───────────────────────────────────────────────────────────────────

const TabSession = ({ activeSession, onlineCharacters = [], characterUpdates }) => {
    const { slug, apiBase } = useSystem();
    const fetchWithAuth = useFetch();

    const [characters, setCharacters] = useState({});   // { [id]: personnage complet }
    const [selectedId, setSelectedId] = useState(null);
    const [loading,    setLoading]    = useState(false);

    const [editMode,     setEditMode]     = useState(false);
    const [editableChar, setEditableChar] = useState(null);

    const [showSendModal,     setShowSendModal]     = useState(false);
    const [showSendItemModal, setShowSendItemModal] = useState(false);
    const [showAvatar,        setShowAvatar]        = useState(false);
    const [showEditModal,     setShowEditModal]     = useState(null);
    const [showTableActions,  setShowTableActions]  = useState(false);
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
        const next = withDerivedValues(resolve(updater, prev));   // valeurs de combat recalculées (L3-6)
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

    // ── Actions de table : PATCH des seuls champs modifiés (§5.3) ─────────
    // La route rediffuse character-full-update : joueurs et MJ se mettent à jour.
    const patchCharacter = useCallback(async (id, patch) => {
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${id}`, {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(patch),
            });
            if (r.ok) {
                const saved = await r.json();
                setCharacters(p => ({ ...p, [id]: saved }));
            }
        } catch (e) {
            console.error('[TabSession/vikings] patchCharacter:', e);
        }
    }, [apiBase]);

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

    // ── Envoi d'objet au journal (route générique ; les messages sont envoyés par GMSendModal) ──
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
        return <Empty icon="people" title="Aucune table sélectionnée">Ouvrez le menu et gérez vos tables pour sélectionner une session active.</Empty>;
    }
    if (!activeSession.characters?.length) {
        return <Empty icon="people" title="Aucun personnage dans cette table">Assignez des personnages à la table « {activeSession.name} » via la gestion des tables.</Empty>;
    }

    const sessionCharacters = activeSession.characters;

    return (
        <div className="flex flex-col md:flex-row gap-6">

            {/* ── Liste des personnages ─────────────────────────────────────── */}
            <aside className="vk-panel md:w-72 shrink-0 self-start w-full">
                <div className="px-3 py-2 border-b border-default">
                    <div className="vk-eyebrow">Personnages</div>
                    <div className="vk-label text-primary">{activeSession.name}</div>
                </div>
                {loading && <p className="p-3 text-sm text-muted italic">Chargement des fiches…</p>}
                {!loading && sessionCharacters.map(sc => (
                    <CharacterTile key={sc.id} sessionChar={sc} full={characters[sc.id]}
                                   selected={selectedId === sc.id} online={onlineIds.has(sc.id)}
                                   onSelect={() => setSelectedId(sc.id)} />
                ))}
                <div className="p-2 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setShowSendModal(true)} className="vk-btn vk-btn-sm"><VkIcon name="scroll" />Note</button>
                    <button type="button" onClick={() => setShowSendItemModal(true)} className="vk-btn vk-btn-sm"><VkIcon name="pouch" />Objet</button>
                    <button type="button" onClick={() => setShowTableActions(true)} disabled={loading}
                            className="vk-btn vk-btn-primary vk-btn-sm col-span-2" title="Saga, fin d'arc, repos">
                        <span className="vk-rune">ᛟ</span>Actions de table
                    </button>
                </div>
            </aside>

            {/* ── Fiche ─────────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
                {!char ? (
                    <Empty icon="portrait" title="Aucun personnage sélectionné">Sélectionnez un personnage dans la liste.</Empty>
                ) : (
                    <>
                        <div className="flex items-center gap-2 flex-wrap justify-end mb-4">
                            <button type="button" onClick={handleCopyCode} className="vk-btn vk-btn-sm">
                                {copied ? <><VkIcon name="check" />Copié</> : <><VkIcon name="key" />Copier lien + code</>}
                            </button>
                            {editMode ? (
                                <>
                                    <button type="button" onClick={cancelEdit} className="vk-btn vk-btn-danger vk-btn-sm">Annuler</button>
                                    <button type="button" onClick={saveEdit} className="vk-btn vk-btn-success vk-btn-sm"><VkIcon name="check" />Enregistrer</button>
                                </>
                            ) : (
                                <button type="button" onClick={startEdit} className="vk-btn vk-btn-sm"><VkIcon name="quill" />Éditer</button>
                            )}
                        </div>

                        <SheetLayout
                            char={char}
                            editMode={editMode}
                            set={set}
                            update={update}
                            onRoll={setDiceContext}
                            onAvatarClick={() => setShowAvatar(true)}
                            onOpenEditModal={setShowEditModal}
                        />
                    </>
                )}
            </div>

            {/* ── Modales ───────────────────────────────────────────────────── */}
            {showSendModal && (
                <GMSendModal
                    onClose={() => setShowSendModal(false)}
                    sessionId={sessionId}
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
            {showTableActions && (
                <TableActionsModal
                    characters={sessionCharacters.map(sc => characters[sc.id]).filter(Boolean)}
                    onApply={patchCharacter}
                    onClose={() => setShowTableActions(false)}
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

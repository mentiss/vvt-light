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
import { useFetch }  from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import GMSendModal    from '@/features/table/modals/GMSendModal.jsx';
import AvatarUploader from '@/ui/image/AvatarUploader.jsx';
import AudioSessionToggle from '@/features/audio/AudioSessionToggle.jsx';
import BoardSessionToggle from '@/features/board/BoardSessionToggle.jsx';
import CopyAccessButton from '@/features/table/CopyAccessButton.jsx';
import TableManagementButton from '@/features/table/TableManagementButton.jsx';

import SheetLayout     from '../../components/layout/SheetLayout.jsx';
import DiceModal       from '../../components/modals/DiceModal.jsx';
import EditModals      from '../../components/modals/EditModals.jsx';
import GMSendItemModal from '../modals/GMSendItemModal.jsx';
import { HallCard, ArcRecap } from '../components/Hall.jsx';
import VkPanel         from '../../components/ui/VkPanel.jsx';
import VkIcon          from '../../components/ui/VkIcon.jsx';
import { withDerivedValues } from '../../config/rules.js';
import { formatFullName, pickEditableFields } from '../../config/utils.js';

const resolve = (updater, prev) => (typeof updater === 'function' ? updater(prev) : updater);

// Liste des personnages : la halle (gm/components/Hall.jsx, spec_vikings_pierre_peinte.md D-12)

const Empty = ({ icon, title, children, action }) => (
    <VkPanel className="text-center">
        <VkIcon name={icon} className="vk-icon-lg text-primary mb-2" />
        <div className="vk-label text-xl text-primary mb-2">{title}</div>
        {children && <p className="text-muted">{children}</p>}
        {action && <div className="mt-3">{action}</div>}
    </VkPanel>
);

// ── Onglet ───────────────────────────────────────────────────────────────────

const TabSession = ({ activeSession, onlineCharacters = [], characterUpdates, onSessionChange }) => {
    const { apiBase } = useSystem();
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
    const [showArc,           setShowArc]           = useState(false);   // fin d'arc à la place de la fiche
    const [diceContext,       setDiceContext]       = useState(null);

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
        return (
            <Empty icon="people" title="Aucune table sélectionnée"
                   action={/* Appel à choisir une table (spec_ui_menu.md §12) */
                       <TableManagementButton activeSessionId={null} onSelectTable={(session) => onSessionChange?.(session ?? null)}
                                              icon={<VkIcon name="people" />} className="vk-btn vk-btn-primary" />} />
        );
    }
    if (!activeSession.characters?.length) {
        return (
            <Empty icon="people" title="Aucun personnage dans cette table"
                   action={/* Gestion des tables pour assigner des personnages (spec_ui_menu.md §12) */
                       <TableManagementButton activeSessionId={activeSession.id} onSelectTable={(session) => onSessionChange?.(session ?? null)}
                                              label="Gestion des tables" icon={<VkIcon name="people" />} className="vk-btn vk-btn-primary" />}>
                Assignez des personnages à la table « {activeSession.name} ».
            </Empty>
        );
    }

    const sessionCharacters = activeSession.characters;

    return (
        <div className="flex flex-col md:flex-row gap-6">

            {/* ── La halle : personnages de la table en colonne ─────────────── */}
            <aside className="vk-hall md:w-80 shrink-0 self-start w-full">
                <div className="vk-hall-top">
                    <div className="min-w-0">
                        <div className="vk-eyebrow">La table · {sessionCharacters.filter(sc => onlineIds.has(sc.id)).length}/{sessionCharacters.length} en ligne</div>
                        <div className="vk-label text-primary truncate">{activeSession.name}</div>
                    </div>
                    <button type="button" onClick={() => setShowArc(v => !v)} disabled={loading}
                            className={`vk-btn vk-btn-sm ${showArc ? '' : 'vk-btn-primary'}`} title="Saga, points de compétence, repos">
                        {showArc ? 'Retour à la fiche' : <><span className="vk-rune">ᛟ</span>Fin d'arc</>}
                    </button>
                </div>
                {loading && <p className="p-3 text-sm text-muted italic">Chargement des fiches…</p>}
                {!loading && sessionCharacters.map(sc => (
                    <HallCard key={sc.id} sessionChar={sc} char={characters[sc.id]}
                              selected={!showArc && selectedId === sc.id} online={onlineIds.has(sc.id)}
                              onSelect={() => { setSelectedId(sc.id); setShowArc(false); }}
                              onPatch={patchCharacter}
                              onRoll={() => { setSelectedId(sc.id); setShowArc(false); setDiceContext({ type: 'carac', data: 'force' }); }} />
                ))}
            </aside>

            {/* ── Fiche ─────────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
                {/* Barre d'outils : table (note, objet, musique, tableau) à gauche, personnage à droite (retour MJ) */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                    <button type="button" onClick={() => setShowSendModal(true)} className="vk-btn vk-btn-sm"><VkIcon name="scroll" />Note</button>
                    <button type="button" onClick={() => setShowSendItemModal(true)} className="vk-btn vk-btn-sm"><VkIcon name="pouch" />Objet</button>
                    {/* Musique de la table (brique audio, spec_audio.md §11.7) */}
                    <AudioSessionToggle sessionId={activeSession.id} className="vk-btn vk-btn-sm" />
                    {/* Tableau partagé de la table (spec_tableau.md §10.8) */}
                    <BoardSessionToggle sessionId={activeSession.id} className="vk-btn vk-btn-sm" />
                    <span className="flex-1" />
                    {!showArc && char && (
                        <>
                            <CopyAccessButton character={char} name={formatFullName(char)} icon={<VkIcon name="key" />} className="vtt-btn-sm" />
                            {editMode ? (
                                <>
                                    <button type="button" onClick={cancelEdit} className="vk-btn vk-btn-danger vk-btn-sm">Annuler</button>
                                    <button type="button" onClick={saveEdit} className="vk-btn vk-btn-success vk-btn-sm"><VkIcon name="check" />Enregistrer</button>
                                </>
                            ) : (
                                <button type="button" onClick={startEdit} className="vk-btn vk-btn-sm"><VkIcon name="quill" />Éditer</button>
                            )}
                        </>
                    )}
                </div>
                {showArc ? (
                    <ArcRecap characters={sessionCharacters.map(sc => characters[sc.id]).filter(Boolean)}
                              onPatch={patchCharacter} onDone={() => setShowArc(false)} />
                ) : !char ? (
                    <Empty icon="portrait" title="Aucun personnage sélectionné">Sélectionnez un personnage dans la liste.</Empty>
                ) : (
                    <>
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

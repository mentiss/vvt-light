// src/client/src/systems/fabula/gm/tabs/TabSession.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Session GM — Fabula Ultima
//
// Contrat GM standard (permanent, tous slugs) :
//   1. Sidebar personnages : avatar + nom perso + (nom joueur) + résumé classes + dot online
//   2. Fiche — FicheGrid, EXACTEMENT les mêmes composants et le même ordre que Sheet.jsx
//   3. Mode édition toggle → PUT complet à la fermeture
//   4. Envoyer une note (GMSendModal pré-sélectionné)
//   5. Copier le code d'accès dans le presse-papier
//
// Socket : aucun listener character-full-update/character-update ici (règle
// Achtung, retenue comme référence) — rechargement via HTTP après action.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { useFetch }  from '../../../../hooks/useFetch.js';
import { useSystem } from '../../../../hooks/useSystem.js';

import GMSendModal from '../../../../components/gm/modals/GMSendModal.jsx';
import AudioSessionToggle from '../../../../components/audio/AudioSessionToggle.jsx';
import BoardSessionToggle from '../../../../components/board/BoardSessionToggle.jsx';
import AvatarUploader from '../../../../components/AvatarUploader.jsx';
import CopyAccessButton from '../../../../components/ui/CopyAccessButton.jsx';

import { CLASSES, computeDerivedStats } from '../../config.jsx';
import FicheGrid       from '../../components/layout/FicheGrid.jsx';
import FabulaDiceModal from '../../components/modals/FabulaDiceModal.jsx';
import FuIcon          from '../../components/ui/FuIcon.jsx';
import FuGauge         from '../../components/ui/FuGauge.jsx';
import { isInCrisis }  from '../../config.jsx';

const classSummary = (classes) => (classes ?? [])
    .map(c => `${CLASSES[c.classKey]?.nom ?? c.classKey} ${c.niveau}`)
    .join(' / ') || '—';

const TabSession = ({ activeSession, onlineCharacters, characterUpdates }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    const [characters, setCharacters] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading]       = useState(false);
    const [editMode, setEditMode]     = useState(false);
    const [editableChar, setEditableChar] = useState(null);
    const [showSendModal, setShowSendModal] = useState(false);
    const [showAvatarUploader, setShowAvatarUploader] = useState(false);
    const [diceModalAttrs, setDiceModalAttrs] = useState(null);
    const [saving, setSaving] = useState(false);

    // Compteur GM de Points Fabula dépensés par personnage, pour cette session
    // (calcul d'XP de fin de session — jamais exposé au joueur). État séparé de
    // `characters` : la donnée vit sur session_characters, pas sur la fiche.
    const [pfDepenses, setPfDepenses] = useState({});

    const onlineIds = new Set((onlineCharacters ?? []).map(c => c.characterId));

    // ── Chargement des personnages de la session ─────────────────────────────
    useEffect(() => {
        if (!activeSession?.characters?.length) {
            setCharacters({});
            setSelectedId(null);
            return;
        }
        setLoading(true);
        (async () => {
            const loaded = {};
            await Promise.all(activeSession.characters.map(async c => {
                try {
                    const r = await fetchWithAuth(`${apiBase}/characters/${c.id}`);
                    if (r.ok) loaded[c.id] = await r.json();
                } catch (e) {
                    console.error(`[TabSession/fabula] load ${c.id}:`, e);
                }
            }));
            setCharacters(loaded);
            setSelectedId(prev => (prev && loaded[prev]) ? prev : (activeSession.characters[0]?.id ?? null));
            setLoading(false);
        })();

        // Compteur PF dépensés — route dédiée (pf_depenses vit sur
        // session_characters, hors du contrat générique de la fiche).
        fetchWithAuth(`${apiBase}/session-characters/${activeSession.id}`)
            .then(r => r.ok ? r.json() : {})
            .then(setPfDepenses)
            .catch(e => console.error('[TabSession/fabula] load pfDepenses:', e));
    }, [activeSession, apiBase]);

    const adjustPfDepenses = useCallback(async (characterId, delta) => {
        try {
            const r = await fetchWithAuth(`${apiBase}/session-characters/${activeSession.id}/${characterId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delta }),
            });
            if (r.ok) {
                const { pfDepenses: newVal } = await r.json();
                setPfDepenses(prev => ({ ...prev, [characterId]: newVal }));
            }
        } catch (e) {
            console.error('[TabSession/fabula] adjustPfDepenses:', e);
        }
    }, [activeSession, apiBase, fetchWithAuth]);

    // ── Mises à jour temps réel (via useGMSession → characterUpdates) ────────
    // Ne touche que les personnages déjà chargés dans cette session — évite de
    // fusionner des données pour un personnage hors session.
    useEffect(() => {
        if (!characterUpdates) return;
        setCharacters(prev => {
            let changed = false;
            const next = { ...prev };
            for (const [idStr, update] of Object.entries(characterUpdates)) {
                const id = Number(idStr);
                if (!prev[id]) continue; // pas dans cette session
                if (update.type === 'full') {
                    next[id] = update.data;
                } else {
                    next[id] = { ...prev[id], ...update.data };
                }
                changed = true;
            }
            return changed ? next : prev;
        });
    }, [characterUpdates]);

    const char = selectedId ? (editMode ? editableChar : characters[selectedId]) : null;

    // ── Sauvegarde ────────────────────────────────────────────────────────────

    const saveEdit = useCallback(async () => {
        if (!selectedId || !editableChar) return;
        setSaving(true);
        try {
            const recomputed = computeDerivedStats(editableChar);
            const r = await fetchWithAuth(`${apiBase}/characters/${selectedId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...editableChar, ...recomputed }),
            });
            if (r.ok) {
                const updated = await r.json();
                setCharacters(prev => ({ ...prev, [selectedId]: updated }));
            }
        } catch (e) {
            console.error('[TabSession/fabula] saveEdit:', e);
        } finally {
            setSaving(false);
        }
    }, [selectedId, editableChar, apiBase, fetchWithAuth]);

    // Utilisé aussi par les actions "toujours actives" (steppers ressources,
    // altérations) hors mode édition — patch complet immédiat.
    // Même correctif que Sheet.jsx : recalcule TOUJOURS les stats dérivées
    // avant de persister — sinon Défense/Déf.Mag./Initiative restent périmés
    // après un équiper/déséquiper ou un ajustement de boost côté GM.
    const patchImmediate = useCallback(async (patch) => {
        const base = characters[selectedId];
        if (!base) return;
        const merged     = { ...base, ...patch };
        const recomputed = computeDerivedStats(merged);
        const full        = { ...merged, ...recomputed };
        const r = await fetchWithAuth(`${apiBase}/characters/${selectedId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(full),
        });
        if (r.ok) {
            const updated = await r.json();
            setCharacters(prev => ({ ...prev, [selectedId]: updated }));
            if (editMode) setEditableChar(prev => ({ ...prev, ...patch, ...recomputed }));
        }
    }, [characters, selectedId, apiBase, fetchWithAuth, editMode]);

    const toggleEditMode = async () => {
        if (editMode) {
            await saveEdit();
            setEditMode(false);
        } else {
            setEditableChar({ ...characters[selectedId] });
            setEditMode(true);
        }
    };
    const cancelEdit = () => {
        setEditableChar(null);
        setEditMode(false);
    };

    const setField = (field, value) => setEditableChar(prev => ({ ...prev, [field]: value }));

    // Certains boutons de FicheGrid (Équiper/Déséquiper le sac à dos, ajout
    // depuis le catalogue d'équipement) restent actifs hors mode édition —
    // ce sont des actions de jeu immédiates, pas des modifications de texte
    // libre. onArrayChange doit donc persister tout de suite dans ce cas
    // (comme onQuickUpdate), et ne bufferiser dans editableChar qu'en édition.
    const setArr = (field, value) => {
        if (editMode) {
            setEditableChar(prev => ({ ...prev, [field]: value }));
        } else {
            patchImmediate({ [field]: value });
        }
    };

    const sessionCharsForModal = (activeSession?.characters ?? []).map(sc => ({
        id: sc.id,
        name: characters[sc.id]?.nom ?? `#${sc.id}`,
        avatar: sc.avatar,
    }));

    const openDiceModal = (attr1 = 'dex', attr2 = 'int') => setDiceModalAttrs({ attr1, attr2 });

    if (!activeSession) {
        return <p className="fu-win m-4 text-sm text-muted italic">Aucune session active — gérez votre table depuis le menu, « Gestion des tables ».</p>;
    }

    return (
        <div className="flex" style={{ minHeight: 'calc(100vh - 7rem)' }}>

            {/* ── Sidebar personnages ─────────────────────────────────────── */}
            <aside className="w-72 shrink-0 border-r border-default bg-surface">
              {/* Contenu collé en haut au défilement (comme la barre de session du
                  joueur) ; le fond de la barre garde toute la hauteur. */}
              <div className="sticky top-0 max-h-screen overflow-y-auto">
                <div className="px-3 py-2 border-b border-default">
                    <p className="fu-label">Personnages</p>
                    <p className="fu-title text-sm">{activeSession.name}</p>
                    {/* Musique de la table (brique audio, spec_audio.md §11.7) */}
                    <AudioSessionToggle sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full mt-2" />
                    {/* Tableau partagé de la table (spec_tableau.md §10.8) */}
                    <BoardSessionToggle sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full mt-2" />
                </div>

                {loading && <p className="p-3 text-xs text-muted italic">Chargement...</p>}

                {/* Cartes de l'équipe (planche §7) : PV, PM, PI en mini-jauges, Crise qui pulse,
                    Points Fabula en cristaux, compteur MJ des PF dépensés */}
                <div className="fu-party">
                    {!loading && (activeSession.characters ?? []).map(c => {
                        const full     = characters[c.id];
                        const online   = onlineIds.has(c.id);
                        const selected = selectedId === c.id;
                        const crisis   = full ? isInCrisis(full) : false;
                        const pf       = full?.pointsFabula ?? 0;
                        const select   = () => { setSelectedId(c.id); setEditMode(false); };
                        return (
                            // ⚠️ Élément englobant délibérément un <div>, pas un <button> : il
                            // contient les boutons +/- du compteur PF, et un <button> ne peut pas
                            // englober d'autres <button> (HTML invalide). role="button" + clavier
                            // pour l'accessibilité.
                            <div key={c.id} role="button" tabIndex={0}
                                 onClick={select}
                                 onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') select(); }}
                                 className={`fu-member${selected ? ' is-on' : ''}`}>
                                <div className="fu-member-avatar">
                                    {full?.avatar ? <img src={full.avatar} alt="" /> : <FuIcon name="hero" className="fu-ico-sm" />}
                                    <span className={`fu-member-online${online ? ' is-on' : ''}`} title={online ? 'En ligne' : 'Hors ligne'} />
                                </div>
                                <div className="min-w-0">
                                    <div className="fu-member-name">
                                        <span>{[full?.prenom, full?.nom].filter(Boolean).join(' ') || '…'}</span>
                                        {crisis && <span className="fu-tag text-danger">Crise</span>}
                                    </div>
                                    <div className="fu-member-sub">{full?.playerName || '—'} · {classSummary(full?.classes)}</div>
                                </div>
                                {full && (
                                    <div className="fu-member-bars">
                                        {[['pv', 'PV', full.pvActuel, full.pvMax], ['pm', 'PM', full.pmActuel, full.pmMax], ['pi', 'PI', full.piActuel, full.piMax]].map(([k, label, v, max]) => (
                                            <div key={k} className={`fu-minibar fu-res${k === 'pv' && crisis ? ' is-crisis' : ''}`} data-k={k}>
                                                <span className="fu-res-key">{label}</span>
                                                <FuGauge value={v ?? 0} max={max ?? 0} />
                                                <span className="fu-res-val">{v ?? 0}/{max ?? 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="fu-member-foot">
                                    {Array.from({ length: Math.min(pf, 6) }, (_, n) => <i key={n} className="fu-crystal fu-crystal-sm" />)}
                                    <span>{pf} PF</span>
                                    {/* Compteur PF dépensés — MJ uniquement, jamais visible du joueur */}
                                    <span className="fu-micro-step" onClick={e => e.stopPropagation()} title="Points Fabula dépensés cette session">
                                        dépensés
                                        <button type="button" onClick={() => adjustPfDepenses(c.id, -1)} aria-label="PF dépensés : −1">−</button>
                                        <b>{pfDepenses[c.id] ?? 0}</b>
                                        <button type="button" onClick={() => adjustPfDepenses(c.id, 1)} aria-label="PF dépensés : +1">+</button>
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
              </div>
            </aside>

            {/* ── Colonne fiche ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto min-w-0">
                {!char ? (
                    <p className="fu-win m-4 text-sm text-muted italic">Sélectionnez un personnage.</p>
                ) : (
                    <>
                        <div className="flex items-center gap-2 flex-wrap px-4 py-2 border-b border-default bg-surface-alt">
                            <span className="fu-title">{[char.prenom, char.nom].filter(Boolean).join(' ') || char.nom}</span>
                            {char.pvActuel <= char.seuilCrise && (
                                <span className="fu-tag text-danger">Crise</span>
                            )}
                            <div className="flex-1" />
                            <button onClick={() => setShowSendModal(true)} className="fu-btn fu-btn-sm">
                                <FuIcon name="send" className="fu-ico-sm" /> Note
                            </button>
                            <CopyAccessButton character={char} className="fu-btn fu-btn-sm"
                                              icon={<FuIcon name="copy" className="fu-ico-sm" />} />
                            {editMode ? (
                                <>
                                    <button onClick={cancelEdit} className="fu-btn fu-btn-sm">Annuler</button>
                                    <button onClick={toggleEditMode} disabled={saving}
                                            className="fu-btn fu-btn-sm fu-btn-gold">
                                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                                    </button>
                                </>
                            ) : (
                                <button onClick={toggleEditMode} className="fu-btn fu-btn-sm"><FuIcon name="edit" className="fu-ico-sm" />Édition</button>
                            )}
                        </div>

                        <div className="p-4">
                            <FicheGrid
                                character={char}
                                sessionId={activeSession?.id ?? null}
                                editMode={editMode}
                                onFieldChange={setField}
                                onArrayChange={setArr}
                                onQuickUpdate={patchImmediate}
                                onAvatarClick={() => setShowAvatarUploader(true)}
                                onRollAttribute={(attrKey) => !editMode && openDiceModal(attrKey, attrKey === 'dex' ? 'int' : 'dex')}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* ── Modales ──────────────────────────────────────────────────── */}
            {showSendModal && (
                <GMSendModal
                    onClose={() => setShowSendModal(false)}
                    preSelectedCharId={selectedId}
                    sessionId={activeSession?.id ?? null}
                    sessionCharacters={sessionCharsForModal}
                />
            )}
            {showAvatarUploader && char && (
                <AvatarUploader
                    currentAvatar={char.avatar}
                    onAvatarChange={(newAvatar) => patchImmediate({ avatar: newAvatar })}
                    onClose={() => setShowAvatarUploader(false)}
                />
            )}
            {diceModalAttrs && char && (
                <FabulaDiceModal
                    character={characters[selectedId]}
                    sessionId={activeSession?.id ?? null}
                    initialAttr1={diceModalAttrs.attr1}
                    initialAttr2={diceModalAttrs.attr2}
                    onCharacterPatch={patchImmediate}
                    onClose={() => setDiceModalAttrs(null)}
                />
            )}
        </div>
    );
};

export default TabSession;
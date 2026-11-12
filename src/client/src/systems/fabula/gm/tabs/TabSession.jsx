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
// Fiches de la table : useTableCharacters (spec_session_mj.md §3), aucune écoute
// de socket ici ; l'enregistrement recalcule les stats dérivées avant l'envoi.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { useFetch }  from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import { useTableCharacters } from '@/features/table/hooks/useTableCharacters.js';

import GMSendModal from '@/features/table/modals/GMSendModal.jsx';
import TableSessionTools from '@/features/table/TableSessionTools.jsx';
import AvatarUploader from '@/ui/image/AvatarUploader.jsx';
import CopyAccessButton from '@/features/table/CopyAccessButton.jsx';
import TableManagementButton from '@/features/table/TableManagementButton.jsx';

import { CLASSES, computeDerivedStats } from '../../config.jsx';
import FicheGrid       from '../../components/layout/FicheGrid.jsx';
import FabulaDiceModal from '../../components/modals/FabulaDiceModal.jsx';
import FuIcon          from '../../components/ui/FuIcon.jsx';
import FuGauge         from '../../components/ui/FuGauge.jsx';
import { isInCrisis }  from '../../config.jsx';

const classSummary = (classes) => (classes ?? [])
    .map(c => `${CLASSES[c.classKey]?.nom ?? c.classKey} ${c.niveau}`)
    .join(' / ') || '—';

const TabSession = ({ activeSession, onlineCharacters, characterUpdates, onSessionChange }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    const { characters, order, loading, patchCharacter } = useTableCharacters(activeSession, characterUpdates);
    const [pickedId, setSelectedId] = useState(null);
    const selectedId = characters[pickedId] ? pickedId : (order[0] ?? null);   // premier personnage par défaut
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

    // ── Compteur PF dépensés — route dédiée (pf_depenses vit sur
    // session_characters, hors du contrat générique de la fiche).
    useEffect(() => {
        if (!activeSession?.characters?.length) return;
        fetchWithAuth(`${apiBase}/session-characters/${activeSession.id}`)
            .then(r => r.ok ? r.json() : {})
            .then(setPfDepenses)
            .catch(e => console.error('[TabSession/fabula] load pfDepenses:', e));
    }, [activeSession, apiBase, fetchWithAuth]);

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

    const char = selectedId ? (editMode ? editableChar : characters[selectedId]) : null;

    // ── Sauvegarde ────────────────────────────────────────────────────────────

    const saveEdit = useCallback(async () => {
        if (!selectedId || !editableChar) return;
        setSaving(true);
        await patchCharacter(selectedId, { ...editableChar, ...computeDerivedStats(editableChar) });
        setSaving(false);
    }, [selectedId, editableChar, patchCharacter]);

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
        const updated    = await patchCharacter(selectedId, { ...merged, ...recomputed });
        if (updated && editMode) setEditableChar(prev => ({ ...prev, ...patch, ...recomputed }));
    }, [characters, selectedId, patchCharacter, editMode]);

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
        return (
            <div className="fu-win m-4 flex flex-col items-start gap-3">
                <p className="text-sm text-muted italic">Aucune table active.</p>
                {/* Appel à choisir une table (spec_ui_menu.md §12) */}
                <TableManagementButton activeSessionId={null} onSelectTable={(session) => onSessionChange?.(session)}
                                       icon={<FuIcon name="gear" />} />
            </div>
        );
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
                    <TableSessionTools sessionId={activeSession.id} className="vtt-btn vtt-btn-sm w-full mt-2" />
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
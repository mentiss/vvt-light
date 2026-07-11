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
import AvatarUploader from '../../../../components/AvatarUploader.jsx';

import { CLASSES, computeDerivedStats } from '../../config.jsx';
import FicheGrid       from '../../components/layout/FicheGrid.jsx';
import FabulaDiceModal from '../../components/modals/FabulaDiceModal.jsx';

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
    const [copied, setCopied] = useState(false);
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

    // ── Copier le code d'accès ────────────────────────────────────────────────
    const handleCopyCode = () => {
        const c = characters[selectedId];
        if (!c) return;
        const text = [
            `Fabula Ultima — ${c.nom || 'Sans nom'}`,
            `Lien : ${window.location.origin}/fabula/${c.accessUrl}`,
            `Code : ${c.accessCode}`,
        ].join('\n');
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const sessionCharsForModal = (activeSession?.characters ?? []).map(sc => ({
        id: sc.id,
        name: characters[sc.id]?.nom ?? `#${sc.id}`,
    }));

    const openDiceModal = (attr1 = 'dex', attr2 = 'int') => setDiceModalAttrs({ attr1, attr2 });

    if (!activeSession) {
        return <p className="p-6 text-sm text-muted italic">Aucune session active — gérez votre table via ⚙ Table.</p>;
    }

    return (
        <div className="flex" style={{ minHeight: 'calc(100vh - 7rem)' }}>

            {/* ── Sidebar personnages ─────────────────────────────────────── */}
            <aside className="w-64 shrink-0 border-r border-default bg-surface overflow-y-auto">
                <div className="px-3 py-2 border-b border-default">
                    <p className="text-[10px] uppercase tracking-wide text-muted">Personnages</p>
                    <p className="fu-font-title text-xs text-primary">{activeSession.name}</p>
                </div>

                {loading && <p className="p-3 text-xs text-muted italic">Chargement...</p>}

                {!loading && (activeSession.characters ?? []).map(c => {
                    const full     = characters[c.id];
                    const online   = onlineIds.has(c.id);
                    const selected = selectedId === c.id;
                    return (
                        // ⚠️ Élément englobant délibérément un <div>, pas un <button> : il
                        // contient les boutons +/- du compteur PF (ligne ci-dessous), et un
                        // <button> ne peut pas englober d'autres <button> (HTML invalide —
                        // cassait le rendu/les clics). role="button" + clavier pour
                        // l'accessibilité, comportement de clic inchangé.
                        <div key={c.id} role="button" tabIndex={0}
                             onClick={() => { setSelectedId(c.id); setEditMode(false); }}
                             onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setSelectedId(c.id); setEditMode(false); } }}
                             className={`w-full text-left px-3 py-2 border-b border-default flex items-center gap-2 cursor-pointer ${
                                 selected ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-surface-alt'
                             }`}>
                            <div className="relative shrink-0">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-alt border border-default flex items-center justify-center">
                                    {full?.avatar ? <img src={full.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-xs">🗡️</span>}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-surface ${online ? 'bg-success' : 'bg-default'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className={`text-sm truncate ${selected ? 'font-semibold text-primary' : ''}`}>{full?.nom || '…'}</p>
                                <p className="text-[10px] text-muted truncate">{full?.playerName}</p>
                                <p className="text-[10px] text-muted truncate">{classSummary(full?.classes)}</p>
                            </div>
                            {/* Compteur PF dépensés — GM uniquement, jamais visible joueur */}
                            <div className="flex items-center gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                                <button type="button" onClick={() => adjustPfDepenses(c.id, -1)}
                                        title="PF dépensés : −1"
                                        className="w-4 h-4 rounded border border-default bg-default text-[10px] leading-none cursor-pointer">
                                    −
                                </button>
                                <span className="text-[10px] text-muted min-w-[1rem] text-center" title="Points Fabula dépensés cette session">
                                    {pfDepenses[c.id] ?? 0}
                                </span>
                                <button type="button" onClick={() => adjustPfDepenses(c.id, 1)}
                                        title="PF dépensés : +1"
                                        className="w-4 h-4 rounded border border-default bg-default text-[10px] leading-none cursor-pointer">
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
            </aside>

            {/* ── Colonne fiche ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto min-w-0">
                {!char ? (
                    <p className="p-6 text-sm text-muted italic">Sélectionnez un personnage.</p>
                ) : (
                    <>
                        <div className="flex items-center gap-2 flex-wrap px-4 py-2 border-b border-default bg-surface-alt">
                            <span className="fu-font-title text-sm text-primary">{char.nom}</span>
                            {char.pvActuel <= char.seuilCrise && (
                                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-danger text-white">Crise</span>
                            )}
                            <div className="flex-1" />
                            <button onClick={() => setShowSendModal(true)} className="px-2 py-1 rounded border border-default text-xs">
                                ✉ Note
                            </button>
                            <button onClick={handleCopyCode} className="px-2 py-1 rounded border border-default text-xs">
                                {copied ? '✓ Copié' : '⎘ Copier'}
                            </button>
                            {editMode ? (
                                <>
                                    <button onClick={cancelEdit} className="px-2 py-1 rounded border border-default text-xs">Annuler</button>
                                    <button onClick={toggleEditMode} disabled={saving}
                                            className="px-2 py-1 rounded bg-success text-white text-xs disabled:opacity-50">
                                        {saving ? 'Enregistrement...' : '✓ Enregistrer'}
                                    </button>
                                </>
                            ) : (
                                <button onClick={toggleEditMode} className="px-2 py-1 rounded bg-primary text-white text-xs">✎ Éditer</button>
                            )}
                        </div>

                        <div className="p-4">
                            <FicheGrid
                                character={char}
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
                    isOpen
                    onClose={() => setShowSendModal(false)}
                    preSelectedCharacterId={selectedId}
                    sessionId={activeSession?.id ?? null}
                    characters={sessionCharsForModal}
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
                    onClose={() => setDiceModalAttrs(null)}
                />
            )}
        </div>
    );
};

export default TabSession;
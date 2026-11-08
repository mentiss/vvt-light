// src/client/src/systems/vileborn/gm/tabs/TabChallenges.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Défis de l'interface MJ (spec_vileborn_defis.md §II.5, planche
// vileborn/planche_defis.html), deux vues :
//   - À la table : défis en cours de la table active (piste, difficultés,
//     complications appliquées à un Paria, dé d'obscurité, notes) ; seulement
//     avec une table active ;
//   - Bibliothèque : fiches en base (lecture, création, modification,
//     duplication, suppression, lancement à la table).
// Les actions d'une fiche sont dans une barre en tête. Confirmations par
// ConfirmModal de la plateforme.
//
// Props : activeSession, characters, order, patchCharacter (useTableCharacters)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import CatalogModal from '../../../../components/modals/CatalogModal.jsx';
import ConfirmModal from '../../../../components/modals/ConfirmModal.jsx';
import { DEFAULT_DIFFICULTY } from '../../config/rules/test.js';
import { addWound, sufferState } from '../../config/rules/character.js';
import { toggleBox, reachedTrigger, blankSheet, duplicateSheet, cleanSheet, canSaveSheet } from '../../config/rules/challenge.js';
import { CHALLENGE_FILTERS, CHALLENGE_GROUP, CHALLENGE_SEARCH, sortByFamily, sourceLabel } from '../../config/challenges.js';
import { useChallenges } from '../../hooks/useChallenges.js';
import VilChallengeSheet from '../../components/challenge/VilChallengeSheet.jsx';
import VilChallengeForm from '../../components/challenge/VilChallengeForm.jsx';
import VilChallengeLibrary from '../../components/challenge/VilChallengeLibrary.jsx';
import VilParaPicker from '../../components/challenge/VilParaPicker.jsx';
import VilTrackMini from '../../components/challenge/VilTrackMini.jsx';
import VilDarkDieModal from '../../components/modals/VilDarkDieModal.jsx';

const CATALOG_LABELS = { search: 'Rechercher un défi…', countOne: 'défi', countMany: 'défis', added: 'Défi lancé', all: 'Toutes', empty: 'Aucun défi.' };
const CATALOG_LAYOUT = ['search', 'filters'];

const CatalogRow = ({ c }) => (
    <div className="vil-ch-cat">
        <strong>{c.name}</strong> <span className="vil-note">· {sourceLabel(c.source)}{c.page ? `, p. ${c.page}` : ''}</span>
        <VilTrackMini sheet={c} />
        {c.description && <p>{c.description}</p>}
    </div>
);

const TabChallenges = ({ activeSession, characters, order, patchCharacter }) => {
    const sessionId = activeSession?.id ?? null;
    const ch = useChallenges(sessionId);
    const [view, setView] = useState('table');
    const [activeId, setActiveId] = useState(null);
    const [libId, setLibId] = useState(null);
    const [draft, setDraft] = useState(null);        // formulaire ouvert (fiche, avec id si modification)
    const [base, setBase] = useState(DEFAULT_DIFFICULTY);
    const [trigger, setTrigger] = useState(null);    // { activeId, trigger } : déclencheur mis en avant
    const [picker, setPicker] = useState(null);      // { anchor, effect } : choix du Paria
    const [darkFor, setDarkFor] = useState(null);    // fiche du défi dont on lance le d12
    const [confirm, setConfirm] = useState(null);    // { title, message, confirmText, onConfirm }
    const [catalogOpen, setCatalogOpen] = useState(false);

    const shownView = sessionId ? view : 'library';   // sans table active, seule la bibliothèque
    const current = ch.active.find(a => a.id === activeId) ?? ch.active[0] ?? null;
    const libSheet = ch.library.find(c => c.id === libId) ?? sortByFamily(ch.library)[0] ?? null;
    const tableCharacters = order.map(id => characters[id]).filter(Boolean);

    const launch = async (challengeId) => {
        const created = await ch.launch(challengeId);
        if (created) { setActiveId(created.id); setTrigger(null); }
        return created;
    };

    // ── À la table ──
    const onProgress = (box) => {
        const next = toggleBox(current.progress, box);
        const reached = reachedTrigger(current.sheet, current.progress, next);
        setTrigger(reached ? { activeId: current.id, trigger: reached } : null);
        ch.patchActive(current.id, { progress: next });
    };
    const applyEffect = (c) => {
        patchCharacter(c.id, picker.effect === 'wound' ? addWound(c) : sufferState(c, picker.effect));
        setPicker(null);
    };
    const askRemove = () => setConfirm({
        title: 'Retirer le défi', confirmText: 'Retirer',
        message: `Retirer « ${current.sheet.name} » de la table ? Sa piste et ses notes seront perdues ; la fiche reste dans la bibliothèque.`,
        onConfirm: () => ch.removeActive(current.id),
    });
    const openModel = () => { setLibId(current.challengeId); setDraft(null); setView('library'); };

    // ── Bibliothèque ──
    const save = async () => {
        const { id, ...sheet } = cleanSheet(draft);
        const saved = await ch.saveChallenge(sheet, id ?? null);
        if (saved) { setLibId(saved.id); setDraft(null); }
    };
    const duplicate = async () => {
        const saved = await ch.saveChallenge(duplicateSheet(libSheet));
        if (saved) { setLibId(saved.id); setDraft(structuredClone(saved)); }
    };
    const askDelete = () => setConfirm({
        title: 'Supprimer le défi', confirmText: 'Supprimer',
        message: `Supprimer « ${libSheet.name} » de la bibliothèque ? Les défis déjà lancés restent à leur table.`,
        onConfirm: () => ch.deleteChallenge(libSheet.id),
    });
    const launchFromLibrary = async () => {
        if (await launch(libSheet.id)) setView('table');
    };

    const views = (
        <div className="vil-ch-views" role="tablist">
            <button type="button" role="tab" aria-selected={shownView === 'table'} className={shownView === 'table' ? 'is-on' : ''}
                    disabled={!sessionId} title={sessionId ? undefined : 'Aucune table active'} onClick={() => setView('table')}>
                À la table{sessionId && <small>{ch.active.length}</small>}
            </button>
            <button type="button" role="tab" aria-selected={shownView === 'library'} className={shownView === 'library' ? 'is-on' : ''} onClick={() => setView('library')}>
                Bibliothèque<small>{ch.library.length}</small>
            </button>
        </div>
    );

    return (
        <div className="vil-page">
            {views}
            {ch.error && <p className="vil-todo vil-red">{ch.error}</p>}
            {ch.loading && <p className="vil-note">Chargement…</p>}

            {!ch.loading && shownView === 'table' && (
                <div className="vil-ch-layout">
                    <aside className="vil-ch-list">
                        <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => setCatalogOpen(true)}>Lancer un défi</button>
                        {ch.active.length === 0 && <p className="vil-note">Aucun défi en cours.</p>}
                        {ch.active.map(a => (
                            <button key={a.id} type="button" className={`vil-ch-item${a.id === current?.id ? ' is-selected' : ''}`}
                                    onClick={() => { setActiveId(a.id); setTrigger(null); }}>
                                <small>{a.sheet.kind}</small>
                                <strong>{a.sheet.name}</strong>
                                <VilTrackMini sheet={a.sheet} progress={a.progress} />
                            </button>
                        ))}
                    </aside>
                    {current && (
                        <VilChallengeSheet
                            key={current.id} sheet={current.sheet} mode="play"
                            progress={current.progress} adjust={current.adjust} notes={current.notes} base={base}
                            onBase={setBase} onProgress={onProgress}
                            onAdjust={(adjust) => ch.patchActive(current.id, { adjust })}
                            onNotes={(notes) => ch.patchActive(current.id, { notes })}
                            onEffect={(effect, anchor) => setPicker({ effect, anchor })}
                            onDark={() => setDarkFor(current.sheet)}
                            trigger={trigger?.activeId === current.id ? trigger.trigger : null} onCloseTrigger={() => setTrigger(null)}
                            actions={<>
                                <button type="button" className="vtt-btn vtt-btn-sm" onClick={openModel} disabled={!current.challengeId}
                                        title={current.challengeId ? undefined : 'Le modèle a été supprimé de la bibliothèque'}>Ouvrir le modèle</button>
                                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-danger vil-ch-bar-end" onClick={askRemove}>Retirer le défi</button>
                            </>}
                        />
                    )}
                </div>
            )}

            {!ch.loading && shownView === 'library' && (
                <div className="vil-ch-layout">
                    <VilChallengeLibrary library={ch.library} selectedId={draft ? null : libSheet?.id}
                                         onSelect={(id) => { setLibId(id); setDraft(null); }} onNew={() => setDraft(blankSheet())} />
                    {draft ? (
                        <VilChallengeForm draft={draft} setDraft={setDraft} actions={<>
                            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={save} disabled={!canSaveSheet(draft)}>Enregistrer</button>
                            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(null)}>Annuler</button>
                        </>} />
                    ) : libSheet && (
                        <VilChallengeSheet sheet={libSheet} mode="read" actions={<>
                            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={launchFromLibrary} disabled={!sessionId}
                                    title={sessionId ? undefined : 'Aucune table active'}>Lancer à la table</button>
                            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setDraft(structuredClone(libSheet))}>Modifier</button>
                            <button type="button" className="vtt-btn vtt-btn-sm" onClick={duplicate}>Dupliquer</button>
                            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-danger vil-ch-bar-end" onClick={askDelete}>Supprimer</button>
                        </>} />
                    )}
                </div>
            )}

            {catalogOpen && (
                <CatalogModal title="Lancer un défi" items={sortByFamily(ch.library)} getKey={c => c.id}
                              renderItem={c => <CatalogRow c={c} />} onAdd={c => launch(c.id)} onClose={() => setCatalogOpen(false)}
                              filters={CHALLENGE_FILTERS} groupBy={CHALLENGE_GROUP} searchFields={CHALLENGE_SEARCH}
                              labels={CATALOG_LABELS} layout={CATALOG_LAYOUT} />
            )}
            {picker && <VilParaPicker anchor={picker.anchor} effect={picker.effect} characters={tableCharacters}
                                      onPick={applyEffect} onClose={() => setPicker(null)} />}
            {darkFor && <VilDarkDieModal sessionId={sessionId} challenge={darkFor} onClose={() => setDarkFor(null)} />}
            {confirm && (
                <ConfirmModal title={confirm.title} message={confirm.message} confirmText={confirm.confirmText} danger
                              onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} />
            )}
        </div>
    );
};

export default TabChallenges;

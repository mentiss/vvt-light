// src/client/src/components/npc/TabNpcs.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet PNJ assemblé de la plateforme (spec_pnj.md §6.5, §6.7, planche validée) :
// la bibliothèque en colonne (côté choisi par le slug, repliable) et les PNJ à la
// table au centre ; création et modification en panneau latéral (la colonne
// s'élargit) ; fiche de la bibliothèque en fenêtre ; glisser une fiche vers la
// table ; jets des PNJ publics ou cachés (réglage gardé par table).
// Un slug qui veut une autre disposition assemble lui-même les briques de components/npc.
//
// <TabNpcs sessionId={number|null} config={slugConfig.npc} context={…} />
//   context : données de la table passées par l'interface MJ du slug (ex. nombre de héros
//             pour Nimble), transmises à initialState
//
// Bloc `npc` du config.jsx du slug, tout facultatif (sans bloc : fiche commune seule) :
//   librarySide  : 'left' (défaut) | 'right'
//   tagGroups    : [{ label, tags: [...] }] étiquettes mises en tête du filtre, groupe par groupe
//                  (dans un groupe, elles s'additionnent : Mineur + Notable)
//   hiddenTags   : étiquettes qui servent au filtre mais ne s'affichent pas sur les lignes
//                  (déjà dites par le résumé, ex. le rang de Dune)
//   defaults()   : partie système d'une nouvelle fiche
//   summary(npc) : une ligne dans les listes
//   initialState(npc, { quantity, context }) : état d'un PNJ ajouté à la table
//   isGroup(npc) : fiche jouée en groupe (une carte, quantity = taille du groupe)
//   isDown(instance)  : carte grisée (vaincu, hors de combat)
//   Form, Sheet, pick : voir NpcForm.jsx et NpcSystem.jsx
//   RollWindow : ({ request, hiddenRolls, sessionId, onClose }) => fenêtre de jet du slug
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import ConfirmModal from '../modals/ConfirmModal.jsx';
import { useNpcs, NPC_ROLLS_OPTIONS } from '../../hooks/useNpcs.js';
import { useSystem } from '../../hooks/useSystem.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { tableScope } from '../../tools/browserStorage.js';
import NpcLibrary, { NPC_DRAG_TYPE } from './NpcLibrary.jsx';
import NpcCard from './NpcCard.jsx';
import NpcForm from './NpcForm.jsx';
import NpcSheet from './NpcSheet.jsx';
import { npcName } from './NpcAvatar.jsx';

// Bibliothèque : repliée ou non, bloc d'étiquettes ouvert, étiquettes choisies (gardées par slug)
const LIBRARY_OPTIONS = {
    defaults: { collapsed: false, tagsOpen: true, tags: [] },
    validate: v => typeof v?.collapsed === 'boolean'
        && (v.tagsOpen === undefined || typeof v.tagsOpen === 'boolean')
        && (v.tags === undefined || (Array.isArray(v.tags) && v.tags.every(t => typeof t === 'string'))),
};
const ROLLS_OPTIONS   = NPC_ROLLS_OPTIONS;   // partagée avec la fiche ouverte depuis l'initiative

const emptyNpc = (config) => ({
    prenom: '', nom: '', role: '', tags: [], description: '', gmNotes: '',
    avatar: null, icon: null, systemData: config.defaults?.() ?? {},
});

const TabNpcs = ({ sessionId = null, config = {}, context = null }) => {
    const { slug } = useSystem();
    const n = useNpcs(sessionId);
    const [libraryPrefs, setLibraryPrefs] = usePersistedState(slug, 'npc-library', LIBRARY_OPTIONS);
    const [rollPrefs, setRollPrefs] = usePersistedState(sessionId ? tableScope(slug, sessionId) : slug, 'npc-rolls', ROLLS_OPTIONS);
    const hiddenRolls = rollPrefs.hidden;

    const [reading, setReading] = useState(null);          // fiche lue en fenêtre
    const [editing, setEditing] = useState(null);          // { kind: 'new'|'edit'|'table', draft, id?, instanceId?, tableName? }
    const [toDelete, setToDelete] = useState(null);
    const [clearing, setClearing] = useState(false);
    const [rollRequest, setRollRequest] = useState(null);
    const [dropping, setDropping] = useState(false);
    const [saving, setSaving] = useState(false);

    const side = config.librarySide === 'right' ? 'right' : 'left';
    const RollWindow = config.RollWindow;
    const collapsed = libraryPrefs.collapsed && !editing;

    // Fiche jouée en groupe (config.isGroup, ex. sbires de Nimble) : une seule carte, la quantité va à l'état du slug
    const addToTable = (npc, quantity = 1) => {
        const group = !!config.isGroup?.(npc);
        const state = config.initialState?.(npc, { quantity: group ? quantity : 1, context }) ?? {};
        return n.addToTable(npc.id, group ? 1 : quantity, state);
    };
    const openEdit = (npc) => { setReading(null); setEditing({ kind: 'edit', id: npc.id, draft: structuredClone(npc) }); };
    const duplicate = async (npc) => {
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = npc;
        const copy = await n.saveNpc({ ...rest, nom: `${npc.nom} (copie)` });
        if (copy) setReading(copy);
    };

    const save = async () => {
        if (!editing) return;
        setSaving(true);
        const ok = editing.kind === 'table'
            ? await n.patchTableNpc(editing.instanceId, { name: editing.tableName, sheet: editing.draft })
            : await n.saveNpc(editing.draft, editing.kind === 'edit' ? editing.id : null);
        setSaving(false);
        if (ok) setEditing(null);
    };

    const onDragOver = (e) => {
        if (!sessionId || !e.dataTransfer.types.includes(NPC_DRAG_TYPE)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDropping(true);
    };
    const onDrop = (e) => {
        setDropping(false);
        const raw = e.dataTransfer.getData(NPC_DRAG_TYPE);
        if (!raw) return;
        e.preventDefault();
        const { id, quantity } = JSON.parse(raw);
        const npc = n.library.find(x => x.id === id);
        if (npc) addToTable(npc, quantity);
    };

    // ── Colonne : formulaire, barre repliée ou bibliothèque ─────────────────
    const collapseIcon = (side === 'left') === collapsed ? '›' : '‹';
    let aside;
    if (editing) {
        aside = (
            // Clé : un autre PNJ édité repart d'un formulaire neuf (les champs saisis en fin de saisie ne passent pas de l'un à l'autre)
            <NpcForm key={`${editing.kind}-${editing.id ?? editing.instanceId ?? 'new'}`}
                     config={config} draft={editing.draft} saving={saving} error={n.error} isNew={editing.kind === 'new'}
                     title={editing.kind === 'table' ? 'Modifier ce PNJ' : editing.kind === 'edit' ? 'Modifier la fiche' : 'Nouvelle fiche'}
                     subtitle={editing.kind === 'table' ? 'Copie à la table : la bibliothèque ne change pas' : 'Bibliothèque'}
                     tableName={editing.tableName}
                     onTableNameChange={editing.kind === 'table' ? (tableName => setEditing(ed => ({ ...ed, tableName }))) : null}
                     onChange={patch => setEditing(ed => ({ ...ed, draft: { ...ed.draft, ...patch } }))}
                     onSave={save} onCancel={() => setEditing(null)} />
        );
    } else if (collapsed) {
        aside = (
            <aside className="vtt-panel vtt-npc-aside vtt-npc-rail">
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" title="Déplier la bibliothèque" aria-label="Déplier la bibliothèque"
                        onClick={() => setLibraryPrefs(p => ({ ...p, collapsed: false }))}>{collapseIcon}</button>
                <span className="vtt-npc-rail-label">Bibliothèque · {n.library.length}</span>
            </aside>
        );
    } else {
        aside = (
            <NpcLibrary npcs={n.library} summary={config.summary ?? null} canAdd={!!sessionId} loading={n.loading}
                        onOpen={setReading} onEdit={openEdit} onDelete={setToDelete} onAdd={addToTable}
                        onNew={() => { setReading(null); setEditing({ kind: 'new', draft: emptyNpc(config) }); }}
                        onCollapse={() => setLibraryPrefs(p => ({ ...p, collapsed: true }))} collapseIcon={collapseIcon}
                        tagsOpen={libraryPrefs.tagsOpen} onToggleTags={() => setLibraryPrefs(p => ({ ...p, tagsOpen: !p.tagsOpen }))}
                        tagGroups={config.tagGroups} hiddenTags={config.hiddenTags}
                        selectedTags={libraryPrefs.tags} onSelectedTagsChange={tags => setLibraryPrefs(p => ({ ...p, tags }))} />
        );
    }

    // ── PNJ à la table ───────────────────────────────────────────────────────
    const tableZone = (
        <section className={`vtt-panel vtt-npc-zone vtt-npc-table${dropping ? ' is-drop' : ''}`}
                 onDragOver={onDragOver} onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDropping(false); }} onDrop={onDrop}>
            <div className="vtt-npc-zone-head">
                <h2 className="vtt-section-title">À la table · {n.table.length}</h2>
                <div className="vtt-npc-tools">
                    <span className="vtt-npc-summary">Jets des PNJ</span>
                    <div className="vtt-segmented">
                        <button type="button" className={`vtt-segment ${!hiddenRolls ? 'is-active' : ''}`} onClick={() => setRollPrefs({ hidden: false })}>Publics</button>
                        <button type="button" className={`vtt-segment ${hiddenRolls ? 'is-active' : ''}`} onClick={() => setRollPrefs({ hidden: true })}>Cachés</button>
                    </div>
                    {n.table.length > 0 && <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setClearing(true)}>Vider</button>}
                </div>
            </div>
            {n.error && !editing && <p className="vtt-callout vtt-callout-danger">{n.error}</p>}
            {!sessionId ? (
                <p className="vtt-npc-empty">Aucune table active : choisis une table pour y poser des PNJ. La bibliothèque reste modifiable.</p>
            ) : n.table.length === 0 ? (
                <p className="vtt-npc-empty">Aucun PNJ à la table. Glisse une fiche depuis la bibliothèque, ou utilise « À la table ».</p>
            ) : (
                <div className="vtt-npc-grid">
                    {n.table.map(instance => (
                        <NpcCard key={instance.id} instance={instance} config={config} hiddenRolls={hiddenRolls} sessionId={sessionId}
                                 onPatch={patch => n.patchTableNpc(instance.id, patch)}
                                 onEdit={() => { setReading(null); setEditing({ kind: 'table', instanceId: instance.id, tableName: instance.name, draft: structuredClone(instance.sheet ?? {}) }); }}
                                 onRemove={() => n.removeTableNpc(instance.id)} onRoll={setRollRequest} />
                    ))}
                </div>
            )}
        </section>
    );

    const layout = `vtt-npc-tab is-split${side === 'left' ? ' is-left' : ''}${editing ? ' is-wide' : ''}${collapsed ? ' is-collapsed' : ''}`;

    return (
        <div className={layout}>
            {side === 'left' ? <>{aside}{tableZone}</> : <>{tableZone}{aside}</>}

            {reading && (
                <Modal title="Fiche" subtitle={npcName(reading)} size="lg" onClose={() => setReading(null)}
                       footer={(
                           <>
                               {sessionId && <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => addToTable(reading)}>Ajouter à la table</button>}
                               <button type="button" className="vtt-btn" onClick={() => openEdit(reading)}>Modifier</button>
                               <button type="button" className="vtt-btn" onClick={() => duplicate(reading)}>Dupliquer</button>
                               <button type="button" className="vtt-btn" onClick={() => setToDelete(reading)}>Supprimer</button>
                           </>
                       )}>
                    <NpcSheet npc={reading} config={config} hiddenRolls={hiddenRolls} sessionId={sessionId} onRoll={setRollRequest} />
                </Modal>
            )}
            {toDelete && (
                <ConfirmModal title="Supprimer la fiche" danger confirmText="Supprimer"
                              message={`La fiche « ${npcName(toDelete)} » sera supprimée de la bibliothèque. Les PNJ déjà à la table restent : ce sont des copies.`}
                              onConfirm={async () => { if (await n.deleteNpc(toDelete.id)) { if (reading?.id === toDelete.id) setReading(null); if (editing?.id === toDelete.id) setEditing(null); } setToDelete(null); }}
                              onCancel={() => setToDelete(null)} />
            )}
            {clearing && (
                <ConfirmModal title="Vider la table" danger confirmText="Vider" message="Tous les PNJ quittent la table. Les fiches de la bibliothèque restent."
                              onConfirm={() => { n.clearTable(); setClearing(false); }} onCancel={() => setClearing(false)} />
            )}
            {rollRequest && RollWindow && (
                <RollWindow request={rollRequest} hiddenRolls={hiddenRolls} sessionId={sessionId} onClose={() => setRollRequest(null)} />
            )}
        </div>
    );
};

export default TabNpcs;

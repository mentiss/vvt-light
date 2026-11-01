// src/client/src/components/audio/panel/ScenesDialog.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtres des boutons préréglés (documentations/spec_audio.md §12.6), sur la Modal
// générique, dans l'emplacement à modales de la page :
// - SceneNameDialog : nom d'une scène enregistrée depuis ce qui joue ;
// - TargetButtonDialog : bouton ciblé créé depuis un titre ou une playlist ;
// - ScenesDialog : « Modifier les scènes… » (renommer, ordre, remplacer par ce qui
//   joue, supprimer). La gestion ne vit qu'ici, pas dans le panneau.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../ui/Modal.jsx';
import { HostedModal } from '../../ui/ModalHost.jsx';
import useConfirm from '../../../hooks/useConfirm.jsx';
import { useDragOrder } from '../../../hooks/useDragOrder.js';
import { SLOT_LABEL } from '../../../tools/audioSlots.js';

/** Résumé d'un bouton : « Scène » ou la piste visée. */
export const buttonSummary = (button) => (button.mode === 'scene'
    ? 'Scène'
    : `${SLOT_LABEL[button.actions?.slot] ?? 'Piste'}${button.actions?.shuffle ? ', au hasard' : ''}`);

/** Champ de nom et pied « Annuler / Valider », partagés par les deux fenêtres de création. */
const NameForm = ({ title, initial, submitLabel, onSubmit, onClose, error, children }) => {
    const [name, setName] = useState(initial);
    const submit = (e) => { e.preventDefault(); if (name.trim()) onSubmit(name.trim()); };
    return (
        <HostedModal>
            <Modal title={title} size="sm" onClose={onClose} className="vtt-audio-scene-dialog"
                   footer={(
                       <>
                           <button type="button" className="vtt-btn vtt-btn-sm" onClick={onClose}>Annuler</button>
                           <button type="submit" form="vtt-audio-scene-form" className="vtt-btn vtt-btn-primary vtt-btn-sm" disabled={!name.trim()}>{submitLabel}</button>
                       </>
                   )}>
                <form id="vtt-audio-scene-form" onSubmit={submit} className="space-y-3">
                    <label className="block space-y-1">
                        <span className="vtt-field-label">Nom du bouton</span>
                        <input className="vtt-input" value={name} maxLength={40} autoFocus onChange={e => setName(e.target.value)} />
                    </label>
                    {children}
                    {error && <p className="vtt-callout vtt-callout-danger text-sm">{error}</p>}
                </form>
            </Modal>
        </HostedModal>
    );
};

/** « Enregistrer ce qui joue » : le serveur lit lui-même ce qui joue, seul le nom part. */
export const SceneNameDialog = ({ count, error, onSave, onClose }) => (
    <NameForm title="Enregistrer ce qui joue" initial={`Scène ${count + 1}`} submitLabel="Enregistrer"
              onSubmit={onSave} onClose={onClose} error={error}>
        <p className="text-sm text-muted">Le bouton relancera la musique, les ambiances et l'effet en cours, chacun avec son mode ; les pistes vides seront arrêtées.</p>
    </NameForm>
);

/**
 * Bouton ciblé, depuis un titre ({ kind: 'track', trackId }) ou une playlist ({ kind: 'playlist', playlistId }) :
 * un titre va sur n'importe quelle piste ; une playlist sur la musique ou une ambiance, « au hasard » en musique seulement.
 */
export const TargetButtonDialog = ({ target, error, onCreate, onClose }) => {
    const slots = target.kind === 'track' ? ['music', 'ambience1', 'ambience2', 'effect'] : ['music', 'ambience1', 'ambience2'];
    const [slot, setSlot] = useState(slots.includes(target.slot) ? target.slot : 'music');
    const [shuffle, setShuffle] = useState(false);
    const create = (label) => onCreate({
        label, slot,
        ...(target.kind === 'track' ? { trackId: target.trackId } : { playlistId: target.playlistId, shuffle: slot === 'music' && shuffle }),
    });
    return (
        <NameForm title="Créer un bouton" initial={target.name} submitLabel="Créer" onSubmit={create} onClose={onClose} error={error}>
            <div className="space-y-1">
                <span className="vtt-field-label">Piste</span>
                <div className="flex flex-wrap gap-2">
                    {slots.map(s => (
                        <button key={s} type="button" className={`vtt-pill${slot === s ? ' is-selected' : ''}`} aria-pressed={slot === s} onClick={() => setSlot(s)}>
                            {SLOT_LABEL[s]}
                        </button>
                    ))}
                </div>
            </div>
            {target.kind === 'playlist' && slot === 'music' && (
                <div className="flex flex-wrap gap-2">
                    <button type="button" className={`vtt-pill${!shuffle ? ' is-selected' : ''}`} aria-pressed={!shuffle} onClick={() => setShuffle(false)}>Dans l'ordre</button>
                    <button type="button" className={`vtt-pill${shuffle ? ' is-selected' : ''}`} aria-pressed={shuffle} onClick={() => setShuffle(true)}>Au hasard</button>
                </div>
            )}
            <p className="text-sm text-muted">Le bouton ne change que cette piste ; les autres continuent.</p>
        </NameForm>
    );
};

/** Ligne d'un bouton dans « Modifier les scènes ». */
const SceneRow = ({ button, canCapture, scenes, confirm, dragProps }) => {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(button.label);
    const save = () => { setEditing(false); if (name.trim() && name.trim() !== button.label) scenes.rename(button.id, name.trim()); };
    const remove = async () => {
        if (await confirm({ title: 'Supprimer le bouton', message: `Supprimer « ${button.label} » ?`, confirmText: 'Supprimer', danger: true })) scenes.remove(button.id);
    };
    return (
        <li className="vtt-list-item vtt-audio-scene-row" {...dragProps}>
            <span className="vtt-audio-scene-grip" aria-hidden="true">⋮⋮</span>
            {editing ? (
                <input className="vtt-input" value={name} maxLength={40} autoFocus aria-label="Nom du bouton"
                       onChange={e => setName(e.target.value)} onBlur={save}
                       onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { e.stopPropagation(); setName(button.label); setEditing(false); } }} />
            ) : (
                <span className="vtt-audio-scene-name">
                    <span>{button.broken && <span title="Playlist vide" aria-label="Playlist vide">⚠ </span>}{button.label}</span>
                    <span className="vtt-audio-row-meta">{buttonSummary(button)}{button.broken ? ' · playlist vide' : ''}</span>
                </span>
            )}
            <span className="vtt-audio-scene-actions">
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => setEditing(true)}>Renommer</button>
                {button.mode === 'scene' && (
                    <button type="button" className="vtt-btn vtt-btn-sm" disabled={!canCapture} onClick={() => scenes.capture(button.id)}
                            title={canCapture ? 'Le bouton relancera ce qui joue maintenant' : 'Rien ne joue'}>Remplacer par ce qui joue</button>
                )}
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-danger" onClick={remove}>Supprimer</button>
            </span>
        </li>
    );
};

/** « Modifier les scènes… » */
export const ScenesDialog = ({ scenes, canCapture, onClose }) => {
    const { confirm, confirmEl } = useConfirm();
    const ids = scenes.buttons.map(b => b.id);
    const drag = useDragOrder(ids, order => scenes.reorder(order));
    return (
        <HostedModal>
            <Modal title="Scènes de la table" subtitle="Glisser pour réordonner ; les joueurs ne voient jamais ces noms" size="md" onClose={onClose}
                   className="vtt-audio-scene-dialog"
                   footer={<button type="button" className="vtt-btn vtt-btn-sm" onClick={onClose}>Fermer</button>}>
                {scenes.buttons.length === 0
                    ? <p className="text-sm text-muted">Aucun bouton pour cette table.</p>
                    : (
                        <ul className="vtt-audio-scenes">
                            {scenes.buttons.map(b => <SceneRow key={b.id} button={b} canCapture={canCapture} scenes={scenes} confirm={confirm} dragProps={drag(b.id)} />)}
                        </ul>
                    )}
                {scenes.error && <p className="vtt-callout vtt-callout-danger text-sm mt-3">{scenes.error}</p>}
                {confirmEl}
            </Modal>
        </HostedModal>
    );
};

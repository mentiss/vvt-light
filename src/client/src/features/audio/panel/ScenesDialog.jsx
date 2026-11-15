// src/client/src/features/audio/panel/ScenesDialog.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtres des boutons préréglés (documentations/plateforme/spec_audio.md §12.6, §15.7),
// sur la Modal générique, dans l'emplacement à modales de la page :
// - ButtonEditor : création et modification d'un bouton, piste par piste (Lancer /
//   Arrêter / Ne pas toucher, contenu choisi dans la bibliothèque, mode, timecode),
//   nom et option « en fondu » ;
// - ScenesDialog : « Modifier les scènes… » (ordre, Modifier, supprimer). La gestion
//   ne vit qu'ici, pas dans le panneau.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { HostedModal } from '@/ui/modal/ModalHost.jsx';
import useConfirm from '@/ui/hooks/useConfirm.jsx';
import { useDragOrder } from '@/ui/hooks/useDragOrder.js';
import { useAudioLibrary } from '../hooks/useAudioLibrary.js';
import { SLOTS, SLOT_MODES, MODE_LABELS } from '../tools/audioSlots.js';
import { findPlaylist, normalizeQuery, titleMatches } from '../tools/audioLibrary.js';
import { SLOT_OPS, slotsFromDraft, buttonSummary } from '../tools/audioButtons.js';

/** Titre de la bibliothèque et sa playlist, ou null. */
const findTrack = (library, id) => {
    for (const c of library) {
        for (const p of c.playlists) {
            const track = p.tracks.find(t => t.id === id);
            if (track) return { track, playlist: p };
        }
    }
    return null;
};

/** Choix pill par pill (Lancer / Arrêter / Ne pas toucher, modes). */
const Pills = ({ options, value, onChange, label }) => (
    <div className="vtt-audio-editor-pills" role="group" aria-label={label}>
        {options.map(o => (
            <button key={o.id ?? 'none'} type="button" className={`vtt-pill${value === o.id ? ' is-selected' : ''}`}
                    aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
                {o.label}
            </button>
        ))}
    </div>
);

/**
 * Choix d'un contenu dans la bibliothèque de la table : recherche d'un titre, ou
 * playlist dépliée (toute la playlist, si la piste l'accepte, ou un de ses titres).
 */
const ContentPicker = ({ library, loading, allowPlaylist, onPick }) => {
    const [search, setSearch] = useState('');
    const [openId, setOpenId] = useState(null);
    const query = normalizeQuery(search);
    const found = query ? library.flatMap(c => c.playlists.flatMap(p => p.tracks.filter(t => titleMatches(t.title, query)).map(t => ({ t, p })))) : [];

    return (
        <div className="vtt-audio-editor-picker">
            <input type="search" className="vtt-input" value={search} placeholder="Rechercher un titre" autoComplete="off"
                   aria-label="Rechercher un titre dans la bibliothèque" onChange={e => setSearch(e.target.value)}
                   onKeyDown={e => { if (e.key === 'Escape' && search) { e.stopPropagation(); setSearch(''); } }} />
            <ul className="vtt-audio-editor-picker-list">
                {loading && library.length === 0 && <li className="text-sm text-muted">Chargement de la bibliothèque…</li>}
                {!loading && library.length === 0 && <li className="text-sm text-muted">Bibliothèque vide.</li>}
                {query
                    ? found.map(({ t, p }) => (
                        <li key={t.id}>
                            <button type="button" className="vtt-audio-pick" onClick={() => onPick({ trackId: t.id })}>
                                {t.title} <span className="vtt-audio-row-meta">· {p.name}</span>
                            </button>
                        </li>
                    ))
                    : library.map(c => (
                        <li key={c.id}>
                            <div className="vtt-field-label">{c.name}</div>
                            <ul>
                                {c.playlists.map(p => (
                                    <li key={p.id}>
                                        <button type="button" className="vtt-audio-pick" aria-expanded={openId === p.id}
                                                onClick={() => setOpenId(openId === p.id ? null : p.id)}>
                                            {openId === p.id ? '▾' : '▸'} {p.name} <span className="vtt-audio-row-meta">· {p.tracks.length} titre(s)</span>
                                        </button>
                                        {openId === p.id && (
                                            <ul className="vtt-audio-editor-picker-tracks">
                                                {allowPlaylist && p.tracks.length > 0 && (
                                                    <li><button type="button" className="vtt-audio-pick" onClick={() => onPick({ playlistId: p.id })}>Toute la playlist</button></li>
                                                )}
                                                {p.tracks.map(t => (
                                                    <li key={t.id}><button type="button" className="vtt-audio-pick" onClick={() => onPick({ trackId: t.id })}>{t.title}</button></li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

/** Ce que lance une ligne, en clair. */
const contentLabel = (line, library) => {
    if (line.trackId) {
        const found = findTrack(library, line.trackId);
        return found ? `${found.track.title} · ${found.playlist.name}` : 'Titre introuvable';
    }
    if (line.playlistId) {
        const found = findPlaylist(library, line.playlistId);
        return found ? `Playlist « ${found.playlist.name} »` : 'Playlist introuvable';
    }
    return 'Aucun contenu choisi';
};

/** Une piste du bouton. */
const SlotLine = ({ slot, label, line, onChange, library, loading, playing }) => {
    const [picking, setPicking] = useState(false);
    const isEffect = slot === 'effect';
    const modes = [{ id: null, label: 'Mode en cours' }, ...SLOT_MODES[slot].map(m => ({ id: m, label: MODE_LABELS[m] }))];
    const timed = line.trackId && line.mode !== 'shuffle';

    return (
        <li className="vtt-audio-editor-slot">
            <div className="vtt-audio-editor-slot-head">
                <span className="vtt-audio-editor-slot-name">{label}</span>
                <Pills label={`${label} : action`} options={SLOT_OPS} value={line.op} onChange={op => onChange({ op })} />
            </div>
            {line.op === 'play' && (
                <div className="vtt-audio-editor-slot-body">
                    <div className="vtt-audio-editor-content">
                        <span className={line.trackId || line.playlistId ? '' : 'text-muted'}>{loading && library.length === 0 ? '…' : contentLabel(line, library)}</span>
                        <button type="button" className="vtt-btn vtt-btn-sm" aria-expanded={picking} onClick={() => setPicking(!picking)}>
                            {picking ? 'Fermer' : 'Choisir…'}
                        </button>
                        <button type="button" className="vtt-btn vtt-btn-sm" disabled={!playing?.trackId}
                                title={playing?.trackId ? `Reprendre « ${playing.title} »` : 'Rien ne joue sur cette piste'}
                                onClick={() => onChange({ trackId: playing.trackId, playlistId: null, mode: isEffect ? null : playing.mode })}>
                            Prendre ce qui joue
                        </button>
                    </div>
                    {picking && (
                        <ContentPicker library={library} loading={loading} allowPlaylist={!isEffect}
                                       onPick={content => { setPicking(false); onChange({ trackId: null, playlistId: null, ...content }); }} />
                    )}
                    {!isEffect && <Pills label={`${label} : mode`} options={modes} value={line.mode} onChange={mode => onChange({ mode })} />}
                    {line.trackId && line.mode === 'shuffle' && <p className="text-sm text-muted">Aléatoire : un titre au hasard de sa playlist.</p>}
                    {timed && (
                        <label className="vtt-audio-scene-start">
                            <span>À partir de</span>
                            <input className="vtt-input" value={line.startText} placeholder="0:00" inputMode="numeric"
                                   onChange={e => onChange({ startText: e.target.value })} />
                        </label>
                    )}
                </div>
            )}
        </li>
    );
};

/**
 * Création ou modification d'un bouton (§15.7).
 * @param {object}   props
 * @param {number}   props.sessionId   table active (bibliothèque chargée par la fenêtre)
 * @param {string}   props.title
 * @param {string}   props.submitLabel
 * @param {{ label: string, fade: boolean, draft: object }} props.initial  fiche de départ (tools/audioButtons.js)
 * @param {object}   [props.audioState] état de lecture, pour « Prendre ce qui joue »
 * @param {string|null} [props.error]  erreur du serveur
 * @param {(button: { label: string, fade: boolean, slots: object }) => void} props.onSave
 * @param {Function} props.onClose
 */
export const ButtonEditor = ({ sessionId, title, submitLabel, initial, audioState, error, onSave, onClose }) => {
    const lib = useAudioLibrary(sessionId, true);
    const [name, setName] = useState(initial.label);
    const [fade, setFade] = useState(!!initial.fade);
    const [draft, setDraft] = useState(initial.draft);
    const [localError, setLocalError] = useState(null);

    const setLine = (slot, patch) => {
        setDraft(prev => ({ ...prev, [slot]: { ...prev[slot], ...patch } }));
        setLocalError(null);
    };
    const submit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const result = slotsFromDraft(draft);
        if (result.error) { setLocalError(result.error); return; }
        onSave({ label: name.trim(), fade, slots: result.slots });
    };

    return (
        <HostedModal>
            <Modal title={title} subtitle="Les joueurs ne voient jamais ce nom" size="lg" onClose={onClose} closeOnBackdrop={false}
                   className="vtt-audio-scene-dialog vtt-audio-button-editor"
                   footer={(
                       <>
                           <button type="button" className="vtt-btn vtt-btn-sm" onClick={onClose}>Annuler</button>
                           <button type="submit" form="vtt-audio-button-form" className="vtt-btn vtt-btn-primary vtt-btn-sm" disabled={!name.trim()}>{submitLabel}</button>
                       </>
                   )}>
                <form id="vtt-audio-button-form" onSubmit={submit} className="space-y-3">
                    <div className="vtt-audio-editor-top">
                        <label className="block space-y-1 flex-1">
                            <span className="vtt-field-label">Nom du bouton</span>
                            <input className="vtt-input" value={name} maxLength={40} autoFocus onChange={e => setName(e.target.value)} />
                        </label>
                        <Pills label="Transition" value={fade} onChange={setFade}
                               options={[{ id: false, label: 'Coupure sèche' }, { id: true, label: 'En fondu (3 s)' }]} />
                    </div>
                    {fade && <p className="text-sm text-muted">Ce qui jouait descend pendant que le nouveau morceau monte, sur la musique et les ambiances ; l'effet part tout de suite.</p>}
                    <ul className="vtt-audio-editor-slots">
                        {SLOTS.map(s => (
                            <SlotLine key={s.id} slot={s.id} label={s.label} line={draft[s.id]} onChange={patch => setLine(s.id, patch)}
                                      library={lib.library} loading={lib.busy} playing={audioState?.slots?.[s.id]} />
                        ))}
                    </ul>
                    {(localError ?? error) && <p className="vtt-callout vtt-callout-danger text-sm">{localError ?? error}</p>}
                </form>
            </Modal>
        </HostedModal>
    );
};

/** Ligne d'un bouton dans « Modifier les scènes ». */
const SceneRow = ({ button, onEdit, onRemove, dragProps }) => (
    <li className="vtt-list-item vtt-audio-scene-row" {...dragProps}>
        <span className="vtt-audio-scene-grip" aria-hidden="true">⋮⋮</span>
        <span className="vtt-audio-scene-name">
            <span>{button.broken && <span title="Playlist vide" aria-label="Playlist vide">⚠ </span>}{button.label}</span>
            <span className="vtt-audio-row-meta">{buttonSummary(button.actions)}{button.broken ? ' · playlist vide' : ''}</span>
        </span>
        <span className="vtt-audio-scene-actions">
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onEdit(button)}>Modifier</button>
            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-danger" onClick={() => onRemove(button)}>Supprimer</button>
        </span>
    </li>
);

/** « Modifier les scènes… » : ordre, modification (onEdit ouvre ButtonEditor), suppression. */
export const ScenesDialog = ({ scenes, onEdit, onClose }) => {
    const { confirm, confirmEl } = useConfirm();
    const ids = scenes.buttons.map(b => b.id);
    const drag = useDragOrder(ids, order => scenes.reorder(order));
    const remove = async (button) => {
        if (await confirm({ title: 'Supprimer le bouton', message: `Supprimer « ${button.label} » ?`, confirmText: 'Supprimer', danger: true })) scenes.remove(button.id);
    };
    return (
        <HostedModal>
            <Modal title="Scènes de la table" subtitle="Glisser pour réordonner ; les joueurs ne voient jamais ces noms" size="md" onClose={onClose}
                   className="vtt-audio-scene-dialog"
                   footer={<button type="button" className="vtt-btn vtt-btn-sm" onClick={onClose}>Fermer</button>}>
                {scenes.buttons.length === 0
                    ? <p className="text-sm text-muted">Aucun bouton pour cette table.</p>
                    : (
                        <ul className="vtt-audio-scenes">
                            {scenes.buttons.map(b => <SceneRow key={b.id} button={b} onEdit={onEdit} onRemove={remove} dragProps={drag(b.id)} />)}
                        </ul>
                    )}
                {scenes.error && <p className="vtt-callout vtt-callout-danger text-sm mt-3">{scenes.error}</p>}
                {confirmEl}
            </Modal>
        </HostedModal>
    );
};

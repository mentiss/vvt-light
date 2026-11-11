// src/client/src/features/audio/panel/LibraryRows.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Lignes de la bibliothèque du panneau MJ : titres, playlists, collections
// (documentations/spec_audio.md §11.13). ▶ lance sur la piste de la playlist,
// ≋ sur une autre piste, ⋯ regroupe la gestion (renommage sur place, gain, copie,
// déplacement, suppression, partage).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Icon, IconButton, Equalizer } from './PanelIcons.jsx';
import { MenuButton, MenuItem, MenuLabel, MenuSeparator } from './RowMenu.jsx';
import { SlotChip } from './SlotChip.jsx';
import { SLOTS, SLOT_LABEL, VISIBILITIES, VISIBILITY_LABEL } from '../tools/audioSlots.js';
import { formatTime } from '../tools/audioLibrary.js';
import { SOURCE_LABELS } from '../tools/mediaLinks.js';

/** Champ de renommage sur place : Entrée valide, Échap annule. */
const RenameInput = ({ value, onSave, onCancel }) => {
    const [draft, setDraft] = useState(value);
    const save = () => (draft.trim() && draft.trim() !== value ? onSave(draft.trim()) : onCancel());
    return (
        <input className="vtt-input vtt-audio-rename-input" value={draft} autoFocus aria-label="Nouveau nom"
               onChange={e => setDraft(e.target.value)} onBlur={save}
               onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { e.stopPropagation(); onCancel(); } }} />
    );
};

/** Gain d'une vidéo, réglé dans son menu ; enregistré au relâchement. */
const GainItem = ({ track, onWrite }) => {
    const [gain, setGain] = useState(track.gain);
    const commit = () => { if (gain !== track.gain) onWrite('PUT', `/tracks/${track.id}`, { gain }); };
    return (
        <li role="none" className="vtt-audio-menu-gain">
            <span>Volume de la vidéo</span>
            <input type="range" min="0" max="100" value={gain} aria-label="Volume de la vidéo, pour tous les joueurs"
                   onChange={e => setGain(Number(e.target.value))} onPointerUp={commit} onKeyUp={commit} />
            <span>{gain} %</span>
        </li>
    );
};

/** Menu ≋ : jouer sur une autre piste que la musique. */
const LayersMenu = ({ label, slots, state, onPlay }) => (
    <MenuButton icon="layers" label={label}>
        {(close) => (
            <>
                <MenuLabel>Jouer en</MenuLabel>
                {slots.map(slot => (
                    <MenuItem key={slot} hint={state?.slots?.[slot]?.mediaId ? 'remplace' : null} onSelect={() => { close(); onPlay(slot); }}>
                        {SLOT_LABEL[slot]}
                    </MenuItem>
                ))}
            </>
        )}
    </MenuButton>
);

export const TrackRow = ({ track, slot = 'music', path, playingSlot, audioState, editing, dragProps, ctx }) => {
    const { onCommand, onWrite, onPick, confirm, setEditing } = ctx;
    const otherSlots = SLOTS.map(s => s.id).filter(s => s !== slot);
    const current = !!playingSlot;
    const meta = [path, track.unavailable ? 'indisponible' : '', track.gain !== 100 ? `volume ${track.gain} %` : '',
        current ? `en cours · ${SLOT_LABEL[playingSlot]}` : ''].filter(Boolean).join(' · ');
    const remove = async () => {
        if (await confirm({ title: 'Supprimer la vidéo', message: `Supprimer « ${track.title} » de la playlist ?`, confirmText: 'Supprimer', danger: true })) {
            onWrite('DELETE', `/tracks/${track.id}`);
        }
    };

    return (
        <li className={`vtt-audio-row${current ? ' is-current' : ''}${track.unavailable ? ' is-unavailable' : ''}`} {...dragProps}>
            {/* ▶ joue sur la piste de la playlist (§11.15) */}
            <IconButton icon="play" label={`Lancer « ${track.title} » en ${SLOT_LABEL[slot]}`} onClick={() => onCommand({ slot, action: 'play', trackId: track.id })} />
            {editing ? (
                <RenameInput value={track.title} onCancel={() => setEditing(null)}
                             onSave={title => { setEditing(null); onWrite('PUT', `/tracks/${track.id}`, { title }); }} />
            ) : (
                <span className="vtt-audio-row-main">
                    {/* Le titre se coupe, la durée garde toujours sa place */}
                    <span className="vtt-audio-row-name is-track">
                        {current && <Equalizer playing={audioState?.slots?.[playingSlot]?.status === 'playing'} />}
                        <span className="vtt-audio-row-title" title={track.title}>{track.title}</span>
                        {track.duration > 0 && <span className="vtt-audio-row-duration">({formatTime(track.duration)})</span>}
                        {/* Source hors YouTube, signalée discrètement (V-9, W-5) */}
                        {track.source && track.source !== 'youtube' && <span className="vtt-audio-source">{SOURCE_LABELS[track.source] ?? track.source}</span>}
                    </span>
                    {meta && <span className="vtt-audio-row-meta">{meta}</span>}
                </span>
            )}
            <span className="vtt-audio-row-actions">
                <LayersMenu label={`Jouer « ${track.title} » sur une autre piste`} slots={otherSlots} state={audioState}
                            onPlay={slot => onCommand({ slot, action: 'play', trackId: track.id })} />
                <MenuButton icon="more" label={`Actions pour « ${track.title} »`}>
                    {(close) => (
                        <>
                            <MenuItem onSelect={() => { close(); setEditing({ kind: 'track', id: track.id }); }}>Renommer…</MenuItem>
                            <GainItem track={track} onWrite={onWrite} />
                            <MenuItem disabled={!ctx.canCreateButton} hint={ctx.canCreateButton ? undefined : '5 au plus'}
                                      onSelect={() => { close(); ctx.onCreateButton({ kind: 'track', trackId: track.id, name: track.title, slot }); }}>Créer un bouton…</MenuItem>
                            <MenuSeparator />
                            <MenuItem onSelect={() => { close(); onPick({ kind: 'playlist', title: 'Copier la vidéo vers…', onPick: id => onWrite('POST', `/tracks/${track.id}/copy`, { playlistId: id }) }); }}>Copier vers une playlist…</MenuItem>
                            <MenuItem onSelect={() => { close(); onPick({ kind: 'playlist', title: 'Déplacer la vidéo vers…', onPick: id => onWrite('PUT', `/tracks/${track.id}`, { playlistId: id }) }); }}>Déplacer vers une playlist…</MenuItem>
                            <MenuSeparator />
                            <MenuItem danger onSelect={() => { close(); remove(); }}>Supprimer</MenuItem>
                        </>
                    )}
                </MenuButton>
            </span>
        </li>
    );
};

export const PlaylistRow = ({ playlist, audioState, editing, dragProps, ctx }) => {
    const { onCommand, onWrite, onPick, confirm, setEditing, open } = ctx;
    const empty = playlist.tracks.length === 0;
    const slot = playlist.defaultSlot ?? 'music';
    // Toute la playlist ne se lance qu'en musique ; les autres pistes se lancent titre par titre (§11.15)
    const playable = slot === 'music' && !empty;
    const remove = async () => {
        if (await confirm({ title: 'Supprimer la playlist', message: `Supprimer « ${playlist.name} » et ses ${playlist.tracks.length} titre(s) ?`, confirmText: 'Supprimer', danger: true })) {
            onWrite('DELETE', `/playlists/${playlist.id}`);
        }
    };
    return (
        <li className="vtt-audio-row" {...dragProps}>
            {slot === 'music'
                ? <IconButton icon="play" label={`Lancer la playlist « ${playlist.name} » en musique`} disabled={!playable}
                              onClick={() => onCommand({ slot: 'music', action: 'playPlaylist', playlistId: playlist.id })} />
                : <span className="vtt-audio-icon-btn" aria-hidden="true" />}
            {editing ? (
                <RenameInput value={playlist.name} onCancel={() => setEditing(null)}
                             onSave={name => { setEditing(null); onWrite('PUT', `/playlists/${playlist.id}`, { name }); }} />
            ) : (
                <button type="button" className="vtt-audio-row-main" onClick={() => open(playlist.id)}>
                    <span className="vtt-audio-row-name">{playlist.name}</span>
                    <span className="vtt-audio-row-meta">{playlist.tracks.length} titre(s)</span>
                </button>
            )}
            <SlotChip playlist={playlist} onWrite={onWrite} />
            <span className="vtt-audio-row-actions">
                {playable && (
                    <LayersMenu label={`Jouer la playlist « ${playlist.name} » sur une autre piste`} slots={['ambience1', 'ambience2']} state={audioState}
                                onPlay={slot => onCommand({ slot, action: 'playPlaylist', playlistId: playlist.id })} />
                )}
                <MenuButton icon="more" label={`Actions pour la playlist « ${playlist.name} »`}>
                    {(close) => (
                        <>
                            <MenuItem onSelect={() => { close(); setEditing({ kind: 'playlist', id: playlist.id }); }}>Renommer…</MenuItem>
                            <MenuItem disabled={empty || !ctx.canCreateButton} hint={ctx.canCreateButton ? undefined : '5 au plus'}
                                      onSelect={() => { close(); ctx.onCreateButton({ kind: 'playlist', playlistId: playlist.id, name: playlist.name, slot }); }}>Créer un bouton…</MenuItem>
                            <MenuItem onSelect={() => { close(); onPick({ kind: 'collection', title: 'Copier la playlist vers…', onPick: id => onWrite('POST', `/playlists/${playlist.id}/copy`, { collectionId: id }) }); }}>Copier vers une collection…</MenuItem>
                            <MenuItem onSelect={() => { close(); onPick({ kind: 'collection', title: 'Déplacer la playlist vers…', onPick: id => onWrite('PUT', `/playlists/${playlist.id}`, { collectionId: id }) }); }}>Déplacer vers une collection…</MenuItem>
                            <MenuSeparator />
                            <MenuItem danger onSelect={() => { close(); remove(); }}>Supprimer</MenuItem>
                        </>
                    )}
                </MenuButton>
            </span>
        </li>
    );
};

export const CollectionRow = ({ collection, editing, dragProps, ctx }) => {
    const { onWrite, confirm, setEditing, openCollection } = ctx;
    const remove = async () => {
        if (await confirm({ title: 'Supprimer la collection', message: `Supprimer « ${collection.name} » et ses ${collection.playlists.length} playlist(s) ? Les copies faites par d'autres tables ne sont pas touchées.`, confirmText: 'Supprimer', danger: true })) {
            onWrite('DELETE', `/collections/${collection.id}`);
        }
    };
    return (
        <li className="vtt-audio-row" {...dragProps}>
            <span className="vtt-audio-icon-btn" aria-hidden="true"><Icon name="folder" /></span>
            {editing ? (
                <RenameInput value={collection.name} onCancel={() => setEditing(null)}
                             onSave={name => { setEditing(null); onWrite('PUT', `/collections/${collection.id}`, { name }); }} />
            ) : (
                <button type="button" className="vtt-audio-row-main" onClick={() => openCollection(collection.id)}>
                    <span className="vtt-audio-row-name">{collection.name}</span>
                    <span className="vtt-audio-row-meta">{collection.playlists.length} playlist(s)</span>
                </button>
            )}
            {collection.visibility !== 'private' && <span className="vtt-audio-badge" title="Copiable par d'autres tables">{VISIBILITY_LABEL[collection.visibility]}</span>}
            <span className="vtt-audio-row-actions">
                <MenuButton icon="more" label={`Actions pour la collection « ${collection.name} »`}>
                    {(close) => (
                        <>
                            <MenuItem onSelect={() => { close(); setEditing({ kind: 'collection', id: collection.id }); }}>Renommer…</MenuItem>
                            <MenuLabel>Partage</MenuLabel>
                            {VISIBILITIES.map(v => (
                                <li key={v.id} role="none">
                                    <button type="button" role="menuitemradio" className="vtt-menu-item" aria-checked={collection.visibility === v.id} title={v.hint}
                                            onClick={() => { close(); onWrite('PUT', `/collections/${collection.id}`, { visibility: v.id }); }}>{v.label}</button>
                                </li>
                            ))}
                            <MenuSeparator />
                            <MenuItem danger onSelect={() => { close(); remove(); }}>Supprimer</MenuItem>
                        </>
                    )}
                </MenuButton>
            </span>
        </li>
    );
};

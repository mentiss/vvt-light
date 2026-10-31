// src/client/src/components/audio/panel/LibraryBrowser.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Navigation dans la bibliothèque du panneau MJ : liste (collections, playlists ou
// titres, résultats de recherche), fil d'Ariane, arborescence affichée en grand
// (documentations/spec_audio.md §11.13).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useDragOrder } from '../../../hooks/useDragOrder.js';
import { Icon, IconButton } from './PanelIcons.jsx';
import { TrackRow, PlaylistRow, CollectionRow } from './LibraryRows.jsx';
import { VISIBILITY_LABEL } from '../../../tools/audioSlots.js';
import { findPlaylist, normalizeQuery, titleMatches } from '../../../tools/audioLibrary.js';

export const LibraryList = ({ library, view, search, audioState, ctx }) => {
    const [editing, setEditing] = useState(null);   // { kind, id } : ligne en cours de renommage
    const rowCtx = { ...ctx, setEditing };
    const isEditing = (kind, id) => editing?.kind === kind && editing.id === id;

    const playingSlotOf = (trackId) => Object.entries(audioState?.slots ?? {}).find(([, s]) => s.trackId === trackId)?.[0] ?? null;

    const place = view.playlistId ? findPlaylist(library, view.playlistId) : null;
    const collection = view.collectionId ? library.find(c => c.id === view.collectionId) : null;

    const trackIds = place?.playlist.tracks.map(t => t.id) ?? [];
    const playlistIds = collection?.playlists.map(p => p.id) ?? [];
    const collectionIds = library.map(c => c.id);
    const dragTracks = useDragOrder(trackIds, order => ctx.onWrite('PUT', `/playlists/${place.playlist.id}/order`, { trackIds: order }));
    const dragPlaylists = useDragOrder(playlistIds, order => ctx.onWrite('PUT', `/collections/${collection.id}/order`, { playlistIds: order }));
    const dragCollections = useDragOrder(collectionIds, order => ctx.onWrite('PUT', '/collections/order', { ids: order }));

    const q = normalizeQuery(search);
    if (q) {
        const hits = library.flatMap(c => c.playlists.flatMap(p => p.tracks
            .filter(t => titleMatches(t.title, q))
            .map(t => ({ track: t, slot: p.defaultSlot, path: `${c.name} › ${p.name}` }))));
        if (!hits.length) return <ul className="vtt-audio-list"><li className="vtt-audio-empty">Aucun titre ne contient « {search.trim()} ».</li></ul>;
        return (
            <ul className="vtt-audio-list">
                <li className="vtt-audio-group-label">{hits.length} titre(s)</li>
                {hits.map(({ track, slot, path }) => (
                    <TrackRow key={track.id} track={track} slot={slot} path={path} playingSlot={playingSlotOf(track.id)} audioState={audioState}
                              editing={isEditing('track', track.id)} ctx={rowCtx} />
                ))}
            </ul>
        );
    }

    if (place) {
        return (
            <ul className="vtt-audio-list">
                {place.playlist.tracks.map(track => (
                    <TrackRow key={track.id} track={track} slot={place.playlist.defaultSlot} playingSlot={playingSlotOf(track.id)} audioState={audioState}
                              editing={isEditing('track', track.id)} dragProps={dragTracks(track.id)} ctx={rowCtx} />
                ))}
                {!place.playlist.tracks.length && <li className="vtt-audio-empty">Playlist vide. Collez un lien YouTube : « Ajouter un lien » en bas, ou Ctrl+V.</li>}
            </ul>
        );
    }

    if (collection) {
        return (
            <ul className="vtt-audio-list">
                {collection.playlists.map(playlist => (
                    <PlaylistRow key={playlist.id} playlist={playlist} audioState={audioState}
                                 editing={isEditing('playlist', playlist.id)} dragProps={dragPlaylists(playlist.id)} ctx={rowCtx} />
                ))}
                <li><button type="button" className="vtt-audio-text-btn" onClick={() => ctx.onWrite('POST', '/playlists', { collectionId: collection.id })}><Icon name="plus" /> Nouvelle playlist</button></li>
            </ul>
        );
    }

    return (
        <ul className="vtt-audio-list">
            {library.map(c => (
                <CollectionRow key={c.id} collection={c} editing={isEditing('collection', c.id)} dragProps={dragCollections(c.id)} ctx={rowCtx} />
            ))}
            {!library.length && <li className="vtt-audio-empty">Bibliothèque vide. Collez un lien YouTube : la collection et la playlist se créent toutes seules.</li>}
            <li><button type="button" className="vtt-audio-text-btn" onClick={() => ctx.onWrite('POST', '/collections', {})}><Icon name="plus" /> Nouvelle collection</button></li>
        </ul>
    );
};

export const Breadcrumbs = ({ library, view, search, onNavigate }) => {
    if (search.trim()) return <nav className="vtt-audio-crumbs" aria-label="Emplacement"><span aria-current="page">Recherche</span></nav>;
    const collection = view.collectionId ? library.find(c => c.id === view.collectionId) : null;
    const playlist = view.playlistId ? findPlaylist(library, view.playlistId)?.playlist : null;
    return (
        <nav className="vtt-audio-crumbs" aria-label="Emplacement dans la bibliothèque">
            {collection && (
                <IconButton icon="back" label="Revenir en arrière"
                            onClick={() => onNavigate(playlist ? { collectionId: collection.id, playlistId: null } : { collectionId: null, playlistId: null })} />
            )}
            {collection
                ? <button type="button" className="vtt-audio-crumb-root" onClick={() => onNavigate({ collectionId: null, playlistId: null })}>Bibliothèque</button>
                : <span aria-current="page">Bibliothèque</span>}
            {collection && (
                <>
                    <span className="vtt-audio-crumb-sep vtt-audio-crumb-root" aria-hidden="true">›</span>
                    {playlist
                        ? <button type="button" onClick={() => onNavigate({ collectionId: collection.id, playlistId: null })}>{collection.name}</button>
                        : <span aria-current="page">{collection.name}</span>}
                </>
            )}
            {playlist && <><span className="vtt-audio-crumb-sep" aria-hidden="true">›</span><span aria-current="page">{playlist.name}</span></>}
        </nav>
    );
};

export const LibraryTree = ({ library, view, onNavigate, onWrite }) => (
    <nav className="vtt-audio-tree" aria-label="Collections et playlists">
        {library.map(c => (
            <div key={c.id} className="vtt-audio-tree-collection">
                <div className="vtt-audio-tree-head">
                    <span>{c.name}</span>
                    {c.visibility !== 'private' && <span title={VISIBILITY_LABEL[c.visibility]} aria-label={VISIBILITY_LABEL[c.visibility]}><Icon name="globe" size={13} /></span>}
                </div>
                {c.playlists.map(p => (
                    <button key={p.id} type="button" className="vtt-audio-tree-item" aria-current={view.playlistId === p.id}
                            onClick={() => onNavigate({ collectionId: c.id, playlistId: p.id })}>
                        <Icon name="list" size={14} /><span>{p.name}</span><span className="vtt-audio-tree-count">{p.tracks.length}</span>
                    </button>
                ))}
            </div>
        ))}
        <button type="button" className="vtt-audio-text-btn" onClick={() => onWrite('POST', '/collections', {})}><Icon name="plus" /> Nouvelle collection</button>
    </nav>
);

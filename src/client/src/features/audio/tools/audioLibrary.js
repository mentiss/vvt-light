// src/client/src/features/audio/tools/audioLibrary.js
// ─────────────────────────────────────────────────────────────────────────────
// Bibliothèque audio, côté client : durée lisible, recherche, emplacement d'une
// playlist (documentations/spec_audio.md §11.13, §11.14). Fonctions pures, testées.
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeText } from '@/ui/tools/catalog.js';

/** Durée lisible : « 3:47 », « 1:41:25 ». */
export const formatTime = (s) => {
    const total = Math.max(0, Math.floor(s || 0));
    const h = Math.floor(total / 3600), m = Math.floor(total / 60) % 60, sec = String(total % 60).padStart(2, '0');
    return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

/** Texte de recherche normalisé (casse et accents ignorés), '' si vide. */
export const normalizeQuery = (search) => normalizeText(String(search ?? '').trim());

/** Un titre correspond-il à la recherche normalisée ? */
export const titleMatches = (title, query) => !!query && normalizeText(title).includes(query);

/** Playlist et sa collection, ou null. */
export const findPlaylist = (library, id) => {
    for (const c of library) {
        const p = c.playlists.find(x => x.id === id);
        if (p) return { collection: c, playlist: p };
    }
    return null;
};

/** Playlist la plus récente (celle qu'un ajout vient de créer). */
export const newestPlaylist = (library) => library.flatMap(c => c.playlists).reduce((a, p) => (!a || p.id > a.id ? p : a), null);

/** Titres affichés : résultats de recherche, ou titres de la playlist ouverte. */
export const displayedTracks = (library, view, search) => {
    const q = normalizeQuery(search);
    if (q) return library.flatMap(c => c.playlists.flatMap(p => p.tracks.filter(t => titleMatches(t.title, q))));
    return (view.playlistId && findPlaylist(library, view.playlistId)?.playlist.tracks) || [];
};

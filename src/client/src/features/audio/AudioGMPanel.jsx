// src/client/src/features/audio/AudioGMPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Panneau MJ de la musique (documentations/spec_audio.md §11.13, maquette
// documentations/audio/maquette_panneau_mj.html). Le cœur : diffuser de la musique
// à la table. Une seule vue :
// - en haut, ce qui joue (panel/NowPlaying.jsx) ;
// - en dessous, la bibliothèque, rouverte sur la dernière playlist consultée
//   (panel/LibraryBrowser.jsx, panel/LibraryRows.jsx) ; recherche dans toute la
//   bibliothèque ; arborescence à gauche en grand ;
// - en pied, « Ajouter un lien » et le catalogue public (panel/AddLinkFoot.jsx) ;
//   Ctrl+V dans le panneau ajoute aussi le lien collé.
// Fenêtre flottante générique (ui/panel/FloatingPanel.jsx, spec_ui_panneaux.md) :
// déplaçable, redimensionnable, réductible, plein écran, mémorisée (« audio »).
// Menus et fenêtres modales passent par l'emplacement à modales de la page : la
// fenêtre, conteneur de requêtes de taille, rognerait ce qui est en position fixe.
// Ce fichier assemble les briques et porte l'état du panneau (vue, ajout, import).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HostedModal } from '@/ui/modal/ModalHost.jsx';
import FloatingPanel from '@/ui/panel/FloatingPanel.jsx';
import useConfirm from '@/ui/hooks/useConfirm.jsx';
import { useAudioLibrary } from './hooks/useAudioLibrary.js';
import { useAudioButtons, MAX_AUDIO_BUTTONS } from './hooks/useAudioButtons.js';
import AudioScenesMenu from './AudioScenesMenu.jsx';
import { TargetButtonDialog } from './panel/ScenesDialog.jsx';
import { usePersistedState } from '@/app/hooks/usePersistedState.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';
import { parseMediaLink } from './tools/mediaLinks.js';
import { findPlaylist, newestPlaylist, displayedTracks } from './tools/audioLibrary.js';
import { tableScope } from '@/app/tools/browserStorage.js';
import { Icon, IconButton } from './panel/PanelIcons.jsx';
import { SlotChip } from './panel/SlotChip.jsx';
import { NowPlaying } from './panel/NowPlaying.jsx';
import { LibraryList, Breadcrumbs, LibraryTree } from './panel/LibraryBrowser.jsx';
import { TargetPicker, CatalogModal } from './panel/PanelDialogs.jsx';
import { PlaylistImport, DurationProbe } from './panel/HiddenPlayers.jsx';
import { AddLinkFoot } from './panel/AddLinkFoot.jsx';

const MESSAGE_MS = 3000;

// Dernière vue de la bibliothèque, par table : vtt:<slug>:<table>:audio (spec_browser_storage.md §6)
const VIEW_DEFAULTS = { collectionId: null, playlistId: null };

/**
 * @param {object}   props
 * @param {number}   props.sessionId    table active
 * @param {object}   props.audio        retour de useAudioSession
 * @param {Function} props.onClose
 * @param {boolean}  [props.focusOnOpen] ouvert par l'utilisateur (sinon rouvert seul après un rechargement)
 */
const AudioGMPanel = ({ sessionId, audio, onClose, focusOnOpen = true }) => {
    const [view, setStoredView] = usePersistedState(tableScope(getSystemFromPath(), sessionId), 'audio', { defaults: VIEW_DEFAULTS });
    const [search, setSearch] = useState('');
    const [adding, setAdding] = useState(false);
    const [importing, setImporting] = useState(null);   // { listId, collectionId }
    const [message, setMessage] = useState('');
    const [picker, setPicker] = useState(null);         // { kind, title, onPick }
    const [catalogOpen, setCatalogOpen] = useState(false);
    const lib = useAudioLibrary(sessionId, true);
    // Boutons préréglés (lot 2, §12.6) : un seul jeu pour le panneau ouvert et sa barre réduite
    const scenes = useAudioButtons(sessionId);
    const [buttonTarget, setButtonTarget] = useState(null);   // bouton ciblé en cours de création
    const { confirm, confirmEl } = useConfirm();
    const { write } = lib;

    // Dernière playlist consultée, rouverte à l'ouverture (mémorisée par table)
    const setView = useCallback((next) => { setStoredView(next); setSearch(''); }, [setStoredView]);

    // Vue qui ne correspond plus à la bibliothèque (contenu supprimé) : on remonte d'un cran
    const library = lib.library;
    const validView = (() => {
        if (view.playlistId && findPlaylist(library, view.playlistId)) return view;
        if (view.collectionId && library.some(c => c.id === view.collectionId)) return { collectionId: view.collectionId, playlistId: null };
        return { collectionId: null, playlistId: null };
    })();

    const flash = useCallback((text) => setMessage(text), []);
    useEffect(() => {
        if (!message) return undefined;
        const id = setTimeout(() => setMessage(''), MESSAGE_MS);
        return () => clearTimeout(id);
    }, [message]);

    // ── Ajout d'un lien (pied, ou Ctrl+V dans le panneau) ───────────────────
    const showNewest = useCallback((updated) => {
        const created = newestPlaylist(updated);
        const place = created && findPlaylist(updated, created.id);
        if (place) setView({ collectionId: place.collection.id, playlistId: created.id });
        return created;
    }, [setView]);

    const addLink = async (parsed) => {
        if (parsed.listId) {
            setImporting({ listId: parsed.listId, collectionId: validView.collectionId });
            return;
        }
        // YouTube par son identifiant, les autres sources par leur lien, résolu par le serveur (§14.3)
        const content = parsed.source === 'youtube' ? { videoIds: [parsed.videoId] } : { links: [parsed.url] };
        const target = validView.playlistId && findPlaylist(library, validView.playlistId);
        if (target) {
            if (await write('POST', `/playlists/${target.playlist.id}/tracks`, content)) flash(`Ajouté à « ${target.playlist.name} »`);
            return;
        }
        // Pas de playlist ouverte : une playlist est créée (et une collection s'il n'y en a pas)
        const updated = await write('POST', '/playlists', { collectionId: validView.collectionId ?? undefined, ...content });
        if (updated) flash(`Nouvelle playlist « ${showNewest(updated)?.name} »`);
    };

    const importDone = useCallback(async (ids) => {
        const { listId, collectionId } = importing;
        setImporting(null);
        const updated = await write('POST', '/playlists', { collectionId: collectionId ?? undefined, listId, videoIds: ids });
        if (updated) flash(`Playlist importée : « ${showNewest(updated)?.name} », ${ids.length} titre(s)`);
    }, [importing, write, showNewest, flash]);
    const importFail = useCallback(() => { setImporting(null); flash('Playlist introuvable, privée ou vide'); }, [flash]);

    // Durées relevées : envoyées par lots, pour ne pas rafraîchir la bibliothèque à chaque titre
    const foundRef = useRef([]);
    const flushRef = useRef(null);
    const onDurationFound = useCallback((id, duration) => {
        foundRef.current.push({ id, duration });
        clearTimeout(flushRef.current);
        flushRef.current = setTimeout(() => {
            const durations = foundRef.current;
            foundRef.current = [];
            write('PUT', '/tracks/durations', { durations });
        }, 1500);
    }, [write]);
    useEffect(() => () => clearTimeout(flushRef.current), []);
    // Lecteur caché YouTube seulement : les autres sources ont leur durée à l'ajout ou à la première lecture
    const missingDurations = displayedTracks(library, validView, search).filter(t => t.source === 'youtube' && !t.duration && !t.unavailable);
    // Playlist ouverte (hors recherche) : sa pastille de piste dans la barre de navigation
    const openPlace = !search.trim() && validView.playlistId ? findPlaylist(library, validView.playlistId) : null;

    const onPaste = (e) => {
        if (e.target.closest('input, textarea')) return;
        const parsed = parseMediaLink(e.clipboardData.getData('text'));
        if (!parsed) return;
        e.preventDefault();
        addLink(parsed);
    };

    // Bibliothèque supprimée pendant la consultation d'une vue : rien à faire de plus que validView
    const ctx = {
        onCommand: audio.sendCommand,
        onWrite: write,
        onPick: setPicker,
        confirm,
        // « Créer un bouton… » des menus ⋯ (§12.6) : 5 boutons au plus
        onCreateButton: (target) => { scenes.clearError(); setButtonTarget(target); },
        canCreateButton: scenes.buttons.length < MAX_AUDIO_BUTTONS,
        open: (playlistId) => setView({ collectionId: validView.collectionId, playlistId }),
        openCollection: (collectionId) => setView({ collectionId, playlistId: null }),
    };

    const pick = async (id) => {
        const action = picker.onPick;
        setPicker(null);
        await action(id);
    };

    const music = audio.state?.slots?.music;
    const nowLabel = music?.mediaId ? `${music.status === 'playing' ? '' : '(pause) '}${music.title}` : null;

    // Panneau réduit : mini-contrôles de la musique et arrêt de tout, à la place du titre en cours
    const hasMusic = !!music?.mediaId;
    const anyPlaying = Object.values(audio.state?.slots ?? {}).some(s => s.mediaId);
    const send = (action) => audio.sendCommand({ slot: 'music', action });
    const miniControls = (
        <>
            <IconButton icon="prev" label="Titre précédent" disabled={!hasMusic} onClick={() => send('previous')} />
            {music?.status === 'playing'
                ? <IconButton icon="pause" label="Pause" onClick={() => send('pause')} />
                : <IconButton icon="play" label="Lecture" disabled={!hasMusic} onClick={() => send('resume')} />}
            <IconButton icon="next" label="Titre suivant" disabled={!hasMusic} onClick={() => send('next')} />
            <IconButton icon="stop" label="Tout arrêter" disabled={!anyPlaying} onClick={() => audio.sendCommand({ action: 'stopAll' })} />
            <AudioScenesMenu scenes={scenes} audio={audio} trigger={props => <IconButton icon="scenes" label="Scènes" {...props} />} />
        </>
    );

    return (
        // Fenêtre flottante générique : déplacement, redimensionnement, réduction, plein écran, mémorisation
        <FloatingPanel title="Musique" titleExtra={nowLabel} minimizedActions={miniControls} persistAs="audio" onClose={onClose}
                       focusOnOpen={focusOnOpen} className="vtt-audio-panel" onPaste={onPaste}>
            <NowPlaying audio={audio} library={library} scenes={scenes} onGoto={(collectionId, playlistId) => setView({ collectionId, playlistId })} />

            {lib.error && (
                <div className="vtt-callout vtt-callout-danger text-sm flex items-center gap-2 mx-3 mt-2">
                    <span className="flex-1">{lib.error}</span>
                    <IconButton icon="close" label="Fermer le message" onClick={lib.clearError} />
                </div>
            )}

            <div className="vtt-audio-library">
                <LibraryTree library={library} view={validView} onNavigate={setView} onWrite={write} />
                <div className="vtt-audio-browse">
                    <div className="vtt-audio-browse-bar">
                        <Breadcrumbs library={library} view={validView} search={search} onNavigate={setView} />
                        {openPlace && <SlotChip playlist={openPlace.playlist} onWrite={write} />}
                        <label className="vtt-audio-search">
                            <span className="sr-only">Rechercher un titre dans la bibliothèque</span>
                            <Icon name="search" size={15} />
                            <input type="search" value={search} placeholder="Rechercher un titre" autoComplete="off"
                                   onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Escape' && search) { e.stopPropagation(); setSearch(''); } }} />
                        </label>
                    </div>
                    <LibraryList library={library} view={validView} search={search} audioState={audio.state} ctx={ctx} />
                </div>
            </div>

            <AddLinkFoot adding={adding} setAdding={setAdding} message={message} importing={importing}
                         onSubmit={addLink} onCatalog={() => setCatalogOpen(true)} />

            {importing && <PlaylistImport listId={importing.listId} onDone={importDone} onFail={importFail} />}
            {missingDurations.length > 0 && <DurationProbe tracks={missingDurations} onFound={onDurationFound} />}
            {picker && <TargetPicker {...picker} library={library} onPick={pick} onClose={() => setPicker(null)} />}
            {buttonTarget && (
                <TargetButtonDialog target={buttonTarget} error={scenes.error} onClose={() => setButtonTarget(null)}
                                    onCreate={async (body) => { if (await scenes.createTarget(body)) { setButtonTarget(null); flash(`Bouton « ${body.label} » créé`); } }} />
            )}
            {catalogOpen && <CatalogModal lib={lib} onPick={setPicker} onClose={() => setCatalogOpen(false)} />}
            {confirmEl && <HostedModal>{confirmEl}</HostedModal>}
        </FloatingPanel>
    );
};

export default AudioGMPanel;

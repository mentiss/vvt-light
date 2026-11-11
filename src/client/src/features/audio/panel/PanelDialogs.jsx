// src/client/src/features/audio/panel/PanelDialogs.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtres du panneau MJ : choix d'une destination (copie, déplacement) et catalogue
// public, sur la Modal générique, dans l'emplacement à modales de la page.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { HostedModal } from '@/ui/modal/ModalHost.jsx';
import { useSystems } from '@/app/context/SystemsContext.jsx';

/** Choix d'une de mes collections ou de mes playlists, pour copier ou déplacer. */
export const TargetPicker = ({ kind, library, title, onPick, onClose }) => {
    const collections = library.filter(c => kind === 'collection' || c.playlists.length > 0);
    return (
        <HostedModal>
            <Modal title={title} size="sm" onClose={onClose} className="vtt-audio-picker">
                {collections.length === 0 && <p className="text-sm text-muted">Aucune {kind === 'collection' ? 'collection' : 'playlist'} dans cette table pour l'instant.</p>}
                <ul className="space-y-1">
                    {collections.map(c => (kind === 'collection' ? (
                        <li key={c.id}><button type="button" className="vtt-audio-pick" onClick={() => onPick(c.id)}>{c.name}</button></li>
                    ) : (
                        <li key={c.id}>
                            <div className="vtt-field-label">{c.name}</div>
                            <ul className="space-y-1">
                                {c.playlists.map(p => <li key={p.id}><button type="button" className="vtt-audio-pick" onClick={() => onPick(p.id)}>{p.name}</button></li>)}
                            </ul>
                        </li>
                    )))}
                </ul>
            </Modal>
        </HostedModal>
    );
};

export const CatalogModal = ({ lib, onPick, onClose }) => {
    const { systems = [] } = useSystems() ?? {};
    const { reloadCatalog } = lib;
    useEffect(() => { reloadCatalog(); }, [reloadCatalog]);
    const ownerLabel = ({ slug, sessionId, sessionName }) => `${systems.find(s => s.slug === slug)?.label ?? slug} · ${sessionName ?? `table ${sessionId}`}`;

    return (
        <HostedModal>
            <Modal title="Catalogue public" subtitle="Collections et playlists partagées par d'autres tables" size="lg" onClose={onClose} className="vtt-audio-catalog">
                <p className="text-sm text-muted mb-3">Une copie est indépendante : elle ne suit pas les modifications de l'original.</p>
                {!lib.catalog.length && <p className="text-sm text-muted">Aucun contenu public pour l'instant.</p>}
                <ul className="space-y-3">
                    {lib.catalog.map(collection => (
                        <li key={collection.id} className="vtt-panel p-3">
                            <div className="flex items-center gap-2">
                                <span className="flex-1 min-w-0">
                                    <span className="font-semibold">{collection.name}</span>
                                    <span className="block text-xs text-muted">{ownerLabel(collection.owner)}</span>
                                </span>
                                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => lib.write('POST', `/collections/${collection.id}/copy`)}>Copier la collection</button>
                            </div>
                            <ul className="mt-2 space-y-1">
                                {collection.playlists.map(playlist => (
                                    <li key={playlist.id} className="flex items-center gap-2 text-sm">
                                        <span className="flex-1 min-w-0 truncate">{playlist.name} <span className="text-xs text-muted">· {playlist.tracks.length} titre(s)</span></span>
                                        <button type="button" className="vtt-btn vtt-btn-sm"
                                                onClick={() => onPick({ kind: 'collection', title: 'Copier la playlist vers…', onPick: id => lib.write('POST', `/playlists/${playlist.id}/copy`, { collectionId: id }) })}>
                                            Copier la playlist
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </Modal>
        </HostedModal>
    );
};

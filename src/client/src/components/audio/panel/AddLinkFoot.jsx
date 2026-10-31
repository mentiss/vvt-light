// src/client/src/components/audio/panel/AddLinkFoot.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Pied du panneau MJ : « Ajouter un lien » à la Watch2Gether (un champ et son bouton),
// message bref, accès au catalogue public (documentations/spec_audio.md §11.13).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import { Icon, IconButton } from './PanelIcons.jsx';
import { parseYouTubeLink } from '../../../tools/youtubeApi.js';

export const AddLinkFoot = ({ adding, setAdding, message, importing, onSubmit, onCatalog }) => {
    const [link, setLink] = useState('');
    const parsed = parseYouTubeLink(link);
    const openRef = useRef(null);

    const close = () => { setAdding(false); setLink(''); setTimeout(() => openRef.current?.focus(), 0); };
    const submit = (e) => {
        e.preventDefault();
        if (!parsed) return;
        onSubmit(parsed);
        setLink('');
        setAdding(false);
    };

    return (
        <div className="vtt-audio-foot">
            {adding ? (
                <form className="vtt-audio-add-form" onSubmit={submit}>
                    <label className="sr-only" htmlFor="vtt-audio-add-input">Lien YouTube à ajouter</label>
                    <input id="vtt-audio-add-input" className="vtt-input" type="url" value={link} autoFocus autoComplete="off"
                           placeholder="Coller un lien YouTube (vidéo ou playlist)" onChange={e => setLink(e.target.value)}
                           onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } }} />
                    <button type="submit" className="vtt-btn vtt-btn-primary vtt-btn-sm" disabled={!parsed}>
                        {parsed?.listId ? 'Importer la playlist' : 'Ajouter'}
                    </button>
                    <IconButton icon="close" label="Annuler (Échap)" onClick={close} />
                </form>
            ) : (
                <>
                    <button ref={openRef} type="button" className="vtt-audio-text-btn is-primary" onClick={() => setAdding(true)} disabled={!!importing}>
                        <Icon name="plus" /> {importing ? 'Import de la playlist…' : 'Ajouter un lien'}
                    </button>
                    <span className="vtt-audio-foot-message flex-1 truncate" role="status">{message}</span>
                    <button type="button" className="vtt-audio-text-btn" onClick={onCatalog} title="Copier une collection ou une playlist partagée par une autre table">
                        <Icon name="globe" /> Catalogue public
                    </button>
                </>
            )}
        </div>
    );
};

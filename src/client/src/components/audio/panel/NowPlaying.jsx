// src/client/src/components/audio/panel/NowPlaying.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Ce qui joue, en tête du panneau MJ (documentations/spec_audio.md §11.13) : musique
// (commandes, position, mode), ambiances et effet en pastilles, options de la table.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { Icon, IconButton } from './PanelIcons.jsx';
import { MenuButton, MenuItem, MenuSeparator } from './RowMenu.jsx';
import { expectedPosition } from '../../../tools/audioSync.js';
import { MODE_LABELS, SLOT_LABEL, LAYER_SLOTS, nextMode } from '../../../tools/audioSlots.js';
import { formatTime, findPlaylist } from '../../../tools/audioLibrary.js';

export const NowPlaying = ({ audio, library, onGoto }) => {
    const { getServerNow, sendCommand } = audio;
    const [now, setNow] = useState(() => getServerNow());
    const [seekValue, setSeekValue] = useState(null);   // position en cours de glissement
    useEffect(() => {
        const id = setInterval(() => setNow(getServerNow()), 1000);
        return () => clearInterval(id);
    }, [getServerNow]);

    const slots = audio.state?.slots ?? {};
    const music = slots.music;
    const hasMusic = !!music?.youtubeId;
    const place = hasMusic ? findPlaylist(library, music.playlistId) : null;
    const position = hasMusic ? expectedPosition(music, now) : 0;
    const send = (slot, action, extra = {}) => sendCommand({ slot, action, ...extra });

    const commitSeek = () => {
        if (seekValue !== null) send('music', 'seek', { position: seekValue });
        setSeekValue(null);
    };

    const sessionMenu = (
        <MenuButton icon="more" label="Options de la table">
            {(close) => (
                <>
                    <MenuItem onSelect={() => { close(); sendCommand({ action: 'stopAll' }); }}>Tout arrêter</MenuItem>
                    <MenuItem onSelect={() => { close(); sendCommand({ action: 'settings', hideTitle: !audio.hideTitle }); }}>
                        {audio.hideTitle ? 'Montrer le titre aux joueurs' : 'Masquer le titre aux joueurs'}
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem danger onSelect={() => { close(); audio.setEnabled(false); }}>Désactiver la musique</MenuItem>
                </>
            )}
        </MenuButton>
    );

    if (!audio.enabled) {
        return (
            <div className="vtt-audio-now" role="region" aria-label="En cours de lecture">
                <div className="vtt-audio-now-main">
                    <p className="vtt-audio-now-empty">Musique désactivée pour cette table : les joueurs n'ont ni lecteur ni son. La bibliothèque se prépare déjà.</p>
                    <button type="button" className="vtt-btn vtt-btn-primary vtt-btn-sm" onClick={() => audio.setEnabled(true)}>Activer</button>
                </div>
            </div>
        );
    }

    const layers = LAYER_SLOTS.filter(slot => slots[slot]?.youtubeId);

    return (
        <div className="vtt-audio-now" role="region" aria-label="En cours de lecture">
            <div className="vtt-audio-now-main">
                {hasMusic ? (
                    <>
                        <div className="vtt-audio-now-text">
                            <span className="vtt-audio-now-title" title={music.title}>{music.title}</span>
                            <span className="vtt-audio-now-sub">
                                Musique{place && <> · <button type="button" onClick={() => onGoto(place.collection.id, place.playlist.id)} title="Afficher cette playlist">{place.collection.name} › {place.playlist.name}</button></>}
                            </span>
                        </div>
                        <div className="vtt-audio-now-controls">
                            <IconButton icon="prev" label="Titre précédent" onClick={() => send('music', 'previous')} />
                            {music.status === 'playing'
                                ? <IconButton icon="pause" label="Pause" main onClick={() => send('music', 'pause')} />
                                : <IconButton icon="play" label="Lecture" main onClick={() => send('music', 'resume')} />}
                            <IconButton icon="next" label="Titre suivant" onClick={() => send('music', 'next')} />
                        </div>
                    </>
                ) : (
                    <p className="vtt-audio-now-empty">Aucune musique en cours. Cliquez sur ▶ devant un titre ou une playlist.</p>
                )}
                {sessionMenu}
            </div>

            {hasMusic && (
                <div className="vtt-audio-seek">
                    <span>{formatTime(seekValue ?? position)}</span>
                    <input type="range" min="0" max={Math.max(1, Math.floor(music.duration ?? 0))} step="1" disabled={!music.duration}
                           value={Math.floor(seekValue ?? position)} aria-label="Position dans le morceau"
                           aria-valuetext={`${formatTime(seekValue ?? position)} sur ${music.duration ? formatTime(music.duration) : 'durée inconnue'}`}
                           onChange={e => setSeekValue(Number(e.target.value))} onPointerUp={commitSeek} onKeyUp={commitSeek} />
                    <span>{music.duration ? formatTime(music.duration) : '…'}</span>
                    <button type="button" className="vtt-audio-mode-btn" onClick={() => send('music', 'mode', { mode: nextMode('music', music.mode) })}
                            aria-label={`Mode : ${MODE_LABELS[music.mode]}. Changer de mode`} title="Changer de mode : playlist, boucle, aléatoire">
                        <Icon name={music.mode} size={14} />{MODE_LABELS[music.mode]}
                    </button>
                </div>
            )}

            {layers.length > 0 && (
                <div className="vtt-audio-layers" aria-label="Ambiances et effet en cours">
                    {layers.map(slot => {
                        const s = slots[slot];
                        const label = SLOT_LABEL[slot];
                        return (
                            <span key={slot} className={`vtt-audio-layer${s.status === 'playing' ? '' : ' is-paused'}`}>
                                <span className="vtt-audio-layer-kind">{label}</span>
                                <span className="vtt-audio-layer-title" title={s.title}>{s.title}</span>
                                {slot !== 'effect' && (
                                    <>
                                        <IconButton icon={s.mode} size={14} label={`${label} : mode ${MODE_LABELS[s.mode]}. Changer de mode`}
                                                    onClick={() => send(slot, 'mode', { mode: nextMode(slot, s.mode) })} />
                                        {s.status === 'playing'
                                            ? <IconButton icon="pause" size={14} label={`Pause ${label}`} onClick={() => send(slot, 'pause')} />
                                            : <IconButton icon="play" size={14} label={`Reprendre ${label}`} onClick={() => send(slot, 'resume')} />}
                                    </>
                                )}
                                <IconButton icon="close" size={14} label={`Arrêter ${label}`} onClick={() => send(slot, 'stop')} />
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// src/client/src/components/audio/AudioPlayerWidget.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Boutons flottants de la musique (documentations/spec_audio.md Q-16, S-11, S-13) :
// - réglages du son : titre de la piste musique seulement (sauf si le MJ le
//   masque), son à activer, coupure, volume général ; volumes par type repliés ;
// - MJ : accès direct au panneau, en un clic (P-3).
// États repliés / dépliés tenus par l'appelant (AudioLayer, mémorisés par slug dans vtt:<slug>:audio).
// Classes vtt-audio* habillables par le theme.css du slug.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

const TYPE_LEVELS = [
    { id: 'music',    label: 'Musique' },
    { id: 'ambience', label: 'Ambiances' },
    { id: 'effect',   label: 'Effets' },
];

const SpeakerIcon = ({ muted }) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9H4z" />
        {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
    </svg>
);

const PanelIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" />
    </svg>
);

const VolumeSlider = ({ label, value, onChange }) => (
    <label className="vtt-audio-volume">
        <span>{label} <span className="text-muted">{value} %</span></span>
        <input type="range" min="0" max="100" value={value} onChange={e => onChange(Number(e.target.value))} />
    </label>
);

/**
 * @param {object}   props
 * @param {boolean}  props.enabled         musique activée sur la table (sinon, pas de réglages)
 * @param {string|null} props.musicTitle   titre à afficher (null : rien)
 * @param {boolean}  props.playing         au moins une piste joue
 * @param {boolean}  props.unlocked        son activé
 * @param {Function} props.onUnlock        clic sur « Activer le son »
 * @param {object}   props.volumes         réglages du joueur (audioVolume.js)
 * @param {Function} props.onVolumesChange nouveaux réglages
 * @param {boolean}  props.open            réglages du son dépliés
 * @param {Function} props.onToggleOpen
 * @param {boolean}  props.details         volumes par type dépliés
 * @param {Function} props.onToggleDetails
 * @param {{ open: boolean, onToggle: Function }|null} [props.gmPanel] MJ : bouton du panneau
 */
const AudioPlayerWidget = ({
    enabled, musicTitle, playing, unlocked, onUnlock, volumes, onVolumesChange,
    open, onToggleOpen, details, onToggleDetails, gmPanel = null,
}) => {
    const setLevel = (level) => (value) => onVolumesChange({ ...volumes, [level]: value });
    const silent = volumes.muted || !unlocked;

    return (
        <div className={`vtt-audio-widget${open && enabled ? ' is-open' : ''}${playing ? ' is-playing' : ''}`}>
            {open && enabled && (
                // Classes du menu générique (habillage du slug) ; marges portées par le contenu
                <div className="vtt-menu vtt-audio-widget-panel">
                    <div className="vtt-audio-widget-content">
                        {musicTitle && <div className="vtt-audio-now" title={musicTitle}>{musicTitle}</div>}
                        {!unlocked && (
                            <button type="button" className="vtt-btn vtt-btn-primary vtt-btn-sm w-full" onClick={onUnlock}>Activer le son</button>
                        )}
                        <button type="button" className={`vtt-btn vtt-btn-sm${volumes.muted ? ' vtt-btn-danger' : ''}`} onClick={() => onVolumesChange({ ...volumes, muted: !volumes.muted })}>
                            <SpeakerIcon muted={volumes.muted} />
                            {volumes.muted ? 'Son coupé' : 'Couper le son'}
                        </button>
                        <VolumeSlider label="Volume général" value={volumes.master} onChange={setLevel('master')} />
                        <button type="button" className="vtt-audio-details-toggle" aria-expanded={details} onClick={onToggleDetails}>
                            {details ? '▾' : '▸'} Volumes par type
                        </button>
                        {details && TYPE_LEVELS.map(level => (
                            <VolumeSlider key={level.id} label={level.label} value={volumes[level.id]} onChange={setLevel(level.id)} />
                        ))}
                    </div>
                </div>
            )}
            <div className="vtt-audio-buttons">
                {enabled && (
                    <button type="button" className="vtt-audio-toggle" onClick={onToggleOpen}
                            title={open ? 'Replier les réglages du son' : 'Réglages du son'} aria-expanded={open}>
                        <SpeakerIcon muted={silent} />
                    </button>
                )}
                {gmPanel && (
                    <button type="button" className={`vtt-audio-toggle vtt-audio-toggle-gm${gmPanel.open ? ' is-active' : ''}`} onClick={gmPanel.onToggle}
                            title={gmPanel.open ? 'Fermer le panneau MJ' : 'Panneau MJ de la musique'} aria-pressed={gmPanel.open}>
                        <PanelIcon />
                    </button>
                )}
            </div>
        </div>
    );
};

export default AudioPlayerWidget;

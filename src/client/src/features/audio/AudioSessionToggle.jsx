// src/client/src/features/audio/AudioSessionToggle.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Élément prêt à l'emploi (documentations/spec_audio.md Q-31, Q-32, T-2, §12.5), à
// poser par le slug dans son onglet Session. Un slug qui ne le pose pas n'a pas la
// musique. C'est une bascule :
// - musique désactivée : « Activer la musique » ;
// - activée : « Musique ▾ », qui ouvre le menu des scènes (AudioScenesMenu : boutons
//   préréglés, STOP, enregistrer, modifier), terminé par « Désactiver la musique ».
// Personnalisable comme les HamburgerMenuItemXXX : label, icon, className.
//
//   <AudioSessionToggle sessionId={activeSession.id} className="vk-btn vk-btn-sm" />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useAudioSession } from './hooks/useAudioSession.js';
import { useAudioButtons } from './hooks/useAudioButtons.js';
import AudioScenesMenu from './AudioScenesMenu.jsx';
import { MenuItem, MenuSeparator } from './panel/RowMenu.jsx';

const DefaultIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" />
    </svg>
);

/**
 * @param {object} props
 * @param {number} props.sessionId     table active
 * @param {(enabled: boolean) => React.ReactNode} [props.label] libellé selon l'état
 * @param {React.ReactNode|null} [props.icon] icône (null : aucune)
 * @param {string} [props.className]   classes du bouton (habillage du slug)
 */
const AudioSessionToggle = ({ sessionId, label, icon, className = 'vtt-btn vtt-btn-sm' }) => {
    const audio = useAudioSession(sessionId ?? null);
    const scenes = useAudioButtons(audio.enabled ? sessionId : null);
    const [busy, setBusy] = useState(false);
    const shownIcon = icon === undefined ? <DefaultIcon /> : icon;

    const setEnabled = async (enabled) => {
        setBusy(true);
        await audio.setEnabled(enabled);
        setBusy(false);
    };

    if (!audio.enabled) {
        return (
            <button type="button" className={`vtt-audio-session-toggle ${className}`.trim()}
                    onClick={() => setEnabled(true)} disabled={!sessionId || !audio.loaded || busy} aria-pressed={false}
                    title="Activer la musique pour cette table">
                {shownIcon}
                {label ? label(false) : 'Activer la musique'}
            </button>
        );
    }

    return (
        <AudioScenesMenu
            scenes={scenes}
            audio={audio}
            trigger={props => (
                <button type="button" className={`vtt-audio-session-toggle ${className} is-active`.trim()} disabled={busy}
                        title="Scènes et musique de la table" {...props}>
                    {shownIcon}
                    {label ? label(true) : 'Musique'}
                    <span aria-hidden="true">▾</span>
                </button>
            )}
            extraItems={close => (
                <>
                    <MenuSeparator />
                    <MenuItem danger onSelect={() => { close(); setEnabled(false); }}
                              hint="arrête la lecture chez tous">Désactiver la musique</MenuItem>
                </>
            )}
        />
    );
};

export default AudioSessionToggle;

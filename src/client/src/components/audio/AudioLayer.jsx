// src/client/src/components/audio/AudioLayer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Couche audio des pages génériques (documentations/spec_audio.md §11.7), montée
// par GMPage et PlayerPage avec la table active.
// - Joueur : rien si la musique de la table est désactivée ; sinon un lecteur
//   caché par piste non vide, la modale « Activer le son » à l'arrivée et le
//   bouton des réglages du son.
// - MJ : le bouton du panneau est toujours là quand une table est active, même
//   musique désactivée (préparer sa bibliothèque, activer depuis le panneau).
// Les slugs n'ont rien à faire : ni prop nouvelle, ni import.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import { useAudioSession } from '../../hooks/useAudioSession.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { DEFAULT_VOLUMES, normalizeVolumes, slotVolume } from '../../tools/audioVolume.js';
import { PLATFORM_SCOPE } from '../../tools/browserStorage.js';
import SlotPlayer from './SlotPlayer.jsx';
import AudioUnlockModal from './AudioUnlockModal.jsx';
import AudioPlayerWidget from './AudioPlayerWidget.jsx';
import AudioGMPanel from './AudioGMPanel.jsx';

// Réglages audio de ce navigateur, pour toute la plateforme : vtt:platform:audio
// (spec_browser_storage.md §6) ; la position du panneau MJ, elle, est à FloatingPanel
const AUDIO_DEFAULTS = { volumes: DEFAULT_VOLUMES, widgetOpen: false, widgetDetails: false, panelOpen: false };

/**
 * @param {object} props
 * @param {'gm'|'player'} props.role
 * @param {number|null}   props.sessionId table active
 */
const AudioLayer = ({ role, sessionId }) => {
    const audio = useAudioSession(sessionId);
    const { sendCommand } = audio;
    const isGM = role === 'gm';

    const [unlocked, setUnlocked]   = useState(false);   // par chargement de page (contrainte des navigateurs)
    const [dismissed, setDismissed] = useState(false);   // « Plus tard »
    const [openedByUser, setOpenedByUser] = useState(false);   // panneau ouvert d'un clic (focus, F-4)
    const [settings, setSettings] = usePersistedState(PLATFORM_SCOPE, 'audio', { defaults: AUDIO_DEFAULTS });

    const volumes = normalizeVolumes(settings.volumes);
    const update = (patch) => setSettings(prev => ({ ...prev, ...patch }));
    const togglePanel = () => {
        if (!settings.panelOpen) setOpenedByUser(true);
        update({ panelOpen: !settings.panelOpen });
    };

    // Remontées du lecteur du MJ : durée connue, vidéo illisible (§11.3)
    const report = useCallback((action, payload) => { sendCommand({ action, ...payload }); }, [sendCommand]);

    if (!sessionId || !audio.loaded) return null;
    if (!audio.enabled && !isGM) return null;

    const slots = audio.enabled ? (audio.state?.slots ?? {}) : {};
    const music = slots.music;
    // Joueurs : titre de la musique seulement, sauf si le MJ le masque (S-11, Q-28) ; le MJ le voit toujours
    const musicTitle = music?.youtubeId && (isGM || !audio.hideTitle) ? music.title : null;
    const playing = Object.values(slots).some(s => s.status === 'playing');

    return (
        <>
            {Object.entries(slots).map(([slot, slotState]) => slotState.youtubeId && (
                <SlotPlayer
                    key={slot}
                    slot={slot}
                    slotState={slotState}
                    getServerNow={audio.getServerNow}
                    tolerance={audio.tolerance}
                    unlocked={unlocked}
                    volume={slotVolume(slot, slotState.gain, volumes)}
                    onReport={isGM ? report : undefined}
                />
            ))}

            <AudioPlayerWidget
                enabled={audio.enabled}
                musicTitle={musicTitle}
                playing={playing}
                unlocked={unlocked}
                onUnlock={() => setUnlocked(true)}
                volumes={volumes}
                onVolumesChange={next => update({ volumes: next })}
                open={settings.widgetOpen}
                onToggleOpen={() => update({ widgetOpen: !settings.widgetOpen })}
                details={settings.widgetDetails}
                onToggleDetails={() => update({ widgetDetails: !settings.widgetDetails })}
                gmPanel={isGM ? { open: settings.panelOpen, onToggle: togglePanel } : null}
            />

            {isGM && settings.panelOpen && (
                <AudioGMPanel sessionId={sessionId} audio={audio} onClose={togglePanel} focusOnOpen={openedByUser} />
            )}

            {audio.enabled && !unlocked && !dismissed && (
                <AudioUnlockModal onUnlock={() => setUnlocked(true)} onLater={() => setDismissed(true)} />
            )}
        </>
    );
};

export default AudioLayer;

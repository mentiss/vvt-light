// src/client/src/features/audio/AudioLayer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Couche audio des pages génériques (documentations/spec_audio.md §11.7), montée
// par GMPage et PlayerPage avec la table active.
// - Joueur : rien si la musique de la table est désactivée ; sinon un lecteur
//   caché par piste non vide, la modale « Activer le son » à l'arrivée et le
//   bouton des réglages du son.
// - MJ : le bouton du panneau est toujours là quand une table est active, même
//   musique désactivée (préparer sa bibliothèque, activer depuis le panneau).
// - Fondu d'un bouton (§15.6) : le temps du fondu, l'ancien lecteur de la piste reste
//   monté (même clé, même instance : le son continue) et descend, pendant que le
//   nouveau morceau se charge dans un lecteur neuf et monte.
// Les slugs n'ont rien à faire : ni prop nouvelle, ni import.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useState } from 'react';
import { useAudioSession } from './hooks/useAudioSession.js';
import { usePersistedState } from '@/app/hooks/usePersistedState.js';
import { DEFAULT_VOLUMES, normalizeVolumes, slotVolume } from './tools/audioVolume.js';
import { fadeOutActive } from './tools/audioFade.js';
import { PLATFORM_SCOPE } from '@/app/tools/browserStorage.js';
import { getSystemFromPath } from '@/app/hooks/useSystem.js';
import SlotPlayer from './SlotPlayer.jsx';
import AudioUnlockModal from './AudioUnlockModal.jsx';
import AudioPlayerWidget from './AudioPlayerWidget.jsx';
import AudioGMPanel from './AudioGMPanel.jsx';

// Volumes de ce navigateur, pour toute la plateforme : vtt:platform:audio ; ouverture des
// réglages du son et du panneau MJ, par slug : vtt:<slug>:audio (spec_browser_storage.md §6).
// La position du panneau MJ, elle, est à FloatingPanel (par slug aussi)
const VOLUME_DEFAULTS = { volumes: DEFAULT_VOLUMES };
const LAYOUT_DEFAULTS = { widgetOpen: false, widgetDetails: false, panelOpen: false };

const playerKey = (slot, source, lane) => `${slot}:${source ?? 'youtube'}:${lane ?? 0}`;

/** État du lecteur sortant d'un fondu : ce qui jouait au clic, qui continue depuis fade.at. */
const fadingState = ({ from, at }) => ({
    status: 'playing', trackId: null, source: from.source, mediaId: from.mediaId, title: null, gain: from.gain,
    position: from.position, refTime: at, duration: null,
});

/**
 * Lecteurs à monter, dans une seule liste : un lecteur garde son instance d'une liste à
 * l'autre (clé piste:source:lane), y compris quand il devient le lecteur sortant d'un fondu.
 */
function slotPlayers(slots, serverNow) {
    const players = [];
    for (const [slot, s] of Object.entries(slots)) {
        if (fadeOutActive(s.fade, serverNow)) {
            const { from } = s.fade;
            players.push({ key: playerKey(slot, from.source, from.lane), slot, state: fadingState(s.fade), gain: from.gain, fade: s.fade, direction: 'out' });
        }
        if (s.mediaId) players.push({ key: playerKey(slot, s.source, s.lane), slot, state: s, gain: s.gain, fade: s.fade, direction: 'in', main: true });
    }
    return players;
}

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
    const [volumeSettings, setVolumeSettings] = usePersistedState(PLATFORM_SCOPE, 'audio', { defaults: VOLUME_DEFAULTS });
    const [settings, setSettings] = usePersistedState(getSystemFromPath(), 'audio', { defaults: LAYOUT_DEFAULTS });

    const volumes = normalizeVolumes(volumeSettings.volumes);
    const update = (patch) => setSettings(prev => ({ ...prev, ...patch }));
    const togglePanel = () => {
        if (!settings.panelOpen) setOpenedByUser(true);
        update({ panelOpen: !settings.panelOpen });
    };

    // Remontées du lecteur du MJ : durée connue, vidéo illisible (§11.3)
    const report = useCallback((action, payload) => { sendCommand({ action, ...payload }); }, [sendCommand]);

    // Fin du dernier fondu en cours (heure du serveur) : un rendu à ce moment démonte le lecteur sortant
    const { getServerNow } = audio;
    const [, setFadeTick] = useState(0);
    const fadeEnd = Math.max(0, ...Object.values(audio.state?.slots ?? {}).map(s => (s.fade?.from ? s.fade.at + s.fade.duration : 0)));
    useEffect(() => {
        const remaining = fadeEnd - getServerNow();
        if (!fadeEnd || remaining <= 0) return undefined;
        const id = setTimeout(() => setFadeTick(t => t + 1), remaining + 50);
        return () => clearTimeout(id);
    }, [fadeEnd, getServerNow]);

    if (!sessionId || !audio.loaded) return null;
    if (!audio.enabled && !isGM) return null;

    const slots = audio.enabled ? (audio.state?.slots ?? {}) : {};
    const music = slots.music;
    // Joueurs : titre de la musique seulement, sauf si le MJ le masque (S-11, Q-28) ; le MJ le voit toujours
    const musicTitle = music?.mediaId && (isGM || !audio.hideTitle) ? music.title : null;
    const playing = Object.values(slots).some(s => s.status === 'playing');

    return (
        <>
            {slotPlayers(slots, getServerNow()).map(p => (
                <SlotPlayer
                    // Changer de source ou passer un fondu remonte le lecteur (§14.3, §15.6)
                    key={p.key}
                    slot={p.slot}
                    slotState={p.state}
                    getServerNow={getServerNow}
                    tolerance={audio.tolerance}
                    unlocked={unlocked}
                    volume={slotVolume(p.slot, p.gain, volumes)}
                    onReport={isGM && p.main ? report : undefined}
                    fade={p.fade}
                    fadeDirection={p.direction}
                />
            ))}

            <AudioPlayerWidget
                enabled={audio.enabled}
                musicTitle={musicTitle}
                playing={playing}
                unlocked={unlocked}
                onUnlock={() => setUnlocked(true)}
                volumes={volumes}
                onVolumesChange={next => setVolumeSettings(prev => ({ ...prev, volumes: next }))}
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

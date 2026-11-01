// src/client/src/components/audio/AudioScenesMenu.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Menu des boutons préréglés (documentations/spec_audio.md §12.5, §12.6), le même
// partout : panneau ouvert (« Scènes ▾ »), barre du panneau réduit, onglet Session
// (bascule « Musique ▾ » d'AudioSessionToggle).
// Contenu : les boutons (dernière scène lancée cochée, en erreur grisés), STOP,
// « Enregistrer ce qui joue… », « Modifier les scènes… », puis les éléments propres
// à l'appelant (`extraItems`). Menu générique (.vtt-menu, habillé par le slug),
// rendu dans l'emplacement à modales (RowMenu).
//
//   <AudioScenesMenu scenes={useAudioButtons(id)} audio={useAudioSession(id)}
//                    trigger={(props) => <button {...props}>Scènes ▾</button>} />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import { RowMenu, MenuItem, MenuLabel, MenuSeparator } from './panel/RowMenu.jsx';
import { SceneNameDialog, ScenesDialog, buttonSummary } from './panel/ScenesDialog.jsx';
import { MAX_AUDIO_BUTTONS } from '../../hooks/useAudioButtons.js';

/**
 * @param {object}   props
 * @param {object}   props.scenes      useAudioButtons(sessionId)
 * @param {object}   props.audio       useAudioSession(sessionId) : activation, état (dernière scène, ce qui joue), commandes
 * @param {(props: object) => React.ReactNode} props.trigger bouton déclencheur (reçoit onClick et les attributs ARIA)
 * @param {(close: Function) => React.ReactNode} [props.extraItems] éléments en fin de menu
 */
const AudioScenesMenu = ({ scenes, audio, trigger, extraItems }) => {
    const [anchor, setAnchor] = useState(null);
    const [dialog, setDialog] = useState(null);   // 'name' | 'edit' | null
    const close = useCallback(() => setAnchor(null), []);

    const slots = Object.values(audio.state?.slots ?? {});
    const playing = slots.some(s => s.trackId);
    const lastId = audio.state?.lastButtonId ?? null;
    const full = scenes.buttons.length >= MAX_AUDIO_BUTTONS;

    const saveScene = async (label) => { if (await scenes.saveScene(label)) setDialog(null); };
    const openDialog = (name) => { close(); scenes.clearError(); setDialog(name); };

    return (
        <>
            {trigger({
                onClick: (e) => setAnchor(anchor ? null : e.currentTarget),
                'aria-haspopup': 'menu',
                'aria-expanded': !!anchor,
            })}
            {anchor && (
                <RowMenu anchor={anchor} onClose={close}>
                    {!audio.enabled && <MenuLabel>Musique désactivée</MenuLabel>}
                    {scenes.error && <MenuLabel>{scenes.error}</MenuLabel>}
                    {scenes.buttons.length === 0 && <MenuLabel>Aucune scène : montez un mélange, puis « Enregistrer ce qui joue ».</MenuLabel>}
                    {scenes.buttons.map(b => (
                        <MenuItem key={b.id} checked={lastId === b.id} disabled={b.broken || !audio.enabled}
                                  hint={b.mode === 'scene' ? undefined : buttonSummary(b)}
                                  title={b.broken ? 'Playlist vide' : undefined}
                                  onSelect={() => { close(); scenes.run(b.id); }}>
                            {b.broken ? `⚠ ${b.label}` : b.label}
                        </MenuItem>
                    ))}
                    <MenuSeparator />
                    <MenuItem danger disabled={!audio.enabled || !playing} onSelect={() => { close(); audio.sendCommand({ action: 'stopAll' }); }}>
                        STOP (tout arrêter)
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem disabled={!playing || full} hint={full ? `${MAX_AUDIO_BUTTONS} au plus` : undefined}
                              title={!playing ? 'Rien ne joue' : undefined} onSelect={() => openDialog('name')}>
                        Enregistrer ce qui joue…
                    </MenuItem>
                    <MenuItem disabled={scenes.buttons.length === 0} onSelect={() => openDialog('edit')}>Modifier les scènes…</MenuItem>
                    {extraItems?.(close)}
                </RowMenu>
            )}
            {dialog === 'name' && (
                <SceneNameDialog count={scenes.buttons.length} error={scenes.error} onSave={saveScene} onClose={() => setDialog(null)} />
            )}
            {dialog === 'edit' && <ScenesDialog scenes={scenes} canCapture={playing} onClose={() => setDialog(null)} />}
        </>
    );
};

export default AudioScenesMenu;

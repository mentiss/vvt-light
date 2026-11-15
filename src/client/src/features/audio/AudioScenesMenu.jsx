// src/client/src/features/audio/AudioScenesMenu.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Menu des boutons préréglés (documentations/plateforme/spec_audio.md §12.5, §15.7),
// le même partout : panneau ouvert (« Scènes ▾ »), barre du panneau réduit, onglet
// Session (bascule « Musique ▾ » d'AudioSessionToggle).
// Contenu : les boutons (dernière scène lancée cochée, en erreur grisés), STOP,
// « Nouveau bouton… », « Enregistrer ce qui joue… », « Modifier les scènes… », puis
// les éléments propres à l'appelant (`extraItems`). Création et modification passent
// par la fenêtre d'édition (ButtonEditor). Menu générique (.vtt-menu, habillé par le
// slug), rendu dans l'emplacement à modales (RowMenu).
//
//   <AudioScenesMenu scenes={useAudioButtons(id)} audio={useAudioSession(id)}
//                    trigger={(props) => <button {...props}>Scènes ▾</button>} />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import { RowMenu, MenuItem, MenuLabel, MenuSeparator } from './panel/RowMenu.jsx';
import { ButtonEditor, ScenesDialog } from './panel/ScenesDialog.jsx';
import { MAX_AUDIO_BUTTONS } from './hooks/useAudioButtons.js';
import { buttonSummary, draftFromActions, draftFromState, emptyDraft } from './tools/audioButtons.js';

/**
 * @param {object}   props
 * @param {object}   props.scenes      useAudioButtons(sessionId)
 * @param {object}   props.audio       useAudioSession(sessionId) : activation, état (dernière scène, ce qui joue), commandes
 * @param {(props: object) => React.ReactNode} props.trigger bouton déclencheur (reçoit onClick et les attributs ARIA)
 * @param {(close: Function) => React.ReactNode} [props.extraItems] éléments en fin de menu
 */
const AudioScenesMenu = ({ scenes, audio, trigger, extraItems }) => {
    const [anchor, setAnchor] = useState(null);
    const [listOpen, setListOpen] = useState(false);
    const [editor, setEditor] = useState(null);   // { button?: bouton modifié, initial } | null
    const close = useCallback(() => setAnchor(null), []);

    const slots = Object.values(audio.state?.slots ?? {});
    const playing = slots.some(s => s.trackId);
    const lastId = audio.state?.lastButtonId ?? null;
    const full = scenes.buttons.length >= MAX_AUDIO_BUTTONS;
    const fullHint = full ? `${MAX_AUDIO_BUTTONS} au plus` : undefined;

    const openEditor = (next) => { close(); scenes.clearError(); setEditor(next); };
    const save = async (button) => {
        const ok = editor.button ? await scenes.update(editor.button.id, button) : await scenes.create(button);
        if (ok) setEditor(null);
    };

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
                    {scenes.buttons.length === 0 && <MenuLabel>Aucune scène : « Nouveau bouton… », « Enregistrer ce qui joue… », ou « Créer un bouton… » sur un titre de la bibliothèque.</MenuLabel>}
                    {scenes.buttons.map(b => (
                        <MenuItem key={b.id} checked={lastId === b.id} disabled={b.broken || !audio.enabled}
                                  hint={buttonSummary(b.actions)}
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
                    <MenuItem disabled={full} hint={fullHint}
                              onSelect={() => openEditor({ initial: { label: `Scène ${scenes.buttons.length + 1}`, fade: false, draft: emptyDraft() } })}>
                        Nouveau bouton…
                    </MenuItem>
                    <MenuItem disabled={!playing || full} hint={fullHint} title={!playing ? 'Rien ne joue' : undefined}
                              onSelect={() => openEditor({ initial: { label: `Scène ${scenes.buttons.length + 1}`, fade: false, draft: draftFromState(audio.state?.slots) } })}>
                        Enregistrer ce qui joue…
                    </MenuItem>
                    <MenuItem disabled={scenes.buttons.length === 0} onSelect={() => { close(); scenes.clearError(); setListOpen(true); }}>Modifier les scènes…</MenuItem>
                    {extraItems?.(close)}
                </RowMenu>
            )}
            {listOpen && (
                <ScenesDialog scenes={scenes} onClose={() => setListOpen(false)}
                              onEdit={button => openEditor({ button, initial: { label: button.label, fade: !!button.actions?.fade, draft: draftFromActions(button.actions) } })} />
            )}
            {editor && (
                <ButtonEditor sessionId={scenes.sessionId} title={editor.button ? `Modifier « ${editor.button.label} »` : 'Nouveau bouton'}
                              submitLabel={editor.button ? 'Enregistrer' : 'Créer'} initial={editor.initial} audioState={audio.state}
                              error={scenes.error} onSave={save} onClose={() => setEditor(null)} />
            )}
        </>
    );
};

export default AudioScenesMenu;

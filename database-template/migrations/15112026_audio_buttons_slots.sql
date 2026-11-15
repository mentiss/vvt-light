-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/15112026_audio_buttons_slots.sql
-- Base du module audio : boutons de la musique piste par piste
-- Spec : documentations/plateforme/spec_audio.md (§15.4)
--
--   • Données seulement, aucune structure ne change.
--   • Les boutons ciblés prennent la forme des scènes : { slots: { <piste>: entrée } },
--     les autres pistes absentes (« Ne pas toucher »).
--       - sur un titre : { trackId, playlistId, start? }, sans mode (la piste
--         garde le sien, comme avant) ;
--       - sur une playlist : { playlistId, mode: 'shuffle' | 'playlist' }.
--   • audio_buttons.mode passe à 'scene' partout (colonne gardée, plus lue).
--   • Les scènes ne changent pas.
--
-- systems: audio
-- ═════════════════════════════════════════════════════════════════════════════

-- Boutons ciblés sur un titre (json() garde l'objet construit par le CASE comme du JSON)
UPDATE audio_buttons
SET actions = json_object('slots', json_object(
        json_extract(actions, '$.slot'),
        json(CASE
            WHEN json_extract(actions, '$.start') IS NULL THEN json_object(
                'trackId', json_extract(actions, '$.trackId'),
                'playlistId', (SELECT t.playlist_id FROM audio_tracks t WHERE t.id = json_extract(audio_buttons.actions, '$.trackId')))
            ELSE json_object(
                'trackId', json_extract(actions, '$.trackId'),
                'playlistId', (SELECT t.playlist_id FROM audio_tracks t WHERE t.id = json_extract(audio_buttons.actions, '$.trackId')),
                'start', json_extract(actions, '$.start'))
        END))),
    mode = 'scene'
WHERE mode = 'target' AND json_extract(actions, '$.trackId') IS NOT NULL;

-- Boutons ciblés sur une playlist
UPDATE audio_buttons
SET actions = json_object('slots', json_object(
        json_extract(actions, '$.slot'),
        json_object(
            'playlistId', json_extract(actions, '$.playlistId'),
            'mode', CASE WHEN json_extract(actions, '$.shuffle') THEN 'shuffle' ELSE 'playlist' END))),
    mode = 'scene'
WHERE mode = 'target';

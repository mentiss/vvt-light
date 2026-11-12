// src/client/src/features/table/hooks/useTableCharacters.js
// ─────────────────────────────────────────────────────────────────────────────
// Personnages de la table active, côté MJ (spec_session_mj.md §3) : chargement
// des fiches complètes, suivi en direct (characterUpdates de GMPage /
// useGMSession : aucune écoute de socket ici) et envoi partiel (PATCH : seuls
// les champs envoyés changent, le serveur diffuse la mise à jour au joueur).
// Sélection, mode Édition et stats dérivées restent au slug.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetch } from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import { mergeCharacterUpdates } from '../tools/tableCharacters.js';

/**
 * @param {object|null} activeSession     table active ({ id, characters: [{ id }] })
 * @param {object} [characterUpdates]     mises à jour en direct de useGMSession
 * @returns {{ characters: Object<number, object>, order: number[], loading: boolean,
 *             patchCharacter: (id: number, patch: object) => Promise<object|null> }}
 */
export function useTableCharacters(activeSession, characterUpdates) {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const [characters, setCharacters] = useState({});
    const [loading, setLoading] = useState(false);
    const charactersRef = useRef(characters);   // état courant, pour le retour arrière
    useEffect(() => { charactersRef.current = characters; }, [characters]);
    const order = (activeSession?.characters ?? []).map(c => c.id).filter(id => characters[id]);

    // Chargement des fiches complètes, à chaque changement de table ou de composition
    useEffect(() => {
        if (!activeSession?.characters?.length) { setCharacters({}); setLoading(false); return undefined; }
        let cancelled = false;
        setLoading(true);
        (async () => {
            const loaded = {};
            await Promise.all(activeSession.characters.map(async ({ id }) => {
                try {
                    const r = await fetchWithAuth(`${apiBase}/characters/${id}`);
                    if (r.ok) loaded[id] = await r.json();
                } catch (e) {
                    console.error(`[useTableCharacters] chargement ${id} :`, e);
                }
            }));
            if (!cancelled) { setCharacters(loaded); setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [activeSession, apiBase, fetchWithAuth]);

    // Mises à jour en direct : seulement les personnages de la table
    useEffect(() => {
        setCharacters(prev => mergeCharacterUpdates(prev, characterUpdates));
    }, [characterUpdates]);

    // Envoi partiel : affichage immédiat, fiche du serveur ensuite, retour arrière en cas d'échec
    const patchCharacter = useCallback(async (id, patch) => {
        const previous = charactersRef.current[id];
        setCharacters(prev => (prev[id] ? { ...prev, [id]: { ...prev[id], ...patch } } : prev));
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
            });
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            const updated = await r.json();
            setCharacters(prev => (prev[id] ? { ...prev, [id]: updated } : prev));
            return updated;
        } catch (e) {
            console.error(`[useTableCharacters] enregistrement ${id} :`, e);
            if (previous) setCharacters(prev => (prev[id] ? { ...prev, [id]: previous } : prev));
            return null;
        }
    }, [apiBase, fetchWithAuth]);

    return { characters, order, loading, patchCharacter };
}

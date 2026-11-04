// src/client/src/systems/nimble/hooks/useTableCharacters.js
// ─────────────────────────────────────────────────────────────────────────────
// Personnages de la table active, côté MJ : chargement des fiches complètes,
// suivi en direct (characterUpdates de GMPage / useGMSession) et enregistrement
// d'un envoi partiel (PATCH : seuls les champs envoyés changent, le serveur
// diffuse la mise à jour au joueur). Repris de vileborn.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { useFetch } from '../../../hooks/useFetch.js';
import { useSystem } from '../../../hooks/useSystem.js';

/**
 * @returns {{ characters: Object<number, object>, order: number[], loading: boolean,
 *             patchCharacter: (id: number, patch: object) => Promise<object|null> }}
 */
export const useTableCharacters = (activeSession, characterUpdates) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const [characters, setCharacters] = useState({});
    const [loading, setLoading] = useState(false);
    const order = (activeSession?.characters ?? []).map(c => c.id).filter(id => characters[id]);

    // Chargement des fiches complètes de la table
    useEffect(() => {
        if (!activeSession?.characters?.length) { setCharacters({}); return undefined; }
        let cancelled = false;
        setLoading(true);
        (async () => {
            const loaded = {};
            await Promise.all(activeSession.characters.map(async ({ id }) => {
                try {
                    const r = await fetchWithAuth(`${apiBase}/characters/${id}`);
                    if (r.ok) loaded[id] = await r.json();
                } catch (e) {
                    console.error(`[nimble/gm] chargement ${id} :`, e);
                }
            }));
            if (!cancelled) { setCharacters(loaded); setLoading(false); }
        })();
        return () => { cancelled = true; };
        // fetchWithAuth volontairement hors dépendances (référence instable)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSession, apiBase]);

    // Mises à jour en direct : seulement les personnages de la table
    useEffect(() => {
        if (!characterUpdates) return;
        setCharacters(prev => {
            let changed = false;
            const next = { ...prev };
            for (const [idStr, update] of Object.entries(characterUpdates)) {
                const id = Number(idStr);
                if (!prev[id]) continue;
                next[id] = update.type === 'full' ? update.data : { ...prev[id], ...update.data };
                changed = true;
            }
            return changed ? next : prev;
        });
    }, [characterUpdates]);

    // Envoi partiel, puis la fiche renvoyée par le serveur remplace la locale
    const patchCharacter = useCallback(async (id, patch) => {
        setCharacters(prev => (prev[id] ? { ...prev, [id]: { ...prev[id], ...patch } } : prev));   // affichage immédiat
        try {
            const r = await fetchWithAuth(`${apiBase}/characters/${id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
            });
            if (!r.ok) return null;
            const updated = await r.json();
            setCharacters(prev => ({ ...prev, [id]: updated }));
            return updated;
        } catch (e) {
            console.error(`[nimble/gm] enregistrement ${id} :`, e);
            return null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiBase]);

    return { characters, order, loading, patchCharacter };
};

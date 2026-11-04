// src/client/src/systems/vileborn/hooks/usePlayerPatch.js
// ─────────────────────────────────────────────────────────────────────────────
// Enregistrement d'un patch par le joueur. Cas courant : onCharacterUpdate
// (PlayerPage fait le PUT). Un patch qui ajoute des lignes de sous-table (id
// temporaire « new-… », ou sans id) passe par un PATCH direct, puis la fiche
// renvoyée par le serveur (ids réels) remplace la locale : sinon, hors table,
// la ligne serait insérée de nouveau au PUT suivant.
// ─────────────────────────────────────────────────────────────────────────────

import { useSystem } from '../../../hooks/useSystem.js';
import { useFetch } from '../../../hooks/useFetch.js';

const addsRows = (patch) => Object.values(patch).some(v => Array.isArray(v) && v.some(r => r && (!r.id || typeof r.id === 'string')));

export const usePlayerPatch = (character, onCharacterUpdate) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();

    return (patch) => {
        if (!addsRows(patch)) { onCharacterUpdate(prev => ({ ...prev, ...patch })); return; }
        const body = Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, Array.isArray(v)
            ? v.map(r => (typeof r?.id === 'string' ? { ...r, id: undefined } : r)) : v]));
        fetchWithAuth(`${apiBase}/characters/${character.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
            .then(r => (r.ok ? r.json() : null))
            .then(updated => updated && onCharacterUpdate(updated))
            .catch(err => console.error('[vileborn] enregistrement :', err));
    };
};

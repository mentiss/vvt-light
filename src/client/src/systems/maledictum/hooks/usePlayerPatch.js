// src/client/src/systems/maledictum/hooks/usePlayerPatch.js
// ─────────────────────────────────────────────────────────────────────────────
// Enregistrement d'un patch par le joueur. Cas courant : onCharacterUpdate
// (PlayerPage fait le PUT). Un patch qui ajoute des lignes d'inventaire (id
// temporaire « new-… », ou sans id) passe par un PATCH direct, puis la fiche
// renvoyée par le serveur (ids réels) remplace la locale : sinon la ligne
// serait insérée de nouveau au PUT suivant. (Modèle : vileborn.)
// ─────────────────────────────────────────────────────────────────────────────

import { useSystem } from '@/app/hooks/useSystem.js';
import { useFetch } from '@/app/hooks/useFetch.js';

const addsRows = (patch) => Object.values(patch).some(v => Array.isArray(v) && v.some(r => r && typeof r === 'object' && 'kind' in r && (!r.id || typeof r.id === 'string')));

export const usePlayerPatch = (character, onCharacterUpdate) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();

    return (patch) => {
        if (!patch || !Object.keys(patch).length) return;
        if (!addsRows(patch)) { onCharacterUpdate(prev => ({ ...prev, ...patch })); return; }
        const body = { ...patch, items: patch.items.map(r => (typeof r?.id === 'string' ? { ...r, id: undefined } : r)) };
        fetchWithAuth(`${apiBase}/characters/${character.id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
            .then(r => (r.ok ? r.json() : null))
            .then(updated => updated && onCharacterUpdate(updated))
            .catch(err => console.error('[maledictum] enregistrement :', err));
    };
};

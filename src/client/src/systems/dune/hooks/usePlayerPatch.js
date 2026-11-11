// src/client/src/systems/dune/hooks/usePlayerPatch.js
// Enregistrement des actions sur une fiche (joueur ou MJ).
//   - patch(fields) : fusion dans la fiche la plus récente, puis onCharacterUpdate
//     (la page fait le PUT) ;
//   - addRow('items' | 'talents', row) : POST de la ligne, qui revient avec son id
//     réel, puis ajout à la fiche la plus récente. Sans id, la synchronisation des
//     sous-tables l'insérerait de nouveau au PUT suivant ; et deux ajouts rapides
//     (catalogue) ne s'écrasent pas.

import { useCallback } from 'react';
import { useSystem } from '@/app/hooks/useSystem.js';
import { useFetch }  from '@/app/hooks/useFetch.js';

/**
 * @param {object}   character
 * @param {Function} onCharacterUpdate (character | (prev) => character) => void
 * @returns {{ patch(fields), addRow(field, row) }}
 */
export function usePlayerPatch(character, onCharacterUpdate) {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const characterId = character?.id;

    const patch = useCallback((fields) => {
        onCharacterUpdate(prev => ({ ...prev, ...fields }));
    }, [onCharacterUpdate]);

    const addRow = useCallback((field, row) => {
        fetchWithAuth(`${apiBase}/characters/${characterId}/${field}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(row),
        })
            .then(r => (r.ok ? r.json() : null))
            .then(created => created && onCharacterUpdate(prev => ({ ...prev, [field]: [...(prev[field] ?? []), created] })))
            .catch(err => console.error(`[dune] ajout (${field}) :`, err));
        // fetchWithAuth exclu des dépendances (référence instable, src/client/CLAUDE.md)
    }, [characterId, onCharacterUpdate, apiBase]);

    return { patch, addRow };
}

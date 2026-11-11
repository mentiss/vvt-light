// src/client/src/systems/fabula/hooks/useGroupItemUse.js
// ─────────────────────────────────────────────────────────────────────────────
// Utiliser un objet de la fiche de groupe (spec_fabula.md §7, Q-7, Q-8) : retire
// ses PI au personnage (patch immédiat de la fiche) et laisse une trace dans
// l'historique de la table (« Lyra utilise un Remède, −3 PI »), sans jet. L'effet
// (soins, état) reste à appliquer à la main. Le Fragment élémentaire porte le type
// de dégâts choisi.
//
// const useItem = useGroupItemUse({ character, sessionId, onQuickUpdate });
// useItem(item, element?) → true si utilisé, false si PI insuffisants
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useFetch } from '@/app/hooks/useFetch.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import { recordHistoryEntry } from '@/features/dice/tools/diceHistory.js';
import { FRAGMENT_ELEMENTS } from '../config/groupItems.js';

const characterName = (c) => [c?.prenom, c?.nom].filter(Boolean).join(' ') || 'Personnage';

export const useGroupItemUse = ({ character, sessionId, onQuickUpdate }) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();

    return useCallback(async (item, element = null) => {
        const pi = character?.piActuel ?? 0;
        if (!item || pi < item.pi) return false;
        onQuickUpdate?.({ piActuel: pi - item.pi });
        const elementLabel = FRAGMENT_ELEMENTS.find(e => e.key === element)?.label ?? null;
        const result = {
            type: 'objet',
            nom: item.nom,
            pi: item.pi,
            effet: item.effet,
            element: elementLabel,
            label: `Utilise : ${item.nom}${elementLabel ? ` (${elementLabel.toLowerCase()})` : ''}`,
        };
        // Entrée sans dé : pas de notation (spec_diceengine_v2.md, H-2)
        await recordHistoryEntry(fetchWithAuth, apiBase, {
            sessionId,
            characterId:   character.id,
            characterName: characterName(character),
            rollType:      'fabula_objet',
            label:         result.label,
            result,
        });
        return true;
        // fetchWithAuth volontairement hors dépendances (référence instable)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [character, sessionId, onQuickUpdate, apiBase]);
};

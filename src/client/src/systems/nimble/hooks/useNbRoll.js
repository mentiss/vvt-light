// src/client/src/systems/nimble/hooks/useNbRoll.js
// ─────────────────────────────────────────────────────────────────────────────
// Lancement d'un jet par le moteur de dés de la plateforme (diceEngine v2), avec
// les hooks du slug (config.jsx) : le seul endroit qui monte le contexte
// (apiBase, fetch authentifié) et suit l'état du jet (fiche, fenêtres, MJ).
//
// const { launch, rolling, error, entry } = useNbRoll();
// launch({ characterId, characterName, sessionId, label, type, systemData, persistHistory? })
//   → résultat d'afterRoll, ou null en cas d'erreur (message dans error) ;
// entry : dernier jet au format d'une entrée d'historique (rendu NbHistoryEntry).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { roll } from '../../../tools/diceEngine.js';
import { useSystem } from '../../../hooks/useSystem.js';
import { useFetch } from '../../../hooks/useFetch.js';
import nimbleConfig, { ROLL_TYPES } from '../config.jsx';

export const useNbRoll = () => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const [rolling, setRolling] = useState(false);
    const [error, setError] = useState(null);
    const [entry, setEntry] = useState(null);

    const launch = async ({ type, systemData, ...params }) => {
        if (rolling) return null;
        setRolling(true);
        setError(null);
        try {
            const ctx = {
                apiBase, fetchFn: fetchWithAuth, characterId: null, sessionId: null, ...params,
                rollType: ROLL_TYPES[type], systemData: { ...systemData, type },
            };
            const result = await roll(nimbleConfig.dice.buildNotation(ctx), ctx, nimbleConfig.dice);
            setEntry({ id: Date.now(), roll_type: ctx.rollType, roll_result: result, character_name: ctx.characterName, created_at: null });
            return result;
        } catch (err) {
            setError(err.message ?? 'Erreur lors du jet');
            return null;
        } finally {
            setRolling(false);
        }
    };

    return { launch, rolling, error, entry, clear: () => setEntry(null) };
};

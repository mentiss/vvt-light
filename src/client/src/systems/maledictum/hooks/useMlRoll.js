// src/client/src/systems/maledictum/hooks/useMlRoll.js
// ─────────────────────────────────────────────────────────────────────────────
// Lancement d'un jet par le moteur de dés de la plateforme (diceEngine v2), avec
// les hooks du slug (config.jsx) : le seul endroit qui monte le contexte
// (apiBase, fetch authentifié) et suit l'état du jet (fiche, fenêtres, assistant, MJ).
//
// const { launch, rolling, error, entry } = useMlRoll();
// launch({ characterId, characterName, sessionId, label, type, systemData, persistHistory? })
//   → résultat d'afterRoll, ou null en cas d'erreur (message dans error) ;
// entry : dernier jet au format d'une entrée d'historique (rendu MlHistoryEntry).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { roll } from '@/features/dice/tools/diceEngine.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import { useFetch } from '@/app/hooks/useFetch.js';
import maledictumConfig, { ROLL_TYPES } from '../config.jsx';

export const useMlRoll = () => {
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
            const result = await roll(maledictumConfig.dice.buildNotation(ctx), ctx, maledictumConfig.dice);
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

// src/client/src/systems/woddavampire/hooks/useVdaRoll.js
// ─────────────────────────────────────────────────────────────────────────────
// Lancement d'un jet par le moteur de dés de la plateforme (diceEngine v2), avec
// les hooks du slug (config.jsx) : un seul endroit pour monter le contexte
// (apiBase, fetch authentifié) et suivre l'état du jet.
//
// const { launch, rolling, error, entry } = useVdaRoll();
// launch({ characterId, characterName, sessionId, label, rollType, systemData, persistHistory? })
//   → résultat d'afterRoll, ou null en cas d'erreur (message dans error) ;
// entry : dernier jet au format d'une entrée d'historique (rendu VdaHistoryEntry).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { roll } from '@/features/dice/tools/diceEngine.js';
import { useSystem } from '@/app/hooks/useSystem.js';
import { useFetch } from '@/app/hooks/useFetch.js';
import vdaConfig from '../config.jsx';

export const useVdaRoll = () => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const [rolling, setRolling] = useState(false);
    const [error, setError] = useState(null);
    const [entry, setEntry] = useState(null);

    const launch = async (params) => {
        if (rolling) return null;
        setRolling(true);
        setError(null);
        try {
            const ctx = { apiBase, fetchFn: fetchWithAuth, characterId: null, sessionId: null, ...params };
            const result = await roll(vdaConfig.dice.buildNotation(ctx), ctx, vdaConfig.dice);
            setEntry({ id: Date.now(), roll_type: ctx.rollType, roll_result: result, created_at: null });
            return result;
        } catch (err) {
            setError(err.message ?? 'Erreur lors du jet');
            return null;
        } finally {
            setRolling(false);
        }
    };

    return { launch, rolling, error, entry };
};

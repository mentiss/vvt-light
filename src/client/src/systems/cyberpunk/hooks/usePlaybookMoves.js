// src/client/src/systems/cyberpunk/hooks/usePlaybookMoves.js
// Manœuvres d'un ou de plusieurs playbooks (route publique GET /moves/playbook/:pb,
// qui renvoie aussi les manœuvres de base), chargées une fois par page et partagées
// entre les étapes de la création (archétype, stats, manœuvres).
import { useEffect, useState } from 'react';

const cache = new Map();   // `${apiBase}|${playbook}` → Promise<moves[]>

const load = (apiBase, playbook) => {
    const key = `${apiBase}|${playbook}`;
    if (!cache.has(key)) {
        cache.set(key, fetch(`${apiBase}/moves/playbook/${encodeURIComponent(playbook)}`)
            .then(r => (r.ok ? r.json() : []))
            .then(list => (Array.isArray(list) ? list : []))
            .catch(() => { cache.delete(key); return []; }));
    }
    return cache.get(key);
};

/**
 * @param {string} apiBase
 * @param {string[]} playbooks
 * @returns {{ moves: Array, loaded: boolean }}  manœuvres de ces playbooks (et de base), sans doublon
 */
export function usePlaybookMoves(apiBase, playbooks) {
    const key = playbooks.filter(Boolean).join(',');
    const [state, setState] = useState({ key: null, moves: [] });

    useEffect(() => {
        if (!key) return undefined;
        let alive = true;
        Promise.all(key.split(',').map(pb => load(apiBase, pb))).then(lists => {
            if (!alive) return;
            const byId = new Map(lists.flat().map(m => [m.id, m]));
            setState({ key, moves: [...byId.values()] });
        });
        return () => { alive = false; };
    }, [apiBase, key]);

    return { moves: state.key === key ? state.moves : [], loaded: !key || state.key === key };
}

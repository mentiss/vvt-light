// src/client/src/systems/cyberpunk/gm/useOperation.js
// ─────────────────────────────────────────────────────────────────────────────
// Données de l'onglet Opération (spec_cyberpunk.md §6) : horloges et menaces de la
// table active (et de la campagne), avec leurs actions. Partagé par l'onglet et par
// les horloges épinglées de la barre d'onglets (GMApp). Réservé au MJ.
// Routes : /api/cyberpunk/clocks, /api/cyberpunk/threats (inchangées).
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';

export const useOperation = ({ fetchWithAuth, apiBase, sessionId }) => {
    const [clocks,  setClocks]  = useState([]);
    const [threats, setThreats] = useState([]);
    const [loading, setLoading] = useState(true);

    const query = sessionId ? `?sessionId=${sessionId}` : '';

    // fetchWithAuth hors des dépendances : référence instable (src/client/CLAUDE.md)
    const load = useCallback(async () => {
        if (!apiBase) return;
        try {
            const [cr, tr] = await Promise.all([
                fetchWithAuth(`${apiBase}/clocks${query}`).then(r => (r.ok ? r.json() : [])),
                fetchWithAuth(`${apiBase}/threats${query}`).then(r => (r.ok ? r.json() : [])),
            ]);
            setClocks(Array.isArray(cr) ? cr : []);
            setThreats(Array.isArray(tr) ? tr : []);
        } catch {
            setClocks([]);
            setThreats([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiBase, query]);

    useEffect(() => { load(); }, [load]);

    const call = useCallback(async (path, method, body) => {
        await fetchWithAuth(`${apiBase}${path}`, { method, body: body === undefined ? undefined : JSON.stringify(body) });
        await load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiBase, load]);

    // ── Horloges ──
    const setClock = (clock, value) => call(`/clocks/${clock.id}/advance`, 'PATCH', { delta: value - clock.current });
    const pinClock = (clock) => call(`/clocks/${clock.id}/pin`, 'PATCH');
    const deleteClock = (clock) => call(`/clocks/${clock.id}`, 'DELETE');
    const saveClock = (form, existing) => {
        const body = {
            name: form.name, segments: form.segments, consequence: form.consequence, icon: form.icon,
            threatIds: form.threatIds, sessionId: form.scope === 'session' ? sessionId : null,
        };
        return existing ? call(`/clocks/${existing.id}`, 'PUT', body) : call('/clocks', 'POST', body);
    };

    // Création rapide depuis le formulaire d'une menace : renvoie l'horloge créée
    const createClock = async ({ name, segments, scope }) => {
        const r = await fetchWithAuth(`${apiBase}/clocks`, {
            method: 'POST',
            body: JSON.stringify({ name, segments, icon: 'cp:clock', sessionId: scope === 'session' ? sessionId : null }),
        });
        if (!r.ok) return null;
        const created = await r.json();
        await load();
        return created;
    };

    // ── Menaces ──
    const pinThreat = (threat) => call(`/threats/${threat.id}/pin`, 'PATCH');
    const setThreatStatus = (threat, status) => call(`/threats/${threat.id}/status`, 'PATCH', { status });
    const deleteThreat = (threat) => call(`/threats/${threat.id}`, 'DELETE');
    const saveThreat = (form, existing) => {
        const body = {
            name: form.name, type: form.type, impulse: form.impulse, moves: form.moves, notes: form.notes,
            icon: form.icon, status: form.status, clockIds: form.clockIds,
            sessionId: form.scope === 'session' ? sessionId : null,
        };
        return existing ? call(`/threats/${existing.id}`, 'PUT', body) : call('/threats', 'POST', body);
    };
    const reorderThreats = (ordered) => {
        setThreats(ordered);   // optimiste
        return call('/threats/reorder', 'PATCH', { items: ordered.map((t, i) => ({ id: t.id, sortOrder: i })) });
    };

    return {
        clocks, threats, loading, reload: load,
        setClock, pinClock, deleteClock, saveClock, createClock,
        pinThreat, setThreatStatus, deleteThreat, saveThreat, reorderThreats,
    };
};

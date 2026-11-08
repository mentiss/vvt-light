// src/client/src/systems/vileborn/hooks/useChallenges.js
// ─────────────────────────────────────────────────────────────────────────────
// Défis côté MJ (spec_vileborn_defis.md §II.3, §II.4) : bibliothèque (routes
// /challenges) et défis en cours de la table active (/session-challenges), par
// HTTP. Aucune écoute socket : seul le MJ les suit.
//
// const ch = useChallenges(sessionId);
// ch.library, ch.active, ch.loading, ch.error
// ch.saveChallenge(sheet, id?) → fiche enregistrée | null   (sans id : création)
// ch.deleteChallenge(id), ch.launch(challengeId) → défi en cours | null
// ch.patchActive(id, { progress?, adjust?, notes? }) (affichage immédiat), ch.removeActive(id)
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { useFetch } from '../../../hooks/useFetch.js';
import { useSystem } from '../../../hooks/useSystem.js';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const useChallenges = (sessionId) => {
    const { apiBase } = useSystem();
    const fetchWithAuth = useFetch();
    const [library, setLibrary] = useState([]);
    const [active, setActive] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Appel JSON ; l'erreur du serveur devient le message affiché
    const call = useCallback(async (path, options = {}) => {
        setError(null);
        try {
            const r = await fetchWithAuth(`${apiBase}${path}`, options);
            const body = await r.json().catch(() => null);
            if (!r.ok) { setError(body?.error ?? 'Erreur du serveur'); return null; }
            return body;
        } catch (e) {
            console.error('[vileborn/défis]', e);
            setError('Serveur injoignable');
            return null;
        }
    }, [apiBase, fetchWithAuth]);

    // Bibliothèque : une fois
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const list = await call('/challenges');
            if (!cancelled) { setLibrary(list ?? []); setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [call]);

    // Défis en cours : à chaque changement de table
    useEffect(() => {
        if (!sessionId) return undefined;
        let cancelled = false;
        (async () => {
            const list = await call(`/session-challenges?sessionId=${sessionId}`);
            if (!cancelled) setActive(list ?? []);
        })();
        return () => { cancelled = true; };
    }, [call, sessionId]);

    const saveChallenge = async (sheet, id = null) => {
        const saved = await call(id ? `/challenges/${id}` : '/challenges', {
            method: id ? 'PUT' : 'POST', headers: JSON_HEADERS, body: JSON.stringify({ sheet }),
        });
        if (saved) setLibrary(prev => (id ? prev.map(c => (c.id === id ? saved : c)) : [...prev, saved])
            .sort((a, b) => a.name.localeCompare(b.name, 'fr')));
        return saved;
    };

    const deleteChallenge = async (id) => {
        const ok = await call(`/challenges/${id}`, { method: 'DELETE' });
        if (ok) {
            setLibrary(prev => prev.filter(c => c.id !== id));
            setActive(prev => prev.map(a => (a.challengeId === id ? { ...a, challengeId: null } : a)));
        }
        return !!ok;
    };

    const launch = async (challengeId) => {
        if (!sessionId) return null;
        const created = await call('/session-challenges', { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify({ sessionId, challengeId }) });
        if (created) setActive(prev => [...prev, created]);
        return created;
    };

    const patchActive = async (id, patch) => {
        setActive(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));   // affichage immédiat
        const saved = await call(`/session-challenges/${id}`, { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(patch) });
        if (saved) setActive(prev => prev.map(a => (a.id === id ? saved : a)));        return saved;
    };

    const removeActive = async (id) => {
        const ok = await call(`/session-challenges/${id}`, { method: 'DELETE' });
        if (ok) setActive(prev => prev.filter(a => a.id !== id));
        return !!ok;
    };

    // Sans table active, aucun défi en cours (la liste d'une table quittée n'est pas montrée)
    return { library, active: sessionId ? active : [], loading, error, saveChallenge, deleteChallenge, launch, patchActive, removeActive };
};

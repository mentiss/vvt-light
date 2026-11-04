// src/client/src/hooks/useBoardImages.js
// ─────────────────────────────────────────────────────────────────────────────
// Images déposées sur le tableau (documentations/spec_tableau.md §10.4) : une
// <image> SVG ne peut pas porter le jeton d'accès. Chaque image est chargée par
// fetchWithAuth, transformée en adresse locale (URL.createObjectURL) et gardée
// pour la vie du composant ; une image ne change jamais. Adresses libérées au démontage.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetch } from './useFetch.js';

/**
 * @param {number|null} sessionId
 * @returns {(imageId: number) => string|null} adresse de l'image, null tant qu'elle se charge
 */
export function useBoardImages(sessionId) {
    const fetchWithAuth = useFetch();
    const fetchRef = useRef(fetchWithAuth);
    useEffect(() => { fetchRef.current = fetchWithAuth; });

    const cacheRef = useRef(new Map());   // imageId → adresse locale | 'loading' | 'error'
    const [, setVersion] = useState(0);

    useEffect(() => {
        const cache = cacheRef.current;
        return () => {
            for (const url of cache.values()) if (url.startsWith('blob:')) URL.revokeObjectURL(url);
            cache.clear();
        };
    }, [sessionId]);

    return useCallback((imageId) => {
        const cache = cacheRef.current;
        const known = cache.get(imageId);
        if (known) return known.startsWith('blob:') ? known : null;
        cache.set(imageId, 'loading');
        fetchRef.current(`/api/board/sessions/${sessionId}/images/${imageId}`)
            .then(res => (res.ok ? res.blob() : Promise.reject(new Error(String(res.status)))))
            .then(blob => cache.set(imageId, URL.createObjectURL(blob)))
            .catch(() => cache.set(imageId, 'error'))
            .finally(() => setVersion(v => v + 1));
        return null;
    }, [sessionId]);
}

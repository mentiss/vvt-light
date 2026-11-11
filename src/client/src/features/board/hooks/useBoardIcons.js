// src/client/src/features/board/hooks/useBoardIcons.js
// ─────────────────────────────────────────────────────────────────────────────
// Icônes du tableau (documentations/spec_tableau.md §10.7) : fichiers statiques
// livrés avec l'application (public/board/icons/), qui ne changent pas entre deux
// releases. Index et contenus gardés en mémoire pour toute la page.
// - useBoardIconIndex() : l'index (recherche, catégories), chargé à la première demande ;
// - useBoardIcons()     : id → contenu SVG à insérer dans le tableau, ou null pendant le chargement.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';
import { svgInner } from '../tools/boardIcons.js';

const BASE = '/board/icons';
const markups = new Map();       // id → contenu SVG | 'loading' | 'error'
const listeners = new Set();
let indexPromise = null;

const notify = () => listeners.forEach(listener => listener());

/** @returns {object|null} index des icônes, null tant qu'il se charge (ou en cas d'échec) */
export function useBoardIconIndex() {
    const [index, setIndex] = useState(null);
    useEffect(() => {
        let cancelled = false;
        indexPromise ??= fetch(`${BASE}/index.json`).then(res => (res.ok ? res.json() : null)).catch(() => null);
        indexPromise.then(data => { if (!cancelled) setIndex(data); });
        return () => { cancelled = true; };
    }, []);
    return index;
}

/** @returns {(id: string) => string|null} */
export function useBoardIcons() {
    const [, setVersion] = useState(0);
    useEffect(() => {
        const listener = () => setVersion(v => v + 1);
        listeners.add(listener);
        return () => listeners.delete(listener);
    }, []);

    return useCallback((id) => {
        const known = markups.get(id);
        if (known) return known === 'loading' || known === 'error' ? null : known;
        markups.set(id, 'loading');
        fetch(`${BASE}/${id}.svg`)
            .then(res => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
            .then(text => markups.set(id, svgInner(text) ?? 'error'))
            .catch(() => markups.set(id, 'error'))
            .finally(notify);
        return null;
    }, []);
}

/** Adresse du fichier d'une icône (aperçu du sélecteur, en masque CSS) */
export const iconUrl = (id) => `${BASE}/${id}.svg`;

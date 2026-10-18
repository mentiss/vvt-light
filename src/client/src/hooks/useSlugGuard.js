// src/client/src/hooks/useSlugGuard.js
// ─────────────────────────────────────────────────────────────────────────────
// Garde-fou « une page = un slug » (spec_plateforme_accueil.md §8) : le theme.css
// d'un slug, une fois chargé, n'est jamais retiré de la page. Une navigation
// interne vers un autre slug (ou vers l'accueil) mélangerait donc deux thèmes :
// on la transforme en chargement complet de la même adresse.
//
// Appelé par les pages racines (HomePage, SystemLayout). Renvoie true quand la
// page doit être rechargée : l'appelant n'affiche alors rien.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Slug de la page chargée ('' pour l'accueil), fixé au premier passage
let loadedScope = null;

const scopeOf = (pathname) => pathname.split('/').filter(Boolean)[0] ?? '';

const useSlugGuard = () => {
    const { pathname, search, hash } = useLocation();
    const scope = scopeOf(pathname);
    const mustReload = loadedScope !== null && scope !== loadedScope;

    useEffect(() => {
        if (loadedScope === null) loadedScope = scope;
        else if (scope !== loadedScope) window.location.assign(pathname + search + hash);
    }, [scope, pathname, search, hash]);

    return mustReload;
};

export default useSlugGuard;

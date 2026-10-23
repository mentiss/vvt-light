// src/client/src/pages/SystemLayout.jsx
// Shell racine pour toutes les routes d'un système.
// Valide le slug via SystemsContext (plus de KNOWN_SYSTEMS statique).
// Charge le thème du slug pour toutes ses pages (accès, erreurs, chargement compris).
// Avant la liste des systèmes et pour un slug inconnu : thème de la plateforme.

import React, {useEffect, useState} from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { useSystems } from '../context/SystemsContext.jsx';
import {applyTheme, loadTheme, saveTheme} from "../tools/utils.js";
import ErrorPage from '../components/platform/ErrorPage.jsx';
import useSlugGuard from '../hooks/useSlugGuard.js';

const THEMES = import.meta.glob('../systems/*/theme.css');

const SystemLayout = () => {
    const { system } = useParams();
    const mustReload = useSlugGuard();
    const { systems, error } = useSystems();
    // Préférence du slug lue dès le premier rendu (pas de passage furtif en jour).
    // Le slug ne change pas sans rechargement (useSlugGuard) : pas besoin de la relire.
    const [darkMode, setDarkMode] = useState(() => (system ? loadTheme(system) : false));

    // Jour / nuit du slug sur <html> (classe .dark et data-theme)
    useEffect(() => {
        applyTheme(darkMode);
    }, [darkMode]);

    // Thème du slug (les pages du slug le chargent aussi : import sans effet s'il l'est déjà)
    const isKnown = !!systems?.some(s => s.slug === system);
    useEffect(() => {
        const key = `../systems/${system}/theme.css`;
        if (isKnown && THEMES[key]) THEMES[key]();
    }, [system, isKnown]);

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        saveTheme(next, system);
    };

    // Arrivée par navigation interne depuis un autre slug ou l'accueil : rechargement en cours
    if (mustReload) return null;

    // Chargement initial
    if (systems === null) {
        return (
            <div className="vtt-platform flex items-center justify-center">
                <div className="text-muted animate-pulse">Chargement…</div>
            </div>
        );
    }

    // Erreur de chargement
    if (error && systems.length === 0) {
        return (
            <ErrorPage
                title="Serveur indisponible"
                message="Impossible de charger les systèmes de jeu. Réessayez dans un instant."
                actions={<button type="button" className="vtt-btn vtt-btn-primary" onClick={() => window.location.reload()}>Réessayer</button>}
            />
        );
    }

    if (!isKnown) {
        return (
            <ErrorPage
                code="404"
                title="Système inconnu"
                message={`Le système « ${system} » n'existe pas sur cette plateforme.`}
            />
        );
    }

    return <Outlet context={{ darkMode, onToggleDarkMode: toggleDarkMode }} />;
};

export default SystemLayout;

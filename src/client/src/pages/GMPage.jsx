// src/client/src/pages/GMPage.jsx
// Shell GM : auth + chargement dynamique de GMView via import.meta.glob.
// useGMSession gère les sockets génériques (session active, présence en ligne,
// mises à jour personnage temps réel).

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useGMSession } from '../hooks/useGMSession.js';
import CodeModal from '../components/modals/CodeModal.jsx';
import DiceAnimationOverlay from "../components/shared/DiceAnimationOverlay.jsx";
import LoadingScreen from "../components/gm/layout/LoadingScreen.jsx";
import SlugPage      from '../components/platform/SlugPage.jsx';
import SystemBrand   from '../components/platform/SystemBrand.jsx';
import ErrorPage     from '../components/platform/ErrorPage.jsx';
import { useSystem } from '../hooks/useSystem.js';

const SYSTEM_GM_APPS = import.meta.glob('../systems/*/GMApp.jsx');
const THEMES    = import.meta.glob('../systems/*/theme.css');

const gmLazyCache = {};
const getGMLazyComponent = (key) => {
    if (!gmLazyCache[key]) {
        gmLazyCache[key] = React.lazy(SYSTEM_GM_APPS[key]);
    }
    return gmLazyCache[key];
};

const GMPage = () => {
    const { system }                     = useParams();
    const { darkMode, onToggleDarkMode } = useOutletContext();
    const { user }                       = useAuth();
    const [gmCharacter,    setGmCharacter]    = useState(null);
    const [showCodeModal,  setShowCodeModal]  = useState(false);
    const { label } = useSystem();

    const apiBase   = `/api/${system}`;
    const moduleKey = `../systems/${system}/GMApp.jsx`;
    const loader    = SYSTEM_GM_APPS[moduleKey];

    // ── Sockets génériques GM ────────────────────────────────────────────────
    // characterUpdates : nouveau, additif — un slug qui ne le destructure pas
    // dans son GMApp n'est pas affecté.
    const { activeSession, setActiveSession, onlineCharacters, characterUpdates } = useGMSession({ apiBase });

    useEffect(() => {
        const key = `../systems/${system}/theme.css`;
        if (THEMES[key]) THEMES[key]();
    }, [system]);

    // ── Chargement du personnage GM pour l'auth ──────────────────────────────
    useEffect(() => {
        if (user?.isGM || !loader) return;

        fetch(`${apiBase}/characters/by-url/this-is-MJ`)
            .then(r => r.json())
            .then(character => { if (character?.id === -1) setGmCharacter(character); })
            .catch(err => console.error('[GMPage] Error loading GM character:', err));
    }, [system, user, loader, apiBase]);

    if (!loader) {
        return (
            <ErrorPage
                title="Interface MJ indisponible"
                message={`Le système « ${label || system} » n'a pas encore d'interface MJ.`}
                slug={system}
                label={label}
            />
        );
    }

    const SystemGMApp = getGMLazyComponent(moduleKey);

    if (user?.isGM) {
        return (
            <>
                <Suspense fallback={<LoadingScreen />}>
                    {/* eslint-disable-next-line react-hooks/static-components */}
                    <SystemGMApp
                        activeSession={activeSession}
                        onSessionChange={setActiveSession}
                        onlineCharacters={onlineCharacters}
                        characterUpdates={characterUpdates}
                        darkMode={darkMode}
                        onToggleDarkMode={onToggleDarkMode}
                    />
                    <DiceAnimationOverlay />
                </Suspense>
            </>
        );
    }

    if (!gmCharacter) return <LoadingScreen />;

    return (
        <>
            {/* Connexion du MJ : thème et marque du slug (spec_plateforme_accueil.md §6) */}
            <SlugPage>
                <div className="vtt-panel w-full max-w-md p-6 text-center space-y-5">
                    <div className="text-3xl"><SystemBrand variant="title" slug={system} label={label} /></div>
                    <div>
                        <h2 className="font-bold text-lg">Interface du meneur</h2>
                        <p className="text-sm text-muted mt-1">Le code d'accès du MJ est demandé pour continuer.</p>
                    </div>
                    <div className="space-y-2">
                        <button type="button" onClick={() => setShowCodeModal(true)} className="vtt-btn vtt-btn-primary w-full">
                            Se connecter
                        </button>
                        <a href={`/${system}/`} className="vtt-btn w-full">
                            Retour à l'espace joueur
                        </a>
                    </div>
                </div>
            </SlugPage>
            <CodeModal
                isOpen={showCodeModal}
                onClose={() => setShowCodeModal(false)}
                character={gmCharacter}
                onSuccess={() => setShowCodeModal(false)}
            />
        </>
    );
};

export default GMPage;
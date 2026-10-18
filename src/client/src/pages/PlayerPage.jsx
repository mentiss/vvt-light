// src/client/src/pages/PlayerPage.jsx
// Orchestrateur joueur — machine d'états : selecting → creating → playing.
// Reproduit la cinématique de App.jsx Vikings de façon générique.
// Délègue Sheet et Creation au système via import.meta.glob.

import React, { useState, useEffect, Suspense } from 'react';
import {useParams, useOutletContext, useNavigate} from 'react-router-dom';
import { useAuth }          from '../context/AuthContext.jsx';
import { useFetch }         from '../hooks/useFetch.js';
import { usePlayerSession } from '../hooks/usePlayerSession.js';
import CharacterListModal   from '../components/modals/CharacterListModal.jsx';
import CodeModal            from '../components/modals/CodeModal.jsx';
import DiceAnimationOverlay from "../components/shared/DiceAnimationOverlay.jsx";
import LoadingScreen from "../components/gm/layout/LoadingScreen.jsx";
import SlugPage             from '../components/platform/SlugPage.jsx';
import SystemBrand          from '../components/platform/SystemBrand.jsx';
import ErrorPage            from '../components/platform/ErrorPage.jsx';
import { useSystem }        from '../hooks/useSystem.js';

const SHEETS    = import.meta.glob('../systems/*/Sheet.jsx');
const THEMES    = import.meta.glob('../systems/*/theme.css');

const lazyCache = {};
const getLazyComponent = (glob, key) => {
    if (!lazyCache[key]) {
        lazyCache[key] = React.lazy(glob[key]);
    }
    return lazyCache[key];
};

const PlayerPage = () => {
    const { system, accessUrl }          = useParams();
    const { darkMode, onToggleDarkMode } = useOutletContext();
    const { user, loading: authLoading, logout } = useAuth();
    const fetchWithAuth = useFetch();
    const navigate = useNavigate();

    const apiBase = `/api/${system}`;

    // ── Machine d'états ──────────────────────────────────────────────────────
    const [appState,  setAppState]  = useState('loading');
    const [character, setCharacter] = useState(null);

    // ── État local pour la cinématique de sélection ──────────────────────────
    const [showCharacterList,  setShowCharacterList]  = useState(false);
    const [selectedCharForCode, setSelectedCharForCode] = useState(null);
    const [showCodeModal,       setShowCodeModal]       = useState(false);
    // Lien de personnage de l'adresse introuvable : signalé sur l'écran d'arrivée
    const [invalidLink,         setInvalidLink]         = useState(false);
    const { label } = useSystem();

    useEffect(() => {
        const key = `../systems/${system}/theme.css`;
        if (THEMES[key]) THEMES[key]();
    }, [system]);

    // ── Résolution initiale (auth + accessUrl) ───────────────────────────────
    useEffect(() => {
        if (authLoading) return;
        if (appState !== 'loading') return;
        let cancelled = false;

        const resolve = async () => {
            // 1. Token valide — utilisateur déjà connecté
            //console.log(user, user.character);
            if (user?.character) {
                if (!accessUrl || user?.character?.accessUrl === accessUrl) {
                    if (!cancelled) {
                        setCharacter(user.character);
                        setAppState('playing');
                        window.history.replaceState({}, '', `/${system}/${user.character.accessUrl}${window.location.hash}`);
                    }
                    return;
                }
            }

            // 2. accessUrl dans l'URL → charger le perso et ouvrir CodeModal
            if (accessUrl) {
                try {
                    const res = await fetch(`${apiBase}/characters/by-url/${accessUrl}`);
                    if (res.ok) {
                        const char = await res.json();
                        if (!cancelled) {
                            setSelectedCharForCode(char);
                            setShowCodeModal(true);
                            setAppState('selecting');
                        }
                    } else {
                        if (!cancelled) { setInvalidLink(res.status === 404); setAppState('selecting'); }
                    }
                } catch {
                    if (!cancelled) setAppState('selecting');
                }
                return;
            }

            // 3. Rien → écran d'accueil
            if (!cancelled) setAppState('selecting');
        };

        resolve();
        return () => { cancelled = true; };
    }, [authLoading, user, system, accessUrl, apiBase]);

    // ── Persistance générique ────────────────────────────────────────────────
    const handleCharacterUpdate = (updatedOrFn) => {
        setCharacter(prev => {
            const updated = typeof updatedOrFn === 'function' ? updatedOrFn(prev) : updatedOrFn;
            fetchWithAuth(`${apiBase}/characters/${updated.id}`, {
                method: 'PUT',
                body: JSON.stringify(updated),
            }).catch(err => console.error('[PlayerPage] PUT failed:', err));
            return updated;
        });
    };

    const handleCharacterReload = async () => {
        if (!character?.id) return;
        try {
            const res = await fetchWithAuth(`${apiBase}/characters/${character.id}`);
            if (res.ok) setCharacter(await res.json());
        } catch (err) {
            console.error('[PlayerPage] Reload failed:', err);
        }
    };

    // ── Sockets génériques ───────────────────────────────────────────────────
    const { journalUnread, markJournalRead } = usePlayerSession({
        character:          appState === 'playing' ? character : null,
        onCharacterUpdate:      handleCharacterUpdate,
        onCharacterReload:      handleCharacterReload,
        apiBase,
    });

    // ── Cinématique sélection → CodeModal → playing ──────────────────────────
    const handleCharacterListSelect = (char) => {
        setSelectedCharForCode(char);
        setShowCodeModal(true);
    };

    const handleCodeSuccess = (loggedCharacter) => {
        setShowCodeModal(false);
        setSelectedCharForCode(null);
        setCharacter(loggedCharacter);
        setAppState('playing');
        window.history.pushState({}, '', `/${system}/${loggedCharacter.accessUrl}`);
    };

    // ── Handlers navigation ──────────────────────────────────────────────────
    const handleCreated = (newCharacter) => {
        setCharacter(newCharacter);
        setAppState('playing');
        window.history.pushState({}, '', `/${system}/${newCharacter.accessUrl}`);
    };

    const handleLogout = async () => {
        await logout();
        setCharacter(null);
        setAppState('selecting');
        window.history.pushState({}, '', `/${system}/`);
    };

    // ── Vérification composants système ─────────────────────────────────────
    const sheetKey    = `../systems/${system}/Sheet.jsx`;

    if (!SHEETS[sheetKey]) {
        return (
            <ErrorPage
                title="Système incomplet"
                message={`Le système « ${label || system} » n'a pas encore sa fiche de personnage.`}
                actions={<a href="/" className="vtt-btn vtt-btn-primary">Accueil de la plateforme</a>}
            />
        );
    }

    const SystemSheet    = getLazyComponent(SHEETS, sheetKey);

    // ── Rendu ────────────────────────────────────────────────────────────────
    if (appState === 'loading') return <LoadingScreen />;

    if (appState === 'selecting') {
        return (
            <>
                {/* Écran d'arrivée du joueur : thème et marque du slug (spec_plateforme_accueil.md §6) */}
                <SlugPage>
                    <div className="vtt-panel w-full max-w-md p-6 text-center space-y-5">
                        <div className="text-3xl"><SystemBrand variant="title" slug={system} label={label} /></div>
                        {invalidLink ? (
                            <div className="vtt-callout vtt-callout-danger text-left">
                                Ce lien de personnage n'existe pas ou plus. Demandez le bon lien à votre MJ, ou connectez-vous avec votre personnage.
                            </div>
                        ) : (
                            <p className="text-muted">Choisissez votre personnage ou créez-en un nouveau.</p>
                        )}
                        <div className="space-y-2">
                            <button type="button" onClick={() => navigate(`/${system}/creation`)} className="vtt-btn vtt-btn-primary w-full">
                                Créer un nouveau personnage
                            </button>
                            <button type="button" onClick={() => setShowCharacterList(true)} className="vtt-btn w-full">
                                Se connecter
                            </button>
                        </div>
                        <div className="flex justify-center gap-4 text-xs">
                            <a href={`/${system}/gm`} className="text-muted hover:text-primary">Accès MJ</a>
                            <a href="/" className="text-muted hover:text-primary">Accueil de la plateforme</a>
                        </div>
                    </div>
                </SlugPage>

                {/* Modale liste — comportement identique à App.jsx */}
                <CharacterListModal
                    isOpen={showCharacterList}
                    onClose={() => setShowCharacterList(false)}
                    onSelect={handleCharacterListSelect}
                />

                {/* CodeModal — comportement identique à App.jsx */}
                <CodeModal
                    isOpen={showCodeModal}
                    onClose={() => { setShowCodeModal(false); setSelectedCharForCode(null); }}
                    character={selectedCharForCode}
                    onSuccess={handleCodeSuccess}
                />
            </>
        );
    }

    // appState === 'playing'
    return (
        <>
            <Suspense fallback={<LoadingScreen />}>
                <SystemSheet
                    character={character}
                    onCharacterUpdate={handleCharacterUpdate}
                    onLogout={handleLogout}
                    journalUnread={journalUnread}
                    onJournalRead={markJournalRead}
                    darkMode={darkMode}
                    onToggleDarkMode={onToggleDarkMode}
                />
                <DiceAnimationOverlay />
            </Suspense>

            {/* CodeModal disponible en mode playing aussi (changer de perso depuis Sheet) */}
            <CodeModal
                isOpen={showCodeModal}
                onClose={() => { setShowCodeModal(false); setSelectedCharForCode(null); }}
                character={selectedCharForCode}
                onSuccess={handleCodeSuccess}
            />
            <CharacterListModal
                isOpen={showCharacterList}
                currentCharId={character?.id}
                onClose={() => setShowCharacterList(false)}
                onSelect={handleCharacterListSelect}
            />
        </>
    );
};

export default PlayerPage;
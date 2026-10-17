// src/client/src/pages/CreationPage.jsx
import React, {Suspense, useEffect} from 'react';
import { useParams, useNavigate, useOutletContext, Navigate } from 'react-router-dom';
import LoadingScreen from "../components/gm/layout/LoadingScreen.jsx";
import DiceAnimationOverlay from "../components/shared/DiceAnimationOverlay.jsx";

const CREATIONS = import.meta.glob('../systems/*/Creation.jsx');
const THEMES    = import.meta.glob('../systems/*/theme.css');
const lazyCache = {};
const getLazyComponent = (glob, key) => {
    if (!lazyCache[key]) lazyCache[key] = React.lazy(glob[key]);
    return lazyCache[key];
};

const CreationPage = () => {
    const { system }                     = useParams();
    const navigate               = useNavigate();
    const { darkMode, onToggleDarkMode } = useOutletContext();

    // Hooks avant toute sortie anticipée (ordre des hooks constant)
    useEffect(() => {
        const key = `../systems/${system}/theme.css`;
        if (THEMES[key]) THEMES[key]();
    }, [system]);

    // Garde-fou : slug sans assistant de création → retour à l'accueil du slug
    const creationKey = `../systems/${system}/Creation.jsx`;
    if (!CREATIONS[creationKey]) {
        return <Navigate to={`/${system}/`} replace />;
    }

    const SystemCreation = getLazyComponent(CREATIONS, creationKey);

    const handleCreated = (newCharacter) => {
        navigate(`/${system}/${newCharacter.accessUrl}`);
    };

    const handleCancel = () => {
        navigate(`/${system}/`);
    };

    return (
        <Suspense fallback={<LoadingScreen />}>
            <DiceAnimationOverlay />
            <SystemCreation
                onCreated={handleCreated}
                onCancel={handleCancel}
                darkMode={darkMode}
                onToggleDarkMode={onToggleDarkMode}
            />
        </Suspense>
    );
};

export default CreationPage;
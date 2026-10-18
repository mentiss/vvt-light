// src/client/src/components/platform/SlugPage.jsx
// Enveloppe des pages génériques d'un slug (arrivée, connexion MJ, erreurs,
// chargement) : thème du slug, déjà chargé par SystemLayout. Pose data-theme pour
// les slugs qui ne définissent leur mode nuit que sur cet attribut.

import React from 'react';
import { useOutletContext } from 'react-router-dom';

const SlugPage = ({ children }) => {
    const darkMode = useOutletContext()?.darkMode ?? false;
    return (
        <div className="min-h-screen bg-default text-default flex items-center justify-center p-4" data-theme={darkMode ? 'dark' : 'light'}>
            {children}
        </div>
    );
};

export default SlugPage;

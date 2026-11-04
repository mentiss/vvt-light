// src/client/src/components/platform/SlugPage.jsx
// Enveloppe des pages génériques d'un slug (arrivée, connexion MJ, erreurs,
// chargement) : thème du slug, déjà chargé par SystemLayout. Le mode nuit vient
// de data-theme sur <html>, posé par SystemLayout.

import React from 'react';

const SlugPage = ({ children }) => {
    return (
        <div className="min-h-screen bg-default text-default flex items-center justify-center p-4">
            {children}
        </div>
    );
};

export default SlugPage;

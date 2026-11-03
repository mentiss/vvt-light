// src/client/src/hooks/useHashTab.js
// ─────────────────────────────────────────────────────────────────────────────
// Onglet courant mémorisé dans le hash de l'URL (#journal, #aide…), comme dans
// les autres slugs : un rafraîchissement de la page garde l'onglet ouvert.
//
// const [tab, setTab] = useHashTab(TABS, 'fiche');   // TABS : [{ id, … }]
// Un hash inconnu ramène sur l'onglet par défaut.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

export const useHashTab = (tabs, defaultId) => {
    const [tab, setTabState] = useState(() => {
        const hash = window.location.hash.substring(1);
        return tabs.some(t => t.id === hash) ? hash : defaultId;
    });
    const setTab = (id) => {
        setTabState(id);
        window.location.hash = id;
    };
    return [tab, setTab];
};

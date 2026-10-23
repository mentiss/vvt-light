// src/client/src/components/ui/ModalHost.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Emplacement à modales des pages génériques (documentations/spec_ui_menu.md §4).
//
// - ModalHostProvider : posé par PlayerPage / GMPage autour de la fiche ou de
//   l'interface MJ ; rend un emplacement toujours monté et le partage par contexte.
// - HostedModal : rend ses enfants dans cet emplacement par portail (props à jour,
//   état gardé par le composant appelant). Sans emplacement : dans <body> (jamais
//   sur place : l'appelant peut vivre dans un menu fermé, donc masqué).
//
// L'emplacement est placé AVANT la page : les notifications, rendues en dernier par
// les slugs, restent devant les modales. Le thème (theme.css de la page, jour / nuit
// sur <html>) s'applique ; une classe racine de slug (ex. .vk-root) peut cibler
// .vtt-modal-host dans son theme.css pour la police.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';

const ModalHostContext = createContext(null);

export const ModalHostProvider = ({ children }) => {
    const [host, setHost] = useState(null);

    return (
        <ModalHostContext.Provider value={host}>
            <div className="vtt-modal-host" ref={setHost} />
            {children}
        </ModalHostContext.Provider>
    );
};

export const HostedModal = ({ children }) => {
    const host = useContext(ModalHostContext);
    return createPortal(children, host ?? document.body);
};

// src/client/src/components/gm/TableManagementButton.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Appel à choisir une table (documentations/spec_ui_menu.md §12) : bouton qui
// ouvre la gestion des tables sans passer par le menu. Même modale et même
// contrat que HamburgerMenuItemTableManagement ; la modale passe par
// l'emplacement à modales de la page (HostedModal) et se ferme seule au choix.
// Le slug pose le bouton dans son état vide, avec son message et son habillage.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { HamburgerMenuIcon } from '../ui/HamburgerMenu.jsx';
import { HostedModal } from '../ui/ModalHost.jsx';
import TableManagementModal from './modals/TableManagementModal.jsx';

/**
 * @param {number|null} props.activeSessionId table active (null : aucune)
 * @param {Function}    props.onSelectTable   (session | null) : table choisie (ou désactivée)
 * @param {node}        [props.label]         libellé (défaut « Choisir une table »)
 * @param {node|null}   [props.icon]          absent : icône « tables » ; nœud : remplace ; null : aucune
 * @param {string}      [props.className]     classes du bouton
 */
const TableManagementButton = ({ activeSessionId, onSelectTable, label = 'Choisir une table', icon, className = 'vtt-btn vtt-btn-primary' }) => {
    const [open, setOpen] = useState(false);
    const shownIcon = icon === undefined ? <HamburgerMenuIcon name="tables" /> : icon;
    return (
        <>
            <button type="button" onClick={() => setOpen(true)} className={className}>
                {shownIcon}{label}
            </button>
            <HostedModal>
                {open && (
                    <TableManagementModal
                        isOpen
                        onClose={() => setOpen(false)}
                        activeSessionId={activeSessionId}
                        onSelectTable={onSelectTable}
                    />
                )}
            </HostedModal>
        </>
    );
};

export default TableManagementButton;

// src/client/src/systems/vikings/components/ui/VkModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtre du slug : la fenêtre générique de la plateforme (ui/modal/Modal.jsx,
// spec_ui_modales.md), rendue hors de la page par HostedModal (ModalHost.jsx) pour
// ne jamais rester prise dans la carte qui l'ouvre (retour MJ du 2026-11-07).
// Habillage : .vtt-modal-* dans theme.css (bois et or) et theme-pierre.css.
// Garde l'ancien contrat (title, icon = nom VkIcon, onClose, size = classe max-w-*).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import { HostedModal } from '@/ui/modal/ModalHost.jsx';
import VkIcon from './VkIcon.jsx';

// Anciennes largeurs → tailles de la fenêtre générique
const SIZE_OF = {
    'max-w-sm': 'sm', 'max-w-md': 'md', 'max-w-lg': 'md',
    'max-w-xl': 'lg', 'max-w-2xl': 'lg', 'max-w-3xl': 'xl', 'max-w-4xl': 'xl', 'max-w-6xl': 'xl',
};

const VkModal = ({ title, subtitle, icon, onClose, size = 'max-w-lg', expandable = false, children }) => (
    <HostedModal>
        <Modal title={title} subtitle={subtitle} icon={icon ? <VkIcon name={icon} /> : undefined}
               size={SIZE_OF[size] ?? size} expandable={expandable || size === 'max-w-6xl'} onClose={onClose}>
            {children}
        </Modal>
    </HostedModal>
);

export default VkModal;

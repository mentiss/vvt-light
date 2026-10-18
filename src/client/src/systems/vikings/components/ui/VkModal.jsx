// src/client/src/systems/vikings/components/ui/VkModal.jsx
// Fenêtre modale Vikings : fond assombri, cadre orné (lourd par défaut),
// en-tête avec titre et fermeture tenue à l'écart des coins (.vk-modal-header).
// Clic sur le fond = fermeture. Le conteneur défile (barres habillées par
// vtt-scroll) ; son padding laisse dépasser les coins ornés du cadre.

import React from 'react';
import VkPanel from './VkPanel.jsx';
import VkIcon from './VkIcon.jsx';

const VkModal = ({ title, icon, onClose, variant = 'heavy', size = 'max-w-lg', children }) => (
    <div className="vk-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3" onClick={onClose}>
        <div className={`w-full ${size} max-h-[94vh] overflow-y-auto vtt-scroll p-2`} onClick={e => e.stopPropagation()}>
            <VkPanel variant={variant}>
                <div className="vk-modal-header">
                    <span className="vk-title text-xl flex items-center gap-2 min-w-0">
                        {icon && <VkIcon name={icon} />}
                        <span className="truncate">{title}</span>
                    </span>
                    <button type="button" className="vk-btn vk-btn-icon vk-btn-sm shrink-0" onClick={onClose} title="Fermer">
                        <VkIcon name="close" />
                    </button>
                </div>
                {children}
            </VkPanel>
        </div>
    </div>
);

export default VkModal;

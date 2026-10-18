// src/client/src/components/ui/ImageLightbox.jsx
// Lightbox plein écran pour afficher une image en grand.
// Fermeture : clic sur l'overlay, touche Escape, ou bouton de fermeture.
// Habillage : fond assombri et bouton vtt-btn (spec_journal.md §3), au-dessus de tout.

import React, { useEffect, useCallback } from 'react';

/**
 * @param {string}   props.src     - URL de l'image à afficher
 * @param {Function} props.onClose - callback fermeture
 */
const ImageLightbox = ({ src, onClose }) => {
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        // Bloquer le scroll de la page pendant l'ouverture
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    return (
        <div className="vtt-modal-backdrop vtt-modal-alert" onClick={onClose}>
            {/* Bouton fermer */}
            <button
                type="button"
                onClick={onClose}
                className="vtt-btn vtt-btn-icon absolute top-4 right-4 z-10"
                title="Fermer (Échap)"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>

            {/* Image — stoppe la propagation pour éviter de fermer au clic sur l'image */}
            <img
                src={src}
                alt=""
                className="rounded-lg shadow-2xl max-w-[90vw] max-h-[90vh] object-contain cursor-default"
                onClick={e => e.stopPropagation()}
            />
        </div>
    );
};

export default ImageLightbox;

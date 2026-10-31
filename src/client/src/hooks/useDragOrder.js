// src/client/src/hooks/useDragOrder.js
// ─────────────────────────────────────────────────────────────────────────────
// Glisser-déposer natif pour réordonner une liste (utilisé par la bibliothèque audio).
// Renvoie, pour un identifiant, les props à poser sur l'élément de la liste.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

/** Glisser-déposer natif pour réordonner une liste d'identifiants (P-2). */
export function useDragOrder(ids, onReorder) {
    const [dragId, setDragId] = useState(null);
    return (id) => ({
        draggable: true,
        onDragStart: (e) => { setDragId(id); e.dataTransfer.effectAllowed = 'move'; },
        onDragEnd: () => setDragId(null),
        onDragOver: (e) => { if (dragId !== null && ids.includes(dragId)) e.preventDefault(); },
        onDrop: (e) => {
            if (dragId === null || dragId === id || !ids.includes(dragId)) return;
            e.preventDefault();
            const order = ids.filter(x => x !== dragId);
            order.splice(order.indexOf(id), 0, dragId);
            setDragId(null);
            onReorder(order);
        },
        'data-dragging': dragId === id ? 'true' : undefined,
    });
}

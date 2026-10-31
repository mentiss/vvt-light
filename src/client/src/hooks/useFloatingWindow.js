// src/client/src/hooks/useFloatingWindow.js
// ─────────────────────────────────────────────────────────────────────────────
// Position, taille et réduction d'une fenêtre flottante (documentations/spec_ui_panneaux.md),
// pour FloatingPanel : déplacement par la barre de titre et redimensionnement par
// les bords au pointeur, fenêtre gardée dans le navigateur (calculs dans
// tools/floatingGeometry.js).
//
// Mémorisation (O-3) sous vtt:platform:panel:<persistAs>, seulement de ce que
// l'utilisateur peut changer : position si `movable`, taille si `resizable`,
// réduction si `minimizable`. Enregistrée à la fin d'un geste, pas à chaque
// mouvement du pointeur.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { clampRect, defaultRect, moveRect, resizeRect } from '../tools/floatingGeometry.js';
import { PLATFORM_SCOPE, readStored, storageKey, writeStored } from '../tools/browserStorage.js';

const viewport = () => ({ width: window.innerWidth, height: window.innerHeight });

/**
 * @param {object} options
 * @param {string}  [options.persistAs]       identifiant de mémorisation (sans lui, rien n'est gardé)
 * @param {boolean} [options.movable]
 * @param {boolean} [options.resizable]
 * @param {boolean} [options.minimizable]
 * @param {{ width: number, height: number }} [options.defaultSize]
 * @param {{ width: number, height: number }} [options.minSize]
 * @param {string}  [options.defaultPosition] ancrage (tools/floatingGeometry.js, ANCHORS)
 * @param {{ x: number, y: number }} [options.offset]
 */
export function useFloatingWindow({
    persistAs, movable = true, resizable = true, minimizable = true,
    defaultSize, minSize, defaultPosition, offset,
} = {}) {
    const key = persistAs ? storageKey(PLATFORM_SCOPE, `panel:${persistAs}`) : null;

    const [geometry, setGeometry] = useState(() => {
        const rect = defaultRect(viewport(), { size: defaultSize, anchor: defaultPosition, offset, min: minSize });
        const saved = key ? readStored(key) : null;
        if (saved?.rect) {
            if (movable) Object.assign(rect, { left: saved.rect.left, top: saved.rect.top });
            if (resizable) Object.assign(rect, { width: saved.rect.width, height: saved.rect.height });
        }
        return { rect: clampRect(rect, viewport(), minSize), minimized: minimizable && !!saved?.minimized };
    });

    // Pendant un geste, rien n'est enregistré ; à la fin, l'état final l'est
    const geometryRef = useRef(geometry);
    const gestureRef = useRef(false);
    useEffect(() => {
        geometryRef.current = geometry;
        if (key && !gestureRef.current) writeStored(key, geometry);
    }, [geometry, key]);

    // Fenêtre du navigateur redimensionnée : la fenêtre flottante y reste
    useEffect(() => {
        const onResize = () => setGeometry(g => ({ ...g, rect: clampRect(g.rect, viewport(), minSize) }));
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [minSize]);

    // Geste au pointeur : `compute(rectDeDépart, dx, dy)` donne le nouveau rectangle
    const cleanupRef = useRef(null);
    useEffect(() => () => cleanupRef.current?.(), []);
    const startGesture = (e, compute) => {
        if (e.button !== 0) return;
        e.preventDefault();
        gestureRef.current = true;
        const start = geometryRef.current.rect;
        const x0 = e.clientX;
        const y0 = e.clientY;
        const move = (ev) => setGeometry(g => ({ ...g, rect: compute(start, ev.clientX - x0, ev.clientY - y0) }));
        const end = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', end);
            cleanupRef.current = null;
            gestureRef.current = false;
            if (key) writeStored(key, geometryRef.current);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
        cleanupRef.current = end;
    };

    return {
        rect: geometry.rect,
        minimized: geometry.minimized,
        toggleMinimized: () => setGeometry(g => ({ ...g, minimized: !g.minimized })),
        startMove: (e) => {
            if (!movable || e.target.closest('button')) return;
            startGesture(e, (s, dx, dy) => moveRect(s, dx, dy, viewport(), minSize));
        },
        startResize: (dir) => (e) => startGesture(e, (s, dx, dy) => resizeRect(s, dir, dx, dy, viewport(), minSize)),
    };
}

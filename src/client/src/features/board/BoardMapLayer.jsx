// src/client/src/features/board/BoardMapLayer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Carte d'une diapositive carte (documentations/plateforme/spec_tableau.md §17.4),
// dessinée par BoardCanvas sous tous les objets. Le niveau 0 sert toujours de fond
// (jamais de trou pendant le chargement) ; par-dessus, les tuiles du niveau adapté
// au zoom, seulement celles qui touchent la vue. Les tuiles sont des <image> à
// adresse directe : le navigateur les charge et les garde en cache tout seul.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { mapLevel, tileUrl, visibleTiles } from './tools/boardTiles.js';

/**
 * @param {object} props
 * @param {object} props.map   carte de la diapositive : { name, width, height, tileSize, levels, version } ou { name, missing }
 * @param {{ x: number, y: number, scale: number }} props.view
 * @param {{ width: number, height: number }} props.size taille du cadre, en pixels d'écran
 */
const BoardMapLayer = ({ map, view, size }) => {
    if (map.missing) {
        // Carte absente du serveur : un cadre et son nom, les objets restent
        return (
            <g className="vtt-board-map-missing" pointerEvents="none">
                <rect x={0} y={0} width={1600} height={900} />
                <text x={800} y={450} textAnchor="middle" dominantBaseline="middle" fontSize={48}>
                    Carte introuvable : {map.name}
                </text>
            </g>
        );
    }
    const z = mapLevel(map, view.scale, window.devicePixelRatio || 1);
    // Recouvrement d'un demi-pixel d'écran : pas de liseré entre deux tuiles
    const overlap = 0.5 / view.scale;
    return (
        <g className="vtt-board-map" pointerEvents="none">
            <image href={tileUrl(map, 0, 0, 0)} x={0} y={0} width={map.width} height={map.height} preserveAspectRatio="none" />
            {z > 0 && visibleTiles(map, z, view, size).map(t => (
                <image key={`${z}-${t.x}-${t.y}`} href={tileUrl(map, z, t.x, t.y)} preserveAspectRatio="none"
                       x={t.box.x} y={t.box.y} width={t.box.w + overlap} height={t.box.h + overlap} />
            ))}
        </g>
    );
};

export default BoardMapLayer;

// src/client/src/components/dice/Die2D.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Dé 2D de la plateforme (spec_fabula.md §4, spec_diceengine_v2.md « Dés 2D ») :
// une forme par type (d4, d6, d8, d10, d12, d20, d100) dessinée en SVG.
//   • Apparence : configuration résolue (tools/dice2d.js), posée en variables CSS
//     sur le dé : --die-fg (chiffre), --die-bg (corps), --die-outline (contour du
//     chiffre), --die-edge (arête) ; attributs data-type et data-material.
//   • Texture de la bibliothèque 3D : image découpée à la forme du dé.
//   • Matière : traitement de surface en CSS (reflet plus ou moins marqué).
// Règle d'habillage : la configuration donne les valeurs, le CSS le traitement.
// Un slug peut reprendre ces variables dans son theme.css (.vtt-die2d[data-type="d8"]).
//
// Utilisé par l'overlay 2D ; réutilisable par les rendus de jet des slugs.
// <Die2D type="d8" value={7} config={{ background: '#1F8E5C', … }} />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useId } from 'react';
import { textureUrl } from '../../tools/dice2d.js';

// Corps et facettes de chaque forme (viewBox 40 × 40)
const SHAPES = {
    d4:   { body: 'M20 3L37 34H3z', facets: 'M20 3v20M3 34l17-11 17 11' },
    d6:   { body: 'M12 5h16a7 7 0 0 1 7 7v16a7 7 0 0 1-7 7H12a7 7 0 0 1-7-7V12a7 7 0 0 1 7-7z', facets: 'M5 12l7-7M35 12l-7-7M5 28l7 7M35 28l-7 7' },
    d8:   { body: 'M20 2l18 18-18 18L2 20z', facets: 'M2 20h36M20 2l-7 18 7 18 7-18z' },
    d10:  { body: 'M20 2l17 14-17 22L3 16z', facets: 'M3 16l17 6 17-6M20 22v16M20 2v20' },
    d12:  { body: 'M20 2l17.5 12.5L31 36H9L2.5 14.5z', facets: 'M20 10l8.5 6.2-3.2 10H14.7l-3.2-10z M20 2v8M37.5 14.5l-9 1.7M31 36l-5.7-9.8M9 36l5.7-9.8M2.5 14.5l9 1.7' },
    d20:  { body: 'M20 2l16 9v18l-16 9-16-9V11z', facets: 'M12 15h16l-8 14z M20 2l-8 13M20 2l8 13M4 11l8 4M36 11l-8 4M4 29l8-14M36 29l-8-14M12 15l8 14M28 15l-8 14M20 29v9' },
};
SHAPES.d100 = SHAPES.d10;

const Die2D = ({ type = 'd6', value, config = {}, className = '' }) => {
    const id = useId().replace(/:/g, '');
    const shape = SHAPES[type] ?? SHAPES.d6;
    const texture = textureUrl(config.texture);
    const style = {
        '--die-fg': config.foreground ?? undefined,
        '--die-bg': config.background ?? undefined,
        '--die-outline': config.outline ?? undefined,
        '--die-edge': config.edge || config.outline || undefined,
    };
    return (
        <span className={`vtt-die2d${className ? ` ${className}` : ''}`} data-type={type} data-material={config.material ?? 'plastic'} style={style}>
            <svg viewBox="0 0 40 40" aria-hidden="true">
                <defs>
                    <clipPath id={`c${id}`}><path d={shape.body} /></clipPath>
                    <linearGradient id={`g${id}`} x1="0" y1="0" x2="0.4" y2="1">
                        <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
                        <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path className="vtt-die2d-body" d={shape.body} />
                {texture && (
                    <image className="vtt-die2d-texture" href={texture} x="0" y="0" width="40" height="40"
                           preserveAspectRatio="xMidYMid slice" clipPath={`url(#c${id})`} />
                )}
                <path className="vtt-die2d-gloss" d={shape.body} fill={`url(#g${id})`} />
                <path className="vtt-die2d-facets" d={shape.facets} />
                <path className="vtt-die2d-edge" d={shape.body} />
            </svg>
            {value != null && <span className="vtt-die2d-value">{value}</span>}
        </span>
    );
};

export default Die2D;

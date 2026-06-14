// src/client/src/systems/achtung/components/DrapeBackground.jsx
// Drapé rouge WWII — position fixe, pleine hauteur viewport, centré.
// Plis verticaux simulés par gradient horizontal avec zones claires/sombres.

import React from 'react';

const DrapeBackground = ({ darkMode }) => {
    const baseOpacity = darkMode ? 0.28 : 0.22;

    return (
        <svg
            style={{
                position:      'fixed',
                top:           0,
                left:          '50%',
                transform:     'translateX(-50%)',
                width:         '48%',
                height:        '100vh',
                zIndex:        0,
                pointerEvents: 'none',
                display:       'block',
            }}
            viewBox="0 0 480 800"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Fondu bords gauche et droit — masque la tranche du drapé */}
                <linearGradient id="ac-drape-edge" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="black" stopOpacity="0"/>
                    <stop offset="7%"   stopColor="black" stopOpacity="1"/>
                    <stop offset="93%"  stopColor="black" stopOpacity="1"/>
                    <stop offset="100%" stopColor="black" stopOpacity="0"/>
                </linearGradient>
                <mask id="ac-drape-edge-mask">
                    <rect width="480" height="800" fill="url(#ac-drape-edge)"/>
                </mask>

                {/* Plis verticaux — alternance lumière/ombre sur tissu rouge */}
                <linearGradient id="ac-drape-folds" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#8b0000" stopOpacity="0.0"/>
                    <stop offset="5%"   stopColor="#9a0000" stopOpacity="0.9"/>
                    {/* Creux pli 1 */}
                    <stop offset="14%"  stopColor="#3d0000" stopOpacity="1.0"/>
                    <stop offset="18%"  stopColor="#2a0000" stopOpacity="1.0"/>
                    {/* Crête pli 2 */}
                    <stop offset="26%"  stopColor="#a00000" stopOpacity="0.85"/>
                    <stop offset="32%"  stopColor="#cc2200" stopOpacity="0.70"/>
                    {/* Creux pli 2 */}
                    <stop offset="40%"  stopColor="#380000" stopOpacity="1.0"/>
                    <stop offset="44%"  stopColor="#250000" stopOpacity="1.0"/>
                    {/* Crête centrale — la plus lumineuse (pli face à la lumière) */}
                    <stop offset="52%"  stopColor="#b50000" stopOpacity="0.80"/>
                    <stop offset="56%"  stopColor="#d42000" stopOpacity="0.65"/>
                    {/* Creux pli 3 */}
                    <stop offset="63%"  stopColor="#3d0000" stopOpacity="1.0"/>
                    <stop offset="67%"  stopColor="#2a0000" stopOpacity="1.0"/>
                    {/* Crête pli 4 */}
                    <stop offset="75%"  stopColor="#9a0000" stopOpacity="0.85"/>
                    <stop offset="80%"  stopColor="#b00000" stopOpacity="0.75"/>
                    {/* Creux pli 4 */}
                    <stop offset="87%"  stopColor="#3a0000" stopOpacity="1.0"/>
                    <stop offset="92%"  stopColor="#8b0000" stopOpacity="0.85"/>
                    <stop offset="100%" stopColor="#8b0000" stopOpacity="0.0"/>
                </linearGradient>
            </defs>

            {/* Fond rouge avec plis, masqué aux bords */}
            <rect
                width="480" height="800"
                fill="url(#ac-drape-folds)"
                mask="url(#ac-drape-edge-mask)"
                opacity={baseOpacity}
            />
        </svg>
    );
};

export default DrapeBackground;
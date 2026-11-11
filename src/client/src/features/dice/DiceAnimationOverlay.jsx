// src/client/src/features/dice/DiceAnimationOverlay.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Animation des dés : aiguillage entre le rendu 3D (dice-box-threejs) et le rendu
// 2D (spec_fabula.md §4), selon le config.jsx du slug :
//   dice.renderer: '2d'  → DiceOverlay2D
//   absent ou '3d'       → DiceOverlay3D (chargé à la demande : un slug en 2D
//                          ne charge pas la 3D)
// Hors slug (accueil) : 3D.
//
// ARCHITECTURE SINGLETON :
// Ce composant est monté UNE SEULE FOIS par page (PlayerPage, GMPage, CreationPage,
// accueil). Le rendu choisi s'abonne au diceAnimBridge : diceEngine.roll() appelle
// diceAnimBridge.play(seq) et attend la promesse que ce rendu résout. Tant que la
// configuration du slug n'est pas chargée, aucun rendu n'écoute et le pont rend
// la main sans animation.
//
// Format AnimationSequence (spec_diceengine_v2.md) :
// {
//   mode: 'single',
//   groups: [{ id, diceType, color, label, waves: [{ dice, colors? }] }],
// }
// color (groupe) et colors (un par dé) : configurations d'apparence, voir features/dice/tools/dice2d.js.
// ─────────────────────────────────────────────────────────────────────────────

import React, { Suspense, lazy } from 'react';
import { useParams } from 'react-router-dom';
import useSlugConfig from '@/app/hooks/useSlugConfig.js';
import DiceOverlay2D from './DiceOverlay2D.jsx';

const DiceOverlay3D = lazy(() => import('./DiceOverlay3D.jsx'));

const DiceAnimationOverlay = () => {
    const { system } = useParams();
    const slugConfig = useSlugConfig();

    if (system && !slugConfig) return null;   // configuration du slug en cours de chargement
    if (slugConfig?.dice?.renderer === '2d') return <DiceOverlay2D />;
    return (
        <Suspense fallback={null}>
            <DiceOverlay3D />
        </Suspense>
    );
};

export default DiceAnimationOverlay;

// src/client/src/systems/vikings/components/creation/StepIntro.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Étape 0 : avant de commencer (spec_vikings_pierre_peinte.md §9.4, Q-L6-7).
// L'univers et les personnages, tirés tels quels du Guide du joueur (texte du MJ,
// config/reference/01-guide.md) ; le parcours de l'assistant ; le conseil « Un métier
// avant tout » ; l'aide de jeu complète dans une fenêtre.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { REFERENCE_SECTIONS, guideParagraphs } from '../../config/reference.js';
import ReferenceGuide from '../../../../components/reference/ReferenceGuide.jsx';
import VkModal from '../ui/VkModal.jsx';
import { RichText, TradeAdvice } from './CreationParts.jsx';

const WORLD_PREVIEW = 2;   // paragraphes affichés avant « Lire la suite »

const PATH = [
    ['Caractéristiques', '14 points entre Force, Agilité, Perception, Intelligence, Charisme et Chance.'],
    ['Compétences', '10 points ; le niveau fixe le seuil du dé. Pensez à un métier.'],
    ['Traits', 'Deux à quatre traits ou backgrounds, selon leurs conditions.'],
    ['Runes', 'Seulement si un trait donne un livre de sort.'],
    ['Équipement', 'Votre métier et vos traits donnent un kit ; un peu d’argent pour le reste.'],
    ['Identité', 'On nomme son personnage à la fin.'],
    ['Finalisation', "Récapitulatif et code d'accès."],
];

const Paragraphs = ({ texts }) => texts.map((text, i) => <p key={i}><RichText text={text} /></p>);

const StepIntro = () => {
    const [more, setMore] = useState(false);
    const [guideOpen, setGuideOpen] = useState(false);
    const world = guideParagraphs("Le monde en l'an 810");

    return (
        <div className="vk-cr-intro">
            <div className="vk-cr-guide-text">
                <h4 className="vk-cr-subtitle">Le monde en l'an 810</h4>
                <Paragraphs texts={more ? world : world.slice(0, WORLD_PREVIEW)} />
                {world.length > WORLD_PREVIEW && (
                    <button type="button" className="vk-btn vk-btn-sm" onClick={() => setMore(m => !m)}>{more ? 'Moins' : 'Lire la suite'}</button>
                )}
                <h4 className="vk-cr-subtitle mt-6">Vos personnages</h4>
                <Paragraphs texts={guideParagraphs('Le point de départ')} />
                <Paragraphs texts={guideParagraphs('Le pacte')} />
            </div>
            <div>
                <h4 className="vk-cr-subtitle">Le parcours</h4>
                <ol className="vk-cr-path">
                    {PATH.map(([title, text]) => <li key={title}><strong>{title}</strong><span>{text}</span></li>)}
                </ol>
                <TradeAdvice paragraphs={guideParagraphs('Un métier avant tout').slice(0, 1)} />
                <p className="text-sm text-muted">La création se fait avec le MJ : ce que l'assistant propose se discute ensuite à la table.</p>
                <button type="button" className="vk-btn" onClick={() => setGuideOpen(true)}>Lire l'aide de jeu</button>
            </div>
            {guideOpen && (
                <VkModal title="Aide de jeu" icon="scroll" onClose={() => setGuideOpen(false)} size="max-w-4xl">
                    <ReferenceGuide sections={REFERENCE_SECTIONS} placeholder="Rechercher une règle (ex. seuil, berserk, tempête)…" />
                </VkModal>
            )}
        </div>
    );
};

export default StepIntro;

// src/client/src/systems/woddavampire/components/creation/GuideTab.jsx
// Onglet « Guide » (premier onglet, spec §II.6) : l'essentiel pour qui découvre
// le jeu, avec des renvois vers les étapes. Aucune règle propre : rappels de
// §1, §3 et §5 de la spec.

import React from 'react';
import { CREATION_BUDGET, BONUS_COSTS } from '../../config.jsx';
import { VdaSectionTitle } from '../ui/VdaUi.jsx';

const STEPS = [
    ['lineage', 'Lignée et Route', 'votre clan (trois Disciplines et une faiblesse) et la morale qui retient votre Bête.'],
    ['attributes', 'Attributs', 'le corps, le charme, l’esprit : classez les trois catégories (7, 5 et 3 points).'],
    ['abilities', 'Capacités', 'ce que vous savez faire : Talents, Compétences, Connaissances (13, 9 et 5 points).'],
    ['advantages', 'Avantages', `Disciplines (${CREATION_BUDGET.disciplines}), Historiques (${CREATION_BUDGET.backgrounds}) et Vertus (${CREATION_BUDGET.virtues}).`],
    ['finishing', 'Finitions', `${CREATION_BUDGET.bonusPoints} points bonus, Atouts et Handicaps.`],
    ['identity', 'Identité', 'nom, concept, Nature et Attitude, histoire.'],
    ['blood', 'Sang et résumé', 'la réserve de sang de départ, puis la validation.'],
];

const GuideTab = ({ onGo }) => (
    <div className="vda-guide">
        <VdaSectionTitle>Guide</VdaSectionTitle>

        <VdaSectionTitle small>Vous êtes un Caïnite</VdaSectionTitle>
        <p>Nous sommes en 1242. L’Europe est celle des seigneurs, des croisades et de l’Église. Vous êtes un vampire, un descendant de Caïn : vous vous nourrissez de sang, le soleil et le feu peuvent vous détruire, et une Bête vit en vous, qui ne demande qu’à prendre le dessus. Votre <b>clan</b> dit d’où vient votre sang ; votre <b>Route</b> dit ce qui vous retient de devenir un monstre.</p>

        <VdaSectionTitle small>Les étapes</VdaSectionTitle>
        <p>Les onglets se remplissent dans l’ordre de votre choix ; chacun affiche ce qui reste à faire. Survolez ou touchez un élément : sa description s’affiche dans la colonne d’aide.</p>
        <ol className="vda-guide-steps">
            {STEPS.map(([id, label, text]) => (
                <li key={id}><button type="button" className="vda-link" onClick={() => onGo(id)}>{label}</button> : {text}</li>
            ))}
        </ol>

        <VdaSectionTitle small>Les points</VdaSectionTitle>
        <p>Un trait vaut de 1 à 5 points : 1 est faible, 3 solide, 5 exceptionnel. Sur les points d’un trait, le <b>gris</b> est gratuit, l’<b>encre</b> vient des priorités de l’onglet, le <b>sang</b> des points bonus.</p>
        <p>Répartissez d’abord les priorités de chaque onglet. Ensuite seulement, activez l’interrupteur <b>« Dépenser des points bonus »</b> (en haut de l’assistant) : chaque clic prend alors sur vos {CREATION_BUDGET.bonusPoints} points bonus. Un Attribut coûte {BONUS_COSTS.attribute}, une Capacité {BONUS_COSTS.ability}, une Discipline {BONUS_COSTS.discipline}, un Historique {BONUS_COSTS.background}. Les Handicaps en rapportent.</p>

        <VdaSectionTitle small>Les jets</VdaSectionTitle>
        <p>On lance autant de dés à dix faces que la somme d’un Attribut et d’une Capacité, par exemple Dextérité + Mêlée pour frapper à l’épée. Chaque dé qui atteint la <b>difficulté</b> (6 en général, de 2 à 10) est un succès ; plus il y a de succès, mieux c’est. Aucun succès et au moins un 1 : c’est un échec critique. Le <b>sang</b> alimente les Disciplines et soigne ; la <b>Volonté</b> donne un succès automatique.</p>
    </div>
);

export default GuideTab;

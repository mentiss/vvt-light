// src/client/src/systems/vikings/components/creation/CreationRail.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rail des étapes de l'assistant (spec_vikings_pierre_peinte.md §9.2, Q-L6-1, §9.4) :
// fanions verticaux, coche et résumé par étape, retour libre à toute étape.
// « à finir » sur une étape ouverte mais incomplète, « à revoir » sur une étape
// devenue invalide (trait hors de portée, trop de points de runes, achats au-delà de
// la bourse) ; Runes grisée sans livre de sort. L'accueil porte la rune ᛟ.
// L'équipement n'est coché qu'une fois l'étape ouverte (le kit y attend le joueur).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { CARACNAMES } from '../../config/competences.js';
import { CREATION_STEPS, STEP, getCreationBudget, getCreationKit, getCreationStepStatus } from '../../config/creation.js';
import { formatFullName } from '../../config/utils.js';

const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
const SHORT = { force: 'For', agilite: 'Agi', perception: 'Per', intelligence: 'Int', charisme: 'Cha', chance: 'Chc' };

const summaryOf = (character, gear, step) => {
    const b = getCreationBudget(character);
    switch (step) {
        case STEP.intro: return "L'univers et le parcours";
        case STEP.caracs: return b.caracLeft ? `${plural(b.caracLeft, 'point')} à placer`
            : Object.keys(CARACNAMES).map(k => `${SHORT[k]} ${character[k]}`).join(' · ');
        case STEP.skills: return character.skills.length
            ? `${plural(character.skills.length, 'compétence')}${b.skillLeft ? ` · ${b.skillLeft} pt${b.skillLeft > 1 ? 's' : ''} à placer` : ''}`
            : `${b.skillLeft} points à placer`;
        case STEP.traits: return character.traits.length ? character.traits.map(t => t.name).join(', ') : '2 à 4 à choisir';
        case STEP.runes: return b.runeBook ? `${b.runeSpent} / ${b.runeBook} points` : 'Aucun trait ne donne de livre de sort';
        case STEP.gear: {
            const kit = getCreationKit(character, gear);
            return `${plural(kit.items.length, 'objet')} · ${kit.silver.left} oz${kit.pending.length ? ' · choix à faire' : ''}`;
        }
        case STEP.identity: return character.prenom ? formatFullName(character) : 'Prénom et nom du parent';
        default: return "Récapitulatif et code d'accès";
    }
};

/**
 * @param {object}   props.character personnage en cours
 * @param {object}   props.gear      choix du kit (config/creation.js EMPTY_GEAR)
 * @param {number}   props.step      étape affichée (STEP)
 * @param {Set}      props.visited   étapes déjà ouvertes
 * @param {function} props.onGo      (step) => void
 */
const CreationRail = ({ character, gear, step, visited, onGo }) => (
    <nav className="vk-cr-rail" aria-label="Étapes de la création">
        {CREATION_STEPS.map((label, n) => {
            const real = n !== STEP.intro && n !== STEP.final;
            let status = real ? getCreationStepStatus(character, n, gear) : 'todo';
            if (n === STEP.gear && status === 'done' && !visited.has(n)) status = 'todo';
            const active = n === step;
            const toFinish = !active && real && status === 'todo' && visited.has(n);
            const cls = [active && 'is-active', status === 'done' && 'is-done', status === 'skipped' && 'is-skipped',
                status === 'invalid' && 'is-invalid', toFinish && 'is-todo'].filter(Boolean).join(' ');
            const num = n === STEP.intro ? <span className="vk-rune">ᛟ</span> : status === 'done' && !active ? '✓' : n;
            return (
                <button key={label} type="button" className={`vk-cr-step ${cls}`} onClick={() => onGo(n)} aria-current={active ? 'step' : undefined}>
                    <span className="vk-cr-step-num"><span>{num}</span></span>
                    <span className="vk-cr-step-label">
                        {label}
                        {status === 'invalid' && <span className="vk-cr-step-tag is-invalid">à revoir</span>}
                        {toFinish && <span className="vk-cr-step-tag">à finir</span>}
                    </span>
                    <span className="vk-cr-step-sum">{summaryOf(character, gear, n)}</span>
                </button>
            );
        })}
    </nav>
);

export default CreationRail;

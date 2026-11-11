// src/client/src/systems/vikings/components/creation/CreationParts.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Petites pièces partagées par les étapes de l'assistant de création
// (spec_vikings_pierre_peinte.md §9.2, planche refonte_vikings/planche_creation.html) :
//   Stepper     : − valeur +
//   PointStick  : budget en bâton d'entailles (même langage que les points de compétence)
//   SkillOdds   : losange du seuil, explosion, chance d'une réussite standard (lecture « seuil seul »)
//   StepNav     : boutons vers l'étape précédente et la suivante (jamais bloqués, Q-L6-1)
//   TradeAdvice : le conseil « Un métier avant tout » du Guide du joueur
//   RichText    : texte du guide (gras, italique)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { getSuccessThreshold, getExplosionThreshold, getSuccessChance } from '../../config/rules.js';
import { formatExplosion } from '../../config/utils.js';
import { CREATION_STEPS } from '../../config/creation.js';
import { useVkLook } from '../../hooks/useVkLook.js';
import { inlineSegments } from '@/features/reference/tools/reference.js';
import VkIcon from '../ui/VkIcon.jsx';

const BASE_POOL = 3;

export const Stepper = ({ value, onMinus, onPlus, minusDisabled, plusDisabled }) => (
    <div className="vk-stepper">
        <button type="button" onClick={onMinus} disabled={minusDisabled}><VkIcon name="minus" /></button>
        <span className="vk-num">{value}</span>
        <button type="button" onClick={onPlus} disabled={plusDisabled}><VkIcon name="plus" /></button>
    </div>
);

/** Bâton d'entailles : une encoche par point, taillée quand le point est placé. */
export const PointStick = ({ label, left, total }) => (
    <div className={`vk-cr-budget ${left === 0 ? 'is-full' : ''}`}>
        <span className="vk-cr-budget-label">{label}</span>
        <div className="vk-tokens vk-cr-stick">
            {Array.from({ length: total }, (_, i) => <span key={i} className={`vk-token ${i < total - left ? 'is-spent' : ''}`} />)}
        </div>
        <span className="vk-cr-budget-left"><strong className="vk-num">{left}</strong> restant{left > 1 ? 's' : ''} sur {total}</span>
    </div>
);

/** Seuil, explosion et chance d'une réussite standard à 3 dés, pour un niveau et une carac. */
export const SkillOdds = ({ level, caracLevel }) => {
    const [look] = useVkLook();
    const seuil = getSuccessThreshold(level);
    const chance = getSuccessChance(BASE_POOL, seuil, getExplosionThreshold(caracLevel).length, 1);
    return (
        <>
            <div className="vk-skill-rule">
                <span className="vk-seuil" title="Seuil de succès">{seuil}+</span>
                <span className="vk-boom" title="Explosion">↻ {formatExplosion(caracLevel).replace(/, /g, '-')}</span>
            </div>
            {look.odds !== false && <span className="vk-odds" title="Réussite standard, 3 dés">{Math.round(chance * 100)} %</span>}
        </>
    );
};

export const StepNav = ({ step, onGo, onCancel }) => (
    <div className="vk-cr-nav">
        {step === 0
            ? <button type="button" className="vk-btn" onClick={onCancel}>← Retour</button>
            : <button type="button" className="vk-btn" onClick={() => onGo(step - 1)}>← {CREATION_STEPS[step - 1]}</button>}
        <button type="button" className="vk-btn vk-btn-primary" onClick={() => onGo(step + 1)}>{step === 0 ? 'Commencer' : CREATION_STEPS[step + 1]} →</button>
    </div>
);

/** Le conseil du Guide du joueur, à l'accueil et à l'étape Compétences (§9.4, Q-L6-8) */
export const TradeAdvice = ({ paragraphs, children }) => (
    <div className="vk-callout vk-callout-warn vk-cr-advice">
        <span className="vk-label text-primary">Un métier avant tout</span>
        {paragraphs.map((text, i) => <p key={i}><RichText text={text} /></p>)}
        {children}
    </div>
);

/** Texte du guide avec **gras** et *italique* (features/reference/tools/reference.js) */
export const RichText = ({ text }) => inlineSegments(text).map((s, i) => (
    s.bold ? <strong key={i}>{s.text}</strong> : s.italic ? <em key={i}>{s.text}</em> : <React.Fragment key={i}>{s.text}</React.Fragment>
));

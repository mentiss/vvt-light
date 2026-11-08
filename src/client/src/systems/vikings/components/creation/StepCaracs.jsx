// src/client/src/systems/vikings/components/creation/StepCaracs.jsx
// Étape 1 : caractéristiques (spec_vikings.md §4, §4.1). 14 points, 1 au minimum, 4 au plus
// à la création ; pierres levées de la fiche avec stepper et description courte ; usages
// en jeu de la caractéristique survolée ou modifiée (souris comme doigt).

import React, { useState } from 'react';
import { CARAC_DETAILS, CARACNAMES } from '../../config/competences.js';
import { CREATION, getCreationBudget } from '../../config/creation.js';
import { formatExplosion } from '../../config/utils.js';
import { PointStick, Stepper } from './CreationParts.jsx';

const BASE_POINTS = Object.keys(CARACNAMES).length * CREATION.minCarac;   // 1 d'office dans chacune

const StepCaracs = ({ character, set }) => {
    const [active, setActive] = useState(null);
    const left = getCreationBudget(character).caracLeft;

    return (
        <>
            <p className="vk-cr-lead">
                Répartissez {CREATION.caracPoints} points entre les six caractéristiques : {CREATION.minCarac} au minimum
                (déjà placé), {CREATION.maxCarac} au plus à la création. La caractéristique fixe l'explosion des dés.
            </p>
            <PointStick label="Points" left={left} total={CREATION.caracPoints - BASE_POINTS} />
            <p className="vk-cr-rules">Explosion : niveau 1-2 → 10 · niveau 3-4 → 9, 10 · niveau 5 → 8, 9, 10.</p>
            <div className="vk-cr-caracs">
                {Object.entries(CARACNAMES).map(([key, label]) => {
                    const level = character[key];
                    const change = (delta) => { set(key, level + delta); setActive(key); };
                    return (
                        <div key={key} className={`vk-stat ${active === key ? 'is-active' : ''}`}
                             onMouseEnter={() => setActive(key)} onClick={() => setActive(key)}>
                            <div className="val">{level}</div>
                            <div className="lbl">{label}</div>
                            <div className="vk-cr-carac-desc">{CARAC_DETAILS[key].description}</div>
                            <div className="sub">expl. {formatExplosion(level)}</div>
                            <Stepper value={level}
                                     onMinus={() => change(-1)} minusDisabled={level <= CREATION.minCarac}
                                     onPlus={() => change(1)} plusDisabled={level >= CREATION.maxCarac || left <= 0} />
                        </div>
                    );
                })}
            </div>
            <div className="vk-callout vk-cr-usages">
                {active
                    ? <><span className="vk-label text-primary">{CARACNAMES[active]} en jeu : </span>{CARAC_DETAILS[active].usages}</>
                    : <span className="text-muted italic">Survolez ou touchez une caractéristique pour voir ses usages en jeu.</span>}
            </div>
        </>
    );
};

export default StepCaracs;

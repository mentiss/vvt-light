// src/client/src/systems/cyberpunk/components/creation/CreationRail.jsx
// Rail des étapes (spec §9.1) : étapes faites rouvrables d'un clic (coche, résumé),
// étape en cours allumée, suivantes fermées tant que les précédentes manquent.
import React from 'react';
import { CREATION_STEPS, stepRemaining, stepReachable } from '../../config.jsx';
import CpIcon from '../ui/CpIcon.jsx';

// Faite = déjà atteinte et sans choix restant ; une étape jamais ouverte n'est pas cochée
const isDone = (s, draft, visited) => s.id !== 9 && s.id <= visited && stepRemaining(s.id, draft) === 0;

const CreationRail = ({ step, visited, draft, summaries, onGo }) => {
    const done = CREATION_STEPS.filter(s => isDone(s, draft, visited)).length;
    const total = CREATION_STEPS.length - 1;
    return (
        <nav className="cp-panel cp-cr-rail cp-scroll" aria-label="Étapes de la création">
            <div className="cp-cr-rail-head">Progression <b>{done}/{total}</b></div>
            {/* Largeur dynamique : seule valeur en style */}
            <div className="cp-cr-rail-bar"><i style={{ width: `${Math.round(done / total * 100)}%` }} /></div>
            {CREATION_STEPS.map(s => {
                const current = s.id === step;
                const complete = isDone(s, draft, visited);
                // Dépassée sans être finie (étape non bloquante) : repère « à finir »
                const todo = !current && s.id !== 9 && s.id <= visited && !complete;
                const reachable = stepReachable(s.id, draft);
                return (
                    <button key={s.id} type="button" disabled={!reachable && !current} onClick={() => onGo(s.id)}
                            className={`cp-cr-step ${current ? 'is-current' : ''} ${complete && !current ? 'is-done' : ''} ${todo ? 'is-todo' : ''}`}
                            aria-current={current ? 'step' : undefined}>
                        <span className="num">{String(s.id).padStart(2, '0')}</span>
                        <span className="lbl">{s.label}</span>
                        {complete && !current ? <CpIcon name="check" size="sm" /> : <span />}
                        <span className="sub">{current ? 'en cours' : todo ? `à finir · ${stepRemaining(s.id, draft)} choix` : summaries[s.id] ?? ''}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default CreationRail;

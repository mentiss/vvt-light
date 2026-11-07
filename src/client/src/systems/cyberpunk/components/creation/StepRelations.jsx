// src/client/src/systems/cyberpunk/components/creation/StepRelations.jsx
// Étape 6 : deux à trois relations, avec leur score de Lien (−3 à +3).
import React from 'react';
import { CREATION_RELATIONS, stepRemaining } from '../../config.jsx';
import { Card } from '../layout/Card.jsx';
import { StepHead } from './CreationParts.jsx';
import CpIcon from '../ui/CpIcon.jsx';

const sign = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '±0');
const linkClass = (v) => (v > 0 ? 'is-pos' : v < 0 ? 'is-neg' : 'is-zero');

const StepRelations = ({ relations, onAdd, onUpdate, onRemove }) => (
    <>
        <StepHead num={6} title="Relations" remaining={stepRemaining(6, { relations })} unit={['relation à nommer', 'relations à nommer']}
                  sub={`${CREATION_RELATIONS.min} à ${CREATION_RELATIONS.max} personnes qui comptent. Le Lien va de −3 (ennemi) à +3 (confident).`} />
        <Card title="Liens">
            {relations.map((r, i) => (
                <div key={i} className="cp-cr-rel">
                    <span className="cp-stepper">
                        <button type="button" className="cp-step" aria-label="Lien −1" onClick={() => onUpdate(i, { link_score: Math.max(-3, r.link_score - 1) })}>−</button>
                        <span className={`cp-cr-link ${linkClass(r.link_score)}`}>{sign(r.link_score)}</span>
                        <button type="button" className="cp-step" aria-label="Lien +1" onClick={() => onUpdate(i, { link_score: Math.min(3, r.link_score + 1) })}>+</button>
                    </span>
                    <input className="cp-input" value={r.name} placeholder="Nom de la relation" aria-label="Nom de la relation"
                           onChange={e => onUpdate(i, { name: e.target.value })} />
                    {relations.length > CREATION_RELATIONS.min
                        ? <button type="button" className="cp-icon-btn is-danger" aria-label="Retirer la relation" onClick={() => onRemove(i)}><CpIcon name="close" size="sm" /></button>
                        : <span />}
                    <input className="cp-input is-sm is-desc" value={r.description} placeholder="Qui c'est, ce qui vous lie…" aria-label="Description"
                           onChange={e => onUpdate(i, { description: e.target.value })} />
                </div>
            ))}
            {relations.length < CREATION_RELATIONS.max && (
                <button type="button" className="cp-add" onClick={onAdd}>+ Ajouter une relation</button>
            )}
        </Card>
    </>
);

export default StepRelations;

// src/client/src/systems/cyberpunk/components/creation/StepDirectives.jsx
// Étape 5 : deux directives personnelles ; celles à trou se complètent sur place.
import React from 'react';
import { DIRECTIVES_PERSONNELLES, CREATION_DIRECTIVE_PICKS } from '../../config.jsx';
import { Card } from '../layout/Card.jsx';
import { StepHead, PickCard } from './CreationParts.jsx';

const StepDirectives = ({ directives, onToggle, onBlank }) => {
    const count = directives.filter(d => d.selected).length;
    const full = count >= CREATION_DIRECTIVE_PICKS;
    return (
        <>
            <StepHead num={5} title="Directives" remaining={Math.max(0, CREATION_DIRECTIVE_PICKS - count)} unit={['directive à choisir', 'directives à choisir']}
                      sub="Tes moteurs : agir en accord avec elles te rapporte de l'expérience." />
            <Card title="Directives personnelles">
                <div className="cp-cr-cards">
                    {DIRECTIVES_PERSONNELLES.map(def => {
                        const d = directives.find(x => x.id === def.id);
                        const on = !!d?.selected;
                        // Le champ à compléter est sous la carte (pas de champ dans un bouton)
                        return (
                            <div key={def.id} className="flex flex-col gap-1">
                                <PickCard on={on} disabled={!on && full} onClick={() => onToggle(def.id)}
                                          name={def.label} hint={def.hasBlank ? def.blankHint : null} />
                                {on && def.hasBlank && (
                                    <input className="cp-input is-sm" value={d.blankValue} placeholder={def.blankHint}
                                           aria-label={`${def.label} : ${def.blankHint}`}
                                           onChange={e => onBlank(def.id, e.target.value)} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </>
    );
};

export default StepDirectives;

// src/client/src/systems/dune/components/layout/DuneNPCForm.jsx
// Formulaire PNJ Dune (onglet PNJ générique), à l'image de la fiche :
// 5 compétences (rang 1 à 12, spécialisation au rang 6) et 5 principes (rang 1 à 8,
// maxime au rang 6). Valeurs par défaut (rang 4) posées une fois, hors du rendu.
// Props : slugForm { competences[], principes[] }, onChange(field, value)

import React, { useEffect } from 'react';
import { DuneStepper } from '../ui/DuneFields.jsx';
import { COMPETENCES, PRINCIPES, traitLabel } from '../../config/traits.js';

const COMPETENCE_MAX   = 12;
const PRINCIPE_MAX     = 8;
const TEXT_UNLOCK_RANK = 6;

const defaults = (traits, textKey) => traits.map(t => ({ key: t.key, rang: 4, [textKey]: '' }));

const Column = ({ title, traits, entries, textKey, max, placeholder, onChange }) => (
    <div>
        <h3 className="dn-title">{title}</h3>
        {traits.map(({ key }, idx) => {
            const e = entries[idx];
            const update = (fields) => onChange(entries.map((x, i) => (i === idx ? { ...x, ...fields } : x)));
            return (
                <div key={key} className="dn-row is-static">
                    <DuneStepper value={e.rang} min={1} max={max} label={traitLabel(key)} onChange={rang => update({ rang })} />
                    <span className="dn-row-main flex flex-col gap-1">
                        <span className="dn-row-name">{traitLabel(key)}</span>
                        {e.rang >= TEXT_UNLOCK_RANK && (
                            <input className="vtt-input" placeholder={placeholder} value={e[textKey] ?? ''}
                                   onChange={ev => update({ [textKey]: ev.target.value })} />
                        )}
                    </span>
                </div>
            );
        })}
    </div>
);

const DuneNPCForm = ({ slugForm, onChange }) => {
    const competences = slugForm.competences ?? defaults(COMPETENCES, 'specialisation');
    const principes   = slugForm.principes   ?? defaults(PRINCIPES, 'maxime');

    // PNJ neuf : les rangs par défaut entrent dans le formulaire une seule fois
    useEffect(() => {
        if (!slugForm.competences) onChange('competences', defaults(COMPETENCES, 'specialisation'));
        if (!slugForm.principes)   onChange('principes', defaults(PRINCIPES, 'maxime'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="dn-traits">
            <Column title="Principes" traits={PRINCIPES} entries={principes} textKey="maxime" max={PRINCIPE_MAX}
                    placeholder="Maxime…" onChange={v => onChange('principes', v)} />
            <Column title="Compétences" traits={COMPETENCES} entries={competences} textKey="specialisation" max={COMPETENCE_MAX}
                    placeholder="Spécialisation…" onChange={v => onChange('competences', v)} />
        </div>
    );
};

export default DuneNPCForm;

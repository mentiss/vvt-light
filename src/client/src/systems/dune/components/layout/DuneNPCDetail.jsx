// src/client/src/systems/dune/components/layout/DuneNPCDetail.jsx
// Détail d'un PNJ Dune (onglet PNJ générique) : compétences et principes en
// médaillons, comme la fiche (lecture seule ; les jets passent par les jets rapides).

import React from 'react';
import { COMPETENCES, PRINCIPES, traitLabel } from '../../config/traits.js';

const TraitList = ({ title, hint, traits, entries, textKey, isQuote }) => (
    <div>
        <h3 className="dn-title">{title}<small>{hint}</small></h3>
        {traits.map(({ key }) => {
            const e = entries.find(x => x.key === key);
            if (!e) return null;
            return (
                <div key={key} className="dn-row is-static">
                    <span className="dn-hex"><span>{e.rang}</span></span>
                    <span className="dn-row-main">
                        <span className="dn-row-name">{traitLabel(key)}</span>
                        <span className={`dn-row-sub${isQuote && e[textKey] ? ' is-quote' : ''}`}>
                            {e[textKey] ? (isQuote ? e[textKey] : <span className="dn-spec">{e[textKey]}</span>) : '—'}
                        </span>
                    </span>
                </div>
            );
        })}
    </div>
);

const DuneNPCDetail = ({ npc }) => (
    <div className="dn-traits">
        <TraitList title="Compétences" hint="Spécialisation" traits={COMPETENCES}
                   entries={npc.system_data?.competences ?? []} textKey="specialisation" />
        <TraitList title="Principes" hint="Maxime" traits={PRINCIPES}
                   entries={npc.system_data?.principes ?? []} textKey="maxime" isQuote />
    </div>
);

export default DuneNPCDetail;

// src/client/src/systems/vileborn/components/creation/CreationHelp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Colonne d'aide de l'assistant (spec_vileborn.md §II.7) : décrit l'élément
// survolé, touché ou choisi. Les onglets annoncent leurs éléments par
// helpProps(show, topic) ; les textes viennent des catalogues (config/*).
//   topic : { kind, key } — kind : tab, heritage, origin, approach, distribution,
//           words, resource
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext } from 'react';
import {
    HERITAGES, ORIGINS, RESOURCES, APPROACHES, TAB_HELP, WORDS_HELP, DISTRIBUTION_HELP,
} from '../../config.jsx';

const HelpContext = createContext(() => {});
export const HelpProvider = HelpContext.Provider;
export const useHelp = () => useContext(HelpContext);

/** Props à poser sur un élément pour qu'il affiche son aide (survol, focus) */
export const helpProps = (show, topic) => ({ onMouseEnter: () => show(topic), onFocus: () => show(topic) });

/** Contenu de l'aide : { title, kicker?, paragraphs: string[], gifts? } */
const helpEntry = ({ kind, key } = {}) => {
    switch (kind) {
    case 'heritage': {
        const h = HERITAGES[key];
        return { kicker: 'Sombre héritage', title: h.name, paragraphs: [h.text, `Exemples : ${h.examples}`, `Pulsion : ${h.urge}.`], gifts: h.gifts };
    }
    case 'origin': {
        const o = ORIGINS[key];
        return { kicker: 'Origine', title: o.name, paragraphs: [o.text, o.effect] };
    }
    case 'approach': {
        const a = APPROACHES.find(x => x.key === key);
        return { kicker: 'Approche', title: a.label, paragraphs: [a.text, TAB_HELP.approaches.text] };
    }
    case 'distribution':
        return { title: DISTRIBUTION_HELP.title, paragraphs: [DISTRIBUTION_HELP.text] };
    case 'words':
        return { kicker: 'Personnalité et Formation', title: WORDS_HELP[key].title, paragraphs: [WORDS_HELP[key].text] };
    case 'resource': {
        const r = RESOURCES[key];
        return { kicker: 'Ressource', title: r.name, paragraphs: [r.effect] };
    }
    default: {
        const t = TAB_HELP[key] ?? { title: '', text: 'Survolez ou touchez un élément : sa description s’affiche ici.' };
        return { title: t.title, paragraphs: [t.text] };
    }
    }
};

/** La colonne d'aide ; onBack : revenir à l'aide de l'onglet */
export const HelpPanel = ({ topic, onBack }) => {
    const entry = helpEntry(topic);
    return (
        <aside className="vil-help" aria-live="polite">
            {topic?.kind !== 'tab' && <button type="button" className="vil-help-back" onClick={onBack}>← Aide de l'onglet</button>}
            {entry.kicker && <div className="vil-help-kicker">{entry.kicker}</div>}
            <div className="vil-help-title">{entry.title}</div>
            {entry.paragraphs.map((p, i) => <p key={i} className={i > 0 ? 'vil-effect' : undefined}>{p}</p>)}
            {entry.gifts?.map(g => (
                <div key={g.key} style={{ marginTop: 10 }}>
                    <div className="vil-name vil-red">{g.name}</div>
                    <p>{g.effect}</p>
                    <p className="vil-effect"><i>Cependant,</i> {g.drawback}</p>
                </div>
            ))}
        </aside>
    );
};

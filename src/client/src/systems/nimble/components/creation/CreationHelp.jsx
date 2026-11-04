// src/client/src/systems/nimble/components/creation/CreationHelp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Colonne d'aide de l'assistant (spec_nimble.md §6.3) : décrit l'élément
// survolé, touché ou choisi. Les onglets annoncent leurs éléments par
// helpProps(show, topic) ; les textes viennent des catalogues (config/*).
//   topic : { kind, key } — kind : tab, class, ancestry, background, array, skill, motivation
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext } from 'react';
import { STAT_BY_KEY, SKILL_BY_KEY, STAT_ARRAYS } from '../../config/basics.js';
import { CLASSES, ANCESTRY_BY_KEY, BACKGROUND_BY_KEY } from '../../config/catalog.js';
import { MOTIVATIONS } from '../../config/motivations.js';
import { TAB_HELP, ARRAY_HELP, COMPLEXITY } from '../../config/descriptions.js';
import { NbRich } from '../ui/NbUi.jsx';

const HelpContext = createContext(() => {});
export const HelpProvider = HelpContext.Provider;
export const useHelp = () => useContext(HelpContext);

/** Props à poser sur un élément pour qu'il affiche son aide (survol, focus) */
export const helpProps = (show, topic) => ({ onMouseEnter: () => show(topic), onFocus: () => show(topic) });

const stat = (k) => STAT_BY_KEY[k]?.label ?? k;

const ClassHelp = ({ c }) => (
    <>
        <p><i>{c.tagline}.</i> {c.summary}</p>
        <div className="nb-line"><span className="nb-line-meta">
            Clés {c.keyStats.map(stat).join(' et ')} · d{c.hitDie} · {c.startingHp} PV · {stat(c.saves.adv)} ▲ {stat(c.saves.dis)} ▼ · {COMPLEXITY[c.complexity] ?? ''}
        </span></div>
        <p className="nb-line-meta">Armures : {c.armor?.text}. Armes : {c.weapons?.text}.</p>
        {[1, 2].map(l => (c.levels[l] ?? []).map(f => (
            <div key={`${l}-${f.key}`} className="nb-line">
                <div className="nb-line-main"><span className="nb-line-name">{f.name}</span> <span className="nb-line-meta">niv. {l}{f.cost ? ` · ${f.cost}` : ''}</span></div>
                <NbRich text={f.text} className="nb-line-text" />
            </div>
        )))}
        <p className="nb-help-kicker mt-2">Sous-classes au niveau 3</p>
        <p className="nb-line-meta">{c.subclasses.map(s => s.name).join(' · ')}</p>
    </>
);

/** La colonne d'aide ; onBack : revenir à l'aide de l'onglet */
export const HelpPanel = ({ topic, onBack }) => {
    const { kind, key } = topic ?? {};
    let kicker = null;
    let title = '';
    let body = null;
    if (kind === 'class' && CLASSES[key]) {
        kicker = 'Classe'; title = CLASSES[key].name; body = <ClassHelp c={CLASSES[key]} />;
    } else if (kind === 'ancestry' && ANCESTRY_BY_KEY[key]) {
        const a = ANCESTRY_BY_KEY[key];
        kicker = 'Ascendance'; title = a.name;
        body = <><p>{a.text}</p><p className="mt-2"><b>{a.trait?.name}.</b> {a.trait?.text}</p></>;
    } else if (kind === 'background' && BACKGROUND_BY_KEY[key]) {
        const b = BACKGROUND_BY_KEY[key];
        kicker = 'Historique'; title = b.name; body = <NbRich text={b.text} />;
    } else if (kind === 'array') {
        const a = STAT_ARRAYS.find(x => x.key === key);
        kicker = 'Tableau'; title = a?.label; body = <p>{a?.values.map(v => (v >= 0 ? `+${v}` : `−${-v}`)).join(', ')} : {ARRAY_HELP[key]}</p>;
    } else if (kind === 'skill' && SKILL_BY_KEY[key]) {
        const s = SKILL_BY_KEY[key];
        kicker = `Compétence (${stat(s.stat)})`; title = s.label; body = <p>{s.text}</p>;
    } else if (kind === 'motivation') {
        const m = MOTIVATIONS.find(x => x.key === key);
        kicker = 'Motivation'; title = m?.name; body = <p>{m?.text}</p>;
    } else {
        const t = TAB_HELP[key] ?? { title: '', text: 'Survolez ou touchez un élément : sa description s\'affiche ici.' };
        title = t.title; body = <p>{t.text}</p>;
    }
    return (
        <aside className="nb-help" aria-live="polite">
            {kind !== 'tab' && <button type="button" className="nb-help-back" onClick={onBack}>← Aide de l'onglet</button>}
            {kicker && <div className="nb-help-kicker">{kicker}</div>}
            <div className="nb-help-title">{title}</div>
            <div className="mt-2">{body}</div>
        </aside>
    );
};

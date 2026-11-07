// src/client/src/systems/cyberpunk/components/creation/StepChrome.jsx
// Étape 7 : chrome (spec_cyberpunk.md §9.2, planche_creation.html).
//   Socle d'office · console du Netrunner (intégrée ou Prise de console) · cyberware
//   de l'archétype (2 pour l'Assassin, imposé pour le Nomad) · offert et Chromé, pris
//   dans tout le catalogue avec leurs défauts · fashionware offert, facultatif.
//   Les types imposés (Cyberarmement de corps…) se choisissent sous la carte.
import React, { useState } from 'react';
import {
    CYBERWARE_ALL, ITEM_AND_CYBERWARE_CATEGORY_LABEL, CHROME_BASE, TAG_SUGGESTIONS_BY_TYPE,
    findPlaybook, findCyberware, chromeAllowance, cyberwareDefects, freeChromeSlots, tagChoicesOf, chromeRemaining,
} from '../../config.jsx';
import { Card } from '../layout/Card.jsx';
import { StepHead, PickCard, ConfigBox, TagChoices, DefectPicker } from './CreationParts.jsx';

const catLabel = (cat) => ITEM_AND_CYBERWARE_CATEGORY_LABEL[cat] ?? cat;
const DEFECT_SUGGESTIONS = TAG_SUGGESTIONS_BY_TYPE.cyberware.filter(t => t.variant === 'negative').map(t => t.text);

/** Carte d'un cyberware du catalogue. */
const CwCard = ({ cw, on, disabled, onClick, slot }) => {
    const defects = slot ? cyberwareDefects(cw.name, slot) : 0;
    const showDefects = slot === 'offered' || defects > 0;
    return (
        <PickCard on={on} disabled={disabled} onClick={onClick} name={cw.name} cat={catLabel(cw.category)}
                  desc={cw.description} hint={cw.optionHint} tags={cw.tags}>
            {tagChoicesOf(cw).length > 0 && <div className="cp-cr-card-hint">{tagChoicesOf(cw).map(c => `${c.label} à choisir`).join(' · ')}</div>}
            {showDefects && <div className={`cp-cr-defects ${defects ? '' : 'is-zero'}`}>{defects ? `${defects} tag${defects > 1 ? 's' : ''} négatif${defects > 1 ? 's' : ''}${slot === 'offered' ? ' si offert' : ' à choisir'}` : 'sans défaut'}</div>}
        </PickCard>
    );
};

/** Réglages d'un cyberware choisi : défauts (offert, Chromé) et types imposés. */
const CwConfig = ({ name, slot, config = {}, onConfig }) => {
    const cw = findCyberware(name);
    const choices = tagChoicesOf(cw);
    const need = cyberwareDefects(name, slot);
    if (!need && !choices.length) return null;
    return (
        <ConfigBox title={name} got={config.defects?.length ?? 0} need={need} label={need > 1 ? 'défauts' : 'défaut'}>
            {choices.length > 0 && (
                <TagChoices choices={choices} value={config.choices} onChange={(label, v) => onConfig(name, { choices: { ...config.choices, [label]: v } })} />
            )}
            {need > 0 && (
                <DefectPicker need={need} value={config.defects} suggestions={DEFECT_SUGGESTIONS} onChange={v => onConfig(name, { defects: v })} />
            )}
        </ConfigBox>
    );
};

const StepChrome = ({ draft, onChrome, onConfig }) => {
    const [query, setQuery] = useState('');
    const [cat, setCat] = useState('all');
    const pb = findPlaybook(draft.playbook);
    const allow = chromeAllowance(draft.playbook, draft.moveObjs.map(m => m.name));
    const { chrome, chromeConfig: cfg } = draft;
    const freeMax = freeChromeSlots(draft);
    const taken = new Set([chrome.console, ...chrome.archetype, ...chrome.free, chrome.cosmetic].filter(Boolean));
    const mandatory = pb?.mandatoryCyberware ?? null;

    // Liste à un choix : un clic remplace ; à plusieurs : ajoute jusqu'au maximum
    const toggleIn = (key, name, max) => {
        const list = chrome[key];
        if (list.includes(name)) return onChrome({ [key]: list.filter(n => n !== name) });
        if (list.length < max) return onChrome({ [key]: [...list, name] });
        if (max === 1) return onChrome({ [key]: [name] });
        return undefined;
    };

    const archetypeList = (pb?.cyberware ?? []).map(findCyberware).filter(Boolean);
    const consoleList = (pb?.console ?? []).map(findCyberware).filter(Boolean);
    const cosmetics = CYBERWARE_ALL.filter(cw => cw.cosmetic);
    const q = query.trim().toLowerCase();
    const catalog = CYBERWARE_ALL.filter(cw => (cat === 'all' || cw.category === cat)
        && (!q || `${cw.name} ${cw.description ?? ''}`.toLowerCase().includes(q)));
    const cats = [...new Set(CYBERWARE_ALL.map(cw => cw.category))];

    return (
        <>
            <StepHead num={7} title="Chrome" remaining={chromeRemaining(draft)} unit={['choix restant', 'choix restants']}
                      sub="Ce que tu as dans la peau. Le socle est d'office ; le reste se choisit dans le catalogue de la fiche." />

            <Card title="Socle commun" action={<span className="cp-cr-badge is-done">d'office</span>}>
                <p className="cp-cr-rule">{CHROME_BASE}. Hors slot, sur toutes les fiches.</p>
            </Card>

            {allow.console && (
                <Card title="Console du Netrunner" action={<span className="cp-cr-badge is-req">imposée · 1 au choix</span>}>
                    <div className="cp-cr-duo">
                        {consoleList.map(cw => (
                            <PickCard key={cw.name} on={chrome.console === cw.name} onClick={() => onChrome({ console: chrome.console === cw.name ? null : cw.name })}
                                      name={cw.name} desc={cw.description} tags={cw.tags}
                                      hint={cw.name === 'Prise de console' ? '+ Deck externe dans ton kit (confiscable, personnalisable, nommable)' : null} />
                        ))}
                    </div>
                    {chrome.console && <div className="cp-cr-configs"><CwConfig name={chrome.console} slot="console" config={cfg[chrome.console]} onConfig={onConfig} /></div>}
                </Card>
            )}

            <Card title={`Cyberware de l'archétype — ${pb?.label ?? ''}`}
                  action={<span className="cp-cr-badge is-req">{mandatory ? 'imposé' : `${allow.archetype} dans ta liste`}</span>}>
                <div className="cp-cr-cards">
                    {archetypeList.map(cw => {
                        const on = chrome.archetype.includes(cw.name);
                        return (
                            <CwCard key={cw.name} cw={cw} on={on} slot="archetype"
                                    disabled={cw.name === mandatory || (!on && taken.has(cw.name)) || (!on && allow.archetype > 1 && chrome.archetype.length >= allow.archetype)}
                                    onClick={() => toggleIn('archetype', cw.name, allow.archetype)} />
                        );
                    })}
                </div>
                <div className="cp-cr-configs">
                    {chrome.archetype.map(n => <CwConfig key={n} name={n} slot="archetype" config={cfg[n]} onConfig={onConfig} />)}
                </div>
            </Card>

            <Card title="Offert et Chromé" action={<span className="cp-cr-badge is-req">{freeMax} dans tout le catalogue</span>}>
                <p className="cp-cr-rule">
                    Pris <b>dans tout le catalogue</b>, mais <b>de mauvaise qualité</b> : chaque implant arrive avec des tags négatifs,
                    d'autant plus qu'il est puissant. Un pour tous{allow.chrome ? <>, un de plus grâce à <b>Chromé</b></> : ''}.
                </p>
                {/* Réglages des implants choisis au-dessus du catalogue : visibles sans descendre */}
                <div className="cp-cr-configs">
                    {chrome.free.map(n => <CwConfig key={n} name={n} slot="offered" config={cfg[n]} onConfig={onConfig} />)}
                </div>
                <div className="cp-cr-tools">
                    <input className="cp-input" value={query} placeholder="Chercher : sandevistan, optique, bras…" aria-label="Chercher un cyberware"
                           onChange={e => setQuery(e.target.value)} />
                    <div className="cp-cr-cats">
                        <button type="button" className={cat === 'all' ? 'is-on' : ''} onClick={() => setCat('all')}>Tout</button>
                        {cats.map(c => <button key={c} type="button" className={cat === c ? 'is-on' : ''} onClick={() => setCat(c)}>{catLabel(c)}</button>)}
                    </div>
                </div>
                <div className="cp-cr-cards">
                    {catalog.map(cw => {
                        const on = chrome.free.includes(cw.name);
                        return (
                            <CwCard key={cw.name} cw={cw} on={on} slot="offered"
                                    disabled={!on && (taken.has(cw.name) || (freeMax > 1 && chrome.free.length >= freeMax))}
                                    onClick={() => toggleIn('free', cw.name, freeMax)} />
                        );
                    })}
                </div>
            </Card>

            <Card title="Fashionware offert" action={<span className="cp-cr-badge is-opt">facultatif · sans défaut</span>}>
                <div className="cp-cr-cards">
                    {cosmetics.map(cw => (
                        <CwCard key={cw.name} cw={cw} on={chrome.cosmetic === cw.name} disabled={chrome.cosmetic !== cw.name && taken.has(cw.name)}
                                onClick={() => onChrome({ cosmetic: chrome.cosmetic === cw.name ? null : cw.name })} />
                    ))}
                </div>
            </Card>
        </>
    );
};

export default StepChrome;

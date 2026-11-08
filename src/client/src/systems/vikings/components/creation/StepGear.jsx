// src/client/src/systems/vikings/components/creation/StepGear.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Étape 5 : équipement, le kit de départ (spec_vikings_pierre_peinte.md §9.5).
// Ce que donne le métier (compétences de métier dès le niveau 1), ce que donnent les
// traits (objets, choix, objets à nommer, argent), le marché (10 oz modifiés par les
// traits, catalogue avec prix, sans l'acier d'après 830) et le paquetage.
// Un objet du kit se retire et se remet ; un objet déjà donné ailleurs n'arrive qu'une fois.
// Les règles sont dans config/creation.js (getCreationKit), les kits dans config/kits.js.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { CREATION_MARKET, formatItemNote as itemNote, getCreationKit } from '../../config/creation.js';
import { ITEMS } from '../../config/equipment.js';
import { STARTING_SILVER } from '../../config/kits.js';
import VkIcon from '../ui/VkIcon.jsx';
import VkPanel from '../ui/VkPanel.jsx';
import { Pack } from './CreationSummary.jsx';

const MARKET_FILTERS = [['all', 'Tout'], ['weapon', 'Armes'], ['armor', 'Armures'], ['item', 'Objets']];
const def = (name) => ITEMS.find(i => i.name === name) ?? { name, category: 'item' };
const silverText = (n) => `${n} oz d'argent`;

const KitRow = ({ row, setGear }) => {
    const toggleOff = () => setGear(g => ({ ...g, off: g.off.includes(row.key) ? g.off.filter(k => k !== row.key) : [...g.off, row.key] }));
    const pick = (i) => setGear(g => ({ ...g, pick: { ...g.pick, [row.key]: i } }));
    const name = (value) => setGear(g => ({ ...g, names: { ...g.names, [row.key]: value } }));

    if (row.type === 'item') {
        if (row.duplicateOf) return <span className="vk-cr-kit-item is-dup">{row.name}<small>déjà donné ({row.duplicateOf})</small></span>;
        return (
            <span className={`vk-cr-kit-item ${row.removed ? 'is-removed' : ''}`}>
                {row.name}<small>{itemNote(def(row.name))}</small>
                <button type="button" className="vk-cr-kit-x" onClick={toggleOff} title={row.removed ? 'Remettre' : 'Retirer'}>
                    {row.removed ? '↺' : <VkIcon name="close" />}
                </button>
            </span>
        );
    }
    if (row.type === 'silver') return <span className="vk-cr-kit-item is-silver">{silverText(row.silver)}<small>dans la bourse</small></span>;
    if (row.type === 'named') {
        return (
            <label className="vk-cr-kit-named">
                <span>{row.label}</span>
                <input className="vk-input" value={row.value} onChange={e => name(e.target.value)} placeholder={row.hint} />
            </label>
        );
    }
    const label = row.type === 'heirloom' ? 'Arme de famille :' : 'Au choix :';
    return (
        <span className="vk-cr-kit-choice">
            <span className="text-muted">{label}</span>
            {row.options.map((option, i) => (
                <button key={typeof option === 'string' ? option : `silver-${option.silver}`} type="button"
                        className={`vk-pill ${row.pick === i ? 'is-selected' : ''}`} onClick={() => pick(i)}>
                    {typeof option === 'string' ? option : silverText(option.silver)}
                </button>
            ))}
            {row.type === 'heirloom' && row.pick != null && (
                <input className="vk-input vk-cr-kit-heirloom" value={row.value} onChange={e => name(e.target.value)} placeholder="Son nom (facultatif)" />
            )}
        </span>
    );
};

const KitBlock = ({ lines, empty, setGear }) => (lines.length === 0
    ? <p className="text-sm text-muted italic">{empty}</p>
    : lines.map(line => (
        <div key={line.source} className="vk-cr-kit-source">
            <span className="vk-cr-kit-source-name">{line.source}</span>
            <div className="vk-cr-kit-items">{line.rows.map(row => <KitRow key={row.key} row={row} setGear={setGear} />)}</div>
        </div>
    )));

const StepGear = ({ character, gear, setGear }) => {
    const [filter, setFilter] = useState('all');
    const kit = getCreationKit(character, gear);
    const { silver } = kit;
    const why = [
        silver.base === 0 ? 'pas d’argent de départ (trait)' : `${silver.base} de départ${silver.base > STARTING_SILVER ? ' (doublés : Fin négociant)' : ''}`,
        silver.bonus ? `+ ${silver.bonus} des traits` : null,
    ].filter(Boolean).join(' ');
    const market = CREATION_MARKET.filter(i => filter === 'all' || i.category === filter);
    const buy = (name) => setGear(g => ({ ...g, bought: [...g.bought, name] }));
    const giveBack = (index) => setGear(g => ({ ...g, bought: g.bought.filter((_, i) => i !== index) }));

    return (
        <>
            <p className="vk-cr-lead">
                Votre équipement découle de votre personnage : vos métiers donnent leurs outils, vos traits et backgrounds
                complètent. Le reste s'achète avec un peu d'argent. Le MJ ajuste ensuite avec vous.
            </p>
            <div className="vk-cr-gear">
                <section>
                    <h4 className="vk-cr-subtitle">Votre métier vous donne</h4>
                    <KitBlock lines={kit.lines.filter(l => l.kind === 'skill')} setGear={setGear}
                              empty="Aucune compétence de métier : pas d'outils. Un métier avant tout, dit le guide." />
                </section>
                <section>
                    <h4 className="vk-cr-subtitle">Vos traits vous donnent</h4>
                    <KitBlock lines={kit.lines.filter(l => l.kind === 'trait')} setGear={setGear}
                              empty="Vos traits ne donnent rien de particulier." />
                </section>
                <section>
                    <h4 className="vk-cr-subtitle">Le marché</h4>
                    <div className="vk-cr-market-purse">
                        <span>Bourse : <strong className="vk-num">{silver.left}</strong> oz sur {silver.total}</span>
                        <span className="text-muted text-sm">{why}</span>
                    </div>
                    {silver.left < 0 && <div className="vk-callout vk-callout-danger text-sm mb-3">Vos achats dépassent la bourse : rendez-en quelques-uns.</div>}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {MARKET_FILTERS.map(([id, label]) => (
                            <button key={id} type="button" className={`vk-pill ${filter === id ? 'is-selected' : ''}`} onClick={() => setFilter(id)}>{label}</button>
                        ))}
                    </div>
                    <div className="vk-cr-market">
                        {market.map(item => (
                            <div key={item.name} className="vk-cr-market-row">
                                <span><strong>{item.name}</strong> <small className="text-muted">{itemNote(item)}</small></span>
                                <span className="vk-num">{item.price} oz</span>
                                <button type="button" className="vk-btn vk-btn-sm" onClick={() => buy(item.name)} disabled={item.price > silver.left}>Acheter</button>
                            </div>
                        ))}
                    </div>
                    {gear.bought.length > 0 && (
                        <div className="vk-cr-bought">
                            <span className="vk-vital-label">Vos achats</span>
                            {gear.bought.map((name, i) => (
                                <span key={`${name}-${i}`} className="vk-cr-kit-item">
                                    {name}<small>{def(name).price} oz</small>
                                    <button type="button" className="vk-cr-kit-x" onClick={() => giveBack(i)} title="Rendre"><VkIcon name="close" /></button>
                                </span>
                            ))}
                        </div>
                    )}
                </section>
                <VkPanel className="vk-cr-pack-slab">
                    <h3 className="vk-band-title">Votre paquetage</h3>
                    <Pack items={kit.items} silver={silver.left} />
                </VkPanel>
            </div>
        </>
    );
};

export default StepGear;

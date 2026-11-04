// src/client/src/systems/nimble/components/layout/NbSections.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sections de la fiche (spec_nimble.md §6.2), partagées par la fiche joueur et
// la fiche MJ. Chaque section reçoit { c, act, ask } :
//   act : actions de jeu (useNbActions) ; absent : lecture seule
//   ask(kind, data) : demande une fenêtre (rendue par NbSheet, à côté de la feuille)
// Les dérivés viennent de config/rules/character.js, jamais recalculés ici.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { CONDITION_BY_KEY, MAX_ACTIONS } from '../../config/basics.js';
import { LANGUAGE_BY_KEY, SCHOOL_BY_KEY } from '../../config/catalog.js';
import { signed } from '../../config/rules/formula.js';
import {
    attacksOf, resourcesOf, featuresOf, featureUses, formulaVars, pendingChoices, needsSubclass, knownSpells,
    maxSpellTier, knownSchools, maxSlots, usedSlots, classOf, subclassOf, isProficient,
} from '../../config/rules/character.js';
import { sortedItems } from '../../config/rules/items.js';
import { NbBlockTitle, NbPips, NbCounter } from '../ui/NbUi.jsx';

const PER_LABELS = { encounter: '/ rencontre', safeRest: '/ repos sûr', day: '/ jour' };
const MAX_PIPS = 12;

// ── Au combat : actions, attaques ──────────────────────────────────────────

export const NbCombat = ({ c, act, ask }) => {
    const attacks = attacksOf(c);
    const actions = Number(c.actions ?? MAX_ACTIONS);
    return (
        <section className="nb-block">
            <NbBlockTitle title="Au combat">
                {act && c.inCombat && <button type="button" className="nb-add" onClick={act.endEncounter}>Fin de rencontre</button>}
            </NbBlockTitle>
            {c.inCombat ? (
                <div className="nb-actionbar">
                    <span className="nb-label">Actions</span>
                    <NbPips count={Math.max(MAX_ACTIONS, actions)} filled={actions} onClick={act?.clickAction} label="Action" />
                    {Number(c.turnAttacks) > 0 && <span className="nb-line-meta">{c.turnAttacks} attaque{c.turnAttacks > 1 ? 's' : ''} ce tour</span>}
                    {act && <button type="button" className="vtt-btn vtt-btn-sm ml-auto" onClick={act.endTurn}>Fin du tour</button>}
                </div>
            ) : (
                <div className="nb-actionbar is-off">
                    <span className="nb-note">Hors combat.</span>
                    {ask && <button type="button" className="nb-roll-btn ml-auto" onClick={() => ask('initiative')}>Initiative</button>}
                </div>
            )}
            <div className="mt-2">
                {attacks.map(a => (
                    <div key={a.id} className="nb-line">
                        <div className="nb-line-main">
                            <span className="nb-line-name">{a.name}</span>{' '}
                            <span className="nb-dmg">{a.dice}{signed(a.mod)}</span>
                        </div>
                        <div className="nb-line-side">
                            {a.vicious && <span className="nb-tag is-red">Féroce</span>}
                            {a.range && <span className="nb-tag">Portée {a.range}</span>}
                            {!a.proficient && <span className="nb-tag" title="Arme non maîtrisée : pas de critique">Sans maîtrise</span>}
                            {ask && <button type="button" className="nb-roll-btn" onClick={() => ask('attack', { attack: a })}>Attaquer</button>}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

// ── Ressources de classe ────────────────────────────────────────────────────

export const NbResources = ({ c, act }) => {
    const list = resourcesOf(c);
    if (!list.length) return null;
    return (
        <section className="nb-block">
            <NbBlockTitle title="Ressources" />
            {list.map(r => (
                <div key={r.key} className="nb-line">
                    <div className="nb-line-main">
                        <span className="nb-line-name">{r.label}</span>{' '}
                        <span className="nb-line-meta">
                            {r.die ? `${r.die} · ` : ''}{r.max === null ? 'compteur' : `${r.value} / ${r.max}`} {PER_LABELS[r.reset] ? `· remis ${PER_LABELS[r.reset].replace('/ ', 'par ')}` : ''}
                        </span>
                    </div>
                    <div className="nb-line-side">
                        {r.max !== null && r.max <= MAX_PIPS
                            ? <NbPips count={r.max} filled={r.value} tone={r.key === 'mana' ? 'blue' : 'gold'} label={r.label}
                                      onClick={act && ((n) => act.setResource(r.key, r.value === n ? n - 1 : n))} />
                            : act
                                ? <NbCounter value={r.value} max={r.max ?? 999} onChange={(v) => act.setResource(r.key, v)} suffix={r.max !== null ? ` / ${r.max}` : ''} />
                                : <b>{r.value}</b>}
                    </div>
                </div>
            ))}
        </section>
    );
};

// ── États ───────────────────────────────────────────────────────────────────

export const NbConditions = ({ c, act, ask }) => {
    const list = c.conditions ?? [];
    return (
        <section className="nb-block">
            <NbBlockTitle title="États">
                {ask && act && <button type="button" className="nb-add" onClick={() => ask('conditions')}>Gérer</button>}
            </NbBlockTitle>
            {list.length === 0 && <p className="nb-note">Aucun état.</p>}
            <div className="nb-pills">
                {list.map(k => (
                    <button key={k} type="button" className="vtt-pill is-selected" title={CONDITION_BY_KEY[k]?.text}
                            onClick={act ? () => act.toggleCondition(k) : undefined}>
                        {CONDITION_BY_KEY[k]?.label ?? k}{act ? ' ×' : ''}
                    </button>
                ))}
            </div>
        </section>
    );
};

// ── Capacités ───────────────────────────────────────────────────────────────

const SOURCE_TITLES = { class: 'Classe', subclass: 'Sous-classe', option: 'Choix', ancestry: 'Ascendance', background: 'Historique', boon: 'Faveurs' };
const SOURCE_ORDER = ['class', 'subclass', 'option', 'boon', 'ancestry', 'background'];

const FeatureLine = ({ c, entry, act, ask, vars }) => {
    const f = entry.feature;
    const uses = featureUses(c, entry, vars);
    return (
        <div className="nb-line">
            <button type="button" className="nb-line-main" onClick={ask ? () => ask('detail', { kind: 'feature', entry }) : undefined}>
                <span className="nb-line-name nb-link">{f.name}</span>{' '}
                {entry.level && <span className="nb-line-meta">niv. {entry.level}</span>}
            </button>
            <div className="nb-line-side">
                {f.cost && <span className="nb-tag">{f.cost}</span>}
                {uses && (uses.max <= MAX_PIPS
                    ? <NbPips count={uses.max} filled={uses.used} small tone="gold" label={f.name}
                              onClick={act && ((n) => act.clickUse(entry.id, n))} />
                    : <span className="nb-tag is-gold">{uses.used}/{uses.max}</span>)}
                {uses && <span className="nb-line-meta">{PER_LABELS[uses.per]}</span>}
                {f.roll && ask && <button type="button" className="nb-roll-btn" onClick={() => ask('featureRoll', { entry })}>{f.roll.dice}</button>}
            </div>
        </div>
    );
};

export const NbFeatures = ({ c, act, ask }) => {
    const vars = formulaVars(c);
    const all = featuresOf(c);
    const pending = pendingChoices(c);
    const sub = subclassOf(c);
    return (
        <section className="nb-block">
            <NbBlockTitle title="Capacités">{classOf(c)?.name}{sub ? ` · ${sub.name}` : ''}</NbBlockTitle>
            {act && ask && needsSubclass(c) && (
                <div className="nb-todo">Sous-classe à choisir. <button type="button" className="nb-add" onClick={() => ask('subclass')}>Choisir</button></div>
            )}
            {act && ask && pending.map(p => (
                <div key={p.pool} className="nb-todo">
                    {p.label} : {p.missing} choix à faire. <button type="button" className="nb-add" onClick={() => ask('pick', { pool: p.pool })}>Choisir</button>
                </div>
            ))}
            {SOURCE_ORDER.map(source => {
                const list = all.filter(e => e.source === source);
                if (!list.length) return null;
                return (
                    <div key={source}>
                        <div className="nb-sub-title">{SOURCE_TITLES[source]}</div>
                        {list.map(entry => <FeatureLine key={entry.id} c={c} entry={entry} act={act} ask={ask} vars={vars} />)}
                    </div>
                );
            })}
        </section>
    );
};

// ── Sorts ───────────────────────────────────────────────────────────────────

const tierLabel = (t) => (t === 0 ? 'Tour de magie' : `Rang ${t}`);

export const NbSpells = ({ c, ask }) => {
    const tier = maxSpellTier(c);
    const spells = knownSpells(c);
    if (tier === null && !spells.length) return null;
    const groups = [...new Set(spells.map(s => s.school))];
    return (
        <section className="nb-block">
            <NbBlockTitle title="Sorts">
                {tier !== null && `${tier ? `rang ${tier}` : 'tours de magie'} · ${knownSchools(c).map(k => SCHOOL_BY_KEY[k]?.name).join(', ')}`}
            </NbBlockTitle>
            {groups.map(school => (
                <details key={school} className="nb-fold" open={groups.length <= 3}>
                    <summary>{SCHOOL_BY_KEY[school]?.name ?? classOf(c)?.name ?? school} ({spells.filter(s => s.school === school).length})</summary>
                    <div>
                        {spells.filter(s => s.school === school).sort((a, b) => a.tier - b.tier).map(s => (
                            <div key={s.key} className="nb-line">
                                <button type="button" className="nb-line-main" onClick={ask ? () => ask('detail', { kind: 'spell', spell: s }) : undefined}>
                                    <span className="nb-line-name nb-link">{s.name}</span>{' '}
                                    <span className="nb-line-meta">{tierLabel(s.tier)}{s.utility ? ' · utilitaire' : ''}</span>
                                </button>
                                <div className="nb-line-side">
                                    {s.cost && <span className="nb-tag">{s.cost}</span>}
                                    {s.damage?.dice && <span className="nb-dmg">{s.damage.dice}</span>}
                                    {ask && <button type="button" className="nb-roll-btn is-blue" onClick={() => ask('spell', { spell: s })}>Lancer</button>}
                                </div>
                            </div>
                        ))}
                    </div>
                </details>
            ))}
        </section>
    );
};

// ── Paquetage ───────────────────────────────────────────────────────────────

const itemMeta = (it) => {
    const d = it.data ?? {};
    if (it.kind === 'weapon') return [d.damage, d.stat?.toUpperCase().replace('STR', 'FOR'), (d.props ?? []).map(p => `${p.key === 'range' ? 'Portée' : p.key === 'reach' ? 'Allonge' : p.key === 'thrown' ? 'Lancer' : ''} ${p.value ?? ''}`.trim()).filter(Boolean).join(', ')].filter(Boolean).join(' · ');
    if (it.kind === 'armor') return `${d.defense}${d.addDex ? `+DEX${d.dexMax !== null && d.dexMax !== undefined ? ` (max ${d.dexMax})` : ''}` : ''}`;
    if (it.kind === 'shield') return `+${d.defense} Défense`;
    return '';
};

export const NbInventory = ({ c, act, ask }) => {
    const items = sortedItems(c.items ?? []);
    const used = usedSlots(c);
    const max = maxSlots(c);
    return (
        <section className="nb-block">
            <NbBlockTitle title="Paquetage">
                <span>{used} / {max} empl.</span>
                {act && ask && <button type="button" className="nb-add" onClick={() => ask('items')}>Ajouter</button>}
            </NbBlockTitle>
            <div className={`nb-meter${used > max ? ' is-over' : ''}`}><i style={{ width: `${Math.min(100, (used / Math.max(1, max)) * 100)}%` }} /></div>
            <div className="mt-1">
                {items.map(it => {
                    const equippable = ['weapon', 'armor', 'shield'].includes(it.kind);
                    return (
                        <div key={it.id} className={`nb-line nb-item${it.equipped ? ' is-equipped' : ''}`}>
                            <button type="button" className="nb-line-main" onClick={ask ? () => ask('detail', { kind: 'item', item: it }) : undefined}>
                                <span className="nb-line-name nb-link">{it.name}</span>{' '}
                                <span className="nb-line-meta">{itemMeta(it)}</span>
                                {it.kind === 'weapon' && !isProficient(c, it) && <span className="nb-line-meta"> · sans maîtrise</span>}
                            </button>
                            <div className="nb-line-side">
                                {equippable && (act
                                    ? <button type="button" className={`nb-equip${it.equipped ? ' is-on' : ''}`} onClick={() => act.toggleEquip(it.id)}>{it.equipped ? 'Équipé' : 'Équiper'}</button>
                                    : it.equipped && <span className="nb-equip is-on">Équipé</span>)}
                                {it.data?.heal && ask && it.quantity > 0 && <button type="button" className="nb-roll-btn" onClick={() => ask('potion', { item: it })}>Boire</button>}
                                {!equippable && (act ? <NbCounter value={it.quantity} min={0} onChange={(q) => act.setQuantity(it.id, q)} /> : <span>×{it.quantity}</span>)}
                                {act && ask && <button type="button" className="nb-remove" onClick={() => ask('removeItem', { item: it })} aria-label={`Retirer ${it.name}`}>×</button>}
                            </div>
                        </div>
                    );
                })}
                {items.length === 0 && <p className="nb-note">Rien dans le sac.</p>}
            </div>
            <div className="nb-purse">
                <span>Or</span>{act ? <NbCounter value={Number(c.gold ?? 0)} max={999999} onChange={(v) => act.setPurse(v, Number(c.silver ?? 0))} suffix=" po" /> : <b>{c.gold ?? 0} po</b>}
                <span>Argent</span>{act ? <NbCounter value={Number(c.silver ?? 0)} max={999999} onChange={(v) => act.setPurse(Number(c.gold ?? 0), v)} suffix=" pa" /> : <b>{c.silver ?? 0} pa</b>}
                {act && ask && <button type="button" className="nb-add" onClick={() => ask('purse')}>Saisir</button>}
            </div>
        </section>
    );
};

// ── Pied : motivation, langues, notes ──────────────────────────────────────

export const NbNotes = ({ c }) => {
    const languages = (c.languages ?? []).map(k => LANGUAGE_BY_KEY[k]?.name ?? k);
    return (
        <section className="nb-block">
            <NbBlockTitle title="Carnet" />
            <div className="nb-grid-2">
                <div>
                    {c.motivation && <p><span className="nb-label">Motivation</span><br />{c.motivation}</p>}
                    <p className="mt-2"><span className="nb-label">Langues</span><br />{languages.join(', ') || '—'}</p>
                    {(c.taille || c.poids || c.age) && (
                        <p className="mt-2 nb-line-meta">{[c.age && `${c.age} ans`, c.taille && `${c.taille} cm`, c.poids && `${c.poids} kg`].filter(Boolean).join(' · ')}</p>
                    )}
                </div>
                <div className="nb-notes">{c.notes || <span className="nb-note">Pas de notes (mode Édition pour en écrire).</span>}</div>
            </div>
        </section>
    );
};

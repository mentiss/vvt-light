// src/client/src/systems/nimble/components/creation/CreationTabs.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglets de l'assistant de création (spec_nimble.md §6.3), un composant par
// onglet. Chacun reçoit { ws, setWs } ; les règles sont dans
// config/rules/creation.js. Pas de <select> : des pills et des cartes, avec
// « Autre… » pour la saisie libre ; options rares repliées.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import AvatarUploader from '@/ui/image/AvatarUploader.jsx';
import CatalogModal from '@/ui/catalog/CatalogModal.jsx';
import { STATS, SKILLS, STAT_ARRAYS, STARTING_GOLD, LICENSE_TEXT } from '../../config/basics.js';
import { CLASS_LIST, ITEM_BY_KEY } from '../../config/catalog.js';
import { ANCESTRIES, LANGUAGES, ANCESTRY_RARITIES } from '../../config/ancestries.js';
import { BACKGROUNDS } from '../../config/backgrounds.js';
import { MOTIVATIONS } from '../../config/motivations.js';
import { WEAPONS, ARMORS, GEAR } from '../../config/equipment.js';
import { GUIDE, COMPLEXITY } from '../../config/descriptions.js';
import { signed } from '../../config/rules/formula.js';
import {
    statsOf, freeSlots, suggestedAssign, backgroundAllowed, skillPointsLeft, extraLanguages, ancestryLanguage,
    purchaseTotal, costInGold,
} from '../../config/rules/creation.js';
import { initialSaves } from '../../config/rules/character.js';
import { NbPill, NbToggle, NbStepper, NbBlockTitle } from '../ui/NbUi.jsx';
import { useHelp, helpProps } from './CreationHelp.jsx';

const statLabel = (k) => STATS.find(s => s.key === k)?.label ?? k;

/** Cartes de choix : clé, titre, ligne d'aperçu ; désactivée avec sa raison */
const Card = ({ on, disabled, onClick, title, sub, extra, help }) => (
    <button type="button" className={`nb-card-choice${on ? ' is-selected' : ''}`} disabled={disabled} onClick={onClick} {...help}>
        <b>{title}</b>
        {sub && <span>{sub}</span>}
        {extra}
    </button>
);

// ── Guide ──────────────────────────────────────────────────────────────────

export const GuideTab = ({ onStart }) => (
    <div className="nb-guide nb-fields">
        {GUIDE.map(g => (
            <div key={g.title}>
                <h2>{g.title}</h2>
                <p>{g.text}</p>
            </div>
        ))}
        <div><button type="button" className="vtt-btn vtt-btn-primary" onClick={onStart}>Commencer</button></div>
        <p className="nb-license">{LICENSE_TEXT}</p>
    </div>
);

// ── Classe ─────────────────────────────────────────────────────────────────

export const ClassTab = ({ ws, setWs }) => {
    const show = useHelp();
    const choose = (key) => {
        // La classe change les caractéristiques clés : affectation conseillée si un tableau est choisi
        setWs({ ...ws, classKey: key, ...(ws.arrayKey ? { assign: suggestedAssign(key, ws.arrayKey) } : {}) });
        show({ kind: 'class', key });
    };
    return (
        <div className="nb-cards">
            {CLASS_LIST.map(c => (
                <Card key={c.key} on={ws.classKey === c.key} onClick={() => choose(c.key)} help={helpProps(show, { kind: 'class', key: c.key })}
                      title={c.name} sub={c.tagline}
                      extra={<span className="nb-card-stats">
                          <span className="nb-tag is-gold">{c.keyStats.map(statLabel).join(' · ')}</span>
                          <span className="nb-tag">d{c.hitDie}</span>
                          <span className="nb-tag">{COMPLEXITY[c.complexity] ?? ''}</span>
                      </span>} />
            ))}
        </div>
    );
};

// ── Ascendance ─────────────────────────────────────────────────────────────

const rarityLabel = (r) => ANCESTRY_RARITIES?.find?.(x => x.key === r)?.name ?? { common: 'Communes', uncommon: 'Peu communes', exotic: 'Exotiques' }[r];

export const AncestryTab = ({ ws, setWs }) => {
    const show = useHelp();
    const chosen = ANCESTRIES.find(a => a.key === ws.ancestryKey);
    const cards = (rarity) => (
        <div className="nb-cards">
            {ANCESTRIES.filter(a => a.rarity === rarity).map(a => (
                <Card key={a.key} on={ws.ancestryKey === a.key} help={helpProps(show, { kind: 'ancestry', key: a.key })}
                      onClick={() => { setWs({ ...ws, ancestryKey: a.key, saveChoice: null }); show({ kind: 'ancestry', key: a.key }); }}
                      title={a.name} sub={a.trait?.name} />
            ))}
        </div>
    );
    const neutral = ws.classKey ? Object.entries(initialSaves(ws.classKey, null)).filter(([, v]) => v === 0).map(([k]) => k) : [];
    return (
        <div className="nb-fields">
            {cards('common')}
            {['uncommon', 'exotic'].map(r => (
                <details key={r} className="nb-fold" open={chosen?.rarity === r}>
                    <summary>{rarityLabel(r)} (selon le cadre de jeu)</summary>
                    {cards(r)}
                </details>
            ))}
            {chosen?.effects?.saves === 'neutralToAdv' && (
                <div className="nb-field-row">
                    <b>Sauvegarde avantagée</b>
                    <span className="nb-pills">
                        {!ws.classKey && <span className="nb-note">Choisissez d'abord la classe.</span>}
                        {neutral.map(k => <NbPill key={k} on={ws.saveChoice === k} onClick={() => setWs({ ...ws, saveChoice: k })}>{STATS.find(s => s.key === k)?.name}</NbPill>)}
                    </span>
                </div>
            )}
        </div>
    );
};

// ── Historique ─────────────────────────────────────────────────────────────

export const BackgroundTab = ({ ws, setWs }) => {
    const show = useHelp();
    const stats = statsOf(ws);
    const known = Object.values(stats).every(v => v !== null);
    return (
        <div className="nb-cards">
            {BACKGROUNDS.map(b => {
                const allowed = !known || backgroundAllowed(b, stats);
                return (
                    <Card key={b.key} on={ws.backgroundKey === b.key} disabled={!allowed} help={helpProps(show, { kind: 'background', key: b.key })}
                          onClick={() => { setWs({ ...ws, backgroundKey: b.key }); show({ kind: 'background', key: b.key }); }}
                          title={b.name} sub={b.req ? `${statLabel(b.req.stat)} ${b.req.max} ou moins à la création${allowed ? '' : ' : non rempli'}` : null} />
                );
            })}
        </div>
    );
};

// ── Caractéristiques et compétences ────────────────────────────────────────

export const StatsTab = ({ ws, setWs }) => {
    const show = useHelp();
    const values = STAT_ARRAYS.find(a => a.key === ws.arrayKey)?.values ?? [];
    const free = freeSlots(ws);
    const stats = statsOf(ws);
    const keys = CLASS_LIST.find(c => c.key === ws.classKey)?.keyStats ?? [];
    const order = [...keys, ...STATS.map(s => s.key).filter(k => !keys.includes(k))];
    const saves = ws.classKey ? initialSaves(ws.classKey, ws.ancestryKey, ws.saveChoice) : {};

    // Un historique devenu impossible est retiré (prérequis à la création)
    const update = (next) => {
        const bg = BACKGROUNDS.find(b => b.key === next.backgroundKey);
        const s = statsOf(next);
        const drop = bg && Object.values(s).every(v => v !== null) && !backgroundAllowed(bg, s);
        setWs(drop ? { ...next, backgroundKey: null } : next);
    };
    const assign = (stat, index) => update({ ...ws, assign: { ...ws.assign, [stat]: ws.assign[stat] === index ? null : index } });
    const setPoints = (skill, v) => setWs({ ...ws, skillPoints: { ...ws.skillPoints, [skill]: v } });
    const left = skillPointsLeft(ws);

    return (
        <div className="nb-fields">
            <div className="nb-field-row">
                <b>Tableau</b>
                <span className="nb-pills">
                    {STAT_ARRAYS.map(a => (
                        <NbPill key={a.key} on={ws.arrayKey === a.key} {...helpProps(show, { kind: 'array', key: a.key })}
                                onClick={() => update({ ...ws, arrayKey: a.key, assign: ws.classKey ? suggestedAssign(ws.classKey, a.key) : { str: null, dex: null, int: null, wil: null } })}>
                            {a.label} ({a.values.map(signed).join(', ')})
                        </NbPill>
                    ))}
                </span>
            </div>
            {ws.arrayKey && (
                <div className="nb-assign">
                    {order.map(k => (
                        <React.Fragment key={k}>
                            <b>{STATS.find(s => s.key === k)?.name}{keys.includes(k) && <small>clé de la classe</small>}{saves[k] > 0 && <small>sauvegarde ▲</small>}{saves[k] < 0 && <small>sauvegarde ▼</small>}</b>
                            <span className="nb-pills">
                                {values.map((v, i) => (
                                    <NbPill key={i} on={ws.assign[k] === i} disabled={ws.assign[k] !== i && !free.includes(i)} onClick={() => assign(k, i)}>{signed(v)}</NbPill>
                                ))}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            )}
            {ws.classKey && ws.arrayKey && (
                <div><button type="button" className="vtt-btn vtt-btn-sm" onClick={() => update({ ...ws, assign: suggestedAssign(ws.classKey, ws.arrayKey) })}>Affectation conseillée</button></div>
            )}

            <NbBlockTitle title="Compétences">{Number(ws.heroicSkills) > 0 && `${left} point${left > 1 ? 's' : ''} à placer`}</NbBlockTitle>
            <NbToggle on={Number(ws.heroicSkills) > 0} onChange={(on) => setWs({ ...ws, heroicSkills: on ? 2 : 0, skillPoints: {} })}
                      hint="Règle optionnelle : le MJ accorde de 1 à 4 points à placer où vous voulez.">Compétences héroïques</NbToggle>
            {Number(ws.heroicSkills) > 0 && (
                <div className="nb-field-row"><b>Points accordés</b><NbStepper value={ws.heroicSkills} onChange={(v) => setWs({ ...ws, heroicSkills: v, skillPoints: {} })} min={1} max={4} label="Points" /></div>
            )}
            <div className="nb-grid-2">
                {SKILLS.map(s => {
                    const base = stats[s.stat] ?? 0;
                    const pts = Number(ws.skillPoints?.[s.key] ?? 0);
                    return (
                        <div key={s.key} className="nb-field-row" {...helpProps(show, { kind: 'skill', key: s.key })}>
                            <b>{s.label} <small className="nb-vo">{statLabel(s.stat)}</small></b>
                            {Number(ws.heroicSkills) > 0
                                ? <NbStepper value={pts} onChange={(v) => (v < pts || left > 0) && setPoints(s.key, v)} min={0} max={pts + Math.max(0, left)} format={() => `${signed(base + pts)}`} label={s.label} />
                                : <span className="nb-title">{signed(base)}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── Équipement ─────────────────────────────────────────────────────────────

const SHOP = [
    ...WEAPONS.map(e => ({ ...e, kind: 'Armes', meta: e.damage })),
    ...ARMORS.map(e => ({ ...e, kind: e.type === 'shield' ? 'Boucliers' : 'Armures', meta: e.type === 'shield' ? `+${e.defense}` : `Défense ${e.defense}${e.addDex !== false ? '+DEX' : ''}` })),
    ...GEAR.map(e => ({ ...e, kind: 'Équipement', meta: e.text ?? '' })),
].filter(e => costInGold(e.cost) > 0);
const SHOP_FILTERS = [{ key: 'kind', getValue: e => e.kind }];
const SHOP_GROUP = { getValue: e => e.kind };
const SHOP_LABELS = { search: 'Rechercher un objet…', countOne: 'objet', countMany: 'objets', added: 'Acheté' };
const SHOP_LAYOUT = ['filters', 'search'];

export const EquipmentTab = ({ ws, setWs }) => {
    const [shopOpen, setShopOpen] = useState(false);
    const cls = CLASS_LIST.find(c => c.key === ws.classKey);
    const spent = purchaseTotal(ws);
    const addPurchase = (e) => {
        const existing = ws.purchases.find(p => p.key === e.key);
        setWs(prev => ({ ...prev, purchases: existing
            ? prev.purchases.map(p => (p.key === e.key ? { ...p, quantity: p.quantity + 1 } : p))
            : [...prev.purchases, { key: e.key, name: e.name, cost: e.cost, quantity: 1 }] }));
    };
    return (
        <div className="nb-fields">
            <div className="nb-pills">
                <NbPill on={ws.equipmentMode === 'class'} onClick={() => setWs({ ...ws, equipmentMode: 'class' })}>Paquetage de la classe</NbPill>
                <NbPill on={ws.equipmentMode === 'gold'} onClick={() => setWs({ ...ws, equipmentMode: 'gold' })}>{STARTING_GOLD} po à dépenser</NbPill>
            </div>
            {ws.equipmentMode === 'class' && (cls
                ? <ul className="nb-fields">
                    {cls.startingGear.map((g, i) => <li key={i} className="nb-line"><span className="nb-line-name">{g.key ? ITEM_BY_KEY[g.key]?.entry.name ?? g.key : g.name}{g.qty > 1 ? ` ×${g.qty}` : ''}</span></li>)}
                  </ul>
                : <p className="nb-note">Choisissez d'abord une classe.</p>)}
            {ws.equipmentMode === 'gold' && (
                <>
                    <div className="nb-toolbar">
                        <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={() => setShopOpen(true)}>Acheter</button>
                        <span className={spent > STARTING_GOLD ? 'nb-red' : ''}>{spent} / {STARTING_GOLD} po dépensés</span>
                    </div>
                    {ws.purchases.map(p => (
                        <div key={p.key} className="nb-line">
                            <div className="nb-line-main"><span className="nb-line-name">{p.name}</span> <span className="nb-line-meta">{p.cost}</span></div>
                            <div className="nb-line-side">
                                <NbStepper value={p.quantity} min={0} max={20} label="Quantité"
                                           onChange={(q) => setWs({ ...ws, purchases: q ? ws.purchases.map(x => (x.key === p.key ? { ...x, quantity: q } : x)) : ws.purchases.filter(x => x.key !== p.key) })} />
                            </div>
                        </div>
                    ))}
                </>
            )}
            {shopOpen && (
                <CatalogModal title="Boutique" subtitle={`${STARTING_GOLD} po de départ`} labels={SHOP_LABELS} layout={SHOP_LAYOUT} tabsAs="pill"
                              items={SHOP} getKey={e => e.key} filters={SHOP_FILTERS} groupBy={SHOP_GROUP} searchFields={['name', 'vo', 'meta']}
                              renderItem={e => <div><b>{e.name}</b> <span className="nb-tag">{e.cost}</span><div className="nb-line-meta">{e.meta}</div></div>}
                              onAdd={addPurchase} onClose={() => setShopOpen(false)} />
            )}
        </div>
    );
};

// ── Identité ───────────────────────────────────────────────────────────────

export const IdentityTab = ({ ws, setWs }) => {
    const show = useHelp();
    const [avatarOpen, setAvatarOpen] = useState(false);
    const [customMotivation, setCustomMotivation] = useState(false);
    const extra = extraLanguages(ws);
    const fromAncestry = ancestryLanguage(ws);
    const set = (patch) => setWs({ ...ws, ...patch });
    const toggleLanguage = (k) => set({ languages: ws.languages.includes(k) ? ws.languages.filter(x => x !== k) : [...ws.languages, k] });
    const isCatalogMotivation = MOTIVATIONS.some(m => m.name === ws.motivation);
    return (
        <div className="nb-fields">
            <div className="nb-identity">
                <button type="button" className="nb-portrait-pick" onClick={() => setAvatarOpen(true)}>
                    {ws.avatar ? <img src={ws.avatar} alt="" /> : 'Choisir un portrait'}
                </button>
                <div className="nb-name-fields">
                    <label className="block"><span className="vtt-field-label">Prénom</span><input className="nb-input" value={ws.prenom} onChange={e => set({ prenom: e.target.value })} /></label>
                    <label className="block"><span className="vtt-field-label">Nom</span><input className="nb-input" value={ws.nom} onChange={e => set({ nom: e.target.value })} /></label>
                    <label className="block"><span className="vtt-field-label">Joueur</span><input className="nb-input" value={ws.playerName} onChange={e => set({ playerName: e.target.value })} /></label>
                    <label className="block"><span className="vtt-field-label">Âge</span><input className="nb-input" type="number" value={ws.age} onChange={e => set({ age: e.target.value })} /></label>
                    <label className="block"><span className="vtt-field-label">Taille (cm)</span><input className="nb-input" type="number" value={ws.taille} onChange={e => set({ taille: e.target.value })} /></label>
                    <label className="block"><span className="vtt-field-label">Poids (kg)</span><input className="nb-input" type="number" value={ws.poids} onChange={e => set({ poids: e.target.value })} /></label>
                </div>
            </div>

            <NbBlockTitle title="Motivation" />
            <div className="nb-pills">
                {MOTIVATIONS.map(m => (
                    <NbPill key={m.key} on={ws.motivation === m.name} {...helpProps(show, { kind: 'motivation', key: m.key })}
                            onClick={() => { setCustomMotivation(false); set({ motivation: ws.motivation === m.name ? '' : m.name }); }}>{m.name}</NbPill>
                ))}
                <NbPill on={customMotivation || (!!ws.motivation && !isCatalogMotivation)} onClick={() => { setCustomMotivation(true); if (isCatalogMotivation) set({ motivation: '' }); }}>Autre…</NbPill>
            </div>
            {(customMotivation || (!!ws.motivation && !isCatalogMotivation)) && (
                <input className="nb-input" value={ws.motivation} placeholder="Votre motivation" onChange={e => set({ motivation: e.target.value })} autoFocus />
            )}

            <NbBlockTitle title="Langues">{`Commun${fromAncestry ? ` + ${LANGUAGES.find(l => l.key === fromAncestry)?.name}` : ''} · ${ws.languages.length} / ${extra} au choix`}</NbBlockTitle>
            {extra === 0 && <p className="nb-note">INT 0 ou moins : pas de langue en plus.</p>}
            <div className="nb-pills">
                {LANGUAGES.filter(l => l.key !== 'common' && l.key !== fromAncestry).map(l => (
                    <NbPill key={l.key} on={ws.languages.includes(l.key)} disabled={!ws.languages.includes(l.key) && ws.languages.length >= extra}
                            onClick={() => toggleLanguage(l.key)} title={l.speakers}>{l.name}</NbPill>
                ))}
            </div>

            {avatarOpen && (
                <AvatarUploader currentAvatar={ws.avatar}
                                onAvatarChange={(avatar) => { set({ avatar }); setAvatarOpen(false); }}
                                onClose={() => setAvatarOpen(false)} />
            )}
        </div>
    );
};

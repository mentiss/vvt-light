// src/client/src/systems/maledictum/components/modals/MlSheetModals.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtres de la fiche (spec_maledictum.md §11.2), ouvertes par act.ask(kind, data) :
//   roll        jet (MlRollModal : test, attaque, pouvoir, table)
//   damage      subir des dégâts : armure de la localisation, Blessure critique au-delà
//   critical    tirer une Blessure critique (1d10 + excès, table de la localisation)
//   d10         jet d'un d10 sur une table (Maladresse)
//   fate        Destin : dépenser, brûler, recharger (début de séance)
//   solars      saisir les Solars ;  gainXp  XP gagnée
//   items       catalogue d'objets (CatalogModal) ;  item  détail d'un objet
//               (les États ne passent plus par une fenêtre : MlConditions.jsx, menu et ajout ancrés)
//   removeItem  retirer un objet ;  talent  détail d'un talent
//   contact     ajouter / modifier un contact ;  influence  ajouter une faction d'Influence
//   text        ajouter une ligne (séquelle…) ;  xp  dépenser l'XP
// Props : asked { kind, data }, c, act, patron, sessionId, theme, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react';
import Modal from '@/ui/modal/Modal.jsx';
import ConfirmModal from '@/ui/modal/ConfirmModal.jsx';
import CatalogModal from '@/ui/catalog/CatalogModal.jsx';
import { SKILLS } from '../../config/skills.js';
import { TALENTS } from '../../config/talents.js';
import { POWERS } from '../../config/powers.js';
import { WEAPON_TRAITS, ARMOUR_TRAITS } from '../../config/traits.js';
import { FACTIONS } from '../../config/factions.js';
import {
    CHAR_KEYS, CHAR_SHORT, CHAR_CAP, charValue, derived, displayName, armourByLocation, toughnessArmourBonus, LOCATIONS, xpAvailable, skillAdvances,
} from '../../config/rules/character.js';
import { LOCATION_LABELS, signed } from '../../config/rules/dice.js';
import { CATALOG, KIND_LABELS, itemFromEntry, customItem } from '../../config/rules/items.js';
import { available } from '../../config/setup.js';
import { TABLE_LABELS } from '../../config/rules/tables.js';
import { powerCost, TALENT_COST, SKILL_MAX_ADVANCES } from '../../config/rules/xp.js';
import * as A from '../../config/rules/actions.js';
import { useMlRoll } from '../../hooks/useMlRoll.js';
import MlHistoryEntry from '../layout/MlHistoryEntry.jsx';
import MlRollModal from './MlRollModal.jsx';
import { Pill, Pills, Stepper, Toggle, Field, MlTabs } from '../ui/MlUi.jsx';
import { factionLabel, specName } from '../layout/MlSections.jsx';

const TRAIT_BY_KEY = Object.fromEntries([...(WEAPON_TRAITS ?? []), ...(ARMOUR_TRAITS ?? [])].map(t => [t.key, t]));
export const traitLabel = (traits) => (traits ?? []).map(t => {
    const key = t?.key ?? t;
    const def = TRAIT_BY_KEY[key];
    const rating = t?.rating ?? null;
    return `${def?.label ?? key}${rating ? ` (${rating})` : ''}`;
}).join(', ');
const AVAILABILITY = { common: 'Courante', scarce: 'Peu courante', rare: 'Rare', exotic: 'Exotique' };
const DISCIPLINES = { minor: 'Mineurs', biomancy: 'Biomancie', divination: 'Divination', pyromancy: 'Pyromancie', telekinesis: 'Télékinésie', telepathy: 'Télépathie' };

// ── Dégâts subis et Blessures critiques ──────────────────────────────────────

const CriticalRoller = ({ c, act, sessionId, theme, location, excess, onDone }) => {
    const { launch, rolling, entry } = useMlRoll();
    const [done, setDone] = useState(false);
    const go = async () => {
        const r = await launch({
            characterId: c.id, characterName: displayName(c), sessionId, label: `Blessure critique (${LOCATION_LABELS[location]})`,
            type: 'd10', systemData: { tableKey: 'critical', location, bonus: excess, theme },
        });
        if (r?.entry) { act.addCritical({ location, entry: r.entry }); setDone(true); }
    };
    return (
        <div className="im-roll-result">
            {!done && <button type="button" className="vtt-btn vtt-btn-primary" onClick={go} disabled={rolling}>Tirer la gravité : 1d10{excess ? ` + ${excess}` : ''}</button>}
            {entry && <div className="vtt-history-entry"><MlHistoryEntry roll={entry} /></div>}
            {done && <button type="button" className="vtt-btn" onClick={onDone}>Fermer</button>}
        </div>
    );
};

const DamageForm = ({ c, act, sessionId, theme, onClose }) => {
    const armour = armourByLocation(c.items);
    const toughness = toughnessArmourBonus(c);   // règle maison (§14.1), 0 si coupée
    const [damage, setDamage] = useState(0);
    const [location, setLocation] = useState('body');
    const [criticalHit, setCriticalHit] = useState(false);
    const [ineffective, setIneffective] = useState(false);
    const [ignoreArmour, setIgnoreArmour] = useState(false);
    const [applied, setApplied] = useState(null);
    const apply = () => {
        const r = A.takeDamage(c, { damage, armour: ignoreArmour ? 0 : armour[location], toughness: ignoreArmour ? 0 : toughness, ineffective, criticalHit });
        act.patch(r.patch);
        setApplied(r);
    };
    return (
        <Modal title="Subir des dégâts" subtitle={displayName(c)} onClose={onClose} size="md"
               footer={!applied && <><button type="button" className="vtt-btn" onClick={onClose}>Annuler</button><button type="button" className="vtt-btn vtt-btn-primary" onClick={apply}>Appliquer</button></>}>
            {!applied ? (
                <div className="im-roll-form">
                    <Field label="Dégâts"><Stepper value={damage} onChange={setDamage} min={0} max={60} editable unit="dégâts" /></Field>
                    <Field label="Localisation">
                        <Pills>{LOCATIONS.map(l => <Pill key={l} on={location === l} onClick={() => setLocation(l)}>{LOCATION_LABELS[l]} (armure {armour[l] + toughness})</Pill>)}</Pills>
                        {toughness > 0 && <small className="im-note">Dont +{toughness} d'Endurance (règle maison, BE − 2), non doublé par une arme Inefficace.</small>}
                    </Field>
                    <Field label="Cas particuliers">
                        <Toggle on={criticalHit} onChange={setCriticalHit}>Coup critique (double, attaque cachée) : Blessure critique même sous le maximum</Toggle>
                        <Toggle on={ineffective} onChange={setIneffective}>Arme Inefficace : armure doublée, pas de Blessure minimale</Toggle>
                        <Toggle on={ignoreArmour} onChange={setIgnoreArmour}>Ignore l'armure (Hémorragie, En feu…)</Toggle>
                    </Field>
                </div>
            ) : (
                <div className="im-roll-form">
                    <p className="im-note">{applied.wounds} Blessure{applied.wounds > 1 ? 's' : ''} subie{applied.wounds > 1 ? 's' : ''} : {c.wounds} / {derived(c).woundsMax}.</p>
                    {applied.critical ? (
                        <>
                            <p className="im-alert">Blessure critique : jet de gravité sur la table {LOCATION_LABELS[location]}{applied.excess ? `, +${applied.excess} d'excès` : ''}.</p>
                            <CriticalRoller c={c} act={act} sessionId={sessionId} theme={theme} location={location} excess={applied.excess} onDone={onClose} />
                        </>
                    ) : <button type="button" className="vtt-btn vtt-btn-primary" onClick={onClose}>Fermer</button>}
                    {(c.wounds ?? 0) >= derived(c).woundsMax && <p className="im-alert">Au maximum de Blessures : Mouvement ou Action, pas les deux ; test Exigeant de Robustesse (Douleur), sinon Inconscient.</p>}
                </div>
            )}
        </Modal>
    );
};

const CriticalForm = ({ c, act, sessionId, theme, onClose }) => {
    const [location, setLocation] = useState('body');
    const [excess, setExcess] = useState(0);
    return (
        <Modal title="Blessure critique" subtitle={displayName(c)} onClose={onClose} size="md">
            <div className="im-roll-form">
                <Field label="Localisation"><Pills>{LOCATIONS.map(l => <Pill key={l} on={location === l} onClick={() => setLocation(l)}>{LOCATION_LABELS[l]}</Pill>)}</Pills></Field>
                <Field label="Excès de dégâts"><Stepper value={excess} onChange={setExcess} min={0} max={30} label={`+${excess}`} /></Field>
                <CriticalRoller key={`${location}-${excess}`} c={c} act={act} sessionId={sessionId} theme={theme} location={location} excess={excess} onDone={onClose} />
            </div>
        </Modal>
    );
};

const D10Table = ({ c, data, sessionId, theme, onClose }) => {
    const { launch, rolling, entry } = useMlRoll();
    return (
        <Modal title={data.label ?? TABLE_LABELS[data.tableKey]} subtitle={displayName(c)} onClose={onClose} size="sm"
               footer={<button type="button" className="vtt-btn vtt-btn-primary" onClick={onClose}>Fermer</button>}>
            {!entry ? (
                <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling}
                        onClick={() => launch({ characterId: c.id, characterName: displayName(c), sessionId, label: data.label, type: 'd10', systemData: { tableKey: data.tableKey, theme } })}>
                    Lancer le d10
                </button>
            ) : <div className="vtt-history-entry"><MlHistoryEntry roll={entry} /></div>}
        </Modal>
    );
};

// ── Destin, Solars, XP, États ────────────────────────────────────────────────

const FateForm = ({ c, act, onClose }) => (
    <Modal title="Destin" subtitle={`${c.fate ?? 0} / ${c.fateMax ?? 0}`} onClose={onClose} size="md"
           footer={<button type="button" className="vtt-btn vtt-btn-primary" onClick={onClose}>Fermer</button>}>
        <div className="im-roll-form">
            <Field label="Dépenser (rendu à chaque séance)">
                <p className="im-note">Relancer un test raté · +1 DR après un jet · choisir quand agir ce round · ignorer les Blessures critiques jusqu'au prochain tour · retirer un État (À terre : +1 Blessure soignée).</p>
                <button type="button" className="vtt-btn" disabled={!(c.fate > 0)} onClick={() => { act.spendFate(); onClose(); }}>Dépenser 1 Destin</button>
            </Field>
            <Field label="Brûler (définitif)">
                <p className="im-note">Survivre à une mort certaine · éviter des dégâts · refuser une mutation · choisir le résultat d'un test · +1 Supériorité au groupe (+2 si elle est à 0).</p>
                <button type="button" className="vtt-btn vtt-btn-danger" disabled={!(c.fateMax > 0)} onClick={() => { act.burnFate(); onClose(); }}>Brûler 1 Destin</button>
            </Field>
            <Field label="Début de séance">
                <button type="button" className="vtt-btn" onClick={() => { act.run(A.refillFate); onClose(); }}>Recharger le Destin ({c.fateMax ?? 0})</button>
            </Field>
        </div>
    </Modal>
);

const NumberForm = ({ title, value, onSave, onClose, label }) => {
    const [v, setV] = useState(String(value ?? 0));
    return (
        <Modal title={title} onClose={onClose} size="sm"
               footer={<><button type="button" className="vtt-btn" onClick={onClose}>Annuler</button><button type="button" className="vtt-btn vtt-btn-primary" onClick={() => { onSave(Number(v) || 0); onClose(); }}>Valider</button></>}>
            <label className="block"><span className="vtt-field-label">{label}</span>
                <input className="vtt-input" type="number" value={v} onChange={e => setV(e.target.value)} autoFocus /></label>
        </Modal>
    );
};

// ── Catalogue d'objets, détail, retrait ──────────────────────────────────────

const ITEM_FILTERS = [{ key: 'kind', getValue: it => it.kind, options: Object.entries(KIND_LABELS).map(([value, label]) => ({ value, label })) }];
const ITEM_GROUP = { getValue: it => KIND_LABELS[it.kind] };
const ITEM_SEARCH = ['label', 'labelEn', 'summary'];
const ITEM_LABELS = { customTab: 'Objet libre', search: 'Rechercher un objet…', countOne: 'objet', countMany: 'objets', added: "Ajouté à l'inventaire" };
const ITEM_LAYOUT = ['filters', 'search'];

const itemMeta = (it) => [
    it.damage !== undefined && it.damage !== null ? `Dégâts ${it.damage}${it.damageBonus === 'sb' ? ' + BF' : ''}` : null,
    it.armour !== undefined && it.armour !== null ? `Armure ${it.armour}` : null,
    it.enc !== undefined && it.enc !== null ? `Enc. ${it.enc}` : null,
    it.cost ? `${it.cost} Solars` : null,
    AVAILABILITY[it.availability],
    it.source === 'ipg' ? 'Inquisition' : null,
].filter(Boolean).join(' · ');

const ItemRow = ({ it }) => (
    <div>
        <div><b>{it.label}</b> <span className="im-vo">{it.labelEn}</span></div>
        <small className="im-note">{[itemMeta(it), traitLabel(it.traits)].filter(Boolean).join(' · ')}</small>
    </div>
);

const ItemDetail = ({ c, act, item, onClose }) => {
    const [qty, setQty] = useState(item.quantity ?? 1);
    const [notes, setNotes] = useState(item.notes ?? '');
    const save = () => { act.patch({ items: (c.items ?? []).map(it => (it.id === item.id ? { ...it, quantity: qty, notes } : it)) }); onClose(); };
    return (
        <Modal title={item.name} subtitle={KIND_LABELS[item.kind]} onClose={onClose} size="md"
               footer={<><button type="button" className="vtt-btn" onClick={onClose}>Annuler</button><button type="button" className="vtt-btn vtt-btn-primary" onClick={save}>Enregistrer</button></>}>
            <div className="im-roll-form">
                <p className="im-note">{[itemMeta(item.data ?? {}), item.data?.spec ? specName(item.data.spec) : null, traitLabel(item.data?.traits)].filter(Boolean).join(' · ')}</p>
                {item.data?.summary && <p>{item.data.summary}</p>}
                <Field label="Quantité"><Stepper value={qty} onChange={setQty} min={0} max={999} /></Field>
                <label className="block"><span className="vtt-field-label">Notes</span>
                    <textarea className="vtt-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} /></label>
            </div>
        </Modal>
    );
};

// ── Talent, contact, Influence, ligne de texte ───────────────────────────────

const TalentDetail = ({ act, data, onClose }) => {
    const def = TALENTS.find(t => t.key === data.talent.key);
    return (
        <Modal title={def?.label ?? data.talent.key} subtitle={def ? `${def.labelEn} · ${def.source === 'core' ? 'livre de base' : 'Inquisition'} p.${def.page}` : ''} onClose={onClose} size="md"
               footer={<><button type="button" className="vtt-btn vtt-btn-danger" onClick={() => { act.run(A.removeTalent, data.index); onClose(); }}>Retirer</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" onClick={onClose}>Fermer</button></>}>
            <div className="im-roll-form">
                {def?.requirement?.text && <p className="im-note">Prérequis : {def.requirement.text}</p>}
                <p>{def?.summary}</p>
                {def?.repeatNotes && <p className="im-note">{typeof def.repeatNotes === 'string' ? def.repeatNotes : (def.repeatNotes ?? []).map(o => `${o.label} : ${o.summary}`).join(' · ')}</p>}
            </div>
        </Modal>
    );
};

const FACTION_KEYS = ['inquisition', ...FACTIONS.map(f => f.key)];

const ContactForm = ({ act, contact, onClose }) => {
    const [v, setV] = useState(contact ?? { name: '', faction: 'inquisition', value: 0, notes: '' });
    const set = (p) => setV(prev => ({ ...prev, ...p }));
    const save = () => { if (contact) act.updateContact(contact.id, v); else act.addContact(v); onClose(); };
    return (
        <Modal title={contact ? contact.name || 'Contact' : 'Nouveau contact'} onClose={onClose} size="md"
               footer={<>{contact && <button type="button" className="vtt-btn vtt-btn-danger" onClick={() => { act.removeContact(contact.id); onClose(); }}>Retirer</button>}
                   <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button><button type="button" className="vtt-btn vtt-btn-primary" onClick={save} disabled={!v.name.trim()}>Enregistrer</button></>}>
            <div className="im-roll-form">
                <label className="block"><span className="vtt-field-label">Nom</span><input className="vtt-input" value={v.name} onChange={e => set({ name: e.target.value })} autoFocus /></label>
                <Field label="Faction"><Pills>{FACTION_KEYS.map(f => <Pill key={f} on={v.faction === f} onClick={() => set({ faction: f })}>{factionLabel(f)}</Pill>)}</Pills></Field>
                <Field label="Influence personnelle"><Stepper value={v.value} onChange={n => set({ value: n })} min={A.INFLUENCE_MIN} max={A.INFLUENCE_MAX} label={signed(v.value)} /></Field>
                <label className="block"><span className="vtt-field-label">Notes</span><textarea className="vtt-input" rows={3} value={v.notes} onChange={e => set({ notes: e.target.value })} /></label>
            </div>
        </Modal>
    );
};

const InfluenceForm = ({ c, act, onClose }) => {
    const [f, setF] = useState(null);
    const [v, setV] = useState(1);
    return (
        <Modal title="Influence" subtitle="Faction et valeur (−5 à +5)" onClose={onClose} size="md"
               footer={<><button type="button" className="vtt-btn" onClick={onClose}>Annuler</button><button type="button" className="vtt-btn vtt-btn-primary" disabled={!f} onClick={() => { act.setInfluence(f, v); onClose(); }}>Valider</button></>}>
            <div className="im-roll-form">
                <Pills>{FACTION_KEYS.map(k => <Pill key={k} on={f === k} onClick={() => { setF(k); setV(c.influence?.[k] ?? 1); }}>{factionLabel(k)}</Pill>)}</Pills>
                {f && <Stepper value={v} onChange={setV} min={A.INFLUENCE_MIN} max={A.INFLUENCE_MAX} label={signed(v)} />}
            </div>
        </Modal>
    );
};

const TextForm = ({ act, data, onClose }) => {
    const [t, setT] = useState('');
    return (
        <Modal title={data.title} onClose={onClose} size="sm"
               footer={<><button type="button" className="vtt-btn" onClick={onClose}>Annuler</button><button type="button" className="vtt-btn vtt-btn-primary" disabled={!t.trim()} onClick={() => { act.addListEntry(data.field, t); onClose(); }}>Ajouter</button></>}>
            <input className="vtt-input" value={t} onChange={e => setT(e.target.value)} autoFocus />
        </Modal>
    );
};

// ── Dépense d'XP ─────────────────────────────────────────────────────────────

const XP_TABS = [{ id: 'chars', label: 'Caractéristiques' }, { id: 'skills', label: 'Compétences' }, { id: 'specs', label: 'Spécialisations' }, { id: 'talents', label: 'Talents' }, { id: 'powers', label: 'Pouvoirs' }];

const Buy = ({ label, detail, offer, onBuy }) => (
    <div className="im-buy">
        <span><b>{label}</b>{detail && <small> {detail}</small>}</span>
        <button type="button" className="vtt-btn vtt-btn-sm" disabled={!offer.ok} onClick={onBuy}>{offer.cost === null ? 'Plafond' : `${offer.cost} XP`}</button>
    </div>
);

const XpForm = ({ c, act, onClose }) => {
    const [tab, setTab] = useState('chars');
    const [query, setQuery] = useState('');
    const [various, setVarious] = useState({});
    const d = derived(c);
    const owned = new Set((c.talents ?? []).map(t => t.key));
    const q = query.trim().toLowerCase();
    const match = (s) => !q || String(s).toLowerCase().includes(q);
    const buy = (fn, ...args) => act.run(fn, ...args);
    return (
        <Modal title="Dépenser l'expérience" subtitle={`${xpAvailable(c)} XP disponibles`} onClose={onClose} size="lg" expandable
               footer={<button type="button" className="vtt-btn vtt-btn-primary" onClick={onClose}>Fermer</button>}>
            <MlTabs tabs={XP_TABS} active={tab} onSelect={setTab} className="im-mini-tabs" />
            {(tab === 'talents' || tab === 'powers' || tab === 'specs') && <input className="vtt-input im-search" placeholder="Rechercher…" value={query} onChange={e => setQuery(e.target.value)} />}
            <div className="im-buy-list vtt-scroll">
                {tab === 'chars' && CHAR_KEYS.map(k => (
                    <Buy key={k} label={`${CHAR_SHORT[k]} ${charValue(c, k)} → ${charValue(c, k) + 1}`} detail={charValue(c, k) >= CHAR_CAP ? `plafond ${CHAR_CAP}` : null}
                         offer={A.charAdvanceOffer(c, k)} onBuy={() => buy(A.advanceChar, k)} />
                ))}
                {tab === 'skills' && SKILLS.filter(s => s.key !== 'psychic_mastery' || d.psyker).map(s => (
                    <Buy key={s.key} label={`${s.label} : ${skillAdvances(c, s.key)} → ${skillAdvances(c, s.key) + 1} Avance(s)`} detail={skillAdvances(c, s.key) >= SKILL_MAX_ADVANCES ? 'maximum' : null}
                         offer={A.skillAdvanceOffer(c, s.key)} onBuy={() => buy(A.advanceSkill, s.key)} />
                ))}
                {tab === 'specs' && SKILLS.flatMap(s => (s.specs ?? []).filter(sp => match(`${s.label} ${sp.label}`)).map(sp => {
                    const isVarious = !!sp.various;
                    const label = isVarious ? `${sp.label}${various[`${s.key}.${sp.key}`] ? ` : ${various[`${s.key}.${sp.key}`]}` : ''}` : sp.label;
                    const spec = { skill: s.key, key: sp.key, label };
                    const offer = A.specAdvanceOffer(c, spec);
                    return (
                        <div key={`${s.key}.${sp.key}`} className="im-buy-wrap">
                            <Buy label={`${s.label} (${label})`} detail={[offer.own ? `${offer.own.adv} Avance(s)` : 'nouvelle', sp.restricted ? `restreinte : ${sp.restricted}` : null].filter(Boolean).join(' · ')}
                                 offer={isVarious && !various[`${s.key}.${sp.key}`] ? { ...offer, ok: false } : offer} onBuy={() => buy(A.advanceSpec, spec)} />
                            {isVarious && <input className="vtt-input im-various" placeholder="Précision (planète, culte, xénos…)" value={various[`${s.key}.${sp.key}`] ?? ''}
                                                 onChange={e => setVarious(v => ({ ...v, [`${s.key}.${sp.key}`]: e.target.value }))} />}
                        </div>
                    );
                }))}
                {tab === 'talents' && available(TALENTS).filter(t => match(`${t.label} ${t.labelEn}`)).map(t => (
                    <Buy key={t.key} label={t.label} detail={[t.requirement?.text, owned.has(t.key) && !t.repeatable ? 'déjà pris' : null].filter(Boolean).join(' · ')}
                         offer={{ cost: TALENT_COST, ok: xpAvailable(c) >= TALENT_COST && (!owned.has(t.key) || !!t.repeatable) && !t.requirement?.creationOnly }}
                         onBuy={() => buy(A.addTalent, t.key)} />
                ))}
                {tab === 'powers' && (!d.psyker ? <p className="im-note">Il faut le talent Psyker.</p> : available(POWERS).filter(p => match(`${p.label} ${p.labelEn}`)).map(p => (
                    <Buy key={p.key} label={`${p.label}${p.overt ? ' *' : ''}`} detail={`${DISCIPLINES[p.discipline]} · Indice ${p.warpRating}${(c.powers ?? []).includes(p.key) ? ' · connu' : ''}`}
                         offer={{ cost: powerCost(p), ok: !(c.powers ?? []).includes(p.key) && xpAvailable(c) >= powerCost(p) }} onBuy={() => buy(A.addPower, p)} />
                )))}
            </div>
            <p className="im-note">Coûts du livre (p.90) : caractéristique selon la nouvelle valeur, compétence et spécialisation 50 × n° de l'Avance, talent 100, pouvoir mineur 60, pouvoir de discipline 100. Les prérequis des talents restent à vérifier à la table.</p>
        </Modal>
    );
};

// ── Aiguillage ───────────────────────────────────────────────────────────────

const MlSheetModals = ({ asked, c, act, patron, sessionId, theme, onClose }) => {
    const catalog = useMemo(() => available(CATALOG), []);   // livres disponibles (config/setup.js)
    if (!asked) return null;
    const { kind, data = {} } = asked;
    switch (kind) {
    case 'roll':       return <MlRollModal c={c} asked={data} patron={patron} sessionId={sessionId} act={act} theme={theme} onClose={onClose} />;
    case 'damage':     return <DamageForm c={c} act={act} sessionId={sessionId} theme={theme} onClose={onClose} />;
    case 'critical':   return <CriticalForm c={c} act={act} sessionId={sessionId} theme={theme} onClose={onClose} />;
    case 'd10':        return <D10Table c={c} data={data} sessionId={sessionId} theme={theme} onClose={onClose} />;
    case 'fate':       return <FateForm c={c} act={act} onClose={onClose} />;
    case 'solars':     return <NumberForm title="Solars" label="Solars" value={c.solars} onSave={v => act.patch({ solars: Math.max(0, v) })} onClose={onClose} />;
    case 'gainXp':     return <NumberForm title="Gagner de l'expérience" label="XP gagnée (30 à 50 par séance, +50 / +500 pour un objectif)" value={0} onSave={v => act.run(A.gainXp, v)} onClose={onClose} />;
    case 'items':
        return (
            <CatalogModal title="Inventaire" subtitle="Catalogue · livre de base et Inquisition" labels={ITEM_LABELS} layout={ITEM_LAYOUT} tabsAs="pill"
                          items={catalog} getKey={it => `${it.catalog}-${it.key}`} filters={ITEM_FILTERS} groupBy={ITEM_GROUP} searchFields={ITEM_SEARCH}
                          renderItem={it => <ItemRow it={it} />}
                          onAdd={it => act.addItems([itemFromEntry(it)])}
                          onAddCustom={dr => act.addItems([customItem({ name: dr.name, notes: dr.description ?? '' })])}
                          onClose={onClose} />
        );
    case 'item':       return <ItemDetail c={c} act={act} item={data.item} onClose={onClose} />;
    case 'removeItem':
        return <ConfirmModal title={`Retirer ${data.item.name}`} message="L'objet quitte l'inventaire." confirmText="Retirer" danger
                             onConfirm={() => { act.removeItem(data.item.id); onClose(); }} onCancel={onClose} />;
    case 'talent':     return <TalentDetail act={act} data={data} onClose={onClose} />;
    case 'contact':    return <ContactForm act={act} contact={data.contact} onClose={onClose} />;
    case 'influence':  return <InfluenceForm c={c} act={act} onClose={onClose} />;
    case 'text':       return <TextForm act={act} data={data} onClose={onClose} />;
    case 'xp':         return <XpForm c={c} act={act} onClose={onClose} />;
    default:           return null;
    }
};

export default MlSheetModals;

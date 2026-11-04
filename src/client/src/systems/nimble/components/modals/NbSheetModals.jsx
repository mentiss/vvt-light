// src/client/src/systems/nimble/components/modals/NbSheetModals.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fenêtres de la fiche, ouvertes par les sections via ask(kind, data) et rendues
// par NbSheet à côté de la feuille (jamais dedans) :
//   check / save / initiative  jet de d20 (NbRollModal)
//   attack / spell / featureRoll  attaque, sort, jet de capacité (NbAttackModal)
//   hp           dégâts, soins, PV temporaires (NbHpModal)
//   detail       capacité, sort ou objet en entier
//   conditions   gérer les états
//   items        ajouter au paquetage (CatalogModal de la plateforme)
//   removeItem   retirer un objet (confirmation)
//   purse        saisir la bourse
//   pick         rattraper un choix de liste
//   subclass     choisir la sous-classe
// Props : asked { kind, data }, c, act, sessionId, onClose
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Modal from '../../../../components/ui/Modal.jsx';
import ConfirmModal from '../../../../components/modals/ConfirmModal.jsx';
import CatalogModal from '../../../../components/modals/CatalogModal.jsx';
import { CONDITIONS } from '../../config/basics.js';
import { WEAPONS, ARMORS, GEAR, MAGIC_ITEMS } from '../../config/equipment.js';
import { SCHOOL_BY_KEY } from '../../config/catalog.js';
import { classOf, optionPool, featureUses, formulaVars, displayName } from '../../config/rules/character.js';
import { itemFromCatalog, customItem } from '../../config/rules/items.js';
import { useNbRoll } from '../../hooks/useNbRoll.js';
import NbHistoryEntry from '../layout/NbHistoryEntry.jsx';
import { NbPill, NbRich } from '../ui/NbUi.jsx';
import NbRollModal from './NbRollModal.jsx';
import NbAttackModal from './NbAttackModal.jsx';
import NbHpModal from './NbHpModal.jsx';
import NbChoiceList from './NbChoiceList.jsx';

// ── Détail d'une capacité, d'un sort ou d'un objet ─────────────────────────

const PER = { encounter: 'par rencontre', safeRest: 'par repos sûr', day: 'par jour' };
const RARITY = { uncommon: 'Peu commun', rare: 'Rare', very_rare: 'Très rare', legendary: 'Légendaire', varies: 'Rareté variable' };

const Detail = ({ c, data, onClose }) => {
    let title = '';
    let subtitle = '';
    let body = null;
    if (data.kind === 'feature') {
        const f = data.entry.feature;
        const uses = featureUses(c, data.entry, formulaVars(c));
        title = f.name;
        subtitle = [f.vo, f.cost, uses && `${uses.max} ${PER[uses.per] ?? ''}`].filter(Boolean).join(' · ');
        body = <NbRich text={f.text} />;
    } else if (data.kind === 'spell') {
        const s = data.spell;
        title = s.name;
        subtitle = [s.vo, s.tier === 0 ? 'Tour de magie' : `Rang ${s.tier}`, SCHOOL_BY_KEY[s.school]?.name ?? classOf(c)?.name, s.cost].filter(Boolean).join(' · ');
        body = (
            <>
                {s.target && <p><b>{s.target}</b>{s.damage?.dice ? ` · ${s.damage.dice}${s.damage.bonus ? ` + ${s.damage.bonus}` : ''}` : ''}</p>}
                <NbRich text={s.text} />
                {s.upcast && <p className="mt-2"><span className="nb-label">Amplification</span> {s.upcast}</p>}
                {s.highLevels?.text && <p className="mt-1"><span className="nb-label">Hauts niveaux</span> {s.highLevels.text}</p>}
                {s.notes && <NbRich text={s.notes} className="nb-note mt-2" />}
            </>
        );
    } else {
        const it = data.item;
        const d = it.data ?? {};
        title = it.name;
        subtitle = [d.vo, RARITY[d.rarity], `${it.slots} empl.`].filter(Boolean).join(' · ');
        body = (
            <>
                {d.damage && <p><b>Dégâts {d.damage}</b> ({String(d.stat).toUpperCase().replace('STR', 'FOR')}){(d.props ?? []).length > 0 && ` · ${d.props.map(p => `${p.key}${p.value ? ` ${p.value}` : ''}`).join(', ')}`}</p>}
                {d.defense !== undefined && <p><b>Défense {it.kind === 'shield' ? '+' : ''}{d.defense}</b>{d.addDex ? ' + DEX' : ''}{d.dexMax !== null && d.dexMax !== undefined ? ` (max ${d.dexMax})` : ''}</p>}
                {d.req && <p className="nb-note">Prérequis : {Object.entries(d.req).map(([k, v]) => `${k.toUpperCase().replace('STR', 'FOR')} ${v}`).join(', ')}</p>}
                {d.text && <NbRich text={d.text} />}
                {it.notes && <p className="nb-note mt-2">{it.notes}</p>}
            </>
        );
    }
    return (
        <Modal onClose={onClose} title={title} subtitle={subtitle} size="md" footer={<button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>}>
            {body}
        </Modal>
    );
};

// ── Catalogue d'équipement ──────────────────────────────────────────────────

const KIND_LABELS = { weapon: 'Armes', armor: 'Armures', shield: 'Boucliers', gear: 'Équipement', magic: 'Objets magiques' };
const CATALOG_ITEMS = [
    ...WEAPONS.map(e => ({ ...e, kind: 'weapon', meta: `${e.damage} · ${String(e.stat).toUpperCase().replace('STR', 'FOR')}` })),
    ...ARMORS.map(e => ({ ...e, kind: e.type === 'shield' ? 'shield' : 'armor', meta: e.type === 'shield' ? `+${e.defense}` : `${e.defense}${e.addDex !== false ? '+DEX' : ''}${e.dexMax ? ` (max ${e.dexMax})` : ''}` })),
    ...GEAR.map(e => ({ ...e, kind: 'gear', meta: e.text ?? '' })),
    ...MAGIC_ITEMS.map(e => ({ ...e, kind: 'magic', meta: RARITY[e.rarity] ?? '' })),
];
const ITEM_FILTERS = [{ key: 'kind', getValue: it => it.kind, options: Object.entries(KIND_LABELS).map(([value, label]) => ({ value, label })) }];
const ITEM_GROUP = { getValue: it => KIND_LABELS[it.kind] };
const ITEM_SEARCH = ['name', 'vo', 'meta', 'text'];
const ITEM_LABELS = { customTab: 'Objet libre', search: 'Rechercher un objet…', countOne: 'objet', countMany: 'objets', added: 'Ajouté au paquetage' };
const ITEM_LAYOUT = ['filters', 'search'];

const ItemRow = ({ it }) => (
    <div>
        <div><b>{it.name}</b> <span className="nb-vo">{it.vo}</span> {it.cost && <span className="nb-tag">{it.cost}</span>}</div>
        <div className="nb-line-meta">{it.meta}</div>
    </div>
);

// ── Formulaires courts ──────────────────────────────────────────────────────

const PurseForm = ({ c, act, onClose }) => {
    const [gold, setGold] = useState(String(c.gold ?? 0));
    const [silver, setSilver] = useState(String(c.silver ?? 0));
    return (
        <Modal onClose={onClose} title="Bourse" size="sm"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => { act.setPurse(Math.trunc(Number(gold) || 0), Math.trunc(Number(silver) || 0)); onClose(); }}>Enregistrer</button>
               </>}>
            <div className="nb-name-fields">
                <label><span className="vtt-field-label">Pièces d'or (po)</span><input className="nb-input" type="number" min="0" value={gold} onChange={e => setGold(e.target.value)} /></label>
                <label><span className="vtt-field-label">Pièces d'argent (pa)</span><input className="nb-input" type="number" min="0" value={silver} onChange={e => setSilver(e.target.value)} /></label>
            </div>
            <p className="nb-note mt-2">10 pa = 1 po.</p>
        </Modal>
    );
};

const PickForm = ({ c, act, pool, onClose }) => {
    const options = optionPool(c, pool);
    const taken = (c.choices ?? []).filter(ch => ch.pool === pool).map(ch => ch.key);
    const [selected, setSelected] = useState([]);
    return (
        <Modal onClose={onClose} title={options?.label ?? 'Choix'} subtitle={options?.vo} size="lg" expandable
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={!selected.length}
                           onClick={() => { act.patch({ choices: [...(c.choices ?? []), ...selected.map(key => ({ pool, key, level: c.level }))] }); onClose(); }}>Ajouter</button>
               </>}>
            {options?.text && <NbRich text={options.text} className="nb-note mb-2" />}
            <NbChoiceList items={options?.items ?? []} selected={selected} max={99} taken={taken} onChange={setSelected} />
        </Modal>
    );
};

const SubclassForm = ({ c, act, onClose }) => {
    const [selected, setSelected] = useState([]);
    return (
        <Modal onClose={onClose} title="Sous-classe" subtitle={classOf(c)?.name} size="lg" expandable
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Annuler</button>
                   <button type="button" className="vtt-btn vtt-btn-primary" disabled={!selected.length} onClick={() => { act.patch({ subclassKey: selected[0] }); onClose(); }}>Choisir</button>
               </>}>
            <NbChoiceList items={classOf(c)?.subclasses ?? []} selected={selected} onChange={setSelected} />
        </Modal>
    );
};

/** Boire (ou faire boire) une potion : jet de soin, PV rendus, une potion de moins */
const PotionForm = ({ c, act, item, sessionId, onClose }) => {
    const { launch, rolling, entry } = useNbRoll();
    const m = /^(\d+)d(\d+)\s*\+?\s*(\d+)?$/.exec(String(item.data?.heal ?? '').replace(/\s/g, ''));
    const drink = async () => {
        if (!m) return;
        const r = await launch({ characterId: c.id, characterName: displayName(c), sessionId: sessionId ?? null, label: item.name, type: 'plain',
            systemData: { count: Number(m[1]), sides: Number(m[2]), bonus: Number(m[3] ?? 0), note: 'Soins' } });
        if (r) { act.heal(r.total); act.setQuantity(item.id, Math.max(0, item.quantity - 1)); }
    };
    return (
        <Modal onClose={onClose} title={item.name} subtitle={`Soigne ${item.data?.heal} PV · 1 action`} size="sm"
               footer={<>
                   <button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>
                   {!entry && <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling || !m} onClick={drink}>Boire</button>}
               </>}>
            {entry ? <div className="vtt-history-entry"><NbHistoryEntry roll={entry} /></div> : <p className="nb-note">{item.quantity} restante(s). Les PV sont rendus aussitôt.</p>}
        </Modal>
    );
};

// ── Répartiteur ─────────────────────────────────────────────────────────────

const NbSheetModals = ({ asked, c, act, sessionId, onClose }) => {
    if (!asked) return null;
    const { kind, data } = asked;
    switch (kind) {
    case 'check':
    case 'save':
    case 'initiative':
        return <NbRollModal c={c} kind={kind} skillOrStat={data} sessionId={sessionId} act={act} onClose={onClose} />;
    case 'attack':
        return <NbAttackModal c={c} mode={{ kind: 'weapon', attack: data.attack }} sessionId={sessionId} act={act} onClose={onClose} />;
    case 'spell':
        return <NbAttackModal c={c} mode={{ kind: 'spell', spell: data.spell }} sessionId={sessionId} act={act} onClose={onClose} />;
    case 'featureRoll':
        return <NbAttackModal c={c} mode={{ kind: 'feature', entry: data.entry }} sessionId={sessionId} act={act} onClose={onClose} />;
    case 'hp':
        return <NbHpModal c={c} act={act} onClose={onClose} />;
    case 'detail':
        return <Detail c={c} data={data} onClose={onClose} />;
    case 'conditions':
        return (
            <Modal onClose={onClose} title="États" subtitle="Clic : ajouter ou retirer" size="lg"
                   footer={<button type="button" className="vtt-btn" onClick={onClose}>Fermer</button>}>
                <div className="nb-fields">
                    {CONDITIONS.map(s => (
                        <div key={s.key} className="nb-line">
                            <div className="nb-line-main"><NbPill on={(c.conditions ?? []).includes(s.key)} onClick={() => act.toggleCondition(s.key)}>{s.label}</NbPill></div>
                            <div className="nb-line-text">{s.text}</div>
                        </div>
                    ))}
                </div>
            </Modal>
        );
    case 'items':
        return (
            <CatalogModal title="Paquetage" subtitle="Catalogue · Nimble Core Rules" labels={ITEM_LABELS} layout={ITEM_LAYOUT} tabsAs="pill"
                          items={CATALOG_ITEMS} getKey={it => it.key} filters={ITEM_FILTERS} groupBy={ITEM_GROUP} searchFields={ITEM_SEARCH}
                          renderItem={it => <ItemRow it={it} />}
                          onAdd={it => { const row = itemFromCatalog(it.key); if (row) act.addItems([row]); }}
                          onAddCustom={d => act.addItems([customItem({ name: d.name, description: d.description ?? '' })])}
                          onClose={onClose} />
        );
    case 'removeItem':
        return <ConfirmModal title={`Retirer ${data.item.name}`} message="L'objet quitte le paquetage." confirmText="Retirer" danger
                             onConfirm={() => { act.removeItem(data.item.id); onClose(); }} onCancel={onClose} />;
    case 'purse':
        return <PurseForm c={c} act={act} onClose={onClose} />;
    case 'potion':
        return <PotionForm c={c} act={act} item={data.item} sessionId={sessionId} onClose={onClose} />;
    case 'pick':
        return <PickForm c={c} act={act} pool={data.pool} onClose={onClose} />;
    case 'subclass':
        return <SubclassForm c={c} act={act} onClose={onClose} />;
    default:
        return null;
    }
};

export default NbSheetModals;

// src/client/src/systems/cyberpunk/components/creation/StepGear.jsx
// Étape 8 : matos (spec_cyberpunk.md §9.3, §9.7, planche_creation.html).
//   Kit de l'archétype (offert, sans défaut) · outillage selon la sphère ou la
//   spécialisation · matos personnalisé et nommé des manœuvres (Rig, Arme
//   personnalisée, drones) · achats avec les Cred de départ : un défaut par objet
//   acheté s'il a une liste, choix imposés (daemon d'une chip…).
import React, { useState } from 'react';
import {
    ITEMS_ALL, ITEM_AND_CYBERWARE_CATEGORY_LABEL, STARTING_CRED,
    findPlaybook, findItem, draftKit, kitEntries, moveGear, tagChoicesOf, gearRemaining,
    itemPrice, purchaseQuantity, purchaseDefects, remainingCred, canBuy,
} from '../../config.jsx';
import { Card } from '../layout/Card.jsx';
import { StepHead, ConfigBox, TagChoices, TagRow } from './CreationParts.jsx';

const catLabel = (cat) => ITEM_AND_CYBERWARE_CATEGORY_LABEL[cat] ?? cat;

/** Réglage des choix imposés d'un objet (daemon d'une chip, compétence…). */
const ItemChoices = ({ name, config = {}, onConfig, title }) => {
    const choices = tagChoicesOf(findItem(name));
    if (!choices.length) return null;
    const got = choices.filter(c => (config.choices?.[c.label]?.length ?? 0) >= c.pick).length;
    return (
        <ConfigBox title={title ?? name} got={got} need={choices.length} label="choix">
            <TagChoices choices={choices} value={config.choices} onChange={(label, v) => onConfig({ choices: { ...config.choices, [label]: v } })} />
        </ConfigBox>
    );
};

/** Matos personnalisé d'une manœuvre : nom obligatoire, tags ajoutés (profil). */
const CustomGear = ({ gear, value = {}, onChange, children }) => {
    const tags = Array.from({ length: gear.tags }, (_, i) => value.tags?.[i] ?? '');
    const filled = tags.filter(t => t.trim()).length + (value.name?.trim() ? 1 : 0) + (gear.kind === 'add' && value.item ? 1 : 0);
    return (
        <ConfigBox title={`${gear.move} — personnalisé`} got={filled} need={gear.tags + 1 + (gear.kind === 'add' ? 1 : 0)} label="champs">
            {children}
            <p className="cp-cr-rule">{gear.hint}. Personnalisé, il <b>doit être nommé</b> : le nom devient celui de l'objet sur la fiche.</p>
            <label className="flex flex-col gap-1">
                <span className="cp-field-label">Nom</span>
                <input className="cp-input" value={value.name ?? ''} placeholder="Ex. La Veuve" onChange={e => onChange({ name: e.target.value })} />
            </label>
            <div className="cp-cr-form">
                {tags.map((t, i) => (
                    <input key={i} className="cp-input is-sm" value={t} placeholder={`Tag ajouté ${i + 1}`} aria-label={`Tag ajouté ${i + 1}`}
                           onChange={e => onChange({ tags: tags.map((x, j) => (j === i ? e.target.value : x)) })} />
                ))}
            </div>
        </ConfigBox>
    );
};

/** Un groupe du kit : options, objets imposés, outillage au choix entre sphères. */
const KitGroup = ({ group, draft, onGear, onConfig, custom, onMoveGear }) => {
    const gear = draft.gear;
    const optKey = gear.kitOption?.[group.id];
    const opt = group.options?.find(o => o.key === optKey);
    const g = opt ? { ...group, ...opt } : group;
    const chosen = group.options && !opt ? [] : (g.fixed ? g.from : g.from.filter(e => e.name === gear.kit?.[group.id]));
    const entries = kitEntries(draft).filter(e => e.group === group.id);
    return (
        <div className="cp-cr-group">
            <div className="cp-cr-group-label">{g.label}<small>{group.options && !opt ? 'sphère au choix' : g.fixed ? 'offert d\'office' : `${g.pick} au choix`}</small></div>
            <div className="cp-cr-group-body">
                {group.options && (
                    <div className="cp-cr-list">
                        {group.options.map(o => (
                            <button key={o.key} type="button" className={optKey === o.key ? 'is-on' : ''}
                                    onClick={() => onGear(gr => ({ kitOption: { ...gr.kitOption, [group.id]: o.key }, kit: { ...gr.kit, [group.id]: undefined } }))}>{o.key}</button>
                        ))}
                    </div>
                )}
                {(!group.options || opt) && (
                    <div className="cp-cr-opts">
                        {g.from.map(e => g.fixed
                            ? <span key={e.name} className="cp-cr-opt is-fixed">{e.name}<span className="k">d'office</span></span>
                            : (
                                <button key={e.name} type="button" className={`cp-cr-opt ${gear.kit?.[group.id] === e.name ? 'is-on' : ''}`}
                                        title={findItem(e.name)?.description ?? ''}
                                        onClick={() => onGear(gr => ({ kit: { ...gr.kit, [group.id]: gr.kit?.[group.id] === e.name ? undefined : e.name } }))}>{e.name}</button>
                            ))}
                    </div>
                )}
                {chosen.map(e => {
                    const def = findItem(e.name);
                    return (
                        <div key={e.name} className="cp-cr-opt-desc">
                            {def?.description}
                            <TagRow tags={[...(def?.tags ?? []), ...e.tags]} />
                        </div>
                    );
                })}
                {entries.map(e => (
                    <ItemChoices key={e.key} name={e.name} config={gear.config?.[e.key]} onConfig={p => onConfig(e.key, p)} />
                ))}
                {custom && entries.length > 0 && (
                    <CustomGear gear={custom} value={gear.moveGear?.[custom.move]} onChange={p => onMoveGear(custom.move, p)} />
                )}
            </div>
        </div>
    );
};

const StepGear = ({ draft, onGear, onConfig, onBuy, onUnbuy, onMoveGear }) => {
    const [query, setQuery] = useState('');
    const [cat, setCat] = useState('all');
    const pb = findPlaybook(draft.playbook);
    const gear = draft.gear;
    const buys = gear.buys ?? [];
    const left = remainingCred(buys);
    const moves = draft.moveObjs.map(m => m.name);
    const gears = moveGear(draft.playbook, moves);
    const adds = gears.filter(x => x.kind === 'add');
    const q = query.trim().toLowerCase();
    const shop = ITEMS_ALL.filter(it => (cat === 'all' || it.category === cat)
        && (!q || `${it.name} ${it.description ?? ''}`.toLowerCase().includes(q)));
    const cats = [...new Set(ITEMS_ALL.map(it => it.category))];

    return (
        <>
            <StepHead num={8} title="Matos" remaining={gearRemaining(draft)} unit={['choix restant', 'choix restants']}
                      sub={`Ton kit d'archétype est offert. Complète-le avec tes ${STARTING_CRED} Cred ; ce qui reste va sur ta fiche.`} />

            <Card title={`Kit — ${pb?.label ?? ''}`} action={<span className="cp-cr-badge is-done">offert</span>}>
                {draftKit(draft).map(g => (
                    <KitGroup key={g.id} group={g} draft={draft} onGear={onGear} onConfig={onConfig} onMoveGear={onMoveGear}
                              custom={gears.find(x => x.kind === 'customize' && x.group === g.id)} />
                ))}
            </Card>

            {adds.length > 0 && (
                <Card title="Matos des manœuvres">
                    <div className="cp-cr-configs">
                        {adds.map(x => {
                            const v = gear.moveGear?.[x.move] ?? {};
                            return (
                                <CustomGear key={x.move} gear={x} value={v} onChange={p => onMoveGear(x.move, p)}>
                                    <div className="cp-cr-opts">
                                        {ITEMS_ALL.filter(it => it.category === x.category).map(it => (
                                            <button key={it.name} type="button" className={`cp-cr-opt ${v.item === it.name ? 'is-on' : ''}`} title={it.description ?? ''}
                                                    onClick={() => onMoveGear(x.move, { item: it.name })}>{it.name}</button>
                                        ))}
                                    </div>
                                    {v.item && <div className="cp-cr-opt-desc">{findItem(v.item)?.description}<TagRow tags={findItem(v.item)?.tags} /></div>}
                                </CustomGear>
                            );
                        })}
                    </div>
                </Card>
            )}

            <Card title="Achats" action={(
                <div className={`cp-cr-budget ${left < 0 ? 'is-over' : ''}`}>
                    <span className="cp-cr-rule">Cred restante</span>
                    <div className="cp-credstick"><b>{left}</b></div>
                </div>
            )}>
                <p className="cp-cr-rule">Prix de création seulement. Un objet sans prix n'est pas achetable. Un objet acheté demande <b>un défaut</b> pris dans sa liste, s'il en a une.</p>
                <div className="cp-cr-tools">
                    <input className="cp-input" value={query} placeholder="Chercher : grenade, chip, masque…" aria-label="Chercher un objet"
                           onChange={e => setQuery(e.target.value)} />
                    <div className="cp-cr-cats">
                        <button type="button" className={cat === 'all' ? 'is-on' : ''} onClick={() => setCat('all')}>Tout</button>
                        {cats.map(c => <button key={c} type="button" className={cat === c ? 'is-on' : ''} onClick={() => setCat(c)}>{catLabel(c)}</button>)}
                    </div>
                </div>
                <div className="cp-cr-shop">
                    <div className="cp-cr-row is-head"><span>Objet</span><span>Prix</span><span>Quantité</span><span className="text-right">Achat</span></div>
                    {shop.map(it => {
                        const price = itemPrice(it.name);
                        const mine = buys.filter(b => b.name === it.name);
                        const qty = purchaseQuantity(it.name);
                        const defects = purchaseDefects(it.name).map(t => t.text);
                        return (
                            <div key={it.name} className={`cp-cr-row ${price === null ? 'opacity-50' : ''}`}>
                                <span className="nm">{it.name}<small>{catLabel(it.category)}</small></span>
                                <span className="pr">{price === null ? <span className="cp-cr-rule">pas de prix</span> : `${price} Cred`}</span>
                                <span className="lt">{qty > 1 ? `× ${qty}` : 'à l\'unité'}</span>
                                <span className="qy">
                                    <button type="button" className="cp-step" aria-label="Retirer un achat" disabled={!mine.length} onClick={() => onUnbuy(mine[mine.length - 1].uid)}>−</button>
                                    <b>{mine.length}</b>
                                    <button type="button" className="cp-step" aria-label="Acheter" disabled={!canBuy(it.name, buys)} onClick={() => onBuy(it.name)}>+</button>
                                </span>
                                {it.description && <span className="ds">{it.description}</span>}
                                {mine.length > 0 && (defects.length > 0 || tagChoicesOf(it).length > 0) && (
                                    <div className="cp-cr-configs">
                                        {mine.map((b, i) => {
                                            const key = `buy:${b.uid}`, cfg = gear.config?.[key] ?? {};
                                            const title = `${it.name}${mine.length > 1 ? ` n°${i + 1}` : ''}`;
                                            return (
                                                <React.Fragment key={b.uid}>
                                                    {defects.length > 0 && (
                                                        <ConfigBox title={title} got={cfg.defect ? 1 : 0} need={1} label="défaut d'achat">
                                                            <div className="cp-cr-sugg">
                                                                {defects.map(t => (
                                                                    <button key={t} type="button" className={cfg.defect === t ? 'is-on' : ''}
                                                                            onClick={() => onConfig(key, { defect: cfg.defect === t ? null : t })}>{t}</button>
                                                                ))}
                                                            </div>
                                                        </ConfigBox>
                                                    )}
                                                    <ItemChoices name={it.name} title={title} config={cfg} onConfig={p => onConfig(key, p)} />
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </>
    );
};

export default StepGear;

// src/client/src/systems/maledictum/components/layout/MlSections.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sections de la fiche (planche_themes.html, spec_maledictum.md §11.2), partagées
// par la fiche joueur et la fiche ouverte par le MJ : chaque section affiche et
// appelle, les règles vivent dans config/rules/. Les actions de jeu s'enregistrent
// tout de suite (act.*) ; les fenêtres passent par act.ask(kind, data).
// Props communes : c (personnage), act (useMlActions), d (dérivés), patron (facultatif)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { SKILLS } from '../../config/skills.js';
import { TALENTS } from '../../config/talents.js';
import { POWERS } from '../../config/powers.js';
import { CONDITIONS } from '../../config/tables.js';
import { BOONS } from '../../config/patron.js';
import { FACTION_BY_KEY, ROLE_BY_KEY, ORIGIN_BY_KEY } from '../../config/rules/creation.js';
import {
    CHAR_KEYS, CHAR_SHORT, charValue, charBonus, skillValue, specValue, specsBySkill, armourByLocation, encumbrance,
    weaponDamage, weaponSkillValue, displayName, xpAvailable, LOCATIONS,
} from '../../config/rules/character.js';
import { LOCATION_LABELS, signed } from '../../config/rules/dice.js';
import { sortedItems } from '../../config/rules/items.js';
import { isDying } from '../../config/rules/actions.js';
import { Block, Orn, Rule, Gauge, Portrait, PlusIcon, MinusIcon, TrashIcon, FlameIcon } from '../ui/MlUi.jsx';

const TALENT_BY_KEY = Object.fromEntries(TALENTS.map(t => [t.key, t]));
const POWER_BY_KEY = Object.fromEntries(POWERS.map(p => [p.key, p]));
const BOON_BY_KEY = Object.fromEntries((BOONS ?? []).map(b => [b.key, b]));
const SKILLS_SORTED = [...SKILLS].sort((a, b) => a.label.localeCompare(b.label, 'fr'));
const LOC_SHORT = { head: 'Tête', left_arm: 'Bras G', right_arm: 'Bras D', body: 'Corps', left_leg: 'Jambe G', right_leg: 'Jambe D' };
const LOC_ROLL = { head: '1', left_arm: '2', right_arm: '3', body: '6-0', left_leg: '4', right_leg: '5' };
export const RANGE_LABELS = { immediate: 'Contact', short: 'Courte', medium: 'Moyenne', long: 'Longue', extreme: 'Extrême' };
const DISCIPLINE_LABELS = { minor: 'Mineur', biomancy: 'Biomancie', divination: 'Divination', pyromancy: 'Pyromancie', telekinesis: 'Télékinésie', telepathy: 'Télépathie' };
const SPEED_LABELS = { slow: 'Lente', normal: 'Normale', fast: 'Rapide' };

export const factionLabel = (key) => (key === 'inquisition' ? 'Inquisition' : FACTION_BY_KEY[key]?.label ?? key);

const Adv = ({ n }) => <span className="im-adv">{[0, 1, 2, 3].map(i => <i key={i} className={i < n ? 'on' : ''} />)}</span>;
const MiniBtn = ({ onClick, title, children, disabled }) => (
    <button type="button" className="im-mini-btn" onClick={onClick} title={title} aria-label={title} disabled={disabled}>{children}</button>
);

// ── Identité ─────────────────────────────────────────────────────────────────

export const IdentitySection = ({ c, onAvatar }) => {
    const faction = FACTION_BY_KEY[c.factionKey];
    const duty = faction?.duties?.find(x => x.key === c.dutyKey);
    const role = ROLE_BY_KEY[c.roleKey];
    const origin = ORIGIN_BY_KEY[c.originKey];
    return (
        <Block title="Acolyte" skulls className="im-ident">
            <span className="im-emblem"><Orn name="emblem" /></span>
            <Portrait avatar={c.avatar} onClick={onAvatar} />
            <span className="im-wskull"><Orn name="wskull" /></span>
            <div className="im-name">{displayName(c)}</div>
            <div className="im-role">{[duty?.label, faction?.label].filter(Boolean).join(' · ') || 'Sans faction'}</div>
            <div className="im-meta">{[role && `Rôle : ${role.label}`, origin && `Origine : ${origin.label}`].filter(Boolean).join(' · ')}</div>
        </Block>
    );
};

// ── Patron (fiche de groupe de la table) ─────────────────────────────────────

export const PatronSection = ({ patron }) => {
    const p = patron?.data ?? {};
    const known = Object.entries(p.influence ?? {}).filter(([, v]) => v > 0);
    return (
        <Block title="Patron">
            {!p.name ? <p className="im-empty">Aucun Patron pour cette table : le MJ le présente.</p> : (
                <>
                    <div className="im-patron">
                        <span className="im-patron-rosette"><Orn name="rosette" /></span>
                        <div><b>{p.title ? `${p.title} ` : ''}{p.name}</b><small>{[p.ordoLabel ?? factionLabel(p.ordo), p.philosophyLabel, p.demeanourLabel].filter(Boolean).join(' · ')}</small></div>
                    </div>
                    {(p.boons ?? []).length > 0 && (
                        <>
                            <div className="im-sub">Faveurs</div>
                            {p.boons.map(k => <div key={k} className="im-line" title={BOON_BY_KEY[k]?.summary ?? ''}>{BOON_BY_KEY[k]?.label ?? k}</div>)}
                        </>
                    )}
                    {known.map(([f, v]) => (
                        <div key={f} className="im-contact"><span><b>Influence connue</b> <em>{factionLabel(f)}</em></span><span>{signed(v)}</span></div>
                    ))}
                </>
            )}
        </Block>
    );
};

// ── Blessures, Ressources ────────────────────────────────────────────────────

// Blessures et Blessures critiques ensemble : au-delà du maximum de Blessures vient une
// critique, et plus de critiques non soignées que BE rend mourant (livre p.217-219).
export const WoundsSection = ({ c, d, act }) => {
    const unTreated = (c.criticals ?? []).filter(k => !k.treated).length;
    return (
        <Block title="Blessures">
            <div className="im-res">
                <div className="im-res-row is-click" onClick={() => act.ask('damage')} role="button" tabIndex={0} title="Subir des dégâts">
                    <b>Blessures</b>
                    <span>{c.wounds ?? 0} <small>/ {d.woundsMax}</small></span>
                    <Gauge value={c.wounds ?? 0} max={d.woundsMax} warn={(c.wounds ?? 0) >= d.woundsMax} />
                </div>
                <div className="im-res-tools">
                    <MiniBtn title="Soigner 1 Blessure" onClick={() => act.setWounds((c.wounds ?? 0) - 1)}><MinusIcon /></MiniBtn>
                    <MiniBtn title="1 Blessure de plus" onClick={() => act.setWounds((c.wounds ?? 0) + 1)}><PlusIcon /></MiniBtn>
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('damage')}>Subir des dégâts</button>
                </div>
                <div className="im-res-row">
                    <b>Blessures critiques</b>
                    <span className={isDying(c) ? 'is-danger' : ''}>{unTreated} <small>/ {d.criticalsMax}</small></span>
                </div>
            </div>
            {(c.criticals ?? []).map(k => (
                <div key={k.id} className={`im-crit${k.treated ? ' is-treated' : ''}`}>
                    <b>{LOCATION_LABELS[k.location] ?? k.location}</b>
                    <span>{k.label}{k.dead ? ' · mort' : ''}</span>
                    <em>{k.treated ? 'Soignée' : k.treatment ? `À soigner : ${k.treatment}` : 'À soigner'}</em>
                    <span className="im-crit-tools">
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.toggleCriticalTreated(k.id)}>{k.treated ? 'Rouvrir' : 'Soignée'}</button>
                        <MiniBtn title="Effacer" onClick={() => act.removeCritical(k.id)}><TrashIcon /></MiniBtn>
                    </span>
                </div>
            ))}
            {isDying(c) && <p className="im-alert">Mourant : plus de Blessures critiques non soignées que BE, mort à la fin du round.</p>}
            {(c.injuries ?? []).length > 0 && <div className="im-sub">Séquelles</div>}
            {(c.injuries ?? []).map((t, i) => (
                <div key={i} className="im-line im-line-tools"><span>{t}</span><MiniBtn title="Effacer" onClick={() => act.removeListEntry('injuries', i)}><TrashIcon /></MiniBtn></div>
            ))}
            <div className="im-res-tools">
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('critical')}><PlusIcon /> Blessure critique</button>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('text', { field: 'injuries', title: 'Ajouter une séquelle' })}><PlusIcon /> Séquelle</button>
            </div>
        </Block>
    );
};

export const ResourcesSection = ({ c, d, act }) => {
    const enc = encumbrance(c.items);
    const fate = Number(c.fate) || 0;
    const fateMax = Number(c.fateMax) || 0;
    const conditions = Object.entries(c.conditions ?? {});
    return (
        <Block title="Ressources">
            <div className="im-res">
                <div className="im-res-row">
                    <b>Destin</b>
                    <span className="im-pips">
                        {Array.from({ length: Math.max(fateMax, fate) }, (_, i) => (
                            <button key={i} type="button" className={`im-pip${i >= fate ? ' is-spent' : ''}`} title={i < fate ? 'Dépenser 1 Destin' : 'Destin dépensé'}
                                    onClick={() => (i < fate ? act.spendFate() : act.run(() => ({ fate: Math.min(fateMax, fate + 1) })))}>
                                <Orn name="sigil" />
                            </button>
                        ))}
                    </span>
                </div>
                <div className="im-res-tools">
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('fate')}>Destin…</button>
                </div>
                <div className="im-res-row is-click" onClick={() => act.ask('solars')} role="button" tabIndex={0} title="Modifier les Solars">
                    <b>Solars</b><span>{c.solars ?? 0}</span>
                </div>
            </div>
            <div className="im-derived">
                <div><b>Initiative</b><span>{d.initiative}</span></div>
                <div><b>Vitesse</b><span>{SPEED_LABELS[d.speed] ?? d.speed}</span></div>
                <div className={enc > d.encumbranceMax ? 'is-danger' : ''}><b>Encombr.</b><span>{enc} / {d.encumbranceMax}</span></div>
            </div>
            <Rule />
            <div className="im-states">
                {conditions.map(([key, level]) => {
                    const cond = CONDITIONS.find(x => x.key === key);
                    return (
                        <button key={key} type="button" className={`im-state${level === 'major' ? ' is-major' : ''}`}
                                title={`${level === 'major' ? cond?.major ?? '' : cond?.minor ?? cond?.summary ?? ''} (clic : niveau suivant)`}
                                onClick={() => act.cycleCondition(key, !!cond?.major)}>
                            {cond?.label ?? key}{cond?.major ? ` (${level === 'major' ? 'majeur' : 'mineur'})` : ''}
                        </button>
                    );
                })}
                <button type="button" className="im-state is-add" onClick={() => act.ask('conditions')}>+ État</button>
            </div>
        </Block>
    );
};

// ── Caractéristiques ─────────────────────────────────────────────────────────

export const CharacteristicsSection = ({ c, act }) => (
    <Block title="Caractéristiques" skulls extra={<span className="im-block-seal"><span className="im-purity" /></span>}>
        <div className="im-chars">
            {CHAR_KEYS.map(k => (
                <button key={k} type="button" className="im-char" title={`Test de ${CHAR_SHORT[k]}`}
                        onClick={() => act.ask('roll', { mode: 'test', label: CHAR_SHORT[k], base: charValue(c, k), char: k })}>
                    <b>{CHAR_SHORT[k]}</b><span>{charValue(c, k)}</span><small>B{charBonus(c, k)}</small>
                </button>
            ))}
        </div>
    </Block>
);

// ── Compétences ──────────────────────────────────────────────────────────────

export const SkillsSection = ({ c, d, act }) => {
    const bySkill = specsBySkill(c);
    return (
        <Block title="Compétences">
            <div className="im-skills">
                {SKILLS_SORTED.map(s => {
                    const restricted = s.key === 'psychic_mastery' && !d.psyker;
                    const value = skillValue(c, s.key);
                    return (
                        <div key={s.key} className="im-skill-group">
                            <button type="button" className={`im-skill${restricted ? ' is-restricted' : ''}`} disabled={restricted}
                                    onClick={() => act.ask('roll', { mode: 'test', label: s.label, base: value, skill: s.key })}>
                                <span>{s.label} <em>({CHAR_SHORT[s.char]})</em></span><Adv n={c.skills?.[s.key] ?? 0} /><span className="val">{restricted ? '—' : value}</span>
                            </button>
                            {(bySkill[s.key] ?? []).map(sp => (
                                <button key={`${sp.key}-${sp.label}`} type="button" className="im-skill is-spec"
                                        onClick={() => act.ask('roll', { mode: 'test', label: `${s.label} (${sp.label})`, base: specValue(c, sp), skill: s.key, spec: sp.key })}>
                                    <span>{sp.label}</span><Adv n={sp.adv} /><span className="val">{specValue(c, sp)}</span>
                                </button>
                            ))}
                        </div>
                    );
                })}
            </div>
        </Block>
    );
};

// ── Armes et armure ──────────────────────────────────────────────────────────

const traitText = (traits) => (traits ?? []).map(t => (typeof t === 'string' ? t : t.label ?? t.key)).join(', ');

export const WeaponsSection = ({ c, act, traitLabel }) => {
    const weapons = (c.items ?? []).filter(it => it.kind === 'weapon');
    return (
        <Block title="Armes">
            {weapons.length === 0 ? <p className="im-empty">Aucune arme : ajoutez-en depuis l'inventaire.</p> : (
                <table className="im-table">
                    <thead><tr><th>Arme</th><th>Dégâts</th><th>Portée</th><th>Charg.</th></tr></thead>
                    <tbody>
                        {weapons.map(w => {
                            const ranged = !!w.data?.range;
                            return (
                                <tr key={w.id} className="is-roll" onClick={() => act.ask('roll', {
                                    mode: 'attack', label: w.name, base: weaponSkillValue(c, w), damage: weaponDamage(c, w), ranged, weapon: w.name, item: w,
                                })} title={`Attaquer avec ${w.name}`}>
                                    <td><b>{w.name}</b><small>{[w.data?.spec ? specName(w.data.spec) : null, traitLabel(w.data?.traits)].filter(Boolean).join(' · ')}</small></td>
                                    <td className="num" title={w.data?.damageBonus === 'sb' ? `${w.data?.damage ?? 0} + BF, puis + DR` : undefined}>{w.data?.damage == null && w.data?.damageBonus !== 'sb' ? '—' : `${weaponDamage(c, w)} + DR`}</td>
                                    <td>{RANGE_LABELS[w.data?.range] ?? (ranged ? w.data.range : '—')}</td>
                                    <td className="num">{w.data?.mag ?? '—'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </Block>
    );
};

const SKILL_BY_KEY = Object.fromEntries(SKILLS.map(s => [s.key, s]));
/** Spécialisations libres du bestiaire, absentes de la liste des compétences */
const FREE_SPECS = {
    mathematics: 'Mathématiques', sisters_of_silence_sign_language: 'Langue des signes des Sœurs du Silence', stellar: 'Stellaire',
    voidship: 'Vaisseau du vide', macharian_sector: 'Secteur Macharius', aeldari: 'Aeldari', lingua_technis: 'Lingua Technis',
    digi_weapons: 'Armes digitales', divebomb: 'Piqué',
};
export const specName = (path) => {
    const [skill, spec] = String(path).split('.');
    const s = SKILL_BY_KEY[skill];
    const sp = s?.specs?.find(x => x.key === spec)?.label ?? (spec ? FREE_SPECS[spec] ?? spec.replace(/_/g, ' ') : null);
    return s ? (sp ? `${s.label} (${sp})` : s.label) : path;
};

export const ArmourSection = ({ c }) => {
    const armour = armourByLocation(c.items);
    const worn = (c.items ?? []).filter(it => it.kind === 'armour' && it.equipped).map(it => it.name);
    return (
        <Block title="Armure">
            <div className="im-armour-name">{worn.join(' · ') || 'Aucune armure portée'}</div>
            <div className="im-locs">
                {LOCATIONS.map(l => <div key={l} className="im-loc"><b>{LOC_SHORT[l]}</b><span>{armour[l]}</span><small>{LOC_ROLL[l]}</small></div>)}
            </div>
        </Block>
    );
};

// ── Inventaire ───────────────────────────────────────────────────────────────

export const InventorySection = ({ c, d, act }) => {
    const items = sortedItems(c.items);
    const enc = encumbrance(c.items);
    return (
        <Block title="Inventaire" extra={<span className="im-block-seal is-left"><span className="im-purity" /></span>}>
            <div className="im-gear-head"><span>Objet</span><span /><span>Enc.</span><span /></div>
            {items.length === 0 && <p className="im-empty">Inventaire vide.</p>}
            {items.map(it => (
                <div key={it.id} className={`im-gear${it.equipped ? ' is-equipped' : ''}`}>
                    <button type="button" className="im-gear-name" onClick={() => act.ask('item', { item: it })} title="Détail">
                        {it.name}{it.notes ? <em> · {it.notes}</em> : null}
                    </button>
                    <span className="q">{it.quantity > 1 ? `×${it.quantity}` : ''}</span>
                    <span className="e">{it.data?.enc ?? '—'}</span>
                    <span className="im-gear-tools">
                        {(it.kind === 'armour' || it.kind === 'weapon' || it.data?.category === 'clothing') && (
                            <button type="button" className={`im-mini-btn${it.equipped ? ' is-on' : ''}`} onClick={() => act.toggleEquipped(it.id)}
                                    title={it.equipped ? 'Retirer (porté)' : 'Porter / équiper'}>{it.equipped ? '●' : '○'}</button>
                        )}
                        <MiniBtn title="Retirer de l'inventaire" onClick={() => act.ask('removeItem', { item: it })}><TrashIcon /></MiniBtn>
                    </span>
                </div>
            ))}
            <div className="im-gear-foot">
                <span className={enc > d.encumbranceMax ? 'is-danger' : ''}>Encombrement {enc} / {d.encumbranceMax}</span>
                <span>{c.solars ?? 0} Solars</span>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('items')}><PlusIcon /> Ajouter (catalogue)</button>
            </div>
        </Block>
    );
};

// ── Talents ──────────────────────────────────────────────────────────────────

export const TalentsSection = ({ c, act }) => (
    <Block title="Talents" extra={<span className="im-watermark"><Orn name="tome" /></span>}>
        {(c.talents ?? []).length === 0 && <p className="im-empty">Aucun talent.</p>}
        {(c.talents ?? []).map((t, i) => {
            const def = TALENT_BY_KEY[t.key];
            return (
                <button key={`${t.key}-${i}`} type="button" className="im-talent" onClick={() => act.ask('talent', { talent: t, index: i })}>
                    <b>{def?.label ?? t.key}{t.choice ? ` (${t.choice})` : ''}{t.count > 1 ? ` ×${t.count}` : ''}</b>
                    <small>{def?.summary ?? ''}</small>
                </button>
            );
        })}
    </Block>
);

// ── Pouvoirs psychiques ──────────────────────────────────────────────────────

export const PowersSection = ({ c, d, act }) => {
    if (!d.psyker) return null;
    const charge = Number(c.warpCharge) || 0;
    const mastery = skillValue(c, 'psychic_mastery');
    const own = specsBySkill(c).psychic_mastery ?? [];
    return (
        <Block title="Pouvoirs psychiques">
            <div className="im-res-row">
                <b>Charge Warp</b>
                <span className={charge > d.warpThreshold ? 'is-danger' : ''}>{charge} <small>/ seuil {d.warpThreshold}</small></span>
                <Gauge value={charge} max={d.warpThreshold || 1} warn={charge > d.warpThreshold} />
            </div>
            <div className="im-res-tools">
                <MiniBtn title="−1 Charge Warp" onClick={() => act.setWarpCharge(charge - 1)}><MinusIcon /></MiniBtn>
                <MiniBtn title="+1 Charge Warp" onClick={() => act.setWarpCharge(charge + 1)}><PlusIcon /></MiniBtn>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('roll', {
                    mode: 'test', label: 'Purge (Discipline (Psychique))', purge: true,
                    base: (() => { const sp = (specsBySkill(c).discipline ?? []).find(s => s.key === 'psychic'); return sp ? specValue(c, sp) : skillValue(c, 'discipline'); })(),
                })}>Purger</button>
            </div>
            {charge > d.warpThreshold && <p className="im-alert"><FlameIcon /> Seuil Warp dépassé : test de Maîtrise psychique en fin de tour, sinon Périls du Warp.</p>}
            {(c.powers ?? []).map(key => {
                const p = POWER_BY_KEY[key];
                if (!p) return <div key={key} className="im-power"><b>{key}</b></div>;
                const sp = own.find(s => s.key === p.spec);
                return (
                    <button key={key} type="button" className="im-power" onClick={() => act.ask('roll', {
                        mode: 'power', label: p.label, base: sp ? specValue(c, sp) : mastery, power: p,
                    })}>
                        <b>{p.label}{p.overt ? ' *' : ''}</b>
                        <span>{DISCIPLINE_LABELS[p.discipline]} · Indice {p.warpRating} · {p.difficulty ? signed(p.difficulty) : 'Exigeant'}</span>
                    </button>
                );
            })}
        </Block>
    );
};

// ── Influence et contacts ────────────────────────────────────────────────────

export const InfluenceSection = ({ c, act }) => {
    const influence = Object.entries(c.influence ?? {});
    const pct = (v) => `${(Math.abs(v) / 5) * 50}%`;
    return (
        <Block title="Influence et contacts">
            {influence.length === 0 && <p className="im-empty">Aucune Influence.</p>}
            {influence.map(([f, v]) => (
                <div key={f} className="im-infl">
                    <span className="lab">{factionLabel(f)}</span>
                    <span className="im-infl-bar"><i style={v >= 0 ? { left: '50%', width: pct(v) } : { right: '50%', width: pct(v) }} /></span>
                    <span className="im-infl-val">
                        <MiniBtn title="−1" onClick={() => act.setInfluence(f, v - 1)}><MinusIcon /></MiniBtn>
                        <b>{signed(v)}</b>
                        <MiniBtn title="+1" onClick={() => act.setInfluence(f, v + 1)}><PlusIcon /></MiniBtn>
                    </span>
                </div>
            ))}
            <div className="im-sub">Contacts</div>
            {(c.contacts ?? []).map(k => (
                <button key={k.id} type="button" className="im-contact" onClick={() => act.ask('contact', { contact: k })}>
                    <span><b>{k.name || 'Sans nom'}</b> <em>{factionLabel(k.faction)}</em></span><span>{signed(k.value ?? 0)}</span>
                </button>
            ))}
            <div className="im-res-tools">
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('influence')}><PlusIcon /> Influence</button>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('contact', { contact: null })}><PlusIcon /> Contact</button>
            </div>
        </Block>
    );
};

// ── Corruption ───────────────────────────────────────────────────────────────

export const CorruptionSection = ({ c, d, act }) => {
    const corruption = Number(c.corruption) || 0;
    const list = (field, label, max) => (
        <div>
            <div className="im-sub">{label} <small>{(c[field] ?? []).length} / {max}</small></div>
            {(c[field] ?? []).length === 0 && <p className="im-empty">Aucune</p>}
            {(c[field] ?? []).map((t, i) => (
                <div key={i} className="im-line im-line-tools"><span>{t}</span><MiniBtn title="Effacer" onClick={() => act.removeListEntry(field, i)}><TrashIcon /></MiniBtn></div>
            ))}
        </div>
    );
    return (
        <Block title="Corruption">
            <div className="im-res-row">
                <b>Corruption</b>
                <span className={corruption > d.corruptionThreshold ? 'is-danger' : ''}>{corruption} <small>/ seuil {d.corruptionThreshold}</small></span>
                <Gauge value={corruption} max={d.corruptionThreshold || 1} warn />
            </div>
            <div className="im-res-tools">
                <MiniBtn title="−1 Corruption" onClick={() => act.setCorruption(corruption - 1)}><MinusIcon /></MiniBtn>
                <MiniBtn title="+1 Corruption" onClick={() => act.setCorruption(corruption + 1)}><PlusIcon /></MiniBtn>
            </div>
            {corruption > d.corruptionThreshold && <p className="im-alert">Au-delà du seuil : test Exigeant de Robustesse ou de Discipline à la prochaine aventure ; échec : Mutation (pair) ou Malignité (impair).</p>}
            <div className="im-corr-split">
                {list('mutations', 'Mutations', charBonus(c, 'tgh'))}
                {list('malignancies', 'Malignités', charBonus(c, 'wil'))}
            </div>
            <div className="im-res-tools">
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('roll', { mode: 'table', tableKey: 'mutation', label: 'Mutation' })}>Tirer une Mutation</button>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('roll', { mode: 'table', tableKey: 'malignancy', label: 'Malignité' })}>Tirer une Malignité</button>
            </div>
        </Block>
    );
};

// ── Objectifs et expérience ──────────────────────────────────────────────────

export const GoalsSection = ({ c, act }) => (
    <Block title="Objectifs et expérience">
        <div className="im-goal"><b>Court terme</b><span>{c.goals?.short || '—'}</span></div>
        <div className="im-goal"><b>Long terme</b><span>{c.goals?.long || '—'}</span></div>
        <div className="im-xp">
            <span className="im-xp-laurel"><Orn name="laurel" /><b>{xpAvailable(c)}</b></span>
            <span>XP disponible<br /><small>{c.xpTotal ?? 0} gagnés · {c.xpSpent ?? 0} dépensés</small></span>
        </div>
        <div className="im-res-tools">
            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={() => act.ask('xp')}>Dépenser l'XP</button>
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => act.ask('gainXp')}>Gagner de l'XP</button>
        </div>
    </Block>
);

export { traitText };

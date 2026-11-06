// src/client/src/systems/maledictum/components/creation/CreationTabs.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglets de l'assistant de création (spec_maledictum.md §11.3) : Guide,
// Caractéristiques, Origine, Faction, Rôle, Équipement, Identité ; colonne
// d'aide contextuelle (HelpPanel). Règles : config/rules/creation.js ;
// textes : config/creationHelp.js. Pas de <select> : des pills et des cartes.
// Props des onglets : ws, setWs, help (setHelpTopic)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { CHARACTERISTICS } from '../../config/characteristics.js';
import { SKILLS } from '../../config/skills.js';
import { TALENTS } from '../../config/talents.js';
import { ORIGINS, INQUISITION_ORIGINS } from '../../config/origins.js';
import { FACTIONS } from '../../config/factions.js';
import { ROLES } from '../../config/roles.js';
import { GUIDE, TAB_HELP } from '../../config/creationHelp.js';
import { CHAR_KEYS, CHAR_SHORT } from '../../config/rules/character.js';
import {
    ORIGIN_BY_KEY, FACTION_BY_KEY, ROLE_BY_KEY, XP_RANDOM, POINTS_TOTAL, POINTS_MIN, POINTS_MAX, CHAR_BASE,
    startingChars, charBonuses, finalChars, pointsSpent, creationXp, isPsyker, powerChoices, equipmentLabels, startingSolars,
    originForRoll, factionForRoll, factionAdvances,
} from '../../config/rules/creation.js';
import { Pill, Pills, Stepper, Toggle, Field } from '../ui/MlUi.jsx';

const SKILL_BY_KEY = Object.fromEntries(SKILLS.map(s => [s.key, s]));
const TALENT_BY_KEY = Object.fromEntries(TALENTS.map(t => [t.key, t]));
const CHAR_BY_KEY = Object.fromEntries(CHARACTERISTICS.map(c => [c.key, c]));
const d100 = () => 1 + Math.floor(Math.random() * 100);
const advLabel = (key) => {
    const [s, sp] = key.split('.');
    const skill = SKILL_BY_KEY[s];
    const spec = skill?.specs?.find(x => x.key === sp);
    return spec ? `${skill.label} (${spec.label})` : skill?.label ?? key;
};
const charList = (o) => Object.entries(o ?? {}).map(([k, v]) => `+${v} ${CHAR_SHORT[k]}`).join(', ');

const Card = ({ on, onClick, title, sub, children }) => (
    <button type="button" className={`im-card-pick${on ? ' is-selected' : ''}`} onClick={onClick}>
        <b>{title}</b>{sub && <small>{sub}</small>}{children}
    </button>
);

// ── Aide ─────────────────────────────────────────────────────────────────────

export const HelpPanel = ({ topic, onBack }) => {
    let title = '';
    let body = null;
    if (topic.kind === 'tab') {
        const h = TAB_HELP[topic.key];
        title = h?.title; body = <p>{h?.text}</p>;
    } else if (topic.kind === 'origin') {
        const o = ORIGIN_BY_KEY[topic.key];
        title = o?.label; body = <><p>{o?.summary}</p>{o?.worlds && <p className="im-note">Mondes : {o.worlds.join(', ')}</p>}<p className="im-note">{[charList(o?.fixed), o?.choice?.length ? `+5 au choix : ${o.choice.map(k => CHAR_SHORT[k]).join(', ')}` : null, (o?.equipment ?? []).join(', ')].filter(Boolean).join(' · ')}</p></>;
    } else if (topic.kind === 'faction') {
        const f = FACTION_BY_KEY[topic.key];
        title = f?.label; body = <><p>{f?.summary}</p><p className="im-note">Compétences : {(f?.benefits?.skills ?? []).map(advLabel).join(', ')} · {f?.benefits?.solars} Solars</p></>;
    } else if (topic.kind === 'duty') {
        const f = FACTION_BY_KEY[topic.faction];
        const d = f?.duties?.find(x => x.key === topic.key);
        title = d?.label; body = <><p className="im-note">{charList(d?.chars)} · Avances : {Object.entries(d?.advances ?? {}).map(([k, v]) => `${advLabel(k)} ${v}`).join(', ')}</p>
            <p className="im-note">Talents : {(d?.talents ?? []).map(k => TALENT_BY_KEY[k]?.label ?? k).join(', ') || '—'} · Équipement : {(d?.equipment ?? []).join(', ')} · {d?.solars} Solars</p></>;
    } else if (topic.kind === 'role') {
        const r = ROLE_BY_KEY[topic.key];
        title = r?.label; body = <><p>{r?.summary}</p><p className="im-note">Talents ({r?.talents?.pick}) : {(r?.talents?.from ?? []).map(k => TALENT_BY_KEY[k]?.label ?? k).join(', ')}</p></>;
    } else if (topic.kind === 'talent') {
        const t = TALENT_BY_KEY[topic.key];
        title = t?.label; body = <><p>{t?.summary}</p>{t?.requirement?.text && <p className="im-note">Prérequis (ignoré à la création) : {t.requirement.text}</p>}</>;
    } else if (topic.kind === 'power') {
        title = topic.power?.label; body = <><p>{topic.power?.summary}</p><p className="im-note">Indice Warp {topic.power?.warpRating}</p></>;
    } else if (topic.kind === 'char') {
        const c = CHAR_BY_KEY[topic.key];
        title = c?.label; body = <p>{c?.summary}</p>;
    }
    return (
        <aside className="im-help">
            <h4>{title}</h4>
            {body}
            {topic.kind !== 'tab' && <button type="button" className="vtt-btn vtt-btn-sm" onClick={onBack}>‹ Aide de l'onglet</button>}
        </aside>
    );
};

// ── Guide ────────────────────────────────────────────────────────────────────

export const GuideTab = ({ onStart }) => (
    <div className="im-guide">
        <h3>{GUIDE.title}</h3>
        <p>{GUIDE.intro}</p>
        <ol>{GUIDE.steps.map(([t, x]) => <li key={t}><b>{t}.</b> {x}</li>)}</ol>
        <p className="im-note">{GUIDE.random}</p>
        <p className="im-note">{GUIDE.caps}</p>
        <button type="button" className="vtt-btn vtt-btn-primary" onClick={onStart}>Commencer</button>
    </div>
);

// ── Caractéristiques ─────────────────────────────────────────────────────────

export const CharsTab = ({ ws, setWs, help, onRollChars, rolling }) => {
    const set = (p) => setWs(prev => ({ ...prev, ...p }));
    const start = startingChars(ws);
    const bonus = charBonuses(ws);
    const final = finalChars(ws);
    const [swapFrom, setSwapFrom] = React.useState(null);
    const swap = (i) => {
        if (swapFrom === null) { setSwapFrom(i); return; }
        const order = ws.order ? [...ws.order] : CHAR_KEYS.map((_, j) => j);
        [order[swapFrom], order[i]] = [order[i], order[swapFrom]];
        set({ order: order.every((v, j) => v === j) ? null : order });
        setSwapFrom(null);
    };
    return (
        <div className="im-fields">
            <Pills>
                <Pill on={ws.charMethod === 'roll'} onClick={() => set({ charMethod: 'roll' })}>Tirer 2d10 + 20</Pill>
                <Pill on={ws.charMethod === 'points'} onClick={() => set({ charMethod: 'points' })}>Acheter avec {POINTS_TOTAL} points</Pill>
            </Pills>
            {ws.charMethod === 'roll' && (
                <Pills>
                    <button type="button" className="vtt-btn vtt-btn-primary" disabled={rolling} onClick={() => onRollChars(!!ws.rolled)}>
                        {ws.rolled ? 'Relancer (0 XP)' : 'Lancer les dés'}
                    </button>
                    {ws.rolled && <span className="im-note">{ws.rerolled ? 'Relancé : pas d\'XP.' : ws.order ? `Réarrangé : +${XP_RANDOM.charsRearranged} XP.` : `Dans l'ordre : +${XP_RANDOM.charsInOrder} XP.`} Cliquez deux valeurs pour les échanger.</span>}
                </Pills>
            )}
            <div className="im-chars im-chars-wizard">
                {CHAR_KEYS.map((k, i) => (
                    <div key={k} className={`im-char${swapFrom === i ? ' is-picked' : ''}`} onMouseEnter={() => help({ kind: 'char', key: k })}>
                        <b>{CHAR_SHORT[k]}</b>
                        {ws.charMethod === 'roll'
                            ? <button type="button" className="im-char-val" disabled={!ws.rolled} onClick={() => swap(i)}>{start?.[k] ?? '—'}</button>
                            : <Stepper value={ws.points[k]} min={POINTS_MIN} max={POINTS_MAX} label={CHAR_BASE + ws.points[k]}
                                       onChange={v => set({ points: { ...ws.points, [k]: v } })} />}
                        <small>{bonus[k] ? `+${bonus[k]} → ${final?.[k] ?? '—'}` : final?.[k] ?? ''}</small>
                    </div>
                ))}
            </div>
            {ws.charMethod === 'points' && <p className="im-note">{pointsSpent(ws.points)} / {POINTS_TOTAL} points ; entre {POINTS_MIN} et {POINTS_MAX} par caractéristique, sur une base de {CHAR_BASE}.</p>}
        </div>
    );
};

// ── Origine ──────────────────────────────────────────────────────────────────

export const OriginTab = ({ ws, setWs, help }) => {
    const set = (p) => setWs(prev => ({ ...prev, ...p }));
    const list = ws.originSet === 'inquisition' ? INQUISITION_ORIGINS : ORIGINS;
    const origin = ORIGIN_BY_KEY[ws.originKey];
    const pick = (key, random = false) => { set({ originKey: key, originChoice: null, originSkill: null, originRandom: random }); help({ kind: 'origin', key }); };
    return (
        <div className="im-fields">
            <Pills>
                <Pill on={ws.originSet === 'core'} onClick={() => set({ originSet: 'core', originKey: null })}>Mondes du livre de base</Pill>
                <Pill on={ws.originSet === 'inquisition'} onClick={() => set({ originSet: 'inquisition', originKey: null })}>Origines macharriennes (Inquisition)</Pill>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => pick(originForRoll(ws.originSet, d100()), true)}>Laisser le destin décider (+{XP_RANDOM.origin} XP)</button>
            </Pills>
            <div className="im-card-grid">
                {list.map(o => (
                    <Card key={o.key} on={ws.originKey === o.key} onClick={() => pick(o.key)} title={`${o.groupLabel ? `${o.groupLabel} : ` : ''}${o.label}`}
                          sub={[`${o.roll[0]}-${o.roll[1]}`, charList(o.fixed)].filter(Boolean).join(' · ')} />
                ))}
            </div>
            {origin?.choice?.length > 0 && (
                <Field label="+5 à une caractéristique au choix">
                    <Pills>{origin.choice.map(k => <Pill key={k} on={ws.originChoice === k} onClick={() => set({ originChoice: k })}>{CHAR_SHORT[k]}</Pill>)}</Pills>
                </Field>
            )}
            {origin?.choiceSkills?.length > 0 && (
                <Field label="Compétence (une Avance)">
                    <Pills>{origin.choiceSkills.map(k => <Pill key={k} on={ws.originSkill === k} onClick={() => set({ originSkill: k })}>{advLabel(k)}</Pill>)}</Pills>
                </Field>
            )}
            {ws.originRandom && <p className="im-note">Tirée au hasard : +{XP_RANDOM.origin} XP (choisir une autre origine annule ce bonus).</p>}
        </div>
    );
};

// ── Faction ──────────────────────────────────────────────────────────────────

const BENEFIT_RESET = { benefitChoice: null, benefitAdvances: {}, benefitTalent: null, benefitEquipment: {} };

export const FactionTab = ({ ws, setWs, help }) => {
    const set = (p) => setWs(prev => ({ ...prev, ...p }));
    const faction = FACTION_BY_KEY[ws.factionKey];
    const b = faction?.benefits ?? {};
    const pick = (key, random = false) => { set({ factionKey: key, dutyKey: null, factionRandom: random, ...BENEFIT_RESET }); help({ kind: 'faction', key }); };
    const advances = ws.benefitAdvances ?? {};
    const spent = Object.values(advances).reduce((s, v) => s + v, 0);
    return (
        <div className="im-fields">
            <Pills>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => pick(factionForRoll(d100()), true)}>Laisser le destin décider (+{XP_RANDOM.faction} XP)</button>
            </Pills>
            <div className="im-card-grid">
                {FACTIONS.map(f => <Card key={f.key} on={ws.factionKey === f.key} onClick={() => pick(f.key)} title={f.label} sub={f.source === 'ipg' ? 'Inquisition' : null} />)}
            </div>
            {faction && (
                <>
                    <Toggle on={ws.useDuty} onChange={v => set({ useDuty: v, dutyKey: null, ...BENEFIT_RESET })}>Prendre une Fonction (paquet prêt à l'emploi)</Toggle>
                    {ws.useDuty ? (
                        <div className="im-card-grid">
                            {faction.duties.map(d => (
                                <Card key={d.key} on={ws.dutyKey === d.key} onClick={() => { set({ dutyKey: d.key }); help({ kind: 'duty', faction: faction.key, key: d.key }); }}
                                      title={d.label} sub={`${charList(d.chars)} · ${d.solars} Solars`} />
                            ))}
                        </div>
                    ) : (
                        <>
                            <Field label={`Caractéristiques : ${charList(b.fixed)}, +5 au choix`}>
                                <Pills>{(b.choice ?? []).map(k => <Pill key={k} on={ws.benefitChoice === k} onClick={() => set({ benefitChoice: k })}>{CHAR_SHORT[k]}</Pill>)}</Pills>
                            </Field>
                            <Field label={`${b.advances ?? 5} Avances à répartir (${spent} placées, 2 au plus par compétence)`}>
                                <div className="im-edit-skills">
                                    {(b.skills ?? []).map(k => (
                                        <div key={k} className="im-edit-skill">
                                            <span>{advLabel(k)}</span>
                                            <Stepper value={advances[k] ?? 0} min={0} max={Math.min(2, (advances[k] ?? 0) + (b.advances ?? 5) - spent)}
                                                     onChange={v => set({ benefitAdvances: { ...advances, [k]: v } })} />
                                        </div>
                                    ))}
                                </div>
                            </Field>
                            {b.talentChoice?.length > 0 && (
                                <Field label="Talent">
                                    <Pills>{b.talentChoice.flat().map(k => <Pill key={k} on={ws.benefitTalent === k} onClick={() => { set({ benefitTalent: k }); help({ kind: 'talent', key: k }); }}>{TALENT_BY_KEY[k]?.label ?? k}</Pill>)}</Pills>
                                </Field>
                            )}
                            {(b.equipmentChoices ?? []).map((opts, i) => Array.isArray(opts) && (
                                <Field key={i} label="Objet au choix">
                                    <Pills>{opts.map(o => <Pill key={o} on={ws.benefitEquipment?.[i] === o} onClick={() => set({ benefitEquipment: { ...ws.benefitEquipment, [i]: o } })}>{o}</Pill>)}</Pills>
                                </Field>
                            ))}
                        </>
                    )}
                </>
            )}
            {ws.factionRandom && <p className="im-note">Tirée au hasard : +{XP_RANDOM.faction} XP.</p>}
        </div>
    );
};

// ── Rôle ─────────────────────────────────────────────────────────────────────

const ROLE_RESET = { roleTalents: [], roleSkills: {}, roleSpecs: [], roleEquipment: {}, powers: [] };

/** Pouvoirs d'une discipline : choix de la discipline, puis de ses pouvoirs (pas de mur de pills) */
const DISCIPLINES = (SKILLS.find(s => s.key === 'psychic_mastery')?.specs ?? []).filter(s => !s.various);
const DisciplinePicker = ({ powers, chosen, onPick }) => {
    const current = powers.find(p => chosen.includes(p.key))?.discipline;
    const [open, setOpen] = useState(current ?? DISCIPLINES[0]?.key);
    return (
        <>
            <Pills>{DISCIPLINES.map(d => <Pill key={d.key} on={open === d.key} onClick={() => setOpen(d.key)}>{d.label}{current === d.key ? ' ✓' : ''}</Pill>)}</Pills>
            <Pills>{powers.filter(p => p.discipline === open).map(p => <Pill key={p.key} on={chosen.includes(p.key)} onClick={() => onPick(p)}>{p.label}</Pill>)}</Pills>
        </>
    );
};

export const RoleTab = ({ ws, setWs, help }) => {
    const set = (p) => setWs(prev => ({ ...prev, ...p }));
    const role = ROLE_BY_KEY[ws.roleKey];
    const pick = (key, random = false) => { set({ roleKey: key, roleRandom: random, ...ROLE_RESET }); help({ kind: 'role', key }); };
    const toggle = (list, key, max) => (list.includes(key) ? list.filter(k => k !== key) : list.length < max ? [...list, key] : list);
    const skills = ws.roleSkills ?? {};
    const spent = Object.values(skills).reduce((s, v) => s + v, 0);
    const fromFaction = factionAdvances(ws);
    const specKeys = role ? [...role.specAdvances.fromSkills.flatMap(s => (SKILL_BY_KEY[s]?.specs ?? []).filter(sp => !sp.various && !sp.restricted).map(sp => `${s}.${sp.key}`)), ...(role.specAdvances.extra ?? [])] : [];
    const psyker = isPsyker(ws);
    const { minor, discipline } = powerChoices();
    const powers = ws.powers ?? [];
    const pickPower = (p) => {
        const others = powers.filter(k => (p.discipline === 'minor' ? !minor.some(m => m.key === k) : !discipline.some(m => m.key === k)));
        set({ powers: [...others, p.key] });
        help({ kind: 'power', power: p });
    };
    return (
        <div className="im-fields">
            <Pills>
                <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => pick(ROLES[Math.floor(Math.random() * ROLES.length)].key, true)}>Laisser le Patron choisir (+{XP_RANDOM.role} XP)</button>
            </Pills>
            <div className="im-card-grid">
                {ROLES.map(r => <Card key={r.key} on={ws.roleKey === r.key} onClick={() => pick(r.key)} title={r.label} sub={r.source === 'ipg' ? 'Inquisition' : null} />)}
            </div>
            {role && (
                <>
                    <Field label={`Talents : ${role.talents.pick} au choix (${(ws.roleTalents ?? []).length})`}>
                        <Pills>{role.talents.from.map(k => (
                            <Pill key={k} on={ws.roleTalents.includes(k)} onClick={() => { set({ roleTalents: toggle(ws.roleTalents, k, role.talents.pick) }); help({ kind: 'talent', key: k }); }}>{TALENT_BY_KEY[k]?.label ?? k}</Pill>
                        ))}</Pills>
                    </Field>
                    <Field label={`${role.skillAdvances.pick} Avances de compétence (${spent} placées)`}>
                        <div className="im-edit-skills">
                            {role.skillAdvances.from.map(k => (
                                <div key={k} className="im-edit-skill">
                                    <span>{advLabel(k)}{fromFaction[k] ? <small> (faction {fromFaction[k]})</small> : null}</span>
                                    <Stepper value={skills[k] ?? 0} min={0} max={Math.min(2 - (fromFaction[k] ?? 0), (skills[k] ?? 0) + role.skillAdvances.pick - spent)}
                                             onChange={v => set({ roleSkills: { ...skills, [k]: v } })} />
                                </div>
                            ))}
                        </div>
                    </Field>
                    <Field label={`${role.specAdvances.pick} spécialisations différentes (${(ws.roleSpecs ?? []).length})`}>
                        <Pills>{specKeys.map(k => (
                            <Pill key={k} on={ws.roleSpecs.includes(k)} onClick={() => set({ roleSpecs: toggle(ws.roleSpecs, k, role.specAdvances.pick) })}>{advLabel(k)}</Pill>
                        ))}</Pills>
                    </Field>
                    {psyker && (
                        <>
                            <Field label="Pouvoir mineur (en plus de Châtiment)">
                                <Pills>{minor.map(p => <Pill key={p.key} on={powers.includes(p.key)} onClick={() => pickPower(p)}>{p.label}</Pill>)}</Pills>
                            </Field>
                            <Field label="Pouvoir d'une discipline">
                                <DisciplinePicker powers={discipline} chosen={powers} onPick={pickPower} />
                            </Field>
                        </>
                    )}
                </>
            )}
            {ws.roleRandom && <p className="im-note">Choisi par le Patron : +{XP_RANDOM.role} XP.</p>}
        </div>
    );
};

// ── Équipement ───────────────────────────────────────────────────────────────

export const EquipmentTab = ({ ws, setWs }) => {
    const set = (p) => setWs(prev => ({ ...prev, ...p }));
    const role = ROLE_BY_KEY[ws.roleKey];
    const choose = (i, value, many) => {
        const cur = ws.roleEquipment?.[i];
        const next = many ? ([].concat(cur ?? []).includes(value) ? [].concat(cur).filter(v => v !== value) : [...[].concat(cur ?? []), value].slice(-many)) : value;
        set({ roleEquipment: { ...ws.roleEquipment, [i]: next } });
    };
    return (
        <div className="im-fields">
            {(role?.equipmentChoices ?? []).map((opts, i) => {
                const list = Array.isArray(opts) ? opts : opts.from;
                const many = Array.isArray(opts) ? 0 : opts.pick;
                const cur = [].concat(ws.roleEquipment?.[i] ?? []);
                return (
                    <Field key={i} label={many ? `Rôle : ${many} objets au choix` : 'Rôle : un objet au choix'}>
                        <Pills>{list.map(o => <Pill key={o} on={cur.includes(o)} onClick={() => choose(i, o, many)}>{o}</Pill>)}</Pills>
                    </Field>
                );
            })}
            <Field label="Équipement de départ">
                <ul className="im-list">{equipmentLabels(ws).map((l, i) => <li key={`${l}-${i}`}>{l}</li>)}</ul>
            </Field>
            <p className="im-note">{startingSolars(ws)} Solars de départ. Les achats (objets Courants, un seul Peu courant) se font depuis l'inventaire de la fiche.</p>
        </div>
    );
};

// ── Identité ─────────────────────────────────────────────────────────────────

export const IdentityTab = ({ ws, setWs }) => {
    const set = (p) => setWs(prev => ({ ...prev, ...p }));
    const T = ({ k, label, area }) => (
        <label className="block"><span className="vtt-field-label">{label}</span>
            {area ? <textarea className="vtt-input" rows={2} value={ws[k]} onChange={e => set({ [k]: e.target.value })} />
                : <input className="vtt-input" value={ws[k]} onChange={e => set({ [k]: e.target.value })} />}
        </label>
    );
    return (
        <div className="im-fields">
            <div className="im-name-fields">{T({ k: 'prenom', label: 'Prénom' })}{T({ k: 'nom', label: 'Nom' })}{T({ k: 'playerName', label: 'Joueur' })}</div>
            <div className="im-name-fields">{T({ k: 'sexe', label: 'Sexe' })}{T({ k: 'age', label: 'Âge' })}{T({ k: 'taille', label: 'Taille (cm)' })}</div>
            <Field label="Latéralité"><Pills>{[['right', 'Droitier'], ['left', 'Gaucher']].map(([k, l]) => <Pill key={k} on={ws.handedness === k} onClick={() => set({ handedness: k })}>{l}</Pill>)}</Pills></Field>
            {T({ k: 'appearance', label: 'Apparence', area: true })}
            {T({ k: 'goalShort', label: 'Objectif à court terme (+50 XP)' })}
            {T({ k: 'goalLong', label: 'Objectif à long terme (+500 XP)' })}
            {T({ k: 'connections', label: 'Connexions (un autre acolyte, le Patron)', area: true })}
            {T({ k: 'divination', label: 'Divination' })}
            {T({ k: 'notes', label: 'Notes', area: true })}
            <p className="im-note">XP gagnée à la création : <b>{creationXp(ws)}</b>, à dépenser sur la fiche (bouton « Dépenser l'XP »).</p>
        </div>
    );
};

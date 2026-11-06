// src/client/src/systems/maledictum/components/layout/MlEditForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Mode Édition (corrections hors règles, spec_maledictum.md §11.2) : identité,
// thème affiché, parcours, caractéristiques de départ et Avances, Avances de
// compétence, spécialisations, ajustements (Blessures max, Initiative,
// Encombrement, Vitesse), Destin max, XP, objectifs et détails, notes.
// Les actions de jeu (jauges, inventaire, XP dépensée…) restent hors édition.
// Props : draft, setDraft
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { SKILLS } from '../../config/skills.js';
import { CHAR_KEYS, CHAR_SHORT } from '../../config/rules/character.js';
import { THEMES, themeForFaction } from '../../config/rules/themes.js';
import { ALL_ORIGINS, FACTION_BY_KEY } from '../../config/rules/creation.js';
import { FACTIONS } from '../../config/factions.js';
import { ROLES } from '../../config/roles.js';
import { Block, Pill, Pills, Stepper, Field } from '../ui/MlUi.jsx';

const SPEEDS = [['slow', 'Lente'], ['normal', 'Normale'], ['fast', 'Rapide']];

const Text = ({ label, value, onChange, area = false }) => (
    <label className="block">
        <span className="vtt-field-label">{label}</span>
        {area
            ? <textarea className="vtt-input" rows={3} value={value ?? ''} onChange={e => onChange(e.target.value)} />
            : <input className="vtt-input" value={value ?? ''} onChange={e => onChange(e.target.value)} />}
    </label>
);
const Num = ({ label, value, onChange }) => (
    <label className="block">
        <span className="vtt-field-label">{label}</span>
        <input className="vtt-input" type="number" value={value ?? 0} onChange={e => onChange(Number(e.target.value) || 0)} />
    </label>
);

const MlEditForm = ({ draft, setDraft }) => {
    const set = (p) => setDraft(prev => ({ ...prev, ...p }));
    const setIn = (field, key, value) => setDraft(prev => ({ ...prev, [field]: { ...(prev[field] ?? {}), [key]: value } }));
    const faction = FACTION_BY_KEY[draft.factionKey];
    return (
        <div className="im-page im-edit">
            <div className="im-edit-grid">
                <Block title="Identité">
                    <div className="im-fields">
                        <Text label="Prénom" value={draft.prenom} onChange={v => set({ prenom: v })} />
                        <Text label="Nom" value={draft.nom} onChange={v => set({ nom: v })} />
                        <Text label="Joueur" value={draft.playerName} onChange={v => set({ playerName: v })} />
                        <Text label="Sexe" value={draft.sexe} onChange={v => set({ sexe: v })} />
                        <Num label="Âge" value={draft.age} onChange={v => set({ age: v })} />
                        <Num label="Taille (cm)" value={draft.taille} onChange={v => set({ taille: v })} />
                    </div>
                    <Field label="Thème de la fiche">
                        <Pills>
                            <Pill on={!draft.themeKey} onClick={() => set({ themeKey: '' })}>Selon le rôle de faction ({THEMES.find(t => t.key === themeForFaction(draft.factionKey, draft.dutyKey))?.label})</Pill>
                            {THEMES.map(t => <Pill key={t.key} on={draft.themeKey === t.key} onClick={() => set({ themeKey: t.key })}>{t.label}</Pill>)}
                        </Pills>
                    </Field>
                </Block>

                <Block title="Parcours">
                    <Field label="Origine"><Pills>{ALL_ORIGINS.map(o => <Pill key={o.key} on={draft.originKey === o.key} onClick={() => set({ originKey: o.key })}>{o.label}</Pill>)}</Pills></Field>
                    <Field label="Faction"><Pills>{FACTIONS.map(f => <Pill key={f.key} on={draft.factionKey === f.key} onClick={() => set({ factionKey: f.key, dutyKey: null })}>{f.label}</Pill>)}</Pills></Field>
                    {faction && (
                        <Field label="Fonction">
                            <Pills>
                                <Pill on={!draft.dutyKey} onClick={() => set({ dutyKey: null })}>Aucune (Avantages)</Pill>
                                {faction.duties.map(dt => <Pill key={dt.key} on={draft.dutyKey === dt.key} onClick={() => set({ dutyKey: dt.key })}>{dt.label}</Pill>)}
                            </Pills>
                        </Field>
                    )}
                    <Field label="Rôle"><Pills>{ROLES.map(r => <Pill key={r.key} on={draft.roleKey === r.key} onClick={() => set({ roleKey: r.key })}>{r.label}</Pill>)}</Pills></Field>
                </Block>

                <Block title="Caractéristiques">
                    <div className="im-edit-chars">
                        {CHAR_KEYS.map(k => (
                            <div key={k} className="im-edit-char">
                                <b>{CHAR_SHORT[k]}</b>
                                <Num label="Départ" value={draft.charsBase?.[k]} onChange={v => setIn('charsBase', k, v)} />
                                <Num label="Avances" value={draft.charsAdv?.[k]} onChange={v => setIn('charsAdv', k, v)} />
                            </div>
                        ))}
                    </div>
                </Block>

                <Block title="Compétences et spécialisations">
                    <div className="im-edit-skills">
                        {SKILLS.map(s => (
                            <div key={s.key} className="im-edit-skill">
                                <span>{s.label}</span>
                                <Stepper value={draft.skills?.[s.key] ?? 0} onChange={v => setIn('skills', s.key, v)} min={0} max={4} />
                            </div>
                        ))}
                    </div>
                    <div className="im-sub">Spécialisations</div>
                    {(draft.specs ?? []).map((sp, i) => (
                        <div key={`${sp.skill}-${sp.key}-${i}`} className="im-edit-skill">
                            <span>{SKILLS.find(s => s.key === sp.skill)?.label} ({sp.label})</span>
                            <Stepper value={sp.adv} onChange={v => set({ specs: draft.specs.map((x, j) => (j === i ? { ...x, adv: v } : x)).filter(x => x.adv > 0) })} min={0} max={4} />
                        </div>
                    ))}
                </Block>

                <Block title="Ajustements">
                    <div className="im-fields">
                        <Num label="Blessures max (±)" value={draft.bonuses?.maxWounds} onChange={v => setIn('bonuses', 'maxWounds', v)} />
                        <Num label="Initiative (±)" value={draft.bonuses?.initiative} onChange={v => setIn('bonuses', 'initiative', v)} />
                        <Num label="Encombrement max (±)" value={draft.bonuses?.encumbrance} onChange={v => setIn('bonuses', 'encumbrance', v)} />
                        <Num label="Destin maximum" value={draft.fateMax} onChange={v => set({ fateMax: v })} />
                        <Num label="XP gagnée" value={draft.xpTotal} onChange={v => set({ xpTotal: v })} />
                        <Num label="XP dépensée" value={draft.xpSpent} onChange={v => set({ xpSpent: v })} />
                    </div>
                    <Field label="Vitesse"><Pills>{SPEEDS.map(([k, l]) => <Pill key={k} on={(draft.bonuses?.speed ?? 'normal') === k} onClick={() => setIn('bonuses', 'speed', k)}>{l}</Pill>)}</Pills></Field>
                </Block>

                <Block title="Objectifs et détails">
                    <Text label="Objectif à court terme" value={draft.goals?.short} onChange={v => setIn('goals', 'short', v)} />
                    <Text label="Objectif à long terme" value={draft.goals?.long} onChange={v => setIn('goals', 'long', v)} />
                    <Text label="Apparence" value={draft.details?.appearance} onChange={v => setIn('details', 'appearance', v)} area />
                    <Text label="Connexions" value={draft.details?.connections} onChange={v => setIn('details', 'connections', v)} area />
                    <Text label="Divination" value={draft.details?.divination} onChange={v => setIn('details', 'divination', v)} />
                    <Field label="Latéralité"><Pills>{[['right', 'Droitier'], ['left', 'Gaucher']].map(([k, l]) => <Pill key={k} on={(draft.details?.handedness ?? 'right') === k} onClick={() => setIn('details', 'handedness', k)}>{l}</Pill>)}</Pills></Field>
                    <Text label="Notes" value={draft.notes} onChange={v => set({ notes: v })} area />
                </Block>
            </div>
        </div>
    );
};

export default MlEditForm;

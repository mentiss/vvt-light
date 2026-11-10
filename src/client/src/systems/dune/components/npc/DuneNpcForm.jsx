// src/client/src/systems/dune/components/npc/DuneNpcForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaire de la partie système d'un PNJ de Dune (spec_pnj.md §7, D-1 à D-4),
// posé par la brique NpcForm (props { value, onChange, isNew }) :
// rang (à la création, il préremplit le barème du livre ; ensuite, bouton « Appliquer »),
// compétences et spécialisations,
// principes et maximes (mineur : une valeur unique), traits, talents, atouts,
// jets préparés (brique NpcPresetEditor).
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { NpcPresetEditor } from '../../../../components/npc/NpcPresets.jsx';
import NpcItemList from '../../../../components/npc/NpcItemList.jsx';
import { COMPETENCES, PRINCIPES } from '../../config/traits.js';
import { NPC_RANKS, applyRankTemplate, isMinor } from '../../config/rules/npc.js';

const num = (v, min, max) => Math.max(min, Math.min(max, Number(v) || 0));
const splitList = (text) => text.split(',').map(s => s.trim()).filter(Boolean);


const DuneNpcForm = ({ value, onChange, isNew = false }) => {
    const sd = value;
    const minor = isMinor(sd);
    const set = (patch) => onChange({ ...sd, ...patch });
    const setTrait = (group, key, patch) => set({ [group]: (sd[group] ?? []).map(x => (x.key === key ? { ...x, ...patch } : x)) });
    const find = (group, key) => sd[group]?.find(x => x.key === key) ?? { key, rang: 0 };

    // Choix d'une compétence (et d'un principe) pour un jet préparé
    const renderPicker = (preset, update) => (
        <>
            <div className="dn-npc-picker">
                <span>Compétence</span>
                {COMPETENCES.map(c => (
                    <button key={c.key} type="button" className={`vtt-pill${preset.pick?.competences === c.key ? ' is-selected' : ''}`}
                            onClick={() => update({ pick: { ...preset.pick, competences: c.key } })}>{c.label}</button>
                ))}
            </div>
            {!minor && (
                <div className="dn-npc-picker">
                    <span>Principe</span>
                    {PRINCIPES.map(p => (
                        <button key={p.key} type="button" className={`vtt-pill${preset.pick?.principes === p.key ? ' is-selected' : ''}`}
                                onClick={() => update({ pick: { ...preset.pick, principes: p.key } })}>{p.label}</button>
                    ))}
                </div>
            )}
        </>
    );

    return (
        <div className="dn-npc-form">
            <div className="dn-npc-sub">Rang</div>
            <div className="dn-npc-line">
                <div className="vtt-segmented">
                    {NPC_RANKS.map(r => (
                        <button key={r.key} type="button" className={`vtt-segment${(sd.rank ?? 'notable') === r.key ? ' is-active' : ''}`}
                                // D-1 : à la création, le rang préremplit le barème ; sur une fiche existante, il ne touche pas aux valeurs
                                onClick={() => (isNew ? onChange(applyRankTemplate(sd, r.key)) : set({ rank: r.key }))}>{r.label}</button>
                    ))}
                </div>
                <button type="button" className="vtt-btn vtt-btn-sm" title="Remplace les valeurs par le barème du livre (p.328) ; spécialisations et maximes gardées"
                        onClick={() => onChange(applyRankTemplate(sd, sd.rank ?? 'notable'))}>Appliquer le barème du rang</button>
            </div>

            <div className="dn-npc-sub">Compétences : rang et spécialisations</div>
            {COMPETENCES.map(c => {
                const item = find('competences', c.key);
                return (
                    <div key={c.key} className="dn-npc-form-row">
                        <b>{c.label}</b>
                        <input className="vtt-input dn-npc-num" type="number" min="1" max="12" value={item.rang} aria-label={`${c.label} : rang`}
                               onChange={e => setTrait('competences', c.key, { rang: num(e.target.value, 0, 12) })} />
                        <input className="vtt-input" placeholder="Spécialisations, séparées par des virgules" aria-label={`${c.label} : spécialisations`}
                               defaultValue={(item.specialisations ?? []).join(', ')}
                               onBlur={e => setTrait('competences', c.key, { specialisations: splitList(e.target.value) })} />
                    </div>
                );
            })}

            {minor ? (
                <>
                    <div className="dn-npc-sub">Principe : valeur unique du mineur (4 à 8)</div>
                    <input className="vtt-input dn-npc-num" type="number" min="4" max="8" value={sd.drive ?? 5} aria-label="Principe"
                           onChange={e => set({ drive: num(e.target.value, 1, 8) })} />
                </>
            ) : (
                <>
                    <div className="dn-npc-sub">Principes : rang et maxime</div>
                    {PRINCIPES.map(p => {
                        const item = find('principes', p.key);
                        return (
                            <div key={p.key} className="dn-npc-form-row">
                                <b>{p.label}</b>
                                <input className="vtt-input dn-npc-num" type="number" min="1" max="8" value={item.rang} aria-label={`${p.label} : rang`}
                                       onChange={e => setTrait('principes', p.key, { rang: num(e.target.value, 0, 8) })} />
                                <input className="vtt-input" placeholder="Maxime (facultatif)" value={item.maxime ?? ''} aria-label={`${p.label} : maxime`}
                                       onChange={e => setTrait('principes', p.key, { maxime: e.target.value })} />
                            </div>
                        );
                    })}
                </>
            )}

            <div className="dn-npc-sub">Traits</div>
            <input className="vtt-input" placeholder="Rôle, réputation, faction : séparés par des virgules" aria-label="Traits"
                   defaultValue={(sd.traits ?? []).join(', ')} onBlur={e => set({ traits: splitList(e.target.value) })} />

            <div className="dn-npc-sub">Talents</div>
            <NpcItemList items={sd.talents ?? []} onChange={talents => set({ talents })} addLabel="+ Talent"
                      newItem={() => ({ name: '', text: '' })}
                      fields={[{ key: 'name', placeholder: 'Nom du talent' }, { key: 'text', placeholder: 'Effet (en Menace pour un PNJ)', multiline: true }]} />

            <div className="dn-npc-sub">Atouts</div>
            <NpcItemList items={sd.atouts ?? []} onChange={atouts => set({ atouts })} addLabel="+ Atout"
                      newItem={() => ({ name: '', quality: null })}
                      fields={[{ key: 'name', placeholder: 'Lasgun, Bouclier…' }, { key: 'quality', placeholder: 'Qualité', type: 'number', narrow: true }]} />

            <div className="dn-npc-sub">Jets préparés</div>
            <NpcPresetEditor presets={sd.rolls ?? []} onChange={rolls => set({ rolls })} renderPicker={renderPicker}
                             newPreset={() => ({ label: '', pick: minor ? { competences: 'combat' } : { competences: 'combat', principes: 'devoir' } })} />
        </div>
    );
};

export default DuneNpcForm;

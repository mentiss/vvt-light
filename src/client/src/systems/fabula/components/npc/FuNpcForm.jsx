// src/client/src/systems/fabula/components/npc/FuNpcForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaire de la partie système d'un PNJ de Fabula Ultima (spec_pnj.md §10.5), posé par la
// brique NpcForm (props { value, onChange }) : niveau, espèce, rang (Champion : N choisi par le MJ,
// F-3), Méchant, traits, dés d'attributs, PV, Crise, PM, initiative, DEF, DEF M. (saisis tels que le
// livre les imprime, F-4), affinités, attaques, sorts (offensif : jet comme une attaque, §12), capacités.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import NpcItemList from '@/features/npc/NpcItemList.jsx';
import FuDie from '../ui/FuDie.jsx';
import { TYPES_DEGATS } from '../../config/equipment.js';
import { AFFINITIES, ATTR_KEYS, RANKS, SPECIES, VILLAINS, spellRoll } from '../../config/npc.js';

const SHORT = { dex: 'DEX', int: 'INT', pui: 'PUI', vol: 'VOL' };
const SIZES = [6, 8, 10, 12];
const TYPE_OPTIONS = Object.fromEntries(TYPES_DEGATS.map(t => [t.key, t.label]));
const num = (v) => (v === '' ? null : Number(v));
const split = (text) => String(text ?? '').split(',').map(s => s.trim()).filter(Boolean);

const Pills = ({ options, value, onChange, allowNone = false }) => (
    <div className="fu-npc-pills">
        {Object.entries(options).map(([k, l]) => (
            <button key={k} type="button" className={`fu-pill${value === k ? ' is-on' : ''}`} onClick={() => onChange(allowNone && value === k ? null : k)}>{l}</button>
        ))}
    </div>
);

const NumField = ({ label, value, onChange }) => (
    <label className="fu-npc-field">
        <span className="vtt-field-label">{label}</span>
        <input className="vtt-input" type="number" min="0" value={value ?? ''} onChange={e => onChange(num(e.target.value))} />
    </label>
);

// Attaques : lignes { name, a1, a2, precision, damage, type, reach, text } ↔ { name, attrs, precision, damage, type, ranged, text }
const toRows = (attacks) => (attacks ?? []).map(a => ({ ...a, a1: a.attrs?.[0] ?? 'dex', a2: a.attrs?.[1] ?? 'pui', reach: a.ranged ? 'ranged' : 'melee' }));
const fromRows = (rows) => rows.map(({ a1, a2, reach, ...a }) => ({ ...a, attrs: [a1, a2].filter(Boolean), ranged: reach === 'ranged' }));

// Sorts (spec_pnj.md §12) : lignes { …, kind: 'off'|'def', a1, a2, magic, damage, type } ↔ { …, offensive, attrs, magic, damage, type }.
// Un sort du bestiaire sans champs de jet les reçoit lus dans son texte (spellRoll) ; un sort défensif n'en garde aucun.
const toSpellRows = (spells) => (spells ?? []).map(s => {
    const r = spellRoll(s);
    return { ...s, kind: s.offensive ? 'off' : 'def', a1: r?.attrs[0] ?? 'int', a2: r?.attrs[1] ?? 'vol',
             magic: r?.bonus ?? 0, damage: r ? r.damage : null, type: r?.type ?? null };
});
const fromSpellRows = (rows) => rows.map(({ kind, a1, a2, magic, damage, type, ...s }) => (kind === 'off'
    ? { ...s, offensive: true, attrs: [a1 ?? 'int', a2 ?? 'vol'], magic: magic ?? 0, damage: damage ?? null, type: type ?? null }
    : { ...s, offensive: false, attrs: undefined }));   // undefined : attributs d'un ancien jet retirés à l'enregistrement (JSON)
const isOffensive = (row) => row.kind === 'off';

const FuNpcForm = ({ value, onChange }) => {
    const sd = value;
    const set = (patch) => onChange({ ...sd, ...patch });
    // Traits : texte saisi gardé ici (une virgule sépare), formulaire remonté par fiche
    const [traits, setTraits] = useState(() => (sd.traits ?? []).join(', '));
    const setAffinity = (type, v) => {
        const next = { ...(sd.affinities ?? {}) };
        if (v) next[type] = v; else delete next[type];
        set({ affinities: next });
    };

    return (
        <div className="fu-npc-form">
            <div className="fu-npc-values">
                <NumField label="Niveau" value={sd.level} onChange={v => set({ level: v })} />
                {/* Crise : la moitié des PV, recalculée quand les PV changent (le seuil reste modifiable ensuite) */}
                <NumField label="PV" value={sd.hp} onChange={v => set({ hp: v, crisis: v == null ? null : Math.floor(v / 2) })} />
                <NumField label="Crise" value={sd.crisis} onChange={v => set({ crisis: v })} />
                <NumField label="PM" value={sd.mp} onChange={v => set({ mp: v })} />
                <NumField label="Initiative" value={sd.init} onChange={v => set({ init: v })} />
                <NumField label="DEF" value={sd.def} onChange={v => set({ def: v })} />
                <NumField label="DEF M." value={sd.mdef} onChange={v => set({ mdef: v })} />
            </div>
            <span className="vtt-field-label">Espèce</span>
            <Pills options={Object.fromEntries(SPECIES.map(s => [s, s]))} value={sd.species} onChange={v => set({ species: v })} />
            <span className="vtt-field-label">Rang</span>
            <div className="fu-npc-values">
                <Pills options={RANKS} value={sd.rank} onChange={v => set({ rank: v, champion: v === 'champion' ? (sd.champion ?? 2) : null })} />
                {sd.rank === 'champion' && <NumField label="Champion (N)" value={sd.champion} onChange={v => set({ champion: v })} />}
            </div>
            <span className="vtt-field-label">Méchant</span>
            <Pills options={Object.fromEntries(Object.entries(VILLAINS).map(([k, v]) => [k, v.label]))} value={sd.villain} allowNone onChange={v => set({ villain: v })} />

            <span className="vtt-field-label">Dés d'attributs</span>
            <div className="fu-npc-values">
                {ATTR_KEYS.map(k => (
                    <div key={k} className="fu-npc-field">
                        <span className="fu-label">{SHORT[k]}</span>
                        <div className="fu-npc-pills">
                            {SIZES.map(s => (
                                <button key={s} type="button" className={`fu-npc-die${Number(sd.attributes?.[k] ?? 8) === s ? ' is-on' : ''}`}
                                        onClick={() => set({ attributes: { ...(sd.attributes ?? {}), [k]: s } })} aria-label={`${SHORT[k]} d${s}`}>
                                    <FuDie size={s} small />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <label className="fu-npc-field is-wide">
                <span className="vtt-field-label">Traits (séparés par des virgules)</span>
                <input className="vtt-input" value={traits} onChange={e => { setTraits(e.target.value); set({ traits: split(e.target.value) }); }} />
            </label>

            <span className="vtt-field-label">Affinités</span>
            <div className="fu-npc-affinities">
                {TYPES_DEGATS.map(t => (
                    <div key={t.key} className="fu-npc-aff-row">
                        <span className="fu-label">{t.label}</span>
                        <Pills options={Object.fromEntries(Object.keys(AFFINITIES).map(a => [a, a]))} value={sd.affinities?.[t.key] ?? null} allowNone
                               onChange={v => setAffinity(t.key, v)} />
                    </div>
                ))}
            </div>

            <span className="vtt-field-label">Attaques</span>
            <NpcItemList items={toRows(sd.attacks)} onChange={rows => set({ attacks: fromRows(rows) })} addLabel="+ Attaque"
                         newItem={() => ({ name: '', a1: 'dex', a2: 'pui', precision: 0, damage: 5, type: 'physique', reach: 'melee', text: '' })}
                         fields={[{ key: 'name', placeholder: 'Attaque' }, { key: 'precision', placeholder: 'Précision', type: 'number', narrow: true },
                                  { key: 'damage', placeholder: 'VH +', type: 'number', narrow: true },
                                  { key: 'a1', options: SHORT }, { key: 'a2', options: SHORT }, { key: 'reach', options: { melee: 'Contact', ranged: 'Distance' } },
                                  { key: 'type', options: TYPE_OPTIONS }, { key: 'text', placeholder: 'Effet', multiline: true }]} />
            <span className="vtt-field-label">Sorts</span>
            <NpcItemList items={toSpellRows(sd.spells)} onChange={rows => set({ spells: fromSpellRows(rows) })} addLabel="+ Sort"
                         newItem={() => ({ name: '', cost: '', target: '', duration: '', kind: 'def', a1: 'int', a2: 'vol', magic: 0, damage: null, type: null, text: '' })}
                         fields={[{ key: 'name', placeholder: 'Sort' }, { key: 'cost', placeholder: 'Coût', narrow: true }, { key: 'target', placeholder: 'Cible' },
                                  { key: 'duration', placeholder: 'Durée' },
                                  { key: 'magic', placeholder: 'Bonus', type: 'number', narrow: true, emptyValue: 0, when: isOffensive },
                                  { key: 'damage', placeholder: 'VH +', type: 'number', narrow: true, when: isOffensive },
                                  { key: 'kind', options: { off: 'Offensif', def: 'Défensif' } },
                                  { key: 'a1', options: SHORT, when: isOffensive }, { key: 'a2', options: SHORT, when: isOffensive },
                                  { key: 'type', options: TYPE_OPTIONS, when: isOffensive }, { key: 'text', placeholder: 'Effet', multiline: true }]} />
            <span className="vtt-field-label">Capacités</span>
            <NpcItemList items={sd.abilities ?? []} onChange={abilities => set({ abilities })} addLabel="+ Capacité"
                         newItem={() => ({ name: '', text: '' })}
                         fields={[{ key: 'name', placeholder: 'Capacité' }, { key: 'text', placeholder: 'Effet', multiline: true }]} />
        </div>
    );
};

export default FuNpcForm;

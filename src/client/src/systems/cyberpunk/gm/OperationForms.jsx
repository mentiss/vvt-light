// src/client/src/systems/cyberpunk/gm/OperationForms.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaires de l'onglet Opération (spec_cyberpunk.md §6) : horloge et menace.
// Mêmes champs qu'avant la refonte ; choix en pilules (pas de <select>).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import IconPicker, { IconPreview, DEFAULT_CLOCK_PRESETS, DEFAULT_THREAT_PRESETS, iconValue } from './IconPicker.jsx';

export const THREAT_TYPES = ['Corporation', 'Gang', 'Individu', 'IA', 'Lieu', 'Autre'];
export const THREAT_STATUS = [
    { id: 'active',      label: 'Active'      },
    { id: 'dormante',    label: 'Dormante'    },
    { id: 'neutralisée', label: 'Neutralisée' },
];
const SCOPES = [{ id: 'session', label: 'Cette table' }, { id: 'slug', label: 'Campagne' }];

const Seg = ({ options, value, onChange }) => (
    <div className="cp-seg">
        {options.map(o => (
            <button key={o.id} type="button" className={value === o.id ? 'is-on' : ''} onClick={() => onChange(o.id)}>{o.label}</button>
        ))}
    </div>
);

const Stepper = ({ value, onChange, min = 2, max = 12 }) => (
    <span className="cp-stepper">
        <button type="button" className="cp-step" onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <b className="cp-qty">{value}</b>
        <button type="button" className="cp-step" onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </span>
);

const Toggles = ({ items, selected, onToggle, render }) => (
    <div className="cp-toggles">
        {items.map(it => (
            <button key={it.id} type="button" className={`cp-toggle ${selected.includes(it.id) ? 'is-on' : ''}`} onClick={() => onToggle(it.id)}>
                {render(it)}
            </button>
        ))}
    </div>
);

const toggleIn = (list, id) => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
const scopeOf = (initial) => (initial && initial.sessionId === null ? 'slug' : 'session');

// ── Horloge ──────────────────────────────────────────────────────────────────
export const ClockForm = ({ initial, threats, onSave, onCancel }) => {
    const [name, setName] = useState(initial?.name ?? '');
    const [segments, setSegments] = useState(initial?.segments ?? 6);
    const [consequence, setConsequence] = useState(initial?.consequence ?? '');
    const [threatIds, setThreatIds] = useState(initial?.threatIds ?? []);
    const [icon, setIcon] = useState(initial?.icon || iconValue('clock'));
    const [scope, setScope] = useState(scopeOf(initial));

    return (
        <div className="cp-panel cp-form">
            <div className="cp-panel-head"><h3 className="cp-panel-title">{initial ? 'Modifier l\'horloge' : 'Nouvelle horloge'}</h3><span className="cp-panel-rule" /></div>
            <div className="cp-form-row">
                <label className="cp-field flex-1"><span className="cp-field-label">Nom *</span>
                    <input className="cp-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex. : Plan Blackout" autoFocus /></label>
                <div className="cp-field"><span className="cp-field-label">Segments</span><Stepper value={segments} onChange={setSegments} /></div>
            </div>
            <label className="cp-field"><span className="cp-field-label">Conséquence une fois pleine</span>
                <input className="cp-input" value={consequence} onChange={e => setConsequence(e.target.value)} placeholder="Ce qui arrive quand l'horloge est pleine…" /></label>
            {/* Portée modifiable à la création seulement : la route ne la change pas ensuite */}
            {!initial && <div className="cp-field"><span className="cp-field-label">Portée</span><Seg options={SCOPES} value={scope} onChange={setScope} /></div>}
            {threats.length > 0 && (
                <div className="cp-field"><span className="cp-field-label">Menaces liées</span>
                    <Toggles items={threats} selected={threatIds} onToggle={id => setThreatIds(l => toggleIn(l, id))}
                             render={t => <><IconPreview value={t.icon} size="sm" />{t.name}</>} /></div>
            )}
            <IconPicker value={icon} onChange={setIcon} presets={DEFAULT_CLOCK_PRESETS} label="Icône" />
            <div className="cp-form-foot">
                <button type="button" className="cp-btn is-ghost" onClick={onCancel}>Annuler</button>
                <button type="button" className="cp-btn is-primary" disabled={!name.trim()}
                        onClick={() => onSave({ name: name.trim(), segments, consequence, icon, threatIds, scope })}>Enregistrer</button>
            </div>
        </div>
    );
};

// ── Menace ───────────────────────────────────────────────────────────────────
export const ThreatForm = ({ initial, clocks, onSave, onCancel, onCreateClock }) => {
    const [name, setName] = useState(initial?.name ?? '');
    const [type, setType] = useState(initial?.type ?? '');
    const [impulse, setImpulse] = useState(initial?.impulse ?? '');
    const [moves, setMoves] = useState((initial?.moves ?? []).join('\n'));
    const [notes, setNotes] = useState(initial?.notes ?? '');
    const [icon, setIcon] = useState(initial?.icon || iconValue('threat'));
    const [status, setStatus] = useState(initial?.status ?? 'active');
    const [clockIds, setClockIds] = useState(initial?.clockIds ?? []);
    const [scope, setScope] = useState(scopeOf(initial));
    const [newClock, setNewClock] = useState(null);   // { name, segments } en cours de saisie

    const createClock = async () => {
        if (!newClock?.name.trim()) return;
        const created = await onCreateClock({ name: newClock.name.trim(), segments: newClock.segments, scope });
        if (created) setClockIds(l => [...l, created.id]);
        setNewClock(null);
    };

    return (
        <div className="cp-panel cp-form">
            <div className="cp-panel-head"><h3 className="cp-panel-title">{initial ? 'Modifier la menace' : 'Nouvelle menace'}</h3><span className="cp-panel-rule" /></div>
            <label className="cp-field"><span className="cp-field-label">Nom *</span>
                <input className="cp-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex. : Arasaka" autoFocus /></label>
            <div className="cp-field"><span className="cp-field-label">Type</span>
                <Seg options={[{ id: '', label: '—' }, ...THREAT_TYPES.map(t => ({ id: t, label: t }))]} value={type} onChange={setType} /></div>
            <div className="cp-form-row">
                <div className="cp-field"><span className="cp-field-label">Statut</span><Seg options={THREAT_STATUS} value={status} onChange={setStatus} /></div>
                {/* Portée à la création seulement : la route garde celle d'origine ensuite */}
                {!initial && <div className="cp-field"><span className="cp-field-label">Portée</span><Seg options={SCOPES} value={scope} onChange={setScope} /></div>}
            </div>
            <label className="cp-field"><span className="cp-field-label">Impulsion</span>
                <input className="cp-input" value={impulse} onChange={e => setImpulse(e.target.value)} placeholder="Ce que cette menace veut, fondamentalement…" /></label>
            <label className="cp-field"><span className="cp-field-label">Moves du MC (un par ligne)</span>
                <textarea className="cp-input resize-y" rows={4} value={moves} onChange={e => setMoves(e.target.value)}
                          placeholder={'Compromettre un contact\nAvancer une horloge\nEnvoyer des renforts…'} /></label>
            <label className="cp-field"><span className="cp-field-label">Notes</span>
                <textarea className="cp-input resize-y" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes libres…" /></label>
            <div className="cp-field"><span className="cp-field-label">Horloges liées</span>
                {clocks.length > 0 && (
                    <Toggles items={clocks} selected={clockIds} onToggle={id => setClockIds(l => toggleIn(l, id))}
                             render={c => <><IconPreview value={c.icon} size="sm" />{c.name}</>} />
                )}
                {newClock ? (
                    <div className="cp-form-row">
                        <input className="cp-input flex-1" value={newClock.name} placeholder="Nom de la nouvelle horloge…" autoFocus
                               onChange={e => setNewClock(n => ({ ...n, name: e.target.value }))}
                               onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createClock(); } }} />
                        <Stepper value={newClock.segments} onChange={v => setNewClock(n => ({ ...n, segments: v }))} />
                        <button type="button" className="cp-btn is-primary is-sm" disabled={!newClock.name.trim()} onClick={createClock}>Créer</button>
                        <button type="button" className="cp-btn is-ghost is-sm" onClick={() => setNewClock(null)}>Annuler</button>
                    </div>
                ) : (
                    <button type="button" className="cp-add" onClick={() => setNewClock({ name: '', segments: 6 })}>+ Créer une horloge</button>
                )}
            </div>
            <IconPicker value={icon} onChange={setIcon} presets={DEFAULT_THREAT_PRESETS} label="Icône" />
            <div className="cp-form-foot">
                <button type="button" className="cp-btn is-ghost" onClick={onCancel}>Annuler</button>
                <button type="button" className="cp-btn is-primary" disabled={!name.trim()}
                        onClick={() => onSave({
                            name: name.trim(), type, impulse, notes, icon, status, clockIds, scope,
                            moves: moves.split('\n').map(m => m.trim()).filter(Boolean),
                        })}>Enregistrer</button>
            </div>
        </div>
    );
};

// src/client/src/systems/maledictum/gm/tabs/TabPatron.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet Patron de l'interface MJ (spec_maledictum.md §11.4) : la fiche de
// groupe de la table. Partie connue des joueurs (identité, Ordo, Philosophie,
// Attitude, Faveurs, Influence connue, notes) et partie secrète (Handicaps,
// Influence réelle, notes du MJ) ; chargement d'un des six Inquisiteurs du GMG ;
// Supériorité du groupe (visible de tous, enregistrée tout de suite) ; Subtilité
// (règle optionnelle, secrète) avec ses paliers et leurs effets.
// Props : activeSession, patronState (usePatron)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
    INQUISITORS, PHILOSOPHIES, DEMEANOURS, PAYMENT_GRADES, BOONS, LIABILITIES, PATRON_FACTIONS, SUBTLETY_LEVELS, SUBTLETY_RULES,
} from '../../config/patron.js';
import { Block, Pill, Pills, Stepper, Toggle, Field } from '../../components/ui/MlUi.jsx';
import { signed } from '../../config/rules/dice.js';

const label = (list, key) => (list ?? []).find(x => x.key === key)?.label ?? key;
const FACTION_KEYS = PATRON_FACTIONS.map(f => f.key);

/** Fiche d'un Inquisiteur du GMG → { data, secret } */
const fromInquisitor = (q) => {
    const influence = q.influence ?? {};
    return {
        data: {
            title: 'Inquisiteur', name: `${q.firstName} ${q.lastName}`, ordo: q.ordo, ordoLabel: label(PATRON_FACTIONS, q.ordo),
            philosophy: q.philosophy, philosophyLabel: label(PHILOSOPHIES, q.philosophy), demeanour: q.demeanour, demeanourLabel: label(DEMEANOURS, q.demeanour),
            paymentGrade: q.paymentGrade, boons: q.boons ?? [],
            influence: Object.fromEntries(Object.entries(influence).filter(([, v]) => v > 0)), notes: q.summary ?? '',
        },
        secret: { liabilities: q.liabilities ?? [], influence, notes: q.territory ? `Territoire : ${q.territory}` : '' },
    };
};

const Picker = ({ items, selected, onToggle, query }) => {
    const q = query.trim().toLowerCase();
    return (
        <div className="im-pick-list">
            {items.filter(i => !q || `${i.label} ${i.labelEn}`.toLowerCase().includes(q) || selected.includes(i.key)).map(i => (
                <button key={i.key} type="button" className={`im-pick${selected.includes(i.key) ? ' is-on' : ''}`} onClick={() => onToggle(i.key)} title={i.summary ?? ''}>
                    <b>{i.label}</b><small>{i.summary ?? ''}</small>
                </button>
            ))}
        </div>
    );
};

const InfluenceEditor = ({ value, onChange }) => (
    <div className="im-infl-edit">
        {FACTION_KEYS.map(f => (
            <div key={f} className="im-edit-skill">
                <span>{label(PATRON_FACTIONS, f)}</span>
                <Stepper value={value?.[f] ?? 0} min={-5} max={5} label={signed(value?.[f] ?? 0)}
                         onChange={v => { const next = { ...(value ?? {}) }; if (v) next[f] = v; else delete next[f]; onChange(next); }} />
            </div>
        ))}
    </div>
);

const TabPatron = ({ activeSession, patronState }) => {
    const { patron, save, setSuperiority, error } = patronState;
    const [edited, setDraft] = useState(null);   // null : la fiche enregistrée
    const [qBoon, setQBoon] = useState('');
    const [qLia, setQLia] = useState('');

    if (!activeSession) return <p className="im-empty im-tab-page">Aucune table active : choisissez-en une dans le menu (gestion des tables).</p>;
    if (!patron) return <p className="im-empty im-tab-page">Chargement…</p>;

    const saved = { data: patron.data ?? {}, secret: patron.secret ?? {} };
    const draft = edited ?? saved;
    const setData = (p) => setDraft(d => ({ ...(d ?? saved), data: { ...(d ?? saved).data, ...p } }));
    const setSecret = (p) => setDraft(d => ({ ...(d ?? saved), secret: { ...(d ?? saved).secret, ...p } }));
    const toggleIn = (part, field, key) => {
        const list = draft[part][field] ?? [];
        const next = list.includes(key) ? list.filter(k => k !== key) : [...list, key];
        if (part === 'data') setData({ [field]: next }); else setSecret({ [field]: next });
    };
    const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
    const level = SUBTLETY_LEVELS.find(l => patron.subtlety >= l.min && patron.subtlety <= l.max);
    const d = draft.data;

    return (
        <div className="im-tab-page im-patron-page">
            <div className="im-patron-bar">
                <span className="im-note">{dirty ? 'Modifications non enregistrées' : 'Fiche à jour'}{error ? ` · ${error}` : ''}</span>
                <button type="button" className="vtt-btn vtt-btn-sm" disabled={!dirty} onClick={() => setDraft(null)}>Annuler</button>
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" disabled={!dirty} onClick={async () => { if (await save(draft)) setDraft(null); }}>Enregistrer le Patron</button>
            </div>
            <div className="im-edit-grid">
                <Block title="Supériorité du groupe">
                    <p className="im-note">Visible de tous les joueurs : +DR sur un test par tour. Avant le combat, +3 au plus (Connaître l'ennemi, le terrain, les joueurs).</p>
                    <Stepper value={patron.superiority} onChange={setSuperiority} min={0} max={10} label={`Supériorité ${patron.superiority}`} />
                </Block>

                <Block title="Subtilité (secrète)">
                    <Toggle on={patron.subtletyEnabled} onChange={v => save({ subtletyEnabled: v })}>Règle de Subtilité utilisée à cette table</Toggle>
                    {patron.subtletyEnabled && (
                        <>
                            <Stepper value={patron.subtlety} onChange={v => save({ subtlety: v })} min={1} max={10} label={`${patron.subtlety} · ${level?.label ?? ''}`} />
                            {level && <p className="im-note"><b>{level.label}.</b> {level.summary}</p>}
                            <p className="im-note">{SUBTLETY_RULES?.summary}</p>
                        </>
                    )}
                </Block>

                <Block title="Préréglages">
                    <p className="im-note">Les six Inquisiteurs du Gamemaster's Guide, prêts à l'emploi (remplace la fiche en cours, à enregistrer).</p>
                    <Pills>{INQUISITORS.map(q => <Pill key={q.key} onClick={() => setDraft(fromInquisitor(q))}>{q.firstName} {q.lastName}</Pill>)}</Pills>
                </Block>

                <Block title="Identité (connue des joueurs)">
                    <div className="im-fields">
                        <label className="block"><span className="vtt-field-label">Titre</span><input className="vtt-input" value={d.title ?? ''} onChange={e => setData({ title: e.target.value })} /></label>
                        <label className="block"><span className="vtt-field-label">Nom</span><input className="vtt-input" value={d.name ?? ''} onChange={e => setData({ name: e.target.value })} /></label>
                    </div>
                    <Field label="Faction"><Pills>{PATRON_FACTIONS.map(f => <Pill key={f.key} on={d.ordo === f.key} onClick={() => setData({ ordo: f.key, ordoLabel: f.label })}>{f.label}</Pill>)}</Pills></Field>
                    <Field label="Philosophie"><Pills>{PHILOSOPHIES.map(p => <Pill key={p.key} on={d.philosophy === p.key} onClick={() => setData({ philosophy: p.key, philosophyLabel: p.label })} title={p.summary}>{p.label} ({p.slant === 'puritan' ? 'P' : 'R'})</Pill>)}</Pills></Field>
                    <Field label="Attitude"><Pills>{DEMEANOURS.map(p => <Pill key={p.key} on={d.demeanour === p.key} onClick={() => setData({ demeanour: p.key, demeanourLabel: p.label })} title={p.summary}>{p.label}</Pill>)}</Pills></Field>
                    <Field label="Grade de solde"><Pills>{PAYMENT_GRADES.map(p => <Pill key={p.key} on={(d.paymentGrade ?? 'standard') === p.key} onClick={() => setData({ paymentGrade: p.key })}>{p.label} ({p.perDay} / jour)</Pill>)}</Pills></Field>
                    <label className="block"><span className="vtt-field-label">Notes pour les joueurs</span><textarea className="vtt-input" rows={3} value={d.notes ?? ''} onChange={e => setData({ notes: e.target.value })} /></label>
                </Block>

                <Block title={`Faveurs (${(d.boons ?? []).length})`}>
                    <input className="vtt-input im-search" placeholder="Rechercher une Faveur…" value={qBoon} onChange={e => setQBoon(e.target.value)} />
                    <Picker items={BOONS} selected={d.boons ?? []} onToggle={k => toggleIn('data', 'boons', k)} query={qBoon} />
                </Block>

                <Block title={`Handicaps (secrets, ${(draft.secret.liabilities ?? []).length})`}>
                    <input className="vtt-input im-search" placeholder="Rechercher un Handicap…" value={qLia} onChange={e => setQLia(e.target.value)} />
                    <Picker items={LIABILITIES} selected={draft.secret.liabilities ?? []} onToggle={k => toggleIn('secret', 'liabilities', k)} query={qLia} />
                </Block>

                <Block title="Influence connue des joueurs">
                    <InfluenceEditor value={d.influence} onChange={v => setData({ influence: v })} />
                </Block>

                <Block title="Influence réelle (secrète)">
                    <InfluenceEditor value={draft.secret.influence} onChange={v => setSecret({ influence: v })} />
                    <label className="block"><span className="vtt-field-label">Notes du MJ</span><textarea className="vtt-input" rows={4} value={draft.secret.notes ?? ''} onChange={e => setSecret({ notes: e.target.value })} /></label>
                </Block>
            </div>
        </div>
    );
};

export default TabPatron;

// src/client/src/systems/vileborn/components/layout/VilEditForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Mode Édition (corrections hors règles et évolutions décidées à la table,
// spec Q21) : identité, dés des approches, mots des cercles, origine, mobiles
// (réinitialisables), ressources, sombre héritage, dons. Partagé par la fiche
// joueur et la fiche MJ. Les actions de jeu (cases, coches, liens) restent sur
// la fiche, hors édition.
// Props : draft (editDraft), setDraft (setState)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { APPROACHES } from '../../config/approaches.js';
import { VilLabel, VilPill, VilToggle } from '../ui/VilUi.jsx';

const DIE_SIZES = [6, 8, 10];

const Field = ({ label, value, onChange, area = false, placeholder }) => (
    <label className="vil-edit-field">
        <span className="vtt-field-label">{label}</span>
        {area
            ? <textarea className="vil-textarea" rows={2} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
            : <input className="vil-input" value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </label>
);

/** Liste éditable de lignes { name, effect, … } : ajout, retrait */
const RowList = ({ rows, fields, onChange, addLabel }) => (
    <div className="vil-fields">
        {rows.map((r, i) => (
            <div key={r.id ?? `row-${i}`} className="vil-edit-row">
                {fields.map(f => (
                    <Field key={f.key} label={f.label} area={f.area} value={r[f.key]}
                           onChange={(v) => onChange(rows.map((x, j) => (j === i ? { ...x, [f.key]: v } : x)))} />
                ))}
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-danger" onClick={() => onChange(rows.filter((_, j) => j !== i))}>Retirer</button>
            </div>
        ))}
        <div><button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onChange([...rows, Object.fromEntries(fields.map(f => [f.key, '']))])}>{addLabel}</button></div>
    </div>
);

const VilEditForm = ({ draft, setDraft }) => {
    const set = (field) => (value) => setDraft(prev => ({ ...prev, [field]: value }));
    const setSlot = (field, i) => (value) => setDraft(prev => ({ ...prev, [field]: prev[field].map((w, j) => (j === i ? value : w)) }));

    return (
        <div className="vil-sheet vil-paper vil-edit">
            <section>
                <VilLabel>Identité</VilLabel>
                <div className="vil-edit-grid">
                    <Field label="Prénom" value={draft.prenom} onChange={set('prenom')} />
                    <Field label="Nom" value={draft.nom} onChange={set('nom')} />
                    <Field label="Devise" value={draft.motto} onChange={set('motto')} />
                    <Field label="Joueur" value={draft.playerName} onChange={set('playerName')} />
                </div>
            </section>

            <section>
                <VilLabel>Approches</VilLabel>
                <div className="vil-assign">
                    {APPROACHES.map(a => (
                        <React.Fragment key={a.key}>
                            <b>{a.label}</b>
                            <span className="vil-pills">
                                {DIE_SIZES.map(s => <VilPill key={s} on={draft[a.field] === s} onClick={() => set(a.field)(s)}>d{s}</VilPill>)}
                            </span>
                        </React.Fragment>
                    ))}
                </div>
            </section>

            <section className="vil-edit-grid">
                {[['personalitySlots', 'Personnalité'], ['trainingSlots', 'Formation']].map(([field, label]) => (
                    <div key={field}>
                        <VilLabel>{label}</VilLabel>
                        <div className="vil-word-inputs">
                            {draft[field].map((w, i) => (
                                <input key={i} className="vil-input" value={w} placeholder={`Cercle ${i + 1}`} onChange={(e) => setSlot(field, i)(e.target.value)} />
                            ))}
                            <div><button type="button" className="vtt-btn vtt-btn-sm" onClick={() => set(field)([...draft[field], ''])}>+ Cercle</button></div>
                        </div>
                    </div>
                ))}
            </section>

            <section className="vil-edit-grid">
                <div>
                    <VilLabel>Origine</VilLabel>
                    <div className="vil-fields">
                        <Field label="Origine" value={draft.originName} onChange={set('originName')} />
                        <Field label="Effet" area value={draft.originEffect} onChange={set('originEffect')} />
                    </div>
                </div>
                <div>
                    <VilLabel>Mobiles</VilLabel>
                    <div className="vil-fields">
                        <Field label="Aspiration" value={draft.aspiration} onChange={set('aspiration')} />
                        <VilToggle on={!!draft.aspirationChecked} onChange={set('aspirationChecked')}>Aspiration cochée</VilToggle>
                        <Field label="Devoir" value={draft.duty} onChange={set('duty')} />
                        <VilToggle on={!!draft.dutyChecked} onChange={set('dutyChecked')}>Devoir coché</VilToggle>
                    </div>
                </div>
            </section>

            <section>
                <VilLabel>Ressources</VilLabel>
                <RowList rows={draft.resources ?? []} onChange={set('resources')} addLabel="+ Ressource"
                         fields={[{ key: 'name', label: 'Nom' }, { key: 'effect', label: 'Effet', area: true }]} />
            </section>

            <section>
                <VilLabel>Sombre héritage et pulsion</VilLabel>
                <div className="vil-edit-grid">
                    <Field label="Sombre héritage" value={draft.heritageName} onChange={set('heritageName')} />
                    <Field label="Pulsion" value={draft.urge} onChange={set('urge')} />
                </div>
                <Field label="Exemples" area value={draft.heritageExamples} onChange={set('heritageExamples')} />
            </section>

            <section>
                <VilLabel>Dons</VilLabel>
                <RowList rows={draft.gifts ?? []} onChange={set('gifts')} addLabel="+ Don"
                         fields={[{ key: 'name', label: 'Nom' }, { key: 'effect', label: 'Effet', area: true }, { key: 'drawback', label: 'Cependant,', area: true }]} />
            </section>
        </div>
    );
};

export default VilEditForm;

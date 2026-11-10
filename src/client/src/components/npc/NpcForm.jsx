// src/client/src/components/npc/NpcForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaire d'un PNJ, en panneau latéral (spec_pnj.md §6.5, §6.7, PL-1) :
// champs communs (avatar, prénom et nom ou nom à la table, rôle ou nature,
// étiquettes, description, notes du MJ) + partie système fournie par le slug
// (`config.Form`, props { value, onChange, isNew } ; isNew : création d'une fiche).
//
// <NpcForm title subtitle draft onChange(patch) isNew?
//          tableName? onTableNameChange?   (PNJ à la table : nom de la carte, §6.7)
//          config onSave onCancel saving error />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import NpcAvatarPicker from './NpcAvatarPicker.jsx';
import { npcName } from './NpcAvatar.jsx';

// Étiquettes : pastilles retirables, ajout par Entrée
const TagsField = ({ tags, onChange }) => {
    const [text, setText] = useState('');
    const add = () => {
        const tag = text.trim();
        if (tag && !tags.includes(tag)) onChange([...tags, tag]);
        setText('');
    };
    return (
        <div className="vtt-npc-tags-field">
            {tags.map(tag => (
                <button key={tag} type="button" className="vtt-pill is-selected" title="Retirer l'étiquette"
                        onClick={() => onChange(tags.filter(t => t !== tag))}>{tag} ✕</button>
            ))}
            <input className="vtt-input" value={text} placeholder="+ étiquette, Entrée" aria-label="Ajouter une étiquette"
                   onChange={e => setText(e.target.value)}
                   onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} onBlur={add} />
        </div>
    );
};

const NpcForm = ({ title, subtitle, draft, onChange, isNew = false, tableName = null, onTableNameChange = null, config = {}, onSave, onCancel, saving = false, error = null }) => {
    const SystemForm = config.Form;
    const inTable = onTableNameChange !== null;
    const field = (key) => ({ value: draft[key] ?? '', onChange: e => onChange({ [key]: e.target.value }) });

    return (
        <section className="vtt-panel vtt-npc-zone vtt-npc-aside vtt-npc-form-panel vtt-scroll">
            <div className="vtt-npc-zone-head">
                <h2 className="vtt-section-title">{title}</h2>
                <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" onClick={onCancel} aria-label="Fermer" title="Fermer">✕</button>
            </div>
            {subtitle && <p className="vtt-npc-summary">{subtitle}</p>}
            <form className="vtt-npc-form" onSubmit={e => { e.preventDefault(); onSave(); }}>
                <NpcAvatarPicker npc={draft} onChange={onChange} />
                {inTable ? (
                    <label>
                        <span className="vtt-field-label">Nom à la table *</span>
                        <input className="vtt-input" value={tableName ?? ''} onChange={e => onTableNameChange(e.target.value)} />
                        <span className="vtt-npc-summary">Le nom de la carte. La fiche d'origine garde le sien ({npcName(draft)}).</span>
                    </label>
                ) : (
                    <div className="vtt-npc-form-row">
                        <label><span className="vtt-field-label">Prénom</span><input className="vtt-input" placeholder="Facultatif" {...field('prenom')} /></label>
                        <label><span className="vtt-field-label">Nom *</span><input className="vtt-input" placeholder="Ekkad, Loup, Cultiste…" {...field('nom')} /></label>
                    </div>
                )}
                <label><span className="vtt-field-label">Rôle ou nature</span><input className="vtt-input" placeholder="Marchand d'eau, Bête, Démon mineur…" {...field('role')} /></label>
                <div><span className="vtt-field-label">Étiquettes</span><TagsField tags={draft.tags ?? []} onChange={tags => onChange({ tags })} /></div>
                <label><span className="vtt-field-label">Description</span><textarea className="vtt-input" rows={2} placeholder="Ce que les joueurs peuvent savoir" {...field('description')} /></label>
                <label><span className="vtt-field-label">Notes du MJ</span><textarea className="vtt-input" rows={2} placeholder="Secrets, motivations" {...field('gmNotes')} /></label>
                {SystemForm && (
                    <div className="vtt-npc-system">
                        <SystemForm value={draft.systemData ?? {}} isNew={isNew} onChange={systemData => onChange({ systemData })} />
                    </div>
                )}
                {error && <p className="vtt-callout vtt-callout-danger">{error}</p>}
                <div className="vtt-npc-actions vtt-npc-form-actions">
                    <button type="button" className="vtt-btn" onClick={onCancel}>Annuler</button>
                    <button type="submit" className="vtt-btn vtt-btn-primary" disabled={saving}>Enregistrer</button>
                </div>
            </form>
        </section>
    );
};

export default NpcForm;

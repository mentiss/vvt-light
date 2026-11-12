// src/client/src/features/npc/NpcForm.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Formulaire d'un PNJ, en panneau latéral (spec_pnj.md §6.5, §6.7, PL-1) :
// champs communs (avatar, prénom et nom ou nom à la table, rôle ou nature,
// étiquettes, description, notes du MJ) + partie système fournie par le slug
// (`config.Form`, props { value, onChange, isNew } ; isNew : création d'une fiche).
// Étiquettes (§11) : celles posées par la fiche (groupes pilotés de `config.tagGroups`)
// s'affichent verrouillées ; la saisie propose les étiquettes déjà présentes (`suggestions`).
//
// <NpcForm title subtitle draft onChange(patch) isNew?
//          tableName? onTableNameChange?   (PNJ à la table : nom de la carte, §6.7)
//          suggestions?                    (étiquettes de la bibliothèque)
//          wide? onToggleWide? widenIcon?  (colonne élargie, §11 ; sans onToggleWide : pas de bouton)
//          config onSave onCancel saving error />
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import NpcAvatarPicker from './NpcAvatarPicker.jsx';
import { npcName } from './NpcAvatar.jsx';
import { isSystemTag } from './tools/npcTags.js';

const NO_TAGS = [];
const MAX_SUGGESTIONS = 12;

// Étiquettes : pastilles retirables (sauf celles posées par la fiche), ajout par Entrée
// ou par une étiquette existante proposée sous le champ. La saisie en cours n'est validée
// qu'en quittant tout le bloc : Tab mène aux suggestions sans ajouter le fragment tapé.
const TagsField = ({ tags, onChange, isLocked, suggestions }) => {
    const [text, setText] = useState('');
    const [focused, setFocused] = useState(false);
    const inputRef = useRef(null);
    const add = (value = text) => {
        const tag = value.trim();
        if (tag && !tags.includes(tag)) onChange([...tags, tag]);
        setText('');
    };
    // Suggestion choisie : retour dans le champ (le bouton choisi disparaît de la liste)
    const pick = (t) => { add(t); inputRef.current?.focus(); };
    const onGroupBlur = (e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setFocused(false);
        add();
    };
    const query = text.trim().toLowerCase();
    const proposed = (focused || query)
        ? suggestions.filter(t => !tags.includes(t) && !isLocked(t) && t.toLowerCase().includes(query)).slice(0, MAX_SUGGESTIONS)
        : NO_TAGS;
    return (
        <div className="vtt-npc-tags-edit" onFocus={() => setFocused(true)} onBlur={onGroupBlur}>
            <div className="vtt-npc-tags-field">
                {tags.map(tag => (isLocked(tag) ? (
                    <span key={tag} className="vtt-pill is-selected is-locked" title="Posée par la fiche : se change dans la partie système">{tag}</span>
                ) : (
                    <button key={tag} type="button" className="vtt-pill is-selected" title="Retirer l'étiquette"
                            onClick={() => onChange(tags.filter(t => t !== tag))}>{tag} ✕</button>
                )))}
                <input ref={inputRef} className="vtt-input" value={text} placeholder="+ étiquette, Entrée" aria-label="Ajouter une étiquette"
                       onChange={e => setText(e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
            </div>
            {proposed.length > 0 && (
                <div className="vtt-npc-tags-suggest" aria-label="Étiquettes existantes">
                    {/* mousedown bloqué : un navigateur qui ne donne pas le focus au bouton cliqué ferait valider la saisie partielle */}
                    {proposed.map(t => (
                        <button key={t} type="button" className="vtt-pill" onMouseDown={e => e.preventDefault()} onClick={() => pick(t)}>+ {t}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

const NpcForm = ({ title, subtitle, draft, onChange, isNew = false, tableName = null, onTableNameChange = null, suggestions = NO_TAGS, wide = false, onToggleWide = null, widenIcon = '»', config = {}, onSave, onCancel, saving = false, error = null }) => {
    const SystemForm = config.Form;
    const inTable = onTableNameChange !== null;
    const field = (key) => ({ value: draft[key] ?? '', onChange: e => onChange({ [key]: e.target.value }) });

    return (
        <section className="vtt-panel vtt-npc-zone vtt-npc-aside vtt-npc-form-panel vtt-scroll">
            <div className="vtt-npc-zone-head">
                <h2 className="vtt-section-title">{title}</h2>
                {onToggleWide && (
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" onClick={onToggleWide} aria-pressed={wide}
                            title={wide ? 'Rétrécir la colonne' : 'Élargir la colonne'} aria-label={wide ? 'Rétrécir la colonne' : 'Élargir la colonne'}>{widenIcon}</button>
                )}
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
                <div><span className="vtt-field-label">Étiquettes</span><TagsField tags={draft.tags ?? []} onChange={tags => onChange({ tags })}
                                                                                                  isLocked={t => isSystemTag(t, config.tagGroups)} suggestions={suggestions} /></div>
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

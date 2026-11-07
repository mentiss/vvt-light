// src/client/src/systems/cyberpunk/components/creation/CreationParts.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Briques de l'assistant de création (spec_cyberpunk.md §9, planche_creation.html) :
// en-tête d'étape, carte à choisir, rangée de tags.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { TAG_VARIANT_CLASS, STAT_LABELS, needsDetail, withDetail, splitChoice } from '../../config.jsx';
import CpIcon from '../ui/CpIcon.jsx';

/** En-tête d'étape : numéro, titre, consigne, choix restants (unit : [singulier, pluriel]). */
export const StepHead = ({ num, title, sub, remaining = 0, unit = ['choix restant', 'choix restants'] }) => (
    <div className="cp-cr-stage-head">
        <div className="cp-cr-stage-num">{String(num).padStart(2, '0')}</div>
        <div>
            <div className="cp-cr-stage-title">{title}</div>
            {sub && <div className="cp-cr-stage-sub">{sub}</div>}
        </div>
        <div className="cp-cr-stage-count">
            {remaining > 0
                ? <><b>{remaining}</b> {remaining > 1 ? unit[1] : unit[0]}</>
                : <span className="text-success">étape complète</span>}
        </div>
    </div>
);

/** Tags d'un élément du catalogue ({ text, variant }). */
export const TagRow = ({ tags = [] }) => tags.length > 0 && (
    <div className="cp-tags">
        {tags.map(t => (
            <span key={t.text} className={`cp-tag ${TAG_VARIANT_CLASS[t.variant] ?? TAG_VARIANT_CLASS.neutral}`}>{t.text}</span>
        ))}
    </div>
);

/** Stats lancées par les manœuvres du playbook : « Pro ×4 · Cran ×2 ». */
export const StatProfile = ({ profile, loaded = true }) => (
    <span className="cp-cr-statprofile">
        {!loaded ? <span className="cp-cr-rule">…</span>
            : profile.length === 0 ? <span className="cp-cr-rule">manœuvres sans jet</span>
                : profile.map(p => (
                    <span key={p.stat} className={`cp-stat-badge cp-stat-badge-${p.stat}`} title={`${p.count} manœuvre${p.count > 1 ? 's' : ''} de playbook lancée${p.count > 1 ? 's' : ''} avec ${STAT_LABELS[p.stat]}`}>
                        {STAT_LABELS[p.stat]} ×{p.count}
                    </span>
                ))}
    </span>
);

/**
 * Choix dans une liste de l'aide de jeu ; un élément « (choisir) » demande sa précision
 * (ex. Agent corpo → la corpo), qui remplace la mention dans le tag.
 * @param {string[]} list
 * @param {string} value     choix enregistré (élément, ou élément précisé)
 * @param {Function} onChange (valeur) => void
 */
export const ListChoice = ({ list, value = '', onChange }) => {
    const { item, detail } = splitChoice(list, value);
    return (
        <>
            <div className="cp-cr-list">
                {list.map(label => (
                    <button key={label} type="button" className={item === label ? 'is-on' : ''} onClick={() => onChange(label)}>
                        {needsDetail(label) ? label.replace(/\(choisir\)/i, '(à préciser)') : label}
                    </button>
                ))}
            </div>
            {item && needsDetail(item) && (
                <input className="cp-input is-sm" value={detail} autoFocus placeholder={`${item.replace(/\s*\(choisir\)/i, '')} : à préciser (ex. Arasaka pour une corpo)`}
                       aria-label="Précision" onChange={e => onChange(e.target.value.trim() ? withDetail(item, e.target.value) : item)} />
            )}
        </>
    );
};

/** Compteur d'un réglage : « 1/2 défauts », vert quand complet. */
const Count = ({ got, need, label }) => (
    <span className={`cnt ${got >= need ? 'is-ok' : ''}`}>{got}/{need} {label}</span>
);

/**
 * Choix de tags imposés d'un élément (tagChoicesOf) : un bloc par liste.
 * @param {Array} choices      [{ label, pick, from: [{ text, variant }] }]
 * @param {object} value       { [libellé]: [texte] }
 * @param {Function} onChange  (libellé, [texte]) => void
 */
export const TagChoices = ({ choices, value = {}, onChange }) => choices.map(c => {
    const picked = value[c.label] ?? [];
    const toggle = (text) => onChange(c.label, picked.includes(text)
        ? picked.filter(t => t !== text)
        : (c.pick === 1 ? [text] : [...picked, text].slice(-c.pick)));
    return (
        <div key={c.label} className="flex flex-col gap-1">
            <div className="cp-cr-rule">{c.label} <b>obligatoire</b> · {c.pick} au choix <Count got={picked.length} need={c.pick} label="" /></div>
            <div className="cp-cr-list">
                {c.from.map(t => (
                    <button key={t.text} type="button" className={picked.includes(t.text) ? 'is-on' : ''} onClick={() => toggle(t.text)}>{t.text}</button>
                ))}
            </div>
        </div>
    );
});

/**
 * Tags négatifs à prendre (défauts du chrome offert) : emplacements, suggestions, texte libre.
 * @param {number} need        nombre de défauts
 * @param {string[]} value     défauts choisis
 * @param {string[]} suggestions
 */
export const DefectPicker = ({ need, value = [], suggestions, onChange }) => {
    const [free, setFree] = React.useState('');
    const add = (text) => {
        const t = text.trim();
        if (!t || value.length >= need) return;
        onChange([...value, t.startsWith('+') ? t : `+${t}`]);
    };
    return (
        <>
            <div className="cp-cr-slots">
                {Array.from({ length: need }, (_, i) => value[i]
                    ? <button key={i} type="button" className="cp-cr-slot is-filled" title="Retirer" onClick={() => onChange(value.filter((_, j) => j !== i))}>{value[i]} <CpIcon name="close" size="sm" /></button>
                    : <span key={i} className="cp-cr-slot">tag négatif…</span>)}
            </div>
            <div className="cp-cr-sugg">
                {suggestions.map(s => (
                    <button key={s} type="button" disabled={value.includes(s) || value.length >= need} onClick={() => add(s)}>{s}</button>
                ))}
            </div>
            <div className="cp-cr-inline">
                <input className="cp-input is-sm" value={free} placeholder="Autre défaut, ex. sorti d'une clinique louche" aria-label="Autre défaut"
                       onChange={e => setFree(e.target.value)}
                       onKeyDown={e => { if (e.key === 'Enter') { add(free); setFree(''); } }} />
                <button type="button" className="cp-btn is-sm" disabled={!free.trim() || value.length >= need} onClick={() => { add(free); setFree(''); }}>Ajouter</button>
            </div>
        </>
    );
};

/** Bloc de réglage d'un élément choisi (titre, compteur, contenu). */
export const ConfigBox = ({ title, got, need, label, children }) => (
    <div className="cp-cr-config">
        <div className="cp-cr-config-head">{title}{need > 0 && <Count got={got} need={need} label={label} />}</div>
        {children}
    </div>
);

/** Carte à choisir : losange coché, nom, catégorie, description, indication, tags. */
export const PickCard = ({ on = false, disabled = false, onClick, name, cat, desc, hint, tags, children, className = '' }) => (
    <button type="button" className={`cp-cr-card ${on ? 'is-on' : ''} ${className}`} disabled={disabled} onClick={onClick} aria-pressed={on}>
        <i className="cp-cr-check" />
        <div className="cp-cr-card-top"><span className="cp-cr-card-name">{name}</span>{cat && <span className="cp-cr-card-cat">{cat}</span>}</div>
        {desc && <div className="cp-cr-card-desc">{desc}</div>}
        {hint && <div className="cp-cr-card-hint">{hint}</div>}
        <TagRow tags={tags} />
        {children}
    </button>
);

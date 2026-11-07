// src/client/src/systems/cyberpunk/components/layout/TagManager.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Tags narratifs (spec_cyberpunk.md §4.1) : positif, neutre, négatif.
// Le type se lit au liseré ; le « + » fait partie du libellé (convention du jeu).
//
//   <TagList tags entityType onAdd onRemove onChangeVariant />
//     liste + « + tag » au bout (fenêtre d'ajout) ; clic sur un tag = son menu
//     (changer de type, retirer). Sans onAdd : pas d'ajout ; sans onRemove ni
//     onChangeVariant : tags en lecture seule.
//   <Tag tag />  un tag seul (lecture)
//
// Fenêtre et menu passent par CpFloating (portail) : jamais rognés par un panneau.
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useMemo, useRef, useState } from 'react';
import { TAG_SUGGESTIONS_BY_TYPE } from '../../config.jsx';
import CpFloating from '../ui/CpFloating.jsx';
import CpIcon from '../ui/CpIcon.jsx';

const VARIANTS = [
    { id: 'positive', label: 'Positif'  },
    { id: 'neutral',  label: 'Neutre'   },
    { id: 'negative', label: 'Négatif'  },
];
const VARIANT_CLASS = { positive: 'is-positive', negative: 'is-negative', neutral: 'is-neutral' };
const ENTITY_LABEL = { character: 'personnage', cyberware: 'implant', relation: 'relation', item: 'objet' };

/** Ajoute le préfixe « + » s'il est demandé et pas déjà tapé. */
const withPrefix = (text, prefix) => (prefix && !text.startsWith('+') ? `+${text}` : text);

// Mode Édition de la fiche : seul moment où un tag verrouillé (posé par une manœuvre,
// spec_cyberpunk.md §9.8) se modifie ou se retire. Fourni par SheetBody.
export const TagUnlockContext = createContext(false);

// ── Tag (lecture, ou bouton qui ouvre son menu) ──────────────────────────────
export const Tag = ({ tag, onClick, active = false }) => {
    const cls = `cp-tag ${tag.locked ? 'is-locked' : VARIANT_CLASS[tag.tag_variant] ?? 'is-neutral'} ${onClick ? 'is-clickable' : ''} ${active ? 'is-active' : ''}`;
    const label = <>{tag.locked && <CpIcon name="lock" size="sm" />}{tag.tag_text}</>;
    return onClick
        ? <button type="button" className={cls} onClick={onClick} title="Changer le type ou retirer">{label}</button>
        : <span className={cls} title={tag.locked ? 'Posé par une manœuvre : retrait en mode Édition' : undefined}>{label}</span>;
};

// ── Menu d'un tag : changer de type, retirer ─────────────────────────────────
const TagMenu = ({ anchor, tag, onChangeVariant, onRemove, onClose }) => (
    <CpFloating anchor={anchor} onClose={onClose} className="cp-menu">
        {onChangeVariant && VARIANTS.map(v => (
            <button key={v.id} type="button" className={`cp-menu-item ${tag.tag_variant === v.id ? 'is-current' : ''}`}
                    onClick={() => { onChangeVariant(v.id); onClose(); }}>
                <i className={`cp-menu-swatch ${VARIANT_CLASS[v.id]}`} />{v.label}
            </button>
        ))}
        {onChangeVariant && onRemove && <hr className="cp-menu-sep" />}
        {onRemove && (
            <button type="button" className="cp-menu-item is-danger" onClick={() => { onRemove(); onClose(); }}>
                <CpIcon name="close" size="sm" />Retirer le tag
            </button>
        )}
    </CpFloating>
);

// ── Fenêtre d'ajout ─────────────────────────────────────────────────────────
const TagAddPopover = ({ anchor, entityType, existing, onAdd, onClose }) => {
    const [text, setText] = useState('');
    const [prefix, setPrefix] = useState(true);
    const [variant, setVariant] = useState('neutral');
    const inputRef = useRef(null);

    const used = useMemo(() => new Set(existing.map(t => t.tag_text)), [existing]);
    const suggestions = TAG_SUGGESTIONS_BY_TYPE[entityType] ?? TAG_SUGGESTIONS_BY_TYPE.character;
    const query = text.trim().toLowerCase().replace(/^\+/, '');
    const filtered = query ? suggestions.filter(s => s.text.toLowerCase().includes(query)) : suggestions;

    const add = (label, v) => {
        if (!label) return;
        onAdd(label, v);
        setText('');
        inputRef.current?.focus();
    };
    const submit = () => add(withPrefix(text.trim(), prefix), variant);

    return (
        <CpFloating anchor={anchor} onClose={onClose} className="cp-pop">
            <div className="cp-pop-head">
                <CpIcon name="tag" size="sm" />Nouveau tag <span>· {ENTITY_LABEL[entityType] ?? 'personnage'}</span>
            </div>
            <div className="cp-pop-body">
                <div className="cp-pop-field">
                    <button type="button" className={`cp-prefix ${prefix ? 'is-on' : ''}`} onClick={() => setPrefix(p => !p)}
                            title={prefix ? 'Préfixe « + » ajouté (cliquer pour le retirer)' : 'Sans préfixe « + » (cliquer pour l\'ajouter)'}>+</button>
                    <input
                        ref={inputRef} autoFocus value={text} placeholder="libellé du tag…"
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
                    />
                </div>
                <div className="cp-seg cp-variant">
                    {VARIANTS.map(v => (
                        <button key={v.id} type="button" className={`${VARIANT_CLASS[v.id]} ${variant === v.id ? 'is-on' : ''}`}
                                onClick={() => setVariant(v.id)}>{v.label}</button>
                    ))}
                </div>
                <div className="cp-pop-sugg cp-scroll">
                    {VARIANTS.map(v => {
                        const items = filtered.filter(s => s.variant === v.id);
                        return (
                            <div key={v.id} className={`cp-pop-col ${VARIANT_CLASS[v.id]}`}>
                                <h4>{v.label}s</h4>
                                {items.length === 0 && <span className="cp-pop-none">—</span>}
                                {items.map(s => (
                                    <button key={s.text} type="button" disabled={used.has(s.text)}
                                            onClick={() => add(s.text, s.variant)}>{s.text}</button>
                                ))}
                            </div>
                        );
                    })}
                </div>
                <div className="cp-pop-foot">
                    <small>Entrée : ajouter · Échap : fermer</small>
                    <button type="button" className="cp-btn is-primary is-sm" onClick={submit} disabled={!text.trim()}>Ajouter</button>
                </div>
            </div>
        </CpFloating>
    );
};

// ── Liste de tags d'une entité ──────────────────────────────────────────────
export const TagList = ({ tags = [], entityType = 'character', onAdd, onRemove, onChangeVariant, emptyLabel = null }) => {
    const [menu, setMenu] = useState(null);       // { index, anchor }
    const [adding, setAdding] = useState(null);   // élément d'ancrage du « + tag »
    const editable = !!(onRemove || onChangeVariant);
    const unlocked = useContext(TagUnlockContext);

    return (
        <div className="cp-tags">
            {tags.length === 0 && emptyLabel && <span className="cp-tags-empty">{emptyLabel}</span>}
            {tags.map((tag, i) => (
                <Tag
                    key={tag.id ?? `${tag.tag_text}-${i}`} tag={tag} active={menu?.index === i}
                    onClick={editable && (!tag.locked || unlocked) ? (e) => setMenu({ index: i, anchor: e.currentTarget }) : undefined}
                />
            ))}
            {onAdd && (
                <button type="button" className="cp-tag-add" onClick={(e) => setAdding(e.currentTarget)}>+ tag</button>
            )}
            {menu && tags[menu.index] && (
                <TagMenu
                    anchor={menu.anchor} tag={tags[menu.index]}
                    onChangeVariant={onChangeVariant ? (v) => onChangeVariant(menu.index, v) : null}
                    onRemove={onRemove ? () => onRemove(menu.index) : null}
                    onClose={() => setMenu(null)}
                />
            )}
            {adding && (
                <TagAddPopover anchor={adding} entityType={entityType} existing={tags}
                               onAdd={onAdd} onClose={() => setAdding(null)} />
            )}
        </div>
    );
};

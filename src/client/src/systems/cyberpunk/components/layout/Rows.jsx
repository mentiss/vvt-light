// src/client/src/systems/cyberpunk/components/layout/Rows.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Lignes de la fiche (spec_cyberpunk.md §4) : directive, relation, implant, objet,
// ajout rapide d'objet. Partagées avec la vue MJ du personnage (TabSession).
// Tags : TagList (ajout au bout de la liste, clic sur un tag = changer de type ou
// retirer). onChangeTag(index, variant) facultatif.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { TagList } from "./TagManager.jsx";
import { CYBERWARE_ALL, ITEM_AND_CYBERWARE_CATEGORY_LABEL, ITEMS_ALL } from "../../config.jsx";
import CpIcon from "../ui/CpIcon.jsx";

const RemoveButton = ({ onClick, title }) => (
    <button type="button" onClick={onClick} title={title} className="cp-icon-btn is-danger">
        <CpIcon name="close" size="sm" />
    </button>
);

// Liste de suggestions d'un champ (implant, objet) : groupée par catégorie si demandé
const SuggestList = ({ items, grouped = false, onPick, describe, above = false }) => {
    const groups = grouped
        ? Object.entries(items.reduce((acc, it) => { (acc[it.category] ??= []).push(it); return acc; }, {}))
        : [[null, items]];
    return (
        <div className={`cp-suggest cp-scroll ${above ? 'is-above' : ''}`}>
            {groups.map(([cat, list]) => (
                <div key={cat ?? 'all'}>
                    {cat && <div className="cp-suggest-group">{ITEM_AND_CYBERWARE_CATEGORY_LABEL[cat] ?? cat}</div>}
                    {list.map(it => (
                        <button key={it.name} type="button" className="cp-suggest-item"
                                onMouseDown={e => e.preventDefault()} onClick={() => onPick(it)}>
                            <span className="cp-suggest-name">{it.name}</span>
                            {describe(it) && <span className="cp-suggest-desc">{describe(it)}</span>}
                        </button>
                    ))}
                </div>
            ))}
        </div>
    );
};

// ── Directive ────────────────────────────────────────────────────────────────
// onToggle facultatif (vue MJ) : la case devient cliquable (accomplie / en cours)
export const DirectiveRow = ({ directive, editMode, onChange, onRemove, onToggle }) => (
    <div className={`cp-dir ${directive.completed ? 'is-done' : ''}`}>
        {onToggle && !editMode ? (
            <button type="button" className={`cp-dir-box ${directive.completed ? 'is-on' : ''}`} onClick={onToggle}
                    title={directive.completed ? 'Accomplie (cliquer pour annuler)' : 'Marquer accomplie'} />
        ) : (
            <span className={`cp-dir-box ${directive.completed ? 'is-on' : ''}`} title={directive.completed ? 'Accomplie' : 'En cours'} />
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
            {editMode ? (
                <>
                    <input type="text" value={directive.text ?? ''} onChange={e => onChange({ text: e.target.value })}
                           placeholder="Directive…" className="cp-input" />
                    <input type="text" value={directive.blankValue ?? ''} onChange={e => onChange({ blankValue: e.target.value })}
                           placeholder="Valeur / description…" className="cp-input is-sm" />
                </>
            ) : (
                <span className="cp-dir-text">
                    {directive.text || '—'}
                    {directive.blankValue && <u>{directive.blankValue}</u>}
                </span>
            )}
        </div>
        {editMode && <RemoveButton onClick={onRemove} title="Supprimer cette directive" />}
    </div>
);

// ── Relation : jauge de Lien de −3 à +3, clic = Aider ou Interférer ─────────
const LinkGauge = ({ score }) => (
    <span className="cp-link" aria-label={`Lien ${score > 0 ? '+' : ''}${score}`}>
        {[-3, -2, -1].map(n => <i key={n} className={score <= n ? 'is-neg' : ''} />)}
        <i className="is-zero" />
        {[1, 2, 3].map(n => <i key={n} className={score >= n ? 'is-pos' : ''} />)}
        <b className={score > 0 ? 'is-pos' : score < 0 ? 'is-neg' : ''}>{score > 0 ? `+${score}` : score}</b>
    </span>
);

export const RelationRow = ({ relation, editMode, onChange, onRemove, onRemoveTag, onAddTag, onChangeTag, onRoll }) => {
    const score = relation.link_score ?? 1;
    return (
        <div className="cp-line">
            {editMode ? (
                <div className="cp-line-top">
                    <input type="text" value={relation.name ?? ''} onChange={e => onChange({ name: e.target.value })}
                           placeholder="Nom de la relation…" className="cp-input flex-1" />
                    <span className="cp-stepper">
                        <button type="button" className="cp-step" onClick={() => onChange({ link_score: Math.max(-3, score - 1) })}>−</button>
                        <LinkGauge score={score} />
                        <button type="button" className="cp-step" onClick={() => onChange({ link_score: Math.min(3, score + 1) })}>+</button>
                    </span>
                    <RemoveButton onClick={onRemove} title="Supprimer cette relation" />
                </div>
            ) : (
                <button type="button" className="cp-line-top cp-rel-roll" disabled={!onRoll}
                        onClick={() => onRoll?.(score)} title={onRoll ? 'Aider ou Interférer (score de Lien)' : undefined}>
                    <span className="cp-line-name">{relation.name || 'Relation'}</span>
                    {onRoll && <CpIcon name="d10" size="sm" className="cp-rel-dice" />}
                    <LinkGauge score={score} />
                </button>
            )}
            {editMode ? (
                <input type="text" value={relation.description ?? ''} onChange={e => onChange({ description: e.target.value })}
                       placeholder="Description courte…" className="cp-input is-sm" />
            ) : relation.description ? (
                <p className="cp-line-desc">{relation.description}</p>
            ) : null}
            <TagList tags={relation.tags ?? []} entityType="relation"
                     onAdd={onAddTag} onRemove={onRemoveTag} onChangeVariant={onChangeTag} />
        </div>
    );
};

// ── Implant ─────────────────────────────────────────────────────────────────
export const CyberwareRow = ({ item, editMode, onChange, onRemove, onRemoveTag, onAddTag, onChangeTag, removable = false }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const nameValue = item.name ?? '';
    const suggestions = dropdownOpen && nameValue.length > 0
        ? CYBERWARE_ALL.filter(cw => cw.name.toLowerCase().includes(nameValue.toLowerCase()))
        : [];
    const matchedCw = CYBERWARE_ALL.find(cw => cw.name === nameValue);

    const handleSelect = (cw) => {
        onChange({ name: cw.name, tags: cw.tags.map(t => ({ tag_text: t.text, tag_variant: t.variant })) });
        setDropdownOpen(false);
    };

    return (
        <div className="cp-line">
            <div className="cp-line-top">
                {editMode ? (
                    <div className="relative flex-1 min-w-0">
                        <input type="text" value={nameValue} placeholder="Nom de l'implant…" className="cp-input"
                               onChange={e => { onChange({ name: e.target.value }); setDropdownOpen(true); }}
                               onFocus={() => setDropdownOpen(true)} onBlur={() => setDropdownOpen(false)}
                               onKeyDown={e => e.key === 'Escape' && setDropdownOpen(false)} />
                        {suggestions.length > 0 && (
                            <SuggestList items={suggestions} onPick={handleSelect} describe={cw => cw.optionHint} />
                        )}
                    </div>
                ) : (
                    <span className="cp-line-name">{item.name}</span>
                )}
                {!editMode && item.option_text && <span className="cp-line-opt">› {item.option_text}</span>}
                {(editMode || removable) && <RemoveButton onClick={onRemove} title="Retirer l'implant" />}
            </div>
            {editMode && (
                <input type="text" value={item.option_text ?? ''} onChange={e => onChange({ option_text: e.target.value })}
                       placeholder={matchedCw?.optionHint ?? 'Option choisie…'} className="cp-input is-sm" />
            )}
            <TagList tags={item.tags ?? []} entityType="cyberware"
                     onAdd={onAddTag} onRemove={onRemoveTag} onChangeVariant={onChangeTag} />
        </div>
    );
};

// ── Objet ───────────────────────────────────────────────────────────────────
export const ItemRow = ({ item, editMode, onChange, onRemove, onRemoveTag, onAddTag, onChangeTag, removable = false }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const nameValue = item.name ?? '';
    const filtered = dropdownOpen && nameValue.length > 0
        ? ITEMS_ALL.filter(it => it.name.toLowerCase().includes(nameValue.toLowerCase()))
        : [];

    const handleSelect = (it) => {
        onChange({ name: it.name, tags: it.tags.map(t => ({ tag_text: t.text, tag_variant: t.variant })) });
        setDropdownOpen(false);
    };
    const handleQuantity = (delta) => {
        const next = (item.quantity ?? 1) + delta;
        if (next < 1) { onRemove(); return; }
        onChange({ quantity: next });
    };

    return (
        <div className="cp-line">
            <div className="cp-line-top">
                {editMode ? (
                    <div className="relative flex-1 min-w-0">
                        <input type="text" value={nameValue} placeholder="Objet…" className="cp-input"
                               onChange={e => { onChange({ name: e.target.value }); setDropdownOpen(true); }}
                               onFocus={() => setDropdownOpen(true)} onBlur={() => setDropdownOpen(false)}
                               onKeyDown={e => e.key === 'Escape' && setDropdownOpen(false)} />
                        {filtered.length > 0 && (
                            <SuggestList items={filtered} grouped onPick={handleSelect} describe={it => it.tags.map(t => t.text).join(' ')} />
                        )}
                    </div>
                ) : (
                    <span className="cp-line-name flex-1">{item.name}</span>
                )}
                {/* Quantité : toujours modifiable (− à 1 retire l'objet) */}
                <span className="cp-stepper">
                    <button type="button" className="cp-step" onClick={() => handleQuantity(-1)} title="Retirer un">−</button>
                    <b className="cp-qty">×{item.quantity ?? 1}</b>
                    <button type="button" className="cp-step" onClick={() => handleQuantity(+1)} title="Ajouter un">+</button>
                </span>
                {(editMode || removable) && <RemoveButton onClick={onRemove} title="Retirer l'objet" />}
            </div>
            {item.description && !editMode && <p className="cp-line-desc">{item.description}</p>}
            <TagList tags={item.tags ?? []} entityType="item"
                     onAdd={onAddTag} onRemove={onRemoveTag} onChangeVariant={onChangeTag} />
        </div>
    );
};

// ── Ajout rapide d'objet (catalogue ou saisie libre) ───────────────────────
export const QuickAddItem = ({ onAdd }) => {
    const [query, setQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const filtered = dropdownOpen && query.length > 0
        ? ITEMS_ALL.filter(it => it.name.toLowerCase().includes(query.toLowerCase()))
        : [];

    const handleSelect = (it) => {
        onAdd({ name: it.name, quantity: 1, description: '', tags: it.tags.map(t => ({ tag_text: t.text, tag_variant: t.variant })) });
        setQuery('');
        setDropdownOpen(false);
    };
    const handleCustom = () => {
        const trimmed = query.trim();
        if (!trimmed) return;
        onAdd({ name: trimmed, quantity: 1, description: '', tags: [] });
        setQuery('');
        setDropdownOpen(false);
    };

    return (
        <div className="relative">
            <div className="cp-quickadd">
                <CpIcon name="plus" size="sm" />
                <input type="text" value={query} placeholder="Ajout rapide : rechercher ou saisir un objet…"
                       onChange={e => { setQuery(e.target.value); setDropdownOpen(true); }}
                       onFocus={() => setDropdownOpen(true)} onBlur={() => setDropdownOpen(false)}
                       onKeyDown={e => {
                           if (e.key === 'Escape') { setDropdownOpen(false); setQuery(''); }
                           if (e.key === 'Enter') handleCustom();
                       }} />
                {query.trim() && (
                    <button type="button" className="cp-btn is-primary is-sm" onMouseDown={e => e.preventDefault()} onClick={handleCustom}>
                        Ajouter
                    </button>
                )}
            </div>
            {filtered.length > 0 && (
                <SuggestList items={filtered} grouped above onPick={handleSelect} describe={it => it.tags.map(t => t.text).join(' ')} />
            )}
        </div>
    );
};

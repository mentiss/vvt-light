// src/client/src/components/npc/NpcItemList.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Brique des formulaires PNJ des slugs (spec_pnj.md §6.5, §10) : liste éditable
// d'entrées (attaques, compétences, traits…), une ligne par entrée, bouton de retrait,
// bouton d'ajout. Champs décrits par le slug :
//   { key, placeholder, type?: 'text'|'number', narrow?, multiline?, options?: { valeur: libellé }, list?: [suggestions] }
//   - number : '' donne null ; options : pastilles (un clic sur la pastille choisie la retire) ;
//   - list : suggestions de saisie (datalist), la saisie reste libre.
// <NpcItemList items onChange fields newItem addLabel />
// Habillage : vtt-npc-items, vtt-npc-items-row, vtt-npc-items-fields.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useId } from 'react';

const NpcItemList = ({ items = [], onChange, fields, newItem, addLabel = '+ Ajouter' }) => {
    const listId = useId();
    const set = (i, key, v) => onChange(items.map((x, j) => (j === i ? { ...x, [key]: v } : x)));
    const inline = fields.filter(f => !f.multiline && !f.options);
    return (
        <div className="vtt-npc-items">
            {fields.filter(f => f.list).map(f => (
                <datalist key={f.key} id={`${listId}-${f.key}`}>{f.list.map(v => <option key={v} value={v} />)}</datalist>
            ))}
            {items.map((item, i) => (
                // relecture: F-KEY — lignes sans identifiant stable, éditées en place
                <div key={i} className="vtt-npc-items-row">
                    <div className="vtt-npc-items-fields">
                        {inline.map(f => (
                            <input key={f.key} className={`vtt-input${f.narrow ? ' is-narrow' : ''}`} type={f.type ?? 'text'}
                                   placeholder={f.placeholder} aria-label={f.placeholder} value={item[f.key] ?? ''}
                                   list={f.list ? `${listId}-${f.key}` : undefined}
                                   onChange={e => set(i, f.key, f.type === 'number' ? (e.target.value === '' ? null : Number(e.target.value)) : e.target.value)} />
                        ))}
                        <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-icon vtt-npc-icon-btn" aria-label="Retirer" title="Retirer"
                                onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
                    </div>
                    {fields.filter(f => f.options).map(f => (
                        <div key={f.key} className="vtt-npc-items-fields">
                            {Object.entries(f.options).map(([v, l]) => (
                                <button key={v} type="button" className={`vtt-pill${item[f.key] === v ? ' is-selected' : ''}`}
                                        onClick={() => set(i, f.key, item[f.key] === v ? null : v)}>{l}</button>
                            ))}
                        </div>
                    ))}
                    {fields.filter(f => f.multiline).map(f => (
                        <textarea key={f.key} className="vtt-input" rows={2} placeholder={f.placeholder} aria-label={f.placeholder}
                                  value={item[f.key] ?? ''} onChange={e => set(i, f.key, e.target.value)} />
                    ))}
                </div>
            ))}
            <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onChange([...items, newItem()])}>{addLabel}</button>
        </div>
    );
};

export default NpcItemList;

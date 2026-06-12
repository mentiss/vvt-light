// src/client/src/systems/achtung/components/ItemsList.jsx
// Equipment of Note — liste CRUD (name + description + effect).

import React from 'react';

const EMPTY_ITEM = { name: '', description: '', effect: '' };

const ItemsList = ({ items = [], editMode, onChange }) => {
    const add    = () => onChange?.([...items, { ...EMPTY_ITEM, _tempId: Date.now() }]);
    const remove = (idx) => onChange?.(items.filter((_, i) => i !== idx));
    const update = (idx, field, value) =>
        onChange?.(items.map((t, i) => i === idx ? { ...t, [field]: value } : t));

    return (
        <div>
            <div className="ac-section-header">Équipement notable</div>
            {items.length === 0 && !editMode && (
                <p className="ac-text-muted text-center py-2">—</p>
            )}
            <table className="ac-table">
                {items.length > 0 && (
                    <thead>
                    <tr>
                        <th style={{ width: '25%' }}>Name</th>
                        <th style={{ width: '35%' }}>Description</th>
                        <th>Effet</th>
                        {editMode && <th style={{ width: 32 }} />}
                    </tr>
                    </thead>
                )}
                <tbody>
                {items.map((item, idx) => (
                    <tr key={item.id ?? item._tempId ?? idx}>
                        <td>
                            {editMode
                                ? <input value={item.name} onChange={e => update(idx, 'name', e.target.value)} className="ac-input" placeholder="Nom" />
                                : <span style={{ fontFamily: 'var(--ac-font-title)', fontSize: '0.82rem', color: 'var(--ac-text)' }}>{item.name}</span>}
                        </td>
                        <td>
                            {editMode
                                ? <input value={item.description} onChange={e => update(idx, 'description', e.target.value)} className="ac-input" placeholder="Description" />
                                : <span className="ac-text-muted" style={{ fontSize: '0.8rem' }}>{item.description || '—'}</span>}
                        </td>
                        <td>
                            {editMode
                                ? <input value={item.effect} onChange={e => update(idx, 'effect', e.target.value)} className="ac-input" placeholder="Effet" />
                                : <span style={{ fontSize: '0.8rem', color: 'var(--ac-text)' }}>{item.effect || '—'}</span>}
                        </td>
                        {editMode && (
                            <td>
                                <button onClick={() => remove(idx)} className="ac-btn ac-btn-danger" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}>✕</button>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
            {editMode && (
                <button onClick={add} className="ac-btn ac-btn-secondary mt-2 w-full">+ Ajouter un équipement</button>
            )}
        </div>
    );
};

export default ItemsList;
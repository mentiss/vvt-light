// src/client/src/systems/achtung/components/WeaponsTable.jsx
// Table CRUD des armes — colonnes officielles fiche.

import React from 'react';
import { WEAPON_RANGES, WEAPON_SIZES } from '../config.jsx';

const EMPTY_WEAPON = { name: '', focus: '', range: 'Close', damage: 0, salvo: '', size: 'Minor', qualities: '' };

const WeaponsTable = ({ weapons = [], editMode, onChange, onRollDamage }) => {
    const add    = () => onChange?.([...weapons, { ...EMPTY_WEAPON, _tempId: Date.now() }]);
    const remove = (idx) => onChange?.(weapons.filter((_, i) => i !== idx));
    const update = (idx, field, value) =>
        onChange?.(weapons.map((w, i) => i === idx ? { ...w, [field]: value } : w));

    return (
        <div>
            <div className="ac-section-header">Armes</div>
            <div style={{ overflowX: 'auto' }}>
                <table className="ac-table" style={{ minWidth: 600 }}>
                    <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Focus</th>
                        <th>Portée</th>
                        <th style={{ textAlign: 'center' }}>Dmg⚄</th>
                        <th>Salvo</th>
                        <th>Taille</th>
                        <th>Qualités</th>
                        <th />
                    </tr>
                    </thead>
                    <tbody>
                    {weapons.map((w, idx) => (
                        <tr key={w.id ?? w._tempId ?? idx}>
                            <td>
                                {editMode
                                    ? <input value={w.name} onChange={e => update(idx, 'name', e.target.value)} className="ac-input" placeholder="Nom" />
                                    : <span style={{ fontFamily: 'var(--ac-font-title)', fontSize: '0.82rem', color: 'var(--ac-text)' }}>{w.name}</span>}
                            </td>
                            <td>
                                {editMode
                                    ? <input value={w.focus} onChange={e => update(idx, 'focus', e.target.value)} className="ac-input" placeholder="ex : Armes de poing" />
                                    : <span className="ac-text-muted">{w.focus || '—'}</span>}
                            </td>
                            <td>
                                {editMode
                                    ? (
                                        <select value={w.range} onChange={e => update(idx, 'range', e.target.value)}
                                                className="ac-input" style={{ width: 'auto' }}>
                                            {WEAPON_RANGES.map(r => <option key={r}>{r}</option>)}
                                        </select>
                                    )
                                    : <span className="ac-text-muted">{w.range}</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                {editMode
                                    ? <input type="number" value={w.damage} min={0} onChange={e => update(idx, 'damage', parseInt(e.target.value) || 0)} className="ac-input-num" />
                                    : <span className="ac-value">{w.damage}</span>}
                            </td>
                            <td>
                                {editMode
                                    ? <input value={w.salvo} onChange={e => update(idx, 'salvo', e.target.value)} className="ac-input" placeholder="ex : Vicieux" />
                                    : <span className="ac-text-muted">{w.salvo || '—'}</span>}
                            </td>
                            <td>
                                {editMode
                                    ? (
                                        <select value={w.size} onChange={e => update(idx, 'size', e.target.value)}
                                                className="ac-input" style={{ width: 'auto' }}>
                                            {WEAPON_SIZES.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    )
                                    : <span className="ac-text-muted">{w.size}</span>}
                            </td>
                            <td>
                                {editMode
                                    ? <input value={w.qualities} onChange={e => update(idx, 'qualities', e.target.value)} className="ac-input" placeholder="ex : Fiable, Caché 1" />
                                    : <span className="ac-text-muted" style={{ fontSize: '0.75rem' }}>{w.qualities || '—'}</span>}
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                                <button
                                    onClick={() => onRollDamage?.(w)}
                                    className="ac-roll-btn"
                                    title={`Lancer dommages — ${w.name}`}
                                >⚄</button>
                                {editMode && (
                                    <button onClick={() => remove(idx)} className="ac-btn ac-btn-danger ml-1" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}>✕</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {weapons.length === 0 && (
                        <tr><td colSpan={8} className="ac-text-muted text-center py-2">—</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
            {editMode && (
                <button onClick={add} className="ac-btn ac-btn-secondary mt-2 w-full">+ Ajouter une arme</button>
            )}
        </div>
    );
};

export default WeaponsTable;
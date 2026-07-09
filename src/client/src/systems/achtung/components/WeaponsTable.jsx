// src/client/src/systems/achtung/components/WeaponsTable.jsx
import React, {useState} from 'react';
import {
    WEAPON_RANGES,
    RANGE_LABELS,
    WEAPON_SIZES,
    SALVO_EFFECTS,
    SALVO_HAS_VALUE,
    SALVO_LABELS,
    WEAPON_QUALITIES,
    QUALITY_LABELS,
    UNARMED_WEAPON
} from '../config.jsx';
import WeaponCatalogModal from "../dice/WeaponCatalogModal.jsx";

const EMPTY_WEAPON = { name: '', focus: '', range: 'close', damage: 0, salvo: [], size: 'Minor', qualities: [] };

// ── Pill multi-select générique ────────────────────────────────────────────
const PillMultiSelect = ({ options, labels, values, hasValue = [], onToggle, onSetValue }) => (
    <div className="flex flex-wrap gap-1">
        {options.map(opt => {
            const entry  = values.find(v => (typeof v === 'string' ? v === opt : v.key === opt));
            const active = !!entry;
            const showStepper = active && hasValue.includes(opt);
            return (
                <div key={opt} className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={() => onToggle(opt)}
                        className={`ac-select-btn${active ? ' selected' : ''}`}
                        style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}
                    >
                        {labels[opt] ?? opt}
                    </button>
                    {showStepper && (
                        <div className="flex items-center" style={{ fontSize: '0.65rem' }}>
                            <button type="button" onClick={() => onSetValue(opt, Math.max(1, (entry.value ?? 1) - 1))} className="ac-btn ac-btn-ghost px-1">−</button>
                            <span className="w-4 text-center">{entry.value ?? 1}</span>
                            <button type="button" onClick={() => onSetValue(opt, (entry.value ?? 1) + 1)} className="ac-btn ac-btn-ghost px-1">+</button>
                        </div>
                    )}
                </div>
            );
        })}
    </div>
);

const WeaponsTable = ({ weapons = [], editMode, onChange, onRollDamage, onRollAttack }) => {
    const add    = () => onChange?.([...weapons, { ...EMPTY_WEAPON, _tempId: Date.now() }]);
    const remove = (idx) => onChange?.(weapons.filter((_, i) => i !== idx));
    const update = (idx, field, value) =>
        onChange?.(weapons.map((w, i) => i === idx ? { ...w, [field]: value } : w));

    const [catalogOpen, setCatalogOpen] = useState(false);

    const addFromCatalog = (weaponData) =>
        onChange?.([...weapons, { ...weaponData, _tempId: Date.now() }]);

    const toggleQuality = (idx, w, key) => {
        const clean = (w.qualities ?? []).filter(k => WEAPON_QUALITIES.includes(k));
        const has   = clean.includes(key);
        update(idx, 'qualities', has ? clean.filter(k => k !== key) : [...clean, key]);
    };

    const toggleSalvo = (idx, w, key) => {
        const clean = (w.salvo ?? []).filter(s => s && typeof s === 'object' && SALVO_EFFECTS.includes(s.key));
        const has   = clean.some(s => s.key === key);
        update(idx, 'salvo', has
            ? clean.filter(s => s.key !== key)
            : [...clean, SALVO_HAS_VALUE.includes(key) ? { key, value: 1 } : { key }]);
    };

    const setSalvoValue = (idx, w, key, value) => {
        const clean = (w.salvo ?? []).filter(s => s && typeof s === 'object' && SALVO_EFFECTS.includes(s.key));
        update(idx, 'salvo', clean.map(s => s.key === key ? { ...s, value } : s));
    };

    const toggleEffect = (idx, w, key) => {
        const clean = (w.effect ?? []).filter(e => e && typeof e === 'object' && SALVO_EFFECTS.includes(e.key));
        const has   = clean.some(e => e.key === key);
        update(idx, 'effect', has
            ? clean.filter(e => e.key !== key)
            : [...clean, SALVO_HAS_VALUE.includes(key) ? { key, value: 1 } : { key }]);
    };

    const setEffectValue = (idx, w, key, value) => {
        const clean = (w.effect ?? []).filter(e => e && typeof e === 'object' && SALVO_EFFECTS.includes(e.key));
        update(idx, 'effect', clean.map(e => e.key === key ? { ...e, value } : e));
    };

    return (
        <div>
            <div className="ac-section-header flex items-center justify-between">
                <span>Armes</span>
                <button
                    onClick={() => setCatalogOpen(true)}
                    title="Catalogue d'armes"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'inherit',
                        fontSize: '0.85rem',
                        lineHeight: 1,
                        cursor: 'pointer',
                        padding: '0.1rem 0.3rem',
                    }}
                >
                    📖
                </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="ac-table" style={{ minWidth: 700 }}>
                    <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Focus</th>
                        <th>Portée</th>
                        <th style={{ textAlign: 'center' }}>Dmg⚄</th>
                        <th>Effet</th>
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
                                            {WEAPON_RANGES.map(r => <option key={r} value={r}>{RANGE_LABELS[r]}</option>)}
                                        </select>
                                    )
                                    : <span className="ac-text-muted">{RANGE_LABELS[w.range] ?? w.range}</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                {editMode
                                    ? <input type="number" value={w.damage} min={0} onChange={e => update(idx, 'damage', parseInt(e.target.value) || 0)} className="ac-input-num" />
                                    : <span className="ac-value">{w.damage}</span>}
                            </td>
                            <td>
                                {editMode
                                    ? (
                                        <PillMultiSelect
                                            options={SALVO_EFFECTS} labels={SALVO_LABELS} hasValue={SALVO_HAS_VALUE}
                                            values={w.effect ?? []}
                                            onToggle={key => toggleEffect(idx, w, key)}
                                            onSetValue={(key, value) => setEffectValue(idx, w, key, value)}
                                        />
                                    )
                                    : (
                                        <span className="ac-text-muted" style={{ fontSize: '0.72rem' }}>
                                            {(w.effect ?? []).length > 0
                                                ? w.effect.map(e => `${SALVO_LABELS[e.key] ?? e.key}${e.value ? ` (${e.value})` : ''}`).join(', ')
                                                : '—'}
                                        </span>
                                    )}
                            </td>
                            <td>
                                {editMode
                                    ? (
                                        <PillMultiSelect
                                            options={SALVO_EFFECTS} labels={SALVO_LABELS} hasValue={SALVO_HAS_VALUE}
                                            values={w.salvo ?? []}
                                            onToggle={key => toggleSalvo(idx, w, key)}
                                            onSetValue={(key, value) => setSalvoValue(idx, w, key, value)}
                                        />
                                    )
                                    : (
                                        <span className="ac-text-muted" style={{ fontSize: '0.72rem' }}>
                                            {(w.salvo ?? []).length > 0
                                                ? w.salvo.map(s => `${SALVO_LABELS[s.key] ?? s.key}${s.value ? ` (${s.value})` : ''}`).join(', ')
                                                : '—'}
                                        </span>
                                    )}
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
                                    ? (
                                        <PillMultiSelect
                                            options={WEAPON_QUALITIES} labels={QUALITY_LABELS}
                                            values={w.qualities ?? []}
                                            onToggle={key => toggleQuality(idx, w, key)}
                                            onSetValue={() => {}}
                                        />
                                    )
                                    : (
                                        <span className="ac-text-muted" style={{ fontSize: '0.75rem' }}>
                                            {(w.qualities ?? []).length > 0
                                                ? w.qualities.map(k => QUALITY_LABELS[k] ?? k).join(', ')
                                                : '—'}
                                        </span>
                                    )}
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                                {onRollAttack && (
                                    <button onClick={() => onRollAttack(w)} className="ac-roll-btn" title={`Attaque — ${w.name}`}>⚔</button>
                                )}
                                {onRollDamage && (
                                    <button onClick={() => onRollDamage(w)} className={`ac-roll-btn${onRollAttack ? ' ml-1' : ''}`} title={`Lancer dommages — ${w.name}`}>⚄</button>
                                )}
                                {editMode && (
                                    <button onClick={() => remove(idx)} className="ac-btn ac-btn-danger ml-1" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}>✕</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {/* Arme par défaut, toujours présente — non éditable */}
                    <tr style={{ opacity: 0.85 }}>
                        <td><span style={{ fontFamily: 'var(--ac-font-title)', fontSize: '0.82rem', color: 'var(--ac-text)' }}>{UNARMED_WEAPON.name}</span></td>
                        <td><span className="ac-text-muted">—</span></td>
                        <td><span className="ac-text-muted">{RANGE_LABELS[UNARMED_WEAPON.range]}</span></td>
                        <td style={{ textAlign: 'center' }}><span className="ac-value">{UNARMED_WEAPON.damage}</span></td>
                        <td><span className="ac-text-muted" style={{ fontSize: '0.72rem' }}>—</span></td>
                        <td><span className="ac-text-muted" style={{ fontSize: '0.72rem' }}>—</span></td>
                        <td><span className="ac-text-muted">{UNARMED_WEAPON.size}</span></td>
                        <td>
                            <span className="ac-text-muted" style={{ fontSize: '0.75rem' }}>
                                {UNARMED_WEAPON.qualities.map(k => QUALITY_LABELS[k] ?? k).join(', ')}
                            </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                            {onRollAttack && (
                                <button onClick={() => onRollAttack(UNARMED_WEAPON)} className="ac-roll-btn" title="Attaque — Main nue">⚔</button>
                            )}
                            {onRollDamage && (
                                <button onClick={() => onRollDamage(UNARMED_WEAPON)} className={`ac-roll-btn${onRollAttack ? ' ml-1' : ''}`} title="Lancer dommages — Main nue">⚄</button>
                            )}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            {editMode && (
                <button onClick={add} className="ac-btn ac-btn-secondary mt-2 w-full">+ Ajouter une arme</button>
            )}
            {catalogOpen && (
                <WeaponCatalogModal onClose={() => setCatalogOpen(false)} onSelect={addFromCatalog} />
            )}
        </div>
    );
};

export default WeaponsTable;
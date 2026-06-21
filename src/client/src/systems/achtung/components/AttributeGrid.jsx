// src/client/src/systems/achtung/components/AttributeGrid.jsx
import React from 'react';
import { ATTRIBUTES, getBonusDamage } from '../config.jsx';

const AttributeGrid = ({ attributes, editMode, onChange, onRoll }) => {
    const getVal = (key) => attributes?.find(a => a.key === key)?.value ?? 0;

    const handleChange = (key, raw) => {
        const val  = Math.max(0, Math.min(20, parseInt(raw) || 0));
        const next = (attributes ?? ATTRIBUTES.map(a => ({ key: a.key, value: 0 }))).map(a =>
            a.key === key ? { ...a, value: val, bonusDamage: getBonusDamage(val) } : a
        );
        onChange?.(next);
    };

    return (
        <div>
            <div className="ac-section-header">Attributs</div>
            <div className="ac-attr-grid">
                {ATTRIBUTES.map(({ key, label }) => {
                    const value = getVal(key);
                    const bonus = getBonusDamage(value);
                    return (
                        <div
                            key={key}
                            className="ac-attr-cell"
                            onClick={() => !editMode && onRoll?.({ attrKey: key })}
                            style={{ cursor: !editMode && onRoll ? 'pointer' : 'default' }}
                        >
                            <span className="ac-label">{label}</span>
                            {editMode ? (
                                <input
                                    type="number"
                                    value={value}
                                    min={0} max={20}
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => handleChange(key, e.target.value)}
                                    className="ac-input-num mt-1"
                                />
                            ) : (
                                <span className="ac-attr-value">{value}</span>
                            )}
                            {(key === 'brawn' || key === 'insight') && (
                                <span className="ac-attr-bonus">{bonus > 0 && `+${bonus}⚄`}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AttributeGrid;
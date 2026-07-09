// src/client/src/systems/fabula/components/layout/AttributesPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Panneau des 4 attributs — reproduit la mise en page de la fiche officielle :
// une vraie grille (CSS Grid, pas du flex bricolé) avec colonnes BASE/ACTUEL
// alignées verticalement, et les statuts partagés (Enragé, Empoisonné) qui
// s'étendent sur 2 lignes via grid-row: span 2 — équivalent de l'accolade
// visuelle du PDF officiel, sans avoir besoin d'un vrai <table>.
//
// Colonnes : [Attribut | Base | Actuel | Statut simple | Statut partagé]
// Lignes   : [Header | DEX | INT | PUI | VOL]
//   DEX+INT partagent la colonne 5, lignes 2-3 (Enragé)
//   PUI+VOL partagent la colonne 5, lignes 4-5 (Empoisonné)
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { getAttributeAffliction, effectiveDieSize } from '../../config.jsx';

const ATTRS = [
    { key: 'dex', field: 'dexDe', label: 'Dextérité',  single: 'ralenti',    singleLabel: 'Ralenti' },
    { key: 'int', field: 'intDe', label: 'Intuition',  single: 'etourdi',    singleLabel: 'Étourdi' },
    { key: 'pui', field: 'puiDe', label: 'Puissance',  single: 'affaibli',   singleLabel: 'Affaibli' },
    { key: 'vol', field: 'volDe', label: 'Volonté',    single: 'traumatise', singleLabel: 'Traumatisé' },
];

const DIE_VALUES = [6, 8, 10, 12];

const AttributesPanel = ({ character, editMode, onFieldChange, onQuickUpdate, onRollAttribute }) => {
    const alterations = character.alterationsEtat ?? [];

    const toggleSingle = (attrKey, key) => {
        const has = alterations.includes(key);
        const sharedKey = attrKey === 'dex' || attrKey === 'int' ? 'enrage' : 'empoisonne';
        const next = has
            ? alterations.filter(a => a !== key)
            : [...alterations.filter(a => a !== sharedKey), key];
        onQuickUpdate({ alterationsEtat: next });
    };

    const toggleShared = (pairKeys, sharedKey) => {
        const has = alterations.includes(sharedKey);
        const next = has
            ? alterations.filter(a => a !== sharedKey)
            : [...alterations.filter(a => !pairKeys.includes(a)), sharedKey];
        onQuickUpdate({ alterationsEtat: next });
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto auto',
        rowGap: '0.4rem',
        columnGap: '0.5rem',
        alignItems: 'stretch',
    };

    return (
        <div className="bg-surface border border-default rounded-lg p-3">
            <h3 className="fu-font-title text-primary text-sm mb-2">Attributs & Altérations</h3>

            <div style={gridStyle}>
                {/* En-tête */}
                <div />
                <div className="text-[10px] text-muted text-center uppercase self-center">Base</div>
                <div className="text-[10px] text-muted text-center uppercase self-center">Actuel</div>
                <div />
                <div />

                {ATTRS.map((a, i) => {
                    const rowIndex     = i + 2; // ligne 1 = header
                    const affliction   = getAttributeAffliction(alterations, a.key);
                    const currentSize  = effectiveDieSize(character[a.field], !!affliction);
                    const singleActive = alterations.includes(a.single);
                    const isFirstOfPair = i % 2 === 0; // DEX ou PUI → porte le statut partagé

                    return (
                        <React.Fragment key={a.key}>
                            <button type="button" disabled={editMode}
                                    onClick={() => onRollAttribute?.(a.key)}
                                    style={{ gridColumn: 1, gridRow: rowIndex }}
                                    className={`text-sm text-left bg-surface-alt rounded px-2 flex items-center ${
                                        !editMode ? 'hover:text-primary cursor-pointer' : 'cursor-default'
                                    }`}>
                                {a.label}
                            </button>

                            {editMode ? (
                                <div style={{ gridColumn: 2, gridRow: rowIndex }} className="flex gap-0.5 items-center">
                                    {DIE_VALUES.map(v => (
                                        <button key={v} type="button" onClick={() => onFieldChange(a.field, v)}
                                                className={`fu-die-badge border text-[10px] ${
                                                    character[a.field] === v ? 'bg-primary text-white border-primary' : 'bg-default border-default'
                                                }`}>
                                            d{v}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ gridColumn: 2, gridRow: rowIndex }} className="flex items-center justify-center">
                                    <span className="fu-die-badge bg-default border border-default">d{character[a.field]}</span>
                                </div>
                            )}

                            <div style={{ gridColumn: 3, gridRow: rowIndex }} className="flex items-center justify-center">
                                <span className={`fu-die-badge border ${affliction ? 'bg-danger text-white border-danger' : 'bg-default border-default'}`}>
                                    d{currentSize}
                                </span>
                            </div>

                            <button type="button"
                                    onClick={() => toggleSingle(a.key, a.single)}
                                    style={{ gridColumn: 4, gridRow: rowIndex }}
                                    className={`px-2 py-0.5 rounded-full text-xs border whitespace-nowrap self-center cursor-pointer ${
                                        singleActive ? 'bg-danger text-white border-danger' : 'bg-default border-default text-muted'
                                    }`}>
                                {a.singleLabel}
                            </button>

                            {isFirstOfPair && (
                                <button type="button"
                                        onClick={() => toggleShared(
                                            i === 0 ? ['ralenti', 'etourdi'] : ['affaibli', 'traumatise'],
                                            i === 0 ? 'enrage' : 'empoisonne'
                                        )}
                                        style={{ gridColumn: 5, gridRow: `${rowIndex} / span 2`, alignSelf: 'center' }}
                                        className={`px-2 py-1 rounded-full text-xs border flex items-center justify-center text-center leading-tight cursor-pointer ${
                                            alterations.includes(i === 0 ? 'enrage' : 'empoisonne')
                                                ? 'bg-danger text-white border-danger'
                                                : 'bg-default border-default text-muted'
                                        }`}>
                                    {i === 0 ? 'Enragé' : 'Empoisonné'}
                                </button>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default AttributesPanel;
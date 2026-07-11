// src/client/src/systems/fabula/components/layout/AttributesPanel.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Panneau des 4 attributs — refonte retours MJ :
//   • Plus de colonne BASE : le dé de base s'affiche en petit à droite du nom,
//     seule la taille EFFECTIVE reste en badge (effectiveAttrDie : base +
//     boosts − altérations, borné [d6, d12]).
//   • Chevrons ▲/▼ à gauche du dé : boosts de taille de dé (armes, sorts…),
//     persistés dans boostsAttributs, cumul libre. ▼ n'apparaît qu'à partir
//     de +1. Actifs hors mode édition (action de jeu, comme les altérations).
//   • Altérations CUMULATIVES et indépendantes (règle officielle) : chaque
//     toggle s'active/désactive sans jamais retirer les autres — Empoisonné
//     n'écrase plus Affaibli/Traumatisé, chaque altération active réduit d'un
//     cran, plancher d6. Tous les états actifs restent visibles simultanément.
//
// Colonnes : [Attribut (base) | Boost ▲▼ | Effectif | Statut simple | Statut partagé]
//   DEX+INT partagent la colonne 5, lignes 1-2 (Enragé)
//   PUI+VOL partagent la colonne 5, lignes 3-4 (Empoisonné)
// En mode édition, les colonnes 2-3 laissent place au sélecteur de dé de base.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { getAttributeAfflictions, effectiveAttrDie } from '../../config.jsx';

const ATTRS = [
    { key: 'dex', field: 'dexDe', label: 'Dextérité',  single: 'ralenti',    singleLabel: 'Ralenti' },
    { key: 'int', field: 'intDe', label: 'Intuition',  single: 'etourdi',    singleLabel: 'Étourdi' },
    { key: 'pui', field: 'puiDe', label: 'Puissance',  single: 'affaibli',   singleLabel: 'Affaibli' },
    { key: 'vol', field: 'volDe', label: 'Volonté',    single: 'traumatise', singleLabel: 'Traumatisé' },
];

const DIE_VALUES = [6, 8, 10, 12];

const AttributesPanel = ({ character, editMode, onFieldChange, onQuickUpdate, onRollAttribute }) => {
    const alterations = character.alterationsEtat ?? [];
    const boosts      = character.boostsAttributs ?? {};

    // Toggle pur : ajoute/retire UNE altération sans toucher aux autres —
    // les états se cumulent (l'ancien comportement exclusif était un bug).
    const toggleAlteration = (key) => {
        const next = alterations.includes(key)
            ? alterations.filter(a => a !== key)
            : [...alterations, key];
        onQuickUpdate({ alterationsEtat: next });
    };

    const adjustBoost = (attrKey, delta) => {
        const next = Math.max(0, (boosts[attrKey] ?? 0) + delta);
        onQuickUpdate({ boostsAttributs: { ...boosts, [attrKey]: next } });
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
                {ATTRS.map((a, i) => {
                    const rowIndex      = i + 1;
                    const afflictions   = getAttributeAfflictions(alterations, a.key);
                    const boost         = boosts[a.key] ?? 0;
                    const baseSize      = character[a.field];
                    const currentSize   = effectiveAttrDie(character, a.key);
                    const singleActive  = alterations.includes(a.single);
                    const isFirstOfPair = i % 2 === 0; // DEX ou PUI → porte le statut partagé
                    const badgeTone = currentSize < baseSize
                        ? 'bg-danger text-white border-danger'
                        : currentSize > baseSize
                            ? 'bg-success text-white border-success'
                            : 'bg-default border-default';

                    return (
                        <React.Fragment key={a.key}>
                            {/* Col 1 — nom + dé de base */}
                            <button type="button" disabled={editMode}
                                    onClick={() => onRollAttribute?.(a.key)}
                                    style={{ gridColumn: 1, gridRow: rowIndex }}
                                    className={`text-sm text-left bg-surface-alt rounded px-2 flex items-center gap-1.5 ${
                                        !editMode ? 'hover:text-primary cursor-pointer' : 'cursor-default'
                                    }`}>
                                {a.label}
                                <span className="text-[10px] text-muted">(d{baseSize})</span>
                            </button>

                            {editMode ? (
                                /* Cols 2-3 — sélecteur du dé de base */
                                <div style={{ gridColumn: '2 / span 2', gridRow: rowIndex }} className="flex gap-0.5 items-center">
                                    {DIE_VALUES.map(v => (
                                        <button key={v} type="button" onClick={() => onFieldChange(a.field, v)}
                                                className={`fu-die-badge border text-[10px] ${
                                                    baseSize === v ? 'bg-primary text-white border-primary' : 'bg-default border-default'
                                                }`}>
                                            d{v}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {/* Col 2 — chevrons de boost */}
                                    <div style={{ gridColumn: 2, gridRow: rowIndex }} className="flex flex-col items-center justify-center">
                                        <button type="button" onClick={() => adjustBoost(a.key, 1)}
                                                title="Augmenter la taille de dé (bonus d'arme, sort…)"
                                                className="text-xs leading-none px-1 text-muted hover:text-success cursor-pointer">
                                            ▲
                                        </button>
                                        {boost >= 1 && (
                                            <button type="button" onClick={() => adjustBoost(a.key, -1)}
                                                    title="Retirer un cran de bonus"
                                                    className="text-xs leading-none px-1 text-success hover:text-danger cursor-pointer">
                                                ▼
                                            </button>
                                        )}
                                    </div>

                                    {/* Col 3 — dé effectif, aussi cliquable pour lancer le test (comportement
                                        intuitif attendu par les joueurs : cliquer la valeur de dé, pas
                                        seulement le nom de l'attribut). */}
                                    <button type="button" onClick={() => onRollAttribute?.(a.key)}
                                            style={{ gridColumn: 3, gridRow: rowIndex }}
                                            className="flex items-center justify-center cursor-pointer"
                                            title={`Lancer le test — base d${baseSize}${boost ? ` · boost +${boost}` : ''}${afflictions.length ? ` · ${afflictions.length} altération(s)` : ''}`}>
                                        <span className={`fu-die-badge border ${badgeTone} hover:brightness-110`}>
                                            d{currentSize}
                                        </span>
                                    </button>
                                </>
                            )}

                            {/* Col 4 — altération simple */}
                            <button type="button"
                                    onClick={() => toggleAlteration(a.single)}
                                    style={{ gridColumn: 4, gridRow: rowIndex }}
                                    className={`px-2 py-0.5 rounded-full text-xs border whitespace-nowrap self-center cursor-pointer ${
                                        singleActive ? 'bg-danger text-white border-danger' : 'bg-default border-default text-muted'
                                    }`}>
                                {a.singleLabel}
                            </button>

                            {/* Col 5 — altération partagée (span 2 lignes) */}
                            {isFirstOfPair && (
                                <button type="button"
                                        onClick={() => toggleAlteration(i === 0 ? 'enrage' : 'empoisonne')}
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
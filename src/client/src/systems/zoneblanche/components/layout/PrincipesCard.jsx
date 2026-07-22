// src/client/src/systems/zoneblanche/components/layout/PrincipesCard.jsx
// Carte Principes : rang + maxime affichée sous le rang.
// Même logique que PrincipleRow (Dune) : la maxime est visible quand le
// Principe est débloqué (majeur de l'archétype, ou rang ≥ 6).
//
// Le clic sur le rang lance un jet — action de jeu, donc TOUJOURS active,
// y compris hors mode édition (principe plateforme).
//
// Props :
//   char, editMode, set, onRoll(principeKey)

import React from 'react';
import { PRINCIPES, getArchetype, getMaximesForArchetype } from '../../config.jsx';

const SEUIL_MAXIME = 6;

const PrincipeRow = ({ principe, rang, maxime, debloque, options, editMode, onRankChange, onMaximeChange, onRoll }) => (
    <div className="zb-stat-row">
        <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
                <div className="font-semibold text-default">{principe.label}</div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {editMode && (
                    <button type="button" onClick={() => onRankChange(rang - 1)}
                            className="zb-btn-ghost w-8 h-8 rounded-sm font-bold" disabled={rang <= 0}>−</button>
                )}

                {/* Rang cliquable = jet de dés (toujours actif) */}
                <button type="button" onClick={() => onRoll?.(principe.key)}
                        className="zb-rank" title={`Lancer un jet avec ${principe.label}`}>
                    {rang}
                </button>

                {editMode && (
                    <button type="button" onClick={() => onRankChange(rang + 1)}
                            className="zb-btn-ghost w-8 h-8 rounded-sm font-bold" disabled={rang >= 12}>+</button>
                )}
            </div>
        </div>

        {/* Maxime — sous le rang, comme la spécialisation chez Dune */}
        {debloque && (
            <div className="mt-2">
                {editMode ? (
                    <div className="space-y-2">
                        <textarea
                            value={maxime}
                            onChange={e => onMaximeChange(e.target.value)}
                            rows={2}
                            className="zb-input w-full px-3 py-2 rounded-sm text-sm"
                            placeholder="Maxime liée à ce Principe…"
                        />
                        {options.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {options.map(text => (
                                    <button key={text} type="button" onClick={() => onMaximeChange(text)}
                                            className={`zb-pill px-2.5 py-1 rounded-sm text-xs ${maxime === text ? 'is-selected' : ''}`}
                                            title={text}>
                                        {text.length > 48 ? `${text.slice(0, 48)}…` : text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    maxime
                        ? <p className="zb-maxime">« {maxime} »</p>
                        : <p className="text-sm text-muted italic">Maxime à définir.</p>
                )}
            </div>
        )}
    </div>
);

const PrincipesCard = ({ char, editMode, set, onRoll }) => {
    const archetype = getArchetype(char?.archetype);
    const principes = char?.principes ?? [];

    const byKey = Object.fromEntries(principes.map(p => [p.key, p]));

    const update = (key, patch) => {
        set('principes', PRINCIPES.map(def => {
            const current = byKey[def.key] ?? { key: def.key, rang: 3, maxime: '' };
            return def.key === key ? { ...current, ...patch } : current;
        }));
    };

    return (
        <section>
            <div className="zb-eyebrow mb-3">Principes</div>
            <div className="space-y-3">
                {PRINCIPES.map(def => {
                    const entry    = byKey[def.key] ?? { rang: 3, maxime: '' };
                    const rang     = entry.rang ?? 3;
                    const debloque = def.key === archetype?.principeMajeur || rang >= SEUIL_MAXIME;
                    const options  = archetype ? getMaximesForArchetype(archetype.key, def.key) : [];

                    return (
                        <PrincipeRow
                            key={def.key}
                            principe={def}
                            rang={rang}
                            maxime={entry.maxime ?? ''}
                            debloque={debloque}
                            options={options}
                            editMode={editMode}
                            onRankChange={val => update(def.key, { rang: Math.max(0, Math.min(12, val)) })}
                            onMaximeChange={val => update(def.key, { maxime: val })}
                            onRoll={onRoll}
                        />
                    );
                })}
            </div>
        </section>
    );
};

export default PrincipesCard;
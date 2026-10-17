// src/client/src/systems/vikings/components/layout/RunesSection.jsx
// Runes en bas de la fiche (spec_vikings.md §8.1), remplace l'ancien onglet.
// Visible si le personnage a un livre de sort ou au moins une rune (toujours
// en mode édition). Niveaux modifiables en mode édition (ou par l'évolution).

import React, { useState } from 'react';
import { RUNES, RUNE_LEVELS } from '../../config/runes.js';
import { getRunePoints } from '../../config/rules.js';

const levelOf = (char, name) => char.runes?.find(r => r.name === name)?.level ?? 0;

// Niveau 0 : la rune est retirée de la fiche
const withRuneLevel = (runes, name, level) => {
    const clamped = Math.max(0, Math.min(5, level));
    const exists  = runes.some(r => r.name === name);
    if (!clamped) return runes.filter(r => r.name !== name);
    return exists
        ? runes.map(r => (r.name === name ? { ...r, level: clamped } : r))
        : [...runes, { name, level: clamped }];
};

const RunesSection = ({ char, editMode, set }) => {
    const [showFuthark, setShowFuthark] = useState(false);
    const points = getRunePoints(char);
    const known  = RUNES.filter(r => levelOf(char, r.name) >= 1);

    if (!editMode && points.total === 0 && known.length === 0) return null;

    const changeLevel = (name, delta) =>
        set('runes', withRuneLevel(char.runes ?? [], name, levelOf(char, name) + delta));

    return (
        <div className="bg-surface rounded-lg p-3 border-2 border-default">
            <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-sm font-bold text-default">Runes</h3>
                <span className={`text-xs ${points.available < 0 ? 'text-danger' : 'text-muted'}`}>
                    Livre de sort : {points.spent}/{points.total} — {points.available} disponible{points.available > 1 ? 's' : ''}
                </span>
            </div>
            <p className="text-[11px] text-muted italic mb-2">
                La rune est une permission, jamais un bonus : le jet se fait sur une compétence pratique (Sculpteur, Chant, Ferronnerie…).
            </p>

            {known.length === 0 ? (
                <p className="text-xs text-muted italic">Aucune rune connue.</p>
            ) : (
                <div className="space-y-1">
                    {known.map(r => {
                        const level = levelOf(char, r.name);
                        return (
                            <div key={r.name} className="flex items-start gap-2 bg-default rounded p-1.5 text-xs">
                                <span className="text-2xl leading-none text-primary w-7 text-center">{r.symbol}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-default">{r.name} — niveau {level}</div>
                                    <div className="text-muted">{r.esoteric}</div>
                                    <div className="text-default">{RUNE_LEVELS[level]}</div>
                                </div>
                                {editMode && (
                                    <div className="flex gap-1 shrink-0">
                                        <button onClick={() => changeLevel(r.name, -1)} className="w-4 h-4 bg-primary rounded-full font-bold text-default leading-none">-</button>
                                        <button onClick={() => changeLevel(r.name, 1)} disabled={level >= 5} className="w-4 h-4 bg-primary rounded-full font-bold text-default leading-none disabled:opacity-30">+</button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <button onClick={() => setShowFuthark(v => !v)} className="mt-2 text-xs text-primary hover:underline">
                {showFuthark ? '▾' : '▸'} Futhark complet
            </button>
            {showFuthark && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 mt-1">
                    {RUNES.map(r => {
                        const level = levelOf(char, r.name);
                        return (
                            <div key={r.name} className={`flex items-center gap-1.5 rounded p-1 text-[11px] ${level ? 'bg-primary/10' : 'bg-default'}`}>
                                <span className="text-lg leading-none text-primary w-5 text-center">{r.symbol}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-default truncate">{r.name} ({r.letter})</div>
                                    <div className="text-muted truncate" title={`${r.literal} — ${r.esoteric}`}>{r.literal}</div>
                                </div>
                                {editMode && level === 0 && (
                                    <button onClick={() => changeLevel(r.name, 1)} className="w-4 h-4 bg-primary rounded-full font-bold text-default leading-none" title="Apprendre">+</button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RunesSection;

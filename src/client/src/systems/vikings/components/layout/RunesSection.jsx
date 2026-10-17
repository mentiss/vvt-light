// src/client/src/systems/vikings/components/layout/RunesSection.jsx
// Runes en bas de la fiche (spec_vikings.md §8.1).
// Visible si le personnage a un livre de sort ou au moins une rune (toujours
// en mode édition). Niveaux modifiables en mode édition (ou par l'évolution).

import React, { useState } from 'react';
import { RUNES, RUNE_LEVELS } from '../../config/runes.js';
import { getRunePoints } from '../../config/rules.js';
import VkPanel from '../ui/VkPanel.jsx';
import VkIcon from '../ui/VkIcon.jsx';

const levelOf = (char, name) => char.runes?.find(r => r.name === name)?.level ?? 0;

// Niveau 0 : la rune est retirée de la fiche
const withRuneLevel = (runes, name, level) => {
    const clamped = Math.max(0, Math.min(5, level));
    if (!clamped) return runes.filter(r => r.name !== name);
    return runes.some(r => r.name === name)
        ? runes.map(r => (r.name === name ? { ...r, level: clamped } : r))
        : [...runes, { name, level: clamped }];
};

const RunesSection = ({ char, editMode, set, className = '' }) => {
    const [showFuthark, setShowFuthark] = useState(false);
    const points = getRunePoints(char);
    const known  = RUNES.filter(r => levelOf(char, r.name) >= 1);

    if (!editMode && points.total === 0 && known.length === 0) return null;

    const changeLevel = (name, delta) =>
        set('runes', withRuneLevel(char.runes ?? [], name, levelOf(char, name) + delta));

    return (
        <VkPanel className={className}>
            <div className="vk-section-title">
                Runes
                <span className={`vk-font-body text-sm ${points.available < 0 ? 'text-danger' : 'text-muted'}`}>
                    Livre de sort {points.spent}/{points.total} — {points.available} disponible{points.available > 1 ? 's' : ''}
                </span>
            </div>
            <p className="text-sm text-muted italic mb-3">
                La rune est une permission, jamais un bonus : le jet se fait sur une compétence pratique (Sculpteur, Chant, Ferronnerie…).
            </p>

            {known.length === 0 ? (
                <p className="text-sm text-muted italic">Aucune rune connue.</p>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {known.map(r => {
                        const level = levelOf(char, r.name);
                        return (
                            <div key={r.name} className="vk-rune-card">
                                <span className="vk-rune text-3xl w-8 text-center">{r.symbol}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold">{r.name} — niveau {level}</div>
                                    <div className="text-xs text-muted">{r.esoteric}</div>
                                    <div className="text-sm">{RUNE_LEVELS[level]}</div>
                                </div>
                                {editMode && (
                                    <div className="vk-stepper shrink-0">
                                        <button type="button" onClick={() => changeLevel(r.name, -1)}><VkIcon name="minus" /></button>
                                        <button type="button" onClick={() => changeLevel(r.name, 1)} disabled={level >= 5}><VkIcon name="plus" /></button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="vk-sep-line" />
            <button type="button" onClick={() => setShowFuthark(v => !v)} className="text-sm text-primary hover:underline">
                {showFuthark ? '▾' : '▸'} Futhark complet
            </button>
            {showFuthark && (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2 mt-2">
                    {RUNES.map(r => {
                        const level = levelOf(char, r.name);
                        return (
                            <div key={r.name} className={`vk-rune-card ${level ? '' : 'opacity-70'}`} title={`${r.literal} — ${r.esoteric}`}>
                                <span className="vk-rune text-2xl w-6 text-center">{r.symbol}</span>
                                <div className="flex-1 min-w-0 text-xs">
                                    <div className="font-bold truncate">{r.name} ({r.letter})</div>
                                    <div className="text-muted truncate">{r.literal}</div>
                                </div>
                                {editMode && level === 0 && (
                                    <button type="button" className="vk-btn vk-btn-icon vk-btn-sm" onClick={() => changeLevel(r.name, 1)} title="Apprendre">
                                        <VkIcon name="plus" />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </VkPanel>
    );
};

export default RunesSection;

// src/client/src/systems/cyberpunk/components/modals/MoveModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale de déclenchement d'un Move ou d'un jet de stat direct.
//
// Deux modes d'entrée :
//   mode='move' → déclenché depuis un move de la liste (move prop fourni)
//   mode='stat' → déclenché depuis un clic sur un hexagone de stat
//
// Flow :
//   1. Affiche le move/stat + description
//   2. Switch Synth (si le perso a du cyberware, toujours disponible)
//   3. Input modificateur manuel (entier, positif ou négatif)
//   4. Bouton Lancer → buildNotation → await roll() → affiche résultat
//
// Pas d'overlay local — diceAnimBridge singleton dans PlayerPage.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback, useRef } from 'react';
import { roll }       from '../../../../tools/diceEngine.js';
import { useFetch }   from '../../../../hooks/useFetch.js';
import { useSystem }  from '../../../../hooks/useSystem.js';
import cyberpunkConfig, { STAT_LABELS } from '../../config.jsx';

// ── Constantes ────────────────────────────────────────────────────────────────

const OUTCOME_CONFIG = {
    success: {
        label:  'Succès plein',
        desc:   'Tu fais ce que tu voulais faire.',
        cls:    'cp-outcome-success',
        icon:   '✦',
    },
    partial: {
        label:  'Succès partiel',
        desc:   'Ça marche, mais le MC introduit une complication, un coût ou un choix difficile.',
        cls:    'cp-outcome-partial',
        icon:   '◈',
    },
    failure: {
        label:  'Échec',
        desc:   'Le MC agit librement.',
        cls:    'cp-outcome-failure',
        icon:   '✕',
    },
};

const STAT_BADGE_CLASS = {
    cran:   'cp-stat-badge-cran',
    pro:    'cp-stat-badge-pro',
    chair:  'cp-stat-badge-chair',
    esprit: 'cp-stat-badge-esprit',
    style:  'cp-stat-badge-style',
    synth:  'cp-stat-badge-synth',
    cred:   'cp-stat-badge-cred',
};

// ── Composant ─────────────────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {'move'|'stat'} props.mode
 * @param {object}   [props.move]       — move complet (mode='move')
 * @param {string}   [props.statKey]    — clé de stat (mode='stat', ou override mode='move')
 * @param {object}   props.character    — personnage complet
 * @param {number|null} props.sessionId
 * @param {function} props.onClose
 */
const MoveModal = ({ mode, move, statKey, character, sessionId, onClose }) => {
    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();

    // Stat active : celle du move, ou celle cliquée en mode stat
    const activeStat = move?.stat ?? statKey ?? null;
    const statValue  = activeStat ? (character?.[activeStat] ?? 0) : 0;
    const hasCyberware = (character?.cyberware?.length ?? 0) > 0;

    // ── État local ────────────────────────────────────────────────────────────
    const [useSynth,   setUseSynth]   = useState(false);
    const [modifier,   setModifier]   = useState(0);
    const [rolling,    setRolling]    = useState(false);
    const [result,     setResult]     = useState(null);
    const [error,      setError]      = useState(null);

    // Stat effective après switch Synth
    const effectiveStat  = useSynth ? 'synth' : activeStat;
    const effectiveValue = useSynth
        ? (character?.synth ?? 0)
        : statValue;

    // Modificateur total : valeur de stat + saisie manuelle
    const totalModifier = (effectiveStat ? effectiveValue : 0) + modifier;

    // ── Roll ──────────────────────────────────────────────────────────────────

    const handleRoll = useCallback(async () => {
        if (rolling) return;
        setRolling(true);
        setError(null);
        setResult(null);

        try {
            const ctx = {
                apiBase,
                fetchFn:       fetchWithAuth,
                characterId:   character?.id ?? null,
                characterName: character?.prenom || character?.nom || 'Anonyme',
                sessionId:     sessionId ?? null,
                rollType:      'cyberpunk_move',
                label:         move?.name ?? (effectiveStat ? STAT_LABELS[effectiveStat] : 'Jet libre'),
                systemData: {
                    stat:      effectiveStat,
                    modifier:  totalModifier,
                    moveName:  move?.name ?? null,
                    useSynth,
                },
            };

            const notation = cyberpunkConfig.dice.buildNotation(ctx);
            const res      = await roll(notation, ctx, cyberpunkConfig.dice);
            setResult(res);
        } catch (err) {
            console.error('[MoveModal] roll error:', err);
            setError('Une erreur est survenue lors du jet.');
        } finally {
            setRolling(false);
        }
    }, [rolling, apiBase, fetchWithAuth, character, sessionId, effectiveStat, totalModifier, useSynth, move]);

    const handleRollAgain = () => {
        setResult(null);
        setError(null);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    const outcomeConfig = result ? OUTCOME_CONFIG[result.outcome] : null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={onClose}
        >
            <div
                className="rounded-xl shadow-2xl w-full max-w-md flex flex-col gap-0 overflow-hidden"
                style={{
                    background:   'var(--color-surface)',
                    border:       '1px solid var(--color-primary)',
                    boxShadow:    'var(--cp-glow-active)',
                    maxHeight:    '90vh',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div
                    className="flex items-start justify-between gap-3 px-5 py-4"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                    <div className="flex flex-col gap-1 min-w-0">
                        {/* Nom du move ou de la stat */}
                        <h3
                            className="font-bold text-lg leading-tight cp-font-ui"
                            style={{ color: 'var(--color-primary)' }}
                        >
                            {mode === 'move'
                                ? (move?.name ?? 'Manœuvre')
                                : `Jet — ${STAT_LABELS[activeStat] ?? 'Libre'}`
                            }
                        </h3>

                        {/* Badge stat */}
                        {effectiveStat && (
                            <div className="flex items-center gap-2">
                                <span className={`cp-stat-badge ${STAT_BADGE_CLASS[effectiveStat] ?? ''}`}>
                                    {STAT_LABELS[effectiveStat] ?? effectiveStat}
                                    {effectiveValue !== 0 && (
                                        <span className="ml-1 opacity-70">
                                            {effectiveValue > 0 ? `+${effectiveValue}` : effectiveValue}
                                        </span>
                                    )}
                                </span>
                                {useSynth && activeStat !== 'synth' && (
                                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                        (substitution Synth)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="text-xl leading-none flex-shrink-0"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        ✕
                    </button>
                </div>

                {/* ── Description du move ────────────────────────────────── */}
                {move?.description && !result && (
                    <div
                        className="px-5 py-3 text-sm overflow-y-auto cp-scroll"
                        style={{
                            color:      'var(--color-text-muted)',
                            borderBottom: '1px solid var(--color-border)',
                            maxHeight:  '140px',
                        }}
                    >
                        {move.description}
                    </div>
                )}

                {/* ── Corps : configuration ou résultat ──────────────────── */}
                <div className="px-5 py-4 flex flex-col gap-4">

                    {!result ? (
                        <>
                            {/* Switch Synth */}
                            {hasCyberware && activeStat && activeStat !== 'synth' && (
                                <label
                                    className="flex items-center gap-3 cursor-pointer select-none"
                                    style={{
                                        padding:       '10px 12px',
                                        borderRadius:  '8px',
                                        background:    'var(--color-surface-alt)',
                                        border:        `1px solid ${useSynth ? 'var(--color-primary)' : 'var(--color-border)'}`,
                                        transition:    'border-color 0.15s',
                                    }}
                                >
                                    <div
                                        className="relative flex-shrink-0"
                                        style={{ width: '36px', height: '20px' }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={useSynth}
                                            onChange={e => setUseSynth(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div
                                            className="w-full h-full rounded-full transition-colors"
                                            style={{
                                                background: useSynth ? 'var(--color-primary)' : 'var(--color-border)',
                                            }}
                                        />
                                        <div
                                            className="absolute top-1 rounded-full transition-transform"
                                            style={{
                                                width:      '12px',
                                                height:     '12px',
                                                background: 'white',
                                                left:       useSynth ? '20px' : '4px',
                                                transition: 'left 0.15s',
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                            Substitution Synth
                                        </span>
                                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            Utiliser Synth ({character?.synth >= 0 ? '+' : ''}{character?.synth ?? 0}) au lieu de {STAT_LABELS[activeStat]}
                                        </span>
                                    </div>
                                </label>
                            )}

                            {/* Modificateur manuel */}
                            <div className="flex flex-col gap-1.5">
                                <label
                                    className="text-xs font-semibold cp-font-ui uppercase tracking-wide"
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    Modificateur supplémentaire
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setModifier(m => m - 1)}
                                        className="w-9 h-9 rounded-lg font-bold text-lg flex items-center justify-center"
                                        style={{
                                            background: 'var(--color-surface-alt)',
                                            border:     '1px solid var(--color-border)',
                                            color:      'var(--color-text)',
                                        }}
                                    >
                                        −
                                    </button>
                                    <div
                                        className="flex-1 text-center font-mono font-bold text-lg"
                                        style={{ color: modifier === 0 ? 'var(--color-text-muted)' : modifier > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
                                    >
                                        {modifier > 0 ? `+${modifier}` : modifier}
                                    </div>
                                    <button
                                        onClick={() => setModifier(m => m + 1)}
                                        className="w-9 h-9 rounded-lg font-bold text-lg flex items-center justify-center"
                                        style={{
                                            background: 'var(--color-surface-alt)',
                                            border:     '1px solid var(--color-border)',
                                            color:      'var(--color-text)',
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                                {/* Récap total */}
                                <div
                                    className="text-center text-xs"
                                    style={{ color: 'var(--color-text-muted)' }}
                                >
                                    Total : 2d10
                                    {effectiveStat && effectiveValue !== 0 && (
                                        <span style={{ color: 'var(--color-primary)' }}>
                                            {effectiveValue > 0 ? ` +${effectiveValue}` : ` ${effectiveValue}`} ({STAT_LABELS[effectiveStat]})
                                        </span>
                                    )}
                                    {modifier !== 0 && (
                                        <span style={{ color: modifier > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                            {modifier > 0 ? ` +${modifier}` : ` ${modifier}`}
                                        </span>
                                    )}
                                    {totalModifier !== 0 && (
                                        <span style={{ color: 'var(--color-text)' }}>
                                            {' = '}2d10{totalModifier > 0 ? `+${totalModifier}` : totalModifier}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Erreur */}
                            {error && (
                                <p className="text-sm text-center" style={{ color: 'var(--color-danger)' }}>
                                    {error}
                                </p>
                            )}
                        </>
                    ) : (
                        /* ── Résultat ────────────────────────────────────── */
                        <div className="flex flex-col gap-3 items-center">
                            {/* Dés */}
                            <div className="flex items-center gap-3">
                                {(result.diceVals ?? []).map((v, i) => (
                                    <div
                                        key={i}
                                        className="w-12 h-12 rounded-lg flex items-center justify-center font-mono font-bold text-xl"
                                        style={{
                                            background: 'var(--color-surface-alt)',
                                            border:     '2px solid var(--color-primary)',
                                            color:      'var(--color-primary)',
                                            boxShadow:  'var(--cp-glow-cyan)',
                                        }}
                                    >
                                        {v}
                                    </div>
                                ))}
                                {result.modifier !== 0 && (
                                    <>
                                        <span className="text-muted text-lg font-mono">
                                            {result.modifier > 0 ? `+${result.modifier}` : result.modifier}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Total */}
                            <div
                                className="font-bold text-4xl font-mono cp-text-glow-cyan"
                            >
                                {result.total}
                            </div>

                            {/* Outcome */}
                            <div
                                className={`${outcomeConfig.cls} rounded-lg px-6 py-3 text-center w-full`}
                            >
                                <div className="font-bold text-lg cp-font-ui">
                                    {outcomeConfig.icon} {outcomeConfig.label}
                                </div>
                                <div className="text-sm mt-1 opacity-80">
                                    {outcomeConfig.desc}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Actions ────────────────────────────────────────────── */}
                <div
                    className="flex gap-2 px-5 py-4"
                    style={{ borderTop: '1px solid var(--color-border)' }}
                >
                    {!result ? (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                                style={{
                                    background: 'var(--color-surface-alt)',
                                    color:      'var(--color-text-muted)',
                                    border:     '1px solid var(--color-border)',
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleRoll}
                                disabled={rolling}
                                className="flex-1 py-2.5 rounded-lg text-sm font-bold cp-font-ui uppercase tracking-wide transition-all"
                                style={{
                                    background: rolling ? 'var(--color-border)' : 'var(--color-primary)',
                                    color:      rolling ? 'var(--color-text-muted)' : 'var(--color-bg)',
                                    border:     'none',
                                    boxShadow:  rolling ? 'none' : 'var(--cp-glow-cyan)',
                                    cursor:     rolling ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {rolling ? '…' : '⬡ Lancer'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleRollAgain}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold"
                                style={{
                                    background: 'var(--color-surface-alt)',
                                    color:      'var(--color-text)',
                                    border:     '1px solid var(--color-border)',
                                }}
                            >
                                Relancer
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-lg text-sm font-bold cp-font-ui uppercase tracking-wide"
                                style={{
                                    background: 'var(--color-primary)',
                                    color:      'var(--color-bg)',
                                    border:     'none',
                                    boxShadow:  'var(--cp-glow-cyan)',
                                }}
                            >
                                Fermer
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoveModal;
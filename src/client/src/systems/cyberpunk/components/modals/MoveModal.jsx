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
import Modal          from '../../../../components/ui/Modal.jsx';
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
    const statValue = move?.statValue ?? (activeStat ? (character?.[activeStat] ?? 0) : 0);
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

    const footer = !result ? (
        <>
            <button type="button" onClick={onClose} className="vtt-btn">Annuler</button>
            <button type="button" onClick={handleRoll} disabled={rolling} className="vtt-btn vtt-btn-primary">
                {rolling ? '…' : '⬡ Lancer'}
            </button>
        </>
    ) : (
        <>
            <button type="button" onClick={handleRollAgain} className="vtt-btn">Relancer</button>
            <button type="button" onClick={onClose} className="vtt-btn vtt-btn-primary">Fermer</button>
        </>
    );

    return (
        <Modal
            onClose={onClose}
            size="md"
            title={mode === 'move'
                ? (move?.name ?? 'Manœuvre')
                : `Jet — ${STAT_LABELS[activeStat] ?? 'Libre'}`
            }
            footer={footer}
        >
                {/* ── Badge stat ─────────────────────────────────────────── */}
                {effectiveStat && (
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`cp-stat-badge ${STAT_BADGE_CLASS[effectiveStat] ?? ''}`}>
                            {STAT_LABELS[effectiveStat] ?? effectiveStat}
                            {effectiveValue !== 0 && (
                                <span className="ml-1 opacity-70">
                                    {effectiveValue > 0 ? `+${effectiveValue}` : effectiveValue}
                                </span>
                            )}
                        </span>
                        {useSynth && (activeStat !== 'synth' && activeStat !== 'link') && (
                            <span className="text-xs text-muted">
                                (substitution Synth)
                            </span>
                        )}
                    </div>
                )}

                {/* ── Description du move (le corps de la modale défile) ─── */}
                {move?.description && !result && (
                    <p className="text-sm text-muted mb-4 whitespace-pre-line">
                        {move.description}
                    </p>
                )}

                {/* ── Corps : configuration ou résultat ──────────────────── */}
                <div className="flex flex-col gap-4">

                    {!result ? (
                        <>
                            {/* Switch Synth (pill, pas de case à cocher) */}
                            {hasCyberware && activeStat && activeStat !== 'synth' && activeStat !== 'link' && (
                                <div className="flex flex-col items-start gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setUseSynth(v => !v)}
                                        aria-pressed={useSynth}
                                        className={`vtt-pill ${useSynth ? 'is-selected' : ''}`}
                                    >
                                        Substitution Synth
                                    </button>
                                    <span className="text-xs text-muted">
                                        Utiliser Synth ({character?.synth >= 0 ? '+' : ''}{character?.synth ?? 0}) au lieu de {STAT_LABELS[activeStat]}
                                    </span>
                                </div>
                            )}

                            {/* Modificateur manuel */}
                            <div className="flex flex-col gap-1.5">
                                <span className="vtt-field-label">
                                    Modificateur supplémentaire
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setModifier(m => m - 1)}
                                        className="vtt-btn vtt-btn-icon font-bold text-lg"
                                    >
                                        −
                                    </button>
                                    <div
                                        className={`flex-1 text-center font-mono font-bold text-lg ${modifier === 0 ? 'text-muted' : modifier > 0 ? 'text-success' : 'text-danger'}`}
                                    >
                                        {modifier > 0 ? `+${modifier}` : modifier}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setModifier(m => m + 1)}
                                        className="vtt-btn vtt-btn-icon font-bold text-lg"
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
                                <p className="vtt-callout vtt-callout-danger">
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
        </Modal>
    );
};

export default MoveModal;
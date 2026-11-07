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
import CpIcon from '../ui/CpIcon.jsx';
import { RollBand, D10Face, RollStamp } from '../ui/RollBand.jsx';

// ── Constantes ────────────────────────────────────────────────────────────────

// Ce qui se passe à la table selon le résultat (règles §1.2)
const OUTCOME_CONFIG = {
    success: { desc: 'Tu fais ce que tu voulais faire.' },
    partial: { desc: 'Ça marche, mais le MC introduit une complication, un coût ou un choix difficile.' },
    failure: { desc: 'Le MC agit librement.' },
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

    // ── Render (spec_cyberpunk.md §5 : formule, bande 9- / 10-14 / 15+, tampon) ──

    const outcomeConfig = result ? OUTCOME_CONFIG[result.outcome] : null;
    const signed = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '+0');
    const canSynth = hasCyberware && activeStat && activeStat !== 'synth' && activeStat !== 'link';

    const footer = !result ? (
        <>
            <button type="button" onClick={onClose} className="vtt-btn">Annuler</button>
            <button type="button" onClick={handleRoll} disabled={rolling} className="vtt-btn vtt-btn-primary">
                <CpIcon name="d10" /> {rolling ? 'Jet en cours…' : 'Lancer'}
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
            <div className="cp-roll">
                {/* ── Description du move (le corps de la modale défile) ─── */}
                {move?.description && !result && (
                    <p className="cp-roll-desc">{move.description}</p>
                )}

                {!result ? (
                    <>
                        {/* ── Formule : 2d10 + stat (+ Synth) + modificateur ── */}
                        <div className="cp-formula">
                            <span className="cp-term">2d10</span>
                            {effectiveStat && (
                                <>
                                    <span className="cp-op">+</span>
                                    <span className={`cp-term st-${effectiveStat}`}>
                                        {STAT_LABELS[effectiveStat] ?? effectiveStat}
                                        {useSynth && activeStat !== 'synth' && <small> (substitution)</small>}
                                        <b>{signed(effectiveValue)}</b>
                                    </span>
                                </>
                            )}
                            <span className="cp-op">+</span>
                            <span className="cp-term">
                                Mod.
                                <button type="button" className="cp-step" onClick={() => setModifier(m => m - 1)} title="Malus">−</button>
                                <b className={modifier > 0 ? 'is-pos' : modifier < 0 ? 'is-neg' : ''}>{signed(modifier)}</b>
                                <button type="button" className="cp-step" onClick={() => setModifier(m => m + 1)} title="Bonus">+</button>
                            </span>
                            <span className="cp-op">=</span>
                            <span className="cp-term is-total">2d10<b>{signed(totalModifier)}</b></span>
                        </div>

                        {/* Substitution Synth (pill, pas de case à cocher) — règles §2.2 */}
                        {canSynth && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => setUseSynth(v => !v)}
                                    aria-pressed={useSynth}
                                    className={`vtt-pill ${useSynth ? 'is-selected' : ''}`}
                                >
                                    Substitution Synth
                                </button>
                                <span className="text-xs text-muted">
                                    Synth ({signed(character?.synth ?? 0)}) au lieu de {STAT_LABELS[activeStat]}, si un implant le justifie
                                </span>
                            </div>
                        )}

                        {error && <p className="vtt-callout vtt-callout-danger">{error}</p>}
                    </>
                ) : (
                    /* ── Résultat ────────────────────────────────────── */
                    <div className={`cp-roll-result z-${result.outcome}`}>
                        <RollStamp outcome={result.outcome} />
                        <div className="cp-roll-dice">
                            {(result.diceVals ?? []).map((v, i) => <D10Face key={i} value={v} size="lg" />)}
                            <span className="cp-roll-mod">{signed(result.modifier ?? 0)}</span>
                            <span className="cp-roll-total">{result.total}</span>
                        </div>
                        <RollBand total={result.total} outcome={result.outcome} />
                        <p className="cp-roll-outcome">{outcomeConfig?.desc}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default MoveModal;

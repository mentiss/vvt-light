// src/client/src/systems/achtung/gm/modals/GMDiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale de jet de dés GM — Achtung! Cthulhu
//
// Le GM n'a pas de fiche, pas de stats. Il fixe librement :
//   - Cible (valeur brute)
//   - Difficulté (succès requis)
//   - Nombre de dés (2–5)
//   - Label optionnel pour l'historique
//   - Switch visible/privé
//
// Flux : sélection → résultats (pas d'achat de dés, pas de ressources).
// roll() async — DiceAnimationOverlay géré par GMPage (singleton).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { roll, RollError } from '../../../../tools/diceEngine.js';
import { useFetch }        from '../../../../hooks/useFetch.js';
import { useSystem }       from '../../../../hooks/useSystem.js';
import { countSuccesses } from '../../config.jsx';

// ── Hooks dés GM — pas de validation de ressources ───────────────────────────
// Le GM n'achète pas de dés via Momentum/Threat — pas de beforeRoll restrictif.

const GM_DICE_HOOKS = {
    buildNotation: (ctx) => {
        const { nbDes } = ctx.systemData;
        if (!nbDes || nbDes < 1) throw new RollError('NO_DICE', 'Aucun dé à lancer');
        return `${nbDes}d20`;
    },

    beforeRoll: (ctx) => ctx, // pas de validation ressources côté GM

    afterRoll: (raw, ctx) => {
        const { target, difficulty = 1 } = ctx.systemData;
        const results = raw.groups[0].values;
        const { successes, complications } = countSuccesses(results, target, 0, false);
        const success  = successes >= difficulty;
        const momentum = Math.max(0, successes - difficulty);
        return { results, target, successes, complications, difficulty, success, momentum, label: ctx.label };
    },

    buildAnimationSequence: (raw, ctx) => ({
        mode: 'single',
        groups: raw.groups.map((g, i) => ({
            id:       `gm-roll-${i}`,
            diceType: 'd20',
            color:    'default',
            label:    ctx.label || `${g.values.length}d20`,
            waves:    [{ dice: g.values }],
        })),
    }),

    renderHistoryEntry: () => null,
};

const MIN_DICE = 2;
const MAX_DICE = 5;

// ── Affichage d'un dé ─────────────────────────────────────────────────────────

const Die20 = ({ value, target }) => {
    let cls, label;
    if (value === 20)        { cls = 'ac-die complication'; label = 'COMP'; }
    else if (value <= target){ cls = 'ac-die success';      label = '✓';    }
    else                     { cls = 'ac-die miss';         label = '✗';    }
    return (
        <div className="flex flex-col items-center gap-0.5">
            <div className={cls}>{value}</div>
            <span className="ac-label" style={{ fontSize: '0.6rem' }}>{label}</span>
        </div>
    );
};

// ── Switch visible/privé ──────────────────────────────────────────────────────

const VisibilitySwitch = ({ value, onChange }) => (
    <div className="flex items-center justify-between">
        <span className="ac-label">Visible des joueurs</span>
        <button
            onClick={() => onChange(!value)}
            className="ac-toggle-track"
            style={{ background: value ? 'var(--ac-primary)' : 'var(--ac-border)' }}
        >
            <div className={`ac-toggle-thumb ${value ? 'on' : 'off'}`} />
        </button>
    </div>
);

// ── Stepper générique — défini au niveau module (règle : jamais dans render) ──

const Stepper = ({ label, value, onDec, onInc, min, max, color }) => (
    <div className="flex items-center justify-between">
        <span className="ac-label">{label}</span>
        <div className="flex items-center gap-2">
            <button onClick={onDec} disabled={value <= min} className="ac-btn ac-btn-ghost w-7 h-7 p-0 disabled:opacity-30">−</button>
            <span className="ac-font-title w-8 text-center" style={{ fontSize: '1.1rem', fontWeight: 700, color: color ?? 'var(--ac-text)' }}>
                {value}
            </span>
            <button onClick={onInc} disabled={value >= max} className="ac-btn ac-btn-ghost w-7 h-7 p-0 disabled:opacity-30">+</button>
        </div>
    </div>
);

// ── Composant principal ───────────────────────────────────────────────────────

const GMDiceModal = ({ onClose, sessionId }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    // ── Paramètres ────────────────────────────────────────────────────────────
    const [target,     setTarget]     = useState(10);
    const [difficulty, setDifficulty] = useState(1);
    const [nbDice,     setNbDice]     = useState(2);
    const [label,      setLabel]      = useState('');
    const [broadcast,  setBroadcast]  = useState(false);

    // ── État jet ──────────────────────────────────────────────────────────────
    const [step,       setStep]       = useState(1);
    const [results,    setResults]    = useState(null);
    const [rollResult, setRollResult] = useState(null);
    const [rolling,    setRolling]    = useState(false);
    const [error,      setError]      = useState(null);

    // ── Jet ───────────────────────────────────────────────────────────────────
    // roll() retourne le résultat d'afterRoll — pas le raw brut.
    // On lit donc directement result.results, result.successes, etc.
    const handleRoll = useCallback(async () => {
        if (rolling) return;
        setRolling(true);
        setError(null);
        try {
            const ctx = {
                apiBase,
                fetchFn:        fetchWithAuth,
                characterId:    -1,
                characterName:  'GM',
                sessionId:      sessionId ?? null,
                rollType:       'achtung_gm',
                label:          label.trim() || `Jet GM — ${nbDice}d20 (cible ${target})`,
                persistHistory: broadcast,
                systemData: {
                    target,
                    difficulty,
                    nbDes: nbDice,
                },
            };

            // result = valeur retournée par GM_DICE_HOOKS.afterRoll
            // = { results, target, successes, complications, difficulty, success, momentum, label }
            const result = await roll(`${nbDice}d20`, ctx, GM_DICE_HOOKS);

            setResults(result.results);
            setRollResult({
                successes:     result.successes,
                complications: result.complications,
                success:       result.success,
                momentum:      result.momentum,
                difficulty:    result.difficulty,
            });
            setStep(2);
        } catch (err) {
            if (err instanceof RollError) setError(err.message);
            else console.error('[GMDiceModal/achtung]', err);
        } finally {
            setRolling(false);
        }
    }, [rolling, target, difficulty, nbDice, label, broadcast, apiBase, fetchWithAuth, sessionId]);

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setStep(1);
        setResults(null);
        setRollResult(null);
        setError(null);
    };

    // ── Rendu ─────────────────────────────────────────────────────────────────
    return (
        <div className="ac-modal-overlay" onClick={onClose}>
            <div className="ac-modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>

                {/* En-tête */}
                <div className="flex items-center justify-between mb-4">
                    <div className="ac-modal-title mb-0">🎲 Jet GM — {nbDice}d20</div>
                    <button onClick={onClose} className="ac-btn ac-btn-ghost">✕</button>
                </div>

                {error && (
                    <div className="mb-3 px-3 py-2 rounded text-sm" style={{ background: 'var(--ac-danger)', color: '#fff' }}>
                        {error}
                    </div>
                )}

                {/* ══ ÉTAPE 1 — Paramètres ═════════════════════════════════ */}
                {step === 1 && (
                    <div className="flex flex-col gap-4">

                        <Stepper
                            label="Cible"
                            value={target}
                            onDec={() => setTarget(v => Math.max(1, v - 1))}
                            onInc={() => setTarget(v => Math.min(20, v + 1))}
                            min={1} max={20}
                            color="var(--ac-secondary)"
                        />

                        <Stepper
                            label="Difficulté"
                            value={difficulty}
                            onDec={() => setDifficulty(v => Math.max(1, v - 1))}
                            onInc={() => setDifficulty(v => Math.min(5, v + 1))}
                            min={1} max={5}
                        />

                        <Stepper
                            label="Nombre de dés"
                            value={nbDice}
                            onDec={() => setNbDice(v => Math.max(MIN_DICE, v - 1))}
                            onInc={() => setNbDice(v => Math.min(MAX_DICE, v + 1))}
                            min={MIN_DICE} max={MAX_DICE}
                            color="var(--ac-primary)"
                        />

                        {/* Label optionnel */}
                        <div>
                            <div className="ac-label mb-1">Label (optionnel)</div>
                            <input
                                value={label}
                                onChange={e => setLabel(e.target.value)}
                                className="ac-input"
                                placeholder="Ex : Perception, Tir de précision…"
                            />
                        </div>

                        <VisibilitySwitch value={broadcast} onChange={setBroadcast} />

                        <button
                            onClick={handleRoll}
                            disabled={rolling}
                            className="ac-btn ac-btn-primary w-full disabled:opacity-40"
                        >
                            {rolling ? '⏳ Lancement…' : `🎲 Lancer ${nbDice}d20`}
                        </button>
                    </div>
                )}

                {/* ══ ÉTAPE 2 — Résultats ══════════════════════════════════ */}
                {step === 2 && rollResult && (
                    <div className="flex flex-col gap-4">

                        {/* Dés */}
                        <div className="flex gap-2 flex-wrap justify-center">
                            {results.map((val, i) => (
                                <Die20 key={i} value={val} target={target} />
                            ))}
                        </div>

                        {/* Résumé */}
                        <div
                            className="rounded-lg px-4 py-3 text-center"
                            style={{
                                background: rollResult.success
                                    ? 'color-mix(in srgb, var(--ac-success) 12%, transparent)'
                                    : 'color-mix(in srgb, var(--ac-danger) 12%, transparent)',
                                border: `1px solid ${rollResult.success ? 'var(--ac-success)' : 'var(--ac-danger)'}`,
                            }}
                        >
                            <div className="ac-font-title text-xl font-bold mb-0.5"
                                 style={{ color: rollResult.success ? 'var(--ac-success)' : 'var(--ac-danger)' }}>
                                {rollResult.success ? '✓ Succès' : '✗ Échec'}
                            </div>
                            <div className="ac-text-muted text-xs">
                                {rollResult.successes} succès / {rollResult.difficulty} requis
                                {rollResult.momentum > 0 && (
                                    <span style={{ color: 'var(--ac-momentum-color)', marginLeft: '0.5rem' }}>
                                        · +{rollResult.momentum} Momentum
                                    </span>
                                )}
                                {rollResult.complications > 0 && (
                                    <span style={{ color: 'var(--ac-accent)', marginLeft: '0.5rem' }}>
                                        · {rollResult.complications} complication{rollResult.complications > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button onClick={handleReset} className="ac-btn ac-btn-secondary flex-1">
                                🔄 Nouveau jet
                            </button>
                            <button onClick={onClose} className="ac-btn ac-btn-ghost flex-1">
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GMDiceModal;
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
import { countAssisted, GROUP_MAX } from '../../config/npc.js';
import { SALVO_LABELS } from '../../config/mechanics.js';
import achtungConfig from '../../config.jsx';
import Modal               from '../../../../components/ui/Modal.jsx';

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
        const { target, difficulty = 1, skillRank = 0, focus = false, lead = null } = ctx.systemData;
        const results = raw.groups[0].values;
        // Focus : un dé ≤ rang de la compétence compte deux succès (jet d'un PNJ, sinon sans effet) ;
        // dés au-delà de `lead` : assistance d'un groupe, comptée seulement si le chef réussit
        const { successes, complications } = countAssisted(results, lead ?? results.length, target, skillRank, focus);
        const success  = successes >= difficulty;
        const momentum = Math.max(0, successes - difficulty);
        // hasFocus / skillRank : mêmes clés qu'un jet de compétence, pour le rendu de l'historique
        return { results, target, successes, complications, difficulty, success, momentum, label: ctx.label, hasFocus: !!focus, skillRank };
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
const GROUP_ASSIST_MAX = GROUP_MAX - 1;   // assistants d'un groupe de Troupes, en plus du chef

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

// Props facultatives d'un jet lancé depuis un PNJ (spec_pnj.md §10.4) : name (lanceur), label,
// initial { target, difficulty, dice, skill, focus, assist, damage? } (skill : rang de la compétence, zone de
// critique avec un focus ; assist : dés d'assistance d'un groupe de Troupes, comptés seulement si le chef réussit ;
// damage { dice, salvo, innate, groupBonus } : attaque, dégâts lancés après un test réussi), secret (réglage de l'onglet).
const GMDiceModal = ({ onClose, sessionId, name = null, label: initialLabel = '', initial = null, secret = true }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();
    const skillRank = initial?.skill ?? null;
    const [assist,     setAssist]     = useState(initial?.assist ?? 0);
    const [salvoOn,    setSalvoOn]    = useState(false);
    const [damage,     setDamage]     = useState(null);   // { results, stress, effects }

    // ── Paramètres ────────────────────────────────────────────────────────────
    const [target,     setTarget]     = useState(initial?.target ?? 10);
    const [difficulty, setDifficulty] = useState(initial?.difficulty ?? 1);
    const [nbDice,     setNbDice]     = useState(initial?.dice ?? 2);
    const [label,      setLabel]      = useState(initialLabel ?? '');
    const [broadcast,  setBroadcast]  = useState(!secret);
    const [focus,      setFocus]      = useState(!!initial?.focus);

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
                characterName:  name ?? 'GM',
                sessionId:      sessionId ?? null,
                rollType:       'achtung_gm',
                label:          label.trim() || `Jet GM — ${nbDice}d20 (cible ${target})`,
                persistHistory: broadcast,
                systemData: {
                    target,
                    difficulty,
                    nbDes: nbDice + assist,
                    lead: nbDice,
                    skillRank: skillRank ?? 0,
                    focus: skillRank != null && focus,
                },
            };

            // result = valeur retournée par GM_DICE_HOOKS.afterRoll
            // = { results, target, successes, complications, difficulty, success, momentum, label }
            const result = await roll(GM_DICE_HOOKS.buildNotation(ctx), ctx, GM_DICE_HOOKS);

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
    }, [rolling, target, difficulty, nbDice, assist, label, broadcast, apiBase, fetchWithAuth, sessionId, name, skillRank, focus]);

    // ── Dégâts d'une attaque de PNJ (dés de Challenge, hooks challengeDice du slug) ──
    const handleDamage = useCallback(async () => {
        if (rolling || !initial?.damage?.dice) return;
        setRolling(true);
        setError(null);
        try {
            const ctx = {
                apiBase, fetchFn: fetchWithAuth, characterId: -1, characterName: name ?? 'GM', sessionId: sessionId ?? null,
                rollType: 'achtung_damage', label: `${label.trim() || 'Attaque'} — dégâts`, persistHistory: broadcast,
                systemData: {
                    nbDice: initial.damage.dice,
                    activeSalvo: salvoOn && initial.damage.salvo ? { key: initial.damage.salvo } : null,
                    innateEffects: initial.damage.innate ?? [],
                    bonusStress: initial.damage.groupBonus ?? 0,
                },
            };
            const result = await roll(achtungConfig.challengeDice.buildNotation(ctx), ctx, achtungConfig.challengeDice);
            setDamage({ results: result.results, stress: result.stress, effects: result.effects });
        } catch (err) {
            if (err instanceof RollError) setError(err.message);
            else console.error('[GMDiceModal/achtung] dégâts', err);
        } finally {
            setRolling(false);
        }
    }, [rolling, initial, apiBase, fetchWithAuth, name, sessionId, label, broadcast, salvoOn]);

    // ── Reset ─────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setStep(1);
        setResults(null);
        setRollResult(null);
        setDamage(null);
        setError(null);
    };

    // ── Rendu ─────────────────────────────────────────────────────────────────
    return (
        <Modal title={`Jet GM — ${nbDice}d20`} size="sm" className="ac-dice-modal" onClose={onClose}>

                {error && (
                    <div className="mb-3 px-3 py-2 rounded text-sm" style={{ background: 'var(--ac-danger)', color: 'var(--ac-on-color)' }}>
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

                        {initial?.assist != null && initial.assist > 0 && (
                            <Stepper
                                label="Dés d'assistance (groupe)"
                                value={assist}
                                onDec={() => setAssist(v => Math.max(0, v - 1))}
                                onInc={() => setAssist(v => Math.min(GROUP_ASSIST_MAX, v + 1))}
                                min={0} max={GROUP_ASSIST_MAX}
                            />
                        )}

                        {skillRank != null && (
                            <button type="button" className={`vtt-pill${focus ? ' is-selected' : ''}`} onClick={() => setFocus(f => !f)}>
                                Focus : un dé ≤ {skillRank} compte deux succès
                            </button>
                        )}

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
                            {rolling ? '⏳ Lancement…' : `🎲 Lancer ${nbDice}d20${assist ? ` + ${assist}d20 d'assistance` : ''}`}
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

                        {/* Dégâts d'une attaque de PNJ : dés de Challenge, après un test réussi (spec §3.9) */}
                        {initial?.damage && rollResult.success && (
                            <div className="flex flex-col gap-2">
                                {initial.damage.salvo && (
                                    <button type="button" className={`vtt-pill${salvoOn ? ' is-selected' : ''}`} onClick={() => setSalvoOn(v => !v)}>
                                        Salve : {SALVO_LABELS[initial.damage.salvo]}
                                    </button>
                                )}
                                <button type="button" onClick={handleDamage} disabled={rolling} className="ac-btn ac-btn-primary w-full disabled:opacity-40">
                                    {rolling ? '⏳ Lancement…' : `Dégâts : ${initial.damage.dice} ▲${initial.damage.groupBonus ? ` (+${initial.damage.groupBonus} groupe)` : ''}`}
                                </button>
                                {damage && (
                                    <div className="ac-text-muted text-center text-sm">
                                        {damage.results.join(' · ')} → <b>{damage.stress} stress</b>
                                        {initial.damage.groupBonus ? ` (dont +${initial.damage.groupBonus} groupe)` : ''}
                                        {damage.effects > 0 ? ` · ${damage.effects} effet${damage.effects > 1 ? 's' : ''}` : ''}
                                    </div>
                                )}
                            </div>
                        )}

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
        </Modal>
    );
};

export default GMDiceModal;
// src/client/src/systems/achtung/dice/AchtungDiceModal.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { roll, RollError }  from '../../../tools/diceEngine.js';
import { useSocket }        from '../../../context/SocketContext.jsx';
import { useFetch }         from '../../../hooks/useFetch.js';
import { useSystem }        from '../../../hooks/useSystem.js';
import { useSession }       from '../../../context/SessionContext.jsx';
import achtungConfig, {
    ATTRIBUTES, SKILLS, getBonusDamage, EXTRA_DIE_COST,
} from '../config.jsx';

const MAX_SKILL_DICE   = 5;
const MAX_DAMAGE_BONUS = 3;

// ── Toggle ────────────────────────────────────────────────────────────────────

const Toggle = ({ checked, onChange, label, sublabel, disabled = false, variant = 'default' }) => {
    const trackClass = [
        'ac-toggle-track',
        checked ? (variant === 'accent' ? 'checked-accent' : variant === 'momentum' ? 'checked-momentum' : 'checked') : '',
        disabled ? 'pointer-events-none opacity-40' : '',
    ].filter(Boolean).join(' ');

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onChange(!checked);
    };

    return (
        <div className="flex items-center justify-between gap-3" style={{ cursor: disabled ? 'not-allowed' : 'pointer' }} onClick={handleClick}>
            <div>
                <div style={{ fontSize: '0.82rem' }} className="text-default">{label}</div>
                {sublabel && <div className="ac-text-muted" style={{ fontSize: '0.7rem' }}>{sublabel}</div>}
            </div>
            <div className={trackClass}>
                <div className={`ac-toggle-thumb ${checked ? 'on' : 'off'}`} />
            </div>
        </div>
    );
};

// ── Dé d20 ────────────────────────────────────────────────────────────────────
// forced  : dé forcé à 1 par dépense de Fortune (avant le jet)
// rerolled: dé qui vient d'être relancé (après le jet)

const Die20 = ({ value, target, skillRank, expertiseApplied, forced, onClick, canReroll }) => {
    let cls, labelText;
    if (value === 20) {
        cls = 'complication'; labelText = 'COMP';
    } else if (value === 1) {
        cls = 'double'; labelText = forced ? '⚡2✓' : '2✓';
    } else if (value <= target) {
        const isDouble = expertiseApplied && value <= skillRank;
        cls = isDouble ? 'double' : 'success';
        labelText = isDouble ? '2✓' : '✓';
    } else {
        cls = 'miss'; labelText = '✗';
    }

    return (
        <div className="flex flex-col items-center gap-0.5">
            <div
                className={`ac-die ${cls}${canReroll ? ' cursor-pointer hover:opacity-80' : ''}${forced ? ' ring-2 ring-yellow-400' : ''}`}
                onClick={canReroll ? onClick : undefined}
                title={canReroll ? 'Cliquer pour relancer (coûte 1 Fortune)' : undefined}
            >
                {value}
            </div>
            <span className={`ac-die-label ac-die-label--${cls}`}>{labelText}</span>
        </div>
    );
};

// ── Dé de Challenge d6 ────────────────────────────────────────────────────────

const Die6 = ({ value, salvoUpper }) => {
    let cls;
    if (value <= 2)   cls = 'miss';
    else if (value <= 4) cls = 'miss';
    else cls = (salvoUpper.includes('VICIOUS') && value === 5) ? 'complication' : 'success';
    return <div className={`ac-die ${cls}`}>{value}</div>;
};

// ── Calcul succès ─────────────────────────────────────────────────────────────

function calcSuccesses(results, target, skillRank, expertiseApplied) {
    let successes     = 0;
    let complications = 0;
    for (const val of results) {
        if (val === 20) {
            complications++;
        } else if (val === 1) {
            successes += 2;
        } else if (val <= target) {
            successes += (expertiseApplied && val <= skillRank) ? 2 : 1;
        }
    }
    return { successes, complications };
}

// ── Composant principal ───────────────────────────────────────────────────────

const AchtungDiceModal = ({
                              mode             = 'skill',
                              character,
                              preselect        = null,
                              weapon           = null,
                              sessionResources = { momentum: 0, threat: 0 },
                              onClose,
                              onCharacterUpdate,
                          }) => {
    const { apiBase }         = useSystem();
    const fetchWithAuth       = useFetch();
    const socket              = useSocket();
    const { activeGMSession } = useSession();

    const [step, setStep] = useState(mode === 'damage' ? 4 : 1);

    // ── État étape 1 ──────────────────────────────────────────────────────────
    const [selectedAttrKey,  setSelectedAttrKey]  = useState(null);
    const [selectedSkillKey, setSelectedSkillKey] = useState(preselect?.skillKey ?? null);
    const [difficulty,       setDifficulty]       = useState(1);
    const [isAssist,         setIsAssist]         = useState(false);

    // Fortune dépensée AVANT le jet (dés forcés à 1)
    const [fortunePreRoll, setFortunePreRoll] = useState(0);

    // ── État étape 2 — achats ─────────────────────────────────────────────────
    // extraDiceCount : nombre de dés supplémentaires achetés (0–3)
    const [extraDiceCount,  setExtraDiceCount]  = useState(0);
    const [momentumSpent,   setMomentumSpent]   = useState(0);
    const [threatGenerated, setThreatGenerated] = useState(0);

    // ── État étape 3 — résultat compétence ────────────────────────────────────
    const [diceResults,      setDiceResults]      = useState([]); // résultats mutables (relances)
    const [forcedResults,    setForcedResults]    = useState([]); // indices des dés forcés à 1
    const [expertiseApplied, setExpertiseApplied] = useState(false);
    const [rawTarget,        setRawTarget]        = useState(0);
    const [rawSkillRank,     setRawSkillRank]     = useState(0);

    // ── État étape 4/5 — dommages ─────────────────────────────────────────────
    const [selectedWeapon,  setSelectedWeapon]  = useState(weapon);
    const [damageBonusDice, setDamageBonusDice] = useState(0);
    const [damageResults,   setDamageResults]   = useState([]);

    const [rolling, setRolling] = useState(false);
    const [error,   setError]   = useState(null);

    // ── Dérivés étape 1 ───────────────────────────────────────────────────────
    const selectedAttr  = useMemo(() => character.attributes?.find(a => a.key === selectedAttrKey), [character.attributes, selectedAttrKey]);
    const selectedSkill = useMemo(() => character.skills?.find(s => s.key === selectedSkillKey),    [character.skills, selectedSkillKey]);
    const skillDef      = useMemo(() => SKILLS.find(s => s.key === selectedSkillKey),               [selectedSkillKey]);

    const attrValue  = selectedAttr?.value  ?? 0;
    const skillRank  = selectedSkill?.rank  ?? 0;
    const hasFocus   = !!(selectedSkill?.focus?.trim()); // focus renseigné sur la compétence
    const target     = attrValue + skillRank;

    const baseDice = isAssist ? 1 : 2;
    const nbDice   = Math.min(MAX_SKILL_DICE, baseDice + extraDiceCount);
    // Dés réellement lancés = nbDice - fortunePreRoll (les forcés ne sont pas lancés)
    const dicesToRoll = Math.max(0, nbDice - fortunePreRoll);

    const nextDieCost = extraDiceCount < MAX_SKILL_DICE - baseDice ? EXTRA_DIE_COST[extraDiceCount] : null;
    const canBuyWithMomentum = nextDieCost !== null && (sessionResources.momentum - momentumSpent) >= nextDieCost;
    const canBuyWithThreat   = nextDieCost !== null;

    const fortuneAvailable = character.fortune ?? 0;
    const canSpendFortunePreRoll = fortunePreRoll < fortuneAvailable && fortunePreRoll < nbDice;

    // ── Dérivés résultat ──────────────────────────────────────────────────────
    const { successes, complications } = useMemo(
        () => calcSuccesses(diceResults, rawTarget, rawSkillRank, expertiseApplied),
        [diceResults, rawTarget, rawSkillRank, expertiseApplied]
    );
    const success  = successes >= difficulty;
    const momentum = Math.max(0, Math.min(
        successes - difficulty,
        6 - sessionResources.momentum
    ));

    // ── Dérivés étape 4 ───────────────────────────────────────────────────────
    const attackAttrKey = useMemo(() => {
        if (!selectedWeapon) return null;
        return (selectedWeapon.range ?? '').toLowerCase() === 'close' ? 'brawn' : 'coordination';
    }, [selectedWeapon]);
    const attackAttrVal = character.attributes?.find(a => a.key === attackAttrKey)?.value ?? 0;
    const bonusDamage   = getBonusDamage(attackAttrVal);
    const basePool      = (selectedWeapon?.damage ?? 0) + bonusDamage;
    const totalDicePool = basePool + damageBonusDice;

    const salvoUpper = (selectedWeapon?.salvo ?? '').toUpperCase();

    // ── Achats dés ────────────────────────────────────────────────────────────
    const buyExtraDie = (source) => {
        if (nextDieCost === null) return;
        if (source === 'momentum') {
            if (!canBuyWithMomentum) return;
            setMomentumSpent(v => v + nextDieCost);
        } else {
            setThreatGenerated(v => v + nextDieCost);
        }
        setExtraDiceCount(v => v + 1);
    };

    const resetExtraDice = () => {
        setExtraDiceCount(0);
        setMomentumSpent(0);
        setThreatGenerated(0);
    };

    // ── Émissions socket ──────────────────────────────────────────────────────
    const emitResources = useCallback((patches) => {
        if (!socket || !activeGMSession) return;
        for (const [field, delta] of Object.entries(patches)) {
            if (delta !== 0) socket.emit('update-session-resources', { sessionId: activeGMSession, field, delta });
        }
    }, [socket, activeGMSession]);

    // ── Jet de compétence ─────────────────────────────────────────────────────
    const handleSkillRoll = useCallback(async () => {
        if (rolling || !selectedAttrKey || !selectedSkillKey) return;
        setRolling(true);
        setError(null);

        try {
            // Dés forcés à 1 par Fortune
            const forcedOnes  = Array(fortunePreRoll).fill(1);
            const forcedIdx   = Array.from({ length: fortunePreRoll }, (_, i) => i); // indices 0..n-1

            // Lancer les dés restants
            let rolledResults = [];
            if (dicesToRoll > 0) {
                const ctx = {
                    apiBase, fetchFn: fetchWithAuth,
                    characterId: character.id,
                    characterName: character.nom ?? character.playerName,
                    sessionId: activeGMSession ?? null,
                    rollType: 'achtung_skill',
                    label: `${ATTRIBUTES.find(a => a.key === selectedAttrKey)?.label} + ${skillDef?.label ?? selectedSkillKey}`,
                    systemData: {
                        target, skillRank, difficulty,
                        momentumSpent, threatGenerated, isAssist,
                        nbDes: dicesToRoll,
                        // expertise : le joueur déclare après le jet
                    },
                };
                const notation = `${dicesToRoll}d20`;
                const raw      = await roll(notation, ctx, achtungConfig.dice);
                rolledResults  = raw.groups?.[0]?.values ?? raw.results ?? [];
            }

            const allResults = [...forcedOnes, ...rolledResults];

            // Stocker l'état pour les interactions post-jet
            setDiceResults(allResults);
            setForcedResults(forcedIdx);
            setRawTarget(target);
            setRawSkillRank(skillRank);
            // L'expertise sera déclarée par le joueur à l'étape 3
            setExpertiseApplied(false);

            // Émettre ressources
            emitResources({
                momentum:      -momentumSpent,
                threat:         threatGenerated,
                complications:  0, // calculé après déclaration expertise
            });

            // Décrémenter Fortune dépensée avant le jet
            if (fortunePreRoll > 0) {
                onCharacterUpdate?.({ ...character, fortune: Math.max(0, fortuneAvailable - fortunePreRoll) });
            }

            setStep(3);
        } catch (err) {
            if (err instanceof RollError) setError(err.message);
            else console.error('[AchtungDiceModal] skill roll:', err);
        } finally {
            setRolling(false);
        }
    }, [
        rolling, selectedAttrKey, selectedSkillKey, target, skillRank, difficulty,
        momentumSpent, threatGenerated, isAssist, dicesToRoll, fortunePreRoll,
        fortuneAvailable, apiBase, fetchWithAuth, character, activeGMSession,
        emitResources, onCharacterUpdate, skillDef,
    ]);

    // ── Déclaration expertise post-jet ────────────────────────────────────────
    const handleExpertiseToggle = useCallback((checked) => {
        setExpertiseApplied(checked);
    }, []);

    // ── Émettre complications après déclaration expertise ────────────────────
    // On émet les complications une fois que le résultat final est confirmé
    const [complicationsEmitted, setComplicationsEmitted] = useState(false);
    const handleConfirmResult = useCallback(() => {
        if (complicationsEmitted) return;
        if (complications > 0) {
            emitResources({ complications });
        }
        // Momentum excédentaire — automatique selon les règles
        if (success && momentum > 0) {
            emitResources({ momentum });
        }
        setComplicationsEmitted(true);
    }, [complications, success, momentum, emitResources, complicationsEmitted]);

    // ── Relancer un dé (Fortune post-jet) ────────────────────────────────────
    const handleRerollDie = useCallback((idx) => {
        const currentFortune = character.fortune ?? 0;
        // Déduire les fortunes déjà dépensées pré-jet
        const remainingFortune = currentFortune - fortunePreRoll;
        if (remainingFortune <= 0) return;

        const newVal  = Math.floor(Math.random() * 20) + 1;
        const next    = [...diceResults];
        next[idx]     = newVal;
        setDiceResults(next);

        // Décrémenter fortune
        onCharacterUpdate?.({ ...character, fortune: Math.max(0, currentFortune - 1) });
    }, [diceResults, character, fortunePreRoll, onCharacterUpdate]);

    // ── Jet de dommages ───────────────────────────────────────────────────────
    const handleDamageRoll = useCallback(async () => {
        if (rolling || !selectedWeapon || totalDicePool < 1) return;
        setRolling(true);
        setError(null);
        try {
            if (damageBonusDice > 0) emitResources({ momentum: -damageBonusDice });

            const ctx = {
                apiBase, fetchFn: fetchWithAuth,
                characterId: character.id,
                characterName: character.nom ?? character.playerName,
                sessionId: activeGMSession ?? null,
                rollType: 'achtung_damage',
                label: `Dommages — ${selectedWeapon.name}`,
                systemData: { nbDice: totalDicePool, salvo: selectedWeapon.salvo ?? '' },
            };
            const raw     = await roll(`${totalDicePool}d6`, ctx, achtungConfig.challengeDice);
            const results = raw.groups?.[0]?.values ?? raw.results ?? [];
            setDamageResults(results);
            setStep(5);
        } catch (err) {
            if (err instanceof RollError) setError(err.message);
            else console.error('[AchtungDiceModal] damage roll:', err);
        } finally {
            setRolling(false);
        }
    }, [rolling, selectedWeapon, totalDicePool, damageBonusDice, apiBase, fetchWithAuth, character, activeGMSession, emitResources]);

    // ── Calcul dommages ───────────────────────────────────────────────────────
    const damageCalc = useMemo(() => {
        let stress = 0, effects = 0;
        for (const val of damageResults) {
            if (val === 1)      stress += 1;
            else if (val === 2) stress += 2;
            else if (val === 3 || val === 4) { /* 0 */ }
            else { // 5 ou 6
                if (salvoUpper.includes('VICIOUS') && val === 5) stress += 2;
                else { stress += 1; effects += 1; }
            }
        }
        return { stress, effects };
    }, [damageResults, salvoUpper]);

    // ── Utiliser Salvo ────────────────────────────────────────────────────────
    const [salvoUsed, setSalvoUsed] = useState(false);
    const handleSalvoSwitch = useCallback((checked) => {
        setSalvoUsed(checked);
        const delta = checked ? -1 : 1;
        onCharacterUpdate?.({ ...character, ammo: Math.max(0, (character.ammo ?? 0) + delta) });
    }, [character, onCharacterUpdate]);

    const hasSalvo = damageCalc.effects > 0 && salvoUpper.length > 0;

    // Fortune restante pour relances post-jet
    const fortuneForReroll = Math.max(0, (character.fortune ?? 0) - fortunePreRoll);

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="ac-modal-overlay" onClick={onClose}>
            <div className="ac-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>

                {/* En-tête */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="ac-modal-title mb-0">
                            {step <= 3 ? '🎲 Jet de compétence' : step === 4 ? '⚄ Jet de dommages' : '⚄ Résultat dommages'}
                        </div>
                        {step <= 2 && target > 0 && (
                            <div className="ac-text-muted" style={{ fontSize: '0.7rem' }}>
                                Cible : {target} — {nbDice}d20
                                {fortunePreRoll > 0 && ` (${fortunePreRoll} forcé${fortunePreRoll > 1 ? 's' : ''} à 1)`}
                            </div>
                        )}
                    </div>
                    <button onClick={onClose} className="ac-btn ac-btn-ghost">✕</button>
                </div>

                {error && <div className="mb-3 px-3 py-2 rounded text-sm bg-danger" style={{ color: '#fff' }}>{error}</div>}

                {/* ══ ÉTAPE 1 — Sélection ══════════════════════════════════ */}
                {step === 1 && (
                    <div className="flex flex-col gap-4">

                        {/* Attributs */}
                        <div>
                            <div className="ac-label mb-1.5">Attribut</div>
                            <div className="ac-attr-grid">
                                {character.attributes?.map(attr => {
                                    const def      = ATTRIBUTES.find(a => a.key === attr.key);
                                    const isActive = selectedAttrKey === attr.key;
                                    return (
                                        <button
                                            key={attr.key}
                                            onClick={() => setSelectedAttrKey(k => k === attr.key ? null : attr.key)}
                                            className={`ac-select-btn${isActive ? ' selected-primary' : ''} flex flex-col items-center py-2`}
                                        >
                                            <span className="ac-label">{def?.label ?? attr.key}</span>
                                            <span className="ac-attr-value">{attr.value}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Compétences */}
                        <div>
                            <div className="ac-label mb-1.5">Compétence</div>
                            <div className="grid grid-cols-2 gap-1">
                                {character.skills?.map(skill => {
                                    const def      = SKILLS.find(s => s.key === skill.key);
                                    const isActive = selectedSkillKey === skill.key;
                                    return (
                                        <button
                                            key={skill.key}
                                            onClick={() => setSelectedSkillKey(k => k === skill.key ? null : skill.key)}
                                            className={`ac-select-btn${isActive ? ' selected' : ''} flex items-center justify-between px-2 py-1.5`}
                                        >
                                            <span style={{ fontSize: '0.72rem' }}>{def?.label ?? skill.key}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="ac-value" style={{ fontSize: '0.85rem' }}>{skill.rank}</span>
                                                {skill.focus && <span className="ac-text-muted" style={{ fontSize: '0.6rem' }} title={skill.focus}>●</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Expertise applicable — visible uniquement si la compétence sélectionnée a un focus */}
                        {hasFocus && selectedSkillKey && (
                            <div className="ac-card-alt">
                                <Toggle
                                    checked={expertiseApplied}
                                    onChange={setExpertiseApplied}
                                    label="Expertise applicable"
                                    sublabel={`Focus : ${selectedSkill?.focus} — résultats ≤ ${skillRank} comptent pour 2 succès`}
                                />
                            </div>
                        )}

                        {/* Difficulté + Assist */}
                        <div className="flex items-center gap-4">
                            <div>
                                <div className="ac-label mb-1">Succès requis</div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setDifficulty(d => Math.max(1, d - 1))} className="ac-btn ac-btn-ghost w-7 h-7 p-0 flex items-center justify-center">−</button>
                                    <span className="ac-value w-8 text-center">{difficulty}</span>
                                    <button onClick={() => setDifficulty(d => Math.min(5, d + 1))} className="ac-btn ac-btn-ghost w-7 h-7 p-0 flex items-center justify-center">+</button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <Toggle checked={isAssist} onChange={setIsAssist} label="J'assiste" sublabel="1d20 de base — mes succès s'ajoutent si le principal en obtient au moins 1" />
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!selectedAttrKey || !selectedSkillKey}
                            className="ac-btn ac-btn-primary w-full disabled:opacity-30"
                        >
                            Suivant — Cible : {target} →
                        </button>
                    </div>
                )}

                {/* ══ ÉTAPE 2 — Achats + Fortune pré-jet ═══════════════════ */}
                {step === 2 && (
                    <div className="flex flex-col gap-4">

                        {/* Résumé */}
                        <div className="ac-card-alt flex items-center justify-between">
                            <div>
                                <div className="ac-label">Jet</div>
                                <div className="text-default" style={{ fontSize: '0.85rem' }}>
                                    {ATTRIBUTES.find(a => a.key === selectedAttrKey)?.label} + {skillDef?.label}
                                </div>
                                <div className="ac-text-muted">Cible {target} · {difficulty} succès requis</div>
                            </div>
                            <div className="text-center">
                                <div className="ac-label">Dés</div>
                                <div className="ac-resource-value text-secondary">{nbDice}</div>
                                {fortunePreRoll > 0 && (
                                    <div className="ac-text-muted" style={{ fontSize: '0.6rem' }}>
                                        {fortunePreRoll} forcé{fortunePreRoll > 1 ? 's' : ''} à 1
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Achats dés */}
                        {nextDieCost !== null && (
                            <div className="flex flex-col gap-2">
                                <div className="ac-label">+1 dé supplémentaire (coût : {nextDieCost})</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => buyExtraDie('momentum')}
                                        disabled={!canBuyWithMomentum}
                                        className="ac-btn ac-btn-secondary flex-1 disabled:opacity-30"
                                    >
                                        <div style={{ fontSize: '0.7rem' }}>Dépenser Momentum</div>
                                        <div className="ac-text-muted" style={{ fontSize: '0.65rem' }}>
                                            {sessionResources.momentum - momentumSpent} dispo
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => buyExtraDie('threat')}
                                        className="ac-btn ac-btn-secondary flex-1 border-danger"
                                        style={{ color: 'var(--ac-threat-color)' }}
                                    >
                                        <div style={{ fontSize: '0.7rem' }}>Générer Threat</div>
                                        <div className="ac-text-muted" style={{ fontSize: '0.65rem' }}>
                                            {sessionResources.threat + threatGenerated} après
                                        </div>
                                    </button>
                                </div>
                                {extraDiceCount > 0 && (
                                    <div className="flex items-center justify-between ac-text-muted" style={{ fontSize: '0.72rem' }}>
                                        <span>
                                            {momentumSpent > 0 && `${momentumSpent} Momentum`}
                                            {momentumSpent > 0 && threatGenerated > 0 && ' · '}
                                            {threatGenerated > 0 && `${threatGenerated} Threat généré`}
                                        </span>
                                        <button onClick={resetExtraDice} className="ac-btn ac-btn-ghost" style={{ padding: '0.1rem 0.4rem', fontSize: '0.65rem' }}>
                                            Réinitialiser
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Fortune pré-jet */}
                        <div className="ac-card-alt">
                            <div className="ac-label mb-2" style={{ color: 'var(--ac-fortune-color)' }}>
                                Fortune — forcer un dé à 1 (2 succès garantis)
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setFortunePreRoll(v => Math.max(0, v - 1))}
                                    disabled={fortunePreRoll <= 0}
                                    className="ac-btn ac-btn-ghost w-7 h-7 p-0 flex items-center justify-center disabled:opacity-30"
                                >−</button>
                                <div className="text-center">
                                    <div className="ac-resource-value" style={{ color: 'var(--ac-fortune-color)' }}>{fortunePreRoll}</div>
                                    <div className="ac-text-muted" style={{ fontSize: '0.6rem' }}>dé{fortunePreRoll > 1 ? 's' : ''} forcé{fortunePreRoll > 1 ? 's' : ''}</div>
                                </div>
                                <button
                                    onClick={() => setFortunePreRoll(v => v + 1)}
                                    disabled={!canSpendFortunePreRoll}
                                    className="ac-btn ac-btn-ghost w-7 h-7 p-0 flex items-center justify-center disabled:opacity-30"
                                >+</button>
                                <div className="ac-text-muted" style={{ fontSize: '0.7rem' }}>
                                    {fortuneAvailable} Fortune disponible
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setStep(1)} className="ac-btn ac-btn-ghost flex-1">← Retour</button>
                            <button
                                onClick={handleSkillRoll}
                                disabled={rolling}
                                className="ac-btn ac-btn-primary flex-1 disabled:opacity-30"
                            >
                                {rolling ? '⏳…' : `🎲 Lancer ${dicesToRoll > 0 ? `${dicesToRoll}d20` : ''}${fortunePreRoll > 0 ? ` + ${fortunePreRoll}×1` : ''}`}
                            </button>
                        </div>
                    </div>
                )}

                {/* ══ ÉTAPE 3 — Résultat jet de compétence ═════════════════ */}
                {step === 3 && diceResults.length > 0 && (
                    <div className="flex flex-col gap-4">

                        {/* Déclaration expertise — seulement si la compétence a un focus */}
                        {hasFocus && (
                            <div className="ac-card-alt">
                                <Toggle
                                    checked={expertiseApplied}
                                    onChange={handleExpertiseToggle}
                                    variant="default"
                                    label="Expertise applicable"
                                    sublabel={`Focus : ${selectedSkill?.focus} — résultats ≤ ${skillRank} comptent pour 2 succès`}
                                />
                            </div>
                        )}

                        {/* Dés */}
                        <div>
                            <div className="ac-label mb-1.5">
                                Résultats
                                {fortuneForReroll > 0 && (
                                    <span className="ac-text-muted ml-2" style={{ fontSize: '0.65rem' }}>
                                        (cliquer sur un dé pour relancer — coûte 1 Fortune, {fortuneForReroll} restante{fortuneForReroll > 1 ? 's' : ''})
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {diceResults.map((val, i) => (
                                    <Die20
                                        key={i}
                                        value={val}
                                        target={rawTarget}
                                        skillRank={rawSkillRank}
                                        expertiseApplied={expertiseApplied}
                                        forced={forcedResults.includes(i)}
                                        canReroll={fortuneForReroll > 0}
                                        onClick={() => handleRerollDie(i)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Verdict */}
                        <div className={`ac-verdict ${success ? 'success' : 'failure'}`}>
                            <div className="ac-verdict-title">{success ? '✓ SUCCÈS' : '✗ ÉCHEC'}</div>
                            <div className="ac-verdict-sub">
                                {successes} succès / {difficulty} requis
                                {success && momentum > 0 && ` · +${momentum} Momentum`}
                            </div>
                        </div>

                        {/* Complications */}
                        {complications > 0 && (
                            <div className="ac-text-muted text-center" style={{ fontSize: '0.8rem', color: 'var(--ac-accent)' }}>
                                ⚠ {complications} complication(s)
                            </div>
                        )}

                        {/* Confirmation et propagation des ressources */}
                        {!complicationsEmitted && (
                            <button onClick={handleConfirmResult} className="ac-btn ac-btn-secondary w-full">
                                Confirmer le résultat
                                {momentum > 0 && ` (+${momentum} Momentum)`}
                                {complications > 0 && ` (${complications} complication${complications > 1 ? 's' : ''})`}
                            </button>
                        )}
                        {complicationsEmitted && (
                            <div className="ac-text-muted text-center" style={{ fontSize: '0.72rem' }}>✓ Résultat transmis</div>
                        )}

                        {/* Actions suivantes */}
                        <div className="flex flex-col gap-2">
                            {success && (character.weapons?.length ?? 0) > 0 && (
                                <button onClick={() => setStep(4)} className="ac-btn ac-btn-primary w-full">
                                    ⚄ Lancer les dommages →
                                </button>
                            )}
                            <button onClick={onClose} className="ac-btn ac-btn-ghost w-full">Fermer</button>
                        </div>
                    </div>
                )}

                {/* ══ ÉTAPE 4 — Sélection arme + dommages ══════════════════ */}
                {step === 4 && (
                    <div className="flex flex-col gap-4">
                        <div>
                            <div className="ac-label mb-1.5">Arme</div>
                            <div className="flex flex-col gap-1">
                                {(character.weapons ?? []).map((w, i) => (
                                    <button
                                        key={w.id ?? i}
                                        onClick={() => setSelectedWeapon(w)}
                                        className={`ac-select-btn${selectedWeapon?.id === w.id ? ' selected' : ''} flex items-center justify-between px-3 py-2`}
                                    >
                                        <div>
                                            <span className="ac-font-title" style={{ fontSize: '0.82rem' }}>{w.name}</span>
                                            {w.focus && <span className="ac-text-muted ml-2" style={{ fontSize: '0.7rem' }}>{w.focus}</span>}
                                        </div>
                                        <div className="flex gap-2 ac-text-muted" style={{ fontSize: '0.7rem' }}>
                                            <span className="text-secondary">{w.damage}⚄</span>
                                            {w.salvo && <span>{w.salvo}</span>}
                                            <span>{w.range}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {selectedWeapon && (
                            <>
                                <div className="ac-card-alt flex items-center justify-between">
                                    <div>
                                        <div className="ac-label">Pool de Dés de Défi</div>
                                        <div className="ac-text-muted" style={{ fontSize: '0.7rem' }}>
                                            {selectedWeapon.damage}⚄ arme
                                            {bonusDamage > 0 && ` + ${bonusDamage}⚄ Bonus (${attackAttrKey})`}
                                            {damageBonusDice > 0 && ` + ${damageBonusDice}⚄ achetés`}
                                        </div>
                                    </div>
                                    <div className="ac-resource-value text-secondary">{totalDicePool}</div>
                                </div>

                                {damageBonusDice < MAX_DAMAGE_BONUS && sessionResources.momentum > 0 && (
                                    <div>
                                        <div className="ac-label mb-1">Dés supplémentaires (1 Momentum / dé, max 3)</div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setDamageBonusDice(d => Math.max(0, d - 1))} disabled={damageBonusDice <= 0} className="ac-btn ac-btn-ghost w-8 h-8 p-0 flex items-center justify-center disabled:opacity-30">−</button>
                                            <span className="ac-value w-8 text-center">{damageBonusDice}</span>
                                            <button onClick={() => setDamageBonusDice(d => Math.min(MAX_DAMAGE_BONUS, Math.min(sessionResources.momentum, d + 1)))} disabled={damageBonusDice >= MAX_DAMAGE_BONUS || damageBonusDice >= sessionResources.momentum} className="ac-btn ac-btn-ghost w-8 h-8 p-0 flex items-center justify-center disabled:opacity-30">+</button>
                                            <span className="ac-text-muted" style={{ fontSize: '0.7rem' }}>{sessionResources.momentum} Momentum dispo</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="flex gap-2">
                            {mode === 'skill' && <button onClick={() => setStep(3)} className="ac-btn ac-btn-ghost flex-1">← Retour</button>}
                            <button
                                onClick={handleDamageRoll}
                                disabled={rolling || !selectedWeapon || totalDicePool < 1}
                                className="ac-btn ac-btn-primary flex-1 disabled:opacity-30"
                            >
                                {rolling ? '⏳…' : `⚄ Lancer ${totalDicePool}d6`}
                            </button>
                        </div>
                    </div>
                )}

                {/* ══ ÉTAPE 5 — Résultat dommages ══════════════════════════ */}
                {step === 5 && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                            {damageResults.map((val, i) => (
                                <Die6 key={i} value={val} salvoUpper={salvoUpper} />
                            ))}
                        </div>

                        <div className="ac-verdict ac-card-alt text-center">
                            <div className="ac-verdict-title" style={{ color: 'var(--ac-accent)' }}>
                                {damageCalc.stress} stress
                            </div>
                            {damageCalc.effects > 0 && (
                                <div className="ac-verdict-sub text-secondary">
                                    {damageCalc.effects} effet(s) — {selectedWeapon?.salvo || 'Salvo'}
                                </div>
                            )}
                        </div>

                        {hasSalvo && (
                            <div className="ac-card-alt">
                                <Toggle
                                    checked={salvoUsed}
                                    onChange={handleSalvoSwitch}
                                    variant="accent"
                                    label={`Utiliser effet Salvo (${selectedWeapon?.salvo})`}
                                    sublabel={`−1 munition · Ammo : ${character.ammo ?? 0}`}
                                    disabled={(character.ammo ?? 0) <= 0 && !salvoUsed}
                                />
                            </div>
                        )}

                        <button onClick={onClose} className="ac-btn ac-btn-primary w-full">Fermer</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AchtungDiceModal;
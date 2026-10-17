// src/client/src/systems/vikings/components/modals/DiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale de jet Vikings (diceEngine async).
//
// Responsabilité : UX/UI uniquement.
//   - Construit le ctx depuis les choix du joueur
//   - Appelle vikingsConfig.dice.buildNotation(ctx) puis await roll(notation, ctx, hooks)
//   - Affiche le résultat rendu par roll() (animation + persist inclus dans roll())
//
// Lot 4c : habillage de la planche ; malus (fatigue, blessures) annoncés avant
// le jet et détaillés ligne par ligne dans le résultat ; en assurance, le jet
// retenu est montré à part du jet écarté (l'ancien affichage montrait deux fois
// le premier jet quand le second était retenu).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    getBestCharacteristic, getBlessureMalus,
    getFatigueMalus, getFatigueState,
    getSuccessThreshold, applyRollOutcome,
} from '../../config/rules.js';
import { formatExplosion, formatSkillName } from '../../config/utils.js';
import getTraitBonuses from '../../config/traitBonuses.js';
import { CARACNAMES }  from '../../config/competences.js';
import { roll, RollError } from '../../../../tools/diceEngine.js';
import vikingsConfig   from '../../config.jsx';
import { useFetch }    from '../../../../hooks/useFetch.js';
import { useSystem }   from '../../../../hooks/useSystem.js';
import VkModal from '../ui/VkModal.jsx';
import VkIcon  from '../ui/VkIcon.jsx';

const SAGA_MODES = [
    { value: null,        label: 'Normal' },
    { value: 'heroic',    label: 'Héroïque (4)' },
    { value: 'epic',      label: 'Épique (5)' },
    { value: 'insurance', label: 'Assurance' },
];
const SAGA_HELP = {
    heroic:    '3 succès au moins (tout compris) : 1 Saga dépensée, 3d10 de plus (7+). Total ≥ 4 : la Saga revient.',
    epic:      '3 succès au moins (tout compris) : 1 Saga dépensée, 3d10 de plus (7+). Total ≥ 5 : la Saga revient.',
    insurance: 'Deux jets, le meilleur est retenu. 1 Saga dépensée.',
};

const hasInfatigable = (character) => character.traits?.some(t => t.name === 'Infatigable');

// onUpdate reçoit un updater (prev => next) : onCharacterUpdate de PlayerPage
// côté joueur, update de TabSession côté MJ.
const DiceModal = ({ character, isBerserk, context, onClose, onUpdate, sessionId = null }) => {

    // ── État UI ───────────────────────────────────────────────────────────────
    const [rollType,      setRollType]      = useState('carac');
    const [selectedCarac, setSelectedCarac] = useState('force');
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [autoSuccesses, setAutoSuccesses] = useState(0);
    const [aimBonus,      setAimBonus]      = useState(0); // actions de visée (C-5)
    const [sagaMode,      setSagaMode]      = useState(null); // null | 'insurance' | 'heroic' | 'epic'
    const [diceResults,   setDiceResults]   = useState(null);
    const [rolling,       setRolling]       = useState(false);
    const [error,         setError]         = useState(null);

    // Bonus traits
    const [traitAutoBonus,           setTraitAutoBonus]           = useState(0);
    const [conditionalBonuses,       setConditionalBonuses]       = useState([]);
    const [activeConditionalBonuses, setActiveConditionalBonuses] = useState([]);

    const fetchWithAuth = useFetch();
    const { apiBase }   = useSystem();

    const contextRef = useRef(context);
    useEffect(() => { contextRef.current = context; }, [context]);

    // ── Contexte pré-rempli depuis la fiche ──────────────────────────────────
    useEffect(() => {
        if (context?.type === 'carac') {
            setRollType('carac');
            setSelectedCarac(context.data);
        } else if (context?.type === 'skill') {
            setRollType('skill');
            setSelectedSkill(context.data);
        }
    }, [context]);

    // ── Recalcul des bonus traits ─────────────────────────────────────────────
    useEffect(() => {
        const rollTarget = rollType === 'skill' ? selectedSkill?.name : null;
        const caracUsedName = rollType === 'carac'
            ? selectedCarac
            : (selectedSkill ? getBestCharacteristic(character, selectedSkill).name : null);

        const traitBonuses = getTraitBonuses(character, caracUsedName, rollTarget);
        setTraitAutoBonus(traitBonuses.auto);
        setConditionalBonuses(traitBonuses.conditional.filter(c => c.applies !== false));
        setActiveConditionalBonuses([]);
    }, [rollType, selectedCarac, selectedSkill, character]);

    // ── Construire le ctx de base ─────────────────────────────────────────────
    const buildCtx = useCallback(() => {
        const caracLevel = rollType === 'carac'
            ? (character[selectedCarac] || 2)
            : (selectedSkill ? getBestCharacteristic(character, selectedSkill).level : 2);

        const threshold = rollType === 'skill' && selectedSkill
            ? getSuccessThreshold(selectedSkill.level)
            : 7;

        const blessureMalus = isBerserk ? 0 : getBlessureMalus(character.tokensBlessure);
        const pool = Math.max(1, 3 - blessureMalus);

        return {
            // Accès réseau (pour persist dans diceEngine)
            apiBase,
            fetchFn:       fetchWithAuth,
            // Métadonnées historique
            characterId:   character.id,
            characterName: `${character.prenom}${character.surnom ? ` "${character.surnom}"` : ''}`,
            sessionId,
            rollType:      'vikings_skill', // identifiant libre pour l'historique
            // Affichage
            label: rollType === 'skill' && selectedSkill
                ? formatSkillName(selectedSkill)
                : CARACNAMES[selectedCarac] || selectedCarac,
            // Données système opaques
            character, // objet complet pour getTraitBonuses dans beforeRoll
            systemData: {
                pool,
                rollType,
                selectedCarac,
                selectedSkill,
                autoSuccesses,
                aimBonus,
                activeConditionalBonuses,
                traitAutoBonus,
                caracLevel,
                threshold,
                skillLevel:     selectedSkill?.level || 0,
                tokensBlessure: character.tokensBlessure,
                tokensFatigue:  character.tokensFatigue,
                isBerserk,
                sagaActuelle:   character.sagaActuelle,
                declaredMode:   sagaMode,
            },
        };
    }, [
        character, isBerserk, rollType, selectedCarac, selectedSkill,
        autoSuccesses, aimBonus, activeConditionalBonuses, traitAutoBonus,
        sagaMode, sessionId, apiBase, fetchWithAuth,
    ]);

    // ── Lancer les dés ────────────────────────────────────────────────────────
    const handleRoll = useCallback(async () => {
        if (rolling) return;
        setRolling(true);
        setDiceResults(null);
        setError(null);

        // Dépenses du jet (SAGA, points de compétence) : une seule mise à jour,
        // appliquée à l'état le plus récent (updater) — sinon les dépenses
        // successives s'écrasaient entre elles.
        const sagaSpent   = sagaMode ? 1 : 0;
        const pointsSpent = rollType === 'skill' && selectedSkill ? autoSuccesses : 0;
        const skill       = selectedSkill;

        try {
            const ctx      = buildCtx();
            const notation = vikingsConfig.dice.buildNotation(ctx);

            // Dépenser les ressources AVANT roll() (UI optimiste)
            if (sagaSpent || pointsSpent) {
                onUpdate(prev => applyRollOutcome(prev, { sagaSpent, skill, skillPointsSpent: pointsSpent }));
            }
            if (pointsSpent) {
                setSelectedSkill(prev => prev
                    ? { ...prev, currentPoints: Math.max(0, prev.currentPoints - pointsSpent) }
                    : prev
                );
            }

            // roll() est async : gère animation + persist en interne
            const result = await roll(notation, ctx, vikingsConfig.dice);

            // SAGA : le point dépensé revient après un jet héroïque/épique réussi
            // (pas un gain) ; un triple 10 rapporte +1 SAGA (gain, D-15)
            const sagaRestored = result.meta?.sagaSuccess ? 1 : 0;
            const tripleTen    = !!result.meta?.tripleTen;
            if (sagaRestored || tripleTen) {
                onUpdate(prev => applyRollOutcome(prev, { sagaRestored, tripleTen }));
            }

            setDiceResults(result);
            context?.onRollComplete?.(result);

        } catch (err) {
            if (err instanceof RollError) {
                setError(err.message);
                // Annuler la dépense si validation échouée
                if (sagaSpent || pointsSpent) {
                    onUpdate(prev => applyRollOutcome(prev, { sagaRestored: sagaSpent, skill, skillPointsSpent: -pointsSpent }));
                }
            } else {
                console.error('[DiceModal]', err);
                setError('Erreur inattendue lors du jet.');
            }
        } finally {
            setRolling(false);
        }
    }, [
        rolling, buildCtx, sagaMode, rollType, selectedSkill, autoSuccesses,
        onUpdate, context,
    ]);

    const title = rollType === 'skill' && selectedSkill
        ? formatSkillName(selectedSkill)
        : CARACNAMES[selectedCarac] || 'Lancer les dés';

    // ── Rendu : résultats ────────────────────────────────────────────────────
    if (diceResults) {
        return (
            <VkModal title={`Résultat — ${title}`} onClose={onClose}>
                <DiceResults results={diceResults} character={character} />
                <div className="flex gap-2 mt-4">
                    <button type="button" className="vk-btn flex-1" onClick={() => { setDiceResults(null); setSagaMode(null); }}>Relancer</button>
                    <button type="button" className="vk-btn vk-btn-primary flex-1" onClick={onClose}>Fermer</button>
                </div>
            </VkModal>
        );
    }

    // ── Rendu : formulaire ────────────────────────────────────────────────────
    const caracLevel = rollType === 'carac'
        ? (character[selectedCarac] || 2)
        : (selectedSkill ? getBestCharacteristic(character, selectedSkill).level : 2);
    const caracName = rollType === 'carac'
        ? selectedCarac
        : (selectedSkill ? getBestCharacteristic(character, selectedSkill).name : null);
    const threshold     = rollType === 'skill' && selectedSkill ? getSuccessThreshold(selectedSkill.level) : 7;
    const blessureMalus = isBerserk ? 0 : getBlessureMalus(character.tokensBlessure);
    const pool          = Math.max(1, 3 - blessureMalus);
    const fatigueMalus  = hasInfatigable(character) ? 0 : getFatigueMalus(character.tokensFatigue);
    const condSum       = activeConditionalBonuses.reduce((s, b) => s + b.bonus, 0);
    const traitTotal    = traitAutoBonus + condSum + (isBerserk ? 2 : 0);

    return (
        <VkModal title={title} icon="die" onClose={onClose}>
            {error && <div className="vk-callout vk-callout-danger mb-3">{error}</div>}

            <div className="flex flex-wrap gap-1.5 mb-3">
                <button type="button" className={`vk-pill ${rollType === 'carac' ? 'is-selected' : ''}`} onClick={() => setRollType('carac')}>Caractéristique</button>
                <button type="button" className={`vk-pill ${rollType === 'skill' ? 'is-selected' : ''}`} onClick={() => setRollType('skill')}>Compétence</button>
            </div>

            {rollType === 'carac' ? (
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {Object.entries(CARACNAMES).map(([key, name]) => (
                        <button key={key} type="button" onClick={() => setSelectedCarac(key)}
                                className={`vk-pill justify-center ${selectedCarac === key ? 'is-selected' : ''}`}>
                            {name} ({character[key] || 2})
                        </button>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-1 mb-3 max-h-44 overflow-y-auto pr-1">
                    {(character.skills || [])
                        .filter(s => s.level > 0)
                        .sort((a, b) => b.level - a.level)
                        .map(skill => {
                            const selected = selectedSkill?.name === skill.name && selectedSkill?.specialization === skill.specialization;
                            return (
                                <button key={`${skill.name}-${skill.specialization || ''}`} type="button" onClick={() => setSelectedSkill(skill)}
                                        className={`vk-pill w-full justify-between ${selected ? 'is-selected' : ''}`}>
                                    <span>{formatSkillName(skill)}</span>
                                    <span className="vk-num">seuil {getSuccessThreshold(skill.level)}+ · pts {skill.currentPoints}/{skill.level}</span>
                                </button>
                            );
                        })}
                </div>
            )}

            {/* Paramètres du jet, puis malus bien visibles */}
            <div className="vk-callout text-sm mb-2">
                <strong>{pool}d10</strong> · explosion sur <strong>{formatExplosion(caracLevel)}</strong>
                {caracName && <> ({CARACNAMES[caracName]} {caracLevel})</>}
                {' '}· succès sur <strong>{threshold}+</strong>
                {rollType === 'skill' && selectedSkill && <> (niveau {selectedSkill.level})</>}
                {traitTotal !== 0 && <> · traits <strong>{traitTotal > 0 ? '+' : ''}{traitTotal}</strong></>}
            </div>
            {blessureMalus > 0 && (
                <div className="vk-callout vk-callout-warn text-sm mb-2 flex gap-2 items-start">
                    <VkIcon name="blood" className="mt-0.5" />
                    <span><strong>Blessures ({character.tokensBlessure}) : −{blessureMalus} dé{blessureMalus > 1 ? 's' : ''}.</strong> Le jet se fait avec {pool}d10.</span>
                </div>
            )}
            {fatigueMalus > 0 && (
                <div className="vk-callout vk-callout-warn text-sm mb-2 flex gap-2 items-start">
                    <VkIcon name="moon" className="mt-0.5" />
                    <span><strong>Fatigue — {getFatigueState(character.tokensFatigue)} ({character.tokensFatigue} tokens) : +{fatigueMalus} succès requis.</strong> Il faudra {fatigueMalus > 1 ? `${fatigueMalus} succès` : 'un succès'} de plus pour réussir.</span>
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 my-4">
                {rollType === 'skill' && selectedSkill && selectedSkill.currentPoints > 0 && (
                    <div>
                        <div className="vk-field-label">Succès automatiques ({selectedSkill.currentPoints} pts)</div>
                        <div className="flex gap-1.5">
                            {[0, 1, 2, 3].filter(n => n <= selectedSkill.currentPoints).map(n => (
                                <button key={n} type="button" className={`vk-pill ${autoSuccesses === n ? 'is-selected' : ''}`} onClick={() => setAutoSuccesses(n)}>{n}</button>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <div className="vk-field-label"><VkIcon name="arrow" /> Actions de visée</div>
                    <div className="vk-stepper">
                        <button type="button" onClick={() => setAimBonus(n => Math.max(0, n - 1))} disabled={aimBonus <= 0}><VkIcon name="minus" /></button>
                        <span className="vk-num">{aimBonus}</span>
                        <button type="button" onClick={() => setAimBonus(n => n + 1)}><VkIcon name="plus" /></button>
                    </div>
                </div>
            </div>

            {conditionalBonuses.length > 0 && (
                <div className="mb-4">
                    <div className="vk-field-label">Traits conditionnels</div>
                    <div className="space-y-1">
                        {conditionalBonuses.map(cond => {
                            const isActive = activeConditionalBonuses.some(b => b.name === cond.name);
                            return (
                                <button key={cond.name} type="button"
                                        onClick={() => setActiveConditionalBonuses(prev => isActive ? prev.filter(b => b.name !== cond.name) : [...prev, cond])}
                                        className={`vk-pill w-full justify-between ${isActive ? 'is-selected' : ''}`}>
                                    <span className="text-left">{cond.name} <span className="opacity-75">— {cond.condition}</span></span>
                                    <span className="vk-num">{cond.bonus > 0 ? '+' : ''}{cond.bonus}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="vk-field-label">Mode Saga ({character.sagaActuelle} disponible{character.sagaActuelle > 1 ? 's' : ''})</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                {SAGA_MODES.map(({ value, label }) => (
                    <button key={String(value)} type="button" onClick={() => setSagaMode(value)}
                            disabled={value !== null && character.sagaActuelle < 1}
                            className={`vk-pill justify-center disabled:opacity-40 ${sagaMode === value ? 'is-selected' : ''}`}>
                        {label}
                    </button>
                ))}
            </div>
            {sagaMode && <p className="text-xs text-muted mb-2">{SAGA_HELP[sagaMode]}</p>}

            <button type="button" onClick={handleRoll}
                    disabled={rolling || (rollType === 'skill' && !selectedSkill)}
                    className="vk-btn vk-btn-primary w-full mt-3 py-2.5">
                <VkIcon name="die" />{rolling ? 'Les dés roulent…' : 'Lancer les dés'}
            </button>
        </VkModal>
    );
};

// ─── Résultat ─────────────────────────────────────────────────────────────────

// Dés dans l'ordre du moteur : un dé qui suit une explosion en est issu (↳)
const DiceRow = ({ dice, threshold, explosionThresholds, dropped = false }) => (
    <div className="flex flex-wrap gap-3 justify-center pl-3">
        {(dice || []).map((die, i) => {
            const chained = i > 0 && (explosionThresholds || []).includes(dice[i - 1]);
            const exploded = (explosionThresholds || []).includes(die);
            const state = dropped ? 'is-dropped' : exploded ? 'is-explode' : die >= threshold ? 'is-success' : '';
            return <span key={i} className={`vk-die ${state} ${chained ? 'is-chained' : ''}`}>{die}</span>;
        })}
    </div>
);

const CalcRow = ({ label, value, malus = false }) => (
    <tr className={malus ? 'is-malus' : ''}><td>{label}</td><td>{value}</td></tr>
);
const signed = (n) => (n > 0 ? `+${n}` : `${n}`);

const DiceResults = ({ results, character }) => {
    const { detail = {}, meta = {}, successes, allDice = [] } = results;
    const threshold = detail.threshold ?? 7;
    const expl      = detail.explosionThresholds ?? [10];
    const insurance = meta.keptGroup != null;
    const saga      = !insurance && meta.finalTarget != null;

    // Assurance : allDice = jet 1 puis jet 2 ; meta.secondaryValues = le jet écarté
    let kept = allDice, dropped = null, sagaDice = null;
    if (insurance) {
        dropped = meta.secondaryValues ?? [];
        kept = meta.keptGroup === 0 ? allDice.slice(0, allDice.length - dropped.length) : allDice.slice(dropped.length);
    } else if (saga) {
        sagaDice = meta.sagaValues ?? [];
        kept = allDice.slice(0, allDice.length - sagaDice.length);
    }
    const fatigueState = getFatigueState(character.tokensFatigue);

    return (
        <>
            {meta.tripleTen && (
                <div className="vk-banner mb-4"><span className="vk-rune">ᛊ</span>Triple 10 ! {meta.sagaGained ? '+1 Saga' : 'Saga déjà au maximum'}</div>
            )}

            {insurance && <div className="flex justify-center mb-1"><span className="vk-tag vk-tag-gold">Jet retenu</span></div>}
            <DiceRow dice={kept} threshold={threshold} explosionThresholds={expl} />
            {insurance && (
                <div className="mt-3 opacity-90">
                    <div className="flex justify-center mb-1"><span className="vk-tag vk-tag-muted">Jet écarté</span></div>
                    <DiceRow dice={dropped} threshold={threshold} explosionThresholds={expl} dropped />
                </div>
            )}
            {saga && !meta.sagaFailed && (
                <div className="mt-3">
                    <div className="flex justify-center mb-1"><span className="vk-tag vk-tag-gold">Jet de Saga {meta.finalTarget === 5 ? 'épique' : 'héroïque'} (7+)</span></div>
                    <DiceRow dice={sagaDice} threshold={7} explosionThresholds={[10]} />
                </div>
            )}

            <table className="vk-calc mt-4">
                <tbody>
                    <CalcRow label={`Dés : ${detail.baseSuccesses ?? 0} réussi${(detail.baseSuccesses ?? 0) > 1 ? 's' : ''} sur ${threshold}+ (${detail.pool ?? 3}d10)`} value={detail.baseSuccesses ?? 0} />
                    {saga && !meta.sagaFailed && <CalcRow label="Jet de Saga" value={signed(meta.bonusSuccesses ?? 0)} />}
                    {(detail.autoSuccesses ?? 0) > 0 && <CalcRow label="Succès automatiques" value={signed(detail.autoSuccesses)} />}
                    {(meta.aimBonus ?? 0) > 0 && <CalcRow label="Visée" value={signed(meta.aimBonus)} />}
                    {(detail.traitBonus ?? 0) !== 0 && <CalcRow label="Traits" value={signed(detail.traitBonus)} />}
                    {(detail.fatigueMalus ?? 0) > 0 && <CalcRow label={`Fatigue${fatigueState ? ` — ${fatigueState}` : ''}`} value={`−${detail.fatigueMalus}`} malus />}
                    <tr className="is-total"><td>Succès</td><td>{successes}</td></tr>
                </tbody>
            </table>
            {(detail.blessureMalus ?? 0) > 0 && (
                <p className="text-xs vk-text-warn mt-1">Blessures : jet fait avec {detail.pool}d10 au lieu de 3.</p>
            )}

            {saga && (
                <div className={`vk-callout mt-3 text-sm ${meta.sagaSuccess ? '' : 'vk-callout-warn'}`}>
                    {meta.sagaSuccess
                        ? <>Réussite {meta.finalTarget === 5 ? 'épique' : 'héroïque'} : la Saga dépensée revient.</>
                        : <>Jet de Saga manqué : {meta.failReason}. La Saga dépensée est perdue.</>}
                </div>
            )}
        </>
    );
};

export default DiceModal;

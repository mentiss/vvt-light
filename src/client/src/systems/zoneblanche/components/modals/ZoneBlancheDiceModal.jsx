// src/client/src/systems/zoneblanche/components/modals/ZoneBlancheDiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale de jet Zone Blanche — deux états distincts (pas de résultat empilé
// sous la sélection) :
//
//   État 1 — SÉLECTION
//     Principe + Compétence · Focus applicable · Difficulté (0–5)
//     Achat de d20 : compteurs Audimat et Stress séparés, barème progressif
//     indépendant par jauge (1/2/3), total acheté plafonné à 3 (5d20 max)
//     Talents : « 1er d20 gratuit », « relance gratuite »
//     Prime Time : stepper de dés garantis à 1 (plusieurs possibles)
//
//   État 2 — RÉSULTAT
//     Clic sur un dé = relance : gratuite si la relance de talent n'a pas
//     encore servi, sinon consomme 1 Prime Time.
//     Marge convertible en Audimat (plafond 6).
//
// Dépenses : appliquées APRÈS le jet (Audimat/Stress par route REST,
// Prime Time par patchImmediate) — jamais d'émission socket ici.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useCallback } from 'react';
import { roll, RollError } from '../../../../tools/diceEngine.js';
import { useFetch }        from '../../../../hooks/useFetch.js';
import { useSystem }       from '../../../../hooks/useSystem.js';
import zoneblancheConfig, {
    PRINCIPES, COMPETENCES,
    MAX_DES_ACHETES, POOL_BASE, DIFFICULTE_MIN, DIFFICULTE_MAX, AUDIMAT_MAX,
    coutProchainDe, coutCumule,
} from '../../config.jsx';

// ── Dé affiché dans l'état résultat ──────────────────────────────────────────

const DieButton = ({ detail, canReroll, onReroll }) => {
    const cls = detail.complication ? 'is-complication'
        : detail.critique ? 'is-crit'
            : detail.successes > 0 ? 'is-hit'
                : 'is-miss';

    return (
        <button
            type="button"
            onClick={() => canReroll && !detail.garanti && onReroll()}
            disabled={!canReroll || detail.garanti}
            className={`zb-die zb-die-lg ${cls}`}
            title={detail.garanti
                ? 'Dé garanti par Prime Time — non relançable'
                : canReroll ? 'Cliquer pour relancer' : 'Aucune relance disponible'}
        >
            {detail.roll}
        </button>
    );
};

// ── Compteur d'achat pour une jauge ──────────────────────────────────────────

const BuyCounter = ({ label, achetes, onAdjust, disponible, canAdd }) => (
    <div className="zb-buy-row">
        <div className="min-w-0">
            <div className="font-semibold text-default text-sm">{label}</div>
            <div className="zb-eyebrow">
                {achetes > 0 ? `${coutCumule(achetes)} dépensé${coutCumule(achetes) > 1 ? 's' : ''}` : `Prochain dé : ${coutProchainDe(0)}`}
                {disponible != null && ` · ${disponible} dispo`}
            </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => onAdjust(-1)} disabled={achetes <= 0}
                    className="zb-btn-ghost w-8 h-8 rounded-sm font-bold">−</button>
            <span className="zb-mono text-lg w-6 text-center text-default">{achetes}</span>
            <button type="button" onClick={() => onAdjust(1)} disabled={!canAdd}
                    className="zb-btn-ghost w-8 h-8 rounded-sm font-bold">+</button>
        </div>
    </div>
);

// ── Modale ───────────────────────────────────────────────────────────────────

const ZoneBlancheDiceModal = ({
                                  character,
                                  onCharacterUpdate,
                                  sessionId,
                                  sessionResources = { audimat: 0, stress: 0 },
                                  onResourcesChange,
                                  preselect = {},
                                  onClose,
                              }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    // ── État 1 : sélection ────────────────────────────────────────────────
    const [principeKey, setPrincipeKey]     = useState(preselect.principeKey ?? PRINCIPES[0].key);
    const [competenceKey, setCompetenceKey] = useState(preselect.competenceKey ?? COMPETENCES[0].key);
    const [difficulte, setDifficulte]       = useState(1);
    const [useFocus, setUseFocus]           = useState(false);
    const [achatAudimat, setAchatAudimat]   = useState(0);
    const [achatStress, setAchatStress]     = useState(0);
    const [deGratuit, setDeGratuit]         = useState(false);   // talent : 1er d20 gratuit
    const [relanceGratuite, setRelanceGratuite] = useState(false); // talent : relance gratuite
    const [garantis, setGarantis]           = useState(0);       // Prime Time avant lancer

    // ── État 2 : résultat ─────────────────────────────────────────────────
    const [result, setResult]               = useState(null);
    const [rolling, setRolling]             = useState(false);
    const [error, setError]                 = useState(null);
    const [relanceDispo, setRelanceDispo]   = useState(false);
    const [primeTimeUtilise, setPrimeTimeUtilise] = useState(0);
    const [margeConvertie, setMargeConvertie]     = useState(false);

    // ── Données dérivées ──────────────────────────────────────────────────
    const principes   = character?.principes ?? [];
    const competences = character?.competences ?? [];
    const focusList   = character?.focus ?? [];
    const primeTime   = character?.prime_time ?? character?.primeTime ?? 0;

    const rangPrincipe   = principes.find(p => p.key === principeKey)?.rang ?? 0;
    const rangCompetence = competences.find(c => c.key === competenceKey)?.rang ?? 0;
    const rangTotal      = rangPrincipe + rangCompetence;

    const focusDisponibles = focusList.filter(f => f.competenceKey === competenceKey);
    const hasFocus         = useFocus && focusDisponibles.length > 0;

    const desAchetes  = achatAudimat + achatStress + (deGratuit ? 1 : 0);
    const poolTotal   = POOL_BASE + desAchetes;
    const poolLance   = poolTotal - garantis;

    const coutAudimat = coutCumule(achatAudimat);
    const coutStress  = coutCumule(achatStress);

    const peutAcheterEncore = desAchetes < MAX_DES_ACHETES;
    const audimatRestant    = (sessionResources.audimat ?? 0) - coutAudimat;

    // ── Lancer ────────────────────────────────────────────────────────────
    const handleRoll = useCallback(async () => {
        setError(null);
        setRolling(true);
        try {
            const label = `${PRINCIPES.find(p => p.key === principeKey)?.label} + ${COMPETENCES.find(c => c.key === competenceKey)?.label}`;

            const ctx = {
                apiBase,
                fetchFn:       fetchWithAuth,
                characterId:   character?.id ?? null,
                characterName: [character?.prenom, character?.nom].filter(Boolean).join(' ') || null,
                sessionId:     sessionId ?? null,
                rollType:      'zoneblanche_2d20',
                label,
                systemData: {
                    pool:             poolLance,
                    garantis,
                    rang:             rangTotal,
                    rangCompetence,
                    hasFocus,
                    difficulte,
                    audimatDepense:   coutAudimat,
                    stressGenere:     coutStress,
                    primeTimeDepense: garantis,
                },
            };

            const notation = zoneblancheConfig.dice.buildNotation(ctx);
            const res      = await roll(notation, ctx, zoneblancheConfig.dice);

            setResult(res);
            setRelanceDispo(relanceGratuite);
            setPrimeTimeUtilise(garantis);

            // ── Application des dépenses (après le jet) ───────────────────
            // Deux sens opposés :
            //   · Audimat : réserve des joueurs → DÉBIT (delta négatif)
            //   · Stress  : réserve du MJ → CRÉDIT (delta positif). Acheter un
            //     d20 « en Stress » revient à en offrir au MJ. La route
            //     n'autorise aux joueurs que les deltas positifs sur ce champ.
            if (sessionId) {
                const ajustements = [];
                if (coutAudimat > 0) ajustements.push({ field: 'audimat', delta: -coutAudimat });
                if (coutStress  > 0) ajustements.push({ field: 'stress',  delta:  coutStress  });

                for (const ajustement of ajustements) {
                    const r = await fetchWithAuth(`${apiBase}/session-resources/${sessionId}`, {
                        method:  'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify(ajustement),
                    });
                    if (r.ok) onResourcesChange?.(await r.json());
                    else console.error('[zoneblanche] ajustement ressource refusé :', ajustement);
                }
            }

            if (garantis > 0) {
                onCharacterUpdate?.({ ...character, primeTime: Math.max(0, primeTime - garantis) });
            }
        } catch (err) {
            setError(err instanceof RollError ? err.message : 'Erreur lors du jet');
        } finally {
            setRolling(false);
        }
    }, [
        apiBase, fetchWithAuth, character, sessionId, principeKey, competenceKey,
        poolLance, garantis, rangTotal, rangCompetence, hasFocus, difficulte,
        coutAudimat, coutStress, relanceGratuite, primeTime, onCharacterUpdate, onResourcesChange,
    ]);

    // ── Relance d'un dé ───────────────────────────────────────────────────
    // On repasse par roll() avec les hooks `reroll` : leur afterRoll renvoie
    // le jet COMPLET recalculé, si bien que le moteur persiste tout seul une
    // entrée d'historique cohérente (aucun POST manuel ici).
    const handleReroll = useCallback(async (index) => {
        if (!result) return;
        const gratuite = relanceDispo;
        if (!gratuite && primeTime - primeTimeUtilise <= 0) return;

        setRolling(true);
        setError(null);
        try {
            const primeTimeTotal = result.primeTimeDepense + (gratuite ? 0 : 1);

            const ctx = {
                apiBase,
                fetchFn:       fetchWithAuth,
                characterId:   character?.id ?? null,
                characterName: [character?.prenom, character?.nom].filter(Boolean).join(' ') || null,
                sessionId:     sessionId ?? null,
                rollType:      'zoneblanche_2d20',
                label:         result.label,
                systemData: {
                    valeursPrecedentes: result.details.map(d => d.roll),
                    indexRelance:       index,
                    rang:               rangTotal,
                    rangCompetence,
                    hasFocus,
                    difficulte,
                    garantis:           garantis,
                    audimatDepense:     result.audimatDepense,
                    stressGenere:       result.stressGenere,
                    primeTimeDepense:   primeTimeTotal,
                    relances:           (result.relances ?? 0) + 1,
                },
            };

            const recalcule = await roll('1d20', ctx, zoneblancheConfig.reroll);
            setResult(recalcule);

            if (gratuite) {
                setRelanceDispo(false);
            } else {
                setPrimeTimeUtilise(primeTimeTotal);
                onCharacterUpdate?.({ ...character, primeTime: Math.max(0, primeTime - primeTimeTotal) });
            }
        } catch (err) {
            console.error('[zoneblanche] relance :', err);
            setError(err instanceof RollError ? err.message : 'Erreur lors de la relance');
        } finally {
            setRolling(false);
        }
    }, [
        result, relanceDispo, primeTime, primeTimeUtilise, apiBase, fetchWithAuth,
        character, sessionId, rangTotal, rangCompetence, hasFocus, difficulte,
        garantis, onCharacterUpdate,
    ]);

    // ── Conversion de la marge en Audimat ─────────────────────────────────
    const handleMargeToAudimat = useCallback(async () => {
        if (!sessionId || !result?.marge) return;
        const place = Math.min(result.marge, AUDIMAT_MAX - (sessionResources.audimat ?? 0));
        if (place <= 0) return;
        try {
            const r = await fetchWithAuth(`${apiBase}/session-resources/${sessionId}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ field: 'audimat', delta: place }),
            });
            if (r.ok) {
                onResourcesChange?.(await r.json());
                setMargeConvertie(true);
            }
        } catch (e) {
            console.error('[zoneblanche] marge → audimat :', e);
        }
    }, [sessionId, result, sessionResources, apiBase, fetchWithAuth, onResourcesChange]);

    const peutRelancer = relanceDispo || (primeTime - primeTimeUtilise) > 0;

    // ═══════════════════════════════════════════════════════════════════════
    return (
        <div className="zb-modal-backdrop" onClick={onClose}>
            <div className="zb-modal zb-grain" onClick={e => e.stopPropagation()}>

                <div className="zb-modal-header">
                    <div className="flex items-center gap-3">
                        <span className="zb-rec-dot" />
                        <span className="zb-display text-lg">
                            {result ? 'Dépouillement' : 'Jet de dés'}
                        </span>
                    </div>
                    <button type="button" onClick={onClose} className="zb-btn-ghost px-3 py-1 rounded-sm">✕</button>
                </div>

                <div className="zb-modal-body">

                    {/* ═══════════ ÉTAT 1 — SÉLECTION ═══════════ */}
                    {!result && (
                        <div className="space-y-5">

                            {/* Principe */}
                            <div>
                                <div className="zb-eyebrow mb-2">Principe</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                                    {PRINCIPES.map(p => {
                                        const rang = principes.find(x => x.key === p.key)?.rang ?? 0;
                                        return (
                                            <button key={p.key} type="button" onClick={() => setPrincipeKey(p.key)}
                                                    className={`zb-pill px-3 py-2 rounded-sm text-sm text-center ${principeKey === p.key ? 'is-selected' : ''}`}>
                                                <div className="font-semibold">{p.label}</div>
                                                <div className="zb-mono text-xs">{rang}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Compétence */}
                            <div>
                                <div className="zb-eyebrow mb-2">Compétence</div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                                    {COMPETENCES.map(c => {
                                        const rang = competences.find(x => x.key === c.key)?.rang ?? 0;
                                        return (
                                            <button key={c.key} type="button"
                                                    onClick={() => { setCompetenceKey(c.key); setUseFocus(false); }}
                                                    className={`zb-pill px-3 py-2 rounded-sm text-sm text-center ${competenceKey === c.key ? 'is-selected' : ''}`}>
                                                <div className="font-semibold">{c.label}</div>
                                                <div className="zb-mono text-xs">{rang}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Récapitulatif du seuil */}
                            <div className="zb-target-summary">
                                <div>
                                    <div className="zb-eyebrow">Objectif</div>
                                    <div className="zb-mono text-2xl text-default">{rangTotal}</div>
                                </div>
                                <div>
                                    <div className="zb-eyebrow">Critique sur</div>
                                    <div className="zb-mono text-2xl text-default">
                                        {hasFocus ? `1 – ${rangCompetence}` : '1'}
                                    </div>
                                </div>
                                <div>
                                    <div className="zb-eyebrow">Dés</div>
                                    <div className="zb-mono text-2xl text-default">{poolTotal}</div>
                                </div>
                            </div>

                            {/* Focus */}
                            {focusDisponibles.length > 0 && (
                                <button type="button" onClick={() => setUseFocus(v => !v)}
                                        className={`zb-pill w-full px-4 py-3 rounded-sm text-sm ${useFocus ? 'is-selected' : ''}`}>
                                    <span className="font-semibold">Focus applicable</span>
                                    <span className="block text-xs opacity-80 mt-0.5">
                                        {focusDisponibles.map(f => f.texte).join(' · ')}
                                    </span>
                                </button>
                            )}

                            {/* Difficulté */}
                            <div>
                                <div className="zb-eyebrow mb-2">Difficulté</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {Array.from({ length: DIFFICULTE_MAX - DIFFICULTE_MIN + 1 }, (_, i) => i + DIFFICULTE_MIN).map(d => (
                                        <button key={d} type="button" onClick={() => setDifficulte(d)}
                                                className={`zb-pill zb-mono w-11 h-11 rounded-sm text-center ${difficulte === d ? 'is-selected' : ''}`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Achat de dés */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="zb-eyebrow">Acheter des d20</div>
                                    <span className="zb-eyebrow">{desAchetes} / {MAX_DES_ACHETES}</span>
                                </div>
                                <div className="space-y-2">
                                    <BuyCounter
                                        label="Audimat"
                                        achetes={achatAudimat}
                                        disponible={sessionResources.audimat ?? 0}
                                        canAdd={peutAcheterEncore && audimatRestant >= coutProchainDe(achatAudimat)}
                                        onAdjust={d => setAchatAudimat(v => Math.max(0, v + d))}
                                    />
                                    <BuyCounter
                                        label="Stress (au profit du MJ)"
                                        achetes={achatStress}
                                        disponible={null}
                                        canAdd={peutAcheterEncore}
                                        onAdjust={d => setAchatStress(v => Math.max(0, v + d))}
                                    />
                                </div>
                                {(coutAudimat > 0 || coutStress > 0) && (
                                    <div className="zb-eyebrow mt-2">
                                        Coût : {coutAudimat > 0 && `${coutAudimat} Audimat`}
                                        {coutAudimat > 0 && coutStress > 0 && ' · '}
                                        {coutStress > 0 && `${coutStress} Stress`}
                                    </div>
                                )}
                            </div>

                            {/* Talents */}
                            <div className="space-y-1.5">
                                <div className="zb-eyebrow mb-1">Talents actifs</div>
                                <button type="button" onClick={() => setDeGratuit(v => !v)}
                                        disabled={!deGratuit && !peutAcheterEncore}
                                        className={`zb-pill w-full px-4 py-2.5 rounded-sm text-sm ${deGratuit ? 'is-selected' : ''}`}>
                                    1<sup>er</sup> d20 gratuit
                                </button>
                                <button type="button" onClick={() => setRelanceGratuite(v => !v)}
                                        className={`zb-pill w-full px-4 py-2.5 rounded-sm text-sm ${relanceGratuite ? 'is-selected' : ''}`}>
                                    <span className="font-semibold">Première relance gratuite</span>
                                    <span className="block text-xs opacity-80 mt-0.5">
                                        Un seul dé relancé sans coût — les suivants coûtent 1 Prime Time.
                                    </span>
                                </button>
                            </div>

                            {/* Prime Time */}
                            <div className="zb-buy-row">
                                <div>
                                    <div className="font-semibold text-default text-sm">Prime Time — dés garantis à 1</div>
                                    <div className="zb-eyebrow">{primeTime} disponible{primeTime > 1 ? 's' : ''}</div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button type="button" onClick={() => setGarantis(v => Math.max(0, v - 1))}
                                            disabled={garantis <= 0}
                                            className="zb-btn-ghost w-8 h-8 rounded-sm font-bold">−</button>
                                    <span className="zb-mono text-lg w-6 text-center text-default">{garantis}</span>
                                    <button type="button" onClick={() => setGarantis(v => v + 1)}
                                            disabled={garantis >= primeTime || garantis >= poolTotal - 1}
                                            className="zb-btn-ghost w-8 h-8 rounded-sm font-bold">+</button>
                                </div>
                            </div>

                            {error && <div className="text-sm text-danger">{error}</div>}
                        </div>
                    )}

                    {/* ═══════════ ÉTAT 2 — RÉSULTAT ═══════════ */}
                    {result && (
                        <div className="space-y-5">

                            <div className="zb-result-banner">
                                <span className={`zb-history-verdict zb-mono ${result.success ? 'is-success' : 'is-failure'}`}>
                                    {result.success ? 'Réussite' : 'Échec'}
                                </span>
                                <span className="zb-mono text-lg text-default">
                                    {result.successes} succès / difficulté {result.difficulte}
                                </span>
                                {result.complications > 0 && (
                                    <span className="zb-complication-tag zb-mono">
                                        {result.complications} complication{result.complications > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>

                            {/* Dés — clic = relance */}
                            <div>
                                <div className="zb-eyebrow mb-2">
                                    {peutRelancer
                                        ? `Cliquer sur un dé pour le relancer${relanceDispo ? ' — relance gratuite disponible' : ` — coûte 1 Prime Time (${primeTime - primeTimeUtilise} restant)`}`
                                        : 'Aucune relance disponible'}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {result.details.map((d, i) => (
                                        <DieButton key={i} detail={d}
                                                   canReroll={peutRelancer && !rolling}
                                                   onReroll={() => handleReroll(i)} />
                                    ))}
                                </div>
                            </div>

                            {/* Marge → Audimat */}
                            {result.marge > 0 && sessionId && (
                                <button type="button" onClick={handleMargeToAudimat} disabled={margeConvertie}
                                        className="zb-btn-primary w-full px-4 py-3 rounded-sm zb-display">
                                    {margeConvertie
                                        ? 'Marge ajoutée à l\'Audimat'
                                        : `Ajouter ${result.marge} à l'Audimat`}
                                </button>
                            )}

                            {error && <div className="text-sm text-danger">{error}</div>}
                        </div>
                    )}
                </div>

                {/* ── Pied ─────────────────────────────────────────────────── */}
                <div className="zb-modal-footer">
                    {!result ? (
                        <>
                            <button type="button" onClick={onClose} className="zb-btn-ghost px-5 py-2.5 rounded-sm zb-display">
                                Annuler
                            </button>
                            <button type="button" onClick={handleRoll} disabled={rolling || poolLance < 1}
                                    className="zb-btn-accent px-6 py-2.5 rounded-sm zb-display">
                                {rolling ? 'Lancement…' : `Lancer ${poolTotal}d20`}
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" onClick={() => { setResult(null); setError(null); setMargeConvertie(false); }}
                                    className="zb-btn-ghost px-5 py-2.5 rounded-sm zb-display">
                                Nouveau jet
                            </button>
                            <button type="button" onClick={onClose} className="zb-btn-primary px-6 py-2.5 rounded-sm zb-display">
                                Fermer
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ZoneBlancheDiceModal;
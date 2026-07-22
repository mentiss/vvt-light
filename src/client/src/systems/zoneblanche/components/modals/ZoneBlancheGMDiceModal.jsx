// src/client/src/systems/zoneblanche/components/modals/ZoneBlancheGMDiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale de jet MJ — pour les PNJ, entités et oppositions.
//
// Différences avec la modale joueur :
//   · Aucune fiche derrière : l'objectif et le seuil de critique sont saisis
//     librement (les PNJ ne sont pas des personnages stockés).
//   · Pas de Prime Time (fortune strictement joueur) ni de dés garantis.
//   · Le Stress est la seule monnaie d'achat de d20, et il est réellement
//     débité (le MJ a le droit d'écrire sur cette jauge, contrairement aux
//     joueurs).
//   · Aucune conversion de marge en Audimat : l'Audimat est une ressource
//     joueur, le MJ ne s'en sert pas.
//
// L'interprétation du tirage et le rendu d'historique restent STRICTEMENT les
// mêmes que côté joueur : on réutilise zoneblancheConfig.dice, jamais une
// logique parallèle.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { roll, RollError } from '../../../../tools/diceEngine.js';
import { useFetch }        from '../../../../hooks/useFetch.js';
import { useSystem }       from '../../../../hooks/useSystem.js';
import zoneblancheConfig, {
    MAX_DES_ACHETES, POOL_BASE, DIFFICULTE_MIN, DIFFICULTE_MAX,
    coutProchainDe, coutCumule,
} from '../../config.jsx';

const OBJECTIF_MIN = 0;
const OBJECTIF_MAX = 20;

// ── Dé affiché (non relançable côté MJ) ──────────────────────────────────────

const ResultDie = ({ detail }) => {
    const cls = detail.complication ? 'is-complication'
        : detail.critique ? 'is-crit'
            : detail.successes > 0 ? 'is-hit'
                : 'is-miss';
    return <span className={`zb-die zb-die-lg ${cls}`}>{detail.roll}</span>;
};

// ── Stepper générique ────────────────────────────────────────────────────────

const Stepper = ({ label, hint, value, onAdjust, canDecrease, canIncrease }) => (
    <div className="zb-buy-row">
        <div className="min-w-0">
            <div className="font-semibold text-default text-sm">{label}</div>
            {hint && <div className="zb-eyebrow">{hint}</div>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => onAdjust(-1)} disabled={!canDecrease}
                    className="zb-btn-ghost w-8 h-8 rounded-sm font-bold">−</button>
            <span className="zb-mono text-lg w-8 text-center text-default">{value}</span>
            <button type="button" onClick={() => onAdjust(1)} disabled={!canIncrease}
                    className="zb-btn-ghost w-8 h-8 rounded-sm font-bold">+</button>
        </div>
    </div>
);

// ── Modale ───────────────────────────────────────────────────────────────────

const ZoneBlancheGMDiceModal = ({
                                    sessionId,
                                    resources = { audimat: 0, stress: 0 },
                                    onResourcesChange,
                                    onClose,
                                }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    const [nom, setNom]                 = useState('');
    const [objectif, setObjectif]       = useState(8);
    const [difficulte, setDifficulte]   = useState(1);
    const [critActif, setCritActif]     = useState(false);
    const [seuilCrit, setSeuilCrit]     = useState(2);
    const [achatStress, setAchatStress] = useState(0);
    const [public_, setPublic]          = useState(true);

    const [result, setResult]   = useState(null);
    const [rolling, setRolling] = useState(false);
    const [error, setError]     = useState(null);

    const poolTotal   = POOL_BASE + achatStress;
    const coutStress  = coutCumule(achatStress);
    const stressDispo = resources.stress ?? 0;

    const peutAcheter = achatStress < MAX_DES_ACHETES
        && (coutStress + coutProchainDe(achatStress)) <= stressDispo;

    // ── Lancer ────────────────────────────────────────────────────────────
    const handleRoll = useCallback(async () => {
        setError(null);
        setRolling(true);
        try {
            const label = nom.trim() || 'Jet du MJ';

            const ctx = {
                apiBase,
                fetchFn:       fetchWithAuth,
                characterId:   -1,               // compte MJ
                characterName: 'MJ',
                sessionId:     sessionId ?? null,
                rollType:      'zoneblanche_gm',
                // Un jet privé n'est PAS persisté : ni entrée d'historique,
                // ni toast pour les joueurs. Le MJ n'a le résultat que dans
                // cette modale (cf. note d'interface ci-dessous).
                persistHistory: public_,
                label,
                systemData: {
                    pool:             poolTotal,
                    garantis:         0,
                    rang:             objectif,
                    rangCompetence:   critActif ? seuilCrit : 1,
                    hasFocus:         critActif,
                    difficulte,
                    audimatDepense:   0,
                    stressGenere:     coutStress,
                    primeTimeDepense: 0,
                },
            };

            const notation = zoneblancheConfig.dice.buildNotation(ctx);
            const res      = await roll(notation, ctx, zoneblancheConfig.dice);
            setResult(res);

            // Débit du Stress dépensé (le MJ a les droits d'écriture)
            if (sessionId && coutStress > 0) {
                const r = await fetchWithAuth(`${apiBase}/session-resources/${sessionId}`, {
                    method:  'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ field: 'stress', delta: -coutStress }),
                });
                if (r.ok) onResourcesChange?.(await r.json());
            }
        } catch (err) {
            console.error('[zoneblanche/GM] jet :', err);
            setError(err instanceof RollError ? err.message : 'Erreur lors du jet');
        } finally {
            setRolling(false);
        }
    }, [
        apiBase, fetchWithAuth, sessionId, nom, poolTotal, objectif,
        critActif, seuilCrit, difficulte, coutStress, onResourcesChange, public_,
    ]);

    const resetForNewRoll = () => {
        setResult(null);
        setError(null);
        setAchatStress(0);
    };

    return (
        <div className="zb-modal-backdrop" onClick={onClose}>
            <div className="zb-modal zb-grain" onClick={e => e.stopPropagation()}>

                <div className="zb-modal-header">
                    <div className="flex items-center gap-3">
                        <span className="zb-rec-dot" />
                        <span className="zb-display text-lg">
                            {result ? 'Résultat — MJ' : 'Jet du MJ'}
                        </span>
                        {!public_ && <span className="zb-private-badge zb-mono">privé</span>}
                    </div>
                    <button type="button" onClick={onClose} className="zb-btn-ghost px-3 py-1 rounded-sm">✕</button>
                </div>

                <div className="zb-modal-body">

                    {/* ═══════════ SÉLECTION ═══════════ */}
                    {!result && (
                        <div className="space-y-5">

                            <div>
                                <div className="zb-eyebrow mb-2">Qui agit ?</div>
                                <input value={nom} onChange={e => setNom(e.target.value)}
                                       className="zb-input w-full px-4 py-3 rounded-sm"
                                       placeholder="Nom du PNJ, de l'entité, ou nature du jet…" />
                            </div>

                            <div className="zb-target-summary">
                                <div>
                                    <div className="zb-eyebrow">Objectif</div>
                                    <div className="zb-mono text-2xl text-default">{objectif}</div>
                                </div>
                                <div>
                                    <div className="zb-eyebrow">Critique sur</div>
                                    <div className="zb-mono text-2xl text-default">
                                        {critActif ? `1 – ${seuilCrit}` : '1'}
                                    </div>
                                </div>
                                <div>
                                    <div className="zb-eyebrow">Dés</div>
                                    <div className="zb-mono text-2xl text-default">{poolTotal}</div>
                                </div>
                            </div>

                            <Stepper
                                label="Objectif"
                                hint="Un dé sous cette valeur est un succès"
                                value={objectif}
                                onAdjust={d => setObjectif(v => Math.max(OBJECTIF_MIN, Math.min(OBJECTIF_MAX, v + d)))}
                                canDecrease={objectif > OBJECTIF_MIN}
                                canIncrease={objectif < OBJECTIF_MAX}
                            />

                            {/* Seuil de critique — équivalent MJ du Focus */}
                            <div className="space-y-2">
                                <button type="button" onClick={() => setCritActif(v => !v)}
                                        className={`zb-pill w-full px-4 py-2.5 rounded-sm text-sm ${critActif ? 'is-selected' : ''}`}>
                                    <span className="font-semibold">Seuil de critique étendu</span>
                                    <span className="block text-xs opacity-80 mt-0.5">
                                        Équivalent d'un Focus : élargit la plage de double succès.
                                    </span>
                                </button>
                                {critActif && (
                                    <Stepper
                                        label="Critique jusqu'à"
                                        value={seuilCrit}
                                        onAdjust={d => setSeuilCrit(v => Math.max(1, Math.min(objectif, v + d)))}
                                        canDecrease={seuilCrit > 1}
                                        canIncrease={seuilCrit < objectif}
                                    />
                                )}
                            </div>

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

                            {/* Achat de dés en Stress */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="zb-eyebrow">Acheter des d20 (Stress)</div>
                                    <span className="zb-eyebrow">{achatStress} / {MAX_DES_ACHETES}</span>
                                </div>
                                <Stepper
                                    label="Stress dépensé"
                                    hint={`${coutStress} dépensé · ${stressDispo} disponible`}
                                    value={achatStress}
                                    onAdjust={d => setAchatStress(v => Math.max(0, v + d))}
                                    canDecrease={achatStress > 0}
                                    canIncrease={peutAcheter}
                                />
                                {!peutAcheter && achatStress < MAX_DES_ACHETES && stressDispo < coutStress + coutProchainDe(achatStress) && (
                                    <div className="zb-eyebrow mt-2">Stress insuffisant pour un dé de plus.</div>
                                )}
                            </div>

                            {/* Visibilité */}
                            <div>
                                <div className="zb-eyebrow mb-2">Visibilité</div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    <button type="button" onClick={() => setPublic(true)}
                                            className={`zb-pill px-4 py-3 rounded-sm text-sm ${public_ ? 'is-selected' : ''}`}>
                                        <span className="font-semibold">Public</span>
                                        <span className="block text-xs opacity-80 mt-0.5">
                                            Toast + historique partagé
                                        </span>
                                    </button>
                                    <button type="button" onClick={() => setPublic(false)}
                                            className={`zb-pill px-4 py-3 rounded-sm text-sm ${!public_ ? 'is-selected' : ''}`}>
                                        <span className="font-semibold">Privé</span>
                                        <span className="block text-xs opacity-80 mt-0.5">
                                            Visible ici uniquement
                                        </span>
                                    </button>
                                </div>
                                {!public_ && (
                                    <div className="zb-eyebrow mt-2">
                                        Un jet privé n'est pas enregistré : il n'apparaîtra dans aucun historique,
                                        y compris le vôtre.
                                    </div>
                                )}
                            </div>

                            {error && <div className="text-sm text-danger">{error}</div>}
                        </div>
                    )}

                    {/* ═══════════ RÉSULTAT ═══════════ */}
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

                            <div className="flex flex-wrap gap-2">
                                {result.details.map((d, i) => <ResultDie key={i} detail={d} />)}
                            </div>

                            {result.marge > 0 && (
                                <div className="zb-eyebrow">Marge : {result.marge}</div>
                            )}

                            {!public_ && (
                                <div className="zb-private-note zb-eyebrow">
                                    Jet privé — non diffusé, non enregistré.
                                </div>
                            )}

                            {error && <div className="text-sm text-danger">{error}</div>}
                        </div>
                    )}
                </div>

                <div className="zb-modal-footer">
                    {!result ? (
                        <>
                            <button type="button" onClick={onClose} className="zb-btn-ghost px-5 py-2.5 rounded-sm zb-display">
                                Annuler
                            </button>
                            <button type="button" onClick={handleRoll} disabled={rolling}
                                    className="zb-btn-accent px-6 py-2.5 rounded-sm zb-display">
                                {rolling ? 'Lancement…' : `Lancer ${poolTotal}d20`}
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" onClick={resetForNewRoll} className="zb-btn-ghost px-5 py-2.5 rounded-sm zb-display">
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

export default ZoneBlancheGMDiceModal;
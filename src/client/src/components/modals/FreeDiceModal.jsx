// src/client/src/components/modals/FreeDiceModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Modale de lancer de dés libre — agnostique à tout slug.
// Supporte les combinaisons multi-types + modificateur.
//
// Props :
//   characterId?   {number}   — pour persist historique
//   characterName? {string}   — pour persist historique
//   sessionId?     {number}   — pour persist historique
//   isGM?          {boolean}  — affiche le choix "Jet secret / public" (défaut : false)
//   defaultLabel?  {string}   — label par défaut (défaut : "Jet libre")
//   persist?       {boolean}  — false : jet jamais enregistré dans un historique
//                               (accueil de la plateforme, hors slug) ; défaut : true
//   onClose        {function}
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import { roll }      from '../../tools/diceEngine.js';
import { useSystem } from '../../hooks/useSystem.js';
import { useFetch }  from '../../hooks/useFetch.js';
import Modal         from '../ui/Modal.jsx';

// ── Constantes ────────────────────────────────────────────────────────────────

const DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

const INITIAL_COUNTS = Object.fromEntries(DICE_TYPES.map(d => [d, 0]));


// ── Hook interprétation — résultat enregistré dans l'historique ──────────────
// Total global : somme des totaux de groupe (le modificateur est déjà dans la
// notation du dernier groupe).
const freeRollAfterRoll = (raw, ctx) => ({
    allDice:  raw.allDice,
    groups:   raw.groups,
    flags:    raw.flags,
    total:    raw.groups.reduce((s, g) => s + g.total, 0),
    modifier: ctx.systemData.modifier,
    label:    ctx.label,
});

// ── Hook animation — fusionne tous les types en un seul groupe/wave ───────────
const buildFreeDiceAnimSeq = (raw, ctx) => {
    const { counts } = ctx.systemData;
    const activeDiceTypes = DICE_TYPES.filter(d => counts[d] > 0);

    const diceTypeParts = [];
    const diceValues    = [];

    activeDiceTypes.forEach((dType, idx) => {
        const count = counts[dType];
        const group = raw.groups[idx]; // même ordre que la notation construite

        if (dType === 'd100') {
            // Chaque d100 → 1d100 (dizaines) + 1d10 (unités)
            group.values.forEach(v => {
                diceTypeParts.push('1d100+1d10');
                diceValues.push(
                    v === 100 ? 0 : Math.floor(v / 10) * 10,
                    v % 10
                );
            });
        } else {
            diceTypeParts.push(`${count}${dType}`);
            diceValues.push(...group.values);
        }
    });

    if (diceTypeParts.length === 0) return null;

    return {
        mode: 'single',
        groups: [{
            id:       'free-roll',
            diceType: diceTypeParts.join('+'), // ex: "2d6+1d100+1d10+1d8"
            color:    'default',
            label:    ctx.label || 'Jet libre',
            waves:    [{ dice: diceValues }],  // toutes les valeurs en une seule wave
        }],
    };
};

// ── SVG des dés — niveau module ───────────────────────────────────────────────

// Couleur héritée du bouton parent (currentColor)
const DieSVG = ({ type }) => {
    const shapes = {
        d4: (
            <>
                <polygon points="24,6 44,40 4,40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <line x1="24" y1="6" x2="24" y2="40" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                <line x1="4" y1="40" x2="24" y2="22" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                <line x1="44" y1="40" x2="24" y2="22" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            </>
        ),
        d6: (
            <>
                <rect x="6" y="6" width="36" height="36" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M6 6 L20 20 L42 20 M20 20 L20 42" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            </>
        ),
        d8: (
            <>
                <polygon points="24,4 44,24 24,44 4,24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <line x1="4" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
                <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
            </>
        ),
        d10: (
            <>
                <path d="M24 4 L42 20 L24 44 L6 20 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <line x1="24" y1="4" x2="24" y2="44" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
                <line x1="6" y1="20" x2="24" y2="28" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
                <line x1="42" y1="20" x2="24" y2="28" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
            </>
        ),
        d12: (
            <>
                <polygon points="24,4 40,13 44,30 32,44 16,44 4,30 8,13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <polygon points="24,14 34,22 30,34 18,34 14,22" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.7" />
                <line x1="24" y1="4" x2="24" y2="14" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                <line x1="40" y1="13" x2="34" y2="22" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                <line x1="44" y1="30" x2="34" y2="22" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                <line x1="32" y1="44" x2="30" y2="34" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                {/* ... etc pour les autres sommets pour un rendu complet */}
            </>
        ),
        d20: (
            <>
                <polygon
                    points="24,2 42,13 42,35 24,46 6,35 6,13"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
                />
                <polygon
                    points="24,2 42,13 6,13"
                    fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.7"
                />
                <line x1="24" y1="2"  x2="24" y2="46" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                <line x1="6"  y1="13" x2="42" y2="35" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
                <line x1="42" y1="13" x2="6"  y2="35" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
            </>
        ),
        d100: (
            <>
                {/* Face principale (le corps du dé) */}
                <path
                    d="M24 4 L42 20 L24 44 L6 20 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                {/* Ligne de crête pour l'effet 3D */}
                <path
                    d="M6 20 L42 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="2 1"
                    opacity="0.6"
                />
                {/* Le texte, légèrement remonté pour l'équilibre visuel */}
                <text
                    x="24" y="26"
                    textAnchor="middle"
                    fontSize="10"
                    fill="currentColor"
                    fontFamily="monospace"
                    fontWeight="bold"
                >
                    00
                </text>
            </>
        ),
    };

    return (
        <svg viewBox="0 0 48 48" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
            {shapes[type]}
        </svg>
    );
};

// ── Sous-composant compteur de dé — niveau module ─────────────────────────────

const DieCounter = ({ type, count, onChange }) => {
    const active    = count > 0;
    const tone      = active ? 'text-primary' : 'text-muted';
    return (
        <div className="flex flex-col items-center gap-1">
            {/* Icône cliquable → ajoute 1 */}
            <button
                type="button"
                onClick={() => onChange(count + 1)}
                className={`${tone} hover:text-primary transition-colors`}
                title={`Ajouter un ${type}`}
            >
                <DieSVG type={type} />
            </button>

            {/* Label */}
            <span className={`text-[10px] font-mono font-bold ${tone}`}>
                {type.toUpperCase()}
            </span>

            {/* Contrôles count */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(0, count - 1))}
                    disabled={count === 0}
                    className="vtt-btn vtt-btn-icon vtt-btn-sm"
                    title="Retirer"
                >−</button>

                <span className={`w-5 text-center text-xs font-mono font-bold tabular-nums ${tone}`}>
                    {count}
                </span>

                <button
                    type="button"
                    onClick={() => onChange(count + 1)}
                    className="vtt-btn vtt-btn-icon vtt-btn-sm"
                    title="Ajouter"
                >+</button>
            </div>
        </div>
    );
};

// ── Composant principal ───────────────────────────────────────────────────────

const FreeDiceModal = ({
                           characterId   = null,
                           characterName = null,
                           sessionId     = null,
                           isGM          = false,
                           defaultLabel  = 'Jet libre',
                           persist       = true,
                           onClose,
                       }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    // ── État ──────────────────────────────────────────────────────────────────
    const [counts,    setCounts]    = useState({ ...INITIAL_COUNTS });
    const [modifier,  setModifier]  = useState(0);
    const [label,     setLabel]     = useState('');
    const [isPublic,  setIsPublic]  = useState(false);
    const [result,    setResult]    = useState(null);  // null | { groups, modifier, total, label }
    const [rolling,   setRolling]   = useState(false);
    const [error,     setError]     = useState('');

    const hasContext = !!apiBase;
    const totalDice  = Object.values(counts).reduce((s, n) => s + n, 0);
    const canRoll    = totalDice > 0 && !rolling;

    // ── Construction notation ─────────────────────────────────────────────────
    // Un groupe par type de dé présent → array de notations
    // Le modificateur est ajouté au dernier groupe
    const buildNotation = useCallback(() => {
        const parts = DICE_TYPES
            .filter(d => counts[d] > 0)
            .map(d => `${counts[d]}${d}`);

        if (parts.length === 0) return null;

        if (modifier !== 0) {
            // Ajoute le modificateur au dernier groupe
            const last = parts[parts.length - 1];
            parts[parts.length - 1] = modifier > 0
                ? `${last}+${modifier}`
                : `${last}${modifier}`;
        }

        return parts.length === 1 ? parts[0] : parts;
    }, [counts, modifier]);

    // ── Lancement ─────────────────────────────────────────────────────────────
    const handleRoll = useCallback(async (keepConfig = false) => {
        if (!canRoll && !keepConfig) return;
        setRolling(true);
        setError('');

        const notation = buildNotation();
        if (!notation) { setRolling(false); return; }

        const effectiveLabel = label.trim() || defaultLabel;
        console.log(`hasContext: ${hasContext}`);
        const shouldPersist  = persist && hasContext && (!isGM || isPublic);

        const ctx = {
            apiBase,
            fetchFn:       fetchWithAuth,
            characterId,
            characterName,
            sessionId: sessionId?.id ?? sessionId ?? null,
            rollType:      'free_roll',
            label:         effectiveLabel,
            persistHistory: shouldPersist,
            systemData:    { counts: { ...counts }, modifier, label: effectiveLabel },
        };

        try {
            // afterRoll : total, modificateur et libellé enregistrés avec le jet, pour
            // l'historique des slugs (tools/freeRoll.js, spec_diceengine_v2.md « Jet libre »)
            const res = await roll(notation, ctx, {
                afterRoll:              freeRollAfterRoll,
                buildAnimationSequence: buildFreeDiceAnimSeq,
            });

            setResult({
                groups:   res.groups,
                modifier: res.modifier,
                total:    res.total,
                label:    res.label,
                notation: Array.isArray(notation) ? notation : [notation],
            });
        } catch (err) {
            setError(err?.message ?? 'Erreur lors du lancer.');
        } finally {
            setRolling(false);
        }
    }, [
        canRoll, buildNotation, label, defaultLabel, hasContext,
        isGM, isPublic, persist, apiBase, fetchWithAuth, characterId,
        characterName, sessionId, counts, modifier,
    ]);

    // Relancer — même config, on repasse directement par handleRoll
    const handleReroll = useCallback(() => {
        setResult(null);
        // Petit timeout pour laisser le state se vider avant de relancer
        setTimeout(() => handleRoll(true), 0);
    }, [handleRoll]);

    // ── Helpers affichage résultat ────────────────────────────────────────────
    // Infère le type de dé depuis la notation d'un groupe ("2d6+3" → "D6")
    const inferLabel = (notation) => {
        const m = notation?.match(/d(\d+)/i);
        return m ? `D${m[1]}` : notation;
    };

    // Extrait les valeurs brutes de dés uniquement (sans modificateur)
    // Le group.values contient déjà les faces des dés, pas le modificateur
    const getDiceValues = (group) => group.values ?? [];

    // ── Rendu ─────────────────────────────────────────────────────────────────
    const modifierTone = modifier > 0 ? 'text-success' : modifier < 0 ? 'text-danger' : '';

    const footer = !result ? (
        <>
            <button type="button" onClick={onClose} className="vtt-btn flex-1">Annuler</button>
            <button type="button" onClick={() => handleRoll(false)} disabled={!canRoll} className="vtt-btn vtt-btn-primary flex-[2]">
                {rolling ? 'Lancer…' : 'Lancer'}
            </button>
        </>
    ) : (
        <>
            <button type="button" onClick={() => setResult(null)} className="vtt-btn flex-1">Modifier</button>
            <button type="button" onClick={handleReroll} disabled={rolling} className="vtt-btn flex-1">Relancer</button>
            <button type="button" onClick={onClose} className="vtt-btn vtt-btn-primary flex-1">Fermer</button>
        </>
    );

    return (
        <Modal title="Lanceur de dés" size="md" onClose={onClose} footer={footer}>

                    {/* ── État : COMPOSE ────────────────────────────────────── */}
                    {!result && (
                        <div className="space-y-5">

                            {/* Grille de dés */}
                            <div className="grid grid-cols-4 gap-3 justify-items-center">
                                {DICE_TYPES.map(type => (
                                    <DieCounter
                                        key={type}
                                        type={type}
                                        count={counts[type]}
                                        onChange={n => setCounts(prev => ({ ...prev, [type]: n }))}
                                    />
                                ))}
                                {/* Bouton reset — 8e cellule */}
                                <div className="flex flex-col items-center justify-end pb-1">
                                    <button
                                        type="button"
                                        onClick={() => { setCounts({ ...INITIAL_COUNTS }); setModifier(0); }}
                                        className="vtt-btn vtt-btn-sm"
                                        title="Réinitialiser"
                                    >Reset</button>
                                </div>
                            </div>

                            {/* Modificateur */}
                            <div>
                                <label className="vtt-field-label">Modificateur</label>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => setModifier(m => m - 1)} className="vtt-btn vtt-btn-icon">−</button>
                                    <input
                                        type="number"
                                        value={modifier}
                                        onChange={e => setModifier(Number(e.target.value))}
                                        className={`vtt-input w-20 text-center font-mono font-bold ${modifierTone}`}
                                    />
                                    <button type="button" onClick={() => setModifier(m => m + 1)} className="vtt-btn vtt-btn-icon">+</button>

                                    {modifier !== 0 && (
                                        <button type="button" onClick={() => setModifier(0)} className="vtt-btn vtt-btn-sm ml-1">↺ 0</button>
                                    )}
                                </div>
                            </div>

                            {/* Label */}
                            <div>
                                <label className="vtt-field-label">
                                    Label <span className="text-muted">(optionnel)</span>
                                </label>
                                <input
                                    type="text"
                                    value={label}
                                    onChange={e => setLabel(e.target.value)}
                                    placeholder={defaultLabel}
                                    className="vtt-input"
                                />
                            </div>

                            {/* Jet secret ou public — MJ uniquement (pastilles, pas de case à cocher) */}
                            {isGM && (
                                <div className="flex flex-wrap gap-1.5">
                                    <button type="button" onClick={() => setIsPublic(false)} className={`vtt-pill ${!isPublic ? 'is-selected' : ''}`}>
                                        Jet secret
                                    </button>
                                    <button type="button" onClick={() => setIsPublic(true)} className={`vtt-pill ${isPublic ? 'is-selected' : ''}`}>
                                        Jet public (visible dans l'historique)
                                    </button>
                                </div>
                            )}

                            {/* Résumé notation */}
                            {totalDice > 0 && (
                                <p className="text-xs font-mono text-center text-muted">
                                    {DICE_TYPES
                                        .filter(d => counts[d] > 0)
                                        .map(d => `${counts[d]}${d.toUpperCase()}`)
                                        .join(' + ')
                                    }
                                    {modifier !== 0 && (
                                        <span className={modifierTone}>
                                            {modifier > 0 ? ` +${modifier}` : ` ${modifier}`}
                                        </span>
                                    )}
                                </p>
                            )}

                            {error && (
                                <div className="vtt-callout vtt-callout-danger">{error}</div>
                            )}
                        </div>
                    )}

                    {/* ── État : RESULT ─────────────────────────────────────── */}
                    {result && (
                        <div className="space-y-4">
                            {/* Label du jet */}
                            <p className="text-xs uppercase tracking-widest text-center text-muted">
                                {result.label}
                            </p>

                            {/* Détail par groupe */}
                            <div className="space-y-2">
                                {result.groups.map((group, i) => {
                                    const diceVals = getDiceValues(group);
                                    const dLabel   = inferLabel(group.notation);
                                    // Total du groupe sans le modificateur (on l'affiche séparément)
                                    // group.total inclut le modificateur si présent dans la notation
                                    // On affiche les faces brutes
                                    const faceSum  = diceVals.reduce((s, v) => s + v, 0);

                                    return (
                                        <div key={i} className="flex items-center gap-3 py-1.5 border-b border-default">
                                            <span className="text-[10px] font-mono w-12 shrink-0 text-muted">
                                                {dLabel}
                                            </span>
                                            <div className="flex flex-wrap gap-1.5 flex-1">
                                                {diceVals.map((v, j) => (
                                                    <span
                                                        key={j}
                                                        className="w-8 h-8 flex items-center justify-center text-sm font-mono font-bold rounded border border-default bg-surface-alt"
                                                    >{v}</span>
                                                ))}
                                            </div>
                                            <span className="text-xs font-mono tabular-nums shrink-0 text-muted">{faceSum}</span>
                                        </div>
                                    );
                                })}

                                {/* Ligne modificateur si présent */}
                                {result.modifier !== 0 && (
                                    <div className="flex items-center justify-between py-1.5 border-b border-default">
                                        <span className="text-[10px] font-mono text-muted">Modificateur</span>
                                        <span className={`text-xs font-mono font-bold tabular-nums ${result.modifier > 0 ? 'text-success' : 'text-danger'}`}>
                                            {result.modifier > 0 ? `+${result.modifier}` : result.modifier}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Total */}
                            <div className="text-center pt-1">
                                <p className="text-[10px] uppercase tracking-widest mb-1 text-muted">Total</p>
                                <p className="text-5xl font-black font-mono tabular-nums text-primary">
                                    {result.total}
                                </p>
                            </div>
                        </div>
                    )}
        </Modal>
    );
};

export default FreeDiceModal;
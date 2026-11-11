// src/client/src/components/initiative/InitiativeEntryMenu.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Réglages d'un participant (MJ), ouverts par ⋯ sur son portrait
// (documentations/spec_initiative.md §9.6, §9.11) : faire agir, faire entrer ou mettre
// en réserve, valeur d'initiative (Entrée : la bande se range), actions par tour, camp,
// nom affiché aux joueurs, blessure, caché, hors de combat (PJ), retirer.
// Rendu par HostedModal (emplacement à modales) : jamais rogné par la bande.
// Fermé par Échap, un clic dehors, ou « Fermer ».
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { HostedModal } from '../ui/ModalHost.jsx';
import { canAct } from '../../tools/initiative.js';

const MARGIN = 8;
const WOUND_OPTIONS = [[null, 'Indemne'], ['light', 'Légère'], ['moderate', 'Modérée'], ['severe', 'Grave'], ['out', 'Hors de combat']];

/** Champ texte ou nombre validé par Entrée ou à la sortie du champ (l'appelant le recrée par `key` quand la valeur change). */
const CommitInput = ({ value, onCommit, type = 'text', placeholder }) => {
    const [draft, setDraft] = useState(value);
    const commit = () => { if (draft !== value) onCommit(draft); };
    return (
        <input className="vtt-input" type={type} value={draft} placeholder={placeholder}
               onChange={(e) => setDraft(e.target.value)} onBlur={commit}
               onKeyDown={(e) => { if (e.key === 'Enter') commit(); }} />
    );
};

/**
 * @param {object}   props
 * @param {object}   props.participant
 * @param {object}   props.state
 * @param {HTMLElement} props.anchor   bouton ⋯ du portrait
 * @param {{players: string, gm: string}} props.sides
 * @param {object}   [props.woundLabels] libellés des niveaux (config du slug)
 * @param {boolean}  [props.hasSheet]   le slug a une fiche de PNJ (bouton « Voir la fiche »)
 * @param {Function} props.onPatch    (patch) → réglage du participant
 * @param {Function} props.onAction   ('designate' | 'enter' | 'reserve' | 'remove')
 * @param {Function} props.onClose
 */
const InitiativeEntryMenu = ({ participant: p, state, anchor, sides, woundLabels, hasSheet = false, onPatch, onAction, onClose }) => {
    const ref = useRef(null);
    const [pos, setPos] = useState(null);

    useLayoutEffect(() => {
        const r = anchor.getBoundingClientRect();
        const box = ref.current.getBoundingClientRect();
        let top = r.bottom + 6;
        if (top + box.height > window.innerHeight - MARGIN) top = Math.max(MARGIN, r.top - box.height - 6);
        const left = Math.min(Math.max(MARGIN, r.left - box.width / 2), window.innerWidth - box.width - MARGIN);
        setPos({ left, top });
    }, [anchor, p]);

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        const onDown = (e) => { if (!ref.current?.contains(e.target) && !anchor.contains(e.target)) onClose(); };
        window.addEventListener('keydown', onKey);
        window.addEventListener('pointerdown', onDown);
        return () => {
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('pointerdown', onDown);
        };
    }, [anchor, onClose]);

    const isNpc = p.kind !== 'character';
    const canDesignate = canAct(p) && p.key !== state.activeKey && (state.mode === 'order' || p.side === state.hand);
    const showValue = state.mode === 'order' || state.enemyOrder;

    return (
        <HostedModal>
            <div ref={ref} className="vtt-initiative-menu" role="dialog" aria-label={`Réglages de ${p.name}`}
                 style={pos ?? { visibility: 'hidden' }}>
                <div className="vtt-initiative-menu-title">{p.name}</div>

                <div className="vtt-initiative-menu-inline">
                    {p.reserve && <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={() => onAction('enter')}>Faire entrer</button>}
                    {canDesignate && <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-primary" onClick={() => onAction('designate')}>Faire agir</button>}
                    {isNpc && !p.reserve && p.key !== state.activeKey && (
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onAction('reserve')}>Mettre en réserve</button>
                    )}
                    {hasSheet && p.kind === 'npc' && (
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onAction('sheet')}>Voir la fiche</button>
                    )}
                </div>

                {showValue && (
                    <div className="vtt-initiative-menu-row">
                        <label className="vtt-field-label">Initiative{state.mode === 'order' ? ' (Entrée : la bande se range)' : ''}</label>
                        <CommitInput key={`init-${p.initiative}`} type="number" value={p.initiative ?? ''}
                                     onCommit={(v) => onPatch({ initiative: v === '' || !Number.isFinite(Number(v)) ? null : Number(v) })} />
                    </div>
                )}

                <div className="vtt-initiative-menu-row">
                    <span className="vtt-field-label">Actions par tour</span>
                    <div className="vtt-initiative-menu-inline">
                        <button type="button" className="vtt-btn vtt-btn-sm" disabled={p.actions <= 1} aria-label="Une action de moins"
                                onClick={() => onPatch({ actions: p.actions - 1, acted: Math.min(p.acted, p.actions - 1) })}>−</button>
                        <b>{p.actions}</b>
                        <button type="button" className="vtt-btn vtt-btn-sm" disabled={p.actions >= 10} aria-label="Une action de plus"
                                onClick={() => onPatch({ actions: p.actions + 1 })}>＋</button>
                    </div>
                </div>

                {state.mode === 'sides' && !p.reserve && (
                    <div className="vtt-initiative-menu-row">
                        <span className="vtt-field-label">Camp</span>
                        <div className="vtt-segmented">
                            {['players', 'gm'].map(side => (
                                <button key={side} type="button" className={`vtt-segment${p.side === side ? ' is-active' : ''}`}
                                        onClick={() => onPatch({ side })}>{sides[side]}</button>
                            ))}
                        </div>
                    </div>
                )}

                {isNpc ? (
                    <>
                        <div className="vtt-initiative-menu-row">
                            <label className="vtt-field-label">Nom affiché aux joueurs (facultatif)</label>
                            <CommitInput key={`pub-${p.publicName}`} value={p.publicName} placeholder="Vide : ils ne voient que le portrait"
                                         onCommit={(v) => onPatch({ publicName: v.trim().slice(0, 120) })} />
                        </div>
                        <div className="vtt-initiative-menu-row">
                            <span className="vtt-field-label">Blessure{p.kind === 'npc' ? ' (forcer ici)' : ''}</span>
                            <div className="vtt-segmented">
                                {WOUND_OPTIONS.map(([level, fallback]) => (
                                    <button key={level ?? 'none'} type="button" className={`vtt-segment${p.wound === level ? ' is-active' : ''}`}
                                            onClick={() => onPatch({ wound: level, woundForced: true })}>
                                        {(level && woundLabels?.[level]) || fallback}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {!p.reserve && (
                            <div className="vtt-initiative-menu-inline">
                                <button type="button" className={`vtt-pill${p.hidden ? ' is-selected' : ''}`} aria-pressed={p.hidden}
                                        onClick={() => onPatch({ hidden: !p.hidden })}>Caché aux joueurs (il agit sans être vu)</button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="vtt-initiative-menu-inline">
                        <button type="button" className={`vtt-pill${p.down ? ' is-selected' : ''}`} aria-pressed={p.down}
                                onClick={() => onPatch({ down: !p.down })}>Hors de combat (reste dans l'ordre)</button>
                    </div>
                )}

                <div className="vtt-initiative-menu-inline">
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => onAction('remove')}>Retirer de la bande</button>
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={onClose}>Fermer</button>
                </div>
            </div>
        </HostedModal>
    );
};

export default InitiativeEntryMenu;

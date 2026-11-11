// src/client/src/systems/cyberpunk/components/layout/MoveCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Carte de manœuvre (colonne de la fiche, vue MJ). Spec règles §6.4 : description
// coupée avec « Voir plus » (seul accès à une manœuvre passive) ; un clic sur une
// manœuvre avec stat ouvre la fenêtre de jet ; « Voir plus » ne la déclenche pas.
// Console (spec_cyberpunk.md §4), facultatif : onTogglePin (épingle = poser /
// retirer de la console), onDragStart / onDragEnd (glisser vers la console).
// ─────────────────────────────────────────────────────────────────────────────

import { STAT_LABELS } from "../../config.jsx";
import ExpandableText from "@/ui/text/ExpandableText.jsx";
import CpIcon from "../ui/CpIcon.jsx";

export const MoveCard = ({
    move, isUnlocked, onClick, showFull = false, isEditMode = false, isAcquired = false, statValue = null,
    pinned = false, onTogglePin, onDragStart, onDragEnd, rollable = true,
}) => {
    // rollable false (vue MJ : le MC ne lance pas les dés) : la carte n'ouvre pas de jet
    const isClickable = rollable && (isUnlocked && move.stat) && !isEditMode;
    const isInteractive = isClickable || isEditMode;
    const canDrag = !!onDragStart && isUnlocked && !isEditMode;
    const stat = move.stat ?? 'none';

    // div et non button : la description contient le lien « Voir plus » (bouton)
    return (
        <div
            onClick={onClick}
            role={isInteractive ? 'button' : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onKeyDown={isInteractive ? e => {
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); }
            } : undefined}
            draggable={canDrag || undefined}
            onDragStart={canDrag ? (e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(move.id)); onDragStart(move); } : undefined}
            onDragEnd={canDrag ? onDragEnd : undefined}
            className={[
                'cp-move', `st-${stat}`,
                isClickable ? 'is-rollable' : '',
                isUnlocked || isEditMode ? '' : 'is-locked',
                isEditMode && isAcquired ? 'is-acquired' : '',
                pinned ? 'is-pinned' : '',
                canDrag ? 'is-draggable' : '',
            ].join(' ')}
        >
            <div className="cp-move-top">
                {isEditMode && (
                    <span className={`cp-move-check ${isAcquired ? 'is-on' : ''}`} aria-hidden="true">{isAcquired ? '✓' : ''}</span>
                )}
                <span className="cp-move-name">{move.name}</span>
                {move.playbook && showFull && <span className="cp-move-pb">{move.playbook}</span>}
                {move.stat && statValue !== null && (
                    <span className="cp-move-roll">2d10{statValue >= 0 ? `+${statValue}` : `−${Math.abs(statValue)}`}</span>
                )}
                <span className={`cp-stat-badge st-${stat}`}>{move.stat ? (STAT_LABELS[move.stat] ?? move.stat) : 'Passive'}</span>
                {onTogglePin && isUnlocked && !isEditMode && (
                    <button type="button" className={`cp-pinbtn ${pinned ? 'is-on' : ''}`}
                            title={pinned ? 'Retirer de la console' : 'Poser dans la console'}
                            onClick={(e) => { e.stopPropagation(); onTogglePin(move); }}>
                        <CpIcon name="pin" size="sm" />
                    </button>
                )}
            </div>
            {(isUnlocked || showFull || isEditMode) && (
                <p className="cp-move-desc">
                    <ExpandableText text={move.description} maxLength={160} />
                </p>
            )}
        </div>
    );
};

// src/client/src/features/table/TableSessionTools.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Outils de table du MJ (spec_session_mj.md §4), posés par le slug dans son
// TabSession : musique (AudioSessionToggle), puis tableau (BoardSessionToggle),
// puis les outils suivants. Rend un fragment, sans conteneur : la disposition
// (colonne, ligne, espacement) reste au slug.
//
//   <TableSessionTools sessionId={activeSession.id} className="vk-btn vk-btn-sm"
//                      audio={{ icon: <VkIcon name="horn" /> }} board={false} />
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import AudioSessionToggle from '@/features/audio/AudioSessionToggle.jsx';
import BoardSessionToggle from '@/features/board/BoardSessionToggle.jsx';

/**
 * Chaque outil prend les props de sa bascule (label, icon, className) ; sa className
 * remplace la commune. Une prop absente laisse la valeur par défaut de la bascule.
 *
 * @param {object} props
 * @param {number} props.sessionId    table active
 * @param {string} [props.className]  classes communes à tous les boutons
 * @param {{ label?, icon?, className? }|false} [props.audio]  musique ; false : absente
 * @param {{ label?, icon?, className? }|false} [props.board]  tableau ; false : absent
 */
const TableSessionTools = ({ sessionId, className, audio, board }) => (
    <>
        {audio !== false && (
            <AudioSessionToggle sessionId={sessionId} label={audio?.label} icon={audio?.icon}
                                className={audio?.className ?? className} />
        )}
        {/* Tableau partagé de la table (spec_tableau.md §10.8) */}
        {board !== false && (
            <BoardSessionToggle sessionId={sessionId} label={board?.label} icon={board?.icon}
                                className={board?.className ?? className} />
        )}
    </>
);

export default TableSessionTools;

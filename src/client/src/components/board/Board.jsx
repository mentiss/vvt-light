// src/client/src/components/board/Board.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Tableau partagé (documentations/spec_tableau.md §10.8) : le composant qu'un slug
// pose dans un onglet, joueur ou MJ (Q-5), et que BoardLayer met dans sa fenêtre.
//
//   <Board sessionId={activeSession?.id} role="gm" />
//
// - MJ : liste des diapositives à gauche (sauf en compact), diapositive éditée
//   (mémorisée par table), « Montrer aux joueurs » ; il prépare une diapositive
//   pendant que les joueurs en voient une autre (Q-7).
// - Joueur : la diapositive montrée par le MJ, rien sinon.
// Les modales passent par l'emplacement à modales (rognées sinon dans une fenêtre flottante).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBoardSession } from '../../hooks/useBoardSession.js';
import { useBoardSlide } from '../../hooks/useBoardSlide.js';
import { useBoardImages } from '../../hooks/useBoardImages.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { getSystemFromPath } from '../../hooks/useSystem.js';
import useConfirm from '../../hooks/useConfirm.jsx';
import { tableScope } from '../../tools/browserStorage.js';
import { itemsBox } from '../../tools/boardGeometry.js';
import { BOARD_PALETTE, participantColor } from '../../tools/boardRights.js';
import { resolveGrid } from '../../tools/boardGrid.js';
import { useBoardIcons } from '../../hooks/useBoardIcons.js';
import useSlugConfig from '../../hooks/useSlugConfig.js';
import { HostedModal } from '../ui/ModalHost.jsx';
import BoardCanvas from './BoardCanvas.jsx';
import BoardToolbar, { THICKNESSES } from './BoardToolbar.jsx';
import SlideList from './SlideList.jsx';
import IconPicker from './IconPicker.jsx';

const TABLE_DEFAULTS = { slideId: null };
const NPC_TOKEN_SIZE = 60;
const ICON_SIZE = 48;
const KIND_LABELS = { image: 'Image', icon: 'Icône', token: 'Jeton', stroke: 'Trait', rect: 'Rectangle' };

/** Une diapositive affichée : outils et vue (sous-composant de module) */
const SlideView = ({ sessionId, slide, isGM, board, compact, myId, confirm, tableGrid }) => {
    const content = useBoardSlide(sessionId, slide.id);
    const getImage = useBoardImages(sessionId);
    const getIcon = useBoardIcons();
    const [iconOpen, setIconOpen] = useState(false);
    const grid = resolveGrid(tableGrid, { value: slide.gridValue, unit: slide.gridUnit });
    const [tool, setTool] = useState('hand');
    const [color, setColor] = useState(BOARD_PALETTE[2].color);
    const [thickness, setThickness] = useState(THICKNESSES[0].value);
    const [fitRequest, setFitRequest] = useState(0);
    const [selectedId, setSelectedId] = useState(null);   // objet sélectionné par le MJ
    const shown = board.shownSlideId === slide.id;
    const selected = isGM ? content.items.find(i => i.id === selectedId) ?? null : null;

    const uploadFiles = (files, point) => {
        for (const file of files) content.uploadImage(file, point ?? {});
    };

    const gmActions = isGM ? {
        onImage: (file, background) => content.uploadImage(file, { background }),
        onPcTokens: content.placePcTokens,
        onNpcToken: ({ label, color: tokenColor }) => {
            const box = itemsBox(content.items) ?? { x: 0, y: 0 };
            content.addItem({ kind: 'token', x: box.x + 20, y: box.y + 20, w: NPC_TOKEN_SIZE, h: NPC_TOKEN_SIZE, data: { label, color: tokenColor } });
        },
        onIcon: () => setIconOpen(true),
        onFogToggle: () => board.updateSlide(slide.id, { fogShown: !slide.fogShown }),
        onFogReset: (reset) => content.updateFog({ reset }),
        onClear: async () => {
            const ok = await confirm({ title: 'Tout effacer', message: 'Tout ce qui n\'est pas verrouillé sera effacé de la diapositive.', confirmText: 'Tout effacer', danger: true });
            if (ok) content.clearItems();
        },
    } : null;

    // Ctrl+V d'une image (MJ)
    const onPaste = (e) => {
        if (!isGM) return;
        const files = [...(e.clipboardData?.files ?? [])].filter(f => f.type.startsWith('image/'));
        if (files.length === 0) return;
        e.preventDefault();
        uploadFiles(files);
    };

    return (
        <div className="vtt-board-view" onPaste={onPaste}>
            {isGM && (
                <div className="vtt-board-view-head">
                    <span className="vtt-board-view-title">{slide.name}</span>
                    <button type="button" className={`vtt-btn vtt-btn-sm${shown ? '' : ' vtt-btn-primary'}`}
                            onClick={() => board.show(shown ? null : slide.id)}>
                        {shown ? 'Ne plus montrer' : 'Montrer aux joueurs'}
                    </button>
                </div>
            )}
            {isGM && compact && board.slides.length > 1 && (
                <div className="vtt-board-pills is-scroll">
                    {board.slides.map(s => (
                        <button key={s.id} type="button" className={`vtt-pill${s.id === slide.id ? ' is-selected' : ''}`}
                                onClick={() => board.onSelect(s.id)}>{s.name}</button>
                    ))}
                </div>
            )}
            <BoardToolbar isGM={isGM} slide={slide} tool={tool} onTool={setTool} color={color} onColor={setColor}
                          thickness={thickness} onThickness={setThickness} onFit={() => setFitRequest(n => n + 1)} gm={gmActions} />
            {selected && (
                <div className="vtt-board-selection-bar" role="group" aria-label="Objet sélectionné">
                    <span>{KIND_LABELS[selected.kind]}{selected.locked ? ' · verrouillé' : ''}</span>
                    <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => content.patchItem(selected.id, { locked: !selected.locked })}>
                        {selected.locked ? 'Déverrouiller' : 'Verrouiller'}
                    </button>
                    <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-danger" disabled={selected.locked}
                            title={selected.locked ? 'Déverrouiller d\'abord' : undefined}
                            onClick={() => { content.deleteItem(selected.id); setSelectedId(null); }}>
                        Supprimer
                    </button>
                    <button type="button" className="vtt-board-icon-btn" onClick={() => setSelectedId(null)} aria-label="Désélectionner" title="Désélectionner">✕</button>
                </div>
            )}
            <div className="vtt-board-stage">
                <BoardCanvas slide={slide} items={content.items} drags={content.drags} pings={content.pings}
                             selectedId={selected?.id ?? null} onSelect={setSelectedId}
                             characters={content.characters} getImage={getImage} getIcon={getIcon} isGM={isGM}
                             fog={content.fog} grid={grid} onFog={content.updateFog}
                             tool={tool} color={color} thickness={thickness} loaded={content.loaded} fitRequest={fitRequest}
                             onAdd={content.addItem} onPatch={content.patchItem} onDelete={content.deleteItem}
                             onDrag={content.emitDrag} onPing={(x, y) => content.ping(x, y, participantColor(myId))}
                             onDropFiles={uploadFiles} />
            </div>
            {iconOpen && (
                <IconPicker onClose={() => setIconOpen(false)} onPick={({ icon, color: iconColor }) => {
                    const box = itemsBox(content.items) ?? { x: 0, y: 0 };
                    const size = slide.gridEnabled ? slide.gridSize : ICON_SIZE;
                    content.addItem({ kind: 'icon', x: box.x + 20, y: box.y + 20, w: size, h: size, data: { icon, color: iconColor } });
                }} />
            )}
        </div>
    );
};

/**
 * @param {object} props
 * @param {number|null} props.sessionId table active
 * @param {'gm'|'player'} props.role
 * @param {boolean} [props.compact] fenêtre réduite : sans la liste des diapositives
 */
const Board = ({ sessionId, role, compact = false }) => {
    const isGM = role === 'gm';
    const { user } = useAuth();
    const board = useBoardSession(sessionId ?? null);
    const { confirm, confirmEl } = useConfirm();
    const [prefs, setPrefs] = usePersistedState(tableScope(getSystemFromPath(), sessionId ?? 'none'), 'board', { defaults: TABLE_DEFAULTS });
    const slugConfig = useSlugConfig();

    if (!sessionId) return <div className="vtt-board-empty">Aucune table active.</div>;
    if (!board.loaded) return <div className="vtt-board-empty">Chargement du tableau…</div>;

    const onSelect = (slideId) => setPrefs(prev => ({ ...prev, slideId }));
    const slideId = isGM
        ? (board.slides.some(s => s.id === prefs.slideId) ? prefs.slideId : (board.shownSlideId ?? board.slides[0]?.id ?? null))
        : board.shownSlideId;
    const slide = board.slides.find(s => s.id === slideId) ?? null;

    // Grille en cascade (Q-43) : plateforme → slug (config.jsx : board.grid) → table → diapositive
    const slugGrid = resolveGrid(slugConfig?.board?.grid);
    const tableGrid = resolveGrid(slugConfig?.board?.grid, board.grid);

    return (
        <div className={`vtt-board${compact ? ' is-compact' : ''}`}>
            {isGM && !compact && (
                <SlideList board={board} selectedId={slideId} onSelect={onSelect} confirm={confirm} slugGrid={slugGrid} tableGrid={tableGrid} />
            )}
            <div className="vtt-board-main">
                {isGM && !board.enabled && (
                    <div className="vtt-board-notice">
                        Tableau désactivé pour cette table : les joueurs ne le voient pas.
                        <button type="button" className="vtt-btn vtt-btn-sm" onClick={() => board.setEnabled(true)}>Activer</button>
                    </div>
                )}
                {slide ? (
                    <SlideView key={slide.id} sessionId={sessionId} slide={slide} isGM={isGM} compact={compact}
                               board={{ ...board, onSelect }} myId={user?.character?.id} confirm={confirm} tableGrid={tableGrid} />
                ) : (
                    <div className="vtt-board-empty">
                        {isGM ? 'Aucune diapositive : créez-en une pour commencer.' : 'Le MJ ne montre rien pour l\'instant.'}
                    </div>
                )}
            </div>
            {confirmEl && <HostedModal>{confirmEl}</HostedModal>}
        </div>
    );
};

export default Board;

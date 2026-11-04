// src/client/src/components/board/BoardCanvas.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Vue SVG d'une diapositive (documentations/spec_tableau.md §10.8) : objets, traits
// et rectangles en cours, pings ; zoom (molette, pincement) et déplacement de la
// vue propres à chacun (Q-8) ; gestes selon l'outil choisi :
//   hand   : déplacer un objet permis, sinon la vue ; MJ : un clic sélectionne un objet,
//            même verrouillé (verrouiller, supprimer : barre de sélection de Board)
//   pen    : trait à main levée, envoyé au lâcher (P-2)
//   rect   : rectangle
//   eraser : efface ce qu'on touche, si permis
//   ruler  : mesure, avec la grille seulement, visible de celui qui mesure (P-12)
//   fog-reveal, fog-cover : MJ, dévoile ou recouvre un rectangle de brouillard
// Ping : Alt + clic, ou appui long sur écran tactile (Q-40), avec tous les outils.
// MJ : poignée de redimensionnement sur l'objet sélectionné (proportions gardées,
// sauf rectangle) ; dépôt d'une image par glisser-déposer (le collage est géré par Board).
// Brouillard (Q-33) : opaque pour les joueurs quand il est affiché ; en transparence
// pour le MJ, toujours, pour qu'il voie ce qu'il dévoile.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useId, useRef, useState } from 'react';
import { fitView, hitsStroke, initials, itemsBox, pointsBox, rectBetween, screenToBoard, simplifyPoints, zoomAt } from '../../tools/boardGeometry.js';
import { canDelete, canDraw, canMove } from '../../tools/boardRights.js';
import { formatDistance, measure } from '../../tools/boardGrid.js';

const LONG_PRESS_MS = 500;
const MOVE_SLOP_PX = 6;           // au-delà, l'appui n'est plus un appui long
const ERASER_RADIUS_PX = 8;

/** Dessin d'un objet (sous-composant de module, pas défini dans le rendu) */
const BoardItem = ({ item, geometry, getImage, getIcon, characters }) => {
    const { x, y, w, h } = geometry;
    const { data } = item;
    switch (item.kind) {
        case 'image': {
            const href = data.url ?? getImage(data.imageId);
            if (!href) return <rect x={x} y={y} width={w} height={h} className="vtt-board-image-loading" />;
            return <image href={href} x={x} y={y} width={w} height={h} preserveAspectRatio="none" />;
        }
        case 'token': {
            const character = data.characterId !== undefined ? characters[data.characterId] : null;
            const name = character ? [character.prenom, character.nom].filter(Boolean).join(' ') : data.label;
            const r = Math.min(w, h) / 2;
            const cx = x + w / 2, cy = y + h / 2;
            const clipId = `vtt-board-token-${item.id}`;
            return (
                <g className="vtt-board-token">
                    <title>{name}</title>
                    <circle cx={cx} cy={cy} r={r} fill={data.color ?? 'var(--color-primary)'} />
                    {character?.avatar ? (
                        <>
                            <clipPath id={clipId}><circle cx={cx} cy={cy} r={r} /></clipPath>
                            <image href={character.avatar} x={x} y={y} width={w} height={h}
                                   preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`} />
                        </>
                    ) : (
                        <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fontSize={r * 0.8} className="vtt-board-token-text">
                            {initials(name)}
                        </text>
                    )}
                    <circle cx={cx} cy={cy} r={r} className="vtt-board-token-ring" />
                </g>
            );
        }
        case 'stroke': {
            const p = data.points;
            const d = `M${p[0]} ${p[1]}${p.slice(2).reduce((s, v, i) => s + (i % 2 === 0 ? ` L${v}` : ` ${v}`), '')}`;
            return <path d={d} stroke={data.color} strokeWidth={data.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
        }
        case 'rect':
            return (
                <rect x={x} y={y} width={w} height={h} stroke={data.color} strokeWidth={Math.max(1, Math.min(w, h) * 0.01)}
                      fill={data.filled ? data.color : 'none'} fillOpacity={data.filled ? 0.35 : 0} />
            );
        case 'icon': {
            // Icône nue (Q-42), tracé en currentColor : contenu d'un fichier SVG livré avec l'application
            const markup = getIcon?.(data.icon);
            if (!markup) return <rect x={x} y={y} width={w} height={h} className="vtt-board-image-loading" />;
            return <svg x={x} y={y} width={w} height={h} viewBox="0 0 512 512" style={{ color: data.color }}
                        dangerouslySetInnerHTML={{ __html: markup }} />;
        }
        default:
            return null;
    }
};

/** Le point (x, y) du tableau touche-t-il l'objet ? */
function hitsItem(item, x, y, radius) {
    if (item.kind === 'stroke') return hitsStroke(item.data.points, item.data.width, x, y, radius);
    if (item.kind === 'token') return Math.hypot(x - (item.x + item.w / 2), y - (item.y + item.h / 2)) <= item.w / 2 + radius;
    return x >= item.x - radius && x <= item.x + item.w + radius && y >= item.y - radius && y <= item.y + item.h + radius;
}

/**
 * @param {object} props
 * @param {object} props.slide       réglages de la diapositive (playersDraw, playersMove…)
 * @param {object[]} props.items
 * @param {boolean} props.loaded     objets chargés (cadrage à l'ouverture)
 * @param {object} props.drags       positions reçues en direct (itemId → géométrie)
 * @param {object[]} props.pings
 * @param {object} props.characters  PJ de la table (id → { prenom, nom, avatar })
 * @param {Function} props.getImage  imageId → adresse locale ou null
 * @param {boolean} props.isGM
 * @param {'hand'|'pen'|'rect'|'eraser'} props.tool
 * @param {string} props.color       couleur de dessin
 * @param {number} props.thickness   épaisseur de trait, en pixels d'écran
 * @param {number} props.fitRequest  incrémenté pour recadrer sur le contenu
 * @param {number|null} props.selectedId objet sélectionné par le MJ (outil main, clic sans glisser)
 * @param {Function} props.onSelect  id ou null
 * @param {object[]} props.fog       opérations de brouillard de la diapositive
 * @param {{ value: number, unit: string }} props.grid valeur d'une case (cascade résolue)
 * @param {Function} [props.getIcon] id d'icône → contenu SVG ou null
 * @param {Function} props.onFog     opération de brouillard (MJ)
 */
const BoardCanvas = ({
    slide, items, loaded, drags, pings, characters, getImage, getIcon, isGM, tool, color, thickness, fitRequest,
    selectedId, onSelect, fog, grid, onFog, onAdd, onPatch, onDelete, onDrag, onPing, onDropFiles,
}) => {
    const uid = useId().replace(/:/g, '');
    const [ruler, setRuler] = useState(null);           // { from, to } mesure en cours
    const selectedItem = isGM && selectedId ? items.find(i => i.id === selectedId) ?? null : null;
    const svgRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
    const [draft, setDraft] = useState(null);          // { kind: 'stroke', points } | { kind: 'rect', from, to }
    const [moving, setMoving] = useState(null);         // { id, x, y } objet déplacé par moi
    const gestureRef = useRef(null);
    const pointersRef = useRef(new Map());
    const longPressRef = useRef(null);
    const [fitted, setFitted] = useState(null);         // diapositive et demande déjà cadrées

    // ── Taille du cadre ─────────────────────────────────────────────────────
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return undefined;
        const observer = new ResizeObserver(([entry]) => {
            setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        });
        observer.observe(svg);
        return () => observer.disconnect();
    }, []);

    // ── Cadrage sur le contenu : à l'ouverture d'une diapositive, et à la demande ─
    // Ajusté pendant le rendu (pas dans un effet) : une fois la taille du cadre connue,
    // puis à chaque nouvelle demande.
    const fitKey = `${slide.id}:${fitRequest}`;
    if (loaded && size.width > 0 && fitted !== fitKey) {
        setFitted(fitKey);
        setView(fitView(itemsBox(items) ?? { x: 0, y: 0, w: 1600, h: 900 }, size.width, size.height));
    }

    // ── Zoom à la molette (écouteur non passif, pour bloquer le défilement) ──
    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return undefined;
        const onWheel = (e) => {
            e.preventDefault();
            const rect = svg.getBoundingClientRect();
            setView(v => zoomAt(v, Math.exp(-e.deltaY * 0.0015), e.clientX - rect.left, e.clientY - rect.top));
        };
        svg.addEventListener('wheel', onWheel, { passive: false });
        return () => svg.removeEventListener('wheel', onWheel);
    }, []);

    const localPoint = (e) => {
        const rect = svgRef.current.getBoundingClientRect();
        return { px: e.clientX - rect.left, py: e.clientY - rect.top };
    };
    const boardPoint = (e) => {
        const { px, py } = localPoint(e);
        return screenToBoard(view, px, py);
    };

    /** Objet le plus haut sous le point, parmi ceux que `accept` retient */
    const topItemAt = (point, accept) => {
        const radius = ERASER_RADIUS_PX / view.scale;
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            if (accept(item) && hitsItem(item, point.x, point.y, radius)) return item;
        }
        return null;
    };

    const erase = (point) => {
        const item = topItemAt(point, it => canDelete(isGM, slide, it));
        if (item) onDelete(item.id);
    };

    const cancelLongPress = () => { clearTimeout(longPressRef.current); longPressRef.current = null; };

    // ── Gestes ──────────────────────────────────────────────────────────────
    const onPointerDown = (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        svgRef.current.setPointerCapture(e.pointerId);
        pointersRef.current.set(e.pointerId, localPoint(e));

        // Deux doigts : pincement, tout autre geste est abandonné
        if (pointersRef.current.size === 2) {
            cancelLongPress();
            setDraft(null);
            setMoving(null);
            const [a, b] = [...pointersRef.current.values()];
            gestureRef.current = { type: 'pinch', distance: Math.hypot(b.px - a.px, b.py - a.py), view: view };
            return;
        }

        const point = boardPoint(e);
        if (e.altKey) { onPing(point.x, point.y); return; }
        if (e.pointerType === 'touch') {
            longPressRef.current = setTimeout(() => {
                longPressRef.current = null;
                gestureRef.current = null;
                setDraft(null);
                onPing(point.x, point.y);
            }, LONG_PRESS_MS);
        }

        const start = localPoint(e);
        const fogTool = isGM && slide.fogEnabled && (tool === 'fog-reveal' || tool === 'fog-cover');
        if (e.target.dataset?.handle === 'resize' && selectedItem) {
            // Poignée de l'objet sélectionné (MJ) : proportions gardées, sauf rectangle
            gestureRef.current = { type: 'resize', start, item: selectedItem, ratio: selectedItem.w / (selectedItem.h || 1) };
        } else if (tool === 'ruler' && slide.gridEnabled) {
            gestureRef.current = { type: 'ruler', start };
            setRuler({ from: point, to: point });
        } else if (fogTool) {
            gestureRef.current = { type: 'fog', start, op: tool === 'fog-reveal' ? 'reveal' : 'cover' };
            setDraft({ kind: 'fog', from: point, to: point });
        } else if (tool === 'pen' && canDraw(isGM, slide)) {
            gestureRef.current = { type: 'pen', start };
            setDraft({ kind: 'stroke', points: [point.x, point.y] });
        } else if (tool === 'rect' && canDraw(isGM, slide)) {
            gestureRef.current = { type: 'rect', start };
            setDraft({ kind: 'rect', from: point, to: point });
        } else if (tool === 'eraser') {
            gestureRef.current = { type: 'eraser', start };
            erase(point);
        } else {
            const item = topItemAt(point, it => canMove(isGM, slide, it));
            // MJ : un clic sans glisser sur un objet, même verrouillé, le sélectionne
            const candidate = isGM && !item ? topItemAt(point, () => true) : null;
            gestureRef.current = item
                ? { type: 'move', start, item, offset: { x: point.x - item.x, y: point.y - item.y }, moved: false }
                : { type: 'pan', start, view: view, candidate };
        }
    };

    const onPointerMove = (e) => {
        if (!pointersRef.current.has(e.pointerId)) return;
        const local = localPoint(e);
        pointersRef.current.set(e.pointerId, local);
        const gesture = gestureRef.current;
        if (!gesture) return;

        if (gesture.type === 'pinch') {
            const [a, b] = [...pointersRef.current.values()];
            const distance = Math.hypot(b.px - a.px, b.py - a.py);
            setView(zoomAt(gesture.view, distance / gesture.distance, (a.px + b.px) / 2, (a.py + b.py) / 2));
            return;
        }
        if (Math.hypot(local.px - gesture.start.px, local.py - gesture.start.py) > MOVE_SLOP_PX) cancelLongPress();

        const point = boardPoint(e);
        switch (gesture.type) {
            case 'pen':
                setDraft(d => (d ? { ...d, points: [...d.points, point.x, point.y] } : d));
                break;
            case 'rect':
            case 'fog':
                setDraft(d => (d ? { ...d, to: point } : d));
                break;
            case 'ruler':
                setRuler(r => (r ? { ...r, to: point } : r));
                break;
            case 'resize': {
                const { item, ratio } = gesture;
                const minSize = 8 / view.scale;
                const w = Math.max(minSize, point.x - item.x);
                const h = item.kind === 'rect' ? Math.max(minSize, point.y - item.y) : w / ratio;
                const geometry = { x: item.x, y: item.y, w, h };
                setMoving({ id: item.id, ...geometry });
                onDrag(item.id, geometry);
                break;
            }
            case 'eraser':
                erase(point);
                break;
            case 'move': {
                const position = { x: point.x - gesture.offset.x, y: point.y - gesture.offset.y };
                gesture.moved = true;
                setMoving({ id: gesture.item.id, ...position });
                onDrag(gesture.item.id, position);
                break;
            }
            case 'pan': {
                const { view: from, start } = gesture;
                setView({ ...from, x: from.x - (local.px - start.px) / from.scale, y: from.y - (local.py - start.py) / from.scale });
                break;
            }
            default:
        }
    };

    const onPointerUp = (e) => {
        pointersRef.current.delete(e.pointerId);
        cancelLongPress();
        const gesture = gestureRef.current;
        gestureRef.current = null;
        if (!gesture || gesture.type === 'pinch') { setDraft(null); return; }

        if (gesture.type === 'pen' && draft?.kind === 'stroke') {
            const raw = draft.points.length === 2 ? [...draft.points, ...draft.points] : draft.points;
            const points = simplifyPoints(raw, 1 / view.scale).map(v => Math.round(v * 10) / 10);
            // Épaisseur en unités du tableau, bornée comme côté serveur
            onAdd({ kind: 'stroke', data: { points, color, width: Math.min(100, thickness / view.scale) } });
        } else if (gesture.type === 'rect' && draft?.kind === 'rect') {
            const box = rectBetween(draft.from, draft.to);
            if (box.w * view.scale > 3 && box.h * view.scale > 3) {
                onAdd({ kind: 'rect', ...box, data: { color, filled: true } });
            }
        } else if (gesture.type === 'fog' && draft?.kind === 'fog') {
            const box = rectBetween(draft.from, draft.to);
            if (box.w * view.scale > 3 && box.h * view.scale > 3) onFog({ op: gesture.op, ...box });
        } else if (gesture.type === 'ruler') {
            setRuler(null);
        } else if (gesture.type === 'resize') {
            if (moving) {
                onDrag(gesture.item.id, moving, true);
                onPatch(gesture.item.id, { w: moving.w, h: moving.h });
            }
        } else if (gesture.type === 'move') {
            if (gesture.moved && moving) {
                onDrag(gesture.item.id, { x: moving.x, y: moving.y }, true);
                onPatch(gesture.item.id, { x: moving.x, y: moving.y });
            }
            if (isGM) onSelect(gesture.item.id);
        } else if (gesture.type === 'pan' && isGM) {
            // Clic sans glisser : sélection de l'objet touché, ou désélection
            const { px, py } = localPoint(e);
            if (Math.hypot(px - gesture.start.px, py - gesture.start.py) <= MOVE_SLOP_PX) onSelect(gesture.candidate?.id ?? null);
        }
        setDraft(null);
        setMoving(null);
    };

    // ── Glisser-déposer d'une image (MJ) ────────────────────────────────────
    const onDragOver = (e) => { if (isGM && e.dataTransfer.types.includes('Files')) e.preventDefault(); };
    const onDrop = (e) => {
        if (!isGM) return;
        const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
        if (files.length === 0) return;
        e.preventDefault();
        onDropFiles(files, boardPoint(e));
    };

    // ── Rendu ───────────────────────────────────────────────────────────────
    const geometryOf = (item) => {
        if (moving?.id === item.id) return { ...item, x: moving.x, y: moving.y, w: moving.w ?? item.w, h: moving.h ?? item.h };
        const remote = drags[item.id];
        return remote ? { ...item, x: remote.x, y: remote.y, w: remote.w ?? item.w, h: remote.h ?? item.h } : item;
    };

    const viewWidth = Math.max(1, size.width) / view.scale;
    const viewHeight = Math.max(1, size.height) / view.scale;
    const viewBox = `${view.x} ${view.y} ${viewWidth} ${viewHeight}`;
    const draftBox = draft?.kind === 'rect' ? rectBetween(draft.from, draft.to) : null;
    const fogDraft = draft?.kind === 'fog' ? rectBetween(draft.from, draft.to) : null;
    const pingRadius = 18 / view.scale;
    const showFog = slide.fogEnabled && (isGM || slide.fogShown);

    // Outil réellement disponible (curseur) : un outil interdit retombe sur la main
    const available = {
        pen: canDraw(isGM, slide), rect: canDraw(isGM, slide), eraser: canDraw(isGM, slide),
        ruler: slide.gridEnabled, 'fog-reveal': isGM && slide.fogEnabled, 'fog-cover': isGM && slide.fogEnabled,
    };
    const effectiveTool = tool === 'hand' || available[tool] ? tool : 'hand';

    return (
        <svg ref={svgRef} className={`vtt-board-canvas is-tool-${effectiveTool}`} viewBox={viewBox}
             onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
             onDragOver={onDragOver} onDrop={onDrop} onContextMenu={e => e.preventDefault()}
             role="img" aria-label={`Tableau : ${slide.name}`}>
            {items.map(item => (
                <BoardItem key={item.id} item={item} geometry={geometryOf(item)} getImage={getImage} getIcon={getIcon} characters={characters} />
            ))}

            {/* Grille sans magnétisme (Q-21), calée sur l'origine du tableau */}
            {slide.gridEnabled && (
                <>
                    <defs>
                        <pattern id={`${uid}-grid`} patternUnits="userSpaceOnUse" width={slide.gridSize} height={slide.gridSize}>
                            <path d={`M ${slide.gridSize} 0 L 0 0 0 ${slide.gridSize}`} className="vtt-board-grid-line" />
                        </pattern>
                    </defs>
                    <rect x={view.x} y={view.y} width={viewWidth} height={viewHeight} fill={`url(#${uid}-grid)`} pointerEvents="none" />
                </>
            )}

            {/* Brouillard : tout couvert, puis les opérations dans l'ordre (dévoiler = trou) */}
            {showFog && (
                <g className={`vtt-board-fog${isGM ? ' is-gm' : ''}${slide.fogShown ? '' : ' is-hidden'}`} pointerEvents="none">
                    <mask id={`${uid}-fog`} maskUnits="userSpaceOnUse" x={-1e6} y={-1e6} width={2e6} height={2e6}>
                        <rect x={-1e6} y={-1e6} width={2e6} height={2e6} fill="white" />
                        {fog.map((f, index) => (
                            // Opérations sans identifiant, jamais réordonnées : l'indice suffit
                            <rect key={index} x={f.x} y={f.y} width={f.w} height={f.h} fill={f.op === 'reveal' ? 'black' : 'white'} />
                        ))}
                    </mask>
                    <rect x={view.x} y={view.y} width={viewWidth} height={viewHeight} mask={`url(#${uid}-fog)`} className="vtt-board-fog-cover" />
                </g>
            )}
            {fogDraft && (
                <rect x={fogDraft.x} y={fogDraft.y} width={fogDraft.w} height={fogDraft.h} className="vtt-board-fog-draft"
                      strokeDasharray={`${6 / view.scale} ${4 / view.scale}`} />
            )}

            {draft?.kind === 'stroke' && draft.points.length >= 2 && (
                <BoardItem item={{ kind: 'stroke', data: { points: draft.points.length === 2 ? [...draft.points, ...draft.points] : draft.points, color, width: thickness / view.scale } }}
                           geometry={pointsBox(draft.points)} getImage={getImage} characters={characters} />
            )}
            {draftBox && (
                <rect {...{ x: draftBox.x, y: draftBox.y, width: draftBox.w, height: draftBox.h }} stroke={color}
                      fill={color} fillOpacity={0.35} strokeWidth={1 / view.scale} strokeDasharray={`${4 / view.scale}`} />
            )}

            {selectedItem && (() => {
                const g = geometryOf(selectedItem);
                const pad = 4 / view.scale;
                const resizable = !selectedItem.locked && selectedItem.kind !== 'stroke';
                return (
                    <>
                        <rect className={`vtt-board-selection${selectedItem.locked ? ' is-locked' : ''}`}
                              x={g.x - pad} y={g.y - pad} width={g.w + 2 * pad} height={g.h + 2 * pad}
                              strokeDasharray={`${6 / view.scale} ${4 / view.scale}`} />
                        {resizable && (
                            <circle data-handle="resize" className="vtt-board-handle" cx={g.x + g.w + pad} cy={g.y + g.h + pad} r={7 / view.scale}>
                                <title>Redimensionner</title>
                            </circle>
                        )}
                    </>
                );
            })()}

            {/* Règle : locale à celui qui mesure (P-12) */}
            {ruler && (() => {
                const distance = formatDistance(measure(ruler.from, ruler.to, slide.gridSize, grid.value), grid.unit);
                const fontSize = 14 / view.scale;
                return (
                    <g className="vtt-board-ruler" pointerEvents="none">
                        <line x1={ruler.from.x} y1={ruler.from.y} x2={ruler.to.x} y2={ruler.to.y} />
                        <circle cx={ruler.from.x} cy={ruler.from.y} r={4 / view.scale} />
                        <circle cx={ruler.to.x} cy={ruler.to.y} r={4 / view.scale} />
                        <text x={ruler.to.x + 10 / view.scale} y={ruler.to.y - 10 / view.scale} fontSize={fontSize}>{distance}</text>
                    </g>
                );
            })()}

            {pings.map(p => (
                <g key={p.id} className="vtt-board-ping" transform={`translate(${p.x} ${p.y})`}>
                    <circle r={pingRadius} stroke={p.color} strokeWidth={3 / view.scale} fill="none" />
                    <circle r={pingRadius / 4} fill={p.color} />
                </g>
            ))}
        </svg>
    );
};

export default BoardCanvas;

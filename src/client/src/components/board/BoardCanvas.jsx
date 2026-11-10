// src/client/src/components/board/BoardCanvas.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Vue SVG d'une diapositive (documentations/spec_tableau.md §10.8) : objets, traits
// et rectangles en cours, pings ; zoom (molette, pincement) et déplacement de la
// vue propres à chacun (Q-8) ; gestes selon l'outil choisi (§12.2) :
//   select : déplacer un objet permis, sinon la vue ; MJ : un clic sélectionne un objet,
//            même verrouillé (verrouiller, supprimer : barre de sélection de Board)
//   hand   : déplacer la vue seulement, sans jamais toucher un objet ; aussi avec tout
//            outil par le clic molette, l'espace maintenu (panOverride) ou deux doigts
//   pen    : trait à main levée, envoyé au lâcher (P-2)
//   line   : ligne droite, flèche en option ; Maj : pas de 15° (§13.1)
//   rect, ellipse : forme pleine ou en contour ; Maj : carré, cercle
//   halo   : clic (taille par défaut) ou glisser depuis le centre (rayon)
//   text   : clic, champ de saisie à l'endroit (BoardTextInput) ; MJ : double-clic pour modifier
//   eraser : efface ce qu'on touche, si permis
//   ruler  : mesure, avec la grille seulement, visible de celui qui mesure (P-12)
//   fog-reveal, fog-cover : MJ, dévoile ou recouvre un rectangle de brouillard
// Ping : Alt + clic, ou appui long sur écran tactile (Q-40), avec tous les outils.
// MJ : poignée de redimensionnement sur l'objet sélectionné (proportions gardées,
// sauf rectangle et ellipse), poignée de rotation au-dessus (Maj : pas de 15°) ;
// dépôt d'une image par glisser-déposer (le collage est géré par Board).
// Halos (PB-8) : dessinés juste sous le plus bas des jetons et icônes, quel que soit leur ordre.
// Brouillard (Q-33) : opaque pour les joueurs quand il est affiché ; en transparence
// pour le MJ, toujours, pour qu'il voie ce qu'il dévoile.
// Zoom +, −, recadrer dans le coin haut droit (§12.3) ; Board les commande aussi au
// clavier par la ref : { zoomBy(factor), fit(), cancel() }.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import {
    angleFrom, fitView, hitsBox, hitsStroke, initials, itemInRect, itemsBox, lineEnd, pinchView, pointsBox, rectBetween, screenToBoard,
    shapeBetween, simplifyPoints, snapAngle, zoomAt,
} from '../../tools/boardGeometry.js';
import { Glyph } from './BoardToolbar.jsx';
import BoardTextInput, { TEXT_LINE_HEIGHT } from './BoardTextInput.jsx';
import { POINT_KINDS, ROTATABLE_KINDS, canDelete, canDraw, canMove, canRotate, isVisible } from '../../tools/boardRights.js';
import { expandGroups, toggleInSelection } from '../../tools/boardSelection.js';
import { filterCss } from '../../tools/boardFilters.js';
import { formatDistance, measure } from '../../tools/boardGrid.js';

const LONG_PRESS_MS = 500;
const MOVE_SLOP_PX = 6;           // au-delà, l'appui n'est plus un appui long
const ERASER_RADIUS_PX = 8;
export const ZOOM_STEP = 1.25;    // pas des boutons et des touches + / −
const DRAW_TOOLS = ['pen', 'line', 'rect', 'ellipse', 'halo', 'text'];
const HALO_DEFAULT_RADIUS = 150;  // sans grille ; avec : 3 cases (§13.1)
const TEXT_SCREEN_SIZE = 20;      // taille d'un nouveau texte, en pixels d'écran

/** Contour d'une forme : épaisseur choisie, sinon un filet proportionnel */
const shapeStroke = (data, w, h) => (data.filled ? Math.max(1, Math.min(w, h) * 0.01) : (data.width ?? 3));

/** Pointe de flèche à l'arrivée d'une ligne */
function arrowHead(x1, y1, x2, y2, width) {
    const size = Math.max(10, width * 3.5);
    const a = Math.atan2(y2 - y1, x2 - x1);
    const p = (da) => `${x2 - size * Math.cos(a + da)},${y2 - size * Math.sin(a + da)}`;
    return `${x2},${y2} ${p(0.45)} ${p(-0.45)}`;
}

/** Dessin d'un objet (sous-composant de module, pas défini dans le rendu) */
const BoardItem = ({ item, geometry, getImage, getIcon, characters, npcs = {}, filterPreview }) => {
    const { x, y, w, h } = geometry;
    const { data } = item;
    const rotation = geometry.rotation ?? item.rotation ?? 0;
    // Rotation autour du centre (Q-52), pour les objets qui tournent
    const rotate = (node) => (rotation && ROTATABLE_KINDS.includes(item.kind)
        ? <g transform={`rotate(${rotation} ${x + w / 2} ${y + h / 2})`}>{node}</g> : node);
    switch (item.kind) {
        case 'image': {
            const href = data.url ?? getImage(data.imageId);
            if (!href) return rotate(<rect x={x} y={y} width={w} height={h} className="vtt-board-image-loading" />);
            const filter = filterCss(filterPreview ?? data.filter);
            return rotate(<image href={href} x={x} y={y} width={w} height={h} preserveAspectRatio="none" style={filter ? { filter } : undefined} />);
        }
        case 'token': {
            const character = data.characterId !== undefined ? characters[data.characterId] : null;
            // PNJ de la table (spec_pnj.md P-21) : son nom à la table, son avatar ou son icône ; libellé gardé s'il est parti
            const npc = data.npcId !== undefined ? npcs[data.npcId] : null;
            const name = character ? [character.prenom, character.nom].filter(Boolean).join(' ') : (npc?.name ?? data.label);
            const avatar = character?.avatar ?? npc?.avatar ?? null;
            const iconMarkup = !avatar && npc?.icon ? getIcon?.(npc.icon.icon) : null;
            const r = Math.min(w, h) / 2;
            const cx = x + w / 2, cy = y + h / 2;
            const clipId = `vtt-board-token-${item.id}`;
            return (
                <g className="vtt-board-token">
                    <title>{name}</title>
                    <circle cx={cx} cy={cy} r={r} fill={iconMarkup ? 'var(--color-surface)' : (data.color ?? 'var(--color-primary)')} />
                    {avatar ? (
                        <>
                            <clipPath id={clipId}><circle cx={cx} cy={cy} r={r} /></clipPath>
                            <image href={avatar} x={x} y={y} width={w} height={h}
                                   preserveAspectRatio="xMidYMid slice" clipPath={`url(#${clipId})`} />
                        </>
                    ) : iconMarkup ? (
                        <svg x={cx - r * 0.65} y={cy - r * 0.65} width={r * 1.3} height={r * 1.3} viewBox="0 0 512 512"
                             style={{ color: npc.icon.color }} dangerouslySetInnerHTML={{ __html: iconMarkup }} />
                    ) : (
                        <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fontSize={r * 0.8} className="vtt-board-token-text">
                            {initials(name)}
                        </text>
                    )}
                    <circle cx={cx} cy={cy} r={r} className="vtt-board-token-ring" />
                </g>
            );
        }
        case 'stroke':
        case 'line': {
            // Points en coordonnées absolues : décalés de la boîte en cours de déplacement
            const p = data.points;
            const box = pointsBox(p);
            const shift = x !== box.x || y !== box.y ? `translate(${x - box.x} ${y - box.y})` : undefined;
            const d = `M${p[0]} ${p[1]}${p.slice(2).reduce((s, v, i) => s + (i % 2 === 0 ? ` L${v}` : ` ${v}`), '')}`;
            return (
                <g transform={shift}>
                    <path d={d} stroke={data.color} strokeWidth={data.width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    {item.kind === 'line' && data.arrow && (
                        <polygon points={arrowHead(p[0], p[1], p[2], p[3], data.width)} fill={data.color} />
                    )}
                </g>
            );
        }
        case 'rect':
            return rotate(
                <rect x={x} y={y} width={w} height={h} stroke={data.color} strokeWidth={shapeStroke(data, w, h)}
                      fill={data.filled ? data.color : 'none'} fillOpacity={data.filled ? 0.35 : 0} />
            );
        case 'ellipse':
            return rotate(
                <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} stroke={data.color} strokeWidth={shapeStroke(data, w, h)}
                         fill={data.filled ? data.color : 'none'} fillOpacity={data.filled ? 0.35 : 0} />
            );
        case 'halo': {
            // Dégradé radial : couleur à 60 % au centre, transparent au bord (Q-48)
            const gradientId = `vtt-board-halo-${item.id ?? 'draft'}`;
            return (
                <>
                    <defs>
                        <radialGradient id={gradientId}>
                            <stop offset="0" stopColor={data.color} stopOpacity="0.6" />
                            <stop offset="1" stopColor={data.color} stopOpacity="0" />
                        </radialGradient>
                    </defs>
                    <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) / 2} fill={`url(#${gradientId})`} />
                </>
            );
        }
        case 'text': {
            // Taille suivant la largeur pendant un redimensionnement (proportions gardées)
            const size = data.size * (item.w ? w / item.w : 1);
            const lines = String(data.text).split('\n');
            const pad = size * 0.2;
            return rotate(
                <g className="vtt-board-text">
                    {data.background && (
                        <rect x={x - pad} y={y - pad} width={w + 2 * pad} height={h + 2 * pad} rx={pad} className="vtt-board-text-bg" />
                    )}
                    <text x={x} y={y} fontSize={size} fill={data.color}>
                        {lines.map((line, i) => (
                            // Lignes d'un texte figé : l'indice est leur identité
                            <tspan key={i} x={x} dy={i === 0 ? size * 0.9 : size * TEXT_LINE_HEIGHT}>{line || ' '}</tspan>
                        ))}
                    </text>
                </g>
            );
        }
        case 'icon': {
            // Icône nue (Q-42), tracé en currentColor : contenu d'un fichier SVG livré avec l'application
            const markup = getIcon?.(data.icon);
            if (!markup) return rotate(<rect x={x} y={y} width={w} height={h} className="vtt-board-image-loading" />);
            return rotate(<svg x={x} y={y} width={w} height={h} viewBox="0 0 512 512" style={{ color: data.color }}
                               dangerouslySetInnerHTML={{ __html: markup }} />);
        }
        default:
            return null;
    }
};

/** Le point (x, y) du tableau touche-t-il l'objet ? */
function hitsItem(item, x, y, radius) {
    if (POINT_KINDS.includes(item.kind)) return hitsStroke(item.data.points, item.data.width, x, y, radius);
    if (item.kind === 'token' || item.kind === 'halo') {
        return Math.hypot(x - (item.x + item.w / 2), y - (item.y + item.h / 2)) <= item.w / 2 + radius;
    }
    return hitsBox(item, x, y, radius);   // boîte tournée avec l'objet
}

/**
 * @param {object} props
 * @param {object} props.slide       réglages de la diapositive (playersDraw, playersMove…)
 * @param {object[]} props.items
 * @param {boolean} props.loaded     objets chargés (cadrage à l'ouverture)
 * @param {object} props.drags       positions reçues en direct (itemId → géométrie)
 * @param {object[]} props.pings
 * @param {object} props.characters  PJ de la table (id → { prenom, nom, avatar })
 * @param {object} [props.npcs]      PNJ de la table (id → { name, avatar, icon }, spec_pnj.md P-21)
 * @param {Function} props.getImage  imageId → adresse locale ou null
 * @param {boolean} props.isGM
 * @param {string} props.tool        select, hand, pen, line, rect, ellipse, halo, text, eraser, ruler, fog-reveal, fog-cover
 * @param {boolean} [props.panOverride] espace maintenu : main temporaire, quel que soit l'outil
 * @param {object} [props.ref]       reçoit { zoomBy(factor), fit(), cancel() → geste annulé ? }
 * @param {string} props.color       couleur de dessin
 * @param {number} props.thickness   épaisseur de trait, en pixels d'écran
 * @param {{ filled: boolean, arrow: boolean, background: boolean }} props.options options contextuelles (§13.1)
 * @param {{ id: number, filter: object }|null} [props.filterPreview] filtre d'image en cours de réglage (MJ)
 * @param {number[]} props.selectedIds objets sélectionnés par le MJ (§14.1), groupes entiers
 * @param {Function} props.onSelect  nouvelle sélection (liste d'identifiants, vide pour aucune)
 * @param {Function} [props.onContextMenu] clic droit : { x, y (écran), point (tableau), item (touché ou null) }
 * @param {Function} props.onPatchMany, props.onDragMany plusieurs objets d'un coup (sélection, groupe)
 * @param {object[]} props.fog       opérations de brouillard de la diapositive
 * @param {{ value: number, unit: string }} props.grid valeur d'une case (cascade résolue)
 * @param {Function} [props.getIcon] id d'icône → contenu SVG ou null
 * @param {Function} props.onFog     opération de brouillard (MJ)
 */
const BoardCanvas = ({
    ref, slide, items, loaded, drags, pings, characters, npcs, getImage, getIcon, isGM, tool, panOverride = false, color, thickness,
    options, filterPreview = null, selectedIds, onSelect, onContextMenu, fog, grid, onFog, onAdd, onPatch, onPatchMany, onDelete,
    onDrag, onDragMany, onPing, onDropFiles,
}) => {
    const [fitRequest, setFitRequest] = useState(0);
    const [textEdit, setTextEdit] = useState(null);     // { x, y, size, color, background, text, itemId? } champ de saisie ouvert
    const uid = useId().replace(/:/g, '');
    const [ruler, setRuler] = useState(null);           // { from, to } mesure en cours
    // Objets du rôle : un objet caché n'existe pas pour le joueur (§14.3)
    const visibleItems = items.filter(i => isVisible(isGM, i));
    const selectedItems = isGM ? items.filter(i => selectedIds.includes(i.id)) : [];
    const selectedItem = selectedItems.length === 1 ? selectedItems[0] : null;   // poignées : un objet seul (PC-8)
    const svgRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
    const [draft, setDraft] = useState(null);          // { kind: 'stroke', points } | { kind: 'rect', from, to }
    const [moving, setMoving] = useState(null);         // { [id]: géométrie } objets déplacés par moi
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

    // ── Commandes de Board (boutons du coin, clavier) ───────────────────────
    const zoomBy = (factor) => setView(v => zoomAt(v, factor, size.width / 2, size.height / 2));
    const fit = () => setFitRequest(n => n + 1);
    useImperativeHandle(ref, () => ({
        zoomBy,
        fit,
        /** « Ajouter ici ▸ Texte » (PC-7) : champ de saisie au point du tableau donné */
        textAt: (point) => setTextEdit({ x: point.x, y: point.y, size: TEXT_SCREEN_SIZE / view.scale, color, background: options.background, text: '' }),
        /** « Modifier le texte » du menu contextuel : comme le double-clic */
        editText: (id) => {
            const item = items.find(i => i.id === id && i.kind === 'text');
            if (item) setTextEdit({ itemId: item.id, x: item.x, y: item.y, size: item.data.size, color: item.data.color, background: item.data.background, text: item.data.text });
        },
        /** Échap : abandonne le geste en cours (les objets déplacés reviennent à leur place chez tous) */
        cancel: () => {
            const gesture = gestureRef.current;
            if (!gesture && !draft && !ruler) return false;
            gestureRef.current = null;
            if (gesture?.item && moving) {
                const { x, y, w, h, rotation } = gesture.item;
                onDrag(gesture.item.id, { x, y, w, h, rotation }, true);
            }
            if (gesture?.items && moving) onDragMany(gesture.items.map(i => ({ itemId: i.id, x: i.x, y: i.y })), true);
            setDraft(null);
            setRuler(null);
            setMoving(null);
            return true;
        },
    }));

    const localPoint = (e) => {
        const rect = svgRef.current.getBoundingClientRect();
        return { px: e.clientX - rect.left, py: e.clientY - rect.top };
    };
    const boardPoint = (e) => {
        const { px, py } = localPoint(e);
        return screenToBoard(view, px, py);
    };

    /** Objet le plus haut sous le point, parmi ceux que `accept` retient (jamais un objet caché pour le joueur) */
    const topItemAt = (point, accept) => {
        const radius = ERASER_RADIUS_PX / view.scale;
        for (let i = visibleItems.length - 1; i >= 0; i--) {
            const item = visibleItems[i];
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
        const middle = e.pointerType === 'mouse' && e.button === 1;
        if (e.button !== 0 && e.pointerType === 'mouse' && !middle) return;
        svgRef.current.setPointerCapture(e.pointerId);
        pointersRef.current.set(e.pointerId, localPoint(e));

        // Clic molette : déplace la vue avec tous les outils (sans le défilement automatique du navigateur)
        if (middle) {
            e.preventDefault();
            gestureRef.current = { type: 'pan', start: localPoint(e), view: view, viewOnly: true };
            return;
        }

        // Deux doigts : zoom et déplacement de la vue, tout autre geste est abandonné
        if (pointersRef.current.size === 2) {
            cancelLongPress();
            setDraft(null);
            setMoving(null);
            const [a, b] = [...pointersRef.current.values()];
            gestureRef.current = { type: 'pinch', a, b, view: view };
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
        if (tool === 'hand' || panOverride) {
            // Main : la vue seulement, jamais un objet
            gestureRef.current = { type: 'pan', start, view: view, viewOnly: true };
        } else if (e.target.dataset?.handle === 'rotate' && selectedItem) {
            // Poignée de rotation (MJ, Q-52) : autour du centre de l'objet
            const center = { x: selectedItem.x + selectedItem.w / 2, y: selectedItem.y + selectedItem.h / 2 };
            gestureRef.current = { type: 'rotate', start, item: selectedItem, center };
        } else if (e.target.dataset?.handle === 'resize' && selectedItem) {
            // Poignée de l'objet sélectionné (MJ) : proportions gardées, sauf rectangle et ellipse
            gestureRef.current = { type: 'resize', start, item: selectedItem, ratio: selectedItem.w / (selectedItem.h || 1) };
        } else if (tool === 'text' && canDraw(isGM, slide)) {
            // Texte : champ de saisie à l'endroit du clic (§13.1) ; sans le mousedown qui suit
            // (il rendrait le focus à la page et fermerait le champ à peine ouvert)
            e.preventDefault();
            cancelLongPress();
            gestureRef.current = null;
            setTextEdit({ x: point.x, y: point.y, size: TEXT_SCREEN_SIZE / view.scale, color, background: options.background, text: '' });
            return;
        } else if (tool === 'ruler' && slide.gridEnabled) {
            gestureRef.current = { type: 'ruler', start };
            setRuler({ from: point, to: point });
        } else if (fogTool) {
            gestureRef.current = { type: 'fog', start, op: tool === 'fog-reveal' ? 'reveal' : 'cover' };
            setDraft({ kind: 'fog', from: point, to: point });
        } else if (tool === 'pen' && canDraw(isGM, slide)) {
            gestureRef.current = { type: 'pen', start };
            setDraft({ kind: 'stroke', points: [point.x, point.y] });
        } else if ((tool === 'rect' || tool === 'ellipse' || tool === 'line') && canDraw(isGM, slide)) {
            gestureRef.current = { type: tool, start };
            setDraft({ kind: tool, from: point, to: point, square: false });
        } else if (tool === 'halo' && canDraw(isGM, slide)) {
            gestureRef.current = { type: 'halo', start };
            setDraft({ kind: 'halo', from: point, to: point });
        } else if (tool === 'eraser') {
            gestureRef.current = { type: 'eraser', start };
            erase(point);
        } else if (isGM) {
            // MJ, Sélection (§14.1) : un objet (même verrouillé) se sélectionne avec son groupe ;
            // le glisser déplace la sélection s'il en fait partie ; Maj : ajouter / retirer ;
            // dans le vide : rectangle de sélection (PA-3), Maj l'ajoute à la sélection
            const hit = topItemAt(point, () => true);
            if (!hit) {
                gestureRef.current = { type: 'marquee', start, additive: e.shiftKey };
                setDraft({ kind: 'marquee', from: point, to: point });
            } else if (e.shiftKey) {
                gestureRef.current = { type: 'toggle', start, id: hit.id };
            } else {
                const select = selectedIds.includes(hit.id) ? selectedIds : expandGroups(items, [hit.id]);
                const movers = items.filter(i => select.includes(i.id) && canMove(isGM, slide, i));
                gestureRef.current = { type: 'move', start, origin: point, items: movers, select, moved: false };
            }
        } else {
            // Joueur : un objet qu'il peut déplacer emmène tout son groupe (PC-4), sinon la vue
            const hit = topItemAt(point, it => canMove(isGM, slide, it));
            const movers = hit ? items.filter(i => expandGroups(items, [hit.id]).includes(i.id)) : [];
            gestureRef.current = hit
                ? { type: 'move', start, origin: point, items: movers, select: [], moved: false }
                : { type: 'pan', start, view: view, viewOnly: true };
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
            setView(pinchView(gesture.view, gesture.a, gesture.b, a, b));
            return;
        }
        if (Math.hypot(local.px - gesture.start.px, local.py - gesture.start.py) > MOVE_SLOP_PX) cancelLongPress();

        const point = boardPoint(e);
        switch (gesture.type) {
            case 'pen':
                setDraft(d => (d ? { ...d, points: [...d.points, point.x, point.y] } : d));
                break;
            case 'rect':
            case 'ellipse':
            case 'halo':
            case 'fog':
                setDraft(d => (d ? { ...d, to: point, square: e.shiftKey } : d));
                break;
            case 'line':
                setDraft(d => (d ? { ...d, to: lineEnd(d.from, point, e.shiftKey) } : d));
                break;
            case 'ruler':
                setRuler(r => (r ? { ...r, to: point } : r));
                break;
            case 'rotate': {
                const { item, center } = gesture;
                const raw = angleFrom(center, point);
                const rotation = e.shiftKey ? snapAngle(raw) : Math.round(raw);
                setMoving({ [item.id]: { x: item.x, y: item.y, rotation } });
                onDrag(item.id, { x: item.x, y: item.y, rotation });
                break;
            }
            case 'resize': {
                const { item, ratio } = gesture;
                const minSize = 8 / view.scale;
                const free = item.kind === 'rect' || item.kind === 'ellipse';
                let geometry;
                if (item.rotation) {
                    // Objet tourné : redimensionné autour de son centre, dans son propre repère
                    const cx = item.x + item.w / 2, cy = item.y + item.h / 2;
                    const a = -item.rotation * Math.PI / 180;
                    const dx = point.x - cx, dy = point.y - cy;
                    const w = Math.max(minSize, 2 * Math.abs(dx * Math.cos(a) - dy * Math.sin(a)));
                    const h = free ? Math.max(minSize, 2 * Math.abs(dx * Math.sin(a) + dy * Math.cos(a))) : w / ratio;
                    geometry = { x: cx - w / 2, y: cy - h / 2, w, h };
                } else {
                    const w = Math.max(minSize, point.x - item.x);
                    const h = free ? Math.max(minSize, point.y - item.y) : w / ratio;
                    geometry = { x: item.x, y: item.y, w, h };
                }
                setMoving({ [item.id]: geometry });
                onDrag(item.id, geometry);
                break;
            }
            case 'eraser':
                erase(point);
                break;
            case 'marquee':
                setDraft(d => (d ? { ...d, to: point } : d));
                break;
            case 'move': {
                // Toute la sélection (ou le groupe) suit le pointeur ; un seul message en direct
                if (gesture.items.length === 0 || Math.hypot(local.px - gesture.start.px, local.py - gesture.start.py) <= MOVE_SLOP_PX) break;
                const dx = point.x - gesture.origin.x, dy = point.y - gesture.origin.y;
                const positions = gesture.items.map(i => ({ itemId: i.id, x: i.x + dx, y: i.y + dy }));
                gesture.moved = true;
                setMoving(Object.fromEntries(positions.map(p => [p.itemId, { x: p.x, y: p.y }])));
                if (positions.length === 1) onDrag(positions[0].itemId, { x: positions[0].x, y: positions[0].y });
                else onDragMany(positions);
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
        } else if ((gesture.type === 'rect' || gesture.type === 'ellipse') && draft?.kind === gesture.type) {
            const box = shapeBetween(draft.from, draft.to, draft.square);
            if (box.w * view.scale > 3 && box.h * view.scale > 3) {
                const outline = options.filled ? {} : { width: Math.min(100, thickness / view.scale) };
                onAdd({ kind: gesture.type, ...box, data: { color, filled: options.filled, ...outline } });
            }
        } else if (gesture.type === 'line' && draft?.kind === 'line') {
            const { from, to } = draft;
            if (Math.hypot(to.x - from.x, to.y - from.y) * view.scale > 3) {
                const points = [from.x, from.y, to.x, to.y].map(v => Math.round(v * 10) / 10);
                onAdd({ kind: 'line', data: { points, color, width: Math.min(100, thickness / view.scale), arrow: options.arrow } });
            }
        } else if (gesture.type === 'halo' && draft?.kind === 'halo') {
            // Clic : taille par défaut (3 cases avec la grille) ; glisser : rayon
            const dragged = Math.hypot(draft.to.x - draft.from.x, draft.to.y - draft.from.y);
            const r = dragged * view.scale > MOVE_SLOP_PX ? dragged : (slide.gridEnabled ? slide.gridSize * 3 : HALO_DEFAULT_RADIUS);
            onAdd({ kind: 'halo', x: draft.from.x - r, y: draft.from.y - r, w: 2 * r, h: 2 * r, data: { color } });
        } else if (gesture.type === 'rotate') {
            const m = moving?.[gesture.item.id];
            if (m) {
                onDrag(gesture.item.id, m, true);
                onPatch(gesture.item.id, { rotation: m.rotation });
            }
        } else if (gesture.type === 'fog' && draft?.kind === 'fog') {
            const box = rectBetween(draft.from, draft.to);
            if (box.w * view.scale > 3 && box.h * view.scale > 3) onFog({ op: gesture.op, ...box });
        } else if (gesture.type === 'ruler') {
            setRuler(null);
        } else if (gesture.type === 'resize') {
            const { item } = gesture;
            const m = moving?.[item.id];
            if (m) {
                onDrag(item.id, m, true);
                // Texte : la taille de police suit la largeur (proportions gardées)
                const text = item.kind === 'text' ? { data: { size: Math.round(item.data.size * m.w / item.w * 10) / 10 } } : {};
                onPatch(item.id, { x: m.x, y: m.y, w: m.w, h: m.h, ...text });
            }
        } else if (gesture.type === 'move') {
            if (gesture.moved && moving) {
                const positions = gesture.items.map(i => ({ id: i.id, ...moving[i.id] }));
                if (positions.length === 1) {
                    onDrag(positions[0].id, { x: positions[0].x, y: positions[0].y }, true);
                    onPatch(positions[0].id, { x: positions[0].x, y: positions[0].y });
                } else {
                    onDragMany(positions.map(p => ({ itemId: p.id, x: p.x, y: p.y })), true);
                    onPatchMany(positions.map(p => ({ id: p.id, x: p.x, y: p.y })));
                }
            }
            if (isGM) onSelect(gesture.select);
        } else if (gesture.type === 'toggle') {
            onSelect(toggleInSelection(items, selectedIds, gesture.id));
        } else if (gesture.type === 'marquee' && draft?.kind === 'marquee') {
            // Rectangle de sélection (PC-3) : objets entièrement dedans ; un simple clic désélectionne
            const box = rectBetween(draft.from, draft.to);
            const clicked = box.w * view.scale <= MOVE_SLOP_PX && box.h * view.scale <= MOVE_SLOP_PX;
            const inside = clicked ? [] : visibleItems.filter(i => itemInRect(i, box)).map(i => i.id);
            const base = gesture.additive ? selectedIds : [];
            if (!(clicked && gesture.additive)) onSelect(expandGroups(items, [...base, ...inside]));
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

    // ── Texte : modifier (MJ, double-clic avec la Sélection), valider ───────
    const onDoubleClick = (e) => {
        if (!isGM || tool !== 'select' || panOverride) return;
        const item = topItemAt(boardPoint(e), it => it.kind === 'text' && !it.locked);
        if (!item) return;
        const { text, size: fontSize, color: textColor, background } = item.data;
        setTextEdit({ itemId: item.id, x: item.x, y: item.y, size: fontSize, color: textColor, background, text });
    };
    const commitText = (text, box) => {
        const edit = textEdit;
        setTextEdit(null);
        if (!edit) return;
        if (edit.itemId) {
            if (!text) onDelete(edit.itemId);
            else if (text !== edit.text) onPatch(edit.itemId, { w: box.w, h: box.h, data: { text } });
            return;
        }
        if (text) {
            onAdd({ kind: 'text', x: edit.x, y: edit.y, ...box,
                    data: { text, color: edit.color, size: Math.round(edit.size * 10) / 10, background: edit.background } });
        }
    };

    // ── Rendu ───────────────────────────────────────────────────────────────
    const geometryOf = (item) => {
        const live = moving?.[item.id] ?? drags[item.id];   // moi d'abord, puis ce qui arrive en direct
        return live
            ? { ...item, x: live.x, y: live.y, w: live.w ?? item.w, h: live.h ?? item.h, rotation: live.rotation ?? item.rotation }
            : item;
    };

    // ── Clic droit : menu contextuel (§14.4), sur l'objet touché ou dans le vide ─
    const onContextMenuEvent = (e) => {
        e.preventDefault();
        if (!onContextMenu) return;
        const point = boardPoint(e);
        onContextMenu({ x: e.clientX, y: e.clientY, point, item: topItemAt(point, () => true) });
    };

    // Halos (PB-8) : juste sous le plus bas des jetons et icônes, quel que soit leur ordre
    const shownItems = visibleItems.filter(i => i.id !== textEdit?.itemId);
    const halos = shownItems.filter(i => i.kind === 'halo');
    const others = shownItems.filter(i => i.kind !== 'halo');
    const firstPiece = others.findIndex(i => i.kind === 'token' || i.kind === 'icon');
    const layered = firstPiece === -1 ? shownItems : [...others.slice(0, firstPiece), ...halos, ...others.slice(firstPiece)];

    const viewWidth = Math.max(1, size.width) / view.scale;
    const viewHeight = Math.max(1, size.height) / view.scale;
    const viewBox = `${view.x} ${view.y} ${viewWidth} ${viewHeight}`;
    const fogDraft = draft?.kind === 'fog' ? rectBetween(draft.from, draft.to) : null;
    const pingRadius = 18 / view.scale;
    const showFog = slide.fogEnabled && (isGM || slide.fogShown);

    // Objet en cours de tracé, dessiné comme le vrai (rectangle, ellipse, ligne, halo)
    const draftItem = (() => {
        if (!draft) return null;
        if (draft.kind === 'rect' || draft.kind === 'ellipse') {
            const box = shapeBetween(draft.from, draft.to, draft.square);
            return { item: { kind: draft.kind, data: { color, filled: options.filled, width: thickness / view.scale } }, geometry: box };
        }
        if (draft.kind === 'line') {
            const points = [draft.from.x, draft.from.y, draft.to.x, draft.to.y];
            return { item: { kind: 'line', data: { points, color, width: thickness / view.scale, arrow: options.arrow } }, geometry: pointsBox(points) };
        }
        if (draft.kind === 'halo') {
            const r = Math.max(4 / view.scale, Math.hypot(draft.to.x - draft.from.x, draft.to.y - draft.from.y));
            return { item: { kind: 'halo', data: { color } }, geometry: { x: draft.from.x - r, y: draft.from.y - r, w: 2 * r, h: 2 * r } };
        }
        return null;
    })();

    // Outil réellement disponible (curseur) : un outil interdit retombe sur la Sélection,
    // l'espace maintenu donne la main
    const drawing = canDraw(isGM, slide);
    const available = {
        select: true, hand: true, eraser: drawing,
        ...Object.fromEntries(DRAW_TOOLS.map(t => [t, drawing])),
        ruler: slide.gridEnabled, 'fog-reveal': isGM && slide.fogEnabled, 'fog-cover': isGM && slide.fogEnabled,
    };
    const effectiveTool = panOverride ? 'hand' : (available[tool] ? tool : 'select');

    return (
        <>
        <svg ref={svgRef} className={`vtt-board-canvas is-tool-${effectiveTool}`} viewBox={viewBox}
             onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
             onDoubleClick={onDoubleClick} onDragOver={onDragOver} onDrop={onDrop} onContextMenu={onContextMenuEvent}
             role="img" aria-label={`Tableau : ${slide.name}`}>
            {layered.map(item => {
                const node = (
                    <BoardItem key={item.id} item={item} geometry={geometryOf(item)} getImage={getImage} getIcon={getIcon} characters={characters} npcs={npcs}
                               filterPreview={filterPreview?.id === item.id ? filterPreview.filter : null} />
                );
                // Caché aux joueurs (§14.3) : à moitié transparent chez le MJ
                return item.hidden ? <g key={item.id} className="vtt-board-hidden-item">{node}</g> : node;
            })}
            {/* Pastille « œil barré » des objets cachés, dans leur coin haut droit */}
            {isGM && shownItems.filter(i => i.hidden).map(item => {
                const g = geometryOf(item);
                const r = 9 / view.scale;
                // Objet rond (halo, jeton) : sur le cercle, en haut à droite ; sinon au coin de la boîte
                const round = item.kind === 'halo' || item.kind === 'token';
                const bx = round ? g.x + g.w / 2 + g.w * 0.25 : g.x + g.w;
                const by = round ? g.y + g.h / 2 - g.h * 0.25 : g.y;
                return (
                    <g key={`hidden-${item.id}`} className="vtt-board-hidden-badge" pointerEvents="none"
                       transform={`translate(${bx} ${by}) scale(${1 / view.scale})`}>
                        <circle r={r * view.scale} />
                        <path d="M-5-5L5 5M-2.2-.6a2 2 0 0 0 2.8 2.8M-1.3-3.9A5 5 0 0 1 0-4c3 0 5.4 2.6 6 4a7 7 0 0 1-1.7 2.3M-3.4-2.4C-4.8-1.6-5.6-.6-6 0c.6 1.4 3 4 6 4a5.4 5.4 0 0 0 2.9-.9" />
                    </g>
                );
            })}

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
            {draftItem && <BoardItem item={draftItem.item} geometry={draftItem.geometry} getImage={getImage} characters={characters} />}

            {/* Rectangle de sélection (PC-3) */}
            {draft?.kind === 'marquee' && (() => {
                const box = rectBetween(draft.from, draft.to);
                return <rect className="vtt-board-marquee" x={box.x} y={box.y} width={box.w} height={box.h}
                             strokeDasharray={`${4 / view.scale} ${3 / view.scale}`} />;
            })()}

            {/* Plusieurs objets sélectionnés : un cadre chacun, sans poignées (PC-8) */}
            {selectedItems.length > 1 && selectedItems.map(item => {
                const g = geometryOf(item);
                const pad = 4 / view.scale;
                const rotation = ROTATABLE_KINDS.includes(item.kind) ? (g.rotation ?? 0) : 0;
                return (
                    <rect key={`sel-${item.id}`} className={`vtt-board-selection${item.locked ? ' is-locked' : ''}`}
                          transform={rotation ? `rotate(${rotation} ${g.x + g.w / 2} ${g.y + g.h / 2})` : undefined}
                          x={g.x - pad} y={g.y - pad} width={g.w + 2 * pad} height={g.h + 2 * pad}
                          strokeDasharray={`${6 / view.scale} ${4 / view.scale}`} />
                );
            })}

            {selectedItem && selectedItem.id !== textEdit?.itemId && (() => {
                const g = geometryOf(selectedItem);
                const pad = 4 / view.scale;
                const resizable = !selectedItem.locked && !POINT_KINDS.includes(selectedItem.kind);
                const rotatable = canRotate(isGM, slide, selectedItem);
                const rotation = ROTATABLE_KINDS.includes(selectedItem.kind) ? (g.rotation ?? 0) : 0;
                const stem = 22 / view.scale;
                return (
                    // Cadre et poignées tournés avec l'objet
                    <g transform={rotation ? `rotate(${rotation} ${g.x + g.w / 2} ${g.y + g.h / 2})` : undefined}>
                        <rect className={`vtt-board-selection${selectedItem.locked ? ' is-locked' : ''}`}
                              x={g.x - pad} y={g.y - pad} width={g.w + 2 * pad} height={g.h + 2 * pad}
                              strokeDasharray={`${6 / view.scale} ${4 / view.scale}`} />
                        {resizable && (
                            <circle data-handle="resize" className="vtt-board-handle" cx={g.x + g.w + pad} cy={g.y + g.h + pad} r={7 / view.scale}>
                                <title>Redimensionner</title>
                            </circle>
                        )}
                        {rotatable && (
                            <>
                                <line className="vtt-board-selection" x1={g.x + g.w / 2} y1={g.y - pad} x2={g.x + g.w / 2} y2={g.y - pad - stem} />
                                <circle data-handle="rotate" className="vtt-board-handle is-rotate" cx={g.x + g.w / 2} cy={g.y - pad - stem} r={7 / view.scale}>
                                    <title>Tourner (Maj : pas de 15°)</title>
                                </circle>
                            </>
                        )}
                    </g>
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

        {/* Saisie d'un texte (§13.1), posée sur le cadre à l'endroit du texte */}
        {textEdit && (
            <BoardTextInput left={(textEdit.x - view.x) * view.scale} top={(textEdit.y - view.y) * view.scale}
                            size={textEdit.size} scale={view.scale} color={textEdit.color} background={textEdit.background}
                            initialText={textEdit.text} onCommit={commitText} onCancel={() => setTextEdit(null)} />
        )}

        {/* Zoom (§12.3) : en haut à droite, loin de la zone d'actions de la page */}
        <div className="vtt-board-corner is-top-right" role="group" aria-label="Zoom">
            <button type="button" className="vtt-board-tool" onClick={() => zoomBy(ZOOM_STEP)} aria-label="Zoom avant (+)" title="Zoom avant (+)">
                <Glyph name="zoomIn" />
            </button>
            <button type="button" className="vtt-board-tool" onClick={() => zoomBy(1 / ZOOM_STEP)} aria-label="Zoom arrière (−)" title="Zoom arrière (−)">
                <Glyph name="zoomOut" />
            </button>
            <button type="button" className="vtt-board-tool" onClick={fit} aria-label="Recadrer sur le contenu (0)" title="Recadrer sur le contenu (0)">
                <Glyph name="fit" />
            </button>
        </div>
        </>
    );
};

export default BoardCanvas;

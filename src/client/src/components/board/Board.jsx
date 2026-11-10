// src/client/src/components/board/Board.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Tableau partagé (documentations/spec_tableau.md §10.8) : le composant qu'un slug
// pose dans un onglet, joueur ou MJ (Q-5), et que BoardLayer met dans sa fenêtre.
//
//   <Board sessionId={activeSession?.id} role="gm" />
//
// - MJ : liste des diapositives à gauche (sauf en compact), diapositive éditée
//   (mémorisée par table), « Montrer aux joueurs » ; il prépare une diapositive
//   pendant que les joueurs en voient une autre (Q-7) ; « Les joueurs voient : … »
//   le lui rappelle, et une diapositive au brouillard masqué demande confirmation
//   avant d'être montrée (§12.6).
// - Joueur : la diapositive montrée par le MJ, rien sinon.
// Raccourcis clavier (§12.4) : pointeur sur la vue ou focus dedans, jamais dans un champ.
// Sélection du MJ (§14) : une liste d'objets (groupes entiers), barre de sélection en
// surimpression et menu contextuel au clic droit, qui partagent les mêmes actions.
// Les modales passent par l'emplacement à modales (rognées sinon dans une fenêtre flottante).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBoardSession } from '../../hooks/useBoardSession.js';
import { useBoardSlide } from '../../hooks/useBoardSlide.js';
import { useBoardImages } from '../../hooks/useBoardImages.js';
import { usePersistedState } from '../../hooks/usePersistedState.js';
import { getSystemFromPath } from '../../hooks/useSystem.js';
import useConfirm from '../../hooks/useConfirm.jsx';
import { tableScope } from '../../tools/browserStorage.js';
import { itemsBox } from '../../tools/boardGeometry.js';
import { BOARD_PALETTE, canDelete, canRecolor, participantColor } from '../../tools/boardRights.js';
import { isNeutral } from '../../tools/boardFilters.js';
import { expandGroups, selectionInfo } from '../../tools/boardSelection.js';
import { resolveGrid } from '../../tools/boardGrid.js';
import { useBoardIcons } from '../../hooks/useBoardIcons.js';
import useSlugConfig from '../../hooks/useSlugConfig.js';
import { HostedModal } from '../ui/ModalHost.jsx';
import BoardCanvas, { ZOOM_STEP } from './BoardCanvas.jsx';
import BoardToolbar, { ImageLinkModal, NpcTokenModal, Palette, THICKNESSES, TOOLS, toolState } from './BoardToolbar.jsx';
import BoardContextMenu from './BoardContextMenu.jsx';
import BoardHelp from './BoardHelp.jsx';
import SlideList from './SlideList.jsx';
import IconPicker from './IconPicker.jsx';
import BoardImageFilters from './BoardImageFilters.jsx';

const TABLE_DEFAULTS = { slideId: null };
const NPC_TOKEN_SIZE = 60;
const ICON_SIZE = 48;
const LINKED_IMAGE_MAX_WIDTH = 800;   // lien d'image : taille naturelle, réduite à cette largeur

/** La touche vise-t-elle un champ de saisie ou une fenêtre (les raccourcis s'effacent) ? */
const isTypingTarget = (target) =>
    !!target?.closest?.('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"]');
const KIND_LABELS = {
    image: 'Image', icon: 'Icône', token: 'Jeton', stroke: 'Trait', rect: 'Rectangle',
    ellipse: 'Ellipse', line: 'Ligne', halo: 'Halo', text: 'Texte',
};
const DRAW_OPTIONS = { filled: true, arrow: false, background: false };   // options contextuelles par défaut (§13.1)

/** Activation du tableau pour la table (Q-61 : sans confirmation), libellé selon l'état */
const EnableToggle = ({ board }) => (
    <button type="button" className={`vtt-pill${board.enabled ? ' is-selected' : ''}`} aria-pressed={board.enabled}
            onClick={() => board.setEnabled(!board.enabled)}
            title={board.enabled ? 'Désactiver : les joueurs ne voient plus le tableau' : 'Activer : les joueurs voient le tableau'}>
        {board.enabled ? '✓ Tableau activé' : 'Tableau désactivé'}
    </button>
);

/** Une diapositive affichée : outils et vue (sous-composant de module) */
const SlideView = ({ sessionId, slide, isGM, board, compact, myId, confirm, tableGrid }) => {
    const content = useBoardSlide(sessionId, slide.id);
    const getImage = useBoardImages(sessionId);
    const getIcon = useBoardIcons();
    const grid = resolveGrid(tableGrid, { value: slide.gridValue, unit: slide.gridUnit });
    const [tool, setTool] = useState('select');           // PA-1 : Sélection à l'ouverture
    const [color, setColor] = useState(BOARD_PALETTE[2].color);
    const [thickness, setThickness] = useState(THICKNESSES[0].value);
    const [selectedIds, setSelectedIds] = useState([]);   // sélection du MJ (§14.1), groupes entiers
    const [spacePan, setSpacePan] = useState(false);      // espace maintenu : main temporaire
    const [options, setOptions] = useState(DRAW_OPTIONS);  // Plein / Contour, Flèche, Fond (§13.1)
    const [panel, setPanel] = useState(null);             // sous la barre de sélection : 'filters' | 'color' | null
    const [filterPreview, setFilterPreview] = useState(null);   // { id, filter } en cours de réglage
    const [menu, setMenu] = useState(null);               // menu contextuel : { x, y, point, item }
    const [adding, setAdding] = useState(null);           // « Ajouter » en cours : { kind: 'icon'|'npc'|'link', point? }
    const canvasRef = useRef(null);
    const viewRef = useRef(null);
    const hoverRef = useRef(false);
    const fileRef = useRef(null);
    const filePointRef = useRef(null);
    const shown = board.shownSlideId === slide.id;
    const shownSlide = board.slides.find(s => s.id === board.shownSlideId) ?? null;

    // Sélection lue à chaque rendu : un objet effacé par un autre en sort de lui-même
    const selectedItems = isGM ? content.items.filter(i => selectedIds.includes(i.id)) : [];
    const info = selectionInfo(selectedItems);
    const selected = info.single;

    const select = (ids) => {
        const next = ids.length === 1 ? ids[0] : null;
        if (next !== (selectedIds.length === 1 ? selectedIds[0] : null)) { setPanel(null); setFilterPreview(null); }
        setSelectedIds(ids);
    };

    // ── Actions sur la sélection (barre et menu contextuel partagés, §14.1) ──
    const unlocked = selectedItems.filter(i => !i.locked);
    const actions = {
        duplicate: async () => {
            const copies = await content.duplicateItems(selectedIds);
            if (copies.length > 0) select(copies.map(c => c.id));
        },
        order: (order) => {
            if (unlocked.length === 1) content.patchItem(unlocked[0].id, { order });
            else if (unlocked.length > 1) content.patchItems(unlocked.map(i => ({ id: i.id })), order);
        },
        color: (value) => {
            const targets = unlocked.filter(canRecolor);
            if (targets.length > 0) content.patchItems(targets.map(i => ({ id: i.id, data: { color: value } })));
        },
        hide: () => {
            if (unlocked.length > 0) content.patchItems(unlocked.map(i => ({ id: i.id, hidden: !info.allHidden })));
        },
        lock: () => content.patchItems(selectedItems.map(i => ({ id: i.id, locked: !info.allLocked }))),
        group: () => content.groupItems(selectedIds, true),
        ungroup: () => content.groupItems(selectedIds, false),
        remove: () => { content.removeItems(selectedIds); select([]); },
    };

    // ── « Ajouter » : depuis la barre (en haut à gauche du contenu) ou ici (menu contextuel, PC-7) ─
    const nearContent = () => {
        const box = itemsBox(content.items) ?? { x: 0, y: 0 };
        return { x: box.x + 20, y: box.y + 20 };
    };
    const addImageUrl = ({ url, width, height }, point) => {
        const at = point ?? nearContent();
        const w = Math.min(LINKED_IMAGE_MAX_WIDTH, width || LINKED_IMAGE_MAX_WIDTH);
        const h = width && height ? w * height / width : w * 0.75;
        content.addItem({ kind: 'image', x: at.x, y: at.y, w, h, data: { url } });
    };
    // Jeton de PNJ : libre (nom, couleur), ou PNJ de la table (npcId : son avatar ou son icône, spec_pnj.md P-21)
    const addNpcToken = ({ label, color: tokenColor, npcId }, point) => {
        const at = point ?? nearContent();
        const data = npcId !== undefined ? { npcId, label, color: tokenColor } : { label, color: tokenColor };
        content.addItem({ kind: 'token', x: at.x, y: at.y, w: NPC_TOKEN_SIZE, h: NPC_TOKEN_SIZE, data });
    };
    const addIcon = ({ icon, color: iconColor }, point) => {
        const at = point ?? nearContent();
        const size = slide.gridEnabled ? slide.gridSize : ICON_SIZE;
        content.addItem({ kind: 'icon', x: at.x, y: at.y, w: size, h: size, data: { icon, color: iconColor } });
    };

    // ── Raccourcis clavier (§12.4, §14.1) ───────────────────────────────────
    // Réabonné à chaque rendu : le gestionnaire lit l'état courant (outil, sélection)
    useEffect(() => {
        const active = () => hoverRef.current || !!viewRef.current?.contains(document.activeElement);
        const onKeyDown = (e) => {
            if (isTypingTarget(e.target) || !active()) return;
            // Ctrl+D : dupliquer la sélection ; Ctrl+A : tout sélectionner (MJ), sans l'effet du navigateur
            if ((e.ctrlKey || e.metaKey) && !e.altKey && isGM) {
                const key = e.key.toLowerCase();
                if (key === 'd' && info.duplicable) { e.preventDefault(); actions.duplicate(); }
                if (key === 'a') { e.preventDefault(); select(content.items.map(i => i.id)); }
                return;
            }
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            if (e.key === ' ') {
                e.preventDefault();               // ni défilement de la page, ni bouton activé
                if (!e.repeat) setSpacePan(true);
                return;
            }
            const key = e.key.toUpperCase();
            const toolForKey = TOOLS.find(t => t.key === key);
            if (toolForKey) {
                const { shown: offered, enabled } = toolState(toolForKey, isGM, slide);
                if (offered && enabled) setTool(toolForKey.id);
            } else if (e.key === 'Escape') {
                if (!canvasRef.current?.cancel()) select([]);
            } else if ((e.key === 'Delete' || e.key === 'Backspace') && info.count > 0 && !info.allLocked) {
                actions.remove();
            } else if (e.key === '+' || e.key === '=') {
                canvasRef.current?.zoomBy(ZOOM_STEP);
            } else if (e.key === '-') {
                canvasRef.current?.zoomBy(1 / ZOOM_STEP);
            } else if (e.key === '0') {
                canvasRef.current?.fit();
            } else {
                return;
            }
            e.preventDefault();
        };
        const onKeyUp = (e) => { if (e.key === ' ') setSpacePan(false); };
        const onBlur = () => setSpacePan(false);
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
        };
    });

    const uploadFiles = (files, point) => {
        for (const file of files) content.uploadImage(file, point ?? {});
    };
    const clear = async () => {
        const ok = await confirm({ title: 'Tout effacer', message: 'Tout ce qui n\'est pas verrouillé sera effacé de la diapositive.', confirmText: 'Tout effacer', danger: true });
        if (ok) { content.clearItems(); select([]); }
    };

    const gmActions = isGM ? {
        onImage: (file, background) => content.uploadImage(file, { background }),
        onImageUrl: (image) => addImageUrl(image),
        onPcTokens: () => content.placePcTokens(),
        // PJ de la table sans jeton sur la diapositive (bouton toujours visible, grisé à 0)
        pcMissing: Object.keys(content.characters ?? {}).filter(id =>
            !content.items.some(i => i.kind === 'token' && String(i.data?.characterId) === id)).length,
        onNpcToken: (token) => addNpcToken(token),
        tableNpcs: Object.values(content.npcs ?? {}),
        reloadNpcs: content.reloadNpcs,
        onIcon: () => setAdding({ kind: 'icon' }),
        onFogToggle: () => board.updateSlide(slide.id, { fogShown: !slide.fogShown }),
        onFogReset: (reset) => content.updateFog({ reset }),
        onClear: clear,
    } : null;

    // ── Menu contextuel (§14.4) : l'objet touché entre dans la sélection ────
    const openMenu = (target) => {
        if (isGM && target.item && !selectedIds.includes(target.item.id)) select(expandGroups(content.items, [target.item.id]));
        if (isGM && !target.item) select([]);
        setMenu(target);
    };
    const menuEntries = (() => {
        if (!menu) return [];
        const ping = { label: 'Ping ici', onSelect: () => content.ping(menu.point.x, menu.point.y, participantColor(myId)) };
        const fit = { label: 'Recadrer', onSelect: () => canvasRef.current?.fit() };
        if (!isGM) {
            const erasable = menu.item && canDelete(false, slide, menu.item);
            return [ping, fit, ...(erasable ? [{ separator: true }, { label: 'Effacer', danger: true, onSelect: () => content.deleteItem(menu.item.id) }] : [])];
        }
        if (!menu.item) {
            const at = menu.point;
            return [
                { label: 'Ajouter ici', children: [
                    { label: 'Image…', onSelect: () => { filePointRef.current = at; fileRef.current?.click(); } },
                    { label: 'Lien d\'image…', onSelect: () => setAdding({ kind: 'link', point: at }) },
                    { label: 'Icône…', onSelect: () => setAdding({ kind: 'icon', point: at }) },
                    { label: 'Jeton de PNJ…', onSelect: () => setAdding({ kind: 'npc', point: at }) },
                    { label: 'Texte', onSelect: () => canvasRef.current?.textAt(at) },
                    { label: 'Jetons des PJ', disabled: gmActions.pcMissing === 0, onSelect: () => content.placePcTokens(at) },
                ] },
                ping, fit,
                { separator: true },
                { label: 'Tout effacer', danger: true, onSelect: clear },
            ];
        }
        const one = info.single;
        return [
            ...(info.duplicable ? [{ label: 'Dupliquer', hint: 'Ctrl+D', onSelect: actions.duplicate }] : []),
            { label: 'Premier plan', disabled: unlocked.length === 0, onSelect: () => actions.order('front') },
            { label: 'Arrière-plan', disabled: unlocked.length === 0, onSelect: () => actions.order('back') },
            { separator: true },
            ...(info.colorable ? [{ label: 'Couleur', palette: actions.color }] : []),
            ...(one?.kind === 'image' && !one.locked ? [{ label: 'Filtres…', onSelect: () => setPanel('filters') }] : []),
            ...(one?.kind === 'text' && !one.locked ? [{ label: 'Modifier le texte', onSelect: () => canvasRef.current?.editText(one.id) }] : []),
            { label: info.allHidden ? 'Montrer aux joueurs' : 'Cacher aux joueurs', disabled: unlocked.length === 0, onSelect: actions.hide },
            ...(info.groupable ? [{ label: 'Grouper', onSelect: actions.group }] : []),
            ...(info.ungroupable ? [{ label: 'Dégrouper', onSelect: actions.ungroup }] : []),
            { label: info.allLocked ? 'Déverrouiller' : 'Verrouiller', onSelect: actions.lock },
            { separator: true },
            { label: 'Supprimer', danger: true, disabled: info.allLocked, hint: 'Suppr', onSelect: actions.remove },
        ];
    })();

    // Ctrl+V d'une image (MJ)
    const onPaste = (e) => {
        if (!isGM) return;
        const files = [...(e.clipboardData?.files ?? [])].filter(f => f.type.startsWith('image/'));
        if (files.length === 0) return;
        e.preventDefault();
        uploadFiles(files);
    };

    return (
        <div ref={viewRef} className="vtt-board-view" onPaste={onPaste}
             onPointerEnter={() => { hoverRef.current = true; }} onPointerLeave={() => { hoverRef.current = false; }}>
            {isGM && (
                <div className="vtt-board-view-head">
                    <span className="vtt-board-view-title">{slide.name}</span>
                    {/* Rappel (§12.6) : tableau désactivé, ou le MJ prépare une autre diapositive que celle des joueurs */}
                    {(!board.enabled || !shown) && (
                        <span className="vtt-board-view-shown">
                            {!board.enabled ? 'Les joueurs ne voient pas le tableau' : shownSlide ? (
                                <>Les joueurs voient : <button type="button" className="vtt-board-link" onClick={() => board.onSelect(shownSlide.id)}>{shownSlide.name}</button></>
                            ) : 'Les joueurs ne voient rien'}
                        </span>
                    )}
                    {/* Activation : ici seulement, présent dans tous les modes de la liste et en fenêtre réduite */}
                    <EnableToggle board={board} />
                    <button type="button" className={`vtt-btn vtt-btn-sm${shown ? '' : ' vtt-btn-primary'}`}
                            onClick={() => board.show(shown ? null : slide.id)}>
                        {shown ? 'Cacher aux joueurs' : 'Montrer aux joueurs'}
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
                          thickness={thickness} onThickness={setThickness} gm={gmActions}
                          options={options} onOption={(key, value) => setOptions(prev => ({ ...prev, [key]: value }))} />
            <div className="vtt-board-stage">
                <BoardCanvas ref={canvasRef} slide={slide} items={content.items} drags={content.drags} pings={content.pings}
                             selectedIds={selectedItems.map(i => i.id)} onSelect={select} onContextMenu={openMenu}
                             characters={content.characters} npcs={content.npcs} getImage={getImage} getIcon={getIcon} isGM={isGM}
                             fog={content.fog} grid={grid} onFog={content.updateFog}
                             tool={tool} panOverride={spacePan} color={color} thickness={thickness} loaded={content.loaded}
                             options={options} filterPreview={filterPreview}
                             onAdd={content.addItem} onPatch={content.patchItem} onPatchMany={content.patchItems} onDelete={content.deleteItem}
                             onDrag={content.emitDrag} onDragMany={content.emitDragMany}
                             onPing={(x, y) => content.ping(x, y, participantColor(myId))}
                             onDropFiles={uploadFiles} />
                <BoardHelp isGM={isGM} slide={slide} />
                {/* Sélection (MJ) : en surimpression dans le coin haut gauche du cadre, pour que son
                    apparition ne décale pas la vue (le second clic d'un double-clic tombait à côté) */}
                {info.count > 0 && (
                    <div className="vtt-board-corner is-top-left">
                        <div className="vtt-board-selection-bar" role="group" aria-label="Sélection">
                            <span>
                                {selected ? KIND_LABELS[selected.kind] : `${info.count} objets`}
                                {info.allLocked ? ' · verrouillé' : ''}{info.allHidden ? ' · caché' : ''}
                            </span>
                            <button type="button" className="vtt-btn vtt-btn-sm" onClick={actions.lock}>
                                {info.allLocked ? 'Déverrouiller' : 'Verrouiller'}
                            </button>
                            {info.duplicable && (
                                <button type="button" className="vtt-btn vtt-btn-sm" onClick={actions.duplicate} title="Dupliquer (Ctrl+D)">Dupliquer</button>
                            )}
                            <button type="button" className="vtt-btn vtt-btn-sm" disabled={unlocked.length === 0} onClick={() => actions.order('front')}>Premier plan</button>
                            <button type="button" className="vtt-btn vtt-btn-sm" disabled={unlocked.length === 0} onClick={() => actions.order('back')}>Arrière-plan</button>
                            {info.colorable && (
                                <button type="button" className={`vtt-btn vtt-btn-sm${panel === 'color' ? ' vtt-btn-primary' : ''}`} aria-expanded={panel === 'color'}
                                        onClick={() => setPanel(p => (p === 'color' ? null : 'color'))}>Couleur</button>
                            )}
                            {selected?.kind === 'image' && (
                                <button type="button" className={`vtt-btn vtt-btn-sm${panel === 'filters' ? ' vtt-btn-primary' : ''}`} disabled={selected.locked}
                                        aria-expanded={panel === 'filters'} onClick={() => setPanel(p => (p === 'filters' ? null : 'filters'))}>Filtres</button>
                            )}
                            <button type="button" className="vtt-btn vtt-btn-sm" disabled={unlocked.length === 0} onClick={actions.hide}>
                                {info.allHidden ? 'Montrer aux joueurs' : 'Cacher aux joueurs'}
                            </button>
                            {info.groupable && <button type="button" className="vtt-btn vtt-btn-sm" onClick={actions.group}>Grouper</button>}
                            {info.ungroupable && <button type="button" className="vtt-btn vtt-btn-sm" onClick={actions.ungroup}>Dégrouper</button>}
                            <button type="button" className="vtt-btn vtt-btn-sm vtt-btn-danger" disabled={info.allLocked}
                                    title={info.allLocked ? 'Déverrouiller d\'abord' : 'Supprimer (Suppr)'} onClick={actions.remove}>
                                Supprimer
                            </button>
                            <button type="button" className="vtt-board-icon-btn" onClick={() => select([])} aria-label="Désélectionner" title="Désélectionner (Échap)">✕</button>
                        </div>
                        {panel === 'color' && info.colorable && (
                            <div className="vtt-board-selection-panel"><Palette value={null} onChange={actions.color} /></div>
                        )}
                        {panel === 'filters' && selected?.kind === 'image' && !selected.locked && (
                            <BoardImageFilters key={selected.id} filter={selected.data.filter ?? null}
                                               onPreview={filter => setFilterPreview(filter ? { id: selected.id, filter } : null)}
                                               onCommit={filter => {
                                                   setFilterPreview(null);
                                                   content.patchItem(selected.id, { data: { filter: isNeutral(filter) ? null : filter } });
                                               }} />
                        )}
                    </div>
                )}
            </div>

            {menu && <BoardContextMenu at={{ x: menu.x, y: menu.y }} entries={menuEntries} onClose={() => setMenu(null)} />}
            {/* « Ajouter » : depuis la barre ou ici (point du menu contextuel) */}
            <input ref={fileRef} type="file" accept="image/*" hidden
                   onChange={e => {
                       const file = e.target.files?.[0];
                       e.target.value = '';
                       if (file) content.uploadImage(file, filePointRef.current ?? {});
                   }} />
            {adding?.kind === 'icon' && (
                <IconPicker onClose={() => setAdding(null)} onPick={icon => addIcon(icon, adding.point)} />
            )}
            {adding?.kind === 'npc' && (
                <NpcTokenModal onClose={() => setAdding(null)} onCreate={token => addNpcToken(token, adding.point)}
                               tableNpcs={gmActions?.tableNpcs} onOpen={gmActions?.reloadNpcs} />
            )}
            {adding?.kind === 'link' && (
                <ImageLinkModal onClose={() => setAdding(null)} onCreate={image => addImageUrl(image, adding.point)} />
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

    // Montrer (§12.6, Q-60) : confirmation seulement si le brouillard est réglé mais masqué,
    // depuis la vue comme depuis la liste
    const show = async (id) => {
        const target = board.slides.find(s => s.id === id);
        if (target?.fogEnabled && !target.fogShown) {
            const ok = await confirm({
                title: 'Brouillard masqué',
                message: `Le brouillard de « ${target.name} » est masqué : les joueurs verront toute la carte.`,
                confirmText: 'Montrer quand même',
            });
            if (!ok) return;
        }
        board.show(id);
    };
    const boardActions = { ...board, show, onSelect };

    return (
        <div className={`vtt-board${compact ? ' is-compact' : ''}`}>
            {isGM && !compact && (
                <SlideList board={boardActions} selectedId={slideId} onSelect={onSelect} confirm={confirm} slugGrid={slugGrid} tableGrid={tableGrid} />
            )}
            <div className="vtt-board-main">
                {slide ? (
                    <SlideView key={slide.id} sessionId={sessionId} slide={slide} isGM={isGM} compact={compact}
                               board={boardActions} myId={user?.character?.id} confirm={confirm} tableGrid={tableGrid} />
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

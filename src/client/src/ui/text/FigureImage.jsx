// ui/text/FigureImage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Image de l'éditeur (spec_journal.md partie IV) : sans cadre, à sa taille, placée à gauche ou
// à droite avec le texte autour, ou centrée seule sur sa ligne, avec une légende.
//   - au survol : bouton « Agrandir » (le double-clic marche aussi) ;
//   - au clic : contour, poignée de taille au coin, barre de l'image (taille P / M / G / Pleine,
//     placement, légende, agrandir, supprimer).
// Nœud « image » (même nom que l'extension d'origine) : { src, alt, width (% de la largeur),
// align ('center' | 'wrap-left' | 'wrap-right'), caption }. HTML : <figure data-type="image">
// <img><figcaption></figure> ; une ancienne <img> seule est relue en image centrée, à sa taille.
// Les attributs passent dans le document : ils suivent l'écriture à plusieurs et l'export.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

const SIZES = [['s', 'P', 'Petite', 30], ['m', 'M', 'Moyenne', 50], ['l', 'G', 'Grande', 75], ['full', 'Pleine', 'Toute la largeur', 100]];
const ALIGNS = [['wrap-left', 'À gauche, texte autour'], ['center', 'Centrée, seule sur sa ligne'], ['wrap-right', 'À droite, texte autour']];
const MIN_WIDTH = 10;
const CORNERS = ['nw', 'ne', 'sw', 'se'];

const Svg = ({ children }) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const ALIGN_ICONS = {
    'wrap-left': <Svg><rect x="3" y="5" width="8" height="8" rx="1" /><path d="M14 6h7M14 10h7M3 17h18M3 21h14" /></Svg>,
    center: <Svg><rect x="7" y="4" width="10" height="9" rx="1" /><path d="M3 17h18M6 21h12" /></Svg>,
    'wrap-right': <Svg><rect x="13" y="5" width="8" height="8" rx="1" /><path d="M3 6h7M3 10h7M3 17h18M7 21h14" /></Svg>,
};
const ZoomIcon = () => <Svg><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Svg>;
const CaptionIcon = () => <Svg><rect x="4" y="3" width="16" height="11" rx="1" /><path d="M7 18h10M9 21h6" /></Svg>;
const TrashIcon = () => <Svg><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Svg>;

// Taille rapide la plus proche de la largeur (pour l'état actif des boutons)
const sizeOf = (width) => SIZES.find(([, , , w]) => w === width)?.[0] ?? null;

// Barre de l'image sélectionnée (éditeur modifiable seulement)
const ImageBar = ({ node, updateAttributes, deleteNode, onZoom }) => {
    const [captionOpen, setCaptionOpen] = useState(false);
    const { width, align, caption } = node.attrs;
    const current = sizeOf(width);
    return (
        <div className="rich-editor-image-bar" contentEditable={false}>
            {SIZES.map(([key, label, title, w]) => (
                <button key={key} type="button" title={title} onClick={() => updateAttributes({ width: w })}
                        className={`rich-editor-btn${current === key ? ' is-active' : ''}`}>{label}</button>
            ))}
            <span className="rich-editor-sep" />
            {ALIGNS.map(([key, title]) => (
                <button key={key} type="button" title={title} onClick={() => updateAttributes({ align: key })}
                        className={`rich-editor-btn${align === key ? ' is-active' : ''}`}>{ALIGN_ICONS[key]}</button>
            ))}
            <span className="rich-editor-sep" />
            <button type="button" title="Légende" onClick={() => setCaptionOpen(o => !o)}
                    className={`rich-editor-btn${captionOpen || caption ? ' is-active' : ''}`}><CaptionIcon /></button>
            <button type="button" title="Agrandir" onClick={onZoom} className="rich-editor-btn"><ZoomIcon /></button>
            <span className="rich-editor-sep" />
            <button type="button" title="Supprimer l'image" onClick={deleteNode} className="rich-editor-btn is-danger"><TrashIcon /></button>
            {captionOpen && (
                // Entrée ou sortie du champ : la légende est gardée ; Échap : abandon
                <input type="text" className="rich-editor-image-caption" autoFocus placeholder="Légende de l'image…" defaultValue={caption}
                       onKeyDown={(e) => {
                           if (e.key === 'Enter') { e.preventDefault(); updateAttributes({ caption: e.target.value.trim() }); setCaptionOpen(false); }
                           if (e.key === 'Escape') { e.target.dataset.cancel = '1'; setCaptionOpen(false); }
                       }}
                       onBlur={(e) => { if (!e.target.dataset.cancel) updateAttributes({ caption: e.target.value.trim() }); setCaptionOpen(false); }} />
            )}
        </div>
    );
};

const FigureView = ({ node, updateAttributes, deleteNode, selected, editor, extension }) => {
    const ref = useRef(null);
    const [liveWidth, setLiveWidth] = useState(null);   // largeur pendant le glisser de la poignée
    const { src, alt, width, align, caption } = node.attrs;
    const editable = editor.isEditable;
    const shownWidth = liveWidth ?? width;
    const zoom = () => extension.options.onOpen?.(src);

    // Poignées des quatre coins : largeur libre, en % de la largeur de l'éditeur. Un coin gauche
    // grandit vers la gauche ; une image centrée grandit des deux côtés (le geste compte double).
    const startResize = (corner) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        const total = editor.view.dom.clientWidth || 1;
        const startPx = ref.current.getBoundingClientRect().width;
        const x0 = e.clientX;
        const direction = corner.endsWith('w') ? -1 : 1;
        const factor = (align || 'center') === 'center' ? 2 : 1;
        let next = width;
        const move = (ev) => {
            const px = startPx + (ev.clientX - x0) * direction * factor;
            next = Math.round(Math.min(100, Math.max(MIN_WIDTH, (px / total) * 100)));
            setLiveWidth(next);
        };
        const up = () => {
            removeEventListener('pointermove', move);
            removeEventListener('pointerup', up);
            setLiveWidth(null);
            if (next !== width) updateAttributes({ width: next });
        };
        addEventListener('pointermove', move);
        addEventListener('pointerup', up);
    };

    return (
        <NodeViewWrapper as="figure" ref={ref} data-drag-handle="" data-align={align || 'center'}
                         className={`rich-editor-figure${selected && editable ? ' is-selected' : ''}`}
                         style={shownWidth ? { width: `${shownWidth}%` } : undefined}>
            {/* Image, bouton « Agrandir » et poignées : les poignées suivent les coins de l'image, légende à part */}
            <div className="rich-editor-figure-media">
                <img src={src} alt={alt || caption || ''} draggable={false} onDoubleClick={zoom} />
                <button type="button" className="rich-editor-figure-zoom" contentEditable={false} onClick={zoom} title="Agrandir (ou double-clic)">
                    <ZoomIcon /> Agrandir
                </button>
                {selected && editable && CORNERS.map(corner => (
                    <span key={corner} className={`rich-editor-figure-handle is-${corner}`} contentEditable={false}
                          onPointerDown={startResize(corner)} title="Taille" />
                ))}
            </div>
            {caption && <figcaption>{caption}</figcaption>}
            {selected && editable && <ImageBar node={node} updateAttributes={updateAttributes} deleteNode={deleteNode} onZoom={zoom} />}
        </NodeViewWrapper>
    );
};

const FigureImage = Node.create({
    name: 'image',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addOptions() {
        return {
            onOpen: null,           // (src) → ouvre l'agrandissement
            HTMLAttributes: {},
        };
    },

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: null },
            width: { default: null },      // % de la largeur de l'éditeur ; null = taille de l'image (anciennes notes)
            align: { default: 'center' },
            caption: { default: '' },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'figure[data-type="image"]',
                getAttrs: (el) => {
                    const img = el.querySelector('img');
                    if (!img) return false;
                    return {
                        src: img.getAttribute('src'),
                        alt: img.getAttribute('alt'),
                        width: Number(el.getAttribute('data-width')) || null,
                        align: el.getAttribute('data-align') || 'center',
                        caption: el.querySelector('figcaption')?.textContent ?? '',
                    };
                },
            },
            // Image seule (anciennes notes, collage) : centrée, à sa taille
            { tag: 'img[src]', getAttrs: (el) => ({ src: el.getAttribute('src'), alt: el.getAttribute('alt') }) },
        ];
    },

    renderHTML({ node }) {
        const { src, alt, width, align, caption } = node.attrs;
        const figure = mergeAttributes(this.options.HTMLAttributes, {
            'data-type': 'image', 'data-align': align || 'center', class: 'rich-editor-figure',
            ...(width ? { 'data-width': String(width), style: `width: ${width}%` } : {}),
        });
        return ['figure', figure, ['img', { src, alt: alt || caption || null }], ...(caption ? [['figcaption', {}, caption]] : [])];
    },

    addCommands() {
        return {
            setImage: (attrs) => ({ commands }) => commands.insertContent({ type: this.name, attrs: { width: 50, align: 'center', ...attrs } }),
        };
    },

    addNodeView() {
        // Les clics et la saisie dans la barre de l'image (légende) restent à la barre
        return ReactNodeViewRenderer(FigureView, { stopEvent: ({ event }) => !!event.target?.closest?.('.rich-editor-image-bar, .rich-editor-figure-handle') });
    },
});

export default FigureImage;

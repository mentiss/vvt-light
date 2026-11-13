// ui/text/RichTextEditor.jsx - Éditeur rich text TipTap (Notion-like, v3)
import React, {useEffect, useCallback, useRef, useState} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import { ySyncPluginKey } from '@tiptap/y-tiptap';
import { Markdown } from '@tiptap/markdown';
import Mention from '@tiptap/extension-mention';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { createPortal } from 'react-dom';
import { looksLikeMarkdown } from '../tools/markdownPaste.js';

import './RichTextEditor.css';
import AlertModal from "../modal/AlertModal.jsx";
import Popover from '../panel/Popover.jsx';
import ImageLightbox from '../image/ImageLightbox.jsx';
import FigureImage from './FigureImage.jsx';
import { resizeImage } from '../tools/imageResize.js';

// --- Bouton toolbar ---
const ToolbarButton = ({ onClick, active, title, children }) => (
    <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClick(e); }}
        className={`rich-editor-btn ${active ? 'is-active' : ''}`}
        title={title}
    >
        {children}
    </button>
);

// --- Séparateur ---
const Separator = () => (
    <div className="rich-editor-sep" />
);

// --- Icône image (au trait, pas d'emoji) ---
const ImageIcon = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-9 9" />
    </svg>
);

// --- Boutons de mise en forme ---
// Le même jeu sert la barre d'outils du haut (toolbar 'full') et le menu à la sélection
// (toolbar 'bubble') : un seul des deux par éditeur (spec_journal.md, partie II §8.4).
const FormatButtons = ({ editor, onImage }) => (
    <>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras (Ctrl+B)"><b>G</b></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique (Ctrl+I)"><i>I</i></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligné (Ctrl+U)"><u>S</u></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Barré"><s>B</s></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Surligné"><mark>H</mark></ToolbarButton>
        <Separator />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Titre H2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Titre H3">H3</ToolbarButton>
        <Separator />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste à puces">•≡</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numérotée">1.</ToolbarButton>
        <Separator />
        <ToolbarButton onClick={onImage} title="Insérer une image"><ImageIcon /></ToolbarButton>
        {/* Retire gras, surligné… et rend un titre en paragraphe (texte collé d'un site, R-8 v8) */}
        <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Effacer la mise en forme"><ClearIcon /></ToolbarButton>
    </>
);

const ClearIcon = () => (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7V5h12v2M10 5l-3 14M14 19H6M15 13l6 6M21 13l-6 6" />
    </svg>
);

// --- Curseur d'un autre éditeur (écriture à plusieurs) ---
// Classes rich-editor-caret*, couleur de la personne en variable (valeur dynamique)
const renderCaret = (user) => {
    const caret = document.createElement('span');
    caret.className = 'rich-editor-caret';
    caret.style.setProperty('--rich-editor-person', user.color);
    const label = document.createElement('span');
    label.className = 'rich-editor-caret-label';
    label.textContent = user.name;
    caret.append(label);
    return caret;
};

// --- Liens « @ » vers d'autres entrées (spec_journal.md R-11, R-18) ---
// Mention de TipTap : nœud { id, label }, rendu <span data-type="mention" class="rich-editor-mention">@label</span>.
// Un lien dont la cible n'existe plus est barré par une décoration (is-missing), sans toucher au document.
const missingMentionKey = new PluginKey('rich-editor-missing-mention');
const linkMention = (getMentions) => Mention.extend({
    addProseMirrorPlugins() {
        return [
            ...(this.parent?.() ?? []),
            new Plugin({
                key: missingMentionKey,
                props: {
                    decorations(state) {
                        const exists = getMentions()?.exists;
                        if (!exists) return null;
                        const decos = [];
                        state.doc.descendants((node, pos) => {
                            if (node.type.name === 'mention' && !exists(node.attrs.id)) {
                                decos.push(Decoration.node(pos, pos + node.nodeSize, { class: 'is-missing', title: 'Entrée supprimée' }));
                            }
                        });
                        return DecorationSet.create(state.doc, decos);
                    },
                },
            }),
        ];
    },
});

// Liste des entrées proposées après « @ », rendue dans <body> sous le curseur
const MentionMenu = ({ menu, onPick }) => createPortal(
    <div className="rich-editor-mention-menu" role="listbox"
         style={{ left: `${Math.min(menu.rect.left, window.innerWidth - 290)}px`, top: `${menu.rect.bottom + 6}px` }}>
        {menu.items.length === 0 && <div className="rich-editor-mention-empty">Aucune entrée</div>}
        {menu.items.map((item, i) => (
            <button key={item.id} type="button" role="option" aria-selected={i === menu.index}
                    className={`rich-editor-mention-item${i === menu.index ? ' is-active' : ''}`}
                    onMouseDown={(e) => { e.preventDefault(); onPick(item); }}>
                <span className="rich-editor-mention-label">{item.label}</span>
                {item.group && <span className="rich-editor-mention-group">{item.group}</span>}
            </button>
        ))}
    </div>,
    document.body,
);

// --- Menu « Image » : depuis l'ordinateur, ou depuis une adresse web (spec_journal.md partie IV, I-6) ---
// L'image d'une adresse n'est pas copiée : elle s'affiche depuis son site (rien n'est envoyé au serveur).
const ImageMenu = ({ anchor, onClose, onFile, onUrl }) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState(null);
    const submit = () => {
        const value = url.trim();
        if (!/^https?:\/\/\S+$/i.test(value)) { setError('Adresse invalide : elle doit commencer par https://'); return; }
        onUrl(value);
    };
    return (
        <Popover anchor={anchor} onClose={onClose}>
            <div className="rich-editor-image-menu">
                <button type="button" className="vtt-btn" onClick={onFile}><ImageIcon /> Depuis l'ordinateur…</button>
                <p className="rich-editor-image-menu-hint">ou une adresse web (Discord, Imgur…) : l'image n'est pas copiée, elle s'affiche depuis son site</p>
                <div className="rich-editor-image-menu-row">
                    <input type="url" className="vtt-input" value={url} placeholder="https://…" autoFocus
                           onChange={e => { setUrl(e.target.value); setError(null); }}
                           onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }} />
                    <button type="button" className="vtt-btn vtt-btn-primary" onClick={submit}>Insérer</button>
                </div>
                {error && <p className="rich-editor-image-menu-error">{error}</p>}
            </div>
        </Popover>
    );
};

// --- Réduction des images à l'insertion (spec_journal.md §2.3) ---
// Plus grand côté ramené à 1600 px, format d'origine gardé ; GIF gardés tels quels (animation).
// Réduction partagée avec le tableau : ui/tools/imageResize.js
const MAX_GIF_SIZE   = 5 * 1024 * 1024;

const RichTextEditor = ({
                            content = '',
                            onUpdate,
                            onBlur,
                            editable = true,
                            placeholder = 'Écrivez ici...',
                            maxImageSize = 20 * 1024 * 1024,
                            className = '',
                            // 'bubble'    : mise en forme au menu de sélection, barre du bas réduite à l'image (défaut) ;
                            // 'full'      : barre d'outils complète en haut, pas de menu de sélection ;
                            // 'selection' : menu de sélection seul, sans barre (petite place : fenêtre flottante)
                            toolbar = 'bubble',
                            // Écriture à plusieurs (Yjs) : { doc, awareness, user: { name, color }, seedHtml?, onSeeded? }.
                            // Le contenu vient alors du document partagé (content ignoré) ; seedHtml, s'il est
                            // donné, y est chargé une fois (entrée sans état partagé), puis onSeeded().
                            // onUpdate(html, { remote }) : remote = changement venu d'un autre éditeur.
                            collaboration = null,
                            // Liens « @ » vers d'autres entrées : { items(query) → [{ id, label, group? }],
                            // exists(id) → bool (lien barré sinon), open(id) (clic sur un lien) }
                            mentions = null,
                        }) => {
    const [alertMessage, setAlertMessage] = useState(null);
    const collabDoc = collaboration?.doc ?? null;
    const mentionsRef = useRef(mentions);
    useEffect(() => { mentionsRef.current = mentions; }, [mentions]);
    const [mentionMenu, setMentionMenu] = useState(null);   // { items, rect, index, command }
    const mentionMenuRef = useRef(null);
    useEffect(() => { mentionMenuRef.current = mentionMenu; }, [mentionMenu]);
    // Images : agrandissement (toutes les images de la note), menu « Image », préparation, dépôt
    const [lightbox, setLightbox] = useState(null);         // { images: [{ src, caption }], index }
    const [imageMenuAnchor, setImageMenuAnchor] = useState(null);
    const [preparing, setPreparing] = useState(0);          // images en cours de réduction
    const [dragging, setDragging] = useState(false);        // fichier survolant l'éditeur
    const openImageRef = useRef(null);
    // Convertir du texte brut en HTML basique (rétrocompatibilité)
    const normalizeContent = (raw) => {
        if (!raw) return '';
        if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
        return raw.split('\n').map(line => `<p>${line || '<br>'}</p>`).join('');
    };


    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                // L'annulation vient du document partagé en écriture à plusieurs
                ...(collabDoc ? { undoRedo: false } : {}),
            }),
            ...(collabDoc ? [
                Collaboration.configure({ document: collabDoc }),
                CollaborationCaret.configure({ provider: { awareness: collaboration.awareness }, user: collaboration.user, render: renderCaret }),
            ] : []),
            Underline,
            Highlight.configure({
                multicolor: false,
            }),
            // Image sans cadre : taille, placement avec texte autour, légende, agrandissement (partie IV)
            FigureImage.configure({ onOpen: (src) => openImageRef.current?.(src) }),
            Placeholder.configure({
                placeholder,
            }),
            // Lecture du Markdown collé (insertContent … contentType 'markdown')
            Markdown,
            ...(mentions ? [linkMention(() => mentionsRef.current).configure({
                HTMLAttributes: { class: 'rich-editor-mention' },
                renderText: ({ node }) => `@${node.attrs.label ?? ''}`,
                suggestion: {
                    char: '@',
                    items: ({ query }) => mentionsRef.current?.items(query) ?? [],
                    render: () => ({
                        onStart: (p) => setMentionMenu({ items: p.items, rect: p.clientRect?.(), index: 0, command: p.command }),
                        onUpdate: (p) => setMentionMenu({ items: p.items, rect: p.clientRect?.(), index: 0, command: p.command }),
                        onKeyDown: ({ event }) => {
                            const menu = mentionMenuRef.current;
                            if (!menu) return false;
                            if (event.key === 'Escape') { setMentionMenu(null); return true; }
                            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                                const n = Math.max(1, menu.items.length);
                                setMentionMenu({ ...menu, index: (menu.index + (event.key === 'ArrowDown' ? 1 : -1) + n) % n });
                                return true;
                            }
                            if ((event.key === 'Enter' || event.key === 'Tab') && menu.items[menu.index]) {
                                const item = menu.items[menu.index];
                                menu.command({ id: item.id, label: item.label });
                                return true;
                            }
                            return false;
                        },
                        onExit: () => setMentionMenu(null),
                    }),
                },
            })] : []),
        ],
        content: collabDoc ? undefined : normalizeContent(content),
        editable,
        // Barre du haut : l'état actif des boutons suit la sélection (TipTap 3 ne re-rend plus par défaut)
        shouldRerenderOnTransaction: toolbar === 'full',
        onUpdate: ({ editor, transaction }) => {
            if (!onUpdate) return;
            const remote = !!transaction.getMeta(ySyncPluginKey)?.isChangeOrigin;
            onUpdate(editor.getHTML(), { remote });
        },
        onBlur: () => {
            if (onBlur) onBlur();
        },
        editorProps: {
            handleDrop: (view, event) => {
                if (!editable) return false;
                const files = event.dataTransfer?.files;
                if (files && files.length > 0) {
                    const imageFile = Array.from(files).find(f => f.type.startsWith('image/'));
                    if (imageFile) {
                        event.preventDefault();
                        processImage(imageFile);
                        return true;
                    }
                }
                return false;
            },
            handlePaste: (view, event) => {
                if (!editable) return false;
                const items = event.clipboardData?.items;
                if (items) {
                    for (const item of items) {
                        if (item.type.startsWith('image/')) {
                            event.preventDefault();
                            processImage(item.getAsFile());
                            return true;
                        }
                    }
                }
                // Texte brut écrit en Markdown (chat IA, Obsidian) : collé mis en forme (spec_journal.md R-22).
                // Un collage qui porte du HTML (page web, traitement de texte) garde le chemin normal.
                const data = event.clipboardData;
                const text = data?.getData('text/plain');
                if (text && !data.getData('text/html') && looksLikeMarkdown(text)) {
                    event.preventDefault();
                    editor?.commands.insertContent(text, { contentType: 'markdown' });
                    return true;
                }
                return false;
            },
            handleDOMEvents: {
                // Clic sur un lien « @ » : ouvre l'entrée citée (sauf lien barré)
                click: (view, event) => {
                    const link = event.target.closest?.('.rich-editor-mention');
                    const open = mentionsRef.current?.open;
                    if (!link || !open || link.classList.contains('is-missing')) return false;
                    event.preventDefault();
                    open(link.dataset.id);
                    return true;
                },
            },
        },
    }, [collabDoc]);

    // Écriture à plusieurs : entrée sans état partagé, son HTML y est chargé une fois.
    // Sans émettre de mise à jour (pas un enregistrement) ; Yjs propage la modification.
    const seedHtml = collaboration?.seedHtml;
    const onSeeded = collaboration?.onSeeded;
    useEffect(() => {
        if (!editor || !collabDoc || seedHtml == null) return;
        if (editor.isEmpty) editor.commands.setContent(normalizeContent(seedHtml), { emitUpdate: false });
        onSeeded?.();
    }, [editor, collabDoc, seedHtml, onSeeded]);

    const processImage = useCallback(async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const limit = file.type === 'image/gif' ? MAX_GIF_SIZE : maxImageSize;
        if (file.size > limit) {
            setAlertMessage(`Image trop volumineuse (max ${Math.round(limit / 1024 / 1024)} Mo)`);
            return;
        }
        // Une grosse photo met un moment à être réduite : « Préparation de l'image… » (I-4)
        setPreparing(n => n + 1);
        try {
            const { dataUrl: src } = await resizeImage(file);
            editor?.chain().focus().setImage({ src }).run();
        } catch (error) {
            console.error('[RichTextEditor] Error reading image:', error);
            setAlertMessage('L\'image n\'a pas pu être lue');
        } finally {
            setPreparing(n => n - 1);
        }
    }, [editor, maxImageSize]);

    // Agrandissement : toutes les images de la note, en commençant par celle choisie
    useEffect(() => {
        openImageRef.current = (src) => {
            if (!editor) return;
            const images = [];
            editor.state.doc.descendants(node => {
                if (node.type.name === 'image' && node.attrs.src) images.push({ src: node.attrs.src, caption: node.attrs.caption });
            });
            setLightbox({ images, index: Math.max(0, images.findIndex(i => i.src === src)) });
        };
    }, [editor]);

    // Fichier glissé au-dessus de l'éditeur : la zone de dépôt s'affiche
    const hasFiles = (e) => [...(e.dataTransfer?.types ?? [])].includes('Files');
    const dropHandlers = editable ? {
        onDragEnter: (e) => { if (hasFiles(e)) setDragging(true); },
        onDragOver: (e) => { if (hasFiles(e)) setDragging(true); },
        onDragLeave: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); },
        onDrop: () => setDragging(false),
    } : {};

    // Mettre à jour le contenu si la prop change (changement de note).
    // Sans émettre de mise à jour : un simple changement de note n'est pas une saisie
    // (sinon la note consultée serait renvoyée au serveur, spec_journal.md §2.2).
    // En écriture à plusieurs, le contenu vient du document partagé, jamais de la prop.
    useEffect(() => {
        if (editor && !collabDoc && content !== undefined) {
            const normalized = normalizeContent(content);
            const currentHTML = editor.getHTML();
            if (normalized !== currentHTML) {
                editor.commands.setContent(normalized, { emitUpdate: false });
            }
        }
    }, [editor, content, collabDoc]);

    // Liste des entrées changée (création, suppression) : les liens barrés sont recalculés
    useEffect(() => {
        if (editor && !editor.isDestroyed && mentions) editor.view.dispatch(editor.state.tr.setMeta(missingMentionKey, true));
    }, [editor, mentions]);

    // Mettre à jour editable
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    if (!editor) return null;

    const pickFile = () => {
        setImageMenuAnchor(null);
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) processImage(file);
        };
        input.click();
    };
    const insertFromUrl = (src) => {
        setImageMenuAnchor(null);
        editor.chain().focus().setImage({ src }).run();
    };
    // Bouton « Image » : ouvre le menu (ordinateur ou adresse web)
    const openImageMenu = (e) => setImageMenuAnchor(a => (a ? null : e.currentTarget));

    return (
        <div className={`rich-editor-wrapper ${editable ? '' : 'rich-editor-readonly'}${dragging ? ' is-dragging' : ''} ${className}`} {...dropHandlers}>
            {/* BubbleMenu — toolbar flottante sur sélection de texte */}
            {editable && (toolbar === 'bubble' || toolbar === 'selection') && (
                <BubbleMenu
                    editor={editor}
                    // Accroché à <body> : rendu dans une fenêtre flottante (conteneur de requêtes de
                    // taille, donc bloc conteneur des éléments fixes), le menu était décalé n'importe où
                    appendTo={() => document.body}
                    options={{ strategy: 'fixed', placement: 'top', flip: true, shift: { padding: 8 } }}
                    className="rich-editor-bubble"
                    shouldShow={({ editor, state }) => {
                        const { from, to } = state.selection;
                        if (from === to) return false;
                        const node = state.doc.nodeAt(from);
                        if (node?.type.name === 'image') return false;
                        return true;
                    }}
                >
                    <FormatButtons editor={editor} onImage={openImageMenu} />
                </BubbleMenu>
            )}

            {/* Barre d'outils complète en haut (toolbar 'full') */}
            {editable && toolbar === 'full' && (
                <div className="rich-editor-toolbar rich-editor-toolbar-top">
                    <FormatButtons editor={editor} onImage={openImageMenu} />
                    <span className="rich-editor-hint">{mentions ? '@ pour citer une entrée · ' : ''}Cliquez une image pour la régler · glissez une image dans la note</span>
                </div>
            )}

            {/* Contenu éditeur */}
            <EditorContent editor={editor} />

            {/* Toolbar fixe en bas */}
            {editable && toolbar === 'bubble' && (
                <div className="rich-editor-toolbar">
                    <button
                        type="button"
                        onClick={openImageMenu}
                        className="rich-editor-btn"
                        title="Ajouter une image"
                    >
                        <ImageIcon /> Image ▾
                    </button>
                    <span className="rich-editor-hint">
                        Sélectionnez du texte pour le mettre en forme • Cliquez une image pour la régler • Glissez une image dans la note
                    </span>
                </div>
            )}
            {/* Image : menu d'insertion, préparation, zone de dépôt, agrandissement */}
            {imageMenuAnchor && (
                <ImageMenu anchor={imageMenuAnchor} onClose={() => setImageMenuAnchor(null)} onFile={pickFile} onUrl={insertFromUrl} />
            )}
            {preparing > 0 && <div className="rich-editor-status" role="status"><span className="rich-editor-spinner" />Préparation de l'image…</div>}
            {dragging && <div className="rich-editor-drop">Déposer l'image ici</div>}
            {lightbox && <ImageLightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox(null)} />}
            {mentionMenu?.rect && (
                <MentionMenu menu={mentionMenu} onPick={(item) => mentionMenu.command({ id: item.id, label: item.label })} />
            )}
            {alertMessage && (
                <AlertModal
                    message={alertMessage}
                    onClose={() => setAlertMessage(null)}
                />
            )}
        </div>
    );
};

// Helper : extraire le texte brut du HTML pour les previews
export const stripHtml = (html) => {
    if (!html) return '';
    return html
        .replace(/<img[^>]*>/gi, '[image]')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
};

// Helper : source de la première image du HTML (aperçu des notifications)
export const firstImageSrc = (html) => html?.match(/<img[^>]+src="([^"]+)"/i)?.[1] ?? null;

export default RichTextEditor;
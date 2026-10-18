// components/shared/RichTextEditor.jsx - Éditeur rich text TipTap (Notion-like, v3)
import React, {useEffect, useCallback, useState} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

import './RichTextEditor.css';
import AlertModal from "../modals/AlertModal.jsx";

// --- Bouton toolbar ---
const ToolbarButton = ({ onClick, active, title, children }) => (
    <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
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

// --- Image : affichage toujours fidèle à la source ---
// L'extension Image (TipTap 3.22, redimensionnement activé) réutilise l'image déjà
// affichée quand le contenu change, sans mettre à jour sa source : au changement de
// note, l'image de la note précédente restait affichée (spec_journal.md §2.1).
// On force la reconstruction de l'affichage dès que la source change.
const SourceAwareImage = Image.extend({
    addNodeView() {
        const createView = this.parent?.();
        if (!createView) return null;
        return (props) => {
            const view = createView(props);
            const update = view.update.bind(view);
            view.update = (node, ...rest) =>
                node.attrs.src === view.node.attrs.src && update(node, ...rest);
            return view;
        };
    },
});

// --- Réduction des images à l'insertion (spec_journal.md §2.3) ---
// Plus grand côté ramené à 1600 px, format d'origine gardé ; GIF gardés tels quels (animation).
const MAX_IMAGE_SIDE = 1600;
const MAX_GIF_SIZE   = 5 * 1024 * 1024;
const KEPT_FORMATS   = ['image/jpeg', 'image/png', 'image/webp'];

const readAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const loadImage = (src) => new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = src;
});

const prepareImage = async (file) => {
    const src = await readAsDataUrl(file);
    if (file.type === 'image/gif') return src;
    const img   = await loadImage(src);
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1) return src;
    const canvas  = document.createElement('canvas');
    canvas.width  = Math.round(img.naturalWidth  * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(KEPT_FORMATS.includes(file.type) ? file.type : 'image/jpeg', 0.85);
};

const RichTextEditor = ({
                            content = '',
                            onUpdate,
                            onBlur,
                            editable = true,
                            placeholder = 'Écrivez ici...',
                            maxImageSize = 20 * 1024 * 1024,
                            className = '',
                            onImageDoubleClick = null,
                        }) => {
    const [alertMessage, setAlertMessage] = useState(null);
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
            }),
            Underline,
            Highlight.configure({
                multicolor: false,
            }),
            SourceAwareImage.configure({
                inline: false,
                allowBase64: true,
                resize: {
                    enabled: true,
                    minWidth: 50,
                    minHeight: 50,
                    directions: ['top', 'bottom', 'left', 'right'],
                    alwaysPreserveAspectRatio: true,
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: normalizeContent(content),
        editable,
        onUpdate: ({ editor }) => {
            if (onUpdate) onUpdate(editor.getHTML());
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
                return false;
            },
            handleDOMEvents: {
                dblclick: (view, event) => {
                    if (!onImageDoubleClick) return false;
                    const target = event.target;
                    // Remonter jusqu'à une img (peut venir d'un wrapper resize)
                    const img = target.closest
                        ? target.closest('[data-resize-container] img, img')
                        : (target.tagName === 'IMG' ? target : null);
                    if (img?.src) {
                        onImageDoubleClick(img.src);
                        return true; // consommé, ProseMirror ne traite pas
                    }
                    return false;
                },
            },
        },
    });

    const processImage = useCallback(async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        const limit = file.type === 'image/gif' ? MAX_GIF_SIZE : maxImageSize;
        if (file.size > limit) {
            setAlertMessage(`Image trop volumineuse (max ${Math.round(limit / 1024 / 1024)} Mo)`);
            return;
        }
        try {
            const src = await prepareImage(file);
            editor?.chain().focus().setImage({ src }).run();
        } catch (error) {
            console.error('[RichTextEditor] Error reading image:', error);
            setAlertMessage('L\'image n\'a pas pu être lue');
        }
    }, [editor, maxImageSize]);

    // Mettre à jour le contenu si la prop change (changement de note).
    // Sans émettre de mise à jour : un simple changement de note n'est pas une saisie
    // (sinon la note consultée serait renvoyée au serveur, spec_journal.md §2.2).
    useEffect(() => {
        if (editor && content !== undefined) {
            const normalized = normalizeContent(content);
            const currentHTML = editor.getHTML();
            if (normalized !== currentHTML) {
                editor.commands.setContent(normalized, { emitUpdate: false });
            }
        }
    }, [editor, content]);

    // Mettre à jour editable
    useEffect(() => {
        if (editor) {
            editor.setEditable(editable);
        }
    }, [editor, editable]);

    if (!editor) return null;

    const handleImageButton = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) processImage(file);
        };
        input.click();
    };

    return (
        <div className={`rich-editor-wrapper ${editable ? '' : 'rich-editor-readonly'} ${className}`}>
            {/* BubbleMenu — toolbar flottante sur sélection de texte */}
            {editable && (
                <BubbleMenu
                    editor={editor}
                    options={{ placement: 'top' }}
                    className="rich-editor-bubble"
                    shouldShow={({ editor, state }) => {
                        const { from, to } = state.selection;
                        if (from === to) return false;
                        const node = state.doc.nodeAt(from);
                        if (node?.type.name === 'image') return false;
                        return true;
                    }}
                >
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        active={editor.isActive('bold')}
                        title="Gras (Ctrl+B)"
                    >
                        <b>G</b>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        active={editor.isActive('italic')}
                        title="Italique (Ctrl+I)"
                    >
                        <i>I</i>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        active={editor.isActive('underline')}
                        title="Souligné (Ctrl+U)"
                    >
                        <u>S</u>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        active={editor.isActive('strike')}
                        title="Barré"
                    >
                        <s>B</s>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHighlight().run()}
                        active={editor.isActive('highlight')}
                        title="Surligné"
                    >
                        <mark>H</mark>
                    </ToolbarButton>

                    <Separator />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor.isActive('heading', { level: 2 })}
                        title="Titre H2"
                    >
                        H2
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        active={editor.isActive('heading', { level: 3 })}
                        title="Titre H3"
                    >
                        H3
                    </ToolbarButton>

                    <Separator />

                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        active={editor.isActive('bulletList')}
                        title="Liste à puces"
                    >
                        •≡
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        active={editor.isActive('orderedList')}
                        title="Liste numérotée"
                    >
                        1.
                    </ToolbarButton>

                    <Separator />

                    <ToolbarButton
                        onClick={handleImageButton}
                        title="Insérer une image"
                    >
                        <ImageIcon />
                    </ToolbarButton>
                </BubbleMenu>
            )}

            {/* Contenu éditeur */}
            <EditorContent editor={editor} />

            {/* Toolbar fixe en bas */}
            {editable && (
                <div className="rich-editor-toolbar">
                    <button
                        type="button"
                        onClick={handleImageButton}
                        className="rich-editor-btn"
                        title="Ajouter une image"
                    >
                        <ImageIcon /> Image
                    </button>
                    <span className="rich-editor-hint">
                        Sélectionnez du texte pour formater • Glissez-déposez des images • Redimensionnez par les bords
                    </span>
                </div>
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
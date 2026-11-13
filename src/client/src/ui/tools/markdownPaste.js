// ui/tools/markdownPaste.js
// Reconnaître un texte collé écrit en Markdown (réponse d'un chat IA, note Obsidian) pour le
// mettre en forme au collage (RichTextEditor, spec_journal.md R-22). Fonction pure.

const BLOCK = /^(#{1,6} |[-*+] |\d+[.)] |> |```)/m;
const INLINE = /(\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|==[^=\n]+==|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/;

/** Le texte ressemble à du Markdown (un bloc ou une marque reconnus). */
export const looksLikeMarkdown = (text) => typeof text === 'string' && text.trim() !== '' && (BLOCK.test(text) || INLINE.test(text));

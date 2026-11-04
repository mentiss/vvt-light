// src/client/src/tools/imageResize.js
// ─────────────────────────────────────────────────────────────────────────────
// Réduction d'une image dans le navigateur avant envoi, partagée par le journal
// (RichTextEditor, spec_journal.md §2.3) et le tableau (spec_tableau.md §10.8, P-8).
// Plus grand côté ramené à maxSide, format d'origine gardé (JPEG pour les autres),
// recompression 0,85 ; GIF gardé tel quel (animation).
// ─────────────────────────────────────────────────────────────────────────────

const KEPT_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

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

/**
 * @param {File} file
 * @param {{ maxSide?: number }} [options]
 * @returns {Promise<{ dataUrl: string, width: number, height: number }>}
 */
export async function resizeImage(file, { maxSide = 1600 } = {}) {
    const src = await readAsDataUrl(file);
    const img = await loadImage(src);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const scale = Math.min(1, maxSide / Math.max(width, height));
    if (file.type === 'image/gif' || scale === 1) return { dataUrl: src, width, height };

    const canvas  = document.createElement('canvas');
    canvas.width  = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL(KEPT_FORMATS.includes(file.type) ? file.type : 'image/jpeg', 0.85);
    return { dataUrl, width: canvas.width, height: canvas.height };
}

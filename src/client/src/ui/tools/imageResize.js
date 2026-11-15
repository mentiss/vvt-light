// src/client/src/ui/tools/imageResize.js
// ─────────────────────────────────────────────────────────────────────────────
// Réduction d'une image dans le navigateur avant envoi, partagée par le journal
// (RichTextEditor, spec_journal.md §2.3) et le tableau (spec_tableau.md §10.8, P-8).
// Plus grand côté ramené à maxSide, format d'origine gardé (JPEG pour les autres),
// recompression 0,85 ; GIF gardé tel quel (animation). Un PNG de plus de 1 Mo après
// réduction passe en WebP (un PNG ne se recompresse pas).
// ─────────────────────────────────────────────────────────────────────────────

const KEPT_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const PNG_MAX_BYTES = 1024 * 1024;   // au-delà, un PNG réduit est réencodé en WebP

/** Poids d'une adresse data: en base64, en octets */
const dataUrlBytes = (dataUrl) => Math.floor((dataUrl.length - dataUrl.indexOf(',') - 1) * 3 / 4);

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
    const heavyPng = file.type === 'image/png' && file.size > PNG_MAX_BYTES;   // à réencoder, même sans réduction
    if (file.type === 'image/gif' || (scale === 1 && !heavyPng)) return { dataUrl: src, width, height };

    const canvas  = document.createElement('canvas');
    canvas.width  = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    let dataUrl = canvas.toDataURL(KEPT_FORMATS.includes(file.type) ? file.type : 'image/jpeg', 0.85);
    // Un PNG ne se recompresse pas : trop lourd après réduction, il passe en WebP plutôt
    // que d'être refusé à l'envoi (spec_tableau.md Q-28, Q-T14)
    if (file.type === 'image/png' && dataUrlBytes(dataUrl) > PNG_MAX_BYTES) dataUrl = canvas.toDataURL('image/webp', 0.85);
    return { dataUrl, width: canvas.width, height: canvas.height };
}

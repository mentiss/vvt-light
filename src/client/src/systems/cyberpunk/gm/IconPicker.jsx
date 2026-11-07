// src/client/src/systems/cyberpunk/gm/IconPicker.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Sélecteur d'icône des horloges et menaces (spec_cyberpunk.md §6, Q-6) :
// jeu d'icônes dessinées (valeur « cp:<nom> », CpIcon) ou image envoyée (data-URL
// 64×64). Les anciens emojis enregistrés restent affichés tels quels.
// Props :
//   value    : string (cp:<nom>, data:image/…, ou ancien emoji)
//   onChange : (newValue: string) => void
//   presets  : string[] optionnel (noms d'icônes CpIcon)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import AlertModal from "../../../components/modals/AlertModal.jsx";
import CpIcon from '../components/ui/CpIcon.jsx';

const DEFAULT_THREAT_PRESETS = ['threat', 'corp', 'gang', 'ai', 'person', 'place', 'skull', 'eye', 'gun', 'dna', 'bomb', 'fire', 'bolt', 'drop', 'city', 'mask'];
const DEFAULT_CLOCK_PRESETS  = ['clock', 'hourglass', 'bell', 'signal', 'gear', 'lock', 'target', 'chart', 'bomb', 'fire', 'wave', 'bolt', 'eye', 'threat'];

const ICON_PREFIX = 'cp:';
export const iconValue = (name) => `${ICON_PREFIX}${name}`;

// Redimensionne côté navigateur à 64×64 avant encodage
function resizeToBase64(file, size = 64) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width  = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                // Recadrage carré centré
                const min = Math.min(img.width, img.height);
                ctx.drawImage(img, (img.width - min) / 2, (img.height - min) / 2, min, min, 0, 0, size, size);
                resolve(canvas.toDataURL('image/webp', 0.85));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

/** Affiche une icône enregistrée : dessinée, image, ou ancien emoji. */
const IconPreview = ({ value, size = 'md' }) => {
    if (value?.startsWith('data:image/')) {
        return <img src={value} alt="" className={`cp-icon-img is-${size}`} />;
    }
    if (value?.startsWith(ICON_PREFIX)) {
        return <CpIcon name={value.slice(ICON_PREFIX.length)} size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'} />;
    }
    return value ? <span className={`cp-icon-emoji is-${size}`}>{value}</span> : null;
};

export { IconPreview };

const IconPicker = ({ value, onChange, presets, label = 'Icône' }) => {
    const fileRef = useRef(null);
    const list    = presets ?? DEFAULT_THREAT_PRESETS;
    const isImage = value?.startsWith('data:image/');
    const [alertMsg, setAlertMsg] = useState(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setAlertMsg('Image trop lourde (2 Mo au plus avant redimensionnement).');
            return;
        }
        try {
            onChange(await resizeToBase64(file));
        } catch {
            setAlertMsg("Impossible de lire l'image.");
        }
        e.target.value = '';   // permet de choisir à nouveau le même fichier
    };

    return (
        <>
            {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg(null)} />}
            <div className="cp-field">
                <span className="cp-field-label">{label}</span>
                <div className="cp-iconpick">
                    <span className="cp-iconpick-current"><IconPreview value={value} size="lg" /></span>
                    {list.map(name => (
                        <button key={name} type="button" onClick={() => onChange(iconValue(name))}
                                className={`cp-iconpick-item ${value === iconValue(name) ? 'is-on' : ''}`} title={name}>
                            <CpIcon name={name} />
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    <button type="button" onClick={() => fileRef.current?.click()} className="cp-btn is-ghost is-sm">
                        Importer une image (PNG, JPEG, WebP, réduite à 64×64)
                    </button>
                    {isImage && (
                        <button type="button" onClick={() => onChange(iconValue(list[0]))} className="cp-btn is-ghost is-sm">
                            Retirer l'image
                        </button>
                    )}
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile} />
            </div>
        </>
    );
};

export { DEFAULT_CLOCK_PRESETS, DEFAULT_THREAT_PRESETS };
export default IconPicker;

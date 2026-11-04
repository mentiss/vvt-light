// src/client/src/components/ui/CopyAccessButton.jsx
// Bouton générique — copie dans le presse-papier les accès d'un personnage
// (jeu, nom, lien, code), au format d'un message Discord.
//
// Contrat :
//   character — personnage ({ prenom?, nom?, accessUrl, accessCode })
//   name?     — nom affiché, si le slug le compose autrement que « prénom nom »
//   label?    — texte du bouton (défaut « Copier les accès »)
//   icon?     — icône du slug, placée avant le texte
//   className — classes ajoutées à .vtt-btn (ex. vtt-btn-sm)
//
// Le slug et le nom du jeu viennent de useSystem() ; l'habillage, de .vtt-btn
// dans le theme.css du slug.

import React, { useEffect, useState } from 'react';
import { useSystem } from '../../hooks/useSystem.js';

const FEEDBACK_MS = 2000;

/** Message copié : jeu en gras, lien, code en chasse fixe (rendu Discord). */
const buildAccessMessage = ({ label, slug, character, name }) => {
    const displayName = name || [character.prenom, character.nom].filter(Boolean).join(' ') || 'Sans nom';
    return [
        `**${label ?? slug}** — ${displayName}`,
        `Lien : ${window.location.origin}/${slug}/${character.accessUrl}`,
        `Code : \`${character.accessCode}\``,
    ].join('\n');
};

const CopyAccessButton = ({ character, name, label = 'Copier les accès', icon, className = '' }) => {
    const { slug, label: systemLabel } = useSystem();
    const [status, setStatus] = useState(null);   // null | 'copied' | 'failed'

    // Le retour visuel s'efface seul
    useEffect(() => {
        if (!status) return undefined;
        const timer = setTimeout(() => setStatus(null), FEEDBACK_MS);
        return () => clearTimeout(timer);
    }, [status]);

    if (!character?.accessUrl || !character?.accessCode) return null;

    const copy = () => {
        const text = buildAccessMessage({ label: systemLabel, slug, character, name });
        // navigator.clipboard n'existe qu'en contexte sûr (HTTPS ou localhost)
        const write = navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject(new Error('clipboard'));
        write
            .then(() => setStatus('copied'))
            .catch(() => setStatus('failed'));
    };

    return (
        <button type="button" onClick={copy} className={`vtt-btn ${className}`.trim()} title="Copier le lien et le code d'accès">
            {icon}
            {status === 'copied' ? 'Copié !' : status === 'failed' ? 'Copie impossible' : label}
        </button>
    );
};

export default CopyAccessButton;

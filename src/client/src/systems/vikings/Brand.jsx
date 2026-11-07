// src/client/src/systems/vikings/Brand.jsx
// Marque Pure Vikings (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
// Le titre (pages d'accès, d'erreur, de chargement du slug) pose l'habillage choisi
// par le joueur (spec_vikings_pierre_peinte.md C-9) ; la carte de l'accueil, non.
import React from 'react';
import './Brand.css';
import { useVkLookOnRoot } from './hooks/useVkLook.js';

const BrandTitle = () => {
    useVkLookOnRoot();
    return (
        <span className="vk-brand is-title">
            <span className="vk-brand-runes">ᚢᛁᚲᛁᛜ</span>
            <span className="vk-brand-title">Pure Vikings</span>
        </span>
    );
};

const Brand = ({ variant }) => {
    if (variant === 'title') return <BrandTitle />;
    return (
        <span className="vk-brand">
            <span className="vk-brand-c" />
            <span className="vk-brand-runes">ᛈᚢᚱᛖ ᛊᚨᚷᚨ</span>
            <span className="vk-brand-title">Pure Vikings</span>
            <span className="vk-brand-sub">Les sagas du Nord</span>
        </span>
    );
};

export default Brand;

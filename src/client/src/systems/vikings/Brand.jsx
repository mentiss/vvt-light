// src/client/src/systems/vikings/Brand.jsx
// Marque Pure Vikings (spec_plateforme_accueil.md §5) : carte de l'accueil ou titre.
import React from 'react';
import './Brand.css';

const Brand = ({ variant }) => {
    if (variant === 'title') {
        return (
            <span className="vk-brand is-title">
                <span className="vk-brand-runes">ᚢᛁᚲᛁᛜ</span>
                <span className="vk-brand-title">Pure Vikings</span>
            </span>
        );
    }
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

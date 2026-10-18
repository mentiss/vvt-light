// src/client/src/components/platform/SystemBrand.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Marque d'un slug (spec_plateforme_accueil.md §5) : systems/:slug/Brand.jsx,
// facultatif, découvert automatiquement (aucun registre). Chargé à la demande :
// l'accueil ne charge pas le config.jsx ni le theme.css des slugs.
//
// Contrat de Brand.jsx : ({ variant: 'card' | 'title', slug, label })
//   - card  : intérieur de la carte de sélection (le cadre, le clic et le lien MJ
//             sont génériques, dans SystemCard) ;
//   - title : titre des pages d'accès du slug, taille relative à son conteneur.
// Sans Brand.jsx : carte par défaut (initiale + nom) ou titre par défaut (nom).
// ─────────────────────────────────────────────────────────────────────────────

import React, { Suspense } from 'react';

const BRANDS = import.meta.glob('../../systems/*/Brand.jsx');

// React.lazy hors des composants (pattern lazyCache)
const lazyCache = {};
const getBrand = (slug) => {
    const key = `../../systems/${slug}/Brand.jsx`;
    if (!BRANDS[key]) return null;
    if (!lazyCache[key]) lazyCache[key] = React.lazy(BRANDS[key]);
    return lazyCache[key];
};

export const DefaultBrand = ({ variant, slug, label }) => {
    const name = label || slug;
    if (variant === 'title') return <span className="vtt-system-default-title">{name}</span>;
    return (
        <span className="vtt-system-default">
            <span className="vtt-system-monogram">{name?.charAt(0).toUpperCase()}</span>
            <span className="vtt-system-default-label">{name}</span>
        </span>
    );
};

const SystemBrand = ({ variant = 'card', slug, label }) => {
    const Brand = getBrand(slug);
    if (!Brand) return <DefaultBrand variant={variant} slug={slug} label={label} />;
    return (
        <Suspense fallback={<DefaultBrand variant={variant} slug={slug} label={label} />}>
            {/* eslint-disable-next-line react-hooks/static-components */}
            <Brand variant={variant} slug={slug} label={label} />
        </Suspense>
    );
};

export default SystemBrand;

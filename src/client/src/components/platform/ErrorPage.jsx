// src/client/src/components/platform/ErrorPage.jsx
// Page d'erreur générique (spec_plateforme_accueil.md §6 bis) : code, titre,
// message, actions. Hors slug : enveloppe et thème de la plateforme. Dans un
// slug (slug fourni) : thème du slug déjà chargé et sa marque en mode titre.
//
// Props : code?, title, message?, slug?, label?, actions? (nœuds React ; par
// défaut, retour au slug s'il est fourni, puis accueil de la plateforme).

import React from 'react';
import { useParams, useRouteError } from 'react-router-dom';
import { useSystems } from '../../context/SystemsContext.jsx';
import SystemBrand from './SystemBrand.jsx';
import SlugPage from './SlugPage.jsx';

const ErrorPage = ({ code, title, message, slug, label, actions }) => {
    const defaultActions = (
        <>
            {slug && <a href={`/${slug}/`} className="vtt-btn vtt-btn-primary">Retour à {label || slug}</a>}
            <a href="/" className={`vtt-btn ${slug ? '' : 'vtt-btn-primary'}`}>Accueil de la plateforme</a>
        </>
    );

    const content = (
        <div className="vtt-panel w-full max-w-md p-6 text-center">
            {slug && (
                <div className="text-xl mb-4">
                    <SystemBrand variant="title" slug={slug} label={label} />
                </div>
            )}
            {code && <div className="vtt-error-code">{code}</div>}
            <div className="vtt-error-title">{title}</div>
            {message && <p className="text-sm text-muted mb-6">{message}</p>}
            <div className="flex flex-wrap justify-center gap-2">
                {actions ?? defaultActions}
            </div>
        </div>
    );

    return slug ? (
        <SlugPage>{content}</SlugPage>
    ) : (
        <div className="vtt-platform flex items-center justify-center p-4">{content}</div>
    );
};

// Adresse inconnue à l'intérieur d'un slug connu (route « tout le reste »)
export const SlugNotFound = () => {
    const { system } = useParams();
    const label = useSystems().systems?.find(s => s.slug === system)?.label;
    return (
        <ErrorPage
            code="404"
            title="Page introuvable"
            message={`Cette page n'existe pas dans ${label || system}.`}
            slug={system}
            label={label}
        />
    );
};

// Plantage d'une page (gestion d'erreur du routeur) : thème de la plateforme
export const RouteErrorPage = () => {
    const error = useRouteError();
    console.error('[RouteErrorPage]', error);
    return (
        <ErrorPage
            title="Une erreur est survenue"
            message="La page n'a pas pu s'afficher. Rechargez-la ; si le problème continue, prévenez le MJ."
            actions={
                <>
                    <button type="button" className="vtt-btn vtt-btn-primary" onClick={() => window.location.reload()}>Recharger</button>
                    <a href="/" className="vtt-btn">Accueil de la plateforme</a>
                </>
            }
        />
    );
};

export default ErrorPage;

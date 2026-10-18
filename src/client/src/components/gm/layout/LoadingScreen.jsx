// Écran de chargement d'un slug : thème du slug et sa marque en mode titre.
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSystems } from '../../../context/SystemsContext.jsx';
import SystemBrand from '../../platform/SystemBrand.jsx';
import SlugPage from '../../platform/SlugPage.jsx';

const LoadingScreen = () => {
    const { system } = useParams();
    const label = useSystems()?.systems?.find(s => s.slug === system)?.label;
    return (
        <SlugPage>
            <div className="flex flex-col items-center gap-3">
                {system && <div className="text-2xl"><SystemBrand variant="title" slug={system} label={label} /></div>}
                <div className="text-muted animate-pulse">Chargement…</div>
            </div>
        </SlugPage>
    );
};

export default LoadingScreen;

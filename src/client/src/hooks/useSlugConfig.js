import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSystem } from './useSystem.js';

// Config front du slug de l'adresse ; null hors slug (accueil) : rien n'est chargé.
const useSlugConfig = () => {
    const { system } = useParams();
    const { slug } = useSystem();
    const [slugConfig, setSlugConfig] = useState(null);

    useEffect(() => {
        if (!system) return;
        import(`../systems/${slug}/config.jsx`)
            .then(mod => setSlugConfig(mod.default))
            .catch(() => setSlugConfig(null));
    }, [system, slug]);

    return slugConfig;
};

export default useSlugConfig;

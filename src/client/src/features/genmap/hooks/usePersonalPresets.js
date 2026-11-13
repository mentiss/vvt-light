// src/client/src/features/genmap/hooks/usePersonalPresets.js
// Presets personnels du générateur de plans, gardés dans ce navigateur (spec_genmap.md §41, P-1 ;
// stockage par la plateforme, spec_browser_storage.md). Rien n'est stocké côté serveur.

import { useCallback } from 'react';
import { usePersistedState } from '@/app/hooks/usePersistedState.js';
import { PLATFORM_SCOPE } from '@/app/tools/browserStorage.js';

const OPTIONS = { defaults: { presets: [] }, validate: (v) => Array.isArray(v?.presets) };

/** @returns {{ presets: object[], save: (preset) => void, remove: (id) => void }} */
export const usePersonalPresets = () => {
    const [stored, setStored] = usePersistedState(PLATFORM_SCOPE, 'genmap-presets', OPTIONS);
    // Ajoute ou remplace (même id)
    const save = useCallback((preset) => setStored(prev => ({
        presets: [...prev.presets.filter(p => p.id !== preset.id), preset],
    })), [setStored]);
    const remove = useCallback((id) => setStored(prev => ({ presets: prev.presets.filter(p => p.id !== id) })), [setStored]);
    return { presets: stored.presets, save, remove };
};

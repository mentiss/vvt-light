// src/client/src/app/hooks/usePersistedState.js
// ─────────────────────────────────────────────────────────────────────────────
// État qui survit au rechargement, gardé dans ce navigateur
// (documentations/spec_browser_storage.md §4). S'utilise comme useState :
//
//   const [audio, setAudio] = usePersistedState('platform', 'audio', { defaults: AUDIO_DEFAULTS });
//   setAudio(prev => ({ ...prev, panelOpen: true }));
//
// Tous les composants qui lisent la même clé sont mis à jour, dans cette page et
// dans les autres onglets (événement « storage »), par useSyncExternalStore.
// Les options (defaults, version, migrate, validate) doivent être des valeurs
// stables : constantes du module, ou mémorisées.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { parseStored, readRaw, storageKey, subscribeStored, writeStored } from '../tools/browserStorage.js';

/**
 * @param {string} scope  portée : 'platform', '<slug>' ou tableScope(slug, table)
 * @param {string} name   fonction : 'audio', 'dice'…
 * @param {object} [options] voir parseStored (app/tools/browserStorage.js)
 * @returns {[*, Function]} valeur, et mise à jour (valeur ou fonction de la précédente)
 */
export function usePersistedState(scope, name, { defaults = null, version = 1, migrate, validate } = {}) {
    const key = storageKey(scope, name);

    const subscribe = useCallback((onChange) => {
        const unsubscribe = subscribeStored(key, onChange);
        // Autre onglet : e.key nul quand tout le stockage est effacé
        const onStorage = (e) => { if (e.key === key || e.key === null) onChange(); };
        window.addEventListener('storage', onStorage);
        return () => {
            unsubscribe();
            window.removeEventListener('storage', onStorage);
        };
    }, [key]);

    // Le texte enregistré sert d'instantané : une chaîne, donc comparée par valeur
    const getSnapshot = useCallback(() => readRaw(key), [key]);
    const raw = useSyncExternalStore(subscribe, getSnapshot);

    const value = useMemo(
        () => parseStored(raw, { defaults, version, migrate, validate }),
        [raw, defaults, version, migrate, validate],
    );

    const setValue = useCallback((next) => {
        const current = parseStored(readRaw(key), { defaults, version, migrate, validate });
        writeStored(key, typeof next === 'function' ? next(current) : next, { version });
    }, [key, defaults, version, migrate, validate]);

    return [value, setValue];
}

// src/client/src/systems/cyberpunk/hooks/useCpAmbience.js
// ─────────────────────────────────────────────────────────────────────────────
// Réglage d'ambiance propre à chaque navigateur (spec_cyberpunk.md §3.1) :
// couper les animations du monde derrière l'interface (pluie, brouillard, enseignes).
// La météo elle-même sera choisie par le MJ pour la table (lot 4).
// ─────────────────────────────────────────────────────────────────────────────

import { usePersistedState } from '../../../hooks/usePersistedState.js';

const AMBIENCE_OPTIONS = {
    defaults: { animations: true },
    validate: (v) => v !== null && typeof v === 'object' && typeof v.animations === 'boolean',
};

/** @returns {[{animations: boolean}, Function]} */
export const useCpAmbience = () => usePersistedState('cyberpunk', 'ambience', AMBIENCE_OPTIONS);

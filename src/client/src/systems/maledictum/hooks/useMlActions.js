// src/client/src/systems/maledictum/hooks/useMlActions.js
// ─────────────────────────────────────────────────────────────────────────────
// Actions de jeu d'une fiche, partagées par la fiche joueur et la fiche ouverte
// par le MJ : chaque action calcule son envoi partiel (config/rules/actions.js)
// et l'enregistre tout de suite par `patch` (usePlayerPatch côté joueur,
// patchCharacter côté MJ). Les fenêtres de la fiche passent par `ask`.
//
// const act = useMlActions({ character, patch, ask });
// act.run(fn, ...args) : fn(character, ...args) → patch (null : rien à faire)
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import * as A from '../config/rules/actions.js';

export const useMlActions = ({ character, patch, ask }) => useMemo(() => {
    const run = (fn, ...args) => {
        const p = fn(character, ...args);
        if (p) patch(p);
        return p;
    };
    return {
        run, patch, ask: ask ?? (() => {}),
        setWounds: (v) => run(A.setWounds, v),
        cycleCondition: (key, two) => run(A.cycleCondition, key, two),
        spendFate: () => run(A.spendFate),
        burnFate: () => run(A.burnFate),
        setCorruption: (v) => run(A.setCorruption, v),
        setWarpCharge: (v) => run(A.setWarpCharge, v),
        setInfluence: (faction, v) => run(A.setInfluence, faction, v),
        toggleEquipped: (id) => run(A.toggleEquipped, id),
        addItems: (rows) => run(A.addItems, rows),
        removeItem: (id) => run(A.removeItem, id),
        setQuantity: (id, q) => run(A.setQuantity, id, q),
        toggleCriticalTreated: (id) => run(A.toggleCriticalTreated, id),
        removeCritical: (id) => run(A.removeCritical, id),
        addCritical: (data) => run(A.addCritical, data),
        addListEntry: (field, text) => run(A.addListEntry, field, text),
        removeListEntry: (field, i) => run(A.removeListEntry, field, i),
        addContact: (contact) => run(A.addContact, contact),
        updateContact: (id, p) => run(A.updateContact, id, p),
        removeContact: (id) => run(A.removeContact, id),
    };
}, [character, patch, ask]);

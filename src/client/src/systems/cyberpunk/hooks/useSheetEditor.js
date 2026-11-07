// src/client/src/systems/cyberpunk/hooks/useSheetEditor.js
// ─────────────────────────────────────────────────────────────────────────────
// État et écritures d'une fiche (spec_cyberpunk.md §4), partagés par la fiche du
// joueur (Sheet) et la vue MJ du personnage (GMCharacterView) : mode Édition,
// enregistrement, ressources, tags, console de manœuvres, directives.
//
// onCharacterUpdate(fiche) enregistre la fiche entière (PUT). Hors mode Édition,
// chaque action de jeu (tag, jeton, console…) est enregistrée aussitôt ; en mode
// Édition, les changements attendent « Sauvegarder ».
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from 'react';

const TAG_FIELD = { character: 'tags', cyberware: 'cyberware', relation: 'relations', item: 'items' };

/** Applique une transformation aux tags d'une entité de la fiche. */
const withTags = (fiche, entityType, entityId, change) => {
    const field = TAG_FIELD[entityType];
    if (!field) return fiche;
    if (entityType === 'character') return { ...fiche, tags: change(fiche.tags ?? []) };
    return { ...fiche, [field]: (fiche[field] ?? []).map(e => (e.id === entityId ? { ...e, tags: change(e.tags ?? []) } : e)) };
};

export const useSheetEditor = (character, onCharacterUpdate) => {
    const [editMode, setEditMode] = useState(false);
    const [editableChar, setEditableChar] = useState(character);

    // Hors édition, la fiche affichée suit celle reçue (serveur, diffusion)
    useEffect(() => {
        if (!editMode) setEditableChar(character);
    }, [character, editMode]);

    const char = editMode ? editableChar : character;

    const set = useCallback((field, value) => {
        setEditableChar(prev => ({ ...prev, [field]: value }));
    }, []);

    const save = useCallback(() => {
        onCharacterUpdate(editableChar);
        setEditMode(false);
    }, [editableChar, onCharacterUpdate]);

    const cancel = useCallback(() => {
        setEditableChar(character);
        setEditMode(false);
    }, [character]);

    // Applique un changement : enregistré aussitôt hors édition
    const commit = useCallback((next) => {
        setEditableChar(next);
        if (!editMode) onCharacterUpdate(next);
    }, [editMode, onCharacterUpdate]);

    // Ressource (Cred, jetons, XP…) : en édition dans la fiche éditée, sinon enregistrée
    const patchResource = useCallback((field, value) => {
        if (editMode) set(field, value);
        else onCharacterUpdate({ ...character, [field]: value });
    }, [editMode, set, character, onCharacterUpdate]);

    const addTag = useCallback((entityType, entityId, text, variant) => {
        commit(withTags(editableChar, entityType, entityId, tags => [...tags, { tag_text: text, tag_variant: variant }]));
    }, [editableChar, commit]);

    const removeTag = useCallback((entityType, entityId, index) => {
        commit(withTags(editableChar, entityType, entityId, tags => tags.filter((_, i) => i !== index)));
    }, [editableChar, commit]);

    const updateTag = useCallback((entityType, entityId, index, variant) => {
        commit(withTags(editableChar, entityType, entityId, tags => tags.map((t, i) => (i === index ? { ...t, tag_variant: variant } : t))));
    }, [editableChar, commit]);

    // Console de manœuvres : préférence de jeu, réglable hors du mode Édition
    const saveConsole = useCallback((ids) => {
        commit({ ...(editMode ? editableChar : character), moveConsole: ids });
    }, [editMode, editableChar, character, commit]);

    // Directive accomplie / en cours (vue MJ)
    const toggleDirective = useCallback((directive) => {
        const key = directive._tempId ?? directive.id;
        commit({
            ...editableChar,
            directives: (editableChar.directives ?? []).map(d => ((d._tempId ?? d.id) === key ? { ...d, completed: !d.completed } : d)),
        });
    }, [editableChar, commit]);

    return {
        editMode, setEditMode, editableChar, setEditableChar, char,
        set, save, cancel, commit, patchResource,
        addTag, removeTag, updateTag, saveConsole, toggleDirective,
    };
};

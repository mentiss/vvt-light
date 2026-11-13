// features/journal/tools/journalPeople.js
// Personnes de l'écriture à plusieurs (spec_journal.md §12) : couleur stable par personnage
// (curseur, pastille de présence), nom affiché d'un personnage.

const PERSON_COLORS = ['#b5523b', '#3f8a6b', '#8a5bb5', '#4f67b0', '#b08a2e', '#2e8aa6', '#a63f74', '#6b8a2e'];

/** Couleur d'une personne d'après son identifiant de personnage (-1 = MJ). */
export const personColor = (id) => PERSON_COLORS[(((Number(id) || 0) % PERSON_COLORS.length) + PERSON_COLORS.length) % PERSON_COLORS.length];

/** Nom affiché d'un personnage chargé, quel que soit le slug (name, prénom + nom, nom, joueur). */
export const characterDisplayName = (character) =>
    character?.name || [character?.prenom, character?.nom].filter(Boolean).join(' ') || character?.playerName || 'Joueur';

// features/journal/JournalTab.jsx — Onglet Journal du joueur
// Contrat inchangé pour les slugs : characterId (le personnage), onRead?(entryId) appelé
// quand une entrée non lue (message ou objet du MJ) est ouverte : le compteur de l'onglet
// baisse d'une unité. Le contenu est la brique Journal (spec_journal.md, partie III §13.1).
import React from 'react';
import Journal from './Journal.jsx';

const JournalTab = ({ characterId, onRead }) => <Journal characterId={characterId} onRead={onRead} />;

export default JournalTab;

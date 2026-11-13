// features/journal/TabJournal.jsx — Onglet Journal du MJ
// Aucune prop : le journal du MJ est celui du personnage -1 (brique Journal, spec_journal.md §13.1).
import React from 'react';
import Journal from './Journal.jsx';

const TabJournal = () => <Journal characterId={-1} />;

export default TabJournal;

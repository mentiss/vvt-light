// src/client/src/systems/fabula/config/groupItems.js
// ─────────────────────────────────────────────────────────────────────────────
// Objets d'inventaire officiels de la fiche de groupe (Fabula Ultima FR, Fiche
// de Groupe, « Objets d'inventaire ») : ils se paient en Points d'Inventaire au
// moment voulu (« en fait j'avais ça sur moi ») et ne vont jamais dans le sac.
// La table peut en ajouter d'autres (base, groupe_objets). spec_fabula.md §7.
// ─────────────────────────────────────────────────────────────────────────────

export const GROUP_ITEMS = [
    { key: 'elixir',   nom: 'Élixir',               pi: 3, icon: 'potion', effet: 'Une créature regagne 50 PM.' },
    { key: 'remede',   nom: 'Remède',               pi: 3, icon: 'potion', effet: 'Une créature regagne 50 PV.' },
    { key: 'fragment', nom: 'Fragment élémentaire', pi: 2, icon: 'spark',  effet: "Une créature subit 10 dégâts d'un type de votre choix (air, foudre, terre, feu ou glace).", chooseElement: true },
    { key: 'tente',    nom: 'Tente magique',        pi: 4, icon: 'tent',   effet: 'Permet à tout le groupe de se reposer dans la nature.' },
    { key: 'tonique',  nom: 'Tonique',              pi: 2, icon: 'potion', effet: "Une créature récupère d'un seul état." },
];

// Types du Fragment élémentaire (Q-8 : seul le type est demandé, sans jet)
export const FRAGMENT_ELEMENTS = [
    { key: 'air', label: 'Air' }, { key: 'foudre', label: 'Foudre' }, { key: 'terre', label: 'Terre' },
    { key: 'feu', label: 'Feu' }, { key: 'glace', label: 'Glace' },
];

export const JOURNAL_TYPES = [
    { key: 'personnage', label: 'Personnage' },
    { key: 'creature',   label: 'Créature' },
    { key: 'lieu',       label: 'Lieu' },
];

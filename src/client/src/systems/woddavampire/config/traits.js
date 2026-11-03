// src/client/src/systems/woddavampire/config/traits.js
// ─────────────────────────────────────────────────────────────────────────────
// Attributs, Capacités, Historiques, archétypes (§4, annexe divers §1 à §3).
// ─────────────────────────────────────────────────────────────────────────────

export const ATTRIBUTE_GROUPS = [
    { key: 'physical', label: 'Physiques', attributes: [['strength', 'Force'], ['dexterity', 'Dextérité'], ['stamina', 'Vigueur']] },
    { key: 'social',   label: 'Sociaux',   attributes: [['charisma', 'Charisme'], ['manipulation', 'Manipulation'], ['appearance', 'Apparence']] },
    { key: 'mental',   label: 'Mentaux',   attributes: [['perception', 'Perception'], ['intelligence', 'Intelligence'], ['wits', 'Astuce']] },
];

export const ATTRIBUTE_LABELS = Object.fromEntries(ATTRIBUTE_GROUPS.flatMap(g => g.attributes));

// Capacités : category = talent | skill | knowledge ; domain = domaine d'expertise obligatoire (§4.3)
export const ABILITY_GROUPS = [
    { key: 'talent', label: 'Talents', abilities: [
        ['alertness', 'Vigilance'], ['athletics', 'Athlétisme'], ['awareness', 'Conscience'], ['brawl', 'Bagarre'],
        ['empathy', 'Empathie'], ['expression', 'Expression'], ['subterfuge', 'Subterfuge'], ['intimidation', 'Intimidation'],
        ['legerdemain', 'Escamotage'], ['leadership', 'Commandement']] },
    { key: 'skill', label: 'Compétences', abilities: [
        ['animal_ken', 'Animaux'], ['archery', 'Archerie'], ['etiquette', 'Étiquette'], ['melee', 'Mêlée'],
        ['ride', 'Équitation'], ['stealth', 'Furtivité'], ['survival', 'Survie'], ['commerce', 'Commerce'],
        ['crafts', 'Artisanat'], ['performance', 'Représentation']] },
    { key: 'knowledge', label: 'Connaissances', abilities: [
        ['academics', 'Érudition'], ['enigmas', 'Énigmes'], ['investigation', 'Investigation'], ['law', 'Droit'],
        ['linguistics', 'Linguistique'], ['occult', 'Occultisme'], ['theology', 'Théologie'], ['politics', 'Politique'],
        ['medicine', 'Médecine'], ['seneschal', 'Intendance']] },
];

// Compétence propre aux Tzimisce, hors liste commune (§4.3)
export const BODY_CRAFTS = ['body_crafts', 'Artisanat corporel'];

export const ABILITY_LABELS = Object.fromEntries([...ABILITY_GROUPS.flatMap(g => g.abilities), BODY_CRAFTS]);
export const ABILITY_CATEGORY = Object.fromEntries([
    ...ABILITY_GROUPS.flatMap(g => g.abilities.map(([k]) => [k, g.key])), [BODY_CRAFTS[0], 'skill'],
]);

/** Capacités qui exigent un domaine d'expertise, avec des suggestions */
export const ABILITY_DOMAINS = {
    academics:   ['Arts (littérature)', 'Arts (musique)', 'Arts (philosophie)', 'Sciences (alchimie)', 'Sciences (astronomie)', 'Sciences (mathématiques)'],
    commerce:    ['Bétail', 'Étoffes', 'Denrées', 'Livres', 'Épices', 'Recel', 'Art', 'Alcools'],
    crafts:      ['Armurerie', 'Forge', 'Couture', 'Sculpture sur bois', 'Architecture', 'Maçonnerie'],
    performance: ['Chant', 'Théâtre', 'Instruments à vent', 'Instruments à cordes', 'Danse', 'Acrobatie'],
};

export const BACKGROUNDS = {
    allies:     'Alliés',
    alternate_identity: "Identité d'emprunt",
    contacts:   'Contacts',
    domain:     'Domaine',
    fame:       'Renommée',
    generation: 'Génération',
    herd:       'Troupeau',
    influence:  'Influence',
    mentor:     'Mentor',
    resources:  'Ressources',
    retainers:  'Serviteurs',
    status:     'Statut',
};

// Archétypes (Nature et Attitude) — « Bête » exclue (§5.1)
export const ARCHETYPES = [
    'Architecte', 'Autocrate', 'Bon vivant', 'Bravache', 'Protecteur', 'Fervent', 'Caméléon', 'Enfant',
    'Compétiteur', 'Conformiste', 'Intrigant', 'Épouvantail', 'Grincheux', 'Dilettante', 'Défenseur', 'Déviant',
    'Énigme', 'Œil du cyclone', 'Fanatique', 'Galant', 'Gourou', 'Idéaliste', 'Bouffon', 'Juge', 'Solitaire',
    'Martyr', 'Masochiste', 'Mercenaire', 'Monstre', 'Pédagogue', 'Pénitent', 'Perfectionniste', 'Philosophe',
    'Rebelle', 'Canaille', 'Sadique', 'Soldat', 'Survivant', 'Casse-cou', 'Traditionaliste', 'Tyran', 'Visionnaire',
].map(label => ({
    key: label.replace(/œ/gi, 'oe').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z]+/g, '_'),
    label,
}));

// src/client/src/systems/cyberpunk/config/playbooks.js
// ─────────────────────────────────────────────────────────────────────────────
// Archétypes : chrome, kits, outillage et matos donnés par les manœuvres,
// tags posés par les manœuvres (spec_cyberpunk.md §9.7, §9.8).
// ─────────────────────────────────────────────────────────────────────────────

// Spec : spec_cyberpunk.md §9 (création). Les noms renvoient aux catalogues CYBERWARE_ALL / ITEMS_ALL.
//   cyberware     liste du cyberware de l'archétype ; defaultPicks : nombre à y prendre
//   console       Netrunner : chrome imposé au choix (Cyberconsole intégrée ou Prise de console)
//   kit           groupes du kit gratuit : { id, label, pick?, from: [nom | { name, tags }], requires? }
//                 pick absent = tout le groupe est donné (objet imposé)
//   kitByMove     outillage selon une manœuvre prise à la création (voir KIT_BY_MOVE)
//   mandatoryCyberware : cyberware imposé (Nomad)
// Listes et kits proposés le 2026-11-07, à corriger par le MJ (§9.7).

const ARMES_DE_POING = ['Pistolet semi-automatique', 'Revolver lourd', 'Pistolet lourd'];

export const PLAYBOOKS = [
    {
        id:          'Fixer',
        label:       'Fixer',
        description: 'Réseau, contacts, négociation, opérations en coulisses.',
        cyberware:   ['Neuralink & Comms', 'Puce de Mémoire (Backup)', 'Cyberoptiques (Kiroshi)', 'Synthétiseur Vocal (Audio-masque)', 'Peau Synthétique (Chemskin)', 'Face-plate (Cale de visage)'],
        defaultPicks: 1,
        kit: [
            { id: 'arme',       label: 'Arme de poing', pick: 1, from: ['Pistolet de poche', 'Pistolet semi-automatique', 'Revolver léger'] },
            { id: 'protection', label: 'Protection',    pick: 1, from: ['Vêtements renforcés', 'Veste de protection'] },
            { id: 'comm',       label: 'Communicateur',          from: ['Communicateur'] },
            { id: 'outil',      label: 'Outil',         pick: 1, from: ['Générateur de White Noise', 'Scanner biométrique de poche', 'Kit de déguisement'] },
        ],
    },
    {
        id:          'Netrunner',
        label:       'Netrunner',
        description: 'Intrusion dans le Net, cyberespace, guerre de l\'information.',
        console:     ['Cyberconsole intégrée (Deck)', 'Prise de console'],
        cyberware:   ['Neuralink & Comms', 'Prise supplémentaire', 'Puce de Mémoire (Backup)', 'Cyberoptiques (Kiroshi)'],
        defaultPicks: 1,
        kit: [
            { id: 'arme',       label: 'Arme',       pick: 1, from: ['Pistolet de poche', 'Pistolet à fléchettes', 'Taser'] },
            { id: 'protection', label: 'Protection',          from: ['Vêtements renforcés'] },
            { id: 'outil',      label: 'Outil',      pick: 1, from: ['Sniffer Wi-Fi (Dongle)', 'Injecteur de Virus physique', 'Brouilleur de signal (Screamer)', 'Chip daemon'] },
            { id: 'deck',       label: 'Deck externe',        from: ['Deck externe'], requires: { console: 'Prise de console' } },
        ],
    },
    {
        id:          'Solo',
        label:       'Solo',
        description: 'Opérations terrain, infiltration, combat discret.',
        cyberware:   ['Kerenzikov (Réflexes passifs)', 'Câblage Nerveux (Boost)', 'Cyberarmement de corps', 'Blindage Sous-cutané', 'Cyberoptiques (Kiroshi)', 'Cyberaudition', 'Prise supplémentaire'],
        defaultPicks: 1,
        kit: [
            { id: 'arme',          label: 'Arme principale', pick: 1, from: ['Fusil d\'assaut', 'Fusil de combat', 'Fusil à pompe', 'Pistolet-mitrailleur'] },
            { id: 'arme_poing',    label: 'Arme de poing',   pick: 1, from: ARMES_DE_POING },
            { id: 'arme_blanche',  label: 'Arme blanche',    pick: 1, from: ['Couteau', 'Épée', 'Machette', 'Katana'] },
            { id: 'protection',    label: 'Protection',      pick: 1, from: ['Gilet pare-balles', 'Veste de protection'] },
        ],
    },
    {
        id:          'Investigator',
        label:       'Investigator',
        description: 'Investigation, traque, surveillance, renseignement.',
        cyberware:   ['Cyberoptiques (Kiroshi)', 'Cyberaudition', 'Radar / Sonar Interne', 'Neuralink & Comms', 'Puce de Mémoire (Backup)', 'Prise supplémentaire'],
        defaultPicks: 1,
        kit: [
            { id: 'arme',       label: 'Arme de poing', pick: 1, from: ARMES_DE_POING },
            { id: 'protection', label: 'Protection',             from: ['Veste de protection'] },
            { id: 'outil',      label: 'Outil',         pick: 1, from: ['Balise traçante micro-adhésive', 'Matériel d\'enregistrement', 'Scanner biométrique de poche'] },
            { id: 'comm',       label: 'Communicateur',          from: ['Communicateur'] },
        ],
    },
    {
        id:          'Nomad',
        label:       'Nomad',
        description: 'Conduite, véhicules, filatures, exfiltrations mobiles.',
        cyberware:   ['Lien de Pilotage (Interface)'],
        defaultPicks: 1,
        mandatoryCyberware: 'Lien de Pilotage (Interface)',
        kit: [
            { id: 'vehicule',   label: 'Véhicule',   pick: 1, from: ['Moto', 'Voiture', 'Van utilitaire', 'Voiture de course'] },
            { id: 'arme',       label: 'Arme',       pick: 1, from: ['Fusil à pompe', 'Pistolet lourd', 'Fusil de combat'] },
            { id: 'protection', label: 'Protection',          from: ['Veste de protection'] },
        ],
    },
    {
        id:          'Rockerboy',
        label:       'Rockerboy',
        description: 'Influence, charisme, idéologie, manipulation sociale.',
        cyberware:   ['Cyberarmement de corps', 'Neuralink & Comms', 'Techhair (Fibre optique)', 'Peau Synthétique (Chemskin)', 'Synthétiseur Vocal (Audio-masque)', 'Cyberoptiques (Kiroshi)'],
        defaultPicks: 1,
        kit: [
            { id: 'arme',       label: 'Arme',       pick: 1, from: ['Pistolet de poche', 'Revolver léger', 'Matraque', 'Couteau'] },
            { id: 'protection', label: 'Protection',          from: ['Vêtements renforcés'] },
            { id: 'scene',      label: 'Scène',      pick: 1, from: ['Matériel d\'enregistrement', 'Drogue'] },
        ],
    },
    {
        id:          'Media',
        label:       'Media',
        description: 'Information, investigation, exposition médiatique.',
        cyberware:   ['Enregistreur de Braindance', 'Neuralink & Comms', 'Cyberoptiques (Kiroshi)', 'Cyberaudition', 'Puce de Mémoire (Backup)'],
        defaultPicks: 1,
        kit: [
            { id: 'arme',       label: 'Arme',          pick: 1, from: ['Pistolet de poche', 'Taser'] },
            { id: 'protection', label: 'Protection',             from: ['Vêtements renforcés'] },
            { id: 'enreg',      label: 'Enregistrement',         from: ['Matériel d\'enregistrement'] },
            { id: 'outil',      label: 'Outil',         pick: 1, from: ['Balise traçante micro-adhésive', 'Sniffer Wi-Fi (Dongle)', 'Communicateur'] },
        ],
    },
    {
        id:          'Edgerunner',
        label:       'Edgerunner',
        description: 'Mercenaire augmenté, freelance, combat, tactique.',
        cyberware:   ['Prise supplémentaire', 'Neuralink & Comms', 'Câblage Nerveux (Boost)', 'Kerenzikov (Réflexes passifs)', 'Cyberoptiques (Kiroshi)', 'Cœur Synthétique (Adrénaline)'],
        defaultPicks: 1,
        kit: [
            { id: 'arme',       label: 'Arme principale', pick: 1, from: ['Fusil d\'assaut', 'Pistolet-mitrailleur', 'Fusil à pompe'] },
            { id: 'arme_poing', label: 'Arme de poing',   pick: 1, from: ['Pistolet lourd', 'Pistolet semi-automatique'] },
            { id: 'protection', label: 'Protection',               from: ['Gilet pare-balles'] },
            { id: 'soutien',    label: 'Soutien',         pick: 1, from: ['Traumapatch', 'Airhypo (Injecteur rapide)', 'Grenades à fragmentation'] },
        ],
        kitByMove: 'specialisation',
    },
    {
        id:          'Techie',
        label:       'Techie',
        description: 'Matériel, cyberware, équipement, ingénierie.',
        cyberware:   ['Cyberbras (Cyberarm)', 'Neuralink & Comms', 'Prise supplémentaire', 'Lien de Pilotage (Interface)', 'Cyberoptiques (Kiroshi)'],
        defaultPicks: 1,
        kit: [
            { id: 'arme',       label: 'Arme',        pick: 1, from: ['Pistolet semi-automatique', 'Taser', 'Fusil à pompe'] },
            { id: 'protection', label: 'Protection',           from: ['Veste de protection'] },
            { id: 'trousse',    label: 'Trousse',              from: ['Trousse spécialisée'] },
            { id: 'outil',      label: 'Outil',       pick: 1, from: ['Découpeur thermique (Stylo)', 'Pistolet à grappin magnétique', 'Sniffer Wi-Fi (Dongle)'] },
        ],
        kitByMove: 'sphere',
    },
    {
        id:          'Assassin',
        label:       'Assassin',
        description: 'Neutralisation ciblée, élimination, fantôme.',
        cyberware:   ['Cyberarmement de corps', 'Blindage Sous-cutané', 'Cyberbras (Cyberarm)', 'Greffe Musculaire (Internal)', 'Sandevistan (Accélérateur neural)', 'Kerenzikov (Réflexes passifs)', 'Slice \'N Dice (Fil monofilament)', 'Cyberoptiques (Kiroshi)', 'Optique de Camouflage', 'Articulations Silencieuses'],
        defaultPicks: 2,
        kit: [
            { id: 'arme',       label: 'Arme',        pick: 1, from: ['Fusil de précision', 'Pistolet lourd', 'Épée', 'Machette', 'Katana'] },
            { id: 'jet',        label: 'Arme de jet', pick: 1, from: ['Couteau', 'Shurikens ou lames de jet'] },
            { id: 'tenue',      label: 'Tenue',       pick: 1, from: ['Vêtements renforcés', 'Combinaison furtive'] },
        ],
    },
];

// ── Outillage selon une manœuvre prise à la création (§9.7) ──────────────────
// Remplace le groupe `replaces` du kit ; avec la seconde manœuvre, l'outillage se
// prend dans l'une ou l'autre option choisie, jamais les deux.
// Chaque option : objets donnés (tous) ou { pick, from } (choix).
export const KIT_BY_MOVE = {
    sphere: {
        moves:    ['Expert', 'Intérêts diversifiés'],
        list:     'expertises',
        replaces: 'outil',
        options: {
            'Armurier':      ['Kit d\'armurier', 'Silencieux'],
            'Artificier':    ['Explosifs'],
            'Cybernéticien': [{ name: 'Trousse spécialisée', tags: [{ text: '+cybernétique', variant: 'neutral' }] }],
            'Électronicien': ['Station de réparation microélectronique'],
            'Mécano':        [{ name: 'Trousse spécialisée', tags: [{ text: '+mécanique', variant: 'neutral' }] }],
            'Médecin':       ['Kit médical d\'urgence', 'Airhypo (Injecteur rapide)'],
        },
    },
    specialisation: {
        moves:    ['Spécialisation opérationnelle', 'Spécialisation étendue'],
        list:     'specialisations',
        replaces: 'soutien',
        options: {
            'Démolition':               ['Explosifs'],
            'Combat rapproché / CQC':   { pick: 1, from: ['Couteau', 'Épée', 'Machette', 'Katana'] },
            'Tir de précision':         ['Fusil de précision'],
            'Commandement de terrain':  ['Communicateur', 'Brouilleur de signal (Screamer)'],
            'Infiltration tactique':    ['Combinaison furtive'],
            'Guerre électronique':      ['Brouilleur de signal (Screamer)', 'Sniffer Wi-Fi (Dongle)'],
            'Médecine de combat':       ['Kit médical d\'urgence', 'Traumapatch'],
            'Pilotage sous pression':   ['Moto'],
        },
    },
};

// ── Matos personnalisé et nommé donné par une manœuvre à la création (§9.7) ──
//   customize : un objet du kit (groupe `group`) reçoit `tags` tags ajoutés et un nom
//   add       : un objet de la catégorie `category` en plus, `tags` tags ajoutés, nommé
export const MOVE_GEAR = {
    Nomad: {
        'Rig': { kind: 'customize', group: 'vehicule', tags: 3, hint: 'Profil : Puissance, Aspect, Défaut', named: true },
    },
    Assassin: {
        'Arme personnalisée': { kind: 'customize', group: 'arme', tags: 2, hint: 'Base + deux options', named: true },
    },
    Techie: {
        'Opérateur de drones': { kind: 'add', category: 'drone', tags: 3, hint: 'Profil : locomotion, gabarit, capacités', named: true },
        'Flotte de drones':    { kind: 'add', category: 'drone', tags: 3, hint: 'Profil : locomotion, gabarit, capacités', named: true },
    },
};

// ── Tags posés par une manœuvre (§9.8) ───────────────────────────────────────
// Tag verrouillé (locked) : retirable en mode Édition seulement.
//   prefix   début du tag (« +contact : » + le choix)
//   list     choix dans une liste de REFERENCE_LISTS (contacts : liste du playbook)
//   free     libellé libre (défini avec le MC)
//   on       'character' (défaut) ou 'console' (Cyberconsole intégrée ou Deck externe)
const CONTACTS     = { prefix: '+contact : ', list: 'contacts' };
const INFORMATEUR  = { prefix: '+informateur : ', list: 'contacts' };
const COUVERTURE   = { prefix: '+identité de couverture : ', free: true };

export const MOVE_TAGS = {
    Assassin: {
        'Fantôme': COUVERTURE, 'Double vie': COUVERTURE,
        'Réseau de contacts': CONTACTS, 'Réseau étendu': CONTACTS,
    },
    Edgerunner: {
        'Spécialisation opérationnelle': { prefix: '+', list: 'specialisations' },
        'Spécialisation étendue':        { prefix: '+', list: 'specialisations' },
        'Réseau de contacts': CONTACTS, 'Réseau étendu': CONTACTS,
    },
    Fixer: {
        'Mon équipe':      { prefix: '+équipe : ', free: true },
        'Deuxième équipe': { prefix: '+équipe : ', free: true },
        'Réseau de contacts': CONTACTS, 'Réseau étendu': CONTACTS,
    },
    Investigator: {
        'Informateurs': INFORMATEUR, 'Réseau étendu': INFORMATEUR,
    },
    Media: {
        'Identité de couverture': COUVERTURE,
        'Carte de presse':        { text: '+figure publique' },
        'Contacts': CONTACTS, 'Réseau étendu': CONTACTS,
    },
    Netrunner: {
        'Daemon':        { prefix: '+', list: 'daemons', on: 'console' },
        'Daemon avancé': { prefix: '+', list: 'daemons', on: 'console' },
    },
    Nomad: {
        'Contacts': CONTACTS, 'Réseau étendu': CONTACTS,
    },
    Rockerboy: {
        'Célèbre':         { text: '+célèbre' },
        'Fanbase':         { prefix: '+fanbase : ', free: true },
        'Fanbase extrême': { prefix: '+fanbase extrême : ', free: true },
        'Contacts': CONTACTS, 'Réseau étendu': CONTACTS,
    },
    Solo: {
        'Contacts': CONTACTS,
    },
    Techie: {
        'Expert':               { prefix: '+', list: 'expertises' },
        'Intérêts diversifiés': { prefix: '+', list: 'expertises' },
    },
};

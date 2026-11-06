// Imperium Maledictum : les 20 compétences et leurs spécialisations.
// Sources : livre de base (core) p.91-101 (« Skill List » p.92-101) ; Inquisition Player's Guide (ipg)
// p.62 (« Skill Specialisations » : Ordos Majoris, Xéno-jargon, Déguisement, Chimie).
// Règles (p.91-92) : valeur = caractéristique + 5 × Avances (4 Avances max par compétence) ;
// les Avances d'une spécialisation s'ajoutent à celles de la compétence mère ; nouvelles
// spécialisations possibles avec le MJ. Restriction : le MJ peut la lever avant le début du jeu.
// `restricted` : prérequis du livre (texte), ou null. `various: true` : nom libre à saisir
// (ex. Savoir (Planète : Macharia)), spécialisation prenable plusieurs fois.
// À relire :
// - Déguisement (Disguise, ipg p.62) est donné « Stealth/Dexterity (Ag) » : ajouté sous Discrétion ET
//   sous Dextérité (même clé `disguise`) ; le PG compte donc 4 spécialisations pour 5 entrées ici.
// - Ordos Majoris (ipg) est « Various, Restricted » sans prérequis écrit : restricted porte le texte
//   « Restreinte (prérequis non précisé) ».
// - Maîtrise psychique (Autres) : prérequis au conditionnel dans le livre (« likely require a
//   corresponding Forbidden Knowledge Talent »).
// - Pilotage (Militaire / Vaisseau mineur / Vaisseau majeur) : restriction narrative (formation par
//   des instructeurs, grade suffisant), pas de prérequis chiffré.
// - Traductions propres à ce fichier (hors glossaire) : Xéno-jargon (Xeno-Cant), Chimie (Chem-Use),
//   Sang-froid (Composure), Escamotage (Sleight of Hand), Puissance (Might).

export const SKILLS = [
    {
        key: 'athletics', label: 'Athlétisme', labelEn: 'Athletics', char: 'str', restricted: null, source: 'core', page: 93,
        summary: 'Entraînement et préparation physiques pour surmonter des obstacles variés, souvent dangereux pour les non-initiés, y compris l\'usage des outils de survie adaptés.',
        specs: [
            { key: 'climbing', label: 'Escalade', labelEn: 'Climbing' },
            { key: 'might', label: 'Puissance', labelEn: 'Might' },
            { key: 'riding', label: 'Équitation', labelEn: 'Riding' },
            { key: 'running', label: 'Course', labelEn: 'Running' },
            { key: 'swimming', label: 'Natation', labelEn: 'Swimming' },
        ],
    },
    {
        key: 'awareness', label: 'Vigilance', labelEn: 'Awareness', char: 'per', restricted: null, source: 'core', page: 93,
        summary: 'Capacité à remarquer son environnement avec tous ses sens : ce qui change, et ce qui semble déplacé dans son contexte social ou matériel.',
        specs: [
            { key: 'sight', label: 'Vue', labelEn: 'Sight' },
            { key: 'smell', label: 'Odorat', labelEn: 'Smell' },
            { key: 'hearing', label: 'Ouïe', labelEn: 'Hearing' },
            { key: 'taste', label: 'Goût', labelEn: 'Taste' },
            { key: 'touch', label: 'Toucher', labelEn: 'Touch' },
            { key: 'psyniscience', label: 'Psyniscience', labelEn: 'Psyniscience', restricted: 'Talent Psyker (à la discrétion du MJ, une longue exposition aux phénomènes warp peut permettre une seule Avance)' },
        ],
    },
    {
        key: 'dexterity', label: 'Dextérité', labelEn: 'Dexterity', char: 'ag', restricted: null, source: 'core', page: 94,
        summary: 'Motricité fine : manipulations précises et petits outils, de l\'entretien des appareils jusqu\'au vol et à la tromperie.',
        specs: [
            { key: 'lock_picking', label: 'Crochetage', labelEn: 'Lock-picking' },
            { key: 'pickpocket', label: 'Vol à la tire', labelEn: 'Pickpocket' },
            { key: 'sleight_of_hand', label: 'Escamotage', labelEn: 'Sleight of Hand' },
            { key: 'defuse', label: 'Désamorçage', labelEn: 'Defuse', restricted: 'Au moins 1 Avance en Tech' },
            { key: 'disguise', label: 'Déguisement', labelEn: 'Disguise', source: 'ipg', page: 62 },
        ],
    },
    {
        key: 'discipline', label: 'Discipline', labelEn: 'Discipline', char: 'wil', restricted: null, source: 'core', page: 94,
        summary: 'Capacité à résister obstinément aux influences extérieures grâce à la maîtrise de soi, surtout en situation de stress.',
        specs: [
            { key: 'composure', label: 'Sang-froid', labelEn: 'Composure' },
            { key: 'fear', label: 'Peur', labelEn: 'Fear' },
            { key: 'psychic', label: 'Psychique', labelEn: 'Psychic' },
        ],
    },
    {
        key: 'fortitude', label: 'Robustesse', labelEn: 'Fortitude', char: 'tgh', restricted: null, source: 'core', page: 95,
        summary: 'Capacité à supporter la souffrance physique : maladies, toxines et épuisement.',
        specs: [
            { key: 'endurance', label: 'Endurance', labelEn: 'Endurance' },
            { key: 'pain', label: 'Douleur', labelEn: 'Pain' },
            { key: 'poison', label: 'Poison', labelEn: 'Poison' },
        ],
    },
    {
        key: 'intuition', label: 'Intuition', labelEn: 'Intuition', char: 'per', restricted: null, source: 'core', page: 95,
        summary: 'Sentir que quelque chose cloche chez une personne ou dans un lieu : lire les codes sociaux, le langage corporel et les anomalies d\'un environnement.',
        specs: [
            { key: 'human', label: 'Humains', labelEn: 'Human' },
            { key: 'group', label: 'Groupe', labelEn: 'Group', various: true },
            { key: 'surroundings', label: 'Environs', labelEn: 'Surroundings' },
        ],
    },
    {
        key: 'linguistics', label: 'Linguistique', labelEn: 'Linguistics', char: 'int', restricted: null, source: 'core', page: 95,
        summary: 'Comprendre et traduire les langues écrites et parlées, déchiffrer les codes. Tout citoyen de l\'Imperium parle couramment le Bas Gothique.',
        specs: [
            { key: 'cypher', label: 'Chiffres', labelEn: 'Cypher' },
            { key: 'high_gothic', label: 'Haut Gothique', labelEn: 'High Gothic' },
            { key: 'forbidden', label: 'Interdit', labelEn: 'Forbidden', various: true, restricted: 'Talent Connaissances interdites correspondant' },
        ],
    },
    {
        key: 'logic', label: 'Logique', labelEn: 'Logic', char: 'int', restricted: null, source: 'core', page: 96,
        summary: 'Déduction et analyse pour résoudre des problèmes complexes, y compris les mathématiques et l\'estimation rapide des valeurs et qualités.',
        specs: [
            { key: 'evaluation', label: 'Évaluation', labelEn: 'Evaluation' },
            { key: 'investigation', label: 'Enquête', labelEn: 'Investigation' },
        ],
    },
    {
        key: 'lore', label: 'Savoir', labelEn: 'Lore', char: 'int', restricted: null, source: 'core', page: 96,
        summary: 'Étendue des connaissances sur un sujet donné, tirées surtout de l\'étude.',
        specs: [
            { key: 'academics', label: 'Érudition', labelEn: 'Academics' },
            { key: 'adeptus_terra', label: 'Adeptus Terra', labelEn: 'Adeptus Terra' },
            { key: 'planet', label: 'Planète', labelEn: 'Planet', various: true },
            { key: 'sector', label: 'Secteur', labelEn: 'Sector', various: true },
            { key: 'theology', label: 'Théologie', labelEn: 'Theology', restricted: 'Au moins 1 Avance en Linguistique (Haut Gothique)' },
            { key: 'forbidden', label: 'Interdit', labelEn: 'Forbidden', various: true, restricted: 'Talent Connaissances interdites correspondant' },
            { key: 'major_ordos', label: 'Ordos Majoris', labelEn: 'Major Ordos', various: true, restricted: 'Restreinte (prérequis non précisé)', source: 'ipg', page: 62 },
        ],
    },
    {
        key: 'medicae', label: 'Médicae', labelEn: 'Medicae', char: 'int', restricted: null, source: 'core', page: 97,
        summary: 'Connaissance des soins médicaux, sur le terrain comme dans un hôpital équipé.',
        specs: [
            { key: 'animal', label: 'Animaux', labelEn: 'Animal' },
            { key: 'human', label: 'Humains', labelEn: 'Human' },
            { key: 'forbidden', label: 'Interdit', labelEn: 'Forbidden', various: true, restricted: 'Talent Connaissances interdites correspondant' },
            { key: 'chem_use', label: 'Chimie', labelEn: 'Chem-Use', source: 'ipg', page: 62 },
        ],
    },
    {
        key: 'melee', label: 'Mêlée', labelEn: 'Melee', char: 'ws', restricted: null, source: 'core', page: 97,
        summary: 'Combat au corps à corps, à mains nues ou avec une arme de mêlée.',
        specs: [
            { key: 'brawling', label: 'Pugilat', labelEn: 'Brawling' },
            { key: 'one_handed', label: 'Une main', labelEn: 'One-handed' },
            { key: 'two_handed', label: 'Deux mains', labelEn: 'Two-handed' },
        ],
    },
    {
        key: 'navigation', label: 'Navigation', labelEn: 'Navigation', char: 'int', restricted: null, source: 'core', page: 97,
        summary: 'Lire les cartes et en tirer un itinéraire, du simple trajet à la logistique complexe, à la surface comme dans le vide.',
        specs: [
            { key: 'surface', label: 'Surface', labelEn: 'Surface' },
            { key: 'tracking', label: 'Pistage', labelEn: 'Tracking' },
            { key: 'void', label: 'Vide', labelEn: 'Void' },
            { key: 'warp', label: 'Warp', labelEn: 'Warp', restricted: 'Talent Héritier (Navis Nobilite)' },
        ],
    },
    {
        key: 'piloting', label: 'Pilotage', labelEn: 'Piloting', char: 'ag', restricted: null, source: 'core', page: 98,
        summary: 'Contrôler un véhicule en situation de stress. Hors de ces situations, piloter ne demande pas de Test.',
        specs: [
            { key: 'aeronautica', label: 'Aeronautica', labelEn: 'Aeronautica' },
            { key: 'civilian', label: 'Civil', labelEn: 'Civilian' },
            { key: 'military', label: 'Militaire', labelEn: 'Military', restricted: 'Formation par des instructeurs de l\'Astra Militarum, grade suffisant' },
            { key: 'minor_voidship', label: 'Vaisseau mineur', labelEn: 'Minor Voidship', restricted: 'Formation par des instructeurs de la Flotte impériale, grade suffisant' },
            { key: 'major_voidship', label: 'Vaisseau majeur', labelEn: 'Major Voidship', restricted: 'Formation par des instructeurs de la Flotte impériale, grade suffisant' },
        ],
    },
    {
        key: 'presence', label: 'Présence', labelEn: 'Presence', char: 'wil', restricted: null, source: 'core', page: 98,
        summary: 'Diriger les actes d\'autrui ou lui soutirer des informations par la seule prestance : posture, tenue, façon de parler.',
        specs: [
            { key: 'interrogation', label: 'Interrogatoire', labelEn: 'Interrogation' },
            { key: 'intimidation', label: 'Intimidation', labelEn: 'Intimidation' },
            { key: 'leadership', label: 'Commandement', labelEn: 'Leadership' },
        ],
    },
    {
        key: 'psychic_mastery', label: 'Maîtrise psychique', labelEn: 'Psychic Mastery', char: 'wil', restricted: 'Talent Psyker (pour acheter des Avances dans la compétence et ses spécialisations)', source: 'core', page: 98,
        summary: 'Faire appel aux forces du warp pour transformer la réalité, au péril de son âme et de celle de son entourage.',
        specs: [
            { key: 'biomancy', label: 'Biomancie', labelEn: 'Biomancy' },
            { key: 'divination', label: 'Divination', labelEn: 'Divination' },
            { key: 'pyromancy', label: 'Pyromancie', labelEn: 'Pyromancy' },
            { key: 'telekinesis', label: 'Télékinésie', labelEn: 'Telekinesis' },
            { key: 'telepathy', label: 'Télépathie', labelEn: 'Telepathy' },
            { key: 'various', label: 'Autres disciplines', labelEn: 'Various', various: true, restricted: 'Probablement le Talent Connaissances interdites correspondant' },
        ],
    },
    {
        key: 'ranged', label: 'Distance', labelEn: 'Ranged', char: 'bs', restricted: null, source: 'core', page: 99,
        summary: 'Maniement des armes à distance.',
        specs: [
            { key: 'long_gun', label: 'Arme longue', labelEn: 'Long Gun' },
            { key: 'ordnance', label: 'Artillerie', labelEn: 'Ordnance' },
            { key: 'pistol', label: 'Pistolet', labelEn: 'Pistol' },
            { key: 'thrown', label: 'Lancer', labelEn: 'Thrown' },
        ],
    },
    {
        key: 'rapport', label: 'Rapport', labelEn: 'Rapport', char: 'fel', restricted: null, source: 'core', page: 99,
        summary: 'Amener les autres à faire ce qu\'ils ne feraient pas d\'eux-mêmes sans recourir aux menaces : promesses, argent, intérêt partagé.',
        specs: [
            { key: 'animals', label: 'Animaux', labelEn: 'Animals' },
            { key: 'charm', label: 'Charme', labelEn: 'Charm' },
            { key: 'deception', label: 'Tromperie', labelEn: 'Deception' },
            { key: 'haggle', label: 'Marchandage', labelEn: 'Haggle' },
            { key: 'inquiry', label: 'Renseignement', labelEn: 'Inquiry' },
            { key: 'xeno_cant', label: 'Xéno-jargon', labelEn: 'Xeno-Cant', source: 'ipg', page: 62 },
        ],
    },
    {
        key: 'reflexes', label: 'Réflexes', labelEn: 'Reflexes', char: 'ag', restricted: null, source: 'core', page: 100,
        summary: 'Éviter une attaque ou un accident en n\'étant pas là quand il se produit, et aisance physique en général.',
        specs: [
            { key: 'acrobatics', label: 'Acrobaties', labelEn: 'Acrobatics' },
            { key: 'balance', label: 'Équilibre', labelEn: 'Balance' },
            { key: 'dodge', label: 'Esquive', labelEn: 'Dodge' },
        ],
    },
    {
        key: 'stealth', label: 'Discrétion', labelEn: 'Stealth', char: 'ag', restricted: null, source: 'core', page: 100,
        summary: 'Passer inaperçu, dans la nature comme au milieu de la foule d\'un hab.',
        specs: [
            { key: 'conceal', label: 'Dissimulation', labelEn: 'Conceal' },
            { key: 'hide', label: 'Se cacher', labelEn: 'Hide' },
            { key: 'move_silently', label: 'Déplacement silencieux', labelEn: 'Move Silently' },
            { key: 'disguise', label: 'Déguisement', labelEn: 'Disguise', source: 'ipg', page: 62 },
        ],
    },
    {
        key: 'tech', label: 'Tech', labelEn: 'Tech', char: 'int', restricted: null, source: 'core', page: 101,
        summary: 'Utiliser et réparer les appareils technologiques, domaine réservé de l\'Adeptus Mechanicus dans l\'Imperium.',
        specs: [
            { key: 'augmetics', label: 'Augmétique', labelEn: 'Augmetics', restricted: 'Au moins 1 Avance en Médicae' },
            { key: 'engineering', label: 'Ingénierie', labelEn: 'Engineering' },
            { key: 'security', label: 'Sécurité', labelEn: 'Security' },
        ],
    },
];

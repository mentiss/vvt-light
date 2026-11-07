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
            { key: 'climbing', label: 'Escalade', labelEn: 'Climbing', summary: 'Escalader des surfaces verticales de façon sûre et efficace. Souvent utile sur les mondes férals comme sur les mondes-ruches, et précieux en combat pour prendre un ennemi par surprise.' },
            { key: 'might', label: 'Puissance', labelEn: 'Might', summary: 'Déplacer de lourdes charges, briser des objets et supporter de grands poids. Selon les circonstances, un Test d\'Athlétisme (Puissance) peut remplacer un Test de Présence (Intimidation) dans un but similaire.' },
            { key: 'riding', label: 'Équitation', labelEn: 'Riding', summary: 'Monter les équidés ou leurs équivalents xénos. Presque indispensable pour contrôler ces bêtes en combat.' },
            { key: 'running', label: 'Course', labelEn: 'Running', summary: 'Se déplacer vite sur de longues distances. Utile pour rattraper un fuyard ou échapper à un adversaire dangereux.' },
            { key: 'swimming', label: 'Natation', labelEn: 'Swimming', summary: 'Nager dans les liquides, en général l\'eau. Indispensable sur certains mondes couverts d\'océans, presque inconnu sur d\'autres.' },
        ],
    },
    {
        key: 'awareness', label: 'Vigilance', labelEn: 'Awareness', char: 'per', restricted: null, source: 'core', page: 93,
        summary: 'Capacité à remarquer son environnement avec tous ses sens : ce qui change, et ce qui semble déplacé dans son contexte social ou matériel.',
        specs: [
            { key: 'sight', label: 'Vue', labelEn: 'Sight', summary: 'Percevoir les détails importants et remarquer les éléments qui semblent un tant soit peu incongrus.' },
            { key: 'smell', label: 'Odorat', labelEn: 'Smell', summary: 'Repérer et identifier les odeurs distinctes ou inhabituelles. De rares augmentations et améliorations génétiques permettent même de pister quelqu\'un à l\'odeur seule.' },
            { key: 'hearing', label: 'Ouïe', labelEn: 'Hearing', summary: 'Détecter et identifier les sons qui tranchent sur le bruit ambiant, et mieux déterminer d\'où ils viennent.' },
            { key: 'taste', label: 'Goût', labelEn: 'Taste', summary: 'Discerner les saveurs, y compris les signes de certains poisons et drogues.' },
            { key: 'touch', label: 'Toucher', labelEn: 'Touch', summary: 'Sentir les vibrations inhabituelles (passage de véhicules souterrains, systèmes d\'armes) et reconnaître l\'origine d\'un tissu ou d\'un matériau au toucher. Utile pour repérer les voleurs à la tire.' },
            { key: 'psyniscience', label: 'Psyniscience', labelEn: 'Psyniscience', restricted: 'Talent Psyker (à la discrétion du MJ, une longue exposition aux phénomènes warp peut permettre une seule Avance)', summary: 'Les psykers apprennent à utiliser leur lien avec l\'immaterium pour repérer les lieux où la réalité est, ou a été, perturbée par le warp : détecter les entités warp et localiser les autres psykers lorsqu\'ils puisent dans le warp.' },
        ],
    },
    {
        key: 'dexterity', label: 'Dextérité', labelEn: 'Dexterity', char: 'ag', restricted: null, source: 'core', page: 94,
        summary: 'Motricité fine : manipulations précises et petits outils, de l\'entretien des appareils jusqu\'au vol et à la tromperie.',
        specs: [
            { key: 'lock_picking', label: 'Crochetage', labelEn: 'Lock-picking', summary: 'Ouvrir les serrures mécaniques sans clé. Une serrure assez sophistiquée pour abriter un esprit de la machine demande plutôt un Test de Tech (Sécurité).' },
            { key: 'pickpocket', label: 'Vol à la tire', labelEn: 'Pickpocket', summary: 'Subtiliser le contenu des poches et des sacs d\'autrui sans être remarqué, ou au contraire y glisser un objet (compromettant). Généralement opposé à Vigilance (Toucher).' },
            { key: 'sleight_of_hand', label: 'Escamotage', labelEn: 'Sleight of Hand', summary: 'Prestidigitation et dissimulation d\'objets même sous les yeux d\'un observateur ; un maître peut cacher une arme au trait Discrète même pendant une fouille. Généralement opposé à Vigilance (Vue).' },
            { key: 'defuse', label: 'Désamorçage', labelEn: 'Defuse', restricted: 'Au moins 1 Avance en Tech', summary: 'Techniques et prières apprises par cœur pour désactiver sans danger les engins explosifs et désarmer les pièges.' },
            { key: 'disguise', label: 'Déguisement', labelEn: 'Disguise', source: 'ipg', page: 62, summary: 'Se déguiser, non seulement par la tenue et les accessoires, mais aussi par les manières, le langage corporel et la façon de parler. Éviter d\'être découvert ou soupçonné est plus facile que d\'imiter quelqu\'un. Généralement opposé à Intuition.' },
        ],
    },
    {
        key: 'discipline', label: 'Discipline', labelEn: 'Discipline', char: 'wil', restricted: null, source: 'core', page: 94,
        summary: 'Capacité à résister obstinément aux influences extérieures grâce à la maîtrise de soi, surtout en situation de stress.',
        specs: [
            { key: 'composure', label: 'Sang-froid', labelEn: 'Composure', summary: 'Résister au charme, à l\'intimidation et aux autres pressions sociales, et garder son intégrité face à la tentation.' },
            { key: 'fear', label: 'Peur', labelEn: 'Fear', summary: 'Tenir bon face à la peur surnaturelle qu\'inspirent les êtres hérétiques et corrompus. Sert souvent à résister à l\'état Effrayé et à s\'en remettre.' },
            { key: 'psychic', label: 'Psychique', labelEn: 'Psychic', summary: 'Résister mentalement aux pouvoirs psychiques capables d\'influencer ou de subjuguer l\'esprit.' },
        ],
    },
    {
        key: 'fortitude', label: 'Robustesse', labelEn: 'Fortitude', char: 'tgh', restricted: null, source: 'core', page: 95,
        summary: 'Capacité à supporter la souffrance physique : maladies, toxines et épuisement.',
        specs: [
            { key: 'endurance', label: 'Endurance', labelEn: 'Endurance', summary: 'Se passer de sommeil pendant de très longues périodes et continuer malgré l\'épuisement grâce à une plus grande résistance.' },
            { key: 'pain', label: 'Douleur', labelEn: 'Pain', summary: 'Résister à la torture et faire son devoir malgré les blessures, grâce à un long entraînement à supporter la douleur.' },
            { key: 'poison', label: 'Poison', labelEn: 'Poison', summary: 'Une exposition dosée à diverses toxines donne une résistance, et l\'habitude de rester concentré et efficace malgré un empoisonnement.' },
        ],
    },
    {
        key: 'intuition', label: 'Intuition', labelEn: 'Intuition', char: 'per', restricted: null, source: 'core', page: 95,
        summary: 'Sentir que quelque chose cloche chez une personne ou dans un lieu : lire les codes sociaux, le langage corporel et les anomalies d\'un environnement.',
        specs: [
            { key: 'human', label: 'Humains', labelEn: 'Human', summary: 'Étude des comportements humains : remarquer qu\'une personne ment, cache quelque chose ou agit bizarrement. Sert souvent à s\'opposer à Rapport (Tromperie).' },
            { key: 'group', label: 'Groupe', labelEn: 'Group', various: true, summary: 'Comme Humains, mais pour un groupe en partie ou entièrement non humain : Technoprêtres lourdement augmentés, Space Marines, voire xénos.' },
            { key: 'surroundings', label: 'Environs', labelEn: 'Surroundings', summary: 'Lire en permanence son environnement : erreurs d\'agencement inhabituelles, pas furtifs, formes dissimulées ou comportements inquiétants qui signalent que quelque chose ne va pas.' },
        ],
    },
    {
        key: 'linguistics', label: 'Linguistique', labelEn: 'Linguistics', char: 'int', restricted: null, source: 'core', page: 95,
        summary: 'Comprendre et traduire les langues écrites et parlées, déchiffrer les codes. Tout citoyen de l\'Imperium parle couramment le Bas Gothique.',
        specs: [
            { key: 'cypher', label: 'Chiffres', labelEn: 'Cypher', summary: 'Identifier, déchiffrer et employer les codes d\'écriture secrets, qu\'il s\'agisse de messages manifestement codés (parfois avec une clé littéraire) ou de messages dissimulés dans d\'autres écrits.' },
            { key: 'high_gothic', label: 'Haut Gothique', labelEn: 'High Gothic', summary: 'Langue officielle de l\'Imperium, parlée seulement dans des cercles restreints : branches de l\'Imperium, Adeptus Mechanicus, vieilles Maisons nobles. Les plus anciennes histoires et secrets de l\'Imperium sont souvent conservés en Haut Gothique.' },
            { key: 'forbidden', label: 'Interdit', labelEn: 'Forbidden', various: true, restricted: 'Talent Connaissances interdites correspondant', summary: 'Comprendre une langue ou un mode de communication très restreint ou interdit dans l\'Imperium : langues xénos, Lingua-technis de l\'Adeptus Mechanicus, Thoughtmark des Sœurs du Silence… Chaque langue interdite demande le Talent Connaissances interdites correspondant.' },
        ],
    },
    {
        key: 'logic', label: 'Logique', labelEn: 'Logic', char: 'int', restricted: null, source: 'core', page: 96,
        summary: 'Déduction et analyse pour résoudre des problèmes complexes, y compris les mathématiques et l\'estimation rapide des valeurs et qualités.',
        specs: [
            { key: 'evaluation', label: 'Évaluation', labelEn: 'Evaluation', summary: 'Estimer la valeur relative d\'une chose d\'après ses qualités : prix des biens et de l\'équipement, solidité d\'une structure ou d\'un appareil.' },
            { key: 'investigation', label: 'Enquête', labelEn: 'Investigation', summary: 'Lire une scène de crime : ce qui s\'est passé, qui était impliqué, ce que révèle un cadavre. Inclut des notions de médecine légale (angle d\'un coup et arme d\'après les éclaboussures de sang, temps écoulé d\'après la coagulation).' },
        ],
    },
    {
        key: 'lore', label: 'Savoir', labelEn: 'Lore', char: 'int', restricted: null, source: 'core', page: 96,
        summary: 'Étendue des connaissances sur un sujet donné, tirées surtout de l\'étude.',
        specs: [
            { key: 'academics', label: 'Érudition', labelEn: 'Academics', summary: 'Savoir écrire le Bas Gothique, avec des connaissances en arts, économie, livres et culture planétaire locale. Généralement réservé aux membres de l\'Imperium bien nés ou bien introduits.' },
            { key: 'adeptus_terra', label: 'Adeptus Terra', labelEn: 'Adeptus Terra', summary: 'Connaissance de l\'Adeptus Terra et des nombreux Adepta qui structurent l\'Imperium : leurs rôles, leurs responsabilités et leur place dans l\'Imperium, mais seulement leurs membres les plus connus.' },
            { key: 'planet', label: 'Planète', labelEn: 'Planet', various: true, summary: 'Connaissance d\'une planète choisie lors de la première prise (coutumes, gouvernement, lieux, dangers…), par exemple Savoir (Voll). Peut être prise plusieurs fois, pour une autre planète à chaque fois.' },
            { key: 'sector', label: 'Secteur', labelEn: 'Sector', various: true, summary: 'Connaissance générale d\'un secteur choisi lors de la première prise : sous-secteurs, structures de pouvoir, figures importantes et place dans l\'Imperium, par exemple Savoir (Secteur Macharius). Peut être prise plusieurs fois, pour un autre secteur à chaque fois.' },
            { key: 'theology', label: 'Théologie', labelEn: 'Theology', restricted: 'Au moins 1 Avance en Linguistique (Haut Gothique)', summary: 'Le Credo impérial, ses sectes et ses interprétations, et des notions du Culte Mechanicus. Au mieux une connaissance superficielle des sectes hérétiques du Credo, et aucune des cultes interdits.' },
            { key: 'forbidden', label: 'Interdit', labelEn: 'Forbidden', various: true, restricted: 'Talent Connaissances interdites correspondant', summary: 'Connaissance d\'un sujet totalement réprimé dans l\'Imperium : xénos ou psykers (sans dispense d\'un puissant), démons (passible d\'exécution sommaire), immaterium au-delà des mythes, Adeptus Astartes. Chaque Savoir interdit demande le Talent Connaissances interdites correspondant.' },
            { key: 'major_ordos', label: 'Ordos Majoris', labelEn: 'Major Ordos', various: true, restricted: 'Restreinte (prérequis non précisé)', source: 'ipg', page: 62, summary: 'Choisir l\'Ordo Hereticus, Malleus ou Xenos : connaissance de l\'Ordo (Inquisiteurs célèbres, méthodes, équipement emblématique, ennemis habituels). Permet de réquisitionner, commander ou fabriquer l\'équipement propre à cet Ordo.' },
        ],
    },
    {
        key: 'medicae', label: 'Médicae', labelEn: 'Medicae', char: 'int', restricted: null, source: 'core', page: 97,
        summary: 'Connaissance des soins médicaux, sur le terrain comme dans un hôpital équipé.',
        specs: [
            { key: 'animal', label: 'Animaux', labelEn: 'Animal', summary: 'Prévention et traitement des maladies et blessures des animaux, avec une solide connaissance de leur anatomie, de leur comportement et des produits qu\'on en tire.' },
            { key: 'human', label: 'Humains', labelEn: 'Human', summary: 'Traiter les maladies et blessures des humains : premiers soins, stabilisation des grands blessés, arrêt des hémorragies. Fonctionne aussi sur les Abhumains (Ratlings, Ogryns, Kin des Ligues de Votann).' },
            { key: 'forbidden', label: 'Interdit', labelEn: 'Forbidden', various: true, restricted: 'Talent Connaissances interdites correspondant', summary: 'Par exemple : pose et réglage d\'augmétiques radicales, soins d\'une espèce xénos précise (souvent pour en stabiliser un le temps de l\'interroger), maladies nées du warp. Chaque Médicae interdite demande le Talent Connaissances interdites correspondant.' },
            { key: 'chem_use', label: 'Chimie', labelEn: 'Chem-Use', source: 'ipg', page: 62, summary: 'Chimie : identifier des échantillons chimiques et les signes de poisons ou de toxines sur une créature ou un cadavre, et mieux fabriquer stimulants chimiques, poisons et toxines.' },
        ],
    },
    {
        key: 'melee', label: 'Mêlée', labelEn: 'Melee', char: 'ws', restricted: null, source: 'core', page: 97,
        summary: 'Combat au corps à corps, à mains nues ou avec une arme de mêlée.',
        specs: [
            { key: 'brawling', label: 'Pugilat', labelEn: 'Brawling', summary: 'L\'art brutal du pugilat : des mains nues et des poings américains jusqu\'aux coups dévastateurs d\'un gantelet énergétique.' },
            { key: 'one_handed', label: 'Une main', labelEn: 'One-handed', summary: 'Maniement des épées, haches, masses et autres armes de mêlée utilisables d\'une seule main.' },
            { key: 'two_handed', label: 'Deux mains', labelEn: 'Two-handed', summary: 'Maniement des grandes épées, grandes haches, masses lourdes et autres armes de mêlée à deux mains, ainsi que des armes d\'hast comme les lances et les hallebardes.' },
        ],
    },
    {
        key: 'navigation', label: 'Navigation', labelEn: 'Navigation', char: 'int', restricted: null, source: 'core', page: 97,
        summary: 'Lire les cartes et en tirer un itinéraire, du simple trajet à la logistique complexe, à la surface comme dans le vide.',
        specs: [
            { key: 'surface', label: 'Surface', labelEn: 'Surface', summary: 'Tracer et suivre un itinéraire probable sur terre ou sur mer pour atteindre une destination de la façon la plus efficace.' },
            { key: 'tracking', label: 'Pistage', labelEn: 'Tracking', summary: 'Lire les traces laissées par d\'autres pour les suivre, mais aussi en déduire leur nombre, s\'ils portaient une lourde charge ou voyageaient léger, s\'ils étaient pressés, etc.' },
            { key: 'void', label: 'Vide', labelEn: 'Void', summary: 'Tracer et suivre une route entre les corps célestes d\'un système.' },
            { key: 'warp', label: 'Warp', labelEn: 'Warp', restricted: 'Talent Héritier (Navis Nobilite)', summary: 'Tracer une route à travers les remous et courants incertains de l\'immaterium. Impossible sans la faculté de percevoir le warp : réservée aux Navigateurs mutants du Navis Nobilite.' },
        ],
    },
    {
        key: 'piloting', label: 'Pilotage', labelEn: 'Piloting', char: 'ag', restricted: null, source: 'core', page: 98,
        summary: 'Contrôler un véhicule en situation de stress. Hors de ces situations, piloter ne demande pas de Test.',
        specs: [
            { key: 'aeronautica', label: 'Aeronautica', labelEn: 'Aeronautica', summary: 'Piloter les véhicules volants, des transports aux appareils de combat. Suffit pour descendre de l\'orbite jusqu\'à une planète, mais pas pour des manœuvres complexes hors de l\'atmosphère.' },
            { key: 'civilian', label: 'Civil', labelEn: 'Civilian', summary: 'Conduire les véhicules terrestres non militaires, comme les transporteurs de fret ou les véhicules personnels.' },
            { key: 'military', label: 'Militaire', labelEn: 'Military', restricted: 'Formation par des instructeurs de l\'Astra Militarum, grade suffisant', summary: 'Conduire les véhicules terrestres militaires, comme les chars. Formation généralement dispensée par des instructeurs de l\'Astra Militarum aux personnages de grade suffisant.' },
            { key: 'minor_voidship', label: 'Vaisseau mineur', labelEn: 'Minor Voidship', restricted: 'Formation par des instructeurs de la Flotte impériale, grade suffisant', summary: 'Piloter les petits vaisseaux spatiaux, des chasseurs aux transports. Formation généralement dispensée par des instructeurs de la Flotte impériale aux personnages de grade suffisant.' },
            { key: 'major_voidship', label: 'Vaisseau majeur', labelEn: 'Major Voidship', restricted: 'Formation par des instructeurs de la Flotte impériale, grade suffisant', summary: 'Manœuvrer les immenses vaisseaux de la Flotte impériale : croiseurs, destroyers, frégates et autres. Formation généralement dispensée par des instructeurs de la Flotte impériale aux personnages de grade suffisant.' },
        ],
    },
    {
        key: 'presence', label: 'Présence', labelEn: 'Presence', char: 'wil', restricted: null, source: 'core', page: 98,
        summary: 'Diriger les actes d\'autrui ou lui soutirer des informations par la seule prestance : posture, tenue, façon de parler.',
        specs: [
            { key: 'interrogation', label: 'Interrogatoire', labelEn: 'Interrogation', summary: 'Techniques de pression, subtiles ou non, pour soutirer un maximum d\'informations à un sujet, même coopératif. Ce n\'est pas de la torture physique. Opposé à Discipline (Sang-froid) ou Endurance (Douleur) de la cible.' },
            { key: 'intimidation', label: 'Intimidation', labelEn: 'Intimidation', summary: 'Faire pression par des menaces, voilées ou ouvertes, de châtiment physique ou d\'autres sorts funestes pour qui n\'obéit pas ou n\'avoue pas tout. Souvent opposé à Discipline (Sang-froid).' },
            { key: 'leadership', label: 'Commandement', labelEn: 'Leadership', summary: 'Pousser les autres à donner le meilleur d\'eux-mêmes pour atteindre un but : de quelques scribes à motiver pour finir un long relevé en un temps record, à des soldats désespérés à lancer à l\'assaut d\'un bunker.' },
        ],
    },
    {
        key: 'psychic_mastery', label: 'Maîtrise psychique', labelEn: 'Psychic Mastery', char: 'wil', restricted: 'Talent Psyker (pour acheter des Avances dans la compétence et ses spécialisations)', source: 'core', page: 98,
        summary: 'Faire appel aux forces du warp pour transformer la réalité, au péril de son âme et de celle de son entourage.',
        specs: [
            { key: 'biomancy', label: 'Biomancie', labelEn: 'Biomancy', summary: 'Manipuler la chair vivante et les processus biologiques : soigner les blessures, modifier les caractéristiques physiques, commettre de mortels sabotages biologiques.' },
            { key: 'divination', label: 'Divination', labelEn: 'Divination', summary: 'Glaner des informations et s\'en servir pour tourner le sort en sa faveur : facultés extrasensorielles et visions de l\'avenir.' },
            { key: 'pyromancy', label: 'Pyromancie', labelEn: 'Pyromancy', summary: 'Créer et contrôler la chaleur et les flammes par une volonté renforcée par le warp.' },
            { key: 'telekinesis', label: 'Télékinésie', labelEn: 'Telekinesis', summary: 'Manifester ses pensées sous forme de force physique : manipuler des objets à distance, dresser des barrières invisibles, déchiqueter ses ennemis.' },
            { key: 'telepathy', label: 'Télépathie', labelEn: 'Telepathy', summary: 'Relier les esprits à travers le warp et altérer les pensées : communiquer, contrôler le comportement, manipuler pensées et émotions.' },
            { key: 'various', label: 'Autres disciplines', labelEn: 'Various', various: true, restricted: 'Probablement le Talent Connaissances interdites correspondant', summary: 'Bien d\'autres disciplines psychiques existent dans la galaxie, plus secrètes ou interdites encore que les pratiques des psykers sanctionnés de l\'Imperium. Elles demandent probablement le Talent Connaissances interdites correspondant.' },
        ],
    },
    {
        key: 'ranged', label: 'Distance', labelEn: 'Ranged', char: 'bs', restricted: null, source: 'core', page: 99,
        summary: 'Maniement des armes à distance.',
        specs: [
            { key: 'long_gun', label: 'Arme longue', labelEn: 'Long Gun', summary: 'Maniement des armes à feu longues : fusils laser, fusils à pompe, bolters, fusils automatiques, fuseurs et armes semblables.' },
            { key: 'ordnance', label: 'Artillerie', labelEn: 'Ordnance', summary: 'Maniement des armes lourdes : canons laser, bolters lourds, lance-missiles et autres moyens de destruction dévastateurs.' },
            { key: 'pistol', label: 'Pistolet', labelEn: 'Pistol', summary: 'Maniement des armes de poing : pistolets laser, pistolets bolters, pistolets automatiques, revolvers et armes semblables.' },
            { key: 'thrown', label: 'Lancer', labelEn: 'Thrown', summary: 'Maniement des armes de jet, comme les grenades et les couteaux de lancer.' },
        ],
    },
    {
        key: 'rapport', label: 'Rapport', labelEn: 'Rapport', char: 'fel', restricted: null, source: 'core', page: 99,
        summary: 'Amener les autres à faire ce qu\'ils ne feraient pas d\'eux-mêmes sans recourir aux menaces : promesses, argent, intérêt partagé.',
        specs: [
            { key: 'animals', label: 'Animaux', labelEn: 'Animals', summary: 'Gagner l\'amitié et l\'affection des bêtes simples et savoir en prendre soin. Utile face aux chiens de garde, par exemple pour leur donner un ordre ou faire taire un chien hostile.' },
            { key: 'charm', label: 'Charme', labelEn: 'Charm', summary: 'Être d\'une compagnie extrêmement agréable, pour obtenir plus facilement des faveurs « raisonnables » de ses nouveaux amis. Souvent opposé à Discipline (Sang-froid).' },
            { key: 'deception', label: 'Tromperie', labelEn: 'Deception', summary: 'Tromper sans ciller, par la pratique ou par une formation spécifique. Souvent opposé à Intuition.' },
            { key: 'haggle', label: 'Marchandage', labelEn: 'Haggle', summary: 'L\'art ancestral de marchander pour obtenir la meilleure affaire. Souvent opposé à Discipline (Sang-froid) ou Logique (Évaluation).' },
            { key: 'inquiry', label: 'Renseignement', labelEn: 'Inquiry', summary: 'Obtenir des réponses par les ragots, la conversation amicale ou des questions ciblées. Peut être opposé à Discipline (Sang-froid) ou Présence (Intimidation).' },
            { key: 'xeno_cant', label: 'Xéno-jargon', labelEn: 'Xeno-Cant', source: 'ipg', page: 62, summary: 'Étiquette, signes du langage corporel et connaissances générales pour aborder les espèces xénos, surtout celles souvent en contact avec l\'Humanité. Aide à engager la conversation et à les approcher en terrain neutre.' },
        ],
    },
    {
        key: 'reflexes', label: 'Réflexes', labelEn: 'Reflexes', char: 'ag', restricted: null, source: 'core', page: 100,
        summary: 'Éviter une attaque ou un accident en n\'étant pas là quand il se produit, et aisance physique en général.',
        specs: [
            { key: 'acrobatics', label: 'Acrobaties', labelEn: 'Acrobatics', summary: 'Exercices gymniques : sauter, rouler et culbuter avec grâce. Permet de traverser rapidement un terrain autrement difficile.' },
            { key: 'balance', label: 'Équilibre', labelEn: 'Balance', summary: 'Rester sur ses pieds malgré un sol instable, des flaques d\'onguents glissants ou des passerelles traîtresses.' },
            { key: 'dodge', label: 'Esquive', labelEn: 'Dodge', summary: 'Éviter blessures et accidents par des mouvements vifs. Permet de se défendre en combat contre les attaques de mêlée et à distance : sans augmentation, on n\'esquive pas une balle, mais on peut sortir de la ligne de tir.' },
        ],
    },
    {
        key: 'stealth', label: 'Discrétion', labelEn: 'Stealth', char: 'ag', restricted: null, source: 'core', page: 100,
        summary: 'Passer inaperçu, dans la nature comme au milieu de la foule d\'un hab.',
        specs: [
            { key: 'conceal', label: 'Dissimulation', labelEn: 'Conceal', summary: 'Cacher des lieux et des objets pour qu\'on ne les trouve pas facilement. Souvent opposé à Vigilance (Vue) ou Intuition (Environs).' },
            { key: 'hide', label: 'Se cacher', labelEn: 'Hide', summary: 'Passer inaperçu, par exemple camouflé dans une végétation xénos ou en filant quelqu\'un dans une foule. Généralement opposé à Vigilance (Vue) de l\'observateur.' },
            { key: 'move_silently', label: 'Déplacement silencieux', labelEn: 'Move Silently', summary: 'Se déplacer sans bruit et sans attirer l\'attention. Généralement opposé à Vigilance (Ouïe).' },
            { key: 'disguise', label: 'Déguisement', labelEn: 'Disguise', source: 'ipg', page: 62, summary: 'Se déguiser, non seulement par la tenue et les accessoires, mais aussi par les manières, le langage corporel et la façon de parler. Éviter d\'être découvert ou soupçonné est plus facile que d\'imiter quelqu\'un. Généralement opposé à Intuition.' },
        ],
    },
    {
        key: 'tech', label: 'Tech', labelEn: 'Tech', char: 'int', restricted: null, source: 'core', page: 101,
        summary: 'Utiliser et réparer les appareils technologiques, domaine réservé de l\'Adeptus Mechanicus dans l\'Imperium.',
        specs: [
            { key: 'augmetics', label: 'Augmétique', labelEn: 'Augmetics', restricted: 'Au moins 1 Avance en Médicae', summary: 'Utiliser et réparer les différents types d\'augmétiques : substituts bioniques mécaniques ou électriques des parties du corps humain, souvent améliorés, certains offrant des capacités entièrement nouvelles.' },
            { key: 'engineering', label: 'Ingénierie', labelEn: 'Engineering', summary: 'Construire, utiliser et restaurer les appareils technologiques et mécaniques, y compris armes et explosifs. L\'Adeptus Mechanicus s\'en réserve le droit exclusif et punit qui l\'exerce ou l\'étudie sans sa sanction ; assembler ou réparer un appareil par routine ne la demande pas.' },
            { key: 'security', label: 'Sécurité', labelEn: 'Security', summary: 'Interagir avec les esprits de la machine des dispositifs de sécurité et des systèmes qui leur sont reliés (portes, thermorégulateurs, systèmes d\'armes…) par des codes binaires et des techniques d\'extraction de données. Connue de peu de gens hors de l\'Adeptus Mechanicus.' },
        ],
    },
];

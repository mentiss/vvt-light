// src/client/src/systems/cyberpunk/config/cyberware.js
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue du chrome (CYBERWARE_ALL), socle commun et mémoire de la console.
// Champs : voir catalog.js. Prix (price) à remplir par le MJ.
// ─────────────────────────────────────────────────────────────────────────────

// Socle commun à tous les personnages (§9.2), hors slot : affiché en une ligne du bloc Chrome
export const CHROME_BASE = 'Une prise dans le cou · mémoire interne basique · lecture des chips (une chip insérée à la fois)';

// Mémoire de la console du Netrunner : daemons stockés (Q-C27, affichage sans blocage)
export const CONSOLE_MEMORY_BASE = 2;

export const CYBERWARE_ALL = [
    // --- BORGWARE (TRANSFORMATION LOURDE) ---
    {
        name:        'Châssis Linéaire (Sigma/Bêta)',
        category:    'physique',
        defects:     3,
        description: 'Exosquelette greffé directement sur l\'ossature. Augmente la puissance brute de manière colossale.',
        optionHint:  null,
        tags: [
            { text: '+surhumain', variant: 'positive' },
            { text: '+encombrant', variant: 'negative' },
            { text: '+puissant', variant: 'positive' },
        ],
        // Options à choisir (spec_cyberpunk.md §9.7, réponses du 2026-11-07)
        tagChoices: [
            { label: 'Modèle', pick: 1, from: [
                { option: 'Sigma', text: '+force +1', variant: 'positive' },
                { option: 'Bêta', text: '+force +2', variant: 'positive' },
            ] },
        ],
    },
    {
        name:        'Monture Multi-Optique',
        category:    'sensoriel',
        defects:     3,
        description: 'Grappe de capteurs faciaux permettant d\'accueillir jusqu\'à 5 yeux cybernétiques supplémentaires.',
        optionHint:  null,
        tags: [
            { text: '+horrifique', variant: 'negative' },
        ],
        // Options à choisir (spec_cyberpunk.md §9.7, réponses du 2026-11-07)
        tagChoices: [
            { label: 'Capteurs', pick: 2, from: [
                { text: '+vision 360°', variant: 'positive' },
                { text: '+analyseur de micro-expressions', variant: 'positive' },
                { text: '+spectromètre', variant: 'positive' },
            ] },
        ],
    },

    // --- FASHIONWARE (STYLE & COSMÉTIQUE) ---
    {
        name:        'Techhair (Fibre optique)',
        category:    'social',
        cosmetic:    true,
        description: 'Cheveux en fibres synthétiques capables de changer de couleur ou de s\'éclairer selon l\'humeur.',
        optionHint:  null,
        tags: [
            { text: '+style', variant: 'positive' },
            { text: '+lumineux', variant: 'neutral' },
        ],
    },
    {
        name:        'Shift Tacts (Lentilles colorées)',
        category:    'social',
        cosmetic:    true,
        description: 'Implants oculaires cosmétiques changeant la couleur et le motif de l\'iris à volonté.',
        optionHint:  null,
        tags: [
            { text: '+camouflage iris', variant: 'positive' },
        ],
    },
    {
        name:        'Skinwatch (Montre dermique)',
        category:    'social',
        cosmetic:    true,
        description: 'Affichage LED sous-cutané sur le poignet indiquant l\'heure et les constantes vitales.',
        optionHint:  null,
        tags: [
            { text: '+pratique', variant: 'neutral' },
        ],
    },
    {
        name:        'Câblage EMP (Threading)',
        category:    'social',
        cosmetic:    true,
        description: 'Circuits dorés ou argentés gravés sur la peau. Ne sert à rien, sauf à montrer qu\'on a les moyens.',
        optionHint:  null,
        tags: [
            { text: '+style', variant: 'positive' },
            { text: '+brillant', variant: 'neutral' },
        ],
    },
    {
        name:        'Mr. Studd / Midnight Lady',
        category:    'social',
        description: 'Implants génitaux de performance pour "toute la nuit, toutes les nuits". Augmente le style en situation intime.',
        optionHint:  null,
        tags: [
            { text: '+endurance sexuelle', variant: 'neutral' },
            { text: '+risqué (contrefaçon)', variant: 'negative' },
        ],
    },

    // --- SURVIE & SPÉCIALISÉ ---
    {
        name:        'Branchies (Gills)',
        category:    'survie',
        description: 'Filtres osmotiques implantés dans le cou. Permet de respirer sous l\'eau indéfiniment.',
        optionHint:  null,
        tags: [
            { text: '+aquatique', variant: 'positive' },
        ],
    },
    {
        name:        'Radar / Sonar Interne',
        category:    'sensoriel',
        defects:     2,
        description: 'Émetteur d\'ondes ultrasoniques. Permet de détecter les formes à travers les murs ou dans le noir total.',
        optionHint:  null,
        tags: [
            { text: '+écholocalisation', variant: 'positive' },
            { text: '+portée 20m', variant: 'neutral' },
        ],
    },
    {
        name:        'Holster Dissimulé',
        category:    'armement',
        description: 'Compartiment escamotable dans la cuisse ou le torse pour cacher une arme de poing légère.',
        optionHint:  null,
        tags: [
            { text: '+discret', variant: 'positive' },
        ],
    },

    // --- NEURAL ---
    {
        name:        'Puce de Mémoire (Backup)',
        category:    'neural',
        description: 'Mémoire blindée (la mémoire basique fait partie du socle) : souvenirs et données protégés de l\'effacement, de l\'amnésie traumatique et de l\'intrusion.',
        optionHint:  null,
        tags: [
            { text: '+mémoire blindée', variant: 'positive' },
            { text: '+inaltérable', variant: 'positive' },
        ],
    },
    // --- SYSTÈMES DE RÉFLEXES & COMBAT (NEURAL) ---
    {
        name:        'Sandevistan (Accélérateur neural)',
        category:    'neural',
        defects:     3,
        description: 'Dilate la perception du temps. Une fois par scène : esquive auto ou action supplémentaire simple.',
        optionHint:  null,
        tags: [
            { text: '+vitesse extrême', variant: 'positive' },
        ],
        archetypeDefects: 2,   // tags négatifs à choisir aussi quand il est pris dans la liste de l'archétype
    },
    {
        name:        'Module Berserk (Injecteur d\'adrénaline)',
        category:    'neural',
        defects:     3,
        description: 'Une fois par scène : ignore la douleur et gagne +1 dégât au contact. Impossible de battre en retraite tant qu\'actif.',
        optionHint:  null,
        tags: [
            { text: '+bestial', variant: 'neutral' },
            { text: '+1 dégât mêlée', variant: 'positive' },
            { text: '+résilience', variant: 'positive' },
        ],
        archetypeDefects: 2,
    },
    {
        name:        'Kerenzikov (Réflexes passifs)',
        category:    'neural',
        defects:     3,
        description: 'Boost de réactivité constante. Une fois par scène : déclenche un move simple en même temps qu\'un autre move de combat.',
        optionHint:  null,
        tags: [
            { text: '+précision',  variant: 'positive'  },
            { text: '+réactif', variant: 'positive' },
        ],
    },
    {
        name:        'Câblage Nerveux (Boost)',
        category:    'neural',
        defects:     2,
        description: 'Amélioration des influx synaptiques. +1 sur le prochain jet si aucun adversaire n\'est "câblé".',
        optionHint:  null,
        tags: [
            { text: '+réactif', variant: 'positive' },
            { text: '+1 Agir sous pression', variant: 'positive' },
        ],
    },

    // --- CYBER-ARMEMENT ---
    {
        name:        'Cyberarmement de corps',
        category:    'armement',
        defects:     3,
        description: 'Arme dissimulée sous la peau, d\'un type à choisir : Bras de Gorille, Monocâble, Lames Mantis, Canon ou Lance-grenade.',
        optionHint:  null,
        tags: [
            { text: '+discret',  variant: 'positive' },
        ],
        // Type obligatoire (spec_cyberpunk.md §9.7)
        tagChoices: [
            { label: 'Type', pick: 1, from: [
                { text: '+Bras de Gorille', variant: 'neutral' },
                { text: '+Monocâble',       variant: 'neutral' },
                { text: '+Lames Mantis',    variant: 'neutral' },
                { text: '+Canon',           variant: 'neutral' },
                { text: '+Lance-grenade',   variant: 'neutral' },
            ] },
        ],
    },
    {
        name:        'Slice \'N Dice (Fil monofilament)',
        category:    'armement',
        defects:     2,
        description: 'Fil de monofilament logé dans le poignet, capable de trancher l\'acier. (3-dégâts +contact +carnage +discret)',
        optionHint:  null,
        tags: [
            { text: '3-dégâts',  variant: 'neutral'  },
            { text: '+contact',  variant: 'neutral'  },
            { text: '+carnage',  variant: 'neutral'  },
            { text: '+discret',  variant: 'positive' },
        ],
    },
    {
        name:        'Projecteur de Micro-vibrations',
        category:    'armement',
        defects:     2,
        description: 'Émetteur ultrasonique intégré. Augmente la perforation des lames ou des poings. Ignore 1-Armure.',
        optionHint:  null,
        tags: [
            { text: 'perce-armure', variant: 'positive' },
            { text: '+vibration', variant: 'neutral' },
        ],
    },

    // --- PROTECTION & SYSTÈME IMMUNITAIRE ---
    {
        name:        'Blindage Sous-cutané',
        category:    'protection',
        defects:     2,
        description: 'Plaques de céramique/kevlar. Réduit les conséquences graves — soustrait 2 aux jets de blessure mortelle.',
        optionHint:  null,
        tags: [
            { text: '-2 blessure mortelle', variant: 'positive' },
            { text: '-3 vs +fléchettes',    variant: 'positive' },
        ],
    },
    {
        name:        'Revêtement de Chaleur / Anti-EMP',
        category:    'protection',
        defects:     2,
        description: 'Protection contre les températures extrêmes et les décharges électriques. Immunise contre les tags +feu et +électrique.',
        optionHint:  null,
        tags: [
            { text: '+isolé', variant: 'positive' },
            { text: '+blindé', variant: 'positive' },
        ],
    },
    {
        name:        'Optique de Camouflage',
        category:    'infiltration',
        defects:     2,
        description: 'Nano-pigments de réfraction. Une fois par scène : deviens invisible pendant quelques instants (bonus de +2 en discrétion).',
        optionHint:  null,
        tags: [
            { text: '+invisible', variant: 'positive' },
            { text: '+consomme énergie', variant: 'negative' },
        ],
    },
    {
        name:        'Éditeur de douleur',
        category:    'protection',
        defects:     2,
        description: 'Supprime les signaux sensoriels de douleur. Ignore les malus de blessure tant que vous n\'êtes pas HS.',
        optionHint:  null,
        tags: [
            { text: '+insensible', variant: 'positive' },
            { text: '+aliénant', variant: 'negative' },
        ],
    },

    // --- SYSTÈMES VITAUX & BIOWARE ---
    {
        name:        'Second Cœur',
        category:    'survie',
        defects:     3,
        description: 'Organe de secours automatique. Une fois par mission : ignore une blessure qui devrait être fatale.',
        optionHint:  null,
        tags: [
            { text: '+survie', variant: 'positive' },
            { text: '+automatique', variant: 'neutral' },
        ],
    },
    {
        name:        'Pompe Sanguine / Bio-moniteur',
        category:    'survie',
        defects:     2,
        description: 'Injecte des coagulants en cas de choc. Une fois par mission : soigne automatiquement 1-segment de dégâts.',
        optionHint:  null,
        tags: [
            { text: '+soins auto', variant: 'positive' },
            { text: '+adrénaline', variant: 'neutral' },
        ],
    },
    {
        name:        'Cœur Synthétique (Adrénaline)',
        category:    'survie',
        defects:     2,
        description: 'Remplacement cardiaque haute performance. +1 sur les jets d\'endurance ou d\'effort physique intense.',
        optionHint:  null,
        tags: [
            { text: '+endurant', variant: 'positive' },
            { text: '+récupération', variant: 'positive' },
        ],
    },
    {
        name:        'Poumons Synthétiques (O2 Boost)',
        category:    'survie',
        defects:     2,
        description: 'Traitement de l\'oxygène optimisé. Permet de retenir sa respiration 10min et donne +1 sur les jets de sprint.',
        optionHint:  null,
        tags: [
            { text: '+endurant', variant: 'positive' },
            { text: '+athlétique', variant: 'positive' },
        ],
    },
    {
        name:        'Détoxificateur Métabolique',
        category:    'survie',
        description: 'Immunise contre les gaz toxiques et les drogues de rue. Purge le foie instantanément.',
        optionHint:  null,
        tags: [
            { text: '+immunité toxines', variant: 'positive' },
            { text: '+résistance gaz', variant: 'positive' },
        ],
    },

    // --- MEMBRES & PHYSIQUE ---
    {
        name:        'Cyberbras (Cyberarm)',
        category:    'membres',
        defects:     2,
        description: 'Membre de remplacement allant de la prothèse industrielle à l\'outil de précision.',
        optionHint:  null,
        tags: [
            { text: '+robuste', variant: 'positive' },
        ],
        // Options à choisir (spec_cyberpunk.md §9.7, réponses du 2026-11-07)
        tagChoices: [
            { label: 'Variante', pick: 1, from: [
                { option: 'Actionneur hydraulique', text: '+force augmentée', variant: 'neutral' },
                { option: 'Main-outil', text: '+outils intégrés', variant: 'neutral' },
                { option: 'Boîtier de rangement', text: '+rangement dissimulé', variant: 'neutral' },
            ] },
        ],
    },
    {
        name:        'Cyberjambes (Cyberlegs)',
        category:    'membres',
        defects:     2,
        description: 'Membres inférieurs optimisés. +1 sur Agir sous pression si les jambes peuvent aider.',
        optionHint:  null,
        tags: [
            { text: '+agile', variant: 'positive' },
        ],
        // Options à choisir (spec_cyberpunk.md §9.7, réponses du 2026-11-07)
        tagChoices: [
            { label: 'Variante', pick: 1, from: [
                { option: 'Saut assisté', text: '+double saut', variant: 'positive' },
                { option: 'Pieds magnétiques', text: '+pieds magnétiques', variant: 'positive' },
                { option: 'Propulseurs de cheville', text: '+vitesse sprint', variant: 'positive' },
            ] },
        ],
    },
    {
        name:        'Greffe Musculaire (Internal)',
        category:    'physique',
        defects:     2,
        description: 'Renforcement des tissus par biopolymères. Permet de lancer 2d10+Synth au lieu de Chair pour Employer la manière forte.',
        optionHint:  null,
        tags: [
            { text: '+puissant',          variant: 'positive' },
            { text: '+1 dégât mêlée',     variant: 'positive' },
        ],
    },
    {
        name:        'Articulations Silencieuses',
        category:    'infiltration',
        description: 'Revêtement en polymère souple sur les pivots mécaniques. +1 sur les jets de discrétion par mouvement.',
        optionHint:  null,
        tags: [
            { text: '+silencieux', variant: 'positive' },
        ],
    },

    // --- SENSORIEL & SOCIAL ---
    {
        name:        'Cyberoptiques (Kiroshi)',
        category:    'sensoriel',
        defects:     2,
        description: 'Yeux de remplacement avec capteurs multispectraux. Permet de lancer 2d10+Synth pour Évaluer.',
        optionHint:  null,
        tags: [
            { text: '+zoom', variant: 'positive' },
        ],
        // Options à choisir (spec_cyberpunk.md §9.7, réponses du 2026-11-07)
        tagChoices: [
            { label: 'Spécialisation', pick: 1, from: [
                { text: '+thermique', variant: 'positive' },
                { text: '+vision nocturne', variant: 'positive' },
                { text: '+anti-flash', variant: 'positive' },
                { text: '+analyseur de trajectoire', variant: 'positive' },
                { text: '+enregistrement', variant: 'positive' },
            ] },
        ],
    },
    {
        name:        'Cyberaudition',
        category:    'sensoriel',
        description: 'Système auditif filtrant les fréquences. Permet de lancer 2d10+Synth pour Évaluer.',
        optionHint:  null,
        tags: [
        ],
        // Options à choisir (spec_cyberpunk.md §9.7, réponses du 2026-11-07)
        tagChoices: [
            { label: 'Spécialisation', pick: 1, from: [
                { text: '+atténuation', variant: 'positive' },
                { text: '+sonar', variant: 'positive' },
                { text: '+enregistrement', variant: 'positive' },
                { text: '+crypté', variant: 'positive' },
            ] },
        ],
    },
    {
        name:        'Face-plate (Cale de visage)',
        category:    'infiltration',
        defects:     2,
        description: 'Plaques faciales mobiles permettant de changer de traits. +1 pour Usurper une identité ou passer Incognito.',
        optionHint:  null,
        tags: [
            { text: '+incognito', variant: 'positive' },
            { text: '+transformation', variant: 'neutral' },
        ],
    },
    {
        name:        'Synthétiseur Vocal (Audio-masque)',
        category:    'social',
        description: 'Modulateur de cordes vocales. Peut imiter n\'importe quelle voix enregistrée.',
        optionHint:  null,
        tags: [
            { text: '+imitation', variant: 'positive' },
        ],
    },
    {
        name:        'Peau Synthétique (Chemskin)',
        category:    'social',
        description: 'Peau capable de changer de couleur ou de texture. +1 sur les jets de Style ou de Séduction.',
        optionHint:  null,
        tags: [
            { text: '+style', variant: 'positive' },
            { text: '+charisme', variant: 'positive' },
        ],
        // Options à choisir (spec_cyberpunk.md §9.7, réponses du 2026-11-07)
        tagChoices: [
            { label: 'Effet', pick: 1, from: [
                { text: '+camouflage', variant: 'positive' },
                { text: '+motifs lumineux', variant: 'positive' },
                { text: '+chrome', variant: 'positive' },
            ] },
        ],
    },

    // --- UTILITAIRE & TECH ---
    {
        name:        'Neuralink & Comms',
        category:    'neural',
        description: 'Lien neuronal direct avec les réseaux. Permet de lancer 2d10+Synth pour Évaluer en situation tactique.',
        optionHint:  null,
        tags: [
        ],
        // Options à choisir (spec_cyberpunk.md §9.7, réponses du 2026-11-07)
        tagChoices: [
            { label: 'Fonctions', pick: 2, from: [
                { text: '+brouillage', variant: 'positive' },
                { text: '+relais satellite', variant: 'positive' },
                { text: '+crypté', variant: 'positive' },
                { text: '+partition cachée', variant: 'positive' },
                { text: '+enregistrement', variant: 'positive' },
            ] },
        ],
    },
    {
        name:        'Cyberconsole intégrée (Deck)',
        category:    'netrunning',
        defects:     2,
        description: 'Console de piratage greffée dans le crâne, impossible à confisquer. Sa mémoire interne stocke les daemons (extensible : +slots mémoire).',
        optionHint:  null,
        tags: [
        ],
        // Options à choisir (spec_cyberpunk.md §9.7, réponses du 2026-11-07)
        tagChoices: [
            { label: 'Modules', pick: 2, from: [
                { text: '+vitesse RAM', variant: 'positive' },
                { text: '+crypté', variant: 'positive' },
                { text: '+slots mémoire', variant: 'positive' },
                { text: '+furtif', variant: 'positive' },
            ] },
        ],
    },
    {
        name:        'Prise de console',
        category:    'netrunning',
        description: 'Prise dédiée implantée pour un deck externe : la prise du socle reste libre pour les chips. Le deck se confisque, se perd ou se casse.',
        optionHint:  null,
        tags: [
            { text: '+deck externe', variant: 'neutral' },
        ],
    },
    {
        name:        'Prise supplémentaire',
        category:    'neural',
        description: 'Seconde prise : deux chips insérées en même temps (le socle n\'en lit qu\'une).',
        optionHint:  null,
        tags: [
            { text: '+2 chips', variant: 'positive' },
        ],
    },
    {
        name:        'Lien de Pilotage (Interface)',
        category:    'technique',
        defects:     2,
        description: 'Prises neurales pour véhicules et drones. Permet de "devenir" la machine (Seconde Peau).',
        optionHint:  null,
        tags: [
            { text: '+connecté', variant: 'positive' },
            { text: '+1 Pilotage', variant: 'positive' },
        ],
    },
    {
        name:        'Poche de Rangement (Cargo)',
        category:    'infiltration',
        description: 'Espace de stockage dissimulé dans un membre. Indétectable aux scanners corporels.',
        optionHint:  null,
        tags: [
            { text: '+indétectable', variant: 'positive' },
            { text: '+inventaire', variant: 'neutral' },
        ],
    },
    {
        name:        'Enregistreur de Braindance',
        category:    'sensoriel',
        description: 'Capteur sensoriel total. Déclare que tu enregistres → gagne automatiquement [info] exploitable.',
        optionHint:  null,
        tags: [
            { text: '+enregistrement BD', variant: 'neutral' },
        ],
    },
];

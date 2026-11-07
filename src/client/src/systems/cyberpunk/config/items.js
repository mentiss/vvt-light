// src/client/src/systems/cyberpunk/config/items.js
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue du matos (ITEMS_ALL) et Cred de départ.
// Champs : voir catalog.js. Descriptions proposées le 2026-11-07, à corriger par le MJ. Prix (price), quantités (quantity) et défauts d'achat (negative_tags) : création seulement.
// ─────────────────────────────────────────────────────────────────────────────

// Cred donnée à la création, pour les achats de matos (§9.3)
export const STARTING_CRED = 5;

export const ITEMS_ALL = [
    // ── Armes à feu ──────────────────────────────────────────────────────────
    {
        name:     'Pistolet de poche',
        category: 'arme_feu',
        description: 'Petit calibre qui se glisse dans une manche ou une botte. Passe les fouilles rapides, pas les vraies.',
        tags: [
            { text: '2-dégâts',        variant: 'neutral'  },
            { text: '+contact/courte', variant: 'neutral'  },
            { text: '+discret',        variant: 'positive' },
            { text: '+rapide',         variant: 'positive' },
            { text: '+recharge',       variant: 'negative' },
            { text: '+bruyant',        variant: 'negative' },
        ],
        price: 1,
        quantity: 1,
        negative_tags: [
            { text: '+s\'enraille',    variant: 'negative' },
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Pistolet à fléchettes',
        category: 'arme_feu',
        description: 'Tire des fléchettes : silencieux à courte portée, idéal pour un poison ou un sédatif.',
        tags: [
            { text: '3-dégâts',        variant: 'neutral'  },
            { text: '+courte/proche',  variant: 'neutral'  },
            { text: '+rapide',         variant: 'positive' },
            { text: '+fléchettes',     variant: 'neutral'  },
        ],
        price: 1,
        quantity: 1,
        negative_tags: [
            { text: '+s\'enraille',    variant: 'negative' },
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Revolver léger',
        category: 'arme_feu',
        description: 'Six coups, increvable, ne s\'enraye jamais. Le choix de ceux qui n\'ont pas les moyens.',
        tags: [
            { text: '2-dégâts',       variant: 'neutral'  },
            { text: '+courte/proche', variant: 'neutral'  },
            { text: '+rapide',        variant: 'positive' },
            { text: '+recharge',      variant: 'negative' },
            { text: '+bruyant',       variant: 'negative' },
        ],
        price: 1,
        quantity: 1,
        negative_tags: [
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Pistolet semi-automatique',
        category: 'arme_feu',
        description: 'L\'arme de poing de tout le monde : fiable, rapide à recharger, facile à trouver.',
        tags: [
            { text: '2-dégâts',       variant: 'neutral'  },
            { text: '+courte/proche', variant: 'neutral'  },
            { text: '+rapide',        variant: 'positive' },
            { text: '+bruyant',       variant: 'negative' },
        ],
        price: 2,
        quantity: 1,
        negative_tags: [
            { text: '+s\'enraille',    variant: 'negative' },
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Revolver lourd',
        category: 'arme_feu',
        description: 'Gros calibre qui arrête un borg net. Lent à recharger, impossible à ignorer.',
        tags: [
            { text: '3-dégâts',       variant: 'neutral'  },
            { text: '+courte/proche', variant: 'neutral'  },
            { text: '+recharge',      variant: 'negative' },
            { text: '+bruyant',       variant: 'negative' },
        ],
        price: 2,
        quantity: 1,
        negative_tags: [
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Pistolet lourd',
        category: 'arme_feu',
        description: 'Arme de poing de gros calibre, chargeur court : de quoi faire taire une discussion.',
        tags: [
            { text: '3-dégâts',       variant: 'neutral'  },
            { text: '+courte/proche', variant: 'neutral'  },
            { text: '+bruyant',       variant: 'negative' },
        ],
        price: 2,
        quantity: 1,
        negative_tags: [
            { text: '+s\'enraille',    variant: 'negative' },
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Fusil à pompe',
        category: 'arme_feu',
        description: 'Dévastateur au contact, inutile au loin. Chaque tir se fait entendre dans tout le bloc.',
        tags: [
            { text: '3-dégâts',       variant: 'neutral'  },
            { text: '+courte/proche', variant: 'neutral'  },
            { text: '+carnage',       variant: 'neutral'  },
            { text: '+recharge',      variant: 'negative' },
            { text: '+bruyant',       variant: 'negative' },
        ],
        price: 3,
        quantity: 1,
        negative_tags: [
            { text: '+s\'enraille',    variant: 'negative' },
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Fusil de combat',
        category: 'arme_feu',
        description: 'Fusil à pompe automatique de gangs et de flics : nettoie une pièce en une rafale.',
        tags: [
            { text: '3-dégâts',       variant: 'neutral'  },
            { text: '+courte/proche', variant: 'neutral'  },
            { text: '+carnage',       variant: 'neutral'  },
            { text: '+automatique',   variant: 'neutral'  },
            { text: '+bruyant',       variant: 'negative' },
        ],
        price: 3,
        quantity: 1,
        negative_tags: [
            { text: '+s\'enraille',    variant: 'negative' },
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Fusil d\'assaut',
        category: 'arme_feu',
        description: 'Arme militaire automatique, efficace de proche à longue portée.',
        tags: [
            { text: '3-dégâts',        variant: 'neutral'  },
            { text: '+proche/longue',  variant: 'neutral'  },
            { text: '+automatique',    variant: 'neutral'  },
            { text: '+bruyant',        variant: 'negative' },
        ],
        price: 3,
        quantity: 1,
        negative_tags: [
            { text: '+s\'enraille',    variant: 'negative' },
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Pistolet-mitrailleur',
        category: 'arme_feu',
        description: 'Rafales compactes pour les couloirs et les voitures. Précision approximative.',
        tags: [
            { text: '2-dégâts',       variant: 'neutral'  },
            { text: '+courte/proche', variant: 'neutral'  },
            { text: '+automatique',   variant: 'neutral'  },
            { text: '+bruyant',       variant: 'negative' },
        ],
        price: 2,
        quantity: 1,
        negative_tags: [
            { text: '+s\'enraille',    variant: 'negative' },
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Mitrailleuse légère',
        category: 'arme_feu',
        description: 'Arme d\'appui qui tient une rue. Lourde, bruyante, gourmande en munitions.',
        tags: [
            { text: '3-dégâts',        variant: 'neutral'  },
            { text: '+proche/longue',  variant: 'neutral'  },
            { text: '+carnage',        variant: 'neutral'  },
            { text: '+automatique',    variant: 'neutral'  },
            { text: '+encombrant',     variant: 'negative' },
            { text: '+bruyant',        variant: 'negative' },
        ],
        price: 2,
        quantity: 1,
        negative_tags: [
            { text: '+s\'enraille',    variant: 'negative' },
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Fusil de précision',
        category: 'arme_feu',
        description: 'Lunette et gros calibre : une balle, une cible, très loin.',
        tags: [
            { text: '3-dégâts',        variant: 'neutral'  },
            { text: '+longue/extrême', variant: 'neutral'  },
            { text: '+encombrant',     variant: 'negative' },
            { text: '+bruyant',        variant: 'negative' },
        ],
        price: 4,
        quantity: 1,
        negative_tags: [
            { text: '+s\'enraille',    variant: 'negative' },
            { text: '+rouillé',        variant: 'negative' },
            { text: '+happy trigger',  variant: 'negative' },
        ]
    },
    {
        name:     'Fusil antichar',
        category: 'arme_feu',
        description: 'Perce les blindages de véhicules et les borgs lourds. Se porte à deux mains et ça se voit.',
        tags: [
            { text: '3-dégâts',        variant: 'neutral'  },
            { text: '+longue/extrême', variant: 'neutral'  },
            { text: '+carnage',        variant: 'neutral'  },
            { text: '+antiblindage',   variant: 'neutral'  },
            { text: '+encombrant',     variant: 'negative' },
            { text: '+bruyant',        variant: 'negative' },
        ],
    },
    {
        name:     'Lance-roquette',
        category: 'arme_feu',
        description: 'Explosif à répétition : véhicules, barricades, groupes serrés.',
        tags: [
            { text: '4-dégâts',       variant: 'neutral'  },
            { text: '+proche/longue', variant: 'neutral'  },
            { text: '+zone',          variant: 'neutral'  },
            { text: '+carnage',       variant: 'neutral'  },
            { text: '+encombrant',    variant: 'negative' },
            { text: '+bruyant',       variant: 'negative' },
        ],
    },
    {
        name:     'Lance-roquette usage unique',
        category: 'arme_feu',
        description: 'Tube jetable : un tir, puis on s\'en débarrasse.',
        tags: [
            { text: '4-dégâts',    variant: 'neutral'  },
            { text: '+proche',     variant: 'neutral'  },
            { text: '+zone',       variant: 'neutral'  },
            { text: '+carnage',    variant: 'neutral'  },
            { text: '+recharge',   variant: 'negative' },
            { text: '+bruyant',    variant: 'negative' },
        ],
    },

    // ── Grenades ─────────────────────────────────────────────────────────────
    {
        name:     'Grenades à fragmentation',
        category: 'grenade',
        description: 'Éclats sur toute une zone. Personne ne sort indemne d\'une pièce close.',
        tags: [
            { text: '4-dégâts',  variant: 'neutral'  },
            { text: '+proche',   variant: 'neutral'  },
            { text: '+zone',     variant: 'neutral'  },
            { text: '+carnage',  variant: 'neutral'  },
            { text: '+recharge', variant: 'negative' },
            { text: '+bruyant',  variant: 'negative' },
        ],
        price: 2,
        quantity: 3,
    },
    {
        name:     'Grenades incapacitantes',
        category: 'grenade',
        description: 'Flash et détonation : sonne tout le monde sans tuer.',
        tags: [
            { text: '+assommant', variant: 'neutral'  },
            { text: '+proche',    variant: 'neutral'  },
            { text: '+zone',      variant: 'neutral'  },
            { text: '+recharge',  variant: 'negative' },
            { text: '+bruyant',   variant: 'negative' },
        ],
        price: 1,
        quantity: 2,
    },
    {
        name:     'Grenades à gaz',
        category: 'grenade',
        description: 'Nuage assommant ou lacrymogène qui vide une pièce ; masque conseillé.',
        tags: [
            { text: '+assommant', variant: 'neutral'  },
            { text: '+proche',    variant: 'neutral'  },
            { text: '+zone',      variant: 'neutral'  },
            { text: '+gaz',       variant: 'neutral'  },
            { text: '+recharge',  variant: 'negative' },
        ],
        price: 1,
        quantity: 2,
    },

    // ── Armes blanches ───────────────────────────────────────────────────────
    {
        name:     'Couteau',
        category: 'arme_blanche',
        description: 'Lame courte, discrète, utile pour tout. On en a toujours un sur soi.',
        tags: [
            { text: '2-dégâts', variant: 'neutral' },
            { text: '+contact', variant: 'neutral' },
        ],
        price: 1,
        quantity: 1,
    },
    {
        name:     'Matraque',
        category: 'arme_blanche',
        description: 'Bâton, tonfa ou tuyau : pour frapper sans tuer, en théorie.',
        tags: [
            { text: '2-dégâts', variant: 'neutral' },
            { text: '+contact', variant: 'neutral' },
        ],
        price: 1,
        quantity: 1,
    },
    {
        name:     'Épée',
        category: 'arme_blanche',
        description: 'Lame longue d\'acier moderne, d\'apparat ou de combat.',
        tags: [
            { text: '3-dégâts', variant: 'neutral' },
            { text: '+contact', variant: 'neutral' },
            { text: '+carnage', variant: 'neutral' },
        ],
        price: 1,
        quantity: 1,
    },
    {
        name:     'Machette',
        category: 'arme_blanche',
        description: 'Lame lourde de jungle ou de rue : taille la végétation comme les membres.',
        tags: [
            { text: '3-dégâts', variant: 'neutral' },
            { text: '+contact', variant: 'neutral' },
            { text: '+carnage', variant: 'neutral' },
        ],
        price: 1,
        quantity: 1,
    },
    {
        name:     'Katana',
        category: 'arme_blanche',
        description: 'Lame forgée, souvent héritée, toujours entretenue. Dit quelque chose de son porteur.',
        tags: [
            { text: '3-dégâts', variant: 'neutral' },
            { text: '+contact', variant: 'neutral' },
            { text: '+carnage', variant: 'neutral' },
        ],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Taser',
        category: 'arme_blanche',
        description: 'Décharge électrique au contact : neutralise le temps d\'agir. Recharge entre deux usages.',
        tags: [
            { text: '+assommant', variant: 'neutral'  },
            { text: '+contact',   variant: 'neutral'  },
            { text: '+recharge',  variant: 'negative' },
        ],
        price: 1,
        quantity: 1,
    },
    {
        name:     'Fouet à monofilament',
        category: 'arme_blanche',
        description: 'Fil plus fin qu\'un cheveu au bout d\'un manche : tranche tout ce qu\'il touche, y compris son porteur maladroit.',
        tags: [
            { text: '4-dégâts',   variant: 'neutral'  },
            { text: '+contact',   variant: 'neutral'  },
            { text: '+carnage',   variant: 'neutral'  },
            { text: '+zone',      variant: 'neutral'  },
            { text: '+dangereux', variant: 'negative' },
        ],
        price: 3,
        quantity: 1,
    },
    {
        name:     'Shurikens ou lames de jet',
        category: 'arme_blanche',
        description: 'Petites lames à lancer, nombreuses et faciles à cacher.',
        tags: [
            { text: '2-dégâts', variant: 'neutral'  },
            { text: '+courte',  variant: 'neutral'  },
            { text: '+nombreux', variant: 'positive' },
        ],
        price: 1,
        quantity: 5,
    },

    // ── Protection ───────────────────────────────────────────────────────────
    {
        name:     'Vêtements renforcés',
        category: 'protection',
        description: 'Tenue de ville doublée de kevlar : passe partout, arrête peu.',
        tags: [
            { text: '0-armure',  variant: 'neutral'  },
            { text: '+discret',  variant: 'positive' },
        ],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Veste de protection',
        category: 'protection',
        description: 'Blouson ou manteau blindé : protège sans attirer l\'attention.',
        tags: [
            { text: '1-armure', variant: 'neutral' },
        ],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Gilet pare-balles',
        category: 'protection',
        description: 'Protection du torse, voyante sous une veste légère.',
        tags: [
            { text: '2-armure', variant: 'neutral' },
        ],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Armure militaire',
        category: 'protection',
        description: 'Plaques complètes : on la porte pour la guerre, pas pour un rendez-vous.',
        tags: [
            { text: '3-armure',    variant: 'neutral'  },
            { text: '+encombrant', variant: 'negative' },
        ],
        price: 5,
        quantity: 1,
    },

    {
        name:     'Sniffer Wi-Fi (Dongle)',
        category: 'equipement',
        description: 'Clé discrète qui repère et écoute les réseaux sans fil alentour.',
        tags: [
            { text: '+discret',          variant: 'positive' },
            { text: '+détection réseau', variant: 'neutral'  },
        ],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Injecteur de Virus physique',
        category: 'equipement',
        description: 'Se branche sur un port et injecte un programme : usage unique, accès garanti.',
        tags: [
            { text: '+usage unique',     variant: 'neutral'  },
            { text: '+1 continu piratage', variant: 'positive' },
            { text: '+furtif',           variant: 'positive' },
        ],
        price: 4,
        quantity: 1,
    },
    {
        name:     'Brouilleur de signal (Screamer)',
        category: 'equipement',
        description: 'Noie les communications et les capteurs d\'une zone. Tout le monde sait que quelqu\'un brouille.',
        tags: [
            { text: '+zone',             variant: 'neutral'  },
            { text: '+disruptif',        variant: 'positive' },
            { text: '+bruyant',          variant: 'negative' },
        ],
        price: 3,
        quantity: 1,
    },
    {
        name:     'Générateur de White Noise',
        category: 'equipement',
        description: 'Bruit blanc portatif : rend une conversation inaudible aux micros.',
        tags: [
            { text: '+discret',          variant: 'positive' },
            { text: '+anti-espionnage',  variant: 'positive' },
        ],
        price: 3,
        quantity: 1,
    },

    // ── Matériel d'Infiltration & Entrée ─────────────────────────────────────
    {
        name:     'Pistolet à grappin magnétique',
        category: 'equipement',
        description: 'Câble et ancre magnétique pour monter, descendre ou traverser vite.',
        tags: [
            { text: '+rapide',           variant: 'positive' },
            { text: '+utilitaire',       variant: 'neutral'  },
        ],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Découpeur thermique (Stylo)',
        category: 'equipement',
        description: 'Stylo à plasma qui ouvre une serrure ou une tôle en silence. Charge limitée.',
        tags: [
            { text: '+perforant',        variant: 'positive' },
            { text: '+silencieux',       variant: 'positive' },
            { text: '+consommable',      variant: 'negative' },
        ],
        price: 4,
        quantity: 1,
    },
    {
        name:     'Scanner biométrique de poche',
        category: 'equipement',
        description: 'Lit et copie empreintes, rétines et signatures pour tromper un contrôle.',
        tags: [
            { text: '+1 continu usurpation', variant: 'positive' },
        ],
        price: 3,
        quantity: 1,
    },
    {
        name:     'Balise traçante micro-adhésive',
        category: 'equipement',
        description: 'Mouchard grand comme un ongle : on le colle, on suit.',
        tags: [
            { text: '+discret',          variant: 'positive' },
            { text: '+tracé',            variant: 'neutral'  },
        ],
        price: 3,
        quantity: 2,
    },

    // ── Médical & Survie Avancée ──────────────────────────────────────────────
    {
        name:     'Airhypo (Injecteur rapide)',
        category: 'equipement',
        description: 'Injecteur sans aiguille : stimulant, antidote ou drogue en une seconde.',
        tags: [
            { text: '+rapide',           variant: 'positive' },
            { text: '+juiced',           variant: 'neutral'  },
        ],
        price: 3,
        quantity: 4,
    },
    {
        name:     'Masque à gaz filtrant',
        category: 'equipement',
        description: 'Filtre gaz, fumée et smog. Indispensable dans certains quartiers.',
        tags: [
            { text: '+protection gaz',   variant: 'positive' },
            { text: '+discret',          variant: 'positive' },
        ],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Sac à cadavre "Cryo"',
        category: 'equipement',
        description: 'Housse réfrigérée : garde un corps (ou un blessé) en état le temps de l\'emmener.',
        tags: [
            { text: '+encombrant',       variant: 'negative' },
            { text: '+convalescent',     variant: 'neutral'  },
            { text: '+préservation',     variant: 'positive' },
        ],
        price: 1,
        quantity: 1,
    },

    // ── Équipement ───────────────────────────────────────────────────────────

    {
        name:     'Kit d\'escalade',
        category: 'equipement',
        description: 'Cordes, mousquetons, gants : pour les toits et les façades.',
        tags: [],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Communicateur',
        category: 'equipement',
        description: 'Le portable à l\'ancienne : appels, messages, réseau. Non relié à la tête.',
        tags: [],
        price: 1,
        quantity: 1,
    },
    {
        name:     'Kit de déguisement',
        category: 'equipement',
        description: 'Maquillage, prothèses et accessoires pour devenir quelqu\'un d\'autre.',
        tags: [
            { text: '+1 continu identité', variant: 'positive' },
        ],
        price: 1,
        quantity: 1,
    },
    {
        name:     'Traumapatch',
        category: 'equipement',
        description: 'Patch médical d\'urgence : stoppe une hémorragie et stabilise.',
        tags: [
            { text: '+premiers soins', variant: 'positive' },
        ],
        price: 4,
        quantity: 3,
    },
    {
        name:     'Explosifs',
        category: 'equipement',
        description: 'Charges de démolition avec détonateurs : brèches, sabotage, effets spectaculaires.',
        tags: [
            { text: '+perforant',    variant: 'neutral'  },
            { text: '+carnage',      variant: 'neutral'  },
            { text: '+antiblindage', variant: 'neutral'  },
            { text: '+dangereux',    variant: 'negative' },
            { text: '+bruyant',      variant: 'negative' },
        ],
        price: 4,
        quantity: 1,
    },
    {
        name:     'Station de réparation microélectronique',
        category: 'equipement',
        description: 'Atelier portable pour réparer et bricoler l\'électronique sur le terrain.',
        tags: [
            { text: '+réparation terrain', variant: 'positive' },
        ],
        price: 5,
        quantity: 1,
    },
    {
        name:     'Matériel d\'enregistrement',
        category: 'equipement',
        description: 'Caméra, micro et stockage pour capter son et image, discrètement ou pas.',
        tags: [
            { text: '+enregistrement', variant: 'neutral' },
            { text: '+audio',          variant: 'neutral' },
            { text: '+vidéo',          variant: 'neutral' },
        ],
        price: 3,
        quantity: 1,
    },
    {
        name:     'Combinaison de plongée',
        category: 'equipement',
        description: 'Combinaison étanche et recycleur pour les eaux de la baie.',
        tags: [],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Silencieux',
        category: 'equipement',
        description: 'Se visse sur une arme à feu : retire +bruyant et ajoute +silencieux.',
        tags: [
            { text: 'retire +bruyant et ajoute +silencieux sur une arme à feu (vous pouvez supprimer l\'item après)', variant: 'positive' },
        ],
        price: 1,
        quantity: 1,
    },
    {
        name:     'Combinaison furtive',
        category: 'equipement',
        description: 'Tissu adaptatif qui atténue la silhouette et la signature thermique.',
        tags: [
            { text: '+discrétion', variant: 'positive' },
        ],
        price: 3,
        quantity: 1,
    },
    {
        name:     'Trousse spécialisée',
        category: 'equipement',
        description: 'Outillage d\'un métier précis (cybernétique, mécanique…) : 3 utilisations pour un bonus de spécialité.',
        tags: [
            { text: '3 utilisations',   variant: 'neutral'  },
            { text: '+1 jet spécialité', variant: 'positive' },
        ],
        price: 3,
        quantity: 1,
    },
    {
        name:     'Kit médical d\'urgence',
        category: 'equipement',
        description: 'Trousse complète de premiers soins pour le terrain.',
        tags: [
            { text: '+premiers soins',   variant: 'positive' },
        ],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Exosquelette gyroscopique',
        category: 'equipement',
        description: 'Harnais stabilisateur pour manier une arme lourde comme une légère.',
        tags: [
            { text: '+stabilisation arme lourde', variant: 'positive' },
            { text: '+encombrant',       variant: 'negative' },
        ],
        price: 4,
        quantity: 1,
    },
    {
        name:     'Salle de chirurgie portable',
        category: 'equipement',
        description: 'Bloc opératoire en caisses : soigner les blessures mortelles et poser du chrome. Pèse une tonne.',
        tags: [
            { text: '+blessures mortelles',  variant: 'positive' },
            { text: '+implantation cyberware', variant: 'positive' },
            { text: '+encombrant',           variant: 'negative' },
            { text: '+intransportable sans véhicule', variant: 'negative' },
        ],
    },
    {
        name:     'Dispositif d\'augmentation visuelle',
        category: 'equipement',
        description: 'Lunettes ou casque à zoom et vision nocturne, pour qui n\'a pas d\'optiques.',
        tags: [],
    },
    {
        name:     'Combinaison ailée',
        category: 'equipement',
        description: 'Wingsuit pour sauter d\'un toit et planer jusqu\'à un autre.',
        tags: [],
    },
    // ── Ajouts de la refonte de la création (spec_cyberpunk.md §9.3, §9.7) ──
    {
        name:     'Drogue',
        category: 'equipement',
        description: 'Substance de rue ou de labo ; sa nature et ses effets passent par ses tags.',
        // La nature de la drogue passe par ses tags (pas par le nom)
        tags: [],
        price: 2,
        quantity: 5,
    },
    {
        name:     'Kit d\'armurier',
        category: 'equipement',
        description: 'Outils et pièces pour entretenir, réparer et modifier les armes.',
        tags: [
            { text: '+réparation d\'armes', variant: 'positive' },
            { text: '+modifications',       variant: 'neutral'  },
        ],
    },
    {
        name:     'Deck externe',
        category: 'netrunning',
        description: 'Console de piratage portable, branchée sur la Prise de console. Se confisque, se vole, se casse.',
        // Branché sur la Prise de console ; sa mémoire stocke les daemons
        tags: [
            { text: '+confiscable', variant: 'negative' },
        ],
    },

    // ── Chips (lues par la prise du socle, une à la fois sans Prise supplémentaire) ──
    {
        name:     'Chip de comm',
        category: 'chip',
        description: 'Chip insérée dans la prise : communiquer par la tête, sans appareil. Occupe la prise.',
        tags: [
            { text: '+comm par la tête', variant: 'positive' },
            { text: '+occupe la prise',  variant: 'neutral'  },
        ],
    },
    {
        name:     'Chip de compétence',
        category: 'chip',
        description: 'Savoir-faire enregistré : +1 continu dans sa compétence tant qu\'elle est insérée.',
        tags: [
            { text: '+1 continu tant qu\'elle est insérée', variant: 'positive' },
        ],
        tagChoices: [
            { label: 'Compétence', pick: 1, from: [
                { text: '+karaté',         variant: 'neutral' },
                { text: '+pilotage',       variant: 'neutral' },
                { text: '+armes de poing', variant: 'neutral' },
                { text: '+piratage',       variant: 'neutral' },
                { text: '+premiers soins', variant: 'neutral' },
                { text: '+langue',         variant: 'neutral' },
            ] },
        ],
        price: 6,
        quantity: 1,
    },
    {
        name:     'Chip daemon',
        category: 'chip',
        description: 'Programme daemon sur chip : 3 utilisations, ou copié dans la mémoire d\'une console avec Extraire des données.',
        // Limitée en utilisations ; Extraire des données peut la copier dans la mémoire d'une console (Q-C25, Q-C28)
        tags: [
            { text: '3 utilisations', variant: 'neutral' },
        ],
        tagChoices: [
            { label: 'Daemon', pick: 1, from: 'daemons' },
        ],
        price: 4,
        quantity: 1,
    },
    // ── Véhicules ─────────────────────────────────────────────────────────────
    {
        name:     'Moto',
        category: 'vehicule',
        description: 'Deux roues nerveuses pour se faufiler dans le trafic. Aucune protection.',
        tags: [
            { text: '+rapide',      variant: 'positive' },
            { text: '+nerveux',     variant: 'positive' },
            { text: '+exigu',       variant: 'negative' },
            { text: '0-armure',     variant: 'neutral'  },
        ],
        price: 4,
        quantity: 1,
    },
    {
        name:     'Voiture',
        category: 'vehicule',
        description: 'Berline banale et fiable : on y tient à quatre et on ne la remarque pas.',
        tags: [
            { text: '+fiable',      variant: 'positive' },
            { text: '+spacieux',    variant: 'positive' },
            { text: '1-armure',     variant: 'neutral'  },
        ],
        price: 4,
        quantity: 1,
    },
    {
        name:     'Voiture de course',
        category: 'vehicule',
        description: 'Très rapide, très chère, très fragile.',
        tags: [
            { text: '+rapide',      variant: 'positive' },
            { text: '+performant',  variant: 'positive' },
            { text: '+fragile',     variant: 'negative' },
            { text: '0-armure',     variant: 'neutral'  },
        ],
        price: 4,
        quantity: 1,
    },
    {
        name:     'Voiture blindée',
        category: 'vehicule',
        description: 'Véhicule de convoi ou de VIP : lente, mais les balles rebondissent.',
        tags: [
            { text: '+robuste',     variant: 'positive' },
            { text: '+blindé',      variant: 'positive' },
            { text: '+lent',        variant: 'negative' },
            { text: '2-armure',     variant: 'neutral'  },
        ],
        price: 4,
        quantity: 1,
    },
    {
        name:     'Van utilitaire',
        category: 'vehicule',
        description: 'Fourgon passe-partout pour le matériel, l\'équipe ou une planque roulante.',
        tags: [
            { text: '+spacieux',    variant: 'positive' },
            { text: '+fiable',      variant: 'positive' },
            { text: '+quelconque',  variant: 'neutral'  },
            { text: '1-armure',     variant: 'neutral'  },
        ],
        price: 4,
        quantity: 1,
    },
    {
        name:     'Camion lourd',
        category: 'vehicule',
        description: 'Poids lourd qui passe à travers à peu près tout. Gourmand et lent.',
        tags: [
            { text: '+immense',     variant: 'neutral'  },
            { text: '+robuste',     variant: 'positive' },
            { text: '+lent',        variant: 'negative' },
            { text: '+gourmand',    variant: 'negative' },
            { text: '2-armure',     variant: 'neutral'  },
        ],
    },
    {
        name:     'AV (Aérovéhicule)',
        category: 'vehicule',
        description: 'Véhicule volant à décollage vertical : rapide, mais voyant et réservé aux corpos.',
        tags: [
            { text: '+rapide',   variant: 'positive' },
            { text: '+voyant',   variant: 'negative' },
            { text: '+corpo',    variant: 'negative' },
            { text: '1-armure',  variant: 'neutral'  },
        ],
    },
    {
        name:     'Aéroglisseur',
        category: 'vehicule',
        description: 'Passe sur l\'eau, la boue et les terrains vagues. Bruyant.',
        tags: [
            { text: '+rapide',      variant: 'positive' },
            { text: '+tout-terrain',variant: 'positive' },
            { text: '+bruyant',     variant: 'negative' },
            { text: '0-armure',     variant: 'neutral'  },
        ],
    },
    {
        name:     'Bateau rapide',
        category: 'vehicule',
        description: 'Vedette pour la baie et les canaux. Capricieuse.',
        tags: [
            { text: '+rapide',      variant: 'positive' },
            { text: '+nerveux',     variant: 'positive' },
            { text: '+capricieux',  variant: 'negative' },
            { text: '0-armure',     variant: 'neutral'  },
        ],
    },

    // ── Drones ────────────────────────────────────────────────────────────────
    {
        name:     'Drone de surveillance',
        category: 'drone',
        description: 'Petit drone à rotors, discret, avec zoom : un œil au-dessus de la scène.',
        tags: [
            { text: '+menu',        variant: 'neutral'  },
            { text: '+rotor',       variant: 'neutral'  },
            { text: '+furtif',      variant: 'positive' },
            { text: '+zoom',        variant: 'positive' },
            { text: '+fragile',     variant: 'negative' },
        ],
        price: 3,
        quantity: 1,
    },
    {
        name:     'Drone de combat léger',
        category: 'drone',
        description: 'Drone armé de taille standard : appui feu léger, voyant et bruyant.',
        tags: [
            { text: '+standard',    variant: 'neutral'  },
            { text: '+rotor',       variant: 'neutral'  },
            { text: '+armé',        variant: 'positive' },
            { text: '+2-dégâts',    variant: 'neutral'  },
            { text: '+bruyant',     variant: 'negative' },
            { text: '+voyant',      variant: 'negative' },
        ],
        price: 4,
        quantity: 1,
    },
    {
        name:     'Drone de reconnaissance',
        category: 'drone',
        description: 'Drone minuscule à caméra thermique : se glisse partout, casse vite.',
        tags: [
            { text: '+minuscule',   variant: 'neutral'  },
            { text: '+rotor',       variant: 'neutral'  },
            { text: '+furtif',      variant: 'positive' },
            { text: '+thermographique', variant: 'positive' },
            { text: '+fragile',     variant: 'negative' },
        ],
        price: 3,
        quantity: 1,
    },
    {
        name:     'Drone terrestre',
        category: 'drone',
        description: 'Robot à chenilles, robuste et tout-terrain. Lent.',
        tags: [
            { text: '+standard',    variant: 'neutral'  },
            { text: '+chenilles',   variant: 'neutral'  },
            { text: '+robuste',     variant: 'positive' },
            { text: '+tout-terrain',variant: 'positive' },
            { text: '+lent',        variant: 'negative' },
        ],
        price: 2,
        quantity: 1,
    },
    {
        name:     'Drone sous-marin',
        category: 'drone',
        description: 'Drone aquatique furtif à sonar, pour inspecter coques et quais.',
        tags: [
            { text: '+standard',    variant: 'neutral'  },
            { text: '+aquatique',   variant: 'neutral'  },
            { text: '+furtif',      variant: 'positive' },
            { text: '+sonar',       variant: 'positive' },
            { text: '+peu fiable',  variant: 'negative' },
        ],
    },
    {
        name:     'Drone lourd armé',
        category: 'drone',
        description: 'Grand drone de combat : une vraie arme volante, impossible à rater ni à cacher.',
        tags: [
            { text: '+grand',       variant: 'neutral'  },
            { text: '+rotor',       variant: 'neutral'  },
            { text: '+armé',        variant: 'positive' },
            { text: '+3-dégâts',    variant: 'neutral'  },
            { text: '+voyant',      variant: 'negative' },
            { text: '+bruyant',     variant: 'negative' },
        ],
    },
];

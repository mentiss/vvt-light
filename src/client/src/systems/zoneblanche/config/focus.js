// src/client/src/systems/zoneblanche/config/focus.js
// Catalogue Focus complet (cf. spec §6) — 6 par Compétence, 24 au total.
// Picklist UI à la création / attribution : le stockage reste texte libre
// (character_focus.texte) ; ce catalogue ne fait que préremplir le choix.

export const FOCUS_CATALOG = {
    investigation: [
        { nom: 'Œil de lynx',                 description: "Détecter un détail physique anormal qui sort du cadre de l'environnement. Trouver l'élément qui ne devrait pas être là." },
        { nom: 'Indices paranormaux',         description: "Reconnaître et localiser des traces d'activité paranormale dans un environnement (cercles de sel, symboles, objets déplacés, marques rituelles)." },
        { nom: 'Criminologie',                description: "Reconstitution d'un événement passé sur une scène, lecture de traces d'activité humaine." },
        { nom: 'Recherche documentaire',      description: "Exploitation de sources sur le lieu ou l'événement (archives, web, témoignages écrits)." },
        { nom: 'Observation comportementale', description: 'Lire les réactions et attitudes des personnes présentes en temps réel.' },
        { nom: 'Écoute active',               description: 'Percevoir des anomalies acoustiques, sons anormaux, voix ou murmures dans un lieu.' },
    ],
    operation: [
        { nom: 'Captation',                   description: "Maîtrise de la caméra et du son en conditions difficiles. Permet de saisir le bon angle, d'isoler une source sonore ou de capturer un événement fugace avant qu'il disparaisse." },
        { nom: 'Drone',                       description: "Pilotage en environnement contraint (couloirs étroits, hauteurs, zones inaccessibles). Permet d'explorer et de documenter des espaces où l'équipe ne peut pas se rendre physiquement." },
        { nom: "Relevé d'anomalies",          description: "Utilisation et interprétation des instruments de mesure (EMF, thermomètres, hygromètres). Permet de détecter et quantifier des perturbations physiques dans un environnement." },
        { nom: 'Communication paranormale',   description: "Maîtrise des outils de contact avec les entités (spirit box, EVP recorder, table de Ouija). Permet d'établir ou d'interpréter un signal dans le bruit." },
        { nom: 'Spectrographie',              description: "Exploitation des caméras thermiques, infrarouges et de vision nocturne. Permet de percevoir et documenter ce que l'œil nu ne peut pas voir." },
        { nom: 'Logistique',                  description: "Installation, câblage et gestion du matériel sur le terrain. Permet d'anticiper les besoins, de sécuriser un dispositif de surveillance ou de pallier une défaillance technique." },
    ],
    deplacement: [
        { nom: 'Discrétion',  description: "Se déplacer sans bruit, sans être vu, sans perturber l'environnement. Permet d'observer une situation sans l'influencer ou de traverser un espace sensible sans alerter." },
        { nom: 'Orientation', description: "Conserver son sens de l'espace et de la direction dans un environnement inconnu ou dégradé. Permet de ne pas se perdre, de mémoriser un plan, de retrouver son chemin en cas de panique ou d'obscurité totale." },
        { nom: 'Réactivité',  description: "Gérer son corps et ses mouvements dans l'urgence. Permet de réagir physiquement à un événement soudain, qu'il soit paranormal ou simplement dangereux." },
        { nom: 'Intérieur',   description: "Être à l'aise pour se déplacer en bâtiment, quel que soit son état (habité, abandonné, en ruine). Permet de se mouvoir efficacement dans des espaces clos, couloirs, escaliers ou pièces encombrées." },
        { nom: 'Extérieur',   description: "Être à l'aise pour se déplacer en environnement naturel ou non-bâti (forêt, cimetière, terrain vague, ruines à ciel ouvert). Permet de se mouvoir efficacement sur un sol irrégulier, dans la végétation ou à découvert." },
        { nom: 'Endurance',   description: "Maintenir sa mobilité et son efficacité sur la durée. Permet de rester opérationnel après plusieurs heures de tournage éprouvant, dans le froid, l'obscurité ou le stress." },
    ],
    esoterisme: [
        { nom: 'Occultisme',    description: "Connaissance pratique et théorique des arts occultes : entités, hiérarchies démoniaques, symboles et rituels magiques. Permet d'identifier une pratique, une invocation ou une présence par ses signes caractéristiques." },
        { nom: 'Psychométrie',  description: "Capacité à lire l'histoire émotionnelle et spirituelle d'un objet ou d'un lieu par le contact physique. Permet de percevoir des événements passés ou des empreintes laissées par des présences." },
        { nom: 'Rites sacrés',  description: "Maîtrise des pratiques religieuses de protection et de bannissement : prières, objets sacrés, imposition des mains, exorcisme. Permet d'intervenir activement face à une entité ou de purifier un espace." },
        { nom: 'Radiesthésie',  description: "Utilisation du pendule et mesure d'énergie bovis pour détecter des flux énergétiques, des présences ou des anomalies dans un espace." },
        { nom: 'Sixième sens',  description: 'Perception innée et passive de signaux paranormaux. Permet de ressentir une présence, une intention ou une anomalie sans instrument ni pratique délibérée.' },
        { nom: 'Voyance',       description: 'Pratique active de consultation (boule de cristal, tarots, communication avec les morts). Permet d’obtenir des informations sur une entité, un événement passé ou à venir.' },
    ],
};
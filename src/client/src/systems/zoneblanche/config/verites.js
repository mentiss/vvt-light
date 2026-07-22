// src/client/src/systems/zoneblanche/config/verites.js
// Catalogue Vérités complet (cf. spec §8) — pools fixes de 6 par archétype.
// Picklist UI à la création : le stockage reste texte libre (character_verites),
// ce catalogue ne fait que préremplir le choix. "Sur mesure" reste toujours
// possible (validation MJ), non représenté ici.

export const VERITES_CATALOG = {
    animateur: [
        { nom: 'Visage connu du PAF',        description: "Vingt ans d'antenne, tout le monde l'a déjà vu quelque part. Les portes s'ouvrent, les témoins se détendent." },
        { nom: 'Ancien reporter de guerre',  description: 'Sang-froid sous pression, terrain hostile, images tournées dans des conditions impossibles, contacts dans la presse.' },
        { nom: "Créateur de l'émission",     description: "Le concept, c'est le sien. Il l'a vendu, défendu, incarné depuis le pilote." },
        { nom: 'Enfant du sérail',           description: 'A grandi dans les coulisses de la télé. Connaît tout le monde dans le métier.' },
        { nom: 'Une communauté fidèle',      description: "Des centaines de milliers d'abonnés qui répondent présents : appels à témoins, archives introuvables, soutien public." },
        { nom: 'Ancien de la libre antenne', description: "Des années de radio nocturne à écouter des inconnus raconter leurs peurs. Sait faire parler n'importe qui, tenir l'antenne seul, reconnaître un mytho en trente secondes." },
    ],
    guest_star: [
        { nom: 'Sportif de haut niveau',        description: 'Condition physique, discipline, gestion du stress et de la douleur, habitude des médias.' },
        { nom: 'A grandi dans une maison hantée', description: "Familiarité d'enfance avec les phénomènes, aucune panique face à l'inexpliqué, vocabulaire vécu pour en parler avec les témoins." },
        { nom: 'Chouchou du public',            description: 'Capital sympathie énorme : les témoins se confient, les sceptiques baissent la garde, un appel à témoins fonctionne toujours.' },
        { nom: "Vedette d'un autre temps",      description: 'Tout le monde de plus de 40 ans le reconnaît. Nostalgie mobilisable, vieux réseau du showbiz, habitude des plateaux.' },
        { nom: "Reconverti dans l'humanitaire", description: 'Des années de missions ONG : terrain difficile, contact avec des populations méfiantes, logistique de crise.' },
        { nom: 'Influenceur du web',            description: 'Communauté mobilisable en direct, maîtrise de l\'image et du montage, appels à témoins qui tournent en quelques heures, habitude de se filmer seul dans le noir.' },
    ],
    ingenieur: [
        { nom: 'Ingénieur sénior',                         description: 'Vingt ans de métier, les certifications, les réflexes.' },
        { nom: 'Ancien de la sécurité industrielle',       description: "Des années à auditer des sites à risque : normes, points de défaillance, procédures d'urgence." },
        { nom: 'Autodidacte de génie',                     description: "Pas de diplôme, mais a démonté et remonté tout ce qui lui est passé entre les mains depuis l'enfance." },
        { nom: "Membre de l'équipe depuis la saison 1",    description: "Connaît l'émission, ses coulisses, ses légendes internes et tout le monde sur le plateau." },
        { nom: 'Réseau de fournisseurs et de récupérateurs', description: 'Sait toujours où trouver une pièce, même rare, même à 3h du matin, même dans une ville inconnue.' },
        { nom: 'Ancien du broadcast',                       description: "A fait ses armes dans la télé en direct, où une panne à l'antenne n'est pas une option. Le stress technique, c'est son élément." },
    ],
    operateur: [
        { nom: 'Cadreur de guerre',                     description: 'A filmé des zones de conflit. Une maison qui craque la nuit, ça ne fait pas trembler la caméra.' },
        { nom: "Passionné d'urbex",                     description: 'Lecture des bâtiments abandonnés, repérage des dangers structurels, culture des lieux "hantés" et de leur communauté.' },
        { nom: "Membre de l'équipe depuis la saison 1", description: "L'émission, ses coulisses, ses légendes internes : il était là avant tout le monde." },
        { nom: 'Pompier volontaire',                    description: 'Secourisme, lecture des bâtiments dangereux, sang-froid en urgence, respect instantané des autorités locales.' },
        { nom: "Baroudeur de l'extrême",                description: 'A cadré des documentaires en jungle, désert, haute montagne : autonomie totale, matériel en conditions dégradées, endurance aux tournages qui durent.' },
        { nom: 'Le regard que les réalisateurs s\'arrachent', description: "Réputation établie dans le métier : quand il dit qu'un plan est bon, il est bon. Son nom au générique est une garantie." },
    ],
    scientifique: [
        { nom: 'Docteur en physique',           description: 'Thèse, publications, rigueur académique. Le titre impressionne les témoins et agace les sceptiques de salon.' },
        { nom: 'Expert judiciaire',              description: "Méthodes forensiques, crédibilité légale, contacts aux tribunaux, habitude du rapport qui engage." },
        { nom: 'Chasseur de fraudes',            description: 'A démonté publiquement des médiums de plateau, des photos truquées, des maisons hantées touristiques. Certains s\'en souviennent.' },
        { nom: 'Accès aux archives universitaires', description: 'Cartes anciennes, thèses oubliées, fonds documentaires fermés au public : son badge ouvre encore ces portes.' },
        { nom: 'Vulgarisateur suivi',            description: 'Chaîne/podcast science à forte audience : sait expliquer simplement, communauté mobilisable, crédibilité publique face aux témoins.' },
        { nom: 'Élevé par des parents "croyants"', description: "Spiritisme, tables tournantes, pendules à la maison. Est devenu scientifique contre ça — mais connaît ce monde de l'intérieur." },
    ],
    producteur: [
        { nom: 'Vingt ans de télévision',                description: 'A produit du flux, du documentaire, du direct. Sait ce qui fait tenir une émission — et ce qui la tue.' },
        { nom: 'Ancien producteur de faits divers',      description: 'A couvert les affaires les plus sombres du pays. A des restes : contacts, archives, instinct du récit vrai.' },
        { nom: 'Patron de sa boîte de production',       description: 'Pouvoir de décision immédiat sur le tournage, connaissance des contrats/assurances/autorisations, personnel à disposition.' },
        { nom: 'Un carnet d\'adresses en or',            description: 'Chaînes, distributeurs, attachés de presse, avocats du milieu : une vie de networking télévisuel.' },
        { nom: 'A enterré une émission concurrente',     description: "Connaît l'équipe d'en face, leurs méthodes, leurs trucages — et ce qu'ils ont vraiment filmé avant d'arrêter." },
        { nom: 'Petit-fils de rebouteux',                description: 'Dans sa famille, on "tirait le feu" et on désenvoûtait les bêtes. Il n\'y croit pas. Mais il connaît les gestes, les mots, les usages.' },
    ],
    medium: [
        { nom: 'Magnétiseur de campagne',              description: 'Les gens de sa région viennent le voir depuis toujours : clientèle fidèle, réseau rural, connaissance des traditions locales de guérison.' },
        { nom: 'Consultant réputé',                     description: 'Des années de cabinet : particuliers endeuillés, familles inquiètes, parfois des gens très haut placés qui ne veulent pas que ça se sache.' },
        { nom: 'Mort deux minutes',                     description: 'Accident, arrêt cardiaque, réanimation. Un état permanent en est resté : crédibilité totale auprès des endeuillés, connaissance intime de "l\'autre côté", dossier médical qui atteste.' },
        { nom: 'Élevé dans une tradition spirituelle',  description: 'Cercles, séances, correspondances avec des médiums du monde entier : toute une culture héritée, avec ses réseaux encore vivants.' },
        { nom: 'A travaillé avec la police',            description: 'Officieusement, sur des disparitions. Certains enquêteurs le rappellent encore. D\'autres le détestent.' },
        { nom: "Auteur sur l'au-delà",                  description: 'Livres publiés, salons, courrier de lecteurs : documentation accumulée, notoriété dans le milieu, témoignages reçus de toute la France.' },
    ],
    exorciste: [
        { nom: 'Ordonné, puis écarté',                    description: 'Prêtre formé à l\'exorcisme par l\'Église, mis à l\'écart pour avoir pris "trop au sérieux" un cas. N\'a jamais rendu son col.' },
        { nom: 'Formé à Rome',                            description: 'A suivi le vrai cursus, celui dont on ne parle pas : théologie, discernement, protocoles du rituel romain.' },
        { nom: 'Héritier d\'une lignée de désenvoûteurs', description: 'Dans sa région, sa famille "faisait ça" depuis des générations. Les gens du pays viennent encore frapper à sa porte.' },
        { nom: 'Consultant officieux du diocèse',         description: "L'Église ne le reconnaît pas publiquement, mais quand un cas déborde, c'est son téléphone qui sonne." },
        { nom: 'Vingt ans de cas documentés',             description: 'Des dossiers constitués sur chaque intervention : archive personnelle de cas comparables, familles reconnaissantes qu\'on peut recontacter, expérience des schémas récurrents.' },
        { nom: "Bibliothèque d'ouvrages interdits",       description: "Une collection unique de traités, rituels et correspondances, accumulée par sa lignée ou rachetée pièce par pièce." },
    ],
};
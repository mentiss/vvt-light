// src/client/src/systems/cyberpunk/config/reference.js
// ─────────────────────────────────────────────────────────────────────────────
// Listes de l'aide de jeu (contacts, spécialisations, daemons, expertises) :
// une seule source pour l'onglet Référence et la création.
// ─────────────────────────────────────────────────────────────────────────────

// [libellé, description]. Contacts : par playbook (Investigator = informateurs).
const SOLO_CONTACTS = [
    ['Fixeur de terrain', 'Missions, mises en relation, info sur les contrats disponibles'],
    ['Armurier black market', 'Armes non traçables, munitions spéciales, modifications'],
    ['Ripperdoc discret', 'Soins sans questions, chrome hors circuit officiel'],
    ['Mercenaire freelance', 'Appui tactique, muscle de confiance, couverture'],
    ['Informateur corpo', 'Mouvements de sécurité, agendas internes, cibles'],
    ['Passeur / exfiltrateur', 'Extraction rapide, routes de fuite, faux papiers'],
    ['Faussaire', 'Identités, accréditations, documents officiels'],
    ['Technicien en surveillance', 'Pose de matos, contre-surveillance, écoutes'],
];

export const REFERENCE_LISTS = {
    contacts: {
        Assassin: [
            ['Armurier black market', 'Fournisseur d\'armes non traçables et munitions spéciales'],
            ['Agent corpo (choisir)', 'Informateur interne, accès aux données et mouvements internes'],
            ['Agent fédéral NUSA', 'Accès aux rouages officiels, zones grises légales'],
            ['Faussaire', 'Identités, documents, accréditations biométriques'],
            ['Cleaner', 'Effacement de scène, élimination de traces et de corps'],
            ['Receleur', 'Écoule le matériel chaud, source de matos de récup'],
            ['Broker', 'Intermédiaire en contrats, connaît tout le monde sans être connu'],
            ['Ripperdoc discret', 'Soins sans questions, chrome hors circuit officiel'],
            ['Passeur', 'Exfiltration, frontières, transports fantômes'],
            ['Informateur de rue', 'Oreilles dans les bas-fonds, sait qui bouge quoi et où'],
        ],
        // Proche du Solo (Q-C24), à ajuster par le MJ
        Edgerunner: [
            ...SOLO_CONTACTS.filter(([name]) => name !== 'Technicien en surveillance'),
            ['Ancien frère d\'armes', 'Appui de confiance, souvenirs de terrain partagés, dettes de sang'],
            ['Logisticien militaire', 'Surplus, munitions, matériel lourd sorti des stocks'],
        ],
        Fixer: [
            ['Avocat véreux', 'Contrats, zones grises légales, protections judiciaires'],
            ['Agent corpo (choisir)', 'Informateur interne, fuites de données, accès privilégiés'],
            ['Banquier offshore', 'Blanchiment, transferts discrets, financement'],
            ['Journaliste corrompu', 'Manipulation de l\'info, enterrer ou sortir un scoop'],
            ['Officiel NUSA', 'Accès aux rouages politiques et administratifs'],
            ['Receleur', 'Écoule le matériel chaud, source de matos rare'],
            ['Chef de gang', 'Accès aux territoires, muscle disponible, info de rue'],
            ['Ripperdoc discret', 'Soins et chrome hors circuit, sans questions'],
            ['Broker indépendant', 'Mise en contact entre parties, arbitrage de deals'],
            ['Passeur', 'Exfiltration, transport fantôme, franchissement de frontières'],
        ],
        Investigator: [
            ['Ancien collègue flic', 'Accès aux dossiers, archives et procédures officielles'],
            ['Légiste / médecin légiste', 'Causes de mort, analyses, dossiers médicaux confidentiels'],
            ['Indic de rue', 'Info des bas-fonds, mouvements de gangs, rumeurs'],
            ['Journaliste d\'investigation', 'Croisement de sources, dossiers enterrés, contacts médias'],
            ['Avocat', 'Accès aux dossiers judiciaires, contacts dans le système'],
            ['Technicien forensique', 'Analyses techniques, preuves numériques, traces physiques'],
            ['Agent corpo retourné', 'Fuites internes, mouvements et décisions corporatifs'],
            ['Passeur / contact underground', 'Accès aux milieux que la loi ne voit pas'],
        ],
        Media: [
            ['Rédacteur en chef indépendant', 'Diffusion large, protection journalistique, réseau médias'],
            ['Agent corpo communication', 'Fuites contrôlées, accès aux communiqués internes'],
            ['Activiste / lanceur d\'alerte', 'Sources sensibles, documents compromettants'],
            ['Officiel NUSA', 'Accès aux déclarations officielles et aux coulisses politiques'],
            ['Hacker / data broker', 'Données volées, preuves numériques, identités cachées'],
            ['Avocat spécialisé presse', 'Protection légale, injonctions, liberté de publication'],
            ['Fixeur médiatique', 'Accès aux zones de conflit, contacts terrain'],
            ['Informateur corpo', 'Fuites internes, scandales à venir'],
        ],
        Nomad: [
            ['Chef de clan allié', 'Ressources, refuges, réseau nomad étendu'],
            ['Mécanicien itinérant', 'Pièces rares, réparations discrètes, véhicules modifiés'],
            ['Contrebandier', 'Marchandises hors circuit, passages secrets, transport discret'],
            ['Passeur de frontière', 'Franchissement de checkpoints, routes alternatives'],
            ['Fournisseur de carburant', 'Approvisionnement en zones isolées, dépôts cachés'],
            ['Receleur de pièces', 'Matériel de récup, équipement militaire surplus'],
            ['Informateur des Badlands', 'Mouvements de troupes, activité corpo hors des villes'],
            ['Ripperdoc de route', 'Soins en conditions de terrain, chrome sans traçabilité'],
        ],
        Rockerboy: [
            ['Producteur indépendant', 'Diffusion, financement, accès aux scènes underground'],
            ['Journaliste alternatif', 'Couverture médiatique, amplification du message'],
            ['Agitateur politique', 'Réseau militant, mobilisation, contacts dans les mouvements'],
            ['Chef de gang culturel', 'Territoire, protection, base de fans dans les rues'],
            ['Receleur de substances', 'Approvisionnement discret, réseau de distribution'],
            ['Avocat spécialisé artistes', 'Protection légale, contrats, litiges avec les corpos'],
            ['Technicien son/lumière', 'Accès aux équipements, sabotage ou mise en scène'],
            ['Fixeur de concerts', 'Lieux alternatifs, organisation d\'événements off-grid'],
        ],
        Solo: SOLO_CONTACTS,
    },
    specialisations: [
        ['Démolition', 'Explosifs, brèches, destruction contrôlée'],
        ['Combat rapproché / CQC', 'Neutralisation silencieuse, combat au corps à corps'],
        ['Tir de précision', 'Engagement longue distance, positions de tir'],
        ['Commandement de terrain', 'Leadership sous feu, coordination en conditions dégradées'],
        ['Infiltration tactique', 'Pénétration de périmètres sécurisés, extraction discrète'],
        ['Guerre électronique', 'Brouillage, interception, disruption des communications'],
        ['Médecine de combat', 'Stabilisation en conditions de terrain, triage'],
        ['Pilotage sous pression', 'Véhicules terrestres et aériens en situation critique'],
    ],
    daemons: [
        ['Daemon briseur de glace', 'Réduit ou annule le coût en retenues pour briser une ICE'],
        ['Daemon caméra', 'Réduit ou annule le coût pour couper les caméras'],
        ['Daemon fantôme', 'Réduit ou annule le coût pour passer inaperçu dans un système'],
        ['Daemon de verrouillage', 'Réduit ou annule le coût pour verrouiller / déverrouiller un accès'],
        ['Daemon offensif', 'Réduit ou annule le coût pour bloquer une routine de sécurité'],
        ['Daemon de localisation', 'Réduit ou annule le coût pour localiser un fichier ou une personne'],
        ['Daemon d\'extraction', 'Réduit ou annule le coût sur Extraire des données'],
        ['Daemon de contre-mesure', 'Réduit ou annule le coût sur Contre-mesures'],
    ],
    expertises: [
        ['Armurier', 'Armes, munitions, modifications balistiques'],
        ['Artificier', 'Explosifs, pièges, détonateurs, charges'],
        ['Cybernéticien', 'Cyberware, interfaces neurales, prothèses'],
        ['Électronicien', 'Systèmes électroniques, circuits, drones'],
        ['Mécano', 'Véhicules, moteurs, systèmes mécaniques'],
        ['Médecin', 'Soins, chirurgie, pharmacologie, stabilisation'],
    ],
};

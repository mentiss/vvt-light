// src/client/src/systems/zoneblanche/config/equipment.js
// Catalogue Matériel complet (cf. spec §12) — purement narratif, aucun bonus
// chiffré. Picklist UI pour l'ajout au pool de session ; le stockage runtime
// vit en base (session_equipment_pool).
//
// Chaque item porte une CLÉ EXPLICITE (`key`), stockée telle quelle en base
// (item_key) — jamais dérivée d'un index ou d'un libellé.
//
// Les tarifs dégressifs ne sont pas une mécanique : ce sont simplement des
// entrées de catalogue distinctes (« Lot de 4 K2 » a son propre prix). Aucun
// calcul particulier, aucune colonne supplémentaire en base.
//
// piecesMaitresses : information de CONTENU, pas une exclusion. Elle précise
// ce que le kit NE contient PAS et qu'il faut donc acheter à part. Acheter le
// kit et la pièce maîtresse est parfaitement normal.

export const EQUIPMENT_CATALOG = {
    detection_mesure: {
        label: 'Détection & mesure',
        items: [
            { key: 'k2',                 nom: 'K2',                           cost: 2, description: "Boîtier plastique de la taille d'une télécommande, rangée de LEDs vert-jaune-rouge qui s'illuminent selon l'intensité du champ électromagnétique. L'icône du genre : réactif, nerveux, spectaculaire à l'image — et notoirement sensible aux téléphones, câbles muraux et talkies de l'équipe." },
            { key: 'k2_lot4', nom: 'Lot de 4 K2', cost: 5, isLot: true, description: "Quatre K2 d'un coup : de quoi couvrir plusieurs pièces en simultané, ou remplacer ceux qui rendront l'âme en cours de nuit." },
            { key: 'mel_meter',          nom: 'Mel Meter',                    cost: 3, description: 'Écran digital affichant simultanément champ EMF et température, valeurs chiffrées et non plus de simples LEDs. Conçu à l\'origine par un père endeuillé pour "contacter" sa fille — le folklore de l\'objet fait partie de l\'objet.' },
            { key: 'trifield',           nom: 'Trifield (EMF de précision)',  cost: 4, description: "Le haut de gamme : mesure multi-axes, distinction des sources naturelles et artificielles. C'est l'instrument que le Scientifique accepte de regarder — et celui dont les relevés sont les plus durs à contester au dépouillement." },
            { key: 'thermometre_laser',  nom: 'Thermomètre laser',            cost: 1, description: 'Pistolet à visée laser, température de surface instantanée du point visé. Traque les points froids pièce par pièce.' },
            { key: 'sonde_temperature',  nom: 'Sonde de température ambiante', cost: 1, description: 'Petit boîtier à écran posé au sol, qui suit la température de l\'air en continu. C\'est elle qui documente la "chute brutale de 8 degrés" dont parlera le montage.' },
            { key: 'sonde_temperature_lot4', nom: 'Lot de 4 sondes de température', cost: 3, isLot: true, description: "Quatre sondes à répartir dans le bâtiment pour suivre l'air en continu, pièce par pièce." },
            { key: 'detecteur_mouvement', nom: 'Détecteur de mouvement',      cost: 2, description: 'Capteur infrarouge passif sur trépied ou à ventouse, LED ou alarme au déclenchement. Posé dans les pièces vides. Quand il sonne et que tout le monde est ailleurs, personne ne rigole plus.' },
            { key: 'detecteur_mouvement_lot4', nom: 'Lot de 4 détecteurs de mouvement', cost: 5, isLot: true, description: "De quoi verrouiller un étage entier : quatre capteurs, quatre pièces vides sous surveillance." },
            { key: 'capteur_vibration',  nom: 'Capteur de vibration/pression', cost: 1, description: 'Palet discret posé sur un meuble, une porte, une marche. S\'illumine à la moindre sollicitation. Parfait pour "verrouiller" un objet qu\'on soupçonne de bouger.' },
            { key: 'capteur_vibration_lot4', nom: 'Lot de 4 capteurs de vibration', cost: 3, isLot: true, description: "Quatre palets à poser sur les objets qu'on soupçonne de bouger tout seuls." },
            { key: 'data_logger',        nom: 'Data logger',                  cost: 2, description: "Enregistreur autonome multi-capteurs (température, hygrométrie, EMF) qui trace des courbes toute la nuit. Sans intérêt à l'antenne, précieux au dépouillement — l'outil des équipes qui bossent." },
            { key: 'boussole',           nom: 'Boussole',                     cost: 1, description: "La bonne vieille boussole à aiguille. Low-tech, sans piles, impossible à soupçonner de bug. Quand l'aiguille tourne sans raison, c'est autrement plus troublant qu'une LED." },
        ],
    },

    communication: {
        label: 'Communication',
        items: [
            { key: 'spirit_box',      nom: 'Spirit box (SB7)',           cost: 3, description: "Boîtier radio qui balaye les fréquences AM/FM à toute vitesse, crachant un hachis de parasites et de fragments d'émissions. Les \"réponses\" émergent du bruit — un mot, deux syllabes, un prénom. La machine à ambiguïté par excellence, au son immédiatement reconnaissable à l'antenne." },
            { key: 'enregistreur_evp', nom: 'Enregistreur EVP',          cost: 2, description: 'Dictaphone numérique à micro sensible. On pose des questions au silence, on laisse tourner, on écoute au casque au dépouillement.' },
            { key: 'enregistreur_evp_lot3', nom: 'Lot de 3 enregistreurs EVP', cost: 4, isLot: true, description: "Trois dictaphones : un par groupe, ou trois pièces enregistrées en parallèle toute la nuit." },
            { key: 'ouija',           nom: 'Planche de Ouija',           cost: 2, description: "Planche de bois ou de carton, alphabet en arc de cercle, OUI/NON/AU REVOIR, et sa planchette. L'objet que la production adore, que les témoins refusent de regarder et que l'Exorciste refuse de toucher. Rien que la sortir change l'ambiance d'une pièce." },
            { key: 'pendule',         nom: 'Pendule de radiesthésie',    cost: 1, description: 'Masse de laiton, de cristal ou de bois au bout d\'une chaînette. Oui, non, peut-être — et la mesure en bovis pour qui pratique. Silencieux et hypnotique à l\'image.' },
            { key: 'boule_cristal',   nom: 'Boule de cristal',           cost: 2, piecesMaitresses: 'Pièce maîtresse : non incluse dans la Mallette du médium.', description: "Sphère de cristal véritable, son coffret capitonné et son socle. Lourde, fragile, hypnotique à l'image — l'outil de la voyance posée, pas de l'improvisation." },
            { key: 'trigger_objects', nom: 'Coffret de trigger objects', cost: 2, description: 'Objets-appâts censés provoquer l\'interaction : balle, jouet d\'époque, boîte à musique mécanique, poupée à LED. On les pose, on les cadre, on les cercle à la craie, et on attend.' },
        ],
    },

    vision_augmentee: {
        label: 'Vision augmentée',
        items: [
            { key: 'camera_thermique',   nom: 'Caméra thermique',            cost: 4, description: "Peint le monde en fausses couleurs de chaleur. Les silhouettes chaudes là où il n'y a personne, les empreintes qui restent sur un fauteuil vide — c'est elle qui fait les miniatures des replays." },
            { key: 'camera_ir',          nom: 'Caméra IR / vision nocturne', cost: 3, description: 'Le regard vert-gris emblématique de l\'émission : filmer dans le noir total, avec ce rendu granuleux qui rend le moindre couloir inquiétant.' },
            { key: 'camera_full_spectrum', nom: 'Caméra full spectrum',      cost: 3, description: 'Capteur modifié pour capter du proche UV au proche infrarouge, couleurs étranges, halos inexpliqués. Personne ne sait vraiment interpréter ce qu\'elle montre — c\'est précisément ce qui la rend indispensable.' },
            { key: 'camera_sls',         nom: 'Caméra SLS',                  cost: 4, description: "Capteur de cartographie de mouvement (hérité des consoles de jeu) monté sur tablette : dessine des squelettes filaires sur ce qu'il croit reconnaître comme humain. Quand un squelette apparaît assis sur une chaise vide, l'équipe a son moment." },
            { key: 'lampe_uv',           nom: 'Lampe UV',                    cost: 1, description: "Torche à lumière noire. Révèle fluides, traces de nettoyage, inscriptions effacées, retouches récentes — l'outil qui fait parler les murs, au propre." },
        ],
    },

    protection_rituel: {
        label: 'Protection & rituel',
        items: [
            { key: 'necessaire_pretre',   nom: 'Nécessaire de prêtre',                  cost: 3, isKit: true, piecesMaitresses: 'Non inclus : grimoire ancien, crucifix mural.', description: "Bible ou rituel courant, étole, 2 cierges, fiole d'eau bénite, crucifix de poche. Le quotidien du ministère dans une sacoche." },
            { key: 'kit_purification',    nom: 'Kit de purification',                   cost: 2, isKit: true, description: "Sauge, encens, brûleur, sel en poignées, allumettes. La fumigation, geste télégénique par excellence : la fumée qui dérive, s'épaissit ou refuse d'entrer dans une pièce raconte une histoire toute seule." },
            { key: 'necessaire_tracage',  nom: 'Nécessaire de traçage',                 cost: 1, isKit: true, description: 'Gros sel en sac, craie, cordeau, bougies. Tracer un cercle propre, marquer la position des objets pour vérifier au retour s\'ils ont bougé.' },
            { key: 'crucifix_mural',      nom: 'Crucifix mural / symbole religieux',    cost: 2, description: "Du grand modèle qu'on accroche ou qu'on brandit. La question de savoir si ça protège ou si ça provoque reste ouverte." },
            { key: 'amulettes',           nom: "Amulettes & grigris (lot de l'équipe)", cost: 1, description: 'Les protections personnelles de l\'équipe : médaille de baptême, patte de lapin, pierre percée. Chacun le sien, personne n\'en parle, tout le monde le touche avant d\'entrer.' },
            { key: 'grimoire',            nom: 'Grimoire / livre de rituels ancien',    cost: 3, piecesMaitresses: 'Pièce maîtresse : non incluse dans le Nécessaire de prêtre.', description: "L'ouvrage rare, annoté, à la provenance douteuse — distinct de la bible courante du Nécessaire. Un objet avec du poids, au propre comme au figuré." },
        ],
    },

    terrain_soutien: {
        label: 'Terrain & soutien',
        items: [
            { key: 'kit_base',         nom: "Kit de base de l'émission", cost: 5, isKit: true, description: "Éclairage (frontales, torches, projecteur), énergie (batteries, power banks, chargeurs), 2 paires de talkies, premiers secours. Le camp de base dans deux caisses — il ne fait que le camp de base." },
            { key: 'kit_enquete',      nom: "Kit d'enquête",             cost: 5, isKit: true, piecesMaitresses: "Non inclus : SB7, Mel Meter, Trifield, toutes les caméras d'enquête — le kit détecte, il ne voit pas et ne mesure pas finement.", description: "Le dispositif de détection standard de l'émission, dans deux flight cases : 2 K2, 3 détecteurs de mouvement, 2 sondes de température, 1 enregistreur EVP, et une vieille radio AM/FM à molette (spirit box de fortune — balayage manuel, et les vraies stations s'invitent dans le signal)." },
            { key: 'mallette_medium',  nom: 'Mallette du médium',        cost: 3, isKit: true, piecesMaitresses: 'Non incluse : boule de cristal.', description: 'Pendule, baguettes de sourcier, échelle de Bovis et son manuel, jeu de tarot, nappe de séance. Le quotidien du praticien.' },
            { key: 'valise_sceptique', nom: 'Valise du sceptique',       cost: 2, isKit: true, piecesMaitresses: 'Non inclus : Trifield, data logger.', description: 'Thermomètre laser, boussole, anémomètre, mètre laser, loupe, miroir télescopique. Tout pour démonter un phénomène.' },
            { key: 'kit_pisteur',      nom: 'Kit du pisteur',            cost: 1, isKit: true, description: "Farine/poudre, fil, clochettes, adhésif de marquage. Saupoudrer un seuil, tendre une barrière sonore dans un couloir — l'artisanat qui ne tombe jamais en panne." },
            { key: 'talkies',          nom: 'Paire de talkies-walkies',  cost: 1, description: "La ligne de vie entre les groupes séparés. Portée médiocre dans le béton, grésillements permanents — et le jour où une voix inconnue s'invite sur le canal, tout le monde s'en souvient." },
            { key: 'talkies_lot3', nom: 'Lot de 3 paires de talkies', cost: 2, isLot: true, description: "Trois paires : de quoi équiper toute l'équipe et garder une réserve." },
            { key: 'premiers_secours', nom: 'Kit de premiers secours',   cost: 1, description: 'Parce que statistiquement, le vrai danger de la nuit, c\'est le plancher pourri et le verre brisé.' },
        ],
    },
};

export const EQUIPMENT_CATEGORY_ORDER = [
    'detection_mesure', 'communication', 'vision_augmentee', 'protection_rituel', 'terrain_soutien',
];

// Budgets indicatifs (cf. spec §12) — proposés au MJ, jamais imposés.
export const BUDGET_PRESETS = [
    { key: 'serre',       label: 'Émission fauchée', value: 14 },
    { key: 'standard',    label: 'Standard',         value: 18 },
    { key: 'confortable', label: 'Prod à l\'aise',   value: 22 },
];
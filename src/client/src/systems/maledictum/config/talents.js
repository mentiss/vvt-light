// Imperium Maledictum : talents.
// Sources : livre de base (core) p.102-117 (93 talents) et table des talents aléatoires p.74 ;
// Inquisition Player's Guide (ipg) p.63-67 (22 talents, ouverts à tous les personnages).
// Règles (core p.102) : 100 XP par talent après la création, prérequis à remplir ; les Avances d'une
// spécialisation se comptent à part de celles de la compétence (« 2 Avances en Mêlée (Deux mains) »
// n'exige pas 2 Avances en Mêlée) ; prérequis ignorés pendant la création (p.48). PG p.62 : un
// talent dont on ne remplit plus les prérequis est perdu.
//
// Forme de `requirement` (contrat) : text, chars (minimum), skills, specs ('skill.spec'), talents,
// notTalents, creationOnly, gm (accord du MJ). Champs ajoutés ici, présents seulement si utiles :
//   charsBelow     : { int: 30 } = caractéristique strictement inférieure à la valeur ;
//   noAdvances     : clés de compétence (compétence et toutes ses spécialisations) ou 'skill.spec'
//                    dans lesquelles le personnage ne doit avoir aucune Avance ;
//   anySpec        : { medicae: 2 } = N Avances dans une même spécialisation, au choix, de la compétence ;
//   anyOf          : alternatives (une suffit), chacune { skills?, specs?, talents?, faction?, influence? } ;
//   advancesAcross : { total, keys } = total d'Avances réparties entre ces compétences / spécialisations.
// `effects` (formules) : TB = bonus d'Endurance, SB = bonus de Force, WB = bonus de Force Mentale.
//
// À relire :
// - Noms de spécialisations absents du chapitre des compétences, rattachés : Intuition (People) →
//   intuition.human (Briber, Dealmaker, Exploit Vulnerability), Awareness (Sound) → awareness.hearing
//   (Mimic), Lore (Imperium) → lore.adeptus_terra (Lawbringer, et le tableau de Forger), Ranged
//   (Pistols) → ranged.pistol (Gunslinger, Quickdraw), « Pilot (Specialisation) » → piloting
//   (Extended Proprioception), Fortitude (Endurace) → fortitude.endurance (Porter). Forger cite aussi
//   Lore (Cypher) (Chiffres est une spécialisation de Linguistique) : gardé tel quel dans le résumé.
// - Encadré « Emperor's Aegis » (p.104) tronqué dans le livre même (« Deny the Witch using your… ») :
//   seule la levée du prérequis Psyker de Condemn the Witch, avec l'accord du MJ, est reprise.
// - Faithful (Imperial Cult) : « Prerequisites » ; condition d'appartenance à la faction Adeptus
//   Ministorum OU +2 Influence avec elle, ET 2 Avances en Savoir (Théologie) (lecture de la phrase).
// - Void Legs (Void Brawler) cite un talent « Voidsman » inexistant (probablement Void Legs).
// - Hatred : la table p.74 renvoie à la page 113, le talent est imprimé p.112 (page retenue : 112).
// - Talents répétables à options (Distracting, Duellist, Frenzy, Void Legs, Amalathian Apprentice,
//   Many Masks…) : le nombre maximal de prises n'est pas écrit ; repeatable: true.
// - Psyker : prenable jusqu'à BFM fois (repeatable: true, limite dans repeatNotes).
// - Forbidden Knowledge : « création, ou avec l'accord du MJ » → creationOnly: false, gm: true.
// - Unremarkable : l'interdit d'Avances en Présence ne vaut pas si le talent vient de la table
//   aléatoire (exception dans le texte seulement).
// - Many Masks : « 2 Advances in Stealth, at least one of them in Stealth (Disguise) » lu comme
//   2 Avances entre Discrétion et Discrétion (Déguisement), dont au moins 1 en Déguisement.
// - Subtle Psyker : « 3 Advances in Psychic Powers » rattaché à la Maîtrise psychique (psychic_mastery).
// - You Didn't See Anything : « 2 Advances across any of … » lu comme un total de 2 Avances.
// - Blunt Force Authority : la quantité de Subtilité sacrifiée pour l'Avantage n'est pas chiffrée.
// - Subtle Mutation : la table d100 des mutations subtiles (ipg p.66) n'est pas transcrite ici
//   (relève des tables de mutations).
// - Logical Liar : « use Intelligence as the characteristic, instead of Rapport » ; Rapport est une
//   compétence, la caractéristique remplacée serait la Sociabilité.
// - Traductions des noms de talents : proposées ici, aucune VF officielle.

export const TALENTS = [
    // ---------------------------------------------------------------- livre de base, p.102-117
    {
        key: 'acute_sense', label: 'Sens aiguisé', labelEn: 'Acute Sense', source: 'core', page: 102,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'L\'un des cinq sens est très développé : Tests de Perception permis pour détecter, par ce sens, des détails normalement imperceptibles, selon le MJ.',
        repeatable: false, repeatNotes: null,
        options: [ { key: 'sight', label: 'Vue' }, { key: 'hearing', label: 'Ouïe' }, { key: 'smell', label: 'Odorat' }, { key: 'taste', label: 'Goût' }, { key: 'touch', label: 'Toucher' } ],
        effects: null,
    },
    {
        key: 'adrenaline_acceleration', label: 'Poussée d\'adrénaline', labelEn: 'Adrenaline Acceleration', source: 'core', page: 102,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Vitesse Rapide en Fuite (p.208) ou quand on est Poursuivi (p.204).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'agile_attacks', label: 'Attaques agiles', labelEn: 'Agile Attacks', source: 'core', page: 102,
        requirement: { text: 'Agilité 45, 2 Avances en Mêlée', chars: { ag: 45 }, skills: { melee: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'BAg au lieu de BF pour calculer les dégâts des armes de mêlée ayant le trait Discrète.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'air_of_authority', label: 'Air d\'autorité', labelEn: 'Air of Authority', source: 'core', page: 102,
        requirement: { text: '2 Avances en Présence', chars: {}, skills: { presence: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'À la première rencontre avec un groupe, Test de Rapport Exigeant (+0) : en cas de réussite, +1 Influence avec ce groupe jusqu\'à la fin de l\'aventure.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'ambidextrous', label: 'Ambidextre', labelEn: 'Ambidextrous', source: 'core', page: 102,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Aucune pénalité pour utiliser la main « faible » ; peut manier en même temps une arme de mêlée à une main et un pistolet sans pénalité aux attaques.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'applied_anatomy', label: 'Anatomie appliquée', labelEn: 'Applied Anatomy', source: 'core', page: 102,
        requirement: { text: '2 Avances en Médicae', chars: {}, skills: { medicae: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Quand on inflige un coup critique, on peut augmenter la gravité tirée du nombre de ses Avances en Médicae.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'artistic', label: 'Artiste', labelEn: 'Artistic', source: 'core', page: 103,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Choisir un art : +2 DR aux Tests liés à cet art (lecture et écriture, peinture et dessin, chant et musique, jeu d\'acteur).',
        repeatable: true, repeatNotes: 'À chaque prise, choisir un des arts.',
        options: [ { key: 'literature', label: 'Littérature' }, { key: 'painting', label: 'Peinture' }, { key: 'music', label: 'Musique' }, { key: 'theatre', label: 'Théâtre' } ],
        effects: null,
    },
    {
        key: 'attentive_assistant', label: 'Assistant attentionné', labelEn: 'Attentive Assistant', source: 'core', page: 103,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Action Aider (p.208) possible sans Avance dans la compétence testée ; avec une Avance, la Difficulté du Test s\'améliore d\'un cran.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'blank', label: 'Intouchable', labelEn: 'Blank', source: 'core', page: 103,
        requirement: { text: 'Uniquement à la création. Incompatible avec Psyker', chars: {}, skills: {}, specs: {}, talents: [], notTalents: ['psyker'], creationOnly: true, gm: false },
        summary: 'Gagne automatiquement tout Test opposé pour résister à un pouvoir psychique (Réussite +1 DR), indétectable par la seule Psyniscience, immunisé à la possession démoniaque ; Désavantage aux Tests de Sociabilité avec tout être lié au warp. Manifester un pouvoir visant sa Zone, quelqu\'un de sa Zone ou à Portée courte se fait avec Désavantage ; sa Zone est un Danger mineur pour les démons ; les êtres liés à une conscience de ruche qui y entrent ou y commencent leur tour font un Test de Discipline (Sang-froid) Exigeant (+0) ou sont Hébétés.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'bone_breaker', label: 'Briseur d\'os', labelEn: 'Bone Breaker', source: 'core', page: 103,
        requirement: { text: '2 Avances dans une spécialisation de Médicae', chars: {}, skills: {}, specs: {}, anySpec: { medicae: 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Par une Action, briser un os d\'une cible Entravée relevant de sa spécialisation de Médicae : la localisation choisie subit une Fracture mineure, ou majeure si elle en avait déjà une mineure.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'briber', label: 'Corrupteur', labelEn: 'Briber', source: 'core', page: 104,
        requirement: { text: '2 Avances en Intuition (Humains)', chars: {}, skills: {}, specs: { 'intuition.human': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux Tests d\'Intuition (Humains) pour jauger si quelqu\'un accepterait un pot-de-vin ; le coût d\'un pot-de-vin baisse de 10 % par Avance en Rapport (Marchandage).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'bulwark', label: 'Rempart', labelEn: 'Bulwark', source: 'core', page: 104,
        requirement: { text: '3 Avances en Réflexes', chars: {}, skills: { reflexes: 3 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avec un bouclier et l\'Action Défendre : défendre un allié supplémentaire à Portée de contact, ou un allié à Portée de contact et sa propre Zone.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'burglar', label: 'Cambrioleur', labelEn: 'Burglar', source: 'core', page: 104,
        requirement: { text: '1 Avance en Athlétisme et en Discrétion', chars: {}, skills: { athletics: 1, stealth: 1 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux Tests liés à l\'effraction d\'un lieu (escalader une façade, briser une vitre sans bruit, ouvrir une porte ou un coffret).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'chirurgeon', label: 'Chirurgien', labelEn: 'Chirurgeon', source: 'core', page: 104,
        requirement: { text: '2 Avances en Médicae', chars: {}, skills: { medicae: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Peut opérer avec une trousse de chirurgien (p.145), pratiquer des amputations (p.217) et soigner des Blessures critiques hors de portée des autres ; Avantage pour soigner les Blessures critiques en combat.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'close_quarters_discipline', label: 'Discipline rapprochée', labelEn: 'Close Quarters Discipline', source: 'core', page: 104,
        requirement: { text: '2 Avances en Discipline et en Distance', chars: {}, skills: { discipline: 2, ranged: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Un ennemi à Portée de contact n\'impose pas de Désavantage à ses attaques à distance.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'combat_master', label: 'Maître d\'armes', labelEn: 'Combat Master', source: 'core', page: 104,
        requirement: { text: '2 Avances en Mêlée', chars: {}, skills: { melee: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Compte pour une personne de plus pour déterminer si un camp est en surnombre.',
        repeatable: true, repeatNotes: 'Chaque prise : une personne de plus.', options: null, effects: null,
    },
    {
        key: 'condemn_the_witch', label: 'Condamner la sorcière', labelEn: 'Condemn the Witch', source: 'core', page: 104,
        requirement: { text: 'Force Mentale 40, talent Psyker (le MJ peut lever le prérequis Psyker : encadré « Emperor\'s Aegis »)', chars: { wil: 40 }, skills: {}, specs: {}, talents: ['psyker'], notTalents: [], creationOnly: false, gm: false },
        summary: 'Quand on empêche un psyker de manifester un pouvoir par Contrer la sorcière (p.163), il subit des Blessures égales à l\'Indice Warp du pouvoir tenté.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'contortionist', label: 'Contorsionniste', labelEn: 'Contortionist', source: 'core', page: 104,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Peut se glisser dans des espaces exigus ; Avantage aux Tests pour résister à l\'état Entravé ou à une saisie (p.208), ou y mettre fin.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'counter_attack', label: 'Contre-attaque', labelEn: 'Counter Attack', source: 'core', page: 105,
        requirement: { text: '3 Avances en Mêlée', chars: {}, skills: { melee: 3 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Ciblé par une attaque de mêlée, si l\'on gagne le Test de Mêlée opposé, on peut infliger ses dégâts à l\'adversaire comme si l\'on avait attaqué.',
        repeatable: true, repeatNotes: 'Une contre-attaque par round par prise du talent.', options: null, effects: null,
    },
    {
        key: 'coup_de_grace', label: 'Coup de grâce', labelEn: 'Coup de Grâce', source: 'core', page: 105,
        requirement: { text: '3 Avances en Réflexes', chars: {}, skills: { reflexes: 3 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avec 2 points de Supériorité ou plus, peut jouer 2 tours d\'affilée en sacrifiant son tour du round suivant.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'data_delver', label: 'Fouilleur de données', labelEn: 'Data Delver', source: 'core', page: 105,
        requirement: { text: '2 Avances en Logique (Enquête)', chars: {}, skills: {}, specs: { 'logic.investigation': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux Tests pour trouver ou extraire une information d\'un document ou d\'une archive (analogique ou numérique) ; lit les textes deux fois plus vite.',
        repeatable: 2, repeatNotes: 'Deuxième prise : Avantage aux Tests pour déterminer où, quand, comment ou par qui une information a été créée.', options: null, effects: null,
    },
    {
        key: 'deadeye', label: 'Œil de lynx', labelEn: 'Deadeye', source: 'core', page: 105,
        requirement: { text: '1 Avance en Distance', chars: {}, skills: { ranged: 1 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Viser (p.207) puis faire une attaque à distance donne +1 DR.',
        repeatable: 2, repeatNotes: 'Deuxième prise : en visant, pas de Désavantage pour Cibler une localisation (p.210).', options: null, effects: null,
    },
    {
        key: 'dealmaker', label: 'Négociateur', labelEn: 'Dealmaker', source: 'core', page: 105,
        requirement: { text: '1 Avance en Intuition (Humains) et en Rapport (Marchandage)', chars: {}, skills: {}, specs: { 'intuition.human': 1, 'rapport.haggle': 1 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Pendant une négociation, Test d\'Intuition (Humains) : en cas de réussite, au choix, apprendre quel pot-de-vin la cible accepterait, ou −10 % sur ce qu\'on lui achète, ou +10 % sur ce qu\'on lui vend.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'demolition_specialist', label: 'Spécialiste des explosifs', labelEn: 'Demolition Specialist', source: 'core', page: 105,
        requirement: { text: '2 Avances en Distance (Artillerie) ou 2 Avances en Dextérité (Désamorçage)', chars: {}, skills: {}, specs: {}, anyOf: [ { specs: { 'ranged.ordnance': 2 } }, { specs: { 'dexterity.defuse': 2 } } ], talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'En une heure, Test de Tech (Ingénierie) (Difficulté fixée par le MJ) pour retirer le trait Instable d\'un explosif ; les explosifs à retardement (p.134) qu\'on prépare gagnent +BInt aux dégâts.',
        repeatable: 2, repeatNotes: 'Deuxième prise : à chaque attaque avec une arme Explosion, peut épargner un personnage qu\'elle toucherait.', options: null, effects: null,
    },
    {
        key: 'devoted_servant', label: 'Serviteur dévoué', labelEn: 'Devoted Servant', source: 'core', page: 106,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Choisir un métier dans la table du Serviteur dévoué : Avantage aux Tests liés à ce domaine. Chasseur : choisir un environnement, et y nourrir un nombre de personnes égal à son BPer.',
        repeatable: false, repeatNotes: null,
        options: [
            { key: 'agronomist', label: 'Agronome' }, { key: 'custodian', label: 'Concierge' }, { key: 'entertainer', label: 'Amuseur' },
            { key: 'hunter', label: 'Chasseur' }, { key: 'modiste', label: 'Couturier' }, { key: 'manufactorist', label: 'Ouvrier de manufactorum' },
            { key: 'mason', label: 'Maçon' }, { key: 'scullion', label: 'Marmiton' },
        ],
        effects: null,
    },
    {
        key: 'directed_strikes', label: 'Frappes ciblées', labelEn: 'Directed Strikes', source: 'core', page: 106,
        requirement: { text: '3 Avances en Mêlée', chars: {}, skills: { melee: 3 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Pas de Désavantage pour l\'Action Cibler une localisation avec une arme de mêlée.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'dirty_fighting', label: 'Coups bas', labelEn: 'Dirty Fighting', source: 'core', page: 106,
        requirement: { text: '2 Avances en Mêlée (Pugilat)', chars: {}, skills: {}, specs: { 'melee.brawling': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'En infligeant des dégâts en mêlée, peut infliger l\'état Aveuglé ou Assourdi ; avec +3 DR ou plus, Hébété à la place.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'disarm', label: 'Désarmement', labelEn: 'Disarm', source: 'core', page: 106,
        requirement: { text: '2 Avances en Mêlée', chars: {}, skills: { melee: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Contre un adversaire de même taille ou plus petit, une attaque de mêlée réussie peut désarmer au lieu d\'infliger des dégâts : l\'objet tombe dans une Zone adjacente au hasard ; à +2 DR on choisit la Zone, à +4 DR on s\'en empare si l\'on a une main libre.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'disturbing_voice', label: 'Voix troublante', labelEn: 'Disturbing Voice', source: 'core', page: 106,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: '+2 DR aux Tests de Présence (Interrogatoire) et (Intimidation) qui passent par la voix ; −2 DR aux Tests de Sociabilité contre qui en est troublé (selon le MJ).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'distracting', label: 'Perturbateur', labelEn: 'Distracting', source: 'core', page: 107,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Une fois par rencontre, interrompre quelqu\'un qui fait un Test pour lui imposer un Désavantage (Réaction en combat).',
        repeatable: true,
        repeatNotes: [
            { key: 'centre_of_attention', label: 'Centre de l\'attention', summary: 'À Portée de contact d\'un non-allié, peut imposer un Désavantage à ses Tests qui visent quelqu\'un d\'autre que soi.' },
            { key: 'stunning_interjection', label: 'Interjection étourdissante', summary: 'Une fois par rencontre, la cible de Perturbateur est Hébétée (mineur) jusqu\'à la fin de son prochain tour.' },
        ],
        options: null, effects: null,
    },
    {
        key: 'drilled', label: 'Discipliné', labelEn: 'Drilled', source: 'core', page: 107,
        requirement: { text: '1 Avance en Discipline', chars: {}, skills: { discipline: 1 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux Tests pour résister à l\'état Effrayé ; +1 DR aux Tests de Discipline par allié Discipliné dans la même Zone.',
        repeatable: 2,
        repeatNotes: [
            { key: 'kill_team', label: 'Escouade de choc', summary: 'Si un autre membre du groupe a Discipliné, tous deux peuvent le reprendre : dans la même Zone que lui, on peut agir juste après lui dans l\'Initiative et gagner +1 DR à tous ses Tests.' },
        ],
        options: null, effects: null,
    },
    {
        key: 'dual_wielder', label: 'Combat à deux armes', labelEn: 'Dual Wielder', source: 'core', page: 107,
        requirement: { text: 'Ambidextre, 2 Avances en Mêlée (Une main)', chars: {}, skills: {}, specs: { 'melee.one_handed': 2 }, talents: ['ambidextrous'], notTalents: [], creationOnly: false, gm: false },
        summary: 'Pas de Désavantage pour attaquer avec deux armes de mêlée à la fois (combat à deux armes, p.214).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'duellist', label: 'Duelliste', labelEn: 'Duellist', source: 'core', page: 107,
        requirement: { text: '2 Avances en Mêlée (Une main)', chars: {}, skills: {}, specs: { 'melee.one_handed': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Les armes de mêlée à une main sans le trait Discrète comptent comme ayant le trait Défensive.',
        repeatable: true,
        repeatNotes: [
            { key: 'duellist_feint', label: 'Feinte du duelliste', summary: 'Après une attaque réussie à une main, ne pas infliger de dégâts pour imposer un Désavantage aux attaques de la cible contre soi jusqu\'à la fin de son prochain tour.' },
            { key: 'duellist_guard', label: 'Garde du duelliste', summary: 'Attaquer à une main avec Désavantage pour faire en même temps l\'Action Esquiver.' },
        ],
        options: null, effects: null,
    },
    {
        key: 'eidetic_memory', label: 'Mémoire eidétique', labelEn: 'Eidetic Memory', source: 'core', page: 107,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Se souvient presque parfaitement de ce qu\'il a vu, même brièvement : aucun Test pour se rappeler un détail visuel.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'ever_vigilant', label: 'Toujours vigilant', labelEn: 'Ever Vigilant', source: 'core', page: 107,
        requirement: { text: '2 Avances en Vigilance', chars: {}, skills: { awareness: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: '+1 DR aux Tests pour détecter des ennemis cachés ; aucune pénalité des états Inconscient ou Aveuglé pendant le sommeil. En quittant un lieu où un indice est passé inaperçu, le MJ peut faire en secret un Test de Vigilance pour le révéler.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'exploit_vulnerability', label: 'Exploiter la faiblesse', labelEn: 'Exploit Vulnerability', source: 'core', page: 108,
        requirement: { text: '2 Avances en Intuition (Humains)', chars: {}, skills: {}, specs: { 'intuition.human': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Après avoir pris le temps de Connaître son ennemi (p.196) avant le combat, choisit la localisation de sa première attaque réussie.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'extended_proprioception', label: 'Proprioception étendue', labelEn: 'Extended Proprioception', source: 'core', page: 108,
        requirement: { text: '3 Avances dans une spécialisation de Pilotage', chars: {}, skills: {}, specs: {}, anySpec: { piloting: 3 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Aux commandes d\'un véhicule de sa spécialisation, en connaît toujours la taille et la position et sent toute anomalie ; pas de Désavantage dû à Aveuglé pour ces Tests de Pilotage ; compte pour deux personnes dans un équipage.',
        repeatable: false, repeatNotes: null,
        options: [ { key: 'aeronautica', label: 'Aeronautica' }, { key: 'civilian', label: 'Civil' }, { key: 'military', label: 'Militaire' }, { key: 'minor_voidship', label: 'Vaisseau mineur' }, { key: 'major_voidship', label: 'Vaisseau majeur' } ],
        effects: null,
    },
    {
        key: 'false_retreat', label: 'Fausse retraite', labelEn: 'False Retreat', source: 'core', page: 108,
        requirement: { text: '3 Avances en Rapport (Tromperie)', chars: {}, skills: {}, specs: { 'rapport.deception': 3 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Par une Action, feindre de Fuir (p.208) : la Supériorité baisse de 1 et l\'on quitte la rencontre ; au début du tour suivant, on réapparaît caché n\'importe où à Portée longue. Au retour dans la rencontre, la Supériorité augmente de 1.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'faithful', label: 'Fidèle (Culte impérial)', labelEn: 'Faithful (Imperial Cult)', source: 'core', page: 108,
        requirement: { text: 'Membre de la faction Adeptus Ministorum ou +2 Influence avec l\'Adeptus Ministorum, et 2 Avances en Savoir (Théologie)', chars: {}, skills: {}, specs: { 'lore.theology': 2 }, anyOf: [ { faction: 'adeptus_ministorum' }, { influence: { adeptus_ministorum: 2 } } ], talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Une fois par session, ajouter son BFM en DR à un Test lié à sa foi (interroger un hérétique, frapper un xenos, retrouver un texte sacré…).',
        repeatable: 2,
        repeatNotes: 'Deuxième prise avec l\'accord du MJ (« Saints of the Imperium », p.109) : dépenser du Destin pour soigner un Humain touché de 1 + BFM Blessures (Action), laisser un Humain en vue ignorer un état jusqu\'à la fin de la rencontre, ou retirer son BFM en DR au Test de Maîtrise psychique d\'une créature à Portée longue ; brûler du Destin pour un exploit surhumain (en martyr s\'il n\'en reste plus).',
        options: null, effects: null,
    },
    {
        key: 'familiar_terrain', label: 'Terrain familier', labelEn: 'Familiar Terrain', source: 'core', page: 108,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Dans l\'environnement choisi : Avantage aux Tests de Discrétion et +1 Armure en plus de ce que donne un Couvert (p.204).',
        repeatable: true, repeatNotes: 'À chaque prise, un autre environnement.',
        options: [
            { key: 'agri', label: 'Agricole' }, { key: 'feudal', label: 'Féodal' }, { key: 'forge', label: 'Forge' },
            { key: 'hive', label: 'Ruche' }, { key: 'natural', label: 'Naturel' }, { key: 'shrine', label: 'Sanctuaire' },
            { key: 'warzone', label: 'Zone de guerre' }, { key: 'wasteland', label: 'Terres désolées' }, { key: 'voidship', label: 'Vaisseau spatial' },
        ],
        effects: null,
    },
    {
        key: 'fated', label: 'Prédestiné', labelEn: 'Fated', source: 'core', page: 108,
        requirement: { text: 'Uniquement à la création', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: true, gm: false },
        summary: '+1 point de Destin.',
        repeatable: false, repeatNotes: null, options: null, effects: { fate: 1 },
    },
    {
        key: 'field_medicae', label: 'Médicae de terrain', labelEn: 'Field Medicae', source: 'core', page: 109,
        requirement: { text: '2 Avances en Médicae', chars: {}, skills: { medicae: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Un Test de Médicae pour soigner un personnage (p.219) n\'est jamais plus dur qu\'Exigeant (+0).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'flagellant', label: 'Flagellant', labelEn: 'Flagellant', source: 'core', page: 109,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux Tests pour résister à la douleur ou à l\'interrogatoire. À chaque Blessure critique, Test de Savoir (Théologie) Exigeant (+0) : en cas de réussite, ignore ses effets pendant BFM rounds, puis les subit normalement.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'flanking_fire', label: 'Tir de flanc', labelEn: 'Flanking Fire', source: 'core', page: 109,
        requirement: { text: '2 Avances en Distance', chars: {}, skills: { ranged: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Contre une cible dans la même Zone qu\'un allié révélé, le couvert partiel ne lui sert à rien et un couvert total compte comme partiel.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'flesh_is_weak', label: 'La chair est faible', labelEn: 'Flesh is Weak', source: 'core', page: 110,
        requirement: { text: '2 Avances en Tech (Augmétique)', chars: {}, skills: {}, specs: { 'tech.augmetics': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Le nombre d\'augmétiques (p.152) qu\'on peut porter est égal au double de son BE.',
        repeatable: false, repeatNotes: null, options: null, effects: { maxAugmetics: '2xTB' },
    },
    {
        key: 'forbidden_knowledge', label: 'Connaissances interdites', labelEn: 'Forbidden Knowledge', source: 'core', page: 110,
        requirement: { text: 'À la création, ou avec l\'accord du MJ (encadré « Forbidden Lore »)', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: true },
        summary: 'Donne accès à une spécialisation Interdit : Linguistique, Savoir ou Médicae. Le MJ peut infliger de la Corruption (p.220) à qui l\'étudie.',
        repeatable: true, repeatNotes: 'Chaque prise : une spécialisation Interdit de plus.',
        options: [ { key: 'linguistics.forbidden', label: 'Linguistique (Interdit)' }, { key: 'lore.forbidden', label: 'Savoir (Interdit)' }, { key: 'medicae.forbidden', label: 'Médicae (Interdit)' } ],
        effects: null,
    },
    {
        key: 'forger', label: 'Faussaire', labelEn: 'Forger', source: 'core', page: 110,
        requirement: { text: '2 Avances en Linguistique et en Savoir', chars: {}, skills: { linguistics: 2, lore: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Falsifier en une journée un document donnant de l\'Influence sur une faction (Test selon la faction : Administratum Lore (Imperium), Ministorum Savoir (Théologie), Inquisition Lore (Cypher), Libre-Marchand Linguistique (Haut Gothique)) : Difficile (−10) +1, Ardu (−20) +2, Très ardu (−30) +3 Influence. Pour l\'authentifier, Test de Logique (Évaluation) opposé au DR du faussaire.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'full_auto_fanatic', label: 'Fanatique du tir automatique', labelEn: 'Full-Auto Fanatic', source: 'core', page: 110,
        requirement: { text: '3 Avances en Distance', chars: {}, skills: { ranged: 3 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avec une arme à Tir rapide (p.125), dépenser le double des munitions de son indice pour viser tous les individus de la Zone d\'une seule attaque.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'frenzy', label: 'Frénésie', labelEn: 'Frenzy', source: 'core', page: 111,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Action gratuite, Test de Force Mentale Exigeant (+0) pour entrer en frénésie : BF +1, immunité à Effrayé, obligation d\'engager en mêlée l\'ennemi le plus proche ; dure jusqu\'à ce que tous les ennemis en vue soient vaincus ou qu\'on soit Hébété ou Inconscient.',
        repeatable: true,
        repeatNotes: [
            { key: 'frenzied_control', label: 'Frénésie maîtrisée', summary: 'Par une Action, Test de Discipline (Sang-froid) Difficile (−10) pour arrêter la frénésie.' },
            { key: 'frenzied_fearlessness', label: 'Frénésie intrépide', summary: 'Au lieu de devenir Effrayé, peut entrer aussitôt en frénésie.' },
            { key: 'frenzied_momentum', label: 'Élan frénétique', summary: 'Une fois par tour, en tuant un ennemi pendant la frénésie, peut aussitôt se Déplacer ou faire une autre Action.' },
        ],
        options: null, effects: null,
    },
    {
        key: 'gallows_humour', label: 'Humour noir', labelEn: 'Gallows Humour', source: 'core', page: 111,
        requirement: { text: '2 Avances en Rapport (Charme)', chars: {}, skills: {}, specs: { 'rapport.charm': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Par une Action, Test de Rapport (Charme) Exigeant (+0) : retire à la cible l\'état Épuisé, Effrayé ou Hébété ; une cible mourante ne meurt pas en fin de round et survit 1 + DR rounds de plus.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'gothic_gibberish', label: 'Charabia gothique', labelEn: 'Gothic Gibberish', source: 'core', page: 111,
        requirement: { text: '1 Avance en Linguistique', chars: {}, skills: { linguistics: 1 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Test de Rapport (Charme) opposé à la Discipline (Sang-froid) d\'une cible partageant une langue : si on gagne, elle est Entravée tant qu\'on parle. Nouveau Test opposé à la fin de chacun de ses tours ; subir des dégâts la libère.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'guardian', label: 'Gardien', labelEn: 'Guardian', source: 'core', page: 111,
        requirement: { text: '3 Avances en Réflexes', chars: {}, skills: { reflexes: 3 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Action gratuite en début de combat : choisir un allié à Portée moyenne, qu\'on défend (Défendre, p.207). S\'il est attaqué et à Portée moyenne, on peut se déplacer aussitôt pour le Défendre ; si cela rompt un Engagement, les adversaires ont Désavantage à leur attaque de mêlée.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'gunslinger', label: 'Pistolero', labelEn: 'Gunslinger', source: 'core', page: 111,
        requirement: { text: 'Ambidextre, 2 Avances en Distance (Pistolet)', chars: {}, skills: {}, specs: { 'ranged.pistol': 2 }, talents: ['ambidextrous'], notTalents: [], creationOnly: false, gm: false },
        summary: 'Pas de Désavantage pour attaquer avec deux armes à distance à la fois (combat à deux armes, p.214).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'hatred', label: 'Haine', labelEn: 'Hatred', source: 'core', page: 112,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Au contact de l\'objet de sa haine, Test de Discipline (Sang-froid) Difficile (−10) ; en cas d\'échec : Avantage aux Tests de Discipline (Peur), +1 DR aux attaques, obligation de détruire ce groupe au plus vite. Nouveau Test à la fin de chaque tour pour y mettre fin.',
        repeatable: false, repeatNotes: null, options: 'free', effects: null,
    },
    {
        key: 'hit_and_run', label: 'Frapper et fuir', labelEn: 'Hit and Run', source: 'core', page: 112,
        requirement: { text: '3 Avances en Réflexes (Acrobaties)', chars: {}, skills: {}, specs: { 'reflexes.acrobatics': 3 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Action gratuite après avoir infligé au moins une Blessure : Test de Réflexes (Acrobaties) pour se Désengager et passer dans une Zone adjacente.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'holdout_expert', label: 'Expert en planque', labelEn: 'Holdout Expert', source: 'core', page: 112,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Cache sur soi un petit objet (taille d\'une paume) : le trouver demande un Test Ardu (−20) de Vigilance (Toucher), Dextérité (Vol à la tire) ou Logique (Enquête), Exigeant (+0) si le fouilleur emploie une technologie.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'hypno_indoctrination', label: 'Hypno-endoctrinement', labelEn: 'Hypno-Indoctrination', source: 'core', page: 112,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Lancer deux fois sur la table des talents aléatoires (p.74) et gagner les deux talents.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'icon_bearer', label: 'Porte-icône', labelEn: 'Icon Bearer', source: 'core', page: 112,
        requirement: { text: '1 Avance en Savoir (Théologie) et 1 Avance en Présence', chars: {}, skills: { presence: 1 }, specs: { 'lore.theology': 1 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'En tenant une icône sacrée (p.148), tout allié à Portée moyenne qui vous voit bénéficie de son effet.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'ignorance_is_my_shield', label: 'L\'ignorance est mon bouclier', labelEn: 'Ignorance is my Shield', source: 'core', page: 112,
        requirement: { text: 'Moins de 30 en Intelligence, aucune Avance dans une spécialisation Interdit', chars: {}, charsBelow: { int: 30 }, noAdvances: ['linguistics.forbidden', 'lore.forbidden', 'medicae.forbidden'], skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: '+4 DR aux Tests pour résister à la Corruption (p.220), aux pouvoirs psychiques et à l\'influence démoniaque ; −4 DR aux Tests pour étudier, traquer ou se rappeler des informations sur les démons, les psykers et les xenos.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'inspiring_presence', label: 'Présence inspirante', labelEn: 'Inspiring Presence', source: 'core', page: 112,
        requirement: { text: '2 Avances en Présence (Commandement)', chars: {}, skills: {}, specs: { 'presence.leadership': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Les alliés de sa Zone qui le voient ont Avantage aux Tests de Discipline.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'inheritor', label: 'Héritier', labelEn: 'Inheritor', source: 'core', page: 113,
        requirement: { text: 'Uniquement à la création', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: true, gm: false },
        summary: '+1 Influence avec une faction appropriée tant qu\'on est à la hauteur de sa lignée. Au choix du MJ : Héritage (5 000 solars d\'équipement, de biens ou d\'investissements, p.231), ou lignée marquante (Navis Nobilite, donnant accès à Navigation (Warp) ; Culte Genestealer).',
        repeatable: false, repeatNotes: null, options: 'free', effects: null,
    },
    {
        key: 'lawbringer', label: 'Porteur de loi', labelEn: 'Lawbringer', source: 'core', page: 113,
        requirement: { text: '2 Avances en Savoir (Adeptus Terra) (livre : « Lore (Imperium) »)', chars: {}, skills: {}, specs: { 'lore.adeptus_terra': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Contre une cible dont on sait qu\'elle a enfreint une loi, invoquer cette loi donne aux Tests de Rapport ou de Présence un bonus en DR égal à ses Avances en Lore (Imperium).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'lickspittle', label: 'Lèche-bottes', labelEn: 'Lickspittle', source: 'core', page: 113,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux Tests pour flatter un supérieur.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'martyrdom', label: 'Martyre', labelEn: 'Martyrdom', source: 'core', page: 113,
        requirement: { text: '2 Avances en Robustesse', chars: {}, skills: { fortitude: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avec au moins une Blessure critique, bonus en DR égal à son BFM à tous ses Tests.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'medicae_maverick', label: 'Médicae non conformiste', labelEn: 'Medicae Maverick', source: 'core', page: 113,
        requirement: { text: '1 Avance dans une spécialisation Médicae (Interdit)', chars: {}, skills: {}, specs: { 'medicae.forbidden': 1 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Par une Action, sur un allié à Portée de contact : une Fracture majeure devient mineure, ou une mineure est réparée ; la cible gagne +1 Blessure critique mais ne subit plus les effets de la fracture.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'mental_fortress', label: 'Forteresse mentale', labelEn: 'Mental Fortress', source: 'core', page: 114,
        requirement: { text: '2 Avances en Discipline (Psychique)', chars: {}, skills: {}, specs: { 'discipline.psychic': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Son esprit ne peut être lu par aucun pouvoir psychique ; Armure égale à son BFM contre les pouvoirs psychiques qui le visent.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'mimic', label: 'Imitateur', labelEn: 'Mimic', source: 'core', page: 114,
        requirement: { text: '2 Avances en Vigilance (Ouïe) et en Rapport (Tromperie)', chars: {}, skills: {}, specs: { 'awareness.hearing': 2, 'rapport.deception': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Imite la voix d\'une personne après l\'avoir écoutée au moins une heure ; ne permet pas de parler une langue inconnue.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'overseer', label: 'Contremaître', labelEn: 'Overseer', source: 'core', page: 114,
        requirement: { text: '2 Avances en Présence (Commandement)', chars: {}, skills: {}, specs: { 'presence.leadership': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Par une Action, Test (Commandement) Exigeant (+0) : en cas de réussite, l\'allié ou subordonné aidé utilise votre compétence au lieu de la sienne pour son prochain Test.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'pathologist', label: 'Légiste', labelEn: 'Pathologist', source: 'core', page: 114,
        requirement: { text: '2 Avances en Médicae (Humains)', chars: {}, skills: {}, specs: { 'medicae.human': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux autopsies pour déterminer la cause et la nature d\'un décès et analyser les déséquilibres médicaux.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'phlebotomist', label: 'Phlébotomiste', labelEn: 'Phlebotomist', source: 'core', page: 114,
        requirement: { text: '3 Avances en Médicae', chars: {}, skills: { medicae: 3 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Une attaque de mêlée réussie peut infliger l\'état Hémorragie au lieu des dégâts.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'porter', label: 'Porteur', labelEn: 'Porter', source: 'core', page: 114,
        requirement: { text: '2 Avances en Robustesse (Endurance)', chars: {}, skills: {}, specs: { 'fortitude.endurance': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Encombrement maximal égal au double de son BF plus son BE.',
        repeatable: false, repeatNotes: null, options: null, effects: { maxEncumbrance: '2xSB+TB' },
    },
    {
        key: 'psychic_castigation', label: 'Châtiment psychique', labelEn: 'Psychic Castigation', source: 'core', page: 114,
        requirement: { text: 'Talent Psyker', chars: {}, skills: {}, specs: {}, talents: ['psyker'], notTalents: [], creationOnly: false, gm: false },
        summary: 'Quand on gagne un Test de Force Mentale opposé pour résister à un pouvoir psychique, le psyker subit des Blessures égales à l\'écart de DR.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'psychic_flood', label: 'Déferlement psychique', labelEn: 'Psychic Flood', source: 'core', page: 114,
        requirement: { text: 'Talent Psyker', chars: {}, skills: {}, specs: {}, talents: ['psyker'], notTalents: [], creationOnly: false, gm: false },
        summary: 'En manifestant un pouvoir, peut gagner autant de Charges Warp que son BFM ; si le pouvoir est manifesté, +1 DR par Charge Warp ainsi gagnée.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'psyker', label: 'Psyker', labelEn: 'Psyker', source: 'core', page: 114,
        requirement: { text: 'Pas le talent Intouchable', chars: {}, skills: {}, specs: {}, talents: [], notTalents: ['blank'], creationOnly: false, gm: false },
        summary: 'Peut manifester des pouvoirs psychiques (p.158) et acheter des Avances en Maîtrise psychique et en Vigilance (Psyniscience). Gagne un pouvoir mineur et un pouvoir d\'une discipline choisie ; ensuite 60 XP par pouvoir mineur, 100 XP par pouvoir de sa discipline.',
        repeatable: true, repeatNotes: 'Prenable jusqu\'à BFM fois : chaque prise supplémentaire donne une nouvelle discipline et un de ses pouvoirs.', options: null, effects: null,
    },
    {
        key: 'quickdraw', label: 'Dégainer vite', labelEn: 'Quickdraw', source: 'core', page: 115,
        requirement: { text: '2 Avances en Distance (Pistolet) et en Réflexes', chars: {}, skills: { reflexes: 2 }, specs: { 'ranged.pistol': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Au début d\'un combat, dégaine et tire au pistolet avant tout le monde, quel que soit l\'ordre d\'Initiative ; Surpris, il faut d\'abord réussir un Test de Réflexes Ardu (−20).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'rapid_reload', label: 'Rechargement rapide', labelEn: 'Rapid Reload', source: 'core', page: 115,
        requirement: { text: '2 Avances en Dextérité et en Distance', chars: {}, skills: { dexterity: 2, ranged: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Recharge par une Action gratuite les armes de la spécialisation de Distance choisie.',
        repeatable: false, repeatNotes: null,
        options: [ { key: 'long_gun', label: 'Arme longue' }, { key: 'ordnance', label: 'Artillerie' }, { key: 'pistol', label: 'Pistolet' }, { key: 'thrown', label: 'Lancer' } ],
        effects: null,
    },
    {
        key: 'read_lips', label: 'Lire sur les lèvres', labelEn: 'Read Lips', source: 'core', page: 115,
        requirement: { text: '1 Avance en Vigilance (Vue) et en Linguistique', chars: {}, skills: { linguistics: 1 }, specs: { 'awareness.sight': 1 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Comprend ce que dit quelqu\'un en lisant sur ses lèvres, même sans l\'entendre.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'registered_trader', label: 'Marchand patenté', labelEn: 'Registered Trader', source: 'core', page: 115,
        requirement: { text: '2 Avances en Logique (Évaluation) et 2 Avances en Rapport (Marchandage)', chars: {}, skills: {}, specs: { 'logic.evaluation': 2, 'rapport.haggle': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Le prix de revente de base d\'un objet (p.120) passe de 50 % (arrondi au supérieur) à 100 %. Administratum ou infractionnistes peuvent venir réclamer une dîme entre les missions (p.228).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'sanctioned_psyker', label: 'Psyker sanctionné', labelEn: 'Sanctioned Psyker', source: 'core', page: 115,
        requirement: { text: 'Talent Psyker. Uniquement à la création', chars: {}, skills: {}, specs: {}, talents: ['psyker'], notTalents: [], creationOnly: true, gm: false },
        summary: 'Seuil Warp égal au double de son BFM ; possède un symbole prouvant son statut de psyker sanctionné.',
        repeatable: false, repeatNotes: null, options: null, effects: { warpThreshold: '2xWB' },
    },
    {
        key: 'secret_identity', label: 'Identité secrète', labelEn: 'Secret Identity', source: 'core', page: 115,
        requirement: { text: 'Accord du MJ (dans le texte du talent)', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: true },
        summary: 'Choisir une faction et une Fonction (chapitre III ou autre fonction plausible) : tant qu\'on est vêtu et qu\'on se comporte en conséquence, +1 Influence avec cette faction. Maintenir la façade demande des Tests de Rapport (Tromperie) face à certains de ses membres.',
        repeatable: false, repeatNotes: null, options: 'free', effects: null,
    },
    {
        key: 'shock_assault', label: 'Assaut de choc', labelEn: 'Shock Assault', source: 'core', page: 116,
        requirement: { text: 'Agilité 45, 3 Avances en Discrétion', chars: { ag: 45 }, skills: { stealth: 3 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: '2 Actions pendant son tour lors d\'un round de surprise.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'skulker', label: 'Rôdeur', labelEn: 'Skulker', source: 'core', page: 116,
        requirement: { text: '1 Avance en Navigation et en Discrétion', chars: {}, skills: { navigation: 1, stealth: 1 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'En filant quelqu\'un par Navigation (Pistage), pas de Test de Discrétion pour rester inaperçu de lui, sauf si l\'on attire l\'attention de façon très visible ou très bête.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'slippery', label: 'Insaisissable', labelEn: 'Slippery', source: 'core', page: 116,
        requirement: { text: '2 Avances en Réflexes', chars: {}, skills: { reflexes: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'En sortant d\'un Engagement (p.212), l\'attaque immédiate d\'un adversaire contre soi se fait avec Désavantage.',
        repeatable: 2, repeatNotes: 'Deuxième prise : se Désengager par une Action gratuite.', options: null, effects: null,
    },
    {
        key: 'superior_commander', label: 'Commandant supérieur', labelEn: 'Superior Commander', source: 'core', page: 116,
        requirement: { text: '4 Avances en Présence (Commandement)', chars: {}, skills: {}, specs: { 'presence.leadership': 4 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Par son Action, donner des ordres à autant d\'alliés que la Supériorité actuelle : chacun peut aussitôt se Déplacer ou faire une Action.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'suppressing_fire', label: 'Tir de suppression', labelEn: 'Suppressing Fire', source: 'core', page: 116,
        requirement: { text: '2 Avances en Distance', chars: {}, skills: { ranged: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'En Tir rapide (p.125), renoncer aux dégâts pour clouer les cibles : Discipline (Sang-froid) opposée à son Test de Distance ; si on gagne, elles sont Entravées jusqu\'au début de son prochain tour.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'sure_footed', label: 'Pied sûr', labelEn: 'Sure-Footed', source: 'core', page: 116,
        requirement: { text: '1 Avance en Athlétisme, en Robustesse et en Réflexes', chars: {}, skills: { athletics: 1, fortitude: 1, reflexes: 1 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Rapide avec au moins 1 point de Supériorité ; Avantage pour résister à l\'état À terre ou y mettre fin, se relever par une Action gratuite une fois par tour (si non Entravé), Avantage pour résister à un déplacement forcé.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'tactical_movement', label: 'Mouvement tactique', labelEn: 'Tactical Movement', source: 'core', page: 116,
        requirement: { text: '1 Avance en Athlétisme et en Discipline', chars: {}, skills: { athletics: 1, discipline: 1 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Se mettre à couvert (p.210) par une Action gratuite.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'tenacious', label: 'Tenace', labelEn: 'Tenacious', source: 'core', page: 116,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Quand on devient Hébété, Test de Robustesse (Endurance) Exigeant (+0) immédiat pour s\'en remettre.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'two_handed_cleave', label: 'Taille à deux mains', labelEn: 'Two-handed Cleave', source: 'core', page: 116,
        requirement: { text: '2 Avances en Mêlée (Deux mains)', chars: {}, skills: {}, specs: { 'melee.two_handed': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Une arme ayant le trait Deux mains gagne aussi le trait Dispersion (p.125).',
        repeatable: 3,
        repeatNotes: [
            { key: 'two_handed_brutalist', label: 'Brute à deux mains', summary: 'Une arme Deux mains gagne aussi le trait Déchirante (+1).' },
            { key: 'two_handed_sweep', label: 'Balayage à deux mains', summary: 'En touchant une jambe avec une arme Deux mains, diviser les dégâts par deux pour forcer un Test de Réflexes (Équilibre) Ardu (−20), sinon la cible tombe À terre.' },
        ],
        options: null, effects: null,
    },
    {
        key: 'unflinching_presence', label: 'Présence inébranlable', labelEn: 'Unflinching Presence', source: 'core', page: 116,
        requirement: { text: '3 Avances en Présence (Commandement)', chars: {}, skills: {}, specs: { 'presence.leadership': 3 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Chaque fois que le groupe devrait perdre de la Supériorité, Test de Présence (Commandement) Ardu (−20) : en cas de réussite, il n\'en perd pas.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'unremarkable', label: 'Insignifiant', labelEn: 'Unremarkable', source: 'core', page: 117,
        requirement: { text: 'Aucune Avance en Présence ni dans ses spécialisations, sauf si le talent vient de la table des talents aléatoires (p.74)', chars: {}, noAdvances: ['presence'], skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Correctement vêtu, se fond dans un environnement impérial sans Test ; Désavantage aux Tests de Présence et de Rapport visant des personnes de haut rang. Le groupe ne perd pas de Supériorité quand il subit une Blessure critique ou meurt.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'void_legs', label: 'Pied spatial', labelEn: 'Void Legs', source: 'core', page: 117,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Aucun Désavantage dû aux effets propres au vide (roulis d\'un vaisseau, apesanteur).',
        repeatable: true,
        repeatNotes: [
            { key: 'attitude_control', label: 'Contrôle d\'attitude', summary: 'Rapide en apesanteur.' },
            { key: 'void_brawler', label: 'Bagarreur du vide', summary: 'Avantage aux attaques de mêlée en apesanteur contre les personnages sans le talent « Voidsman ».' },
        ],
        options: null, effects: null,
    },
    {
        key: 'well_prepared', label: 'Prévoyant', labelEn: 'Well-prepared', source: 'core', page: 117,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Une fois par mission, trouve dans ses affaires un équipement nécessaire d\'Encombrement 0, plausiblement acquis récemment ; son coût est déduit de ses Solars.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },

    // ---------------------------------------------------------------- Inquisition Player's Guide, p.63-67
    {
        key: 'amalathian_apprentice', label: 'Apprenti amalathien', labelEn: 'Amalathian Apprentice', source: 'ipg', page: 63,
        requirement: { text: '2 Avances en Rapport', chars: {}, skills: { rapport: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'À la fin d\'une interaction positive avec le représentant d\'une autre faction impériale, dépenser 1 point de Destin pour un Test de Rapport (Difficulté du MJ) : en cas de réussite, il devient un Contact.',
        repeatable: true,
        repeatNotes: [
            { key: 'coercive_favour', label: 'Faveur forcée', summary: 'Pour les Réquisitions inquisitoriales, +1 DR au Test de Rapport pour trouver qui peut aider, et +1 DR au Test de Rapport pour obtenir cette aide.' },
            { key: 'cooperative_spirit', label: 'Esprit de coopération', summary: 'Une fois par mission, face à une perte d\'Influence avec une faction fidèle de l\'Imperium, Test de Rapport : en cas de réussite, la perte baisse de 1 (minimum 1).' },
            { key: 'suppression_orders', label: 'Ordres d\'étouffement', summary: '+1 DR aux Tests pour convaincre les autorités locales d\'étouffer une information, de bloquer des communications ou de stopper une enquête qui vous exposerait, vous et vos compagnons.' },
        ],
        options: null, effects: null,
    },
    {
        key: 'apostle_of_the_lex', label: 'Apôtre du Lex', labelEn: 'Apostle of the Lex', source: 'ipg', page: 63,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Connaît le Lex Imperialis. À chaque prise, choisir : Loi impériale (+2 DR aux Tests de Savoir pour se rappeler les lois et procédures), Jugement (+2 DR en Présence (Interrogatoire) ou (Intimidation) contre qui peut craindre la loi impériale) ou Exécuteur (+2 DR aux Tests de Rapport pour travailler avec des enforcers, des Vigilites ou l\'Adeptus Arbites).',
        repeatable: true, repeatNotes: 'À chaque prise, une des options.',
        options: [ { key: 'imperial_law', label: 'Loi impériale' }, { key: 'judgement', label: 'Jugement' }, { key: 'enforcer', label: 'Exécuteur' } ],
        effects: null,
    },
    {
        key: 'ballistic_forensics', label: 'Balistique légale', labelEn: 'Ballistic Forensics', source: 'ipg', page: 63,
        requirement: { text: '1 Avance en Logique (Enquête) et en Distance', chars: {}, skills: { ranged: 1 }, specs: { 'logic.investigation': 1 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'En examinant une scène par Logique (Enquête), apprend aussi les armes à distance et les munitions employées ; un DR élevé peut révéler le niveau des tireurs.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'blunt_force_authority', label: 'Autorité brutale', labelEn: 'Blunt Force Authority', source: 'ipg', page: 63,
        requirement: { text: '2 Avances en Présence (Intimidation)', chars: {}, skills: {}, specs: { 'presence.intimidation': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'En usant de son autorité, sacrifier de la Subtilité pour avoir Avantage à un Test de Présence (Interrogatoire) ou (Intimidation) ; ou baisser la Subtilité de 1 pour +3 DR à un Test de Rapport qui utilise l\'Influence.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'clandestine', label: 'Clandestin', labelEn: 'Clandestine', source: 'ipg', page: 64,
        requirement: { text: '2 Avances en Rapport et en Présence', chars: {}, skills: { rapport: 2, presence: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Si la Subtilité du groupe est Suspecte ou Manifeste (7-2) ou pire, dépenser 1 point de Destin pour être compté Clandestin (10-8), seul, pendant une journée ; les pertes de Subtilité qu\'on cause touchent toujours le groupe.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'condemnors_boon', label: 'Grâce du condamneur', labelEn: 'Condemnor\'s Boon', source: 'ipg', page: 64,
        requirement: { text: 'Force Mentale 40, talent Psyker ou talent Condamner la sorcière', chars: { wil: 40 }, skills: {}, specs: {}, anyOf: [ { talents: ['psyker'] }, { talents: ['condemn_the_witch'] } ], talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage pour Contrer la sorcière (core p.163).',
        repeatable: 3, repeatNotes: 'Deuxième prise : Contrer la sorcière à Portée moyenne au lieu de courte ; troisième prise : à Portée longue.', options: null, effects: null,
    },
    {
        key: 'cult_infiltrator', label: 'Infiltrateur de culte', labelEn: 'Cult Infiltrator', source: 'ipg', page: 64,
        requirement: { text: '2 Avances en Discipline et en Rapport', chars: {}, skills: { discipline: 2, rapport: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'À chaque prise, choisir un déguisement de culte et gagner 2 points de Corruption : Hérétek (fausse augmétique, +2 DR aux Tests de Tech), Aristocrate (+2 DR en Rapport avec les personnages qu\'on connaît), Tolérant (Avantage pour résister à l\'ivresse, aux drogues, poisons et maladies), Souillé (fausses marques du Chaos pour infiltrer un culte).',
        repeatable: true, repeatNotes: 'À chaque prise, un déguisement et +2 Corruption.',
        options: [ { key: 'heretek', label: 'Hérétek' }, { key: 'aristocrat', label: 'Aristocrate' }, { key: 'tolerant', label: 'Tolérant' }, { key: 'tainted', label: 'Souillé' } ],
        effects: null,
    },
    {
        key: 'cypherist', label: 'Cryptographe', labelEn: 'Cypherist', source: 'ipg', page: 64,
        requirement: { text: '2 Avances en Linguistique (Chiffres) et en Logique', chars: {}, skills: { logic: 2 }, specs: { 'linguistics.cypher': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux Tests pour reconnaître ou déchiffrer symboles, marques et codes secrets.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'familiar_bonded', label: 'Lié à un familier', labelEn: 'Familiar Bonded', source: 'ipg', page: 65,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Peut se lier à un familier ordinaire (chapitre VI, p.100), qu\'il faut encore trouver et acheter.',
        repeatable: 3, repeatNotes: 'Deuxième prise : formé aux cyber-familiers ou aux psyber-familiers ; troisième prise : à l\'autre type. Les familiers combinés sont permis si l\'on a tous leurs prérequis.', options: null, effects: null,
    },
    {
        key: 'gut_instinct', label: 'Instinct', labelEn: 'Gut Instinct', source: 'ipg', page: 65,
        requirement: { text: '2 Avances en Logique (Enquête)', chars: {}, skills: {}, specs: { 'logic.investigation': 2 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Pendant une enquête ou une recherche, dépenser 1 point de Destin pour obtenir du MJ une intuition personnelle (où aller, que faire, quel lien, à qui parler).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'hardened_suspicion', label: 'Méfiance endurcie', labelEn: 'Hardened Suspicion', source: 'ipg', page: 65,
        requirement: { text: '2 Avances en Vigilance et en Intuition', chars: {}, skills: { awareness: 2, intuition: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: '+1 DR aux Tests de Vigilance et d\'Intuition contre les xenos et les créatures du Chaos (cultistes, mutants, démons).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'inspired_defiance', label: 'Défi inspiré', labelEn: 'Inspired Defiance', source: 'ipg', page: 65,
        requirement: { text: '3 Avances en Discipline', chars: {}, skills: { discipline: 3 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux Tests de Robustesse et de Discipline pour résister à la Corruption.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'logical_liar', label: 'Menteur logique', labelEn: 'Logical Liar', source: 'ipg', page: 65,
        requirement: { text: '2 Avances en Logique', chars: {}, skills: { logic: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Lors d\'un Test de Tromperie, dépenser 1 point de Destin pour utiliser l\'Intelligence comme caractéristique au lieu de « Rapport » (sic, voir l\'en-tête).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'many_masks', label: 'Mille visages', labelEn: 'Many Masks', source: 'ipg', page: 65,
        requirement: { text: '2 Avances en Discrétion, dont au moins une en Discrétion (Déguisement)', chars: {}, skills: {}, specs: { 'stealth.disguise': 1 }, advancesAcross: { total: 2, keys: ['stealth', 'stealth.disguise'] }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux Tests pour appliquer une trousse de déguisement et adopter une nouvelle identité ou un nouveau personnage.',
        repeatable: true,
        repeatNotes: [
            { key: 'fall_guy', label: 'Bouc émissaire', summary: '« Brûler » un déguisement ou une identité en l\'impliquant pour réduire d\'un cran une perte de Subtilité ; les soupçons ne cessent pas pour autant.' },
            { key: 'unmasked', label: 'Démasqué', summary: 'Par une Réaction avant le début du combat, se révéler de façon spectaculaire pour obtenir la Surprise (core p.199).' },
        ],
        options: null, effects: null,
    },
    {
        key: 'security_augur', label: 'Augure de sécurité', labelEn: 'Security Augur', source: 'ipg', page: 66,
        requirement: { text: '3 Avances en Tech (Sécurité)', chars: {}, skills: {}, specs: { 'tech.security': 3 }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Avantage aux Tests pour identifier les systèmes de sécurité et pour interagir avec eux (saboter, contourner, consulter).',
        repeatable: 2, repeatNotes: 'Deuxième prise : en quittant un système accédé, Test de Tech (Sécurité) (Difficulté du MJ) pour effacer ses traces (journaux d\'accès, codes), ce qui peut limiter l\'effet sur la Subtilité.', options: null, effects: null,
    },
    {
        key: 'shadow_operative', label: 'Agent de l\'ombre', labelEn: 'Shadow Operative', source: 'ipg', page: 66,
        requirement: { text: '3 Avances en Discrétion', chars: {}, skills: { stealth: 3 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Ignore le Désavantage aux Tests de Discrétion dû à la Subtilité actuelle.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'subtle_influencer', label: 'Influence discrète', labelEn: 'Subtle Influencer', source: 'ipg', page: 66,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'La première perte de Subtilité à laquelle on contribuerait dans une mission n\'a pas lieu.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'subtle_mutation', label: 'Mutation discrète', labelEn: 'Subtle Mutation', source: 'ipg', page: 66,
        requirement: { text: 'Aucun', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Tirer une mutation positive et une négative sur la table des mutations discrètes (ipg p.66, renvois aux tables core p.222-223). Les futures mutations ou malignités dues à la Corruption peuvent être tirées sur cette table, toujours une positive et une négative (relancer les doublons).',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'subtle_psyker', label: 'Psyker discret', labelEn: 'Subtle Psyker', source: 'ipg', page: 67,
        requirement: { text: 'Force Mentale 40, talent Psyker et 3 Avances en Maîtrise psychique (livre : « Psychic Powers »)', chars: { wil: 40 }, skills: { psychic_mastery: 3 }, specs: {}, talents: ['psyker'], notTalents: [], creationOnly: false, gm: false },
        summary: 'Jet de Phénomènes psychiques à −10. Quand une manifestation ferait baisser la Subtilité, Test de Discrétion Exigeant (+0) : en cas de réussite, aucune perte.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'tainted_vessel', label: 'Réceptacle souillé', labelEn: 'Tainted Vessel', source: 'ipg', page: 67,
        requirement: { text: 'Aucun (a servi de réceptacle à un démon et survécu à un exorcisme)', chars: {}, skills: {}, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: '−1 DR à tous les Tests de Sociabilité ; immunisé aux effets mutagènes de la Corruption ; +1 DR aux Tests de Vigilance pour détecter les démons ou leurs phénomènes ; immunisé à une nouvelle possession par le même démon.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'unwavering_will', label: 'Volonté inflexible', labelEn: 'Unwavering Will', source: 'ipg', page: 67,
        requirement: { text: 'Force Mentale 40 et 2 Avances en Discipline', chars: { wil: 40 }, skills: { discipline: 2 }, specs: {}, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'Action gratuite, 1 point de Destin : BFM doublé jusqu\'à la fin de la rencontre.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
    {
        key: 'you_didnt_see_anything', label: 'Vous n\'avez rien vu', labelEn: 'You Didn\'t See Anything', source: 'ipg', page: 67,
        requirement: { text: '2 Avances au total parmi Logique (Enquête), Discrétion et Tech (Sécurité)', chars: {}, skills: {}, specs: {}, advancesAcross: { total: 2, keys: ['logic.investigation', 'stealth', 'tech.security'] }, talents: [], notTalents: [], creationOnly: false, gm: false },
        summary: 'En quittant une rencontre, annuler la perte de Subtilité à laquelle on a contribué, par un Test au choix du MJ : Logique (Enquête) (effacer les traces, maquiller les faits), Discrétion (passer inaperçu), Tech (Sécurité) (saboter les enregistreurs). Un Test de Logique ou de Tech prend au moins 10 minutes.',
        repeatable: false, repeatNotes: null, options: null, effects: null,
    },
];

// Table des talents aléatoires (core p.74, option à décider en groupe). Talent déjà possédé : choisir
// un talent dont on remplit les prérequis. 99 : relancer deux fois ; 00 : Psyker ou Intouchable.
export const RANDOM_TALENTS = [
    { min: 1, max: 10, talent: 'acute_sense' },
    { min: 11, max: 13, talent: 'adrenaline_acceleration' },
    { min: 14, max: 15, talent: 'ambidextrous' },
    { min: 16, max: 17, talent: 'artistic' },
    { min: 18, max: 19, talent: 'gothic_gibberish' },
    { min: 20, max: 21, talent: 'holdout_expert' },
    { min: 22, max: 23, talent: 'contortionist' },
    { min: 24, max: 25, talent: 'distracting' },
    { min: 26, max: 27, talent: 'disturbing_voice' },
    { min: 28, max: 29, talent: 'eidetic_memory' },
    { min: 30, max: 31, talent: 'familiar_terrain' },
    { min: 32, max: 35, talent: 'fated' },
    { min: 36, max: 42, talent: 'flagellant' },
    { min: 43, max: 44, talent: 'forbidden_knowledge' },
    { min: 45, max: 48, talent: 'frenzy' },
    { min: 49, max: 54, talent: 'hatred' },
    { min: 55, max: 60, talent: 'lickspittle' },
    { min: 61, max: 64, talent: 'inheritor' },
    { min: 65, max: 66, talent: 'secret_identity' },
    { min: 67, max: 75, talent: 'tenacious' },
    { min: 76, max: 88, talent: 'unremarkable' },
    { min: 89, max: 92, talent: 'devoted_servant' },
    { min: 93, max: 94, talent: 'void_legs' },
    { min: 95, max: 98, talent: 'well_prepared' },
    { min: 99, max: 99, talent: null, rollTwice: true },
    { min: 100, max: 100, talent: null, choice: ['psyker', 'blank'] },
];

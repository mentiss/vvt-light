// Origines du personnage (Imperium Maledictum).
// Sources : livre de base (CORE) p.51-54, table d100 p.51 relue sur le PDF ;
// Inquisition Player's Guide (IPG) p.40-45, « Inquisition Origins Table » p.40 relue sur le PDF.
// Données seules : clés anglaises stables, libellés français, labelEn = nom VO.
//
// ORIGINS : +5 fixe (fixed) et +5 à l'une des trois caractéristiques de choice, un objet.
// INQUISITION_ORIGINS : paquets de bonus (~100 XP, IPG p.40) utilisables à la place des origines
// planétaires ; même forme, bonus hors caractéristiques en clair :
//   talents      : clés de talents (talents.js) ;
//   choice       : caractéristiques au choix pour le +5 ('any' : n'importe laquelle) ;
//   choiceSkills : compétences admises pour ce même +5 au choix (le livre mélange compétences et
//                  caractéristiques dans la liste) ;
//   skillBonus   : +5 fixe à une compétence ;
//   specs        : Avances de spécialisation fixes ('competence.specialisation': n) ;
//   specChoice   : Avances de spécialisation au choix { pick, from } ;
//   specNote     : précision du livre sur le sujet de la spécialisation ;
//   noInfluence  : aucune Influence issue de la création (Tabula Rasa).
//
// À relire :
// - « +5 to either Discipline, Melee, or Ranged » (Bannisseur), « +5 to either Intelligence, Rapport,
//   or Willpower » (Contremaître) et « +5 Stealth » (Infiltré dans un culte) : le livre donne +5 à une
//   compétence ; lu comme une Avance (une Avance de compétence = +5), à confirmer.
// - Apostat du Credo : « Forbidden (Various) or Theology (Restricted) » ; les spécialisations
//   Interdit existent en Linguistique, Savoir et Médicae (CORE), d'où la liste de specChoice.
// - Augmétique insolite : augmétique au choix avec le défaut Encombrant ou Laid, effets à définir
//   avec le MJ (texte libre, rien de chiffré).
// - Libellés d'objets provisoires, à aligner sur equipment.js et equipmentInquisition.js.

export const ORIGINS = [
    {
        key: 'agri_world', label: 'Monde agricole', labelEn: 'Agri World', source: 'core', page: 52, roll: [1, 10],
        fixed: { str: 5 }, choice: ['tgh', 'ag', 'wil'], equipment: ['Outil de terrassement (Médiocre)'],
        summary: 'Planète vouée à nourrir les masses de l\'Imperium sous une dîme écrasante ; ses habitants sont surtout des travailleurs forts et endurants.',
        worlds: ['Crultus', 'Harjus'],
    },
    {
        key: 'feudal_world', label: 'Monde féodal', labelEn: 'Feudal World', source: 'core', page: 53, roll: [11, 20],
        fixed: { ws: 5 }, choice: ['str', 'wil', 'fel'], equipment: ['Nécessaire d\'écriture (Médiocre)'],
        summary: 'Monde retombé à un niveau préindustriel, dont la dîme se paie le plus souvent en soldats pour l\'Astra Militarum.',
        worlds: ['Somrot', 'Octavian Secundus'],
    },
    {
        key: 'feral_world', label: 'Monde sauvage', labelEn: 'Feral World', source: 'core', page: 53, roll: [21, 30],
        fixed: { tgh: 5 }, choice: ['ws', 'str', 'per'], equipment: ['Équipement de survie (Médiocre)'],
        summary: 'Planète sans développement technologique où l\'on survit aux éléments et à une faune mortelle ; elle fournit des guerriers robustes.',
        worlds: ['Goros Pok', 'Illisear'],
    },
    {
        key: 'forge_world', label: 'Monde-forge', labelEn: 'Forge World', source: 'core', page: 53, roll: [31, 40],
        fixed: { int: 5 }, choice: ['bs', 'tgh', 'ag'], equipment: ['Fiole d\'onguents sacrés'],
        summary: 'Planète de l\'Adeptus Mechanicus vouée à la production technologique et au culte du Dieu-Machine ; ses natifs connaissent la technologie avancée.',
        worlds: ['Eskutchtax', 'Hexas Panan'],
    },
    {
        key: 'hive_world', label: 'Monde-ruche', labelEn: 'Hive World', source: 'core', page: 53, roll: [41, 70],
        fixed: { ag: 5 }, choice: ['bs', 'per', 'fel'], equipment: ['Paire de bouchons filtrants (Laids)'],
        summary: 'Monde dominé par des cités verticales de milliards d\'âmes, stratifiées des hauteurs nobles à la sous-ruche sans loi.',
        worlds: ['Persepolis', 'Voll'],
    },
    {
        key: 'shrine_world', label: 'Monde-sanctuaire', labelEn: 'Shrine World', source: 'core', page: 54, roll: [71, 80],
        fixed: { wil: 5 }, choice: ['int', 'per', 'fel'], equipment: ['Icône sacrée'],
        summary: 'Planète sainte gouvernée par l\'Ecclésiarchie sous les strictures les plus rigides du Credo impérial ; ses habitants sont dévots et habitués aux pèlerins.',
        worlds: ['Macharia', 'St. Isidore\'s Rest'],
    },
    {
        key: 'schola_progenium', label: 'Schola Progenium', labelEn: 'Schola Progenium', source: 'core', page: 54, roll: [81, 90],
        fixed: { fel: 5 }, choice: ['ws', 'bs', 'tgh'], equipment: ['Chrono'],
        summary: 'Orphelin de serviteurs de l\'Imperium, élevé par l\'Ecclésiarchie dans une schola sous un régime d\'endoctrinement, d\'entraînement et d\'éducation sévère.',
        worlds: ['Schola de Notre Seigneur Solaire (Macharia)', 'Schola de la Bienfaisance de saint Isodore (St. Isodore\'s Rest)'],
    },
    {
        key: 'voidborn', label: 'Né du vide', labelEn: 'Voidborn', source: 'core', page: 54, roll: [91, 100],
        fixed: { per: 5 }, choice: ['ag', 'int', 'wil'], equipment: ['Bottes magnétiques (Médiocres)'],
        summary: 'Né à bord d\'un vaisseau ou d\'une station, habitué à l\'apesanteur, au vide et aux cauchemars du Warp.',
        worlds: ['L\'Archipel de Fer', 'Arrian\'s Wrath'],
    },
];

export const INQUISITION_ORIGINS = [
    {
        key: 'daemonic_host', label: 'Hôte démoniaque', labelEn: 'Daemonic Host', source: 'ipg', page: 41, roll: [1, 5],
        group: 'damned_useful', groupLabel: 'Damné mais utile', groupLabelEn: 'Damned Useful',
        fixed: {}, choice: [], talents: ['tainted_vessel'], equipment: ['Menottes (Médiocres)'],
        summary: 'Vous avez servi d\'hôte démoniaque à un culte et survécu, par chance ou par exorcisme ; vous en gardez des cicatrices de l\'âme.',
    },
    {
        key: 'null_persona', label: 'Persona nulle', labelEn: 'Null Persona', source: 'ipg', page: 41, roll: [6, 10],
        group: 'damned_useful', groupLabel: 'Damné mais utile', groupLabelEn: 'Damned Useful',
        fixed: {}, choice: [], talents: ['blank'], equipment: ['Lampe-torche (Médiocre)'],
        summary: 'Porteur du gène paria, sans présence psychique : invisible aux démons, précieux pour l\'Ordo Malleus, insupportable aux humains et aux psykers.',
    },
    {
        key: 'gland_warrior', label: 'Guerrier glandulaire', labelEn: 'Gland Warrior', source: 'ipg', page: 41, roll: [11, 15],
        group: 'death_world_veteran', groupLabel: 'Vétéran de monde-mortel', groupLabelEn: 'Death World Veteran',
        fixed: { tgh: 5 }, choice: [], equipment: ['Glande de combat (augmétique, IPG p.94)'],
        summary: 'Modifié génétiquement par l\'Adeptus Mechanicus pour survivre aux mondes les plus hostiles ; beaucoup gardent une psychose durable.',
    },
    {
        key: 'sole_survivor', label: 'Unique survivant', labelEn: 'Sole Survivor', source: 'ipg', page: 41, roll: [16, 20],
        group: 'death_world_veteran', groupLabel: 'Vétéran de monde-mortel', groupLabelEn: 'Death World Veteran',
        fixed: { str: 5 }, choice: ['tgh', 'ag', 'wil'], equipment: [],
        summary: 'Seul rescapé de votre régiment anéanti sur un monde-mortel, vous avez achevé la mission et attiré l\'attention de l\'Inquisition.',
    },
    {
        key: 'banisher', label: 'Bannisseur', labelEn: 'Banisher', source: 'ipg', page: 42, roll: [21, 25],
        group: 'hexorcist', groupLabel: 'Hexorciste', groupLabelEn: 'Hexorcist',
        fixed: { wil: 5 }, choice: [], choiceSkills: ['discipline', 'melee', 'ranged'], equipment: ['Icône sacrée (Médiocre)'],
        summary: 'Grandi sur un monde rongé par les cultes et les démons, vous avez survécu à l\'âge adulte la foi intacte. +5 à Discipline, Mêlée ou Distance.',
    },
    {
        key: 'apostate_of_the_creed', label: 'Apostat du Credo', labelEn: 'Apostate of the Creed', source: 'ipg', page: 42, roll: [26, 30],
        group: 'hexorcist', groupLabel: 'Hexorciste', groupLabelEn: 'Hexorcist',
        fixed: {}, choice: [],
        specChoice: { pick: 2, from: ['linguistics.forbidden', 'lore.forbidden', 'medicae.forbidden', 'lore.theology'] },
        equipment: ['Icône sacrée (Médiocre)'],
        summary: 'Ancien initié de l\'Adeptus Ministorum, vous avez quitté vos habits pour combattre seul une corruption que vos frères refusaient de voir. 2 Avances de spécialisation en Interdit (au choix) ou Théologie.',
    },
    {
        key: 'manufactorum_overseer', label: 'Contremaître de manufactorum', labelEn: 'Manufactorum Overseer', source: 'ipg', page: 42, roll: [31, 35],
        group: 'informant', groupLabel: 'Informateur', groupLabelEn: 'Informant',
        fixed: { per: 5 }, choice: ['int', 'wil'], choiceSkills: ['rapport'], equipment: ['Ardoise de données (Médiocre)'],
        summary: 'Contremaître qui a alerté l\'Inquisition en reconnaissant la marque d\'un Hérétek ; +5 à Intelligence, Rapport ou Force Mentale.',
    },
    {
        key: 'merchant_house_servant', label: 'Serviteur de maison marchande', labelEn: 'Merchant House Servant', source: 'ipg', page: 42, roll: [36, 40],
        group: 'informant', groupLabel: 'Informateur', groupLabelEn: 'Informant',
        fixed: {}, choice: [], talents: ['attentive_assistant'], equipment: ['Chrono (Médiocre)'],
        summary: 'Au service d\'une famille marchande, vous avez surpris artefacts xenos et théologie impure, et vous renseignez l\'Inquisition.',
    },
    {
        key: 'illisearean_fenstalker', label: 'Traqueur des marais d\'Illisear', labelEn: 'Illisearean Fenstalker', source: 'ipg', page: 43, roll: [41, 45],
        group: 'nomad', groupLabel: 'Nomade', groupLabelEn: 'Nomad',
        fixed: {}, choice: ['ws', 'str', 'per'], specs: { 'lore.forbidden': 1 },
        specNote: 'Savoir (Interdit) lié à la présence démoniaque d\'Illisear',
        equipment: ['Couteau (Médiocre)'],
        summary: 'Membre d\'une tribu d\'Illisear, élevé dans les rites et protections contre les Démons de la Nuit profonde.',
    },
    {
        key: 'iron_archipelago_pirate', label: 'Pirate de l\'Archipel de Fer', labelEn: 'Iron Archipelago Pirate', source: 'ipg', page: 43, roll: [46, 50],
        group: 'nomad', groupLabel: 'Nomade', groupLabelEn: 'Nomad',
        fixed: {}, choice: ['ws', 'str', 'per'], specs: { 'lore.forbidden': 1 },
        specNote: 'Savoir (Interdit) sur une faction xenos de l\'Archipel de Fer (Kroot, Aeldari…)',
        equipment: ['Pistolet automatique (Médiocre)'],
        summary: 'Élevé dans les habitats de vide de l\'Archipel de Fer, pour qui dangers imprévus et hérésies étranges sont l\'ordinaire.',
    },
    {
        key: 'cult_infiltrator', label: 'Infiltré dans un culte', labelEn: 'Cult Infiltrator', source: 'ipg', page: 43, roll: [51, 55],
        group: 'penitent', groupLabel: 'Pénitent', groupLabelEn: 'Penitent',
        fixed: { fel: 5 }, choice: [], skillBonus: { stealth: 5 }, equipment: ['Robe de cultiste (Médiocre)'],
        summary: 'Pris dans des hérésies mineures, vous expiez en infiltrant un culte pour le compte de l\'Inquisition. +5 en Discrétion.',
    },
    {
        key: 'gang_infiltrator', label: 'Infiltré dans un gang', labelEn: 'Gang Infiltrator', source: 'ipg', page: 43, roll: [56, 60],
        group: 'penitent', groupLabel: 'Pénitent', groupLabelEn: 'Penitent',
        fixed: {}, choice: [], talents: ['familiar_terrain'], equipment: ['Perle vox (Médiocre)'],
        summary: 'Pénitent qui renseigne l\'Inquisition depuis les bas-fonds ; Terrain familier pour un environnement adapté à votre monde.',
    },
    {
        key: 'mutant', label: 'Mutant', labelEn: 'Mutant', source: 'ipg', page: 44, roll: [61, 65],
        group: 'strange_anomaly', groupLabel: 'Étrange anomalie', groupLabelEn: 'Strange Anomaly',
        fixed: {}, choice: [], talents: ['subtle_mutation'], equipment: ['Vêtement pour cacher la mutation (Médiocre)'],
        summary: 'Mutant de naissance ou d\'expérience, épargné parce que votre anomalie sert à traquer les ennemis de l\'Inquisition.',
    },
    {
        key: 'unusual_augment', label: 'Augmétique insolite', labelEn: 'Unusual Augment', source: 'ipg', page: 44, roll: [66, 70],
        group: 'strange_anomaly', groupLabel: 'Étrange anomalie', groupLabelEn: 'Strange Anomaly',
        fixed: {}, choice: [],
        equipment: ['Une augmétique au choix, avec le défaut Encombrant ou Laid (origine, effets et défauts à définir avec le MJ)', 'Outil combiné (Médiocre)'],
        summary: 'Porteur d\'une bionique hétérodoxe d\'origine illégitime, aux capacités et aux défauts mal compris.',
    },
    {
        key: 'scraped_slate', label: 'Ardoise effacée', labelEn: 'Scraped Slate', source: 'ipg', page: 44, roll: [71, 75],
        group: 'tabula_rasa', groupLabel: 'Tabula rasa', groupLabelEn: 'Tabula Rasa',
        fixed: {}, choice: 'any', talents: ['hypno_indoctrination'], noInfluence: true, equipment: [],
        summary: 'Mémoire effacée pour sceller des horreurs vécues. +5 à une caractéristique au choix, aucune Influence issue de la création (le MJ peut noter des valeurs secrètes).',
    },
    {
        key: 'vat_grown', label: 'Né en cuve', labelEn: 'Vat Grown', source: 'ipg', page: 44, roll: [76, 80],
        group: 'tabula_rasa', groupLabel: 'Tabula rasa', groupLabelEn: 'Tabula Rasa',
        fixed: {}, choice: 'any', talents: ['hypno_indoctrination'], noInfluence: true, equipment: [],
        summary: 'Cultivé du zygote à l\'âge adulte pour servir l\'Inquisition, sans passé. +5 à une caractéristique au choix, aucune Influence issue de la création.',
    },
    {
        key: 'cult_captive', label: 'Captif d\'un culte', labelEn: 'Cult Captive', source: 'ipg', page: 45, roll: [81, 85],
        group: 'vengeful_relict', groupLabel: 'Rescapé vengeur', groupLabelEn: 'Vengeful Relict',
        fixed: {}, choice: [], talents: ['hatred'], equipment: ['Robe de cultiste (Médiocre)'],
        summary: 'Retenu par un culte puis libéré, vous avez juré vengeance. Haine envers le dieu et les cultistes qui vous ont capturé.',
    },
    {
        key: 'xenos_captive', label: 'Captif des xenos', labelEn: 'Xenos Captive', source: 'ipg', page: 45, roll: [86, 90],
        group: 'vengeful_relict', groupLabel: 'Rescapé vengeur', groupLabelEn: 'Vengeful Relict',
        fixed: {}, choice: [], talents: ['hatred'], equipment: ['Couteau d\'origine xenos (Médiocre)'],
        summary: 'Captif d\'une espèce xenos (Drukhari, Orks, Kroot…) dont vous avez réchappé. Haine envers l\'espèce qui vous a capturé.',
    },
    {
        key: 'aide_to_the_orders_dialogus', label: 'Assistant des Ordres Dialogus', labelEn: 'Aide to the Orders Dialogus', source: 'ipg', page: 45, roll: [91, 95],
        group: 'xenos_dialogus', groupLabel: 'Xenos-Dialogus', groupLabelEn: 'Xenos-Dialogus',
        fixed: { fel: 5 }, choice: [], specs: { 'linguistics.forbidden': 1 },
        specNote: 'Linguistique (Interdit) pour l\'espèce xenos que vous connaissez',
        equipment: ['Plume automatique (Médiocre)'],
        summary: 'Formé auprès d\'une érudite des Ordres Dialogus de l\'Adepta Ministorum, versé dans sa spécialité linguistique xenos.',
    },
    {
        key: 'rogue_trader_retinue', label: 'Suite d\'un Libre-Marchand', labelEn: 'Rogue Trader Retinue', source: 'ipg', page: 45, roll: [96, 100],
        group: 'xenos_dialogus', groupLabel: 'Xenos-Dialogus', groupLabelEn: 'Xenos-Dialogus',
        fixed: { fel: 5 }, choice: [], specs: { 'linguistics.forbidden': 1 },
        specNote: 'Linguistique (Interdit) pour l\'espèce xenos que vous connaissez',
        equipment: ['Plume automatique (Médiocre)'],
        summary: 'Des années au service d\'une maison de Libre-Marchand, à commercer avec des xenos dont vous connaissez la langue et les usages.',
    },
];

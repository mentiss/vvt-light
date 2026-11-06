// Imperium Maledictum : traits d'arme et d'armure, qualités et défauts d'objet.
// Source : livre de base (CORE), chapitre V Armoury, « Weapons and Armour Traits » p.124-125
// (aide-mémoire « Rule cheets » identique), « Craftsmanship » p.121-122.
// Données seules, aucune logique.
//
// Usage dans les catalogues (equipment.js) : traits: [ { key }, { key, rating }, { key, value } ]
//   - rated: true  → { key: 'penetrating', rating: 4 } (valeur numérique entre parenthèses) ;
//   - param: 'condition' → { key: 'inflict', value: 'stunned' } (clé d'état en anglais snake_case) ;
//   - param: 'range'     → { key: 'thrown', value: 'medium' } (clé de portée).
// Le livre présente une seule liste « Weapons and Armour Traits » ; elle est répartie ici en
// WEAPON_TRAITS (traits portés par des armes) et ARMOUR_TRAITS (traits portés par des armures,
// avec leur effet propre aux armures). Heavy, Loud et Subtle existent dans les deux listes.
//
// À relire :
// - Unreliable (défaut) : traduit « Peu fiable », absent du glossaire imposé.
// - Ineffective : « Inefficace » (glossaire) ; Rend : « Déchirante » (glossaire).

export const WEAPON_TRAITS = [
    { key: 'blast', label: 'Explosion', labelEn: 'Blast', rated: false, param: null, source: 'core', page: 124,
        summary: "L'attaque vise une Zone à portée avec un seul Test de CT (Artillerie ou Lancer). Chaque personnage de la Zone fait un Test opposé de Réflexes (Esquive) contre ce résultat ; s'il perd, il subit les Dégâts de l'arme plus l'écart de DR." },
    { key: 'burst', label: 'Rafale', labelEn: 'Burst', rated: false, param: null, source: 'core', page: 124,
        summary: "On peut déclarer une rafale au lieu d'un tir simple : +1 DR au Test de Distance, et le chargeur perd 1 munition. Une arme à Tir rapide a toujours Rafale, sans pouvoir cumuler les deux." },
    { key: 'close', label: 'Proche', labelEn: 'Close', rated: false, param: null, source: 'core', page: 124,
        summary: "L'arme à distance s'utilise à portée de Contact sans Désavantage au jet d'attaque." },
    { key: 'defensive', label: 'Défensive', labelEn: 'Defensive', rated: false, param: null, source: 'core', page: 124,
        summary: 'Avantage aux Tests opposés pour se défendre des attaques de mêlée avec cette arme.' },
    { key: 'flamer', label: 'Lance-flammes', labelEn: 'Flamer', rated: false, param: null, source: 'core', page: 124,
        summary: "Les attaques ignorent le Couvert. Au lieu d'une créature, on peut viser une Zone à portée : elle devient un Danger majeur (Major Hazard) jusqu'à la fin du tour suivant du tireur." },
    { key: 'heavy', label: 'Lourde', labelEn: 'Heavy', rated: true, param: null, source: 'core', page: 124,
        summary: "Il faut un BF au moins égal à la valeur. Sinon : Désavantage aux Tests de CC (mêlée) ou de CT (distance). Au lieu de se déplacer, on peut caler une arme à distance Lourde sur un élément de décor et ignorer le trait jusqu'au prochain Mouvement." },
    { key: 'ineffective', label: 'Inefficace', labelEn: 'Ineffective', rated: false, param: null, source: 'core', page: 124,
        summary: "Toute Armure compte double contre l'arme, et un coup réussi n'inflige pas automatiquement au moins 1 Blessure." },
    { key: 'inflict', label: 'Inflige', labelEn: 'Inflict', rated: false, param: 'condition', source: 'core', page: 124,
        summary: "Si l'attaque inflige des Blessures, la cible subit l'État indiqué, en général jusqu'à la fin de son tour suivant (sauf durée ou condition de fin propre à l'équipement)." },
    { key: 'loud', label: 'Bruyante', labelEn: 'Loud', rated: false, param: null, source: 'core', page: 124,
        summary: "Une attaque avec l'arme signale la présence du tireur à tous ceux qui sont à portée Longue." },
    { key: 'penetrating', label: 'Perforante', labelEn: 'Penetrating', rated: true, param: null, source: 'core', page: 125,
        summary: "Les attaques ignorent un nombre de points d'Armure égal à la valeur." },
    { key: 'rapid_fire', label: 'Tir rapide', labelEn: 'Rapid Fire', rated: true, param: null, source: 'core', page: 125,
        summary: "On peut déclarer un tir rapide : soit l'arme gagne Dispersion, soit on a Avantage au jet et les Dégâts augmentent de la valeur. Dans les deux cas le chargeur perd autant de munitions que la valeur (impossible s'il en reste moins). L'arme compte toujours comme ayant Rafale, sans cumul." },
    { key: 'reach', label: 'Allonge', labelEn: 'Reach', rated: false, param: null, source: 'core', page: 125,
        summary: "Permet d'attaquer toute créature de sa Zone sans s'Engager avec elle. Engagé, on a Désavantage aux Tests de Mêlée pour se défendre avec cette arme." },
    { key: 'reliable', label: 'Fiable', labelEn: 'Reliable', rated: false, param: null, source: 'core', page: 125,
        summary: "Sur une Maladresse en combat avec l'arme, lancer 1d10 : sur 4+, on ignore le résultat de la Maladresse." },
    { key: 'rend', label: 'Déchirante', labelEn: 'Rend', rated: true, param: null, source: 'core', page: 125,
        summary: "Si l'arme inflige des Blessures, l'Armure de la localisation touchée baisse de la valeur jusqu'à réparation." },
    { key: 'spread', label: 'Dispersion', labelEn: 'Spread', rated: false, param: null, source: 'core', page: 125,
        summary: "Toute créature à portée de Contact de la cible fait un Test Exigeant (+0) de Réflexes (Esquive) ou subit la moitié des Dégâts. Si l'arme a déjà Dispersion et la regagne (par Tir rapide…), un échec fait subir les Dégâts entiers." },
    { key: 'subtle', label: 'Discrète', labelEn: 'Subtle', rated: false, param: null, source: 'core', page: 125,
        summary: "Arme silencieuse et facile à cacher : Désavantage aux Tests de Vigilance pour repérer son usage ou la trouver sur soi." },
    { key: 'supercharge', label: 'Surcharge', labelEn: 'Supercharge', rated: true, param: null, source: 'core', page: 125,
        summary: "Au tir, on peut surcharger l'arme : Dégâts augmentés de la valeur, munitions consommées doublées." },
    { key: 'thrown', label: 'Lancer', labelEn: 'Thrown', rated: false, param: 'range', source: 'core', page: 125,
        summary: "L'arme de mêlée peut être lancée pour une attaque à distance, à la portée indiquée entre parenthèses." },
    { key: 'two_handed', label: 'Deux mains', labelEn: 'Two-handed', rated: false, param: null, source: 'core', page: 125,
        summary: "Arme encombrante qui se manie à deux mains." },
    { key: 'unstable', label: 'Instable', labelEn: 'Unstable', rated: false, param: null, source: 'core', page: 125,
        summary: "Sur une Maladresse en combat avec l'arme, lancer 1d10 : sur 4+, l'arme explose et inflige ses Dégâts au bras principal du porteur (aux deux bras si elle est à Deux mains)." },
];

export const ARMOUR_TRAITS = [
    { key: 'heavy', label: 'Lourde', labelEn: 'Heavy', rated: true, param: null, source: 'core', page: 124,
        summary: "Il faut un BF au moins égal à la valeur ; sinon l'armure impose un Désavantage aux Tests d'Agilité." },
    { key: 'loud', label: 'Bruyante', labelEn: 'Loud', rated: false, param: null, source: 'core', page: 124,
        summary: "L'armure impose un Désavantage aux Tests de Discrétion." },
    { key: 'shield', label: 'Bouclier', labelEn: 'Shield', rated: true, param: null, source: 'core', page: 125,
        summary: "En se préparant contre les tirs avec ce bouclier (p.142), on gagne un bonus d'Armure égal à la valeur." },
    { key: 'subtle', label: 'Discrète', labelEn: 'Subtle', rated: false, param: null, source: 'core', page: 125,
        summary: "Armure peu visible : Désavantage aux Tests de Vigilance pour voir qu'on la porte. Elle se porte avec une autre armure non Discrète ; les deux valeurs d'Armure s'additionnent sur la localisation." },
];

export const ITEM_QUALITIES = [
    { key: 'lightweight', label: 'Léger', labelEn: 'Lightweight', source: 'core', page: 121,
        summary: "Encombrement −1. Si l'objet tombe à 0 ou y est déjà, le MJ peut à la place lui donner le trait Discrète." },
    { key: 'master_crafted', label: 'De maître', labelEn: 'Master Crafted', source: 'core', page: 122,
        summary: '+1 DR à tous les Tests concernés quand on utilise l\'arme, l\'équipement ou l\'outil. Une armure de maître gagne +2 Armure.' },
    { key: 'ornamental', label: 'Ornementé', labelEn: 'Ornamental', source: 'core', page: 122, repeatable: true,
        summary: "Cumulable. Au choix du MJ, un objet assez impressionnant peut accorder +1 DR aux Tests de Sociabilité face à ceux qui en apprécient l'esthétique." },
    { key: 'durable', label: 'Robuste', labelEn: 'Durable', source: 'core', page: 122,
        summary: "Une arme gagne le trait Fiable. Tout autre équipement ignore la première perte d'un point d'Armure, ou la première panne, et continue de fonctionner normalement." },
];

export const ITEM_FLAWS = [
    { key: 'bulky', label: 'Encombrant', labelEn: 'Bulky', source: 'core', page: 122,
        summary: "Encombrement +1. L'objet perd le trait Discrète." },
    { key: 'shoddy', label: 'Médiocre', labelEn: 'Shoddy', source: 'core', page: 122,
        summary: "−10 % à tous les Tests concernés quand on utilise l'arme, l'équipement ou l'outil. Une armure médiocre a −2 Armure (minimum 1)." },
    { key: 'ugly', label: 'Laid', labelEn: 'Ugly', source: 'core', page: 122,
        summary: "Au choix du MJ, −1 DR aux Tests de Sociabilité face à ceux qui accordent de l'importance à l'esthétique." },
    { key: 'unreliable', label: 'Peu fiable', labelEn: 'Unreliable', source: 'core', page: 122,
        summary: "L'objet gagne le trait Instable. S'il l'est déjà, il s'autodétruit dès qu'il s'enraye." },
];

// Imperium Maledictum : catalogue de l'Armurerie du livre de base.
// Source : livre de base (CORE), chapitre V Armoury, p.118-157. Toutes les tables relues sur les
// pages du PDF rendues en image (décalage page imprimée / page PDF : 0).
//   Commerce p.118-121, artisanat p.121-122, encombrement p.122-123, armes de mêlée p.126-128,
//   armes à distance p.129-133, munitions p.132-134, grenades et explosifs p.134-136,
//   modifications p.136-138, armures p.139-142, champs de force p.142, vêtements et équipement
//   personnel p.143-145, outils p.145-151, augmétiques p.152-154, services p.155-157.
// Données seules, aucune logique. Traits : clés de traits.js ({ key }, { key, rating }, { key, value }).
//
// Conventions :
// - Armes de mêlée : damage = valeur fixe de la table, damageBonus: 'sb' (+BF) ; range et mag null.
// - damage: null = « – » du livre (l'arme n'inflige pas de Dégâts, seulement l'effet d'un trait).
// - cost / availability null = « – » du livre (objet non vendu, ou prix de l'arme liée).
// - spec : 'compétence.spécialisation' (melee.one_handed, melee.two_handed, melee.brawling,
//   ranged.pistol, ranged.long_gun, ranged.ordnance, ranged.thrown, tech.engineering).
// - Portées : immediate, short, medium, long, extreme. Localisations : voir format_catalogues.md.
// - Les armes n'ont pas de description individuelle dans le livre (summary null) : les règles de
//   leur famille sont dans WEAPON_GROUPS (champ group).
//
// À relire :
// - Mêlée : Axe, Shock Maul et Unarmed sont notés « StB » au lieu de « StrB » (coquille, lu +BF).
// - Écarts entre tables et exemples du livre (la table est retenue) : Chainsword 500 (275 dans
//   l'exemple p.120) ; Mesh Vest 500 et Rare (240 dans l'exemple p.120) ; Combat Shotgun 600 et
//   Scarce (100 dans l'exemple p.132).
// - Executioner Rounds : la colonne Traits indique « Range (Extreme) », ce n'est pas un trait de
//   traits.js ; transcrit en range: 'extreme' (portée de l'arme portée à Extrême, lecture à valider).
// - Modifications : la table nomme « Photo Sight » et « Telescopic Sight », le texte décrit
//   « Omnispex » et « Omniscope » ; rattachés par leur effet (vision dans le noir / portée).
//   Le texte dit « Challenging (−10) Tech (Engineering) » pour poser une modification : la
//   difficulté Exigeant vaut +0, le −10 serait Difficile.
// - Bipod : disponibilité « – » dans la table (null). Backpack Ammo Supply : prix et disponibilité
//   de l'arme liée.
// - Fire Selector « Low-Tech » : aucune famille d'armes Low-Tech dans le livre de base.
// - Disguise Kit : disponibilité « Very Rare », niveau inexistant (availability null).
// - Recoil Glove, Inhaler/Injector, Regicide Set : dans les tables, sans description (summary null).
// - Remote Detonator : décrit p.144, absent des tables (cost, availability, enc null).
// - Mind Impulse Unit (table) : le texte décrit un « Biomechanical Interface » ; rattaché.
// - Augmetic Leg : décrite sous le titre « Augmetic Locomotion ».
// - Traductions sans forme française établie, VO à vérifier : Shock Maul (Masse électrique),
//   Long Las, Hot-Shot (haute énergie), Man-Stopper (Balles d'arrêt), Exterminator Cartridge,
//   Comm Leech, Stummer, Screamer, Laud Hailer, Enforcer Carapace, Regicide Set.
// - Augmétiques nommées « augmétique » (compétence Augmétique) ; factions.js peut les citer
//   « bionique » : à harmoniser.

// ─── Monnaie, disponibilité, commerce (p.118-123) ───────────────────────────

export const CURRENCY = { key: 'solar', label: 'Solar', labelPlural: 'Solars', labelEn: 'Macharian Solar', source: 'core', page: 118 };

export const AVAILABILITY = [
    { key: 'common', label: 'Courante', labelEn: 'Common', rank: 0 },
    { key: 'scarce', label: 'Peu courante', labelEn: 'Scarce', rank: 1 },
    { key: 'rare', label: 'Rare', labelEn: 'Rare', rank: 2 },
    { key: 'exotic', label: 'Exotique', labelEn: 'Exotic', rank: 3 },
];

// Chance (%) de trouver l'objet en stock (Test de disponibilité : 1d100 ≤ valeur) ; 'in_stock' =
// toujours disponible, null = jamais en stock (Exotique : sur décision du MJ, commande ou fabrication).
export const MARKET_AVAILABILITY = {
    source: 'core', page: 119,
    worlds: [
        { key: 'feral', label: 'Monde féral', labelEn: 'Feral World' },
        { key: 'feudal', label: 'Monde féodal', labelEn: 'Feudal World' },
        { key: 'agri', label: 'Monde agricole', labelEn: 'Agri World' },
        { key: 'shrine', label: 'Monde-sanctuaire', labelEn: 'Shrine World' },
        { key: 'hive', label: 'Monde-ruche', labelEn: 'Hive World' },
        { key: 'forge', label: 'Monde-forge', labelEn: 'Forge World' },
    ],
    chances: {
        common: { feral: 'in_stock', feudal: 'in_stock', agri: 'in_stock', shrine: 'in_stock', hive: 'in_stock', forge: 'in_stock' },
        scarce: { feral: 15, feudal: 30, agri: 45, shrine: 60, hive: 75, forge: 90 },
        rare: { feral: null, feudal: 5, agri: 15, shrine: 25, hive: 35, forge: 45 },
        exotic: { feral: null, feudal: null, agri: null, shrine: null, hive: null, forge: null },
    },
    summary: "Échec : nouvel essai sur une autre planète, ou une semaine plus tard si le monde reçoit de nouvelles marchandises. Stock : 1 objet sur les mondes féraux et féodaux, 1d10 sur les mondes-sanctuaires et récupérés, au choix du MJ sur les mondes-ruches et forges ; doublé pour une Courante, divisé par 2 (arrondi au supérieur) pour une Rare.",
};

// Troc : [donnés, reçus] par unité de valeur équivalente, selon la disponibilité des deux objets.
export const BARTER_RATIOS = {
    source: 'core', page: 121,
    common: { common: [1, 1], scarce: [2, 1], rare: [4, 1], exotic: [8, 1] },
    scarce: { common: [1, 2], scarce: [1, 1], rare: [2, 1], exotic: [4, 1] },
    rare: { common: [1, 4], scarce: [1, 2], rare: [1, 1], exotic: [2, 1] },
    exotic: { common: [1, 8], scarce: [1, 4], rare: [1, 2], exotic: [1, 1] },
};

export const TRADE_RULES = {
    source: 'core', page: 120,
    optional: true,
    haggle: { skill: 'rapport.haggle', opposed: true, discountPerSl: 5, maxDiscount: 20, failIncreaseMax: 10,
        summary: "Test opposé de Rapport (Marchandage) : −5 % du prix par DR, au plus −20 %. Échec : prix inchangé, jusqu'à +10 %, ou refus de vendre." },
    evaluation: { skill: 'logic.evaluation',
        summary: "Logique (Évaluation) révèle les qualités et défauts d'un objet et sa vraie valeur." },
    influence: "Au choix du MJ, chaque niveau d'Influence (personnelle ou du Patron) modifie la disponibilité d'un cran ou le prix de 10 %.",
    selling: { ratio: 0.5, roundUp: true,
        summary: "Vente : même procédure qu'à l'achat (disponibilité d'un acheteur), prix de base égal à la moitié du prix (arrondi au supérieur). Chaque division par 2 du prix demandé rend un acheteur plus disponible d'un cran." },
    standardAmmo: { costPercent: 10, availabilityStep: -1, minAvailability: 'common', page: 132,
        summary: "Un chargeur standard coûte 10 % du prix de l'arme ; sa disponibilité est d'un cran plus facile que l'arme (au minimum Courante)." },
};

export const CRAFTSMANSHIP_RULES = {
    source: 'core', page: 121,
    quality: { costMultiplier: 2, availabilityStep: 1,
        summary: "Chaque qualité double le prix et rend l'objet plus rare d'un cran." },
    flaw: { costMultiplier: 0.5, roundUp: true, availabilityStep: -1, exoticUnchanged: true,
        summary: "Chaque défaut divise le prix par 2 (arrondi au supérieur) et rend l'objet plus facile à trouver d'un cran, sauf s'il est Exotique. Un Test Exigeant (+0) d'une compétence adaptée (Évaluation, CC, Tech…) révèle les défauts." },
};

export const ENCUMBRANCE_RULES = {
    source: 'core', page: 122,
    limit: 'sb+tb',
    overburdened: { over: 'sb+tb', condition: 'overburdened',
        summary: "Au-delà de BF + BE : état Surchargé (Désavantage aux Tests d'Agilité, Vitesse réduite d'un cran)." },
    restrained: { over: '2x(sb+tb)', condition: 'restrained',
        summary: "Au-delà de 2 × (BF + BE) : état Entravé, impossible à retirer avant de s'alléger." },
    smallItems: "10 petits objets d'Encombrement 0 valent 1.",
    oversized: "Objets d'Encombrement 4 ou plus : un seul à la fois, souvent à deux mains ou avec un harnais.",
    worn: "Les objets portés (armure, vêtements, bijoux) ont −1 Encombrement une fois portés ; pas les armes.",
};

// ─── Armes ──────────────────────────────────────────────────────────────────

export const WEAPON_GROUPS = [
    { key: 'chain', kind: 'melee', label: 'Armes tronçonneuses', labelEn: 'Chain Weapons', page: 126,
        summary: "Activée (Action gratuite), l'arme a les traits Déchirante et Bruyante et impose un Désavantage aux Tests de Discrétion." },
    { key: 'force', kind: 'melee', label: 'Armes de force', labelEn: 'Force Weapons', page: 127,
        summary: "Maniée par un personnage doté du Talent Psyker, l'arme inflige des Dégâts supplémentaires égaux à sa Charge Warp actuelle, doublés contre un Démon." },
    { key: 'mundane', kind: 'melee', label: 'Armes ordinaires', labelEn: 'Mundane Weapons', page: 126,
        summary: "Armes simples de métal ou de bois, en général avec un seul trait." },
    { key: 'shock', kind: 'melee', label: 'Armes électriques', labelEn: 'Shock Weapons', page: 127,
        summary: "Activée (Action gratuite), l'arme a le trait Inflige (Hébété)." },
    { key: 'power', kind: 'melee', label: 'Armes énergétiques', labelEn: 'Power Weapons', page: 127,
        summary: "Activée (Action gratuite), l'arme a des Dégâts élevés et le trait Perforante." },
    { key: 'bolt', kind: 'ranged', label: 'Armes bolters', labelEn: 'Bolt Weapons', page: 129,
        summary: "Avec les munitions standard, l'arme a les traits Perforante et Dispersion." },
    { key: 'flame', kind: 'ranged', label: 'Armes à flammes', labelEn: 'Flame Weapons', page: 129,
        summary: 'Toujours les traits Lance-flammes et Inflige (En feu), mais des chargeurs limités.' },
    { key: 'las', kind: 'ranged', label: 'Armes laser', labelEn: 'Las Weapons', page: 129,
        summary: "Grands chargeurs et trait Fiable. Rite de la Lumière durable : rechargement sans Test sur une source d'énergie impériale ; sinon, jeté au feu, Test Routinier (+20) de Tech (Int) : 4 heures (8 en cas d'échec), chargeur détruit sur une Maladresse." },
    { key: 'launcher', kind: 'ranged', label: 'Lanceurs', labelEn: 'Launcher Weapons', page: 130,
        summary: "Effets selon la grenade ou le missile chargé (voir GRENADES)." },
    { key: 'melta', kind: 'ranged', label: 'Armes à fusion', labelEn: 'Melta Weapons', page: 130,
        summary: 'Dégâts élevés et trait Déchirante, mais portée réduite.' },
    { key: 'plasma', kind: 'ranged', label: 'Armes à plasma', labelEn: 'Plasma Weapons', page: 130,
        summary: "Dégâts élevés, traits Surcharge et Instable. Si l'arme s'enraye pendant une Surcharge, elle rate automatiquement son Test d'Instable et explose." },
    { key: 'solid_projectile', kind: 'ranged', label: 'Armes à projectiles', labelEn: 'Solid Projectile Weapons', page: 131,
        summary: 'Profils très variés ; acceptent une plus grande variété de munitions spéciales.' },
    { key: 'specialised', kind: 'ranged', label: 'Armes spécialisées', labelEn: 'Specialised Ranged Weapons', page: 131,
        summary: 'Combinaisons de traits propres à chaque arme.' },
];

export const WEAPONS = [
    // Mêlée : armes tronçonneuses (p.128)
    { key: 'chainaxe', label: 'Hache tronçonneuse', labelEn: 'Chainaxe', kind: 'melee', group: 'chain',
        spec: 'melee.one_handed', damage: 3, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 600, availability: 'rare',
        traits: [ { key: 'loud' }, { key: 'rend', rating: 2 } ], source: 'core', page: 128, summary: null },
    { key: 'chainsword', label: 'Épée tronçonneuse', labelEn: 'Chainsword', kind: 'melee', group: 'chain',
        spec: 'melee.one_handed', damage: 3, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 500, availability: 'scarce',
        traits: [ { key: 'loud' }, { key: 'rend', rating: 2 } ], source: 'core', page: 128, summary: null },
    { key: 'eviscerator', label: 'Éviscérateur', labelEn: 'Eviscerator', kind: 'melee', group: 'chain',
        spec: 'melee.two_handed', damage: 5, damageBonus: 'sb', range: null, mag: null, enc: 3, cost: 800, availability: 'rare',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'loud' }, { key: 'rend', rating: 4 }, { key: 'two_handed' } ], source: 'core', page: 128, summary: null },
    // Mêlée : armes de force
    { key: 'force_staff', label: 'Bâton de force', labelEn: 'Force Staff', kind: 'melee', group: 'force',
        spec: 'melee.two_handed', damage: 1, damageBonus: 'sb', range: null, mag: null, enc: 2, cost: 7000, availability: 'exotic',
        traits: [ { key: 'defensive' }, { key: 'two_handed' } ], source: 'core', page: 128, summary: null },
    { key: 'force_sword', label: 'Épée de force', labelEn: 'Force Sword', kind: 'melee', group: 'force',
        spec: 'melee.one_handed', damage: 2, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 8000, availability: 'exotic',
        traits: [], source: 'core', page: 128, summary: null },
    // Mêlée : armes ordinaires
    { key: 'axe', label: 'Hache', labelEn: 'Axe', kind: 'melee', group: 'mundane',
        spec: 'melee.one_handed', damage: 2, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 80, availability: 'common',
        traits: [], source: 'core', page: 128, summary: null },
    { key: 'brass_knuckles', label: 'Poing américain', labelEn: 'Brass Knuckles', kind: 'melee', group: 'mundane',
        spec: 'melee.brawling', damage: 0, damageBonus: 'sb', range: null, mag: null, enc: 0, cost: 30, availability: 'common',
        traits: [ { key: 'subtle' } ], source: 'core', page: 128, summary: null },
    { key: 'flail', label: 'Fléau', labelEn: 'Flail', kind: 'melee', group: 'mundane',
        spec: 'melee.two_handed', damage: 4, damageBonus: 'sb', range: null, mag: null, enc: 2, cost: 200, availability: 'common',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'two_handed' } ], source: 'core', page: 128, summary: null },
    { key: 'great_weapon', label: 'Grande arme', labelEn: 'Great Weapon', kind: 'melee', group: 'mundane',
        spec: 'melee.two_handed', damage: 4, damageBonus: 'sb', range: null, mag: null, enc: 2, cost: 300, availability: 'scarce',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'two_handed' } ], source: 'core', page: 128, summary: null },
    { key: 'hammer', label: 'Marteau', labelEn: 'Hammer', kind: 'melee', group: 'mundane',
        spec: 'melee.one_handed', damage: 2, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 25, availability: 'common',
        traits: [], source: 'core', page: 128, summary: null },
    { key: 'improvised_one_handed', label: 'Arme improvisée (une main)', labelEn: 'Improvised (One-handed)', kind: 'melee', group: 'mundane',
        spec: 'melee.one_handed', damage: 1, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: null, availability: null,
        traits: [ { key: 'ineffective' } ], source: 'core', page: 128, summary: null },
    { key: 'improvised_two_handed', label: 'Arme improvisée (deux mains)', labelEn: 'Improvised (Two-handed)', kind: 'melee', group: 'mundane',
        spec: 'melee.two_handed', damage: 2, damageBonus: 'sb', range: null, mag: null, enc: 3, cost: null, availability: null,
        traits: [ { key: 'ineffective' }, { key: 'two_handed' } ], source: 'core', page: 128, summary: null },
    { key: 'knife', label: 'Couteau', labelEn: 'Knife', kind: 'melee', group: 'mundane',
        spec: 'melee.one_handed', damage: 0, damageBonus: 'sb', range: null, mag: null, enc: 0, cost: 50, availability: 'common',
        traits: [ { key: 'subtle' }, { key: 'thrown', value: 'short' } ], source: 'core', page: 128, summary: null },
    { key: 'staff', label: 'Bâton', labelEn: 'Staff', kind: 'melee', group: 'mundane',
        spec: 'melee.two_handed', damage: 1, damageBonus: 'sb', range: null, mag: null, enc: 2, cost: 25, availability: 'common',
        traits: [ { key: 'defensive' }, { key: 'two_handed' } ], source: 'core', page: 128, summary: null },
    { key: 'sword', label: 'Épée', labelEn: 'Sword', kind: 'melee', group: 'mundane',
        spec: 'melee.one_handed', damage: 2, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 150, availability: 'common',
        traits: [], source: 'core', page: 128, summary: null },
    { key: 'unarmed', label: 'Mains nues', labelEn: 'Unarmed', kind: 'melee', group: 'mundane',
        spec: 'melee.brawling', damage: 0, damageBonus: 'sb', range: null, mag: null, enc: 0, cost: null, availability: null,
        traits: [ { key: 'ineffective' } ], source: 'core', page: 128, summary: null },
    { key: 'whip', label: 'Fouet', labelEn: 'Whip', kind: 'melee', group: 'mundane',
        spec: 'melee.one_handed', damage: 0, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 60, availability: 'scarce',
        traits: [ { key: 'loud' }, { key: 'reach' } ], source: 'core', page: 128, summary: null },
    // Mêlée : armes électriques
    { key: 'electro_flail', label: 'Électro-fléau', labelEn: 'Electro-Flail', kind: 'melee', group: 'shock',
        spec: 'melee.one_handed', damage: 0, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 500, availability: 'scarce',
        traits: [ { key: 'loud' }, { key: 'reach' }, { key: 'inflict', value: 'stunned' } ], source: 'core', page: 128, summary: null },
    { key: 'shock_maul', label: 'Masse électrique', labelEn: 'Shock Maul', kind: 'melee', group: 'shock',
        spec: 'melee.one_handed', damage: 2, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 250, availability: 'scarce',
        traits: [ { key: 'loud' }, { key: 'inflict', value: 'stunned' } ], source: 'core', page: 128, summary: null },
    // Mêlée : armes énergétiques
    { key: 'power_axe', label: 'Hache énergétique', labelEn: 'Power Axe', kind: 'melee', group: 'power',
        spec: 'melee.two_handed', damage: 6, damageBonus: 'sb', range: null, mag: null, enc: 2, cost: 3400, availability: 'rare',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'penetrating', rating: 6 }, { key: 'two_handed' } ], source: 'core', page: 128, summary: null },
    { key: 'power_fist', label: 'Gantelet énergétique', labelEn: 'Power Fist', kind: 'melee', group: 'power',
        spec: 'melee.brawling', damage: 6, damageBonus: 'sb', range: null, mag: null, enc: 2, cost: 4000, availability: 'rare',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'penetrating', rating: 6 } ], source: 'core', page: 128, summary: null },
    { key: 'power_knife', label: 'Couteau énergétique', labelEn: 'Power Knife', kind: 'melee', group: 'power',
        spec: 'melee.one_handed', damage: 2, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 2000, availability: 'rare',
        traits: [ { key: 'penetrating', rating: 2 }, { key: 'subtle' }, { key: 'thrown', value: 'short' } ], source: 'core', page: 128, summary: null },
    { key: 'power_maul', label: 'Masse énergétique', labelEn: 'Power Maul', kind: 'melee', group: 'power',
        spec: 'melee.one_handed', damage: 5, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 3000, availability: 'rare',
        traits: [ { key: 'penetrating', rating: 2 } ], source: 'core', page: 128, summary: null },
    { key: 'power_sword', label: 'Épée énergétique', labelEn: 'Power Sword', kind: 'melee', group: 'power',
        spec: 'melee.one_handed', damage: 4, damageBonus: 'sb', range: null, mag: null, enc: 1, cost: 3000, availability: 'rare',
        traits: [ { key: 'penetrating', rating: 4 } ], source: 'core', page: 128, summary: null },

    // Distance : armes bolters (p.132)
    { key: 'bolt_pistol', label: 'Pistolet bolter', labelEn: 'Bolt Pistol', kind: 'ranged', group: 'bolt',
        spec: 'ranged.pistol', damage: 8, damageBonus: null, range: 'medium', mag: 2, enc: 1, cost: 4000, availability: 'scarce',
        traits: [ { key: 'burst' }, { key: 'close' }, { key: 'loud' }, { key: 'penetrating', rating: 4 }, { key: 'spread' } ], source: 'core', page: 132, summary: null },
    { key: 'boltgun', label: 'Bolter', labelEn: 'Boltgun', kind: 'ranged', group: 'bolt',
        spec: 'ranged.long_gun', damage: 8, damageBonus: null, range: 'long', mag: 4, enc: 2, cost: 5000, availability: 'scarce',
        traits: [ { key: 'loud' }, { key: 'penetrating', rating: 4 }, { key: 'rapid_fire', rating: 2 }, { key: 'spread' }, { key: 'two_handed' } ], source: 'core', page: 132, summary: null },
    { key: 'heavy_bolter', label: 'Bolter lourd', labelEn: 'Heavy Bolter', kind: 'ranged', group: 'bolt',
        spec: 'ranged.ordnance', damage: 10, damageBonus: null, range: 'long', mag: 6, enc: 3, cost: 9000, availability: 'rare',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'penetrating', rating: 5 }, { key: 'loud' }, { key: 'rapid_fire', rating: 3 }, { key: 'spread' }, { key: 'two_handed' } ], source: 'core', page: 132, summary: null },
    // Distance : armes à flammes
    { key: 'hand_flamer', label: 'Lance-flammes léger', labelEn: 'Hand Flamer', kind: 'ranged', group: 'flame',
        spec: 'ranged.pistol', damage: 7, damageBonus: null, range: 'short', mag: 2, enc: 1, cost: 500, availability: 'rare',
        traits: [ { key: 'close' }, { key: 'flamer' }, { key: 'inflict', value: 'ablaze' }, { key: 'loud' } ], source: 'core', page: 132, summary: null },
    { key: 'flamer', label: 'Lance-flammes', labelEn: 'Flamer', kind: 'ranged', group: 'flame',
        spec: 'ranged.long_gun', damage: 8, damageBonus: null, range: 'medium', mag: 4, enc: 2, cost: 1000, availability: 'scarce',
        traits: [ { key: 'flamer' }, { key: 'inflict', value: 'ablaze' }, { key: 'loud' }, { key: 'two_handed' } ], source: 'core', page: 132, summary: null },
    // Distance : armes laser
    { key: 'laspistol', label: 'Pistolet laser', labelEn: 'Laspistol', kind: 'ranged', group: 'las',
        spec: 'ranged.pistol', damage: 5, damageBonus: null, range: 'medium', mag: 2, enc: 0, cost: 400, availability: 'common',
        traits: [ { key: 'burst' }, { key: 'close' }, { key: 'loud' }, { key: 'reliable' } ], source: 'core', page: 132, summary: null },
    { key: 'lasgun', label: 'Fusil laser', labelEn: 'Lasgun', kind: 'ranged', group: 'las',
        spec: 'ranged.long_gun', damage: 6, damageBonus: null, range: 'long', mag: 4, enc: 2, cost: 600, availability: 'common',
        traits: [ { key: 'burst' }, { key: 'loud' }, { key: 'reliable' }, { key: 'two_handed' } ], source: 'core', page: 132, summary: null },
    { key: 'las_carbine', label: 'Carabine laser', labelEn: 'Las Carbine', kind: 'ranged', group: 'las',
        spec: 'ranged.long_gun', damage: 5, damageBonus: null, range: 'medium', mag: 3, enc: 1, cost: 900, availability: 'common',
        traits: [ { key: 'burst' }, { key: 'loud' }, { key: 'reliable' }, { key: 'two_handed' } ], source: 'core', page: 132, summary: null },
    { key: 'long_las', label: 'Fusil laser long', labelEn: 'Long Las', kind: 'ranged', group: 'las',
        spec: 'ranged.long_gun', damage: 6, damageBonus: null, range: 'extreme', mag: 2, enc: 2, cost: 1000, availability: 'scarce',
        traits: [ { key: 'burst' }, { key: 'penetrating', rating: 1 }, { key: 'reliable' }, { key: 'two_handed' } ], source: 'core', page: 132, summary: null },
    { key: 'hot_shot_laspistol', label: 'Pistolet laser haute énergie', labelEn: 'Hot Shot Laspistol', kind: 'ranged', group: 'las',
        spec: 'ranged.pistol', damage: 8, damageBonus: null, range: 'medium', mag: 2, enc: 2, cost: 900, availability: 'rare',
        traits: [ { key: 'burst' }, { key: 'loud' }, { key: 'penetrating', rating: 2 } ], source: 'core', page: 132, summary: null },
    { key: 'hot_shot_lasgun', label: 'Fusil laser haute énergie', labelEn: 'Hot Shot Lasgun', kind: 'ranged', group: 'las',
        spec: 'ranged.long_gun', damage: 8, damageBonus: null, range: 'long', mag: 3, enc: 3, cost: 1000, availability: 'rare',
        traits: [ { key: 'burst' }, { key: 'loud' }, { key: 'penetrating', rating: 2 }, { key: 'two_handed' } ], source: 'core', page: 132, summary: null },
    { key: 'lascannon', label: 'Canon laser', labelEn: 'Lascannon', kind: 'ranged', group: 'las',
        spec: 'ranged.ordnance', damage: 18, damageBonus: null, range: 'extreme', mag: 5, enc: 4, cost: 8000, availability: 'rare',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'loud' }, { key: 'penetrating', rating: 10 }, { key: 'two_handed' } ], source: 'core', page: 132, summary: null },
    // Distance : lanceurs
    { key: 'grenade_launcher', label: 'Lance-grenades', labelEn: 'Grenade Launcher', kind: 'ranged', group: 'launcher',
        spec: 'ranged.ordnance', damage: null, damageBonus: null, range: 'long', mag: 6, enc: 2, cost: 1000, availability: 'rare',
        traits: [ { key: 'loud' }, { key: 'two_handed' } ], source: 'core', page: 132, summary: null },
    { key: 'portable_missile_launcher', label: 'Lance-missiles portatif', labelEn: 'Portable Missile Launcher', kind: 'ranged', group: 'launcher',
        spec: 'ranged.ordnance', damage: null, damageBonus: null, range: 'extreme', mag: 1, enc: 3, cost: 2000, availability: 'rare',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'loud' }, { key: 'two_handed' } ], source: 'core', page: 132, summary: null },
    // Distance : armes à fusion (p.133)
    { key: 'inferno_pistol', label: 'Pistolet inferno', labelEn: 'Inferno Pistol', kind: 'ranged', group: 'melta',
        spec: 'ranged.pistol', damage: 16, damageBonus: null, range: 'short', mag: 3, enc: 0, cost: 8000, availability: 'exotic',
        traits: [ { key: 'close' }, { key: 'rend', rating: 5 } ], source: 'core', page: 133, summary: null },
    { key: 'meltagun', label: 'Fuseur', labelEn: 'Meltagun', kind: 'ranged', group: 'melta',
        spec: 'ranged.long_gun', damage: 16, damageBonus: null, range: 'medium', mag: 5, enc: 1, cost: 9000, availability: 'rare',
        traits: [ { key: 'rend', rating: 5 }, { key: 'two_handed' } ], source: 'core', page: 133, summary: null },
    // Distance : armes à plasma
    { key: 'plasma_pistol', label: 'Pistolet à plasma', labelEn: 'Plasma Pistol', kind: 'ranged', group: 'plasma',
        spec: 'ranged.pistol', damage: 10, damageBonus: null, range: 'medium', mag: 6, enc: 1, cost: 7000, availability: 'rare',
        traits: [ { key: 'close' }, { key: 'loud' }, { key: 'penetrating', rating: 6 }, { key: 'supercharge', rating: 4 }, { key: 'unstable' } ], source: 'core', page: 133, summary: null },
    { key: 'plasma_gun', label: 'Fusil à plasma', labelEn: 'Plasma Gun', kind: 'ranged', group: 'plasma',
        spec: 'ranged.long_gun', damage: 10, damageBonus: null, range: 'long', mag: 12, enc: 1, cost: 8000, availability: 'rare',
        traits: [ { key: 'loud' }, { key: 'penetrating', rating: 6 }, { key: 'supercharge', rating: 4 }, { key: 'two_handed' }, { key: 'unstable' } ], source: 'core', page: 133, summary: null },
    // Distance : armes à projectiles
    { key: 'autopistol', label: 'Pistolet automatique', labelEn: 'Autopistol', kind: 'ranged', group: 'solid_projectile',
        spec: 'ranged.pistol', damage: 5, damageBonus: null, range: 'medium', mag: 2, enc: 0, cost: 400, availability: 'common',
        traits: [ { key: 'close' }, { key: 'loud' }, { key: 'rapid_fire', rating: 3 } ], source: 'core', page: 133, summary: null },
    { key: 'autogun', label: 'Fusil automatique', labelEn: 'Autogun', kind: 'ranged', group: 'solid_projectile',
        spec: 'ranged.long_gun', damage: 6, damageBonus: null, range: 'long', mag: 4, enc: 1, cost: 600, availability: 'common',
        traits: [ { key: 'loud' }, { key: 'two_handed' }, { key: 'rapid_fire', rating: 3 } ], source: 'core', page: 133, summary: null },
    { key: 'hand_cannon', label: 'Canon de poing', labelEn: 'Hand Cannon', kind: 'ranged', group: 'solid_projectile',
        spec: 'ranged.pistol', damage: 8, damageBonus: null, range: 'medium', mag: 4, enc: 2, cost: 570, availability: 'scarce',
        traits: [ { key: 'close' }, { key: 'heavy', rating: 4 }, { key: 'loud' }, { key: 'penetrating', rating: 2 } ], source: 'core', page: 133, summary: null },
    { key: 'heavy_stubber', label: 'Mitrailleuse lourde', labelEn: 'Heavy Stubber', kind: 'ranged', group: 'solid_projectile',
        spec: 'ranged.ordnance', damage: 8, damageBonus: null, range: 'extreme', mag: 8, enc: 3, cost: 2000, availability: 'scarce',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'loud' }, { key: 'penetrating', rating: 3 }, { key: 'two_handed' }, { key: 'rapid_fire', rating: 4 } ], source: 'core', page: 133, summary: null },
    { key: 'combat_shotgun', label: 'Fusil de combat', labelEn: 'Shotgun (Combat)', kind: 'ranged', group: 'solid_projectile',
        spec: 'ranged.long_gun', damage: 6, damageBonus: null, range: 'medium', mag: 12, enc: 1, cost: 600, availability: 'scarce',
        traits: [ { key: 'spread' }, { key: 'inflict', value: 'prone' }, { key: 'loud' }, { key: 'two_handed' } ], source: 'core', page: 133, summary: null },
    { key: 'pump_action_shotgun', label: 'Fusil à pompe', labelEn: 'Shotgun (Pump Action)', kind: 'ranged', group: 'solid_projectile',
        spec: 'ranged.long_gun', damage: 6, damageBonus: null, range: 'medium', mag: 8, enc: 1, cost: 400, availability: 'common',
        traits: [ { key: 'spread' }, { key: 'inflict', value: 'prone' }, { key: 'loud' }, { key: 'two_handed' } ], source: 'core', page: 133, summary: null },
    { key: 'sniper_rifle', label: 'Fusil de précision', labelEn: 'Sniper Rifle', kind: 'ranged', group: 'solid_projectile',
        spec: 'ranged.long_gun', damage: 8, damageBonus: null, range: 'extreme', mag: 6, enc: 2, cost: 1000, availability: 'scarce',
        traits: [ { key: 'loud' }, { key: 'two_handed' } ], source: 'core', page: 133, summary: null },
    { key: 'stub_pistol', label: 'Pistolet à balles', labelEn: 'Stub Pistol', kind: 'ranged', group: 'solid_projectile',
        spec: 'ranged.pistol', damage: 6, damageBonus: null, range: 'medium', mag: 2, enc: 0, cost: 250, availability: 'common',
        traits: [ { key: 'burst' }, { key: 'close' }, { key: 'loud' } ], source: 'core', page: 133, summary: null },
    { key: 'stub_revolver', label: 'Revolver à balles', labelEn: 'Stub Revolver', kind: 'ranged', group: 'solid_projectile',
        spec: 'ranged.pistol', damage: 6, damageBonus: null, range: 'medium', mag: 6, enc: 0, cost: 255, availability: 'common',
        traits: [ { key: 'close' }, { key: 'loud' }, { key: 'reliable' } ], source: 'core', page: 133, summary: null },
    // Distance : armes spécialisées
    { key: 'needle_pistol', label: 'Pistolet à aiguilles', labelEn: 'Needle Pistol', kind: 'ranged', group: 'specialised',
        spec: 'ranged.pistol', damage: null, damageBonus: null, range: 'medium', mag: 4, enc: 1, cost: 1500, availability: 'exotic',
        traits: [ { key: 'close' }, { key: 'inflict', value: 'poisoned' }, { key: 'subtle' } ], source: 'core', page: 133, summary: null },
    { key: 'needle_rifle', label: 'Fusil à aiguilles', labelEn: 'Needle Rifle', kind: 'ranged', group: 'specialised',
        spec: 'ranged.long_gun', damage: null, damageBonus: null, range: 'long', mag: 6, enc: 2, cost: 1700, availability: 'exotic',
        traits: [ { key: 'inflict', value: 'poisoned' }, { key: 'subtle' }, { key: 'two_handed' } ], source: 'core', page: 133, summary: null },
    { key: 'web_pistol', label: 'Pistolet à toile', labelEn: 'Web Pistol', kind: 'ranged', group: 'specialised',
        spec: 'ranged.pistol', damage: null, damageBonus: null, range: 'short', mag: 3, enc: 1, cost: 1300, availability: 'rare',
        traits: [ { key: 'close' }, { key: 'inflict', value: 'restrained' } ], source: 'core', page: 133, summary: null },
    { key: 'webber', label: 'Lance-toile', labelEn: 'Webber', kind: 'ranged', group: 'specialised',
        spec: 'ranged.long_gun', damage: null, damageBonus: null, range: 'medium', mag: 6, enc: 1, cost: 1500, availability: 'rare',
        traits: [ { key: 'inflict', value: 'restrained' }, { key: 'two_handed' } ], source: 'core', page: 133, summary: null },
];

// Munitions spéciales (p.133-134) : damage = modificateur aux Dégâts (null = « – »),
// costPercent = pourcentage du prix de l'arme pour un chargeur.
export const AMMO = [
    { key: 'bleeder_rounds', label: 'Balles hémorragiques', labelEn: 'Bleeder Rounds', damage: null, costPercent: 30, availability: 'rare',
        usedWith: 'Armes à projectiles, sauf fusils à pompe', groups: ['solid_projectile'], excludeShotguns: true,
        traits: [ { key: 'inflict', value: 'bleeding' } ], range: null, source: 'core', page: 133,
        summary: 'Projectiles chargés d\'anticoagulants qui provoquent des hémorragies.' },
    { key: 'executioner_rounds', label: "Balles d'exécuteur", labelEn: 'Executioner Rounds', damage: null, costPercent: 30, availability: 'rare',
        usedWith: 'Armes bolters, fusils à pompe', groups: ['bolt'], shotguns: true,
        traits: [], range: 'extreme', source: 'core', page: 133,
        summary: "Balles guidées par micro-cogitateur qui allongent la portée (Extrême). Tirées d'un fusil à pompe, l'arme perd Dispersion pour cette attaque." },
    { key: 'hot_shot_las_pack', label: 'Chargeur laser haute énergie', labelEn: 'Hot-Shot Las Pack', damage: 2, costPercent: 40, availability: 'scarce',
        usedWith: 'Armes laser dotées du trait Fiable', groups: ['las'], requiresTrait: 'reliable',
        traits: [ { key: 'penetrating', rating: 2 } ], range: null, source: 'core', page: 133,
        summary: "Chargeur surchargé : +2 Dégâts et Perforante (2), mais sa capacité est la moitié du chargeur de l'arme." },
    { key: 'inferno_shells', label: 'Obus incendiaires', labelEn: 'Inferno Shells', damage: null, costPercent: 30, availability: 'rare',
        usedWith: 'Armes bolters, fusils à pompe', groups: ['bolt'], shotguns: true,
        traits: [ { key: 'inflict', value: 'ablaze' } ], range: null, source: 'core', page: 133,
        summary: "Produits inflammables qui s'enflamment à l'impact et collent à la cible." },
    { key: 'man_stopper_bullets', label: "Balles d'arrêt", labelEn: 'Man-Stopper Bullets', damage: null, costPercent: 30, availability: 'scarce',
        usedWith: 'Armes à projectiles, sauf fusils à pompe', groups: ['solid_projectile'], excludeShotguns: true,
        traits: [ { key: 'penetrating', rating: 3 } ], range: null, source: 'core', page: 133,
        summary: 'Conçues pour percer les protections individuelles.' },
    { key: 'tox_rounds', label: 'Balles toxiques', labelEn: 'Tox Rounds', damage: null, costPercent: 25, availability: 'scarce',
        usedWith: 'Toute arme bolter ou à projectiles, sauf fusils à pompe', groups: ['bolt', 'solid_projectile'], excludeShotguns: true,
        traits: [ { key: 'inflict', value: 'poisoned' } ], range: null, source: 'core', page: 133,
        summary: 'Balles enduites ou remplies de poisons.' },
];

// Grenades, missiles et explosifs (p.134-136). Tous Instables. specs : Lancer (à la main),
// Artillerie (dans un lance-grenades ou lance-missiles), Ingénierie (Explosion différée ou détonateur).
export const EXPLOSIVE_RULES = {
    source: 'core', page: 134,
    delayed: "Explosion différée : Test Difficile (−10) de Tech (Ingénierie) pour régler l'heure ; en cas d'échec, l'explosion a lieu autant de rounds en avance ou en retard que le DR (tenu secret par le MJ). Explosifs complexes, liés ou délais de plus de 10 minutes : Test plus difficile.",
    fireInTheHole: "Contourner un Couvert en lobant la grenade : Test d'Artillerie ou de Lancer Difficile (−10) contre un Couvert partiel, Ardu (−20) contre un Couvert total.",
    simplified: "Plusieurs créatures de même Réflexes (Esquive) dans la Zone : le MJ peut faire un seul Test opposé pour toutes (p.124).",
};

export const GRENADES = [
    { key: 'blasting_charge', label: 'Charge de sautage', labelEn: 'Blasting Charge', specs: ['ranged.thrown'], damage: 10, enc: 0, cost: 40, availability: 'common',
        traits: [ { key: 'loud' }, { key: 'spread' }, { key: 'thrown', value: 'medium' }, { key: 'unstable' } ], source: 'core', page: 134,
        summary: 'Explosif de mine en tube, puissant mais de faible rayon.' },
    { key: 'choke_grenade', label: 'Grenade suffocante', labelEn: 'Choke Grenade', specs: ['ranged.thrown', 'ranged.ordnance'], damage: null, enc: 0, cost: 40, availability: 'scarce',
        traits: [ { key: 'unstable' }, { key: 'inflict', value: 'stunned' }, { key: 'thrown', value: 'medium' } ], source: 'core', page: 135,
        summary: 'La Zone visée reçoit Inflige (Hébété) pendant trois rounds, durée allongée ou raccourcie selon la ventilation.' },
    { key: 'demolition_charge', label: 'Charge de démolition', labelEn: 'Demolition Charge', specs: ['tech.engineering'], damage: 16, enc: 2, cost: 50, availability: 'common',
        traits: [ { key: 'loud' }, { key: 'spread' }, { key: 'unstable' } ], source: 'core', page: 135,
        summary: 'Charge à placer contre la cible, toujours fournie avec un Détonateur à distance lié.' },
    { key: 'fire_bomb', label: 'Bombe incendiaire', labelEn: 'Fire Bomb', specs: ['ranged.thrown'], damage: null, enc: 1, cost: 10, availability: 'common',
        traits: [ { key: 'blast' }, { key: 'loud' }, { key: 'inflict', value: 'ablaze' }, { key: 'thrown', value: 'medium' }, { key: 'unstable' } ], source: 'core', page: 135,
        summary: 'La Zone devient un Danger majeur pendant trois rounds, durée modulée selon les matières inflammables présentes.' },
    { key: 'frag_grenade', label: 'Grenade frag', labelEn: 'Frag Grenade', specs: ['ranged.thrown', 'ranged.ordnance'], damage: 6, enc: 0, cost: 50, availability: 'common',
        traits: [ { key: 'blast' }, { key: 'loud' }, { key: 'thrown', value: 'medium' }, { key: 'unstable' } ], source: 'core', page: 135,
        summary: 'Munition antipersonnel à fragmentation : grand rayon, Dégâts corrects.' },
    { key: 'frag_missile', label: 'Missile frag', labelEn: 'Frag Missile', specs: ['ranged.ordnance'], damage: 8, enc: 1, cost: 200, availability: 'scarce',
        traits: [ { key: 'blast' }, { key: 'loud' }, { key: 'unstable' } ], source: 'core', page: 135,
        summary: 'Version plus puissante et de plus longue portée de la grenade frag.' },
    { key: 'krak_grenade', label: 'Grenade krak', labelEn: 'Krak Grenade', specs: ['ranged.thrown', 'ranged.ordnance'], damage: 12, enc: 0, cost: 60, availability: 'rare',
        traits: [ { key: 'loud' }, { key: 'penetrating', rating: 4 }, { key: 'spread' }, { key: 'thrown', value: 'medium' }, { key: 'unstable' } ], source: 'core', page: 135,
        summary: 'Munition perforante : Dégâts élevés et trait Perforante, mais faible rayon.' },
    { key: 'krak_missile', label: 'Missile krak', labelEn: 'Krak Missile', specs: ['ranged.ordnance'], damage: 16, enc: 1, cost: 400, availability: 'scarce',
        traits: [ { key: 'loud' }, { key: 'penetrating', rating: 6 }, { key: 'spread' }, { key: 'unstable' } ], source: 'core', page: 135,
        summary: 'Munition perforante : Dégâts élevés et trait Perforante, mais faible rayon.' },
    { key: 'melta_bomb', label: 'Bombe à fusion', labelEn: 'Melta Bomb', specs: ['tech.engineering'], damage: 16, enc: 2, cost: 1000, availability: 'exotic',
        traits: [ { key: 'rend', rating: 12 }, { key: 'spread' }, { key: 'unstable' } ], source: 'core', page: 135,
        summary: "Charge magnétique à fixer sur une cible immobile : Dégâts très élevés et Déchirante, n'affecte que la cible à laquelle elle est fixée." },
    { key: 'photon_flash_grenade', label: 'Grenade photonique', labelEn: 'Photon Flash Grenade', specs: ['ranged.thrown', 'ranged.ordnance'], damage: null, enc: 0, cost: 200, availability: 'rare',
        traits: [ { key: 'loud' }, { key: 'inflict', value: 'blinded' }, { key: 'thrown', value: 'medium' }, { key: 'unstable' } ], source: 'core', page: 135,
        summary: 'Affecte toutes les créatures de la Zone visée (Inflige (Aveuglé)).' },
    { key: 'smoke_grenade', label: 'Grenade fumigène', labelEn: 'Smoke Grenade', specs: ['ranged.thrown', 'ranged.ordnance'], damage: null, enc: 0, cost: 30, availability: 'common',
        traits: [ { key: 'blast' }, { key: 'thrown', value: 'medium' }, { key: 'unstable' } ], source: 'core', page: 135,
        summary: "La Zone visée devient Très obscurcie (Heavily Obscured) pendant trois rounds, selon la ventilation. Ne bloque ni l'infrarouge ni le son." },
    { key: 'web_grenade', label: 'Grenade à toile', labelEn: 'Web Grenade', specs: ['ranged.thrown'], damage: null, enc: 0, cost: 150, availability: 'rare',
        traits: [ { key: 'loud' }, { key: 'blast' }, { key: 'inflict', value: 'restrained' }, { key: 'thrown', value: 'medium' }, { key: 'unstable' } ], source: 'core', page: 136,
        summary: 'Affecte tous ceux de la Zone visée (Inflige (Entravé)).' },
];

// Modifications d'arme (p.136-138). Une visée et une fixation de combat au plus, pas de doublon de
// fixation de soutien. Pose : une heure et un Test de Tech (Ingénierie) (difficulté : voir en-tête).
export const WEAPON_MOD_RULES = {
    source: 'core', page: 137,
    maxPerCategory: { combat: 1, sight: 1 },
    supportNoDuplicates: true,
    install: { time: '1 heure', skill: 'tech.engineering', difficultyText: 'Challenging (−10)' },
};

export const WEAPON_MODS = [
    { key: 'exterminator_cartridge', label: 'Cartouche Exterminator', labelEn: 'Exterminator Cartridge', category: 'combat', cost: 100, availability: 'common',
        usedWith: 'Toute arme de mêlée ou à distance dotée du trait Deux mains', source: 'core', page: 137,
        summary: 'Lance-flammes (p.129) à usage unique fixé sur l\'arme, tiré par une Action comme une attaque à distance ; 5 minutes pour le remplacer ou le recharger.' },
    { key: 'melee_attachment', label: 'Baïonnette', labelEn: 'Melee Attachment', category: 'combat', cost: 50, availability: 'scarce',
        usedWith: 'Toute arme à distance dotée du trait Deux mains', source: 'core', page: 138,
        summary: "Fonctionne comme une Épée (ordinaire), fixée ou retirée par une Action. Détachée, elle compte comme une Arme improvisée (une main)." },
    { key: 'mono_edge', label: 'Tranchant monomoléculaire', labelEn: 'Mono-edge', category: 'combat', cost: 250, availability: 'rare',
        usedWith: 'Armes de mêlée ordinaires (tranchantes)', source: 'core', page: 138,
        summary: "L'arme gagne Perforante (2), ou +2 à sa valeur de Perforante si elle l'a déjà." },
    { key: 'photo_sight', label: 'Viseur photonique', labelEn: 'Photo Sight', aliasEn: 'Omnispex', category: 'sight', cost: 200, availability: 'rare',
        usedWith: 'Toute arme à distance sans les traits Explosion ou Lance-flammes', source: 'core', page: 138,
        summary: 'Décrit sous le nom Omnispex : supprime le Désavantage pour tirer dans une Zone Sombre ou Mal éclairée.' },
    { key: 'laser_sight', label: 'Visée laser', labelEn: 'Laser Sight', category: 'sight', cost: 50, availability: 'scarce',
        usedWith: 'Toute arme à distance sans les traits Explosion ou Lance-flammes', source: 'core', page: 138,
        summary: "+1 DR aux attaques à distance avec l'arme, mais les cibles ont Avantage aux Tests de Vigilance pour repérer le tireur. Une cible qui voit le point rouge peut tenter un Test opposé de Réflexes (Esquive) pour éviter le tir." },
    { key: 'telescopic_sight', label: 'Lunette télescopique', labelEn: 'Telescopic Sight', aliasEn: 'Omniscope', category: 'sight', cost: 50, availability: 'common',
        usedWith: 'Toute arme à distance sans les traits Explosion ou Lance-flammes', source: 'core', page: 138,
        summary: "Décrite sous le nom Omniscope : la Portée de l'arme augmente d'un cran, mais elle perd le trait Proche. Sert aussi de Magnoculaires." },
    { key: 'backpack_ammo_supply', label: 'Réserve de munitions dorsale', labelEn: 'Backpack Ammo Supply', category: 'support', cost: null, availability: null,
        usedWith: 'Toute arme à distance', source: 'core', page: 137,
        summary: "Prix et disponibilité de l'arme liée. Chargeur ×4, +2 Enc portée, 5 minutes pour recharger. Sur un Coup critique subi, 1d10 : sur 7+, elle explose (double des Dégâts de l'arme au Corps) et est détruite." },
    { key: 'bipod', label: 'Bipied', labelEn: 'Bipod', category: 'support', cost: 30, availability: null,
        usedWith: 'Toute arme à distance', source: 'core', page: 137,
        summary: "Permet de caler une arme Lourde n'importe où, sans couvert ni élément de décor." },
    { key: 'fire_selector', label: 'Sélecteur de tir', labelEn: 'Fire Selector', category: 'support', cost: 140, availability: 'rare',
        usedWith: 'Armes à distance bolters, lanceurs, Low-Tech et à projectiles', source: 'core', page: 137,
        summary: "Charge jusqu'à trois types de munitions qui se partagent le chargeur ; on change de type par une Action gratuite. L'arme perd le trait Fiable." },
    { key: 'silencer', label: 'Silencieux', labelEn: 'Silencer', category: 'support', cost: 400, availability: 'common',
        usedWith: 'Armes à distance à projectiles', source: 'core', page: 138,
        summary: "Fixé, il retire le trait Bruyante de l'arme." },
];

// ─── Protections ────────────────────────────────────────────────────────────

export const ARMOUR_GROUPS = [
    { key: 'basic', label: 'Armures de base', labelEn: 'Basic', page: 139,
        summary: 'Armures ordinaires de toutes formes, aux traits variés selon leur conception.' },
    { key: 'flak', label: 'Armures pare-éclats', labelEn: 'Flak', page: 139,
        summary: '+1 Armure contre les Dégâts des armes et explosifs dotés des traits Explosion ou Dispersion.' },
    { key: 'mesh', label: 'Armures en maille', labelEn: 'Mesh', page: 140,
        summary: 'Encombrement toujours plus faible que les armures classiques.' },
    { key: 'carapace', label: 'Armures carapace', labelEn: 'Carapace', page: 140,
        summary: 'Forte protection, mais en général le trait Lourde.' },
    { key: 'power', label: 'Armures énergétiques', labelEn: 'Power', page: 140,
        summary: "Active : Encombrement 0 et +10 en Force ; bonus perdus si la source d'énergie est détruite, coupée ou vide. Hors Astartes et Sororitas, l'autonomie est d'autant d'heures que la valeur d'Armure." },
];

// Boucliers : locations null et armour null (« Special » et « * » dans la table), shield: true.
export const SHIELD_RULES = {
    source: 'core', page: 142,
    summary: "Se manie à une main. Sans arme de mêlée, pas de Désavantage pour se défendre en mêlée ; avec une arme de mêlée, celle-ci gagne Défensive. Avantage aux Tests opposés d'Athlétisme (Puissance) pour Défendre une Zone. Une fois par round, ciblé par un tir venu d'une autre Zone, on peut se préparer : bonus d'Armure égal à la valeur de Bouclier contre ce tir et les suivants de cette Zone jusqu'au début de son prochain tour. Contre une attaque Déchirante, on ne subit aucun Dégât mais le bouclier est détruit.",
};

export const ARMOUR = [
    // De base (p.141)
    { key: 'robes_light_leathers', label: 'Robes / Cuir léger', labelEn: 'Robes/Light Leathers', group: 'basic', locations: ['arms', 'body', 'legs'], armour: 1, enc: 1, cost: 10, availability: 'common',
        traits: [ { key: 'subtle' } ], source: 'core', page: 141, summary: null },
    { key: 'heavy_leathers', label: 'Cuir épais', labelEn: 'Heavy Leathers', group: 'basic', locations: ['arms', 'body', 'legs'], armour: 2, enc: 1, cost: 60, availability: 'common',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'armoured_bodyglove', label: 'Combinaison moulante blindée', labelEn: 'Armoured Bodyglove', group: 'basic', locations: ['arms', 'body', 'legs'], armour: 2, enc: 1, cost: 1200, availability: 'rare',
        traits: [ { key: 'subtle' } ], source: 'core', page: 141, summary: null },
    { key: 'armoured_greatcoat', label: 'Manteau blindé', labelEn: 'Armoured Greatcoat', group: 'basic', locations: ['arms', 'body', 'legs'], armour: 1, enc: 2, cost: 500, availability: 'rare',
        traits: [ { key: 'subtle' } ], source: 'core', page: 141, summary: null },
    { key: 'scrap_plate', label: 'Plaques de récupération', labelEn: 'Scrap-plate', group: 'basic', locations: ['body'], armour: 3, enc: 2, cost: 300, availability: 'rare',
        traits: [ { key: 'heavy', rating: 3 } ], source: 'core', page: 141, summary: null },
    { key: 'combat_shield', label: 'Bouclier de combat', labelEn: 'Combat Shield', group: 'basic', locations: null, armour: null, shield: true, enc: 2, cost: 700, availability: 'common',
        traits: [ { key: 'shield', rating: 2 } ], source: 'core', page: 141, summary: 'Bouclier : voir SHIELD_RULES (p.142).' },
    { key: 'boarding_shield', label: "Bouclier d'abordage", labelEn: 'Boarding Shield', group: 'basic', locations: null, armour: null, shield: true, enc: 4, cost: 1400, availability: 'rare',
        traits: [ { key: 'shield', rating: 4 } ], source: 'core', page: 141, summary: 'Bouclier : voir SHIELD_RULES (p.142).' },
    { key: 'xenos_hide_vest', label: 'Gilet en peau xenos', labelEn: 'Xenos Hide Vest', group: 'basic', locations: ['body'], armour: 6, enc: 1, cost: 5000, availability: 'exotic',
        traits: [], source: 'core', page: 141, summary: null },
    // Pare-éclats
    { key: 'flak_boots', label: 'Bottes pare-éclats', labelEn: 'Flak Boots', group: 'flak', locations: ['legs'], armour: 2, enc: 2, cost: 100, availability: 'common',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'flak_helmet', label: 'Casque pare-éclats', labelEn: 'Flak Helmet', group: 'flak', locations: ['head'], armour: 2, enc: 2, cost: 150, availability: 'common',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'flak_gauntlets', label: 'Gantelets pare-éclats (paire)', labelEn: 'Flak Gauntlets (pair)', group: 'flak', locations: ['arms'], armour: 2, enc: 1, cost: 100, availability: 'common',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'flak_vest', label: 'Gilet pare-éclats', labelEn: 'Flak Vest', group: 'flak', locations: ['body'], armour: 3, enc: 2, cost: 500, availability: 'common',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'flak_jacket', label: 'Veste pare-éclats', labelEn: 'Flak Jacket', group: 'flak', locations: ['arms', 'body'], armour: 3, enc: 2, cost: 800, availability: 'scarce',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'astra_militarum_flak_armour', label: "Armure pare-éclats de l'Astra Militarum", labelEn: 'Astra Militarum Flak Armour', group: 'flak', locations: ['all'], armour: 4, enc: 4, cost: 1000, availability: 'rare',
        traits: [ { key: 'loud' } ], source: 'core', page: 141, summary: null },
    // Maille
    { key: 'mesh_boots', label: 'Bottes en maille', labelEn: 'Mesh Boots', group: 'mesh', locations: ['legs'], armour: 3, enc: 1, cost: 600, availability: 'rare',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'mesh_cowl', label: 'Capuche en maille', labelEn: 'Mesh Cowl', group: 'mesh', locations: ['head'], armour: 3, enc: 1, cost: 800, availability: 'rare',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'mesh_gauntlets', label: 'Gantelets en maille', labelEn: 'Mesh Gauntlets', group: 'mesh', locations: ['arms'], armour: 3, enc: 0, cost: 600, availability: 'rare',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'mesh_vest', label: 'Gilet en maille', labelEn: 'Mesh Vest', group: 'mesh', locations: ['body'], armour: 4, enc: 1, cost: 500, availability: 'rare',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'xenos_mesh', label: 'Maille xenos', labelEn: 'Xenos Mesh', group: 'mesh', locations: ['arms', 'body', 'legs'], armour: 4, enc: 2, cost: 5000, availability: 'exotic',
        traits: [], source: 'core', page: 141, summary: null },
    // Carapace
    { key: 'carapace_helm', label: 'Heaume carapace', labelEn: 'Carapace Helm', group: 'carapace', locations: ['head'], armour: 5, enc: 2, cost: 400, availability: 'rare',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'carapace_gauntlets', label: 'Gantelets carapace', labelEn: 'Carapace Gauntlets', group: 'carapace', locations: ['arms'], armour: 5, enc: 2, cost: 300, availability: 'rare',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'carapace_greaves', label: 'Jambières carapace', labelEn: 'Carapace Greaves', group: 'carapace', locations: ['legs'], armour: 5, enc: 2, cost: 300, availability: 'rare',
        traits: [], source: 'core', page: 141, summary: null },
    { key: 'enforcer_carapace', label: "Carapace d'Enforcer", labelEn: 'Enforcer Carapace', group: 'carapace', locations: ['all'], armour: 5, enc: 4, cost: 1800, availability: 'rare',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'loud' } ], source: 'core', page: 141, summary: null },
    { key: 'carapace_chestplate', label: 'Plastron carapace', labelEn: 'Carapace Chestplate', group: 'carapace', locations: ['body'], armour: 6, enc: 3, cost: 800, availability: 'rare',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'loud' } ], source: 'core', page: 141, summary: null },
    { key: 'tempestus_carapace', label: 'Carapace Tempestus', labelEn: 'Tempestus Carapace', group: 'carapace', locations: ['all'], armour: 6, enc: 5, cost: 4000, availability: 'exotic',
        traits: [ { key: 'heavy', rating: 4 }, { key: 'loud' } ], source: 'core', page: 141, summary: null },
    // Énergétiques
    { key: 'light_power_armour', label: 'Armure énergétique légère', labelEn: 'Light Power Armour', group: 'power', locations: ['all'], armour: 8, enc: 7, cost: 500000, availability: 'exotic',
        traits: [ { key: 'loud' } ], source: 'core', page: 141, summary: null },
    { key: 'power_armour', label: 'Armure énergétique', labelEn: 'Power Armour', group: 'power', locations: ['all'], armour: 10, enc: 9, cost: 1000000, availability: 'exotic',
        traits: [ { key: 'loud' } ], source: 'core', page: 141, summary: null },
];

// Champs de force (p.142) : protègent toutes les localisations contre toutes les attaques, un seul
// actif à la fois (activation par Action gratuite). Le jet de Protection réduit les Dégâts avant
// l'Armure ; si les Dégâts atteignent la Surcharge, ils sont annulés mais le champ s'effondre
// (réparation : Test Très ardu (−30) de Tech, au moins 8 heures).
export const FORCE_FIELDS = [
    { key: 'refractor_field', label: 'Champ réfracteur', labelEn: 'Refractor Field', protection: '1d10', overload: 10, enc: 0, cost: 1000, availability: 'exotic',
        source: 'core', page: 142,
        summary: 'Actif, il luit et crépite : son porteur rate automatiquement la plupart des Tests de Discrétion.' },
    { key: 'conversion_field', label: 'Champ de conversion', labelEn: 'Conversion Field', protection: '2d10', overload: 20, enc: 0, cost: 6000, availability: 'exotic',
        source: 'core', page: 142,
        summary: "S'il réduit de 10 ou plus les Dégâts d'une attaque, il éclate de lumière : toutes les créatures de la Zone sauf le porteur subissent l'état Aveuglé pendant un round." },
];

// ─── Équipement (p.143-151) ─────────────────────────────────────────────────
// category : 'clothing' (table Clothing and Personal Gear, p.143), 'tool' (table Tools, p.151).
// page : page de la description de l'objet.

export const GEAR = [
    // Vêtements et équipement personnel
    { key: 'backpack_slings', label: 'Sac à dos / Bandoulières', labelEn: 'Backpack/Slings', category: 'clothing', enc: 1, cost: 20, availability: 'common', source: 'core', page: 143,
        summary: "Porté, augmente l'Encombrement maximal de 4." },
    { key: 'cameleoline_cloak', label: 'Cape de caméléoline', labelEn: 'Cameleoline Cloak', category: 'clothing', enc: 0, cost: 500, availability: 'rare', source: 'core', page: 143,
        summary: "Si l'on ne bouge pas pendant son tour, +2 DR aux Tests de Discrétion jusqu'à ce qu'on bouge ou fasse du bruit." },
    { key: 'explosive_collar', label: 'Collier explosif', labelEn: 'Explosive Collar', category: 'clothing', enc: 0, cost: 150, availability: 'scarce', source: 'core', page: 144,
        summary: "Fourni avec un Détonateur à distance qui déclenche une mini-grenade krak et tue le porteur. La pose exige une cible inconsciente ou Neutralisée pendant au moins 1 minute ; le retrait, un Test Très ardu (−30) de Tech (Ingénierie), avec Désavantage pour le porteur lui-même." },
    { key: 'filtration_plugs', label: 'Bouchons filtrants', labelEn: 'Filtration Plugs', category: 'clothing', enc: 0, cost: 20, availability: 'common', source: 'core', page: 144,
        summary: '+2 DR aux Tests de Robustesse pour résister aux gaz nocifs (Zones avec le trait Danger…).' },
    { key: 'photo_visors_contacts', label: 'Photo-visière / Photo-lentilles', labelEn: 'Photo-Visors/Contacts', category: 'clothing', enc: 0, cost: 300, availability: 'scarce', source: 'core', page: 144,
        summary: "Ignore les pénalités des Zones Mal éclairées et Sombres ; Avantage aux Tests pour résister aux effets qui causent l'état Aveuglé." },
    { key: 'rebreather', label: 'Recycleur', labelEn: 'Rebreather', category: 'clothing', enc: 1, cost: 200, availability: 'scarce', source: 'core', page: 144,
        summary: "Ignore les pénalités d'un air toxique ou mortel et permet de respirer sous l'eau. Réservoir d'une heure, remplacé par une Action ; réservoir supplémentaire 20 Solars." },
    { key: 'recoil_glove', label: 'Gant anti-recul', labelEn: 'Recoil Glove', category: 'clothing', enc: 0, cost: 100, availability: 'rare', source: 'core', page: 143,
        summary: null },
    { key: 'respirator_gas_mask', label: 'Respirateur / Masque à gaz', labelEn: 'Respirator/Gas Mask', category: 'clothing', enc: 0, cost: 50, availability: 'common', source: 'core', page: 144,
        summary: "Réussite automatique aux Tests pour résister aux agents pathogènes aériens, mais Désavantage aux Tests de Vigilance (Vue)." },
    { key: 'survival_gear', label: 'Équipement de survie', labelEn: 'Survival Gear', category: 'clothing', enc: 3, cost: 50, availability: 'common', source: 'core', page: 144,
        summary: "Couchage, tente, gourde, corde, allume-feu, pastilles purifiantes… (sans eau ni nourriture). S'utilise avec Robustesse (Endurance) contre l'Exposition (p.218)." },
    { key: 'synskin', label: 'Synpeau', labelEn: 'Synskin', category: 'clothing', enc: 0, cost: 3000, availability: 'exotic', source: 'core', page: 145,
        summary: "Compte comme une Combinaison moulante blindée (p.141). Portée seule, sans autre vêtement ni armure, +1 DR aux Tests de Discrétion (Se cacher)." },
    { key: 'void_suit', label: 'Combinaison de vide', labelEn: 'Void Suit', category: 'clothing', enc: 2, cost: 2000, availability: 'scarce', source: 'core', page: 145,
        summary: "Ignore le vide et les pathogènes aériens (air pour 10 heures ; recharge 3 heures en atmosphère normale ou cartouche de 30 Solars par une Action). Micro-propulseurs et bottes magnétiques pour la gravité zéro. Compte comme une armure de 3 sur toutes les localisations." },
    { key: 'remote_detonator', label: 'Détonateur à distance', labelEn: 'Remote Detonator', category: 'clothing', enc: null, cost: null, availability: null, source: 'core', page: 144,
        summary: "Lié à un explosif, permet de déclencher une Explosion différée (p.134) à distance." },

    // Outils
    { key: 'auspex_scanner', label: 'Auspex / Scanner', labelEn: 'Auspex/Scanner', category: 'tool', enc: 1, cost: 1000, availability: 'scarce', source: 'core', page: 145,
        summary: "Révèle énergie, signes de vie, mouvements et autres données à portée Moyenne. Le MJ peut demander un Test de Tech pour un phénomène précis ou contre des interférences." },
    { key: 'auto_quill', label: 'Auto-plume', labelEn: 'Auto-Quill', category: 'tool', enc: 2, cost: 150, availability: 'scarce', source: 'core', page: 145,
        summary: 'Transcrit la parole ou recopie textes et schémas sur parchemin.' },
    { key: 'chirurgeons_kit', label: 'Trousse de chirurgien', labelEn: "Chirurgeon's Kit", category: 'tool', enc: 1, cost: 500, availability: 'rare', uses: 5, source: 'core', page: 145,
        summary: "Requise pour soigner de nombreuses Blessures critiques et Séquelles, et pour le Talent Chirurgien. Cinq utilisations (réassort : moitié du prix) ; Test de Médicae, Exigeant (+0) sauf mention contraire ; un échec consomme une utilisation." },
    { key: 'chrono', label: 'Chrono', labelEn: 'Chrono', category: 'tool', enc: 0, cost: 20, availability: 'common', source: 'core', page: 146,
        summary: "Affiche l'heure et se règle seul sur l'heure locale en quelques secondes." },
    { key: 'climbing_harness', label: "Harnais d'escalade", labelEn: 'Climbing Harness', category: 'tool', enc: 0, cost: 150, availability: 'common', source: 'core', page: 146,
        summary: "Corde de 30 mètres qui supporte une créature ou un objet de taille Moyenne ; installation par une Action ; bloque automatiquement une chute trop rapide." },
    { key: 'combi_tool', label: 'Combi-outil', labelEn: 'Combi-Tool', category: 'tool', enc: 0, cost: 300, availability: 'rare', source: 'core', page: 146,
        summary: "Sondes, lames et prises pour apaiser les esprits de la machine. Remplace la Trousse de chirurgien pour réparer une augmétique (p.152)." },
    { key: 'comm_leech', label: 'Sangsue de communication', labelEn: 'Comm Leech', category: 'tool', enc: 1, cost: 1000, availability: 'rare', source: 'core', page: 146,
        summary: "Test Exigeant (+0) de Tech pour intercepter les signaux jusqu'à 3 km (le MJ ajuste) : on capte autant de minutes que le DR. En cas d'échec, l'émetteur détecte la tentative." },
    { key: 'dataslate', label: 'Ardoise de données', labelEn: 'Dataslate', category: 'tool', enc: 0, cost: 100, availability: 'common', source: 'core', page: 146,
        summary: 'Stocke et affiche textes, picts et vids ; verrou biométrique contourné par un Test Ardu (−20) de Tech.' },
    { key: 'diagnostor', label: 'Diagnostor', labelEn: 'Diagnostor', category: 'tool', enc: 1, cost: 2000, availability: 'rare', source: 'core', page: 146,
        summary: "S'utilise avec les Tests de Médicae et de Perception pour révéler une maladie chez un Humain (difficulté selon la rareté)." },
    { key: 'disguise_kit', label: 'Kit de déguisement', labelEn: 'Disguise Kit', category: 'tool', enc: 1, cost: 100, availability: null, source: 'core', page: 147,
        summary: "10 minutes pour changer d'apparence, sans Test. Pour passer pour un membre d'une faction ou une personne précise, le MJ peut demander un Test de Dextérité Exigeant (+0) ou plus difficile." },
    { key: 'emperors_tarot', label: "Tarot de l'Empereur", labelEn: "Emperor's Tarot", category: 'tool', enc: 0, cost: 10000, availability: 'rare', source: 'core', page: 147,
        summary: "Une lecture par session, 1 heure, Test Difficile (−10) de Discipline sans Destin possible : +2 DR ou plus, on récupère 1 point de Destin ; −2 DR ou pire, on en perd 1 ; Maladresse, on en brûle 1. Possible pour un autre personnage consentant (sans effet s'il a brûlé tout son Destin)." },
    { key: 'entrenching_tool', label: 'Pelle de tranchée', labelEn: 'Entrenching Tool', category: 'tool', enc: 1, cost: 20, availability: 'common', source: 'core', page: 148,
        summary: 'Sert d\'Arme improvisée (une main) ; bien affûtée, elle compte comme une Hache.' },
    { key: 'excruciator_kit', label: "Kit d'excruciateur", labelEn: 'Excruciator Kit', category: 'tool', enc: 1, cost: 500, availability: 'exotic', source: 'core', page: 148,
        summary: "S'utilise avec les Tests de Présence (Interrogatoire) pour obtenir des informations d'un prisonnier récalcitrant." },
    { key: 'glow_globe_stablight', label: 'Globe lumineux / Lampe-torche', labelEn: 'Glow-Globe/Stablight', category: 'tool', enc: 0, cost: 30, availability: 'common', source: 'core', page: 148,
        summary: "Retire les traits Mal éclairée et Sombre de sa Zone. 5 heures d'éclairage, recharge en 2 heures d'arrêt ou presque immédiate sur une source d'énergie impériale." },
    { key: 'grapnel_line', label: 'Lance-grappin', labelEn: 'Grapnel Line', category: 'tool', enc: 0, cost: 100, availability: 'common', source: 'core', page: 148,
        summary: "Harnais d'escalade et lanceur à crochet magnétique : portée 50 mètres, hisse deux créatures de taille Moyenne à 5 mètres par round. Action et Test Routinier (+20) de Distance (Pistolet)." },
    { key: 'grav_chute', label: 'Grav-parachute', labelEn: 'Grav Chute', category: 'tool', enc: 2, cost: 2000, availability: 'rare', source: 'core', page: 148,
        summary: "Actif, une créature de taille Moyenne ignore les dégâts de chute pendant 10 minutes ; recharge de 10 heures sur une source d'énergie impériale. Ne permet ni de planer ni de monter." },
    { key: 'holy_icon', label: 'Icône sacrée', labelEn: 'Holy Icon', category: 'tool', enc: 0, cost: 10, availability: 'common', source: 'core', page: 148,
        summary: "Un personnage qui a fait preuve d'une foi suffisante peut ajouter +1 DR aux Tests de Discipline (Peur)." },
    { key: 'inhaler_injector', label: 'Inhalateur / Injecteur', labelEn: 'Inhaler/Injector', category: 'tool', enc: 0, cost: 65, availability: 'common', source: 'core', page: 151,
        summary: null },
    { key: 'instruments_of_divination', label: 'Instruments de divination', labelEn: 'Instruments of Divination', category: 'tool', enc: 0, cost: 200, availability: 'rare', source: 'core', page: 147,
        summary: "Outils de divination des psykers (sable de Terra, dés runiques…) : nature, origine et efficacité à définir avec le MJ." },
    { key: 'lascutter', label: 'Découpeur laser', labelEn: 'Lascutter', category: 'tool', enc: 2, cost: 170, availability: 'common', source: 'core', page: 148,
        summary: "S'utilise avec les Tests de Tech (Ingénierie) pour découper des objets solides (cloisons, portes blindées, passerelles)." },
    { key: 'laud_hailer', label: 'Porte-voix', labelEn: 'Laud Hailer', category: 'tool', enc: 1, cost: 100, availability: 'scarce', source: 'core', page: 148,
        summary: "La voix ou les sons émis s'entendent facilement jusqu'à 100 mètres." },
    { key: 'mag_boots', label: 'Bottes magnétiques', labelEn: 'Mag Boots', category: 'tool', enc: 0, cost: 400, availability: 'rare', source: 'core', page: 149,
        summary: "Activées par une Action sur une surface ferromagnétique : on ignore la gravité faible ou nulle, Vitesse Lente. En gravité normale, Test Exigeant (+0) d'Athlétisme (Escalade) ou de Réflexes (Acrobaties) pour marcher sur murs et plafonds métalliques, Vitesse Lente." },
    { key: 'magnoculars', label: 'Magnoculaires', labelEn: 'Magnoculars', category: 'tool', enc: 0, cost: 30, availability: 'common', source: 'core', page: 149,
        summary: "S'utilisent avec les Tests de Vigilance (Vue) pour repérer des objets à portée Longue ou au-delà." },
    { key: 'manacles', label: 'Menottes', labelEn: 'Manacles', category: 'tool', enc: 0, cost: 50, availability: 'common', source: 'core', page: 149,
        summary: "Posées par une Action sur un personnage qui ne résiste pas (Neutralisé, Hébété ou Inconscient) : membres liés inutilisables. Retrait sans clé : Test Très ardu (−30) de Dextérité (Crochetage), Athlétisme (Puissance) ou Tech (Sécurité), avec Désavantage sur soi-même. Détruites par 10 Dégâts." },
    { key: 'micro_bead_vox_bead', label: 'Micro-perle / Perle vox', labelEn: 'Micro-Bead/Vox Bead', category: 'tool', enc: 0, cost: 150, availability: 'common', source: 'core', page: 149,
        summary: "Communication avec les autres utilisateurs du même canal dans un rayon d'environ 1,6 km (un mile), gênée par les masses métalliques et les intempéries." },
    { key: 'monotask_servo_skull', label: 'Crâne-serviteur monotâche', labelEn: 'Monotask Servo-Skull', category: 'tool', enc: 0, cost: 2000, availability: 'rare', source: 'core', page: 149,
        options: [
            { key: 'illuminator', label: 'Illuminateur', summary: 'Sert de Globe lumineux / Lampe-torche.' },
            { key: 'laud_hailer', label: 'Porte-voix', summary: "Amplifie des sons enregistrés ou la voix de quelqu'un à portée de Contact." },
            { key: 'medicae', label: 'Médicae', summary: '+10 aux Tests de Médicae faits à portée de Contact.' },
            { key: 'scanner', label: 'Scanner', summary: "Auspex dont profite un personnage à portée Courte." },
            { key: 'utility', label: 'Utilitaire', summary: 'Combi-outil pour un personnage à portée de Contact.' },
        ],
        summary: "Flotte à hauteur d'yeux près de son utilisateur, avec une fonction choisie parmi les options. La qualité modifie ses appareils comme ceux-ci, ou son comportement." },
    { key: 'multicompass', label: 'Multicompas', labelEn: 'Multicompass', category: 'tool', enc: 0, cost: 400, availability: 'exotic', source: 'core', page: 149,
        summary: "S'utilise avec les Tests de Navigation (Surface) ou autres Tests pour traverser un terrain inconnu." },
    { key: 'multikey', label: 'Passe-partout', labelEn: 'Multikey', category: 'tool', enc: 0, cost: 200, availability: 'scarce', source: 'core', page: 150,
        summary: "Souvent illégal. S'utilise avec les Tests de Dextérité (Crochetage) contre les serrures de conception impériale." },
    { key: 'pict_recorder', label: 'Enregistreur picto', labelEn: 'Pict Recorder', category: 'tool', enc: 0, cost: 200, availability: 'common', source: 'core', page: 150,
        summary: "Centaines de picts et environ 10 heures de vidéo ; une Action par round d'utilisation, sans Test." },
    { key: 'psy_focus', label: 'Focus psychique', labelEn: 'Psy Focus', category: 'tool', enc: 0, cost: 100, availability: 'exotic', source: 'core', page: 150,
        summary: '+1 DR aux Tests de Maîtrise psychique. Un seul focus à la fois.' },
    { key: 'regicide_set', label: 'Jeu de Régicide', labelEn: 'Regicide Set', category: 'tool', enc: 0, cost: 40, availability: 'common', source: 'core', page: 151,
        summary: null },
    { key: 'sacred_unguents', label: 'Onguents sacrés', labelEn: 'Sacred Unguents', category: 'tool', enc: 0, cost: 100, availability: 'rare', uses: 5, source: 'core', page: 150,
        summary: "Cinq utilisations. Action et Test Exigeant (+0) de Tech (Ingénierie) sur un objet, véhicule ou arme impérial : le prochain Test raté avec lui est relancé (effet perdu après la relance ou au bout d'un jour). Un échec gaspille une utilisation." },
    { key: 'screamer', label: 'Hurleur', labelEn: 'Screamer', category: 'tool', enc: 1, cost: 170, availability: 'scarce', source: 'core', page: 150,
        summary: "Alarme posée par un Test Routinier (+20) de Tech (Sécurité) (échec : elle sonne aussitôt), sur sa Zone ou une Zone adjacente, pour le son, le mouvement ou la pression. Qui y entre fait un Test Exigeant (+0) de Discrétion avec un malus de DR égal au DR de la pose ; détectée, elle alerte tout le monde à portée Longue." },
    { key: 'signal_jammer', label: 'Brouilleur de signal', labelEn: 'Signal Jammer', category: 'tool', enc: 1, cost: 250, availability: 'rare', source: 'core', page: 150,
        summary: "Activé par une Action gratuite, coupe les transmissions vox et de données dans un rayon de 1 km, sans discrétion. 2 heures sur batterie." },
    { key: 'stummer', label: 'Étouffeur', labelEn: 'Stummer', category: 'tool', enc: 1, cost: 1000, availability: 'common', source: 'core', page: 150,
        summary: "Activé par une Action gratuite, augmente de trois crans la difficulté des Tests de Vigilance auditifs dans sa Zone. 20 minutes d'énergie ; effets non cumulables." },
    { key: 'vox_caster', label: 'Vox-caster', labelEn: 'Vox-Caster', category: 'tool', enc: 0, cost: 1000, availability: 'scarce', source: 'core', page: 151,
        summary: "Transmission vocale vers d'autres vox-casters et petites unités (perles vox) dans un rayon de 100 km, jusqu'en orbite basse." },
    { key: 'writing_kit', label: "Nécessaire d'écriture", labelEn: 'Writing Kit', category: 'tool', enc: 1, cost: 20, availability: 'common', source: 'core', page: 151,
        summary: "Parchemin, plumes et encre pour quelques dizaines de pages, à la main ou à l'Auto-plume." },
];

// ─── Augmétiques (p.152-154) ────────────────────────────────────────────────
// category : 'replacement' (table Augmetic Replacements, p.152), 'mechanicus' (table Augmetics,
// « Strength in Steel », p.153 : réservées aux Tech-prêtres et à leurs serviteurs de la faction
// Adeptus Mechanicus, sauf décision du MJ).

export const AUGMETIC_RULES = {
    source: 'core', page: 152,
    max: 'tb',
    maxTalent: 'flesh_is_weak',
    summary: "Nombre d'augmétiques limité au BE (Talent La chair est faible pour dépasser). Pose via les Soins médicaux (p.156), prix de l'augmétique ajouté. Séquelles d'une augmétique de membre : Tech (Ingénierie) au lieu de Médicae, Combi-outil au lieu de Trousse de chirurgien. Fracture mineure : 5 réussites, Test étendu Routinier (+20) de Tech (Ingénierie), un par heure, pièces à 25 % du prix ; fracture majeure : idem en Exigeant (+0), pièces à 50 %. Amputation : à remplacer.",
};

export const AUGMETICS = [
    { key: 'augmetic_arm', label: 'Bras augmétique', labelEn: 'Augmetic Arm', category: 'replacement', cost: 1000, availability: 'scarce', source: 'core', page: 152,
        summary: "+1 Armure sur la localisation (cumulée). +1 DR aux Tests de Force utilisant ce bras et +1 Dégât en mêlée avec lui. Deux bras augmétiques : +2 DR aux Tests de Force utilisant les deux bras et +2 Dégâts avec les armes de mêlée à Deux mains." },
    { key: 'augmetic_heart', label: 'Cœur augmétique', labelEn: 'Augmetic Heart', category: 'replacement', cost: 3000, availability: 'rare', source: 'core', page: 153,
        summary: "Par une Action, Test Exigeant (+0) de Robustesse pour retirer Hémorragie (mineur), ou Ardu (−20) pour Hémorragie (majeur)." },
    { key: 'augmetic_leg', label: 'Jambe augmétique', labelEn: 'Augmetic Leg', category: 'replacement', cost: 1000, availability: 'scarce', source: 'core', page: 153,
        summary: "+1 Armure sur la localisation (cumulée). +1 DR aux Tests de Force utilisant la jambe (enfoncer une porte d'un coup de pied…)." },
    { key: 'augmetic_tracks_wheels', label: 'Chenilles / Roues augmétiques', labelEn: 'Augmetic Tracks/Wheels', category: 'replacement', cost: 1500, availability: 'scarce', source: 'core', page: 153,
        summary: "Remplacent les deux jambes : +1 Armure sur la localisation (cumulée). Vitesse Rapide dans les Zones dégagées ; le MJ peut traiter les Zones encombrées comme Terrain difficile." },
    { key: 'augmetic_respiratory_system', label: 'Système respiratoire augmétique', labelEn: 'Augmetic Respiratory System', category: 'replacement', cost: 2000, availability: 'rare', source: 'core', page: 153,
        summary: '+2 DR aux Tests de Robustesse pour résister aux toxines aériennes et aux gaz toxiques.' },
    { key: 'augmetic_sensory_organs', label: 'Organes sensoriels augmétiques', labelEn: 'Augmetic Sensory Organs', category: 'replacement', cost: 4000, availability: 'rare', source: 'core', page: 153,
        options: [ { key: 'eyes', label: 'Yeux' }, { key: 'nose', label: 'Nez' }, { key: 'ears', label: 'Oreilles' } ],
        summary: '+1 DR aux Tests utilisant ce sens ; +2 DR avec deux yeux ou deux oreilles augmétiques.' },

    { key: 'augur_array', label: 'Réseau augure', labelEn: 'Augur Array', category: 'mechanicus', cost: 6000, availability: 'rare', source: 'core', page: 154,
        summary: 'Les sens du porteur ont les capacités d\'un Auspex (énergie, signes de vie, mouvements à portée Moyenne). +5 en Perception.' },
    { key: 'ballistic_mechadendrite', label: 'Mécadendrite balistique', labelEn: 'Ballistic Mechadendrite', category: 'mechanicus', cost: 2000, availability: 'rare', source: 'core', page: 154,
        summary: 'Pistolet laser intégré qui ne se recharge jamais. Mécadendrite (voir mechadendrite).' },
    { key: 'calculus_logi_upgrade', label: 'Implant calculus logi', labelEn: 'Calculus Logi Upgrade', category: 'mechanicus', cost: 10000, availability: 'rare', source: 'core', page: 154,
        summary: '+1 DR aux Tests de Logique (Mathématiques). +5 en Intelligence.' },
    { key: 'manipulator_mechadendrite', label: 'Mécadendrite manipulatrice', labelEn: 'Manipulator Mechadendrite', category: 'mechanicus', cost: 1400, availability: 'rare', source: 'core', page: 154,
        summary: "+2 DR aux Tests de Force et −1 DR aux Tests de Dextérité en l'utilisant. Sert d'Arme improvisée (deux mains)." },
    { key: 'medicae_mechadendrite', label: 'Mécadendrite médicae', labelEn: 'Medicae Mechadendrite', category: 'mechanicus', cost: 1400, availability: 'rare', source: 'core', page: 154,
        summary: "Compte comme une Trousse de chirurgien pour les Tests qui en exigent une, sans limite d'utilisations (à remplacer seulement si elle est cassée)." },
    { key: 'mind_impulse_unit', label: "Unité d'impulsion mentale", labelEn: 'Mind Impulse Unit', aliasEn: 'Biomechanical Interface', category: 'mechanicus', cost: 10000, availability: 'rare', source: 'core', page: 154,
        summary: "Décrite sous le nom Biomechanical Interface : ordres silencieux aux systèmes compatibles (cogitateurs, machines industrielles, certains serviteurs) ; +1 DR aux Tests de Tech pour opérer une machine connectée ou commander un serviteur cybernétique équipé." },
    { key: 'optical_mechadendrite', label: 'Mécadendrite optique', labelEn: 'Optical Mechadendrite', category: 'mechanicus', cost: 1200, availability: 'rare', source: 'core', page: 154,
        summary: "Un mètre plus longue : +1 DR aux Tests de Vigilance (Vue), ignore les Zones Mal éclairées et Sombres (lampe-torche intégrée), permet de regarder derrière un angle ou au-dessus d'une foule." },
    { key: 'utility_mechadendrite', label: 'Mécadendrite utilitaire', labelEn: 'Utility Mechadendrite', category: 'mechanicus', cost: 1000, availability: 'rare', source: 'core', page: 154,
        summary: "Compte comme un Combi-outil de qualité standard, +2 DR aux Tests de Tech ; sert d'Arme improvisée (une main) en mêlée." },
    { key: 'vocal_implant', label: 'Implant vocal', labelEn: 'Vocal Implant', category: 'mechanicus', cost: 400, availability: 'rare', source: 'core', page: 154,
        summary: "La voix ou les sons émis s'entendent facilement jusqu'à 100 mètres." },
];

// Règle commune aux mécadendrites (p.154).
export const MECHADENDRITE_RULES = {
    source: 'core', page: 154,
    summary: "Membre manipulateur d'environ 2 mètres fixé au torse, au dos ou aux épaules. Chaque mécadendrite compte comme une augmétique. Sur une Blessure critique au Corps, 1d10 : si le résultat est inférieur au nombre de mécadendrites fonctionnelles, une mécadendrite est endommagée à la place (inutilisable jusqu'à réparation).",
};

// ─── Services (p.155-157) ───────────────────────────────────────────────────
// Prix par personne ; logement par jour ; soins par Test effectué. quality : poor, standard, good,
// excellent. Le MJ ajuste les niveaux disponibles selon le lieu. Logement Bon ou Excellent : peut
// exiger 1 ou 2 d'Influence auprès de la faction propriétaire. Une semaine de repas Médiocres
// seulement : Test Exigeant (+0) de Robustesse (Endurance) ou état Épuisé jusqu'à un meilleur repas.

export const SERVICE_QUALITIES = [
    { key: 'poor', label: 'Médiocre', labelEn: 'Poor' },
    { key: 'standard', label: 'Standard', labelEn: 'Standard' },
    { key: 'good', label: 'Bonne', labelEn: 'Good' },
    { key: 'excellent', label: 'Excellente', labelEn: 'Excellent' },
];

export const SERVICES = [
    // Voyage en ville / ruche
    { key: 'travel_city_poor', category: 'travel_city', quality: 'poor', label: 'Trajet urbain médiocre', labelEn: 'City/Hive Travel (Poor)', cost: 3, source: 'core', page: 156,
        summary: 'Pousse-pousse, tube de habway, plateforme élévatrice.' },
    { key: 'travel_city_standard', category: 'travel_city', quality: 'standard', label: 'Trajet urbain standard', labelEn: 'City/Hive Travel (Standard)', cost: 8, source: 'core', page: 156,
        summary: 'Convoyeur de masse, voiture de transit, monture.' },
    { key: 'travel_city_good', category: 'travel_city', quality: 'good', label: 'Trajet urbain de bonne qualité', labelEn: 'City/Hive Travel (Good)', cost: 20, source: 'core', page: 156,
        summary: 'Autocarrosse, mag-char, pousse-pousse tiré par un serviteur.' },
    { key: 'travel_city_excellent', category: 'travel_city', quality: 'excellent', label: 'Trajet urbain excellent', labelEn: 'City/Hive Travel (Excellent)', cost: 50, source: 'core', page: 156,
        summary: 'Autocarrosse fermé avec chauffeur, palanquin somptueux, places en navette.' },
    // Voyage planétaire
    { key: 'travel_planetary_poor', category: 'travel_planetary', quality: 'poor', label: 'Voyage planétaire médiocre', labelEn: 'Planetary Travel (Poor)', cost: 200, source: 'core', page: 156,
        summary: 'Autocarrosses de transport, chars à voile, chalutiers à mégafaune.' },
    { key: 'travel_planetary_standard', category: 'travel_planetary', quality: 'standard', label: 'Voyage planétaire standard', labelEn: 'Planetary Travel (Standard)', cost: 500, source: 'core', page: 156,
        summary: 'Convoyeur inter-ruches, train terrestre, avion de transport en vrac.' },
    { key: 'travel_planetary_good', category: 'travel_planetary', quality: 'good', label: 'Voyage planétaire de bonne qualité', labelEn: 'Planetary Travel (Good)', cost: 1000, source: 'core', page: 156,
        summary: 'Avion de ligne, wagon privé, convoi loué.' },
    { key: 'travel_planetary_excellent', category: 'travel_planetary', quality: 'excellent', label: 'Voyage planétaire excellent', labelEn: 'Planetary Travel (Excellent)', cost: 5000, source: 'core', page: 156,
        summary: 'Navette rapide, canonnière légère, dirigeable blindé.' },
    // Voyage dans le système
    { key: 'travel_system_poor', category: 'travel_system', quality: 'poor', label: 'Voyage système médiocre', labelEn: 'System Travel (Poor)', cost: 500, source: 'core', page: 156,
        summary: 'Ponts vides de minéraliers, salles de dévotion de vaisseaux pèlerins.' },
    { key: 'travel_system_standard', category: 'travel_system', quality: 'standard', label: 'Voyage système standard', labelEn: 'System Travel (Standard)', cost: 1000, source: 'core', page: 156,
        summary: 'Navettes de passagers (debout), quartiers de vaisseau marchand.' },
    { key: 'travel_system_good', category: 'travel_system', quality: 'good', label: 'Voyage système de bonne qualité', labelEn: 'System Travel (Good)', cost: 5000, source: 'core', page: 156,
        summary: 'Navettes de passagers (assis), cabines partagées sur cargos légers.' },
    { key: 'travel_system_excellent', category: 'travel_system', quality: 'excellent', label: 'Voyage système excellent', labelEn: 'System Travel (Excellent)', cost: 10000, source: 'core', page: 156,
        summary: 'Suites dorées de vaisseau système, navette militaire.' },
    // Voyage interstellaire
    { key: 'travel_interstellar_poor', category: 'travel_interstellar', quality: 'poor', label: 'Voyage interstellaire médiocre', labelEn: 'Interstellar Travel (Poor)', cost: 5000, source: 'core', page: 156,
        summary: 'Entrepont, cales et ponts pèlerins de transporteurs en vrac.' },
    { key: 'travel_interstellar_standard', category: 'travel_interstellar', quality: 'standard', label: 'Voyage interstellaire standard', labelEn: 'Interstellar Travel (Standard)', cost: 10000, source: 'core', page: 156,
        summary: 'Quartiers collectifs de passagers sur vaisseaux marchands.' },
    { key: 'travel_interstellar_good', category: 'travel_interstellar', quality: 'good', label: 'Voyage interstellaire de bonne qualité', labelEn: 'Interstellar Travel (Good)', cost: 50000, source: 'core', page: 156,
        summary: 'Suites pour plusieurs personnes sur transporteurs de passagers.' },
    { key: 'travel_interstellar_excellent', category: 'travel_interstellar', quality: 'excellent', label: 'Voyage interstellaire excellent', labelEn: 'Interstellar Travel (Excellent)', cost: 100000, source: 'core', page: 156,
        summary: 'Cabines privées sur vaisseaux de Capitaines chartistes.' },
    // Logement (par jour)
    { key: 'lodging_poor', category: 'lodging', quality: 'poor', label: 'Logement médiocre', labelEn: 'Accommodations (Poor)', cost: 20, source: 'core', page: 156,
        summary: 'Arrière-salles de taverne, étages communs de hab, granges.' },
    { key: 'lodging_standard', category: 'lodging', quality: 'standard', label: 'Logement standard', labelEn: 'Accommodations (Standard)', cost: 50, source: 'core', page: 156,
        summary: "Quartiers de hab partagés, chambres d'ouvriers en mi-ruche." },
    { key: 'lodging_good', category: 'lodging', quality: 'good', label: 'Logement de bonne qualité', labelEn: 'Accommodations (Good)', cost: 100, source: 'core', page: 156,
        summary: 'Chambre de hab individuelle, hôtellerie de mi-ruche avec personnel.' },
    { key: 'lodging_excellent', category: 'lodging', quality: 'excellent', label: 'Logement excellent', labelEn: 'Accommodations (Excellent)', cost: 200, source: 'core', page: 156,
        summary: 'Suites privées de haute ruche, chambres communicantes avec domestiques.' },
    // Provisions et repas
    { key: 'meal_poor', category: 'meal', quality: 'poor', label: 'Repas médiocre', labelEn: 'Provisions and Meals (Poor)', cost: 5, source: 'core', page: 156,
        summary: "Eau de ruissellement, amidon de cadavre, pâte d'acynadi." },
    { key: 'meal_standard', category: 'meal', quality: 'standard', label: 'Repas standard', labelEn: 'Provisions and Meals (Standard)', cost: 10, source: 'core', page: 156,
        summary: "Recaf ordinaire, pain d'orza, mala frais, cubes de klop frits." },
    { key: 'meal_good', category: 'meal', quality: 'good', label: 'Repas de bonne qualité', labelEn: 'Provisions and Meals (Good)', cost: 40, source: 'core', page: 156,
        summary: 'Mélanges de recaf de Persepolis, steak de grox grillé, soupe d\'ovana.' },
    { key: 'meal_excellent', category: 'meal', quality: 'excellent', label: 'Repas excellent', labelEn: 'Provisions and Meals (Excellent)', cost: 80, source: 'core', page: 156,
        summary: 'Kothir millésimé, flanc de raie-nuage mariné, yixtail assaisonné.' },
    // Soins médicaux (prix par Test ; medicae = compétence du praticien)
    { key: 'medical_poor', category: 'medical', quality: 'poor', label: 'Soins médiocres', labelEn: 'Medical Care (Poor)', cost: 100, medicae: 30, resources: [], source: 'core', page: 157,
        summary: 'Rebouteux de gang de ruche, apprenti guérisseur de la frontière.' },
    { key: 'medical_standard', category: 'medical', quality: 'standard', label: 'Soins standard', labelEn: 'Medical Care (Standard)', cost: 200, medicae: 40, resources: ['chirurgeons_kit'], source: 'core', page: 157,
        summary: 'Trousse de chirurgien. Médecin de manufactorum, médicae du Militarum.' },
    { key: 'medical_good', category: 'medical', quality: 'good', label: 'Soins de bonne qualité', labelEn: 'Medical Care (Good)', cost: 600, medicae: 50, resources: ['chirurgeons_kit', 'chirurgeon'], source: 'core', page: 157,
        summary: "Trousse de chirurgien et Talent Chirurgien. Médicae de ruche formé, chirurgien savant d'un seigneur féodal." },
    { key: 'medical_excellent', category: 'medical', quality: 'excellent', label: 'Soins excellents', labelEn: 'Medical Care (Excellent)', cost: 1200, medicae: 70, resources: ['chirurgeons_kit', 'chirurgeon', 'monotask_servo_skull'], source: 'core', page: 157,
        summary: "Trousse de chirurgien, Talent Chirurgien et Crâne-serviteur médicae. Médicae personnel d'un noble, servitor médical d'un Libre-Marchand." },
    // Nourriture et boissons à prix fixe
    { key: 'amasec', category: 'food', quality: null, label: 'Amasec (bouteille)', labelEn: 'Amasec', cost: 80, source: 'core', page: 157,
        summary: 'Alcool distillé de vin ou autre boisson fermentée ; les crus macharriens ont un bouquet prononcé.' },
    { key: 'recaf', category: 'food', quality: null, label: 'Recaf (portion)', labelEn: 'Recaf', cost: 5, source: 'core', page: 157,
        summary: 'Boisson impériale de feuilles bouillies, légèrement stimulante ; les mélanges exotiques coûtent bien plus.' },
    { key: 'yixtail_eggs', category: 'food', quality: null, label: 'Œufs de yixtail', labelEn: 'Yixtail eggs', cost: 40, source: 'core', page: 157,
        summary: 'Mets prisé qui voyage bien et se conserve des années : un repas Standard pour quatre.' },
];

// src/client/src/systems/nimble/config/equipment.js
// Source : Nimble Core Rules 3.3, p. 32-43 (armures, boucliers, armes, objets clés, équipement divers,
// monnaie, objets magiques, parchemins et baguettes).
// Catalogue de l'équipement : clés imposées par documentations/nimble/format_catalogues.md §5.

// ── Armes (p. 35) ─────────────────────────────────────────────────────
// props.key : light thrown vicious reach range load stack ; slots : 2 pour une arme à deux mains
export const WEAPONS = [
    // Mêlée
    {
        key: 'dagger', name: 'Dague', vo: 'Dagger', range: 'melee', damage: '1d4', stat: 'dex',
        damageType: 'piercing', props: [{ key: 'light' }, { key: 'thrown', value: 4 }], req: null,
        twoHanded: false, oneHandedReq: null, tags: ['blade'], cost: '3 po', slots: 1,
    },
    {
        key: 'sickle', name: 'Faucille', vo: 'Sickle', range: 'melee', damage: '1d4', stat: 'dex',
        damageType: 'slashing', props: [{ key: 'vicious' }], req: null,
        twoHanded: false, oneHandedReq: null, tags: ['blade'], cost: '10 po', slots: 1,
    },
    {
        key: 'club_mace', name: 'Gourdin/Masse', vo: 'Club/Mace', range: 'melee', damage: '1d6', stat: 'str',
        damageType: 'bludgeoning', props: [], req: null,
        twoHanded: false, oneHandedReq: null, tags: [], cost: '2 po', slots: 1,
    },
    {
        key: 'hand_axe', name: 'Hachette', vo: 'Hand Axe', range: 'melee', damage: '1d6', stat: 'str',
        damageType: 'slashing', props: [{ key: 'thrown', value: 4 }], req: null,
        twoHanded: false, oneHandedReq: null, tags: [], cost: '8 po', slots: 1,
    },
    {
        key: 'spear', name: 'Lance', vo: 'Spear', range: 'melee', damage: '1d6', stat: 'str',
        damageType: 'piercing', props: [{ key: 'reach', value: 2 }], req: null,
        twoHanded: true, oneHandedReq: { str: 2 }, tags: [], cost: '10 po', slots: 2,
    },
    {
        key: 'short_sword', name: 'Épée courte', vo: 'Short Sword', range: 'melee', damage: '1d6', stat: 'str/dex',
        damageType: 'piercing', props: [{ key: 'light' }], req: null,
        twoHanded: false, oneHandedReq: null, tags: ['blade'], cost: '15 po', slots: 1,
    },
    {
        key: 'rapier', name: 'Rapière', vo: 'Rapier', range: 'melee', damage: '2d4', stat: 'dex',
        damageType: 'piercing', props: [], req: null,
        twoHanded: false, oneHandedReq: null, tags: ['blade'], cost: '60 po', slots: 1,
    },
    {
        key: 'staff', name: 'Bâton', vo: 'Staff', range: 'melee', damage: '1d8', stat: 'str',
        damageType: 'bludgeoning', props: [], req: null,
        twoHanded: true, oneHandedReq: null, tags: ['staff'], cost: '8 po', slots: 2,
    },
    {
        key: 'longsword', name: 'Épée longue', vo: 'Longsword', range: 'melee', damage: '1d8', stat: 'str',
        damageType: 'slashing', props: [], req: null,
        twoHanded: true, oneHandedReq: { str: 2 }, tags: ['blade'], cost: '60 po', slots: 2,
    },
    {
        key: 'battleaxe', name: 'Hache de bataille', vo: 'Battleaxe', range: 'melee', damage: '1d10', stat: 'str',
        damageType: 'slashing', props: [], req: null,
        twoHanded: true, oneHandedReq: null, tags: [], cost: '30 po', slots: 2,
    },
    {
        key: 'pole_hammer', name: 'Marteau d\'armes', vo: 'Pole Hammer', range: 'melee', damage: '1d10', stat: 'str',
        damageType: 'bludgeoning', props: [{ key: 'reach', value: 2 }], req: null,
        twoHanded: true, oneHandedReq: null, tags: [], cost: '60 po', slots: 2,
    },
    {
        key: 'glaive', name: 'Glaive', vo: 'Glaive', range: 'melee', damage: '1d10', stat: 'str',
        damageType: 'slashing', props: [{ key: 'reach', value: 2 }], req: null,
        twoHanded: true, oneHandedReq: null, tags: [], cost: '60 po', slots: 2,
    },
    {
        key: 'great_spear', name: 'Grande lance', vo: 'Great Spear', range: 'melee', damage: '1d10', stat: 'str',
        damageType: 'piercing', props: [{ key: 'reach', value: 2 }], req: null,
        twoHanded: true, oneHandedReq: null, tags: [], cost: '60 po', slots: 2,
    },
    {
        key: 'greatmaul', name: 'Maillet de guerre', vo: 'Greatmaul', range: 'melee', damage: '3d4', stat: 'str',
        damageType: 'bludgeoning', props: [], req: { str: 2 },
        twoHanded: true, oneHandedReq: null, tags: [], cost: '80 po', slots: 2,
    },
    {
        key: 'greataxe', name: 'Grande hache', vo: 'Greataxe', range: 'melee', damage: '2d6', stat: 'str',
        damageType: 'slashing', props: [], req: { str: 2 },
        twoHanded: true, oneHandedReq: null, tags: [], cost: '100 po', slots: 2,
    },
    {
        key: 'greatsword', name: 'Épée à deux mains', vo: 'Greatsword', range: 'melee', damage: '1d12', stat: 'str',
        damageType: 'slashing/piercing', props: [], req: { str: 2 },
        twoHanded: true, oneHandedReq: null, tags: ['blade'], cost: '120 po', slots: 2,
    },
    // Distance
    {
        key: 'sling', name: 'Fronde', vo: 'Sling', range: 'ranged', damage: '1d4', stat: 'dex',
        damageType: 'bludgeoning', props: [{ key: 'range', value: 12 }, { key: 'vicious' }], req: null,
        twoHanded: true, oneHandedReq: null, tags: [], cost: '4 po', slots: 2,
    },
    {
        key: 'javelins', name: 'Javelots', vo: 'Javelins', range: 'ranged', damage: '1d6', stat: 'str',
        damageType: 'piercing', props: [{ key: 'range', value: 8 }, { key: 'stack', value: 4 }], req: null,
        twoHanded: false, oneHandedReq: null, tags: [], cost: '20 po', slots: 1,
    },
    {
        key: 'throwing_hammers', name: 'Marteaux de lancer', vo: 'Throwing Hammers', range: 'ranged', damage: '1d8', stat: 'str',
        damageType: 'bludgeoning', props: [{ key: 'range', value: 4 }, { key: 'stack', value: 3 }], req: null,
        twoHanded: false, oneHandedReq: null, tags: [], cost: '25 po', slots: 1,
    },
    {
        key: 'shortbow', name: 'Arc court', vo: 'Shortbow', range: 'ranged', damage: '1d6', stat: 'dex',
        damageType: 'piercing', props: [{ key: 'range', value: 12 }], req: null,
        twoHanded: true, oneHandedReq: null, tags: [], cost: '25 po', slots: 2,
    },
    {
        key: 'longbow', name: 'Arc long', vo: 'Longbow', range: 'ranged', damage: '1d8', stat: 'dex',
        damageType: 'piercing', props: [{ key: 'range', value: 16 }], req: { str: 1 },
        twoHanded: true, oneHandedReq: null, tags: [], cost: '30 po', slots: 2,
    },
    {
        key: 'crossbow', name: 'Arbalète', vo: 'Crossbow', range: 'ranged', damage: '4d4', stat: 'dex',
        damageType: 'piercing', props: [{ key: 'load', value: 1 }, { key: 'range', value: 8 }], req: null,
        twoHanded: true, oneHandedReq: null, tags: [], cost: '60 po', slots: 2,
    },
    {
        key: 'handheld_ballista', name: 'Baliste portative', vo: 'Handheld Ballista', range: 'ranged', damage: '1d20', stat: 'dex',
        damageType: 'piercing', props: [{ key: 'load', value: 2 }, { key: 'range', value: 8 }], req: { str: 2 },
        twoHanded: true, oneHandedReq: null, tags: [], cost: '120 po', slots: 2,
    },
];

// ── Armures et boucliers (p. 33) ─────────────────────────────────────
// defense : valeur fixe (+ DEX si addDex, plafonnée à dexMax) ; bouclier : defense = bonus
export const ARMORS = [
    // Tissu
    { key: 'adventurers_garb', name: 'Tenue d\'aventurier', vo: 'Adventurer’s Garb', type: 'cloth', defense: 2, addDex: true, dexMax: null, req: null, cost: '10 po', slots: 1 },
    { key: 'minor_enchantment', name: 'Enchantement mineur', vo: 'Minor Enchantment', type: 'cloth', defense: 3, addDex: true, dexMax: null, req: null, cost: '100 po', slots: 1 },
    { key: 'major_enchantment', name: 'Enchantement majeur', vo: 'Major Enchantment', type: 'cloth', defense: 4, addDex: true, dexMax: null, req: null, cost: '1 000 po', slots: 1 },
    { key: 'epic_enchantment', name: 'Enchantement épique', vo: 'Epic Enchantment', type: 'cloth', defense: 5, addDex: true, dexMax: null, req: null, cost: '10 000 po', slots: 1 },
    // Cuir
    { key: 'cheap_hides', name: 'Peaux bon marché', vo: 'Cheap Hides', type: 'leather', defense: 3, addDex: true, dexMax: null, req: null, cost: '5 po', slots: 1 },
    { key: 'ox_hide', name: 'Peau de bœuf', vo: 'Ox Hide', type: 'leather', defense: 4, addDex: true, dexMax: null, req: null, cost: '45 po', slots: 1 },
    { key: 'hard_leather', name: 'Cuir durci', vo: 'Hard Leather', type: 'leather', defense: 5, addDex: true, dexMax: null, req: { str: 1 }, cost: '300 po', slots: 1 },
    { key: 'wyrmhide', name: 'Peau de wyrm', vo: 'Wyrmhide', type: 'leather', defense: 6, addDex: true, dexMax: null, req: { str: 1 }, cost: '2 000 po', slots: 1 },
    // Mailles
    { key: 'rusty_mail', name: 'Maille rouillée', vo: 'Rusty Mail', type: 'mail', defense: 6, addDex: true, dexMax: 2, req: null, cost: '15 po', slots: 1 },
    { key: 'chain_shirt', name: 'Chemise de mailles', vo: 'Chain Shirt', type: 'mail', defense: 9, addDex: true, dexMax: 2, req: { str: 2 }, cost: '60 po', slots: 1 },
    { key: 'scale_mail', name: 'Armure d\'écailles', vo: 'Scale Mail', type: 'mail', defense: 12, addDex: true, dexMax: 2, req: { str: 3 }, cost: '700 po', slots: 1 },
    { key: 'dragonscale', name: 'Écailles de dragon', vo: 'Dragonscale', type: 'mail', defense: 15, addDex: true, dexMax: 2, req: { str: 4 }, cost: '3 000 po', slots: 1 },
    // Plaques
    { key: 'rusty_plate', name: 'Plates rouillées', vo: 'Rusty Plate', type: 'plate', defense: 10, addDex: false, dexMax: null, req: { str: 2 }, cost: '25 po', slots: 1 },
    { key: 'half_plate', name: 'Demi-plates', vo: 'Half Plate', type: 'plate', defense: 14, addDex: false, dexMax: null, req: { str: 3 }, cost: '200 po', slots: 1 },
    { key: 'full_plate', name: 'Harnois', vo: 'Full Plate', type: 'plate', defense: 18, addDex: false, dexMax: null, req: { str: 4 }, cost: '2 000 po', slots: 1 },
    { key: 'adamantine_plate', name: 'Plates d\'adamantium', vo: 'Adamantine Plate', type: 'plate', defense: 22, addDex: false, dexMax: null, req: { str: 5 }, cost: '5 000 po', slots: 1 },
    // Boucliers
    { key: 'wooden_buckler', name: 'Rondache de bois', vo: 'Wooden Buckler', type: 'shield', defense: 2, addDex: false, dexMax: null, req: null, cost: '5 po', slots: 1 },
    { key: 'iron_shield', name: 'Bouclier de fer', vo: 'Iron Shield', type: 'shield', defense: 4, addDex: false, dexMax: null, req: { str: 2 }, cost: '80 po', slots: 1 },
    { key: 'tower_shield', name: 'Pavois', vo: 'Tower Shield', type: 'shield', defense: 6, addDex: false, dexMax: null, req: { str: 3 }, cost: '1 500 po', slots: 1 },
    { key: 'dragon_shield', name: 'Bouclier de dragon', vo: 'Dragon Shield', type: 'shield', defense: 8, addDex: false, dexMax: null, req: { str: 3 }, cost: '9 000 po', slots: 1 },
];

// ── Objets clés (p. 36) et équipement divers (p. 37) ─────────────────
// kind : potion | light | kit | gear
export const GEAR = [
    // Objets clés
    { key: 'healing_potion', name: 'Potion de soins', vo: 'Healing Potion', text: '(action) Soigne 2d4+4 PV.', cost: '50 po', slots: 1, heal: '2d4+4', kind: 'potion' },
    { key: 'greater_healing_potion', name: 'Potion de soins supérieure', vo: 'Greater Healing Potion', text: '(action) Soigne 3d6+6 PV.', cost: '150 po', slots: 1, heal: '3d6+6', kind: 'potion' },
    { key: 'supreme_healing_potion', name: 'Potion de soins suprême', vo: 'Supreme Healing Potion', text: '(action) Soigne 4d8+8 PV.', cost: '450 po', slots: 1, heal: '4d8+8', kind: 'potion' },
    { key: 'torch', name: 'Torche', vo: 'Torch', text: 'Pour quand il fait noir (1 utilisation).', cost: '5 pa', slots: 1, kind: 'light' },
    { key: 'lantern_oil', name: 'Lanterne et huile', vo: 'Lantern & Oil', text: 'Pour éclairer votre chemin (recharge : 1 po).', cost: '10 po', slots: 1, kind: 'light' },
    { key: 'medical_kit', name: 'Trousse de soins', vo: 'Medical Kit', text: 'Repos de terrain : soigne 1 Blessure (1 utilisation).', cost: '20 po', slots: 1, kind: 'kit' },
    // Équipement divers
    { key: 'bell', name: 'Clochette', vo: 'Bell', text: 'Pour le service.', cost: '2 po', slots: 1, kind: 'gear' },
    { key: 'blanket', name: 'Couverture', vo: 'Blanket', text: 'Chaude et douillette.', cost: '1 po', slots: 1, kind: 'gear' },
    { key: 'bucket', name: 'Seau', vo: 'Bucket', text: 'Fait aussi office de chapeau en cas de besoin !', cost: '1 po', slots: 1, kind: 'gear' },
    { key: 'caltrops', name: 'Chausse-trappes', vo: 'Caltrops', text: 'Attention où vous mettez les pieds !', cost: '2 po', slots: 1, kind: 'gear' },
    { key: 'camping_supplies', name: 'Matériel de camping', vo: 'Camping Supplies', text: 'Sac de couchage, rations, tente simple.', cost: '5 po', slots: 1, kind: 'gear' },
    { key: 'chain', name: 'Chaîne (3 m)', vo: 'Chain (10 ft.)', text: 'Comme une corde, mais plus solide (et lourde).', cost: '50 po', slots: 1, kind: 'gear' },
    { key: 'chalk', name: 'Craie', vo: 'Chalk', text: 'Pas SEULEMENT pour les enfants.', cost: '1 pa', slots: 1, kind: 'gear' },
    { key: 'crowbar', name: 'Pied-de-biche', vo: 'Crowbar', text: 'C\'est COMME une clé.', cost: '2 po', slots: 1, kind: 'gear' },
    { key: 'dice', name: 'Dés', vo: 'Dice', text: 'Des cailloux à calculer. Très, TRÈS amusants.', cost: '5 pa', slots: 1, kind: 'gear' },
    { key: 'grappling_hook', name: 'Grappin', vo: 'Grappling Hook', text: 'Pour escalader ou attraper de GROS poissons.', cost: '4 po', slots: 1, kind: 'gear' },
    { key: 'hand_drill', name: 'Chignole', vo: 'Hand Drill', text: 'Tourne, tourne, tourne… un nouveau trou !', cost: '5 po', slots: 1, kind: 'gear' },
    { key: 'hunting_trap', name: 'Piège de chasse', vo: 'Hunting Trap', text: 'Clac clac, gare à vos doigts !', cost: '10 po', slots: 1, kind: 'gear' },
    { key: 'instrument', name: 'Instrument', vo: 'Instrument', text: 'Tambours, cor, lyre, flûte, etc.', cost: '5–50 po', slots: 1, kind: 'gear' },
    { key: 'iron_tongs', name: 'Pinces de fer', vo: 'Iron Tongs', text: 'C\'est chaud ? Pas de problème !', cost: '3 po', slots: 1, kind: 'gear' },
    { key: 'large_sack', name: 'Grand sac', vo: 'Large Sack', text: 'Comme une GROSSE poche.', cost: '5 pa', slots: 1, kind: 'gear' },
    { key: 'lock_pick', name: 'Crochet de serrurier', vo: 'Lock Pick', text: 'C\'est pas à moi, promis !', cost: '5 po', slots: 1, kind: 'gear' },
    { key: 'magnifying_glass', name: 'Loupe', vo: 'Magnifying Glass', text: 'Rend grand ce qui est petit.', cost: '5 po', slots: 1, kind: 'gear' },
    { key: 'manacles', name: 'Menottes', vo: 'Manacles', text: 'Pour quand quelqu\'un n\'a pas été sage.', cost: '3 po', slots: 1, kind: 'gear' },
    { key: 'mirror', name: 'Miroir', vo: 'Mirror', text: 'Pour les méduses ET les épinards coincés entre les dents.', cost: '4 po', slots: 1, kind: 'gear' },
    { key: 'monster_part', name: 'Morceau de monstre', vo: 'Monster Part', text: 'Qu\'est-ce que c\'est ?', cost: '1 po', slots: 1, kind: 'gear' },
    { key: 'net', name: 'Filet', vo: 'Net', text: 'Pour les poissons (ou les petites gens).', cost: '1 po', slots: 1, kind: 'gear' },
    { key: 'padlock_key', name: 'Cadenas et clé', vo: 'Padlock & Key', text: 'Verrouillez-le ou perdez-le.', cost: '3 po', slots: 1, kind: 'gear' },
    { key: 'pitons', name: 'Pitons', vo: 'Pitons', text: 'Des pointes de métal, pour bloquer les portes.', cost: '5 po', slots: 1, kind: 'gear' },
    { key: 'pulley', name: 'Poulie', vo: 'Pulley', text: 'On tire vers le bas, ça monte.', cost: '3 po', slots: 1, kind: 'gear' },
    { key: 'quiver_ammo', name: 'Carquois et munitions', vo: 'Quiver & Ammo', text: 'Ne partez jamais sans.', cost: '10 po', slots: 1, kind: 'gear' },
    { key: 'rope', name: 'Corde (15 m)', vo: 'Rope (50 ft.)', text: 'On a toujours besoin d\'une corde.', cost: '10 po', slots: 1, kind: 'gear' },
    { key: 'saw', name: 'Scie', vo: 'Saw', text: 'Pour couper du bois.', cost: '4 po', slots: 1, kind: 'gear' },
    { key: 'shiny_object', name: 'Objet brillant', vo: 'Shiny Object', text: 'Sans valeur, mais TRÈS joli.', cost: '1 pa', slots: 1, kind: 'gear' },
    { key: 'shovel', name: 'Pelle', vo: 'Shovel', text: 'Parfois, il faut creuser un trou.', cost: '3 po', slots: 1, kind: 'gear' },
    { key: 'soap', name: 'Savon', vo: 'Soap', text: 'Inutile.', cost: '1 pa', slots: 1, kind: 'gear' },
    { key: 'strange_plant', name: 'Plante étrange', vo: 'Strange Plant', text: 'Qui sait ?', cost: '5 pa', slots: 1, kind: 'gear' },
    { key: 'telescope', name: 'Longue-vue', vo: 'Telescope', text: 'Arrr.', cost: '10 po', slots: 1, kind: 'gear' },
    { key: 'useful_book', name: 'Livre utile', vo: 'Useful Book', text: 'Pour faire des recherches.', cost: '5 po', slots: 1, kind: 'gear' },
    { key: 'vial_of_pitch', name: 'Fiole de poix', vo: 'Vial of Pitch', text: 'Collante, et TRÈS inflammable.', cost: '2 po', slots: 1, kind: 'gear' },
];

// Encadrés des pages d'équipement (p. 32-37)
export const EQUIPMENT_NOTES = [
    {
        key: 'proficiency', title: 'Maîtrise de l\'équipement', vo: 'Equipment Proficiency',
        text: 'Les héros peuvent utiliser n\'importe quel équipement ; cependant, chaque classe a une liste de types d\'armes et d\'armures qu\'elle maîtrise le mieux. Les armes utilisées sans maîtrise ne peuvent pas infliger de critique. Se défendre en portant une armure ou en maniant un bouclier sans maîtrise coûte 1 action supplémentaire.',
    },
    {
        key: 'swapping', title: 'Changer d\'équipement', vo: 'Swapping Equipment',
        text: 'Un héros peut ranger une arme ou un bouclier qu\'il maîtrise et en équiper un autre gratuitement, 1/round.',
    },
    {
        key: 'armor_defense', title: 'Armure et Défense', vo: 'Armor & Defense',
        text: 'La Défense représente la capacité de votre héros à esquiver ou bloquer les dégâts quand vous utilisez la réaction Se défendre. Sans armure ou en vêtements ordinaires, votre Défense est égale à votre DEX. Certains objets peuvent accorder une Défense supplémentaire tant qu\'ils sont équipés.',
    },
    {
        key: 'deflect', title: 'Parade !', vo: 'Deflect!',
        text: 'Les héros qui maîtrisent les boucliers peuvent réduire les dégâts d\'une attaque (même un critique) de la valeur de Défense de leur bouclier, gratuitement (1/round), au lieu d\'ajouter la Défense de leur bouclier à leur total.',
    },
    {
        key: 'weapon_properties', title: 'Propriétés des armes', vo: 'Weapon Properties',
        text: '• **À deux mains.** Peut être tenue d\'une seule main, mais doit être maniée à deux mains pour attaquer.\n• **Chargement.** Certaines armes demandent des actions supplémentaires pour être chargées avant chaque tir.\n• **Allonge.** La distance à laquelle un ennemi doit se trouver pour être affecté par cette attaque. Si elle n\'est pas précisée, Allonge 1.\n• **Portée.** Les attaques peuvent être faites de loin. Si un ennemi vous est adjacent, vos attaques à distance ont le désavantage. Ajoutez 1 dé de désavantage pour gagner +2 de Portée (+6 de Portée supplémentaire au maximum ; désavantage 3).\n• **Lancer.** Traitez une arme de mêlée comme si elle avait une Portée. Une fois lancée, vous ne l\'avez plus !\n• **Féroce.** Lancez 1 dé supplémentaire chaque fois que vous lancez des dégâts critiques.',
    },
    {
        key: 'primary_die', title: 'N\'oubliez pas !', vo: 'Remember!',
        text: 'Seul le dé primaire (celui le plus à gauche) détermine si une attaque est critique. Chaque fois que vous lancez des dégâts critiques, lancez aussi le dé Féroce supplémentaire !',
    },
    {
        key: 'dual_wielding', title: 'Combat à deux armes', vo: 'Dual Wielding',
        text: 'Les héros peuvent manier 2 armes légères en même temps. En combattant à deux armes, (1/round) vous pouvez obtenir l\'avantage sur une attaque faite avec ces armes. Vous pouvez manier deux armes à une main sans la propriété Légère si votre FOR est de 3 ou plus, ou 1 arme sans la propriété Légère si votre FOR est de 2. À mains nues, poings et pieds peuvent être maniés comme deux armes si vous maîtrisez les frappes à mains nues.\nDeux armes différentes ? Lancez les dés des deux armes et choisissez l\'un ou l\'autre résultat (la limite de 1/round s\'applique toujours). Vous attaquez avec avantage ? Ajoutez un dé supplémentaire pour l\'une des armes.',
    },
    {
        key: 'unarmed', title: 'Frappes à mains nues', vo: 'Unarmed Strikes',
        text: 'Pour attaquer à mains nues ou avec les pieds, lancez 1d4+FOR. Les héros qui ne maîtrisent pas les frappes à mains nues ne peuvent pas infliger de critique.',
    },
    {
        key: 'improvised', title: 'Armes improvisées', vo: 'Improvised Weapons',
        text: 'Avec une arme improvisée (une chaise, une poêle, un gros caillou…), utilisez par défaut 1d4+FOR ou 1d6+FOR. Votre MJ peut vous autoriser des dés plus gros ou d\'autres propriétés si cela a du sens. Une arme improvisée risque toutefois de se briser après quelques coups !',
    },
    {
        key: 'customizing', title: 'Personnaliser ses armes', vo: 'Customizing Weapons',
        text: 'Peut-on habiller un bâton en grosse massue ? Bien sûr ! Un saï au lieu d\'une dague ? Évidemment ! Peut-on payer un forgeron pour que votre maillet de guerre à 3d4 inflige 2d6 ou 1d12 à la place ? Comme les dés totalisent tous 12, cela ne cassera pas le jeu : demandez à votre MJ ! Un forgeron peut-il faire infliger autant de dégâts à votre dague ? Non, désolé !',
    },
    {
        key: 'healing_potions', title: 'Potions de soins', vo: 'Healing Potions',
        text: 'Les potions de soins sont des élixirs d\'un rouge profond et chatoyant, au goût rafraîchissant et pétillant. Ces potions sont essentielles pour récupérer rapidement, mais elles sont rares. Les petites villes n\'en ont parfois que quelques-unes, tandis que les cités en proposent davantage (mais pas en quantité illimitée). Les riches s\'en servent souvent pour afficher leur opulence, en les incorporant à des cocktails élaborés lors de réceptions mondaines. Boire une potion ou l\'administrer à une créature consentante adjacente demande 1 action.',
    },
    {
        key: 'torches_lanterns', title: 'Torches et lanternes', vo: 'Torches & Lanterns',
        text: 'Les héros ne voient pas dans le noir : ils sont aveuglés quand ils combattent sans lumière. Ils peuvent emporter une lanterne ou une torche pour éclairer leur chemin, à condition d\'avoir une main libre (ou un autre moyen) pour la tenir. Une torche dure généralement 1 donjon (ou 1 niveau d\'un très grand donjon). Une lanterne et son huile durent généralement 1 expédition entière, jusqu\'à votre prochain repos sûr. Les deux éclairent jusqu\'à 6 cases ; au-delà, c\'est l\'obscurité.',
    },
    {
        key: 'be_warned', title: 'Prenez garde !', vo: 'Be Warned!',
        text: 'Les créatures des ténèbres n\'apprécient pas forcément la lumière et peuvent attaquer en premier ceux qui la portent. Certains sorts (de feu, de foudre ou radiants, par exemple) peuvent aussi produire des éclairs de lumière et attirer une attention indésirable !',
    },
    {
        key: 'availability', title: 'Disponibilité de l\'équipement', vo: 'Equipment Availability',
        text: 'Le prix des objets ordinaires va généralement de quelques pièces d\'argent à quelques pièces d\'or. Si vous trouvez un artisan, vous pouvez lui commander quelque chose, en gros tout ce que vous pouvez imaginer et que son niveau de technologie permet de fabriquer. Plus c\'est ouvragé, plus c\'est cher. Commander un objet spécial commence généralement autour de 50 po, et ne fait qu\'augmenter à partir de là. Les petites villes ont moins d\'objets et d\'artisans que les grandes cités.',
    },
    {
        key: 'what_about', title: 'Et… ?', vo: 'What About…?',
        text: 'Ce ne sont pas TOUS les objets en vente, seulement un échantillon. Si vous pouvez l\'imaginer, vous pouvez probablement l\'acheter !',
    },
];

// Règle de la monnaie (p. 37)
export const CURRENCY_TEXT = 'La monnaie se compose de pièces d\'argent (pa) et de pièces d\'or (po). 10 pièces d\'argent = 1 pièce d\'or. 1 pa correspond à peu près au prix d\'un repas modeste ; 1 po, à celui d\'un festin somptueux. La plupart des petites villes proposent de l\'équipement et des objets valant 50 po ou moins. Il vous faudra partir à l\'aventure vers des villes plus grandes ou des cités, ou trouver un marchand itinérant, pour acheter des pièces d\'équipement de plus grande valeur.';

// ── Objets magiques (p. 38-41) ───────────────────────────────────────
export const MAGIC_ITEMS_INTRO = 'Si certains objets magiques peuvent s\'acheter, la plupart ne le peuvent pas. Quelques boutiques spécialisées en proposent parfois un tout petit choix, mais ces objets puissants s\'obtiennent le plus souvent en partant à l\'aventure.';

export const MAGIC_RARITIES = [
    { key: 'uncommon', label: 'Peu commun', vo: 'Uncommon', levels: 'Trouvé en général vers les niveaux 2–6', cost: '50–500+ po' },
    { key: 'rare', label: 'Rare', vo: 'Rare', levels: 'Trouvé en général vers les niveaux 5–12', cost: '500–5 000+ po' },
    { key: 'very_rare', label: 'Très rare', vo: 'Very Rare', levels: 'Trouvé en général vers les niveaux 8–18', cost: '5 000–500 000+ po' },
    { key: 'legendary', label: 'Légendaire', vo: 'Legendary', levels: 'Trouvé en général vers les niveaux 15–20', cost: '1 000 000+ po ou inestimable' },
];

export const MAGIC_ITEMS = [
    {
        key: 'weapon_of_many_hands', name: 'Arme aux mains multiples', vo: 'Weapon of Many Hands', rarity: 'varies', kind: 'weapon',
        text: 'Tant qu\'elle est équipée, cette arme accorde des bras supplémentaires à celui qui la manie. Il peut utiliser ces bras supplémentaires pour accomplir toute tâche que ses mains normales peuvent faire (manier de l\'équipement, agripper, grimper, etc.), mais ils ne lui permettent pas d\'agir plus vite (et ces appendices supplémentaires risquent d\'horrifier la bonne société). Une arme qui accorde 1 main supplémentaire est probablement peu commune ; 4 mains supplémentaires, légendaire.\n**Des bras en plus ?!** Oui, vous pouvez manier deux armes à deux mains, porter plus d\'un bouclier, ou agripper 2 créatures différentes tout en les frappant toutes les deux ! Ou toutes sortes d\'autres choses inventives, tant que vous avez les bras pour le faire.',
    },
    {
        key: 'harbinger_and_sovereign', name: 'Augure et Souverain, Emprise de l\'Abysse', vo: 'Harbinger & Sovereign, Abyssal’s Claim', rarity: 'legendary', kind: 'weapon',
        text: 'Glaives légendaires. Paire de glaives assortis : +4 bras supplémentaires tant que les deux sont équipés.',
    },
    {
        key: 'weapon_of_animosity', name: 'Arme d\'animosité', vo: 'Weapon of Animosity', rarity: 'varies', kind: 'weapon',
        text: 'Chaque fois que vous attaquez avec cette arme, lancez un dé d\'animosité supplémentaire. Si l\'attaque touche, l\'arme inflige autant de dégâts supplémentaires à votre cible. Chaque fois que cette arme rate, c\'est vous qui subissez ces dégâts. Une arme qui ajoute 1d4 est probablement peu commune ; 1d10 ou plus, légendaire.',
    },
    {
        key: 'weapon_of_slaying', name: 'Arme tueuse', vo: 'Weapon of Slaying', rarity: 'varies', kind: 'weapon',
        text: 'Chaque fois que vous attaquez avec cette arme, elle inflige un dé de dégâts supplémentaire contre un type de créature particulier. Ces créatures pourraient bien essayer de vous tuer en premier. Une arme tueuse à 1d4 est probablement peu commune ; à 1d10 ou plus, légendaire.',
    },
    {
        key: 'gnatbane_weapon', name: 'Arme fléau-des-moucherons', vo: 'Gnatbane Weapon', rarity: 'uncommon', kind: 'weapon',
        text: 'Ne rate pas les créatures de taille petite ou minuscule (elles risquent de vous en vouloir et de vous attaquer en premier).',
    },
    {
        key: 'weapon_of_wounding', name: 'Arme sanglante', vo: 'Weapon of Wounding', rarity: 'uncommon', kind: 'weapon',
        text: 'Quand vous touchez avec cette arme, vous pouvez subir 1d6 dégâts pour infliger deux fois autant de dégâts supplémentaires à votre cible.',
    },
    {
        key: 'trinket_of_ill_omen', name: 'Breloque de mauvais augure', vo: 'Trinket of Ill Omen', rarity: 'rare', kind: 'wondrous',
        text: 'Tant qu\'elle est équipée, vous avez –1 à vos jets de sauvegarde et +1 à votre DD de sauvegarde.',
    },
    {
        key: 'mindlink_daggers', name: 'Dagues de lien mental', vo: 'Mindlink Daggers', rarity: 'rare', kind: 'weapon',
        text: 'Une paire assortie de fines dagues d\'argent ornées de runes entrelacées. Elles permettent de partager ses pensées entre tous ceux qui en tiennent une (ou qui ont été poignardés par l\'une d\'elles).',
    },
    {
        key: 'bloodstained_quill', name: 'Plume tachée de sang', vo: 'Bloodstained Quill', rarity: 'uncommon', kind: 'wondrous',
        text: 'Si vous trempez cette plume dans le sang d\'une créature intelligente morte, la plume s\'anime et écrit les dernières paroles prononcées par cette créature.',
    },
    {
        key: 'eyes_of_the_street', name: 'Yeux de la rue', vo: 'Eyes of the Street', rarity: 'uncommon', kind: 'wondrous',
        text: 'Une paire de lunettes couvertes d\'une crasse impossible à nettoyer complètement. En les portant, vous pouvez regarder un rat ou un pigeon pour voir et entendre par ses sens pendant 10 minutes. Une fois ce pouvoir utilisé, vous devez murmurer un secret aux lunettes avant de pouvoir les réutiliser. Ce secret semble toujours devenir une rumeur locale avant longtemps…',
    },
    {
        key: 'handwraps_of_force', name: 'Bandages de force', vo: 'Handwraps of Force', rarity: 'rare', kind: 'wondrous',
        text: 'En portant ces bandages, chaque fois que vous faites une frappe à mains nues, vous pouvez repousser votre cible jusqu\'à 2 cases, et vous-même de la même distance dans la direction opposée. Vous pouvez à la place faire une attaque sans cible, en frappant l\'air pour vous propulser de 4 cases dans n\'importe quelle direction.',
    },
    {
        key: 'resolute_fangs_golden_bastion', name: 'Crocs résolus, Bastion doré', vo: 'Resolute Fangs, Golden Bastion', rarity: 'legendary', kind: 'shield',
        text: 'Bouclier légendaire. +8 Défense. Chaque fois que vous réduisez les dégâts d\'une attaque de mêlée avec ce bouclier, il peut agripper l\'attaquant quelle que soit sa taille (évasion DD 20 FOR, 1 créature au maximum). Action : prononcez le mot de commande de ce bouclier pour le rendre inamovible, fixé sur place, jusqu\'à ce que le mot soit prononcé à nouveau.',
    },
    {
        key: 'key_of_doors', name: 'Clé des portes', vo: 'Key of Doors', rarity: 'very_rare', kind: 'wondrous',
        text: 'Insérez cette clé dans n\'importe quelle porte verrouillée pour l\'ouvrir, non pas sur la pièce qui se trouve derrière, mais sur n\'importe quel seuil que vous avez déjà franchi en tenant cet objet.',
    },
    {
        key: 'grim_coronet', name: 'Couronne funeste', vo: 'Grim Coronet', rarity: 'rare', kind: 'wondrous',
        text: 'Quand vous devriez mourir en portant cette couronne, gagnez 3 actions et jouez immédiatement un tour. Vous mourez à la fin de votre tour.',
    },
    {
        key: 'vindication', name: 'Vindicte', vo: 'Vindication', rarity: 'legendary', kind: 'weapon',
        text: 'Arme d\'animosité légendaire. Une lame dentelée marquée de brûlures et de taches sombres, qui irradie une énergie amère et vengeresse punissant aussi bien celui qui la manie que son ennemi. +1d12 dégâts. Vous subissez ces dégâts en cas de raté.',
    },
    {
        key: 'pocket_cauldron', name: 'Chaudron de poche', vo: 'Pocket Cauldron', rarity: 'rare', kind: 'wondrous',
        text: 'Pendant un repos sûr, utilisez-le pour préparer 1 potion de votre choix, à consommer immédiatement :\n• **Élixir de prescience :** cette potion accorde à celui qui la boit une brève vision énigmatique d\'un événement futur.\n• **Élixir de requiem :** cette potion permet à celui qui la boit de revivre un souvenir crucial de son passé.\n• **Élixir du temps :** une fois tous les 100 ans, le chaudron peut préparer une potion capable de ramener celui qui la boit 1 jour en arrière.',
    },
    {
        key: 'phoenix_helm', name: 'Heaume du phénix', vo: 'Phoenix Helm', rarity: 'legendary', kind: 'wondrous',
        text: 'Si vous mourez en portant ce heaume doré, votre corps explose en flammes et en cendres brûlantes. Vous renaissez de vos cendres… (voir p. 71 du Guide du MJ pour plus de détails).',
    },
    {
        key: 'ball_of_spiders', name: 'Boule d\'araignées', vo: 'Ball of Spiders', rarity: 'uncommon', kind: 'wondrous',
        text: 'Une boule noire de la taille d\'une paume, gravée de motifs qui semblent se tortiller faiblement. Action : lancez cette boule jusqu\'à 6 cases. À l\'impact, elle se brise et libère une nuée d\'araignées spectrales inoffensives mais horriblement réalistes qui couvrent une zone de 2×2. Les créatures dans la zone doivent réussir une sauvegarde de VOL ou être effrayées jusqu\'à la fin de leur prochain tour. Une fois utilisée, la boule se reforme au prochain repos sûr.',
    },
    {
        key: 'skitter_shoes', name: 'Chaussures trotte-murs', vo: 'Skitter Shoes', rarity: 'rare', kind: 'wondrous',
        text: 'En portant ces chaussures, vous pouvez marcher sur les surfaces verticales ou les plafonds comme sur un sol plat, mais seulement à la moitié de votre Vitesse. Si vous terminez votre tour la tête en bas ou sur une surface verticale, vous devez réussir une sauvegarde de FOR DD 10 ou tomber, et vous retrouver à terre.',
    },
    {
        key: 'button_of_protection', name: 'Bouton de protection', vo: 'Button of Protection', rarity: 'rare', kind: 'wondrous',
        text: 'Un petit bouton anodin gravé d\'un sceau qui luit faiblement. Une fois cousu sur une tenue, vous pouvez, en réaction quand vous êtes attaqué, l\'arracher et le lancer en l\'air. Le bouton émet un éclair de lumière aveuglant et un sifflement aigu. L\'attaquant doit réussir une sauvegarde de VOL ou être distrait, ce qui lui fait rater son attaque.\nAprès usage, le bouton devient inerte. Une couturière ou un tailleur expérimenté peut le recoudre sur un vêtement avec du fil d\'argent pendant un repos sûr, ce qui réactive son pouvoir.',
    },
];

// ── Parchemins et baguettes (p. 42-43) ───────────────────────────────
export const SCROLL_TEXT = 'Les parchemins de sort sont des sorts magiques inscrits, à usage unique (voir Magie, p. 44, pour plus de détails). Lancer un sort à l\'aide d\'un parchemin ne coûte pas de mana et ne demande aucune aptitude magique. Quiconque sait lire la langue du parchemin peut l\'utiliser. Le lire à voix haute prend le même nombre d\'actions que le sort demande normalement, et consume le parchemin.\nUn personnage doit réussir un test d\'Arcanes DD 10 pour le lancer s\'il ne connaît pas déjà un sort de cette école ; en cas d\'échec, le parchemin est perdu.';

export const WAND_TEXT = 'Comme les parchemins de sort, les baguettes permettent de lancer des sorts sans dépenser de mana et ne demandent aucune aptitude magique. Contrairement aux parchemins, elles peuvent être rechargées et réutilisées. Les personnages qui maîtrisent les baguettes peuvent en utiliser une de n\'importe quelle école de magie, en dépensant seulement le nombre normal d\'actions pour lancer le sort.\nLes personnages qui ne maîtrisent pas les baguettes doivent réussir un test d\'Arcanes DD 10 + rang du sort pour lancer le sort. Réussite ou échec, la charge est dépensée.';

export const SCROLL_COSTS = [
    { tier: 0, cost: '10 po' },
    { tier: 1, cost: '35 po' },
    { tier: 2, cost: '100 po' },
    { tier: 3, cost: '300 po' },
    { tier: 4, cost: '1 000 po' },
    { tier: 5, cost: '3 000 po' },
    { tier: 6, cost: '10 000 po' },
    { tier: 7, cost: '25 000+ po' },
    { tier: 8, cost: '75 000+ po' },
    { tier: 9, cost: '200 000+ po' },
];

export const WAND_COSTS = [
    { tier: 0, cost: '50 po' },
    { tier: 1, cost: '175 po' },
    { tier: 2, cost: '500 po' },
    { tier: 3, cost: '1 500 po' },
    { tier: 4, cost: '5 000 po' },
    { tier: 5, cost: '15 000 po' },
    { tier: 6, cost: '50 000 po' },
    { tier: 7, cost: '125 000+ po' },
    { tier: 8, cost: '375 000+ po' },
    { tier: 9, cost: '1 000 000+ po' },
];

// Baguettes nommées (p. 43) ; tier 0 = tour de magie
export const WANDS = [
    {
        key: 'wand_of_fire_step', name: 'Baguette de Pas de feu', vo: 'Wand of Fire Step', rarity: 'uncommon', tier: 0, charges: 3,
        recharge: 'Chauffez la baguette dans la forge d\'un forgeron jusqu\'à ce qu\'elle rougeoie, puis trempez-la dans l\'huile.',
    },
    {
        key: 'wand_of_barrier_of_wind', name: 'Baguette de Barrière de vent', vo: 'Wand of Barrier of Wind', rarity: 'rare', tier: 2, charges: 3,
        recharge: 'Suspendez la baguette avec des carillons éoliens dans un endroit venteux. Laissez-la tinter pendant 3 jours.',
    },
    {
        key: 'wand_of_dread_visage', name: 'Baguette de Visage d\'effroi', vo: 'Wand of Dread Visage', rarity: 'uncommon', tier: 2, charges: 2,
        recharge: 'Placez la baguette dans un cadavre fraîchement tué. Laissez-la jusqu\'à ce qu\'il ne reste que les os.',
    },
    {
        key: 'wand_of_fly', name: 'Baguette de Vol', vo: 'Wand of Fly', rarity: 'uncommon', tier: 3, charges: 2,
        recharge: 'Donnez-la à un oiseau sauvage et laissez-le voler librement. Récupérez-la là où l\'oiseau la laisse tomber.',
    },
    {
        key: 'wand_of_glacier_strike', name: 'Baguette de Frappe glaciaire', vo: 'Wand of Glacier Strike', rarity: 'very_rare', tier: 8, charges: 1,
        recharge: 'Laissez la baguette au fond d\'un lac jusqu\'à ce qu\'il gèle puis dégèle naturellement.',
    },
    {
        key: 'wand_of_ride_the_lightning', name: 'Baguette de Chevaucher l\'éclair', vo: 'Wand of Ride the Lightning', rarity: 'very_rare', tier: 6, charges: 2,
        recharge: 'Placez-la au point le plus élevé à 1,5 km à la ronde. Récupérez-la après 3 orages.',
    },
    {
        key: 'wand_of_sacrifice', name: 'Baguette de Sacrifice', vo: 'Wand of Sacrifice', rarity: 'very_rare', tier: 6, charges: 1,
        recharge: 'Plantez-la dans un jardin nouveau. Laissez-la sans y toucher jusqu\'à ce que les fleurs éclosent.',
    },
    {
        key: 'elderwyrms_majesty', name: 'Majesté du Grand Wyrm', vo: 'Elderwyrm’s Majesty', rarity: 'legendary', tier: 9, charges: 1,
        text: 'Cette baguette peut lancer Forme draconique, la forme prise étant celle du type de dragon qui l\'a rechargée en dernier.',
        recharge: 'Offrez à un dragon ancien un présent qu\'il désire vraiment.',
    },
    {
        key: 'heartwood', name: 'Cœur-de-bois, Éclat de l\'Arbre de vie', vo: 'Heartwood, Splinter of the Tree of Life', rarity: 'legendary', tier: 9, charges: 1,
        text: 'Lance Rédemption sans aucune composante requise.',
        recharge: 'Un hymne sacré doit être chanté au-dessus d\'elle sans interruption pendant 100 ans.',
    },
];

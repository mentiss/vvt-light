// src/client/src/systems/vikings/config/equipment.js
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue d'équipement (armes, armures, boucliers, objets courants).
// Référence : documentations/spec_vikings.md, annexe D (vault « 05 - Équipement
// et économie »). Prix moyens en onces d'argent (oz ≈ 28 g) ; null = variable.
//
// Champs repris dans l'inventaire du personnage : name, category, weaponType,
// damage, range, armorValue, requirements. price, material et notes ne servent
// qu'à la consultation du catalogue (pas de colonne en base).
// Cuir renforcé et Casque n'ont pas de valeurs dans le vault : valeurs de
// l'ancienne version de l'app conservées.
// ─────────────────────────────────────────────────────────────────────────────

const weapon = (name, weaponType, damage, requirements, price, material, extra = {}) =>
    ({ name, category: 'weapon', weaponType, damage, requirements, price, material, ...extra });

const armor = (name, armorValue, requirements, price, extra = {}) =>
    ({ name, category: 'armor', armorValue, requirements, price, ...extra });

const item = (name, price, notes) => ({ name, category: 'item', price, ...(notes ? { notes } : {}) });

export const ITEMS = [
    // ── Armes à une main ──────────────────────────────────────────────────────
    weapon('Hache',               '1 main',        2, { force: 2 },               20,  'Fer'),
    weapon('Gourdin',             '1 main',        1, { force: 1 },               15,  'Fer/Bois'),
    weapon('Épée',                '1 main',        2, { force: 2 },               36,  'Fer'),
    weapon('Épée (Acier)',        '1 main',        2, { force: 2 },               120, 'Acier', { notes: 'Post 830' }),
    weapon('Couteau',             '1 main / Jet',  1, { force: 1, agilite: 1 },   10,  'Fer', { range: '15m' }),

    // ── Armes à deux mains ───────────────────────────────────────────────────
    weapon('Hache Dane',          '2 mains',       2, { force: 2, agilite: 2 },   50,  'Fer'),
    weapon('Glaive',              '2 mains',       2, { force: 2 },               20,  'Fer'),
    weapon('Scramasaxe',          '2 mains',       1, { force: 1 },               15,  'Fer'),
    weapon('Scramasaxe (Acier)',  '2 mains',       1, { force: 1 },               36,  'Acier', { notes: 'Post 830' }),
    weapon('Épée longue',         '2 mains',       2, { force: 3 },               42,  'Fer'),
    weapon('Épée longue (Acier)', '2 mains',       2, { force: 3 },               160, 'Acier', { notes: 'Post 830' }),
    weapon('Grande hache',        '2 mains',       2, { force: 3 },               42,  'Fer'),
    weapon('Grande hache (Acier)', '2 mains',      2, { force: 3 },               160, 'Acier', { notes: 'Post 830' }),
    weapon('Bâton',               '2 mains',       2, { force: 2 },               15,  'Fer/Bois'),
    weapon('Lance',               '2 mains / Jet', 2, { force: 2, agilite: 2 },   36,  'Fer', { range: '15m', notes: 'Compétence Javelot pour la distance possible' }),

    // ── Armes à distance ─────────────────────────────────────────────────────
    weapon('Arc',                 'Distance',      1, { agilite: 2 },             25,  null, { range: '30m', notes: 'Ignore l\'armure (sauf bouclier)' }),
    weapon('Javelot',             'Distance',      2, { force: 3 },               20,  'Fer', { range: '25m' }),
    weapon('Fronde',              'Distance',      1, { agilite: 1 },             10,  null, { range: '20m' }),

    // ── Armures ──────────────────────────────────────────────────────────────
    armor('Tissu',                0, {},              5),
    armor('Tissu décoré',         0, {},              30, { notes: 'Statut social' }),
    armor('Broigne',              1, { force: 1 },    33),
    armor('Peau de bête',         1, { force: 1 },    25),
    armor('Plaque de cuir',       2, { force: 2 },    36),
    armor('Cuir renforcé',        2, { force: 2 },    null),
    armor('Casque',               1, {},              null, { notes: 'Empêche généralement le critique mortel' }),

    // ── Boucliers (fusible : encaissent en premier, se brisent au-delà) ──────
    armor('Bouclier en bois',     1, {},              10, { notes: 'Se brise si dégâts > 1' }),
    armor('Bouclier cuir',        2, {},              16, { notes: 'Se brise si dégâts > 2' }),

    // ── Objets courants ──────────────────────────────────────────────────────
    item('Corde (10m)',            6,    'Corde marine pour langskip'),
    item('Chaîne (au mètre)',      10,   'Chaîne de fer'),
    item('Provisions (semaine)',   2,    'Sac de provisions pour une personne (1-2 oz)'),
    item('Pichet de vin',          2,    'Vin de basse qualité, importé (1-2 oz)'),
    item('Fruits (au kg)',         1,    'Baies, pommes, fraises'),
    item('Nécessaire de toilette', 4,    'Cure-oreille, pince à épiler, lime, sur chaînette en fer'),
    item('Fourrure',               null, 'Peau tannée pour la chaleur ou le commerce'),
    item('Médaillon protection',   12,   'Marteau ou femme, représente un dieu'),
    item('Corne à boire',          3,    'Taillée dans une défense de morse ou une corne de taureau'),
    item('Rame',                   8,    'Belle rame monobloc (pin/tilleul)'),
    item('Once d\'argent',         1),
];

// src/client/src/systems/achtung/config/spells.js
// Catalogue des sorts par tradition + modèle de magie (pratiques).
//
// MODÈLE DE MAGIE (validé GM, session du 18/06/2026) :
// Un talent avec le keyword 'spellcaster' ouvre l'accès à la magie.
// La PRATIQUE est ensuite choisie LIBREMENT par le joueur à l'étape 6 du
// wizard, indépendamment du talent précis pris. Le talent ouvre juste l'accès.
//
// 3 pratiques -> attribut de cast :
//   researcher  (Chercheur)       -> reason (Raisonnement)
//   traditional (Traditionnaliste)-> insight (Perception)
//   dabbler     (Amateur)         -> will (Volonté)
//
// Accès aux traditions selon pratique :
//   celtic  -> researcher, traditional, dabbler (tous)
//   runic   -> researcher, traditional, dabbler (tous)
//   psychic -> researcher, dabbler (PAS traditional)
//   nazi (Livre des Mythes) -> accès manuel GM uniquement (sorts non publics,
//                              jamais proposés dans le wizard ni le picker joueur)
//
// Sorts de départ par pratique (p.140) :
//   researcher  -> 2
//   traditional -> 3
//   dabbler     -> 1 normal OU 2 imparfaits/flawed

export const SPELLS = {

    // ── Tradition Celtique ────────────────────────────────────────────────────
    celtic: [
        {
            key: 'spear_of_lug',
            label: 'Lance de Lug',
            skill: 'fighting',
            difficulty: 3,
            cost: '5⚄ Drain, Perforant 1',
            duration: 'Instantané',
            effect: 'Sort d\'attaque. Cible un ennemi ou objet à portée Moyenne, inflige Puissance +2⚄ stress physique avec l\'effet Perforant 3. Pour 2 Momentum : ajout Intense ou Vicieux.',
        },
        {
            key: 'bounties_of_dagda',
            label: 'Bienfaits de Dagda',
            skill: 'medicine',
            difficulty: 2,
            cost: '4⚄ Drain',
            duration: 'Instantané',
            effect: 'Sort de Protection. Retire immédiatement un stress égal à la Puissance du lanceur pour tous les alliés à portée Proche. Pour 2 Momentum : les alliés soignent une Blessure ou récupèrent immédiatement.',
        },
        {
            key: 'gaze_of_balor',
            label: 'Regard de Balor',
            skill: 'persuasion',
            difficulty: 2,
            cost: '5⚄ Drain, Étourdissant',
            duration: 'Instantané',
            effect: 'Sort d\'attaque (opposé Vol + Résilience). Cible un ennemi à portée Moyenne, inflige Puissance +2⚄ stress mental avec l\'effet Étourdissant. Pour 2 Momentum : ajout Drain ou Persistant 6.',
        },
        {
            key: 'gift_of_arduinna',
            label: 'Don d\'Arduinna',
            skill: 'survival',
            difficulty: 3,
            cost: '4⚄ Drain',
            duration: 'Rounds égaux à la Puissance, répartis entre les cibles',
            effect: 'Sort de Bénédiction. Affecte le lanceur et ses alliés à portée Proche (jusqu\'à Puissance cibles). Les affectés ignorent fatigue, recharge double, agissent deux fois aussi efficacement. Pour 2 Momentum : une cible gagne une action majeure bonus par tour.',
        },
        {
            key: 'horn_of_neit',
            label: 'Cor de Néit',
            skill: 'survival',
            difficulty: 1,
            cost: '4⚄ Drain',
            duration: 'Rounds égaux à la Puissance',
            effect: 'Sort de Malédiction. Toutes les créatures ennemies à portée Moyenne sont enveloppées par des racines fantômes — elles ne peuvent ni bouger ni agir. Se libérer requiert un jet Agilité + Athlétisme de difficulté égale aux effets obtenus. Pour 1 Momentum : stress +1⚄ supplémentaire.',
        },
        {
            key: 'cyclone_of_cernunnos',
            label: 'Cyclone de Cernunnos',
            skill: 'survival',
            difficulty: 2,
            cost: '4⚄ Drain, Perforant 1',
            duration: 'Rounds égaux à la Puissance',
            effect: 'Sort d\'Invocation. Conjure un cyclone dans une zone à portée Moyenne. Inflige Puissance +1⚄ stress physique (Perforant 1, Étourdissant) à toutes les créatures dans la zone à chaque tour. Dégâts doublés contre créatures surnaturelles. Pour 1 Momentum : +1⚄ stress supplémentaire.',
        },
        {
            key: 'roots_of_the_earth',
            label: 'Racines de la Terre',
            skill: 'survival',
            difficulty: 2,
            cost: '3⚄ Drain, Étourdissant',
            duration: 'Instantané',
            effect: 'Sort de Bénédiction. Le lanceur et ses alliés (jusqu\'à Puissance/2 cibles) à portée Proche disparaissent et réapparaissent à n\'importe quel point visible à portée Longue. Pour 2 Momentum : les personnages transportés gagnent +2 Couverture jusqu\'au début du prochain tour.',
        },
        {
            key: 'ogham_sign',
            label: 'Le Signe Ogham',
            skill: 'academia',
            difficulty: 3,
            cost: '5⚄ Drain, Perforant 1',
            duration: 'Instantané',
            effect: 'Sort de Bannissement. Cible une créature surnaturelle à portée Moyenne, inflige Puissance +2⚄ stress mental (Perforant 2, Étourdissant), même sur cibles immunisées mentalement. Si la créature subit une Blessure, elle perd sa règle Invulnérable pour la scène. Si vaincue, bannie instantanément. Pour 2 Momentum : ajout Intense ou Étourdissant.',
        },
    ],

    // ── Tradition Runique ─────────────────────────────────────────────────────
    runic: [
        {
            key: 'ravens_of_odin',
            label: 'Corbeaux d\'Odin',
            skill: 'academia',
            difficulty: 2,
            cost: '4⚄ Drain, Perforant 1',
            duration: 'Rounds égaux à la Puissance',
            effect: 'Sort de Protection. Tous les alliés à portée Proche reçoivent un Moral égal à la Puissance. Pour 2 Momentum : les alliés affectés infligent +2⚄ stress à toutes leurs attaques de mêlée et peuvent recevoir 1 Fortune (perdue si inutilisée à la fin de la durée).',
        },
        {
            key: 'hammer_of_thor',
            label: 'Marteau de Thor',
            skill: 'fighting',
            difficulty: 2,
            cost: '4⚄ Drain, Perforant 1',
            duration: 'Instantané',
            effect: 'Sort d\'attaque. Cible un ennemi ou objet à portée Moyenne, inflige Puissance +2⚄ dégâts avec l\'effet Zone. Pour 1 Momentum : remplacer Zone par Perforant 2. Pour 2 Momentum : ajout Vicieux ou Étourdissant.',
        },
        {
            key: 'swiftness_of_sleipnir',
            label: 'Rapidité de Sleipnir',
            skill: 'survival',
            difficulty: 2,
            cost: '3⚄ Drain',
            duration: 'Instantané',
            effect: 'Sort de Bénédiction. Le lanceur et ses alliés à portée Proche peuvent immédiatement se déplacer de deux zones. Garder l\'Initiative coûte 0 Momentum avant le prochain tour du lanceur. Pour 2 Momentum : chaque personnage affecté peut prendre une action mineure bonus à son prochain tour.',
        },
        {
            key: 'curse_of_loki',
            label: 'Malédiction de Loki',
            skill: 'persuasion',
            difficulty: 2,
            cost: '5⚄ Drain (chaque effet génère 1 Menace)',
            duration: 'Instantané',
            effect: 'Sort d\'attaque. Inflige Puissance +2⚄ stress mental (Étourdissant) à tous les ennemis à portée Proche. Pour 2 Momentum : ajout Persistant 6 ou Enveloppant. Version imparfaite : affecte aussi les alliés à portée.',
        },
        {
            key: 'bounty_of_baldur',
            label: 'Générosité de Baldur',
            skill: 'resilience',
            difficulty: 2,
            cost: '3⚄ Drain',
            duration: 'Rounds égaux à la Puissance',
            effect: 'Sort de Protection. Toutes les attaques contre le lanceur ou ses alliés à portée Proche voient leur difficulté augmentée de +2. Pour 2 Momentum : les alliés affectés soignent une Blessure ou récupèrent à portée Moyenne.',
        },
        {
            key: 'blessing_of_eir',
            label: 'Bénédiction d\'Eir',
            skill: 'medicine',
            difficulty: 3,
            cost: '4⚄ Drain',
            duration: 'Instantané',
            effect: 'Sort de Protection. Retire immédiatement un stress égal à la Puissance pour tous les alliés à portée Proche. Les alliés à terre récupèrent immédiatement. Pour 2 Momentum : soigne une Blessure (physique ou mentale) ou étend l\'effet à portée Moyenne.',
        },
        {
            key: 'wisdom_of_frigg',
            label: 'Sagesse de Frigg',
            skill: 'observation',
            difficulty: 1,
            cost: '3⚄ Drain, Étourdissant',
            duration: 'Instantané',
            effect: 'Sort de Divination. Le lanceur choisit une créature à portée Moyenne et gagne 3 Momentum bonus utilisable uniquement pour Obtenir des Informations sur cette créature, ou pour créer une Vérité révélant sa faiblesse. Pour 2 Momentum : la créature perd sa règle Invulnérable pendant des rounds égaux à la Puissance.',
        },
    ],

    // ── Tradition Psychique / ESP ─────────────────────────────────────────────
    psychic: [
        {
            key: 'attenuation',
            label: 'Atténuation',
            skill: 'academia',
            difficulty: 2,
            cost: '5⚄ Drain, Perforant 1',
            duration: 'Rounds égaux à Puissance/2 (arrondi supérieur)',
            effect: 'Sort de Malédiction (opposé Vol + Résilience). Cible une créature à portée Moyenne — elle perd sa règle Invulnérable et peut être blessée par des armes normales. Pour 1 Momentum : toutes les attaques physiques contre la cible gagnent Perforant 1.',
        },
        {
            key: 'atavistic_rage',
            label: 'Rage Atavique',
            skill: 'fighting',
            difficulty: 2,
            cost: '4⚄ Drain',
            duration: 'Jusqu\'à la fin de la scène en cours',
            effect: 'Sort de Bénédiction. Le lanceur choisit une cible à portée Proche (y compris lui-même). La cible entre en rage monstrueuse : attaques de mêlée Puissance +1⚄ (Vicieux), +1⚄ stress physique non-psychique, +3 Armure. Ne peut plus utiliser d\'armes à distance. Version imparfaite : la cible ne distingue plus ami et ennemi.',
        },
        {
            key: 'combat_perception',
            label: 'Perception de Combat',
            skill: 'observation',
            difficulty: 2,
            cost: '3⚄ Drain, Perforant 1',
            duration: 'Rounds égaux à la Puissance',
            effect: 'Sort de Bénédiction. Le psychique peut prédire et contrer les mouvements ennemis. Attaques de mêlée contre le psychique ont difficulté +2, le psychique ajoute +2⚄ à tout stress infligé en mêlée. Pour 2 Momentum : les attaques à distance contre le psychique ont aussi difficulté +2.',
        },
        {
            key: 'enhanced_instincts',
            label: 'Instincts Renforcés',
            skill: 'observation',
            difficulty: 2,
            cost: '3⚄ Drain',
            duration: 'Rounds égaux à la Puissance',
            effect: 'Sort de Bénédiction. Le psychique ou un allié à portée Proche ignore les augmentations de difficulté dues à la portée des armes et gagne Perforant 1 sur toutes ses attaques. Pour 2 Momentum par allié supplémentaire : étend l\'effet.',
        },
        {
            key: 'inner_nirvana',
            label: 'Nirvana Intérieur',
            skill: 'resilience',
            difficulty: 2,
            cost: '3⚄ Drain',
            duration: 'Rounds égaux à la Puissance',
            effect: 'Sort de Protection. Le psychique et ses alliés à portée Proche (jusqu\'à Puissance cibles) reçoivent Couverture égale à Puissance/2 et récupèrent stress égal à leur Résilience au début de chaque tour. Pour 2 Momentum : Couverture égale à la Puissance entière.',
        },
        {
            key: 'primal_scream',
            label: 'Cri Primal',
            skill: 'persuasion',
            difficulty: 1,
            cost: '4⚄ Drain, Étourdissant',
            duration: 'Instantané',
            effect: 'Sort d\'attaque. Inflige Puissance +2⚄ stress mental (Étourdissant) à tous les ennemis à portée Proche. Pour 2 Momentum : ajout Perforant 1 ou Vicieux. Version imparfaite : affecte tous (alliés inclus) à portée.',
        },
        {
            key: 'remote_viewing',
            label: 'Vision à Distance',
            skill: 'observation',
            difficulty: 2,
            cost: '2⚄ Drain, Perforant 1',
            duration: 'Rounds égaux à la Puissance',
            effect: 'Sort de Divination. Le psychique observe un objet à portée Proche en détail, même ses parties cachées. Pour 1 Momentum : portée Moyenne. Pour 2 Momentum : portée Longue. Pour 3 Momentum : n\'importe quel objet connu sur Terre.',
        },
        {
            key: 'spontaneous_combustion',
            label: 'Combustion Spontanée',
            skill: 'resilience',
            difficulty: 1,
            cost: '4⚄ Drain, Persistant 3',
            duration: 'Instantané',
            effect: 'Sort d\'attaque ou d\'Invocation. Désigne un objet ou une créature à portée Proche — il s\'enflamme, infligeant Puissance +1⚄ stress physique (Persistant 4). Peut aussi simplement allumer un feu. Pour 2 Momentum : ajout Zone ou Perforant 2 ou étend à portée Moyenne.',
        },
    ],
};
// ── Helpers magie ─────────────────────────────────────────────────────────────

// Pratiques disponibles (choix libre à la création, indépendant du talent précis)
export const SPELLCASTER_PRACTICES = [
    { key: 'researcher',  label: 'Chercheur',       attribute: 'reason',  startingSpells: 2 },
    { key: 'traditional', label: 'Traditionaliste', attribute: 'insight', startingSpells: 3 },
    { key: 'dabbler',     label: 'Amateur',          attribute: 'will',    startingSpells: 1 }, // ou 2 imparfaits
];

const PRACTICE_BY_KEY = Object.fromEntries(SPELLCASTER_PRACTICES.map(p => [p.key, p]));

// Traditions accessibles selon la pratique (le Livre des Mythes/nazi est
// volontairement exclu : accès manuel GM uniquement, jamais proposé ici)
const TRADITIONS_BY_PRACTICE = {
    researcher:  ['celtic', 'runic', 'psychic'],
    traditional: ['celtic', 'runic'],
    dabbler:     ['celtic', 'runic', 'psychic'],
};

// Attribut de cast selon la pratique choisie
export function getCastAttribute(practice) {
    return PRACTICE_BY_KEY[practice]?.attribute ?? 'will';
}

// Nombre de sorts de départ selon la pratique
// (dabbler : 1 normal OU 2 imparfaits — la distinction "two_flawed" est gérée
//  côté wizard via un choix explicite, cette fonction renvoie la valeur de base)
export function getStartingSpellCount(practice) {
    return PRACTICE_BY_KEY[practice]?.startingSpells ?? 1;
}

// Traditions accessibles pour une pratique donnée
export function getAccessibleTraditions(practice) {
    return TRADITIONS_BY_PRACTICE[practice] ?? [];
}

// Power rating (nombre de sorts dans le manteau / dés de Puissance de base)
// Traditionnel et Chercheur : 2, Amateur : 1
export function getPowerRating(practice) {
    return practice === 'dabbler' ? 1 : 2;
}

// Dés de Challenge bonus depuis l'attribut lié (table p.142, même table que getBonusDamage)
export function getBonusPowerDice(attrValue) {
    if (attrValue <= 8)  return 0;
    if (attrValue === 9) return 1;
    if (attrValue <= 11) return 2;
    if (attrValue <= 13) return 3;
    if (attrValue <= 15) return 4;
    return 5;
}
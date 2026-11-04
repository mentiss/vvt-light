// src/client/src/systems/nimble/config/boons.js
// Source : Nimble GM's Guide 3.0 (PDF, p. 74 « Lodging Boons », p. 75 « Boons »).
// Faveurs d'hébergement (table 1d8), faveurs mineures et majeures, faveurs épiques (niveau 19).

export const LODGING_BOONS_INTRO = 'Dépenser davantage d’or pour un hébergement luxueux peut apporter de précieux avantages temporaires : récupération plus rapide, contacts utiles, ressources supplémentaires ou occasions uniques. Les avantages précis dépendent de la qualité de l’hébergement et de la somme dépensée. Vous pouvez lancer un dé sur la table, ou accorder une faveur mineure, majeure, voire ÉPIQUE, selon ce que les héros paient et l’endroit où ils se reposent :\n• Une faveur mineure : coûte en général environ 10 po.\n• Une faveur majeure : coûte en général environ 100 po.\n• Une faveur ÉPIQUE : coûte en général environ 1 000 po.\nCes faveurs sont temporaires et ne durent que jusqu’au prochain repos sûr des héros. Ajustez le coût et l’effet à votre campagne et à la richesse du groupe.';

// roll : résultat du 1d8 sur la table « Faveur temporaire ».
export const LODGING_BOONS = [
    { key: 'recover_wounds', roll: 1, name: 'Blessures soignées', vo: 'Recover 2 additional Wounds', text: 'Récupérez 2 Blessures supplémentaires.' },
    { key: 'temp_hp', roll: 2, name: 'PV temporaires', vo: 'Gain LVL temp HP', text: 'Gagnez NIV PV temporaires.' },
    { key: 'temp_hit_dice', roll: 3, name: 'Dés de vie temporaires', vo: 'Gain KEY temp Hit Dice', text: 'Gagnez CLÉ dés de vie temporaires.' },
    { key: 'speed', roll: 4, name: 'Pied alerte', vo: '+1 Speed', text: '+1 en Vitesse.' },
    { key: 'inspired', roll: 5, name: 'Inspiré', vo: 'Inspired (reroll any die, once)', text: 'Inspiré : relancez n’importe quel dé, une fois.' },
    { key: 'steadfast', roll: 6, name: 'Esprit serein', vo: 'Advantage vs Fear/Charm/Etc.', text: 'Avantage contre la peur, le charme, etc.' },
    { key: 'rumor', roll: 7, name: 'Rumeur', vo: 'Learn an important rumor', text: 'Apprenez une rumeur importante.' },
    { key: 'mana', roll: 8, name: 'Mana', vo: '+KEY mana', text: '+CLÉ mana.' },
];

export const BOONS_INTRO = 'Les faveurs peuvent être une excellente récompense de quête accordée par un puissant protecteur (par exemple une reine elfe, apprenant la bravoure d’un héros, pourrait lui accorder la faveur Brave ou Cœur de lion), un bonus temporaire (par exemple un tonique qui confère Vitesse épique pendant 1 heure), ou vous pouvez permettre aux joueurs de prendre une faveur mineure ou majeure au lieu d’une augmentation de caractéristique secondaire ou clé.';

// tier : 'minor' (à la place d'une augmentation de caractéristique secondaire) | 'major' (à la place d'une augmentation de caractéristique clé).
// effects : facultatif, seulement quand l'effet est un simple bonus chiffré.
export const BOONS = [
    // Faveurs mineures
    { key: 'alert', tier: 'minor', name: 'Alerte', vo: 'Alert', text: '+1 à l’Initiative.', effects: { initiative: 1 } },
    { key: 'bright', tier: 'minor', name: 'Brillant', vo: 'Bright', text: '+1 mana maximal.', effects: { maxMana: 1 } },
    { key: 'experienced', tier: 'minor', name: 'Expérimenté', vo: 'Experienced', text: '+4 PV.', effects: { maxHp: 4 } },
    { key: 'feisty', tier: 'minor', name: 'Fougueux', vo: 'Feisty', text: '+1 dé de vie maximal.', effects: { maxHitDice: 1 } },
    { key: 'fiery', tier: 'minor', name: 'Ardent', vo: 'Fiery', text: '+1 aux dégâts des critiques.' },
    { key: 'intrepid', tier: 'minor', name: 'Intrépide', vo: 'Intrepid', text: '+1 en Vitesse.', effects: { speed: 1 } },
    { key: 'simple', tier: 'minor', name: 'Simple', vo: 'Simple', text: '+1 contre les effets de charme.' },
    { key: 'skilled', tier: 'minor', name: 'Doué', vo: 'Skilled', text: '+1 point de compétence.', effects: { skillPoints: 1 } },
    { key: 'stand_tall', tier: 'minor', name: 'Grande taille', vo: 'Stand Tall', text: '+Taille (légèrement).' },
    // Faveurs majeures
    { key: 'aggressive', tier: 'major', name: 'Agressif', vo: 'Aggressive', text: 'Lors de votre premier round de combat, vous pouvez dépenser 1 action de votre tour suivant.' },
    { key: 'ancestry_trait', tier: 'major', name: 'Trait d’ascendance', vo: 'Ancestry Trait', text: 'Choisissez un autre trait d’ascendance (à condition que cela ait du sens).' },
    { key: 'battle_hardened', tier: 'major', name: 'Aguerri', vo: 'Battle Hardened', text: '+2 en Défense.', effects: { defense: 2 } },
    { key: 'brave', tier: 'major', name: 'Brave', vo: 'Brave', text: '+2 aux dégâts tant que c’est vous qui avez le plus d’ennemis adjacents.' },
    { key: 'expansive_mind', tier: 'major', name: 'Esprit vaste', vo: 'Expansive Mind', text: '+4 mana maximal.', effects: { maxMana: 4 } },
    { key: 'good_patient', tier: 'major', name: 'Bon patient', vo: 'Good Patient', text: 'Chaque fois que vous devriez recevoir des soins, vous récupérez CLÉ PV supplémentaires.' },
    { key: 'hardy', tier: 'major', name: 'Endurci', vo: 'Hardy', text: 'Chaque fois que vos PV maximaux augmentent, lancez avec avantage 2 à la place.' },
    { key: 'honorable_protector', tier: 'major', name: 'Protecteur honorable', vo: 'Honorable Protector', text: 'Gagnez NIV PV temporaires chaque fois que vous vous interposez. Subissez NIV dégâts psychiques chaque fois qu’un allié à 2 cases ou moins est attaqué et que vous ne vous interposez pas.' },
    { key: 'lionhearted', tier: 'major', name: 'Cœur de lion', vo: 'Lionhearted', text: '+2 en Défense tant que c’est vous qui avez le plus d’ennemis adjacents.' },
    { key: 'natural_talent', tier: 'major', name: 'Talent naturel', vo: 'Natural Talent', text: 'Apprenez n’importe quel tour de magie.' },
    { key: 'resilient', tier: 'major', name: 'Résilient', vo: 'Resilient', text: '(1 fois par repos sûr) Vous êtes immunisé contre les Blessures pendant ce tour.', uses: { count: '1', per: 'safeRest' } },
    { key: 'resolute', tier: 'major', name: 'Résolu', vo: 'Resolute', text: 'Quand vous êtes repoussé, vous l’êtes d’1 case de moins. Chaque fois que vous devriez être mis à terre, vous pouvez à la place être reculé d’1 case. 1 fois par tour.' },
    { key: 'smart_not_book_smart', tier: 'major', name: 'Malin, pas savant', vo: 'Smart, Not Book Smart', text: '–CLÉ mana maximal. Gagnez 1d4 mana chaque fois que vous lancez l’Initiative ; ce mana expire à la fin du combat s’il n’est pas utilisé.' },
    { key: 'sniper', tier: 'major', name: 'Tireur d’élite', vo: 'Sniper', text: 'Avantage aux attaques quand aucun ennemi ne vous est adjacent ; désavantage sinon.' },
    { key: 'stalwart', tier: 'major', name: 'Inébranlable', vo: 'Stalwart', text: '+1 dé de vie maximal, +2 en Puissance.', effects: { maxHitDice: 1, skills: { might: 2 } } },
    { key: 'tough', tier: 'major', name: 'Coriace', vo: 'Tough', text: 'Chaque fois que vous gagnez des PV temporaires, gagnez-en 5 de plus.' },
    { key: 'unflinching', tier: 'major', name: 'Imperturbable', vo: 'Unflinching', text: 'Votre concentration ne se brise pas, même face au danger. Avantage aux jets de sauvegarde de concentration.' },
    { key: 'unnatural_talent', tier: 'major', name: 'Talent surnaturel', vo: 'Unnatural Talent', text: 'Apprenez n’importe quel sort utilitaire.', effects: { utilitySpell: 1 } },
    { key: 'unwavering', tier: 'major', name: 'Indéfectible', vo: 'Unwavering', text: '+2 dés de vie maximaux.', effects: { maxHitDice: 2 } },
    { key: 'veteran', tier: 'major', name: 'Vétéran', vo: 'Veteran', text: '+10 PV.', effects: { maxHp: 10 } },
];

// Faveurs épiques : choisies au niveau 19 (capacité « Faveur épique » de chaque classe).
export const EPIC_BOONS = [
    { key: 'epic_agility', name: 'Agilité épique', vo: 'Epic Agility', text: '(1 fois par rencontre) Gagnez 1 action.', uses: { count: '1', per: 'encounter' } },
    { key: 'epic_criticals', name: 'Critiques épiques', vo: 'Epic Criticals', text: 'Chaque fois que vous lancez les dégâts d’un critique, vous pouvez remplacer l’un des dés par un d20.' },
    { key: 'epic_defense', name: 'Défense épique', vo: 'Epic Defense', text: 'Vos boucliers gagnent +3 en Défense.' },
    { key: 'epic_foresight', name: 'Prescience épique', vo: 'Epic Foresight', text: 'Gagnez +5 à vos jets d’Initiative et l’avantage sur votre première attaque de chaque rencontre.', effects: { initiative: 5 } },
    { key: 'epic_knowledge', name: 'Savoir épique', vo: 'Epic Knowledge', text: '(1 fois par repos sûr) Vous pouvez faire appel à un instant de profonde clairvoyance pour obtenir des connaissances cachées sur un être ou un objet légendaire.', uses: { count: '1', per: 'safeRest' } },
    { key: 'epic_mana', name: 'Mana épique', vo: 'Epic Mana', text: 'Chaque fois que vous êtes soigné, vous pouvez à la place récupérer 1 mana par tranche de 5 PV de soins.' },
    { key: 'epic_mind', name: 'Esprit épique', vo: 'Epic Mind', text: '+8 mana maximal.', effects: { maxMana: 8 } },
    { key: 'epic_resistance', name: 'Résistance épique', vo: 'Epic Resistance', text: '(1 fois par rencontre) Chaque fois que vous devriez subir des dégâts ou rater un jet de sauvegarde, ce n’est pas le cas.', uses: { count: '1', per: 'encounter' } },
    { key: 'epic_senses', name: 'Sens épiques', vo: 'Epic Senses', text: 'Gagnez vision aveugle 6.' },
    { key: 'epic_speed', name: 'Vitesse épique', vo: 'Epic Speed', text: '+4 en Vitesse, +4 à l’Initiative.', effects: { speed: 4, initiative: 4 } },
    { key: 'epic_stamina', name: 'Endurance épique', vo: 'Epic Stamina', text: 'Obtenir 4 ou plus sur un dé de vie pendant un repos de terrain soigne 1 Blessure.' },
    { key: 'epic_stats', name: 'Caractéristiques épiques', vo: 'Epic Stats', text: 'Augmentez de 1 trois caractéristiques différentes.', effects: { stats: 3 } },
];

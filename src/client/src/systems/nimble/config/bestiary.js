// src/client/src/systems/nimble/config/bestiary.js
// Source : Nimble GM's Guide 3.0 (NimbleGMG3.0.pdf), p.8-19 (aventures d'initiation), p.28-37 (bestiaire),
// p.38-57 (monstres légendaires).
// Bestiaire de Nimble : familles, monstres (sbires, monstres ordinaires, légendaires) et tailles.
// Légendaires : `hp` = PV par héros (`hpPerHero: true`), PV du Baroud d'honneur dans la section correspondante.

export const MONSTER_SIZES = {
    tiny: 'Très petite',
    small: 'Petite',
    medium: 'Moyenne',
    large: 'Grande',
    huge: 'Énorme',
    gargantuan: 'Gigantesque',
};

export const FAMILIES = [
    {
        key: 'kobolds', name: 'Kobolds', vo: 'Kobolds',
        text: 'Petits dragonnets maniaques. Farouchement protecteurs envers les leurs.\n'
            + '**Rencontres types (par héros).** Pour une rencontre plus facile, utilisez la ligne 1 ou 2 niveaux plus bas ; plus difficile, 1 ou 2 niveaux plus haut.\n'
            + '• Niveau 1 : 2-3 Kobolds.\n• Niveau 2 : 2 Kobolds +1 Sournois +1 Sbire.\n• Niveau 3 : 2 Sournois +2 Sbires.\n• Niveau 4 : 2 Kobolds +1 Gardien de l\'antre +1 Sbire.*\n'
            + '*Attention ! Même des monstres très faibles peuvent être bien plus mortels que prévu quand ils sont plus de 3 contre 1 face aux héros. L\'idéal : entre 1 et 3 monstres par héros.\n'
            + '**Butin kobold.** Miel, BEAUCOUP de ficelle, sandwichs (volés), objets brillants, peinture de dragon (mal, mais amoureusement, réalisée), viandes pourries, toutes sortes de pièges (petites cages, pointes, mâchoires).',
    },
    {
        key: 'goblins', name: 'Gobelins', vo: 'Goblins',
        text: 'Verts, rusés et à leur aise au bord du chaos. Ils se moqueront de vous sans pitié si on leur en laisse l\'occasion.\n'
            + '**Rencontres types (par héros).** Pour une rencontre plus facile, utilisez la ligne 1 ou 2 niveaux plus bas ; plus difficile, 1 ou 2 niveaux plus haut.\n'
            + '• Niveau 1 : 2 Gobelins OU 3 Sbires.\n• Niveau 2 : 3 Gobelins OU 1 Gobelours.\n• Niveau 3 : 2 Gobelins +1 Gobelours/Contremaître.\n• Niveau 4 : 2 Gobelins +1 Contremaître.\n• Niveau 5 : 1 Gobelin +1 Chevaucheur de rat +1 Gobelours.\n• Niveau 6 : 1 Gobelours +1 Chevaucheur de rat +1 Contremaître.\n'
            + '**Butin gobelin.** Souris vivante (un en-cas pour plus tard), pain moisi, pierres lisses, bâtons pointus, dents (arrachées de force), flèches (étonnamment bien faites), plein de lames (dentelées, mais efficaces), captif mort (on a oublié de le nourrir), camelote brillante (bouts de métal brillants, verre brisé et boutons), élevage de limaces (un bocal de limaces visqueuses qui se tortillent), « potion » (liquide de couleur suspecte dans une bouteille sale), viande séchée non identifiable, un carnet crasseux qui recense des échanges et des paris étranges, bottes (trop grandes).',
    },
    {
        key: 'bandits', name: 'Bandits', vo: 'Bandits',
        text: 'Vous avez de l\'argent, ils veulent de l\'argent… l\'entente parfaite ! (aboulez)\n'
            + '**Butin bandit.** Objet de GRANDE valeur (volé ; son propriétaire pourrait venir le chercher, ou vous récompenser pour sa restitution), personne enlevée, armure de cuir, lames ébréchées, vieille nourriture, objets d\'art ou beaux vêtements, chariot chargé d\'une marchandise (sel, clous, laine, etc.), lettre codée d\'un client secret.',
    },
    {
        key: 'snakemen', name: 'Hommes-serpents', vo: 'Snakemen',
        text: '*Sifflements agressifs*',
    },
    {
        key: 'dungeon_denizens', name: 'Habitants des donjons', vo: 'Dungeon Denizens',
        text: 'Pour certaines créatures, c\'est VOUS le butin au bout du donjon.\n'
            + '**Butin des donjons.** Pièces ternies (en partie dissoutes par l\'acide), ossements anciens portant des traces de morsures, objets indigestes (os, gemmes, babioles magiques), un journal relié de cuir (pages abîmées par l\'eau), crochets de serrure, une carte au trésor (la moitié seulement), bottes (étrangement épargnées par la corrosion).',
    },
    {
        key: 'hill_and_field', name: 'Collines et champs', vo: 'Hill & Field',
        text: 'Brutes puissantes et bêtes rusées, toujours à l\'affût d\'une proie facile.',
    },
    {
        key: 'undead', name: 'Morts-vivants', vo: 'Undead',
        text: 'Ils haïssent les vivants de ne pas être morts, et se haïssent eux-mêmes d\'être morts.\n'
            + '**Butin des morts-vivants.** Médaillon d\'argent terni contenant un portrait délavé (de qui ?), fragments d\'os gravés de symboles arcaniques, une gemme sombre (dégage un léger froid), fioles de sang (séché depuis longtemps), un journal écrit d\'une main ancienne, un collier macabre (phalanges de squelette), un symbole sacré brisé maculé de cendre, une chevalière d\'une maison noble disparue, terre de tombe moisie (murmure quand on la touche), pelle.',
    },
    {
        key: 'forest_denizens', name: 'Habitants de la forêt', vo: 'Forest Denizens',
        text: 'Chaque ombre cache un prédateur, chaque branche et chaque feuille conspirent contre vous : la forêt est vivante, et vous n\'y êtes pas les bienvenus.\n'
            + '**Ronces-fléaux.** Êtres végétaux épineux et sans âme, fertilisés par le sang.\n'
            + '**Butin des ronces-fléaux.** 7,5 m de lianes (utilisables comme corde), sève luisante (légères propriétés curatives), pièces couvertes de mousse d\'une époque ancienne, une feuille fragile dont les nervures forment des mots en druidique, une bourse d\'herbes séchées, une grappe de champignons rares, une poignée de glands (ils poussent INSTANTANÉMENT quand on les met dans l\'eau), une petite fleur qui ne fane jamais, une flûte envahie de mousse, une carte en lambeaux menant à un bosquet caché, une couronne de fleurs séchées.\n'
            + '**Gardiens de la forêt.** Rôdeur crépusculaire, Basilic, Druide.',
    },
    {
        key: 'cultists_horrors', name: 'Cultistes et horreurs', vo: 'Cultists/Horrors',
        text: 'Animés de croyances perverties, des cultistes fanatiques accomplissent de sombres rituels pour éveiller des maux anciens, libérant des horreurs qui se repaissent de peur et de désespoir.\n'
            + '**Butin horrible.** Dague tachée de sang (gravée de symboles sombres), une idole tordue (murmure des pensées terribles), fiole d\'ichor noir, un masque (sculpté à l\'image d\'un démon), une robe en lambeaux (doublée de poches cachées), un parchemin de rituels d\'invocation (à moitié achevé), des fers gravés de runes infernales, fragment d\'un contrat démoniaque, bougies noires (impossibles à éteindre).',
    },
    {
        key: 'underground', name: 'Souterrains', vo: 'Underground',
        text: 'Habitants cauchemardesques des profondeurs, ces êtres monstrueux rôdent dans les tunnels obscurs et les cavernes, prêts à piéger ou à dévorer tout intrus.\n'
            + '**Butin des souterrains.** Plaques de chitine, carte des tunnels (griffonnée à la hâte), dents dentelées (autant que vous pouvez en porter), soie d\'araignée, poche à venin, viandes partiellement digérées, gemmes (brutes), glande à phéromones, champignon luminescent, carapace de mue, outils rouillés, pièces anciennes, pierres d\'écho (bourdonnent doucement quand on les tapote).',
    },
    {
        key: 'legendary', name: 'Monstres légendaires', vo: 'Legendary Monsters',
        text: 'Les monstres légendaires agissent après le tour de CHAQUE héros (pas après celui des sbires, gens du commun ou autres suivants). Leurs PV dépendent du nombre de héros ; une rencontre légendaire est de même niveau que le niveau d\'un seul héros, quelle que soit la taille du groupe.\n'
            + '**Sauvegardes.** Comme les héros, ils ont des sauvegardes avantagées ou désavantagées : [sv] FOR++, VOL– signifie que le monstre lance ses sauvegardes de FOR avec avantage 2 (deux dés supplémentaires) et ses sauvegardes de VOL avec désavantage.\n'
            + '**En sang.** Ils gagnent une capacité dangereuse supplémentaire quand leurs PV tombent à la moitié.\n'
            + '**Baroud d\'honneur.** Réduits à 0 PV, ils sont mourants et gagnent de nouvelles capacités dangereuses. Ils meurent enfin après avoir subi une petite quantité de dégâts supplémentaires.\n'
            + '**Actions facultatives.** Chacun peut aussi, à la place de ses attaques, utiliser des actions par défaut pour effrayer ou déplacer les joueurs :\n'
            + '• Prendre son élan / Inspirer. Récupère l\'usage d\'une capacité à usage unique.\n'
            + '• Rugissement terrible / Monologue sinistre / Provocation. Les créatures (ou une créature) qui l\'entendent font un jet de sauvegarde de VOL ou sont effrayées pendant 1 tour.\n'
            + '• Bousculer / Poussée télékinétique. Sauvegarde de FOR ou déplacé, à terre, etc.\n'
            + '• Jauger / Repérer une faiblesse / Clouer sur place. Sauvegarde de DEX ou la prochaine attaque du monstre se fait avec avantage et ne permet pas de s\'interposer.',
    },
    {
        key: 'adventures', name: 'Aventures', vo: 'Adventures',
        text: 'Monstres propres aux aventures d\'initiation *Le Jardin de la mort* (chapitres 1 à 3). Les autres monstres de ces aventures (sbires gobelins, gobelins, chevaucheur de rat, araignée géante, pousse et brise-racines ronces-fléaux) figurent dans leur famille du bestiaire.\n'
            + '**Note légendaire.** Si un monstre légendaire pose un défi trop difficile, il peut toujours passer un tour à monologuer, rire comme un dément, provoquer ou bousculer les héros sans leur faire de mal. Vous pouvez aussi sauter un déclencheur En sang ou Baroud d\'honneur. L\'important est de s\'AMUSER, pas de tuer tous les héros par accident pendant que vous apprenez tous à jouer.',
    },
];

// Rappels de règles reproduits sur chaque monstre concerné (définitions du livre).
const UNLIVING = { name: 'Non-vivant, immortel', text: '(1 utilisation) À sa mort, revient à 1 PV.' };
const MORTAL_PANIC = { name: 'Panique mortelle', text: 'Les attaques contre vous ratent sur 2 ou moins.' };
const INEPT = { name: 'Incompétent', text: 'Vos attaques ratent sur un 8.' };
const NOOOOO = { name: 'Nooooon !', text: 'Quand un allié à Allonge 2 ou moins meurt, attaquez gratuitement.' };
const MIMIC_AMBUSHER = { name: 'Embusqué', text: 'Les mimiques engagent toujours le combat en premier et les ennemis lancent l\'Initiative avec désavantage.' };
const MIMIC_STICKY = { name: 'Collant', text: 'Les coups d\'une mimique agrippent aussi, et elle peut agripper un nombre illimité de créatures. Quand elle subit un critique : elle relâche 1 créature (au choix de l\'attaquant).' };
const PEELING_BARK = { name: 'Écorce qui pèle', text: 'Être touché dégrade l\'armure (lourde » moyenne » aucune).' };
const CORRUPT = { name: 'Corrompu', text: 'Vulnérable au radiant : votre prochaine attaque gagne l\'avantage.' };
const DESPAIR = { name: 'Désespoir', text: 'Désavantage à tous les jets (infliger ou soigner des dégâts y met fin).' };
const BLOODTHIRSTY = { name: 'Assoiffé de sang', text: 'Avantage contre les créatures blessées.' };
const COILING_STRIKE = { name: 'Frappe enroulée', text: 'Sur un critique en mêlée, agrippe (évasion DD 10).' };
const EVASIVE_FLIER = { name: 'Vol évasif', text: 'Les attaques contre vous sont désavantagées.' };
const KELEBEK_POPPY = [
    { title: 'Duo légendaire', text: 'Après le tour de chaque héros, choisissez Kelebek OU Poppy pour agir (alterner recommandé).' },
    { title: 'En sang', text: 'Quand Kelebek est en sang, Poppy s\'interpose toujours pour lui. Les deux lancent 3d6 à la place.' },
    { title: 'Baroud d\'honneur : Gaz nocif', text: 'Quand Poppy meurt, tous les héros ont au maximum 2 actions par tour.' },
];

export const MONSTERS = [
    // ─── Kobolds (p.29) ──────────────────────────────────────────────────────────
    {
        key: 'kobold_minion', name: 'Sbire kobold', vo: 'Kobold Minion',
        family: 'Kobolds', level: 'sbire', size: 'small', minion: true, legendary: false,
        hp: null, armor: null, speed: null, saves: null,
        abilities: [],
        attacks: [{ name: 'Coup de lame', dice: '1d4', bonus: 0, noCrit: true, text: 'Suit les règles des sbires.' }],
    },
    {
        key: 'kobold', name: 'Kobold', vo: 'Kobold',
        family: 'Kobolds', level: '1/3', size: 'small', minion: false, legendary: false,
        hp: 10, armor: null, speed: null, saves: null,
        abilities: [NOOOOO],
        attacks: [{ name: 'Coup de lame', dice: '1d4', bonus: 0, noCrit: true, text: '(ou Fronde, Portée 8). Pas de critique.' }],
    },
    {
        key: 'kobold_sneak', name: 'Kobold sournois', vo: 'Kobold Sneak',
        family: 'Kobolds', level: '1', size: 'small', minion: false, legendary: false,
        hp: 20, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Sournois !', text: 'Vous pouvez vous déplacer avant d\'utiliser votre capacité Nooooon !.' },
            NOOOOO,
        ],
        attacks: [{ name: 'Coup de lame', dice: '2d4', bonus: 0, noCrit: false, text: '(ou Fronde, Portée 8).' }],
    },
    {
        key: 'kobold_clanger', name: 'Kobold carillonneur', vo: 'Kobold Clanger',
        family: 'Kobolds', level: '2', size: 'small', minion: false, legendary: false,
        hp: 16, armor: 'medium', speed: null, saves: null,
        abilities: [
            { name: 'CLANG !', text: 'Les alliés qui entendent votre vacarme lancent 1 dé supplémentaire chaque fois qu\'ils attaquent.' },
            { name: 'Vacarmeur occupé', text: 'N\'attaque pas (Clang, clang !).' },
        ],
        attacks: [],
    },
    {
        key: 'kobold_trapper', name: 'Kobold trappeur', vo: 'Kobold Trapper',
        family: 'Kobolds', level: '2', size: 'small', minion: false, legendary: false,
        hp: 30, armor: null, speed: null, saves: null,
        abilities: [
            NOOOOO,
            { name: 'Piège !', text: 'Quand un ennemi se déplace adjacent à vous ou à un allié, il déclenche l\'un de vos pièges ! (1/rencontre chacun).\n• Piège : ABEIIILLES ! Inflige 4d4 dégâts (ne rate pas). Moitié autant à TOUTES les créatures adjacentes.\n• Piège : FILET CACHÉ ! Immobilisé (évasion DD 10).' },
        ],
        attacks: [
            { name: 'Lancer de scorpion', dice: '2d4', bonus: 2, noCrit: false, text: '(Portée 8).' },
            { name: 'Piège : ABEIIILLES !', dice: '4d4', bonus: 0, noCrit: false, text: '(1/rencontre, voir Piège !) Ne rate pas. Moitié autant à TOUTES les créatures adjacentes.' },
        ],
    },
    {
        key: 'kobold_denwarden', name: 'Kobold gardien de l\'antre', vo: 'Kobold Denwarden',
        family: 'Kobolds', level: '3', size: 'small', minion: false, legendary: false,
        hp: 30, armor: 'medium', speed: null, saves: null,
        abilities: [
            NOOOOO,
            { name: 'Tenez booon !', text: 'Les alliés adjacents gagnent une armure moyenne.' },
        ],
        attacks: [{ name: 'Coup de lame (2×)', dice: '2d4', bonus: 2, noCrit: false, text: '(ou Fronde, Portée 8).' }],
    },

    // ─── Gobelins (p.30) ─────────────────────────────────────────────────────────
    {
        key: 'goblin_minion', name: 'Sbire gobelin', vo: 'Goblin Minion',
        family: 'Gobelins', level: 'sbire', size: 'small', minion: true, legendary: false,
        hp: null, armor: null, speed: null, saves: null,
        abilities: [{ name: 'Ha ha, raté !', text: 'Chaque fois que vous survivez à une attaque, infligez en retour 2 dégâts psychiques (ignorant la Défense).' }],
        attacks: [{ name: 'Coup de lame', dice: '1d6', bonus: 0, noCrit: true, text: 'Suit les règles des sbires.' }],
    },
    {
        key: 'goblin', name: 'Gobelin', vo: 'Goblin',
        family: 'Gobelins', level: '1/2', size: 'small', minion: false, legendary: false,
        hp: 15, armor: null, speed: null, saves: null,
        abilities: [{ name: 'Ha ha, même pas mal !', text: 'Chaque fois que vous survivez à une attaque, infligez en retour 2 dégâts psychiques (ignorant la Défense).' }],
        attacks: [{ name: 'Coup de lame', dice: '1d6', bonus: 0, noCrit: true, text: '(ou Tir, Portée 8). Pas de critique.' }],
    },
    {
        key: 'goblin_ratrider', name: 'Gobelin chevaucheur de rat', vo: 'Goblin Ratrider',
        family: 'Gobelins', level: '2', size: 'medium', minion: false, legendary: false,
        hp: 30, armor: null, speed: '10', saves: null,
        abilities: [
            { name: 'Ha ha, bien essayé !', text: 'Chaque fois que vous survivez à une attaque, infligez en retour 2 dégâts psychiques (ignorant la Défense).' },
            { name: 'CHAAARGEZ !', text: 'Si vous vous déplacez d\'au moins 4 cases en ligne droite, votre prochaine attaque est avantagée.' },
        ],
        attacks: [{ name: 'Morsure et coup de lame (2×)', dice: '1d6', bonus: 0, noCrit: false, text: 'Sur un critique, à terre.' }],
    },
    {
        key: 'bugbear', name: 'Gobelours', vo: 'Bugbear',
        family: 'Gobelins', level: '2', size: 'medium', minion: false, legendary: false,
        hp: 30, armor: null, speed: null, saves: null,
        abilities: [],
        attacks: [
            { name: 'Cogner', dice: '3d6', bonus: 0, noCrit: false, text: '(Allonge 2) Si dégâts, la prochaine attaque de la cible est désavantagée. Ou :' },
            { name: 'Javeline', dice: '2d6', bonus: 0, noCrit: false, text: '(Portée 8).' },
        ],
    },
    {
        key: 'goblin_taskmaster', name: 'Gobelin contremaître', vo: 'Goblin Taskmaster',
        family: 'Gobelins', level: '2', size: 'small', minion: false, legendary: false,
        hp: 30, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Faudra faire mieux que ça !', text: 'Chaque fois que vous survivez à une attaque, infligez en retour 2 dégâts psychiques (ignorant la Défense).' },
            { name: 'Bouclier de chair', text: 'Peut forcer d\'autres gobelins à s\'interposer pour vous.' },
            { name: 'Ramenez-vous !', text: 'Après Coup de lame : appelle un sbire gobelin au combat.' },
        ],
        attacks: [{ name: 'Coup de lame', dice: '1d6', bonus: 0, noCrit: false, text: '(ou Tir, Portée 8). Puis : Ramenez-vous !' }],
    },

    // ─── Bandits (p.31) ──────────────────────────────────────────────────────────
    {
        key: 'bandit_minion', name: 'Sbire bandit', vo: 'Bandit Minion',
        family: 'Bandits', level: 'sbire', size: 'small', minion: true, legendary: false,
        hp: null, armor: null, speed: null, saves: null,
        abilities: [INEPT, MORTAL_PANIC],
        attacks: [{ name: 'J\'vais t\'découper !', dice: '1d8', bonus: 0, noCrit: true, text: 'Suit les règles des sbires.' }],
    },
    {
        key: 'bandit', name: 'Bandit', vo: 'Bandit',
        family: 'Bandits', level: '1/3', size: 'medium', minion: false, legendary: false,
        hp: 10, armor: null, speed: null, saves: null,
        abilities: [INEPT, MORTAL_PANIC],
        attacks: [{ name: 'Aboule !', dice: '1d8', bonus: 0, noCrit: false, text: '(ou Tir, Portée 8).' }],
    },
    {
        key: 'bandit_hunter', name: 'Bandit chasseur', vo: 'Bandit Hunter',
        family: 'Bandits', level: '1', size: 'medium', minion: false, legendary: false,
        hp: 17, armor: null, speed: null, saves: null,
        abilities: [MORTAL_PANIC],
        attacks: [{ name: 'Arc de guerre', dice: '2d8', bonus: 0, noCrit: false, text: '(Portée 12).' }],
    },
    {
        key: 'bandit_bruiser', name: 'Bandit cogneur', vo: 'Bandit Bruiser',
        family: 'Bandits', level: '2', size: 'medium', minion: false, legendary: false,
        hp: 27, armor: null, speed: null, saves: null,
        abilities: [MORTAL_PANIC],
        attacks: [{ name: 'Et RESTE à terre !', dice: '2d8', bonus: 0, noCrit: false, text: 'Si dégâts, à terre.' }],
    },
    {
        key: 'bandit_assassin', name: 'Bandit assassin', vo: 'Bandit Assassin',
        family: 'Bandits', level: '2', size: 'medium', minion: false, legendary: false,
        hp: 20, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Furtif', text: 'Vous êtes invisible jusqu\'à ce que vous attaquiez.' },
            MORTAL_PANIC,
        ],
        attacks: [{ name: 'Lame empoisonnée (2×)', dice: '1d8', bonus: 0, noCrit: false, text: 'Si dégâts, étourdi.' }],
    },
    {
        key: 'bandit_mage', name: 'Bandit mage', vo: 'Bandit Mage',
        family: 'Bandits', level: '4', size: 'medium', minion: false, legendary: false,
        hp: 40, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Pas d\'étincelle', text: 'Quand vous subissez des dégâts, téléportez-vous de 4.' },
            MORTAL_PANIC,
        ],
        attacks: [{ name: 'Arc électrique', dice: '3d8', bonus: 0, noCrit: false, text: '(Portée 12) Touche aussi la créature la plus proche suivante (amie ou ennemie : « Pousse-toi ! »).' }],
    },
    {
        key: 'bandit_captain', name: 'Capitaine bandit', vo: 'Bandit Captain',
        family: 'Bandits', level: '4', size: 'medium', minion: false, legendary: false,
        hp: 35, armor: 'medium', speed: null, saves: null,
        abilities: [
            { name: 'Entraînement strict', text: 'Vos alliés ne sont PAS Incompétents.' },
            MORTAL_PANIC,
        ],
        attacks: [{ name: 'Taillade (3×)', dice: '1d8', bonus: 0, noCrit: false, text: '(ou Tir, Portée 8).' }],
    },

    // ─── Hommes-serpents (p.31) ──────────────────────────────────────────────────
    {
        key: 'snakeman_minion', name: 'Sbire homme-serpent', vo: 'Snakeman Minion',
        family: 'Hommes-serpents', level: 'sbire', size: 'medium', minion: true, legendary: false,
        hp: null, armor: null, speed: null, saves: null,
        abilities: [],
        attacks: [{ name: 'Frappe', dice: '1d6', bonus: 0, noCrit: true, text: '(ou Crachat, Portée 8). Suit les règles des sbires.' }],
    },
    {
        key: 'snakeman', name: 'Homme-serpent', vo: 'Snakeman',
        family: 'Hommes-serpents', level: '1', size: 'medium', minion: false, legendary: false,
        hp: 21, armor: null, speed: null, saves: null,
        abilities: [COILING_STRIKE],
        attacks: [{ name: 'Entaille', dice: '2d6', bonus: 0, noCrit: false, text: '(ou Crachat, Portée 8).' }],
    },
    {
        key: 'cobra_captain', name: 'Capitaine cobra', vo: 'Cobra Captain',
        family: 'Hommes-serpents', level: '4', size: 'medium', minion: false, legendary: false,
        hp: 52, armor: null, speed: null, saves: null,
        abilities: [{ name: 'Ordre d\'enroulement', text: '(1/round) Un allié agrippe un ennemi qui lui est adjacent (évasion DD 10).' }],
        attacks: [{ name: 'Entaille (2×)', dice: '2d6', bonus: 0, noCrit: false, text: '(ou Crachat, Portée 8).' }],
    },
    {
        key: 'giant_cobra', name: 'Cobra géant', vo: 'Giant Cobra',
        family: 'Hommes-serpents', level: '8', size: 'large', minion: false, legendary: false,
        hp: 84, armor: 'medium', speed: null, saves: null,
        abilities: [COILING_STRIKE],
        attacks: [{ name: 'Broyage', dice: '2d6', bonus: 20, noCrit: false, text: 'Avantage contre les créatures plus petites.' }],
    },

    // ─── Habitants des donjons (p.32) ────────────────────────────────────────────
    {
        key: 'stirge', name: 'Stirge', vo: 'Stirge',
        family: 'Habitants des donjons', level: '1/2', size: 'tiny', minion: false, legendary: false,
        hp: 10, armor: null, speed: 'vol 8', saves: null,
        abilities: [EVASIVE_FLIER],
        attacks: [{ name: 'S\'accrocher', dice: '1d4', bonus: 2, noCrit: true, text: 'Pas de critique. En cas de coup au but, Accroché : vous chevauchez la cible ; vos attaques ne peuvent pas rater, et on ne peut ni se défendre ni s\'interposer contre elles.' }],
    },
    {
        key: 'greater_stirge', name: 'Stirge supérieure', vo: 'Greater Stirge',
        family: 'Habitants des donjons', level: '6', size: 'small', minion: false, legendary: false,
        hp: 64, armor: null, speed: 'vol 10', saves: null,
        abilities: [EVASIVE_FLIER],
        attacks: [{ name: 'S\'accrocher', dice: '1d12', bonus: 10, noCrit: false, text: 'En cas de coup au but, Accroché : vous chevauchez la cible ; vos attaques ne peuvent pas rater, et on ne peut ni se défendre ni s\'interposer contre elles.' }],
    },
    {
        key: 'tiny_mimic', name: 'Mimique minuscule', vo: 'Tiny Mimic',
        family: 'Habitants des donjons', level: '1', size: 'tiny', minion: false, legendary: false,
        hp: 22, armor: null, speed: null, saves: null,
        abilities: [MIMIC_AMBUSHER, MIMIC_STICKY],
        attacks: [
            { name: 'Pseudopode', dice: '2d4', bonus: 0, noCrit: false, text: '(évasion DD 9). Ou :' },
            { name: 'Morsure', dice: '2d4', bonus: 5, noCrit: false, text: '(une créature agrippée).' },
        ],
        notes: 'Formes : tasse, chaussure, pomme, potion.',
    },
    {
        key: 'small_mimic', name: 'Petite mimique', vo: 'Small Mimic',
        family: 'Habitants des donjons', level: '2', size: 'small', minion: false, legendary: false,
        hp: 30, armor: null, speed: null, saves: null,
        abilities: [MIMIC_AMBUSHER, MIMIC_STICKY],
        attacks: [
            { name: 'Pseudopode', dice: '2d6', bonus: 0, noCrit: false, text: '(évasion DD 11). Ou :' },
            { name: 'Morsure', dice: '2d6', bonus: 10, noCrit: false, text: '(une créature agrippée).' },
        ],
        notes: 'Formes : sac, bouclier, arme, chaise.',
    },
    {
        key: 'medium_mimic', name: 'Mimique moyenne', vo: 'Medium Mimic',
        family: 'Habitants des donjons', level: '6', size: 'medium', minion: false, legendary: false,
        hp: 64, armor: null, speed: null, saves: null,
        abilities: [MIMIC_AMBUSHER, MIMIC_STICKY],
        attacks: [
            { name: 'Pseudopode', dice: '2d8', bonus: 8, noCrit: false, text: '(évasion DD 13). Ou :' },
            { name: 'Morsure', dice: '2d8', bonus: 20, noCrit: false, text: '(une créature agrippée).' },
        ],
        notes: 'Formes : table, coffre au trésor, tonneau, porte.',
    },
    {
        key: 'gray_ooze', name: 'Vase grise', vo: 'Gray Ooze',
        family: 'Habitants des donjons', level: '1', size: 'medium', minion: false, legendary: false,
        hp: 18, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Gluant 2', text: '(1/round) Quand vous subissez un critique ou des dégâts tranchants : invoquez 2 sbires vase.' },
            { name: 'Digéré', text: 'Infligez 2 dégâts supplémentaires pour chaque fois où la cible a déjà été Digérée pendant cette rencontre.' },
        ],
        attacks: [{ name: 'Contact acide', dice: '1d6', bonus: 0, noCrit: false, text: 'Digéré.' }],
    },
    {
        key: 'ochre_jelly', name: 'Gelée ocre', vo: 'Ochre Jelly',
        family: 'Habitants des donjons', level: '4', size: 'large', minion: false, legendary: false,
        hp: 46, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Gluant 3', text: '(1/round) Quand vous subissez un critique ou des dégâts tranchants : invoquez 3 sbires vase.' },
            { name: 'Digéré', text: 'Infligez 3 dégâts supplémentaires pour chaque fois où la cible a déjà été Digérée pendant cette rencontre.' },
        ],
        attacks: [{ name: 'Contact acide', dice: '1d6', bonus: 6, noCrit: false, text: 'Digéré.' }],
    },
    {
        key: 'black_pudding', name: 'Pouding noir', vo: 'Black Pudding',
        family: 'Habitants des donjons', level: '8', size: 'large', minion: false, legendary: false,
        hp: 94, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Gluant 5', text: '(1/round) Quand vous subissez un critique ou des dégâts tranchants : invoquez 5 sbires vase.' },
            { name: 'Digéré', text: 'Infligez 5 dégâts supplémentaires pour chaque fois où la cible a déjà été Digérée pendant cette rencontre.' },
        ],
        attacks: [{ name: 'Contact acide (2×)', dice: '1d6', bonus: 6, noCrit: false, text: '(Allonge 2) Digéré.' }],
    },
    {
        key: 'elder_ooze', name: 'Vase ancestrale', vo: 'Elder Ooze',
        family: 'Habitants des donjons', level: '12', size: 'huge', minion: false, legendary: false,
        hp: 148, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Gluant 6', text: '(1/round) Quand vous subissez un critique ou des dégâts tranchants : invoquez 6 sbires vase.' },
            { name: 'Digéré', text: 'Infligez 6 dégâts supplémentaires pour chaque fois où la cible a déjà été Digérée pendant cette rencontre.' },
        ],
        attacks: [{ name: 'Contact acide (3×)', dice: '1d6', bonus: 6, noCrit: false, text: '(Allonge 3) Digéré.' }],
    },
    {
        key: 'ooze_minion', name: 'Sbire vase', vo: 'Ooze Minion',
        family: 'Habitants des donjons', level: 'sbire', size: 'small', minion: true, legendary: false,
        hp: null, armor: null, speed: null, saves: null,
        abilities: [],
        attacks: [{ name: 'Contact acide', dice: '1d6', bonus: 0, noCrit: true, text: 'Digéré 0. Suit les règles des sbires.' }],
    },

    // ─── Collines et champs (p.33) ───────────────────────────────────────────────
    {
        key: 'gnoll', name: 'Gnoll', vo: 'Gnoll',
        family: 'Collines et champs', level: '1', size: 'medium', minion: false, legendary: false,
        hp: 21, armor: null, speed: null, saves: null,
        abilities: [BLOODTHIRSTY],
        attacks: [
            { name: 'Ravage', dice: '1d8', bonus: 2, noCrit: false, text: 'Ou :' },
            { name: 'Tir', dice: '1d8', bonus: 0, noCrit: false, text: '(Portée 10).' },
        ],
    },
    {
        key: 'gnoll_packleader', name: 'Chef de meute gnoll', vo: 'Gnoll Packleader',
        family: 'Collines et champs', level: '4', size: 'medium', minion: false, legendary: false,
        hp: 52, armor: null, speed: null, saves: null,
        abilities: [
            BLOODTHIRSTY,
            { name: 'Aboyer des ordres', text: '2 alliés peuvent se déplacer. Puis : Ravage (2×).' },
        ],
        attacks: [{ name: 'Ravage (2×)', dice: '1d8', bonus: 2, noCrit: false, text: 'Après Aboyer des ordres.' }],
    },
    {
        key: 'worg', name: 'Worg', vo: 'Worg',
        family: 'Collines et champs', level: '1', size: 'large', minion: false, legendary: false,
        hp: 20, armor: null, speed: '10', saves: null,
        abilities: [{ name: 'Sauvage', text: 'Critique sur 5+ contre les créatures agrippées.' }],
        attacks: [{ name: 'Mise en pièces', dice: '2d6', bonus: 0, noCrit: false, text: 'Agrippé (évasion DD 10).' }],
    },
    {
        key: 'blue_drake', name: 'Drake bleu', vo: 'Blue Drake',
        family: 'Collines et champs', level: '2', size: 'medium', minion: false, legendary: false,
        hp: 25, armor: null, speed: 'vol 12', saves: null,
        abilities: [{ name: 'Éclatement de foudre', text: 'À sa mort, (Allonge 1, zone) 2d8 (ignore les armures métalliques).' }],
        attacks: [
            { name: 'Morsure électrisante', dice: '2d8', bonus: 0, noCrit: false, text: 'Ignore les armures métalliques.' },
            { name: 'Éclatement de foudre', dice: '2d8', bonus: 0, noCrit: false, text: 'À sa mort, (Allonge 1, zone). Ignore les armures métalliques.' },
        ],
    },
    {
        key: 'griffon', name: 'Griffon', vo: 'Griffon',
        family: 'Collines et champs', level: '4', size: 'large', minion: false, legendary: false,
        hp: 52, armor: null, speed: 'vol 12', saves: null,
        abilities: [],
        attacks: [
            { name: 'Serres', dice: '1d8', bonus: 10, noCrit: false, text: 'Agrippé (évasion DD 12). Ou :' },
            { name: 'Envol et lâcher', dice: '6d6', bonus: 0, noCrit: true, text: '(s\'il agrippe) Vole de 12 vers le haut puis relâche la cible (6d6 dégâts de chute, elle atterrit à terre).' },
        ],
    },
    {
        key: 'troll', name: 'Troll', vo: 'Troll',
        family: 'Collines et champs', level: '10', size: 'large', minion: false, legendary: false,
        hp: 120, armor: null, speed: '8', saves: null,
        abilities: [
            { name: 'Régénération', text: 'Ne meurt pas à 0 PV. Seuls le feu, le radiant ou un critique alors qu\'il est déjà à 0 PV peuvent le tuer.' },
            { name: 'Choisissez deux fois', text: 'À chaque tour, choisissez deux fois parmi Griffes et Morsure.' },
        ],
        attacks: [
            { name: 'Griffes', dice: '1d6', bonus: 10, noCrit: false, text: '(Allonge 2) Si dégâts, à terre.' },
            { name: 'Morsure', dice: '1d20', bonus: 10, noCrit: false, text: '(contre une cible à terre).' },
        ],
    },
    {
        key: 'hill_giant', name: 'Géant des collines', vo: 'Hill Giant',
        family: 'Collines et champs', level: '10', size: 'huge', minion: false, legendary: false,
        hp: 130, armor: null, speed: '8', saves: null,
        abilities: [],
        attacks: [
            { name: 'Botté (2×)', dice: '1d4', bonus: 13, noCrit: false, text: '(Allonge 2) Repoussé d\'un nombre de cases égal au dé primaire. Ou :' },
            { name: 'Rocher !', dice: '1d4', bonus: 30, noCrit: false, text: '(Portée 12, zone 2×2) À terre.' },
        ],
    },
    {
        key: 'roc', name: 'Roc', vo: 'Roc',
        family: 'Collines et champs', level: '17', size: 'gargantuan', minion: false, legendary: false,
        hp: 236, armor: null, speed: 'vol 20', saves: null,
        abilities: [],
        attacks: [
            { name: 'Arracher', dice: '1d12', bonus: 20, noCrit: false, text: '(Allonge 4, jusqu\'à 2 créatures ciblées) En cas de coup au but, agrippé (évasion DD 17). Ou :' },
            { name: 'Broyer et lâcher', dice: '2d20', bonus: 0, noCrit: false, text: 'Vole de 20 cases vers le haut, inflige 2d20 dégâts aux créatures agrippées, puis les relâche (10d6 dégâts de chute).' },
        ],
    },
    {
        key: 'bulette', name: 'Bulette', vo: 'Bulette',
        family: 'Collines et champs', level: '10', size: 'large', minion: false, legendary: false,
        hp: 88, armor: 'heavy', speed: 'fouissement 6', saves: null,
        abilities: [{ name: 'Jaillissement !', text: 'Quand la bulette entre en combat, la créature la plus lourde est ciblée par Bond et morsure.' }],
        attacks: [
            { name: 'Entraîner sous terre', dice: '1d20', bonus: 10, noCrit: false, text: '(contre une créature agrippée) Puis s\'enfouit (en laissant un tunnel de 2 cases de large). Ou :' },
            { name: 'Bond et morsure', dice: '1d20', bonus: 20, noCrit: false, text: 'Bond de 6, puis agrippe (évasion DD 14).' },
        ],
        notes: 'Fouissement. Oui, les héros peuvent sauter dans les tunnels que laisse une bulette et les suivre, à leurs risques et périls !',
    },

    // ─── Morts-vivants (p.34) ────────────────────────────────────────────────────
    {
        key: 'skeleton', name: 'Squelette', vo: 'Skeleton',
        family: 'Morts-vivants', level: '1/3', size: 'medium', minion: false, legendary: false,
        hp: 9, armor: null, speed: null, saves: null,
        abilities: [
            UNLIVING,
            { name: 'Que des os !', text: 'Résistant aux coups perforants (pas aux critiques).' },
        ],
        attacks: [{ name: 'Flèche funèbre', dice: '1d4', bonus: 0, noCrit: true, text: '(Portée 8) Pas de critique.' }],
    },
    {
        key: 'zombie', name: 'Zombie', vo: 'Zombie',
        family: 'Morts-vivants', level: '1/2', size: 'medium', minion: false, legendary: false,
        hp: 14, armor: null, speed: null, saves: null,
        abilities: [UNLIVING],
        attacks: [{ name: 'Croquer', dice: '1d4', bonus: 2, noCrit: true, text: 'Si dégâts, agrippe (évasion DD 10). Pas de critique.' }],
    },
    {
        key: 'ghoul', name: 'Goule', vo: 'Ghoul',
        family: 'Morts-vivants', level: '1', size: 'medium', minion: false, legendary: false,
        hp: 18, armor: null, speed: null, saves: null,
        abilities: [UNLIVING],
        attacks: [{ name: 'Griffe écœurante', dice: '1d4', bonus: 4, noCrit: false, text: 'Si dégâts, étourdi.' }],
    },
    {
        key: 'specter', name: 'Spectre', vo: 'Specter',
        family: 'Morts-vivants', level: '3', size: 'medium', minion: false, legendary: false,
        hp: 34, armor: null, speed: 'vol 6', saves: null,
        abilities: [CORRUPT],
        attacks: [{ name: 'Toucher mortel', dice: '1d4', bonus: 0, noCrit: false, text: 'Si dégâts, ramène les PV à 0.' }],
    },
    {
        key: 'ogre_zombie', name: 'Zombie ogre', vo: 'Ogre Zombie',
        family: 'Morts-vivants', level: '5', size: 'large', minion: false, legendary: false,
        hp: 60, armor: null, speed: null, saves: null,
        abilities: [UNLIVING],
        attacks: [{ name: 'Massue', dice: '1d4', bonus: 18, noCrit: false, text: 'Sur un critique, à terre.' }],
    },
    {
        key: 'mummy', name: 'Momie', vo: 'Mummy',
        family: 'Morts-vivants', level: '6', size: 'medium', minion: false, legendary: false,
        hp: 75, armor: null, speed: null, saves: null,
        abilities: [],
        attacks: [{ name: 'Coup maudit', dice: '1d4', bonus: 20, noCrit: false, text: 'Si dégâts, étourdi.' }],
    },
    {
        key: 'giant_zombie', name: 'Zombie géant', vo: 'Giant Zombie',
        family: 'Morts-vivants', level: '8', size: 'huge', minion: false, legendary: false,
        hp: 100, armor: null, speed: null, saves: null,
        abilities: [UNLIVING],
        attacks: [{ name: 'Balayage putride (2×)', dice: '1d4', bonus: 10, noCrit: false, text: 'Si dégâts, à terre ou repoussé d\'un nombre de cases égal au dé primaire.' }],
    },
    {
        key: 'wraith', name: 'Âme-en-peine', vo: 'Wraith',
        family: 'Morts-vivants', level: '10', size: 'medium', minion: false, legendary: false,
        hp: 120, armor: null, speed: 'vol 6', saves: null,
        abilities: [CORRUPT],
        attacks: [{ name: 'Déchirure d\'âme (2×)', dice: '1d4', bonus: 10, noCrit: false, text: '(Portée 8) Si dégâts, inflige 1 Blessure.' }],
    },
    {
        key: 'mummy_lord', name: 'Seigneur momie', vo: 'Mummy Lord',
        family: 'Morts-vivants', level: '21', size: 'medium', minion: false, legendary: false,
        hp: 260, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Regard maudit', text: 'Quand il subit un critique : inflige une Blessure sur un jet de sauvegarde d\'INT DD 20 raté.' },
            { name: 'Nuée de scarabées', text: '(Allonge 6) Invoque 6 sbires scarabées (taille : d6). Puis : Coup (2×).' },
        ],
        attacks: [{ name: 'Coup (2×)', dice: '1d4', bonus: 20, noCrit: false, text: 'Après Nuée de scarabées. Si dégâts, étourdi.' }],
    },

    // ─── Habitants de la forêt (p.35) ────────────────────────────────────────────
    {
        key: 'briarbane_seedling', name: 'Pousse ronce-fléau', vo: 'Briarbane Seedling',
        family: 'Habitants de la forêt', level: '1/2', size: 'small', minion: false, legendary: false,
        hp: 12, armor: null, speed: null, saves: null,
        abilities: [],
        attacks: [{ name: 'Graine épineuse', dice: '1d6', bonus: 2, noCrit: true, text: '(Portée 6) Pas de critique.' }],
    },
    {
        key: 'briarbane_acidpod', name: 'Gousse-acide ronce-fléau', vo: 'Briarbane Acidpod',
        family: 'Habitants de la forêt', level: '1', size: 'small', minion: false, legendary: false,
        hp: 18, armor: null, speed: null, saves: null,
        abilities: [{ name: 'Saisie', text: 'Agrippe (évasion DD 12).' }],
        attacks: [{ name: 'Éruption caustique', dice: '4d6', bonus: 0, noCrit: false, text: 'À sa mort, (Allonge 1, zone).' }],
    },
    {
        key: 'briarbane_tangler', name: 'Enlaceur ronce-fléau', vo: 'Briarbane Tangler',
        family: 'Habitants de la forêt', level: '2', size: 'medium', minion: false, legendary: false,
        hp: 24, armor: 'heavy', speed: null, saves: null,
        abilities: [
            PEELING_BARK,
            { name: 'Choisissez deux fois', text: 'À chaque tour, choisissez deux fois parmi Enlacer et Tirer.' },
            { name: 'Tirer', text: '(contre une créature agrippée) La déplace de 4 cases.' },
        ],
        attacks: [{ name: 'Enlacer', dice: '1d6', bonus: 0, noCrit: false, text: '(Allonge 6) Agrippé (évasion DD 12, ou tout dégât de feu ou tranchant).' }],
        notes: 'Armure lourde dégradable (H* dans le livre, voir Écorce qui pèle).',
    },
    {
        key: 'briarbane_rootbreaker', name: 'Brise-racines ronce-fléau', vo: 'Briarbane Rootbreaker',
        family: 'Habitants de la forêt', level: '5', size: 'large', minion: false, legendary: false,
        hp: 58, armor: 'heavy', speed: null, saves: null,
        abilities: [PEELING_BARK],
        attacks: [{ name: 'Coup (2×)', dice: '1d6', bonus: 5, noCrit: false, text: 'Si dégâts, repoussé de 2 ou à terre.' }],
        notes: 'Armure lourde dégradable (H* dans le livre, voir Écorce qui pèle).',
    },
    {
        key: 'duskprowler', name: 'Rôdeur crépusculaire', vo: 'Duskprowler',
        family: 'Habitants de la forêt', level: '6', size: 'large', minion: false, legendary: false,
        hp: 70, armor: null, speed: '8', saves: null,
        abilities: [{ name: 'Aura illusoire', text: 'Les attaques contre le rôdeur crépusculaire ont un désavantage 2. Subir des dégâts supprime cet effet jusqu\'à la fin du tour du héros suivant.' }],
        attacks: [{ name: 'Ravage (2×)', dice: '1d8', bonus: 5, noCrit: false, text: '' }],
    },
    {
        key: 'basilisk', name: 'Basilic', vo: 'Basilisk',
        family: 'Habitants de la forêt', level: '7', size: 'medium', minion: false, legendary: false,
        hp: 60, armor: 'medium', speed: null, saves: null,
        abilities: [
            { name: 'Regard pétrifiant', text: '(Allonge 16) Minéralise 1 créature qui peut vous voir. Puis : Envenimer.' },
            { name: 'Minéralisé', text: 'Nombre maximal d\'actions réduit de 1 (dure 10 min, cumulable). Minéralisé 3 fois : pétrifié !' },
        ],
        attacks: [{ name: 'Envenimer', dice: 'd44', bonus: 0, noCrit: false, text: 'Après Regard pétrifiant. Avantage contre les créatures qui ont moins de 3 actions.' }],
    },
    {
        key: 'druid', name: 'Druide', vo: 'Druid',
        family: 'Habitants de la forêt', level: '8', size: 'medium', minion: false, legendary: false,
        hp: 90, armor: null, speed: null, saves: null,
        abilities: [],
        attacks: [
            { name: 'Forme bestiale (2×)', dice: '1d4', bonus: 10, noCrit: false, text: 'Gagnez +4 en Vitesse et une armure moyenne jusqu\'au début de votre prochain tour, puis (2×) 1d4+10 avec avantage. Ou :' },
            { name: 'Ouragan', dice: '4d4', bonus: 10, noCrit: false, text: '(Allonge 3, zone) Aux ennemis. Si dégâts, déplacez les cibles n\'importe où dans l\'Allonge.' },
        ],
    },

    // ─── Cultistes et horreurs (p.36) ────────────────────────────────────────────
    {
        key: 'cultist', name: 'Cultiste', vo: 'Cultist',
        family: 'Cultistes et horreurs', level: '1', size: 'medium', minion: false, legendary: false,
        hp: 22, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Offrande fanatique !', text: 'Perdez 2 PV, infligez le Désespoir aux ennemis adjacents. Puis : Lame effroyable.' },
            DESPAIR,
        ],
        attacks: [{ name: 'Lame effroyable', dice: '1d6', bonus: 4, noCrit: false, text: 'Après Offrande fanatique !' }],
    },
    {
        key: 'fanatic', name: 'Fanatique', vo: 'Fanatic',
        family: 'Cultistes et horreurs', level: '3', size: 'medium', minion: false, legendary: false,
        hp: 44, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Offrande fanatique !', text: 'Perdez 2 PV, infligez le Désespoir aux ennemis adjacents. Ou : Murmures de folie.' },
            DESPAIR,
        ],
        attacks: [{ name: 'Murmures de folie', dice: '3d6', bonus: 6, noCrit: false, text: '(contre une cible désespérée) Agrippe (évasion DD 13, ou tout dégât radiant). Dégâts psychiques (impossible de se défendre ou de s\'interposer).' }],
    },
    {
        key: 'doomsayer', name: 'Prophète de malheur', vo: 'Doomsayer',
        family: 'Cultistes et horreurs', level: '5', size: 'medium', minion: false, legendary: false,
        hp: 66, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Chant fiévreux', text: 'Réduit à 1 tous les dégâts infligés aux alliés qui peuvent vous entendre.' },
            DESPAIR,
        ],
        attacks: [{ name: 'Explosion extatique', dice: '3d6', bonus: 0, noCrit: false, text: 'Dégâts psychiques à tous les ennemis désespérés (ignorant la Défense).' }],
    },
    {
        key: 'stenchling', name: 'Pestilent', vo: 'Stenchling',
        family: 'Cultistes et horreurs', level: '1/2', size: 'small', minion: false, legendary: false,
        hp: 14, armor: null, speed: null, saves: null,
        abilities: [{ name: 'Nuage putride', text: 'À sa mort, (Allonge 2, zone) 2d6 aux ennemis.' }],
        attacks: [
            { name: 'Morsure', dice: '1d6', bonus: 1, noCrit: true, text: 'Pas de critique.' },
            { name: 'Nuage putride', dice: '2d6', bonus: 0, noCrit: false, text: 'À sa mort, (Allonge 2, zone) aux ennemis.' },
        ],
    },
    {
        key: 'spiny_fiend', name: 'Démon épineux', vo: 'Spiny Fiend',
        family: 'Cultistes et horreurs', level: '4', size: 'medium', minion: false, legendary: false,
        hp: 48, armor: null, speed: null, saves: null,
        abilities: [{ name: 'Épines', text: 'Les attaquants au corps à corps subissent 4 dégâts.' }],
        attacks: [
            { name: 'Griffes (2×)', dice: '1d6', bonus: 4, noCrit: false, text: 'Ou :' },
            { name: 'Tir d\'épine', dice: '1d6', bonus: 4, noCrit: false, text: '(Portée 12).' },
        ],
    },
    {
        key: 'glabrezu', name: 'Glabrezu', vo: 'Glabrezu',
        family: 'Cultistes et horreurs', level: '14', size: 'large', minion: false, legendary: false,
        hp: 120, armor: 'heavy', speed: null, saves: null,
        abilities: [{ name: 'Écarteler', text: '(une créature agrippée par les deux pinces) 50 dégâts impossibles à prévenir. Puis, si la cible est mourante : jet de sauvegarde de FOR DD 16 ou elle est déchirée en deux et meurt sur le coup.' }],
        attacks: [{ name: 'Pince funeste (2×)', dice: '1d6', bonus: 20, noCrit: false, text: '(Allonge 2) Si dégâts, agrippé (évasion DD 16 ; agrippé par les deux pinces, il faut s\'échapper de chacune). Ou : Écarteler.' }],
    },

    // ─── Souterrains (p.37) ──────────────────────────────────────────────────────
    {
        key: 'giant_spider', name: 'Araignée géante', vo: 'Giant Spider',
        family: 'Souterrains', level: '2', size: 'medium', minion: false, legendary: false,
        hp: 30, armor: null, speed: null, saves: null,
        abilities: [],
        attacks: [
            { name: 'Tir de toile', dice: '1d8', bonus: 2, noCrit: false, text: '(Portée 6) Immobilisé (évasion DD 12, ou tout dégât tranchant ou de feu). Ou :' },
            { name: 'Morsure', dice: '1d8', bonus: 5, noCrit: false, text: '(contre une cible entravée) Empoisonné (les soins y mettent fin).' },
        ],
    },
    {
        key: 'ettercap', name: 'Ettercap', vo: 'Ettercap',
        family: 'Souterrains', level: '4', size: 'medium', minion: false, legendary: false,
        hp: 50, armor: null, speed: null, saves: null,
        abilities: [{ name: 'Réduit au silence', text: 'Impossible de lancer des sorts ou d\'utiliser d\'autres capacités qui exigent de parler (ex. les Ordres du Commandant).' }],
        attacks: [{ name: 'Garrot de toile', dice: '1d8', bonus: 10, noCrit: false, text: 'Agrippé (évasion DD 12) et réduit au silence jusqu\'à l\'évasion.' }],
    },
    {
        key: 'nestweaver', name: 'Tisse-nid', vo: 'Nestweaver',
        family: 'Souterrains', level: '6', size: 'large', minion: false, legendary: false,
        hp: 50, armor: 'medium', speed: null, saves: null,
        abilities: [{ name: 'Essaim', text: 'Invoque 3 sbires araignées (taille : d8). Puis choisissez 1 : Tir de toile ou Morsure.' }],
        attacks: [
            { name: 'Tir de toile', dice: '1d8', bonus: 2, noCrit: false, text: '(Portée 6) Immobilisé (évasion DD 12, ou tout dégât tranchant ou de feu). Ou :' },
            { name: 'Morsure', dice: '1d8', bonus: 10, noCrit: false, text: '(contre une cible entravée) Empoisonné (les soins y mettent fin).' },
        ],
    },
    {
        key: 'umber_hulk', name: 'Colosse d\'ombre', vo: 'Umber Hulk',
        family: 'Souterrains', level: '10', size: 'large', minion: false, legendary: false,
        hp: 80, armor: 'heavy', speed: null, saves: null,
        abilities: [
            { name: 'Phéromones déroutantes', text: '(Allonge 3) Les ennemis font un jet de sauvegarde de VOL DD 14 ou deviennent Confus (à chaque échec, ils gagnent avantage 1 sur ce jet pour la rencontre). Puis : Mandibules et griffes (2×).' },
            { name: 'Confus', text: 'Le MJ dépense 1 action de la cible ce round.' },
        ],
        attacks: [{ name: 'Mandibules et griffes (2×)', dice: '1d10', bonus: 10, noCrit: false, text: 'Après Phéromones déroutantes.' }],
    },
    {
        key: 'cloaker', name: 'Manteleur', vo: 'Cloaker',
        family: 'Souterrains', level: '13', size: 'large', minion: false, legendary: false,
        hp: 110, armor: null, speed: 'vol 10', saves: null,
        abilities: [
            { name: 'Embusqué', text: 'Les manteleurs agissent toujours en premier et les héros lancent l\'Initiative avec désavantage.' },
            { name: 'Mal partagé', text: 'Vous subissez la moitié des dégâts des attaques tant que vous agrippez une créature (elle subit l\'autre moitié).' },
            { name: 'Plainte horrifiante', text: '(Allonge 6, zone) Toutes les autres créatures font un jet de sauvegarde de VOL DD 15 ou deviennent effrayées et doivent dépenser une action pour s\'éloigner le plus loin possible.' },
        ],
        attacks: [{ name: 'Envelopper', dice: '2d10', bonus: 20, noCrit: false, text: 'Agrippé (évasion DD 15). Ou : Plainte horrifiante.' }],
    },
    {
        key: 'great_worm', name: 'Grand ver', vo: 'Great Worm',
        family: 'Souterrains', level: '16', size: 'huge', minion: false, legendary: false,
        hp: 140, armor: 'heavy', speed: 'fouissement 8', saves: null,
        abilities: [
            { name: 'Perception sismique', text: 'Avantage contre les cibles qui se sont déplacées ce round, désavantage sinon.' },
            { name: 'Avalé', text: 'Vous subissez 20 dégâts au début de votre tour. Vos attaques ne peuvent pas rater et ignorent l\'armure.' },
        ],
        attacks: [
            { name: 'Écrasement', dice: 'd88', bonus: 0, noCrit: true, text: '(Ligne 3×6, zone) Dégâts sur un jet de sauvegarde de DEX DD 18 raté. (Les créatures qui échouent peuvent dépenser 1 action pour plonger hors de portée au lieu de subir ces dégâts : elles se déplacent de la moitié de leur Vitesse et tombent à terre.) Ou :' },
            { name: 'Morsure', dice: '1d4', bonus: 50, noCrit: false, text: '(Allonge 6) Sur un critique, Avalé.' },
        ],
    },

    // ─── Monstres légendaires (p.40-57) ──────────────────────────────────────────
    {
        key: 'pudge_the_blunderer', name: 'Pudge le Maladroit', vo: 'Pudge the Blunderer',
        family: 'Monstres légendaires', level: '2', size: 'medium', minion: false, legendary: true,
        hp: 28, hpPerHero: true, armor: null, speed: null, saves: 'FOR+, INT–',
        abilities: [],
        attacks: [
            { name: 'Avance et cogne', dice: '1d8', bonus: 0, noCrit: false, text: 'Déplacement de 8, attaque pour 1d8. Si dégâts, à terre.' },
            { name: 'Attrape et lance', dice: '1d8', bonus: 0, noCrit: false, text: 'Si dégâts, (Allonge 6) le lance sur une autre cible : les deux subissent encore 1d8 dégâts et tombent à terre.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option (alterner recommandé) : Avance et cogne ou Attrape et lance.' },
            { title: 'En sang : Piétinement sismique !', text: 'Les héros tombent à terre sur un jet de sauvegarde de FOR DD 12 raté.' },
            { title: 'Baroud d\'honneur', text: 'Pudge regagne 7 PV par héros et lance des d12 pour chaque attaque.' },
        ],
        notes: 'Ogre stupide légendaire. Exemple du livre : pour un groupe de niveau 2 de 4 héros, il a 112 PV (et 28 PV de plus pour son Baroud d\'honneur). En sang, Pudge se met en colère et la taille de son dé augmente, ce qui accroît ses dégâts et réduit ses chances de rater. Pour son Baroud d\'honneur, il devient bien plus dangereux, se déplaçant et utilisant sa grosse attaque à chaque tour.',
    },
    {
        key: 'kelebek_entomancer', name: 'Kelebek, entomancien', vo: 'Kelebek, Entomancer',
        family: 'Monstres légendaires', level: '3', size: 'medium', minion: false, legendary: true,
        hp: 20, hpPerHero: true, armor: null, speed: null, saves: 'INT+, VOL+',
        abilities: [],
        attacks: [{ name: 'Fouet de liane', dice: '2d6', bonus: 0, noCrit: false, text: 'Déplacement de 6, puis 2d6. Si dégâts, déplace la cible vers une case inoccupée à Allonge 6.' }],
        sections: KELEBEK_POPPY,
        notes: 'Druide insecte légendaire, en duo avec son familier puant Poppy (Kelebek et Poppy).',
    },
    {
        key: 'poppy_giant_stinkbug', name: 'Poppy, punaise géante', vo: 'Poppy, Giant Stinkbug',
        family: 'Monstres légendaires', level: '3', size: 'medium', minion: false, legendary: true,
        hp: 24, hpPerHero: true, armor: null, speed: null, saves: 'FOR+',
        abilities: [{ name: 'Nuage puant', text: '(1/round, Allonge 2) Quand Poppy subit des dégâts, les ennemis font un jet de sauvegarde de FOR ou passent leur prochaine action à vomir, et ne peuvent pas prendre de réaction ce round (DD : les dégâts infligés ou 10, le plus élevé des deux).' }],
        attacks: [{ name: 'Mandibules broyeuses', dice: '2d6', bonus: 0, noCrit: false, text: 'Déplacement de 6. Jusqu\'à 2 créatures adjacentes.' }],
        sections: KELEBEK_POPPY,
        notes: 'Familier puant de Kelebek, en duo avec lui (Kelebek et Poppy).',
    },
    {
        key: 'grimbeak_the_unyielding', name: 'Bec-Cruel, l\'Inflexible', vo: 'Grimbeak, the Unyielding',
        family: 'Monstres légendaires', level: '3', size: 'large', minion: false, legendary: true,
        hp: 40, hpPerHero: true, armor: null, speed: null, saves: 'FOR+',
        abilities: [{ name: 'Brutal', text: 'Traitez le dé le plus haut obtenu comme dé primaire. Sur un critique, met à terre.' }],
        attacks: [
            { name: 'Bec', dice: '2d6', bonus: 0, noCrit: false, text: 'Déplacement de 8. Attaque pour 2d6 dégâts.' },
            { name: 'Lacérer et déchiqueter', dice: '2d6', bonus: 5, noCrit: false, text: '' },
            { name: 'Cri sauvage', dice: '2d6', bonus: 0, noCrit: false, text: 'En sang uniquement. (1 utilisation, Allonge 12, zone) Dégâts psychiques (ignorant la Défense). Jet de sauvegarde de VOL DD 11 ou effrayé 1 round.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option (alterner recommandé) : Bec ou Lacérer et déchiqueter.' },
            { title: 'En sang', text: 'Gagne : **Cri sauvage.** (1 utilisation, Allonge 12, zone) 2d6 dégâts psychiques (ignorant la Défense). Jet de sauvegarde de VOL DD 11 ou effrayé 1 round.' },
            { title: 'Baroud d\'honneur', text: 'Bec-Cruel regagne 10 PV par héros et lance des d10 au lieu des d6.' },
        ],
        notes: 'Grand ours-hibou légendaire.',
    },
    {
        key: 'thorn_quickblade', name: 'Thorn Lame-Vive', vo: 'Thorn Quickblade',
        family: 'Monstres légendaires', level: '4', size: 'medium', minion: false, legendary: true,
        hp: 44, hpPerHero: true, armor: null, speed: null, saves: 'DEX+',
        abilities: [{ name: 'Riposte', text: 'Quand il subit un critique, il effectue en retour une attaque Perce-cœur ou Plume-tempête.' }],
        attacks: [
            { name: 'Plume-tempête (arbalète)', dice: '2d4', bonus: 10, noCrit: false, text: '(Portée 8).' },
            { name: 'Perce-cœur (rapière)', dice: '2d4', bonus: 0, noCrit: false, text: 'Déplacement de 6, 2d4 dégâts. Sur un critique, étourdi.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option (alterner recommandé) : Plume-tempête ou Perce-cœur.' },
            { title: 'En sang : Bombe fumigène', text: 'Thorn aveugle immédiatement tous les ennemis pendant 1 round, puis se déplace de 6 en ignorant les attaques d\'opportunité.' },
            { title: 'Baroud d\'honneur : Combattre ou fuir', text: 'Thorn regagne 13 PV par héros et (1/tour) peut faire une Riposte ou se déplacer quand il est touché.' },
        ],
        notes: 'Criminel humain légendaire.',
    },
    {
        key: 'ravager_of_the_lowlands', name: 'Ravageur des Basses-Terres', vo: 'Ravager of the Lowlands',
        family: 'Monstres légendaires', level: '5', size: 'large', minion: false, legendary: true,
        hp: 48, hpPerHero: true, armor: null, speed: null, saves: 'FOR+, DEX+',
        abilities: [{ name: 'Instinct sauvage', text: 'Chaque fois que le Ravageur subit un critique, il peut voler de 10 en ignorant les attaques d\'opportunité.' }],
        attacks: [
            { name: 'Griffe', dice: '1d12', bonus: 5, noCrit: false, text: 'Vole de 10, (Allonge 2).' },
            { name: 'Ravage', dice: '1d12', bonus: 12, noCrit: false, text: '(Allonge 2).' },
            { name: 'Dard venimeux', dice: '5d12', bonus: 0, noCrit: false, text: 'En sang uniquement. (1 utilisation, Allonge 3) Empoisonné.' },
            { name: 'Riposte du baroud', dice: '1d12', bonus: 0, noCrit: false, text: 'Baroud d\'honneur uniquement : la première fois à chaque tour qu\'il subit des dégâts.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option (alterner recommandé) : Griffe ou Ravage.' },
            { title: 'En sang', text: 'Gagne : **Dard venimeux.** (1 utilisation, Allonge 3) 5d12 dégâts. Empoisonné.' },
            { title: 'Baroud d\'honneur', text: 'Le Ravageur regagne 17 PV par héros, et la première fois à chaque tour qu\'il subit des dégâts, il attaque pour 1d12.' },
        ],
        notes: 'Grande manticore légendaire.',
    },
    {
        key: 'queen_aranya_broodmother', name: 'Reine Aranya, Mère de la couvée', vo: 'Queen Aranya, Broodmother',
        family: 'Monstres légendaires', level: '6', size: 'large', minion: false, legendary: true,
        hp: 44, hpPerHero: true, armor: 'medium', speed: null, saves: 'TOUTES+',
        abilities: [
            { name: 'Tisser la toile', text: 'Les créatures qu\'elle touche sont prises dans une toile collante (étourdies).' },
            { name: 'Toiles inflammables', text: 'Les dégâts de feu suppriment Tisser la toile pendant 1 tour.' },
            { name: 'Éclosion', text: 'Invoque 1 sbire araignée par héros (taille : d8) ; ils n\'agissent que sur ordre.' },
            { name: 'À table !', text: 'Ordonne à tous ses sbires araignées de se déplacer de 6 puis d\'attaquer.' },
        ],
        attacks: [{ name: 'Empaler', dice: '2d8', bonus: 8, noCrit: false, text: '(Allonge 2) Puis s\'éloigne prestement de 8 cases au plus.' }],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option (alterner recommandé) : Empaler, Éclosion ou À table !' },
            { title: 'En sang : Vengez votre reine, ma couvée !', text: 'Invoque 3 sbires araignées par héros à Allonge 8.' },
            { title: 'Baroud d\'honneur', text: 'Aranya regagne 12 PV par héros et utilise Éclosion après chacun de ses tours.' },
        ],
        notes: 'Grande matriarche des araignées légendaire.',
    },
    {
        key: 'nalzar_apex_predator', name: 'Nalzar, superprédatrice', vo: 'Nalzar, Apex Predator',
        family: 'Monstres légendaires', level: '6', size: 'large', minion: false, legendary: true,
        hp: 56, hpPerHero: true, armor: null, speed: null, saves: 'FOR+, DEX+',
        abilities: [
            { name: 'Balayage de queue', text: 'Quand elle subit des dégâts tranchants ou de foudre : (Allonge 3) met un ennemi à terre.' },
            { name: 'Ailes déchirées', text: 'Chaque critique tranchant réduit de 1 le DD de Rafale d\'ailes.' },
        ],
        attacks: [
            { name: 'Rafale d\'ailes', dice: '1d10', bonus: 0, noCrit: true, text: 'Vole de 10, puis atterrit. (Cône 10, zone) À terre sur un jet de sauvegarde de FOR DD 14 raté (avantage si derrière un abri ou un autre héros).' },
            { name: 'Dévorer', dice: '3d10', bonus: 10, noCrit: false, text: 'Déplacement de 2, (contre une cible à terre, Allonge 2).' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option (alterner recommandé) : Rafale d\'ailes ou Dévorer.' },
            { title: 'En sang', text: '+2 au DD de Rafale d\'ailes et +1d10 dégâts.' },
            { title: 'Baroud d\'honneur', text: 'Nalzar regagne 20 PV par héros et, à chaque tour, elle se déplace de 6, puis utilise Dévorer (en ignorant la condition « à terre »).' },
        ],
        notes: 'Grande drake grise légendaire.',
    },
    {
        key: 'florindris_bane_of_the_forest', name: 'Florindris, fléau de la forêt', vo: 'Florindris, Bane of the Forest',
        family: 'Monstres légendaires', level: '7', size: 'large', minion: false, legendary: true,
        hp: 64, hpPerHero: true, armor: null, speed: null, saves: 'TOUTES+',
        abilities: [
            { name: 'Aura de vent', text: 'Les attaques à distance contre vous ont le désavantage. À la fin de votre tour, repoussez les créatures adjacentes de 2 cases.' },
            { name: 'Flétrissure', text: 'Résistant aux dégâts nécrotiques, mais ils suppriment Aura de vent jusqu\'à la fin du tour du héros suivant.' },
            { name: 'Bourrasque', text: '(Allonge 8) Déplace une cible de 1d10 cases.' },
            { name: 'Épine-fléau', text: 'Subit 2 dégâts pour chaque case de déplacement forcé. Les soins mettent fin à cet effet.' },
        ],
        attacks: [
            { name: 'Lacérer', dice: '1d10', bonus: 10, noCrit: false, text: 'Vole de 10. (Allonge 2, jusqu\'à 2 cibles) En cas de coup au but, gagne Épine-fléau.' },
            { name: 'Tempête de pétales', dice: '2d10', bonus: 10, noCrit: true, text: 'En sang uniquement. (1 utilisation, Allonge 8, zone) Moitié sur un jet de sauvegarde de DEX DD 13 réussi.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option (alterner recommandé) : Bourrasque ou Lacérer.' },
            { title: 'En sang', text: 'Les ennemis à Allonge 12 gagnent Épine-fléau. Gagne : **Tempête de pétales.** (1 utilisation, Allonge 8, zone) 2d10+10, moitié sur un jet de sauvegarde de DEX DD 13 réussi.' },
            { title: 'Baroud d\'honneur', text: 'Florindris regagne 23 PV par héros, et Aura de vent et Bourrasque déplacent les créatures deux fois plus loin.' },
        ],
        notes: 'Grand dragon floral légendaire.',
    },
    {
        key: 'general_flameheart', name: 'Général Cœur-de-Flamme', vo: 'General Flameheart',
        family: 'Monstres légendaires', level: '8', size: 'huge', minion: false, legendary: true,
        hp: 64, hpPerHero: true, armor: 'medium', speed: null, saves: 'FOR++, VOL+',
        abilities: [
            { name: 'Armure de cendres', text: 'Résistant au feu. Quand il subit des dégâts, inflige 5 dégâts de feu à toutes les créatures adjacentes.' },
            { name: 'Flamme éteinte', text: 'Les critiques de glace ou radiants éteignent toutes les zones enflammées par Fureur en fusion et suppriment Armure de cendres jusqu\'à la fin du tour du héros suivant.' },
        ],
        attacks: [
            { name: 'Taille infernale', dice: '2d10', bonus: 10, noCrit: false, text: 'Déplacement de 6, puis frappe une zone carrée de 3×2. Dégâts de feu.' },
            { name: 'Fureur en fusion', dice: '2d10', bonus: 10, noCrit: false, text: 'Lance une boule de feu en fusion sur le héros le plus éloigné qui n\'est pas déjà dans les flammes, enflammant une zone carrée de 2×2. Les créatures qui s\'y trouvent subissent les dégâts, puis 10 dégâts de plus à la fin de chacun de leurs tours si elles restent dans la zone.' },
            { name: 'Embrasement (Flammèche)', dice: '1d10', bonus: 0, noCrit: true, text: 'Attaque d\'un sbire Flammèche élémentaire. (Allonge 1, zone) Suit les règles des sbires.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option (alterner recommandé) : Taille infernale ou Fureur en fusion.' },
            { title: 'En sang : Engeance de flammes', text: 'Chaque Fureur en fusion fait apparaître un sbire Flammèche élémentaire.' },
            { title: 'Flammèche élémentaire (sbire)', text: 'Suit les règles des sbires.\n**Embrasement.** (Allonge 1, zone) 1d10.\n**Explosion.** À sa mort, (Allonge 1, zone) 1d10.' },
            { title: 'Baroud d\'honneur', text: 'Cœur-de-Flamme regagne 19 PV par héros, ses attaques passent à une zone de 3×3. Il fait apparaître une Flammèche à chacun de ses tours.' },
        ],
        notes: 'Énorme titan de flammes légendaire.',
    },
    {
        key: 'vael_undying_necromancer', name: 'Vael, nécromancien immortel', vo: 'Vael, Undying Necromancer',
        family: 'Monstres légendaires', level: '9', size: 'medium', minion: false, legendary: true,
        hp: 64, hpPerHero: true, armor: null, speed: null, saves: 'INT++, VOL++',
        abilities: [
            { name: 'Protégez le maître !', text: 'Chaque fois que Vael devrait rater un jet de sauvegarde ou subir 20 dégâts ou plus, il peut sacrifier à la place son esprit lié, Fléau.' },
            { name: 'Rappeler Fléau', text: '(1/round) Déplacement de 6 et invoque de nouveau Fléau.' },
        ],
        attacks: [
            { name: 'Fléau (esprit lié)', dice: '1d12', bonus: 6, noCrit: false, text: 'Fléau attaque après le tour de chaque héros, avant le choix de Vael.' },
            { name: 'FUNESTE', dice: '2d12', bonus: 20, noCrit: true, text: '(Portée 12, cible indemne) Jet de sauvegarde de VOL DD 14 ou dégâts. Moitié en cas de réussite.' },
            { name: 'Réprimande de l\'arpenteur du voile', dice: '2d12', bonus: 6, noCrit: false, text: '(Portée 8) Dégâts doublés contre ceux qui sont derrière un abri. (1/round) Vous pouvez échanger votre place avec eux.' },
            { name: 'Tranchant de la cruauté', dice: '1d4', bonus: 2, noCrit: false, text: 'En cas de coup au but, jet de sauvegarde de VOL DD 14 ou étourdi et effrayé. Puis déplacement de 6.' },
            { name: 'Esprit vengeur', dice: '1d12', bonus: 6, noCrit: false, text: 'Baroud d\'honneur uniquement. (Allonge 3, zone) À la fin de chacun des tours de Vael.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, Fléau attaque pour 1d12+6, puis Vael choisit une option : FUNESTE, Réprimande de l\'arpenteur du voile, Tranchant de la cruauté ou Rappeler Fléau.' },
            { title: 'En sang : Bouclier de cruauté', text: '(Réaction, 1 utilisation) Si Vael devait subir des dégâts, il peut à la place renvoyer autant de dégâts radiants à l\'attaquant.' },
            { title: 'Baroud d\'honneur : LA MORT, UNE VIEILLE AMIE', text: 'Vael regagne 24 PV par héros. Le héros qui l\'a blessé le plus récemment tombe à 0 PV, et Fléau est sacrifié en Esprit vengeur qui ne peut plus être rappelé : (Allonge 3, zone) 1d12+6 à la fin de chacun des tours de Vael.' },
        ],
        notes: 'Sommité de la malveillance légendaire.',
    },
    {
        key: 'titan_of_the_deep_woods', name: 'Titan des bois profonds', vo: 'Titan of the Deep Woods',
        family: 'Monstres légendaires', level: '10', size: 'gargantuan', minion: false, legendary: true,
        hp: 64, hpPerHero: true, armor: 'heavy', speed: null, saves: 'FOR+++',
        abilities: [
            { name: 'Légions éclatées', text: 'Les dégâts contondants ou tout critique font éclater des os qui s\'animent et forment un sbire squelette (taille : d10).' },
            { name: 'Os friables', text: 'Résistant au perforant, vulnérable au contondant.' },
            { name: 'Appel funeste', text: 'Les 2 héros les plus éloignés font un jet de sauvegarde de VOL DD 16 ou sont déplacés adjacents au Titan (désavantage si un squelette leur est adjacent).' },
        ],
        attacks: [
            { name: 'Frappe dévastatrice', dice: '1d4', bonus: 30, noCrit: false, text: '(Allonge 4) En cas de coup au but, repoussé de 6.' },
            { name: 'Piétinement écrasant', dice: '1d4', bonus: 20, noCrit: false, text: 'Déplacement de 10. Jusqu\'à 2 cibles sur le trajet. En cas de coup au but, à terre.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez 1 option (alterner recommandé) : Frappe dévastatrice, Piétinement écrasant ou Appel funeste.' },
            { title: 'Baroud d\'honneur : Légion brisée', text: 'À 0 PV, le Titan s\'effondre en 4 sbires squelettes par héros (taille : d10). S\'il en reste, ils se réassemblent en Titan le soir suivant.' },
        ],
        notes: 'Squelette gigantesque légendaire.',
    },
    {
        key: 'ulvek_psionic_despot', name: 'Ul\'vek, despote psionique', vo: 'Ul\'vek, Psionic Despot',
        family: 'Monstres légendaires', level: '11', size: 'medium', minion: false, legendary: true,
        hp: 84, hpPerHero: true, armor: null, speed: null, saves: 'INT++, VOL++',
        abilities: [
            { name: 'Bouclier mental', text: 'Chaque fois qu\'Ul\'vek devrait rater un jet de sauvegarde ou subir plus de 30 dégâts alors qu\'il a des créatures dominées, il peut éviter l\'attaque à la place, mais toutes les créatures dominées reprennent leurs esprits.' },
            { name: 'Dominé', text: 'Vos jets sont désavantagés. Ul\'vek dépense votre première action à chacun de vos tours : se déplacer, faire une attaque armée ou lancer un tour de magie. Les dégâts y mettent fin.' },
            { name: 'Contrôle', text: 'Se téléporte de 8. (Allonge 8) Jet de sauvegarde de FOR DD 15 : force un ennemi à dépenser une action pour se déplacer, faire une attaque armée ou lancer un tour de magie. En cas de réussite, il se déplace deux fois moins loin ou attaque avec désavantage.' },
        ],
        attacks: [
            { name: 'Domination', dice: '2d12', bonus: 0, noCrit: true, text: '(S\'il n\'y a aucune créature dominée) Choisissez la moitié des héros : ils subissent 2d12 dégâts psychiques (ignorant la Défense). Jet de sauvegarde de VOL DD 15 ou dominés en plus.' },
            { name: 'Dévorer', dice: '6d12', bonus: 0, noCrit: true, text: '(créature dominée) Jet de sauvegarde de DEX DD 15 ou dégâts et agrippé (évasion DD 15), moitié en cas de réussite. Impossible de se défendre ou de s\'interposer.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option (alterner recommandé) : Domination, Dévorer ou Contrôle.' },
            { title: 'En sang', text: 'Gagne : **Déplacement illusoire** (1 utilisation). Réaction (quand il est attaqué) : échange sa place avec une créature dominée, qui devient la nouvelle cible de l\'attaque.' },
            { title: 'Baroud d\'honneur : DOMINATION !', text: 'Ul\'vek regagne 30 PV par héros, et chaque héros fait un jet de sauvegarde de VOL DD 15 ou devient dominé. Dominé ne prend plus fin quand on subit des dégâts.' },
        ],
        notes: 'Aberration mangeuse de cerveaux légendaire.',
    },
    {
        key: 'dravok_all_seeing_tyrant', name: 'Dravok, tyran omnivoyant', vo: 'Dravok, All-Seeing Tyrant',
        family: 'Monstres légendaires', level: '12', size: 'large', minion: false, legendary: true,
        hp: 90, hpPerHero: true, armor: null, speed: null, saves: 'INT++, VOL++',
        abilities: [
            { name: 'Mes plans, PARFAITS !', text: 'Les attaques contre Dravok sont désavantagées, et Dravok fait tous ses jets de sauvegarde avec +1 avantage.' },
            { name: 'Faiblesse', text: 'Subir 20 dégâts perforants ou tranchants ou plus en une fois : les plans de Dravok sont IMPARFAITS ! (jusqu\'à la fin du tour du héros suivant).' },
            { name: 'Rayon 5 : Rayon de charme', text: 'Dépense 3 actions d\'un ennemi (vous ne pouvez dépenser aucune ressource limitée ; il regagne ensuite les actions dépensées).' },
        ],
        attacks: [
            { name: 'Gueule terrible', dice: '4d4', bonus: 0, noCrit: false, text: '+10 dégâts pour CHAQUE 4 obtenu.' },
            { name: 'Rayon 1 : Rayon de distorsion', dice: '2d6', bonus: 10, noCrit: false, text: '(Portée 10) Échange sa place avec la cible et la met à terre.' },
            { name: 'Rayon 2 : Rayon de pétrification', dice: '2d6', bonus: 10, noCrit: false, text: '(Portée 10) Étourdi de façon permanente (cumulable, les soins y mettent fin ; 3 cumuls : pétrifié).' },
            { name: 'Rayon 3 : Rayon de terreur', dice: '2d6', bonus: 10, noCrit: false, text: '(Portée 10) Dégâts psychiques et TERRIFIÉ : effrayé, et vos cris donnent le désavantage à vos alliés à Allonge 6 sur leurs jets. Prend fin quand les plans de Dravok sont IMPARFAITS.' },
            { name: 'Rayon 4 : Rayon gravitationnel', dice: '2d6', bonus: 0, noCrit: false, text: '(Portée 10) Déplace la cible d\'autant de cases. Le déplacement forcé inflige +5 dégâts au lieu de lancer des dés supplémentaires.' },
            { name: 'Rayon 6 : Rayon de mort', dice: 'd66', bonus: 0, noCrit: false, text: '(Portée 10) La cible gagne 1 Blessure.' },
            { name: 'Rayon de dévastation', dice: 'd66', bonus: 0, noCrit: false, text: 'Baroud d\'honneur uniquement. (1 utilisation, Ligne 10×2, zone) Gain d\'1 Blessure.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, se déplace de 6 puis utilise soit un Rayon oculaire (Portée 10 ; au choix, dans l\'ordre ou au hasard), soit Gueule terrible (4d4, +10 dégâts pour CHAQUE 4 obtenu).\n1. **Rayon de distorsion.** 2d6+10. Échange sa place avec la cible et la met à terre.\n2. **Rayon de pétrification.** 2d6+10. Étourdi de façon permanente (cumulable, les soins y mettent fin ; 3 cumuls : pétrifié).\n3. **Rayon de terreur.** 2d6+10 dégâts psychiques et TERRIFIÉ : effrayé, et vos cris donnent le désavantage à vos alliés à Allonge 6 sur leurs jets. Prend fin quand les plans de Dravok sont IMPARFAITS.\n4. **Rayon gravitationnel.** 2d6, déplace la cible d\'autant de cases. Le déplacement forcé inflige +5 dégâts au lieu de lancer des dés supplémentaires.\n5. **Rayon de charme.** Dépense 3 actions d\'un ennemi (vous ne pouvez dépenser aucune ressource limitée ; il regagne ensuite les actions dépensées).\n6. **Rayon de mort.** d66, gain d\'1 Blessure.' },
            { title: 'En sang : Poussière !', text: 'Rayon de pétrification sur chaque ennemi. Le DD de ses sauvegardes passe à 18.' },
            { title: 'Baroud d\'honneur', text: 'Dravok regagne 32 PV par héros. À chaque tour, il utilise Rayon de distorsion puis une autre attaque. Gagne : **Rayon de dévastation.** (1 utilisation, Ligne 10×2, zone) d66, gain d\'1 Blessure.' },
        ],
        notes: 'Grande aberration légendaire, tout en DENTS et en YEUX.',
    },
    {
        key: 'azriel_lord_of_pain_and_flame', name: 'Azriel, seigneur de la douleur et des flammes', vo: 'Azriel, Lord of Pain & Flame',
        family: 'Monstres légendaires', level: '14', size: 'huge', minion: false, legendary: true,
        hp: 120, hpPerHero: true, armor: null, speed: null, saves: 'TOUTES+',
        abilities: [{ name: 'DOULEUR !', text: 'TOUS les dés primaires lancés contre Azriel font un critique sur 1 de moins que le maximum. En cas de critique, l\'attaquant subit les dégâts explosifs à la place d\'Azriel.' }],
        attacks: [
            { name: 'Fouet crépitant', dice: '2d12', bonus: 10, noCrit: false, text: 'Déplacement de 6. (Allonge 6) Attire la cible adjacente à Azriel.' },
            { name: 'Épée funeste', dice: '2d12', bonus: 20, noCrit: false, text: '(Allonge 2, zone).' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez 1 option (alterner recommandé) : Fouet crépitant ou Épée funeste.' },
            { title: 'En sang', text: 'Gagne : **Vents déchirants.** (Allonge 12, zone) Jet de sauvegarde de FOR DD 17 ou Déchiré : subit 2 dégâts par case parcourue (les soins y mettent fin). Azriel peut utiliser Fouet crépitant deux fois par tour.' },
            { title: 'Baroud d\'honneur : OUI, ENCORE PLUS DE DOULEUR !', text: 'Azriel regagne 50 PV par héros, et CHAQUE coup contre lui est un critique.' },
        ],
        notes: 'Énorme balor légendaire, la cruauté incarnée.',
    },
    {
        key: 'gloomwing_the_cruel', name: 'Ailesombre le Cruel', vo: 'Gloomwing the Cruel',
        family: 'Monstres légendaires', level: '15', size: 'huge', minion: false, legendary: true,
        hp: 100, hpPerHero: true, armor: 'heavy', speed: null, saves: 'TOUTES++',
        abilities: [
            { name: 'Aura de putréfaction', text: '(Allonge 6) Les ennemis subissent 5 dégâts nécrotiques à la fin de leurs tours.' },
            { name: 'Sensibilité à la lumière', text: 'Les dégâts radiants suppriment Aura de putréfaction jusqu\'à la fin du tour du héros suivant.' },
            { name: 'Don de la cruauté', text: 'Les soins sont réduits de moitié et la cible est vulnérable aux dégâts nécrotiques. Les soins y mettent fin.' },
        ],
        attacks: [
            { name: 'Griffes', dice: '2d10', bonus: 10, noCrit: false, text: 'Déplacement de 6, puis (Allonge 2). Si dégâts, Don de la cruauté.' },
            { name: 'Morsure', dice: '2d20', bonus: 10, noCrit: false, text: '(Allonge 2) Dégâts nécrotiques.' },
            { name: 'Queue', dice: '1d10', bonus: 10, noCrit: false, text: '(Cône 4, zone) Repoussé d\'un nombre de cases égal au dé primaire.' },
            { name: 'Souffle putride', dice: '8d10', bonus: 0, noCrit: true, text: 'En sang uniquement. (1 utilisation) Vole de 10, puis (Cône 8, zone) jet de sauvegarde de DEX DD 17 ou dégâts nécrotiques, moitié en cas de réussite.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option : Griffes, Morsure ou Queue.' },
            { title: 'En sang', text: 'Gagne : **Souffle putride** (1 utilisation). Vole de 10, puis (Cône 8, zone) jet de sauvegarde de DEX DD 17 ou 8d10 dégâts nécrotiques, moitié en cas de réussite.' },
            { title: 'Baroud d\'honneur', text: 'Ailesombre regagne 30 PV par héros, Sensibilité à la lumière prend fin, et les dégâts et l\'Allonge d\'Aura de putréfaction sont doublés.' },
        ],
        notes: 'Énorme dragon de pourriture légendaire.',
    },
    {
        key: 'alaric_draegoth_the_crimson_count', name: 'Alaric Draegoth, le Comte écarlate', vo: 'Alaric Draegoth, the Crimson Count',
        family: 'Monstres légendaires', level: '16', size: 'medium', minion: false, legendary: true,
        hp: 90, hpPerHero: true, armor: null, speed: null, saves: 'TOUTES++',
        abilities: [
            { name: 'Cape sanguine', text: 'La 1re fois que vous êtes attaqué à chaque tour, infligez 1d10 et réduisez le dé primaire de ce montant.' },
            { name: 'Mépris du soleil', text: 'Vulnérable au radiant. Après avoir subi des dégâts radiants, utilise Envoûtement en réaction ; la cible lance avec désavantage.' },
            { name: 'Envoûtement', text: '(Si aucune créature n\'est envoûtée) Envoûte une cible sur un jet de sauvegarde de VOL DD 18 raté (avec désavantage si elle est en sang).' },
            { name: 'Envoûté', text: 'Étourdi. Ne peut pas se défendre ni laisser quiconque s\'interposer pour lui. Les dégâts y mettent fin.' },
        ],
        attacks: [
            { name: 'Croc d\'ébène', dice: '1d10', bonus: 10, noCrit: false, text: 'La cible est considérée en sang pendant 1 round. Vole de 8 avant ou après.' },
            { name: 'Appel et festin', dice: '1d10', bonus: 30, noCrit: false, text: 'Amène une créature envoûtée adjacente à vous et mordez-la : dégâts et 1 Blessure.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, invoque 1 sbire chauve-souris de sang (d10) à 8 cases ou moins, puis choisissez 1 option (alterner recommandé) : Croc d\'ébène, Envoûtement ou Appel et festin.' },
            { title: 'En sang : Forme de brume', text: 'N\'est plus vulnérable au radiant, gagne : **Leurre de chauve-souris** (1/round). Chaque fois qu\'Alaric devrait subir des dégâts, il échange d\'abord sa place avec un sbire chauve-souris.' },
            { title: 'Baroud d\'honneur', text: 'Regagne 25 PV par héros. Cape sanguine, attaques et chauves-souris lancent des d20 au lieu des d10.' },
        ],
        notes: 'Seigneur vampire légendaire.',
    },
    {
        key: 'caerys_the_hollow_star', name: 'Caerys, l\'Étoile creuse', vo: 'Caerys, the Hollow Star',
        family: 'Monstres légendaires', level: '20', size: 'medium', minion: false, legendary: true,
        hp: 125, hpPerHero: true, armor: 'heavy', speed: null, saves: 'TOUTES+++',
        abilities: [
            { name: 'Ravages du temps', text: 'Au début de chaque round, les ennemis subissent 1 Blessure.' },
            { name: 'Sillage', text: '3/rencontre, quand elle devrait subir un effet négatif, elle peut échanger sa place avec une créature de son choix, qui en devient la cible à la place. Tous les héros récupèrent 1 Blessure.' },
            { name: 'Entrevoir ta fin', text: 'Jet de sauvegarde de VOL DD 20 ou CONDAMNÉ : la concentration prend fin, le prochain jet de dégâts contre vous est maximisé.' },
        ],
        attacks: [
            { name: 'Trou de ver', dice: '3d20', bonus: 0, noCrit: false, text: 'Se téléporte de 12. À une créature adjacente à son point de départ ou d\'arrivée.' },
            { name: 'Immensité', dice: '3d20', bonus: 0, noCrit: true, text: '(Allonge 12) À terre sur un jet de sauvegarde de FOR DD 20 raté (désavantage si à Allonge 4). Moitié en cas de réussite.' },
            { name: 'Tempête de plasma', dice: '4d20', bonus: 0, noCrit: true, text: '(Allonge 6, zone) Jet de sauvegarde de DEX DD 20 ou 2d20 dégâts de foudre et 2d20 dégâts de feu. Moitié en cas de réussite.' },
            { name: 'Singularité', dice: '2d20', bonus: 40, noCrit: false, text: '(Allonge 2) Dégâts contondants.' },
            { name: 'Désir et fin', dice: '2d20', bonus: 20, noCrit: true, text: '(Allonge 12) Jet de sauvegarde d\'INT DD 20 ou dégâts, et choisissez un allié qui subit les mêmes dégâts. Moitié en cas de réussite.' },
        ],
        sections: [
            { title: 'Actions', text: 'Après le tour de chaque héros, choisissez 1 action pas encore choisie (on remet à zéro quand toutes l\'ont été) : Trou de ver, Immensité, Entrevoir ta fin, Tempête de plasma, Singularité, Désir et fin.' },
            { title: 'En sang', text: '**Maîtrise gravitationnelle.** (Allonge 16) Déplace TOUS les objets et créatures n\'importe où dans la zone.\n**Lentille gravitationnelle.** Le héros qui a le plus de PV est marqué par Caerys. Elle subit la moitié des dégâts de toutes sources et sa marque subit l\'autre moitié, jusqu\'à ce que la marque tombe à 0 PV.' },
            { title: 'Baroud d\'honneur', text: 'Perd son armure lourde. Utilise de nouveau Maîtrise gravitationnelle, puis Caerys regagne 60 PV par héros et choisit deux fois à chaque tour. Si elle est encore en vie après 1 round : **Retour dans le temps** : elle revient à ses PV maximum.' },
        ],
        notes: 'Cataclysme légendaire de fin du monde. « Celle qui est notre désir et notre fin. »',
    },

    // ─── Aventures d'initiation (p.8-19) ─────────────────────────────────────────
    {
        key: 'krogg_goblin_king', name: 'Krogg, roi gobelin', vo: 'Krogg, Goblin King',
        family: 'Aventures', level: '2', size: 'medium', minion: false, legendary: true,
        hp: 28, hpPerHero: true, armor: null, speed: null, saves: 'FOR+, DEX+',
        abilities: [],
        attacks: [
            { name: 'Broie-trappe', dice: '2d6', bonus: 0, noCrit: false, text: 'Déplacement de 6. Agrippé (évasion DD 10). Ou :' },
            { name: 'Fracasse-crânes', dice: '2d6', bonus: 0, noCrit: false, text: 'Déplacement de 6. Projette une créature agrippée contre une autre créature. Les deux subissent les dégâts, ce qui met fin à l\'agrippement.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option : Broie-trappe ou Fracasse-crânes.' },
            { title: 'En sang : Enragé', text: 'Les dégâts de Krogg passent aux d8.' },
        ],
        notes: 'Gobelours en colère légendaire (Les Gobelins de la Falaise de cristal, chapitre 2). Fort, rusé (plus malin que la moyenne des gobelins). Porte une couronne de ferraille. Manie le Broie-trappe, un marteau de guerre avec un piège à ours au bout.',
    },
    {
        key: 'giant_venus_flytrap', name: 'Dionée géante', vo: 'Giant Venus Flytrap',
        family: 'Aventures', level: '3', size: 'huge', minion: false, legendary: false,
        hp: 20, hpPerHero: true, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Plante vengeresse', text: 'Agit aussi chaque fois qu\'une Pousse meurt.' },
            { name: 'Choisissez 1', text: 'À son tour, choisissez 1 option : Enlacer, Ramener ou Morsure.' },
            { name: 'Ramener', text: '(si elle agrippe) Attire la cible adjacente, puis Morsure.' },
        ],
        attacks: [
            { name: 'Enlacer', dice: '1d6', bonus: 2, noCrit: false, text: '(Allonge 12, jusqu\'à 2 cibles différentes) Agrippé (évasion DD 12, ou tout dégât de feu ou tranchant).' },
            { name: 'Morsure', dice: '1d6', bonus: 15, noCrit: false, text: '(Allonge 3).' },
        ],
        notes: 'Le Repaire de Pouce-Vert (chapitre 3), salle de la dionée. PV par héros.',
    },
    {
        key: 'pinky', name: 'Pinky', vo: 'Pinky',
        family: 'Aventures', level: '2', size: 'small', minion: false, legendary: false,
        hp: 18, armor: null, speed: null, saves: null,
        abilities: [
            { name: 'Panique', text: 'Les attaques contre vous ont le désavantage.' },
            { name: 'Protégez-moi !', text: 'Ordonne à un Brise-racines d\'attaquer.' },
            { name: 'Fuite', text: '(Réaction, quand il est en sang) Utilise sa Cape de forme-vent mineure pour devenir invisible et s\'enfuir.' },
        ],
        attacks: [],
        notes: 'Le Repaire de Pouce-Vert (chapitre 3). Gobelin rose, frêle et terriblement anxieux, assistant de Pouce-Vert.',
    },
    {
        key: 'greenthumb_lichling', name: 'Pouce-Vert, liche naissante', vo: 'Greenthumb, Lichling',
        family: 'Aventures', level: '3', size: 'medium', minion: false, legendary: true,
        hp: 40, hpPerHero: true, armor: null, speed: null, saves: 'INT+, VOL+',
        abilities: [{ name: 'Ronçomancie', text: 'Déplacement de 4. Invoque 1 sbire plante par héros (chacun se déplace et attaque pour 1d4 dégâts à la fin de chaque round).' }],
        attacks: [
            { name: 'Tir d\'épines', dice: '2d4', bonus: 8, noCrit: false, text: 'Déplacement de 4. (Portée 8).' },
            { name: 'Racines épineuses', dice: '2d4', bonus: 0, noCrit: true, text: 'En sang uniquement. Tous les héros : jet de sauvegarde de DEX DD 11 ou dégâts et immobilisé ; moitié des dégâts en cas de réussite.' },
        ],
        sections: [
            { title: 'Légendaire', text: 'Après le tour de chaque héros, choisissez une option (alterner recommandé) : Ronçomancie ou Tir d\'épines.' },
            { title: 'En sang : Racines épineuses', text: 'Tous les héros font un jet de sauvegarde de DEX DD 11 ou subissent 2d4 dégâts et sont immobilisés ; moitié des dégâts en cas de réussite (évasion : FOR ou DEX DD 11, ou tout dégât tranchant ou radiant).' },
            { title: 'Baroud d\'honneur : Peau d\'écorce', text: 'Pouce-Vert regagne 10 PV par héros et une armure lourde. Être touché dégrade l\'armure (lourde » moyenne » aucune). Il peut aussi choisir deux fois par tour.' },
        ],
        notes: 'Magicien botaniste légendaire (Le Repaire de Pouce-Vert, chapitre 3). Sorcier grenouillin.',
    },
];

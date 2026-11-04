// src/client/src/systems/nimble/config/ancestries.js
// Source : Nimble Core Rules 3.3, p. 21 (langues) et p. 22-27 (ascendances communes, peu communes, exotiques).
// Catalogue des ascendances (texte, trait, effets automatisables), des langues et des encadrés liés.

// Catégories d'ascendances : libellé et texte d'introduction de chaque page
export const ANCESTRY_RARITIES = [
    {
        key: 'common', label: 'Ascendances communes', vo: 'Common Ancestries',
        text: 'Votre parenté, votre lignée, votre héritage ou votre race : c\'est ainsi que votre personnage est né et la façon dont les autres le voient au premier coup d\'œil. Vous pouvez être un nain élevé dans les mines sous la montagne parmi d\'innombrables autres nains, ou un elfe élevé par des gobelins ! À vous de choisir comment votre personnage a commencé sa vie. Choisissez 1 ascendance et reportez son bonus sur votre feuille de personnage.',
    },
    {
        key: 'uncommon', label: 'Ascendances peu communes', vo: 'Uncommon Ancestries',
        text: 'Note : votre cadre de jeu peut ne pas autoriser ces choix. Vérifiez auprès de votre MJ avant d\'en choisir un !',
    },
    {
        key: 'exotic', label: 'Ascendances exotiques', vo: 'Exotic Ancestries',
        text: 'Note : votre cadre de jeu peut ne pas autoriser ces choix. Vérifiez auprès de votre MJ avant d\'en choisir un !',
    },
];

export const ANCESTRIES = [
    // ── Communes (p. 23) ──────────────────────────────────────────────
    {
        key: 'human', name: 'Humain', vo: 'Human', rarity: 'common', size: 'medium',
        text: 'Présents sur tous les terrains et dans tous les milieux, les humains sont poussés par leur curiosité et leur ambition à explorer chaque recoin du monde, ce qui en fait une race omniprésente et polyvalente.',
        trait: { name: 'Tenace', vo: 'Tenacious', text: '+1 à toutes les compétences.' },
        effects: { skills: { all: 1 } },
    },
    {
        key: 'dwarf', name: 'Nain', vo: 'Dwarf', rarity: 'common', size: 'medium',
        text: 'Dans l\'ancienne langue, « nain » signifie « pierre ». Vous êtes résistant, solide, robuste. Même poussé jusqu\'à l\'épuisement, vous ne faiblirez pas. Renonçant à la vitesse, vous êtes doté d\'une vitalité physique et d\'un estomac capable d\'encaisser les meilleures (et les pires) consommations que ce monde ait à offrir.',
        trait: { name: 'Robuste', vo: 'Stout', text: '+2 dés de vie max, +1 Blessure max, –1 Vitesse. Vous connaissez le nain si votre INT n\'est pas négative.' },
        language: 'dwarvish',
        effects: { maxHitDice: 2, maxWounds: 1, speed: -1 },
    },
    {
        key: 'elf', name: 'Elfe', vo: 'Elf', rarity: 'common', size: 'medium',
        text: 'Les elfes incarnent la rapidité et la grâce. Leur silhouette haute et élancée dissimule une vitesse, une grâce et un esprit innés. Redoutables aussi bien en diplomatie qu\'au combat, les elfes frappent vite et évitent souvent le pire en agissant les premiers.',
        trait: { name: 'Leste', vo: 'Lithe', text: 'Avantage à l\'Initiative, +1 Vitesse. Vous connaissez l\'elfique si votre INT n\'est pas négative.' },
        language: 'elvish',
        effects: { initiativeAdvantage: true, speed: 1 },
    },
    {
        key: 'halfling', name: 'Halfelin', vo: 'Halfling', rarity: 'common', size: 'small',
        text: 'Un peu comme un humain, mais en plus petit (sauf les pieds). D\'où nous vient notre chance ? Eh bien… vous connaissez le dicton sur les pattes de lapin ? Nous, on a des pieds à n\'en plus finir à côté des leurs. Imaginez toute la chance qu\'on peut faire tenir dans ces merveilles !',
        trait: { name: 'Insaisissable', vo: 'Elusive', text: '+1 en Discrétion. (1/repos sûr) Si vous ratez un jet de sauvegarde, vous pouvez le réussir à la place.' },
        uses: { count: '1', per: 'safeRest' },
        effects: { skills: { stealth: 1 } },
    },
    {
        key: 'gnome', name: 'Gnome', vo: 'Gnome', rarity: 'common', size: 'small',
        text: 'Excentriques, curieux et éternellement optimistes, les gnomes sont joyeux, surtout comparés à leurs cousins habituellement plus grincheux et plus grands, les nains. Connus pour leurs bricolages, leur bonne humeur contagieuse et leurs facéties, les gnomes poursuivent leurs passions avec un enthousiasme étourdi.',
        trait: { name: 'Optimiste', vo: 'Optimistic', text: '(Réaction gratuite, Allonge 6) Permettez à un allié de relancer 1 dé de son choix ; se recharge quand vous êtes soigné jusqu\'à vos PV max. –1 Vitesse. Vous connaissez le nain si votre INT n\'est pas négative (mais vous l\'appelez le gnome, évidemment).' },
        language: 'dwarvish',
        effects: { speed: -1 },
    },

    // ── Peu communes (p. 24) ──────────────────────────────────────────
    {
        key: 'dragonborn', name: 'Drakéide', vo: 'Dragonborn', rarity: 'uncommon', size: 'medium',
        text: 'L\'âme d\'un dragon brûle en vous, les écailles de votre corps sont comme de l\'acier forgé. Vous êtes un four, et votre héritage les braises qui attisent vos flammes. Appelez votre courroux pour parler la langue de vos ancêtres et insuffler une fureur débridée à vos attaques.',
        trait: { name: 'Héritage draconique', vo: 'Draconic Heritage', text: '+1 Défense. (1/repos sûr) Infligez NIV+CLÉ dégâts supplémentaires lors d\'une attaque, répartis à votre guise entre les cibles de l\'attaque (se recharge chaque fois que vous subissez une Blessure). Vous connaissez le draconique si votre INT n\'est pas négative.' },
        uses: { count: '1', per: 'safeRest' },
        language: 'draconic',
        effects: { defense: 1 },
    },
    {
        key: 'kobold', name: 'Kobold', vo: 'Kobold', rarity: 'uncommon', size: 'small',
        text: 'Petits, souvent fanatiques et obsédés par les dragons. Les kobolds prospèrent en groupes familiaux, travaillant ensemble et trouvant des moyens ingénieux de survivre malgré leur taille minuscule. Sous-estimés par beaucoup, les kobolds prouvent sans cesse que même les plus petits d\'entre nous peuvent détenir un grand pouvoir.',
        trait: { name: 'Rusé', vo: 'Wily', text: 'Avantage aux tests de compétence liés aux dragons et pour Influencer les créatures amicales. (1/rencontre) Forcez un ennemi à relancer une attaque non critique contre vous. Vous connaissez le draconique si votre INT n\'est pas négative.' },
        uses: { count: '1', per: 'encounter' },
        language: 'draconic',
    },
    {
        key: 'goblin', name: 'Gobelin', vo: 'Goblin', rarity: 'uncommon', size: 'small',
        text: 'Verts, malins et perpétuellement vilipendés, les gobelins s\'épanouissent au bord du chaos. Pour un gobelin, disparaître dans l\'ombre n\'est pas qu\'un talent : c\'est une identité. Après tout, quel genre de gobelin seriez-vous si vous ne saviez pas filer sans vous faire remarquer ?',
        trait: { name: 'Décamper', vo: 'Skedaddle', text: 'Vous pouvez vous déplacer de 2 cases gratuitement après être devenu la cible d\'une attaque ou d\'un effet négatif (après les dégâts, en ignorant le terrain difficile). Vous connaissez le gobelin si votre INT n\'est pas négative.' },
        language: 'goblin',
    },
    {
        key: 'orc', name: 'Orc', vo: 'Orc', rarity: 'uncommon', size: 'medium',
        text: 'Au moment où vous croyez avoir vaincu un puissant orc, vous n\'avez fait qu\'attiser sa colère. Affronter un orc n\'est pas une entreprise pour les faibles de volonté. Là où d\'autres tremblent à l\'approche de la mort, les orcs défient hardiment son étreinte.',
        trait: { name: 'Implacable', vo: 'Relentless', text: '(1/repos sûr) Quand vous devriez tomber à 0 PV, vous pouvez fixer vos PV à NIV à la place. +1 en Puissance. Vous connaissez le gobelin si votre INT n\'est pas négative (mais vous l\'appelez l\'orque, évidemment).' },
        uses: { count: '1', per: 'safeRest' },
        language: 'goblin',
        effects: { skills: { might: 1 } },
    },
    {
        key: 'fiendkin', name: 'Démonide', vo: 'Fiendkin', rarity: 'uncommon', size: 'medium',
        text: 'Nés, dit-on, d\'une lignée maudite ou de l\'union d\'un humain et d\'un démon, les démonides se retrouvent souvent rejetés par la société. Pourtant, ils incarnent la détermination face à l\'adversité. Leurs ancêtres ne sont pas sortis des profondeurs de la Flamme éternelle pour céder à des revers mineurs !',
        trait: { name: 'Né des flammes', vo: 'Flameborn', text: '1 sauvegarde neutre est avantagée à la place. Vous connaissez l\'infernal si votre INT n\'est pas négative.' },
        language: 'infernal',
        effects: { saves: 'neutralToAdv' },
    },
    {
        key: 'bunbun', name: 'Lapinou', vo: 'Bunbun', rarity: 'uncommon', size: 'small',
        text: 'Les lapinous sont agiles et imprévisibles : ils se servent de leurs pattes puissantes pour bondir sur de grandes distances et prendre leurs ennemis au dépourvu. Affronter un lapinou, c\'est faire face à un adversaire capable de frapper sous des angles inattendus et de se repositionner en un éclair dans le feu de l\'action.',
        trait: { name: 'Pattes de lapin', vo: 'Bunny Legs', text: '(1/rencontre) Avant de vous Interposer ou après vous être Défendu (après les dégâts), bondissez gratuitement jusqu\'à votre Vitesse dans n\'importe quelle direction.' },
        uses: { count: '1', per: 'encounter' },
    },

    // ── Exotiques (p. 26-27) ──────────────────────────────────────────
    {
        key: 'birdfolk', name: 'Avien', vo: 'Birdfolk', rarity: 'exotic', size: 'small|medium',
        text: 'Les aviens ne trouvent pas refuge dans la pierre ou les chaînes, mais dans l\'immensité sans limite du ciel. Le don du vol a cependant un prix : des os creux, et la fragilité qui va avec.',
        trait: { name: 'Os creux', vo: 'Hollow Bones', text: 'Vous pouvez voler tant que vous portez une armure qui n\'est pas plus lourde que le cuir. Les critiques contre vous sont Féroces (l\'attaquant lance 1 dé supplémentaire).' },
    },
    {
        key: 'celestial', name: 'Céleste', vo: 'Celestial', rarity: 'exotic', size: 'medium',
        text: 'Descendants d\'êtres divins, les célestes portent une aura de noblesse et de grâce. Leur lien inné avec les plans supérieurs leur permet de résister aux coups du sort et de tenir bon là où d\'autres faibliraient.',
        trait: { name: 'Haute naissance', vo: 'Highborn', text: 'Votre sauvegarde désavantagée est neutre à la place. Vous connaissez le céleste si votre INT n\'est pas négative.' },
        language: 'celestial',
        effects: { saves: 'disToNeutral' },
    },
    {
        key: 'changeling', name: 'Changelin', vo: 'Changeling', rarity: 'exotic', size: 'medium',
        text: 'Souvent chassés pour leur sang d\'argent, les changelins sont des survivants nés, qui se glissent avec aisance dans de nouvelles identités. Les changelins qui changent trop souvent de forme ne font généralement pas long feu : ils peinent parfois à se souvenir de qui ils étaient, jusqu\'à n\'être guère plus que le reflet des visages qu\'ils portent.',
        trait: { name: 'Nouveau lieu, nouveau visage', vo: 'New Place, New Face', text: '+2 points de compétence changeants. Vous prenez l\'apparence de n\'importe quelle ascendance (transformation en 10 min). Quand vous le faites, vous pouvez placer vos 2 points de compétence changeants dans 1 compétence de votre choix.' },
        effects: { shiftingPoints: 2 },
    },
    {
        key: 'dryad_shroomling', name: 'Dryade/Champignard', vo: 'Dryad/Shroomling', rarity: 'exotic', size: 'small|medium',
        text: 'Liés au monde naturel, les dryades et les champignards incarnent l\'équilibre entre la flore et la faune. Leur physiologie singulière libère des spores toxiques lorsqu\'ils sont blessés, une défense naturelle contre ceux qui osent leur faire du mal.',
        trait: { name: 'Pollen/Spores dangereux', vo: 'Danger Pollen/Spores', text: 'Chaque fois que vous subissez une ou plusieurs Blessures, vous exsudez des spores soporifiques : tous les ennemis adjacents sont étourdis. Vous connaissez l\'elfique si votre INT n\'est pas négative.' },
        language: 'elvish',
    },
    {
        key: 'half_giant', name: 'Demi-géant', vo: 'Half-Giant', rarity: 'exotic', size: 'large',
        text: 'Des êtres immenses dont la force est aussi inébranlable que les montagnes qu\'ils habitent. Leur taille et leur résistance en font des adversaires redoutables, capables de survivre même à des coups dévastateurs.',
        trait: { name: 'Force de la pierre', vo: 'Strength of Stone', text: '(1/rencontre) Forcez un ennemi à relancer un critique contre vous. +2 en Puissance. Vous connaissez le nain si votre INT n\'est pas négative (mais vous l\'appelez le géant, évidemment).' },
        uses: { count: '1', per: 'encounter' },
        language: 'dwarvish',
        effects: { skills: { might: 2 } },
    },
    {
        key: 'minotaur_beastfolk', name: 'Minotaure/Peuple-bête', vo: 'Minotaur/Beastfolk', rarity: 'exotic', size: 'medium',
        text: 'Les minotaures et les autres peuples-bêtes incarnent un lien primitif avec la Nature sauvage, alliant la force à une agilité naturelle. Leur constitution puissante leur permet de se déplacer vite, que ce soit pour déborder leurs ennemis ou pour charger avec une force irrésistible.',
        trait: { name: 'Charge', vo: 'Charge', text: 'Quand vous vous déplacez d\'au moins 4 cases, vous pouvez repousser de 1 case une créature sur votre chemin.' },
    },
    {
        key: 'crystalborn', name: 'Cristallide', vo: 'Crystalborn', rarity: 'exotic', size: 'medium',
        text: 'Formés de cristal vivant, les cristallides sont des êtres d\'une beauté éblouissante et d\'une robustesse surnaturelle. Leur corps translucide réfracte la lumière et le son, ce qui leur confère des capacités uniques au combat.',
        trait: { name: 'Aura réfléchissante', vo: 'Reflective Aura', text: '(1/rencontre) Quand vous vous Défendez, gagnez CLÉ en Défense et infligez CLÉ dégâts en retour à l\'attaquant (en ignorant sa Défense).' },
        uses: { count: '1', per: 'encounter' },
    },
    {
        key: 'oozeling_construct', name: 'Limonien/Automate', vo: 'Oozeling/Construct', rarity: 'exotic', size: 'small|medium',
        text: 'Mais c\'est quoi, des « GeNs », au juste ? Et alors, si votre cœur pompe de l\'huile au lieu du sang ? Et alors, si vous n\'avez même pas de cœur !? Si vous arrivez à vous tasser dans un pantalon, ou à manier une épée comme tout le monde, qui peut dire que vous n\'êtes pas des gEnS, vous aussi ?!',
        trait: { name: 'Constitution étrange', vo: 'Odd Constitution', text: 'Vos dés de vie augmentent d\'un cran (d4 » d6 » d8 » d10 » d12 » d20) ; ils vous soignent toujours du maximum. Les soins magiques vous soignent toujours du minimum.' },
        effects: { hitDieStep: 1 },
    },
    {
        key: 'planarbeing', name: 'Être planaire', vo: 'Planarbeing', rarity: 'exotic', size: 'medium',
        text: 'Vous n\'êtes pas de ce plan d\'existence : votre âme y est moins solidement attachée que celle des autres. Mais cette vulnérabilité s\'accompagne d\'un pouvoir, celui de passer temporairement d\'un plan à un autre en cas de besoin extrême.',
        trait: { name: 'Transfert planaire', vo: 'Planeshift', text: '–2 Blessures max. Chaque fois que vous vous Défendez, vous pouvez subir 1 Blessure pour sortir temporairement du plan matériel et ignorer tous les effets de l\'attaque.' },
        effects: { maxWounds: -2 },
    },
    {
        key: 'ratfolk', name: 'Raton', vo: 'Ratfolk', rarity: 'exotic', size: 'small',
        text: 'Les ratons sont des survivants qui prospèrent dans l\'ombre de la société, là où les autres n\'osent pas s\'aventurer. Agiles, débrouillards et farouchement loyaux envers les leurs, ils ont le don de transformer des bouts de rien en solutions.',
        trait: { name: 'Filer', vo: 'Scurry', text: 'Gagnez +2 en Défense si vous vous êtes déplacé lors de votre dernier tour. +1 Vitesse.' },
        effects: { speed: 1 },
    },
    {
        key: 'stoatling', name: 'Hermineau', vo: 'Stoatling', rarity: 'exotic', size: 'small',
        text: 'Les hermineaux sont peut-être petits, mais ils sont loin d\'être faibles. Avec une détermination farouche et un cœur de guerrier, ils sont capables d\'abattre des ennemis bien plus grands qu\'eux. Leur agilité et leur ténacité leur permettent d\'exploiter les faiblesses des ennemis plus grands, faisant de leur taille un avantage mortel.',
        trait: { name: 'Petit mais féroce', vo: 'Small But Ferocious', text: 'Chaque fois que vous faites une attaque à cible unique contre une créature plus grande que vous, lancez 1 d6 supplémentaire par catégorie de taille d\'écart. Elle fait de même.' },
    },
    {
        key: 'turtle_stonefolk', name: 'Tortuéen/Peuple-roc', vo: 'Turtle/Stonefolk', rarity: 'exotic', size: 'small|medium',
        text: 'Les tortuéens et le peuple-roc prennent leur temps en toute chose : ils sont patients, solides et lents à la colère. Ils comptent sur leur épaisse carapace pour se protéger, ce qui les rend difficiles à blesser, mais leurs mouvements prudents se paient en Vitesse.',
        trait: { name: 'Lent mais sûr', vo: 'Slow & Steady', text: '+4 en Défense, –2 Vitesse.' },
        effects: { defense: 4, speed: -2 },
    },
    {
        key: 'wyrdling', name: 'Wyrdelin', vo: 'Wyrdling', rarity: 'exotic', size: 'small',
        text: 'Imprévisibles et chaotiques, les wyrdelins sont le fruit d\'une magie qui a mal tourné. Leur corps palpite d\'une énergie arcanique brute, et leur simple présence perturbe souvent l\'équilibre de la magie autour d\'eux.',
        trait: { name: 'Déferlement chaotique', vo: 'Chaotic Surge', text: '(1/rencontre) Chaque fois que vous ou un allié consentant à Allonge 6 lancez un sort de rang, vous pouvez lui permettre de lancer un dé sur la table du Chaos.' },
        uses: { count: '1', per: 'encounter' },
    },
];

// Langues (p. 21) : tout héros parle le commun ; chaque point d'INT donne une langue de plus
export const LANGUAGES = [
    { key: 'common', name: 'Commun', vo: 'Common', speakers: 'La plupart des créatures intelligentes.' },
    { key: 'dwarvish', name: 'Nain', vo: 'Dwarvish', speakers: 'Nains, gnomes et géants.' },
    { key: 'elvish', name: 'Elfique', vo: 'Elvish', speakers: 'Elfes, fées et sylvains.' },
    { key: 'goblin', name: 'Gobelin', vo: 'Goblin', speakers: 'Gobelins et orcs.' },
    { key: 'infernal', name: 'Infernal', vo: 'Infernal', speakers: 'Démons divers et cultistes.' },
    { key: 'thieves_cant', name: 'Argot des voleurs', vo: 'Thieves’ Cant', speakers: 'Canailles et vauriens.' },
    { key: 'celestial', name: 'Céleste', vo: 'Celestial', speakers: 'Célestes et prêtres.' },
    { key: 'draconic', name: 'Draconique', vo: 'Draconic', speakers: 'Dragons, drakéides et kobolds.' },
    { key: 'primordial', name: 'Primordial', vo: 'Primordial', speakers: 'Élémentaires et êtres anciens.' },
    { key: 'deep_speak', name: 'Langue des profondeurs', vo: 'Deep Speak', speakers: 'Habitants des mondes souterrains.' },
];

// Règle des langues (p. 21) et encadré « GROFWINT DRAZLON! »
export const LANGUAGES_TEXT = 'Tous les héros parlent le commun par défaut. Chaque point d\'INT vous donne une langue connue supplémentaire.';
export const LANGUAGES_NOTE = { title: 'GROFWINT DRAZLON !', vo: 'GROFWINT DRAZLON!', text: 'Être lourdement armé sans pouvoir communiquer mène souvent à l\'hostilité : parler la langue d\'une autre créature peut ouvrir des portes que les armes seules n\'ouvriraient pas.' };

// Encadrés des pages d'ascendances (p. 23-24)
export const FLAVOR_NOTES = [
    {
        key: 'half_elves', rarity: 'common', title: 'Et les demi-elfes ?', vo: 'What About Half-Elves?',
        text: 'Mélangez les ascendances de la façon qui a du sens dans votre monde. Vous pouvez choisir un seul bonus d\'ascendance et l\'utiliser à la place des deux, ou utiliser les deux à moitié moins efficacement ou à moitié moins souvent.',
    },
    {
        key: 'flavor_is_free_common', rarity: 'common', title: 'L\'habillage est libre', vo: 'Flavor Is Free',
        text: 'Envie de jouer un halfelin Robuste plutôt qu\'Insaisissable ? Un humain Optimiste plutôt que Tenace ? Tant que cela a du sens et que le MJ est d\'accord, allez-y !',
    },
    {
        key: 'flavor_is_free_uncommon', rarity: 'uncommon', title: 'L\'habillage est libre', vo: 'Flavor Is Free',
        text: 'Envie d\'être un peuple-grenouille bondissant plutôt qu\'un lapinou ? Un kobold Né des flammes ? Une fée ailée plutôt qu\'un avien ? Un peuple-blaireau plutôt qu\'un hermineau ? Tant que cela a du sens et que votre MJ est partant, allez-y !',
    },
];

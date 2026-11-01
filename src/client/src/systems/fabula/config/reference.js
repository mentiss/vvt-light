// src/client/src/systems/fabula/config/reference.js
// ─────────────────────────────────────────────────────────────────────────────
// Contenu de l'onglet Référence (documentations/spec_fabula_reference.md §5.3).
// Textes repris des specs validées (specifications_fonctionnelles_fabula_ultima.md,
// fabula_ultima_conception_des_objets_rare.md), qui priment : leurs écarts avec
// le livre sont des règles de la table. Le livre de base complète seulement ce
// qu'elles n'ont pas (projets, Version améliorée, conception des objets,
// conseils sur les cadrans) ; errata 06/2024 appliqué.
//
// Section : { id, title, gm?, blocks }   (gm : badge « MJ », visible de tous)
// Bloc    : { type: 'heading', text }
//           { type: 'text', text }
//           { type: 'list', items: [string] }
//           { type: 'table', columns: [string], rows: [[string]] }
//           { type: 'projectTables' | 'projectCalculator', keywords }
//             → rendus par ReferenceTab à partir de config/projects.js
// ─────────────────────────────────────────────────────────────────────────────

export const REFERENCE_SECTIONS = [
    // ── 1. Tests ─────────────────────────────────────────────────────────────
    {
        id: 'tests', title: 'Tests',
        blocks: [
            { type: 'text', text: 'Le MJ choisit deux attributs (identiques ou non, ex. 【INT + INT】 ou 【DEX + PUI】). On lance les deux dés correspondants : résultat = somme des deux dés + modificateurs. L’action réussit si le résultat atteint le niveau de difficulté (ND). Position avantageuse ou handicapante : +2 ou −2.' },
            {
                type: 'table', columns: ['ND', 'Difficulté', 'Qui peut y arriver ?'],
                rows: [
                    ['7',  'Facile',         'N’importe qui ayant un peu d’entraînement ou de talent inné.'],
                    ['10', 'Normale',        'Une personne compétente ou naturellement très douée.'],
                    ['13', 'Difficile',      'Un expert ou un prodige.'],
                    ['16', 'Très difficile', 'Un des meilleurs dans ce domaine.'],
                ],
            },
            { type: 'text', text: 'Valeur haute (VH) : le plus haut des deux dés, avant modificateurs. Elle sert aux dégâts des armes et des sorts et aux soins.' },
            { type: 'heading', text: 'Résultats spéciaux' },
            {
                type: 'list', items: [
                    'Réussite critique : les deux dés donnent le même nombre, 6 ou plus (double 6 à double 12). Test réussi d’office, et vous obtenez une aubaine.',
                    'Échec critique : double 1. Échec d’office, et vous gagnez immédiatement 1 Point Fabula. Le MJ peut appliquer une complication narrative mineure, ou une aubaine en scène de conflit.',
                ],
            },
            { type: 'heading', text: 'Aubaines' },
            {
                type: 'table', columns: ['Aubaine', 'Effet'],
                rows: [
                    ['Affliction',        'Une créature est étourdie, traumatisée, ralentie ou affaiblie.'],
                    ['Avantage',          'Le prochain test effectué par vous ou un allié bénéficie d’un bonus de +4.'],
                    ['Démasqué !',        'Vous apprenez les objectifs et les mobiles d’une créature de votre choix.'],
                    ['Évaluation',        'Vous découvrez une vulnérabilité ou un trait d’une créature que vous pouvez voir.'],
                    ['Faux pas',          'Une créature présente dans la scène fait une déclaration compromettante choisie par la personne qui l’interprète.'],
                    ['Faveur',            'Votre comportement vous vaut le soutien ou l’admiration de quelqu’un.'],
                    ['Information',       'Vous repérez un indice ou un détail utile ; le MJ vous dit de quoi il s’agit ou vous demande de le décrire.'],
                    ['Lien',              'Vous créez un lien avec quelqu’un ou quelque chose, ou ajoutez une émotion à un lien existant.'],
                    ['Objet perdu',       'Un objet est détruit, perdu, volé ou abandonné.'],
                    ['Progression',       'Vous remplissez ou effacez jusqu’à deux sections d’un Cadran.'],
                    ['Rebondissement !',  'Quelqu’un ou quelque chose que vous choisissez apparaît soudain dans la scène.'],
                ],
            },
            { type: 'heading', text: 'États' },
            {
                type: 'table', columns: ['État', 'Effet'],
                rows: [
                    ['Étourdi',    'Dé d’INT réduit d’un cran.'],
                    ['Enragé',     'Dés de DEX et d’INT réduits d’un cran.'],
                    ['Ralenti',    'Dé de DEX réduit d’un cran.'],
                    ['Traumatisé', 'Dé de VOL réduit d’un cran.'],
                    ['Affaibli',   'Dé de PUI réduit d’un cran.'],
                    ['Empoisonné', 'Dés de PUI et de VOL réduits d’un cran.'],
                ],
            },
            { type: 'text', text: 'Un dé ne descend jamais sous d6. Le même état appliqué deux fois ne se cumule pas.' },
        ],
    },

    // ── 2. Conflits ──────────────────────────────────────────────────────────
    {
        id: 'conflits', title: 'Conflits',
        blocks: [
            { type: 'heading', text: 'Déroulement' },
            {
                type: 'list', items: [
                    'Initiative (début du conflit) : jet d’initiative de groupe des PJ, généralement 【DEX + INT】, contre la plus haute initiative parmi les PNJ présents. Réussi : le camp des PJ commence la manche (les joueurs choisissent qui ouvre) ; raté : le camp des PNJ commence (le MJ choisit).',
                    'Alternance stricte : un personnage d’un camp agit, puis un de l’autre camp, et ainsi de suite. Quand le camp le moins nombreux a joué tous ses tours, l’autre joue les siens d’affilée.',
                    'Un seul tour par manche et par personnage (sauf PNJ de rang Champion), une seule action par tour.',
                    'Le conflit se termine quand tous les membres d’un camp sont hors de combat (0 PV) ou ont fui.',
                ],
            },
            { type: 'heading', text: 'Actions' },
            {
                type: 'table', columns: ['Action', 'Effet'],
                rows: [
                    ['Analyse',     'Obtenir une information sur quelque chose ou quelqu’un, en général par un test ouvert d’【INT + INT】.'],
                    ['Attaque',     'Attaque au corps à corps ou à distance.'],
                    ['Compétence',  'Utiliser une compétence qui demande une action.'],
                    ['Équipement',  'Échanger autant d’objets équipés que voulu contre d’autres du sac à dos (pas les armures).'],
                    ['Garde',       'Jusqu’au début de votre prochain tour : résistance à tous les types de dégâts, +2 aux tests opposés, et vous pouvez couvrir une créature contre les attaques de corps à corps.'],
                    ['Gêne',        'Test (ND 10) contre un adversaire ; en cas de réussite, il devient étourdi, traumatisé, ralenti ou affaibli.'],
                    ['Inventaire',  'Dépenser des Points d’Inventaire pour sortir et utiliser aussitôt un objet consommable.'],
                    ['Objectif',    'Viser un objectif précis par un test d’attribut ou un test opposé ; les objectifs complexes passent souvent par un Cadran.'],
                    ['Sort',        'Lancer un des sorts appris.'],
                    ['Autre',       'Toute autre action, résolution négociée avec le MJ.'],
                ],
            },
            { type: 'heading', text: 'À 0 Point de Vie' },
            {
                type: 'list', items: [
                    'Personnage joueur : il choisit entre le Sacrifice et la Défaite.',
                    'Le Sacrifice : le PJ meurt définitivement, mais accomplit un exploit narratif majeur (gagner le combat pour son groupe, détruire un artefact, sauver tout le monde). Réservé aux moments clés.',
                    'La Défaite (hors de combat) : le PJ survit mais s’évanouit ou est capturé ; le MJ applique une conséquence négative (perte d’équipement, fuite du Méchant, capture). Se rendre rapporte 2 Points Fabula.',
                    'Méchant : il peut dépenser 1 Point Ultima pour s’enfuir de la scène ; s’il n’en a plus, il meurt définitivement ou est capturé, au choix des joueurs.',
                ],
            },
        ],
    },

    // ── 3. Bricoleur ─────────────────────────────────────────────────────────
    {
        id: 'bricoleur', title: 'Bricoleur',
        blocks: [
            { type: 'text', text: 'Atouts gratuits : maximum de Points d’Inventaire +2 ; vous pouvez démarrer des projets.' },

            { type: 'heading', text: 'Inventions : les projets' },
            {
                type: 'list', items: [
                    '1. Décrivez l’invention : effets, fonctionnement, énergie nécessaire, avantages. Le MJ décide si elle est faisable.',
                    '2. Le MJ peut diviser une invention complexe (ex. moto qui est aussi une arme) en plusieurs projets, chacun développé à part.',
                    '3. Le MJ calcule le coût total en matériaux (tables ci-dessous), payé immédiatement. Dès la puissance moyenne, il impose aussi un ingrédient ou matériau spécial introuvable dans le commerce, à chercher pendant une ou deux séances.',
                    '4. Vous pouvez négocier un grave défaut (recharges régulières, peu fiable, encombrante, bruyante…) : −25 % sur le coût total.',
                    '5. Points de Progression requis : 1 par tranche de 100 z de coût (minimum 1). Chaque jour : +1 par PJ qui a travaillé sur le projet, +1 de plus s’il a au moins un niveau de Bricoleur.',
                    '6. Le total atteint, l’invention est fabriquée ; si la journée produit plus que nécessaire, elle est prête en quelques heures.',
                ],
            },
            { type: 'projectTables', keywords: 'puissance zone utilisation coût dégâts soins protection résistance immunité quantité niveau mineure moyenne majeure extrême individuelle petite grande immense consommable permanente' },
            {
                type: 'list', items: [
                    'Évitez les inventions qui confèrent l’immunité aux dégâts physiques.',
                    'Une invention aux effets multiples (ex. une résistance et des dégâts) se sépare en plusieurs projets.',
                    'Matériaux : des matériaux précieux trouvés en aventure peuvent payer le projet, à la discrétion du MJ, sauf l’ingrédient spécial exigé à l’étape 3.',
                    'Assistants : chacun demande un salaire égal à la moitié du coût total du projet et génère +1 Point de Progression par jour.',
                    'Les projets servent à des créations uniques, pas à fabriquer de l’équipement qu’on peut trouver ou acheter. Chaque exemplaire est un projet distinct. Pour de l’équipement sur mesure : Version améliorée.',
                    'Les projets prennent du temps : les Méchants n’attendent pas. Les scènes d’interlude se prêtent bien à leur développement.',
                ],
            },
            { type: 'projectCalculator', keywords: 'calculateur calcul projet coût zénits points de progression jours visionnaire assistants' },

            { type: 'heading', text: 'Gadgets' },
            { type: 'text', text: 'À la première prise de Gadgets (NC max 5), choisissez un type : alchimie, inoculation ou technomagie, et recevez ses atouts de base. À chaque reprise : atouts de base d’un nouveau type, ou atouts avancés d’un type déjà possédé en base, ou atouts supérieurs d’un type déjà possédé en avancé.' },
            { type: 'heading', text: 'Alchimie' },
            { type: 'text', text: 'Action Inventaire : confectionnez une potion puissante mais imprévisible. Lancez les d20 du mélange, affectez un résultat à la table des cibles et un autre à la table des effets, ignorez le reste. Les deux effets « Tous » sont toujours disponibles.' },
            {
                type: 'table', columns: ['Mélange', 'Coût', 'Dés'],
                rows: [
                    ['De base',   '3 PI', 'Lancez deux d20'],
                    ['Avancé',    '4 PI', 'Lancez trois d20'],
                    ['Supérieur', '5 PI', 'Lancez quatre d20'],
                ],
            },
            {
                type: 'table', columns: ['d20', 'La potion affecte…'],
                rows: [
                    ['1-6',   '… vous-même ou un allié présent dans la scène que vous voyez.'],
                    ['7-11',  '… un ennemi présent dans la scène que vous voyez.'],
                    ['12-16', '… vous et tous les alliés présents dans la scène.'],
                    ['17-20', '… tous les ennemis présents dans la scène.'],
                ],
            },
            {
                type: 'table', columns: ['d20', 'Chaque créature affectée…'],
                rows: [
                    ['Tous',  '… subit 20 dégâts de poison.'],
                    ['Tous',  '… récupère 30 Points de Vie.'],
                    ['1',     '… a ses dés de DEX et de PUI augmentés d’un cran (max d12) jusqu’à la fin de son prochain tour.'],
                    ['2',     '… a ses dés d’INT et de VOL augmentés d’un cran (max d12) jusqu’à la fin de son prochain tour.'],
                    ['3',     '… subit 20 dégâts d’air (30 au niveau 20+, 40 au niveau 40+).'],
                    ['4',     '… subit 20 dégâts de foudre (30 au niveau 20+, 40 au niveau 40+).'],
                    ['5',     '… subit 20 dégâts de ténèbres (30 au niveau 20+, 40 au niveau 40+).'],
                    ['6',     '… subit 20 dégâts de terre (30 au niveau 20+, 40 au niveau 40+).'],
                    ['7',     '… subit 20 dégâts de feu (30 au niveau 20+, 40 au niveau 40+).'],
                    ['8',     '… subit 20 dégâts de glace (30 au niveau 20+, 40 au niveau 40+).'],
                    ['9',     '… bénéficie d’une résistance aux dégâts d’air et de feu jusqu’à la fin de la scène.'],
                    ['10',    '… bénéficie d’une résistance aux dégâts de foudre et de glace jusqu’à la fin de la scène.'],
                    ['11',    '… bénéficie d’une résistance aux dégâts de ténèbres et de terre jusqu’à la fin de la scène.'],
                    ['12',    '… subit l’état enragé.'],
                    ['13',    '… subit l’état empoisonné.'],
                    ['14',    '… subit les états étourdi, traumatisé, ralenti et affaibli.'],
                    ['15',    '… se débarrasse de tous les états.'],
                    ['16-17', '… récupère 50 Points de Vie et 50 Points de Magie.'],
                    ['18',    '… récupère 100 Points de Vie.'],
                    ['19',    '… récupère 100 Points de Magie.'],
                    ['20',    '… récupère 100 Points de Vie et 100 Points de Magie.'],
                ],
            },
            { type: 'heading', text: 'Inoculation' },
            { type: 'text', text: 'Quand une de vos attaques touche, dépensez 2 PI pour appliquer une inoculation (à chaque cible si l’attaque a la propriété multi). Une seule inoculation par attaque ; la produire et l’utiliser font partie de l’action d’attaque.' },
            {
                type: 'table', columns: ['Inoculation', 'Niveau', 'Effet'],
                rows: [
                    ['Cryo',       'De base',    '+5 dégâts, type glace.'],
                    ['Pyro',       'De base',    '+5 dégâts, type feu.'],
                    ['Volt',       'De base',    '+5 dégâts, type foudre.'],
                    ['Cyclone',    'Avancée',    '+5 dégâts, type air.'],
                    ['Exorcisme',  'Avancée',    '+5 dégâts, type lumière.'],
                    ['Séisme',     'Avancée',    '+5 dégâts, type terre.'],
                    ['Ombre',      'Avancée',    '+5 dégâts, type ténèbres.'],
                    ['Vampire',    'Supérieure', 'Vous récupérez des PV ou des PM égaux à la moitié des PV perdus par la cible. Attaque sur une seule créature uniquement.'],
                    ['Venin',      'Supérieure', '+5 dégâts, type poison, et chaque créature touchée devient empoisonnée.'],
                ],
            },
            { type: 'heading', text: 'Technomagie' },
            {
                type: 'list', items: [
                    'Prise de contrôle (de base) : une action et 10 PM, test d’【INT + INT】 opposé contre une créature artificielle de rang soldat proche que vous voyez. Réussite : vous la contrôlez jusqu’à la fin de la scène (une seule à la fois). Elle est libérée si vous ou un allié lui faites du mal, et peut alors se retourner contre vous.',
                    'Magicanon (avancé) : action Inventaire et 3 PI pour créer une arme à feu 【DEX + INT】+1, 【VH + 10】, deux mains, distance, aucune qualité. Au moment de la créer, choisissez son type de dégâts : air, foudre, terre, feu, glace ou physiques. Elle tombe en morceaux quand vous en créez une nouvelle.',
                    'Magisphère (supérieur) : trois prototypes, chacun reproduisant un sort d’Élémentaliste, d’Entropiste ou de Spirite (deux de plus au niveau 20, deux autres au niveau 40). Action Inventaire et 2 PI : créez une magisphère et lancez aussitôt gratuitement l’action Sort pour un de ces sorts, aux règles ordinaires (coût en PM, test de magie). La magisphère est détruite après usage.',
                ],
            },

            { type: 'heading', text: 'Compétences liées' },
            {
                type: 'table', columns: ['Compétence', 'NC max', 'Effet'],
                rows: [
                    ['Accessoire d’urgence', '1', 'Une fois par scène de conflit, en Crise : une action supplémentaire à votre tour, forcément l’action Inventaire.'],
                    ['Formule secrète',      '5', 'Potion ou magisphère qui restaure des PV et/ou PM : +NC × 5 points restaurés. Fragment élémentaire, potion ou magisphère qui inflige des dégâts : +NC dégâts.'],
                    ['Pluie de potions',     '2', 'Potion qui restaure les PV et/ou PM d’une seule créature : étendez-la à NC créatures de plus ; chacune ne récupère alors que la moitié.'],
                    ['Visionnaire',          '5', 'Sur un projet : jusqu’à NC × 100 z de matériaux payés automatiquement, et +NC Points de Progression par jour. Plusieurs Visionnaires sur le même projet : les effets se cumulent.'],
                ],
            },

            { type: 'heading', text: 'Améliorer un objet' },
            {
                type: 'list', items: [
                    'Version améliorée (compétence héroïque, Bricoleur maîtrisé) : une fois par repos, ajoutez une qualité à une arme, une armure ou un bouclier qui n’en a pas, ou remplacez sa qualité. Qualité de la liste par défaut pour ce type d’objet, à +1 000 z au plus ; dépensez le double de son coût. L’objet est prêt à la fin du repos, un seul objet par repos.',
                    'Acheter des qualités (règle optionnelle, acquise d’office avec Version améliorée) : un forgeron ou un artisan ajoute ou remplace la qualité d’une arme, armure ou bouclier, aux mêmes conditions (qualité par défaut à +1 000 z au plus, double du coût), en un jour par objet. Un objet n’a qu’une qualité ; plusieurs personnages peuvent mettre leur argent en commun.',
                    'Exemple : remplacer la qualité d’une arme par Multi coûte 2 000 z, par Résistance 1 400 z.',
                ],
            },
        ],
    },

    // ── 4. Objets rares ──────────────────────────────────────────────────────
    {
        id: 'objets-rares', title: 'Objets rares', gm: true,
        blocks: [
            { type: 'text', text: 'Le MJ peut choisir un objet rare existant ou en créer un nouveau. Un objet rare devrait raconter sa propre histoire : lieu de découverte, origine, nature.' },
            {
                type: 'list', items: [
                    'Attention aux bonus : les bonus aux tests de précision ou de magie et à la Défense ou Défense magique sont très puissants. Un personnage ne devrait pas porter plus de deux objets de ce genre à la fois, ou alors des options qui s’excluent.',
                    'Évitez de copier un sort ou une compétence de classe : préférez des objets en synergie avec les compétences des personnages.',
                    'Objet trop puissant : n’en privez pas le groupe et ne le rendez pas inutile ; expliquez l’erreur aux joueurs et ajustez ensemble.',
                ],
            },
            { type: 'heading', text: 'Concevoir une arme rare' },
            {
                type: 'list', items: [
                    '1. Partez d’une arme de base (sauf main nue et armes improvisées).',
                    '2. Dégâts d’un autre type que physiques (air, foudre, ténèbres, terre, feu, glace, lumière, poison) : +100 z.',
                    '3. Modifications au choix : deux mains → une main, dégâts −4 ; une main → deux mains (sauf lutte, dague, jet), dégâts +4 ; +1 en précision : +100 z (pas si l’arme a déjà un bonus de précision) ; +4 dégâts : +200 z ; changer les attributs du test de précision (deux attributs identiques : +50 z de plus que deux différents).',
                    '4. Ajoutez une seule qualité, de la table ci-dessous ou sur mesure (prix variable).',
                    'Une arme dont le modificateur de dégâts final atteint +10 devient automatiquement martiale.',
                ],
            },
            { type: 'heading', text: 'Armures, boucliers et accessoires' },
            {
                type: 'list', items: [
                    'Armure ou bouclier rare : un objet de base auquel on ajoute une qualité, qui augmente son prix du coût indiqué.',
                    'Accessoire : choisissez la capacité qu’il octroie (table ou sur mesure) ; son prix est celui de sa qualité. Les meilleurs accessoires ont des effets un peu excentriques.',
                ],
            },
            { type: 'heading', text: 'Qualités par défaut' },
            { type: 'text', text: 'Défensives : tout type d’objet. Offensives : armes seulement. Amélioration : armures et accessoires.' },
            {
                type: 'table', columns: ['Qualité', 'Type', 'Coût', 'Effet'],
                rows: [
                    ['Anti-état',            'Défensive',    '+500 z',   'Immunité à l’effet d’un seul état.'],
                    ['Résistance',           'Défensive',    '+700 z',   'Résistance à un type de dégâts (sauf physiques).'],
                    ['Amulette',             'Défensive',    '+800 z',   '+1 en Défense magique.'],
                    ['Rempart',              'Défensive',    '+800 z',   '+1 en Défense.'],
                    ['Brise-lame',           'Défensive',    '+1 000 z', 'Résistance aux dégâts physiques.'],
                    ['Résistance double',    'Défensive',    '+1 000 z', 'Résistance à deux types de dégâts (sauf physiques).'],
                    ['Immunité',             'Défensive',    '+1 500 z', 'Immunité à un type de dégâts (sauf physiques).'],
                    ['Omnibouclier',         'Défensive',    '+2 000 z', '+1 en Défense et en Défense magique.'],
                    ['Santé absolue',        'Défensive',    '+2 000 z', 'Immunité à tous les effets d’états.'],
                    ['Magique',              'Offensive',    '+100 z',   'L’arme attaque la Défense magique au lieu de la Défense.'],
                    ['Chasseresse',          'Offensive',    '+300 z',   '+5 dégâts contre les créatures d’une espèce.'],
                    ['Perforante',           'Offensive',    '+400 z',   'Les dégâts de l’arme ignorent les résistances.'],
                    ['Chasseresse double',   'Offensive',    '+500 z',   '+5 dégâts contre les créatures de deux espèces.'],
                    ['Multi',                'Offensive',    '+1 000 z', 'Les attaques de l’arme ont la propriété multi (2).'],
                    ['État',                 'Offensive',    '+1 500 z', 'Chaque cible touchée subit un état parmi étourdi, traumatisé, ralenti, affaibli.'],
                    ['État plus',            'Offensive',    '+2 000 z', 'Chaque cible touchée subit un état parmi enragé, empoisonné.'],
                    ['Gain d’initiative',    'Amélioration', '+500 z',   '+4 au modificateur d’initiative.'],
                    ['Gain de magie',        'Amélioration', '+1 000 z', '+1 aux tests de magie.'],
                    ['Gain de précision',    'Amélioration', '+1 000 z', '+1 aux tests de précision.'],
                    ['Gain de vitalité',     'Amélioration', '+1 000 z', 'Quand vous regagnez des PV, 5 de plus.'],
                    ['Gain de soin',         'Amélioration', '+1 500 z', 'Vos sorts qui redonnent des PV en redonnent 5 de plus.'],
                    ['Gain d’armement',      'Amélioration', '+2 000 z', 'Vos attaques avec les armes (corps à corps ou distance, au choix) infligent 5 dégâts de plus.'],
                    ['Gain d’incantation',   'Amélioration', '+2 000 z', 'Vos sorts infligent 5 dégâts de plus.'],
                    ['Changement de dégâts', 'Amélioration', '+300 z',   'Tous les dégâts de vos armes, sorts et compétences prennent un type choisi.'],
                ],
            },
        ],
    },

    // ── 5. Points Fabula et Ultima ───────────────────────────────────────────
    {
        id: 'points', title: 'Points Fabula et Ultima',
        blocks: [
            { type: 'heading', text: 'Gagner des Points Fabula' },
            {
                type: 'list', items: [
                    'En début de partie, un personnage qui n’en a plus aucun en reçoit 1.',
                    'Échec critique : +1.',
                    'Un Méchant fait son entrée officielle dans une scène : +1.',
                    'Invoquer un lien ou un trait pour rater volontairement un test : +1.',
                    'Tomber à 0 PV et se rendre : +2.',
                ],
            },
            { type: 'heading', text: 'Dépenser des Points Fabula' },
            {
                type: 'table', columns: ['Effet', 'Coût', 'Description'],
                rows: [
                    ['Invoquer un trait',       '1 PF',     'Après un test, relancez un dé ou les deux et gardez le nouveau résultat. Chaque relance supplémentaire coûte 1 PF. Impossible après un échec critique.'],
                    ['Invoquer un lien',        '1 PF',     'Après le jet, ajoutez l’intensité d’un lien au résultat.'],
                    ['Modifier le récit',       '1 PF',     'Altérer un élément existant ou en ajouter un.'],
                    ['Utiliser une compétence', 'Variable', 'Compétences qui demandent des Points Fabula.'],
                ],
            },
            { type: 'heading', text: 'Points Ultima (Méchants)' },
            {
                type: 'table', columns: ['Méchant', 'Points Ultima', 'Exemples'],
                rows: [
                    ['Mineur',  '5',  'Commandants ennemis, monstres uniques, antagonistes qui sèment le chaos dans de petites localités.'],
                    ['Majeur',  '10', 'Tyrans, puissants mages, créatures légendaires, entités menaçant des pays entiers.'],
                    ['Suprême', '15', 'Archidémons, entités immortelles, divinités vouées à détruire ou dominer le monde.'],
                ],
            },
            {
                type: 'table', columns: ['Dépense (1 PU)', 'Effet'],
                rows: [
                    ['Fuite',              'À 0 PV, le Méchant s’enfuit de la scène en sécurité (téléportation, effondrement, diversion) et survit pour menacer le groupe plus tard. Sans Point Ultima, il meurt définitivement ou est capturé, au choix des joueurs.'],
                    ['Invocation de trait', 'Relancer ses dés lors d’une attaque ou d’un test manqué en invoquant un trait.'],
                    ['Récupération',       'Purger toutes les altérations d’état qui l’affectent et récupérer 50 PM en plein combat.'],
                ],
            },
        ],
    },

    // ── 6. Cadrans ───────────────────────────────────────────────────────────
    {
        id: 'cadrans', title: 'Cadrans',
        blocks: [
            { type: 'text', text: 'Un Cadran suit une situation complexe, une menace imminente ou un objectif à long terme. Il a un titre, un nombre pair de sections (généralement 4, 6, 8, 10 ou 12 : plus il y en a, plus l’objectif demande de temps ou d’efforts) et un sens : remplissage (commence vide) ou compte à rebours (commence plein).' },
            { type: 'heading', text: 'Faire avancer un Cadran' },
            {
                type: 'list', items: [
                    'Action Objectif : test d’attribut adapté contre une difficulté fixée par le MJ. Succès : 1 section ; succès critique ou grande réussite : 2 sections ou plus, selon le MJ.',
                    'Opportunités (double aux dés) : dépensée sur n’importe quel jet, elle coche ou décoche 1 section d’un Cadran actif de la scène.',
                    'Actions de scénario : en fin de manche ou sur une capacité de PNJ, le MJ peut faire progresser un Cadran d’un nombre fixe de sections.',
                ],
            },
            { type: 'heading', text: 'Déclenchement' },
            {
                type: 'list', items: [
                    'Dernière section cochée (ou vidée en compte à rebours) : l’effet se déclenche immédiatement, quitte à interrompre l’action en cours.',
                    'Cadrans de menace : renforts ennemis, effondrement du décor, statut négatif global. Cadrans d’objectif : victoire alternative, porte scellée ouverte, piège neutralisé.',
                    'Une fois résolu, le Cadran est archivé.',
                ],
            },
            { type: 'heading', text: 'Conseils (livre de base)' },
            {
                type: 'list', items: [
                    'Point de non-retour : le MJ annonce quand le but devient impossible (un test raté, ou un Cadran d’échec).',
                    'En conflit, un Cadran par camp ou par participant suit les objectifs (action Objectif).',
                    'Compteurs de temps : un Cadran qui rythme l’urgence (ex. 4 sections pour 4 jours), que les tests ne font pas avancer directement.',
                ],
            },
        ],
    },
];

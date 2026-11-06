// Imperium Maledictum : pouvoirs psychiques.
// Sources : livre de base (source 'core'), ch. VI, p.166-184 (71 pouvoirs : 21 mineurs, puis 10 par
// discipline) ; Inquisition Player's Guide (source 'ipg'), ch. IV, p.68-75 (20 pouvoirs).
// Règles d'accès : Talent Psyker, core p.114. Châtiment connu de tous : core p.166.
//
// Champs :
//   discipline : 'minor' | 'biomancy' | 'divination' | 'pyromancy' | 'telekinesis' | 'telepathy'
//   overt      : astérisque après le nom dans le livre (pouvoir Manifeste)
//   warpRating : Indice Warp ; difficulty : modificateur du Test de Manifestation (Maîtrise psychique)
//   range      : 'self' | 'immediate' | 'short' | 'medium' | 'long' | 'special', ou texte pour les portées composées
//   duration   : 'instant' | 'sustained' | 'permanent' | 'special', ou texte pour les durées chiffrées
//   spec       : discipline dont la spécialisation de Maîtrise psychique s'applique au Test de Manifestation
//                (mention « Specialisation in X applies » des pouvoirs mineurs ; la discipline elle-même sinon)
//   table      : sous-table du pouvoir, lignes { min, max, effect } en DR (max null = « ou plus »), cumulatives
//                sauf mention contraire
//
// Rattachements vérifiés sur la page en image : Lull (core p.171, colonne de gauche avant le titre
// « Biomancy » : mineur), Immolation Directive (ipg p.69, avant « Biomancy » p.70 : mineur), Pathfinder
// (ipg p.72, colonne de gauche avant le titre « Pyromancy » : Divination).
//
// À relire :
// - Mark et Psychic Blade (ipg) : difficulté imprimée « Average (+20) », absente de l'échelle du livre de
//   base ; notée 20 (équivalent de Routinier).
// - Induce Panic (ipg p.70) : portée Moyenne dans le bloc de profil, mais le texte dit « within Short Range ».
// - Psychic Maelstrom (core p.181) : le texte dit « Until the start of your turn » (et non « next turn »),
//   transcrit tel quel.
// - Terrifying Visions (core p.184) : état « Terrified », absent du glossaire et de la liste des États
//   (probablement Effrayé / Frightened) ; gardé en VO entre parenthèses.
// - Spécialisations hors glossaire traduites ici : Fortitude (Endurance) → Robustesse (Endurance), Fortitude
//   (Pain) → Robustesse (Douleur), Athletics (Might) → Athlétisme (Puissance), Discipline (Fear / Psychic) →
//   Discipline (Peur / Psychique), Dexterity (Sleight of Hand) → Dextérité (Escamotage).
// - Traits de Zone et d'environnement traduits ici (Difficult Terrain, Lightly / Heavily Obscured, Burning,
//   Minor / Major / Deadly Hazard, Warp-Touched, Dark, Poorly Lit) : VO entre parenthèses dans le résumé.
// - Cauterise : la liste d'États retirés est écrite « Bleeding, Frightened, Stunned, or Unconscious » ;
//   lue comme « ces États » (tous).

export const POWER_RULES = {
    // Tout psyker connaît Châtiment (core p.166)
    knownByAll: ['smite'],
    // Talent Psyker (core p.114) : 1 pouvoir mineur et 1 pouvoir d'une discipline choisie à la prise ;
    // ensuite 60 XP par pouvoir mineur, 100 XP par pouvoir d'une discipline acquise.
    // Le Talent se reprend jusqu'à BFM fois, chaque fois une nouvelle discipline et un de ses pouvoirs.
    xpCost: { minor: 60, discipline: 100 },
};

export const POWERS = [
    // ───────────── Pouvoirs mineurs (core p.166-171) ─────────────
    {
        key: 'call_vermin', label: 'Appel de la vermine', labelEn: 'Call Vermin', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 0, range: 'medium', target: 'Spécial', duration: 'sustained', spec: 'telepathy',
        source: 'core', page: 166,
        summary: 'Vous prenez le contrôle de la vermine alentour (sans la voir), en un essaim qui remplit une Zone à portée Moyenne : Terrain difficile s\'il rampe, Légèrement obscurci s\'il vole ; une fois par tour, en Action gratuite, vous le déplacez dans une Zone adjacente à portée Longue de vous. Variante : une seule bête apparaît à portée Moyenne et exécute une tâche simple (Action gratuite une fois par tour) ; contrôle perdu au-delà de la portée Moyenne, aucune communication.',
    },
    {
        key: 'combustion', label: 'Combustion', labelEn: 'Combustion', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 20, range: 'medium', target: '1 objet', duration: 'instant', spec: 'pyromancy',
        source: 'core', page: 167,
        summary: 'Un objet inflammable à portée Moyenne prend feu et brûle normalement. S\'il est tenu ou porté, la créature doit le lâcher ou l\'ôter avant la fin de son prochain tour, sinon elle est En feu jusqu\'à ce qu\'elle ou une créature à portée de Contact l\'éteigne par une Action.',
    },
    {
        key: 'dread_presence', label: 'Présence terrifiante', labelEn: 'Dread Presence', discipline: 'minor', overt: true,
        warpRating: 2, difficulty: 0, range: 'self', target: 'Votre Zone', duration: 'sustained', spec: 'telepathy',
        source: 'core', page: 167,
        summary: 'Jusqu\'au début de votre prochain tour, la première fois par round qu\'un ennemi entre dans votre Zone ou y commence son tour, il doit gagner un Test Exigeant (+0) de Discipline (Peur) opposé à votre Test de Manifestation, sinon il est Effrayé de vous jusqu\'au début de son prochain tour. Une créature qui gagne est immunisée au pouvoir pendant 1 heure.',
    },
    {
        key: 'dull_pain', label: 'Douleur assourdie', labelEn: 'Dull Pain', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 20, range: 'short', target: 'DR créatures', duration: 'sustained', spec: 'biomancy',
        source: 'core', page: 167,
        summary: 'Jusqu\'à DR créatures (vous compris) à portée Courte ne ressentent plus la douleur jusqu\'au début de votre prochain tour, et leur BE augmente de 1 pour réduire les Dégâts.',
    },
    {
        key: 'float', label: 'Lévitation', labelEn: 'Float', discipline: 'minor', overt: true,
        warpRating: 2, difficulty: 20, range: 'Soi / Contact', target: 'Soi / 1 objet', duration: 'sustained', spec: 'telekinesis',
        source: 'core', page: 167,
        summary: 'Jusqu\'au début de votre prochain tour, vous flottez et vous déplacez à Vitesse Lente dans toutes les directions, en ignorant le Terrain difficile. Ou bien vous touchez un objet à portée de Contact et réduisez son Encombrement de 1 par DR.',
    },
    {
        key: 'ignite', label: 'Flamme intérieure', labelEn: 'Ignite', discipline: 'minor', overt: true,
        warpRating: 1, difficulty: 40, range: 'self', target: 'Soi', duration: 'sustained', spec: 'pyromancy',
        source: 'core', page: 168,
        summary: 'Jusqu\'au début de votre prochain tour, une petite flamme brûle dans l\'une de vos mains : elle ne vous brûle pas et ne s\'éteint pas par des moyens conventionnels, mais éclaire, brûle et enflamme comme une flamme normale.',
    },
    {
        key: 'ill_omen', label: 'Mauvais présage', labelEn: 'Ill Omen', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 0, range: 'medium', target: '1 Zone', duration: 'sustained', spec: 'divination',
        source: 'core', page: 168,
        summary: 'Jet sur la table des Phénomènes psychiques une fois par DR ; vous choisissez un des résultats, qui se manifeste dans une Zone à portée Moyenne jusqu\'au début de votre prochain tour.',
    },
    {
        key: 'jinx', label: 'Mauvais œil', labelEn: 'Jinx', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 0, range: 'medium', target: '1 créature', duration: 'instant', spec: 'divination',
        source: 'core', page: 168,
        summary: 'Le premier Test que fait la cible, une créature à portée Moyenne, dans l\'heure qui suit se fait avec Désavantage.',
    },
    {
        key: 'luck', label: 'Chance', labelEn: 'Luck', discipline: 'minor', overt: false,
        warpRating: 1, difficulty: 40, range: 'self', target: 'Soi', duration: 'instant', spec: 'divination',
        source: 'core', page: 168,
        summary: 'Se manifeste juste avant l\'un de vos Tests : en cas de réussite, le Test se fait avec Avantage ; en cas d\'échec, avec Désavantage. Inutilisable sur un Test de Maîtrise psychique, et pas plus d\'une fois par Round.',
    },
    {
        key: 'nova', label: 'Nova', labelEn: 'Nova', discipline: 'minor', overt: true,
        warpRating: 2, difficulty: 20, range: 'self', target: 'Votre Zone', duration: 'instant', spec: 'pyromancy',
        source: 'core', page: 168,
        summary: 'Chaque créature de votre Zone (sauf vous) subit 4 + BFM + DR Dégâts et doit gagner un Test Routinier (+20) d\'Athlétisme (Puissance) opposé à votre Test de Manifestation, sinon elle est À terre.',
    },
    {
        key: 'preternatural_senses', label: 'Sens surnaturels', labelEn: 'Preternatural Senses', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 20, range: 'self', target: 'Soi', duration: 'sustained', spec: 'biomancy',
        source: 'core', page: 168,
        summary: 'Jusqu\'au début de votre prochain tour : vision dans la pénombre comme avec des lunettes de vision nocturne, vision des émissions de chaleur comme avec des lunettes Preysense, et Avantage aux Tests de Perception. Avec 5 DR ou plus, vous percevez sans la vue et ignorez l\'état Aveuglé.',
    },
    {
        key: 'psychic_scrutiny', label: 'Examen psychique', labelEn: 'Psychic Scrutiny', discipline: 'minor', overt: false,
        warpRating: 1, difficulty: 40, range: 'short', target: '1 créature', duration: 'instant', spec: 'divination',
        source: 'core', page: 169,
        summary: 'Par DR, vous apprenez une information sur une créature à portée Courte : Blessures actuelles et maximum ; Caractéristiques la plus haute et la plus basse ; valeur d\'une Caractéristique (au choix) ; Compétence la plus avancée (choix du MJ) ; un Talent ou Trait (choix du MJ).',
    },
    {
        key: 'psychic_static', label: 'Statique psychique', labelEn: 'Psychic Static', discipline: 'minor', overt: false,
        warpRating: 1, difficulty: 40, range: 'self', target: 'Soi', duration: 'sustained', spec: 'telepathy',
        source: 'core', page: 169,
        summary: 'Jusqu\'au début de votre prochain tour, une créature ou un appareil ne vous perçoit pas, sauf s\'il gagne un Test Facile (+40) de Vigilance (toute spécialisation) opposé à votre Test de Manifestation. Une créature ou un appareil qui subit des Dégâts ou avec qui vous interagissez peut vous percevoir.',
    },
    {
        key: 'scalding_glance', label: 'Regard bouillant', labelEn: 'Scalding Glance', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 0, range: 'medium', target: 'Spécial', duration: 'sustained', spec: 'pyromancy',
        source: 'core', page: 169,
        summary: 'Jusqu\'à 20 gallons de liquide par DR, à portée Moyenne, se mettent à bouillir jusqu\'au début de votre prochain tour, puis refroidissent normalement. Impossible sur un liquide à l\'intérieur d\'une créature vivante ; un liquide confiné peut faire exploser son contenant.',
    },
    {
        key: 'seal_wounds', label: 'Refermer les plaies', labelEn: 'Seal Wounds', discipline: 'minor', overt: true,
        warpRating: 2, difficulty: 20, range: 'immediate', target: '1 créature', duration: 'instant', spec: 'biomancy',
        source: 'core', page: 169,
        summary: 'Une créature touchée (vous compris) récupère BFM + sa BE + DR Blessures, et l\'état Hémorragie est retiré. Si elle en bénéficie à nouveau avant de se Reposer, elle devient Épuisée.',
    },
    {
        key: 'sear', label: 'Brûlure', labelEn: 'Sear', discipline: 'minor', overt: false,
        warpRating: 3, difficulty: -10, range: 'medium', target: '1 objet', duration: 'sustained', spec: 'pyromancy',
        source: 'core', page: 170,
        summary: 'Un objet d\'Encombrement au plus égal au DR, à portée Moyenne, devient brûlant jusqu\'au début de votre prochain tour. Une créature qui le touche à la manifestation subit BFM Dégâts, et de nouveau à la fin de son tour si elle le touche toujours ; s\'il s\'agit d\'une armure portée, sa valeur d\'Armure ne réduit pas ces Dégâts.',
    },
    {
        key: 'smite', label: 'Châtiment', labelEn: 'Smite', discipline: 'minor', overt: true,
        warpRating: 2, difficulty: -10, range: 'medium', target: '1 créature', duration: 'instant', spec: 'telepathy',
        source: 'core', page: 170,
        summary: 'Une créature à portée Moyenne subit 2 + BFM + DR Dégâts, qui ignorent l\'Armure. Connu de tous les psykers.',
    },
    {
        key: 'soulsight', label: 'Vue des âmes', labelEn: 'Soulsight', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 0, range: 'medium', target: 'Soi', duration: 'sustained', spec: 'divination',
        source: 'core', page: 170,
        summary: 'Jusqu\'au début de votre prochain tour, vous percevez les créatures vivantes à portée Moyenne selon la table (vous pouvez en exclure, vous et vos alliés par exemple), et vous avez Avantage aux Tests de Psyniscience pour détecter ou identifier Démons et Psykers.',
        table: [
            { min: 1, max: 1, effect: 'Combien de créatures douées de raison se trouvent à portée.' },
            { min: 2, max: 2, effect: 'L\'espèce de chacune de ces créatures.' },
            { min: 3, max: 3, effect: 'Combien de créatures se trouvent dans chaque Zone à portée.' },
            { min: 4, max: null, effect: 'La position exacte de chacune de ces créatures.' },
        ],
    },
    {
        key: 'spasm', label: 'Spasme', labelEn: 'Spasm', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 20, range: 'short', target: '1 créature', duration: 'sustained', spec: 'biomancy',
        source: 'core', page: 170,
        summary: 'La cible doit gagner un Test Routinier (+20) de Robustesse (Endurance) opposé, sinon elle perd l\'usage d\'un membre (à votre choix) jusqu\'au début de votre prochain tour ; elle refait le Test à la fin de son tour et met fin au pouvoir si elle gagne. Le membre ne sert à aucune Action : jambe, Vitesse réduite d\'un cran (minimum Lente) ; objet tenu lâché ; Lutte relâchée.',
    },
    {
        key: 'spectral_hands', label: 'Mains spectrales', labelEn: 'Spectral Hands', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 20, range: 'short', target: 'Spécial', duration: 'sustained', spec: 'telekinesis',
        source: 'core', page: 171,
        summary: 'Vous manipulez grossièrement (pas de geste fin) des objets à portée Courte d\'Encombrement total au plus égal au DR, et les déplacez dans votre Zone en Action gratuite une fois par tour ; hors de votre Zone, ils tombent. Par une Action, attaque de mêlée avec un objet par un Test de Maîtrise psychique (Télékinésie) : 1 Dégât par point d\'Encombrement, arme Inefficace.',
    },
    {
        key: 'lull', label: 'Assoupissement', labelEn: 'Lull', discipline: 'minor', overt: false,
        warpRating: 3, difficulty: -10, range: 'short', target: '1 créature', duration: 'sustained', spec: 'biomancy',
        source: 'core', page: 171,
        summary: 'La cible doit gagner un Test Difficile (−10) de Robustesse (Endurance) opposé, sinon elle tombe Inconsciente jusqu\'au début de votre prochain tour ; Avantage si elle accomplit une tâche éprouvante ou stressante, ou si elle est en combat. Le pouvoir prend fin si elle subit des Dégâts, et elle se réveille dès qu\'il prend fin.',
    },

    // ───────────── Biomancie (core p.171-173) ─────────────
    {
        key: 'affliction', label: 'Affliction', labelEn: 'Affliction', discipline: 'biomancy', overt: false,
        warpRating: 3, difficulty: -10, range: 'short', target: '1 créature', duration: 'sustained', spec: 'biomancy',
        source: 'core', page: 171,
        summary: 'La cible doit gagner un Test Difficile (−10) de Robustesse (Endurance) opposé, sinon elle subit un état au choix jusqu\'au début de votre prochain tour : Aveuglé, Assourdi, Épuisé, Empoisonné ou Hébété. Elle refait le Test à la fin de son tour (fin du pouvoir si elle gagne) ; une créature qui gagne est immunisée pendant 1 heure.',
    },
    {
        key: 'bio_lightning', label: 'Bio-éclair', labelEn: 'Bio-Lightning', discipline: 'biomancy', overt: true,
        warpRating: 3, difficulty: -20, range: 'medium', target: '1 créature', duration: 'instant', spec: 'biomancy',
        source: 'core', page: 172,
        summary: 'La cible et les créatures à portée de Contact d\'elle subissent 4 + BFM + DR Dégâts. Chaque créature touchée doit gagner un Test Ardu (−20) de Robustesse (Endurance) opposé, sinon elle est Hébétée jusqu\'au début de votre prochain tour.',
    },
    {
        key: 'iron_limb', label: 'Membre de fer', labelEn: 'Iron Limb', discipline: 'biomancy', overt: true,
        warpRating: 1, difficulty: 40, range: 'self', target: 'Soi', duration: 'sustained', spec: 'biomancy',
        source: 'core', page: 172,
        summary: 'Jusqu\'au début de votre prochain tour, Avantage aux Tests de Force et de Capacité de Combat ; chaque fois qu\'un calcul utilise votre BF (Dégâts de mêlée par exemple), vous pouvez utiliser le DR du Test de Manifestation à la place.',
    },
    {
        key: 'ferrocrete_flesh', label: 'Chair de ferrobéton', labelEn: 'Ferrocrete Flesh', discipline: 'biomancy', overt: true,
        warpRating: 2, difficulty: 20, range: 'immediate', target: '1 créature', duration: 'sustained', spec: 'biomancy',
        source: 'core', page: 172,
        summary: 'Une créature touchée (vous compris) ajoute le DR à sa BE pour réduire les Dégâts jusqu\'au début de votre prochain tour. Si le DR dépasse sa BF, sa Vitesse baisse d\'un cran (minimum Lente) et ses Tests d\'Agilité se font avec Désavantage. La cible peut, par une Action, mettre fin au pouvoir en gagnant un Test Routinier (+20) de Robustesse (Endurance) opposé.',
    },
    {
        key: 'haemorrhage', label: 'Hémorragie', labelEn: 'Haemorrhage', discipline: 'biomancy', overt: false,
        warpRating: 2, difficulty: 0, range: 'short', target: '1 créature', duration: 'instant', spec: 'biomancy',
        source: 'core', page: 172,
        summary: 'La cible doit gagner un Test Exigeant (+0) de Robustesse (Endurance) opposé, sinon elle subit 2 Dégâts ignorant l\'Armure et l\'état Hémorragie (majeur), qui dure jusqu\'à des soins de Médicae ou un autre moyen.',
    },
    {
        key: 'life_leech', label: 'Sangsue de vie', labelEn: 'Life Leech', discipline: 'biomancy', overt: true,
        warpRating: 4, difficulty: -30, range: 'medium', target: '1 créature', duration: 'sustained', spec: 'biomancy',
        source: 'core', page: 172,
        summary: 'La cible doit gagner un Test Très ardu (−30) de Robustesse (Endurance) opposé, sinon elle vous est liée jusqu\'au début de votre prochain tour : une fois par tour, en Action gratuite, vous lui infligez 3 + BFM Dégâts qui ignorent l\'Armure et ne peuvent être réduits, et récupérez la moitié des Dégâts infligés en Blessures (arrondi au supérieur). Elle refait le Test à la fin de son tour ; une créature qui gagne est immunisée pendant 1 heure.',
    },
    {
        key: 'metabolic_overdrive', label: 'Surrégime métabolique', labelEn: 'Metabolic Overdrive', discipline: 'biomancy', overt: true,
        warpRating: 2, difficulty: 0, range: 'short', target: 'DR créatures', duration: 'sustained', spec: 'biomancy',
        source: 'core', page: 173,
        summary: 'Jusqu\'à DR créatures (vous compris) à portée Courte gagnent un cran de Vitesse et font leurs Tests de Réflexes avec Avantage, jusqu\'au début de votre prochain tour.',
    },
    {
        key: 'cleanse', label: 'Purification', labelEn: 'Cleanse', discipline: 'biomancy', overt: true,
        warpRating: 3, difficulty: -10, range: 'immediate', target: '1 créature', duration: 'instant', spec: 'biomancy',
        source: 'core', page: 173,
        summary: 'Une créature touchée perd les états Empoisonné et Hébété. Si elle souffre d\'une maladie, elle ajoute le DR à son prochain Test pour y résister.',
    },
    {
        key: 'shape_flesh', label: 'Modeler la chair', labelEn: 'Shape Flesh', discipline: 'biomancy', overt: true,
        warpRating: 1, difficulty: 40, range: 'immediate', target: '1 créature', duration: 'permanent', spec: 'biomancy',
        source: 'core', page: 173,
        summary: 'En 10 minutes, vous modifiez définitivement l\'anatomie et l\'apparence d\'une créature touchée selon la table ; une cible non consentante s\'oppose par un Test Facile (+40) de Robustesse (Endurance). Pour imiter une créature précise (déguisement), la Difficulté des Tests pour percer le déguisement baisse de 10 par DR.',
        table: [
            { min: 1, max: 2, effect: 'Modifier des traits mineurs : couleur des cheveux, des yeux ou de la peau, traits du visage, imperfections.' },
            { min: 3, max: 4, effect: 'Modifier modérément la taille, le poids, la posture naturelle et le physique.' },
            { min: 5, max: null, effect: 'Modifier radicalement traits et structure du corps : reconstruire, retirer ou neutraliser des parties du corps (membres, organes des sens) ; causer ou réparer une Séquelle ou une Amputation (p.217).' },
        ],
    },
    {
        key: 'wither', label: 'Flétrissure', labelEn: 'Wither', discipline: 'biomancy', overt: true,
        warpRating: 2, difficulty: 20, range: 'self', target: 'Votre Zone', duration: 'instant', spec: 'biomancy',
        source: 'core', page: 173,
        summary: 'Chaque créature de votre Zone fait un Test Routinier (+20) de Robustesse (Endurance) opposé ; si vous gagnez, elle subit des Dégâts égaux à la différence de DR, qui ignorent l\'Armure. Si ces Dégâts dépassent sa BE, elle est aussi Empoisonnée jusqu\'au début de votre prochain tour.',
    },

    // ───────────── Divination (core p.174-176) ─────────────
    {
        key: 'dowsing', label: 'Radiesthésie', labelEn: 'Dowsing', discipline: 'divination', overt: false,
        warpRating: 3, difficulty: -10, range: 'special', target: 'Spécial', duration: 'sustained', spec: 'divination',
        source: 'core', page: 174,
        summary: 'Choisissez un objet ou une créature observé de visu : jusqu\'au début de votre prochain tour, s\'il se trouve à 1 mile par DR ou moins, vous connaissez sa direction et sa distance. Ou bien choisissez un type d\'objet, une matière ou une espèce : vous savez s\'il y en a à portée Longue, sans position ni nombre.',
    },
    {
        key: 'forewarning', label: 'Prémonition', labelEn: 'Forewarning', discipline: 'divination', overt: false,
        warpRating: 2, difficulty: 20, range: 'self', target: 'Soi', duration: 'sustained', spec: 'divination',
        source: 'core', page: 174,
        summary: 'Jusqu\'au début de votre prochain tour, vous pouvez effectuer l\'Action Esquive en Action gratuite pendant votre tour.',
    },
    {
        key: 'perfect_timing', label: 'Instant parfait', labelEn: 'Perfect Timing', discipline: 'divination', overt: false,
        warpRating: 2, difficulty: 0, range: 'short', target: 'DR alliés', duration: 'instant', spec: 'divination',
        source: 'core', page: 174,
        summary: 'Jusqu\'à DR alliés (vous compris) à portée Courte peuvent, à la fin de leur prochain tour, Saisir l\'initiative en Action gratuite, et ont Avantage à leur premier Test avant la fin de leur prochain tour.',
    },
    {
        key: 'prescience', label: 'Prescience', labelEn: 'Prescience', discipline: 'divination', overt: false,
        warpRating: 1, difficulty: 40, range: 'self', target: 'Soi', duration: 'special', spec: 'divination',
        source: 'core', page: 174,
        summary: 'Pendant un Repos, transe de 10 minutes : vous gagnez autant de points de Prescience que de DR. Après un Test, dépensez 1 point pour relancer un dé ou les deux (un point par Test au plus, Avantage et Désavantage s\'appliquent ensuite). Les points n\'expirent pas, mais ceux non dépensés sont perdus à la manifestation suivante du pouvoir.',
    },
    {
        key: 'question_the_warp', label: 'Interroger le Warp', labelEn: 'Question the Warp', discipline: 'divination', overt: true,
        warpRating: 1, difficulty: 0, range: 'self', target: 'Soi', duration: '1 minute', spec: 'divination',
        source: 'core', page: 175,
        summary: 'Vous posez au MJ une question dont vous ignorez la réponse. Il jette 1d10 en secret contre BFM + DR (maximum 9) : inférieur, la réponse est vraie ; supérieur ou égal, elle est fausse. Une question ayant obtenu une réponse ne peut être reposée.',
    },
    {
        key: 'armour_bane', label: 'Fléau des armures', labelEn: 'Armour Bane', discipline: 'divination', overt: false,
        warpRating: 2, difficulty: 0, range: 'short', target: '1 arme', duration: 'sustained', spec: 'divination',
        source: 'core', page: 175,
        summary: 'Jusqu\'au début de votre prochain tour, une arme à portée Courte gagne le Trait Perforante (X), X = DR. Si elle l\'a déjà, la valeur la plus haute s\'applique (pas de cumul).',
    },
    {
        key: 'psychometry', label: 'Psychométrie', labelEn: 'Psychometry', discipline: 'divination', overt: true,
        warpRating: 1, difficulty: 40, range: 'immediate', target: '1 objet ou Zone', duration: '1 minute', spec: 'divination',
        source: 'core', page: 175,
        summary: 'En une minute de transe, vous lisez l\'histoire d\'un objet touché ou de votre Zone actuelle selon le DR (table).',
        table: [
            { min: 1, max: 1, effect: 'Impressions vagues des dernières émotions fortes ressenties près de la cible ou à son contact.' },
            { min: 2, max: 2, effect: 'Depuis combien de temps ces émotions ont été ressenties.' },
            { min: 3, max: 3, effect: 'Souvenir flou des événements qui les ont causées.' },
            { min: 4, max: 4, effect: 'Souvenir clair et détaillé de ces événements.' },
            { min: 5, max: 5, effect: 'Identité des personnes qui ont laissé ces empreintes émotionnelles.' },
            { min: 6, max: null, effect: 'Compréhension profonde des faits ; une question au MJ sur l\'événement, à laquelle il répond sincèrement.' },
        ],
    },
    {
        key: 'scrying_gaze', label: 'Regard divinatoire', labelEn: 'Scrying Gaze', discipline: 'divination', overt: true,
        warpRating: 1, difficulty: 40, range: 'special', target: '1 créature', duration: '1 minute', spec: 'divination',
        source: 'core', page: 176,
        summary: 'Une créature, un objet ou un lieu observé de visu, où qu\'il soit : vous le voyez et l\'entendez ; avec 4 DR ou plus, vous connaissez aussi sa direction et sa distance approximatives et percevez la Zone qui l\'entoure. Un Psyker ou un Démon dont la BPer dépasse votre BFM se sent observé et peut, par une Action, gagner un Test Facile (+40) de Discipline (Psychique) opposé pour y mettre fin (immunité 1 heure).',
    },
    {
        key: 'twist_fate', label: 'Infléchir le destin', labelEn: 'Twist Fate', discipline: 'divination', overt: false,
        warpRating: 2, difficulty: 20, range: 'short', target: '1 créature', duration: 'instant', spec: 'divination',
        source: 'core', page: 176,
        summary: 'Une fois par round, en Réaction, quand une créature à portée Courte (vous compris) fait un Test avec Avantage ou Désavantage : en cas de réussite, le Test se fait sans l\'un ni l\'autre. En cas d\'échec du Test de Manifestation, vous faites vos Tests avec Désavantage jusqu\'à revenir à 0 Charge Warp.',
    },
    {
        key: 'watchward', label: 'Vigie', labelEn: 'Watchward', discipline: 'divination', overt: false,
        warpRating: 2, difficulty: 20, range: 'self', target: 'Soi', duration: 'sustained', spec: 'divination',
        source: 'core', page: 176,
        summary: 'Jusqu\'au début de votre prochain tour, vous détectez toute créature ou appareil qui vous observe, par quelque moyen que ce soit, avec les informations de la table selon le DR (vous pouvez exclure vos alliés).',
        table: [
            { min: 1, max: 1, effect: 'Vous savez que quelque chose vous observe.' },
            { min: 2, max: 2, effect: 'Combien d\'êtres ou d\'appareils vous observent.' },
            { min: 3, max: 3, effect: 'Le moyen d\'observation (sens naturels, technologie, psychisme).' },
            { min: 4, max: 4, effect: 'La direction générale et la distance de vos observateurs.' },
            { min: 5, max: 5, effect: 'La position exacte de vos observateurs.' },
            { min: 6, max: null, effect: 'L\'apparence de vos observateurs.' },
        ],
    },

    // ───────────── Pyromancie (core p.177-179) ─────────────
    {
        key: 'cauterise', label: 'Cautérisation', labelEn: 'Cauterise', discipline: 'pyromancy', overt: true,
        warpRating: 3, difficulty: -10, range: 'immediate', target: '1 créature', duration: 'instant', spec: 'pyromancy',
        source: 'core', page: 177,
        summary: 'Une créature touchée perd les états Hémorragie, Effrayé, Hébété ou Inconscient, mais subit à la partie du corps touchée 4 − DR Dégâts, qui ignorent l\'Armure.',
    },
    {
        key: 'command_flames', label: 'Maîtrise des flammes', labelEn: 'Command Flames', discipline: 'pyromancy', overt: false,
        warpRating: 3, difficulty: -10, range: 'long', target: 'Spécial', duration: 'instant', spec: 'pyromancy',
        source: 'core', page: 177,
        summary: 'En Action gratuite ce tour, vous manipulez le feu à portée Longue autant de fois que de DR, chaque fois au choix : éteindre tous les feux d\'une Zone (retire le Trait Embrasé (Burning) et l\'état En feu) ; doubler ou diviser par deux la lumière des flammes d\'une Zone ; changer leur couleur ; attiser des flammes isolées pour donner le Trait Embrasé à la Zone ; étendre une Zone Embrasée à une Zone adjacente (s\'il y a de quoi brûler) ; donner aux flammes d\'une Zone l\'apparence de formes jusqu\'au début de votre prochain tour.',
    },
    {
        key: 'fire_storm', label: 'Tempête de feu', labelEn: 'Fire Storm', discipline: 'pyromancy', overt: true,
        warpRating: 3, difficulty: -20, range: 'medium', target: '1 Zone', duration: 'instant', spec: 'pyromancy',
        source: 'core', page: 177,
        summary: 'Les créatures d\'une Zone à portée Moyenne subissent 6 + DR Dégâts et doivent gagner un Test Ardu (−20) de Réflexes (Esquive) opposé, sinon elles sont En feu jusqu\'à ce qu\'elles ou une créature à portée de Contact l\'éteignent par une Action. Les objets inflammables s\'embrasent : Trait Embrasé (Burning) pour la Zone, à la discrétion du MJ.',
    },
    {
        key: 'inferno', label: 'Brasier', labelEn: 'Inferno', discipline: 'pyromancy', overt: true,
        warpRating: 3, difficulty: -20, range: 'long', target: 'DR Zones', duration: 'sustained', spec: 'pyromancy',
        source: 'core', page: 177,
        summary: 'Jusqu\'à DR Zones à portée Longue deviennent des Dangers majeurs (Major Hazards) jusqu\'au début de votre prochain tour ; une créature qui subit des Dégâts de ce Danger doit réussir un Test Ardu (−20) de Réflexes (Esquive), sinon elle est En feu jusqu\'à ce qu\'elle ou une créature à portée de Contact l\'éteigne par une Action. À la fin du pouvoir, tout feu des Zones s\'éteint.',
    },
    {
        key: 'plasma_torch', label: 'Torche à plasma', labelEn: 'Plasma Torch', discipline: 'pyromancy', overt: true,
        warpRating: 2, difficulty: 0, range: 'self', target: 'Soi', duration: 'sustained', spec: 'pyromancy',
        source: 'core', page: 178,
        summary: 'Jusqu\'au début de votre prochain tour, votre main s\'entoure de plasma (inoffensif pour vous) : lumière vive dans votre Zone, découpe et soudure du métal comme une torche à plasma, et arme de mêlée : Pugilat, Dégâts 4 + BFM, Enc 0, Inflige (En feu), Bruyante, Déchirante (BFM).',
    },
    {
        key: 'pyrelight', label: 'Lumière du bûcher', labelEn: 'Pyrelight', discipline: 'pyromancy', overt: true,
        warpRating: 3, difficulty: -20, range: 'special', target: 'Soi', duration: 'sustained', spec: 'pyromancy',
        source: 'core', page: 178,
        summary: 'Jusqu\'au début de votre prochain tour, votre peau rayonne : lumière vive dans votre Zone, faible dans les Zones adjacentes. En Action gratuite, vous intensifiez (ou atténuez) : lumière vive à portée Moyenne, votre Zone devient un Danger mineur (Minor Hazard) dont vous êtes exempt, et une créature qui y entre pour la première fois du round ou y commence son tour doit gagner un Test Ardu (−20) de Robustesse (Endurance) opposé, sinon elle est Aveuglée jusqu\'au début de votre prochain tour.',
    },
    {
        key: 'smouldercloud', label: 'Nuée de suie', labelEn: 'Smouldercloud', discipline: 'pyromancy', overt: true,
        warpRating: 2, difficulty: 0, range: 'medium', target: 'DR Zones', duration: 'sustained', spec: 'pyromancy',
        source: 'core', page: 178,
        summary: 'Jusqu\'à DR Zones à portée Moyenne deviennent Fortement obscurcies (Heavily Obscured) jusqu\'au début de votre prochain tour, et les créatures qui y finissent leur tour commencent à suffoquer (p.218).',
    },
    {
        key: 'sunburst', label: 'Éclat solaire', labelEn: 'Sunburst', discipline: 'pyromancy', overt: true,
        warpRating: 2, difficulty: 0, range: 'long', target: '1 Zone', duration: 'instant', spec: 'pyromancy',
        source: 'core', page: 178,
        summary: 'Les créatures d\'une Zone à portée Longue font un Test Exigeant (+0) de Robustesse (Endurance) opposé ; en cas de défaite, elles sont Aveuglées et refont le Test à la fin de chacun de leurs tours (l\'état est retiré si elles gagnent). Une créature qui perd plus de 3 fois de suite est aveugle de façon permanente (soins de Médicae poussés, augmétiques ou guérison puissante nécessaires).',
    },
    {
        key: 'molten_beam', label: 'Rayon de fusion', labelEn: 'Molten Beam', discipline: 'pyromancy', overt: true,
        warpRating: 3, difficulty: -20, range: 'long', target: '1 créature ou objet', duration: 'instant', spec: 'pyromancy',
        source: 'core', page: 178,
        summary: 'La cible subit 7 + DR Dégâts ; contre une créature, vous choisissez la Localisation touchée. Si elle est protégée par une armure, sa valeur d\'Armure baisse définitivement de BFM une fois les Blessures déterminées.',
    },
    {
        key: 'thermal_shroud', label: 'Voile thermique', labelEn: 'Thermal Shroud', discipline: 'pyromancy', overt: true,
        warpRating: 2, difficulty: 20, range: 'short', target: 'Alliés à portée', duration: 'sustained', spec: 'pyromancy',
        source: 'core', page: 178,
        summary: 'Jusqu\'au début de votre prochain tour, les Dégâts de feu et de chaleur (armes à flammes, à fusion…) que vous et vos alliés à portée Courte subissez sont réduits de BFM + 1 par DR, avant l\'Armure. Votre présence devient indétectable par un auspex thermique.',
    },

    // ───────────── Télékinésie (core p.179-181) ─────────────
    {
        key: 'breach', label: 'Brèche', labelEn: 'Breach', discipline: 'telekinesis', overt: false,
        warpRating: 2, difficulty: 0, range: 'medium', target: '1 objet', duration: 'instant', spec: 'telekinesis',
        source: 'core', page: 179,
        summary: 'Un objet de taille Grande ou moindre à portée Moyenne est détruit sans réparation possible, si le MJ juge que le DR le permet (table). Ou bien une pièce d\'armure (une Localisation) perd définitivement 1 point d\'Armure par DR.',
        table: [
            { min: 1, max: 1, effect: 'Objet fragile (vitre, enregistreur pict).' },
            { min: 2, max: 2, effect: 'Objet courant (plateau en plastique, tabouret en bois).' },
            { min: 3, max: 3, effect: 'Objet robuste (fusil laser, porte en bois).' },
            { min: 4, max: 4, effect: 'Objet exceptionnellement solide (pistolet bolter, bonbonne de gaz comprimé).' },
            { min: 5, max: 5, effect: 'Objet conçu pour résister à de fortes contraintes (mur en plastacier, pilier en ferrobéton).' },
            { min: 6, max: null, effect: 'Objet en matériau quasi indestructible (céramite, adamantium).' },
        ],
    },
    {
        key: 'crush', label: 'Broyage', labelEn: 'Crush', discipline: 'telekinesis', overt: false,
        warpRating: 3, difficulty: -20, range: 'medium', target: '1 créature', duration: 'sustained', spec: 'telekinesis',
        source: 'core', page: 179,
        summary: 'La cible subit 3 + BFM + DR Dégâts et fait un Test Ardu (−20) d\'Athlétisme (Puissance) opposé ; si elle perd, elle est Entravée jusqu\'à la fin du pouvoir. Elle refait le Test à la fin de son tour et met fin au pouvoir si elle gagne.',
    },
    {
        key: 'deflection', label: 'Déviation', labelEn: 'Deflection', discipline: 'telekinesis', overt: true,
        warpRating: 1, difficulty: 40, range: 'self', target: 'Soi', duration: 'sustained', spec: 'telekinesis',
        source: 'core', page: 179,
        summary: 'Jusqu\'au début de votre prochain tour, toutes vos Localisations gagnent une Armure égale au DR, cumulable avec l\'Armure existante. Seuls les objets physiques (armes de mêlée, éclats, projectiles) sont concernés : les armes à énergie l\'ignorent.',
    },
    {
        key: 'gate_of_infinity', label: 'Porte de l\'infini', labelEn: 'Gate of Infinity', discipline: 'telekinesis', overt: true,
        warpRating: 2, difficulty: 0, range: '1 mile par DR', target: 'Spécial', duration: 'sustained', spec: 'telekinesis',
        source: 'core', page: 180,
        summary: 'Jusqu\'au début de votre prochain tour, un grand portail s\'ouvre à un point à portée de Contact et un autre à un point à 1 mile par DR (que vous voyez, dont vous vous souvenez ou que vous décrivez en direction et distance) ; on traverse comme une porte ouverte. Se déplacer ou tirer à travers compte comme passer d\'une Zone à une Zone adjacente.',
    },
    {
        key: 'gravity_well', label: 'Puits de gravité', labelEn: 'Gravity Well', discipline: 'telekinesis', overt: true,
        warpRating: 1, difficulty: 40, range: 'self', target: 'Votre Zone', duration: 'sustained', spec: 'telekinesis',
        source: 'core', page: 180,
        summary: 'Jusqu\'au début de votre prochain tour, votre Zone est un Terrain difficile pour les autres, qui ne peuvent la quitter qu\'en gagnant un Test Facile (+40) d\'Athlétisme (Puissance) opposé. Si vous changez de Zone, les créatures de votre Zone sont entraînées avec vous, sauf si elles gagnent ce même Test opposé.',
    },
    {
        key: 'impel', label: 'Impulsion', labelEn: 'Impel', discipline: 'telekinesis', overt: false,
        warpRating: 2, difficulty: 20, range: 'short', target: '1 créature ou objet', duration: 'instant', spec: 'telekinesis',
        source: 'core', page: 180,
        summary: 'Un objet à portée Courte d\'Encombrement au plus égal au DR est poussé dans une Zone adjacente de votre choix (sinon, il ne bouge pas). Ou bien une créature à portée Courte doit gagner un Test Routinier (+20) d\'Athlétisme (Puissance) opposé, sinon elle est poussée dans une Zone adjacente de votre choix et mise À terre.',
    },
    {
        key: 'abjuration_mechanicum', label: 'Abjuration Mechanicum', labelEn: 'Abjuration Mechanicum', discipline: 'telekinesis', overt: false,
        warpRating: 2, difficulty: 20, range: 'short', target: '1 machine', duration: 'instant', spec: 'telekinesis',
        source: 'core', page: 180,
        summary: 'Vous sabotez une machine à portée Courte (y compris celles des serviteurs) : le DR fixe l\'effet maximal (table, non cumulative), vous pouvez en choisir un moindre. Les machines très grandes ou complexes (véhicules, vaisseaux, titans) peuvent compter comme plusieurs machines : le pouvoir ne vise alors qu\'un composant.',
        table: [
            { min: 1, max: 1, effect: 'Défaillances : jusqu\'au début de votre prochain tour, 1d10 à chaque fois qu\'elle devrait fonctionner ; sur 6+, elle ne fait rien.' },
            { min: 2, max: 2, effect: 'Elle se bloque et ne fonctionne plus jusqu\'au début de votre prochain tour.' },
            { min: 3, max: 3, effect: 'Elle tombe en panne et ne fonctionne plus jusqu\'à réparation.' },
            { min: 4, max: 4, effect: 'Elle subit des dégâts irréparables et est détruite.' },
            { min: 5, max: null, effect: 'Elle est détruite de façon catastrophique et inflige 4 Dégâts à tout ce qui est à portée de Contact.' },
        ],
    },
    {
        key: 'psychic_barrier', label: 'Barrière psychique', labelEn: 'Psychic Barrier', discipline: 'telekinesis', overt: false,
        warpRating: 3, difficulty: -10, range: 'medium', target: '1 Zone', duration: 'sustained', spec: 'telekinesis',
        source: 'core', page: 181,
        summary: 'Jusqu\'au début de votre prochain tour, une barrière invisible entoure une Zone à portée Moyenne : la franchir dans un sens ou l\'autre demande une Action et un Test Difficile (−10) d\'Athlétisme (Puissance) gagné en opposition. Les attaques à distance qui la traversent infligent 2 Dégâts de moins par DR.',
    },
    {
        key: 'psychic_maelstrom', label: 'Maelström psychique', labelEn: 'Psychic Maelstrom', discipline: 'telekinesis', overt: true,
        warpRating: 2, difficulty: 20, range: 'self', target: 'Votre Zone', duration: 'sustained', spec: 'telekinesis',
        source: 'core', page: 181,
        summary: 'Jusqu\'au début de votre tour, votre Zone est un Terrain difficile ; une créature qui y entre pour la première fois du round ou y commence son tour doit gagner un Test Routinier (+20) d\'Athlétisme (Puissance) opposé, sinon elle est À terre. Les attaques dans ou à travers la Zone se font avec Désavantage ; les objets non fixés d\'Encombrement au plus égal au DR sont renversés (ceux d\'Encombrement 0 tourbillonnent en l\'air).',
    },
    {
        key: 'vortex_of_doom', label: 'Vortex funeste', labelEn: 'Vortex of Doom', discipline: 'telekinesis', overt: true,
        warpRating: 4, difficulty: -30, range: 'medium', target: '1 Zone', duration: 'sustained', spec: 'telekinesis',
        source: 'core', page: 181,
        summary: 'Jusqu\'au début de votre prochain tour, une Zone à portée Moyenne devient Terrain difficile, Touchée par le Warp (Warp-Touched) et Danger mortel (Deadly Hazard) ; une créature qui y subit des Dégâts doit gagner un Test Très ardu (−30) de Discipline (Psychique) opposé, sinon elle est Hébétée. Quand vous cessez de le maintenir, 1d10 : sur un résultat supérieur ou égal à votre BFM, le vortex persiste jusqu\'à ce qu\'un Psyker à portée Moyenne le referme (Action, Test Très ardu (−30) de Maîtrise psychique (Télékinésie)).',
    },

    // ───────────── Télépathie (core p.182-184) ─────────────
    {
        key: 'beacon', label: 'Balise', labelEn: 'Beacon', discipline: 'telepathy', overt: false,
        warpRating: 3, difficulty: -20, range: 'medium', target: '1 créature', duration: 'sustained', spec: 'telepathy',
        source: 'core', page: 182,
        summary: 'Jusqu\'au début de votre prochain tour, vous connaissez la position exacte de la cible tant qu\'elle est à DR miles ou moins, et vous avez Avantage aux Tests d\'attaque contre elle.',
    },
    {
        key: 'compel', label: 'Contrainte', labelEn: 'Compel', discipline: 'telepathy', overt: false,
        warpRating: 2, difficulty: 20, range: 'short', target: '1 créature', duration: 'instant', spec: 'telepathy',
        source: 'core', page: 182,
        summary: 'La cible fait un Test Routinier (+20) de Discipline (Psychique) opposé ; si vous gagnez, vous lui imposez une Action ou un Mouvement qu\'elle exécute en premier à son prochain tour. Gagné ou perdu, elle sait que vous l\'avez contrainte.',
    },
    {
        key: 'dominate', label: 'Domination', labelEn: 'Dominate', discipline: 'telepathy', overt: false,
        warpRating: 3, difficulty: -20, range: 'medium', target: '1 créature', duration: 'sustained', spec: 'telepathy',
        source: 'core', page: 182,
        summary: 'La cible doit gagner un Test Ardu (−20) de Discipline (Psychique) opposé, sinon vous dictez son comportement, tour compris, jusqu\'au début de votre prochain tour. Elle refait le Test chaque fois qu\'elle subit des Dégâts et à la fin de son tour (fin si elle gagne, puis immunité 1 heure) ; elle a conscience de la tentative dans tous les cas.',
    },
    {
        key: 'erasure', label: 'Effacement', labelEn: 'Erasure', discipline: 'telepathy', overt: false,
        warpRating: 2, difficulty: 20, range: 'short', target: '1 créature', duration: 'instant', spec: 'telepathy',
        source: 'core', page: 182,
        summary: 'La cible résiste par un Test Routinier (+20) de Discipline (Psychique) opposé ; si elle échoue, vous effacez définitivement un souvenir d\'au plus 10 × BFM minutes. Elle ne remarque le trou que si quelque chose le met en évidence.',
    },
    {
        key: 'mental_interrogation', label: 'Interrogatoire mental', labelEn: 'Mental Interrogation', discipline: 'telepathy', overt: false,
        warpRating: 2, difficulty: 0, range: 'short', target: '1 créature', duration: 'sustained', spec: 'telepathy',
        source: 'core', page: 183,
        summary: 'La cible fait un Test Exigeant (+0) de Discipline (Psychique) opposé, avec Désavantage si elle est inconsciente, Avantage si elle vous est hostile. Si vous gagnez, vous accédez à son esprit jusqu\'au début de votre prochain tour (si elle réussit malgré tout, elle sent l\'intrusion) ; la différence de DR fixe la profondeur (table). Une fois par tour, en Action gratuite, vous apprenez BInt informations ; le pouvoir cesse si la cible sort de la portée Courte.',
        table: [
            { min: 1, max: 1, effect: 'Informations de base (nom, âge, humeur, santé physique et mentale) et pensées de surface (opinion sur vous, motivations générales, soucis immédiats, mensonges conscients).' },
            { min: 2, max: 2, effect: 'Un objet, un lieu ou une créature important pour la cible, et la nature de cette importance.' },
            { min: 3, max: 3, effect: 'Ses souvenirs de la dernière journée, de son point de vue.' },
            { min: 4, max: 4, effect: 'Ses souvenirs de la dernière année, de son point de vue.' },
            { min: 5, max: 5, effect: 'Ses pensées, sentiments, motivations, peurs, relations, secrets et desseins les plus intimes.' },
            { min: 6, max: null, effect: 'Livre ouvert : accès complet à son esprit et à tout ce qu\'il contient.' },
        ],
    },
    {
        key: 'psychic_fortitude', label: 'Force d\'âme psychique', labelEn: 'Psychic Fortitude', discipline: 'telepathy', overt: false,
        warpRating: 3, difficulty: -20, range: 'short', target: 'DR alliés', duration: 'sustained', spec: 'telepathy',
        source: 'core', page: 183,
        summary: 'Jusqu\'à DR alliés (vous exclu) à portée Courte peuvent utiliser votre Force Mentale à la place de la leur pour les Tests de Force Mentale, avec Avantage, jusqu\'au début de votre prochain tour.',
    },
    {
        key: 'psychic_shriek', label: 'Hurlement psychique', labelEn: 'Psychic Shriek', discipline: 'telepathy', overt: true,
        warpRating: 3, difficulty: -10, range: 'medium', target: '2 Zones', duration: 'instant', spec: 'telepathy',
        source: 'core', page: 183,
        summary: 'Les créatures (sauf vous) d\'une Zone à portée Moyenne et de votre Zone font un Test Difficile (−10) de Discipline (Psychique) opposé ; si vous gagnez, la cible subit BFM + la différence de DR en Dégâts, qui ignorent l\'Armure. Démons et Psykers subissent le double ; les créatures sans présence dans le Warp (Nécrons, Nuls) sont immunisées.',
    },
    {
        key: 'nightshroud', label: 'Voile de nuit', labelEn: 'Nightshroud', discipline: 'telepathy', overt: true,
        warpRating: 2, difficulty: 0, range: 'self', target: 'Votre Zone', duration: 'sustained', spec: 'telepathy',
        source: 'core', page: 184,
        summary: 'Jusqu\'au début de votre prochain tour, votre Zone est Fortement obscurcie (Heavily Obscured) ; vous et vos alliés y voyez normalement. Une créature qui tente de percer l\'illusion utilise son Action pour un Test Exigeant (+0) de Discipline (Psychique) opposé : si elle gagne, elle voit normalement et ignore le pouvoir pendant 1 heure.',
    },
    {
        key: 'telepathic_link', label: 'Lien télépathique', labelEn: 'Telepathic Link', discipline: 'telepathy', overt: false,
        warpRating: 3, difficulty: -20, range: 'long', target: 'DR alliés', duration: 'sustained', spec: 'telepathy',
        source: 'core', page: 184,
        summary: 'Jusqu\'au début de votre prochain tour, vous et DR alliés à portée Longue communiquez par télépathie (messages, émotions, idées), instantanément et à toute distance. Si vous et tous vos alliés de la Rencontre êtes liés, votre Supériorité ne peut descendre sous 1.',
    },
    {
        key: 'terrifying_visions', label: 'Visions terrifiantes', labelEn: 'Terrifying Visions', discipline: 'telepathy', overt: false,
        warpRating: 3, difficulty: -20, range: 'medium', target: '1 créature', duration: 'sustained', spec: 'telepathy',
        source: 'core', page: 184,
        summary: 'La cible doit gagner un Test Ardu (−20) de Discipline (Peur) opposé, sinon elle est terrifiée (Terrified) jusqu\'au début de votre prochain tour, par une source illusoire qu\'elle seule voit, toujours à portée de Contact d\'elle. Elle refait le Test à la fin de son tour (fin si elle gagne, puis immunité 1 heure).',
    },

    // ───────────── Inquisition Player's Guide : pouvoirs mineurs (ipg p.68-69) ─────────────
    {
        key: 'auditory_manipulation', label: 'Manipulation auditive', labelEn: 'Auditory Manipulation', discipline: 'minor', overt: false,
        warpRating: 3, difficulty: -10, range: 'long', target: '1 créature', duration: 'sustained', spec: 'biomancy',
        source: 'ipg', page: 68,
        summary: 'Jusqu\'au début de votre prochain tour, la cible entend les sons de votre choix, elle seule ; vous pouvez lui parler en formant une voix. Avec un bruit assourdissant, elle fait un Test Difficile (−10) de Robustesse (Endurance) opposé : si elle gagne, le pouvoir prend fin ; si elle perd, elle est Assourdie jusqu\'à la fin du pouvoir.',
    },
    {
        key: 'cipher_seed', label: 'Graine chiffrée', labelEn: 'Cipher Seed', discipline: 'minor', overt: false,
        warpRating: 1, difficulty: 40, range: 'immediate', target: '1 créature', duration: 'permanent', spec: 'telepathy',
        source: 'ipg', page: 68,
        summary: 'Vous enfouissez dans l\'inconscient d\'une créature (qui doit parler et vous entendre) un message de 5 mots par DR, et désignez un destinataire (nom ou type de créature). La prochaine fois qu\'elle est à portée de Contact du destinataire, elle récite le message mot pour mot, de sa propre voix, sans s\'en souvenir ni se rappeler l\'implantation.',
    },
    {
        key: 'force_bolt', label: 'Trait de force', labelEn: 'Force Bolt', discipline: 'minor', overt: false,
        warpRating: 3, difficulty: -20, range: 'long', target: '1 créature ou objet', duration: 'instant', spec: 'telekinesis',
        source: 'ipg', page: 69,
        summary: 'La cible subit 3 + BFM + DR Dégâts ; contre une créature, vous choisissez la Localisation touchée.',
    },
    {
        key: 'immolation_directive', label: 'Directive d\'immolation', labelEn: 'Immolation Directive', discipline: 'minor', overt: false,
        warpRating: 2, difficulty: 0, range: 'Contact / 1 mètre par DR', target: '1 objet', duration: 'permanent', spec: 'pyromancy',
        source: 'ipg', page: 69,
        summary: 'Vous touchez un objet d\'Encombrement 0 et fixez une condition de déclenchement simple et sans ambiguïté : quand elle survient, l\'objet se désintègre en flammes Warp (cendres ou scories), sans blesser ni enflammer quoi que ce soit autour. Une condition liée à un événement ou à la proximité d\'autre chose doit survenir à 1 mètre par DR ou moins de l\'objet.',
    },
    {
        key: 'mark', label: 'Marque', labelEn: 'Mark', discipline: 'minor', overt: true,
        warpRating: 2, difficulty: 20, range: 'immediate', target: '1 créature ou objet', duration: '1 jour par DR', spec: 'divination',
        source: 'ipg', page: 69,
        summary: 'Vous laissez sur une créature ou un objet touché un symbole impossible à effacer, qui dure 1 jour par DR. Visible, il peut être masqué, mais les psykers et êtres psychiquement réceptifs le voient à portée Moyenne à travers tout obstacle. L\'apposer discrètement demande un Test Exigeant (+0) de Dextérité (Escamotage).',
    },

    // ───────────── Inquisition Player's Guide : Biomancie (ipg p.70) ─────────────
    {
        key: 'induce_panic', label: 'Panique induite', labelEn: 'Induce Panic', discipline: 'biomancy', overt: false,
        warpRating: 3, difficulty: -20, range: 'medium', target: '1 créature', duration: 'sustained', spec: 'biomancy',
        source: 'ipg', page: 70,
        summary: 'La cible fait un Test Ardu (−20) de Robustesse (Endurance) opposé : si elle gagne, le pouvoir prend fin ; sinon elle est Effrayée de toute autre créature qu\'elle voit, alliés compris, jusqu\'au début de votre prochain tour. Si elle commence son tour à portée de Contact d\'une créature qu\'elle craint, elle doit l\'attaquer en mêlée par son Action (cible tirée au hasard s\'il y en a plusieurs). Elle refait le Test à la fin de son tour ; une fois gagné, immunité 1 heure.',
    },
    {
        key: 'stimulating_jolt', label: 'Électrochoc stimulant', labelEn: 'Stimulating Jolt', discipline: 'biomancy', overt: true,
        warpRating: 3, difficulty: -10, range: 'immediate', target: '1 créature', duration: '1 round par DR', spec: 'biomancy',
        source: 'ipg', page: 70,
        summary: 'Une créature touchée (vous compris) ignore les effets des états Épuisé et Inconscient pendant 1 round par DR, sans que ces états soient retirés (leurs effets reprennent ensuite s\'ils durent encore). Si elle en bénéficie à nouveau avant de se Reposer, elle subit 1d10 Dégâts ignorant l\'Armure, impossibles à prévenir ou réduire.',
    },
    {
        key: 'ossify', label: 'Ossification', labelEn: 'Ossify', discipline: 'biomancy', overt: false,
        warpRating: 3, difficulty: -20, range: 'medium', target: '1 créature', duration: 'sustained', spec: 'biomancy',
        source: 'ipg', page: 70,
        summary: 'La cible doit gagner un Test Ardu (−20) de Robustesse (Douleur) opposé, sinon elle est Surchargée jusqu\'au début de votre prochain tour ; elle refait le Test à la fin de son tour (fin si elle gagne). Si vous gagnez un de ces Tests par plus de DR que sa BE, elle est aussi Entravée. Une fois gagné, immunité 1 heure.',
    },

    // ───────────── Inquisition Player's Guide : Divination (ipg p.71-72) ─────────────
    {
        key: 'discern_falsehoods', label: 'Discerner le mensonge', labelEn: 'Discern Falsehoods', discipline: 'divination', overt: true,
        warpRating: 1, difficulty: 0, range: 'self', target: 'Votre Zone', duration: 'sustained', spec: 'divination',
        source: 'ipg', page: 71,
        summary: 'Jusqu\'au début de votre prochain tour, vous percevez la fausseté des paroles prononcées dans votre Zone selon le DR (table) ; il faut les entendre, de vive voix (ni enregistrement ni vox), sans forcément les comprendre. À chaque utilisation, au premier mensonge détecté de la rencontre, vous saignez des oreilles : Hémorragie jusqu\'à la fin du pouvoir.',
        table: [
            { min: 1, max: 2, effect: 'Quand quelqu\'un ment ouvertement.' },
            { min: 3, max: 4, effect: 'Quand quelqu\'un dit une chose techniquement vraie, ou avec une intention trompeuse.' },
            { min: 5, max: null, effect: 'Une idée générale de la raison du mensonge (cupidité, contrainte, malveillance…).' },
        ],
    },
    {
        key: 'pathfinder', label: 'Pisteur', labelEn: 'Pathfinder', discipline: 'divination', overt: false,
        warpRating: 2, difficulty: 0, range: 'Courte / Soi', target: 'Soi', duration: 'sustained', spec: 'divination',
        source: 'ipg', page: 72,
        summary: 'Jusqu\'au début de votre prochain tour, vous voyez la trace des positions passées d\'une créature à portée Courte sur la dernière minute par DR (la trace seule, pas la créature ni ce qu\'elle faisait), et pouvez la suivre partout, même si la créature a quitté votre Zone. Rien de postérieur à la manifestation.',
    },
    {
        key: 'piercing_sight', label: 'Vue perçante', labelEn: 'Piercing Sight', discipline: 'divination', overt: true,
        warpRating: 3, difficulty: -10, range: 'self', target: 'Soi', duration: 'sustained', spec: 'divination',
        source: 'ipg', page: 72,
        summary: 'Jusqu\'au début de votre prochain tour, Avantage aux Tests de Vigilance, d\'Intuition et de Linguistique (Chiffres) reposant sur la vue ; vous voyez à travers les objets solides sur 1 mètre par DR et dans l\'obscurité totale. Vos yeux éclairent votre Zone et y suppriment les Traits Sombre et Mal éclairé (Dark, Poorly Lit).',
    },

    // ───────────── Inquisition Player's Guide : Pyromancie (ipg p.72-73) ─────────────
    {
        key: 'impart_flame', label: 'Flamme confiée', labelEn: 'Impart Flame', discipline: 'pyromancy', overt: true,
        warpRating: 2, difficulty: 0, range: 'special', target: '1 objet', duration: '1 heure par DR', spec: 'pyromancy',
        source: 'ipg', page: 72,
        summary: 'Après 1 minute de concentration, un objet d\'Encombrement 0 touché garde une charge pyrokinétique pendant 1 heure par DR ; vous le percevez à portée Longue. Par une Action, vous libérez la charge : petite flamme pour le reste de la durée, explosion (Dégâts 3 + BFM, Enc 0, Explosion, Bruyante ; Réflexes (Esquive) opposés à votre Test de Manifestation) ou gerbe de feu (Dégâts –, Inflige (En feu), Dispersion). Charger l\'objet est Manifeste, libérer la charge ne l\'est pas.',
    },
    {
        key: 'pass_through_fire', label: 'Passage par le feu', labelEn: 'Pass Through Fire', discipline: 'pyromancy', overt: true,
        warpRating: 2, difficulty: 0, range: '1 Zone par DR', target: 'Spécial', duration: 'instant', spec: 'pyromancy',
        source: 'ipg', page: 73,
        summary: 'Vous percevez les feux assez grands pour s\'y tenir debout jusqu\'à DR Zones. À portée de Contact de l\'un d\'eux, vous y entrez et ressortez à portée de Contact d\'un autre feu perçu. Les Dégâts subis en entrant dans les flammes sont réduits de 2 × BFM.',
    },
    {
        key: 'circle_of_fire', label: 'Cercle de feu', labelEn: 'Circle of Fire', discipline: 'pyromancy', overt: true,
        warpRating: 3, difficulty: -10, range: 'medium', target: '1 Zone', duration: 'sustained', spec: 'pyromancy',
        source: 'ipg', page: 73,
        summary: 'Jusqu\'au début de votre prochain tour, un mur de feu de 3 mètres de haut et 1 mètre d\'épaisseur borde une Zone à portée Moyenne ; créature ou objet qui le traverse subit 3 + BFM + DR Dégâts. Désavantage aux Tests de Vigilance (Vue) et de Distance à travers les flammes.',
    },

    // ───────────── Inquisition Player's Guide : Télékinésie (ipg p.73-74) ─────────────
    {
        key: 'burden', label: 'Fardeau', labelEn: 'Burden', discipline: 'telekinesis', overt: false,
        warpRating: 4, difficulty: -30, range: 'medium', target: 'BFM créatures', duration: 'sustained', spec: 'telekinesis',
        source: 'ipg', page: 73,
        summary: 'Jusqu\'à BFM créatures à portée Moyenne font un Test Très ardu (−30) d\'Athlétisme (Puissance) opposé ; chaque perdante est Surchargée jusqu\'au début de votre prochain tour. Elles refont le Test à la fin de leur tour (perte de l\'état si elles gagnent) ; une fois gagné, immunité 1 heure.',
    },
    {
        key: 'psychic_blade', label: 'Lame psychique', labelEn: 'Psychic Blade', discipline: 'telekinesis', overt: true,
        warpRating: 2, difficulty: 20, range: 'self', target: 'Soi', duration: 'sustained', spec: 'telekinesis',
        source: 'ipg', page: 73,
        summary: 'Jusqu\'au début de votre prochain tour, vous maniez d\'une main une épée de force : Une main, Dégâts 3 + BFM, Enc 0, Perforante (X) avec X = DR. Elle disparaît si elle quitte votre main, ce qui met fin au pouvoir.',
    },
    {
        key: 'tether', label: 'Attache', labelEn: 'Tether', discipline: 'telekinesis', overt: false,
        warpRating: 3, difficulty: -10, range: 'medium', target: '1 créature et 1 objet', duration: 'sustained', spec: 'telekinesis',
        source: 'ipg', page: 74,
        summary: 'Une créature et un objet à portée Moyenne, à portée de Contact l\'un de l\'autre, doivent y rester jusqu\'au début de votre prochain tour (l\'un entraîne l\'autre s\'il peut le porter ou le traîner). Pour rompre le lien, la créature, ou une autre qui tente de les séparer, utilise une Action et gagne un Test Difficile (−10) d\'Athlétisme (Puissance) opposé.',
    },

    // ───────────── Inquisition Player's Guide : Télépathie (ipg p.74-75) ─────────────
    {
        key: 'hallucinate', label: 'Hallucination', labelEn: 'Hallucinate', discipline: 'telepathy', overt: false,
        warpRating: 4, difficulty: -30, range: 'medium', target: 'BFM créatures', duration: 'sustained', spec: 'telepathy',
        source: 'ipg', page: 74,
        summary: 'Jusqu\'à BFM créatures à portée Moyenne font un Test Très ardu (−30) d\'Intuition (Environs) opposé ; les perdantes perçoivent jusqu\'au début de votre prochain tour une même illusion de votre choix, contenue dans une Zone à portée Moyenne. Une Action à chaque tour permet de l\'animer ou de la déplacer (sinon elle se répète). Retest en fin de tour à la discrétion du MJ si la scène est suspecte ; une fois gagné, immunité 1 heure. Aucun dégât physique.',
    },
    {
        key: 'pacify', label: 'Apaisement', labelEn: 'Pacify', discipline: 'telepathy', overt: false,
        warpRating: 3, difficulty: -10, range: 'medium', target: 'BFM créatures', duration: 'instant', spec: 'telepathy',
        source: 'ipg', page: 75,
        summary: 'Jusqu\'à BFM créatures à portée Moyenne doivent gagner un Test Difficile (−10) de Discipline (Psychique) opposé (une cible consciente du pouvoir peut renoncer à s\'opposer) ; les autres perdent l\'état Effrayé et cessent sur-le-champ de ressentir leurs émotions du moment, qui peuvent revenir ensuite normalement.',
    },
    {
        key: 'insinuate', label: 'Insinuation', labelEn: 'Insinuate', discipline: 'telepathy', overt: false,
        warpRating: 3, difficulty: -10, range: 'short', target: '1 créature', duration: 'sustained', spec: 'telepathy',
        source: 'ipg', page: 75,
        summary: 'La cible doit gagner un Test Difficile (−10) de Discipline (Psychique) opposé, sinon elle vous considère comme un ami de confiance jusqu\'au début de votre prochain tour ; elle ignore la tentative. Elle refait le Test chaque fois qu\'elle subit des Dégâts et à la fin de son tour : si elle gagne, le pouvoir prend fin et elle comprend qu\'on a manipulé son esprit (immunité 1 heure).',
    },
];

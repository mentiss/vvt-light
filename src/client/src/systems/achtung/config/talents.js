// src/client/src/systems/achtung/config/talents.js
// Catalogue complet des talents (Chapitre 6 du livre de règles).
// IMPORTANT : les `keywords` sont désormais des clés ANGLAISES canoniques
// (alignées sur SKILLS pour les compétences). Pour l'affichage FR des badges,
// utiliser KEYWORD_LABELS depuis ./keywords.js — ne jamais matcher sur le label.
// Structure : { label, keywords: string[], description, archetype? }

export const TALENTS = {

    // ── Talents génériques (<Skill>) ─────────────────────────────────────────
    advisor: {
        label: 'Conseiller',
        keywords: ['skill'],
        description: 'Choisissez une compétence. Lorsque vous assistez un allié en utilisant cette compétence, l\'allié peut relancer un d20 de son pool.',
    },
    bold: {
        label: 'Audacieux',
        keywords: ['skill'],
        description: 'Choisissez une compétence. Lorsque vous achetez des d20 supplémentaires en générant de la Menace, vous pouvez relancer un d20 de ce pool.',
    },
    cautious: {
        label: 'Prudent',
        keywords: ['skill'],
        description: 'Choisissez une compétence. Lorsque vous achetez des d20 supplémentaires en dépensant du Momentum, vous pouvez relancer un d20 de ce pool.',
    },
    collaboration: {
        label: 'Collaboration',
        keywords: ['skill', 'advanced'],
        description: 'Choisissez une compétence avec un rang de 3+. Lorsqu\'un allié tente un jet avec cette compétence et que vous pouvez communiquer, dépensez 2 Momentum pour lui permettre d\'utiliser votre score et vos focuses pour ce jet.',
    },
    cool_under_pressure: {
        label: 'Sang-froid',
        keywords: ['skill', 'fortune'],
        description: 'Choisissez une compétence. Dépensez 1 Fortune pour réussir automatiquement un jet utilisant cette compétence, mais sans générer de Momentum.',
    },

    // ── Érudition (Academia) ─────────────────────────────────────────────────
    book_smart: {
        label: 'Érudit',
        keywords: ['academia'],
        description: 'Si vous dépensez du Momentum pour Obtenir des Informations lors d\'une scène, vous pouvez réduire de 1 le coût Momentum d\'un d20 bonus acheté plus tard dans cette scène.',
    },
    deep_expertise: {
        label: 'Expert polyvalent',
        keywords: ['academia'],
        description: 'Vous gagnez un focus supplémentaire pour chaque compétence avec un rang de 3+. Si une de vos compétences atteint 3, vous gagnez immédiatement un focus supplémentaire pour elle.',
    },
    did_the_reading: {
        label: 'Bien documenté',
        keywords: ['academia', 'advanced'],
        description: 'Une fois par scène, vous pouvez utiliser Érudition à la place de n\'importe quelle autre compétence, et vous comptez comme ayant un focus pour ce jet.',
    },
    dedication: {
        label: 'Dévouement',
        keywords: ['academia'],
        description: 'Lorsque vous tentez un jet où vous avez un focus applicable, dépensez 1 Fortune pour doubler votre plage de succès critique (jusqu\'à deux fois votre rang).',
    },
    library_dweller: {
        label: 'Habitué des archives',
        keywords: ['academia'],
        description: 'Chaque fois que vous tentez un jet d\'Érudition pour faire des recherches sur un sujet, cela ne prend que la moitié du temps normal.',
    },
    polyglot: {
        label: 'Polyglotte',
        keywords: ['academia'],
        description: 'Requiert le focus Linguistique. Vous gagnez une vérité supplémentaire (Polyglotte) et connaissez trois langues supplémentaires de votre choix. Face à une langue inconnue, dépensez 1 Momentum pour en comprendre le sens global.',
    },
    studious: {
        label: 'Studieux',
        keywords: ['academia'],
        description: 'La première fois que vous Obtenez des Informations lors d\'un jet réussi, vous pouvez poser une question supplémentaire.',
    },

    // ── Athlétisme (Athletics) ───────────────────────────────────────────────
    athletic_prodigy: {
        label: 'Prodige athlétique',
        keywords: ['athletics'],
        description: 'Lors d\'une tâche étendue, si vous réussissez un jet d\'Athlétisme, vous pouvez ajouter +2⚄ à votre jet de stress pour progresser dans la tâche.',
    },
    fighting_fit: {
        label: 'En pleine forme',
        keywords: ['athletics'],
        description: 'Lorsque vous subissez de la fatigue due à un effort physique intense, lancez 1⚄ par point de fatigue subi. Chaque effet annule 1 point de fatigue.',
    },
    hail_mary: {
        label: 'Coup désespéré',
        keywords: ['athletics'],
        description: 'Lorsque vous utilisez une arme de lancer, vous pouvez générer 1 Menace pour augmenter la portée d\'une catégorie et les dégâts de +1⚄.',
    },
    might_makes_right: {
        label: 'La force prime',
        keywords: ['athletics', 'advanced'],
        description: 'Lors d\'un jet opposé pour une attaque de mêlée, vous pouvez utiliser Force + Athlétisme. Vous ignorez aussi la qualité Lourd sur les armes que vous maniez.',
    },
    sure_footed: {
        label: 'Pieds sûrs',
        keywords: ['athletics'],
        description: 'Vous avez un équilibre parfait. Lors d\'un jet d\'Athlétisme, ignorez la première complication. Les adversaires doivent dépenser 3 Momentum (au lieu de 2) pour vous mettre à terre.',
    },
    serpentine: {
        label: 'Zigzag',
        keywords: ['athletics'],
        description: 'Lorsque vous effectuez l\'action Se précipiter, les attaques contre vous ont leur difficulté augmentée de +1 jusqu\'au début de votre prochain tour.',
    },

    // ── Ingénierie (Engineering) ─────────────────────────────────────────────
    demolitions: {
        label: 'Artificier',
        keywords: ['engineering', 'advanced'],
        description: 'Lors d\'un jet d\'Ingénierie impliquant des explosifs, votre premier d20 bonus est gratuit. Vous ignorez aussi la première complication sur un tel jet, une fois par scène.',
    },
    elbow_grease: {
        label: 'Huile de coude',
        keywords: ['engineering'],
        description: 'Lors d\'une tâche étendue de réparation, ignorez 1 résistance pour chaque effet obtenu sur les dés de Challenge.',
    },
    gunsmith: {
        label: 'Armurier',
        keywords: ['engineering'],
        description: 'Au début d\'une mission, choisissez 1 arme à feu dans l\'équipe : elle gagne la qualité Fiable ou perd la qualité Non fiable.',
    },
    jury_rig: {
        label: 'Bricolage d\'urgence',
        keywords: ['engineering'],
        description: 'Lors d\'un jet de réparation, générez 2 Menace pour réduire la difficulté de 1. La réparation tient le reste de la scène, puis la machine tombera en panne dès que le MJ dépensera 2 Menace.',
    },
    saboteur: {
        label: 'Saboteur',
        keywords: ['engineering'],
        description: 'Contre un objet, une structure ou un véhicule immobile, utilisez Ingénierie au lieu de Combat. Les dés de Challenge bonus viennent de Raisonnement. Dépensez 2 Momentum pour convertir un dé de Challenge en effet.',
    },
    make_do_and_mend: {
        label: 'Système D',
        keywords: ['engineering'],
        description: 'Passez une demi-heure à démonter une machine et faites un jet Perception + Ingénierie (difficulté 1) pour récupérer des pièces et reconstituer les ressources d\'une trousse à outils.',
    },

    // ── Combat (Fighting) ────────────────────────────────────────────────────
    defensive: {
        label: 'Défensif',
        keywords: ['fighting'],
        description: 'Choisissez mêlée ou distance. Les attaques de ce type contre vous ont leur difficulté augmentée de 1. Ce talent peut être pris deux fois, une fois pour chaque type.',
    },
    five_rounds_rapid: {
        label: 'Rafale rapide',
        keywords: ['fighting'],
        description: 'Lors d\'une attaque à distance avec utilisation de la Salve, votre premier d20 bonus est gratuit.',
    },
    guardian: {
        label: 'Protecteur',
        keywords: ['fighting'],
        description: 'Lorsqu\'un allié à portée Proche est ciblé par une attaque, vous pouvez effectuer une réaction pour vous substituer à sa place comme cible.',
    },
    mean_right_hook: {
        label: 'Crochet dévastateur',
        keywords: ['fighting'],
        description: 'Vos attaques à mains nues gagnent l\'effet d\'arme Vicieux.',
    },
    sharpshooter: {
        label: 'Tireur d\'élite',
        keywords: ['fighting'],
        description: 'Si vous effectuez l\'action Viser avant une attaque à distance, votre premier d20 bonus est gratuit. L\'attaque gagne aussi la qualité Perforant 1 (ou améliore le Perforant existant de 1).',
    },
    they_dont_like_it_up_em: {
        label: 'La baïonnette, ils n\'aiment pas ça',
        keywords: ['fighting'],
        description: 'Lorsque vous vous déplacez à portée Allonge et effectuez une attaque de mêlée, votre premier d20 bonus est gratuit. En cas de succès, la cible est renversée.',
    },

    // ── Médecine (Medicine) ──────────────────────────────────────────────────
    long_term_care: {
        label: 'Soins prolongés',
        keywords: ['medicine'],
        description: 'Vous pouvez relancer un d20 lors de tout jet de Médecine pour déterminer si un personnage acquiert ou guérit une cicatrice.',
    },
    medic: {
        label: 'Médecin de terrain',
        keywords: ['medicine'],
        description: 'Lorsque vous stabilisez un allié avec succès, dépensez 2 Momentum pour soigner immédiatement une blessure physique qu\'il a subie (il reste à terre).',
    },
    make_do_mend_medicine: {
        label: 'Effet placebo',
        keywords: ['medicine'],
        description: 'Lorsque vous utilisez les ressources d\'une trousse de premiers secours, lancez 1⚄ par utilisation. Chaque effet restitue immédiatement une ressource dépensée.',
    },
    out_of_harms_way: {
        label: 'Hors de danger',
        keywords: ['medicine'],
        description: 'Pour porter ou maîtriser une personne, vous pouvez utiliser Médecine au lieu d\'Athlétisme, en ignorant la première complication de ce jet.',
    },
    reassuring: {
        label: 'Rassurant',
        keywords: ['medicine'],
        description: 'Votre présence apaise les patients. Lors du traitement d\'une blessure mentale, dépensez 2 Momentum pour soigner une blessure mentale supplémentaire.',
    },
    seen_worse: {
        label: 'J\'en ai vu d\'autres',
        keywords: ['medicine', 'advanced'],
        description: 'Dépensez 2 Momentum pour obtenir une résistance morale égale au nombre d\'alliés blessés que vous pouvez voir ou entendre.',
    },

    // ── Observation ──────────────────────────────────────────────────────────
    constantly_watching: {
        label: 'Toujours aux aguets',
        keywords: ['observation'],
        description: 'Lors d\'un jet pour détecter un danger ou des ennemis cachés, réduisez la difficulté de 1 (minimum 0).',
    },
    forward_observer: {
        label: 'Observateur avancé',
        keywords: ['observation'],
        description: 'Si vous communiquez avec un allié portant une arme à qualité Indirecte, assistez son attaque avec Raisonnement + Observation. L\'allié réduit aussi la difficulté de 1.',
    },
    lights_out: {
        label: 'Vision nocturne',
        keywords: ['observation'],
        description: 'Vous fonctionnez efficacement avec très peu de lumière. Ignorez toute augmentation de difficulté ou de portée de complication causée par un faible éclairage (l\'obscurité totale vous affecte normalement).',
    },
    ransack: {
        label: 'Fouille en règle',
        keywords: ['observation'],
        description: 'Lors d\'un jet d\'Observation pour fouiller une zone, générez 2 Menace pour réduire la difficulté de 1 et diviser le temps par deux.',
    },
    scout: {
        label: 'Éclaireur',
        keywords: ['observation'],
        description: 'Au début d\'une scène d\'action, posez 1 question gratuitement, comme si vous aviez dépensé du Momentum pour Obtenir des Informations.',
    },
    scrutinise: {
        label: 'Œil de lynx',
        keywords: ['observation'],
        description: 'Lorsque vous doublez votre dice pool en dehors du combat pour un jet d\'Observation, le premier d20 bonus est gratuit.',
    },

    // ── Persuasion ───────────────────────────────────────────────────────────
    an_answer_for_everything: {
        label: 'Réponse à tout',
        keywords: ['persuasion'],
        description: 'Lors d\'une tâche étendue réussie en Persuasion, relancez un nombre de ⚄ égal à votre rang en Persuasion.',
    },
    hog_the_spotlight: {
        label: 'Monsieur Je-sais-tout',
        keywords: ['persuasion'],
        description: 'Après avoir réussi un jet de Persuasion pour distraire ou retenir l\'attention, dépensez 1 Momentum pour augmenter de +1 la difficulté de tous les jets d\'Observation des ennemis.',
    },
    imposing_presence: {
        label: 'Présence imposante',
        keywords: ['persuasion'],
        description: 'Lors d\'une attaque mentale avec une arme de mêlée, utilisez Persuasion au lieu de Combat, et ajoutez l\'effet Perforant 1 ou Étourdissant à l\'attaque.',
    },
    reasoned_discourse: {
        label: 'Discours raisonné',
        keywords: ['persuasion'],
        description: 'Réduisez la difficulté de vos jets de Persuasion de 1 lorsque vous devez communiquer des informations complexes ou argumenter avec logique.',
    },
    rousing_speaker: {
        label: 'Orateur enflammé',
        keywords: ['persuasion'],
        description: 'Réduisez la difficulté des jets de Persuasion pour convaincre ou haranguer de 1. Vous pouvez aussi tenter un discours de ralliement (action majeure, Volonté + Persuasion difficulté 1) pour donner +1 moral à tous vos alliés, +1 par Momentum dépensé.',
    },
    subtle_cues: {
        label: 'Signaux subtils',
        keywords: ['persuasion'],
        description: 'Après avoir conversé ou observé quelqu\'un lors d\'une scène, lors d\'un jet de Persuasion contre lui dans cette scène, réduisez le coût du premier d20 à 0.',
    },

    // ── Résilience (Resilience) ──────────────────────────────────────────────
    a_stiff_drink: {
        label: 'Un bon verre',
        keywords: ['resilience'],
        description: 'Ajoutez une flasque à vos affaires. Lors d\'une action de Récupération, vous ou un allié peut boire de la flasque pour retirer 1⚄ de stress supplémentaire. Si un effet est obtenu, l\'alcool pénalise tous les jets de +1 à la portée de complication pour le reste de la scène.',
    },
    courageous: {
        label: 'Courageux',
        keywords: ['resilience'],
        description: 'Vous gagnez une résistance au Courage égale à votre rang en Résilience.',
    },
    dauntless: {
        label: 'Intrépide',
        keywords: ['resilience'],
        description: 'Lors d\'un jet pour résister à l\'intimidation, à la peur ou à la panique, votre premier d20 bonus est gratuit.',
    },
    extra_effort: {
        label: 'Effort supplémentaire',
        keywords: ['resilience'],
        description: 'Choisissez un attribut. Lors d\'un jet utilisant cet attribut, vous pouvez acheter des d20 bonus en subissant de la fatigue (1 fatigue par Momentum que vous auriez dépensé).',
    },
    hard_as_nails: {
        label: 'Dur à cuire',
        keywords: ['resilience'],
        description: 'Votre résistance physique (Armure) augmente de +1.',
    },
    second_wind: {
        label: 'Deuxième souffle',
        keywords: ['resilience', 'fortune'],
        description: 'Durant votre tour, dépensez 1 Fortune comme action gratuite pour retirer tout votre stress actuel.',
    },
    tough: {
        label: 'Coriace',
        keywords: ['resilience'],
        description: 'Votre jauge de stress est augmentée de +3.',
    },

    // ── Discrétion (Stealth) ─────────────────────────────────────────────────
    all_the_best_hiding_spots: {
        label: 'Les meilleures cachettes',
        keywords: ['stealth'],
        description: 'Les ennemis tentant un jet de Discrétion en votre présence voient leur difficulté augmentée de +1.',
    },
    exploit_weakness: {
        label: 'Exploiter les failles',
        keywords: ['stealth'],
        description: 'Lors d\'une attaque contre un ennemi non averti ou souffrant d\'une vérité représentant une faiblesse, l\'attaque gagne l\'effet Perforant 2.',
    },
    face_in_the_crowd: {
        label: 'Visage dans la foule',
        keywords: ['stealth'],
        description: 'Vous savez vous fondre dans la masse. Si vous portez une tenue appropriée ou un déguisement convenable, les ennemis qui tentent de vous remarquer dans un groupe ont leur difficulté augmentée de +1.',
    },
    hit_and_run: {
        label: 'Frapper et fuir',
        keywords: ['stealth'],
        description: 'Après une attaque réussie contre une cible non avertie, dépensez 1 Momentum pour vous déplacer à portée Proche. Vous pouvez le faire même si vous avez déjà bougé ce tour.',
    },
    like_a_shadow: {
        label: 'Comme une ombre',
        keywords: ['stealth'],
        description: 'Lorsque la scène implique la vigilance ennemie ou une poursuite, augmentez la résistance de la conséquence de +2.',
    },
    perfect_timing: {
        label: 'Le moment parfait',
        keywords: ['stealth'],
        description: 'Lors d\'un jet de Discrétion avec un délai limité pour atteindre un objectif, le premier d20 bonus est gratuit.',
    },

    // ── Survie (Survival) ────────────────────────────────────────────────────
    companion: {
        label: 'Compagnon fidèle',
        keywords: ['survival'],
        description: 'Vous avez un chien fidèle qui sert d\'allié en situation dangereuse. Le chien est traité comme un PNJ allié sous vos ordres. Si votre chien est tué, vous gagnez immédiatement 1 Fortune, et choisissez entre le remplacer (réentraîner le talent) ou le remplacer par un talent différent.',
    },
    dig_for_victory: {
        label: 'Creuser pour survivre',
        keywords: ['survival'],
        description: 'Lors d\'un jet de Survie pour établir un camp ou une position défensive, vous pouvez réduire le temps nécessaire de moitié.',
    },
    everything_i_need_is_here: {
        label: 'J\'ai tout ce qu\'il faut',
        keywords: ['survival'],
        description: 'Vous pouvez porter un objet majeur supplémentaire sans être alourdi. Cela s\'accumule avec les bonus de Force.',
    },
    fieldcraft: {
        label: 'Art du terrain',
        keywords: ['survival'],
        description: 'Vous pouvez utiliser Survie à la place de Discrétion pour vous dissimuler ou éviter d\'attirer l\'attention dans un environnement rural inhospitalier.',
    },
    survive_and_thrive: {
        label: 'Survivre et prospérer',
        keywords: ['survival'],
        description: 'Lors d\'un jet de Survie pour trouver de la nourriture, de l\'eau ou d\'autres ressources essentielles, réduisez la difficulté de 1 et obtenez de quoi nourrir 1 personne supplémentaire par Momentum dépensé.',
    },
    tracker: {
        label: 'Traqueur',
        keywords: ['survival'],
        description: 'Lors d\'un jet de Survie pour pister, votre premier d20 bonus est gratuit. Si la traque fait partie d\'une tâche étendue, infligez +1 stress par effet obtenu.',
    },

    // ── Tactique (Tactics) ───────────────────────────────────────────────────
    band_of_brothers: {
        label: 'Frères d\'armes',
        keywords: ['tactics'],
        description: 'Au début d\'une scène d\'action, si le pool de Momentum contient moins de points qu\'il n\'y a de personnages avec ce talent, ajoutez immédiatement 1 point au pool de Momentum.',
    },
    call_to_action: {
        label: 'À l\'action !',
        keywords: ['tactics'],
        description: 'En action mineure, accordez une action mineure immédiate à un allié. En action majeure, faites un jet Coordination + Tactique (difficulté 1) pour accorder une action mineure à autant d\'alliés que votre rang en Tactique.',
    },
    convey_intent: {
        label: 'Intention claire',
        keywords: ['tactics'],
        description: 'Vous n\'avez pas besoin de parler pour être compris. Lors d\'un jet de Tactique pour donner des instructions, votre premier d20 bonus est gratuit.',
    },
    decisive_plan: {
        label: 'Plan décisif',
        keywords: ['tactics'],
        description: 'Lors d\'une scène d\'action, lorsque vous assistez un allié, vous pouvez Garder l\'Initiative sans payer le coût habituel en Momentum si cela permet à l\'allié de prendre le prochain tour.',
    },
    direct: {
        label: 'Diriger',
        keywords: ['tactics'],
        description: 'En action majeure lors d\'une scène d\'action, désignez un allié avec lequel vous pouvez communiquer : il peut immédiatement tenter une action majeure. Pour les jets, vous l\'assistez avec votre Tactique.',
    },
    teamwork: {
        label: 'Travail d\'équipe',
        keywords: ['tactics'],
        description: 'Lorsque vous menez ou assistez un jet, si un personnage impliqué a un focus applicable, tout le monde compte comme ayant ce focus. Pour une tâche étendue, ajoutez +2⚄ au pool de stress.',
    },

    // ── Véhicules (Vehicles) ─────────────────────────────────────────────────
    combat_gunner: {
        label: 'Artilleur de combat',
        keywords: ['vehicles'],
        description: 'Vous pouvez utiliser votre compétence Véhicules à la place de Combat lors d\'une attaque avec une arme montée sur un véhicule.',
    },
    drive_all_night: {
        label: 'Conduire toute la nuit',
        keywords: ['vehicles'],
        description: 'Lorsque vous opérez un véhicule, utilisez Véhicules à la place de Résilience pour résister à la fatigue causée par l\'épuisement ou le manque de sommeil.',
    },
    off_road: {
        label: 'Tout-terrain',
        keywords: ['vehicles'],
        description: 'Réduisez de 1 la difficulté de tous vos jets de terrain pour les véhicules.',
    },
    smuggler: {
        label: 'Contrebandier',
        keywords: ['vehicles'],
        description: 'Pour dissimuler des personnes ou du matériel dans un véhicule, utilisez Véhicules au lieu de Discrétion, et pouvez relancer 1d20 dans le pool.',
    },
    still_in_control: {
        label: 'Toujours maître à bord',
        keywords: ['vehicles'],
        description: 'Lorsqu\'un véhicule que vous conduisez subit une complication, c\'est vous qui décidez des effets (le MJ peut veto ce qui serait hors contexte).',
    },
    strafing_run: {
        label: 'Tir en rase-mottes',
        keywords: ['vehicles', 'advanced'],
        description: 'Lors d\'une attaque en salve depuis un véhicule, ignorez les augmentations de difficulté ou de portée de complication causées par la vitesse ou le terrain accidenté.',
    },

    // ── Étrange (Weird) ──────────────────────────────────────────────────────
    bizarre_insight: {
        label: 'Étrange prémonition',
        keywords: ['weird'],
        description: 'Une fois par scène, générez 1 Menace pour poser une question au MJ (comme si vous aviez dépensé du Momentum pour Obtenir des Informations) sans avoir à réussir un jet.',
    },
    foreboding_survival: {
        label: 'Pressentiment de survie',
        keywords: ['weird'],
        description: 'Une fois par session, lorsque vous subissez une blessure, générez 3 Menace pour l\'éviter. À la discrétion du MJ, vous pouvez être proposé d\'éviter d\'autres malheurs contre 3 Menace.',
    },
    minor_pact: {
        label: 'Pacte mineur',
        keywords: ['weird'],
        description: 'Si vous laissez chaque nuit de la nourriture et des boissons dehors, elles disparaissent et quelque chose de bon vous arrive. Vous gagnez 1 Fortune supplémentaire au début de chaque aventure. Des offrandes plus importantes peuvent apporter de plus grands bénéfices.',
    },
    mystical_power: {
        label: 'Pouvoir mystique',
        keywords: ['weird'],
        description: 'Réservé aux lanceurs de sorts. Vous pouvez augmenter votre Puissance de +2⚄ lors d\'un sort, mais chaque allié à portée Proche subit 1 stress mental par effet obtenu sur le Coût.',
    },
    numb_to_the_horrors: {
        label: 'Insensible aux horreurs',
        keywords: ['weird'],
        description: 'Vous augmentez votre résistance au Courage de +6, et pouvez relancer 1d20 sur tout jet pour éviter une cicatrice mentale. En contrepartie, votre détachement apparent augmente de +1 la portée de complication de tous vos jets de Persuasion.',
    },
    occult_dabbler: {
        label: 'Touche-à-tout de l\'occulte',
        keywords: ['weird', 'spellcaster'],
        description: 'Vous avez expérimenté les forces occultes. Vous devenez lanceur de sorts de type Amateur, comme décrit dans le Chapitre 9 : Magie et le Mythe.',
    },

    // ── Talents d'archétype (Boffin) ─────────────────────────────────────────
    prototype: {
        label: 'Prototype',
        keywords: ['boffin', 'engineering'],
        archetype: 'boffin',
        description: 'Vous pouvez construire des appareils expérimentaux avec un jet d\'Ingénierie difficulté 2. Quiconque utilise l\'appareil peut appliquer son talent à ses jets. Après chaque utilisation, lancez 1⚄ (plus 1⚄ par utilisation antérieure) : si un effet sort, l\'appareil tombe en panne irrémédiablement.',
    },
    lifesaver: {
        label: 'Sauveur',
        keywords: ['boffin', 'fortune', 'medicine'],
        archetype: 'boffin',
        description: 'Réduisez de 1 la difficulté de tout jet de Médecine pour stabiliser un personnage mourant ou le réanimer. Vous pouvez aussi tenter de sauver quelqu\'un mort dans la scène actuelle : dépensez 1 Fortune et réussissez un jet Coordination + Médecine (difficulté 3) pour le mettre hors combat plutôt que mort.',
    },
    push_the_limits: {
        label: 'Pousser les limites',
        keywords: ['boffin', 'vehicles'],
        archetype: 'boffin',
        description: 'Si vous pouvez accéder au moteur d\'un véhicule, faites un jet Coordination + Véhicules (difficulté 3). En cas de succès, augmentez la Vitesse de 1 ou réduisez l\'Échelle de 1 pour les manœuvres. Ces ajustements rendent le véhicule peu fiable : tout jet pour l\'opérer augmente sa portée de complication de 1.',
    },

    // ── Talents d'archétype (Commander) ─────────────────────────────────────
    opportunist: {
        label: 'Opportuniste',
        keywords: ['commander', 'fighting'],
        archetype: 'commander',
        description: 'Lorsqu\'un ennemi subit une complication ou échoue à un jet difficulté 3+, vous pouvez dépenser 2 Momentum en réaction pour créer immédiatement une vérité tactique avantageuse qui dure jusqu\'à la fin de la scène d\'action.',
    },
    wilderness_guide: {
        label: 'Guide des étendues sauvages',
        keywords: ['commander', 'survival'],
        archetype: 'commander',
        description: 'Vous êtes habile pour garder votre groupe en vie en terrain hostile. Lorsqu\'un membre du groupe tente un jet de Survie auquel vous ne pouvez pas l\'aider, vous pouvez dépenser 2 Momentum pour l\'assister quand même. Ce jet augmente sa portée de complication de 1.',
    },
    born_leader: {
        label: 'Meneur né',
        keywords: ['commander', 'tactics', 'fortune'],
        archetype: 'commander',
        description: 'Vous êtes un leader naturel. Vous pouvez dépenser 1 Fortune pour qu\'un seul allié gagne immédiatement 1 Fortune.',
    },

    // ── Talents d'archétype (Con Artist) ────────────────────────────────────
    cold_reading: {
        label: 'Lecture à froid',
        keywords: ['con_artist', 'observation'],
        archetype: 'con_artist',
        description: 'Vous savez utiliser des observations simples et des questions orientées pour paraître omniscient. En conversation, dépensez 2 Momentum pour faire une lecture à froid : les autres personnages non initiés croiront que vous avez une source d\'information précise.',
    },
    a_way_with_words: {
        label: 'Avoir le bagou',
        keywords: ['con_artist', 'persuasion'],
        archetype: 'con_artist',
        description: 'Vous ne dites jamais plus que nécessaire. Lorsque vous subissez une complication lors d\'un jet de Persuasion, dépensez 1 Momentum pour l\'annuler.',
    },
    chameleon: {
        label: 'Caméléon',
        keywords: ['con_artist', 'stealth', 'fortune'],
        archetype: 'con_artist',
        description: 'Vous êtes maître du déguisement. Lorsque vous adoptez un déguisement, dépensez 1 Fortune pour établir que vous disposez déjà d\'un alias approprié, avec les papiers correspondants et d\'autres accessoires soit sur vous, soit dans un lieu sûr à proximité.',
    },

    // ── Talents d'archétype (Grease Monkey) ─────────────────────────────────
    keep_it_steady: {
        label: 'Tenir la route',
        keywords: ['grease_monkey', 'engineering'],
        archetype: 'grease_monkey',
        description: 'Lorsque vous opérez un véhicule sur lequel vous avez travaillé, dépensez 2 Momentum lors d\'un jet de Véhicules pour ignorer les effets de toute blessure subie par le véhicule pour ce jet.',
    },
    quartermaster: {
        label: 'Quartier-maître',
        keywords: ['grease_monkey', 'persuasion', 'fortune'],
        archetype: 'grease_monkey',
        description: 'Vous êtes habitué à transporter des fournitures et à gérer des approvisionnements. Dépensez 1 Fortune pour révéler que vous disposez d\'un objet spécifique caché sur vous, dans un véhicule ou dans un lieu proche. Cet objet doit être mineur (restriction ≤3, non arme sauf qualité Lancé).',
    },
    born_to_drive: {
        label: 'Né pour conduire',
        keywords: ['grease_monkey', 'vehicles'],
        archetype: 'grease_monkey',
        description: 'Vous maîtrisez totalement tout véhicule. Lors d\'un jet de Véhicules difficulté 3+, vous pouvez dépenser jusqu\'à 3 Momentum pour réduire la difficulté de 1 par Momentum dépensé. La portée de complication augmente du même montant que la difficulté réduite.',
    },

    // ── Talents d'archétype (Infiltrator) ───────────────────────────────────
    acrobatic: {
        label: 'Acrobatique',
        keywords: ['infiltrator', 'athletics'],
        archetype: 'infiltrator',
        description: 'Vous êtes extrêmement souple et athlétique. Lors d\'un déplacement autour d\'un obstacle, dépensez 2 Momentum pour le contourner immédiatement sans jet, sans équipement d\'escalade et sans consommer votre action de déplacement.',
    },
    assassination: {
        label: 'Assassination',
        keywords: ['infiltrator', 'fighting'],
        archetype: 'infiltrator',
        description: 'Vous êtes redoutable contre les cibles non averties. Contre une cible non avertie, dépensez 2 Momentum pour effectuer une assassination : l\'attaque gagne l\'effet Intense. Si la cible est vaincue, l\'attaque est silencieuse.',
    },
    silent_step: {
        label: 'Pas silencieux',
        keywords: ['infiltrator', 'stealth'],
        archetype: 'infiltrator',
        description: 'Vos pas sont incroyablement silencieux. Lors d\'une complication sur un jet de Discrétion, dépensez 1 Momentum pour l\'annuler.',
    },

    // ── Talents d'archétype (Investigator) ──────────────────────────────────
    polymath: {
        label: 'Polymathe',
        keywords: ['investigator', 'academia'],
        archetype: 'investigator',
        description: 'Une fois par scène, dépensez 2 Momentum pour gagner un focus supplémentaire pendant la durée de la scène, choisi parmi n\'importe quelle compétence avec un rang de 2+.',
    },
    the_cutting_edge: {
        label: 'À la pointe',
        keywords: ['investigator', 'medicine'],
        archetype: 'investigator',
        description: 'Vous maîtrisez les dernières avancées médicales. Lors d\'un jet de Médecine difficulté 3+, dépensez jusqu\'à 3 Momentum pour réduire la difficulté de 1 par Momentum. La portée de complication augmente du même montant.',
    },
    detailed_analysis: {
        label: 'Analyse détaillée',
        keywords: ['investigator', 'observation'],
        archetype: 'investigator',
        description: 'Vous avez une attention exceptionnelle aux détails. Une fois par scène, dépensez 2 Momentum pour poser immédiatement 3 questions au MJ sur la scène — comme si vous aviez dépensé du Momentum pour Obtenir des Informations — sans jet préalable.',
    },

    // ── Talents d'archétype (Occultist) ─────────────────────────────────────
    occult_scholar: {
        label: 'Érudit de l\'occulte',
        keywords: ['occultist', 'academia', 'spellcaster'],
        archetype: 'occultist',
        description: 'Vous êtes versé dans les traditions occultes et la parapsychologie. Vous êtes un lanceur de sorts (voir Chapitre 9). Vous gagnez un Courage égal à votre rang en Érudition (ne se cumule pas avec Courageux).',
    },
    summoner: {
        label: 'Invocateur',
        keywords: ['occultist', 'persuasion', 'spellcaster'],
        archetype: 'occultist',
        description: 'Vous avez communiqué avec des entités au-delà du monde matériel. Vous êtes un lanceur de sorts (voir Chapitre 9). Lors d\'une invocation réussie, dépensez 2 Momentum pour obtenir l\'obéissance de la créature invoquée pendant un nombre de minutes égal à votre rang en Persuasion.',
    },
    a_price_to_pay: {
        label: 'Un prix à payer',
        keywords: ['occultist', 'resilience', 'spellcaster'],
        archetype: 'occultist',
        description: 'Vous comprenez que la magie a toujours un coût. Vous êtes un lanceur de sorts (voir Chapitre 9). Après avoir lancé un sort avec succès, vous pouvez gagner 2 Momentum bonus, utilisable uniquement pour améliorer les effets du sort. Le Coût du sort augmente de +2⚄ et devient du stress physique.',
    },

    // ── Talents d'archétype (Soldier) ────────────────────────────────────────
    army_of_one: {
        label: 'À lui seul une armée',
        keywords: ['soldier', 'fighting'],
        archetype: 'soldier',
        description: 'Vous êtes redoutable avec une grande variété d\'armes. Lors d\'une attaque, dépensez 2 Momentum pour ajouter l\'un des effets suivants : Drainer, Percer, ou Étourdir. Un seul effet de dégâts peut être ajouté par ce biais.',
    },
    draw_their_fire: {
        label: 'Attirez leur feu !',
        keywords: ['soldier', 'resilience'],
        archetype: 'soldier',
        description: 'Vous protégez vos alliés en attirant l\'attention ennemie. Après avoir fait une attaque, dépensez 2 Momentum pour forcer tout ennemi à portée qui ciblerait un de vos alliés à vous cibler vous à la place (difficulté +1 pour leurs attaques sur vos alliés).',
    },
    own_the_battlefield: {
        label: 'Maître du champ de bataille',
        keywords: ['soldier', 'survival', 'fortune'],
        archetype: 'soldier',
        description: 'Vous êtes un guerrier rusé qui tire parti du terrain. Dépensez 1 Fortune pour déclencher l\'une des réactions suivantes — Tir éclair (ennemi à portée Moyenne qui échoue un test de déplacement : infligez des dégâts égaux à votre Combat) ou Couchez-vous ! (allié à portée Moyenne ciblé par un tir : il gagne une couverture égale à votre Observation).',
    },
};
// src/client/src/systems/achtung/config.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Configuration CLIENT du système Achtung! Cthulhu (2D20 Modiphius).
// ⚠️  Module ES — uniquement importé par le frontend React.
// ─────────────────────────────────────────────────────────────────────────────

import { RollError } from '../../tools/diceEngine.js';
import AchtungHistoryEntry from './components/AchtungHistoryEntry.jsx';


// ══════════════════════════════════════════════════════════════════════════════
// DONNÉES SYSTÈME — BRIQUES DE BASE
// ══════════════════════════════════════════════════════════════════════════════

export const ATTRIBUTES = [
    { key: 'agility',      label: 'Agilité',        description: 'Vitesse, équilibre, mémoire musculaire. Un personnage agile se déplace rapidement et silencieusement. Utilisé pour les attaques à distance.' },
    { key: 'brawn',        label: 'Force',           description: 'Condition physique et endurance. Un personnage fort est robuste et résistant. Détermine le stress maximum et la résistance aux dégâts (Armure).' },
    { key: 'coordination', label: 'Coordination',    description: 'Précision, timing, dextérité fine. Bons tireurs, bons pilotes, habiles de leurs mains. Utilisé pour les attaques à distance.' },
    { key: 'insight',      label: 'Intuition',       description: 'Perception, instincts, intelligence de la rue. Discernement et sagesse pratique. Ajoute des dés de Challenge aux attaques à distance.' },
    { key: 'reason',       label: 'Raisonnement',    description: 'Logique, intellect, savoir acquis. Personnages lucides, rationnels ou contemplatifs. Détermine les langues bonus.' },
    { key: 'will',         label: 'Volonté',         description: 'Force intérieure, discipline mentale. Personnages têtus et déterminés. Détermine le stress maximum et la résistance mentale (Courage).' },
];

export const SKILLS = [
    { key: 'academia',    label: 'Érudition',    focuses: ['Art', 'Cryptographie', 'Finance', 'Histoire', 'Linguistique', 'Occultisme', 'Science'] },
    { key: 'athletics',   label: 'Athlétisme',   focuses: ['Escalade', 'Force', 'Entraînement physique', 'Course', 'Natation', 'Lancer'] },
    { key: 'engineering', label: 'Ingénierie',   focuses: ['Architecture', 'Génie de combat', 'Électronique', 'Explosifs', 'Génie mécanique'] },
    { key: 'fighting',    label: 'Combat',       focuses: ['Corps à corps', 'Armes de poing', 'Main nue', 'Armes lourdes', 'Armes de mêlée', 'Fusils', 'Vigilance', 'Exotique'] },
    { key: 'medicine',    label: 'Médecine',     focuses: ['Premiers secours', 'Maladies infectieuses', 'Pharmacologie', 'Psychiatrie', 'Chirurgie', 'Toxicologie'] },
    { key: 'observation', label: 'Observation',  focuses: ['Ouïe', 'Instinct', 'Vue', 'Odorat et goût'] },
    { key: 'persuasion',  label: 'Persuasion',   focuses: ['Charme', 'Insinuation', 'Intimidation', 'Négociation', 'Rhétorique', 'Tromperie', 'Invocation'] },
    { key: 'resilience',  label: 'Résilience',   focuses: ['Endurance', 'Discipline', 'Immunité'] },
    { key: 'stealth',     label: 'Discrétion',   focuses: ['Camouflage', 'Déguisement', 'Discrétion rurale', 'Discrétion urbaine'] },
    { key: 'survival',    label: 'Survie',       focuses: ['Dressage', 'Cueillette', 'Chasse', 'Mysticisme', 'Orientation', 'Pistage'] },
    { key: 'tactics',     label: 'Tactique',     focuses: ['Aviation', 'Armée de terre', 'Opérations clandestines', 'Commandement', 'Marine', 'Projets techniques'] },
    { key: 'vehicles',    label: 'Véhicules',    focuses: ['Voitures', 'Motos', 'Véhicules lourds', 'Chars', 'Aéronefs', 'Embarcations'] },
];

// Lookup rapide label compétence
export const SKILL_LABEL = Object.fromEntries(SKILLS.map(s => [s.key, s.label]));
export const ATTR_LABEL  = Object.fromEntries(ATTRIBUTES.map(a => [a.key, a.label]));

// ── Listes plates (pour Sheet / selects) ─────────────────────────────────────

export const ARCHETYPES = [
    { key: 'boffin',        label: 'Boffin' },
    { key: 'commander',     label: 'Commandant' },
    { key: 'con_artist',    label: 'Escroc' },
    { key: 'grease_monkey', label: 'Mécano' },
    { key: 'infiltrator',   label: 'Infiltrateur' },
    { key: 'investigator',  label: 'Investigateur' },
    { key: 'occultist',     label: 'Occultiste' },
    { key: 'soldier',       label: 'Soldat' },
];

export const BACKGROUNDS = [
    { key: 'academic',          label: 'Universitaire' },
    { key: 'air_force',         label: 'Armée de l\'air' },
    { key: 'army',              label: 'Armée de terre' },
    { key: 'athlete',           label: 'Athlète' },
    { key: 'covert_operative',  label: 'Agent clandestin' },
    { key: 'criminal',          label: 'Criminel' },
    { key: 'driver',            label: 'Chauffeur' },
    { key: 'engineer',          label: 'Ingénieur' },
    { key: 'entertainer',       label: 'Artiste' },
    { key: 'journalist',        label: 'Journaliste' },
    { key: 'labourer',          label: 'Ouvrier' },
    { key: 'military_officer',  label: 'Officier militaire' },
    { key: 'navy',              label: 'Marine' },
    { key: 'physician',         label: 'Médecin' },
    { key: 'police',            label: 'Police' },
    { key: 'politician',        label: 'Politicien' },
    { key: 'resistance',        label: 'Résistance' },
    { key: 'spiritual_leader',  label: 'Guide spirituel' },
    { key: 'veteran_great_war', label: 'Vétéran de la Grande Guerre' },
    { key: 'wanted',            label: 'Recherché par les autorités' },
];

export const CHARACTERISTICS = [
    { key: 'bookworm',               label: 'Rat de bibliothèque' },
    { key: 'born_behind_wheel',      label: 'Né derrière un volant' },
    { key: 'built_brick_outhouse',   label: 'Bâti comme une armoire' },
    { key: 'conscientious_objector', label: 'Objecteur de conscience' },
    { key: 'criminal_mindset',       label: 'Esprit criminel' },
    { key: 'dilettante',             label: 'Dilettante' },
    { key: 'dreamwalker',            label: 'Marcheur de rêves' },
    { key: 'escaped_europe',         label: 'Évadé d\'Europe' },
    { key: 'experimental_subject',   label: 'Sujet d\'expérience' },
    { key: 'my_war_started_early',   label: 'Ma guerre a commencé tôt' },
    { key: 'nomadic',                label: 'Nomade' },
    { key: 'own_occult_artefact',    label: 'Possesseur d\'artefact occulte' },
    { key: 'raised_by_cult',         label: 'Élevé dans une secte' },
    { key: 'raised_colonies',        label: 'Élevé dans les colonies' },
    { key: 'read_occult_book',       label: 'A lu un grimoire maudit' },
    { key: 'scientific_visionary',   label: 'Visionnaire scientifique' },
    { key: 'street_kid',             label: 'Enfant des rues' },
    { key: 'the_lucky_one',          label: 'Le miraculé' },
    { key: 'veteran_great_war',      label: 'Vétéran de la Grande Guerre' },
    { key: 'wanted_young_at_heart',  label: 'Recherché / Jeune de cœur' },
];

// ══════════════════════════════════════════════════════════════════════════════
// TALENTS — données complètes, centralisées ici pour tout le slug
// Structure : { key, label, keywords: string[], description, archetype? }
// ══════════════════════════════════════════════════════════════════════════════

export const TALENTS = {

    // ── Talents génériques (<Skill>) ─────────────────────────────────────────
    advisor: {
        label: 'Conseiller',
        keywords: ['<Compétence>'],
        description: 'Choisissez une compétence. Lorsque vous assistez un allié en utilisant cette compétence, l\'allié peut relancer un d20 de son pool.',
    },
    bold: {
        label: 'Audacieux',
        keywords: ['<Compétence>'],
        description: 'Choisissez une compétence. Lorsque vous achetez des d20 supplémentaires en générant de la Menace, vous pouvez relancer un d20 de ce pool.',
    },
    cautious: {
        label: 'Prudent',
        keywords: ['<Compétence>'],
        description: 'Choisissez une compétence. Lorsque vous achetez des d20 supplémentaires en dépensant du Momentum, vous pouvez relancer un d20 de ce pool.',
    },
    collaboration: {
        label: 'Collaboration',
        keywords: ['<Compétence>', 'Avancé'],
        description: 'Choisissez une compétence avec un rang de 3+. Lorsqu\'un allié tente un jet avec cette compétence et que vous pouvez communiquer, dépensez 2 Momentum pour lui permettre d\'utiliser votre score et vos focuses pour ce jet.',
    },
    cool_under_pressure: {
        label: 'Sang-froid',
        keywords: ['<Compétence>', 'Fortune'],
        description: 'Choisissez une compétence. Dépensez 1 Fortune pour réussir automatiquement un jet utilisant cette compétence, mais sans générer de Momentum.',
    },

    // ── Érudition (Academia) ─────────────────────────────────────────────────
    book_smart: {
        label: 'Érudit',
        keywords: ['Érudition'],
        description: 'Si vous dépensez du Momentum pour Obtenir des Informations lors d\'une scène, vous pouvez réduire de 1 le coût Momentum d\'un d20 bonus acheté plus tard dans cette scène.',
    },
    deep_expertise: {
        label: 'Expert polyvalent',
        keywords: ['Érudition'],
        description: 'Vous gagnez un focus supplémentaire pour chaque compétence avec un rang de 3+. Si une de vos compétences atteint 3, vous gagnez immédiatement un focus supplémentaire pour elle.',
    },
    did_the_reading: {
        label: 'Bien documenté',
        keywords: ['Érudition', 'Avancé'],
        description: 'Une fois par scène, vous pouvez utiliser Érudition à la place de n\'importe quelle autre compétence, et vous comptez comme ayant un focus pour ce jet.',
    },
    dedication: {
        label: 'Dévouement',
        keywords: ['Érudition'],
        description: 'Lorsque vous tentez un jet où vous avez un focus applicable, dépensez 1 Fortune pour doubler votre plage de succès critique (jusqu\'à deux fois votre rang).',
    },
    library_dweller: {
        label: 'Habitué des archives',
        keywords: ['Érudition'],
        description: 'Chaque fois que vous tentez un jet d\'Érudition pour faire des recherches sur un sujet, cela ne prend que la moitié du temps normal.',
    },
    polyglot: {
        label: 'Polyglotte',
        keywords: ['Érudition'],
        description: 'Requiert le focus Linguistique. Vous gagnez une vérité supplémentaire (Polyglotte) et connaissez trois langues supplémentaires de votre choix. Face à une langue inconnue, dépensez 1 Momentum pour en comprendre le sens global.',
    },
    studious: {
        label: 'Studieux',
        keywords: ['Érudition'],
        description: 'La première fois que vous Obtenez des Informations lors d\'un jet réussi, vous pouvez poser une question supplémentaire.',
    },

    // ── Athlétisme (Athletics) ───────────────────────────────────────────────
    athletic_prodigy: {
        label: 'Prodige athlétique',
        keywords: ['Athlétisme'],
        description: 'Lors d\'une tâche étendue, si vous réussissez un jet d\'Athlétisme, vous pouvez ajouter +2⚄ à votre jet de stress pour progresser dans la tâche.',
    },
    fighting_fit: {
        label: 'En pleine forme',
        keywords: ['Athlétisme'],
        description: 'Lorsque vous subissez de la fatigue due à un effort physique intense, lancez 1⚄ par point de fatigue subi. Chaque effet annule 1 point de fatigue.',
    },
    hail_mary: {
        label: 'Coup désespéré',
        keywords: ['Athlétisme'],
        description: 'Lorsque vous utilisez une arme de lancer, vous pouvez générer 1 Menace pour augmenter la portée d\'une catégorie et les dégâts de +1⚄.',
    },
    might_makes_right: {
        label: 'La force prime',
        keywords: ['Athlétisme', 'Avancé'],
        description: 'Lors d\'un jet opposé pour une attaque de mêlée, vous pouvez utiliser Force + Athlétisme. Vous ignorez aussi la qualité Lourd sur les armes que vous maniez.',
    },
    sure_footed: {
        label: 'Pieds sûrs',
        keywords: ['Athlétisme'],
        description: 'Vous avez un équilibre parfait. Lors d\'un jet d\'Athlétisme, ignorez la première complication. Les adversaires doivent dépenser 3 Momentum (au lieu de 2) pour vous mettre à terre.',
    },
    serpentine: {
        label: 'Zigzag',
        keywords: ['Athlétisme'],
        description: 'Lorsque vous effectuez l\'action Se précipiter, les attaques contre vous ont leur difficulté augmentée de +1 jusqu\'au début de votre prochain tour.',
    },

    // ── Ingénierie (Engineering) ─────────────────────────────────────────────
    demolitions: {
        label: 'Artificier',
        keywords: ['Ingénierie', 'Avancé'],
        description: 'Lors d\'un jet d\'Ingénierie impliquant des explosifs, votre premier d20 bonus est gratuit. Vous ignorez aussi la première complication sur un tel jet, une fois par scène.',
    },
    elbow_grease: {
        label: 'Huile de coude',
        keywords: ['Ingénierie'],
        description: 'Lors d\'une tâche étendue de réparation, ignorez 1 résistance pour chaque effet obtenu sur les dés de Challenge.',
    },
    gunsmith: {
        label: 'Armurier',
        keywords: ['Ingénierie'],
        description: 'Au début d\'une mission, choisissez 1 arme à feu dans l\'équipe : elle gagne la qualité Fiable ou perd la qualité Non fiable.',
    },
    jury_rig: {
        label: 'Bricolage d\'urgence',
        keywords: ['Ingénierie'],
        description: 'Lors d\'un jet de réparation, générez 2 Menace pour réduire la difficulté de 1. La réparation tient le reste de la scène, puis la machine tombera en panne dès que le MJ dépensera 2 Menace.',
    },
    saboteur: {
        label: 'Saboteur',
        keywords: ['Ingénierie'],
        description: 'Contre un objet, une structure ou un véhicule immobile, utilisez Ingénierie au lieu de Combat. Les dés de Challenge bonus viennent de Raisonnement. Dépensez 2 Momentum pour convertir un dé de Challenge en effet.',
    },
    make_do_and_mend: {
        label: 'Système D',
        keywords: ['Ingénierie'],
        description: 'Passez une demi-heure à démonter une machine et faites un jet Intuition + Ingénierie (difficulté 1) pour récupérer des pièces et reconstituer les ressources d\'une trousse à outils.',
    },

    // ── Combat (Fighting) ────────────────────────────────────────────────────
    defensive: {
        label: 'Défensif',
        keywords: ['Combat'],
        description: 'Choisissez mêlée ou distance. Les attaques de ce type contre vous ont leur difficulté augmentée de 1. Ce talent peut être pris deux fois, une fois pour chaque type.',
    },
    five_rounds_rapid: {
        label: 'Rafale rapide',
        keywords: ['Combat'],
        description: 'Lors d\'une attaque à distance avec utilisation de la Salve, votre premier d20 bonus est gratuit.',
    },
    guardian: {
        label: 'Protecteur',
        keywords: ['Combat'],
        description: 'Lorsqu\'un allié à portée Proche est ciblé par une attaque, vous pouvez effectuer une réaction pour vous substituer à sa place comme cible.',
    },
    mean_right_hook: {
        label: 'Crochet dévastateur',
        keywords: ['Combat'],
        description: 'Vos attaques à mains nues gagnent l\'effet d\'arme Vicieux.',
    },
    sharpshooter: {
        label: 'Tireur d\'élite',
        keywords: ['Combat'],
        description: 'Si vous effectuez l\'action Viser avant une attaque à distance, votre premier d20 bonus est gratuit. L\'attaque gagne aussi la qualité Perforant 1 (ou améliore le Perforant existant de 1).',
    },
    they_dont_like_it_up_em: {
        label: 'La baïonnette, ils n\'aiment pas ça',
        keywords: ['Combat'],
        description: 'Lorsque vous vous déplacez à portée Allonge et effectuez une attaque de mêlée, votre premier d20 bonus est gratuit. En cas de succès, la cible est renversée.',
    },

    // ── Médecine (Medicine) ──────────────────────────────────────────────────
    long_term_care: {
        label: 'Soins prolongés',
        keywords: ['Médecine'],
        description: 'Vous pouvez relancer un d20 lors de tout jet de Médecine pour déterminer si un personnage acquiert ou guérit une cicatrice.',
    },
    medic: {
        label: 'Médecin de terrain',
        keywords: ['Médecine'],
        description: 'Lorsque vous stabilisez un allié avec succès, dépensez 2 Momentum pour soigner immédiatement une blessure physique qu\'il a subie (il reste à terre).',
    },
    make_do_mend_medicine: {
        label: 'Effet placebo',
        keywords: ['Médecine'],
        description: 'Lorsque vous utilisez les ressources d\'une trousse de premiers secours, lancez 1⚄ par utilisation. Chaque effet restitue immédiatement une ressource dépensée.',
    },
    out_of_harms_way: {
        label: 'Hors de danger',
        keywords: ['Médecine'],
        description: 'Pour porter ou maîtriser une personne, vous pouvez utiliser Médecine au lieu d\'Athlétisme, en ignorant la première complication de ce jet.',
    },
    reassuring: {
        label: 'Rassurant',
        keywords: ['Médecine'],
        description: 'Votre présence apaise les patients. Lors du traitement d\'une blessure mentale, dépensez 2 Momentum pour soigner une blessure mentale supplémentaire.',
    },
    seen_worse: {
        label: 'J\'en ai vu d\'autres',
        keywords: ['Médecine', 'Avancé'],
        description: 'Dépensez 2 Momentum pour obtenir une résistance morale égale au nombre d\'alliés blessés que vous pouvez voir ou entendre.',
    },

    // ── Observation ──────────────────────────────────────────────────────────
    constantly_watching: {
        label: 'Toujours aux aguets',
        keywords: ['Observation'],
        description: 'Lors d\'un jet pour détecter un danger ou des ennemis cachés, réduisez la difficulté de 1 (minimum 0).',
    },
    forward_observer: {
        label: 'Observateur avancé',
        keywords: ['Observation'],
        description: 'Si vous communiquez avec un allié portant une arme à qualité Indirecte, assistez son attaque avec Raisonnement + Observation. L\'allié réduit aussi la difficulté de 1.',
    },
    lights_out: {
        label: 'Vision nocturne',
        keywords: ['Observation'],
        description: 'Vous fonctionnez efficacement avec très peu de lumière. Ignorez toute augmentation de difficulté ou de portée de complication causée par un faible éclairage (l\'obscurité totale vous affecte normalement).',
    },
    ransack: {
        label: 'Fouille en règle',
        keywords: ['Observation'],
        description: 'Lors d\'un jet d\'Observation pour fouiller une zone, générez 2 Menace pour réduire la difficulté de 1 et diviser le temps par deux.',
    },
    scout: {
        label: 'Éclaireur',
        keywords: ['Observation'],
        description: 'Au début d\'une scène d\'action, posez 1 question gratuitement, comme si vous aviez dépensé du Momentum pour Obtenir des Informations.',
    },
    scrutinise: {
        label: 'Œil de lynx',
        keywords: ['Observation'],
        description: 'Lorsque vous doublez votre dice pool en dehors du combat pour un jet d\'Observation, le premier d20 bonus est gratuit.',
    },

    // ── Persuasion ───────────────────────────────────────────────────────────
    an_answer_for_everything: {
        label: 'Réponse à tout',
        keywords: ['Persuasion'],
        description: 'Lors d\'une tâche étendue réussie en Persuasion, relancez un nombre de ⚄ égal à votre rang en Persuasion.',
    },
    hog_the_spotlight: {
        label: 'Monsieur Je-sais-tout',
        keywords: ['Persuasion'],
        description: 'Après avoir réussi un jet de Persuasion pour distraire ou retenir l\'attention, dépensez 1 Momentum pour augmenter de +1 la difficulté de tous les jets d\'Observation des ennemis.',
    },
    imposing_presence: {
        label: 'Présence imposante',
        keywords: ['Persuasion'],
        description: 'Lors d\'une attaque mentale avec une arme de mêlée, utilisez Persuasion au lieu de Combat, et ajoutez l\'effet Perforant 1 ou Étourdissant à l\'attaque.',
    },
    reasoned_discourse: {
        label: 'Discours raisonné',
        keywords: ['Persuasion'],
        description: 'Réduisez la difficulté de vos jets de Persuasion de 1 lorsque vous devez communiquer des informations complexes ou argumenter avec logique.',
    },
    rousing_speaker: {
        label: 'Orateur enflammé',
        keywords: ['Persuasion'],
        description: 'Réduisez la difficulté des jets de Persuasion pour convaincre ou haranguer de 1. Vous pouvez aussi tenter un discours de ralliement (action majeure, Volonté + Persuasion difficulté 1) pour donner +1 moral à tous vos alliés, +1 par Momentum dépensé.',
    },
    subtle_cues: {
        label: 'Signaux subtils',
        keywords: ['Persuasion'],
        description: 'Après avoir conversé ou observé quelqu\'un lors d\'une scène, lors d\'un jet de Persuasion contre lui dans cette scène, réduisez le coût du premier d20 à 0.',
    },

    // ── Résilience (Resilience) ──────────────────────────────────────────────
    a_stiff_drink: {
        label: 'Un bon verre',
        keywords: ['Résilience'],
        description: 'Ajoutez une flasque à vos affaires. Lors d\'une action de Récupération, vous ou un allié peut boire de la flasque pour retirer 1⚄ de stress supplémentaire. Si un effet est obtenu, l\'alcool pénalise tous les jets de +1 à la portée de complication pour le reste de la scène.',
    },
    courageous: {
        label: 'Courageux',
        keywords: ['Résilience'],
        description: 'Vous gagnez une résistance au Courage égale à votre rang en Résilience.',
    },
    dauntless: {
        label: 'Intrépide',
        keywords: ['Résilience'],
        description: 'Lors d\'un jet pour résister à l\'intimidation, à la peur ou à la panique, votre premier d20 bonus est gratuit.',
    },
    extra_effort: {
        label: 'Effort supplémentaire',
        keywords: ['Résilience'],
        description: 'Choisissez un attribut. Lors d\'un jet utilisant cet attribut, vous pouvez acheter des d20 bonus en subissant de la fatigue (1 fatigue par Momentum que vous auriez dépensé).',
    },
    hard_as_nails: {
        label: 'Dur à cuire',
        keywords: ['Résilience'],
        description: 'Votre résistance physique (Armure) augmente de +1.',
    },
    second_wind: {
        label: 'Deuxième souffle',
        keywords: ['Résilience', 'Fortune'],
        description: 'Durant votre tour, dépensez 1 Fortune comme action gratuite pour retirer tout votre stress actuel.',
    },
    tough: {
        label: 'Coriace',
        keywords: ['Résilience'],
        description: 'Votre jauge de stress est augmentée de +3.',
    },

    // ── Discrétion (Stealth) ─────────────────────────────────────────────────
    all_the_best_hiding_spots: {
        label: 'Les meilleures cachettes',
        keywords: ['Discrétion'],
        description: 'Les ennemis tentant un jet de Discrétion en votre présence voient leur difficulté augmentée de +1.',
    },
    exploit_weakness: {
        label: 'Exploiter les failles',
        keywords: ['Discrétion'],
        description: 'Lors d\'une attaque contre un ennemi non averti ou souffrant d\'une vérité représentant une faiblesse, l\'attaque gagne l\'effet Perforant 2.',
    },
    face_in_the_crowd: {
        label: 'Visage dans la foule',
        keywords: ['Discrétion'],
        description: 'Vous savez vous fondre dans la masse. Si vous portez une tenue appropriée ou un déguisement convenable, les ennemis qui tentent de vous remarquer dans un groupe ont leur difficulté augmentée de +1.',
    },
    hit_and_run: {
        label: 'Frapper et fuir',
        keywords: ['Discrétion'],
        description: 'Après une attaque réussie contre une cible non avertie, dépensez 1 Momentum pour vous déplacer à portée Proche. Vous pouvez le faire même si vous avez déjà bougé ce tour.',
    },
    like_a_shadow: {
        label: 'Comme une ombre',
        keywords: ['Discrétion'],
        description: 'Lorsque la scène implique la vigilance ennemie ou une poursuite, augmentez la résistance de la conséquence de +2.',
    },
    perfect_timing: {
        label: 'Le moment parfait',
        keywords: ['Discrétion'],
        description: 'Lors d\'un jet de Discrétion avec un délai limité pour atteindre un objectif, le premier d20 bonus est gratuit.',
    },

    // ── Survie (Survival) ────────────────────────────────────────────────────
    companion: {
        label: 'Compagnon fidèle',
        keywords: ['Survie'],
        description: 'Vous avez un chien fidèle qui sert d\'allié en situation dangereuse. Le chien est traité comme un PNJ allié sous vos ordres. Si votre chien est tué, vous gagnez immédiatement 1 Fortune, et choisissez entre le remplacer (réentraîner le talent) ou le remplacer par un talent différent.',
    },
    dig_for_victory: {
        label: 'Creuser pour survivre',
        keywords: ['Survie'],
        description: 'Lors d\'un jet de Survie pour établir un camp ou une position défensive, vous pouvez réduire le temps nécessaire de moitié.',
    },
    everything_i_need_is_here: {
        label: 'J\'ai tout ce qu\'il faut',
        keywords: ['Survie'],
        description: 'Vous pouvez porter un objet majeur supplémentaire sans être alourdi. Cela s\'accumule avec les bonus de Force.',
    },
    fieldcraft: {
        label: 'Art du terrain',
        keywords: ['Survie'],
        description: 'Vous pouvez utiliser Survie à la place de Discrétion pour vous dissimuler ou éviter d\'attirer l\'attention dans un environnement rural inhospitalier.',
    },
    survive_and_thrive: {
        label: 'Survivre et prospérer',
        keywords: ['Survie'],
        description: 'Lors d\'un jet de Survie pour trouver de la nourriture, de l\'eau ou d\'autres ressources essentielles, réduisez la difficulté de 1 et obtenez de quoi nourrir 1 personne supplémentaire par Momentum dépensé.',
    },
    tracker: {
        label: 'Traqueur',
        keywords: ['Survie'],
        description: 'Lors d\'un jet de Survie pour pister, votre premier d20 bonus est gratuit. Si la traque fait partie d\'une tâche étendue, infligez +1 stress par effet obtenu.',
    },

    // ── Tactique (Tactics) ───────────────────────────────────────────────────
    band_of_brothers: {
        label: 'Frères d\'armes',
        keywords: ['Tactique'],
        description: 'Au début d\'une scène d\'action, si le pool de Momentum contient moins de points qu\'il n\'y a de personnages avec ce talent, ajoutez immédiatement 1 point au pool de Momentum.',
    },
    call_to_action: {
        label: 'À l\'action !',
        keywords: ['Tactique'],
        description: 'En action mineure, accordez une action mineure immédiate à un allié. En action majeure, faites un jet Coordination + Tactique (difficulté 1) pour accorder une action mineure à autant d\'alliés que votre rang en Tactique.',
    },
    convey_intent: {
        label: 'Intention claire',
        keywords: ['Tactique'],
        description: 'Vous n\'avez pas besoin de parler pour être compris. Lors d\'un jet de Tactique pour donner des instructions, votre premier d20 bonus est gratuit.',
    },
    decisive_plan: {
        label: 'Plan décisif',
        keywords: ['Tactique'],
        description: 'Lors d\'une scène d\'action, lorsque vous assistez un allié, vous pouvez Garder l\'Initiative sans payer le coût habituel en Momentum si cela permet à l\'allié de prendre le prochain tour.',
    },
    direct: {
        label: 'Diriger',
        keywords: ['Tactique'],
        description: 'En action majeure lors d\'une scène d\'action, désignez un allié avec lequel vous pouvez communiquer : il peut immédiatement tenter une action majeure. Pour les jets, vous l\'assistez avec votre Tactique.',
    },
    teamwork: {
        label: 'Travail d\'équipe',
        keywords: ['Tactique'],
        description: 'Lorsque vous menez ou assistez un jet, si un personnage impliqué a un focus applicable, tout le monde compte comme ayant ce focus. Pour une tâche étendue, ajoutez +2⚄ au pool de stress.',
    },

    // ── Véhicules (Vehicles) ─────────────────────────────────────────────────
    combat_gunner: {
        label: 'Artilleur de combat',
        keywords: ['Véhicules'],
        description: 'Vous pouvez utiliser votre compétence Véhicules à la place de Combat lors d\'une attaque avec une arme montée sur un véhicule.',
    },
    drive_all_night: {
        label: 'Conduire toute la nuit',
        keywords: ['Véhicules'],
        description: 'Lorsque vous opérez un véhicule, utilisez Véhicules à la place de Résilience pour résister à la fatigue causée par l\'épuisement ou le manque de sommeil.',
    },
    off_road: {
        label: 'Tout-terrain',
        keywords: ['Véhicules'],
        description: 'Réduisez de 1 la difficulté de tous vos jets de terrain pour les véhicules.',
    },
    smuggler: {
        label: 'Contrebandier',
        keywords: ['Véhicules'],
        description: 'Pour dissimuler des personnes ou du matériel dans un véhicule, utilisez Véhicules au lieu de Discrétion, et pouvez relancer 1d20 dans le pool.',
    },
    still_in_control: {
        label: 'Toujours maître à bord',
        keywords: ['Véhicules'],
        description: 'Lorsqu\'un véhicule que vous conduisez subit une complication, c\'est vous qui décidez des effets (le MJ peut veto ce qui serait hors contexte).',
    },
    strafing_run: {
        label: 'Tir en rase-mottes',
        keywords: ['Véhicules', 'Avancé'],
        description: 'Lors d\'une attaque en salve depuis un véhicule, ignorez les augmentations de difficulté ou de portée de complication causées par la vitesse ou le terrain accidenté.',
    },

    // ── Étrange (Weird) ──────────────────────────────────────────────────────
    bizarre_insight: {
        label: 'Intuition bizarre',
        keywords: ['Étrange'],
        description: 'Une fois par scène, générez 1 Menace pour poser une question au MJ (comme si vous aviez dépensé du Momentum pour Obtenir des Informations) sans avoir à réussir un jet.',
    },
    foreboding_survival: {
        label: 'Pressentiment de survie',
        keywords: ['Étrange'],
        description: 'Une fois par session, lorsque vous subissez une blessure, générez 3 Menace pour l\'éviter. À la discrétion du MJ, vous pouvez être proposé d\'éviter d\'autres malheurs contre 3 Menace.',
    },
    minor_pact: {
        label: 'Pacte mineur',
        keywords: ['Étrange'],
        description: 'Si vous laissez chaque nuit de la nourriture et des boissons dehors, elles disparaissent et quelque chose de bon vous arrive. Vous gagnez 1 Fortune supplémentaire au début de chaque aventure. Des offrandes plus importantes peuvent apporter de plus grands bénéfices.',
    },
    mystical_power: {
        label: 'Pouvoir mystique',
        keywords: ['Étrange'],
        description: 'Réservé aux lanceurs de sorts. Vous pouvez augmenter votre Puissance de +2⚄ lors d\'un sort, mais chaque allié à portée Proche subit 1 stress mental par effet obtenu sur le Coût.',
    },
    numb_to_the_horrors: {
        label: 'Insensible aux horreurs',
        keywords: ['Étrange'],
        description: 'Vous augmentez votre résistance au Courage de +6, et pouvez relancer 1d20 sur tout jet pour éviter une cicatrice mentale. En contrepartie, votre détachement apparent augmente de +1 la portée de complication de tous vos jets de Persuasion.',
    },
    occult_dabbler: {
        label: 'Touche-à-tout de l\'occulte',
        keywords: ['Étrange', 'Lanceur de sorts'],
        description: 'Vous avez expérimenté les forces occultes. Vous devenez lanceur de sorts de type Bricoleur, comme décrit dans le Chapitre 9 : Magie et le Mythe.',
    },

    // ── Talents d'archétype (Boffin) ─────────────────────────────────────────
    prototype: {
        label: 'Prototype',
        keywords: ['Boffin', 'Ingénierie'],
        archetype: 'boffin',
        description: 'Vous pouvez construire des appareils expérimentaux avec un jet d\'Ingénierie difficulté 2. Quiconque utilise l\'appareil peut appliquer son talent à ses jets. Après chaque utilisation, lancez 1⚄ (plus 1⚄ par utilisation antérieure) : si un effet sort, l\'appareil tombe en panne irrémédiablement.',
    },
    lifesaver: {
        label: 'Sauveur',
        keywords: ['Boffin', 'Fortune', 'Médecine'],
        archetype: 'boffin',
        description: 'Réduisez de 1 la difficulté de tout jet de Médecine pour stabiliser un personnage mourant ou le réanimer. Vous pouvez aussi tenter de sauver quelqu\'un mort dans la scène actuelle : dépensez 1 Fortune et réussissez un jet Coordination + Médecine (difficulté 3) pour le mettre hors combat plutôt que mort.',
    },
    push_the_limits: {
        label: 'Pousser les limites',
        keywords: ['Boffin', 'Véhicules'],
        archetype: 'boffin',
        description: 'Si vous pouvez accéder au moteur d\'un véhicule, faites un jet Coordination + Véhicules (difficulté 3). En cas de succès, augmentez la Vitesse de 1 ou réduisez l\'Échelle de 1 pour les manœuvres. Ces ajustements rendent le véhicule peu fiable : tout jet pour l\'opérer augmente sa portée de complication de 1.',
    },

    // ── Talents d'archétype (Commander) ─────────────────────────────────────
    opportunist: {
        label: 'Opportuniste',
        keywords: ['Commandant', 'Combat'],
        archetype: 'commander',
        description: 'Lorsqu\'un ennemi subit une complication ou échoue à un jet difficulté 3+, vous pouvez dépenser 2 Momentum en réaction pour créer immédiatement une vérité tactique avantageuse qui dure jusqu\'à la fin de la scène d\'action.',
    },
    wilderness_guide: {
        label: 'Guide des étendues sauvages',
        keywords: ['Commandant', 'Survie'],
        archetype: 'commander',
        description: 'Vous êtes habile pour garder votre groupe en vie en terrain hostile. Lorsqu\'un membre du groupe tente un jet de Survie auquel vous ne pouvez pas l\'aider, vous pouvez dépenser 2 Momentum pour l\'assister quand même. Ce jet augmente sa portée de complication de 1.',
    },
    born_leader: {
        label: 'Meneur né',
        keywords: ['Commandant', 'Tactique', 'Fortune'],
        archetype: 'commander',
        description: 'Vous êtes un leader naturel. Vous pouvez dépenser 1 Fortune pour qu\'un seul allié gagne immédiatement 1 Fortune.',
    },

    // ── Talents d'archétype (Con Artist) ────────────────────────────────────
    cold_reading: {
        label: 'Lecture à froid',
        keywords: ['Escroc', 'Observation'],
        archetype: 'con_artist',
        description: 'Vous savez utiliser des observations simples et des questions orientées pour paraître omniscient. En conversation, dépensez 2 Momentum pour faire une lecture à froid : les autres personnages non initiés croiront que vous avez une source d\'information précise.',
    },
    a_way_with_words: {
        label: 'Avoir le bagou',
        keywords: ['Escroc', 'Persuasion'],
        archetype: 'con_artist',
        description: 'Vous ne dites jamais plus que nécessaire. Lorsque vous subissez une complication lors d\'un jet de Persuasion, dépensez 1 Momentum pour l\'annuler.',
    },
    chameleon: {
        label: 'Caméléon',
        keywords: ['Escroc', 'Discrétion', 'Fortune'],
        archetype: 'con_artist',
        description: 'Vous êtes maître du déguisement. Lorsque vous adoptez un déguisement, dépensez 1 Fortune pour établir que vous disposez déjà d\'un alias approprié, avec les papiers correspondants et d\'autres accessoires soit sur vous, soit dans un lieu sûr à proximité.',
    },

    // ── Talents d'archétype (Grease Monkey) ─────────────────────────────────
    keep_it_steady: {
        label: 'Tenir la route',
        keywords: ['Mécano', 'Ingénierie'],
        archetype: 'grease_monkey',
        description: 'Lorsque vous opérez un véhicule sur lequel vous avez travaillé, dépensez 2 Momentum lors d\'un jet de Véhicules pour ignorer les effets de toute blessure subie par le véhicule pour ce jet.',
    },
    quartermaster: {
        label: 'Quartier-maître',
        keywords: ['Mécano', 'Persuasion', 'Fortune'],
        archetype: 'grease_monkey',
        description: 'Vous êtes habitué à transporter des fournitures et à gérer des approvisionnements. Dépensez 1 Fortune pour révéler que vous disposez d\'un objet spécifique caché sur vous, dans un véhicule ou dans un lieu proche. Cet objet doit être mineur (restriction ≤3, non arme sauf qualité Lancé).',
    },
    born_to_drive: {
        label: 'Né pour conduire',
        keywords: ['Mécano', 'Véhicules'],
        archetype: 'grease_monkey',
        description: 'Vous maîtrisez totalement tout véhicule. Lors d\'un jet de Véhicules difficulté 3+, vous pouvez dépenser jusqu\'à 3 Momentum pour réduire la difficulté de 1 par Momentum dépensé. La portée de complication augmente du même montant que la difficulté réduite.',
    },

    // ── Talents d'archétype (Infiltrator) ───────────────────────────────────
    acrobatic: {
        label: 'Acrobatique',
        keywords: ['Infiltrateur', 'Athlétisme'],
        archetype: 'infiltrator',
        description: 'Vous êtes extrêmement souple et athlétique. Lors d\'un déplacement autour d\'un obstacle, dépensez 2 Momentum pour le contourner immédiatement sans jet, sans équipement d\'escalade et sans consommer votre action de déplacement.',
    },
    assassination: {
        label: 'Assassination',
        keywords: ['Infiltrateur', 'Combat'],
        archetype: 'infiltrator',
        description: 'Vous êtes redoutable contre les cibles non averties. Contre une cible non avertie, dépensez 2 Momentum pour effectuer une assassination : l\'attaque gagne l\'effet Intense. Si la cible est vaincue, l\'attaque est silencieuse.',
    },
    silent_step: {
        label: 'Pas silencieux',
        keywords: ['Infiltrateur', 'Discrétion'],
        archetype: 'infiltrator',
        description: 'Vos pas sont incroyablement silencieux. Lors d\'une complication sur un jet de Discrétion, dépensez 1 Momentum pour l\'annuler.',
    },

    // ── Talents d'archétype (Investigator) ──────────────────────────────────
    polymath: {
        label: 'Polymathe',
        keywords: ['Investigateur', 'Érudition'],
        archetype: 'investigator',
        description: 'Une fois par scène, dépensez 2 Momentum pour gagner un focus supplémentaire pendant la durée de la scène, choisi parmi n\'importe quelle compétence avec un rang de 2+.',
    },
    the_cutting_edge: {
        label: 'À la pointe',
        keywords: ['Investigateur', 'Médecine'],
        archetype: 'investigator',
        description: 'Vous maîtrisez les dernières avancées médicales. Lors d\'un jet de Médecine difficulté 3+, dépensez jusqu\'à 3 Momentum pour réduire la difficulté de 1 par Momentum. La portée de complication augmente du même montant.',
    },
    detailed_analysis: {
        label: 'Analyse détaillée',
        keywords: ['Investigateur', 'Observation'],
        archetype: 'investigator',
        description: 'Vous avez une attention exceptionnelle aux détails. Une fois par scène, dépensez 2 Momentum pour poser immédiatement 3 questions au MJ sur la scène — comme si vous aviez dépensé du Momentum pour Obtenir des Informations — sans jet préalable.',
    },

    // ── Talents d'archétype (Occultist) ─────────────────────────────────────
    occult_scholar: {
        label: 'Érudit de l\'occulte',
        keywords: ['Occultiste', 'Érudition', 'Lanceur de sorts'],
        archetype: 'occultist',
        description: 'Vous êtes versé dans les traditions occultes et la parapsychologie. Vous êtes un lanceur de sorts (voir Chapitre 9). Vous gagnez un Courage égal à votre rang en Érudition (ne se cumule pas avec Courageux).',
    },
    summoner: {
        label: 'Invocateur',
        keywords: ['Occultiste', 'Persuasion', 'Lanceur de sorts'],
        archetype: 'occultist',
        description: 'Vous avez communiqué avec des entités au-delà du monde matériel. Vous êtes un lanceur de sorts (voir Chapitre 9). Lors d\'une invocation réussie, dépensez 2 Momentum pour obtenir l\'obéissance de la créature invoquée pendant un nombre de minutes égal à votre rang en Persuasion.',
    },
    a_price_to_pay: {
        label: 'Un prix à payer',
        keywords: ['Occultiste', 'Résilience', 'Lanceur de sorts'],
        archetype: 'occultist',
        description: 'Vous comprenez que la magie a toujours un coût. Vous êtes un lanceur de sorts (voir Chapitre 9). Après avoir lancé un sort avec succès, vous pouvez gagner 2 Momentum bonus, utilisable uniquement pour améliorer les effets du sort. Le Coût du sort augmente de +2⚄ et devient du stress physique.',
    },

    // ── Talents d'archétype (Soldier) ────────────────────────────────────────
    army_of_one: {
        label: 'À lui seul une armée',
        keywords: ['Soldat', 'Combat'],
        archetype: 'soldier',
        description: 'Vous êtes redoutable avec une grande variété d\'armes. Lors d\'une attaque, dépensez 2 Momentum pour ajouter l\'un des effets suivants : Drainer, Percer, ou Étourdir. Un seul effet de dégâts peut être ajouté par ce biais.',
    },
    draw_their_fire: {
        label: 'Attirez leur feu !',
        keywords: ['Soldat', 'Résilience'],
        archetype: 'soldier',
        description: 'Vous protégez vos alliés en attirant l\'attention ennemie. Après avoir fait une attaque, dépensez 2 Momentum pour forcer tout ennemi à portée qui ciblerait un de vos alliés à vous cibler vous à la place (difficulté +1 pour leurs attaques sur vos alliés).',
    },
    own_the_battlefield: {
        label: 'Maître du champ de bataille',
        keywords: ['Soldat', 'Survie', 'Fortune'],
        archetype: 'soldier',
        description: 'Vous êtes un guerrier rusé qui tire parti du terrain. Dépensez 1 Fortune pour déclencher l\'une des réactions suivantes — Tir éclair (ennemi à portée Moyenne qui échoue un test de déplacement : infligez des dégâts égaux à votre Combat) ou Couchez-vous ! (allié à portée Moyenne ciblé par un tir : il gagne une couverture égale à votre Observation).',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// NATIONALITÉS — liste fermée avec langues de départ
// ══════════════════════════════════════════════════════════════════════════════

export const NATIONALITIES = [
    {
        key: 'australia',
        label: 'Australie',
        languages: ['Anglais'],
        languageNote: 'Les personnages australiens autochtones peuvent aussi connaître une langue autochtone.',
        description: 'Malgré les difficultés de la Grande Dépression, l\'Australie suit la politique britannique face à l\'Allemagne nazie et entre en guerre dans les jours suivant la Grande-Bretagne. Les pilotes australiens se battent vaillamment lors de la Bataille d\'Angleterre, tandis que les troupes australiennes servent en Afrique du Nord, en Méditerranée, et aux côtés des Américains dans le Pacifique.',
    },
    {
        key: 'canada',
        label: 'Canada',
        languages: ['Anglais', 'Français'],
        languageNote: 'Les personnages canadiens des Premières Nations peuvent aussi connaître une langue autochtone.',
        description: 'Le Canada rejoint la déclaration de guerre britannique contre l\'Allemagne, et ses troupes servent en Italie et en Europe du Nord. Sa plus grande contribution est son rôle dans la Bataille de l\'Atlantique, aidant à maintenir les lignes d\'approvisionnement vitales vers la Grande-Bretagne malgré les meutes de sous-marins allemands.',
    },
    {
        key: 'czechoslovakia',
        label: 'Tchécoslovaquie',
        languages: ['Tchèque', 'Slovaque'],
        languageNote: 'Beaucoup de Tchécoslovaques parlent aussi l\'allemand ou le hongrois.',
        description: 'Abandonnée par les Alliés lors des Accords de Munich, la Tchécoslovaquie est rapidement engloutie par l\'Allemagne nazie. Ses soldats et ses pilotes s\'enfuient à l\'étranger pour continuer le combat, formant des unités d\'élite au sein des forces alliées. Leur haine des nazis et leur désir de libérer leur patrie en font des combattants exceptionnellement motivés.',
    },
    {
        key: 'france',
        label: 'France',
        languages: ['Français'],
        languageNote: null,
        description: 'Après la défaite rapide et humiliante de 1940, la France est divisée : la zone occupée sous contrôle nazi et le régime de Vichy au sud. Mais la France Libre du Général de Gaulle continue le combat depuis Londres, et des milliers de résistants sur le sol français risquent leur vie quotidiennement pour aider les Alliés et saboter l\'occupant.',
    },
    {
        key: 'india',
        label: 'Inde',
        languages: ['Anglais', 'Hindi'],
        languageNote: 'Les personnages indiens peuvent aussi connaître l\'ourdou, le bengali ou d\'autres langues régionales.',
        description: 'Le Joyau de la Couronne britannique déclare la guerre à l\'Allemagne et envoie plus de trois millions de soldats volontaires combattre les nazis aux côtés des Alliés. Les troupes indiennes ne défendent pas seulement les frontières contre l\'invasion japonaise, mais servent avec distinction dans chaque théâtre de guerre, tandis que les États indiens font d\'importants dons au fonds de guerre.',
    },
    {
        key: 'norway',
        label: 'Norvège',
        languages: ['Norvégien'],
        languageNote: null,
        description: 'Malgré sa tentative de neutralité, la Norvège est envahie par l\'Allemagne en avril 1940. Le roi Haakon VII refuse de capituler et s\'exile à Londres pour diriger le gouvernement norvégien en exil. La résistance norvégienne joue un rôle crucial, notamment dans le sabotage de la production d\'eau lourde nazie, entravant les ambitions nucléaires allemandes.',
    },
    {
        key: 'poland',
        label: 'Pologne',
        languages: ['Polonais'],
        languageNote: null,
        description: 'La Pologne est la première à subir la Blitzkrieg nazie en septembre 1939. Ses soldats, pilotes et marins s\'enfuient à l\'étranger pour continuer le combat avec une détermination farouche. Les pilotes polonais jouent un rôle crucial lors de la Bataille d\'Angleterre, et l\'intelligence polonaise fournit aux Alliés des informations vitales sur les codes Enigma.',
    },
    {
        key: 'united_kingdom',
        label: 'Royaume-Uni',
        languages: ['Anglais'],
        languageNote: 'Les personnages gallois peuvent aussi parler le gallois.',
        description: 'La Grande-Bretagne est en première ligne de la guerre contre le nazisme. De la Bataille d\'Angleterre aux campagnes d\'Afrique du Nord, en passant par les bombardements nocturnes de la Luftwaffe, le peuple britannique tient bon. La Section M des renseignements militaires et l\'OSS américain recrutent parmi les meilleurs esprits pour lutter contre la menace occulte nazie.',
    },
    {
        key: 'united_states',
        label: 'États-Unis d\'Amérique',
        languages: ['Anglais'],
        languageNote: 'Les personnages issus d\'une minorité ethnique peuvent aussi parler une autre langue (espagnol, langues autochtones, etc.).',
        description: 'Les États-Unis entrent officiellement en guerre après Pearl Harbour en décembre 1941, mais travaillaient secrètement aux côtés des Britanniques bien avant. Majestic, l\'organisation américaine de contre-espionnage occulte, est déjà active depuis des années. Les ressources industrielles et humaines américaines transforment l\'équilibre des forces, et leurs agents rejoignent leurs alliés britanniques dans la Guerre Secrète.',
    },
    {
        key: 'ussr',
        label: 'URSS',
        languages: ['Russe'],
        languageNote: null,
        description: 'Initialement alliée à l\'Allemagne par un pacte de non-agression, l\'Union Soviétique bascule du côté des Alliés lors de l\'invasion allemande en juin 1941. Le Front de l\'Est devient le théâtre de la guerre la plus brutale et la plus sanglante de l\'histoire humaine. Les soldats soviétiques combattent avec une détermination féroce pour défendre leur patrie contre l\'agression nazie et les forces du Surnaturel qui les accompagnent.',
    },
    {
        key: 'other',
        label: 'Autre / Personnalisé',
        languages: [],
        languageNote: 'Précisez la nationalité et la langue de départ ci-dessous.',
        description: 'La Guerre Secrète attire des combattants du monde entier — Néo-Zélandais, Sud-Africains, Nationaux déplacés, Espagnols républicains en exil, et bien d\'autres encore. Choisissez votre nationalité et discutez de ses implications avec votre MJ.',
    },
];

// ══════════════════════════════════════════════════════════════════════════════
// DONNÉES DE CRÉATION — ARCHÉTYPES (données complètes)
// Clés dans TALENTS pour les talentPool
// ══════════════════════════════════════════════════════════════════════════════

export const ARCHETYPE_DATA = {
    boffin: {
        label: 'Boffin',
        labelFr: 'Boffin',
        tagline: 'Le cerveau du groupe. Si un Boffin ne sait pas quelque chose, il peut probablement le découvrir.',
        playIf: [
            'Être le plus intelligent du groupe.',
            'Avoir une réponse à tout.',
            'Craquer des codes, désactiver des chars, et déjouer les nazis !',
        ],
        description: 'Un Boffin sait comment les choses fonctionnent. Il possède de vastes connaissances techniques et pratiques, et le talent pour les mettre en œuvre. Si un Boffin ne sait pas quelque chose, il peut probablement le découvrir à force d\'essais et d\'erreurs — et il n\'a pas peur de se salir les mains.',
        attrBonus:   { brawn: 1, coordination: 2, insight: 1, reason: 2 },
        skillBonus:  { academia: 1, engineering: 2, medicine: 2, observation: 1, stealth: 1, vehicles: 2 },
        focusPool:   ['engineering', 'medicine', 'vehicles'],
        focusCount:  2,
        talentPool:  ['prototype', 'lifesaver', 'push_the_limits'],
        belongings:  [
            'Outils de mécanicien ou un contact (mécanicien)',
            'Outils d\'électricien ou un contact (électricien)',
            'Kit de démolition ou un contact (explosifs)',
            'Trousse médicale ou un contact (médecine)',
        ],
        belongingsNote: 'Choisissez deux kits d\'outils, deux contacts, ou un kit et un contact.',
    },
    commander: {
        label: 'Commander',
        labelFr: 'Commandant',
        tagline: 'Le chef tactique. Maître des troupes et des ressources, toujours capable de voir le tableau d\'ensemble.',
        playIf: [
            'Être le chef du groupe.',
            'Donner des ordres et aider les autres.',
            'Mener la charge avec des tactiques audacieuses pour atteindre l\'objectif !',
        ],
        description: 'Les balles, les baïonnettes et les bombes ne sont utiles que si elles sont déployées au bon endroit au bon moment. Un Commandant est passé maître dans cet art, capable de voir le tableau d\'ensemble et de rassembler troupes et ressources pour que chacun puisse faire son travail avec une efficacité maximale.',
        attrBonus:   { coordination: 2, insight: 1, reason: 2, will: 1 },
        skillBonus:  { academia: 1, fighting: 2, persuasion: 1, survival: 2, stealth: 1, tactics: 2 },
        focusPool:   ['fighting', 'survival', 'tactics'],
        focusCount:  2,
        talentPool:  ['opportunist', 'wilderness_guide', 'born_leader'],
        belongings:  [],
        belongingsNote: 'Au début de chaque aventure, vous pouvez réquisitionner gratuitement un objet de Restriction 2 ou moins.',
    },
    con_artist: {
        label: 'Con Artist',
        labelFr: 'Escroc',
        tagline: 'Le manipulateur. Habile à intimider, séduire, persuader et tromper pour parvenir à ses fins.',
        playIf: [
            'Avoir une personnalité magnétique.',
            'Duper vos ennemis et porter d\'incroyables déguisements.',
            'Manipuler votre cible, berner les gardes, ou se cacher en plein jour !',
        ],
        description: 'Un Escroc est dans son élément en société, parlant toutes les langues et adoptant tous les traits de personnalité nécessaires pour arriver à ses fins. Ce sont des manipulateurs habiles, capables d\'intimider, séduire, persuader et tromper pour traverser la vie — tout aussi doués pour repérer quand quelqu\'un d\'autre essaie de les manipuler.',
        attrBonus:   { coordination: 1, insight: 2, reason: 1, will: 2 },
        skillBonus:  { academia: 1, observation: 2, persuasion: 2, resilience: 1, stealth: 2, tactics: 1 },
        focusPool:   ['observation', 'persuasion', 'stealth'],
        focusCount:  2,
        talentPool:  ['cold_reading', 'a_way_with_words', 'chameleon'],
        belongings:  ['Kit de déguisement', 'Un contact (n\'importe quelle compétence ou focus)'],
        belongingsNote: '',
    },
    grease_monkey: {
        label: 'Grease Monkey',
        labelFr: 'Mécano',
        tagline: 'L\'expert en véhicules. Virtuellement né derrière un volant, précieux sur les missions dangereuses.',
        playIf: [
            'Être expert en véhicules.',
            'Construire ou réparer à peu près n\'importe quoi.',
            'Piloter des avions, opérer de l\'artillerie, et prendre en chasse les nazis !',
        ],
        description: 'Virtuellement né derrière un volant, vous êtes un expert pour amener personnes et fournitures là où elles doivent être. Vous êtes irremplaçable lors des missions dangereuses, non seulement pour votre capacité à opérer des véhicules, mais pour votre talent à les maintenir en état de marche dans les pires conditions.',
        attrBonus:   { brawn: 1, coordination: 2, insight: 1, reason: 2 },
        skillBonus:  { athletics: 1, engineering: 2, persuasion: 2, resilience: 1, survival: 1, vehicles: 2 },
        focusPool:   ['engineering', 'persuasion', 'vehicles'],
        focusCount:  2,
        talentPool:  ['keep_it_steady', 'quartermaster', 'born_to_drive'],
        belongings:  ['Outils de mécanicien', 'Un contact (Véhicules)'],
        belongingsNote: '',
    },
    infiltrator: {
        label: 'Infiltrator',
        labelFr: 'Infiltrateur',
        tagline: 'L\'ombre. Expert pour entrer là où il ne devrait pas être, éviter la détection et récupérer des secrets.',
        playIf: [
            'Faire la guerre depuis les ombres !',
            'Se glisser derrière les lignes ennemies.',
            'Se déplacer sans être vu et être là où vous ne devriez pas !',
        ],
        description: 'Un Infiltrateur est doué pour accéder aux endroits interdits. Il excelle à éviter la détection, à contourner les systèmes de sécurité et à récupérer des objets de valeur dans des lieux sécurisés. Dans le fracas de la guerre, la capacité à se déplacer sans être vu ni entendu lui confère un avantage crucial.',
        attrBonus:   { agility: 2, brawn: 1, coordination: 2, insight: 1 },
        skillBonus:  { athletics: 2, engineering: 1, fighting: 2, observation: 1, stealth: 2, survival: 1 },
        focusPool:   ['athletics', 'fighting', 'stealth'],
        focusCount:  2,
        talentPool:  ['acrobatic', 'assassination', 'silent_step'],
        belongings:  ['Vêtements camouflés', 'Équipement d\'escalade', 'Outils de cambriolage'],
        belongingsNote: '',
    },
    investigator: {
        label: 'Investigator',
        labelFr: 'Investigateur',
        tagline: 'Le chercheur de vérité. Insatiable dans sa quête de la vérité, quelle qu\'en soit le prix.',
        playIf: [
            'Découvrir la vérité quoi qu\'il en coûte.',
            'Démasquer les conspirations.',
            'Fouiller les bureaux, découvrir des indices et trouver les chaînons manquants !',
        ],
        description: 'Un Investigateur a un appétit insatiable pour la vérité et ira au bout du monde pour la trouver. Avec la propagande de guerre dominant les deux camps, la vérité est plus difficile à discerner mais plus précieuse que jamais. Enquêteurs privés, policiers militaires et journalistes plongent dans la vérité cachée derrière les gros titres.',
        attrBonus:   { agility: 1, coordination: 1, insight: 2, reason: 2 },
        skillBonus:  { academia: 2, engineering: 1, medicine: 2, observation: 2, persuasion: 1, stealth: 1 },
        focusPool:   ['academia', 'medicine', 'observation'],
        focusCount:  2,
        talentPool:  ['polymath', 'the_cutting_edge', 'detailed_analysis'],
        belongings:  [
            'Outils analytiques ou un contact (science)',
            'Kit de premiers secours ou un contact (médecine)',
            'Pistolet ou un contact (Érudition)',
        ],
        belongingsNote: 'Choisissez un kit ou un contact.',
    },
    occultist: {
        label: 'Occultist',
        labelFr: 'Occultiste',
        tagline: 'Le mystique. A plongé dans les forces plus profondes et étranges de l\'univers.',
        playIf: [
            'Posséder une connaissance étrange des rouages intimes de l\'univers.',
            'Manier une magie incroyable.',
            'Lancer des sorts, éveiller des dieux endormis, et affronter les cultistes nazis !',
        ],
        description: 'Un Occultiste a plongé dans les forces plus profondes et étranges de l\'univers, et a appris les secrets de comment les plier à sa volonté. Bien que seuls les Occultistes les plus égocentriques et délirants puissent prétendre à la maîtrise du surnaturel, même un peu de talent pour l\'ésotérique peut être précieux — ou dangereux dans les mauvaises mains.',
        attrBonus:   null, // variante A ou B
        skillBonus:  null,
        variants: {
            A: {
                label: 'Variante A — Intuition dominante',
                attrBonus:  { brawn: 1, will: 2, insight: 2, reason: 1 },
                skillBonus: { observation: 1, persuasion: 2, resilience: 2, stealth: 1, academia: 2, survival: 1 },
            },
            B: {
                label: 'Variante B — Raisonnement dominant',
                attrBonus:  { brawn: 1, will: 2, insight: 1, reason: 2 },
                skillBonus: { observation: 1, persuasion: 2, resilience: 2, stealth: 1, academia: 1, survival: 2 },
            },
        },
        focusPool:   ['academia', 'persuasion', 'resilience', 'survival'],
        focusCount:  2,
        talentPool:  ['occult_scholar', 'summoner', 'a_price_to_pay'],
        talentNote:  'Un personnage ne peut avoir qu\'un seul talent avec le mot-clé Lanceur de sorts.',
        belongings:  ['Outils rituels', 'Un contact (focus Occultisme ou Mysticisme)'],
        belongingsNote: '',
    },
    soldier: {
        label: 'Soldier',
        labelFr: 'Soldat',
        tagline: 'Le combattant. Expert au combat, pour terrasser ses ennemis et protéger ses alliés.',
        playIf: [
            'Être le plus fort du groupe.',
            'Tirer de grosses armes et manier des armes brutales.',
            'Plonger à couvert, réaliser un tir impossible, ou charger vers la victoire !',
        ],
        description: 'Un Soldat excelle au combat, pour terrasser ses ennemis et protéger les autres. Même en temps de guerre, alors que des armées entières marchent à travers les villes d\'Europe, un Soldat se distingue sur le champ de bataille : il survit couramment aux horreurs et aux désastres que les autres ne peuvent surmonter, et se voit confier les missions de combat les plus spéciales.',
        attrBonus:   { agility: 1, brawn: 2, coordination: 2, insight: 1 },
        skillBonus:  { athletics: 1, fighting: 2, observation: 1, resilience: 2, survival: 2, tactics: 1 },
        focusPool:   ['fighting', 'resilience', 'survival'],
        focusCount:  2,
        talentPool:  ['army_of_one', 'draw_their_fire', 'own_the_battlefield'],
        belongings:  ['Une arme de Restriction 3 ou moins', 'Un pistolet de Restriction 1'],
        belongingsNote: '',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// DONNÉES DE CRÉATION — BACKGROUNDS (données complètes)
// ══════════════════════════════════════════════════════════════════════════════

export const BACKGROUND_DATA = {
    academic: {
        label: 'Universitaire',
        description: 'Le parcours de votre personnage est un mélange de sa formation, de sa profession et de ses expériences fondatrices. Un universitaire a consacré sa vie à l\'acquisition du savoir.',
        attrBonus:  { coordination: 2, insight: 1, reason: 2, will: 1 },
        skillBonus: { academia: 2, observation: 1, persuasion: 1 },
        focusFixed: 'academia',
        focusNote:  '1 focus en Érudition (choix libre) + 1 focus libre',
        talentKeyword: 'Érudition',
        truthSuggestions: ['Docteur en (sujet)', 'Conservateur de musée', 'Professeur de (sujet)'],
        belongings: 'Un contact (Érudition)',
    },
    air_force: {
        label: 'Armée de l\'air',
        description: 'Vous avez servi dans les forces aériennes et connaissez les avions, les tactiques aériennes et la discipline militaire.',
        attrBonus:  { agility: 1, coordination: 2, insight: 2, reason: 1 },
        skillBonus: { engineering: 1, tactics: 1, vehicles: 2 },
        focusFixed: 'vehicles',
        focusNote:  '1 focus en Véhicules (choix libre) + 1 focus libre',
        talentKeyword: 'Véhicules',
        truthSuggestions: ['As de l\'aviation', 'Expert navigateur', 'Mécanicien talentueux'],
        belongings: 'Outils de mécanicien ou un contact (mécanique, véhicules lourds, ou aéronefs)',
    },
    army: {
        label: 'Armée de terre',
        description: 'Vous avez servi dans l\'armée de terre et avez reçu une formation au combat, à la tactique et à la vie en campagne.',
        attrBonus:  { agility: 2, brawn: 2, coordination: 1, will: 1 },
        skillBonus: { athletics: 1, fighting: 2, tactics: 1 },
        focusFixed: 'fighting',
        focusNote:  '1 focus en Combat (choix libre) + 1 focus libre',
        talentKeyword: 'Combat',
        truthSuggestions: ['Tireur d\'élite', 'Parachutiste', 'Commando redoutable'],
        belongings: 'Une ceinture de munitions',
    },
    athlete: {
        label: 'Athlète',
        description: 'Vous avez consacré votre vie au sport et à la compétition, développant un physique exceptionnel et une discipline de fer.',
        attrBonus:  { agility: 2, brawn: 2, coordination: 1, insight: 1 },
        skillBonus: { athletics: 2, fighting: 1, resilience: 1 },
        focusFixed: 'athletics',
        focusNote:  '1 focus en Athlétisme (choix libre) + 1 focus libre',
        talentKeyword: 'Athlétisme',
        truthSuggestions: ['Champion de football', 'Champion de boxe olympique', 'Athlète professionnel'],
        belongings: 'Une batte de base-ball, une batte de cricket, ou un autre équipement sportif',
    },
    covert_operative: {
        label: 'Agent clandestin',
        description: 'Vous avez travaillé dans les opérations secrètes — espionnage, sabotage, ou résistance — avant même que la guerre ne vous entraîne dans la Guerre Secrète.',
        attrBonus:  { agility: 2, coordination: 1, insight: 1, will: 2 },
        skillBonus: { persuasion: 1, stealth: 2, tactics: 1 },
        focusFixed: 'stealth',
        focusNote:  '1 focus en Discrétion (choix libre) + 1 focus libre',
        talentKeyword: 'Discrétion',
        truthSuggestions: ['Identité de couverture', 'Tueur silencieux', 'Membre de la Résistance'],
        belongings: 'Documents d\'identité et 1 arme de Restriction 2 ou moins avec silencieux',
    },
    criminal: {
        label: 'Criminel',
        description: 'Vous avez vécu en dehors de la loi, que ce soit par nécessité, par choix ou par accident. La guerre vous offre peut-être une chance de racheter votre passé — ou d\'en tirer profit.',
        attrBonus:  { agility: 2, brawn: 1, insight: 2, will: 1 },
        skillBonus: { persuasion: 2, stealth: 1, tactics: 1 },
        focusFixed: 'persuasion',
        focusNote:  '1 focus en Persuasion (choix libre) + 1 focus libre',
        talentKeyword: 'Persuasion',
        truthSuggestions: ['Escroc professionnel', 'Braqueur de banque', 'Assassin à gages'],
        belongings: 'Un objet de Restriction 2 ou moins lié à votre crime, ou de faux papiers d\'identité',
    },
    driver: {
        label: 'Chauffeur',
        description: 'Vous avez passé votre vie au volant ou dans les ateliers de mécanique, développant une maîtrise exceptionnelle des véhicules de toutes sortes.',
        attrBonus:  { brawn: 1, coordination: 2, insight: 2, reason: 1 },
        skillBonus: { athletics: 1, engineering: 1, vehicles: 2 },
        focusFixed: 'vehicles',
        focusNote:  '1 focus en Véhicules (choix libre) + 1 focus libre',
        talentKeyword: 'Véhicules',
        truthSuggestions: ['As du volant', 'Pilote de course', 'Chauffeur de maître'],
        belongings: 'Un véhicule de transport (discutez les détails avec votre MJ)',
    },
    engineer: {
        label: 'Ingénieur',
        description: 'Votre formation en ingénierie vous permet de concevoir, construire et réparer des mécanismes complexes, des fortifications aux équipements de communication.',
        attrBonus:  { agility: 1, coordination: 2, insight: 1, reason: 2 },
        skillBonus: { academia: 1, engineering: 2, observation: 1 },
        focusFixed: 'engineering',
        focusNote:  '1 focus en Ingénierie (choix libre) + 1 focus libre',
        talentKeyword: 'Ingénierie',
        truthSuggestions: ['Expert en explosifs', 'Génie de l\'électronique', 'Architecte militaire'],
        belongings: 'Outils d\'ingénieur et plans de base',
    },
    entertainer: {
        label: 'Artiste',
        description: 'Acteur, musicien, danseur ou acrobate — vous savez comment captiver un public et, si nécessaire, jouer un rôle pour vous fondre dans n\'importe quelle situation.',
        attrBonus:  { agility: 2, coordination: 1, insight: 1, will: 2 },
        skillBonus: { athletics: 1, observation: 1, persuasion: 2 },
        focusFixed: 'persuasion',
        focusNote:  '1 focus en Persuasion (choix libre) + 1 focus libre',
        talentKeyword: 'Persuasion',
        truthSuggestions: ['Acteur renommé', 'Musicien de jazz', 'Acrobate de cirque'],
        belongings: 'Costume ou déguisement de scène, et un instrument ou accessoire lié à votre art',
    },
    journalist: {
        label: 'Journaliste',
        description: 'Correspondant de guerre, reporter ou photographe — vous avez vu les horreurs de la guerre de près et savez comment trouver, vérifier et diffuser l\'information.',
        attrBonus:  { coordination: 1, insight: 2, reason: 1, will: 2 },
        skillBonus: { academia: 1, observation: 2, persuasion: 1 },
        focusFixed: 'observation',
        focusNote:  '1 focus en Observation (choix libre) + 1 focus libre',
        talentKeyword: 'Observation',
        truthSuggestions: ['Correspondant de guerre', 'Photographe de terrain', 'Journaliste d\'investigation'],
        belongings: 'Appareil photo, carnet de notes et accréditation de presse',
    },
    labourer: {
        label: 'Ouvrier',
        description: 'Mineur, docker, ouvrier agricole ou de chantier — vous avez forgé votre corps et votre esprit dans l\'effort physique quotidien.',
        attrBonus:  { agility: 1, brawn: 2, coordination: 2, will: 1 },
        skillBonus: { athletics: 1, resilience: 2, survival: 1 },
        focusFixed: 'resilience',
        focusNote:  '1 focus en Résilience (choix libre) + 1 focus libre',
        talentKeyword: 'Résilience',
        truthSuggestions: ['Syndicaliste engagé', 'Mineur chevronné', 'Ouvrier du chantier naval'],
        belongings: 'Outils de votre métier',
    },
    military_officer: {
        label: 'Officier militaire',
        description: 'Vous avez gravi les échelons militaires et appris à commander des hommes, à planifier des opérations et à prendre des décisions sous pression.',
        attrBonus:  { agility: 1, insight: 1, reason: 2, will: 2 },
        skillBonus: { fighting: 1, persuasion: 1, tactics: 2 },
        focusFixed: 'tactics',
        focusNote:  '1 focus en Tactique (choix libre) + 1 focus libre',
        talentKeyword: 'Tactique',
        truthSuggestions: ['Vétéran de campagne', 'Stratège brillant', 'Chef respecté'],
        belongings: 'Revolver de service et documents militaires',
    },
    navy: {
        label: 'Marine',
        description: 'Marin, sous-marinier ou officier de marine — vous connaissez la guerre sur mer et la discipline de fer de la vie à bord.',
        attrBonus:  { agility: 2, brawn: 1, coordination: 2, reason: 1 },
        skillBonus: { engineering: 1, tactics: 1, vehicles: 2 },
        focusFixed: 'vehicles',
        focusNote:  '1 focus en Véhicules (choix libre) + 1 focus libre',
        talentKeyword: 'Véhicules',
        truthSuggestions: ['Vétéran de la Bataille de l\'Atlantique', 'Sous-marinier', 'Officier de pont'],
        belongings: 'Kit de navigation et carte marine',
    },
    physician: {
        label: 'Médecin',
        description: 'Médecin, chirurgien ou psychiatre — vous avez consacré votre vie à sauver des vies, que ce soit sur le front ou à l\'arrière.',
        attrBonus:  { coordination: 2, insight: 1, reason: 2, will: 1 },
        skillBonus: { academia: 1, medicine: 2, resilience: 1 },
        focusFixed: 'medicine',
        focusNote:  '1 focus en Médecine (choix libre) + 1 focus libre',
        talentKeyword: 'Médecine',
        truthSuggestions: ['Chirurgien de guerre', 'Psychiatre militaire', 'Médecin de campagne'],
        belongings: 'Trousse médicale complète',
    },
    police: {
        label: 'Police',
        description: 'Inspecteur, agent ou gendarme — vous avez l\'œil exercé pour observer, déduire et agir dans des situations dangereuses.',
        attrBonus:  { agility: 1, brawn: 1, coordination: 2, insight: 2 },
        skillBonus: { fighting: 1, observation: 2, persuasion: 1 },
        focusFixed: 'observation',
        focusNote:  '1 focus en Observation (choix libre) + 1 focus libre',
        talentKeyword: 'Observation',
        truthSuggestions: ['Inspecteur chevronné', 'Agent de la criminelle', 'Gendarme de campagne'],
        belongings: 'Badge et pistolet de service',
    },
    politician: {
        label: 'Politicien',
        description: 'Député, diplomate ou fonctionnaire — vous maîtrisez l\'art de la négociation, du discours et des coulisses du pouvoir.',
        attrBonus:  { coordination: 1, insight: 2, reason: 1, will: 2 },
        skillBonus: { academia: 1, persuasion: 2, tactics: 1 },
        focusFixed: 'persuasion',
        focusNote:  '1 focus en Persuasion (choix libre) + 1 focus libre',
        talentKeyword: 'Persuasion',
        truthSuggestions: ['Député respecté', 'Diplomate chevronné', 'Homme de l\'ombre'],
        belongings: 'Documents officiels et contacts gouvernementaux',
    },
    resistance: {
        label: 'Résistance',
        description: 'Vous avez rejoint les réseaux de résistance clandestins, risquant votre vie pour saboter l\'occupant et aider les Alliés.',
        attrBonus:  { agility: 1, coordination: 1, reason: 2, will: 2 },
        skillBonus: { persuasion: 1, stealth: 2, tactics: 1 },
        focusFixed: 'stealth',
        focusNote:  '1 focus en Discrétion (choix libre) + 1 focus libre',
        talentKeyword: 'Discrétion',
        truthSuggestions: ['Agent de liaison allié', 'Saboteur ferroviaire', 'Passeur de la ligne de démarcation'],
        belongings: 'Faux papiers et cache de matériel',
    },
    spiritual_leader: {
        label: 'Guide spirituel',
        description: 'Prêtre, pasteur, rabbin ou autre figure spirituelle — vous guidez les âmes en ces temps d\'obscurité et avez peut-être été confronté à des vérités plus terrifiantes que le péché ordinaire.',
        attrBonus:  { agility: 1, insight: 2, reason: 1, will: 2 },
        skillBonus: { academia: 2, persuasion: 1, resilience: 1 },
        focusFixed: 'academia',
        focusNote:  '1 focus en Érudition (choix libre) + 1 focus libre',
        talentKeyword: 'Érudition',
        truthSuggestions: ['Aumônier militaire', 'Érudit des textes anciens', 'Mystique'],
        belongings: 'Textes sacrés et vêtements liturgiques',
    },
    veteran_great_war: {
        label: 'Vétéran de la Grande Guerre',
        description: 'Vous avez combattu dans la Première Guerre Mondiale, pensant que c\'était "la guerre pour en finir avec toutes les guerres". Maintenant, un autre conflit mondial fait rage et vous rappelez les vieilles compétences.',
        attrBonus:  { brawn: 1, coordination: 1, will: 1 },
        skillBonus: { fighting: 1, survival: 1 },
        skillBonusFree: 2, // +1 à 2 compétences libres
        focusFixed: null,
        focusNote:  '1 focus en Combat ou Survie + 1 focus libre',
        focusFixedChoice: ['fighting', 'survival'],
        talentKeyword: 'Combat ou Survie',
        truthSuggestions: ['Vétéran des tranchées', 'Survivant de la Somme', 'Ancien combattant de 14-18'],
        belongings: 'Un vieux revolver de service (Enfield Service Revolver)',
    },
    wanted: {
        label: 'Recherché par les autorités',
        description: 'Vous avez commis un crime grave, étiez traqué par les autorités, mais vous avez trouvé moyen de vous rendre utile — et peut-être de vous racheter. Ou pas.',
        attrBonus:  { agility: 1, insight: 1 },
        attrBonusFree: 1,
        skillBonus: { persuasion: 1, stealth: 1 },
        skillBonusFree: 2,
        focusFixed: null,
        focusNote:  '1 focus en Persuasion ou Discrétion + 1 focus libre',
        focusFixedChoice: ['persuasion', 'stealth'],
        talentKeyword: 'Persuasion ou Discrétion',
        truthSuggestions: ['Fugitif recherché', 'Passé criminel sombre', 'Identité empruntée'],
        belongings: 'Un objet de Restriction 2 ou moins lié à votre crime, ou de faux papiers d\'identité',
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// DONNÉES DE CRÉATION — CHARACTERISTICS (données complètes)
// ══════════════════════════════════════════════════════════════════════════════

export const CHARACTERISTIC_DATA = {
    bookworm: {
        label: 'Rat de bibliothèque',
        description: 'Vous avez étudié avec intensité et avez un amour profond de l\'apprentissage et du savoir. Vous connaissez des faits obscurs et des statistiques étranges, et vous préféreriez passer votre temps libre le nez dans un livre.',
        attrBonus:  { insight: 1, reason: 1 },
        attrBonusFree: 1,
        skillBonus: { academia: 1 },
        skillBonusFree: 3, // +1 à 3 autres compétences (no duplicate)
        talentKeyword: 'Érudition',
        truthDefault: 'Rat de bibliothèque',
        belongings: 'Des livres et journaux liés à votre domaine d\'étude',
    },
    born_behind_wheel: {
        label: 'Né derrière un volant',
        description: 'Vous vivez à bord de véhicules, ou enfoncé dans les rouages de vos engins favoris. Vous pouvez réparer ou conduire presque n\'importe quoi.',
        attrBonus:  { coordination: 1, reason: 1 },
        attrBonusFree: 1,
        skillBonus: { engineering: 1, vehicles: 1 },
        skillBonusFree: 2,
        talentKeyword: 'Véhicules',
        truthDefault: 'Né derrière un volant',
        belongings: 'Une salopette, des gants de conduite et des lunettes.',
    },
    built_brick_outhouse: {
        label: 'Bâti comme une armoire',
        description: 'Vous êtes immense. Vous dominez de la tête ceux qui vous entourent, et votre taille n\'est pas seulement physique — vous êtes fort et vous avez toujours trouvé des façons de mettre cette force à profit.',
        attrBonus:  { brawn: 1, coordination: 1 },
        attrBonusFree: 1,
        skillBonus: { athletics: 1, fighting: 1, resilience: 1 },
        skillBonusFree: 1,
        talentKeyword: 'Athlétisme ou Résilience',
        truthDefault: 'Bâti comme une armoire',
        belongings: 'Vos vêtements sont soit trop petits, soit lourdement modifiés pour accommoder votre taille inhabituele.',
    },
    conscientious_objector: {
        label: 'Objecteur de conscience',
        description: 'La violence n\'est jamais la réponse — mais ça ne fait pas de vous un lâche. De nombreux objecteurs de conscience servent avec distinction dans des rôles variés et apportent une réelle contribution à l\'effort de guerre. L\'exposition à la Guerre Secrète va tester vos idéaux jusqu\'à leurs limites absolues.',
        attrBonus:  { reason: 1, will: 1 },
        attrBonusFree: 1,
        skillBonus: { resilience: 1 },
        skillBonusFree: 3, // pas Combat ni Tactique, no duplicate
        skillExclude: ['fighting', 'tactics'],
        talentKeyword: 'Résilience',
        truthDefault: 'Objecteur de conscience',
        belongings: 'Un kit de compétence pour une compétence avec un rang de 2+',
    },
    criminal_mindset: {
        label: 'Esprit criminel',
        description: 'Vous vivez en dehors des petites considérations de la loi et il y a toujours une opportunité à saisir. Comme il y a toujours des excuses pour vos actes. Mais peut-être que vos compétences uniques peuvent être d\'une utilité dans la Guerre Secrète ?',
        attrBonus:  { insight: 1, agility: 1 },
        attrBonusFree: 1,
        skillBonus: { observation: 1, stealth: 1 },
        skillBonusFree: 2,
        talentKeyword: 'Discrétion ou Persuasion',
        truthDefault: 'Esprit criminel',
        belongings: 'Un seul objet de Restriction 3 ou moins, obtenu illégalement.',
    },
    dilettante: {
        label: 'Dilettante',
        description: 'Vous êtes un touche-à-tout et pouvez vous en sortir avec à peu près n\'importe quoi avec un certain degré de succès — même si vous êtes vite prêt à passer à autre chose.',
        attrBonus:  { coordination: 1, insight: 1 },
        attrBonusFree: 1,
        skillBonus: {}, // +1 à TOUTES les compétences à 0
        specialRule: 'dilettante', // gain +1 to every skill currently at 0
        talentKeyword: 'Tout mot-clé',
        truthDefault: 'Dilettante',
        belongings: 'Plusieurs objets triviaux potentiellement utiles (montre de poche, tournevis, allumettes, etc.) déclarables à votre discrétion au fil du jeu.',
    },
    dreamwalker: {
        label: 'Marcheur de rêves',
        description: 'Le sommeil n\'est qu\'un passage et, même enfant, vous vous êtes aventuré dans les Contrées du Rêve. De nombreux êtres étranges ont tenté de vous piéger pour vous faire obéir, mais vous avez évité ces destins oubliés. Maintenant votre pays a besoin de vous — pouvez-vous utiliser la sagesse particulière que vous avez gagnée à contempler le grand au-delà ?',
        attrBonus:  { insight: 1, will: 1 },
        attrBonusFree: 1,
        skillBonus: { resilience: 1, observation: 1 },
        skillBonusFree: 2,
        talentKeyword: 'Observation ou Étrange',
        truthDefault: 'Marcheur de rêves',
        belongings: 'Un animal familier de votre choix, dévoué et semblant percevoir des choses que les autres ne voient pas.',
    },
    escaped_europe: {
        label: 'Évadé d\'Europe',
        description: 'Tout ce que vous aimiez autrefois a été englouti par la machine de guerre allemande et ses terribles maîtres. Vous avez combattu dur et donné le meilleur de vous-même, mais avez finalement dû fuir pour ne pas mourir. Votre nouvelle maison vous semble étrange, mais en travaillant avec les Alliés vous brûlez du désir de libérer votre patrie.',
        attrBonus:  { insight: 1, will: 1 },
        attrBonusFree: 1,
        skillBonus: { academia: 1, athletics: 1, persuasion: 1, survival: 1 },
        talentKeyword: 'Persuasion ou Survie',
        truthDefault: 'Évadé d\'Europe',
        belongings: 'Un seul objet personnel précieux de votre foyer perdu.',
    },
    experimental_subject: {
        label: 'Sujet d\'expérience',
        description: 'L\'effort de guerre a besoin de volontaires pour apprendre exactement ce qui peut être accompli par la science, la technologie et même les forces mystiques. Des expériences top secrètes hors-livre sont menées pour améliorer les soldats avec de nouveaux pouvoirs effrayants. Vous vous êtes porté volontaire. Vraiment ? Enfin, c\'est courant en ces temps extraordinaires.',
        attrBonus:  { agility: 1, brawn: 1 },
        attrBonusFree: 1,
        skillBonusFree: 4, // +1 à 4 compétences (no duplicate)
        talentKeyword: 'Étrange',
        truthDefault: 'Sujet d\'expérience',
        belongings: 'Une forme d\'identification étrange, des sigils ou des marques mystérieuses sur la peau, peut-être des documents incomplets, ou un uniforme étrange rappelant votre période de test.',
    },
    my_war_started_early: {
        label: 'Ma guerre a commencé tôt',
        description: 'Que vous ayez commencé à vous battre en Abyssinie, en Tchécoslovaquie, en Mandchourie, ou en Espagne, vous étiez en guerre bien avant que le conflit principal n\'éclate. La guerre est une horreur, mais pour vous elle est devenue presque banalement quotidienne.',
        attrBonus:  { agility: 1, brawn: 1, coordination: 1 },
        skillBonus: { fighting: 1, medicine: 1 },
        skillBonusFree: 2,
        talentKeyword: 'Combat ou Médecine',
        truthDefault: 'Ma guerre a commencé tôt',
        belongings: 'Quelques souvenirs précieux, comme une photo de famille, la montre de votre père, ou un objet culturel ou religieux que vous portez toujours.',
    },
    nomadic: {
        label: 'Nomade',
        description: 'Autrefois vous aviez un foyer, mais maintenant la route est votre maison. Vous êtes un esprit agité et ne restez jamais trop longtemps au même endroit. Vous avez toujours gardé une longueur d\'avance sur vos ennuis, et avez appris à apprécier la liberté qu\'offre un mode de vie itinérant.',
        attrBonus:  { brawn: 1, coordination: 1, reason: 1 },
        skillBonus: { survival: 1, vehicles: 1 },
        skillBonusFree: 2,
        talentKeyword: 'Survie ou Véhicules',
        truthDefault: 'Nomade',
        belongings: 'Quelques objets pratiques (canif, dés, ficelle) et de quoi vous tirer d\'affaire, comme un instrument ou un jeu de cartes.',
    },
    own_occult_artefact: {
        label: 'Possesseur d\'artefact occulte',
        description: 'Il est dans votre famille depuis aussi longtemps que vous vous en souvenez et maintenant sa garde vous incombe. Que ce soit une arme capable d\'être retournée contre le Reich, l\'âme d\'un monstre piégé, ou un fragment d\'une entité pickled pour la postérité, vous devez décider comment vous allez utiliser cet étrange artefact.',
        attrBonus:  { reason: 1, will: 1 },
        attrBonusFree: 1,
        skillBonus: { resilience: 1 },
        skillBonusFree: 3, // +1 à Observation, Persuasion ou Discrétion + +1 à 2 autres (no duplicate)
        skillBonusChoice: ['observation', 'persuasion', 'stealth'], // choisir 1 parmi
        talentKeyword: 'Étrange',
        truthDefault: 'Possesseur d\'artefact occulte',
        belongings: 'Un artefact occulte (tome des Mythes de Cthulhu, jeton d\'une divinité, miroir de scrutation d\'obsidienne, ou boîte mystérieuse qui chuchote dans votre sommeil — à définir avec le MJ).',
    },
    raised_by_cult: {
        label: 'Élevé dans une secte',
        description: 'Vous êtes né et avez grandi dans un ordre ésotérique secret. Le dimanche, pendant que les autres allaient à l\'église et chantaient des hymnes, votre famille célébrait sous les étoiles avec d\'autres, des rites plus sombres et plus anciens. Vous avez vu des choses horribles et stupéfiantes, élargissant votre esprit et vous donnant une nouvelle perspective sur la place de l\'homme dans l\'univers.',
        attrBonus:  { brawn: 1, insight: 1 },
        attrBonusFree: 1,
        skillBonus: { academia: 1, resilience: 1, stealth: 1 },
        skillBonusFree: 1,
        talentKeyword: 'Discrétion, Résilience ou Étrange',
        truthDefault: 'Élevé dans une secte',
        belongings: 'Robes cérémoniales, jetons, charmes et autres accessoires personnels de la secte.',
    },
    raised_colonies: {
        label: 'Élevé dans les colonies',
        description: 'Lorsque la guerre est venue en Europe, vous étiez loin du front. Peu de pays étaient aussi éloignés de l\'action que le vôtre, mais vous avez quand même signé pour le roi et le pays et avez voyagé des milliers de kilomètres pour aider l\'effort de guerre. Le vôtre était une existence rurale où l\'agriculture était primordiale, le bétail paissait dans les plaines et tout le monde se connaissait.',
        attrBonus:  { agility: 1, brawn: 1, will: 1 },
        skillBonus: { athletics: 1, survival: 1 },
        skillBonusFree: 2,
        talentKeyword: 'Athlétisme ou Survie',
        truthDefault: 'Élevé dans les colonies',
        belongings: 'Quelques vêtements ou objets personnels de votre nation natale.',
    },
    read_occult_book: {
        label: 'A lu un grimoire maudit',
        description: 'À un moment de votre passé, vous avez lu un livre interdit, qui révélait des secrets horrifiques et les étranges mystères de l\'univers. Vous ne vous souvenez pas exactement de ce que vous avez lu, mais la sensation d\'avoir vu ces sigils et ces mots reste présente, comme une pâle cicatrice sur l\'esprit.',
        attrBonus:  { insight: 1, will: 1 },
        attrBonusFree: 1,
        skillBonus: { observation: 1, resilience: 1 },
        skillBonusFree: 2,
        talentKeyword: 'Étrange',
        truthDefault: 'A lu un grimoire maudit',
        belongings: 'Une collection de notes personnelles tirées d\'un tome occulte.',
    },
    scientific_visionary: {
        label: 'Visionnaire scientifique',
        description: 'Vous avez fait une découverte incroyable grâce à vos études, qui peut s\'avérer une précieuse contribution à l\'effort de guerre.',
        attrBonus:  { insight: 1, reason: 1 },
        attrBonusFree: 1,
        skillBonus: { academia: 1, engineering: 1 },
        skillBonusFree: 2,
        talentKeyword: 'Érudition ou Ingénierie',
        truthDefault: 'Visionnaire scientifique',
        belongings: 'Un contact avec l\'un des focuses suivants : cryptographie, science, électronique, explosifs, ou la compétence Médecine.',
    },
    street_kid: {
        label: 'Enfant des rues',
        description: 'Votre vie jusqu\'à présent a été dure, et vous avez dû travailler dur pour le peu que vous avez. D\'une façon ou d\'une autre vous avez toujours réussi à vous en sortir. Vous êtes rapide, vous êtes coriace, et vous êtes malin, et vous comptez sur vos ruses et vos instincts de rue pour survivre.',
        attrBonus:  { brawn: 1, coordination: 1, reason: 1 },
        skillBonus: { resilience: 1, survival: 1, stealth: 1 },
        skillBonusFree: 1,
        talentKeyword: 'Survie',
        truthDefault: 'Enfant des rues',
        belongings: 'Un porte-bonheur ou un autre symbole de bonne fortune.',
    },
    the_lucky_one: {
        label: 'Le miraculé',
        description: 'Quand l\'ordre de se mettre à l\'abri est arrivé, vous y avez obéi à la lettre. Puis la bombe est tombée et vous étiez le seul survivant. Vous ne pouvez pas expliquer comment vous avez tenu quand tous les autres sont morts, mais vous les entendez maintenant vous chuchoter dans le dos, vous traitant de Jonah et insinuant que vous portez la poisse.',
        attrBonus:  { agility: 1, brawn: 1, will: 1 },
        skillBonus: { athletics: 1, tactics: 1 },
        skillBonusFree: 2,
        talentKeyword: 'Fortune',
        truthDefault: 'Le miraculé',
        belongings: 'Un souvenir poignant d\'un de vos amis ou camarades tombés.',
    },
    veteran_great_war: {
        label: 'Vétéran de la Grande Guerre (Caractéristique)',
        description: 'Vous avez combattu dans la Première Guerre Mondiale. Maintenant une autre guerre mondiale fait rage, rappelant d\'anciennes compétences et de vieux cauchemars.',
        attrBonus:  { brawn: 1, coordination: 1, will: 1 },
        skillBonus: { fighting: 1, survival: 1 },
        skillBonusFree: 2,
        talentKeyword: 'Combat ou Survie',
        truthDefault: 'Vétéran de la Grande Guerre',
        belongings: 'Un vieux revolver de service.',
    },
    wanted_young_at_heart: {
        label: 'Recherché / Jeune de cœur',
        description: 'Deux options au choix — Recherché par les Autorités : vous avez commis un crime grave et étiez en fuite. Jeune de Cœur : vous êtes peut-être jeune ou simplement naïf, mais quand ça compte vous absorbez ce dont vous avez besoin à une vitesse remarquable.',
        isChoice: true,
        options: {
            wanted: {
                label: 'Recherché par les autorités',
                attrBonus:  { agility: 1, insight: 1 },
                attrBonusFree: 1,
                skillBonus: { persuasion: 1, stealth: 1 },
                skillBonusFree: 2,
                talentKeyword: 'Persuasion ou Discrétion',
                truthDefault: 'Recherché',
                belongings: 'Un objet de Restriction 2 ou moins lié à votre crime, ou de faux papiers.',
            },
            young_at_heart: {
                label: 'Jeune de cœur',
                attrBonus:  { agility: 1, reason: 1 },
                attrBonusFree: 1,
                skillBonus: { athletics: 1, stealth: 1 },
                skillBonusFree: 2, // +2 à n'importe quelle compétence avec rang 0 ou 1
                talentKeyword: 'Tout mot-clé',
                truthDefault: 'Jeune de cœur',
                belongings: '1 ressource supplémentaire pour chaque kit de compétence que vous possédez.',
            },
        },
    },
};

export const WEAPON_RANGES = ['Close', 'Short', 'Medium', 'Long'];
export const WEAPON_SIZES  = ['Minor', 'Major'];

// ══════════════════════════════════════════════════════════════════════════════
// MAGIE — Sorts par tradition
// Structure : { key, label, skill, difficulty, cost, duration, effect }
// skill = clé de compétence (academia, fighting, etc.)
// ══════════════════════════════════════════════════════════════════════════════

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

// Détermine le type de lanceur depuis la clé de talent
export function getSpellcasterType(talentKey) {
    if (!talentKey) return null;
    const t = TALENTS[talentKey];
    if (!t?.keywords.includes('Lanceur de sorts')) return null;
    // Bricoleur
    if (talentKey === 'occult_dabbler') return 'dabbler';
    // Tous les autres talents Lanceur de sorts = Traditionnel
    return 'traditional';
}

// Power rating (valeur numérique = nombre de sorts dans le manteau)
// Traditionnel/Chercheur : 2, Bricoleur : 1
export function getPowerRating(type) {
    return type === 'dabbler' ? 1 : 2;
}

// Dés de Challenge bonus depuis l'attribut lié
// Table p.142 : ≤8 → 0, 9 → +1, 10-11 → +2, 12-13 → +3, 14-15 → +4, ≥16 → +5
export function getBonusPowerDice(attrValue) {
    return getBonusDamage(attrValue); // même table
}

// Attribut de cast selon le type
export function getCastAttribute(type) {
    if (type === 'dabbler') return 'will';
    return 'insight'; // traditional
}

// Sorts de départ selon le type
export function getStartingSpellCount(type) {
    return type === 'dabbler' ? 1 : 3; // le Bricoleur peut choisir 1 normal ou 2 imparfaits
}

// ══════════════════════════════════════════════════════════════════════════════
// CALCULS DÉRIVÉS
// ══════════════════════════════════════════════════════════════════════════════

export function getBonusDamage(value) {
    if (value <= 8)  return 0;
    if (value === 9) return 1;
    if (value <= 11) return 2;
    if (value <= 13) return 3;
    if (value <= 15) return 4;
    return 5;
}

export function getResistance(value) {
    return getBonusDamage(value);
}

// Stress = max(Brawn, Will) + Resilience
export function computeStress(attrs, skills) {
    const brawn      = attrs.find(a => a.key === 'brawn')?.value     ?? 6;
    const will       = attrs.find(a => a.key === 'will')?.value      ?? 6;
    const resilience = skills.find(s => s.key === 'resilience')?.rank ?? 0;
    return Math.max(brawn, will) + resilience;
}

// Armour = resistance based on Brawn
export function computeArmour(attrs) {
    const brawn = attrs.find(a => a.key === 'brawn')?.value ?? 6;
    return getResistance(brawn);
}

// Courage = resistance based on Will
export function computeCourage(attrs) {
    const will = attrs.find(a => a.key === 'will')?.value ?? 6;
    return getResistance(will);
}

// Bonus languages from Reason
export function getBonusLanguages(attrs) {
    const reason = attrs.find(a => a.key === 'reason')?.value ?? 6;
    if (reason >= 11) return 2;
    if (reason >= 9)  return 1;
    return 0;
}

// ── Coût des dés supplémentaires (cumulatif global) ───────────────────────────
// 1er dé supplémentaire = 1, 2e = 2, 3e = 3 (Momentum ou Threat, source mixable)
export const EXTRA_DIE_COST = [1, 2, 3];

// ── Calcul succès — jet de compétence 2D20 ────────────────────────────────────
// expertiseApplied : déclaré explicitement par le joueur après le jet
// (la compétence peut avoir un focus sans que celui-ci soit applicable à l'action)

export function countSuccesses(results, target, skillRank, expertiseApplied) {
    let successes     = 0;
    let complications = 0;
    for (const val of results) {
        if (val === 20) {
            complications++;
        } else if (val === 1) {
            // 1 naturel = toujours 2 succès, même sans expertise, même compétence à 0
            successes += 2;
        } else if (val <= target) {
            // Double succès uniquement si l'expertise est déclarée applicable ET val ≤ rang
            successes += (expertiseApplied && val <= skillRank) ? 2 : 1;
        }
    }
    return { successes, complications };
}

// ── Calcul dommages — dés de Challenge (d6) ───────────────────────────────────

export function countChallengeDice(results, salvo = '') {
    let stress  = 0;
    let effects = 0;
    const salvoUpper = salvo.toUpperCase();
    for (const val of results) {
        if (val === 1)      { stress += 1; }
        else if (val === 2) { stress += 2; }
        else if (val === 3 || val === 4) { /* 0 */ }
        else if (val === 5 || val === 6) {
            if (salvoUpper.includes('VICIOUS') && val === 5) {
                stress += 2;
            } else {
                stress += 1;
                effects += 1;
            }
        }
    }
    return { stress, effects };
}

// ── Hooks dés — jet de compétence (2D20) ─────────────────────────────────────
// Passé à roll() par AchtungDiceModal pour les jets de compétence.

const skillDiceHooks = {
    buildNotation: (ctx) => {
        const { nbDes } = ctx.systemData;
        if (!nbDes || nbDes < 1) throw new RollError('NO_DICE', 'Aucun dé à lancer');
        return `${nbDes}d20`;
    },

    beforeRoll: (ctx) => {
        const { nbDes, momentumSpent = 0, threatGenerated = 0, isAssist = false } = ctx.systemData;
        if (nbDes < 1 || nbDes > 5)
            throw new RollError('INVALID_DICE', `Nombre de dés invalide : ${nbDes}`);
        const base      = isAssist ? 1 : 2;
        const extraDice = nbDes - base;
        if (extraDice > 0) {
            const expectedCost = EXTRA_DIE_COST.slice(0, extraDice).reduce((a, b) => a + b, 0);
            if (momentumSpent + threatGenerated !== expectedCost)
                throw new RollError('RESOURCE_MISMATCH', 'Incohérence ressources / dés achetés');
        }
        return ctx;
    },

    afterRoll: (raw, ctx) => {
        const {
            target, skillRank, hasFocus,
            difficulty = 1,
            momentumSpent = 0, threatGenerated = 0,
            isAssist = false,
        } = ctx.systemData;

        const results = raw.groups[0].values;
        const { successes, complications } = countSuccesses(results, target, skillRank, hasFocus);
        const success  = successes >= difficulty;
        const momentum = Math.max(0, successes - difficulty);

        return {
            results,
            target,
            skillRank,
            hasFocus:        !!hasFocus,
            successes,
            complications,
            difficulty,
            success,
            momentum,
            momentumSpent,
            threatGenerated,
            isAssist:        !!isAssist,
            label:           ctx.label,
        };
    },

    buildAnimationSequence: (raw, ctx) => ({
        mode: 'single',
        groups: raw.groups.map((g, i) => ({
            id:       `skill-${i}`,
            diceType: 'd20',
            color:    'default',
            label:    ctx.label || `${g.values.length}d20`,
            waves:    [{ dice: g.values }],
        })),
    }),

    renderHistoryEntry: (entry) => <AchtungHistoryEntry roll={entry} />,
};

// ── Hooks dés — dommages (dés de Challenge d6) ────────────────────────────────
// Passé à roll() par AchtungDiceModal pour les jets de dommages.
// Entité distincte car le type de dé, la notation et l'interprétation diffèrent.

const challengeDiceHooks = {
    buildNotation: (ctx) => {
        const { nbDice } = ctx.systemData;
        if (!nbDice || nbDice < 1) throw new RollError('NO_DICE', 'Aucun dé de Challenge à lancer');
        return `${nbDice}d6`;
    },

    beforeRoll: (ctx) => {
        if (ctx.systemData.nbDice < 1 || ctx.systemData.nbDice > 10)
            throw new RollError('INVALID_DICE', `Nombre de dés invalide : ${ctx.systemData.nbDice}`);
        return ctx;
    },

    afterRoll: (raw, ctx) => {
        const { salvo = '' } = ctx.systemData;
        const results = raw.groups[0].values;
        const { stress, effects } = countChallengeDice(results, salvo);
        return { results, stress, effects, salvo, label: ctx.label, successes: stress };
    },

    buildAnimationSequence: (raw, ctx) => ({
        mode: 'single',
        groups: raw.groups.map((g, i) => ({
            id:       `damage-${i}`,
            diceType: 'd6',
            color:    'default',
            label:    ctx.label || `${g.values.length}d6`,
            waves:    [{ dice: g.values }],
        })),
    }),

    renderHistoryEntry: (entry) => <AchtungHistoryEntry roll={entry} />,
};

// ── Config principale ─────────────────────────────────────────────────────────

const achtungConfig = {
    slug:  'achtung',
    label: 'Achtung! Cthulhu',

    // Hooks dés de compétence — passés à roll() pour les jets 2D20
    dice: skillDiceHooks,

    // Hooks dés de dommages — passés à roll() pour les jets de Challenge dice
    // Le composant choisit explicitement quel bloc utiliser :
    //   roll(notation, ctx, achtungConfig.dice)          → jet de compétence
    //   roll(notation, ctx, achtungConfig.challengeDice) → jet de dommages
    challengeDice: challengeDiceHooks,

    // Style par défaut des dés (lu par useDiceConfig)
    diceConfigDefault: {
        mode:   'custom',
        custom: {
            foreground: '#e5dcc0',   // papier jauni — faces
            background: '#3d3d28',   // vert kaki sombre — corps
            outline:    '#6b7c45',   // kaki — contour
            edge:       '#2f2f1e',   // bord très sombre
            texture:    '',
            material:   'metal',
        },
        lightColor:       '#b5a96a',  // sable
        strength:         6,
        gravity:          400,
        sounds:           false,
        animationEnabled: true,
    },
};

export default achtungConfig;
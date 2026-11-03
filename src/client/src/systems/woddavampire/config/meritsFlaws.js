// src/client/src/systems/woddavampire/config/meritsFlaws.js
// ─────────────────────────────────────────────────────────────────────────────
// Atouts et Handicaps (annexe vda20-catalogue-atouts-handicaps.md, §16).
// Effets reformulés et résumés ; noms français provisoires.
//
//   kind      : 'merit' | 'flaw'
//   category  : 'physical' | 'mental' | 'social' | 'supernatural'
//   cost      : nombre fixe, tableau de valeurs au choix ([2, 4]) ou { min, max }
//   structural: effet appliqué par la fiche (§16)
//   forbidden / only : clés de clans interdits / seuls autorisés
//   requires  : { discipline, min } ; excludes : clés incompatibles
//   chronicle : 'literacy_merit' (Lettré, si l'alphabétisation n'est pas supposée)
//               'literacy_flaw'  (Illettré, si elle l'est)
//   tableOnly : usage limité géré à la table
// ─────────────────────────────────────────────────────────────────────────────

const m = (key, label, category, cost, effect, extra = {}) => ({ key, label, kind: 'merit', category, cost, effect, ...extra });
const f = (key, label, category, cost, effect, extra = {}) => ({ key, label, kind: 'flaw', category, cost, effect, ...extra });

const LIST = [
    // ── Physiques ────────────────────────────────────────────────────────────
    m('ambidextrous', 'Ambidextre', 'physical', 1, 'Aucune pénalité pour la main non dominante.'),
    m('deceptive_eating', 'Faux appétit', 'physical', 1, 'Peut manger la nourriture mortelle sans en tirer de subsistance ; doit la régurgiter plus tard.'),
    m('blush_of_health', 'Teint de vie', 'physical', 2, 'Peau fraîche, aspect sain : passe pour vivant sauf examen poussé.', { forbidden: ['cappadocians', 'nosferatu'] }),
    m('without_a_trace', 'Sans laisser de trace', 'physical', 2, 'Hors des lieux civilisés, aucune trace ni odeur ; pistage surnaturel à +2 diff.'),
    m('efficient_digestion', 'Digestion efficace', 'physical', 3, '+1 point de sang pour 2 points bus.'),
    m('sturdy', 'Robuste', 'physical', 4, '+1 niveau de santé Contusionné.', { structural: true }),
    f('odd_gait', 'Démarche étrange', 'physical', 1, 'Déplacement à moitié vitesse ; démarche reconnaissable.'),
    f('ragged_bite', 'Morsure déchirée', 'physical', 2, 'Ne referme pas la plaie de la morsure ; risque d’infection pour la victime.'),
    f('unclean', 'Impur', 'physical', [2, 3], 'Peau d’apparence lépreuse ; à 3 points, porte une maladie contagieuse.', { clanCost: { nosferatu: 1 } }),
    f('addiction', 'Dépendance', 'physical', 3, 'Doit satisfaire un vice de vivant en se nourrissant ; sinon le sang ne nourrit qu’à moitié.'),
    f('monstrous', 'Monstrueux', 'physical', 3, 'La Bête marque le corps : Apparence 0, non augmentable.', { structural: true, forbidden: ['nosferatu'] }),
    f('permanent_wound', 'Plaie permanente', 'physical', 3, 'Se réveille chaque nuit au niveau Blessé gravement.'),
    f('slow_healing', 'Guérison lente', 'physical', 3, '2 sang par niveau normal ; 5 jours de plus par niveau aggravé.'),
    f('child', 'Enfant', 'physical', 4, 'Force et Vigueur max 2 ; +2 diff pour commander des adultes mortels.', { structural: true }),
    f('impaired_sense', 'Sens altéré', 'physical', 4, 'Un sens diminué : +3 diff aux jets qui l’utilisent.'),
    f('mute', 'Muet', 'physical', 4, '+3 diff pour communiquer avec des inconnus.'),
    f('flesh_of_the_corpse', 'Chair du cadavre', 'physical', 5, 'Les blessures restent visibles : ne passe jamais pour humain.'),

    // ── Mentaux ──────────────────────────────────────────────────────────────
    m('celestial_attunement', 'Accord céleste', 'mental', 1, "Connaît l'heure, prédit lever et coucher du soleil, lit les étoiles."),
    m('common_sense', 'Bon sens', 'mental', 1, 'Peut demander au Conteur un indice sur l’action la plus raisonnable.'),
    m('literacy', 'Lettré', 'mental', 1, 'Sait lire et écrire sa langue, le latin et ses langues apprises.', { chronicle: 'literacy_merit' }),
    m('eidetic_memory', 'Mémoire eidétique', 'mental', 2, 'Se rappelle parfaitement tout ce qu’il a vu ou vécu.'),
    m('light_sleeper', 'Sommeil léger', 'mental', 2, 'Se réveille à toute perturbation ; détecte une attaque surprise ordinaire en dormant.'),
    m('multi_lingual', 'Polyglotte', 'mental', 2, 'Règle maison : facilité narrative pour apprendre et utiliser les langues.'),
    f('illiterate', 'Illettré', 'mental', 1, 'Ne sait ni lire ni écrire.', { chronicle: 'literacy_flaw' }),
    f('deep_sleeper', 'Sommeil profond', 'mental', 1, '+2 diff pour se réveiller le jour.'),
    f('nightmares', 'Cauchemars', 'mental', 1, 'Au réveil, jet de Volonté ; échec : −1 dé jusqu’au prochain sommeil.'),
    f('prey_exclusion', 'Exclusion de proie', 'mental', 1, 'Refuse de se nourrir d’un type de personne ; sinon frénésie et dégénérescence.'),
    f('amnesia', 'Amnésie', 'mental', 2, 'A perdu une partie de sa mémoire.'),
    f('vengeful', 'Vindicatif', 'mental', 2, 'Obsédé par une vengeance ; doit la poursuivre sauf en dépensant 1 Volonté.'),
    f('flesh_eater', 'Mangeur de chair', 'mental', 2, 'Doit aussi manger de la chair riche en sang.'),
    f('ethical_prohibition', 'Interdit éthique', 'mental', [2, 4], '2 : refuse de se nourrir d’humains. 4 : refuse de se nourrir sauf nécessité absolue.'),

    // ── Sociaux ──────────────────────────────────────────────────────────────
    m('company_of_saints', 'Compagnie des saints et des héros', 'social', 1, '−1 diff aux jets sociaux où ce nom joue.'),
    m('prestigious_sire', 'Sire prestigieux', 'social', 1, '−1 diff aux jets sociaux caïnites au nom de son sire.'),
    m('debt_of_gratitude', 'Dette de gratitude', 'social', [1, 3], 'Un aîné lui doit une faveur (1) ou la vie (3).'),
    m('lingua_franca', 'Lingua franca', 'social', 1, 'Se fait comprendre presque partout, sans conversation complexe.'),
    m('patron', 'Patron', 'social', { min: 1, max: 5 }, 'Un protecteur fortuné ou puissant soutient ses projets.'),
    f('dark_secret', 'Sombre secret', 'social', 1, 'Un secret qui détruirait sa réputation.'),
    f('infamous_sire', 'Sire infâme', 'social', 1, 'Coupable par association d’un sire mal famé.'),
    f('mistaken_identity', 'Méprise', 'social', 1, 'Un sosie peu recommandable lui vaut des ennuis.'),
    f('outsider', 'Étranger', 'social', 1, '+1 diff aux jets sociaux concernés.'),
    f('sires_resentment', 'Rancune du sire', 'social', 1, 'Son sire le méprise et peut chercher à l’éliminer.'),
    f('smell_of_the_grave', 'Odeur de tombe', 'social', 1, '+1 diff aux jets sociaux avec les mortels.'),
    f('vulgar', 'Vulgaire', 'social', 1, '+1 diff aux jets de bonnes manières.'),
    f('enemy', 'Ennemi', 'social', { min: 1, max: 5 }, 'Du mesquin (1) à l’organisation qui veut sa mort (5).'),
    f('rivalry', 'Rival', 'social', { min: 1, max: 5 }, 'Quelqu’un veut lui rendre l’existence impossible.'),
    f('territorial', 'Territorial', 'social', 2, 'Test de frénésie s’il surprend un vampire chasser chez lui.'),
    f('apostate', 'Apostat', 'social', 2, 'A changé de Route de manière offensante.'),
    f('hunted', 'Traqué', 'social', 4, 'Un chasseur de sorcières le traque.'),
    f('marked_for_death', 'Marqué pour la mort', 'social', 4, 'La Cour du Sang a mis sa tête à prix.'),
    f('oathbreaker', 'Parjure', 'social', 4, 'Jusqu’à +3 diff pour convaincre de sa fiabilité.'),
    f('outspoken_heretic', 'Hérétique déclaré', 'social', 4, 'Jusqu’à +3 diff aux jets sociaux concernés.'),
    f('nameless', 'Sans nom', 'social', 5, 'Toute trace de son existence effacée ; aucun Atout social de réputation.', { excludes: ['company_of_saints', 'prestigious_sire'] }),

    // ── Surnaturels ──────────────────────────────────────────────────────────
    m('inoffensive_to_animals', 'Inoffensif pour les animaux', 'supernatural', 1, 'Les animaux le traitent comme un mortel ordinaire.'),
    m('darksight', 'Vision nocturne', 'supernatural', 2, 'Voit parfaitement dans le noir total.'),
    m('clan_apostate', 'Apostat de clan', 'supernatural', 2, 'Une Discipline de clan remplacée par Daimonion ; gagne la faiblesse baali.'),
    m('medium', 'Médium', 'supernatural', 2, 'Les esprits lui parlent et l’aident, contre une faveur.'),
    m('oracular_ability', 'Don oraculaire', 'supernatural', 3, 'Reconnaît présages et signes.'),
    m('spirit_mentor', 'Mentor spirituel', 'supernatural', 3, 'Un fantôme le guide et le protège.'),
    m('unbondable', 'Inféodable', 'supernatural', 3, 'Ne peut pas être lié par le sang.', { forbidden: ['tremere'] }),
    m('true_love', 'Amour véritable', 'supernatural', 4, 'Une fois par histoire, réussite automatique pour l’être aimé.', { tableOnly: true }),
    m('nine_lives', 'Neuf vies', 'supernatural', 6, 'Relance un jet qui entraînerait sa mort ; 9 vies.', { tableOnly: true }),
    m('lucky', 'Chanceux', 'supernatural', { min: 1, max: 5 }, 'Une relance par jour et par point (sauf jet de Route).', { tableOnly: true }),
    m('weak_aura_merit', 'Aura faible (Route ≤ 4)', 'supernatural', 2, 'Narratif : table d’aura de remplacement.'),
    m('potent_aura_merit', 'Aura puissante (Route ≥ 5)', 'supernatural', 3, 'Narratif : table d’aura de remplacement.'),
    f('cast_no_reflection', 'Sans reflet', 'supernatural', 1, 'Aucun reflet.'),
    f('initiate_of_the_road', 'Initié de la Route', 'supernatural', 1, '+1 diff contre frénésie et Rötschreck, pas d’aura.'),
    f('repulsed_by_garlic', "Repoussé par l'ail", 'supernatural', 1, 'Jet de Volonté en présence d’ail, sinon fuit.'),
    f('touch_of_frost', 'Toucher de givre', 'supernatural', 1, 'Les plantes meurent à son contact : +1 diff pour rester caché.', { excludes: ['harbinger_of_the_abyss'] }),
    f('cursed', 'Maudit', 'supernatural', { min: 1, max: 5 }, 'Malédiction, de la trahison découverte (1) à l’échec inéluctable (5).'),
    f('demon_hounded', 'Harcelé par un démon', 'supernatural', { min: 1, max: 5 }, 'Un démon offre faveurs et en exige.'),
    f('unlucky', 'Malchanceux', 'supernatural', { min: 1, max: 5 }, 'Le Conteur peut lui faire relancer un jet réussi, une fois par jour et par point.', { tableOnly: true }),
    f('thirteenth_generation', 'Treizième Génération', 'supernatural', 2, 'Génération 13ᵉ ; +1 diff pour activer les Disciplines.', { structural: true }),
    f('cannot_embrace', 'Ne peut étreindre', 'supernatural', 2, 'Incapable de créer un infant.', { excludes: ['weak_blood'] }),
    f('eerie_presence', 'Présence inquiétante', 'supernatural', 2, '+2 diff aux jets sociaux avec les mortels, sauf Intimidation.', { excludes: ['harbinger_of_the_abyss'] }),
    f('repulsive_to_animals', 'Repoussant pour les animaux', 'supernatural', 2, 'Les animaux paniquent ou attaquent.'),
    f('permanent_third_eye', 'Troisième œil permanent', 'supernatural', [2, 4], 'Œil frontal toujours visible.', { only: ['salubri', 'tremere'] }),
    f('animate_shadow', 'Ombre animée', 'supernatural', 3, 'Son ombre est une entité malveillante.'),
    f('cloaked_in_shadow', "Enveloppé d'ombre", 'supernatural', 3, 'Ne passe jamais pour humain.'),
    f('haunted', 'Hanté', 'supernatural', 3, 'Un fantôme vengeur le harcèle.'),
    f('cant_cross_running_water', "Ne peut franchir l'eau vive", 'supernatural', 4, 'Jet de Courage pour franchir une eau courante.'),
    f('grip_of_the_damned', 'Étreinte des damnés', 'supernatural', 4, 'Ses proies restent conscientes et se débattent.'),
    f('dark_fate', 'Sombre destin', 'supernatural', 5, 'Un destin funeste et légendaire l’attend.'),
    f('harbinger_of_the_abyss', "Héraut de l'Abîme", 'supernatural', 5, 'Éteint les flammes proches ; inclut Toucher de givre et Présence inquiétante.',
      { requires: { discipline: 'obtenebration', min: 1 }, excludes: ['touch_of_frost', 'eerie_presence'] }),
    f('light_sensitive', 'Sensible à la lumière', 'supernatural', 5, 'Dégâts du soleil doublés ; la lune inflige des dégâts létaux.'),
    f('weak_blood', 'Sang faible', 'supernatural', 5, 'Disciplines max 4 ; coût en sang des pouvoirs doublé.', { structural: true, excludes: ['cannot_embrace'] }),
    f('weak_aura_flaw', 'Aura faible (Route ≥ 5)', 'supernatural', 2, 'Narratif : table d’aura de remplacement.'),
    f('potent_aura_flaw', 'Aura puissante (Route ≤ 4)', 'supernatural', 3, 'Narratif : table d’aura de remplacement.'),
];

export const MERITS_FLAWS = Object.fromEntries(LIST.map(e => [e.key, e]));
export const MERIT_FLAW_ORDER = LIST.map(e => e.key);

export const MERIT_CATEGORY_LABELS = {
    physical: 'Physiques', mental: 'Mentaux', social: 'Sociaux', supernatural: 'Surnaturels',
};

/** Valeurs de coût possibles d'une entrée */
export const costOptions = (entry) => {
    if (Array.isArray(entry.cost)) return entry.cost;
    if (typeof entry.cost === 'object') return Array.from({ length: entry.cost.max - entry.cost.min + 1 }, (_, i) => entry.cost.min + i);
    return [entry.cost];
};

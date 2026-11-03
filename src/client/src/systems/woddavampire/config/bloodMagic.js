// src/client/src/systems/woddavampire/config/bloodMagic.js
// ─────────────────────────────────────────────────────────────────────────────
// Magie du sang (annexe vda20-catalogue-magie-sang.md, §14). Lot 1 : voies,
// kraina et rituels (clé, nom, niveau) ; jets structurés au lot 2.
// ─────────────────────────────────────────────────────────────────────────────

// Voies par famille de magie (pathSet de disciplines.js)
export const PATHS = {
    thaumaturgy: {
        creatio_ignis:        'Creatio Ignis (Création du feu)',
        iter_pernix:          'Iter Pernix (Le voyage rapide)',
        potestas_motus:       'Potestas Motus (Pouvoir du mouvement)',
        potestas_tempestatum: 'Potestas Tempestatum (Pouvoir sur les tempêtes)',
        potestas_elementorum: 'Potestas Elementorum (Pouvoir des éléments)',
        potestas_exsecrabilis:'Potestas Exsecrabilis (Pouvoir maudit)',
        potestas_vitae:       'Potestas Vitae (Pouvoir du sang vital)',
    },
    necromancy: {
        bone:            'Voie des Os',
        cenotaph:        'Voie du Cénotaphe',
        corpse_monster:  'Voie du Cadavre dans le monstre',
        graves_decay:    'Voie de la Tombe pourrissante',
        haunting:        'Voie de la Hantise',
        sepulchre:       'Voie du Sépulcre',
        ash:             'Voie des Cendres',
        twilight_garden: 'Voie du Jardin du crépuscule',
        vitreous:        'Voie vitreuse',
    },
};

// Kraina (Koldunisme) ; l'Ogham a une seule voie, le Genius Loci est secondaire
export const KRAINA = {
    koldunism: {
        transylvania: 'Kraina de Transylvanie',
        black_sea:    'Kraina de la mer Noire',
        genius_loci:  'Genius Loci',
    },
    ogham: {
        ogham:  'Ogham',
        talamh: 'Talamh (Genius Loci)',
    },
};
export const NEVER_PRIMARY = ['genius_loci', 'talamh'];

const r = (level, key, label, extra = {}) => ({ level, key, label, ...extra });

export const RITUALS = {
    thaumaturgy: [
        r(1, 'ambrus_kelemens_aegis', "Égide d'Ambrus Kelemen"),
        r(1, 'blood_contract', 'Contrat de sang'),
        r(1, 'defense_of_the_sacred_haven', 'Défense du havre sacré'),
        r(1, 'deflection_of_wooden_doom', 'Déflexion du fléau de bois'),
        r(1, 'domino_of_life', 'Domino de vie'),
        r(1, 'encrypt_missive', 'Chiffrer/déchiffrer un message'),
        r(1, 'illuminate_the_trail_of_prey', 'Illuminer la piste de la proie'),
        r(1, 'purity_of_flesh', 'Pureté de la chair'),
        r(1, 'wake_with_evenings_freshness', "S'éveiller avec la fraîcheur du soir"),
        r(1, 'rite_of_introduction', "Rite d'introduction", { clan: 'tremere' }),
        r(2, 'blood_walk', 'Marche du sang'),
        r(2, 'commune_with_cainite', 'Communion avec un Caïnite'),
        r(2, 'flaming_weapon', 'Arme enflammée'),
        r(2, 'extinguish', 'Extinction'),
        r(2, 'witness_of_whispers', 'Témoin des murmures'),
        r(2, 'cure_of_the_homeland', 'Remède du pays natal'),
        r(2, 'summon_guardian_spirit', 'Invoquer un esprit gardien'),
        r(2, 'ward', 'Garde'),
        r(3, 'animated_assistants', 'Assistants animés'),
        r(3, 'bind_the_familiar', 'Lier le familier'),
        r(3, 'incorporeal_passage', 'Passage incorporel'),
        r(3, 'shaft_of_belated_quiescence', 'Trait de quiétude tardive'),
        r(3, 'displacement_of_the_pneuma', 'Déplacement du pneuma', { clan: 'followers_of_set' }),
        r(4, 'animated_weapon', 'Arme animée'),
        r(4, 'candle_of_haunting', 'Bougie de hantise'),
        r(4, 'invisible_chains_of_binding', 'Chaînes invisibles'),
        r(4, 'scry', 'Scrutation'),
        r(4, 'return_of_the_heart', 'Retour du cœur', { clan: 'assamites' }),
        r(4, 'soul_of_the_homunculus', "Âme de l'homoncule", { clan: 'tremere' }),
        r(5, 'abandon_the_fetters', 'Abandonner les entraves'),
        r(5, 'enchant_talisman', 'Enchanter un talisman'),
        r(5, 'escape_to_a_true_haven', 'Fuite vers un vrai havre'),
        r(5, 'dedicate_the_haven', 'Consacrer le havre'),
        r(5, 'rite_of_marduk', 'Rite de Marduk tué et ressuscité', { clan: 'assamites' }),
        r(5, 'cheat_the_scale_of_hades', "Tromper la balance d'Hadès", { clan: 'followers_of_set' }),
    ],
    necromancy: [
        r(1, 'call_of_the_hungry_dead', 'Appel des morts affamés'),
        r(1, 'foxfire', 'Feu de renard'),
        r(1, 'final_sight', 'Vision ultime'),
        r(1, 'shew_stone', 'Pierre de vision', { clan: 'impundulu' }),
        r(2, 'antonius_denial', "Déni d'Antonius", { clan: 'giovani' }),
        r(2, 'hand_of_glory', 'Main de gloire'),
        r(2, 'memento_mori', 'Memento Mori'),
        r(2, 'witch_eye', 'Œil de sorcière'),
        r(2, 'prepare_the_vessel', 'Préparer le réceptacle'),
        r(2, 'totenpass', 'Totenpass', { clan: 'impundulu' }),
        r(3, 'din_of_the_damned', 'Vacarme des damnés'),
        r(3, 'nightmare_drums', 'Tambours du cauchemar', { clan: 'impundulu' }),
        r(3, 'tempest_shield', 'Bouclier de tempête'),
        r(4, 'bastone_del_diavolo', 'Bastone del Diavolo', { clan: 'giovani' }),
        r(4, 'vision_of_st_anthony', 'Vision de saint Antoine'),
        r(5, 'chill_of_oblivion', "Frisson de l'Oubli"),
        r(5, 'dead_mans_hand', 'Main du mort', { clan: 'impundulu' }),
        r(5, 'treasures_of_hades', "Trésors d'Hadès"),
        r(5, 'orphic_sojourn', 'Séjour orphique'),
    ],
    // Mysticisme de l'Abîme : rituels seuls (Occultisme 3, niveau ≤ Obténébration et ≤ Occultisme)
    abyss: [
        r(1, 'pierce_the_veil', 'Percer le voile'),
        r(1, 'eyes_of_the_abyss', "Yeux de l'Abîme"),
        r(2, 'talons_of_the_abyss', "Serres de l'Abîme"),
        r(2, 'subsume_the_darkness', 'Absorber les ténèbres'),
        r(3, 'balthazars_revelation', 'Révélation de Balthazar'),
        r(3, 'calling_the_hungry_shade', "Appel de l'ombre affamée"),
        r(3, 'third_eye_of_rickard_argentis', 'Troisième œil de Rickard Argentis'),
        r(4, 'reflections_of_hollow_revelation', 'Reflets de la révélation creuse'),
        r(5, 'whispers_in_the_dark', 'Murmures dans le noir'),
    ],
};

/** Rituels accessibles à un personnage : niveau ≤ valeur, rituels de clan réservés au clan */
export const availableRituals = (pathSet, maxLevel, clanKey) =>
    (RITUALS[pathSet] ?? []).filter(x => x.level <= maxLevel && (!x.clan || x.clan === clanKey));

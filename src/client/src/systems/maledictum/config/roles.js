// Rôles du personnage (Imperium Maledictum).
// Sources : livre de base (CORE) p.75-80 (6 rôles, choix p.74) ; Inquisition Player's Guide (IPG)
// p.56-59 (4 rôles réservés aux acolytes de l'Inquisition, ouverts à toutes les factions).
// Données seules : clés anglaises stables, libellés français, labelEn = nom VO.
//
// talents       : { pick, from } (clés de talents.js) ; fixed = talents acquis d'office (Mystique),
//                 options = option imposée d'un talent à options (Artistique (Littérature)).
// skillAdvances : 3 Avances parmi from.
// specAdvances  : 2 Avances de spécialisation parmi les spécialisations des compétences fromSkills,
//                 plus extra ('competence.specialisation') ; conditional = accès ouverts par un talent.
// equipment     : objets fixes ; equipmentChoices : une liste = un objet à choisir, { pick, from } =
//                 plusieurs à choisir.
//
// À relire :
// - Interlocuteur : « Choose 4 Talents » (les autres rôles : 2) ; décision D-5 : 4.
// - Savant : « Artist » lu Artistique (artistic).
// - Pénombre : la liste « deux au choix » s'arrête sur une virgule dans le livre (p.78, vérifié sur
//   le PDF) : il manque peut-être des objets.
// - Assassin : « Aim Training » n'est défini nulle part (CORE, IPG, IGMG) : retiré (D-12), il reste
//   7 options. « Unavering Will » lu Unwavering Will.
// - Explicateur : « I Am The Law » non défini : retiré (D-12), il reste 7 options.
// - Mystique, « any (Forbidden) Specialisation you have access to » avec Connaissance interdite :
//   noté '*.forbidden' (toute spécialisation Interdit ouverte par le talent).
// - Libellés d'objets provisoires, à aligner sur equipment.js et equipmentInquisition.js.

export const ROLES = [
    {
        key: 'interlocutor', label: 'Interlocuteur', labelEn: 'Interlocutor', source: 'core', page: 75,
        talents: { pick: 4, from: ['air_of_authority', 'briber', 'gothic_gibberish', 'dealmaker', 'distracting', 'gallows_humour', 'lickspittle', 'overseer'] },
        skillAdvances: { pick: 3, from: ['awareness', 'discipline', 'intuition', 'linguistics', 'presence', 'rapport'] },
        specAdvances: { pick: 2, fromSkills: ['intuition', 'presence', 'rapport'], extra: [] },
        equipment: ['Couteau', 'Équipement de survie', 'Perle vox'],
        equipmentChoices: [['Pistolet laser', 'Revolver à balles'], ['Porte-voix', 'Enregistreur picto', 'Vox-caster']],
        summary: 'Diplomate, négociateur ou manipulateur : celui qui parle, convainc et obtient ce que le Patron veut par les mots.',
    },
    {
        key: 'mystic', label: 'Mystique', labelEn: 'Mystic', source: 'core', page: 76,
        talents: {
            fixed: ['psyker'],
            fixedNote: 'Si vous avez déjà Psyker : apprenez à la place un pouvoir psychique mineur et un pouvoir d\'une discipline au choix.',
            pick: 2, from: ['condemn_the_witch', 'fated', 'forbidden_knowledge', 'mental_fortress', 'sanctioned_psyker'],
        },
        skillAdvances: { pick: 3, from: ['awareness', 'discipline', 'intuition', 'lore', 'navigation', 'psychic_mastery'] },
        specAdvances: {
            pick: 2, fromSkills: [], extra: ['discipline.fear', 'linguistics.forbidden', 'lore.forbidden'],
            conditional: [
                { talent: 'psyker', specs: ['awareness.psyniscience'], fromSkills: ['psychic_mastery'] },
                { talent: 'forbidden_knowledge', specs: ['*.forbidden'], fromSkills: [] },
            ],
        },
        equipment: ['Équipement de survie', 'Perle vox'],
        equipmentChoices: [['Couteau', 'Bâton'], ['Pistolet laser', 'Revolver à balles'], ['Focus psychique', 'Auspex']],
        summary: 'Psyker ou initié aux mystères du Warp, qui puise dans l\'Immaterium ou en connaît les dangers.',
    },
    {
        key: 'savant', label: 'Savant', labelEn: 'Savant', source: 'core', page: 77,
        talents: { pick: 2, from: ['artistic', 'attentive_assistant', 'chirurgeon', 'data_delver', 'eidetic_memory', 'lawbringer'] },
        skillAdvances: { pick: 3, from: ['logic', 'lore', 'medicae', 'navigation', 'piloting', 'tech'] },
        specAdvances: { pick: 2, fromSkills: ['lore', 'medicae', 'tech'], extra: [] },
        equipment: ['Couteau', 'Bretelles d\'arme', 'Ardoise de données', 'Équipement de survie', 'Perle vox'],
        equipmentChoices: [
            ['Pistolet laser', 'Revolver à balles'],
            { pick: 2, from: ['Auspex', 'Plume automatique', 'Instruments de chirurgien', 'Outil combiné', 'Diagnostor', 'Multiboussole', 'Passe-partout'] },
        ],
        summary: 'Érudit, médecin ou technicien : celui qui sait, analyse et répare.',
    },
    {
        key: 'penumbra', label: 'Pénombre', labelEn: 'Penumbra', source: 'core', page: 78,
        talents: { pick: 2, from: ['burglar', 'familiar_terrain', 'read_lips', 'secret_identity', 'skulker', 'unremarkable'] },
        skillAdvances: { pick: 3, from: ['athletics', 'awareness', 'dexterity', 'ranged', 'reflexes', 'stealth'] },
        specAdvances: { pick: 2, fromSkills: ['ranged', 'reflexes', 'stealth'], extra: [] },
        equipment: ['Couteau', 'Couteau', 'Silencieux', 'Grenade fumigène', 'Équipement de survie', 'Perle vox'],
        equipmentChoices: [
            ['Pistolet automatique', 'Pistolet laser'],
            ['Fusil laser', 'Fusil de précision'],
            { pick: 2, from: ['Auspex', 'Sangsue de communication (Comm Leech)', 'Nécessaire de déguisement', 'Harnais de descente', 'Grappin et corde', 'Magnoculaires', 'Passe-partout', 'Enregistreur picto', 'Photo-visières'] },
        ],
        summary: 'Assassin, voleur, espion ou agent dormant, à l\'aise dans les recoins sombres de l\'Imperium.',
    },
    {
        key: 'warrior', label: 'Guerrier', labelEn: 'Warrior', source: 'core', page: 79,
        talents: { pick: 2, from: ['deadeye', 'two_handed_cleave', 'disarm', 'drilled', 'duellist', 'tactical_movement'] },
        skillAdvances: { pick: 3, from: ['athletics', 'fortitude', 'medicae', 'melee', 'ranged', 'reflexes'] },
        specAdvances: { pick: 2, fromSkills: ['melee', 'ranged', 'reflexes'], extra: [] },
        equipment: ['Couteau', 'Grenade à fragmentation', 'Sac à dos', 'Équipement de survie', 'Perle vox'],
        equipmentChoices: [
            ['Épée', 'Épée tronçonneuse'],
            ['Pistolet laser', 'Revolver à balles'],
            ['Fusil laser', 'Fusil de chasse (de combat)'],
            ['Armure de plates', 'Veste pare-éclats'],
        ],
        summary: 'Combattant aguerri, soldat, garde du corps ou duelliste : celui qu\'on envoie quand la violence est la réponse.',
    },
    {
        key: 'zealot', label: 'Zélote', labelEn: 'Zealot', source: 'core', page: 80,
        talents: { pick: 2, from: ['icon_bearer', 'martyrdom', 'frenzy', 'flagellant', 'hatred', 'faithful'] },
        skillAdvances: { pick: 3, from: ['discipline', 'fortitude', 'linguistics', 'lore', 'melee', 'presence'] },
        specAdvances: { pick: 2, fromSkills: ['discipline', 'lore', 'melee'], extra: [] },
        equipment: ['Couteau', 'Icône sacrée', 'Perle vox'],
        equipmentChoices: [
            ['Grande arme', 'Épée tronçonneuse'],
            ['Pistolet laser', 'Lance-flammes de poing'],
            ['Cuirs lourds', 'Robe'],
            ['Porte-voix', 'Nécessaire d\'écriture'],
        ],
        summary: 'Fidèle à la foi ardente, qui se reconnaît moins à ce qu\'il fait qu\'à la ferveur avec laquelle il le fait.',
    },
    {
        key: 'assassin', label: 'Assassin', labelEn: 'Assassin', source: 'ipg', page: 56,
        talents: { pick: 2, from: ['burglar', 'ever_vigilant', 'hit_and_run', 'secret_identity', 'shadow_operative', 'skulker', 'unwavering_will'] },
        skillAdvances: { pick: 3, from: ['awareness', 'dexterity', 'intuition', 'logic', 'reflexes', 'stealth'] },
        specAdvances: { pick: 2, fromSkills: ['awareness', 'reflexes', 'stealth'], extra: [] },
        equipment: ['Couteau (modification Monolame)', 'Cuirs lourds', 'Magnoculaires', 'Équipement de survie'],
        equipmentChoices: [
            ['Grande arme', 'Épée tronçonneuse'],
            ['Pistolet laser avec Omnispex', 'Pistolet automatique avec Silencieux'],
            ['Fusil de précision', 'Fusil laser long (Long Las)'],
        ],
        summary: 'Dispensateur d\'une mort juste, qui abat les voix hérétiques avant qu\'elles prennent racine, aussi habile à soutirer des informations qu\'à tuer.',
    },
    {
        key: 'cruciator', label: 'Cruciateur', labelEn: 'Cruciator', source: 'ipg', page: 57,
        talents: { pick: 2, from: ['applied_anatomy', 'ballistic_forensics', 'bone_breaker', 'chirurgeon', 'field_medicae', 'gut_instinct', 'medicae_maverick', 'phlebotomist'] },
        skillAdvances: { pick: 3, from: ['medicae', 'logic', 'dexterity', 'discipline', 'intuition', 'fortitude'] },
        specAdvances: { pick: 2, fromSkills: ['medicae', 'dexterity', 'fortitude'], extra: [] },
        equipment: ['Couteau', 'Respirateur', 'Trousse de chirurgien (7 utilisations)', 'Chrono', 'Nécessaire d\'écriture'],
        equipmentChoices: [
            ['Pistolet laser', 'Revolver à balles'],
            ['Pistolet à toile', 'Lance-flammes de poing'],
            ['Robe', 'Cuirs légers'],
            ['Ardoise de données', 'Enregistreur picto'],
        ],
        summary: 'Chirurgien de la cellule, qui soigne blessures légères et graves sans exposer l\'Inquisition à des inconnus ; froid et calculateur.',
    },
    {
        key: 'explicator', label: 'Explicateur', labelEn: 'Explicator', source: 'ipg', page: 58,
        talents: {
            pick: 2, from: ['artistic', 'cypherist', 'data_delver', 'eidetic_memory', 'forbidden_knowledge', 'gothic_gibberish', 'lawbringer'],
            options: { artistic: 'literature' },
        },
        skillAdvances: { pick: 3, from: ['lore', 'logic', 'linguistics', 'discipline', 'intuition', 'fortitude'] },
        specAdvances: { pick: 2, fromSkills: ['lore', 'linguistics', 'intuition'], extra: [] },
        equipment: ['Couteau', 'Crâne-serviteur monotâche (fonction au choix)', 'Nécessaire d\'écriture', 'Chrono', 'Ardoise de données', 'Enregistreur picto'],
        equipmentChoices: [['Pistolet automatique', 'Revolver à balles']],
        summary: 'Pourvoyeur méticuleux d\'informations, versé dans les sujets interdits, rituels et traités hérétiques, par l\'étude ou sur le terrain.',
    },
    {
        key: 'seeker', label: 'Traqueur', labelEn: 'Seeker', source: 'ipg', page: 59,
        talents: { pick: 2, from: ['air_of_authority', 'attentive_assistant', 'blunt_force_authority', 'condemn_the_witch', 'dirty_fighting', 'ever_vigilant', 'gut_instinct', 'lawbringer'] },
        skillAdvances: { pick: 3, from: ['awareness', 'discipline', 'fortitude', 'logic', 'navigation', 'presence'] },
        specAdvances: { pick: 2, fromSkills: ['fortitude', 'navigation', 'presence'], extra: [] },
        equipment: ['Couteau', 'Fusil de chasse (à pompe)', 'Magnoculaires', 'Manteau blindé', 'Menottes', 'Perle vox', 'Nécessaire d\'écriture'],
        equipmentChoices: [
            ['Arme de mêlée ordinaire au choix', 'Épée tronçonneuse'],
            ['Canon de poing', 'Lance-flammes de poing'],
            ['Multiboussole', 'Nécessaire d\'excruciation'],
        ],
        summary: 'Limier implacable de l\'Inquisition, juge et bourreau des hérétiques et des xenos, aussi chasseur qu\'enquêteur.',
    },
];

// Imperium Maledictum : les 9 caractéristiques.
// Source : Imperium Maledictum, livre de base (core), p.50-51 (« Determine Characteristics »).
// Bonus de caractéristique = chiffre des dizaines (F 39 → BF 3), p.50.
// `bonus` : abréviation française du bonus (glossaire du contrat des catalogues).

export const CHARACTERISTICS = [
    {
        key: 'ws', label: 'Capacité de Combat', short: 'CC', bonus: 'BCC', labelEn: 'Weapon Skill', source: 'core', page: 50,
        summary: 'Compétence au combat rapproché sous toutes ses formes : sert pour les attaques de mêlée et pour se défendre en mêlée.',
    },
    {
        key: 'bs', label: 'Capacité de Tir', short: 'CT', bonus: 'BCT', labelEn: 'Ballistic Skill', source: 'core', page: 51,
        summary: 'Précision avec toutes les armes à distance : sert pour les attaques à distance.',
    },
    {
        key: 'str', label: 'Force', short: 'F', bonus: 'BF', labelEn: 'Strength', source: 'core', page: 51,
        summary: 'Muscle et puissance physique : soulever, escalader, et infliger plus de dégâts avec les armes de mêlée.',
    },
    {
        key: 'tgh', label: 'Endurance', short: 'E', bonus: 'BE', labelEn: 'Toughness', source: 'core', page: 51,
        summary: 'Santé, résistance et vigueur : encaisser, résister aux poisons et toxines, survivre aux environnements hostiles.',
    },
    {
        key: 'ag', label: 'Agilité', short: 'Ag', bonus: 'BAg', labelEn: 'Agility', source: 'core', page: 51,
        summary: 'Coordination, réflexes et conscience du corps : se déplacer en silence, agir en premier, esquiver.',
    },
    {
        key: 'int', label: 'Intelligence', short: 'Int', bonus: 'BInt', labelEn: 'Intelligence', source: 'core', page: 51,
        summary: 'Sagacité, raisonnement et culture générale : se souvenir de données, relier des indices, authentifier une relique.',
    },
    {
        key: 'per', label: 'Perception', short: 'Per', bonus: 'BPer', labelEn: 'Perception', source: 'core', page: 51,
        summary: 'Vigilance et acuité des sens : repérer un détail, voir le danger le premier, sentir qu\'on vous ment.',
    },
    {
        key: 'wil', label: 'Force Mentale', short: 'FM', bonus: 'BFM', labelEn: 'Willpower', source: 'core', page: 51,
        summary: 'Force d\'esprit et résolution : surmonter la peur, manier les pouvoirs psychiques et y résister.',
    },
    {
        key: 'fel', label: 'Sociabilité', short: 'Soc', bonus: 'BSoc', labelEn: 'Fellowship', source: 'core', page: 51,
        summary: 'Persuasion, capacité à mener et force de caractère : s\'attirer les bonnes grâces, négocier, imposer l\'obéissance.',
    },
];

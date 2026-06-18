// src/client/src/systems/achtung/config/base.js
// Briques de base : attributs, compétences, listes plates archétypes/backgrounds/caractéristiques.

export const ATTRIBUTES = [
    { key: 'agility',      label: 'Agilité',        description: 'Vitesse, équilibre, mémoire musculaire. Un personnage agile se déplace rapidement et silencieusement. Utilisé pour les attaques à distance.' },
    { key: 'brawn',        label: 'Force',           description: 'Condition physique et endurance. Un personnage fort est robuste et résistant. Détermine le stress maximum et la résistance aux dégâts (Armure).' },
    { key: 'coordination', label: 'Coordination',    description: 'Précision, timing, dextérité fine. Bons tireurs, bons pilotes, habiles de leurs mains. Utilisé pour les attaques à distance.' },
    { key: 'insight',      label: 'Perception',       description: 'Perception, instincts, intelligence de la rue. Discernement et sagesse pratique. Ajoute des dés de Challenge aux attaques à distance.' },
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

// Lookup rapide label compétence / attribut
export const SKILL_LABEL = Object.fromEntries(SKILLS.map(s => [s.key, s.label]));
export const ATTR_LABEL  = Object.fromEntries(ATTRIBUTES.map(a => [a.key, a.label]));

// ── Listes plates (pour Sheet / selects) ─────────────────────────────────────

export const ARCHETYPES = [
    { key: 'boffin',        label: 'Expert' },
    { key: 'commander',     label: 'Commandant' },
    { key: 'con_artist',    label: 'Escroc' },
    { key: 'grease_monkey', label: 'Mécano' },
    { key: 'infiltrator',   label: 'Infiltré' },
    { key: 'investigator',  label: 'Enquêteur' },
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
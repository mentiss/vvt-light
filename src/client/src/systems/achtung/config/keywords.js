// src/client/src/systems/achtung/config/keywords.js
// Table de traduction des keywords (clé anglaise canonique → label FR affiché).
// Les TALENTS stockent désormais leurs keywords en anglais ; cette table
// fournit uniquement l'affichage. Ne jamais matcher sur le label FR.

export const KEYWORD_LABELS = {
    // Compétences (alignées sur les clés SKILLS)
    academia:     'Érudition',
    athletics:    'Athlétisme',
    engineering:  'Ingénierie',
    fighting:     'Combat',
    medicine:     'Médecine',
    observation:  'Observation',
    persuasion:   'Persuasion',
    resilience:   'Résilience',
    stealth:      'Discrétion',
    survival:     'Survie',
    tactics:      'Tactique',
    vehicles:     'Véhicules',

    // Keywords spéciaux (règles, Chapitre 6 p.86)
    skill:        '<Compétence>',
    fortune:      'Fortune',
    advanced:     'Avancé',
    spellcaster:  'Lanceur de sorts',
    weird:        'Étrange',
    archetype:    'Archétype',

    // Archétypes (utilisés comme keyword sur les talents d'archétype)
    boffin:       'Boffin',
    commander:    'Commandant',
    con_artist:   'Escroc',
    grease_monkey:'Mécano',
    infiltrator:  'Infiltrateur',
    investigator: 'Investigateur',
    occultist:    'Occultiste',
    soldier:      'Soldat',
};

export const getKeywordLabel = (kw) => KEYWORD_LABELS[kw] ?? kw;
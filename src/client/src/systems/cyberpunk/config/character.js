// src/client/src/systems/cyberpunk/config/character.js
// ─────────────────────────────────────────────────────────────────────────────
// Personnage : stats, libellés, profils de répartition, directives personnelles.
// ─────────────────────────────────────────────────────────────────────────────

// Label court des stats pour l'affichage
export const STAT_LABELS = {
    cran:   'Cran',
    pro:    'Pro',
    chair:  'Chair',
    esprit: 'Esprit',
    style:  'Style',
    synth:  'Synth',
    cred:   'Cred',
    link:   'Lien',
};

// À quoi sert chaque stat (assistant de création)
export const STAT_DESCRIPTIONS = {
    cran:   'Garder votre calme et rester concentré durant des situations tendues.',
    pro:    'Faire appel à votre débrouillardise et à votre expérience, ou donner l\'impression que vous êtes un dur.',
    chair:  'Surmonter un problème par un effort physique, sans l\'aide de la cybernétique.',
    esprit: 'Vous sortir des emmerdes par la logique, l\'instinct, la créativité ou tout autre processus mental.',
    style:  'Gérer une situation avec votre charisme, votre présence ou votre aplomb.',
    synth:  'Vous interfacer sans heurt avec la technologie.',
};

// Profils de répartition des stats à la création
export const STAT_PROFILES = [
    {
        id:          'A',
        label:       'Profil A — Un seul point faible, moins de force',
        description: '+2 / +1 / 0 / 0 / 0 / -2',
        values:      [2, 1, 0, 0, 0, -2],
    },
    {
        id:          'B',
        label:       'Profil B — Deux points faibles, plus de force globale',
        description: '+2 / +1 / +1 / 0 / -1 / -2',
        values:      [2, 1, 1, 0, -1, -2],
    },
];

export const STATS = ['cran', 'pro', 'chair', 'esprit', 'style', 'synth'];

// Directives personnelles disponibles
export const DIRECTIVES_PERSONNELLES = [
    { id: 'ambitieux',    label: 'Ambitieux',    hasBlank: true,  blankHint: 'Au sein de ___' },
    { id: 'celebre',      label: 'Célèbre',       hasBlank: false },
    { id: 'compatissant', label: 'Compatissant',  hasBlank: false },
    { id: 'filial',       label: 'Filial',        hasBlank: true,  blankHint: 'Conseils de ___' },
    { id: 'fureteur',     label: 'Fureteur',      hasBlank: true,  blankHint: 'À propos de ___' },
    { id: 'intime',       label: 'Intime',        hasBlank: true,  blankHint: 'Mon ami ___' },
    { id: 'masochiste',   label: 'Masochiste',    hasBlank: false },
    { id: 'motive',       label: 'Motivé',        hasBlank: true,  blankHint: 'Mon code de conduite : ___' },
    { id: 'partisan',     label: 'Partisan',      hasBlank: true,  blankHint: 'Appartenance à ___' },
    { id: 'proselyte',    label: 'Prosélyte',     hasBlank: false },
    { id: 'protecteur',   label: 'Protecteur',    hasBlank: true,  blankHint: 'Responsabilités envers ___' },
    { id: 'prudent',      label: 'Prudent',       hasBlank: false },
    { id: 'rejete',       label: 'Rejeté',        hasBlank: true,  blankHint: 'Ancienne appartenance à ___' },
    { id: 'trompeur',     label: 'Trompeur',      hasBlank: false },
    { id: 'venal',        label: 'Vénal',         hasBlank: false },
    { id: 'vengeur',      label: 'Vengeur',       hasBlank: true,  blankHint: 'Nuire à ___' },
    { id: 'violent',      label: 'Violent',       hasBlank: false },
];

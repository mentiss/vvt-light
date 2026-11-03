// src/client/src/systems/woddavampire/config/conditions.js
// ─────────────────────────────────────────────────────────────────────────────
// Faiblesses appliquées des clans (§17), Dérangements (§19, annexe divers §6),
// liens de sang (§12). Les états (Frénésie, Rötschreck…) se règlent à la table
// (décision du MJ, 2026-11-03) : pas de bascule sur la fiche.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Faiblesses appliquées (§17) : effets des clans sur toutes les réserves.
 *   halvePerCount : réserves ÷ 2 par unité du compteur (cumulatif), minimum 1 dé
 *   minusPerCount : −1 dé par unité, sans descendre sous la Vigueur (non modifiée)
 *   halve         : réserves ÷ 2 tant que l'état est coché
 *   reminder      : rappel seulement
 */
export const CLAN_WEAKNESS_STATES = {
    tzimisce:  { kind: 'halvePerCount', counterLabel: 'Jours sans terre natale', label: 'Sans terre natale' },
    lhiannan:  { kind: 'minusPerCount', counterLabel: 'Semaines hors de la nature', label: 'Hors de la nature' },
    gargoyles: { kind: 'halve', label: 'Seule au monde' },
    anda:      { kind: 'reminder', label: 'Heure du crépuscule ou de l’aube', reminder: 'Première heure après le coucher du soleil ou dernière avant l’aube : comme Éveillé de jour.' },
};

/** Dérangements (annexe divers §6) : famille, effet rappelé */
export const DERANGEMENTS = {
    melancholic: { family: 'Dyscrasie', label: 'Mélancolique', effect: '−1 à toutes les réserves ; −1 diff à toute frénésie' },
    phlegmatic:  { family: 'Dyscrasie', label: 'Flegmatique', effect: '−1 dé aux jets d’Astuce et de Dextérité' },
    sanguine:    { family: 'Dyscrasie', label: 'Sanguin', effect: 'Le MJ tire 3 Capacités : +1 diff avec elles ; +1 diff à tous les jets d’Attributs mentaux' },
    choleric:    { family: 'Dyscrasie', label: 'Colérique', effect: '+2 diff pour résister à la frénésie ; −1 diff aux actes de violence douloureuse' },
    compulsion:  { family: 'Courroux divin', label: 'Compulsion', effect: 'Rituel obsessionnel ; empêché, −3 dés à tous les jets de frénésie (et frénésie plus souvent provoquée)' },
    lunacy:      { family: 'Courroux divin', label: 'Lunatisme', effect: 'Lune croissante ou pleine : −1 diff aux actions prolongées, +1 diff contre la frénésie ; décroissante : léthargie ; nouvelle lune : Volonté réduite de moitié et +1 sang pour se lever' },
    holy_sickness:{ family: 'Courroux divin', label: 'Mal sacré', effect: 'Au déclenchement, Vigueur diff 8 ; échec : crise convulsive dans les 3 tours, pour la scène ; −1 dé aux jets physiques le reste de la nuit' },
    st_vitus_dance:{ family: 'Courroux divin', label: 'Danse de Saint-Guy', effect: 'Mouvements involontaires, fièvre, larmes de sang : +2 diff aux jets sociaux ; peut se propager à un groupe' },
    sanguinary_animism:{ family: 'Péchés de l’âme', label: 'Animisme sanguinaire', effect: 'Croit boire l’âme de ses victimes, qui lui parlent ; doit leur répondre à voix haute' },
    visions:     { family: 'Péchés de l’âme', label: 'Visions', effect: 'Voit des figures saintes l’exhorter : −2 dés aux jets de dégénérescence' },
    voices:      { family: 'Péchés de l’âme', label: 'Voix', effect: 'Paranoïa démoniaque : +1 diff aux jets sociaux ; un échec critique social provoque une frénésie de peur' },
};
export const DERANGEMENT_RULE = 'Déclenché par le stress (tout ce qui appelle un jet de Maîtrise/Instinct), effet pour la nuit ; 1 Volonté = 1 tour de lucidité.';

/** Liens de sang (§12.1) : rappel de l'effet par niveau */
export const BLOOD_BOND_LEVELS = {
    1: 'Préoccupation, aucun effet mécanique',
    2: 'Jets sociaux du régnant contre lui : −1 diff ; agir contre le régnant demande un jet de Volonté',
    3: 'Lien complet : jets sociaux du régnant −2 diff ; Domination sans contact visuel ; résiste à +2 ; les autres liens disparaissent',
};

/**
 * États imposés par le Conteur (lot 3, spec §II.14) : il les active sur la fiche MJ, le joueur
 * les voit (effet sur sa fiche) sans pouvoir les couper ; rien n'est automatisé, les jets restent
 * à la table. Stockés dans la colonne JSON `states`.
 */
export const IMPOSED_STATES = {
    frenzy:     { label: 'Frénésie' },
    rotschreck: { label: 'Rötschreck' },
    torpor:     { label: 'Torpeur' },
};
export const IMPOSED_STATE_ORDER = Object.keys(IMPOSED_STATES);

// src/client/src/systems/woddavampire/config/disciplines.js
// ─────────────────────────────────────────────────────────────────────────────
// Disciplines (annexe vda20-catalogue-disciplines.md et magie-sang.md).
// Lot 1 : liste, nature (physique, magie du sang) ; les pouvoirs détaillés et
// leurs jets structurés arrivent au lot 2.
//   physical : bonus permanent appliqué automatiquement (§13.2)
//   bloodMagic : 'paths' (voies + rituels), 'kraina', 'rituals' (rituels seuls)
// ─────────────────────────────────────────────────────────────────────────────

export const DISCIPLINES = {
    abombwe:       { label: 'Abombwe' },
    animalism:     { label: 'Animalisme' },
    auspex:        { label: 'Augure' },
    bardo:         { label: 'Bardo' },
    celerity:      { label: 'Célérité', physical: 'dexterity' },
    chimerstry:    { label: 'Chimérie' },
    daimonion:     { label: 'Daimonion' },
    dementation:   { label: 'Démence' },
    dominate:      { label: 'Domination' },
    flight:        { label: 'Vol' },
    fortitude:     { label: "Force d'âme", physical: 'stamina' },
    mytherceria:   { label: 'Mytherceria' },
    obfuscate:     { label: 'Occultation' },
    obtenebration: { label: 'Obténébration' },
    potence:       { label: 'Puissance', physical: 'strength' },
    presence:      { label: 'Présence' },
    protean:       { label: 'Protéisme' },
    quietus:       { label: 'Quietus' },
    serpentis:     { label: 'Serpentis' },
    spiritus:      { label: 'Spiritus' },
    temporis:      { label: 'Temporis' },
    valeren:       { label: 'Valeren' },
    vicissitude:   { label: 'Vicissitude' },
    // Magie du sang
    thaumaturgy:       { label: 'Thaumaturgie', bloodMagic: 'paths', pathSet: 'thaumaturgy' },
    assamite_sorcery:  { label: 'Sorcellerie assamite', bloodMagic: 'paths', pathSet: 'thaumaturgy' },
    setite_sorcery:    { label: 'Sorcellerie sétite', bloodMagic: 'paths', pathSet: 'thaumaturgy' },
    necromancy:        { label: 'Nécromancie', bloodMagic: 'paths', pathSet: 'necromancy' },
    koldunism:         { label: 'Koldunisme', bloodMagic: 'kraina', alwaysOutOfClan: true },
    ogham:             { label: 'Ogham', bloodMagic: 'kraina' },
};

export const DISCIPLINE_ORDER = Object.keys(DISCIPLINES)
    .sort((a, b) => DISCIPLINES[a].label.localeCompare(DISCIPLINES[b].label, 'fr'));

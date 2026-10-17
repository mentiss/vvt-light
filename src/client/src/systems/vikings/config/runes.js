// src/client/src/systems/vikings/config/runes.js
// ─────────────────────────────────────────────────────────────────────────────
// Futhark (24 runes). Référence : spec_vikings.md, annexe C.
// ─────────────────────────────────────────────────────────────────────────────

export const RUNES = [
    { symbol: "ᚠ", name: "Fehu", letter: "F", literal: "Bétail", esoteric: "Argent, richesse" },
    { symbol: "ᚢ", name: "Uruz", letter: "U", literal: "Aurochs", esoteric: "Force, virilité" },
    { symbol: "ᚦ", name: "Thurisaz", letter: "Th", literal: "Thor, Géant", esoteric: "Monstre, démon, chaos" },
    { symbol: "ᚨ", name: "Ansuz", letter: "A", literal: "Messager, ange", esoteric: "Communication, source, Odin" },
    { symbol: "ᚱ", name: "Raidho", letter: "R", literal: "Monter à cheval, Charriot", esoteric: "Voyage, moyen de transport, roue" },
    { symbol: "ᚲ", name: "Kauno", letter: "K", literal: "Torche", esoteric: "Transition, soin, lumière" },
    { symbol: "ᚷ", name: "Gebo", letter: "G", literal: "Cadeau", esoteric: "Cadeau, surprise, baiser, chance, aubaine, fortune" },
    { symbol: "ᚹ", name: "Wunjo", letter: "W", literal: "Joie", esoteric: "Joie, bonheur, romance" },
    { symbol: "ᚺ", name: "Hagalaz", letter: "H", literal: "Grêle", esoteric: "Adversité, Perturbation" },
    { symbol: "ᚾ", name: "Naudiz", letter: "N", literal: "Besoin", esoteric: "Nécessité, contrainte, friction" },
    { symbol: "ᛁ", name: "Isa", letter: "I (short)", literal: "Glace", esoteric: "Stagnation, froid, stase, immobile" },
    { symbol: "ᛃ", name: "Jera", letter: "J", literal: "Année, Moisson", esoteric: "Moisson, cycle, Abondance" },
    { symbol: "ᛇ", name: "Ihwaz", letter: "Y, I (long)", literal: "(Bois d')if", esoteric: "Yggdrasil, longévité, arbre" },
    { symbol: "ᛈ", name: "Perth", letter: "P", literal: "Foyer", esoteric: "Destin, fatalité, Nornes, divination" },
    { symbol: "ᛉ", name: "Algiz", letter: "Z (Rr)", literal: "Cerf", esoteric: "Abri, protection" },
    { symbol: "ᛊ", name: "Sowilo", letter: "S", literal: "Soleil", esoteric: "Succès, énergie" },
    { symbol: "ᛏ", name: "Tiwaz", letter: "T", literal: "Le Dieu Tyr", esoteric: "Courage, se faire justice, guerre, sacrifice" },
    { symbol: "ᛒ", name: "Berkanan", letter: "B", literal: "Bouleau", esoteric: "Fertilité, croissance" },
    { symbol: "ᛖ", name: "Ehwaz", letter: "E", literal: "Cheval", esoteric: "Vitesse, progression, confiance" },
    { symbol: "ᛗ", name: "Mannaz", letter: "M", literal: "Homme", esoteric: "Humanité, conscience" },
    { symbol: "ᛚ", name: "Laguz", letter: "L", literal: "Eau", esoteric: "Inconscient, collectif, mémoire, flux" },
    { symbol: "ᛜ", name: "Ingwaz", letter: "Ng", literal: "Graine", esoteric: "Harmony, unité, paix" },
    { symbol: "ᛟ", name: "Othila", letter: "O", literal: "Ancêtre", esoteric: "Héritage, possession terrestre, noble" },
    { symbol: "ᛞ", name: "Dagaz", letter: "D, Dj", literal: "Jour", esoteric: "Eveil, aube, percée, progrès, pureté" }
];

// Ce que permet chaque niveau de rune (spec_vikings.md §3.6).
export const RUNE_LEVELS = [
    "Signe inconnu",
    "Identification, légendes",
    "Sensoriel (sentir la présence)",
    "Active : tracer, activer, combiner jusqu'à 3 runes",
    "Objets à charge, tatouages ; jusqu'à 4 runes",
    "Artefacts permanents, visions ; jusqu'à 5 runes",
];

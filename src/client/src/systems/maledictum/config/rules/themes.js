// src/client/src/systems/maledictum/config/rules/themes.js
// ─────────────────────────────────────────────────────────────────────────────
// Thème d'un personnage (spec_maledictum.md §8.2) : celui que le joueur a choisi,
// sinon celui de sa Fonction (Sœur novice → Sororitas), sinon celui de sa faction.
// La disposition ne change jamais d'un thème à l'autre : seuls les jetons
// (couleurs, images, polices) suivent l'attribut data-livery.
// ─────────────────────────────────────────────────────────────────────────────

import { FACTIONS } from '../factions.js';

export const THEMES = [
    { key: 'hereticus',     label: 'Ordo Hereticus' },
    { key: 'malleus',       label: 'Ordo Malleus' },
    { key: 'xenos',         label: 'Ordo Xenos' },
    { key: 'ecclesiarchy',  label: 'Ecclésiarchie' },
    { key: 'sororitas',     label: 'Adepta Sororitas' },
    { key: 'mechanicus',    label: 'Adeptus Mechanicus' },
    { key: 'militarum',     label: 'Astra Militarum' },
    { key: 'administratum', label: 'Administratum' },
    { key: 'telepathica',   label: 'Astra Telepathica' },
    { key: 'navy',          label: 'Flotte impériale' },
    { key: 'roguetrader',   label: 'Libre-Marchand' },
    { key: 'underhive',     label: 'Pègre de la ruche' },
];
export const DEFAULT_THEME = 'hereticus';
const KNOWN = new Set(THEMES.map(t => t.key));

/** Thème par défaut d'un couple faction / Fonction */
export const themeForFaction = (factionKey, dutyKey) => {
    const faction = FACTIONS.find(f => f.key === factionKey);
    const duty = faction?.duties?.find(d => d.key === dutyKey);
    return duty?.theme ?? faction?.theme ?? DEFAULT_THEME;
};

/** Thème affiché d'un personnage */
export const themeFor = (c) => (KNOWN.has(c?.themeKey) ? c.themeKey : themeForFaction(c?.factionKey, c?.dutyKey));

/** Thème de l'interface MJ : celui de l'Ordo du Patron de la table (Ordo Hereticus par défaut) */
const ORDO_THEMES = { ordo_hereticus: 'hereticus', ordo_malleus: 'malleus', ordo_xenos: 'xenos' };
export const themeForPatron = (patron) => ORDO_THEMES[patron?.data?.ordo] ?? DEFAULT_THEME;

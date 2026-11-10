// src/client/src/systems/maledictum/config/rules/npc.js
// ─────────────────────────────────────────────────────────────────────────────
// PNJ à la table (spec_pnj.md §8, spec_maledictum.md §11.4) : rôles et mort subite
// (livre p.317). Partie système d'une fiche : profil du bestiaire (config/bestiary.js),
// état à la table : { wounds, crits }.
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_LABELS = { troop: 'Troupe', elite: 'Élite', leader: 'Meneur' };

// Blessures critiques encaissées sans tomber : Troupe 0, Élite 1, Meneur BE (p.317)
const CRIT_MAX = { troop: 0, elite: 1 };
export const critMax = (profile) => CRIT_MAX[profile?.role] ?? Math.floor(Number(profile?.chars?.tgh ?? 30) / 10);

// Hors de combat : une Blessure critique de plus que le rôle n'en supporte
export const isOut = (profile, state) => Number(state?.crits ?? 0) > critMax(profile);

export const initialNpcState = () => ({ wounds: 0, crits: 0 });

// Données d'un jet d'attaque du moteur (type 'attack') depuis une attaque du profil
export const attackRoll = (attack) => ({
    target: Number(attack.value ?? 0),
    damage: parseInt(String(attack.damage), 10) || 0,
    ranged: !!attack.range,
    note: attack.traits ?? null,
    theme: null,
});

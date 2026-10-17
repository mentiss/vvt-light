// src/client/src/systems/vikings/config/npcs.js
// ─────────────────────────────────────────────────────────────────────────────
// Modèles de PNJ de combat (système de combat, hors refonte).
// ─────────────────────────────────────────────────────────────────────────────

export const NPC_TEMPLATES = [
    {
        name: 'Bandit',
        blessure: 0,
        blessureMax: 5,
        armure: 1,
        seuil: 1,
        actionsMax: 1,
        attaques: [
            { name: 'Hache', succes: 6, explosion: 10, degats: 2 }
        ]
    },
    {
        name: 'Guerrier',
        blessure: 0,
        blessureMax: 5,
        armure: 3,
        seuil: 1,
        actionsMax: 2,
        attaques: [
            { name: 'Épée', succes: 5, explosion: 9, degats: 2 },
            { name: 'Bouclier (coup)', succes: 6, explosion: 10, degats: 1 }
        ]
    },
    {
        name: 'Loup',
        blessure: 0,
        blessureMax: 4,
        armure: 0,
        seuil: 2,
        actionsMax: 2,
        attaques: [
            { name: 'Morsure', succes: 5, explosion: 9, degats: 2 }
        ]
    }
];

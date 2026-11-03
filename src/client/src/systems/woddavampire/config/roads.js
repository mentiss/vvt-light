// src/client/src/systems/woddavampire/config/roads.js
// ─────────────────────────────────────────────────────────────────────────────
// Routes et Voies (annexe vda20-catalogue-routes.md, §11). Lot 1 : Vertus
// imposées et aura ; hiérarchies des péchés au lot 2.
//   virtues : [Vertu morale, Vertu de maîtrise] — 'conscience' | 'conviction',
//             'self_control' | 'instinct' (Courage toujours présent)
//   paths   : Voies, avec leurs propres Vertus quand elles diffèrent
//   only    : Route de clan, proposée seulement à ces clans ; onlyCaste : et à cette caste
// ─────────────────────────────────────────────────────────────────────────────

export const VIRTUE_LABELS = {
    conscience:   'Conscience',
    conviction:   'Conviction',
    self_control: 'Maîtrise',
    instinct:     'Instinct',
    courage:      'Courage',
};

const CI = ['conviction', 'instinct'];
const CM = ['conscience', 'self_control'];
const VM = ['conviction', 'self_control'];

export const ROADS = {
    road_of_the_beast: {
        label: 'Route de la Bête', latin: 'Via Bestiae', virtues: CI, aura: 'Menace',
        paths: { hunter: { label: 'Voie du Chasseur', virtues: CI }, journeys: { label: 'Voie des Voyages', virtues: VM },
                 liberation: { label: 'Voie de la Libération', virtues: CI } },
    },
    road_of_heaven: {
        label: 'Route du Ciel', latin: 'Via Caeli', virtues: CM, aura: 'Sainteté',
        paths: { christ: { label: 'Voie du Christ', virtues: CM }, derech_chaim: { label: 'Derech Chaim – Voie de la Vie', virtues: CM },
                 prophet: { label: 'Voie du Prophète', virtues: CM }, eight_spoked_wheel: { label: 'Voie de la Roue à huit rayons', virtues: CM },
                 watchful_gods: { label: 'Voie des Dieux vigilants', virtues: CM } },
    },
    road_of_humanity: {
        label: "Route de l'Humanité", latin: 'Via Humanitas', virtues: CM, aura: 'Empathie avec les mortels',
        paths: { breath: { label: 'Voie du Souffle', virtues: CM }, community: { label: 'Voie de la Communauté', virtues: CM },
                 illumination: { label: "Voie de l'Illumination", virtues: CM } },
    },
    road_of_kings: {
        label: 'Route des Rois', latin: 'Via Regalis', virtues: VM, aura: 'Commandement',
        paths: { chivalry: { label: 'Voie de la Chevalerie', virtues: CM }, devaraja: { label: 'Voie de Devaraja', virtues: VM },
                 daena: { label: 'Voie de Daena', virtues: VM } },
    },
    road_of_lilith: {
        label: 'Route de Lilith', latin: 'Derech Lilit', virtues: CI, aura: 'Taillée et saignante',
        paths: { thorns: { label: 'Voie des Épines', virtues: CI }, veils: { label: 'Voie des Voiles', virtues: CI },
                 creation: { label: 'Voie de la Création', virtues: CI } },
    },
    road_of_metamorphosis: { label: 'Route de la Métamorphose', latin: 'Via Mutationis', virtues: CI, aura: 'Inhumanité', paths: {} },
    road_of_sin: {
        label: 'Route du Péché', latin: 'Via Peccati', virtues: CI, aura: 'Tentation',
        paths: { pleasure: { label: 'Voie du Plaisir', virtues: CI }, devil: { label: 'Voie du Diable', virtues: VM },
                 screams: { label: 'Voie des Hurlements', virtues: CI } },
    },
    road_of_bones: { label: 'Route des Ossements', latin: 'Via Ossium', virtues: VM, aura: 'Silence', paths: {} },
    road_of_yasa:  { label: 'Route du Yasa', latin: 'Via Yasaq', virtues: VM, aura: 'Confiance', paths: {} },
    // Routes de clan
    road_of_blood:    { label: 'Route du Sang', only: ['assamites'], virtues: VM, aura: 'Résolution', paths: {} },
    road_of_the_abyss:{ label: "Route de l'Abîme", only: ['lasombra'], virtues: VM, aura: 'Ténèbres et vérités interdites', paths: {} },
    road_of_paradox:  { label: 'Route du Paradoxe', only: ['ravnos'], virtues: VM, aura: 'Confiance', paths: {} },
    road_of_set: {
        label: 'Route de Set', only: ['followers_of_set'], virtues: VM, aura: 'Prosélytisme',
        paths: { apep: { label: "Voie d'Apep", virtues: CI, aura: 'Gratification' } },
    },
    code_of_samiel:   { label: 'Code de Samiel', only: ['salubri'], onlyCaste: 'warriors', virtues: CM, aura: 'Sacrifice pour autrui', paths: {} },
};

export const ROAD_ORDER = Object.keys(ROADS);

/** Couple de Vertus effectif d'une Route et de sa Voie éventuelle */
export const roadVirtues = (roadKey, pathKey) => {
    const road = ROADS[roadKey];
    if (!road) return CM;
    return road.paths?.[pathKey]?.virtues ?? road.virtues;
};

// src/client/src/systems/fabula/config/equipmentRare.js
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue des OBJETS RARES (fourni par le MJ — fabula_ultima_conception_des_objets_rare.md,
// section 2 : « Liste des exemples d'objets rare du livre de base »). Distinct du
// catalogue de base (equipment.js) : accessible en fiche/GM, PAS au wizard de
// création (décision MJ — les objets rares ne sont pas des choix de départ).
//
// Même forme d'entrée que EQUIPMENT_CATALOG (armes: precision/degats/mains/portee,
// armures/boucliers/accessoires: defense/defenseMagique/initiative). Le pouvoir
// spécifique de chaque objet rare (immunités, propriété multi, absorption...) est
// texte narratif pur — porté par `qualite`, jamais mécanisé (fidèle au principe de
// la plateforme : ces effets s'arbitrent à la table, pas dans le calcul automatique).
//
// EXCEPTION mécanisée : quelques armes accordent un bonus de Défense/Défense
// magique/Initiative INCONDITIONNEL (actif tant que l'arme est équipée, sans état
// à vérifier) — champ `bonus: { defense?, defenseMagique?, initiative? }`, lu par
// buildCatalogEntry (equipment.js) exactement comme les mods d'armure/bouclier.
// Les bonus CONDITIONNELS ("Tant que vous avez trois liens...") ne sont PAS
// mécanisés — décision actée avec le MJ : ils restent dans `qualite`, appliqués
// manuellement par la table.
//
// 'Poing-tempête' et 'Gant assommant' utilisaient [MIG+PUI] dans la source — MIG
// confirmé par le MJ comme coquille de traduction pour PUI (donc [PUI+PUI]),
// intégrés normalement ici.
// ─────────────────────────────────────────────────────────────────────────────

import { buildCatalogEntry } from './equipment.js';

export const EQUIPMENT_RARE_CATALOG = {
    arbalete_de_poing: {
        nom: 'Arbalète de poing', type: 'arme', categorie: 'arc', martial: false, prix: 150,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 4, type: 'physique' },
        mains: 1, portee: 'distance', qualite: 'Aucune qualité.',
    },
    arc_composite: {
        nom: 'Arc composite', type: 'arme', categorie: 'arc', martial: false, prix: 250,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 8, type: 'physique' },
        mains: 2, portee: 'distance', qualite: 'Aucune qualité.',
    },
    brise_siege: {
        nom: 'Brise-siège', type: 'arme', categorie: 'arc', martial: true, prix: 750,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 12, type: 'physique' },
        mains: 2, portee: 'distance', qualite: 'Les dégâts infligés par cette arme ignorent les résistances.',
    },
    yoichi: {
        nom: 'Yoichi', type: 'arme', categorie: 'arc', martial: false, prix: 900,
        precision: { attrs: ['dex', 'dex'], bonus: 1 },
        degats: { bonus: 8, type: 'air' },
        mains: 2, portee: 'distance', qualite: 'Vous êtes immunisé contre l\'état traumatisé.',
    },
    arc_tonnerre: {
        nom: 'Arc-tonnerre', type: 'arme', categorie: 'arc', martial: false, prix: 1000,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 8, type: 'foudre' },
        mains: 2, portee: 'distance', qualite: 'Vous bénéficiez d\'une résistance aux dégâts de foudre.',
    },
    arc_de_pillard: {
        nom: 'Arc de pillard', type: 'arme', categorie: 'arc', martial: false, prix: 1250,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 8, type: 'feu' },
        mains: 2, portee: 'distance', qualite: 'Quand vous réduisez une créature à 0 Point de Vie avec cette arme, vous pouvez immédiatement récupérer 2 Points d\'Inventaire.',
    },
    arbalete_gatling: {
        nom: 'Arbalète Gatling', type: 'arme', categorie: 'arc', martial: true, prix: 1350,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 12, type: 'physique' },
        mains: 2, portee: 'distance', qualite: 'Les attaques effectuées avec cette arme ont la propriété multi (2).',
    },
    arc_piege_a_dragon: {
        nom: 'Arc piège-à-dragon', type: 'arme', categorie: 'arc', martial: true, prix: 1500,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 12, type: 'terre' },
        mains: 2, portee: 'distance', qualite: 'Quand vous touchez une cible volante avec cette arme, vous pouvez la forcer à atterrir immédiatement.',
    },
    jalousie_glaciale: {
        nom: 'Jalousie glaciale', type: 'arme', categorie: 'arc', martial: true, prix: 1500,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 12, type: 'glace' },
        mains: 2, portee: 'distance', qualite: 'Quand vous touchez une ou plusieurs créatures avec cette arme, si vous avez au moins un lien d\'infériorité, vous pouvez récupérer 5 PM.',
    },
    il_de_gorgone: {
        nom: 'Œil de Gorgone', type: 'arme', categorie: 'arc', martial: true, prix: 2000,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 12, type: 'poison' },
        mains: 2, portee: 'distance', qualite: 'Chaque cible touchée par cette arme subit l\'état ralenti.',
    },
    artemis: {
        nom: 'Artemis', type: 'arme', categorie: 'arc', martial: true, prix: 2100,
        precision: { attrs: ['dex', 'dex'], bonus: 1 },
        degats: { bonus: 12, type: 'lumiere' },
        mains: 2, portee: 'distance', qualite: 'Vous êtes immunisé contre les dégâts de ténèbres.',
    },
    masse_d_armes_benie: {
        nom: 'Masse d\'armes bénie', type: 'arme', categorie: 'arcanique', martial: false, prix: 200,
        precision: { attrs: ['vol', 'vol'], bonus: 0 },
        degats: { bonus: 2, type: 'lumiere' },
        mains: 1, portee: 'cac', qualite: 'Aucune qualité.',
    },
    encyclopedie: {
        nom: 'Encyclopédie', type: 'arme', categorie: 'arcanique', martial: false, prix: 600,
        precision: { attrs: ['int', 'int'], bonus: 0 },
        degats: { bonus: 6, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Vous êtes immunisé contre l\'état étourdi.',
    },
    ars_goetia: {
        nom: 'Ars Goetia', type: 'arme', categorie: 'arcanique', martial: false, prix: 800,
        precision: { attrs: ['int', 'int'], bonus: 0 },
        degats: { bonus: 6, type: 'lumiere' },
        mains: 2, portee: 'cac', qualite: 'Vous bénéficiez d\'un bonus de +2 aux tests de magie et aux tests opposés contre les démons.',
    },
    ferule: {
        nom: 'Férule', type: 'arme', categorie: 'arcanique', martial: false, prix: 1050,
        precision: { attrs: ['int', 'vol'], bonus: 0 },
        degats: { bonus: 2, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Vous bénéficiez d\'un bonus de +1 aux tests de magie.',
    },
    sceptre_de_tyran: {
        nom: 'Sceptre de tyran', type: 'arme', categorie: 'arcanique', martial: false, prix: 1200,
        precision: { attrs: ['vol', 'vol'], bonus: 0 },
        degats: { bonus: 6, type: 'tenebres' },
        mains: 2, portee: 'cac', qualite: 'Chaque fois que vous touchez une ou plusieurs créatures avec cette arme, chacune perd 10 Points de Magie.',
    },
    culte_des_goules: {
        nom: 'Culte des goules', type: 'arme', categorie: 'arcanique', martial: false, prix: 1400,
        precision: { attrs: ['int', 'int'], bonus: 0 },
        degats: { bonus: 6, type: 'air' },
        mains: 1, portee: 'cac', qualite: 'Quand vous touchez une ou plusieurs créatures avec cette arme, vous pouvez récupérer 5 Points de Vie.',
    },
    caducee: {
        nom: 'Caducée', type: 'arme', categorie: 'arcanique', martial: false, prix: 1600,
        precision: { attrs: ['vol', 'vol'], bonus: 0 },
        degats: { bonus: 6, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Les sorts rendant des PV que vous lancez en rendent 5 de plus.',
    },
    necronomicon: {
        nom: 'Necronomicon', type: 'arme', categorie: 'arcanique', martial: false, prix: 1800,
        precision: { attrs: ['int', 'vol'], bonus: 1 },
        degats: { bonus: 6, type: 'tenebres' },
        mains: 2, portee: 'cac', qualite: 'Quand vous touchez une ou plusieurs créatures avec un sort offensif, chacune d\'entre elles subit l\'état traumatisé.',
    },
    livre_jaune: {
        nom: 'Livre jaune', type: 'arme', categorie: 'arcanique', martial: false, prix: 2100,
        precision: { attrs: ['int', 'int'], bonus: 0 },
        degats: { bonus: 6, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Les sorts que vous lancez infligent 5 dégâts de plus.',
    },
    baton_de_rafflesie: {
        nom: 'Bâton de rafflésie', type: 'arme', categorie: 'arcanique', martial: false, prix: 2200,
        precision: { attrs: ['vol', 'vol'], bonus: 0 },
        degats: { bonus: 6, type: 'poison' },
        mains: 2, portee: 'cac', qualite: 'Quand vous touchez une ou plusieurs créatures avec un sort offensif, chacune d\'elles subit l\'état empoisonné.',
    },
    revolver: {
        nom: 'Revolver', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 300,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'distance', qualite: 'Aucune qualité.',
    },
    istinggar: {
        nom: 'Istinggar +', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 350,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 12, type: 'physique' },
        mains: 2, portee: 'distance', qualite: 'Aucune qualité.',
    },
    calibre_magique: {
        nom: 'Calibre magique', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 400,
        precision: { attrs: ['int', 'int'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'distance', qualite: 'Les attaques effectuées avec cette arme se font contre la Défense magique.',
    },
    pistolet_diamant: {
        nom: 'Pistolet diamant', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 650,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'distance', qualite: 'Inflige 5 dégâts de plus aux créatures artificielles.',
    },
    chasseur_de_tetes: {
        nom: 'Chasseur de têtes', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 800,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'distance', qualite: 'Inflige 5 dégâts de plus aux cibles vis-à-vis desquelles vous avez un lien de haine.',
    },
    pistolet_comete: {
        nom: 'Pistolet comète', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 950,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 8, type: 'tenebres' },
        mains: 1, portee: 'distance', qualite: 'Vous êtes immunisé contre l\'état étourdi.',
    },
    canon_bunker: {
        nom: 'Canon bunker', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 1050,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 12, type: 'physique' },
        mains: 2, portee: 'distance', qualite: 'Vous recevez un bonus de +1 en Défense.',
        bonus: { defense: 1 }, // bonus inconditionnel détecté dans le texte
    },
    alchimousquet: {
        nom: 'Alchimousquet', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 1300,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 8, type: 'poison' },
        mains: 1, portee: 'distance', qualite: 'Les potions que vous créez avec vos Points d\'Inventaire infligent 5 dégâts de plus et restaurent 5 Points de Vie.',
    },
    calamite: {
        nom: 'Calamité', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 1550,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 16, type: 'feu' },
        mains: 2, portee: 'distance', qualite: 'Les attaques effectuées avec cette arme ont la propriété multi (2).',
    },
    calibre_glacant: {
        nom: 'Calibre glaçant', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 1850,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 8, type: 'glace' },
        mains: 1, portee: 'distance', qualite: 'Chaque cible touchée par cette arme subit l\'état ralenti.',
    },
    quatermain: {
        nom: 'Quatermain', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 2600,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 12, type: 'air' },
        mains: 2, portee: 'distance', qualite: 'Inflige un nombre de dégâts supplémentaires égal à la différence entre vos Points d\'Inventaire actuels et votre maximum.',
    },
    vieux_fouet: {
        nom: 'Vieux Fouet', type: 'arme', categorie: 'articulee', martial: false, prix: 650,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Inflige 5 dégâts supplémentaires aux bêtes et aux monstres.',
    },
    etoile_crepusculaire: {
        nom: 'Étoile crépusculaire', type: 'arme', categorie: 'articulee', martial: false, prix: 750,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 4, type: 'tenebres' },
        mains: 1, portee: 'cac', qualite: 'Vous êtes immunisé contre l\'état traumatisé.',
    },
    fleau_des_sorcieres: {
        nom: 'Fléau des sorcières', type: 'arme', categorie: 'articulee', martial: false, prix: 800,
        precision: { attrs: ['dex', 'dex'], bonus: 1 },
        degats: { bonus: 8, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Les dégâts infligés par cette arme réduisent les Points de Magie de la cible et non ses Points de Vie.',
    },
    salamandre: {
        nom: 'Salamandre', type: 'arme', categorie: 'articulee', martial: false, prix: 1000,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Vous bénéficiez d\'une résistance aux dégâts de feu.',
    },
    nunchaku: {
        nom: 'Nunchaku', type: 'arme', categorie: 'articulee', martial: false, prix: 1100,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Vous recevez un bonus de +1 en défense.',
    },
    dominatrix: {
        nom: 'Dominatrix', type: 'arme', categorie: 'articulee', martial: false, prix: 1200,
        precision: { attrs: ['dex', 'vol'], bonus: 0 },
        degats: { bonus: 8, type: 'feu' },
        mains: 1, portee: 'cac', qualite: 'Vous bénéficiez d\'un bonus de +2 aux tests de précision et de magie contre les cibles enragées.',
    },
    lame_fouet: {
        nom: 'Lame-fouet', type: 'arme', categorie: 'articulee', martial: true, prix: 1400,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 12, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Les attaques effectuées avec cette arme ont la propriété multi (2).',
    },
    filament_de_soie: {
        nom: 'Filament de soie', type: 'arme', categorie: 'articulee', martial: true, prix: 1450,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 12, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Vous bénéficiez d\'une résistance aux dégâts physiques.',
    },
    kusarigama: {
        nom: 'Kusarigama', type: 'arme', categorie: 'articulee', martial: false, prix: 1650,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état ralenti.',
    },
    jormungand: {
        nom: 'Jormungand', type: 'arme', categorie: 'articulee', martial: true, prix: 2400,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 12, type: 'tenebres' },
        mains: 2, portee: 'cac', qualite: 'Les attaques effectuées avec cette arme ont la propriété multi (3).',
    },
    moustache_de_koi: {
        nom: 'Moustache de koi', type: 'arme', categorie: 'articulee', martial: true, prix: 2800,
        precision: { attrs: ['dex', 'vol'], bonus: 0 },
        degats: { bonus: 12, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Vous êtes immunisé contre les dégâts de ténèbres et de lumière.',
    },
    croissant_tranchant: {
        nom: 'Croissant tranchant', type: 'arme', categorie: 'jet', martial: false, prix: 350,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 4, type: 'lumiere' },
        mains: 1, portee: 'distance', qualite: 'Les attaques effectuées avec cette arme se font contre la Défense magique.',
    },
    etoile_meteore: {
        nom: 'Étoile météore', type: 'arme', categorie: 'jet', martial: false, prix: 350,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 4, type: 'feu' },
        mains: 1, portee: 'distance', qualite: 'Aucune qualité.',
    },
    hache_de_lancer: {
        nom: 'Hache de lancer', type: 'arme', categorie: 'jet', martial: false, prix: 350,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'distance', qualite: 'Aucune qualité.',
    },
    boomerang: {
        nom: 'Boomerang', type: 'arme', categorie: 'jet', martial: false, prix: 750,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 4, type: 'physique' },
        mains: 1, portee: 'distance', qualite: 'Inflige 5 dégâts supplémentaires aux bêtes et aux monstres.',
    },
    danseuse_du_vent: {
        nom: 'Danseuse du vent', type: 'arme', categorie: 'jet', martial: false, prix: 850,
        precision: { attrs: ['dex', 'vol'], bonus: 0 },
        degats: { bonus: 8, type: 'air' },
        mains: 1, portee: 'distance', qualite: 'Les dégâts infligés par cette arme ignorent les résistances.',
    },
    acuponcteur: {
        nom: 'Acuponcteur', type: 'arme', categorie: 'jet', martial: false, prix: 950,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'distance', qualite: 'Vous êtes immunisé contre l\'état empoisonné.',
    },
    moulin_bleu: {
        nom: 'Moulin bleu', type: 'arme', categorie: 'jet', martial: false, prix: 950,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 4, type: 'glace' },
        mains: 1, portee: 'distance', qualite: 'Vous bénéficiez d\'une résistance aux dégâts de glace.',
    },
    aiguille_de_sorciere: {
        nom: 'Aiguille de sorcière', type: 'arme', categorie: 'jet', martial: false, prix: 1050,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 4, type: 'terre' },
        mains: 1, portee: 'distance', qualite: 'Vous bénéficiez d\'une résistance aux dégâts de ténèbres.',
    },
    chakram: {
        nom: 'Chakram', type: 'arme', categorie: 'jet', martial: false, prix: 1250,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 4, type: 'physique' },
        mains: 1, portee: 'distance', qualite: 'Les attaques effectuées avec cette arme ont la propriété multi (2).',
    },
    vajra: {
        nom: 'Vajra', type: 'arme', categorie: 'jet', martial: false, prix: 2050,
        precision: { attrs: ['dex', 'vol'], bonus: 1 },
        degats: { bonus: 8, type: 'foudre' },
        mains: 1, portee: 'distance', qualite: 'Chaque cible touchée par cette arme subit l\'état traumatisé.',
    },
    orbite_noire: {
        nom: 'Orbite noire', type: 'arme', categorie: 'jet', martial: false, prix: 2250,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 4, type: 'tenebres' },
        mains: 1, portee: 'distance', qualite: 'Vous recevez un bonus de +1 en Défense et en Défense magique.',
        bonus: { defense: 1, defenseMagique: 1 }, // bonus inconditionnel détecté dans le texte
    },
    flechettes_de_l_essaim: {
        nom: 'Fléchettes de l\'essaim', type: 'arme', categorie: 'jet', martial: false, prix: 2300,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 4, type: 'poison' },
        mains: 1, portee: 'distance', qualite: 'Chaque cible touchée par cette arme subit l\'état empoisonné.',
    },
    nekode: {
        nom: 'Nekode', type: 'arme', categorie: 'lutte', martial: false, prix: 250,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 6, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Aucune qualité.',
    },
    poing_d_enfer: {
        nom: 'Poing d\'enfer', type: 'arme', categorie: 'lutte', martial: false, prix: 350,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 6, type: 'tenebres' },
        mains: 1, portee: 'cac', qualite: 'Les attaques effectuées avec cette arme se font contre la Défense magique.',
    },
    poigne_glaciale: {
        nom: 'Poigne glaciale', type: 'arme', categorie: 'lutte', martial: false, prix: 750,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 6, type: 'glace' },
        mains: 1, portee: 'cac', qualite: 'Vous êtes immunisé contre l\'état enragé.',
    },
    patte_d_ours: {
        nom: 'Patte d\'ours', type: 'arme', categorie: 'lutte', martial: true, prix: 850,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 10, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Vous êtes immunisé contre l\'état affaibli.',
    },
    coup_de_poing_motorise: {
        nom: 'Coup-de-poing motorisé', type: 'arme', categorie: 'lutte', martial: false, prix: 950,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 6, type: 'feu' },
        mains: 1, portee: 'cac', qualite: 'Vous bénéficiez d\'une résistance aux dégâts de feu.',
    },
    serre_d_argent: {
        nom: 'Serre d\'argent', type: 'arme', categorie: 'lutte', martial: false, prix: 1100,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 6, type: 'lumiere' },
        mains: 1, portee: 'cac', qualite: 'Vous bénéficiez d\'un bonus de +1 en Défense magique.',
        bonus: { defenseMagique: 1 }, // bonus inconditionnel détecté dans le texte
    },
    vieux_bandages: {
        nom: 'Vieux bandages', type: 'arme', categorie: 'lutte', martial: false, prix: 1250,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 6, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Vous bénéficiez d\'une résistance aux dégâts de ténèbres et de poison.',
    },
    poing_tempete: {
        nom: 'Poing-tempête', type: 'arme', categorie: 'lutte', martial: false, prix: 1300,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 6, type: 'foudre' },
        mains: 1, portee: 'cac', qualite: 'Les attaques effectuées avec cette arme ont la propriété multi (2).',
    },
    pince_de_homard: {
        nom: 'Pince de homard', type: 'arme', categorie: 'lutte', martial: true, prix: 1950,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 10, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état ralenti.',
    },
    gant_assommant: {
        nom: 'Gant assommant', type: 'arme', categorie: 'lutte', martial: true, prix: 2000,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 10, type: 'terre' },
        mains: 1, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état étourdi.',
    },
    griffe_venimeuse: {
        nom: 'Griffe venimeuse', type: 'arme', categorie: 'lutte', martial: false, prix: 2250,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 6, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état empoisonné.',
    },
    main_divine: {
        nom: 'Main divine', type: 'arme', categorie: 'lutte', martial: true, prix: 2550,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 10, type: 'lumiere' },
        mains: 1, portee: 'cac', qualite: 'Les dégâts infligés par cette arme ignorent les immunités.',
    },
    bardiche: {
        nom: 'Bardiche', type: 'arme', categorie: 'lourde', martial: true, prix: 350,
        precision: { attrs: ['pui', 'pui'], bonus: 1 },
        degats: { bonus: 14, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Aucune qualité.',
    },
    maillet_d_artisan: {
        nom: 'Maillet d\'artisan', type: 'arme', categorie: 'lourde', martial: false, prix: 450,
        precision: { attrs: ['int', 'pui'], bonus: 0 },
        degats: { bonus: 6, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Inflige 5 dégâts de plus aux créatures artificielles.',
    },
    beowulf: {
        nom: 'Béowulf +', type: 'arme', categorie: 'lourde', martial: true, prix: 550,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 10, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Inflige 5 dégâts de plus aux monstres.',
    },
    ventre_de_la_bete: {
        nom: 'Ventre de la bête', type: 'arme', categorie: 'lourde', martial: true, prix: 650,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 14, type: 'poison' },
        mains: 2, portee: 'cac', qualite: 'Inflige 5 dégâts de plus aux humanoïdes.',
    },
    hachette_de_forestier: {
        nom: 'Hachette de forestier', type: 'arme', categorie: 'lourde', martial: true, prix: 750,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 14, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Inflige 5 dégâts de plus aux bêtes et aux plantes.',
    },
    marteau_adamantin: {
        nom: 'Marteau adamantin', type: 'arme', categorie: 'lourde', martial: true, prix: 1050,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 14, type: 'lumiere' },
        mains: 2, portee: 'cac', qualite: 'Vous recevez un bonus de +1 en Défense.',
        bonus: { defense: 1 }, // bonus inconditionnel détecté dans le texte
    },
    marteau_a_aura: {
        nom: 'Marteau à aura', type: 'arme', categorie: 'lourde', martial: true, prix: 1350,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 10, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Les attaques effectuées avec cette arme ont la propriété multi (2).',
    },
    masse_de_gravite: {
        nom: 'Masse de gravité', type: 'arme', categorie: 'lourde', martial: true, prix: 1850,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 14, type: 'terre' },
        mains: 2, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état ralenti.',
    },
    mjolnir: {
        nom: 'Mjölnir', type: 'arme', categorie: 'lourde', martial: true, prix: 1850,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 10, type: 'foudre' },
        mains: 1, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état étourdi.',
    },
    aile_de_wyrm: {
        nom: 'Aile de wyrm', type: 'arme', categorie: 'lourde', martial: true, prix: 2050,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 18, type: 'feu' },
        mains: 2, portee: 'cac', qualite: 'Vous êtes immunisé aux dégâts de feu.',
    },
    ame_du_pillage: {
        nom: 'Âme du pillage', type: 'arme', categorie: 'lourde', martial: true, prix: 2550,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 18, type: 'tenebres' },
        mains: 2, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état enragé.',
    },
    kolosse_d_hiver: {
        nom: 'Kolosse d\'hiver', type: 'arme', categorie: 'lourde', martial: true, prix: 2550,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 18, type: 'glace' },
        mains: 2, portee: 'cac', qualite: 'Vous recevez un bonus de +1 en Défense et en Défense magique.',
        bonus: { defense: 1, defenseMagique: 1 }, // bonus inconditionnel détecté dans le texte
    },
    zweihander: {
        nom: 'Zweihänder', type: 'arme', categorie: 'epee', martial: true, prix: 400,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 14, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Aucune qualité.',
    },
    averse_d_acier: {
        nom: 'Averse d\'acier', type: 'arme', categorie: 'epee', martial: true, prix: 450,
        precision: { attrs: ['dex', 'dex'], bonus: 1 },
        degats: { bonus: 10, type: 'glace' },
        mains: 2, portee: 'cac', qualite: 'Les attaques effectuées avec cette arme se font contre la Défense magique.',
    },
    flamberge: {
        nom: 'Flamberge', type: 'arme', categorie: 'epee', martial: true, prix: 500,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 10, type: 'feu' },
        mains: 1, portee: 'cac', qualite: 'Aucune qualité.',
    },
    elegante: {
        nom: 'Élégante', type: 'arme', categorie: 'epee', martial: true, prix: 700,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 6, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Vous êtes immunisé contre l\'état enragé.',
    },
    joyeuse: {
        nom: 'Joyeuse', type: 'arme', categorie: 'epee', martial: true, prix: 900,
        precision: { attrs: ['pui', 'vol'], bonus: 1 },
        degats: { bonus: 10, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Vous êtes immunisé contre l\'état traumatisé.',
    },
    epee_pistolet: {
        nom: 'Épée-pistolet', type: 'arme', categorie: 'epee', martial: true, prix: 1000,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 10, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Cette arme peut prendre des créatures volantes pour cible.',
    },
    lame_de_mort: {
        nom: 'Lame de mort', type: 'arme', categorie: 'epee', martial: true, prix: 1000,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 6, type: 'tenebres' },
        mains: 1, portee: 'cac', qualite: 'Inflige 5 dégâts de plus si vous êtes en Crise.',
    },
    main_gauche: {
        nom: 'Main gauche', type: 'arme', categorie: 'epee', martial: true, prix: 1000,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 6, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Vous recevez un bonus de +1 en Défense.',
        bonus: { defense: 1 }, // bonus inconditionnel détecté dans le texte
    },
    le_rikizo: {
        nom: 'Le Rikizo', type: 'arme', categorie: 'epee', martial: true, prix: 1200,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 10, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Inflige 2 dégâts de plus pour chaque classe que vous avez maîtrisée.',
    },
    carnivore: {
        nom: 'Carnivore', type: 'arme', categorie: 'epee', martial: true, prix: 1300,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 10, type: 'poison' },
        mains: 1, portee: 'cac', qualite: 'Inflige 5 dégâts de plus aux cibles affaiblies.',
    },
    kusanagi: {
        nom: 'Kusanagi', type: 'arme', categorie: 'epee', martial: true, prix: 1500,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 14, type: 'air' },
        mains: 2, portee: 'cac', qualite: 'Les attaques effectuées avec cette arme ont la propriété multi (2).',
    },
    excalibur: {
        nom: 'Excalibur', type: 'arme', categorie: 'epee', martial: true, prix: 2300,
        precision: { attrs: ['pui', 'vol'], bonus: 1 },
        degats: { bonus: 10, type: 'lumiere' },
        mains: 2, portee: 'cac', qualite: 'Vous êtes immunisé contre tous les états.',
    },
    latrodectus: {
        nom: 'Latrodectus', type: 'arme', categorie: 'dague', martial: false, prix: 250,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 4, type: 'poison' },
        mains: 1, portee: 'cac', qualite: 'Aucune qualité.',
    },
    couteau_en_cur: {
        nom: 'Couteau en cœur', type: 'arme', categorie: 'dague', martial: false, prix: 550,
        precision: { attrs: ['dex', 'vol'], bonus: 0 },
        degats: { bonus: 4, type: 'lumiere' },
        mains: 1, portee: 'cac', qualite: 'Inflige 5 dégâts de plus aux démons.',
    },
    tranche_atomes: {
        nom: 'Tranche-atomes', type: 'arme', categorie: 'dague', martial: false, prix: 600,
        precision: { attrs: ['dex', 'dex'], bonus: 1 },
        degats: { bonus: 4, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Les dégâts infligés par cette arme ignorent les résistances.',
    },
    tranchant_silencieux: {
        nom: 'Tranchant silencieux', type: 'arme', categorie: 'dague', martial: false, prix: 700,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 4, type: 'air' },
        mains: 1, portee: 'cac', qualite: 'Vous êtes immunisé contre l\'état ralenti.',
    },
    tranchesort: {
        nom: 'Tranchesort', type: 'arme', categorie: 'dague', martial: false, prix: 850,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 4, type: 'tenebres' },
        mains: 1, portee: 'cac', qualite: 'Quand vous touchez une créature avec cette arme, si l\'attaque visait une seule cible, vous pouvez choisir un seul sort qui dure une scène et qui affecte la cible: son effet cesse.',
    },
    lame_de_l_assassin: {
        nom: 'Lame de l\'assassin', type: 'arme', categorie: 'dague', martial: false, prix: 1000,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 4, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Inflige 5 dégâts de plus aux cibles en Crise.',
    },
    hachoir_de_gourmet: {
        nom: 'Hachoir de gourmet', type: 'arme', categorie: 'dague', martial: false, prix: 1350,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Quand vous touchez une ou plusieurs créatures avec cette arme, vous pouvez récupérer 5 Points de Vie.',
    },
    couteau_barbele: {
        nom: 'Couteau barbelé', type: 'arme', categorie: 'dague', martial: false, prix: 1650,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 4, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état traumatisé.',
    },
    doigt_glace: {
        nom: 'Doigt glacé', type: 'arme', categorie: 'dague', martial: false, prix: 1950,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 8, type: 'glace' },
        mains: 1, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état affaibli.',
    },
    frelon: {
        nom: 'Frelon', type: 'arme', categorie: 'dague', martial: false, prix: 2200,
        precision: { attrs: ['dex', 'dex'], bonus: 1 },
        degats: { bonus: 4, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Les attaques effectuées avec cette arme ont la propriété multi (3).',
    },
    clou_frenetique: {
        nom: 'Clou frénétique', type: 'arme', categorie: 'dague', martial: false, prix: 2450,
        precision: { attrs: ['int', 'int'], bonus: 1 },
        degats: { bonus: 8, type: 'feu' },
        mains: 1, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état enragé.',
    },
    langue_de_dragon: {
        nom: 'Langue de dragon', type: 'arme', categorie: 'lance', martial: true, prix: 500,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 12, type: 'feu' },
        mains: 2, portee: 'cac', qualite: 'Les attaques effectuées avec cette arme se font contre la Défense magique.',
    },
    rossinante: {
        nom: 'Rossinante', type: 'arme', categorie: 'lance', martial: true, prix: 500,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'cac', qualite: 'Vous infligez 1 dégât supplémentaire par état qui vous affecte.',
    },
    lance_ophidienne: {
        nom: 'Lance ophidienne', type: 'arme', categorie: 'lance', martial: true, prix: 800,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 16, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Les dégâts infligés par cette arme ignorent les résistances.',
    },
    hallebarde: {
        nom: 'Hallebarde', type: 'arme', categorie: 'lance', martial: true, prix: 1000,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 12, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Vous recevez un bonus de +1 en Défense.',
        bonus: { defense: 1 }, // bonus inconditionnel détecté dans le texte
    },
    corne_de_narval: {
        nom: 'Corne de narval', type: 'arme', categorie: 'lance', martial: true, prix: 1200,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 12, type: 'glace' },
        mains: 1, portee: 'cac', qualite: 'Vous êtes résistant aux dégâts de glace.',
    },
    fauchard_du_brave: {
        nom: 'Fauchard du brave', type: 'arme', categorie: 'lance', martial: true, prix: 1300,
        precision: { attrs: ['pui', 'vol'], bonus: 0 },
        degats: { bonus: 12, type: 'terre' },
        mains: 2, portee: 'cac', qualite: 'Tant que vous avez au moins trois liens de loyauté ou d\'affection, vous recevez un bonus de +1 en Défense et en Défense magique.',
        // ⚠️ Bonus défensif CONDITIONNEL dans `qualite` — volontairement PAS mécanisé.
    },
    morrigan: {
        nom: 'Morrigan', type: 'arme', categorie: 'lance', martial: true, prix: 1400,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 12, type: 'tenebres' },
        mains: 2, portee: 'cac', qualite: 'Quand vous touchez une ou plusieurs créatures avec cette arme, vous pouvez récupérer 10 Points de Magie.',
    },
    gae_bolga: {
        nom: 'Gae Bolga', type: 'arme', categorie: 'lance', martial: true, prix: 1800,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 12, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Si vous obtenez une réussite critique... infliger 10 dégâts de plus.',
    },
    longinus: {
        nom: 'Longinus', type: 'arme', categorie: 'lance', martial: true, prix: 2000,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 16, type: 'physique' },
        mains: 2, portee: 'cac', qualite: 'Chaque cible touchée par cette arme subit l\'état affaibli.',
    },
    rateau_a_neuf_griffes: {
        nom: 'Râteau à neuf griffes', type: 'arme', categorie: 'lance', martial: true, prix: 2500,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 16, type: 'poison' },
        mains: 2, portee: 'cac', qualite: 'Vous absorbez les dégâts de poison.',
    },
    gungnir: {
        nom: 'Gungnir', type: 'arme', categorie: 'lance', martial: true, prix: 3000,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 16, type: 'lumiere' },
        mains: 2, portee: 'cac', qualite: 'Vous êtes immunisé aux dégâts de feu et de glace.',
    },
    veste_gluante: {
        nom: 'Veste gluante', type: 'armure', martial: false, prix: 600,
        defense: { mod: 1 }, defenseMagique: { mod: 1 }, initiative: -1,
        qualite: 'Vous êtes immunisé contre l\'état empoisonné.',
    },
    tenue_de_renard: {
        nom: 'Tenue de renard', type: 'armure', martial: false, prix: 650,
        defense: { mod: 1 }, defenseMagique: { mod: 1 }, initiative: -1,
        qualite: 'Vous êtes immunisé contre l\'état ralenti.',
    },
    tunique_d_ombre: {
        nom: 'Tunique d\'ombre', type: 'armure', martial: false, prix: 650,
        defense: { mod: 1 }, defenseMagique: { mod: 1 }, initiative: 4,
        qualite: 'Vous bénéficiez d\'un bonus de +4 au modificateur d\'initiative (déjà inclus).',
    },
    manteau_de_desperado: {
        nom: 'Manteau de desperado', type: 'armure', martial: false, prix: 750,
        defense: { mod: 1 }, defenseMagique: { mod: 1 }, initiative: -1,
        qualite: 'Quand vous utilisez la compétence Tir de barrage, son coût en PM est réduit de moitié.',
    },
    uniforme_de_bonne: {
        nom: 'Uniforme de bonne', type: 'armure', martial: false, prix: 800,
        defense: { mod: 1 }, defenseMagique: { mod: 2 }, initiative: -2,
        qualite: 'Quand une potion ou une magisphère créée avec vos Points d\'Inventaire restaure des Points de Magie, elle en restaure 5 de plus.',
    },
    uniforme_de_majordome: {
        nom: 'Uniforme de majordome', type: 'armure', martial: false, prix: 800,
        defense: { mod: 1 }, defenseMagique: { mod: 2 }, initiative: -2,
        qualite: 'Quand une potion ou une magisphère créée avec vos Points d\'Inventaire restaure des Points de Vie, elle en restaure 5 de plus.',
    },
    ailes_de_valkyrie: {
        nom: 'Ailes de Valkyrie', type: 'armure', martial: true, prix: 900,
        defense: { fixe: 11 }, defenseMagique: { mod: 1 }, initiative: -3,
        qualite: 'Quand vous lancez le sort Frappe volante, son coût est réduit de moitié.',
    },
    plates_de_cristal: {
        nom: 'Plates de cristal', type: 'armure', martial: true, prix: 900,
        defense: { fixe: 11 }, defenseMagique: { mod: 0 }, initiative: -3,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de ténèbres.',
    },
    veste_de_bandit: {
        nom: 'Veste de bandit', type: 'armure', martial: false, prix: 900,
        defense: { mod: 1 }, defenseMagique: { mod: 1 }, initiative: -1,
        qualite: 'Vous recevez un bonus de +1 aux tests de précision effectués avec des dagues.',
    },
    armure_de_heros: {
        nom: 'Armure de héros', type: 'armure', martial: true, prix: 1000,
        defense: { fixe: 12 }, defenseMagique: { mod: 0 }, initiative: -4,
        qualite: 'Les réussites critiques obtenues aux tests de précision et de magie ne génèrent pas d\'aubaines.',
    },
    ceinture_noire: {
        nom: 'Ceinture noire', type: 'armure', martial: false, prix: 1000,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vos attaques effectuées avec des armes de lutte infligent 5 dégâts supplémentaires.',
    },
    robe_de_meditation: {
        nom: 'Robe de méditation', type: 'armure', martial: false, prix: 1000,
        defense: { mod: 1 }, defenseMagique: { mod: 2 }, initiative: -2,
        qualite: 'Quand vous récupérez des Points de Magie, vous en récupérez 5 de plus.',
    },
    robe_d_archimage: {
        nom: 'Robe d\'archimage', type: 'armure', martial: false, prix: 1200,
        defense: { mod: 1 }, defenseMagique: { mod: 2 }, initiative: -2,
        qualite: 'Vous recevez un bonus de +1 aux tests de magie.',
    },
    combinaison_d_automate: {
        nom: 'Combinaison d\'automate', type: 'armure', martial: true, prix: 1250,
        defense: { fixe: 11 }, defenseMagique: { mod: 1 }, initiative: -3,
        qualite: 'Vous êtes immunisé aux dégâts de terre et de poison, mais vulnérables aux dégâts de foudre.',
    },
    torse_adamantin: {
        nom: 'Torse adamantin', type: 'armure', martial: true, prix: 1300,
        defense: { fixe: 12 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts physiques.',
    },
    yoroi_ardent: {
        nom: 'Yoroi ardent', type: 'armure', martial: true, prix: 1300,
        defense: { fixe: 12 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous recevez un bonus de +1 aux tests de précision.',
    },
    sourire_demoniaque: {
        nom: 'Sourire démoniaque', type: 'armure', martial: true, prix: 1500,
        defense: { fixe: 12 }, defenseMagique: { mod: 0 }, initiative: -4,
        qualite: 'Après qu\'une créature vous a touché avec une attaque de corps à corps, vous lui infligez 5 dégâts de feu.',
    },
    bioplates: {
        nom: 'Bioplates', type: 'armure', martial: true, prix: 1700,
        defense: { fixe: 11 }, defenseMagique: { mod: 0 }, initiative: -3,
        qualite: 'Vous êtes immunisé aux dégâts de poison.',
    },
    tunique_blanche: {
        nom: 'Tunique blanche', type: 'armure', martial: false, prix: 1700,
        defense: { mod: 1 }, defenseMagique: { mod: 2 }, initiative: -2,
        qualite: 'Les sorts que vous lancez et dont les effets restaurent des Points de Vie en restaurent 5 de plus.',
    },
    gilet_de_grand_mere: {
        nom: 'Gilet de grand-mère', type: 'armure', martial: false, prix: 2000,
        defense: { mod: 0 }, defenseMagique: { mod: 2 }, initiative: -1,
        qualite: 'Tant que vous êtes équipé de cette armure, faites comme si votre dé de Volonté était supérieur d\'un cran.',
    },
    tunique_noire: {
        nom: 'Tunique noire', type: 'armure', martial: false, prix: 2200,
        defense: { mod: 1 }, defenseMagique: { mod: 2 }, initiative: -2,
        qualite: 'Les sorts que vous lancez infligent 5 dégâts de plus.',
    },
    tunique_rouge: {
        nom: 'Tunique rouge', type: 'armure', martial: false, prix: 2500,
        defense: { mod: 0 }, defenseMagique: { mod: 2 }, initiative: -1,
        qualite: 'Faites comme si vous étiez équipé d\'une arme arcanique lorsque vous utilisez des compétences qui en nécessitent une.',
    },
    egide_fulgur: {
        nom: 'Égide, Fulgur', type: 'bouclier', martial: false, prix: 800,
        defense: { mod: 2 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de foudre.',
    },
    egide_gelum: {
        nom: 'Égide, Gelum', type: 'bouclier', martial: false, prix: 800,
        defense: { mod: 2 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de glace.',
    },
    egide_gorgonis: {
        nom: 'Égide, Gorgonis', type: 'bouclier', martial: false, prix: 800,
        defense: { mod: 2 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de poison.',
    },
    egide_ignis: {
        nom: 'Égide, Ignis', type: 'bouclier', martial: false, prix: 800,
        defense: { mod: 2 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de feu.',
    },
    egide_lux: {
        nom: 'Égide, Lux', type: 'bouclier', martial: false, prix: 800,
        defense: { mod: 2 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de lumière.',
    },
    egide_terra: {
        nom: 'Égide, Terra', type: 'bouclier', martial: false, prix: 800,
        defense: { mod: 2 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de terre.',
    },
    egide_umbra: {
        nom: 'Égide, Umbra', type: 'bouclier', martial: false, prix: 800,
        defense: { mod: 2 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de ténèbres.',
    },
    egide_ventus: {
        nom: 'Égide, Ventus', type: 'bouclier', martial: false, prix: 800,
        defense: { mod: 2 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts d\'air.',
    },
    bouclier_demon: {
        nom: 'Bouclier-démon', type: 'bouclier', martial: true, prix: 950,
        defense: { mod: 2 }, defenseMagique: { mod: 2 }, initiative: 0,
        qualite: 'Après qu\'une créature vous a infligé des dégâts, si vous êtes en Crise, vous pouvez lui infliger l\'état traumatisé.',
    },
    bouclier_du_printemps: {
        nom: 'Bouclier du printemps', type: 'bouclier', martial: true, prix: 1150,
        defense: { mod: 2 }, defenseMagique: { mod: 2 }, initiative: 0,
        qualite: 'Chaque fois que vous récupérez des Points de Vie, vous en récupérez 5 de plus.',
    },
    bouclier_seraphique: {
        nom: 'Bouclier séraphique', type: 'bouclier', martial: true, prix: 2050,
        defense: { mod: 2 }, defenseMagique: { mod: 2 }, initiative: 0,
        qualite: 'Tant que vous êtes en Crise, vous êtes immunisé contre tous les états.',
    },
    pavois_adamantin: {
        nom: 'Pavois adamantin', type: 'bouclier', martial: true, prix: 2500,
        defense: { mod: 3 }, defenseMagique: { mod: 3 }, initiative: 0,
        qualite: 'Vous recevez un bonus de +1 en Défense et en Défense magique.',
    },
    ceinture_d_explorateur: {
        nom: 'Ceinture d\'explorateur', type: 'accessoire', martial: false, prix: 500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 4,
        qualite: 'Vous recevez un bonus de +4 à votre modificateur d\'initiative.',
    },
    gants_douillets: {
        nom: 'Gants douillets', type: 'accessoire', martial: false, prix: 500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous êtes immunisé contre l\'état traumatisé.',
    },
    gants_elegants: {
        nom: 'Gants élégants', type: 'accessoire', martial: false, prix: 500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous êtes immunisé contre l\'état étourdi.',
    },
    gants_grossiers: {
        nom: 'Gants grossiers', type: 'accessoire', martial: false, prix: 500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous êtes immunisé contre l\'état affaibli.',
    },
    gants_de_soie: {
        nom: 'Gants de soie', type: 'accessoire', martial: false, prix: 500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous êtes immunisé contre l\'état ralenti.',
    },
    bottes_de_bleusaille: {
        nom: 'Bottes de bleusaille', type: 'accessoire', martial: false, prix: 600,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Quand vous obtenez un échec critique, si vous avez moins de 10 XP, vous pouvez gagner 1 XP.',
    },
    masque_han_nya: {
        nom: 'Masque han\'nya', type: 'accessoire', martial: false, prix: 700,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Tous les dégâts que vous infligez aux créatures traumatisées ignorent les résistances.',
    },
    pendentif_d_ambre: {
        nom: 'Pendentif d\'ambre', type: 'accessoire', martial: false, prix: 700,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de terre.',
    },
    pendentif_d_amethyste: {
        nom: 'Pendentif d\'améthyste', type: 'accessoire', martial: false, prix: 700,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de ténèbres.',
    },
    pendentif_d_emeraude: {
        nom: 'Pendentif d\'émeraude', type: 'accessoire', martial: false, prix: 700,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de poison.',
    },
    pendentif_d_opale: {
        nom: 'Pendentif d\'opale', type: 'accessoire', martial: false, prix: 700,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts d\'air.',
    },
    pendentif_de_diamant: {
        nom: 'Pendentif de diamant', type: 'accessoire', martial: false, prix: 700,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de lumière.',
    },
    pendentif_de_rubis: {
        nom: 'Pendentif de rubis', type: 'accessoire', martial: false, prix: 700,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de feu.',
    },
    pendentif_de_saphir: {
        nom: 'Pendentif de saphir', type: 'accessoire', martial: false, prix: 700,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de glace.',
    },
    pendentif_de_topaze: {
        nom: 'Pendentif de topaze', type: 'accessoire', martial: false, prix: 700,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous bénéficiez d\'une résistance aux dégâts de foudre.',
    },
    anneau_de_sorcellerie: {
        nom: 'Anneau de sorcellerie', type: 'accessoire', martial: false, prix: 800,
        defense: { mod: 0 }, defenseMagique: { mod: 1 }, initiative: 0,
        qualite: 'Vous recevez un bonus de +1 en Défense magique.',
    },
    bottes_du_vagabond: {
        nom: 'Bottes du vagabond', type: 'accessoire', martial: false, prix: 900,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Quand votre groupe fait une découverte en voyageant, vous pouvez immédiatement gagner 1 Point Fabula.',
    },
    casque_a_crete: {
        nom: 'Casque à crête', type: 'accessoire', martial: false, prix: 1000,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous recevez un bonus de +1 aux tests de précision.',
    },
    chapeau_pointu_jaune: {
        nom: 'Chapeau pointu jaune', type: 'accessoire', martial: false, prix: 1000,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous recevez un bonus de +1 aux tests de magie.',
    },
    gants_cramoisis: {
        nom: 'Gants cramoisis', type: 'accessoire', martial: false, prix: 1000,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Quand vous effectuez une attaque dotée de la propriété multi, vous recevez un bonus de +2 à vos tests de précision.',
    },
    anneau_de_l_eleve: {
        nom: 'Anneau de l\'élève', type: 'accessoire', martial: false, prix: 1500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Tant que vous avez au moins deux liens d\'admiration, vous recevez un bonus de +1 en Défense et en Défense magique.',
    },
    anneau_des_contes: {
        nom: 'Anneau des contes', type: 'accessoire', martial: false, prix: 1500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Quand vous obtenez une réussite critique, vous pouvez utiliser l\'aubaine pour obtenir 1 Point Fabula.',
    },
    anneau_du_hibou: {
        nom: 'Anneau du hibou', type: 'accessoire', martial: false, prix: 1500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous recevez un bonus de +2 aux tests opposés basés sur l\'Intuition.',
    },
    anneau_du_lion: {
        nom: 'Anneau du lion', type: 'accessoire', martial: false, prix: 1500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous recevez un bonus de +2 aux tests opposés basés sur la Volonté.',
    },
    anneau_des_oignons: {
        nom: 'Anneau des oignons', type: 'accessoire', martial: false, prix: 2000,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Tant que vous êtes équipé de cet accessoire, votre maximum de PV et de PM augmentent chacun de 2 pour chacune de vos classes.',
    },
    gant_en_peau_de_multigroa: {
        nom: 'Gant en peau de multigroa', type: 'accessoire', martial: false, prix: 2000,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous êtes immunisé contre tous les effets d\'état.',
    },
    anneau_de_givre: {
        nom: 'Anneau de givre', type: 'accessoire', martial: false, prix: 2500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous absorbez les dégâts de glace mais vous êtes vulnérable aux dégâts de feu.',
    },
    anneau_de_magma: {
        nom: 'Anneau de magma', type: 'accessoire', martial: false, prix: 2500,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Vous absorbez les dégâts de feu mais vous êtes vulnérable aux dégâts de glace.',
    },
    anneau_de_l_uf: {
        nom: 'Anneau de l\'œuf', type: 'accessoire', martial: false, prix: 3000,
        defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
        qualite: 'Quand vous tombez à 0 Point de Vie, vous pouvez choisir de résister pour conserver 1 Point de Vie. L\'anneau se brise.',
    },
};

export const RARE_CATALOG_ORDER = Object.keys(EQUIPMENT_RARE_CATALOG);

/**
 * Convertit une entrée du catalogue RARE en item détaché.
 * @param {string} key - clé du catalogue (ex: 'excalibur')
 * @returns {object|null}
 */
export function rareCatalogToItem(key) {
    return buildCatalogEntry(EQUIPMENT_RARE_CATALOG[key], key);
}
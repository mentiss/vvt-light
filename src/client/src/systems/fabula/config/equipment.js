// src/client/src/systems/fabula/config/equipment.js
// ─────────────────────────────────────────────────────────────────────────────
// Catalogue statique d'équipement — table des équipements de base de la spec
// (section Étape 5 / 8. Système d'Équipement). Même philosophie que classes.js
// et spells.js : donnée pure, zéro logique React.
//
// Modèle "préremplissage" : choisir une entrée du catalogue crée un item
// character_equipment détaché (via catalogToItem), qui reste ensuite librement
// éditable. equipment_key ne sert qu'à la traçabilité.
//
// Décisions de transcription :
//   • "Aucune armure" (ligne de la table) est EXCLUE : c'est l'absence d'item,
//     déjà le comportement par défaut de computeDerivedStats (DEF = dé DEX).
//   • Prix "-" de la table → 0 (Main nue, armes improvisées).
//   • Armures lourdes : la valeur fixe de la colonne Défense va dans defFixe,
//     "Taille de dé DEX +N" va dans defense.mod (N).
//   • Accessoires : catégorie prévue (type 'accessoire' supporté partout),
//     liste vide en attendant le catalogue étendu du MJ.
// ─────────────────────────────────────────────────────────────────────────────

// ── Énumérations partagées (catalogue + saisie libre enrichie) ───────────────

export const ATTR_LABELS = { dex: 'DEX', int: 'INT', pui: 'PUI', vol: 'VOL' };

export const CATEGORIES_ARMES = [
    { key: 'arc',        label: 'Arc' },
    { key: 'arcanique',  label: 'Arcanique' },
    { key: 'arme_a_feu', label: 'Arme à feu' },
    { key: 'articulee',  label: 'Articulée' },
    { key: 'dague',      label: 'Dague' },
    { key: 'epee',       label: 'Épée' },
    { key: 'jet',        label: 'Jet' },
    { key: 'lance',      label: 'Lance' },
    { key: 'lourde',     label: 'Lourde' },
    { key: 'lutte',      label: 'Lutte' },
];

export const TYPES_DEGATS = [
    { key: 'physique', label: 'Physique' },
    { key: 'feu',      label: 'Feu' },
    { key: 'glace',    label: 'Glace' },
    { key: 'foudre',   label: 'Foudre' },
    { key: 'air',      label: 'Air' },
    { key: 'terre',    label: 'Terre' },
    { key: 'lumiere',  label: 'Lumière' },
    { key: 'tenebres', label: 'Ténèbres' },
    { key: 'poison',   label: 'Poison' },
];

// ── Catalogue ─────────────────────────────────────────────────────────────────
// Armes    : precision {attrs: [a1, a2], bonus}, degats {bonus, type}, mains, portee
// Armures  : defense {mod} OU {fixe}, defenseMagique {mod}, initiative
// Boucliers: defense {mod}, defenseMagique {mod}, initiative

export const EQUIPMENT_CATALOG = {

    // ── Armes ────────────────────────────────────────────────────────────────

    arbalete: {
        nom: 'Arbalète', type: 'arme', categorie: 'arc', martial: false, prix: 150,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 2, portee: 'distance', qualite: '',
    },
    arc_court: {
        nom: 'Arc court', type: 'arme', categorie: 'arc', martial: false, prix: 200,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 2, portee: 'distance', qualite: '',
    },
    baton: {
        nom: 'Bâton', type: 'arme', categorie: 'arcanique', martial: false, prix: 100,
        precision: { attrs: ['vol', 'vol'], bonus: 0 },
        degats: { bonus: 6, type: 'physique' },
        mains: 2, portee: 'cac', qualite: '',
    },
    grimoire: {
        nom: 'Grimoire', type: 'arme', categorie: 'arcanique', martial: false, prix: 100,
        precision: { attrs: ['int', 'int'], bonus: 0 },
        degats: { bonus: 6, type: 'physique' },
        mains: 2, portee: 'cac', qualite: '',
    },
    pistolet: {
        nom: 'Pistolet', type: 'arme', categorie: 'arme_a_feu', martial: true, prix: 250,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'distance', qualite: '',
    },
    chaine_fouet: {
        nom: 'Chaîne-fouet', type: 'arme', categorie: 'articulee', martial: false, prix: 150,
        precision: { attrs: ['dex', 'dex'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 2, portee: 'cac', qualite: '',
    },
    dague_acier: {
        nom: 'Dague en acier', type: 'arme', categorie: 'dague', martial: false, prix: 150,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 4, type: 'physique' },
        mains: 1, portee: 'cac', qualite: '',
    },
    arme_improvisee_cac: {
        nom: 'Arme improvisée (corps à corps)', type: 'arme', categorie: 'lutte', martial: false, prix: 0,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 2, type: 'physique' },
        mains: 1, portee: 'cac', qualite: "Se brise après l'attaque",
    },
    coup_de_poing_fer: {
        nom: 'Coup-de-poing en fer', type: 'arme', categorie: 'lutte', martial: false, prix: 150,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 6, type: 'physique' },
        mains: 1, portee: 'cac', qualite: '',
    },
    main_nue: {
        nom: 'Main nue', type: 'arme', categorie: 'lutte', martial: false, prix: 0,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 0, type: 'physique' },
        mains: 1, portee: 'cac',
        qualite: 'Automatiquement équipée à chaque emplacement de main',
    },
    epee_deux_mains: {
        nom: 'Épée à deux mains', type: 'arme', categorie: 'epee', martial: true, prix: 200,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 10, type: 'physique' },
        mains: 2, portee: 'cac', qualite: '',
    },
    epee_bronze: {
        nom: 'Épée de bronze', type: 'arme', categorie: 'epee', martial: true, prix: 200,
        precision: { attrs: ['dex', 'pui'], bonus: 1 },
        degats: { bonus: 6, type: 'physique' },
        mains: 1, portee: 'cac', qualite: '',
    },
    katana: {
        nom: 'Katana', type: 'arme', categorie: 'epee', martial: true, prix: 200,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 10, type: 'physique' },
        mains: 2, portee: 'cac', qualite: '',
    },
    rapiere: {
        nom: 'Rapière', type: 'arme', categorie: 'epee', martial: true, prix: 200,
        precision: { attrs: ['dex', 'int'], bonus: 1 },
        degats: { bonus: 6, type: 'physique' },
        mains: 1, portee: 'cac', qualite: '',
    },
    arme_improvisee_distance: {
        nom: 'Arme improvisée (distance)', type: 'arme', categorie: 'jet', martial: false, prix: 0,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 2, type: 'physique' },
        mains: 1, portee: 'distance', qualite: "Se brise après l'attaque",
    },
    shuriken: {
        // ⚠️ Transcrit fidèlement à la table de la spec : portée "Corps à corps".
        // Anomalie probable (catégorie Jet + règles officielles = Distance) —
        // signalée au MJ, à corriger ici si la spec évolue.
        nom: 'Shuriken', type: 'arme', categorie: 'jet', martial: false, prix: 150,
        precision: { attrs: ['dex', 'int'], bonus: 0 },
        degats: { bonus: 4, type: 'physique' },
        mains: 1, portee: 'cac', qualite: '',
    },
    lance_legere: {
        nom: 'Lance légère', type: 'arme', categorie: 'lance', martial: true, prix: 200,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 8, type: 'physique' },
        mains: 1, portee: 'cac', qualite: '',
    },
    lance_lourde: {
        nom: 'Lance lourde', type: 'arme', categorie: 'lance', martial: true, prix: 200,
        precision: { attrs: ['dex', 'pui'], bonus: 0 },
        degats: { bonus: 12, type: 'physique' },
        mains: 2, portee: 'cac', qualite: '',
    },
    hache_guerre: {
        nom: 'Hache de guerre', type: 'arme', categorie: 'lourde', martial: true, prix: 250,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 14, type: 'physique' },
        mains: 2, portee: 'cac', qualite: '',
    },
    hache_large: {
        nom: 'Hache large', type: 'arme', categorie: 'lourde', martial: true, prix: 250,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 10, type: 'physique' },
        mains: 1, portee: 'cac', qualite: '',
    },
    marteau_fer: {
        nom: 'Marteau de fer', type: 'arme', categorie: 'lourde', martial: false, prix: 200,
        precision: { attrs: ['pui', 'pui'], bonus: 0 },
        degats: { bonus: 6, type: 'physique' },
        mains: 1, portee: 'cac', qualite: '',
    },

    // ── Armures ──────────────────────────────────────────────────────────────
    // Base implicite : DEF = taille de dé DEX, DEF.M = taille de dé INT.
    // defense.mod / defenseMagique.mod = bonus additifs sur ces bases.
    // defense.fixe = armures lourdes (remplace la base DEF, ignore le dé DEX).

    chemise_soie: {
        nom: 'Chemise en soie', type: 'armure', martial: false, prix: 100,
        defense: { mod: 0 }, defenseMagique: { mod: 2 }, initiative: -1, qualite: '',
    },
    tenue_voyage: {
        nom: 'Tenue de voyage', type: 'armure', martial: false, prix: 100,
        defense: { mod: 1 }, defenseMagique: { mod: 1 }, initiative: -1, qualite: '',
    },
    tunique_combat: {
        nom: 'Tunique de combat', type: 'armure', martial: false, prix: 150,
        defense: { mod: 1 }, defenseMagique: { mod: 1 }, initiative: 0, qualite: '',
    },
    robe_sage: {
        nom: 'Robe de sage', type: 'armure', martial: false, prix: 200,
        defense: { mod: 1 }, defenseMagique: { mod: 2 }, initiative: -2, qualite: '',
    },
    brigandine: {
        nom: 'Brigandine', type: 'armure', martial: true, prix: 150,
        defense: { fixe: 10 }, defenseMagique: { mod: 0 }, initiative: -2, qualite: '',
    },
    plates_bronze: {
        nom: 'Plates de bronze', type: 'armure', martial: true, prix: 200,
        defense: { fixe: 11 }, defenseMagique: { mod: 0 }, initiative: -3, qualite: '',
    },
    plates_runiques: {
        nom: 'Plates runiques', type: 'armure', martial: true, prix: 250,
        defense: { fixe: 11 }, defenseMagique: { mod: 1 }, initiative: -3, qualite: '',
    },
    plates_acier: {
        nom: "Plates d'acier", type: 'armure', martial: true, prix: 300,
        defense: { fixe: 12 }, defenseMagique: { mod: 0 }, initiative: -4, qualite: '',
    },

    // ── Boucliers ────────────────────────────────────────────────────────────

    bouclier_bronze: {
        nom: 'Bouclier de bronze', type: 'bouclier', martial: false, prix: 100,
        defense: { mod: 2 }, defenseMagique: { mod: 0 }, initiative: 0, qualite: '',
    },
    bouclier_runique: {
        nom: 'Bouclier runique', type: 'bouclier', martial: true, prix: 150,
        defense: { mod: 2 }, defenseMagique: { mod: 2 }, initiative: 0, qualite: '',
    },

    // ── Accessoires ──────────────────────────────────────────────────────────
    // Aucun dans la table de base (fidèle au jeu : objets rares). La catégorie
    // est pleinement supportée — entrées à ajouter ici dès que le MJ fournit
    // son catalogue étendu :
    //   exemple: {
    //       nom: 'Amulette de …', type: 'accessoire', martial: false, prix: 0,
    //       defense: { mod: 0 }, defenseMagique: { mod: 0 }, initiative: 0,
    //       qualite: "Description de l'effet passif",
    //   },
};

// Ordre d'affichage dans la modale catalogue (armes par catégorie, puis
// armures des plus légères aux plus lourdes, puis boucliers).
export const CATALOG_ORDER = Object.keys(EQUIPMENT_CATALOG);

/**
 * Convertit une entrée de catalogue (forme EQUIPMENT_CATALOG/EQUIPMENT_RARE_CATALOG)
 * en item character_equipment détaché (forme plate attendue par la fiche / le
 * wizard / le CharacterController). L'item est ajouté NON équipé
 * (emplacementEquipe: null → sac à dos). Partagé par equipment.js (catalogue de
 * base) et equipmentRare.js (objets rares) — même schéma d'entrée pour les deux.
 *
 * @param {object} def - définition du catalogue (ex: EQUIPMENT_CATALOG['dague_acier'])
 * @param {string} key - clé source, reportée dans equipmentKey (traçabilité)
 * @returns {object|null}
 */
export function buildCatalogEntry(def, key) {
    if (!def) return null;

    const isWeapon = def.type === 'arme';
    return {
        typeEmplacement:   def.type,
        equipmentKey:      key,
        nomLibre:          def.nom,
        notesLibres:       '',
        prix:              def.prix ?? 0,

        categorie:         isWeapon ? (def.categorie ?? null) : null,
        estMartial:        !!def.martial,
        qualite:           def.qualite ?? '',

        precisionAttr1:    isWeapon ? def.precision.attrs[0] : null,
        precisionAttr2:    isWeapon ? def.precision.attrs[1] : null,
        precisionBonus:    isWeapon ? (def.precision.bonus ?? 0) : 0,
        degatsBonus:       isWeapon ? (def.degats.bonus ?? 0) : 0,
        degatsType:        isWeapon ? (def.degats.type ?? 'physique') : 'physique',
        mains:             isWeapon ? (def.mains ?? 1) : 1,
        portee:            isWeapon ? (def.portee ?? 'cac') : 'cac',

        // Les armes portent normalement mains/portee/précision/dégâts, jamais de
        // bonus défensif — SAUF quelques objets rares dont l'effet nommé accorde
        // un bonus permanent et inconditionnel (ex: "Canon bunker" +1 Défense).
        // `def.bonus` est le champ d'échappement pour ces cas ; absent partout
        // ailleurs (catalogue de base, quasi-totalité du catalogue rare) → 0,
        // comportement inchangé. defFixe reste réservé aux armures lourdes.
        modDefense:        isWeapon ? (def.bonus?.defense ?? 0) : (def.defense?.mod ?? 0),
        modDefenseMagique: isWeapon ? (def.bonus?.defenseMagique ?? 0) : (def.defenseMagique?.mod ?? 0),
        modInitiative:     isWeapon ? (def.bonus?.initiative ?? 0) : (def.initiative ?? 0),
        defFixe:           !isWeapon && Number.isInteger(def.defense?.fixe) ? def.defense.fixe : null,

        emplacementEquipe: null,
    };
}

/**
 * Convertit une entrée du catalogue DE BASE en item détaché (raccourci pour
 * les appelants qui ne connaissent que ce catalogue — le wizard, notamment,
 * qui ne propose jamais les objets rares).
 *
 * @param {string} key - clé du catalogue (ex: 'dague_acier')
 * @returns {object|null}
 */
export function catalogToItem(key) {
    return buildCatalogEntry(EQUIPMENT_CATALOG[key], key);
}
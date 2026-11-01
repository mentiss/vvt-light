// src/server/systems/fabula/CharacterController.js
// ─────────────────────────────────────────────────────────────────────────────
// Contrat :
//   loadFullCharacter(db, id) → objet complet ou null
//   saveFullCharacter(db, id, data) → objet complet mis à jour
//
// loadFullCharacter agrège :
//   - characters (toutes les colonnes plates)
//   - character_classes   → classes[]
//   - character_skills    → skills[]
//   - character_arcana    → arcana[]
//   - character_bonds     → bonds[]  (sentiments JSON parsé)
//   - character_equipment → equipment[]  (profil structuré arme/défense +
//     emplacement_equipe : null = sac, sinon armure/accessoire/
//     main_directrice/main_secondaire/deux_mains)
//   JSON parsé : alterations_etat
//
// saveFullCharacter persiste en transaction atomique (même modèle que vikings) :
//   - UPDATE characters : colonnes à plat en COALESCE, un champ absent (ou
//     null) n'est pas écrasé → envoi partiel possible (PATCH). Un texte vidé
//     ('') est bien enregistré vide.
//   - Sous-tables (classes, skills, arcana, bonds, equipment) synchronisées par
//     _syncSubTable : mise à jour par id, insertion sans id, suppression des
//     lignes absentes du tableau ; un tableau absent laisse la sous-table intacte.
// ─────────────────────────────────────────────────────────────────────────────

// ── Colonnes à plat : clé camelCase envoyée par le client → colonne SQL ──────
// (alterationsEtat et boostsAttributs, en JSON, sont traités à part)

const FLAT_COLUMNS = {
    playerName:     'player_name',
    avatar:         'avatar',
    accessCode:     'access_code',
    nom:            'nom',
    prenom:         'prenom',
    sexe:           'sexe',
    age:            'age',
    taille:         'taille',
    poids:          'poids',
    identite:       'identite',
    origine:        'origine',
    theme:          'theme',
    niveauGlobal:   'niveau_global',
    dexDe:          'dex_de',
    intDe:          'int_de',
    puiDe:          'pui_de',
    volDe:          'vol_de',
    pvMax:          'pv_max',
    pvActuel:       'pv_actuel',
    pmMax:          'pm_max',
    pmActuel:       'pm_actuel',
    piMax:          'pi_max',
    piActuel:       'pi_actuel',
    seuilCrise:     'seuil_crise',
    initiative:     'initiative',
    defense:        'defense',
    defenseMagique: 'defense_magique',
    zenit:          'zenit',
    pointsFabula:   'points_fabula',
    groupeNom:      'groupe_nom',
};

// Énumérations autorisées de l'équipement — toute valeur hors liste retombe
// sur un défaut sûr plutôt que de faire échouer la transaction sur un CHECK.
const ATTRS        = ['dex', 'int', 'pui', 'vol'];
const DEGATS_TYPES = ['physique', 'feu', 'glace', 'foudre', 'air', 'terre', 'lumiere', 'tenebres', 'poison'];
const EMPLACEMENTS = ['armure', 'accessoire', 'main_directrice', 'main_secondaire', 'deux_mains'];
const TYPES_EMPLACEMENT = ['arme', 'armure', 'bouclier', 'accessoire'];
const BOND_TARGETS = ['pj', 'pnj', 'lieu', 'organisation'];

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Synchronise une sous-table en CRUD complet (même helper que vikings et
 * deltagreen). Entrée avec id → mise à jour ; sans id → insertion ; présente
 * en BDD mais absente du tableau → suppression. L'index est transmis à
 * upsertFn (ordre de l'équipement).
 */
function _syncSubTable(db, table, characterId, incoming, upsertFn) {
    if (!Array.isArray(incoming)) return;

    const existingIds = db.prepare(
        `SELECT id FROM ${table} WHERE character_id = ?`
    ).all(characterId).map(r => r.id);

    const incomingIds = incoming.filter(i => i?.id).map(i => i.id);

    for (const eid of existingIds) {
        if (!incomingIds.includes(eid)) {
            db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(eid);
        }
    }

    incoming.forEach((item, index) => {
        if (item) upsertFn(db, characterId, item, index);
    });
}

// Mise à jour par id, sinon insertion. Un id inconnu de la base (id temporaire
// créé côté client) est traité comme une insertion.
function _updateOrInsert(db, entry, updateSql, updateValues, insertSql, insertValues) {
    const changes = entry.id ? db.prepare(updateSql).run(...updateValues).changes : 0;
    if (!changes) db.prepare(insertSql).run(...insertValues);
}

function _upsertClass(db, charId, c) {
    if (!c.classKey) return;
    const values = [c.classKey, c.niveau ?? 0];
    _updateOrInsert(db, c,
        'UPDATE character_classes SET class_key = ?, niveau = ? WHERE id = ? AND character_id = ?', [...values, c.id, charId],
        'INSERT INTO character_classes (character_id, class_key, niveau) VALUES (?, ?, ?)', [charId, ...values]);
}

function _upsertSkill(db, charId, s) {
    if (!s.classKey || !s.skillKey) return;
    const values = [
        s.classKey, s.skillKey, s.rang ?? 0,
        JSON.stringify(Array.isArray(s.spellsChoisis) ? s.spellsChoisis : []),
    ];
    _updateOrInsert(db, s,
        `UPDATE character_skills SET class_key = ?, skill_key = ?, rang = ?, spells_choisis = ?
         WHERE id = ? AND character_id = ?`, [...values, s.id, charId],
        `INSERT INTO character_skills (character_id, class_key, skill_key, rang, spells_choisis)
         VALUES (?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _upsertArcanum(db, charId, a) {
    if (!a.arcanumKey) return;
    const values = [a.arcanumKey, a.etat === 'fusionne' ? 'fusionne' : 'lie'];
    _updateOrInsert(db, a,
        'UPDATE character_arcana SET arcanum_key = ?, etat = ? WHERE id = ? AND character_id = ?', [...values, a.id, charId],
        'INSERT INTO character_arcana (character_id, arcanum_key, etat) VALUES (?, ?, ?)', [charId, ...values]);
}

function _upsertBond(db, charId, b) {
    const values = [
        b.cibleNom ?? '',
        BOND_TARGETS.includes(b.cibleType) ? b.cibleType : 'pnj',
        JSON.stringify(Array.isArray(b.sentiments) ? b.sentiments.slice(0, 3) : []),
        b.notes ?? '',
    ];
    _updateOrInsert(db, b,
        `UPDATE character_bonds SET cible_nom = ?, cible_type = ?, sentiments = ?, notes = ?
         WHERE id = ? AND character_id = ?`, [...values, b.id, charId],
        `INSERT INTO character_bonds (character_id, cible_nom, cible_type, sentiments, notes)
         VALUES (?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _upsertEquipment(db, charId, e, index) {
    if (!TYPES_EMPLACEMENT.includes(e.typeEmplacement)) return;
    const values = [
        e.typeEmplacement,
        e.equipmentKey ?? null,
        e.nomLibre ?? '',
        e.notesLibres ?? '',
        e.prix ?? 0,

        e.categorie ?? null,
        e.estMartial ? 1 : 0,
        e.qualite ?? '',

        ATTRS.includes(e.precisionAttr1) ? e.precisionAttr1 : null,
        ATTRS.includes(e.precisionAttr2) ? e.precisionAttr2 : null,
        e.precisionBonus ?? 0,
        e.degatsBonus ?? 0,
        DEGATS_TYPES.includes(e.degatsType) ? e.degatsType : 'physique',
        e.mains === 2 ? 2 : 1,
        e.portee === 'distance' ? 'distance' : 'cac',

        e.modDefense ?? 0,
        e.modDefenseMagique ?? 0,
        e.modInitiative ?? 0,
        Number.isInteger(e.defFixe) ? e.defFixe : null,

        EMPLACEMENTS.includes(e.emplacementEquipe) ? e.emplacementEquipe : null,
        e.ordre ?? index,
    ];
    _updateOrInsert(db, e,
        `UPDATE character_equipment SET
             type_emplacement = ?, equipment_key = ?, nom_libre = ?, notes_libres = ?, prix = ?,
             categorie = ?, est_martial = ?, qualite = ?,
             precision_attr1 = ?, precision_attr2 = ?, precision_bonus = ?,
             degats_bonus = ?, degats_type = ?, mains = ?, portee = ?,
             mod_defense = ?, mod_defense_magique = ?, mod_initiative = ?, def_fixe = ?,
             emplacement_equipe = ?, ordre = ?
         WHERE id = ? AND character_id = ?`, [...values, e.id, charId],
        `INSERT INTO character_equipment
             (character_id, type_emplacement, equipment_key, nom_libre, notes_libres, prix,
              categorie, est_martial, qualite,
              precision_attr1, precision_attr2, precision_bonus,
              degats_bonus, degats_type, mains, portee,
              mod_defense, mod_defense_magique, mod_initiative, def_fixe,
              emplacement_equipe, ordre)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [charId, ...values]);
}

function _parseJson(str, fallback) {
    if (!str) return fallback;
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
}

// ── loadFullCharacter ─────────────────────────────────────────────────────────

/**
 * Charge un personnage complet depuis la BDD.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} id
 * @returns {object|null}
 */
function loadFullCharacter(db, id) {
    const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
    if (!row) return null;

    const classes = db.prepare(
        'SELECT id, class_key, niveau FROM character_classes WHERE character_id = ? ORDER BY id'
    ).all(id);

    const skills = db.prepare(
        'SELECT id, class_key, skill_key, rang, spells_choisis FROM character_skills WHERE character_id = ? ORDER BY id'
    ).all(id);

    const arcana = db.prepare(
        'SELECT id, arcanum_key, etat FROM character_arcana WHERE character_id = ? ORDER BY id'
    ).all(id);

    const bonds = db.prepare(
        'SELECT id, cible_nom, cible_type, sentiments, notes FROM character_bonds WHERE character_id = ? ORDER BY id'
    ).all(id);

    const equipment = db.prepare(`
        SELECT id, type_emplacement, equipment_key, nom_libre, notes_libres, prix,
               categorie, est_martial, qualite,
               precision_attr1, precision_attr2, precision_bonus,
               degats_bonus, degats_type, mains, portee,
               mod_defense, mod_defense_magique, mod_initiative, def_fixe,
               emplacement_equipe, ordre
        FROM character_equipment
        WHERE character_id = ?
        ORDER BY ordre, id
    `).all(id);

    return {
        id:                row.id,
        accessCode:        row.access_code,
        accessUrl:         row.access_url,
        playerName:        row.player_name,
        avatar:            row.avatar,
        nom:               row.nom,
        prenom:            row.prenom,
        sexe:              row.sexe,
        age:               row.age,
        taille:            row.taille,
        poids:             row.poids,

        // Traits narratifs
        identite:          row.identite,
        origine:           row.origine,
        theme:             row.theme,
        niveauGlobal:      row.niveau_global,

        // Attributs (taille de dé)
        dexDe:             row.dex_de,
        intDe:             row.int_de,
        puiDe:             row.pui_de,
        volDe:             row.vol_de,

        // Statistiques dérivées
        pvMax:             row.pv_max,
        pvActuel:          row.pv_actuel,
        pmMax:             row.pm_max,
        pmActuel:          row.pm_actuel,
        piMax:             row.pi_max,
        piActuel:          row.pi_actuel,
        seuilCrise:        row.seuil_crise,
        initiative:        row.initiative,
        defense:           row.defense,
        defenseMagique:    row.defense_magique,

        // Économie narrative
        zenit:             row.zenit,
        pointsFabula:      row.points_fabula,

        groupeNom:         row.groupe_nom,
        alterationsEtat:   _parseJson(row.alterations_etat, []),
        boostsAttributs:   _parseJson(row.boosts_attributs, {}),

        // Sous-tables
        classes: classes.map(c => ({
            id:       c.id,
            classKey: c.class_key,
            niveau:   c.niveau,
        })),
        skills: skills.map(s => ({
            id:            s.id,
            classKey:      s.class_key,
            skillKey:      s.skill_key,
            rang:          s.rang,
            spellsChoisis: _parseJson(s.spells_choisis, []),
        })),
        arcana: arcana.map(a => ({
            id:         a.id,
            arcanumKey: a.arcanum_key,
            etat:       a.etat,
        })),
        bonds: bonds.map(b => ({
            id:         b.id,
            cibleNom:   b.cible_nom,
            cibleType:  b.cible_type,
            sentiments: _parseJson(b.sentiments, []),
            notes:      b.notes,
        })),
        equipment: equipment.map(e => ({
            id:                e.id,
            typeEmplacement:   e.type_emplacement,
            equipmentKey:      e.equipment_key,
            nomLibre:          e.nom_libre,
            notesLibres:       e.notes_libres,
            prix:              e.prix,

            // Profil général
            categorie:         e.categorie,
            estMartial:        !!e.est_martial,
            qualite:           e.qualite,

            // Profil arme
            precisionAttr1:    e.precision_attr1,
            precisionAttr2:    e.precision_attr2,
            precisionBonus:    e.precision_bonus,
            degatsBonus:       e.degats_bonus,
            degatsType:        e.degats_type,
            mains:             e.mains,
            portee:            e.portee,

            // Profil défensif
            modDefense:        e.mod_defense,
            modDefenseMagique: e.mod_defense_magique,
            modInitiative:     e.mod_initiative,
            defFixe:           e.def_fixe,

            // Position — null = sac à dos
            emplacementEquipe: e.emplacement_equipe,
            ordre:             e.ordre,
        })),

        // Métadonnées
        createdAt:    row.created_at,
        updatedAt:    row.updated_at,
        lastAccessed: row.last_accessed,
    };
}

// ── saveFullCharacter ─────────────────────────────────────────────────────────

/**
 * Persiste un personnage en transaction. Seuls les champs fournis sont écrits :
 * colonnes à plat en COALESCE, sous-tables synchronisées si leur tableau est
 * présent. Sert au PUT (fiche complète), au PATCH (partiel) et à la création.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} id
 * @param {object} data - Données envoyées par le client
 * @returns {object} personnage rechargé
 */
function saveFullCharacter(db, id, data) {
    const params = { id };
    for (const [key, column] of Object.entries(FLAT_COLUMNS)) params[column] = data[key] ?? null;
    if (params.access_code) params.access_code = String(params.access_code).toUpperCase();
    // Pas de plafond de Points Fabula (règle de table du MJ — la limite
    // officielle de 6 de la spec §4.1 est explicitement écartée), plancher à 0.
    if (params.points_fabula !== null) params.points_fabula = Math.max(0, params.points_fabula);

    // JSON : écrits seulement s'ils sont fournis, au bon format
    params.alterations_etat = Array.isArray(data.alterationsEtat) ? JSON.stringify(data.alterationsEtat) : null;
    const boosts = data.boostsAttributs;
    params.boosts_attributs = boosts && typeof boosts === 'object' && !Array.isArray(boosts) ? JSON.stringify(boosts) : null;

    const setClauses = [...Object.values(FLAT_COLUMNS), 'alterations_etat', 'boosts_attributs']
        .map(column => `${column} = COALESCE(@${column}, ${column})`)
        .join(',\n                ');

    db.prepare('BEGIN').run();
    try {
        db.prepare(`
            UPDATE characters SET
                ${setClauses},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @id
        `).run(params);

        _syncSubTable(db, 'character_classes',   id, data.classes,   _upsertClass);
        _syncSubTable(db, 'character_skills',    id, data.skills,    _upsertSkill);
        _syncSubTable(db, 'character_arcana',    id, data.arcana,    _upsertArcanum);
        _syncSubTable(db, 'character_bonds',     id, data.bonds,     _upsertBond);
        _syncSubTable(db, 'character_equipment', id, data.equipment, _upsertEquipment);

        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }

    return loadFullCharacter(db, id);
}

module.exports = { loadFullCharacter, saveFullCharacter };
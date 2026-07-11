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
// saveFullCharacter persiste en transaction atomique :
//   - UPDATE characters (colonnes plates, assignation directe — jamais de
//     COALESCE, pour ne pas empêcher de vider un champ texte)
//   - Sous-tables (classes, skills, arcana, bonds, equipment) synchronisées
//     en delete-puis-reinsert : la fiche est toujours sauvegardée en entier
//     depuis Sheet.jsx, donc pas besoin d'un upsert par id.
// ─────────────────────────────────────────────────────────────────────────────

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
 * Persiste un personnage complet en transaction.
 *
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} id
 * @param {object} data - Données envoyées par le client (fiche complète)
 * @returns {object} personnage rechargé
 */
function saveFullCharacter(db, id, data) {
    const {
        playerName, avatar, nom, prenom, sexe, age, taille, poids,
        identite, origine, theme, niveauGlobal,
        dexDe, intDe, puiDe, volDe,
        pvMax, pvActuel, pmMax, pmActuel, piMax, piActuel,
        seuilCrise, initiative, defense, defenseMagique,
        zenit, pointsFabula, groupeNom, alterationsEtat, boostsAttributs,
        classes, skills, arcana, bonds, equipment,
    } = data;

    db.prepare('BEGIN').run();
    try {
        // ── 1. Colonnes plates du personnage — assignation directe ─────────────
        // Jamais de COALESCE ici : la fiche est toujours envoyée en entier par
        // Sheet.jsx, donc un champ vidé (nom = '') doit bien être persisté vide.
        db.prepare(`
            UPDATE characters SET
                                  player_name       = @playerName,
                                  avatar            = @avatar,
                                  nom               = @nom,
                                  prenom            = @prenom,
                                  sexe              = @sexe,
                                  age               = @age,
                                  taille            = @taille,
                                  poids             = @poids,

                                  identite          = @identite,
                                  origine           = @origine,
                                  theme             = @theme,
                                  niveau_global     = @niveauGlobal,

                                  dex_de            = @dexDe,
                                  int_de            = @intDe,
                                  pui_de            = @puiDe,
                                  vol_de            = @volDe,

                                  pv_max            = @pvMax,
                                  pv_actuel         = @pvActuel,
                                  pm_max            = @pmMax,
                                  pm_actuel         = @pmActuel,
                                  pi_max            = @piMax,
                                  pi_actuel         = @piActuel,
                                  seuil_crise       = @seuilCrise,
                                  initiative        = @initiative,
                                  defense           = @defense,
                                  defense_magique   = @defenseMagique,

                                  zenit             = @zenit,
                                  points_fabula     = @pointsFabula,
                                  groupe_nom        = @groupeNom,
                                  alterations_etat  = @alterationsEtat,
                                  boosts_attributs  = @boostsAttributs,

                                  updated_at        = CURRENT_TIMESTAMP
            WHERE id = @id
        `).run({
            id,
            playerName:   playerName   ?? '',
            avatar:       avatar       ?? null,
            nom:          nom          ?? '',
            prenom:       prenom       ?? '',
            sexe:         sexe         ?? '',
            age:          age          ?? null,
            taille:       taille       ?? null,
            poids:        poids        ?? null,

            identite:     identite     ?? '',
            origine:      origine      ?? '',
            theme:        theme        ?? '',
            niveauGlobal: niveauGlobal ?? 5,

            dexDe: dexDe ?? 8, intDe: intDe ?? 8, puiDe: puiDe ?? 8, volDe: volDe ?? 8,

            pvMax: pvMax ?? 0, pvActuel: pvActuel ?? 0,
            pmMax: pmMax ?? 0, pmActuel: pmActuel ?? 0,
            piMax: piMax ?? 6, piActuel: piActuel ?? 6,
            seuilCrise: seuilCrise ?? 0,
            initiative: initiative ?? 0,
            defense: defense ?? 0,
            defenseMagique: defenseMagique ?? 0,

            zenit:        zenit        ?? 0,
            // Pas de plafond de Points Fabula (règle de table du MJ — la limite
            // officielle de 6 de la spec §4.1 est explicitement écartée).
            pointsFabula: pointsFabula != null ? Math.max(0, pointsFabula) : 3,
            groupeNom:    groupeNom    ?? '',
            alterationsEtat: JSON.stringify(Array.isArray(alterationsEtat) ? alterationsEtat : []),
            boostsAttributs: JSON.stringify(
                boostsAttributs && typeof boostsAttributs === 'object' && !Array.isArray(boostsAttributs)
                    ? boostsAttributs : {}
            ),
        });

        // ── 2. Sous-tables — delete puis reinsert ───────────────────────────────

        db.prepare('DELETE FROM character_classes WHERE character_id = ?').run(id);
        if (Array.isArray(classes)) {
            const ins = db.prepare(
                'INSERT INTO character_classes (character_id, class_key, niveau) VALUES (?, ?, ?)'
            );
            for (const c of classes) {
                if (!c.classKey) continue;
                ins.run(id, c.classKey, c.niveau ?? 0);
            }
        }

        db.prepare('DELETE FROM character_skills WHERE character_id = ?').run(id);
        if (Array.isArray(skills)) {
            const ins = db.prepare(
                'INSERT INTO character_skills (character_id, class_key, skill_key, rang, spells_choisis) VALUES (?, ?, ?, ?, ?)'
            );
            for (const s of skills) {
                if (!s.classKey || !s.skillKey) continue;
                ins.run(
                    id, s.classKey, s.skillKey, s.rang ?? 0,
                    JSON.stringify(Array.isArray(s.spellsChoisis) ? s.spellsChoisis : [])
                );
            }
        }

        db.prepare('DELETE FROM character_arcana WHERE character_id = ?').run(id);
        if (Array.isArray(arcana)) {
            const ins = db.prepare(
                'INSERT INTO character_arcana (character_id, arcanum_key, etat) VALUES (?, ?, ?)'
            );
            for (const a of arcana) {
                if (!a.arcanumKey) continue;
                ins.run(id, a.arcanumKey, a.etat === 'fusionne' ? 'fusionne' : 'lie');
            }
        }

        db.prepare('DELETE FROM character_bonds WHERE character_id = ?').run(id);
        if (Array.isArray(bonds)) {
            const ins = db.prepare(
                'INSERT INTO character_bonds (character_id, cible_nom, cible_type, sentiments, notes) VALUES (?, ?, ?, ?, ?)'
            );
            for (const b of bonds) {
                const sentiments = Array.isArray(b.sentiments) ? b.sentiments.slice(0, 3) : [];
                ins.run(
                    id,
                    b.cibleNom ?? '',
                    ['pj', 'pnj', 'lieu', 'organisation'].includes(b.cibleType) ? b.cibleType : 'pnj',
                    JSON.stringify(sentiments),
                    b.notes ?? ''
                );
            }
        }

        db.prepare('DELETE FROM character_equipment WHERE character_id = ?').run(id);
        if (Array.isArray(equipment)) {
            // Énumérations autorisées — toute valeur hors liste retombe sur un
            // défaut sûr plutôt que de faire échouer la transaction sur un CHECK.
            const ATTRS        = ['dex', 'int', 'pui', 'vol'];
            const DEGATS_TYPES = ['physique', 'feu', 'glace', 'foudre', 'air', 'terre', 'lumiere', 'tenebres', 'poison'];
            const EMPLACEMENTS = ['armure', 'accessoire', 'main_directrice', 'main_secondaire', 'deux_mains'];

            const ins = db.prepare(`
                INSERT INTO character_equipment
                (character_id, type_emplacement, equipment_key, nom_libre, notes_libres, prix,
                 categorie, est_martial, qualite,
                 precision_attr1, precision_attr2, precision_bonus,
                 degats_bonus, degats_type, mains, portee,
                 mod_defense, mod_defense_magique, mod_initiative, def_fixe,
                 emplacement_equipe, ordre)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            equipment.forEach((e, index) => {
                if (!['arme', 'armure', 'bouclier', 'accessoire'].includes(e.typeEmplacement)) return;
                ins.run(
                    id,
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
                    e.ordre ?? index
                );
            });
        }

        db.prepare('COMMIT').run();
    } catch (err) {
        db.prepare('ROLLBACK').run();
        throw err;
    }

    return loadFullCharacter(db, id);
}

module.exports = { loadFullCharacter, saveFullCharacter };
-- ═══════════════════════════════════════════════════════════════════════════
-- database-template/fabula-schema.sql
-- Schéma Fabula Ultima — Mentiss VTT
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Table principale ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS characters (
    -- Colonnes plateforme (base.sql — verbatim)
                                          id                   INTEGER  PRIMARY KEY AUTOINCREMENT,
                                          access_code          TEXT     NOT NULL UNIQUE,
                                          access_url           TEXT     NOT NULL UNIQUE,
                                          player_name          TEXT     NOT NULL,
                                          avatar               TEXT,
                                          nom                  TEXT     NOT NULL DEFAULT '',
                                          prenom               TEXT,
                                          sexe                 TEXT,
                                          age                  INTEGER,
                                          taille               INTEGER,
                                          poids                INTEGER,
                                          login_attempts       INTEGER  DEFAULT 0,
                                          last_attempt_at      DATETIME,
                                          last_accessed        DATETIME,
                                          created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
                                          updated_at           DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Traits narratifs
                                          identite             TEXT     DEFAULT '',
                                          origine              TEXT     DEFAULT '',
                                          theme                TEXT     DEFAULT '',
                                          niveau_global        INTEGER  DEFAULT 5,

    -- Attributs (taille de dé : 6/8/10/12)
                                          dex_de               INTEGER  DEFAULT 8,
                                          int_de               INTEGER  DEFAULT 8,
                                          pui_de               INTEGER  DEFAULT 8,
                                          vol_de               INTEGER  DEFAULT 8,

    -- Statistiques dérivées (persistées, recalculées au save)
                                          pv_max               INTEGER  DEFAULT 0,
                                          pv_actuel            INTEGER  DEFAULT 0,
                                          pm_max               INTEGER  DEFAULT 0,
                                          pm_actuel            INTEGER  DEFAULT 0,
                                          pi_max               INTEGER  DEFAULT 6,
                                          pi_actuel            INTEGER  DEFAULT 6,
                                          seuil_crise          INTEGER  DEFAULT 0,
                                          initiative           INTEGER  DEFAULT 0,
                                          defense              INTEGER  DEFAULT 0,
                                          defense_magique      INTEGER  DEFAULT 0,

    -- Économie narrative
                                          zenit                INTEGER  DEFAULT 0,
                                          points_fabula        INTEGER  DEFAULT 3,
    -- Nombre porte-bonheur de l'Entropiste (7 en début de séance) et son usage
    -- dans la scène en cours (0/1) — spec_fabula.md §3.3
                                          porte_bonheur        INTEGER  DEFAULT 7,
                                          porte_bonheur_utilise INTEGER DEFAULT 0,

                                          groupe_nom           TEXT     DEFAULT '',
                                          alterations_etat     TEXT     DEFAULT '[]',
    -- Boosts de taille de dé par attribut (chevrons — armes, sorts…),
    -- JSON {"dex":0,"int":0,"pui":0,"vol":0}, symétrique d'alterations_etat.
                                          boosts_attributs     TEXT     DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_characters_access_code ON characters(access_code);
CREATE INDEX IF NOT EXISTS idx_characters_access_url  ON characters(access_url);
CREATE INDEX IF NOT EXISTS idx_characters_updated_at  ON characters(updated_at DESC);

-- Compte GM obligatoire
INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, nom)
VALUES (-1, 'GMCODE', 'this-is-MJ', 'MJ', 'Meneur de Jeu');

-- ═══════════════════════════════════════════════════════════════════════════
-- Tables transversales (base.sql — verbatim, non modifiées)
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS game_sessions (
                                             id          INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name        TEXT NOT NULL,
                                             access_code TEXT NOT NULL UNIQUE,
                                             access_url  TEXT NOT NULL UNIQUE,
                                             date        DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             notes       TEXT,
                                             created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_id         ON game_sessions(id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_updated_at ON game_sessions(updated_at DESC);

CREATE TABLE IF NOT EXISTS refresh_tokens (
                                              id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                              character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                              token        TEXT    NOT NULL UNIQUE,
                                              expires_at   DATETIME NOT NULL,
                                              created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_character_id ON refresh_tokens(character_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at   ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token        ON refresh_tokens(token);

CREATE TABLE IF NOT EXISTS dice_history (
                                            id              INTEGER PRIMARY KEY AUTOINCREMENT,
                                            character_id    INTEGER REFERENCES characters(id) ON DELETE CASCADE,
                                            session_id      INTEGER REFERENCES game_sessions(id) ON DELETE SET NULL,
                                            notation        TEXT,
                                            roll_result     TEXT,
                                            label           TEXT,
                                            raw_result      TEXT,
                                            roll_type       TEXT,
                                            created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dice_history_character_id ON dice_history(character_id);
CREATE INDEX IF NOT EXISTS idx_dice_history_created_at   ON dice_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dice_history_session_id   ON dice_history(session_id);

CREATE TABLE IF NOT EXISTS character_journal (
                                                 id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                 session_id   INTEGER REFERENCES game_sessions(id) ON DELETE SET NULL,
                                                 type         TEXT NOT NULL DEFAULT 'note',
                                                 title        TEXT,
                                                 body         TEXT,
                                                 metadata     TEXT,
                                                 is_read      BOOLEAN DEFAULT 0,
                                                 created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_journal_character_id ON character_journal(character_id);
CREATE INDEX IF NOT EXISTS idx_journal_session_id   ON character_journal(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_updated_at   ON character_journal(updated_at DESC);

CREATE TABLE IF NOT EXISTS session_characters (
                                                  session_id   INTEGER NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
                                                  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                  joined_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                  PRIMARY KEY (session_id, character_id)
);

CREATE INDEX IF NOT EXISTS idx_session_characters_character_id ON session_characters(character_id);
CREATE INDEX IF NOT EXISTS idx_session_characters_session_id   ON session_characters(session_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Tables spécifiques Fabula Ultima
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS character_classes (
                                                 id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                 class_key    TEXT    NOT NULL,
                                                 niveau       INTEGER NOT NULL DEFAULT 0,
                                                 UNIQUE(character_id, class_key)
);
CREATE INDEX IF NOT EXISTS idx_fabula_classes_char ON character_classes(character_id);

CREATE TABLE IF NOT EXISTS character_skills (
                                                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                class_key    TEXT    NOT NULL,
                                                skill_key    TEXT    NOT NULL,
                                                rang         INTEGER NOT NULL DEFAULT 0,
    -- Sorts choisis quand la compétence donne accès à une spellList (ex. "Magie
    -- élémentaire"). JSON array de spell_key (catalogue) ou, pour le Chimériste
    -- (pas de catalogue fixe), d'objets libres {nom, description}.
                                                spells_choisis TEXT  DEFAULT '[]',
                                                UNIQUE(character_id, class_key, skill_key)
);
CREATE INDEX IF NOT EXISTS idx_fabula_skills_char ON character_skills(character_id);

CREATE TABLE IF NOT EXISTS character_arcana (
                                                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                arcanum_key  TEXT    NOT NULL,
                                                etat         TEXT    NOT NULL DEFAULT 'lie' CHECK(etat IN ('lie', 'fusionne', 'renvoi')),
                                                UNIQUE(character_id, arcanum_key)
);
CREATE INDEX IF NOT EXISTS idx_fabula_arcana_char ON character_arcana(character_id);

CREATE TABLE IF NOT EXISTS character_bonds (
                                               id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                               character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                               cible_nom    TEXT    NOT NULL DEFAULT '',
                                               cible_type   TEXT    DEFAULT 'pnj' CHECK(cible_type IN ('pj','pnj','lieu','organisation')),
                                               sentiments   TEXT    DEFAULT '[]',
                                               notes        TEXT    DEFAULT '',
                                               created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fabula_bonds_char ON character_bonds(character_id);

-- Équipement — profil structuré (catalogue equipment.js + saisie libre enrichie).
-- Les formules ne sont JAMAIS stockées en texte : on persiste les composants
-- (attrs de précision, bonus, type de dégâts…), les helpers front reconstituent
-- la notation officielle ([DEX+INT]+1, [VH+8] physique, Taille de dé DEX +1).
CREATE TABLE IF NOT EXISTS character_equipment (
                                                   id               INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   character_id     INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

    -- Nature de l'item (ce qu'il EST — indépendant de sa position)
                                                   type_emplacement TEXT    NOT NULL CHECK(type_emplacement IN ('arme','armure','bouclier','accessoire')),

    -- Référence catalogue equipment.js (traçabilité uniquement : l'item est
    -- détaché du catalogue après ajout et reste éditable — modèle préremplissage)
                                                   equipment_key    TEXT    DEFAULT NULL,

                                                   nom_libre        TEXT    DEFAULT '',
                                                   notes_libres     TEXT    DEFAULT '',
                                                   prix             INTEGER DEFAULT 0,       -- coût en zénits

    -- ── Profil général ──────────────────────────────────────────────────────
                                                   categorie        TEXT    DEFAULT NULL,    -- armes : 'epee','dague','arc','lourde',
    -- 'lance','lutte','jet','articulee',
    -- 'arcanique','arme_a_feu'
                                                   est_martial      INTEGER DEFAULT 0,       -- badge informatif — AUCUNE contrainte
    -- logicielle (vérification à la table)
                                                   qualite          TEXT    DEFAULT '',      -- texte libre ("Se brise après l'attaque"…)

    -- ── Profil arme ─────────────────────────────────────────────────────────
    -- Formule de précision [attr1 + attr2] + bonus, ex : [DEX+INT]+1
                                                   precision_attr1  TEXT    DEFAULT NULL CHECK(precision_attr1 IN ('dex','int','pui','vol') OR precision_attr1 IS NULL),
                                                   precision_attr2  TEXT    DEFAULT NULL CHECK(precision_attr2 IN ('dex','int','pui','vol') OR precision_attr2 IS NULL),
                                                   precision_bonus  INTEGER DEFAULT 0,
    -- Formule de dégâts [VH + bonus], ex : [VH+8] physique
                                                   degats_bonus     INTEGER DEFAULT 0,
                                                   degats_type      TEXT    DEFAULT 'physique'
                                                       CHECK(degats_type IN ('physique','feu','glace','foudre','air','terre','lumiere','tenebres','poison')),
                                                   mains            INTEGER DEFAULT 1 CHECK(mains IN (1, 2)),
                                                   portee           TEXT    DEFAULT 'cac' CHECK(portee IN ('cac','distance')),

    -- ── Profil défensif ─────────────────────────────────────────────────────
    -- mod_defense          : bonus additif à la base DEF (taille de dé DEX)
    -- mod_defense_magique  : bonus additif à la base DEF.M (taille de dé INT)
    -- def_fixe             : armures lourdes — si non NULL, DEF = def_fixe
    --                        (la taille de dé DEX est ignorée), les mods des
    --                        autres pièces équipées s'additionnent par-dessus
                                                   mod_defense           INTEGER DEFAULT 0,
                                                   mod_defense_magique   INTEGER DEFAULT 0,
                                                   mod_initiative        INTEGER DEFAULT 0,
                                                   def_fixe              INTEGER DEFAULT NULL,

    -- ── Position d'équipement (OÙ il est) ───────────────────────────────────
    -- NULL = dans le sac à dos (remplace l'ancien booléen `equipe`).
    -- 'deux_mains' occupe les deux emplacements de main — exclusif avec
    -- 'main_directrice' et 'main_secondaire'.
    -- Aucune contrainte croisée avec type_emplacement : un bouclier en main
    -- directrice est légal (compétence Boucliers doubles du Gardien).
                                                   emplacement_equipe TEXT DEFAULT NULL
                                                       CHECK(emplacement_equipe IN ('armure','accessoire','main_directrice','main_secondaire','deux_mains')
                                                           OR emplacement_equipe IS NULL),

                                                   ordre            INTEGER DEFAULT 0,
                                                   created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fabula_equipment_char ON character_equipment(character_id);

-- ═════════════════════════════════════════════════════════════════════════
-- Extensions slug des tables partagées (base.sql)
-- Le bloc CREATE de session_characters ci-dessus reste STRICTEMENT identique
-- au template — les colonnes slug-spécifiques s'ajoutent ici par ALTER.
-- ═════════════════════════════════════════════════════════════════════════

-- Compteur GM de Points Fabula dépensés par personnage et par session de jeu
-- (calcul d'XP de fin de session). Manuel, visible GM uniquement.
ALTER TABLE session_characters ADD COLUMN pf_depenses INTEGER DEFAULT 0;
-- ─────────────────────────────────────────────────────────────────────────────
-- Fiche de groupe (spec_fabula.md §7) : une par table de jeu, partagée par les
-- joueurs et le MJ. Objets d'inventaire ajoutés par la table (les objets officiels
-- sont une donnée du slug, config/groupItems.js), notes, cadrans, journal.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS groupes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  INTEGER NOT NULL UNIQUE REFERENCES game_sessions(id) ON DELETE CASCADE,
    notes       TEXT    NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS groupe_objets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    groupe_id   INTEGER NOT NULL REFERENCES groupes(id) ON DELETE CASCADE,
    nom         TEXT    NOT NULL DEFAULT '',
    pi          INTEGER NOT NULL DEFAULT 1,
    effet       TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_fabula_groupe_objets ON groupe_objets(groupe_id);

-- Cadrans : sections remplies sur un total ; « cache » = visible du MJ seul
CREATE TABLE IF NOT EXISTS groupe_cadrans (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    groupe_id   INTEGER NOT NULL REFERENCES groupes(id) ON DELETE CASCADE,
    nom         TEXT    NOT NULL DEFAULT '',
    sections    INTEGER NOT NULL DEFAULT 6,
    remplies    INTEGER NOT NULL DEFAULT 0,
    cache       INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_fabula_groupe_cadrans ON groupe_cadrans(groupe_id);

-- Journal : personnages, créatures et lieux rencontrés, avec leurs notes
CREATE TABLE IF NOT EXISTS groupe_journal (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    groupe_id   INTEGER NOT NULL REFERENCES groupes(id) ON DELETE CASCADE,
    nom         TEXT    NOT NULL DEFAULT '',
    type        TEXT    NOT NULL DEFAULT 'personnage' CHECK(type IN ('personnage', 'creature', 'lieu')),
    notes       TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_fabula_groupe_journal ON groupe_journal(groupe_id);

-- ── PNJ (documentations/spec_pnj.md §6.2) ─────────────────────────────────────
-- npcs : bibliothèque du MJ (PNJ, monstres, animaux) ; system_data propre au slug.
-- session_npcs : PNJ présents à une table, copie de la fiche (sheet) + état du slug.
create table if not exists npcs
(
    id          INTEGER
        primary key autoincrement,
    prenom      TEXT,
    nom         TEXT                 not null,
    role        TEXT,
    description TEXT,
    gm_notes    TEXT,
    tags        TEXT     default '[]' not null,
    avatar      TEXT,
    icon        TEXT,
    source      TEXT,
    page        INTEGER,
    system_data TEXT     default '{}' not null,
    created_at  DATETIME default CURRENT_TIMESTAMP,
    updated_at  DATETIME default CURRENT_TIMESTAMP
);

create index if not exists idx_npcs_nom
    on npcs (nom);

create table if not exists session_npcs
(
    id         INTEGER
        primary key autoincrement,
    session_id INTEGER              not null
        references game_sessions
            on delete cascade,
    npc_id     INTEGER
        references npcs
            on delete set null,
    name       TEXT                 not null,
    sheet      TEXT     default '{}' not null,
    state      TEXT     default '{}' not null,
    notes      TEXT,
    sort_order INTEGER  default 0    not null,
    created_at DATETIME default CURRENT_TIMESTAMP
);

create index if not exists idx_session_npcs_session_id
    on session_npcs (session_id);

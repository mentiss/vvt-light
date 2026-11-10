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

-- ── PNJ du livre (versés une fois, 10112026_npcs_fabula.sql) ──
INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Angela', 'Humanoïde', 'Magicienne de feu, l’une des fondatrices d’une mystérieuse organisation qui dérobe des grimoires rares ; pyromancienne de talent (exemple de boss du chapitre Meneur de jeu).', '["Humanoïde","Élite","Méchant"]', 'Livre de base', 315, '{"level":20,"species":"Humanoïde","rank":"elite","champion":null,"traits":["ambitieuse","arrogante","instruite","impitoyable"],"attributes":{"dex":8,"int":8,"pui":8,"vol":10},"hp":160,"crisis":80,"mp":80,"init":8,"def":9,"mdef":10,"affinities":{"tenebres":"RE","feu":"RE"},"attacks":[{"name":"Férule","ranged":false,"attrs":["int","vol"],"precision":2,"damage":7,"type":"physique","text":""},{"name":"Fléchette de flammes","ranged":true,"attrs":["int","vol"],"precision":2,"damage":10,"type":"feu","text":"La cible subit l’état affaibli. Cette attaque se fait contre la Défense magique."}],"spells":[{"name":"Absorption de vigueur","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie 【INT + VOL】+3. La cible subit【VH + 20】dégâts de ténèbres et Angela récupère un nombre de Points de Vie égal à la moitié des PV perdus."},{"name":"Trait de feu","cost":"20 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie 【INT + VOL】+3. La cible subit【VH + 30】dégâts de feu. Ces dégâts ignorent les résistances."},{"name":"Ignis","cost":"10 × C PM","target":"Jusqu’à 3 créatures","duration":"Instantanée","offensive":true,"text":"Test de magie 【INT + VOL】+3. Chaque cible subit【VH + 20】dégâts de feu. Aubaine : chaque cible subit l’état traumatisé."}],"abilities":[{"name":"Équipement","text":"Férule, robe de sage."},{"name":"Les cendres aux cendres","text":"Lorsqu’elle entre en Crise pour la première fois, Angela focalise sa magie pour détruire le laboratoire : Cadran à six sections, dont 1 section se remplit automatiquement au début de chacun de ses tours. Les PJ peuvent le faire reculer avec l’action Objectif ; pour préserver les preuves du repaire, il faut réduire le Cadran à zéro et vaincre Angela ou la forcer à quitter la scène."}],"villain":"mineur"}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Angela' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Lanterne arcanique d’Angela', 'Créature artificielle', 'Lanterne arcanique modifiée qui accompagne Angela dans son laboratoire : elle explose en rendant de la magie à tous quand elle tombe.', '["Construct","Soldat"]', 'Livre de base', 315, '{"level":5,"species":"Construct","rank":"soldat","champion":null,"traits":["lumineuse","serviable","magique","minuscule"],"attributes":{"dex":8,"int":8,"pui":6,"vol":10},"hp":40,"crisis":20,"mp":55,"init":8,"def":9,"mdef":10,"affinities":{"physique":"VU","terre":"RE","feu":"RE","glace":"RE","poison":"IM"},"attacks":[{"name":"Décharge élémentaire","ranged":true,"attrs":["dex","int"],"precision":0,"damage":5,"type":null,"text":"Quand la lanterne arcanique d’Angela effectue son attaque, lancez un d6 pour déterminer le type des dégâts : 1-2 : foudre ; 3-4 : feu ; 5-6 : glace."}],"spells":[],"abilities":[{"name":"Créature artificielle","text":"La lanterne est immunisée contre l’état empoisonné."},{"name":"Explosion de mana","text":"Quand elle tombe à 0 PV, la lanterne arcanique d’Angela explose dans une onde d’énergie magique. À ce moment, toutes les autres créatures présentes dans la scène regagnent 10 Points de Magie. Une nouvelle lanterne se joint alors à la bataille à la fin de chaque round (trois lanternes au plus engagées en même temps)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Lanterne arcanique d’Angela' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Squale épineux', 'Bête', 'Version champion du poisson épineux : un énorme poisson volant qui attaque les navires en pleine mer (exemple de boss du chapitre Meneur de jeu).', '["Bête","Champion"]', 'Livre de base', 317, '{"level":10,"species":"Bête","rank":"champion","champion":3,"traits":["agressif","intelligent","rapide","peau épaisse"],"attributes":{"dex":10,"int":10,"pui":6,"vol":6},"hp":150,"crisis":75,"mp":80,"init":17,"def":10,"mdef":10,"affinities":{"foudre":"VU","tenebres":"RE","feu":"RE","glace":"IM","poison":"RE"},"attacks":[{"name":"Plongeon épineux","ranged":false,"attrs":["dex","dex"],"precision":1,"damage":10,"type":"physique","text":""},{"name":"Jet océanique","ranged":true,"attrs":["dex","int"],"precision":1,"damage":5,"type":"glace","text":"La cible subit l’état ralenti."}],"spells":[],"abilities":[{"name":"Plongeon en profondeur","text":"Action. Le squale épineux plonge sous l’eau et ne peut plus être la cible d’attaques (mais les sorts et autres effets peuvent encore être utilisés contre lui). Cet avantage dure jusqu’au début du prochain tour de jeu du monstre, ou jusqu’à ce qu’il perde n’importe quelle quantité de Points de Vie."},{"name":"Effet de Crise","text":"Tant que le squale épineux est en Crise, le jet océanique gagne la propriété multi (2)."},{"name":"Vol","text":"Les attaques au corps à corps du squale épineux peuvent toucher les créatures en vol et le squale épineux ne peut être atteint par des attaques au corps à corps que si celles-ci proviennent de créatures également en vol ou bien capables de les toucher. Si le squale épineux subit des dégâts d’un type auquel il est vulnérable, il est immédiatement forcé d’atterrir et perd temporairement les avantages de cette compétence. Le squale reprend son vol à la fin du round. On peut aussi le forcer à atterrir en utilisant une aubaine. Tant qu’il est en Crise, le squale épineux perd tous les avantages octroyés par cette compétence."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Squale épineux' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Cactroll', 'Plante', 'Ces énormes cactus passent le plus clair de leur temps immobiles parmi les dunes du désert, mais s’activent davantage la nuit.', '["Plante","Soldat"]', 'Livre de base', 320, '{"level":15,"species":"Plante","rank":"soldat","champion":null,"traits":["effrayant","énorme","protège son territoire","sensible à l’eau"],"attributes":{"dex":8,"int":6,"pui":12,"vol":6},"hp":90,"crisis":45,"mp":55,"init":7,"def":8,"mdef":6,"affinities":{"air":"RE","terre":"RE","feu":"RE","glace":"VU","lumiere":"RE"},"attacks":[{"name":"Étreinte perforante","ranged":false,"attrs":["pui","pui"],"precision":1,"damage":10,"type":"physique","text":""},{"name":"Rafale d’épines","ranged":true,"attrs":["dex","pui"],"precision":1,"damage":5,"type":"physique","text":""}],"spells":[{"name":"Absorption d’humidité","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie 【PUI + VOL】+1. La cible subit【VH + 15】dégâts de poison. Ensuite, le cactroll récupère un nombre de PV égal à la moitié de ceux que la cible a perdus."}],"abilities":[{"name":"Jus de cactroll","text":"Action. Le cactroll guérit des états ralenti et affaibli. Ensuite, il effectue une attaque gratuite avec Rafale d’épines."},{"name":"Plante","text":"Le cactroll est immunisé contre les états étourdi, enragé et traumatisé."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Cactroll' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Chauve-souris vampire', 'Bête', 'Ces prédateurs de grande taille s’en prennent souvent aux gens et aux animaux. Ils manifestent une intelligence surprenante.', '["Bête","Soldat"]', 'Livre de base', 324, '{"level":5,"species":"Bête","rank":"soldat","champion":null,"traits":["peur de la lumière","agressive","bruyante","maligne"],"attributes":{"dex":10,"int":8,"pui":6,"vol":8},"hp":50,"crisis":25,"mp":45,"init":9,"def":10,"mdef":8,"affinities":{"air":"VU","terre":"RE","poison":"RE"},"attacks":[{"name":"Buveuse de sang","ranged":false,"attrs":["dex","dex"],"precision":0,"damage":5,"type":"physique","text":"Ensuite, la chauve-souris vampire regagne un nombre de PV égal à la moitié de ceux perdus par la cible."},{"name":"Cri perçant","ranged":true,"attrs":["dex","vol"],"precision":0,"damage":5,"type":"air","text":"La cible subit l’état étourdi."}],"spells":[],"abilities":[{"name":"Vol","text":"Voir page 309 pour les effets détaillés de cette compétence."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Chauve-souris vampire' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Garganturat', 'Bête', 'De grands rats qui vivent dans les égouts et les tunnels. Leur morsure peut provoquer une violente fièvre, mais le feu les effraie.', '["Bête","Soldat"]', 'Livre de base', 324, '{"level":5,"species":"Bête","rank":"soldat","champion":null,"traits":["peur du feu","rapide","affamé","féroce"],"attributes":{"dex":12,"int":8,"pui":6,"vol":6},"hp":40,"crisis":20,"mp":35,"init":14,"def":12,"mdef":8,"affinities":{"terre":"RE","feu":"VU","poison":"RE"},"attacks":[{"name":"Vilaine morsure","ranged":false,"attrs":["dex","pui"],"precision":0,"damage":5,"type":"physique","text":"La cible subit l’état empoisonné."}],"spells":[],"abilities":[{"name":"Rat acculé","text":"Tant qu’il est en Crise, le garganturat bénéficie d’un bonus de +3 à tous les tests."},{"name":"Vif","text":"Quand le garganturat remplit ou efface des sections de Cadran visant à s’échapper ou à poursuivre quelqu’un, il peut en remplir ou en effacer une de plus."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Garganturat' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Hurleur gris', 'Bête', 'Souvent dressées comme gardiens, ces grandes créatures canines se révèlent très fidèles envers leurs propriétaires et leurs compagnons.', '["Bête","Soldat"]', 'Livre de base', 325, '{"level":5,"species":"Bête","rank":"soldat","champion":null,"traits":["lourd","résistant","lent","défend son territoire"],"attributes":{"dex":10,"int":8,"pui":8,"vol":6},"hp":50,"crisis":25,"mp":35,"init":9,"def":10,"mdef":8,"affinities":{"air":"RE","glace":"RE"},"attacks":[{"name":"Morsure féroce","ranged":false,"attrs":["dex","pui"],"precision":3,"damage":10,"type":"physique","text":""}],"spells":[],"abilities":[{"name":"Protecteur","text":"Quand un autre personnage est en danger, le hurleur gris peut choisir de prendre sa place (voir compétence Protection page 201)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Hurleur gris' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Tranchenille', 'Bête', 'Un énorme mille-pattes qui peut se rouler en boule pour repousser les attaques, juste avant de se déplier et de mordre.', '["Bête","Soldat"]', 'Livre de base', 325, '{"level":5,"species":"Bête","rank":"soldat","champion":null,"traits":["lourd","résistant","lent","défend son territoire"],"attributes":{"dex":8,"int":6,"pui":10,"vol":8},"hp":60,"crisis":30,"mp":45,"init":7,"def":10,"mdef":7,"affinities":{"tenebres":"RE","terre":"RE","feu":"VU","glace":"VU"},"attacks":[{"name":"Mandibules-ciseaux","ranged":false,"attrs":["dex","pui"],"precision":0,"damage":5,"type":"poison","text":"La cible subit l’état affaibli."},{"name":"Boule tranchante","ranged":false,"attrs":["dex","pui"],"precision":0,"damage":5,"type":"physique","text":"Si la tranchenille a réalisé l’action Garde à son tour précédent, cette attaque inflige 5 dégâts de plus."}],"spells":[],"abilities":[{"name":"Boule de chitine","text":"Quand la tranchenille effectue l’action Garde, elle reçoit l’immunité aux dégâts physiques jusqu’à la fin de son prochain tour."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Tranchenille' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Fourmi-bombardier', 'Bête', 'Ces fourmis de taille humaine ne sont qu’une extension de la volonté de leur reine, une mystérieuse créature qui se niche dans les entrailles de la terre.', '["Bête","Soldat"]', 'Livre de base', 326, '{"level":10,"species":"Bête","rank":"soldat","champion":null,"traits":["explosive","inflammable","drone","défend son territoire"],"attributes":{"dex":10,"int":6,"pui":10,"vol":6},"hp":70,"crisis":35,"mp":40,"init":12,"def":10,"mdef":6,"affinities":{"foudre":"RE","feu":"VU","lumiere":"RE"},"attacks":[{"name":"Frappe formique","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":10,"type":"physique","text":""},{"name":"Canon formique","ranged":true,"attrs":["dex","int"],"precision":1,"damage":5,"type":"physique","text":"La cible subit l’état étourdi."}],"spells":[],"abilities":[{"name":"Fouissage","text":"Quand la fourmi-bombardier effectue l’action Garde, si elle se trouve sur de la terre, du sable ou de la roche, elle bénéficie d’un bonus de Défense de +2 et devient vulnérable aux dégâts de terre jusqu’au début de son prochain tour."},{"name":"Esprit vide","text":"La fourmi-bombardier est immunisée contre les états étourdi et enragé."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Fourmi-bombardier' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Poisson épineux', 'Bête', 'Guère plus longs que le bras, ces poissons se servent de leurs nageoires pour voler sur de courtes distances et infliger de féroces morsures.', '["Bête","Soldat"]', 'Livre de base', 326, '{"level":10,"species":"Bête","rank":"soldat","champion":null,"traits":["agressif","vif","petit","peau épaisse"],"attributes":{"dex":10,"int":10,"pui":6,"vol":6},"hp":50,"crisis":25,"mp":40,"init":14,"def":10,"mdef":10,"affinities":{"foudre":"VU","tenebres":"RE","feu":"RE","glace":"RE","poison":"RE"},"attacks":[{"name":"Plongeon épineux","ranged":false,"attrs":["dex","dex"],"precision":1,"damage":10,"type":"physique","text":""},{"name":"Jet océanique","ranged":true,"attrs":["dex","int"],"precision":1,"damage":5,"type":"glace","text":"La cible subit l’état ralenti."}],"spells":[],"abilities":[{"name":"Vol","text":"Voir page 309 pour les effets détaillés de cette compétence."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Poisson épineux' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Ours solaire', 'Bête', 'Cet animal compte parmi les plus grands et les plus intelligents du monde. Certains spécimens seraient capables de télépathie.', '["Bête","Soldat"]', 'Livre de base', 327, '{"level":15,"species":"Bête","rank":"soldat","champion":null,"traits":["velu","énorme","paisible","intelligent"],"attributes":{"dex":8,"int":8,"pui":10,"vol":6},"hp":80,"crisis":40,"mp":45,"init":8,"def":9,"mdef":10,"affinities":{"foudre":"RE","tenebres":"VU","terre":"VU","feu":"RE","glace":"RE","lumiere":"RE"},"attacks":[{"name":"Étreinte","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":10,"type":"physique","text":"La cible subit l’état affaibli."}],"spells":[],"abilities":[{"name":"Puissant","text":"L’ours solaire est immunisé contre les états ralenti et affaibli."},{"name":"Éruption solaire","text":"Tant que l’ours solaire est en Crise, son étreinte inflige 5 dégâts de plus, et tous les dégâts de cette attaque sont de type feu."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Ours solaire' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Hurleur blanc', 'Bête', 'On voit rarement des hurleurs blancs dans les zones urbaines, car ils préfèrent les montagnes et les forêts. Ils sont d’une beauté à couper le souffle.', '["Bête","Soldat"]', 'Livre de base', 327, '{"level":20,"species":"Bête","rank":"soldat","champion":null,"traits":["courageux","rusé","majestueux","vigilant"],"attributes":{"dex":8,"int":8,"pui":10,"vol":8},"hp":90,"crisis":45,"mp":60,"init":8,"def":10,"mdef":9,"affinities":{"air":"RE","feu":"VU","glace":"RE"},"attacks":[{"name":"Gueule blanche","ranged":false,"attrs":["dex","pui"],"precision":5,"damage":15,"type":"physique","text":"La cible subit l’état affaibli."}],"spells":[{"name":"Iceberg","cost":"20 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie 【PUI + VOL】+2. La cible subit【VH + 30】dégâts de glace. Ces dégâts ignorent les résistances."},{"name":"Lécher les plaies","cost":"5 PM","target":"Soi","duration":"Instantanée","offensive":false,"text":"Le hurleur blanc regagne 30 Points de Vie (40 s’il est de niveau 40+, 50 s’il est de niveau 60+)."}],"abilities":[{"name":"Aura de majesté","text":"Les alliés du hurleur blanc sont immunisés contre l’état traumatisé."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Hurleur blanc' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Lanterne arcanique', 'Créature artificielle', 'Certains mages utilisent ces créatures comme source de magie. Elles peuvent même parfois se battre pour eux.', '["Construct","Soldat"]', 'Livre de base', 328, '{"level":5,"species":"Construct","rank":"soldat","champion":null,"traits":["lumineuse","serviable","magique","minuscule"],"attributes":{"dex":8,"int":8,"pui":6,"vol":10},"hp":40,"crisis":20,"mp":55,"init":8,"def":9,"mdef":10,"affinities":{"physique":"VU","terre":"RE","feu":"RE","glace":"RE","poison":"IM"},"attacks":[{"name":"Décharge élémentaire","ranged":true,"attrs":["dex","int"],"precision":0,"damage":5,"type":null,"text":"Quand la lanterne arcanique effectue son attaque, lancez un d6 pour déterminer le type des dégâts : 1-2 foudre ; 3-4 feu ; 5-6 glace."}],"spells":[],"abilities":[{"name":"Transfert de mana","text":"Action. La lanterne arcanique peut utiliser une action et dépenser jusqu’à 10 Points de Magie pour choisir une autre créature qu’elle voit et redonner autant de magie de vie à cette dernière."},{"name":"Créature artificielle","text":"La lanterne est immunisée contre l’état empoisonné."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Lanterne arcanique' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Bouffon bafoué', 'Créature artificielle', 'Ce jouet abandonné est habité par des esprits abjects. Peut-être cherche-t-il simplement des compagnons de jeu ?', '["Construct","Soldat"]', 'Livre de base', 328, '{"level":10,"species":"Construct","rank":"soldat","champion":null,"traits":["effrayant","bruyant","petit","vengeur"],"attributes":{"dex":8,"int":10,"pui":8,"vol":6},"hp":60,"crisis":30,"mp":50,"init":13,"def":8,"mdef":10,"affinities":{"air":"VU","terre":"RE","feu":"RE","poison":"IM"},"attacks":[{"name":"Coup de pied du bouffon","ranged":false,"attrs":["dex","int"],"precision":1,"damage":5,"type":"physique","text":"Cette attaque inflige 5 dégâts de plus aux cibles étourdies ou traumatisées."}],"spells":[{"name":"Danse du bouffon","cost":"20 PM","target":"Spécial","duration":"Instantanée","offensive":false,"text":"Le bouffon bafoué choisit autant de créatures qu’il veut parmi celles qu’il voit. Toutes subissent l’état traumatisé."}],"abilities":[{"name":"Créature artificielle","text":"Le bouffon bafoué est immunisé contre l’état empoisonné."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Bouffon bafoué' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Gargouille', 'Créature artificielle', 'Malgré leur poids, les gargouilles peuvent léviter grâce à de modestes pouvoirs magiques. Elles font d’excellents gardiens.', '["Construct","Soldat"]', 'Livre de base', 329, '{"level":10,"species":"Construct","rank":"soldat","champion":null,"traits":["liée à un lieu","rusée","lévitation","vigilante"],"attributes":{"dex":10,"int":8,"pui":8,"vol":6},"hp":70,"crisis":35,"mp":50,"init":9,"def":10,"mdef":8,"affinities":{"air":"RE","terre":"RE","feu":"RE","glace":"VU","poison":"IM"},"attacks":[{"name":"Griffes de pierre","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":5,"type":"physique","text":"Cette attaque se fait contre la Défense magique."}],"spells":[{"name":"Volée de pierres","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie 【PUI + VOL】+1. La cible subit【VH + 15】dégâts de terre et l’effet étourdi."}],"abilities":[{"name":"Créature artificielle","text":"La gargouille est immunisée contre l’état empoisonné."},{"name":"Vol","text":"Voir page 309 pour les effets détaillés de cette compétence."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Gargouille' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Soldat technomagique', 'Créature artificielle', 'Une armure animée par l’énergie spirituelle. Très puissant au combat, mais emploie des stratégies prévisibles.', '["Construct","Soldat"]', 'Livre de base', 329, '{"level":10,"species":"Construct","rank":"soldat","champion":null,"traits":["loyal","prévisible","impitoyable","vigilant"],"attributes":{"dex":8,"int":8,"pui":10,"vol":6},"hp":80,"crisis":40,"mp":40,"init":5,"def":11,"mdef":8,"affinities":{"air":"VU","foudre":"VU","terre":"RE","feu":"RE","glace":"RE","poison":"IM"},"attacks":[{"name":"Coup de hache","ranged":false,"attrs":["pui","pui"],"precision":1,"damage":14,"type":"physique","text":"La cible subit l’état affaibli."}],"spells":[],"abilities":[{"name":"Équipement","text":"Hache de guerre, plates de bronze."},{"name":"Créature artificielle","text":"Le soldat technomagique est immunisé contre l’état empoisonné."},{"name":"Noyau d’alimentation à nu","text":"Tant qu’il est en Crise, le soldat technomagique perd sa résistance aux dégâts de feu et de glace, et tous les dégâts infligés par son coup de hache prennent le type foudre."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Soldat technomagique' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Golem de bronze', 'Créature artificielle', 'Ces automates mécaniques servent souvent de gardiens aux aristocrates et aux marchands. Bien qu’imposants, ils sont lents.', '["Construct","Soldat"]', 'Livre de base', 330, '{"level":15,"species":"Construct","rank":"soldat","champion":null,"traits":["cliquète","démarche menaçante","puissant","lent"],"attributes":{"dex":6,"int":8,"pui":12,"vol":6},"hp":100,"crisis":50,"mp":45,"init":7,"def":8,"mdef":9,"affinities":{"air":"VU","foudre":"VU","terre":"RE","poison":"IM"},"attacks":[{"name":"Coup de poing","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":10,"type":"physique","text":"La cible subit l’état étourdi."},{"name":"Tourbillon","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":5,"type":"air","text":"Cette attaque a la propriété multi (2)."}],"spells":[],"abilities":[{"name":"Créature artificielle","text":"Le golem de bronze est immunisé contre l’état empoisonné."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Golem de bronze' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Volatilame', 'Créature artificielle', 'Comptant souvent parmi les troupes aériennes de vastes empires, les volatilames transportent un véritable arsenal d’armes technomagiques.', '["Construct","Soldat"]', 'Livre de base', 330, '{"level":15,"species":"Construct","rank":"soldat","champion":null,"traits":["rapide","volant","lourdement armé","loyal"],"attributes":{"dex":10,"int":8,"pui":8,"vol":6},"hp":80,"crisis":40,"mp":45,"init":9,"def":10,"mdef":8,"affinities":{"air":"VU","foudre":"VU","terre":"RE","feu":"IM","glace":"VU","poison":"IM"},"attacks":[{"name":"Plongeon-rasoir","ranged":false,"attrs":["dex","dex"],"precision":1,"damage":10,"type":"physique","text":"Après avoir effectué cette attaque, le volatilame perd tous les avantages octroyés par la compétence Vol jusqu’au début de son prochain tour."},{"name":"Mitrailleuse","ranged":true,"attrs":["dex","int"],"precision":1,"damage":5,"type":"physique","text":"Cette attaque a la propriété multi (2)."},{"name":"Missile incendiaire","ranged":true,"attrs":["dex","int"],"precision":1,"damage":10,"type":"feu","text":""}],"spells":[],"abilities":[{"name":"Créature artificielle","text":"Le volatilame est immunisé contre l’état empoisonné."},{"name":"Comme un missile","text":"Le volatilame est immunisé contre les états ralenti et affaibli."},{"name":"Vol","text":"Voir page 309 pour les effets détaillés de cette compétence."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Volatilame' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Golem forestier', 'Créature artificielle', 'Druides et sorcières fabriquent souvent ces créatures composites pour qu’elles protègent des sites sacrés.', '["Construct","Soldat"]', 'Livre de base', 331, '{"level":20,"species":"Construct","rank":"soldat","champion":null,"traits":["sans émotion","inflammable","solitaire","immense"],"attributes":{"dex":6,"int":6,"pui":12,"vol":10},"hp":110,"crisis":55,"mp":80,"init":6,"def":6,"mdef":6,"affinities":{"air":"RE","foudre":"RE","terre":"RE","feu":"VU","glace":"VU","poison":"IM"},"attacks":[{"name":"Griffes d’écorce","ranged":false,"attrs":["pui","pui"],"precision":2,"damage":10,"type":"physique","text":"Cette attaque a la propriété multi (2)."},{"name":"Rafale vitale","ranged":true,"attrs":["dex","pui"],"precision":2,"damage":15,"type":"lumiere","text":""}],"spells":[{"name":"Dissipation","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":false,"text":"Si la cible était affectée par un ou plusieurs sorts dont la durée est « scène », elle ne l’est plus désormais."},{"name":"Souffle de spores","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie 【PUI + VOL】+2. La cible subit【VH + 15】dégâts de poison et l’état affaibli."},{"name":"Explosion de vrilles végétales","cost":"20 PM","target":"Spécial","duration":"Instantanée","offensive":false,"text":"Le golem choisit autant de créatures qu’il souhaite parmi celles qu’il voit : toutes subissent l’état traumatisé."}],"abilities":[{"name":"Créature artificielle","text":"Le golem forestier est immunisé contre l’état empoisonné."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Golem forestier' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Diablotin', 'Démon', 'Le plus faible de tous les démons. Les diablotins naissent des pensées obscures d’une personne ou d’une petite communauté. Ce sont des lâches.', '["Démon","Soldat"]', 'Livre de base', 332, '{"level":5,"species":"Démon","rank":"soldat","champion":null,"traits":["lâche","rusé","facétieux","corrompu"],"attributes":{"dex":8,"int":8,"pui":6,"vol":10},"hp":50,"crisis":25,"mp":55,"init":8,"def":8,"mdef":8,"affinities":{"tenebres":"RE","feu":"IM","glace":"RE","lumiere":"VU"},"attacks":[{"name":"Ongles glacés","ranged":false,"attrs":["dex","vol"],"precision":0,"damage":5,"type":"glace","text":"Cette attaque se fait contre la Défense magique."}],"spells":[{"name":"Provocation","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie 【INT + VOL】. La cible subit l’état enragé et ne peut pas effectuer l’action Garde ou Sort à son prochain tour."},{"name":"Carapace","cost":"10 PM","target":"Soi","duration":"Scène","offensive":false,"text":"Jusqu’à ce que l’effet de ce sort cesse, le diablotin gagne une résistance aux dégâts physiques."}],"abilities":[],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Diablotin' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Roue de foudre', 'Démon', 'Né des craintes des voyageurs, ce démon cruel se déplace à l’intérieur d’une grande roue de bois entourée d’éclairs.', '["Démon","Soldat"]', 'Livre de base', 332, '{"level":10,"species":"Démon","rank":"soldat","champion":null,"traits":["voyant","ricanant","cruel","rapide"],"attributes":{"dex":12,"int":6,"pui":6,"vol":8},"hp":60,"crisis":30,"mp":60,"init":9,"def":12,"mdef":6,"affinities":{"foudre":"AB","tenebres":"RE","terre":"VU"},"attacks":[{"name":"Virage serré","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":10,"type":"physique","text":""}],"spells":[{"name":"Fulgur","cost":"10 × C PM","target":"Jusqu’à 3 créatures","duration":"Instantanée","offensive":true,"text":"Test de magie 【INT + VOL】+1. Chaque cible subit【VH + 15】dégâts de foudre. Aubaine : chaque cible subit l’état étourdi."}],"abilities":[{"name":"Vif","text":"Quand la roue de foudre remplit ou efface des sections de Cadran visant à s’échapper ou à poursuivre quelqu’un, elle peut en remplir ou en effacer deux de plus."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Roue de foudre' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Hurleur d’ombre', 'Démon', 'Cet énorme chien apparaîtrait après une grande catastrophe. Ces créatures ne sont pas malveillantes, mais simplement annonciatrices de tragédies.', '["Démon","Soldat"]', 'Livre de base', 333, '{"level":15,"species":"Démon","rank":"soldat","champion":null,"traits":["effroyable","grand","silencieux","surnaturel"],"attributes":{"dex":8,"int":6,"pui":10,"vol":8},"hp":80,"crisis":40,"mp":55,"init":7,"def":9,"mdef":8,"affinities":{"foudre":"VU","tenebres":"RE","feu":"RE"},"attacks":[{"name":"Morsure spectrale","ranged":false,"attrs":["dex","pui"],"precision":4,"damage":10,"type":"physique","text":"L’attaque se fait contre la Défense magique."}],"spells":[{"name":"Souffle de braise","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie 【PUI + VOL】+1. La cible subit【VH + 15】dégâts de feu et l’état affaibli."},{"name":"Hurlements de tragédie","cost":"5 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie 【PUI + VOL】+1. La cible subit l’état traumatisé."}],"abilities":[],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Hurleur d’ombre' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Echidna', 'Démon', 'Ces dangereux démons incarnent la suspicion et le conflit. Leurs jambes se terminent par des serpents qui grouillent.', '["Démon","Soldat"]', 'Livre de base', 333, '{"level":20,"species":"Démon","rank":"soldat","champion":null,"traits":["astucieuse","instruite","rampante","énigmatique"],"attributes":{"dex":8,"int":10,"pui":6,"vol":10},"hp":70,"crisis":35,"mp":80,"init":9,"def":8,"mdef":10,"affinities":{"air":"VU","tenebres":"RE","feu":"IM","glace":"RE","lumiere":"VU"},"attacks":[{"name":"Nœuds de vipère","ranged":false,"attrs":["dex","int"],"precision":5,"damage":15,"type":"poison","text":""},{"name":"Regard glacé","ranged":true,"attrs":["dex","vol"],"precision":5,"damage":10,"type":"glace","text":"La cible ne peut pas effectuer l’action Objectif à son prochain tour. Cette attaque se fait contre la Défense magique."}],"spells":[{"name":"Fonte de l’esprit","cost":"5 × C PM","target":"Jusqu’à 3 créatures","duration":"Instantanée","offensive":true,"text":"Test de magie 【INT + VOL】+2. Chaque cible perd【VH + 10】Points de Magie."}],"abilities":[{"name":"Éloquence","text":"L’echidna bénéficie d’un bonus de +3 aux tests opposés lors des occasions sociales."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Echidna' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Éclat du chaos', 'Élémentaire', 'Fragment d’énergie négative. Dénué de pensée, il se contente de se nourrir de matière en décomposition et d’énergie résiduelle.', '["Élémentaire","Soldat"]', 'Livre de base', 334, '{"level":5,"species":"Élémentaire","rank":"soldat","champion":null,"traits":["étranger à ce monde","affamé","petit","répand l’obscurité"],"attributes":{"dex":8,"int":10,"pui":8,"vol":6},"hp":50,"crisis":25,"mp":35,"init":9,"def":8,"mdef":10,"affinities":{"air":"VU","tenebres":"IM","feu":"RE","glace":"RE","lumiere":"VU","poison":"IM"},"attacks":[{"name":"Fléchette de chaos","ranged":true,"attrs":["dex","int"],"precision":0,"damage":5,"type":"tenebres","text":"La cible subit l’état affaibli."}],"spells":[],"abilities":[{"name":"Élémentaire","text":"L’éclat du chaos est immunisé contre l’état empoisonné."},{"name":"Esprit vide","text":"L’éclat du chaos est immunisé contre les états étourdi, enragé et traumatisé."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Éclat du chaos' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Pixie du chêne', 'Élémentaire', 'Ces fées se rassemblent là où la force de la vie pure s’écoule. Si cette énergie venait à être souillée, la rage leur obscurcirait l’esprit.', '["Élémentaire","Soldat"]', 'Livre de base', 334, '{"level":5,"species":"Élémentaire","rank":"soldat","champion":null,"traits":["curieux","lumineux","bienveillant","espiègle"],"attributes":{"dex":10,"int":6,"pui":6,"vol":10},"hp":40,"crisis":20,"mp":55,"init":8,"def":10,"mdef":6,"affinities":{"air":"VU","tenebres":"VU","terre":"IM","lumiere":"IM","poison":"IM"},"attacks":[{"name":"Aiguille pointue","ranged":false,"attrs":["dex","dex"],"precision":0,"damage":5,"type":"physique","text":"Cette attaque inflige 5 dégâts de plus aux cibles ralenties."}],"spells":[{"name":"Enchevêtrement","cost":"5 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie 【INT + VOL】. La cible subit l’état ralenti."},{"name":"Guérison","cost":"10 × C PM","target":"Jusqu’à 3 créatures","duration":"Instantanée","offensive":false,"text":"Chaque cible regagne 40 Points de Vie (50 si le pixie est de niveau 20+, 60 s’il est de niveau 40+)."}],"abilities":[{"name":"Élémentaire","text":"Le pixie du chêne est immunisé contre l’état empoisonné."},{"name":"Vol","text":"Voir page 309 pour les effets détaillés de cette compétence."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Pixie du chêne' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Grenado', 'Élémentaire', 'Nés près des feux de forêt ou des fourneaux industriels, ces élémentaires instables incarnent les qualités les plus destructrices du feu.', '["Élémentaire","Soldat"]', 'Livre de base', 335, '{"level":10,"species":"Élémentaire","rank":"soldat","champion":null,"traits":["lumineux","nerveux","brûlant","instable"],"attributes":{"dex":8,"int":6,"pui":8,"vol":10},"hp":60,"crisis":30,"mp":60,"init":7,"def":9,"mdef":8,"affinities":{"terre":"VU","feu":"AB","glace":"VU","poison":"IM"},"attacks":[{"name":"Rot enflammé","ranged":false,"attrs":["dex","vol"],"precision":1,"damage":10,"type":"feu","text":"La cible perd la résistance aux dégâts de feu jusqu''à la fin du prochain tour du grenado."}],"spells":[],"abilities":[{"name":"Détonation","text":"Une fois réduit à 0 PV, le grenado explose en infligeant des dégâts mineurs (10) de feu à toute créature présente dans la scène. S''il est réduit à 0 PV par des dégâts de glace, il n''explose pas."},{"name":"Élémentaire","text":"Le grenado est immunisé contre l''état empoisonné."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Grenado' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Vase électrostatique', 'Élémentaire', 'Ces créatures sont souvent créées par des scientifiques technomages et des magiciens : ce ne sont guère plus que des batteries magiques visqueuses.', '["Élémentaire","Soldat"]', 'Livre de base', 335, '{"level":10,"species":"Élémentaire","rank":"soldat","champion":null,"traits":["vorace","lente","molle","électrostatique"],"attributes":{"dex":6,"int":6,"pui":10,"vol":10},"hp":70,"crisis":35,"mp":70,"init":6,"def":7,"mdef":8,"affinities":{"physique":"RE","foudre":"AB","terre":"VU","feu":"RE","poison":"IM"},"attacks":[{"name":"Frappe gélatineuse","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":5,"type":"physique","text":""}],"spells":[{"name":"Vague électrostatique","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie : 【PUI + VOL】+1. La cible subit【VH + 15】dégâts de foudre et subit l''état ralenti."}],"abilities":[{"name":"Élémentaire","text":"La vase électrostatique est immunisée contre l''état empoisonné."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Vase électrostatique' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Flocon à pointe', 'Élémentaire', 'Des pointes de glace émergent et se rétractent à la surface de ces sphères de pure magie hivernale grandes comme des tonneaux.', '["Élémentaire","Soldat"]', 'Livre de base', 336, '{"level":15,"species":"Élémentaire","rank":"soldat","champion":null,"traits":["peur de la chaleur","lévitation","glacé","tournoyant"],"attributes":{"dex":8,"int":10,"pui":6,"vol":8},"hp":70,"crisis":35,"mp":65,"init":9,"def":9,"mdef":12,"affinities":{"foudre":"VU","feu":"VU","glace":"AB","poison":"IM"},"attacks":[{"name":"Engelure","ranged":false,"attrs":["dex","int"],"precision":1,"damage":5,"type":"glace","text":""}],"spells":[{"name":"Souffle de givre","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie : 【INT + VOL】+4. La cible subit【VH + 15】dégâts de glace et subit l''état affaibli."}],"abilities":[{"name":"Élémentaire","text":"Le flocon à pointes est immunisé contre l''état empoisonné."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Flocon à pointe' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Nymphe', 'Élémentaire', 'Ces esprits vivent dans les bois, les lacs, les montagnes et les cours d''eau. Bien que généralement pacifiques, ils défendent farouchement leur demeure.', '["Élémentaire","Soldat"]', 'Livre de base', 336, '{"level":15,"species":"Élémentaire","rank":"soldat","champion":null,"traits":["rapide","défend son territoire","prudent","sage"],"attributes":{"dex":8,"int":10,"pui":6,"vol":8},"hp":70,"crisis":35,"mp":55,"init":9,"def":8,"mdef":10,"affinities":{"terre":"IM","feu":"RE","glace":"RE","poison":"IM"},"attacks":[{"name":"Contact des saisons","ranged":false,"attrs":["dex","int"],"precision":1,"damage":10,"type":"air","text":"Les créatures touchées par cette attaque subissent un état qui dépend de la saison en cours : étourdi au printemps, traumatisé en hiver, ralenti en automne et affaibli en été."}],"spells":[],"abilities":[{"name":"Élémentaire","text":"La nymphe est immunisée contre l''état empoisonné."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Nymphe' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Sangliroc', 'Élémentaire', 'Énorme formation rocheuse animée. Après des siècles d''immobilité, le sangliroc peut soudain se dresser et semer la destruction.', '["Élémentaire","Soldat"]', 'Livre de base', 337, '{"level":20,"species":"Élémentaire","rank":"soldat","champion":null,"traits":["destructeur","irritable","énorme","rocheux"],"attributes":{"dex":8,"int":6,"pui":12,"vol":8},"hp":110,"crisis":55,"mp":60,"init":7,"def":8,"mdef":6,"affinities":{"air":"VU","foudre":"RE","terre":"IM","poison":"IM"},"attacks":[{"name":"Charge rocheuse","ranged":false,"attrs":["dex","pui"],"precision":2,"damage":15,"type":"physique","text":"Cette attaque a la propriété multi (2). Si elle manque une de ses cibles, le sangliroc perd une quantité mineure (20) de Points de Vie."},{"name":"Défense rocheuse","ranged":false,"attrs":["pui","pui"],"precision":2,"damage":10,"type":"physique","text":""}],"spells":[{"name":"Volée de roches","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie : 【PUI + VOL】+2. La cible subit【VH + 20】dégâts de terre et l''état étourdi."},{"name":"Terra","cost":"10 × C PM","target":"Jusqu''à 3 créatures","duration":"Instantanée","offensive":true,"text":"Test de magie : 【PUI + VOL】+2. Chaque cible subit【VH + 20】dégâts de terre. Ce sort ne peut pas viser des créatures qui volent, lévitent, tombent ou se trouvent dans les airs pour quelque raison que ce soit. Aubaine : chaque cible touchée par ce sort effectue une action de moins à son prochain tour (pour un minimum de 0 action)."}],"abilities":[{"name":"Grognement de colère (autre action)","text":"À son prochain tour, le sangliroc est obligé d''effectuer Charge rocheuse, et chaque cible touchée par l''attaque subit l''état traumatisé."},{"name":"Élémentaire","text":"Le sangliroc est immunisé contre l''état empoisonné."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Sangliroc' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Brigand', 'Humanoïde', 'Très courants sur les routes moins surveillées, les brigands s''en prennent aux voyageurs solitaires et aux petites caravanes.', '["Humanoïde","Soldat"]', 'Livre de base', 338, '{"level":5,"species":"Humanoïde","rank":"soldat","champion":null,"traits":["vantard","irritable","fier","fort"],"attributes":{"dex":6,"int":8,"pui":10,"vol":8},"hp":60,"crisis":30,"mp":45,"init":10,"def":9,"mdef":9,"affinities":{"terre":"RE","glace":"RE"},"attacks":[{"name":"Hache de brigand","ranged":false,"attrs":["pui","pui"],"precision":0,"damage":10,"type":"physique","text":""}],"spells":[],"abilities":[{"name":"Équipement","text":"hache large, bouclier de bronze, tenue de voyage"},{"name":"Mauvaise humeur","text":"Tant qu''il est en Crise, le brigand devient immunisé contre tous les états."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Brigand' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Éclaireur kobold', 'Humanoïde', 'Ces minuscules créatures couvertes d''un pelage épais et noir vivent essentiellement dans les forêts et les zones montagneuses.', '["Humanoïde","Soldat"]', 'Livre de base', 338, '{"level":5,"species":"Humanoïde","rank":"soldat","champion":null,"traits":["rapide","velu","perceptions aiguisées","petit"],"attributes":{"dex":10,"int":8,"pui":6,"vol":8},"hp":40,"crisis":20,"mp":45,"init":8,"def":11,"mdef":9,"affinities":{"air":"RE","feu":"RE"},"attacks":[{"name":"Dague en acier","ranged":false,"attrs":["dex","int"],"precision":1,"damage":4,"type":"physique","text":"Cette attaque inflige 5 dégâts de plus aux cibles sous l''effet d''un ou plusieurs états."},{"name":"Pierre","ranged":true,"attrs":["dex","pui"],"precision":0,"damage":5,"type":"physique","text":"La cible subit l''état étourdi."}],"spells":[],"abilities":[{"name":"Équipement","text":"dague en acier, tenue de voyage"}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Éclaireur kobold' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Garde', 'Humanoïde', 'Ces soldats patrouillent généralement dans les rues des villes ou escortent des caravanes dans la nature.', '["Humanoïde","Soldat"]', 'Livre de base', 339, '{"level":5,"species":"Humanoïde","rank":"soldat","champion":null,"traits":["courageux","discipliné","loyal","entraîné"],"attributes":{"dex":8,"int":8,"pui":8,"vol":8},"hp":60,"crisis":30,"mp":45,"init":5,"def":11,"mdef":8,"affinities":{},"attacks":[{"name":"Lance lourde","ranged":false,"attrs":["dex","pui"],"precision":0,"damage":12,"type":"physique","text":""},{"name":"Arbalète","ranged":true,"attrs":["dex","int"],"precision":0,"damage":8,"type":"physique","text":""}],"spells":[],"abilities":[{"name":"Équipement","text":"lance lourde, arbalète, plates de bronze"},{"name":"Formation défensive","text":"Le garde reçoit un bonus de +1 à la Défense et à la Défense magique tant qu''il reste au moins un autre garde impliqué dans le conflit."},{"name":"Protecteur","text":"Quand un autre personnage est en danger, le garde peut choisir de prendre sa place (voir compétence Protection page 201)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Garde' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Sorcier kobold', 'Humanoïde', 'Certains kobolds développent un lien avec les bêtes et les monstres, dont ils apprennent les capacités et qu''ils utilisent pour renforcer leurs alliés.', '["Humanoïde","Soldat"]', 'Livre de base', 339, '{"level":5,"species":"Humanoïde","rank":"soldat","champion":null,"traits":["énigmatique","velu","petit","sage"],"attributes":{"dex":8,"int":8,"pui":6,"vol":10},"hp":50,"crisis":25,"mp":55,"init":6,"def":9,"mdef":10,"affinities":{"air":"RE","lumiere":"RE"},"attacks":[{"name":"Bâton en chêne","ranged":false,"attrs":["vol","vol"],"precision":0,"damage":6,"type":"physique","text":""}],"spells":[{"name":"Éveil","cost":"20 PM","target":"Une créature","duration":"Scène","offensive":false,"text":"Le kobold choisit un attribut : Dextérité, Intuition, Puissance ou Volonté. Jusqu''à ce que l''effet du sort s''achève, la cible fait comme si la taille de dé de cet attribut était supérieure d''un cran (jusqu''à un maximum de d12)."},{"name":"Mauvaise haleine","cost":"5 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie : 【INT + VOL】. La cible subit【VH + 10】dégâts de poison."}],"abilities":[{"name":"Équipement","text":"bâton, robe de sage"}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Sorcier kobold' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Apidé', 'Humanoïde', 'Mi-abeilles mi-humaines, ces créatures ont développé un artisanat qui leur est propre, mais tendent à rester isolées du reste du monde.', '["Humanoïde","Soldat"]', 'Livre de base', 340, '{"level":10,"species":"Humanoïde","rank":"soldat","champion":null,"traits":["bourdonnant","industrieux","esthète","mystérieux"],"attributes":{"dex":10,"int":8,"pui":8,"vol":6},"hp":70,"crisis":35,"mp":50,"init":11,"def":11,"mdef":10,"affinities":{"air":"RE","feu":"VU","poison":"RE"},"attacks":[{"name":"Lame de la ruche","ranged":false,"attrs":["dex","int"],"precision":5,"damage":10,"type":"physique","text":""}],"spells":[{"name":"Danse de l''abeille","cost":"20 PM","target":"Une créature","duration":"Instantanée","offensive":false,"text":"La cible peut immédiatement effectuer une attaque gratuite avec une arme dont elle est équipée (ou avec une attaque de base si la cible est un PNJ)."}],"abilities":[{"name":"Équipement","text":"katana, robe de sage"},{"name":"Vol","text":"Voir page 309 pour les effets détaillés de cette compétence (vol ou lévitation)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Apidé' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Mercenaire', 'Humanoïde', 'Les mercenaires sont des experts en survie et en combat. Leurs capacités et leur équipement en font de redoutables menaces.', '["Humanoïde","Soldat"]', 'Livre de base', 340, '{"level":10,"species":"Humanoïde","rank":"soldat","champion":null,"traits":["compétent","austère","blasé","impitoyable"],"attributes":{"dex":8,"int":8,"pui":8,"vol":8},"hp":60,"crisis":30,"mp":50,"init":5,"def":11,"mdef":9,"affinities":{"air":"RE","terre":"VU","feu":"RE"},"attacks":[{"name":"Épée de bronze","ranged":false,"attrs":["dex","pui"],"precision":5,"damage":11,"type":"physique","text":""},{"name":"Pistolet","ranged":true,"attrs":["dex","int"],"precision":4,"damage":8,"type":"physique","text":""}],"spells":[],"abilities":[{"name":"Équipement","text":"épée de bronze, pistolet, plates runiques"},{"name":"Attaque chargée (autre action)","text":"La prochaine attaque du mercenaire gagne la propriété multi (2) et ignore les résistances."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Mercenaire' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Tireur embusqué', 'Humanoïde', 'Ceux-ci couvrent les arrières d''une troupe ou éliminent des cibles spécifiques pour une armée. Ils ne sont guère doués pour le combat rapproché.', '["Humanoïde","Soldat"]', 'Livre de base', 341, '{"level":15,"species":"Humanoïde","rank":"soldat","champion":null,"traits":["précis","discipliné","furtif","observateur"],"attributes":{"dex":10,"int":10,"pui":6,"vol":6},"hp":60,"crisis":30,"mp":45,"init":13,"def":11,"mdef":11,"affinities":{"foudre":"RE","feu":"RE","glace":"VU"},"attacks":[{"name":"Dague","ranged":false,"attrs":["dex","int"],"precision":5,"damage":4,"type":"physique","text":""},{"name":"Arc de tireur embusqué","ranged":true,"attrs":["dex","dex"],"precision":4,"damage":8,"type":"physique","text":"La cible subit l''état étourdi ou ralenti (au choix du tireur embusqué)."}],"spells":[],"abilities":[{"name":"Équipement","text":"arc court, dague en acier, tenue de voyage"}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Tireur embusqué' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Mage de guerre', 'Humanoïde', 'Vêtus d''une armure runique et dotés de toutes sortes de sortilèges offensifs et de soutien, les mages de guerre dirigent souvent des troupes de guerriers.', '["Humanoïde","Soldat"]', 'Livre de base', 341, '{"level":20,"species":"Humanoïde","rank":"soldat","champion":null,"traits":["ambitieux","rusé","discipliné","instruit"],"attributes":{"dex":8,"int":8,"pui":8,"vol":10},"hp":80,"crisis":40,"mp":90,"init":9,"def":11,"mdef":9,"affinities":{"feu":"RE","glace":"RE"},"attacks":[{"name":"Bâton décoré","ranged":false,"attrs":["vol","vol"],"precision":2,"damage":11,"type":"physique","text":""}],"spells":[{"name":"Fulgur","cost":"10 × C PM","target":"Jusqu''à 3 créatures","duration":"Instantanée","offensive":true,"text":"Test de magie : 【INT + VOL】+5. Chaque cible subit【VH + 20】dégâts de foudre. Aubaine : chaque cible subit l''état étourdi."},{"name":"Soins","cost":"10 × C PM","target":"Jusqu''à 3 créatures","duration":"Instantanée","offensive":false,"text":"Chaque cible regagne 40 Points de Vie (50 si le mage est de niveau 20+, 60 s''il est de niveau 40+)."}],"abilities":[{"name":"Équipement","text":"bâton, plates runiques"}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Mage de guerre' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Cait sith', 'Monstre', 'Quand un chat meurt en hiver, un esprit peut prendre possession de son corps, en le transformant en un cait sith magique.', '["Monstre","Soldat"]', 'Livre de base', 342, '{"level":5,"species":"Monstre","rank":"soldat","champion":null,"traits":["curieux","espiègle","malin","minuscule"],"attributes":{"dex":8,"int":8,"pui":6,"vol":10},"hp":40,"crisis":20,"mp":65,"init":12,"def":9,"mdef":10,"affinities":{"foudre":"VU","feu":"RE","glace":"RE","poison":"VU"},"attacks":[{"name":"Coup de griffes","ranged":false,"attrs":["dex","pui"],"precision":0,"damage":5,"type":"physique","text":""},{"name":"Feu spectral","ranged":true,"attrs":["int","vol"],"precision":0,"damage":5,"type":"feu","text":"Dégâts de feu ou de glace. Cette attaque se fait contre la Défense magique."}],"spells":[{"name":"Contrôle thermique","cost":"15 PM","target":"Une créature","duration":"Scène","offensive":true,"text":"Test de magie : 【INT + VOL】. Le cait sith choisit le feu ou la glace. Jusqu''à ce que l''effet de ce sort s''achève, la cible subit 5 dégâts supplémentaires de toutes les sources qui infligent des dégâts du type choisi."}],"abilities":[],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Cait sith' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Papillon d''effroi', 'Monstre', 'Les ailes translucides de ce grand papillon de nuit charognard sont couvertes de spores venimeuses qui causent de terribles vertiges.', '["Monstre","Soldat"]', 'Livre de base', 342, '{"level":5,"species":"Monstre","rank":"soldat","champion":null,"traits":["effrayant","volant","velu","puant"],"attributes":{"dex":10,"int":6,"pui":8,"vol":8},"hp":60,"crisis":30,"mp":55,"init":8,"def":10,"mdef":6,"affinities":{"feu":"VU","glace":"RE","poison":"RE"},"attacks":[{"name":"Morsure de papillon","ranged":false,"attrs":["dex","pui"],"precision":0,"damage":10,"type":"physique","text":""}],"spells":[{"name":"Nuage toxique","cost":"10 × C PM","target":"Jusqu''à 3 créatures","duration":"Instantanée","offensive":true,"text":"Test de magie : 【PUI + VOL】. Chaque cible subit l''état empoisonné."}],"abilities":[{"name":"Vol","text":"Voir page 309 pour les effets détaillés de cette compétence (vol ou lévitation)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Papillon d''effroi' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Vase veloutée', 'Monstre', 'La vase veloutée vit souvent en symbiose avec de plus grands monstres. On la reconnaît facilement au bruit caractéristique qu''elle émet : pouic, pouic !', '["Monstre","Soldat"]', 'Livre de base', 343, '{"level":5,"species":"Monstre","rank":"soldat","champion":null,"traits":["lumineuse","molle","terriblement mignonne","chaude"],"attributes":{"dex":8,"int":6,"pui":10,"vol":8},"hp":60,"crisis":30,"mp":55,"init":7,"def":9,"mdef":8,"affinities":{"physique":"RE","foudre":"RE","feu":"RE","glace":"RE","poison":"VU"},"attacks":[{"name":"Coup de langue veloutée","ranged":false,"attrs":["dex","pui"],"precision":0,"damage":10,"type":"physique","text":""},{"name":"Rafale veloutée","ranged":true,"attrs":["dex","int"],"precision":0,"damage":5,"type":"air","text":""}],"spells":[{"name":"Danse veloutée","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":false,"text":"La cible regagne 30 Points de Vie (40 si la vase est de niveau 20+, 50 si elle est de niveau 40+, 60 si elle est de niveau 60+) et se débarrasse en outre d''un état choisi par la vase."}],"abilities":[],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Vase veloutée' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Drac', 'Monstre', 'Bien qu''il s''agisse des plus faibles des dragons, les dracs n''en demeurent pas moins de redoutables adversaires. Heureusement, ils sont très paresseux.', '["Monstre","Soldat"]', 'Livre de base', 343, '{"level":10,"species":"Monstre","rank":"soldat","champion":null,"traits":["lourd","affamé","paresseux","écailleux"],"attributes":{"dex":8,"int":8,"pui":10,"vol":6},"hp":70,"crisis":35,"mp":50,"init":8,"def":10,"mdef":9,"affinities":{"feu":"IM","poison":"VU"},"attacks":[{"name":"Morsure","ranged":false,"attrs":["pui","pui"],"precision":4,"damage":10,"type":"physique","text":""}],"spells":[{"name":"Souffle draconique","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie : 【PUI + VOL】+4. La cible subit【VH + 15】dégâts de feu et l''état traumatisé."}],"abilities":[],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Drac' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Hexœil', 'Monstre', 'Monstruosité ailée à un œil, redoutée pour son regard maudit. Certains disent que cette créature est née de l''œil d''une sorcière morte.', '["Monstre","Soldat"]', 'Livre de base', 344, '{"level":10,"species":"Monstre","rank":"soldat","champion":null,"traits":["rusé","hypnotique","silencieux","ailé"],"attributes":{"dex":10,"int":6,"pui":8,"vol":8},"hp":60,"crisis":30,"mp":60,"init":12,"def":10,"mdef":6,"affinities":{"air":"RE","foudre":"VU","terre":"RE","lumiere":"VU"},"attacks":[{"name":"Serres","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":10,"type":"physique","text":""},{"name":"Regard chaotique","ranged":true,"attrs":["dex","vol"],"precision":1,"damage":5,"type":"tenebres","text":"Si la cible est étourdie, elle effectue une action de moins à son tour suivant (pour un minimum de 0 action)."}],"spells":[{"name":"Regard funeste","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie : 【PUI + VOL】+4. La cible subit les états étourdi et affaibli."}],"abilities":[{"name":"Vol","text":"Voir page 309 pour les effets détaillés de cette compétence (vol ou lévitation)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Hexœil' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Hydrozoaire', 'Monstre', 'Chacun des tentacules ophidiens de ces étranges monstres à l''allure de méduses en lévitation contient une puissante neurotoxine.', '["Monstre","Soldat"]', 'Livre de base', 344, '{"level":10,"species":"Monstre","rank":"soldat","champion":null,"traits":["lévitation","lumineux","silencieuse","transparente"],"attributes":{"dex":8,"int":8,"pui":10,"vol":6},"hp":70,"crisis":35,"mp":40,"init":8,"def":9,"mdef":10,"affinities":{"foudre":"VU","glace":"RE","poison":"RE"},"attacks":[{"name":"Contact acide","ranged":false,"attrs":["pui","pui"],"precision":1,"damage":10,"type":"poison","text":"Chaque cible touchée par cette attaque perd 1 Point d''Inventaire."},{"name":"Tentacule urticant","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":5,"type":"foudre","text":"La cible subit l''état enragé."}],"spells":[],"abilities":[{"name":"Vol","text":"Voir page 309 pour les effets détaillés de cette compétence (vol ou lévitation)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Hydrozoaire' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Cocatrice', 'Monstre', 'Ronds, nauséabonds, mais très vivaces, les cocatrices ressemblent à des poulets dont les coups de bec peuvent pétrifier leurs victimes.', '["Monstre","Soldat"]', 'Livre de base', 345, '{"level":15,"species":"Monstre","rank":"soldat","champion":null,"traits":["agile","petit","puant","imprévisible"],"attributes":{"dex":8,"int":10,"pui":8,"vol":6},"hp":70,"crisis":35,"mp":45,"init":9,"def":9,"mdef":12,"affinities":{"foudre":"RE","terre":"RE","glace":"VU"},"attacks":[{"name":"Coup de bec pétrificateur","ranged":false,"attrs":["dex","int"],"precision":4,"damage":null,"type":null,"text":"Aucun dégât. Cette attaque se fait contre la Défense magique plutôt que la Défense. Chaque cible qu''elle touche subit l''état ralenti. Si la cible est déjà ralentie, elle doit à la place réussir un test de【PUI + VOL】contre un ND 10 pour éviter d''être transformée en pierre. Guérir une créature pétrifiée est une aventure en soi."},{"name":"Coup de bec toxique","ranged":false,"attrs":["dex","pui"],"precision":4,"damage":10,"type":"poison","text":""}],"spells":[],"abilities":[],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Cocatrice' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Mimique', 'Monstre', 'Ces malveillants métamorphes peuvent se faire passer pour des objets. Certains pensent qu''il s''agit d''une punition divine pour les aventuriers avides.', '["Monstre","Soldat"]', 'Livre de base', 345, '{"level":15,"species":"Monstre","rank":"soldat","champion":null,"traits":["rusée","informe","vorace","discrète"],"attributes":{"dex":10,"int":8,"pui":8,"vol":6},"hp":70,"crisis":35,"mp":45,"init":9,"def":11,"mdef":10,"affinities":{"physique":"RE","air":"RE","tenebres":"RE","terre":"VU","lumiere":"RE","poison":"VU"},"attacks":[{"name":"Griffe de mimique","ranged":false,"attrs":["dex","pui"],"precision":4,"damage":5,"type":"physique","text":"Si la mimique a tendu une embuscade à une cible qui ne s''y attendait pas, les dégâts de cette attaque sont doublés."},{"name":"Vol d''objet","ranged":true,"attrs":["dex","int"],"precision":4,"damage":5,"type":"physique","text":"Chaque cible touchée par cette attaque perd 2 Points d''Inventaire."}],"spells":[],"abilities":[{"name":"Métamorphose","text":"Tant qu''elle reste transformée, la mimique est identique à l''objet qu''elle imite, à l''exception d''un détail troublant ou inhabituel que le meneur de jeu doit inclure lorsqu''il la décrit."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Mimique' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Urne funeste', 'Mort-vivant', 'Urne sépulcrale remplie de vieux ossements et habitée par une âme sans repos envieuse des vivants.', '["Mort-vivant","Soldat"]', 'Livre de base', 346, '{"level":5,"species":"Mort-vivant","rank":"soldat","champion":null,"traits":["ricane","fragile","lévitation","minuscule"],"attributes":{"dex":10,"int":6,"pui":6,"vol":10},"hp":50,"crisis":25,"mp":55,"init":8,"def":11,"mdef":8,"affinities":{"physique":"VU","tenebres":"IM","feu":"VU","lumiere":"VU","poison":"IM"},"attacks":[{"name":"Coup d''urne","ranged":false,"attrs":["dex","pui"],"precision":0,"damage":5,"type":"physique","text":""},{"name":"Ricanement du chaos","ranged":true,"attrs":["dex","pui"],"precision":0,"damage":5,"type":"tenebres","text":"La cible subit l''état traumatisé. Cette attaque se fait contre la Défense magique."}],"spells":[],"abilities":[{"name":"Mort-vivant","text":"L''urne funeste est immunisée contre l''état empoisonné et la récupération de PV peut la blesser (voir page 305)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Urne funeste' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Zombie', 'Mort-vivant', 'Restes putréfiés d''un humanoïde animé par une magie sinistre et mû par une faim insatiable. Coriace mais maladroit.', '["Mort-vivant","Soldat"]', 'Livre de base', 346, '{"level":5,"species":"Mort-vivant","rank":"soldat","champion":null,"traits":["effrayant","dépourvu d''intelligence","putréfié","lent"],"attributes":{"dex":6,"int":6,"pui":12,"vol":8},"hp":70,"crisis":35,"mp":45,"init":6,"def":8,"mdef":7,"affinities":{"tenebres":"IM","terre":"VU","feu":"VU","lumiere":"VU","poison":"IM"},"attacks":[{"name":"Morsure vorace","ranged":false,"attrs":["dex","pui"],"precision":0,"damage":5,"type":"tenebres","text":"La cible subit l''état affaibli."},{"name":"Coup de griffes de zombie","ranged":false,"attrs":["pui","pui"],"precision":0,"damage":5,"type":"physique","text":""}],"spells":[],"abilities":[{"name":"Esprit vide","text":"Le zombie est immunisé contre les états étourdi, enragé et traumatisé."},{"name":"Mort-vivant","text":"Le zombie est immunisé contre l''état empoisonné et la récupération de PV peut le blesser (voir page 305)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Zombie' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Mage squelette', 'Mort-vivant', 'Ces cadavres animés qui tiennent souvent lieu de lieutenant aux nécromanciens sont capables d''utiliser la magie noire.', '["Mort-vivant","Soldat"]', 'Livre de base', 347, '{"level":10,"species":"Mort-vivant","rank":"soldat","champion":null,"traits":["ambitieux","rusé","instruit","impitoyable"],"attributes":{"dex":6,"int":8,"pui":8,"vol":10},"hp":60,"crisis":30,"mp":70,"init":5,"def":8,"mdef":12,"affinities":{"tenebres":"IM","terre":"VU","feu":"RE","glace":"RE","lumiere":"VU","poison":"IM"},"attacks":[{"name":"Bâton","ranged":false,"attrs":["vol","vol"],"precision":1,"damage":6,"type":"physique","text":"Le mage récupère 5 PM."}],"spells":[{"name":"Umbra","cost":"10 × C PM","target":"Jusqu''à 3 créatures","duration":"Instantanée","offensive":true,"text":"Test de magie : 【INT + VOL】+1. Chaque cible subit【VH + 15】dégâts de ténèbres. Aubaine : chaque cible touchée par ce sort subit l''état traumatisé."}],"abilities":[{"name":"Équipement","text":"bâton, robe de mage"},{"name":"Mort-vivant","text":"Le mage squelette est immunisé contre l''état empoisonné et la récupération de PV peut le blesser (voir page 305)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Mage squelette' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Soldat squelette', 'Mort-vivant', 'Ces créatures qui protègent généralement d''anciennes ruines ou servent un nécromancien sont des combattants impitoyables et compétents.', '["Mort-vivant","Soldat"]', 'Livre de base', 347, '{"level":10,"species":"Mort-vivant","rank":"soldat","champion":null,"traits":["cruel","dépourvu d''intelligence","meurtrier","silencieux"],"attributes":{"dex":8,"int":8,"pui":10,"vol":6},"hp":70,"crisis":35,"mp":40,"init":6,"def":12,"mdef":8,"affinities":{"air":"VU","tenebres":"IM","terre":"VU","lumiere":"VU","poison":"IM"},"attacks":[{"name":"Épée de bronze","ranged":false,"attrs":["dex","pui"],"precision":5,"damage":11,"type":"physique","text":""}],"spells":[],"abilities":[{"name":"Équipement","text":"épée de bronze, bouclier de bronze, brigandine"},{"name":"Esprit vide","text":"Le soldat squelette est immunisé contre les états étourdi, enragé et traumatisé."},{"name":"Mort-vivant","text":"Le soldat squelette est immunisé contre l''état empoisonné et la récupération de PV peut le blesser (voir page 305)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Soldat squelette' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Goule', 'Mort-vivant', 'D''énormes cadavres habités par une âme souffrant d''une terrible malédiction. Les goules hantent les cimetières pour dévorer la chair des défunts.', '["Mort-vivant","Soldat"]', 'Livre de base', 348, '{"level":15,"species":"Mort-vivant","rank":"soldat","champion":null,"traits":["agressive","grande","puissante","terrifiante"],"attributes":{"dex":8,"int":6,"pui":12,"vol":6},"hp":90,"crisis":45,"mp":45,"init":7,"def":8,"mdef":6,"affinities":{"tenebres":"IM","lumiere":"VU","poison":"IM"},"attacks":[{"name":"Griffes furieuses","ranged":false,"attrs":["pui","pui"],"precision":1,"damage":10,"type":"physique","text":"Cette attaque a la propriété multi (2)."},{"name":"Souffle empoisonné","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":5,"type":"poison","text":"La cible subit l''état empoisonné."}],"spells":[],"abilities":[{"name":"Mort-vivant","text":"La goule est immunisée contre l''état empoisonné et la récupération de PV peut la blesser (voir page 305)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Goule' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Hurleur squelettique', 'Mort-vivant', 'Dépouillées de leur vie et de leur loyauté, ces abominations squelettiques sont poussées par une faim vorace et insatiable.', '["Mort-vivant","Soldat"]', 'Livre de base', 348, '{"level":15,"species":"Mort-vivant","rank":"soldat","champion":null,"traits":["éternellement affamé","rapide","résistant","féroce"],"attributes":{"dex":10,"int":6,"pui":10,"vol":6},"hp":80,"crisis":40,"mp":55,"init":8,"def":10,"mdef":6,"affinities":{"physique":"RE","air":"VU","tenebres":"IM","glace":"RE","lumiere":"VU","poison":"IM"},"attacks":[{"name":"Mâchoires dentelées","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":10,"type":"physique","text":"La cible subit l''état ralenti."}],"spells":[{"name":"Souffle putride","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie : 【PUI + VOL】+1. La cible subit【VH + 15】dégâts de ténèbres et l''état affaibli."}],"abilities":[{"name":"Mort-vivant","text":"Le hurleur squelettique est immunisé contre l''état empoisonné et la récupération de PV peut le blesser (voir page 305)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Hurleur squelettique' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Âme en chaînes', 'Mort-vivant', 'Les esprits qu''une existence tourmentée a empêchés de trouver la paix dans l''au-delà se transforment parfois en terribles spectres.', '["Mort-vivant","Soldat"]', 'Livre de base', 349, '{"level":20,"species":"Mort-vivant","rank":"soldat","champion":null,"traits":["tourmentée","maudite","éthérée","vengeresse"],"attributes":{"dex":12,"int":8,"pui":6,"vol":8},"hp":70,"crisis":35,"mp":70,"init":10,"def":12,"mdef":8,"affinities":{"physique":"IM","air":"VU","tenebres":"IM","terre":"RE","feu":"VU","glace":"RE","lumiere":"VU","poison":"IM"},"attacks":[{"name":"Griffe de fureur","ranged":false,"attrs":["dex","vol"],"precision":5,"damage":10,"type":"tenebres","text":"La cible subit l''état enragé."}],"spells":[{"name":"Épouvantable gémissement","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie : 【INT + VOL】+5. La cible subit【VH + 20】dégâts de glace et l''état traumatisé."}],"abilities":[{"name":"Mort-vivant","text":"L''âme en chaînes est immunisée contre l''état empoisonné et la récupération de PV peut la blesser (voir page 305)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Âme en chaînes' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Momie', 'Mort-vivant', 'Préservées grâce à d''antiques rituels, ces horreurs sont dépourvues de volonté et uniquement mues par les ordres qu''elles ont reçus.', '["Mort-vivant","Soldat"]', 'Livre de base', 349, '{"level":20,"species":"Mort-vivant","rank":"soldat","champion":null,"traits":["maudite","loyauté éternelle","inflammable","silencieuse"],"attributes":{"dex":6,"int":8,"pui":10,"vol":10},"hp":90,"crisis":45,"mp":70,"init":7,"def":6,"mdef":8,"affinities":{"air":"VU","tenebres":"IM","feu":"VU","lumiere":"VU","poison":"IM"},"attacks":[{"name":"Griffes sépulcrales","ranged":false,"attrs":["pui","vol"],"precision":5,"damage":10,"type":"terre","text":"Chaque cible touchée par cette attaque subit l''état ralenti. Si une cible est déjà ralentie, elle devient vulnérable à tous les types de dégâts jusqu''à ce qu''elle se débarrasse de l''état ralenti."}],"spells":[],"abilities":[{"name":"Antique malédiction","text":"Quand elle arrive à 0 PV, la momie tombe en poussière et prononce une puissante malédiction : toutes les créatures vivantes présentes dans la scène subissent les états traumatisé et affaibli."},{"name":"Esprit vide","text":"La momie est immunisée contre les états étourdi, enragé et traumatisé."},{"name":"Mort-vivant","text":"La momie est immunisée contre l''état empoisonné et la récupération de PV peut la blesser (voir page 305)."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Momie' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Alraune', 'Plante', 'Minuscules mais malveillantes, ces plantes attirent un sort funeste sur tous ceux qu''elles croisent.', '["Plante","Soldat"]', 'Livre de base', 350, '{"level":5,"species":"Plante","rank":"soldat","champion":null,"traits":["effrayant","rapide","malveillante","minuscule"],"attributes":{"dex":10,"int":8,"pui":6,"vol":8},"hp":50,"crisis":25,"mp":45,"init":9,"def":10,"mdef":8,"affinities":{"air":"RE","terre":"RE","glace":"VU","poison":"VU"},"attacks":[{"name":"Gifle de racine","ranged":false,"attrs":["dex","pui"],"precision":0,"damage":5,"type":"physique","text":"Cette attaque inflige 5 dégâts de plus aux cibles traumatisées."},{"name":"Cri d''alraune","ranged":true,"attrs":["vol","vol"],"precision":0,"damage":null,"type":null,"text":"Aucun dégât et la cible subit l''état traumatisé. Cette attaque se fait contre la Défense magique et n''a aucun effet sur les créatures incapables d''entendre le cri de l''alraune."}],"spells":[],"abilities":[{"name":"Plante","text":"L''alraune est immunisée contre les états étourdi, enragé et traumatisé."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Alraune' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Citrouille maudite', 'Plante', 'Restes courroucés de citrouilles sculptées que l''on jette à la fin d''une ancienne fête de l''automne. Protagoniste courant de récits d''horreur.', '["Plante","Soldat"]', 'Livre de base', 350, '{"level":5,"species":"Plante","rank":"soldat","champion":null,"traits":["furieuse","putréfiée","petite","puante"],"attributes":{"dex":8,"int":8,"pui":8,"vol":8},"hp":50,"crisis":25,"mp":55,"init":8,"def":9,"mdef":10,"affinities":{"air":"VU","tenebres":"RE","terre":"VU","feu":"RE"},"attacks":[{"name":"Morsure gangrenée","ranged":false,"attrs":["dex","pui"],"precision":3,"damage":5,"type":"poison","text":""}],"spells":[{"name":"Vomissure de citrouille","cost":"10 PM","target":"Une créature","duration":"Scène","offensive":true,"text":"Test de magie : 【PUI + VOL】. Jusqu''à ce que l''effet de ce sort s''achève, la cible subit 5 dégâts de plus de la part de toutes les sources infligeant des dégâts de poison."}],"abilities":[{"name":"Plante","text":"La citrouille maudite est immunisée contre les états étourdi, enragé et traumatisé."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Citrouille maudite' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Fongoïde', 'Plante', 'Ces créatures trapues et au pas lourd sont généralement paisibles, mais peuvent se montrer agressives si leurs marais sont contaminés.', '["Plante","Soldat"]', 'Livre de base', 351, '{"level":10,"species":"Plante","rank":"soldat","champion":null,"traits":["sans yeux","aime la boue","paisible","lent"],"attributes":{"dex":6,"int":8,"pui":10,"vol":8},"hp":70,"crisis":35,"mp":60,"init":7,"def":8,"mdef":9,"affinities":{"tenebres":"RE","terre":"RE","glace":"VU"},"attacks":[{"name":"Gifle fongoïde","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":5,"type":"physique","text":""}],"spells":[{"name":"Éructation de spores","cost":"10 PM","target":"Une créature","duration":"Instantanée","offensive":true,"text":"Test de magie : 【PUI + VOL】+1. La cible subit【VH + 15】dégâts de poison et subit l''état étourdi."}],"abilities":[{"name":"Plante","text":"Le fongoïde est immunisé contre les états étourdi, enragé et traumatisé."},{"name":"Large chapeau","text":"Quand le fongoïde effectue l''action Garde, il peut choisir une autre créature. Celle-ci bénéficie d''une résistance à tous les types de dégâts jusqu''au début du prochain tour du fongoïde."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Fongoïde' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Tourmentine', 'Plante', 'Plante au noyau épineux qui se sépare verticalement pour former une gueule sans fond. Certains y voient une expérience ratée.', '["Plante","Soldat"]', 'Livre de base', 351, '{"level":10,"species":"Plante","rank":"soldat","champion":null,"traits":["agressive","maudite","vive","épineuse"],"attributes":{"dex":10,"int":8,"pui":8,"vol":6},"hp":60,"crisis":30,"mp":40,"init":9,"def":10,"mdef":8,"affinities":{"air":"VU","tenebres":"IM","terre":"RE","feu":"VU","poison":"RE"},"attacks":[{"name":"Vrilles de corruption","ranged":false,"attrs":["dex","dex"],"precision":1,"damage":5,"type":"physique","text":"La cible subit l''état affaibli. Tant qu''elle est affaiblie, la cible ne peut pas effectuer l''action Garde."},{"name":"Morsure obscure","ranged":false,"attrs":["dex","pui"],"precision":1,"damage":10,"type":"tenebres","text":""}],"spells":[],"abilities":[{"name":"Plante","text":"La tourmentine maudite est immunisée contre les états étourdi, enragé et traumatisé."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Tourmentine' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');

INSERT INTO npcs (prenom, nom, role, description, tags, source, page, system_data)
SELECT NULL, 'Gobe-dragon', 'Plante', 'Cette plante colossale porte bien son nom : sa mâchoire est assez immense pour avaler les pattes d''un dragon adulte. Cela dit, elle lui sert plus souvent pour capturer et digérer des animaux et des humanoïdes. La seule bonne nouvelle concernant ces monstruosités, c''est qu''elles sont profondément enracinées : vous pouvez les fuir, à condition d''échapper à leurs meurtriers tentacules végétaux.', '["Plante","Soldat"]', 'Livre de base', 353, '{"level":20,"species":"Plante","rank":"soldat","champion":null,"traits":["colossal","affamé","patient","enraciné"],"attributes":{"dex":8,"int":8,"pui":10,"vol":8},"hp":90,"crisis":45,"mp":60,"init":8,"def":8,"mdef":8,"affinities":{"air":"RE","foudre":"VU","terre":"VU","feu":"RE","lumiere":"RE","poison":"VU"},"attacks":[{"name":"Mange-dragon","ranged":false,"attrs":["pui","pui"],"precision":5,"damage":10,"type":"physique","text":"Si une cible touchée par cette attaque est affaiblie, le gobe-dragon l''avale. Une créature avalée subit des dégâts physiques mineurs (20) au début de chacun des tours du gobe-dragon et ne peut effectuer aucune action excepté l''action Objectif (dans le but de se libérer). Libérer une cible avalée correspond à un Cadran à quatre sections. Un gobe-dragon de rang soldat ne peut conserver qu''une créature avalée à la fois, mais un gobe-dragon d''élite ou champion peut en garder jusqu''à deux. Si toutes les gueules du monstre sont occupées et s''il avale une créature, il doit en recracher une autre avalée précédemment."},{"name":"Moulinet de tentacule","ranged":true,"attrs":["dex","pui"],"precision":5,"damage":15,"type":"air","text":"La cible subit l''état affaibli."}],"spells":[{"name":"Gaz engourdissant","cost":"10 × C PM","target":"Jusqu''à 3 créatures","duration":"Instantanée","offensive":true,"text":"Test de magie : 【PUI + VOL】+2. Chaque cible perd la moitié de ses Points de Magie."},{"name":"Prédigestion","cost":"10 PM","target":"Une créature","duration":"Scène","offensive":true,"text":"Test de magie : 【PUI + VOL】+2. Jusqu''à ce que l''effet de ce sort s''achève, la cible subit 10 dégâts de plus de la part de toutes les sources infligeant des dégâts physiques."}],"abilities":[{"name":"Plante","text":"Le gobe-dragon est immunisé contre les états étourdi, enragé et traumatisé."}],"villain":null}'
WHERE NOT EXISTS (SELECT 1 FROM npcs WHERE nom = 'Gobe-dragon' AND COALESCE(prenom, '') = '' AND COALESCE(source, '') = 'Livre de base');
-- ── fin des PNJ du livre ──

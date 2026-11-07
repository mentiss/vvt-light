-- ─────────────────────────────────────────────────────────────────────────────
-- database-template/cyberpunk-schema.sql
-- Schéma complet du slug Cyberpunk (The Sprawl — adaptation 2d10)
-- Créé automatiquement au premier lancement si cyberpunk.db est absent.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── PERSONNAGE ───────────────────────────────────────────────────────────────
-- Table unique : identité + stats + ressources + progression.
-- Pas de table character_stats séparée (relation 1-pour-1 inutile).

CREATE TABLE IF NOT EXISTS characters (
                                          id           INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Accès
                                          access_url   TEXT UNIQUE NOT NULL,
                                          access_code  TEXT UNIQUE NOT NULL,
                                          player_name  TEXT DEFAULT '',
                                          session_id   INTEGER REFERENCES game_sessions(id) ON DELETE SET NULL,

    -- Identité
                                          nom          TEXT NOT NULL DEFAULT '',
                                          prenom       TEXT NOT NULL DEFAULT '',
                                          sexe         TEXT DEFAULT '',
                                          apparence    TEXT DEFAULT '',  -- texte libre
                                          avatar       TEXT DEFAULT NULL,

    -- Playbook choisi à la création
                                          playbook     TEXT NOT NULL DEFAULT '',

    -- Stats (-2 à +2, +3 possible après 5 avancements de base)
                                          cran         INTEGER DEFAULT 0,
                                          pro          INTEGER DEFAULT 0,
                                          chair        INTEGER DEFAULT 0,
                                          esprit       INTEGER DEFAULT 0,
                                          style        INTEGER DEFAULT 0,
                                          synth        INTEGER DEFAULT 0,

    -- Ressources (compteurs simples +/-)
                                          cred         INTEGER DEFAULT 0,
                                          info_tokens  INTEGER DEFAULT 0,   -- [info] disponible
                                          matos_tokens INTEGER DEFAULT 0,   -- [matos] disponible
                                          retenue      INTEGER DEFAULT 0,   -- points de retenue (Move Évaluer etc.)

    -- Progression XP
                                          xp                INTEGER DEFAULT 0,
                                          base_advancements INTEGER DEFAULT 0,  -- débloque avancement majeur à 5

    -- Console de manœuvres (spec_cyberpunk.md §4) : JSON, ids ordonnés ; NULL = manœuvres de base
                                          move_console TEXT DEFAULT NULL,

    -- Narratif libre
                                          dark_secret  TEXT DEFAULT '',
                                          notes        TEXT DEFAULT '',

                                          last_accessed DATETIME DEFAULT NULL,
                                          login_attempts INTERGER DEFAULT 0,
                                          last_attempt_at DATETIME DEFAULT NULL,

                                          created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                                          updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_characters_access_code ON characters(access_code);
CREATE INDEX IF NOT EXISTS idx_characters_access_url  ON characters(access_url);
CREATE INDEX IF NOT EXISTS idx_characters_updated_at  ON characters(updated_at DESC);

-- ─── TABLES GÉNÉRIQUES ───────────────────────────────────────────────────────
-- Présentes dans tous les slugs — structure identique obligatoire.

CREATE TABLE IF NOT EXISTS game_sessions (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL,
                                             access_code TEXT UNIQUE NOT NULL,
                                             access_url TEXT UNIQUE NOT NULL,
                                             date DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             notes TEXT,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_access_code ON game_sessions(access_code);
CREATE INDEX IF NOT EXISTS idx_sessions_access_url  ON game_sessions(access_url);
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at  ON game_sessions(updated_at DESC);

-- Compte MJ : inséré après game_sessions, que characters.session_id référence
-- (clés étrangères actives avec better-sqlite3).
INSERT OR IGNORE INTO characters (id, access_code, access_url, player_name, nom)
VALUES (-1, 'GMCODE', 'iamthegm', 'Maître du Jeu', 'Maître du Jeu');

CREATE TABLE IF NOT EXISTS session_characters (
                                                  session_id   INTEGER NOT NULL,
                                                  character_id INTEGER NOT NULL,
                                                  joined_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                  PRIMARY KEY (session_id, character_id),
                                                  FOREIGN KEY (session_id)   REFERENCES game_sessions(id) ON DELETE CASCADE,
                                                  FOREIGN KEY (character_id) REFERENCES characters(id)    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_session_characters_session_id   ON session_characters(session_id);
CREATE INDEX IF NOT EXISTS idx_session_characters_character_id ON session_characters(character_id);

CREATE TABLE IF NOT EXISTS dice_history (
                                            id              INTEGER PRIMARY KEY AUTOINCREMENT,
                                            session_id      INTEGER REFERENCES game_sessions(id) ON DELETE SET NULL,
                                            character_id    INTEGER REFERENCES characters(id)    ON DELETE SET NULL,
                                            roll_type       TEXT    DEFAULT NULL,
                                            notation        TEXT    NOT NULL,
                                            roll_result     TEXT    DEFAULT NULL,   -- JSON
                                            roll_definition TEXT    DEFAULT NULL,
                                            roll_target     TEXT    DEFAULT NULL,   -- JSON
                                            pool            INTEGER DEFAULT NULL,
                                            threshold       INTEGER DEFAULT NULL,
                                            results         TEXT    DEFAULT NULL,   -- JSON des faces individuelles
                                            successes       INTEGER DEFAULT NULL,
                                            saga_spent      INTEGER DEFAULT 0,
                                            saga_recovered  INTEGER DEFAULT 0,
                                            created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dice_session_id   ON dice_history(session_id);
CREATE INDEX IF NOT EXISTS idx_dice_character_id ON dice_history(character_id);
CREATE INDEX IF NOT EXISTS idx_dice_created_at   ON dice_history(created_at DESC);

CREATE TABLE IF NOT EXISTS character_journal (
                                                 id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 character_id INTEGER NOT NULL REFERENCES characters(id)    ON DELETE CASCADE,
                                                 session_id   INTEGER          REFERENCES game_sessions(id) ON DELETE SET NULL,
                                                 type         TEXT    DEFAULT 'note',
                                                 title        TEXT    DEFAULT '',
                                                 body         TEXT    NOT NULL DEFAULT '',
                                                 metadata     TEXT    DEFAULT '{}',
                                                 is_read      INTEGER DEFAULT 0,
                                                 created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                 updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

create index idx_journal_character
    on character_journal (character_id);

create index idx_journal_session
    on character_journal (session_id);

create index idx_journal_type
    on character_journal (type);

-- ─── DIRECTIVES ──────────────────────────────────────────────────────────────
-- type 'personal' : stables, choisies à la création (2 par perso)
-- type 'mission'  : évolutives, redéfinissables en fin de session (1 à 2)

CREATE TABLE IF NOT EXISTS character_directives (
                                                    id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                    type         TEXT    NOT NULL CHECK(type IN ('personal', 'mission')),
                                                    text         TEXT    NOT NULL DEFAULT '',
                                                    blank_value  TEXT    DEFAULT '',   -- contenu du champ "___" contextuel
                                                    completed    INTEGER DEFAULT 0,
                                                    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── RELATIONS ───────────────────────────────────────────────────────────────
-- link_score de -3 à +3 : positif = allié/confident, négatif = nemesis/rival

CREATE TABLE IF NOT EXISTS character_relations (
                                                   id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                   name         TEXT    NOT NULL DEFAULT '',
                                                   description  TEXT    DEFAULT '',
                                                   link_score   INTEGER DEFAULT 1 CHECK(link_score BETWEEN -3 AND 3),
                                                   created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                   updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── CYBERWARE ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS character_cyberware (
                                                   id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                                   name         TEXT    NOT NULL DEFAULT '',
                                                   option_text  TEXT    DEFAULT '',   -- option choisie (ex: "Force augmentée")
                                                   notes        TEXT    DEFAULT '',
                                                   created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                   updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── INVENTAIRE ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS character_items (
                                               id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                               character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                               name         TEXT    NOT NULL DEFAULT '',
                                               description  TEXT    DEFAULT '',
                                               quantity     INTEGER DEFAULT 1,
                                               created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
                                               updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_character_id ON character_items(character_id);

-- ─── TAGS (système polymorphe) ───────────────────────────────────────────────
-- Applicable à : character, cyberware, relation, item
-- entity_type + entity_id pointent vers la table concernée.
-- Ajout/suppression libre par joueur ET GM, sauf les tags verrouillés (locked = 1) :
-- posés par une manœuvre (contacts, équipe, sphère…), retirables en mode Édition seulement.

CREATE TABLE IF NOT EXISTS tags (
                                    id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                    entity_type  TEXT NOT NULL CHECK(entity_type IN ('character', 'cyberware', 'relation', 'item')),
                                    entity_id    INTEGER NOT NULL,
                                    tag_text     TEXT    NOT NULL DEFAULT '',   -- ex: "+défaillant", "Blessé", "+aliénant"
                                    tag_variant  TEXT    DEFAULT 'neutral' CHECK(tag_variant IN ('positive', 'negative', 'neutral')),
                                    locked       INTEGER NOT NULL DEFAULT 0,    -- 1 = posé par une manœuvre (spec_cyberpunk.md §9.8)
                                    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_entity ON tags(entity_type, entity_id);

-- ─── MOVES — bibliothèque partagée ───────────────────────────────────────────
-- type 'official' : moves des règles (de base ou de playbook), toujours approuvés
-- type 'custom'   : créés à la table, validation GM requise (is_approved = 0 → 1)
-- playbook NULL   : move accessible à tous (moves de base + customs globaux)
-- stat NULL       : move sans jet (purement narratif)

CREATE TABLE IF NOT EXISTS moves (
                                     id          INTEGER PRIMARY KEY AUTOINCREMENT,
                                     type        TEXT    NOT NULL CHECK(type IN ('official', 'custom')),
                                     playbook    TEXT    DEFAULT NULL,    -- NULL = accessible à tous les playbooks
                                     name        TEXT    NOT NULL DEFAULT '',
                                     stat        TEXT    DEFAULT NULL    -- cran/pro/chair/esprit/style/synth/cred/null
                                         CHECK(stat IN ('cran','pro','chair','esprit','style','synth','cred', NULL)),
                                     description TEXT    NOT NULL DEFAULT '',
                                     is_approved INTEGER DEFAULT 1,       -- 0 = en attente validation GM (custom uniquement)
                                     created_by  INTEGER REFERENCES characters(id) ON DELETE SET NULL,
                                     created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Moves débloqués par personnage (official débloqués via XP ou création, custom validés)
CREATE TABLE IF NOT EXISTS character_moves (
                                               id           INTEGER PRIMARY KEY AUTOINCREMENT,
                                               character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
                                               move_id      INTEGER NOT NULL REFERENCES moves(id)      ON DELETE CASCADE,
                                               acquired_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                                               UNIQUE(character_id, move_id)
);

-- ─── CLOCKS ──────────────────────────────────────────────────────────────────
-- session_id NULL = scope slug (persistant toutes sessions, niveau campagne)
-- segments : libre (4, 6, 8, 10, 12...) — le GM décide de la granularité

CREATE TABLE IF NOT EXISTS clocks (
                                      id          INTEGER PRIMARY KEY AUTOINCREMENT,
                                      session_id  INTEGER REFERENCES game_sessions(id) ON DELETE CASCADE,
                                      name        TEXT    NOT NULL DEFAULT '',
                                      segments    INTEGER NOT NULL DEFAULT 6,
                                      current     INTEGER DEFAULT 0,
                                      consequence TEXT    DEFAULT '',   -- ce qui se passe quand le clock est plein
                                      icon        TEXT    DEFAULT '⏱',
                                      pinned      INTEGER DEFAULT 0,
                                      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                                      updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── MÉTÉO DE LA TABLE (spec_cyberpunk.md §3.1) ──────────────────────────────
-- Choisie par le MJ, suivie par les joueurs ; absente = 'auto'
CREATE TABLE IF NOT EXISTS session_weather (
    session_id INTEGER PRIMARY KEY REFERENCES game_sessions(id) ON DELETE CASCADE,
    weather    TEXT    NOT NULL DEFAULT 'auto' CHECK(weather IN ('auto', 'rain', 'smog', 'clear')),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── THREATS ─────────────────────────────────────────────────────────────────
-- session_id NULL = scope slug (persistant toutes sessions)
-- moves_json : tableau de strings JSON (les actions de la menace)

CREATE TABLE IF NOT EXISTS threats (
                                       id         INTEGER PRIMARY KEY AUTOINCREMENT,
                                       session_id INTEGER REFERENCES game_sessions(id) ON DELETE CASCADE,
                                       name       TEXT    NOT NULL DEFAULT '',
                                       type       TEXT    DEFAULT '',      -- Corporation / Gang / Individu / IA / Lieu / Autre
                                       impulse    TEXT    DEFAULT '',      -- ce qu'elle veut fondamentalement
                                       moves_json TEXT    DEFAULT '[]',    -- JSON : tableau de strings
                                       notes      TEXT    DEFAULT '',
                                       icon        TEXT    DEFAULT '⚠',
                                       status      TEXT    DEFAULT 'active'
                                           CHECK(status IN ('active', 'dormante', 'neutralisée')),
                                       pinned      INTEGER DEFAULT 0,
                                       sort_order  INTEGER DEFAULT 0,
                                       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Many-to-many : une clock peut être liée à plusieurs threats et vice versa
CREATE TABLE IF NOT EXISTS clock_threats (
                                             clock_id  INTEGER NOT NULL REFERENCES clocks(id)  ON DELETE CASCADE,
                                             threat_id INTEGER NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
                                             PRIMARY KEY (clock_id, threat_id)
);

-- Clocks
CREATE INDEX IF NOT EXISTS idx_clocks_session_id  ON clocks (session_id);
CREATE INDEX IF NOT EXISTS idx_clocks_pinned       ON clocks (pinned);

-- Threats
CREATE INDEX IF NOT EXISTS idx_threats_session_id  ON threats (session_id);
CREATE INDEX IF NOT EXISTS idx_threats_pinned       ON threats (pinned);
CREATE INDEX IF NOT EXISTS idx_threats_status       ON threats (status);
CREATE INDEX IF NOT EXISTS idx_threats_sort_order   ON threats (sort_order);

-- Join table
CREATE INDEX IF NOT EXISTS idx_clock_threats_clock_id   ON clock_threats (clock_id);
CREATE INDEX IF NOT EXISTS idx_clock_threats_threat_id  ON clock_threats (threat_id);

-- ============================================
-- REFRESH TOKENS
-- ============================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
                                              id              INTEGER PRIMARY KEY AUTOINCREMENT,
                                              character_id    INTEGER NOT NULL,
                                              token           TEXT UNIQUE NOT NULL,
                                              expires_at      DATETIME NOT NULL,
                                              created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
                                              FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tokens_character_id ON refresh_tokens(character_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token        ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at   ON refresh_tokens(expires_at);

-- ─── SEED : MOVES OFFICIELS ───────────────────────────────────────────────────
-- Moves de base (playbook NULL = accessibles à tous)
-- Moves de playbook (playbook = nom du playbook)
-- Aligné le 07/11/2026 sur la base en service (refonte des moves du 30/05/2026, migrations 30052026_*).

-- MOVES DE BASE
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', NULL, 'Agir sous pression', 'cran', 'Quand tu agis dans une situation dangereuse, urgente ou stressante. 15+ : tu fais ce que tu voulais. 10-14 : complication ou coût. 9- : le MC agit librement.'),
    ('official', NULL, 'Employer la manière forte', 'chair', 'Quand tu t''engages dans un affrontement physique violent. 15+ : tu obtiens ce que tu veux. 10-14 : les deux parties s''infligent mutuellement des conséquences. 9- : le MC agit.'),
    ('official', NULL, 'Baratiner', 'style', 'Quand tu manipules, persuades, mens ou séduis pour obtenir quelque chose d''un PNJ. 15+ : il fait ce que tu veux. 10-14 : il le fait mais avec une condition ou un coût. 9- : le MC agit.'),
    ('official', NULL, 'Battre le pavé', 'style', 'Quand tu cherches une information ou actives ton réseau dans la rue. 15+ : tu obtiens ce que tu cherches. 10-14 : l''info est obtenue mais crée une obligation ou une dette. 9- : le MC agit.'),
    ('official', NULL, 'Évaluer', 'pro', 'Quand tu observes et analyses une situation pour en extraire des informations exploitables. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit pendant ton évaluation. Dépense une retenue pour poser une question au MC, qui répond honnêtement.'),
    ('official', NULL, 'Montrer les dents', 'pro', 'Quand tu intimides, menaces ou fais valoir ton autorité face à un PNJ. 15+ : il cède complètement. 10-14 : il cède mais avec une condition ou une contrepartie. 9- : le MC agit.'),
    ('official', NULL, 'Obtenir le taf', 'pro', 'Quand tu négocies un contrat avec un fixeur ou un commanditaire. 15+ : contrat aux conditions souhaitées. 10-14 : contrat obtenu mais avec une contrainte (délai serré, info incomplète, clause défavorable). 9- : le MC agit.'),
    ('official', NULL, 'Effectuer une recherche', 'esprit', 'Quand tu cherches une information par des moyens analytiques ou mentaux. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : tu trouves quelque chose mais le MC décide ce que tu déclenches en cherchant.'),
    ('official', NULL, 'Aider ou Interférer', 'link', 'Quand tu apportes ton soutien actif à un autre joueur ou lui mets des bâtons dans les roues. Utilise ton score de Lien avec cette personne. Sur un succès en aide : +1 au jet. Sur un succès en interférence : -2 au jet. Dans les deux cas tu t''exposes aux mêmes conséquences que la cible.'),
    ('official', NULL, 'Administrer les premiers soins', 'cran', 'Quand tu stabilises ou soignes un personnage blessé en conditions de terrain. 15+ : ça fonctionne proprement. 10-14 : ça fonctionne mais au prix d''un coût (temps perdu, matériel épuisé, bruit fait). 9- : le MC agit.'),
    ('official', NULL, 'Plan B', NULL, 'Quand tu introduis rétroactivement un élément que tu avais préparé avant la scène en cours — matériel planqué, contact établi, information obtenue, lieu reconnu, accord passé. Dépense [matos], [info] ou Cred selon ce qui est disponible. Un ajout simple et plausible est validé sans jet. Un ajout ambitieux nécessite un jet avec la stat appropriée. 10-14 : l''ajout est valide mais avec une contrainte. 9- : le MC agit.'),
    ('official', NULL, 'Acquérir une concession funéraire', 'chair', 'Déclenché quand ton personnage fait face à une conséquence potentiellement fatale. 15+ : tu survives, peut-être abîmé. 10-14 : tu survives au prix d''un coût narratif important. 9- : le MC décide de ton sort.'),
    ('official', NULL, 'Passer sur le billard', NULL, 'Quand tu accèdes à des soins sérieux ou à l''installation de cyberware. Le coût se paie en Cred — la qualité dépend de ce que tu peux te permettre. 10-14 : l''intervention se fait mais avec une complication.');

-- MOVES FIXER
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', 'Fixer', 'Chromé', NULL, 'Choisis un cyberware supplémentaire à la création ou acquiers-en un nouveau durant un temps mort. À la création, il se prend dans tout le catalogue, mais de mauvaise qualité : il arrive avec des tags négatifs.'),
    ('official', 'Fixer', 'Mobiliser mon équipe', 'pro', 'Quand tu actives tes associés pour une mission ou une tâche précise. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour faire agir ton équipe — le MC juge le coût selon la nature et la difficulté de l''action.'),
    ('official', 'Fixer', 'Mon équipe', NULL, 'Tu as un groupe d''associés qui travaillent pour toi. Définis-les avec le MC — ils deviennent un tag narratif sur ton personnage. Ils ont leurs propres intérêts et peuvent formuler des demandes.'),
    ('official', 'Fixer', 'Deuxième équipe', NULL, 'Tu as un second groupe d''associés. Définis-les avec le MC — ils deviennent un tag narratif supplémentaire sur ton personnage.'),
    ('official', 'Fixer', 'Réseau de contacts', NULL, 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Fixer', 'Réseau étendu', NULL, 'Tu entretiens un second contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Fixer', 'Toucher sa marge', 'pro', 'Quand tu rentres dans tes frais entre deux missions. Actionnable uniquement en phase de préparation. 15+ : +2 Cred. 10-14 : +1 Cred. 9- : -1 Cred, un deal a mal tourné.'),
    ('official', 'Fixer', 'Réputation', 'pro', 'Quand tu rencontres quelqu''un d''important dans le milieu pour la première fois. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour exploiter ta réputation dans cette relation — le MC juge le coût selon la situation.'),
    ('official', 'Fixer', 'Négocier en pro', 'pro', 'Quand tu baratines dans un contexte professionnel ou commercial. Lance 2d10+Pro au lieu de Style. Les seuils et effets sont identiques au move de base Baratiner.'),
    ('official', 'Fixer', 'Réseau d''info', 'pro', 'Quand tu actives ton réseau pour obtenir une information. Lance 2d10+Pro au lieu de Style. Les seuils et effets sont identiques au move de base Battre le pavé.'),
    ('official', 'Fixer', 'Source fiable', 'pro', 'Quand tu cherches à te procurer du matériel via tes connexions. 15+ : 3 [matos]. 10-14 : 1 [matos]. 9- : le MC agit.'),
    ('official', 'Fixer', 'Oreille dans le milieu', 'style', 'Quand tu effectues une recherche en faisant parler tes relations. Lance 2d10+Style au lieu d''Esprit. Les seuils et effets sont identiques au move de base Effectuer une recherche.');

-- MOVES NETRUNNER
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', 'Netrunner', 'Pénétrer un système', 'synth', 'Quand tu tentes d''accéder à un système sécurisé. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : l''ICE s''active. Dépense tes retenues pour agir dans le système — le MC juge le coût selon la nature et la sécurité de l''action.'),
    ('official', 'Netrunner', 'Extraire des données', 'esprit', 'Quand tu fouilles un système pour récupérer des informations. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : tu trouves quelque chose mais le MC décide ce que tu déclenches en cherchant.'),
    ('official', 'Netrunner', 'Contre-mesures', 'esprit', 'Quand tu résistes à une ICE qui s''exécute contre toi. 15+ : aucune conséquence. 10-14 : tu t''en sors mais au prix d''un coût (instabilité de connexion, exposition partielle). 9- : le MC décide des conséquences.'),
    ('official', 'Netrunner', 'Anonyme', NULL, 'Ton interface a un niveau de furtivité élevé. Ta connexion est difficile à tracer — il faut des moyens importants pour remonter jusqu''à toi.'),
    ('official', 'Netrunner', 'Optimisation de recherche', NULL, 'Quand tu effectues une recherche approfondie dans le Net sur un sujet précis. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'),
    ('official', 'Netrunner', 'Programmation à la volée', NULL, 'Quand tu pénètres un système avec succès, tu obtiens toujours 1 retenue supplémentaire.'),
    ('official', 'Netrunner', 'Renom', 'synth', 'Quand tu opères dans le Net avec un avatar reconnaissable. Lance 2d10+Synth pour Baratiner et Montrer les dents dans l''espace numérique. Les seuils et effets sont identiques aux moves de base correspondants.'),
    ('official', 'Netrunner', 'Support technique', 'esprit', 'Quand tu aides un membre de l''équipe depuis le Net. Lance 2d10+Esprit au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'),
    ('official', 'Netrunner', 'Chromé', NULL, 'Choisis un cyberware supplémentaire à la création ou acquiers-en un nouveau durant un temps mort. À la création, il se prend dans tout le catalogue, mais de mauvaise qualité : il arrive avec des tags négatifs.'),
    ('official', 'Netrunner', 'Protection', NULL, 'Quand une ICE Noire s''active contre toi, le MC t''en informe. Tu peux choisir de déclencher ta déconnexion d''urgence sans dépenser de retenue. Sans ce move, te déconnecter face à une ICE Noire coûte des retenues et tu peux ne pas t''en apercevoir immédiatement.'),
    ('official', 'Netrunner', 'Daemon', NULL, 'Tu disposes d''un programme daemon dans ta cyberconsole. Définis-le avec le MC — il devient un tag narratif sur ta cyberconsole. Un daemon réduit ou annule le coût en retenues d''une action spécifique dans le Net, selon sa nature.'),
    ('official', 'Netrunner', 'Daemon avancé', NULL, 'Tu disposes d''un second daemon dans ta cyberconsole. Définis-le avec le MC — il devient un tag narratif supplémentaire sur ta cyberconsole.');

-- MOVES SOLO
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', 'Solo', 'Entrée subreptice', 'cran', 'Quand tu t''introduis dans un lieu sécurisé sans te faire repérer. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour agir discrètement dans le lieu — le MC juge le coût selon la difficulté et le niveau de sécurité.'),
    ('official', 'Solo', 'Haute voltige', NULL, 'Tu peux dépenser des retenues d''Entrée subreptice pour obtenir du [matos] — équipement récupéré sur place, accès sécurisé, matériel trouvé durant l''infiltration. Le MC juge la valeur de l''échange selon la situation.'),
    ('official', 'Solo', 'Imposteur', NULL, 'Tu peux dépenser des retenues d''Entrée subreptice pour obtenir des [info] — ce que tu as observé, entendu ou intercepté durant l''infiltration. Le MC juge la valeur de l''échange selon la situation.'),
    ('official', 'Solo', 'Mère Gigogne', NULL, 'Quand tu réussis Entrée subreptice, tu peux dépenser des retenues supplémentaires pour faire passer des membres de ton équipe avec toi. Le MC juge le coût selon les conditions et le nombre de personnes.'),
    ('official', 'Solo', 'Repérage', 'pro', 'Quand tu reconnais un lieu ou une installation avant une opération. 15+ : 3 [info] sur les failles de sécurité, les routines et les points d''entrée. 10-14 : 1 [info]. 9- : le MC agit.'),
    ('official', 'Solo', 'Premier sang', 'cran', 'Quand tu crées délibérément les conditions d''une attaque surprise. 15+ : tu agis depuis une position de force absolue — le MC ne peut pas te faire subir de conséquence immédiate sur cette première action. 10-14 : tu as l''avantage mais le MC introduit une contrainte. 9- : ta tentative est détectée.'),
    ('official', 'Solo', 'Maître des artifices', 'pro', 'Quand tu te déguises et maintiens une identité de couverture pour accéder à un lieu ou une situation. 15+ : ta couverture est totalement convaincante, tu peux agir librement tant qu''elle est intacte. 10-14 : ça tient mais le MC introduit une contrainte ou une limite. 9- : ta couverture est compromise.'),
    ('official', 'Solo', 'Instinct de survie', 'cran', 'Quand tu lis une situation par tes réflexes et ton instinct de terrain. Lance 2d10+Cran au lieu de Pro. Les seuils et effets sont identiques au move de base Évaluer.'),
    ('official', 'Solo', 'Combattant aguerri', 'cran', 'Quand tu te bats avec technique et sang froid plutôt qu''avec la puissance brute. Lance 2d10+Cran au lieu de Chair. Les seuils et effets sont identiques au move de base Employer la manière forte.'),
    ('official', 'Solo', 'Couvrir ses arrières', 'cran', 'Quand tu soutiens un coéquipier par ton instinct de terrain et tes réflexes. Lance 2d10+Cran au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'),
    ('official', 'Solo', 'Contacts', NULL, 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.');

-- MOVES INVESTIGATOR
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', 'Investigator', 'Reconstitution de scène', 'esprit', 'Quand tu arrives sur les lieux d''un événement passé et que tu lis les indices physiques. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'),
    ('official', 'Investigator', 'Sens de l''observation', 'esprit', 'Quand tu observes activement une personne, un groupe ou un lieu pour en extraire des informations. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'),
    ('official', 'Investigator', 'Constituer un dossier', 'esprit', 'Quand tu consacres du temps à compiler ce que tu sais sur une cible — personne, organisation ou lieu. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour exploiter ce que tu sais sur ta cible — le MC juge le coût selon la situation.'),
    ('official', 'Investigator', 'Filature', 'pro', 'Quand tu suis quelqu''un discrètement sans te faire repérer. 15+ : tu sais exactement où il va et avec qui, sans être détecté. 10-14 : tu obtiens ce que tu cherches mais le MC introduit une contrainte. 9- : le MC agit.'),
    ('official', 'Investigator', 'Employer la manière forte avec Pro', 'pro', 'Quand tu fais usage de la force avec méthode et expérience. Lance 2d10+Pro au lieu de Chair. Les seuils et effets sont identiques au move de base Employer la manière forte.'),
    ('official', 'Investigator', 'Baratiner avec Esprit', 'esprit', 'Quand tu fais parler une source ou un témoin par ta connaissance du dossier. Lance 2d10+Esprit au lieu de Style. Les seuils et effets sont identiques au move de base Baratiner.'),
    ('official', 'Investigator', 'Agir sous pression avec Pro', 'pro', 'Quand tu agis sous pression en t''appuyant sur ton expérience de terrain. Lance 2d10+Pro au lieu de Cran. Les seuils et effets sont identiques au move de base Agir sous pression.'),
    ('official', 'Investigator', 'I need backup', 'pro', 'Quand tu mobilises ton réseau pour une intervention concrète. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour déclencher une intervention — le MC juge le coût selon la nature et l''ampleur de ce que tu demandes.'),
    ('official', 'Investigator', 'Déduction', 'esprit', 'Quand tu identifies une faiblesse exploitable sur une cible, un système ou un dispositif après observation. 15+ : +1 continu pour l''équipe sur toute action directe qui exploite cette faiblesse pour cette scène. 10-14 : +1 forward pour le prochain jet qui l''exploite. 9- : le MC agit.'),
    ('official', 'Investigator', 'Informateurs', NULL, 'Tu entretiens un informateur dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Investigator', 'Réseau étendu', NULL, 'Tu entretiens un second informateur dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Investigator', 'Chromé', NULL, 'Choisis un cyberware supplémentaire à la création ou acquiers-en un nouveau durant un temps mort. À la création, il se prend dans tout le catalogue, mais de mauvaise qualité : il arrive avec des tags négatifs.');

-- MOVES NOMAD
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', 'Nomad', 'Rig', NULL, 'Tu démarres avec un véhicule rigué connecté à ton interface neurale. Définis son profil avec le MC — puissance, aspect, défaut. C''est ton outil, ta maison, ton identité.'),
    ('official', 'Nomad', 'Seconde peau', NULL, 'Quand tu es au volant de ton rig, tu peux t''appuyer sur les caractéristiques de ton véhicule pour absorber une conséquence ou créer une ouverture supplémentaire lors d''un jet d''Agir sous pression. Le MC juge ce que le rig permet selon ses tags.'),
    ('official', 'Nomad', 'Belle bagnole', 'pro', 'Quand tu bats le pavé dans ton rig. Lance 2d10+Pro au lieu de Style. Les seuils et effets sont identiques au move de base Battre le pavé.'),
    ('official', 'Nomad', 'De glace', 'cran', 'Quand tu baratines quelqu''un par ta froideur et ta détermination. Lance 2d10+Cran au lieu de Style. Les seuils et effets sont identiques au move de base Baratiner.'),
    ('official', 'Nomad', 'Un œil dans le ciel', 'pro', 'Quand tu aides ou interfères en utilisant un drone comme appui. Lance 2d10+Pro au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'),
    ('official', 'Nomad', 'As du volant', 'pro', 'Quand tu conduis ton rig au beau milieu d''une situation sous haute tension. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour agir avec ton véhicule — le MC juge le coût selon la difficulté de la manœuvre.'),
    ('official', 'Nomad', 'Réseau nomad', 'cran', 'Quand tu actives le réseau de ton clan pour obtenir des informations sur les routes, les checkpoints ou les mouvements. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'),
    ('official', 'Nomad', 'Survie hors les murs', 'cran', 'Quand tu cherches des ressources dans les Badlands ou en dehors des zones urbaines. 15+ : 3 [matos]. 10-14 : 1 [matos]. 9- : le MC agit.'),
    ('official', 'Nomad', 'Mécano de fortune', 'pro', 'Quand tu répares ou bricoles un véhicule ou un équipement mécanique en conditions de terrain, sans atelier. 15+ : ça fonctionne proprement. 10-14 : ça fonctionne mais au prix d''un coût (temps, pièces sacrifiées, réparation temporaire). 9- : le MC agit.'),
    ('official', 'Nomad', 'Contacts', NULL, 'Tu entretiens un contact sur les routes. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Nomad', 'Réseau étendu', NULL, 'Tu entretiens un second contact sur les routes. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Nomad', 'Chromé', NULL, 'Choisis un cyberware supplémentaire à la création ou acquiers-en un nouveau durant un temps mort. À la création, il se prend dans tout le catalogue, mais de mauvaise qualité : il arrive avec des tags négatifs.');

-- MOVES ROCKERBOY
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', 'Rockerboy', 'Visionnaire', 'style', 'Quand tu crées une connexion émotionnelle et prônes ta vision — sur un individu ou une foule. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour influencer ta cible — le MC juge le coût selon la taille du groupe et sa réceptivité à ta vision.'),
    ('official', 'Rockerboy', 'Beau parleur', NULL, 'Quand tu réussis un Baratiner, tu obtiens automatiquement une [info] supplémentaire sur ton interlocuteur.'),
    ('official', 'Rockerboy', 'Célèbre', NULL, 'Ton nom et ton image sont connus. Ce statut devient un tag narratif sur ton personnage — il ouvre des portes, attire les regards, mais fait aussi de toi une cible.'),
    ('official', 'Rockerboy', 'Chromé', NULL, 'Choisis un cyberware supplémentaire à la création ou acquiers-en un nouveau durant un temps mort. À la création, il se prend dans tout le catalogue, mais de mauvaise qualité : il arrive avec des tags négatifs.'),
    ('official', 'Rockerboy', 'Fanbase', NULL, 'Tu as un groupe de fans et de suiveurs dévoués. Définis-les avec le MC — ils deviennent un tag narratif sur ton personnage. Ils peuvent t''aider, te planquer, te soutenir — mais ils ont leurs propres attentes.'),
    ('official', 'Rockerboy', 'Fanbase extrême', NULL, 'Tu as un second groupe de fans, plus obsessionnels et prêts à tout. Définis-les avec le MC — ils deviennent un tag narratif supplémentaire sur ton personnage. Leur dévotion est sans limite, ce qui peut être aussi dangereux qu''utile.'),
    ('official', 'Rockerboy', 'Agir sous pression avec Style', 'style', 'Quand tu agis sous pression en jouant sur ta présence et ton image. Lance 2d10+Style au lieu de Cran. Les seuils et effets sont identiques au move de base Agir sous pression.'),
    ('official', 'Rockerboy', 'Baratiner avec Pro', 'pro', 'Quand tu négocies ou manipules dans un contexte professionnel en t''appuyant sur ta réputation. Lance 2d10+Pro au lieu de Style. Les seuils et effets sont identiques au move de base Baratiner.'),
    ('official', 'Rockerboy', 'Sous les projecteurs', 'style', 'Quand tu attires délibérément tous les regards sur toi — performance, discours, provocation. 15+ : tous les regards sont sur toi, l''équipe peut agir librement sans être remarquée pour toute cette scène. 10-14 : tu attires l''attention mais le MC introduit une complication. 9- : ça se retourne contre toi ou contre l''équipe.'),
    ('official', 'Rockerboy', 'Contacts', NULL, 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Rockerboy', 'Réseau étendu', NULL, 'Tu entretiens un second contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.');

-- MOVES MEDIA
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', 'Media', 'En direct live', 'pro', 'Quand tu lances une diffusion en direct et joues avec la réaction de ton audience. 15+ : choisis 2 effets parmi ceux disponibles. 10-14 : le MC choisit 1 effet à ta place. 9- : le live se retourne contre toi. Les effets possibles sont définis par le MC selon le contexte de la diffusion.'),
    ('official', 'Media', 'Correspondant de guerre', 'pro', 'Quand tu agis sous pression en danger physique, lance 2d10+Pro au lieu de Cran.'),
    ('official', 'Media', 'Pitbull', 'pro', 'Quand tu ne lâches pas prise sur une situation, une personne ou un sujet malgré les obstacles. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense tes retenues pour forcer une ouverture dans la situation — le MC juge ce que chaque retenue permet selon le contexte.'),
    ('official', 'Media', 'Sources sûres', 'pro', 'Quand tu fais appel à tes informateurs professionnels pour obtenir une information. Lance 2d10+Pro au lieu d''Esprit. Les seuils et effets sont identiques au move de base Effectuer une recherche.'),
    ('official', 'Media', 'Chromé', NULL, 'Choisis un cyberware supplémentaire à la création ou acquiers-en un nouveau durant un temps mort. À la création, il se prend dans tout le catalogue, mais de mauvaise qualité : il arrive avec des tags négatifs.'),
    ('official', 'Media', 'Fouille-merde', 'esprit', 'Quand tu creuses en coulisse sur une cible ou une organisation. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'),
    ('official', 'Media', 'Publication', 'esprit', 'Quand tu publies une révélation en dépensant des [info] sur une cible ou une situation. 15+ : la publication fait l''effet escompté — la cible est exposée, sa réputation ou sa position est fragilisée. 10-14 : la publication sort mais le MC introduit une complication. 9- : ça se retourne contre toi.'),
    ('official', 'Media', 'Battre le pavé avec Esprit', 'esprit', 'Quand tu actives ton réseau par ta connaissance du milieu journalistique. Lance 2d10+Esprit au lieu de Style. Les seuils et effets sont identiques au move de base Battre le pavé.'),
    ('official', 'Media', 'Identité de couverture', NULL, 'Tu maintiens une identité professionnelle de couverture. Définis-la avec le MC — elle devient un tag narratif sur ton personnage ou une relation. Elle ouvre certaines portes et en ferme d''autres.'),
    ('official', 'Media', 'Carte de presse', NULL, 'Tu es une figure publique reconnue dans le milieu médiatique. Ce statut devient un tag narratif sur ton personnage — il ouvre des portes officielles et corporatives, mais en ferme d''autres dans le milieu underground.'),
    ('official', 'Media', 'Contacts', NULL, 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Media', 'Réseau étendu', NULL, 'Tu entretiens un second contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.');

-- MOVES EDGERUNNER
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', 'Edgerunner', 'Voici le plan', 'esprit', 'Quand tu effectues une mise en place tactique et assignes des tâches à ton équipe. 15+ : chaque membre qui suit sa tâche gagne +1 continu pour cette action. 10-14 : un seul membre de ton choix bénéficie du bonus. 9- : le MC agit.'),
    ('official', 'Edgerunner', 'Gestion directe', 'esprit', 'Quand tu emploies la manière forte en commandant en première ligne. Lance 2d10+Esprit au lieu de Chair. Les seuils et effets sont identiques au move de base Employer la manière forte.'),
    ('official', 'Edgerunner', 'Opérations tactiques', NULL, 'Quand tu rates un jet d''Évaluer, tu obtiens toujours 1 retenue. Tu sais toujours tirer quelque chose d''une situation même quand elle tourne mal.'),
    ('official', 'Edgerunner', 'Gestion des ressources', 'pro', 'Quand tu organises l''approvisionnement de ton équipe pendant une phase de préparation. 15+ : 3 [matos]. 10-14 : 1 [matos]. 9- : le MC agit.'),
    ('official', 'Edgerunner', 'Chromé', NULL, 'Choisis un cyberware supplémentaire à la création ou acquiers-en un nouveau durant un temps mort. À la création, il se prend dans tout le catalogue, mais de mauvaise qualité : il arrive avec des tags négatifs.'),
    ('official', 'Edgerunner', 'Analyse de terrain', 'esprit', 'Quand tu évalues une situation sur le terrain. Lance 2d10+Esprit au lieu de Pro. Les seuils et effets sont identiques au move de base Évaluer.'),
    ('official', 'Edgerunner', 'Coordination active', 'esprit', 'Quand tu diriges activement un coéquipier en temps réel pendant une action. 15+ : il bénéficie de +1 continu sur ses jets pour cette scène tant qu''il suit tes instructions. 10-14 : +1 forward sur son prochain jet uniquement. 9- : le MC agit.'),
    ('official', 'Edgerunner', 'Stratégie opérationnelle', 'esprit', 'Quand tu analyses une situation avant d''agir pour anticiper ce qui peut mal tourner. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit. Dépense une retenue pour éviter une complication, un piège ou une situation impossible que tu avais anticipée. Le MC juge ce qu''une retenue permet selon la situation.'),
    ('official', 'Edgerunner', 'Spécialisation opérationnelle', NULL, 'Tu as un background tactique spécifique. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage.'),
    ('official', 'Edgerunner', 'Spécialisation étendue', NULL, 'Tu as un second background tactique. Choisis dans la liste avec le MC — il devient un tag narratif supplémentaire sur ton personnage.'),
    ('official', 'Edgerunner', 'Réseau de contacts', NULL, 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Edgerunner', 'Réseau étendu', NULL, 'Tu entretiens un second contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.');

-- MOVES TECHIE
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', 'Techie', 'Bidouilleur', NULL, 'Tu peux identifier et modifier toute technologie avec laquelle tu es familier. Le MC définit les conditions selon la complexité et la disponibilité du matériel.'),
    ('official', 'Techie', 'Bric-à-brac', 'esprit', 'Quand tu fouilles dans ton matériel ou ton atelier pour récupérer des pièces et des composants utiles. 15+ : 3 [matos] dans ta sphère d''expertise. 10-14 : 1 [matos]. 9- : le MC agit.'),
    ('official', 'Techie', 'Expert', NULL, 'Tu as une sphère d''expertise technique. Choisis dans la liste avec le MC — elle devient un tag narratif sur ton personnage et définit le domaine dans lequel tu peux identifier, modifier et créer.'),
    ('official', 'Techie', 'Analytique', 'esprit', 'Quand tu évalues une situation par ton analyse technique. Lance 2d10+Esprit au lieu de Pro. Les seuils et effets sont identiques au move de base Évaluer.'),
    ('official', 'Techie', 'Court-circuitage', 'cran', 'Quand tu neutralises un système électronique ou de sécurité. 15+ : neutralisé sans trace, personne ne sait que tu es passé par là. Gagne [info] sur la nature du système. 10-14 : neutralisé mais au prix d''une complication ou d''une trace. 9- : le MC agit.'),
    ('official', 'Techie', 'Intérêts diversifiés', NULL, 'Tu as une seconde sphère d''expertise. Choisis dans la liste avec le MC — elle devient un tag narratif supplémentaire sur ton personnage.'),
    ('official', 'Techie', 'Je suis sur le coup', 'cran', 'Quand tu aides un coéquipier dans le domaine de ta sphère d''expertise. Lance 2d10+Cran au lieu du score de Lien. Les seuils et effets sont identiques au move de base Aider ou Interférer.'),
    ('official', 'Techie', 'Se fondre dans la masse', 'cran', 'Quand tu passes inaperçu dans un environnement ou une situation où tu n''as pas ta place. 15+ : plus personne ne s''inquiète de ta présence jusqu''à ce que tu attires l''attention toi-même. 10-14 : ça ira si tu restes discret et t''esquives rapidement. 9- : le MC agit.'),
    ('official', 'Techie', 'Chromé', NULL, 'Accès privilégié aux ripperdocs de ton réseau. Tu peux t''installer du cyberware toi-même durant un temps mort si les pièces sont disponibles.'),
    ('official', 'Techie', 'Obsessionnel', NULL, 'Quand tu effectues une recherche sur un sujet technologique, tu obtiens toujours 1 [info] supplémentaire sur un succès plein ou partiel.'),
    ('official', 'Techie', 'Opérateur de drones', NULL, 'Tu disposes d''un drone que tu as construit. Définis son profil avec le MC — mode de locomotion, gabarit, capacités. C''est un équipement à part entière, pas un simple accessoire.'),
    ('official', 'Techie', 'Flotte de drones', NULL, 'Tu disposes d''un second drone. Définis son profil avec le MC — mode de locomotion, gabarit, capacités.');

-- MOVES ASSASSIN
INSERT INTO moves (type, playbook, name, stat, description) VALUES
    ('official', 'Assassin', 'Arme personnalisée', NULL, 'Tu démarres avec une arme sur mesure. Définis sa base et deux options avec le MC. Donne-lui un nom — elle a une histoire.'),
    ('official', 'Assassin', 'Fantôme', NULL, 'Tu maintiens une identité de couverture. Définis-la avec le MC — elle devient un tag narratif sur ton personnage ou une relation. Des identités supplémentaires peuvent être acquises en fiction contre Cred.'),
    ('official', 'Assassin', 'Œil exercé', 'cran', 'Quand tu observes une cible avant d''agir. 15+ : +1 continu contre elle pour cette scène. 10-14 : +1 forward si tu agis immédiatement. 9- : le MC agit.'),
    ('official', 'Assassin', 'Chromé', NULL, 'Choisis un cyberware supplémentaire à la création ou acquiers-en un nouveau durant un temps mort. À la création, il se prend dans tout le catalogue, mais de mauvaise qualité : il arrive avec des tags négatifs.'),
    ('official', 'Assassin', 'Préparation silencieuse', 'pro', 'Quand tu étudies une cible ou un lieu. 15+ : 3 [info]. 10-14 : 1 [info]. 9- : le MC agit.'),
    ('official', 'Assassin', 'Double vie', NULL, 'Tu maintiens une seconde identité de couverture. Définis-la avec le MC — elle devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Assassin', 'Réseau de contacts', NULL, 'Tu entretiens un contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Assassin', 'Réseau étendu', NULL, 'Tu entretiens un second contact dans le milieu. Choisis dans la liste avec le MC — il devient un tag narratif sur ton personnage ou une relation.'),
    ('official', 'Assassin', 'Contrôler le terrain', 'pro', 'Quand tu entres dans un espace et prends la mesure de ce qui t''entoure. 15+ : 3 retenues. 10-14 : 1 retenue. 9- : le MC agit pendant que tu évalues. Dépense tes retenues pour agir sur la situation — le MC juge le coût selon la nature et la difficulté de l''action.'),
    ('official', 'Assassin', 'Agir sans pression', 'pro', 'Quand tu as créé les conditions favorables avant d''agir — cible isolée, timing maîtrisé, terrain préparé. Lance 2d10+Pro au lieu de Cran. Les seuils et effets sont identiques au move de base Agir sous pression.'),
    ('official', 'Assassin', 'Furtivité', 'cran', 'Quand tu te déplaces, te positionnes ou te dissimules sans être détecté. 15+ : tu es exactement où tu veux être, personne ne sait que tu es là. 10-14 : tu y arrives mais le MC introduit une contrainte ou une complication. 9- : le MC agit.'),
    ('official', 'Assassin', 'Mise en place', 'pro', 'Quand tu prépares le terrain — matériel planqué, accès sécurisé, voie de repli. 15+ : 3 [matos]. 10-14 : 1 [matos]. 9- : le MC agit.');

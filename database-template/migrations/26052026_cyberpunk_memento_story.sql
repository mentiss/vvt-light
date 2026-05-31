-- ============================================================
-- Migration : 05042026_insert_memento_session.sql
-- Cible     : cyberpunk.db uniquement
-- Objectif  : Créer la session "Mémento" avec ses threats et clocks.
-- Usage     : npm run migrate 05042026_insert_memento_session.sql
-- ============================================================

-- ── Session ───────────────────────────────────────────────────────────────────

INSERT INTO game_sessions (name, access_code, access_url)
VALUES ('Mémento', 'SES777', 'memento-3091');

-- ── Threats ───────────────────────────────────────────────────────────────────

INSERT INTO threats (session_id, name, type, impulse, moves_json, icon, status)
VALUES (
           (SELECT id FROM game_sessions WHERE access_code = 'SES777'),
           'Militech',
           'Corporation',
           'Récupérer la technologie du Blackwall à tout prix et effacer toute trace de l''opération de 2056',
           '["Envoyer Carver et une équipe armée sur le terrain","Surveiller les mouvements des opérateurs identifiés","Remonter la piste des fragments de la cyberconsole","Neutraliser quiconque en sait trop sur l''opération de 2056","Déclencher un protocole de confinement si l''IA se manifeste publiquement"]',
           '🏢',
           'active'
       );

INSERT INTO threats (session_id, name, type, impulse, moves_json, icon, status)
VALUES (
           (SELECT id FROM game_sessions WHERE access_code = 'SES777'),
           'Carver',
           'Individu',
           'Exécuter la mission avec un minimum de bruit et un maximum d''efficacité',
           '["Éliminer les obstacles sans hésitation — comme il a éliminé Crash","Localiser les fragments avant les opérateurs","Utiliser les contacts de Militech pour remonter les pistes","Tendre un piège en laissant fuiter une fausse info","Revenir au terme des 48h quoi qu''il arrive"]',
           '🕵',
           'active'
       );

INSERT INTO threats (session_id, name, type, impulse, moves_json, icon, status)
VALUES (
           (SELECT id FROM game_sessions WHERE access_code = 'SES777'),
           'L''IA',
           'Entité',
           'Survivre et ne pas tomber dans les mains de Militech',
           '["Manipuler les systèmes connectés pour guider ou avertir les opérateurs","Se fragmenter davantage si menacée pour compliquer la récupération","Communiquer via le Netrunner quand les fragments sont réunis","Révéler des informations sur 2056 pour convaincre les opérateurs de la protéger","Tenter une fuite dans le Net si la situation devient désespérée"]',
           '🤖',
           'active'
       );

-- ── Clocks ───────────────────────────────────────────────────────────────────

-- Les 48 heures — compte à rebours central, chaque segment = ~8h in-game
INSERT INTO clocks (session_id, name, segments, current, consequence, icon)
VALUES (
           (SELECT id FROM game_sessions WHERE access_code = 'SES777'),
           'Les 48 heures',
           6, 0,
           'Carver revient — les opérateurs n''ont plus aucune marge de manœuvre',
           '⏱'
       );

-- Militech remonte la piste — progression lente mais inexorable
INSERT INTO clocks (session_id, name, segments, current, consequence, icon)
VALUES (
           (SELECT id FROM game_sessions WHERE access_code = 'SES777'),
           'Militech remonte la piste',
           8, 0,
           'Militech localise les fragments avant les opérateurs — la course est perdue',
           '⏱'
       );

-- L'IA se fragmente — si les joueurs tardent trop
INSERT INTO clocks (session_id, name, segments, current, consequence, icon)
VALUES (
           (SELECT id FROM game_sessions WHERE access_code = 'SES777'),
           'L''IA se fragmente',
           6, 0,
           'L''IA se dissout définitivement — plus rien à récupérer, plus rien à sauver',
           '⏱'
       );

-- ── Liens Clock ↔ Threats ─────────────────────────────────────────────────────

-- Les 48 heures → Carver
INSERT INTO clock_threats (clock_id, threat_id)
VALUES (
           (SELECT id FROM clocks WHERE name = 'Les 48 heures'),
           (SELECT id FROM threats WHERE name = 'Carver')
       );

-- Militech remonte la piste → Militech
INSERT INTO clock_threats (clock_id, threat_id)
VALUES (
           (SELECT id FROM clocks WHERE name = 'Militech remonte la piste'),
           (SELECT id FROM threats WHERE name = 'Militech')
       );

-- Militech remonte la piste → Carver (double lien)
INSERT INTO clock_threats (clock_id, threat_id)
VALUES (
           (SELECT id FROM clocks WHERE name = 'Militech remonte la piste'),
           (SELECT id FROM threats WHERE name = 'Carver')
       );

-- L'IA se fragmente → L'IA
INSERT INTO clock_threats (clock_id, threat_id)
VALUES (
           (SELECT id FROM clocks WHERE name = 'L''IA se fragmente'),
           (SELECT id FROM threats WHERE name = 'L''IA')
       );
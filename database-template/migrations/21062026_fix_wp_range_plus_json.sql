-- 20062026_fix_weapon_range_and_json_arrays.sql
-- Chantier 4 (range) + amorce data Chantier 2 (salvo/qualities -> JSON array de tokens bruts)
-- Aucun changement de schéma : les colonnes restent TEXT, on y stocke du JSON.stringify.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) RANGE — Close/Short/Medium/Long (capitalisé) -> close/medium/long/extreme/contact
--    'short' n'existe plus dans la nouvelle liste -> mappé sur 'close' (portée courte)
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE character_weapons SET range = 'close'   WHERE LOWER(range) IN ('close', 'short');
UPDATE character_weapons SET range = 'medium'  WHERE LOWER(range) = 'medium';
UPDATE character_weapons SET range = 'long'    WHERE LOWER(range) = 'long';
UPDATE character_weapons SET range = 'extreme' WHERE LOWER(range) = 'extreme';
-- Pas de mapping vers 'contact' : aucune arme existante n'a pu porter cette valeur,
-- elle n'apparaîtra que sur de nouvelles armes de mêlée créées après ce patch.

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) SALVO — texte libre "A, B, C" -> JSON array ["A","B","C"] (tokens bruts, non traduits)
-- ─────────────────────────────────────────────────────────────────────────────
WITH RECURSIVE split_salvo(id, token, rest) AS (
    SELECT id, NULL, salvo || ','
    FROM character_weapons
    WHERE salvo IS NOT NULL AND TRIM(salvo) != ''
    UNION ALL
    SELECT id,
           TRIM(SUBSTR(rest, 1, INSTR(rest, ',') - 1)),
           SUBSTR(rest, INSTR(rest, ',') + 1)
    FROM split_salvo
    WHERE rest != ''
),
               salvo_tokens AS (
                   SELECT id, token FROM split_salvo WHERE token IS NOT NULL AND token != ''
               ),
               salvo_json AS (
                   SELECT id, json_group_array(token) AS arr FROM salvo_tokens GROUP BY id
               )
UPDATE character_weapons
SET salvo = (SELECT arr FROM salvo_json WHERE salvo_json.id = character_weapons.id)
WHERE id IN (SELECT id FROM salvo_json);

-- Vide/NULL -> array vide explicite
UPDATE character_weapons SET salvo = '[]' WHERE salvo IS NULL OR TRIM(salvo) = '';

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) QUALITIES — même traitement que salvo
-- ─────────────────────────────────────────────────────────────────────────────
WITH RECURSIVE split_qual(id, token, rest) AS (
    SELECT id, NULL, qualities || ','
    FROM character_weapons
    WHERE qualities IS NOT NULL AND TRIM(qualities) != ''
    UNION ALL
    SELECT id,
           TRIM(SUBSTR(rest, 1, INSTR(rest, ',') - 1)),
           SUBSTR(rest, INSTR(rest, ',') + 1)
    FROM split_qual
    WHERE rest != ''
),
               qual_tokens AS (
                   SELECT id, token FROM split_qual WHERE token IS NOT NULL AND token != ''
               ),
               qual_json AS (
                   SELECT id, json_group_array(token) AS arr FROM qual_tokens GROUP BY id
               )
UPDATE character_weapons
SET qualities = (SELECT arr FROM qual_json WHERE qual_json.id = character_weapons.id)
WHERE id IN (SELECT id FROM qual_json);

UPDATE character_weapons SET qualities = '[]' WHERE qualities IS NULL OR TRIM(qualities) = '';
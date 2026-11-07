-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/07112026_cyberpunk_creation.sql
-- Cyberpunk : refonte de la création (spec_cyberpunk.md §9)
--
--   1. Tags verrouillés : posés par une manœuvre (contacts, équipe, sphère…),
--      retirables en mode Édition seulement (§9.8).
--   2. Doublon de la manœuvre Chromé du Fixer : les fiches passent sur la plus
--      ancienne, la plus récente est supprimée.
--   3. Texte de Chromé unifié (Q-C17) : à la création, tout le catalogue, de
--      mauvaise qualité. Le Chromé du Techie (accès aux charcudocs) ne change pas.
--
-- systems: cyberpunk
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE tags ADD COLUMN locked INTEGER NOT NULL DEFAULT 0;

-- ── Doublon Chromé du Fixer ──────────────────────────────────────────────────
INSERT OR IGNORE INTO character_moves (character_id, move_id, acquired_at)
SELECT cm.character_id,
       (SELECT MIN(id) FROM moves WHERE type = 'official' AND playbook = 'Fixer' AND name = 'Chromé'),
       cm.acquired_at
FROM character_moves cm
WHERE cm.move_id IN (
    SELECT id FROM moves
    WHERE type = 'official' AND playbook = 'Fixer' AND name = 'Chromé'
      AND id > (SELECT MIN(id) FROM moves WHERE type = 'official' AND playbook = 'Fixer' AND name = 'Chromé')
);

DELETE FROM character_moves
WHERE move_id IN (
    SELECT id FROM moves
    WHERE type = 'official' AND playbook = 'Fixer' AND name = 'Chromé'
      AND id > (SELECT MIN(id) FROM moves WHERE type = 'official' AND playbook = 'Fixer' AND name = 'Chromé')
);

DELETE FROM moves
WHERE type = 'official' AND playbook = 'Fixer' AND name = 'Chromé'
  AND id > (SELECT MIN(id) FROM moves WHERE type = 'official' AND playbook = 'Fixer' AND name = 'Chromé');

-- ── Texte de Chromé ──────────────────────────────────────────────────────────
UPDATE moves
SET description = 'Choisis un cyberware supplémentaire à la création ou acquiers-en un nouveau durant un temps mort. À la création, il se prend dans tout le catalogue, mais de mauvaise qualité : il arrive avec des tags négatifs.'
WHERE type = 'official' AND name = 'Chromé' AND playbook <> 'Techie';

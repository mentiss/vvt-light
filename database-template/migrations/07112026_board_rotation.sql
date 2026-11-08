-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/07112026_board_rotation.sql
-- Base du module tableau : rotation des objets (lot B)
-- Spec : documentations/spec_tableau.md (§13.3, PB-1)
--
--   • board_items.rotation : degrés, sens horaire, autour du centre de l'objet
--     (images, icônes, textes, rectangles, ellipses ; 0 pour les autres)
--
-- systems: board
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE board_items ADD COLUMN rotation REAL NOT NULL DEFAULT 0;

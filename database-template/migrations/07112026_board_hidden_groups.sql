-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/07112026_board_hidden_groups.sql
-- Base du module tableau : objets cachés aux joueurs et groupes simples (lot C)
-- Spec : documentations/spec_tableau.md (§14.5, PC-1)
--
--   • board_items.hidden   : caché aux joueurs (Q-53), visible du MJ seul
--   • board_items.group_id : groupe simple (Q-56) ; étiquette commune (id d'un des
--     morceaux au moment de grouper), null pour un objet seul
--
-- systems: board
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE board_items ADD COLUMN hidden INTEGER NOT NULL DEFAULT 0;
ALTER TABLE board_items ADD COLUMN group_id INTEGER;

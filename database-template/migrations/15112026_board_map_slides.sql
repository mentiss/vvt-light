-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/15112026_board_map_slides.sql
-- Base du module tableau : diapositive carte en tuiles
-- Spec : documentations/plateforme/spec_tableau.md (§17.3)
--
--   • board_slides.map : nom de la carte (dossier du dossier des cartes du serveur) ;
--     null pour une diapositive libre
--   • l'unité de grille 'km' (Q-T13) ne demande rien : la colonne est un texte
--
-- systems: board
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE board_slides ADD COLUMN map TEXT;

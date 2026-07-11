-- ═══════════════════════════════════════════════════════════════════════════
-- database-template/migrations/11072026_add_boosts_and_pf_session.sql
-- Fabula Ultima — Retours MJ (Lot A3 + Lot C)
--
--   • characters.boosts_attributs : boosts de taille de dé par attribut
--     (chevrons ▲▼ — bonus d'armes, sorts…), JSON {"dex":0,...}, symétrique
--     d'alterations_etat. Cumul libre, borné à l'affichage par d12.
--   • session_characters.pf_depenses : compteur GM manuel de Points Fabula
--     dépensés par personnage et par session (calcul d'XP). Extension slug
--     d'une table partagée base.sql — le CREATE d'origine reste intact.
--
-- Purement additive, rejouable sur base existante, aucun backfill.
-- Exécution : npm run migrate 11072026_add_boosts_and_pf_session.sql
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE characters ADD COLUMN boosts_attributs TEXT DEFAULT '{}';

ALTER TABLE session_characters ADD COLUMN pf_depenses INTEGER DEFAULT 0;
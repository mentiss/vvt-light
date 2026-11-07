-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/06112026_maledictum_superiorite_activable.sql
-- Imperium Maledictum : la Supériorité du groupe peut être désactivée par table
-- Spec : documentations/spec_maledictum.md (§13.2, Q-18)
-- systems: maledictum
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE patrons ADD COLUMN superiority_enabled INTEGER NOT NULL DEFAULT 1;

-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/06112026_fabula_initiative_pj.sql
-- Fabula Ultima : initiative des PJ recalculée
-- Spec : documentations/spec_fabula.md (§11.1)
--
--   La fiche enregistrait la formule des PNJ (moyenne des dés DEX et INT +
--   équipement). Un PJ a 0 + les modificateurs d'initiative de l'équipement
--   porté (emplacement_equipe non NULL), valeur négative possible.
--
-- systems: fabula
-- ═════════════════════════════════════════════════════════════════════════════

UPDATE characters
SET initiative = (
    SELECT COALESCE(SUM(e.mod_initiative), 0)
    FROM character_equipment e
    WHERE e.character_id = characters.id
      AND e.emplacement_equipe IS NOT NULL
);

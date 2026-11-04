-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/04112026_dune_identite_atouts.sql
-- Dune : champs de la feuille officielle et qualité / mots-clefs des atouts
-- Spec : documentations/spec_dune.md (§3.2, Q-13 et Q-14)
--
--   • characters : rôle, faction, traits de personnalité, ambition (texte libre) ;
--   • character_items : qualité (0 à 4, NULL = non renseignée), mots-clefs.
--
-- Tout est facultatif : personnages et atouts existants restent valides tels quels.
--
-- systems: dune
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE characters ADD COLUMN role                TEXT DEFAULT '';
ALTER TABLE characters ADD COLUMN faction             TEXT DEFAULT '';
ALTER TABLE characters ADD COLUMN traits_personnalite TEXT DEFAULT '';
ALTER TABLE characters ADD COLUMN ambition            TEXT DEFAULT '';

ALTER TABLE character_items ADD COLUMN qualite   INTEGER DEFAULT NULL;
ALTER TABLE character_items ADD COLUMN mots_cles TEXT    DEFAULT '';

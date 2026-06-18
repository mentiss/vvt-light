-- Migration : modèle de magie "pratique libre" (Achtung! Cthulhu)
--
-- Contexte : la pratique de lancer de sorts (Chercheur/Traditionnaliste/Amateur)
-- est désormais choisie LIBREMENT par le joueur à la création, indépendamment
-- du talent Lanceur de sorts précis pris. Elle doit donc être stockée plutôt
-- que déduite du talent.
--
-- Ajoute :
--   1. characters.spellcaster_practice : 'researcher' | 'traditional' | 'dabbler' | NULL
--   2. character_spells.flawed         : sort "imparfait" (0/1) — pertinent
--      uniquement pour la pratique Amateur qui peut choisir 2 sorts imparfaits
--      au lieu d'1 sort normal à la création.

ALTER TABLE characters ADD COLUMN spellcaster_practice TEXT DEFAULT NULL;

ALTER TABLE character_spells ADD COLUMN flawed INTEGER DEFAULT 0;
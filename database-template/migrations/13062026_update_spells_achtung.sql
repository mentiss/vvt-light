-- Migration : ajout spell_key et tradition sur character_spells (slug achtung)
-- spell_key  : référence canonique vers SPELLS du config client
-- tradition  : 'celtic' | 'runic' | 'psychic' | null

ALTER TABLE character_spells ADD COLUMN spell_key  TEXT DEFAULT NULL;
ALTER TABLE character_spells ADD COLUMN tradition   TEXT DEFAULT NULL;
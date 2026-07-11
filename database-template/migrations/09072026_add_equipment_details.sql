-- ═══════════════════════════════════════════════════════════════════════════
-- database-template/migrations/09072026_add_equipment_details.sql
-- Fabula Ultima — Catalogue d'équipement (Lot 1)
--
-- Refonte de character_equipment :
--   • Profil structuré des items (catégorie, martial, précision, dégâts,
--     mains, portée, qualité) — plus de formules texte, uniquement des
--     composants, reconstitués à l'affichage par les helpers front.
--   • def_fixe pour les armures lourdes (DEF statique remplaçant la taille
--     de dé DEX).
--   • Remplacement du booléen `equipe` par `emplacement_equipe` : une seule
--     colonne répond à « équipé ? » et « où ? ». NULL = sac à dos.
--
-- ⚠ Stratégie DROP + CREATE : le slug est en développement, les données
--   d'équipement existantes sont volontairement perdues (décision actée).
--   Ne PAS rejouer cette migration sur une base contenant des données à
--   préserver.
--
-- Exécution : npm run migrate 09072026_add_equipment_details.sql
-- ═══════════════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS character_equipment;

CREATE TABLE character_equipment (
                                     id               INTEGER PRIMARY KEY AUTOINCREMENT,
                                     character_id     INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

    -- Nature de l'item (ce qu'il EST — indépendant de sa position)
                                     type_emplacement TEXT    NOT NULL CHECK(type_emplacement IN ('arme','armure','bouclier','accessoire')),

    -- Référence catalogue equipment.js (traçabilité uniquement : l'item est
    -- détaché du catalogue après ajout et reste éditable — modèle préremplissage)
                                     equipment_key    TEXT    DEFAULT NULL,

                                     nom_libre        TEXT    DEFAULT '',
                                     notes_libres     TEXT    DEFAULT '',
                                     prix             INTEGER DEFAULT 0,       -- coût en zénits

    -- ── Profil général ──────────────────────────────────────────────────────
                                     categorie        TEXT    DEFAULT NULL,    -- armes : 'epee','dague','arc','lourde',
    -- 'lance','lutte','jet','articulee',
    -- 'arcanique','arme_a_feu'
                                     est_martial      INTEGER DEFAULT 0,       -- badge informatif — AUCUNE contrainte
    -- logicielle (vérification à la table)
                                     qualite          TEXT    DEFAULT '',      -- texte libre ("Se brise après l'attaque"…)

    -- ── Profil arme ─────────────────────────────────────────────────────────
    -- Formule de précision [attr1 + attr2] + bonus, ex : [DEX+INT]+1
                                     precision_attr1  TEXT    DEFAULT NULL CHECK(precision_attr1 IN ('dex','int','pui','vol') OR precision_attr1 IS NULL),
                                     precision_attr2  TEXT    DEFAULT NULL CHECK(precision_attr2 IN ('dex','int','pui','vol') OR precision_attr2 IS NULL),
                                     precision_bonus  INTEGER DEFAULT 0,
    -- Formule de dégâts [VH + bonus], ex : [VH+8] physique
                                     degats_bonus     INTEGER DEFAULT 0,
                                     degats_type      TEXT    DEFAULT 'physique'
                                         CHECK(degats_type IN ('physique','feu','glace','foudre','air','terre','lumiere','tenebres','poison')),
                                     mains            INTEGER DEFAULT 1 CHECK(mains IN (1, 2)),
                                     portee           TEXT    DEFAULT 'cac' CHECK(portee IN ('cac','distance')),

    -- ── Profil défensif ─────────────────────────────────────────────────────
    -- mod_defense          : bonus additif à la base DEF (taille de dé DEX)
    -- mod_defense_magique  : bonus additif à la base DEF.M (taille de dé INT)
    -- def_fixe             : armures lourdes — si non NULL, DEF = def_fixe
    --                        (la taille de dé DEX est ignorée), les mods des
    --                        autres pièces équipées s'additionnent par-dessus
                                     mod_defense           INTEGER DEFAULT 0,
                                     mod_defense_magique   INTEGER DEFAULT 0,
                                     mod_initiative        INTEGER DEFAULT 0,
                                     def_fixe              INTEGER DEFAULT NULL,

    -- ── Position d'équipement (OÙ il est) ───────────────────────────────────
    -- NULL = dans le sac à dos (remplace l'ancien booléen `equipe`).
    -- 'deux_mains' occupe les deux emplacements de main — exclusif avec
    -- 'main_directrice' et 'main_secondaire'.
    -- Aucune contrainte croisée avec type_emplacement : un bouclier en main
    -- directrice est légal (compétence Boucliers doubles du Gardien).
                                     emplacement_equipe TEXT DEFAULT NULL
                                         CHECK(emplacement_equipe IN ('armure','accessoire','main_directrice','main_secondaire','deux_mains')
                                             OR emplacement_equipe IS NULL),

                                     ordre            INTEGER DEFAULT 0,
                                     created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fabula_equipment_char ON character_equipment(character_id);
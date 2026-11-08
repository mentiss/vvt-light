-- ═════════════════════════════════════════════════════════════════════════════
-- database-template/migrations/08112026_vileborn_challenges_1_tables.sql
-- Vileborn : défis (spec_vileborn_defis.md §II.2)
--
--   • challenges : bibliothèque du MJ (fiches des livres versées une fois, puis
--     les siennes) ;
--   • session_challenges : défis en cours d'une table ;
--   • versement des deux défis du kit (Igritte, Revenante).
--
-- systems: vileborn
-- ═════════════════════════════════════════════════════════════════════════════

-- Bibliothèque des défis du MJ (spec_vileborn_defis.md §II.2) : fiches des livres
-- versées une fois, puis au MJ (modifier, dupliquer, supprimer), et ses propres
-- fiches. sheet : la fiche complète en JSON ; name, source, family en colonnes
-- pour trier et filtrer.
CREATE TABLE IF NOT EXISTS challenges (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL DEFAULT '',
    source       TEXT    NOT NULL DEFAULT 'mj',      -- kit, livre, apocrypha, mj
    family       TEXT    NOT NULL DEFAULT 'other',   -- famille de nuisibles, ou other
    sheet        TEXT    NOT NULL DEFAULT '{}',
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Défis en cours d'une table : copie de la fiche prise au lancement (modifier ou
-- supprimer le modèle ne touche pas un défi engagé), piste, ajustements en jeu, notes.
CREATE TABLE IF NOT EXISTS session_challenges (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id   INTEGER NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES challenges(id) ON DELETE SET NULL,
    sheet        TEXT    NOT NULL DEFAULT '{}',
    progress     INTEGER NOT NULL DEFAULT 0,
    adjust       TEXT    NOT NULL DEFAULT '{}',      -- écart en jeu par approche (−3 à +3)
    notes        TEXT    NOT NULL DEFAULT '',
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vil_session_challenges_session ON session_challenges(session_id);

-- Versement des défis du kit d'initiation (Igritte p. 56, Revenante p. 72)
INSERT INTO challenges (name, source, family, sheet)
    SELECT 'Igritte', 'kit', 'other', '{"source":"kit","page":56,"name":"Igritte","family":"other","kind":"Défi · Masquegriffe","quote":"« En garde ! Je n''aurai aucune pitié ! »","description":"Igritte affronte les Parias conformément aux ordres. Elle manie l''épée comme une diablesse, avec une froideur efficace et précise. Lorsqu''elle se transforme, plus féroce encore, elle ne perd malgré tout jamais le contrôle.","track":5,"difficulty":{"force":1,"will":-1,"influence":0,"reason":-1,"precision":1,"subterfuge":1},"resistances":["Coups bas","Combat rapproché"],"vulnerabilities":["Argentacier"],"triggers":[{"box":3,"text":"Igritte révèle qu''elle fait elle aussi partie de la Malengeance et se transforme en hybride de femme et de panthère. À partir de ce moment, l''affronter avec des approches de Force ou de Précision devient très difficile (7). En outre, chaque test effectué contre elle s''accompagne d''un jet de dé d''obscurité."}],"complications":[{"text":"Igritte vous touche avec son épée ou ses griffes.","effect":"wound","bookEffect":null},{"text":"Vous distinguez une lueur meurtrière dans le regard d''Igritte.","effect":"fear","bookEffect":null},{"text":"Igritte vous pourchasse, vive comme un serpent.","effect":"exhaustion","bookEffect":null},{"text":"Le regard critique de la Mère Éclairée vous pèse.","effect":"shame","bookEffect":null},{"text":"L''Émissaire impérial applaudit avec amusement.","effect":"anger","bookEffect":null}],"dark":{"when":"fromBox","fromBox":3,"threshold":6,"rows":[{"min":7,"text":"Un son à mi-chemin entre le cri et le grondement échappe à Igritte : vous devez tous réussir un test de Volonté normal (5) pour éviter de cocher la peur."},{"min":8,"text":"Igritte vous propulse avec une force stupéfiante vers un de vos compagnons : vous entendez vos os craquer et cochez tous deux une blessure."},{"min":11,"text":"Igritte vous broie entre ses mâchoires : cochez une blessure ; en outre, vous ne pouvez plus vous déplacer à moins de réussir un test difficile (6) pour vous dégager."}]},"rules":["Igritte peut être tenue en respect jusqu''à la fin du défi, mais pas être tuée. Décrivez les effets de chaque réussite en conséquence."],"familyRules":[]}'
    WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE name = 'Igritte' AND source = 'kit');
INSERT INTO challenges (name, source, family, sheet)
    SELECT 'Revenante', 'kit', 'fallen', '{"source":"kit","page":72,"name":"Revenante","family":"fallen","kind":"Défi · Déchu","quote":"« Vous allez payer pour ce que vous m''avez fait. »","description":"Les revenants sont les esprits vengeurs de personnes tuées injustement, qui reviennent posséder leur propre cadavre pour exercer des représailles. On peut renvoyer un revenant dans l''au-delà en détruisant son corps ou en satisfaisant son désir de vengeance.","track":6,"difficulty":{"force":1,"will":2,"influence":1,"reason":0,"precision":1,"subterfuge":1},"resistances":["Insensible à la douleur","Cherche à se venger","Déchaînée"],"vulnerabilities":["Culpabilité","Salpêtre"],"triggers":[{"box":2,"text":"La revenante devient intangible. Interagir physiquement avec elle devient impossible et seuls les sombres héritages qui ne s''appuient pas sur le contact matériel fonctionnent. Utiliser du salpêtre contre la revenante la rend de nouveau tangible."}],"complications":[{"text":"Les mains spectrales de la revenante vous traversent.","effect":"wound","bookEffect":null},{"text":"Vous vivez le souvenir de quelqu''un d''autre : l''impression d''un nœud qui se resserre autour de votre cou.","effect":"fear","bookEffect":null},{"text":"La revenante sape une partie de votre énergie vitale.","effect":"exhaustion","bookEffect":null},{"text":"La revenante pousse un cri de désespoir comme si elle revivait son exécution sommaire.","effect":"insecurity","bookEffect":null},{"text":"La revenante se jette sur un habitant sans défense.","effect":"anger","bookEffect":null}],"dark":{"when":"always","fromBox":null,"threshold":6,"rows":[{"min":6,"text":"La revenante inonde votre esprit d''images de son lynchage : cochez l''insécurité à moins de réussir un test de Volonté normal (5)."},{"min":8,"text":"La rage de la revenante imprègne un arbre voisin dont les branches vous cinglent : cochez une blessure à moins de réussir un test difficile (6)."},{"min":11,"text":"La revenante vous force à revivre l''horreur de son lynchage, vous infligeant de graves meurtrissures : tout le monde reçoit une blessure, puis coche également la peur à moins de réussir un test de Volonté normal (5)."}]},"rules":["Si la revenante assouvit sa vengeance, elle disparaît aussitôt."],"familyRules":[{"name":"Éthérés","text":"Les Déchus passent d''une forme physique à une forme intangible. Intangibles, ils traversent la matière : on ne peut pas les toucher, et ils ne peuvent pas vous toucher. Quand ils prennent une forme physique (en possédant un cadavre ou au contact du salpêtre), ils deviennent tangibles."},{"name":"Sensibles au salpêtre","text":"Exposé à la poudre de salpêtre, un Déchu intangible est forcé de se manifester sous forme physique."},{"name":"Affaire inachevée","text":"Chaque Déchu est retenu dans le monde des vivants par une affaire non résolue. La résoudre le fait disparaître aussitôt."},{"name":"Liés","text":"Les Déchus sont ancrés à un lieu ou à un objet précis. Si l''objet est détruit, le Déchu disparaît aussitôt."}]}'
    WHERE NOT EXISTS (SELECT 1 FROM challenges WHERE name = 'Revenante' AND source = 'kit');

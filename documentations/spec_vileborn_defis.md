# Vileborn — Défis
## Cadrage (phase 1)

> Version 0.3 du 2026-11-08 : recos validées, bibliothèque entière en base (discussion §4), spec technique en Partie II. Demande du MJ : ajouter les **défis** côté MJ, avec les PDF complets du jeu (`X:\jdr\Vileborn\`).
> Au cadrage du slug (`spec_vileborn.md`, Q25 et Q26), le suivi des défis avait été écarté par l'utilisateur, faute du MJ pour trancher : ce chantier revient sur cette décision.

### Sources

| Document | Langue | Défis |
|---|---|---|
| Kit d'initiation (p. 56-57 Igritte, Revenante) | FR | 2, **format du kit** (voir §1) |
| Livre de base, chapitre *Challenges* (p. 212-265 imprimées) | EN | 24 fiches : 3 par famille de nuisibles (*Fallen* : Déchus, *Fae* : Fées, *Ferals* : Polymorphes, *Hexed*, *Shadows* : Ombres, *Vampires*, *Wildkin* ; noms français du kit quand il les donne, les autres à traduire) + Bal de la cour, Duel, Enquête |
| *Apocrypha* (campagne) | EN | 10 fiches liées au scénario (Igritte en 8 cases, Voyage, Évasion du donjon, Gabriel…) |

---

## 1. Ce qu'est un défi

Une situation qui demande **plusieurs réussites** (vaincre un adversaire, traverser une forêt, réussir un bal). Le MJ la mène au tour de rôle ; chaque réussite coche une case de la **piste de progression** ; certaines cases **déclenchent un effet**. C'est bien, comme tu le dis, un mélange de fiche de PNJ et d'horloge.

**Les deux formats ne sont pas les mêmes :**

| Élément | Kit (Igritte p. 56-57) | Livre de base et Apocrypha |
|---|---|---|
| Difficulté | **Valeur absolue** par approche (Force 6, Volonté 4…) | **Modificateur** par approche (+2, +1, 0), ajouté à la difficulté de base choisie par le MJ ; le total peut dépasser 7 |
| Résistances / vulnérabilités | Mots-clés (« coups bas », « argentacier ») : ±1 | Absentes (fondues dans le texte ou les règles spéciales) |
| Piste | 5 cases, **événement** à la 3ᵉ | N cases (4 à 12), **déclencheurs** sur plusieurs cases (ex. 2, 4, 6, 8) |
| Complications | Liste de phrases, chacune avec son état | Tableau phrase → effet (état ou blessure) |
| Dé d'obscurité | Table « 7+ / 8+ / 11+ », après la transformation | Table « 6+ / 8+ / 11+ » à **chaque test** si nuisible |
| Règles spéciales | « Règles uniques » | « Special rules » (+ règles communes à la famille de nuisibles) |

L'Igritte de l'Apocrypha n'est **pas** celle du kit : 8 cases, modificateurs, déclencheurs aux cases 2, 4, 6, 8, pas de transformation.

## 2. Écart à signaler : le livre de base change des règles du kit

Le slug suit le kit (cadrage de novembre). Le livre de base a **6 états**, pas 5 : *Anxiety* (−1 Raison, Précision, Subterfuge : la Colère du kit), *Exhaustion*, *Shame*, *Fear*, *Confusion* (mobiles inutilisables : l'Insécurité du kit) et une nouvelle *Anger* (liens inutilisables). Il parle aussi de *désavantage*.

Les défis du livre infligent ces états. Ce chantier ne touche pas aux règles de la fiche (Q2), mais il faut décider comment on lit ces états.

---

## 3. Questions

Réponds dans la colonne « Réponse ».

### 3.1 Périmètre

| # | Question | Proposition (reco) | Réponse |
|---|---|---|---|
| 1 | Quel **format** de fiche de défi ? | **Celui du livre de base** (modificateur par approche, piste à N cases, déclencheurs par case, complications, table du d12, règles spéciales), avec un champ facultatif « résistances / vulnérabilités » pour reprendre les deux défis du kit tels quels. Le livre est la version finale du jeu et ses 34 fiches (livre + Apocrypha) suivent ce format. | Oui (reco). |
| 2 | Passe-t-on la table aux **règles du livre** (6 états, Colère → Anxiété, Insécurité → Confusion, nouvelle Colère qui bloque les liens) ? | **Non dans ce chantier** : c'est un changement de fiche, de schéma et de règles, à cadrer à part si la table le veut. En attendant, les états des défis du livre sont **traduits vers ceux du kit** : *Anxiety* → Colère, *Confusion* → Insécurité ; *Anger* (absente du kit) → Colère aussi, en signalant l'écart dans la fiche. | Oui (reco) : pas de bascule, états du livre traduits vers ceux du kit. |
| 3 | **Quels défis** transcrire ? | Les **2 du kit** (FR, tels quels) + les **24 du livre de base** (traduits en français). L'**Apocrypha** seulement si la table joue cette campagne : ses fiches dévoilent le scénario, et l'aide de jeu MJ n'est vue que du MJ, donc pas de risque côté joueurs. | Oui pour le kit et le livre ; **Apocrypha aussi** (utilisateur, 2026-11-08 : mieux vaut l'avoir que l'ajouter après). |
| 4 | Le MJ peut-il **créer ses propres défis** (ou copier et modifier une fiche du livre) ? | **Oui** : c'est ce qui sert le plus en jeu (adapter Igritte, improviser une poursuite). Formulaire au même format que les fiches du livre. | Oui (reco). Précisé ensuite : toute la bibliothèque est en base et au MJ (§4). |
| 5 | Les **règles communes** d'une famille de nuisibles (ex. Déchus : éthérés, sensibles au salpêtre, liés à un lieu) : sur la fiche ? | **Oui**, rappelées sous les règles spéciales de chaque défi de la famille, repliées par défaut. | Oui (reco). |

### 3.2 En jeu (côté MJ)

| # | Question | Proposition (reco) | Réponse |
|---|---|---|---|
| 6 | Où vit le défi en cours ? | Un onglet **« Défi »** dans l'interface MJ (à côté de Session) : bouton « Lancer un défi » → catalogue (filtres par famille, recherche) → la fiche s'ouvre en version **jouable**. | Oui (reco). |
| 7 | Plusieurs défis **en même temps** ? | **Oui** (ex. la Revenante pendant un Voyage), empilés en cartes ; un seul déplié à la fois. | Oui (reco). |
| 8 | La **piste de progression** : | Cases cliquables (coche / décoche). Les cases à déclencheur sont marquées en rouge ; **cocher une telle case met son effet en avant** (encadré en tête de la fiche) jusqu'à ce que le MJ le referme. Au bout de la piste : « Défi surmonté ». | Oui (reco). |
| 9 | La **difficulté** : | Bandeau des 6 approches avec le modificateur, et la difficulté finale calculée pour la base choisie (pills Facile 4 · Normale 5 · Difficile 6 · Très difficile 7). Un déclencheur qui change la difficulté (Igritte : « +1 à tous les tests ») se coche à la main, sans moteur de règles. | Oui (reco). |
| 10 | Les **complications** : | Liste de phrases avec l'effet. **Clic sur l'effet → choix du Paria → l'état ou la blessure est cochée sur sa fiche** (même règle que le MJ applique déjà : état déjà coché → blessure). Ça évite l'aller-retour vers l'onglet Session. | Oui (reco). |
| 11 | Le **dé d'obscurité** du défi : | Bouton « Dé d'obscurité » **dans la fiche du défi** : même lancer que l'actuel (public ou caché), mais le résultat affiche **la ligne de la table du défi** atteinte (la plus haute ≤ résultat). Le bouton général de la bande reste pour les d12 improvisés. | Oui (reco). |
| 12 | Le résultat d'un **jet de joueur** doit-il cocher la piste tout seul ? | **Non** : le MJ décide ce qui fait progresser (le livre le dit : « toute action utile » compte, y compris une enquête). Il coche à la main. | Oui (reco). |
| 13 | Une **note libre** par défi en cours (qui a blessé Igritte, PV improvisés…) ? | **Oui**, un champ texte sous la fiche. | Oui (reco). |

### 3.3 Joueurs et stockage

| # | Question | Proposition (reco) | Réponse |
|---|---|---|---|
| 14 | Les **joueurs** voient-ils quelque chose ? (Q26 du cadrage : non) | **Non, comme décidé** : le MJ raconte (« à mi-chemin »). Si l'envie vient, une option « montrer la piste aux joueurs » (nom + cases, rien d'autre) pourra s'ajouter plus tard. | Oui (reco) : rien côté joueurs. |
| 15 | Où est **gardé** le défi en cours ? | Deux options : **A.** dans le navigateur du MJ, par table, comme la Rencontre de Nimble (aucune base, aucune migration ; perdu si le MJ change d'ordinateur). **B.** en base, par table (survit au changement d'appareil, nécessaire si un jour les joueurs voient la piste). Reco : **B** si tu crées tes propres défis (Q4 oui), car ils doivent survivre à un nettoyage du navigateur ; sinon **A**. | **B** (Q4 = oui). |
| 16 | Aide de jeu : la section MJ « Défis et nuisibles » actuelle | Garder la règle (comment mener un défi, mise à jour d'après le livre) ; **retirer les fiches d'Igritte et de la Revenante** de l'aide de jeu, qui passent au catalogue. | Oui (reco). |

---

## 4. Décisions (synthèse)

| Sujet | Décision |
|---|---|
| Format | Celui du livre : modificateur par approche, piste à N cases, déclencheurs par case, complications, table du d12, règles spéciales ; résistances / vulnérabilités facultatives (défis du kit) |
| Règles | Le slug reste sur le kit ; les états du livre sont traduits vers les 5 du kit (*Anxiety* et *Anger* → Colère, *Confusion* → Insécurité) |
| Bibliothèque | **Une seule source : la base.** Kit (2, FR), livre de base (24) et Apocrypha (10), traduits, y sont versés une fois ; ensuite tout appartient au MJ : il modifie, duplique, supprime n'importe quelle fiche, crée les siennes. Pas de retour à la version du livre (dupliquer avant de modifier) |
| En jeu | Onglet **Défis** du MJ, deux vues : **À la table** (défis en cours) et **Bibliothèque** (consulter, créer, modifier, dupliquer, supprimer, lancer) ; plusieurs défis en cours ; piste cochée à la main ; déclencheur mis en avant ; difficulté finale calculée ; complication appliquée à un Paria en un clic ; d12 du défi avec sa table (public ou caché) ; note libre |
| Joueurs | Ne voient rien |
| Stockage | Bibliothèque et défis en cours en base ; un défi lancé est une copie de la fiche |
| Aide de jeu | Règle du défi mise à jour d'après le livre ; Igritte et la Revenante passent à la bibliothèque |

Discussion du 2026-11-08 (utilisateur) : les défis ne sont pas une règle de base portée par la fiche (comme les héritages, gardés dans le code), ce sont des **fiches de PNJ améliorées**, contenu de jeu qui appartient au MJ une fois versé. Une seule source de vérité.

---
---

# Partie II — Spécification technique (phase 2)

> Rédigée le 2026-11-08 d'après le §4 et le code du slug. **À valider avec la planche** `vileborn/planche_defis.html` (vues À la table et Bibliothèque, formulaire).

## II.1 La fiche de défi (objet)

Même forme dans la bibliothèque et dans un défi en cours (JSON en base) :

```js
{
  source: 'kit',                   // 'kit' | 'livre' | 'apocrypha' | 'mj' (provenance, pour filtrer)
  page: 56,                        // page imprimée de la source (null pour un défi du MJ)
  name: 'Igritte',
  family: 'other',                 // famille de nuisibles (filtre), ou 'other' (Igritte est une Masquegriffe, pas une nuisible)
  kind: 'Défi · Masquegriffe',     // sous-titre libre
  quote: '« En garde ! Je n\'aurai aucune pitié ! »',
  description: '…',
  track: 5,                        // cases de la piste (1 à 12)
  difficulty: { force: 1, will: -1, influence: 0, reason: -1, precision: 1, subterfuge: 1 },
  resistances: ['Coups bas', 'Combat rapproché'],   // +1
  vulnerabilities: ['Argentacier'],                 // −1
  triggers: [{ box: 3, text: '…' }],
  complications: [{ text: '…', effect: 'wound', bookEffect: null }],  // effect : clé d'état du kit ou 'wound' ; bookEffect : état d'origine du livre s'il a été traduit ('Anxiety'…)
  dark: { when: 'always', fromBox: null, threshold: null, rows: [{ min: 8, text: '…' }] },
  rules: ['…'],
  familyRules: [{ name: 'Éthérés', text: '…' }],   // règles communes de la famille, recopiées dans chaque fiche
}
```

- **Difficulté du kit** : les valeurs absolues du kit (Igritte 6 / 4 / 5 / 4 / 6 / 6) sont rangées en écart à Normale 5 (+1 / −1 / 0 / −1 / +1 / +1) : identique pour une base Normale, et le MJ ajuste en jeu (II.5).
- **Dé d'obscurité** : `when` vaut `always` (nuisible du livre : à chaque test), `fromBox` (Igritte du kit : après la transformation, case 3) ou `none`. `threshold` : seuil de complication générique (kit : 6+), `null` pour le livre (seules les lignes comptent). La ligne retenue est **la plus haute dont `min` ≤ résultat**.
- **Familles** : dans le livre, complications et règles communes sont données une fois par famille. Elles sont **recopiées dans chaque fiche** au versement : une fiche se suffit, se modifie seule, sans table de familles. Seule la liste des familles (clé, libellé, pour le filtre) vit dans le code (`config/challenges.js`), comme celle des états. Noms français du kit quand il les donne (Déchus, Fées, Polymorphes, Ombres, Vampires) ; *Hexed* et *Wildkin* traduits à la transcription, à relire.

## II.2 Schéma (`vileborn-schema.sql` + migrations, `-- systems: vileborn`)

| Table | Colonnes | Rôle |
|---|---|---|
| `challenges` | `id`, `name` TEXT (copie de `sheet.name`, pour trier), `source` TEXT, `family` TEXT, `sheet` TEXT (JSON de II.1), `created_at`, `updated_at` | La bibliothèque du MJ |
| `session_challenges` | `id`, `session_id` → `game_sessions(id)` **ON DELETE CASCADE**, `challenge_id` → `challenges(id)` **ON DELETE SET NULL** (d'où il vient, pour information), `sheet` TEXT (copie prise au lancement), `progress` INTEGER `0`, `adjust` TEXT `'{}'` (écart en jeu par approche), `notes` TEXT `''`, `created_at`, `updated_at` | Défis en cours d'une table |

- **Versement** : les fiches des livres sont insérées par le schéma (bases neuves) **et** par une migration (base en service), selon la règle des migrations. Une seule fois : ensuite elles sont au MJ, aucune migration ne les retouche.
  - une seule migration, `08112026_vileborn_challenges.sql` : tables, 2 fiches du kit, 34 du livre et de l'Apocrypha (deux fichiers à l'origine : le tri de la release les a joués dans le désordre).
- Un défi lancé est une **copie** : modifier ou supprimer la fiche de la bibliothèque ne touche pas un défi engagé.
- Fiche en JSON plutôt qu'en sous-tables : elle se lit et s'écrit d'un bloc ; seuls `name`, `source` et `family` sont en colonnes, pour trier et filtrer.

## II.3 Serveur (`src/server/systems/vileborn/routes/`)

Toutes les routes : `authenticate, requireGM` (les joueurs ne voient rien, Q14). Aucun socket : seul le MJ lit et écrit ; un autre appareil du MJ relit en ouvrant l'onglet.

| Fichier → URL | Routes |
|---|---|
| `challenges.js` → `/api/vileborn/challenges` | `GET /` (liste : id, name, source, family, sheet) · `POST /` `{ sheet }` (création, duplication) · `PUT /:id` `{ sheet }` · `DELETE /:id` |
| `session-challenges.js` → `/api/vileborn/session-challenges` | `GET /?sessionId=` · `POST /` `{ sessionId, challengeId }` (copie la fiche côté serveur) · `PATCH /:id` `{ progress?, adjust?, notes? }` (COALESCE) · `DELETE /:id` |

Validation : `sheet` objet avec `name` non vide et `track` entier de 1 à 12 ; `progress` entier de 0 à `track` ; `adjust` objet dont les clés sont les 6 approches et les valeurs des entiers de −3 à +3 ; `sessionId` d'une table existante, `challengeId` d'un défi existant. Tests de contrat : `tests/server/systems/vileborn/challenges.test.js` (joueur refusé, MJ accepté, validations, copie au lancement, cascade à la suppression de la table, SET NULL à la suppression du modèle).

## II.4 Front

```
config/challenges.js       FAMILIES, SOURCES, CHALLENGE_EFFECTS, DARK_WHEN ; filtres et groupes de recherche (CatalogModal, bibliothèque)
config/rules/challenge.js  pures, testées : finalDifficulty(sheet, adjust, approach, base),
                           triggerAt(sheet, box), reachedTrigger(sheet, from, to), toggleBox(progress, box),
                           darkRow(sheet, value), darkActive(sheet, progress), isDone(sheet, progress),
                           blankSheet(), duplicateSheet(sheet), cleanSheet(sheet), canSaveSheet(sheet)
hooks/useChallenges.js     bibliothèque + défis en cours de la table (HTTP)
gm/tabs/TabChallenges.jsx  onglet « Défis » : bascule À la table / Bibliothèque
components/challenge/      VilChallengeSheet.jsx (fiche : mode jeu ou lecture) · VilChallengeForm.jsx (créer / modifier)
                           VilChallengeLibrary.jsx (liste filtrée) · VilParaPicker.jsx (Paria d'une complication)
                           VilTrackMini.jsx (piste en miniature des listes)
ChallengeController.js     (serveur) validation, bibliothèque, défis en cours ; les routes délèguent
```

- `GMApp.jsx` : onglet **Défis** entre Session et Journal ; il reçoit `characters`, `order`, `patchCharacter` de `useTableCharacters` (déjà monté).
- **Lancer depuis la table** : `CatalogModal` de la plateforme (filtres Source et Famille, recherche) sur la bibliothèque. **Lancer depuis la bibliothèque** : bouton « Lancer à la table » sur la fiche.
- **Complication** : clic sur l'effet → `VilParaPicker` (Parias de la table) → `patchCharacter(id, sufferState(c, key))`, ou `addWound(c)` pour une blessure : les règles existantes de `config/rules/character.js`.
- **Dé d'obscurité du défi** : `VilDarkDieModal` reçoit une prop facultative `challenge` (seuil prérempli, table affichée). Le jet garde le réglage **Public / Caché** de la modale, choisi à chaque lancer, et passe par le moteur de dés de la plateforme (`useVilRoll` → `diceEngine.roll`, hooks de `config.jsx`, type `vileborn_dark`) : animation, historique et notification comme tout jet ; caché, ni historisé ni diffusé. La ligne atteinte s'affiche **dans la modale du MJ seulement**, jamais dans l'historique (en public, les joueurs voient le d12, pas l'effet écrit).
- **Aide de jeu** : `06-defis.md` réécrit d'après le livre (p. 212-215 : conduite, fiche, connaître un nuisible), sans les fiches d'Igritte et de la Revenante.
- Tests front : `tests/systems/vileborn/rules/challenge.test.js`.

## II.5 L'onglet Défis

Bascule en tête de l'onglet : **À la table** · **Bibliothèque**. **Sans table active**, « À la table » est grisé et l'onglet s'ouvre sur la Bibliothèque ; « Lancer à la table » y est grisé aussi (utilisateur, 2026-11-08).

Les **actions d'une fiche sont en tête**, dans une barre au-dessus du nom (accès immédiat, sans faire défiler), l'action destructrice à droite.

**À la table**
- Liste des défis en cours (nom, piste en miniature, sous-titre) ; un seul affiché. Vide : « Aucun défi en cours » + « Lancer un défi ».
- **Fiche en mode jeu** : en-tête (nom, sous-titre, source et page, citation) · **piste** (cases cliquables, cases à déclencheur en rouge, « Défi surmonté » au bout) · **déclencheur atteint** encadré en tête, refermable · **difficultés** (base en pills 4 · 5 · 6 · 7 ; par approche l'écart, l'ajustement en jeu −/+ et la difficulté finale) · résistances / vulnérabilités · déclencheurs · **complications** (phrase + effet cliquable) · **dé d'obscurité** (quand, seuil, lignes ; bouton de lancer, ligne atteinte surlignée) · règles spéciales, règles de la famille repliées · **notes**. Barre d'actions : Ouvrir le modèle (dans la bibliothèque) · Retirer le défi.

**Bibliothèque**
- Liste filtrée (recherche, Source, Famille), groupée par famille, avec « Nouveau défi ».
- **Fiche en lecture** (même composant, sans piste jouable ni notes). Barre d'actions : Lancer à la table (table active seulement) · Modifier · Dupliquer · Supprimer (confirmation, toute fiche, livres compris).
- **Formulaire** (créer, modifier) : les mêmes blocs que la fiche, en saisie : identité (nom, sous-titre, source, famille, page, citation, description), nombre de cases, écart par approche (−3 à +3), résistances et vulnérabilités (listes de lignes), déclencheurs (case + texte), complications (texte + effet en pills), dé d'obscurité (quand, seuil, lignes), règles spéciales et règles de famille. Barre d'actions : Enregistrer · Annuler.

## II.6 Lots

| Lot | Contenu |
|---|---|
| A | Schéma, migration (tables + 2 fiches du kit), routes, tests serveur ; règles pures et tests ; onglet Défis complet (À la table, Bibliothèque, formulaire) ; aide de jeu |
| B | Transcription et traduction des **24 défis du livre** et des **10 de l'Apocrypha**, familles recopiées dans chaque fiche (agent, relu) ; versement dans la migration du lot A |

## II.7 État du lot A (2026-11-08)

Codé, non commité :
- **Serveur** : tables `challenges` et `session_challenges` (schéma + migration `08112026_vileborn_challenges.sql`, jouée sur la base de dev), Igritte et la Revenante du kit versées (transcrites du kit, règles communes des Déchus recopiées dans la Revenante) ; `ChallengeController.js`, routes `challenges.js` et `session-challenges.js` (MJ seul) ; 9 tests de contrat.
- **Front** : onglet Défis (À la table, Bibliothèque, formulaire), choix du Paria d'une complication (état déjà coché → blessure), dé d'obscurité du défi par la modale existante (Public / Caché, moteur de dés de la plateforme, ligne de la table chez le MJ seulement), confirmations par `ConfirmModal` ; règles pures testées ; aide de jeu « Défis et nuisibles » réécrite d'après le livre (p. 212-215).
- **Écart avec la planche** : le résultat du d12 s'affiche dans la modale du dé (qui porte Public / Caché), pas dans la fiche.
- **Reste** : lot B.

## II.8 État du lot B (2026-11-08)

Codé, non commité : 24 défis du livre de base et 10 de l'Apocrypha traduits (agents, sur le PDF : cases, déclencheurs, difficultés, appariement phrase / effet vérifiés), complications et règles communes de famille recopiées dans chaque fiche ; versés par le schéma et la migration `08112026_vileborn_challenges.sql` (jouée sur la base de dev) ; test de contrat du versement.
- Familles *Hexed* et *Wildkin* traduites **Maudits** et **Sylvestres**.
- **Famine** : le déclencheur sans numéro (« - » dans le livre ; « détruire un foyer déclenche toujours un effet ») est répété sur ses 4 cases.
- **Noms à relire par le MJ** : Lié (*Bound*, proche de la règle « Liés » des Déchus), Ravisseur, Murmure, Défait, Mégère, Sang-Neuf / Sang-Noble / Sang-Ancien, Pourrisson, Rancune ancestrale, Henry des Crêtes ; « foyer » pour *locus*, « fer froid » pour *coldiron*, « verlume » gardé.
- **Écarts du livre gardés tels quels** : Memento cite « Frère Bernard » (Frère Damien dans la scène) ; « avantage » / « désavantage » (absents du kit) dans quelques fiches.

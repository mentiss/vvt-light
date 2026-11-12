# Grilles de relecture

> Statut : **validée** (2026-11-08), implémentée. Grilles dans `code-rules/` (Q2) : `common.md`, `front.md`, `back.md`.
> Ticket « règles », le premier des trois qui suivent l'audit de novembre 2026. Les deux autres : le skill de relecture par Codex, puis la correction des défauts relevés (premier test réel du skill).

## 1. Objectif

Les règles du projet deviennent des **grilles** : un fichier par domaine, chaque règle avec un identifiant, un niveau et sa raison. Ce sont les mêmes règles pour celui qui écrit le code (Claude, via les `CLAUDE.md`) et pour celui qui le relit (Codex, via `AGENTS.md`).

Ce que ça apporte :
- **une seule source** : plus de règles qui divergent entre trois `CLAUDE.md` (l'audit en a trouvé quatre fausses ou dépassées) ;
- **une correction se justifie** : elle cite l'identifiant de la règle enfreinte, sinon c'est une suggestion ;
- **on voit ce qui revient** : compter les identifiants des corrections montre quelle règle est mal placée, mal écrite ou mal suivie, et c'est elle qu'on améliore ;
- **le mécanique est vérifié par la machine** (lint, tests serveur), sans coût et sans erreur ; le relecteur garde le jugement.

## 2. Questions

| # | Question | Ma reco | Réponse                                                                                                        |
|---|---|---|----------------------------------------------------------------------------------------------------------------|
| Q1 | Les règles communes aux deux côtés (fins de ligne, langues, tests, doc à jour, code mort) : un troisième fichier `grille_commune.md`, importé par le `CLAUDE.md` racine ? | Oui. Elles s'appliquent partout, le `CLAUDE.md` racine est toujours chargé, et le fichier reste court (une dizaine de règles). | bah 3 eme fichier, plus simple, une seule source                                                               |
| Q2 | Les grilles vont dans `documentations/` ? | Oui : `documentations/grille_commune.md`, `grille_front.md`, `grille_back.md`. C'est là que vit la doc validée. | non elles vont dans un dossier spécifique aux règles du code, documentation n'a pas vocation à receuillir tout |
| Q3 | Le classement règle / préférence de chaque ligne des §5 à §7 te va ? | Corrige directement dans les tableaux, colonne « Réponse ». | oui ok                                                                                                         |
| Q4 | Les tests serveur qui échoueraient aujourd'hui sur les défauts de l'audit (routes sans authentification, schémas désynchronisés) : on les livre **avec** le ticket « défauts » plutôt qu'avec celui-ci ? | Oui. Sinon il faudrait les commiter avec une liste d'exceptions qui décrit les failles en clair dans le dépôt, ce que tu veux éviter. Ce ticket livre les grilles, le lint et `useFetch` ; les tests serveur arrivent avec leurs correctifs. | oui                                                                                                            |
| Q5 | Exceptions dans le code : un seul format ? | Deux, et c'est le minimum. Règle vérifiée par le lint : `// eslint-disable-next-line no-restricted-syntax -- F-SELECT : raison` (le format standard d'ESLint, qui accepte une raison après `--`). Règle relue par Codex seulement : `// relecture: B-AUTH-USER — raison`. Les deux citent l'identifiant. | ok                                                                                                             |

## 3. Les deux niveaux

- **Règle** : un écart est une **correction**. On la fait, sans arbitrage.
- **Préférence** : un écart est accepté **s'il est justifié** par un commentaire d'exception (§2, Q5). Sans justification, le relecteur le remonte en **suggestion** : tu tranches. Le lint met un avertissement, jamais une erreur.

Une règle qui fait débat (le relecteur hésite, ou une correction semble absurde) est une règle mal écrite : on la précise dans la grille, on ne passe pas en force.

**Principe ou règle.** Une grille ne contient que ce qui se vérifie dans le code. Les principes de travail (pas de sur-ingénierie, ne pas modéliser une mécanique gérée à la table, doc tenue à jour) et ce qui ne relève pas du code restent dans les `CLAUDE.md` : ils guident l'écriture, ils ne fondent pas une correction. Retirés des grilles à la validation : C-LANG, C-DOC, C-OVERENG, F-TABLE-MECH.

## 4. Forme d'une grille

```md
# Grille front

| Id | Niveau | Règle | Pourquoi | Contrôle |
|---|---|---|---|---|
| F-STORAGE | Règle | Jamais `localStorage` / `sessionStorage` en direct hors `app/tools/browserStorage.js` : `usePersistedState`, ou `readStored` / `writeStored`. | Clés rangées par portée, versions et reprises, synchro entre onglets, `try/catch`. | lint |
```

- **Id** : `C-` commun, `F-` front, `B-` back, puis un mot-clé stable. Un identifiant ne change jamais : une règle abandonnée est marquée « retirée », pas renumérotée.
- **Contrôle** : `lint` (ESLint du front), `test` (Vitest serveur), `relecture` (Codex seul). Une règle vérifiée par la machine est aussi dans la grille : elle reste lisible et elle a sa raison.
- Les grilles renvoient aux specs pour le détail (ex. `spec_browser_storage.md`), elles ne le recopient pas.

## 5. Grille commune

| Id | Niveau | Règle | Contrôle | Réponse                                                                          |
|---|---|---|---|----------------------------------------------------------------------------------|
| ~~C-CRLF~~ | Retirée (2026-11-10) | Un fichier existant garde ses fins de ligne (CRLF) ; un nouveau fichier suit ceux de son dossier. | — | `core.autocrlf=true` normalise l'index : pas d'effet sur le diff, 11 fausses corrections au lot 3 des PNJ |
| ~~C-LANG~~ | Retirée | Texte visible par l'utilisateur en français ; identifiants, noms de fichiers et de props en anglais. | — | Pas lié au code donc non                                                         |
| C-SCOPE | Règle | Le diff ne touche que ce que demande le ticket : pas de réécriture complète, pas de lignes modifiées sans rapport. | relecture |                                                                                  |
| C-SPEC | Règle | Le code respecte la spec validée du slug ou de la brique (`documentations/`) ; aucune règle de jeu absente de la spec n'est inventée. | relecture |                                                                                  |
| ~~C-DOC~~ | Retirée | Un changement de contrat, de structure ou de liste (slug ajouté, signature changée, dette résorbée) met à jour le `CLAUDE.md`, la grille ou la spec qui le décrit, dans le même chantier. | relecture | c'est pas du code ça donc non                                                    |
| C-TEST | Règle | Toucher une règle de calcul ou un contrat de route ajoute ou met à jour son test (front : fonctions pures, arborescence miroir de `src/` ; serveur : contrat de route). | relecture |                                                                                  |
| C-SECRET | Règle | Aucun secret dans le code ni dans les logs ; `.env` n'est jamais lu ni affiché. | relecture |                                                                                  |
| C-DEAD | Préférence | Pas de code mort laissé derrière soi : fichier ou export plus importé, bloc commenté, prop ignorée. | relecture |                                                                                  |
| ~~C-OVERENG~~ | Retirée (principe) | Pas de sur-ingénierie : pas de découpage, de fabrique, de validation ou de bibliothèque sans besoin réel. | relecture | C'est quoi le critère pour faire ça, c'est un principe pas une règle ça pour moi |
| C-SIZE | Préférence | Un fichier de logique (pas de données) de plus de 800 lignes se signale, avec une proposition de découpage. | relecture |                                                                                  |
| C-SLUG-ISOLATED | Règle | Ajouter un slug ne modifie aucun fichier hors de ses dossiers, de ses tests et de la doc. | relecture |                                                                                  |

## 6. Grille back

| Id | Niveau | Règle | Contrôle | Réponse |
|---|---|---|---|---|
| B-AUTH-GM | Règle | Une action réservée au MJ (suppression de personnage, envoi d'objet, gestion des tables, purge…) a `authenticate, requireGM`. | test (Q4) | |
| B-AUTH-OWNER | Règle | Lire ou écrire un personnage passe par `authenticate, requireOwnerOrGM`. | test (Q4) | |
| B-AUTH-USER | Règle | Toute route d'écriture a au moins `authenticate`. Seules exceptions : création de personnage, connexion, rafraîchissement du jeton, et ce qui porte un commentaire `relecture:`. | test (Q4) | |
| B-AUTH-CHECK | Règle | Un contrôle d'identité ou de droit ne saute jamais parce qu'un champ est absent : une entrée manquante est un refus. | relecture | |
| B-SQL-PARAM | Règle | Requêtes paramétrées. Un nom de colonne ou de table interpolé vient d'une liste blanche en constante du fichier, jamais de `req.body`, `req.params` ou d'un payload socket. | relecture | |
| B-COALESCE | Règle | Un `UPDATE` de fiche n'écrase pas un champ non fourni (`COALESCE(@col, col)` ou condition `!== undefined`). Un texte vidé (`''`) s'enregistre. | relecture | |
| B-TX | Règle | Une écriture sur plusieurs tables (dont `saveFullCharacter`) est dans une transaction ; `saveFullCharacter` renvoie la fiche rechargée. | relecture | |
| B-SUBTABLE | Règle | Les sous-tables se synchronisent par `syncSubTable` / `updateOrInsert` (ids stables) : jamais « tout supprimer puis réinsérer ». | relecture | |
| B-HELPERS | Règle | Les helpers de `utils/characters.js` (`syncSubTable`, `updateOrInsert`, `parseJson`, `broadcastCharacterUpdate`, `emitToCharacterSessions`) ne sont jamais recopiés dans un slug. | relecture | |
| B-ACCESSCODE | Règle | `saveFullCharacter` mappe `accessCode → access_code`. | test (existant) | |
| B-BROADCAST | Règle | Toute route qui écrit dans `characters` ou une sous-table de fiche diffuse la fiche (`broadcastCharacterUpdate`, ou `emitToCharacterSessions` pour un autre événement). | relecture | |
| B-ROOM | Règle | Un événement de table part vers sa room (`io.to(room)`), jamais par `io.emit` global. | relecture | |
| B-ERR | Règle | Chaque handler a un `try/catch` ou passe par un wrapper ; code HTTP explicite, message exploitable, jamais de stack trace au client. | relecture | |
| B-LOG | Règle | Jamais de jeton, de mot de passe ni de code d'accès dans les logs, y compris à travers une URL loggée. | relecture | |
| B-ROUTE-ORDER | Règle | Les routes spécifiques (`/:id/sessions`) sont déclarées avant les génériques (`/:id`). | relecture | |
| B-ROUTE-URL | Règle | Une route de slug est montée sur `/api/:slug/<fichier>` : l'URL appelée par le client correspond à une route réellement montée. | relecture | |
| B-DB | Règle | Connexion par `req.db`, ou `getDbForSystem` appelé **dans** le handler socket ; jamais de connexion ouverte à la main ni gardée depuis `register`. | relecture | |
| B-DATE | Règle | Les dates se comparent en nombres (`getTime()`, `Date.now()`), jamais une `Date` contre une chaîne. | relecture | |
| B-SOCK-PREFIX | Règle | Un événement écouté par un handler de slug est préfixé `<slug>:`. | relecture | |
| B-SOCK-SIG | Règle | Un handler de slug exporte `register(io, socket)` ; il valide le payload (champ autorisé, type, bornes) et encadre l'écriture d'un `try/catch`. | relecture | |
| B-SOCK-DOMAIN | Préférence | Un nouveau domaine socket de la plateforme est un nouveau fichier de `socket/platform/`. | relecture | |
| B-SCHEMA-SHARED | Règle | Un schéma de slug ne redéfinit pas les tables de `base.sql` ; `characters` a `login_attempts`, `last_attempt_at`, `last_accessed`, `avatar` et la ligne MJ `id = -1`. | test (Q4) | |
| B-FK | Règle | Une clé vers `characters` ou `game_sessions` déclare son `ON DELETE` (le même que `base.sql` pour les tables partagées) ; pas d'`INSERT OR REPLACE` sur une table parente. | test (Q4) | |
| B-MIGRATION | Règle | Un changement de structure modifie le schéma **et** ajoute une migration ; la migration déclare `-- systems:` et référence les lignes par sous-SELECT, jamais par id en dur. | relecture (+ `release` pour l'en-tête) | |
| B-THIN-ROUTE | Préférence | La route valide l'entrée et délègue ; la logique métier vit dans le contrôleur. | relecture | |

## 7. Grille front

| Id | Niveau | Règle | Contrôle | Réponse                                                        |
|---|---|---|---|----------------------------------------------------------------|
| F-STORAGE | Règle | Jamais `localStorage` / `sessionStorage` en direct hors `app/tools/browserStorage.js` : `usePersistedState` dans React, `readStored` / `writeStored` ailleurs ; options de `usePersistedState` en constantes du module. | lint |                                                                |
| F-LAZY | Règle | `React.lazy()` au niveau module (pattern `lazyCache`), jamais dans un composant. | lint |                                                                |
| F-SUBCOMP | Règle | Les sous-composants sont définis au niveau module, jamais dans une fonction de rendu. | lint (règle `static-components` passée en erreur) |                                                                |
| F-KEY | Règle | Pas de clé React par index quand l'élément a un identifiant stable. | relecture |                                                                |
| F-SOCK-OFF | Règle | Chaque `socket.on` a son `socket.off` dans le cleanup de l'effet ; idem listeners `window`, timers. | relecture |                                                                |
| F-SOCK-INFRA | Règle | Les emits d'infrastructure (`join-session`, `leave-session`, `character-loaded`, `character-left`, `gm-set-active-session`, `gm-clear-session`) restent dans les hooks et contextes génériques. | lint |                                                                |
| F-SOCK-EMIT | Règle | Un slug n'émet pas vers le serveur ; tout nouvel emit de slug se discute d'abord, et porte le préfixe `<slug>:`. Dette tolérée : `<slug>:update-session-resources` de dune, achtung, tecumah. | lint (dette en exceptions) |                                                                |
| F-SOCK-LISTEN | Règle | `character-full-update` n'est écouté que par `useGMSession` / `GMPage` ; un slug n'écoute qu'un événement que le serveur émet vraiment. | relecture |                                                                |
| F-HTTP-UPDATE | Règle | Une fiche se modifie par HTTP (`onCharacterUpdate`, `patchImmediate`), jamais par socket. | relecture |                                                                |
| F-FETCH | Règle | Les appels à l'API passent par `fetchWithAuth`. Exception : routes publiques de création et de connexion (`fetch` direct). | relecture |                                                                |
| F-ROLL | Règle | `roll()` renvoie le résultat d'`afterRoll()` ; `buildNotation` est appelé par le composant avant `roll()` ; **un seul type de dé par notation**, plusieurs types = un tableau de notations (un groupe chacune) ; une explosion crée une vague dans son groupe, pas un groupe. | relecture |                                                                |
| F-ROLL-RENDER | Règle | Le rendu d'un jet est déclaré une fois dans `config.jsx` (`dice.renderHistoryEntry`) et sert l'historique comme les notifications, sans marge extérieure. | relecture |                                                                |
| F-SLUG-LINK | Règle | Un lien qui change de slug ou mène à l'accueil est un `<a href>`, jamais `navigate()` / `<Link>`. | relecture |                                                                |
| F-THEME | Règle | Le mode nuit passe par `data-theme`, posé par la plateforme sur `<html>` : jamais de classe `.dark`, de variante `dark:`, ni de `data-theme` reposé sur une page. | lint |                                                                |
| F-THEME-IMPORT | Règle | `theme.css` n'est jamais importé par un fichier du slug (chargé par la page). | lint (anciens imports en exceptions) |                                                                |
| F-TOKENS | Règle | Couleurs par les tokens générés (`primary`, `surface`…, `xxx-default`) : pas de `xxx-base`, pas de couleur Tailwind en dur (`bg-gray-800`) dans la plateforme, pas de classe d'un slug (`viking-*`) hors de ce slug, pas d'hexadécimal hors `theme.css` et configuration de dés. | lint (en partie) |                                                                |
| F-SHRINK | Règle | `shrink-0`, pas `flex-shrink-0`. | lint |                                                                |
| F-STYLE | Préférence | `style=` pour les valeurs réellement dynamiques ou en px fixes ; une classe manquante s'ajoute dans `theme.css`. | relecture |                                                                |
| F-CONTROLS | Préférence | Boutons « pill » plutôt que `<select>` et cases à cocher natives ; un contrôle natif est accepté s'il sert mieux l'ergonomie, justifié en commentaire. | lint (avertissement) |                                                                |
| F-BRICKS | Règle | Les briques de la plateforme sont utilisées, pas recopiées : `Modal` / `HostedModal`, `DiceHistoryPage` / `Panel`, `ToastNotifications`, menus, `TableManagementButton`, `CopyAccessButton`, `ReferenceGuide`, `Board`… Une modale maison se justifie en commentaire. | relecture |                                                                |
| F-CONTRACT | Règle | Les props passées à un composant générique correspondent à sa signature réelle (lue dans la source) : pas de prop inventée ni ignorée. | relecture |                                                                |
| F-SLUG-STRUCT | Règle | Un slug a `config.jsx`, `Sheet.jsx`, `GMApp.jsx` (contenu MJ directement, pas d'indirection `GMView`), `Creation.jsx`, `gm/tabs/TabSession.jsx`. | relecture |                                                                |
| F-GAME-ACTIONS | Règle | Les actions de jeu (équiper, attaquer, lancer les dés…) restent actives quel que soit le mode Édition ; seule l'édition libre y est soumise. | relecture |                                                                |
| F-HASH | Préférence | Onglet courant gardé par `useHashTab`, pas par `window.location.hash` à la main. | relecture |                                                                |
| F-HOOKS | Préférence | Logique réutilisable en hook ; une logique recopiée dans plusieurs slugs est proposée comme brique de la plateforme. | relecture |                                                                |
| ~~F-TABLE-MECH~~ | Retirée (principe) | On ne modélise pas dans l'app une mécanique gérée à la table ; on n'automatise que le pénible. | relecture | Pas évident à à relire ça, c'est plus un principe qu'une règle |

Règle **retirée** par ce ticket : « jamais `fetchWithAuth` dans un tableau de dépendances ». Elle contournait un défaut de `useFetch` (§9).

## 8. Ce que deviennent les `CLAUDE.md` et `AGENTS.md`

**`CLAUDE.md` racine** : garde le projet, la méthode en trois phases, l'architecture, les commandes, l'environnement, la doc. Ses règles vérifiables partent dans `code-rules/common.md` (et `back.md` pour la base de données). Il importe `@code-rules/common.md`. Corrections de l'audit : `maledictum` au tableau des slugs (nimble n'est plus « le plus récent »), signature `register(io, socket)` (et commentaires de `Loader.js`).

**`src/server/CLAUDE.md`** : garde la structure, le fonctionnement réel des sockets, le banc de tests, les middlewares et leur usage. Importe `@../../code-rules/back.md`.

**`src/client/CLAUDE.md`** : garde le routage, les contrats des composants génériques (« ouvre la source »), le moteur de dés, le stockage, la structure d'un slug, les tests. Importe `@../../code-rules/front.md`. Corrections de l'audit : la règle des notations de dés (§7, F-ROLL), la liste exacte des fichiers de la dette socket.

**`AGENTS.md`** (nouveau, racine), lu par Codex :
- le projet en trois lignes, renvoi au `CLAUDE.md` racine pour le contexte ;
- les trois grilles comme référentiel des règles ;
- `documentations/` pour les specs ;
- consignes de base : interface en français, fins de ligne préservées, **aucune commande Git qui modifie l'état** ;
- ce qui est propre à la relecture (format du rapport, corrections et suggestions) vit dans le skill (ticket suivant), pas ici : `AGENTS.md` sert aussi à `/codex-image`.

## 9. `useFetch`

`fetchWithAuth` devient **stable** d'un rendu à l'autre : le jeton et la fonction de rafraîchissement sont lus par référence, la fonction est mémorisée une fois. Effets :
- les `useCallback` / `useEffect` qui la listent ne se recréent plus à chaque rendu (environ 30 cas, dont `setActiveSession` de `useGMSession`, transmis aux slugs) ;
- la règle de contournement disparaît ;
- aucun composant n'est modifié pour ça.

## 10. Lint

Ajouts à `src/client/eslint.config.js`. Chaque contrôle est une copie de la règle `no-restricted-syntax` d'ESLint, nommée par l'identifiant de la grille (`vtt/F-SHRINK`…) : le message du lint cite la règle, et une exception vise une seule règle.

| Règle | Détection | Niveau |
|---|---|---|
| F-STORAGE | `localStorage`, `sessionStorage`, `window.localStorage` hors `app/tools/browserStorage.js` | erreur |
| F-LAZY | relecture seulement : le pattern `lazyCache` appelle `React.lazy` dans une fonction, le lint ne sait pas l'en distinguer | — |
| F-SUBCOMP | relecture seulement : `static-components` signale aussi les composants tirés de `lazyCache` (`PlayerPage`, `CreationPage`), il reste en avertissement | — |
| F-SOCK-INFRA | `emit('join-session' …)` et les cinq autres hors `hooks/`, `context/` | erreur |
| F-SOCK-EMIT | `.emit(` dans `systems/**` | erreur, fichiers de la dette en exceptions |
| F-THEME | `dark:` dans une chaîne de classes, attribut `data-theme` en JSX (la classe `.dark` reste à la relecture : le mot `dark` sert aussi de valeur de thème) | erreur |
| F-THEME-IMPORT | import de `theme.css` dans `systems/**` | erreur, anciens fichiers en exceptions |
| F-TOKENS | `bg-base`, `border-base`, `ring-base`, `viking-` hors `systems/vikings/` (`text-base` est aussi la taille de police de Tailwind : relecture) | erreur |
| F-SHRINK | `flex-shrink-0` | erreur |
| F-CONTROLS | `<select>`, `type="checkbox"` | avertissement |

- **Le nouveau code est en erreur, la dette en exception** : les fichiers existants en écart sont listés dans la configuration, par règle (`LEGACY` en tête du fichier). On retire un fichier de la liste quand on le touche et qu'on le met d'aplomb. Une liste vide est le but, pas une campagne.
- Le code hors périmètre actuel (noctis, combat et PNJ de la plateforme) est dans ces exceptions comme le reste : le jour où leur chantier démarre, leurs fichiers sortent de la liste et la règle s'applique.
- Les 203 avertissements actuels ne changent pas de statut. Ceux d'`exhaustive-deps` qui réclament `fetchWithAuth` restent (le lint ne sait pas qu'il est stable) mais deviennent sans danger : l'ajouter aux dépendances ne change plus rien.
- `F-STORAGE` et `F-SOCK-INFRA` n'ont aucun écart dans le code existant ; `F-CONTROLS` (préférence, avertissement) n'a pas de liste d'exceptions.

## 11. Tests serveur (livrés avec le ticket « défauts », Q4)

Deux tests ajoutés au banc existant (`tests/server/`) :
- **droits des routes** : pour chaque routeur (partagé et de slug), toute route `POST`/`PUT`/`PATCH`/`DELETE` porte `authenticate` (directement ou par `router.use`), sauf la liste publique de B-AUTH-USER ; les routes listées comme MJ portent `requireGM` ;
- **schémas** : chaque schéma de slug, créé en mémoire, a exactement les colonnes et les `ON DELETE` des tables de `base.sql`, les colonnes obligatoires de `characters` et la ligne `id = -1`.

## 12. Fichiers touchés (implémentation)

- Nouveaux : `code-rules/common.md`, `code-rules/front.md`, `code-rules/back.md`, `AGENTS.md`.
- Modifiés : `CLAUDE.md`, `src/client/CLAUDE.md`, `src/server/CLAUDE.md`, `src/server/systems/Loader.js` (commentaires), `src/client/src/app/hooks/useFetch.js`, `src/client/eslint.config.js`.
- Pas de code applicatif modifié hors `useFetch`.

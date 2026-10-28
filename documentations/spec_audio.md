# Spec — Lecteur audio synchronisé (façon Watch2Gether)

> Version 0.4 — Phase 2 : spécification technique  
> Statut : **Spécification validée par le MJ (§6, §9). Implémentation : prototype validé (§9.9), serveur fait, lecteurs et interfaces à venir**  
> Dernière mise à jour : octobre 2026

---

## 1. Besoin exprimé

Diffuser de la musique et du son, synchronisés, à tous les connectés d'une même table / session.

- Le MJ choisit, à tout moment, quel morceau de quelle playlist est joué.
- Le MJ gère les playlists : création, suppression, ajout de liens YouTube, suppression d'un son, déplacement d'un son d'une playlist à l'autre.
- Chaque participant règle le son à sa convenance.
- Objectif fort : **pas de publicité**.

Brique plateforme (backlog du 2026-10-18 : « Intégration façon Watch2Gether pour le son uniquement : playlist, lecture synchronisée, éventuellement soundboard MJ »), donc commune à tous les slugs, sans fichier à toucher dans un slug.

---

## 2. Comment fait Watch2Gether, et le problème des pubs

Watch2Gether **ne supprime pas les pubs YouTube**. Il intègre le lecteur officiel de YouTube (IFrame API) dans sa page, et ne fait que synchroniser les commandes (lecture, pause, position) entre les participants. Les pubs viennent de YouTube, à l'intérieur de ce lecteur intégré :

- une vidéo monétisée peut afficher une pub avant ou pendant la lecture, y compris en intégration ;
- un participant connecté à YouTube avec un abonnement **Premium** n'en voit pas ;
- un participant équipé d'un bloqueur (uBlock Origin…) n'en voit généralement pas ;
- Watch2Gether ajoute en plus ses propres bannières, retirées par son abonnement payant.

L'impression de « moins de pubs » qu'on peut avoir sur Watch2Gether tient donc surtout aux bloqueurs ou à Premium des participants, pas à une technique propre au site. **Avec le lecteur YouTube, aucune application ne peut garantir l'absence de pub** (et la contourner par code enfreint les conditions de YouTube).

Effet de bord à table : la pub ne tombe pas au même moment pour tout le monde, donc un joueur qui subit une pub de 15 s est désynchronisé et le lecteur doit le recaler ensuite.

---

## 3. Les trois façons de lire le son

| | A. Lecteur YouTube intégré | B. Extraction de l'audio YouTube sur le serveur | C. Fichiers audio hébergés sur le serveur |
|---|---|---|---|
| Principe | Lecteur YouTube invisible (ou réduit) dans la page, piloté par l'IFrame API | Le serveur télécharge la piste audio d'un lien YouTube (outil `yt-dlp`) puis la sert comme un fichier | Le MJ téléverse ses MP3 / OGG (achetés, libres de droits, Tabletop Audio, bandes originales…) |
| Pubs | Possibles, selon le joueur (Premium / bloqueur) | Aucune | Aucune |
| Ajout d'un son | Coller un lien : immédiat | Coller un lien : quelques secondes de téléchargement | Téléverser un fichier |
| Synchronisation | Correcte, perturbée par les pubs et la mise en mémoire tampon de YouTube | Excellente (lecteur audio du navigateur) | Excellente |
| Fiabilité | Vidéo supprimée, rendue privée ou interdite d'intégration : le son disparaît | **Fragile** : YouTube bloque souvent les adresses de serveurs (« confirmez que vous n'êtes pas un robot »), `yt-dlp` casse régulièrement et demande des mises à jour fréquentes | Totale : le fichier est chez nous |
| Place disque sur le VPS | Aucune | Oui (env. 1 Mo par minute en qualité correcte) | Oui (idem) |
| Cadre légal | Conforme aux conditions de YouTube | Contraire aux conditions de YouTube ; copie d'œuvres protégées, même en usage privé entre amis | Dépend de la source des fichiers (achat, licence libre) |
| Travail | Moyen | Le plus lourd (outil externe sur le VPS, file de téléchargement, maintenance) | Moyen (téléversement, stockage) |

**Recommandation** : un morceau a une **source**, `fichier` ou `youtube`, et le lecteur sait lire les deux.

- **C** comme voie principale : seule à garantir zéro pub et une synchro parfaite, sans dépendre de YouTube.
- **A** en complément, pour la souplesse du « je colle un lien » ; la pub reste alors l'affaire de chaque joueur (Premium, bloqueur), ce qui est exactement la situation de Watch2Gether.
- **B** déconseillée : la plus séduisante sur le papier, mais le blocage des adresses de VPS par YouTube la rend peu fiable en pratique, en plus du problème de conditions d'utilisation. Si elle est voulue malgré tout, elle peut venir plus tard sans rien casser : un lien YouTube converti devient simplement un morceau de source `fichier`.

**Décision du MJ (2026-10-24) : A seule.** YouTube uniquement, aucun fichier son sur le serveur (12 Go de disque, bande passante non prévue pour ça). Les pubs sont laissées aux bloqueurs des joueurs (Firefox, Brave, Opera), comme aujourd'hui sur Watch2Gether, où personne ne s'en plaint.

---

## 4. Points techniques à connaître dès maintenant

- **Lecture automatique bloquée par les navigateurs** : un navigateur refuse de jouer du son tant que l'utilisateur n'a pas cliqué dans la page. Chaque participant devra cliquer une fois sur « Activer le son » à l'ouverture de sa page (puis après chaque rechargement). Incontournable, quelle que soit l'option.
- **Synchronisation** : le serveur garde l'état de lecture de la session (morceau, en lecture ou en pause, position, instant de référence). Chaque client calcule où il doit en être et se recale s'il dérive de plus d'environ une seconde. Un joueur qui arrive en cours de route rejoint le morceau à la bonne position. Précision visée : de l'ordre de la demi-seconde, largement suffisante pour de l'ambiance.
- **Volume** : purement local à chaque participant (mémorisé dans son navigateur), aucun échange réseau.
- **Titres YouTube** : récupérables automatiquement à l'ajout du lien (service oEmbed de YouTube, sans clé d'API).
- ~~**Pas d'infrastructure de téléversement aujourd'hui**~~ : sans objet, l'option C est écartée.
- **Emplacement des données** : aujourd'hui, une base par slug. Le backlog prévoit de cadrer la refonte de plateforme (base centralisée) avant les briques combat / battlemap, justement pour l'emplacement de leurs données ; la question se pose aussi ici (voir Q-1).
- **Montage** : panneau MJ et mini-lecteur joueur montés par `GMPage` / `PlayerPage`, comme l'emplacement à modales du menu hamburger, avec des classes `vtt-audio*` habillables par slug.

---

## 5. Questions

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                                                                                                                                                       |
|---|---|---|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Q-1 | Où vivent les playlists ? (a) une bibliothèque commune à toute la plateforme (la musique de ton campement sert dans plusieurs jeux) ; (b) par slug, dans la base du slug (tables ajoutées à `base.sql`, donc présentes dans les 9 bases) | (a), dans une petite base « plateforme » dédiée, premier morceau de la future base centralisée. Fichiers audio de toute façon communs sur le disque | Par slug. Pas par sessions parce que j'utilise souvent les mêmes d'une sessions à l'autre. Ou alors faut la possibilité d'utiliser les playlists d'une autres sessions du même slugs, mais ça complexifie. Ce qu'il faut c'est surtout des collections. Chaque collection inclues des playlist, chaque playlist a des vidéos yt. |
| Q-2 | Sources : fichiers téléversés, liens YouTube, ou les deux ? Veux-tu malgré tout l'extraction YouTube (option B) ? | Les deux (C + A), pas de B pour l'instant | Non                                                                                                                                                                                                                                                                                                                              |
| Q-3 | « Chacun peut bouger le son » : volume et coupure seulement, ou aussi pause / avance pour soi ? | Volume et coupure seulement : la position reste celle du MJ, sinon la synchro perd son sens | Uniquement le volume, seul le GM peut contrôler pause, position de la "tête de lecture" etc                                                                                                                                                                                                                                      |
| Q-4 | Un son appartient-il à une seule playlist (on le **déplace**) ou peut-il figurer dans plusieurs (on le **copie** aussi) ? | Déplacer, plus copier vers une autre playlist (un même fichier n'est stocké qu'une fois) | Il peut figurer dans plusieurs                                                                                                                                                                                                                                                                                                   |
| Q-5 | Ordre dans une playlist : réordonnable par glisser-déposer ? | Oui | Ordonnable drag'n'drop                                                                                                                                                                                                                                                                                                           |
| Q-6 | Enchaînement : à la fin d'un morceau, on s'arrête, on boucle le morceau, on passe au suivant, on boucle la playlist, aléatoire ? | Réglage par playlist (morceau en boucle / playlist en boucle / arrêt), aléatoire en option. Ambiance = boucle le plus souvent | ça passe au morceau suivant dans la playlist et si plus de lien, ça stop                                                                                                                                                                                                                                                         |
| Q-7 | Transition entre deux morceaux : coupure sèche ou fondu enchaîné ? | Fondu enchaîné de 2-3 s (faisable aussi avec YouTube, en jouant sur le volume de deux lecteurs) | non pas de fondu, restons simple, iso Watch2Gether en gros                                                                                                                                                                                                                                                                       |
| Q-8 | Plusieurs pistes en même temps ? (ex. musique + pluie + feu de camp) | Hors v1 : une seule piste musicale. Les couches d'ambiance sont proches du soundboard | Non, là ça serait un soundboard en effet, c'est pas le principe visé                                                                                                                                                                                                                                                             |
| Q-9 | Soundboard MJ (effets ponctuels joués par-dessus la musique : coup de feu, porte, cri) : dans ce chantier ou plus tard ? | Plus tard, mais le modèle de données le prévoit (une playlist « effets » jouée en un coup) |                                                                                                                                                                                                                                                                                                                                  |
| Q-10 | Portée de la diffusion : la session de jeu ouverte (room `${slug}_session_${id}`), ou toute la table même hors session ? | La session ouverte, comme le reste du temps réel | La session uniquement, c'est rare mais si deux tables/sessions, on ne veut pas avoir la même chose ou polluer l'un ou l'autre.                                                                                                                                                                                                   |
| Q-11 | Le MJ entend-il aussi la musique (même lecteur que les joueurs), ou seulement la pilote ? | Il l'entend, avec son propre volume, et peut couper chez lui | Oui il entend aussi, il a juste plus de contrôle que les joueurs                                                                                                                                                                                                                                                                 |
| Q-12 | Visibilité pour les joueurs : voient-ils le titre du morceau et la playlist, ou juste un indicateur « musique en cours » ? | Titre visible, playlist masquée (le nom de playlist peut trahir une scène) ; réglable ? | euh oui comme ta reco, et réglable oui pourquoi pas                                                                                                                                                                                                                                                                              |
| Q-13 | Persistance de l'état : après un redémarrage du serveur ou une coupure, la musique doit-elle reprendre seule ? | Non : état en mémoire, le MJ relance. Plus simple, et un redémarrage en pleine partie est rare | Au plus simple dans un premier temps                                                                                                                                                                                                                                                                                             |
| Q-14 | Téléversement : taille maximale par fichier, et budget disque total sur le VPS ? | 30 Mo par fichier, pas de quota global au départ (place à vérifier sur le VPS) | Non, pas de fichiers son sur le serveur                                                                                                                                                                                                                                                                                          |
| Q-15 | Où se trouve l'interface MJ : onglet dédié, panneau flottant toujours accessible, élément du menu hamburger ? | Panneau flottant repliable : le MJ change de musique sans quitter l'onglet où il joue | oui un panneau flottant qu'il peut agrandir plein écran si besoin                                                                                                                                                                                                                                                                |
| Q-16 | Et côté joueur : mini-lecteur flottant discret (titre, volume, coupure), ou réglage dans le menu hamburger ? | Petit bouton flottant (haut-parleur) qui déplie le volume, plus le bandeau « Activer le son » au premier chargement | Petit truc flottant, qu'il peut masquer etc. C'est réglable et ça reste en mémoire                                                                                                                                                                                                                                               |

---

## 6. Décisions (2026-10-24)

**Déploiement**
- **Pilote sur Vikings seul.** Les autres slugs suivront plus tard. **Noctis exclu** (Q-33).

**Source**
- YouTube seul (lecteur intégré, IFrame API). Aucun fichier son sur le serveur, pas d'extraction (Q-2, Q-14).

**Mutualisation**
- Brique **commune à tous les slugs**, mais **pas imposée** à un slug, et c'est **le MJ qui décide, session par session**, de l'utiliser ou non.
- Lecteurs (MJ et joueur) et modale « Activer le son » montés par les pages plateforme `GMPage` / `PlayerPage`, seulement si la musique est activée sur la session ; désactivée : ni lecteur, ni modale (Q-29, Q-30).
- Activation par un **élément prêt à l'emploi** fourni par la plateforme, que le slug pose dans son onglet Session (`TabSession`). Un slug qui ne le pose pas n'a pas la musique : pas de réglage de config (Q-31, Q-32).
- Choix d'activation **mémorisé avec la session** (Q-30).

**Habillage**
- Même fonctionnement que les modales et le menu hamburger : style par défaut de la plateforme dans `index.css` (`@layer components`, variables `--color-*` seulement), classes `vtt-audio*` que chaque slug surcharge dans son `theme.css`, hors couche.
- La modale « Activer le son » passe par la `Modal` générique : elle hérite de l'habillage des modales déjà en place dans chaque slug.
- L'habillage d'un slug se fait dans le lot où ce slug reçoit la brique.

**Organisation et données**
- Bibliothèque **par slug**, dans la base du slug, indépendante des sessions : le MJ réutilise les mêmes playlists d'une session à l'autre (Q-1).
- Trois niveaux : **collection** → **playlists** → **vidéos YouTube** (Q-1).
- Une même vidéo peut figurer dans plusieurs playlists, sous forme de **copies indépendantes** (Q-4, Q-19). Le MJ peut aussi déplacer une vidéo d'une playlist à l'autre (besoin initial).
- Ordre des vidéos dans une playlist modifiable par glisser-déposer (Q-5).
- Copie et déplacement d'une vidéo vers n'importe quelle playlist du slug, y compris d'une autre collection ; une playlist peut changer de collection (Q-20).
- Ajout d'une vidéo par son lien : titre repris automatiquement de YouTube, renommable ensuite par le MJ (Q-21).
- **Import d'une playlist YouTube entière** par son lien : indispensable (Q-22).
- Gestion (collections, playlists, vidéos) réservée au MJ.

**Lecture**
- Diffusion limitée à la **session** ouverte : deux tables en parallèle ne s'entendent pas (Q-10).
- Seul le MJ commande la lecture (Q-3, Q-24) : lancer un morceau par un clic dans la liste, lecture / pause, précédent / suivant, barre de position. Rien de plus en v1 (évolutions : §8).
- En fin de morceau : passage au suivant de la playlist ; après le dernier, arrêt (Q-6).
- La lecture suit la playlist **du morceau lancé**, quelle que soit celle que le MJ consulte dans son panneau (Q-25).
- Vidéo indisponible (supprimée, privée, intégration interdite) : passage automatique au morceau suivant, vidéo signalée en erreur dans le panneau MJ (Q-23).
- Coupure sèche entre deux morceaux, pas de fondu (Q-7).
- Une seule piste à la fois, pas de superposition (Q-8).
- État de lecture en mémoire du serveur : après un redémarrage, le MJ relance (Q-13).

**Son et affichage**
- Chacun règle **son volume**, localement, au-dessus du lecteur YouTube (le réglage n'agit que sur son propre navigateur). Le MJ entend aussi la musique, avec son volume à lui (Q-3, Q-11).
- Une **modale « Activer le son »** s'affiche **toujours** à l'arrivée sur une session où la musique est activée, même sans morceau en cours (contrainte des navigateurs), avec un bouton « Plus tard » ; le lecteur flottant permet d'activer le son ensuite (Q-26).
- **Son seul** : le lecteur YouTube est entièrement caché, aucune image (Q-17, choix assumé du MJ : cercle fermé, aucun usage commercial).
- Joueurs : titre du morceau visible, playlist masquée. Le MJ peut masquer le titre, par session, depuis son panneau ; réglage gardé en mémoire avec l'état de lecture (Q-12, Q-28).
- MJ : panneau flottant, agrandissable en plein écran (Q-15).
- Joueur : petit lecteur flottant, masquable, réglages mémorisés dans son navigateur (Q-16).

---

## 7. Questions, second tour

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| Q-17 | **Vidéo visible ou son seul ?** Les règles développeur de YouTube interdisent de séparer le son de l'image et imposent un lecteur d'au moins 200 × 200 px. Watch2Gether affiche la vidéo. Un lecteur caché marche techniquement, mais sort de ces règles (risque très faible pour un usage entre amis, à toi de voir) | Vidéo visible dans le lecteur flottant (MJ et joueurs), en petit ; le joueur qui masque son lecteur continue d'entendre | Son seul, vidéo complètement cachée : cercle fermé, aucun usage commercial |
| Q-18 | Conséquence de Q-17 : si la vidéo est visible, YouTube affiche lui-même le titre par-dessus au démarrage. Le réglage « masquer le titre » (Q-12) ne vaut alors que pour notre affichage | L'accepter : le réglage masque notre titre et le nom de la playlist, pas l'incrustation de YouTube | Sans objet (vidéo cachée) : le réglage masque tout |
| Q-19 | Une vidéo présente dans deux playlists : **deux copies indépendantes** (renommer ou supprimer l'une ne touche pas l'autre), ou **la même vidéo partagée** (renommée partout) ? | Copies indépendantes : plus simple, et supprimer d'une playlist ne surprend jamais | Copies, plus simple |
| Q-20 | Copie et déplacement **entre collections** : une vidéo, voire une playlist entière, peut-elle passer d'une collection à une autre ? | Oui pour les vidéos (copier / déplacer vers n'importe quelle playlist du slug) ; playlist déplaçable d'une collection à l'autre | Oui, comme proposé |
| Q-21 | Le titre d'une vidéo : repris automatiquement de YouTube à l'ajout, puis renommable par le MJ ? | Oui | Oui |
| Q-22 | Importer d'un coup une **playlist YouTube existante** en collant son lien ? (faisable sans clé d'API, par le lecteur YouTube lui-même) | Oui, ça évite de recoller 30 liens un par un | Oui, obligatoire |
| Q-23 | Vidéo indisponible (supprimée, privée, intégration interdite) : que fait le lecteur ? | Passe au morceau suivant, et la vidéo est signalée en erreur dans le panneau MJ | Oui, passage au suivant |
| Q-24 | Commandes du MJ : lancer un morceau par un clic dans la liste, lecture / pause, précédent / suivant, barre de position. Faut-il autre chose (file d'attente « à jouer ensuite », boucle d'un morceau à la demande) ? | Rien de plus en v1 ; la boucle d'un morceau peut venir ensuite | Rien de plus pour l'instant ; garder ces pistes en évolution, plus le bouton raccourci (§8) |
| Q-25 | Changer de playlist pendant la lecture : le morceau en cours continue jusqu'à ce que le MJ en lance un autre, ou bien la lecture enchaîne sur la playlist affichée ? | La lecture suit la playlist **du morceau lancé**, quelle que soit celle que le MJ consulte | Oui |
| Q-26 | Modale « Activer le son » : toujours à l'arrivée sur la session, ou seulement quand une musique est en cours ? | Toujours (sinon le son n'arrive pas quand le MJ lance plus tard), avec un bouton « Plus tard » ; le lecteur flottant permet de l'activer ensuite | Toujours |
| Q-27 | Le soundboard (Q-9 sans réponse) : hors de ce chantier, d'après Q-8 ? | Oui, hors chantier, idée gardée au backlog | Hors chantier |
| Q-28 | Réglage « masquer le titre » (Q-12) : par session, choisi par le MJ dans son panneau ? | Oui, par session, en mémoire comme l'état de lecture | Oui |
| Q-29 | **Disponibilité par slug.** Brique mutualisée, mais pas imposée. Deux lectures possibles : (a) disponible d'office dans tous les slugs, un slug peut s'en retirer par une ligne de config ; (b) absente par défaut, un slug l'active par une ligne de config | (a) : rien à coder dans un slug pour l'avoir (montée par `GMPage` / `PlayerPage`), retrait possible par `audio: false` dans le `config.jsx` du slug. Les tables existent dans toutes les bases (`base.sql`), même inutilisées : sans conséquence | Intégré au niveau des pages plateforme. Voir Q-32 : le retrait par config devient inutile |
| Q-30 | **Activation par session**, décidée par le MJ. Musique désactivée : aucun lecteur, aucune modale chez les joueurs. Ce choix est-il **mémorisé** avec la session (on la retrouve activée la fois suivante) ? | Oui, mémorisé en base avec la session (nouvelle colonne sur `game_sessions`, migration `-- systems: all`), activable et désactivable à tout moment depuis l'interface MJ | Désactivé : ni lecteur, ni modale. Oui, mémorisé avec la session |
| Q-31 | Où le MJ active-t-il la musique d'une session : dans la gestion des tables / sessions, ou par un bouton toujours visible de son interface (qui ouvre ensuite le panneau) ? | Bouton dans l'interface MJ (élément du menu hamburger, `HamburgerMenuItemAudio`) : activer, puis ouvrir le panneau | Dans l'onglet Session (`TabSession`) des interfaces MJ, plus visible ; le menu hamburger éventuellement en plus |
| Q-32 | `TabSession` est propre à chaque slug (9 fichiers). Proposition : un **élément prêt à l'emploi** fourni par la plateforme (ex. `AudioSessionToggle`), que chaque slug pose dans son `TabSession` en une ligne, comme les `HamburgerMenuItemXXX`. Un slug qui ne le pose pas n'a pas la musique : c'est son retrait, sans réglage de config (Q-29). Dans quels slugs le poser au départ ? | Tous, sauf Noctis (en attente de refonte, comme pour les autres habillages) | Vikings (portée exacte : voir Q-33) |
| Q-33 | « Vikings » : (a) **pilote sur Vikings seul**, les autres slugs suivront dans un second lot ; (b) **tous sauf Vikings** (en refonte) et Noctis ? | (a) : Vikings sert déjà de référence d'habillage au menu (`vk-menu-*`), et sa refonte intégrera la brique directement | (a) : pilote sur Vikings seul pour l'instant. Noctis exclu |

---

## 8. Hors chantier et évolutions envisagées

Hors chantier, à garder en tête pour que la v1 ne les rende pas difficiles :

- **Bouton raccourci** (idée du MJ) : un bouton (ex. « Combat ») attaché à un morceau précis d'une playlist ; un clic, et la lecture bascule directement dessus.
- File d'attente « à jouer ensuite ».
- Boucle d'un morceau à la demande.
- Soundboard : effets ponctuels joués par-dessus la musique (Q-9, Q-27).
- Élément du menu hamburger MJ pour activer la musique, en plus de l'onglet Session (Q-31).
- Extension aux autres slugs après le pilote Vikings (Noctis après sa refonte).

---

## 9. Spécification technique (phase 2)

### 9.1 Principes

- **Les commandes du MJ passent par HTTP** (`authenticate, requireGM`), le serveur diffuse ensuite l'état à la room de la session. Aucun socket émis par le client pour piloter la musique : c'est la règle des actions réservées au MJ, et le pattern déjà suivi par la composition des tables (`session-characters-update`).
- **Le serveur est l'unique source de vérité** de l'état de lecture. Les clients ne font que l'appliquer à leur lecteur YouTube local.
- **Rien dans les slugs**, sauf la pose de l'élément d'activation dans `TabSession` (une ligne, plus son habillage dans `theme.css`).

### 9.2 Base de données

Tables ajoutées à `database-template/base.sql` (présentes dans toutes les bases de slug) :

```sql
create table audio_collections
(
    id         INTEGER primary key autoincrement,
    name       TEXT    not null,
    position   INTEGER not null default 0,
    created_at DATETIME default CURRENT_TIMESTAMP
);

create table audio_playlists
(
    id            INTEGER primary key autoincrement,
    collection_id INTEGER not null references audio_collections on delete cascade,
    name          TEXT    not null,
    position      INTEGER not null default 0,
    created_at    DATETIME default CURRENT_TIMESTAMP
);

create table audio_tracks
(
    id          INTEGER primary key autoincrement,
    playlist_id INTEGER not null references audio_playlists on delete cascade,
    youtube_id  TEXT    not null,           -- identifiant à 11 caractères, pas l'URL
    title       TEXT    not null,
    position    INTEGER not null default 0,
    unavailable INTEGER not null default 0, -- 1 : dernière lecture en erreur (Q-23)
    created_at  DATETIME default CURRENT_TIMESTAMP
);

create index idx_audio_playlists_collection on audio_playlists (collection_id, position);
create index idx_audio_tracks_playlist      on audio_tracks (playlist_id, position);
```

Et sur `game_sessions` : `audio_enabled INTEGER not null default 0` (Q-30).

- Une vidéo copiée dans une autre playlist est une nouvelle ligne `audio_tracks` (copies indépendantes, Q-19). Un déplacement change `playlist_id` et `position`.
- `position` : ordre d'affichage, réécrit en bloc après un glisser-déposer (transaction).
- Suppression d'une collection : ses playlists et vidéos partent avec. Les clés étrangères n'étant pas activées sur les connexions (`PRAGMA foreign_keys` absent de `db/index.js`), le `on delete cascade` ne joue pas : la route efface explicitement les lignes filles, en transaction. Une confirmation `ConfirmModal` précède toute suppression.
- Chaque schéma de slug recopie les tables de `base.sql` : la structure audio est ajoutée à `base.sql` **et** aux 9 schémas.
- Migration `database-template/migrations/DDMMYYYY_add_audio.sql`, en-tête `-- systems: all` : les trois tables (`create table if not exists`) et l'`alter table game_sessions add column audio_enabled`.

### 9.3 État de lecture (mémoire du serveur)

Une `Map` dans `socket/index.js` (`sharedState.audioStates`), clé `${slug}_${sessionId}` :

```js
{
  status:       'playing' | 'paused' | 'stopped',
  trackId, youtubeId, title,
  playlistId, playlistName,
  position,     // secondes, à l'instant refTime
  refTime,      // Date.now() du serveur au dernier changement
  duration,     // secondes, connue une fois la vidéo chargée chez le MJ (null avant)
  hideTitle,    // réglage Q-28, false par défaut
}
```

Position attendue à l'instant t : `position + (t - refTime) / 1000` si `playing`, sinon `position`.

**Enchaînement (Q-6)** : le serveur ne connaît pas la durée d'une vidéo YouTube. Le lecteur du MJ la lui transmet dès qu'elle est chargée ; le serveur arme alors un minuteur de fin de morceau, et passe au suivant de la playlist (lu en base à ce moment, donc à jour des modifications faites pendant la lecture), ou s'arrête après le dernier. Le minuteur est réarmé à chaque pause, reprise ou changement de position.

**Vidéo indisponible (Q-23)** : le lecteur du MJ signale l'erreur, le serveur marque `unavailable = 1` et passe au suivant. Une lecture réussie remet `unavailable = 0`.

Conséquence assumée : sans page MJ ouverte, pas de durée ni de signalement d'erreur. Le morceau en cours va au bout chez les joueurs, puis rien ne s'enchaîne (voir P-1).

### 9.4 Routes HTTP

Nouvelle route partagée `src/server/routes/audio.js`, déclarée dans `SHARED_ROUTES` (`Loader.js`) et montée sur `/api/:slug/audio` dans `server.js`, comme `sessions` ou `journal`.

| Méthode et chemin | Droits | Rôle |
|---|---|---|
| `GET /library` | MJ | Bibliothèque complète : collections → playlists → vidéos, triées par `position` |
| `POST /collections` `{ name }` | MJ | Créer une collection |
| `PUT /collections/:id` `{ name }` | MJ | Renommer |
| `DELETE /collections/:id` | MJ | Supprimer (cascade) |
| `PUT /collections/order` `{ ids }` | MJ | Réordonner les collections |
| `PUT /collections/:id/order` `{ playlistIds }` | MJ | Réordonner les playlists d'une collection |
| `POST /playlists` `{ collectionId, name }` | MJ | Créer une playlist |
| `PUT /playlists/:id` `{ name?, collectionId? }` | MJ | Renommer, ou déplacer vers une autre collection (Q-20) |
| `DELETE /playlists/:id` | MJ | Supprimer (cascade) |
| `PUT /playlists/:id/order` `{ trackIds }` | MJ | Réordonner les vidéos (Q-5) |
| `POST /playlists/:id/tracks` `{ videoIds }` | MJ | Ajouter une ou plusieurs vidéos ; titres récupérés par le serveur (oEmbed YouTube, Q-21) |
| `PUT /tracks/:id` `{ title?, playlistId? }` | MJ | Renommer, ou déplacer vers une autre playlist (en fin de liste) |
| `POST /tracks/:id/copy` `{ playlistId }` | MJ | Copier vers une autre playlist (Q-4, Q-19, Q-20) |
| `DELETE /tracks/:id` | MJ | Supprimer |
| `GET /sessions/:sessionId` | connecté | `{ enabled, state }` : activation et état de lecture, pour qui arrive en cours de route |
| `PUT /sessions/:sessionId/enabled` `{ enabled }` | MJ | Activer / désactiver la musique de la session (Q-30). Désactiver arrête la lecture |
| `POST /sessions/:sessionId/command` `{ action, … }` | MJ | Commandes de lecture, voir ci-dessous |

Actions de `command` : `play { trackId, position? }`, `pause`, `resume`, `seek { position }`, `next`, `previous`, `stop`, `settings { hideTitle }`, et deux remontées du lecteur du MJ : `duration { trackId, duration }`, `error { trackId }`. Une seule route plutôt que dix : les actions partagent la même validation (session existante, musique activée) et la même diffusion.

**Ajout par lien (Q-21, Q-22)** : le client extrait les identifiants. Lien de vidéo (`watch?v=`, `youtu.be/`, `shorts/`) : un identifiant. Lien de playlist (`list=`) : le lecteur YouTube caché charge la playlist et en donne la liste des identifiants (`getPlaylist()`), sans clé d'API. Le client envoie ensuite les identifiants au serveur, qui interroge oEmbed pour chaque titre (titre de secours : l'identifiant, si oEmbed échoue).

### 9.5 Événements socket (serveur → room `${slug}_session_${sessionId}`)

| Événement | Charge | Quand |
|---|---|---|
| `audio-state` | `{ system, sessionId, state, serverTime }` | Après chaque commande, enchaînement ou erreur |
| `audio-enabled` | `{ system, sessionId, enabled }` | Activation / désactivation par le MJ |

`serverTime` permet au client d'estimer l'écart entre son horloge et celle du serveur (précision de l'ordre de la latence réseau, suffisante pour de l'ambiance). Aucun événement client → serveur nouveau.

### 9.6 Client : briques

Dossier `src/client/src/components/audio/` :

| Fichier | Rôle |
|---|---|
| `useAudioSession.js` (dans `hooks/`) | Charge `{ enabled, state }` à l'entrée dans la session et à chaque reconnexion du socket, écoute `audio-state` / `audio-enabled` (filtre `system` + `sessionId`), expose la position attendue |
| `youtubeApi.js` | Chargement unique du script de l'IFrame API ; extraction des identifiants d'un lien (fonction pure, testée sous Vitest) |
| `useYouTubePlayer.js` | Création du lecteur dans un conteneur et suivi de son état (issu du prototype) |
| `YouTubeAudioPlayer.jsx` | Lecteur YouTube **caché** (Q-17) : 1 × 1 px hors écran (§9.9). Applique l'état : charge la vidéo, joue, met en pause, se recale si l'écart dépasse 1,5 s (contrôle toutes les 5 s, et à la fin d'une pub). Volume local (Q-3) mémorisé dans `localStorage`. Côté MJ, remonte `duration` et `error` |
| `AudioUnlockModal.jsx` | Modale « Activer le son » / « Plus tard » (Q-26), sur la `Modal` générique |
| `AudioLayer.jsx` | Monté par `GMPage` et `PlayerPage` avec l'identifiant de session : rien si la musique est désactivée ; sinon lecteur caché, modale de déverrouillage, et `AudioGMPanel` ou `AudioPlayerWidget` selon le rôle |
| `AudioPlayerWidget.jsx` | Joueur (Q-16) : petit élément flottant, titre (sauf `hideTitle`), volume, coupure ; repliable ; état replié et position mémorisés dans `localStorage` |
| `AudioGMPanel.jsx` | MJ (Q-15) : panneau flottant, agrandissable en plein écran. Morceau en cours et commandes (Q-24), réglage « masquer le titre aux joueurs », bibliothèque (collections, playlists, vidéos ; ajout par lien, renommage, copie, déplacement, suppression, glisser-déposer natif HTML5, comme le combat), vidéos en erreur signalées |
| `AudioSessionToggle.jsx` | Élément prêt à l'emploi pour `TabSession` : bascule activée / désactivée. Props `sessionId`, `label`, `icon`, `className` (même principe que les `HamburgerMenuItemXXX`) |

Montage :
- `GMPage` : `<AudioLayer role="gm" sessionId={activeSession?.id} />` à côté de `DiceAnimationOverlay`.
- `PlayerPage` : `<AudioLayer role="player" sessionId={activeGMSession} />`, `activeGMSession` venant de `useSession()`.
- Aucune prop nouvelle vers `GMApp` / `Sheet` : les slugs ne voient rien.

Visibilité (Q-12) : l'état diffusé contient le titre et le nom de playlist ; c'est `AudioPlayerWidget` qui masque la playlist, et le titre si `hideTitle` (filtrage côté client, modèle de confiance assumé du projet).

### 9.7 Habillage

- Classes stables : `vtt-audio-panel` (panneau MJ, modificateur `vtt-audio-panel-full`), `vtt-audio-widget` (joueur), `vtt-audio-controls`, `vtt-audio-btn`, `vtt-audio-volume`, `vtt-audio-now` (morceau en cours), `vtt-audio-library`, `vtt-audio-collection`, `vtt-audio-playlist`, `vtt-audio-track` (états `is-playing`, `is-unavailable`, `is-dragging`), `vtt-audio-toggle`.
- Style par défaut dans `index.css`, `@layer components`, variables `--color-*` seulement. Surcharge par le `theme.css` du slug, hors couche.
- **Vikings (pilote)** : habillage dans `systems/vikings/theme.css`, dans l'identité de ses panneaux et boutons `vk-*` (partage de classes, comme `vk-menu-*` pour le menu). `AudioSessionToggle` posé dans l'`aside` de `TabSession`, avec les boutons Note / Objet, `className="vk-btn vk-btn-sm"`.

### 9.8 Fichiers touchés

| Fichier | Changement |
|---|---|
| `database-template/base.sql` et les 9 schémas de slug | 3 tables, colonne `audio_enabled` |
| `database-template/migrations/27102026_add_audio.sql` | Nouveau, `-- systems: all` |
| `src/server/routes/audio.js` | Nouveau : routes §9.4, minuteur d'enchaînement |
| `src/server/systems/Loader.js` | Entrée `audio` dans `SHARED_ROUTES` |
| `src/server/server.js` | Montage de `/api/:slug/audio` |
| `src/server/socket/index.js` | `audioStates` dans `sharedState` |
| `src/client/src/hooks/useAudioSession.js` | Nouveau |
| `src/client/src/components/audio/*` | Nouveaux (§9.6) |
| `src/client/src/pages/GMPage.jsx`, `PlayerPage.jsx` | Montage d'`AudioLayer` |
| `src/client/src/index.css` | Style par défaut `vtt-audio*` |
| `src/client/src/systems/vikings/gm/tabs/TabSession.jsx` | Pose d'`AudioSessionToggle` |
| `src/client/src/systems/vikings/theme.css` | Habillage |
| `src/client/tests/components/audio/youtubeApi.test.js` | Extraction des identifiants (liens vidéo, courts, playlist, invalides) |
| `src/client/CLAUDE.md`, `src/server/CLAUDE.md`, `/new-slug` | Mention de la brique et de son élément `TabSession` |

### 9.9 Risque technique à lever en premier

**Lecture du son dans un lecteur YouTube caché, après le clic « Activer le son ».** Le clic a lieu dans notre page, le son sort d'un cadre YouTube : les navigateurs l'acceptent en général (Watch2Gether fonctionne ainsi), mais Firefox a un réglage « bloquer l'audio et la vidéo » qui peut s'y opposer, et le comportement d'un lecteur de taille nulle n'est pas garanti. Premier pas de l'implémentation : un prototype minimal (lecteur caché, bouton, lecture) testé sous Firefox, Brave et Opera, avant le reste.

**Résultat (MJ, 2026-10-27, page temporaire `/tools/audio`)** : sous Opera, vidéo seule et playlist (import compris) fonctionnent, lecture différée sans clic comprise. Un lecteur de **0 × 0 reste affiché** (YouTube impose sa taille) : le lecteur caché est donc un lecteur de **1 × 1 placé hors écran**. Firefox et Brave seront testés plus tard avec des joueurs ; on poursuit sans attendre.

**Passe 2, synchronisation (demandée par le MJ avant migration)** : la page `/tools/audio` gagne les rôles Meneur / Auditeur, reliés par un relais socket jetable (`socket/audioProto.js`, état en mémoire, room fixe, sans base). L'algorithme de recalage est écrit pour de bon dans `components/audio/audioSync.js` (écart d'horloge par aller-retour, position attendue, décision charger / lire / pause / recaler, testé sous Vitest) et servira tel quel au lecteur de la brique. Chaque page affiche l'écart avec la position attendue et le nombre de recalages ; tolérance réglable (0,5 à 3 s), pause locale de 10 s pour simuler une pub. Test à distance avec les joueurs prévu après une release.

### 9.10 Points à valider

| # | Point | Proposition | Réponse MJ |
|---|---|---|---|
| P-1 | Enchaînement et erreurs dépendent d'une page MJ ouverte (§9.3). Acceptable ? (L'alternative : chaque joueur remonte durée et erreurs, avec dédoublonnage côté serveur : plus de code pour un cas rare) | Accepté : le MJ a toujours sa page ouverte pendant la partie | Accepté : sans MJ, pas de partie |
| P-2 | Glisser-déposer aussi pour réordonner les playlists et les collections, ou seulement les vidéos ? | Partout (collections, playlists, vidéos) : même mécanique, coût marginal | Oui |
| P-3 | Le MJ ouvre son panneau par un bouton flottant toujours visible (musique activée), ou seulement depuis l'onglet Session ? | Bouton flottant toujours visible : changer de musique depuis n'importe quel onglet | Oui pour l'instant ; un autre emplacement pourra être étudié plus tard |
| P-4 | Désactiver la musique d'une session : arrêt immédiat chez tous ? | Oui | Oui |
| P-5 | Ordre d'implémentation : prototype §9.9, puis serveur (tables, routes, état), puis lecteurs et modale, puis panneau MJ et bibliothèque, puis habillage Vikings | Oui, avec un point de contrôle de ta part après le prototype | Oui |

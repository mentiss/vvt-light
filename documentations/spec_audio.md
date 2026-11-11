# Spec — Lecteur audio synchronisé (façon Watch2Gether)

> Version 0.4 — Phase 2 : spécification technique  
> Statut : **Lots 1 (structure, §11) et 3 (retrait du prototype, §11.19) en place ; lot 2 (boutons préréglés, §12) implémenté le 2026-11-01, vérification du MJ en dev attendue.** Décisions de cadrage au §10.8 (elles priment sur §6 et §9) et au §12.5 pour les boutons.  
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
- Extrait d'une vidéo (début et fin) : effets tirés d'une compilation, introduction coupée d'une ambiance (S-8, évolution éventuelle, pas visée).
- Fondu entre deux pistes ou deux morceaux (Q-7, S-14).
- Troisième piste ambiance, si le besoin se fait sentir (S-5).
- Écoute d'essai d'un contenu public depuis le catalogue, sans le copier (P2-5) : **à prévoir dans une mise à jour**.
- Extension aux autres slugs après le pilote Vikings (Noctis après sa refonte).

---

## 9. Spécification technique (phase 2)

> **Remplacée par le §11** (2026-10-31) pour tout ce qui découle du §10.8 : base propre au module, partage, pistes typées. Gardée pour l'historique et pour ce que le §11 reprend explicitement.

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

---

## 10. Retour du test et nouvelles idées (2026-10-31) — phase 1

### 10.1 Résultat du test de synchronisation

Test à plusieurs, en prod (v5.7.1, page `/tools/audio`) : **succès**, Firefox compris. La synchronisation par état du serveur et recalage local (`audioSync.js`) est validée : le chantier continue.

### 10.2 Idées issues de l'échange avec les joueurs

1. **Superposer plusieurs pistes** en même temps (musique + pluie + feu de camp). Revient sur Q-8.
2. **Centraliser la gestion des playlists**, sur le modèle du tableau (`spec_tableau.md` §3.3) : une base propre au module, hors des bases des slugs. Revient sur Q-1.
3. **Boutons préconfigurés** : lancer un morceau précis, un ensemble, ou un morceau au hasard d'une playlist. Sort du §8 (bouton raccourci « Combat »).

### 10.3 Diagnostic

**Superposition**
- Techniquement, une piste = un lecteur YouTube caché de plus chez chaque client, synchronisé par le même algorithme que la piste unique. Rien de neuf sur le principe, déjà validé.
- Coût : chaque lecteur est un cadre YouTube complet (mémoire, processeur, réseau). Quelques pistes ne posent pas de problème sur un PC ; une dizaine pèserait, surtout sur un téléphone. Le lecteur de 1 × 1 px aide : YouTube choisit la qualité d'image d'après la taille du lecteur, donc la plus basse, et le flux reste léger.
- Une ambiance (pluie, vent) doit **tourner en boucle** sans fin, quand la musique **enchaîne** sa playlist (Q-6) : chaque piste a donc son mode.
- Il faut un **mixage** : le volume de la pluie par rapport à la musique est un choix du MJ, le même pour tous. Le volume local de chaque joueur (Q-3) s'applique ensuite par-dessus l'ensemble.
- L'état de lecture du serveur (§9.3) devient une liste de pistes, chacune avec son propre état ; la diffusion et le recalage restent les mêmes.

**Base propre au module (`audio.db`)**
- Même modèle que `board.db` : un fichier `database/audio.db`, magasin du seul module audio, **sans** être une base centrale. Les bases des slugs ne sont plus touchées du tout.
- Conséquence heureuse : l'activation par session (Q-30) passe aussi dans `audio.db`, indexée par slug et identifiant de session, au lieu d'une colonne sur `game_sessions`. Plus de modification des 9 schémas de slug ni de migration `-- systems: all`.
- À prévoir, **commun avec le tableau** : `scripts/migrate.js` et la release ne savent gérer que des bases de slug ; il leur faut une base hors slug (ex. en-tête `-- systems: audio`). Le premier des deux chantiers à arriver l'écrit, l'autre s'en sert.
- Droits : la bibliothèque est modifiée par un MJ authentifié sur n'importe quel slug (jeton MJ du slug de la page) ; il n'y a qu'un MJ, c'est sans conséquence.

**Boutons préconfigurés**
- Un bouton enregistre une action : lancer tel morceau, lancer un ensemble de pistes, lancer un morceau au hasard d'une playlist. Côté serveur, ce n'est qu'une suite de commandes déjà prévues (§9.4) : peu de code en plus, une table de plus.
- Points à trancher : effet sur ce qui joue déjà (remplacer tout, remplacer une piste, ajouter), et rangement des boutons.

**La branche `audio`**
- Les routes, l'état en mémoire et le minuteur restent réutilisables. Les modifications de `base.sql`, des 9 schémas et la migration `27102026_add_audio.sql` deviendraient caduques avec `audio.db` ; l'état mono-piste est à étendre. Plutôt qu'une fusion telle quelle, une reprise de la branche, une fois ces décisions prises.

### 10.4 Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| R-1 | Combien de pistes simultanées au maximum ? | 4 (une musique + trois ambiances) ; plus serait lourd sur un téléphone, et rarement utile | Pas 10 pistes : un nombre limité par type (une musique, une à trois ambiances, un effet ?), voir S-5 |
| R-2 | Pistes toutes équivalentes, ou une piste « musique » et des pistes « ambiance » ? | Toutes équivalentes, numérotées ; c'est le mode de chaque piste qui change (R-3) | Pistes typées plutôt : musique, ambiance, effet, pour ne pas surcharger et garder la maîtrise (S-5) |
| R-3 | Mode d'une piste : « playlist » (enchaîne puis s'arrête, Q-6) ou « boucle » (le morceau repart sans fin) ? Faut-il aussi « aléatoire » (morceau au hasard de la playlist à chaque fin) ? | Les trois modes, choisis par piste | La superposition suppose un contrôle des pistes, notamment pour faire boucler (S-7) |
| R-4 | Mixage : le MJ règle le volume de chaque piste, appliqué chez tous ; chaque joueur garde seulement son volume général (Q-3). Le joueur doit-il aussi pouvoir couper ou baisser une piste en particulier ? | Non : volume général et coupure seulement, comme décidé | |
| R-5 | Base propre au module, `database/audio.db`, sur le modèle de `board.db` ? (Q-1 est alors à revoir) | Oui | |
| R-6 | Dans `audio.db`, la bibliothèque est-elle **commune à tous les slugs** (une même playlist de taverne sert à Vikings et à Achtung), ou **rangée par slug** (chaque slug ne voit que la sienne) ? | Commune, puisque c'est l'intérêt de la centralisation ; les collections suffisent à ranger par jeu ou par campagne | Ni toute commune ni seulement par slug : une musique Vikings n'a rien à faire dans Cyberpunk, et d'une table à l'autre les goûts et playlists diffèrent. Classement par slug quelque part, et piste à creuser : playlists privées, publiques slug, publiques plateforme (S-1 à S-4) |
| R-7 | L'activation par session (Q-30) passe aussi dans `audio.db` (par slug et session), au lieu d'une colonne sur `game_sessions` ? | Oui : les bases des slugs ne bougent plus du tout | Oui (T-2) |
| R-8 | Types de boutons : (a) un morceau précis, (b) un ensemble de pistes lancées d'un coup (une « ambiance » : musique + pluie + feu), (c) un morceau au hasard d'une playlist. Autre chose (ex. « tout arrêter ») ? | Les trois, plus « tout arrêter », toujours présent | |
| R-9 | Effet d'un bouton sur ce qui joue déjà : un bouton (a) ou (c) joue sur **une piste désignée** (il ne remplace que celle-là) ; un bouton (b) **remplace toutes les pistes**. D'accord ? | Oui ; « ajouter sans rien couper » se fait avec (a) ou (c) sur une piste libre | Réglable dans la configuration du bouton : remplacement complet, ou extinction d'une piste au profit d'une autre (S-10) |
| R-10 | Bouton (c), le hasard : un seul morceau au hasard puis comportement normal de la piste, ou la piste passe en mode aléatoire ? | La piste passe en mode aléatoire (R-3) sur cette playlist | |
| R-11 | Rangement des boutons : dans une collection (comme les playlists), commune à tous les slugs, ou par slug ? | Dans une collection : les boutons de la campagne vivent avec ses playlists | Par MJ, donc par table : chaque table a sa série de boutons, nombre éventuellement limité (S-9) |
| R-12 | Où sont les boutons dans l'interface MJ : dans le panneau flottant (P-3), ou dans une barre de boutons à part, toujours visible ? | Une rangée de boutons en tête du panneau flottant, plus un mode « boutons seuls » du panneau replié | « Quelque part dans l'interface » : à préciser (S-12) |
| R-13 | Les joueurs voient-ils quelque chose des pistes superposées (titres de chaque piste, nom du bouton lancé) ? | Comme Q-12 : titre de chaque piste visible, réglage « masquer » du MJ valable pour toutes ; nom des boutons jamais montré | |
| R-14 | Découpage : tout d'un coup, ou en lots ? | Lot 1 : `audio.db` et migration hors slug, pistes multiples, bibliothèque, lecteurs, panneau MJ, activation, habillage Vikings. Lot 2 : boutons préconfigurés. Le lot 1 pose la structure, le lot 2 s'y branche sans la changer | |
| R-15 | La page `/tools/audio` (prototype, en prod) : la retirer dès la prochaine release, ou la garder jusqu'à la fin du lot 1 pour d'autres essais ? | La garder jusqu'à la fin du lot 1, puis la retirer avec le relais `audioProto.js` | |

### 10.5 Réponses du MJ et diagnostic, second tour (2026-10-31)

**Ce qui se dégage**
- **Pistes typées**, en petit nombre, pour ne pas surcharger et garder la maîtrise : une piste musique, une à trois pistes ambiance, une piste effet.
- **Contrôle par piste**, boucle comprise.
- **Bibliothèque ni toute commune, ni seulement par slug** : un classement par slug, des goûts différents d'une table à l'autre, et l'idée de niveaux de partage (privé, public slug, public plateforme).
- **Boutons par table**, en nombre limité, configurables : remplacement complet, ou une piste éteinte au profit d'une autre.

**Ce que le code impose**
- Dans l'application, une « session » (`game_sessions`) est une **table** : un groupe durable, d'une soirée à l'autre, pas une soirée. Il n'y a **qu'un compte MJ par slug** (le personnage `-1`). « Par MJ » veut donc dire « par table » : un MJ qui mène deux tables du même slug aura deux espaces privés.
- La réponse à Q-1 (« pas par session ») visait une soirée : par table, le MJ retrouve ses playlists d'une soirée à l'autre, c'est compatible.

**La piste effet**
- Un effet (porte, coup de feu, cri) se joue une fois, par-dessus le reste. Avec YouTube, il **n'est pas instantané** : charger une vidéo prend une à trois secondes. Pour un effet attendu (« la porte s'ouvre »), ça passe ; pour un effet au réflexe, c'est un peu mou. C'est la limite de « YouTube seul, aucun fichier son sur le serveur ».
- Beaucoup d'effets sur YouTube sont des compilations (« 50 bruits de portes ») : il faut pouvoir **jouer un extrait** (début et fin dans la vidéo). C'est utile aussi pour une ambiance (couper une introduction parlée avant la boucle).

**Les niveaux de partage**
- Trois niveaux : **privé** (une table), **public slug** (toutes les tables du slug), **public plateforme** (tout le monde). Ils règlent le cas Vikings / Cyberpunk (rien n'est commun sans le vouloir) et le partage volontaire (une playlist « taverne » publique plateforme).
- Le niveau se pose plus simplement sur une **collection** (tout son contenu suit) que sur chaque playlist ; une playlist mal rangée se copie ou se déplace.
- Il faut décider qui peut **modifier** un contenu public : sinon une table peut casser la playlist d'une autre.

### 10.6 Questions, second tour

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| S-1 | « Privé » = rattaché à **une table** (`game_sessions`, durable d'une soirée à l'autre), puisqu'il n'y a qu'un compte MJ par slug ? | Oui | Oui : privé = session / table |
| S-2 | Trois niveaux de partage : **privé** (une table), **public slug** (toutes les tables du slug), **public plateforme** (toutes les tables de tous les slugs) ? | Oui | Oui (proposition du MJ). **Public ne veut pas dire présent d'office** dans toutes les tables : un MJ peut le récupérer, l'associer, le copier dans sa table. Sinon, pollution |
| S-3 | Le niveau se règle sur la **collection** (son contenu suit) ou sur **chaque playlist** ? | Sur la collection : plus lisible ; une playlist se copie ou se déplace d'une collection à l'autre | Sur la collection, à condition de pouvoir **copier une playlist seule** (pas seulement toute une collection) |
| S-4 | Qui modifie un contenu public ? Seule la table propriétaire (les autres l'utilisent tel quel et peuvent le **copier** dans leurs collections privées), ou toutes les tables ? | Seule la table propriétaire ; copie possible pour les autres | Oui, c'est le bon niveau |
| S-5 | Pistes typées : **1 musique, 1 à 3 ambiances, 1 effet** (5 au plus) ? Le nombre de pistes ambiance est-il fixe (3), ou choisi par la table ? | 1 musique, 3 ambiances, 1 effet, fixes : une piste vide ne coûte rien | Fixe, mais **2 ambiances** suffisent ; une troisième pourra s'ajouter plus tard si le besoin se fait sentir |
| S-6 | Piste effet : joue une fois et s'arrête, par-dessus le reste ; latence de chargement YouTube d'une à trois secondes. Acceptable ? Un nouvel effet coupe-t-il l'effet en cours ? | Acceptable ; un nouvel effet remplace celui en cours | Oui, pas le choix |
| S-7 | Contrôles par piste (MJ) : lecture / pause / arrêt, volume, et mode. Musique : playlist (Q-6), boucle du morceau, aléatoire. Ambiance : boucle par défaut, playlist possible. Effet : une fois. D'accord ? | Oui | Oui |
| S-8 | **Extrait** d'une vidéo : début et fin facultatifs, enregistrés avec la vidéo dans la bibliothèque (effets tirés d'une compilation, introduction coupée d'une ambiance) ? | Oui, pour tous les types | Pourquoi pas, mais ça complexifie : **évolution future éventuelle**, pas une fonctionnalité visée (§8) |
| S-9 | Nombre maximal de boutons par table ? | 12 : une rangée lisible, et c'est une limite d'affichage, facile à relever | Boutons : conforme à ce que le MJ envisageait (S-9, S-10, S-12) |
| S-10 | Configuration d'un bouton : **scène** (fixe le contenu de chaque piste : tel morceau, telle playlist, ou silence ; les pistes non citées s'éteignent) ou **ciblé** (change une piste, les autres continuent). Un bouton peut-il aussi lancer un effet ? Un bouton peut-il viser un contenu public d'une autre table ? | Les deux modes ; un effet peut être visé ; contenu public autorisé, et le bouton se signale en erreur si ce contenu disparaît | Oui |
| S-11 | Les types de pistes changent-ils l'affichage joueur ? (Q-12 : titre visible, playlist masquée) | Le titre de la musique seulement ; ambiances et effets ne s'affichent pas (un « cri » annoncé gâche l'effet) | Oui, uniquement le titre de la piste musique |
| S-12 | Où sont les boutons : dans le panneau MJ flottant, ou une **barre à part toujours visible** (le MJ lance « Combat » sans ouvrir de panneau) ? | Une barre à part, repliable, distincte du panneau de gestion | Oui (voir S-9) |
| S-13 | Volume local du joueur : un seul (Q-3), ou un par type (musique, ambiance, effet) ? Avec des pistes typées, certains voudront baisser la musique en gardant les effets | Un général plus un par type, mémorisés dans le navigateur | Oui, réglés par le joueur (pas envoyés par le MJ). **Pré-réglage de la plateforme** par type (ex. ambiance 10 %, musique 50 %). Réglage du joueur gardé sur le long terme, **pour toute la plateforme** (pas par slug ni par table) |
| S-14 | Passage d'une piste à une autre par un bouton : coupure sèche (Q-7) ou court fondu ? Avec des ambiances qui se remplacent, la coupure peut s'entendre | Coupure sèche en v1, fondu en évolution (§8) | Oui |

### 10.7 Volume : précisions et questions restantes

- **Réglage du joueur pour toute la plateforme** : c'est naturel, toute l'application est une seule adresse, donc un seul stockage du navigateur pour tous les slugs. Limite : c'est **par navigateur**, faute de comptes joueurs. Sur un autre appareil, le joueur repart des pré-réglages.
- **Volume entendu** par un joueur sur une piste = pré-réglage du type (ou son propre réglage du type, s'il l'a modifié) × son volume général.
- Reste à savoir si le MJ garde un **réglage par piste** (R-4) : deux vidéos d'ambiance n'ont pas le même niveau sonore d'origine (une pluie enregistrée fort, un vent très faible). Sans réglage du MJ, chaque joueur rattrape à la main à chaque changement.

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| S-15 | Le MJ garde-t-il un **gain par vidéo**, enregistré avec la vidéo dans la bibliothèque, pour égaliser les niveaux d'origine (pluie trop forte, vent trop faible) ? Ce n'est pas un réglage de mixage en direct : il est fixé une fois, et le volume reste ensuite celui du joueur | Oui, par vidéo, de 0 à 100 % (100 par défaut) ; pas de réglage de volume en direct par le MJ | Oui |
| S-16 | Pré-réglages de la plateforme par type : musique 50 %, ambiance 10 %, et effet ? | Effet 50 % : un effet doit s'entendre par-dessus la musique | Oui. Réglage lié au navigateur, comme la configuration des dés |

### 10.8 Décisions du cadrage (2026-10-31)

Elles **remplacent** Q-1 (bibliothèque par slug), Q-8 (une seule piste), Q-3 (un seul volume joueur) et la partie « bouton raccourci » du §8.

**Données**
- Base propre au module, `database/audio.db`, sur le modèle de `board.db` : hors des bases des slugs, sans être une base centrale (R-5).
- Tout contenu appartient à une **table** (`game_sessions`, durable d'une soirée à l'autre, un compte MJ par slug) : « privé » = la table (S-1).
- Niveau de partage posé sur la **collection** : **privé**, **public slug**, **public plateforme** (S-2, S-3).
- **Public ne veut pas dire présent d'office** : un contenu public n'apparaît dans aucune autre table tant que son MJ ne l'a pas copié chez lui. Sinon, pollution (S-2).
- **Copie seule**, pas d'association : un MJ parcourt les contenus publics et en copie ce qu'il veut dans sa table. La copie est indépendante et ne suit pas les mises à jour du propriétaire (T-1).
- Seule la table propriétaire modifie un contenu (S-4).
- Copie possible d'une **collection**, d'une **playlist seule** ou d'une **vidéo** (S-3).
- Gain par vidéo, réglé une fois par le MJ dans la bibliothèque, 100 % par défaut (S-15).

**Pistes**
- Typées et en nombre fixe : **1 musique, 2 ambiances, 1 effet** (S-5).
- Contrôles par piste pour le MJ : lecture, pause, arrêt, mode. Musique : playlist (défaut), boucle du morceau, aléatoire. Ambiance : boucle du morceau (défaut), playlist. Effet : une fois (S-7).
- Effet : joue une fois par-dessus le reste ; un nouvel effet remplace celui en cours ; délai de chargement YouTube d'une à trois secondes accepté (S-6).
- Coupure sèche entre deux contenus, pas de fondu (S-14).

**Boutons**
- Par **table**, **5 au plus** (2 à 3 en pratique), plus un bouton **STOP** (tout arrêter) toujours présent, hors du compte ; dans une barre à part, repliable, distincte du panneau de gestion (S-9, S-12, T-3).
- Deux modes : **scène** (fixe le contenu de chaque piste, les pistes non citées s'éteignent) et **ciblé** (change une piste, les autres continuent). Ils couvrent un morceau précis comme un morceau au hasard d'une playlist ; le hasard fait passer la piste en mode aléatoire. Un bouton peut lancer un effet (S-10, T-3).
- Un bouton ne vise que le contenu **de sa table** (un contenu public y entre par copie, T-1) ; il se signale en erreur si ce contenu a été supprimé.

**Activation**
- Musique activée par table, mémorisée dans `audio.db` (par slug et table), et non par une colonne sur `game_sessions` : les bases des slugs ne bougent plus du tout (T-2).

**Découpage**
- **Lot 1**, la structure : `audio.db`, migration et release hors slug (commune avec le tableau), pistes typées, bibliothèque et partage, lecteurs, panneau MJ, activation, habillage Vikings.
- **Lot 2** : les boutons.
- **Lot 3**, nettoyage : retrait de la page prototype `/tools/audio` et du relais `audioProto.js`, qui restent en prod d'ici là (T-4, T-5).

**Joueurs**
- Seul le **titre de la piste musique** est visible ; ambiances et effets ne s'affichent pas (S-11).
- Volume : un général et un par type, réglés par le joueur, jamais envoyés par le MJ. Pré-réglages de la plateforme : musique 50 %, ambiance 10 %, effet 50 %. Réglage gardé dans le navigateur, pour toute la plateforme, comme la configuration des dés (S-13, S-16).

Cadrage terminé : plus de question ouverte (§10.9 tranché). La spécification technique du §9 est à reprendre en phase 2, sur feu vert du MJ.

### 10.9 Questions restantes

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| T-1 | « **Associer** » un contenu public et le « **copier** » : deux choses différentes ? Associer = un lien en lecture seule (la table voit les mises à jour du propriétaire, et le perd s'il le supprime) ; copier = un double indépendant, modifiable | Oui, les deux : on associe une collection publique entière, on copie une playlist ou une vidéo | **Copie seule** : associer ajoute trop d'options. Limite acceptée : une copie ne suit pas les mises à jour du propriétaire |
| T-2 (R-7) | L'activation de la musique par table passe dans `audio.db` (par slug et table), au lieu d'une colonne sur `game_sessions` ? | Oui : les bases des slugs ne bougent plus du tout | Oui |
| T-3 (R-8, R-10) | Les boutons « scène » et « ciblé » couvrent-ils le morceau précis et le morceau au hasard d'une playlist ? Le hasard fait passer la piste en mode aléatoire ? Un bouton « tout arrêter » toujours présent, hors des 12 ? | Oui aux trois | Oui, mais **5 boutons au plus** par table (2 à 3 en pratique), **plus le bouton STOP** |
| T-4 (R-14) | Découpage en deux lots : structure d'abord (`audio.db`, migration et release hors slug, pistes typées, bibliothèque et partage, lecteurs, panneau MJ, activation, habillage Vikings), boutons ensuite ? | Oui | Oui |
| T-5 (R-15) | La page prototype `/tools/audio` reste en prod jusqu'à la fin du lot 1 ? | Oui, puis retrait avec le relais `audioProto.js` | Oui, ou un **dernier lot de nettoyage** |

---

## 11. Spécification technique v2 (phase 2, 2026-10-31)

Remplace le §9 pour tout ce qui suit les décisions du §10.8. Du §9 restent valables : les principes (§9.1), la synchronisation (validée, `audioSync.js`), le lecteur caché 1 × 1 hors écran, l'ajout par lien et l'import de playlist (§9.4, dernier paragraphe), la modale « Activer le son » et le montage par `GMPage` / `PlayerPage`.

### 11.1 Base propre au module : `database/audio.db`

**Principe commun avec le tableau (`board.db`)** : une base de **module**, déclarée une fois, que le pool de connexions, la migration et la release savent traiter comme une base de slug.

- Déclaration seule dans `src/server/db/modules/audio.js` : `{ slug: 'audio', dbPath: 'database/audio.db', schemaPath: 'database-template/audio-schema.sql' }` (le tableau ajoutera `db/modules/board.js`), chargée par `getModuleConfig('audio')` (`db/moduleConfig.js`, qui ne charge que la déclaration demandée). Même forme qu'une config de slug : `getDbForSystem(getModuleConfig('audio'))` marche tel quel (ouverture paresseuse, création depuis le schéma, fermeture après 5 min). Le nom d'un module ne doit pas être un nom de slug.
- **Migration** : en-tête `-- systems: audio`. `scripts/migrate.js` cherche le nom parmi les slugs, puis parmi les modules. `all` continue de viser **les slugs seulement**.
- **Release** : `scripts/release.js` accepte un nom de module dans l'en-tête ; `scripts/install.sh` (`resolve_dbs`) trouve son `dbPath` de la même façon, donc la sauvegarde avant migration et le retour arrière marchent sans autre changement.
- Une base de module absente est créée depuis son schéma à la première ouverture, comme une base de slug. La première mise en prod n'a donc **pas besoin de migration** : `audio-schema.sql` suffit.

**Schéma** (`database-template/audio-schema.sql`) :

```sql
-- Collections : appartiennent à une table (slug + session), niveau de partage (§10.8)
create table audio_collections
(
    id          INTEGER primary key autoincrement,
    slug        TEXT    not null,
    session_id  INTEGER not null,          -- game_sessions.id dans la base du slug (pas de clé étrangère possible)
    name        TEXT    not null,
    visibility  TEXT    not null default 'private',   -- 'private' | 'slug' | 'platform'
    position    INTEGER not null default 0,
    created_at  DATETIME default CURRENT_TIMESTAMP,
    updated_at  DATETIME default CURRENT_TIMESTAMP
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
    youtube_id  TEXT    not null,
    title       TEXT    not null,
    gain        INTEGER not null default 100,   -- 0 à 100, égalise les niveaux d'origine (S-15)
    position    INTEGER not null default 0,
    unavailable INTEGER not null default 0,
    created_at  DATETIME default CURRENT_TIMESTAMP
);

-- Réglages par table
create table audio_session_settings
(
    slug        TEXT    not null,
    session_id  INTEGER not null,
    enabled     INTEGER not null default 0,     -- musique activée (T-2)
    hide_title  INTEGER not null default 0,     -- titre de la musique masqué aux joueurs (Q-28)
    primary key (slug, session_id)
);

-- Lot 2 : boutons
create table audio_buttons
(
    id          INTEGER primary key autoincrement,
    slug        TEXT    not null,
    session_id  INTEGER not null,
    label       TEXT    not null,
    position    INTEGER not null default 0,
    mode        TEXT    not null,               -- 'scene' | 'target'
    actions     TEXT    not null,               -- JSON, voir §11.6
    created_at  DATETIME default CURRENT_TIMESTAMP
);
```

Index sur `audio_collections (slug, session_id)`, `audio_collections (visibility)`, `audio_playlists (collection_id, position)`, `audio_tracks (playlist_id, position)`, `audio_buttons (slug, session_id, position)`.

- La table `audio_buttons` est créée dès le lot 1 : le lot 2 n'aura pas de migration.
- Les clés étrangères n'étant pas activées sur les connexions, les suppressions effacent les lignes filles en transaction, comme dans la branche.

### 11.2 Partage et copie

- **Ma bibliothèque** : les collections de ma table (`slug` et `session_id` de la table active du MJ).
- **Catalogue public** : en lecture seule, les collections `visibility = 'slug'` des **autres tables du même slug** et `visibility = 'platform'` de **toutes les tables**. Rien n'y apparaît dans ma bibliothèque tant que je ne copie pas.
- **Copie** (indépendante, T-1) :
  - une collection publique → une nouvelle collection de ma table, **privée**, avec copie de ses playlists et vidéos ;
  - une playlist publique (ou à moi) → dans une de mes collections ;
  - une vidéo → dans une de mes playlists.
- **Écriture réservée à la table propriétaire** (S-4) : toute route qui modifie une collection, une playlist ou une vidéo vérifie qu'elle appartient à la table de la requête, sinon 403.

### 11.3 Pistes et état de lecture

Quatre pistes fixes par table, chacune avec ses modes permis (S-5, S-7) :

| Piste (clé) | Type | Modes | Défaut |
|---|---|---|---|
| `music` | musique | `playlist`, `loop`, `shuffle` | `playlist` |
| `ambience1`, `ambience2` | ambiance | `loop`, `playlist` | `loop` |
| `effect` | effet | `once` | `once` |

État en mémoire (`sharedState.audioStates`, clé `${slug}_${sessionId}`) :

```js
{
  slots: {
    music:     { status, trackId, youtubeId, title, gain, playlistId, mode, position, refTime, duration },
    ambience1: { … }, ambience2: { … }, effect: { … },
  },
}
```

Chaque piste se synchronise comme la piste unique validée par le prototype. **Fin de morceau**, selon le mode : `playlist` → suivant de la playlist, arrêt après le dernier (Q-6) ; `loop` → le même morceau repart de 0 ; `shuffle` → un autre morceau au hasard de la playlist ; `once` → arrêt. Le minuteur de fin est armé par piste à partir de la durée remontée par le lecteur du MJ (inchangé, P-1).

`hide_title` est lu dans `audio_session_settings` et ajouté à l'état diffusé.

### 11.4 Routes HTTP

Route partagée `src/server/routes/audio.js`, montée sur `/api/:slug/audio` (comme dans la branche), jeton du slug. Toutes sous `/sessions/:sessionId/` : la table de la requête, qui fixe le propriétaire.

| Méthode et chemin | Droits | Rôle |
|---|---|---|
| `GET /sessions/:sid` | connecté | `{ enabled, hideTitle, tolerance, state, serverTime }` (`tolerance` : §11.11) |
| `PUT /sessions/:sid/enabled` `{ enabled }` | MJ | Activer / désactiver ; désactiver arrête toutes les pistes (P-4) |
| `POST /sessions/:sid/command` `{ slot?, action, … }` | MJ | Commandes, ci-dessous |
| `GET /sessions/:sid/library` | MJ | Ma bibliothèque : collections → playlists → vidéos |
| `GET /sessions/:sid/catalog` | MJ | Catalogue public (§11.2), même forme, avec la table d'origine |
| `POST /sessions/:sid/collections` `{ name }` | MJ | Créer |
| `PUT /sessions/:sid/collections/order` `{ ids }` | MJ | Réordonner |
| `PUT /sessions/:sid/collections/:id` `{ name?, visibility? }` | MJ, propriétaire | Renommer, changer le niveau de partage |
| `DELETE /sessions/:sid/collections/:id` | MJ, propriétaire | Supprimer (contenu compris) |
| `POST /sessions/:sid/collections/:id/copy` | MJ | Copier une collection (publique ou à moi) dans ma table |
| `POST /sessions/:sid/playlists` `{ collectionId, name }` | MJ, propriétaire | Créer |
| `PUT /sessions/:sid/collections/:id/order` `{ playlistIds }` | MJ, propriétaire | Réordonner les playlists |
| `PUT /sessions/:sid/playlists/:id` `{ name?, collectionId? }` | MJ, propriétaire | Renommer, déplacer entre mes collections |
| `DELETE /sessions/:sid/playlists/:id` | MJ, propriétaire | Supprimer |
| `POST /sessions/:sid/playlists/:id/copy` `{ collectionId }` | MJ | Copier une playlist dans une de mes collections |
| `POST /sessions/:sid/playlists/:id/tracks` `{ videoIds }` | MJ, propriétaire | Ajouter (titres oEmbed) |
| `PUT /sessions/:sid/playlists/:id/order` `{ trackIds }` | MJ, propriétaire | Réordonner |
| `PUT /sessions/:sid/tracks/:id` `{ title?, gain?, playlistId? }` | MJ, propriétaire | Renommer, régler le gain, déplacer |
| `POST /sessions/:sid/tracks/:id/copy` `{ playlistId }` | MJ | Copier dans une de mes playlists |
| `DELETE /sessions/:sid/tracks/:id` | MJ, propriétaire | Supprimer |

Commandes (`command`) :
- par piste (`slot`) : `play { trackId }`, `playPlaylist { playlistId }` (premier morceau, ou au hasard en mode `shuffle`), `pause`, `resume`, `seek { position }`, `next`, `previous`, `stop`, `mode { mode }` (refusé hors des modes de la piste) ;
- globales : `stopAll`, `settings { hideTitle }` (enregistré dans `audio_session_settings`) ;
- remontées du lecteur du MJ : `duration { slot, trackId, duration }`, `error { slot, trackId }`.

Un morceau lancé sur une piste peut venir de ma bibliothèque **seulement** (un contenu public se copie d'abord).

### 11.5 Temps réel

- `audio-state { system, sessionId, state, serverTime }` et `audio-enabled { system, sessionId, enabled }` vers la room de la table, comme au §9.5 ; `state` contient les quatre pistes.
- **Horloge** : le prototype mesurait l'écart par un aller-retour socket (`audio-ping`, réponse immédiate du serveur, sans écriture). Repris tel quel : c'est le seul événement émis par le client, en lecture seule, validé en conditions réelles.

### 11.6 Lot 2 : boutons (structure fixée dès maintenant)

`audio_buttons.actions` (JSON) :
- `scene` : `{ slots: { music: { trackId } | { playlistId } | null, ambience1: …, ambience2: …, effect: … } }` ; une piste à `null` ou absente est arrêtée ;
- `target` : `{ slot, trackId } | { slot, playlistId, shuffle? }` ; les autres pistes continuent.

Exécution côté serveur par les commandes du §11.4 (une seule diffusion à la fin). 5 boutons au plus par table, plus STOP (`stopAll`), toujours présent. Un bouton dont le contenu a été supprimé est signalé en erreur et ne fait rien.

### 11.7 Client

Dossier `components/audio/` (en plus des briques déjà commitées : `youtubeApi.js`, `useYouTubePlayer.js`, `audioSync.js`) :

| Fichier | Rôle |
|---|---|
| `hooks/useAudioSession.js` | `{ enabled, hideTitle, state }` à l'entrée et à la reconnexion, écoute `audio-state` / `audio-enabled`, mesure de l'horloge |
| `audioVolume.js` | Volumes du joueur : général et par type, pré-réglages (musique 50, ambiance 10, effet 50), lecture / écriture dans le navigateur sous une clé **unique pour toute la plateforme** ; calcul du volume d'une piste (gain × type × général). Fonctions pures testées |
| `SlotPlayer.jsx` | Un lecteur caché par piste **non vide** (une piste vide ne crée pas de cadre YouTube), recalé par `audioSync.js` ; côté MJ, remonte durée et erreurs |
| `AudioLayer.jsx` | Monté par `GMPage` et `PlayerPage` : rien si la musique est désactivée ; sinon les `SlotPlayer`, la modale « Activer le son », et le panneau MJ ou le lecteur joueur |
| `AudioUnlockModal.jsx` | Sur la `Modal` générique (Q-26) |
| `AudioPlayerWidget.jsx` | Joueur : titre de la **musique** seulement (sauf masqué), volume général et trois volumes par type, coupure ; repliable |
| `AudioGMPanel.jsx` | MJ : panneau flottant agrandissable. Onglet **Lecture** (les quatre pistes : morceau, commandes, mode, position) ; onglet **Bibliothèque** (mes collections, niveau de partage, glisser-déposer, ajout par lien, gain, copie, suppression) ; onglet **Catalogue** (contenus publics, copie) |
| `AudioSessionToggle.jsx` | Élément prêt à l'emploi pour `TabSession` |
| *(lot 2)* `AudioButtonsBar.jsx` | Barre de boutons du MJ, à part du panneau |

Habillage : classes `vtt-audio*` (§9.7), plus `vtt-audio-slot` (états `is-music`, `is-ambience`, `is-effect`). Pilote Vikings.

### 11.8 Reprise de la branche `audio`

- **Abandonné** : les modifications de `base.sql` et des 9 schémas de slug, la migration `27102026_add_audio.sql`, `game_sessions.audio_enabled`.
- **Repris et adapté** : `routes/audio.js` (montage, oEmbed, transactions, minuteur protégé, `playAdjacent` étendu aux modes), passé à `audio.db`, à la propriété par table, à quatre pistes.
- Méthode : rebase de `audio` sur `master`, puis un commit qui retire l'abandonné et ajoute `audio-schema.sql`, `db/modules.js` et l'extension de la migration et de la release.

### 11.9 Fichiers touchés (lot 1)

| Fichier | Changement |
|---|---|
| `database-template/audio-schema.sql` | Nouveau |
| `src/server/db/moduleConfig.js`, `src/server/db/modules/audio.js` | Nouveaux : chargement d'une base de module, déclaration de la base audio |
| `scripts/migrate.js`, `scripts/release.js`, `scripts/install.sh` | Noms de module acceptés dans `-- systems:` |
| `src/server/routes/audio.js` | Repris de la branche, adapté |
| `src/server/systems/Loader.js`, `src/server/server.js` | Montage (déjà dans la branche) |
| `src/server/socket/index.js` | `audioStates` (déjà là), `audio-ping` |
| `src/client/src/hooks/useAudioSession.js`, `src/client/src/components/audio/*` | Nouveaux (§11.7) |
| `src/client/src/pages/GMPage.jsx`, `PlayerPage.jsx` | Montage d'`AudioLayer` |
| `src/client/src/index.css` | Style par défaut `vtt-audio*` |
| `src/client/src/systems/vikings/gm/tabs/TabSession.jsx`, `systems/vikings/theme.css` | Pose de l'élément d'activation, habillage |
| `src/client/tests/components/audio/audioVolume.test.js` | Nouveau |
| `documentations/spec_release.md`, `src/server/CLAUDE.md`, `/new-slug` | Bases de module, brique audio et son élément `TabSession` |

### 11.10 Points à valider

| # | Point | Proposition | Réponse MJ |
|---|---|---|---|
| P2-1 | Suppression d'une table (`game_sessions`) : son contenu audio (collections, réglages) reste orphelin dans `audio.db`, faute de lien entre les bases. Le purger à la suppression de la table ? Les copies faites par d'autres tables ne sont pas touchées (elles sont indépendantes) | Oui, purge à la suppression de la table (une ligne d'appel dans `sessions.js`) | Non : rien dans les slugs ni dans les sessions de la plateforme. **Contrôle à la connexion du MJ** dans un slug : les collections (et réglages, boutons) dont la table n'existe plus sont supprimés à ce moment-là (§11.11) |
| P2-2 | « Masquer le titre » : enregistré avec la table (`audio_session_settings`) plutôt qu'en mémoire (Q-28) ? Ça ne coûte rien de plus désormais | Oui | Oui |
| P2-3 | Horloge par aller-retour socket (`audio-ping`), seul événement émis par le client, en lecture seule, comme dans le prototype validé ? | Oui | Oui. **Tolérance de recalage à 1 s**, modifiable plus tard sans toucher au code, par une variable du `.env` (§11.11) |
| P2-4 | Changer une collection publique en privée : les tables qui l'ont copiée gardent leurs copies (indépendantes), la collection disparaît seulement du catalogue ? | Oui | Oui |
| P2-5 | Un morceau ne se lance que depuis ma bibliothèque : écouter un contenu public demande de le copier d'abord. Ou faut-il une **écoute d'essai** depuis le catalogue (sur la piste musique, sans copie) ? | Pas d'écoute d'essai en v1 : la copie suffit et se supprime facilement | Pas en v1, mais **à prévoir dans une mise à jour** (§8) |
| P2-6 | Ordre d'implémentation du lot 1 : (1) base de module, migration et release (commun avec le tableau), (2) serveur : bibliothèque, partage, état à quatre pistes, (3) lecteurs, volumes, modale, lecteur joueur, (4) panneau MJ, (5) élément d'activation et habillage Vikings. Point de contrôle après (1) et après (3) ? | Oui | Oui |

### 11.11 Décisions des points P2 (2026-10-31)

- **Tables supprimées (P2-1)** : aucun ajout dans les slugs ni dans `routes/sessions.js`. Au chargement de la bibliothèque par le MJ d'un slug (`GET /sessions/:sid/library`), le serveur compare les `session_id` de ce slug présents dans `audio.db` aux tables de la base du slug, et supprime collections (contenu compris), réglages et boutons des tables disparues. Les copies faites par d'autres tables ne sont pas touchées. Limite connue : si la base d'un slug était recréée de zéro, une nouvelle table pourrait reprendre l'identifiant d'une ancienne et hériter de son contenu audio (cas exceptionnel, sans gravité).
- **« Masquer le titre » enregistré avec la table** (P2-2).
- **Tolérance de recalage à 1 s** (P2-3), lue par le serveur dans la variable `AUDIO_SYNC_TOLERANCE` du `.env` (en secondes, 1 par défaut si absente) et transmise au client dans la réponse de `GET /sessions/:sid` : un changement ne demande ni build ni release, seulement un redémarrage du serveur.
- **Collection repassée en privé** : les copies restent, elle sort du catalogue (P2-4).
- **Écoute d'essai depuis le catalogue** : pas en v1, à prévoir dans une mise à jour (P2-5, §8).
- **Ordre du lot 1** validé, points de contrôle après les étapes 1 et 3 (P2-6).

### 11.12 Retours du premier essai en dev (2026-10-31)

- **Deux boutons flottants** côte à côte : réglages du son, et pour le MJ le panneau, ouvert en un clic. Le bouton du panneau est là dès qu'une table est active, **même musique désactivée** : le MJ prépare sa bibliothèque, et active la musique depuis l'onglet Lecture (l'élément de `TabSession` reste disponible).
- **Réglages du son** : volume général et coupure visibles, volumes par type repliés (état mémorisé).
- **Panneau MJ en fenêtre** : déplaçable par sa barre de titre, redimensionnable par ses bords et ses coins, **réductible** à sa barre de titre (agrandir, plein écran, fermer), position, taille et réduction mémorisées dans le navigateur ; ouvert ou fermé, retrouvé après rechargement.
- **Coller un lien sans étape** : barre « Coller un lien » en tête de la bibliothèque. Une playlist YouTube devient une nouvelle playlist, **au titre repris de YouTube** (oEmbed) ; une vidéo va dans la playlist visée (⌖), sinon dans une nouvelle playlist qui devient la cible des liens suivants. Collection et noms facultatifs : la première collection de la table sert, ou une collection est créée ; noms par défaut « Collection n », « Playlist n », renommables ensuite.
- Serveur : `POST /sessions/:sid/playlists` accepte `collectionId`, `name`, `listId`, `videoIds` tous facultatifs (création et remplissage en un appel) ; `POST /sessions/:sid/collections` accepte un nom vide.

### 11.13 Refonte du panneau MJ (2026-10-31, maquette validée)

Second essai : interface trop centrée sur les pistes, trop de clics pour retrouver un titre. **Le cœur du module : diffuser de la musique à la table.** Maquette cliquable `documentations/audio/maquette_panneau_mj.html`, validée par le MJ (le panneau réel garde en plus le déplacement par la barre de titre et les poignées sur tous les bords).

- **Une seule vue, sans onglets.** En haut, **ce qui joue**, toujours visible : titre de la musique, lien vers sa playlist, précédent / lecture-pause / suivant, position, mode (un clic fait défiler playlist, boucle, aléatoire). Ambiances et effet en **pastilles**, seulement s'ils jouent : mode (boucle, playlist), pause, arrêt. Un menu ⋯ porte « Tout arrêter », titre masqué aux joueurs, désactiver la musique. Musique désactivée : un bandeau « Activer ».
- **En dessous, la bibliothèque, rouverte sur la dernière playlist consultée** (mémorisée par table). Fil d'Ariane pour remonter. **▶** lance en musique ; **≋** joue sur Ambiance 1, Ambiance 2 ou Effet (« remplace » si la piste est occupée) ; **⋯** regroupe la gestion (renommer sur place, volume de la vidéo, copier, déplacer, supprimer ; partage au niveau de la collection). Titre en cours surligné. Glisser-déposer pour l'ordre.
- **Recherche** dans tous les titres de la bibliothèque, avec leur emplacement.
- **Ajout d'un lien à la Watch2Gether** : « Ajouter un lien » en pied ouvre un champ et son bouton (« Importer la playlist » si c'en est une) ; **Ctrl+V** dans le panneau fait de même. Une vidéo va dans la playlist affichée, sinon dans une nouvelle playlist (dans une nouvelle collection s'il n'y en a aucune) ; une playlist YouTube devient une nouvelle playlist à son titre. Plus de texte d'aide sous le champ.
- **Catalogue public** dans une fenêtre, depuis le pied du panneau.
- **Panneau large ou plein écran** : collections et playlists à gauche, titres à droite. Réduit : barre de titre seule, avec le morceau en cours.
- **Accessibilité** : tout au clavier, menus aux flèches, Échap ferme menu, renommage ou champ d'ajout et rend le focus au bouton d'origine, noms lisibles sur les boutons icônes, cibles de 32 px au moins, animation coupée si le système réduit les mouvements.
- Technique : le panneau est un conteneur de requêtes de taille (`container-type`), qui piège ce qui est en position fixe : menus, confirmations, sélecteurs et catalogue passent par `HostedModal` (emplacement à modales de la page).

### 11.14 Durée des titres (2026-10-31)

- Affichée à côté du titre dans la bibliothèque : « Titre (3:47) », « Titre (1:41:25) ».
- YouTube ne la donne pas sans clé d'API (oEmbed : titre seulement). Elle est relevée de deux façons : **à la lecture** (le lecteur du MJ la remonte déjà, le serveur l'enregistre désormais avec la vidéo) et **à l'affichage** (un lecteur caché du panneau MJ charge sans les jouer, une par une, les vidéos affichées dont la durée manque, et envoie les durées par lots). Une copie garde la durée.
- Base : colonne `audio_tracks.duration` (secondes, null si inconnue), dans `audio-schema.sql` et la migration `31102026_audio_track_duration.sql` (`-- systems: audio`), utile aux bases de dev ; en prod, la base audio n'existe pas encore et la migration est ignorée.
- Route : `PUT /sessions/:sid/tracks/durations { durations: [{ id, duration }] }`, limitée aux vidéos de la table.
- Un titre trop long se coupe ; la durée garde toujours sa place.

### 11.15 Piste par défaut d'une playlist (2026-10-31, idée du MJ)

- Chaque playlist a sa **piste** : Musique (défaut), Ambiance 1, Ambiance 2 ou Effet. ▶ sur un de ses titres joue sur cette piste ; ≋ propose les autres.
- Réglée par une **pastille** cliquable entre le fil d'Ariane et la recherche (playlist ouverte), et sur chaque ligne de playlist. Pastille discrète en Musique, en couleur pour les autres pistes.
- Le ▶ de la playlist entière n'existe que pour une playlist en Musique ; les autres se lancent titre par titre.
- Choix d'une piste précise (pas de « première ambiance libre ») : à revoir à l'usage si besoin.
- Base : `audio_playlists.default_slot` (`music` par défaut), dans `audio-schema.sql` et la migration `31102026_audio_playlist_slot.sql` (`-- systems: audio`, base de dev ; ignorée en prod). Une copie garde la piste. Route : `PUT /sessions/:sid/playlists/:id { defaultSlot }`.

### 11.16 Rangement après relecture du code par le MJ (2026-10-31)

Les chemins des §11.7 et §11.9 sont remplacés par ceux-ci. Principe : la brique audio suit l'organisation de la plateforme (comme la barre de session ou le combat), sans espace « module » à part.

- **Sockets de la plateforme, un fichier par domaine** : `src/server/socket/platform/presence.js`, `sessions.js` (sessions MJ et rooms), `audio.js` (`audio-ping`) ; chacun exporte `register(io, socket, sharedState)` et gère sa propre déconnexion ; `socket/index.js` les branche, puis les handlers des slugs. L'ancien `socket/handlers.js` disparaît, comportement inchangé (vérifié : présence, sessions MJ, rooms, joueur tardif, déconnexion et timer, reprise, désactivation).
- **Base de module, une déclaration par base** : `src/server/db/modules/audio.js` ; `getModuleConfig(nom)` (`src/server/db/moduleConfig.js`) ne charge que la déclaration demandée. Route inchangée : `src/server/routes/audio.js`.
- **Client rangé selon les conventions** :
  - composants : `components/audio/` (`AudioLayer`, `AudioGMPanel` qui assemble, `AudioPlayerWidget`, `SlotPlayer`, `AudioUnlockModal`, `AudioSessionToggle`) et `components/audio/panel/` (le panneau découpé : `NowPlaying`, `LibraryBrowser`, `LibraryRows`, `RowMenu`, `SlotChip`, `PanelDialogs`, `HiddenPlayers`, `AddLinkFoot`, `PanelIcons`) ;
  - hooks : `hooks/useAudioSession.js`, `useAudioLibrary.js`, `useYouTubePlayer.js`, et deux hooks génériques `useFloatingWindow.js` (fenêtre flottante) et `useDragOrder.js` (glisser-déposer) ;
  - logique pure et config : `tools/audioSync.js`, `audioVolume.js`, `audioLibrary.js`, `audioSlots.js`, `panelGeometry.js`, `youtubeApi.js` ; `tools/utils.js` gagne `readStorage` / `writeStorage` ;
  - tests : `tests/tools/` (miroir) ; la recherche ignore désormais les accents (`normalizeText` de `tools/catalog.js`).
- **Classes génériques réutilisées** : le panneau prend `vtt-modal-panel`, `vtt-modal-header`, `vtt-modal-title`, `vtt-modal-close` / `-expand` et `vtt-modal-deco` ; les menus ≋ et ⋯, la pastille de piste et le petit panneau du son prennent `vtt-menu`, `vtt-menu-item`, `vtt-menu-separator`. Ils reprennent ainsi l'habillage des modales et des menus de chaque slug ; les classes `vtt-audio-*` ne gardent que ce qui n'a pas d'équivalent (fenêtre flottante, ce qui joue, lignes, pastilles, poignées, boutons ronds).

### 11.17 Passage sur les briques génériques (2026-11-01)

- **Fenêtre** : le panneau MJ est une `FloatingPanel` (`spec_ui_panneaux.md`), mémorisée sous `vtt:platform:panel:audio` ; `AudioGMPanel` ne garde que le contenu. Les classes `vtt-audio-panel-*` et `vtt-audio-resize-*` laissent place aux `vtt-floating-*` ; `vtt-audio-panel` reste sur la fenêtre pour qu'un slug puisse habiller celle-ci en particulier.
- **Stockage** (`spec_browser_storage.md`) : réglages audio du navigateur regroupés dans `vtt:platform:audio` (volumes, réglages du son dépliés, volumes par type dépliés, panneau MJ ouvert), dernière vue de la bibliothèque dans `vtt:<slug>:<table>:audio` ; tout passe par `usePersistedState`. Les six anciennes clés `vtt-audio-…` n'ont jamais été en prod : pas de reprise (en dev, elles restent inertes et peuvent être effacées). `readStorage` / `writeStorage` sont retirés de `tools/utils.js`.
- Le petit panneau du son est désormais tenu par `AudioLayer` (états dépliés en props), qui donne le focus au panneau MJ seulement quand il est ouvert d'un clic.

### 11.18 Tous les slugs et habillage (2026-11-01)

- **Habillage sans planche** (décision du MJ, précédent du menu, `spec_ui_menu.md` Q-1). « Couper le son » est un `vtt-btn vtt-btn-sm` (`vtt-btn-danger` une fois coupé), habillé avec le menu du slug. Les boutons flottants gardent leurs classes propres (`vtt-audio-buttons`, `vtt-audio-toggle`, états `.vtt-audio-widget.is-playing` et `.vtt-audio-toggle-gm.is-active`) : ronds et opaques par défaut, **habillés par chaque `theme.css`** (bloc « Musique : boutons flottants » en fin de fichier) : bouclier rond (Vikings), coins coupés néon (Cyberpunk), petite fenêtre JRPG (Fabula), boîtier de caméscope au voyant d'enregistrement (Zone Blanche), tampon encreur (Achtung), case de formulaire (Delta Green), pans coupés sable et or (Dune), insigne à double filet (Tecumah). Un premier essai en `vtt-btn vtt-btn-icon` sur un socle commun donnait le même rendu carré partout : abandonné.
- **Mémorisation par slug** (retour du MJ) : la fenêtre du panneau (`vtt:<slug>:panel:audio`, par `FloatingPanel`) et l'ouverture des réglages du son et du panneau (`vtt:<slug>:audio`) sont propres à chaque slug ; seuls les volumes restent pour toute la plateforme (`vtt:platform:audio`). Les anciennes valeurs de dev sous `vtt:platform:panel:audio` restent inertes.
- **Fenêtre réduite** : barre plus compacte sur la plateforme ; Achtung sans le pli du papier (il barrait le titre) ni le double filet d'en-tête, Dune sans l'horizon, Cyberpunk sans le filet d'en-tête ; Delta Green sans le tampon « Confidentiel » sur toute fenêtre flottante, agrafe gardée (bloc « Fenêtres flottantes » en fin de `theme.css`).
- **Second retour du MJ** : bouton lecture / pause (`vtt-audio-icon-btn.is-main`) dont l'icône prend `--color-bg` quand le slug ne définit pas `--color-on-primary` (seul Vikings le fait ; l'icône avait la couleur du fond), forme habillée par slug ; listes et arbre en `vtt-scroll` ; « + Playlist » sous chaque collection de l'arbre, libellés courts « + Playlist » / « + Collection » ; activation Cyberpunk remontée sous le titre de la colonne. Boutons flottants des slugs qui gênaient ceux de l'audio : Dune MJ (historique) remplacé par un onglet « ⏳ Historique », Zone Blanche MJ (« Jet MJ », doublon de l'en-tête) supprimé. Idée gardée (backlog) : panneau latéral d'historique en brique plateforme, et zone générale de boutons d'actions à la place des boutons flottants de l'audio.
- **Troisième retour du MJ** : panneau réduit avec mini-contrôles (⏮ ▶/⏸ ⏭ de la musique, ■ tout arrêter) à côté du titre en cours, tronqué si besoin ; prop générique `minimizedActions` de `FloatingPanel` (réduite seulement). Réglages du son : placement dans le flux imposé hors couche (`.vtt-audio-widget .vtt-audio-widget-panel`), Zone Blanche et Achtung plaçant `.vtt-menu` en absolu pour leur menu hamburger (le volet partait vers le bas) ; boutons flottants et réglages au-dessus des fenêtres flottantes (plan 100, sous les modales), le panneau MJ s'ouvrant par défaut juste au-dessus d'eux.

### 11.19 Lot 3 : nettoyage du prototype (2026-11-01)

- Retirés : la page `/tools/audio` (`pages/AudioProtoPage.jsx` et sa route dans `AppRouter.jsx`) et le relais `socket/audioProto.js` (et son branchement dans `socket/index.js`), comme prévu (R-15, T-5).
- Gardés, car utilisés par la brique : `tools/audioSync.js`, `tools/youtubeApi.js`, `hooks/useYouTubePlayer.js`.

### 11.20 Boutons sur la zone d'actions (2026-11-01)

- Les boutons de la musique passent sur la zone d'actions de la plateforme (`spec_ui_actions.md` §6.3) : `AudioPlayerWidget` rend deux `ZoneAction`, « Réglages du son » (`sound`, en lecture : `is-highlighted`, volet des réglages) et, pour le MJ, « Musique » (`music`, panneau ouvert : `is-active`). Comportement inchangé.
- Classes renommées dans les 8 `theme.css`, même rendu : `vtt-audio-toggle` → `vtt-action-btn`, `vtt-audio-buttons` → `vtt-actions-bar` ; variables de position `--vtt-audio-bottom` / `--vtt-audio-right` → `--vtt-actions-bottom` / `--vtt-actions-right`.
- **Élément d'activation posé dans les 8 slugs** (Noctis exclu) : Vikings, Cyberpunk, Zone Blanche et Achtung en bas de la colonne des personnages, Fabula dans l'en-tête de cette colonne, Delta Green sous l'en-tête de la colonne des agents, Dune et Tecumah au bout de la barre de sélection des personnages ; chacun avec les classes de bouton de son slug.
- `/new-slug` et `guide_new_slug_jdr.md` : l'élément d'activation fait partie de la création d'un slug (phase 2 : son emplacement ; phase 3 et checklist : sa pose), sans habillage propre.

## 12. Lot 2 : boutons préréglés — phase 1 (2026-11-01)

### 12.1 Déjà décidé

- Par **table**, **5 boutons au plus**, plus **STOP** (tout arrêter) toujours présent, hors du compte (§10.8, T-3).
- Deux modes (S-10, §11.6) : **scène** (fixe le contenu de chaque piste ; les pistes non citées s'éteignent) et **ciblé** (change une piste, les autres continuent). Un morceau précis ou une playlist, le hasard faisant passer la piste en mode aléatoire ; un bouton peut lancer un effet.
- Contenu **de la table seulement** ; un bouton dont le contenu a été supprimé est signalé en erreur et ne fait rien.
- Une **barre à part, repliable, distincte du panneau de gestion** : le MJ lance « Combat » sans ouvrir le panneau (S-12).
- Noms des boutons **jamais montrés aux joueurs** (R-13). Coupure sèche, fondu en évolution (S-14).
- Table `audio_buttons` (`label`, `position`, `mode`, `actions` JSON) déjà créée dans `audio.db` : pas de migration (§11.1).

### 12.2 Ce qui a changé depuis

- **La zone d'actions existe** (`spec_ui_actions.md`) : une action peut avoir un **volet** qui s'ouvre au-dessus de la zone (c'est le cas des réglages du son). La « barre à part, repliable » peut donc être un volet de la zone plutôt qu'un nouvel élément flottant.
- Le panneau réduit a déjà un **■ tout arrêter** dans sa barre.

### 12.3 Pistes

**Où vivent les boutons**

| | A. Volet d'une action de la zone | B. Barre flottante à part (`FloatingPanel` sans cadre ou bande dédiée) | C. Dans le panneau de la musique |
|---|---|---|---|
| Accès | Une action « Scènes » dans la zone ; son volet montre les boutons et STOP ; il reste ouvert tant qu'on ne le referme pas (mémorisé par slug) | Toujours visible, déplaçable | Il faut ouvrir le panneau |
| Mécanique | Celle de la zone, déjà là | Une fenêtre de plus à placer à l'écran | Existante |
| Conforme à S-12 | Oui (à part, repliable) | Oui | Non (c'est le panneau de gestion) |

**Comment le MJ crée un bouton** — plutôt qu'un formulaire qui fait choisir piste par piste, partir de ce qu'il fait déjà dans le panneau :
- **Scène = « Enregistrer ce qui joue »** : le MJ monte son mélange dans le panneau (musique, ambiances, effet), puis l'enregistre comme bouton, sous un nom. Le bouton relancera exactement ce mélange.
- **Ciblé = depuis une ligne de la bibliothèque** : le menu ⋯ d'un titre ou d'une playlist propose « Créer un bouton… », avec la piste visée (musique, ambiance 1 ou 2, effet) et, pour une playlist, « au hasard ».
- **Gestion** dans le volet, en mode « modifier » : renommer, réordonner, supprimer, et pour une scène « Remplacer par ce qui joue ».

**Ce qu'une scène enregistre de chaque piste** : la playlist, le morceau en cours et le mode (une playlist en lecture enchaînée repart de ce morceau, en mode aléatoire elle repart au hasard ; un morceau en boucle reste ce morceau). Le JSON du §11.6 gagne donc le mode : aucune donnée n'existe encore, rien à reprendre.

### 12.4 Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| U-1 | Où vivent les boutons (§12.3) ? | **A** : une action « Scènes » de la zone (MJ seulement), dont le volet porte les boutons et STOP ; le volet reste ouvert jusqu'à ce qu'on le referme, mémorisé par slug | Pas dans la zone d'actions (déjà 3 boutons côté MJ). Là où le slug le veut (onglet Session = fiche du joueur, la vue la plus utilisée) et dans le panneau de la musique, y compris sa barre réduite. Voir §12.5 |
| U-2 | Création d'une scène : « Enregistrer ce qui joue » plutôt qu'un formulaire piste par piste ? | Oui ; un formulaire pourra venir plus tard si le besoin apparaît | Oui, rester simple, pas de nouveau formulaire |
| U-3 | Création d'un bouton ciblé : depuis le menu ⋯ d'un titre ou d'une playlist (piste visée, « au hasard » pour une playlist) ? | Oui | Oui |
| U-4 | Ce qu'une scène enregistre d'une piste : playlist, morceau en cours et mode (§12.3) ? Ou seulement la playlist, relancée depuis son début ? | Playlist, morceau et mode : le bouton refait exactement ce qu'on entendait | Oui (proposition) |
| U-5 | Un bouton scène qui ne cite pas une piste : il l'arrête (décidé, S-10). Un bouton ciblé sur une piste qui joue déjà autre chose : il la remplace sans rien demander ? | Oui, coupure sèche (S-14) | Oui (proposition) |
| U-6 | Musique désactivée sur la table : les boutons sont-ils visibles ? | Le volet reste accessible (le MJ prépare ses boutons), boutons grisés avec « Musique désactivée » et un lien pour l'activer | Bascule : musique activée → accès au menu des scènes (§12.5) |
| U-7 | Bouton en erreur (contenu supprimé) : comment le signaler ? | Grisé avec un pictogramme d'alerte et une infobulle « Contenu supprimé » ; un clic ne fait rien ; « Remplacer par ce qui joue » ou supprimer le répare | Oui (proposition) |
| U-8 | Retour visuel : le bouton de la dernière scène lancée reste-t-il marqué tant qu'on ne change rien ? | Oui, marqué « en cours » jusqu'à une autre commande ; aucune information envoyée aux joueurs | Oui (proposition) |
| U-9 | Habillage du volet | Comme les réglages du son : un `.vtt-menu` habillé par le slug, boutons en `vtt-btn`, STOP en `vtt-btn-danger` ; rien de propre au slug | Oui (proposition) |
| U-10 | Icône de l'action « Scènes » | Icône au trait de la plateforme, remplaçable par `actionIcons.scenes` dans `config.jsx` (comme les autres) | Sans objet : pas d'action dans la zone |

### 12.5 Décisions (2026-11-01)

- **Un menu « Scènes », une seule brique, trois endroits** ; **pas dans la zone d'actions** :
  - dans le **panneau ouvert**, un petit bouton texte « Scènes ▾ » sur la ligne de « ce qui joue », à côté du menu ⋯ de la session (même gabarit que ≋ et ⋯) : **aucune rangée de boutons**, le panneau reste sobre (« on teste, on voit à l'usage ») ;
  - dans la **barre du panneau réduit**, à côté de ■ ;
  - dans l'**onglet Session** des 8 slugs (Noctis exclu), par une **bascule** qui remplace l'élément d'activation : musique désactivée → « Activer la musique » ; activée → un bouton « Musique ▾ » qui ouvre le menu des scènes, terminé par « Désactiver la musique ».
- **Contenu du menu**, le même partout : les boutons (5 au plus), la dernière scène lancée cochée, ceux en erreur grisés ; STOP ; « Enregistrer ce qui joue… » ; « Modifier les scènes… » (petite fenêtre à part : renommer, réordonner, supprimer, remplacer par ce qui joue). La gestion n'entre pas dans le panneau.
- **Création** : scène = « Enregistrer ce qui joue » ; ciblé = « Créer un bouton… » dans le menu ⋯ d'un titre ou d'une playlist. Pas de formulaire piste par piste.
- **Limite** : 5 boutons par table, plus STOP.
- **Hors lot** : raccourcis clavier (évolution) ; réglages du son du MJ déplacés dans le panneau pour ne lui laisser qu'un bouton audio dans la zone (idée de prochain chantier, pas une décision).

### 12.6 Spécification technique (phase 2)

**Données** — `audio_buttons` existe (§11.1), aucune migration. `mode` : `scene` ou `target`. `actions` (JSON), précisé par rapport au §11.6 (table vide, rien à reprendre) :
- `scene` : `{ slots: { music: { trackId, playlistId, mode } | null, ambience1: …, ambience2: …, effect: … } }` ;
- `target` : `{ slot, trackId }` ou `{ slot, playlistId, shuffle }`.

**Serveur** (`routes/audio.js`, sous `/sessions/:sid/`, MJ seulement, réponse = liste des boutons à jour) :

| Route | Rôle |
|---|---|
| `GET /buttons` | Boutons de la table, dans l'ordre, chacun avec `broken` (contenu absent de la bibliothèque de la table) |
| `POST /buttons` `{ label, mode: 'scene' }` | Enregistre **ce qui joue**, lu dans l'état du serveur : chaque piste avec un morceau (en lecture ou en pause) → `{ trackId, playlistId, mode }`, sinon `null`. Refus si rien ne joue (400) |
| `POST /buttons` `{ label, mode: 'target', slot, trackId \| playlistId, shuffle? }` | Bouton ciblé ; vérifie que le contenu est à la table et que la piste l'accepte |
| `PUT /buttons/order` `{ ids }` | Réordonner (déclarée avant `/buttons/:id`) |
| `PUT /buttons/:id` `{ label?, capture? }` | Renommer ; `capture: true` remplace une scène par ce qui joue |
| `DELETE /buttons/:id` | Supprimer |
| `POST /buttons/:id/run` | Lancer : 409 si la musique est désactivée, 422 si le bouton est en erreur ; une seule diffusion `audio-state` à la fin |

- **5 au plus** : `POST` renvoie 409 au-delà.
- **Pistes acceptées** par un bouton ciblé : un titre sur n'importe quelle piste ; une playlist sur la musique (enchaînée ou au hasard) ou une ambiance (enchaînée), pas sur l'effet. « Au hasard » seulement sur la musique (les ambiances n'ont pas ce mode).
- **Lancer une scène** : pour chaque piste citée, mode rétabli puis morceau lancé depuis le début (en mode `shuffle`, un morceau au hasard de la playlist) ; pistes non citées arrêtées. **Bouton ciblé** : seule sa piste change (mode `shuffle` ou `playlist` pour une playlist), les autres continuent ; coupure sèche (S-14).
- **Dernière scène lancée** : `state.lastButtonId` dans l'état en mémoire (diffusé avec `audio-state` : un identifiant, jamais un nom). Remis à `null` par toute commande qui change le contenu (`play`, `playPlaylist`, `next`, `previous`, `stop`, `stopAll`, un autre bouton) ; gardé par `pause`, `resume`, `seek`, `mode`, les remontées du lecteur et l'enchaînement automatique.
- **Synchronisation** entre le panneau et l'onglet Session (et les autres onglets du MJ) : après chaque modification, `audio-buttons-changed { system, sessionId }` vers la room, **sans les noms** ; les clients MJ relisent la liste. Les joueurs ne reçoivent ni la liste ni les noms.
- **Contenu supprimé** : rien n'est effacé en cascade ; le bouton passe `broken` à la lecture suivante de la liste.

**Client**

| Fichier | Rôle |
|---|---|
| `hooks/useAudioButtons.js` (nouveau) | Liste des boutons d'une table (MJ), relue sur `audio-buttons-changed` ; `run`, `saveScene(label)`, `createTarget(…)`, `rename`, `capture`, `reorder`, `remove` |
| `components/audio/AudioScenesMenu.jsx` (nouveau) | Le menu (via `RowMenu` : `.vtt-menu`, `HostedModal`, habillé par le slug) ; bouton déclencheur fourni par l'appelant (texte « Scènes ▾ », icône dans la barre réduite, « Musique ▾ » dans l'onglet Session) |
| `components/audio/panel/ScenesDialog.jsx` (nouveau) | « Modifier les scènes… » : liste, renommage, ordre (glisser, `useDragOrder`), suppression (confirmation), « Remplacer par ce qui joue » ; nom demandé à l'enregistrement |
| `components/audio/AudioSessionToggle.jsx` | Devient la **bascule** : désactivée → « Activer la musique » ; activée → « Musique ▾ » qui ouvre `AudioScenesMenu`, terminé par « Désactiver la musique ». **Même contrat** (`sessionId`, `label`, `icon`, `className`) : les 8 `TabSession` n'ont rien à changer |
| `components/audio/panel/NowPlaying.jsx` | « Scènes ▾ » à côté du menu ⋯ de la session |
| `components/audio/AudioGMPanel.jsx` | « Scènes » dans les actions de la barre réduite, à côté de ■ |
| `components/audio/panel/LibraryRows.jsx` | « Créer un bouton… » dans le menu ⋯ d'un titre et d'une playlist (choix de la piste, « au hasard » pour la musique) |

- **États du menu** : coche sur `lastButtonId` ; bouton `broken` grisé avec ⚠ et infobulle « Contenu supprimé » ; musique désactivée (panneau) : boutons grisés et « Musique désactivée » ; « Enregistrer ce qui joue… » grisé si rien ne joue ou si 5 boutons existent déjà ; « Créer un bouton… » grisé à 5 avec « 5 boutons au plus ».
- **Habillage** : rien de propre au slug, le menu et la fenêtre reprennent `.vtt-menu`, `.vtt-modal-*` et `.vtt-btn*` déjà habillés ; STOP en `is-danger`.
- **Vérification** : script de fumée côté serveur (création, limite, lancement d'une scène et d'un bouton ciblé, `lastButtonId`, bouton en erreur), comme pour le lot 1 ; pas de test Vitest (aucune fonction pure côté client).

**Documentation** : ce §12 ; `/new-slug` (l'élément d'activation devient la bascule « Musique ▾ ») ; `spec_browser_storage.md` inchangé (rien de mémorisé).

### 12.7 Contenu supprimé : les boutons suivent (2026-11-01, retour du MJ, option B)

- Remplace « signalé en erreur » (§10.8, §12.1) : à la suppression d'un titre, d'une playlist ou d'une collection, le serveur fait le ménage des boutons de la table (`pruneButtons`), puis envoie `audio-buttons-changed`.
- **Bouton ciblé** dont le titre ou la playlist a disparu : **supprimé**.
- **Scène** : la piste dont le contenu a disparu est **retirée** (elle sera arrêtée au lancement, comme une piste vide) ; la scène n'est supprimée que s'il ne lui reste aucune piste. Dernière scène lancée effacée si son bouton disparaît.
- Seul cas restant « en erreur » : un bouton « au hasard » dont la playlist existe mais a été vidée ; grisé dans le menu, il ne fait rien (422).

## 13. Autres sources, timecode, fenêtres réduites — phase 1 (2026-11-10)

### 13.1 Demande

1. Ajouter et lire des vidéos d'autres plateformes que YouTube.
2. Ajouter et lire des morceaux de Suno.
3. Fenêtres flottantes (brique plateforme, pas seulement la musique) : réduites et sans place en dessous, elles doivent s'agrandir vers le haut.
4. Les boutons d'actions de la musique doivent pouvoir lancer à partir d'un timecode.

### 13.2 Diagnostic : tout est lié à YouTube, sauf la synchronisation

- Liés à YouTube : la colonne `audio_tracks.youtube_id`, le champ `youtubeId` de l'état diffusé, `SlotPlayer` (bâti sur `useYouTubePlayer`), l'ajout par lien (`parseYouTubeLink`, titres par l'oEmbed de YouTube), la durée relevée par les lecteurs cachés du panneau (`HiddenPlayers`).
- **Indépendante du lecteur** : la synchronisation (`audioSync.planSync`) ne demande que charger, lire, mettre en pause, se positionner, lire la position et l'état. C'est elle qui a été validée en conditions réelles : elle ne bouge pas.
- Piste proposée : un morceau a une **source** et un **identifiant** ; chaque source a son **adaptateur de lecteur**, tous avec la même interface, branché sous `SlotPlayer`. Bibliothèque, partage, copie, pistes, boutons : inchangés.
- Base : une colonne `audio_tracks.source` (`youtube` par défaut) et `youtube_id` renommée `media_id` (identifiant YouTube, Vimeo ou Suno, ou adresse du fichier). Migration `-- systems: audio` ; rien dans les slugs.

### 13.3 Plateformes

| Plateforme | Pilotable (lecture, pause, position, volume, fin) | Titre | Remarque | Avis |
|---|---|---|---|---|
| YouTube | Oui | oEmbed | En place | — |
| Vimeo | Oui (Player SDK officiel) | oEmbed | Sans pub ; l'auteur peut interdire l'intégration | Oui |
| SoundCloud | Oui (Widget API officielle) | oEmbed | Son seul : beaucoup d'ambiances et de bandes originales ; certains titres réduits à un extrait de 30 s (réservés aux abonnés) | Oui |
| Dailymotion | Oui (Player API) | oEmbed | Demande de créer un lecteur sur un compte Dailymotion (gratuit) ; pubs comme YouTube | À voir selon ton besoin |
| **Suno** | Pas d'API de lecteur intégré ; mais une chanson publique est servie en fichier MP3 direct, lu par le lecteur audio du navigateur | Lu sur la page de la chanson (côté serveur) | Zéro pub, synchronisation parfaite, aucun fichier sur notre serveur ; adresse du MP3 non documentée par Suno, à vérifier sur un vrai lien ; chanson privée illisible | Oui |
| Spotify, Deezer, Apple Music | Non : sans le compte de chaque auditeur, extraits de 30 s ; pas de réglage du volume | — | — | Écartés |
| Twitch | Direct : pas de position commune | — | — | Écarté |

**Suggestion** : le lecteur audio du navigateur qu'il faut pour Suno lit aussi n'importe quel **lien direct vers un fichier son** (MP3 / OGG hébergé ailleurs : Dropbox, archive.org, Tabletop Audio…). Ça vient presque sans travail en plus et reste fidèle à la décision « aucun fichier sur le serveur » (§3) : le fichier est hébergé ailleurs.

Ajout : la même barre « Ajouter un lien » et Ctrl+V reconnaissent la plateforme d'après le lien. Import de playlist : YouTube seulement au départ (V-4).

### 13.4 Timecode

- Aujourd'hui, un morceau lancé démarre à 0 ; seul `seek` le déplace ensuite.
- Endroits possibles du point de départ :
  - **(a) bouton ciblé** sur un titre : « à partir de 1:23 », dans le JSON du bouton (pas de migration) ;
  - **(b) scène** : « Enregistrer ce qui joue » garde la position de chaque piste (aujourd'hui, une scène relance depuis le début), modifiable dans « Modifier les scènes… » ;
  - **(c) titre de la bibliothèque** : un début (et une fin) d'extrait par titre, valable pour ▶, l'enchaînement, la boucle et les boutons (évolution déjà notée au §8 : introduction coupée, effet tiré d'une compilation). Demande une colonne.
- Saisie : « 1:23 », « 1:02:03 » ou des secondes (fonction pure testée). Un lien collé avec un temps (`?t=83`, `&t=1m23s`) peut le reprendre.
- Question de fond : une boucle repart-elle du timecode ou de 0 (V-6) ?

### 13.5 Fenêtres réduites

- Brique commune (`FloatingPanel`, `useFloatingWindow`, `floatingGeometry.js`) : musique, historique des dés, tableau en profitent tous.
- Défaut : réduite, la barre peut être posée tout en bas (`clampRect` ne garde visible que la barre de titre) ; à l'agrandissement, la fenêtre reprend sa hauteur vers le bas et sort de l'écran.
- **A.** À l'agrandissement, la fenêtre remonte juste assez pour tenir entière ; elle reste là ensuite.
- **B.** Sans place en dessous, le bas de la fenêtre se cale sur le bas de la barre : elle s'agrandit vers le haut ; réduite à nouveau, la barre revient où elle était.
- Fonction pure dans `floatingGeometry.js`, testée.

### 13.6 Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| V-1 | « Lire des vidéos » : le son seul (lecteur caché, comme YouTube aujourd'hui) ou aussi l'image montrée aux joueurs ? | Son seul : montrer l'image est un autre module (affichage synchronisé, plein écran chez les joueurs) | Son seul, depuis d'autres plateformes |
| V-2 | Quelles plateformes ? | Vimeo, SoundCloud et Suno ; Dailymotion seulement si tu en as l'usage ; Spotify, Deezer, Apple Music et Twitch écartés (§13.3) | Vimeo, SoundCloud, Suno, Dailymotion |
| V-3 | Lien direct vers un fichier son hébergé ailleurs, en plus de Suno ? | Oui : même lecteur que Suno, presque sans travail en plus | Hésitation : un lien seulement, sans envoi sur le VPS ? Oui (§13.7) |
| V-4 | Import de playlists : YouTube seulement, les autres plateformes titre par titre ? | Oui ; les playlists SoundCloud pourront suivre si le besoin vient | Playlists Dailymotion et Suno aussi, si possible (§13.7) |
| V-5 | Où se règle le timecode : (a) bouton ciblé, (b) position gardée par une scène, (c) début / fin d'extrait par titre (§13.4) ? | (a) et (b), ce que tu demandes ; (c) en évolution si l'introduction coupée devient un besoin | (a) et (b) |
| V-6 | Un morceau lancé à 1:23 en boucle : repart à 1:23 ou à 0 ? | À 1:23 avec (c) ; à 0 avec (a) / (b), le timecode n'étant que le point d'entrée | Repart du timecode (§13.7) |
| V-7 | Timecode repris d'un lien collé (`?t=`) ? | Oui : avec (c), il devient le début d'extrait du titre ; sans (c), il est ignoré à l'ajout (le timecode se saisit sur le bouton) | Question en retour sur (c) (§13.7) |
| V-8 | Fenêtres réduites : A ou B (§13.5) ? | **B** : la barre reste où tu l'as posée, la fenêtre s'ouvre vers le haut | B (barre de titre toujours en haut de la fenêtre ouverte) |
| V-9 | Pastille de la source (YouTube, Vimeo, SoundCloud, Suno, fichier) sur chaque ligne de la bibliothèque ? | Oui, discrète, pour savoir d'où vient un titre muet | Oui, discrète, à voir à l'usage |

### 13.7 Second tour (2026-11-10)

**Précisions**
- **Lien direct (V-3)** : un lien seulement, collé comme un lien YouTube. Le fichier reste chez son hébergeur et chaque navigateur le lit de là : rien n'est envoyé ni stocké sur le VPS, aucune bande passante du VPS.
- **Playlists (V-4)** :
  - Dailymotion : faisable, l'API publique de Dailymotion liste les vidéos d'une playlist sans clé ;
  - Suno : pas d'API publique ; la liste se lirait dans la page de la playlist, comme le MP3 d'une chanson, donc sans garantie (Suno peut changer sa page) ; à essayer sur un vrai lien ;
  - SoundCloud : faisable aussi (le lecteur officiel donne la liste d'une playlist).
- **Boucle au timecode (V-6)** : le point de départ est retenu avec le morceau lancé sur la piste. La boucle repart du timecode ; en mode playlist ou aléatoire, les morceaux suivants partent de 0 ; ▶ dans la bibliothèque part toujours de 0.
- **(c), rappel (V-7)** : (c) est un début (et une fin) d'extrait **enregistré sur le titre** dans la bibliothèque, valable partout : ▶, enchaînement, boucle et boutons. Avec (a) et (b) seulement, le timecode vit sur le bouton ; le temps d'un lien collé (`?t=`) n'a alors nulle part où aller et est ignoré.
- **Dailymotion** : leur lecteur pilotable demande un « identifiant de lecteur » créé une fois sur un compte Dailymotion (gratuit). À vérifier en phase 2 ; s'il est nécessaire, il se range dans le `.env` (comme la tolérance de recalage).

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| V-10 | Liens directs vers un fichier son : retenus, maintenant qu'il est clair que rien ne passe par le VPS ? | Oui | Oui |
| V-11 | Playlists : Dailymotion et SoundCloud fermes, Suno à l'essai (abandonné si la page ne s'y prête pas) ? | Oui | Playlists Dailymotion seulement, le reste en lien simple ; Dailymotion abandonné ensuite (§13.8) |
| V-12 | (c) en plus de (a) et (b) ? | Non pour l'instant : (a) et (b), avec la boucle au timecode, couvrent les boutons ; (c) reste en évolution (§8) | Oui (pas de (c)) |
| V-13 | Liens pour les essais : une chanson et une playlist Suno, une playlist Dailymotion ; et un compte Dailymotion, si l'identifiant de lecteur est nécessaire ? | Tu me les donnes en phase 2 | Une chanson Suno et une playlist Dailymotion fournies ; s'il faut un compte Dailymotion, on oublie : rester au plus simple |

### 13.8 Décisions et vérifications (2026-11-10)

**Décisions**
- Son seul, depuis d'autres plateformes (V-1).
- Sources : YouTube, Vimeo, SoundCloud, Suno, lien direct vers un fichier son (V-2, V-10). **Dailymotion abandonné** (vérification ci-dessous).
- Playlists : YouTube seulement (la seule déjà en place) ; tout le reste titre par titre (V-4, V-11).
- Timecode : (a) bouton ciblé sur un titre et (b) scène qui garde la position de chaque piste ; la boucle repart du timecode (V-5, V-6). Pas de (c) : pas de début / fin d'extrait sur le titre, le temps d'un lien collé est ignoré (V-7, V-12).

**Vérifications sur les liens fournis**
- **Suno** (`suno.com/s/…`) : le lien court redirige vers `suno.com/song/<identifiant>?sh=…`. La page donne le titre (`og:title`) et l'adresse d'un fichier son lisible sans compte (`…cloudfront.net/1/clip/<identifiant>.m4a`, Opus en MP4, lu par Chrome, Edge et Firefox). La chanson essayée n'est pas publique (partagée par lien) et marche quand même. L'adresse « MP3 » attendue (`cdn1.suno.ai`) est refusée : c'est le `.m4a` qui sert. Adresse non documentée par Suno : si elle change, l'ajout par lien Suno casse, les autres sources non.
- **Dailymotion** : l'API publique liste bien la playlist (42 vidéos, titres et durées, sans clé), mais le lecteur **pilotable** (lecture, pause, position, volume) passe par le script de Dailymotion et un identifiant de lecteur créé sur un compte ; l'ancien lecteur intégré sans compte est retiré depuis septembre 2025. Sans pilotage, pas de synchronisation : abandonné, comme convenu.

## 14. Spécification technique (phase 2, 2026-11-10)

Suite du §13.8. Trois blocs indépendants, livrés dans cet ordre : **A** fenêtres réduites (brique commune, petit), **B** timecode des boutons, **C** nouvelles sources. A et B ne dépendent pas de C.

### 14.1 Bloc A : fenêtre réduite qui s'ouvre vers le haut (V-8, option B)

- `tools/floatingGeometry.js` gagne une fonction pure, testée (`tests/tools/floatingGeometry.test.js`) : `expandRect(rect, barHeight, viewport, min)`. À l'agrandissement, si la fenêtre ne tient pas sous la barre, son bas se cale sur le bas de la barre (elle s'ouvre vers le haut), bornée au haut de l'écran ; sinon rien ne change. Elle renvoie aussi `barTop`, la place de la barre avant l'ouverture.
- À la réduction suivante, la barre reprend `barTop` (borné par `clampRect`).
- `useFloatingWindow` : `toggleMinimized` applique l'un ou l'autre ; `barTop` est gardé dans la géométrie mémorisée (même clé `vtt:<slug>:panel:<id>`) et effacé dès que la fenêtre ouverte est déplacée (la barre suit alors le haut de la fenêtre, comme aujourd'hui).
- `FloatingPanel` mesure la hauteur réelle de sa barre. Aucune prop nouvelle : musique, historique des dés et tableau en profitent sans changement.
- La barre de titre reste toujours en haut de la fenêtre ouverte.

### 14.2 Bloc B : lancer à partir d'un timecode (V-5, V-6)

**État** : chaque piste gagne `start` (secondes, 0 par défaut), le point d'entrée du morceau en cours.
- `playTrack(ctx, slot, trackId, position)` fixe `start` à `position`.
- Fin de morceau en mode `loop` : repart de `start` (au lieu de 0). En `playlist` et `shuffle`, le morceau suivant part de 0 (`start` remis à 0). ▶ dans la bibliothèque : 0.

**Boutons** (`audio_buttons.actions`, JSON, aucune migration ; une entrée sans `start` part de 0, les boutons existants ne changent donc pas) :
- ciblé sur un **titre** : `{ slot, trackId, start? }` ; un bouton ciblé sur une playlist n'a pas de timecode ;
- **scène** : chaque piste `{ trackId, playlistId, mode, start? }`. « Enregistrer ce qui joue » et « Remplacer par ce qui joue » ne prennent **aucune position** (W-3 bis) : la scène part de 0 ; un timecode se règle à la main dans « Modifier les scènes… ». Une piste en mode `shuffle` relance au hasard : pas de timecode possible.
- `runEntry` passe `start` à `playTrack` quand l'entrée vise un titre.

**Routes** (`routes/audio.js`) :
- `POST /buttons { mode: 'target', slot, trackId, start? }` ;
- `PUT /buttons/:id { start }` (ciblé) ou `{ starts: { music: 83, ambience1: null } }` (scène ; `null` = depuis le début) ;
- `start` : nombre fini positif ou nul, sinon 400 ; au-delà de la durée connue du titre, ramené à 0.

**Client** :
- `tools/timecode.js` (nouveau, testé) : `parseTimecode` lit « 1:23 », « 1:02:03 » ou « 83 » en secondes, `null` si illisible ; l'affichage reprend `formatTime` de `audioLibrary.js`.
- `ScenesDialog` : à la création d'un bouton ciblé sur un titre, un champ facultatif « À partir de » ; dans « Modifier les scènes… », chaque bouton montre ses titres avec leur départ, modifiable sur place (vide = depuis le début).
- `hooks/useAudioButtons.js` : `createTarget` accepte `start` ; nouvelle action `setStart`.

### 14.3 Bloc C : nouvelles sources (V-1 à V-4, V-9, V-10)

**Sources** : `youtube`, `vimeo`, `soundcloud`, `suno`, `file`. Son seul, lecteur caché comme pour YouTube.

| Source | Lien reconnu | `media_id` enregistré | Titre et durée à l'ajout (serveur) | Lecteur (client) |
|---|---|---|---|---|
| `youtube` | Inchangé (`parseYouTubeLink`) | Identifiant à 11 caractères (inchangé) | oEmbed YouTube ; durée à la lecture et par `DurationProbe` (inchangé) | IFrame API (inchangé) |
| `vimeo` | `vimeo.com/<id>`, `vimeo.com/<id>/<hash>`, `player.vimeo.com/video/<id>` | Adresse de la vidéo (garde le `hash` d'une vidéo non répertoriée) | oEmbed Vimeo : titre et durée | Player SDK (`player.vimeo.com/api/player.js`, chargé à la demande comme l'API YouTube) |
| `soundcloud` | `soundcloud.com/<artiste>/<titre>` (lien privé avec jeton accepté) | Adresse `api.soundcloud.com/tracks/<id>` tirée de l'oEmbed | oEmbed SoundCloud : titre ; durée à la lecture | Widget API (`w.soundcloud.com/player/api.js`, à la demande) |
| `suno` | `suno.com/s/<code>`, `suno.com/song/<uuid>` | Adresse du fichier `.m4a` | Page de la chanson (redirection suivie) : `og:title` et adresse dans `media_urls` ; durée à la lecture | Lecteur audio du navigateur (élément `audio`) |
| `file` | Adresse **https** finissant par `.mp3`, `.ogg`, `.oga`, `.m4a`, `.wav`, `.opus` (paramètres permis, ex. Dropbox `?dl=1`) | L'adresse | Nom du fichier sans extension, décodé ; **le serveur ne télécharge rien** ; durée à la lecture | Élément `audio` |

- Liens refusés : autres domaines, `http` (bloqué par le navigateur sous HTTPS en prod), playlists hors YouTube (« Les playlists ne s'importent que depuis YouTube »).
- Le serveur n'interroge que `vimeo.com`, `soundcloud.com` et `suno.com`, jamais l'adresse d'un fichier.
- Suno : adresse non documentée (§13.8). Si la page ne donne pas d'adresse lisible, l'ajout est refusé (« Chanson Suno illisible ») ; un titre dont le fichier disparaît plus tard passe « indisponible », comme une vidéo YouTube supprimée (Q-23).

**Base** (`audio.db`) : migration `10112026_audio_track_source.sql` (`-- systems: audio`) et `audio-schema.sql` :

```sql
ALTER TABLE audio_tracks RENAME COLUMN youtube_id TO media_id;
ALTER TABLE audio_tracks ADD COLUMN source TEXT not null default 'youtube';
```

Les titres existants deviennent `source = 'youtube'` sans autre reprise. `copyTracks` et la copie d'un titre recopient `source` et `media_id`.

**Serveur** :
- `POST /playlists/:id/tracks` et `POST /playlists` acceptent, à côté de `videoIds` (YouTube, inchangé), `links` (liste d'adresses) : chaque lien est résolu (tableau ci-dessus) puis inséré ; 400 avec un message en français si un lien est refusé, et rien n'est inséré.
- Résolution dans un module à part, `src/server/utils/audioSources.js` (lecture des liens en fonctions pures, plus les appels oEmbed et la page Suno) : `routes/audio.js` fait déjà près de 1 000 lignes (C-SIZE).
- État d'une piste : `youtubeId` remplacé par `source` et `mediaId` ; dans la bibliothèque, chaque titre porte `source` et `mediaId`.

**Client** :
- `tools/mediaLinks.js` (nouveau, testé) : `parseMediaLink` renvoie `{ source: 'youtube', videoId, listId }` (par `parseYouTubeLink`), `{ source, url }` pour les autres, ou `null`. Utilisé par « Ajouter un lien » et Ctrl+V ; YouTube passe par `videoIds` comme aujourd'hui, le reste par `links`.
- **Lecteurs** : un hook par source, tous avec la même interface : celle du lecteur YouTube dont `SlotPlayer` se sert déjà (`getPlayerState` avec les codes de l'IFrame API, `getCurrentTime`, `getDuration`, `loadVideoById` / `cueVideoById` avec `{ videoId, startSeconds }`, `seekTo`, `playVideo`, `pauseVideo`, `stopVideo`, `setVolume` de 0 à 100), `videoId` étant l'identifiant de la source (une adresse hors YouTube).
  - `hooks/useYouTubePlayer.js` : inchangé, il est l'interface ;
  - `hooks/useVimeoPlayer.js`, `hooks/useSoundCloudPlayer.js` (nouveaux) : leurs API répondent par promesses ou rappels ; la position est tenue à jour par leurs événements de progression, pour être lue tout de suite par la synchronisation ;
  - `hooks/useAudioElementPlayer.js` (nouveau) : élément `audio`, pour `suno` et `file` ;
  - scripts Vimeo et SoundCloud chargés à la demande par `tools/mediaApis.js` ; un volume réglé avant la création du lecteur est appliqué à sa création.
- `SlotPlayer` choisit le hook selon la source de la piste ; `AudioLayer` donne à chaque `SlotPlayer` une clé faite de la piste et de la source (changer de source remonte le lecteur). `audioSync.js` : `youtubeId` devient `mediaId`, logique inchangée.
- Autres usages de `youtubeId` (`AudioGMPanel`, `AudioLayer`, `NowPlaying`, `LibraryRows`) : `mediaId`.
- `DurationProbe` reste YouTube seulement (les autres sources ont leur durée à l'ajout ou à la première lecture).
- **Pastille de source** (V-9) : court libellé discret sur la ligne du titre (`Vimeo`, `SoundCloud`, `Suno`, `Fichier`), classe `vtt-audio-source`, style par défaut dans `index.css` (texte atténué), aucun habillage de slug requis.

**Risque à lever en premier** : le déblocage du son. La modale « Activer le son » (`AudioUnlockModal`) débloque le lecteur YouTube ; il faut vérifier que ce même clic suffit au SDK Vimeo, au widget SoundCloud et à l'élément `audio`, la lecture étant lancée ensuite par la synchronisation, sans nouveau clic. Essai en dev des trois avant le reste du bloc C ; si l'un ne suit pas, le clic de la modale l'amorcera aussi.

### 14.3 bis Suno : essai en dev (2026-11-11)

- Retour du MJ : les liens Suno sont acceptés, mais rien ne joue. SoundCloud fonctionne ; Vimeo pas encore essayé (pas de lien sous la main).
- Diagnostic : le fichier `.m4a` donné par la page n'est **pas un fichier son lisible**. Ses premiers octets ne sont pas ceux d'un MP4 (pas de boîte `ftyp`), et la page le déclare avec un `"encoding": "1.0.0"` propre à Suno : le flux est encodé, et seul le lecteur de Suno sait le décoder. L'adresse « MP3 » (`cdn1.suno.ai`) répond par un refus, que la chanson soit privée ou publique. Le lecteur intégré de Suno (`suno.com/embed/<id>`) existe, mais n'expose aucune commande (lecture, position, volume) : pas de synchronisation possible.
- Lecteur intégré, vérifié sur retour du MJ (« il existe un partage en embed ») : la page `suno.com/embed/<id>` se charge, mais aucun de ses scripts n'écoute les messages de la page qui l'intègre (pas d'écouteur `message` sur la fenêtre) ni ne lui en envoie (`parent.postMessage` absent). Il se joue d'un clic **dans** le lecteur, mais ne se pilote pas de l'extérieur : ni lancement au même moment chez tous, ni position, ni volume, ni fin de morceau signalée. C'est ce que demandent YouTube, Vimeo et SoundCloud et que leurs lecteurs offrent (IFrame API, Player SDK, Widget API).
- Seconde chanson essayée (lien d'intégration fourni par le MJ, `suno.com/embed/e4e0eba3-…`) : même constat. Le lecteur intégré ne donne que le même `.m4a` encodé ; l'adresse MP3 est refusée.
- Décoder le flux nous-mêmes reviendrait à contourner la protection de Suno : écarté.
- Voie qui marche déjà : **télécharger le MP3 depuis Suno** (bouton de téléchargement de la chanson, selon l'abonnement), le déposer chez un hébergeur (Dropbox, Google Drive avec lien direct, archive.org…) et coller ce lien : c'est la source « fichier son », lue par le navigateur.

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| X-1 | Que faire de la source Suno ? (1) la retirer : un lien Suno est refusé avec un message qui explique la voie du MP3 téléchargé ; (2) la garder telle quelle, en espérant que Suno change | **(1)** : un lien accepté qui ne joue jamais est pire qu'un refus expliqué | (1), avec Google Drive et Dropbox en plus |
| X-2 | Les titres Suno déjà ajoutés en dev : les supprimer à la main, ou une migration qui les retire ? | À la main : ils n'existent qu'en dev, la prod n'a jamais eu la source | |

**Décisions (2026-11-11)**
- **Source Suno retirée.** Le téléchargement du MP3 est payant chez Suno (et limité à 27 par mois avec l'abonnement) ; automatiser téléchargement et dépôt serait une usine à gaz. Un lien Suno collé est refusé : « Suno ne permet pas la lecture hors de son site : télécharge le MP3 depuis Suno, puis ajoute-le par un lien Google Drive ou Dropbox ».
- **Google Drive** : le lien de partage (`drive.google.com/file/d/<id>/view`, `open?id=`, `uc?id=`) devient un fichier son, lu par l'adresse de téléchargement direct `drive.google.com/uc?export=download&id=<id>`. Titre : nom du fichier, lu sur la page de partage, ce qui vérifie aussi le partage (fichier en accès restreint : refusé, « partage-le avec "Tous les utilisateurs disposant du lien" »). Vérifié sur un MP3 du MJ : servi en `audio/mpeg`, sauts acceptés (requêtes partielles). Limites Google : avertissement au-delà d'environ 100 Mo, limitation possible d'un fichier très demandé.
- **Dropbox** : un lien de partage en `dl=0` (page d'aperçu) passe en `dl=1` (fichier).
- Le serveur ne lit que la page de partage Drive, jamais le fichier son.

**Essai en dev (2026-11-11) : Drive ne se lit pas dans le navigateur.** Retour du MJ, puis vérification dans Edge sans interface, depuis une page servie en `http://localhost` :
- témoin `archive.org` : chargé et lu (le lecteur du navigateur et le banc d'essai fonctionnent) ;
- Drive, par `drive.google.com/uc` comme par `drive.usercontent.google.com/download`, avec et sans mode CORS : refusé (« Format error »), et un `fetch` en CORS échoue aussi.
- Cause : Google répond avec `cross-origin-resource-policy: same-site` (et `cross-origin-embedder-policy: require-corp`). Le navigateur refuse donc que le fichier soit lu par une page d'un autre site. curl, qui ignore ces en-têtes, recevait bien le MP3 : d'où le faux positif de la première vérification.
- Vimeo : se lit (vidéo d'exemple sans son, essai du son à refaire avec une vraie vidéo).

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| X-3 | Que faire de Drive ? | Le refuser à son tour, avec un message qui oriente vers Dropbox ou archive.org, plutôt que d'accepter des liens qui ne joueront jamais | Voir X-4 |
| X-4 | Hébergeur de remplacement pour les MP3 (Suno compris) : Dropbox (lien de partage, passé en `dl=1`) ou archive.org (vérifié dans le navigateur) ? | Dropbox, à vérifier sur un vrai lien avant de l'annoncer ; archive.org en secours, mais tout y est public | **Les MP3 hébergés sont laissés de côté pour l'instant** |

**Décision (2026-11-11) : sources retenues YouTube, Vimeo et SoundCloud.** La source « fichier son » (lien direct, Drive, Dropbox) est retirée du code, lecteur audio du navigateur compris : elle pourra revenir plus tard (un lien direct `archive.org` s'est lu dans le navigateur, Dropbox reste à vérifier, Drive est exclu). Un lien Suno est refusé : « Suno ne permet pas la lecture de ses morceaux hors de son site ». Tous les liens d'un ajout sont lus avant le premier appel réseau : un lien refusé ne fait rien résoudre. Les mentions de Suno, Drive, Dropbox et du lien direct dans les §14.3 et §14.3 bis plus haut sont l'historique de l'essai.

### 14.4 Tests et documentation

- Front (Vitest) : `floatingGeometry` (ouverture vers le haut, retour de la barre), `timecode`, `mediaLinks`, `audioSync` (renommage).
- Serveur : `tests/server/routes/audio.test.js` (nouveau, base audio temporaire comme `board.test.js`) : ajout par `links` (résolution simulée, sans réseau), refus d'un lien non reconnu, `start` d'un bouton ciblé et d'une scène, boucle qui repart de `start`.
- Doc : ce §14, `spec_ui_panneaux.md` (ouverture vers le haut), `spec_browser_storage.md` (`barTop` dans la géométrie), `src/client/CLAUDE.md` si les hooks de lecteurs y sont listés.

### 14.5 Fichiers touchés

| Bloc | Fichiers |
|---|---|
| A | `src/client/src/tools/floatingGeometry.js`, `hooks/useFloatingWindow.js`, `components/ui/FloatingPanel.jsx`, test |
| B | `src/server/routes/audio.js`, `src/client/src/tools/timecode.js` (nouveau), `hooks/useAudioButtons.js`, `components/audio/panel/ScenesDialog.jsx`, tests |
| C | `database-template/audio-schema.sql`, migration `10112026_audio_track_source.sql`, `src/server/routes/audio.js`, `src/server/utils/audioSources.js` (nouveau), `src/client/src/tools/mediaLinks.js` (nouveau), `tools/audioSync.js`, `hooks/useYouTubePlayer.js`, `hooks/useVimeoPlayer.js`, `hooks/useSoundCloudPlayer.js`, `hooks/useAudioElementPlayer.js` (nouveaux), `components/audio/SlotPlayer.jsx`, `AudioLayer.jsx`, `AudioGMPanel.jsx`, `panel/AddLinkFoot.jsx`, `panel/NowPlaying.jsx`, `panel/LibraryRows.jsx`, `src/client/src/index.css`, tests |

Rien dans les slugs.

### 14.6 Points à valider

| # | Point | Proposition | Réponse MJ |
|---|---|---|---|
| W-1 | Ordre de livraison : A, puis B, puis C (essai du déblocage du son en tête de C), avec un point de contrôle en dev après chaque bloc ? | Oui | Oui |
| W-2 | Une scène enregistrée garde **toujours** la position de chaque piste (modifiable ou vidée ensuite dans « Modifier les scènes… »), plutôt qu'une case à cocher à l'enregistrement ? | Oui : pas de case en plus ; vider le champ revient au début | Oui |
| W-3 | Conséquence de V-6 : une ambiance en boucle capturée à 2:47 dans une scène rebouclera à 2:47. D'accord, ou une scène ne garde la position que pour la musique ? | D'accord tel quel : c'est la règle de V-6, et le départ se vide d'un clic | Question en retour : réexpliqué ci-dessous |
| W-4 | Liens de fichier son : extensions `.mp3`, `.ogg`, `.oga`, `.m4a`, `.wav`, `.opus`, en https seulement ? | Oui | Oui |
| W-5 | Pastille de source aussi sur les titres YouTube, ou seulement sur les autres (encore plus discret) ? | Seulement les autres : YouTube reste la source par défaut, la pastille signale l'exception | Oui |

**W-3 réexpliqué** : la boucle ne dure pas une seconde. Un morceau de 5:00 lancé à 2:47 en boucle joue de 2:47 à 5:00, puis reprend à 2:47, et ainsi de suite : le passage de 0:00 à 2:47 n'est plus jamais entendu. Le piège vient de « Enregistrer ce qui joue » : la scène retient la position du moment, souvent prise au hasard (l'ambiance tournait depuis 2:47 quand le MJ a cliqué), et la boucle s'en trouverait raccourcie sans que ce soit voulu.

| # | Point | Proposition | Réponse MJ |
|---|---|---|---|
| W-3 bis | Que garde « Enregistrer ce qui joue » ? (1) la position de chaque piste, boucles comprises (règle V-6 telle quelle) ; (2) la position de la **musique** seulement, les ambiances et l'effet repartant de 0 ; (3) aucune position : la scène part de 0, le timecode se saisit à la main dans « Modifier les scènes… » quand il est voulu | **(3)** : un timecode n'est jamais pris par hasard, il est choisi ; la règle V-6 (boucle au timecode) s'applique alors à un départ voulu | **(3)**, remplace W-2 |

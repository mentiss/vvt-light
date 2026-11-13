# Spec — Tableau partagé (visuels, croquis, jetons)

> Version 0.3 — Phase 2 : spécification technique  
> Statut : **v1 en prod (v5.15.0, v5.15.1), spec §7, §9, §10. Évolutions v2 : brainstorming §11 (Q-45 à Q-62 répondues, relances Q-51, Q-53, Q-56 au §11.4) ; lots A et B implémentés et essayés (§12, §13, non commités) ; lot C implémenté (§14, non commité, à essayer)**  
> Dernière mise à jour : octobre 2026

---

## 1. Besoin exprimé

Une zone partagée en temps réel entre le MJ et les joueurs d'une même session, pour **montrer et esquisser** plus que pour faire du combat tactique :

- partager des visuels (une image avant tout : portrait de PNJ, lieu, document trouvé) ;
- dessiner un plan rapide ;
- poser quelques jetons et les déplacer ;
- **garder en mémoire** l'état, et passer d'une « diapositive » à l'autre ;
- glisser-déposer des images (et d'autres médias, mais l'image d'abord).

Fonctions de base attendues côté carte, sans en faire le cœur du module : jetons, ping, mesure de distance (à confirmer), brouillard de guerre.

Contraintes du MJ :

- **Pas de sur-ingénierie** : peu de fonctions, toutes utiles à la table.
- **Module générique de la plateforme**, qu'un slug intègre ou non : une sorte de greffon.
- On doit **toujours** pouvoir revenir à la fiche de personnage, lancer des dés, etc. Le tableau ne remplace pas l'interface du slug, il s'y ajoute.

Dans le backlog : « Battlemap simple avec interaction joueurs / MJ » (briques plateforme, 2026-10-18).

Nom de travail proposé : **tableau** (classes `vtt-board*`, code `features/board/`). Voir Q-1.

---

## 2. Ce qui existe déjà et sur quoi s'appuyer

| Brique | Ce qu'on en reprend |
|---|---|
| **Audio** (`spec_audio.md`) | Le même modèle d'intégration : brique commune, **activée par le MJ session par session** via un élément prêt à l'emploi posé dans `TabSession`, montée par `GMPage` / `PlayerPage`, habillage `vtt-*` surchargé par le `theme.css` du slug, pilote sur un slug. Ressemble exactement à « un greffon qu'un slug intègre ou non ». |
| **Images du journal** (`RichTextEditor.jsx`) | Préparation côté client déjà écrite : redimensionnement par `canvas` (côté maximal limité), recompression JPEG / WebP 0,85, GIF gardé tel quel jusqu'à 5 Mo. Les images y sont stockées **en base64 dans la base du slug**. |
| **Générateur de plans** (`spec_genmap.md`) | Rendu en SVG construit en JavaScript pur, sans bibliothèque. Plus tard, un plan généré pourrait être envoyé sur le tableau comme une image (hors chantier). |
| **Rooms socket** | `${slug}_session_${sessionId}` : la portée naturelle du tableau (deux tables en parallèle ne se voient pas). |
| **Combat générique** (`spec_combat.md`) | Aucun lien aujourd'hui : il gère l'initiative et la santé, sans positions. Le tableau ne doit pas en dépendre ; un lien jeton ↔ combattant peut venir plus tard. |

---

## 3. Points techniques à connaître dès maintenant

### 3.1 Rendu : fait maison ou bibliothèque ?

| | A. SVG fait maison | B. Bibliothèque de tableau blanc (Excalidraw, tldraw) | C. Bibliothèque de canevas (Konva, Fabric) |
|---|---|---|---|
| Principe | Un `<svg>` React : images, traits, jetons sont des éléments ; zoom / déplacement par `viewBox` | Un tableau blanc complet, prêt à l'emploi | Un canevas avec des objets manipulables (déplacer, redimensionner, pivoter) |
| Fonctions | Uniquement celles qu'on écrit | Des dizaines (formes, flèches, texte, sélection multiple, alignement…), la plupart inutiles ici | Socle de manipulation, le reste à écrire |
| Poids | Nul | Lourd (plusieurs centaines de Ko) | Moyen |
| Habillage par slug | Total (classes `vtt-board*`) | Difficile : interface et style imposés | Moyen (rendu canevas, pas de CSS) |
| Temps réel | À écrire, mais simple (peu d'objets) | Excalidraw : à brancher soi-même ; tldraw : licence propre (filigrane ou clé de licence selon l'usage) | À écrire |
| Risque | Écrire le redimensionnement / la sélection soi-même | Dépendance lourde, à rebours de « pas de sur-ingénierie » | Dépendance moyenne |

**Recommandation : A.** Le besoin est étroit (images, traits à main levée, jetons, ping, brouillard simple), le projet évite les bibliothèques superflues, et le générateur de plans prouve déjà que le SVG fait maison suffit. Une bibliothèque de tableau blanc apporterait surtout ce que le MJ ne veut pas : 200 fonctions.

### 3.2 Stockage des images

Une image de plan ou de lieu pèse vite 300 Ko à 1 Mo, même recompressée.

- **En base64 dans la base du slug** (comme le journal) : rien de nouveau à écrire côté serveur, mais la base gonfle, chaque chargement de diapositive transporte tout, et le navigateur ne peut rien mettre en cache.
- **En fichiers sur le disque du VPS**, servis par une route authentifiée ou statique : léger à charger et mis en cache, mais c'est une infrastructure de téléversement à créer (il n'y en a aucune aujourd'hui). Le disque du VPS fait 12 Go : quelques centaines d'images recompressées tiennent sans difficulté, contrairement à l'audio.
- **Par lien externe** (coller l'adresse d'une image) : gratuit, mais l'image disparaît si le site la retire.

~~Proposition : fichiers sur le disque~~ — **écarté par le MJ (2026-10-28)** : pas d'images sur le VPS, l'espace de stockage gonflerait. Le module reste basique : quelques visuels, pas 50 à la fois.

Point à trancher : **toute image gardée en mémoire est stockée quelque part sur le VPS**, base du slug comprise (la base SQLite est un fichier du VPS). Il reste donc trois voies :

| | 1. Liens externes seuls | 2. Images éphémères | 3. Base64 dans la base, sous plafond strict |
|---|---|---|---|
| Principe | Le MJ colle l'adresse d'une image (Discord, Imgur, site du jeu…) ; seul le lien est enregistré | L'image déposée passe par le serveur et vit en mémoire le temps de la session ; la base ne garde que traits, jetons, brouillard | L'image recompressée est enregistrée avec la diapositive, comme dans le journal, avec une taille et un nombre maximaux |
| Glisser-déposer d'un fichier | Non (sauf glisser une image depuis une page web, qui fournit son adresse) | Oui | Oui |
| Survit au redémarrage du serveur | Oui | Non : le MJ redépose l'image | Oui |
| Place sur le VPS | Nulle | Nulle sur le disque | Bornée (ex. 500 Ko × 5 images par diapositive), libérée à la suppression de la diapositive |
| Fragilité | Le site d'origine peut retirer l'image ; certains sites interdisent l'affichage ailleurs | Perte au redémarrage | Aucune |

~~Proposition : **1 + 2**~~ — révisée après la décision d'une base propre au tableau (§3.3) : **3, dans `board.db`**, plus les liens externes. Les images restent sur le VPS, mais dans un seul fichier, avec un plafond par image, un plafond global et la purge automatique des vieux tableaux. Les bases des slugs ne bougent pas. Voir Q-12, Q-13.

### 3.3 Où vivent les données

**Décision du MJ (2026-10-28) : le tableau a sa propre base**, `database/board.db`, et non des tables dans les bases des slugs. But premier : ne pas alourdir les bases des slugs.

- Ce n'est **pas une base centrale** de jeu (le MJ doute d'en adopter une un jour : la base par slug apporte une souplesse qu'elle n'aurait pas). C'est le magasin d'un seul module, qui ne connaît que lui.
- Lien avec les slugs : chaque donnée porte le **slug** (et l'identifiant de session quand il le faut), sans clé étrangère vers la base du slug.
- Routes montées sous `/api/:slug/board` : réutilisent le JWT du slug et `requireGM`, aucun nouveau système de connexion.
- Temps réel dans la room `${slug}_session_${sessionId}`, comme le reste.
- Ouverture par le gestionnaire existant (`db/index.js`, connexion paresseuse fermée après 5 min) : il accepte déjà une config `{ slug, dbPath, schemaPath }`.
- À prévoir : le script de migration et la release savent aujourd'hui gérer des slugs seulement ; il leur faut une base hors slug (ex. en-tête `-- systems: board`).
- Le stockage pèse quand même sur le VPS, mais **regroupé en un seul fichier** : visible, sauvegardable, purgeable, plafonnable globalement.

**Purge automatique (idée du MJ)** : un tableau (ou une diapositive, Q-25) inutilisé depuis plus de 2 à 3 mois est supprimé automatiquement, sauf s'il est marqué **« à conserver »**. Voir Q-25 à Q-27.

Question ouverte hors de ce chantier : la bibliothèque audio (aujourd'hui par slug, branche `audio`) pourrait suivre ce modèle. Le MJ n'en est pas convaincu (risque de glisser vers une base centrale) : à revoir au moment de fusionner la branche.

### 3.4 Temps réel

- Le serveur fait foi : chaque action (poser, déplacer, effacer) part au serveur, qui l'enregistre et la diffuse à la room.
- Déplacement d'un jeton : diffusé **pendant** le glisser (allégé, quelques envois par seconde) ou **à la fin** seulement. Voir Q-11.
- Peu d'objets par diapositive (une image de fond, quelques dizaines de traits, une poignée de jetons) : pas besoin de mécanique de fusion de modifications concurrentes. Le dernier qui écrit gagne.
- Un joueur qui arrive en cours de route reçoit l'état de la diapositive affichée.

### 3.5 Cohabitation avec la fiche et les dés

Le tableau ne doit jamais masquer durablement la fiche. Trois façons de l'afficher :

| | Panneau flottant | Plein écran basculable | Onglet |
|---|---|---|---|
| Principe | Fenêtre redimensionnable par-dessus la fiche, comme le panneau audio du MJ | Bouton qui bascule entre la fiche et le tableau, plein écran ; la barre de session et le menu restent | Un onglet de plus dans la fiche |
| Fiche visible en même temps | Oui, en partie | Non, mais retour en un clic | Non |
| Intégration au slug | Aucune (monté par la page) | Aucune (monté par la page) | Chaque `Sheet.jsx` à toucher, onglets propres à chaque slug |
| Confort pour un plan | Réduit | Bon | Bon |

**Recommandation : plein écran basculable, plus un mode réduit flottant.** Les dés et l'historique restent accessibles depuis le tableau (menu, barre de session, notifications de jets). Monté par `PlayerPage` / `GMPage`, aucune fiche de slug à modifier. Voir Q-5, Q-6.

---

## 4. Ce que pourrait être la v1 (à discuter)

> Proposition de départ, conservée pour mémoire : les décisions du §7 font foi.

Pour fixer les idées, une v1 volontairement courte :

- **Diapositives** : une liste par slug (ou par session, Q-3), créées, renommées, réordonnées, supprimées par le MJ. Le MJ choisit celle que voient les joueurs ; il peut en préparer une autre sans la montrer.
- **Image de fond** : glisser-déposer ou coller (Ctrl+V) une image, ou un lien d'image.
- **Images posées** : plusieurs images sur une diapositive, déplaçables et redimensionnables.
- **Dessin à main levée** : quelques couleurs, deux épaisseurs, gomme (efface un trait entier), tout effacer.
- **Jetons** : un rond avec l'avatar d'un PJ (pris dans `characters.avatar`), ou une initiale / couleur pour un PNJ ou un objet. Déplaçables.
- **Ping** : un clic long (ou Alt+clic) fait apparaître un cercle animé chez tout le monde, à la couleur de son auteur.
- **Zoom et déplacement** de la vue, propres à chacun.
- **Brouillard de guerre simple** : le MJ recouvre la diapositive et dévoile des zones au rectangle (ou au pinceau). Le MJ voit à travers, en transparence.
- **Mesure de distance** : seulement si la diapositive a une grille / une échelle (Q-20).

Hors v1 proposés : texte libre, formes géométriques, calques, lignes de vue, vidéos et sons sur le tableau, lien avec le combat générique, import depuis le générateur de plans, historique d'annulation partagé.

---

## 5. Implications (à préciser en phase 2)

- **Base** : `database/board.db` avec son propre schéma (diapositives, objets, images, réglages par session dont l'activation et le « à conserver ») ; les bases des slugs ne sont pas touchées. Migration et release à étendre à cette base hors slug (§3.3).
- **Serveur** : une route générique (comme `routes/audio.js` sur la branche `audio`), un handler socket générique. Aucun fichier image sur le disque (§3.2).
- **Sockets** : quelques événements (diapositive affichée, objet ajouté / déplacé / supprimé, ping, brouillard), tous diffusés dans `${slug}_session_${sessionId}`.
- **Client** : `features/board/`, montage dans `PlayerPage` / `GMPage`, élément d'activation pour `TabSession`, classes `vtt-board*` dans `features/board/board.css`.
- **Slug pilote** : à choisir (Q-2).
- **Tests** : fonctions pures seulement (conversion de coordonnées écran ↔ tableau, mesure de distance, simplification des traits).

---

## 6. Questions

Réponds dans la colonne « Réponse MJ » ; je reporterai ensuite les décisions dans une section dédiée.

**Cadre**

| # | Question | Proposition | Réponse MJ                                                         |
|---|---|---|--------------------------------------------------------------------|
| Q-1 | Nom affiché dans l'interface : « Tableau », « Table », « Écran partagé », « Carte »… ? | « Tableau » (et `board` dans le code) : ni trop carte de combat, ni trop technique | oui                                                                |
| Q-2 | Slug pilote ? | Vikings, comme l'audio (même habillage déjà travaillé, refonte en cours) ; ou un slug où tu joues bientôt | oui                                                                |
| Q-3 | Les diapositives appartiennent-elles au **slug** (réutilisables d'une session à l'autre, comme les playlists) ou à la **session** ? | Au slug, rangées éventuellement en dossiers ; la session ne retient que la diapositive affichée | à la session plutôt, il peut y avoir plusieurs MJ sur un même slug |
| Q-4 | Activation par session dans `TabSession` (comme l'audio), ou toujours disponible dès qu'un slug a intégré le module ? | Comme l'audio : le slug pose l'élément d'activation, le MJ active par session, choix mémorisé | oui je pense                                                       |

**Affichage et cohabitation**

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                              |
|---|---|---|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Q-5 | Côté joueur : plein écran basculable, panneau flottant, ou onglet (§3.5) ? | Plein écran basculable + mode réduit flottant ; bouton toujours visible pour revenir à la fiche | Bascule plein écran, mode réduit et onglet possible aussi, c'est libre au slug d'ajouter un onglet pour ça et donc avoir une disposition/affichage propre                                               |
| Q-6 | Quand le MJ affiche une nouvelle diapositive, le tableau s'ouvre-t-il **de force** chez les joueurs, ou une notification les invite-t-elle à l'ouvrir ? | Notification (« Le MJ partage un visuel », bouton Voir) ; ouverture forcée en option pour le MJ | Notification                                                                                                                                                                                            |
| Q-7 | Côté MJ : même affichage, ou panneau à part dans `GMApp` ? Le MJ doit-il voir et préparer une diapositive **pendant** que les joueurs en voient une autre ? | Même composant ; le MJ édite la diapositive de son choix, et un bouton « Montrer aux joueurs » change celle qu'ils voient | Oui, il peut afficher une slide pendant qu'il en prépare une autre, les préaprer à l'avance et affiche celle qu'il veut au moment il veut. Options pour permettre l'interaction joueur et les tokens aussi |
| Q-8 | La vue (zoom, cadrage) est-elle propre à chacun, ou le MJ peut-il **imposer** son cadrage (« regardez ici ») ? | Propre à chacun, avec un bouton MJ « Centrer tout le monde sur ma vue » | propre à chacun ça, pas besoin de bouton MJ pour centrer                                                                                                                                                |

**Droits des joueurs**

| # | Question | Proposition | Réponse MJ                                                                                                              |
|---|---|---|-------------------------------------------------------------------------------------------------------------------------|
| Q-9 | Un joueur peut-il dessiner ? Ajouter des images ? | Dessiner oui (traits à sa couleur, effaçables par lui et par le MJ) ; images réservées au MJ | oui en fonction du règlage de la slide par le GM, c'est effaçable par tout le monde, GM compris, restons simple         |
| Q-10 | Jetons : chaque joueur déplace seulement le sien, tous les jetons, ou aucun ? | Le sien seulement ; le MJ déplace tout | Tout par tout le monde, ça évite de se complefixier le truc à mort, si vraiment on a un besoin de limiter, on limitera. |
| Q-11 | Le déplacement d'un jeton se voit-il **en direct** chez les autres, ou seulement à la fin du glisser ? | En direct (plus vivant, coût réseau négligeable à 15 joueurs) | oui en direct                                                                                                           |

**Médias**

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                                                                                                 |
|---|---|---|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Q-12 | Stockage des images (§3.2) : liens externes seuls, images déposées éphémères, ou images enregistrées dans `board.db` sous plafond ? | Enregistrées dans `board.db` sous plafond, plus les liens externes | oui, j'ajoutes aussi qu'il faudrait prévoir une bilbiotèque minimale ou en tout cas de base, surement stocké sur le VPS cette fois pour mettre des icones ou tout autre élément à la con : genre une grenade, une voiture, un cheval, un feu de camp...etc.                |
| Q-13 | Plafonds : par image, par diapositive, global ? Que se passe-t-il quand le plafond global est atteint ? | 1 920 px de côté et 500 Ko par image, 5 images par diapositive, 300 Mo au total ; plafond atteint : dépôt refusé avec un message au MJ (pas de suppression automatique en plus de la purge) | hummm, je sais pas trop pour cette histoire de plafond, je veux pas qu'on se retrouve dans le cas de "je suis en pleine partie et d'un coup, paf, quota atteint, je peux plsu rien faire sans devoir m'emmerder à chercher ce que je peux supprimé ou pas" donc à discuter |
| Q-14 | ~~Données dans la base du slug, ou attendre la base centralisée ?~~ | | Base propre au tableau, `board.db` (MJ, 2026-10-28, §3.3)                                                                                                                                                                                                                  |
| Q-15 | « Autres médias » : lesquels concrètement ? PDF, vidéo, GIF animé, lien YouTube ? | GIF animé oui (gratuit) ; le reste hors v1 | gif, pas de vidéo, pdf éventuellement mais c'est juste un lien, on va pas refaire ou faire un affichage pour ça.                                                                                                                                                           |
| Q-16 | Une image peut-elle servir sur plusieurs diapositives (bibliothèque d'images du slug), ou chaque dépôt est-il indépendant ? | Chaque dépôt indépendant : pas de bibliothèque d'images, cohérent avec un module basique sans stockage | Normalement c'est lié à la diapo uniquement. On va prévoir une biblio mais c'est autre chose et pas partagé ni possible d'ajouter à la biblio dans mon idée de base                                                                                                        |

**Dessin et carte**

| # | Question | Proposition | Réponse MJ                                                                                                                                      |
|---|---|---|-------------------------------------------------------------------------------------------------------------------------------------------------|
| Q-17 | Outils de dessin : main levée seule, ou aussi traits droits, rectangles, texte ? | Main levée + trait droit (Maj), gomme par trait, tout effacer. Pas de texte ni de formes en v1 | main levé + rectangle, gomme. Pour plus de forme on verra après.  Rectangle doivent pouvoir être avec une couleur au choix                      |
| Q-18 | Jetons PNJ : simple pastille (initiale, couleur), image déposée, ou lien avec les PNJ génériques (npc-sets) ? | Pastille ou image ; lien PNJ hors v1 (le système de PNJ doit être refait) | token joueur = avatar sinon initiale. token pour les pnj, biblio ou image lié à la session ?                                                    |
| Q-19 | Brouillard de guerre : utile en v1 ? Dévoilement au rectangle, au pinceau, les deux ? | Oui, au rectangle seulement (le plus simple et le plus lisible), recouvrable | oui must have mais pas obligatoire sur les diapos, c'est activable/désactivable globalement                                                     |
| Q-20 | Mesure de distance : utile ? Si oui, il faut une grille ou une échelle par diapositive (« 1 case = 1,5 m ») | Grille optionnelle par diapositive (carrée), règle disponible seulement avec une grille | Option de diapo de mettre une grille ou non. Cela active la règle de mesure des distances. Taille d'une case réglable par le GM avec une défaut |
| Q-21 | Grille : affichée et magnétique (les jetons se calent dessus), ou affichée seulement ? | Affichée, jetons magnétiques quand la grille est active | Non pas de magnétisme, affiché selon la règle au dessus                                                                                         |
| Q-22 | Annuler (Ctrl+Z) : nécessaire ? | Pour le MJ seulement, sur ses propres actions, limité à la diapositive courante | Oui pourquoi pas mais pas obligatoire en v1 et surtout limité à ses propres actions                                                             |

**Persistance**

| # | Question | Proposition | Réponse MJ |
|---|---|---|------------|
| Q-23 | Tout est enregistré en base au fil de l'eau (redémarrage du serveur sans perte), ou seulement l'état « publié » ? | Tout, au fil de l'eau ; le ping n'est jamais enregistré | oui        |
| Q-24 | Dupliquer une diapositive (repartir d'un plan pour la scène suivante) ? | Oui, c'est peu coûteux et utile | oui        |

**Purge automatique (§3.3)**

| # | Question | Proposition | Réponse MJ                                                                         |
|---|---|---|------------------------------------------------------------------------------------|
| Q-25 | Ce qui est purgé : une **diapositive** entière, ou un regroupement de diapositives (dossier, Q-3) ? Et « vieux » se mesure à quoi : dernière modification, ou dernier affichage aux joueurs ? | La diapositive, selon sa dernière modification **ou** son dernier affichage, la plus récente des deux (une carte qu'on remontre régulièrement n'est jamais purgée) | j'aurais dit pas à la diapo mais à la session, à la dernière utilisation/affichage |
| Q-26 | Délai : 2 mois, 3 mois, réglable ? | 3 mois, fixe (une constante dans le code), modifiable plus tard si besoin | 3 mois fixe                                                                        |
| Q-27 | Prévenir avant de purger ? (ex. pastille « sera supprimée dans 7 jours » dans la liste du MJ) | Oui, une simple mention dans la liste des diapositives du MJ ; pas de notification | mentions, pas de notif, pas d'autres éléments                                      |

---

## 7. Décisions (2026-10-28)

**Cadre**
- Nom affiché : **« Tableau »** ; `board` dans le code, classes `vtt-board*` (Q-1).
- **Pilote sur Vikings** (Q-2).
- Base propre au module, `database/board.db`, hors des bases des slugs et sans être une base centrale (§3.3).
- Le slug pose l'élément d'activation dans son `TabSession` ; le MJ active le tableau session par session, choix mémorisé (Q-4).

**Diapositives**
- Les diapositives appartiennent à la **session**, pas au slug : plusieurs MJ peuvent mener des tables sur un même slug (Q-3).
- Le MJ prépare autant de diapositives qu'il veut à l'avance, en édite une pendant que les joueurs en voient une autre, et choisit à tout moment celle qu'ils voient (Q-7).
- Réglages par diapositive, choisis par le MJ : **interaction des joueurs** (dessin) et **jetons** déplaçables par les joueurs (Q-7, Q-9).
- Duplication d'une diapositive (Q-24).
- Tout est enregistré au fil de l'eau ; le ping ne l'est jamais (Q-23).

**Affichage**
- Plateforme : bascule plein écran et mode réduit flottant, montés par `PlayerPage` / `GMPage`. Un slug peut **en plus** poser le tableau dans un onglet à lui, avec sa propre disposition (Q-5).
- **Côté MJ aussi** (MJ, 2026-10-28) : le tableau doit pouvoir être posé dans un **onglet de `GMApp`**, probablement l'usage le plus propre pour le MJ (ses interfaces sont déjà organisées en onglets). Le tableau est donc un composant qui se pose aussi bien dans un onglet joueur que dans un onglet MJ.
- **Mode réduit flottant indépendant de l'onglet** (MJ, 2026-11-04) : il coexiste avec l'onglet (voir la diapositive en cours depuis un autre onglet), et chacun, MJ comme joueur, peut le fermer s'il n'en veut pas. Côté MJ, pas de bascule plein écran : l'onglet en tient lieu. Le mode réduit s'appuiera sur la fenêtre flottante générique (`FloatingPanel`, `spec_ui_panneaux.md`).
- Nouvelle diapositive montrée par le MJ : **notification** aux joueurs, pas d'ouverture forcée (Q-6).
- Zoom et cadrage propres à chacun, pas de recentrage imposé par le MJ (Q-8).

**Jetons et interaction**
- Quand la diapositive le permet, **tout le monde déplace tous les jetons**, sans propriété ; on limitera si un besoin réel apparaît (Q-10).
- Déplacements visibles **en direct** (Q-11).
- Dessin des joueurs selon le réglage de la diapositive ; les traits sont **effaçables par tout le monde**, MJ compris (Q-9).
- Jeton de PJ : son avatar, à défaut son initiale (Q-18).

**Outils**
- Main levée, **rectangle** de couleur au choix, gomme. D'autres formes plus tard (Q-17).
- **Brouillard de guerre** : indispensable, mais pas imposé (Q-19, Q-33). Deux niveaux :
  - un **réglage de la diapositive** (avec ou sans brouillard) ;
  - sur une diapositive avec brouillard, un **interrupteur du MJ**, utilisable à tout moment, qui l'affiche ou le masque chez les joueurs **sans toucher à son état** : les zones dévoilées ou recouvertes sont conservées.
- **Jetons des PJ** posés par le MJ, grâce à une option prévue pour ça (Q-36).
- **Images** : par défaut, les joueurs n'en déposent pas (Q-37).
- **Grille** en option de diapositive, sans magnétisme ; elle active la **règle de mesure**. Taille de case réglable par le MJ, avec une valeur par défaut (Q-20, Q-21).
- Annuler (Ctrl+Z) : bienvenu mais pas obligatoire en v1, limité à ses propres actions (Q-22).

**Médias**
- Images enregistrées dans `board.db`, plus les liens externes (Q-12). Plafonds en discussion (Q-13 → Q-28).
- Une image appartient **à sa diapositive** seulement (Q-16).
- GIF animé oui ; pas de vidéo ; un PDF n'est au mieux qu'un lien, aucun affichage dédié (Q-15).
- **Bibliothèque de base** à prévoir (Q-12, Q-16) : icônes et petits éléments (grenade, voiture, cheval, feu de camp…), stockés sur le VPS, **non partagée** avec les images des diapositives et **sans ajout** par le MJ depuis l'interface.

**Purge**
- À l'échelle de la **session** : une session dont le tableau n'a été ni utilisé ni affiché depuis **3 mois** (délai fixe) voit son tableau supprimé, sauf s'il est marqué « à conserver » (Q-25, Q-26).
- Seul avertissement : une mention dans la liste du MJ, ni notification ni autre élément (Q-27).

---

## 8. Questions, second tour

### 8.1 Plafond de stockage (Q-13)

Le risque soulevé par le MJ est réel : un quota global qui bloque en pleine partie est pire que pas de quota. Ordre de grandeur pour fixer les idées : 10 sessions actives × 20 diapositives × 3 images × 400 Ko ≈ **240 Mo**, et la purge à 3 mois empêche ce volume de grossir indéfiniment. Le disque du VPS fait 12 Go.

Proposition : **aucun plafond qui bloque**.
- Seule limite dure : la **taille d'une image**, appliquée silencieusement à l'envoi (redimensionnement et recompression côté navigateur, comme le journal). Le MJ ne la voit jamais comme une erreur, sauf pour un GIF trop gros.
- Pas de nombre maximal d'images par diapositive, pas de quota global.
- La **taille du tableau** de la session s'affiche dans la liste du MJ (« 34 Mo »), pour information.
- Côté serveur, un simple **seuil d'alerte** dans les journaux (ex. `board.db` au-delà de 1 Go) pour que l'administrateur le voie, sans effet sur les parties.

### 8.2 Autres points

| # | Question | Proposition | Réponse MJ                                                                                                                                                                                                                                          |
|---|---|---|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Q-28 | Plafond (§8.1) : d'accord pour aucun blocage, une limite par image appliquée silencieusement (1 920 px de côté, ~500 Ko), la taille affichée au MJ et une alerte dans les journaux du serveur ? | Oui | oui                                                                                                                                                                                                                                                 |
| Q-29 | Bibliothèque de base : d'où viennent les icônes ? Le site **game-icons.net** propose plus de 4 000 icônes de jeu de rôle en SVG (grenade, cheval, feu de camp, voiture…), sous licence CC BY 3.0 (citer les auteurs, par exemple dans une ligne de crédits) | game-icons.net, une sélection de quelques dizaines à une centaine d'icônes, livrée avec l'application (donc déployée par la release, rien à téléverser) | à voir si cela répond au besoin                                                                                                                                                                                                                     |
| Q-30 | Bibliothèque commune à tous les slugs, ou une base commune plus un complément par slug (le cheval sert à Vikings, la voiture à Delta Green) ? | Une base commune, plus un dossier facultatif par slug | Commun                                                                                                                                                                                                                                              |
| Q-31 | Usage d'une icône de la bibliothèque : comme **jeton** (déplaçable, comme un PNJ) ou comme **élément décoratif** posé sur la diapositive ? Les icônes étant monochromes, elles prennent la couleur choisie | Les deux : elle devient un jeton, déplaçable, et sa couleur se choisit | Hmm, en fait il faudrait que ça soit déplçable mais peut-être qu'avoir une option "verrouiller" ça serait pas mal, idem sur les images glisser/déposer non ?                                                                                        |
| Q-32 | Jeton de PNJ (Q-18, « biblio ou image liée à la session ? ») : icône de la bibliothèque, image déposée **sur la diapositive** (même règle que les autres images, Q-16), ou initiale et couleur ? | Les trois ; pas d'images rattachées à la session (cohérent avec Q-16) : une diapositive dupliquée emporte ses images | oui                                                                                                                                                                                                                                                 |
| Q-33 | Brouillard « activable / désactivable globalement » : (a) une option **par diapositive** (on l'active sur un plan, pas sur un portrait) ; (b) un interrupteur **pour toute la session** | (a) : désactivé par défaut, activable par diapositive ; dévoilement au rectangle, le MJ voit à travers en transparence | Option côté MJ : sur une diapositive réglée avec brouillard, il peut à tout moment l'activer ou le désactiver sans toucher à son état (zones dévoilées conservées)                                                                                  |
| Q-34 | Rectangle : plein, contour seul, ou au choix ? Quelle palette de couleurs (pour le dessin, le rectangle et les icônes) ? | Plein, légèrement transparent, avec une option contour ; une palette fixe de 8 couleurs, sans sélecteur libre | palette fixe pour le début, à voir si on mets pas aussi les lignes mais bon, rectangle ça couvre un peu tous les besoins de base, excapté les arrondies mais on garde ça pour plus tard                                                             |
| Q-35 | Grille : quelle valeur et quelle unité par case pour la règle ? | Un libellé « 1 case = 1,5 m » modifiable par diapositive ; valeur par défaut de la plateforme, qu'un slug peut changer dans son `config.jsx` | Oui et modifiable par le GM sur la session directement aussi. Les valeurs peuvent être en mètres ou en feet, important pour certains jeu dont les valeurs de distance sont  dans une convention de merde, c'est à dire pas dans le système métrique |
| Q-36 | Qui pose les jetons ? Les jetons des PJ de la session sont-ils proposés d'office ? | Le MJ pose les jetons ; une liste des PJ de la session lui permet de poser leur jeton en un clic | Les jetons des PJ sont posés par le MJ, grâce à une option / un réglage prévu pour ça                                                                                                                                                               |
| Q-37 | Un joueur peut-il ajouter une image (glisser-déposer) quand l'interaction est ouverte, ou les images restent-elles réservées au MJ ? | Réservées au MJ : les joueurs dessinent, déplacent les jetons et pingent | Par défaut, les joueurs ne déposent pas d'images                                                                                                                                                                                                    |
| Q-38 | Les diapositives étant liées à la session : copier une diapositive **vers une autre session** du même slug (reprendre la carte d'une campagne pour une autre) ? | Hors v1 ; la duplication reste interne à la session | hors v1 voir impossible                                                                                                                                                                                                                             |
| Q-39 | PDF « juste un lien » : un élément **lien** sur la diapositive (petite étiquette cliquable qui ouvre le document dans un nouvel onglet), ou rien du tout en v1 ? | Rien en v1 : le MJ partage le lien par le journal ou la note, qui existent déjà | rien en v1                                                                                                                                                                                                                                          |
| Q-40 | Ping : clic long sur tactile, Alt+clic à la souris, un cercle animé à la couleur de son auteur pendant 2 s, disponible pour tout le monde même quand l'interaction est fermée ? | Oui | oui                                                                                                                                                                                                                                                 |

---

## 9. Décisions du second tour (2026-10-28)

### 9.1 Décidé

**Stockage**
- **Aucun plafond qui bloque** : limite par image appliquée silencieusement à l'envoi (1 920 px de côté, ~500 Ko), taille du tableau affichée au MJ, alerte dans les journaux du serveur au-delà d'un seuil (Q-28).

**Bibliothèque de base**
- **Commune** à tous les slugs, sans complément par slug (Q-30).
- Source : game-icons.net envisagé, **à vérifier sur pièce** (Q-29, Q-44).

**Images et jetons**
- Jeton de PNJ : icône de la bibliothèque, image déposée sur la diapositive, ou initiale et couleur. Pas d'images rattachées à la session : une diapositive dupliquée emporte ses images (Q-32).
- Images **réservées au MJ en v1**. Une option pour laisser les joueurs en déposer pourra venir dans une version future (Q-37).
- Jetons des PJ : un bouton « Poser les jetons des PJ » pose d'un coup ceux de la session qui manquent sur la diapositive ; le MJ peut ensuite en retirer ou en remettre un à la main, pour ne pas les avoir tous (Q-36).

**Outils**
- **Palette fixe** au départ, sans sélecteur libre (Q-34).
- Le rectangle couvre les besoins de base. Lignes droites et rectangles arrondis : plus tard (Q-34).
- Grille : unité au choix, **mètres ou pieds** (certains jeux comptent en pieds) ; valeur par case modifiable par le MJ sur la session directement, en plus du défaut de la plateforme et du slug (Q-35, articulation Q-43).
- Ping : clic long sur tactile, Alt+clic à la souris, cercle animé à la couleur de son auteur pendant 2 s, ouvert à tous même quand l'interaction est fermée (Q-40).

**Hors v1**
- Copier une diapositive vers une autre session : hors v1, peut-être jamais (Q-38).
- Lien vers un PDF sur la diapositive : rien en v1, le journal et la note suffisent (Q-39).

### 9.2 Encore ouvert

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| Q-41 | **Verrouillage** (idée du MJ, Q-31) : une icône ou une image peut être verrouillée pour ne plus bouger. Qui verrouille et déverrouille, et qu'empêche le verrou ? | Le MJ seul verrouille et déverrouille, objet par objet. Un objet verrouillé ne se déplace, ne se redimensionne et ne s'efface plus, pour personne, MJ compris tant qu'il ne l'a pas déverrouillé (évite les fausses manœuvres). L'image de fond est verrouillée d'office | Action MJ uniquement |
| Q-42 | Icône de la bibliothèque posée : se comporte-t-elle comme un **jeton** (déplaçable par tous quand la diapositive le permet) ou comme un **décor** (déplaçable par le MJ seulement) ? | Pas de distinction : tout objet posé suit le réglage « jetons déplaçables par les joueurs » de la diapositive, et le verrou (Q-41) fige ce qui doit l'être | La différence est d'apparence : un jeton est un cercle avec l'avatar ou les initiales ; une icône de la bibliothèque n'a ni contour ni cercle, mais sa couleur se choisit (palette fixe aussi) |
| Q-43 | Grille, articulation des réglages (Q-35) : défaut de la plateforme → défaut du slug (`config.jsx`) → réglage de la **session** par le MJ → réglage propre à une **diapositive** ? | Oui, chaque niveau reprend le précédent tant qu'il n'est pas modifié. Le réglage d'une diapositive reste utile (une carte du monde et un plan de pièce n'ont pas la même échelle) | Oui, très bien comme enchaînement |
| Q-44 | Bibliothèque (Q-29) : pour juger sur pièce, je prépare une **page de prévisualisation** avec une sélection candidate d'icônes game-icons.net (une centaine, classées : armes, véhicules, animaux, lieux, objets, marqueurs) que tu valides ou complètes ? | Oui, avant la spécification technique | Partant. Une fois intégrée, la bibliothèque doit permettre de rechercher, et sans doute d'avoir des catégories |

**Report des réponses (2026-10-28)**
- **Verrouillage** : action du MJ uniquement, objet par objet ; un objet verrouillé ne bouge, ne se redimensionne ni ne s'efface plus (Q-41).
- **Jeton et icône** se distinguent par l'apparence : le **jeton** est un cercle avec l'avatar ou les initiales ; l'**icône** de la bibliothèque est posée nue, sans cercle ni contour, dans une couleur de la palette fixe. Pour le reste (déplacement selon le réglage de la diapositive, verrou), même comportement (Q-42).
- **Grille** : réglages en cascade plateforme → slug (`config.jsx`) → session → diapositive, chaque niveau reprenant le précédent tant qu'il n'est pas modifié (Q-43).
- **Bibliothèque** : choisir une icône se fait par **recherche** et par **catégories** (Q-44). Sélection validée sur une page de prévisualisation (`icones_preview.html`, supprimée le 2026-11-12 une fois la bibliothèque en prod) : 162 icônes candidates en 8 catégories, recherche en français et en anglais, palette fixe de 8 couleurs, mise en situation jetons / icônes sur un plan.

**Bibliothèque et licence (MJ, 2026-10-28, après la prévisualisation)**
- On intègre **toute la bibliothèque game-icons.net** (4 239 icônes au dépôt `game-icons/icons`), **sauf la collection « badges »** (59 icônes, inutiles en v1) : environ 4 180 icônes, livrées avec l'application.
- **Licence CC BY 3.0** : mention des auteurs sur la **page d'accueil de la plateforme** et dans le **README** du projet, nulle part ailleurs (usage en cercle restreint).
- **Icônes et images redimensionnables** sur la diapositive (agrandir / réduire), en plus d'être déplaçables.
- **Recherche en anglais** en v1, sur les noms et mots-clés d'origine. Une traduction française pourra faire l'objet d'une passe dédiée plus tard (MJ, 2026-10-28).
- **Catégories : vérifié le 2026-10-28, récupérables.** Le dépôt ne fournit que des noms anglais et un dossier par auteur (le jeu Iconify `game-icons` non plus), mais le site game-icons.net publie une page par tag (`/tags/<tag>.html`, `robots.txt` ouvert à tous) :
  - **128 tags**, dont 110 rangés en **18 groupes** (Animal → Bird, Fish, Mammal… ; Weapon → Axe, Bomb, Gun & Firearm… ; Nature → Fire, Plant, Wood & Tree…) et 18 hors groupe (Container, Household, Lock & Key, Trap…) ;
  - **4 084 icônes sur 4 180** ont au moins un tag (98 %) ; les 96 restantes iraient dans « Divers » ;
  - une icône peut avoir plusieurs tags.
- Principe retenu pour la phase 2 (validé par le MJ, 2026-10-28) : un **relevé unique**, fait par un script lancé à la main, produit un index (nom, auteur, tags) livré avec les icônes et **versionné dans le dépôt**. Aucun appel au site pendant le jeu. L'index nous appartient ensuite : on peut le **traduire** ou **recatégoriser** à la main, sans dépendre du site. La recherche porte sur le nom de l'icône et ses tags ; les catégories sont les groupes de tags, en anglais en v1 (libellés traduisibles avec la future passe française : 128 libellés seulement).

---

## 10. Spécification technique (phase 2, 2026-11-04)

Elle suit ce que l'audio a déjà posé (`spec_audio.md` §11) : base de module, route partagée par table, couche montée par `GMPage` / `PlayerPage`, élément d'activation pour `TabSession`, fenêtre flottante (`FloatingPanel`), zone d'actions (`ZoneAction`), stockage navigateur (`usePersistedState`). Elle n'invente pas de mécanique nouvelle, sauf le relais temps réel du §10.5 (point P-1).

### 10.1 Base du module : `database/board.db`

- Déclaration `src/server/db/modules/board.js` : `{ slug: 'board', label: 'Tableau', dbPath: 'database/board.db', schemaPath: 'database-template/board-schema.sql' }`, chargée par `getModuleConfig('board')`. Migration, release et `install.sh` la connaissent déjà (mécanisme de l'audio) : rien à changer dans les scripts.
- Première mise en prod sans migration : la base se crée depuis son schéma à la première ouverture.
- Clés étrangères actives (`PRAGMA foreign_keys = ON`, depuis v5.14.0) : les `ON DELETE CASCADE` du schéma suppriment les lignes filles, sans suppression à la main.
- Chaque table porte `slug` + `session_id` (ou y remonte par sa diapositive) : pas de lien possible vers la base du slug.

**Schéma** (`database-template/board-schema.sql`) :

```sql
-- Tableau d'une table (slug + session) : activation, diapositive montrée, grille, purge
create table board_sessions
(
    slug           TEXT    not null,
    session_id     INTEGER not null,                 -- game_sessions.id dans la base du slug
    enabled        INTEGER not null default 0,
    shown_slide_id INTEGER references board_slides on delete set null,
    keep           INTEGER not null default 0,       -- « à conserver » : jamais purgé
    grid_value     REAL,                             -- valeur d'une case ; null : défaut du slug
    grid_unit      TEXT,                             -- 'm' | 'ft' ; null : défaut du slug
    last_used_at   DATETIME default CURRENT_TIMESTAMP, -- base de la purge (§10.6)
    primary key (slug, session_id)
);

create table board_slides
(
    id            INTEGER primary key autoincrement,
    slug          TEXT    not null,
    session_id    INTEGER not null,
    name          TEXT    not null,
    position      INTEGER not null default 0,
    players_draw  INTEGER not null default 0,        -- les joueurs dessinent (Q-7, Q-9)
    players_move  INTEGER not null default 0,        -- les joueurs déplacent jetons et icônes (Q-7, Q-10)
    fog_enabled   INTEGER not null default 0,        -- diapositive avec brouillard (Q-33)
    fog_shown     INTEGER not null default 1,        -- interrupteur du MJ, sans toucher à l'état
    fog           TEXT    not null default '[]',     -- JSON : [{ op: 'reveal'|'cover', x, y, w, h }], dans l'ordre
    grid_enabled  INTEGER not null default 0,
    grid_size     REAL    not null default 50,       -- côté d'une case, en unités du tableau
    grid_value    REAL,                              -- null : valeur de la session
    grid_unit     TEXT,                              -- null : unité de la session
    created_at    DATETIME default CURRENT_TIMESTAMP,
    updated_at    DATETIME default CURRENT_TIMESTAMP
);

-- Images déposées : appartiennent à une diapositive (Q-16), servies à part (§10.4)
create table board_images
(
    id         INTEGER primary key autoincrement,
    slide_id   INTEGER not null references board_slides on delete cascade,
    mime       TEXT    not null,                     -- image/jpeg | image/png | image/webp | image/gif
    width      INTEGER not null,
    height     INTEGER not null,
    size       INTEGER not null,                     -- octets (taille affichée au MJ, alerte serveur)
    data       BLOB    not null,
    created_at DATETIME default CURRENT_TIMESTAMP
);

-- Objets posés sur une diapositive
create table board_items
(
    id         INTEGER primary key autoincrement,
    slide_id   INTEGER not null references board_slides on delete cascade,
    kind       TEXT    not null,                     -- 'image' | 'icon' | 'token' | 'stroke' | 'rect'
    x          REAL    not null default 0,
    y          REAL    not null default 0,
    w          REAL    not null default 0,
    h          REAL    not null default 0,
    z          INTEGER not null default 0,           -- ordre d'affichage
    locked     INTEGER not null default 0,           -- verrou du MJ (Q-41)
    data       TEXT    not null default '{}',        -- JSON propre au type, ci-dessous
    author     INTEGER,                              -- characterId de l'auteur (-1 : MJ)
    created_at DATETIME default CURRENT_TIMESTAMP,
    updated_at DATETIME default CURRENT_TIMESTAMP
);
```

Index : `board_slides (slug, session_id, position)`, `board_items (slide_id, z)`, `board_images (slide_id)`.

`board_items.data` selon le type :

| Type | `data` | Remarques |
|---|---|---|
| `image` | `{ imageId }` ou `{ url }` | Image déposée (dans `board_images`) ou lien externe. L'image de fond est une image verrouillée à `z` minimal (Q-41) |
| `icon` | `{ icon: 'lorc/campfire', color }` | Icône nue, couleur de la palette (Q-42) ; `w = h` |
| `token` | `{ characterId }` ou `{ label, color, imageId? }` | Jeton rond : PJ (avatar, sinon initiales, lus dans le personnage), ou PNJ (initiales et couleur, ou image en cercle) (Q-18, Q-32) |
| `stroke` | `{ points: [x1, y1, x2, y2, …], color, width }` | Trait à main levée, simplifié avant envoi ; `x, y, w, h` = boîte englobante |
| `rect` | `{ color, filled }` | Rectangle plein légèrement transparent, ou contour (P-10) |

Coordonnées en **unités du tableau** (le pixel de l'image de fond à l'échelle 1), espace sans bord ; chacun zoome et se déplace chez soi (Q-8).

### 10.2 Droits

| Action | MJ | Joueur |
|---|---|---|
| Activer, réglages de la table (grille, « à conserver »), diapositive montrée | oui | non |
| Créer, renommer, réordonner, dupliquer, supprimer une diapositive ; ses réglages | oui | non |
| Déposer une image, poser une icône, un jeton (Q-36, Q-37, P-3) | oui | non |
| Dessiner (trait, rectangle) | oui | si `players_draw` |
| Effacer un trait ou un rectangle (Q-9 : par tout le monde) | oui | si `players_draw` (P-4) |
| Effacer une image, une icône, un jeton ; « Tout effacer » | oui | non |
| Déplacer, redimensionner | oui | si `players_move` (Q-10) |
| Verrouiller, déverrouiller (Q-41) | oui | non |
| Brouillard : dévoiler, recouvrir, afficher / masquer | oui | non |
| Ping | oui | oui, toujours (Q-40) |

Un objet verrouillé refuse déplacement, redimensionnement et effacement, MJ compris, jusqu'à son déverrouillage. Les droits sont vérifiés **côté serveur** pour toute écriture (`requireGM`, ou réglage de la diapositive pour un joueur). Ce que voit un joueur (diapositives préparées, contenu sous le brouillard) est filtré côté client, comme le reste de la plateforme.

### 10.3 Grille et mesure

- Cascade (Q-43) : **plateforme** (`{ value: 1.5, unit: 'm' }`) → **slug** (clé facultative `board: { grid: { value, unit } }` de son `config.jsx`, lue par `useSlugConfig`) → **table** (`board_sessions.grid_value / grid_unit`) → **diapositive** (`board_slides.grid_value / grid_unit`). Un `null` reprend le niveau précédent.
- La taille d'une case (`grid_size`, en unités du tableau) est propre à la diapositive : elle dépend de l'image.
- Grille sans magnétisme (Q-21). La règle n'existe qu'avec la grille : distance = longueur du segment / `grid_size` × valeur, arrondie au dixième, avec l'unité (« 4,5 m », « 15 ft »). Locale à celui qui mesure (pas diffusée, voir P-12).

### 10.4 Routes HTTP

Route partagée `src/server/routes/board.js`, ajoutée à `SHARED_ROUTES` du `Loader.js` et montée dans `server.js` sur `/api/:slug/board`, comme `audio`. Toutes sous `/sessions/:sid/` : `router.param('sid')` vérifie la table dans la base du slug et prépare `req.board = { db, slug, sessionId, io }`.

| Méthode et chemin | Droits | Rôle |
|---|---|---|
| `GET /sessions/:sid` | connecté | `{ enabled, shownSlideId, keep, grid: { value, unit }, purgeAt, size, slides: [{ id, name, position, … réglages }] }` ; pour le MJ, ménage des tables disparues et purge (§10.6) |
| `PUT /sessions/:sid` `{ enabled?, keep?, gridValue?, gridUnit? }` | MJ | Réglages de la table |
| `PUT /sessions/:sid/shown` `{ slideId }` | MJ | Montrer une diapositive (`null` : rien) |
| `POST /sessions/:sid/slides` `{ name? }` | MJ | Créer (« Diapositive n » par défaut) |
| `PUT /sessions/:sid/slides/order` `{ ids }` | MJ | Réordonner |
| `PUT /sessions/:sid/slides/:id` `{ name?, playersDraw?, playersMove?, fogEnabled?, fogShown?, gridEnabled?, gridSize?, gridValue?, gridUnit? }` | MJ | Renommer, réglages |
| `POST /sessions/:sid/slides/:id/duplicate` | MJ | Copie complète, images comprises (Q-24, Q-32) |
| `DELETE /sessions/:sid/slides/:id` | MJ | Supprimer (objets et images par cascade) |
| `GET /sessions/:sid/slides/:id` | connecté | `{ slide, items }` |
| `POST /sessions/:sid/slides/:id/items` `{ kind, x, y, w, h, data }` | §10.2 | Poser un objet |
| `PATCH /sessions/:sid/items/:id` `{ x?, y?, w?, h?, z?, data?, locked? }` | §10.2 | Déplacer, redimensionner, recolorer, verrouiller |
| `DELETE /sessions/:sid/items/:id` | §10.2 | Effacer |
| `DELETE /sessions/:sid/slides/:id/items` | MJ | Tout effacer (sauf verrouillé) |
| `POST /sessions/:sid/slides/:id/pc-tokens` | MJ | Poser les jetons des PJ de la table qui manquent (Q-36) |
| `PUT /sessions/:sid/slides/:id/fog` `{ op, x, y, w, h }` ou `{ reset: 'cover' \| 'reveal' }` | MJ | Dévoiler / recouvrir une zone, ou tout |
| `POST /sessions/:sid/slides/:id/images` `{ dataUrl, x?, y?, background? }` | MJ | Déposer une image (déjà réduite par le navigateur) : ligne `board_images` + objet `image` ; `background` la place en fond, verrouillée |
| `GET /sessions/:sid/images/:id` | connecté | L'image en binaire, `Cache-Control: private, max-age=31536000, immutable` (une image ne change jamais) |

- Chaque écriture met à jour `board_sessions.last_used_at` et `board_slides.updated_at`, puis diffuse (§10.5).
- Image : refusée au-delà d'un plafond **technique** par image (5 Mo décodée, garde-fou contre un fichier non réduit), jamais par quota (Q-28). Au-delà de 1 Go pour `board.db`, une ligne d'alerte dans les journaux du serveur, une fois par démarrage.
- Une `<img>` ne peut pas porter le jeton d'accès : le client charge l'image par `fetchWithAuth`, en fait une adresse locale (`URL.createObjectURL`) et la garde en cache pour la page.

### 10.5 Temps réel

**Serveur → room `${slug}_session_${sessionId}`** (après chaque écriture HTTP) :

| Événement | Charge | Quand |
|---|---|---|
| `board-session` | `{ system, sessionId, enabled, shownSlideId, grid, keep }` | Réglages de la table, activation, diapositive montrée |
| `board-slides` | `{ system, sessionId, slides }` | Liste ou réglages des diapositives |
| `board-items` | `{ system, sessionId, slideId, upsert: [items], remove: [ids] }` | Objets posés, modifiés, effacés |
| `board-fog` | `{ system, sessionId, slideId, fog, fogShown, fogEnabled }` | Brouillard |

**Relais éphémère, client → serveur → room (P-1)** : `socket/platform/board.js` (nouveau domaine, `register(io, socket)`), sans base ni écriture.
- `board-ping { system, sessionId, slideId, x, y, color }` → `board-ping` à la room.
- `board-drag { system, sessionId, slideId, itemId, x, y, w?, h? }` → `board-drag` à la room, en `volatile` (perdu si le réseau sature, sans gravité), au plus ~15 par seconde par client. À la fin du geste, le `PATCH` enregistre la position et diffuse `board-items`.

Le relais ne vérifie que la forme (types, room du socket) : la position définitive passe toujours par le `PATCH`, qui vérifie les droits.

### 10.6 Purge et ménage

- **Purge à 3 mois** (Q-25, Q-26) : au chargement du tableau par un MJ (`GET /sessions/:sid`, quel que soit le slug), suppression des tables de `board.db` dont `last_used_at` a plus de 90 jours et `keep = 0` : leurs diapositives, objets et images (cascade), puis la ligne `board_sessions`.
- **« Utilisé »** = une diapositive montrée aux joueurs ou une écriture sur le tableau ; ouvrir le tableau ne compte pas en temps normal (P-5).
- **Prolongation à l'ouverture** (MJ, P-5) : si le MJ ouvre un tableau qui arrive à échéance (moins de 14 jours) ou l'a dépassée, il est **prolongé** (`last_used_at` remis à la date du jour) ; la purge ne supprime jamais la table qu'on est en train d'ouvrir.
- **Mention** (Q-27) : dans ce cas, le MJ voit une fois, dans l'en-tête de sa liste de diapositives, « Ce tableau devait être supprimé le JJ/MM : il est prolongé de 3 mois », à côté du bouton « À conserver ».
- **Tables disparues** (comme l'audio, P2-1) : au même moment, le contenu des tables du slug qui n'existent plus dans sa base est supprimé (P-9).

### 10.7 Bibliothèque d'icônes

- **Script lancé à la main**, une fois : `scripts/board-icons.js`. Il lit le dépôt `game-icons/icons` (sans la collection `badges`), retire le fond noir de chaque SVG et passe le tracé en `currentColor`, puis lit les 128 pages de tags du site (une requête toutes les 400 ms). Il écrit :
  - `src/client/public/board/icons/<auteur>/<nom>.svg` (4 180 fichiers, ~6,5 Mo, servis tels quels par Vite et par Express) ;
  - `src/client/public/board/icons/index.json` : `{ groups: [{ label, tags: [...] }], icons: [{ id: 'lorc/campfire', tags: [...] }] }` (~200 Ko), **versionné** et modifiable à la main (Q-44 : traduction, recatégorisation).
- Relancer le script écrase ces fichiers : à éviter une fois l'index retouché (il le dit en tête).
- **Sélecteur** (`IconPicker`) : index chargé à la première ouverture ; recherche sans accents sur le nom et les tags (`normalizeText` de `ui/tools/catalog.js`), catégories = groupes de tags plus « Divers » ; 120 résultats affichés au plus, le reste par « Voir plus ». Chaque icône est un `<img>` du fichier SVG, mis en cache par le navigateur.
- Sur le tableau, l'icône est rendue en ligne dans le SVG (contenu du fichier, chargé une fois et gardé en mémoire), pour prendre sa couleur.
- **Crédits** (CC BY 3.0) : une ligne en pied de la page d'accueil de la plateforme (`HomePage.jsx`) et un paragraphe dans le `README.md`.

### 10.8 Client

| Fichier | Rôle |
|---|---|
| `features/board/hooks/useBoardSession.js` | Table : `{ loaded, enabled, shownSlideId, grid, keep, purgeAt, size, slides }` au chargement et à la reconnexion, écoute `board-session` / `board-slides`, actions du MJ |
| `features/board/hooks/useBoardSlide.js` | Diapositive : `{ slide, items }`, écoute `board-items` / `board-fog` / `board-drag` / `board-ping`, actions (poser, déplacer, effacer…) avec mise à jour immédiate à l'écran |
| `features/board/hooks/useBoardImages.js` | Cache des images de la page (id → adresse locale), libérées au démontage |
| `features/board/tools/boardGeometry.js` | Pur : écran ↔ tableau, zoom autour du pointeur, boîte englobante, simplification d'un trait (Ramer-Douglas-Peucker) |
| `features/board/tools/boardGrid.js` | Pur : cascade de la grille, distance mesurée, format (« 4,5 m ») |
| `features/board/tools/boardRights.js` | Pur : ce qu'un rôle peut faire d'un objet sur une diapositive (§10.2), pour griser les outils |
| `ui/tools/imageResize.js` | Pur côté navigateur : réduction et recompression d'une image, sorti de `RichTextEditor.jsx`, qui l'importe désormais (P-8) |
| `features/board/BoardLayer.jsx` | Monté par `GMPage` et `PlayerPage` (comme `AudioLayer`) : rien si le tableau est désactivé (joueur) ; `ZoneAction` « Tableau » (`board`, `highlighted` si une nouvelle diapositive n'a pas été vue) ; bandeau « Le MJ partage un visuel · Voir » (Q-6) ; mode réduit en `FloatingPanel` (mémorisé par slug, fermable) ; joueur : bascule plein écran |
| `features/board/Board.jsx` | **Le composant à poser par un slug dans un onglet**, joueur ou MJ (Q-5) : `<Board sessionId role />`. Assemble la vue, la barre d'outils et, pour le MJ, la liste des diapositives |
| `features/board/BoardCanvas.jsx` | Vue SVG : fond, objets, traits, brouillard (masque ; transparent pour le MJ), grille, règle, pings ; zoom (molette, pincement), déplacement de la vue, poignées de redimensionnement |
| `features/board/BoardToolbar.jsx` | Outils : main, trait, rectangle, gomme, règle (si grille), palette fixe ; MJ : image, icône, jeton, PJ, brouillard, verrou |
| `features/board/SlideList.jsx` | MJ : diapositives (glisser-déposer par `useDragOrder`), « Montrer », réglages, dupliquer, supprimer, taille, purge et « À conserver » |
| `features/board/IconPicker.jsx` | Sélecteur d'icônes (§10.7), dans une `HostedModal` |
| `features/board/BoardSessionToggle.jsx` | Élément d'activation pour `TabSession`, comme `AudioSessionToggle` (`label`, `icon`, `className`) |

- Palette fixe de 8 couleurs (celle de la prévisualisation), dans `features/board/tools/boardGrid.js` ou un petit `tools/boardPalette.js`.
- Couleur de ping d'un participant : tirée de la palette à partir de son identifiant (stable).
- Stockage navigateur : mode joueur (réduit / plein écran) et ouverture du mode réduit par slug (`vtt:<slug>:board`), position de la fenêtre par `FloatingPanel` ; vue (zoom, cadrage) non mémorisée.
- Habillage : classes `vtt-board*` dans `features/board/board.css` (`@layer components`, variables `--color-*`), fenêtre en `vtt-floating-*`, menus en `vtt-menu*`, boutons en `vtt-btn` : le tableau reprend l'habillage déjà fait par chaque slug ; Vikings en pilote.

### 10.9 Lots

1. **Serveur** : base de module, schéma, route, relais socket, purge et ménage, tests. *Point de contrôle.*
2. **Client de base** : hooks, `Board` (vue, zoom, images, jetons, traits, rectangles, gomme, déplacement en direct, ping), liste des diapositives, `BoardLayer`, élément d'activation, pilote Vikings (élément dans `TabSession`, onglet « Tableau » dans `GMApp`, P-7). *Point de contrôle en dev avec toi.*
3. **Carte** : brouillard, grille et règle, verrou, redimensionnement.
4. **Icônes** : script, index, sélecteur, crédits (accueil, README).
5. **Habillage Vikings** et mise à jour de `/new-slug`, des CLAUDE.md (brique et son élément `TabSession`, composant `Board` pour un onglet).

**État au 2026-11-04 (soir)** : lots 1 à 5 implémentés, non commités, à essayer en dev sur Vikings.
- Lot 3 : brouillard (outils Dévoiler / Recouvrir, Tout couvrir / Tout dévoiler, interrupteur « Brouillard affiché », transparent pour le MJ), grille sans magnétisme et règle locale, réglages de case par diapositive et pour la table (« par défaut » reprend le niveau au-dessus), poignée de redimensionnement sur l'objet sélectionné (proportions gardées sauf rectangle, traits exclus).
- Lot 4 : `scripts/board-icons.js` lancé une fois (4 180 icônes, 6,9 Mo, 37 groupes de catégories, 96 en « Divers ») ; `index.json` versionné et retouchable ; sélecteur `IconPicker` (recherche en anglais, catégories, palette, aperçus en masque CSS sur vignette claire) ; icône posée nue, déplaçable selon le réglage, redimensionnable ; crédits sur l'accueil et dans le README.
- Lot 5 : bloc « Tableau partagé » du `theme.css` de Vikings ; `CLAUDE.md` (racine, client, serveur) et `/new-slug` à jour.

- Retour de l'essai avec un joueur (2026-11-04) : réglage de grille affiché sans grille, et valeur de case en double (diapositive + table). Désormais une seule ligne « 1 case = … », visible seulement grille active, et une bascule **« Défaut de la table »** : active, la diapositive suit le défaut de la table et la ligne règle ce défaut (les autres diapositives avec grille le reprennent) ; désactivée, la diapositive garde sa propre valeur. Une nouvelle diapositive suit le défaut de la table.

- **Extension à tous les slugs (2026-11-04)** : élément d'activation à côté de celui de la musique dans chaque `TabSession`, onglet « Tableau » de l'interface MJ après le Journal (libellé dans le style des onglets du slug), bloc « Tableau partagé » dans chaque `theme.css`, sur le modèle de Vikings : Fabula, Zone Blanche, Achtung, Cyberpunk, Delta Green, Dune, Tecumah, Vampire, Vileborn (Nimble l'avait déjà). **Noctis exclu**, comme pour les autres briques, en attendant sa refonte.

Historique des lots 1 et 2 :
- Lot 1 : base, route, relais, purge et ménage ; 13 tests serveur (`tests/server/routes/board.test.js`). Le banc `tests/server/helpers/slugApp.js` sait monter une route partagée (`{ shared: true }`).
- Lot 2 : `Board`, `BoardCanvas`, `BoardToolbar`, `SlideList`, `BoardLayer`, `BoardSessionToggle`, hooks `useBoardSession` / `useBoardSlide` / `useBoardImages`, outils `boardGeometry`, `boardRights`, `imageResize` (journal branché dessus) ; pilote Vikings (élément dans `TabSession`, onglet « Tableau » du MJ). Jeton de PNJ : nom et couleur, posé en haut à gauche du contenu. Retours du premier essai (2026-11-04) : fenêtre mémorisée par rôle, bandeau lisible la nuit, curseur selon l'outil, réponse appliquée par celui qui agit, reconnexion du MJ (`useGMSession` rejoint la room à la reconnexion), renommage par ✎, liste des diapositives en panneau / rail / masquée ; **sélection par le MJ** (outil main, clic sans glisser, même sur un objet verrouillé) avec barre Verrouiller / Déverrouiller / Supprimer, avancée du lot 3 pour pouvoir retirer un fond. Pas encore : brouillard, grille et règle, redimensionnement à l'écran (lot 3), icônes (lot 4), habillage Vikings (lot 5).

### 10.10 Tests

- Front (`src/client/tests/tools/`) : `boardGeometry.test.js` (conversions, zoom, simplification), `boardGrid.test.js` (cascade, distance, unités), `boardRights.test.js` (tableau du §10.2).
- Serveur (`tests/server/routes/board.test.js`) : sur base en mémoire, droits du §10.2 (joueur refusé sans réglage, objet verrouillé refusé, MJ), duplication avec images, purge (90 jours, « à conserver »).

### 10.11 Fichiers touchés

| Fichier | Changement |
|---|---|
| `database-template/board-schema.sql`, `src/server/db/modules/board.js` | Nouveaux |
| `src/server/routes/board.js`, `src/server/socket/platform/board.js` | Nouveaux |
| `src/server/systems/Loader.js`, `src/server/server.js` | Montage de la route (une ligne chacun) |
| `src/server/socket/index.js` | Branchement du domaine `board` |
| `scripts/board-icons.js`, `src/client/public/board/icons/**` | Nouveaux (lot 4) |
| `src/client/src/features/board/hooks/useBoard*.js`, `src/client/src/features/board/tools/board*.js`, `ui/tools/imageResize.js`, `features/board/*` | Nouveaux |
| `src/client/src/ui/text/RichTextEditor.jsx` | Import de `imageResize.js` au lieu de sa copie (P-8) |
| `src/client/src/app/pages/GMPage.jsx`, `PlayerPage.jsx` | Montage de `BoardLayer` |
| `src/client/src/features/board/board.css` | Style par défaut `vtt-board*` |
| `src/client/src/app/pages/HomePage.jsx`, `README.md` | Crédits des icônes |
| `src/client/src/systems/vikings/gm/tabs/TabSession.jsx`, `systems/vikings/GMApp.jsx`, `systems/vikings/theme.css` | Pilote (P-7) |
| `src/client/tests/tools/board*.test.js`, `tests/server/routes/board.test.js` | Nouveaux |
| `CLAUDE.md`, `src/client/CLAUDE.md`, `src/server/CLAUDE.md`, `/new-slug` | Brique tableau |

### 10.12 Points à valider

| # | Point | Proposition | Réponse MJ |
|---|---|---|---|
| P-1 | **Relais temps réel émis par le client** (`board-drag`, `board-ping`) : aujourd'hui, seul `audio-ping` part du client, et en lecture seule. Ici le serveur relaie à la room sans rien écrire. Sans ça, un déplacement « en direct » (Q-11) demanderait une requête HTTP à chaque mouvement, et le ping un enregistrement inutile | Oui : relais sans écriture, la position définitive passant toujours par le `PATCH` qui vérifie les droits | Oui, relais socket. Ce qui est à proscrire, c'est un slug qui émet lui-même alors que les sockets sont branchés ailleurs ; une brique de la plateforme qui émet depuis ses propres hooks est le cas standard. Les émissions vivent donc dans `features/board/hooks/useBoardSlide.js`, jamais dans le code d'un slug |
| P-2 | Un trait d'un autre participant apparaît **à la fin du geste** (au lâcher), pas pendant qu'il le trace | Oui en v1 ; le tracé en direct pourra passer plus tard par le même relais | Oui, à la fin, au moins pour la v1 |
| P-3 | Icônes : posées par le MJ seulement, comme images et jetons ? | Oui en v1 ; les joueurs dessinent, déplacent (si permis) et pingent | Oui |
| P-4 | Gomme des joueurs : traits et rectangles seulement (jamais images, icônes, jetons) ; « Tout effacer » réservé au MJ | Oui | Oui |
| P-5 | « Utilisé » pour la purge = diapositive montrée ou écriture sur le tableau ; ouvrir le tableau ne compte pas (sinon la mention ne s'affiche jamais) ; mention à moins de 14 jours | Oui | Oui, sauf si on ouvre un tableau qui devrait être supprimé : ça vaut prolongation (§10.6) |
| P-6 | Icônes **dans le dépôt** (`public/board/icons/`, 4 180 fichiers, ~6,5 Mo), plutôt que téléchargées à l'installation | Oui : l'index retouché à la main vit avec elles, la release ne change pas | Oui, 7 Mo ce n'est pas la mort |
| P-7 | Pilote Vikings : élément d'activation dans `TabSession` et **onglet « Tableau » dans `GMApp`** ; côté joueur, le tableau de la plateforme seul (bascule et mode réduit), sans onglet dans la fiche | Oui | Oui |
| P-8 | Sortir la réduction d'image de `RichTextEditor.jsx` dans `ui/tools/imageResize.js`, partagé avec le tableau (le journal l'importe, comportement inchangé) | Oui, plutôt qu'une seconde copie | Oui |
| P-9 | Ménage des tables disparues au chargement par le MJ, comme l'audio | Oui | Oui |
| P-10 | Rectangle (Q-34, resté sans réponse sur ce point) : plein et légèrement transparent par défaut, contour en option | Oui | Oui |
| P-11 | Annuler (Ctrl+Z) : hors v1 (Q-22 : pas obligatoire) | Hors v1 | Pour après, hors v1 |
| P-12 | Règle : la mesure reste locale à celui qui mesure (pas diffusée aux autres) | Oui en v1 ; une mesure partagée passerait par le relais | Oui |

---

## 11. Évolutions (v2) — phase 1, brainstorming (2026-11-05)

La v1 est en prod (v5.15.0, v5.15.1) et validée à la table avec un joueur. Le MJ a retenu **toutes** les idées ci-dessous (« j'aime tout »). Rien n'est codé : elles restent à préciser (§11.3), puis à découper en lots (§11.2).

### 11.1 Idées retenues

**Ergonomie** (idées du MJ en gras)
- **Barre d'outils allégée** : barre contextuelle (palette et épaisseur visibles seulement avec un outil de dessin, brouillard seulement sur une diapositive avec brouillard) et menu « Ajouter ▾ » (image, fond, lien d'image, icône, jeton de PNJ, jetons des PJ).
- **Distinguer sélection et main** : outil Sélection (flèche : sélectionner, déplacer, redimensionner) et outil Main (déplace la vue seulement, ne touche jamais un objet) ; déplacer la vue avec tous les outils (clic molette, espace maintenu, deux doigts).
- **Réorganiser les diapositives** : le glisser-déposer existe en mode panneau ; poignée ⠿ visible, et glisser-déposer aussi dans le rail.
- **Désactiver le tableau depuis le tableau** : bascule en tête de la liste des diapositives, en plus de l'élément de `TabSession`.
- **Aide contextuelle** : un « ? » dans un coin du tableau, gestes et raccourcis selon le rôle.
- Raccourcis clavier : V sélection, H main, P trait, R rectangle, E gomme, M règle, Suppr, Ctrl+D dupliquer, Échap.
- Boutons de zoom dans un coin (+, −, recadrer).
- Rappel « Les joueurs voient : … » côté MJ quand il édite une autre diapositive que celle montrée.
- Miniatures dans la liste des diapositives.
- Confirmation avant de montrer une diapositive dont le brouillard est réglé mais masqué.

**Dessin et objets**
- **Cercle / ellipse** (aussi zone d'effet avec la grille) ; ligne droite et flèche.
- **Halo** : cercle à dégradé radial vers le transparent (torche, lueur).
- **Filtres d'image** : luminosité, contraste, saturation, préréglage « nuit ».
- **Premier plan / arrière-plan** (l'ordre d'affichage existe déjà).
- Texte, étiquette.
- Lien d'image collé (le serveur l'accepte déjà, seul le bouton manque).
- Dupliquer un objet.
- Rotation des images, icônes, textes et rectangles.

**Objets avancés**
- **Menu contextuel** au clic droit (sur tactile : barre de sélection, l'appui long reste le ping).
- **Grouper** des éléments, précédé de **attacher** un objet à un autre (la torche suit le jeton), et d'une sélection multiple.
- Objets cachés aux joueurs (préparation du MJ, révélés d'un clic).
- Marqueurs d'état sur un jeton (anneau de couleur, pastille : à terre, blessé, invisible…), sans aucune règle.

**Déjà notés en v1, rattachés ici**
- Ctrl+Z limité à ses propres actions (P-11) ; tracé en direct (P-2) ; dépôt d'images par les joueurs (Q-37) ; traduction française de l'index d'icônes.

**Écartés** (proposés puis laissés de côté) : vision dynamique (halo qui dévoile le brouillard), curseurs des joueurs visibles en permanence, export de la diapositive en PNG.

### 11.2 Découpage proposé (à valider)

1. **Lot A — ergonomie** : barre contextuelle et « Ajouter ▾ », sélection / main, déplacement de la vue universel, zoom en coin, raccourcis, aide « ? », poignée et rail réordonnables, désactiver depuis le tableau, « Les joueurs voient », confirmation avant de montrer.
2. **Lot B — dessin et objets** : cercle / ellipse, ligne / flèche, halo, texte, lien d'image, filtres d'image, dupliquer, premier / arrière-plan, rotation.
3. **Lot C — objets avancés** : menu contextuel (qui rassemble les actions des lots A et B), objets cachés, marqueurs d'état, attacher, sélection multiple et groupes. *(Retenu au §11.5 : sans marqueurs ni attache.)*
4. **Lot D — reste** : Ctrl+Z, tracé en direct, miniatures, dépôt d'images par les joueurs.

### 11.3 Questions

| # | Question | Proposition | Réponse MJ                                                                                                                           |
|---|---|---|--------------------------------------------------------------------------------------------------------------------------------------|
| Q-45 | Ordre des lots (§11.2) : A, B, C, D ? | Oui : l'ergonomie d'abord (elle touche ce qui existe), puis les nouveaux objets, puis ce qui les combine | oui ok                                                                                                                               |
| Q-46 | Cercle : ellipse libre (cercle parfait avec Maj), ou cercle seul ? Plein transparent par défaut et contour en option, comme le rectangle ? | Ellipse libre, Maj pour un cercle ; même rendu que le rectangle | oui classique dessin par ordinateur                                                                                                  |
| Q-47 | Ligne et flèche : un seul outil « Ligne » avec une option pointe de flèche, ou deux outils ? | Un outil, option « flèche » dans la barre contextuelle | Hmm un seul je pense                                                                                                                 |
| Q-48 | Halo : réglages ? | Couleur de la palette, taille par la poignée, centre à 60 % d'opacité vers le transparent ; ni intensité ni scintillement réglables | ok pour moi comme ta reco                                                                                                            |
| Q-49 | Filtres d'image : curseurs libres, préréglages, ou les deux ? Réservés au MJ ? | Préréglages (Normal, Nuit, Sombre, Sépia, Délavé) et trois curseurs (luminosité, contraste, saturation) ; MJ seul | Ok                                                                                                                                   |
| Q-50 | Texte : taille (poignée ou choix), couleur (palette), fond derrière le texte ? Les joueurs peuvent-ils écrire quand le dessin leur est ouvert ? | Taille par la poignée, palette, fond clair semi-transparent en option ; les joueurs écrivent si le dessin est ouvert | ok reco                                                                                                                              |
| Q-51 | Dupliquer : qui, et où tombe la copie ? | MJ pour tout, joueur pour ses dessins si le dessin est ouvert ; copie décalée d'une case (ou de 20 unités sans grille) | Peut-être un outil uniquement côté MJ ça non ?                                                                                       |
| Q-52 | Rotation : quels objets, et par pas ? | Images, icônes, textes, rectangles, ellipses ; poignée ronde au-dessus de la sélection, pas de 15° avec Maj ; jetons sans rotation | Ok reco                                                                                                                              |
| Q-53 | Objets cachés : comment le MJ les voit-il, et que voit le joueur ? | Le MJ les voit à moitié transparents avec un liseré pointillé ; le joueur ne reçoit pas de différence visible, l'objet n'est pas dessiné chez lui | une pastille sinon ? enfin un badge ?                                                                                                |
| Q-54 | Marqueurs d'état : liste fixe de pastilles, ou texte libre ? Qui les pose ? | Anneau de couleur (palette) + une pastille parmi une liste courte (à terre, blessé, inconscient, invisible, cible) ; le MJ, et le joueur sur le jeton de son personnage | A voir ça c'est pas le truc le plus utile je pense, limite je le conserve dans la todo en mode plus tard peut-être à discuter        |
| Q-55 | Attacher : comment ? Que suit l'objet attaché ? | Menu « Attacher à… » puis clic sur la cible ; l'objet attaché suit les déplacements (pas le redimensionnement), « Détacher » dans le menu | Ok reco                                                                                                                              |
| Q-56 | Groupes : faut-il un vrai groupe permanent, ou la sélection multiple (déplacer ensemble ce qu'on a sélectionné) suffit-elle, avec l'attache pour les cas permanents ? | Sélection multiple + attache ; groupe permanent seulement si le besoin reste après usage | si on a l'attache c'est quoi la vrai diff entre les deux ?                                                                           |
| Q-57 | Menu contextuel : sur l'objet seulement, ou aussi dans le vide (ajouter ici, coller, recadrer) ? | Les deux : sur un objet ses actions, dans le vide « Ajouter ici ▸ », « Ping », « Recadrer » | Les deux oui                                                                                                                         |
| Q-58 | Aide « ? » : où ? Toujours visible ou seulement au survol du tableau ? | En bas à gauche du tableau (la zone d'actions de la plateforme est en bas à droite de la page), toujours visible, discrète | Ok reco                                                                                                                              |
| Q-59 | Miniatures : l'image de fond réduite (si la diapositive en a une), ou un vrai aperçu de toute la diapositive (traits et jetons compris) ? | L'image de fond réduite, sinon une icône neutre : un aperçu complet demanderait de redessiner chaque diapositive | C'est vraiment le dernier truc à faire, je pense que ça risque alourdir, à mettre dans la todo peut-être plus tard à voir à discuter |
| Q-60 | Confirmation avant de montrer : seulement quand le brouillard est réglé mais masqué, ou à chaque fois ? | Seulement brouillard réglé mais masqué : une confirmation systématique deviendrait un réflexe qu'on ne lit plus | ok reco                                                                                                                              |
| Q-61 | Désactiver depuis le tableau : avec confirmation (les joueurs perdent le tableau) ? | Sans confirmation : la réactivation est immédiate et rien n'est perdu | ok reco                                                                                                                              |
| Q-62 | Ctrl+Z : combien d'actions, et lesquelles ? | Les 20 dernières de la personne, sur la diapositive affichée : poser, déplacer, redimensionner, effacer ; pas les réglages de diapositive | 20 ça fait pas beaucoup ? 10 je dirais pour commencer non ? Sinon ok reco                                                               |

### 11.4 Relances (2026-11-07)

Réponses à tes questions du §11.3, et ce que j'en retiens.

| # | Ta remarque | Ma réponse | Proposition | Réponse MJ |
|---|---|---|---|---|
| Q-51 | Dupliquer : un outil côté MJ seulement ? | Oui, c'est plus simple : un trait de joueur se redessine en deux secondes, et ça évite un droit de plus à expliquer | Dupliquer réservé au MJ, copie décalée d'une case (20 unités sans grille) | |
| Q-53 | Objet caché : une pastille, un badge ? | Oui, plus lisible qu'un liseré : on voit d'un coup d'œil ce qui est caché, même sur une image sombre | Chez le MJ : objet à moitié transparent **et** pastille « œil barré » dans son coin haut droit ; chez le joueur : rien (l'objet n'est pas dessiné) | |
| Q-56 | Attache et groupe : quelle vraie différence ? | L'**attache** a un sens : l'enfant suit le parent, pas l'inverse (bouger le jeton emmène la torche ; bouger la torche ne bouge pas le jeton). Le **groupe** est symétrique : attraper n'importe quel morceau déplace tout (un décor fait de plusieurs images, une table et ses chaises). La **sélection multiple** fait la même chose que le groupe, mais pour un seul geste | Garder attache + sélection multiple ; le groupe permanent seulement si, à l'usage, tu re-sélectionnes souvent les mêmes morceaux | **Groupe simple, pas d'attache** (2026-11-07) : on règle la torche avant de grouper ; pour la changer, dégrouper, régler, regrouper. Pas de double-clic dans le groupe |

Notés sans relance :
- **Q-54** (marqueurs d'état) et **Q-59** (miniatures) : sortis de la v2, rangés dans la todo « plus tard, à discuter ».
- **Q-62** : 10 actions annulables.
- **Q-47** : un seul outil « Ligne », pointe de flèche en option.

### 11.5 Découpage retenu

Lots A, B, C, D dans cet ordre (Q-45), sans les marqueurs (lot C) ni les miniatures (lot D). Q-51 et Q-53 : propositions du MJ retenues (dupliquer réservé au MJ ; pastille « œil barré » sur l'objet caché). Q-56 : le lot C fait des **groupes simples** (un clic sur un morceau sélectionne et déplace tout le groupe ; Dégrouper / Grouper au menu contextuel) ; l'attache (Q-55) est abandonnée. Le lot A est spécifié au §12 ; les suivants le seront à leur tour, une fois le précédent essayé.

---

## 12. Lot A — ergonomie : spécification technique (phase 2, 2026-11-07)

**Rien côté serveur** : ni schéma, ni migration, ni route, ni événement socket. Tout se passe dans `features/board/` et le style. Désactiver le tableau passe par l'action existante (`board.setEnabled`, `PUT /sessions/:sid`).

### 12.1 Barre d'outils

De gauche à droite :

| Groupe | Contenu | Visible |
|---|---|---|
| Outils | Sélection, Main, Trait, Rectangle, Gomme, Règle | Toujours ; Trait / Rectangle / Gomme grisés si le dessin est fermé (comme aujourd'hui) ; Règle avec la grille |
| Dessin (contextuel) | Palette, Fin / Épais | Seulement avec Trait ou Rectangle actif (Épaisseur : Trait seul) |
| Brouillard | Dévoiler, Recouvrir, « Brouillard affiché » | MJ, diapositive avec brouillard |
| Brouillard (contextuel) | Tout couvrir, Tout dévoiler | Seulement avec Dévoiler ou Recouvrir actif |
| Ajouter ▾ (MJ) | Image…, Image en fond…, Lien d'image…, Icône…, Jeton de PNJ…, Jetons des PJ | MJ |
| Fin | Tout effacer | MJ |

- **« Ajouter ▾ »** : un bouton qui ouvre un menu (`vtt-menu`, rendu dans l'emplacement à modales comme `RowMenu` de l'audio, pour ne pas être rogné par la fenêtre flottante). Il remplace les cinq boutons actuels du MJ.
- **Lien d'image** : petite fenêtre avec un champ d'adresse (`http(s)://…`), objet `image` `{ url }` posé en haut à gauche du contenu, comme le jeton de PNJ. Le serveur l'accepte déjà ; l'image est affichée à sa taille naturelle, réduite à 800 unités de large au plus. Avancé du lot B parce qu'il loge naturellement dans le menu (voir PA-2).
- **Recadrer** quitte la barre pour les boutons de zoom (§12.3).

### 12.2 Sélection et Main

| Outil | Sur un objet | Dans le vide |
|---|---|---|
| **Sélection** (flèche, outil par défaut) | Clic : sélectionne (MJ, même verrouillé) ; glisser : déplace si permis | Clic : désélectionne ; glisser : déplace la vue (lot A), puis rectangle de sélection (lot C) |
| **Main** | Déplace la vue, ne touche jamais l'objet | Déplace la vue |

**Déplacer la vue avec tous les outils** :
- **Clic molette** maintenu et glissé ;
- **Espace** maintenu : curseur main, le glisser déplace la vue quel que soit l'outil, relâcher revient à l'outil ;
- **Deux doigts** : le pincement zoome déjà ; le déplacement de leur milieu déplace désormais aussi la vue.

Joueur : mêmes outils ; la Sélection ne sélectionne rien chez lui (pas d'action sur l'objet), elle déplace ce que la diapositive lui permet.

### 12.3 Coins du tableau

- **En haut à droite** : zoom **+**, **−**, **Recadrer**. Le zoom des boutons se fait autour du centre de la vue, par pas de ×1,25.
- **En bas à gauche** : **?** (Q-58). Au clic, une bulle liste les gestes et raccourcis, **selon le rôle et ce que la diapositive permet** (un joueur sans dessin ne voit pas « P : trait »). Fermée par Échap, clic ailleurs ou le même bouton.

Les deux restent dans le cadre du tableau (positionnés dans `vtt-board-stage`), discrets, avec le style des boutons d'outil (`vtt-board-tool`) : chaque slug les habille sans retouche.

### 12.4 Raccourcis clavier

| Touche | Action | Qui |
|---|---|---|
| V | Sélection | Tous |
| H | Main | Tous |
| P | Trait | Si dessin permis |
| R | Rectangle | Si dessin permis |
| E | Gomme | Si dessin permis |
| M | Règle | Avec la grille |
| Espace (maintenu) | Main temporaire | Tous |
| Suppr / Retour arrière | Supprimer l'objet sélectionné (sauf verrouillé) | MJ |
| Échap | Annule le geste en cours, sinon désélectionne | Tous |
| + / − / 0 | Zoom avant, arrière, recadrer | Tous |

- Actifs seulement **quand le pointeur est sur le tableau ou que le focus est dedans**, et **jamais dans un champ de saisie** : le MJ peut avoir deux tableaux montés (onglet et fenêtre flottante), et les lettres ne doivent pas gêner la saisie ailleurs (journal, notes).
- Ctrl+D (dupliquer) et Ctrl+Z arrivent avec les lots B et D.
- Chaque bouton d'outil rappelle son raccourci dans son infobulle (« Trait (P) »).

### 12.5 Liste des diapositives

- **Poignée ⠿** visible à gauche de chaque diapositive du panneau : c'est elle qu'on attrape (la ligne entière reste glissable, comme aujourd'hui).
- **Rail** : glisser-déposer des numéros, avec le même `useDragOrder`.
- **Désactiver depuis le tableau** (Q-61, sans confirmation) : une bascule « Tableau activé » en tête du panneau, une icône dans le rail. En fenêtre réduite (sans liste), la bascule va dans l'en-tête de la vue, à côté de « Montrer aux joueurs ». Tableau désactivé : l'avis actuel (« Tableau désactivé pour cette table… Activer ») reste.

### 12.6 En-tête de la vue (MJ)

- **« Les joueurs voient : <nom> »** quand le MJ édite une autre diapositive que celle montrée ; le nom est un lien qui l'ouvre. Rien quand c'est la même (le bouton « Ne plus montrer » le dit déjà). « Les joueurs ne voient rien » quand aucune n'est montrée.
- **Confirmation avant de montrer** (Q-60), au bouton de la vue comme à celui de la liste, seulement si la diapositive a un brouillard **réglé mais masqué** : « Le brouillard de « <nom> » est masqué : les joueurs verront toute la carte. » — **Montrer quand même** / Annuler (confirmation générique `useConfirm`).

### 12.7 Fichiers touchés

| Fichier | Changement |
|---|---|
| `features/board/BoardToolbar.jsx` | Outils Sélection / Main, groupes contextuels, menu « Ajouter ▾ », fenêtre du lien d'image, raccourcis dans les infobulles ; recadrer retiré |
| `features/board/BoardCanvas.jsx` | Outil `select` (l'actuel `hand`) et vraie `hand` ; clic molette, espace maintenu, déplacement à deux doigts ; zoom demandé de l'extérieur (boutons, touches) |
| `features/board/Board.jsx` | Raccourcis clavier (sur le cadre du tableau), coins zoom et « ? », « Les joueurs voient », confirmation avant de montrer, bascule d'activation en fenêtre réduite |
| `features/board/BoardHelp.jsx` | Nouveau : bouton « ? » et sa bulle, contenu selon le rôle et les droits |
| `features/board/SlideList.jsx` | Poignée ⠿, rail réordonnable, bascule d'activation, confirmation avant de montrer |
| `features/board/tools/boardGeometry.js` | Zoom et déplacement à deux doigts en une fonction pure (milieu et écart des doigts) |
| `src/client/tests/tools/boardGeometry.test.js` | Cas du déplacement à deux doigts |
| `features/board/board.css` | `vtt-board-corner`, `vtt-board-help*`, poignée ; menu en `vtt-menu` existant |
| `systems/*/theme.css` | Seulement si l'essai montre un coin ou la bulle mal habillés dans un slug |
| `spec_tableau.md` | État du lot |

### 12.8 Points à valider

| # | Point | Proposition | Réponse MJ                                                                     |
|---|---|---|--------------------------------------------------------------------------------|
| PA-1 | Outil par défaut à l'ouverture | Sélection, pour tout le monde (le comportement de l'actuelle « main ») | ok                                                                             |
| PA-2 | Lien d'image avancé du lot B dans le menu « Ajouter ▾ » | Oui : le serveur l'accepte déjà, c'est une fenêtre à un champ | ok                                                                             |
| PA-3 | Sélection, glisser dans le vide | Déplace la vue en lot A (comme aujourd'hui) ; deviendra le rectangle de sélection au lot C, la vue passant alors par la Main, l'espace, le clic molette ou deux doigts | oui ok                                                                         |
| PA-4 | « Tout couvrir / Tout dévoiler » seulement avec un outil de brouillard actif | Oui : ils n'ont de sens qu'en travaillant le brouillard ; « Brouillard affiché » reste toujours visible | oui                                                                            |
| PA-5 | « Tout effacer » hors du menu Ajouter, en bout de barre | Oui : une action destructrice ne se range pas sous « Ajouter » ; il rejoindra le menu contextuel « dans le vide » au lot C | oui                                                                            |
| PA-6 | Zoom en haut à droite (pas en bas : la zone d'actions de la plateforme est en bas à droite de la page, et l'onglet MJ du tableau descend jusque-là) | Oui | Oui                                                                            |
| PA-7 | Raccourcis seulement pointeur sur le tableau ou focus dedans, jamais dans un champ | Oui | ok                                                                             |
| PA-8 | Glisser-déposer des diapositives au doigt (tablette) : le glisser natif du navigateur ne marche pas au toucher, aujourd'hui comme demain | Laisser ainsi en lot A (réordonner se fait au poste du MJ) ; à reprendre si tu prépares sur tablette | oui après la tablette c'est pas l'usage le plus courant pour l'app aujourd'hui |
| PA-9 | Bascule d'activation en fenêtre réduite : dans l'en-tête de la vue | Oui : sans elle, le MJ en fenêtre réduite devrait repasser par l'onglet Session | oui                                                                            |
| PA-10 | Rien côté serveur, pas de test serveur ; un test front sur le déplacement à deux doigts | Oui | euh, rien côté server concernant quoi ? Les tests ? → précisé : le lot A ne touche pas au serveur (ni base, ni route, ni socket), donc rien à y tester ; oui |

**État au 2026-11-07** : lot A implémenté, non commité, à essayer en dev. Écarts et précisions par rapport au §12 :
- « Tableau activé / désactivé » : une pastille dont le libellé suit l'état (comme « Brouillard affiché / masqué »), plutôt qu'une case cochée seule, ambiguë quand le tableau est désactivé.
- **Retours du MJ après l'essai (2026-11-07)** :
  - « Ajouter ▾ » juste après les outils (il était en bout de barre), suivi d'un bouton **« Jetons des PJ · n »** toujours visible (n = PJ de la table sans jeton sur la diapositive, grisé à 0), retiré du menu. « Tout effacer » reste seul en bout de barre.
  - Activation à **un seul endroit** : la pastille de l'en-tête de la vue, dans tous les modes ; le bandeau « Tableau désactivé… Activer », la pastille de la liste et le bouton du rail sont retirés. Tableau désactivé, l'en-tête dit « Les joueurs ne voient pas le tableau ».
  - Dans la liste, un **œil** remplace « Montrer / Retirer » : ouvert et en couleur = montrée, barré = pas montrée ; infobulles « Montrer aux joueurs » / « Cacher aux joueurs ». Le badge « Montrée » est retiré (le liseré reste). Le bouton de l'en-tête dit aussi « Cacher aux joueurs ».
- Le menu « Ajouter ▾ » reprend le menu des lignes de l'audio (`features/audio/panel/RowMenu.jsx`) : déjà habillé par chaque slug, pas de copie.
- Raccourcis inactifs aussi quand le focus est dans une fenêtre ou un menu (ils s'y effaceraient mal).
- Clic molette et Main ne désélectionnent pas l'objet du MJ (seule la Sélection le fait).

---

## 13. Lot B — dessin et objets : spécification technique (phase 2, 2026-11-07)

Reprend les réponses Q-46 à Q-52 (§11.3, §11.4). Le lien d'image est déjà fait (lot A). Contrairement au lot A, **le serveur change** : quatre nouveaux types d'objets, la rotation (une colonne, donc une migration), la duplication et l'ordre d'affichage.

### 13.1 Nouveaux objets

| Type | Outil (touche) | Geste | `data` | Qui le pose |
|---|---|---|---|---|
| `ellipse` | Ellipse (O) | Glisser d'un coin à l'autre ; Maj : cercle (Q-46) | `{ color, filled, width? }` | Comme le rectangle : MJ, joueur si dessin ouvert |
| `line` | Ligne (L) | Glisser du départ à l'arrivée ; Maj : pas de 15° | `{ points: [x1, y1, x2, y2], color, width, arrow }` | Idem |
| `halo` | Halo (G) | Clic : taille par défaut ; glisser depuis le centre : rayon | `{ color }`, `w = h` = diamètre | Idem (PB-6) |
| `text` | Texte (T) | Clic : champ de saisie à l'endroit ; Entrée valide, Maj+Entrée va à la ligne, Échap annule | `{ text, color, size, background }` | Idem |

- **Rectangle et ellipse** (Q-46, P-10) : pleins légèrement transparents par défaut ; **« Plein / Contour »** dans la barre contextuelle, le contour prenant l'épaisseur choisie (`width`). Aujourd'hui le contour n'a pas de bouton : il arrive ici. Maj donne aussi un carré au rectangle.
- **Ligne** (Q-47) : un seul outil ; **« Flèche »** dans la barre contextuelle (pointe à l'arrivée), avec la palette et l'épaisseur.
- **Halo** (Q-48) : dégradé radial, couleur de la palette à 60 % d'opacité au centre, transparent au bord. Taille par défaut : 3 cases de rayon avec la grille, 150 unités sans. Dessiné sous les jetons et les icônes, au-dessus des images (il éclaire la carte, pas les pions).
- **Texte** (Q-50) : taille par défaut lisible au zoom courant (environ 20 px à l'écran), puis par la poignée ; couleur de la palette ; **« Fond »** dans la barre contextuelle (fond clair semi-transparent). 500 caractères au plus. La police est celle du slug.
- Barre contextuelle selon l'outil : palette pour tous ; épaisseur pour Trait, Ligne et le contour ; « Plein / Contour » pour Rectangle et Ellipse ; « Flèche » pour Ligne ; « Fond » pour Texte.

### 13.2 Actions sur l'objet sélectionné (MJ)

La barre de sélection actuelle (Verrouiller, Supprimer) s'enrichit :

| Action | Objets | Comportement |
|---|---|---|
| **Dupliquer** (Ctrl+D) | Tous sauf les jetons des PJ | Copie décalée d'une case (20 unités sans grille), sélectionnée ; une image déposée n'est pas recopiée, les deux objets partagent la même image (Q-51 : MJ seul) |
| **Premier plan** / **Arrière-plan** | Tous | Tout au-dessus ; ou tout en dessous, mais **au-dessus des fonds verrouillés** (sinon l'objet disparaîtrait sous l'image de fond) |
| **Rotation** | Images, icônes, textes, rectangles, ellipses (Q-52) | Poignée ronde au-dessus de la sélection ; Maj : pas de 15° ; ni jetons, ni traits, ni lignes, ni halos |
| **Filtres** | Images (Q-49) | Bouton « Filtres » : préréglages Normal, Nuit, Sombre, Sépia, Délavé, et trois curseurs (luminosité, contraste, saturation) ; aperçu immédiat chez le MJ, enregistré et diffusé au lâcher du curseur |
| **Modifier le texte** | Textes | Double-clic avec la Sélection : le champ de saisie se rouvre |

Le menu contextuel du lot C reprendra ces actions ; d'ici là, elles vivent dans la barre de sélection.

### 13.3 Serveur

**Base** (`board-schema.sql` et migration `database-template/migrations/DDMMYYYY_board_rotation.sql`, `-- systems: board`) :

```sql
alter table board_items add column rotation REAL not null default 0;   -- degrés, sens horaire, autour du centre
```

**Route** (`routes/board.js`) :
- `KINDS` : + `ellipse`, `line`, `halo`, `text` ; `PLAYER_DRAW_KINDS` : + les quatre (posés et effacés par un joueur si le dessin est ouvert).
- `cleanData` : les quatre nouveaux types (couleur, booléens, `text` ≤ 500 caractères, `size` et `width` bornés) ; `rect` garde `width` ; `image` garde `imageId` (aujourd'hui seule l'adresse passe, ce qui interdirait de modifier une image déposée) et `filter: { preset, brightness, contrast, saturation }` (bornés).
- Une `line` calcule sa boîte depuis ses deux points, comme un trait.
- `PATCH /items/:id` accepte `rotation` (droits du déplacement, verrou respecté) et `order: 'front' | 'back'`, calculé par le serveur (renumérote les `z` si besoin, dans une transaction).
- `POST /sessions/:sid/items/:id/duplicate` (MJ) : copie la ligne avec le décalage, `z` au-dessus de tout ; refusée pour un jeton de PJ (un PJ, un jeton).
- Le relais `board-drag` (`socket/platform/board.js`) transmet aussi `rotation`, pour la voir tourner en direct.

### 13.4 Client

| Fichier | Changement |
|---|---|
| `features/board/BoardCanvas.jsx` | Rendu des quatre types, de la rotation (`transform` autour du centre) et des filtres (`filter` CSS sur l'image) ; gestes des nouveaux outils, Maj ; poignée de rotation ; double-clic sur un texte |
| `features/board/BoardTextInput.jsx` | Nouveau : champ de saisie posé sur le cadre à l'endroit du texte, mesure du texte (largeur, hauteur) à la validation |
| `features/board/BoardToolbar.jsx` | Outils Ligne, Ellipse, Halo, Texte ; options contextuelles (Plein / Contour, Flèche, Fond) |
| `features/board/BoardImageFilters.jsx` | Nouveau : préréglages et curseurs, dans une bulle comme l'aide |
| `features/board/Board.jsx` | Barre de sélection enrichie, Ctrl+D |
| `features/board/hooks/useBoardSlide.js` | `duplicateItem`, `reorderItem` ; rotation dans `emitDrag` |
| `features/board/tools/boardGeometry.js` | Toucher un objet tourné, point d'une ligne à 15°, angle de la poignée de rotation |
| `features/board/tools/boardRights.js` | `PLAYER_DRAW_KINDS` aligné sur le serveur ; ce qui tourne, ce qui se duplique |
| `features/board/tools/boardFilters.js` | Nouveau, pur : préréglages → valeurs, valeurs → `filter` CSS |
| `features/board/board.css` | Champ de texte, bulle des filtres, poignée de rotation |

### 13.5 Tests

- Serveur (`tests/server/routes/board.test.js`) : nouveaux types (données refusées, droits du joueur selon le dessin), rotation (verrou, droits), ordre (arrière-plan au-dessus des fonds verrouillés), duplication (image partagée qui survit à la suppression d'une copie, jeton de PJ refusé).
- Front : `boardGeometry.test.js` (objet tourné touché ou non, angle à 15°), `boardFilters.test.js` (préréglages, bornes), `boardRights.test.js` (nouveaux types).

### 13.6 Points à valider

| # | Point | Proposition | Réponse MJ                                                                                                                                                                         |
|---|---|---|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| PB-1 | Rotation : une **colonne** `rotation` (migration de `board.db`), ou un champ de `data` (pas de migration) ? | Colonne : c'est de la géométrie comme x, y, w, h ; elle passe par les mêmes droits (déplacement) et le même relais en direct. Un champ de `data` ne serait modifiable que par le MJ et mélangerait géométrie et apparence | ok pour la reco, je pense en effet qu'il faut différencier géométrie du reste                                                                                                      |
| PB-2 | Touches des nouveaux outils : L ligne, O ellipse, G halo (*glow*), T texte | Oui (H est déjà la Main) | Ok                                                                                                                                                                                 |
| PB-3 | Dupliquer : route serveur dédiée plutôt qu'une copie refaite par le navigateur | Oui : une image déposée ne peut pas être reposée par l'adresse d'un objet ; le serveur la partage sans la recopier | ok reco                                                                                                                                                                            |
| PB-4 | Jeton de PJ non duplicable | Oui : un PJ, un jeton (le bouton « Jetons des PJ » compterait faux) | oui non duplicable                                                                                                                                                                 |
| PB-5 | Arrière-plan : au-dessus des fonds verrouillés, pas tout en dessous | Oui | ok reco                                                                                                                                                                            |
| PB-6 | Halo posé par les joueurs quand le dessin est ouvert ? | Oui : c'est un dessin comme un autre ; il s'efface à la gomme | oui                                                                                                                                                                                |
| PB-7 | Texte d'un joueur : modifiable après coup ? | Non : il l'efface et le réécrit (le MJ seul modifie un objet, comme aujourd'hui pour les couleurs) | hmmm, oui ok                                                                                                                                                                       |
| PB-8 | Halo : sous les jetons et icônes, au-dessus des images, quel que soit l'ordre de pose | Oui : sinon une torche posée après le jeton le voilerait | ok                                                                                                                                                                                 |
| PB-9 | Filtres : enregistrés au lâcher du curseur (aperçu immédiat chez le MJ seulement) | Oui : pas de flot d'écritures pendant qu'il règle | ok                                                                                                                                                                                 |
| PB-10 | Recolorer un objet déjà posé | Pas dans le lot B : il rejoindra le menu contextuel du lot C | ok                                                                                                                                                                                 |
| PB-11 | Bouton « Masquer la liste » des diapositives : même œil barré que « pas montrée » | Le remplacer par une flèche « ‹ » | Non, c'est pas grave ça, on comprend clairement que c'est pas la même fonctionnalité. Et si tu fais ça, on fait quoi concernant le brouillard et les boutons qui y sont associés ? → gardé tel quel |

**État au 2026-11-07 (soir)** : lot B implémenté, non commité, à essayer en dev après la migration `07112026_board_rotation.sql` sur la base de dev du tableau. Précisions :
- Déplacer un trait ou une ligne décale désormais ses points côté serveur : jusqu'ici, un trait déplacé par le MJ gardait son dessin à l'ancienne place (sa boîte seule bougeait). Corrigé avec la ligne, qui partage ce mode de stockage.
- Un objet tourné se redimensionne autour de son centre (un objet droit garde son coin haut gauche fixe).
- Texte modifié jusqu'à le vider : il est effacé.
- **Barre de sélection en surimpression** dans le coin haut gauche du cadre (filtres compris) : en apparaissant au-dessus du cadre, elle décalait la vue, si bien que le second clic d'un double-clic (modifier un texte) tombait à côté. Constaté à l'essai à l'écran.
- Nouveaux fichiers : `BoardTextInput.jsx`, `BoardImageFilters.jsx`, `features/board/tools/boardFilters.js` (et son test) ; migration `07112026_board_rotation.sql`.
- Essayé et validé par le MJ le 2026-11-07.

---

## 14. Lot C — objets avancés : spécification technique (phase 2, 2026-11-07)

Reprend Q-53 (objets cachés, pastille), Q-56 (groupes simples, sans attache), Q-57 (menu contextuel sur un objet et dans le vide), PA-3 (le glisser dans le vide devient le rectangle de sélection), PA-5 (« Tout effacer » dans le menu du vide), PB-10 (recolorer). Les marqueurs d'état restent hors v2 (Q-54).

### 14.1 Sélection multiple (MJ)

| Geste | Effet |
|---|---|
| Glisser dans le vide avec la Sélection | Rectangle de sélection : sont pris les objets **entièrement** dedans (PC-3) |
| Maj + clic | Ajoute l'objet à la sélection, ou l'en retire |
| Ctrl+A | Tout sélectionner sur la diapositive |
| Échap, clic dans le vide | Tout désélectionner |
| Glisser un objet sélectionné | Déplace toute la sélection, en direct chez tous |

- **La vue** ne se déplace plus en glissant dans le vide avec la Sélection : Main, espace maintenu, clic molette ou deux doigts (PA-3, comme convenu).
- **Sur une sélection de plusieurs objets** : déplacer, dupliquer, premier plan / arrière-plan (l'ordre entre eux est gardé), couleur, cacher / montrer, verrouiller / déverrouiller, grouper, supprimer. Redimensionner, tourner, filtres et modifier un texte restent réservés à un objet seul.
- La barre de sélection (coin haut gauche) indique « 3 objets » et propose les mêmes actions.

### 14.2 Groupes simples (Q-56)

- **Grouper** (deux objets ou plus sélectionnés) : un clic sur n'importe quel morceau sélectionne tout le groupe, et le glisser déplace tout le groupe.
- **Dégrouper** : les morceaux redeviennent indépendants. Pour retoucher un morceau (la couleur de la torche), on dégroupe, on règle, on regroupe (choix du MJ, pas de double-clic dans le groupe).
- Grouper des objets déjà groupés les réunit en un seul groupe ; dupliquer un groupe donne un nouveau groupe.
- **Joueur** (PC-4) : s'il peut déplacer un morceau (son jeton, une icône, si la diapositive le permet), le glisser emmène tout le groupe, torche comprise. Il ne voit pas les groupes autrement.
- Supprimer un morceau ne touche pas les autres ; un groupe réduit à un seul objet n'est plus un groupe.

### 14.3 Objets cachés (Q-53)

- **Cacher aux joueurs** / **Montrer aux joueurs** : action du menu et de la barre, sur un objet ou une sélection.
- **MJ** : l'objet caché est à moitié transparent, avec une pastille « œil barré » dans son coin haut droit.
- **Joueur** : l'objet n'est ni dessiné, ni touchable (gomme, déplacement, ping dessus sans effet particulier).
- Un objet posé est visible par défaut. « Jetons des PJ » compte aussi les jetons cachés (ils sont posés).

### 14.4 Menu contextuel (Q-57)

Clic droit (ordinateur). Sur tablette, la barre de sélection en tient lieu ; l'appui long reste le ping.

**Sur un objet** (MJ ; il entre dans la sélection s'il n'y était pas) :

| Action | Remarque |
|---|---|
| Dupliquer (Ctrl+D) | Sauf jetons des PJ |
| Premier plan / Arrière-plan | |
| Couleur ▸ | Palette fixe ; trait, ligne, formes, halo, texte, icône, jeton de PNJ (PC-6) |
| Filtres… | Image seule |
| Modifier le texte | Texte seul |
| Cacher aux joueurs / Montrer aux joueurs | |
| Grouper / Dégrouper | Selon la sélection |
| Verrouiller / Déverrouiller | |
| Supprimer | Sauf verrouillé |

**Dans le vide** :

| Action | Qui |
|---|---|
| Ajouter ici ▸ : Image…, Lien d'image…, Icône…, Jeton de PNJ…, Texte, Jetons des PJ (PC-7) | MJ |
| Ping ici | Tous |
| Recadrer | Tous |
| Tout effacer (sauf verrouillé) | MJ (PA-5) |

**Joueur** (PC-5) : dans le vide, Ping ici et Recadrer ; sur un dessin, Effacer si le dessin est ouvert.

Le menu reprend l'habillage des menus du slug (`vtt-menu`), placé au point du clic et rendu dans l'emplacement à modales (sinon rogné par la fenêtre flottante).

### 14.5 Serveur

**Base** (`board-schema.sql` et migration `database-template/migrations/07112026_board_hidden_groups.sql`, `-- systems: board`) :

```sql
alter table board_items add column hidden   INTEGER not null default 0;   -- caché aux joueurs (Q-53)
alter table board_items add column group_id INTEGER;                      -- groupe simple (Q-56) ; null : seul
```

`group_id` reprend l'identifiant d'un des morceaux au moment de grouper : ce n'est qu'une étiquette commune, pas une clé vers une autre table.

**Route** (`routes/board.js`) :
- `PATCH /items/:id` accepte `hidden` (MJ seul, verrou respecté).
- `PATCH /sessions/:sid/slides/:id/items` `{ items: [{ id, x?, y?, hidden?, locked?, data? }], order? }` (nouveau) : plusieurs objets en une écriture, **tout ou rien** (transaction), une seule diffusion. Mêmes droits que le `PATCH` d'un objet, sauf PC-4 : un joueur qui déplace un morceau qu'il peut déplacer emmène les autres morceaux de son groupe, et seulement eux.
- `POST /sessions/:sid/slides/:id/group` `{ ids }` et `POST …/ungroup` `{ ids }` (MJ).
- `POST /sessions/:sid/slides/:id/items/duplicate` `{ ids }` (MJ) : la duplication d'un objet devient un cas de celle-ci ; les groupes copiés reçoivent un nouveau `group_id`.
- `POST /sessions/:sid/slides/:id/items/remove` `{ ids }` (nouveau, mêmes droits que l'effacement d'un objet ; le verrouillé est ignoré) : supprimer une sélection. « Tout effacer » reste tel quel.
- Relais `board-drag` : accepte une liste `items: [{ itemId, x, y }]` pour un groupe ou une sélection, en un seul message.
- Les objets cachés partent à tous les membres de la room, comme le reste : c'est le client du joueur qui ne les dessine pas (PC-2).

### 14.6 Client

| Fichier | Changement |
|---|---|
| `features/board/BoardCanvas.jsx` | Sélection multiple (rectangle, Maj+clic), déplacement d'une sélection ou d'un groupe, objets cachés (transparence et pastille chez le MJ, absents chez le joueur), clic droit |
| `features/board/BoardContextMenu.jsx` | Nouveau : menu au point du clic, sur un objet ou dans le vide, selon le rôle |
| `features/board/Board.jsx` | Sélection en liste d'identifiants, barre de sélection pour plusieurs objets (couleur, cacher, grouper), Ctrl+A ; actions partagées avec le menu |
| `features/audio/panel/RowMenu.jsx` | Rien, ou un point d'ancrage au lieu d'un bouton si le menu contextuel le réutilise (à voir à l'écriture, sans changer son comportement pour l'audio) |
| `features/board/hooks/useBoardSlide.js` | `patchItems`, `groupItems`, `ungroupItems`, `duplicateItems`, `removeItems` ; relais d'une liste |
| `features/board/tools/boardGeometry.js` | Objets entièrement dans un rectangle (rotation comprise) |
| `features/board/tools/boardSelection.js` | Nouveau, pur : sélection étendue au groupe, Maj+clic, ce que permet une sélection (une ou plusieurs, verrouillés, couleurs) |
| `features/board/tools/boardRights.js` | Objet visible du rôle (caché), objet recolorable |
| `features/board/board.css` | Rectangle de sélection, objet caché et sa pastille, menu au point du clic |

### 14.7 Tests

- Serveur : écriture groupée tout ou rien (un objet verrouillé ou interdit fait tout refuser), joueur qui emmène son groupe (PC-4) mais pas d'autres objets, cacher réservé au MJ, grouper / dégrouper, duplication d'un groupe (nouveau groupe), suppression d'une sélection (verrouillé ignoré).
- Front : `boardSelection.test.js` (groupe étendu, Maj+clic, actions permises), `boardGeometry.test.js` (contenu dans un rectangle, objet tourné), `boardRights.test.js` (caché selon le rôle, recolorable).

### 14.8 Points à valider

| # | Point | Proposition | Réponse MJ                                                                                    |
|---|---|---|-----------------------------------------------------------------------------------------------|
| PC-1 | Caché et groupe : deux **colonnes** (migration), comme la rotation | Oui : ni de la géométrie ni de l'apparence, ce sont des états de l'objet, lus à chaque dessin et à chaque toucher | c'est vraiment une question ça ? ça me semble évident qu'il faut l'ajouter oui                |
| PC-2 | Objets cachés : envoyés à tous, **pas dessinés** chez le joueur (un joueur curieux pourrait les lire dans les outils du navigateur) | Oui : c'est la règle de la plateforme (la visibilité des infos du MJ est filtrée côté client) et ça évite deux versions de chaque diffusion | osef donc oui                                                                                 |
| PC-3 | Rectangle de sélection : objets **entièrement** dedans, ou **touchés** ? | Entièrement : on ne ramasse pas l'image de fond ou une grande zone par accident | entièrement    + multi sélection avec Maj/shift non ?                                         |
| PC-4 | Joueur et groupe : glisser son jeton emmène tout le groupe (torche comprise, qu'il ne pourrait pas déplacer seule) | Oui : c'est le cas d'usage de la torche ; sinon il faudrait que le MJ suive chaque déplacement | oui                                                                                           |
| PC-5 | Menu du joueur : Ping ici, Recadrer ; Effacer sur un dessin si le dessin est ouvert | Oui | oui + grouper quand multi sélection + premier plan/arrière plan  + ajouter ici avec sous menu |
| PC-6 | Couleur : objets qui en ont une (trait, ligne, formes, halo, texte, icône, jeton de PNJ) ; ni image, ni jeton de PJ | Oui | oui                                                                                           |
| PC-7 | « Ajouter ici ▸ » pose à l'endroit du clic (image, lien, icône, jeton de PNJ, texte, jetons des PJ) | Oui ; le menu « Ajouter ▾ » de la barre garde sa place en haut à gauche du contenu | oui enfin pour moi c'est avec le menu contextuel ça                                           |
| PC-8 | Redimensionner, tourner, filtres, modifier un texte : un objet seul (pas une sélection ni un groupe) | Oui en v2 ; un groupe se règle dégroupé (Q-56) | oui                                                                                           |
| PC-9 | Pas de copier / coller entre diapositives | Hors lot C : Dupliquer suffit sur une même diapositive ; à noter dans la todo si le besoin vient | bah à prévoir quand même ça → noté dans la todo (après la v2) |

**État au 2026-11-07 (nuit)** : lot C implémenté, non commité, à essayer en dev après la migration `07112026_board_hidden_groups.sql`. Précisions et écarts :
- PC-3 : Maj + rectangle **ajoute** à la sélection existante (Maj + clic l'était déjà).
- Le joueur garde le glisser dans le vide pour déplacer la vue (il n'a pas de sélection) ; seul le MJ trace un rectangle de sélection.
- « Jetons des PJ » accepte un point de départ (« Ajouter ici ») : la route des jetons des PJ prend `x, y` facultatifs.
- Le menu générique (`RowMenu`) s'ouvre aussi à un point de l'écran ; rien ne change pour l'audio.
- PC-5 : la réponse du MJ (« + grouper, premier plan / arrière-plan, ajouter ici ») est lue comme le contenu du menu du MJ, déjà prévu ; le menu du joueur reste Ping ici, Recadrer, Effacer (confirmé par le MJ le 2026-11-08, « pour l'instant »).
- Essai à l'écran (2026-11-08) : rectangle de sélection, grouper et déplacer le groupe, cacher (transparence et pastille), menus sur un objet et dans le vide, « Ajouter ici ▸ Texte », couleur sur une sélection. Pastille d'un objet rond (halo, jeton) placée sur le cercle plutôt qu'au coin de sa boîte, loin de la lueur.
- Nouveaux fichiers : `BoardContextMenu.jsx`, `features/board/tools/boardSelection.js` (et son test) ; migration `07112026_board_hidden_groups.sql`.

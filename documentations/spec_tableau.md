# Spec — Tableau partagé (visuels, croquis, jetons)

> Version 0.3 — Phase 2 : spécification technique  
> Statut : **Brainstorming terminé (§7, §9). Spécification technique validée (§10, points P-1 à P-12 tranchés le 2026-11-04). Implémentation sur feu vert du MJ**  
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

Nom de travail proposé : **tableau** (classes `vtt-board*`, code `components/board/`). Voir Q-1.

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
- **Client** : `components/board/`, montage dans `PlayerPage` / `GMPage`, élément d'activation pour `TabSession`, classes `vtt-board*` dans `index.css`.
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
- **Bibliothèque** : choisir une icône se fait par **recherche** et par **catégories** (Q-44). Sélection à valider sur la page de prévisualisation `documentations/tableau/icones_preview.html` : 162 icônes candidates en 8 catégories, recherche en français et en anglais, palette fixe de 8 couleurs, mise en situation jetons / icônes sur un plan.

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
- **Sélecteur** (`IconPicker`) : index chargé à la première ouverture ; recherche sans accents sur le nom et les tags (`normalizeText` de `tools/catalog.js`), catégories = groupes de tags plus « Divers » ; 120 résultats affichés au plus, le reste par « Voir plus ». Chaque icône est un `<img>` du fichier SVG, mis en cache par le navigateur.
- Sur le tableau, l'icône est rendue en ligne dans le SVG (contenu du fichier, chargé une fois et gardé en mémoire), pour prendre sa couleur.
- **Crédits** (CC BY 3.0) : une ligne en pied de la page d'accueil de la plateforme (`HomePage.jsx`) et un paragraphe dans le `README.md`.

### 10.8 Client

| Fichier | Rôle |
|---|---|
| `hooks/useBoardSession.js` | Table : `{ loaded, enabled, shownSlideId, grid, keep, purgeAt, size, slides }` au chargement et à la reconnexion, écoute `board-session` / `board-slides`, actions du MJ |
| `hooks/useBoardSlide.js` | Diapositive : `{ slide, items }`, écoute `board-items` / `board-fog` / `board-drag` / `board-ping`, actions (poser, déplacer, effacer…) avec mise à jour immédiate à l'écran |
| `hooks/useBoardImages.js` | Cache des images de la page (id → adresse locale), libérées au démontage |
| `tools/boardGeometry.js` | Pur : écran ↔ tableau, zoom autour du pointeur, boîte englobante, simplification d'un trait (Ramer-Douglas-Peucker) |
| `tools/boardGrid.js` | Pur : cascade de la grille, distance mesurée, format (« 4,5 m ») |
| `tools/boardRights.js` | Pur : ce qu'un rôle peut faire d'un objet sur une diapositive (§10.2), pour griser les outils |
| `tools/imageResize.js` | Pur côté navigateur : réduction et recompression d'une image, sorti de `RichTextEditor.jsx`, qui l'importe désormais (P-8) |
| `components/board/BoardLayer.jsx` | Monté par `GMPage` et `PlayerPage` (comme `AudioLayer`) : rien si le tableau est désactivé (joueur) ; `ZoneAction` « Tableau » (`board`, `highlighted` si une nouvelle diapositive n'a pas été vue) ; bandeau « Le MJ partage un visuel · Voir » (Q-6) ; mode réduit en `FloatingPanel` (mémorisé par slug, fermable) ; joueur : bascule plein écran |
| `components/board/Board.jsx` | **Le composant à poser par un slug dans un onglet**, joueur ou MJ (Q-5) : `<Board sessionId role />`. Assemble la vue, la barre d'outils et, pour le MJ, la liste des diapositives |
| `components/board/BoardCanvas.jsx` | Vue SVG : fond, objets, traits, brouillard (masque ; transparent pour le MJ), grille, règle, pings ; zoom (molette, pincement), déplacement de la vue, poignées de redimensionnement |
| `components/board/BoardToolbar.jsx` | Outils : main, trait, rectangle, gomme, règle (si grille), palette fixe ; MJ : image, icône, jeton, PJ, brouillard, verrou |
| `components/board/SlideList.jsx` | MJ : diapositives (glisser-déposer par `useDragOrder`), « Montrer », réglages, dupliquer, supprimer, taille, purge et « À conserver » |
| `components/board/IconPicker.jsx` | Sélecteur d'icônes (§10.7), dans une `HostedModal` |
| `components/board/BoardSessionToggle.jsx` | Élément d'activation pour `TabSession`, comme `AudioSessionToggle` (`label`, `icon`, `className`) |

- Palette fixe de 8 couleurs (celle de la prévisualisation), dans `tools/boardGrid.js` ou un petit `tools/boardPalette.js`.
- Couleur de ping d'un participant : tirée de la palette à partir de son identifiant (stable).
- Stockage navigateur : mode joueur (réduit / plein écran) et ouverture du mode réduit par slug (`vtt:<slug>:board`), position de la fenêtre par `FloatingPanel` ; vue (zoom, cadrage) non mémorisée.
- Habillage : classes `vtt-board*` dans `index.css` (`@layer components`, variables `--color-*`), fenêtre en `vtt-floating-*`, menus en `vtt-menu*`, boutons en `vtt-btn` : le tableau reprend l'habillage déjà fait par chaque slug ; Vikings en pilote.

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
| `src/client/src/hooks/useBoard*.js`, `src/client/src/tools/board*.js`, `tools/imageResize.js`, `components/board/*` | Nouveaux |
| `src/client/src/components/shared/RichTextEditor.jsx` | Import de `imageResize.js` au lieu de sa copie (P-8) |
| `src/client/src/pages/GMPage.jsx`, `PlayerPage.jsx` | Montage de `BoardLayer` |
| `src/client/src/index.css` | Style par défaut `vtt-board*` |
| `src/client/src/pages/HomePage.jsx`, `README.md` | Crédits des icônes |
| `src/client/src/systems/vikings/gm/tabs/TabSession.jsx`, `systems/vikings/GMApp.jsx`, `systems/vikings/theme.css` | Pilote (P-7) |
| `src/client/tests/tools/board*.test.js`, `tests/server/routes/board.test.js` | Nouveaux |
| `CLAUDE.md`, `src/client/CLAUDE.md`, `src/server/CLAUDE.md`, `/new-slug` | Brique tableau |

### 10.12 Points à valider

| # | Point | Proposition | Réponse MJ |
|---|---|---|---|
| P-1 | **Relais temps réel émis par le client** (`board-drag`, `board-ping`) : aujourd'hui, seul `audio-ping` part du client, et en lecture seule. Ici le serveur relaie à la room sans rien écrire. Sans ça, un déplacement « en direct » (Q-11) demanderait une requête HTTP à chaque mouvement, et le ping un enregistrement inutile | Oui : relais sans écriture, la position définitive passant toujours par le `PATCH` qui vérifie les droits | Oui, relais socket. Ce qui est à proscrire, c'est un slug qui émet lui-même alors que les sockets sont branchés ailleurs ; une brique de la plateforme qui émet depuis ses propres hooks est le cas standard. Les émissions vivent donc dans `hooks/useBoardSlide.js`, jamais dans le code d'un slug |
| P-2 | Un trait d'un autre participant apparaît **à la fin du geste** (au lâcher), pas pendant qu'il le trace | Oui en v1 ; le tracé en direct pourra passer plus tard par le même relais | Oui, à la fin, au moins pour la v1 |
| P-3 | Icônes : posées par le MJ seulement, comme images et jetons ? | Oui en v1 ; les joueurs dessinent, déplacent (si permis) et pingent | Oui |
| P-4 | Gomme des joueurs : traits et rectangles seulement (jamais images, icônes, jetons) ; « Tout effacer » réservé au MJ | Oui | Oui |
| P-5 | « Utilisé » pour la purge = diapositive montrée ou écriture sur le tableau ; ouvrir le tableau ne compte pas (sinon la mention ne s'affiche jamais) ; mention à moins de 14 jours | Oui | Oui, sauf si on ouvre un tableau qui devrait être supprimé : ça vaut prolongation (§10.6) |
| P-6 | Icônes **dans le dépôt** (`public/board/icons/`, 4 180 fichiers, ~6,5 Mo), plutôt que téléchargées à l'installation | Oui : l'index retouché à la main vit avec elles, la release ne change pas | Oui, 7 Mo ce n'est pas la mort |
| P-7 | Pilote Vikings : élément d'activation dans `TabSession` et **onglet « Tableau » dans `GMApp`** ; côté joueur, le tableau de la plateforme seul (bascule et mode réduit), sans onglet dans la fiche | Oui | Oui |
| P-8 | Sortir la réduction d'image de `RichTextEditor.jsx` dans `tools/imageResize.js`, partagé avec le tableau (le journal l'importe, comportement inchangé) | Oui, plutôt qu'une seconde copie | Oui |
| P-9 | Ménage des tables disparues au chargement par le MJ, comme l'audio | Oui | Oui |
| P-10 | Rectangle (Q-34, resté sans réponse sur ce point) : plein et légèrement transparent par défaut, contour en option | Oui | Oui |
| P-11 | Annuler (Ctrl+Z) : hors v1 (Q-22 : pas obligatoire) | Hors v1 | Pour après, hors v1 |
| P-12 | Règle : la mesure reste locale à celui qui mesure (pas diffusée aux autres) | Oui en v1 ; une mesure partagée passerait par le relais | Oui |

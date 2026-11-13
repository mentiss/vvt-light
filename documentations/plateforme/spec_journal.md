# Journal (notes, messages et objets du MJ)

## Statut

**Validée par le MJ le 2026-10-18** (décisions au §1, questions Q-1 et Q-2 au §5). Lots A et B implémentés.

Brique de plateforme : concerne tous les slugs (onglet Journal du joueur, onglet Journal du MJ, modale d'envoi de message du MJ).

Fichiers concernés :
- `src/client/src/features/journal/JournalTab.jsx` (journal du joueur, réutilisé par le MJ via `features/journal/TabJournal.jsx` avec le personnage -1) ;
- `src/client/src/ui/text/RichTextEditor.jsx` et `.css` (éditeur TipTap) ;
- `src/client/src/features/table/modals/GMSendModal.jsx` (envoi de message) ;
- `src/client/src/features/table/ToastNotifications.jsx` (notification d'un message reçu) ;
- `src/server/routes/journal.js` (inchangé, sauf mention contraire).

Hors périmètre : stockage des images en fichiers sur le serveur (les images restent dans le texte des notes), structure de la table `character_journal` (aucune migration).

---

## 1. Décisions du diagnostic (validées le 2026-10-18)

| # | Sujet | Décision |
|---|---|---|
| D-1 | Modale d'envoi de message | Le champ Message devient l'éditeur de texte riche du journal ; une note choisie « depuis mes notes » s'y affiche mise en forme. Le champ « Image (optionnel) » séparé est **retiré** : les images s'insèrent dans le texte. |
| D-2 | Poids des images | Réduction automatique à l'insertion, et message d'erreur visible quand un enregistrement échoue. |
| D-3 | Périmètre | Lot A : défauts J-1 à J-6 et D-1. Lot B : habillage du journal (J-7). |

---

## 2. Lot A — corrections

### 2.1 Image d'une note affichée dans une autre (signalé par le MJ)

**Constat** : après avoir ouvert une note contenant une image, les autres notes qui ont aussi une image affichent celle de la première à la place de la leur.

**Cause** : l'extension Image de TipTap (3.22.3), avec le redimensionnement activé, réutilise l'image déjà affichée quand le contenu change, sans mettre à jour sa source. Au changement de note, l'éditeur remplace le contenu ; une image qui se trouve au même endroit dans la nouvelle note garde donc l'ancienne image à l'écran (le texte enregistré, lui, est correct).

**Correction** : l'éditeur reconstruit l'affichage d'une image dès que sa source change. L'image affichée est toujours celle de la note ouverte, en édition comme en lecture seule.

### 2.2 J-1 — Une note consultée est marquée modifiée

Au changement de note, l'éditeur recharge le contenu sans le signaler comme une saisie. Une note simplement ouverte n'est plus renvoyée au serveur : sa date de modification et sa place dans la liste ne bougent plus.

### 2.3 J-2 — Images trop lourdes (D-2)

- À l'insertion (bouton, glisser-déposer, coller), l'image est réduite à **1600 px** sur son plus grand côté si elle dépasse, en gardant son format (JPEG, PNG, WebP). Les GIF sont gardés tels quels (animation), dans la limite de 5 Mo.
- Si l'enregistrement d'une note échoue (taille, réseau, serveur), une alerte le signale : « La note n'a pas pu être enregistrée ». Aujourd'hui l'échec est silencieux et l'image disparaît au rechargement.
- Les images déjà enregistrées ne sont pas retouchées.

### 2.4 J-3 — Dates décalées

Les dates enregistrées par le serveur (heure UTC) sont lues comme telles : « Créée le / Modifiée le » et les filtres par date affichent l'heure locale correcte.

### 2.5 J-4 — Recherche et aperçu

- La recherche porte sur le texte des notes, pas sur leur code HTML.
- L'aperçu de la liste n'ajoute « … » que si le texte est réellement tronqué.

### 2.6 J-5 — Objets reçus

- Une entrée « objet reçu » s'affiche comme telle (libellé « Objet reçu », et non « Message du MJ »), avec l'objet : nom, quantité, catégorie, et la note du MJ s'il y en a une.
- Elle apparaît dans le journal en direct, comme les messages.

### 2.6 bis — Compteur de l'onglet Journal (signalé par le MJ après le lot A)

- Ouvrir un message ou un objet du MJ non lu le marque comme lu (côté serveur) et remet à zéro le compteur de l'onglet ; passer sur l'onglet le remet toujours à zéro. Marquer comme lu ne change pas la date de modification de l'entrée.
- Le compteur persistant (calculé au chargement à partir des entrées non lues, avec les non lus signalés dans la liste) est reporté au lot B.

### 2.7 J-6 — Code mort

Le double branchement de l'agrandissement d'image au double-clic est réduit à un seul (celui de l'éditeur) ; le hook `useImageLightbox`, alors inutilisé, est supprimé.

### 2.8 D-1 — Modale d'envoi de message

- Champ Message : éditeur de texte riche (mise en forme, images insérées, réduites comme en 2.3).
- « Depuis mes notes » : la note choisie remplit le titre et l'éditeur, mise en forme et images comprises. L'aperçu de la liste des notes affiche du texte, pas du HTML.
- Le champ « Image (optionnel) » et le glisser-déposer sur toute la modale sont retirés (le glisser-déposer se fait dans l'éditeur).
- Notification du joueur : elle affiche en aperçu la **première image** du message, à la place de l'image jointe qui disparaît.
- Les anciens messages reçus avec une image jointe continuent de l'afficher dans le journal.

---

## 3. Lot B — habillage du journal (J-7)

Même démarche que les modales génériques (`spec_ui_modales.md`) : classes stables `vtt-*` et style par défaut dans `app/styles/index.css` (`@layer components`), surcharges éventuelles dans le `theme.css` du slug.

- `JournalTab` : barre d'outils (recherche, filtres, nouvelle note), liste, panneau de détail et états vides sur les classes `vtt-*` existantes (`vtt-input`, `vtt-btn`, `vtt-pill`, `vtt-list-item`, `vtt-scroll`…) ; plus d'emojis ni de styles en ligne pour les couleurs.
- `RichTextEditor` : couleurs de l'éditeur (barre flottante, barre d'outils, titres, citations, sélection d'image, poignées de redimensionnement) sur les variables `--color-*`, au lieu de l'or de Vikings et du fond blanc codés en dur ; plus d'emoji sur le bouton Image.
- `ImageLightbox` (agrandissement d'une image) : bouton de fermeture et fond sur les mêmes conventions.
- Vikings : les surcharges déjà présentes dans son `theme.css` s'appliquent ; ajout éventuel des classes propres au journal si le rendu le demande.
- Compteur persistant de l'onglet Journal : calculé au chargement de la fiche à partir des entrées non lues (route `GET journal/:characterId/unread-count`), qui sont signalées dans la liste du journal (pastille, titre en gras). Le compteur baisse d'une unité à l'ouverture de chaque entrée non lue ; passer sur l'onglet ne le remet plus à zéro, sans quoi il réapparaîtrait au rechargement (remplace le comportement du 2.6 bis).

---

## 4. Vérifications

- `npm run lint`, `npm test`, `npm run build` (depuis `src/client`).
- Test unitaire de la lecture des dates du serveur (conversion, J-3).
- Contrôle par le MJ :
  - deux notes avec des images différentes : chacune affiche la sienne, en passant de l'une à l'autre ;
  - ouvrir une note sans la modifier : sa date de modification ne change pas ;
  - insérer une grande photo : elle est réduite, la note s'enregistre et l'image est toujours là au rechargement ;
  - envoyer un message depuis une note avec image : mise en forme et image arrivent chez le joueur, la notification montre l'image ;
  - envoyer un objet : il apparaît en direct dans le journal du joueur, comme objet reçu ;
  - lot B : journal sur Vikings et un slug sans surcharge, en jour et en nuit.

---

## 5. Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| Q-1 | Taille maximale des images après réduction ? | **1600 px** sur le plus grand côté : net en plein écran sur un écran courant, quelques centaines de Ko. | OK |
| Q-2 | Notification d'un message : afficher la première image du message ? | **Oui**, comme l'image jointe aujourd'hui. | OK |

---

# Partie II — Refonte du journal et journal de table (phase 1, 2026-11-13)

**Statut : phase 1 validée par le MJ le 2026-11-13 (§9) ; planche validée (v8) ; spec technique proposée (partie III).** Demande (backlog, 2026-11-12) : revoir l'aspect et les fonctions du journal pour le rendre plus agréable, et ajouter un journal de groupe / de table.

## 6. Ce qui existe (relevé dans le code)

- **Un seul composant** `features/journal/JournalTab.jsx` (520 lignes) : liste à gauche (repliable), détail à droite, recherche, filtres (table active / hors table / dates), nouvelle note. Le MJ a le même écran par `TabJournal` (personnage `-1`, le compte MJ de chaque base).
- **Une seule table** `character_journal` (`base.sql`) : `character_id`, `session_id` (= la **table** active au moment de la création, pas une séance), `type` (`note`, `gm_message`, `gm_item`), `title`, `body` (HTML, images en base64 dedans), `metadata`, `is_read`, dates.
- **Route commune** `src/server/routes/journal.js` : CRUD par personnage, `gm-send` (message à un ou plusieurs PJ), `gm-send-item` (objet ajouté à l'inventaire + entrée « Objet reçu »), compteur des non lus. Diffusion `gm-message-received` / `gm-item-received` dans la room de la table.
- **Envoi du MJ** : `GMSendModal` (éditeur riche, « depuis mes notes »), notification par `ToastNotifications`, compteur de l'onglet par `usePlayerSession`.
- **Un journal de groupe existe déjà, dans Fabula seulement** : la fiche de groupe (`spec_fabula.md` §7) a un bloc « Journal » (table `groupe_journal` : entrées personnage / créature / lieu, nom et notes), par table, lu et écrit par tous. La coterie de Vampire est une autre fiche de groupe, sans journal.

## 7. Constats

### 7.1 Défauts et limites techniques

| # | Constat | Effet |
|---|---|---|
| J2-1 | Enregistrement seulement à la perte du focus, sans indicateur. | Fermer l'onglet du navigateur en pleine saisie perd le texte ; le joueur ne sait jamais si c'est enregistré. |
| J2-2 | Hauteur codée `calc(100vh - 130px)` en style en ligne. | Le journal déborde ou laisse un vide selon l'en-tête et les marges du slug (chaque slug l'enveloppe différemment : `p-6`, `im-tab-page`, `nb-page`…). |
| J2-3 | La liste charge le corps complet de toutes les entrées, images en base64 comprises. | Ouverture de l'onglet de plus en plus lente avec le temps (un journal illustré pèse vite plusieurs Mo). |
| J2-4 | Le libellé « Session : X » désigne en fait la **table**. | Le mot trompe : un joueur pense « séance ». Aucune notion de séance n'existe. |
| J2-5 | Props ignorées passées par certains slugs (`sessionId`, `apiBase` chez Achtung, `characterId` à `TabJournal` chez Noctis, déjà au backlog). | Code mort (C-DEAD, F-CONTRACT). |
| J2-6 | Le MJ ne garde aucune trace de ce qu'il a envoyé (les messages vivent seulement chez les destinataires). | Impossible de relire « qu'est-ce que je leur ai donné comme indice ? ». |

### 7.2 Limites d'usage (UX)

- **Le journal est loin de la fiche** : c'est un onglet ; prendre une note pendant un jet ou une scène oblige à quitter la fiche (et beaucoup de fiches sont mono-onglet).
- **Aucune organisation** : une liste plate triée par dernière modification (modifier une vieille note la remonte en tête). Pas d'épingle, pas de catégorie, pas de regroupement par date.
- **Messages du MJ noyés dans les notes**, distingués par une petite étiquette.
- **Rien à partager** : une note du joueur reste privée, il ne peut ni la montrer au MJ ni à la table.
- **Aspect** : écran fonctionnel mais générique (habillé par les `vtt-*` en v5.2.0, sans identité propre ni surcharge dans les slugs récents).

## 8. Pistes

### 8.1 Journal personnel

| # | Piste | Apport | Coût |
|---|---|---|---|
| P-1 | **Enregistrement automatique** (quelques secondes après la frappe, et à la fermeture de la page) + indicateur « Enregistré / Enregistrement… / Échec ». | Corrige J2-1, rassure. | Faible |
| P-2 | **Journal en fenêtre flottante** (`FloatingPanel`, bouton dans la zone d'actions), en plus de l'onglet. | Noter sans quitter la fiche ; le plus gros gain d'usage. | Moyen |
| P-3 | **Épingler** une note (en tête de liste). | Garder sous la main objectifs, contacts, indices. | Faible (colonne) |
| P-4 | **Catégories** fixes de la plateforme (ex. Notes, Personnages, Lieux, Indices, Quêtes) ou **étiquettes libres**. | Retrouver ; filtrer. | Faible à moyen |
| P-5 | **Liste regroupée par jour** (« Ce soir », « 12 novembre »…) et triée par création, pas par modification. | Le journal se lit comme une chronique de séances, sans saisir de numéro de séance. | Faible |
| P-6 | **Boîte de réception** séparée pour les messages et objets du MJ (filtre ou section en tête quand il y a du non lu). | Les messages ne se noient plus. | Faible |
| P-7 | **Liste allégée** : la route renvoie un aperçu, le corps se charge à l'ouverture. | Corrige J2-3. | Faible à moyen |
| P-8 | **Partager une note** : copie vers le journal de table, ou envoi au MJ. | Fait le pont avec le journal de table. | Moyen |
| P-9 | ✦ **Liens entre entrées** (taper `@` ou `[[` pour citer une autre note ou une entrée de la table). | Wiki de campagne. | Élevé |

### 8.2 Journal de table (nouveau)

Un espace par **table** (comme la fiche de groupe de Fabula et la coterie de Vampire), commun aux joueurs de la table et au MJ, mis à jour en direct.

Contenus possibles :
- **Chronique** : résumés de séance (« ce qui s'est passé »), écrits par un joueur ou le MJ ;
- **Encyclopédie de campagne** : personnages rencontrés, lieux, factions, quêtes / objectifs en cours ;
- **Documents du MJ** : un document que le MJ prépare caché et **révèle** à la table au bon moment (lettre, carte, indice), au lieu de l'envoyer à chaque PJ un par un.

Questions de fond : qui écrit et modifie quoi, que se passe-t-il si deux personnes modifient la même entrée, qui supprime, et le recouvrement avec le bloc Journal de Fabula.

Données (pour la phase 2, à titre indicatif) : une table partagée dans `base.sql` (+ migration `all`), par `session_id`, avec auteur, catégorie, visibilité ; route commune `/api/journal/table/:sessionId` ; diffusion dans la room de la table. Pas de nouvelle base.

### 8.3 Lien avec l'inventaire de groupe

**Décidé (MJ, 2026-11-13)** : aucun lien. Ce sont deux fonctions différentes, en chantiers et en écrans séparés. Le journal de table vit **dans l'onglet Journal existant** (et dans la fenêtre flottante), sans onglet ajouté.

### 8.4 Graphisme

**Principe (rappel du MJ, 2026-11-13)** : tout le journal (onglet, bascule, fenêtre flottante, journal de table, curseurs des autres, liens `@`) est rendu par des **classes de plateforme `vtt-journal-*`** au style par défaut neutre, faciles à surcharger dans le `theme.css` de chaque slug ; aucune couleur en dur, aucun style en ligne pour l'apparence.

Planche : `documentations/plateforme/planches/planche_journal.html` (hors Git), **validée par le MJ le 2026-11-13 (v8)**.

**Point de vigilance (MJ, 2026-11-13)** : le menu de mise en forme à la sélection se place parfois n'importe où. À l'implémentation : l'ancrer sur `document.body` (la fenêtre flottante est un conteneur de requêtes de taille, un menu positionné dedans peut être décalé ou rogné, cf. `HostedModal`), le positionner sur la sélection avec retournement et décalage aux bords, et l'essayer sur les cas limites (sélection sur plusieurs lignes, triple-clic, éditeur défilé, sélection en partie hors de vue, fenêtre flottante près d'un bord).

Retours du MJ sur la planche v1 (2026-11-13), repris en v2 :
- fenêtre flottante transparente en Vikings pierre peinte : la planche n'avait pas la dalle dessinée par le slug (`watchPlatformSlabs`, qui couvre déjà `.vtt-modal-panel` dans l'app) ; **règle pour l'implémentation** : chaque nouveau conteneur du journal suit les mécanismes d'habillage des slugs (ex. menu `@` et menu de mise en forme ajoutés aux `SLAB_TARGETS` de Vikings, formes non rectilignes de la pierre peinte), vérifié slug par slug ;
- pastilles de la bascule qui débordaient : libellé tronqué, compteur toujours visible ;
- colonne de gauche **repliable**, comme aujourd'hui (rail avec la bascule et « + ») ;
- menu de mise en forme **à la sélection gardé**, comme aujourd'hui, dans l'onglet comme dans la fenêtre, avec tout le jeu actuel (dont le surligné) ; la barre de l'onglet garde l'image et les aides ;
- **filtre par date** rétabli (bouton « Filtres » : dates de création, et rattachement à une table pour le journal personnel).

Retours sur la planche v3 (2026-11-13), repris en v4 :
- compteur peu lisible sur un fond actif (segment, pastille) : couleurs inversées sur fond actif ;
- **les compteurs suivent l'état courant** : ouvrir une entrée non lue fait baisser tout de suite le compteur de l'onglet de la fiche, celui du bouton de la zone d'actions et celui de la bascule ;
- dates : deux champs Du / Au (R-23), puis retour à un champ unique rendu explicite (v5).

Retours sur la planche v5 (2026-11-13), repris en v6 :
- **onglet : barre d'outils complète en haut ET menu à la sélection** (les deux, même jeu de mise en forme) ; fenêtre flottante : menu à la sélection seul, faute de place ;
- Markdown (R-22) : « Copier en Markdown » dans le pied de chaque note (Privé et Partagé) ; « Exporter » (icône à côté de « Nouvelle note ») exporte **la liste affichée**, filtres compris, en **un seul fichier `.md`** (une section par entrée, Q-4 ; liens `@` en `[[Titre]]`, surligné en `==texte==`).
- **Un seul outil de mise en forme par endroit** (v8, revient sur la v6) : onglet = barre d'outils en haut ; fenêtre flottante = menu à la sélection. Les deux à la fois faisaient doublon, et le menu gênait la sélection pour copier.
- **Collage depuis un autre site** : seuls les formats de l'éditeur passent (fonds, couleurs, polices retirés). Dans l'app, TipTap le fait déjà par son schéma (pas d'extension de couleur, surligné d'une seule couleur) : à confirmer à l'implémentation sur un collage réel. Ajout d'un bouton **« Effacer la mise en forme »** (marques et titre de la sélection), utile aussi pour les anciennes notes.
- **Actions de carte** (demande du MJ, v7) : épingler / désépingler et supprimer directement sur chaque carte de la liste (onglet et fenêtre), en haut à droite, en plus des emplacements de la note ; visibles au survol ou au clavier, l'épingle d'une carte épinglée reste toujours visible (elle sert d'indicateur) ; la suppression passe par la même confirmation ; pas de corbeille sur une entrée partagée qu'on n'a pas le droit de supprimer. La carte devient un élément cliquable non-bouton (`role="button"`, ouverture à Entrée / Espace) pour pouvoir contenir ses boutons.

Une **planche HTML interactive** avant tout code (liste, détail, fenêtre flottante, journal de table, jour / nuit, deux ou trois slugs avec leurs vrais `theme.css`), comme pour les autres refontes. Le journal reste une brique de plateforme habillée par les `vtt-*`, les slugs surchargent dans leur `theme.css`.

## 9. Questions de phase 1

| # | Question | Recommandation | Réponse MJ |
|---|---|---|---|
| R-1 | Périmètre : journal personnel **et** journal de table dans le même chantier ? | **Oui, même chantier, en lots** : lot 1 corrections (P-1, P-7, J2-2, J2-5), lot 2 refonte du journal personnel, lot 3 journal de table. La planche couvre les deux d'emblée pour que l'ensemble soit cohérent. | OK, l'ordre des lots n'est pas l'essentiel |
| R-2 | Fenêtre flottante du journal (P-2) en plus de l'onglet ? | **Oui** : c'est ce qui changera le plus l'usage en partie. L'onglet reste pour les slugs qui l'ont. | Oui, pourquoi pas (2026-11-13) |
| R-3 | Organisation des notes : catégories fixes, étiquettes libres, ou rien ? | **Épingle (P-3) + regroupement par jour (P-5) + catégories fixes de la plateforme** (Notes, Personnages, Lieux, Indices, Quêtes), les mêmes pour le journal de table : simple, filtrable en pastilles, sans saisie. | Rester simple : **épingle + catégories fixes** pour le journal personnel, pas de regroupement par jour. Journal de table : épingle oui, catégories peut-être pas (R-15). |
| R-4 | Notion de **séance** : la saisir (numéro, titre) ou la déduire de la date ? | **La déduire de la date** (P-5) : rien à saisir, et la chronique du journal de table porte les résumés. | **Pas de notion de séance.** |
| R-5 | Journal de table : quels contenus en v1 ? | **Chronique + encyclopédie** (par catégories, R-3) **+ documents révélés par le MJ**. | Le contenu est ce que la table décide d'écrire : aucune structure imposée. Reste la question d'une entrée du MJ cachée jusqu'à révélation (R-16). |
| R-6 | Droits dans le journal de table : qui modifie, qui supprime ? | **Tout le monde écrit et modifie** (esprit de la fiche de groupe Fabula) ; auteur et dernier modificateur affichés ; **suppression par l'auteur ou le MJ**. | OK. Saisie en temps réel à plusieurs envisagée (R-17). |
| R-7 | Deux personnes modifient la même entrée en même temps ? | **Verrou souple** : l'entrée ouverte en écriture affiche « X est en train d'écrire » aux autres, en lecture seule pour eux, libérée à la fermeture ou après inactivité. Pas d'édition simultanée façon Google Docs (trop lourd pour le projet). | Verrou ou temps réel : à trancher (R-17). |
| R-8 | Le MJ voit-il les journaux **personnels** des joueurs ? (la route le permet déjà, aucun écran ne le fait) | **Non** : le journal personnel reste privé, le partage passe par le journal de table (P-8). | **Non, ça reste privé.** |
| R-9 | Historique des envois du MJ (J2-6) ? | **Oui** : les messages envoyés apparaissent dans le journal du MJ (entrée « Message envoyé à … »), plus besoin de garder une note à côté. | Oui |
| R-10 | Fabula : son bloc Journal de la fiche de groupe (`groupe_journal`) ? | **Reprendre ses entrées dans le journal de table** (migration de données) et retirer le bloc de la fiche de groupe, pour n'avoir qu'un journal partagé. À valider avec le MJ de Fabula. | **Non** : le bloc Journal de Fabula reste en l'état, les deux cohabitent. |
| R-11 | Liens entre entrées (P-9) ? | **Pas en v1**, à revoir après usage. | Intéressé : à cadrer (R-18). |
| R-12 | Onglet commun « Table » / « Groupe » pour accueillir plus tard l'inventaire de groupe (§8.3) ? | **Oui pour le prévoir** dans la planche, sans l'inventaire ; l'onglet s'appelle « Journal de table » tant qu'il n'a que ça. | **Non** (2026-11-13) : journal de table et inventaire de groupe sont des fonctions différentes, jamais dans le même onglet. Le journal de table vit dans l'onglet Journal existant, aucun onglet ajouté. |
| R-13 | Passer du journal personnel au journal de table dans l'onglet ? | **Bascule** « Mon journal / Journal de table » en tête de liste, compteur de nouveautés sur chaque côté ; côté MJ, le journal de la table active. | **Bascule** (mieux que tout mélanger). |
| R-14 | Contenu de la fenêtre flottante ? | Le même écran que l'onglet, en compact. | **Non** : optimisée pour la place. Choisir / créer une note, puis la prise de note elle-même, dans le plus petit espace possible, facile à « oublier » sur une autre interface. Le reste est le contrat de base de `FloatingPanel` : déplaçable, réductible, redimensionnable, mémorisé par personne et par slug. |
| R-15 | Catégories : journal de table sans catégorie (épingle + recherche) ; journal personnel avec Notes, Personnages, Lieux, Indices, Quêtes, les messages du MJ en filtre à part ? | Oui aux deux. | **Oui** |
| R-16 | Préparer une entrée avant de la montrer : pas de notion « caché », on **publie** une note personnelle dans le journal de table. Déplacer ou copier ? | Déplacer (pas deux copies qui divergent). | **Copier pour le MJ** : il garde sa note pour la renvoyer à une autre table qui rejoue le scénario. Joueurs : R-19. |
| R-17 | Journal de table : verrou ou écriture à plusieurs en temps réel ? | Temps réel (Yjs + extensions de collaboration de TipTap 3, relais par les sockets de la room, état gardé en mémoire par le serveur et enregistré en base avec le HTML). Coût : 2 à 3 fois le lot « journal de table ». Journal personnel non concerné. | **Temps réel à plusieurs.** |
| R-19 | Publier dans le journal de table, pour un joueur : copier aussi, ou déplacer ? | Copier aussi : un seul comportement, le joueur supprime sa note s'il le veut. | **Copier** (validé 2026-11-13) |
| R-20 | Libellés de la bascule (« Journal de table » trop long, « À table » proposé par le MJ) | Comparer dans la planche (sélecteur « Libellés ») ; reco **Mon journal / La table**. | **Privé / Partagé** (2026-11-13) : pas le meilleur terme, mais le plus court sans perdre le sens. Le bouton de publication devient « Partager ». |
| R-21 | Rattachement d'une note personnelle à une table (aujourd'hui « session », qui est en fait la table) : garder ? | **Garder**, renommé « table » ; changeable à tout moment par un **déplacement** (pas de copie : le rattachement range, il ne cache rien) ; filtre Toutes / table active / Hors table. | Le MJ veut le garder et pouvoir basculer table ↔ hors table. **Déplacer**, sans copie (2026-11-13). |
| R-22 | Éditeur en Markdown plutôt qu'en HTML (portable : chat IA, Obsidian) ? | Garder le stockage HTML ; **copier en Markdown** et **exporter en .md** ; coller du Markdown le met en forme. | **OK pour la reco** (2026-11-13). Liens `@` exportés en `[[Titre]]` (Obsidian). |
| R-23 | Les champs de date natifs débordent et ne s'habillent pas : habiller le calendrier ? | ✦ Brique de plateforme « période » (`vtt-date-*`) : un champ, un calendrier (premier clic = début, second = fin), raccourcis Aujourd'hui / 7 jours / 30 jours / Effacer. | Demandé par le MJ (2026-11-13). Planche v5 (choix du MJ) : **un seul champ « Période »** (« Choisir une période… », puis « Du 10/11 au 13/11 », « Depuis le 10/11 »), rendu compréhensible par le calendrier : bornes « Du → Au » en tête, celle en cours de choix mise en avant et cliquable pour y revenir, période dessinée au survol, consigne sous la grille. |
| R-18 | Liens entre entrées par `@` : journal personnel → ses notes et les entrées de table ; journal de table → entrées de table seulement ; lien vers une entrée supprimée barré ; pas de « cité dans » ; dernier lot. | Comme décrit. | **Oui** |

---

# Partie III — Spécification technique (phase 2, 2026-11-13)

**Statut : questions du §16 répondues par le MJ le 2026-11-13.** Reprend les décisions de la partie II (R-1 à R-23) et la planche v8.

Vocabulaire : **Privé** = journal du personnage (aujourd'hui « Journal ») ; **Partagé** = journal de la table (nouveau) ; **table** = `game_sessions` (aucune notion de séance).

## 10. Données

### 10.1 Journal privé : `character_journal` (colonnes ajoutées)

| Colonne | Type | Rôle |
|---|---|---|
| `category` | TEXT, `null` | Catégorie fixe d'une note : `notes`, `personnages`, `lieux`, `indices`, `quetes` (`null` pour un message ou un objet du MJ). Une note existante est lue comme `notes`. |
| `pinned` | INTEGER 0/1, défaut 0 | Épinglée. |
| `body_text` | TEXT, `null` | Texte brut du corps (sans balises ni images), écrit par le serveur à chaque écriture : aperçu, recherche, liste légère (J2-3). Rempli à la première lecture pour les entrées existantes (une migration SQL ne sait pas retirer des balises). |

- `session_id` garde son rôle (la table de rattachement, ou `null` = hors table), mais devient **modifiable** (R-21, déplacement).
- Nouveau `type` : `gm_sent` (R-9), écrit dans le journal du MJ (personnage `-1`) par `gm-send` et `gm-send-item`, `metadata.to` = noms des destinataires.

### 10.2 Journal partagé : deux tables nouvelles (`base.sql`)

```
table_journal
  id            INTEGER PK
  session_id    INTEGER NOT NULL → game_sessions ON DELETE CASCADE   -- la table
  title         TEXT
  body          TEXT        -- HTML (aperçu riche, export, recherche via body_text)
  body_text     TEXT        -- texte brut
  ydoc          BLOB        -- état de collaboration (Yjs), source de vérité du corps quand il existe
  pinned        INTEGER 0/1 -- épinglage commun à la table (Q-1)
  author_id     INTEGER     -- personnage (-1 = MJ), sans clé étrangère : l'auteur peut partir
  author_name   TEXT        -- nom figé à l'écriture
  editor_id     INTEGER     -- dernier à avoir modifié
  editor_name   TEXT
  created_at, updated_at DATETIME

table_journal_reads
  entry_id      INTEGER → table_journal ON DELETE CASCADE
  character_id  INTEGER     -- -1 = MJ
  seen_at       DATETIME
  PRIMARY KEY (entry_id, character_id)
```

- Une entrée est **nouvelle** pour quelqu'un si elle a été créée ou modifiée par un autre depuis sa dernière ouverture (`updated_at > seen_at`, `editor_id` ≠ lui). C'est ce qui alimente les compteurs « Partagé ».
- Migration `DDMMYYYY_journal_refonte.sql`, `-- systems: all` : colonnes de `character_journal`, deux tables, index (`session_id`, `updated_at`).

## 11. Routes (HTTP)

### 11.1 Journal privé (`routes/journal.js`, existant)

| Route | Changement |
|---|---|
| `GET /:characterId` | **Liste légère** : plus de `body`, mais `bodyText` (aperçu, recherche locale) ; `category`, `pinned`, `sessionId`. Remplit `body_text` s'il manque. |
| `GET /:characterId/:entryId` | **Nouveau** : entrée complète (corps HTML), chargée à l'ouverture. |
| `PUT /:characterId/:entryId` | Accepte aussi `category`, `pinned`, `sessionId` (déplacement ; `null` = hors table). Ne change `updated_at` que pour le titre et le corps (comme aujourd'hui pour `isRead`). |
| `GET /:characterId?full=1&ids=…` | Entrées complètes d'une liste, pour l'export Markdown (fait côté client, Q-4). Même paramètre sur `GET /table-journal/:sessionId`. |
| `POST /gm-send`, `/gm-send-item` | Écrivent aussi l'entrée `gm_sent` du MJ. |

### 11.2 Journal partagé (`routes/tableJournal.js`, nouveau, monté sur `/api/:slug/table-journal`)

| Route | Droits | Effet, diffusion |
|---|---|---|
| `GET /:sessionId` | membre de la table ou MJ | Liste légère, avec `isNew` pour le demandeur. |
| `GET /:sessionId/:id` | idem | Entrée complète (HTML, pour la lecture et l'export ; l'édition charge l'état Yjs par socket). |
| `POST /:sessionId` | idem | Crée une entrée (vide, ou copie d'une note privée : « Partager », R-19). → `table-journal-changed` |
| `PATCH /:sessionId/:id` | idem | `title`, `pinned`. → `table-journal-changed` |
| `PUT /:sessionId/:id/body` | idem | `body` HTML envoyé par un éditeur (debounce), pour l'aperçu, la recherche et l'export ; `body_text` recalculé. Pas de diffusion du corps (il passe par Yjs). |
| `POST /:sessionId/:id/seen` | idem | Marque l'entrée comme vue pour le demandeur. |
| `DELETE /:sessionId/:id` | auteur ou MJ | → `table-journal-deleted` |

- « Membre de la table » : personnage présent dans `session_characters` pour cette table (le MJ, partout). Un joueur retiré de la table perd l'accès ; ses entrées restent, avec son nom.
- Diffusion dans la room de la table `${slug}_session_${sessionId}` : `table-journal-changed { system, sessionId, entry }` (entrée légère), `table-journal-deleted { system, sessionId, id }`.

## 12. Écriture à plusieurs en temps réel (R-17)

**Choix** : Yjs (le standard des éditeurs collaboratifs, utilisé par TipTap), relayé par **les sockets existants**, sans second serveur (Hocuspocus écarté : un serveur WebSocket de plus à déployer et à authentifier, pour une table de 15 personnes).

- **Client** : extensions de collaboration de TipTap 3 (document partagé, curseurs nommés et colorés des autres) + `yjs` ; paquets exacts et versions vérifiés à l'implémentation (le binding ProseMirror a changé de nom en v3). Brique `features/journal/hooks/useJournalDoc.js` : ouvre le document, applique et émet les mises à jour, la présence (curseurs) et l'enregistrement du HTML (debounce, §11.2).
- **Serveur** : `socket/platform/journal.js` (comme `board.js`) + `yjs` côté serveur. Par entrée ouverte, un document en mémoire (`journalDocs`, dans l'état partagé de `socket/index.js`), chargé depuis `ydoc` à la première ouverture, enregistré en base (debounce 2 s, et à la fermeture du dernier éditeur), libéré quand plus personne ne l'ouvre.

| Événement | Sens | Contenu |
|---|---|---|
| `journal-doc-open` | client → serveur | `{ system, sessionId, entryId, token }` : le serveur vérifie le jeton (même vérification que les routes) et l'appartenance à la table, puis répond `journal-doc-state { entryId, state, seed }`. `seed: true` au premier qui ouvre une entrée sans état Yjs (entrée existante ou copiée) : c'est lui qui y charge le HTML, une seule fois. |
| `journal-doc-update` | les deux sens | `{ entryId, update }` (binaire Yjs) : appliqué au document du serveur, relayé aux autres éditeurs de l'entrée. Refusé d'un socket qui n'a pas ouvert l'entrée. |
| `journal-doc-awareness` | les deux sens | `{ entryId, update }` : curseurs et noms, relais seulement (volatile). |
| `journal-doc-close` | client → serveur | Fermeture de l'entrée (aussi à la déconnexion). |

- Ces émissions vivent dans le hook de la brique, jamais dans un slug (F-SOCK-EMIT). C'est une **écriture par socket**, par nature (le temps réel) : elle est réservée aux sockets authentifiés à l'ouverture et membres de la table ; création, suppression, épinglage et titre restent en HTTP.
- **Taille des messages** : Socket.io refuse par défaut un message de plus de 1 Mo ; une image collée (jusqu'à 1600 px, GIF jusqu'à 5 Mo) part dans une mise à jour Yjs. `maxHttpBufferSize` relevé à **8 Mo** (`server.js`).
- **Titre** : champ simple en HTTP (`PATCH`), le dernier qui écrit gagne, diffusé (Q-2).
- **Hors ligne, coupure** : à la reconnexion, le client rouvre l'entrée et Yjs fusionne ses modifications locales.

## 13. Client

### 13.1 Briques

| Fichier | Rôle |
|---|---|
| `features/journal/Journal.jsx` | Brique assemblée : bascule Privé / Partagé, colonne repliable (liste, recherche, filtres, catégories, export), détail. Props `characterId`, `sessionId`, `onRead?`, `compact?`. |
| `features/journal/JournalTab.jsx`, `TabJournal.jsx` | **Contrats inchangés** (joueur : `characterId`, `onRead` ; MJ : aucune prop) : ils montent `Journal`. Les props mortes passées par Achtung et Noctis sont retirées (J2-5). |
| `features/journal/JournalLayer.jsx` | Fenêtre flottante compacte (liste ↔ note) et son bouton dans la zone d'actions, montés par `PlayerPage` / `GMPage` comme `BoardLayer` ; position par `FloatingPanel` (`persistAs="journal"`, mémorisée par slug et par navigateur). |
| `JournalList`, `JournalCard` (actions épingler / supprimer), `JournalNote` (en-tête, catégories, table, indicateur d'enregistrement, pied), `JournalFilters` | Composants de la brique. |
| `features/journal/hooks/usePrivateJournal.js`, `useTableJournal.js`, `useJournalDoc.js`, `useJournalUnread.js` | Données, sockets, compteurs. |
| `features/journal/tools/journalMarkdown.js` | HTML → Markdown (copie, export ; `@` → `[[Titre]]`, surligné → `==texte==`), testé. |
| `features/journal/tools/journalFilters.js` | Filtres (catégorie, table, période, recherche, épinglées en tête), testés. |
| `ui/text/RichTextEditor.jsx` | Étendu, sans rien savoir de l'API : `toolbar` (`'full'` dans l'onglet, `'none'` dans la fenêtre : menu à la sélection seul), `collaboration?` (document, présence, nom et couleur), `mentions?` (source des entrées citables, fournie par le journal), bouton « Effacer la mise en forme », collage Markdown mis en forme. |
| `ui/date/DateRangeField.jsx` | ✦ Brique « période » (R-23), un champ, calendrier en `Popover`. |

### 13.2 Compteurs (une seule source)

`useJournalUnread` (contexte posé par `PlayerPage` / `GMPage`) tient les non-lus Privé (messages et objets du MJ) et les nouveautés Partagé. Le badge de l'onglet de la fiche (`journalUnread`, contrat des `Sheet` inchangé = total des deux), le bouton de la zone d'actions et la bascule lisent la même valeur, qui baisse à l'ouverture de chaque entrée. `usePlayerSession` lui délègue son compteur.

### 13.3 Menus ancrés (point de vigilance §8.4)

Le menu à la sélection (fenêtre), la liste du `@` et le calendrier passent par **`Popover`** (`ui/panel/Popover.jsx`, rendu par `HostedModal`, jamais rogné par la fenêtre flottante), positionnés sur la sélection avec retournement aux bords.

### 13.4 Habillage

Classes `vtt-journal-*` et `vtt-date-*`, feuilles `features/journal/journal.css` et `ui/date/date.css` importées par `app/styles/index.css`, style par défaut sur les seules variables `--color-*`. Chaque slug surcharge dans son `theme.css` ; **chaque nouveau conteneur suit les mécanismes d'habillage du slug** (ex. Vikings pierre peinte : menu à la sélection, liste `@`, calendrier ajoutés à `SLAB_TARGETS`), vérifié slug par slug en jour et en nuit. Noctis exclu (refonte en attente).

### 13.5 Dépendances ajoutées

Client : `yjs`, extensions de collaboration de TipTap 3, extension `Mention` de TipTap, `@tiptap/markdown` (collage Markdown ; la conversion d'export est maison, testée). Pas de bibliothèque de `.zip` : l'export est un seul `.md` (Q-4). Serveur : `yjs`. Toutes libres (MIT).

## 14. Lots

| Lot | Contenu | Livre |
|---|---|---|
| 1 | Socle du journal privé : colonnes (§10.1), liste légère, enregistrement automatique et indicateur, hauteur (J2-2), props mortes (J2-5), épingle, catégories, déplacement de table, actions de carte, filtres et `DateRangeField`, barre d'outils pleine, « Effacer la mise en forme », historique des envois du MJ (`gm_sent`), compteurs. | Le nouvel onglet, Privé seul |
| 2 | `JournalLayer` : fenêtre flottante compacte, menu à la sélection en `Popover`. | La prise de notes sans quitter la fiche |
| 3 | Journal partagé sans temps réel : tables (§10.2), routes (§11.2), bascule, « Partager » (copie), nouveautés et compteurs ; édition par HTTP, le dernier qui enregistre gagne. | Partagé utilisable |
| 4 | Temps réel (§12) : Yjs, curseurs nommés, présence (« X écrit… »). | L'écriture à plusieurs |
| 5 | Markdown : « Copier en Markdown », export en un `.md`, collage Markdown. | La portabilité |
| 6 | Liens `@` (R-18). | Le wiki de campagne |
| 7 | Habillage slug par slug (Noctis exclu). | L'identité de chaque jeu |

**Avancement** : lot 1 fait (2026-11-13), vérifié à l'écran (Delta Green joueur et MJ, jour et nuit). Au passage : Delta Green joueur ne bornait plus le journal à `max-w-4xl` (pleine largeur) et ne passe plus la prop morte `sessionId` ; même nettoyage chez Achtung.
Lot 2 fait (2026-11-13), vérifié à l'écran (Delta Green joueur et MJ) : `JournalLayer` + `JournalMini`, données communes à l'onglet et à la fenêtre par `JournalProvider` (posé par `PlayerPage` / `GMPage`), une note enregistrée dans une vue est reprise par l'autre ; logique d'une entrée ouverte mise en commun (`useJournalEditor`). `RichTextEditor` : réglage `toolbar` (`'bubble'` par défaut, `'full'`, `'selection'`) et menu de sélection accroché à `<body>` (cause du placement aléatoire : la fenêtre flottante est le bloc conteneur des éléments fixes). `ZoneAction` : prop `badge` (compteur).
Lot 3 fait (2026-11-13), vérifié à l'écran (Delta Green, joueur puis MJ sur la même table) : route `table-journal` (`routes/tableJournal.js`, test `tests/server/routes/tableJournal.test.js`), migration `13112026_journal_partage.sql`, bascule Privé / Partagé (onglet et fenêtre), « Partager », nouveautés. Compteurs : une seule source (`JournalProvider`, `journalCounts`), le badge de l'onglet des fiches passe par `JournalUnread` ; `usePlayerSession` ne tient plus de compteur et la route `GET /journal/:id/unread-count` est supprimée. En attendant le lot 4 : le dernier qui enregistre gagne ; une entrée lue (sans y écrire) se recharge quand un autre la modifie.
Lot 4 fait (2026-11-13), vérifié à l'écran avec deux pages ouvertes en même temps (joueur et MJ de Delta Green dans la même entrée : frappes croisées en direct, curseurs nommés, « MJ écrit… », texte identique des deux côtés, gardé après rechargement). Dépendances : `yjs` (serveur et client), `y-protocols`, `@tiptap/extension-collaboration`, `@tiptap/extension-collaboration-caret`, `@tiptap/y-tiptap` (3.22.3, comme TipTap). Serveur : `socket/platform/journal.js` (test `tests/server/socket/journal.test.js`), `maxHttpBufferSize` 8 Mo. Client : `useJournalDoc` (une connexion par entrée et par page, partagée par l'onglet et la fenêtre), `useJournalCollab`, `RichTextEditor` prop `collaboration` et `onUpdate(html, { remote })` (seules ses propres frappes s'enregistrent en HTTP). Une entrée ouverte ne compte jamais comme nouvelle ; à sa fermeture, elle est marquée vue.
Lot 5 fait (2026-11-13), vérifié à l'écran (Delta Green) : `features/journal/tools/journalMarkdown.js` (conversion HTML → Markdown sans DOM, testée), « Copier en Markdown » (pied de la note, corps relu au serveur, ligne de contexte `tools/journalContext.js`), export de la liste affichée en un seul `.md` (bouton à côté de « Nouvelle note », `GET …?full=1&ids=`), collage d'un texte Markdown mis en forme (`@tiptap/markdown` 3.22.3, détection `ui/tools/markdownPaste.js`, testée ; un collage qui porte du HTML garde le chemin normal). Images en ligne exportées en « [image] ».
Lot 6 fait (2026-11-13), vérifié à l'écran (Delta Green) : liens « @ » (`@tiptap/extension-mention` et `@tiptap/suggestion` 3.22.3) ; `RichTextEditor` prop `mentions` (liste sous le curseur au clavier, clic qui ouvre l'entrée citée, lien barré par une décoration quand la cible n'existe plus) ; règles R-18 dans `tools/journalMentions.js` (testé) : depuis Privé ses notes et les entrées de la table, depuis Partagé les entrées de la table seulement ; un lien vers l'autre côté bascule puis ouvre l'entrée.
Lot 7 fait en partie (2026-11-13) : habillage des nouvelles classes dans Vikings (bois et or ; pierre peinte : calendrier, liste du « @ » et menu de mise en forme ajoutés aux `SLAB_TARGETS`), Fabula (fenêtres JRPG, couleurs redéfinies dedans), Dune, Delta Green, Achtung, Zone Blanche, Vampire, Vileborn, Nimble ; puis Cyberpunk (coins coupés néon ; petites fenêtres opaques sur une surface du thème translucide) et Maledictum (métal du rôle de faction) une fois le chantier Popover commité ; vérifié à l'écran sur Fabula, Cyberpunk et Maledictum (MJ) et Delta Green. Tecumah et Noctis exclus, comme pour les modales. Marge sous le journal portée à 84 px pour que la zone d'actions (boutons losanges de Maledictum compris) ne couvre pas son pied.
**Règle (MJ, 2026-11-13) : le journal prend toujours toute la largeur disponible**, jamais dans un conteneur centré à largeur maximale. Corrigé dans les pages MJ de Vikings et de Zone Blanche (`max-w-4xl mx-auto` retiré) et la fiche joueur de Delta Green ; vérifié par mesure sur les pages MJ des 12 slugs (Noctis exclu).

**Une seule livraison en prod, à la fin du chantier (Q-3)** : les lots sont des étapes de développement, chacune vérifiée (lint, tests, build) avant la suivante.

## 15. Tests

- Front : `journalFilters.js` (catégorie, table, période, épinglées), `journalMarkdown.js` (titres, listes, marques, liens `@`, surligné), lecture des dates déjà testée.
- Serveur : contrat de `table-journal` (droits membre / non-membre / MJ, suppression auteur ou MJ, nouveautés par personne), `journal` (liste légère, déplacement de table, `gm_sent`), relais Yjs (ouverture refusée sans jeton ou hors table, mise à jour refusée d'un socket qui n'a pas ouvert l'entrée).

## 16. Questions de phase 2

| # | Question | Recommandation | Réponse MJ |
|---|---|---|---|
| Q-1 | Épingler dans Partagé : pour toute la table, ou pour soi seulement ? | **Pour toute la table** : la table range son journal ensemble, comme elle l'écrit ; une épingle par personne demande une table de plus pour peu. | **Toute la table** |
| Q-2 | Titre d'une entrée partagée : dans l'écriture à plusieurs, ou champ simple (le dernier qui écrit gagne) ? | **Champ simple** : deux personnes qui renomment la même entrée à la même seconde, c'est rare ; le mettre dans Yjs complique pour rien. | **Champ simple** |
| Q-3 | Lots 3 et 4 : livrer Partagé seulement quand le temps réel est prêt ? | **Oui** : pas d'écrasement silencieux en partie. | **Une seule livraison en prod, à la fin du chantier** : les lots sont des étapes de développement. |
| Q-4 | Export : `.zip` d'un `.md` par entrée (Obsidian), ou un seul `.md` ? | **Le `.zip`** par défaut ; un seul fichier si l'export ne compte qu'une entrée. | **Un seul `.md`** (toutes les entrées de la liste, une section `#` par entrée) ; pas de `.zip`. |
| Q-5 | MJ : Partagé montre le journal de **sa table active** seulement ? | **Oui**, comme tout le reste de l'interface MJ ; changer de table change de journal. | **Oui** |

---

# Partie IV — Images dans l'éditeur (phase 1, 2026-11-13)

**Constat du MJ** : l'image insérée s'entoure d'un cadre qui prend toute la largeur de l'éditeur ; rien n'indique qu'un double-clic l'agrandit ; le texte ne peut pas l'entourer. Le sujet principal est l'expérience autour de l'image (UX, ergonomie).

| # | Piste | Décision (MJ, 2026-11-13) |
|---|---|---|
| I-1 | Petit menu au clic sur une image : taille rapide, alignement et habillage du texte, agrandir, supprimer | Oui |
| I-2 | Légende sous l'image | Oui |
| I-3 | Agrandissement plus riche : zoom, image suivante / précédente de la note, Échap, clic à côté | Oui |
| I-4 | Indicateur pendant la préparation d'une grosse image | Oui |
| I-5 | Vignette de l'image sur la carte de la liste | Non retenu |
| I-6 | Insérer une image depuis une adresse web (Discord, Imgur…), sans la télécharger | Oui |
| I-7 | Images rangées en fichiers sur le serveur | **Non** : pas d'envoi de fichiers sur le VPS (ni pour la musique, ni pour le tableau, ni pour le journal). Les images restent dans le texte des notes, réduites à l'insertion. |

Planche : `documentations/plateforme/planches/planche_journal_images.html` (hors Git) ; le MJ a demandé de coder directement (pas de planche intermédiaire pour une fonction déjà en place).

**Fait (2026-11-13)**, vérifié à l'écran (Delta Green) :
- `ui/text/FigureImage.jsx` remplace l'extension Image de TipTap et son redimensionnement (cause du cadre pleine largeur) : nœud `image` rendu en `<figure data-type="image" data-align data-width>` (`<img>`, `<figcaption>`), attributs `width` (% de l'éditeur, 50 à l'insertion), `align` (`center`, `wrap-left`, `wrap-right`), `caption` ; une ancienne `<img>` est relue centrée, à sa taille. Les attributs suivent l'écriture à plusieurs.
- Au survol : bouton « Agrandir » (le double-clic marche aussi). Au clic : contour, poignées aux quatre coins de l'image (largeur libre ; un coin gauche grandit vers la gauche, une image centrée grandit des deux côtés), `@tiptap/extension-image` retirée des dépendances, barre sous l'image (P / M / G / Pleine, à gauche avec le texte autour, centrée, à droite avec le texte autour, légende, agrandir, supprimer).
- `ui/image/ImageLightbox.jsx` : toutes les images de la note, « 2 / 3 », zoom (molette, − / +, 100 %), flèches, légende, Échap, clic à côté ; ouvert par l'éditeur lui-même (la prop `onImageDoubleClick` de l'éditeur est retirée).
- Bouton « Image ▾ » : depuis l'ordinateur, ou depuis une adresse web (`https://…`, l'image s'affiche depuis son site). « Préparation de l'image… » pendant la réduction ; zone « Déposer l'image ici » au survol d'un fichier.
- Export Markdown : la légende devient une ligne en italique sous l'image.

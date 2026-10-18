# Journal (notes, messages et objets du MJ)

## Statut

**Validée par le MJ le 2026-10-18** (décisions au §1, questions Q-1 et Q-2 au §5). Lots A et B implémentés.

Brique de plateforme : concerne tous les slugs (onglet Journal du joueur, onglet Journal du MJ, modale d'envoi de message du MJ).

Fichiers concernés :
- `src/client/src/components/tabs/JournalTab.jsx` (journal du joueur, réutilisé par le MJ via `components/gm/tabs/TabJournal.jsx` avec le personnage -1) ;
- `src/client/src/components/shared/RichTextEditor.jsx` et `.css` (éditeur TipTap) ;
- `src/client/src/components/gm/modals/GMSendModal.jsx` (envoi de message) ;
- `src/client/src/components/layout/ToastNotifications.jsx` (notification d'un message reçu) ;
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

Même démarche que les modales génériques (`spec_ui_modales.md`) : classes stables `vtt-*` et style par défaut dans `index.css` (`@layer components`), surcharges éventuelles dans le `theme.css` du slug.

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

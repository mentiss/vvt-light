# Pages génériques de la plateforme et marques des slugs

## Statut

**Validée par le MJ le 2026-10-18** (décisions au §1, questions au §12 ; palette B anthracite / laiton retenue sur la planche du lot 1). Lots 1 à 4 réalisés.

Choix d'implémentation du lot 2 :
- les cartes et « Reprendre » ouvrent les slugs en navigation complète (et non interne) : chaque slug démarre avec sa propre connexion et son propre thème ;
- le thème d'un slug est chargé par `SystemLayout` pour toutes ses pages (accès, erreurs, chargement compris).

Brique de plateforme : page d'accueil (sélection des slugs), pages d'accès d'un slug (chargement, erreurs, arrivée du joueur, connexion du MJ), et visuel de chaque slug sur ces pages.

Même démarche que les modales génériques (`spec_ui_modales.md`) : classes stables `vtt-*`, style par défaut dans `index.css` (`@layer components`), habillage par le slug, aucune couleur codée en dur ni emoji dans le générique.

Hors périmètre : Noctis (carte par défaut en attendant sa refonte), « partie en cours » sur la carte d'un slug (I-2, plus tard), modules plus lourds (initiative partagée, carte de jeu…).

---

## 1. Décisions du diagnostic (validées le 2026-10-18)

| # | Sujet | Décision |
|---|---|---|
| H-1 | Visuel d'un slug | Le slug fournit tout l'intérieur de sa carte de sélection ; le cadre de la carte (taille, survol, clic, focus clavier) reste générique. |
| H-2 | Masquer un slug | Option dans le `config.js` serveur du slug ; le slug reste accessible par son adresse directe. |
| H-3 | Identité de la plateforme | Neutre, pour laisser les cartes porter les univers. Deux palettes à comparer sur la planche : bleu nuit / or (actuelle) et anthracite / laiton. |
| H-4 | Pages d'accès d'un slug | Thème du slug (déjà chargé à cet endroit) et sa marque en mode titre. |
| H-5 | Méthode | Planche HTML à valider avant tout changement de l'application. |
| H-6 | Slugs concernés | Marque pour tous les slugs sauf Noctis. |
| H-7 | Fuite de thème entre slugs | Lot à part, en fin de chantier. |
| H-8 | Styles de la marque | Une seule source : le CSS de la marque, repris par le thème du slug (§5.3). |
| H-9 | Pied de page | Lien vers le dépôt GitHub et version de l'application (I-4). |
| H-10 | Outils sur l'accueil | Lanceur de dés libre (jamais enregistré dans un historique) et configuration des dés propre à la plateforme. |
| H-11 | Raccourci | « Reprendre » : dernier slug et dernier personnage utilisés sur cet appareil (I-1). |
| H-12 | Accès MJ | Lien « MJ » visible sur chaque carte (I-3) : l'accès reste protégé par son code. |
| H-13 | Jour / nuit | Préférence de la plateforme enregistrée à part ; chaque slug garde la sienne. |
| H-14 | Modes de la marque | Deux modes : carte de sélection et titre (pages d'accès du slug). |

---

## 2. Constat

| # | Constat |
|---|---|
| P-1 | Accueil : couleurs codées en dur, survol réalisé en JavaScript, emojis tirés d'une table en dur dans le fichier générique (dont des slugs inexistants ; Fabula, Zone Blanche, Delta Green… tombent sur 🎭). La page reste sombre en mode jour. |
| P-2 | Aucun thème plateforme : les couleurs `--color-*` ne sont définies que par les thèmes des slugs ; sur l'accueil, les classes `vtt-*` n'ont pas de couleurs. |
| P-3 | Le thème d'un slug reste chargé après une navigation interne : retour à l'accueil sans recharger = couleurs du dernier slug. |
| P-4 | Pages d'accès d'un slug (chargement, système inconnu ou incomplet, arrivée du joueur, interface MJ indisponible, connexion MJ) en gris et bleu codés en dur, avec emojis, sans le thème du slug. |
| P-5 | Pas d'option pour masquer un slug ; la liste de l'API sert aussi à valider l'adresse d'un slug. |
| P-6 | Sur l'accueil, le lanceur libre et la configuration des dés se rabattraient sur le slug par défaut (Vikings) : jet enregistré dans l'historique de Vikings, configuration de Vikings. |

Polices : les polices maison (Cyberpunk, Dune, Tecumah…) sont déclarées dans `public/fonts/fonts.css`, chargé sur toutes les pages ; les polices Google sont importées par chaque `theme.css`.

---

## 3. Thème de la plateforme

- Palette jour et nuit propre à la plateforme (couleurs `--color-*`), définie dans `index.css` sur une enveloppe **`.vtt-platform`** posée autour des pages hors slug (accueil). Définies sur l'enveloppe, ces couleurs l'emportent sur celles d'un thème de slug resté chargé (P-3 réglé pour l'accueil).
- Palette retenue après la planche (H-3).
- Préférence jour / nuit de la plateforme enregistrée à part (clé « global », déjà utilisée), indépendante de celle de chaque slug.

---

## 4. Page d'accueil

| Zone | Contenu |
|---|---|
| En-tête | Nom de la plateforme, lanceur de dés libre, configuration des dés, bascule jour / nuit. |
| Reprendre | Personnages avec lesquels cet appareil est encore connecté (§4 bis), la connexion la plus récente en premier : nom du personnage et marque du slug ; clic = fiche ouverte directement. Zone absente si aucune connexion. |
| Grille | Une carte par slug non masqué : marque du slug en mode carte, ou carte par défaut (nom du slug et initiale stylée). Clic = page du slug. Lien « MJ » discret sur chaque carte. |
| Pied de page | Lien vers le dépôt GitHub, version de l'application (identifiant et date du dernier commit, injectés à la construction), nombre de systèmes. |
| États | Chargement, serveur injoignable, aucun système : messages sobres sur les classes `vtt-*`. |

**Dés sur l'accueil (H-10)**
- Le lanceur libre ne crée jamais d'entrée dans un historique.
- La configuration des dés de l'accueil est celle de la plateforme, enregistrée à part (clé « platform »), modifiable par la même modale que dans les slugs.
- L'animation 3D des dés est disponible sur l'accueil.

### 4 bis. « Reprendre » à partir des connexions existantes (Q-3)

- Chaque connexion d'un joueur pose un cookie de reconnexion propre au slug (`refreshToken_<slug>`, 30 jours, envoyé sur toutes les pages). C'est ce qui reconnecte aujourd'hui automatiquement un joueur sur la page d'un slug.
- Nouvelle route serveur globale (hors slug) : à partir des cookies reçus, elle renvoie, pour chaque slug où la connexion est encore valide, le personnage (nom, adresse d'accès) et la date de connexion. Elle ne crée ni ne renouvelle aucun jeton. Les connexions MJ ne sont pas listées.
- « Dernier utilisé » = connexion la plus récente (le jeton n'est pas renouvelé à chaque visite).
- Un slug masqué apparaît dans « Reprendre » s'il y a une connexion : le joueur y joue déjà sur cet appareil.
- Au passage : sur l'accueil, la vérification de connexion au démarrage n'interroge plus le slug par défaut (Vikings), il n'y a pas de slug.

---

## 5. Marque d'un slug (`Brand`)

### 5.1 Fichiers

| Fichier | Rôle |
|---|---|
| `src/client/src/systems/:slug/Brand.jsx` | Composant de la marque. Facultatif : découvert automatiquement (comme `Sheet.jsx`), aucun registre. |
| `src/client/src/systems/:slug/Brand.css` | Styles de la marque, importés par `Brand.jsx`. |

### 5.2 Contrat

| Prop | Rôle |
|---|---|
| `variant` | `card` : intérieur de la carte de sélection (logo, titre stylé, fond…) ; `title` : titre des pages d'accès du slug, plus sobre. |
| `slug`, `label` | Identifiant et nom du slug (venant de l'API). |

- En mode `card`, le composant remplit le cadre générique de la carte ; il ne gère ni le clic ni le lien MJ.
- En mode `title`, il s'affiche en tête des pages d'accès du slug, au-dessus des actions.
- Sans `Brand.jsx` : carte par défaut et titre par défaut (nom du slug).

### 5.3 Styles sans duplication (H-8)

- `Brand.css` ne contient que des classes préfixées par le slug (ex. `.cp-brand-title`) et les polices de la marque ; **jamais** de couleurs globales (`--color-*` sur `:root` ou `[data-theme]`), qui écraseraient celles de la plateforme ou des autres cartes.
- Couleurs propres à la marque : variables préfixées (ex. `--cp-brand-*`) déclarées sur la racine du composant.
- Le `theme.css` du slug commence par `@import './Brand.css'` : la fiche et les pages du slug réutilisent les mêmes classes (ex. le titre du bandeau). Une police Google qui sert à la marque passe dans `Brand.css` et n'est plus importée par `theme.css`.
- Les polices maison restent déclarées dans `public/fonts/fonts.css` (chargé partout).

---

## 6. Pages d'accès d'un slug

Chargement, système inconnu, système incomplet, arrivée du joueur (« Créer un personnage », « Se connecter »), interface MJ indisponible, connexion du MJ :
- thème du slug et classes `vtt-*` (panneau, boutons), sans couleurs codées en dur ni emojis ;
- marque du slug en mode titre en tête des pages d'arrivée du joueur et de connexion du MJ ;
- « Système inconnu » (le slug n'existe pas, aucun thème) : enveloppe et thème de la plateforme, lien vers l'accueil.

### 6 bis. Pages d'erreur

Constat : une adresse plus profonde qu'un slug (`/vikings/x/y`) ou un plantage de page affiche la page d'erreur brute de React Router, en anglais ; un lien de personnage invalide renvoie en silence sur l'écran d'arrivée.

- Un composant générique de page d'erreur : code, titre, message, action (retour à l'accueil ou au slug).
- Utilisé pour : adresse inconnue (404, route « tout le reste »), slug inconnu, système incomplet, serveur injoignable, plantage d'une page (« Une erreur est survenue », gestion d'erreur du routeur).
- Thème de la plateforme hors slug ; thème du slug et sa marque en mode titre dans un slug.
- Lien de personnage invalide : l'écran d'arrivée l'indique (« Ce lien de personnage n'existe pas ou plus »).
- Pas de page 403 dédiée : aucun cas ne la déclenche aujourd'hui (un non-MJ sur `/slug/gm` arrive sur la connexion MJ, et les refus du serveur s'affichent dans les modales) ; le composant accepte un code si un cas apparaît.

---

## 7. Masquer un slug (H-2)

- `config.js` serveur : option `hidden: true`.
- L'API des systèmes transmet l'information ; l'accueil ne liste pas le slug dans la grille (cas de « Reprendre » : voir Q-3).
- Le slug reste pleinement accessible par son adresse (`/slug/`, `/slug/gm`, liens d'accès des personnages).

---

## 8. Fuite de thème entre slugs (H-7, lot 4)

En passant d'un slug à l'autre sans recharger, le thème du premier ne doit plus influencer le second.

**Cause** : le `theme.css` d'un slug, une fois chargé, n'est jamais retiré de la page ; il redéfinit les couleurs de la page entière, surcharge des classes communes (`vtt-*`) et pose parfois un décor sur `body` (drapé d'Achtung). Deux thèmes chargés dans la même page se mélangent.

**Règle retenue : une page = un slug.** Tout changement de slug (y compris vers ou depuis l'accueil) est un chargement complet de la page :
- les liens de la plateforme qui changent de slug sont des liens classiques (`<a href>`), pas des navigations internes ;
- garde-fou générique (`hooks/useSlugGuard.js`, appelé par l'accueil et `SystemLayout`) : une navigation interne qui change de slug est transformée en chargement complet de la même adresse. Il protège les liens futurs (ex. bascule d'un personnage vers un autre système au cours d'une campagne).

Alternative écartée : isoler chaque `theme.css` dans son slug ou le retirer au changement de slug (réécriture de neuf thèmes, retrait non fiable avec Vite).

---

## 9. Découpage

| Lot | Contenu |
|---|---|
| 1 | Planche HTML : accueil jour / nuit avec les deux palettes, carte par défaut, cartes Cyberpunk et Vikings en exemple, carte « Reprendre », page d'arrivée d'un slug avec sa marque en mode titre, page d'erreur. À valider. |
| 2 | Socle : thème plateforme et enveloppe, accueil (en-tête, dés, Reprendre, grille, lien MJ, pied de page, version), option `hidden`, mécanisme `Brand` et carte par défaut, pages d'accès d'un slug, pages d'erreur, configuration des dés de la plateforme. |
| 3 | Marques : `Brand.jsx` / `Brand.css` pour Achtung, Cyberpunk, Delta Green, Dune, Fabula, Tecumah, Vikings, Zone Blanche, en reprenant titres et polices de leurs thèmes ; `theme.css` de chacun branché sur `Brand.css`. |
| 4 | Fuite de thème entre slugs : garde-fou « une page = un slug » (§8). |

---

## 10. Fichiers touchés (prévision)

- Lot 2 : `AppRouter.jsx` (route « tout le reste », gestion d'erreur), nouveau composant de page d'erreur, `pages/HomePage.jsx`, `pages/SystemLayout.jsx`, `pages/PlayerPage.jsx`, `pages/GMPage.jsx`, `components/gm/layout/LoadingScreen.jsx`, `index.css`, `hooks/useDiceConfig.js`, `components/modals/FreeDiceModal.jsx` (option sans enregistrement), `context/SystemsContext.jsx`, `vite.config.js` (version), `context/AuthContext.jsx` (pas de vérification de connexion sur l'accueil), `src/server/server.js` (API des systèmes, route des connexions actives), `src/server/systems/Loader.js` (option `hidden` documentée), nouveau composant de carte générique.
- Lot 3 : `systems/:slug/Brand.jsx`, `Brand.css`, `theme.css` des huit slugs.
- Lot 4 : nouveau `hooks/useSlugGuard.js`, `pages/HomePage.jsx`, `pages/SystemLayout.jsx`, `src/client/CLAUDE.md` (règle).

---

## 11. Vérifications

- `npm run lint`, `npm test`, `npm run build` (depuis `src/client`).
- Pas de test unitaire : pas de règle de calcul (sauf si la lecture de la version ou de « Reprendre » en introduit une).
- Contrôle par le MJ : accueil jour / nuit (et après un passage dans un slug, sans recharger), cartes de chaque slug, slug masqué absent de l'accueil mais accessible par son adresse, Reprendre, lancer libre sans trace dans un historique, configuration des dés de l'accueil indépendante de celle des slugs, pages d'arrivée et de connexion MJ de chaque slug.

---

## 12. Questions

| # | Question | Proposition | Réponse MJ |
|---|---|---|---|
| Q-1 | Configuration des dés de la plateforme : sert-elle seulement sur l'accueil, ou aussi de base pour un slug que le joueur n'a jamais configuré ? | **Accueil seulement** : chaque slug a ses dés par défaut à son image (`diceConfigDefault`), à garder. | Accueil seulement |
| Q-2 | Le dépôt GitHub (`https://github.com/mentiss/vvt-light`) est-il public ? | Lien affiché seulement s'il l'est, sinon les joueurs tombent sur une page introuvable. | Public : lien affiché |
| Q-3 | « Reprendre » : un seul personnage (le dernier utilisé, tous slugs confondus) ou le dernier de chaque slug ? Et pour un slug masqué ? | **Le dernier utilisé**, même dans un slug masqué (c'est l'appareil du joueur, il y a déjà joué). | Dernier utilisé, à partir des connexions existantes (cookies) : voir §4 bis |

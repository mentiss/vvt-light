---
description: Créer un nouveau système de jeu (slug) selon les standards de la plateforme
argument-hint: <slug> [nom du système]
---

Création d'un nouveau slug : **$ARGUMENTS**

Le **quoi** (fichiers, contrats, organisation du code, standards d'interface, checklist) est dans `documentations/process/guide_new_slug.md`, écrit pour les humains comme pour toi : **lis-le en entier avant de commencer**. Cette commande ne porte que la **méthode**. Ne recopie pas le guide ici : une règle technique nouvelle s'ajoute au guide.

Respecte la méthode en trois phases du CLAUDE.md racine. **N'écris aucun fichier avant la fin de la phase 2 et ma validation explicite**, sauf la planche graphique de la phase 2.

## Phase 1 — Cadrage (aucun code)

1. Vérifie que le slug n'existe pas déjà dans `src/server/systems/` ni dans `src/client/src/systems/`, et qu'il ne s'appelle pas `platform` (portée réservée du stockage navigateur, refusée par le Loader), et cherche une spec existante `documentations/slugs/<slug>/spec_<slug>.md` (index : `documentations/README.md`). Si elle existe, c'est ta base : ne repose pas les questions auxquelles elle répond déjà.
2. Demande-moi ce que tu ne sais pas encore. Au-delà de trois ou quatre questions, écris-les dans la spec, en tableaux `| # | Question | Proposition (reco) | Réponse MJ |` : j'y réponds dans l'IDE. Questions de base :
    - mécanique de dés (pool, seuil, d20, 2D20, PbtA…), succès, critiques, explosions ;
    - contenu de la fiche (caractéristiques, compétences, ressources, équipement, liens…) ;
    - besoins côté MJ (ressources de session, PNJ, rounds et tours) ; PNJ et initiative passent par les briques de la plateforme (guide §2) ;
    - palette de couleurs et identité visuelle ;
    - les règles de référence (lore, livre de base) si je peux te les fournir : n'invente rien qui les contredise ; les tables qu'on ne trouve que dans un PDF se transcrivent (agent) puis se relisent avec moi.

   Pour chaque fonction, pose-toi la question « **table ou app ?** » (guide §1).
3. Lis les specs de la plateforme listées au §2 du guide et réutilise ses briques avant d'écrire un composant. Il n'y a **pas de slug de référence** : un slug existant peut montrer un pattern appliqué, mais il ne fait pas foi ; vérifie-le contre le guide et `code-rules/` avant de t'en inspirer.
4. Si la spec ou les règles sont volumineuses, propose un **découpage en lots** (ordre au §1 du guide). La phase 2 détaille le premier lot et fixe dès maintenant les structures de données des suivants. Chaque lot repasse par cadrage, spécification et validation.
5. Demande-moi tôt le code d'accès d'un personnage de dev, pour vérifier la fiche à l'écran ; le code MJ de dev est `GMCODE`. Ne lance jamais ton propre serveur sur le port 3001 sans me prévenir, et dis-moi quand relancer `npm run dev` (fichier serveur nouveau, migration).

## Phase 2 — Spécification (à faire valider)

Présente :
- le schéma SQLite du slug (guide §4) ;
- les routes au-delà de `characters.js` et les éventuels handlers socket ;
- la logique des 5 hooks de dés ;
- l'arborescence des composants et le découpage de la fiche (guide §5) ; onglets et ordre ;
- le contenu des menus joueur et MJ (éléments prêts à l'emploi, éléments propres au slug, icônes ou aucune) et leur habillage ;
- l'emplacement, dans l'onglet Session du MJ, de `TableSessionTools` (musique, tableau) et ses classes de bouton, et si le slug pose le tableau dans un onglet ;
- le choix du panneau d'historique des jets, et socket ou HTTP pour d'éventuelles ressources de session ;
- le découpage en lots s'il y en a un (phase 1, étape 4).

**Proposition graphique** : produis la planche décrite au §3 du guide avant tout code d'habillage. Pour une police à télécharger, donne son nom et l'adresse où la télécharger : je dépose moi-même les fichiers.

Expose les choix ouverts avec leurs avantages et inconvénients, et donne ta recommandation. Une fois validée, la spec est enregistrée (ou mise à jour) dans `documentations/slugs/<slug>/spec_<slug>.md` et ajoutée à l'index `documentations/README.md`.

## Phase 3 — Implémentation

Crée les fichiers du §4 du guide (aucun fichier hors des dossiers du slug, la découverte est automatique), rangés selon le §5, en respectant les standards du §6. `hidden: true` dans `config.js` **seulement si je le demande**.

Avant d'annoncer la fin, vérifie **chaque point de la checklist du guide (§7)** et coche-les dans ton récapitulatif. Vérifie à l'écran, jour et nuit, côté joueur (code de dev) et côté MJ (`GMCODE`). Puis propose la relecture croisée (`/relecture`) comme pour tout chantier.

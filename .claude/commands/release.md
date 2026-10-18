---
description: Mettre en production la version actuelle (archive, migrations, envoi, redémarrage)
argument-hint: [patch|minor|major] [fast]
---

Mise en production : **$ARGUMENTS** (par défaut : `patch`, vérifications complètes).

Référence : `documentations/spec_release.md`. La commande technique est `npm run release` (`scripts/release.js`), qui exécute `scripts/install.sh` sur le VPS. **Ne lance jamais la release sans ma validation explicite dans la conversation.**

## 1. Préparation (aucune écriture sans accord)

1. Vérifie que `deploy.config.json` existe à la racine (sinon, indique-moi de le créer depuis `deploy.config.example.json`). N'affiche pas son contenu.
2. Liste les migrations de `database-template/migrations/` absentes de `released.txt`. Pour chacune, vérifie l'en-tête `-- systems: <slug,...|all>` dans le bloc de commentaires du début. S'il manque, lis le SQL (tables touchées, nom du fichier), **propose** la valeur et attends mon accord avant de l'ajouter.
3. Liste les fichiers non commités qui partiraient (`git status --porcelain -- src/server database-template src/client/src package.json`). Signale ceux qui ressemblent à un chantier inachevé : slug à moitié créé, import vers un fichier absent, code de debug. Les fichiers de `documentations/` ne partent pas, ignore-les.

## 2. Message de release

Rédige le message du commit de release au format habituel du dépôt (voir `git log`) : première ligne `Release vX.Y.Z`, puis les blocs `Général (…) :` / `Slug X :` avec des puces à l'infinitif, résumant les commits depuis le dernier tag `v*` (ou depuis le début si aucun tag) et les changements non commités qui partent. Termine par la ligne `Co-Authored-By` habituelle.

## 3. Validation

Présente en une fois : version cible, migrations et bases visées, fichiers non commités inclus, message. Attends mon « go ».

## 4. Lancement

Écris le message dans un fichier temporaire de ton scratchpad, puis lance (option `--minor`/`--major`/`--fast` selon les arguments) :

```
npm run release -- --yes --message-file=<chemin du fichier>
```

`--yes` est nécessaire car tu ne peux pas répondre aux confirmations interactives ; c'est ma validation de l'étape 3 qui en tient lieu. La connexion SSH doit pouvoir se faire sans saisie : si ma clé a une passphrase, l'agent SSH doit l'avoir chargée. Si SSH demande une saisie ou échoue à l'authentification, arrête-toi et dis-moi de lancer `! npm run release` moi-même.

## 5. Compte rendu

- Succès : version installée, migrations jouées, rappel de faire F5 si le front a changé. Le tag n'est pas poussé : propose `git push --follow-tags`.
- Échec : étape en échec, et état de la prod d'après la sortie de `install.sh` (retour arrière effectué ou non). Ne relance rien de toi-même.

---
description: Faire relire le code d'un chantier par Codex (gpt-6-astra), appliquer les corrections, présenter les suggestions
argument-hint: [fichiers à relire, séparés par des espaces] (par défaut : les fichiers de code modifiés)
---

Relecture croisée : **$ARGUMENTS**

Référence : `documentations/spec_relecture.md`. Les règles sont dans `code-rules/` (`common.md`, `front.md`, `back.md`). Codex relit en **lecture seule** ; c'est toi (Claude) qui appliques les corrections.

À la fin d'une implémentation, une fois lint, tests et build verts, tu **proposes** cette relecture à l'utilisateur (périmètre et nombre de fichiers) et tu ne la lances **que sur son accord** : elle coûte cher en quota (une relecture d'une trentaine de fichiers a pris 30 % d'une session de 5 h, décision du 2026-11-11). Même règle pour une seconde passe. Lancée à la main par `/relecture`, elle vaut accord.

## 1. Fichiers à relire

- Si `$ARGUMENTS` liste des fichiers, prends-les.
- Sinon, si tu viens d'implémenter un chantier, prends la liste de ses fichiers.
- Sinon (lancement à la main sans argument) : fichiers de code modifiés ou nouveaux de l'arbre de travail.
  ```bash
  git diff --name-only HEAD -- src database-template scripts tests package.json
  git ls-files --others --exclude-standard -- src database-template scripts tests
  ```
  Si l'arbre contient des modifications sans rapport visible avec un chantier (retouches manuelles), demande la liste à l'utilisateur plutôt que de deviner.

Périmètre : code et configuration seulement (`src/`, `database-template/`, `scripts/`, `tests/`, `package.json`, `eslint.config.js`, `vite.config.js`…). Jamais la doc, les planches, les images.

Repère aussi la **spec du chantier** dans `documentations/` (s'il y en a une) : elle est donnée en contexte.

## 2. Consigne

Écris la consigne dans ton dossier temporaire de session (scratchpad), fichier `relecture-consigne.md`, en remplissant ce gabarit :

```md
Tu es le relecteur de code de ce dépôt, en lecture seule : tu ne modifies aucun fichier et tu ne lances aucune commande Git qui modifie l'état.

Lis d'abord AGENTS.md, puis les grilles de règles code-rules/common.md, code-rules/front.md, code-rules/back.md.
Spec du chantier (contexte, choix validés) : <chemin de la spec, ou « aucune »>.
Chantier : <une phrase sur ce qui a été fait>.

Fichiers à relire :
<un chemin par ligne>

Ce que tu relis : les lignes ajoutées ou modifiées de ces fichiers (`git diff HEAD -- <fichier>` ; un fichier non suivi par Git se relit en entier). Le reste du dépôt sert de contexte : ouvre les composants appelés, les routes visées, les contrats, pour vérifier que le nouveau code les respecte.

Classement :
- Correction : écart à une règle de niveau « Règle » d'une grille, dans les lignes relues. Cite l'identifiant (rule). Pas d'identifiant applicable = pas de correction.
- Suggestion : performance, logique, maintenabilité, ergonomie, sécurité au sens des grilles, ou « Préférence » sans commentaire de justification (catégorie « préférence »). Toujours avec un argument.
- unclearRules : une règle sur laquelle tu as hésité, et pourquoi.

Ne remonte pas :
- les « Choix assumés » listés en tête des grilles ;
- la dette existante hors des lignes relues ;
- ce que le lint contrôle (règles marquées « lint ») : il est vert ;
- le style personnel (nommage, formatage) qui ne relève d'aucune règle.

Sois précis : fichier, ligne, problème, correctif. Vérifie chaque point dans le code avant de le remonter. Une liste vide est une bonne réponse.
Réponds en français, au format JSON imposé. summary : deux ou trois phrases sur la qualité du chantier.
```

## 3. Lancer

Commande en **arrière-plan** (`run_in_background`), depuis la racine du dépôt, en ASCII seulement (la consigne passe par l'entrée standard : ses accents cassent une commande shell sous Windows) :

```bash
codex exec -m gpt-6-astra -c model_reasoning_effort=medium -s read-only --ephemeral \
  -C "<racine du dépôt>" --output-schema .claude/commands/relecture.schema.json \
  -o "<scratchpad>/relecture.json" - < "<scratchpad>/relecture-consigne.md"
```

Attends la notification de fin ; ne relance pas pendant ce temps. Ne simule jamais une relecture.

**Quota Codex épuisé** (« usage limit ») : la relecture est **sautée**, pas reportée. Le chantier continue comme avant la relecture (compte rendu, commit si l'utilisateur l'a demandé) ; dis-le en une ligne et note « non relu (quota) » dans le journal. On ne relance pas le chantier plus tard. Autre échec (réseau, erreur de la CLI) : dis-le et propose de relancer.

## 4. Traiter le résultat

Lis `relecture.json` (corrections, suggestions, unclearRules, summary).

1. **Corrections** : vérifie chacune dans le code.
   - Fondée : applique-la (patch ciblé, fins de ligne préservées).
   - Fausse à ton avis : ne l'applique pas, marque-la **contestée** avec ton argument et la précision de grille qui éviterait la méprise. Ne passe jamais outre en silence.
2. Relance lint, tests et build (ceux du côté touché).
3. **Seconde passe** seulement si une correction a touché la logique (pas un renommage, une classe CSS, un commentaire) : même commande, limitée aux fichiers corrigés. Deux passes au plus.
4. **Suggestions** : n'en code aucune sans l'accord de l'utilisateur. Donne pour chacune ton avis : « à faire », « pas utile » ou « à voir », en une phrase.

## 5. Journal

Ajoute une ligne au tableau de `code-rules/relecture-log.md` (date, chantier, identifiants des corrections appliquées avec leur nombre, contestées, suggestions retenues / proposées) et mets à jour le décompte par identifiant. Les suggestions retenues se complètent après la réponse de l'utilisateur.

## 6. Compte rendu à l'utilisateur

Dans cet ordre, sans rien omettre :
1. **Corrections faites** : une ligne chacune (identifiant, fichier, ce qui a changé).
2. **Corrections contestées** : la correction, ton argument, la précision proposée pour la grille. L'utilisateur tranche.
3. **Suggestions** : liste numérotée, chacune avec l'argument de Codex et ton avis. L'utilisateur tranche ; une suggestion retenue se code dans le même chantier.
4. **Règles peu claires** (`unclearRules`), avec la précision que tu proposes.
5. **Récurrences** : tout identifiant qui atteint trois corrections dans le journal, avec une proposition (règle mieux placée ou mieux écrite, contrôle mécanique, ou habitude de code à changer).

Le résumé de Codex (`summary`) en une phrase pour finir.

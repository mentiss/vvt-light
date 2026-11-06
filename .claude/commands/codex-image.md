---
description: Générer des images (ornements, textures, illustrations) avec la CLI Codex et les vérifier
argument-hint: <fichier de demandes .md | description de l'image>
---

Génération d'images : **$ARGUMENTS**

La CLI Codex (`codex`, installée globalement, compte de l'utilisateur) génère des images avec son outil
d'image et les copie où on lui dit. C'est le moyen standard d'obtenir les ornements, textures et
illustrations des slugs (planches comprises). Accord déjà donné par l'utilisateur : lance les
demandes sans redemander, mais annonce combien tu en lances.

## 1. Préparer les demandes

- Une demande = un fichier de sortie. Si `$ARGUMENTS` est un fichier de demandes (ex.
  `documentations/<slug>/demandes_images.md`), prends ses tableaux `| Fichier | Demande |` ; sinon
  écris la demande toi-même et ajoute-la à ce fichier (il sert de trace et de reprise).
- Prompt **en anglais**, précis : sujet, style, cadrage (format 1:1, 5:2…), fond, ce qui est interdit.
- **Ornements** destinés à être teintés par le thème (masque CSS) : « flat pure black silhouette on a
  fully transparent background », PNG.
- **Textures** : « seamless tileable texture, very low contrast, no text » (elles passent sous du texte).
- **Toujours** : « no text », et pour les univers sous licence (W40K, WoD…) « original design in the
  spirit of …, not the official logo » : jamais de reproduction d'un logo ou d'une marque.

## 2. Lancer

Dossier de sortie :
- planche en cours (slug pas encore créé) : `documentations/<slug>/images/` ;
- slug existant : `src/client/src/systems/<slug>/assets/` (convention des slugs : `url('./assets/…')`).

Commande, depuis le dossier de sortie (une par image) :

```bash
cd <dossier de sortie> && codex exec -s workspace-write --skip-git-repo-check \
  "Generate an image with your image generation tool, then save the resulting PNG file in the current directory as <nom>.png (copy it from wherever the tool writes it). Image: <prompt>. Reply only with the saved file path."
```

- Compte environ 1 à 2 minutes par image. Pour un lot, lance les commandes **en parallèle en
  arrière-plan** (`run_in_background`), par paquets de 4 ou 5, plutôt qu'à la suite.
- Les originaux restent aussi dans `~/.codex/generated_images/<session>/`.

## 3. Vérifier chaque image (obligatoire)

L'aperçu de l'outil Read affiche la transparence en noir : une silhouette noire y paraît vide.
Compose l'image sur un fond clair avant de la juger :

```bash
python -c "from PIL import Image; im=Image.open('<f>.png'); print(im.mode, im.size); bg=Image.new('RGBA', im.size, (230,220,195,255)); bg.alpha_composite(im.convert('RGBA')); bg.convert('RGB').save('<scratchpad>/<f>_check.png')"
```

Contrôle : mode `RGBA` et fond réellement transparent pour un ornement ; aucun texte ; pas de logo
officiel ; cadrage demandé ; texture sans couture (au besoin, juxtapose deux copies). Une image ratée
se relance avec un prompt corrigé ; signale-la dans le compte rendu.

## 4. Après

- Réduis si besoin (ornement : 512 à 1024 px de large suffisent ; texture : WebP 1024², qualité 80)
  pour garder le dépôt léger.
- Note dans le fichier de demandes, par ligne : fait / relancé / à revoir.
- Montre le résultat à l'utilisateur (planche mise à jour ou planche-contact des images).

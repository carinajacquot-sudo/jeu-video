# Astreval : rendu HD et combat natif de 0 A.D.

La version jouable est dans **ce dépôt 0 A.D.**, pas dans Godot. Les maillages `.dae`, textures et cartes sont préinstallés ; Blender, Pillow, NumPy et Internet ne sont pas nécessaires pour **jouer**.

## Lancer

Depuis la racine du dépôt, avec un bureau Linux compatible OpenGL :

```sh
python3 tools/play_astreval.py --quality balanced --map astreval_duel
python3 tools/play_astreval.py --quality cinematic --map astreval_arcadia
python3 tools/play_astreval.py --quality performance --resolution 3840x2160
```

`--map` accepte `astreval_arcadia`, `astreval_first_steps`, `astreval_duel`.
`--quality` vaut `cinematic`, `balanced` ou `performance` ; `--resolution 3840x2160` force la taille de sortie. Le profil performance produit cette taille avec un rendu interne à 75 % et FSR, mais l'efficacité dépend de votre GPU. Les options sont uniquement passées en ligne de commande : aucun réglage personnel n'est modifié. Le moteur 0 A.D. natif exige un affichage Linux ; une URL Codespace ne transmet pas automatiquement sa fenêtre 3D au navigateur.

| Touche | Action |
|---|---|
| F4 | Sélectionner le héros et passer à la caméra TPS. |
| ZQSD / WASD | Déplacer le personnage en suivant sa direction, avec le pathfinding natif. |
| Maj | Courir ; Maj+X pour le coup lourd. |
| F | Revenir au RTS ou passer en TPS. |
| E | Mettre la grande épée au dos / en main (points d'attache du squelette). |
| X | Attaque légère. 2e et 3e coups rythmiques : bonus modérés d'enchaînement. |
| Maj+X | Attaque lourde (1,75×), coût d'endurance plus élevé. |
| V maintenu | Garde frontale, parade renforcée pendant les 360 premières millisecondes. |
| B | Esquive directionnelle (ou retraite par défaut) à travers le pathfinding/collision natifs. |

L'attaque valide la cible, les dégâts, le rythme et l'armure **dans la simulation 0 A.D.** via Attack/UnitAI ; les ordres réseau vérifient l'unité possédée et ne contiennent ni dégâts ni cible choisie par le client. L'épée est affichée dans un unique point d'attache à la fois. Les animations d'attaque à deux mains sont celles du squelette biped du jeu. Il n'existe pas encore de séquences originales filmées de sortie d'épée, de roulade ou de prise à deux mains dédiée.

## Graphisme et provenance

- Cape noire **2048×4096**, armure **2048²**, épée **2048²** : diffuse, normales, spéculaire ; version originale plus légère disponible à la qualité `balanced`/`performance` via `max_actor_quality=100`. Deux fichiers `.dae` définissent les points d'attache « dos » et « main ».
- Prairie **4096²** : scan CC0 *Leafy Grass* de **Charlotte Baglioni / Poly Haven**. Normales GL et rugosité adaptées au modèle diffuse/normal/specular de 0 A.D. Les cinq normales/diffuses DDS compressés BC1 ont une **chaîne de mipmaps complète** ; sans elle Pyrogenesis rejette les fichiers. Voir `art/source/astreval/LEAFY_GRASS_LICENSE.txt`.
- Architecture, autres soldats, arbres, animations et contenu de la grande carte d'Arcadie : assets historiques 0 A.D. de Wildfire Games, conservés dans leur état natif. **Tous les éléments de cette grande carte ne disposent pas individuellement de nouvelles textures 4K**. Une sortie 4K ne transforme pas de vieux modèles en meshes haute densité.
- Méthodes étudiées : [manuel de combat 0 A.D.](https://gitea.wildfiregames.com/0ad/0ad/wiki/Manual_BasicGameplay), [notes de la version Alpha 27, Vulkan/FSR/skin GPU](https://play0ad.com/new-release-0-a-d-alpha-27-agni/), [export COLLADA Blender vers 0 A.D. (guide communautaire ancien)](https://wildfiregames.com/forum/topic/17842-how-to-export-animations-from-blender3d-to-0ad/), [licence de Poly Haven](https://polyhaven.com/license). Les idées sont adaptées aux API actuelles du moteur ; pas de code tiers copié.

Les textures modifiées issues de l'art 0 A.D. portent les conditions de l'art Wildfire Games (notamment CC BY-SA 3.0). Le scan Poly Haven reste CC0. Le code dérivé du jeu demeure sous GPL-2.0-ou-ultérieure.

## Reconstruction et vérifications

La reconstruction de l'épée nécessite **Blender 3.6 avec export COLLADA** (`tools/build_astreval_greatsword.py`). Pour reconstruire les textures, utiliser Pillow et NumPy (`tools/build_astreval_hd_textures.py`) ; le module `pack_astreval_dds.py` construit explicitement les mipmaps BC1 pour les fichiers DDS. Ces dépendances ne sont pas requises pour lancer le jeu.

```sh
node tools/test_astreval_combat.js
python3 tools/play_astreval.py --quality cinematic --resolution 3840x2160 --dry-run
```

Trois cartes ont exécuté des parties de simulation non visuelles sans erreur. Un essai graphique sous Xvfb/llvmpipe **1280×720, profil équilibré** valide l'affichage de la cape, la texture de prairie, l'épée dos/main et les commandes X/V/B. La compilation ou simulation ne garantit pas les performances : **le 3840×2160 natif, le profil cinématique fluide et les performances Vulkan sur une véritable carte graphique n'ont pas été mesurés**. Les démos plates montrent encore parfois une limite noire à l'horizon ; la carte paysagée d'Arcadie est plus riche mais son chargement graphique est très lent en rendu logiciel.

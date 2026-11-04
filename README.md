# Jeu vidéo — 0 A.D. comme base

Projet de jeu d'exploration (ville, royaume, personnages, mystères et conflits) construit **en modifiant le code natif de 0 A.D.**, dans le Codespace. Pas de Godot.

## Étape 1 : caméra à la troisième personne

Le clone de 0 A.D. se trouve dans `/workspaces/0ad`, sur la branche locale `astreval/third-person-camera` (commit `0572a783`). Les changements portent sur le moteur C++ (`CameraController`, `GameView`, interface JavaScript) et sur le GUI de session de 0 A.D.

- Sélectionner une unité : la caméra suit automatiquement **derrière le personnage, près du sol** (distance 9, hauteur 4,4, champ de vision 68°).
- **F** : alterner entre la caméra à la troisième personne et la caméra RTS d'origine.
- La position de l'unité est interpolée pour éviter les saccades ; les paramètres sont réglables dans `[view]` de `binaries/data/config/default.cfg`.
- Les autres modes de suivi restent présents. La caméra RTS reprend ses paramètres de projection lorsqu'on quitte le nouveau mode.

Il s'agit d'une **première étape caméra** : les touches ZQSD/WASD ne déplacent pas encore le personnage, les contrôles RTS restent nécessaires pour lui donner des ordres. La compilation du moteur et une vérification visuelle dans le jeu restent à faire : les dépendances natives de 0 A.D. (notamment Boost et SpiderMonkey pour Linux) ne sont pas encore installées/construites dans ce Codespace.

## Retrouver les changements

La version en cours est déjà modifiée dans `/workspaces/0ad`. Pour appliquer le correctif à **un clone non modifié** du même commit (`61a3b950`) :

```sh
cd /workspaces/0ad
git apply --check /workspaces/jeu-video/patches/camera-tps.patch
git apply /workspaces/jeu-video/patches/camera-tps.patch
```

Ne pas relancer ces commandes sur la branche déjà modifiée. Vérifications disponibles dans le Codespace :

```sh
cd /workspaces/jeu-video
node tests/third_person_camera.test.js
cd /workspaces/0ad
git show --check --format= HEAD
node --check binaries/data/mods/public/gui/session/third_person_camera.js
```

Le test JavaScript simule l'API native : il **ne remplace pas** une compilation ni un essai dans le moteur graphique.

## Ressources et licences

Le code de 0 A.D. et ses modifications sont sous **GPL-2.0-ou-ultérieure** (texte dans `licenses/GPL-2.0.txt`) ; les assets de 0 A.D. ont leur propre licence CC BY-SA 3.0. Pour les étapes suivantes, les packs Kenney *Fantasy Town Kit*, *Mini Character 1* (animations) et *Mini Dungeon* repérés sur OpenGameArt sont CC0, mais **aucun de ces packs n'est intégré à ce patch caméra**. Conserver les attributions et licences appropriées lors des futures intégrations.

# Astreval — villages, quêtes et modes héros/RTS (0 A.D.)

## État au 5 novembre 2026

Le correctif est **appliqué au vrai dépôt 0 A.D./Pyrogenesis** dans le Codespace `jeu-vid-o-5g6vqv5wq5jxh794r`, branche `astreval/village-rts-quests`, commit **`a0f37f40`** (arbre propre). Il s'ajoute au commit HD/combat `2200f531`. Le [correctif autonome](../patches/astreval-village-phase4.patch) reprend les 25 fichiers modifiés ou ajoutés par ce commit, y compris deux tests reproductibles.

**Testé dans Pyrogenesis** sous Xvfb/llvmpipe en **1280 × 720** : chargement complet d'Arcadie et de la nouvelle carte sans erreur de simulation/GUI ; sélection du héros, TPS/RTS, étoile masquée en TPS, dialogue G et choix de quête ; sur la nouvelle carte, le raid a été repoussé puis la reconnaissance autonome a fait avancer la quête jusqu'au rapport du guide. Les captures sont dans [`screenshots/`](../screenshots/) (le jeu affiche une bande noire à l'horizon sous le rendu logiciel, déjà observée à l'étape précédente). Seuls des avertissements ALSA d'absence de périphérique audio ont été observés dans les journaux de ces essais.

**Limites de validation** : le duel complet et la trêve sont exercés par les tests de simulation déterministe, mais **pas encore joués de bout en bout manuellement dans le moteur**. La sauvegarde/reprise de ces quêtes et les performances GPU en 3840 × 2160 n'ont pas été mesurées. Une capture 1280 × 720 ne prouve rien pour un GPU 4K.

## Expérience livrée

- **Arcadie** : village existant enrichi d'une ancienne, d'un guide, de trois habitantes, de gardes, d'éclaireurs, d'un aventurier et d'un chef rival près du village adverse. La carte garde ses 4 205 entités précédentes et en ajoute 12.
- **`astreval_village`** : nouvelle carte de deux villages plus rapprochés (100 entités), permettant de découvrir l'histoire sans traverser toute Arcadie.
- **Héros** : vue au dos réservée à la sentinelle à cape noire et grande épée. Sélectionner un soldat repasse en RTS native. L'étoile sous le héros est masquée en TPS et visible en RTS, sans perdre la sélection.
- **Troupes** : gardes tenant des postes, deux éclaireurs qui découvrent le camp rival puis reviennent, aventuriers puissants. Les ordres directs RTS prennent le dessus durant 35 secondes. Pendant le duel, les autres unités sont maintenues passives et les attaques-mouvements pouvant troubler le tête-à-tête sont bloquées.
- **Quêtes et conséquences** : l'ancienne déclenche une défense contre trois pillards ; renfort facultatif de deux aventuriers contre 50 bois ; aide aux habitantes pour gagner réputation et bois ; rapport du guide ; choix du duel 1v1 contre le chef rival, ou trêve si réputation ≥ 4. Victoire en duel : +180 bois ; trêve : +80 bois. Les récompenses et les choix sont validés côté simulation et ne se répètent pas.
- **Fin scénarisée** : la conquête automatique est désactivée pour éviter la victoire immédiate entre villages neutres ; le journal annonce la paix ou la défaite, sans écran de victoire natif.

## Contrôles

| Action | Touche |
|---|---|
| Sélectionner le héros / revenir en TPS | F4 |
| Basculer TPS ↔ RTS | F |
| Déplacer / courir avec le héros | ZQSD ou WASD / Maj |
| Parler / refermer le dialogue proche | G |
| Équiper / frapper / coup lourd | E / X / Maj+X |
| Parer / esquiver | V / B |
| Choisir une réponse | Cliquer dans le panneau de dialogue |
| Donner des ordres aux soldats | Commandes habituelles en RTS |

L'étoile bleue vue sous le héros n'est **pas un objet de quête** : c'est la texture de sélection native `star.png` héritée du modèle de héros de 0 A.D. Le drapeau `AlwaysVisible` a été retiré uniquement de ce héros ; le GUI contrôle ensuite sa présence selon la caméra.

## Jouer et vérifier dans le Codespace

```bash
cd /workspaces/0ad
git switch astreval/village-rts-quests
python3 tools/play_astreval.py --quality balanced --map astreval_village
# Ou : python3 tools/play_astreval.py --quality balanced --map astreval_arcadia
node tools/astreval_village_tests/quest_simulation.test.js
node tools/astreval_village_tests/camera_gui.test.js
```

Pour appliquer le correctif à **un autre clone** basé sur `2200f531`, télécharger `astreval-village-phase4.patch`, puis `git apply --check` et `git apply`. Il n'est pas nécessaire de réappliquer le patch dans ce Codespace : le commit `a0f37f40` contient déjà son contenu.

Les tests Node exécutent les vraies fonctions du scénario, du dispatch des commandes et du GUI avec des composants moteur simulés. Les essais Xvfb ont vérifié les chargements et plusieurs interactions natives ; ils ne constituent ni un benchmark GPU ni une certification de toutes les branches de quête.

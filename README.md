# OscarOS — Portfolio d'Oscar Bonant (BTS SIO)

**▶ Voir le site en ligne : <https://oscar-bit08.github.io/portfolio/>**

Un portfolio qui se visite comme un **système d'exploitation** : une installation façon Windows pour faire connaissance, puis un bureau en « verre liquide » avec des applications à ouvrir, déplacer et réduire.

Le site est écrit en **HTML, CSS et JavaScript sans framework**, sans étape de compilation : il suffit d'ouvrir `index.html`.

---

## 1. Parcours du visiteur

| Étape | Ce qui se passe | Fichiers concernés |
|---|---|---|
| Démarrage | Écran noir, logo « ob » animé (le disque apparaît, l'anneau du « o » se trace, un reflet balaie le logo) et barre de chargement lumineuse | `index.html`, `boot.css`, `oobe.js` (`OS.boot`) |
| **À propos** | 5 slides inspirées de la première installation de Windows : Bienvenue, Profil, Formation, Expériences, Projet pro | `oobe.js`, `illustrations.js`, `boot.css` |
| Transition | « Bonjour. » → « Préparation de votre bureau… » | `oobe.js` (`OS.hello`), `boot.css` |
| Bureau | Fond d'écran en feuilles superposées qui se mettent en place avec un effet de profondeur, icônes placées **aléatoirement**, dock **escamotable**, barre du haut | `wallpaper.js`, `desktop.js`, `desktop.css` |
| **Compétences** | Un **graphe** : chaque compétence est un point de sa couleur (taille = niveau), relié par de fines lignes à son domaine ; un clic ouvre le détail | `apps/competences.js`, `apps.css` (A) |
| **Réalisations** | Éditeur de texte maison : bibliothèque de fichiers, puis lecture sur une page avec une barre d'outils fine | `apps/realisations.js`, `apps.css` (B) |
| **Contact** | Carnet d'adresses : Gmail, LinkedIn, GitHub… (clic = redirection) | `apps/contact.js`, `apps.css` (C) |
| **Veille** | Icône d'alimentation → l'écran s'éteint progressivement → message « échec de la mise en veille, déviation vers le dossier veille informatique » → le terminal apparaît (léger glitch) et écrit la veille → `Redémarrer ? [y/n]` | `veille.js`, `veille.css` |

**Le dock** (barre des applications) est caché pour laisser toute la place aux fenêtres : en approchant la souris du bas de l'écran, au centre, une petite barre apparaît ; la survoler déplie le dock. Sur téléphone, la petite barre reste visible et se touche.

À chaque rechargement de la page, le visiteur repasse par les slides « À propos » (un bouton **Passer l'introduction** permet de les sauter). Elles sont aussi accessibles depuis le bureau : icône **OB** du dock ou menu **OscarOS** en haut à gauche.

---

## 2. Organisation des fichiers

```
TP portfolio/
├── index.html                 Squelette : les « écrans » du système
├── README.md                  Ce fichier
└── assets/
    ├── css/
    │   ├── base.css           Variables du thème, effet verre (.glass), boutons
    │   ├── boot.css           Démarrage, slides À propos, illustrations
    │   ├── desktop.css        Fond d'écran en couches, icônes, dock escamotable, barre du haut
    │   ├── windows.css        Fenêtres (barre de titre, boutons, redimensionnement)
    │   ├── apps.css           Compétences (graphe), Réalisations (éditeur), Contact
    │   └── veille.css         Extinction, glitch, message d'erreur, terminal
    └── js/
        ├── data.js            ★ TOUT LE CONTENU (textes, projets, liens)
        ├── core.js            Outils communs + objet global OS
        ├── icons.js           Icônes SVG (interface, applications, logo « ob », marques)
        ├── wallpaper.js       Fond d'écran en 3 plans + effet de profondeur
        ├── illustrations.js   Illustrations des 5 slides
        ├── windows.js         Gestionnaire de fenêtres
        ├── apps/
        │   ├── competences.js
        │   ├── realisations.js
        │   └── contact.js
        ├── veille.js          Mise en veille + terminal
        ├── desktop.js         Bureau, icônes aléatoires, dock
        ├── oobe.js            Démarrage + slides À propos
        └── main.js            Lance la séquence complète
```

Chaque fichier commence par un bloc de commentaires qui explique son rôle, et chaque fonction est commentée.

---

## 3. Modifier le contenu

**Tout se passe dans `assets/js/data.js`**, aucun autre fichier n'est à toucher :

- **Ajouter un projet** : copier un bloc de `realisations`, changer l'`id`, le titre, les sections. Il apparaît automatiquement comme un nouveau fichier dans l'éditeur Réalisations.
- **Ajouter une compétence** : copier un bloc de `competences.liste`. Elle apparaît automatiquement comme un nouveau point du graphe : un disque noir cerclé de sa `couleur`, avec au centre le logo du logiciel (champ facultatif `logo`, par exemple `blender`, voir `MARQUES` dans `icons.js`) ou, à défaut, son `icone` ; le champ `projets` contient les `id` des réalisations liées : elles deviennent cliquables dans le détail, et deux compétences qui partagent un projet sont reliées par des pointillés.
- **Ajuster un niveau** : champ `niveau` de 1 (Notions) à 4 (Avancé) — c'est aussi la taille du point.
- **Renommer un domaine** : `competences.categories` (`nom` pour la légende, `court` pour l'étiquette posée sur le graphe).
- **Changer un lien de contact** : tableau `contacts`.
- **Modifier la veille** : objet `veille` (texte découpé en blocs, vitesse d'écriture en caractères par seconde). Le message affiché avant le terminal est dans `erreur`, et `lectureErreur` règle le temps laissé pour le lire.

Les couleurs et dimensions du thème sont regroupées en haut de `assets/css/base.css` (section *Variables*).

---

## 4. Tester en local

Le plus simple : double-cliquer sur `index.html`.

Pour un comportement identique à la mise en ligne (copie dans le presse-papiers notamment), lancer un petit serveur depuis le dossier :

```bash
python -m http.server 5500
```

puis ouvrir <http://localhost:5500>.

---

## 5. Mise en ligne (GitHub Pages)

Le site est publié automatiquement par GitHub Pages depuis la branche `main` de ce dépôt.

Pour publier une modification, depuis le dossier du projet :

```bash
git add .
git commit -m "Description de la modification"
git push
```

Le site en ligne est mis à jour environ une minute après le `push`.
Le fichier `.gitignore` empêche de publier les fichiers de travail (PDF de veille, ancienne page, dossier `.claude`).

**Après une modification du CSS ou du JavaScript**, augmenter le numéro de version `?v=…` dans `index.html` (par exemple `?v=2.0` → `?v=2.1`, sur toutes les lignes) : les visiteurs qui sont déjà venus téléchargeront ainsi la nouvelle version au lieu de garder l'ancienne en cache.

---

## 6. Points techniques notables

- **Effet « verre liquide »** : `backdrop-filter` (flou + saturation de ce qui est derrière), reflet spéculaire en `::before` et bordure lumineuse en `::after` grâce à un masque CSS (voir `.glass` dans `base.css`).
- **Logo « ob »** : dessiné en SVG. Le « o » est un anneau découpé dans le disque grâce à `fill-rule="evenodd"` ; au démarrage, l'anneau se « trace » en animant `stroke-dashoffset` et un reflet traverse le logo à travers un masque (`index.html`, `boot.css`, `OS.logo()` dans `icons.js`).
- **Fond d'écran en profondeur** : une même feuille au bord en S est recopiée en éventail (rotations successives autour d'un point hors de l'écran), avec ombre portée floutée et arête éclairée. Les feuilles sont réparties sur 3 plans qui bougent à des vitesses différentes (parallaxe) : à l'ouverture du bureau, puis légèrement en suivant la souris (`wallpaper.js`). Un clic sur le fond crée une ondulation qui pousse légèrement les icônes.
- **Dock escamotable** : une seule écoute `pointermove` détecte l'approche du bas de l'écran ; la position du dock déplié est lue dans sa matrice de transformation (`DOMMatrix`), ce qui permet d'y faire « filer » une fenêtre réduite même quand il est caché (`desktop.js`).
- **Graphe des compétences** : les points sont répartis sur une ellipse (un espace sépare les domaines), les étiquettes se placent vers l'extérieur ; les lignes sont en SVG, les points sont des boutons HTML (accessibles au clavier). Un `ResizeObserver` recalcule la disposition quand la fenêtre change de taille, et les points se glissent puis reviennent à leur place grâce à une petite simulation de ressort amorti (`apps/competences.js`).
- **Veille** : extinction par un voile noir dont l'opacité suit une courbe quadratique (lente puis de plus en plus rapide, 0,9 s) ; ouverture et fermeture du terminal par un glitch discret (`clip-path` en bandes, petits décalages, dédoublement rouge / cyan) en `steps()` (`veille.css`).
- **Icônes** : une direction artistique commune dessinée en SVG — tuile sombre, objet en « matière claire » et détail lumineux de la couleur de l'application (`icons.js`).
- **Placement aléatoire des icônes** : tirage au hasard avec détection de chevauchement, positions mémorisées en fractions de l'écran pour résister au redimensionnement (`desktop.js`).
- **Glisser-déposer** : *Pointer Events* + `setPointerCapture`, compatible souris et tactile.
- **Fenêtres** : une par application, premier plan au clic, réduction animée vers le dock (Web Animations API), plein écran par double-clic sur la barre de titre.
- **Mise en page adaptée à la fenêtre** : requêtes `@container` — une fenêtre étroite passe en mode compact même sur grand écran.
- **Terminal** : effet machine à écrire à vitesse constante (basé sur le temps écoulé), pause après la ponctuation, défilement automatique qui s'arrête si on remonte lire, illustration isométrique en SVG dont la couche s'allume selon la section lue.
- **Accessibilité** : navigation au clavier (flèches dans les slides, poignée du dock et points du graphe atteignables avec Tab, Échap pour refermer, Espace/Entrée dans le terminal), focus visible, respect du réglage système « réduire les animations ».
- **Optimisations** :
  - seules des propriétés gérées par la carte graphique (`transform`, `opacity`) sont animées en continu ; les anciens effets coûteux (taches floutées animées, texture d'eau générée en direct, ombres animées) ont été retirés ;
  - le fond d'écran est dessiné une fois sur 3 couches seulement, et la boucle de parallaxe s'arrête dès qu'il est immobile, ou quand une présentation le recouvre ;
  - le voile des fenêtres en arrière-plan remplace un `filter` qui forçait le navigateur à tout recalculer ;
  - les recalculs liés au redimensionnement sont regroupés avec `requestAnimationFrame` ;
  - numéro de version sur les fichiers CSS/JS pour que le cache du navigateur ne serve pas une ancienne version.

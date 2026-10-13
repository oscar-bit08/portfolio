# OscarOS — Portfolio d'Oscar Bonant (BTS SIO)

**▶ Voir le site en ligne : <https://oscar-bit08.github.io/portfolio/>**

Un portfolio qui se visite comme un **système d'exploitation** : une installation façon Windows pour faire connaissance, puis un bureau en « verre liquide » avec des applications à ouvrir, déplacer et réduire.

Le site est écrit en **HTML, CSS et JavaScript sans framework**, sans étape de compilation : il suffit d'ouvrir `index.html`.

---

## 1. Parcours du visiteur

| Étape | Ce qui se passe | Fichiers concernés |
|---|---|---|
| Démarrage | Écran noir, logo goutte d'eau et roue de chargement façon Windows | `oobe.js` (`OS.boot`), `boot.css` |
| **À propos** | 5 slides inspirées de la première installation de Windows : Bienvenue, Profil, Formation, Expériences, Projet pro | `oobe.js`, `illustrations.js`, `boot.css` |
| Transition | « Bonjour. » → « Préparation de votre bureau… » | `oobe.js` (`OS.hello`), `boot.css` |
| Bureau | Icônes placées **aléatoirement** à chaque visite, déplaçables, dock, barre du haut | `desktop.js`, `desktop.css` |
| **Compétences** | Application façon *Paramètres Windows* : liste à gauche, détail à droite | `apps/competences.js`, `apps.css` (A) |
| **Réalisations** | Éditeur de texte maison : bibliothèque de fichiers, puis lecture sur une page avec une barre d'outils fine | `apps/realisations.js`, `apps.css` (B) |
| **Contact** | Carnet d'adresses : Gmail, LinkedIn, GitHub… (clic = redirection) | `apps/contact.js`, `apps.css` (C) |
| **Veille** | Icône d'alimentation → l'écran s'éteint → un terminal écrit la veille → `Redémarrer ? [y/n]` | `veille.js`, `veille.css` |

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
    │   ├── desktop.css        Fond d'écran animé, icônes, dock, barre du haut
    │   ├── windows.css        Fenêtres (barre de titre, boutons, redimensionnement)
    │   ├── apps.css           Compétences, Réalisations (éditeur), Contact
    │   └── veille.css         Mise en veille, effet écran cathodique, terminal
    └── js/
        ├── data.js            ★ TOUT LE CONTENU (textes, projets, liens)
        ├── core.js            Outils communs + objet global OS
        ├── icons.js           Icônes SVG (interface, applications, logos)
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
- **Ajouter une compétence** : copier un bloc de `competences.liste`. Le champ `projets` contient les `id` des réalisations liées : elles deviennent cliquables dans le détail de la compétence.
- **Ajuster un niveau** : champ `niveau` de 1 (Notions) à 4 (Avancé).
- **Changer un lien de contact** : tableau `contacts`.
- **Modifier la veille** : objet `veille` (texte découpé en blocs, vitesse d'écriture en caractères par seconde).

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

---

## 6. Points techniques notables

- **Effet « verre liquide »** : `backdrop-filter` (flou + saturation de ce qui est derrière), reflet spéculaire en `::before` et bordure lumineuse en `::after` grâce à un masque CSS (voir `.glass` dans `base.css`).
- **Fond « eau »** : taches de couleur floutées qui dérivent + texture générée par un filtre SVG `feTurbulence` ; un clic sur le fond crée une ondulation qui, en atteignant les icônes, les pousse légèrement (comme des objets qui flottent).
- **Icônes** : une direction artistique commune dessinée en SVG — tuile sombre, objet en « matière claire » et détail lumineux de la couleur de l'application (`icons.js`).
- **Placement aléatoire des icônes** : tirage au hasard avec détection de chevauchement, positions mémorisées en fractions de l'écran pour résister au redimensionnement (`desktop.js`).
- **Glisser-déposer** : *Pointer Events* + `setPointerCapture`, compatible souris et tactile.
- **Fenêtres** : une par application, premier plan au clic, réduction animée vers le dock (Web Animations API), plein écran par double-clic sur la barre de titre.
- **Mise en page adaptée à la fenêtre** : requêtes `@container` — une fenêtre étroite passe en mode compact même sur grand écran.
- **Terminal** : effet machine à écrire à vitesse constante (basé sur le temps écoulé), pause après la ponctuation, défilement automatique qui s'arrête si on remonte lire, illustration isométrique en SVG dont la couche s'allume selon la section lue.
- **Accessibilité** : navigation au clavier (flèches dans les slides, Espace/Entrée dans le terminal), focus visible, respect du réglage système « réduire les animations ».

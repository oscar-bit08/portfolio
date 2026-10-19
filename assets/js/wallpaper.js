/* =====================================================================
   wallpaper.js — FOND D'ÉCRAN EN COUCHES (effet de profondeur)
   =====================================================================
   Inspiré des fonds d'écran d'origine d'iOS et d'Android : de grandes
   « feuilles » courbes superposées, comme du papier découpé.

   Les feuilles sont réparties sur 3 plans (fond, milieu, avant), chacun
   dessiné dans sa propre couche (un <div> qui contient un <svg>). Comme
   les couches sont indépendantes, on peut les déplacer À DES VITESSES
   DIFFÉRENTES : c'est l'effet de parallaxe, qui donne l'impression de
   profondeur (les plans « proches » bougent plus que les « lointains »).

   Deux mouvements :
     1. intro()   → à l'ouverture du bureau, les couches se mettent en
                    place l'une après l'autre (léger zoom arrière) ;
     2. parallaxe → sur ordinateur, les couches suivent très légèrement
                    la souris.

   OPTIMISATION : le dessin des couches ne change jamais, seule leur
   position bouge (propriété CSS transform). Le navigateur dessine donc
   chaque couche une seule fois, puis se contente de la déplacer avec la
   carte graphique. La boucle d'animation s'arrête dès que les couches
   sont immobiles.

   API : OS.wallpaper.intro() · OS.wallpaper.parallaxe(actif)
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;

  /* -------------------------------------------------------------------
     1. LES FEUILLES
     -------------------------------------------------------------------
     Toutes les formes sont dessinées dans un repère de 1600 × 1000. Le
     SVG utilise preserveAspectRatio="xMidYMid slice" : il remplit l'écran
     quelle que soit sa forme (comme background-size: cover).

     Composition « en éventail » (comme les fonds d'écran de référence) :
     une même feuille, au bord en forme de S, est recopiée plusieurs fois
     en la faisant pivoter autour d'un point situé en bas à gauche, hors
     de l'écran. Chaque copie recouvre en partie la précédente : on
     obtient une pile de feuilles dont les bords sont presque parallèles.
     Une seconde pile, plus petite, descend du coin en haut à droite.

     Les tracés débordent volontairement du cadre : seul le bord courbe
     reste visible, et il ne laisse jamais apparaître de « trou » quand
     la couche se déplace.

     angle    : rotation de la feuille autour du pivot (en degrés)
     couleurs : [bord éclairé, intérieur de la feuille]
     ------------------------------------------------------------------- */
  const EVENTAIL_BAS = {
    pivot: [-160, 1180],
    // Bord en S qui part du pivot et monte vers le haut à droite, puis la
    // forme se referme très loin hors de l'écran (en bas à droite)
    d: "M-160 1180 C120 930 260 760 470 640 C700 510 900 470 1060 260 C1170 120 1200 -40 1240 -400 L2600 -400 L2600 1900 L-160 1900 Z",
    // Dégradé : du bord (clair) vers l'intérieur de la feuille (sombre)
    sens: [700, 520, 1050, 900],
    feuilles: [
      { angle: -14, couleurs: ["#1c4fa8", "#0b2763"] },
      { angle: -5,  couleurs: ["#2563c4", "#0d3078"] },
      { angle: 4,   couleurs: ["#2f78d8", "#113b8f"] },
      { angle: 12,  couleurs: ["#3f8fe6", "#1648a3"] },
      { angle: 19,  couleurs: ["#5aa6f0", "#1d58b6"] },
      { angle: 25,  couleurs: ["#7cc0f6", "#2468c4"] }
    ]
  };
  const EVENTAIL_HAUT = {
    pivot: [2050, -350],
    // Pétale qui entre par le haut et ressort par le bord droit
    d: "M560 -400 C690 -60 930 190 1230 230 C1490 265 1690 300 1980 600 L2700 600 L2700 -900 L560 -900 Z",
    sens: [1180, 240, 1330, -40],
    feuilles: [
      { angle: -9, couleurs: ["#357ad8", "#0f3480"] },
      { angle: 0,  couleurs: ["#64a9f1", "#1a4fa8"] }
    ]
  };

  /* -------------------------------------------------------------------
     LES PLANS DE PROFONDEUR
     -------------------------------------------------------------------
     Les 8 feuilles sont réparties sur 3 plans, du fond vers l'avant
     (l'ordre d'empilement compte). Chaque plan est UNE couche que l'on
     déplace d'un bloc.
     OPTIMISATION : une couche par feuille (8 couches de la taille de
     l'écran) demanderait beaucoup de mémoire à la carte graphique,
     surtout sur les écrans haute définition. 3 plans suffisent à donner
     la sensation de profondeur.
     profondeur : 0 = tout au fond (immobile), 1 = tout devant
     ------------------------------------------------------------------- */
  const PLANS = [
    { profondeur: 0.25, feuilles: EVENTAIL_BAS.feuilles.slice(0, 3).map((f) => ({ ...f, groupe: EVENTAIL_BAS })) },
    { profondeur: 0.55, feuilles: EVENTAIL_HAUT.feuilles.map((f) => ({ ...f, groupe: EVENTAIL_HAUT })) },
    { profondeur: 0.9,  feuilles: EVENTAIL_BAS.feuilles.slice(3).map((f) => ({ ...f, groupe: EVENTAIL_BAS })) }
  ];

  const AMPLITUDE = 22;    // px : déplacement maximal du plan le plus proche
  const el = {};
  const couches = [];      // { noeud, svg, z }

  /* -------------------------------------------------------------------
     2. CONSTRUCTION DES COUCHES
     ------------------------------------------------------------------- */
  let compteur = 0;   // identifiants uniques des dégradés et découpes

  /** Code SVG d'une feuille : ombre, feuille, lumière du bord, arête. */
  function dessinerFeuille(f) {
    const i = compteur++;
    const { d, sens, pivot } = f.groupe;
    const [x1, y1, x2, y2] = sens;
    return `
      <defs>
        <linearGradient id="wp-g${i}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
          <stop offset="0" stop-color="${f.couleurs[0]}"/>
          <stop offset=".45" stop-color="${f.couleurs[1]}"/>
          <stop offset="1" stop-color="${f.couleurs[1]}" stop-opacity=".9"/>
        </linearGradient>
        <!-- Découpe à la forme de la feuille : la lumière du bord ne déborde pas -->
        <clipPath id="wp-c${i}"><path d="${d}"/></clipPath>
      </defs>
      <g transform="rotate(${f.angle} ${pivot[0]} ${pivot[1]})">
        <!-- 1. Ombre portée sur la feuille de dessous (copie floutée et décalée) -->
        <path d="${d}" fill="#010616" opacity=".6" transform="translate(-14 10)" filter="url(#wp-ombre)"/>
        <!-- 2. La feuille elle-même -->
        <path d="${d}" fill="url(#wp-g${i})"/>
        <!-- 3. Lumière diffuse le long du bord (trait large et flou, découpé) -->
        <path d="${d}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="46" filter="url(#wp-lueur)" clip-path="url(#wp-c${i})"/>
        <!-- 4. Arête fine et brillante -->
        <path d="${d}" fill="none" stroke="#e8f4ff" stroke-opacity=".35" stroke-width="1.3"/>
      </g>`;
  }

  function construire() {
    el.fond = OS.$("#wallpaper");

    const html = PLANS.map((plan) => `
      <div class="wallpaper__layer">
        <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
          ${plan.feuilles.map(dessinerFeuille).join("")}
        </svg>
      </div>`).join("");

    // Les filtres de flou sont déclarés une seule fois, dans un SVG invisible
    el.fond.innerHTML = `
      <svg class="wallpaper__defs" aria-hidden="true">
        <filter id="wp-ombre" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="24"/></filter>
        <filter id="wp-lueur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="14"/></filter>
      </svg>
      ${html}
      <div class="wallpaper__vignette"></div>`;

    OS.$$(".wallpaper__layer", el.fond).forEach((noeud, i) => {
      couches.push({ noeud, svg: noeud.firstElementChild, z: PLANS[i].profondeur });
    });

    // Les couches ne sont « détachées » pour la carte graphique que si la
    // parallaxe peut servir (ordinateur avec souris, animations permises)
    el.fond.classList.toggle("wallpaper--live", !OS.reduceMotion && !OS.isTouch);
  }

  /* -------------------------------------------------------------------
     3. ANIMATION D'OUVERTURE
     -------------------------------------------------------------------
     Chaque couche part légèrement agrandie et décalée vers le bas, puis
     revient à sa place. Les couches proches bougent davantage et
     arrivent un peu plus tard : on « sent » qu'elles sont à des
     distances différentes.
     ------------------------------------------------------------------- */
  function intro() {
    if (OS.reduceMotion) return;
    couches.forEach(({ svg, z }) => {
      svg.animate(
        [
          { transform: `translateY(${40 * z}px) scale(${1.06 + 0.22 * z})`, opacity: z > 0.5 ? 0 : 1 },
          { transform: "none", opacity: 1 }
        ],
        { duration: 1500 + 700 * z, delay: 120 * z, easing: "cubic-bezier(.16, .84, .24, 1)", fill: "backwards" }
      );
    });
  }

  /* -------------------------------------------------------------------
     4. PARALLAXE À LA SOURIS
     -------------------------------------------------------------------
     - On mémorise la position visée (cible) quand la souris bouge ;
     - à chaque image, la position actuelle se rapproche de la cible
       (« lissage ») : le mouvement est souple, jamais saccadé ;
     - quand l'écart devient négligeable, la boucle s'arrête.
     ------------------------------------------------------------------- */
  const cible = { x: 0, y: 0 };
  const actuel = { x: 0, y: 0 };
  let boucle = 0;
  let actif = false;

  function appliquer() {
    couches.forEach(({ noeud, z }) => {
      noeud.style.transform = `translate3d(${(-actuel.x * AMPLITUDE * z).toFixed(2)}px, ${(-actuel.y * AMPLITUDE * 0.7 * z).toFixed(2)}px, 0)`;
    });
  }

  function animer() {
    actuel.x += (cible.x - actuel.x) * 0.06;
    actuel.y += (cible.y - actuel.y) * 0.06;
    appliquer();
    if (Math.abs(cible.x - actuel.x) + Math.abs(cible.y - actuel.y) > 0.002) {
      boucle = requestAnimationFrame(animer);
    } else {
      boucle = 0;
    }
  }

  function suivre(e) {
    if (!actif) return;
    // Position de la souris ramenée entre -1 et 1 (0 = centre de l'écran)
    cible.x = (e.clientX / window.innerWidth) * 2 - 1;
    cible.y = (e.clientY / window.innerHeight) * 2 - 1;
    if (!boucle) boucle = requestAnimationFrame(animer);
  }

  /** Active ou coupe la parallaxe (coupée hors du bureau). */
  function parallaxe(etat) {
    if (OS.reduceMotion || OS.isTouch) return;
    actif = etat;
    if (!etat) {
      // Retour en douceur au centre
      cible.x = 0;
      cible.y = 0;
      if (!boucle) boucle = requestAnimationFrame(animer);
    }
  }

  construire();
  window.addEventListener("pointermove", suivre, { passive: true });

  OS.wallpaper = { intro, parallaxe };
})();

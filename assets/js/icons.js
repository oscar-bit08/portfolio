/* =====================================================================
   icons.js — BIBLIOTHÈQUE D'ICÔNES SVG
   =====================================================================
   Toutes les icônes sont dessinées en SVG directement dans le code :
   aucune image à télécharger, elles restent nettes à toutes les tailles
   et prennent la couleur du texte (currentColor).

   Trois familles :
     1. OS.icon(nom)       → petites icônes « trait » 24×24 (interface)
     2. OS.appIcon(nom)    → grandes icônes colorées des applications
     3. OS.brandIcon(nom)  → logos (Gmail, LinkedIn, GitHub)
     + OS.docIcon()        → icône de document de l'éditeur Réalisations
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;

  /* -------------------------------------------------------------------
     1. ICÔNES « TRAIT » (style inspiré de Lucide, 24×24)
     -------------------------------------------------------------------
     Chaque entrée contient uniquement l'intérieur du <svg>. La fonction
     OS.icon() ajoute l'enveloppe commune (taille, épaisseur du trait…).
     ------------------------------------------------------------------- */
  const GLYPHES = {
    // --- Navigation / interface ---
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    maximize: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    home: '<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    filePlus: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="M9 15h6"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',

    // --- Système (barre du haut, installation) ---
    wifi: '<path d="M2 8.8a15 15 0 0 1 20 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16.1a5 5 0 0 1 7 0"/><path d="M12 20h.01"/>',
    battery: '<rect x="2" y="7" width="17" height="10" rx="2.5"/><path d="M22 11v2"/><rect x="4.5" y="9.5" width="10" height="5" rx="1" fill="currentColor" stroke="none"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
    accessibility: '<circle cx="12" cy="4.5" r="1.6"/><path d="m5 8 7 1.5L19 8"/><path d="M12 9.5V14l-3 6.5"/><path d="m12 14 3 6.5"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20"/><path d="M12 2a15 15 0 0 0 0 20"/>',

    // --- Compétences ---
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    terminal: '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    server: '<rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/><path d="M6 7h.01"/><path d="M6 17h.01"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    network: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M5 16v-3h14v3"/><path d="M12 8v5"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 16v-3"/><path d="M11 16V9"/><path d="M15 16V6"/><path d="M19 16v-5"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    cube: '<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    git: '<circle cx="6" cy="5" r="2.5"/><circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 7.5v9"/><path d="M18 10.5c0 4-5 4.5-11 7"/>',
    python: '<path d="M12 2.5H9.5a3 3 0 0 0-3 3V8H12v1H5.5a3 3 0 0 0-3 3v2.5a3 3 0 0 0 3 3H7"/><path d="M12 21.5h2.5a3 3 0 0 0 3-3V16H12v-1h6.5a3 3 0 0 0 3-3V9.5a3 3 0 0 0-3-3H17"/><path d="M7 17.5V15a3 3 0 0 1 3-3h4a3 3 0 0 0 3-3V6.5"/><path d="M9.5 5h.01"/><path d="M14.5 19h.01"/>',

    // --- Slides / divers ---
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0"/><path d="M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 13h20"/>',
    graduation: '<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/><path d="M22 10v6"/>',

    // --- Barre d'outils de l'éditeur Réalisations (décorative) ---
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9"/><path d="M14.5 14.5 20 20"/><path d="M8.1 8.1 12 12"/>',
    brush: '<path d="m9.1 11.1 7.8-7.8a2.1 2.1 0 0 1 3 3l-7.8 7.8"/><path d="M7 14a3 3 0 0 0-3 3c0 1.5-1 2-2 2.5 1 1 2.5 1.5 4 1.5a4 4 0 0 0 4-4 3 3 0 0 0-3-3z"/>',
    alignLeft: '<path d="M3 6h18"/><path d="M3 12h12"/><path d="M3 18h16"/>',
    alignCenter: '<path d="M3 6h18"/><path d="M6 12h12"/><path d="M4 18h16"/>',
    alignRight: '<path d="M3 6h18"/><path d="M9 12h12"/><path d="M5 18h16"/>',
    alignJustify: '<path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>',
    listBullets: '<path d="M9 6h12"/><path d="M9 12h12"/><path d="M9 18h12"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>',
    listNumbers: '<path d="M10 6h11"/><path d="M10 12h11"/><path d="M10 18h11"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
    indent: '<path d="M3 6h18"/><path d="M11 12h10"/><path d="M11 18h10"/><path d="m3 9 4 3-4 3"/>',
    undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>',
    redo: '<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/>',
    comment: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    pen: '<path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/>',
    replace: '<path d="M14 4a2 2 0 0 1 2-2"/><path d="M16 10a2 2 0 0 1-2-2"/><path d="M20 2a2 2 0 0 1 2 2"/><path d="M22 8a2 2 0 0 1-2 2"/><path d="m3 7 3 3 3-3"/><path d="M6 10V5a3 3 0 0 1 3-3h1"/><rect x="2" y="14" width="8" height="8" rx="2"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4"/><path d="m15.4 6.5-6.8 4"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'
  };

  /**
   * Renvoie le code SVG d'une icône trait.
   * @param {string} nom    clé dans GLYPHES
   * @param {object} opts   { taille: 18, epaisseur: 2, classe: "" }
   */
  OS.icon = (nom, { taille = 18, epaisseur = 2, classe = "" } = {}) => {
    const contenu = GLYPHES[nom] || GLYPHES.info;
    return `<svg class="i ${classe}" width="${taille}" height="${taille}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${epaisseur}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${contenu}</svg>`;
  };

  /* -------------------------------------------------------------------
     2. ICÔNES D'APPLICATION (64×64, en couleur)
     -------------------------------------------------------------------
     Les dégradés SVG sont identifiés par un « id ». Comme la même icône
     apparaît plusieurs fois (bureau, dock, fenêtre), chaque exemplaire
     reçoit un identifiant unique (uid) pour éviter les conflits.
     ------------------------------------------------------------------- */
  let compteurUid = 0;
  const uid = () => `ic${++compteurUid}`;

  /**
   * Calcule le tracé d'une roue dentée (utilisé par l'icône Compétences).
   * On fait le tour du cercle : pour chaque dent on place 4 points
   * (pied gauche, sommet gauche, sommet droit, pied droit).
   */
  function traceEngrenage(cx, cy, rayonExt, rayonInt, dents) {
    const pas = (Math.PI * 2) / dents;
    const points = [];
    const polaire = (r, a) => `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
    for (let i = 0; i < dents; i++) {
      const angle = i * pas - Math.PI / 2;      // on commence en haut
      const demiSommet = pas * 0.17;            // largeur du sommet de la dent
      const demiPied = pas * 0.29;              // largeur du pied de la dent
      points.push(
        polaire(rayonInt, angle - demiPied),
        polaire(rayonExt, angle - demiSommet),
        polaire(rayonExt, angle + demiSommet),
        polaire(rayonInt, angle + demiPied)
      );
    }
    return `M${points.join("L")}Z`;
  }
  const ENGRENAGE = traceEngrenage(32, 32, 21, 16.5, 8);
  // Trou circulaire au centre de l'engrenage (découpé grâce à fill-rule="evenodd")
  const TROU = "M42 32a10 10 0 1 0-20 0a10 10 0 1 0 20 0z";

  /* -------------------------------------------------------------------
     DIRECTION ARTISTIQUE COMMUNE (inspirée des icônes Veille et Contact)
     -------------------------------------------------------------------
     Toutes les icônes partagent le même « cadre » :
       - une tuile arrondie sombre (comme Veille) ;
       - un halo de la couleur d'accent de l'application ;
       - un liseré clair qui imite le bord d'un verre.
     Dessus, on pose :
       - un objet principal en « matière claire » (dégradé blanc → gris,
         comme la fiche du carnet Contact), avec une ombre portée ;
       - un détail lumineux dans la couleur d'accent (comme la lueur
         orange de Veille), obtenu en superposant une copie floutée.
     ------------------------------------------------------------------- */
  function cadre(u, accent) {
    return `
      <defs>
        <linearGradient id="${u}-f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2c313c"/><stop offset="1" stop-color="#0b0d12"/>
        </linearGradient>
        <radialGradient id="${u}-h" cx="50%" cy="58%" r="55%">
          <stop offset="0" stop-color="${accent}" stop-opacity=".30"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="${u}-m" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c2cbd8"/>
        </linearGradient>
        <filter id="${u}-g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.6"/></filter>
        <filter id="${u}-o" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.4"/></filter>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#${u}-f)"/>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#${u}-h)"/>
      <rect x="2.5" y="2.5" width="59" height="59" rx="15.5" fill="none" stroke="#fff" stroke-opacity=".13"/>`;
  }

  /** Dessine une forme deux fois : une copie floutée (la lueur) puis la forme nette. */
  const lumineux = (u, forme) =>
    `<g opacity=".8" filter="url(#${u}-g)">${forme}</g>${forme}`;

  const APPLIS = {
    /* Compétences : engrenage clair, coche bleue lumineuse au centre */
    competences: (u) => `${cadre(u, "#38bdf8")}
      <defs>
        <linearGradient id="${u}-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0a84ff"/>
        </linearGradient>
      </defs>
      <path d="${ENGRENAGE}${TROU}" fill="#000" fill-rule="evenodd" opacity=".45" transform="translate(0 1.6)" filter="url(#${u}-o)"/>
      <path d="${ENGRENAGE}${TROU}" fill="url(#${u}-m)" fill-rule="evenodd" stroke="#fff" stroke-opacity=".6" stroke-width=".6" stroke-linejoin="round"/>
      <circle cx="32" cy="32" r="10" fill="#0e1624"/>
      ${lumineux(u, `<path d="m27.4 32.3 3.2 3.2 6-6.6" fill="none" stroke="url(#${u}-a)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>`)}`,

    /* Réalisations : document clair et stylo cyan lumineux */
    realisations: (u) => `${cadre(u, "#22d3ee")}
      <defs>
        <linearGradient id="${u}-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#a5f3fc"/><stop offset="1" stop-color="#06b6d4"/>
        </linearGradient>
      </defs>
      <path d="M19 12h17.5L45 20.5V50a2.5 2.5 0 0 1-2.5 2.5H19a2.5 2.5 0 0 1-2.5-2.5V14.5A2.5 2.5 0 0 1 19 12z" fill="#000" opacity=".45" transform="translate(0 1.6)" filter="url(#${u}-o)"/>
      <path d="M19 12h17.5L45 20.5V50a2.5 2.5 0 0 1-2.5 2.5H19a2.5 2.5 0 0 1-2.5-2.5V14.5A2.5 2.5 0 0 1 19 12z" fill="url(#${u}-m)"/>
      <path d="M36.5 12v6a2.5 2.5 0 0 0 2.5 2.5h6z" fill="#8f9bad"/>
      <rect x="21.5" y="24" width="13" height="2.8" rx="1.4" fill="#06b6d4"/>
      <rect x="21.5" y="30" width="18" height="2.6" rx="1.3" fill="#97a3b4"/>
      <rect x="21.5" y="35.5" width="18" height="2.6" rx="1.3" fill="#97a3b4"/>
      <rect x="21.5" y="41" width="10" height="2.6" rx="1.3" fill="#97a3b4"/>
      <g transform="rotate(45 45 40)">
        ${lumineux(u, `<rect x="42" y="23" width="6" height="21" rx="2" fill="url(#${u}-a)"/><path d="M42 44h6l-3 6z" fill="url(#${u}-a)"/>`)}
        <rect x="42" y="23" width="6" height="4" rx="1.6" fill="#fff" opacity=".75"/>
      </g>`,

    /* Veille : symbole d'alimentation d'un PC, orange et lumineux (l'icône de référence) */
    veille: (u) => `${cadre(u, "#ff6a1a")}
      <defs>
        <!-- userSpaceOnUse : coordonnées absolues. Sans ça, le dégradé ne
             s'appliquerait pas à la barre verticale (largeur nulle). -->
        <linearGradient id="${u}-p" gradientUnits="userSpaceOnUse" x1="0" y1="15" x2="0" y2="48">
          <stop offset="0" stop-color="#ffb070"/><stop offset="1" stop-color="#ff5a1f"/>
        </linearGradient>
      </defs>
      ${lumineux(u, `<g fill="none" stroke="url(#${u}-p)" stroke-linecap="round" stroke-width="4.6"><path d="M32 15v15"/><path d="M22.1 22.1a14 14 0 1 0 19.8 0"/></g>`)}`,

    /* Contact : carnet d'adresses (fiche claire, silhouette, onglets colorés lumineux) */
    contact: (u) => `${cadre(u, "#60a5fa")}
      <defs>
        <linearGradient id="${u}-s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#9aa6b6"/><stop offset="1" stop-color="#5f6b7d"/>
        </linearGradient>
      </defs>
      <rect x="12" y="10" width="34" height="44" rx="5" fill="#000" opacity=".45" transform="translate(0 1.6)" filter="url(#${u}-o)"/>
      ${lumineux(u, `
        <rect x="45" y="14" width="7" height="8" rx="2.2" fill="#ff5f57"/>
        <rect x="45" y="24" width="7" height="8" rx="2.2" fill="#febc2e"/>
        <rect x="45" y="34" width="7" height="8" rx="2.2" fill="#28c840"/>
        <rect x="45" y="44" width="7" height="7" rx="2.2" fill="#0a84ff"/>`)}
      <rect x="12" y="10" width="34" height="44" rx="5" fill="url(#${u}-m)"/>
      <circle cx="29" cy="26" r="7" fill="url(#${u}-s)"/>
      <path d="M16.5 45.5c1.4-6.8 6.6-10.5 12.5-10.5s11.1 3.7 12.5 10.5z" fill="url(#${u}-s)"/>`,

    /* À propos : monogramme « OB » clair dans un anneau violet lumineux */
    apropos: (u) => `${cadre(u, "#a78bfa")}
      <defs>
        <linearGradient id="${u}-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ddd6fe"/><stop offset="1" stop-color="#8b5cf6"/>
        </linearGradient>
      </defs>
      ${lumineux(u, `<circle cx="32" cy="32" r="19" fill="none" stroke="url(#${u}-a)" stroke-width="3"/>`)}
      <text x="32" y="38.2" text-anchor="middle" font-family="Geist, system-ui, sans-serif" font-size="17" font-weight="700" fill="url(#${u}-m)" letter-spacing="-.5">${OS.esc(window.PORTFOLIO.profil.initiales)}</text>`
  };

  /** Renvoie le SVG d'une icône d'application (avec identifiants uniques). */
  OS.appIcon = (nom) => {
    const dessin = APPLIS[nom] || APPLIS.apropos;
    return `<svg class="app-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">${dessin(uid())}</svg>`;
  };

  /* -------------------------------------------------------------------
     3. LOGOS DE MARQUES (contacts) — tracés simplifiés 24×24
     ------------------------------------------------------------------- */
  const MARQUES = {
    gmail: '<path fill="currentColor" d="M2 6.5A2.5 2.5 0 0 1 6 4.5l6 4.5 6-4.5a2.5 2.5 0 0 1 4 2V18a1.5 1.5 0 0 1-1.5 1.5H17v-8.8l-5 3.8-5-3.8v8.8H3.5A1.5 1.5 0 0 1 2 18z"/>',
    linkedin: '<path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z"/>',
    github: '<path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 0 1 1.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22l-.01 3.29c0 .31.2.69.82.57A12 12 0 0 0 12 .3"/>'
  };

  /** Renvoie un logo de marque, ou une icône trait si le logo n'existe pas. */
  OS.brandIcon = (nom, taille = 20) => {
    if (!MARQUES[nom]) return OS.icon(nom, { taille });
    return `<svg width="${taille}" height="${taille}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${MARQUES[nom]}</svg>`;
  };

  /* -------------------------------------------------------------------
     4. ICÔNE DE DOCUMENT (fichiers de l'éditeur Réalisations)
     -------------------------------------------------------------------
     Une page avec un coin plié ; la première ligne prend la couleur du
     projet, ce qui permet de reconnaître chaque fichier d'un coup d'œil.
     ------------------------------------------------------------------- */
  OS.docIcon = (taille = 28, couleur = "#22d3ee") => `
    <svg width="${taille}" height="${taille}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M8 3h11l7 7v17a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#f8fafc" stroke="#cbd5e1"/>
      <path d="M19 3v5a2 2 0 0 0 2 2h5" fill="#e2e8f0" stroke="#cbd5e1" stroke-linejoin="round"/>
      <rect x="10" y="13" width="9" height="2.4" rx="1.2" fill="${couleur}"/>
      <path d="M10 18.5h12M10 22.5h12M10 26.5h7" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`;
})();

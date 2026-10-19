/* =====================================================================
   veille.js — « VEILLE » : MISE EN VEILLE + TERMINAL
   =====================================================================
   Quand on clique sur l'icône d'alimentation :
     1. l'écran s'éteint progressivement, de plus en plus vite (< 1 s) ;
     2. sur l'écran noir, une console brute explique que la mise en
        veille a échoué, qu'elle est « déviée » vers le dossier de veille
        informatique, puis présente le sujet. Ce message reste affiché
        quelques secondes (une touche permet de passer) ;
     3. le terminal stylé apparaît avec un léger effet « glitch » et
        ÉCRIT petit à petit le texte de veille (effet machine à écrire) ;
     4. à la fin, la question « Redémarrer ? [y/n] : » attend la réponse.
        Taper « y » puis Entrée referme le terminal (glitch) et relance
        le système jusqu'au bureau.

   Pour que ce soit intuitif :
     - une barre d'aide en bas explique toujours quoi faire ;
     - Espace / Entrée / clic affichent tout le texte d'un coup ;
     - à la fin, le champ de réponse reçoit le focus automatiquement, et
       taper une lettre n'importe où l'envoie dans ce champ.

   Le contenu (texte, vitesse, sections…) est dans PORTFOLIO.veille.
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;
  const V = window.PORTFOLIO.veille;

  /* -------------------------------------------------------------------
     ÉTAT
     ------------------------------------------------------------------- */
  const el = {};                 // références vers les éléments du DOM
  let actif = false;             // une séquence de veille est-elle en cours ?
  let ecritureEnCours = false;   // le texte est-il en train de s'écrire ?
  let accelerer = false;         // l'utilisateur a demandé de tout afficher
  let attenteReponse = false;    // la question « Redémarrer ? » est posée
  let suivreBas = true;          // défilement automatique vers le bas
  let rendu = null;              // promesse résolue quand tout est écrit
  let minuterieHorloge = null;
  let caracteresTotal = 0;       // pour la barre de progression
  let caracteresEcrits = 0;

  /** Pause qui est ignorée si l'utilisateur a demandé d'accélérer. */
  const pause = (ms) => (accelerer || OS.reduceMotion ? Promise.resolve() : OS.sleep(ms));

  /* -------------------------------------------------------------------
     1. ILLUSTRATION ISOMÉTRIQUE (3 couches empilées, une par section)
     -------------------------------------------------------------------
     Projection isométrique : un carré « posé à plat » devient un losange.
     Pour chaque couche on dessine 3 faces : le dessus, la face gauche et
     la face droite. On décale chaque couche vers le haut pour les empiler.
     Les décorations utilisent des matrices de transformation SVG pour
     « coller » un dessin plat sur une face inclinée.
     ------------------------------------------------------------------- */
  function svgPile() {
    const CX = 210;          // centre horizontal
    const DEMI_L = 173.2;    // demi-largeur du losange (200 × cos 30°)
    const Y0 = 190;          // sommet de la couche du bas
    const EP = 34;           // épaisseur d'une couche
    const ECART = 86;        // distance verticale entre deux couches
    const p = (x, y) => `${x.toFixed(1)},${y.toFixed(1)}`;

    let couches = "";
    // On dessine de bas en haut : la couche du haut correspond à la section 01
    for (let i = 0; i < V.sections.length; i++) {
      const section = V.sections.length - 1 - i;
      const s = V.sections[section];
      const h = i * ECART;
      const T = [CX, Y0 - h];                  // sommet
      const R = [CX + DEMI_L, Y0 + 100 - h];   // coin droit
      const B = [CX, Y0 + 200 - h];            // coin bas (devant)
      const L = [CX - DEMI_L, Y0 + 100 - h];   // coin gauche
      const dessus = `M${p(...T)}L${p(...R)}L${p(...B)}L${p(...L)}Z`;
      const gauche = `M${p(...L)}L${p(...B)}L${p(B[0], B[1] + EP)}L${p(L[0], L[1] + EP)}Z`;
      const droite = `M${p(...B)}L${p(...R)}L${p(R[0], R[1] + EP)}L${p(B[0], B[1] + EP)}Z`;
      const estHaut = section === 0;

      couches += `
        <g class="layer" data-layer="${section}">
          <path class="layer__top" d="${dessus}"/>
          <path class="layer__left" d="${gauche}"/>
          <path class="layer__right" d="${droite}"/>
          <!-- Décor du dessus (dessiné à plat puis incliné par la matrice) -->
          <g transform="matrix(0.866 0.5 -0.866 0.5 ${CX} ${Y0 - h})" class="layer__deco">
            <rect x="32" y="32" width="136" height="136" vector-effect="non-scaling-stroke"/>
            <circle cx="32" cy="32" r="2.5"/><circle cx="168" cy="32" r="2.5"/><circle cx="32" cy="168" r="2.5"/><circle cx="168" cy="168" r="2.5"/>
            <path d="M92 18l8-6 8 6M92 182l8 6 8-6M18 92l-6 8 6 8M182 92l6 8-6 8" vector-effect="non-scaling-stroke"/>
            ${estHaut ? `<circle class="layer__logo" cx="100" cy="100" r="28" vector-effect="non-scaling-stroke"/><path class="layer__logo" d="M84 116 116 84" vector-effect="non-scaling-stroke"/>` : ""}
          </g>
          <!-- Fente lumineuse sur la face gauche -->
          <g transform="matrix(0.866 0.5 0 1 ${L[0].toFixed(1)} ${L[1].toFixed(1)})">
            <rect class="layer__slot" x="22" y="${EP * 0.34}" width="116" height="${EP * 0.3}" rx="2"/>
          </g>
          <!-- Étiquette gravée sur la face droite -->
          <g transform="matrix(0.866 -0.5 0 1 ${B[0].toFixed(1)} ${B[1].toFixed(1)})">
            <text class="layer__label" x="24" y="${EP * 0.64}">${OS.esc(s.etiquette)}::${OS.esc(s.binaire)}</text>
          </g>
        </g>`;
    }

    return `
      <svg class="iso-stack" viewBox="0 0 420 450" aria-hidden="true">
        <defs>
          <filter id="lueur-veille" x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="4" result="flou"/>
            <feMerge><feMergeNode in="flou"/><feMergeNode in="flou"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <!-- Lignes de construction en arrière-plan : prolongement des
             arêtes du « sol » (pente isométrique = tan 30° ≈ 0,577) -->
        <g class="iso-grid">
          <path d="M0 ${(Y0 + 200 - 210 * 0.577).toFixed(1)} L420 ${(Y0 + 200 + 210 * 0.577).toFixed(1)}"/>
          <path d="M0 ${(Y0 + 200 + 210 * 0.577).toFixed(1)} L420 ${(Y0 + 200 - 210 * 0.577).toFixed(1)}"/>
          <path d="M${CX} 0V450"/>
        </g>
        ${couches}
      </svg>`;
  }

  /** Construit la colonne de droite : pile isométrique + sommaire cliquable. */
  function construireAside() {
    el.aside.innerHTML = `
      <div class="t-aside__head">
        <span class="t-dim">// SOMMAIRE</span>
        <span class="t-progress" aria-hidden="true"><i id="term-progress"></i></span>
      </div>
      ${svgPile()}
      <div class="t-index">
        ${V.sections.map((s, i) => `
          <button class="t-index__item" type="button" data-section="${i}">
            <span class="t-index__icon">${OS.icon(s.icone, { taille: 14 })}</span>
            <span class="t-index__text">
              <b>${OS.esc(s.code)} · ${OS.esc(s.titre.toUpperCase())}</b>
              <small>${OS.esc(s.texte)}</small>
            </span>
          </button>`).join("")}
      </div>`;
  }

  /** Met en évidence la section n (couche lumineuse + ligne du sommaire). */
  function activerSection(n) {
    OS.$$(".layer", el.aside).forEach((c) => c.classList.toggle("is-active", Number(c.dataset.layer) === n));
    OS.$$(".t-index__item", el.aside).forEach((b) => b.classList.toggle("is-active", Number(b.dataset.section) === n));
  }

  /* -------------------------------------------------------------------
     2. OUTILS D'ÉCRITURE DANS LE TERMINAL
     ------------------------------------------------------------------- */
  /** Fait défiler vers le bas, sauf si l'utilisateur est remonté lire. */
  function defiler() {
    if (suivreBas) el.sortie.scrollTop = el.sortie.scrollHeight;
  }

  /** Ajoute un élément à la sortie du terminal. */
  function ajouter(tag, classe, html = "") {
    const noeud = document.createElement(tag);
    noeud.className = classe;
    noeud.innerHTML = html;
    el.sortie.append(noeud);
    defiler();
    return noeud;
  }

  /** Ligne de journal système : colore les marqueurs [ OK ] et [ .. ]. */
  function ajouterLog(texte) {
    const html = OS.esc(texte)
      .replace("[ OK ]", '<span class="t-ok">[ OK ]</span>')
      .replace("[ .. ]", '<span class="t-wait">[ .. ]</span>');
    return ajouter("div", "t-log", html);
  }

  /** Met à jour la barre de progression de lecture. */
  function majProgression() {
    const barre = OS.$("#term-progress");
    if (barre && caracteresTotal) barre.style.width = `${Math.min(100, (caracteresEcrits / caracteresTotal) * 100)}%`;
  }

  /**
   * EFFET MACHINE À ÉCRIRE
   * Ajoute le texte dans « cible » quelques caractères à chaque image.
   * Le nombre de caractères dépend du temps écoulé, ce qui donne une
   * vitesse régulière (cps = caractères par seconde) quel que soit
   * l'écran. Petite pause après chaque fin de phrase pour le naturel.
   */
  async function taper(cible, texte, cps = V.vitesse, compter = true) {
    const noeud = document.createTextNode("");
    cible.append(noeud);
    cible.classList.add("is-typing");          // affiche le curseur clignotant

    let i = 0;
    let budget = 0;
    let avant = performance.now();
    while (i < texte.length) {
      if (accelerer || OS.reduceMotion) {        // tout afficher d'un coup
        noeud.appendData(texte.slice(i));
        if (compter) caracteresEcrits += texte.length - i;
        break;
      }
      await OS.frame();
      const maintenant = performance.now();
      budget += (Math.min(maintenant - avant, 100) * cps) / 1000;
      avant = maintenant;
      const nb = Math.floor(budget);
      if (nb < 1) continue;
      budget -= nb;

      const morceau = texte.slice(i, i + nb);
      noeud.appendData(morceau);
      i += nb;
      if (compter) caracteresEcrits += morceau.length;
      majProgression();
      defiler();

      // Respiration après la ponctuation forte
      if (/[.!?:»]$/.test(morceau)) {
        await pause(90);
        avant = performance.now();
      }
    }
    cible.classList.remove("is-typing");
    majProgression();
    defiler();
  }

  /* -------------------------------------------------------------------
     3. RENDU DE CHAQUE TYPE DE BLOC DE L'ARTICLE
     ------------------------------------------------------------------- */
  async function rendreBloc(b) {
    switch (b.type) {
      case "kicker": {
        const n = ajouter("p", "t-kicker", '<span class="t-dot"></span>');
        await taper(n, b.texte.toUpperCase(), V.vitesse * 1.6);
        break;
      }
      case "h1":
        await taper(ajouter("h1", "t-h1"), b.texte, V.vitesse * 0.8);
        break;
      case "sub":
        await taper(ajouter("p", "t-sub"), b.texte.toUpperCase(), V.vitesse * 1.4);
        break;
      case "p":
        await taper(ajouter("p", "t-p"), b.texte);
        break;
      case "h2": {
        activerSection(b.section);
        const s = V.sections[b.section];
        const n = ajouter("h2", "t-h2", `<span class="t-h2__num">${OS.esc(s.code)}</span><span class="t-h2__txt"></span>`);
        n.dataset.section = b.section;
        await taper(n.querySelector(".t-h2__txt"), b.texte, V.vitesse * 0.9);
        break;
      }
      case "quote": {
        const n = ajouter("blockquote", "t-quote", '<p class="t-quote__txt"></p><cite class="t-quote__cite"></cite>');
        await taper(n.querySelector(".t-quote__txt"), b.texte);
        await taper(n.querySelector(".t-quote__cite"), b.auteur, V.vitesse * 1.5);
        break;
      }
      case "chart":
        await rendreGraphique(b);
        break;
      case "table":
        await rendreTableau(b);
        break;
    }
  }

  /** Graphique : barres qui se remplissent étape par étape. */
  async function rendreGraphique(b) {
    const fig = ajouter("figure", "t-chart");
    // L'échelle commune : la ligne la plus longue occupe 100 %
    const max = Math.max(...b.lignes.map((l) => l.etapes.reduce((t, e) => t + e.poids, 0)));
    for (const ligne of b.lignes) {
      const rang = document.createElement("div");
      rang.className = "t-chart__row";
      rang.innerHTML = `
        <span class="t-chart__label"></span>
        <span class="t-chart__track">${ligne.etapes.map((e, k) => `<i class="t-chart__seg" style="--w:${(e.poids / max) * 100}%;--k:${k}"></i>`).join("")}</span>
        <span class="t-chart__steps"></span>`;
      fig.append(rang);
      defiler();
      await taper(rang.querySelector(".t-chart__label"), ligne.label.toUpperCase(), V.vitesse * 1.5);
      // Les segments s'allument un par un
      for (const seg of rang.querySelectorAll(".t-chart__seg")) {
        seg.classList.add("is-on");
        await pause(260);
      }
      await taper(rang.querySelector(".t-chart__steps"), ligne.etapes.map((e) => e.texte).join("  →  "), V.vitesse * 1.5);
    }
    const legende = document.createElement("figcaption");
    legende.className = "t-chart__cap";
    fig.append(legende);
    await taper(legende, b.legende, V.vitesse * 1.5);
  }

  /** Tableau comparatif : chaque cellule s'écrit à son tour. */
  async function rendreTableau(b) {
    const tableau = ajouter("div", "t-table");
    tableau.setAttribute("role", "table");
    const lignes = [{ cellules: b.entetes, entete: true }, ...b.lignes.map((l) => ({ cellules: l, entete: false }))];
    for (const ligne of lignes) {
      const rang = document.createElement("div");
      rang.className = `t-table__row ${ligne.entete ? "t-table__row--head" : ""}`;
      rang.setAttribute("role", "row");
      tableau.append(rang);
      for (const texte of ligne.cellules) {
        const cellule = document.createElement("span");
        cellule.setAttribute("role", ligne.entete ? "columnheader" : "cell");
        rang.append(cellule);
        await taper(cellule, ligne.entete ? texte.toUpperCase() : texte, V.vitesse * 2);
      }
    }
  }

  /* -------------------------------------------------------------------
     4. BARRE D'AIDE (toujours visible en bas)
     ------------------------------------------------------------------- */
  function majAide(etat) {
    // Sur écran tactile, on parle de « toucher » plutôt que de clavier
    const messages = {
      lecture: OS.isTouch
        ? `<span class="t-live"></span> LECTURE EN COURS <span class="t-dim">—</span> touchez l'écran pour tout afficher`
        : `<span class="t-live"></span> LECTURE EN COURS <span class="t-dim">—</span> <kbd>Espace</kbd> ou <kbd>clic</kbd> pour tout afficher`,
      question: OS.isTouch
        ? `<span class="t-accent">▶</span> LECTURE TERMINÉE <span class="t-dim">—</span> touchez le champ orange, tapez <kbd>y</kbd> puis validez`
        : `<span class="t-accent">▶</span> LECTURE TERMINÉE <span class="t-dim">—</span> tapez <kbd>y</kbd> puis <kbd>Entrée</kbd> pour redémarrer le portfolio`,
      redemarrage: `<span class="t-live"></span> REDÉMARRAGE EN COURS…`
    };
    el.aide.innerHTML = messages[etat];
    el.aide.classList.toggle("is-attention", etat === "question");
  }

  /* -------------------------------------------------------------------
     5. DÉROULÉ COMPLET DU TERMINAL
     ------------------------------------------------------------------- */
  async function derouler() {
    ecritureEnCours = true;
    majAide("lecture");

    // a. Journal de démarrage (rapide)
    for (const texte of V.logs) {
      ajouterLog(texte);
      await pause(110);
    }
    await pause(250);

    // b. Invite de commande + commande tapée « à la main »
    const invite = ajouter("div", "t-cmd",
      `<span class="t-user">oscar@oscar-os</span><span class="t-dim">:</span><span class="t-path">~</span><span class="t-dim">$</span> <span class="t-cmd__txt"></span>`);
    await taper(invite.querySelector(".t-cmd__txt"), V.commande, 32, false);
    await pause(350);

    // c. L'article, bloc par bloc
    for (const bloc of V.blocs) {
      await rendreBloc(bloc);
      await pause(bloc.type === "p" ? 160 : 110);
    }

    // d. Fin du document + question
    ajouter("p", "t-end", `<span class="t-dim">──</span> ${OS.esc(V.signature)} <span class="t-dim">──</span>`);
    caracteresEcrits = caracteresTotal;
    majProgression();
    ecritureEnCours = false;
    poserQuestion();
  }

  /** Affiche « Redémarrer ? [y/n] : » avec un vrai champ de saisie. */
  function poserQuestion() {
    attenteReponse = true;
    const ligne = ajouter("div", "t-prompt", `
      <label class="t-prompt__q" for="term-input">Redémarrer ? <span class="t-accent">[y/n]</span> :</label>
      <input class="t-prompt__input" id="term-input" type="text" maxlength="12"
             autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
             enterkeyhint="go" aria-describedby="term-help">`);
    const aide = ajouter("p", "t-help",
      `<span class="t-help__arrow">↳</span> Tapez <kbd>y</kbd> puis <kbd>Entrée</kbd> pour redémarrer · <kbd>n</kbd> pour rester sur cette page`);
    aide.id = "term-help";
    majAide("question");

    const champ = ligne.querySelector("input");
    suivreBas = true;
    defiler();
    champ.focus({ preventScroll: true });

    champ.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      repondre(champ, ligne, aide);
    });
  }

  /** Traite la réponse tapée par l'utilisateur. */
  function repondre(champ, ligne, aide) {
    const reponse = champ.value.trim().toLowerCase();
    // On « fige » la ligne : le champ est remplacé par le texte tapé
    const fige = document.createElement("span");
    fige.className = "t-prompt__answer";
    fige.textContent = champ.value;
    champ.replaceWith(fige);
    aide.removeAttribute("id");
    aide.classList.add("is-old");
    attenteReponse = false;

    if (["y", "yes", "o", "oui"].includes(reponse)) {
      redemarrer();
    } else if (["n", "no", "non"].includes(reponse)) {
      ajouter("p", "t-log", `<span class="t-wait">[ -- ]</span> Redémarrage annulé. Le système reste en veille : prenez le temps de relire.`);
      poserQuestion();
    } else {
      ajouter("p", "t-log t-err", `[ !! ] Réponse non reconnue${reponse ? ` : « ${OS.esc(reponse)} »` : ""}. Répondez par y (oui) ou n (non).`);
      poserQuestion();
    }
  }

  /* -------------------------------------------------------------------
     5 bis. MESSAGE D'ERREUR DE MISE EN VEILLE
     -------------------------------------------------------------------
     Une console brute (texte sur fond noir, aucune décoration) qui fait
     croire que la mise en veille a échoué, puis annonce le sujet de la
     veille dans un encadré. Les lignes viennent de PORTFOLIO.veille.erreur.

     Pour laisser le temps de lire :
       - l'encadré reste affiché V.lectureErreur secondes, avec un
         compte à rebours et une barre qui se vide ;
       - une touche (ou un clic) pendant l'écriture affiche tout d'un
         coup ; une touche une fois l'encadré affiché ouvre le terminal.
     ------------------------------------------------------------------- */
  async function afficherErreur() {
    const ecran = el.erreur;          // déjà affiché (écran noir) par mettreEnVeille
    let continuer = false;            // le visiteur demande à passer à la suite
    let encadreAffiche = false;

    const passer = (e) => {
      if (e.type === "keydown" && ["Tab", "Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
      if (encadreAffiche) continuer = true;
      else accelerer = true;          // tout écrire d'un coup (voir taper())
    };
    window.addEventListener("keydown", passer);
    ecran.addEventListener("pointerdown", passer);

    // a. Le journal, ligne par ligne
    const lignes = V.erreur.filter((l) => l.type !== "note");
    for (const ligne of lignes) {
      const p = document.createElement("p");
      p.className = `veille-erreur__line veille-erreur__line--${ligne.type}`;
      ecran.append(p);
      if (["erreur", "detail"].includes(ligne.type)) {
        // L'erreur « tombe » d'un coup, comme un vrai message système
        p.textContent = ligne.texte;
      } else {
        await taper(p, ligne.texte, 85, false);
      }
      if (ligne.type === "ok") p.innerHTML = OS.esc(ligne.texte).replace(/OK$/, '<span class="veille-erreur__ok">OK</span>');
      await pause(ligne.type === "erreur" ? 900 : ligne.type === "titre" ? 250 : 380);
    }
    accelerer = false;

    // b. L'encadré qui présente le sujet (la phrase à lire)
    const note = V.erreur.find((l) => l.type === "note");
    const duree = (V.lectureErreur || 6) * 1000;
    const boite = document.createElement("div");
    boite.className = "veille-erreur__note";
    boite.innerHTML = `
      <span class="veille-erreur__badge" aria-hidden="true">i</span>
      <p>${OS.esc(note.texte)}</p>`;
    const suite = document.createElement("p");
    suite.className = "veille-erreur__next";
    suite.innerHTML = `
      <span class="veille-erreur__bar" aria-hidden="true"><i style="animation-duration:${duree}ms"></i></span>
      <span>Ouverture du terminal dans <b>${Math.round(duree / 1000)}</b> s · ${OS.isTouch ? "touchez l'écran" : "appuyez sur une touche"} pour continuer</span>`;
    ecran.append(boite, suite);
    encadreAffiche = true;

    // c. Compte à rebours (interrompu par une touche ou un clic)
    const compteur = suite.querySelector("b");
    const debut = performance.now();
    while (!continuer && performance.now() - debut < (OS.reduceMotion ? duree / 2 : duree)) {
      compteur.textContent = Math.max(1, Math.ceil((duree - (performance.now() - debut)) / 1000));
      await OS.sleep(100);
    }

    window.removeEventListener("keydown", passer);
    ecran.removeEventListener("pointerdown", passer);
  }

  /**
   * Petit effet « glitch » (voir veille.css) : quelques images décalées,
   * découpées en bandes et légèrement dédoublées en rouge / cyan.
   * Volontairement court et discret.
   */
  async function glitch(element, classe, duree) {
    if (OS.reduceMotion) return;
    element.classList.add(classe);
    await OS.sleep(duree);
    element.classList.remove(classe);
  }

  /* -------------------------------------------------------------------
     6. HORLOGE DE LA BARRE D'ÉTAT
     ------------------------------------------------------------------- */
  function demarrerHorloge() {
    const maj = () => { el.horloge.textContent = new Date().toLocaleTimeString("fr-FR"); };
    maj();
    minuterieHorloge = setInterval(maj, 1000);
  }

  /* -------------------------------------------------------------------
     7. SÉQUENCES : MISE EN VEILLE ET REDÉMARRAGE
     ------------------------------------------------------------------- */
  async function mettreEnVeille() {
    if (actif) return;
    actif = true;
    accelerer = false;
    attenteReponse = false;
    suivreBas = true;
    OS.emit("veille:start");
    OS.wallpaper.parallaxe(false);
    OS.dock.fermer();

    // a. Extinction progressive : un voile noir recouvre l'écran, de plus
    //    en plus vite (courbe « ease-in »), en moins d'une seconde
    el.extinction.hidden = false;
    el.extinction.classList.add("is-on");
    await OS.sleep(OS.reduceMotion ? 120 : 900);

    // b. L'écran est noir : on affiche la console (vide, fond noir) PUIS
    //    on range le bureau derrière, sans qu'aucune image ne « saute »
    el.erreur.innerHTML = "";
    el.erreur.hidden = false;
    OS.wm.closeAll(true);
    el.ecran.hidden = true;
    el.extinction.classList.remove("is-on");
    el.extinction.hidden = true;
    el.desktop.hidden = true;
    el.desktop.classList.remove("is-visible");

    // c. Écran noir un court instant, puis le message d'erreur détaillé
    await OS.sleep(OS.reduceMotion ? 100 : 500);
    await afficherErreur();

    // d. Le terminal apparaît avec un léger glitch (la console noire
    //    reste dessous pendant l'effet, puis disparaît)
    accelerer = false;
    el.sortie.innerHTML = "";
    el.fichier.textContent = V.fichier;
    caracteresEcrits = 0;
    activerSection(-1);
    majProgression();
    demarrerHorloge();
    el.terminal.hidden = false;
    await glitch(el.terminal, "glitch-in", 420);
    el.erreur.hidden = true;
    el.erreur.innerHTML = "";

    rendu = derouler();
    await rendu;
  }

  async function redemarrer() {
    majAide("redemarrage");
    accelerer = false;
    for (const texte of V.logsRedemarrage) {
      ajouterLog(texte);
      await OS.sleep(OS.reduceMotion ? 0 : 220);
    }
    await OS.sleep(OS.reduceMotion ? 0 : 400);

    // Le terminal se referme sur un glitch. L'écran de démarrage (noir)
    // est affiché dessous AVANT de masquer le terminal.
    if (!OS.reduceMotion) {
      el.terminal.classList.add("glitch-out");
      await OS.sleep(380);
    }
    el.ecran.hidden = false;
    const demarrage = OS.boot.run({ court: true });
    el.terminal.hidden = true;
    el.terminal.classList.remove("glitch-out");
    clearInterval(minuterieHorloge);
    el.sortie.innerHTML = "";

    // Redémarrage : écran de démarrage, puis retour au bureau
    await demarrage;
    await OS.desktop.show({ premiereFois: false });
    OS.toast({ titre: "Système redémarré", texte: "Bon retour sur le bureau !", icone: "power", duree: 3500 });
    actif = false;
  }

  /* -------------------------------------------------------------------
     8. INITIALISATION ET ÉCOUTEURS
     ------------------------------------------------------------------- */
  function init() {
    el.ecran = OS.$("#os-screen");
    el.desktop = OS.$("#desktop");
    el.extinction = OS.$("#extinction");
    el.terminal = OS.$("#terminal");
    el.sortie = OS.$("#term-output");
    el.aside = OS.$("#term-aside");
    el.aide = OS.$("#term-hint");
    el.horloge = OS.$("#term-clock");
    el.fichier = OS.$("#term-file");
    el.erreur = OS.$("#veille-erreur");

    // Nombre total de caractères de l'article (pour la progression)
    caracteresTotal = V.blocs.reduce((total, b) => {
      if (b.type === "table") return total + [...b.entetes, ...b.lignes.flat()].join("").length;
      if (b.type === "chart") return total + b.legende.length + b.lignes.reduce((t, l) => t + l.label.length + l.etapes.map((e) => e.texte).join("  →  ").length, 0);
      return total + (b.texte || "").length + (b.auteur || "").length;
    }, 0);

    construireAside();

    // Défilement manuel : si l'utilisateur remonte, on arrête de le ramener en bas
    el.sortie.addEventListener("scroll", () => {
      suivreBas = el.sortie.scrollHeight - el.sortie.scrollTop - el.sortie.clientHeight < 48;
      // Une fois le texte écrit, la couche lumineuse suit la lecture
      if (!ecritureEnCours) {
        const titres = OS.$$(".t-h2", el.sortie);
        let section = -1;
        titres.forEach((t) => {
          if (t.offsetTop - el.sortie.scrollTop < el.sortie.clientHeight * 0.45) section = Number(t.dataset.section);
        });
        activerSection(section);
      }
    });

    // Clic dans le terminal : accélère, ou remet le focus sur le champ
    el.terminal.addEventListener("click", (e) => {
      if (e.target.closest(".terminal__aside")) return;
      if (ecritureEnCours) accelerer = true;
      else if (attenteReponse) OS.$("#term-input")?.focus({ preventScroll: true });
    });

    // Sommaire : aller directement à une section
    el.aside.addEventListener("click", async (e) => {
      const bouton = e.target.closest("[data-section]");
      if (!bouton) return;
      const n = Number(bouton.dataset.section);
      if (ecritureEnCours) {
        accelerer = true;
        await rendu;
      }
      const titre = el.sortie.querySelector(`.t-h2[data-section="${n}"]`);
      if (titre) {
        suivreBas = false;
        el.sortie.scrollTo({ top: titre.offsetTop - 24, behavior: OS.reduceMotion ? "auto" : "smooth" });
        activerSection(n);
      }
    });

    // Clavier : Espace / Entrée accélèrent ; une lettre tapée va dans le champ
    document.addEventListener("keydown", (e) => {
      if (el.terminal.hidden) return;
      if (ecritureEnCours && [" ", "Enter", "Escape"].includes(e.key)) {
        e.preventDefault();
        accelerer = true;
        return;
      }
      const champ = OS.$("#term-input");
      if (attenteReponse && champ && document.activeElement !== champ && e.key.length === 1) {
        champ.focus({ preventScroll: true });
      }
    });
  }

  init();

  /* -------------------------------------------------------------------
     9. ENREGISTREMENT COMME « APPLICATION » DU BUREAU
     -------------------------------------------------------------------
     La Veille n'ouvre pas de fenêtre : c'est une « action ». Le
     gestionnaire de fenêtres appelle directement action() au clic.
     ------------------------------------------------------------------- */
  OS.registerApp({
    id: "veille",
    titre: "Veille",
    icone: "veille",
    infobulle: "Veille — mettre le PC en veille pour lire ma veille technologique",
    action: mettreEnVeille
  });

  OS.veille = { start: mettreEnVeille };
})();

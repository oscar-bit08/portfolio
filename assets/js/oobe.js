/* =====================================================================
   oobe.js — DÉMARRAGE + « PREMIÈRE INSTALLATION » (rubrique À PROPOS)
   =====================================================================
   OOBE = « Out-Of-Box Experience » : c'est le nom de l'assistant que
   Windows affiche au tout premier démarrage (« Est-ce le bon pays ? »…).
   Ici, il sert à présenter Oscar en 5 étapes.

   Contient trois parties :
     1. OS.boot.run()      → écran noir avec logo et barre de chargement
     2. OS.oobe.lancer()   → les 5 slides (Bienvenue, Profil, Formation,
                             Expériences, Projet pro)
     3. OS.hello()         → transition « Préparation de votre bureau… »
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;
  const SLIDES = window.PORTFOLIO.slides;

  /* ===================================================================
     1. ÉCRAN DE DÉMARRAGE
     =================================================================== */
  /**
   * (Re)lance le remplissage d'une barre de chargement pour qu'elle soit
   * pleine au bout de « ms » millisecondes (voir .loader dans base.css).
   * Retirer puis remettre la classe fait repartir l'animation de zéro.
   */
  function lancerChargement(selecteur, ms) {
    const barre = OS.$(selecteur);
    if (!barre) return;
    barre.style.setProperty("--duree", `${ms}ms`);
    barre.classList.remove("is-loading");
    void barre.offsetWidth;                // force le navigateur à prendre en compte l'arrêt
    barre.classList.add("is-loading");
  }

  OS.boot = {
    /**
     * Affiche le logo et la barre de chargement, puis disparaît.
     * @param {object} opts  { court: true } pour un redémarrage plus rapide
     */
    async run({ court = false } = {}) {
      const boot = OS.$("#boot");
      const duree = OS.reduceMotion ? 300 : court ? 1500 : 2300;
      boot.hidden = false;
      boot.classList.add("is-visible");
      lancerChargement("#boot-loader", duree);   // la barre est pleine quand l'écran s'efface
      await OS.sleep(duree);
      await OS.hideScreen(boot, 500);
    }
  };

  /* ===================================================================
     2. ASSISTANT « À PROPOS » (5 slides)
     =================================================================== */
  const el = {};
  let index = 0;               // slide affichée
  let resoudreFin = null;      // fonction appelée quand l'assistant se termine
  let fermeture = false;       // animation de fermeture en cours ?
  let depuisBureau = false;    // relancé depuis le bureau (dock / menu) ?

  /* ---------- Génération du HTML d'une slide ---------- */
  function htmlSlide(s, i) {
    let html = `
      <p class="oobe__kicker">Étape ${i + 1} sur ${SLIDES.length}</p>
      <h1 class="oobe__title" id="oobe-title" tabindex="-1">${OS.esc(s.titre)}</h1>`;

    // Paragraphes (la balise <strong> est autorisée dans data.js)
    if (s.paragraphes) {
      html += `<div class="oobe__text">${s.paragraphes.map((p) => `<p>${p}</p>`).join("")}</div>`;
    }

    // Atouts : petites cartes en grille
    if (s.atouts) {
      html += `<div class="oobe-traits">${s.atouts.map((a, k) => `
        <div class="trait" style="--k:${k}">
          <span class="trait__icon">${OS.icon(a.icone, { taille: 18 })}</span>
          <span><strong>${OS.esc(a.titre)}</strong><span>${OS.esc(a.texte)}</span></span>
        </div>`).join("")}</div>`;
    }

    // Liste sélectionnable façon « Est-ce le bon pays ou la bonne région ? »
    if (s.liste) {
      html += `
        <div class="oobe-list" role="listbox" aria-label="${OS.esc(s.titre)}">
          ${s.liste.map((item, k) => `
            <button class="oobe-list__item ${k === 0 ? "is-selected" : ""}" type="button" role="option" aria-selected="${k === 0}" data-index="${k}">
              <span class="oobe-list__main">
                <strong>${OS.esc(item.titre)}</strong>
                <span>${OS.esc(item.sousTitre)}</span>
              </span>
              <span class="oobe-list__date">${OS.esc(item.periode)}</span>
            </button>`).join("")}
        </div>
        <div class="oobe-detail" aria-live="polite"></div>`;
    }

    // Cartes empilées (projet professionnel)
    if (s.cartes) {
      html += `<div class="oobe-cards">${s.cartes.map((c, k) => `
        <div class="oobe-card" style="--k:${k}">
          <span class="oobe-card__icon">${OS.icon(c.icone, { taille: 20 })}</span>
          <span><strong>${OS.esc(c.titre)}</strong><span>${OS.esc(c.texte)}</span></span>
        </div>`).join("")}</div>`;
    }
    return html;
  }

  /** Affiche le détail de l'élément sélectionné dans une liste. */
  function afficherDetail(s, k) {
    const zone = el.slide.querySelector(".oobe-detail");
    if (!zone) return;
    const item = s.liste[k];
    zone.innerHTML = `<ul>${item.details.map((d) => `<li>${OS.esc(d)}</li>`).join("")}</ul>`;
    if (!OS.reduceMotion) zone.animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: "ease-out" });
  }

  /* ---------- Rendu d'une slide ---------- */
  function rendre(sens = 1) {
    const s = SLIDES[index];

    // Barre de progression (une case par étape)
    el.progression.innerHTML = SLIDES.map((sl, k) => `
      <li class="${k < index ? "is-done" : ""} ${k === index ? "is-current" : ""}" ${k === index ? 'aria-current="step"' : ""}>
        <span class="oobe__bar"></span>
        <span class="oobe__step">${OS.esc(sl.etape)}</span>
      </li>`).join("");

    // Illustration + contenu
    el.visuel.innerHTML = OS.illustrations[s.illustration] ? OS.illustrations[s.illustration]() : "";
    el.slide.innerHTML = htmlSlide(s, index);
    el.slide.scrollTop = 0;

    // Listes : sélection au clic (et détail du premier élément par défaut)
    if (s.liste) {
      afficherDetail(s, 0);
      el.slide.querySelectorAll(".oobe-list__item").forEach((bouton) => {
        bouton.addEventListener("click", () => {
          el.slide.querySelectorAll(".oobe-list__item").forEach((b) => {
            b.classList.toggle("is-selected", b === bouton);
            b.setAttribute("aria-selected", String(b === bouton));
          });
          afficherDetail(s, Number(bouton.dataset.index));
        });
      });
    }

    // Boutons : « Précédent » caché sur la 1re étape ; texte du bouton principal
    el.prec.hidden = index === 0;
    el.suiv.textContent = s.bouton || "Suivant";

    // Animation de transition (glissement dans le sens de la navigation)
    if (!OS.reduceMotion) {
      el.slide.animate(
        [{ opacity: 0, transform: `translateX(${sens * 28}px)` }, { opacity: 1, transform: "none" }],
        { duration: 450, easing: "cubic-bezier(.2, .8, .2, 1)" }
      );
      el.visuel.animate(
        [{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }],
        { duration: 550, easing: "cubic-bezier(.2, .8, .2, 1)" }
      );
    }
  }

  function suivant() {
    if (index < SLIDES.length - 1) {
      index++;
      rendre(1);
      el.suiv.focus({ preventScroll: true });
    } else {
      terminer();
    }
  }

  function precedent() {
    if (index === 0) return;
    index--;
    rendre(-1);
  }

  /**
   * Ferme l'assistant.
   * @param {boolean} passe  true si le visiteur a cliqué « Passer l'introduction »
   */
  async function terminer(passe = false) {
    if (!resoudreFin) return;
    const fin = resoudreFin;
    resoudreFin = null;
    fermeture = true;
    // La carte rétrécit et disparaît
    if (!OS.reduceMotion) {
      await el.carte.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.96) translateY(12px)" }],
        { duration: 380, easing: "ease-in", fill: "forwards" }
      ).finished;
    }
    await OS.hideScreen(el.ecran, 350);
    el.carte.getAnimations().forEach((a) => a.cancel());
    fermeture = false;
    // De retour sur le bureau : le fond d'écran peut de nouveau suivre la souris
    if (depuisBureau) OS.wallpaper.parallaxe(true);
    fin({ passe });
  }

  /** Raccourcis clavier : flèches et Entrée. */
  function clavier(e) {
    if (el.ecran.hidden) return;
    if (e.key === "ArrowRight") { e.preventDefault(); suivant(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); precedent(); }
  }

  /**
   * Lance l'assistant. Renvoie une promesse résolue à la fin avec
   * { passe: true/false } (le visiteur a-t-il passé l'introduction ?).
   * @param {object} opts { depuisBureau: true } si relancé depuis le bureau
   */
  function lancer(opts = {}) {
    depuisBureau = Boolean(opts.depuisBureau);
    el.ecran.classList.toggle("oobe--over-desktop", depuisBureau);
    // OPTIMISATION : derrière l'écran flouté, inutile de faire bouger le
    // fond d'écran (le flou devrait être recalculé à chaque image)
    OS.wallpaper.parallaxe(false);
    OS.dock?.fermer();
    index = 0;
    rendre(1);
    OS.showScreen(el.ecran, 500).then(() => el.suiv.focus({ preventScroll: true }));
    if (!OS.reduceMotion) {
      el.carte.animate(
        [{ opacity: 0, transform: "translateY(28px) scale(.97)" }, { opacity: 1, transform: "none" }],
        { duration: 700, easing: "cubic-bezier(.2, .8, .2, 1)" }
      );
    }
    return new Promise((resolve) => { resoudreFin = resolve; });
  }

  function init() {
    el.ecran = OS.$("#oobe");
    el.carte = OS.$(".oobe__card", el.ecran);
    el.visuel = OS.$("#oobe-visual");
    el.slide = OS.$("#oobe-slide");
    el.progression = OS.$("#oobe-progress");
    el.prec = OS.$("#oobe-prev");
    el.suiv = OS.$("#oobe-next");

    // Petites icônes système en bas à gauche (comme sous Windows)
    OS.$("#oobe-sysicons").innerHTML = `${OS.icon("accessibility", { taille: 18 })}${OS.icon("volume", { taille: 18 })}${OS.icon("wifi", { taille: 18 })}`;

    el.suiv.addEventListener("click", suivant);
    el.prec.addEventListener("click", precedent);
    OS.$("#oobe-skip").addEventListener("click", () => terminer(true));
    document.addEventListener("keydown", clavier);
  }

  init();

  OS.oobe = {
    lancer,
    /** Relance la présentation depuis le bureau (dock ou menu système). */
    async relancer() {
      if (resoudreFin || fermeture) return;   // déjà affichée, ou en train de se fermer
      await lancer({ depuisBureau: true });
    }
  };

  /* ===================================================================
     3. TRANSITION « PRÉPARATION DE VOTRE BUREAU »
     -------------------------------------------------------------------
     Comme Windows après l'installation (« Bonjour », « Nous préparons
     tout pour vous… »), quelques messages se succèdent en fondu.
     =================================================================== */
  OS.hello = async ({ court = false } = {}) => {
    const ecran = OS.$("#hello");
    const texte = OS.$("#hello-text");
    // Version courte si l'introduction a été passée (ou animations réduites)
    const messages = OS.reduceMotion || court
      ? ["Tout est prêt, bonne visite !"]
      : ["Bonjour.", "Préparation de votre bureau…", "Tout est prêt, bonne visite !"];

    // La barre se remplit pendant toute la durée des messages
    lancerChargement("#hello-loader", OS.reduceMotion ? 500 : 450 + messages.length * 1400);
    await OS.showScreen(ecran, 450);
    for (const message of messages) {
      texte.textContent = message;
      texte.classList.add("is-in");
      await OS.sleep(OS.reduceMotion ? 500 : 1050);
      texte.classList.remove("is-in");
      await OS.sleep(OS.reduceMotion ? 0 : 350);
    }
    await OS.hideScreen(ecran, 450);
  };
})();

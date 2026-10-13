/* =====================================================================
   apps/competences.js — APPLICATION « COMPÉTENCES »
   =====================================================================
   Inspirée des Paramètres de Windows 11 :
     - à gauche : profil, barre de recherche et liste des compétences
       (comme « Système, Bluetooth, Réseau… ») ;
     - à droite : soit la vue d'ensemble (lignes cliquables avec chevron),
       soit le détail d'une compétence : ce que je maîtrise, les projets
       où je l'ai mise en œuvre (qui ouvrent l'appli Réalisations), et
       les outils associés.
   Les données viennent de PORTFOLIO.competences (data.js).
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;
  const DATA = window.PORTFOLIO;
  const { categories, liste } = DATA.competences;

  /* -------------------------------------------------------------------
     PETITS GÉNÉRATEURS DE HTML
     ------------------------------------------------------------------- */

  /** Pastille d'icône colorée (la couleur vient de data.js). */
  const pastilleIcone = (c, taille = 18) =>
    `<span class="set-ico" style="--c:${c.couleur}">${OS.icon(c.icone, { taille })}</span>`;

  /** Jauge de niveau : 4 segments, allumés selon le niveau. */
  const jauge = (c) => {
    const segments = [1, 2, 3, 4].map((i) => `<i class="${i <= c.niveau ? "on" : ""}"></i>`).join("");
    return `<span class="level" style="--c:${c.couleur}" title="Niveau : ${DATA.niveaux[c.niveau]}">
              <span class="level__bars" aria-hidden="true">${segments}</span>
              <span class="level__label">${DATA.niveaux[c.niveau]}</span>
            </span>`;
  };

  OS.registerApp({
    id: "competences",
    titre: "Compétences",
    icone: "competences",
    infobulle: "Compétences — mes savoir-faire techniques",
    taille: { largeur: 1020, hauteur: 660 },

    /**
     * Construit le contenu de la fenêtre.
     * @param {HTMLElement} corps  zone de contenu de la fenêtre
     * @param {object} ctx         { parametres, fermer, setTitre }
     */
    mount(corps, ctx) {
      corps.innerHTML = `
        <div class="settings">
          <aside class="settings__nav">
            <div class="settings__profile">
              <span class="settings__avatar">${OS.esc(DATA.profil.initiales)}</span>
              <span class="settings__who">
                <strong>${OS.esc(DATA.profil.prenom)} ${OS.esc(DATA.profil.nom)}</strong>
                <span>${OS.esc(DATA.profil.titre)}</span>
              </span>
            </div>
            <label class="settings__search">
              ${OS.icon("search", { taille: 15 })}
              <input type="search" placeholder="Rechercher une compétence" aria-label="Rechercher une compétence" autocomplete="off">
            </label>
            <nav class="settings__list" aria-label="Liste des compétences"></nav>
          </aside>
          <main class="settings__main" tabindex="-1"></main>
        </div>`;

      const nav = corps.querySelector(".settings__list");
      const main = corps.querySelector(".settings__main");
      const recherche = corps.querySelector(".settings__search input");
      let courant = "accueil";

      /* ---------------------------------------------------------------
         MENU DE GAUCHE (filtré par la recherche)
         --------------------------------------------------------------- */
      function rendreMenu(filtre = "") {
        const f = filtre.trim().toLowerCase();
        // Une compétence correspond si son nom, son résumé ou un outil contient le texte
        const correspond = (c) =>
          !f || [c.nom, c.resume, ...c.outils].join(" ").toLowerCase().includes(f);

        let html = `
          <button class="settings__item ${courant === "accueil" ? "is-active" : ""}" data-id="accueil" type="button">
            <span class="set-ico" style="--c:#7dd3fc">${OS.icon("home", { taille: 18 })}</span>
            Vue d'ensemble
          </button>`;

        categories.forEach((cat) => {
          const items = liste.filter((c) => c.categorie === cat.id && correspond(c));
          if (!items.length) return;
          html += `<p class="settings__group">${OS.esc(cat.nom)}</p>`;
          html += items.map((c) => `
            <button class="settings__item ${courant === c.id ? "is-active" : ""}" data-id="${c.id}" type="button">
              ${pastilleIcone(c)}
              ${OS.esc(c.nom)}
            </button>`).join("");
        });

        if (f && !liste.some(correspond)) {
          html += `<p class="settings__empty">Aucune compétence ne correspond à « ${OS.esc(filtre)} ».</p>`;
        }
        nav.innerHTML = html;
      }

      /* ---------------------------------------------------------------
         PAGE « VUE D'ENSEMBLE »
         --------------------------------------------------------------- */
      function rendreAccueil() {
        const nbProjets = DATA.realisations.length;
        const python = OS.findSkill("python");
        main.innerHTML = `
          <h1 class="settings__h1">Compétences</h1>

          <div class="settings__hero">
            <div class="device">
              <span class="device__screen" aria-hidden="true"></span>
              <span class="device__info">
                <strong>Profil_${OS.esc(DATA.profil.prenom)}</strong>
                <span>${OS.esc(DATA.profil.specialite)}</span>
                <button class="link-btn" type="button" data-open="realisations">Voir mes réalisations</button>
              </span>
            </div>
            <div class="quick">
              <div class="quick__tile">
                ${pastilleIcone(python, 20)}
                <span><strong>Langage principal</strong><span>${OS.esc(python.nom)}</span></span>
              </div>
              <div class="quick__tile">
                <span class="set-ico" style="--c:#38bdf8">${OS.icon("folder", { taille: 20 })}</span>
                <span><strong>${nbProjets} réalisations</strong><span>Projets scolaires & perso</span></span>
              </div>
              <div class="quick__tile">
                <span class="set-ico set-ico--spin" style="--c:#4cc2ff">${OS.icon("refresh", { taille: 20 })}</span>
                <span><strong>Mise à jour en cours</strong><span>Autoformation Power BI</span></span>
              </div>
            </div>
          </div>

          ${categories.map((cat) => `
            <h2 class="settings__h2">${OS.esc(cat.nom)}</h2>
            <div class="settings__rows">
              ${liste.filter((c) => c.categorie === cat.id).map((c) => `
                <button class="settings__row" type="button" data-id="${c.id}">
                  ${pastilleIcone(c, 20)}
                  <span class="settings__row-text">
                    <strong>${OS.esc(c.nom)}</strong>
                    <span>${OS.esc(c.resume)}</span>
                  </span>
                  ${jauge(c)}
                  <span class="settings__chev">${OS.icon("chevronRight", { taille: 16 })}</span>
                </button>`).join("")}
            </div>`).join("")}`;
      }

      /* ---------------------------------------------------------------
         PAGE DÉTAIL D'UNE COMPÉTENCE
         --------------------------------------------------------------- */
      function rendreDetail(c) {
        const projets = c.projets.map(OS.findProject).filter(Boolean);

        // Cartes « projets » : un clic ouvre le document dans Réalisations
        const cartesProjets = projets.map((p) => `
          <button class="proj-link" type="button" data-projet="${p.id}">
            <span class="proj-link__icon">${OS.docIcon(30, p.couleur)}</span>
            <span class="proj-link__text">
              <strong>${OS.esc(p.titre)}</strong>
              <span>${OS.esc(p.contexte)} · ${OS.esc(p.technos.slice(0, 3).join(", "))}</span>
            </span>
            <span class="proj-link__go">Ouvrir ${OS.icon("chevronRight", { taille: 14 })}</span>
          </button>`).join("");

        // Expériences / formations liées (non cliquables)
        const cartesContextes = (c.contextes || []).map((texte) => `
          <div class="proj-link proj-link--static">
            <span class="set-ico" style="--c:#a3e635">${OS.icon("briefcase", { taille: 18 })}</span>
            <span class="proj-link__text"><strong>${OS.esc(texte)}</strong><span>Mise en pratique sur le terrain</span></span>
          </div>`).join("");

        // Lien spécial vers l'application Veille
        const carteVeille = c.veille ? `
          <button class="proj-link" type="button" data-veille>
            <span class="proj-link__icon proj-link__icon--app">${OS.appIcon("veille")}</span>
            <span class="proj-link__text"><strong>Ma veille technologique : « L'ère du logiciel jetable »</strong><span>Mettre le PC en veille pour la lire dans le terminal</span></span>
            <span class="proj-link__go">Lire ${OS.icon("chevronRight", { taille: 14 })}</span>
          </button>` : "";

        const rienAMontrer = !cartesProjets && !cartesContextes && !carteVeille;

        main.innerHTML = `
          <nav class="settings__crumbs" aria-label="Fil d'Ariane">
            <button type="button" data-id="accueil">Compétences</button>
            ${OS.icon("chevronRight", { taille: 18 })}
            <h1>${OS.esc(c.nom)}</h1>
          </nav>

          <section class="skill-hero" style="--c:${c.couleur}">
            <span class="skill-hero__icon">${OS.icon(c.icone, { taille: 34, epaisseur: 1.8 })}</span>
            <div class="skill-hero__text">
              <p class="skill-hero__cat">${OS.esc(categories.find((k) => k.id === c.categorie)?.nom || "")}</p>
              <p class="skill-hero__resume">${OS.esc(c.resume)}</p>
            </div>
            ${jauge(c)}
          </section>

          <h2 class="settings__h2">Ce que je maîtrise</h2>
          <div class="settings__group-box">
            ${c.maitrise.map((m) => `
              <div class="mastery">
                <span class="mastery__check" style="--c:${c.couleur}">${OS.icon("check", { taille: 14, epaisseur: 3 })}</span>
                <span>${OS.esc(m)}</span>
              </div>`).join("")}
          </div>

          <h2 class="settings__h2">Mise en œuvre</h2>
          <div class="proj-links">
            ${cartesProjets}${carteVeille}${cartesContextes}
            ${rienAMontrer ? `<p class="settings__empty">Compétence travaillée au quotidien et en formation.</p>` : ""}
          </div>

          <h2 class="settings__h2">Outils & technologies</h2>
          <div class="chips">${c.outils.map((o) => `<span class="chip">${OS.esc(o)}</span>`).join("")}</div>`;
      }

      /* ---------------------------------------------------------------
         NAVIGATION ENTRE LES PAGES
         --------------------------------------------------------------- */
      function afficher(id) {
        courant = id;
        const competence = OS.findSkill(id);
        if (competence) rendreDetail(competence);
        else { courant = "accueil"; rendreAccueil(); }
        rendreMenu(recherche.value);
        main.scrollTop = 0;
        // Petite animation d'entrée de la page (comme dans Windows 11)
        if (!OS.reduceMotion) {
          main.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "ease-out" });
        }
      }

      // Un seul écouteur pour toute la fenêtre (« délégation d'événements ») :
      // on regarde sur quel élément on a cliqué grâce à closest().
      corps.addEventListener("click", (e) => {
        const cible = e.target.closest("[data-id], [data-projet], [data-open], [data-veille]");
        if (!cible) return;
        if (cible.dataset.id) afficher(cible.dataset.id);
        else if (cible.dataset.projet) OS.wm.open("realisations", { projet: cible.dataset.projet }, cible.getBoundingClientRect());
        else if (cible.dataset.open) OS.wm.open(cible.dataset.open, {}, cible.getBoundingClientRect());
        else if ("veille" in cible.dataset) OS.apps.veille.action();
      });

      // Recherche : filtre la liste en direct ; Entrée ouvre le premier résultat
      recherche.addEventListener("input", () => rendreMenu(recherche.value));
      recherche.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        const premier = nav.querySelector(".settings__item:not([data-id='accueil'])");
        if (premier) afficher(premier.dataset.id);
      });

      // Affichage initial (une compétence peut être demandée en paramètre)
      afficher(ctx.parametres.competence || "accueil");

      // Méthodes appelées par le gestionnaire de fenêtres
      return {
        onParams(p) { if (p && p.competence) afficher(p.competence); }
      };
    }
  });
})();

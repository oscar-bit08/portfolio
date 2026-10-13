/* =====================================================================
   apps/realisations.js — APPLICATION « RÉALISATIONS » (éditeur de texte)
   =====================================================================
   Un éditeur de documents propre à OscarOS (pas une copie de Word),
   dans le style « verre » du système. Deux vues :

     1. BIBLIOTHÈQUE : en-tête de l'application, filtres
        (Tous / Scolaires / Personnels), recherche, et la grille des
        fichiers — un fichier par projet, en miniatures compactes pour en
        voir un maximum d'un coup.

     2. LECTURE : le document ouvert sur une page blanche, avec
        - une barre d'outils fine en haut (décorative : lecture seule) ;
        - aucune barre latérale, pour laisser toute la place au texte ;
        - une barre d'état discrète en bas (mots, temps de lecture…).

   Les données viennent de PORTFOLIO.realisations (data.js).
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;
  const DATA = window.PORTFOLIO;
  const PROJETS = DATA.realisations;

  /* -------------------------------------------------------------------
     BARRE D'OUTILS (décorative)
     -------------------------------------------------------------------
     Une seule ligne fine. Les outils sont des <span> (et non des
     <button>) pour ne pas piéger la navigation au clavier : ils ne font
     rien, à part afficher une notification « lecture seule » au clic.
     Seul le bouton « Documents » (retour) est un vrai bouton.
     ------------------------------------------------------------------- */
  const outil = (icone, libelle) =>
    `<span class="tb" title="${OS.esc(libelle)}">${OS.icon(icone, { taille: 15, epaisseur: 1.8 })}</span>`;

  const BARRE_OUTILS = `
    <span class="tb tb--select" title="Style de paragraphe">Titre 1 ${OS.icon("chevronDown", { taille: 12 })}</span>
    <span class="toolbar__sep"></span>
    <span class="tb tb--txt" title="Gras"><b>B</b></span>
    <span class="tb tb--txt" title="Italique"><i>I</i></span>
    <span class="tb tb--txt" title="Souligné"><u>U</u></span>
    <span class="tb tb--txt" title="Barré"><s>S</s></span>
    <span class="toolbar__sep"></span>
    ${outil("listBullets", "Liste à puces")}${outil("listNumbers", "Liste numérotée")}${outil("indent", "Retrait")}
    <span class="toolbar__sep toolbar__opt"></span>
    <span class="toolbar__opt">${outil("alignLeft", "Aligner à gauche")}${outil("alignCenter", "Centrer")}${outil("alignJustify", "Justifier")}</span>
    <span class="toolbar__sep toolbar__opt"></span>
    <span class="toolbar__opt">${outil("link", "Insérer un lien")}${outil("image", "Insérer une image")}${outil("table", "Insérer un tableau")}${outil("code", "Bloc de code")}</span>`;

  /* -------------------------------------------------------------------
     RENDU DES BLOCS D'UN DOCUMENT (paragraphe, liste, tableau…)
     ------------------------------------------------------------------- */
  function rendreBloc(b) {
    switch (b.type) {
      case "p":
        return `<p>${OS.esc(b.texte)}</p>`;
      case "liste":
        return `<ul>${b.items.map((i) => `<li>${OS.esc(i)}</li>`).join("")}</ul>`;
      case "tableau":
        return `
          <table class="doc-table">
            <thead><tr>${b.entetes.map((h) => `<th>${OS.esc(h)}</th>`).join("")}</tr></thead>
            <tbody>${b.lignes.map((l) => `<tr>${l.map((c) => `<td>${OS.esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>`;
      case "code":
        return `<pre class="doc-code"><code>${b.lignes.map(OS.esc).join("\n")}</code></pre>`;
      case "note":
        return `<p class="doc-note">${OS.icon("info", { taille: 16 })}<span>${OS.esc(b.texte)}</span></p>`;
      default:
        return "";
    }
  }

  /** Construit la page complète d'un projet. */
  function rendrePage(p) {
    const lien = p.lien
      ? `<a class="doc-link" href="${OS.esc(p.lien)}" target="_blank" rel="noopener noreferrer">${OS.brandIcon("github", 16)} Voir le code source sur GitHub ${OS.icon("external", { taille: 13 })}</a>`
      : `<span class="doc-muted">Code source non publié</span>`;

    return `
      <header class="doc-head">
        <p class="doc-kicker">${OS.esc(p.contexte)}</p>
        <h1 class="doc-title">${OS.esc(p.titre)}</h1>
        <p class="doc-lead">${OS.esc(p.resume)}</p>
      </header>

      <dl class="doc-meta">
        <dt>Type</dt><dd>${OS.esc(p.contexte)}</dd>
        <dt>Technologies</dt><dd>${p.technos.map((t) => `<span class="doc-tag">${OS.esc(t)}</span>`).join(" ")}</dd>
        <dt>Code source</dt><dd>${lien}</dd>
      </dl>

      ${p.sections.map((s) => `
        <section class="doc-section">
          <h2>${OS.esc(s.titre)}</h2>
          ${s.blocs.map(rendreBloc).join("")}
        </section>`).join("")}

      <footer class="doc-foot">
        <span>${OS.esc(DATA.profil.prenom)} ${OS.esc(DATA.profil.nom)} — Portfolio BTS SIO</span>
        <span>${OS.esc(p.fichier)}</span>
      </footer>`;
  }

  /* -------------------------------------------------------------------
     MINIATURE D'UN FICHIER (vue Bibliothèque)
     ------------------------------------------------------------------- */
  function miniature(p) {
    return `
      <button class="doc-card" type="button" data-projet="${p.id}" style="--c:${p.couleur}" title="${OS.esc(p.titre)}">
        <span class="doc-card__thumb" aria-hidden="true">
          <span class="doc-card__band"></span>
          <span class="doc-card__ttl">${OS.esc(p.titre)}</span>
          <span class="doc-card__lines"><i></i><i></i><i></i><i></i></span>
          <span class="doc-card__tags">${p.technos.slice(0, 2).map((t) => `<em>${OS.esc(t)}</em>`).join("")}</span>
        </span>
        <span class="doc-card__name">${OS.docIcon(15, p.couleur)}<span>${OS.esc(p.fichier)}</span></span>
        <span class="doc-card__path">${OS.esc(p.contexte)}</span>
      </button>`;
  }

  OS.registerApp({
    id: "realisations",
    titre: "Réalisations",
    icone: "realisations",
    infobulle: "Réalisations — mes projets, à lire comme des documents",
    taille: { largeur: 1040, hauteur: 680 },

    mount(corps, ctx) {
      let filtre = "tous";        // tous | scolaire | perso
      let recherche = "";
      let derniereNotif = 0;      // évite d'empiler les notifications « lecture seule »

      /* ---------------------------------------------------------------
         VUE 1 : BIBLIOTHÈQUE
         --------------------------------------------------------------- */
      function vueBibliotheque() {
        ctx.setTitre("Réalisations");
        corps.innerHTML = `
          <div class="editor editor--library">
            <header class="editor__head">
              <div class="editor__brand">
                <span class="editor__logo">${OS.appIcon("realisations")}</span>
                <span>
                  <strong>Mes réalisations</strong>
                  <small>${PROJETS.length} documents · contexte, fonctionnalités, choix techniques et compétences</small>
                </span>
              </div>
              <label class="editor__search">${OS.icon("search", { taille: 15 })}<input type="search" placeholder="Rechercher un document" aria-label="Rechercher un document" autocomplete="off"></label>
            </header>
            <div class="editor__filters">
              <div class="seg" role="tablist" aria-label="Filtrer les projets">
                <button type="button" role="tab" data-filtre="tous">Tous</button>
                <button type="button" role="tab" data-filtre="scolaire">Scolaires</button>
                <button type="button" role="tab" data-filtre="perso">Personnels</button>
              </div>
              <span class="editor__hint">Cliquez sur un fichier pour l'ouvrir</span>
            </div>
            <div class="editor__grid"></div>
          </div>`;

        const grille = corps.querySelector(".editor__grid");
        const champ = corps.querySelector(".editor__search input");
        champ.value = recherche;

        const rafraichir = () => {
          const r = recherche.trim().toLowerCase();
          const visibles = PROJETS.filter((p) =>
            (filtre === "tous" || p.type === filtre) &&
            (!r || [p.titre, p.resume, p.fichier, ...p.technos].join(" ").toLowerCase().includes(r))
          );
          grille.innerHTML = visibles.length
            ? visibles.map(miniature).join("")
            : `<p class="editor__empty">Aucun document ne correspond à votre recherche.</p>`;
          corps.querySelectorAll("[data-filtre]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.filtre === filtre)));
        };

        champ.addEventListener("input", () => { recherche = champ.value; rafraichir(); });
        rafraichir();
      }

      /* ---------------------------------------------------------------
         VUE 2 : LECTURE D'UN DOCUMENT
         --------------------------------------------------------------- */
      function vueDocument(id) {
        const p = OS.findProject(id);
        if (!p) return vueBibliotheque();
        ctx.setTitre(`${p.fichier} — Réalisations`);

        corps.innerHTML = `
          <div class="editor editor--doc" style="--c:${p.couleur}">
            <div class="toolbar">
              <button class="toolbar__back" type="button" data-retour>${OS.icon("chevronLeft", { taille: 15 })}<span>Documents</span></button>
              <span class="toolbar__sep"></span>
              ${BARRE_OUTILS}
              <span class="toolbar__spacer"></span>
              <span class="toolbar__mode" title="Ce document ne peut pas être modifié"><i></i>Lecture seule</span>
            </div>
            <div class="editor__canvas">
              <article class="doc-page">${rendrePage(p)}</article>
            </div>
            <footer class="editor__status">
              <span>${OS.docIcon(13, p.couleur)} ${OS.esc(p.fichier)}</span>
              <span class="editor__words"></span>
              <span class="editor__read"></span>
              <span class="editor__status-spacer"></span>
              <span>${p.sections.length} sections</span>
              <span>Markdown · UTF-8</span>
            </footer>
          </div>`;

        // Nombre de mots et temps de lecture estimé (≈ 200 mots par minute)
        const mots = corps.querySelector(".doc-page").textContent.split(/\s+/).filter(Boolean).length;
        corps.querySelector(".editor__words").textContent = `${mots} mots`;
        corps.querySelector(".editor__read").textContent = `≈ ${Math.max(1, Math.round(mots / 200))} min de lecture`;
      }

      /* ---------------------------------------------------------------
         CLICS (délégation d'événements)
         --------------------------------------------------------------- */
      corps.addEventListener("click", (e) => {
        const projet = e.target.closest("[data-projet]");
        if (projet) return vueDocument(projet.dataset.projet);

        if (e.target.closest("[data-retour]")) return vueBibliotheque();

        const f = e.target.closest("[data-filtre]");
        if (f) { filtre = f.dataset.filtre; return vueBibliotheque(); }

        // Outils décoratifs → simple notification
        if (e.target.closest(".tb, .toolbar__mode")) {
          if (Date.now() - derniereNotif > 4000) {
            derniereNotif = Date.now();
            OS.toast({ titre: "Document en lecture seule", texte: "La barre d'outils est décorative : bonne lecture !", icone: "file", duree: 3200 });
          }
        }
      });

      // Ouverture directe d'un document (depuis l'appli Compétences)
      if (ctx.parametres.projet) vueDocument(ctx.parametres.projet);
      else vueBibliotheque();

      return {
        onParams(p) { if (p && p.projet) vueDocument(p.projet); }
      };
    }
  });
})();

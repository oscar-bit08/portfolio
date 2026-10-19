/* =====================================================================
   apps/competences.js — APPLICATION « COMPÉTENCES » (graphe)
   =====================================================================
   Les compétences sont présentées comme un GRAPHE :
     - au centre, le logo « ob » ;
     - autour, un point par domaine (Développement, Systèmes…) ;
     - tout autour, un point par compétence : un disque noir cerclé de SA
       couleur, avec son symbole (logo du logiciel ou icône) dans la même
       couleur. La taille du point indique le niveau (plus il est gros,
       plus je suis à l'aise).
   De fines lignes grises relient le centre aux domaines, et chaque
   domaine à ses compétences.

   Interactions :
     - survol d'une compétence → son chemin s'allume et des pointillés
       la relient aux compétences utilisées dans les mêmes projets ;
     - clic → un panneau s'ouvre à droite avec le détail (ce que je
       maîtrise, projets, outils…) ; le graphe se recentre à côté ;
     - les points se glissent à la souris et reviennent à leur place
       avec un effet ressort ;
     - clic sur un domaine (ou dans la légende) → met ses compétences
       en évidence.

   Les données viennent de PORTFOLIO.competences (data.js).
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;
  const DATA = window.PORTFOLIO;
  const { categories, liste } = DATA.competences;

  /* -------------------------------------------------------------------
     OUTILS
     ------------------------------------------------------------------- */
  /** Rayon du point selon le niveau (1 = Notions … 4 = Avancé). */
  const rayon = (niveau) => 14 + niveau * 2.5;

  /**
   * Symbole d'une compétence, dans sa couleur (currentColor) :
   *   - le logo du logiciel s'il y en a un (champ « logo » dans data.js,
   *     ex. Blender pour la modélisation 3D) ;
   *   - sinon son icône trait (champ « icone »).
   */
  const symbole = (c, taille) =>
    c.logo ? OS.brandIcon(c.logo, taille) : OS.icon(c.icone, { taille, epaisseur: 2 });

  /** Jauge de niveau : 4 segments, allumés selon le niveau. */
  const jauge = (c) => {
    const segments = [1, 2, 3, 4].map((i) => `<i class="${i <= c.niveau ? "on" : ""}"></i>`).join("");
    return `<span class="level" style="--c:${c.couleur}" title="Niveau : ${DATA.niveaux[c.niveau]}">
              <span class="level__bars" aria-hidden="true">${segments}</span>
              <span class="level__label">${DATA.niveaux[c.niveau]}</span>
            </span>`;
  };

  /**
   * Compétences « voisines » : celles qui ont servi dans au moins un
   * projet commun. Renvoie [{ competence, projets: [titres] }].
   */
  function voisines(c) {
    return liste
      .filter((autre) => autre.id !== c.id)
      .map((autre) => ({
        competence: autre,
        projets: c.projets.filter((p) => autre.projets.includes(p))
      }))
      .filter((v) => v.projets.length);
  }

  OS.registerApp({
    id: "competences",
    titre: "Compétences",
    icone: "competences",
    infobulle: "Compétences — mes savoir-faire techniques",
    taille: { largeur: 1080, hauteur: 680 },

    /**
     * Construit le contenu de la fenêtre.
     * @param {HTMLElement} corps  zone de contenu de la fenêtre
     * @param {object} ctx         { parametres, fermer, setTitre }
     */
    mount(corps, ctx) {
      corps.innerHTML = `
        <div class="graph">
          <div class="graph__stage">
            <svg class="graph__links" aria-hidden="true">
              <g class="graph__base"></g>
              <g class="graph__extra"></g>
            </svg>
            <div class="graph__nodes"></div>
            <header class="graph__head">
              <h1>Compétences</h1>
              <p>${liste.length} compétences · ${categories.length} domaines<span class="graph__tip"> — cliquez sur un point pour voir le détail</span></p>
            </header>
            <div class="graph__legend">
              <div class="graph__cats" role="group" aria-label="Mettre un domaine en évidence">
                ${categories.map((cat) => `<button class="graph__cat" type="button" data-cat="${cat.id}" aria-pressed="false" title="${OS.esc(cat.nom)}">${OS.esc(cat.court || cat.nom)}</button>`).join("")}
              </div>
              <div class="graph__sizes" aria-label="La taille du point indique le niveau">
                ${[1, 2, 3, 4].map((n) => `<span><i style="--r:${rayon(n)}px"></i>${DATA.niveaux[n]}</span>`).join("")}
              </div>
            </div>
          </div>
          <aside class="graph__panel" aria-label="Détail de la compétence" inert>
            <div class="graph__panel-inner"></div>
          </aside>
        </div>`;

      const racine = corps.querySelector(".graph");
      const scene = racine.querySelector(".graph__stage");
      const calqueBase = scene.querySelector(".graph__base");
      const calqueExtra = scene.querySelector(".graph__extra");
      const calqueNoeuds = scene.querySelector(".graph__nodes");
      const panneau = racine.querySelector(".graph__panel");
      const contenuPanneau = panneau.querySelector(".graph__panel-inner");

      /* ---------------------------------------------------------------
         1. CONSTRUCTION DU GRAPHE (nœuds + liens)
         ---------------------------------------------------------------
         Chaque nœud garde sa position « de repos » (x, y), calculée par
         disposer(), et un décalage (dx, dy) quand on le fait glisser.
         --------------------------------------------------------------- */
      const noeuds = new Map();   // id → nœud
      const liens = [];           // { de, vers, el }

      function creerNoeud(id, type, html, attributs) {
        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = `gnode gnode--${type}`;
        bouton.dataset.id = id;
        Object.entries(attributs).forEach(([cle, valeur]) => bouton.setAttribute(cle, valeur));
        bouton.innerHTML = html;
        calqueNoeuds.append(bouton);
        const noeud = { id, type, el: bouton, x: 0, y: 0, dx: 0, dy: 0, vx: 0, vy: 0 };
        noeuds.set(id, noeud);
        return noeud;
      }

      function creerLien(de, vers) {
        const ligne = document.createElementNS("http://www.w3.org/2000/svg", "line");
        ligne.setAttribute("class", "glink");
        calqueBase.append(ligne);
        liens.push({ de, vers, el: ligne });
      }

      // Le centre : le logo « ob »
      creerNoeud("centre", "centre", `<span class="gnode__core">${OS.logo("gnode__logo")}</span>`, {
        "aria-label": "Vue d'ensemble des compétences"
      });

      // Les domaines, puis leurs compétences
      categories.forEach((cat) => {
        // Domaine : une pastille posée sur le point (les lignes passent dessous)
        creerNoeud(`cat-${cat.id}`, "hub",
          `<span class="gnode__pill"><i></i>${OS.esc(cat.court || cat.nom)}</span>`,
          { "aria-label": `Mettre en évidence le domaine ${cat.nom}`, "data-cat": cat.id });
        creerLien("centre", `cat-${cat.id}`);

        liste.filter((c) => c.categorie === cat.id).forEach((c) => {
          const n = creerNoeud(c.id, "skill",
            `<span class="gnode__dot">${symbole(c, Math.round(rayon(c.niveau) * 1.05))}</span>
             <span class="gnode__label"><strong>${OS.esc(c.nom)}</strong><small>${DATA.niveaux[c.niveau]}</small></span>`,
            { "aria-label": `${c.nom} — niveau ${DATA.niveaux[c.niveau]}. Afficher le détail`, style: `--c:${c.couleur};--r:${rayon(c.niveau)}px` });
          n.competence = c;
          creerLien(`cat-${cat.id}`, c.id);
        });
      });

      /* ---------------------------------------------------------------
         2. DISPOSITION (recalculée quand la fenêtre change de taille)
         ---------------------------------------------------------------
         Les compétences sont réparties sur une ELLIPSE (la fenêtre est
         plus large que haute), dans l'ordre des domaines, avec un petit
         espace entre deux domaines. Chaque domaine est placé sur une
         ellipse intérieure, à l'angle moyen de ses compétences.
         --------------------------------------------------------------- */
      let compact = false;

      function disposer() {
        const l = scene.clientWidth;
        const h = scene.clientHeight;
        if (!l || !h) return;
        compact = l < 620;
        racine.classList.toggle("graph--compact", compact);
        // Fenêtre basse : l'astuce du sous-titre laisse la place au point du haut
        racine.classList.toggle("graph--bas", h < 620);

        const cx = l / 2;
        const cy = h / 2 + (compact ? 6 : 10);    // un peu plus bas : place pour le titre
        // Place laissée autour pour les étiquettes (plus large sur les côtés).
        // En mode compact (téléphone), l'ellipse devient étroite et haute :
        // les étiquettes se rangent à gauche et à droite.
        const rx = Math.max(56, l / 2 - (compact ? 120 : 180));
        const ry = Math.max(90, h / 2 - (compact ? 104 : 118));

        const ECART = 0.7;   // espace entre deux domaines, en « places » de compétence
        const total = liste.length + categories.length * ECART;
        const pas = (Math.PI * 2) / total;
        // Le premier domaine est centré en haut de l'ellipse
        const premier = liste.filter((c) => c.categorie === categories[0].id).length;
        let angle = -Math.PI / 2 - ((premier - 1) * pas) / 2;

        noeuds.get("centre").x = cx;
        noeuds.get("centre").y = cy;

        categories.forEach((cat) => {
          const membres = liste.filter((c) => c.categorie === cat.id);
          const angles = membres.map((c, i) => angle + i * pas);
          membres.forEach((c, i) => placer(noeuds.get(c.id), cx, cy, rx, ry, angles[i]));
          const moyen = angles.reduce((s, a) => s + a, 0) / angles.length;
          placer(noeuds.get(`cat-${cat.id}`), cx, cy, rx * 0.5, ry * 0.5, moyen);
          angle += (membres.length - 1) * pas + pas * (1 + ECART);
        });

        dessiner();
      }

      /**
       * Place un nœud sur une ellipse et oriente son étiquette vers
       * l'extérieur. Les étiquettes vont sur le CÔTÉ dès que le point
       * s'écarte un peu de l'axe vertical : empilées les unes sous les
       * autres, elles ne se chevauchent pas, même quand le graphe est
       * étroit (panneau de détail ouvert). Seuls les points tout en haut
       * ou tout en bas ont leur étiquette au-dessus / en dessous.
       */
      function placer(n, cx, cy, rx, ry, a) {
        n.x = cx + rx * Math.cos(a);
        n.y = cy + ry * Math.sin(a);
        const s = Math.sin(a);
        const c = Math.cos(a);
        n.el.dataset.side = Math.abs(c) > 0.3 ? (c > 0 ? "right" : "left") : (s < 0 ? "top" : "bottom");
      }

      /** Applique les positions aux nœuds (transform) et aux lignes. */
      function dessiner() {
        noeuds.forEach((n) => {
          n.el.style.transform = `translate(${(n.x + n.dx).toFixed(1)}px, ${(n.y + n.dy).toFixed(1)}px)`;
        });
        liens.forEach(({ de, vers, el }) => {
          const a = noeuds.get(de);
          const b = noeuds.get(vers);
          el.setAttribute("x1", (a.x + a.dx).toFixed(1));
          el.setAttribute("y1", (a.y + a.dy).toFixed(1));
          el.setAttribute("x2", (b.x + b.dx).toFixed(1));
          el.setAttribute("y2", (b.y + b.dy).toFixed(1));
        });
        dessinerExtras();
      }

      /* ---------------------------------------------------------------
         3. MISE EN ÉVIDENCE (survol / sélection / domaine)
         ---------------------------------------------------------------
         - « focus » : la compétence survolée ou sélectionnée ;
         - ses compétences voisines restent bien visibles, reliées par
           des pointillés de sa couleur (courbes qui passent par l'intérieur
           du graphe) ;
         - les autres points s'estompent.
         --------------------------------------------------------------- */
      let selection = null;       // id de la compétence ouverte dans le panneau
      let survol = null;          // id de la compétence survolée
      let domaine = null;         // id du domaine mis en évidence
      let extras = [];            // pointillés affichés : { de, vers, el }

      function mettreEnEvidence() {
        const focus = survol || selection;
        const c = focus ? OS.findSkill(focus) : null;
        const proches = c ? voisines(c).map((v) => v.competence.id) : [];

        racine.classList.toggle("has-focus", Boolean(c) || Boolean(domaine));
        noeuds.forEach((n) => {
          const dansDomaine = domaine && (n.competence?.categorie === domaine || n.id === `cat-${domaine}`);
          const actif = c && (n.id === c.id || n.id === `cat-${c.categorie}` || n.id === "centre");
          n.el.classList.toggle("is-focus", Boolean(actif) || Boolean(!c && dansDomaine));
          n.el.classList.toggle("is-near", proches.includes(n.id));
          n.el.classList.toggle("is-selected", n.id === selection);
        });
        // Lignes du chemin centre → domaine → compétence
        liens.forEach(({ de, vers, el }) => {
          const surChemin = c && (vers === c.id || (de === "centre" && vers === `cat-${c.categorie}`));
          const dansDomaine = !c && domaine && (vers === `cat-${domaine}` || noeuds.get(vers).competence?.categorie === domaine);
          el.classList.toggle("is-on", Boolean(surChemin || dansDomaine));
          el.style.setProperty("--c", surChemin ? c.couleur : "");
        });
        // Pointillés vers les voisines
        calqueExtra.innerHTML = "";
        extras = proches.map((id) => {
          const chemin = document.createElementNS("http://www.w3.org/2000/svg", "path");
          chemin.setAttribute("class", "glink glink--extra");
          chemin.style.setProperty("--c", c.couleur);
          calqueExtra.append(chemin);
          return { de: c.id, vers: id, el: chemin };
        });
        dessinerExtras();
      }

      /** Courbe de Bézier entre deux compétences, tirée vers le centre. */
      function dessinerExtras() {
        const centre = noeuds.get("centre");
        extras.forEach(({ de, vers, el }) => {
          const a = noeuds.get(de);
          const b = noeuds.get(vers);
          const ax = a.x + a.dx, ay = a.y + a.dy, bx = b.x + b.dx, by = b.y + b.dy;
          // Point de contrôle : milieu du segment, rapproché du centre
          const mx = (ax + bx) / 2 + (centre.x - (ax + bx) / 2) * 0.55;
          const my = (ay + by) / 2 + (centre.y - (ay + by) / 2) * 0.55;
          el.setAttribute("d", `M${ax.toFixed(1)} ${ay.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);
        });
      }

      function choisirDomaine(id) {
        domaine = domaine === id ? null : id;
        OS.$$(".graph__cat", racine).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === domaine)));
        mettreEnEvidence();
      }

      /* ---------------------------------------------------------------
         4. PANNEAU DE DÉTAIL
         --------------------------------------------------------------- */
      function rendreDetail(c) {
        const categorie = categories.find((k) => k.id === c.categorie)?.nom || "";
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
            <span class="proj-link__icon" style="color:#a3e635">${OS.icon("briefcase", { taille: 18 })}</span>
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
        const proches = voisines(c);

        contenuPanneau.innerHTML = `
          <header class="gpanel__head" style="--c:${c.couleur}">
            <span class="gpanel__icon">${symbole(c, 26)}</span>
            <span class="gpanel__titles">
              <span class="gpanel__cat">${OS.esc(categorie)}</span>
              <h2 class="gpanel__name" tabindex="-1">${OS.esc(c.nom)}</h2>
            </span>
            <button class="gpanel__close" type="button" aria-label="Fermer le détail">${OS.icon("x", { taille: 16 })}</button>
          </header>
          <div class="gpanel__level">${jauge(c)}</div>
          <p class="gpanel__resume">${OS.esc(c.resume)}</p>

          <h3 class="gpanel__h3">Ce que je maîtrise</h3>
          <div class="gpanel__box">
            ${c.maitrise.map((m) => `
              <div class="mastery">
                <span class="mastery__check" style="--c:${c.couleur}">${OS.icon("check", { taille: 12, epaisseur: 3 })}</span>
                <span>${OS.esc(m)}</span>
              </div>`).join("")}
          </div>

          <h3 class="gpanel__h3">Mise en œuvre</h3>
          <div class="proj-links">
            ${cartesProjets}${carteVeille}${cartesContextes}
            ${rienAMontrer ? `<p class="gpanel__empty">Compétence travaillée au quotidien et en formation.</p>` : ""}
          </div>

          <h3 class="gpanel__h3">Outils & technologies</h3>
          <div class="chips">${c.outils.map((o) => `<span class="chip">${OS.esc(o)}</span>`).join("")}</div>

          ${proches.length ? `
            <h3 class="gpanel__h3">Compétences liées <small>(mêmes projets)</small></h3>
            <div class="chips">${proches.map((v) => `
              <button class="chip chip--skill" type="button" data-skill="${v.competence.id}" style="--c:${v.competence.couleur}">
                <i></i>${OS.esc(v.competence.nom)}
              </button>`).join("")}</div>` : ""}`;
        contenuPanneau.scrollTop = 0;
      }

      function ouvrirDetail(id, { focusPanneau = false } = {}) {
        const c = OS.findSkill(id);
        if (!c) return;
        selection = id;
        survol = null;
        rendreDetail(c);
        racine.classList.add("has-detail");
        panneau.inert = false;
        ctx.setTitre(`${c.nom} — Compétences`);
        mettreEnEvidence();
        if (!OS.reduceMotion) {
          contenuPanneau.animate([{ opacity: 0, transform: "translateX(14px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(.2, .8, .2, 1)" });
        }
        if (focusPanneau) contenuPanneau.querySelector(".gpanel__name").focus({ preventScroll: true });
      }

      function fermerDetail() {
        if (!selection) return;
        const ancien = selection;
        selection = null;
        racine.classList.remove("has-detail");
        panneau.inert = true;
        ctx.setTitre("Compétences");
        mettreEnEvidence();
        // On rend le focus au point de la compétence qu'on vient de fermer
        if (panneau.contains(document.activeElement)) noeuds.get(ancien)?.el.focus({ preventScroll: true });
      }

      /* ---------------------------------------------------------------
         5. GLISSER LES POINTS (avec retour « ressort »)
         ---------------------------------------------------------------
         On ne déplace qu'après 4 px de mouvement : en dessous, c'est un
         simple clic. Au relâchement, le point revient à sa place grâce à
         une petite simulation de ressort amorti :
           accélération = -raideur × écart - amortissement × vitesse
         La boucle d'animation s'arrête dès que tout est immobile.
         --------------------------------------------------------------- */
      let boucle = 0;
      let glisseRecent = false;

      function ressort() {
        let enMouvement = false;
        noeuds.forEach((n) => {
          if (n.tenu || (!n.dx && !n.dy && !n.vx && !n.vy)) return;
          n.vx = (n.vx - n.dx * 0.12) * 0.78;
          n.vy = (n.vy - n.dy * 0.12) * 0.78;
          n.dx += n.vx;
          n.dy += n.vy;
          if (Math.abs(n.dx) + Math.abs(n.dy) + Math.abs(n.vx) + Math.abs(n.vy) < 0.08) {
            n.dx = n.dy = n.vx = n.vy = 0;
          } else {
            enMouvement = true;
          }
        });
        dessiner();
        boucle = enMouvement ? requestAnimationFrame(ressort) : 0;
      }

      calqueNoeuds.addEventListener("pointerdown", (e) => {
        const bouton = e.target.closest(".gnode--skill, .gnode--hub");
        if (!bouton || e.button !== 0) return;
        const n = noeuds.get(bouton.dataset.id);
        const depart = { x: e.clientX, y: e.clientY, dx: n.dx, dy: n.dy };
        let glisse = false;
        // On « capture » le pointeur dès l'appui : le point est petit, et un
        // geste rapide en sortirait avant même que le glisser commence
        bouton.setPointerCapture(e.pointerId);

        const bouger = (ev) => {
          const mx = ev.clientX - depart.x;
          const my = ev.clientY - depart.y;
          if (!glisse) {
            if (Math.hypot(mx, my) < 4) return;
            glisse = true;
            n.tenu = true;
            bouton.classList.add("is-dragging");
          }
          n.dx = depart.dx + mx;
          n.dy = depart.dy + my;
          dessiner();
        };
        const lacher = () => {
          bouton.removeEventListener("pointermove", bouger);
          bouton.removeEventListener("pointerup", lacher);
          bouton.removeEventListener("pointercancel", lacher);
          if (!glisse) return;
          n.tenu = false;
          bouton.classList.remove("is-dragging");
          glisseRecent = true;   // le « click » qui suit ne doit pas ouvrir le détail
          setTimeout(() => { glisseRecent = false; }, 60);
          if (OS.reduceMotion) { n.dx = n.dy = 0; dessiner(); }
          else if (!boucle) boucle = requestAnimationFrame(ressort);
        };
        bouton.addEventListener("pointermove", bouger);
        bouton.addEventListener("pointerup", lacher);
        bouton.addEventListener("pointercancel", lacher);
      });

      /* ---------------------------------------------------------------
         6. ÉVÉNEMENTS (délégation : un seul écouteur par zone)
         --------------------------------------------------------------- */
      calqueNoeuds.addEventListener("click", (e) => {
        const bouton = e.target.closest(".gnode");
        if (!bouton || glisseRecent) return;
        const n = noeuds.get(bouton.dataset.id);
        if (n.type === "skill") {
          if (selection === n.id) fermerDetail();
          else ouvrirDetail(n.id, { focusPanneau: e.detail === 0 });   // detail 0 = clavier
        } else if (n.type === "hub") {
          choisirDomaine(bouton.dataset.cat);
        } else {
          // Le centre : retour à la vue d'ensemble
          domaine = null;
          OS.$$(".graph__cat", racine).forEach((b) => b.setAttribute("aria-pressed", "false"));
          fermerDetail();
          mettreEnEvidence();
        }
      });

      // Survol : aperçu des liens (souris uniquement)
      calqueNoeuds.addEventListener("pointerover", (e) => {
        if (e.pointerType !== "mouse") return;
        const bouton = e.target.closest(".gnode--skill");
        const id = bouton ? bouton.dataset.id : null;
        if (id === survol) return;
        survol = id;
        mettreEnEvidence();
      });
      calqueNoeuds.addEventListener("pointerleave", () => {
        if (!survol) return;
        survol = null;
        mettreEnEvidence();
      });

      racine.querySelector(".graph__cats").addEventListener("click", (e) => {
        const bouton = e.target.closest("[data-cat]");
        if (bouton) choisirDomaine(bouton.dataset.cat);
      });

      panneau.addEventListener("click", (e) => {
        const cible = e.target.closest(".gpanel__close, [data-projet], [data-veille], [data-skill]");
        if (!cible) return;
        if (cible.classList.contains("gpanel__close")) fermerDetail();
        else if (cible.dataset.projet) OS.wm.open("realisations", { projet: cible.dataset.projet }, cible.getBoundingClientRect());
        else if (cible.dataset.skill) ouvrirDetail(cible.dataset.skill);
        else if ("veille" in cible.dataset) OS.apps.veille.action();
      });

      racine.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && selection) {
          e.stopPropagation();
          fermerDetail();
        }
      });

      /* ---------------------------------------------------------------
         7. TAILLE DE LA FENÊTRE
         ---------------------------------------------------------------
         ResizeObserver prévient quand la zone du graphe change de taille
         (fenêtre redimensionnée, agrandie, panneau qui s'ouvre…). On
         regroupe les appels dans requestAnimationFrame : au plus un
         calcul par image.
         --------------------------------------------------------------- */
      let demande = 0;
      const observateur = new ResizeObserver(() => {
        if (demande) return;
        demande = requestAnimationFrame(() => { demande = 0; disposer(); });
      });
      observateur.observe(scene);

      /* ---------------------------------------------------------------
         8. APPARITION : les points jaillissent du centre
         --------------------------------------------------------------- */
      disposer();
      if (!OS.reduceMotion) {
        const centre = noeuds.get("centre");
        let k = 0;
        noeuds.forEach((n) => {
          if (n.type === "centre") return;
          n.el.animate(
            [
              { transform: `translate(${centre.x}px, ${centre.y}px) scale(.2)`, opacity: 0 },
              { transform: `translate(${n.x}px, ${n.y}px)`, opacity: 1 }
            ],
            { duration: 700, delay: 120 + (n.type === "hub" ? 0 : 140 + k++ * 35), easing: "cubic-bezier(.2, .9, .25, 1.1)", fill: "backwards" }
          );
        });
        calqueBase.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 450, fill: "backwards" });
      }

      // Une compétence peut être demandée à l'ouverture (ex. depuis un autre module)
      if (ctx.parametres.competence) ouvrirDetail(ctx.parametres.competence);

      // Méthodes appelées par le gestionnaire de fenêtres
      return {
        onParams(p) { if (p && p.competence) ouvrirDetail(p.competence); },
        onClose() {
          observateur.disconnect();
          cancelAnimationFrame(boucle);
          cancelAnimationFrame(demande);
        }
      };
    }
  });
})();

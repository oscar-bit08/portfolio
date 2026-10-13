/* =====================================================================
   windows.js — LE GESTIONNAIRE DE FENÊTRES
   =====================================================================
   Il crée et pilote les fenêtres des applications :
     - ouverture (animation qui part de l'icône cliquée)
     - premier plan (la fenêtre cliquée passe devant les autres)
     - déplacement en attrapant la barre de titre
     - redimensionnement par le coin en bas à droite
     - réduction dans le dock / restauration
     - agrandissement plein écran (bouton vert ou double-clic sur la barre)
     - fermeture

   Une seule fenêtre par application : si on rouvre une application déjà
   ouverte, sa fenêtre existante revient simplement au premier plan.

   API publique (utilisée par les autres fichiers) :
     OS.wm.open(idAppli, parametres, rectOrigine)
     OS.wm.close(id) · OS.wm.minimize(id) · OS.wm.restore(id)
     OS.wm.focus(id) · OS.wm.toggleMaximize(id)
     OS.wm.get(id) · OS.wm.closeAll()
   Événements émis : wm:open, wm:close, wm:minimize, wm:restore, wm:focus
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;

  const fenetres = new Map();   // id de l'application → état de sa fenêtre
  let zIndexMax = 100;          // augmente à chaque mise au premier plan
  let cascade = 0;              // décale légèrement chaque nouvelle fenêtre

  /* -------------------------------------------------------------------
     ZONE UTILE : espace disponible entre la barre du haut et le dock
     ------------------------------------------------------------------- */
  function zoneUtile() {
    const styles = getComputedStyle(document.documentElement);
    const haut = parseFloat(styles.getPropertyValue("--topbar-h")) || 36;
    const dock = OS.$("#dock");
    const bas = dock ? dock.offsetHeight + 24 : 96;
    return { x: 0, y: haut, largeur: window.innerWidth, hauteur: window.innerHeight - haut - bas };
  }

  /* -------------------------------------------------------------------
     OUVERTURE
     ------------------------------------------------------------------- */
  function open(id, parametres = {}, rectOrigine = null) {
    const app = OS.apps[id];
    if (!app) return null;

    // Application « action » (ex. la Veille) : pas de fenêtre à créer
    if (typeof app.action === "function") {
      app.action();
      return null;
    }

    // Déjà ouverte ? On la ramène au premier plan et on lui transmet
    // les nouveaux paramètres (ex. ouvrir un document précis).
    const existante = fenetres.get(id);
    if (existante) {
      if (existante.minimise) restore(id);
      focus(id);
      if (existante.instance && typeof existante.instance.onParams === "function") {
        existante.instance.onParams(parametres);
      }
      return existante;
    }

    // ----- Construction du HTML de la fenêtre -----
    const el = document.createElement("section");
    el.className = `window glass window--${id}`;
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", app.titre);
    el.innerHTML = `
      <header class="window__bar">
        <div class="window__controls">
          <button class="wc wc--close" type="button" aria-label="Fermer ${OS.esc(app.titre)}">${OS.icon("x", { taille: 9, epaisseur: 3 })}</button>
          <button class="wc wc--min" type="button" aria-label="Réduire ${OS.esc(app.titre)}">${OS.icon("minus", { taille: 9, epaisseur: 3 })}</button>
          <button class="wc wc--max" type="button" aria-label="Agrandir ${OS.esc(app.titre)}">${OS.icon("maximize", { taille: 8, epaisseur: 3 })}</button>
        </div>
        <div class="window__title">
          <span class="window__icon">${OS.appIcon(app.icone)}</span>
          <span class="window__title-text">${OS.esc(app.titre)}</span>
        </div>
        <div class="window__spacer"></div>
      </header>
      <div class="window__body"></div>
      <div class="window__grip" aria-hidden="true"></div>`;

    // ----- Taille et position initiales -----
    const zone = zoneUtile();
    const largeur = Math.min(app.taille?.largeur || 900, zone.largeur - 32);
    const hauteur = Math.min(app.taille?.hauteur || 600, zone.hauteur - 16);
    const decalage = (cascade++ % 5) * 28;   // effet « cascade » façon Windows
    const gauche = Math.max(8, (zone.largeur - largeur) / 2 + decalage - 56);
    const haut = Math.max(zone.y + 8, zone.y + (zone.hauteur - hauteur) / 2 + decalage - 40);
    Object.assign(el.style, {
      width: `${largeur}px`,
      height: `${hauteur}px`,
      left: `${gauche}px`,
      top: `${haut}px`
    });

    OS.$("#windows").append(el);

    // ----- État de la fenêtre -----
    const etat = { id, el, app, minimise: false, maximise: false, rectAvant: null, instance: null };
    fenetres.set(id, etat);

    // ----- Contenu : c'est l'application qui le construit -----
    const corps = el.querySelector(".window__body");
    etat.instance = app.mount(corps, {
      parametres,
      fenetre: el,
      fermer: () => close(id),
      // Permet à l'application de changer le titre (ex. nom du document ouvert)
      setTitre: (texte) => { el.querySelector(".window__title-text").textContent = texte; }
    }) || {};

    // ----- Interactions -----
    brancherBoutons(etat);
    brancherDeplacement(etat);
    brancherRedimensionnement(etat);
    // Cliquer n'importe où dans la fenêtre la passe au premier plan
    el.addEventListener("pointerdown", () => focus(id), true);

    focus(id);
    animerOuverture(el, rectOrigine, id);
    OS.emit("wm:open", id);
    return etat;
  }

  /* -------------------------------------------------------------------
     ANIMATIONS (Web Animations API : element.animate())
     ------------------------------------------------------------------- */
  /** Calcule le décalage entre le centre de la fenêtre et un rectangle cible. */
  function decalageVers(el, rect) {
    const r = el.getBoundingClientRect();
    return {
      dx: rect.left + rect.width / 2 - (r.left + r.width / 2),
      dy: rect.top + rect.height / 2 - (r.top + r.height / 2)
    };
  }

  /** Rectangle de l'icône de l'application dans le dock (cible de réduction). */
  function rectDock(id) {
    const item = OS.$(`.dock__item[data-app="${id}"]`);
    return item ? item.getBoundingClientRect() : null;
  }

  function animerOuverture(el, rectOrigine, id) {
    if (OS.reduceMotion) return;
    // Point de départ : l'icône cliquée, sinon l'icône du dock
    const origine = rectOrigine || rectDock(id);
    if (!origine) {
      el.animate([{ opacity: 0, transform: "scale(.94)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "ease-out" });
      return;
    }
    const { dx, dy } = decalageVers(el, origine);
    el.animate(
      [
        { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(.1)` },
        { opacity: 1, transform: "none" }
      ],
      { duration: 460, easing: "cubic-bezier(.2, .9, .25, 1.06)" }
    );
  }

  /* -------------------------------------------------------------------
     PREMIER PLAN
     ------------------------------------------------------------------- */
  function focus(id) {
    const etat = fenetres.get(id);
    if (!etat) return;
    fenetres.forEach((autre, autreId) => autre.el.classList.toggle("is-active", autreId === id));
    // On ne ré-incrémente que si la fenêtre n'est pas déjà devant
    if (Number(etat.el.style.zIndex) !== zIndexMax) etat.el.style.zIndex = ++zIndexMax;
    OS.emit("wm:focus", id);
  }

  /** Donne le focus à la fenêtre visible la plus haute (après une réduction / fermeture). */
  function focusSuivante() {
    let meilleure = null;
    fenetres.forEach((etat) => {
      if (etat.minimise) return;
      if (!meilleure || Number(etat.el.style.zIndex) > Number(meilleure.el.style.zIndex)) meilleure = etat;
    });
    if (meilleure) focus(meilleure.id);
    else OS.emit("wm:focus", null);
  }

  /* -------------------------------------------------------------------
     RÉDUIRE / RESTAURER
     ------------------------------------------------------------------- */
  function minimize(id) {
    const etat = fenetres.get(id);
    if (!etat || etat.minimise) return;
    etat.minimise = true;
    etat.el.classList.remove("is-active");

    const fin = () => {
      etat.el.classList.add("is-minimized");
      focusSuivante();
    };
    const cible = rectDock(id);
    if (OS.reduceMotion || !cible) return fin();

    // La fenêtre « file » vers son icône du dock en rétrécissant
    const { dx, dy } = decalageVers(etat.el, cible);
    const anim = etat.el.animate(
      [
        { transform: "none", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(.06)`, opacity: 0 }
      ],
      { duration: 380, easing: "cubic-bezier(.55, 0, .75, .2)" }
    );
    anim.onfinish = fin;
    OS.emit("wm:minimize", id);
  }

  function restore(id) {
    const etat = fenetres.get(id);
    if (!etat || !etat.minimise) return;
    etat.minimise = false;
    etat.el.classList.remove("is-minimized");
    focus(id);

    const origine = rectDock(id);
    if (!OS.reduceMotion && origine) {
      const { dx, dy } = decalageVers(etat.el, origine);
      etat.el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(.06)`, opacity: 0 },
          { transform: "none", opacity: 1 }
        ],
        { duration: 400, easing: "cubic-bezier(.2, .9, .25, 1.04)" }
      );
    }
    OS.emit("wm:restore", id);
  }

  /* -------------------------------------------------------------------
     AGRANDIR / RÉTABLIR
     ------------------------------------------------------------------- */
  function toggleMaximize(id) {
    const etat = fenetres.get(id);
    if (!etat) return;
    const el = etat.el;

    // La classe is-animating active une transition CSS sur la taille
    el.classList.add("is-animating");
    setTimeout(() => el.classList.remove("is-animating"), 320);

    if (!etat.maximise) {
      etat.rectAvant = { left: el.style.left, top: el.style.top, width: el.style.width, height: el.style.height };
      appliquerMaximise(etat);
      etat.maximise = true;
      el.classList.add("is-maximized");
    } else {
      Object.assign(el.style, etat.rectAvant);
      etat.maximise = false;
      el.classList.remove("is-maximized");
    }
    el.querySelector(".wc--max").setAttribute("aria-label", etat.maximise ? "Rétablir la taille" : "Agrandir");
  }

  function appliquerMaximise(etat) {
    const zone = zoneUtile();
    const marge = 8;
    Object.assign(etat.el.style, {
      left: `${marge}px`,
      top: `${zone.y + marge}px`,
      width: `${zone.largeur - marge * 2}px`,
      height: `${zone.hauteur - marge}px`
    });
  }

  /* -------------------------------------------------------------------
     FERMER
     ------------------------------------------------------------------- */
  function close(id, immediat = false) {
    const etat = fenetres.get(id);
    if (!etat) return;
    fenetres.delete(id);
    if (etat.instance && typeof etat.instance.onClose === "function") etat.instance.onClose();

    const supprimer = () => etat.el.remove();
    if (immediat || OS.reduceMotion) supprimer();
    else {
      const anim = etat.el.animate(
        [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.92)" }],
        { duration: 200, easing: "ease-in" }
      );
      anim.onfinish = supprimer;
    }
    OS.emit("wm:close", id);
    focusSuivante();
  }

  /** Ferme toutes les fenêtres (utilisé par la mise en veille). */
  function closeAll(immediat = true) {
    Array.from(fenetres.keys()).forEach((id) => close(id, immediat));
  }

  /* -------------------------------------------------------------------
     BOUTONS ROUGE / JAUNE / VERT
     ------------------------------------------------------------------- */
  function brancherBoutons(etat) {
    const { el, id } = etat;
    el.querySelector(".wc--close").addEventListener("click", () => close(id));
    el.querySelector(".wc--min").addEventListener("click", () => minimize(id));
    el.querySelector(".wc--max").addEventListener("click", () => toggleMaximize(id));
    // Double-clic sur la barre de titre = agrandir / rétablir (comme sur un vrai OS)
    el.querySelector(".window__bar").addEventListener("dblclick", (e) => {
      if (!e.target.closest("button")) toggleMaximize(id);
    });
  }

  /* -------------------------------------------------------------------
     DÉPLACEMENT (glisser la barre de titre)
     -------------------------------------------------------------------
     On utilise les « Pointer Events » : ils fonctionnent à la fois avec
     la souris, le doigt et le stylet. setPointerCapture() garantit que
     l'on continue de recevoir les mouvements même si le pointeur sort
     de la barre pendant le glissement.
     ------------------------------------------------------------------- */
  function brancherDeplacement(etat) {
    const { el } = etat;
    const barre = el.querySelector(".window__bar");

    barre.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("button, input, a")) return;
      if (etat.maximise || OS.isCompact()) return;   // pas de déplacement en plein écran

      const depart = { x: e.clientX, y: e.clientY, gauche: el.offsetLeft, haut: el.offsetTop };
      barre.setPointerCapture(e.pointerId);
      el.classList.add("is-dragging");

      const bouger = (ev) => {
        const zone = zoneUtile();
        // On garde toujours au moins 120 px de la fenêtre visibles
        const gauche = OS.clamp(depart.gauche + ev.clientX - depart.x, 120 - el.offsetWidth, window.innerWidth - 120);
        const haut = OS.clamp(depart.haut + ev.clientY - depart.y, zone.y, window.innerHeight - 70);
        el.style.left = `${gauche}px`;
        el.style.top = `${haut}px`;
      };
      const lacher = () => {
        el.classList.remove("is-dragging");
        barre.removeEventListener("pointermove", bouger);
        barre.removeEventListener("pointerup", lacher);
        barre.removeEventListener("pointercancel", lacher);
      };
      barre.addEventListener("pointermove", bouger);
      barre.addEventListener("pointerup", lacher);
      barre.addEventListener("pointercancel", lacher);
    });
  }

  /* -------------------------------------------------------------------
     REDIMENSIONNEMENT (coin en bas à droite)
     ------------------------------------------------------------------- */
  function brancherRedimensionnement(etat) {
    const { el } = etat;
    const poignee = el.querySelector(".window__grip");
    const MIN_L = 340;
    const MIN_H = 260;

    poignee.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || etat.maximise || OS.isCompact()) return;
      e.preventDefault();
      const depart = { x: e.clientX, y: e.clientY, l: el.offsetWidth, h: el.offsetHeight };
      poignee.setPointerCapture(e.pointerId);
      el.classList.add("is-resizing");

      const bouger = (ev) => {
        const l = Math.max(MIN_L, depart.l + ev.clientX - depart.x);
        const h = Math.max(MIN_H, depart.h + ev.clientY - depart.y);
        el.style.width = `${Math.min(l, window.innerWidth - el.offsetLeft - 4)}px`;
        el.style.height = `${Math.min(h, window.innerHeight - el.offsetTop - 4)}px`;
      };
      const lacher = () => {
        el.classList.remove("is-resizing");
        poignee.removeEventListener("pointermove", bouger);
        poignee.removeEventListener("pointerup", lacher);
        poignee.removeEventListener("pointercancel", lacher);
      };
      poignee.addEventListener("pointermove", bouger);
      poignee.addEventListener("pointerup", lacher);
      poignee.addEventListener("pointercancel", lacher);
    });
  }

  /* -------------------------------------------------------------------
     REDIMENSIONNEMENT DU NAVIGATEUR : on garde les fenêtres visibles
     ------------------------------------------------------------------- */
  window.addEventListener("resize", () => {
    fenetres.forEach((etat) => {
      if (etat.maximise) return appliquerMaximise(etat);
      const el = etat.el;
      const zone = zoneUtile();
      el.style.width = `${Math.min(el.offsetWidth, window.innerWidth - 16)}px`;
      el.style.height = `${Math.min(el.offsetHeight, zone.hauteur)}px`;
      el.style.left = `${OS.clamp(el.offsetLeft, 120 - el.offsetWidth, window.innerWidth - 120)}px`;
      el.style.top = `${OS.clamp(el.offsetTop, zone.y, window.innerHeight - 70)}px`;
    });
  });

  // Exposition de l'API
  OS.wm = {
    open,
    close,
    closeAll,
    minimize,
    restore,
    focus,
    toggleMaximize,
    get: (id) => fenetres.get(id) || null
  };
})();

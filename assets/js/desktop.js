/* =====================================================================
   desktop.js — LE BUREAU
   =====================================================================
   Gère tout ce qui est visible sur le bureau, en dehors des fenêtres :
     - les icônes des applications, placées ALÉATOIREMENT à chaque
       affichage du bureau, et déplaçables (souris ou doigt) ;
     - le dock ESCAMOTABLE en bas (caché par défaut, une poignée apparaît
       quand la souris approche du bas de l'écran) ;
     - la barre du haut (menu système, application active, horloge) ;
     - les ondulations quand on clique sur le fond d'écran.

   API : OS.desktop.show({ premiereFois }) · OS.desktop.shuffle()
         OS.dock.peek(duree) · OS.dock.rectItem(id)
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;
  const P = window.PORTFOLIO.profil;

  const el = {};
  let minuterieHorloge = null;

  /* -------------------------------------------------------------------
     1. ICÔNES DU BUREAU
     ------------------------------------------------------------------- */
  function creerIcones() {
    el.icones.innerHTML = "";
    OS.DESKTOP_APPS.forEach((id, index) => {
      const app = OS.apps[id];
      if (!app) return;
      const bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = `desk-icon desk-icon--${id}`;
      bouton.dataset.app = id;
      bouton.style.setProperty("--i", index);   // décalage de l'animation d'apparition
      bouton.title = app.infobulle || app.titre;
      bouton.setAttribute("aria-label", `Ouvrir ${app.titre}`);
      bouton.innerHTML = `
        <span class="desk-icon__tile">${OS.appIcon(app.icone)}</span>
        <span class="desk-icon__label">${OS.esc(app.titre)}</span>`;
      brancherGlisser(bouton);
      // Le clic ouvre l'application… sauf si on vient de faire glisser l'icône
      bouton.addEventListener("click", () => {
        if (bouton.dataset.glisse === "1") return;
        OS.wm.open(id, {}, bouton.querySelector(".desk-icon__tile").getBoundingClientRect());
      });
      el.icones.append(bouton);
    });
  }

  /* -------------------------------------------------------------------
     2. PLACEMENT ALÉATOIRE
     -------------------------------------------------------------------
     Algorithme simple : pour chaque icône, on tire une position au hasard
     et on la garde si elle ne chevauche ni une autre icône, ni le grand
     titre central. Si on ne trouve pas après beaucoup d'essais (petit
     écran), on assouplit progressivement les contraintes.

     Les positions sont mémorisées en FRACTIONS (0 à 1) de la zone libre :
     ainsi, quand la fenêtre du navigateur change de taille, les icônes
     restent au même endroit « relatif ».
     ------------------------------------------------------------------- */
  function zoneIcones() {
    return { largeur: el.icones.clientWidth, hauteur: el.icones.clientHeight };
  }

  function rectHeroRelatif() {
    // Rectangle du titre central, exprimé dans le repère de la zone d'icônes
    const hero = OS.$(".desktop__hero").getBoundingClientRect();
    const zone = el.icones.getBoundingClientRect();
    const marge = 18;
    return {
      x: hero.left - zone.left - marge,
      y: hero.top - zone.top - marge,
      l: hero.width + marge * 2,
      h: hero.height + marge * 2
    };
  }

  const chevauche = (a, b) => a.x < b.x + b.l && a.x + a.l > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function placerAleatoirement() {
    const icones = OS.$$(".desk-icon", el.icones);
    const zone = zoneIcones();
    const hero = rectHeroRelatif();
    const marge = 14;
    const places = [];

    icones.forEach((icone) => {
      const l = icone.offsetWidth || 96;
      const h = icone.offsetHeight || 100;
      const maxX = Math.max(0, zone.largeur - l - marge * 2);
      const maxY = Math.max(0, zone.hauteur - h - marge * 2);
      let choix = null;

      for (let essai = 0; essai < 400 && !choix; essai++) {
        // Plus on échoue, plus on accepte d'être proche des autres
        const espacement = essai < 200 ? 26 : essai < 320 ? 10 : 0;
        const eviterHero = essai < 300;
        const r = { x: marge + Math.random() * maxX, y: marge + Math.random() * maxY, l, h };
        const gonfle = { x: r.x - espacement, y: r.y - espacement, l: l + espacement * 2, h: h + espacement * 2 };
        if (eviterHero && chevauche(r, hero)) continue;
        if (places.some((p) => chevauche(gonfle, p))) continue;
        choix = r;
      }
      // Dernier recours : position quelconque
      if (!choix) choix = { x: marge + Math.random() * maxX, y: marge + Math.random() * maxY, l, h };

      places.push(choix);
      icone._pos = {
        fx: maxX ? (choix.x - marge) / maxX : 0,
        fy: maxY ? (choix.y - marge) / maxY : 0
      };
      appliquerPosition(icone);
    });
  }

  /** Enregistre la position actuelle (en pixels) sous forme de fractions de la zone. */
  function memoriserPosition(icone) {
    const zone = zoneIcones();
    const marge = 14;
    const maxX = Math.max(1, zone.largeur - icone.offsetWidth - marge * 2);
    const maxY = Math.max(1, zone.hauteur - icone.offsetHeight - marge * 2);
    icone._pos = {
      fx: OS.clamp((icone.offsetLeft - marge) / maxX, 0, 1),
      fy: OS.clamp((icone.offsetTop - marge) / maxY, 0, 1)
    };
  }

  /** Convertit la position mémorisée (fractions) en pixels. */
  function appliquerPosition(icone) {
    if (!icone._pos) return;
    const zone = zoneIcones();
    const marge = 14;
    const maxX = Math.max(0, zone.largeur - icone.offsetWidth - marge * 2);
    const maxY = Math.max(0, zone.hauteur - icone.offsetHeight - marge * 2);
    icone.style.left = `${marge + icone._pos.fx * maxX}px`;
    icone.style.top = `${marge + icone._pos.fy * maxY}px`;
  }

  /* -------------------------------------------------------------------
     3. GLISSER-DÉPOSER DES ICÔNES
     -------------------------------------------------------------------
     On ne commence à déplacer l'icône qu'après 6 px de mouvement : en
     dessous, c'est considéré comme un simple clic (ouverture).
     ------------------------------------------------------------------- */
  function brancherGlisser(icone) {
    icone.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const depart = { x: e.clientX, y: e.clientY, gauche: icone.offsetLeft, haut: icone.offsetTop };
      let glisse = false;

      const bouger = (ev) => {
        const dx = ev.clientX - depart.x;
        const dy = ev.clientY - depart.y;
        if (!glisse) {
          if (Math.hypot(dx, dy) < 6) return;
          glisse = true;
          icone.setPointerCapture(ev.pointerId);
          icone.classList.add("is-dragging");
        }
        const zone = zoneIcones();
        const gauche = OS.clamp(depart.gauche + dx, 0, zone.largeur - icone.offsetWidth);
        const haut = OS.clamp(depart.haut + dy, 0, zone.hauteur - icone.offsetHeight);
        icone.style.left = `${gauche}px`;
        icone.style.top = `${haut}px`;
      };

      const lacher = () => {
        icone.removeEventListener("pointermove", bouger);
        icone.removeEventListener("pointerup", lacher);
        icone.removeEventListener("pointercancel", lacher);
        if (!glisse) return;
        icone.classList.remove("is-dragging");
        memoriserPosition(icone);
        // Bloque le « click » qui suit immédiatement le relâchement
        icone.dataset.glisse = "1";
        setTimeout(() => { icone.dataset.glisse = "0"; }, 60);
      };

      icone.addEventListener("pointermove", bouger);
      icone.addEventListener("pointerup", lacher);
      icone.addEventListener("pointercancel", lacher);
    });
  }

  /* -------------------------------------------------------------------
     4. DOCK
     -------------------------------------------------------------------
     Comportement d'un vrai dock :
       - application fermée   → l'ouvrir
       - réduite              → la restaurer
       - au premier plan      → la réduire
       - ouverte en arrière   → la passer au premier plan
     ------------------------------------------------------------------- */
  function creerDock() {
    const item = (id, titre, icone) => `
      <button class="dock__item" type="button" data-app="${id}" aria-label="${OS.esc(titre)}">
        ${OS.appIcon(icone)}
        <span class="dock__tip" aria-hidden="true">${OS.esc(titre)}</span>
      </button>`;

    el.dock.innerHTML = `
      ${item("apropos", "À propos (revoir la présentation)", "apropos")}
      <span class="dock__sep" aria-hidden="true"></span>
      ${OS.DESKTOP_APPS.filter((id) => id !== "veille").map((id) => item(id, OS.apps[id].titre, OS.apps[id].icone)).join("")}
      <span class="dock__sep" aria-hidden="true"></span>
      ${item("veille", "Veille", "veille")}`;

    el.dock.addEventListener("click", (e) => {
      const bouton = e.target.closest(".dock__item");
      if (!bouton) return;
      const id = bouton.dataset.app;
      // Au doigt, il n'y a pas de « survol » : on replie le dock après le choix
      if (e.pointerType === "touch") fermerBientot(250);
      if (id === "apropos") return OS.oobe.relancer();

      const etat = OS.wm.get(id);
      if (!etat) OS.wm.open(id, {}, bouton.getBoundingClientRect());
      else if (etat.minimise) OS.wm.restore(id);
      else if (etat.el.classList.contains("is-active")) OS.wm.minimize(id);
      else OS.wm.focus(id);
    });

    // Le point lumineux sous l'icône indique une application ouverte
    const marquer = (id, ouvert) => OS.$(`.dock__item[data-app="${id}"]`, el.dock)?.classList.toggle("is-running", ouvert);
    OS.on("wm:open", (id) => marquer(id, true));
    OS.on("wm:close", (id) => marquer(id, false));
  }

  /* -------------------------------------------------------------------
     4 bis. DOCK ESCAMOTABLE
     -------------------------------------------------------------------
     Le dock est replié par défaut pour laisser toute la hauteur aux
     fenêtres. Fonctionnement :
       1. la souris approche du bas de l'écran, au centre (ZONE_POIGNEE)
          → la classe .dock-near fait apparaître une petite barre ;
       2. survoler cette barre (ou cliquer / toucher) → le dock se déplie ;
       3. tant que la souris reste sur le dock, il reste ouvert ; dès
          qu'elle s'en éloigne, il se replie après un court délai.
     Au clavier, la poignée est un vrai bouton : Entrée déplie le dock et
     place le focus sur la première application ; Échap le replie.
     ------------------------------------------------------------------- */
  const ZONE_POIGNEE = { hauteur: 90, demiLargeur: 230 };   // px
  let dockOuvert = false;
  let minuterieDock = 0;
  let rectDockOuvert = null;   // position du dock déplié (mémorisée à l'ouverture)

  /**
   * Rectangle d'un élément du dock tel qu'il est QUAND LE DOCK EST DÉPLIÉ,
   * même s'il est replié en ce moment : on retire le décalage vertical
   * appliqué par transform (lu dans la matrice de transformation).
   */
  function rectRepos(element) {
    const r = element.getBoundingClientRect();
    const decalage = new DOMMatrixReadOnly(getComputedStyle(el.dock).transform).m42;
    return new DOMRect(r.left, r.top - decalage, r.width, r.height);
  }

  function ouvrirDock() {
    clearTimeout(minuterieDock);
    minuterieDock = 0;
    if (dockOuvert) return;
    dockOuvert = true;
    rectDockOuvert = rectRepos(el.dock);
    el.dock.classList.add("is-open");
    el.bureau.classList.add("dock-open");
    el.poignee.setAttribute("aria-expanded", "true");
    el.poignee.setAttribute("aria-label", "Masquer la barre des applications");
  }

  function fermerDock() {
    clearTimeout(minuterieDock);
    minuterieDock = 0;
    if (!dockOuvert) return;
    dockOuvert = false;
    el.dock.classList.remove("is-open");
    el.bureau.classList.remove("dock-open");
    el.poignee.setAttribute("aria-expanded", "false");
    el.poignee.setAttribute("aria-label", "Afficher la barre des applications");
  }

  /** Replie le dock après un délai (annulé si la souris revient dessus). */
  function fermerBientot(delai = 450) {
    clearTimeout(minuterieDock);
    minuterieDock = setTimeout(() => {
      minuterieDock = 0;
      // On ne replie pas sous le focus clavier
      if (!el.dock.contains(document.activeElement)) fermerDock();
    }, delai);
  }

  /** Montre le dock quelques instants (ex. : une fenêtre vient d'y être réduite). */
  function peek(duree = 1600) {
    ouvrirDock();
    fermerBientot(duree);
  }

  /** Une seule écoute des mouvements de souris pour tout le dock. */
  function suivreSouris(e) {
    if (e.pointerType !== "mouse" || el.bureau.hidden) return;
    const x = e.clientX;
    const y = e.clientY;

    // 1. Faire apparaître la poignée près du bas de l'écran, au centre
    const proche = y > window.innerHeight - ZONE_POIGNEE.hauteur &&
                   Math.abs(x - window.innerWidth / 2) < ZONE_POIGNEE.demiLargeur;
    el.bureau.classList.toggle("dock-near", proche);

    // 2. Dock ouvert : la souris est-elle dessus (ou juste en dessous) ?
    if (!dockOuvert) return;
    const r = rectDockOuvert;
    const marge = 24;
    const surLeDock = x > r.left - marge && x < r.right + marge && y > r.top - marge;
    if (surLeDock) {
      clearTimeout(minuterieDock);
      minuterieDock = 0;
    } else if (!minuterieDock) {
      fermerBientot();
    }
  }

  function brancherDock() {
    // Survol de la poignée à la souris → on déplie
    el.poignee.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "mouse") ouvrirDock();
    });
    // Clic / toucher / Entrée sur la poignée → on déplie ou on replie
    el.poignee.addEventListener("click", (e) => {
      if (dockOuvert && e.pointerType !== "mouse") return fermerDock();
      ouvrirDock();
      // e.detail === 0 : le « clic » vient du clavier → focus dans le dock
      if (e.detail === 0) OS.$(".dock__item", el.dock)?.focus();
    });

    document.addEventListener("pointermove", suivreSouris, { passive: true });

    // Toucher / cliquer ailleurs replie le dock
    document.addEventListener("pointerdown", (e) => {
      if (dockOuvert && !e.target.closest("#dock, #dock-handle")) fermerDock();
    }, true);

    // Clavier : Échap replie ; le focus qui sort du dock le replie aussi
    el.dock.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      fermerDock();
      el.poignee.focus();
    });
    el.dock.addEventListener("focusout", (e) => {
      if (!el.dock.contains(e.relatedTarget)) fermerBientot(300);
    });

    window.addEventListener("resize", () => { if (dockOuvert) rectDockOuvert = rectRepos(el.dock); });
  }

  /** Rectangle de l'icône d'une application dans le dock déplié. */
  function rectItem(id) {
    const item = OS.$(`.dock__item[data-app="${id}"]`, el.dock);
    return item ? rectRepos(item) : null;
  }

  /* -------------------------------------------------------------------
     5. BARRE DU HAUT : application active, horloge, menu système
     ------------------------------------------------------------------- */
  function creerBarreHaut() {
    // Icônes d'état décoratives + horloge
    el.statut.innerHTML = `
      <span class="topbar__icon" title="Connecté">${OS.icon("wifi", { taille: 15 })}</span>
      <span class="topbar__icon" title="Batterie : 100 %">${OS.icon("battery", { taille: 18 })}</span>
      <time class="topbar__clock" id="clock"></time>`;

    // Nom de l'application au premier plan (comme sur macOS)
    OS.on("wm:focus", (id) => {
      el.appActive.textContent = id ? OS.apps[id].titre : "Bureau";
    });

    // Menu système (clic sur « OscarOS »)
    const menu = OS.$("#system-menu");
    const bouton = OS.$("#system-button");
    menu.innerHTML = `
      <div class="system-menu__head">
        <span class="system-menu__avatar">${OS.esc(P.initiales)}</span>
        <span><strong>${OS.esc(P.prenom)} ${OS.esc(P.nom)}</strong><small>${OS.esc(P.titre)}</small></span>
      </div>
      <button type="button" role="menuitem" data-action="apropos">${OS.icon("info", { taille: 16 })}Revoir la présentation</button>
      <button type="button" role="menuitem" data-action="ranger">${OS.icon("grid", { taille: 16 })}Mélanger les icônes</button>
      <button type="button" role="menuitem" data-action="veille">${OS.icon("power", { taille: 16 })}Mettre en veille…</button>`;

    const fermerMenu = () => {
      menu.hidden = true;
      bouton.setAttribute("aria-expanded", "false");
    };
    bouton.addEventListener("click", (e) => {
      e.stopPropagation();
      const ouvrir = menu.hidden;
      menu.hidden = !ouvrir;
      bouton.setAttribute("aria-expanded", String(ouvrir));
    });
    menu.addEventListener("click", (e) => {
      const action = e.target.closest("[data-action]")?.dataset.action;
      if (!action) return;
      fermerMenu();
      if (action === "apropos") OS.oobe.relancer();
      if (action === "ranger") placerAleatoirement();
      if (action === "veille") OS.apps.veille.action();
    });
    document.addEventListener("click", (e) => {
      if (!menu.hidden && !e.target.closest("#system-menu")) fermerMenu();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") fermerMenu();
    });
  }

  function majHorloge() {
    const maintenant = new Date();
    const horloge = OS.$("#clock");
    if (!horloge) return;
    // Ex. : « lun. 13 oct. 15:42 »
    const date = maintenant.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
    const heure = maintenant.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    horloge.innerHTML = `<span class="topbar__date">${date}</span> ${heure}`;
    horloge.dateTime = maintenant.toISOString();
    // Salutation adaptée à l'heure
    el.salut.textContent = maintenant.getHours() >= 18 || maintenant.getHours() < 5 ? "Bonsoir" : "Bonjour";
  }

  /* -------------------------------------------------------------------
     6. ONDULATIONS AU CLIC SUR LE FOND D'ÉCRAN
     -------------------------------------------------------------------
     Un clic sur le fond crée deux cercles qui s'élargissent (CSS). Quand
     le front de la vague atteint une icône, celle-ci est légèrement
     poussée vers l'extérieur, comme un objet qui flotte sur l'eau :
       - plus l'icône est proche du clic, plus la poussée est forte ;
       - au-delà de RAYON_VAGUE, la vague est trop faible pour agir ;
       - le déplacement est réel (la nouvelle position est conservée).
     ------------------------------------------------------------------- */
  const RAYON_VAGUE = 440;          // px : portée de la vague
  const FORCE_VAGUE = 28;           // px : poussée maximale (icône toute proche)
  // Vitesse du front de l'onde, calculée d'après l'animation CSS « onde »
  // (cercle de 24 px agrandi 40 fois en 1,6 s, de façon linéaire)
  const VITESSE_VAGUE = (12 * 40 - 12 * 0.2) / 1600;   // ≈ 0,3 px par milliseconde

  function pousserIcones(x, y) {
    OS.$$(".desk-icon", el.icones).forEach((icone) => {
      if (icone.classList.contains("is-dragging")) return;
      const r = icone.getBoundingClientRect();
      const dx = r.left + r.width / 2 - x;
      const dy = r.top + r.height / 2 - y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance > RAYON_VAGUE) return;

      // Force décroissante avec la distance, direction = s'éloigner du clic
      const force = FORCE_VAGUE * Math.pow(1 - distance / RAYON_VAGUE, 1.3);
      const ux = dx / distance;
      const uy = dy / distance;
      // On attend que le front de la vague arrive jusqu'à l'icône
      const delai = Math.max(0, (distance - r.width / 2) / VITESSE_VAGUE);

      setTimeout(() => {
        if (icone.classList.contains("is-dragging")) return;
        const zone = zoneIcones();
        const avantX = icone.offsetLeft;
        const avantY = icone.offsetTop;
        const gauche = OS.clamp(avantX + ux * force, 0, zone.largeur - icone.offsetWidth);
        const haut = OS.clamp(avantY + uy * force, 0, zone.hauteur - icone.offsetHeight);
        const depX = gauche - avantX;
        const depY = haut - avantY;
        if (Math.abs(depX) < .5 && Math.abs(depY) < .5) return;

        // 1. On place l'icône à sa nouvelle position…
        icone.style.left = `${gauche}px`;
        icone.style.top = `${haut}px`;
        memoriserPosition(icone);

        // 2. …puis on anime le trajet depuis l'ancienne position, avec un
        //    léger dépassement et un petit tangage (effet « flotteur »).
        const tangage = OS.clamp(depX * 0.5, -6, 6);
        icone.animate(
          [
            { transform: `translate(${-depX}px, ${-depY}px)` },
            { transform: `translate(${depX * 0.18}px, ${depY * 0.18}px) rotate(${tangage}deg)`, offset: 0.45 },
            { transform: `translate(${-depX * 0.06}px, ${-depY * 0.06}px) rotate(${-tangage * 0.4}deg)`, offset: 0.75 },
            { transform: "none" }
          ],
          { duration: 1300, easing: "cubic-bezier(.25, .8, .3, 1)" }
        );
      }, delai);
    });
  }

  function brancherOndulations() {
    el.bureau.addEventListener("pointerdown", (e) => {
      // Uniquement sur le fond (pas sur une icône, une fenêtre, le dock…)
      if (e.target !== el.bureau && e.target !== el.icones && !e.target.closest(".desktop__hero")) return;
      if (OS.reduceMotion) return;
      for (let k = 0; k < 2; k++) {
        const onde = document.createElement("span");
        onde.className = "ripple";
        onde.style.left = `${e.clientX}px`;
        onde.style.top = `${e.clientY}px`;
        onde.style.animationDelay = `${k * 0.18}s`;
        el.ondulations.append(onde);
        onde.addEventListener("animationend", () => onde.remove());
      }
      pousserIcones(e.clientX, e.clientY);
    });
  }

  /* -------------------------------------------------------------------
     7. AFFICHAGE DU BUREAU
     ------------------------------------------------------------------- */
  async function show({ premiereFois = false } = {}) {
    el.bureau.hidden = false;
    fermerDock();
    // Les icônes doivent être affichées pour mesurer leur taille : on les
    // place AVANT le fondu d'apparition.
    placerAleatoirement();
    el.bureau.classList.remove("icons-in");
    void el.bureau.offsetWidth;
    el.bureau.classList.add("icons-in");     // lance l'animation « pop » des icônes
    majHorloge();
    clearInterval(minuterieHorloge);
    minuterieHorloge = setInterval(majHorloge, 15000);
    // Le fond d'écran se met en place couche par couche (effet de profondeur)
    OS.wallpaper.intro();
    OS.wallpaper.parallaxe(true);
    await OS.showScreen(el.bureau, 500);

    // Le dock se montre une fois puis se replie : on voit où il se cache
    setTimeout(() => peek(2200), OS.reduceMotion ? 0 : 900);

    if (premiereFois) {
      setTimeout(() => {
        OS.toast({
          titre: "Bienvenue sur le bureau",
          texte: OS.isTouch
            ? "Touchez une icône pour ouvrir une application. La barre des applications se cache en bas : touchez la petite barre pour l'afficher."
            : "Cliquez sur une icône pour ouvrir une application. La barre des applications se cache en bas : approchez la souris du bas de l'écran, au centre, pour l'afficher.",
          icone: "info",
          duree: 8000
        });
      }, 900);
    }
  }

  /* -------------------------------------------------------------------
     8. INITIALISATION
     ------------------------------------------------------------------- */
  function init() {
    el.bureau = OS.$("#desktop");
    el.icones = OS.$("#desktop-icons");
    el.dock = OS.$("#dock");
    el.statut = OS.$("#topbar-status");
    el.appActive = OS.$("#topbar-app");
    el.ondulations = OS.$("#ripples");
    el.salut = OS.$("#desktop-greeting");
    el.poignee = OS.$("#dock-handle");
    // Titre central : uniquement le prénom, et l'accroche définie dans data.js
    OS.$("#desktop-name").textContent = P.prenom;
    OS.$("#desktop-tag").textContent = P.accroche;
    // Petit logo « ob » devant « OscarOS » dans la barre du haut
    OS.$("#system-button").insertAdjacentHTML("afterbegin", OS.logo());

    creerIcones();
    creerDock();
    brancherDock();
    creerBarreHaut();
    brancherOndulations();

    // Redimensionnement du navigateur : on recalcule la position des icônes.
    // requestAnimationFrame regroupe les nombreux événements « resize »
    // en un seul calcul par image affichée (optimisation).
    let demande = 0;
    window.addEventListener("resize", () => {
      if (demande) return;
      demande = requestAnimationFrame(() => {
        demande = 0;
        OS.$$(".desk-icon", el.icones).forEach(appliquerPosition);
      });
    });
  }

  init();
  OS.desktop = { show, shuffle: placerAleatoirement };
  OS.dock = { peek, ouvrir: ouvrirDock, fermer: fermerDock, rectItem };
})();

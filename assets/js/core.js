/* =====================================================================
   core.js — LE « NOYAU » D'OSCAROS
   =====================================================================
   Ce fichier crée l'objet global « OS » partagé par tous les autres
   scripts, et y range des petits outils réutilisables :
     - raccourcis pour sélectionner des éléments ($, $$)
     - pause asynchrone (sleep)
     - échappement HTML (esc) pour insérer du texte sans risque
     - bus d'événements (on / emit) pour que les modules communiquent
     - registre des applications (registerApp)
     - affichage / masquage d'écrans avec fondu
     - notifications (toast) et copie dans le presse-papiers

   Pourquoi un objet global ? Les scripts sont chargés comme des scripts
   classiques (pas des modules) afin que le site fonctionne même ouvert
   directement depuis le disque (file://). Chaque fichier est entouré
   d'une fonction auto-exécutée (IIFE) pour ne pas polluer l'espace
   global : seul « OS » (et « PORTFOLIO » pour les données) est partagé.
   ===================================================================== */

(function () {
  "use strict";

  // Crée l'objet OS s'il n'existe pas encore (window.OS = espace partagé)
  const OS = (window.OS = window.OS || {});

  /* -------------------------------------------------------------------
     1. SÉLECTEURS
     ------------------------------------------------------------------- */
  /** Renvoie le premier élément correspondant au sélecteur CSS. */
  OS.$ = (selecteur, racine = document) => racine.querySelector(selecteur);
  /** Renvoie TOUS les éléments correspondants, sous forme de vrai tableau. */
  OS.$$ = (selecteur, racine = document) => Array.from(racine.querySelectorAll(selecteur));

  /* -------------------------------------------------------------------
     2. TEMPS
     ------------------------------------------------------------------- */
  /** Attend « ms » millisecondes. Utilisation : await OS.sleep(500); */
  OS.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  /** Attend la prochaine image affichée par le navigateur (≈ 16 ms). */
  OS.frame = () => new Promise((resolve) => requestAnimationFrame(resolve));

  /* -------------------------------------------------------------------
     3. SÉCURITÉ : ÉCHAPPEMENT HTML
     -------------------------------------------------------------------
     Quand on construit du HTML avec des chaînes de caractères, un texte
     contenant « < » ou « & » pourrait casser la page (ou injecter du
     code). esc() remplace ces caractères par leur équivalent sûr.
     ------------------------------------------------------------------- */
  const ENTITES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  OS.esc = (texte) => String(texte ?? "").replace(/[&<>"']/g, (c) => ENTITES[c]);

  /* -------------------------------------------------------------------
     4. PRÉFÉRENCES DE L'APPAREIL
     ------------------------------------------------------------------- */
  // L'utilisateur a-t-il demandé à réduire les animations (réglage système) ?
  OS.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Écran étroit (téléphone) : les fenêtres passent en plein écran
  OS.isCompact = () => window.matchMedia("(max-width: 720px)").matches;
  // Écran tactile principal (doigt plutôt que souris)
  OS.isTouch = window.matchMedia("(pointer: coarse)").matches;

  /* -------------------------------------------------------------------
     5. BUS D'ÉVÉNEMENTS
     -------------------------------------------------------------------
     Permet à un module de prévenir les autres sans les connaître.
     Exemple : windows.js émet « wm:open » quand une fenêtre s'ouvre,
     desktop.js écoute cet événement pour allumer le point sous l'icône
     du dock.
     ------------------------------------------------------------------- */
  const ecouteurs = {};
  OS.on = (nom, fonction) => {
    (ecouteurs[nom] = ecouteurs[nom] || []).push(fonction);
  };
  OS.emit = (nom, detail) => {
    (ecouteurs[nom] || []).forEach((fonction) => fonction(detail));
  };

  /* -------------------------------------------------------------------
     6. REGISTRE DES APPLICATIONS
     -------------------------------------------------------------------
     Chaque application (fichiers du dossier apps/) s'enregistre ici avec
     un objet de la forme :
       {
         id: "competences",
         titre: "Compétences",
         icone: "competences",          // icône d'application (icons.js)
         infobulle: "…",                // texte au survol
         taille: { largeur, hauteur },  // taille de la fenêtre
         mount(corps, ctx) { … }        // construit le contenu
       }
     Une application peut aussi être une simple « action » sans fenêtre
     (c'est le cas de la Veille) : { id, titre, icone, action() { … } }
     ------------------------------------------------------------------- */
  OS.apps = {};
  OS.registerApp = (app) => {
    OS.apps[app.id] = app;
  };
  // Ordre d'affichage des applications sur le bureau et dans le dock
  OS.DESKTOP_APPS = ["competences", "realisations", "veille", "contact"];

  /* -------------------------------------------------------------------
     7. ÉCRANS : APPARITION / DISPARITION EN FONDU
     -------------------------------------------------------------------
     Les écrans (.screen) sont cachés avec l'attribut « hidden ».
     Pour un fondu, on retire « hidden », on laisse le navigateur
     afficher l'élément (opacité 0), puis on ajoute « is-visible » qui
     déclenche la transition CSS vers l'opacité 1.
     ------------------------------------------------------------------- */
  OS.showScreen = async (element, duree = 450) => {
    element.hidden = false;
    // Lire offsetWidth force le navigateur à « calculer » l'élément :
    // sans ça, la transition ne se déclencherait pas.
    void element.offsetWidth;
    element.classList.add("is-visible");
    await OS.sleep(OS.reduceMotion ? 0 : duree);
  };

  OS.hideScreen = async (element, duree = 450) => {
    element.classList.remove("is-visible");
    await OS.sleep(OS.reduceMotion ? 0 : duree);
    element.hidden = true;
  };

  /* -------------------------------------------------------------------
     8. NOTIFICATIONS (« toasts »)
     -------------------------------------------------------------------
     Petite carte en verre qui apparaît en haut à droite, comme les
     notifications de macOS, puis disparaît toute seule.
     ------------------------------------------------------------------- */
  OS.toast = ({ titre, texte = "", icone = "info", duree = 5000 } = {}) => {
    const zone = OS.$("#toasts");
    if (!zone) return;

    const carte = document.createElement("div");
    carte.className = "toast glass";
    carte.setAttribute("role", "status");
    carte.innerHTML = `
      <span class="toast__icon">${OS.icon ? OS.icon(icone) : ""}</span>
      <span class="toast__body">
        <strong>${OS.esc(titre)}</strong>
        ${texte ? `<span>${OS.esc(texte)}</span>` : ""}
      </span>
      <button class="toast__close" type="button" aria-label="Fermer la notification">${OS.icon ? OS.icon("x") : "×"}</button>`;
    zone.append(carte);

    // Fermeture : animation de sortie puis suppression de l'élément
    const fermer = () => {
      if (carte.classList.contains("is-leaving")) return;
      carte.classList.add("is-leaving");
      setTimeout(() => carte.remove(), 350);
    };
    carte.querySelector(".toast__close").addEventListener("click", fermer);
    setTimeout(fermer, duree);
    return fermer;
  };

  /* -------------------------------------------------------------------
     9. PRESSE-PAPIERS
     ------------------------------------------------------------------- */
  OS.copy = async (texte) => {
    try {
      await navigator.clipboard.writeText(texte);
      return true;
    } catch {
      // Solution de secours pour les navigateurs qui refusent l'API
      // (par exemple quand la page est ouverte en file://)
      const zone = document.createElement("textarea");
      zone.value = texte;
      zone.style.position = "fixed";
      zone.style.opacity = "0";
      document.body.append(zone);
      zone.select();
      const ok = document.execCommand("copy");
      zone.remove();
      return ok;
    }
  };

  /* -------------------------------------------------------------------
     10. PETITS UTILITAIRES
     ------------------------------------------------------------------- */
  /** Nombre aléatoire entre min et max. */
  OS.random = (min, max) => min + Math.random() * (max - min);
  /** Contraint une valeur entre un minimum et un maximum. */
  OS.clamp = (valeur, min, max) => Math.min(Math.max(valeur, min), max);
  /** Retrouve une réalisation ou une compétence par son id. */
  OS.findProject = (id) => window.PORTFOLIO.realisations.find((p) => p.id === id);
  OS.findSkill = (id) => window.PORTFOLIO.competences.liste.find((c) => c.id === id);
})();

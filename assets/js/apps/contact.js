/* =====================================================================
   apps/contact.js — APPLICATION « CONTACT »
   =====================================================================
   Inspirée de l'application Contacts d'iOS / macOS :
     - en haut : ma « fiche contact » (avatar, nom, statut) ;
     - dessous : la liste des moyens de me joindre (Gmail, LinkedIn,
       GitHub…). Un clic sur une ligne ouvre directement le lien dans un
       nouvel onglet ; le petit bouton à droite copie l'adresse.
   Les données viennent de PORTFOLIO.contacts (data.js).
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;
  const DATA = window.PORTFOLIO;

  OS.registerApp({
    id: "contact",
    titre: "Contact",
    icone: "contact",
    infobulle: "Contact — me joindre par e-mail, LinkedIn, GitHub…",
    taille: { largeur: 480, hauteur: 680 },

    mount(corps) {
      const P = DATA.profil;

      // Une ligne par moyen de contact
      const lignes = DATA.contacts.map((c) => {
        // Les liens « tel: » s'ouvrent dans la même fenêtre, les autres dans un nouvel onglet
        const externe = !c.url.startsWith("tel:");
        return `
          <li class="contact-item">
            <a class="contact-row" href="${OS.esc(c.url)}" ${externe ? 'target="_blank" rel="noopener noreferrer"' : ""}>
              <span class="contact-row__icon" style="--c:${c.couleur}">${OS.brandIcon(c.icone, 20)}</span>
              <span class="contact-row__text">
                <strong>${OS.esc(c.nom)}</strong>
                <span>${OS.esc(c.valeur)}</span>
              </span>
              <span class="contact-row__go">${OS.esc(c.action)} ${OS.icon(externe ? "external" : "chevronRight", { taille: 14 })}</span>
            </a>
            ${c.copier ? `<button class="contact-copy" type="button" data-copier="${OS.esc(c.copier)}" aria-label="Copier ${OS.esc(c.valeur)}" title="Copier">${OS.icon("copy", { taille: 15 })}</button>` : ""}
          </li>`;
      }).join("");

      corps.innerHTML = `
        <div class="contacts">
          <header class="contacts__card">
            <span class="contacts__avatar">${OS.esc(P.initiales)}</span>
            <h2 class="contacts__name">${OS.esc(P.prenom)} ${OS.esc(P.nom)}</h2>
            <p class="contacts__role">${OS.esc(P.titre)} · ${OS.esc(P.specialite)}</p>
            <p class="contacts__loc">${OS.icon("mapPin", { taille: 14 })} ${OS.esc(P.region)}</p>
            <span class="status-pill"><i></i>${OS.esc(P.disponibilite)}</span>
          </header>

          <p class="contacts__label">Me contacter</p>
          <ul class="contacts__list">${lignes}</ul>

          <p class="contacts__foot">Une question sur un projet ou sur mon parcours ? Je réponds rapidement.</p>
        </div>`;

      // Boutons « copier » : copie le texte puis affiche une confirmation
      corps.addEventListener("click", async (e) => {
        const bouton = e.target.closest("[data-copier]");
        if (!bouton) return;
        const ok = await OS.copy(bouton.dataset.copier);
        if (ok) {
          bouton.classList.add("is-done");
          bouton.innerHTML = OS.icon("check", { taille: 15, epaisseur: 2.6 });
          OS.toast({ titre: "Copié dans le presse-papiers", texte: bouton.dataset.copier, icone: "check", duree: 2500 });
          setTimeout(() => {
            bouton.classList.remove("is-done");
            bouton.innerHTML = OS.icon("copy", { taille: 15 });
          }, 1800);
        }
      });

      return {};
    }
  });
})();

/* =====================================================================
   illustrations.js — ILLUSTRATIONS DES 5 SLIDES « À PROPOS »
   =====================================================================
   Chaque illustration est une petite scène composée :
     - d'un dessin principal en SVG (dégradés, reflets) ;
     - de « pastilles » en verre (.illu__chip) qui flottent autour.
   Tout est animé en CSS (voir boot.css, section ILLUSTRATIONS) : rien à
   télécharger, et le rendu reste net sur tous les écrans.

   Chaque fonction renvoie une chaîne HTML. Elles sont appelées par
   oobe.js selon le champ « illustration » de chaque slide (data.js).
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;
  const P = window.PORTFOLIO.profil;

  // Identifiant unique pour les dégradés SVG (évite les conflits d'id)
  let n = 0;
  const uid = () => `il${++n}`;

  /**
   * Fabrique une pastille flottante.
   * x / y = position en % dans la scène ; d = décalage de l'animation.
   */
  const pastille = (icone, texte, x, y, d = 0) =>
    `<span class="illu__chip" style="--x:${x}%;--y:${y}%;--d:${d}s">${OS.icon(icone, { taille: 15 })}${OS.esc(texte)}</span>`;

  OS.illustrations = {

    /* ---------------------------------------------------------------
       1. BIENVENUE : globe en verre + avion en papier (clin d'œil à
          l'écran d'installation de Windows 11)
       --------------------------------------------------------------- */
    bienvenue() {
      const u = uid();
      return `
      <div class="illu illu--welcome">
        <div class="illu__halo"></div>
        <div class="illu__orbit"><i></i></div>
        <svg class="illu__main" viewBox="0 0 240 240">
          <defs>
            <radialGradient id="${u}-globe" cx="35%" cy="30%" r="75%">
              <stop offset="0" stop-color="#a5f3fc"/>
              <stop offset=".35" stop-color="#38bdf8"/>
              <stop offset=".75" stop-color="#2563eb"/>
              <stop offset="1" stop-color="#312e81"/>
            </radialGradient>
            <radialGradient id="${u}-reflet" cx="50%" cy="50%" r="50%">
              <stop offset="0" stop-color="#fff" stop-opacity=".85"/>
              <stop offset="1" stop-color="#fff" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="${u}-terre" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#0d9488"/>
            </linearGradient>
            <clipPath id="${u}-clip"><circle cx="120" cy="124" r="78"/></clipPath>
          </defs>
          <!-- Ombre portée -->
          <ellipse cx="120" cy="214" rx="62" ry="9" fill="#020617" opacity=".35"/>
          <!-- Sphère -->
          <circle cx="120" cy="124" r="78" fill="url(#${u}-globe)"/>
          <!-- Continents stylisés (découpés dans la sphère) -->
          <g clip-path="url(#${u}-clip)" fill="url(#${u}-terre)" opacity=".9">
            <path d="M58 92c14-12 34-14 44-6 8 7 2 18-8 22-12 5-14 16-26 18-14 2-20-20-10-34z"/>
            <path d="M128 70c16-6 38 0 46 14 6 11-6 18-18 16-10-2-14 8-24 6-14-3-18-30-4-36z"/>
            <path d="M118 140c14-4 30 4 32 18 2 13-10 26-24 26-12 0-18-12-16-24 1-8 0-17 8-20z"/>
          </g>
          <!-- Méridiens et parallèles -->
          <g fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.2">
            <ellipse cx="120" cy="124" rx="78" ry="26"/>
            <ellipse cx="120" cy="124" rx="32" ry="78"/>
            <path d="M42 124h156"/>
          </g>
          <!-- Reflet spéculaire (effet verre) -->
          <ellipse cx="92" cy="90" rx="34" ry="20" fill="url(#${u}-reflet)" transform="rotate(-32 92 90)"/>
          <circle cx="120" cy="124" r="78" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>
        </svg>
        <!-- Avion en papier -->
        <svg class="illu__plane" viewBox="0 0 100 80">
          <path d="M4 38 96 4 60 76 46 50z" fill="#fff"/>
          <path d="M46 50 96 4 60 76z" fill="#dbe6ff"/>
          <path d="M46 50 96 4 38 66z" fill="#b4c8f4"/>
        </svg>
        ${pastille("python", "Python", 4, 18, 0)}
        ${pastille("terminal", "Linux", 70, 8, 1.2)}
        ${pastille("database", "SQL", 76, 70, .6)}
        ${pastille("layers", "Docker", 2, 74, 1.8)}
      </div>`;
    },

    /* ---------------------------------------------------------------
       2. PROFIL : carte d'identité en verre
       --------------------------------------------------------------- */
    profil() {
      return `
      <div class="illu illu--profile">
        <div class="illu__halo illu__halo--violet"></div>
        <div class="id-card">
          <div class="id-card__top">
            <span class="id-card__avatar">${OS.esc(P.initiales)}</span>
            <span class="id-card__badge">${OS.icon("check", { taille: 12, epaisseur: 3 })}</span>
          </div>
          <p class="id-card__name">${OS.esc(P.prenom)} ${OS.esc(P.nom)}</p>
          <p class="id-card__role">${OS.esc(P.titre)} · ${P.age} ans</p>
          <div class="id-card__bars"><i style="--w:86%"></i><i style="--w:62%"></i><i style="--w:74%"></i></div>
          <div class="id-card__foot">${OS.icon("mapPin", { taille: 13 })} ${OS.esc(P.ville.replace(/\s*\(.*\)/, ""))} · ${OS.esc(P.region)}</div>
        </div>
        ${pastille("target", "Rigoureux", 0, 12, 0)}
        ${pastille("rocket", "Autonome", 66, 4, .9)}
        ${pastille("globe", "Anglais B2", 62, 88, 1.6)}
        ${pastille("sparkles", "Curieux", 2, 86, .4)}
      </div>`;
    },

    /* ---------------------------------------------------------------
       3. FORMATION : toque de diplômé au-dessus d'une pile de livres
       --------------------------------------------------------------- */
    formation() {
      const u = uid();
      return `
      <div class="illu illu--formation">
        <div class="illu__halo illu__halo--indigo"></div>
        <svg class="illu__main" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="${u}-dessus" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#818cf8"/><stop offset="1" stop-color="#3730a3"/>
            </linearGradient>
            <linearGradient id="${u}-corps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#4338ca"/><stop offset="1" stop-color="#1e1b4b"/>
            </linearGradient>
            <linearGradient id="${u}-livre1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0ea5e9"/>
            </linearGradient>
            <linearGradient id="${u}-livre2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#f472b6"/><stop offset="1" stop-color="#db2777"/>
            </linearGradient>
            <linearGradient id="${u}-livre3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#059669"/>
            </linearGradient>
          </defs>
          <ellipse cx="120" cy="220" rx="70" ry="8" fill="#020617" opacity=".35"/>
          <!-- Pile de livres -->
          <g class="illu__books">
            <rect x="58" y="186" width="124" height="22" rx="4" fill="url(#${u}-livre3)"/>
            <rect x="64" y="190" width="112" height="4" rx="2" fill="#fff" opacity=".35"/>
            <rect x="66" y="164" width="112" height="22" rx="4" fill="url(#${u}-livre2)"/>
            <rect x="72" y="168" width="100" height="4" rx="2" fill="#fff" opacity=".35"/>
            <rect x="54" y="142" width="120" height="22" rx="4" fill="url(#${u}-livre1)"/>
            <rect x="60" y="146" width="108" height="4" rx="2" fill="#fff" opacity=".4"/>
          </g>
          <!-- Toque -->
          <g class="illu__cap">
            <path d="M74 84v30c0 14 92 14 92 0V84l-46 18z" fill="url(#${u}-corps)"/>
            <path d="M120 40 206 74 120 108 34 74z" fill="url(#${u}-dessus)"/>
            <path d="M120 40 206 74 120 108 34 74z" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/>
            <path d="M80 62 120 46" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>
            <!-- Gland -->
            <path d="M120 74 186 86v34" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round"/>
            <circle cx="120" cy="74" r="5" fill="#fbbf24"/>
            <path d="M180 120h12l-2 16h-8z" fill="#fbbf24"/>
          </g>
        </svg>
        ${pastille("graduation", "BTS SIO", 66, 6, 0)}
        ${pastille("code", "NSI", 2, 22, 1.1)}
        ${pastille("chart", "Maths", 74, 58, .5)}
        ${pastille("cube", "TUMO · 3D", 0, 66, 1.7)}
      </div>`;
    },

    /* ---------------------------------------------------------------
       4. EXPÉRIENCES : écran avec une liste de tâches qui se cochent
       --------------------------------------------------------------- */
    experiences() {
      const u = uid();
      // 4 lignes de « tâches » qui se cochent l'une après l'autre (CSS)
      const lignes = [0, 1, 2, 3].map((i) => `
            <g class="illu__task" style="--i:${i}">
              <circle cx="58" cy="${68 + i * 20}" r="6.5" fill="#22c55e"/>
              <path d="m55 ${68 + i * 20} 2.2 2.2 4-4.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="72" y="${64 + i * 20}" width="${[86, 64, 96, 52][i]}" height="8" rx="4" fill="#fff" opacity=".75"/>
            </g>`).join("");
      return `
      <div class="illu illu--experiences">
        <div class="illu__halo illu__halo--teal"></div>
        <svg class="illu__main" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="${u}-cadre" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#e2e8f0"/><stop offset="1" stop-color="#94a3b8"/>
            </linearGradient>
            <linearGradient id="${u}-ecran" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#0ea5e9"/><stop offset=".6" stop-color="#2563eb"/><stop offset="1" stop-color="#4f46e5"/>
            </linearGradient>
          </defs>
          <ellipse cx="120" cy="214" rx="66" ry="8" fill="#020617" opacity=".35"/>
          <!-- Pied de l'écran -->
          <path d="M104 172h32l7 30h-46z" fill="url(#${u}-cadre)"/>
          <rect x="82" y="200" width="76" height="8" rx="4" fill="#cbd5e1"/>
          <!-- Écran -->
          <rect x="28" y="36" width="184" height="138" rx="12" fill="url(#${u}-cadre)"/>
          <rect x="36" y="44" width="168" height="122" rx="7" fill="url(#${u}-ecran)"/>
          <!-- Barre de fenêtre -->
          <rect x="36" y="44" width="168" height="14" rx="7" fill="#fff" opacity=".18"/>
          <circle cx="46" cy="51" r="2.5" fill="#ff5f57"/><circle cx="54" cy="51" r="2.5" fill="#febc2e"/><circle cx="62" cy="51" r="2.5" fill="#28c840"/>
          ${lignes}
          <!-- Reflet sur la vitre -->
          <path d="M36 44h70l-40 122H36z" fill="#fff" opacity=".08"/>
        </svg>
        ${pastille("briefcase", "Alternance · TDI", 0, 10, 0)}
        ${pastille("server", "15+ postes", 72, 4, 1.3)}
        ${pastille("wrench", "Assistance N1-N2", 58, 82, .7)}
        ${pastille("user", "Mairie de Caluire", 0, 76, 1.9)}
      </div>`;
    },

    /* ---------------------------------------------------------------
       5. PROJET PRO : fusée qui suit une trajectoire à étapes
       --------------------------------------------------------------- */
    projet() {
      const u = uid();
      return `
      <div class="illu illu--projet">
        <div class="illu__halo illu__halo--orange"></div>
        <svg class="illu__main" viewBox="0 0 240 240">
          <defs>
            <linearGradient id="${u}-fusee" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cbd5e1"/>
            </linearGradient>
            <linearGradient id="${u}-flamme" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#fde047"/><stop offset="1" stop-color="#f97316" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Trajectoire en pointillés -->
          <path class="illu__path" d="M26 206C70 200 86 160 112 134S170 72 196 40" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round"/>
          <!-- Étapes -->
          <g font-family="Geist, system-ui, sans-serif" font-size="11" font-weight="600" fill="#fff">
            <circle cx="40" cy="203" r="7" fill="#22c55e" stroke="#fff" stroke-width="2"/>
            <text x="52" y="222">Bac</text>
            <circle cx="112" cy="134" r="7" fill="#38bdf8" stroke="#fff" stroke-width="2"/>
            <text x="124" y="150">BTS SIO</text>
            <!-- L'étape en cours est portée par la fusée -->
            <text x="172" y="20" text-anchor="end" fill="#fdba74" font-size="12">Alternance TDI →</text>
          </g>
          <!-- Fusée -->
          <g class="illu__rocket" transform="translate(196 40) rotate(45)">
            <path d="M-6 26 0 52 6 26z" fill="url(#${u}-flamme)"/>
            <path d="M0-30C12-18 14 0 12 22H-12C-14 0-12-18 0-30z" fill="url(#${u}-fusee)"/>
            <circle cx="0" cy="-4" r="6" fill="#38bdf8" stroke="#1e3a8a" stroke-width="2"/>
            <path d="M-12 10-22 26h10zM12 10l10 16H12z" fill="#f97316"/>
          </g>
        </svg>
        ${pastille("wrench", "Support informatique", 0, 8, 0)}
        ${pastille("chart", "Données & Power BI", 46, 88, 1.2)}
        ${pastille("server", "Admin système", 0, 52, .6)}
      </div>`;
    }
  };
})();

/* =====================================================================
   data.js — TOUT LE CONTENU DU PORTFOLIO
   =====================================================================
   C'est LE fichier à modifier pour mettre à jour le portfolio :
   ajouter une compétence, un projet, changer un lien, corriger un texte…
   Aucun autre fichier n'a besoin d'être touché pour le contenu.

   Organisation :
     PORTFOLIO.profil        → identité (nom, école, ville…)
     PORTFOLIO.slides        → les 5 étapes de l'écran « À propos »
     PORTFOLIO.niveaux       → libellés des niveaux de compétence
     PORTFOLIO.competences   → catégories + liste des compétences
     PORTFOLIO.realisations  → les projets (affichés comme des fichiers dans l'éditeur)
     PORTFOLIO.contacts      → les liens de contact
     PORTFOLIO.veille        → le texte de veille affiché dans le terminal

   Règles d'écriture :
     - Les textes sont entre guillemets doubles "…" : on peut donc utiliser
       l'apostrophe ' librement à l'intérieur.
     - Dans les textes des slides, la balise <strong>…</strong> est
       autorisée pour mettre un mot en gras.
     - Les « id » servent à relier les éléments entre eux (par exemple une
       compétence cite les id des projets où elle a été utilisée) :
       ils doivent être uniques, sans espace ni accent.
   ===================================================================== */

window.PORTFOLIO = {

  /* -------------------------------------------------------------------
     1. PROFIL
     ------------------------------------------------------------------- */
  profil: {
    prenom: "Oscar",
    nom: "Bonant",
    initiales: "OB",
    titre: "Étudiant en BTS SIO",
    specialite: "Support informatique & traitement de données",
    ecole: "NEXA Lyon",
    // Localisation volontairement large (pas de ville ni de code postal)
    region: "Métropole lyonnaise",
    // Alternance en cours (affichée sur le bureau, dans les slides et dans Contact)
    alternance: {
      entreprise: "TDI-Group",
      activite: "éditeur-intégrateur de solutions de gestion d'expéditions"
    },
    disponibilite: "En alternance chez TDI-Group",
    accroche: "Étudiant en BTS SIO · En alternance chez TDI-Group",   // sous le prénom, sur le bureau
    github: "oscar-bit08"
  },

  /* -------------------------------------------------------------------
     2. SLIDES « À PROPOS » (écran d'installation façon Windows)
     -------------------------------------------------------------------
     Chaque slide peut contenir :
       etape        → nom court affiché dans la barre de progression
       illustration → nom de l'illustration (voir illustrations.js)
       titre        → grand titre
       paragraphes  → liste de paragraphes
       atouts       → petites cartes avec icône (grille 2 colonnes)
       liste        → liste sélectionnable façon « Choisissez votre région »
       cartes       → cartes empilées (icône + titre + texte)
       bouton       → texte du bouton principal (par défaut « Suivant »)
     ------------------------------------------------------------------- */
  slides: [
    {
      id: "bienvenue",
      etape: "Bienvenue",
      illustration: "bienvenue",
      titre: "Bienvenue sur mon portfolio",
      paragraphes: [
        "Je m'appelle <strong>Oscar Bonant</strong> et je suis étudiant en <strong>BTS SIO</strong> (Services Informatiques aux Organisations) à NEXA Lyon, en <strong>alternance chez TDI-Group</strong>.",
        "Ce portfolio fonctionne comme un petit système d'exploitation. Avant d'arriver sur le bureau, je vous propose une configuration express en 5 étapes pour faire connaissance."
      ],
      bouton: "Commencer"
    },
    {
      id: "profil",
      etape: "Profil",
      illustration: "profil",
      titre: "Qui suis-je ?",
      paragraphes: [
        "Passionné d'informatique et toujours à jour sur l'actualité tech, j'aime comprendre comment les choses fonctionnent… puis les construire moi-même.",
        "Je me forme en continu à travers mes projets personnels : bots Python, serveur cloud sous Docker, applications web. En ce moment, je me forme à <strong>Claude Code</strong> et à la <strong>création d'agents IA</strong>."
      ],
      // Uniquement des FAITS vérifiables (pas de qualités du type « rigoureux »).
      // Penser à mettre à jour « 9 projets » si une réalisation est ajoutée.
      atouts: [
        { icone: "globe",     titre: "Anglais B2",           texte: "À l'aise à l'écrit comme à l'oral" },
        { icone: "server",    titre: "15+ postes déployés",  texte: "Windows 10/11, en stage à la mairie de Caluire" },
        { icone: "folder",    titre: "9 projets réalisés",   texte: "Python, web, Docker : voir l'appli Réalisations" },
        { icone: "briefcase", titre: "Achat-revente en ligne", texte: "Activité personnelle sur Vinted" }
      ]
    },
    {
      id: "formation",
      etape: "Formation",
      illustration: "formation",
      titre: "Mon parcours de formation",
      paragraphes: ["Sélectionnez une ligne pour afficher le détail."],
      liste: [
        {
          titre: "BTS SIO",
          sousTitre: "Services Informatiques aux Organisations · NEXA Lyon",
          periode: "Depuis sept. 2026",
          details: [
            "Formation aux métiers de l'informatique : support et maintenance, administration des systèmes, développement et gestion des données.",
            "Je prépare ce BTS en alternance chez TDI-Group."
          ]
        },
        {
          titre: "Baccalauréat général",
          sousTitre: "Spécialités Mathématiques & NSI",
          periode: "2023 – 2026",
          details: [
            "Spécialités Mathématiques et Numérique & Sciences Informatiques (NSI).",
            "C'est en NSI que j'ai réalisé plusieurs de mes projets : recommandateur de quartiers lyonnais (Flask, SQLite), jeu du Pendu (Tkinter), site vitrine automobile et algorithmes sur les graphes."
          ]
        },
        {
          titre: "TUMO",
          sousTitre: "Initiation à la programmation et à la modélisation 3D",
          periode: "Oct. 2023 – juil. 2025",
          details: [
            "Initiation à la création numérique : programmation et modélisation 3D.",
            "Près de deux ans de pratique (oct. 2023 – juil. 2025) sur des logiciels professionnels de programmation et de 3D."
          ]
        }
      ]
    },
    {
      id: "experiences",
      etape: "Expériences",
      illustration: "experiences",
      titre: "Mes expériences",
      paragraphes: ["Une alternance en cours, après deux stages d'observation qui ont confirmé mon orientation vers l'informatique."],
      liste: [
        {
          titre: "TDI-Group",
          sousTitre: "Alternance BTS SIO",
          periode: "Depuis 2026",
          // À COMPLÉTER : ajouter ici tes missions concrètes chez TDI-Group
          details: [
            "Éditeur-intégrateur spécialisé dans la gestion d'expéditions, qui relie les entreprises à plus de 250 transporteurs.",
            "J'y prépare mon BTS SIO en alternance."
          ]
        },
        {
          titre: "Mairie de Caluire",
          sousTitre: "Stage d'observation · Métropole lyonnaise",
          periode: "Juin 2024",
          details: [
            "Diagnostic et résolution d'incidents sur Windows 10/11 (assistance niveau 1-2).",
            "Installation et configuration de plus de 15 postes informatiques et périphériques réseau en milieu scolaire."
          ]
        },
        {
          titre: "CGI",
          sousTitre: "Stage d'observation · Lyon",
          periode: "Janv. – févr. 2023",
          details: [
            "Immersion dans une entreprise de services numériques.",
            "Ce stage a renforcé mon intérêt pour les nouvelles technologies et le travail en équipe."
          ]
        }
      ]
    },
    {
      id: "projet",
      etape: "Projet pro",
      illustration: "projet",
      titre: "Mon projet professionnel",
      paragraphes: [
        "Je prépare mon <strong>BTS SIO en alternance chez TDI-Group</strong>. Mon objectif : <strong>travailler dans le secteur de l'intelligence artificielle</strong>. Pour y arriver, je consolide mes bases en <strong>support informatique</strong> et en <strong>traitement de données</strong>, en mettant en pratique en entreprise ce que j'apprends en formation."
      ],
      cartes: [
        { icone: "briefcase", titre: "Aujourd'hui",          texte: "BTS SIO à NEXA Lyon, en alternance chez TDI-Group, éditeur de solutions de gestion d'expéditions." },
        { icone: "target",    titre: "Ce que j'apporte",     texte: "Une première expérience terrain : assistance niveau 1-2 et déploiement de plus de 15 postes Windows, en stage à la mairie de Caluire." },
        { icone: "sparkles",  titre: "Ce que je développe",  texte: "Claude Code et la création d'agents IA, dans la continuité de mon objectif : travailler dans l'IA." }
      ],
      bouton: "Accéder au bureau"
    }
  ],

  /* -------------------------------------------------------------------
     3. NIVEAUX DE COMPÉTENCE (de 1 à 4)
     ------------------------------------------------------------------- */
  niveaux: {
    1: "Notions",
    2: "En progression",
    3: "Opérationnel",
    4: "Avancé"
  },

  /* -------------------------------------------------------------------
     4. COMPÉTENCES (application « Compétences », affichée en graphe)
     -------------------------------------------------------------------
     Champs d'une compétence :
       id, nom, categorie (id d'une catégorie), icone (voir icons.js),
       couleur (couleur du point dans le graphe : une par compétence), resume (une phrase),
       niveau (1 à 4 — À AJUSTER selon ton ressenti ; taille du point),
       maitrise  → ce que je sais faire (liste),
       outils    → technologies associées (liste),
       projets   → id des réalisations où la compétence a servi,
       contextes → expériences / formations liées (texte libre),
       veille    → true pour afficher un lien vers l'appli Veille
       logo      → logo du logiciel affiché dans le point du graphe (voir
                   MARQUES dans icons.js) ; sinon c'est l'icône qui est affichée
     Catégories : nom (légende), court (étiquette posée sur le graphe)
     ------------------------------------------------------------------- */
  competences: {
    categories: [
      { id: "dev",  nom: "Développement",               court: "Développement" },
      { id: "sys",  nom: "Systèmes, réseaux & support", court: "Systèmes & réseaux" },
      { id: "data", nom: "Données, IA & création",     court: "Données & IA" }
    ],
    liste: [
      {
        id: "python",
        nom: "Python",
        categorie: "dev",
        icone: "python",
        logo: "python",
        couleur: "#60a5fa",
        resume: "Mon langage de prédilection : scripts, interfaces graphiques, web et automatisation.",
        niveau: 4,
        maitrise: [
          "Programmation orientée objet (classes, méthodes, encapsulation)",
          "Interfaces graphiques avec Tkinter et Pillow",
          "Applications web avec Flask (routes, formulaires GET/POST, templates Jinja2)",
          "Web scraping de pages dynamiques avec Playwright et BeautifulSoup4",
          "Programmation asynchrone avec asyncio",
          "Bots Discord avec discord.py (messages enrichis, boucles de rafraîchissement)",
          "Lecture et écriture de fichiers (listes de mots, mémoire anti-doublon)",
          "Algorithmes sur les graphes : listes et matrices d'adjacence, parcours en profondeur"
        ],
        outils: ["Python 3", "Tkinter", "Flask", "discord.py", "Playwright", "BeautifulSoup4", "asyncio", "Spyder"],
        projets: ["bots-discord", "quartiers-lyon", "pendu", "plateforme-echange", "graphes"]
      },
      {
        id: "web",
        nom: "HTML / CSS / JavaScript",
        categorie: "dev",
        icone: "code",
        couleur: "#fb923c",
        resume: "Créer des interfaces web, de la page statique à l'application interactive.",
        niveau: 3,
        maitrise: [
          "Structurer une page en HTML5 sémantique",
          "Mettre en page en CSS3 : Flexbox, Grid, responsive design, animations",
          "Rendre une interface interactive en JavaScript (DOM, événements)",
          "Intégrer des médias : images, vidéos en iframe, polices Google Fonts",
          "Afficher une carte interactive avec Leaflet.js et OpenStreetMap",
          "Générer des pages côté serveur avec des templates Jinja2"
        ],
        outils: ["HTML5", "CSS3", "JavaScript", "Leaflet.js", "Jinja2", "VS Code"],
        projets: ["oscar-os", "quartiers-lyon", "site-voitures", "plateforme-interactive"]
      },
      {
        id: "git",
        nom: "Git & environnement de dev",
        categorie: "dev",
        icone: "git",
        logo: "git",
        couleur: "#f87171",
        resume: "Versionner, documenter et partager mon code proprement.",
        niveau: 2,
        maitrise: [
          "Versionner un projet avec Git (commits, historique)",
          "Publier et documenter mes projets sur GitHub (README)",
          "Travailler au quotidien dans VS Code et Spyder"
        ],
        outils: ["Git", "GitHub", "VS Code", "Spyder"],
        projets: ["bots-discord", "quartiers-lyon", "pendu", "site-voitures"]
      },
      {
        id: "systemes",
        nom: "Administration Linux & Windows",
        categorie: "sys",
        icone: "server",
        couleur: "#c084fc",
        resume: "Installer, configurer et administrer des postes et des serveurs.",
        niveau: 3,
        maitrise: [
          "Installer des systèmes d'exploitation Windows et Linux",
          "Installer et configurer un serveur Ubuntu",
          "Déployer et configurer des postes Windows 10/11 (plus de 15 postes en stage)",
          "Créer des clés USB bootables avec Rufus",
          "Active Directory (notions)"
        ],
        outils: ["Windows 10/11", "Ubuntu", "Rufus", "Active Directory"],
        projets: ["serveur-cloud"],
        contextes: ["Stage d'observation — Mairie de Caluire (juin 2024)"]
      },
      {
        id: "support",
        nom: "Support & maintenance",
        categorie: "sys",
        icone: "wrench",
        couleur: "#fbbf24",
        resume: "Diagnostiquer, réparer et dépanner le matériel comme le logiciel.",
        niveau: 3,
        maitrise: [
          "Analyser et diagnostiquer des problèmes matériels et logiciels",
          "Résoudre des incidents Windows 10/11 (assistance niveau 1-2)",
          "Optimiser les performances logicielles d'un poste",
          "Démonter et réparer des PC et des smartphones",
          "Installer et configurer des postes et leurs périphériques"
        ],
        outils: ["Windows", "Linux", "Rufus"],
        projets: [],
        contextes: [
          "Stage d'observation — Mairie de Caluire (juin 2024)",
          "Stage d'observation — CGI Lyon (janv. – févr. 2023)"
        ]
      },
      {
        id: "reseau",
        nom: "Réseau & annuaire",
        categorie: "sys",
        icone: "network",
        couleur: "#22d3ee",
        resume: "Les bases des réseaux TCP/IP et de la gestion d'un parc.",
        niveau: 1,
        maitrise: [
          "Modèle TCP/IP et adressage IP (notions)",
          "Configuration de périphériques réseau en milieu scolaire",
          "Active Directory (notions)",
          "Architecture client-serveur et requêtes HTTP GET/POST"
        ],
        outils: ["TCP/IP", "Active Directory", "HTTP"],
        projets: ["quartiers-lyon"],
        contextes: ["Stage d'observation — Mairie de Caluire (juin 2024)"]
      },
      {
        id: "bash",
        nom: "Bash & automatisation",
        categorie: "sys",
        icone: "terminal",
        couleur: "#4ade80",
        resume: "Automatiser les tâches répétitives et l'administration de serveurs.",
        niveau: 2,
        maitrise: [
          "Administrer un système Linux en ligne de commande",
          "Écrire des scripts Bash pour automatiser l'administration de serveurs",
          "Automatiser le déploiement et la maintenance de services"
        ],
        outils: ["Bash", "Ubuntu"],
        projets: ["serveur-cloud", "plateforme-echange"]
      },
      {
        id: "docker",
        nom: "Docker & conteneurs",
        categorie: "sys",
        icone: "layers",
        logo: "docker",
        couleur: "#818cf8",
        resume: "Déployer des services isolés et reproductibles grâce aux conteneurs.",
        niveau: 2,
        maitrise: [
          "Conteneuriser un service de stockage cloud",
          "Gérer des conteneurs sur un serveur Linux",
          "Comprendre l'intérêt de l'isolation des services"
        ],
        outils: ["Docker", "Ubuntu"],
        projets: ["serveur-cloud"]
      },
      {
        id: "sql",
        nom: "SQL & bases de données",
        categorie: "data",
        icone: "database",
        couleur: "#2dd4bf",
        resume: "Concevoir, remplir et interroger des bases de données relationnelles.",
        niveau: 3,
        maitrise: [
          "Écrire des scripts de création et de remplissage de tables",
          "Interroger une base avec SELECT (filtres, tris, jointures)",
          "Utiliser SQLite dans une application Python / Flask",
          "Travailler avec SQL Server Management Studio",
          "Initialiser automatiquement une base au premier lancement d'une application"
        ],
        outils: ["SQL", "SQLite", "SQL Server Management Studio"],
        projets: ["quartiers-lyon", "plateforme-interactive", "plateforme-echange"]
      },
      {
        id: "donnees",
        nom: "Bureautique & données",
        categorie: "data",
        icone: "chart",
        couleur: "#a3e635",
        resume: "Traiter, calculer et présenter des données pour aider à la décision.",
        niveau: 2,
        maitrise: [
          "Rédiger et mettre en forme des documents (Word) et des présentations (PowerPoint)",
          "Organiser et calculer des données dans Excel",
          "Visualiser des données avec Power BI",
          "Concevoir un système de notation par moyenne pondérée",
          "Croiser des données réelles : prix au m², transports, espaces verts"
        ],
        outils: ["Word", "PowerPoint", "Excel", "Power BI"],
        projets: ["quartiers-lyon", "bots-discord"]
      },
      {
        id: "ia",
        nom: "Intelligence artificielle",
        categorie: "data",
        icone: "sparkles",
        couleur: "#f472b6",
        resume: "Utilisation avancée des IA génératives, Claude Code et agents IA… et veille sur leur impact.",
        niveau: 4,
        maitrise: [
          "Rédiger des consignes (prompts) précises pour obtenir un résultat exploitable",
          "Développer avec Claude Code (en cours d'apprentissage)",
          "Créer des agents IA (en cours d'apprentissage)",
          "Utiliser l'IA comme assistant de code, de recherche et de synthèse",
          "Générer des images et des vidéos (Sora, NanoBanana)",
          "Synthétiser des sources documentaires avec NotebookLM",
          "Analyser l'impact de l'IA sur le marché du logiciel (voir ma veille)"
        ],
        outils: ["Claude", "Claude Code", "ChatGPT", "Gemini", "Sora", "NotebookLM", "NanoBanana"],
        projets: ["oscar-os"],
        veille: true
      },
      {
        id: "3d",
        nom: "Modélisation 3D",
        categorie: "data",
        icone: "cube",
        logo: "blender",            // seul logiciel de 3D que je maîtrise
        couleur: "#f0abfc",
        resume: "Création numérique et modélisation 3D.",
        niveau: 2,
        maitrise: [
          "Modéliser des objets en 3D dans Blender",
          "Associer programmation et création numérique"
        ],
        outils: ["Blender"],
        projets: [],
        contextes: ["TUMO — initiation programmation & modélisation 3D (oct. 2023 – juil. 2025)"]
      }
    ]
  },

  /* -------------------------------------------------------------------
     5. RÉALISATIONS (application « Réalisations », un éditeur de texte maison)
     -------------------------------------------------------------------
     Chaque projet = un « document » :
       id, fichier (nom affiché), titre, type ("scolaire" ou "perso"),
       contexte (étiquette), emplacement (chemin affiché sous le nom),
       couleur (bandeau de la miniature), technos, lien (GitHub ou null),
       resume, sections.
     Une section = { titre, blocs } ; types de blocs disponibles :
       { type: "p",       texte: "…" }                         paragraphe
       { type: "liste",   items: ["…", "…"] }                  liste à puces
       { type: "tableau", entetes: [...], lignes: [[...]] }    tableau
       { type: "code",    lignes: ["…"] }                      commandes
       { type: "note",    texte: "…" }                         encadré
     ------------------------------------------------------------------- */
  realisations: [
    {
      id: "bots-discord",
      fichier: "Bots_Discord_Amazon_Vinted.md",
      titre: "Bots Discord : suivi de prix Amazon & veille Vinted",
      type: "perso",
      contexte: "Projet personnel",
      emplacement: "GitHub › oscar-bit08 › Bots",
      couleur: "#5865f2",
      technos: ["Python", "discord.py", "Playwright", "BeautifulSoup4", "asyncio"],
      lien: "https://github.com/oscar-bit08/Bots",
      resume: "Deux bots Discord autonomes : l'un suit le prix d'un produit Amazon dans plusieurs pays européens, l'autre surveille en continu les nouvelles annonces Vinted selon des critères personnalisés et envoie une notification instantanée.",
      sections: [
        { titre: "Contexte & objectif", blocs: [
          { type: "p", texte: "Surveiller un prix ou guetter une bonne affaire oblige à rafraîchir des pages en permanence. L'idée : confier ce travail à des bots qui tournent en continu et publient automatiquement les informations utiles dans un salon Discord." }
        ]},
        { titre: "Bot Amazon — suivi de prix multi-pays", blocs: [
          { type: "liste", items: [
            "Récupération (scraping) du prix en temps réel sur Amazon France, Espagne et Allemagne.",
            "Envoi d'un message enrichi (embed) Discord qui compare les prix par pays, avec drapeaux.",
            "Rafraîchissement automatique toutes les 2 minutes."
          ]}
        ]},
        { titre: "Bot Vinted — veille d'annonces", blocs: [
          { type: "liste", items: [
            "Surveillance de plusieurs recherches en parallèle (marque, prix maximum…).",
            "Calcul du coût réel : prix de l'article + protection acheteur (0,70 € + 5 %) + frais de port (2,88 €).",
            "Extraction de la taille et de l'état de chaque article.",
            "Mémoire anti-doublon persistante (fichier deja_vus.txt créé automatiquement) : une annonce n'est jamais notifiée deux fois.",
            "Un message Discord par article : photo, prix, taille, état et lien direct.",
            "Installation automatique des dépendances au premier lancement."
          ]}
        ]},
        { titre: "Architecture technique", blocs: [
          { type: "tableau", entetes: ["Brique", "Rôle"], lignes: [
            ["Python", "Logique principale des deux bots"],
            ["discord.py", "Connexion à Discord et envoi des messages enrichis (embeds)"],
            ["Playwright", "Navigateur Chromium sans interface (headless) pour charger les pages générées en JavaScript"],
            ["BeautifulSoup4", "Analyse du HTML pour extraire prix, tailles et états"],
            ["asyncio", "Exécution asynchrone : surveiller plusieurs sources sans bloquer le bot"]
          ]},
          { type: "p", texte: "La configuration est regroupée en tête de script : jeton du bot et identifiant du salon, dictionnaire des URLs par pays pour Amazon, liste CONFIG_VINTED pour Vinted (nom de la recherche, URL, salon cible, couleur du message)." }
        ]},
        { titre: "Installation & lancement", blocs: [
          { type: "code", lignes: [
            "pip install discord.py playwright beautifulsoup4",
            "playwright install chromium",
            "python bot_amazon.py",
            "python bot_vinted.py"
          ]},
          { type: "note", texte: "Les bots sont conçus pour tourner en continu, par exemple sur un VPS ou un Raspberry Pi. Bonne pratique de sécurité : le jeton Discord ne doit jamais être publié." }
        ]},
        { titre: "Compétences mobilisées", blocs: [
          { type: "liste", items: [
            "Web scraping de pages dynamiques",
            "Programmation asynchrone",
            "Automatisation et gestion de fichiers",
            "Utilisation d'une API tierce (Discord)"
          ]}
        ]}
      ]
    },
    {
      id: "quartiers-lyon",
      fichier: "Recommandateur_Quartiers_Lyon.md",
      titre: "Recommandateur de quartiers lyonnais",
      type: "scolaire",
      contexte: "Projet scolaire · NSI",
      emplacement: "GitHub › oscar-bit08 › Projet-zone-d-aménagement",
      couleur: "#10b981",
      technos: ["Python", "Flask", "SQLite", "Jinja2", "Leaflet.js", "HTML/CSS", "JavaScript"],
      lien: "https://github.com/oscar-bit08/Projet-zone-d-m-nagement",
      resume: "Une application web qui recommande les quartiers de la métropole lyonnaise les plus adaptés à chaque profil, en croisant des données réelles avec les priorités de l'utilisateur.",
      sections: [
        { titre: "Contexte & objectif", blocs: [
          { type: "p", texte: "Projet réalisé en spécialité NSI. Où habiter à Lyon quand on a un budget serré, des enfants ou des convictions écologiques ? L'application croise des données réelles — prix au m², infrastructures, transports — avec les priorités de l'utilisateur pour lui proposer un classement personnalisé des quartiers." }
        ]},
        { titre: "Fonctionnalités", blocs: [
          { type: "liste", items: [
            "Note sur 100 pour chaque zone, calculée par moyenne pondérée.",
            "Carte interactive Leaflet.js : marqueurs verts, orange ou rouges selon la compatibilité.",
            "Curseurs pour régler l'importance de chaque critère.",
            "Base de 35 zones couvrant Lyon, Villeurbanne et Bron."
          ]}
        ]},
        { titre: "Architecture orientée objet", blocs: [
          { type: "tableau", entetes: ["Classe", "Responsabilité"], lignes: [
            ["Zone", "Données d'un quartier : coordonnées GPS, prix au m², scores transport, espaces verts et commerces"],
            ["Preference", "Choix de l'utilisateur et calcul des poids normalisés"],
            ["CalculateurScore", "Moteur de calcul : moyenne pondérée qui produit la note finale"]
          ]},
          { type: "p", texte: "La base SQLite est créée et remplie automatiquement au premier lancement de l'application." }
        ]},
        { titre: "Organisation des fichiers", blocs: [
          { type: "tableau", entetes: ["Fichier", "Rôle"], lignes: [
            ["app.py", "Serveur Flask, classes et logique de recommandation"],
            ["database.sql", "Script de création et de remplissage de la base"],
            ["lyon.db", "Base de données SQLite générée"],
            ["index.html", "Formulaire de saisie des préférences"],
            ["resultats.html", "Carte et classement des quartiers"],
            ["style.css", "Mise en forme globale"]
          ]}
        ]},
        { titre: "Installation & lancement", blocs: [
          { type: "code", lignes: ["pip install flask", "python app.py", "# puis ouvrir http://localhost:5000"] }
        ]},
        { titre: "Compétences mobilisées", blocs: [
          { type: "liste", items: [
            "Bases de données relationnelles (SQL, SQLite)",
            "Programmation orientée objet",
            "Architecture client-serveur et requêtes HTTP GET/POST",
            "Algorithme de pondération",
            "Cartographie web (Leaflet.js + OpenStreetMap)"
          ]}
        ]}
      ]
    },
    {
      id: "pendu",
      fichier: "Jeu_du_Pendu_Arcade.md",
      titre: "Jeu du Pendu — édition Arcade",
      type: "scolaire",
      contexte: "Projet scolaire · NSI",
      emplacement: "GitHub › oscar-bit08 › Projet-pendu",
      couleur: "#f43f5e",
      technos: ["Python", "Tkinter", "Pillow"],
      lien: "https://github.com/oscar-bit08/Projet-pendu",
      resume: "Un jeu du pendu en Python avec une interface graphique Tkinter au style arcade / pixel art, plusieurs modes de difficulté et des thèmes de mots.",
      sections: [
        { titre: "Contexte & objectif", blocs: [
          { type: "p", texte: "Projet réalisé en spécialité NSI : revisiter un grand classique en soignant à la fois la logique du jeu et l'expérience visuelle, avec une esthétique « Arcade » inspirée du pixel art." }
        ]},
        { titre: "Modes de jeu", blocs: [
          { type: "tableau", entetes: ["Mode", "Règle"], lignes: [
            ["Normal", "Mots classiques, 7 vies"],
            ["One Shot", "Une seule erreur autorisée"],
            ["Thématiques", "Capitales, Célébrités, Mots longs (« Rallonge »)"]
          ]}
        ]},
        { titre: "Fonctionnalités", blocs: [
          { type: "liste", items: [
            "Zone de dessin (Canvas) qui fait apparaître le pendu au fil des erreurs.",
            "Retour visuel soigné : police « Press Start 2P » et codes couleurs.",
            "Bouton de réinitialisation pour rejouer ou changer de mode sans relancer le programme.",
            "Listes de mots chargées depuis des fichiers .txt externes.",
            "Mot masqué mis à jour en temps réel, protection contre les saisies multiples ou invalides."
          ]}
        ]},
        { titre: "Structure du projet", blocs: [
          { type: "tableau", entetes: ["Fichier", "Rôle"], lignes: [
            ["pendu_final.py", "Script principal"],
            ["fond_pendu.png", "Fond en pixel art"],
            ["mots.txt · capitales.txt · celebrites.txt", "Listes de mots par thème"]
          ]}
        ]},
        { titre: "Compétences mobilisées", blocs: [
          { type: "liste", items: [
            "Interfaces graphiques (Tkinter, Pillow)",
            "Gestion des états d'un jeu",
            "Lecture de fichiers (entrées / sorties)",
            "Contrôle des saisies utilisateur"
          ]}
        ]}
      ]
    },
    {
      id: "site-voitures",
      fichier: "Site_Voitures_de_Sport.md",
      titre: "Site vitrine : voitures de sport",
      type: "scolaire",
      contexte: "Projet scolaire · NSI",
      emplacement: "GitHub › oscar-bit08 › Projet-site-voitures",
      couleur: "#ef4444",
      technos: ["HTML5", "CSS3", "Flexbox", "Google Fonts"],
      lien: "https://github.com/oscar-bit08/Projet-site-voitures",
      resume: "Un site statique de plusieurs pages consacré aux youngtimers et aux supercars, pour mettre en pratique les fondamentaux du HTML et du CSS.",
      sections: [
        { titre: "Contexte & objectif", blocs: [
          { type: "p", texte: "Projet réalisé en NSI : appliquer les bases du développement web statique (HTML/CSS) sur un thème qui me passionne, l'automobile." }
        ]},
        { titre: "Pages du site", blocs: [
          { type: "tableau", entetes: ["Page", "Contenu"], lignes: [
            ["Home", "Page d'accueil qui mène aux fiches détaillées"],
            ["BMW M3 E30", "Homologation DTM et histoire du modèle"],
            ["Lamborghini Gallardo", "Le V10 et l'ère moderne de la marque"],
            ["Renault Clio V6", "Ingénierie française et moteur central arrière"]
          ]}
        ]},
        { titre: "Design & expérience utilisateur", blocs: [
          { type: "liste", items: [
            "Barre de navigation fixe pour passer d'une fiche à l'autre.",
            "Mise en page en Flexbox pour les aperçus et les descriptions des véhicules.",
            "Vidéos intégrées (iframes) pour écouter le son des moteurs.",
            "Police Google Fonts « Racing Sans One » pour l'identité visuelle."
          ]}
        ]},
        { titre: "Compétences mobilisées", blocs: [
          { type: "liste", items: [
            "HTML5 et navigation entre plusieurs pages",
            "CSS3 et Flexbox",
            "Intégration multimédia",
            "Versionnement avec Git, développement dans VS Code"
          ]}
        ]}
      ]
    },
    {
      id: "serveur-cloud",
      fichier: "Serveur_Stockage_Cloud.md",
      titre: "Serveur de stockage cloud",
      type: "perso",
      contexte: "Projet personnel",
      emplacement: "Projets › Systèmes",
      couleur: "#0ea5e9",
      technos: ["Ubuntu", "Docker", "Bash"],
      lien: null,
      // À COMPLÉTER : logiciel de stockage utilisé, matériel, difficultés rencontrées…
      resume: "Déploiement d'un service de stockage cloud sur un serveur Linux, conteneurisé avec Docker et administré à l'aide de scripts Bash.",
      sections: [
        { titre: "Objectif", blocs: [
          { type: "p", texte: "Mettre en place un service de stockage cloud sur un serveur que j'administre moi-même, pour apprendre la gestion d'un serveur Linux de l'installation à l'automatisation." }
        ]},
        { titre: "Étapes de réalisation", blocs: [
          { type: "liste", items: [
            "Installation et configuration d'un serveur Ubuntu.",
            "Conteneurisation du service de stockage avec Docker.",
            "Administration du serveur et automatisation des tâches avec des scripts Bash."
          ]}
        ]},
        { titre: "Compétences mobilisées", blocs: [
          { type: "liste", items: ["Administration système Linux", "Conteneurisation (Docker)", "Scripts Bash"] }
        ]}
      ]
    },
    {
      id: "plateforme-echange",
      fichier: "Plateforme_Echange_Temps_Reel.md",
      titre: "Plateforme d'échange en temps réel",
      type: "perso",
      contexte: "Projet",
      emplacement: "Projets › Développement",
      couleur: "#f59e0b",
      technos: ["Python", "Base de données", "Bash"],
      lien: null,
      // À COMPLÉTER : fonctionnement, captures, technologies précises…
      resume: "Une application d'échange en temps réel développée en Python, avec gestion de base de données et interface utilisateur dynamique.",
      sections: [
        { titre: "Présentation", blocs: [
          { type: "p", texte: "Application développée en Python permettant des échanges en temps réel, reliée à une base de données et dotée d'une interface utilisateur dynamique." }
        ]},
        { titre: "Points techniques", blocs: [
          { type: "liste", items: [
            "Gestion de la base de données de l'application.",
            "Interface utilisateur dynamique.",
            "Automatisation des serveurs grâce à des scripts Bash."
          ]}
        ]},
        { titre: "Compétences mobilisées", blocs: [
          { type: "liste", items: ["Python", "Bases de données", "Scripts Bash"] }
        ]}
      ]
    },
    {
      id: "plateforme-interactive",
      fichier: "Plateforme_Interactive.md",
      titre: "Plateforme web interactive",
      type: "perso",
      contexte: "Projet",
      emplacement: "Projets › Web",
      couleur: "#e879f9",
      technos: ["HTML", "CSS", "JavaScript", "SQL"],
      lien: null,
      // À COMPLÉTER : sujet de la plateforme, fonctionnalités, captures…
      resume: "Une plateforme web interactive reliée à une base de données SQL, avec un travail particulier sur l'interface utilisateur.",
      sections: [
        { titre: "Présentation", blocs: [
          { type: "p", texte: "Plateforme web développée avec HTML, CSS et JavaScript, reliée à une base de données SQL, avec un soin particulier apporté à l'interface utilisateur." }
        ]},
        { titre: "Compétences mobilisées", blocs: [
          { type: "liste", items: ["Intégration HTML / CSS", "Interactivité en JavaScript", "Requêtes SQL"] }
        ]}
      ]
    },
    {
      id: "graphes",
      fichier: "Algorithmes_sur_Graphes.md",
      titre: "Algorithmes sur les graphes",
      type: "scolaire",
      contexte: "Projet scolaire · NSI",
      emplacement: "Projets › NSI",
      couleur: "#8b5cf6",
      technos: ["Python"],
      lien: null,
      resume: "Implémentations pédagogiques d'algorithmes sur les graphes en Python : représentations, parcours de labyrinthe et analyse de réseaux sociaux.",
      sections: [
        { titre: "Contexte", blocs: [
          { type: "p", texte: "Travaux réalisés en spécialité NSI pour comprendre comment représenter et parcourir un graphe, une structure de données au cœur des réseaux informatiques, des GPS ou des réseaux sociaux." }
        ]},
        { titre: "Représentations d'un graphe", blocs: [
          { type: "liste", items: ["Liste d'adjacence.", "Matrice d'adjacence.", "Chargement d'un graphe depuis un fichier CSV."] }
        ]},
        { titre: "Algorithmes implémentés", blocs: [
          { type: "tableau", entetes: ["Algorithme", "Application"], lignes: [
            ["Méthode de la main gauche", "Sortir d'un labyrinthe"],
            ["Parcours en profondeur (DFS)", "Explorer un labyrinthe ou un graphe"],
            ["Analyse de réseau", "Étudier les liens d'un réseau social"]
          ]}
        ]},
        { titre: "Compétences mobilisées", blocs: [
          { type: "liste", items: ["Structures de données", "Algorithmes de parcours", "Lecture de fichiers CSV"] }
        ]}
      ]
    },
    {
      id: "oscar-os",
      fichier: "OscarOS_Portfolio.md",
      titre: "OscarOS — ce portfolio",
      type: "perso",
      contexte: "Projet personnel",
      emplacement: "GitHub › oscar-bit08 › portfolio",
      couleur: "#38bdf8",
      technos: ["HTML", "CSS", "JavaScript"],
      lien: "https://github.com/oscar-bit08/portfolio",
      resume: "Le portfolio que vous êtes en train de parcourir : un mini système d'exploitation développé en HTML, CSS et JavaScript, sans framework.",
      sections: [
        { titre: "Le concept", blocs: [
          { type: "p", texte: "Plutôt qu'une page classique, un portfolio qui se visite comme un ordinateur : une installation façon Windows pour faire connaissance, puis un bureau avec des applications à ouvrir, déplacer et réduire." }
        ]},
        { titre: "Fonctionnalités", blocs: [
          { type: "liste", items: [
            "Assistant d'accueil en 5 étapes inspiré de la première installation de Windows.",
            "Gestionnaire de fenêtres : ouverture, déplacement, redimensionnement, réduction dans le dock et plein écran.",
            "Icônes placées aléatoirement à chaque visite, déplaçables à la souris comme au doigt.",
            "Des applications à part entière : panneau de paramètres (compétences), éditeur de documents (réalisations), carnet de contacts.",
            "Mise en veille simulée : extinction de l'écran puis terminal qui écrit ma veille technologique.",
            "Thème « verre liquide » : transparences, flous et reflets inspirés des derniers iPhone."
          ]}
        ]},
        { titre: "Choix techniques", blocs: [
          { type: "tableau", entetes: ["Choix", "Pourquoi"], lignes: [
            ["HTML / CSS / JavaScript sans framework", "Aucune dépendance : le site s'ouvre directement dans un navigateur"],
            ["Contenu séparé dans data.js", "Mettre à jour le portfolio sans toucher au code"],
            ["Un fichier par application", "Code organisé, commenté et facile à faire évoluer"],
            ["Pointer Events", "Glisser-déposer compatible souris et écrans tactiles"]
          ]}
        ]},
        { titre: "Compétences mobilisées", blocs: [
          { type: "liste", items: [
            "Manipulation du DOM et gestion des événements",
            "Animations CSS et Web Animations API",
            "Architecture d'une application front-end",
            "Accessibilité et responsive design"
          ]}
        ]}
      ]
    }
  ],

  /* -------------------------------------------------------------------
     6. CONTACTS (application « Contact »)
     -------------------------------------------------------------------
     url    → lien ouvert au clic (nouvel onglet)
     copier → texte copié par le bouton « copier » (facultatif)
     ------------------------------------------------------------------- */
  contacts: [
    {
      id: "gmail",
      nom: "Gmail",
      valeur: "oscarbonant@gmail.com",
      action: "Écrire un e-mail",
      // Ouvre directement la fenêtre « Nouveau message » de Gmail
      url: "https://mail.google.com/mail/?view=cm&fs=1&to=oscarbonant@gmail.com&su=Prise%20de%20contact%20-%20Portfolio",
      icone: "gmail",
      couleur: "#ea4335",
      copier: "oscarbonant@gmail.com"
    },
    {
      id: "linkedin",
      nom: "LinkedIn",
      valeur: "in/oscar-bonant-620522374",
      action: "Voir mon profil",
      url: "https://www.linkedin.com/in/oscar-bonant-620522374",
      icone: "linkedin",
      couleur: "#0a66c2"
    },
    {
      id: "github",
      nom: "GitHub",
      valeur: "github.com/oscar-bit08",
      action: "Voir mes dépôts",
      url: "https://github.com/oscar-bit08",
      icone: "github",
      couleur: "#24292f"
    },
    // Téléphone volontairement retiré de la version en ligne (site public).
    // Pour le remettre, ajouter un bloc { id: "telephone", nom, valeur,
    // action: "Appeler", url: "tel:+33…", icone: "phone", couleur, copier }.
    // L'ancienne « Page projets » (oscar-bit08.github.io/Projects) est retirée :
    // ce portfolio rassemble désormais les projets (appli Réalisations).
  ],

  /* -------------------------------------------------------------------
     7. VEILLE TECHNOLOGIQUE (terminal)
     -------------------------------------------------------------------
     vitesse  → nombre de caractères écrits par seconde
     erreur   → message « échec de la mise en veille » avant le terminal
     lectureErreur → secondes laissées pour lire ce message
     logs     → lignes de « démarrage » affichées très vite
     commande → commande tapée avant l'affichage de l'article
     sections → sommaire affiché à droite (une couche de l'illustration
                isométrique par section)
     blocs    → l'article, dans l'ordre. Types :
                kicker, h1, sub, p, h2 (avec n° de section), quote,
                chart, table
     ------------------------------------------------------------------- */
  veille: {
    fichier: "logiciel_jetable.md",
    vitesse: 170,
    // Message affiché sur écran noir entre l'extinction et le terminal.
    // type : "titre" (gris foncé), "info" (gris), "erreur" (rouge, affichée
    // d'un coup), "detail" (gris, d'un coup), "action" (blanc),
    // "ok" (blanc + OK orange), "note" (encadré final, la phrase à lire)
    erreur: [
      { type: "titre",  texte: "oscar-os · gestionnaire d'alimentation" },
      { type: "info",   texte: "> Mise en veille de la session graphique…" },
      { type: "erreur", texte: "[ ERREUR ] Échec de la mise en veille (code 0x56 : VEILLE_DETOURNEE)" },
      { type: "detail", texte: "           La demande de mise en veille a été interceptée par le système." },
      { type: "action", texte: "> Déviation vers le dossier « veille informatique »…" },
      { type: "ok",     texte: "> Montage de ~/veille-informatique ..................... OK" },
      { type: "action", texte: "> Ouverture du terminal de lecture…" },
      { type: "note",   texte: "Ceci est une présentation à propos d'un sujet qui m'a marqué lors de ma veille informatique." }
    ],
    // Temps laissé pour lire l'encadré avant l'ouverture automatique (en secondes)
    lectureErreur: 6,
    logs: [
      "OSCAR-OS BIOS v2.6 — reprise en mode texte",
      "[ OK ] Session graphique sauvegardée",
      "[ OK ] Passage en mode terminal (TTY1)",
      "[ OK ] Dossier ~/veille-informatique ouvert",
      "[ OK ] Chargement du module analyse_technologique",
      "[ .. ] Lecture de la présentation…"
    ],
    commande: "cat ~/veille-informatique/logiciel_jetable.md",
    logsRedemarrage: [
      "[ OK ] Fermeture du dossier de veille",
      "[ OK ] Arrêt du terminal TTY1",
      "[ .. ] Redémarrage de l'interface graphique…"
    ],
    sections: [
      { code: "01", titre: "Banalisation du code",  texte: "Le code devient une commodité.",                 etiquette: "CODE::COMMODITE", binaire: "0101", icone: "code" },
      { code: "02", titre: "Cloner ou payer ?",     texte: "Outil fonctionnel vs plateforme industrielle.",  etiquette: "CLONE::HAPPYPATH", binaire: "1010", icone: "copy" },
      { code: "03", titre: "Le nouvel équilibre",   texte: "La fin du logiciel « taille unique ».",          etiquette: "ECOSYS::VALEUR",   binaire: "0011", icone: "chart" }
    ],
    blocs: [
      { type: "kicker", texte: "Analyse technologique • Édition spéciale" },
      { type: "h1", texte: "L'Ère du Logiciel Jetable : Quand l'IA Rend les Monopoles Obsolètes" },
      { type: "sub", texte: "Comment Claude et les LLMs redéfinissent la valeur du SaaS" },
      { type: "p", texte: "Faites défiler votre fil Twitter (X) n'importe quel jour de la semaine, et vous assisterez à un spectacle impensable il y a encore un an. Un développeur indépendant publie une vidéo d'une minute : « Je viens de recréer 80% des fonctionnalités d'Adobe Illustrator avec Claude 3.5 Sonnet. Ça m'a pris 45 minutes et 3 prompts. » Un autre partage un clone fonctionnel de Microsoft Excel, écrit intégralement en React via une interface de discussion, exécutable directement dans le navigateur." },
      { type: "p", texte: "Ce ne sont plus des maquettes ou des concepts abstraits. Grâce à des outils comme les \"Artifacts\" de Claude, v0 de Vercel, ou l'éditeur Cursor, le code est généré, exécuté et corrigé en temps réel. Des applications qui nécessitaient autrefois des équipes d'ingénieurs, des millions de dollars de R&D et des années de développement sont désormais \"générées\" à la volée par de simples requêtes en langage naturel." },

      { type: "h2", section: 0, texte: "La Banalisation du Code Logiciel" },
      { type: "p", texte: "Pour comprendre ce bouleversement, il faut saisir ce qu'est véritablement un logiciel. Pendant des décennies, le code était une ressource rare et coûteuse. Les suites Adobe (Creative Cloud) ou Microsoft (Office 365) justifiaient leurs abonnements mensuels récurrents (SaaS) par la complexité de leur ingénierie. Vous payiez pour l'accès à une prouesse technique." },
      { type: "quote", texte: "« Si la valeur d'une application réside dans ses lignes de code, et que l'IA rend la génération de ce code gratuite et instantanée, le modèle de l'abonnement mensuel devient une taxe sur l'ignorance. »", auteur: "— Tendance de fond chez les \"Indie Hackers\"" },
      { type: "p", texte: "Aujourd'hui, l'IA a transformé le code en une commodité, au même titre que l'électricité ou la bande passante. Si vous avez besoin d'un outil spécifique pour détourer des images, fusionner des tableaux de données, ou créer un graphique vectoriel, vous n'avez plus nécessairement besoin de souscrire à un abonnement de 60 € par mois. Vous pouvez demander à Claude de vous créer \"une mini-application web qui fait X\", et l'utiliser instantanément." },

      { type: "h2", section: 1, texte: "Pourquoi payer quand on peut cloner ?" },
      { type: "p", texte: "Cette réalité soulève votre question légitime : pourquoi continuer à payer ces suites logicielles ? La réponse réside dans la différence entre un \"outil fonctionnel\" et une \"plateforme industrielle\"." },
      { type: "p", texte: "Lorsque vous recréez un éditeur photo avec Claude, vous obtenez le \"chemin heureux\" (happy path). L'application fonctionne parfaitement pour votre besoin immédiat. Ce que vous ne codez pas en 10 minutes, ce sont les dizaines d'années de cas particuliers, la gestion de l'accélération matérielle (GPU), la synchronisation cloud sécurisée, le travail collaboratif en temps réel, et la garantie que le logiciel ne plantera pas sur un fichier de 5 Go." },
      {
        type: "chart",
        lignes: [
          { label: "Logiciel traditionnel", etapes: [
            { texte: "Idéation", poids: 16 },
            { texte: "Développement (mois / années)", poids: 64 },
            { texte: "Lancement", poids: 20 }
          ]},
          { label: "Clone IA (Claude)", etapes: [
            { texte: "Prompt", poids: 9 },
            { texte: "Lancement (minutes)", poids: 17 }
          ]}
        ],
        legende: "Comparatif du temps de mise sur le marché : éditeur classique vs. micro-application générée par IA"
      },

      { type: "h2", section: 2, texte: "Le Nouvel Équilibre" },
      {
        type: "table",
        entetes: ["Critère", "Suites monopolistiques (Adobe / MS)", "Micro-outils générés par l'IA"],
        lignes: [
          ["Coût", "Abonnement récurrent (~600 €/an)", "Coût de l'API IA (~0 € à 20 €/mois)"],
          ["Adaptabilité", "Rigide (features imposées)", "Sur-mesure exact au besoin"],
          ["Écosystème & Fiabilité", "Excellente (Cloud, plugins, pro)", "Isolée, parfois instable aux cas limites"]
        ]
      },
      { type: "p", texte: "La question n'est donc pas de savoir si Claude va mettre Adobe en faillite demain. La vraie révolution est la fin du logiciel \"taille unique\". Si vous êtes un professionnel dont le métier repose sur la stabilité et la collaboration, l'abonnement reste justifié. Mais si vous payiez historiquement ces suites juste pour accéder à 10% de leurs fonctionnalités, ce modèle est mort." },
      { type: "p", texte: "Vous ne paierez plus pour l'outil lui-même, mais pour l'écosystème, l'hébergement et la garantie technique. Pour tout le reste, le logiciel jetable codé par l'IA sera la nouvelle norme." }
    ],
    signature: "Analyse IA & Économie Logicielle — veille d'Oscar Bonant"
  }
};

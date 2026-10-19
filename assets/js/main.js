/* =====================================================================
   main.js — LE CHEF D'ORCHESTRE
   =====================================================================
   Tous les modules sont chargés : on lance la séquence de démarrage.
   À CHAQUE chargement de la page, le visiteur repasse par :
     1. l'écran de démarrage (logo + barre de chargement)
     2. la présentation « À propos » en 5 étapes (façon installation Windows)
     3. la transition « Préparation de votre bureau… »
     4. le bureau, avec des icônes placées aléatoirement
   ===================================================================== */

(function () {
  "use strict";
  const OS = window.OS;

  async function demarrer() {
    await OS.boot.run();                         // 1
    const { passe } = await OS.oobe.lancer();    // 2 (attend la fin des slides)
    await OS.hello({ court: passe });            // 3 (plus court si l'intro a été passée)
    await OS.desktop.show({ premiereFois: true });  // 4
  }

  // On attend les polices pour éviter un « saut » visuel des textes
  // (avec un délai maximum au cas où le réseau serait lent).
  const policesPretes = document.fonts ? Promise.race([document.fonts.ready, OS.sleep(1500)]) : Promise.resolve();
  policesPretes.then(demarrer);
})();

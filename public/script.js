document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ SCRIPT DE TEST CHARGÉ ✨');

  // On cible les deux boutons
  const btnDesktop = document.getElementById('btn-desktop');
  const btnMobile = document.getElementById('btn-mobile');
  const allBtns = [btnDesktop, btnMobile];

  // On cible le strict minimum pour l'affichage de la vidéo
  const player = document.getElementById('player');
  const welcomeMessage = document.getElementById('welcomeMessage');

  // On attache un écouteur de clic très simple
  allBtns.forEach(btn => {
    if (!btn) return;

    btn.addEventListener('click', async () => {
      console.log(`🔘 Bouton de test cliqué (${btn.id})`);
      
      try {
        // On met le spinner
        allBtns.forEach(b => { if (b) b.disabled = true; b.innerHTML = `<div class="spinner"></div>`; });

        // On appelle le serveur (catégorie 'all' par défaut)
        const resp = await fetch(`/random-video?category=all`);
        if (!resp.ok) throw new Error(`Erreur serveur ${resp.status}`);
        
        const { id, title } = await resp.json();
        
        // On affiche juste la vidéo
        if (welcomeMessage) welcomeMessage.style.display = 'none';
        player.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        
        console.log(`Vidéo ${title} chargée.`);

      } catch (e) {
        console.error('🔥 Erreur pendant le test :', e);
        alert('Erreur: Impossible de charger une vidéo.');
      } finally {
        // On restaure les boutons
        if (btnDesktop) {
          btnDesktop.disabled = false;
          btnDesktop.innerHTML = `<span>NOUVELLE VIDÉO</span>`;
        }
        if (btnMobile) {
          btnMobile.disabled = false;
          btnMobile.innerHTML = `<span>▶</span>`;
        }
      }
    });
  });

  console.log('Écouteurs de test attachés aux boutons.');
});
// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js chargé');

  // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
  const btn = document.getElementById('btn');
  const player = document.getElementById('player');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const videoInfoBox = document.getElementById('videoInfo');
  const videoTitleElem = document.getElementById('videoTitle');
  const historyContainer = document.getElementById('historyContainer');
  const historyPlaceholder = document.getElementById('historyPlaceholder');
  const categoryLinks = document.querySelectorAll('.category-link');
  
  // --- GESTION DE LA CATÉGORIE ---
  let currentCategory = 'all'; // Catégorie par défaut
  
  categoryLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); // Empêche le lien de recharger la page
      
      // Met à jour la catégorie actuelle
      currentCategory = link.dataset.category;
      console.log(`Catégorie changée pour : ${currentCategory}`);

      // Met à jour le style visuel
      categoryLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
  // Met "ALL" en actif par défaut au chargement
  document.querySelector('.category-link[data-category="all"]').classList.add('active');


  // --- GESTION DU CLIC SUR "NOUVELLE VIDÉO" ---
  btn.addEventListener('click', async () => {
    console.log(`🔘 Bouton cliqué, j’appelle /random-video pour la catégorie : ${currentCategory}`);
    try {
      // Afficher le spinner dans le bouton
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner"></div>`;

      // Appel à votre serveur en envoyant la catégorie sélectionnée
      const resp = await fetch(`/random-video?category=${currentCategory}`);
      
      console.log('✅ fetch ok, status =', resp.status);
      if (!resp.ok) throw new Error(`Erreur serveur ${resp.status}`);

      const { id, title } = await resp.json();
      console.log('📥 JSON reçu', id, title);

      // Mettre à jour l'ID de la vidéo pour le bouton Partager
      window.currentVideoId = id;

      // Cacher le message de bienvenue
      if (welcomeMessage) welcomeMessage.style.display = 'none';

      // Mettre à jour l'historique
      updateHistory({ id, title });

      // Injecter l'iframe avec la bonne URL YouTube
      player.innerHTML = `
        <iframe
          width="100%" height="100%"
          src="https://www.youtube.com/embed/${id}?autoplay=1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      `;

      // Mettre à jour et afficher la boîte d’info avec le titre
      if (videoTitleElem) {
        videoTitleElem.textContent = title;
        videoInfoBox.classList.remove('hidden');
      }

    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      alert('Erreur: Impossible de charger une vidéo.');
    } finally {
      // Restaurer le bouton (en tenant compte de la traduction)
      btn.disabled = false;
      const currentLang = localStorage.getItem('lang') || 'fr';
      const buttonTextSpan = document.createElement('span');
      buttonTextSpan.dataset.key = 'button';
      btn.innerHTML = ''; // Vide le bouton (enlève le spinner)
      btn.appendChild(buttonTextSpan);
      
      // Simule un clic sur le drapeau actuel pour retraduire le bouton
      document.querySelector(`.lang-flag[data-lang="${currentLang}"]`)?.click();
    }
  });

  /**
   * Met à jour l'historique de la session avec la nouvelle vidéo.
   */
  function updateHistory(video) {
    if (!historyContainer) return;

    if (historyPlaceholder && !historyPlaceholder.classList.contains('hidden')) {
      historyPlaceholder.classList.add('hidden');
    }

    const historyItem = document.createElement('a');
    historyItem.href = `https://www.youtube.com/watch?v=${video.id}`;
    historyItem.target = '_blank';
    historyItem.rel = 'noopener noreferrer';
    historyItem.className = 'history-item';
    
    historyItem.innerHTML = `
      <img src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="Miniature de ${video.title}">
      <span>${video.title}</span>
    `;

    historyContainer.prepend(historyItem);
  }
});
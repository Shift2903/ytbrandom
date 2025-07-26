// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js chargé');

  // Sélection des éléments du DOM
  const btn = document.getElementById('btn');
  const player = document.getElementById('player');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const videoInfoBox = document.getElementById('videoInfo');
  const videoTitleElem = document.getElementById('videoTitle');
  const historyContainer = document.getElementById('historyContainer');
  const historyPlaceholder = document.getElementById('historyPlaceholder');

  btn.addEventListener('click', async () => {
    console.log('🔘 Bouton cliqué, j’appelle /random-video');
    try {
      // Afficher le spinner dans le bouton
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner"></div>`;

      // Appel à votre serveur pour obtenir une vidéo
      const resp = await fetch('/random-video');
      console.log('✅ fetch ok, status =', resp.status);
      if (!resp.ok) throw new Error(`Erreur serveur ${resp.status}`);

      const { id, title } = await resp.json();
      console.log('📥 JSON reçu', id, title);

      // --- CORRECTIONS ET AJOUTS ---

      // 1. Mettre à jour l'ID de la vidéo pour le bouton Partager
      window.currentVideoId = id;

      // 2. Cacher le message de bienvenue si présent
      if (welcomeMessage) welcomeMessage.style.display = 'none';

      // 3. Mettre à jour l'historique
      updateHistory({ id, title });

      // 4. Injecter l'iframe avec la bonne URL YouTube
      player.innerHTML = `
        <iframe
          width="100%" height="100%"
          src="https://www.youtube.com/embed/${id}?autoplay=1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      `;

      // 5. Mettre à jour et afficher la boîte d’info avec le titre
      if (videoTitleElem) {
        videoTitleElem.textContent = title;
        videoInfoBox.classList.remove('hidden');
      }

    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      alert('Erreur: Impossible de charger une vidéo.');
    } finally {
      // Restaurer le bouton
      btn.disabled = false;
      // Note: si vous utilisez la traduction, il faudra aussi retraduire le bouton ici
      btn.innerHTML = `<span data-key="button">NOUVELLE VIDÉO</span>`;
    }
  });

  /**
   * Met à jour l'historique de la session avec la nouvelle vidéo.
   * @param {object} video - L'objet vidéo avec un id et un titre.
   */
  function updateHistory(video) {
    if (!historyContainer) return;

    // Cacher le message placeholder s'il est visible
    if (historyPlaceholder && !historyPlaceholder.classList.contains('hidden')) {
      historyPlaceholder.classList.add('hidden');
    }

    // Création de l'élément d'historique
    const historyItem = document.createElement('a');
    historyItem.href = `https://www.youtube.com/watch?v=${video.id}`;
    historyItem.target = '_blank'; // Ouvre dans un nouvel onglet
    historyItem.rel = 'noopener noreferrer';
    historyItem.className = 'history-item'; // Utilise les styles CSS ajoutés dans index.html
    
    historyItem.innerHTML = `
      <img src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="Miniature de ${video.title}">
      <span>${video.title}</span>
    `;

    // Ajoute le nouvel élément au début de la liste
    historyContainer.prepend(historyItem);
  }
});
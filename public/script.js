// public/script.js (Version Stable)
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js (version stable) chargé');

  const btn = document.getElementById('btn');
  const player = document.getElementById('player');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const videoInfoBox = document.getElementById('videoInfo');
  const videoTitleElem = document.getElementById('videoTitle');
  const historyContainer = document.getElementById('historyContainer');
  const historyPlaceholder = document.getElementById('historyPlaceholder');

  btn.addEventListener('click', async () => {
    console.log('🔘 Bouton cliqué, appel à /random-video');
    try {
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner"></div>`;

      // Appel simple, sans catégorie
      const resp = await fetch('/random-video');
      
      if (!resp.ok) throw new Error(`Erreur serveur ${resp.status}`);

      const { id, title } = await resp.json();

      window.currentVideoId = id;

      if (welcomeMessage) welcomeMessage.style.display = 'none';

      updateHistory({ id, title });

      player.innerHTML = `
        <iframe
          width="100%" height="100%"
          src="https://www.youtube.com/embed/${id}?autoplay=1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      `;

      if (videoTitleElem) {
        videoTitleElem.textContent = title;
        videoInfoBox.classList.remove('hidden');
      }

    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      alert('Erreur: Impossible de charger une vidéo.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span data-key="button">NOUVELLE VIDÉO</span>`;
      // On s'assure que la traduction est ré-appliquée si nécessaire
      const currentLang = localStorage.getItem('lang') || 'fr';
      document.querySelector(`.lang-flag[data-lang="${currentLang}"]`)?.click();
    }
  });

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
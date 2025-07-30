// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js chargé');

  const btn = document.getElementById('btn');
  const player = document.getElementById('player');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const videoInfoBox = document.getElementById('videoInfo');
  const videoTitleElem = document.getElementById('videoTitle');
  const historyContainer = document.getElementById('historyContainer');
  const historyPlaceholder = document.getElementById('historyPlaceholder');
  const categoryLinks = document.querySelectorAll('.category-link');
  
  let currentCategory = 'all'; 

  // Fonction pour gérer le changement de catégorie
  function setCategory(category, fromHistory = false) {
    currentCategory = category;
    console.log(`Catégorie définie sur : ${currentCategory}`);

    // Met à jour le style visuel
    categoryLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.category-link[data-category="${category}"]`).classList.add('active');

    // ✅ AJOUT : Change l'URL dans le navigateur sans recharger la page
    if (!fromHistory) {
      const newUrl = (category === 'music') ? '/music' : '/';
      const newTitle = (category === 'music') ? 'YTB Random - Musique' : 'YTB Random - Tout';
      history.pushState({ category: category }, newTitle, newUrl);
    }
  }

  // Gère les clics sur les liens de catégorie
  categoryLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); 
      const category = link.dataset.category;
      setCategory(category);
    });
  });

  // ✅ AJOUT : Gère l'état initial au chargement de la page
  const initialPath = window.location.pathname;
  if (initialPath === '/music') {
    setCategory('music', true);
  } else {
    setCategory('all', true);
  }

  // ... (le reste de votre script.js reste identique) ...

  btn.addEventListener('click', async () => {
    console.log(`🔘 Bouton cliqué, j’appelle /random-video pour la catégorie : ${currentCategory}`);
    try {
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner"></div>`;
      const resp = await fetch(`/random-video?category=${currentCategory}`);
      if (!resp.ok) throw new Error(`Erreur serveur ${resp.status}`);
      const { id, title } = await resp.json();
      window.currentVideoId = id;
      if (welcomeMessage) welcomeMessage.style.display = 'none';
      updateHistory({ id, title });
      player.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      if (videoTitleElem) {
        videoTitleElem.textContent = title;
        videoInfoBox.classList.remove('hidden');
      }
    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      alert('Erreur: Impossible de charger une vidéo.');
    } finally {
      btn.disabled = false;
      const currentLang = localStorage.getItem('lang') || 'fr';
      const buttonTextSpan = document.createElement('span');
      buttonTextSpan.dataset.key = 'button';
      btn.innerHTML = '';
      btn.appendChild(buttonTextSpan);
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
    historyItem.innerHTML = `<img src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="Miniature de ${video.title}"><span>${video.title}</span>`;
    historyContainer.prepend(historyItem);
  }
});
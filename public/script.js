document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js pour le design minimaliste chargé');

  const btn = document.getElementById('btn');
  const player = document.getElementById('videoContainer');
  const videoInfoBox = document.getElementById('videoInfo');
  const videoTitleElem = document.getElementById('videoTitle');
  const videoDateElem = document.getElementById('videoDate');
  const historyContainer = document.getElementById('historyContainer');
  const historyPlaceholder = document.getElementById('historyPlaceholder');
  const categoryLinks = document.querySelectorAll('.category-link');
  const themeSwitcher = document.getElementById('theme-switcher');
  const docHtml = document.documentElement;

  let currentCategory = 'all';

  themeSwitcher.addEventListener('click', () => {
    docHtml.classList.toggle('dark');
    localStorage.setItem('theme', docHtml.classList.contains('dark') ? 'dark' : 'light');
  });

  if (localStorage.getItem('theme') === 'dark') {
    docHtml.classList.add('dark');
  }

  // ✅ FONCTION POUR METTRE À JOUR LE TEXTE DU BOUTON
  function updateButtonText() {
    const buttonTextSpan = document.querySelector('#btn > span');
    if (!buttonTextSpan) return;
    
    // Choisit la bonne clé de traduction en fonction de la catégorie
    const key = (currentCategory === 'music') ? 'buttonMusic' : 'button';
    buttonTextSpan.dataset.key = key;
    
    // Déclenche la retraduction pour appliquer le texte
    const currentLang = localStorage.getItem('lang') || 'fr';
    // Le '?' est une sécurité si les drapeaux ne sont pas trouvés
    document.querySelector(`.lang-flag[data-lang="${currentLang}"]`)?.click();
  }

  function setCategory(category, fromHistory = false) {
    currentCategory = category;
    categoryLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.category-link[data-category="${category}"]`).classList.add('active');
    
    updateButtonText(); // Appelle la mise à jour du texte du bouton

    if (!fromHistory) {
      const newUrl = (category === 'music') ? '/music' : (category === 'video') ? '/video' : '/';
      history.pushState({ category }, `YTB Random - ${category}`, newUrl);
    }
  }

  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); setCategory(link.dataset.category); });
  });

  const initialPath = window.location.pathname;
  if (initialPath.includes('/music')) setCategory('music', true);
  else if (initialPath.includes('/video')) setCategory('video', true);
  else setCategory('all', true);

  btn.addEventListener('click', async () => {
    try {
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner"></div>`;
      const resp = await fetch(`/random-video?category=${currentCategory}`);
      if (!resp.ok) throw new Error(`Erreur serveur ${resp.status}`);
      
      const { id, title, publishedAt } = await resp.json();
      
      window.currentVideoId = id;
      updateHistory({ id, title });
      player.innerHTML = `<iframe id="player" width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      
      videoTitleElem.textContent = title;
      if (publishedAt) {
        // ... (logique de la date identique)
      }
      videoInfoBox.classList.remove('hidden');

    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      alert('Erreur: Impossible de charger une vidéo.');
    } finally {
      btn.disabled = false;
      // ✅ RESTAURATION DU BOUTON AVEC LE BON TEXTE PAR DÉFAUT
      const defaultText = (currentCategory === 'music') ? 'NOUVELLE MUSIQUE' : 'NOUVELLE VIDÉO';
      const dataKey = (currentCategory === 'music') ? 'buttonMusic' : 'button';
      btn.innerHTML = `<span data-key="${dataKey}">${defaultText}</span>`;
      // On ré-applique la traduction pour être sûr
      updateButtonText();
    }
  });

  function updateHistory(video) {
    if (historyPlaceholder) historyPlaceholder.style.display = 'none';
    const historyItem = document.createElement('a');
    historyItem.href = `https://www.youtube.com/watch?v=${video.id}`;
    historyItem.target = '_blank';
    historyItem.rel = 'noopener noreferrer';
    historyItem.className = 'history-item p-2 rounded-md flex items-center gap-3';
    historyItem.innerHTML = `<img src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt=""><span>${video.title}</span>`;
    historyContainer.prepend(historyItem);
  }
});
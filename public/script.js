document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js pour le nouveau design chargé');

  // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
  const btn = document.getElementById('btn');
  const player = document.getElementById('player');
  const videoInfoBox = document.getElementById('videoInfo');
  const videoTitleElem = document.getElementById('videoTitle');
  const videoDateElem = document.getElementById('videoDate');
  const historyContainer = document.getElementById('historyContainer');
  const historyPlaceholder = document.getElementById('historyPlaceholder');
  const categoryLinks = document.querySelectorAll('.category-link');
  const themeSwitcher = document.getElementById('theme-switcher');
  const docHtml = document.documentElement;

  let currentCategory = 'all';

  // --- LOGIQUE DU SÉLECTEUR DE THÈME ---
  themeSwitcher.addEventListener('click', () => {
    docHtml.classList.toggle('dark');
    if (docHtml.classList.contains('dark')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });

  // Applique le thème sauvegardé au chargement
  if (localStorage.getItem('theme') === 'dark') {
    docHtml.classList.add('dark');
  } else {
    docHtml.classList.remove('dark'); // Assure le thème clair par défaut
  }

  // --- LOGIQUE DE L'APPLICATION ---
  function setCategory(category, fromHistory = false) {
    currentCategory = category;
    console.log(`Catégorie définie sur : ${currentCategory}`);
    categoryLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.category-link[data-category="${category}"]`).classList.add('active');
    if (!fromHistory) {
      const newUrl = (category === 'music') ? '/music' : (category === 'video') ? '/video' : '/';
      history.pushState({ category: category }, `YTB Random - ${category}`, newUrl);
    }
  }

  categoryLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); 
      setCategory(link.dataset.category);
    });
  });

  const initialPath = window.location.pathname;
  if (initialPath.includes('/music')) {
    setCategory('music', true);
  } else if (initialPath.includes('/video')) {
    setCategory('video', true);
  } else {
    setCategory('all', true);
  }

  btn.addEventListener('click', async () => {
    console.log(`🔘 Bouton cliqué, catégorie : ${currentCategory}`);
    try {
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner"></div>`;
      const resp = await fetch(`/random-video?category=${currentCategory}`);
      if (!resp.ok) throw new Error(`Erreur serveur ${resp.status}`);
      
      const { id, title, publishedAt } = await resp.json();
      
      window.currentVideoId = id;
      updateHistory({ id, title });
      player.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      
      if (videoTitleElem) {
        videoTitleElem.textContent = title;
        if (videoDateElem && publishedAt) {
          const videoDate = new Date(publishedAt);
          const today = new Date();
          let yearsAgo = today.getFullYear() - videoDate.getFullYear();
          const m = today.getMonth() - videoDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < videoDate.getDate())) {
            yearsAgo--;
          }
          const formattedDate = videoDate.toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
          const yearText = (yearsAgo <= 1) ? "an" : "ans";
          videoDateElem.textContent = `Publié le ${formattedDate} (il y a ${yearsAgo} ${yearText})`;
        }
        videoInfoBox.classList.remove('hidden');
      }
    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      alert('Erreur: Impossible de charger une vidéo.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span data-key="button">NOUVELLE VIDÉO</span>`;
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
    historyItem.className = 'history-item p-2 rounded-md flex items-center gap-3';
    historyItem.innerHTML = `<img src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="Miniature de ${video.title}"><span>${video.title}</span>`;
    historyContainer.prepend(historyItem);
  }
});
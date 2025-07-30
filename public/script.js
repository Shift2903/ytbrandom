// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js chargé');

  const btn = document.getElementById('btn');
  const player = document.getElementById('player');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const videoInfoBox = document.getElementById('videoInfo');
  const videoTitleElem = document.getElementById('videoTitle');
  const videoDateElem = document.getElementById('videoDate');
  const historyContainer = document.getElementById('historyContainer');
  const historyPlaceholder = document.getElementById('historyPlaceholder');
  const categoryLinks = document.querySelectorAll('.category-link');
  
  let currentCategory = 'all'; 

  function updateButtonText() {
    const buttonTextSpan = document.querySelector('#btn > span');
    if (!buttonTextSpan) return;
    const key = (currentCategory === 'music') ? 'buttonMusic' : 'button';
    buttonTextSpan.dataset.key = key;
    const currentLang = localStorage.getItem('lang') || 'fr';
    document.querySelector(`.lang-flag[data-lang="${currentLang}"]`)?.click();
  }

  function setCategory(category, fromHistory = false) {
    currentCategory = category;
    console.log(`Catégorie définie sur : ${currentCategory}`);
    categoryLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.category-link[data-category="${category}"]`).classList.add('active');
    updateButtonText();
    if (!fromHistory) {
      const newUrl = (category === 'music') ? '/music' : (category === 'video') ? '/video' : '/';
      const newTitle = `YTB Random - ${category}`;
      history.pushState({ category: category }, newTitle, newUrl);
    }
  }

  categoryLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault(); 
      const category = link.dataset.category;
      setCategory(category);
    });
  });

  const initialPath = window.location.pathname;
  if (initialPath === '/music') {
    setCategory('music', true);
  } else if (initialPath === '/video') {
    setCategory('video', true);
  } else {
    setCategory('all', true);
  }

  btn.addEventListener('click', async () => {
    console.log(`🔘 Bouton cliqué, j’appelle /random-video pour la catégorie : ${currentCategory}`);
    try {
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner"></div>`;
      const resp = await fetch(`/random-video?category=${currentCategory}`);
      if (!resp.ok) throw new Error(`Erreur serveur ${resp.status}`);
      
      const { id, title, publishedAt } = await resp.json();
      
      window.currentVideoId = id;
      if (welcomeMessage) welcomeMessage.style.display = 'none';
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
          const formattedDate = videoDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
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
      const defaultText = (currentCategory === 'music') ? 'NOUVELLE MUSIQUE' : 'NOUVELLE VIDÉO';
      const dataKey = (currentCategory === 'music') ? 'buttonMusic' : 'button';
      btn.innerHTML = `<span data-key="${dataKey}">${defaultText}</span>`;
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
    historyItem.innerHTML = `<img src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="Miniature de ${video.title}"><span>${video.title}</span>`;
    historyContainer.prepend(historyItem);
  }
});
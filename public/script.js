document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js pour le design minimaliste chargé');

  // --- SÉLECTION DES ÉLÉMENTS ---
  const btn = document.getElementById('btn');
  const adLinkBtn = document.getElementById('adLinkBtn'); // ✅ Nouveau bouton
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

  // --- LOGIQUE DU THÈME ---
  themeSwitcher.addEventListener('click', () => {
    docHtml.classList.toggle('dark');
    localStorage.setItem('theme', docHtml.classList.contains('dark') ? 'dark' : 'light');
  });

  if (localStorage.getItem('theme') === 'dark') {
    docHtml.classList.add('dark');
  }

  // --- LOGIQUE DE L'APPLICATION ---
  function setCategory(category, fromHistory = false) {
    currentCategory = category;
    categoryLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.category-link[data-category="${category}"]`).classList.add('active');
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

  // ✅ LOGIQUE POUR LE BOUTON PARTAGER/PUB
  if (adLinkBtn) {
    adLinkBtn.addEventListener('click', () => {
      const directLinkUrl = 'https://doorwaydistinct.com/jcw2vz016?key=2ff14b592c85850b82fe3d09160c215e';
      window.open(directLinkUrl, '_blank');
    });
  }

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
        const videoDate = new Date(publishedAt);
        const today = new Date();
        let yearsAgo = today.getFullYear() - videoDate.getFullYear();
        const m = today.getMonth() - videoDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < videoDate.getDate())) yearsAgo--;
        
        const formattedDate = videoDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
        const yearText = (yearsAgo <= 1) ? "an" : "ans";
        videoDateElem.textContent = `Publié le ${formattedDate} (il y a ${yearsAgo} ${yearText})`;
      }
      videoInfoBox.classList.remove('hidden');

    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      alert('Erreur: Impossible de charger une vidéo.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span data-key="button">NOUVELLE VIDÉO</span>`;
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
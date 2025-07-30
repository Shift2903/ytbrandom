document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js chargé');

  const btnDesktop = document.getElementById('btn-desktop');
  const btnMobile = document.getElementById('btn-mobile');
  const allBtns = [btnDesktop, btnMobile];

  const player = document.getElementById('player');
  const welcomeMessage = document.getElementById('welcomeMessage');
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

  if (localStorage.getItem('theme') === 'dark') {
    docHtml.classList.add('dark');
  } else {
    docHtml.classList.remove('dark');
  }

  // --- LOGIQUE DE GESTION DES CATÉGORIES ET DE L'APPLICATION ---
  
  function updateButtonText() {
    const buttonTextSpanDesktop = document.querySelector('#btn-desktop > span');
    if (buttonTextSpanDesktop) {
        const key = (currentCategory === 'music') ? 'buttonMusic' : 'button';
        buttonTextSpanDesktop.dataset.key = key;
    }
    const currentLang = localStorage.getItem('lang') || 'fr';
    // Le ? est une sécurité si le drapeau n'est pas trouvé
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
  if (initialPath.includes('/music')) {
    setCategory('music', true);
  } else if (initialPath.includes('/video')) {
    setCategory('video', true);
  } else {
    setCategory('all', true);
  }

  allBtns.forEach(btn => {
    if (!btn) return;

    btn.addEventListener('click', async () => {
      console.log(`🔘 Bouton cliqué (${btn.id}), catégorie : ${currentCategory}`);
      try {
        allBtns.forEach(b => {
          if (b) {
            b.disabled = true;
            b.innerHTML = `<div class="spinner"></div>`;
          }
        });

        const resp = await fetch(`/random-video?category=${currentCategory}`);
        if (!resp.ok) throw new Error(`Erreur serveur ${resp.status}`);
        
        const { id, title, publishedAt } = await resp.json();
        
        window.currentVideoId = id;
        if (welcomeMessage) welcomeMessage.style.display = 'none';
        
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
        
        // ✅ CORRECTION : L'historique est mis à jour SEULEMENT si tout a réussi
        updateHistory({ id, title });

      } catch (e) {
        console.error('🔥 Erreur côté client :', e);
        alert('Erreur: Impossible de charger une vidéo.');
      } finally {
        if (btnDesktop) {
          btnDesktop.disabled = false;
          const defaultText = (currentCategory === 'music') ? 'NOUVELLE MUSIQUE' : 'NOUVELLE VIDÉO';
          const dataKey = (currentCategory === 'music') ? 'buttonMusic' : 'button';
          btnDesktop.innerHTML = `<span data-key="${dataKey}">${defaultText}</span>`;
        }
        if (btnMobile) {
          btnMobile.disabled = false;
          btnMobile.innerHTML = `<span>▶</span>`;
        }
        
        const currentLang = localStorage.getItem('lang') || 'fr';
        document.querySelector(`.lang-flag[data-lang="${currentLang}"]`)?.click();
      }
    });
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
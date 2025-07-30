document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js final chargé (avec traduction)');

  // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
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
  const langFlags = document.querySelectorAll('.lang-flag');
  
  let currentCategory = 'all';
  let translations = {}; // Pour stocker les traductions chargées

  // --- LOGIQUE DU THÈME ---
  themeSwitcher.addEventListener('click', () => {
    docHtml.classList.toggle('dark');
    localStorage.setItem('theme', docHtml.classList.contains('dark') ? 'dark' : 'light');
  });

  if (localStorage.getItem('theme') === 'dark') {
    docHtml.classList.add('dark');
  }

  // --- LOGIQUE DE TRADUCTION (INTÉGRÉE DEPUIS lang.js) ---
  function applyTranslations() {
    document.querySelectorAll('[data-key]').forEach(el => {
      const key = el.dataset.key;
      if (translations[key]) {
        el.textContent = translations[key];
      }
    });
  }

  async function setLanguage(lang) {
    try {
      const res = await fetch(`/lang/${lang}.json`);
      translations = await res.json();
      applyTranslations();
      localStorage.setItem('lang', lang);
      langFlags.forEach(f => f.classList.remove('active'));
      document.querySelector(`.lang-flag[data-lang="${lang}"]`)?.classList.add('active');
    } catch (e) {
      console.error("Erreur de traduction :", e);
    }
  }

  langFlags.forEach(flag => {
    flag.addEventListener('click', () => setLanguage(flag.dataset.lang));
  });

  // --- LOGIQUE DE L'APPLICATION ---
  function updateButtonText() {
    const buttonTextSpan = document.querySelector('#btn > span');
    if (!buttonTextSpan) return;
    const key = (currentCategory === 'music') ? 'buttonMusic' : 'button';
    buttonTextSpan.dataset.key = key;
    applyTranslations(); // On applique directement les traductions
  }

  function setCategory(category, fromHistory = false) {
    currentCategory = category;
    categoryLinks.forEach(l => l.classList.remove('active'));
    document.querySelector(`.category-link[data-category="${category}"]`).classList.add('active');
    updateButtonText();
    if (!fromHistory) {
      const newUrl = (category === 'music') ? '/music' : (category === 'video') ? '/video' : '/';
      history.pushState({ category }, `YTB Random - ${category}`, newUrl);
    }
  }

  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); setCategory(link.dataset.category); });
  });
  
  // Initialisation de la page
  async function initializePage() {
    const savedLang = localStorage.getItem('lang') || 'fr';
    await setLanguage(savedLang); // On charge la langue AVANT de définir la catégorie
    
    const initialPath = window.location.pathname;
    if (initialPath.includes('/music')) setCategory('music', true);
    else if (initialPath.includes('/video')) setCategory('video', true);
    else setCategory('all', true);
  }
  
  initializePage();

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
        // ... (logique de la date identique) ...
      }
      videoInfoBox.classList.remove('hidden');

    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      alert('Erreur: Impossible de charger une vidéo.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span data-key=""></span>`; // On crée un span vide
      updateButtonText(); // La fonction s'occupe de tout
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
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js final (avec anim et partage) chargé');

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
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  const twitterBtn = document.getElementById('twitter-share-btn');
  const facebookBtn = document.getElementById('facebook-share-btn');
  const copyLinkBtn = document.getElementById('copy-link-btn');
  
  let currentCategory = 'all';
  let translations = {};
  let toastTimeout;

  themeSwitcher.addEventListener('click', () => {
    docHtml.classList.toggle('dark');
    localStorage.setItem('theme', docHtml.classList.contains('dark') ? 'dark' : 'light');
  });

  if (localStorage.getItem('theme') === 'dark') {
    docHtml.classList.add('dark');
  }

  function showToast(message, isSuccess = true) {
    clearTimeout(toastTimeout);
    toastMessage.textContent = message;
    toast.className = toast.className.replace(/bg-\w+-\d+/, isSuccess ? 'bg-green-500' : 'bg-red-500');
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0');
    }, 3000);
  }

  function applyTranslations() {
    document.querySelectorAll('[data-key]').forEach(el => {
      const key = el.dataset.key;
      if (translations[key]) el.textContent = translations[key];
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
    } catch (e) { console.error("Erreur de traduction :", e); }
  }

  langFlags.forEach(flag => {
    flag.addEventListener('click', () => setLanguage(flag.dataset.lang));
  });

  function updateButtonText() {
    const buttonTextSpan = document.querySelector('#btn > span');
    if (!buttonTextSpan) return;
    const key = (currentCategory === 'music') ? 'buttonMusic' : 'button';
    buttonTextSpan.dataset.key = key;
    applyTranslations();
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
  
  async function initializePage() {
    let initialLang = localStorage.getItem('lang');
    if (!initialLang) {
      const browserLang = navigator.language.split('-')[0];
      const supportedLangs = ['fr', 'en', 'es', 'de'];
      initialLang = supportedLangs.includes(browserLang) ? browserLang : 'fr';
    }
    await setLanguage(initialLang);
    
    const initialPath = window.location.pathname;
    if (initialPath.includes('/music')) setCategory('music', true);
    else if (initialPath.includes('/video')) setCategory('video', true);
    else setCategory('all', true);
  }
  
  initializePage();

  function updateShareLinks() {
    if (!window.currentVideoId) return;
    const videoUrl = encodeURIComponent(`https://www.youtube.com/watch?v=${window.currentVideoId}`);
    const shareText = encodeURIComponent(window.currentVideoTitle);
    if (twitterBtn) twitterBtn.href = `https://twitter.com/intent/tweet?url=${videoUrl}&text=${shareText}`;
    if (facebookBtn) facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${videoUrl}`;
  }
  
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
      const directLinkUrl = 'https://doorwaydistinct.com/jcw2vz016?key=2ff14b592c85850b82fe3d09160c215e';
      const videoUrl = `https://www.youtube.com/watch?v=${window.currentVideoId}`;
      window.open(directLinkUrl, '_blank');
      navigator.clipboard.writeText(videoUrl).then(() => {
        showToast("Lien YouTube copié !");
      });
    });
  }
  
  historyContainer.addEventListener('click', (event) => {
    const copyBtn = event.target.closest('.copy-history-btn');
    if (copyBtn) {
      event.preventDefault();
      const videoId = copyBtn.dataset.id;
      const directLinkUrl = 'https://doorwaydistinct.com/jcw2vz016?key=2ff14b592c85850b82fe3d09160c215e';
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      window.open(directLinkUrl, '_blank');
      navigator.clipboard.writeText(videoUrl).then(() => {
        showToast("Lien YouTube copié !");
      });
    }
  });

  btn.addEventListener('click', async () => {
    try {
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner"></div>`;
      const resp = await fetch(`/random-video?category=${currentCategory}`);
      if (!resp.ok) throw new Error(`Erreur serveur ${resp.status}`);
      const { id, title, publishedAt } = await resp.json();
      
      window.currentVideoId = id;
      window.currentVideoTitle = title;
      
      updateHistory({ id, title });
      updateShareLinks();
      
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
      
      videoInfoBox.classList.remove('hidden', 'fade-in');
      void videoInfoBox.offsetWidth;
      videoInfoBox.classList.add('fade-in');

    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      showToast("Erreur: Impossible de charger une vidéo.", false);
    } finally {
      btn.disabled = false;
      const defaultText = (currentCategory === 'music') ? 'NOUVELLE MUSIQUE' : 'NOUVELLE VIDÉO';
      const dataKey = (currentCategory === 'music') ? 'buttonMusic' : 'button';
      btn.innerHTML = `<span data-key="${dataKey}">${defaultText}</span>`;
      applyTranslations();
    }
  });

  function updateHistory(video) {
    if (historyPlaceholder) historyPlaceholder.style.display = 'none';
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item p-2 rounded-md flex items-center gap-3 fade-in';
    historyItem.innerHTML = `
      <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" rel="noopener noreferrer">
        <img src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="">
      </a>
      <span class="flex-grow">${video.title}</span>
      <button class="copy-history-btn" data-id="${video.id}" data-key="copyButton">Copier</button>
    `;
    historyContainer.prepend(historyItem);
    applyTranslations();
  }
  
  initializePage();
});
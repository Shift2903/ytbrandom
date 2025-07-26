document.addEventListener('DOMContentLoaded', () => {
  const flags = document.querySelectorAll('.lang-flag');
  const elements = document.querySelectorAll('[data-key]');
  
  flags.forEach(flag => {
    flag.addEventListener('click', async () => {
      const lang = flag.dataset.lang;
      try {
        const res = await fetch(`/lang/${lang}.json`);
        const data = await res.json();
        elements.forEach(el => {
          const key = el.dataset.key;
          if (data[key]) el.textContent = data[key];
        });

        // Mémorise la langue dans le localStorage
        localStorage.setItem('lang', lang);

        // Met à jour l'état visuel des drapeaux
        flags.forEach(f => f.classList.remove('active'));
        flag.classList.add('active');
      } catch (e) {
        console.error("Erreur de traduction :", e);
      }
    });
  });

  // Applique automatiquement la langue sauvegardée
  const savedLang = localStorage.getItem('lang');
  if (savedLang) {
    document.querySelector(`.lang-flag[data-lang="${savedLang}"]`)?.click();
  }
});

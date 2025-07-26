// public/script.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js chargé');

  const btn            = document.getElementById('btn');
  const player         = document.getElementById('player');
  const welcomeMessage = document.getElementById('welcomeMessage');
  const videoInfoBox   = document.getElementById('videoInfo');
  const videoTitleElem = document.getElementById('videoTitle');

  console.log('Bouton trouvé ?', btn);

  btn.addEventListener('click', async () => {
    console.log('🔘 Bouton cliqué, j’appelle /random-video');
    try {
      // Afficher le spinner directement dans le bouton
      btn.disabled = true;
      btn.innerHTML = `<div class="spinner"></div>`;

      const resp = await fetch('/random-video');
      console.log('✅ fetch ok, status =', resp.status);
      if (!resp.ok) throw new Error(`Serveur ${resp.status}`);

      const { id, title } = await resp.json();
      console.log('📥 JSON reçu', id, title);

      // Cacher le message de bienvenue si présent
      if (welcomeMessage) welcomeMessage.style.display = 'none';

      // Injecter l'iframe
      player.innerHTML = `
        <iframe
          width="100%" height="100%"
          src="https://www.youtube.com/embed/${id}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      `;

      // Mettre à jour et afficher la boîte d’info
      if (videoTitleElem) {
        videoTitleElem.textContent = title;
        videoInfoBox.classList.remove('hidden');
      }

    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      alert('Erreur Serveur : Impossible de contacter le serveur.');
    } finally {
      // Restaure le bouton
      btn.disabled = false;
      btn.innerHTML = `<span data-key="button">NOUVELLE VIDÉO</span>`;
    }
  });
});

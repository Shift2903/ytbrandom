document.addEventListener('DOMContentLoaded', () => {
  console.log('✨ script.js chargé');
  const btn     = document.getElementById('btn');
  const titleEl = document.getElementById('videotitle');
  const player  = document.getElementById('player');

  console.log('Bouton trouvé ?', btn);
  btn.addEventListener('click', async () => {
    console.log('🔘 Bouton cliqué, j’appelle /random-video');
    try {
      const resp = await fetch('/random-video');
      console.log('✅ fetch ok, status =', resp.status);
      if (!resp.ok) throw new Error(`Serveur ${resp.status}`);
      const { id, title } = await resp.json();
      console.log('📥 JSON reçu', id, title);

      // Met à jour la page
      titleEl.textContent = title;
      player.innerHTML = `
        <iframe
          width="560" height="315"
          src="https://www.youtube.com/embed/${id}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      `;
    } catch (e) {
      console.error('🔥 Erreur côté client :', e);
      alert('Erreur Serveur : Impossible de contacter le serveur.');
    }
  });
});

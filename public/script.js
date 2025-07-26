document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn');
  const titleEl = document.getElementById('videotitle');
  const playerEl = document.getElementById('player');

  btn.addEventListener('click', async () => {
    try {
      const resp = await fetch('/random-video');
      if (!resp.ok) throw new Error(`Serveur ${resp.status}`);
      const { id, title } = await resp.json();

      titleEl.textContent = title;
      playerEl.innerHTML = `
        <iframe
          width="560" height="315"
          src="https://www.youtube.com/embed/${id}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      `;
    } catch (e) {
      console.error('Erreur côté client :', e);
      alert('Erreur serveur : ' + e.message);
    }
  });
});

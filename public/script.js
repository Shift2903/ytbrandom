document.getElementById('btn').addEventListener('click', async () => {
  try {
    const resp = await fetch('/random-video');
    if (!resp.ok) throw new Error(`Serveur ${resp.status}`);
    const { id, title } = await resp.json();
    document.getElementById('videotitle').textContent = title;
    document.getElementById('player').innerHTML = 
      `<iframe width="560" height="315"
        src="https://www.youtube.com/embed/${id}"
        frameborder="0"
        allowfullscreen></iframe>`;
  } catch (e) {
    console.error(e);
    alert('Erreur serveur : ' + e.message);
  }
});

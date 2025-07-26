// server.js
import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;
const KEY  = process.env.YOUTUBE_API_KEY;

if (!KEY) {
  console.error('🛑 La variable YOUTUBE_API_KEY n’est pas définie.');
  process.exit(1);
}

// Servir le dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Route de debug
app.get('/hello', (req, res) => res.send('👋 Bonjour !'));

// Route principale
app.get('/random-video', async (req, res) => {
  try {
    // 1) Lettre aléatoire
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const letter  = letters[Math.floor(Math.random() * letters.length)];

    // 2) Requête à l’API YouTube Data v3
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part',       'snippet');
    url.searchParams.set('type',       'video');
    url.searchParams.set('q',          letter);
    url.searchParams.set('maxResults', '25');
    url.searchParams.set('key',        KEY);

    const apiRes = await fetch(url);
    if (!apiRes.ok) {
      const body = await apiRes.text();
      console.error(`🔴 YouTube API erreur ${apiRes.status} :`, body);
      throw new Error(`YouTube API en erreur (${apiRes.status})`);
    }
    const data = await apiRes.json();

    // 3) Vérifier qu’il y a bien des vidéos
    const videos = data.items || [];
    if (!videos.length) {
      console.error('🔴 Pas de vidéos pour la lettre', letter, data);
      throw new Error('Pas de vidéo reçue');
    }

    // 4) Choisir une vidéo au hasard et renvoyer id + titre
    const video = videos[Math.floor(Math.random() * videos.length)];
    res.json({ id: video.id.videoId, title: video.snippet.title });

  } catch (err) {
    console.error('💥 Erreur dans /random-video :', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

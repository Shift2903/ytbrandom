// server.js (Version Stable)
import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.YOUTUBE_API_KEY;

// Sert les fichiers statiques du dossier "public"
app.use(express.static('public'));

app.get('/random-video', async (req, res) => {
  console.log("Appel pour une vidéo populaire de musique.");
  
  // URL simple et fiable pour obtenir les 50 vidéos musicales les plus populaires
  const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=FR&maxResults=50&videoCategoryId=10&key=${API_KEY}`;

  try {
    const searchResponse = await fetch(YOUTUBE_API_URL);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return res.status(404).json({ error: 'Aucune vidéo populaire trouvée' });
    }

    const randomIndex = Math.floor(Math.random() * searchData.items.length);
    const randomVideo = searchData.items[randomIndex];

    // Note: l'API /videos renvoie l'ID directement
    const videoId = randomVideo.id;
    const videoTitle = randomVideo.snippet.title;

    res.json({ id: videoId, title: videoTitle });

  } catch (error) {
    console.error('Erreur côté serveur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
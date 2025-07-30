// server.js (Version Finale avec Cache Horodaté)
import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.YOUTUBE_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ NOUVELLE STRUCTURE POUR LE CACHE : on stocke les vidéos ET la date de la pioche
const cache = {
  music: { videos: [], timestamp: null },
  video: { videos: [], timestamp: null },
  all:   { videos: [], timestamp: null }
};

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 heure en millisecondes

app.use(express.static(path.join(__dirname, 'public')));

function getRandomDate() {
  const start = new Date(2008, 0, 1).getTime();
  const end = new Date().getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString();
}

async function fetchNewVideoBatch(category) {
  console.log(`Cache pour '${category}' expiré ou vide. Appel à l'API YouTube...`);
  const baseParams = new URLSearchParams({
    part: 'snippet',
    maxResults: 15,
    type: 'video',
    key: API_KEY,
  });

  if (category === 'music') {
    baseParams.set('q', '"Official Audio" | "Topic"');
    baseParams.set('videoCategoryId', '10');
    baseParams.set('order', 'relevance');
  } else if (category === 'video') {
    const randomQuery = 'clip | short film | animation | live performance';
    const videoCategoryIds = '1,10,24';
    baseParams.set('q', randomQuery);
    baseParams.set('videoCategoryId', videoCategoryIds.split(',')[Math.floor(Math.random() * 3)]);
    baseParams.set('order', 'viewCount');
  } else { // Catégorie 'all'
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomQuery = '';
    for (let i = 0; i < 2; i++) {
      randomQuery += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    baseParams.set('q', randomQuery);
    baseParams.set('publishedBefore', getRandomDate());
    baseParams.set('order', 'date'); 
  }
  
  const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?${baseParams.toString()}`;
  const response = await fetch(YOUTUBE_API_URL);
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Erreur API:", errorBody);
    throw new Error(`Erreur de l'API YouTube (${response.status})`);
  }
  const data = await response.json();
  return data.items || [];
}

app.get('/random-video', async (req, res) => {
  const category = req.query.category || 'all';
  const now = Date.now(); // On récupère l'heure actuelle
  const categoryCache = cache[category]; // On sélectionne le bon cache

  try {
    // ✅ NOUVELLE VÉRIFICATION : le cache est-il vide OU a-t-il plus d'une heure ?
    if (categoryCache.videos.length === 0 || (now - categoryCache.timestamp > CACHE_DURATION_MS)) {
      categoryCache.videos = await fetchNewVideoBatch(category);
      categoryCache.timestamp = now; // On met à jour l'heure de la pioche
    }

    const video = categoryCache.videos.pop();

    if (!video) {
      // Si le cache est vide même après l'appel, c'est que l'API n'a rien renvoyé
      return res.status(404).json({ error: 'Aucune vidéo trouvée, essayez à nouveau.' });
    }
    
    const videoData = {
      id: video.id.videoId,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt
    };

    res.json(videoData);

  } catch (error) {
    console.error('Erreur dans /random-video:', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
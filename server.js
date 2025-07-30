// server.js (Version Finale avec Cache, Hasard Amélioré et Date de Publication)
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

let musicVideoCache = [];
let videoVideoCache = [];
let allVideoCache = [];

app.use(express.static(path.join(__dirname, 'public')));

function getRandomDate() {
  const start = new Date(2008, 0, 1).getTime();
  const end = new Date().getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString();
}

async function fetchNewVideoBatch(category) {
  console.log(`Cache pour '${category}' vide. Appel à l'API YouTube...`);

  const baseParams = new URLSearchParams({
    part: 'snippet',
    maxResults: 50,
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
    baseParams.set('order', 'relevance'); 
  }
  
  const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?${baseParams.toString()}`;
  console.log("Appel API:", YOUTUBE_API_URL);
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
  try {
    let video;
    let cache;

    if (category === 'music') cache = musicVideoCache;
    else if (category === 'video') cache = videoVideoCache;
    else cache = allVideoCache;

    if (cache.length === 0) {
      const newBatch = await fetchNewVideoBatch(category);
      if (category === 'music') musicVideoCache.push(...newBatch);
      else if (category === 'video') videoVideoCache.push(...newBatch);
      else allVideoCache.push(...newBatch);
    }
    
    if (category === 'music') cache = musicVideoCache;
    else if (category === 'video') cache = videoVideoCache;
    else cache = allVideoCache;

    video = cache.pop();

    if (!video) {
      return res.status(404).json({ error: 'Aucune vidéo trouvée, essayez à nouveau.' });
    }
    
    // On envoie maintenant un objet complet avec la date
    const videoData = {
      id: video.id.videoId,
      title: video.snippet.title,
      publishedAt: video.snippet.publishedAt // Ajout de la date
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
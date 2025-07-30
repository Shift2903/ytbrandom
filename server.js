// server.js (Version doublement corrigée)
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
let allVideoCache = [];

app.use(express.static(path.join(__dirname, 'public')));

async function fetchNewVideoBatch(category) {
  console.log(`Cache pour '${category}' vide. Appel à l'API YouTube...`);
  const baseParams = new URLSearchParams({
    part: 'snippet',
    maxResults: 50,
    type: 'video',
    key: API_KEY,
  });

  if (category === 'music') {
    baseParams.set('q', '"Official Audio" | "Official Music Video" | "Topic"');
    baseParams.set('videoCategoryId', '10');
    baseParams.set('order', 'relevance');
  } else {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomQuery = '';
    for (let i = 0; i < 2; i++) {
      randomQuery += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    baseParams.set('q', randomQuery);
    // ✅ CORRECTION N°1 : Remplacement de 'base' par 'baseParams'
    baseParams.set('regionCode', 'FR');
  }
  
  // ✅ CORRECTION N°2 : Utilisation des backticks `` au lieu des apostrophes ''
  const YOUTUBE_API_URL = `https://www.googleapis.com/youtube/v3/search?${baseParams.toString()}`;
  
  console.log("Appel API:", YOUTUBE_API_URL);
  const response = await fetch(YOUTUBE_API_URL);
  if (!response.ok) {
    throw new Error(`Erreur de l'API YouTube (${response.status})`);
  }
  const data = await response.json();
  return data.items || [];
}

app.get('/random-video', async (req, res) => {
  const category = req.query.category || 'all';
  try {
    let video;
    if (category === 'music') {
      if (musicVideoCache.length === 0) {
        musicVideoCache = await fetchNewVideoBatch('music');
      }
      video = musicVideoCache.pop();
    } else {
      if (allVideoCache.length === 0) {
        allVideoCache = await fetchNewVideoBatch('all');
      }
      video = allVideoCache.pop();
    }
    if (!video) {
      return res.status(404).json({ error: 'Aucune vidéo trouvée, essayez à nouveau.' });
    }
    res.json({ id: video.id.videoId, title: video.snippet.title });
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
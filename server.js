// server.js
import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.YOUTUBE_API_KEY;

// Sert les fichiers statiques du dossier "public"
app.use(express.static('public'));

/**
 * Génère une chaîne de caractères aléatoire pour une recherche
 * afin de simuler la découverte d'une vidéo au hasard.
 */
function generateRandomSearchQuery() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 2; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.get('/random-video', async (req, res) => {
  const category = req.query.category || 'all'; 
  console.log(`Recherche demandée pour la catégorie : ${category}`);

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
    baseParams.set('q', generateRandomSearchQuery());
    base.set('regionCode', 'FR');
  }
  
  // ✅ LA CORRECTION EST ICI : Utilisation des backticks `` au lieu des apostrophes ''
  const YOUTUBE_API_URL = `youtube.com/watch?v={baseParams.toString()}`;
  
  console.log("Appel à l'API YouTube :", YOUTUBE_API_URL);

  try {
    const searchResponse = await fetch(YOUTUBE_API_URL);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.warn("Aucune vidéo trouvée pour cette recherche.");
      return res.status(404).json({ error: 'Aucune vidéo trouvée pour cette recherche.' });
    }

    const randomIndex = Math.floor(Math.random() * searchData.items.length);
    const randomVideo = searchData.items[randomIndex];

    const videoId = randomVideo.id.videoId;
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
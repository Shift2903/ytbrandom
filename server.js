// server.js (Version Finale avec Cache d'optimisation)
import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.YOUTUBE_API_KEY;

// Nos "paquets de cartes" (caches) pour stocker les listes de vidéos
let musicVideoCache = [];
let allVideoCache = [];

// Sert les fichiers statiques du dossier "public"
app.use(express.static('public'));

/**
 * Fonction pour aller chercher un nouveau paquet de 50 vidéos sur YouTube
 * @param {string} category - La catégorie 'music' ou 'all'
 * @returns {Promise<Array>} - Une liste de vidéos
 */
async function fetchNewVideoBatch(category) {
  console.log(`Le cache pour la catégorie '${category}' est vide. Appel à l'API YouTube...`);

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
    // Pour "all", on génère un mot de recherche aléatoire
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomQuery = '';
    for (let i = 0; i < 2; i++) {
      randomQuery += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    baseParams.set('q', randomQuery);
    baseParams.set('regionCode', 'FR');
  }
  
  const YOUTUBE_API_URL = `youtube.com/watch?v={baseParams.toString()}`;
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
  console.log(`Demande de vidéo pour la catégorie : ${category}`);

  try {
    let video;
    
    if (category === 'music') {
      // Si le cache de musique est vide, on le remplit
      if (musicVideoCache.length === 0) {
        musicVideoCache = await fetchNewVideoBatch('music');
      }
      // On prend et retire la dernière vidéo du cache
      video = musicVideoCache.pop();
    } else { // Catégorie 'all'
      // Si le cache "all" est vide, on le remplit
      if (allVideoCache.length === 0) {
        allVideoCache = await fetchNewVideoBatch('all');
      }
      video = allVideoCache.pop();
    }

    if (!video) {
      console.warn("Le cache est vide et l'API n'a rien retourné.");
      return res.status(404).json({ error: 'Aucune vidéo trouvée, essayez à nouveau.' });
    }

    res.json({ id: video.id.videoId, title: video.snippet.title });

  } catch (error) {
    console.error('Erreur dans /random-video:', error.message);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
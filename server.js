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
  // On génère 2 caractères aléatoires. Assez pour avoir des milliers de résultats
  // mais assez précis pour éviter des recherches vides.
  for (let i = 0; i < 2; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}


app.get('/random-video', async (req, res) => {
  // On récupère la catégorie depuis la requête du client (ex: /random-video?category=music)
  const category = req.query.category || 'all'; 
  console.log(`Recherche demandée pour la catégorie : ${category}`);

  // Paramètres de base pour l'API Youtube
  const baseParams = new URLSearchParams({
    part: 'snippet',
    maxResults: 50, // On prend 50 résultats pour avoir du choix
    type: 'video',
    key: API_KEY,
  });

  // --- LOGIQUE DE RECHERCHE INTELLIGENTE ---
  if (category === 'music') {
    // Si la catégorie est "musique", on affine la recherche
    baseParams.set('q', '"Official Audio" | "Official Music Video" | "Topic"');
    baseParams.set('videoCategoryId', '10'); // ID YouTube pour la catégorie Musique
    baseParams.set('order', 'relevance'); // On trie par pertinence par rapport à notre recherche
  } else {
    // Pour toutes les autres catégories ("all"), on fait une recherche aléatoire
    baseParams.set('q', generateRandomSearchQuery());
    baseParams.set('regionCode', 'FR'); // On peut cibler une région pour la recherche générale
  }
  
  const YOUTUBE_API_URL = `youtube.com/watch?v={baseParams.toString()}`;
  console.log("Appel à l'API YouTube :", YOUTUBE_API_URL);

  try {
    const searchResponse = await fetch(YOUTUBE_API_URL);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.warn("Aucune vidéo trouvée pour cette recherche.");
      return res.status(404).json({ error: 'Aucune vidéo trouvée pour cette recherche.' });
    }

    // Choisir une vidéo au hasard parmi les 50 résultats
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
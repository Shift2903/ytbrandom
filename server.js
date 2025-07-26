// server.js

const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
const YOUTUBE_API_KEY = 'AIzaSyDhkDLO9R4HW2B6D_9SKBE2aJxA9pmzcQQ';
const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY });

app.use(cors());
app.use(express.json());

// --- UTILITAIRE: tire une lettre aléatoire ---
function getRandomLetter() {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  return letters.charAt(Math.floor(Math.random() * letters.length));
}

// --- ROUTE: vidéo 100% aléatoire et valide ---
app.get('/api/random-video', async (req, res) => {
  try {
    let video;
    // Boucle jusqu'à trouver une vidéo valide
    do {
      const query = getRandomLetter();
      const response = await youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 1,
      });
      const items = response.data.items;
      if (items && items.length > 0) {
        const item = items[0];
        // Vérifie que l'ID et le snippet sont présents
        if (item.id && item.id.videoId && item.snippet) {
          video = {
            videoId: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.default.url,
          };
        }
      }
    } while (!video);

    return res.json(video);
  } catch (err) {
    console.error('Erreur API YouTube:', err.message);
    res.status(500).json({ message: 'Erreur lors de la requête YouTube.' });
  }
});

// --- LANCEMENT DU SERVEUR ---
app.listen(PORT, () => {
  console.log(`Serveur aléatoire démarré sur http://localhost:${PORT}`);
});

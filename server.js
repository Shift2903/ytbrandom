import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Route de debug simple
app.get('/hello', (req, res) => {
  res.send('👋 Bonjour !');
});

// Route principale pour récupérer une vidéo aléatoire
app.get('/random-video', async (req, res) => {
  try {
    // 1) Lettre aléatoire
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const letter = letters[Math.floor(Math.random() * letters.length)];

    // 2) Requête à l’API LemnosLife
    const apiRes = await fetch(`https://yt.lemnoslife.com/noKey/search?q=${letter}`);
    if (!apiRes.ok) {
      const body = await apiRes.text();
      console.error(`🔴 LemnosLife API erreur ${apiRes.status} :`, body);
      throw new Error(`API externe en erreur (${apiRes.status})`);
    }
    const data = await apiRes.json();

    // 3) Vérifier que data.items existe et contient des vidéos
    const videos = data.items || [];
    if (!videos.length) {
      console.error('🔴 Aucun item dans data.items pour la lettre', letter, data);
      throw new Error('Pas de vidéo reçue');
    }

    // 4) Choisir une vidéo au hasard et renvoyer id + titre
    const video = videos[Math.floor(Math.random() * videos.length)];
    res.json({ id: video.id.videoId, title: video.snippet.title });

  } catch (err) {
    console.error('💥 Erreur dans /random-video :', err.stack);
    // Ne renvoyez la stack qu’en debug ; en production, vous pouvez retirer stack
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

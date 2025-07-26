import express from 'express';
import fetch from 'node‑fetch';

const app = express();
app.use(express.static('public'));

app.get('/random-video', async (req, res) => {
  try {
    // 1. lettre aléatoire
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const letter = letters[Math.floor(Math.random()*letters.length)];
    
    // 2. requête à l’API LemnosLife
    const apiRes = await fetch(`https://yt.lemnoslife.com/noKey/search?q=${letter}`);
    if (!apiRes.ok) throw new Error('API externe en erreur');
    const data = await apiRes.json();
    
    // 3. choisir une vidéo
    const videos = data.items || [];
    if (!videos.length) throw new Error('Pas de vidéo reçue');
    const video = videos[Math.floor(Math.random()*videos.length)];
    
    // 4. renvoyer id + titre
    res.json({ id: video.id.videoId, title: video.snippet.title });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

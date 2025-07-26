const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Servir les fichiers statiques (HTML, CSS, JS) depuis le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Fonction pour obtenir une lettre au hasard
function getRandomLetter() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    return alphabet[Math.floor(Math.random() * alphabet.length)];
}

// Votre API pour trouver une vidéo aléatoire
app.get('/random-video', async (req, res) => {
    try {
        const randomLetter = getRandomLetter();
        const apiResponse = await fetch(`https://yt.lemnoslife.com/noKey/search?q=${randomLetter}`);
        
        if (!apiResponse.ok) {
            throw new Error(`Erreur de l'API externe`);
        }
        
        const data = await apiResponse.json();
        const videos = data.items;

        if (!videos || videos.length === 0) {
            return res.status(404).json({ message: 'Aucune vidéo trouvée.' });
        }

        const randomVideo = videos[Math.floor(Math.random() * videos.length)];

        res.json({
            id: randomVideo.id.videoId,
            title: randomVideo.snippet.title
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ message: 'Impossible de contacter le serveur de vidéos.' });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
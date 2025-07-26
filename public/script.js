document.addEventListener('DOMContentLoaded', () => {
    const randomVideoButton = document.getElementById('random-video-button');
    const videoFrame = document.getElementById('video-frame');
    const videoTitle = document.getElementById('video-title');
    const errorMessage = document.getElementById('error-message');

    errorMessage.style.display = 'none';

    randomVideoButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/random-video');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Le serveur a retourné une erreur.');
            }
            const video = await response.json();

            // Afficher la vidéo avec le bon lien YouTube
            videoFrame.src = `https://www.youtube.com/embed/${video.id}`;
            videoTitle.textContent = video.title;
            errorMessage.style.display = 'none';

        } catch (error) {
            console.error('Erreur:', error);
            errorMessage.textContent = `Erreur : ${error.message}`;
            errorMessage.style.display = 'block';
            videoFrame.src = '';
            videoTitle.textContent = '';
        }
    });
});
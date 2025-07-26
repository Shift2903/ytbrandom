// server.js
import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = process.env.YOUTUBE_API_KEY;

// Serve static files from the "public" directory
app.use(express.static('public'));

/**
 * Generates a random search query string to simulate
 * discovering a random video.
 */
function generateRandomSearchQuery() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  // A 2-character query is broad enough for many results but not empty.
  for (let i = 0; i < 2; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.get('/random-video', async (req, res) => {
  // Get the category from the client request (e.g., /random-video?category=music)
  const category = req.query.category || 'all'; 
  console.log(`Search requested for category: ${category}`);

  // Base parameters for the Youtube API
  const baseParams = new URLSearchParams({
    part: 'snippet',
    maxResults: 50, // Get 50 results to choose from
    type: 'video',
    key: API_KEY,
  });

  // --- SMART SEARCH LOGIC ---
  if (category === 'music') {
    // For the "music" category, refine the search
    baseParams.set('q', '"Official Audio" | "Official Music Video" | "Topic"');
    baseParams.set('videoCategoryId', '10'); // YouTube's ID for the Music category
    baseParams.set('order', 'relevance'); 
  } else {
    // For the "all" category, perform a random search
    baseParams.set('q', generateRandomSearchQuery());
    baseParams.set('regionCode', 'FR'); 
  }
  
  // ✅ CORRECTION IS HERE: Using backticks `` instead of single quotes ''
  const YOUTUBE_API_URL = `youtube.com/watch?v={baseParams.toString()}`;
  
  console.log("Calling YouTube API:", YOUTUBE_API_URL);

  try {
    const searchResponse = await fetch(YOUTUBE_API_URL);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.warn("No videos found for this search.");
      return res.status(404).json({ error: 'No videos found for this search.' });
    }

    // Pick a random video from the results
    const randomIndex = Math.floor(Math.random() * searchData.items.length);
    const randomVideo = searchData.items[randomIndex];

    const videoId = randomVideo.id.videoId;
    const videoTitle = randomVideo.snippet.title;

    res.json({ id: videoId, title: videoTitle });

  } catch (error) {
    console.error('Server-side error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
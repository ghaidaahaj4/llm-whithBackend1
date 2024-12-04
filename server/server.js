const dotenv = require("dotenv");
const cors = require("cors"); // Import the cors package
// Load environment variables from .env file
dotenv.config();
const express = require("express");
const fetch = require("node-fetch"); // Ensure node-fetch is installed
const app = express();
const port = 5002;
const apiKey = process.env.VITE_MEDIASTACK_API_KEY;
app.use(cors());
const cache = {}; // Use an object to store cache data

// Function to fetch news from the API
async function fetchNews(query) {
  const cacheKey = `${query}`;

  // Check if data is cached
  if (cache[cacheKey]) {
    console.log("Using cached news data");
    return cache[cacheKey];
  }

  // Construct the API URL
  const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

  // Fetch the news from the API
  const response = await fetch(url);
  const newsData = await response.json();

  console.log("API Response:", newsData);

  // Check if the response contains articles
  if (newsData.articles && newsData.articles.length > 0) {
    // Cache the fetched news articles with an expiration time (optional)
    cache[cacheKey] = newsData.articles; // Store in the cache object
    setTimeout(() => {
      delete cache[cacheKey]; // Cache expires after 10 minutes
    }, 600000); // Cache expires after 10 minutes
    return newsData.articles;
  } else {
    console.log("No articles found.");
    return [];
  }
}

// Serve the news articles on the '/NEWS' route
app.get("/NEWS", async (req, res) => {
  const query = req.query.q || "tesla"; // Default query is 'tesla'
  console.log(`Cache key: ${query}`);

  try {
    const newsArticles = await fetchNews(query);
    if (newsArticles.length > 0) {
      res.json(newsArticles);
    } else {
      res.status(404).json({ message: "No articles found." });
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve the root page (for testing purposes)
app.get("/", (req, res) => {
  res.send("<h1>Welcome to the News API Server</h1>");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

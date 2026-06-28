import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Parser from "rss-parser";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const parser = new Parser();

  app.use(cors());
  app.use(express.json());

  // AI News RSS Feeds
  const FEEDS = [
    "https://techcrunch.com/category/artificial-intelligence/feed/",
    "https://openai.com/news/rss.xml",
    "https://www.zdnet.com/topic/artificial-intelligence/rss.xml",
    "https://venturebeat.com/category/ai/feed/",
    "https://www.technologyreview.com/topic/artificial-intelligence/feed/"
  ];

  app.get("/api/news", async (req, res) => {
    try {
      const feedPromises = FEEDS.map(async (url) => {
        try {
          const feed = await parser.parseURL(url);
          return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            contentSnippet: item.contentSnippet,
            source: feed.title
          }));
        } catch (err) {
          console.error(`Error fetching feed ${url}:`, err);
          return [];
        }
      });

      const results = await Promise.all(feedPromises);
      const flattened = results.flat().sort((a, b) => {
        return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
      });

      // Deduplicate by title
      const unique = Array.from(new Map(flattened.map(item => [item.title, item])).values());

      res.json(unique.slice(0, 20));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

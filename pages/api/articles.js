import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const articlesDirectory = path.join(process.cwd(), 'data/articles');
    await fs.mkdir(articlesDirectory, { recursive: true });
    
    const files = await fs.readdir(articlesDirectory);
    const articles = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(articlesDirectory, file), 'utf8');
          return JSON.parse(content);
        })
    );

    // Sort by timestamp, newest first
    articles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Error fetching articles' });
  }
} 
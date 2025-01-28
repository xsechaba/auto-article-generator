import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const articlesDirectory = path.join(process.cwd(), 'data/articles');
    const files = await fs.readdir(articlesDirectory);
    
    const articles = await Promise.all(
      files
        .filter(file => file.endsWith('.json'))
        .map(async (file) => {
          const content = await fs.readFile(path.join(articlesDirectory, file), 'utf8');
          return JSON.parse(content);
        })
    );

    // Perform search across all article fields
    const searchResults = articles.filter(article => {
      const searchableText = [
        article.title,
        article.excerpt,
        article.content,
        ...article.keywords
      ].join(' ').toLowerCase();
      
      return searchableText.includes(q.toLowerCase());
    });

    // Sort by relevance (title/keyword matches first, then content matches)
    searchResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const aKeywords = a.keywords.join(' ').toLowerCase();
      const bKeywords = b.keywords.join(' ').toLowerCase();
      const query = q.toLowerCase();

      // Check title matches
      if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
      if (!aTitle.includes(query) && bTitle.includes(query)) return 1;

      // Check keyword matches
      if (aKeywords.includes(query) && !bKeywords.includes(query)) return -1;
      if (!aKeywords.includes(query) && bKeywords.includes(query)) return 1;

      // Default to newest first
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.status(200).json({
      results: searchResults,
      count: searchResults.length,
      query: q
    });
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ message: 'Error searching articles' });
  }
} 
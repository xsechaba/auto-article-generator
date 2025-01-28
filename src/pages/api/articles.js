import fs from 'fs/promises';
import path from 'path';

// Directory for storing articles
const ARTICLES_DIR = path.join(process.cwd(), 'data/articles');

export const config = {
    api: {
        bodyParser: true
    }
};

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const start = (page - 1) * limit;

            const files = await fs.readdir(ARTICLES_DIR);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            const articles = await Promise.all(
                jsonFiles.map(async (file) => {
                    const content = await fs.readFile(path.join(ARTICLES_DIR, file), 'utf-8');
                    return JSON.parse(content);
                })
            );

            // Sort articles by timestamp in descending order
            articles.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Get paginated articles
            const paginatedArticles = articles.slice(start, start + limit);

            res.status(200).json(paginatedArticles);
        } catch (error) {
            console.error('Error in API route:', error);
            res.status(500).json({ message: 'Error loading articles' });
        }
    } else if (req.method === 'POST') {
        try {
            const article = req.body;

            // Validate required fields
            if (!article.title || !article.content) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // Create a unique ID for the article
            const id = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
            
            // Ensure articles directory exists
            await fs.mkdir(ARTICLES_DIR, { recursive: true });

            // Prepare article data
            const articleData = {
                id,
                title: article.title,
                content: article.content,
                excerpt: article.excerpt,
                searchVolume: article.searchVolume,
                originalUrl: article.originalUrl,
                keywords: article.keywords || [],
                timestamp: article.timestamp || new Date().toISOString(),
                featuredImage: article.featuredImage || null
            };

            // Save article to file
            await fs.writeFile(
                path.join(ARTICLES_DIR, `${id}.json`),
                JSON.stringify(articleData, null, 2),
                'utf-8'
            );

            res.status(200).json({
                success: true,
                id,
                timestamp: articleData.timestamp
            });
        } catch (error) {
            console.error('Error saving article:', error);
            res.status(500).json({ message: error.message || 'Failed to save article' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
} 